import type {
  Coord3D,
  LngLat,
  RideMode,
  RideSession,
  RideTrackPoint,
  SavedRoute,
  VehicleSpec,
  WeatherSnapshot,
} from '../types';
import {
  computeElevationStats,
  computePathDistanceKm,
  computeSurfaceBreakdown,
  haversineMeters,
} from './geo';
import { exportRouteToGpx } from './gpx';
import { computeRouteTelemetry } from './telemetry';

export const AUTO_PAUSE_SPEED_KMH = 2.0;
export const MAX_RECORDED_TRACK_POINTS = 400;

export interface ActiveRideRecording {
  mode: RideMode;
  isDemo: boolean;
  title: string;
  routeId?: string;
  originName?: string;
  destName?: string;
  vehicleId: string;
  vehicleName: string;
  vehicleModeIndex: number;
  isElectric: boolean;
  startedAtMs: number;
  lastTickMs: number;
  manualPaused: boolean;
  autoPaused: boolean;
  isPaused: boolean;
  movingDurationSec: number;
  totalDurationSec: number;
  distanceKm: number;
  maxSpeedKmh: number;
  ascentM: number;
  descentM: number;
  lastEleM?: number;
  track: RideTrackPoint[];
}

export interface LifetimeRideStats {
  totalRealRides: number;
  totalDemoRides: number;
  totalDistanceKm: number;
  totalMovingSec: number;
  totalCo2SavedKg: number;
  totalCaloriesKcal: number;
  bestMaxSpeedKmh: number;
}

export function createRideRecording(params: {
  mode: RideMode;
  vehicle: VehicleSpec;
  vehicleModeIndex: number;
  title?: string;
  routeId?: string;
  originName?: string;
  destName?: string;
  initialPos?: LngLat | null;
  startedAtMs?: number;
}): ActiveRideRecording {
  const nowMs = params.startedAtMs ?? Date.now();
  const dateLabel = new Date(nowMs).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
  const timeLabel = new Date(nowMs).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const defaultTitle =
    params.title?.trim() ||
    (params.mode === 'free_ride'
      ? `Modo Livre • ${dateLabel} ${timeLabel}`
      : `Trajeto • ${dateLabel} ${timeLabel}`);

  const initialTrack: RideTrackPoint[] = params.initialPos
    ? [
        {
          lng: +params.initialPos[0].toFixed(6),
          lat: +params.initialPos[1].toFixed(6),
          ts: nowMs,
          speedKmh: 0,
        },
      ]
    : [];

  return {
    mode: params.mode,
    isDemo: params.mode === 'demo',
    title: defaultTitle,
    routeId: params.routeId,
    originName: params.originName,
    destName: params.destName,
    vehicleId: params.vehicle.id,
    vehicleName: params.vehicle.name,
    vehicleModeIndex: params.vehicleModeIndex,
    isElectric: params.vehicle.isElectric,
    startedAtMs: nowMs,
    lastTickMs: nowMs,
    manualPaused: false,
    autoPaused: false,
    isPaused: false,
    movingDurationSec: 0,
    totalDurationSec: 0,
    distanceKm: 0,
    maxSpeedKmh: 0,
    ascentM: 0,
    descentM: 0,
    track: initialTrack,
  };
}

/**
 * Evenly decimates track points to keep IndexedDB & Supabase JSONB compact
 * while preserving exact start and end endpoints.
 */
export function decimateTrackPoints(
  points: RideTrackPoint[],
  maxPoints = MAX_RECORDED_TRACK_POINTS
): RideTrackPoint[] {
  if (points.length <= maxPoints) return points;
  const out: RideTrackPoint[] = [points[0]];
  const step = (points.length - 1) / (maxPoints - 1);
  for (let i = 1; i < maxPoints - 1; i++) {
    out.push(points[Math.round(i * step)]);
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * Pure reducer that appends a GPS (or demo simulation) telemetry sample with:
 * - GPS teleport rejection
 * - Smart Auto-Pause (< 2 km/h & < 2.5m movement)
 * - Separate moving vs. total duration timers
 * - Elevation jitter filtering (1.5m deadband)
 */
export function appendRideSample(
  rec: ActiveRideRecording,
  sample: {
    lng: number;
    lat: number;
    ele?: number;
    speedKmh: number;
    ts?: number;
  }
): ActiveRideRecording {
  const ts = sample.ts ?? Date.now();
  const dtSec = Math.max(0, Math.min(30, (ts - rec.lastTickMs) / 1000));
  const nextTotalSec = rec.totalDurationSec + dtSec;

  if (rec.manualPaused) {
    return {
      ...rec,
      lastTickMs: ts,
      totalDurationSec: nextTotalSec,
      isPaused: true,
    };
  }

  const prevPt = rec.track.length > 0 ? rec.track[rec.track.length - 1] : null;
  const deltaMeters = prevPt
    ? haversineMeters([prevPt.lng, prevPt.lat], [sample.lng, sample.lat])
    : 0;

  // Reject impossible GPS teleports (> 350m jump with implied speed > 95 km/h)
  if (prevPt && dtSec > 0 && deltaMeters > 350) {
    const impliedKmh = (deltaMeters / dtSec) * 3.6;
    if (impliedKmh > 95) {
      return {
        ...rec,
        lastTickMs: ts,
        totalDurationSec: nextTotalSec,
      };
    }
  }

  const safeSpeedKmh = Number.isFinite(sample.speedKmh) && sample.speedKmh >= 0 ? sample.speedKmh : 0;
  const derivedKmh =
    safeSpeedKmh > 0
      ? safeSpeedKmh
      : dtSec >= 0.4 && deltaMeters > 1
        ? (deltaMeters / dtSec) * 3.6
        : 0;

  // Smart Auto-Pause when stopped at traffic lights or arterial crossings (< 2 km/h)
  const isStopped = derivedKmh < AUTO_PAUSE_SPEED_KMH && deltaMeters < 2.5;
  const nextMovingSec = isStopped ? rec.movingDurationSec : rec.movingDurationSec + dtSec;
  const nextDistanceKm = isStopped
    ? rec.distanceKm
    : rec.distanceKm + (deltaMeters >= 1.2 ? deltaMeters / 1000 : 0);
  const nextMaxSpeed = Math.max(rec.maxSpeedKmh, Math.min(85, Math.round(derivedKmh)));

  // Elevation accumulation with 1.5m jitter deadband
  let nextAscent = rec.ascentM;
  let nextDescent = rec.descentM;
  let nextLastEle = rec.lastEleM;
  if (typeof sample.ele === 'number' && Number.isFinite(sample.ele)) {
    if (typeof rec.lastEleM === 'number') {
      const diff = sample.ele - rec.lastEleM;
      if (diff >= 1.5) {
        nextAscent += diff;
        nextLastEle = sample.ele;
      } else if (diff <= -1.5) {
        nextDescent += Math.abs(diff);
        nextLastEle = sample.ele;
      }
    } else {
      nextLastEle = sample.ele;
    }
  }

  const shouldAppendPoint =
    !prevPt || deltaMeters >= 6 || ts - prevPt.ts >= 5000;

  let nextTrack = rec.track;
  if (shouldAppendPoint) {
    const pt: RideTrackPoint = {
      lng: +sample.lng.toFixed(6),
      lat: +sample.lat.toFixed(6),
      ...(typeof sample.ele === 'number' && Number.isFinite(sample.ele)
        ? { ele: +sample.ele.toFixed(1) }
        : {}),
      ts,
      speedKmh: +Math.min(85, derivedKmh).toFixed(1),
    };
    nextTrack = [...rec.track, pt];
    if (nextTrack.length > MAX_RECORDED_TRACK_POINTS + 40) {
      nextTrack = decimateTrackPoints(nextTrack, MAX_RECORDED_TRACK_POINTS);
    }
  }

  return {
    ...rec,
    lastTickMs: ts,
    autoPaused: isStopped,
    isPaused: isStopped,
    movingDurationSec: nextMovingSec,
    totalDurationSec: nextTotalSec,
    distanceKm: nextDistanceKm,
    maxSpeedKmh: nextMaxSpeed,
    ascentM: nextAscent,
    descentM: nextDescent,
    lastEleM: nextLastEle,
    track: nextTrack,
  };
}

/**
 * Converts an active ride recording into a completed, persistable RideSession.
 */
export function finalizeRideRecording(
  rec: ActiveRideRecording,
  vehicle: VehicleSpec,
  riderWeightKg: number,
  weather: WeatherSnapshot | null,
  endedAtMs = Date.now()
): RideSession {
  const compactTrack = decimateTrackPoints(rec.track, MAX_RECORDED_TRACK_POINTS);
  const trackDistanceKm =
    compactTrack.length >= 2
      ? computePathDistanceKm(compactTrack.map((p) => [p.lng, p.lat] as LngLat))
      : 0;
  const distanceKm = +Math.max(rec.distanceKm, trackDistanceKm).toFixed(2);
  let movingDurationSec = Math.max(1, Math.round(rec.movingDurationSec));
  let totalDurationSec = Math.max(movingDurationSec, Math.round(rec.totalDurationSec));
  let avgSpeedKmh =
    movingDurationSec >= 3 ? +(distanceKm / (movingDurationSec / 3600)).toFixed(1) : 0;

  // Demo mode runs at 2.3x playback speed; normalize avg speed & duration to realistic vehicle speed
  if (rec.isDemo) {
    const movingSamples = compactTrack.filter((p) => p.speedKmh > 1);
    if (movingSamples.length > 0) {
      const meanSimKmh =
        movingSamples.reduce((acc, p) => acc + p.speedKmh, 0) / movingSamples.length;
      avgSpeedKmh = +meanSimKmh.toFixed(1);
      if (distanceKm > 0 && avgSpeedKmh > 0) {
        const realisticSec = Math.max(movingDurationSec, Math.round((distanceKm / avgSpeedKmh) * 3600));
        movingDurationSec = realisticSec;
        totalDurationSec = Math.max(totalDurationSec, realisticSec);
      }
    }
  }

  const maxSpeedKmh = Math.max(Math.round(rec.maxSpeedKmh), Math.round(avgSpeedKmh));
  const ascentM = Math.max(0, Math.round(rec.ascentM));
  const descentM = Math.max(0, Math.round(rec.descentM));

  // Uncalibrated nominal estimate for baseline calories, CO2, and battery calibration reference
  const nominalTelemetry = computeRouteTelemetry(
    {
      distanceKm: Math.max(0.15, distanceKm),
      elevation: {
        elevations: [],
        ascentM,
        descentM,
        minM: 1000,
        maxM: 1000 + ascentM,
        isRealElevation: true,
      },
      crossings: [],
      surfaces: {
        cicloviaPct: 75,
        ciclofaixaPct: 10,
        baixaVelPct: 10,
        trilhaPct: 0,
        viaComumPct: 5,
        safetyScore: 85,
      },
    },
    vehicle,
    rec.vehicleModeIndex,
    riderWeightKg,
    false
  );

  const nowIso = new Date(endedAtMs).toISOString();
  return {
    id: `ride-${endedAtMs}`,
    title: rec.title,
    mode: rec.mode,
    isDemo: rec.isDemo,
    startedAt: new Date(rec.startedAtMs).toISOString(),
    endedAt: nowIso,
    movingDurationSec,
    totalDurationSec,
    distanceKm,
    avgSpeedKmh,
    maxSpeedKmh,
    ascentM,
    descentM,
    caloriesKcal: nominalTelemetry.caloriesKcal,
    co2SavedKg: +(distanceKm * 0.175).toFixed(2),
    vehicleId: rec.vehicleId,
    vehicleName: rec.vehicleName,
    vehicleModeIndex: rec.vehicleModeIndex,
    isElectric: rec.isElectric,
    estimatedBatteryUsedPct: rec.isElectric ? nominalTelemetry.batteryUsedPct : undefined,
    weatherSummary: weather
      ? {
          temperatureC: weather.temperatureC,
          windSpeedKmh: weather.windSpeedKmh,
          rainProbabilityPct: weather.rainProbabilityPct,
          label: weather.label,
        }
      : undefined,
    routeId: rec.routeId,
    originName: rec.originName,
    destName: rec.destName,
    track: compactTrack,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function formatStopwatchSec(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

/**
 * Computes lifetime summary metrics. Real rides count toward lifetime totals;
 * Demo simulations are tracked separately so tests never pollute real stats.
 */
export function computeLifetimeRideStats(rides: RideSession[]): LifetimeRideStats {
  const real = rides.filter((r) => !r.isDemo);
  const demoCount = rides.length - real.length;

  let totalDistanceKm = 0;
  let totalMovingSec = 0;
  let totalCo2SavedKg = 0;
  let totalCaloriesKcal = 0;
  let bestMaxSpeedKmh = 0;

  for (const r of real) {
    totalDistanceKm += r.distanceKm || 0;
    totalMovingSec += r.movingDurationSec || 0;
    totalCo2SavedKg += r.co2SavedKg || 0;
    totalCaloriesKcal += r.caloriesKcal || 0;
    if ((r.maxSpeedKmh || 0) > bestMaxSpeedKmh) {
      bestMaxSpeedKmh = r.maxSpeedKmh;
    }
  }

  return {
    totalRealRides: real.length,
    totalDemoRides: demoCount,
    totalDistanceKm: +totalDistanceKm.toFixed(2),
    totalMovingSec,
    totalCo2SavedKg: +totalCo2SavedKg.toFixed(2),
    totalCaloriesKcal: Math.round(totalCaloriesKcal),
    bestMaxSpeedKmh: Math.round(bestMaxSpeedKmh),
  };
}

/**
 * Promotes a recorded RideSession into a reusable SavedRoute in 'Rotas Salvas'.
 */
export function rideSessionToSavedRoute(ride: RideSession): SavedRoute | null {
  if (!ride.track || ride.track.length < 2) return null;
  const coords: Coord3D[] = ride.track.map((pt) =>
    typeof pt.ele === 'number' ? [pt.lng, pt.lat, pt.ele] : [pt.lng, pt.lat]
  );
  const elev = computeElevationStats(coords);
  const surf = computeSurfaceBreakdown(coords, 'safe');
  const first: LngLat = [coords[0][0], coords[0][1]];
  const last: LngLat = [coords[coords.length - 1][0], coords[coords.length - 1][1]];
  const nowIso = new Date().toISOString();

  return {
    id: `route-from-${ride.id}`,
    name: ride.title,
    description: `Gravada com ${ride.vehicleName} • ${ride.distanceKm.toFixed(1).replace('.', ',')} km`,
    tag: `Trajeto Gravado • ${surf.safetyScore}% segura`,
    createdAt: nowIso,
    updatedAt: nowIso,
    isFavorite: true,
    difficulty:
      elev.ascentM > 220 || ride.distanceKm > 25
        ? 'Desafiador'
        : ride.distanceKm > 10
          ? 'Moderado'
          : 'Fácil',
    city: 'Brasília, DF',
    profile: 'safe',
    coords,
    waypoints: [first, last],
    distanceKm: ride.distanceKm,
    ascentM: Math.max(ride.ascentM, elev.ascentM),
    descentM: Math.max(ride.descentM, elev.descentM),
    safetyScore: surf.safetyScore,
    originName: ride.originName,
    destName: ride.destName,
  };
}

export function exportRideToGpx(ride: RideSession): string {
  const coords: Coord3D[] = ride.track.map((pt) =>
    typeof pt.ele === 'number' ? [pt.lng, pt.lat, pt.ele] : [pt.lng, pt.lat]
  );
  const desc = `Trajeto EixoVerde • ${ride.vehicleName} • ${ride.distanceKm.toFixed(2)} km • Média ${ride.avgSpeedKmh} km/h`;
  return exportRouteToGpx(ride.title, coords, desc);
}
