#!/usr/bin/env node
/**
 * Fetches & optimizes CicloMapa cycling infrastructure (lanes + POIs) for all 27 Brazilian State Capitals:
 * - Downloads chunked GeoJSONs from CicloMapa's public cache (ciclomapa-app Firestore)
 * - Decompresses zipson payload & applies CicloMapa's official OSM layer typology rules
 * - Splits into compact MapLibre-ready files under public/data/cities/<slug>-lanes.geojson & <slug>-pois.geojson
 * - Prints summary statistics per capital
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'data', 'cities');

// Load zipson from /tmp/ciclomapa-dl or local node_modules
let parseZipson;
try {
  const req = createRequire('/tmp/ciclomapa-dl/package.json');
  parseZipson = req('zipson').parse;
} catch {
  const req = createRequire(path.join(ROOT, 'package.json'));
  parseZipson = req('zipson').parse;
}

const CAPITALS = [
  { slug: 'brasilia', fs: 'brasilia-distrito-federal-brasil', name: 'Brasília', uf: 'DF' },
  { slug: 'sao-paulo', fs: 'sao-paulo-sao-paulo-brasil', name: 'São Paulo', uf: 'SP' },
  { slug: 'rio-de-janeiro', fs: 'rio-de-janeiro-rio-de-janeiro-brasil', name: 'Rio de Janeiro', uf: 'RJ' },
  { slug: 'fortaleza', fs: 'fortaleza-ceara-brasil', name: 'Fortaleza', uf: 'CE' },
  { slug: 'salvador', fs: 'salvador-bahia-brasil', name: 'Salvador', uf: 'BA' },
  { slug: 'curitiba', fs: 'curitiba-parana-brasil', name: 'Curitiba', uf: 'PR' },
  { slug: 'recife', fs: 'recife-pernambuco-brasil', name: 'Recife', uf: 'PE' },
  { slug: 'florianopolis', fs: 'florianopolis-santa-catarina-brasil', name: 'Florianópolis', uf: 'SC' },
  { slug: 'belem', fs: 'belem-para-brasil', name: 'Belém', uf: 'PA' },
  { slug: 'rio-branco', fs: 'rio-branco-acre-brasil', name: 'Rio Branco', uf: 'AC' },
  { slug: 'belo-horizonte', fs: 'belo-horizonte-minas-gerais-brasil', name: 'Belo Horizonte', uf: 'MG' },
  { slug: 'goiania', fs: 'goiania-goias-brasil', name: 'Goiânia', uf: 'GO' },
  { slug: 'campo-grande', fs: 'campo-grande-mato-grosso-do-sul-brasil', name: 'Campo Grande', uf: 'MS' },
  { slug: 'natal', fs: 'natal-rio-grande-do-norte-brasil', name: 'Natal', uf: 'RN' },
  { slug: 'aracaju', fs: 'aracaju-sergipe-brasil', name: 'Aracaju', uf: 'SE' },
  { slug: 'vitoria', fs: 'vitoria-espirito-santo-brasil', name: 'Vitória', uf: 'ES' },
  { slug: 'porto-alegre', fs: 'porto-alegre-rio-grande-do-sul-brasil', name: 'Porto Alegre', uf: 'RS' },
  { slug: 'joao-pessoa', fs: 'joao-pessoa-paraiba-brasil', name: 'João Pessoa', uf: 'PB' },
  { slug: 'teresina', fs: 'teresina-piaui-brasil', name: 'Teresina', uf: 'PI' },
  { slug: 'cuiaba', fs: 'cuiaba-mato-grosso-brasil', name: 'Cuiabá', uf: 'MT' },
  { slug: 'palmas', fs: 'palmas-tocantins-brasil', name: 'Palmas', uf: 'TO' },
  { slug: 'maceio', fs: 'maceio-alagoas-brasil', name: 'Maceió', uf: 'AL' },
  { slug: 'boa-vista', fs: 'boa-vista-roraima-brasil', name: 'Boa Vista', uf: 'RR' },
  { slug: 'sao-luis', fs: 'sao-luis-maranhao-brasil', name: 'São Luís', uf: 'MA' },
  { slug: 'manaus', fs: 'manaus-amazonas-brasil', name: 'Manaus', uf: 'AM' },
  { slug: 'porto-velho', fs: 'porto-velho-rondonia-brasil', name: 'Porto Velho', uf: 'RO' },
  { slug: 'macapa', fs: 'macapa-amapa-brasil', name: 'Macapá', uf: 'AP' },
];

// CicloMapa official layer typology rules (ordered from lowest to highest priority, Proibido highest)
const WAY_LAYERS = [
  {
    name: 'Trilha',
    kind: 'trilha',
    filters: [
      [['highway', 'track'], ['bicycle', 'designated']],
      [['highway', 'track'], ['bicycle', 'yes']],
      [['highway', 'path'], ['bicycle', 'designated']],
      [['highway', 'path'], ['bicycle', 'yes']],
    ],
  },
  {
    name: 'Baixa velocidade',
    kind: 'baixa_velocidade',
    filters: [
      ['maxspeed', '30'],
      ['maxspeed', '20'],
      [['highway', 'living_street'], ['bicycle', 'yes']],
    ],
  },
  {
    name: 'Ciclorrota',
    kind: 'baixa_velocidade',
    filters: [
      ['cycleway', 'buffered_lane'],
      ['cycleway:left', 'buffered_lane'],
      ['cycleway:right', 'buffered_lane'],
      ['cycleway', 'shared_lane'],
      ['cycleway:left', 'shared_lane'],
      ['cycleway:right', 'shared_lane'],
      ['cycleway', 'share_busway'],
      ['cycleway:left', 'share_busway'],
      ['cycleway:right', 'share_busway'],
      ['cycleway', 'opposite_share_busway'],
    ],
  },
  {
    name: 'Ciclofaixa',
    kind: 'ciclofaixa',
    filters: [
      ['cycleway', 'lane'],
      ['cycleway:left', 'lane'],
      ['cycleway:right', 'lane'],
      ['cycleway:both', 'lane'],
      ['cycleway', 'opposite_lane'],
      ['cycleway:right', 'opposite_lane'],
      ['cycleway:left', 'opposite_lane'],
    ],
  },
  {
    name: 'Calçada compartilhada',
    kind: 'calcada',
    filters: [
      [['highway', 'footway'], ['bicycle', 'designated']],
      [['highway', 'pedestrian'], ['bicycle', 'designated']],
      [['highway', 'pedestrian'], ['bicycle', 'yes']],
      ['cycleway', 'sidepath'],
      ['cycleway:left', 'sidepath'],
      ['cycleway:right', 'sidepath'],
    ],
  },
  {
    name: 'Ciclovia',
    kind: 'ciclovia',
    filters: [
      ['highway', 'cycleway'],
      ['cycleway', 'track'],
      ['cycleway:left', 'track'],
      ['cycleway:right', 'track'],
      ['cycleway', 'opposite_track'],
      ['cycleway:left', 'opposite_track'],
      ['cycleway:right', 'opposite_track'],
    ],
  },
  {
    name: 'Proibido',
    kind: 'proibido',
    filters: [
      ['bicycle', 'no'],
      ['bicycle', 'dismount'],
    ],
  },
];

const LANE_KIND_MAP = {
  Ciclovia: 'ciclovia',
  Ciclofaixa: 'ciclofaixa',
  Ciclorrota: 'baixa_velocidade',
  'Baixa velocidade': 'baixa_velocidade',
  'Calçada compartilhada': 'calcada',
  Trilha: 'trilha',
  Proibido: 'proibido',
};

const POI_KIND_MAP = {
  'Bicicletários & paraciclos': 'paraciclo',
  'Lojas & oficinas': 'oficina',
  Estações: 'estacao',
};

function classifyFeature(props) {
  if (!props) return null;
  if (props.type && LANE_KIND_MAP[props.type]) {
    return { category: 'lane', kind: LANE_KIND_MAP[props.type], label: props.type };
  }
  if (props.type && POI_KIND_MAP[props.type]) {
    return { category: 'poi', kind: POI_KIND_MAP[props.type], label: props.type };
  }

  // Classify POIs by OSM tags
  if (props.amenity === 'bicycle_rental') {
    return { category: 'poi', kind: 'estacao', label: 'Estações' };
  }
  if (props.amenity === 'bicycle_parking') {
    return { category: 'poi', kind: 'paraciclo', label: 'Bicicletários & paraciclos' };
  }
  if (props.shop === 'bicycle') {
    return { category: 'poi', kind: 'oficina', label: 'Lojas & oficinas' };
  }

  // Classify ways by CicloMapa filter rules
  let matched = null;
  for (const layer of WAY_LAYERS) {
    for (const filter of layer.filters) {
      if (Array.isArray(filter[0])) {
        const [k1, v1] = filter[0];
        const [k2, v2] = filter[1];
        if (props[k1] === v1 && props[k2] === v2) {
          matched = { category: 'lane', kind: layer.kind, label: layer.name };
        }
      } else {
        const [k, v] = filter;
        if (props[k] === v) {
          matched = { category: 'lane', kind: layer.kind, label: layer.name };
        }
      }
    }
  }
  return matched;
}

function roundCoords(coords) {
  if (typeof coords === 'number') return Math.round(coords * 1e5) / 1e5;
  if (Array.isArray(coords)) return coords.map(roundCoords);
  return coords;
}

function polygonCentroid(coords) {
  const ring = Array.isArray(coords?.[0]) ? coords[0] : [];
  if (!ring.length) return null;
  let sumLng = 0;
  let sumLat = 0;
  let count = 0;
  for (const pt of ring) {
    if (Array.isArray(pt) && pt.length >= 2) {
      sumLng += pt[0];
      sumLat += pt[1];
      count++;
    }
  }
  if (!count) return null;
  return [Math.round((sumLng / count) * 1e5) / 1e5, Math.round((sumLat / count) * 1e5) / 1e5];
}

function parseFirestoreNumber(field) {
  if (!field) return 0;
  if (field.doubleValue !== undefined) return Number(field.doubleValue);
  if (field.integerValue !== undefined) return Number(field.integerValue);
  return 0;
}

const BASE_URL =
  'https://firestore.googleapis.com/v1/projects/ciclomapa-app/databases/(default)/documents/cities';

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Copy Brasília from our verified ciclomapa-df files first
  fs.copyFileSync(
    path.join(ROOT, 'public', 'data', 'ciclomapa-df-lanes.geojson'),
    path.join(OUT_DIR, 'brasilia-lanes.geojson')
  );
  fs.copyFileSync(
    path.join(ROOT, 'public', 'data', 'ciclomapa-df-pois.geojson'),
    path.join(OUT_DIR, 'brasilia-pois.geojson')
  );

  const summaryStats = [];

  for (const cap of CAPITALS) {
    const metaRes = await fetch(`${BASE_URL}/${cap.fs}_metadata`);
    if (!metaRes.ok) {
      throw new Error(`Failed metadata for ${cap.slug}: ${metaRes.status}`);
    }
    const metaJson = await metaRes.json();
    const totalChunks = Number(metaJson.fields?.totalChunks?.integerValue || 1);
    const lenFields = metaJson.fields?.lengths?.mapValue?.fields || {};
    const cicloviaKm = Math.round(parseFirestoreNumber(lenFields.ciclovia) * 10) / 10;
    const ciclofaixaKm = Math.round(parseFirestoreNumber(lenFields.ciclofaixa) * 10) / 10;
    const ciclorrotaKm = Math.round(parseFirestoreNumber(lenFields.ciclorrota) * 10) / 10;
    const calcadaKm = Math.round(parseFirestoreNumber(lenFields['calcada-compartilhada']) * 10) / 10;
    const totalProtectedKm = Math.round((cicloviaKm + ciclofaixaKm + ciclorrotaKm + calcadaKm) * 10) / 10;

    if (cap.slug === 'brasilia') {
      const dfLanes = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'brasilia-lanes.geojson'), 'utf8'));
      const dfPois = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'brasilia-pois.geojson'), 'utf8'));
      summaryStats.push({
        slug: cap.slug,
        name: cap.name,
        uf: cap.uf,
        totalKm: totalProtectedKm || 701,
        cicloviaKm,
        ciclofaixaKm,
        lanesCount: dfLanes.features.length,
        poisCount: dfPois.features.length,
      });
      console.log(`[brasilia] Copied existing DF dataset (${dfLanes.features.length} lanes, ${dfPois.features.length} POIs, ${totalProtectedKm} km)`);
      continue;
    }

    // Download chunks in parallel
    const chunkPromises = [];
    for (let i = 1; i <= totalChunks; i++) {
      chunkPromises.push(
        fetch(`${BASE_URL}/${cap.fs}_chunk_${i}`).then(async (r) => {
          if (!r.ok) throw new Error(`Failed chunk ${i} for ${cap.slug}`);
          const d = await r.json();
          return d.fields?.data?.stringValue || '';
        })
      );
    }
    const chunks = await Promise.all(chunkPromises);
    const compressed = chunks.join('');
    let geoJson;
    try {
      geoJson = parseZipson(compressed);
    } catch {
      geoJson = JSON.parse(compressed);
    }

    const lanes = [];
    const pois = [];

    for (const feat of geoJson.features || []) {
      const props = feat.properties || {};
      const geom = feat.geometry || {};
      const gtype = geom.type;
      const cls = classifyFeature(props);
      if (!cls) continue;

      if (cls.category === 'lane' && (gtype === 'LineString' || gtype === 'MultiLineString')) {
        // For megacities (>3000 features), skip noisy residential 30km/h streets unless explicitly tagged as Ciclorrota
        if (
          cls.label === 'Baixa velocidade' &&
          (cap.slug === 'sao-paulo' || cap.slug === 'rio-de-janeiro' || cap.slug === 'curitiba' || cap.slug === 'porto-alegre')
        ) {
          continue;
        }
        const cleanProps = { kind: cls.kind, label: cls.label };
        if (props.name) cleanProps.name = String(props.name).trim();
        lanes.push({
          type: 'Feature',
          properties: cleanProps,
          geometry: {
            type: gtype,
            coordinates: roundCoords(geom.coordinates),
          },
        });
      } else if (cls.category === 'poi') {
        let pt = null;
        if (gtype === 'Point' && Array.isArray(geom.coordinates)) {
          pt = roundCoords(geom.coordinates.slice(0, 2));
        } else if (gtype === 'Polygon') {
          pt = polygonCentroid(geom.coordinates);
        } else if (gtype === 'MultiPolygon' && geom.coordinates?.[0]) {
          pt = polygonCentroid(geom.coordinates[0]);
        }
        if (pt) {
          const cleanProps = { kind: cls.kind, label: cls.label };
          if (props.name) cleanProps.name = String(props.name).trim();
          if (props.operator) cleanProps.operator = String(props.operator).trim();
          if (props.network) cleanProps.network = String(props.network).trim();
          if (props.capacity) cleanProps.capacity = Number(props.capacity) || undefined;
          pois.push({
            type: 'Feature',
            properties: cleanProps,
            geometry: {
              type: 'Point',
              coordinates: pt,
            },
          });
        }
      }
    }

    const lanesPath = path.join(OUT_DIR, `${cap.slug}-lanes.geojson`);
    const poisPath = path.join(OUT_DIR, `${cap.slug}-pois.geojson`);
    fs.writeFileSync(lanesPath, JSON.stringify({ type: 'FeatureCollection', features: lanes }));
    fs.writeFileSync(poisPath, JSON.stringify({ type: 'FeatureCollection', features: pois }));

    const lanesKb = Math.round(fs.statSync(lanesPath).size / 1024);
    const poisKb = Math.round(fs.statSync(poisPath).size / 1024);
    summaryStats.push({
      slug: cap.slug,
      name: cap.name,
      uf: cap.uf,
      totalKm: totalProtectedKm,
      cicloviaKm,
      ciclofaixaKm,
      lanesCount: lanes.length,
      poisCount: pois.length,
      lanesKb,
      poisKb,
    });
    console.log(
      `[${cap.slug}] ${lanes.length} lanes (${lanesKb} KB), ${pois.length} POIs (${poisKb} KB), ${totalProtectedKm} km`
    );
  }

  fs.writeFileSync(
    '/tmp/ciclomapa-dl/summary-stats.json',
    JSON.stringify(summaryStats, null, 2)
  );
  console.log('\nCompleted all 27 Brazilian capitals!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
