import { BRAND } from '../config/brand';
import type { Coord3D, LngLat, SavedRoute } from '../types';
import { computeElevationStats, computePathDistanceKm, computeSurfaceBreakdown } from './geo';

/**
 * Generates a standard GPX 1.1 document from any route.
 */
export function exportRouteToGpx(name: string, coords: Coord3D[], description = ''): string {
  const safeName = escapeXml(name);
  const safeDesc = escapeXml(description || 'Rota exportada pelo EixoVerde');
  const trkpts = coords
    .map((c) => {
      const eleTag = typeof c[2] === 'number' ? `<ele>${c[2].toFixed(1)}</ele>` : '';
      return `      <trkpt lat="${c[1].toFixed(6)}" lon="${c[0].toFixed(6)}">${eleTag}</trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="EixoVerde" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${safeName}</name>
    <desc>${safeDesc}</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${safeName}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

export function downloadTextFile(filename: string, content: string, mime = 'application/gpx+xml'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Parses GPX, KML, or GeoJSON files into a ready-to-use SavedRoute object.
 */
export function parseImportedRouteFile(fileName: string, text: string): SavedRoute | null {
  const lower = fileName.toLowerCase();
  let coords: Coord3D[] = [];
  let title = fileName.replace(/\.(gpx|kml|geojson|json)$/i, '');

  if (lower.endsWith('.geojson') || lower.endsWith('.json') || text.trim().startsWith('{')) {
    try {
      const json = JSON.parse(text);
      const features = json.type === 'FeatureCollection' ? json.features : [json];
      for (const f of features) {
        const g = f.geometry ?? f;
        if (f.properties?.name && title === fileName.replace(/\.(geojson|json)$/i, '')) {
          title = String(f.properties.name);
        }
        if (g?.type === 'LineString' && Array.isArray(g.coordinates)) {
          coords = g.coordinates.map((c: number[]) =>
            c.length >= 3 ? [c[0], c[1], c[2]] : [c[0], c[1]]
          );
          break;
        }
        if (g?.type === 'MultiLineString' && Array.isArray(g.coordinates)) {
          coords = g.coordinates.flat().map((c: number[]) =>
            c.length >= 3 ? [c[0], c[1], c[2]] : [c[0], c[1]]
          );
          break;
        }
      }
    } catch {
      return null;
    }
  } else {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const nameNode = doc.querySelector('trk > name, metadata > name, Document > name, Placemark > name');
    if (nameNode?.textContent?.trim()) title = nameNode.textContent.trim();

    // GPX trkpt / rtept
    const trkpts = Array.from(doc.querySelectorAll('trkpt, rtept'));
    if (trkpts.length >= 2) {
      coords = trkpts
        .map((pt): Coord3D | null => {
          const lat = parseFloat(pt.getAttribute('lat') || '');
          const lon = parseFloat(pt.getAttribute('lon') || '');
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
          const eleEl = pt.querySelector('ele');
          const ele = eleEl ? parseFloat(eleEl.textContent || '') : NaN;
          return Number.isFinite(ele) ? [lon, lat, ele] : [lon, lat];
        })
        .filter((x): x is Coord3D => x !== null);
    } else {
      // KML <coordinates>
      const kmlCoords = doc.querySelector('LineString > coordinates, coordinates');
      if (kmlCoords?.textContent) {
        coords = kmlCoords.textContent
          .trim()
          .split(/\s+/)
          .map((token): Coord3D | null => {
            const parts = token.split(',').map(Number);
            if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
            return Number.isFinite(parts[2]) ? [parts[0], parts[1], parts[2]] : [parts[0], parts[1]];
          })
          .filter((x): x is Coord3D => x !== null);
      }
    }
  }

  if (coords.length < 2) return null;

  const distanceKm = computePathDistanceKm(coords);
  const elev = computeElevationStats(coords);
  const surf = computeSurfaceBreakdown(coords, 'safe');
  const first: LngLat = [coords[0][0], coords[0][1]];
  const last: LngLat = [coords[coords.length - 1][0], coords[coords.length - 1][1]];

  const now = new Date().toISOString();
  return {
    id: `imported-${Date.now()}`,
    name: title,
    description: `Importada de ${fileName} (${coords.length} pontos)`,
    tag: lower.endsWith('.kml') ? 'Importada • KML' : 'Importada • GPX',
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    difficulty: elev.ascentM > 220 || distanceKm > 25 ? 'Desafiador' : distanceKm > 10 ? 'Moderado' : 'Fácil',
    city: 'Importada',
    profile: 'safe',
    coords,
    waypoints: [first, last],
    distanceKm,
    ascentM: elev.ascentM,
    descentM: elev.descentM,
    safetyScore: surf.safetyScore,
  };
}

// === Compact Shareable URL Links (?share=...) ===
export function encodeShareableRouteUrl(name: string, waypoints: LngLat[], profile: string): string {
  const payload = {
    n: name.slice(0, 60),
    p: profile,
    w: waypoints.map(([lng, lat]) => [+lng.toFixed(5), +lat.toFixed(5)]),
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const href =
    typeof window !== 'undefined' &&
    window.location?.href &&
    !window.location.href.startsWith('capacitor://') &&
    !window.location.href.startsWith('https://localhost')
      ? window.location.href
      : BRAND.webAppUrl;
  const url = new URL(href);
  url.searchParams.set('share', encoded);
  return url.toString();
}

export function decodeShareableRouteFromUrl(
  customShareParam?: string
): { name: string; profile: string; waypoints: LngLat[] } | null {
  try {
    const raw =
      customShareParam ??
      (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('share') : null);
    if (!raw) return null;
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if (!Array.isArray(json.w) || json.w.length < 2) return null;
    return {
      name: String(json.n || 'Rota Compartilhada'),
      profile: String(json.p || 'safe'),
      waypoints: json.w as LngLat[],
    };
  } catch {
    return null;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
