import { describe, expect, it } from 'vitest';
import { buildLaneSpatialIndex } from '../geo';
import { buildSafetyRouteSegments } from '../routeSegments';

describe('routeSegments.ts color-coded safety segmentation', () => {
  it('returns empty FeatureCollection when fewer than 2 coordinates are given', () => {
    const res = buildSafetyRouteSegments([[-47.89, -15.79, 1080]], 'safe');
    expect(res.geojson.features).toHaveLength(0);
    expect(res.kmByClass.ciclovia).toBe(0);
  });

  it('classifies edges against the DF CicloMapa spatial index and merges consecutive same-class edges', () => {
    buildLaneSpatialIndex({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { kind: 'ciclovia', name: 'Ciclovia Parque da Cidade' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-47.905, -15.802],
              [-47.906, -15.802],
              [-47.907, -15.802],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { kind: 'ciclofaixa', name: 'Ciclofaixa Asa Sul' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-47.907, -15.802],
              [-47.908, -15.802],
            ],
          },
        },
      ],
    });

    const res = buildSafetyRouteSegments(
      [
        [-47.905, -15.802, 1080],
        [-47.906, -15.802, 1080],
        [-47.907, -15.802, 1080],
        [-47.908, -15.802, 1080],
        [-47.92, -15.815, 1090],
        [-47.926, -15.822, 1095],
      ],
      'fast'
    );

    expect(res.geojson.features.length).toBeGreaterThanOrEqual(2);
    expect(res.counts.ciclovia).toBeGreaterThanOrEqual(1);
    expect(res.kmByClass.ciclovia).toBeGreaterThan(0);
    expect(res.kmByClass.via_comum).toBeGreaterThan(0);

    const classes = res.geojson.features.map((f) => f.properties?.safetyClass);
    expect(classes).toContain('ciclovia');
    expect(classes).toContain('via_comum');
  });
});
