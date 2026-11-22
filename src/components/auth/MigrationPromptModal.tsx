import { Activity, Bookmark, Bike, CloudUpload, MapPin, AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function MigrationPromptModal() {
  const open = useAppStore((s) => s.migrationPromptOpen);
  const summary = useAppStore((s) => s.localMigrationSummary);
  const setMigrationPromptOpen = useAppStore((s) => s.setMigrationPromptOpen);
  const migrateLocalToCloud = useAppStore((s) => s.migrateLocalToCloud);

  if (!open || !summary || summary.total === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={() => setMigrationPromptOpen(false)}
    >
      <div
        id="eixoverde-migration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eixoverde-migration-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CloudUpload className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="eixoverde-migration-title"
                className="font-display text-base font-extrabold text-slate-900 dark:text-white"
              >
                Sincronizar Dados deste Dispositivo?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encontramos registros locais criados antes do seu login
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMigrationPromptOpen(false)}
            aria-label="Fechar migração"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100/90 px-3 py-2 dark:bg-slate-800/80">
            <Bookmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              <strong className="font-mono-num">{summary.routes}</strong> rotas salvas
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-100/90 px-3 py-2 dark:bg-slate-800/80">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              <strong className="font-mono-num">{summary.places}</strong> locais salvos
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-100/90 px-3 py-2 dark:bg-slate-800/80">
            <Bike className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              <strong className="font-mono-num">{summary.vehicles}</strong> veículos
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-100/90 px-3 py-2 dark:bg-slate-800/80">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              <strong className="font-mono-num">{summary.hazards}</strong> alertas
            </span>
          </div>
          {summary.rides > 0 && (
            <div className="col-span-2 flex items-center gap-2 rounded-xl bg-slate-100/90 px-3 py-2 dark:bg-slate-800/80">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                <strong className="font-mono-num">{summary.rides}</strong> trajetos gravados
              </span>
            </div>
          )}
        </div>

        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          Seus registros locais serão mesclados com sua conta na nuvem sem apagar nenhum dado existente.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMigrationPromptOpen(false)}
            className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Agora não
          </button>
          <button
            id="eixoverde-migration-confirm-btn"
            type="button"
            onClick={() => void migrateLocalToCloud()}
            className="flex-1 rounded-2xl bg-emerald-600 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500"
          >
            Migrar para a Nuvem
          </button>
        </div>
      </div>
    </div>
  );
}
