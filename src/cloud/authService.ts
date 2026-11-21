import type { User } from '@supabase/supabase-js';
import {
  isNativeMobileApp,
  NATIVE_AUTH_CALLBACK_URL,
  type ParsedDeepLink,
} from '../mobile/nativeBridge';
import type { AuthUser } from '../types';
import { getSupabaseClient } from './supabaseClient';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user || !user.id) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawName =
    (typeof meta.display_name === 'string' && meta.display_name.trim()) ||
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    '';
  const email = user.email ?? '';
  const displayName = rawName || (email ? email.split('@')[0] : 'Ciclista');
  const avatarUrl = typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined;

  return {
    id: user.id,
    email,
    displayName,
    avatarUrl,
  };
}

export function getAuthRedirectUrl(): string | undefined {
  if (isNativeMobileApp()) {
    return NATIVE_AUTH_CALLBACK_URL;
  }
  if (typeof window === 'undefined' || !window.location) return undefined;
  const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');
  return `${window.location.origin}${base}`;
}

export function mapAuthErrorPtBr(err: unknown): string {
  if (!err) return 'Ocorreu um erro inesperado na autenticação.';
  const raw =
    typeof err === 'string'
      ? err
      : typeof (err as { message?: unknown }).message === 'string'
        ? ((err as { message: string }).message)
        : String(err);
  const low = raw.toLowerCase();

  if (low.includes('invalid login credentials') || low.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }
  if (low.includes('user already registered') || low.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente entrar com sua senha ou recuperar o acesso.';
  }
  if (low.includes('email not confirmed')) {
    return 'Confirme seu e-mail pelo link enviado antes de entrar.';
  }
  if (low.includes('password should be at least') || low.includes('weak_password')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (low.includes('rate limit') || low.includes('too many requests') || low.includes('over_email_send_rate_limit')) {
    return 'Muitas tentativas seguidas. Aguarde alguns instantes antes de tentar novamente.';
  }
  if (low.includes('invalid email') || low.includes('unable to validate email')) {
    return 'Informe um endereço de e-mail válido.';
  }
  if (low.includes('provider is not enabled') || low.includes('unsupported provider')) {
    return 'O login com Google ainda não foi ativado no painel do Supabase (Authentication → Providers → Google).';
  }
  if (low.includes('failed to fetch') || low.includes('network') || low.includes('fetch')) {
    return 'Sem conexão com o servidor de autenticação. Seus dados continuam salvos localmente.';
  }
  return raw;
}

export async function getCurrentSession(): Promise<{
  user: AuthUser | null;
  accessToken: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, accessToken: null };
  }
  try {
    const { data, error } = await client.auth.getSession();
    if (error || !data?.session) {
      return { user: null, accessToken: null };
    }
    return {
      user: toAuthUser(data.session.user),
      accessToken: data.session.access_token ?? null,
    };
  } catch {
    return { user: null, accessToken: null };
  }
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { error: 'Informe um endereço de e-mail válido.' };
  }
  if (!password || password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Modo Local ativo — configure o Supabase para sincronizar na nuvem.' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      return { error: mapAuthErrorPtBr(error) };
    }
    const authUser = toAuthUser(data?.user ?? data?.session?.user);
    if (!authUser) {
      return { error: 'Não foi possível iniciar a sessão. Tente novamente.' };
    }
    return { user: authUser };
  } catch (err) {
    return { error: mapAuthErrorPtBr(err) };
  }
}

export async function signUpWithPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user?: AuthUser; needsEmailConfirmation?: boolean; error?: string }> {
  const cleanEmail = email.trim();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { error: 'Informe um endereço de e-mail válido.' };
  }
  if (!password || password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Modo Local ativo — configure o Supabase para criar uma conta na nuvem.' };
  }

  const cleanName = displayName?.trim() || cleanEmail.split('@')[0];
  try {
    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          display_name: cleanName,
        },
      },
    });
    if (error) {
      return { error: mapAuthErrorPtBr(error) };
    }
    const authUser = toAuthUser(data?.user ?? data?.session?.user);
    const needsEmailConfirmation = Boolean(data?.user && !data?.session);
    return {
      user: authUser ?? undefined,
      needsEmailConfirmation,
    };
  } catch (err) {
    return { error: mapAuthErrorPtBr(err) };
  }
}

export async function signInWithMagicLink(
  email: string
): Promise<{ sent?: boolean; error?: string }> {
  const cleanEmail = email.trim();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { error: 'Informe um endereço de e-mail válido.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Modo Local ativo — configure o Supabase para usar Link Mágico.' };
  }

  try {
    const { error } = await client.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });
    if (error) {
      return { error: mapAuthErrorPtBr(error) };
    }
    return { sent: true };
  } catch (err) {
    return { error: mapAuthErrorPtBr(err) };
  }
}

export async function signInWithGoogle(): Promise<{ redirected?: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Modo Local ativo — configure o Supabase para entrar com Google.' };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      return { error: mapAuthErrorPtBr(error) };
    }
    return { redirected: true };
  } catch (err) {
    return { error: mapAuthErrorPtBr(err) };
  }
}

export async function sendPasswordReset(
  email: string
): Promise<{ sent?: boolean; error?: string }> {
  const cleanEmail = email.trim();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { error: 'Informe um endereço de e-mail válido.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Modo Local ativo — configure o Supabase para recuperar senha.' };
  }

  try {
    const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: getAuthRedirectUrl(),
    });
    if (error) {
      return { error: mapAuthErrorPtBr(error) };
    }
    return { sent: true };
  } catch (err) {
    return { error: mapAuthErrorPtBr(err) };
  }
}

export async function updatePassword(
  newPassword: string
): Promise<{ updated?: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { error: 'A nova senha deve ter pelo menos 6 caracteres.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Modo Local ativo — sessão indisponível.' };
  }

  try {
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      return { error: mapAuthErrorPtBr(error) };
    }
    return { updated: true };
  } catch (err) {
    return { error: mapAuthErrorPtBr(err) };
  }
}

export async function signOut(): Promise<{ error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {};
  }
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) {
      return { error: mapAuthErrorPtBr(error) };
    }
    return {};
  } catch {
    // Even if network fails, local sign-out succeeds without losing local IndexedDB data
    return {};
  }
}

/**
 * Exchanges OAuth PKCE `?code=` or implicit `#access_token` returned via
 * custom scheme (`br.com.eixoverde.app://auth-callback`) on Android & iOS.
 */
export async function consumeDeepLinkAuth(
  parsed: ParsedDeepLink
): Promise<{ user?: AuthUser; isRecovery?: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return {};

  try {
    if (parsed.accessToken && parsed.refreshToken) {
      const { data, error } = await client.auth.setSession({
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
      });
      if (error) return { error: mapAuthErrorPtBr(error) };
      return {
        user: toAuthUser(data?.user ?? data?.session?.user) ?? undefined,
        isRecovery: parsed.authType === 'recovery',
      };
    }

    if (parsed.authCode && typeof client.auth.exchangeCodeForSession === 'function') {
      const { data, error } = await client.auth.exchangeCodeForSession(parsed.authCode);
      if (error) return { error: mapAuthErrorPtBr(error) };
      return {
        user: toAuthUser(data?.user ?? data?.session?.user) ?? undefined,
        isRecovery: parsed.authType === 'recovery',
      };
    }
  } catch (err) {
    return { error: mapAuthErrorPtBr(err) };
  }

  return {};
}

/**
 * Permanently deletes the signed-in user's cloud account and all cloud records
 * via `public.delete_my_account()` RPC (Apple App Store Guideline 5.1.1(v) & Google Play Data Safety).
 * Falls back to deleting user data tables directly if the Phase 5 RPC hasn't been executed yet.
 */
export async function deleteCloudAccount(
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Modo Local ativo — nenhuma conta na nuvem conectada.' };
  }

  try {
    const rpcRes = await client.rpc('delete_my_account');
    if (rpcRes.error) {
      // Fallback: delete user rows directly if Phase 5 SQL migration hasn't been executed yet
      await Promise.allSettled([
        client.from('route_ratings').delete().eq('user_id', userId),
        client.from('community_routes').delete().eq('author_id', userId),
        client.from('ride_sessions').delete().eq('user_id', userId),
        client.from('hazard_reports').delete().eq('user_id', userId),
        client.from('custom_vehicles').delete().eq('user_id', userId),
        client.from('saved_places').delete().eq('user_id', userId),
        client.from('saved_routes').delete().eq('user_id', userId),
        client.from('user_preferences').delete().eq('user_id', userId),
        client.from('profiles').delete().eq('id', userId),
      ]);
    }
    await signOut();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mapAuthErrorPtBr(err) };
  }
}

export function subscribeAuthChanges(
  cb: (event: string, user: AuthUser | null) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }
  try {
    const { data } = client.auth.onAuthStateChange((event, session) => {
      cb(event, toAuthUser(session?.user));
    });
    return () => {
      data?.subscription?.unsubscribe();
    };
  } catch {
    return () => {};
  }
}
