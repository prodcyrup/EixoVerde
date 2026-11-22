import { describe, expect, it } from 'vitest';
import { PRESET_VEHICLES } from '../../data/vehicles';
import {
  appendRideSample,
  computeLifetimeRideStats,
  createRideRecording,
  decimateTrackPoints,
  exportRideToGpx,
  finalizeRideRecording,
  formatStopwatchSec,
  rideSessionToSavedRoute,
} from '../rideRecorder';

describe('rideRecorder.ts GPS auto-pause, telemetry & GPX export', () => {
  const jet = PRESET_VEHICLES.find((v) => v.id === 'jet-aluguel')!;

  it('auto-pauses moving timer at red lights (< 2 km/h) while advancing total duration', () => {
    const t0 = 1_700_000_000_000;
    let rec = createRideRecording({
      mode: 'free_ride',
      vehicle: jet,
      vehicleModeIndex: 1,
      initialPos: [-47.8825, -15.7942],
      startedAtMs: t0,
    });

    // Moving 5 seconds at 20 km/h northward (~28m)
    rec = appendRideSample(rec, {
      lng: -47.8825,
      lat: -15.79395,
      ele: 1080,
      speedKmh: 20,
      ts: t0 + 5000,
    });
    expect(rec.autoPaused).toBe(false);
    expect(rec.movingDurationSec).toBeCloseTo(5, 1);
    expect(rec.totalDurationSec).toBeCloseTo(5, 1);
    expect(rec.distanceKm).toBeGreaterThan(0.02);

    // Stopped at a red light for 10 seconds (0 km/h, same coords)
    rec = appendRideSample(rec, {
      lng: -47.8825,
      lat: -15.79395,
      ele: 1080,
      speedKmh: 0,
      ts: t0 + 15000,
    });
    expect(rec.autoPaused).toBe(true);
    expect(rec.isPaused).toBe(true);
    expect(rec.movingDurationSec).toBeCloseTo(5, 1);
    expect(rec.totalDurationSec).toBeCloseTo(15, 1);

    // Resumes riding (+20m climb over 10s)
    rec = appendRideSample(rec, {
      lng: -47.8825,
      lat: -15.7934,
      ele: 1092,
      speedKmh: 22,
      ts: t0 + 25000,
    });
    expect(rec.autoPaused).toBe(false);
    expect(rec.movingDurationSec).toBeCloseTo(15, 1);
    expect(rec.totalDurationSec).toBeCloseTo(25, 1);
    expect(rec.ascentM).toBeCloseTo(12, 1);
    expect(rec.maxSpeedKmh).toBe(22);

    const finalized = finalizeRideRecording(rec, jet, 75, null, t0 + 25000);
    expect(finalized.movingDurationSec).toBe(15);
    expect(finalized.totalDurationSec).toBe(25);
    expect(finalized.isDemo).toBe(false);
    expect(finalized.track.length).toBeGreaterThanOrEqual(2);

    // Promote to SavedRoute and export GPX
    const route = rideSessionToSavedRoute(finalized);
    expect(route).not.toBeNull();
    expect(route?.coords.length).toBe(finalized.track.length);
    expect(route?.city).toBe('Brasília, DF');

    const spRoute = rideSessionToSavedRoute(finalized, 'São Paulo, SP');
    expect(spRoute?.city).toBe('São Paulo, SP');

    const gpx = exportRideToGpx(finalized);
    expect(gpx).toContain('<gpx version="1.1"');
    expect(gpx).toContain('<trkpt');
  });

  it('rejects impossible GPS teleports and decimates oversized tracks cleanly', () => {
    const t0 = 1_700_000_000_000;
    let rec = createRideRecording({
      mode: 'guided',
      vehicle: jet,
      vehicleModeIndex: 1,
      initialPos: [-47.8825, -15.7942],
      startedAtMs: t0,
    });

    // Teleport 50 km away in 1 second -> must be rejected
    rec = appendRideSample(rec, {
      lng: -48.35,
      lat: -15.7942,
      speedKmh: 18,
      ts: t0 + 1000,
    });
    expect(rec.distanceKm).toBe(0);
    expect(rec.track).toHaveLength(1);

    // Track decimation preserves start & end
    const dense = Array.from({ length: 1000 }, (_, i) => ({
      lng: -47.88 + i * 0.0001,
      lat: -15.79,
      ts: t0 + i * 1000,
      speedKmh: 20,
    }));
    const slim = decimateTrackPoints(dense, 100);
    expect(slim).toHaveLength(100);
    expect(slim[0]).toEqual(dense[0]);
    expect(slim[99]).toEqual(dense[999]);
  });

  it('excludes Demo simulations from real lifetime stats while counting both separately', () => {
    const t0 = 1_700_000_000_000;
    const realRec = appendRideSample(
      createRideRecording({
        mode: 'free_ride',
        vehicle: jet,
        vehicleModeIndex: 1,
        initialPos: [-47.8825, -15.7942],
        startedAtMs: t0,
      }),
      { lng: -47.8825, lat: -15.7842, speedKmh: 20, ts: t0 + 180000 }
    );
    const demoRec = appendRideSample(
      createRideRecording({
        mode: 'demo',
        vehicle: jet,
        vehicleModeIndex: 1,
        initialPos: [-47.8825, -15.7942],
        startedAtMs: t0,
      }),
      { lng: -47.8825, lat: -15.7542, speedKmh: 24, ts: t0 + 300000 }
    );

    const realRide = finalizeRideRecording(realRec, jet, 75, null, t0 + 180000);
    const demoRide = finalizeRideRecording(demoRec, jet, 75, null, t0 + 300000);
    expect(demoRide.isDemo).toBe(true);

    const lifetime = computeLifetimeRideStats([realRide, demoRide]);
    expect(lifetime.totalRealRides).toBe(1);
    expect(lifetime.totalDemoRides).toBe(1);
    expect(lifetime.totalDistanceKm).toBeCloseTo(realRide.distanceKm, 2);
    expect(formatStopwatchSec(3665)).toBe('1:01:05');
    expect(formatStopwatchSec(125)).toBe('02:05');
  });
});
