import { create } from 'zustand';
import {
  consumeDeepLinkAuth,
  deleteCloudAccount,
  getCurrentSession,
  sendPasswordReset,
  signInWithGoogle as authSignInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
  signOut as authSignOut,
  signUpWithPassword,
  subscribeAuthChanges,
  updatePassword,
} from '../cloud/authService';
import { subscribeRealtimeHazards } from '../cloud/realtimeHazards';
import { BRAND } from '../config/brand';
import { hasSupabaseConfig } from '../config/providers';
import {
  type BrazilCapitalCity,
  findNearestCapital,
  getCapitalBySlug,
} from '../data/brazilCities';
import { getCuratedRoutesForCity } from '../data/curatedRoutes';
import { PRESET_VEHICLES } from '../data/vehicles';
import {
  computeElevationStats,
  computePathDistanceKm,
  computeSurfaceBreakdown,
  detectArterialCrossings,
} from '../engine/geo';
import { decodeShareableRouteFromUrl } from '../engine/gpx';
import { extractRouteManeuvers } from '../engine/navigation';
import {
  checkOfflineDfCacheStatus,
  getCachedOfflineCitySlugs,
  warmOfflineDfCache,
} from '../engine/offlineCache';
import {
  type ActiveRideRecording,
  appendRideSample,
  createRideRecording,
  finalizeRideRecording,
  rideSessionToSavedRoute,
} from '../engine/rideRecorder';
import { planMultiProfileRoutes, reverseGeocode } from '../engine/routing';
import { computeUpdatedBatteryCalibration } from '../engine/telemetry';
import { fetchLiveWeather } from '../engine/weather';
import {
  FREE_CUSTOM_VEHICLE_LIMIT,
  FREE_GPX_EXPORT_LIMIT,
  FREE_OFFLINE_CITY_LIMIT,
  VIP_PRICE_LABEL,
  fetchCloudVipStatus,
  hideNativeAdBanner,
  syncCloudVipActivation,
} from '../mobile/monetizationBridge';
import {
  configureNativeStatusBar,
  getNativeOrWebPosition,
  hideNativeSplashScreen,
  registerNativeAppListeners,
  triggerHaptic,
} from '../mobile/nativeBridge';
import { indexedDbStorage } from '../storage/indexedDbAdapter';
import { repository } from '../storage/repository';
import { supabaseAdapter } from '../storage/supabaseAdapter';
import { syncEngine } from '../storage/syncEngine';
import type {
  AppMode,
  AuthUser,
  CommunityRoute,
  HazardKind,
  HazardReport,
  LngLat,
  LocalMigrationSummary,
  MapBasemapMode,
  OfflineCacheStatus,
  PlaceResult,
  RideSession,
  RouteCandidate,
  RouteRatingAggregate,
  RouteSafetyTag,
  SavedPlace,
  SavedPlaceCategory,
  SavedRoute,
  SyncStatus,
  ThemeMode,
  UserPreferences,
  VehicleBatteryCalibration,
  VehicleSpec,
  VoiceMode,
  WeatherSnapshot,
} from '../types';

let unsubscribeRealtimeHazards: (() => void) | null = null;

export type MapPickTarget =
  | null
  | 'origin'
  | 'dest'
  | 'via'
  | 'hazard'
  | 'save_place'
  | 'save_home'
  | 'save_work';

export interface ToastMessage {
  id: string;
  title: string;
  body?: string;
  tone?: 'emerald' | 'amber' | 'rose' | 'slate';
}

interface NavState {
  isTracking: boolean;
  isDemoMode: boolean;
  isFreeRide: boolean;
  followUser: boolean;
  pitch3D: boolean;
  currentPos: LngLat | null;
  currentHeading: number;
  currentSpeedKmh: number;
  accuracyMeters: number | null;
  distanceAlongM: number;
  offRouteMeters: number;
  isRerouting: boolean;
  reversed: boolean;
}

export interface AppStore {
  initialized: boolean;
  mode: AppMode;
  theme: ThemeMode;
  basemap: MapBasemapMode;
  voiceMode: VoiceMode;
  showBikeLanes: boolean;
  showPois: boolean;
  showStations: boolean;
  showHazards: boolean;
  showSafetySegments: boolean;

  // Phase 2: Cloud Auth & Offline-First Sync State
  cloudConfigured: boolean;
  authUser: AuthUser | null;
  authLoading: boolean;
  authRecoveryMode: boolean;
  syncStatus: SyncStatus;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  syncError: string | null;
  authModalOpen: boolean;
  migrationPromptOpen: boolean;
  localMigrationSummary: LocalMigrationSummary | null;

  // User & Vehicle Garage
  customVehicles: VehicleSpec[];
  selectedVehicleId: string;
  selectedModeIndex: number;
  riderWeightKg: number;
  isRoundTrip: boolean;
  homePlace?: PlaceResult;
  workPlace?: PlaceResult;
  batteryCalibrations: Record<string, VehicleBatteryCalibration>;

  // Phase 3: Live Open-Meteo Weather & Recorded Ride Sessions
  weather: WeatherSnapshot | null;
  weatherLoading: boolean;
  rideSessions: RideSession[];
  activeRide: ActiveRideRecording | null;
  pendingRideSummary: RideSession | null;
  replayingRideId: string | null;

  // Phase 4: Community DF, Route Ratings, Realtime & Offline DF Cache
  communityRoutes: CommunityRoute[];
  routeRatings: Record<string, RouteRatingAggregate>;
  offlineCache: OfflineCacheStatus;
  offlineCacheLoading: boolean;
  realtimeConnected: boolean;

  // Planner & Active Route
  origin: PlaceResult | null;
  destination: PlaceResult | null;
  currentLocationPlace: PlaceResult | null;
  viaPoints: LngLat[];
  isRouting: boolean;
  candidates: RouteCandidate[];
  selectedCandidateIdx: number;
  isEditingWaypoints: boolean;
  mapPickTarget: MapPickTarget;
  hoverCoordIndex: number | null;
  fitBoundsNonce: number;
  flyToTarget: { coords: LngLat; zoom?: number; nonce: number } | null;

  // Saved Routes, Saved Places & Hazards
  savedRoutes: SavedRoute[];
  savedPlaces: SavedPlace[];
  hazards: HazardReport[];
  exploreTab: 'routes' | 'places' | 'rides';

  // Live Navigation
  nav: NavState;

  // Overlays / Modals & Phase 7 VIP
  garageOpen: boolean;
  compareOpen: boolean;
  menuOpen: boolean;
  cityModalOpen: boolean;
  selectedCitySlug: string;
  privacyModalOpen: boolean;
  vipModalOpen: boolean;
  vipLoading: boolean;
  isPremium: boolean;
  premiumSince?: string;
  gpxExportCount: number;
  deleteAccountLoading: boolean;
  hazardPickerOpen: boolean;
  pendingHazardCoords: LngLat | null;
  pendingSavePlace: { place: PlaceResult; defaultCategory: SavedPlaceCategory } | null;
  mapContextPin: { coords: LngLat; place: PlaceResult | null; loading: boolean } | null;
  mapContextScreenPos: { x: number; y: number } | null;
  toasts: ToastMessage[];

  // Actions
  bootstrap: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
  initAuthAndSync: () => Promise<void>;
  setAuthModalOpen: (open: boolean) => void;
  setMigrationPromptOpen: (open: boolean) => void;
  setPrivacyModalOpen: (open: boolean) => void;
  setVipModalOpen: (open: boolean) => void;
  activateVipLifetime: () => Promise<boolean>;
  restoreVipPurchase: () => Promise<boolean>;
  consumeGpxExportQuota: () => boolean;
  setCityModalOpen: (open: boolean) => void;
  selectCity: (citySlug: string, flyMap?: boolean) => Promise<void>;
  detectCityFromGps: () => Promise<void>;
  deleteAccount: (wipeLocalData?: boolean) => Promise<{ ok: boolean; error?: string }>;
  handleHardwareBackButton: () => boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ ok: boolean; needsEmailConfirmation?: boolean; error?: string }>;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  completePasswordRecovery: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<boolean>;
  migrateLocalToCloud: () => Promise<boolean>;

  // Phase 3: Weather, Ride Recording, History & Battery Calibration actions
  refreshWeather: (coords?: LngLat) => Promise<void>;
  startFreeRide: () => void;
  recordRideSample: (sample: { lng: number; lat: number; ele?: number; speedKmh: number; ts?: number }) => void;
  toggleRidePause: () => void;
  savePendingRideSummary: (opts?: {
    title?: string;
    batteryStartPct?: number;
    batteryEndPct?: number;
    applyCalibration?: boolean;
  }) => Promise<void>;
  discardPendingRideSummary: () => void;
  deleteRideSession: (id: string) => Promise<void>;
  saveRideAsRoute: (id: string) => Promise<void>;
  setReplayingRideId: (id: string | null) => void;
  resetVehicleCalibration: (vehicleId: string) => void;

  // Phase 4: Community DF, Ratings, Safety Segments, Offline Cache & Pin Anchor
  toggleSafetySegments: () => void;
  setMapContextScreenPos: (pos: { x: number; y: number } | null) => void;
  loadCommunityData: () => Promise<void>;
  rateRoute: (routeId: string, rating: number, tags: RouteSafetyTag[]) => Promise<void>;
  publishSavedRouteToCommunity: (routeId: string) => Promise<void>;
  deleteCommunityRoute: (routeId: string) => Promise<void>;
  refreshOfflineCache: () => Promise<void>;
  warmOfflineCache: () => Promise<void>;

  locateCurrentPosition: (options?: { silent?: boolean; flyToUser?: boolean }) => Promise<PlaceResult | null>;
  useCurrentLocationAsOrigin: () => Promise<void>;
  setMode: (mode: AppMode) => void;
  toggleTheme: () => void;
  toggleBasemap: () => void;
  cycleVoiceMode: () => void;
  toggleLayer: (layer: 'lanes' | 'pois' | 'stations' | 'hazards') => void;
  setExploreTab: (tab: 'routes' | 'places' | 'rides') => void;

  // Vehicle actions
  getAllVehicles: () => VehicleSpec[];
  getActiveVehicle: () => VehicleSpec;
  selectVehicle: (id: string, modeIdx?: number) => void;
  setModeIndex: (idx: number) => void;
  setRiderWeight: (kg: number) => void;
  toggleRoundTrip: () => void;
  addCustomVehicle: (vehicle: VehicleSpec) => Promise<void>;
  deleteCustomVehicle: (id: string) => Promise<void>;

  // Place & Planning actions
  setOrigin: (place: PlaceResult | null, autoPlan?: boolean) => void;
  setDestination: (place: PlaceResult | null, autoPlan?: boolean) => Promise<void>;
  swapOriginDest: () => void;
  setMapPickTarget: (target: MapPickTarget) => void;
  handleMapClick: (coords: LngLat) => Promise<void>;
  openMapContextPin: (coords: LngLat) => Promise<void>;
  closeMapContextPin: () => void;
  recalculateRoute: (customWaypoints?: LngLat[]) => Promise<void>;
  selectCandidate: (idx: number) => void;
  toggleEditWaypoints: () => void;
  updateWaypoint: (index: number, coords: LngLat) => Promise<void>;
  addViaPoint: (coords: LngLat) => Promise<void>;
  removeViaPoint: (viaIdx: number) => Promise<void>;
  clearActiveRoute: () => void;
  loadSavedRoute: (route: SavedRoute) => void;
  saveCurrentRoute: (customName?: string) => Promise<void>;
  renameSavedRoute: (id: string, newName: string) => Promise<void>;
  deleteSavedRoute: (id: string) => Promise<void>;
  toggleFavoriteRoute: (id: string) => Promise<void>;
  importSavedRoute: (route: SavedRoute) => Promise<void>;

  // Saved Places (Meus Locais)
  openSavePlacePrompt: (place: PlaceResult, defaultCategory?: SavedPlaceCategory) => void;
  closeSavePlacePrompt: () => void;
  saveFavoritePlace: (place: PlaceResult, label: string, category: SavedPlaceCategory) => Promise<void>;
  renameSavedPlace: (id: string, newLabel: string) => Promise<void>;
  updateSavedPlaceCategory: (id: string, category: SavedPlaceCategory) => Promise<void>;
  deleteSavedPlace: (id: string) => Promise<void>;
  setHomeOrWork: (slot: 'home' | 'work', place: PlaceResult) => void;
  setHoverCoordIndex: (idx: number | null) => void;
  requestFitRoute: () => void;
  flyTo: (coords: LngLat, zoom?: number) => void;

  // Navigation actions
  startNavigation: (demo?: boolean) => void;
  stopNavigation: () => void;
  updateNavTelemetry: (patch: Partial<NavState>) => void;
  reverseActiveRoute: () => void;
  triggerOffRouteReroute: (fromPos: LngLat) => Promise<void>;

  // Hazards
  openHazardReporter: (coords?: LngLat) => void;
  submitHazard: (kind: HazardKind, title: string, note?: string) => Promise<void>;
  confirmHazard: (id: string) => Promise<void>;
  deleteHazard: (id: string) => Promise<void>;

  // UI overlays
  setGarageOpen: (open: boolean) => void;
  setCompareOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setHazardPickerOpen: (open: boolean) => void;
  pushToast: (title: string, body?: string, tone?: ToastMessage['tone']) => void;
  dismissToast: (id: string) => void;
}

/** Reactive Zustand selector so any component immediately re-renders when active vehicle changes */
export function selectActiveVehicle(state: AppStore): VehicleSpec {
  return (
    state.customVehicles.find((v) => v.id === state.selectedVehicleId) ??
    PRESET_VEHICLES.find((v) => v.id === state.selectedVehicleId) ??
    PRESET_VEHICLES[0]
  );
}

/** Reactive Zustand selector for the currently active Brazilian State Capital (out of 27) */
export function selectActiveCapital(state: AppStore): BrazilCapitalCity {
  return getCapitalBySlug(state.selectedCitySlug);
}

const CITY_STORAGE_KEY = 'eixoverde:city';

function getInitialCitySlug(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(CITY_STORAGE_KEY);
      if (saved) return getCapitalBySlug(saved).slug;
    }
  } catch {
    // Fallback to brasilia
  }
  return 'brasilia';
}

function syncPersistCitySlug(slug: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CITY_STORAGE_KEY, slug);
    }
  } catch {
    // Ignore storage errors
  }
}

function savedRouteToCandidate(route: SavedRoute): RouteCandidate {
  const elevation = computeElevationStats(route.coords);
  const surfaces = computeSurfaceBreakdown(route.coords, route.profile);
  const crossings = detectArterialCrossings(route.coords);
  const maneuvers = extractRouteManeuvers(route.coords);
  return {
    id: route.id,
    profile: route.profile,
    title: route.name,
    subtitle: route.description || route.tag,
    source: route.isCurated ? 'curated' : 'gpx',
    coords: route.coords,
    distanceKm: route.distanceKm || computePathDistanceKm(route.coords),
    elevation,
    surfaces,
    crossings,
    maneuvers,
    waypoints: route.waypoints.length >= 2
      ? route.waypoints
      : [
          [route.coords[0][0], route.coords[0][1]],
          [route.coords[route.coords.length - 1][0], route.coords[route.coords.length - 1][1]],
        ],
    originName: route.originName,
    destName: route.destName,
  };
}

const THEME_STORAGE_KEY = 'eixoverde:theme';

function getInitialTheme(): ThemeMode {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', saved === 'dark');
        }
        return saved;
      }
    }
  } catch {
    // Fallback to light
  }
  return 'light';
}

function syncPersistTheme(theme: ThemeMode): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

function persistPrefs(state: AppStore): void {
  syncPersistTheme(state.theme);
  syncPersistCitySlug(state.selectedCitySlug);
  const prefs: UserPreferences = {
    theme: state.theme,
    basemap: state.basemap,
    selectedVehicleId: state.selectedVehicleId,
    selectedModeIndex: state.selectedModeIndex,
    riderWeightKg: state.riderWeightKg,
    voiceMode: state.voiceMode,
    showBikeLanes: state.showBikeLanes,
    showPois: state.showPois,
    showStations: state.showStations,
    showHazards: state.showHazards,
    showSafetySegments: state.showSafetySegments,
    selectedCitySlug: state.selectedCitySlug,
    isPremium: state.isPremium,
    premiumSince: state.premiumSince,
    gpxExportCount: state.gpxExportCount,
    homePlace: state.homePlace,
    workPlace: state.workPlace,
    batteryCalibrations: state.batteryCalibrations,
  };
  void repository.savePreferences(prefs);
}

export const useAppStore = create<AppStore>((set, get) => ({
  initialized: false,
  mode: 'explore',
  theme: getInitialTheme(),
  basemap: 'standard',
  voiceMode: 'voice', // Audio-first handlebar mode ON by default
  showBikeLanes: true,
  showPois: true,
  showStations: true,
  showHazards: true,
  showSafetySegments: true,

  cloudConfigured: hasSupabaseConfig(),
  authUser: null,
  authLoading: false,
  authRecoveryMode: false,
  syncStatus: hasSupabaseConfig() ? 'idle' : 'local',
  pendingSyncCount: 0,
  lastSyncedAt: null,
  syncError: null,
  authModalOpen: false,
  migrationPromptOpen: false,
  localMigrationSummary: null,

  customVehicles: [],
  selectedVehicleId: 'jet-aluguel',
  selectedModeIndex: 1,
  riderWeightKg: 70,
  isRoundTrip: false,
  batteryCalibrations: {},

  weather: null,
  weatherLoading: false,
  rideSessions: [],
  activeRide: null,
  pendingRideSummary: null,
  replayingRideId: null,

  communityRoutes: [],
  routeRatings: {},
  offlineCache: {
    ready: false,
    lanesCached: false,
    poisCached: false,
    cachedCount: 0,
    lastUpdatedAt: null,
  },
  offlineCacheLoading: false,
  realtimeConnected: false,

  origin: null,
  destination: null,
  currentLocationPlace: null,
  viaPoints: [],
  isRouting: false,
  candidates: [],
  selectedCandidateIdx: 0,
  isEditingWaypoints: false,
  mapPickTarget: null,
  hoverCoordIndex: null,
  fitBoundsNonce: 0,
  flyToTarget: null,

  savedRoutes: getCuratedRoutesForCity(getInitialCitySlug()),
  savedPlaces: [],
  hazards: [],
  exploreTab: 'routes',

  nav: {
    isTracking: false,
    isDemoMode: false,
    isFreeRide: false,
    followUser: true,
    pitch3D: true,
    currentPos: null,
    currentHeading: 0,
    currentSpeedKmh: 0,
    accuracyMeters: null,
    distanceAlongM: 0,
    offRouteMeters: 0,
    isRerouting: false,
    reversed: false,
  },

  garageOpen: false,
  compareOpen: false,
  menuOpen: false,
  cityModalOpen: false,
  selectedCitySlug: getInitialCitySlug(),
  privacyModalOpen: false,
  vipModalOpen: false,
  vipLoading: false,
  isPremium: false,
  premiumSince: undefined,
  gpxExportCount: 0,
  deleteAccountLoading: false,
  hazardPickerOpen: false,
  pendingHazardCoords: null,
  pendingSavePlace: null,
  mapContextPin: null,
  mapContextScreenPos: null,
  toasts: [],

  async hydrateFromStorage() {
    const [prefs, userRoutes, savedPlaces, customVehicles, hazards, rideSessions, localRatings] = await Promise.all([
      repository.getPreferences(),
      repository.getSavedRoutes(),
      repository.getSavedPlaces(),
      repository.getCustomVehicles(),
      repository.getHazards(),
      repository.getRideSessions(),
      indexedDbStorage.getRouteRatings(),
    ]);

    const theme: ThemeMode = prefs.theme ?? get().theme ?? 'light';
    syncPersistTheme(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    void configureNativeStatusBar(theme);

    const selectedCitySlug = getCapitalBySlug(
      prefs.selectedCitySlug ?? get().selectedCitySlug ?? 'brasilia'
    ).slug;
    syncPersistCitySlug(selectedCitySlug);
    const cityCurated = getCuratedRoutesForCity(selectedCitySlug);

    const userIds = new Set(userRoutes.map((r) => r.id));
    const mergedRoutes = [...userRoutes, ...cityCurated.filter((c) => !userIds.has(c.id))];

    const homeSaved = savedPlaces.find((p) => p.category === 'home');
    const workSaved = savedPlaces.find((p) => p.category === 'work');

    // Merge locally saved route ratings into routeRatings map
    const mergedRatings: Record<string, RouteRatingAggregate> = { ...get().routeRatings };
    for (const r of localRatings) {
      const prev = mergedRatings[r.routeId];
      if (!prev) {
        mergedRatings[r.routeId] = {
          routeId: r.routeId,
          avgRating: r.rating,
          ratingCount: 1,
          topTags: r.tags.slice(0, 3),
          userRating: r.rating,
          userTags: r.tags,
        };
      } else {
        mergedRatings[r.routeId] = {
          ...prev,
          userRating: prev.userRating ?? r.rating,
          userTags: prev.userTags ?? r.tags,
        };
      }
    }

    set({
      theme,
      basemap: prefs.basemap ?? get().basemap ?? 'standard',
      selectedVehicleId: prefs.selectedVehicleId ?? get().selectedVehicleId ?? 'jet-aluguel',
      selectedModeIndex: prefs.selectedModeIndex ?? get().selectedModeIndex ?? 1,
      riderWeightKg: prefs.riderWeightKg ?? get().riderWeightKg ?? 70,
      voiceMode: prefs.voiceMode ?? get().voiceMode ?? 'voice',
      showBikeLanes: prefs.showBikeLanes ?? true,
      showPois: prefs.showPois ?? true,
      showStations: prefs.showStations ?? true,
      showHazards: prefs.showHazards ?? true,
      showSafetySegments: prefs.showSafetySegments ?? true,
      selectedCitySlug,
      isPremium: Boolean(prefs.isPremium || get().isPremium),
      premiumSince: prefs.premiumSince ?? get().premiumSince,
      gpxExportCount: prefs.gpxExportCount ?? get().gpxExportCount ?? 0,
      homePlace: homeSaved
        ? { id: homeSaved.id, name: homeSaved.label, subtitle: homeSaved.address, coords: homeSaved.coords, source: 'curated' }
        : prefs.homePlace,
      workPlace: workSaved
        ? { id: workSaved.id, name: workSaved.label, subtitle: workSaved.address, coords: workSaved.coords, source: 'curated' }
        : prefs.workPlace,
      batteryCalibrations: prefs.batteryCalibrations ?? get().batteryCalibrations ?? {},
      customVehicles,
      savedRoutes: mergedRoutes,
      savedPlaces,
      hazards,
      rideSessions,
      routeRatings: mergedRatings,
    });
  },

  async initAuthAndSync() {
    const configured = hasSupabaseConfig();
    set({
      cloudConfigured: configured,
      syncStatus: configured ? 'idle' : 'local',
    });

    syncEngine.subscribe((snap) => {
      set({
        syncStatus: snap.status,
        pendingSyncCount: snap.pendingCount,
        lastSyncedAt: snap.lastSyncedAt,
        syncError: snap.error,
      });
    });

    syncEngine.onHydrate(async () => {
      await get().hydrateFromStorage();
    });

    if (!configured) {
      await syncEngine.initialize(null);
      return;
    }

    // Subscribe to Supabase Realtime live community hazard updates
    if (unsubscribeRealtimeHazards) {
      unsubscribeRealtimeHazards();
      unsubscribeRealtimeHazards = null;
    }
    unsubscribeRealtimeHazards = subscribeRealtimeHazards(
      (ev) => {
        if (ev.eventType === 'DELETE' && ev.deletedId) {
          void indexedDbStorage.deleteHazard(ev.deletedId);
          set((s) => ({
            hazards: s.hazards.filter((h) => h.id !== ev.deletedId),
          }));
          return;
        }
        if (ev.hazard) {
          const incoming = ev.hazard;
          void indexedDbStorage.saveHazard(incoming);
          set((s) => {
            const exists = s.hazards.some((h) => h.id === incoming.id);
            const next = exists
              ? s.hazards.map((h) => (h.id === incoming.id ? { ...h, ...incoming } : h))
              : [incoming, ...s.hazards];
            return { hazards: next };
          });
        }
      },
      (connected) => set({ realtimeConnected: connected })
    );

    const { user } = await getCurrentSession();
    set({ authUser: user });
    await syncEngine.initialize(user?.id ?? null);
    void get().loadCommunityData();

    if (user) {
      void fetchCloudVipStatus(user.id).then((vip) => {
        if (vip?.isPremium && !get().isPremium) {
          void hideNativeAdBanner();
          set({ isPremium: true, premiumSince: vip.premiumSince ?? new Date().toISOString() });
          persistPrefs(get());
        }
      });
      const alreadyMigrated = await syncEngine.hasCompletedInitialMigration(user.id);
      const summary = await syncEngine.getLocalMigrationSummary();
      if (!alreadyMigrated && summary.total > 0) {
        set({ localMigrationSummary: summary, migrationPromptOpen: true });
      } else {
        await syncEngine.markInitialMigrationCompleted(user.id);
        void syncEngine.syncNow();
      }
    }

    subscribeAuthChanges((event, nextUser) => {
      if (event === 'PASSWORD_RECOVERY') {
        set({ authRecoveryMode: true, authModalOpen: true, authUser: nextUser });
        return;
      }
      if (event === 'SIGNED_OUT') {
        set({ authUser: null, authRecoveryMode: false });
        void syncEngine.setAuthenticatedUser(null);
        return;
      }
      if (nextUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        const prevId = get().authUser?.id;
        set({ authUser: nextUser });
        void syncEngine.setAuthenticatedUser(nextUser.id);
        void get().loadCommunityData();
        void fetchCloudVipStatus(nextUser.id).then((vip) => {
          if (vip?.isPremium && !get().isPremium) {
            void hideNativeAdBanner();
            set({ isPremium: true, premiumSince: vip.premiumSince ?? new Date().toISOString() });
            persistPrefs(get());
          }
        });
        if (prevId !== nextUser.id) {
          void (async () => {
            const alreadyMigrated = await syncEngine.hasCompletedInitialMigration(nextUser.id);
            const summary = await syncEngine.getLocalMigrationSummary();
            if (!alreadyMigrated && summary.total > 0) {
              set({ localMigrationSummary: summary, migrationPromptOpen: true });
            } else {
              await syncEngine.markInitialMigrationCompleted(nextUser.id);
              void syncEngine.syncNow();
            }
          })();
        }
      }
    });
  },

  setAuthModalOpen(open) {
    set({ authModalOpen: open, authRecoveryMode: open ? get().authRecoveryMode : false });
  },

  setMigrationPromptOpen(open) {
    set({ migrationPromptOpen: open });
  },

  async signIn(email, password) {
    set({ authLoading: true });
    const res = await signInWithPassword(email, password);
    set({ authLoading: false });
    if (res.error || !res.user) {
      return { ok: false, error: res.error || 'Falha ao entrar.' };
    }
    const user = res.user;
    set({ authUser: user, authModalOpen: false, cloudConfigured: hasSupabaseConfig() });
    await syncEngine.setAuthenticatedUser(user.id);

    const alreadyMigrated = await syncEngine.hasCompletedInitialMigration(user.id);
    const summary = await syncEngine.getLocalMigrationSummary();
    if (!alreadyMigrated && summary.total > 0) {
      set({ localMigrationSummary: summary, migrationPromptOpen: true });
    } else {
      await syncEngine.markInitialMigrationCompleted(user.id);
      void syncEngine.syncNow({ force: true });
    }

    get().pushToast('Sessão iniciada!', `Bem-vindo(a), ${user.displayName || user.email}`, 'emerald');
    return { ok: true };
  },

  async signUp(email, password, displayName) {
    set({ authLoading: true });
    const res = await signUpWithPassword(email, password, displayName);
    set({ authLoading: false });
    if (res.error) {
      return { ok: false, error: res.error };
    }
    if (res.needsEmailConfirmation) {
      get().pushToast(
        'Confirme seu e-mail',
        'Enviamos um link de confirmação para ativar sua conta EixoVerde.',
        'emerald'
      );
      return { ok: true, needsEmailConfirmation: true };
    }
    if (res.user) {
      const user = res.user;
      set({ authUser: user, authModalOpen: false, cloudConfigured: hasSupabaseConfig() });
      await syncEngine.setAuthenticatedUser(user.id);

      const summary = await syncEngine.getLocalMigrationSummary();
      if (summary.total > 0) {
        set({ localMigrationSummary: summary, migrationPromptOpen: true });
      } else {
        await syncEngine.markInitialMigrationCompleted(user.id);
        void syncEngine.syncNow({ force: true });
      }
      get().pushToast('Conta criada com sucesso!', `Bem-vindo(a), ${user.displayName || user.email}`, 'emerald');
    }
    return { ok: true };
  },

  async sendMagicLink(email) {
    set({ authLoading: true });
    const res = await signInWithMagicLink(email);
    set({ authLoading: false });
    if (res.error) {
      return { ok: false, error: res.error };
    }
    get().pushToast('Link mágico enviado!', 'Verifique sua caixa de entrada para entrar sem senha.', 'emerald');
    return { ok: true };
  },

  async signInWithGoogle() {
    set({ authLoading: true });
    const res = await authSignInWithGoogle();
    set({ authLoading: false });
    if (res.error) {
      return { ok: false, error: res.error };
    }
    return { ok: true };
  },

  async requestPasswordReset(email) {
    set({ authLoading: true });
    const res = await sendPasswordReset(email);
    set({ authLoading: false });
    if (res.error) {
      return { ok: false, error: res.error };
    }
    get().pushToast('E-mail de recuperação enviado!', 'Use o link recebido para redefinir sua senha.', 'emerald');
    return { ok: true };
  },

  async completePasswordRecovery(newPassword) {
    set({ authLoading: true });
    const res = await updatePassword(newPassword);
    set({ authLoading: false });
    if (res.error) {
      return { ok: false, error: res.error };
    }
    set({ authRecoveryMode: false, authModalOpen: false });
    get().pushToast('Senha atualizada!', 'Sua nova senha já está ativa.', 'emerald');
    return { ok: true };
  },

  async signOut() {
    set({ authLoading: true });
    // Flush pending outbox before signing out if online
    if (get().authUser && get().pendingSyncCount > 0) {
      try {
        await syncEngine.syncNow({ force: true });
      } catch {
        // Proceed with local sign-out even if offline
      }
    }
    await authSignOut();
    await syncEngine.setAuthenticatedUser(null);
    set({
      authUser: null,
      authLoading: false,
      authRecoveryMode: false,
      migrationPromptOpen: false,
      syncStatus: hasSupabaseConfig() ? 'idle' : 'local',
    });
    get().pushToast('Sessão encerrada', 'Seus dados permanecem salvos neste dispositivo.', 'slate');
  },

  setPrivacyModalOpen(open) {
    set({ privacyModalOpen: open });
  },

  setVipModalOpen(open) {
    set({ vipModalOpen: open });
  },

  async activateVipLifetime() {
    set({ vipLoading: true });
    const nowIso = new Date().toISOString();
    const user = get().authUser;
    if (user && hasSupabaseConfig()) {
      await syncCloudVipActivation(user.id);
    }
    void hideNativeAdBanner();
    void triggerHaptic('success');
    set({
      isPremium: true,
      premiumSince: get().premiumSince ?? nowIso,
      vipLoading: false,
      vipModalOpen: false,
    });
    persistPrefs(get());
    get().pushToast(
      'Bem-vindo ao EixoVerde VIP!',
      'Anúncios removidos e todos os benefícios vitalícios desbloqueados.',
      'emerald'
    );
    return true;
  },

  async restoreVipPurchase() {
    set({ vipLoading: true });
    const user = get().authUser;
    if (user && hasSupabaseConfig()) {
      const cloudVip = await fetchCloudVipStatus(user.id);
      if (cloudVip?.isPremium) {
        void hideNativeAdBanner();
        set({
          isPremium: true,
          premiumSince: cloudVip.premiumSince ?? get().premiumSince ?? new Date().toISOString(),
          vipLoading: false,
          vipModalOpen: false,
        });
        persistPrefs(get());
        get().pushToast('Compra VIP restaurada!', 'Seus benefícios vitalícios estão ativos.', 'emerald');
        return true;
      }
    }
    set({ vipLoading: false });
    if (get().isPremium) {
      get().pushToast('EixoVerde VIP já está ativo neste aparelho.', undefined, 'emerald');
      return true;
    }
    get().pushToast(
      'Nenhuma compra encontrada',
      user
        ? 'Não encontramos uma licença VIP vinculada a esta conta.'
        : 'Entre na sua conta EixoVerde para restaurar compras feitas em outro aparelho.',
      'amber'
    );
    return false;
  },

  consumeGpxExportQuota() {
    const s = get();
    if (s.isPremium) return true;
    if (s.gpxExportCount >= FREE_GPX_EXPORT_LIMIT) {
      set({ vipModalOpen: true });
      get().pushToast(
        'Limite gratuito de GPX atingido',
        `Desbloqueie exportações GPX ilimitadas no EixoVerde VIP (${VIP_PRICE_LABEL}).`,
        'amber'
      );
      return false;
    }
    set({ gpxExportCount: s.gpxExportCount + 1 });
    persistPrefs(get());
    return true;
  },

  setCityModalOpen(open) {
    set({ cityModalOpen: open });
  },

  async selectCity(citySlug, flyMap = true) {
    const cap = getCapitalBySlug(citySlug);
    syncPersistCitySlug(cap.slug);
    const personalRoutes = get().savedRoutes.filter((r) => !r.isCurated);
    const personalIds = new Set(personalRoutes.map((r) => r.id));
    const cityCurated = getCuratedRoutesForCity(cap.slug);
    const mergedRoutes = [...personalRoutes, ...cityCurated.filter((c) => !personalIds.has(c.id))];

    if (get().mode === 'preview') {
      get().clearActiveRoute();
    }

    set({
      selectedCitySlug: cap.slug,
      cityModalOpen: false,
      menuOpen: false,
      savedRoutes: mergedRoutes,
    });

    if (flyMap) {
      get().flyTo(cap.center, cap.zoom);
    }

    void triggerHaptic('light');
    persistPrefs(get());
    void get().refreshWeather(cap.center);
    void get().refreshOfflineCache();
    get().pushToast(
      `Explorar ${cap.label}`,
      `${cap.totalKm} km de malha cicloviária • Região ${cap.region}`,
      'emerald'
    );
  },

  async detectCityFromGps() {
    const gpsPlace = await get().locateCurrentPosition({ silent: false, flyToUser: false });
    const pos = gpsPlace?.coords ?? get().nav.currentPos;
    if (!pos) return;
    const nearest = findNearestCapital(pos);
    await get().selectCity(nearest.slug, true);
  },

  async deleteAccount(wipeLocalData = false) {
    const user = get().authUser;
    if (!user) {
      return { ok: false, error: 'Nenhuma conta autenticada no momento.' };
    }
    set({ deleteAccountLoading: true });
    const res = await deleteCloudAccount(user.id);
    if (!res.ok) {
      set({ deleteAccountLoading: false });
      return { ok: false, error: res.error || 'Não foi possível excluir a conta.' };
    }

    await syncEngine.setAuthenticatedUser(null);
    if (wipeLocalData) {
      await indexedDbStorage.resetForTests();
      await get().hydrateFromStorage();
    }

    set({
      authUser: null,
      deleteAccountLoading: false,
      authRecoveryMode: false,
      migrationPromptOpen: false,
      menuOpen: false,
      syncStatus: hasSupabaseConfig() ? 'idle' : 'local',
    });

    get().pushToast(
      'Conta excluída permanentemente',
      wipeLocalData
        ? 'Seus dados na nuvem e neste dispositivo foram removidos.'
        : 'Sua conta na nuvem foi excluída. Seus dados locais foram mantidos neste aparelho.',
      'emerald'
    );
    return { ok: true };
  },

  handleHardwareBackButton() {
    const s = get();
    if (s.privacyModalOpen) {
      set({ privacyModalOpen: false });
      return true;
    }
    if (s.vipModalOpen) {
      set({ vipModalOpen: false });
      return true;
    }
    if (s.cityModalOpen) {
      set({ cityModalOpen: false });
      return true;
    }
    if (s.authModalOpen) {
      set({ authModalOpen: false, authRecoveryMode: false });
      return true;
    }
    if (s.migrationPromptOpen) {
      set({ migrationPromptOpen: false });
      return true;
    }
    if (s.pendingRideSummary) {
      set({ pendingRideSummary: null });
      return true;
    }
    if (s.hazardPickerOpen) {
      set({ hazardPickerOpen: false, pendingHazardCoords: null });
      return true;
    }
    if (s.pendingSavePlace) {
      set({ pendingSavePlace: null });
      return true;
    }
    if (s.compareOpen) {
      set({ compareOpen: false });
      return true;
    }
    if (s.garageOpen) {
      set({ garageOpen: false });
      return true;
    }
    if (s.menuOpen) {
      set({ menuOpen: false });
      return true;
    }
    if (s.mapContextPin) {
      s.closeMapContextPin();
      return true;
    }
    if (s.mapPickTarget) {
      set({ mapPickTarget: null });
      return true;
    }
    if (s.mode === 'navigate') {
      s.stopNavigation();
      return true;
    }
    if (s.mode === 'preview') {
      s.clearActiveRoute();
      return true;
    }
    if (s.replayingRideId) {
      set({ replayingRideId: null });
      return true;
    }
    return false;
  },

  async syncNow() {
    const ok = await syncEngine.syncNow({ force: true });
    await get().hydrateFromStorage();
    return ok;
  },

  async migrateLocalToCloud() {
    set({ migrationPromptOpen: false });
    const ok = await syncEngine.migrateLocalToCloud();
    await get().hydrateFromStorage();
    if (ok) {
      get().pushToast('Dados sincronizados na nuvem!', 'Suas rotas, locais e veículos foram migrados com segurança.', 'emerald');
    } else {
      get().pushToast('Migração agendada', 'Seus dados serão sincronizados assim que a conexão estabilizar.', 'amber');
    }
    return ok;
  },

  async bootstrap() {
    if (get().initialized) return;
    await get().hydrateFromStorage();
    set({ initialized: true });
    void hideNativeSplashScreen();
    void get().initAuthAndSync();
    const activeCap = getCapitalBySlug(get().selectedCitySlug);
    void get().refreshWeather(activeCap.center);
    void get().refreshOfflineCache();

    // Register Android Hardware Back-Button & Custom Scheme Deep-Link (`br.com.eixoverde.app://...`) listeners
    registerNativeAppListeners({
      onBackPress: () => get().handleHardwareBackButton(),
      onDeepLink: (parsed) => {
        void (async () => {
          if (parsed.accessToken || parsed.authCode) {
            const res = await consumeDeepLinkAuth(parsed);
            if (res.error) {
              get().pushToast('Falha na autenticação', res.error, 'rose');
            } else if (res.isRecovery) {
              set({ authRecoveryMode: true, authModalOpen: true, authUser: res.user ?? get().authUser });
            } else if (res.user) {
              set({ authUser: res.user, authModalOpen: false });
              await syncEngine.setAuthenticatedUser(res.user.id);
              void syncEngine.syncNow({ force: true });
              get().pushToast('Sessão iniciada!', `Bem-vindo(a), ${res.user.displayName || res.user.email}`, 'emerald');
            }
          }
          if (parsed.shareParam) {
            const sharedRoute = decodeShareableRouteFromUrl(parsed.shareParam);
            if (sharedRoute && sharedRoute.waypoints.length >= 2) {
              const originPlace = await reverseGeocode(sharedRoute.waypoints[0]);
              const destPlace = await reverseGeocode(sharedRoute.waypoints[sharedRoute.waypoints.length - 1]);
              set({
                origin: originPlace,
                destination: destPlace,
                viaPoints: sharedRoute.waypoints.slice(1, -1),
                mode: 'preview',
              });
              await get().recalculateRoute(sharedRoute.waypoints);
              get().pushToast('Rota compartilhada aberta', sharedRoute.name, 'emerald');
            }
          }
        })();
      },
    });

    // Check if opened from a shared route link (?share=...)
    const shared = decodeShareableRouteFromUrl();
    if (shared && shared.waypoints.length >= 2) {
      const originPlace = await reverseGeocode(shared.waypoints[0]);
      const destPlace = await reverseGeocode(shared.waypoints[shared.waypoints.length - 1]);
      set({
        origin: originPlace,
        destination: destPlace,
        viaPoints: shared.waypoints.slice(1, -1),
        mode: 'preview',
      });
      await get().recalculateRoute(shared.waypoints);
      get().pushToast('Rota compartilhada aberta', shared.name, 'emerald');
      return;
    }

    // Automatically locate user's real GPS position on startup so Point A is always accurate
    void get().locateCurrentPosition({ silent: true, flyToUser: activeCap.slug === 'brasilia' });
  },

  async refreshWeather(coords) {
    const target =
      coords ??
      get().candidates[get().selectedCandidateIdx]?.waypoints[0] ??
      get().nav.currentPos ??
      BRAND.defaultCenter;
    set({ weatherLoading: true });
    const snapshot = await fetchLiveWeather(target);
    set((s) => ({
      weather: snapshot ?? s.weather,
      weatherLoading: false,
    }));
  },

  startFreeRide() {
    void hideNativeAdBanner();
    const state = get();
    const vehicle = selectActiveVehicle(state);
    const startPos = state.nav.currentPos ?? BRAND.defaultCenter;
    const rec = createRideRecording({
      mode: 'free_ride',
      vehicle,
      vehicleModeIndex: state.selectedModeIndex,
      initialPos: state.nav.currentPos,
    });
    set((s) => ({
      mode: 'navigate',
      isEditingWaypoints: false,
      mapPickTarget: null,
      replayingRideId: null,
      activeRide: rec,
      nav: {
        ...s.nav,
        isTracking: true,
        isDemoMode: false,
        isFreeRide: true,
        followUser: true,
        pitch3D: true,
        distanceAlongM: 0,
        offRouteMeters: 0,
        currentSpeedKmh: 0,
        currentPos: startPos,
      },
    }));
    get().pushToast('Modo Livre iniciado!', 'Gravando trajeto com auto-pausa inteligente.', 'emerald');
  },

  recordRideSample(sample) {
    const cur = get().activeRide;
    if (!cur) return;
    const next = appendRideSample(cur, sample);
    set({ activeRide: next });
  },

  toggleRidePause() {
    const cur = get().activeRide;
    if (!cur) return;
    const nextManual = !cur.manualPaused;
    set({
      activeRide: {
        ...cur,
        manualPaused: nextManual,
        isPaused: nextManual || cur.autoPaused,
        lastTickMs: Date.now(),
      },
    });
  },

  async savePendingRideSummary(opts) {
    const pending = get().pendingRideSummary;
    if (!pending) return;

    const cleanTitle = opts?.title?.trim() || pending.title;
    const hasBatteryInput =
      pending.isElectric &&
      typeof opts?.batteryStartPct === 'number' &&
      typeof opts?.batteryEndPct === 'number' &&
      opts.batteryStartPct > opts.batteryEndPct;

    const actualUsedPct = hasBatteryInput
      ? Math.max(0, Math.min(100, Math.round(opts!.batteryStartPct! - opts!.batteryEndPct!)))
      : undefined;

    const nowIso = new Date().toISOString();
    const finalized: RideSession = {
      ...pending,
      title: cleanTitle,
      batteryStartPct: hasBatteryInput ? Math.round(opts!.batteryStartPct!) : undefined,
      batteryEndPct: hasBatteryInput ? Math.round(opts!.batteryEndPct!) : undefined,
      batteryUsedPct: actualUsedPct,
      updatedAt: nowIso,
    };

    await repository.saveRideSession(finalized);

    let calibrationUpdated = false;
    let nextCalibrations = { ...get().batteryCalibrations };

    // Only real (non-demo) electric rides calibrate real-world vehicle battery efficiency
    if (
      !finalized.isDemo &&
      finalized.isElectric &&
      opts?.applyCalibration !== false &&
      typeof actualUsedPct === 'number' &&
      typeof finalized.estimatedBatteryUsedPct === 'number'
    ) {
      const updatedCal = computeUpdatedBatteryCalibration({
        vehicleId: finalized.vehicleId,
        previous: nextCalibrations[finalized.vehicleId],
        distanceKm: finalized.distanceKm,
        actualBatteryUsedPct: actualUsedPct,
        nominalEstimatedBatteryUsedPct: finalized.estimatedBatteryUsedPct,
        nowIso,
      });
      if (updatedCal) {
        nextCalibrations = { ...nextCalibrations, [finalized.vehicleId]: updatedCal };
        calibrationUpdated = true;
      }
    }

    set((s) => ({
      rideSessions: [finalized, ...s.rideSessions.filter((r) => r.id !== finalized.id)],
      pendingRideSummary: null,
      batteryCalibrations: nextCalibrations,
    }));

    if (calibrationUpdated) {
      persistPrefs(get());
      const multPct = Math.round(nextCalibrations[finalized.vehicleId].efficiencyMultiplier * 100);
      get().pushToast(
        'Trajeto salvo & bateria calibrada!',
        `${finalized.vehicleName} ajustado para ${multPct}% da autonomia nominal.`,
        'emerald'
      );
    } else {
      get().pushToast('Trajeto salvo em Meus Trajetos!', `${finalized.title} • ${finalized.distanceKm.toFixed(1).replace('.', ',')} km`, 'emerald');
    }
  },

  discardPendingRideSummary() {
    set({ pendingRideSummary: null });
  },

  async deleteRideSession(id) {
    await repository.deleteRideSession(id);
    set((s) => ({
      rideSessions: s.rideSessions.filter((r) => r.id !== id),
      replayingRideId: s.replayingRideId === id ? null : s.replayingRideId,
    }));
    get().pushToast('Registro de trajeto removido', undefined, 'slate');
  },

  async saveRideAsRoute(id) {
    const ride = get().rideSessions.find((r) => r.id === id);
    if (!ride) return;
    const route = rideSessionToSavedRoute(ride);
    if (!route) {
      get().pushToast('Trajeto muito curto', 'É preciso ao menos 2 pontos GPS para criar uma rota.', 'amber');
      return;
    }
    await repository.saveRoute(route);
    set((s) => ({
      savedRoutes: [route, ...s.savedRoutes.filter((r) => r.id !== route.id)],
    }));
    get().pushToast('Salvo em Rotas Salvas!', route.name, 'emerald');
  },

  setReplayingRideId(id) {
    set({ replayingRideId: id });
  },

  resetVehicleCalibration(vehicleId) {
    const next = { ...get().batteryCalibrations };
    delete next[vehicleId];
    set({ batteryCalibrations: next });
    persistPrefs(get());
    get().pushToast('Calibração redefinida', 'Autonomia voltou ao padrão de fábrica do veículo.', 'slate');
  },

  async locateCurrentPosition({ silent = false, flyToUser = false } = {}) {
    const coords = await getNativeOrWebPosition(6500);

    if (!coords) {
      if (!silent) {
        get().pushToast('Permissão de GPS necessária', 'Ative a localização no aparelho para usar seu ponto atual.', 'amber');
      }
      return null;
    }

    set((s) => ({
      nav: { ...s.nav, currentPos: coords.pos, accuracyMeters: coords.acc },
    }));

    if (flyToUser && get().mode === 'explore') {
      get().flyTo(coords.pos, 15.2);
    }

    const rev = await reverseGeocode(coords.pos);
    const gpsPlace: PlaceResult = {
      ...rev,
      id: 'gps-current',
      name: rev.name && rev.name !== 'Ponto Selecionado' ? `Minha localização (${rev.name})` : 'Minha localização atual',
      coords: coords.pos,
      source: 'gps',
    };
    set({ currentLocationPlace: gpsPlace });
    return gpsPlace;
  },

  async useCurrentLocationAsOrigin() {
    const gpsPlace = (await get().locateCurrentPosition({ silent: false, flyToUser: false })) ?? get().currentLocationPlace;
    if (!gpsPlace) return;
    set({ origin: gpsPlace });
    if (get().destination) {
      await get().recalculateRoute();
    } else {
      get().flyTo(gpsPlace.coords, 15.5);
    }
  },

  setMode(mode) {
    set({ mode, mapPickTarget: null });
  },

  toggleTheme() {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    void configureNativeStatusBar(next);
    void triggerHaptic('light');
    set({ theme: next });
    persistPrefs(get());
  },

  toggleBasemap() {
    const next: MapBasemapMode = get().basemap === 'standard' ? 'satellite' : 'standard';
    set({ basemap: next });
    persistPrefs(get());
  },

  cycleVoiceMode() {
    const cur = get().voiceMode;
    const next: VoiceMode = cur === 'voice' ? 'chime' : cur === 'chime' ? 'mute' : 'voice';
    set({ voiceMode: next });
    persistPrefs(get());
    const labels: Record<VoiceMode, string> = {
      voice: 'Voz PT-BR + alertas sonoros ativados',
      chime: 'Modo discreto: apenas sinais sonoros',
      mute: 'Áudio de navegação silenciado',
    };
    get().pushToast('Áudio da navegação', labels[next], 'slate');
  },

  toggleLayer(layer) {
    if (layer === 'lanes') set((s) => ({ showBikeLanes: !s.showBikeLanes }));
    if (layer === 'pois') set((s) => ({ showPois: !s.showPois }));
    if (layer === 'stations') set((s) => ({ showStations: !s.showStations }));
    if (layer === 'hazards') set((s) => ({ showHazards: !s.showHazards }));
    persistPrefs(get());
  },

  toggleSafetySegments() {
    set((s) => ({ showSafetySegments: !s.showSafetySegments }));
    persistPrefs(get());
  },

  setMapContextScreenPos(pos) {
    set({ mapContextScreenPos: pos });
  },

  async loadCommunityData() {
    if (!hasSupabaseConfig()) return;
    try {
      const userId = get().authUser?.id ?? null;
      const [cloudRoutes, cloudRatings] = await Promise.all([
        supabaseAdapter.pullCommunityRoutes(),
        supabaseAdapter.pullRouteRatings(userId),
      ]);
      const localRatings = await indexedDbStorage.getRouteRatings();
      const mergedRatings: Record<string, RouteRatingAggregate> = { ...cloudRatings };
      for (const local of localRatings) {
        const existing = mergedRatings[local.routeId];
        if (!existing) {
          mergedRatings[local.routeId] = {
            routeId: local.routeId,
            avgRating: local.rating,
            ratingCount: 1,
            topTags: local.tags.slice(0, 3),
            userRating: local.rating,
            userTags: local.tags,
          };
        } else if (!existing.userRating) {
          mergedRatings[local.routeId] = {
            ...existing,
            userRating: local.rating,
            userTags: local.tags,
          };
        }
      }
      set({ communityRoutes: cloudRoutes, routeRatings: mergedRatings });
    } catch {
      // Non-fatal offline or missing-table fallback
    }
  },

  async rateRoute(routeId, rating, tags) {
    const cleanRating = Math.max(1, Math.min(5, Math.round(rating)));
    const now = new Date().toISOString();
    await indexedDbStorage.saveRouteRating({
      routeId,
      rating: cleanRating,
      tags,
      updatedAt: now,
    });

    // Optimistically update local aggregate immediately
    set((s) => {
      const prev = s.routeRatings[routeId];
      const hadUserRating = typeof prev?.userRating === 'number';
      const nextCount = prev ? (hadUserRating ? prev.ratingCount : prev.ratingCount + 1) : 1;
      const prevSum = prev ? prev.avgRating * prev.ratingCount : 0;
      const adjustedSum = hadUserRating && prev ? prevSum - (prev.userRating ?? 0) + cleanRating : prevSum + cleanRating;
      const nextAvg = nextCount > 0 ? +(adjustedSum / nextCount).toFixed(1) : cleanRating;
      const topTags = tags.length > 0 ? tags.slice(0, 3) : (prev?.topTags ?? []);
      return {
        routeRatings: {
          ...s.routeRatings,
          [routeId]: {
            routeId,
            avgRating: nextAvg,
            ratingCount: nextCount,
            topTags,
            userRating: cleanRating,
            userTags: tags,
          },
        },
        communityRoutes: s.communityRoutes.map((cr) =>
          cr.id === routeId ? { ...cr, avgRating: nextAvg, ratingCount: nextCount } : cr
        ),
      };
    });

    const user = get().authUser;
    let syncedCloud = false;
    if (user && hasSupabaseConfig()) {
      try {
        syncedCloud = await supabaseAdapter.upsertRouteRating(user.id, routeId, cleanRating, tags);
        if (syncedCloud) {
          void get().loadCommunityData();
        }
      } catch {
        // Already saved in IndexedDB
      }
    }

    get().pushToast(
      `Avaliação salva (${cleanRating}★)`,
      syncedCloud ? 'Sincronizada com a comunidade EixoVerde.' : 'Salva localmente neste dispositivo.',
      'emerald'
    );
  },

  async publishSavedRouteToCommunity(routeId) {
    const user = get().authUser;
    if (!user) {
      set({ authModalOpen: true });
      get().pushToast('Entre para publicar na Comunidade DF', 'Sua conta gratuita permite compartilhar rotas.', 'amber');
      return;
    }
    const route = get().savedRoutes.find((r) => r.id === routeId);
    if (!route) return;
    const authorName = user.displayName || user.email.split('@')[0] || 'Ciclista DF';
    try {
      const published = await supabaseAdapter.publishCommunityRoute(user.id, route, authorName);
      if (!published) {
        get().pushToast(
          'Comunidade DF indisponível',
          'Verifique se a migração SQL da Fase 4 foi aplicada no Supabase.',
          'amber'
        );
        return;
      }
      set((s) => ({
        communityRoutes: [published, ...s.communityRoutes.filter((r) => r.id !== published.id)],
      }));
      get().pushToast('Rota publicada na Comunidade DF!', published.name, 'emerald');
    } catch {
      get().pushToast('Falha ao publicar rota', 'Tente novamente quando a conexão estabilizar.', 'rose');
    }
  },

  async deleteCommunityRoute(routeId) {
    const user = get().authUser;
    if (!user) return;
    try {
      await supabaseAdapter.deleteCommunityRoute(user.id, routeId);
      set((s) => ({
        communityRoutes: s.communityRoutes.filter((r) => r.id !== routeId),
      }));
      get().pushToast('Rota removida da Comunidade DF', undefined, 'slate');
    } catch {
      get().pushToast('Não foi possível remover', 'Tente novamente em instantes.', 'rose');
    }
  },

  async refreshOfflineCache() {
    const status = await checkOfflineDfCacheStatus(import.meta.env.BASE_URL, get().selectedCitySlug);
    set({ offlineCache: status });
  },

  async warmOfflineCache() {
    const cap = getCapitalBySlug(get().selectedCitySlug);
    const cachedSlugs = getCachedOfflineCitySlugs();
    if (
      !get().isPremium &&
      cachedSlugs.length >= FREE_OFFLINE_CITY_LIMIT &&
      !cachedSlugs.includes(cap.slug)
    ) {
      set({ vipModalOpen: true });
      get().pushToast(
        'Cache Offline em múltiplas capitais é VIP',
        `O plano gratuito inclui 1 capital offline. Desbloqueie todas as 27 no EixoVerde VIP (${VIP_PRICE_LABEL}).`,
        'amber'
      );
      return;
    }

    set({ offlineCacheLoading: true });
    const status = await warmOfflineDfCache(import.meta.env.BASE_URL, cap.slug);
    set({ offlineCache: status, offlineCacheLoading: false });
    if (status.ready) {
      get().pushToast(
        `Cache Offline ${cap.stateCode} pronto!`,
        `Ciclovias, estações e POIs de ${cap.name} salvos neste dispositivo.`,
        'emerald'
      );
    } else {
      get().pushToast(
        'Cache parcialmente atualizado',
        `Conecte-se à internet para baixar todos os dados de ${cap.name}.`,
        'amber'
      );
    }
  },

  setExploreTab(tab) {
    set({ exploreTab: tab });
  },

  getAllVehicles() {
    return [...get().customVehicles, ...PRESET_VEHICLES];
  },

  getActiveVehicle() {
    const all = get().getAllVehicles();
    return all.find((v) => v.id === get().selectedVehicleId) ?? all[0];
  },

  selectVehicle(id, modeIdx) {
    const vehicle = get().getAllVehicles().find((v) => v.id === id);
    const defaultMode = vehicle ? Math.min(modeIdx ?? 1, vehicle.modes.length - 1) : 0;
    set({ selectedVehicleId: id, selectedModeIndex: Math.max(0, defaultMode) });
    persistPrefs(get());
  },

  setModeIndex(idx) {
    set({ selectedModeIndex: idx });
    persistPrefs(get());
  },

  setRiderWeight(kg) {
    set({ riderWeightKg: Math.max(35, Math.min(160, Math.round(kg))) });
    persistPrefs(get());
  },

  toggleRoundTrip() {
    set((s) => ({ isRoundTrip: !s.isRoundTrip }));
  },

  async addCustomVehicle(vehicle) {
    const existing = get().customVehicles;
    const isUpdate = existing.some((v) => v.id === vehicle.id);
    if (!get().isPremium && !isUpdate && existing.length >= FREE_CUSTOM_VEHICLE_LIMIT) {
      set({ vipModalOpen: true });
      get().pushToast(
        'Garagem Personalizada Ilimitada é VIP',
        `O plano gratuito inclui ${FREE_CUSTOM_VEHICLE_LIMIT} veículo personalizado. Desbloqueie ilimitados no VIP (${VIP_PRICE_LABEL}).`,
        'amber'
      );
      return;
    }
    await repository.saveCustomVehicle(vehicle);
    set((s) => ({
      customVehicles: [vehicle, ...s.customVehicles.filter((v) => v.id !== vehicle.id)],
      selectedVehicleId: vehicle.id,
      selectedModeIndex: Math.min(1, vehicle.modes.length - 1),
    }));
    persistPrefs(get());
    get().pushToast('Veículo cadastrado na Garagem', vehicle.name, 'emerald');
  },

  async deleteCustomVehicle(id) {
    await repository.deleteCustomVehicle(id);
    set((s) => {
      const remaining = s.customVehicles.filter((v) => v.id !== id);
      const selectedVehicleId = s.selectedVehicleId === id ? PRESET_VEHICLES[0].id : s.selectedVehicleId;
      return { customVehicles: remaining, selectedVehicleId };
    });
    persistPrefs(get());
  },

  setOrigin(place, autoPlan = true) {
    set({ origin: place });
    if (place && autoPlan && get().destination) {
      void get().recalculateRoute();
    }
  },

  async setDestination(place, autoPlan = true) {
    set({ destination: place });
    if (place && autoPlan) {
      if (!get().origin) {
        set({ mode: 'preview', isRouting: true });
        let resolvedOrigin = get().currentLocationPlace;
        if (!resolvedOrigin) {
          const cachedGps = get().nav.currentPos;
          if (cachedGps) {
            resolvedOrigin = {
              id: 'gps-current',
              name: 'Minha localização atual',
              subtitle: `${cachedGps[1].toFixed(4)}, ${cachedGps[0].toFixed(4)}`,
              coords: cachedGps,
              source: 'gps',
            };
          } else {
            resolvedOrigin = await get().locateCurrentPosition({ silent: true, flyToUser: false });
          }
        }

        set({
          origin:
            resolvedOrigin ?? {
              id: 'default-bsb-origin',
              name: 'Centro de Brasília (GPS indisponível)',
              subtitle: 'Toque no Ponto A para definir sua partida',
              coords: BRAND.defaultCenter,
              source: 'curated',
            },
        });
      }
      await get().recalculateRoute();
    }
  },

  swapOriginDest() {
    const { origin, destination, viaPoints } = get();
    set({
      origin: destination,
      destination: origin,
      viaPoints: [...viaPoints].reverse(),
    });
    if (origin && destination) {
      void get().recalculateRoute();
    }
  },

  setMapPickTarget(target) {
    set({ mapPickTarget: target });
  },

  async handleMapClick(coords) {
    const target = get().mapPickTarget;
    if (!target) {
      if (get().isEditingWaypoints && get().candidates.length > 0) {
        await get().addViaPoint(coords);
      }
      return;
    }

    if (target === 'hazard') {
      set({ mapPickTarget: null, pendingHazardCoords: coords, hazardPickerOpen: true });
      return;
    }

    if (target === 'via') {
      set({ mapPickTarget: null });
      await get().addViaPoint(coords);
      return;
    }

    const place = await reverseGeocode(coords);
    set({ mapPickTarget: null });
    if (target === 'origin') {
      set({ origin: place });
      if (get().destination) await get().recalculateRoute();
    } else if (target === 'dest') {
      await get().setDestination(place, true);
    } else if (target === 'save_place' || target === 'save_home' || target === 'save_work') {
      const cat: SavedPlaceCategory =
        target === 'save_home' ? 'home' : target === 'save_work' ? 'work' : 'favorite';
      set({ pendingSavePlace: { place, defaultCategory: cat } });
    }
  },

  async openMapContextPin(coords) {
    const cleanCoords: LngLat = [+coords[0].toFixed(6), +coords[1].toFixed(6)];
    set({ mapContextPin: { coords: cleanCoords, place: null, loading: true } });
    const place = await reverseGeocode(cleanCoords);
    // Only update if user hasn't dismissed or opened another pin in the meantime
    const current = get().mapContextPin;
    if (
      current &&
      current.coords[0] === cleanCoords[0] &&
      current.coords[1] === cleanCoords[1]
    ) {
      set({ mapContextPin: { coords: cleanCoords, place, loading: false } });
    }
  },

  closeMapContextPin() {
    set({ mapContextPin: null, mapContextScreenPos: null });
  },

  async recalculateRoute(customWaypoints) {
    const { origin, destination, viaPoints } = get();
    const waypoints: LngLat[] =
      customWaypoints ??
      (origin && destination ? [origin.coords, ...viaPoints, destination.coords] : []);
    if (waypoints.length < 2) return;

    set({ isRouting: true, mode: 'preview', replayingRideId: null });
    void get().refreshWeather(waypoints[0]);
    const candidates = await planMultiProfileRoutes(waypoints, origin?.name, destination?.name);
    set((s) => ({
      isRouting: false,
      candidates,
      selectedCandidateIdx: 0,
      fitBoundsNonce: s.fitBoundsNonce + 1,
      nav: { ...s.nav, reversed: false },
    }));
  },

  selectCandidate(idx) {
    set({ selectedCandidateIdx: idx, hoverCoordIndex: null });
  },

  toggleEditWaypoints() {
    set((s) => ({ isEditingWaypoints: !s.isEditingWaypoints, mapPickTarget: null }));
  },

  async updateWaypoint(index, coords) {
    const cand = get().candidates[get().selectedCandidateIdx];
    if (!cand) return;
    const nextWaypoints = [...cand.waypoints];
    nextWaypoints[index] = coords;
    const newVia = nextWaypoints.slice(1, -1);

    if (index === 0) {
      const rev = await reverseGeocode(coords);
      set({ origin: rev, viaPoints: newVia });
    } else if (index === nextWaypoints.length - 1) {
      const rev = await reverseGeocode(coords);
      set({ destination: rev, viaPoints: newVia });
    } else {
      set({ viaPoints: newVia });
    }
    await get().recalculateRoute(nextWaypoints);
  },

  async addViaPoint(coords) {
    const cand = get().candidates[get().selectedCandidateIdx];
    if (!cand || cand.waypoints.length < 2) return;
    const nextVia = [...cand.waypoints.slice(1, -1), coords];
    const nextWaypoints: LngLat[] = [cand.waypoints[0], ...nextVia, cand.waypoints[cand.waypoints.length - 1]];
    set({ viaPoints: nextVia });
    await get().recalculateRoute(nextWaypoints);
    get().pushToast('Ponto intermediário adicionado', 'Arraste os pinos no mapa para ajustar o traçado.', 'emerald');
  },

  async removeViaPoint(viaIdx) {
    const cand = get().candidates[get().selectedCandidateIdx];
    if (!cand) return;
    const nextVia = cand.waypoints.slice(1, -1).filter((_, i) => i !== viaIdx);
    const nextWaypoints: LngLat[] = [cand.waypoints[0], ...nextVia, cand.waypoints[cand.waypoints.length - 1]];
    set({ viaPoints: nextVia });
    await get().recalculateRoute(nextWaypoints);
  },

  clearActiveRoute() {
    set({
      mode: 'explore',
      origin: null,
      destination: null,
      viaPoints: [],
      candidates: [],
      selectedCandidateIdx: 0,
      isEditingWaypoints: false,
      mapPickTarget: null,
      hoverCoordIndex: null,
    });
  },

  loadSavedRoute(route) {
    const cand = savedRouteToCandidate(route);
    const first = cand.waypoints[0];
    const last = cand.waypoints[cand.waypoints.length - 1];
    void get().refreshWeather(first);
    set((s) => ({
      mode: 'preview',
      isEditingWaypoints: false,
      replayingRideId: null,
      origin: {
        id: `orig-${route.id}`,
        name: route.originName || 'Ponto de Partida',
        subtitle: route.city,
        coords: first,
        source: 'curated',
      },
      destination: {
        id: `dest-${route.id}`,
        name: route.destName || route.name,
        subtitle: route.city,
        coords: last,
        source: 'curated',
      },
      viaPoints: cand.waypoints.slice(1, -1),
      candidates: [cand],
      selectedCandidateIdx: 0,
      fitBoundsNonce: s.fitBoundsNonce + 1,
      nav: { ...s.nav, reversed: false },
    }));
  },

  async saveCurrentRoute(customName) {
    const cand = get().candidates[get().selectedCandidateIdx];
    if (!cand) return;
    const now = new Date().toISOString();
    const defaultName =
      customName?.trim() ||
      (cand.originName && cand.destName
        ? `${cand.originName.split('/')[0].trim()} → ${cand.destName.split('/')[0].trim()}`
        : cand.title);
    const route: SavedRoute = {
      id: `saved-${Date.now()}`,
      name: defaultName,
      description: cand.subtitle,
      tag: `Salva • ${cand.surfaces.safetyScore}% segura`,
      createdAt: now,
      updatedAt: now,
      isFavorite: true,
      difficulty:
        cand.elevation.ascentM > 220 || cand.distanceKm > 25
          ? 'Desafiador'
          : cand.distanceKm > 10
            ? 'Moderado'
            : 'Fácil',
      city: 'Brasil',
      profile: cand.profile,
      coords: cand.coords,
      waypoints: cand.waypoints,
      distanceKm: cand.distanceKm,
      ascentM: cand.elevation.ascentM,
      descentM: cand.elevation.descentM,
      safetyScore: cand.surfaces.safetyScore,
      originName: cand.originName,
      destName: cand.destName,
    };
    await repository.saveRoute(route);
    set((s) => ({ savedRoutes: [route, ...s.savedRoutes] }));
    get().pushToast('Rota salva no dispositivo', route.name, 'emerald');
  },

  async renameSavedRoute(id, newName) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const route = get().savedRoutes.find((r) => r.id === id);
    if (!route) return;
    const updated: SavedRoute = { ...route, name: trimmed, updatedAt: new Date().toISOString() };
    await repository.saveRoute(updated);
    set((s) => ({
      savedRoutes: s.savedRoutes.map((r) => (r.id === id ? updated : r)),
    }));
    get().pushToast('Rota renomeada', trimmed, 'emerald');
  },

  async deleteSavedRoute(id) {
    await repository.deleteRoute(id);
    set((s) => ({ savedRoutes: s.savedRoutes.filter((r) => r.id !== id) }));
    get().pushToast('Rota removida', undefined, 'slate');
  },

  async toggleFavoriteRoute(id) {
    const route = get().savedRoutes.find((r) => r.id === id);
    if (!route) return;
    const updated: SavedRoute = { ...route, isFavorite: !route.isFavorite, updatedAt: new Date().toISOString() };
    await repository.saveRoute(updated);
    set((s) => ({
      savedRoutes: s.savedRoutes.map((r) => (r.id === id ? updated : r)),
    }));
  },

  async importSavedRoute(route) {
    await repository.saveRoute(route);
    set((s) => ({ savedRoutes: [route, ...s.savedRoutes] }));
    get().loadSavedRoute(route);
    get().pushToast('Rota importada com sucesso!', `${route.name} (${route.distanceKm} km)`, 'emerald');
  },

  openSavePlacePrompt(place, defaultCategory = 'favorite') {
    set({ pendingSavePlace: { place, defaultCategory } });
  },

  closeSavePlacePrompt() {
    set({ pendingSavePlace: null });
  },

  async saveFavoritePlace(place, label, category) {
    const cleanLabel =
      label.trim() ||
      (category === 'home' ? 'Casa' : category === 'work' ? 'Trabalho' : place.name);
    const now = new Date().toISOString();
    const existing = get().savedPlaces;

    // If saving as Home or Work, replace any previous default Home/Work slot cleanly
    let nextPlaces = [...existing];
    if (category === 'home' || category === 'work') {
      const prevSlot = existing.find((p) => p.category === category);
      if (prevSlot) {
        await repository.deletePlace(prevSlot.id);
        nextPlaces = nextPlaces.filter((p) => p.id !== prevSlot.id);
      }
    }

    const newPlace: SavedPlace = {
      id: `place-${category}-${Date.now()}`,
      label: cleanLabel,
      address: place.subtitle || place.name,
      coords: place.coords,
      category,
      createdAt: now,
      updatedAt: now,
    };

    await repository.savePlace(newPlace);
    nextPlaces = [newPlace, ...nextPlaces];

    const slotPlace: PlaceResult = {
      id: newPlace.id,
      name: newPlace.label,
      subtitle: newPlace.address,
      coords: newPlace.coords,
      source: 'curated',
    };

    set((s) => ({
      savedPlaces: nextPlaces,
      pendingSavePlace: null,
      homePlace: category === 'home' ? slotPlace : s.homePlace,
      workPlace: category === 'work' ? slotPlace : s.workPlace,
    }));
    persistPrefs(get());

    const toastTitle =
      category === 'home'
        ? 'Endereço de Casa salvo!'
        : category === 'work'
          ? 'Endereço de Trabalho salvo!'
          : 'Local salvo em Meus Locais!';
    get().pushToast(toastTitle, cleanLabel, 'emerald');
  },

  async renameSavedPlace(id, newLabel) {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const target = get().savedPlaces.find((p) => p.id === id);
    if (!target) return;
    const updated: SavedPlace = { ...target, label: trimmed, updatedAt: new Date().toISOString() };
    await repository.savePlace(updated);

    const slotPlace: PlaceResult = {
      id: updated.id,
      name: updated.label,
      subtitle: updated.address,
      coords: updated.coords,
      source: 'curated',
    };

    set((s) => ({
      savedPlaces: s.savedPlaces.map((p) => (p.id === id ? updated : p)),
      homePlace: updated.category === 'home' ? slotPlace : s.homePlace,
      workPlace: updated.category === 'work' ? slotPlace : s.workPlace,
    }));
    persistPrefs(get());
    get().pushToast('Local renomeado', trimmed, 'emerald');
  },

  async updateSavedPlaceCategory(id, category) {
    const target = get().savedPlaces.find((p) => p.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    let list = [...get().savedPlaces];

    // Demote any existing Home/Work to favorite so no place is lost
    if (category === 'home' || category === 'work') {
      const prev = list.find((p) => p.category === category && p.id !== id);
      if (prev) {
        const demoted: SavedPlace = { ...prev, category: 'favorite', updatedAt: now };
        await repository.savePlace(demoted);
        list = list.map((p) => (p.id === prev.id ? demoted : p));
      }
    }

    const updated: SavedPlace = { ...target, category, updatedAt: now };
    await repository.savePlace(updated);
    list = list.map((p) => (p.id === id ? updated : p));

    const homeSaved = list.find((p) => p.category === 'home');
    const workSaved = list.find((p) => p.category === 'work');

    set({
      savedPlaces: list,
      homePlace: homeSaved
        ? { id: homeSaved.id, name: homeSaved.label, subtitle: homeSaved.address, coords: homeSaved.coords, source: 'curated' }
        : undefined,
      workPlace: workSaved
        ? { id: workSaved.id, name: workSaved.label, subtitle: workSaved.address, coords: workSaved.coords, source: 'curated' }
        : undefined,
    });
    persistPrefs(get());
    get().pushToast(
      category === 'home' ? 'Definido como Casa' : category === 'work' ? 'Definido como Trabalho' : 'Movido para Favoritos',
      updated.label,
      'emerald'
    );
  },

  async deleteSavedPlace(id) {
    const target = get().savedPlaces.find((p) => p.id === id);
    await repository.deletePlace(id);
    set((s) => ({
      savedPlaces: s.savedPlaces.filter((p) => p.id !== id),
      homePlace: target?.category === 'home' ? undefined : s.homePlace,
      workPlace: target?.category === 'work' ? undefined : s.workPlace,
    }));
    persistPrefs(get());
    get().pushToast('Local removido', target?.label, 'slate');
  },

  setHomeOrWork(slot, place) {
    void get().saveFavoritePlace(place, slot === 'home' ? 'Casa' : 'Trabalho', slot);
  },

  setHoverCoordIndex(idx) {
    set({ hoverCoordIndex: idx });
  },

  requestFitRoute() {
    set((s) => ({ fitBoundsNonce: s.fitBoundsNonce + 1 }));
  },

  flyTo(coords, zoom = 15) {
    set({ flyToTarget: { coords, zoom, nonce: Date.now() } });
  },

  startNavigation(demo = false) {
    void hideNativeAdBanner();
    const state = get();
    const cand = state.candidates[state.selectedCandidateIdx];
    if (!cand) return;
    const vehicle = selectActiveVehicle(state);
    const startPt: LngLat = [cand.coords[0][0], cand.coords[0][1]];
    const rec = createRideRecording({
      mode: demo ? 'demo' : 'guided',
      vehicle,
      vehicleModeIndex: state.selectedModeIndex,
      title: cand.title,
      routeId: cand.id,
      originName: cand.originName,
      destName: cand.destName,
      initialPos: demo ? startPt : state.nav.currentPos,
    });
    set((s) => ({
      mode: 'navigate',
      isEditingWaypoints: false,
      mapPickTarget: null,
      replayingRideId: null,
      activeRide: rec,
      nav: {
        ...s.nav,
        isTracking: !demo,
        isDemoMode: demo,
        isFreeRide: false,
        followUser: true,
        pitch3D: true,
        distanceAlongM: 0,
        offRouteMeters: 0,
        currentPos: demo ? startPt : s.nav.currentPos,
      },
    }));
  },

  stopNavigation() {
    const state = get();
    const rec = state.activeRide;
    let summary: RideSession | null = null;
    if (rec && (rec.distanceKm >= 0.02 || rec.track.length >= 2)) {
      const vehicle = selectActiveVehicle(state);
      summary = finalizeRideRecording(rec, vehicle, state.riderWeightKg, state.weather);
    }
    const wasFreeRide = state.nav.isFreeRide;
    set((s) => ({
      mode: wasFreeRide ? 'explore' : s.candidates.length > 0 ? 'preview' : 'explore',
      activeRide: null,
      pendingRideSummary: summary ?? s.pendingRideSummary,
      nav: {
        ...s.nav,
        isTracking: false,
        isDemoMode: false,
        isFreeRide: false,
        isRerouting: false,
        offRouteMeters: 0,
      },
    }));
  },

  updateNavTelemetry(patch) {
    set((s) => ({ nav: { ...s.nav, ...patch } }));
  },

  reverseActiveRoute() {
    const { candidates, selectedCandidateIdx } = get();
    const cand = candidates[selectedCandidateIdx];
    if (!cand) return;
    const revCoords = [...cand.coords].reverse();
    const revWaypoints = [...cand.waypoints].reverse();
    const updated: RouteCandidate = {
      ...cand,
      coords: revCoords,
      waypoints: revWaypoints,
      elevation: computeElevationStats(revCoords),
      crossings: detectArterialCrossings(revCoords),
      maneuvers: extractRouteManeuvers(revCoords),
      originName: cand.destName,
      destName: cand.originName,
    };
    const nextCandidates = [...candidates];
    nextCandidates[selectedCandidateIdx] = updated;
    set((s) => ({
      candidates: nextCandidates,
      nav: { ...s.nav, reversed: !s.nav.reversed, distanceAlongM: 0 },
    }));
    get().pushToast('Sentido invertido', 'Agora navegando no trajeto de volta.', 'slate');
  },

  async triggerOffRouteReroute(fromPos) {
    const { nav, candidates, selectedCandidateIdx } = get();
    const active = candidates[selectedCandidateIdx];
    if (!active || nav.isRerouting) return;
    const destCoord = active.waypoints[active.waypoints.length - 1];
    set((s) => ({ nav: { ...s.nav, isRerouting: true } }));
    get().pushToast('Recalculando rota segura...', 'Buscando melhor ciclovia a partir da sua posição.', 'amber');

    const fresh = await planMultiProfileRoutes([fromPos, destCoord], 'Posição Atual', active.destName);
    const chosen = fresh.find((r) => r.profile === active.profile) ?? fresh[0];
    if (chosen) {
      const nextList = [...candidates];
      nextList[selectedCandidateIdx] = chosen;
      set((s) => ({
        candidates: nextList,
        nav: { ...s.nav, isRerouting: false, offRouteMeters: 0, distanceAlongM: 0 },
      }));
      get().pushToast('Rota recalculada!', `${chosen.distanceKm} km • ${chosen.surfaces.safetyScore}% segura`, 'emerald');
    } else {
      set((s) => ({ nav: { ...s.nav, isRerouting: false } }));
    }
  },

  openHazardReporter(coords) {
    const pos = coords ?? get().nav.currentPos ?? BRAND.defaultCenter;
    set({ pendingHazardCoords: pos, hazardPickerOpen: true });
  },

  async submitHazard(kind, title, note) {
    const coords = get().pendingHazardCoords ?? get().nav.currentPos ?? BRAND.defaultCenter;
    const now = new Date().toISOString();
    const authUser = get().authUser;
    const report: HazardReport = {
      id: `hazard-${Date.now()}`,
      kind,
      title,
      note: note?.trim() || undefined,
      coords,
      createdAt: now,
      updatedAt: now,
      confirmations: 1,
      userId: authUser?.id,
      isCommunity: Boolean(authUser),
    };
    await repository.saveHazard(report);
    set((s) => ({
      hazards: [report, ...s.hazards],
      hazardPickerOpen: false,
      pendingHazardCoords: null,
      showHazards: true,
    }));
    const suffix = authUser
      ? 'sincronizado com a comunidade EixoVerde'
      : 'salvo localmente neste dispositivo';
    get().pushToast('Alerta registrado no mapa!', `${title} (${suffix})`, 'amber');
  },

  async confirmHazard(id) {
    const item = get().hazards.find((h) => h.id === id);
    if (!item || item.confirmedByMe) return;
    const updated: HazardReport = {
      ...item,
      confirmations: item.confirmations + 1,
      confirmedByMe: true,
      updatedAt: new Date().toISOString(),
    };
    await repository.confirmHazard(updated);
    set((s) => ({ hazards: s.hazards.map((h) => (h.id === id ? updated : h)) }));
    get().pushToast('Alerta confirmado!', `${item.title} (${updated.confirmations} confirmações)`, 'emerald');
  },

  async deleteHazard(id) {
    await repository.deleteHazard(id);
    set((s) => ({ hazards: s.hazards.filter((h) => h.id !== id) }));
  },

  setGarageOpen: (open) => set({ garageOpen: open }),
  setCompareOpen: (open) => set({ compareOpen: open }),
  setMenuOpen: (open) => set({ menuOpen: open }),
  setHazardPickerOpen: (open) => set({ hazardPickerOpen: open }),

  pushToast(title, body, tone = 'slate') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, title, body, tone }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4200);
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
