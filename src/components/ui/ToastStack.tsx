import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function ToastStack() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      id="eixoverde-toast-stack"
      className="pointer-events-none fixed left-1/2 top-3 z-50 flex w-[calc(100%-24px)] max-w-sm -translate-x-1/2 flex-col gap-2 safe-top lg:left-[calc(50%+215px)]"
    >
      {toasts.map((t) => {
        const accent =
          t.tone === 'emerald'
            ? 'border-l-emerald-500'
            : t.tone === 'amber'
              ? 'border-l-amber-500'
              : t.tone === 'rose'
                ? 'border-l-rose-500'
                : 'border-l-slate-400';

        return (
          <div
            key={t.id}
            className={`glass-panel pointer-events-auto flex items-start justify-between gap-2 rounded-2xl border-l-4 ${accent} px-3.5 py-2.5 shadow-xl`}
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</div>
              {t.body && <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">{t.body}</div>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
