import { useMemo, useState } from 'react';
import { CheckCircle2, Compass, Globe2, MapPin, Navigation, Search, X } from 'lucide-react';
import {
  BRAZIL_CAPITALS,
  BRAZIL_REGIONS,
  type BrazilRegion,
} from '../../data/brazilCities';
import { selectActiveCapital, useAppStore } from '../../store/useAppStore';

export function CitySelectorModal() {
  const open = useAppStore((s) => s.cityModalOpen);
  const setCityModalOpen = useAppStore((s) => s.setCityModalOpen);
  const selectCity = useAppStore((s) => s.selectCity);
  const detectCityFromGps = useAppStore((s) => s.detectCityFromGps);
  const activeCapital = useAppStore(selectActiveCapital);

  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<BrazilRegion | 'all'>('all');
  const [detectingGps, setDetectingGps] = useState(false);

  const totalBrazilKm = useMemo(
    () => Math.round(BRAZIL_CAPITALS.reduce((acc, c) => acc + c.totalKm, 0)),
    []
  );

  const filteredCapitals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRAZIL_CAPITALS.filter((c) => {
      if (regionFilter !== 'all' && c.region !== regionFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.stateCode.toLowerCase().includes(q) ||
        c.stateName.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.highlights.toLowerCase().includes(q)
      );
    });
  }, [query, regionFilter]);

  if (!open) return null;

  const regionsToRender =
    regionFilter === 'all' ? BRAZIL_REGIONS : ([regionFilter] as BrazilRegion[]);

  return (
    <div
      id="eixoverde-city-modal"
      className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/65 p-3 sm:p-4 backdrop-blur-xs"
      onClick={() => setCityModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Globe2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                Explorar Brasil • 27 Capitais
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {totalBrazilKm.toLocaleString('pt-BR')} km de ciclovias mapeadas • Ativa:{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {activeCapital.label}
                </strong>
              </p>
            </div>
          </div>
          <button
            id="eixoverde-city-close-btn"
            type="button"
            onClick={() => setCityModalOpen(false)}
            aria-label="Fechar seletor de capitais"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search, GPS Auto-Detect & Region Filters */}
        <div className="space-y-2.5 border-b border-slate-200/80 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="eixoverde-city-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar capital, UF ou parque (ex: São Paulo, Rio, Fortaleza, Orla...)"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
              />
            </div>
            <button
              id="eixoverde-city-gps-btn"
              type="button"
              disabled={detectingGps}
              onClick={async () => {
                setDetectingGps(true);
                await detectCityFromGps();
                setDetectingGps(false);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2 text-xs font-extrabold text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:opacity-60 dark:text-emerald-300"
            >
              <Navigation className="h-3.5 w-3.5" />
              {detectingGps ? 'Localizando...' : 'Detectar pelo GPS'}
            </button>
          </div>

          {/* 5 Region Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 ev-scroll">
            <button
              type="button"
              onClick={() => setRegionFilter('all')}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors ${
                regionFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Todas (27)
            </button>
            {BRAZIL_REGIONS.map((reg) => {
              const count = BRAZIL_CAPITALS.filter((c) => c.region === reg).length;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setRegionFilter(reg)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors ${
                    regionFilter === reg
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {reg} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Region-Grouped Capital Cards */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 ev-scroll">
          {filteredCapitals.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
              Nenhuma capital encontrada para &ldquo;{query}&rdquo;.
            </div>
          ) : (
            regionsToRender.map((region) => {
              const regionCities = filteredCapitals.filter((c) => c.region === region);
              if (regionCities.length === 0) return null;
              return (
                <section key={region} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <Compass className="h-3.5 w-3.5 text-emerald-500" />
                      Região {region}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {regionCities.length} {regionCities.length === 1 ? 'capital' : 'capitais'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {regionCities.map((cap) => {
                      const isSelected = cap.slug === activeCapital.slug;
                      return (
                        <button
                          key={cap.slug}
                          type="button"
                          data-city-slug={cap.slug}
                          onClick={() => void selectCity(cap.slug, true)}
                          className={`flex flex-col justify-between rounded-2xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40 dark:bg-emerald-500/15'
                              : 'border-slate-200/80 bg-slate-50/70 hover:border-emerald-500/40 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <MapPin
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    isSelected
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-400'
                                  }`}
                                />
                                <span className="truncate text-xs font-extrabold text-slate-900 dark:text-white">
                                  {cap.name}
                                </span>
                                <span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                  {cap.stateCode}
                                </span>
                              </div>
                              <div className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                                {cap.highlights}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <span className="font-mono-num rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                {cap.totalKm.toString().replace('.', ',')} km
                              </span>
                              {isSelected && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Ativa
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
