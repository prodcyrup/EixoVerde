import { describe, expect, it } from 'vitest';
import {
  getRuntimePlatform,
  isNativeMobileApp,
  parseDeepLinkUrl,
} from '../nativeBridge';
import { useAppStore } from '../../store/useAppStore';

describe('nativeBridge.ts — Deep-Link Parser & Runtime Detection', () => {
  it('reports web runtime in standard Vitest / Node environment', () => {
    expect(isNativeMobileApp()).toBe(false);
    expect(getRuntimePlatform()).toBe('web');
  });

  it('parses OAuth PKCE authorization code from custom scheme br.com.eixoverde.app://auth-callback', () => {
    const parsed = parseDeepLinkUrl(
      'br.com.eixoverde.app://auth-callback?code=pkce_code_12345&type=signup'
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.authCode).toBe('pkce_code_12345');
    expect(parsed?.authType).toBe('signup');
    expect(parsed?.accessToken).toBeUndefined();
  });

  it('parses implicit OAuth / Magic Link hash tokens from custom scheme URL', () => {
    const parsed = parseDeepLinkUrl(
      'br.com.eixoverde.app://auth-callback#access_token=jwt_acc_99&refresh_token=jwt_ref_88&type=recovery'
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.accessToken).toBe('jwt_acc_99');
    expect(parsed?.refreshToken).toBe('jwt_ref_88');
    expect(parsed?.authType).toBe('recovery');
  });

  it('parses shared route deep links (?share=...) from eixoverde.com/app/ and legacy universal URLs', () => {
    const primary = parseDeepLinkUrl('https://eixoverde.com/app/?share=eyJ2IjoxfQ==');
    expect(primary).not.toBeNull();
    expect(primary?.shareParam).toBe('eyJ2IjoxfQ==');
    expect(primary?.authCode).toBeUndefined();

    const legacy = parseDeepLinkUrl('https://prodcyrup.github.io/EixoVerde/?share=eyJ2IjoxfQ==');
    expect(legacy).not.toBeNull();
    expect(legacy?.shareParam).toBe('eyJ2IjoxfQ==');
  });

  it('returns null gracefully on empty or irrelevant URLs', () => {
    expect(parseDeepLinkUrl('   ')).toBeNull();
    expect(parseDeepLinkUrl('https://eixoverde.com/')).toBeNull();
    expect(parseDeepLinkUrl('https://eixoverde.com/app/')).toBeNull();
  });
});

describe('useAppStore.handleHardwareBackButton — Android Hardware Back Priority Stack', () => {
  it('closes modals and drawers in priority order before stepping back from active navigation', () => {
    useAppStore.setState({
      mode: 'navigate',
      privacyModalOpen: true,
      authModalOpen: true,
      garageOpen: true,
      menuOpen: true,
      mapContextPin: { coords: [-47.88, -15.79], place: null, loading: false },
    });

    // 1. PrivacyPolicyModal has highest priority
    expect(useAppStore.getState().handleHardwareBackButton()).toBe(true);
    expect(useAppStore.getState().privacyModalOpen).toBe(false);

    // 2. AuthModal closes next
    expect(useAppStore.getState().handleHardwareBackButton()).toBe(true);
    expect(useAppStore.getState().authModalOpen).toBe(false);

    // 3. GarageModal closes next
    expect(useAppStore.getState().handleHardwareBackButton()).toBe(true);
    expect(useAppStore.getState().garageOpen).toBe(false);

    // 4. AppMenuDrawer closes next
    expect(useAppStore.getState().handleHardwareBackButton()).toBe(true);
    expect(useAppStore.getState().menuOpen).toBe(false);

    // 5. MapContextPin closes next
    expect(useAppStore.getState().handleHardwareBackButton()).toBe(true);
    expect(useAppStore.getState().mapContextPin).toBeNull();

    // 6. Active navigation mode steps back to preview/explore
    expect(useAppStore.getState().handleHardwareBackButton()).toBe(true);
    expect(useAppStore.getState().mode).not.toBe('navigate');
  });
});
