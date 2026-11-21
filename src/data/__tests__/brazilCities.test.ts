import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BRAZIL_CAPITALS,
  BRAZIL_REGIONS,
  NATIONAL_CURATED_PLACES,
  NATIONAL_CURATED_ROUTES,
  findNearestCapital,
  getCapitalBySlug,
} from '../brazilCities';
import {
  ALL_CURATED_ROUTES,
  getCuratedRoutesForCity,
  getPopularPlacesForCity,
} from '../curatedRoutes';
import { useAppStore } from '../../store/useAppStore';

describe('brazilCities.ts — 27 Brazilian State Capitals Registry & Geodata', () => {
  it('registers all 27 Brazilian State Capitals (26 states + DF) across all 5 Regions', () => {
    expect(BRAZIL_CAPITALS).toHaveLength(27);
    const regionsPresent = new Set(BRAZIL_CAPITALS.map((c) => c.region));
    for (const reg of BRAZIL_REGIONS) {
      expect(regionsPresent.has(reg)).toBe(true);
    }

    const ufs = new Set(BRAZIL_CAPITALS.map((c) => c.stateCode));
    expect(ufs.size).toBe(27);
  });

  it('has optimized CicloMapa lanes and POIs GeoJSON files on disk for every single capital', () => {
    for (const cap of BRAZIL_CAPITALS) {
      const lanesFile = path.resolve(process.cwd(), 'public', cap.lanesUrl);
      const poisFile = path.resolve(process.cwd(), 'public', cap.poisUrl);
      expect(fs.existsSync(lanesFile), `Missing ${cap.lanesUrl}`).toBe(true);
      expect(fs.existsSync(poisFile), `Missing ${cap.poisUrl}`).toBe(true);
      expect(cap.totalKm).toBeGreaterThan(10);
      expect(cap.lanesCount).toBeGreaterThan(20);
    }
  });

  it('provides 86 street-snapped 3D curated routes across all 27 capitals (8 in DF + 3 in each of the other 26 capitals)', () => {
    expect(NATIONAL_CURATED_ROUTES).toHaveLength(78);
    expect(ALL_CURATED_ROUTES).toHaveLength(86);
    expect(NATIONAL_CURATED_PLACES.length).toBeGreaterThanOrEqual(78);

    for (const cap of BRAZIL_CAPITALS) {
      const cityRoutes = getCuratedRoutesForCity(cap.slug);
      expect(cityRoutes.length).toBe(cap.slug === 'brasilia' ? 8 : 3);
      for (const r of cityRoutes) {
        expect(r.coords.length).toBeGreaterThanOrEqual(2);
        expect(r.coords[0].length).toBe(3); // 3D [lng, lat, elevation]
        expect(r.distanceKm).toBeGreaterThan(0.5);
        expect(r.safetyScore).toBeGreaterThanOrEqual(80);
      }

      const cityPlaces = getPopularPlacesForCity(cap.slug);
      expect(cityPlaces.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('resolves nearest capital accurately from GPS coordinates across Brazil', () => {
    expect(findNearestCapital([-47.8828, -15.7939]).slug).toBe('brasilia');
    expect(findNearestCapital([-46.6559, -23.5614]).slug).toBe('sao-paulo');
    expect(findNearestCapital([-43.1882, -22.9694]).slug).toBe('rio-de-janeiro');
    expect(findNearestCapital([-38.5218, -3.7305]).slug).toBe('fortaleza');
    expect(findNearestCapital([-49.2733, -25.4284]).slug).toBe('curitiba');
    expect(findNearestCapital([-60.0217, -3.119]).slug).toBe('manaus');
    expect(getCapitalBySlug('unknown-slug').slug).toBe('brasilia');
  });

  it('switches active capital and curated routes cleanly via useAppStore.selectCity', async () => {
    await useAppStore.getState().selectCity('sao-paulo', false);
    expect(useAppStore.getState().selectedCitySlug).toBe('sao-paulo');
    const spCurated = useAppStore.getState().savedRoutes.filter((r) => r.isCurated);
    expect(spCurated).toHaveLength(3);
    expect(spCurated[0].city).toBe('São Paulo, SP');

    // Restore default brasilia
    await useAppStore.getState().selectCity('brasilia', false);
    expect(useAppStore.getState().selectedCitySlug).toBe('brasilia');
    const dfCurated = useAppStore.getState().savedRoutes.filter((r) => r.isCurated);
    expect(dfCurated).toHaveLength(8);
  });
});
