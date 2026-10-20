import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Activity, Beneficiary, AttendanceRecord, User, UserRole, EventQrBroadcast } from '../types';
import {
  Camera,
  QrCode,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Compass,
  Layers,
  Radio,
  Clock,
  ChevronRight,
  ExternalLink,
  Lock,
  Eye,
  Sliders,
  Play,
  RotateCw,
  Images,
  Upload,
  FileText,
  Wrench,
  Shirt,
  Coffee,
  Calendar,
  Edit3,
  Save,
  Maximize2,
  Minimize2,
  Globe,
  Navigation,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useDingalanClock } from '../utils/philippineClock';

export interface MapSector {
  id: string;
  name: string;
  subName: string;
  lat: string;
  lng: string;
  coordsText: string;
  elevation: string;
  status: string;
  type: 'hub' | 'port' | 'coastal' | 'beach' | 'delta' | 'boundary' | 'marine';
  color: string;
  topPct: number;
  leftPct: number;
  description: string;
}

export const DINGALAN_MAP_SECTORS: MapSector[] = [
  {
    id: 'paltic',
    name: 'PALTIC',
    subName: 'Feeder Port & Rock Sea Wall',
    lat: '15.4225° N',
    lng: '121.4250° E',
    coordsText: '15.4225° N, 121.4250° E',
    elevation: '12.0m MSL',
    status: 'Scheduled / Ongoing Clean-up',
    type: 'port',
    color: '#10b981', // emerald
    topPct: 7.5,
    leftPct: 56,
    description: 'Dingalan Feeder Port, Lighthouse, White Beach, and shoreline rock seawall inspection.',
  },
  {
    id: 'dingalan',
    name: 'Dingalan (Poblacion)',
    subName: 'Municipal Center & MENRO HQ',
    lat: '15.3942° N',
    lng: '121.4011° E',
    coordsText: '15.3942° N, 121.4011° E',
    elevation: '8.5m MSL',
    status: 'Operational HQ & MENRO Hub',
    type: 'hub',
    color: '#06b6d4', // cyan
    topPct: 11.5,
    leftPct: 40,
    description: 'Municipal Center, MENRO Office, Central Public Market at Linis Dingalan command base.',
  },
  {
    id: 'butas',
    name: 'BUTAS NA BATO',
    subName: 'Coastal Archway & Coral Reefs',
    lat: '15.3850° N',
    lng: '121.3980° E',
    coordsText: '15.3850° N, 121.3980° E',
    elevation: '4.2m MSL',
    status: 'Protected Coastal Area',
    type: 'coastal',
    color: '#38bdf8', // sky
    topPct: 15.5,
    leftPct: 31,
    description: 'Scenic natural rock sea cave at coastal trail buffer zone.',
  },
  {
    id: 'bay',
    name: 'Dingalan Bay',
    subName: 'Pacific Ocean Marine Zone',
    lat: '15.3400° N',
    lng: '121.4300° E',
    coordsText: '15.3400° N, 121.4300° E',
    elevation: '0.0m MSL (Marine)',
    status: 'Pacific Marine Sanctuary',
    type: 'marine',
    color: '#60a5fa', // blue
    topPct: 37.5,
    leftPct: 47,
    description: 'Vast deep-blue Pacific bay, municipal fishing grounds, and coastal current surveillance.',
  },
  {
    id: 'cabog',
    name: 'CABOG (MATAWE)',
    subName: 'Intertidal Beach & Rock Pools',
    lat: '15.3350° N',
    lng: '121.3850° E',
    coordsText: '15.3350° N, 121.3850° E',
    elevation: '5.0m MSL',
    status: 'High Waste Monitoring Zone',
    type: 'beach',
    color: '#f59e0b', // amber
    topPct: 36.5,
    leftPct: 29.5,
    description: 'Matawe tidal rock formations, popular tourist coastline, and mangrove conservation sector.',
  },
  {
    id: 'ibona',
    name: 'IBONA',
    subName: 'River Delta & Mangrove Estuary',
    lat: '15.2850° N',
    lng: '121.3720° E',
    coordsText: '15.2850° N, 121.3720° E',
    elevation: '6.0m MSL',
    status: 'Active River Cleanup',
    type: 'delta',
    color: '#ec4899', // pink
    topPct: 53.5,
    leftPct: 28.5,
    description: 'Major river delta flowing into Dingalan Bay; key watershed and plastic interceptor trap.',
  },
  {
    id: 'umiray',
    name: 'UMIRAY (MALAMIG)',
    subName: 'Aurora-Quezon Boundary',
    lat: '15.2100° N',
    lng: '121.3500° E',
    coordsText: '15.2100° N, 121.3500° E',
    elevation: '7.5m MSL',
    status: 'Coastal Watch Sentinel',
    type: 'boundary',
    color: '#a855f7', // purple
    topPct: 89.5,
    leftPct: 28.5,
    description: 'Southern tip of Dingalan municipality bordering General Nakar; coastal defense and beach monitoring.',
  },
];

interface CinematicBentoHomepageProps {
  currentUser: User;
  activities: Activity[];
  beneficiaries: Beneficiary[];
  attendances: AttendanceRecord[];
  onNavigate: (tab: string) => void;
  onOpenLoginModal: () => void;
  onOpenDigitalIdModal: (bene: Beneficiary) => void;
  onOpenAccomplishmentModal?: () => void;
  onOpenScanQrModal?: () => void;
  onOpenManualUploadModal?: () => void;
  onOpenGenerateQrModal?: () => void;
  onOpenEventNoticeModal?: () => void;
  onOpenPersonalQrModal?: () => void;
  eventBroadcast?: EventQrBroadcast | null;
}

export const CinematicBentoHomepage: React.FC<CinematicBentoHomepageProps> = ({
  currentUser,
  activities,
  beneficiaries,
  attendances,
  onNavigate,
  onOpenLoginModal,
  onOpenDigitalIdModal,
  onOpenAccomplishmentModal,
  onOpenScanQrModal,
  onOpenManualUploadModal,
  onOpenGenerateQrModal,
  onOpenEventNoticeModal,
  onOpenPersonalQrModal,
  eventBroadcast,
}) => {
  const { time: phTime } = useDingalanClock();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [radarAngle, setRadarAngle] = useState(0);
  const [watermarkSimulated, setWatermarkSimulated] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('paltic');
  const [mapMode, setMapMode] = useState<'satellite' | 'google-live'>('satellite');
  const [radarSweepEnabled, setRadarSweepEnabled] = useState(true);
  const [isFullMapModalOpen, setIsFullMapModalOpen] = useState(false);

  const currentSector = useMemo(() => {
    return DINGALAN_MAP_SECTORS.find((s) => s.id === selectedSectorId) || DINGALAN_MAP_SECTORS[0];
  }, [selectedSectorId]);

  const ongoingAct = useMemo(() => {
    return activities.find((a) => a.status === 'scheduled' || a.status === 'ongoing') || activities[0];
  }, [activities]);

  const ongoingBarangay = eventBroadcast?.barangay || ongoingAct?.barangay || 'Paltic';
  const ongoingTitle = eventBroadcast?.activityTitle || ongoingAct?.title || 'Coastal Clean-up Drive';
  const ongoingArea = eventBroadcast?.targetArea || ongoingAct?.targetArea || 'Dingalan Feeder Port & Coastal Watch';
  const isAdminOrSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState(() => localStorage.getItem('dingalan_banner_title') || 'Linis Dingalan EC Management');
  const [bannerSubtitle, setBannerSubtitle] = useState(() => localStorage.getItem('dingalan_banner_subtitle') || 'Innovation in Action Project of MENRO in Collaboration with PESO. Activity-based participants inventory monitoring with photographic compliance and real-time GPS watermarking across 11 coastal & river Barangays.');

  const handleSaveBanner = () => {
    localStorage.setItem('dingalan_banner_title', bannerTitle);
    localStorage.setItem('dingalan_banner_subtitle', bannerSubtitle);
    setIsEditingBanner(false);
  };

  // Featured sample beneficiary
  const featuredBene = beneficiaries[0] || {
    id: 'ben-001-uuid',
    beneCode: 'LD-BEN-2025-0101',
    firstName: 'Danilo',
    lastName: 'Bautista',
    nationalOrLocalId: 'PHILSYS-DING-9021',
    contactNumber: '0917-882-3401',
    barangay: 'Paltic',
    assignedCluster: 'Dingalan Feeder Port & Coastal Watch',
    emergencyContactName: 'Elena Bautista',
    emergencyContactPhone: '0917-882-3402',
    emergencyContactRelation: 'Spouse',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    qrHash: 'a8f3b20c194e82b7',
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2025-02-10T10:00:00Z',
  };

  // Featured ongoing activity
  const ongoingActivity = activities.find((a) => a.status === 'ongoing') || activities[0] || {
    id: 'act-2025-001',
    title: 'Dingalan Feeder Port & Paltic Coastal Cleanliness Operation',
    targetArea: 'Dingalan Feeder Port & Paltic Rock Sea Wall',
    barangay: 'Paltic',
    callTime: '06:00',
    date: '2026-09-27',
    targetBeneficiariesCount: 25,
    assignedBeneficiariesCount: 4,
    attendedBeneficiariesCount: 2,
    status: 'ongoing',
  };

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Generate QR Preview
  useEffect(() => {
    let mounted = true;
    const generate = async () => {
      try {
        const url = `https://linis-dingalan.aurora.gov.ph/attendance/checkin?bene_id=${featuredBene.id}&hash=${featuredBene.qrHash}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 240,
          margin: 1,
          color: {
            dark: '#020617',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });
        if (mounted) setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error(err);
      }
    };
    generate();
    return () => {
      mounted = false;
    };
  }, [featuredBene]);

  return (
    <div className="relative w-full min-h-screen text-slate-100 overflow-x-hidden font-sans">
      {/* ========================================================================= */}
      {/* CLEAN CINEMATIC OCEAN-CHARCOAL GRADE (#020617) AMBIENT BACKDROP */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Subtle Geometric Background Grid */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), radial-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        />

        {/* Cinematic Ocean-Charcoal Grade Overlays & Vignette */}
        <div className="absolute inset-0 bg-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

        {/* Ambient Subtle Studio Lighting Beams */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[600px] h-48 bg-emerald-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* FOREGROUND HERO CONTENT (FIT-TO-SCREEN COMPACT GLASS BANNER) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full px-2 sm:px-4 md:px-6 pt-1 pb-10">
        {/* Fit-To-Screen Hero Banner */}
        <section className="pt-1 pb-3">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/60 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl space-y-3 sm:space-y-4">
            {/* Top Horizontal Row: Live Telemetry Badge + Small Horizontal Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 sm:pb-3.5 border-b border-slate-800/80">
              <div className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start space-x-2 px-3 py-1.5 sm:py-1 rounded-full bg-slate-950/70 border border-emerald-500/40 text-emerald-300 text-[9px] sm:text-[11px] font-mono font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)] text-center sm:text-left">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="tracking-wide">
                  LIVE FIELD TELEMETRY • COASTAL SECTOR 04 — DINGALAN PACIFIC SEAWALL
                </span>
              </div>

              {/* Active User Status or Quick Telemetry Indicator (No duplicate buttons with Header) */}
              <div className="flex items-center gap-2 shrink-0">
                {currentUser && (
                  <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Naka-login: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Title & Subtitle in Full Widescreen Width with Professional Shimmer Animation & Admin-Only Edit */}
            <div className="max-w-5xl relative">

              {!isEditingBanner ? (
                <>
                  <h1 className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl font-sans">
                    <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent animate-professional-shimmer">
                      {bannerTitle}
                    </span>
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed drop-shadow-lg max-w-4xl font-sans bg-slate-950/40 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                    {bannerSubtitle}
                  </p>
                </>
              ) : (
                <div className="space-y-3 pt-4">
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-400 mb-1">Banner Title (Admin Editable Only):</label>
                    <input
                      type="text"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/60 text-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-emerald-400 mb-1">Banner Description (Admin Editable Only):</label>
                    <textarea
                      rows={3}
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/60 text-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Primary Call-To-Action Button (Deduplicated: Field Terminal when logged in, Login when not logged in) */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                {currentUser ? (
                  <button
                    onClick={() => onNavigate('reports')}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
                    <span>Tingnan ang Program Report (Auto Report)</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenLoginModal}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
                    <span>Admin & Super Admin Login</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* LATEST EVENT QR & PAALALA BROADCAST BANNER (Synchronized with Login Page Advisory) */}
        {eventBroadcast && (typeof window === 'undefined' || localStorage.getItem('ld_broadcasts_cleared') !== 'true') && (
          <section className="mb-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-slate-900/90 via-emerald-950/40 to-slate-900/90 border-2 border-emerald-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-0 sm:space-x-4 w-full">
                  {eventBroadcast.qrDataUrl ? (
                    <img
                      src={eventBroadcast.qrDataUrl}
                      alt="Event QR"
                      onClick={onOpenEventNoticeModal}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-white object-contain border-2 border-emerald-400/60 shadow-lg shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      title="I-click upang palakihin ang QR Code"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <QrCode className="w-10 h-10" />
                    </div>
                  )}

                  <div className="space-y-1 w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                        Admin Broadcast: Opisyal na Event QR & Paalala
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {eventBroadcast.sentByAdminName}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white">
                      {eventBroadcast.activityTitle} — Brgy. {eventBroadcast.barangay}
                    </h3>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-300 font-mono pt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{eventBroadcast.startTime} – {eventBroadcast.estimatedEndTime} ({eventBroadcast.totalHours})</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="truncate max-w-[250px]">{eventBroadcast.targetArea}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                  {onOpenEventNoticeModal && (
                    <button
                      onClick={onOpenEventNoticeModal}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Basahin ang Lahat ng Paalala</span>
                    </button>
                  )}

                  {onOpenScanQrModal && (
                    <button
                      onClick={onOpenScanQrModal}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4 text-slate-950" />
                      <span>I-Scan & I-Upload ang Patunay</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* BELOW THE FOLD: ASYMMETRIC BENTO GRID OF GLASS CARDS */}
        {/* ========================================================================= */}
        <section id="bento-grid-section" className="pt-2 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modular Bento Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Field Operations & Geotag Telemetry Hub
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Engineered with frosted glassmorphism, glowing luminous borders, and real-time sensor streams for bright coastal sunlight legibility.
            </p>
          </div>

          {/* Asymmetric Bento Grid (4 core tiles) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 items-stretch">
            {/* --------------------------------------------------------------------- */}
            {/* TILE 1: LARGE TILE (Span 7) - Camera HUD Crosshairs & Geotag Watermark */}
            {/* --------------------------------------------------------------------- */}
            <div className="hidden md:col-span-7 bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/25 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden group">
              {/* Subtle green ambient inner corner glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-2xl pointer-events-none" />

              {/* Removed Component Content */}

            </div>
            
            {/* --------------------------------------------------------------------- */}
            {/* TILE 2: TALL TILE (Span 5) - Topographic GPS Radar Map */}
            {/* --------------------------------------------------------------------- */}
            <div className="md:col-span-5 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/25 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden">
              {/* Subtle cyan ambient glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-2xl pointer-events-none" />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                        <span>Topographic GPS Radar</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          LIVE
                        </span>
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        Dingalan Pacific Coastline • Google Maps Connected
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
                    <span>SATELLITE SYNC</span>
                  </span>
                </div>

                {/* View Switcher & Controls Bar */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="inline-flex rounded-xl p-1 bg-slate-950/80 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMapMode('satellite')}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-1 ${
                        mapMode === 'satellite'
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Google Maps Satellite Photo View"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Satellite (Larawan)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMode('google-live')}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-1 ${
                        mapMode === 'google-live'
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Live Interactive Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Live Google Map</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {mapMode === 'satellite' && (
                      <button
                        type="button"
                        onClick={() => setRadarSweepEnabled((prev) => !prev)}
                        className={`px-2 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                          radarSweepEnabled
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-300'
                        }`}
                        title="I-on o i-off ang umiikot na radar sweep beam"
                      >
                        Sweep: {radarSweepEnabled ? 'ON' : 'OFF'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsFullMapModalOpen(true)}
                      className="p-1.5 rounded-lg bg-slate-950/80 text-cyan-400 hover:text-cyan-200 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                      title="Palakihin ang Mapa (Full View)"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Dingalan+Aurora+Philippines"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 transition-colors"
                      title="Buksan direkta sa Google Maps Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Ongoing / Scheduled Barangay & Cleaning Area Banner */}
                <div
                  onClick={() => onNavigate('attendance')}
                  className="mt-2.5 p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition-all group flex items-center justify-between shadow-md"
                  title="Pindutin para buksan ang Mapa ng Dingalan at makita ang sakop na areang lilinisan"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-cyan-300 block font-bold uppercase tracking-wider">
                        Ongoing / Scheduled: Brgy. {ongoingBarangay}
                      </span>
                      <span className="text-xs text-white font-bold truncate max-w-[200px] sm:max-w-[260px] block">
                        {ongoingTitle} • {ongoingArea}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-lg border border-cyan-500/30 group-hover:bg-cyan-500/25 transition-colors block">
                      Attendance →
                    </span>
                  </div>
                </div>

                {/* Map Display Container */}
                <div className="mt-3 relative aspect-[4/3] sm:aspect-square w-full rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden flex items-center justify-center select-none shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                  {mapMode === 'satellite' ? (
                    <div className="relative w-full h-full">
                      {/* Clean Google Maps Satellite Background Image matching reference photo */}
                      <img
                        src="/dingalan_google_maps_satellite.png"
                        alt="Dingalan Aurora Google Maps Satellite"
                        className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[1.05]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('assets/aistudio/image_479cd259.png')) {
                            target.src = '/assets/aistudio/image_479cd259.png';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    /* Live Google Maps Satellite Embed */
                    <div className="relative w-full h-full">
                      <iframe
                        title="Google Maps Dingalan Satellite View"
                        src="https://maps.google.com/maps?q=Dingalan,+Aurora,+Philippines&t=k&z=12&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-full border-0 filter contrast-[1.05]"
                        loading="lazy"
                        allowFullScreen
                      />
                      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur border border-cyan-500/30 text-[9px] font-mono text-cyan-300">
                        Interactive Google Maps
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Sector Telemetry & Details Card */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/85 border border-cyan-500/25">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <MapPin
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: currentSector.color }}
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {currentSector.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate hidden sm:inline">
                        ({currentSector.subName})
                      </span>
                    </div>
                    <span
                      className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border shrink-0"
                      style={{
                        color: currentSector.color,
                        borderColor: `${currentSector.color}55`,
                        backgroundColor: `${currentSector.color}15`,
                      }}
                    >
                      {currentSector.type.toUpperCase()}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {currentSector.description}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">COORDINATES</span>
                      <span className="text-cyan-400 font-bold block text-[10px] sm:text-[11px] truncate">
                        {currentSector.coordsText}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">ELEVATION / ZONE</span>
                      <span className="text-emerald-400 font-bold block text-[10px] sm:text-[11px] truncate">
                        {currentSector.elevation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[170px] sm:max-w-[220px]">
                  Geofence: Dingalan Coastal Zone
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsFullMapModalOpen(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                  >
                    <span>Palakihin</span>
                    <Maximize2 className="w-3 h-3 ml-0.5" />
                  </button>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${currentSector.name}, Dingalan, Aurora, Philippines`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* TILE 3: MEDIUM TILE (Span 6) - QR Verified-ID Badge */}
            {/* --------------------------------------------------------------------- */}
            <div className="hidden md:col-span-6 bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/25 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        Cryptographic QR ID Badge
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        Universal Landing & Tokenized Check-In
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" /> HMAC-SHA256
                  </span>
                </div>

                {/* ID Card Glass Surface */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo & Details */}
                  <div className="flex-1 space-y-2 text-left">
                    <div className="flex items-center space-x-3">
                      <img
                        src={featuredBene.photoUrl}
                        alt={featuredBene.firstName}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400/80 shadow"
                      />
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                          {featuredBene.beneCode}
                        </span>
                        <h4 className="text-sm font-extrabold text-white">
                          {featuredBene.firstName} {featuredBene.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-300 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400 mr-1" />
                          Brgy. {featuredBene.barangay}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                      <p className="text-slate-400">
                        Cluster: <span className="text-emerald-300 font-semibold">{featuredBene.assignedCluster}</span>
                      </p>
                      <p className="text-slate-400 font-mono">
                        PhilSys ID: <span className="text-slate-200">{featuredBene.nationalOrLocalId}</span>
                      </p>
                      <p className="text-slate-400 font-mono">
                        ICE: {featuredBene.emergencyContactName} ({featuredBene.emergencyContactPhone})
                      </p>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-2.5 bg-white rounded-2xl shadow-lg border border-slate-200 shrink-0 flex flex-col items-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Beneficiary QR Code"
                        className="w-24 h-24 object-contain"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 rounded-lg animate-pulse" />
                    )}
                    <span className="text-[8px] font-mono font-bold text-slate-900 mt-1">
                      SCAN FOR CHECK-IN
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Sig: {featuredBene.qrHash.slice(0, 12)}...
                </span>
                <button
                  onClick={() => onOpenDigitalIdModal(featuredBene)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center space-x-1 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Printable ID Card</span>
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* TILE 4: MEDIUM TILE (Span 6) - Circular Compliance Gauge */}
            {/* --------------------------------------------------------------------- */}
            <div className="md:col-span-6 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/25 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col justify-between relative overflow-hidden">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        Compliance Gauge & Verification
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        Real-time Quota Completion Ratio
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    PESO & MENRO AUDITED
                  </span>
                </div>

                {/* Circular Gauge Graphic & Breakdown */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Circular Ring Gauge */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="rgba(30, 41, 59, 0.8)"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Animated Glowing Progress Ring (94%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#compliance-gradient)"
                        strokeWidth="10"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.948)}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="compliance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black font-mono text-white tracking-tight">
                        94.8%
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                        COMPLIANT
                      </span>
                    </div>
                  </div>

                  {/* Sub-Metrics Breakdown */}
                  <div className="sm:col-span-7 space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Total Workforce Complied:</span>
                      <span className="font-mono font-bold text-emerald-400">142 Workers</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Pending Verification:</span>
                      <span className="font-mono font-bold text-amber-400">8 Workers</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Tampered / Forged Tokens:</span>
                      <span className="font-mono font-bold text-slate-300">0 Attempts</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Photo Storage Optimization:</span>
                      <span className="font-mono font-bold text-cyan-400">82% Saved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Sign-Off: MENRO Inspector + PESO Head
                </span>
                <button
                  onClick={() => onNavigate('reports')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-600 text-white font-bold text-xs flex items-center space-x-1 shadow transition-all"
                >
                  <span>Export Report (CSV/PDF)</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Fullscreen Google Maps Topographic Radar Modal */}
      {isFullMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Compass className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Google Maps Topographic GPS Radar</span>
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Dingalan, Aurora
                    </span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Satelayt ng Dingalan Bay, Paltic, Butas na Bato, Cabog, Ibona, at Umiray
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${currentSector.name}, Dingalan, Aurora, Philippines`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow"
                >
                  <span>Buksan sa Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsFullMapModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Map + Sector List Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Map Column (Span 8) */}
              <div className="lg:col-span-8 p-3 sm:p-5 flex flex-col justify-between bg-slate-950/60">
                {/* View Switcher Controls */}
                <div className="flex items-center justify-between pb-3">
                  <div className="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMapMode('satellite')}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                        mapMode === 'satellite'
                          ? 'bg-cyan-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🛰️ Satellite (Larawan)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMode('google-live')}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                        mapMode === 'google-live'
                          ? 'bg-cyan-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🗺️ Interactive Google Maps
                    </button>
                  </div>

                  {mapMode === 'satellite' && (
                    <button
                      type="button"
                      onClick={() => setRadarSweepEnabled((prev) => !prev)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                        radarSweepEnabled
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Radar Sweep: {radarSweepEnabled ? 'ON' : 'OFF'}
                    </button>
                  )}
                </div>

                {/* Map Window */}
                <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden flex items-center justify-center select-none shadow-2xl">
                  {mapMode === 'satellite' ? (
                    <>
                      <img
                        src="/dingalan_google_maps_satellite.png"
                        alt="Dingalan Aurora Google Maps Satellite View"
                        className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[1.1] contrast-[1.08]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('assets/aistudio/image_479cd259.png')) {
                            target.src = '/assets/aistudio/image_479cd259.png';
                          }
                        }}
                      />

                      {/* Topographic Rings */}
                      <div className="absolute inset-6 rounded-full border border-cyan-400/20 pointer-events-none" />
                      <div className="absolute inset-20 rounded-full border border-cyan-400/15 pointer-events-none" />
                      <div className="absolute inset-x-0 top-1/2 border-t border-cyan-400/20 pointer-events-none" />
                      <div className="absolute inset-y-0 left-1/2 border-l border-cyan-400/20 pointer-events-none" />

                      {/* Sweeping Beam */}
                      {radarSweepEnabled && (
                        <div
                          className="absolute w-full h-full pointer-events-none"
                          style={{ transform: `rotate(${radarAngle}deg)` }}
                        >
                          <div
                            className="w-1/2 h-1/2 origin-bottom-right"
                            style={{
                              background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.45) 0deg, transparent 65deg)',
                            }}
                          />
                        </div>
                      )}

                      {/* Pins */}
                      {DINGALAN_MAP_SECTORS.map((sector) => {
                        const isSelected = selectedSectorId === sector.id;
                        return (
                          <div
                            key={`modal-${sector.id}`}
                            style={{
                              top: `${sector.topPct}%`,
                              left: `${sector.leftPct}%`,
                            }}
                            onClick={() => setSelectedSectorId(sector.id)}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-300 ${
                              isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <span className="relative flex h-4 w-4">
                                <span
                                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                  style={{ backgroundColor: sector.color }}
                                />
                                <span
                                  className="relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-xl"
                                  style={{ backgroundColor: sector.color }}
                                />
                              </span>
                              <span
                                className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-lg backdrop-blur ${
                                  isSelected
                                    ? 'bg-cyan-500 text-slate-950 border border-white ring-2 ring-cyan-400/50 scale-105'
                                    : 'bg-slate-950/90 text-white border border-slate-700/80'
                                }`}
                              >
                                {sector.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <iframe
                      title="Modal Google Maps Satellite"
                      src="https://maps.google.com/maps?q=Dingalan,+Aurora,+Philippines&t=k&z=12&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full border-0 filter contrast-[1.05]"
                      loading="lazy"
                      allowFullScreen
                    />
                  )}
                </div>

                {/* Telemetry Footer */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">{currentSector.name}</span>
                    <span className="text-[11px] font-mono text-cyan-300">({currentSector.coordsText})</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Elevation: {currentSector.elevation}
                  </span>
                </div>
              </div>

              {/* Sidebar Column: Dingalan Coastal Sectors (Span 4) */}
              <div className="lg:col-span-4 p-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Mga Sona ng Baybayin (Google Maps Points)
                  </h4>
                  <div className="space-y-2">
                    {DINGALAN_MAP_SECTORS.map((sector) => {
                      const isSelected = selectedSectorId === sector.id;
                      return (
                        <div
                          key={`list-${sector.id}`}
                          onClick={() => setSelectedSectorId(sector.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: sector.color }}
                              />
                              <span className="text-xs font-bold text-white truncate">
                                {sector.name}
                              </span>
                            </div>
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0"
                              style={{
                                color: sector.color,
                                borderColor: `${sector.color}55`,
                                backgroundColor: `${sector.color}15`,
                              }}
                            >
                              {sector.elevation}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                            {sector.subName}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>{sector.coordsText}</span>
                            <span className="text-cyan-400 hover:underline">I-focus →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <a
                    href="https://www.google.com/maps/place/Dingalan,+Aurora/@15.3857644,121.3653136,12z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow transition-all"
                  >
                    <span>Buksan ang Dingalan sa Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
