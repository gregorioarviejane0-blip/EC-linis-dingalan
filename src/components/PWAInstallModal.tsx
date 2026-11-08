import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  WifiOff,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.3)] overflow-hidden my-auto flex flex-col text-left">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 block">
                Official PWA Installation
              </span>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                I-install bilang Mobile App
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Isara"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          {/* App Card Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/30 flex items-center space-x-4 shadow-inner">
            <img
              src="/pwa-192x192.png"
              alt="Linis Dingalan Icon"
              className="w-16 h-16 rounded-2xl shadow-lg border border-emerald-400/50 p-1 bg-slate-950 object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">LINIS DINGALAN EC</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  v2026.1
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5 line-clamp-2">
                PESO & MENRO Dingalan Official Mobile Attendance & Environmental Compliance App
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Dingalan LGU Platform</span>
              </div>
            </div>
          </div>

          {/* Already installed state */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs font-mono space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-sm">
                Naka-install na ang App sa Teleponong Ito!
              </p>
              <p className="text-[11px] text-slate-300">
                Binuksan mo na ang app bilang isang ganap na Standalone Mobile Application. May icon na ito sa iyong Home Screen.
              </p>
            </div>
          ) : (
            <>
              {/* Direct 1-Click Install Button for Android / Chrome / Supported Browsers */}
              {isInstallable && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-4 rounded-2xl fluid-btn-emerald text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center space-x-2 transition-transform transform active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <Download className="w-4 h-4" />
                    <span>I-INSTALL SA TELEPONO NGAYON (1-CLICK)</span>
                  </button>
                  <p className="text-[10px] font-mono text-center text-slate-400">
                    Lilitaw ang confirmation prompt ng inyong cellphone. Piliin ang &quot;Install&quot;.
                  </p>
                </div>
              )}

              {/* iOS Safari Instructions */}
              {isIOS && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase">
                    <Share className="w-4 h-4 text-cyan-400" />
                    <span>Paano i-install sa iPhone / iPad (iOS Safari):</span>
                  </div>
                  <ol className="space-y-2.5 text-xs text-slate-300 font-sans">
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Pindutin ang <strong>Share button</strong>{' '}
                        <Share className="w-3.5 h-3.5 inline text-cyan-400 mx-0.5" /> sa ilalim ng Safari.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        I-scroll pababa at piliin ang{' '}
                        <strong className="text-white">Add to Home Screen</strong>{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Pindutin ang <strong className="text-emerald-400">Add</strong> sa kanang itaas. Pagkatapos, lilitaw na ang Linis Dingalan App icon sa iyong iPhone screen!
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* General Android / Chrome Manual Steps (if 1-click not yet triggered by browser) */}
              {!isIOS && !isInstallable && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Paano i-install sa Android (Chrome / Edge / Samsung):</span>
                  </div>
                  <ol className="space-y-2.5 text-xs text-slate-300 font-sans">
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Pindutin ang <strong>tatlong tuldok (⋮)</strong> sa kanang itaas o ibaba ng inyong browser.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Piliin ang <strong className="text-white">&quot;Install app&quot;</strong> o{' '}
                        <strong className="text-white">&quot;Add to Home screen&quot;</strong>.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Pindutin ang <strong>Install</strong> upang mailagay ang official app icon sa inyong cellphone apps list!
                      </span>
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}

          {/* Benefits Feature Grid */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Bakit magandang i-install bilang Mobile App?
            </span>
            <div className="grid grid-cols-1 gap-2 text-[11px] font-sans">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">Tunay na Fullscreen App</strong>
                  <span className="text-slate-400">Walang browser URL bar na humaharang sa screen habang nag-i-scan.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2.5">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">Offline Attendance Queue</strong>
                  <span className="text-slate-400">Mabilis magpasa at mag-save ng attendance picture kahit walang signal sa dalampasigan.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">1-Tap Direct Home Screen Access</strong>
                  <span className="text-slate-400">Hindi na kailangang i-type ang mahabang web link; pindutin lang ang app icon sa phone.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
            <span>Bayan ng Dingalan, Aurora</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Isara
          </button>
        </div>
      </div>
    </div>
  );
};
