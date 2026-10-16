import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // If prompt is available (Android/Chrome/Desktop), show install button
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-1.5 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
        title="I-install ang Linis Dingalan App sa iyong device"
      >
        <Download className="w-3.5 h-3.5 text-slate-950" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // For iOS or general fallback when installable event hasn't fired yet
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="px-3 py-1.5 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
        title="Gabay sa pag-install ng App sa Mobile"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">I-install ang App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">I-install ang Linis Dingalan</h3>
                <p className="text-[11px] font-mono text-emerald-400">Mobile Progressive Web App</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <p>
                <strong>Para sa Android / Chrome / Edge:</strong><br />
                I-click ang menu (⋮) ng browser at piliin ang <em>"Install app"</em> o <em>"Add to Home screen"</em>.
              </p>
              <p>
                <strong>Para sa iPhone / iPad (Safari):</strong><br />
                1. I-tap ang <strong>Share</strong> button sa ibaba ng Safari.<br />
                2. Mag-scroll pababa at i-tap ang <strong>"Add to Home Screen"</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-colors cursor-pointer"
            >
              Naiintindihan ko
            </button>
          </div>
        </div>
      )}
    </>
  );
};
