import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Compass,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Radio,
  Clock,
  ArrowLeft,
  ExternalLink,
  RotateCw,
  Eye,
  Sliders,
  Shield,
  Navigation,
  Crosshair,
  Satellite,
  Info,
  Bus,
  Car,
  Bike,
  Flame,
  Wind,
  Map,
  Check,
  X,
  Ruler,
  Trash2,
} from 'lucide-react';
import { User, Activity } from '../types';
import { useDingalanClock } from '../utils/philippineClock';
import { DINGALAN_MAP_SECTORS, MapSector } from './CinematicBentoHomepage';

interface FullScreenMapRadarViewProps {
  currentUser: User;
  onBackToOverview: () => void;
  initialSectorId?: string;
  activities?: Activity[];
}

export const FullScreenMapRadarView: React.FC<FullScreenMapRadarViewProps> = ({
  currentUser,
  onBackToOverview,
  initialSectorId = 'paltic',
  activities = [],
}) => {
  const { time: phTime, timeWithSeconds } = useDingalanClock();
  const [selectedSectorId, setSelectedSectorId] = useState<string>(initialSectorId);

  // Map Type ('m' = Default, 'k' = Satellite, 'h' = Hybrid, 'p' = Terrain)
  const [mapType, setMapType] = useState<'m' | 'k' | 'h' | 'p'>('k');
  const [mapZoom, setMapZoom] = useState<number>(6); // Initially 6 to match image_5f28afb6.png (Philippines radar view)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Map Details & Tools (matching image_f948f4ac.png)
  const [transitLayer, setTransitLayer] = useState<boolean>(false);
  const [trafficLayer, setTrafficLayer] = useState<boolean>(false);
  const [bikingLayer, setBikingLayer] = useState<boolean>(false);
  const [streetViewLayer, setStreetViewLayer] = useState<boolean>(false);
  const [wildfiresLayer, setWildfiresLayer] = useState<boolean>(false);
  const [airQualityLayer, setAirQualityLayer] = useState<boolean>(true);
  const [travelTimeTool, setTravelTimeTool] = useState<boolean>(false);
  const [measureTool, setMeasureTool] = useState<boolean>(false);

  // Modal for Layers & Tools matching the user's reference image
  const [showLayersModal, setShowLayersModal] = useState<boolean>(false);

  const [showRadarHud, setShowRadarHud] = useState<boolean>(false);
  const [radarSweepEnabled, setRadarSweepEnabled] = useState<boolean>(true);
  const [radarAngle, setRadarAngle] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCoordinatesHud, setShowCoordinatesHud] = useState(true);
  const [showJurisdictionLines, setShowJurisdictionLines] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interactive Map Waypoint & Event Route Drawing State
  const [isDrawingPoints, setIsDrawingPoints] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ xPct: number; yPct: number; label: string } | null>(null);
  const [endPoint, setEndPoint] = useState<{ xPct: number; yPct: number; label: string } | null>(null);
  const [savedRoute, setSavedRoute] = useState<{
    start: { xPct: number; yPct: number; label: string };
    end: { xPct: number; yPct: number; label: string };
    sectorId: string;
    savedAt: string;
  } | null>(null);
  const [routeStatusMessage, setRouteStatusMessage] = useState<string>('');

  // Load saved waypoints for this sector
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`ld_map_route_${selectedSectorId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedRoute(parsed);
        setStartPoint(parsed.start);
        setEndPoint(parsed.end);
      } else {
        setSavedRoute(null);
        setStartPoint(null);
        setEndPoint(null);
      }
    } catch {
      setSavedRoute(null);
      setStartPoint(null);
      setEndPoint(null);
    }
  }, [selectedSectorId]);

  const handleSaveWaypoints = () => {
    if (!startPoint || !endPoint) {
      setRouteStatusMessage('⚠️ Maglagay muna ng Simula (Point A) at Katapusan (Point B) bago i-save.');
      setTimeout(() => setRouteStatusMessage(''), 3500);
      return;
    }
    const route = {
      start: startPoint,
      end: endPoint,
      sectorId: selectedSectorId,
      savedAt: new Date().toISOString(),
    };
    setSavedRoute(route);
    setIsDrawingPoints(false);
    localStorage.setItem(`ld_map_route_${selectedSectorId}`, JSON.stringify(route));
    setRouteStatusMessage('✅ Naka-fix na ang Waypoint Route sa mapa!');
    setTimeout(() => setRouteStatusMessage(''), 3500);
  };

  const handleDeleteWaypoints = () => {
    setStartPoint(null);
    setEndPoint(null);
    setSavedRoute(null);
    setIsDrawingPoints(false);
    localStorage.removeItem(`ld_map_route_${selectedSectorId}`);
    setRouteStatusMessage('🗑️ Nabura na ang lahat ng waypoints sa mapa.');
    setTimeout(() => setRouteStatusMessage(''), 3500);
  };

  const handleMapDrawingClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingPoints) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10));
    const yPct = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10));

    if (!startPoint) {
      setStartPoint({ xPct, yPct, label: 'Sisimulang Punto (Point A)' });
      setRouteStatusMessage('🟢 Naitakda ang Simula (Point A)! I-click sa mapa ang Katapusan (Point B).');
    } else if (!endPoint) {
      setEndPoint({ xPct, yPct, label: 'Katapusang Punto (Point B)' });
      setRouteStatusMessage('🎯 Naitakda ang Guhit at Route! Pindutin ang "Save Waypoint" upang ma-fix ito sa mapa.');
    } else {
      setStartPoint({ xPct, yPct, label: 'Sisimulang Punto (Point A)' });
      setEndPoint(null);
      setRouteStatusMessage('🟢 Bagong Simula (Point A). I-click naman sa mapa ang Katapusan (Point B).');
    }
  };

  const currentSector: MapSector =
    DINGALAN_MAP_SECTORS.find((s) => s.id === selectedSectorId) || DINGALAN_MAP_SECTORS[0];

  const sectorActivity = activities.find(
    (a) =>
      a.barangay?.toLowerCase() === currentSector.name.toLowerCase() ||
      currentSector.name.toLowerCase().includes(a.barangay?.toLowerCase() || '') ||
      a.barangay?.toLowerCase().includes(currentSector.id.toLowerCase())
  ) || activities[0];

  // Radar sweep animation
  useEffect(() => {
    if (!radarSweepEnabled || !showRadarHud) return;
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 2.5) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [radarSweepEnabled, showRadarHud]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  const handleSectorSelect = (sectorId: string) => {
    setIsTransitioning(true);
    setSelectedSectorId(sectorId);
    setMapZoom(15);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const getSectorEmbedUrl = (sector: MapSector, type: 'm' | 'k' | 'h' | 'p') => {
    let query = '';
    let zoom = mapZoom;
    if (zoom === 6) {
      query = 'Philippines';
    } else {
      switch (sector.id) {
        case 'paltic':
          query = 'Paltic, Dingalan, Aurora, Philippines';
          zoom = 15;
          break;
        case 'dingalan':
          query = 'Poblacion, Dingalan, Aurora, Philippines';
          zoom = 16;
          break;
        case 'butas':
          query = '15.3850,121.3980 (Butas na Bato, Dingalan)';
          zoom = 16;
          break;
        case 'bay':
          query = 'Dingalan Bay, Aurora, Philippines';
          zoom = 14;
          break;
        case 'cabog':
          query = 'Cabog, Matawe, Dingalan, Aurora, Philippines';
          zoom = 15;
          break;
        case 'ibona':
          query = 'Ibona, Dingalan, Aurora, Philippines';
          zoom = 15;
          break;
        case 'umiray':
          query = 'Umiray, Dingalan, Aurora, Philippines';
          zoom = 15;
          break;
        default:
          query = `${sector.name}, Dingalan, Aurora, Philippines`;
          zoom = 15;
      }
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${type}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen'
          : 'min-h-[calc(100vh-3.5rem)] h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-4.5rem)] px-1 sm:px-3 pb-1 sm:pb-2 pt-0.5 sm:pt-1'
      }`}
    >
      {/* Top HUD Control Bar (Ultra-Compact Single-Row on Mobile to Maximize Map Area) */}
      <div className="shrink-0 z-30 mb-0.5 sm:mb-1 px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.7)] flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: Back button & Title */}
        <div className="flex items-center space-x-1 sm:space-x-2.5 min-w-0 shrink-0">
          <button
            type="button"
            onClick={onBackToOverview}
            className="p-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 flex items-center space-x-1 text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer shadow shrink-0"
            title="Bumalik sa Overview"
          >
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <div className="flex items-center space-x-1 min-w-0">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <div className="min-w-0">
              <h1 className="text-[10px] sm:text-sm font-extrabold font-mono text-white tracking-tight uppercase flex items-center gap-1 truncate">
                <Satellite className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">Google Maps GPS Radar & Layers</span>
                <span className="sm:hidden text-cyan-300 font-bold">Radar</span>
                <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                  ACTIVE
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Horizontally Scrollable Compact Action Buttons in a single row */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink min-w-0">

          {/* Jurisdiction Lines Toggle Button */}
          <button
            type="button"
            onClick={() => setShowJurisdictionLines((prev) => !prev)}
            className={`flex items-center space-x-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-mono rounded-md sm:rounded-lg border transition-all cursor-pointer shrink-0 ${
              showJurisdictionLines
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="I-on o i-off ang mga linya ng sakop ng barangay"
          >
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
            <span className="hidden sm:inline">Jurisdiction Lines: </span>
            <span className="sm:hidden">Lines: </span>
            <span>{showJurisdictionLines ? 'ON' : 'OFF'}</span>
          </button>



          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleNativeFullscreen}
            className="p-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1 text-[9px] sm:text-xs font-mono font-bold transition-all cursor-pointer shadow shrink-0"
            title={isFullscreen ? 'I-minimize ang screen' : 'I-maximize ang screen (Full Screen)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Exit Full</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 w-full rounded-2xl bg-slate-950 border border-cyan-500/40 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col">
        {/* Layer 1: Google Maps Live Iframe Base */}
        <div className="relative w-full h-full flex-1 min-h-0">
          <iframe
            key={`fullscreen-map-${currentSector.id}-${mapType}`}
            title={`Google Maps Radar - ${currentSector.name}`}
            src={getSectorEmbedUrl(currentSector, mapType)}
            className="w-full h-full border-0 filter contrast-[1.08] saturate-[1.1]"
            loading="lazy"
            allowFullScreen
          />

          {/* Active Layers Tactical Badges Overlay on Map */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-1.5 pointer-events-none max-w-lg">
            {trafficLayer && (
              <div className="px-2 py-1 rounded-lg bg-red-950/90 border border-red-500/50 text-red-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <Car className="w-3 h-3 text-red-400" />
                <span>Traffic Layer Active</span>
              </div>
            )}
            {transitLayer && (
              <div className="px-2 py-1 rounded-lg bg-blue-950/90 border border-blue-500/50 text-blue-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <Bus className="w-3 h-3 text-blue-400" />
                <span>Transit Terminals Synced</span>
              </div>
            )}
            {bikingLayer && (
              <div className="px-2 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <Bike className="w-3 h-3 text-emerald-400" />
                <span>Biking Trail Active</span>
              </div>
            )}
            {streetViewLayer && (
              <div className="px-2 py-1 rounded-lg bg-amber-950/90 border border-amber-500/50 text-amber-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Street View 360° Active</span>
              </div>
            )}
            {wildfiresLayer && (
              <div className="px-2 py-1 rounded-lg bg-orange-950/90 border border-orange-500/50 text-orange-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <Flame className="w-3 h-3 text-orange-400" />
                <span>Wildfires Radar: Safe</span>
              </div>
            )}
            {airQualityLayer && (
              <div className="px-2 py-1 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>Air Quality: 24 AQI (Good)</span>
              </div>
            )}
            {travelTimeTool && (
              <div className="px-2 py-1 rounded-lg bg-purple-950/90 border border-purple-500/50 text-purple-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <span>⏱️ ETA Travel Time: 15 mins</span>
              </div>
            )}
            {measureTool && (
              <div className="px-2 py-1 rounded-lg bg-indigo-950/90 border border-indigo-500/50 text-indigo-300 text-[10px] font-mono flex items-center space-x-1 shadow-lg">
                <Ruler className="w-3 h-3 text-indigo-400" />
                <span>Measure Tool: 5.0 km Radius</span>
              </div>
            )}
          </div>

          {/* Layer 2: Topographic Radar HUD Overlay */}
          {showRadarHud && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {/* Concentric Distance Rings */}
              <div className="absolute inset-6 sm:inset-12 rounded-full border border-cyan-400/25 shadow-[0_0_15px_rgba(6,182,212,0.15)]" />
              <div className="absolute inset-20 sm:inset-32 rounded-full border border-cyan-400/20" />
              <div className="absolute inset-36 sm:inset-56 rounded-full border border-cyan-400/15" />

              {/* Crosshair & Cardinal Lines */}
              <div className="absolute inset-x-0 top-1/2 border-t border-cyan-400/25" />
              <div className="absolute inset-y-0 left-1/2 border-l border-cyan-400/25" />

              {/* Distance Markers */}
              <div className="absolute top-1/2 left-1/2 -translate-y-4 translate-x-20 text-[9px] font-mono text-cyan-400/60 font-bold">
                2.5 KM
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-y-4 translate-x-44 text-[9px] font-mono text-cyan-400/60 font-bold">
                5.0 KM
              </div>

              {/* Sweeping Radar Beam Animation */}
              {radarSweepEnabled && (
                <div
                  className="absolute w-full h-full"
                  style={{ transform: `rotate(${radarAngle}deg)` }}
                >
                  <div
                    className="w-1/2 h-1/2 origin-bottom-right"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.40) 0deg, transparent 65deg)',
                    }}
                  />
                </div>
              )}

              {/* Top-Right Compass HUD */}
              <div className="absolute top-4 right-4 flex flex-col items-center bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl px-2.5 py-1.5 shadow-xl">
                <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                <span className="text-[10px] font-mono font-bold text-cyan-300 mt-0.5">N 015°</span>
                <span className="text-[8px] font-mono text-slate-400">RADAR HUD</span>
              </div>
            </div>
          )}

          {/* Floating Live Sector Telemetry Badge (Hidden on mobile to maximize map view) */}
          {showCoordinatesHud && (
            <div className="hidden md:flex absolute top-4 left-4 z-20 pointer-events-none items-center space-x-2.5 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 shadow-2xl">
              <span
                className="w-3 h-3 rounded-full animate-ping shrink-0"
                style={{ backgroundColor: currentSector.color }}
              />
              <div className="flex flex-col">
                <span className="text-white text-xs sm:text-sm font-extrabold flex items-center space-x-1.5">
                  <span>📍 {currentSector.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">({currentSector.coordsText})</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-normal">
                  Area: {currentSector.areaSqKm} • {currentSector.status}
                </span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Map Type: {mapType === 'k' ? 'Satellite' : mapType === 'h' ? 'Hybrid' : mapType === 'p' ? 'Terrain' : 'Default'}
                </span>
              </div>
            </div>
          )}


          {/* Dingalan Municipal Territorial Jurisdiction Boundary & Sector Overlay */}
          {showJurisdictionLines && (
            <div className="absolute inset-0 pointer-events-none z-15 p-6 flex flex-col justify-between">
              {/* Top Right Jurisdictional Legend Card (Hidden on mobile to maximize map) */}
              <div className="hidden md:block self-end pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-3.5 shadow-2xl max-w-xs">
                <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
                    Dingalan Jurisdictions (7 Puroks)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {DINGALAN_MAP_SECTORS.map((sec) => (
                    <button
                      key={`jurisdiction-badge-${sec.id}`}
                      type="button"
                      onClick={() => handleSectorSelect(sec.id)}
                      className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-mono flex items-center justify-between transition-all cursor-pointer ${
                        selectedSectorId === sec.id
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-cyan-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                        <span className="truncate">{sec.name}</span>
                      </div>
                      <span className="text-[9px] opacity-80">{sec.areaSqKm}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Center Active Jurisdiction Indicator (Hidden on mobile to maximize map) */}
              <div className="hidden md:flex self-center pointer-events-none px-4 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shadow-2xl items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ACTIVE TERRITORIAL JURISDICTION SCOPE: {currentSector.name} ({currentSector.subName})</span>
              </div>
            </div>
          )}
          {/* Transition Loading Overlay when switching sectors */}
          {isTransitioning && (
            <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-center justify-center transition-all duration-500 animate-fadeIn">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase animate-pulse">
                  Nagre-zoom sa Sona: {currentSector.name}...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Horizontal Barangay Quick Selector Strip */}
        <div className="shrink-0 z-30 px-3 py-2 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1 text-xs font-mono font-bold text-slate-400 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Pumili ng Barangay / Sector:</span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 no-scrollbar">
            {DINGALAN_MAP_SECTORS.map((sector) => {
              const isSelected = selectedSectorId === sector.id;
              return (
                <button
                  key={`quick-sector-${sector.id}`}
                  type="button"
                  onClick={() => handleSectorSelect(sector.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all duration-500 ease-out cursor-pointer shrink-0 border transform ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110 -translate-y-0.5'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 hover:scale-105'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'animate-ping' : ''}`}
                    style={{ backgroundColor: sector.color }}
                  />
                  <span>{sector.name}</span>
                </button>
              );
            })}
          </div>

          <a
            href={`https://www.google.com/maps/place/Dingalan,+Aurora/@15.3857644,121.3653136,12z`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 text-xs font-mono shrink-0 cursor-pointer"
            title="Buksan ang Google Maps sa bagong tab"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* MAP LAYERS & TOOLS MODAL (Matching image_f948f4ac.png) */}
      {showLayersModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-6 h-6 text-cyan-400" />
                <h2 className="text-lg font-bold font-mono text-white">Google Maps Details, Tools & Types</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLayersModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-5">
              {/* SECTION 1: MAP DETAILS */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
                  Map Details (Mga Detalye ng Mapa)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Transit */}
                  <button
                    type="button"
                    onClick={() => setTransitLayer((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      transitLayer
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mb-2 text-blue-400">
                      <Bus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono">Transit</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {transitLayer ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>

                  {/* Traffic */}
                  <button
                    type="button"
                    onClick={() => setTrafficLayer((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      trafficLayer
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-2 text-red-400">
                      <Car className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono">Traffic</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {trafficLayer ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>

                  {/* Biking */}
                  <button
                    type="button"
                    onClick={() => setBikingLayer((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      bikingLayer
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2 text-emerald-400">
                      <Bike className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono">Biking</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {bikingLayer ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>

                  {/* Terrain */}
                  <button
                    type="button"
                    onClick={() => setMapType('p')}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      mapType === 'p'
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-500/20 border border-stone-500/40 flex items-center justify-center mb-2 text-stone-300">
                      ⛰️
                    </div>
                    <span className="text-xs font-bold font-mono">Terrain</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {mapType === 'p' ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>

                  {/* Street View */}
                  <button
                    type="button"
                    onClick={() => setStreetViewLayer((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      streetViewLayer
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-2 text-amber-400">
                      <Eye className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono">Street View</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {streetViewLayer ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>

                  {/* Wildfires */}
                  <button
                    type="button"
                    onClick={() => setWildfiresLayer((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      wildfiresLayer
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mb-2 text-orange-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono">Wildfires</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {wildfiresLayer ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>

                  {/* Air Quality */}
                  <button
                    type="button"
                    onClick={() => setAirQualityLayer((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      airQualityLayer
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mb-2 text-cyan-400">
                      <Wind className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono">Air Quality</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {airQualityLayer ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: MAP TOOLS */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
                  Map Tools (Mga Kasangkapan sa Mapa)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Travel time */}
                  <button
                    type="button"
                    onClick={() => setTravelTimeTool((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      travelTimeTool
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-2 text-purple-400">
                      ⏱️
                    </div>
                    <span className="text-xs font-bold font-mono">Travel time</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {travelTimeTool ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>

                  {/* Measure */}
                  <button
                    type="button"
                    onClick={() => setMeasureTool((prev) => !prev)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      measureTool
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mb-2 text-indigo-400">
                      <Ruler className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono">Measure</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {measureTool ? 'Aktibo (Active)' : 'I-on'}
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION 3: MAP TYPE */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
                  Map Type (Uri ng Mapa)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Default */}
                  <button
                    type="button"
                    onClick={() => setMapType('m')}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      mapType === 'm'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Map className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-mono">Default</span>
                  </button>

                  {/* Satellite */}
                  <button
                    type="button"
                    onClick={() => setMapType('k')}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      mapType === 'k'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Satellite className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-mono">Satellite</span>
                  </button>

                  {/* Hybrid */}
                  <button
                    type="button"
                    onClick={() => setMapType('h')}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      mapType === 'h'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Compass className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-mono">Hybrid</span>
                  </button>

                  {/* Terrain */}
                  <button
                    type="button"
                    onClick={() => setMapType('p')}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      mapType === 'p'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg mb-1">⛰️</span>
                    <span className="text-xs font-mono">Terrain</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLayersModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-all cursor-pointer shadow-lg"
              >
                Isara at Ilapat (Apply Layers)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
