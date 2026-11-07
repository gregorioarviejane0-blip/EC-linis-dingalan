import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Send,
  Lock,
  EyeOff,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  MessageSquare,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  Info,
  ChevronDown,
  Building2,
  Smartphone,
} from 'lucide-react';
import { AnonymousMessage } from '../types';
import { api } from '../services/api';
import { formatPhilippineDateTime } from '../utils/philippineClock';

const MAX_DAILY_ANONYMOUS_LIMIT = 3;

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `ld_anon_msg_count_${year}-${month}-${day}`;
}

function getDailyCount(): number {
  try {
    const key = getTodayKey();
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function incrementDailyCount(): number {
  try {
    const key = getTodayKey();
    const current = getDailyCount();
    const next = current + 1;
    localStorage.setItem(key, String(next));
    return next;
  } catch {
    return 0;
  }
}

interface SendAnonymousMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  referencedPhotoUrl?: string;
  referencedActivityTitle?: string;
  referencedLocation?: string;
  onSuccessSent?: (message: AnonymousMessage) => void;
}

export const SendAnonymousMessageModal: React.FC<SendAnonymousMessageModalProps> = ({
  isOpen,
  onClose,
  referencedPhotoUrl,
  referencedActivityTitle,
  referencedLocation,
  onSuccessSent,
}) => {
  const [category, setCategory] = useState<AnonymousMessage['category']>('report');
  const [priority, setPriority] = useState<AnonymousMessage['priority']>('normal');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dailyUsage, setDailyUsage] = useState<number>(() => getDailyCount());

  useEffect(() => {
    if (isOpen) {
      setDailyUsage(getDailyCount());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLimitReached = dailyUsage >= MAX_DAILY_ANONYMOUS_LIMIT;
  const remainingQuota = Math.max(0, MAX_DAILY_ANONYMOUS_LIMIT - dailyUsage);

  const categoryOptions: {
    id: AnonymousMessage['category'];
    labelTagalog: string;
    description: string;
    icon: any;
  }[] = [
    {
      id: 'report',
      labelTagalog: 'Ulat / Sumbong ukol sa Gawain o Area',
      description: 'May napansing iregularidad, basura na naiwan, o problema sa lugar.',
      icon: AlertTriangle,
    },
    {
      id: 'feedback',
      labelTagalog: 'Mungkahi / Rekomendasyon',
      description: 'Mga ideya para mas mapaganda ang daloy ng programa at kalinisan.',
      icon: Sparkles,
    },
    {
      id: 'allowance_inquiry',
      labelTagalog: 'Katanungan ukol sa Stipend / Attendance',
      description: 'Ligtas na magtanong ukol sa allowance schedule o log compliance.',
      icon: HelpCircle,
    },
    {
      id: 'emergency',
      labelTagalog: 'Kagipitan / Emergency sa Field',
      description: 'Agarang pabatid para sa tulong o aksyon ng Admin sa field.',
      icon: Shield,
    },
    {
      id: 'general',
      labelTagalog: 'Iba pang Kompidensiyal na Pabatid',
      description: 'Pangkalahatang mensahe o ulat direkta para sa Admin.',
      icon: MessageSquare,
    },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      setErrorMessage('Nakaabot ka na sa limit na 3 anonymous messages ngayong araw para sa device na ito. Pakiusap na maghintay hanggang bukas.');
      return;
    }
    if (!messageText.trim()) {
      setErrorMessage('Pakiusap isulat ang inyong anonymous na mensahe.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const selectedCat = categoryOptions.find((c) => c.id === category);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dtInfo = formatPhilippineDateTime(now);

    const payload: Omit<AnonymousMessage, 'id'> = {
      senderAlias: `Anonymous Participant #ANON-${randomSuffix}`,
      departmentName: departmentName.trim() || undefined,
      category,
      categoryLabelTagalog: selectedCat?.labelTagalog || 'Pangkalahatang Pabatid',
      priority,
      message: messageText.trim(),
      referencedPhotoUrl,
      referencedActivityTitle,
      referencedLocation,
      timestamp: now.toISOString(),
      localPhTime: dtInfo.fullCombinedTagalog,
      status: 'unread',
    };

    try {
      const res = await api.sendAnonymousMessage(payload);
      if (res.success && res.message) {
        // Increment daily count per mobile device
        incrementDailyCount();
        setDailyUsage(getDailyCount());

        setIsSuccess(true);
        if (onSuccessSent) {
          onSuccessSent(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Nagkaroon ng aberya sa pagpapadala ng anonymous message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setMessageText('');
    setDepartmentName('');
    setCategory('report');
    setPriority('normal');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 xs:p-3 sm:p-6 bg-slate-950/92 backdrop-blur-xl overflow-hidden sm:overflow-y-auto animate-fadeIn select-none scrollbar-none">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/60 rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.25)] overflow-hidden my-auto flex flex-col max-h-[96dvh] sm:max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-800 bg-slate-950/95 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.2 rounded-full text-[8.5px] sm:text-[9px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-widest">
                  100% Anonymous & Secure
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-black text-white tracking-tight leading-tight mt-0.5 truncate">
                Magpadala ng Anonymous Message sa Admin
              </h3>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-2.5 sm:p-5 overflow-hidden sm:overflow-y-auto space-y-2 sm:space-y-4 flex-1 text-left min-h-0 overscroll-contain pb-2.5 sm:pb-6 scrollbar-none">
          {isSuccess ? (
            <div className="text-center py-4 sm:py-8 space-y-2 sm:space-y-4 animate-scaleIn">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Ligtas na Naisumite sa Admin Inbox
                </span>
                <h4 className="text-sm sm:text-xl font-black text-white">
                  Matagumpay na Naipadala ang Anonymous Message!
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans">
                  Ang inyong ulat ay ligtas nang nakarating sa <strong>Admin Inbox</strong>. Hindi kailanman malalaman o maipapakita sa Admin ang inyong pangalan, profile, o pagkakakilanlan.
                </p>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 text-[10px] sm:text-xs font-mono text-left space-y-1 max-w-md mx-auto">
                <div className="flex justify-between text-slate-400">
                  <span>Sender Alias:</span>
                  <span className="text-emerald-400 font-bold">ANONYMOUS (PROTECTED)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Access Permission:</span>
                  <span className="text-emerald-300 font-bold">Admin Accounts Only</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-cyan-300 font-bold">QUEUED FOR ADMIN REVIEW</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full max-w-md mx-auto py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                Isara (Done)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-2.5 sm:space-y-4">
              {/* Daily Device Limit Badge & Alert */}
              <div className={`p-3 rounded-xl border transition-all ${
                isLimitReached
                  ? 'bg-rose-950/90 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <Smartphone className={`w-4 h-4 ${isLimitReached ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                    <span className="font-bold text-white">Device Daily Limit:</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isLimitReached
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-400'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {dailyUsage} / {MAX_DAILY_ANONYMOUS_LIMIT} naipasa ngayong araw
                  </span>
                </div>
                {isLimitReached ? (
                  <p className="mt-2 text-[11px] text-rose-200 leading-relaxed font-sans flex items-start space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Nakaabot ka na sa limit (3/3) ngayong araw.</strong> Ang bawat mobile device ay pinahihintulutan lamang magpadala ng hanggang 3 anonymous messages kada araw. Pakiusap na maghintay hanggang bukas.
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10.5px] text-slate-400 font-sans">
                    Mayroon ka pang <strong>{remainingQuota} natitirang anonymous message submission</strong> ngayong araw para sa device na ito.
                  </p>
                )}
              </div>

              {/* Category Selector */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[10px] sm:text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
                  <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  <span>1. Uri o Paksa ng Anonymous Message <span className="text-rose-400">*</span></span>
                </label>

                {/* Mobile Dropdown */}
                <div className="sm:hidden relative">
                  <select
                    value={category}
                    disabled={isLimitReached || isSubmitting}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full py-1.5 px-3 pl-8 rounded-xl bg-slate-950/90 border border-amber-500/50 text-white text-xs font-mono font-bold focus:border-amber-400 focus:outline-none appearance-none cursor-pointer shadow-inner disabled:opacity-50"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.labelTagalog}
                      </option>
                    ))}
                  </select>
                  <FileText className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Desktop Grid */}
                <div className="hidden sm:grid grid-cols-2 gap-2">
                  {categoryOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = category === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => !isLimitReached && !isSubmitting && setCategory(opt.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                          isLimitReached ? 'opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-800' :
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs leading-tight">{opt.labelTagalog}</p>
                          <p className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-1">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Department Name Input */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[10px] sm:text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. Pangalan ng Departamento (Department Name)</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40">
                    OPSYONAL (OPTIONAL)
                  </span>
                </label>
                <input
                  type="text"
                  value={departmentName}
                  disabled={isLimitReached || isSubmitting}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="hal. MENRO, PESO, MHO, Accounting, Barangay Hall, atbp. (Iwanang bakante kung ayaw ilagay)"
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-cyan-400 text-white placeholder-slate-500 text-xs font-mono shadow-inner disabled:opacity-50"
                />
              </div>

              {/* Priority / Urgency Tag */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[10px] sm:text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center justify-between">
                  <span>3. Antas ng Kahalagahan (Priority)</span>
                  <span className="text-[9.5px] text-slate-400 font-normal hidden xs:inline">Pumili ng angkop na antas</span>
                </label>

                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    disabled={isLimitReached || isSubmitting}
                    onClick={() => setPriority('normal')}
                    className={`py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-lg sm:rounded-xl border text-center font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50 ${
                      priority === 'normal'
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    Normal
                  </button>

                  <button
                    type="button"
                    disabled={isLimitReached || isSubmitting}
                    onClick={() => setPriority('urgent')}
                    className={`py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-lg sm:rounded-xl border text-center font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50 ${
                      priority === 'urgent'
                        ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    Urgent
                  </button>

                  <button
                    type="button"
                    disabled={isLimitReached || isSubmitting}
                    onClick={() => setPriority('confidential')}
                    className={`py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-lg sm:rounded-xl border text-center font-bold text-[10px] sm:text-xs transition-all cursor-pointer disabled:opacity-50 ${
                      priority === 'confidential'
                        ? 'bg-purple-500/25 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    Kumpidensiyal
                  </button>
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[10px] sm:text-xs font-mono font-bold text-slate-200 uppercase tracking-wide flex items-center justify-between">
                  <span>4. Nilalaman ng Anonymous Mensahe <span className="text-rose-400">*</span></span>
                  <span className="text-[9.5px] font-mono text-amber-400">Hindi makikita ang nag-send</span>
                </label>

                <textarea
                  value={messageText}
                  disabled={isLimitReached || isSubmitting}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={isLimitReached ? "Naabot na ang 3/3 daily limit sa device na ito..." : "Isulat dito ang inyong ulat, obserbasyon, mungkahi, o mensahe para sa Admin. Huwag mag-alala, walang makakaalam kung sino ang nagpadala nito..."}
                  rows={4}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-950/90 border border-slate-700 focus:border-amber-400 text-white placeholder-slate-500 text-xs sm:text-sm font-sans leading-relaxed shadow-inner resize-none min-h-[105px] sm:min-h-[135px] disabled:opacity-50"
                />
              </div>

              {errorMessage && (
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-[10.5px] sm:text-xs flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5 sm:pt-2 font-mono">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-2 sm:py-3 rounded-xl fluid-btn-slate text-slate-200 text-[11px] sm:text-xs font-bold transition-all cursor-pointer border border-slate-700/60 active:scale-95 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isLimitReached || !messageText.trim()}
                  className="py-2 sm:py-3 rounded-xl fluid-btn-amber text-slate-950 text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50 border border-amber-300/40 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : isLimitReached ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                      <span className="tracking-tight">Limit Reached (3/3 Today)</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                      <span className="tracking-tight">Send to Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
