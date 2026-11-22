import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bike,
  ChevronDown,
  ChevronUp,
  Layers,
  LocateFixed,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  Satellite,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { useFullscreen } from '../../hooks/useFullscreen';
import { selectActiveCapital, selectActiveVehicle, useAppStore } from '../../store/useAppStore';
import { RoutePreviewPanel } from '../planner/RoutePreviewPanel';
import { ExplorePanel } from '../search/ExplorePanel';

type MobileSheetSnap = 'peek' | 'half' | 'full';

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

function getSnapHeightPx(snap: MobileSheetSnap): number {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  if (snap === 'peek') return 112;
  if (snap === 'full') return Math.round(vh * 0.84);
  return Math.round(vh * 0.48);
}

export function AdaptiveShell() {
  const isDesktop = useIsDesktop();
  const [sheetSnap, setSheetSnap] = useState<MobileSheetSnap>('half');
  const [dragHeightPx, setDragHeightPx] = useState<number | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<{
    active: boolean;
    pointerId: number;
    startY: number;
    startHeight: number;
    lastY: number;
    lastTime: number;
    velocityY: number;
    moved: boolean;
  } | null>(null);

  const mode = useAppStore((s) => s.mode);
  const theme = useAppStore((s) => s.theme);
  const basemap = useAppStore((s) => s.basemap);
  const showBikeLanes = useAppStore((s) => s.showBikeLanes);
  const mapPickTarget = useAppStore((s) => s.mapPickTarget);
  const activeVehicle = useAppStore(selectActiveVehicle);
  const activeCapital = useAppStore(selectActiveCapital);
  const authUser = useAppStore((s) => s.authUser);
  const syncStatus = useAppStore((s) => s.syncStatus);

  const showSyncDot = Boolean(authUser) || syncStatus === 'syncing' || syncStatus === 'offline' || syncStatus === 'error';
  const syncDotColor =
    syncStatus === 'error'
      ? 'bg-rose-500'
      : syncStatus === 'offline'
        ? 'bg-amber-400'
        : syncStatus === 'syncing'
          ? 'bg-sky-400 animate-pulse'
          : 'bg-emerald-400';

  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toggleBasemap = useAppStore((s) => s.toggleBasemap);
  const toggleLayer = useAppStore((s) => s.toggleLayer);
  const setMenuOpen = useAppStore((s) => s.setMenuOpen);
  const setGarageOpen = useAppStore((s) => s.setGarageOpen);
  const setMapPickTarget = useAppStore((s) => s.setMapPickTarget);
  const openHazardReporter = useAppStore((s) => s.openHazardReporter);
  const flyTo = useAppStore((s) => s.flyTo);
  const locateCurrentPosition = useAppStore((s) => s.locateCurrentPosition);

  // Snap scrollable sidebar & mobile bottom sheet cleanly to top when entering/leaving Route Preview
  useEffect(() => {
    desktopScrollRef.current?.scrollTo({ top: 0 });
    mobileScrollRef.current?.scrollTo({ top: 0 });
  }, [mode]);

  const compactVehicleLabel = activeVehicle.name.split(' ')[0];

  const handleLocateMe = async () => {
    const found = await locateCurrentPosition({ silent: false, flyToUser: false });
    if (found) {
      flyTo(found.coords, 15.6);
    } else {
      flyTo(activeCapital.center, activeCapital.zoom);
    }
  };

  const pickLabels: Record<string, string> = {
    origin: 'Toque no mapa para definir a origem',
    dest: 'Toque no mapa para escolher o destino',
    via: 'Toque no mapa para adicionar uma parada',
    hazard: 'Toque no mapa onde está o perigo',
    save_place: 'Toque no mapa para salvar um local favorito',
    save_home: 'Toque no mapa para definir sua Casa',
    save_work: 'Toque no mapa para definir seu Trabalho',
  };

  // Finger-responsive pointer drag handlers for the mobile bottom sheet handle
  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const startH = dragHeightPx ?? getSnapHeightPx(sheetSnap);
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: startH,
      lastY: e.clientY,
      lastTime: performance.now(),
      velocityY: 0,
      moved: false,
    };
    setDragHeightPx(startH);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || !d.active || d.pointerId !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.lastTime);
    d.velocityY = (e.clientY - d.lastY) / dt; // px/ms (negative = swiping up)
    d.lastY = e.clientY;
    d.lastTime = now;

    const deltaY = d.startY - e.clientY;
    if (Math.abs(deltaY) > 6) d.moved = true;

    const minH = 92;
    const maxH = Math.round(window.innerHeight * 0.88);
    const nextH = Math.max(minH, Math.min(maxH, d.startHeight + deltaY));
    setDragHeightPx(nextH);
  };

  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || !d.active || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }

    if (!d.moved) {
      // Quick tap fallback cycles cleanly
      setDragHeightPx(null);
      setSheetSnap((s) => (s === 'peek' ? 'half' : s === 'half' ? 'full' : 'peek'));
      return;
    }

    const vh = window.innerHeight || 800;
    const finalH = dragHeightPx ?? d.startHeight;
    // Account for swipe fling velocity
    const projectedH = finalH - d.velocityY * 140;

    let nextSnap: MobileSheetSnap = 'half';
    if (projectedH < vh * 0.27) nextSnap = 'peek';
    else if (projectedH > vh * 0.65) nextSnap = 'full';

    setSheetSnap(nextSnap);
    setDragHeightPx(null);
  };

  const isDragging = dragHeightPx !== null;
  const sheetStyleHeight = isDragging ? `${dragHeightPx}px` : undefined;
  const sheetHeightClass = isDragging
    ? ''
    : sheetSnap === 'peek'
      ? 'h-[112px]'
      : sheetSnap === 'full'
        ? 'h-[84vh]'
        : 'h-[48vh]';

  return (
    <>
      {/* TOP PICK-ON-MAP GUIDANCE PILL */}
      {mapPickTarget && (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center px-4 lg:top-5">
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-2xl">
            <span>{pickLabels[mapPickTarget] ?? 'Toque no mapa'}</span>
            <button
              type="button"
              onClick={() => setMapPickTarget(null)}
              className="rounded-full bg-white/20 p-1 hover:bg-white/30"
              aria-label="Cancelar seleção"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE FLOATING TOP BAR (< lg) — single-mounted only below 1024px */}
      {!isDesktop && (
        <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-1.5 px-2.5 py-2.5 safe-top">
          <button
            id="eixoverde-mobile-menu-btn"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu do EixoVerde"
            className="glass-panel pointer-events-auto flex shrink-0 select-none items-center gap-1.5 rounded-2xl px-2 py-1.5 shadow-lg transition-transform active:scale-[0.97]"
          >
            <Menu className="h-4.5 w-4.5 shrink-0 text-slate-700 dark:text-slate-200" />
            <span className="relative h-6 w-6 shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}icons/eixoverde-icon.svg`}
                alt=""
                draggable={false}
                className="h-6 w-6 rounded-lg"
              />
              {showSyncDot && (
                <span
                  id="eixoverde-shell-sync-dot"
                  data-testid="eixoverde-shell-sync-dot"
                  className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${syncDotColor}`}
                />
              )}
            </span>
            <span className="font-display whitespace-nowrap pr-0.5 text-[13px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              {BRAND.name}
            </span>
          </button>

          <div className="pointer-events-auto flex min-w-0 items-center gap-1">
            <button
              id="eixoverde-garage-btn"
              type="button"
              onClick={() => setGarageOpen(true)}
              title={activeVehicle.name}
              className="glass-panel flex min-w-0 max-w-[104px] select-none items-center gap-1 rounded-2xl px-2.5 py-2 text-xs font-bold text-slate-800 shadow-lg dark:text-slate-100 min-[390px]:max-w-[118px]"
            >
              {activeVehicle.isElectric ? (
                <Zap className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Bike className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
              )}
              <span className="truncate">{compactVehicleLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              className="glass-panel flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-slate-700 shadow-lg dark:text-slate-100"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="glass-panel flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-slate-700 shadow-lg dark:text-slate-100"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
      )}

      {/* DESKTOP FLOATING LEFT SIDEBAR — single-mounted only >= 1024px */}
      {isDesktop && (
        <aside className="glass-panel fixed bottom-4 left-4 top-4 z-20 flex w-[416px] flex-col overflow-hidden rounded-3xl shadow-2xl">
          {/* Desktop Top Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 px-3 py-2.5 dark:border-slate-800/80">
            <button
              id="eixoverde-desktop-menu-btn"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu do EixoVerde"
              className="flex min-w-0 flex-1 select-none items-center gap-2 rounded-2xl px-1.5 py-1 text-left transition-colors hover:bg-slate-100/80 active:scale-[0.99] dark:hover:bg-slate-800/70"
            >
              <Menu className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-300" />
              <span className="relative h-7.5 w-7.5 shrink-0">
                <img
                  src={`${import.meta.env.BASE_URL}icons/eixoverde-icon.svg`}
                  alt=""
                  draggable={false}
                  className="h-7.5 w-7.5 rounded-xl shadow-xs"
                />
                {showSyncDot && (
                  <span
                    id="eixoverde-shell-sync-dot"
                    data-testid="eixoverde-shell-sync-dot"
                    className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${syncDotColor}`}
                  />
                )}
              </span>
              <div className="min-w-0">
                <h1 className="font-display truncate text-sm font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                  {BRAND.name}
                </h1>
                <p className="truncate text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  Ciclovias &amp; Mobilidade
                </p>
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-1">
              <button
                id="eixoverde-garage-btn"
                type="button"
                onClick={() => setGarageOpen(true)}
                title={`Minha Garagem: ${activeVehicle.name}`}
                className="flex max-w-[106px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:border-emerald-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {activeVehicle.isElectric ? (
                  <Zap className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Bike className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                )}
                <span className="truncate">{compactVehicleLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                title="Alternar tema claro / escuro"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-emerald-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Desktop Scrollable Content */}
          <div ref={desktopScrollRef} className="flex-1 overflow-y-auto p-4 ev-scroll">
            {mode === 'preview' ? <RoutePreviewPanel /> : <ExplorePanel />}
          </div>
        </aside>
      )}

      {/* FLOATING RIGHT MAP CONTROLS (All Devices) */}
      <div className="fixed right-3 top-20 z-20 flex flex-col gap-2 lg:right-4 lg:top-4">
        <button
          id="eixoverde-gps-btn"
          type="button"
          onClick={() => void handleLocateMe()}
          title="Minha localização (GPS)"
          className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl text-slate-800 shadow-lg transition-colors hover:text-emerald-600 dark:text-slate-100"
        >
          <LocateFixed className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => toggleLayer('lanes')}
          title="Mostrar/ocultar malha de ciclovias"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg backdrop-blur-xl transition-colors ${
            showBikeLanes
              ? 'bg-emerald-600 text-white'
              : 'glass-panel text-slate-700 dark:text-slate-200'
          }`}
        >
          <Layers className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={toggleBasemap}
          title="Alternar mapa vetorial / satélite"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg backdrop-blur-xl transition-colors ${
            basemap === 'satellite'
              ? 'bg-sky-600 text-white'
              : 'glass-panel text-slate-700 dark:text-slate-200'
          }`}
        >
          <Satellite className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => openHazardReporter()}
          title="Reportar perigo na ciclovia"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-transform hover:scale-105"
        >
          <AlertTriangle className="h-5 w-5" />
        </button>
      </div>

      {/* DESKTOP COMPACT BIKE-LANE LEGEND (Bottom-Right) */}
      {isDesktop && (
        <div className="fixed bottom-8 right-4 z-20 flex flex-col items-end">
          {legendOpen && (
            <div className="glass-panel mb-2 space-y-1.5 rounded-2xl p-3 text-xs shadow-xl">
              <div className="font-bold text-slate-800 dark:text-slate-100">Legenda da Malha</div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-1.5 w-5 rounded-full bg-lime-600 dark:bg-lime-500" /> Ciclovia segregada
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-1.5 w-5 rounded-full bg-sky-500" /> Ciclofaixa
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-1.5 w-5 rounded-full border-t-2 border-dashed border-teal-500" /> Via baixa velocidade
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-1.5 w-5 rounded-full border-t-2 border-dashed border-amber-500" /> Trilha
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-1.5 w-5 rounded-full border-t-2 border-dashed border-red-500" /> Via proibida / expressa
              </div>
              <div className="mt-1 border-t border-slate-200/70 pt-1.5 dark:border-slate-700/70">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Estação {activeCapital.bikeShareBrand}
                </div>
                <div className="mt-1 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Hub Patinete JET
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            className="glass-panel rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-md hover:text-emerald-600 dark:text-slate-200"
          >
            {legendOpen ? 'Ocultar legenda' : 'Legenda das ciclovias'}
          </button>
        </div>
      )}

      {/* MOBILE ADAPTIVE BOTTOM SHEET (< lg) — Finger-Responsive Draggable Handle */}
      {!isDesktop && (
        <section
          style={sheetStyleHeight ? { height: sheetStyleHeight } : undefined}
          className={`glass-panel fixed inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl shadow-2xl safe-bottom ${
            isDragging ? 'transition-none' : 'transition-[height] duration-250 ease-out'
          } ${sheetHeightClass}`}
        >
          {/* Interactive Touch/Pointer Drag Handle */}
          <div
            role="slider"
            aria-label="Arraste para expandir ou recolher o painel"
            aria-valuemin={0}
            aria-valuemax={2}
            aria-valuenow={sheetSnap === 'peek' ? 0 : sheetSnap === 'half' ? 1 : 2}
            tabIndex={0}
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
            className="flex w-full cursor-grab touch-none select-none flex-col items-center justify-center pb-2 pt-3 active:cursor-grabbing"
          >
            <span className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {sheetSnap === 'full' ? (
                <>
                  <ChevronDown className="h-3 w-3" /> Arraste para ver o mapa
                </>
              ) : (
                <>
                  <ChevronUp className="h-3 w-3" /> {mode === 'preview' ? 'Detalhes da rota' : 'Explorar & rotas'}
                </>
              )}
            </span>
          </div>

          <div ref={mobileScrollRef} className="flex-1 overflow-y-auto px-3 pb-4 ev-scroll min-[390px]:px-4">
            {mode === 'preview' ? <RoutePreviewPanel /> : <ExplorePanel />}
          </div>
        </section>
      )}
    </>
  );
}
