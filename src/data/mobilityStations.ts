import type { LngLat, MobilityStation } from '../types';

/**
 * Curated JET shared electric scooter hubs across Brasília / DF.
 * Merged at runtime with the 38 real Bike Brasília / Tembici stations
 * loaded from `public/data/ciclomapa-df-pois.geojson` (100% offline-safe, zero CORS).
 */
export const JET_DF_HUBS: MobilityStation[] = [
  {
    id: 'jet-hub-esplanada',
    provider: 'jet',
    name: 'JET Hub • Esplanada / Catedral',
    subtitle: 'Zona de devolução • Eixo Monumental',
    coords: [-47.8758, -15.7982],
    capacityHint: 'Patinetes elétricos 20 km/h',
  },
  {
    id: 'jet-hub-rodoviaria',
    provider: 'jet',
    name: 'JET Hub • Rodoviária / CONIC',
    subtitle: 'Conexão Metrô Central & Setor Comercial',
    coords: [-47.8827, -15.7939],
    capacityHint: 'Alta rotatividade',
  },
  {
    id: 'jet-hub-conjunto-nacional',
    provider: 'jet',
    name: 'JET Hub • Conjunto Nacional / SDN',
    subtitle: 'Entrada Norte • Acesso ciclovia L2/W3',
    coords: [-47.8832, -15.7912],
    capacityHint: 'Patinetes elétricos',
  },
  {
    id: 'jet-hub-brasilia-shopping',
    provider: 'jet',
    name: 'JET Hub • Brasília Shopping (SCN)',
    subtitle: 'Setor Comercial Norte • W3 Norte',
    coords: [-47.8891, -15.7863],
    capacityHint: 'Estacionamento autorizado JET',
  },
  {
    id: 'jet-hub-torre-tv',
    provider: 'jet',
    name: 'JET Hub • Torre de TV / Feira',
    subtitle: 'Eixo Monumental • Acesso Parque da Cidade',
    coords: [-47.8929, -15.7905],
    capacityHint: 'Zona turística',
  },
  {
    id: 'jet-hub-parque-est1',
    provider: 'jet',
    name: 'JET Hub • Parque da Cidade (Est. 1)',
    subtitle: 'Entrada Asa Sul / Praça das Fontes',
    coords: [-47.9052, -15.8026],
    capacityHint: 'Acesso direto à ciclovia 10 km',
  },
  {
    id: 'jet-hub-parque-est10',
    provider: 'jet',
    name: 'JET Hub • Parque da Cidade (Est. 10 / Sudoeste)',
    subtitle: 'Entrada Sudoeste • Ciclovia interna',
    coords: [-47.9168, -15.7984],
    capacityHint: 'Patinetes elétricos',
  },
  {
    id: 'jet-hub-unb-icc',
    provider: 'jet',
    name: 'JET Hub • UnB (ICC Norte / Biblioteca)',
    subtitle: 'Campus Darcy Ribeiro • Ciclovia L3/L4',
    coords: [-47.8698, -15.7634],
    capacityHint: 'Campus universitário',
  },
  {
    id: 'jet-hub-asa-norte-208',
    provider: 'jet',
    name: 'JET Hub • CLN 208 / L2 Norte',
    subtitle: 'Comércio Local Norte • Ciclovia L2',
    coords: [-47.8819, -15.7646],
    capacityHint: 'Zona residencial & comércio',
  },
  {
    id: 'jet-hub-asa-norte-710',
    provider: 'jet',
    name: 'JET Hub • W3 Norte (710/711)',
    subtitle: 'Ciclovia W4/W5 Norte • CEUB / Colégios',
    coords: [-47.8919, -15.7586],
    capacityHint: 'Patinetes elétricos',
  },
  {
    id: 'jet-hub-noroeste-burle-marx',
    provider: 'jet',
    name: 'JET Hub • Parque Burle Marx (Noroeste)',
    subtitle: 'CLNW 10/11 • Ciclovia Noroeste',
    coords: [-47.9096, -15.7448],
    capacityHint: 'Acesso ao parque',
  },
  {
    id: 'jet-hub-sudoeste-bosque',
    provider: 'jet',
    name: 'JET Hub • Parque do Sudoeste / CLSW 302',
    subtitle: 'Comércio Sudoeste • Ciclovia EPIG',
    coords: [-47.9234, -15.7972],
    capacityHint: 'Patinetes elétricos',
  },
  {
    id: 'jet-hub-asa-sul-108',
    provider: 'jet',
    name: 'JET Hub • CLS 108 / Estação Metrô 108 Sul',
    subtitle: 'Integração Metrô DF • Eixinho W Sul',
    coords: [-47.9041, -15.8178],
    capacityHint: 'Integração Metrô',
  },
  {
    id: 'jet-hub-asa-sul-114',
    provider: 'jet',
    name: 'JET Hub • CLS 114 / Parque da Asa Sul',
    subtitle: 'Integração Metrô 114 Sul',
    coords: [-47.9162, -15.8295],
    capacityHint: 'Integração Metrô',
  },
  {
    id: 'jet-hub-pontao',
    provider: 'jet',
    name: 'JET Hub • Pontão do Lago Sul',
    subtitle: 'Orla do Lago Paranoá • Ciclovia Lago Sul',
    coords: [-47.8712, -15.8266],
    capacityHint: 'Lazer & orla',
  },
  {
    id: 'jet-hub-ponte-jk',
    provider: 'jet',
    name: 'JET Hub • Ponte JK / Orla SCES',
    subtitle: 'Ciclovia da Ponte JK • Clube de Golfe',
    coords: [-47.8315, -15.8240],
    capacityHint: 'Orla Lago Paranoá',
  },
];

/**
 * Extracts real Bike Brasília / Tembici stations from CicloMapa DF POI GeoJSON
 * and merges them with the curated JET scooter hubs into a unified GeoJSON FeatureCollection.
 */
export function buildMobilityStationsCollection(
  poisGeoJson?: GeoJSON.FeatureCollection | null
): { stations: MobilityStation[]; geojson: GeoJSON.FeatureCollection } {
  const tembiciStations: MobilityStation[] = [];

  if (poisGeoJson?.features) {
    let idx = 1;
    for (const feat of poisGeoJson.features) {
      const props = (feat.properties ?? {}) as { kind?: string; name?: string; label?: string };
      if (props.kind !== 'estacao' || feat.geometry?.type !== 'Point') continue;
      const coords = feat.geometry.coordinates as LngLat;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      const rawName = (props.name || '').trim();
      const name = rawName ? `Tembici • ${rawName}` : `Estação Bike Brasília #${idx}`;
      tembiciStations.push({
        id: `tembici-df-${idx}`,
        provider: 'tembici',
        name,
        subtitle: 'Estação Bike Brasília (Tembici)',
        coords: [+coords[0].toFixed(6), +coords[1].toFixed(6)],
        capacityHint: 'Bicicletas compartilhadas',
      });
      idx += 1;
    }
  }

  const stations = [...tembiciStations, ...JET_DF_HUBS];
  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: stations.map((s) => ({
      type: 'Feature',
      properties: {
        id: s.id,
        provider: s.provider,
        name: s.name,
        subtitle: s.subtitle,
        capacityHint: s.capacityHint ?? '',
        badge: s.provider === 'jet' ? '⚡' : '🚲',
      },
      geometry: {
        type: 'Point',
        coordinates: s.coords,
      },
    })),
  };

  return { stations, geojson };
}
