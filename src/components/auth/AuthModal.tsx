import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

type AuthTab = 'signin' | 'signup' | 'magic' | 'reset';

export function AuthModal() {
  const open = useAppStore((s) => s.authModalOpen);
  const authLoading = useAppStore((s) => s.authLoading);
  const authRecoveryMode = useAppStore((s) => s.authRecoveryMode);
  const setAuthModalOpen = useAppStore((s) => s.setAuthModalOpen);
  const setPrivacyModalOpen = useAppStore((s) => s.setPrivacyModalOpen);
  const signIn = useAppStore((s) => s.signIn);
  const signUp = useAppStore((s) => s.signUp);
  const sendMagicLink = useAppStore((s) => s.sendMagicLink);
  const signInWithGoogle = useAppStore((s) => s.signInWithGoogle);
  const requestPasswordReset = useAppStore((s) => s.requestPasswordReset);
  const completePasswordRecovery = useAppStore((s) => s.completePasswordRecovery);

  const [tab, setTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setInfoMsg(null);
    }
  }, [open, tab]);

  if (!open) return null;

  const handleClose = () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setAuthModalOpen(false);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    const res = await signInWithGoogle();
    if (!res.ok) {
      setErrorMsg(res.error || 'Não foi possível iniciar o login com Google.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (authRecoveryMode) {
      const res = await completePasswordRecovery(password);
      if (!res.ok) {
        setErrorMsg(res.error || 'Não foi possível atualizar a senha.');
      }
      return;
    }

    if (tab === 'signin') {
      const res = await signIn(email, password);
      if (!res.ok) {
        setErrorMsg(res.error || 'Falha ao entrar.');
      }
      return;
    }

    if (tab === 'signup') {
      const res = await signUp(email, password, displayName);
      if (!res.ok) {
        setErrorMsg(res.error || 'Não foi possível criar a conta.');
        return;
      }
      if (res.needsEmailConfirmation) {
        setInfoMsg('Enviamos um link de confirmação para seu e-mail. Confirme para ativar o acesso.');
      }
      return;
    }

    if (tab === 'magic') {
      const res = await sendMagicLink(email);
      if (!res.ok) {
        setErrorMsg(res.error || 'Não foi possível enviar o link mágico.');
        return;
      }
      setInfoMsg('Link mágico enviado! Abra seu e-mail para entrar automaticamente.');
      return;
    }

    if (tab === 'reset') {
      const res = await requestPasswordReset(email);
      if (!res.ok) {
        setErrorMsg(res.error || 'Não foi possível enviar o e-mail de recuperação.');
        return;
      }
      setInfoMsg('Enviamos as instruções de recuperação para seu e-mail.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div
        id="eixoverde-auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eixoverde-auth-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Cloud className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="eixoverde-auth-title"
                className="font-display text-base font-extrabold text-slate-900 dark:text-white"
              >
                {authRecoveryMode ? 'Redefinir Senha' : 'Conta EixoVerde Cloud'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronize rotas, locais favoritos, garagem e alertas em qualquer dispositivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar janela de conta"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Google OAuth 1-Click Sign-In + Mode Tabs (hidden during password recovery callback) */}
        {!authRecoveryMode && (
          <div className="mt-4 space-y-3">
            <button
              id="eixoverde-auth-google-btn"
              type="button"
              disabled={authLoading}
              onClick={() => void handleGoogleSignIn()}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-extrabold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700/80"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </button>

            <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span>ou use seu e-mail</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/90">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`rounded-lg py-1.5 text-xs font-bold ${
                  tab === 'signin'
                    ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`rounded-lg py-1.5 text-xs font-bold ${
                  tab === 'signup'
                    ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Criar Conta
              </button>
              <button
                type="button"
                onClick={() => setTab('magic')}
                className={`rounded-lg py-1.5 text-xs font-bold ${
                  tab === 'magic'
                    ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Link Mágico
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-3.5 space-y-3.5">
          {errorMsg && (
            <div
              id="eixoverde-auth-error"
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div
              id="eixoverde-auth-info"
              role="status"
              className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{infoMsg}</span>
            </div>
          )}

          {!authRecoveryMode && tab === 'signup' && (
            <div>
              <label
                htmlFor="eixoverde-auth-name"
                className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Como devemos chamar você? (opcional)
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="eixoverde-auth-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Vítor"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                />
              </div>
            </div>
          )}

          {!authRecoveryMode && (
            <div>
              <label
                htmlFor="eixoverde-auth-email"
                className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="eixoverde-auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                />
              </div>
            </div>
          )}

          {(authRecoveryMode || tab === 'signin' || tab === 'signup') && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="eixoverde-auth-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  {authRecoveryMode ? 'Nova senha (mín. 6 caracteres)' : 'Senha'}
                </label>
                {!authRecoveryMode && tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setTab('reset')}
                    className="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    Esqueci a senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="eixoverde-auth-password"
                  type="password"
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                />
              </div>
            </div>
          )}

          {!authRecoveryMode && tab === 'reset' && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Enviaremos um link para redefinir sua senha.</span>
              <button
                type="button"
                onClick={() => setTab('signin')}
                className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Voltar ao login
              </button>
            </div>
          )}

          <button
            id="eixoverde-auth-submit"
            type="submit"
            disabled={authLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 disabled:opacity-60"
          >
            {authLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : authRecoveryMode ? (
              <KeyRound className="h-4 w-4" />
            ) : tab === 'magic' ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            {authRecoveryMode
              ? 'Salvar Nova Senha'
              : tab === 'signin'
                ? 'Entrar na Conta'
                : tab === 'signup'
                  ? 'Criar Conta Gratuita'
                  : tab === 'magic'
                    ? 'Enviar Link Mágico'
                    : 'Enviar Link de Recuperação'}
          </button>

          <div className="pt-1 text-center">
            <button
              id="eixoverde-auth-privacy-link"
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              className="text-[11px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-emerald-600 dark:text-slate-400 dark:decoration-slate-700 dark:hover:text-emerald-400"
            >
              Política de Privacidade &amp; Termos de Uso (LGPD)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
