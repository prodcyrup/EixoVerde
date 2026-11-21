import { useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Loader2,
  MapPin,
  MoreHorizontal,
  Navigation,
  Star,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function MapContextPopup() {
  const pin = useAppStore((s) => s.mapContextPin);
  const screenPos = useAppStore((s) => s.mapContextScreenPos);
  const closeMapContextPin = useAppStore((s) => s.closeMapContextPin);
  const setDestination = useAppStore((s) => s.setDestination);
  const setOrigin = useAppStore((s) => s.setOrigin);
  const openSavePlacePrompt = useAppStore((s) => s.openSavePlacePrompt);
  const openHazardReporter = useAppStore((s) => s.openHazardReporter);
  const pushToast = useAppStore((s) => s.pushToast);

  const [moreOpen, setMoreOpen] = useState(false);

  if (!pin) return null;

  const resolvedPlace = pin.place ?? {
    id: `pin-${Date.now()}`,
    name: 'Ponto no Mapa',
    subtitle: `${pin.coords[1].toFixed(5)}, ${pin.coords[0].toFixed(5)}`,
    coords: pin.coords,
    source: 'map' as const,
  };

  const title = pin.loading ? 'Identificando local...' : resolvedPlace.name;
  const subtitle = pin.loading
    ? `${pin.coords[1].toFixed(5)}, ${pin.coords[0].toFixed(5)}`
    : resolvedPlace.district || resolvedPlace.city
      ? [resolvedPlace.district, resolvedPlace.city].filter(Boolean).join(', ')
      : resolvedPlace.subtitle;

  const handleRouteHere = () => {
    setMoreOpen(false);
    closeMapContextPin();
    void setDestination(resolvedPlace, true);
  };

  const handleSaveHere = () => {
    setMoreOpen(false);
    closeMapContextPin();
    openSavePlacePrompt(resolvedPlace, 'favorite');
  };

  const handleSetAsOrigin = () => {
    setMoreOpen(false);
    closeMapContextPin();
    setOrigin(resolvedPlace, true);
    pushToast('Ponto A atualizado', resolvedPlace.name, 'emerald');
  };

  const handleReportHazard = () => {
    setMoreOpen(false);
    closeMapContextPin();
    openHazardReporter(pin.coords);
  };

  const handleCopyCoords = async () => {
    const str = `${pin.coords[1].toFixed(6)}, ${pin.coords[0].toFixed(6)}`;
    try {
      await navigator.clipboard.writeText(str);
      pushToast('Coordenadas copiadas', str, 'slate');
    } catch {
      pushToast('Coordenadas', str, 'slate');
    }
    setMoreOpen(false);
  };

  // Clamp horizontally inside visible map viewport while preserving caret pointing straight at the pin
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const isDesktop = vw >= 1024;
  const cardWidth = Math.min(286, vw - 24);
  const halfCard = cardWidth / 2;
  const minCenterX = isDesktop ? 438 + halfCard : 12 + halfCard;
  const maxCenterX = vw - (isDesktop ? 64 : 12) - halfCard;

  const rawX = screenPos ? screenPos.x : isDesktop ? (438 + vw - 64) / 2 : vw / 2;
  const rawY = screenPos ? screenPos.y : isDesktop ? vh * 0.46 : vh * 0.34;
  const clampedX = Math.max(minCenterX, Math.min(maxCenterX, rawX));
  // Keep vertical top comfortably below top bar while hugging directly above the red pin
  const minAnchorY = isDesktop ? 185 : 190;
  const clampedY = Math.max(minAnchorY, Math.min(vh - 36, rawY));
  const caretOffsetPx = Math.max(-halfCard + 28, Math.min(halfCard - 28, rawX - clampedX));

  return (
    <div
      id="eixoverde-map-context-popup"
      data-pin-x={Math.round(rawX)}
      data-pin-y={Math.round(rawY)}
      style={{
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        width: `${cardWidth}px`,
        transform: 'translate(-50%, calc(-100% - 44px))',
      }}
      className="glass-panel pointer-events-auto fixed z-30 rounded-3xl px-4 pb-3.5 pt-6 text-center shadow-2xl transition-[opacity] duration-150"
    >
      {/* Top Floating Pin Badge */}
      <div className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-rose-500 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        {pin.loading ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin text-emerald-500" />
        ) : (
          <MapPin className="h-4.5 w-4.5 fill-rose-500/20 text-rose-500" />
        )}
      </div>

      {/* Top-Right Overflow "..." and Close Buttons */}
      <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-label="Mais opções para este local"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700/80 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setMoreOpen(false);
            closeMapContextPin();
          }}
          aria-label="Fechar popup do mapa"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Place Title & Subtitle */}
      <h3 className="font-display truncate px-4 text-[15px] font-extrabold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-0.5 truncate px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>

      {/* Primary Action Pills: Salvar & Rotas */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleSaveHere}
          className="flex items-center justify-center gap-1.5 rounded-full bg-slate-200/80 py-2 text-xs font-extrabold text-slate-800 transition-colors hover:bg-slate-300/80 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
        >
          <Star className="h-3.5 w-3.5 text-amber-500" />
          Salvar
        </button>
        <button
          type="button"
          onClick={handleRouteHere}
          className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 transition-colors hover:bg-emerald-500"
        >
          <Navigation className="h-3.5 w-3.5 fill-current" />
          Rotas
        </button>
      </div>

      {/* Compact Overflow Menu ("...") */}
      {moreOpen && (
        <div className="mt-2.5 space-y-1 border-t border-slate-200/80 pt-2.5 text-left dark:border-slate-700/70">
          <button
            type="button"
            onClick={handleSetAsOrigin}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            Definir como Ponto A (Partida)
          </button>
          <button
            type="button"
            onClick={handleReportHazard}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Reportar perigo aqui
          </button>
          <button
            type="button"
            onClick={() => void handleCopyCoords()}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Copy className="h-3.5 w-3.5 text-sky-500" />
            Copiar coordenadas
          </button>
        </div>
      )}

      {/* Downward Speech-Bubble Caret Pointing Straight at the Marked Red Pin */}
      <span
        aria-hidden="true"
        style={{ left: `calc(50% + ${caretOffsetPx}px)` }}
        className="pointer-events-none absolute -bottom-2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/95"
      />
    </div>
  );
}
