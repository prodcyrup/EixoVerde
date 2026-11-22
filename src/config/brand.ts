import type { LngLat } from '../types';

export const BRAND = {
  name: 'EixoVerde',
  tagline: 'Mobilidade segura em ciclovias',
  regionLabel: 'Brasília DF • Expansão Brasil',
  websiteUrl: 'https://eixoverde.com',
  webAppUrl: 'https://eixoverde.com/app/',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=br.com.eixoverde.app',
  privacyUrl: 'https://eixoverde.com/privacidade.html',
  accountDeletionUrl: 'https://eixoverde.com/exclusao-conta.html',
  contactEmail: 'contato@eixoverde.com',
  defaultCenter: [-47.8825, -15.7912] as LngLat,
  defaultZoom: 13.2,
  // Brasília DF Magnetic Declination (WMM 2026: 22.3° West = -22.3°)
  magneticDeclinationDeg: -22.3,
  // Bounding box for DF (used to prioritize local DF CicloMapa snapping & search bias)
  dfBounds: {
    minLng: -48.3,
    maxLng: -47.3,
    minLat: -16.1,
    maxLat: -15.45,
  },
} as const;

export function isInsideDF([lng, lat]: LngLat): boolean {
  const b = BRAND.dfBounds;
  return lng >= b.minLng && lng <= b.maxLng && lat >= b.minLat && lat <= b.maxLat;
}
