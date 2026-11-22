import { getSupabaseClient } from '../cloud/supabaseClient';
import type {
  CommunityRoute,
  Coord3D,
  HazardKind,
  HazardReport,
  LngLat,
  RideMode,
  RideSession,
  RideTrackPoint,
  RouteProfileId,
  RouteRatingAggregate,
  RouteSafetyTag,
  SavedPlace,
  SavedPlaceCategory,
  SavedRoute,
  UserPreferences,
  VehicleCategory,
  VehicleSpec,
} from '../types';

export interface CloudPullResult<T> {
  active: T[];
  deletedIds: Array<{ id: string; deletedAt: string }>;
}

export class CloudSyncError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'CloudSyncError';
    this.status = status;
    this.code = code;
  }
}

export function isMissingTableError(err: { message?: string; code?: string; status?: number } | null): boolean {
  if (!err) return false;
  const code = (err.code || '').toUpperCase();
  const msg = (err.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    err.status === 404 ||
    ((msg.includes('ride_sessions') || msg.includes('community_routes') || msg.includes('route_ratings')) &&
      (msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('not found')))
  );
}

function throwFromSupabaseError(err: { message?: string; code?: string; status?: number } | null): never {
  const msg = err?.message || 'Erro de comunicação com o Supabase';
  const code = err?.code;
  const status =
    err?.status ??
    (code === '42501' || code === 'PGRST301' || msg.toLowerCase().includes('jwt') ? 401 : undefined);
  throw new CloudSyncError(msg, status, code);
}

interface SavedRouteRow {
  user_id: string;
  id: string;
  name: string;
  description: string | null;
  tag: string;
  is_favorite: boolean;
  difficulty: 'Fácil' | 'Moderado' | 'Desafiador';
  city: string;
  profile: RouteProfileId;
  coords: Coord3D[];
  waypoints: LngLat[];
  distance_km: number;
  ascent_m: number;
  descent_m: number;
  safety_score: number;
  origin_name: string | null;
  dest_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface SavedPlaceRow {
  user_id: string;
  id: string;
  label: string;
  address: string;
  lng: number;
  lat: number;
  category: SavedPlaceCategory;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface CustomVehicleRow {
  user_id: string;
  id: string;
  name: string;
  category: VehicleCategory;
  is_electric: boolean;
  spec: VehicleSpec;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface HazardReportRow {
  id: string;
  user_id: string | null;
  kind: HazardKind;
  title: string;
  note: string | null;
  lng: number;
  lat: number;
  confirmations: number;
  confirmed_by_me?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

function rowToSavedRoute(r: SavedRouteRow): SavedRoute {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    tag: r.tag || 'Salva',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    isFavorite: Boolean(r.is_favorite),
    isCurated: r.id.startsWith('curated-'),
    difficulty: r.difficulty || 'Fácil',
    city: r.city || 'Brasil',
    profile: r.profile || 'safe',
    coords: Array.isArray(r.coords) ? r.coords : [],
    waypoints: Array.isArray(r.waypoints) ? r.waypoints : [],
    distanceKm: Number(r.distance_km) || 0,
    ascentM: Number(r.ascent_m) || 0,
    descentM: Number(r.descent_m) || 0,
    safetyScore: Number(r.safety_score) || 50,
    originName: r.origin_name ?? undefined,
    destName: r.dest_name ?? undefined,
  };
}

function rowToSavedPlace(r: SavedPlaceRow): SavedPlace {
  return {
    id: r.id,
    label: r.label,
    address: r.address || '',
    coords: [Number(r.lng), Number(r.lat)],
    category: r.category || 'favorite',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToCustomVehicle(r: CustomVehicleRow): VehicleSpec {
  const spec = (r.spec && typeof r.spec === 'object' ? r.spec : {}) as VehicleSpec;
  return {
    ...spec,
    id: r.id,
    name: r.name || spec.name || 'Veículo Personalizado',
    category: r.category || spec.category || 'patinete',
    isElectric: typeof r.is_electric === 'boolean' ? r.is_electric : Boolean(spec.isElectric),
    isCustom: true,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToHazardReport(r: HazardReportRow): HazardReport {
  return {
    id: r.id,
    kind: r.kind,
    title: r.title,
    note: r.note ?? undefined,
    coords: [Number(r.lng), Number(r.lat)],
    createdAt: r.created_at,
    updatedAt: r.updated_at || r.created_at,
    confirmations: Math.max(1, Number(r.confirmations) || 1),
    userId: r.user_id ?? undefined,
    isCommunity: true,
    confirmedByMe: Boolean(r.confirmed_by_me),
  };
}

export const supabaseAdapter = {
  async pullSavedRoutes(userId: string): Promise<CloudPullResult<SavedRoute>> {
    const client = getSupabaseClient();
    if (!client) return { active: [], deletedIds: [] };

    const { data, error } = await client
      .from('saved_routes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throwFromSupabaseError(error);
    const rows = (data ?? []) as SavedRouteRow[];
    const active: SavedRoute[] = [];
    const deletedIds: Array<{ id: string; deletedAt: string }> = [];

    for (const row of rows) {
      if (row.deleted_at) {
        deletedIds.push({ id: row.id, deletedAt: row.deleted_at });
      } else {
        active.push(rowToSavedRoute(row));
      }
    }
    return { active, deletedIds };
  },

  async upsertSavedRoute(userId: string, route: SavedRoute): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const payload = {
      user_id: userId,
      id: route.id,
      name: route.name,
      description: route.description ?? null,
      tag: route.tag || 'Salva',
      is_favorite: Boolean(route.isFavorite),
      difficulty: route.difficulty || 'Fácil',
      city: route.city || 'Brasil',
      profile: route.profile || 'safe',
      coords: route.coords,
      waypoints: route.waypoints,
      distance_km: route.distanceKm,
      ascent_m: Math.max(0, Math.round(route.ascentM || 0)),
      descent_m: Math.max(0, Math.round(route.descentM || 0)),
      safety_score: Math.min(100, Math.max(0, Math.round(route.safetyScore || 50))),
      origin_name: route.originName ?? null,
      dest_name: route.destName ?? null,
      created_at: route.createdAt || new Date().toISOString(),
      updated_at: route.updatedAt || new Date().toISOString(),
      deleted_at: null,
    };

    const { error } = await client
      .from('saved_routes')
      .upsert(payload, { onConflict: 'user_id,id' });

    if (error) throwFromSupabaseError(error);
  },

  async softDeleteSavedRoute(userId: string, id: string, deletedAt: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from('saved_routes')
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throwFromSupabaseError(error);
  },

  async pullSavedPlaces(userId: string): Promise<CloudPullResult<SavedPlace>> {
    const client = getSupabaseClient();
    if (!client) return { active: [], deletedIds: [] };

    const { data, error } = await client
      .from('saved_places')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throwFromSupabaseError(error);
    const rows = (data ?? []) as SavedPlaceRow[];
    const active: SavedPlace[] = [];
    const deletedIds: Array<{ id: string; deletedAt: string }> = [];

    for (const row of rows) {
      if (row.deleted_at) {
        deletedIds.push({ id: row.id, deletedAt: row.deleted_at });
      } else {
        active.push(rowToSavedPlace(row));
      }
    }
    return { active, deletedIds };
  },

  async upsertSavedPlace(userId: string, place: SavedPlace): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const payload = {
      user_id: userId,
      id: place.id,
      label: place.label,
      address: place.address || '',
      lng: place.coords[0],
      lat: place.coords[1],
      category: place.category || 'favorite',
      created_at: place.createdAt || new Date().toISOString(),
      updated_at: place.updatedAt || new Date().toISOString(),
      deleted_at: null,
    };

    const { error } = await client
      .from('saved_places')
      .upsert(payload, { onConflict: 'user_id,id' });

    if (error) throwFromSupabaseError(error);
  },

  async softDeleteSavedPlace(userId: string, id: string, deletedAt: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from('saved_places')
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throwFromSupabaseError(error);
  },

  async pullCustomVehicles(userId: string): Promise<CloudPullResult<VehicleSpec>> {
    const client = getSupabaseClient();
    if (!client) return { active: [], deletedIds: [] };

    const { data, error } = await client
      .from('custom_vehicles')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throwFromSupabaseError(error);
    const rows = (data ?? []) as CustomVehicleRow[];
    const active: VehicleSpec[] = [];
    const deletedIds: Array<{ id: string; deletedAt: string }> = [];

    for (const row of rows) {
      if (row.deleted_at) {
        deletedIds.push({ id: row.id, deletedAt: row.deleted_at });
      } else {
        active.push(rowToCustomVehicle(row));
      }
    }
    return { active, deletedIds };
  },

  async upsertCustomVehicle(userId: string, vehicle: VehicleSpec): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const now = new Date().toISOString();
    const payload = {
      user_id: userId,
      id: vehicle.id,
      name: vehicle.name,
      category: vehicle.category,
      is_electric: Boolean(vehicle.isElectric),
      spec: vehicle,
      created_at: vehicle.createdAt || now,
      updated_at: vehicle.updatedAt || now,
      deleted_at: null,
    };

    const { error } = await client
      .from('custom_vehicles')
      .upsert(payload, { onConflict: 'user_id,id' });

    if (error) throwFromSupabaseError(error);
  },

  async softDeleteCustomVehicle(userId: string, id: string, deletedAt: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from('custom_vehicles')
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throwFromSupabaseError(error);
  },

  async pullHazards(
    bounds: [number, number, number, number] = [-74.0, -34.0, -34.0, 5.5]
  ): Promise<CloudPullResult<HazardReport>> {
    const client = getSupabaseClient();
    if (!client) return { active: [], deletedIds: [] };

    // Use the PostGIS GIST spatial RPC first; fall back to direct table select if RPC is mocked/unavailable
    const rpcRes = await client.rpc('get_hazards_in_bounds', {
      min_lng: bounds[0],
      min_lat: bounds[1],
      max_lng: bounds[2],
      max_lat: bounds[3],
      max_results: 250,
    });

    if (!rpcRes.error && Array.isArray(rpcRes.data)) {
      const active = (rpcRes.data as HazardReportRow[]).map(rowToHazardReport);
      return { active, deletedIds: [] };
    }

    const { data, error } = await client
      .from('hazard_reports')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(250);

    if (error) throwFromSupabaseError(error);
    const rows = (data ?? []) as HazardReportRow[];
    const active: HazardReport[] = [];
    const deletedIds: Array<{ id: string; deletedAt: string }> = [];

    for (const row of rows) {
      if (row.deleted_at) {
        deletedIds.push({ id: row.id, deletedAt: row.deleted_at });
      } else {
        active.push(rowToHazardReport(row));
      }
    }
    return { active, deletedIds };
  },

  async upsertHazard(userId: string, hazard: HazardReport): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const now = new Date().toISOString();
    const payload = {
      id: hazard.id,
      user_id: hazard.userId || userId,
      kind: hazard.kind,
      title: hazard.title,
      note: hazard.note ?? null,
      lng: hazard.coords[0],
      lat: hazard.coords[1],
      confirmations: Math.max(1, hazard.confirmations || 1),
      created_at: hazard.createdAt || now,
      updated_at: hazard.updatedAt || hazard.createdAt || now,
      deleted_at: null,
    };

    const { error } = await client
      .from('hazard_reports')
      .upsert(payload, { onConflict: 'id' });

    if (error) throwFromSupabaseError(error);
  },

  async confirmHazardRpc(hazardId: string): Promise<number | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.rpc('confirm_hazard', {
      p_hazard_id: hazardId,
    });
    if (error) throwFromSupabaseError(error);
    return typeof data === 'number' ? data : null;
  },

  async softDeleteHazard(userId: string, id: string, deletedAt: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from('hazard_reports')
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throwFromSupabaseError(error);
  },

  async pullPreferences(userId: string): Promise<{ prefs: Partial<UserPreferences>; updatedAt: string } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throwFromSupabaseError(error);
    if (!data) return null;
    const row = data as { prefs?: Partial<UserPreferences>; updated_at?: string };
    return {
      prefs: row.prefs ?? {},
      updatedAt: row.updated_at || new Date(0).toISOString(),
    };
  },

  async upsertPreferences(userId: string, prefs: UserPreferences): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const updatedAt = prefs.updatedAt || new Date().toISOString();
    const { error } = await client
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          prefs: { ...prefs, updatedAt },
          updated_at: updatedAt,
        },
        { onConflict: 'user_id' }
      );

    if (error) throwFromSupabaseError(error);
  },

  async pullRideSessions(userId: string): Promise<CloudPullResult<RideSession>> {
    const client = getSupabaseClient();
    if (!client) return { active: [], deletedIds: [] };

    const { data, error } = await client
      .from('ride_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(200);

    if (error) {
      // Graceful IndexedDB-only fallback when Phase 3 SQL migration hasn't been executed yet
      if (isMissingTableError(error)) {
        return { active: [], deletedIds: [] };
      }
      throwFromSupabaseError(error);
    }

    const rows = (data ?? []) as RideSessionRow[];
    const active: RideSession[] = [];
    const deletedIds: Array<{ id: string; deletedAt: string }> = [];

    for (const row of rows) {
      if (row.deleted_at) {
        deletedIds.push({ id: row.id, deletedAt: row.deleted_at });
      } else {
        active.push(rowToRideSession(row));
      }
    }
    return { active, deletedIds };
  },

  async upsertRideSession(userId: string, ride: RideSession): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const now = new Date().toISOString();
    const payload = {
      user_id: userId,
      id: ride.id,
      title: ride.title,
      mode: ride.mode || 'guided',
      is_demo: Boolean(ride.isDemo),
      started_at: ride.startedAt || now,
      ended_at: ride.endedAt || now,
      moving_duration_sec: Math.max(0, Math.round(ride.movingDurationSec || 0)),
      total_duration_sec: Math.max(0, Math.round(ride.totalDurationSec || 0)),
      distance_km: Math.max(0, Number(ride.distanceKm) || 0),
      avg_speed_kmh: Math.max(0, Number(ride.avgSpeedKmh) || 0),
      max_speed_kmh: Math.max(0, Number(ride.maxSpeedKmh) || 0),
      ascent_m: Math.max(0, Math.round(ride.ascentM || 0)),
      descent_m: Math.max(0, Math.round(ride.descentM || 0)),
      calories_kcal: Math.max(0, Math.round(ride.caloriesKcal || 0)),
      co2_saved_kg: Math.max(0, Number(ride.co2SavedKg) || 0),
      vehicle_id: ride.vehicleId,
      vehicle_name: ride.vehicleName,
      vehicle_mode_index: Math.max(0, Math.round(ride.vehicleModeIndex || 0)),
      is_electric: Boolean(ride.isElectric),
      battery_start_pct: typeof ride.batteryStartPct === 'number' ? Math.round(ride.batteryStartPct) : null,
      battery_end_pct: typeof ride.batteryEndPct === 'number' ? Math.round(ride.batteryEndPct) : null,
      battery_used_pct: typeof ride.batteryUsedPct === 'number' ? Math.round(ride.batteryUsedPct) : null,
      estimated_battery_used_pct:
        typeof ride.estimatedBatteryUsedPct === 'number' ? Math.round(ride.estimatedBatteryUsedPct) : null,
      weather_summary: ride.weatherSummary ?? null,
      route_id: ride.routeId ?? null,
      origin_name: ride.originName ?? null,
      dest_name: ride.destName ?? null,
      track: Array.isArray(ride.track) ? ride.track : [],
      created_at: ride.createdAt || now,
      updated_at: ride.updatedAt || now,
      deleted_at: null,
    };

    const { error } = await client
      .from('ride_sessions')
      .upsert(payload, { onConflict: 'user_id,id' });

    if (error) {
      if (isMissingTableError(error)) return;
      throwFromSupabaseError(error);
    }
  },

  async softDeleteRideSession(userId: string, id: string, deletedAt: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from('ride_sessions')
      .update({ deleted_at: deletedAt, updated_at: deletedAt })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) {
      if (isMissingTableError(error)) return;
      throwFromSupabaseError(error);
    }
  },

  async pullCommunityRoutes(): Promise<CommunityRoute[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from('community_routes')
      .select('*')
      .is('deleted_at', null)
      .order('avg_rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      if (isMissingTableError(error)) return [];
      throwFromSupabaseError(error);
    }

    return ((data ?? []) as CommunityRouteRow[]).map(rowToCommunityRoute);
  },

  async publishCommunityRoute(
    userId: string,
    route: SavedRoute,
    authorName: string
  ): Promise<CommunityRoute | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const now = new Date().toISOString();
    const id = route.id.startsWith('comm-') ? route.id : `comm-${route.id}`;
    const communityTag =
      route.city && !route.city.includes('DF') && !route.city.includes('Brasília')
        ? `Comunidade ${route.city.split(',')[0].trim()}`
        : 'Comunidade DF';
    const payload = {
      id,
      author_id: userId,
      author_name: authorName || 'Ciclista EixoVerde',
      name: route.name,
      description: route.description ?? null,
      tag: communityTag,
      difficulty: route.difficulty || 'Fácil',
      city: route.city || 'Brasília, DF',
      profile: route.profile || 'safe',
      coords: route.coords,
      waypoints: route.waypoints,
      distance_km: Math.max(0, Number(route.distanceKm) || 0),
      ascent_m: Math.max(0, Math.round(route.ascentM || 0)),
      descent_m: Math.max(0, Math.round(route.descentM || 0)),
      safety_score: Math.min(100, Math.max(0, Math.round(route.safetyScore || 75))),
      origin_name: route.originName ?? null,
      dest_name: route.destName ?? null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const { data, error } = await client
      .from('community_routes')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) return null;
      throwFromSupabaseError(error);
    }
    if (!data) {
      return {
        ...route,
        id,
        tag: communityTag,
        authorId: userId,
        authorName: authorName || 'Ciclista EixoVerde',
        avgRating: 0,
        ratingCount: 0,
        safetyTags: [],
        isCommunity: true,
        updatedAt: now,
      };
    }
    return rowToCommunityRoute(data as CommunityRouteRow);
  },

  async deleteCommunityRoute(userId: string, id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const now = new Date().toISOString();
    const { error } = await client
      .from('community_routes')
      .update({ deleted_at: now, updated_at: now })
      .eq('id', id)
      .eq('author_id', userId);

    if (error) {
      if (isMissingTableError(error)) return;
      throwFromSupabaseError(error);
    }
  },

  async pullRouteRatings(currentUserId?: string | null): Promise<Record<string, RouteRatingAggregate>> {
    const client = getSupabaseClient();
    if (!client) return {};

    const { data, error } = await client
      .from('route_ratings')
      .select('route_id, user_id, rating, tags')
      .limit(1000);

    if (error) {
      if (isMissingTableError(error)) return {};
      throwFromSupabaseError(error);
    }

    const rows = (data ?? []) as RouteRatingRow[];
    const byRoute = new Map<
      string,
      {
        sum: number;
        count: number;
        tagCounts: Map<RouteSafetyTag, number>;
        userRating?: number;
        userTags?: RouteSafetyTag[];
      }
    >();

    for (const row of rows) {
      const entry = byRoute.get(row.route_id) ?? {
        sum: 0,
        count: 0,
        tagCounts: new Map<RouteSafetyTag, number>(),
      };
      const ratingVal = Math.max(1, Math.min(5, Number(row.rating) || 5));
      entry.sum += ratingVal;
      entry.count += 1;
      const tags = Array.isArray(row.tags) ? (row.tags as RouteSafetyTag[]) : [];
      for (const tag of tags) {
        entry.tagCounts.set(tag, (entry.tagCounts.get(tag) ?? 0) + 1);
      }
      if (currentUserId && row.user_id === currentUserId) {
        entry.userRating = ratingVal;
        entry.userTags = tags;
      }
      byRoute.set(row.route_id, entry);
    }

    const result: Record<string, RouteRatingAggregate> = {};
    for (const [routeId, agg] of byRoute.entries()) {
      const topTags = Array.from(agg.tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t]) => t);
      result[routeId] = {
        routeId,
        avgRating: agg.count > 0 ? +(agg.sum / agg.count).toFixed(1) : 0,
        ratingCount: agg.count,
        topTags,
        userRating: agg.userRating,
        userTags: agg.userTags,
      };
    }
    return result;
  },

  async upsertRouteRating(
    userId: string,
    routeId: string,
    rating: number,
    tags: RouteSafetyTag[]
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const cleanRating = Math.max(1, Math.min(5, Math.round(rating)));
    const { error } = await client
      .from('route_ratings')
      .upsert(
        {
          route_id: routeId,
          user_id: userId,
          rating: cleanRating,
          tags,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'route_id,user_id' }
      );

    if (error) {
      if (isMissingTableError(error)) return false;
      throwFromSupabaseError(error);
    }
    return true;
  },
};

interface CommunityRouteRow {
  id: string;
  author_id: string;
  author_name: string;
  name: string;
  description: string | null;
  tag: string;
  difficulty: 'Fácil' | 'Moderado' | 'Desafiador';
  city: string;
  profile: RouteProfileId;
  coords: Coord3D[];
  waypoints: LngLat[];
  distance_km: number;
  ascent_m: number;
  descent_m: number;
  safety_score: number;
  origin_name: string | null;
  dest_name: string | null;
  avg_rating: number;
  rating_count: number;
  safety_tags: RouteSafetyTag[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface RouteRatingRow {
  route_id: string;
  user_id: string;
  rating: number;
  tags: string[] | null;
}

function rowToCommunityRoute(r: CommunityRouteRow): CommunityRoute {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    tag: r.tag || 'Comunidade DF',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    isFavorite: false,
    difficulty: r.difficulty || 'Fácil',
    city: r.city || 'Brasília, DF',
    profile: r.profile || 'safe',
    coords: Array.isArray(r.coords) ? r.coords : [],
    waypoints: Array.isArray(r.waypoints) ? r.waypoints : [],
    distanceKm: Number(r.distance_km) || 0,
    ascentM: Number(r.ascent_m) || 0,
    descentM: Number(r.descent_m) || 0,
    safetyScore: Number(r.safety_score) || 75,
    originName: r.origin_name ?? undefined,
    destName: r.dest_name ?? undefined,
    authorId: r.author_id,
    authorName: r.author_name || 'Ciclista DF',
    avgRating: Number(r.avg_rating) || 0,
    ratingCount: Number(r.rating_count) || 0,
    safetyTags: Array.isArray(r.safety_tags) ? r.safety_tags : [],
    isCommunity: true,
  };
}

interface RideSessionRow {
  user_id: string;
  id: string;
  title: string;
  mode: RideMode;
  is_demo: boolean;
  started_at: string;
  ended_at: string;
  moving_duration_sec: number;
  total_duration_sec: number;
  distance_km: number;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  ascent_m: number;
  descent_m: number;
  calories_kcal: number;
  co2_saved_kg: number;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_mode_index: number;
  is_electric: boolean;
  battery_start_pct: number | null;
  battery_end_pct: number | null;
  battery_used_pct: number | null;
  estimated_battery_used_pct: number | null;
  weather_summary: RideSession['weatherSummary'] | null;
  route_id: string | null;
  origin_name: string | null;
  dest_name: string | null;
  track: RideTrackPoint[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function rowToRideSession(r: RideSessionRow): RideSession {
  return {
    id: r.id,
    title: r.title,
    mode: r.mode || 'guided',
    isDemo: Boolean(r.is_demo),
    startedAt: r.started_at,
    endedAt: r.ended_at,
    movingDurationSec: Number(r.moving_duration_sec) || 0,
    totalDurationSec: Number(r.total_duration_sec) || 0,
    distanceKm: Number(r.distance_km) || 0,
    avgSpeedKmh: Number(r.avg_speed_kmh) || 0,
    maxSpeedKmh: Number(r.max_speed_kmh) || 0,
    ascentM: Number(r.ascent_m) || 0,
    descentM: Number(r.descent_m) || 0,
    caloriesKcal: Number(r.calories_kcal) || 0,
    co2SavedKg: Number(r.co2_saved_kg) || 0,
    vehicleId: r.vehicle_id,
    vehicleName: r.vehicle_name,
    vehicleModeIndex: Number(r.vehicle_mode_index) || 0,
    isElectric: Boolean(r.is_electric),
    batteryStartPct: typeof r.battery_start_pct === 'number' ? r.battery_start_pct : undefined,
    batteryEndPct: typeof r.battery_end_pct === 'number' ? r.battery_end_pct : undefined,
    batteryUsedPct: typeof r.battery_used_pct === 'number' ? r.battery_used_pct : undefined,
    estimatedBatteryUsedPct:
      typeof r.estimated_battery_used_pct === 'number' ? r.estimated_battery_used_pct : undefined,
    weatherSummary: r.weather_summary ?? undefined,
    routeId: r.route_id ?? undefined,
    originName: r.origin_name ?? undefined,
    destName: r.dest_name ?? undefined,
    track: Array.isArray(r.track) ? r.track : [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
