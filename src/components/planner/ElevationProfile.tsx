import { useMemo } from 'react';
import { Mountain } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { RouteCandidate } from '../../types';

interface ElevationProfileProps {
  route: RouteCandidate;
}

export function ElevationProfile({ route }: ElevationProfileProps) {
  const setHoverCoordIndex = useAppStore((s) => s.setHoverCoordIndex);
  const hoverCoordIndex = useAppStore((s) => s.hoverCoordIndex);

  const { elevations, minM, maxM, ascentM, descentM, isRealElevation } = route.elevation;

  const { areaPath, linePath, points } = useMemo(() => {
    const w = 340;
    const h = 76;
    const padY = 8;
    const count = elevations.length;
    if (count < 2) {
      return { areaPath: '', linePath: '', points: [] as Array<{ x: number; y: number; idx: number; ele: number }> };
    }

    const span = Math.max(12, maxM - minM);
    const step = Math.max(1, Math.floor(count / 70));
    const sampled: Array<{ x: number; y: number; idx: number; ele: number }> = [];

    for (let i = 0; i < count; i += step) {
      const x = (i / (count - 1)) * w;
      const norm = (elevations[i] - minM) / span;
      const y = h - padY - norm * (h - padY * 2);
      sampled.push({ x, y, idx: i, ele: elevations[i] });
    }
    if (sampled[sampled.length - 1]?.idx !== count - 1) {
      const lastEle = elevations[count - 1];
      const norm = (lastEle - minM) / span;
      sampled.push({ x: w, y: h - padY - norm * (h - padY * 2), idx: count - 1, ele: lastEle });
    }

    const line = sampled.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${w},${h} L0,${h} Z`;
    return { areaPath: area, linePath: line, points: sampled };
  }, [elevations, minM, maxM]);

  const activeHoverPoint = useMemo(() => {
    if (hoverCoordIndex === null || points.length === 0) return null;
    let closest = points[0];
    let bestDiff = Math.abs(points[0].idx - hoverCoordIndex);
    for (const p of points) {
      const d = Math.abs(p.idx - hoverCoordIndex);
      if (d < bestDiff) {
        bestDiff = d;
        closest = p;
      }
    }
    return closest;
  }, [hoverCoordIndex, points]);

  const handlePointer = (clientX: number, rect: DOMRect) => {
    if (elevations.length < 2) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(ratio * (elevations.length - 1));
    setHoverCoordIndex(idx);
  };

  const { surfaces } = route;
  const surfaceSegments = [
    { key: 'ciclovia', label: 'Ciclovia', pct: surfaces.cicloviaPct, color: '#10b981' },
    { key: 'ciclofaixa', label: 'Ciclofaixa', pct: surfaces.ciclofaixaPct, color: '#0ea5e9' },
    { key: 'baixa', label: 'Via Calma', pct: surfaces.baixaVelPct, color: '#14b8a6' },
    { key: 'trilha', label: 'Trilha', pct: surfaces.trilhaPct, color: '#d97706' },
    { key: 'comum', label: 'Via Comum', pct: surfaces.viaComumPct, color: '#64748b' },
  ].filter((s) => s.pct > 0);

  return (
    <div className="space-y-3">
      {/* Surface / Way-Type Stacked Bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Infraestrutura da Rota</span>
          <span className="font-mono-num font-bold text-emerald-600 dark:text-emerald-400">
            {surfaces.safetyScore}% segura
          </span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
          {surfaceSegments.map((seg) => (
            <div
              key={seg.key}
              style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${seg.pct}%`}
              className="h-full transition-all duration-300"
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
          {surfaceSegments.map((seg) => (
            <span key={seg.key} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.label} <strong className="font-mono-num text-slate-800 dark:text-slate-200">{seg.pct}%</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Interactive SVG Elevation Chart */}
      <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-800/60">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            <Mountain className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Perfil de Altimetria
            {!isRealElevation && (
              <span className="rounded bg-slate-200/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                Est.
              </span>
            )}
          </span>
          <div className="font-mono-num flex items-center gap-2.5 text-[11px] font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400">↗ +{ascentM}m</span>
            <span className="text-sky-600 dark:text-sky-400">↘ -{descentM}m</span>
          </div>
        </div>

        <div
          className="relative cursor-crosshair select-none"
          onMouseMove={(e) => handlePointer(e.clientX, e.currentTarget.getBoundingClientRect())}
          onTouchMove={(e) => {
            if (e.touches[0]) handlePointer(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
          }}
          onMouseLeave={() => setHoverCoordIndex(null)}
          onTouchEnd={() => setHoverCoordIndex(null)}
        >
          <svg viewBox="0 0 340 76" className="h-[72px] w-full overflow-visible">
            <defs>
              <linearGradient id="evElevFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {areaPath && <path d={areaPath} fill="url(#evElevFill)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#059669"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {activeHoverPoint && (
              <>
                <line
                  x1={activeHoverPoint.x}
                  x2={activeHoverPoint.x}
                  y1={0}
                  y2={76}
                  stroke="#0284c7"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activeHoverPoint.x}
                  cy={activeHoverPoint.y}
                  r="4.2"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>
          <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <span>Min: {minM}m</span>
            {activeHoverPoint ? (
              <span className="font-mono-num font-bold text-sky-600 dark:text-sky-400">
                Altitude: {Math.round(activeHoverPoint.ele)} m
              </span>
            ) : (
              <span>Toque/passe no gráfico para sincronizar no mapa</span>
            )}
            <span>Máx: {maxM}m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
