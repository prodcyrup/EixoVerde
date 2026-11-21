import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import type { LngLat, ThemeMode } from '../types';

export const APP_BUNDLE_ID = 'br.com.eixoverde.app';
export const NATIVE_AUTH_CALLBACK_URL = `${APP_BUNDLE_ID}://auth-callback`;

export type RuntimePlatform = 'android' | 'ios' | 'web';

export interface ParsedDeepLink {
  rawUrl: string;
  accessToken?: string;
  refreshToken?: string;
  authCode?: string;
  authType?: string;
  shareParam?: string;
}

export function isNativeMobileApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function getRuntimePlatform(): RuntimePlatform {
  try {
    const p = Capacitor.getPlatform();
    if (p === 'android' || p === 'ios') return p;
  } catch {
    // Fallback to web
  }
  return 'web';
}

/**
 * Parses a custom scheme (`br.com.eixoverde.app://auth-callback#access_token=...`)
 * or universal link (`https://prodcyrup.github.io/EixoVerde/?share=...`) into
 * structured auth tokens or shared route parameters.
 */
export function parseDeepLinkUrl(rawUrl: string): ParsedDeepLink | null {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return null;

  // Normalize custom scheme into a standard URL for query/hash parsing
  const normalized = trimmed.startsWith(`${APP_BUNDLE_ID}://`)
    ? trimmed.replace(`${APP_BUNDLE_ID}://`, 'https://eixoverde.app/')
    : trimmed;

  try {
    const u = new URL(normalized);
    const searchParams = u.searchParams;
    const hashRaw = u.hash.startsWith('#') ? u.hash.slice(1) : u.hash;
    const hashParams = new URLSearchParams(hashRaw);

    const accessToken = hashParams.get('access_token') ?? searchParams.get('access_token') ?? undefined;
    const refreshToken = hashParams.get('refresh_token') ?? searchParams.get('refresh_token') ?? undefined;
    const authCode = searchParams.get('code') ?? hashParams.get('code') ?? undefined;
    const authType = hashParams.get('type') ?? searchParams.get('type') ?? undefined;
    const shareParam = searchParams.get('share') ?? hashParams.get('share') ?? undefined;

    if (!accessToken && !authCode && !shareParam && !authType) {
      return null;
    }

    return {
      rawUrl: trimmed,
      accessToken,
      refreshToken,
      authCode,
      authType,
      shareParam,
    };
  } catch {
    return null;
  }
}

export async function triggerHaptic(
  kind: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light'
): Promise<void> {
  if (isNativeMobileApp()) {
    try {
      if (kind === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (kind === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else {
        const style =
          kind === 'heavy'
            ? ImpactStyle.Heavy
            : kind === 'medium'
              ? ImpactStyle.Medium
              : ImpactStyle.Light;
        await Haptics.impact({ style });
      }
      return;
    } catch {
      // Fallback below
    }
  }

  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(kind === 'heavy' ? 28 : 16);
    } catch {
      // Ignore vibration errors
    }
  }
}

export async function configureNativeStatusBar(theme: ThemeMode): Promise<void> {
  if (!isNativeMobileApp()) return;
  try {
    await StatusBar.setStyle({
      style: theme === 'dark' ? StatusBarStyle.Dark : StatusBarStyle.Light,
    });
    if (getRuntimePlatform() === 'android') {
      await StatusBar.setBackgroundColor({
        color: theme === 'dark' ? '#0b1116' : '#064e3b',
      });
    }
  } catch {
    // Ignore on unsupported devices
  }
}

export async function hideNativeSplashScreen(): Promise<void> {
  if (!isNativeMobileApp()) return;
  try {
    await SplashScreen.hide();
  } catch {
    // Ignore
  }
}

export async function nativeShareUrl(opts: {
  title: string;
  text?: string;
  url: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  if (isNativeMobileApp()) {
    try {
      await Share.share({
        title: opts.title,
        text: opts.text ?? opts.title,
        url: opts.url,
        dialogTitle: opts.title,
      });
      return 'shared';
    } catch {
      // Fallback to Web Share / Clipboard
    }
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title: opts.title, text: opts.text, url: opts.url });
      return 'shared';
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(opts.url);
      return 'copied';
    }
  } catch {
    // Fallback
  }
  return 'failed';
}

export async function getNativeOrWebPosition(
  timeoutMs = 6500
): Promise<{ pos: LngLat; acc: number } | null> {
  if (isNativeMobileApp()) {
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        await Geolocation.requestPermissions();
      }
      const p = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 25000,
      });
      return {
        pos: [+p.coords.longitude.toFixed(6), +p.coords.latitude.toFixed(6)],
        acc: Math.round(p.coords.accuracy || 0),
      };
    } catch {
      // Fall back to navigator.geolocation below
    }
  }

  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return null;
  }

  return new Promise<{ pos: LngLat; acc: number } | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          pos: [+p.coords.longitude.toFixed(6), +p.coords.latitude.toFixed(6)],
          acc: Math.round(p.coords.accuracy || 0),
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 25000 }
    );
  });
}

export function registerNativeAppListeners(handlers: {
  onBackPress: () => boolean;
  onDeepLink: (parsed: ParsedDeepLink) => void;
}): () => void {
  if (!isNativeMobileApp()) {
    return () => {};
  }

  const removeFns: Array<() => void> = [];

  void App.addListener('backButton', ({ canGoBack }) => {
    const consumed = handlers.onBackPress();
    if (!consumed) {
      if (canGoBack && typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        void App.minimizeApp();
      }
    }
  }).then((handle) => {
    removeFns.push(() => void handle.remove());
  });

  void App.addListener('appUrlOpen', (event) => {
    const parsed = parseDeepLinkUrl(event.url);
    if (parsed) {
      handlers.onDeepLink(parsed);
    }
  }).then((handle) => {
    removeFns.push(() => void handle.remove());
  });

  return () => {
    for (const fn of removeFns) {
      try {
        fn();
      } catch {
        // Ignore cleanup errors
      }
    }
  };
}
