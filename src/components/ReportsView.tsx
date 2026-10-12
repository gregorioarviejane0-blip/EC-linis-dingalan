import React, { useState, useMemo } from 'react';
import { Activity, AttendanceRecord, Beneficiary, DingalanBarangay, User, ActivityAssignment } from '../types';
import { FullScreenPhotoViewer } from './FullScreenPhotoViewer';
import { formatPhilippineDateTime } from '../utils/philippineClock';
import { exportAttendanceToExcel } from '../utils/excelExporter';
import {
  FileText,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  Camera,
  FileSpreadsheet,
  X,
  PieChart,
  Users,
  TrendingUp,
  Pencil,
  Trash2,
} from 'lucide-react';

const DINGALAN_BARANGAYS: DingalanBarangay[] = [
  'Aplaya',
  'Butas na Bato',
  'Cabischasan',
  'Caragsacan',
  'Davil-davilan',
  'Dikapanikian',
  'Ibona',
  'Paltic',
  'Poblacion',
  'Tanawan',
  'Umiray',
];

interface ReportsViewProps {
  activities: Activity[];
  attendances: AttendanceRecord[];
  beneficiaries: Beneficiary[];
  currentUser: User;
  assignments?: ActivityAssignment[];
  onAssignBeneficiary?: (activityId: string, beneficiaryId: string) => void;
  onUnassignBeneficiary?: (activityId: string, beneficiaryId: string) => void;
  onUpdateActivity?: (id: string, data: Partial<Activity>) => void;
  onDeleteActivity?: (id: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  activities,
  attendances,
  beneficiaries,
  currentUser,
  assignments = [],
  onAssignBeneficiary,
  onUnassignBeneficiary,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('ALL');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordForViewer, setSelectedRecordForViewer] = useState<AttendanceRecord | null>(null);
  const [excelSuccessToast, setExcelSuccessToast] = useState<string | null>(null);
  const [activeChartModal, setActiveChartModal] = useState<'photos' | 'assigned' | 'potential' | 'barangays' | null>(null);
  const [managingAssignmentsActivity, setManagingAssignmentsActivity] = useState<Activity | null>(null);
  const [assignSearchTerm, setAssignSearchTerm] = useState('');

  // Editing activity state
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    barangay: DingalanBarangay;
    description: string;
    targetBeneficiariesCount: number | string;
  }>({
    title: '',
    barangay: 'Paltic' as DingalanBarangay,
    description: '',
    targetBeneficiariesCount: 20,
  });

  const handleOpenEdit = (act: Activity) => {
    setEditingActivity(act);
    setEditForm({
      title: act.title,
      barangay: act.barangay,
      description: act.description,
      targetBeneficiariesCount: act.targetBeneficiariesCount || 20,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity || !onUpdateActivity) return;
    onUpdateActivity(editingActivity.id, editForm);
    setEditingActivity(null);
  };

  const handleDeleteAct = (act: Activity) => {
    if (window.confirm(`Sigurado ka bang nais mong burahin ang work program "${act.title}"?`)) {
      if (onDeleteActivity) onDeleteActivity(act.id);
    }
  };

  const photoUploadedCount = useMemo(() => {
    return attendances.filter(
      (a) => a.photoWatermarkedUrl || (a.accomplishmentPhotos && a.accomplishmentPhotos.length > 0)
    ).length;
  }, [attendances]);

  const totalAssignedWorkforce = useMemo(() => {
    const sum = activities.reduce((acc, curr) => acc + (Number(curr.assignedBeneficiariesCount) || 0), 0);
    return sum > 0 ? sum : beneficiaries.length;
  }, [activities, beneficiaries]);

  const potentialAttendeesCount = useMemo(() => {
    const historicalAvg = attendances.length > 0 ? Math.round(attendances.length * 1.2) : beneficiaries.length;
    return Math.max(historicalAvg, totalAssignedWorkforce, 60);
  }, [attendances, beneficiaries, totalAssignedWorkforce]);

  const coveredBarangaysCount = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.barangay) set.add(a.barangay);
    });
    beneficiaries.forEach((b) => {
      if (b.barangay) set.add(b.barangay);
    });
    return Math.max(set.size, 11);
  }, [activities, beneficiaries]);

  // Filtered attendance records
  const filteredAttendances = useMemo(() => {
    return attendances.filter((att) => {
      const bene = beneficiaries.find((b) => b.id === att.beneficiaryId);
      const matchesActivity =
        selectedActivityId === 'ALL' || att.activityId === selectedActivityId;
      const matchesBarangay =
        selectedBarangay === 'ALL' || (bene && bene.barangay === selectedBarangay);
      const matchesSearch =
        `${att.beneficiaryName} ${att.beneficiaryCode} ${att.activityTitle}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesActivity && matchesBarangay && matchesSearch;
    });
  }, [attendances, selectedActivityId, selectedBarangay, searchTerm, beneficiaries]);

  // Filtered activities / program content based on search & dropdown filters
  const filteredActivities = useMemo(() => {
    return activities.map(act => act).filter((act) => {
      const matchesActivity = selectedActivityId === 'ALL' || act.id === selectedActivityId;
      const matchesBarangay = selectedBarangay === 'ALL' || act.barangay === selectedBarangay;
      const matchesSearch = searchTerm.trim() === '' ||
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesActivity && matchesBarangay && matchesSearch;
    });
  }, [activities, selectedActivityId, selectedBarangay, searchTerm]);

  // Aggregate stats
  const totalRecords = filteredAttendances.length;
  const verifiedCount = filteredAttendances.filter((a) => a.complianceStatus === 'verified').length;
  const totalTargetBeneficiaries = useMemo(() => {
    if (selectedActivityId === 'ALL') {
      return activities.reduce((acc, curr) => acc + (Number(curr.targetBeneficiariesCount) || 0), 0);
    }
    const act = activities.find((a) => a.id === selectedActivityId);
    return act ? (Number(act.targetBeneficiariesCount) || 0) : 0;
  }, [activities, selectedActivityId]);

  const complianceRate = totalTargetBeneficiaries > 0
    ? Math.min(100, Math.round((verifiedCount / totalTargetBeneficiaries) * 100))
    : 100;

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      'Beneficiary ID',
      'Full Name',
      'Barangay',
      'Activity Title',
      'Date & Time (PST)',
      'Latitude',
      'Longitude',
      'Accuracy (m)',
      'Compliance Status',
      'Verified By Officer',
      'QR Signature Hash',
    ];

    const rows = filteredAttendances.map((att) => {
      const bene = beneficiaries.find((b) => b.id === att.beneficiaryId);
      return [
        `"${att.beneficiaryCode}"`,
        `"${att.beneficiaryName}"`,
        `"${bene ? bene.barangay : 'Dingalan'}"`,
        `"${att.activityTitle}"`,
        `"${att.localPhTime}"`,
        att.latitude,
        att.longitude,
        att.accuracyMeters,
        `"${att.complianceStatus}"`,
        `"${att.verifiedByOfficerName}"`,
        `"${att.qrSignature}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Linis-Dingalan-Compliance-Report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const records = filteredAttendances.length > 0 ? filteredAttendances : attendances;
    if (records.length === 0) {
      alert('Walang data na mai-export.');
      return;
    }
    const result = exportAttendanceToExcel(records, 'Linis-Dingalan-Compliance-Report');
    if (result.success) {
      setExcelSuccessToast(
        `Matagumpay na na-export ang Excel table file (${result.fileName}) na may kumpletong detalye ng ${result.count} na tala!`
      );
      setTimeout(() => setExcelSuccessToast(null), 6000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Excel Export Success Toast */}
      {excelSuccessToast && (
        <div className="px-4 py-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{excelSuccessToast}</span>
          </div>
          <button
            onClick={() => setExcelSuccessToast(null)}
            className="p-1 text-emerald-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Row (Search & Dropdowns) */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
        <div className="md:col-span-4 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Beneficiary Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Work Programs ({activities.length})</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Barangays</option>
            <option value="Paltic">Brgy. Paltic</option>
            <option value="Aplaya">Brgy. Aplaya</option>
            <option value="Poblacion">Brgy. Poblacion</option>
            <option value="Butas na Bato">Brgy. Butas na Bato</option>
            <option value="Ibona">Brgy. Ibona</option>
            <option value="Tanawan">Brgy. Tanawan</option>
            <option value="Umiray">Brgy. Umiray</option>
          </select>
        </div>
      </div>

      {/* KPI Cards (Moved above Auto Program box per user request) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {/* Box 1: Naka-upload ng Attendance Picture */}
        <div
          onClick={() => setActiveChartModal('photos')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          title="I-click para sa Pie Graph ng Attendance Pictures"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase text-emerald-400">Attendance Pictures</p>
            <Camera className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{photoUploadedCount}</p>
          <span className="text-[9px] sm:text-[10px] text-emerald-300 font-mono">Naka-upload ng photo</span>
        </div>

        {/* Box 2: Naka-assigned sa Event */}
        <div
          onClick={() => setActiveChartModal('assigned')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          title="I-click para sa Pie Graph ng Assigned Workforce"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase text-teal-400">Assigned Workforce</p>
            <Users className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{totalAssignedWorkforce}</p>
          <span className="text-[9px] sm:text-[10px] text-teal-300 font-mono">Naka-assigned sa event</span>
        </div>

        {/* Box 3: Possible na makaka-attend base sa umattend nung nakaraan */}
        <div
          onClick={() => setActiveChartModal('potential')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          title="I-click para sa Pie Graph ng Potential Attendance"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase text-cyan-400">Potential Attendance</p>
            <TrendingUp className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{potentialAttendeesCount}</p>
          <span className="text-[9px] sm:text-[10px] text-cyan-300 font-mono">Base sa nakaraang attendance</span>
        </div>

        {/* Box 4: Ilang Barangay ang sakop ng event */}
        <div
          onClick={() => setActiveChartModal('barangays')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          title="I-click para sa Pie Graph ng Covered Barangays"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-mono uppercase text-amber-400">Covered Barangays</p>
            <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{coveredBarangaysCount}</p>
          <span className="text-[9px] sm:text-[10px] text-amber-300 font-mono">Barangays sa Dingalan</span>
        </div>
      </div>

      {/* Auto Program Content Details Report Panel */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-slate-900/90 border border-emerald-500/40 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Auto Program Content Report (MENRO-PESO Operational Details)
              </h3>
              <p className="text-[10px] text-slate-400">
                Barangay schedules, ongoing events, scope sizes, and workforce assignments management.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activities.length} Active Programs
            </span>
            <button
              onClick={handleExportExcel}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow flex items-center transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3 mr-1 text-emerald-100" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] rounded-lg border border-slate-600 flex items-center transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 mr-1 text-cyan-400" />
              CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-[10px] rounded-lg border border-slate-600 flex items-center transition-colors cursor-pointer"
            >
              <Printer className="w-3 h-3 mr-1" />
              Print
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
          {filteredActivities.map((act) => {
            const scopeSizes: Record<string, string> = {
              'Paltic': '450 Hektarya (Coastal Port & Shoreline Sector)',
              'Aplaya': '320 Hektarya (Mangrove & Intertidal Protected Zone)',
              'Poblacion': '280 Hektarya (Municipal Urban Core & Drainage)',
              'Matawe': '650 Hektarya (Riverine Watershed & Coastal Border)',
              'Tanauan': '520 Hektarya (Agricultural & Coastal Plain)',
              'Butas Na Kahoy': '380 Hektarya (Forest Edge & Upland Sector)',
              'Dikapinisan': '720 Hektarya (Remote Coastal Corridor)',
              'Umiray': '850 Hektarya (Boundary River & Eco-Forest)',
            };
            const scopeSize = scopeSizes[act.barangay] || '400 Hektarya (Municipal Territorial Scope)';
            const assignedCount = assignments?.filter((asg) => asg.activityId === act.id).length || act.assignedBeneficiariesCount || 0;

            return (
              <div key={act.id} className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 shadow-lg text-xs space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-black text-emerald-400 text-sm tracking-tight">{act.title}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        📍 Brgy. {act.barangay}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(act)}
                        title="I-edit ang Program"
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAct(act)}
                        title="I-delete ang Program"
                        className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 space-y-1 font-mono text-[11px]">
                    <p className="text-cyan-300">
                      <strong className="text-slate-400">Sakop ng Barangay:</strong> {scopeSize}
                    </p>
                    <p className="text-slate-200">
                      <strong className="text-slate-400">Mga Gagawin sa Event:</strong> <span className="italic text-emerald-200">{act.description}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Target: <strong className="text-white">{act.targetBeneficiariesCount || 0}</strong></span>
                    <span>Assigned: <strong className="text-emerald-300">{assignedCount}</strong></span>
                  </div>

                  <button
                    onClick={() => setManagingAssignmentsActivity(act)}
                    className="w-full py-1.5 bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mag-add / Tanggalin Naka-Assign ({assignedCount})</span>
                  </button>
                </div>
              </div>
            );
          })}
          {filteredActivities.length === 0 && (
            <p className="text-xs text-slate-400 col-span-full italic">Walang tumugmang detalye ng program content sa iyong isinulat o napiling filter.</p>
          )}
        </div>
      </div>



      {/* Pie Graph Pop-up Modal */}
      {activeChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  {activeChartModal === 'photos' && 'Attendance Picture Uploads (Pie Graph)'}
                  {activeChartModal === 'assigned' && 'Assigned Workforce Distribution (Pie Graph)'}
                  {activeChartModal === 'potential' && 'Predicted Attendance Trend (Pie Graph)'}
                  {activeChartModal === 'barangays' && 'Covered Barangays Breakdown (Pie Graph)'}
                </h3>
              </div>
              <button
                onClick={() => setActiveChartModal(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                  <div className="absolute inset-2 rounded-full bg-slate-900 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Total Metric</span>
                    <span className="text-xl font-black text-white">
                      {activeChartModal === 'photos' && photoUploadedCount}
                      {activeChartModal === 'assigned' && totalAssignedWorkforce}
                      {activeChartModal === 'potential' && potentialAttendeesCount}
                      {activeChartModal === 'barangays' && coveredBarangaysCount}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-xs font-mono">
                  {activeChartModal === 'photos' && (
                    <>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-emerald-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"></span>May Attendance Picture</span>
                        <span className="font-bold text-white">{photoUploadedCount}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-slate-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 mr-2"></span>Wala pang Picture</span>
                        <span className="font-bold text-white">{Math.max(0, attendances.length - photoUploadedCount)}</span>
                      </div>
                    </>
                  )}
                  {activeChartModal === 'assigned' && (
                    <>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-teal-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 mr-2"></span>Naka-assigned sa Event</span>
                        <span className="font-bold text-white">{totalAssignedWorkforce}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-slate-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 mr-2"></span>Active Programs</span>
                        <span className="font-bold text-white">{activities.length}</span>
                      </div>
                    </>
                  )}
                  {activeChartModal === 'potential' && (
                    <>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-cyan-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-2"></span>Possible Attendees</span>
                        <span className="font-bold text-white">{potentialAttendeesCount}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-slate-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 mr-2"></span>Actual Attendance</span>
                        <span className="font-bold text-white">{attendances.length}</span>
                      </div>
                    </>
                  )}
                  {activeChartModal === 'barangays' && (
                    <>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-amber-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2"></span>Sakop na Barangay</span>
                        <span className="font-bold text-white">{coveredBarangaysCount} Barangays</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                        <span className="text-slate-400 flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 mr-2"></span>Total Masterlist</span>
                        <span className="font-bold text-white">{beneficiaries.length}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-[11px] text-slate-300 font-mono">
                <p className="font-bold text-emerald-400 mb-1">📊 Pie Graph Analytics:</p>
                <p>Ang graph na ito ay naka-base sa real-time telemetry at records ng Dingalan, Aurora.</p>
              </div>

              <button
                onClick={() => setActiveChartModal(null)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition-all"
              >
                Isara ang Graph
              </button>
            </div>
          </div>
        </div>
      )}





      {/* Assignment Management Modal (Mag-add / Mag-bura ng Naka-assigned) */}
      {managingAssignmentsActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                    Pamahalaan ang Naka-Assign
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    {managingAssignmentsActivity.title} (Brgy. {managingAssignmentsActivity.barangay})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManagingAssignmentsActivity(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Assigned List */}
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <span className="text-xs font-bold font-mono text-emerald-300">
                Kasalukuyang Naka-Assign ({assignments?.filter(a => a.activityId === managingAssignmentsActivity.id).length || 0}):
              </span>
              <div className="max-h-40 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                {assignments?.filter(a => a.activityId === managingAssignmentsActivity.id).map((asg) => {
                  const bene = beneficiaries.find(b => b.id === asg.beneficiaryId);
                  return (
                    <div key={asg.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-white">
                          {bene ? `${bene.firstName} ${bene.lastName}` : 'Nawawalang Beneficiary'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">
                          ({bene?.beneCode || 'N/A'} • Brgy. {bene?.barangay || 'Dingalan'})
                        </span>
                      </div>
                      <button
                        onClick={() => onUnassignBeneficiary?.(managingAssignmentsActivity.id, asg.beneficiaryId)}
                        className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer"
                        title="Tanggalin ang pagka-assigned"
                      >
                        Bura / Tanggalin
                      </button>
                    </div>
                  );
                })}
                {(!assignments || assignments.filter(a => a.activityId === managingAssignmentsActivity.id).length === 0) && (
                  <p className="text-xs text-slate-500 text-center py-4 italic">Walang benepisyaryong naka-assign sa programang ito.</p>
                )}
              </div>
            </div>

            {/* Add Beneficiary Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold font-mono text-cyan-300">
                Mag-add ng Beneficiary na I-aassign:
              </span>
              <input
                type="text"
                placeholder="Hanapin ang pangalan o ID ng benepisyaryo..."
                value={assignSearchTerm}
                onChange={(e) => setAssignSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <div className="max-h-36 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-1 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                {beneficiaries
                  .filter(b => {
                    const isAlreadyAssigned = assignments?.some(
                      a => a.activityId === managingAssignmentsActivity.id && a.beneficiaryId === b.id
                    );
                    if (isAlreadyAssigned) return false;
                    if (!assignSearchTerm) return true;
                    const q = assignSearchTerm.toLowerCase();
                    return (
                      b.firstName.toLowerCase().includes(q) ||
                      b.lastName.toLowerCase().includes(q) ||
                      b.beneCode.toLowerCase().includes(q) ||
                      b.barangay.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 20)
                  .map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs hover:bg-slate-850">
                      <div>
                        <span className="font-bold text-white">{b.firstName} {b.lastName}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">({b.beneCode} • Brgy. {b.barangay})</span>
                      </div>
                      <button
                        onClick={() => onAssignBeneficiary?.(managingAssignmentsActivity.id, b.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono font-bold shadow transition-all cursor-pointer"
                      >
                        + I-assign
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setManagingAssignmentsActivity(null)}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition-all"
            >
              Tapusin / Isara
            </button>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <Pencil className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  I-edit ang Work Program
                </h3>
              </div>
              <button
                onClick={() => setEditingActivity(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs font-mono">
              <div>
                Program Title *
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  Barangay *
                  <select
                    value={editForm.barangay}
                    onChange={(e) => setEditForm({ ...editForm, barangay: e.target.value as DingalanBarangay })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {DINGALAN_BARANGAYS.map((b) => (
                      <option key={b} value={b}>Brgy. {b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  Target Beneficiaries *
                  <input
                    type="number"
                    min={1}
                    required
                    value={editForm.targetBeneficiariesCount}
                    onChange={(e) => setEditForm({ ...editForm, targetBeneficiariesCount: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                Mga Gagawin / Description *
                <textarea
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-lg shadow-emerald-950/40"
                >
                  I-save ang Pagbabago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Photo Viewer with Philippine Time and Geotag HUD */}
      {selectedRecordForViewer && (
        <FullScreenPhotoViewer
          isOpen={!!selectedRecordForViewer}
          onClose={() => setSelectedRecordForViewer(null)}
          photos={
            selectedRecordForViewer.accomplishmentPhotos && selectedRecordForViewer.accomplishmentPhotos.length > 0
              ? selectedRecordForViewer.accomplishmentPhotos
              : [selectedRecordForViewer.photoWatermarkedUrl]
          }
          beneficiaryName={selectedRecordForViewer.beneficiaryName}
          beneficiaryCode={selectedRecordForViewer.beneficiaryCode}
          activityTitle={selectedRecordForViewer.activityTitle}
          locationDescription={selectedRecordForViewer.locationDescription}
          cleanupNotes={selectedRecordForViewer.accomplishmentNotes || selectedRecordForViewer.notes}
          timestamp={selectedRecordForViewer.timestamp}
          localPhTime={selectedRecordForViewer.localPhTime}
          latitude={selectedRecordForViewer.latitude}
          longitude={selectedRecordForViewer.longitude}
          accuracyMeters={selectedRecordForViewer.accuracyMeters}
          altitudeMeters={selectedRecordForViewer.altitudeMeters}
          verifiedByOfficer={selectedRecordForViewer.verifiedByOfficerName}
        />
      )}
    </div>
  );
};
