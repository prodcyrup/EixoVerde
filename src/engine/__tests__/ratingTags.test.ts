import { beforeEach, describe, expect, it } from 'vitest';
import {
  FREE_CUSTOM_VEHICLE_LIMIT,
  FREE_GPX_EXPORT_LIMIT,
  FREE_OFFLINE_CITY_LIMIT,
  VIP_LIFETIME_SKU,
  VIP_PRICE_BRL,
  VIP_PRICE_LABEL,
  getConfiguredAdMobBannerId,
} from '../../mobile/monetizationBridge';
import { useAppStore } from '../../store/useAppStore';
import {
  filterTagsForStars,
  getSafetyPromptForStars,
  getSafetyTagLabel,
  getSafetyTagsForStars,
} from '../ratingTags';

describe('Phase 7 adaptive 1-5★ rating tags engine', () => {
  it('returns exact positive/negative distributions for every star level (5★ to 1★)', () => {
    const t5 = getSafetyTagsForStars(5);
    expect(t5).toHaveLength(6);
    expect(t5.filter((t) => t.sentiment === 'positive')).toHaveLength(6);
    expect(t5.filter((t) => t.sentiment === 'negative')).toHaveLength(0);

    const t4 = getSafetyTagsForStars(4);
    expect(t4).toHaveLength(6);
    expect(t4.filter((t) => t.sentiment === 'positive')).toHaveLength(4);
    expect(t4.filter((t) => t.sentiment === 'negative')).toHaveLength(2);

    const t3 = getSafetyTagsForStars(3);
    expect(t3).toHaveLength(6);
    expect(t3.filter((t) => t.sentiment === 'positive')).toHaveLength(3);
    expect(t3.filter((t) => t.sentiment === 'negative')).toHaveLength(3);

    const t2 = getSafetyTagsForStars(2);
    expect(t2).toHaveLength(6);
    expect(t2.filter((t) => t.sentiment === 'positive')).toHaveLength(2);
    expect(t2.filter((t) => t.sentiment === 'negative')).toHaveLength(4);

    const t1 = getSafetyTagsForStars(1);
    expect(t1).toHaveLength(6);
    expect(t1.filter((t) => t.sentiment === 'positive')).toHaveLength(0);
    expect(t1.filter((t) => t.sentiment === 'negative')).toHaveLength(6);
  });

  it('strips incompatible tags automatically when changing star ratings', () => {
    // User picked positive 5★ tags then switched down to 1★ -> must strip positive tags
    expect(filterTagsForStars(['bom_asfalto', 'bem_sinalizada'], 1)).toEqual([]);

    // User picked mixed tags at 3★ then switched to 5★ -> keeps only positive tags valid for 5★
    expect(filterTagsForStars(['bom_asfalto', 'asfalto_irregular', 'sombra'], 5)).toEqual([
      'bom_asfalto',
      'sombra',
    ]);

    // User picked negative tags at 1★ then switched to 3★ -> keeps shared negative tags, drops 1★-only ones
    expect(filterTagsForStars(['asfalto_irregular', 'insegura', 'cruzamento_tenso'], 3)).toEqual([
      'asfalto_irregular',
      'cruzamento_tenso',
    ]);
  });

  it('resolves human-readable PT-BR labels and star-specific prompts', () => {
    expect(getSafetyTagLabel('bem_sinalizada')).toBe('Bem sinalizada');
    expect(getSafetyTagLabel('asfalto_irregular')).toBe('Asfalto ruim / buracos');
    expect(getSafetyTagLabel('trecho_obstruido')).toBe('Trecho obstruído');
    expect(getSafetyPromptForStars(5)).toContain('gostou');
    expect(getSafetyPromptForStars(1)).toContain('problemas');
  });
});

describe('Phase 7 monetization config & EixoVerde VIP (R$ 9,90 lifetime) store gates', () => {
  beforeEach(() => {
    useAppStore.setState({
      isPremium: false,
      premiumSince: undefined,
      vipModalOpen: false,
      vipLoading: false,
      gpxExportCount: 0,
      customVehicles: [],
    });
  });

  it('exposes exact launch pricing R$ 9,90, SKU, free tier quotas & safe Google test AdMob fallback', () => {
    expect(VIP_LIFETIME_SKU).toBe('eixoverde_vip_lifetime');
    expect(VIP_PRICE_BRL).toBe(9.9);
    expect(VIP_PRICE_LABEL).toBe('R$ 9,90');
    expect(FREE_CUSTOM_VEHICLE_LIMIT).toBe(1);
    expect(FREE_OFFLINE_CITY_LIMIT).toBe(1);
    expect(FREE_GPX_EXPORT_LIMIT).toBe(3);

    const bannerCfg = getConfiguredAdMobBannerId();
    expect(bannerCfg.adId).toMatch(/^ca-app-pub-/);
  });

  it('enforces 3 free GPX exports, opens VIP modal on the 4th, and removes limit once VIP is active', async () => {
    const store = useAppStore.getState();

    // First 3 exports succeed in free mode
    expect(store.consumeGpxExportQuota()).toBe(true);
    expect(store.consumeGpxExportQuota()).toBe(true);
    expect(store.consumeGpxExportQuota()).toBe(true);
    expect(useAppStore.getState().gpxExportCount).toBe(3);
    expect(useAppStore.getState().vipModalOpen).toBe(false);

    // 4th export triggers VIP modal gently
    expect(store.consumeGpxExportQuota()).toBe(false);
    expect(useAppStore.getState().vipModalOpen).toBe(true);

    // Activating VIP lifetime closes modal and grants unlimited GPX exports
    await useAppStore.getState().activateVipLifetime();
    expect(useAppStore.getState().isPremium).toBe(true);
    expect(useAppStore.getState().vipModalOpen).toBe(false);
    expect(useAppStore.getState().consumeGpxExportQuota()).toBe(true);
  });

  it('closes VIP modal cleanly on Android hardware back button', () => {
    useAppStore.setState({ vipModalOpen: true });
    const handled = useAppStore.getState().handleHardwareBackButton();
    expect(handled).toBe(true);
    expect(useAppStore.getState().vipModalOpen).toBe(false);
  });
});
