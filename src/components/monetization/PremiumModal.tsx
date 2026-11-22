import {
  Ban,
  Bike,
  CheckCircle2,
  Crown,
  Download,
  FileDown,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  FREE_CUSTOM_VEHICLE_LIMIT,
  FREE_GPX_EXPORT_LIMIT,
  FREE_OFFLINE_CITY_LIMIT,
  VIP_LIFETIME_SKU,
  VIP_PRICE_LABEL,
} from '../../mobile/monetizationBridge';
import { useAppStore } from '../../store/useAppStore';

export function PremiumModal() {
  const open = useAppStore((s) => s.vipModalOpen);
  const setVipModalOpen = useAppStore((s) => s.setVipModalOpen);
  const isPremium = useAppStore((s) => s.isPremium);
  const premiumSince = useAppStore((s) => s.premiumSince);
  const vipLoading = useAppStore((s) => s.vipLoading);
  const activateVipLifetime = useAppStore((s) => s.activateVipLifetime);
  const restoreVipPurchase = useAppStore((s) => s.restoreVipPurchase);

  if (!open) return null;

  const benefits = [
    {
      icon: Ban,
      title: 'Zero Anúncios para Sempre',
      desc: 'Interface 100% limpa em todos os painéis — sem banners ou interrupções.',
    },
    {
      icon: Download,
      title: 'Cache Offline nas 27 Capitais',
      desc: `Baixe a malha de ciclovias e estações de quantas capitais quiser (grátis: ${FREE_OFFLINE_CITY_LIMIT} capital).`,
    },
    {
      icon: Bike,
      title: 'Garagem Personalizada Ilimitada',
      desc: `Cadastre todos os seus patinetes, e-bikes e bicicletas (grátis: ${FREE_CUSTOM_VEHICLE_LIMIT} veículo personalizado).`,
    },
    {
      icon: FileDown,
      title: 'Exportação GPX 1.1 Ilimitada',
      desc: `Exporte todas as rotas e trajetos sem limite mensal (grátis: até ${FREE_GPX_EXPORT_LIMIT} exportações).`,
    },
    {
      icon: Crown,
      title: 'Selo Dourado VIP na Comunidade',
      desc: 'Destaque exclusivo no seu perfil e nas rotas que você publicar.',
    },
  ];

  return (
    <div
      id="eixoverde-vip-modal"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 sm:p-4 backdrop-blur-xs"
      onClick={() => setVipModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-amber-500/35 bg-white shadow-2xl dark:border-amber-500/30 dark:bg-slate-900"
      >
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 px-5 py-5 text-white">
          <button
            id="eixoverde-vip-close-btn"
            type="button"
            onClick={() => setVipModalOpen(false)}
            aria-label="Fechar EixoVerde VIP"
            className="absolute top-3.5 right-3.5 rounded-xl p-1.5 text-emerald-200/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
            <Crown className="h-3 w-3" />
            Pagamento Único • Vitalício
          </div>

          <h2 className="font-display mt-2 text-xl font-extrabold tracking-tight">
            EixoVerde VIP
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-emerald-100/85">
            Apoie o projeto independente das ciclovias do Brasil e desbloqueie todos os recursos extras para sempre — sem mensalidade.
          </p>

          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="font-mono-num text-3xl font-extrabold text-amber-300">
              {VIP_PRICE_LABEL}
            </span>
            <span className="text-xs font-semibold text-emerald-200/80">
              preço de lançamento • compra única
            </span>
          </div>
        </div>

        {/* Benefits List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-5 ev-scroll">
          {isPremium && (
            <div
              id="eixoverde-vip-active-banner"
              className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/35 bg-emerald-500/12 p-3 text-emerald-800 dark:text-emerald-200"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs">
                <div className="font-extrabold">EixoVerde VIP Ativo!</div>
                <div className="text-[11px] opacity-85">
                  Obrigado por apoiar o projeto
                  {premiumSince
                    ? ` desde ${new Date(premiumSince).toLocaleDateString('pt-BR')}`
                    : ''}
                  . Todos os benefícios estão liberados.
                </div>
              </div>
            </div>
          )}

          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/55"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {b.title}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                    {b.desc}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Navegação 3D, voz PT-BR, malha das 27 capitais e alertas comunitários continuam <strong>100% gratuitos</strong>.
            </span>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="space-y-2 border-t border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/90">
          {!isPremium ? (
            <button
              id="eixoverde-vip-purchase-btn"
              type="button"
              disabled={vipLoading}
              onClick={() => void activateVipLifetime()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {vipLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Desbloquear EixoVerde VIP • {VIP_PRICE_LABEL}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVipModalOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-500"
            >
              Continuar Explorando
            </button>
          )}

          <div className="flex items-center justify-between px-1 text-[11px]">
            <button
              id="eixoverde-vip-restore-btn"
              type="button"
              disabled={vipLoading}
              onClick={() => void restoreVipPurchase()}
              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar compra
            </button>
            <span className="font-mono-num text-[10px] text-slate-400">
              SKU: {VIP_LIFETIME_SKU}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
