import { getCapitalBySlug } from '../data/brazilCities';
import type { OfflineCacheStatus } from '../types';

const OFFLINE_CACHE_NAME = 'eixoverde-df-offline-v1';
const CACHE_META_KEY_PREFIX = 'eixoverde_offline_cache_ts';

export function buildCityAssetUrls(
  baseUrl: string,
  citySlug = 'brasilia'
): { lanes: string; pois: string; icon: string; extra: string[] } {
  const base = (baseUrl || '/').replace(/\/?$/, '/');
  const cap = getCapitalBySlug(citySlug);
  const isDf = cap.slug === 'brasilia';
  return {
    lanes: isDf ? `${base}data/ciclomapa-df-lanes.geojson` : `${base}${cap.lanesUrl}`,
    pois: isDf ? `${base}data/ciclomapa-df-pois.geojson` : `${base}${cap.poisUrl}`,
    icon: `${base}icons/eixoverde-icon.svg`,
    extra: ['https://tiles.openfreemap.org/styles/liberty'],
  };
}

export async function checkOfflineDfCacheStatus(
  baseUrl = '/',
  citySlug = 'brasilia'
): Promise<OfflineCacheStatus> {
  const cap = getCapitalBySlug(citySlug);
  const metaKey = `${CACHE_META_KEY_PREFIX}:${cap.slug}`;
  let lastUpdatedAt: string | null = null;
  try {
    if (typeof localStorage !== 'undefined') {
      lastUpdatedAt =
        localStorage.getItem(metaKey) ??
        (cap.slug === 'brasilia' ? localStorage.getItem(CACHE_META_KEY_PREFIX) : null);
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
    const urls = buildCityAssetUrls(baseUrl, cap.slug);
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
 * Pre-warms the selected capital's CicloMapa bike-lane network, shared station/POI dataset,
 * app icon, and fallback vector style into the browser Cache API for 100% offline rides.
 */
export async function warmOfflineDfCache(
  baseUrl = '/',
  citySlug = 'brasilia'
): Promise<OfflineCacheStatus> {
  const cap = getCapitalBySlug(citySlug);
  if (typeof caches === 'undefined') {
    return checkOfflineDfCacheStatus(baseUrl, cap.slug);
  }

  const urls = buildCityAssetUrls(baseUrl, cap.slug);
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
        localStorage.setItem(`${CACHE_META_KEY_PREFIX}:${cap.slug}`, nowIso);
        if (cap.slug === 'brasilia') {
          localStorage.setItem(CACHE_META_KEY_PREFIX, nowIso);
        }
      }
    } catch {
      // Ignore
    }
  } catch {
    // Graceful fallback when completely offline
  }

  return checkOfflineDfCacheStatus(baseUrl, cap.slug);
}
