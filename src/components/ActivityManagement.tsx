import React, { useState } from 'react';
import { Activity, ActivityAssignment, AttendanceRecord, Beneficiary, DingalanBarangay, User } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle,
  AlertCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  QrCode,
  Trash2,
  X,
  Search,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Sparkles,
  Filter,
  FileText,
  Printer,
  CheckCircle2,
} from 'lucide-react';

interface ActivityManagementProps {
  activities: Activity[];
  assignments: ActivityAssignment[];
  beneficiaries: Beneficiary[];
  attendances?: AttendanceRecord[];
  currentUser: User;
  onCreateActivity: (data: Partial<Activity>) => Promise<void>;
  onAssignBeneficiary: (activityId: string, beneficiaryId: string) => Promise<void>;
  onUnassignBeneficiary?: (activityId: string, beneficiaryId: string) => Promise<void>;
  onClearActivityAssignments?: (activityId: string) => Promise<void>;
  onSelectActivityForAttendance?: (activity: Activity) => void;
  onOpenGenerateQrModal?: () => void;
  onDeleteActivity?: (activityId: string) => Promise<void>;
  onClearAllActivities?: () => Promise<void>;
}

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

export const ActivityManagement: React.FC<ActivityManagementProps> = ({
  activities,
  assignments,
  beneficiaries,
  attendances = [],
  currentUser,
  onCreateActivity,
  onAssignBeneficiary,
  onUnassignBeneficiary,
  onClearActivityAssignments,
  onSelectActivityForAttendance,
  onOpenGenerateQrModal,
  onDeleteActivity,
  onClearAllActivities,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignModalActivity, setAssignModalActivity] = useState<Activity | null>(null);
  const [autoReportActivity, setAutoReportActivity] = useState<Activity | null>(null);
  const [selectedBeneIds, setSelectedBeneIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Search & Filter for Assign Modal
  const [assignFilterTab, setAssignFilterTab] = useState<'ALL' | 'ASSIGNED' | 'AVAILABLE'>('ALL');
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [quickAddName, setQuickAddName] = useState('');
  const [isConfirmClearAssignedOpen, setIsConfirmClearAssignedOpen] = useState(false);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Delete states
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [newActivity, setNewActivity] = useState<{
    title: string;
    programType: 'TUPAD' | 'CASH_FOR_WORK' | 'COASTAL_CLEANUP' | 'MANGROVE_REHAB' | 'DRAINAGE_DECLOGGING';
    description: string;
    date: string;
    callTime: string;
    targetArea: string;
    barangay: DingalanBarangay;
    targetBeneficiariesCount: number | string;
    notes: string;
    qrScheduleEnabled: boolean;
    qrDisplayMode: 'match_event' | 'custom_schedule' | 'immediate';
    qrDisplayStartDate: string;
    qrDisplayStartTime: string;
    qrDisplayEndDate: string;
    qrDisplayEndTime: string;
    requiredTools: string;
    waterReminder: string;
    recommendedAttire: string;
  }>({
    title: '',
    programType: 'COASTAL_CLEANUP',
    description: '',
    date: new Date().toISOString().split('T')[0],
    callTime: '06:00',
    targetArea: 'Dingalan Feeder Port Rock Wall',
    barangay: 'Paltic',
    targetBeneficiariesCount: '20',
    notes: '',
    qrScheduleEnabled: true,
    qrDisplayMode: 'match_event',
    qrDisplayStartDate: new Date().toISOString().split('T')[0],
    qrDisplayStartTime: '06:00',
    qrDisplayEndDate: new Date().toISOString().split('T')[0],
    qrDisplayEndTime: '23:59',
    requiredTools: 'Guwantes, Sako ng Basura, Walis Tingting, Pandakot at Tongs',
    waterReminder: 'Magdala ng sariling reusable tumbler na may inuming tubig.',
    recommendedAttire: 'Boots o Rubber Shoes, Sumbrero, at Reflectorized Vest.',
  });

  const filteredActivities = activities.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resolvedStartDate = newActivity.qrDisplayMode === 'immediate'
        ? new Date().toISOString().split('T')[0]
        : (newActivity.qrDisplayMode === 'match_event' ? newActivity.date : newActivity.qrDisplayStartDate);

      const resolvedStartTime = newActivity.qrDisplayMode === 'immediate'
        ? '00:00'
        : (newActivity.qrDisplayMode === 'match_event' ? newActivity.callTime : newActivity.qrDisplayStartTime);

      const resolvedEndDate = newActivity.qrDisplayMode === 'custom_schedule'
        ? newActivity.qrDisplayEndDate
        : newActivity.date;

      const resolvedEndTime = newActivity.qrDisplayMode === 'custom_schedule'
        ? newActivity.qrDisplayEndTime
        : '23:59';

      const payload = {
        ...newActivity,
        qrDisplayStartDate: resolvedStartDate,
        qrDisplayStartTime: resolvedStartTime,
        qrDisplayEndDate: resolvedEndDate,
        qrDisplayEndTime: resolvedEndTime,
        estimatedEndTime: resolvedEndTime,
      };

      await onCreateActivity(payload);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create work program');
    }
  };

  const handleOpenAssignModal = (activity: Activity) => {
    setAssignModalActivity(activity);
    // Find already assigned beneficiaries
    const alreadyAssigned = assignments
      .filter((asg) => asg.activityId === activity.id)
      .map((asg) => asg.beneficiaryId);
    setSelectedBeneIds(alreadyAssigned);
    setAssignFilterTab('ALL');
    setAssignSearchQuery('');
    setQuickAddName('');
    setIsConfirmClearAssignedOpen(false);
  };

  // Toggle selection in modal
  const handleToggleBeneSelection = (beneId: string) => {
    if (selectedBeneIds.includes(beneId)) {
      setSelectedBeneIds(selectedBeneIds.filter((id) => id !== beneId));
    } else {
      setSelectedBeneIds([...selectedBeneIds, beneId]);
    }
  };

  // Direct Mag-Add ng Naka-Assign
  const handleAssignSingle = async (beneId: string) => {
    if (!assignModalActivity) return;
    setSelectedBeneIds((prev) => Array.from(new Set([...prev, beneId])));
    const isAssigned = assignments.some(
      (asg) => asg.activityId === assignModalActivity.id && asg.beneficiaryId === beneId
    );
    if (!isAssigned) {
      try {
        await onAssignBeneficiary(assignModalActivity.id, beneId);
      } catch (err: any) {
        console.warn('Assign error:', err);
      }
    }
  };

  // Direct Burahin ang Naka-Assign
  const handleUnassignSingle = async (beneId: string) => {
    if (!assignModalActivity) return;
    setSelectedBeneIds((prev) => prev.filter((id) => id !== beneId));
    if (onUnassignBeneficiary) {
      try {
        await onUnassignBeneficiary(assignModalActivity.id, beneId);
      } catch (err: any) {
        console.warn('Unassign error:', err);
      }
    }
  };

  // Burahin Lahat ng Naka-Assigned
  const handleClearAllAssigned = async () => {
    if (!assignModalActivity) return;
    const actId = assignModalActivity.id;
    setSelectedBeneIds([]);
    setIsConfirmClearAssignedOpen(false);
    if (onClearActivityAssignments) {
      try {
        await onClearActivityAssignments(actId);
      } catch {}
    } else if (onUnassignBeneficiary) {
      const currentAssigned = assignments
        .filter((asg) => asg.activityId === actId)
        .map((asg) => asg.beneficiaryId);
      for (const bId of currentAssigned) {
        try {
          await onUnassignBeneficiary(actId, bId);
        } catch {}
      }
    }
  };

  // Batch Assign Cluster
  const handleBatchAssignCluster = (clusterName: string) => {
    const clusterBeneIds = beneficiaries
      .filter((b) => b.assignedCluster.toLowerCase().includes(clusterName.toLowerCase()) || b.barangay === assignModalActivity?.barangay)
      .map((b) => b.id);
    const combined = Array.from(new Set([...selectedBeneIds, ...clusterBeneIds]));
    setSelectedBeneIds(combined);
  };

  // Quick Add via name input
  const handleQuickAddByName = async () => {
    if (!quickAddName.trim() || !assignModalActivity) return;
    const q = quickAddName.trim().toLowerCase();
    const matched = beneficiaries.find(
      (b) =>
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
        b.beneCode.toLowerCase().includes(q)
    );
    if (matched) {
      await handleAssignSingle(matched.id);
      setQuickAddName('');
    } else {
      alert(`Hindi nahanap si "${quickAddName}" sa Beneficiary Masterlist. Pakiusap tiyakin na nakarehistro ang pangalan o code.`);
    }
  };

  // Commit / Save all assignments changes
  const handleSaveAssignments = async () => {
    if (!assignModalActivity) return;
    setIsAssigning(true);
    try {
      const currentAssigned = assignments
        .filter((asg) => asg.activityId === assignModalActivity.id)
        .map((asg) => asg.beneficiaryId);

      // Add new ones
      for (const beneId of selectedBeneIds) {
        if (!currentAssigned.includes(beneId)) {
          await onAssignBeneficiary(assignModalActivity.id, beneId);
        }
      }

      // Remove / unassign deselected ones
      if (onUnassignBeneficiary) {
        for (const beneId of currentAssigned) {
          if (!selectedBeneIds.includes(beneId)) {
            await onUnassignBeneficiary(assignModalActivity.id, beneId);
          }
        }
      }

      setAssignModalActivity(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update assignments');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status: Activity['status']) => {
    switch (status) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <Play className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> ONGOING
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Clock className="w-3 h-3 mr-1 text-cyan-400" /> SCHEDULED
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3 h-3 mr-1 text-rose-400" /> CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 sm:p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Work Programs & Activity-Based Area Assignment
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Activity-specific compliance monitoring for PESO Cash-for-Work & MENRO coastal defense initiatives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-900/80 p-0.5 sm:p-1 rounded-xl border border-slate-700 text-[11px] sm:text-xs">
            {['ALL', 'ongoing', 'scheduled', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 sm:px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {onOpenGenerateQrModal && (
            <button
              onClick={onOpenGenerateQrModal}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#00e599] via-[#00d9b4] to-[#00d4ff] hover:from-[#00f2a5] hover:to-[#22e1ff] text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,229,153,0.35)] flex items-center space-x-1 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              title="Generate Cleanup Event QR Code & Paalala"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>Generate Event QR</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Program
          </button>

          {onClearAllActivities && activities.length > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmDeleteAllOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-400 font-mono font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              title="Permanenteng burahin ang lahat ng nakatalang Work Programs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Burahin Lahat ({activities.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Walang Nakatalang Work Program</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Kasalukuyang walang active o nakatakdang work program. Pindutin ang "+ New Program" upang magdagdag ng bagong schedule.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lumikha ng Bagong Program</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {filteredActivities.map((act) => {
            const actAssignments = assignments.filter((asg) => asg.activityId === act.id);
            const attendedCount = actAssignments.filter((asg) => asg.status === 'attended').length;
            const assignedCount = actAssignments.length;
            const progressPercent = assignedCount > 0 ? Math.round((attendedCount / assignedCount) * 100) : 0;

            return (
              <div
                key={act.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      {act.programType.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {getStatusBadge(act.status)}
                      {onDeleteActivity && (
                        <button
                          type="button"
                          onClick={() => setActivityToDelete(act)}
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 hover:border-rose-500 transition-all cursor-pointer"
                          title="Burahin ang box na ito"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {act.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2">
                    {act.description}
                  </p>

                  {/* Logistics Info */}
                  <div className="mt-3 sm:mt-4 space-y-1 text-xs text-slate-300 bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                      <span className="font-semibold truncate">{act.targetArea}</span>
                      <span className="text-slate-400 ml-1 shrink-0">(Brgy. {act.barangay})</span>
                    </div>
                    <div className="flex flex-wrap items-center text-slate-300 gap-y-1">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400 mr-1 shrink-0" />
                        <span>{act.date}</span>
                      </span>
                      <span className="flex items-center ml-2.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 mr-1 shrink-0" />
                        <span>{act.callTime} AM</span>
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      Supervisor: <span className="text-slate-200 font-medium">{act.supervisorName}</span>
                    </div>
                  </div>

                  {/* Beneficiary Assignment & Compliance Progress */}
                  <div className="mt-3 sm:mt-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold">
                      <span className="text-slate-300 flex items-center">
                        <Users className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                        Assigned Workforce:
                      </span>
                      <span className="font-mono text-emerald-300">
                        {attendedCount} / {assignedCount || act.targetBeneficiariesCount} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 sm:h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>

                    {/* Expandable Assigned Beneficiaries List & Quick Delete */}
                    {assignedCount > 0 && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() => setExpandedActivityId(expandedActivityId === act.id ? null : act.id)}
                          className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{expandedActivityId === act.id ? '▲ Itago ang naka-assign' : `▼ Tingnan ang mga naka-assign (${assignedCount})`}</span>
                        </button>
                        {expandedActivityId === act.id && (
                          <div className="mt-2 p-2 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 max-h-40 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                            <div className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
                              <span>Naka-Assigned:</span>
                              <span className="text-emerald-400 font-mono">{assignedCount}</span>
                            </div>
                            {beneficiaries
                              .filter((b) => assignments.some((asg) => asg.activityId === act.id && asg.beneficiaryId === b.id))
                              .map((b) => (
                                <div key={b.id} className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                                  <div className="truncate pr-2">
                                    <span className="font-bold text-white text-[11px]">{b.firstName} {b.lastName}</span>
                                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({b.beneCode} • {b.barangay})</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (onUnassignBeneficiary) {
                                        await onUnassignBeneficiary(act.id, b.id);
                                      }
                                    }}
                                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 p-1 rounded transition-colors shrink-0 cursor-pointer flex items-center gap-0.5 text-[10px]"
                                    title={`Burahin/Alisin si ${b.firstName} ${b.lastName} sa program`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Alisin</span>
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenAssignModal(act)}
                      className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-slate-700/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors border border-slate-600 flex items-center shrink-0 cursor-pointer"
                    >
                      <Users className="w-3 h-3 mr-1 text-slate-400" />
                      Assign ({assignedCount})
                    </button>

                    {onDeleteActivity && (
                      <button
                        type="button"
                        onClick={() => setActivityToDelete(act)}
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-rose-500/30 flex items-center shrink-0 cursor-pointer"
                        title="Burahin ang box na ito"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        <span>Burahin</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoReportActivity(act)}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-cyan-600/90 hover:bg-cyan-600 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1 shadow cursor-pointer shrink-0"
                    title="I-view ang Auto Report ng Work Program na ito"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Single Activity Confirmation Modal */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(244,63,94,0.25)] p-4 sm:p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 block">
                    Kumpirmasyon ng Pagbura
                  </span>
                  <h3 className="text-base font-black text-white">
                    Burahin ang Program Box?
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivityToDelete(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <p className="font-bold text-white text-sm">{activityToDelete.title}</p>
              <p className="text-[11px] text-emerald-300">Brgy. {activityToDelete.barangay} • {activityToDelete.targetArea}</p>
              <p className="text-[11px] text-slate-400">{activityToDelete.date} • {activityToDelete.callTime} AM</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sigurado ka bang nais mong permanenteng burahin ang box ng work program na ito?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActivityToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteActivity || !activityToDelete) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteActivity(activityToDelete.id);
                    setActivityToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Box'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Activities Confirmation Modal */}
      {isConfirmDeleteAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(244,63,94,0.3)] p-4 sm:p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 block">
                    Permanenteng Pagbura ng Lahat
                  </span>
                  <h3 className="text-base font-black text-white">
                    Burahin ang Lahat ng Boxes?
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmDeleteAllOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 leading-relaxed space-y-1">
              <p>Sigurado ka bang nais mong permanenteng burahin ang lahat ng <strong>{activities.length}</strong> work program boxes sa sistema?</p>
              <p className="text-[11px] text-rose-300/80">Lahat ng aktibidad, schedule, at area assignments ay mawawala sa listahan.</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteAllOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onClearAllActivities) return;
                  setIsDeleting(true);
                  try {
                    await onClearAllActivities();
                    setIsConfirmDeleteAllOpen(false);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting All...' : 'Yes, Permanently Delete All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Beneficiaries Modal */}
      {assignModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.2)] overflow-hidden my-4 sm:my-8 text-left">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Work Program Workforce Assignment
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Assign Beneficiaries to Work Program
                </h3>
                <p className="text-xs text-emerald-400 mt-0.5">
                  {assignModalActivity.title} (Brgy. {assignModalActivity.barangay} • {assignModalActivity.targetArea})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalActivity(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Isara"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
              {/* Metric Counters Bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Naka-Assigned</span>
                  <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                    {selectedBeneIds.length} <span className="text-xs text-slate-500 font-normal">/ {assignModalActivity.targetBeneficiariesCount}</span>
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Available</span>
                  <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">
                    {Math.max(0, beneficiaries.length - selectedBeneIds.length)}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Kabuuan</span>
                  <span className="text-sm sm:text-base font-black text-slate-200 font-mono">
                    {beneficiaries.length}
                  </span>
                </div>
              </div>

              {/* Quick Add by Name/Code Input Box */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-1.5">
                <label className="text-[11px] font-mono text-emerald-400 font-bold uppercase flex items-center space-x-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mabilisang Mag-Add ng Naka-Assign:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickAddName}
                    onChange={(e) => setQuickAddName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQuickAddByName();
                      }
                    }}
                    placeholder="I-type ang pangalan o Bene Code para i-add agad..."
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddByName}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Mag-Add</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Tabs */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={assignSearchQuery}
                    onChange={(e) => setAssignSearchQuery(e.target.value)}
                    placeholder="Salain ayon sa Pangalan, ID Code, Barangay, o Cluster..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                  {assignSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAssignSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setAssignFilterTab('ALL')}
                    className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer font-bold ${
                      assignFilterTab === 'ALL'
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Lahat ({beneficiaries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignFilterTab('ASSIGNED')}
                    className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                      assignFilterTab === 'ASSIGNED'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <span>✓ Naka-Assigned</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-[10px] font-mono">
                      {selectedBeneIds.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignFilterTab('AVAILABLE')}
                    className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer font-bold ${
                      assignFilterTab === 'AVAILABLE'
                        ? 'bg-cyan-700 text-white shadow'
                        : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                  >
                    Available ({Math.max(0, beneficiaries.length - selectedBeneIds.length)})
                  </button>
                </div>
              </div>

              {/* Quick Batch Assign & Delete Actions Bar */}
              <div className="p-2.5 sm:p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-300 text-[11px]">
                    Quick Assign:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBatchAssignCluster('Coastal Watch')}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-mono cursor-pointer transition-colors"
                  >
                    + Coastal Watch
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchAssignCluster('Mangrove')}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-mono cursor-pointer transition-colors"
                  >
                    + Mangrove
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchAssignCluster(assignModalActivity.barangay)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-colors"
                  >
                    + Brgy. {assignModalActivity.barangay}
                  </button>
                </div>

                {/* Clear All Assigned Button */}
                {selectedBeneIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmClearAssignedOpen(true)}
                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] font-mono font-bold border border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer ml-auto"
                    title="Alisin ang lahat ng kasalukuyang naka-assign sa work program na ito"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Burahin Lahat ng Naka-Assigned ({selectedBeneIds.length})</span>
                  </button>
                )}
              </div>

              {/* Confirmation Alert to Clear All Assigned */}
              {isConfirmClearAssignedOpen && (
                <div className="p-3 rounded-xl bg-rose-950/80 border-2 border-rose-500/80 text-rose-200 text-xs space-y-2 animate-fadeIn">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Kumpirmasyon: Burahin ang Lahat ng Naka-Assigned?</span>
                  </p>
                  <p className="text-[11px] text-rose-300">
                    Sigurado ka bang nais mong alisin ang lahat ng <strong>{selectedBeneIds.length}</strong> na naka-assign sa work program na ito?
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsConfirmClearAssignedOpen(false)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono cursor-pointer"
                    >
                      Kanselahin
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllAssigned}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-mono font-bold cursor-pointer shadow"
                    >
                      Oo, Burahin Lahat
                    </button>
                  </div>
                </div>
              )}

              {/* Beneficiary List with Checkboxes and Direct Add/Delete Buttons */}
              <div className="max-h-72 sm:max-h-80 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden space-y-2 border border-slate-800 p-2 sm:p-2.5 rounded-xl bg-slate-950/70">
                {beneficiaries
                  .filter((b) => {
                    const isSelected = selectedBeneIds.includes(b.id);
                    if (assignFilterTab === 'ASSIGNED' && !isSelected) return false;
                    if (assignFilterTab === 'AVAILABLE' && isSelected) return false;

                    if (assignSearchQuery.trim()) {
                      const q = assignSearchQuery.toLowerCase();
                      const fullName = `${b.firstName} ${b.lastName}`.toLowerCase();
                      const code = b.beneCode.toLowerCase();
                      const brgy = b.barangay.toLowerCase();
                      const cluster = (b.assignedCluster || '').toLowerCase();
                      return fullName.includes(q) || code.includes(q) || brgy.includes(q) || cluster.includes(q);
                    }
                    return true;
                  })
                  .map((b) => {
                    const isSelected = selectedBeneIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => handleToggleBeneSelection(b.id)}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs flex items-center gap-1.5 flex-wrap">
                              <span className="truncate">{b.firstName} {b.lastName}</span>
                              {isSelected ? (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                                  ✓ Naka-Assigned
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-slate-800 text-slate-400">
                                  Available
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {b.beneCode} • Brgy. {b.barangay} ({b.assignedCluster})
                            </div>
                          </div>
                        </div>

                        {/* Action controls: Direct Add & Direct Delete Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                            {b.contactNumber}
                          </span>

                          {isSelected ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassignSingle(b.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow shrink-0"
                              title="Burahin ang naka-assigned"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Burahin</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignSingle(b.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow shrink-0"
                              title="I-add bilang naka-assigned"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Mag-Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-slate-800 flex flex-col xs:flex-row items-center justify-between gap-2.5">
                <span className="text-xs text-slate-400 font-mono">
                  Kabuuang Naka-Assigned: <strong className="text-emerald-400">{selectedBeneIds.length}</strong>
                </span>

                <div className="flex items-center space-x-2 w-full xs:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setAssignModalActivity(null)}
                    className="flex-1 xs:flex-initial px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Isara
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAssignments}
                    disabled={isAssigning}
                    className="flex-1 xs:flex-initial px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isAssigning ? 'Saving Assignments...' : `I-save ang mga Naka-Assigned (${selectedBeneIds.length})`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[92dvh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">Create Work Program Activity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Dingalan Feeder Port Coastal Cleanliness Operation"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Program Classification *
                  </label>
                  <select
                    value={newActivity.programType}
                    onChange={(e) => setNewActivity({ ...newActivity, programType: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="COASTAL_CLEANUP">Coastal Cleanup</option>
                    <option value="MANGROVE_REHAB">Mangrove Rehabilitation</option>
                    <option value="DRAINAGE_DECLOGGING">Drainage Declogging</option>
                    <option value="TUPAD">TUPAD / Cash-for-Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Target Beneficiaries Count *
                  </label>
                  <input
                    type="text"
                    required
                    value={newActivity.targetBeneficiariesCount}
                    onChange={(e) => setNewActivity({ ...newActivity, targetBeneficiariesCount: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Barangay *
                  </label>
                  <select
                    value={newActivity.barangay}
                    onChange={(e) => setNewActivity({ ...newActivity, barangay: e.target.value as DingalanBarangay })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {DINGALAN_BARANGAYS.map((b) => (
                      <option key={b} value={b}>
                        Brgy. {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Target Work Area / Zone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newActivity.targetArea}
                    onChange={(e) => setNewActivity({ ...newActivity, targetArea: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Paltic Rock Sea Wall & Port Berth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Activity Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newActivity.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setNewActivity((prev) => ({
                        ...prev,
                        date: newDate,
                        ...(prev.qrDisplayMode === 'match_event'
                          ? { qrDisplayStartDate: newDate, qrDisplayEndDate: newDate }
                          : {}),
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Call Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newActivity.callTime}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setNewActivity((prev) => ({
                        ...prev,
                        callTime: newTime,
                        ...(prev.qrDisplayMode === 'match_event'
                          ? { qrDisplayStartTime: newTime }
                          : {}),
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Description / Operational Guidelines
                </label>
                <textarea
                  rows={2}
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Shoreline clearing following high-tide debris accumulation..."
                />
              </div>

              {/* QR Code Paalala Schedule Configuration Section */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/85 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Schedule ng QR Code Paalala sa Login Page</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          Login Advisory
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Itakda kung kailan lalabas at kailan matatapos ang QR code at paalala sa Login Screen.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={newActivity.qrScheduleEnabled}
                      onChange={(e) => setNewActivity({ ...newActivity, qrScheduleEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {newActivity.qrScheduleEnabled ? (
                  <div className="space-y-3 pt-1">
                    {/* Mode Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                        Kailan Lalabas sa Login Page?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setNewActivity({
                            ...newActivity,
                            qrDisplayMode: 'match_event',
                            qrDisplayStartDate: newActivity.date,
                            qrDisplayStartTime: newActivity.callTime,
                            qrDisplayEndDate: newActivity.date,
                            qrDisplayEndTime: '23:59',
                          })}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            newActivity.qrDisplayMode === 'match_event'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white font-bold ring-1 ring-emerald-400'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-semibold flex items-center gap-1 text-emerald-300">
                            <span>🎯 Sa Oras ng Event</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Lalabas sa mismong petsa at call time</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewActivity({
                            ...newActivity,
                            qrDisplayMode: 'custom_schedule',
                          })}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            newActivity.qrDisplayMode === 'custom_schedule'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white font-bold ring-1 ring-emerald-400'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-semibold flex items-center gap-1 text-cyan-300">
                            <span>🗓️ Custom Schedule</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Pumili ng sariling petsa at oras</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewActivity({
                            ...newActivity,
                            qrDisplayMode: 'immediate',
                            qrDisplayStartDate: new Date().toISOString().split('T')[0],
                            qrDisplayStartTime: '00:00',
                            qrDisplayEndDate: newActivity.date,
                            qrDisplayEndTime: '23:59',
                          })}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            newActivity.qrDisplayMode === 'immediate'
                              ? 'bg-emerald-950/70 border-emerald-500 text-white font-bold ring-1 ring-emerald-400'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-semibold flex items-center gap-1 text-amber-300">
                            <span>⚡ Agad Ilabas</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Aktibo na kaagad ngayon sa login</div>
                        </button>
                      </div>
                    </div>

                    {/* Date & Time Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Start Schedule */}
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          ▶️ Petsa at Oras ng Paglabas (Start)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Petsa</label>
                            <input
                              type="date"
                              required={newActivity.qrScheduleEnabled}
                              value={newActivity.qrDisplayStartDate}
                              onChange={(e) => setNewActivity({ ...newActivity, qrDisplayStartDate: e.target.value })}
                              className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Oras</label>
                            <input
                              type="time"
                              required={newActivity.qrScheduleEnabled}
                              value={newActivity.qrDisplayStartTime}
                              onChange={(e) => setNewActivity({ ...newActivity, qrDisplayStartTime: e.target.value })}
                              className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* End Schedule */}
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          ⏹️ Petsa at Oras ng Pagkawala (End)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Petsa</label>
                            <input
                              type="date"
                              required={newActivity.qrScheduleEnabled}
                              value={newActivity.qrDisplayEndDate}
                              onChange={(e) => setNewActivity({ ...newActivity, qrDisplayEndDate: e.target.value })}
                              className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Oras</label>
                            <input
                              type="time"
                              required={newActivity.qrScheduleEnabled}
                              value={newActivity.qrDisplayEndTime}
                              onChange={(e) => setNewActivity({ ...newActivity, qrDisplayEndTime: e.target.value })}
                              className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Paalala (Reminders) details for QR Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Kailangang Kagamitan (Tools)</label>
                        <input
                          type="text"
                          placeholder="Guwantes, sako, walis..."
                          value={newActivity.requiredTools}
                          onChange={(e) => setNewActivity({ ...newActivity, requiredTools: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Paalala sa Tubig (Tumbler)</label>
                        <input
                          type="text"
                          placeholder="Magdala ng reusable tumbler..."
                          value={newActivity.waterReminder}
                          onChange={(e) => setNewActivity({ ...newActivity, waterReminder: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Kasoutan (Attire)</label>
                        <input
                          type="text"
                          placeholder="Boots, vest, sumbrero..."
                          value={newActivity.recommendedAttire}
                          onChange={(e) => setNewActivity({ ...newActivity, recommendedAttire: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Schedule Info Banner */}
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] sm:text-[11px] text-emerald-200 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 font-mono">
                      <span>
                        ⏰ <strong>Display Window:</strong> {newActivity.qrDisplayStartDate} ({newActivity.qrDisplayStartTime}) hanggang {newActivity.qrDisplayEndDate} ({newActivity.qrDisplayEndTime})
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                        PST (Asia/Manila)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 italic">
                    Naka-off ang QR Code paalala sa login page para sa activity na ito.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg cursor-pointer"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Auto Report Modal */}
      {autoReportActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/50 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.2)] overflow-hidden my-4 sm:my-8 text-left">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                    Opisyal na Ulat ng Programa (Auto Report)
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {autoReportActivity.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoReportActivity(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Report Content */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75dvh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Barangay</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">Brgy. {autoReportActivity.barangay}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Petsa / Oras</span>
                  <span className="text-xs sm:text-sm font-bold text-cyan-300 font-mono">{autoReportActivity.date} • {autoReportActivity.callTime} AM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Naka-Assign</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                    {assignments.filter(asg => asg.activityId === autoReportActivity.id).length} / {autoReportActivity.targetBeneficiariesCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Katayuan</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-300 uppercase">{autoReportActivity.status}</span>
                </div>
              </div>

              {/* Detailed Content Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Lokasyon / Target Area:</span>
                  <p className="text-sm font-bold text-white flex items-center mt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-400 mr-1.5 shrink-0" />
                    <span>{autoReportActivity.targetArea} (Brgy. {autoReportActivity.barangay})</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Deskripsyon ng Programa:</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    {autoReportActivity.description || 'Walang karagdagang deskripsyon.'}
                  </p>
                </div>

                {autoReportActivity.notes && (
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Mga Paalala / Admin Notes:</span>
                    <p className="text-xs text-amber-200 leading-relaxed mt-0.5 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30">
                      {autoReportActivity.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono">Supervisor / Officer:</span>{' '}
                    <strong className="text-white">{autoReportActivity.supervisorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Uri ng Programa:</span>{' '}
                    <strong className="text-cyan-400 uppercase font-mono">{autoReportActivity.programType.replace('_', ' ')}</strong>
                  </div>
                </div>
              </div>

              {/* Assigned Beneficiaries List in this Report */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-mono uppercase text-emerald-400 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Listahan ng mga Naka-Assign at Katayuan sa Programa:</span>
                </h4>

                <div className="max-h-56 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden space-y-1.5 p-2 bg-slate-950/80 border border-slate-800 rounded-xl">
                  {assignments.filter(asg => asg.activityId === autoReportActivity.id).length > 0 ? (
                    assignments
                      .filter(asg => asg.activityId === autoReportActivity.id)
                      .map((asg) => {
                        const bene = beneficiaries.find(b => b.id === asg.beneficiaryId);
                        const isAttended = attendances?.some(att => att.activityId === autoReportActivity.id && att.beneficiaryId === asg.beneficiaryId);
                        return (
                          <div key={asg.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                            <div>
                              <span className="font-bold text-white text-xs">
                                {bene ? `${bene.firstName} ${bene.lastName}` : 'Nawawalang Beneficiary'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono ml-2">
                                ({bene?.beneCode || 'N/A'} • Brgy. {bene?.barangay || 'Dingalan'})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isAttended ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Nakadalo / Verified</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                                  Naka-Assign (Pending)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <span className="text-xs text-slate-500 font-mono block text-center py-4">
                      Walang nakatalagang beneficiary sa work program na ito sa kasalukuyan.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>I-print ang Ulat</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoReportActivity(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-lg transition-all cursor-pointer"
              >
                Isara ang Ulat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
