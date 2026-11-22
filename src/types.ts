export type LngLat = [number, number]; // [lng, lat]
export type Coord3D = [number, number, number?]; // [lng, lat, elevationMeters?]

export type AppMode = 'explore' | 'plan' | 'preview' | 'navigate';
export type ThemeMode = 'light' | 'dark';
export type MapBasemapMode = 'standard' | 'satellite';
export type RouteProfileId = 'safe' | 'balanced' | 'fast';
export type VoiceMode = 'voice' | 'chime' | 'mute';

export type VehicleCategory =
  | 'patinete'
  | 'ebike'
  | 'compartilhado'
  | 'bike_urbana'
  | 'bike_speed'
  | 'bike_mtb'
  | 'eskate';

export type SuspensionLevel = 'nenhuma' | 'basica' | 'dianteira' | 'dupla';

export interface VehicleMode {
  name: string;
  topSpeed: number; // km/h
  rangeMult: number; // multiplier vs nominalRangeKm
}

export interface VehicleSpec {
  id: string;
  name: string;
  brand?: string;
  category: VehicleCategory;
  categoryLabel: string;
  isElectric: boolean;
  isCustom?: boolean;
  isShared?: boolean;
  powerLabel: string;
  powerWatts: number;
  wheelLabel: string;
  wheelInches: number;
  batteryLabel: string;
  batteryWh: number;
  weightKg: number;
  suspension: string;
  suspensionLevel: SuspensionLevel;
  comfortScore: string;
  nominalRangeKm: number; // 0 for non-electric
  modes: VehicleMode[];
  // Optional Compare & Buy metadata
  price?: number;
  priceLabel?: string;
  pros?: string;
  cons?: string;
  buyUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaceResult {
  id: string;
  name: string;
  subtitle: string;
  coords: LngLat;
  district?: string;
  city?: string;
  state?: string;
  source: 'photon' | 'nominatim' | 'curated' | 'gps' | 'map';
}

export interface SurfaceBreakdown {
  cicloviaPct: number;
  ciclofaixaPct: number;
  baixaVelPct: number;
  trilhaPct: number;
  viaComumPct: number;
  safetyScore: number; // 0-100
}

export interface ElevationStats {
  elevations: number[];
  ascentM: number;
  descentM: number;
  minM: number;
  maxM: number;
  isRealElevation: boolean;
}

export interface CrossingWarning {
  id: string;
  viaId: string;
  name: string;
  shortTag: string;
  danger: 'alta' | 'media';
  delaySec: number;
  note: string;
  coords: LngLat;
  angleDeg: number;
  distanceAlongM?: number;
}

export interface ManeuverStep {
  index: number;
  coordIndex: number;
  distanceAlongM: number;
  type: 'start' | 'left' | 'right' | 'slight-left' | 'slight-right' | 'uturn' | 'straight' | 'arrive';
  instruction: string;
  streetName?: string;
  coords: LngLat;
}

export interface RouteCandidate {
  id: string;
  profile: RouteProfileId;
  title: string;
  subtitle: string;
  source: 'ors' | 'brouter' | 'osrm' | 'curated' | 'gpx' | 'custom';
  coords: Coord3D[];
  distanceKm: number;
  elevation: ElevationStats;
  surfaces: SurfaceBreakdown;
  crossings: CrossingWarning[];
  maneuvers: ManeuverStep[];
  waypoints: LngLat[];
  originName?: string;
  destName?: string;
}

export interface SavedRoute {
  id: string;
  name: string;
  description?: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isCurated?: boolean;
  difficulty: 'Fácil' | 'Moderado' | 'Desafiador';
  city: string;
  profile: RouteProfileId;
  coords: Coord3D[];
  waypoints: LngLat[];
  distanceKm: number;
  ascentM: number;
  descentM: number;
  safetyScore: number;
  originName?: string;
  destName?: string;
}

export type HazardKind = 'buraco' | 'bloqueio' | 'iluminacao' | 'raizes' | 'cruzamento' | 'agua';

export interface HazardReport {
  id: string;
  kind: HazardKind;
  title: string;
  note?: string;
  coords: LngLat;
  createdAt: string;
  updatedAt?: string;
  confirmations: number;
  userId?: string;
  isCommunity?: boolean;
  confirmedByMe?: boolean;
}

export interface RouteTelemetry {
  distanceKm: number;
  tripDistanceKm: number;
  oneWayMin: number;
  roundTripMin: number;
  movingMinOneWay: number;
  delayMin: number;
  effectiveAvgSpeed: number;
  realRangeKm: number;
  batteryUsedPct: number;
  batteryLeftPct: number;
  caloriesKcal: number;
  co2SavedKg: number;
  comfortWarning: string | null;
  windEffectLabel?: string | null;
  weatherWarning?: string | null;
  calibrationApplied?: boolean;
  calibrationMultiplier?: number;
}

export type SavedPlaceCategory = 'home' | 'work' | 'favorite';

export interface SavedPlace {
  id: string;
  label: string;
  address: string;
  coords: LngLat;
  category: SavedPlaceCategory;
  createdAt: string;
  updatedAt: string;
}

// === Phase 3: Live Weather, Battery Calibration & Ride History Types ===

export type WeatherIconKind = 'sun' | 'partly_cloudy' | 'cloudy' | 'rain' | 'storm' | 'fog';

export interface WeatherSnapshot {
  fetchedAt: string;
  coords: LngLat;
  temperatureC: number;
  apparentTempC: number;
  humidityPct: number;
  precipitationMm: number;
  rainProbabilityPct: number;
  windSpeedKmh: number;
  windGustsKmh: number;
  windDirectionDeg: number; // Meteorological "blowing FROM" degrees (0=N, 90=E, 180=S, 270=W)
  uvIndex: number;
  weatherCode: number;
  label: string;
  icon: WeatherIconKind;
  isDay: boolean;
}

export interface VehicleBatteryCalibration {
  vehicleId: string;
  efficiencyMultiplier: number; // clamped [0.55, 1.45]; 1.0 = nominal model
  sampleCount: number;
  lastCalibratedAt: string;
}

export interface RideTrackPoint {
  lng: number;
  lat: number;
  ele?: number;
  ts: number; // epoch ms
  speedKmh: number;
}

export type RideMode = 'guided' | 'free_ride' | 'demo';

export interface RideSession {
  id: string;
  title: string;
  mode: RideMode;
  isDemo: boolean;
  startedAt: string;
  endedAt: string;
  movingDurationSec: number;
  totalDurationSec: number;
  distanceKm: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  ascentM: number;
  descentM: number;
  caloriesKcal: number;
  co2SavedKg: number;
  vehicleId: string;
  vehicleName: string;
  vehicleModeIndex: number;
  isElectric: boolean;
  batteryStartPct?: number;
  batteryEndPct?: number;
  batteryUsedPct?: number;
  estimatedBatteryUsedPct?: number;
  weatherSummary?: {
    temperatureC: number;
    windSpeedKmh: number;
    rainProbabilityPct: number;
    label: string;
  };
  routeId?: string;
  originName?: string;
  destName?: string;
  track: RideTrackPoint[];
  createdAt: string;
  updatedAt: string;
}

// === Phase 4: Community Routes, Ratings, Mobility Stations & Offline Cache ===

export type RouteSafetyTag =
  | 'bom_asfalto'
  | 'iluminada'
  | 'sombra'
  | 'paisagem'
  | 'bem_sinalizada'
  | 'ciclovia_larga'
  | 'cruzamento_tenso'
  | 'muito_movimento'
  | 'asfalto_irregular'
  | 'mal_iluminada'
  | 'insegura'
  | 'trecho_obstruido';

export interface RouteRatingRecord {
  routeId: string;
  rating: number; // 1..5
  tags: RouteSafetyTag[];
  updatedAt: string;
}

export interface RouteRatingAggregate {
  routeId: string;
  avgRating: number;
  ratingCount: number;
  topTags: RouteSafetyTag[];
  userRating?: number;
  userTags?: RouteSafetyTag[];
}

export interface CommunityRoute extends SavedRoute {
  authorId?: string;
  authorName: string;
  avgRating: number;
  ratingCount: number;
  safetyTags: RouteSafetyTag[];
  isCommunity: true;
}

export type MobilityProvider = 'tembici' | 'jet';

export interface MobilityStation {
  id: string;
  provider: MobilityProvider;
  name: string;
  subtitle: string;
  coords: LngLat;
  capacityHint?: string;
}

export interface OfflineCacheStatus {
  ready: boolean;
  lanesCached: boolean;
  poisCached: boolean;
  cachedCount: number;
  lastUpdatedAt: string | null;
}

export interface UserPreferences {
  theme: ThemeMode;
  basemap: MapBasemapMode;
  selectedVehicleId: string;
  selectedModeIndex: number;
  riderWeightKg: number;
  voiceMode: VoiceMode;
  showBikeLanes: boolean;
  showPois: boolean;
  showStations?: boolean;
  showHazards: boolean;
  showSafetySegments?: boolean;
  selectedCitySlug?: string;
  isPremium?: boolean;
  premiumSince?: string;
  gpxExportCount?: number;
  homePlace?: PlaceResult;
  workPlace?: PlaceResult;
  batteryCalibrations?: Record<string, VehicleBatteryCalibration>;
  updatedAt?: string;
}

// === Phase 2: Cloud Auth & Offline-First Sync Types ===

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export type SyncStatus = 'local' | 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export type SyncEntityType =
  | 'saved_routes'
  | 'saved_places'
  | 'custom_vehicles'
  | 'hazard_reports'
  | 'ride_sessions'
  | 'user_preferences';

export interface SyncOutboxItem {
  id: string; // `${entity}:${recordId}` for automatic per-record coalescing
  entity: SyncEntityType;
  recordId: string;
  operation: 'upsert' | 'delete' | 'confirm';
  payload?: unknown;
  updatedAt: string;
  attempts: number;
  nextRetryAt?: number;
  lastError?: string;
}

export interface SyncTombstone {
  key: string; // `${entity}:${recordId}`
  entity: SyncEntityType;
  recordId: string;
  deletedAt: string;
}

export interface LocalMigrationSummary {
  routes: number;
  places: number;
  vehicles: number;
  hazards: number;
  rides: number;
  total: number;
}

export interface SyncStateSnapshot {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  error: string | null;
}

