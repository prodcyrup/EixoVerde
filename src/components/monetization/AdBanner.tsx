import { useEffect } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import {
  VIP_PRICE_LABEL,
  hideNativeAdBanner,
  showNativeAdBanner,
} from '../../mobile/monetizationBridge';
import { isNativeMobileApp } from '../../mobile/nativeBridge';
import { useAppStore } from '../../store/useAppStore';

interface AdBannerProps {
  placement?: 'explore' | 'preview';
}

/**
 * Compact 50px Ad Banner slot rendered ONLY inside Explore / Route Preview for free users.
 * NEVER rendered during live 3D handlebar navigation (`mode === 'navigate'`) or for VIP users.
 * On native Android/iOS triggers Google AdMob banner via `@capacitor-community/admob`;
 * on Web renders a clean, lightweight sponsor/VIP upgrade strip.
 */
export function AdBanner({ placement = 'explore' }: AdBannerProps) {
  const isPremium = useAppStore((s) => s.isPremium);
  const mode = useAppStore((s) => s.mode);
  const setVipModalOpen = useAppStore((s) => s.setVipModalOpen);

  useEffect(() => {
    if (!isNativeMobileApp()) return;
    if (isPremium || mode === 'navigate') {
      void hideNativeAdBanner();
      return;
    }
    void showNativeAdBanner();
    return () => {
      void hideNativeAdBanner();
    };
  }, [isPremium, mode]);

  if (isPremium || mode === 'navigate') return null;

  return (
    <div
      id={`eixoverde-ad-banner-${placement}`}
      data-ad-banner="true"
      className="flex min-h-[52px] items-center justify-between gap-2.5 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-amber-50/50 px-3 py-2 shadow-xs dark:border-slate-700/70 dark:from-slate-800/85 dark:via-slate-800/75 dark:to-amber-950/25"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-slate-200/80 px-1 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              Anúncio
            </span>
            <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
              Apoie o EixoVerde • Remova anúncios
            </span>
          </div>
          <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
            VIP vitalício ({VIP_PRICE_LABEL}) • 27 capitais offline + garagem ilimitada
          </p>
        </div>
      </div>

      <button
        id={`eixoverde-ad-remove-btn-${placement}`}
        type="button"
        onClick={() => setVipModalOpen(true)}
        className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1.5 text-[10px] font-extrabold text-slate-950 shadow-xs transition-colors hover:bg-amber-400"
      >
        <Crown className="h-3 w-3" />
        VIP {VIP_PRICE_LABEL}
      </button>
    </div>
  );
}
