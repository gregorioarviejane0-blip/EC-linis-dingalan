import React, { useState, useRef, useEffect } from 'react';
import { Beneficiary, Activity, AttendanceRecord, User, EventQrBroadcast } from '../types';
import { burnGeotagWatermark, getGpsCoordinates, detectDingalanAreaByCoordinates, formatCoordinatesDMS, checkEventCutoff } from '../utils/watermarkEngine';
import { FullScreenPhotoViewer } from './FullScreenPhotoViewer';
import { formatPhilippineDateTime } from '../utils/philippineClock';
import {
  Camera,
  Upload,
  Images,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  FileCheck,
  Edit3,
  UserCheck,
  Calendar,
  RefreshCw,
  Navigation,
  Compass,
} from 'lucide-react';

interface UploadAccomplishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
  activity: Activity | null;
  eventBroadcast?: EventQrBroadcast | null;
  currentUser: User;
  onSubmitAttendance: (payload: any) => Promise<{ success: boolean; attendance: AttendanceRecord }>;
  onSuccessSubmitted?: (attendance: AttendanceRecord) => void;
}

export const UploadAccomplishmentModal: React.FC<UploadAccomplishmentModalProps> = ({
  isOpen,
  onClose,
  beneficiary,
  activity,
  eventBroadcast,
  currentUser,
  onSubmitAttendance,
  onSuccessSubmitted,
}) => {
  // Field 1: Full Name (Editable by user)
  const [fullName, setFullName] = useState<string>('');
  
  // Field 2: Cleaned Area (Editable by user)
  const [cleanedArea, setCleanedArea] = useState<string>('');
  
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [accomplishmentNotes, setAccomplishmentNotes] = useState<string>('');
  
  // Realtime GPS
  const [gpsCoords, setGpsCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
  } | null>(null);
  const [realtimeDetectedArea, setRealtimeDetectedArea] = useState<string>('Brgy. Paltic (Dingalan Feeder Port & Seawall Area)');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);
  const [previewFullscreenIndex, setPreviewFullscreenIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Validate event cutoff
  const cutoffInfo = checkEventCutoff(activity, eventBroadcast);

  const refreshGps = async () => {
    setGpsLoading(true);
    try {
      const targetBrgy = activity?.barangay || beneficiary?.barangay || 'Paltic';
      const coords = await getGpsCoordinates(targetBrgy);
      setGpsCoords(coords);
      const detected = detectDingalanAreaByCoordinates(coords.latitude, coords.longitude);
      setRealtimeDetectedArea(detected);
    } catch (err) {
      console.warn('Realtime GPS error', err);
    } finally {
      setGpsLoading(false);
    }
  };

  // Auto-acquire GPS and initialize fields when modal opens
  useEffect(() => {
    if (isOpen && beneficiary) {
      setIsSuccess(false);
      setErrorMessage(null);
      setUploadedPhotos([]);
      setAccomplishmentNotes('');

      // Initialize Field 1: Full Name (Clean - no prefilled example data)
      setFullName('');

      // Initialize Field 2: Cleaned Area (Clean - no prefilled example data)
      setCleanedArea('');

      refreshGps();
    }
  }, [isOpen, beneficiary, activity]);

  if (!isOpen || !beneficiary) return null;

  const handleApplyRealtimeGpsArea = () => {
    if (realtimeDetectedArea) {
      setCleanedArea(realtimeDetectedArea);
    }
  };

  // Handle Multiple File Upload
  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const fileList = Array.from(files);
    const newPhotos: string[] = [];

    for (const file of fileList) {
      try {
        const rawData = await readFileAsDataUrl(file);
        const coords = gpsCoords || (await getGpsCoordinates(activity?.barangay || beneficiary.barangay || 'Poblacion'));
        const watermarked = await burnGeotagWatermark(
          rawData,
          {
            beneficiaryName: fullName || `${beneficiary.firstName} ${beneficiary.lastName}`,
            beneficiaryCode: beneficiary.beneCode,
            activityTitle: cleanedArea || activity?.title || 'Linis Dingalan Environmental Compliance Program',
            assignedArea: cleanedArea || activity?.targetArea || realtimeDetectedArea,
            barangay: beneficiary.barangay,
            verifiedByOfficer: currentUser.name,
          },
          1280,
          0.82,
          coords
        );
        newPhotos.push(watermarked.watermarkedDataUrl);
      } catch (err: any) {
        console.error('Failed to process photo', err);
      }
    }

    if (newPhotos.length > 0) {
      setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    }
    setIsProcessing(false);
    if (e.target) e.target.value = '';
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSamplePhotos = async () => {
    setIsProcessing(true);
    const sampleImages = [
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=1000&auto=format&fit=crop&q=80',
    ];

    const coords = gpsCoords || (await getGpsCoordinates(activity?.barangay || beneficiary.barangay || 'Poblacion'));
    const generated: string[] = [];

    for (const url of sampleImages) {
      try {
        const watermarked = await burnGeotagWatermark(
          url,
          {
            beneficiaryName: fullName || `${beneficiary.firstName} ${beneficiary.lastName}`,
            beneficiaryCode: beneficiary.beneCode,
            activityTitle: cleanedArea || activity?.title || 'Linis Dingalan Environmental Compliance Program',
            assignedArea: cleanedArea || activity?.targetArea || realtimeDetectedArea,
            barangay: beneficiary.barangay,
            verifiedByOfficer: currentUser.name,
          },
          1280,
          0.82,
          coords
        );
        generated.push(watermarked.watermarkedDataUrl);
      } catch (err) {
        console.error(err);
      }
    }

    setUploadedPhotos((prev) => [...prev, ...generated]);
    setIsProcessing(false);
  };

  // Final Submit
  const handleSubmit = async () => {
    if (cutoffInfo.isExpired) {
      setErrorMessage(`Hindi na maaaring magpasa ng accomplishment attendance dahil tapos na ang nakatakdang oras ng event (${cutoffInfo.endTimeFormatted}).`);
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Pakiusap ilagay ang inyong Full Name sa Number 1.');
      return;
    }

    if (!cleanedArea.trim()) {
      setErrorMessage('Pakiusap ilagay kung saang area kayo nakapaglinis sa Number 2.');
      return;
    }

    if (uploadedPhotos.length === 0) {
      setErrorMessage('Pakiusap mag-upload ng kahit isang (1) accomplishment picture bilang patunay sa pagdalo.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const coords = gpsCoords || (await getGpsCoordinates(activity?.barangay || beneficiary.barangay || 'Poblacion'));

      const payload = {
        activity_id: activity?.id || 'act-001',
        activity_title: activity?.title || 'Linis Dingalan Environmental Compliance Program',
        beneficiary_id: beneficiary.id,
        beneficiary_name: fullName.trim() || `${beneficiary.firstName} ${beneficiary.lastName}`,
        beneficiary_code: beneficiary.beneCode,
        phone_number: beneficiary.contactNumber,
        barangay: beneficiary.barangay,
        department: beneficiary.assignedCluster,
        qr_signature: beneficiary.qrHash || 'qr-verified',
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy_meters: coords.accuracy,
        altitude_meters: coords.altitude || 10,
        location_description: cleanedArea.trim() || `${activity?.targetArea || 'Dingalan Area'}, Dingalan`,
        photo_watermarked: uploadedPhotos[0],
        accomplishment_photos: uploadedPhotos,
        photo_size_kb: Math.round(uploadedPhotos[0].length / 1024),
        notes: accomplishmentNotes.trim() || `Patunay ng paglilinis ni ${fullName.trim()} sa ${cleanedArea.trim()}.`,
        accomplishment_notes: accomplishmentNotes.trim() || `Patunay ng paglilinis ni ${fullName.trim()} sa ${cleanedArea.trim()}.`,
      };

      const res = await onSubmitAttendance(payload);
      if (res.success && res.attendance) {
        setSubmittedRecord(res.attendance);
        setIsSuccess(true);
        if (onSuccessSubmitted) {
          onSuccessSubmitted(res.attendance);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Nagkaroon ng error sa pag-upload ng accomplishment pictures.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-lg overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.25)] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 block truncate">
                LINIS DINGALAN • VERIFIED QR ATTENDANCE
              </span>
              <h3 className="text-sm sm:text-lg font-black text-white tracking-tight leading-tight uppercase truncate">
                PATUNAY SA PAGDALO: UPLOAD ACCOMPLISHMENT
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="ISARA"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 min-h-0 text-left">
          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="text-center py-8 space-y-4 animate-scaleIn">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  ATTENDANCE & PROOF RECORDED
                </span>
                <h4 className="text-2xl font-black text-white uppercase">
                  MATAGUMPAY NA NA-UPLOAD ANG ACCOMPLISHMENT!
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto uppercase font-medium">
                  ANG {uploadedPhotos.length} NA PATUNAY NA LARAWAN NI <strong className="text-white">{fullName}</strong> AY NAISUMITE NA SA SYSTEM AT MAKIKITA NA SA <strong>ACCOMPLISHMENT ATTENDANCE</strong> BUTTON NG ADMIN.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-left space-y-1.5 max-w-md mx-auto uppercase">
                <div className="flex justify-between">
                  <span className="text-slate-400">ATTENDEE (PANGALAN):</span>
                  <span className="text-white font-bold">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LUGAR NA NILINIS:</span>
                  <span className="text-emerald-400 font-bold">{cleanedArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">REALTIME GPS AREA:</span>
                  <span className="text-cyan-300 font-bold">{realtimeDetectedArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BADGE CODE:</span>
                  <span className="text-emerald-400 font-bold">{beneficiary.beneCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MGA LARAWAN:</span>
                  <span className="text-cyan-400 font-bold">{uploadedPhotos.length} PICTURES</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-slate-400">ORAS NG PILIPINAS:</span>
                  <span className="text-cyan-300 font-bold">
                    {formatPhilippineDateTime(submittedRecord?.timestamp || new Date()).fullCombinedTagalog}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-emerald-300 font-bold">VERIFIED CLEANUP ATTENDANCE</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
                <button
                  type="button"
                  onClick={() => setPreviewFullscreenIndex(0)}
                  className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg uppercase tracking-wider"
                >
                  <Images className="w-4 h-4 text-emerald-400" />
                  <span>I-FULLSCREEN ANG LARAWAN ({uploadedPhotos.length})</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl fluid-btn-emerald text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer uppercase tracking-wider"
                >
                  TAPOS NA (DONE)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* CUT-OFF WARNING BANNER (Shows when event time limit has passed) */}
              {cutoffInfo.isExpired ? (
                <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500/80 text-rose-200 text-xs font-sans space-y-1.5 shadow-[0_0_30px_rgba(244,63,94,0.35)] animate-pulse">
                  <div className="flex items-center space-x-2 font-mono font-black text-rose-300 text-sm uppercase">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>TAPOS NA ANG NAKATAKDANG ORAS NG EVENT (CUT-OFF REACHED)</span>
                  </div>
                  <p className="leading-relaxed text-slate-200 uppercase font-medium">
                    NAKALIPAS NA ANG ITINAKDANG ORAS NG EVENT ({cutoffInfo.endTimeFormatted}). AYON SA PATAKARAN NG LGU, HINDI NA TATANGGAPIN ANG ACCOMPLISHMENT ATTENDANCE O MGA LARAWAN MATAPOS ANG NAKATAKDANG CUT-OFF TIME.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center justify-between uppercase">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>EVENT CUT-OFF: <strong>{cutoffInfo.endTimeFormatted}</strong></span>
                  </span>
                  <span className="text-emerald-400 font-bold">BUKAS PARA SA SUBMISSION</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-2 uppercase font-mono font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ========================================================================= */}
              {/* FIELD 1: FULL NAME (Malaya nyang ilalagay) */}
              {/* ========================================================================= */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>1. FULL NAME NG BENEPISYARYO / ATTENDEE <span className="text-rose-400">*</span></span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">KAYO ANG MAGPAPASYA NG ILALAGAY</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-400 text-white text-xs sm:text-sm font-sans font-bold shadow-inner uppercase"
                  />
                  <Edit3 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* FIELD 2: LUGAR KUNG SAANG AREA NAKAPAGLINIS (Malaya nyang ilalagay) */}
              {/* ========================================================================= */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>2. LUGAR KUNG SAANG AREA NAKAPAGLINIS <span className="text-rose-400">*</span></span>
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">KAYO ANG MAGPAPASYA NG ILALAGAY</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={cleanedArea}
                    onChange={(e) => setCleanedArea(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-sans font-bold shadow-inner uppercase"
                  />
                  <MapPin className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Upload Action Area: Kahit Ilang Picture */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
                    <Images className="w-4 h-4 text-emerald-400" />
                    <span>3. ACCOMPLISHMENT PICTURES (KAHIT ILANG PICTURE) <span className="text-rose-400">*</span></span>
                  </label>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                    {uploadedPhotos.length} LARAWAN NA-UPLOAD
                  </span>
                </div>

                {/* Big Action Buttons - Fitted 100% Inside Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-slate-900 border-2 border-dashed border-emerald-400/80 hover:border-emerald-300 text-white flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.01] uppercase text-center"
                  >
                    <div className="flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="font-black text-xs sm:text-sm">PUMILI NG MGA LARAWAN</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 font-semibold uppercase">
                      (KAHIT ILANG PICTURE / WALANG LIMIT)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full p-3 sm:p-4 rounded-2xl bg-slate-950/80 border-2 border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group shadow-lg hover:scale-[1.01] uppercase text-center"
                  >
                    <div className="flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="font-black text-xs sm:text-sm">KUMUHA NG CAMERA SNAPSHOT</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                      (DIRECT CAMERA WITH REALTIME GPS)
                    </span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleFiles}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleMultipleFiles}
                  className="hidden"
                />

                {uploadedPhotos.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddSamplePhotos}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono font-bold text-emerald-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer uppercase"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>MAG-LOAD NG SAMPLE CLEANUP PHOTOS PARA SA TEST</span>
                  </button>
                )}
              </div>

              {/* Photos Gallery */}
              {uploadedPhotos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
                    <span>PINDUTIN ANG PICTURE PARA I-FULLSCREEN:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewFullscreenIndex(0)}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      I-FULLSCREEN LAHAT
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        onClick={() => setPreviewFullscreenIndex(index)}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-700 hover:border-emerald-400 shadow transition-all cursor-pointer"
                        title="Pindutin para i-fullscreen"
                      >
                        <img
                          src={photo}
                          alt={`Accomplishment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-emerald-300 font-bold border border-emerald-500/30">
                          #{index + 1}
                        </div>
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] font-mono text-white bg-slate-950/80 px-2 py-1 rounded-lg border border-emerald-400/50 uppercase">
                            PINDUTIN PARA I-FULLSCREEN
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(index);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-950/90 text-rose-300 hover:text-white border border-rose-500/50 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                          title="Tanggalin ang larawang ito"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-400 bg-slate-950/40 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer uppercase"
                    >
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-mono font-bold">MAGDAGDAG PA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Accomplishment Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-200 block uppercase">
                  4. ULAT SA GINAWANG PAGLILINIS (CLEANUP ACCOMPLISHMENT NOTES)
                </label>
                <textarea
                  value={accomplishmentNotes}
                  onChange={(e) => setAccomplishmentNotes(e.target.value)}
                  placeholder=""
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-400 text-white placeholder-slate-500 text-xs font-sans uppercase"
                />
              </div>

              {/* Primary Submit Button - Fitted 100% inside container */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing || uploadedPhotos.length === 0 || cutoffInfo.isExpired}
                className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center space-x-2 transition-all shadow-xl uppercase ${
                  cutoffInfo.isExpired
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>IPINOPROSESO AT ISINUSUMITE ANG MGA LARAWAN...</span>
                  </span>
                ) : cutoffInfo.isExpired ? (
                  <span className="flex items-center space-x-2 text-rose-300">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>SARADO NA ANG SUBMISSION (NAKALIPAS NA ANG ORAS NG EVENT)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-slate-950 shrink-0" />
                    <span>I-SUBMIT ANG ATTENDANCE AT ACCOMPLISHMENT PICTURES ({uploadedPhotos.length})</span>
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Full-Screen Photo Viewer for Upload Accomplishment */}
      {previewFullscreenIndex !== null && uploadedPhotos.length > 0 && (
        <FullScreenPhotoViewer
          isOpen={previewFullscreenIndex !== null}
          onClose={() => setPreviewFullscreenIndex(null)}
          photos={uploadedPhotos}
          initialIndex={previewFullscreenIndex}
          beneficiaryName={fullName || `${beneficiary.firstName} ${beneficiary.lastName}`}
          beneficiaryCode={beneficiary.beneCode}
          activityTitle={activity?.title || 'Linis Dingalan Environmental Compliance Program'}
          locationDescription={cleanedArea || `${activity?.targetArea || 'Dingalan Area'}, Dingalan`}
          cleanupNotes={accomplishmentNotes}
          timestamp={submittedRecord?.timestamp || new Date().toISOString()}
          localPhTime={submittedRecord?.localPhTime}
          latitude={gpsCoords?.latitude}
          longitude={gpsCoords?.longitude}
          accuracyMeters={gpsCoords?.accuracy}
          altitudeMeters={gpsCoords?.altitude}
          verifiedByOfficer={currentUser.name}
        />
      )}
    </div>
  );
};
