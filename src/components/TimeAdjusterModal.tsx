import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Calendar,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders
} from 'lucide-react';
import {
  useDingalanClock,
  setDingalanTimeOverride,
  resetDingalanTimeOverride,
  isDingalanTimeOverridden,
  getDingalanNow,
} from '../utils/philippineClock';

interface TimeAdjusterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeAdjusterModal: React.FC<TimeAdjusterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const clock = useDingalanClock();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('08:00');
  const [isOverridden, setIsOverridden] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsOverridden(isDingalanTimeOverridden());
      const now = getDingalanNow();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const da = String(now.getDate()).padStart(2, '0');
      setSelectedDate(`${yr}-${mo}-${da}`);

      const hr = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      setSelectedTime(`${hr}:${mi}`);
      setSaveSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyNewTime = () => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);

      if (!year || !month || !day || isNaN(hours) || isNaN(minutes)) {
        alert('Pakiusap ilagay ang wastong petsa at oras.');
        return;
      }

      // Create target date in Dingalan timezone (UTC+8)
      const targetUtcEpoch = Date.UTC(year, month - 1, day, hours - 8, minutes, 0);
      const targetDate = new Date(targetUtcEpoch);

      setDingalanTimeOverride(targetDate);
      setIsOverridden(true);
      setSaveSuccessMsg('Matagumpay na nabago ang oras sa buong system!');
      setTimeout(() => {
        setSaveSuccessMsg(null);
        onClose();
      }, 900);
    } catch (e) {
      console.error('Time override error:', e);
    }
  };

  const handleResetToRealTime = () => {
    resetDingalanTimeOverride();
    setIsOverridden(false);
    setSaveSuccessMsg('Na-reset na ang oras sa opisyal na Philippine Standard Time (Real-Time)!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 900);
  };

  const applyPreset = (timeStr: string) => {
    setSelectedTime(timeStr);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/70 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.3)] overflow-hidden my-auto flex flex-col text-left max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Clock className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  PST CLOCK CONTROL
                </span>
                {isOverridden && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    MANUAL OVERRIDE ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white tracking-tight uppercase">
                PALITAN O I-ADJUST ANG ORAS
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Active Time Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              KASALUKUYANG ORAS SA SYSTEM (DINGALAN, AURORA):
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <div className="text-white font-mono font-black text-sm sm:text-base">
                {clock.dayOfWeek}, {clock.dateFormatted} • <span className="text-emerald-300">{clock.timeWithSeconds}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                UTC+8
              </span>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2 font-mono font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Date Picker Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>1. PETSA (DATE) <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-cyan-400 text-white font-mono text-sm font-bold shadow-inner"
            />
          </div>

          {/* Time Picker Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>2. ORAS AT MINUTO (TIME) <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-emerald-400 text-white font-mono text-base font-black shadow-inner"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>MABILISANG PRESETS (QUICK SELECT)</span>
              <span className="text-[10px] text-slate-400 font-normal">Pindutin para mabilisang mapalitan</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => applyPreset('06:00')}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left cursor-pointer transition-all hover:border-emerald-500/50"
              >
                <span className="text-white font-bold block">06:00 AM</span>
                <span className="text-[10px] text-slate-400 block truncate">Umaga / Call Time</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('08:00')}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left cursor-pointer transition-all hover:border-emerald-500/50"
              >
                <span className="text-emerald-300 font-bold block">08:00 AM</span>
                <span className="text-[10px] text-slate-400 block truncate">Cleanliness Operation</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('12:00')}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left cursor-pointer transition-all hover:border-emerald-500/50"
              >
                <span className="text-cyan-300 font-bold block">12:00 PM</span>
                <span className="text-[10px] text-slate-400 block truncate">Tanghali / Midday</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('17:00')}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left cursor-pointer transition-all hover:border-emerald-500/50"
              >
                <span className="text-amber-300 font-bold block">05:00 PM</span>
                <span className="text-[10px] text-slate-400 block truncate">Bago Mag-Cutoff</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('17:15')}
                className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/40 text-left cursor-pointer transition-all col-span-2"
              >
                <span className="text-rose-300 font-bold block">05:15 PM (Lampas sa 5:10 PM Cut-off)</span>
                <span className="text-[10px] text-rose-200/80 block">Subukan ang Expired / Cut-Off Warning Mode</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold font-mono">
              <Sliders className="w-3.5 h-3.5" />
              <span>Awtomatikong mag-a-update sa lahat ng modules:</span>
            </div>
            <p className="leading-relaxed">
              Kapag pinalitan ninyo ang oras, susunod ang Watermarking, Cut-off Checking sa Upload Attendance, at Header Clock sa inyong napiling petsa at oras.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row gap-2 shrink-0 font-mono">
          <button
            type="button"
            onClick={handleResetToRealTime}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>I-RESET SA REAL-TIME PST</span>
          </button>

          <button
            type="button"
            onClick={handleApplyNewTime}
            className="flex-1 py-2.5 px-3 rounded-xl fluid-btn-emerald text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all uppercase"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>I-APPLY ANG BAGONG ORAS</span>
          </button>
        </div>

      </div>
    </div>
  );
};
