import { useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  BatteryCharging,
  Compass,
  Flag,
  Loader2,
  LocateFixed,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sun,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { getCapitalBySlug } from '../../data/brazilCities';
import {
  buildCumulativeDistances,
  formatDistancePtBR,
  formatDurationPtBR,
  interpolateAlongRoute,
  normalizeAngleDiff,
  projectPointOntoRoute,
} from '../../engine/geo';
import {
  acquireScreenWakeLock,
  announceNavAlert,
  buildSpokenManeuverPhrase,
  getUpcomingManeuver,
  releaseScreenWakeLock,
} from '../../engine/navigation';
import { formatStopwatchSec } from '../../engine/rideRecorder';
import { computeRouteTelemetry } from '../../engine/telemetry';
import { computeRouteMainBearingDeg } from '../../engine/weather';
import { useFullscreen } from '../../hooks/useFullscreen';
import { selectActiveVehicle, useAppStore } from '../../store/useAppStore';
import type { ManeuverStep } from '../../types';

function ManeuverIcon({ type }: { type: ManeuverStep['type'] }) {
  const cls = 'h-8 w-8 text-white';
  switch (type) {
    case 'left':
      return <ArrowLeft className={cls} />;
    case 'right':
      return <ArrowRight className={cls} />;
    case 'slight-left':
      return <ArrowUpLeft className={cls} />;
    case 'slight-right':
      return <ArrowUpRight className={cls} />;
    case 'uturn':
      return <RotateCcw className={cls} />;
    case 'arrive':
      return <Flag className={cls} />;
    default:
      return <ArrowUp className={cls} />;
  }
}

export function LiveNavigationOverlay() {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const candidates = useAppStore((s) => s.candidates);
  const selectedCandidateIdx = useAppStore((s) => s.selectedCandidateIdx);
  const nav = useAppStore((s) => s.nav);
  const activeRide = useAppStore((s) => s.activeRide);
  const voiceMode = useAppStore((s) => s.voiceMode);
  const theme = useAppStore((s) => s.theme);
  const activeVehicle = useAppStore(selectActiveVehicle);
  const selectedModeIndex = useAppStore((s) => s.selectedModeIndex);
  const riderWeightKg = useAppStore((s) => s.riderWeightKg);
  const weather = useAppStore((s) => s.weather);
  const batteryCalibrations = useAppStore((s) => s.batteryCalibrations);

  const stopNavigation = useAppStore((s) => s.stopNavigation);
  const updateNavTelemetry = useAppStore((s) => s.updateNavTelemetry);
  const recordRideSample = useAppStore((s) => s.recordRideSample);
  const toggleRidePause = useAppStore((s) => s.toggleRidePause);
  const cycleVoiceMode = useAppStore((s) => s.cycleVoiceMode);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const openHazardReporter = useAppStore((s) => s.openHazardReporter);
  const triggerOffRouteReroute = useAppStore((s) => s.triggerOffRouteReroute);
  const pushToast = useAppStore((s) => s.pushToast);

  const activeRoute = nav.isFreeRide ? undefined : candidates[selectedCandidateIdx];
  const activeMode = activeVehicle.modes[selectedModeIndex] ?? activeVehicle.modes[0];
  const activeCalibration = batteryCalibrations[activeVehicle.id] ?? null;

  const cumDist = useMemo(
    () => (activeRoute ? buildCumulativeDistances(activeRoute.coords) : [0]),
    [activeRoute]
  );
  const totalMeters = cumDist[cumDist.length - 1] || 1;

  const lastSpokenKeyRef = useRef('');
  const lastCrossingSpokenRef = useRef('');
  const lastRerouteTsRef = useRef(0);
  const lastCompassTsRef = useRef(0);
  const demoDistRef = useRef(0);

  // Acquire Wake Lock while navigating or recording Free Ride
  useEffect(() => {
    void acquireScreenWakeLock();
    return () => {
      void releaseScreenWakeLock();
    };
  }, []);

  // Announce navigation start
  useEffect(() => {
    if (nav.isFreeRide) {
      announceNavAlert('Gravação de modo livre iniciada.', useAppStore.getState().voiceMode);
      return;
    }
    if (!activeRoute) return;
    announceNavAlert(
      `Navegação iniciada. Trajeto de ${activeRoute.distanceKm.toFixed(1).replace('.', ',')} quilômetros.`,
      useAppStore.getState().voiceMode
    );
  }, [activeRoute?.id, nav.isFreeRide]);

  // 1-second stopwatch heartbeat for Free Ride & Real GPS sessions so auto-pause & total timer stay live
  useEffect(() => {
    if (!nav.isTracking || nav.isDemoMode) return;
    const timer = window.setInterval(() => {
      const st = useAppStore.getState();
      if (!st.activeRide) return;
      const now = Date.now();
      if (now - st.activeRide.lastTickMs >= 950) {
        const lastPt = st.activeRide.track[st.activeRide.track.length - 1];
        const fallbackCenter = getCapitalBySlug(st.selectedCitySlug).center;
        const pos: [number, number] = st.nav.currentPos
          ? st.nav.currentPos
          : lastPt
            ? [lastPt.lng, lastPt.lat]
            : fallbackCenter;
        recordRideSample({
          lng: pos[0],
          lat: pos[1],
          speedKmh: st.nav.currentSpeedKmh,
          ts: now,
        });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [nav.isTracking, nav.isDemoMode, recordRideSample]);

  // Live GPS Watch + Phone Compass (Guided Navigation AND Free Ride)
  useEffect(() => {
    if (!nav.isTracking || nav.isDemoMode) return;
    if (!nav.isFreeRide && !activeRoute) return;

    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          const ele =
            typeof pos.coords.altitude === 'number' && Number.isFinite(pos.coords.altitude)
              ? pos.coords.altitude
              : undefined;
          const speedKmh =
            typeof pos.coords.speed === 'number' && pos.coords.speed >= 0
              ? Math.round(pos.coords.speed * 3.6)
              : 0;

          if (nav.isFreeRide || !activeRoute) {
            const prevHeading = useAppStore.getState().nav.currentHeading;
            const heading =
              typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading) && speedKmh > 3
                ? pos.coords.heading
                : prevHeading;

            updateNavTelemetry({
              currentPos: coords,
              currentHeading: heading,
              currentSpeedKmh: speedKmh,
              accuracyMeters: Math.round(pos.coords.accuracy || 0),
              offRouteMeters: 0,
            });

            recordRideSample({
              lng: coords[0],
              lat: coords[1],
              ele,
              speedKmh,
              ts: Date.now(),
            });
            return;
          }

          const proj = projectPointOntoRoute(coords, activeRoute.coords, cumDist);
          const heading =
            typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading) && speedKmh > 3
              ? pos.coords.heading
              : proj.segmentBearing;

          const snappedPos = proj.distanceToRouteM < 25 ? proj.snapped : coords;
          updateNavTelemetry({
            currentPos: snappedPos,
            currentHeading: heading,
            currentSpeedKmh: speedKmh,
            accuracyMeters: Math.round(pos.coords.accuracy || 0),
            distanceAlongM: proj.distanceAlongM,
            offRouteMeters: proj.distanceToRouteM > 38 ? Math.round(proj.distanceToRouteM) : 0,
          });

          recordRideSample({
            lng: snappedPos[0],
            lat: snappedPos[1],
            ele,
            speedKmh,
            ts: Date.now(),
          });

          // Auto off-route rerouting (> 42m off track, debounced every 14s)
          const now = Date.now();
          if (proj.distanceToRouteM > 42 && now - lastRerouteTsRef.current > 14000) {
            lastRerouteTsRef.current = now;
            announceNavAlert('Fora da rota. Recalculando trajeto seguro.', useAppStore.getState().voiceMode, true);
            void triggerOffRouteReroute(coords);
          }
        },
        (err) => {
          pushToast('Sinal de GPS indisponível', `${err.message}. Você pode usar o modo Testar.`, 'amber');
        },
        { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 }
      );
    }

    const onOrientation = (ev: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastCompassTsRef.current < 140) return;
      const stNav = useAppStore.getState().nav;
      if (stNav.currentSpeedKmh >= 4) return;

      const webkitHeading = (ev as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      let trueHeading: number | null = null;
      if (typeof webkitHeading === 'number' && Number.isFinite(webkitHeading)) {
        trueHeading = webkitHeading;
      } else if (typeof ev.alpha === 'number' && Number.isFinite(ev.alpha)) {
        trueHeading = (360 - ev.alpha + BRAND.magneticDeclinationDeg + 360) % 360;
      }
      if (trueHeading !== null) {
        const diff = normalizeAngleDiff(trueHeading - stNav.currentHeading);
        if (Math.abs(diff) >= 2.2) {
          lastCompassTsRef.current = now;
          const blended = (stNav.currentHeading + diff * 0.42 + 360) % 360;
          updateNavTelemetry({ currentHeading: blended });
        }
      }
    };

    window.addEventListener('deviceorientationabsolute', onOrientation as EventListener);
    window.addEventListener('deviceorientation', onOrientation as EventListener);
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientationabsolute', onOrientation as EventListener);
      window.removeEventListener('deviceorientation', onOrientation as EventListener);
    };
  }, [nav.isTracking, nav.isDemoMode, nav.isFreeRide, activeRoute, cumDist, recordRideSample]);

  // Smooth Demo Navigation Loop (220ms tick + live ride sample capture for Simulação replay)
  useEffect(() => {
    if (!nav.isDemoMode || !activeRoute) return;
    demoDistRef.current = nav.distanceAlongM;
    const cruiseKmh = activeMode?.topSpeed ?? 22;
    const speedMps = (cruiseKmh / 3.6) * 2.3;

    const getEleAtDist = (d: number): number | undefined => {
      const frac = Math.max(0, Math.min(1, d / Math.max(1, totalMeters)));
      const idx = Math.min(activeRoute.coords.length - 1, Math.round(frac * (activeRoute.coords.length - 1)));
      const ele = activeRoute.coords[idx]?.[2];
      return typeof ele === 'number' ? ele : undefined;
    };

    const interval = window.setInterval(() => {
      demoDistRef.current += speedMps * 0.22;
      if (demoDistRef.current >= totalMeters) {
        demoDistRef.current = totalMeters;
        const end = interpolateAlongRoute(activeRoute.coords, cumDist, totalMeters);
        recordRideSample({
          lng: end.coord[0],
          lat: end.coord[1],
          ele: getEleAtDist(totalMeters),
          speedKmh: 0,
          ts: Date.now(),
        });
        updateNavTelemetry({
          currentPos: end.coord,
          currentHeading: end.bearing,
          currentSpeedKmh: 0,
          distanceAlongM: totalMeters,
          isDemoMode: false,
        });
        announceNavAlert('Você chegou ao seu destino!', useAppStore.getState().voiceMode);
        pushToast('Chegada simulada!', 'Você completou o trajeto no modo demonstração.', 'emerald');
        stopNavigation();
        return;
      }
      const snap = interpolateAlongRoute(activeRoute.coords, cumDist, demoDistRef.current);
      const ahead = interpolateAlongRoute(
        activeRoute.coords,
        cumDist,
        Math.min(totalMeters, demoDistRef.current + 24)
      );
      const prevHeading = useAppStore.getState().nav.currentHeading;
      const targetBearing = (snap.bearing + normalizeAngleDiff(ahead.bearing - snap.bearing) * 0.45 + 360) % 360;
      const smoothHeading = (prevHeading + normalizeAngleDiff(targetBearing - prevHeading) * 0.32 + 360) % 360;
      const simSpeed = Math.round(cruiseKmh * (0.95 + Math.random() * 0.06));

      updateNavTelemetry({
        currentPos: snap.coord,
        currentHeading: smoothHeading,
        currentSpeedKmh: simSpeed,
        distanceAlongM: demoDistRef.current,
        offRouteMeters: 0,
      });

      recordRideSample({
        lng: snap.coord[0],
        lat: snap.coord[1],
        ele: getEleAtDist(demoDistRef.current),
        speedKmh: simSpeed,
        ts: Date.now(),
      });
    }, 220);

    return () => window.clearInterval(interval);
  }, [nav.isDemoMode, activeRoute, cumDist, totalMeters, activeMode?.topSpeed, recordRideSample, stopNavigation]);

  // Turn-by-turn & Arterial Crossing Voice Triggers (Guided mode only)
  const upcoming = useMemo(
    () => (activeRoute ? getUpcomingManeuver(activeRoute.maneuvers, nav.distanceAlongM) : null),
    [activeRoute, nav.distanceAlongM]
  );

  const upcomingCrossing = useMemo(() => {
    if (!activeRoute) return null;
    return (
      activeRoute.crossings.find(
        (c) =>
          typeof c.distanceAlongM === 'number' &&
          c.distanceAlongM > nav.distanceAlongM &&
          c.distanceAlongM - nav.distanceAlongM <= 160
      ) ?? null
    );
  }, [activeRoute, nav.distanceAlongM]);

  useEffect(() => {
    if (!upcoming) return;
    const d = upcoming.distToCurrentM;
    const bucket = d <= 32 ? 'now' : d <= 140 ? 'soon' : null;
    if (!bucket) return;
    const key = `${upcoming.current.index}-${bucket}`;
    if (lastSpokenKeyRef.current === key) return;
    lastSpokenKeyRef.current = key;
    announceNavAlert(buildSpokenManeuverPhrase(upcoming.current, d), voiceMode);
  }, [upcoming, voiceMode]);

  useEffect(() => {
    if (!upcomingCrossing) return;
    if (lastCrossingSpokenRef.current === upcomingCrossing.id) return;
    lastCrossingSpokenRef.current = upcomingCrossing.id;
    announceNavAlert(`Atenção: ${upcomingCrossing.name} à frente. Reduza a velocidade.`, voiceMode, true);
  }, [upcomingCrossing, voiceMode]);

  // Shared Right Floating Handlebar Controls
  const rightControls = (
    <div className="pointer-events-auto fixed right-2.5 top-1/2 flex -translate-y-1/2 flex-col gap-1.5 sm:right-3 sm:gap-2">
      <button
        type="button"
        onClick={() => updateNavTelemetry({ followUser: true })}
        title="Centralizar no GPS"
        aria-label="Centralizar no GPS"
        className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg backdrop-blur-xl transition-all sm:h-12 sm:w-12 ${
          nav.followUser
            ? 'bg-emerald-600 text-white'
            : 'glass-panel text-slate-700 hover:text-emerald-600 dark:text-slate-100'
        }`}
      >
        <LocateFixed className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
      </button>

      <button
        type="button"
        onClick={() => updateNavTelemetry({ pitch3D: !nav.pitch3D })}
        title={nav.pitch3D ? 'Modo 3D / Direção' : 'Modo 2D / Norte'}
        aria-label={nav.pitch3D ? 'Alternar para modo 2D' : 'Alternar para modo 3D'}
        className="glass-panel flex h-10 w-10 flex-col items-center justify-center rounded-2xl text-slate-800 shadow-lg dark:text-slate-100 sm:h-12 sm:w-12"
      >
        <Compass className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${nav.pitch3D ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
        <span className="text-[9px] font-extrabold leading-none">{nav.pitch3D ? '3D' : '2D'}</span>
      </button>

      <button
        type="button"
        onClick={cycleVoiceMode}
        title="Alternar Voz / Alerta / Mudo"
        aria-label="Alternar modo de áudio"
        className="glass-panel flex h-10 w-10 items-center justify-center rounded-2xl text-slate-800 shadow-lg dark:text-slate-100 sm:h-12 sm:w-12"
      >
        {voiceMode === 'voice' ? (
          <Volume2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" />
        ) : voiceMode === 'chime' ? (
          <Volume1 className="h-4.5 w-4.5 text-amber-500 sm:h-5 sm:w-5" />
        ) : (
          <VolumeX className="h-4.5 w-4.5 text-slate-400 sm:h-5 sm:w-5" />
        )}
      </button>

      <button
        type="button"
        onClick={() => openHazardReporter()}
        title="Reportar perigo na ciclovia"
        aria-label="Reportar perigo na ciclovia"
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
      >
        <AlertTriangle className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
      </button>

      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        className="glass-panel flex h-10 w-10 items-center justify-center rounded-2xl text-slate-800 shadow-lg dark:text-slate-100 sm:h-12 sm:w-12"
      >
        {isFullscreen ? (
          <Minimize2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" />
        ) : (
          <Maximize2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        )}
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        title="Tema Claro / Escuro"
        aria-label="Alternar tema claro ou escuro"
        className="glass-panel flex h-10 w-10 items-center justify-center rounded-2xl text-slate-800 shadow-lg dark:text-slate-100 sm:h-12 sm:w-12"
      >
        {theme === 'dark' ? (
          <Sun className="h-4.5 w-4.5 text-amber-400 sm:h-5 sm:w-5" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-slate-700 sm:h-5 sm:w-5" />
        )}
      </button>
    </div>
  );

  // ==============================================================
  // FREE RIDE ("MODO LIVRE") RECORDING HUD
  // ==============================================================
  if (nav.isFreeRide) {
    const rec = activeRide;
    const isPaused = Boolean(rec?.isPaused);
    const pauseLabel = rec?.manualPaused ? 'Pausado' : rec?.autoPaused ? 'Auto-pausa' : 'Gravando';

    return (
      <div
        id="eixoverde-freeride-hud"
        className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-3 safe-top safe-bottom"
      >
        {/* Top Free Ride Recorder Card */}
        <div className="mx-auto w-full max-w-lg">
          <div className="pointer-events-auto overflow-hidden rounded-3xl bg-emerald-950/95 px-4 py-3 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  <Activity className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-extrabold text-white">Modo Livre</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isPaused
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-emerald-500/25 text-emerald-300'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPaused ? 'bg-amber-400' : 'animate-pulse bg-emerald-400'
                        }`}
                      />
                      {pauseLabel}
                    </span>
                  </div>
                  <div className="truncate text-xs text-emerald-200/80">{activeVehicle.name}</div>
                </div>
              </div>

              <button
                id="eixoverde-freeride-pause-btn"
                type="button"
                onClick={toggleRidePause}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-white/15 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/25"
              >
                {rec?.manualPaused ? (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Retomar
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    Pausar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {rightControls}

        {/* Bottom Free Ride Speedometer + Live Stats + Finish Bar */}
        <div className="mx-auto flex w-full max-w-lg items-end gap-2 sm:gap-2.5">
          <div className="glass-panel pointer-events-auto flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full shadow-xl sm:h-16 sm:w-16">
            <span className="font-mono-num text-lg font-extrabold leading-none text-slate-900 dark:text-white sm:text-xl">
              {nav.currentSpeedKmh}
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              km/h
            </span>
          </div>

          <div className="glass-panel pointer-events-auto min-w-0 flex-1 overflow-hidden rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono-num whitespace-nowrap text-lg font-extrabold text-emerald-700 dark:text-emerald-400 sm:text-xl">
                    {(rec?.distanceKm ?? 0).toFixed(2).replace('.', ',')} km
                  </span>
                  <span className="font-mono-num whitespace-nowrap text-xs font-bold text-slate-700 dark:text-slate-200 sm:text-sm">
                    {formatStopwatchSec(rec?.movingDurationSec ?? 0)}
                  </span>
                </div>
                <div className="font-mono-num mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Total {formatStopwatchSec(rec?.totalDurationSec ?? 0)}</span>
                  <span>• Máx {Math.round(rec?.maxSpeedKmh ?? 0)} km/h</span>
                  <span>• +{Math.round(rec?.ascentM ?? 0)}m</span>
                </div>
              </div>

              <button
                id="eixoverde-freeride-finish-btn"
                type="button"
                onClick={stopNavigation}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-2xl bg-rose-600 px-3 text-xs font-extrabold text-white shadow-md shadow-rose-600/25 transition-colors hover:bg-rose-500 sm:h-11 sm:px-4 sm:text-sm"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // GUIDED TURN-BY-TURN NAVIGATION HUD (WITH AUTO-RECORDING)
  // ==============================================================
  if (!activeRoute || !upcoming) return null;

  const remainingMeters = Math.max(0, totalMeters - nav.distanceAlongM);
  const remainingFraction = Math.max(0, Math.min(1, remainingMeters / Math.max(1, totalMeters)));
  const progressPct = Math.min(100, Math.round((nav.distanceAlongM / totalMeters) * 100));
  const remainingCrossings = activeRoute.crossings.filter(
    (c) => (c.distanceAlongM ?? Infinity) > nav.distanceAlongM
  );
  const telemetry = computeRouteTelemetry(
    {
      ...activeRoute,
      distanceKm: Math.max(0.05, remainingMeters / 1000),
      crossings: remainingCrossings,
      elevation: {
        ...activeRoute.elevation,
        ascentM: Math.round(activeRoute.elevation.ascentM * remainingFraction),
        descentM: Math.round(activeRoute.elevation.descentM * remainingFraction),
      },
    },
    activeVehicle,
    selectedModeIndex,
    riderWeightKg,
    false,
    {
      weather,
      routeBearingDeg: computeRouteMainBearingDeg(activeRoute.coords),
      calibration: activeCalibration,
    }
  );

  const etaDate = new Date(Date.now() + telemetry.oneWayMin * 60000);
  const etaStr = etaDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-3 safe-top safe-bottom">
      {/* TOP TURN BANNER */}
      <div className="mx-auto w-full max-w-lg space-y-2">
        <div className="pointer-events-auto overflow-hidden rounded-3xl bg-emerald-950/95 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-3.5 py-3 sm:gap-3.5 sm:px-4 sm:py-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 shadow-inner sm:h-14 sm:w-14">
              <ManeuverIcon type={upcoming.current.type} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono-num text-xl font-extrabold leading-none tracking-tight text-emerald-300 sm:text-2xl">
                {formatDistancePtBR(upcoming.distToCurrentM)}
              </div>
              <div className="mt-1 truncate text-sm font-bold text-white sm:text-base">
                {upcoming.current.instruction}
              </div>
              {upcoming.next && (
                <div className="mt-0.5 truncate text-xs font-medium text-emerald-200/80">
                  Depois: {upcoming.next.instruction}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {nav.isDemoMode ? (
                <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-300">
                  Demo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      activeRide?.isPaused ? 'bg-amber-400' : 'animate-pulse bg-emerald-400'
                    }`}
                  />
                  {activeRide?.isPaused ? 'Pausa' : 'REC'}
                </span>
              )}
              {activeRide && (
                <span className="font-mono-num text-[10px] font-bold text-emerald-200/80">
                  {formatStopwatchSec(activeRide.movingDurationSec)}
                </span>
              )}
            </div>
          </div>

          {/* Upcoming Arterial Crossing Warning Strip */}
          {upcomingCrossing && (
            <div className="flex items-center gap-2 bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {upcomingCrossing.name} em {formatDistancePtBR((upcomingCrossing.distanceAlongM ?? 0) - nav.distanceAlongM)}
              </span>
            </div>
          )}

          {/* Off-Route Auto-Rerouting Banner */}
          {(nav.offRouteMeters > 0 || nav.isRerouting) && (
            <div className="flex items-center justify-between gap-2 bg-rose-600 px-4 py-2 text-xs font-bold text-white">
              <span className="inline-flex items-center gap-1.5">
                {nav.isRerouting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {nav.isRerouting
                  ? 'Recalculando rota segura...'
                  : `Fora da rota (${nav.offRouteMeters}m) — recalculando`}
              </span>
            </div>
          )}
        </div>
      </div>

      {rightControls}

      {/* BOTTOM SPEEDOMETER + ETA BAR */}
      <div className="mx-auto flex w-full max-w-lg items-end gap-2 sm:gap-2.5">
        {/* Speedometer Circle */}
        <div className="glass-panel pointer-events-auto flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full shadow-xl sm:h-16 sm:w-16">
          <span className="font-mono-num text-lg font-extrabold leading-none text-slate-900 dark:text-white sm:text-xl">
            {nav.currentSpeedKmh}
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            km/h
          </span>
        </div>

        {/* Bottom ETA / Progress / Exit Card */}
        <div className="glass-panel pointer-events-auto min-w-0 flex-1 overflow-hidden rounded-3xl shadow-2xl">
          <div className="h-1.5 w-full bg-slate-200/70 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono-num whitespace-nowrap text-lg font-extrabold text-emerald-700 dark:text-emerald-400 sm:text-xl">
                  {formatDurationPtBR(telemetry.oneWayMin)}
                </span>
                <span className="font-mono-num whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
                  {formatDistancePtBR(remainingMeters)}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
                <span className="whitespace-nowrap">Chegada {etaStr}</span>
                {activeVehicle.isElectric && (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-sky-600 dark:text-sky-400">
                    <BatteryCharging className="h-3.5 w-3.5 shrink-0" />
                    {telemetry.batteryLeftPct}% est.
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={stopNavigation}
              className="flex h-10 shrink-0 items-center gap-1 rounded-2xl bg-rose-600 px-3 text-xs font-extrabold text-white shadow-md shadow-rose-600/25 transition-colors hover:bg-rose-500 sm:h-11 sm:gap-1.5 sm:px-4 sm:text-sm"
            >
              <X className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
