import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  BatteryCharging,
  Bookmark,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudSun,
  Download,
  Droplets,
  Edit3,
  Flame,
  Leaf,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Play,
  Plus,
  Repeat,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Wind,
  X,
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { formatDurationPtBR } from '../../engine/geo';
import { downloadTextFile, encodeShareableRouteUrl, exportRouteToGpx } from '../../engine/gpx';
import { searchPlaces } from '../../engine/routing';
import { computeRouteTelemetry } from '../../engine/telemetry';
import { computeRouteMainBearingDeg } from '../../engine/weather';
import { selectActiveVehicle, useAppStore } from '../../store/useAppStore';
import type { PlaceResult, WeatherIconKind } from '../../types';
import { ElevationProfile } from './ElevationProfile';

function WeatherGlyph({ kind }: { kind: WeatherIconKind }) {
  switch (kind) {
    case 'sun':
      return <Sun className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
    case 'partly_cloudy':
      return <CloudSun className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
    case 'rain':
      return <CloudDrizzle className="h-3.5 w-3.5 shrink-0 text-sky-500" />;
    case 'storm':
      return <CloudLightning className="h-3.5 w-3.5 shrink-0 text-rose-500" />;
    case 'fog':
      return <CloudFog className="h-3.5 w-3.5 shrink-0 text-slate-400" />;
    default:
      return <Cloud className="h-3.5 w-3.5 shrink-0 text-slate-400" />;
  }
}

export function RoutePreviewPanel() {
  const [savingName, setSavingName] = useState(false);
  const [routeNameInput, setRouteNameInput] = useState('');
  const [editingEndpoint, setEditingEndpoint] = useState<null | 'origin' | 'dest'>(null);
  const [endpointQuery, setEndpointQuery] = useState('');
  const [endpointResults, setEndpointResults] = useState<PlaceResult[]>([]);

  const origin = useAppStore((s) => s.origin);
  const destination = useAppStore((s) => s.destination);
  const viaPoints = useAppStore((s) => s.viaPoints);
  const candidates = useAppStore((s) => s.candidates);
  const selectedCandidateIdx = useAppStore((s) => s.selectedCandidateIdx);
  const selectCandidate = useAppStore((s) => s.selectCandidate);
  const isRouting = useAppStore((s) => s.isRouting);
  const isEditingWaypoints = useAppStore((s) => s.isEditingWaypoints);
  const toggleEditWaypoints = useAppStore((s) => s.toggleEditWaypoints);
  const removeViaPoint = useAppStore((s) => s.removeViaPoint);
  const swapOriginDest = useAppStore((s) => s.swapOriginDest);
  const setOrigin = useAppStore((s) => s.setOrigin);
  const setDestination = useAppStore((s) => s.setDestination);
  const useCurrentLocationAsOrigin = useAppStore((s) => s.useCurrentLocationAsOrigin);
  const openSavePlacePrompt = useAppStore((s) => s.openSavePlacePrompt);
  const setMapPickTarget = useAppStore((s) => s.setMapPickTarget);
  const clearActiveRoute = useAppStore((s) => s.clearActiveRoute);
  const startNavigation = useAppStore((s) => s.startNavigation);
  const saveCurrentRoute = useAppStore((s) => s.saveCurrentRoute);
  const isRoundTrip = useAppStore((s) => s.isRoundTrip);
  const toggleRoundTrip = useAppStore((s) => s.toggleRoundTrip);
  const activeVehicle = useAppStore(selectActiveVehicle);
  const selectedModeIndex = useAppStore((s) => s.selectedModeIndex);
  const setModeIndex = useAppStore((s) => s.setModeIndex);
  const riderWeightKg = useAppStore((s) => s.riderWeightKg);
  const weather = useAppStore((s) => s.weather);
  const batteryCalibrations = useAppStore((s) => s.batteryCalibrations);
  const setGarageOpen = useAppStore((s) => s.setGarageOpen);
  const navPos = useAppStore((s) => s.nav.currentPos);
  const pushToast = useAppStore((s) => s.pushToast);
  const showSafetySegments = useAppStore((s) => s.showSafetySegments);
  const toggleSafetySegments = useAppStore((s) => s.toggleSafetySegments);

  const activeRoute = candidates[selectedCandidateIdx];
  const activeCalibration = batteryCalibrations[activeVehicle.id] ?? null;

  useEffect(() => {
    if (!editingEndpoint) return;
    const timer = setTimeout(async () => {
      const list = await searchPlaces(endpointQuery, navPos ?? BRAND.defaultCenter);
      setEndpointResults(list);
    }, endpointQuery ? 240 : 0);
    return () => clearTimeout(timer);
  }, [editingEndpoint, endpointQuery, navPos]);

  const handleSelectEndpointPlace = (place: PlaceResult) => {
    const slot = editingEndpoint;
    setEditingEndpoint(null);
    setEndpointQuery('');
    if (slot === 'origin') {
      setOrigin(place, true);
    } else if (slot === 'dest') {
      void setDestination(place, true);
    }
  };

  const handleExportGpx = () => {
    if (!activeRoute) return;
    const gpx = exportRouteToGpx(activeRoute.title, activeRoute.coords, activeRoute.subtitle);
    const slug = activeRoute.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    downloadTextFile(`eixoverde-${slug || 'rota'}.gpx`, gpx);
    pushToast('GPX exportado', 'Arquivo GPX 1.1 pronto para ciclocomputadores e apps de ciclismo.', 'emerald');
  };

  const handleShareLink = async () => {
    if (!activeRoute) return;
    const url = encodeShareableRouteUrl(activeRoute.title, activeRoute.waypoints, activeRoute.profile);
    try {
      if (navigator.share) {
        await navigator.share({ title: `EixoVerde • ${activeRoute.title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        pushToast('Link copiado!', 'Envie para abrir esta rota diretamente no EixoVerde.', 'emerald');
      }
    } catch {
      pushToast('Link pronto', url, 'slate');
    }
  };

  const handleConfirmSave = async () => {
    await saveCurrentRoute(routeNameInput);
    setSavingName(false);
    setRouteNameInput('');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Origin (A) / Destination (B) Compact Header */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={clearActiveRoute}
          aria-label="Voltar"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setEditingEndpoint(editingEndpoint === 'origin' ? null : 'origin');
                setEndpointQuery('');
              }}
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-1.5 text-left text-xs transition-colors ${
                editingEndpoint === 'origin'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
                  : 'border-slate-200 bg-white hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800/90'
              }`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-extrabold text-white">
                A
              </span>
              <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                {origin?.name || 'Minha localização atual'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void useCurrentLocationAsOrigin()}
              title="Definir Ponto A como minha localização atual (GPS)"
              aria-label="Usar minha localização atual como Ponto A"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                origin?.source === 'gps'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-white text-emerald-600 hover:border-emerald-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400'
              }`}
            >
              <LocateFixed className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setEditingEndpoint(editingEndpoint === 'dest' ? null : 'dest');
                setEndpointQuery('');
              }}
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-1.5 text-left text-xs transition-colors ${
                editingEndpoint === 'dest'
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                  : 'border-slate-200 bg-white hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800/90'
              }`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-extrabold text-white dark:bg-sky-500">
                B
              </span>
              <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                {destination?.name || 'Destino'}
              </span>
            </button>

            {destination && (
              <button
                type="button"
                onClick={() => openSavePlacePrompt(destination, 'favorite')}
                title="Salvar destino em Meus Locais"
                aria-label="Salvar destino em Meus Locais"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-500 hover:border-amber-500/50 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-amber-950/40"
              >
                <Star className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={swapOriginDest}
          title="Trocar Ponto A e Ponto B"
          className="mt-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-500/40 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {/* Inline Origin / Destination Picker Dropdown */}
      {editingEndpoint && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
            <Search className="h-3.5 w-3.5 text-emerald-600" />
            <input
              type="text"
              autoFocus
              value={endpointQuery}
              onChange={(e) => setEndpointQuery(e.target.value)}
              placeholder={
                editingEndpoint === 'origin'
                  ? 'Buscar ponto de partida (Ponto A)...'
                  : 'Buscar destino (Ponto B)...'
              }
              className="w-full bg-transparent text-xs font-medium text-slate-900 focus:outline-none dark:text-white"
            />
            <button
              type="button"
              onClick={() => setEditingEndpoint(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {editingEndpoint === 'origin' && (
              <button
                type="button"
                onClick={() => {
                  setEditingEndpoint(null);
                  void useCurrentLocationAsOrigin();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                Usar minha localização (GPS)
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const slot = editingEndpoint;
                setEditingEndpoint(null);
                setMapPickTarget(slot);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Escolher no mapa
            </button>
          </div>

          <div className="max-h-40 space-y-0.5 overflow-y-auto ev-scroll">
            {endpointResults.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectEndpointPlace(place)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {place.name}
                  </div>
                  <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {place.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isRouting && (
        <div className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500/10 py-6 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
          Calculando melhores ciclovias...
        </div>
      )}

      {/* Multi-Profile Route Comparison Pills + Quick Action Toolbar right below */}
      {!isRouting && candidates.length > 0 && activeRoute && (
        <>
          {candidates.length > 1 && (
            <div className="grid grid-cols-3 gap-1.5">
              {candidates.map((cand, idx) => {
                const t = computeRouteTelemetry(cand, activeVehicle, selectedModeIndex, riderWeightKg, isRoundTrip, {
                  weather,
                  routeBearingDeg: computeRouteMainBearingDeg(cand.coords),
                  calibration: activeCalibration,
                });
                const selected = idx === selectedCandidateIdx;
                const shortLabel =
                  cand.profile === 'safe' ? 'Segura' : cand.profile === 'balanced' ? 'Equilibrada' : 'Rápida';
                return (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => selectCandidate(idx)}
                    className={`rounded-xl border p-2 text-left transition-all ${
                      selected
                        ? 'border-emerald-600 bg-emerald-600/10 shadow-sm dark:border-emerald-500 dark:bg-emerald-500/15'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[11px] font-bold ${
                          selected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {shortLabel}
                      </span>
                      <span className="font-mono-num text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {cand.surfaces.safetyScore}%
                      </span>
                    </div>
                    <div className="font-mono-num mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatDurationPtBR(isRoundTrip ? t.roundTripMin : t.oneWayMin)}
                    </div>
                    <div className="font-mono-num text-[10px] text-slate-500 dark:text-slate-400">
                      {(isRoundTrip ? t.tripDistanceKm : t.distanceKm).toFixed(1).replace('.', ',')} km
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Top Action Toolbar: Ajustar Rota, Parada, Salvar, GPX & Compartilhar — single line even on 375px iPhone SE */}
          <div className="space-y-2">
            <div className="flex flex-nowrap items-center gap-1 overflow-x-auto ev-scroll">
              <button
                type="button"
                onClick={toggleEditWaypoints}
                className={`inline-flex shrink-0 items-center gap-1 rounded-xl border px-1.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors min-[390px]:px-2 ${
                  isEditingWaypoints
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-sky-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <Edit3 className="h-3 w-3 shrink-0" />
                {isEditingWaypoints ? 'Editando' : 'Ajustar Rota'}
              </button>

              <button
                type="button"
                onClick={() => setMapPickTarget('via')}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-1.5 text-[11px] font-semibold whitespace-nowrap text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 min-[390px]:px-2"
              >
                <Plus className="h-3 w-3 shrink-0" />
                Parada
              </button>

              <button
                type="button"
                onClick={() => {
                  setRouteNameInput(activeRoute.destName ? `Rota para ${activeRoute.destName}` : activeRoute.title);
                  setSavingName(true);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-1.5 text-[11px] font-semibold whitespace-nowrap text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 min-[390px]:px-2"
              >
                <Bookmark className="h-3 w-3 shrink-0 text-emerald-600" />
                Salvar
              </button>

              <button
                type="button"
                onClick={handleExportGpx}
                title="Exportar GPX"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-1.5 text-[11px] font-semibold whitespace-nowrap text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 min-[390px]:px-2"
              >
                <Download className="h-3 w-3 shrink-0" />
                GPX
              </button>

              <button
                type="button"
                onClick={handleShareLink}
                title="Compartilhar link da rota"
                aria-label="Compartilhar rota"
                className="ml-auto inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Active via-points chips */}
            {viaPoints.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {viaPoints.map((_, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300"
                  >
                    <MapPin className="h-3 w-3" />
                    Parada {idx + 1}
                    <button
                      type="button"
                      onClick={() => void removeViaPoint(idx)}
                      className="ml-0.5 hover:text-rose-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Inline Save Route Dialog */}
            {savingName && (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 p-2">
                <input
                  type="text"
                  value={routeNameInput}
                  onChange={(e) => setRouteNameInput(e.target.value)}
                  placeholder="Nome da rota..."
                  className="w-full rounded-lg border border-emerald-500/30 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => void handleConfirmSave()}
                  className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setSavingName(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/60"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Active Route Telemetry Hero Card */}
          {(() => {
            const routeBearingDeg = computeRouteMainBearingDeg(activeRoute.coords);
            const telemetry = computeRouteTelemetry(
              activeRoute,
              activeVehicle,
              selectedModeIndex,
              riderWeightKg,
              isRoundTrip,
              {
                weather,
                routeBearingDeg,
                calibration: activeCalibration,
              }
            );
            const activeMode = activeVehicle.modes[selectedModeIndex] ?? activeVehicle.modes[0];

            return (
              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/80">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {formatDurationPtBR(isRoundTrip ? telemetry.roundTripMin : telemetry.oneWayMin)}
                      </span>
                      <span className="font-mono-num text-sm font-semibold text-slate-500 dark:text-slate-400">
                        ({(isRoundTrip ? telemetry.tripDistanceKm : telemetry.distanceKm).toFixed(1).replace('.', ',')} km)
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {activeRoute.title} • média {telemetry.effectiveAvgSpeed} km/h
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleRoundTrip}
                    className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      isRoundTrip
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Repeat className="h-3 w-3 shrink-0" />
                    {isRoundTrip ? 'Ida + Volta' : 'Só Ida'}
                  </button>
                </div>

                {/* Live Open-Meteo Weather & Wind Vector Strip */}
                {weather && (
                  <div
                    id="eixoverde-weather-pill"
                    className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl border border-slate-200/70 bg-slate-50/90 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-200"
                  >
                    <span className="inline-flex items-center gap-1 font-bold">
                      <WeatherGlyph kind={weather.icon} />
                      <span className="font-mono-num">{weather.temperatureC}°C</span>
                      <span className="text-slate-500 dark:text-slate-400">• {weather.label}</span>
                    </span>
                    <span className="font-mono-num inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
                      <Droplets className="h-3 w-3 shrink-0" />
                      {weather.rainProbabilityPct}%
                    </span>
                    <span className="font-mono-num inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <Wind className="h-3 w-3 shrink-0" />
                      {telemetry.windEffectLabel || `${weather.windSpeedKmh} km/h`}
                    </span>
                  </div>
                )}

                {/* Primary Navigation Launch CTA */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="eixoverde-start-nav-btn"
                    type="button"
                    onClick={() => startNavigation(false)}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-[0.99]"
                  >
                    <Navigation className="h-4.5 w-4.5 fill-current" />
                    Iniciar Navegação
                  </button>
                  <button
                    id="eixoverde-demo-nav-btn"
                    type="button"
                    onClick={() => startNavigation(true)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    <Play className="h-3.5 w-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
                    Testar
                  </button>
                </div>

                {/* Vehicle Quick Switcher & Mode Pills */}
                <div className="rounded-xl bg-slate-100/80 p-2.5 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGarageOpen(true)}
                        className="truncate text-left text-xs font-bold text-slate-800 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400"
                      >
                        {activeVehicle.name}
                      </button>
                      {telemetry.calibrationApplied && (
                        <span
                          title={`Autonomia calibrada em ${Math.round((telemetry.calibrationMultiplier ?? 1) * 100)}% com base nos seus pedais reais`}
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          Calibrada
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setGarageOpen(true)}
                      className="shrink-0 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      Trocar veículo
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {activeVehicle.modes.map((m, idx) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => setModeIndex(idx)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                          idx === selectedModeIndex
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {m.name} ({m.topSpeed} km/h)
                      </button>
                    ))}
                  </div>

                  {/* Battery / Calories / CO2 Strip */}
                  <div className="font-mono-num mt-2.5 grid grid-cols-3 gap-2 border-t border-slate-200/80 pt-2 text-[11px] dark:border-slate-700/70">
                    {activeVehicle.isElectric ? (
                      <div className="flex items-center gap-1.5">
                        <BatteryCharging
                          className={`h-3.5 w-3.5 shrink-0 ${
                            telemetry.batteryLeftPct <= 25 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {telemetry.batteryLeftPct}% rest.
                          </div>
                          <div className="text-[10px] text-slate-500">-{telemetry.batteryUsedPct}% ({telemetry.realRangeKm}km)</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {telemetry.caloriesKcal} kcal
                          </div>
                          <div className="text-[10px] text-slate-500">{activeMode?.name}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {activeRoute.crossings.length} travessias
                        </div>
                        <div className="text-[10px] text-slate-500">+{Math.round(telemetry.delayMin)} min esp.</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {telemetry.co2SavedKg} kg
                        </div>
                        <div className="text-[10px] text-slate-500">CO₂ evitado</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Weather Safety Warning (rain / wet ciclovia / gusts / low humidity / UV) */}
                {telemetry.weatherWarning && (
                  <div
                    id="eixoverde-weather-warning"
                    className="flex items-start gap-2 rounded-xl bg-sky-500/12 px-3 py-2 text-xs font-medium text-sky-900 dark:text-sky-200"
                  >
                    <CloudDrizzle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                    <span>{telemetry.weatherWarning}</span>
                  </div>
                )}

                {/* Vehicle-specific Comfort / Battery Warning */}
                {telemetry.comfortWarning && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-500/12 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{telemetry.comfortWarning}</span>
                  </div>
                )}

                {/* Phase 4: Color-Coded Safety & Surface Route Segments Toggle + Legend */}
                <div
                  id="eixoverde-safety-segments-legend"
                  className="rounded-xl border border-slate-200/75 bg-slate-50/90 px-2.5 py-2 dark:border-slate-700/70 dark:bg-slate-900/55"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Cores de segurança no mapa
                    </span>
                    <button
                      id="eixoverde-safety-segments-toggle"
                      type="button"
                      onClick={toggleSafetySegments}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
                        showSafetySegments
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {showSafetySegments ? 'Ativo' : 'Oculto'}
                    </button>
                  </div>
                  {showSafetySegments && (
                    <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 sm:grid-cols-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-3.5 shrink-0 rounded-full bg-emerald-500" />
                        Ciclovia
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-3.5 shrink-0 rounded-full bg-sky-500" />
                        Ciclofaixa
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-3.5 shrink-0 rounded-full bg-amber-500" />
                        Via Calma
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-3.5 shrink-0 rounded-full bg-rose-500" />
                        Via Comum
                      </span>
                    </div>
                  )}
                </div>

                {/* Elevation & Way-Type Surface Analytics */}
                <ElevationProfile route={activeRoute} />
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
