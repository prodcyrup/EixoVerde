import type {
  Coord3D,
  LngLat,
  VehicleSpec,
  WeatherIconKind,
  WeatherSnapshot,
} from '../types';
import { computeBearingDeg, normalizeAngleDiff } from './geo';

export interface WindVectorEffect {
  headwindKmh: number; // positive = headwind (slows rider), negative = tailwind (helps rider)
  crosswindKmh: number;
  speedMultiplier: number; // applied to cruise speed
  rangeMultiplier: number; // applied to electric real range
  label: string | null;
}

const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const weatherCache = new Map<string, { expiresAt: number; data: WeatherSnapshot }>();

function cacheKeyForCoords([lng, lat]: LngLat): string {
  // ~3.5 km spatial grid bucket so nearby routes share a single fresh forecast
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export function clearWeatherCacheForTests(): void {
  weatherCache.clear();
}

export function mapWmoCodePtBr(code: number): { label: string; icon: WeatherIconKind } {
  if (code === 0) return { label: 'Céu limpo', icon: 'sun' };
  if (code === 1 || code === 2) return { label: 'Parcialmente nublado', icon: 'partly_cloudy' };
  if (code === 3) return { label: 'Nublado', icon: 'cloudy' };
  if (code === 45 || code === 48) return { label: 'Neblina', icon: 'fog' };
  if (code >= 51 && code <= 57) return { label: 'Garoa', icon: 'rain' };
  if (code >= 61 && code <= 65) {
    return { label: code === 65 ? 'Chuva forte' : code === 63 ? 'Chuva moderada' : 'Chuva leve', icon: 'rain' };
  }
  if (code >= 66 && code <= 67) return { label: 'Chuva gelada', icon: 'rain' };
  if (code >= 80 && code <= 82) return { label: code === 82 ? 'Pancadas fortes' : 'Pancadas de chuva', icon: 'rain' };
  if (code >= 95 && code <= 99) return { label: 'Tempestade', icon: 'storm' };
  return { label: 'Tempo aberto', icon: 'partly_cloudy' };
}

export function formatCompassCardinalPtBr(deg: number): string {
  const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

/**
 * Computes net route bearing from start to end of a coordinate array.
 */
export function computeRouteMainBearingDeg(coords: Coord3D[] | LngLat[]): number | undefined {
  if (!coords || coords.length < 2) return undefined;
  return computeBearingDeg(coords[0], coords[coords.length - 1]);
}

/**
 * Resolves headwind / tailwind / crosswind impact on cruising speed and electric range.
 * Meteorological wind direction (`windDirectionDeg`) indicates where the wind blows FROM.
 * If rider travels North (0°) and wind blows FROM North (0°), delta = 0° => pure headwind.
 */
export function computeWindVectorEffect(
  routeBearingDeg: number | undefined,
  weather: WeatherSnapshot,
  isRoundTrip = false
): WindVectorEffect {
  const speed = Math.max(0, Number.isFinite(weather.windSpeedKmh) ? weather.windSpeedKmh : 0);
  if (speed < 3 || typeof routeBearingDeg !== 'number' || !Number.isFinite(routeBearingDeg)) {
    return {
      headwindKmh: 0,
      crosswindKmh: 0,
      speedMultiplier: 1,
      rangeMultiplier: 1,
      label: null,
    };
  }

  const deltaDeg = normalizeAngleDiff(weather.windDirectionDeg - routeBearingDeg);
  const deltaRad = (deltaDeg * Math.PI) / 180;
  const headwindKmh = +(speed * Math.cos(deltaRad)).toFixed(1);
  const crosswindKmh = +Math.abs(speed * Math.sin(deltaRad)).toFixed(1);

  if (isRoundTrip) {
    // Aerodynamic drag scales quadratically with relative airspeed, so out-and-back
    // headwind + tailwind still creates a slight net energy/speed penalty in strong winds.
    const effective = Math.abs(headwindKmh);
    const speedMultiplier = Math.max(0.92, +(1 - (effective * effective) / 14000).toFixed(3));
    const rangeMultiplier = Math.max(0.88, +(1 - (effective * effective) / 9500).toFixed(3));
    const label =
      speed >= 12
        ? `Vento ${Math.round(speed)} km/h (${formatCompassCardinalPtBr(weather.windDirectionDeg)})`
        : null;
    return {
      headwindKmh: 0,
      crosswindKmh,
      speedMultiplier,
      rangeMultiplier,
      label,
    };
  }

  // One-way wind effect: headwind (>0) penalizes speed & range; tailwind (<0) assists slightly
  let speedMultiplier = 1;
  let rangeMultiplier = 1;

  if (headwindKmh > 0) {
    speedMultiplier = Math.max(0.82, +(1 - headwindKmh * 0.0055).toFixed(3));
    rangeMultiplier = Math.max(0.76, +(1 - headwindKmh * 0.009).toFixed(3));
  } else if (headwindKmh < 0) {
    const tail = Math.abs(headwindKmh);
    speedMultiplier = Math.min(1.12, +(1 + tail * 0.0038).toFixed(3));
    rangeMultiplier = Math.min(1.14, +(1 + tail * 0.0055).toFixed(3));
  }

  let label: string | null = null;
  if (headwindKmh >= 8) {
    const rangePct = Math.round((1 - rangeMultiplier) * 100);
    label = `Vento contra ${Math.round(headwindKmh)} km/h${rangePct >= 4 ? ` (-${rangePct}% aut.)` : ''}`;
  } else if (headwindKmh <= -8) {
    const boostPct = Math.round((rangeMultiplier - 1) * 100);
    label = `Vento a favor ${Math.round(Math.abs(headwindKmh))} km/h${boostPct >= 4 ? ` (+${boostPct}%)` : ''}`;
  } else if (crosswindKmh >= 14) {
    label = `Vento lateral ${Math.round(crosswindKmh)} km/h`;
  }

  return {
    headwindKmh,
    crosswindKmh,
    speedMultiplier,
    rangeMultiplier,
    label,
  };
}

/**
 * Generates Brasília / urban micromobility weather safety warnings.
 */
export function buildWeatherSafetyWarning(
  weather: WeatherSnapshot,
  vehicle: VehicleSpec
): string | null {
  const isStorm = weather.icon === 'storm';
  const isWet =
    isStorm ||
    weather.icon === 'rain' ||
    weather.precipitationMm >= 0.3 ||
    weather.rainProbabilityPct >= 55;

  if (isStorm) {
    return `Alerta de tempestade (${Math.round(weather.windGustsKmh)} km/h): evite circular em áreas abertas e procure abrigo seguro.`;
  }

  if (isWet) {
    if (vehicle.wheelInches <= 10) {
      return `Chuva/piso molhado (${weather.rainProbabilityPct}%): reduza a velocidade — pneus de ${vehicle.wheelInches}" perdem aderência em ciclovia molhada e faixas pintadas.`;
    }
    return `Previsão de chuva (${weather.rainProbabilityPct}%): redobre a atenção na frenagem e evite poças em travessias.`;
  }

  if (weather.windGustsKmh >= 32) {
    return `Rajadas fortes de vento (${Math.round(weather.windGustsKmh)} km/h): cuidado em pontes, viadutos e trechos abertos.`;
  }

  if (weather.humidityPct > 0 && weather.humidityPct <= 25) {
    return `Umidade muito baixa (${weather.humidityPct}%): leve água e hidrate-se bem durante o trajeto.`;
  }

  if (weather.isDay && weather.uvIndex >= 9) {
    return `Índice UV extremo (${Math.round(weather.uvIndex)}): use protetor solar, óculos e hidrate-se no trajeto.`;
  }

  return null;
}

/**
 * Zero-key live weather client powered by Open-Meteo.
 * Returns null cleanly when offline or timed out so UI stays 100% resilient.
 */
export async function fetchLiveWeather(coords: LngLat): Promise<WeatherSnapshot | null> {
  const [lng, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const key = cacheKeyForCoords(coords);
  const now = Date.now();
  const cached = weatherCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return null;
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day` +
    `&hourly=precipitation_probability,uv_index` +
    `&forecast_days=1&timezone=auto`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4500);

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: {
        time?: string;
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        precipitation?: number;
        weather_code?: number;
        wind_speed_10m?: number;
        wind_direction_10m?: number;
        wind_gusts_10m?: number;
        is_day?: number;
      };
      hourly?: {
        time?: string[];
        precipitation_probability?: number[];
        uv_index?: number[];
      };
    };

    const cur = data?.current;
    if (!cur || typeof cur.temperature_2m !== 'number') return null;

    // Match current hour slot in hourly arrays for rain probability & UV index
    let hourIdx = 0;
    if (Array.isArray(data.hourly?.time) && cur.time) {
      const hourPrefix = cur.time.slice(0, 13);
      const found = data.hourly.time.findIndex((t) => t.startsWith(hourPrefix));
      if (found >= 0) hourIdx = found;
    }

    const rainProbabilityPct = Math.max(
      0,
      Math.min(100, Math.round(data.hourly?.precipitation_probability?.[hourIdx] ?? 0))
    );
    const uvIndex = +(data.hourly?.uv_index?.[hourIdx] ?? 0).toFixed(1);
    const weatherCode = Number(cur.weather_code ?? 0);
    const { label, icon } = mapWmoCodePtBr(weatherCode);

    const snapshot: WeatherSnapshot = {
      fetchedAt: new Date().toISOString(),
      coords,
      temperatureC: Math.round(cur.temperature_2m),
      apparentTempC: Math.round(cur.apparent_temperature ?? cur.temperature_2m),
      humidityPct: Math.round(cur.relative_humidity_2m ?? 50),
      precipitationMm: +(cur.precipitation ?? 0).toFixed(1),
      rainProbabilityPct,
      windSpeedKmh: Math.round(cur.wind_speed_10m ?? 0),
      windGustsKmh: Math.round(cur.wind_gusts_10m ?? cur.wind_speed_10m ?? 0),
      windDirectionDeg: Math.round(cur.wind_direction_10m ?? 0),
      uvIndex,
      weatherCode,
      label,
      icon,
      isDay: cur.is_day !== 0,
    };

    weatherCache.set(key, { expiresAt: now + WEATHER_CACHE_TTL_MS, data: snapshot });
    return snapshot;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
