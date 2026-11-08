import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'banner' | 'button' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running inside standalone app, show subtle status badge or nothing
  if (isInstalled && variant !== 'badge') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>MOBILE APP MODE</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div
          onClick={handleClick}
          className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/40 hover:border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all cursor-pointer ${className}`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4 text-slate-950" />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block leading-tight">
                Mobile App Installable
              </span>
              <span className="text-xs font-black text-white block truncate">
                I-INSTALL SA TELEPONO (REAL MOBILE APP)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/40 transition-colors shrink-0">
            <span>INSTALL</span>
            <Smartphone className="w-3.5 h-3.5" />
          </div>
        </div>

        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 text-xs font-bold font-mono tracking-wide transition-all shadow-sm cursor-pointer ${className}`}
        title="I-install ang application sa inyong cellphone bilang real mobile app"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
        <span>INSTALL APP</span>
      </button>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
