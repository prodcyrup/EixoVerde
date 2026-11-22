import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchGeoJsonWithOfflineFallback,
  getCachedOfflineCitySlugs,
  warmOfflineDfCache,
} from '../offlineCache';

function createMemoryCaches() {
  const store = new Map<string, Response>();
  const cacheObj = {
    match: vi.fn(async (url: string) => store.get(url)),
    put: vi.fn(async (url: string, res: Response) => {
      store.set(url, res);
    }),
    keys: vi.fn(async () => Array.from(store.keys()).map((url) => ({ url }))),
  };
  return {
    store,
    cachesMock: {
      open: vi.fn(async () => cacheObj),
    },
  };
}

function createMemoryLocalStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => {
      map.clear();
    },
  };
}

describe('offlineCache.ts — Offline Fallback & Free-Tier Quota Guard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('serves cached GeoJSON from Cache API when network fetch fails in airplane mode', async () => {
    const { store, cachesMock } = createMemoryCaches();
    const sampleFC: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { kind: 'ciclovia', name: 'Ciclovia Av. Paulista' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-46.656, -23.561],
              [-46.645, -23.569],
            ],
          },
        },
      ],
    };
    const targetUrl = '/app/data/capitals/sao-paulo-lanes.geojson';
    store.set(targetUrl, new Response(JSON.stringify(sampleFC), { status: 200 }));

    vi.stubGlobal('caches', cachesMock);
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));

    const loaded = await fetchGeoJsonWithOfflineFallback(targetUrl);
    expect(loaded).not.toBeNull();
    expect(loaded?.features).toHaveLength(1);
    expect(loaded?.features[0].properties?.name).toBe('Ciclovia Av. Paulista');
  });

  it('does NOT consume Free-tier offline city quota when warmOfflineDfCache fails offline', async () => {
    const { cachesMock } = createMemoryCaches();
    vi.stubGlobal('localStorage', createMemoryLocalStorage());
    vi.stubGlobal('caches', cachesMock);
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Offline');
    }));

    const status = await warmOfflineDfCache('/app/', 'sao-paulo');
    expect(status.ready).toBe(false);
    expect(getCachedOfflineCitySlugs()).toEqual([]);
  });

  it('records city slug and reports ready=true only after both lanes and pois are cached', async () => {
    const { cachesMock } = createMemoryCaches();
    vi.stubGlobal('localStorage', createMemoryLocalStorage());
    vi.stubGlobal('caches', cachesMock);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }), { status: 200 }))
    );

    const status = await warmOfflineDfCache('/app/', 'curitiba');
    expect(status.ready).toBe(true);
    expect(status.lanesCached).toBe(true);
    expect(status.poisCached).toBe(true);
    expect(getCachedOfflineCitySlugs()).toContain('curitiba');
  });
});
