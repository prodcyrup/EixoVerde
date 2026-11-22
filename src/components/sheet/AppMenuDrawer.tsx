import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bike,
  Bookmark,
  CheckCircle2,
  Cloud,
  CloudOff,
  Crown,
  Download,
  Globe2,
  HardDrive,
  Layers,
  Loader2,
  LogOut,
  MapPin,
  Moon,
  RefreshCw,
  Satellite,
  ShieldCheck,
  ShoppingBag,
  Star,
  Sun,
  Trash2,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { hasSupabaseConfig } from '../../config/providers';
import { VIP_PRICE_LABEL } from '../../mobile/monetizationBridge';
import { selectActiveCapital, selectActiveVehicle, useAppStore } from '../../store/useAppStore';

export function AppMenuDrawer() {
  const open = useAppStore((s) => s.menuOpen);
  const setMenuOpen = useAppStore((s) => s.setMenuOpen);
  const setGarageOpen = useAppStore((s) => s.setGarageOpen);
  const setCompareOpen = useAppStore((s) => s.setCompareOpen);
  const setAuthModalOpen = useAppStore((s) => s.setAuthModalOpen);
  const setPrivacyModalOpen = useAppStore((s) => s.setPrivacyModalOpen);
  const setCityModalOpen = useAppStore((s) => s.setCityModalOpen);
  const setVipModalOpen = useAppStore((s) => s.setVipModalOpen);
  const setExploreTab = useAppStore((s) => s.setExploreTab);
  const clearActiveRoute = useAppStore((s) => s.clearActiveRoute);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const basemap = useAppStore((s) => s.basemap);
  const toggleBasemap = useAppStore((s) => s.toggleBasemap);
  const showBikeLanes = useAppStore((s) => s.showBikeLanes);
  const showPois = useAppStore((s) => s.showPois);
  const showStations = useAppStore((s) => s.showStations);
  const showHazards = useAppStore((s) => s.showHazards);
  const toggleLayer = useAppStore((s) => s.toggleLayer);
  const activeVehicle = useAppStore(selectActiveVehicle);
  const activeCapital = useAppStore(selectActiveCapital);
  const savedRoutes = useAppStore((s) => s.savedRoutes);
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const rideSessions = useAppStore((s) => s.rideSessions);
  const hazards = useAppStore((s) => s.hazards);
  const currentLocationPlace = useAppStore((s) => s.currentLocationPlace);

  const authUser = useAppStore((s) => s.authUser);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const pendingSyncCount = useAppStore((s) => s.pendingSyncCount);
  const syncError = useAppStore((s) => s.syncError);
  const syncNow = useAppStore((s) => s.syncNow);
  const signOut = useAppStore((s) => s.signOut);
  const deleteAccount = useAppStore((s) => s.deleteAccount);
  const deleteAccountLoading = useAppStore((s) => s.deleteAccountLoading);
  const isPremium = useAppStore((s) => s.isPremium);

  const offlineCache = useAppStore((s) => s.offlineCache);
  const offlineCacheLoading = useAppStore((s) => s.offlineCacheLoading);
  const warmOfflineCache = useAppStore((s) => s.warmOfflineCache);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [wipeLocalOnDelete, setWipeLocalOnDelete] = useState(false);

  if (!open) return null;

  const supabaseEnabled = hasSupabaseConfig();
  const locationParts = [currentLocationPlace?.district, currentLocationPlace?.city].filter(Boolean);
  const locationLabel =
    locationParts.length > 0
      ? locationParts.join(', ')
      : currentLocationPlace?.city || activeCapital.label;
  const versionSubtitle = `${locationLabel} • v${__APP_VERSION__}`;

  const getSyncBadgeMeta = () => {
    if (!supabaseEnabled) {
      return {
        label: 'Modo Local',
        cls: 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      };
    }
    if (!authUser) {
      return {
        label: 'Visitante',
        cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
      };
    }
    if (syncStatus === 'syncing') {
      return {
        label: 'Sincronizando...',
        cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
      };
    }
    if (syncStatus === 'offline') {
      return {
        label: pendingSyncCount > 0 ? `Offline (${pendingSyncCount})` : 'Offline',
        cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
      };
    }
    if (syncStatus === 'error') {
      return {
        label: 'Atenção',
        cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
      };
    }
    return {
      label: 'Sincronizado',
      cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    };
  };

  const badgeMeta = getSyncBadgeMeta();

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/55 backdrop-blur-xs" onClick={() => setMenuOpen(false)}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-slate-900"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}icons/eixoverde-icon.svg`}
              alt={BRAND.name}
              className="h-9 w-9 shrink-0 rounded-xl shadow-sm"
            />
            <div className="min-w-0">
              <div className="font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {BRAND.name}
              </div>
              <div className="truncate text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {versionSubtitle}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links & Cloud Account Card */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 ev-scroll">
          {/* Phase 2 Account & Cloud Sync Card */}
          <div
            id="eixoverde-account-card"
            className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3.5 dark:border-slate-800 dark:bg-slate-800/60"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {authUser ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xs font-extrabold text-white">
                    {(authUser.displayName || authUser.email || 'E')[0].toUpperCase()}
                  </span>
                ) : supabaseEnabled ? (
                  <Cloud className="h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <CloudOff className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-xs font-extrabold text-slate-900 dark:text-white">
                    {authUser
                      ? authUser.displayName || authUser.email
                      : supabaseEnabled
                        ? 'Conta EixoVerde Cloud'
                        : 'Armazenamento Local'}
                  </div>
                  {authUser && (
                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {authUser.email}
                    </div>
                  )}
                </div>
              </div>

              <span
                id="eixoverde-sync-status"
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${badgeMeta.cls}`}
              >
                {syncStatus === 'syncing' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : authUser && syncStatus === 'synced' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : null}
                {badgeMeta.label}
              </span>
            </div>

            {!supabaseEnabled && (
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Suas rotas, locais e veículos ficam salvos offline neste dispositivo.
              </p>
            )}

            {supabaseEnabled && !authUser && (
              <div className="mt-2.5 space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Entre para sincronizar rotas, locais salvos, garagem e alertas comunitários.
                </p>
                <button
                  id="eixoverde-auth-open-btn"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-500"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Entrar ou Criar Conta
                </button>
              </div>
            )}

            {supabaseEnabled && authUser && (
              <div className="mt-2.5 space-y-2">
                {syncError && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {syncError}
                  </p>
                )}
                {pendingSyncCount > 0 && !syncError && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    {pendingSyncCount} alteração(ões) aguardando conexão
                  </p>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    id="eixoverde-sync-now-btn"
                    type="button"
                    disabled={syncStatus === 'syncing'}
                    onClick={() => void syncNow()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-500/40 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </button>
                  <button
                    id="eixoverde-signout-btn"
                    type="button"
                    onClick={() => void signOut()}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sair
                  </button>
                </div>

                {/* Phase 5: Store Compliance In-App Account Deletion (Apple 5.1.1(v) / Google Play Data Safety / LGPD) */}
                {!confirmDeleteOpen ? (
                  <button
                    id="eixoverde-delete-account-open-btn"
                    type="button"
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="flex w-full items-center justify-center gap-1 pt-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                    Excluir minha conta e dados na nuvem
                  </button>
                ) : (
                  <div
                    id="eixoverde-delete-account-confirm-box"
                    className="mt-2 space-y-2 rounded-xl border border-rose-500/35 bg-rose-500/10 p-2.5 text-[11px]"
                  >
                    <div className="font-extrabold text-rose-700 dark:text-rose-300">
                      Excluir conta permanentemente?
                    </div>
                    <p className="leading-snug text-rose-700/90 dark:text-rose-200/90">
                      Seus dados sincronizados na nuvem (rotas, locais, garagem e avaliações) serão apagados imediatamente.
                    </p>
                    <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                      <input
                        id="eixoverde-delete-wipe-local"
                        type="checkbox"
                        checked={wipeLocalOnDelete}
                        onChange={(e) => setWipeLocalOnDelete(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>Apagar também dados salvos neste aparelho</span>
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        id="eixoverde-delete-account-cancel-btn"
                        type="button"
                        disabled={deleteAccountLoading}
                        onClick={() => {
                          setConfirmDeleteOpen(false);
                          setWipeLocalOnDelete(false);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        Cancelar
                      </button>
                      <button
                        id="eixoverde-delete-account-confirm-btn"
                        type="button"
                        disabled={deleteAccountLoading}
                        onClick={async () => {
                          const res = await deleteAccount(wipeLocalOnDelete);
                          if (res.ok) {
                            setConfirmDeleteOpen(false);
                            setWipeLocalOnDelete(false);
                          }
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-600 py-1.5 text-[11px] font-extrabold text-white shadow-xs hover:bg-rose-500 disabled:opacity-60"
                      >
                        {deleteAccountLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Confirmar Exclusão
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phase 7: EixoVerde VIP Lifetime Card (R$ 9,90) */}
          <button
            id="eixoverde-menu-vip-btn"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setVipModalOpen(true);
            }}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
              isPremium
                ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/15 to-emerald-500/10 dark:border-amber-500/40'
                : 'border-amber-500/35 bg-gradient-to-r from-amber-500/12 via-amber-500/5 to-transparent hover:border-amber-500/60'
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Crown className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {isPremium ? 'EixoVerde VIP Ativo' : 'EixoVerde VIP'}
                </span>
                <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950">
                  {isPremium ? 'VITALÍCIO' : VIP_PRICE_LABEL}
                </span>
              </div>
              <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {isPremium
                  ? 'Zero anúncios • 27 capitais offline'
                  : 'Zero anúncios + 27 capitais offline • pagamento único'}
              </div>
            </div>
          </button>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setGarageOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-emerald-500/10 px-3.5 py-3 text-left transition-colors hover:bg-emerald-500/15"
            >
              <Bike className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">Minha Garagem</div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{activeVehicle.name}</div>
              </div>
            </button>

            <button
              id="eixoverde-menu-city-btn"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCityModalOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Globe2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">Explorar Brasil • 27 Capitais</div>
                <div className="truncate text-[11px] text-slate-400">
                  {activeCapital.label} • {activeCapital.totalKm.toString().replace('.', ',')} km de ciclovias
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                clearActiveRoute();
                setExploreTab('routes');
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Bookmark className="h-4.5 w-4.5 text-emerald-600" />
              <span className="flex-1 text-sm font-semibold">Rotas</span>
              <span className="font-mono-num rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {savedRoutes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                clearActiveRoute();
                setExploreTab('places');
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Star className="h-4.5 w-4.5 text-amber-500" />
              <span className="flex-1 text-sm font-semibold">Meus Locais</span>
              <span className="font-mono-num rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {savedPlaces.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                clearActiveRoute();
                setExploreTab('rides');
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Activity className="h-4.5 w-4.5 text-emerald-500" />
              <span className="flex-1 text-sm font-semibold">Meus Trajetos</span>
              <span className="font-mono-num rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {rideSessions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCompareOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ShoppingBag className="h-4.5 w-4.5 text-sky-600" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Comparar &amp; Comprar</div>
                <div className="text-[11px] text-slate-400">Patinetes, E-Bikes &amp; custo-benefício</div>
              </div>
            </button>

            <button
              id="eixoverde-privacy-open-btn"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setPrivacyModalOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Privacidade &amp; Termos (LGPD)</div>
                <div className="text-[11px] text-slate-400">Transparência de dados &amp; segurança</div>
              </div>
            </button>
          </div>

          {/* Map Layer Toggles */}
          <div>
            <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Camadas &amp; Aparência
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleLayer('lanes')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  Malha de Ciclovias {activeCapital.stateCode}
                </span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${showBikeLanes ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${showBikeLanes ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              <button
                id="eixoverde-stations-toggle"
                type="button"
                onClick={() => toggleLayer('stations')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2.5">
                  <Zap className="h-4 w-4 text-orange-500" />
                  Estações Tembici &amp; JET
                </span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${showStations ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${showStations ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleLayer('pois')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-sky-600" />
                  Bicicletários &amp; Oficinas
                </span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${showPois ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${showPois ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleLayer('hazards')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Alertas de Perigo ({hazards.length})
                </span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${showHazards ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${showHazards ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              <button
                type="button"
                onClick={toggleBasemap}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2.5">
                  <Satellite className="h-4 w-4 text-slate-500" />
                  Modo Satélite
                </span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${basemap === 'satellite' ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${basemap === 'satellite' ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
                  Tema {theme === 'dark' ? 'Escuro' : 'Claro'}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Alternar</span>
              </button>
            </div>
          </div>

          {/* 1-Tap Offline Capital Cache Card */}
          <div
            id="eixoverde-offline-cache-card"
            className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3.5 dark:border-slate-800 dark:bg-slate-800/60"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Cache Offline {activeCapital.stateCode}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  offlineCache.ready
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {offlineCache.ready ? 'Pronto Offline' : 'Não baixado'}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Salva a malha cicloviária de {activeCapital.name}, estações e bicicletários para circular sem internet.
            </p>
            <button
              id="eixoverde-warm-offline-btn"
              type="button"
              disabled={offlineCacheLoading}
              onClick={() => void warmOfflineCache()}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 py-2 text-xs font-extrabold text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:opacity-60 dark:text-emerald-300"
            >
              {offlineCacheLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Salvando dados de {activeCapital.name}...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  {offlineCache.ready
                    ? `Atualizar Cache ${activeCapital.stateCode}`
                    : `Baixar Mapa Offline ${activeCapital.stateCode}`}
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
