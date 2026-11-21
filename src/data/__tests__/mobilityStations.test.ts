import { describe, expect, it } from 'vitest';
import { buildMobilityStationsCollection, JET_DF_HUBS } from '../mobilityStations';

describe('mobilityStations.ts DF Tembici & JET dataset', () => {
  it('returns all curated JET hubs even without POIs GeoJSON (100% offline-safe)', () => {
    const res = buildMobilityStationsCollection(null);
    expect(res.stations.length).toBe(JET_DF_HUBS.length);
    expect(res.stations.length).toBeGreaterThanOrEqual(15);
    expect(res.geojson.features).toHaveLength(JET_DF_HUBS.length);
    expect(res.stations.every((s) => s.provider === 'jet')).toBe(true);
  });

  it('merges real Bike Brasília / Tembici stations (kind === estacao) while filtering out racks/shops', () => {
    const samplePois: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { kind: 'estacao', name: 'Estação 102 Norte', label: 'Estação Bike Brasília' },
          geometry: { type: 'Point', coordinates: [-47.887, -15.774] },
        },
        {
          type: 'Feature',
          properties: { kind: 'estacao', name: 'Estação Torre de TV' },
          geometry: { type: 'Point', coordinates: [-47.893, -15.791] },
        },
        {
          type: 'Feature',
          properties: { kind: 'paraciclo', name: 'Paraciclo SQN 102' },
          geometry: { type: 'Point', coordinates: [-47.888, -15.775] },
        },
        {
          type: 'Feature',
          properties: { kind: 'oficina', name: 'Oficina Bike DF' },
          geometry: { type: 'Point', coordinates: [-47.89, -15.78] },
        },
      ],
    };

    const res = buildMobilityStationsCollection(samplePois);
    const tembiciStations = res.stations.filter((s) => s.provider === 'tembici');
    const jetStations = res.stations.filter((s) => s.provider === 'jet');

    expect(tembiciStations).toHaveLength(2);
    expect(tembiciStations[0].name).toBe('Tembici • Estação 102 Norte');
    expect(jetStations).toHaveLength(JET_DF_HUBS.length);
    expect(res.geojson.features).toHaveLength(2 + JET_DF_HUBS.length);
  });
});
