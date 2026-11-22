import { getCurrentSession } from '../cloud/authService';
import { BRAND } from '../config/brand';
import {
  API_KEYS,
  ENDPOINTS,
  getOrsProxyUrl,
  getSupabaseConfig,
  hasOrsKey,
  hasSupabaseConfig,
} from '../config/providers';
import { getCapitalBySlug } from '../data/brazilCities';
import { ALL_POPULAR_PLACES, getPopularPlacesForCity } from '../data/curatedRoutes';
import type {
  Coord3D,
  LngLat,
  PlaceResult,
  RouteCandidate,
  RouteProfileId,
  SurfaceBreakdown,
} from '../types';
import {
  computeElevationStats,
  computePathDistanceKm,
  computeSurfaceBreakdown,
  detectArterialCrossings,
  haversineMeters,
} from './geo';
import { extractRouteManeuvers } from './navigation';

interface ProfileMeta {
  profile: RouteProfileId;
  title: string;
  subtitle: string;
  orsProfile: 'cycling-regular' | 'cycling-electric' | 'cycling-road';
  orsEndpoint: string;
  orsPreference: 'recommended' | 'shortest';
  brouterProfile: string;
}

const PROFILE_DEFS: ProfileMeta[] = [
  {
    profile: 'safe',
    title: 'Mais Segura • Ciclovias',
    subtitle: 'Prioriza ciclovias segregadas, parques e vias calmas',
    orsProfile: 'cycling-regular',
    orsEndpoint: ENDPOINTS.orsCyclingRegular,
    orsPreference: 'recommended',
    brouterProfile: 'safety',
  },
  {
    profile: 'balanced',
    title: 'Equilibrada',
    subtitle: 'Bom equilíbrio entre ciclovias e tempo de viagem',
    orsProfile: 'cycling-electric',
    orsEndpoint: ENDPOINTS.orsCyclingElectric,
    orsPreference: 'recommended',
    brouterProfile: 'trekking',
  },
  {
    profile: 'fast',
    title: 'Mais Rápida',
    subtitle: 'Trajeto mais direto para velocidade de cruzeiro',
    orsProfile: 'cycling-road',
    orsEndpoint: ENDPOINTS.orsCyclingRoad,
    orsPreference: 'shortest',
    brouterProfile: 'fastbike',
  },
];

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 8500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Parses OpenRouteService extra_info.waytypes summary into EixoVerde SurfaceBreakdown
 * when available (works nationwide across Brazil!).
 */
function parseOrsWaytypes(
  summary: Array<{ value: number; distance: number; amount: number }> | undefined,
  coords: Coord3D[],
  profile: RouteProfileId
): SurfaceBreakdown {
  if (!Array.isArray(summary) || summary.length === 0) {
    return computeSurfaceBreakdown(coords, profile);
  }
  // ORS waytype codes: 6 = Cycleway, 5 = Path, 7 = Footway, 3 = Street, 4 = Track, 1/2 = State/Road
  let ciclovia = 0;
  let ciclofaixa = 0;
  let baixa = 0;
  let trilha = 0;
  let comum = 0;

  for (const entry of summary) {
    const pct = entry.amount || 0;
    if (entry.value === 6 || entry.value === 7) ciclovia += pct;
    else if (entry.value === 3) baixa += pct;
    else if (entry.value === 4 || entry.value === 5) trilha += pct;
    else if (entry.value === 2) ciclofaixa += pct * 0.35, (comum += pct * 0.65);
    else comum += pct;
  }

  // Blend with DF local CicloMapa precision when inside DF
  const local = computeSurfaceBreakdown(coords, profile);
  if (local.cicloviaPct > ciclovia && local.cicloviaPct > 0) {
    return local;
  }

  const cicloviaPct = Math.round(ciclovia);
  const ciclofaixaPct = Math.round(ciclofaixa);
  const baixaVelPct = Math.round(baixa);
  const trilhaPct = Math.round(trilha);
  const viaComumPct = Math.max(0, 100 - cicloviaPct - ciclofaixaPct - baixaVelPct - trilhaPct);
  const safetyScore = Math.min(
    99,
    Math.max(
      30,
      Math.round(cicloviaPct * 1.0 + ciclofaixaPct * 0.85 + baixaVelPct * 0.72 + trilhaPct * 0.65 + viaComumPct * 0.35)
    )
  );
  return { cicloviaPct, ciclofaixaPct, baixaVelPct, trilhaPct, viaComumPct, safetyScore };
}

function parseOrsGeoJsonFeature(
  json: unknown,
  waypoints: LngLat[],
  meta: ProfileMeta
): RouteCandidate | null {
  const feat = (json as { features?: Array<{ geometry?: { coordinates?: number[][] }; properties?: { summary?: { distance?: number }; extras?: { waytypes?: { summary?: Array<{ value: number; distance: number; amount: number }> } } } }> })?.features?.[0];
  const rawCoords: number[][] | undefined = feat?.geometry?.coordinates;
  if (!Array.isArray(rawCoords) || rawCoords.length < 2) return null;

  const coords: Coord3D[] = rawCoords.map((c) =>
    c.length >= 3 ? [+c[0].toFixed(6), +c[1].toFixed(6), +c[2].toFixed(1)] : [+c[0].toFixed(6), +c[1].toFixed(6)]
  );
  const distMeters = feat?.properties?.summary?.distance;
  const distanceKm =
    typeof distMeters === 'number' ? +(distMeters / 1000).toFixed(2) : computePathDistanceKm(coords);
  const elevation = computeElevationStats(coords);
  const waySummary = feat?.properties?.extras?.waytypes?.summary;
  const surfaces = parseOrsWaytypes(waySummary, coords, meta.profile);
  const crossings = detectArterialCrossings(coords);
  const maneuvers = extractRouteManeuvers(coords);

  return {
    id: `ors-${meta.profile}-${Date.now()}`,
    profile: meta.profile,
    title: meta.title,
    subtitle: meta.subtitle,
    source: 'ors',
    coords,
    distanceKm,
    elevation,
    surfaces,
    crossings,
    maneuvers,
    waypoints,
  };
}

let orsProxyCircuitOpen = false;

export function isOrsProxyCircuitOpen(): boolean {
  return orsProxyCircuitOpen;
}

export function resetOrsProxyCircuitBreakerForTests(): void {
  orsProxyCircuitOpen = false;
}

async function fetchOrsProxyCandidate(
  waypoints: LngLat[],
  meta: ProfileMeta,
  accessToken: string | null
): Promise<RouteCandidate | null> {
  if (orsProxyCircuitOpen) return null;
  const proxyUrl = getOrsProxyUrl();
  const cfg = getSupabaseConfig();
  if (!proxyUrl || !cfg) return null;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: cfg.anonKey,
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else if (cfg.anonKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${cfg.anonKey}`;
    }

    const res = await fetchWithTimeout(
      proxyUrl,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          profile: meta.orsProfile,
          coordinates: waypoints,
          preference: meta.orsPreference,
          elevation: true,
          extra_info: ['waytype', 'surface'],
          instructions: false,
        }),
      },
      7500
    );
    if (res.status === 404 || res.status === 405 || res.status === 502 || res.status === 503) {
      orsProxyCircuitOpen = true;
      return null;
    }
    if (!res.ok) return null;
    const json = await res.json();
    return parseOrsGeoJsonFeature(json, waypoints, meta);
  } catch {
    // Open circuit on CORS preflight / unreachable Edge Function so subsequent route swaps have zero console noise
    orsProxyCircuitOpen = true;
    return null;
  }
}

async function fetchOrsCandidate(
  waypoints: LngLat[],
  meta: ProfileMeta
): Promise<RouteCandidate | null> {
  if (!hasOrsKey()) return null;
  try {
    const res = await fetchWithTimeout(
      meta.orsEndpoint,
      {
        method: 'POST',
        headers: {
          Authorization: API_KEYS.ors,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: waypoints,
          elevation: true,
          preference: meta.orsPreference,
          extra_info: ['waytype', 'surface'],
          instructions: false,
        }),
      },
      9500
    );
    if (!res.ok) return null;
    const json = await res.json();
    return parseOrsGeoJsonFeature(json, waypoints, meta);
  } catch {
    return null;
  }
}

async function fetchBrouterCandidate(
  waypoints: LngLat[],
  meta: ProfileMeta
): Promise<RouteCandidate | null> {
  try {
    const lonlats = waypoints.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`).join('|');
    const url = `${ENDPOINTS.brouter}?lonlats=${encodeURIComponent(lonlats)}&profile=${meta.brouterProfile}&alternativeidx=0&format=geojson`;
    const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);
    if (!res.ok) return null;
    const json = await res.json();
    const feat = json?.features?.[0];
    const rawCoords: number[][] = feat?.geometry?.coordinates;
    if (!Array.isArray(rawCoords) || rawCoords.length < 2) return null;

    const coords: Coord3D[] = rawCoords.map((c) =>
      c.length >= 3 ? [+c[0].toFixed(6), +c[1].toFixed(6), +c[2].toFixed(1)] : [+c[0].toFixed(6), +c[1].toFixed(6)]
    );
    const distProp = Number(feat?.properties?.['track-length']);
    const distanceKm =
      Number.isFinite(distProp) && distProp > 0 ? +(distProp / 1000).toFixed(2) : computePathDistanceKm(coords);
    const elevation = computeElevationStats(coords);
    const surfaces = computeSurfaceBreakdown(coords, meta.profile);
    const crossings = detectArterialCrossings(coords);
    const maneuvers = extractRouteManeuvers(coords);

    return {
      id: `brouter-${meta.profile}-${Date.now()}`,
      profile: meta.profile,
      title: meta.title,
      subtitle: meta.subtitle,
      source: 'brouter',
      coords,
      distanceKm,
      elevation,
      surfaces,
      crossings,
      maneuvers,
      waypoints,
    };
  } catch {
    return null;
  }
}

async function fetchOsrmAlternatives(waypoints: LngLat[]): Promise<RouteCandidate[]> {
  try {
    const coordStr = waypoints.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`).join(';');
    const url = `${ENDPOINTS.osrmBike}/${coordStr}?overview=full&geometries=geojson&alternatives=true&steps=false`;
    const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);
    if (!res.ok) return [];
    const json = await res.json();
    const routes = Array.isArray(json?.routes) ? json.routes : [];

    const scored = routes
      .slice(0, 3)
      .map((r: { distance: number; geometry: { coordinates: number[][] } }) => {
        const coords: Coord3D[] = r.geometry.coordinates.map(([lng, lat]) => [+lng.toFixed(6), +lat.toFixed(6)]);
        const distanceKm = +(r.distance / 1000).toFixed(2);
        const elevation = computeElevationStats(coords);
        const surfaces = computeSurfaceBreakdown(coords, 'safe');
        const crossings = detectArterialCrossings(coords);
        const maneuvers = extractRouteManeuvers(coords);
        return { coords, distanceKm, elevation, surfaces, crossings, maneuvers };
      })
      .sort((a: { surfaces: SurfaceBreakdown; distanceKm: number }, b: { surfaces: SurfaceBreakdown; distanceKm: number }) =>
        b.surfaces.safetyScore - a.surfaces.safetyScore || a.distanceKm - b.distanceKm
      );

    return scored.map(
      (
        item: {
          coords: Coord3D[];
          distanceKm: number;
          elevation: RouteCandidate['elevation'];
          surfaces: SurfaceBreakdown;
          crossings: RouteCandidate['crossings'];
          maneuvers: RouteCandidate['maneuvers'];
        },
        idx: number
      ) => {
        const meta = PROFILE_DEFS[idx] ?? PROFILE_DEFS[0];
        return {
          id: `osrm-${meta.profile}-${idx}-${Date.now()}`,
          profile: meta.profile,
          title: meta.title,
          subtitle: meta.subtitle,
          source: 'osrm' as const,
          coords: item.coords,
          distanceKm: item.distanceKm,
          elevation: item.elevation,
          surfaces: item.surfaces,
          crossings: item.crossings,
          maneuvers: item.maneuvers,
          waypoints,
        };
      }
    );
  } catch {
    return [];
  }
}

/**
 * Calculates up to 3 distinct cycling route profiles (Safe, Balanced, Fast).
 * Fallback priority chain:
 *  1) Supabase Edge Function `/functions/v1/ors-proxy` (when VITE_SUPABASE_URL/ANON_KEY configured)
 *  2) Direct OpenRouteService (when VITE_ORS_KEY configured)
 *  3) BRouter cycling engine
 *  4) OSRM Bike alternatives
 *  5) Offline straight-line fallback
 */
export async function planMultiProfileRoutes(
  waypoints: LngLat[],
  originName?: string,
  destName?: string
): Promise<RouteCandidate[]> {
  if (waypoints.length < 2) return [];

  let candidates: RouteCandidate[] = [];

  if (hasSupabaseConfig()) {
    const { accessToken } = await getCurrentSession();
    const proxyResults = await Promise.all(
      PROFILE_DEFS.map((meta) => fetchOrsProxyCandidate(waypoints, meta, accessToken))
    );
    candidates = proxyResults.filter((r): r is RouteCandidate => r !== null);
  }

  if (candidates.length === 0 && hasOrsKey()) {
    const results = await Promise.all(PROFILE_DEFS.map((meta) => fetchOrsCandidate(waypoints, meta)));
    candidates = results.filter((r): r is RouteCandidate => r !== null);
  }

  if (candidates.length === 0) {
    const brouterResults = await Promise.all(
      PROFILE_DEFS.map((meta) => fetchBrouterCandidate(waypoints, meta))
    );
    candidates = brouterResults.filter((r): r is RouteCandidate => r !== null);
  }

  if (candidates.length === 0) {
    candidates = await fetchOsrmAlternatives(waypoints);
  }

  // Fallback straight-line resilient route only if offline
  if (candidates.length === 0) {
    const coords: Coord3D[] = waypoints.map(([lng, lat]) => [lng, lat]);
    candidates = [
      {
        id: `offline-safe-${Date.now()}`,
        profile: 'safe',
        title: 'Trajeto Direto (Offline)',
        subtitle: 'Sem conexão com servidor de rotas — linha de referência',
        source: 'custom',
        coords,
        distanceKm: computePathDistanceKm(coords),
        elevation: computeElevationStats(coords),
        surfaces: computeSurfaceBreakdown(coords, 'safe'),
        crossings: detectArterialCrossings(coords),
        maneuvers: extractRouteManeuvers(coords),
        waypoints,
      },
    ];
  }

  // Deduplicate virtually identical routes while preserving safety leader
  const deduped: RouteCandidate[] = [];
  for (const cand of candidates) {
    const isNearDup = deduped.some(
      (existing) =>
        Math.abs(existing.distanceKm - cand.distanceKm) < 0.08 &&
        existing.coords.length > 4 &&
        cand.coords.length > 4 &&
        haversineMeters(
          existing.coords[Math.floor(existing.coords.length / 2)],
          cand.coords[Math.floor(cand.coords.length / 2)]
        ) < 45
    );
    if (!isNearDup || deduped.length === 0) {
      deduped.push({
        ...cand,
        originName,
        destName,
      });
    }
  }

  // Sort so safest is first if scores differ meaningfully
  return deduped;
}

/**
 * Autocomplete geocoding across all 27 Brazilian State Capitals (biased toward active capital / user viewport)
 * combining curated city landmarks + Photon OSM geocoder + Nominatim Brazil fallback.
 */
export async function searchPlaces(
  query: string,
  biasCenter?: LngLat,
  citySlug?: string
): Promise<PlaceResult[]> {
  const q = query.trim();
  const qLower = q.toLowerCase();
  const activeCap = getCapitalBySlug(citySlug);
  const cityPlaces = getPopularPlacesForCity(activeCap.slug);

  const curatedMatches = (q ? ALL_POPULAR_PLACES : cityPlaces).filter(
    (p) => !q || p.name.toLowerCase().includes(qLower) || p.subtitle.toLowerCase().includes(qLower)
  );
  // Sort matches from active capital first
  curatedMatches.sort((a, b) => {
    const aActive = a.city === activeCap.name && a.state === activeCap.stateCode ? 0 : 1;
    const bActive = b.city === activeCap.name && b.state === activeCap.stateCode ? 0 : 1;
    return aActive - bActive;
  });

  if (q.length < 2) {
    return curatedMatches.slice(0, 6);
  }

  const center = biasCenter ?? activeCap.center ?? BRAND.defaultCenter;
  try {
    const url = `${ENDPOINTS.photonSearch}?q=${encodeURIComponent(q)}&lat=${center[1].toFixed(4)}&lon=${center[0].toFixed(4)}&limit=7`;
    const res = await fetchWithTimeout(url, { method: 'GET' }, 4500);
    if (!res.ok) return curatedMatches.slice(0, 6);
    const json = await res.json();
    const features = Array.isArray(json?.features) ? json.features : [];

    const photonResults: PlaceResult[] = features
      .filter((f: { properties?: { countrycode?: string } }) => !f.properties?.countrycode || f.properties.countrycode === 'BR')
      .map((f: { geometry: { coordinates: [number, number] }; properties: Record<string, string> }, i: number) => {
        const p = f.properties || {};
        const name = p.name || p.street || p.locality || p.city || 'Local';
        const district = p.district || p.suburb || p.locality;
        const subParts = [p.street !== name ? p.street : null, district, p.city, p.state].filter(Boolean);
        return {
          id: `photon-${i}-${f.geometry.coordinates.join(',')}`,
          name,
          subtitle: subParts.join(', ') || 'Brasil',
          coords: [f.geometry.coordinates[0], f.geometry.coordinates[1]] as LngLat,
          district,
          city: p.city,
          state: p.state,
          source: 'photon' as const,
        };
      });

    // Merge curated matches first without duplicating identical locations
    const merged: PlaceResult[] = [...curatedMatches.slice(0, 3)];
    for (const item of photonResults) {
      const dup = merged.some((m) => haversineMeters(m.coords, item.coords) < 120);
      if (!dup) merged.push(item);
    }
    if (merged.length > 0) {
      return merged.slice(0, 8);
    }
  } catch {
    // Fall through to Nominatim Brazil fallback
  }

  // Fallback to Nominatim (Brazil scoped + active capital viewbox bias)
  try {
    const vb = activeCap.viewbox.join(',');
    const nomUrl = `${ENDPOINTS.nominatimSearch}?q=${encodeURIComponent(q)}&countrycodes=br&viewbox=${vb}&format=json&addressdetails=1&limit=6`;
    const res = await fetchWithTimeout(nomUrl, { method: 'GET' }, 4500);
    if (res.ok) {
      const rows = (await res.json()) as Array<{
        place_id: number;
        display_name?: string;
        name?: string;
        lat: string;
        lon: string;
        address?: Record<string, string>;
      }>;
      const nomResults: PlaceResult[] = (Array.isArray(rows) ? rows : []).map((row) => {
        const addr = row.address || {};
        const district = addr.suburb || addr.neighbourhood || addr.city_district;
        const city = addr.city || addr.town || addr.municipality;
        const state = addr.state;
        const name = row.name || addr.road || district || row.display_name?.split(',')[0] || 'Local';
        const subtitle = [district, city, state].filter(Boolean).join(', ') || row.display_name || 'Brasil';
        return {
          id: `nom-${row.place_id}`,
          name,
          subtitle,
          coords: [parseFloat(row.lon), parseFloat(row.lat)] as LngLat,
          district,
          city,
          state,
          source: 'nominatim' as const,
        };
      });
      const merged: PlaceResult[] = [...curatedMatches.slice(0, 3)];
      for (const item of nomResults) {
        if (!Number.isFinite(item.coords[0]) || !Number.isFinite(item.coords[1])) continue;
        const dup = merged.some((m) => haversineMeters(m.coords, item.coords) < 120);
        if (!dup) merged.push(item);
      }
      return merged.slice(0, 8);
    }
  } catch {
    // Offline fallback
  }

  return curatedMatches.slice(0, 6);
}

export async function reverseGeocode(coords: LngLat): Promise<PlaceResult> {
  try {
    const url = `${ENDPOINTS.photonReverse}?lat=${coords[1].toFixed(6)}&lon=${coords[0].toFixed(6)}`;
    const res = await fetchWithTimeout(url, { method: 'GET', headers: { Accept: 'application/json' } }, 5500);
    if (res.ok) {
      const json = await res.json();
      const feat = json?.features?.[0];
      if (feat?.properties) {
        const p = feat.properties;
        const district = p.district || p.suburb || p.locality;
        const rawName = typeof p.name === 'string' && !/^\d{5}-?\d{3}$/.test(p.name.trim()) ? p.name.trim() : '';
        const name = rawName || p.street || district || p.city || 'Ponto no Mapa';
        const subtitle =
          [district, p.city, p.state].filter(Boolean).join(', ') ||
          `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
        return {
          id: `rev-${Date.now()}`,
          name,
          subtitle,
          coords,
          district,
          city: p.city,
          state: p.state,
          source: 'map',
        };
      }
    }
  } catch {
    // Try Nominatim reverse fallback
  }

  try {
    const nomUrl = `${ENDPOINTS.nominatimReverse}?lat=${coords[1].toFixed(6)}&lon=${coords[0].toFixed(6)}&format=json&addressdetails=1`;
    const res = await fetchWithTimeout(
      nomUrl,
      { method: 'GET', headers: { Accept: 'application/json', 'Accept-Language': 'pt-BR,pt;q=0.9' } },
      5500
    );
    if (res.ok) {
      const json = (await res.json()) as { name?: string; display_name?: string; address?: Record<string, string> };
      const addr = json.address || {};
      const district = addr.suburb || addr.neighbourhood || addr.city_district;
      const city = addr.city || addr.town || addr.municipality;
      const state = addr.state;
      const name = json.name || addr.road || district || 'Ponto no Mapa';
      const subtitle =
        [district, city, state].filter(Boolean).join(', ') ||
        `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
      return {
        id: `rev-nom-${Date.now()}`,
        name,
        subtitle,
        coords,
        district,
        city,
        state,
        source: 'map',
      };
    }
  } catch {
    // Fallback to nearest curated landmark across all 27 Brazilian capitals or coordinates
  }

  let nearest: PlaceResult | null = null;
  let nearestDist = 3500;
  for (const place of ALL_POPULAR_PLACES) {
    const d = haversineMeters(coords, place.coords);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = place;
    }
  }
  if (nearest) {
    return {
      id: `map-near-${Date.now()}`,
      name: `Próximo a ${nearest.name}`,
      subtitle: nearest.subtitle,
      coords,
      district: nearest.district,
      city: nearest.city,
      state: nearest.state,
      source: 'map',
    };
  }

  return {
    id: `map-${Date.now()}`,
    name: 'Ponto Selecionado',
    subtitle: `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`,
    coords,
    source: 'map',
  };
}
