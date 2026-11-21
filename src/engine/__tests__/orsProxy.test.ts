import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as authServiceMod from '../../cloud/authService';
import {
  isOrsProxyCircuitOpen,
  planMultiProfileRoutes,
  resetOrsProxyCircuitBreakerForTests,
} from '../routing';

const sampleOrsFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-47.8992, -15.7524, 1070],
          [-47.901, -15.77, 1085],
          [-47.9052, -15.8026, 1112],
        ],
      },
      properties: {
        summary: { distance: 6150 },
        extras: {
          waytypes: {
            summary: [{ value: 6, distance: 5000, amount: 82 }],
          },
        },
      },
    },
  ],
};

describe('routing.ts ORS Edge Function proxy & fallback priority chain', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    resetOrsProxyCircuitBreakerForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    resetOrsProxyCircuitBreakerForTests();
  });

  it('calls Supabase ors-proxy with apikey header and omits Authorization: Bearer for sb_publishable_ keys when unauthenticated', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://tuocwnjnkihchlxxqmgi.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_Biywe21SerSFL7yZYtl4nw_8X-dxTest');
    vi.spyOn(authServiceMod, 'getCurrentSession').mockResolvedValue({ user: null, accessToken: null });

    const seenHeaders: Array<Record<string, string>> = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('/functions/v1/ors-proxy')) {
        seenHeaders.push((init?.headers ?? {}) as Record<string, string>);
        return new Response(JSON.stringify(sampleOrsFeatureCollection), { status: 200 });
      }
      return new Response('Not found', { status: 404 });
    });

    const routes = await planMultiProfileRoutes(
      [
        [-47.8992, -15.7524],
        [-47.9052, -15.8026],
      ],
      'SGAN 912',
      'Parque da Cidade'
    );

    expect(routes.length).toBeGreaterThanOrEqual(1);
    expect(routes[0].source).toBe('ors');
    expect(seenHeaders.length).toBe(3);
    expect(seenHeaders[0].apikey).toBe('sb_publishable_Biywe21SerSFL7yZYtl4nw_8X-dxTest');
    expect(seenHeaders[0].Authorization).toBeUndefined();
    expect(isOrsProxyCircuitOpen()).toBe(false);
  });

  it('sends Authorization: Bearer <accessToken> to ors-proxy when an authenticated session exists', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://tuocwnjnkihchlxxqmgi.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_Biywe21SerSFL7yZYtl4nw_8X-dxTest');
    vi.spyOn(authServiceMod, 'getCurrentSession').mockResolvedValue({
      user: { id: 'u-1', email: 'vitor@df.gov.br' },
      accessToken: 'user-jwt-token-xyz',
    });

    let authHeader: string | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const hdrs = (init?.headers ?? {}) as Record<string, string>;
      authHeader = hdrs.Authorization;
      return new Response(JSON.stringify(sampleOrsFeatureCollection), { status: 200 });
    });

    await planMultiProfileRoutes([
      [-47.8992, -15.7524],
      [-47.9052, -15.8026],
    ]);
    expect(authHeader).toBe('Bearer user-jwt-token-xyz');
  });

  it('falls back cleanly from ors-proxy (503) -> direct VITE_ORS_KEY -> BRouter -> OSRM -> Offline', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://tuocwnjnkihchlxxqmgi.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_Biywe21SerSFL7yZYtl4nw_8X-dxTest');
    vi.stubEnv('VITE_ORS_KEY', '');
    vi.spyOn(authServiceMod, 'getCurrentSession').mockResolvedValue({ user: null, accessToken: null });

    // All remote routing services fail -> must gracefully return offline straight-line route
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Service unavailable', { status: 503 }));

    const offlineRoutes = await planMultiProfileRoutes([
      [-47.8992, -15.7524],
      [-47.9052, -15.8026],
    ]);
    expect(offlineRoutes).toHaveLength(1);
    expect(offlineRoutes[0].source).toBe('custom');
    expect(offlineRoutes[0].title).toContain('Offline');
    expect(isOrsProxyCircuitOpen()).toBe(true);
  });

  it('opens circuit breaker after ors-proxy network/CORS failure so subsequent route plans emit zero proxy calls', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://tuocwnjnkihchlxxqmgi.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_Biywe21SerSFL7yZYtl4nw_8X-dxTest');
    vi.stubEnv('VITE_ORS_KEY', '');
    vi.spyOn(authServiceMod, 'getCurrentSession').mockResolvedValue({ user: null, accessToken: null });

    let proxyCalls = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('/functions/v1/ors-proxy')) {
        proxyCalls += 1;
        throw new TypeError('Failed to fetch (CORS)');
      }
      return new Response('Unavailable', { status: 503 });
    });

    await planMultiProfileRoutes([
      [-47.8992, -15.7524],
      [-47.9052, -15.8026],
    ]);
    expect(isOrsProxyCircuitOpen()).toBe(true);
    const callsAfterFirst = proxyCalls;
    expect(callsAfterFirst).toBeGreaterThanOrEqual(1);

    // Second route swap must not hit ors-proxy at all
    await planMultiProfileRoutes([
      [-47.9052, -15.8026],
      [-47.8992, -15.7524],
    ]);
    expect(proxyCalls).toBe(callsAfterFirst);
  });
});
