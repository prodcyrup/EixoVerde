import type { Coord3D, LngLat, RouteProfileId } from '../types';
import { classifyPointOnBikeNetwork, haversineMeters } from './geo';

export type RouteSafetyClass = 'ciclovia' | 'ciclofaixa' | 'via_calma' | 'via_comum';

export interface SafetySegmentsResult {
  geojson: GeoJSON.FeatureCollection;
  counts: Record<RouteSafetyClass, number>;
  kmByClass: Record<RouteSafetyClass, number>;
}

function normalizeLaneKind(raw: string | null, profile: RouteProfileId): RouteSafetyClass {
  if (raw === 'ciclovia') return 'ciclovia';
  if (raw === 'ciclofaixa') return 'ciclofaixa';
  if (raw === 'ciclorrota' || raw === 'calcada' || raw === 'trilha') return 'via_calma';
  if (raw === 'proibido') return 'via_comum';
  // When CicloMapa spatial index has no hit (e.g., outside DF or unmapped local street)
  return profile === 'safe' ? 'via_calma' : 'via_comum';
}

/**
 * Classifies each edge of a route against the live DF CicloMapa spatial index
 * and merges consecutive edges of the same safety class into clean LineString
 * GeoJSON features for color-coded map rendering:
 * - `ciclovia`   (#10b981 emerald)
 * - `ciclofaixa` (#0ea5e9 sky)
 * - `via_calma`  (#f59e0b amber)
 * - `via_comum`  (#f43f5e rose)
 */
export function buildSafetyRouteSegments(
  coords: Coord3D[],
  profile: RouteProfileId = 'safe'
): SafetySegmentsResult {
  const counts: Record<RouteSafetyClass, number> = {
    ciclovia: 0,
    ciclofaixa: 0,
    via_calma: 0,
    via_comum: 0,
  };
  const kmByClass: Record<RouteSafetyClass, number> = {
    ciclovia: 0,
    ciclofaixa: 0,
    via_calma: 0,
    via_comum: 0,
  };

  if (!coords || coords.length < 2) {
    return {
      geojson: { type: 'FeatureCollection', features: [] },
      counts,
      kmByClass,
    };
  }

  const features: GeoJSON.Feature[] = [];
  let currentClass: RouteSafetyClass | null = null;
  let currentCoords: LngLat[] = [];

  const flush = () => {
    if (currentClass && currentCoords.length >= 2) {
      counts[currentClass] += 1;
      features.push({
        type: 'Feature',
        properties: { safetyClass: currentClass },
        geometry: {
          type: 'LineString',
          coordinates: currentCoords,
        },
      });
    }
  };

  for (let i = 0; i < coords.length - 1; i++) {
    const a: LngLat = [coords[i][0], coords[i][1]];
    const b: LngLat = [coords[i + 1][0], coords[i + 1][1]];
    const mid: LngLat = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

    const rawKind =
      classifyPointOnBikeNetwork(mid, 34) ??
      classifyPointOnBikeNetwork(a, 28) ??
      classifyPointOnBikeNetwork(b, 28);
    const cls = normalizeLaneKind(rawKind, profile);
    const segKm = haversineMeters(a, b) / 1000;
    kmByClass[cls] += segKm;

    if (cls === currentClass) {
      currentCoords.push(b);
    } else {
      flush();
      currentClass = cls;
      currentCoords = [a, b];
    }
  }
  flush();

  for (const k of Object.keys(kmByClass) as RouteSafetyClass[]) {
    kmByClass[k] = +kmByClass[k].toFixed(2);
  }

  return {
    geojson: { type: 'FeatureCollection', features },
    counts,
    kmByClass,
  };
}
