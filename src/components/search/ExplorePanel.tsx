import { useEffect, useState } from 'react';
import {
  Activity,
  Briefcase,
  Check,
  Compass,
  Globe,
  Heart,
  Home,
  LocateFixed,
  MapPin,
  Navigation2,
  Pencil,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { formatDurationPtBR } from '../../engine/geo';
import { searchPlaces } from '../../engine/routing';
import { computeRouteTelemetry } from '../../engine/telemetry';
import { selectActiveVehicle, useAppStore } from '../../store/useAppStore';
import type {
  CommunityRoute,
  PlaceResult,
  RouteSafetyTag,
  SavedPlace,
  SavedPlaceCategory,
  SavedRoute,
} from '../../types';
import { RidesHistoryPanel } from '../rides/RidesHistoryPanel';

const SAFETY_TAG_OPTIONS: Array<{ id: RouteSafetyTag; label: string }> = [
  { id: 'bom_asfalto', label: 'Bom asfalto' },
  { id: 'iluminada', label: 'Iluminada' },
  { id: 'sombra', label: 'Sombra' },
  { id: 'paisagem', label: 'Paisagem' },
  { id: 'cruzamento_tenso', label: 'Cruzamento tenso' },
  { id: 'muito_movimento', label: 'Muito movimento' },
];

export function ExplorePanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Inline rename states
  const [renamingPlaceId, setRenamingPlaceId] = useState<string | null>(null);
  const [renamePlaceVal, setRenamePlaceVal] = useState('');
  const [renamingRouteId, setRenamingRouteId] = useState<string | null>(null);
  const [renameRouteVal, setRenameRouteVal] = useState('');

  // Phase 4: Inline 1-5★ rating & safety tag picker state
  const [ratingRouteId, setRatingRouteId] = useState<string | null>(null);
  const [draftStars, setDraftStars] = useState<number>(5);
  const [draftTags, setDraftTags] = useState<RouteSafetyTag[]>([]);

  // Inline Add Place search inside "Meus Locais"
  const [addingPlaceFor, setAddingPlaceFor] = useState<null | SavedPlaceCategory>(null);
  const [addPlaceQuery, setAddPlaceQuery] = useState('');
  const [addPlaceResults, setAddPlaceResults] = useState<PlaceResult[]>([]);

  const exploreTab = useAppStore((s) => s.exploreTab);
  const setExploreTab = useAppStore((s) => s.setExploreTab);
  const savedRoutes = useAppStore((s) => s.savedRoutes);
  const communityRoutes = useAppStore((s) => s.communityRoutes);
  const routeRatings = useAppStore((s) => s.routeRatings);
  const authUser = useAppStore((s) => s.authUser);
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const rideSessions = useAppStore((s) => s.rideSessions);
  const startFreeRide = useAppStore((s) => s.startFreeRide);
  const loadSavedRoute = useAppStore((s) => s.loadSavedRoute);
  const toggleFavoriteRoute = useAppStore((s) => s.toggleFavoriteRoute);
  const renameSavedRoute = useAppStore((s) => s.renameSavedRoute);
  const deleteSavedRoute = useAppStore((s) => s.deleteSavedRoute);
  const rateRoute = useAppStore((s) => s.rateRoute);
  const publishSavedRouteToCommunity = useAppStore((s) => s.publishSavedRouteToCommunity);
  const deleteCommunityRoute = useAppStore((s) => s.deleteCommunityRoute);
  const setDestination = useAppStore((s) => s.setDestination);
  const setMapPickTarget = useAppStore((s) => s.setMapPickTarget);
  const mapPickTarget = useAppStore((s) => s.mapPickTarget);
  const openSavePlacePrompt = useAppStore((s) => s.openSavePlacePrompt);
  const renameSavedPlace = useAppStore((s) => s.renameSavedPlace);
  const updateSavedPlaceCategory = useAppStore((s) => s.updateSavedPlaceCategory);
  const deleteSavedPlace = useAppStore((s) => s.deleteSavedPlace);
  const locateCurrentPosition = useAppStore((s) => s.locateCurrentPosition);
  const homePlace = useAppStore((s) => s.homePlace);
  const workPlace = useAppStore((s) => s.workPlace);
  const navPos = useAppStore((s) => s.nav.currentPos);
  const activeVehicle = useAppStore(selectActiveVehicle);
  const selectedModeIndex = useAppStore((s) => s.selectedModeIndex);
  const riderWeightKg = useAppStore((s) => s.riderWeightKg);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true);
      const list = await searchPlaces(query, navPos ?? BRAND.defaultCenter);
      setResults(list);
      setSearching(false);
    }, query ? 260 : 0);
    return () => clearTimeout(timer);
  }, [query, navPos]);

  useEffect(() => {
    if (!addingPlaceFor) return;
    const timer = setTimeout(async () => {
      const list = await searchPlaces(addPlaceQuery, navPos ?? BRAND.defaultCenter);
      setAddPlaceResults(list);
    }, addPlaceQuery ? 240 : 0);
    return () => clearTimeout(timer);
  }, [addingPlaceFor, addPlaceQuery, navPos]);

  const handleSelectPlace = (place: PlaceResult) => {
    setQuery('');
    setSearchFocused(false);
    void setDestination(place, true);
  };

  const handleRouteToSavedPlace = (sp: SavedPlace) => {
    void setDestination(
      {
        id: sp.id,
        name: sp.label,
        subtitle: sp.address,
        coords: sp.coords,
        source: 'curated',
      },
      true
    );
  };

  const handleSaveCurrentGpsAsPlace = async (cat: SavedPlaceCategory) => {
    const gps = await locateCurrentPosition({ silent: false, flyToUser: false });
    if (gps) {
      setAddingPlaceFor(null);
      setAddPlaceQuery('');
      openSavePlacePrompt(gps, cat);
    }
  };

  const userSavedRoutes = savedRoutes.filter((r) => !r.isCurated || r.isFavorite);
  const brasiliaRoutes = savedRoutes.filter((r) => r.isCurated);

  const homeSaved = savedPlaces.find((p) => p.category === 'home');
  const workSaved = savedPlaces.find((p) => p.category === 'work');
  const favoritePlaces = savedPlaces.filter((p) => p.category === 'favorite');

  const openRatingEditor = (routeId: string) => {
    if (ratingRouteId === routeId) {
      setRatingRouteId(null);
      return;
    }
    const existing = routeRatings[routeId];
    setRatingRouteId(routeId);
    setDraftStars(existing?.userRating ?? Math.max(1, Math.round(existing?.avgRating || 5)));
    setDraftTags(existing?.userTags ?? []);
  };

  const toggleDraftTag = (tag: RouteSafetyTag) => {
    setDraftTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const renderRouteCard = (
    route: SavedRoute | CommunityRoute,
    opts: { showSavedBadge?: boolean; isCommunityCard?: boolean } = {}
  ) => {
    const { showSavedBadge = false, isCommunityCard = false } = opts;
    const communityMeta = isCommunityCard ? (route as CommunityRoute) : null;
    const telemetry = computeRouteTelemetry(
      {
        distanceKm: route.distanceKm,
        elevation: {
          elevations: [],
          ascentM: route.ascentM,
          descentM: route.descentM,
          minM: 1000,
          maxM: 1100,
          isRealElevation: true,
        },
        crossings: [],
        surfaces: {
          cicloviaPct: route.safetyScore,
          ciclofaixaPct: 0,
          baixaVelPct: 0,
          trilhaPct: 0,
          viaComumPct: Math.max(0, 100 - route.safetyScore),
          safetyScore: route.safetyScore,
        },
      },
      activeVehicle,
      selectedModeIndex,
      riderWeightKg
    );

    const isRenaming = renamingRouteId === route.id;
    const isRatingOpen = ratingRouteId === route.id;
    const agg = routeRatings[route.id];
    const displayAvg = agg?.avgRating || communityMeta?.avgRating || 0;
    const displayCount = agg?.ratingCount || communityMeta?.ratingCount || 0;
    const displayTags = agg?.topTags?.length ? agg.topTags : (communityMeta?.safetyTags ?? []);
    const canRate = Boolean(route.isCurated || isCommunityCard);
    const canPublish = Boolean(!route.isCurated && !isCommunityCard);
    const isCommunityOwner = Boolean(isCommunityCard && authUser && communityMeta?.authorId === authUser.id);

    return (
      <div
        key={`${showSavedBadge ? 'saved-' : isCommunityCard ? 'comm-' : 'bsb-'}${route.id}`}
        onClick={() => {
          if (!isRenaming && !isRatingOpen) loadSavedRoute(route);
        }}
        className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 transition-all hover:border-emerald-500/40 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-800/70 dark:hover:border-emerald-500/40"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  route.difficulty === 'Fácil'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : route.difficulty === 'Moderado'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                }`}
              >
                {route.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                {route.safetyScore}% segura
              </span>
              {communityMeta ? (
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                  • por {communityMeta.authorName}
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400">• {route.city}</span>
              )}
            </div>

            {isRenaming ? (
              <div className="mt-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  value={renameRouteVal}
                  onChange={(e) => setRenameRouteVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void renameSavedRoute(route.id, renameRouteVal);
                      setRenamingRouteId(null);
                    }
                  }}
                  className="w-full rounded-lg border border-emerald-500 bg-white px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    void renameSavedRoute(route.id, renameRouteVal);
                    setRenamingRouteId(null);
                  }}
                  className="rounded-lg bg-emerald-600 p-1.5 text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRenamingRouteId(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                {route.name}
              </h3>
            )}

            {route.description && !isRenaming && (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {route.description}
              </p>
            )}

            {displayTags.length > 0 && !isRenaming && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {displayTags.slice(0, 3).map((tagId) => {
                  const found = SAFETY_TAG_OPTIONS.find((t) => t.id === tagId);
                  return (
                    <span
                      key={tagId}
                      className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700/80 dark:text-slate-300"
                    >
                      {found?.label || tagId}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {canPublish && (
              <button
                type="button"
                data-publish-route={route.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void publishSavedRouteToCommunity(route.id);
                }}
                aria-label="Publicar na Comunidade DF"
                title="Publicar na Comunidade DF"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50"
              >
                <Globe className="h-3.5 w-3.5" />
              </button>
            )}
            {!route.isCurated && !isCommunityCard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingRouteId(route.id);
                  setRenameRouteVal(route.name);
                }}
                aria-label="Renomear rota"
                title="Renomear rota"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-700"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {!isCommunityCard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void toggleFavoriteRoute(route.id);
                }}
                aria-label="Favoritar rota"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-700"
              >
                <Heart className={`h-4 w-4 ${route.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}
            {!route.isCurated && !isCommunityCard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void deleteSavedRoute(route.id);
                }}
                aria-label="Excluir rota"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {isCommunityOwner && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void deleteCommunityRoute(route.id);
                }}
                aria-label="Remover da Comunidade DF"
                title="Remover da Comunidade DF"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="font-mono-num mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs dark:border-slate-700/60">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {formatDurationPtBR(telemetry.oneWayMin)}
            </span>
            <span>{route.distanceKm.toFixed(1).replace('.', ',')} km</span>
            <span className="text-slate-500 dark:text-slate-400">↗ {route.ascentM}m</span>
          </div>

          <div className="flex items-center gap-1.5">
            {canRate && (
              <button
                type="button"
                data-rate-route={route.id}
                onClick={(e) => {
                  e.stopPropagation();
                  openRatingEditor(route.id);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/12 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
              >
                <Star className={`h-3 w-3 ${displayCount > 0 ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
                {displayCount > 0 ? `${displayAvg.toFixed(1)} (${displayCount})` : 'Avaliar'}
              </button>
            )}
            {activeVehicle.isElectric && (
              <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                -{telemetry.batteryUsedPct}%
              </span>
            )}
          </div>
        </div>

        {/* Inline 1-5★ Star Rating & Safety Tags Picker */}
        {isRatingOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 space-y-2 rounded-xl border border-amber-500/30 bg-amber-50/60 p-2.5 dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                Avaliar segurança desta rota
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} estrelas`}
                    data-star-value={star}
                    onClick={() => setDraftStars(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= draftStars ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {SAFETY_TAG_OPTIONS.map((tag) => {
                const selected = draftTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleDraftTag(tag.id)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${
                      selected
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setRatingRouteId(null)}
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200/60 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                data-submit-rating={route.id}
                onClick={async () => {
                  await rateRoute(route.id, draftStars, draftTags);
                  setRatingRouteId(null);
                }}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white hover:bg-emerald-500"
              >
                Salvar {draftStars}★
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800/90">
          <Search className="h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <input
            id="eixoverde-search-input"
            type="text"
            value={query}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Para onde vamos? (DF ou Brasil)"
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown with 1-Tap Save to Favorites */}
        {searchFocused && (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-slate-400">
              <span>{searching ? 'Buscando endereços no Brasil...' : 'Sugestões rápidas'}</span>
              <button
                type="button"
                onClick={() => setSearchFocused(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto ev-scroll">
              {results.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center gap-1 rounded-xl px-1.5 py-1 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 px-1 py-1 text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {place.name}
                      </div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {place.subtitle}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchFocused(false);
                      openSavePlacePrompt(place, 'favorite');
                    }}
                    title="Salvar nos Meus Locais"
                    aria-label="Salvar nos Meus Locais"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-500/15 hover:text-amber-500"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    title="Traçar rota"
                    aria-label="Traçar rota"
                    className="rounded-lg p-2 text-slate-400 hover:text-emerald-600"
                  >
                    <Navigation2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSearchFocused(false);
                  setMapPickTarget('dest');
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-emerald-500/40 py-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                <MapPin className="h-3.5 w-3.5" />
                Destino no mapa
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchFocused(false);
                  setMapPickTarget('save_place');
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-amber-500/45 py-2 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
              >
                <Star className="h-3.5 w-3.5" />
                Favoritar ponto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Home / Work Quick Chips (only when defined) */}
      {(homePlace || workPlace) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {homePlace && (
            <button
              type="button"
              onClick={() => void setDestination(homePlace, true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-500/40 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Home className="h-3.5 w-3.5 text-emerald-600" />
              {homePlace.name}
            </button>
          )}
          {workPlace && (
            <button
              type="button"
              onClick={() => void setDestination(workPlace, true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-500/40 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Briefcase className="h-3.5 w-3.5 text-sky-600" />
              {workPlace.name}
            </button>
          )}
        </div>
      )}

      {/* Primary Quick Actions Grid — fits all 3 buttons cleanly with zero right-edge clipping on 375px iPhone SE */}
      <div id="eixoverde-quick-actions" className="grid grid-cols-3 gap-1.5">
        <button
          id="eixoverde-freeride-chip"
          type="button"
          onClick={startFreeRide}
          className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
        >
          <Play className="h-3 w-3 shrink-0 fill-current" />
          Pedal Livre
        </button>
        <button
          type="button"
          onClick={() => setMapPickTarget(mapPickTarget === 'dest' ? null : 'dest')}
          className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
            mapPickTarget === 'dest'
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <MapPin className="h-3 w-3 shrink-0" />
          {mapPickTarget === 'dest' ? 'No mapa...' : 'Marcar Mapa'}
        </button>
        <button
          type="button"
          onClick={() => setMapPickTarget(mapPickTarget === 'save_place' ? null : 'save_place')}
          className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
            mapPickTarget === 'save_place'
              ? 'border-amber-500 bg-amber-500 text-slate-950'
              : 'border-slate-200 bg-white text-slate-700 hover:border-amber-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Star className="h-3 w-3 shrink-0 text-amber-500" />
          {mapPickTarget === 'save_place' ? 'No local...' : 'Salvar Local'}
        </button>
      </div>

      {/* Primary Segmented Switch: Rotas | Meus Locais | Pedais */}
      <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/90">
        <button
          type="button"
          onClick={() => setExploreTab('routes')}
          className={`flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 py-1.5 text-[11px] font-bold ${
            exploreTab === 'routes'
              ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Compass className="h-3.5 w-3.5 shrink-0" />
          Rotas
        </button>
        <button
          type="button"
          onClick={() => setExploreTab('places')}
          className={`flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 py-1.5 text-[11px] font-bold ${
            exploreTab === 'places'
              ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Star className="h-3.5 w-3.5 shrink-0" />
          Meus Locais ({savedPlaces.length})
        </button>
        <button
          id="eixoverde-tab-rides"
          type="button"
          onClick={() => setExploreTab('rides')}
          className={`flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 py-1.5 text-[11px] font-bold ${
            exploreTab === 'rides'
              ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Activity className="h-3.5 w-3.5 shrink-0" />
          Pedais ({rideSessions.length})
        </button>
      </div>

      {/* TAB 1: ROTAS (Saved Routes, Comunidade DF, Brasília Curated Routes) */}
      {exploreTab === 'rides' ? (
        <RidesHistoryPanel />
      ) : exploreTab === 'routes' ? (
        <div className="space-y-4">
          {/* Minhas Rotas Salvas (Top) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rotas Salvas ({userSavedRoutes.length})
              </h2>
            </div>
            {userSavedRoutes.length > 0 ? (
              <div className="space-y-2">
                {userSavedRoutes.map((r) => renderRouteCard(r, { showSavedBadge: true }))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-center dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Nenhuma rota salva ainda
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Pesquise um destino e toque em Salvar ou favorite uma rota abaixo.
                </p>
              </div>
            )}
          </div>

          {/* Comunidade DF (Shared Routes with 1-5★ ratings) */}
          <div id="eixoverde-community-routes" className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Users className="h-3 w-3 text-emerald-600" />
                Comunidade DF ({communityRoutes.length})
              </h2>
            </div>
            {communityRoutes.length > 0 ? (
              <div className="space-y-2">
                {communityRoutes.map((r) => renderRouteCard(r, { isCommunityCard: true }))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-3.5 py-3 text-center dark:border-slate-700/80">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Salve uma rota e toque no ícone <Globe className="inline h-3 w-3 text-emerald-600" /> para compartilhar com ciclistas do DF.
                </p>
              </div>
            )}
          </div>

          {/* Rotas em Brasília (Bottom) */}
          <div className="space-y-2">
            <h2 className="px-0.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rotas em Brasília
            </h2>
            <div className="space-y-2">{brasiliaRoutes.map((r) => renderRouteCard(r))}</div>
          </div>
        </div>
      ) : (
        /* TAB 2: MEUS LOCAIS (Home, Work & Favorite Places) */
        <div className="space-y-3.5">
          {/* Default Home & Work Cards */}
          <div className="grid grid-cols-2 gap-2">
            {/* Casa */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-3 dark:border-slate-700/70 dark:bg-slate-800/70">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Home className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {homeSaved?.label || 'Casa'}
                  </span>
                </div>
                {homeSaved && (
                  <button
                    type="button"
                    onClick={() => void deleteSavedPlace(homeSaved.id)}
                    title="Remover Casa"
                    className="rounded-lg p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>

              {homeSaved ? (
                <>
                  <p className="mt-1.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {homeSaved.address}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRouteToSavedPlace(homeSaved)}
                      className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500"
                    >
                      Ir para Casa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingPlaceFor('home');
                        setAddPlaceQuery('');
                      }}
                      title="Alterar endereço de Casa"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingPlaceFor('home');
                    setAddPlaceQuery('');
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-emerald-500/40 py-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Definir Casa
                </button>
              )}
            </div>

            {/* Trabalho */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-3 dark:border-slate-700/70 dark:bg-slate-800/70">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    <Briefcase className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {workSaved?.label || 'Trabalho'}
                  </span>
                </div>
                {workSaved && (
                  <button
                    type="button"
                    onClick={() => void deleteSavedPlace(workSaved.id)}
                    title="Remover Trabalho"
                    className="rounded-lg p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>

              {workSaved ? (
                <>
                  <p className="mt-1.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {workSaved.address}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRouteToSavedPlace(workSaved)}
                      className="flex-1 rounded-lg bg-sky-600 py-1.5 text-[11px] font-bold text-white hover:bg-sky-500"
                    >
                      Ir ao Trabalho
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingPlaceFor('work');
                        setAddPlaceQuery('');
                      }}
                      title="Alterar endereço de Trabalho"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingPlaceFor('work');
                    setAddPlaceQuery('');
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-sky-500/40 py-2 text-[11px] font-bold text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Definir Trabalho
                </button>
              )}
            </div>
          </div>

          {/* Inline Add Place Drawer (Search / Map Pick / Current GPS) */}
          {addingPlaceFor && (
            <div className="space-y-2 rounded-2xl border border-emerald-500/35 bg-white p-3 shadow-md dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {addingPlaceFor === 'home'
                    ? 'Definir endereço de Casa'
                    : addingPlaceFor === 'work'
                      ? 'Definir endereço de Trabalho'
                      : 'Adicionar local favorito'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAddingPlaceFor(null);
                    setAddPlaceQuery('');
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                <Search className="h-3.5 w-3.5 text-emerald-600" />
                <input
                  type="text"
                  autoFocus
                  value={addPlaceQuery}
                  onChange={(e) => setAddPlaceQuery(e.target.value)}
                  placeholder="Digite o endereço, quadra ou local..."
                  className="w-full bg-transparent text-xs font-medium text-slate-900 focus:outline-none dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => void handleSaveCurrentGpsAsPlace(addingPlaceFor)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  Usar GPS atual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cat = addingPlaceFor;
                    setAddingPlaceFor(null);
                    setAddPlaceQuery('');
                    setMapPickTarget(
                      cat === 'home' ? 'save_home' : cat === 'work' ? 'save_work' : 'save_place'
                    );
                  }}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-1.5 text-[11px] font-bold text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  Escolher no mapa
                </button>
              </div>

              <div className="max-h-36 space-y-0.5 overflow-y-auto ev-scroll">
                {addPlaceResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      const cat = addingPlaceFor;
                      setAddingPlaceFor(null);
                      setAddPlaceQuery('');
                      openSavePlacePrompt(p, cat);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {p.name}
                      </div>
                      <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {p.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Places List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Endereços Favoritos ({favoritePlaces.length})
              </h2>
              <button
                type="button"
                onClick={() => {
                  setAddingPlaceFor('favorite');
                  setAddPlaceQuery('');
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/12 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600/20 dark:text-emerald-300"
              >
                <Plus className="h-3 w-3" />
                Adicionar Local
              </button>
            </div>

            {favoritePlaces.length > 0 ? (
              <div className="space-y-2">
                {favoritePlaces.map((sp) => {
                  const isRenaming = renamingPlaceId === sp.id;
                  return (
                    <div
                      key={sp.id}
                      className="rounded-2xl border border-slate-200/80 bg-white/95 p-3 dark:border-slate-700/70 dark:bg-slate-800/70"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isRenaming) handleRouteToSavedPlace(sp);
                          }}
                          className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          </span>
                          <div className="min-w-0 flex-1">
                            {isRenaming ? (
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={renamePlaceVal}
                                  onChange={(e) => setRenamePlaceVal(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      void renameSavedPlace(sp.id, renamePlaceVal);
                                      setRenamingPlaceId(null);
                                    }
                                  }}
                                  className="w-full rounded-lg border border-emerald-500 bg-white px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none dark:bg-slate-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    void renameSavedPlace(sp.id, renamePlaceVal);
                                    setRenamingPlaceId(null);
                                  }}
                                  className="rounded-lg bg-emerald-600 p-1.5 text-white"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRenamingPlaceId(null)}
                                  className="rounded-lg p-1.5 text-slate-400"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="truncate text-sm font-bold text-slate-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300">
                                  {sp.label}
                                </div>
                                <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                  {sp.address}
                                </div>
                              </>
                            )}
                          </div>
                        </button>

                        {!isRenaming && (
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingPlaceId(sp.id);
                                setRenamePlaceVal(sp.label);
                              }}
                              title="Renomear local"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateSavedPlaceCategory(sp.id, 'home')}
                              title="Definir como Casa"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-700"
                            >
                              <Home className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateSavedPlaceCategory(sp.id, 'work')}
                              title="Definir como Trabalho"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-700"
                            >
                              <Briefcase className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteSavedPlace(sp.id)}
                              title="Excluir local"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
                <Star className="mx-auto mb-1.5 h-5 w-5 text-amber-500" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Nenhum endereço favorito salvo
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Toque na estrela ao pesquisar um endereço, marque um ponto no mapa ou clique em Adicionar Local.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
