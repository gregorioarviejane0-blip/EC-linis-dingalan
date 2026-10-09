import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';
import { useDingalanClock, isDingalanTimeOverridden } from '../utils/philippineClock';
import { TimeAdjusterModal } from './TimeAdjusterModal';
import {
  ShieldCheck,
  QrCode,
  Users,
  Calendar,
  FileText,
  Lock,
  HardDrive,
  Cpu,
  Clock,
  Sparkles,
  Terminal,
  LogIn,
  LogOut,
  UserCheck,
  Bell,
  Images,
  Upload,
  EyeOff,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenLoginModal: () => void;
  onOpenPersonalQrModal?: () => void;
  onLogout?: () => void;
  pendingApprovalsCount?: number;
  onOpenApprovalsModal?: () => void;
  attendancesCount?: number;
  onOpenAccomplishmentModal?: () => void;
  anonymousMessagesCount?: number;
  onOpenAnonymousInboxModal?: () => void;
  onOpenScanQrModal?: () => void;
  onOpenManualUploadModal?: () => void;
  onOpenGenerateQrModal?: () => void;
  onOpenEventNoticeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLoginModal,
  onOpenPersonalQrModal,
  onLogout,
  pendingApprovalsCount = 0,
  onOpenApprovalsModal,
  attendancesCount = 0,
  onOpenAccomplishmentModal,
  anonymousMessagesCount = 0,
  onOpenAnonymousInboxModal,
  onOpenScanQrModal,
  onOpenManualUploadModal,
  onOpenGenerateQrModal,
  onOpenEventNoticeModal,
}) => {
  const clock = useDingalanClock();
  const phTime = clock.time;
  const isAdminOrSuperAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const isSuperadmin = currentUser.role === 'superadmin';
  const [isTimeAdjusterOpen, setIsTimeAdjusterOpen] = useState(false);

  return (
    <header className="sticky top-1 sm:top-2 z-40 px-1.5 sm:px-4 w-full max-w-full overflow-hidden transition-all">
      {/* Floating Frosted Glassmorphism Navigation Capsule */}
      <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] rounded-full px-2.5 sm:px-5 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2.5 text-slate-100 w-full">
        {/* Left Section: eC access Logo & System Name */}
        <div
          onClick={() => setActiveTab('homepage')}
          className="flex items-center space-x-1 sm:space-x-2.5 cursor-pointer shrink-0 group select-none"
        >
          {/* Official eC access Logo */}
          <div className="flex items-center">
            <svg
              viewBox="0 0 205 64"
              className="h-4.5 xs:h-5 sm:h-7 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="header-c-letter-shimmer" x1="-100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00c875" />
                  <stop offset="35%" stopColor="#00c875" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="65%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#00c875" />
                  <animate attributeName="x1" from="-120%" to="180%" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="x2" from="-20%" to="280%" dur="2.8s" repeatCount="indefinite" />
                </linearGradient>

                <linearGradient id="header-access-letter-shimmer" x1="-100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00c875" />
                  <stop offset="35%" stopColor="#00c875" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="65%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#00c875" />
                  <animate attributeName="x1" from="-120%" to="180%" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="x2" from="-20%" to="280%" dur="2.8s" repeatCount="indefinite" />
                </linearGradient>

                <linearGradient id="header-e-letter-shimmer" x1="-100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#19255a" />
                  <stop offset="35%" stopColor="#19255a" />
                  <stop offset="50%" stopColor="#93c5fd" />
                  <stop offset="65%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#19255a" />
                  <animate attributeName="x1" from="-120%" to="180%" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="x2" from="-20%" to="280%" dur="2.8s" repeatCount="indefinite" />
                </linearGradient>
              </defs>

              <path
                d="M34 60 C18 60 5 47 5 31 C5 15 18 2 34 2 C47 2 57 10 61 22 L47 26 C45 18 40 14 34 14 C24 14 17 22 17 31 C17 41 24 48 34 48 C40 48 45 44 47 37 L61 41 C57 52 47 60 34 60 Z"
                fill="#181818"
                transform="translate(2, 2.5)"
                opacity="0.75"
              />
              <path
                d="M34 60 C18 60 5 47 5 31 C5 15 18 2 34 2 C47 2 57 10 61 22 L47 26 C45 18 40 14 34 14 C24 14 17 22 17 31 C17 41 24 48 34 48 C40 48 45 44 47 37 L61 41 C57 52 47 60 34 60 Z"
                fill="url(#header-c-letter-shimmer)"
              />
              <path
                d="M32 20 C24 20 18.5 25.5 18.5 33 C18.5 40.5 24 46 32 46 C37.5 46 41.5 43 43.5 39.5 L37.5 36.5 C36.5 38 34.5 39.5 32 39.5 C28.5 39.5 25.5 37 25.5 34 L45 34 C45.2 33 45.2 32 45.2 31 C45.2 24.5 39.5 20 32 20 Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <path
                d="M32 21 C25 21 20 26 20 33 C20 40 25 45 32 45 C37 45 40.5 42.5 42.5 39 L37.5 36.5 C36.5 38 34.5 39 32 39 C29 39 26.5 37 26.5 34.5 L44 34.5 C44.1 33.6 44.1 32.8 44.1 32 C44.1 25.5 39 21 32 21 Z M26.5 30.5 C27 27.5 29.2 25.5 32 25.5 C35 25.5 37.5 27.5 37.8 30.5 L26.5 30.5 Z"
                fill="url(#header-e-letter-shimmer)"
              />
              <text
                x="68"
                y="46"
                fill="#1f1f1f"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                fontSize="38"
                letterSpacing="-1.8"
                opacity="0.8"
                dx="2"
                dy="2.5"
              >
                access
              </text>
              <text
                x="68"
                y="46"
                fill="url(#header-access-letter-shimmer)"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                fontSize="38"
                letterSpacing="-1.8"
              >
                access
              </text>
            </svg>
          </div>

          <div className="border-l border-slate-700/60 pl-1.5 sm:pl-2">
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              <span className="font-extrabold text-[11px] xs:text-xs sm:text-sm tracking-tight text-white uppercase group-hover:text-emerald-300 transition-colors">
                <span className="hidden xs:inline">Linis </span>Dingalan
              </span>
              <span className="text-[9px] xs:text-[10px] font-mono font-bold text-cyan-400">
                EC
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono hidden sm:block">
              PESO & MENRO Dingalan, Aurora
            </p>
          </div>
        </div>

        {/* Center Section: Compact Kinetic Navigation Pills (Slimmer for Computer/Desktop Fit) */}
        <nav className="hidden xl:flex items-center space-x-0.5 xl:space-x-1 font-bold font-mono relative">
          {[
            { id: 'homepage', label: 'Overview', icon: Sparkles },
            { id: 'portal', label: 'Terminal', fullLabel: 'Field Terminal', icon: QrCode },
            { id: 'beneficiaries', label: 'Masterlist', icon: Users },
            { id: 'activities', label: 'Programs', icon: Calendar },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'storage', label: 'Prune', icon: HardDrive },
            { id: 'architecture', label: 'DDL', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-1.5 py-0.5 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full flex items-center space-x-1 cursor-pointer select-none transition-colors duration-200 group text-[10px] lg:text-[10px] xl:text-[10.5px] 2xl:text-xs ${
                  isActive
                    ? 'text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="kineticHeaderTabPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5),0_2px_6px_rgba(0,0,0,0.35)] border border-emerald-300"
                    transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1">
                  <Icon
                    className={`w-3 h-3 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  {/* Kinetic Animated Button Text */}
                  <span
                    className={`inline-block transition-all duration-200 select-none ${
                      isActive
                        ? 'font-black text-slate-950 tracking-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)] kinetic-text-float'
                        : 'text-slate-300 font-bold group-hover:text-white group-hover:tracking-wider group-hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="hidden 2xl:inline">{tab.fullLabel || tab.label}</span>
                    <span className="2xl:hidden">{tab.label}</span>
                  </span>
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* Right Section: Compact Action Pills (Fitted & Smaller so all buttons never overflow on desktop) */}
        <div className="flex items-center space-x-1 lg:space-x-1 shrink-0">
          {/* Live Clock: Pwedeng palitan sa Admin Account lamang */}
          {isAdminOrSuperAdmin ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setIsTimeAdjusterOpen(true)}
              className={`hidden lg:flex items-center space-x-1 text-[9.5px] lg:text-[9px] xl:text-[10px] font-mono px-1.5 py-0.5 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full shadow-inner select-none transition-all duration-200 cursor-pointer group shrink-0 ${
                isDingalanTimeOverridden()
                  ? 'text-amber-300 bg-slate-950/95 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'text-emerald-300 bg-slate-950/90 border border-emerald-500/50 hover:border-emerald-400/80 hover:bg-slate-900'
              }`}
              title="Admin Control: Pindutin para palitan o i-adjust ang opisyal na oras (PST)"
            >
              <Clock className={`w-2.5 h-2.5 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 shrink-0 ${isDingalanTimeOverridden() ? 'text-amber-400 animate-pulse' : 'text-emerald-400 animate-pulse'}`} />
              <div className="flex items-center space-x-1 font-bold">
                <span className={`hidden 2xl:inline ${isDingalanTimeOverridden() ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {clock.dayOfWeek}, {clock.month} {clock.dayNum} •
                </span>
                <span className="text-white font-mono font-extrabold tracking-wide">
                  {clock.timeWithSeconds}
                </span>
                <span className="ml-1 text-[8px] lg:text-[7.5px] xl:text-[8px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 uppercase font-black tracking-wider transition-all duration-200 shadow-sm">
                  PALITAN
                </span>
                {isDingalanTimeOverridden() ? (
                  <span className="ml-0.5 text-[7px] px-1 py-0.2 bg-amber-500/25 text-amber-200 border border-amber-400/40 rounded uppercase font-black">
                    MANUAL
                  </span>
                ) : null}
              </div>
            </motion.button>
          ) : (
            <div
              className="hidden lg:flex items-center space-x-1 text-[9.5px] lg:text-[9px] xl:text-[10px] font-mono px-1.5 py-0.5 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full shadow-inner select-none shrink-0 text-emerald-300 bg-slate-950/90 border border-emerald-500/50"
              title="Opisyal na Oras (PST)"
            >
              <Clock className="w-2.5 h-2.5 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 shrink-0 text-emerald-400 animate-pulse" />
              <div className="flex items-center space-x-1 font-bold">
                <span className="hidden 2xl:inline text-emerald-400">
                  {clock.dayOfWeek}, {clock.month} {clock.dayNum} •
                </span>
                <span className="text-white font-mono font-extrabold tracking-wide">
                  {clock.timeWithSeconds}
                </span>
              </div>
            </div>
          )}

          {/* Generate Event QR Button */}
          {onOpenGenerateQrModal && (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              onClick={onOpenGenerateQrModal}
              className="relative overflow-hidden group px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full bg-gradient-to-r from-[#00e599] via-[#00d9b4] to-[#00d4ff] hover:from-[#00f2a5] hover:to-[#22e1ff] text-slate-950 font-mono font-bold text-[9.5px] sm:text-[10px] xl:text-[10.5px] flex items-center justify-center space-x-1 shadow-[0_0_10px_rgba(0,229,153,0.35)] cursor-pointer shrink-0 border border-emerald-300/40 select-none"
              title="Generate Cleanup Event QR Code & Paalala"
            >
              <QrCode className="w-3 h-3 sm:w-2.5 sm:h-2.5 xl:w-3 xl:h-3 text-slate-950 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-black tracking-tight group-hover:tracking-wider transition-all duration-200">
                <span className="hidden sm:inline">Event </span>QR
              </span>
            </motion.button>
          )}

          {/* Anonymous Messages Inbox Button */}
          {isAdminOrSuperAdmin && onOpenAnonymousInboxModal && (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              onClick={onOpenAnonymousInboxModal}
              className="relative overflow-hidden group px-1.5 xs:px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-mono font-bold text-[9.5px] sm:text-[10px] xl:text-[10.5px] flex items-center justify-center space-x-1 shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer shrink-0 select-none"
              title="Tingnan ang mga Anonymous Messages at Reports mula sa field (Admin Only)"
            >
              <EyeOff className="w-3 h-3 sm:w-2.5 sm:h-2.5 xl:w-3 xl:h-3 text-amber-400 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-bold tracking-tight hidden sm:inline">
                <span className="hidden 2xl:inline">Anonymous </span>Inbox
              </span>
              {anonymousMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[8px] leading-none shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                  {anonymousMessagesCount}
                </span>
              )}
            </motion.button>
          )}

          {/* Accomplishment Attendance Records Button */}
          {isAdminOrSuperAdmin && onOpenAccomplishmentModal && (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              onClick={onOpenAccomplishmentModal}
              className="relative overflow-hidden group px-1.5 xs:px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-mono font-bold text-[9.5px] sm:text-[10px] xl:text-[10.5px] flex items-center justify-center space-x-1 shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer shrink-0 select-none"
              title="Tingnan ang lahat ng accomplishment photos at attendance records ng mga naglinis"
            >
              <Images className="w-3 h-3 sm:w-2.5 sm:h-2.5 xl:w-3 xl:h-3 text-emerald-400 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-bold tracking-tight hidden sm:inline">
                <span className="hidden 2xl:inline">Accomplishment </span>Records
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black text-[8px] leading-none shadow-[0_0_6px_rgba(52,211,153,0.6)]">
                {attendancesCount}
              </span>
            </motion.button>
          )}

          {/* Log Out Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
            onClick={onLogout || onOpenLoginModal}
            className="group px-1.5 xs:px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full bg-slate-900/80 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-500/60 text-slate-300 hover:text-rose-200 font-bold text-[9.5px] sm:text-[10px] xl:text-[10.5px] tracking-wide shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-colors flex items-center justify-center space-x-1 shrink-0 cursor-pointer select-none"
            title="Mag-log out sa system"
          >
            <LogOut className="w-3 h-3 sm:w-2.5 sm:h-2.5 xl:w-3 xl:h-3 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-rose-400" />
            <span className="font-bold tracking-tight hidden sm:inline">
              Log Out
            </span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar - Compact Responsive Grid with Kinetic Tap Feedback */}
      <div className="grid grid-cols-4 sm:flex sm:items-center sm:justify-start lg:hidden gap-1 py-1 px-0.5 mt-1 text-[9.5px] xs:text-[10.5px] font-mono font-bold select-none w-full">
        {[
          { id: 'homepage', label: 'Overview', icon: Sparkles },
          { id: 'portal', label: 'Terminal', icon: QrCode },
          { id: 'beneficiaries', label: 'Masterlist', icon: Users },
          { id: 'activities', label: 'Programs', icon: Calendar },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'storage', label: 'Prune', icon: HardDrive },
          { id: 'architecture', label: 'DDL', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-1 xs:px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-full border transition-all flex items-center justify-center space-x-0.5 xs:space-x-1 touch-manipulation cursor-pointer shadow leading-tight ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                  : 'bg-slate-900/90 backdrop-blur-lg text-slate-300 border-slate-700/70 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 shrink-0" />
              <span className={`truncate tracking-tight transition-all duration-200 ${isActive ? 'font-black kinetic-text-glow' : 'group-hover:tracking-wider'}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {isTimeAdjusterOpen && (
        <TimeAdjusterModal
          isOpen={isTimeAdjusterOpen}
          onClose={() => setIsTimeAdjusterOpen(false)}
        />
      )}
    </header>
  );
};
