import type { OfflineCacheStatus } from '../types';

const OFFLINE_CACHE_NAME = 'eixoverde-df-offline-v1';
const CACHE_META_KEY = 'eixoverde_offline_cache_ts';

function buildAssetUrls(baseUrl: string): { lanes: string; pois: string; icon: string; extra: string[] } {
  const base = (baseUrl || '/').replace(/\/?$/, '/');
  return {
    lanes: `${base}data/ciclomapa-df-lanes.geojson`,
    pois: `${base}data/ciclomapa-df-pois.geojson`,
    icon: `${base}icons/eixoverde-icon.svg`,
    extra: ['https://tiles.openfreemap.org/styles/liberty'],
  };
}

export async function checkOfflineDfCacheStatus(baseUrl = '/'): Promise<OfflineCacheStatus> {
  let lastUpdatedAt: string | null = null;
  try {
    if (typeof localStorage !== 'undefined') {
      lastUpdatedAt = localStorage.getItem(CACHE_META_KEY);
    }
  } catch {
    // Ignore storage errors
  }

  if (typeof caches === 'undefined') {
    return {
      ready: false,
      lanesCached: false,
      poisCached: false,
      cachedCount: 0,
      lastUpdatedAt,
    };
  }

  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const keys = await cache.keys();
    const urls = buildAssetUrls(baseUrl);
    const lanesCached = Boolean(await cache.match(urls.lanes));
    const poisCached = Boolean(await cache.match(urls.pois));
    return {
      ready: lanesCached && poisCached,
      lanesCached,
      poisCached,
      cachedCount: keys.length,
      lastUpdatedAt,
    };
  } catch {
    return {
      ready: false,
      lanesCached: false,
      poisCached: false,
      cachedCount: 0,
      lastUpdatedAt,
    };
  }
}

/**
 * Pre-warms the DF CicloMapa bike-lane network, Tembici/JET POI dataset, app icon,
 * and fallback vector style into the browser Cache API so rides stay 100% usable offline.
 */
export async function warmOfflineDfCache(baseUrl = '/'): Promise<OfflineCacheStatus> {
  if (typeof caches === 'undefined') {
    return checkOfflineDfCacheStatus(baseUrl);
  }

  const urls = buildAssetUrls(baseUrl);
  const targets = [urls.lanes, urls.pois, urls.icon, ...urls.extra];

  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    await Promise.allSettled(
      targets.map(async (u) => {
        const res = await fetch(u, { cache: 'no-cache' });
        if (res.ok) {
          await cache.put(u, res.clone());
        }
      })
    );
    const nowIso = new Date().toISOString();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_META_KEY, nowIso);
      }
    } catch {
      // Ignore
    }
  } catch {
    // Graceful fallback when completely offline
  }

  return checkOfflineDfCacheStatus(baseUrl);
}
