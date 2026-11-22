import { CheckCircle2, Lock, MapPin, ShieldCheck, Trash2, X } from 'lucide-react';
import { BRAND } from '../../config/brand';
import { useAppStore } from '../../store/useAppStore';

export function PrivacyPolicyModal() {
  const open = useAppStore((s) => s.privacyModalOpen);
  const setPrivacyModalOpen = useAppStore((s) => s.setPrivacyModalOpen);

  if (!open) return null;

  return (
    <div
      id="eixoverde-privacy-modal"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
      onClick={() => setPrivacyModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                Política de Privacidade &amp; Termos (LGPD)
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {BRAND.name} • Transparência de Dados &amp; Segurança
              </p>
            </div>
          </div>
          <button
            id="eixoverde-privacy-close-btn"
            type="button"
            onClick={() => setPrivacyModalOpen(false)}
            aria-label="Fechar política de privacidade"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 ev-scroll">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-extrabold">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              Compromisso de Privacidade (Lei nº 13.709/2018 — LGPD)
            </div>
            <p className="mt-1 text-[11px] opacity-90">
              O {BRAND.name} funciona de forma completa sem exigir cadastro obrigatório. Não vendemos, alugamos ou comercializamos seus dados pessoais com corretores de dados.
            </p>
          </div>

          <section className="space-y-1.5">
            <h3 className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              1. Uso de Localização (GPS em Primeiro Plano)
            </h3>
            <p>
              Quando você autoriza o acesso à localização ou inicia uma navegação/modo livre, o {BRAND.name} utiliza o GPS exclusivamente para:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Centralizar o mapa na sua posição atual e calcular rotas em ciclovias e vias seguras;</li>
              <li>Guiar curva a curva em tempo real, registrar telemetria de trajetos iniciados por você e posicionar alertas comunitários de obstáculos.</li>
            </ul>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              O aplicativo não rastreia sua localização oculta quando você não está utilizando o mapa ou gravando um trajeto ativo.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
              <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              2. Armazenamento Local, Conta Cloud &amp; Anúncios
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Modo Local (Offline-First):</strong> Rotas, locais favoritos, veículos da garagem e histórico de trajetos ficam armazenados diretamente no seu dispositivo (IndexedDB).
              </li>
              <li>
                <strong>Conta Cloud (Opcional):</strong> Caso você opte por criar uma conta com e-mail ou login social, sincronizamos de forma criptografada (HTTPS/TLS + Row-Level Security) seu perfil básico, veículos, locais salvos, rotas, avaliações comunitárias e histórico de trajetos entre seus aparelhos.
              </li>
              <li>
                <strong>Anúncios e EixoVerde VIP:</strong> Na versão gratuita, um banner compacto pode ser exibido fora da navegação ativa (Google AdMob no app nativo). O desbloqueio EixoVerde VIP remove todos os anúncios permanentemente.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              3. Exclusão Instantânea de Conta &amp; Dados (Direito do Titular)
            </h3>
            <p>
              Em conformidade com a LGPD, Google Play Data Safety e diretrizes da App Store, você pode excluir permanentemente sua conta e todos os dados sincronizados na nuvem a qualquer momento diretamente dentro do aplicativo:
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200">
              Menu lateral (☰) → Cartão da Conta → <span className="text-rose-600 dark:text-rose-400">Excluir minha conta</span> → Confirmar exclusão permanente.
            </div>
          </section>

          <section className="space-y-1">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
              4. Termos de Uso &amp; Segurança Viária
            </h3>
            <p>
              As sugestões de rotas, índices de segurança cicloviária e alertas comunitários têm caráter informativo. Mantenha sempre atenção plena ao trânsito, respeite o Código de Trânsito Brasileiro (CTB) e utilize equipamentos de proteção.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Conformidade LGPD • Google Play • App Store
          </span>
          <button
            id="eixoverde-privacy-accept-btn"
            type="button"
            onClick={() => setPrivacyModalOpen(false)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
