import { useEffect, useState } from 'react';
import {
  BatteryCharging,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  Leaf,
  Mountain,
  Route,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { formatStopwatchSec } from '../../engine/rideRecorder';
import { useAppStore } from '../../store/useAppStore';

export function RideSummaryModal() {
  const pending = useAppStore((s) => s.pendingRideSummary);
  const savePendingRideSummary = useAppStore((s) => s.savePendingRideSummary);
  const discardPendingRideSummary = useAppStore((s) => s.discardPendingRideSummary);
  const setExploreTab = useAppStore((s) => s.setExploreTab);
  const clearActiveRoute = useAppStore((s) => s.clearActiveRoute);

  const [title, setTitle] = useState('');
  const [logBattery, setLogBattery] = useState(false);
  const [batteryStart, setBatteryStart] = useState(100);
  const [batteryEnd, setBatteryEnd] = useState(80);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pending) return;
    setTitle(pending.title);
    const estUsed = Math.max(5, Math.min(90, pending.estimatedBatteryUsedPct ?? 18));
    setBatteryStart(100);
    setBatteryEnd(Math.max(5, 100 - estUsed));
    setLogBattery(false);
    setSaving(false);
  }, [pending?.id]);

  if (!pending) return null;

  const actualDrop = Math.max(0, batteryStart - batteryEnd);
  const canCalibrateRealBattery = pending.isElectric && !pending.isDemo;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    await savePendingRideSummary({
      title,
      batteryStartPct: logBattery && canCalibrateRealBattery ? batteryStart : undefined,
      batteryEndPct: logBattery && canCalibrateRealBattery ? batteryEnd : undefined,
      applyCalibration: logBattery && canCalibrateRealBattery,
    });
    setSaving(false);
  };

  const handleSaveAndOpenHistory = async () => {
    if (saving) return;
    setSaving(true);
    await savePendingRideSummary({
      title,
      batteryStartPct: logBattery && canCalibrateRealBattery ? batteryStart : undefined,
      batteryEndPct: logBattery && canCalibrateRealBattery ? batteryEnd : undefined,
      applyCalibration: logBattery && canCalibrateRealBattery,
    });
    setSaving(false);
    clearActiveRoute();
    setExploreTab('rides');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={discardPendingRideSummary}
    >
      <div
        id="eixoverde-ride-summary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eixoverde-ride-summary-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl ev-scroll dark:bg-slate-900 sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h2
                  id="eixoverde-ride-summary-title"
                  className="font-display text-base font-extrabold text-slate-900 dark:text-white"
                >
                  Resumo do Trajeto
                </h2>
                {pending.isDemo ? (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                    Simulação
                  </span>
                ) : pending.mode === 'free_ride' ? (
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:text-sky-300">
                    Modo Livre
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                    Guiado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pending.vehicleName}
                {pending.weatherSummary
                  ? ` • ${pending.weatherSummary.temperatureC}°C (${pending.weatherSummary.label})`
                  : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={discardPendingRideSummary}
            aria-label="Fechar resumo do trajeto"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Key Telemetry Grid */}
        <div className="font-mono-num mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-100/90 p-2.5 dark:bg-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              <Route className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              Distância
            </div>
            <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
              {pending.distanceKm.toFixed(2).replace('.', ',')} km
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100/90 p-2.5 dark:bg-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              <Clock className="h-3 w-3 text-sky-600 dark:text-sky-400" />
              Movimento
            </div>
            <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
              {formatStopwatchSec(pending.movingDurationSec)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Total {formatStopwatchSec(pending.totalDurationSec)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100/90 p-2.5 dark:bg-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              <Gauge className="h-3 w-3 text-amber-500" />
              Velocidade
            </div>
            <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
              {pending.avgSpeedKmh.toFixed(1).replace('.', ',')} <span className="text-[10px] font-bold">km/h</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Máx {pending.maxSpeedKmh} km/h
            </div>
          </div>
        </div>

        {/* Secondary Metrics Strip */}
        <div className="font-mono-num mt-2 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
          <span className="inline-flex items-center gap-1">
            <Mountain className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            +{pending.ascentM}m
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            {pending.caloriesKcal} kcal
          </span>
          <span className="inline-flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {pending.co2SavedKg.toFixed(2).replace('.', ',')} kg CO₂
          </span>
        </div>

        <form onSubmit={(e) => void handleSave(e)} className="mt-4 space-y-3.5">
          {/* Editable Ride Title */}
          <div>
            <label
              htmlFor="eixoverde-ride-title-input"
              className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Nome do trajeto
            </label>
            <input
              id="eixoverde-ride-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ciclovia Asa Norte — Manhã"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            />
          </div>

          {/* 1-Tap Optional Real-World Battery Calibration (Electric Real Rides) */}
          {canCalibrateRealBattery && (
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3 dark:bg-emerald-500/10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Calibrar bateria real? (opcional)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ajuda a ajustar a autonomia do seu {pending.vehicleName.split(' ')[0]}
                    </div>
                  </div>
                </div>
                <button
                  id="eixoverde-battery-cal-toggle"
                  type="button"
                  onClick={() => setLogBattery((v) => !v)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
                    logBattery
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {logBattery ? 'Ativo' : 'Informar %'}
                </button>
              </div>

              {logBattery && (
                <div className="mt-3 space-y-2.5 border-t border-emerald-500/20 pt-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>Bateria inicial → final</span>
                    <span className="font-mono-num text-emerald-700 dark:text-emerald-300">
                      {batteryStart}% → {batteryEnd}% (-{actualDrop}%)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="w-12 shrink-0 font-semibold">Início</span>
                      <input
                        id="eixoverde-battery-start-slider"
                        type="range"
                        min={5}
                        max={100}
                        step={1}
                        value={batteryStart}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setBatteryStart(v);
                          if (batteryEnd >= v) setBatteryEnd(Math.max(0, v - 1));
                        }}
                        className="h-1.5 flex-1 accent-emerald-600"
                      />
                      <span className="font-mono-num w-9 text-right font-bold">{batteryStart}%</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="w-12 shrink-0 font-semibold">Final</span>
                      <input
                        id="eixoverde-battery-end-slider"
                        type="range"
                        min={0}
                        max={Math.max(0, batteryStart - 1)}
                        step={1}
                        value={batteryEnd}
                        onChange={(e) => setBatteryEnd(Number(e.target.value))}
                        className="h-1.5 flex-1 accent-sky-600"
                      />
                      <span className="font-mono-num w-9 text-right font-bold">{batteryEnd}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Estimativa nominal: -{pending.estimatedBatteryUsedPct ?? 0}% • Real informado: -{actualDrop}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {pending.isDemo && (
            <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-800 dark:text-amber-300">
              Trajetos em modo <strong>Simulação</strong> ficam marcados no histórico e não alteram seus totais reais nem a calibração de bateria.
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="eixoverde-ride-discard-btn"
              type="button"
              onClick={discardPendingRideSummary}
              className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Descartar
            </button>
            <button
              id="eixoverde-ride-save-btn"
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-emerald-600 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 disabled:opacity-60"
            >
              Salvar Trajeto
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveAndOpenHistory()}
              className="rounded-2xl border border-emerald-600/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Ver Trajetos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
