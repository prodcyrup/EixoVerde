import {
  Activity,
  BatteryCharging,
  BookmarkPlus,
  Clock,
  Download,
  Flame,
  Gauge,
  Leaf,
  Map as MapIcon,
  Play,
  RotateCcw,
  Route,
  Trash2,
} from 'lucide-react';
import { downloadTextFile } from '../../engine/gpx';
import {
  computeLifetimeRideStats,
  exportRideToGpx,
  formatStopwatchSec,
} from '../../engine/rideRecorder';
import { selectActiveVehicle, useAppStore } from '../../store/useAppStore';
import type { RideSession } from '../../types';

function RideReplayChart({ ride }: { ride: RideSession }) {
  const pts = ride.track;
  if (!pts || pts.length < 2) return null;

  const width = 320;
  const height = 84;
  const padX = 6;
  const padY = 8;

  const speeds = pts.map((p) => Math.max(0, p.speedKmh || 0));
  const maxSpd = Math.max(15, ...speeds);

  const eles = pts.map((p) => (typeof p.ele === 'number' ? p.ele : null));
  const validEles = eles.filter((e): e is number => e !== null);
  const hasEle = validEles.length >= 2;
  const minEle = hasEle ? Math.min(...validEles) : 1000;
  const maxEle = hasEle ? Math.max(...validEles) : 1050;
  const eleSpan = Math.max(5, maxEle - minEle);

  const speedPoints = pts
    .map((p, idx) => {
      const x = padX + (idx / Math.max(1, pts.length - 1)) * (width - padX * 2);
      const y = height - padY - (Math.max(0, p.speedKmh || 0) / maxSpd) * (height - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const speedArea = `${padX},${height - padY} ${speedPoints} ${width - padX},${height - padY}`;

  const elePoints = hasEle
    ? pts
        .map((p, idx) => {
          const x = padX + (idx / Math.max(1, pts.length - 1)) * (width - padX * 2);
          const eVal = typeof p.ele === 'number' ? p.ele : minEle;
          const y = height - padY - ((eVal - minEle) / eleSpan) * (height - padY * 2);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ')
    : null;

  return (
    <div className="rounded-xl bg-slate-100/90 p-2.5 dark:bg-slate-900/70">
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Velocidade (máx {Math.round(maxSpd)} km/h)
        </span>
        {hasEle && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Altitude ({Math.round(minEle)}–{Math.round(maxEle)}m)
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full overflow-visible">
        <defs>
          <linearGradient id={`ev-spd-grad-${ride.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={speedArea} fill={`url(#ev-spd-grad-${ride.id})`} />
        {elePoints && (
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeDasharray="3 2"
            strokeLinecap="round"
            points={elePoints}
          />
        )}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={speedPoints}
        />
      </svg>
    </div>
  );
}

export function RidesHistoryPanel() {
  const rideSessions = useAppStore((s) => s.rideSessions);
  const replayingRideId = useAppStore((s) => s.replayingRideId);
  const setReplayingRideId = useAppStore((s) => s.setReplayingRideId);
  const startFreeRide = useAppStore((s) => s.startFreeRide);
  const saveRideAsRoute = useAppStore((s) => s.saveRideAsRoute);
  const deleteRideSession = useAppStore((s) => s.deleteRideSession);
  const batteryCalibrations = useAppStore((s) => s.batteryCalibrations);
  const resetVehicleCalibration = useAppStore((s) => s.resetVehicleCalibration);
  const activeVehicle = useAppStore(selectActiveVehicle);
  const consumeGpxExportQuota = useAppStore((s) => s.consumeGpxExportQuota);
  const pushToast = useAppStore((s) => s.pushToast);

  const stats = computeLifetimeRideStats(rideSessions);
  const activeCal = batteryCalibrations[activeVehicle.id];

  const handleExportRideGpx = (ride: RideSession) => {
    if (!consumeGpxExportQuota()) return;
    const gpx = exportRideToGpx(ride);
    const slug = ride.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    downloadTextFile(`eixoverde-trajeto-${slug || ride.id}.gpx`, gpx);
    pushToast('GPX do trajeto exportado!', 'Arquivo GPX 1.1 pronto para compartilhamento.', 'emerald');
  };

  return (
    <div id="eixoverde-rides-panel" className="space-y-3.5">
      {/* Free Ride Quick Launch CTA */}
      <button
        id="eixoverde-start-freeride-btn"
        type="button"
        onClick={startFreeRide}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500 active:scale-[0.99]"
      >
        <Play className="h-4 w-4 fill-current" />
        Gravar Modo Livre (GPS + Auto-Pausa)
      </button>

      {/* Lifetime Telemetry Summary Card */}
      <div
        id="eixoverde-lifetime-stats"
        className="rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xs dark:border-slate-700/70 dark:bg-slate-800/70"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Activity className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Resumo Acumulado
          </div>
          <span className="font-mono-num text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            {stats.totalRealRides} {stats.totalRealRides === 1 ? 'trajeto real' : 'trajetos reais'}
            {stats.totalDemoRides > 0 ? ` • ${stats.totalDemoRides} sim.` : ''}
          </span>
        </div>

        <div className="font-mono-num mt-2.5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-100/90 px-2.5 py-2 dark:bg-slate-900/60">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Distância</div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">
              {stats.totalDistanceKm.toFixed(1).replace('.', ',')} km
            </div>
          </div>
          <div className="rounded-xl bg-slate-100/90 px-2.5 py-2 dark:bg-slate-900/60">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <Leaf className="h-3 w-3 text-emerald-500" />
              CO₂ evitado
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {stats.totalCo2SavedKg.toFixed(1).replace('.', ',')} kg
            </div>
          </div>
          <div className="rounded-xl bg-slate-100/90 px-2.5 py-2 dark:bg-slate-900/60">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <Flame className="h-3 w-3 text-amber-500" />
              Calorias
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">
              {stats.totalCaloriesKcal} kcal
            </div>
          </div>
        </div>

        {/* Active Vehicle Learned Battery Calibration Pill */}
        {activeVehicle.isElectric && activeCal && activeCal.sampleCount > 0 && (
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2 text-[11px]">
            <div className="flex min-w-0 items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
              <BatteryCharging className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-semibold">
                {activeVehicle.name.split(' ')[0]}: autonomia calibrada em{' '}
                <strong className="font-mono-num">{Math.round(activeCal.efficiencyMultiplier * 100)}%</strong> (
                {activeCal.sampleCount} {activeCal.sampleCount === 1 ? 'trajeto' : 'trajetos'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => resetVehicleCalibration(activeVehicle.id)}
              title="Restaurar autonomia padrão do veículo"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <RotateCcw className="h-3 w-3" />
              Resetar
            </button>
          </div>
        )}
      </div>

      {/* Recorded Rides List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Histórico de Trajetos ({rideSessions.length})
          </h2>
          {replayingRideId && (
            <button
              type="button"
              onClick={() => setReplayingRideId(null)}
              className="text-[11px] font-bold text-sky-600 hover:underline dark:text-sky-400"
            >
              Limpar replay no mapa
            </button>
          )}
        </div>

        {rideSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center dark:border-slate-700">
            <Route className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              Nenhum trajeto gravado ainda
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Toda navegação guiada é gravada automaticamente, ou toque em <strong>Gravar Modo Livre</strong> acima.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {rideSessions.map((ride) => {
              const isExpanded = replayingRideId === ride.id;
              const dateStr = new Date(ride.startedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ride.id}
                  className={`rounded-2xl border p-3.5 transition-all ${
                    isExpanded
                      ? 'border-sky-500 bg-sky-50/40 shadow-md dark:border-sky-400 dark:bg-sky-950/25'
                      : 'border-slate-200/80 bg-white/95 hover:border-emerald-500/40 dark:border-slate-700/70 dark:bg-slate-800/70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setReplayingRideId(isExpanded ? null : ride.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">{dateStr}</span>
                          {ride.isDemo ? (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                              Simulação
                            </span>
                          ) : ride.mode === 'free_ride' ? (
                            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:text-sky-300">
                              Modo Livre
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                              Guiado
                            </span>
                          )}
                          {typeof ride.batteryUsedPct === 'number' && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              <BatteryCharging className="h-2.5 w-2.5" />-{ride.batteryUsedPct}%
                            </span>
                          )}
                        </div>
                        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {ride.title}
                        </h3>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {ride.vehicleName}
                          {ride.weatherSummary ? ` • ${ride.weatherSummary.temperatureC}°C` : ''}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold ${
                          isExpanded
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <MapIcon className="h-3 w-3" />
                        {isExpanded ? 'No Mapa' : 'Replay'}
                      </span>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="font-mono-num mt-2.5 flex items-center gap-3 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-600 dark:border-slate-700/60 dark:text-slate-300">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {ride.distanceKm.toFixed(2).replace('.', ',')} km
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {formatStopwatchSec(ride.movingDurationSec)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="h-3 w-3 text-slate-400" />
                        {ride.avgSpeedKmh.toFixed(1).replace('.', ',')} km/h
                      </span>
                      <span className="ml-auto text-slate-400">+{ride.ascentM}m</span>
                    </div>
                  </button>

                  {/* Expanded Replay Chart & Action Buttons */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2.5 border-t border-slate-200/80 pt-3 dark:border-slate-700/70">
                      <RideReplayChart ride={ride} />

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void saveRideAsRoute(ride.id)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 py-2 text-[11px] font-extrabold text-white hover:bg-emerald-500"
                        >
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          Salvar como Rota
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportRideGpx(ride)}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-bold text-slate-700 hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <Download className="h-3.5 w-3.5" />
                          GPX
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteRideSession(ride.id)}
                          aria-label="Excluir trajeto"
                          title="Excluir trajeto"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:border-rose-500/40 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
