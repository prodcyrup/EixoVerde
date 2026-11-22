import { describe, expect, it } from 'vitest';
import {
  decodeShareableRouteFromUrl,
  encodeShareableRouteUrl,
  exportRouteToGpx,
} from '../gpx';
import type { Coord3D } from '../../types';

describe('gpx.ts export and XML escaping', () => {
  it('generates valid GPX 1.1 with escaped special characters and elevation tags', () => {
    const coords: Coord3D[] = [
      [-47.862638, -15.798967, 1059.4],
      [-47.895675, -15.756582, 1070.2],
    ];
    const gpx = exportRouteToGpx('Esplanada & "Asa Norte" <DF>', coords, "Rota do 'Eixo'");
    expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(gpx).toContain('<gpx version="1.1" creator="EixoVerde"');
    expect(gpx).toContain('Esplanada &amp; &quot;Asa Norte&quot; &lt;DF&gt;');
    expect(gpx).toContain('Rota do &apos;Eixo&apos;');
    expect(gpx).toContain('<trkpt lat="-15.798967" lon="-47.862638"><ele>1059.4</ele></trkpt>');
    expect(gpx).toContain('<trkpt lat="-15.756582" lon="-47.895675"><ele>1070.2</ele></trkpt>');
  });

  it('omits <ele> tag cleanly when coordinates lack elevation', () => {
    const coords: Coord3D[] = [
      [-47.88, -15.79],
      [-47.89, -15.78],
    ];
    const gpx = exportRouteToGpx('Teste 2D', coords);
    expect(gpx).not.toContain('<ele>');
    expect(gpx).toContain('<trkpt lat="-15.790000" lon="-47.880000"></trkpt>');
  });

  it('encodes shareable links on https://eixoverde.com/app/ and decodes round-trip cleanly', () => {
    const url = encodeShareableRouteUrl(
      'Eixo Monumental Seguro',
      [
        [-47.8825, -15.7912],
        [-47.8626, -15.7989],
      ],
      'safe'
    );
    expect(url.startsWith('https://eixoverde.com/app/?share=')).toBe(true);
    const param = new URL(url).searchParams.get('share') ?? '';
    const decoded = decodeShareableRouteFromUrl(param);
    expect(decoded).not.toBeNull();
    expect(decoded?.name).toBe('Eixo Monumental Seguro');
    expect(decoded?.profile).toBe('safe');
    expect(decoded?.waypoints).toHaveLength(2);
  });
});
