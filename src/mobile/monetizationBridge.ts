import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { getSupabaseClient } from '../cloud/supabaseClient';
import { getRuntimePlatform, isNativeMobileApp } from './nativeBridge';

export const VIP_LIFETIME_SKU = 'eixoverde_vip_lifetime';
export const VIP_PRICE_BRL = 9.9;
export const VIP_PRICE_LABEL = 'R$ 9,90';

export const FREE_CUSTOM_VEHICLE_LIMIT = 1;
export const FREE_OFFLINE_CITY_LIMIT = 1;
export const FREE_GPX_EXPORT_LIMIT = 3;

// Official Google AdMob test banner unit IDs (used safely until production env IDs are configured)
const GOOGLE_TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const GOOGLE_TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';

let admobInitialized = false;
let nativeBannerVisible = false;
let bannerDesired = false;
let bannerIntentSeq = 0;

export function getConfiguredAdMobBannerId(): { adId: string; isTesting: boolean } {
  const platform = getRuntimePlatform();
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  const customId =
    platform === 'ios' ? env.VITE_ADMOB_IOS_BANNER_ID?.trim() : env.VITE_ADMOB_ANDROID_BANNER_ID?.trim();
  if (customId && customId.startsWith('ca-app-pub-')) {
    return { adId: customId, isTesting: false };
  }
  return {
    adId: platform === 'ios' ? GOOGLE_TEST_BANNER_IOS : GOOGLE_TEST_BANNER_ANDROID,
    isTesting: true,
  };
}

export async function initNativeAdMob(): Promise<boolean> {
  if (!isNativeMobileApp()) return false;
  if (admobInitialized) return true;
  try {
    await AdMob.initialize({
      initializeForTesting: getConfiguredAdMobBannerId().isTesting,
    });
    admobInitialized = true;
    return true;
  } catch {
    return false;
  }
}

export async function showNativeAdBanner(): Promise<boolean> {
  if (!isNativeMobileApp()) return false;
  const seq = ++bannerIntentSeq;
  bannerDesired = true;
  const ready = await initNativeAdMob();
  if (!ready || !bannerDesired || seq !== bannerIntentSeq) return false;
  if (nativeBannerVisible) return true;
  try {
    const { adId, isTesting } = getConfiguredAdMobBannerId();
    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting,
    });
    if (!bannerDesired || seq !== bannerIntentSeq) {
      try {
        await AdMob.hideBanner();
      } catch {
        // Ignore cleanup hide error
      }
      nativeBannerVisible = false;
      return false;
    }
    nativeBannerVisible = true;
    return true;
  } catch {
    return false;
  }
}

export async function hideNativeAdBanner(): Promise<void> {
  bannerDesired = false;
  bannerIntentSeq += 1;
  if (!isNativeMobileApp()) return;
  const wasVisible = nativeBannerVisible;
  nativeBannerVisible = false;
  if (!wasVisible && !admobInitialized) return;
  try {
    await AdMob.hideBanner();
  } catch {
    // Ignore hide errors when view detached or banner not yet shown
  }
}

export async function fetchCloudVipStatus(
  userId: string
): Promise<{ isPremium: boolean; premiumSince?: string } | null> {
  const client = getSupabaseClient();
  if (!client || !userId) return null;
  try {
    const { data, error } = await client
      .from('profiles')
      .select('is_premium, premium_purchased_at')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      isPremium: Boolean((data as { is_premium?: boolean }).is_premium),
      premiumSince: (data as { premium_purchased_at?: string | null }).premium_purchased_at ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function syncCloudVipActivation(
  userId: string,
  receiptRef?: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client || !userId) {
    return { ok: true };
  }
  const platform = getRuntimePlatform();
  try {
    const { error } = await client.rpc('activate_vip_entitlement', {
      p_sku: VIP_LIFETIME_SKU,
      p_platform: platform,
      p_receipt_ref: receiptRef ?? null,
    });
    if (error) {
      // Non-fatal fallback if Phase 7 SQL migration wasn't run yet on Supabase
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Falha de rede ao sincronizar status VIP.' };
  }
}
