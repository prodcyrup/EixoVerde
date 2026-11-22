import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { getMapStyle } from '../../config/providers';
import { getCapitalBySlug } from '../../data/brazilCities';
import { buildMobilityStationsCollection } from '../../data/mobilityStations';
import { buildLaneSpatialIndex, normalizeAngleDiff } from '../../engine/geo';
import { buildSafetyRouteSegments } from '../../engine/routeSegments';
import { useAppStore } from '../../store/useAppStore';
import type { LngLat } from '../../types';

const SRC_LANES = 'ev-ciclomapa-lanes';
const SRC_POIS = 'ev-ciclomapa-pois';
const SRC_STATIONS = 'ev-mobility-stations';
const SRC_ALT_ROUTES = 'ev-alt-routes';
const SRC_ACTIVE_ROUTE = 'ev-active-route';
const SRC_ROUTE_SAFETY = 'ev-active-route-safety';
const SRC_COMPLETED_ROUTE = 'ev-completed-route';
const SRC_RIDE_TRACK = 'ev-ride-track';

export function EixoVerdeMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const styleReadyRef = useRef(false);
  const lanesDataRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const poisDataRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const stationsDataRef = useRef<GeoJSON.FeatureCollection>(buildMobilityStationsCollection(null).geojson);

  const waypointMarkersRef = useRef<maplibregl.Marker[]>([]);
  const crossingMarkersRef = useRef<maplibregl.Marker[]>([]);
  const hazardMarkersRef = useRef<maplibregl.Marker[]>([]);
  const savedPlaceMarkersRef = useRef<maplibregl.Marker[]>([]);
  const replayMarkersRef = useRef<maplibregl.Marker[]>([]);
  const contextPinMarkerRef = useRef<maplibregl.Marker | null>(null);
  const lastCenteredContextKeyRef = useRef<string | null>(null);
  const gpsMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hoverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const smoothedHeadingRef = useRef<number | null>(null);

  const theme = useAppStore((s) => s.theme);
  const basemap = useAppStore((s) => s.basemap);
  const mode = useAppStore((s) => s.mode);
  const selectedCitySlug = useAppStore((s) => s.selectedCitySlug);
  const showBikeLanes = useAppStore((s) => s.showBikeLanes);
  const showPois = useAppStore((s) => s.showPois);
  const showStations = useAppStore((s) => s.showStations);
  const showHazards = useAppStore((s) => s.showHazards);
  const showSafetySegments = useAppStore((s) => s.showSafetySegments);
  const candidates = useAppStore((s) => s.candidates);
  const selectedCandidateIdx = useAppStore((s) => s.selectedCandidateIdx);
  const isEditingWaypoints = useAppStore((s) => s.isEditingWaypoints);
  const mapPickTarget = useAppStore((s) => s.mapPickTarget);
  const hazards = useAppStore((s) => s.hazards);
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const rideSessions = useAppStore((s) => s.rideSessions);
  const activeRide = useAppStore((s) => s.activeRide);
  const replayingRideId = useAppStore((s) => s.replayingRideId);
  const mapContextPin = useAppStore((s) => s.mapContextPin);
  const hoverCoordIndex = useAppStore((s) => s.hoverCoordIndex);
  const fitBoundsNonce = useAppStore((s) => s.fitBoundsNonce);
  const flyToTarget = useAppStore((s) => s.flyToTarget);
  const nav = useAppStore((s) => s.nav);

  // Helper to attach EixoVerde vector sources & layers after every style load
  const attachOverlayLayers = (map: maplibregl.Map) => {
    const st = useAppStore.getState();
    const isDark = st.theme === 'dark';
    const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

    if (!map.getSource(SRC_LANES)) {
      map.addSource(SRC_LANES, {
        type: 'geojson',
        data: lanesDataRef.current ?? emptyFC,
      });
    }
    if (!map.getSource(SRC_POIS)) {
      map.addSource(SRC_POIS, {
        type: 'geojson',
        data: poisDataRef.current ?? emptyFC,
      });
    }
    if (!map.getSource(SRC_STATIONS)) {
      map.addSource(SRC_STATIONS, {
        type: 'geojson',
        data: stationsDataRef.current,
      });
    }
    if (!map.getSource(SRC_ALT_ROUTES)) {
      map.addSource(SRC_ALT_ROUTES, { type: 'geojson', data: emptyFC });
    }
    if (!map.getSource(SRC_ACTIVE_ROUTE)) {
      map.addSource(SRC_ACTIVE_ROUTE, { type: 'geojson', data: emptyFC });
    }
    if (!map.getSource(SRC_ROUTE_SAFETY)) {
      map.addSource(SRC_ROUTE_SAFETY, { type: 'geojson', data: emptyFC });
    }
    if (!map.getSource(SRC_COMPLETED_ROUTE)) {
      map.addSource(SRC_COMPLETED_ROUTE, { type: 'geojson', data: emptyFC });
    }
    if (!map.getSource(SRC_RIDE_TRACK)) {
      map.addSource(SRC_RIDE_TRACK, { type: 'geojson', data: emptyFC });
    }

    const laneVis = st.showBikeLanes ? 'visible' : 'none';
    const poiVis = st.showPois ? 'visible' : 'none';
    const stationVis = st.showStations ? 'visible' : 'none';

    // 1. Prohibited high-speed roads (subtle warning at zoom >= 13)
    if (!map.getLayer('ev-lanes-proibido')) {
      map.addLayer({
        id: 'ev-lanes-proibido',
        type: 'line',
        source: SRC_LANES,
        minzoom: 12.5,
        filter: ['==', ['get', 'kind'], 'proibido'],
        layout: { 'line-cap': 'round', 'line-join': 'round', visibility: laneVis },
        paint: {
          'line-color': '#ef4444',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12.5, 1.5, 16, 3.2],
          'line-opacity': 0.35,
          'line-dasharray': [2, 2],
        },
      });
    }

    // 2. Low-speed calm streets & trails
    if (!map.getLayer('ev-lanes-calm')) {
      map.addLayer({
        id: 'ev-lanes-calm',
        type: 'line',
        source: SRC_LANES,
        minzoom: 12,
        filter: ['in', ['get', 'kind'], ['literal', ['baixa_velocidade', 'trilha', 'calcada']]],
        layout: { 'line-cap': 'round', 'line-join': 'round', visibility: laneVis },
        paint: {
          'line-color': [
            'match',
            ['get', 'kind'],
            'trilha',
            '#d97706',
            'calcada',
            '#06b6d4',
            '#14b8a6',
          ],
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.4, 16, 3.2],
          'line-opacity': isDark ? 0.6 : 0.55,
          'line-dasharray': [2.2, 1.8],
        },
      });
    }

    // 3. Dedicated Ciclovias & Ciclofaixas (casing + bright lime-green core to contrast clearly with emerald active routes)
    if (!map.getLayer('ev-lanes-dedicated-casing')) {
      map.addLayer({
        id: 'ev-lanes-dedicated-casing',
        type: 'line',
        source: SRC_LANES,
        filter: ['in', ['get', 'kind'], ['literal', ['ciclovia', 'ciclofaixa']]],
        layout: { 'line-cap': 'round', 'line-join': 'round', visibility: laneVis },
        paint: {
          'line-color': isDark ? '#1a2e05' : '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 14, 5.2, 17, 7.5],
          'line-opacity': 0.78,
        },
      });
    }

    if (!map.getLayer('ev-lanes-dedicated')) {
      map.addLayer({
        id: 'ev-lanes-dedicated',
        type: 'line',
        source: SRC_LANES,
        filter: ['in', ['get', 'kind'], ['literal', ['ciclovia', 'ciclofaixa']]],
        layout: { 'line-cap': 'round', 'line-join': 'round', visibility: laneVis },
        paint: {
          'line-color': [
            'match',
            ['get', 'kind'],
            'ciclofaixa',
            '#0ea5e9',
            isDark ? '#84cc16' : '#65a30d',
          ],
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 14, 3.2, 17, 4.8],
          'line-opacity': 0.88,
        },
      });
    }

    // 4. Cycling POIs (racks & repair shops — stations render on dedicated Tembici/JET layer)
    if (!map.getLayer('ev-pois-circle')) {
      map.addLayer({
        id: 'ev-pois-circle',
        type: 'circle',
        source: SRC_POIS,
        minzoom: 12.8,
        filter: ['!=', ['get', 'kind'], 'estacao'],
        layout: { visibility: poiVis },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12.8, 3.8, 16, 6.8],
          'circle-color': [
            'match',
            ['get', 'kind'],
            'oficina',
            '#f59e0b',
            '#10b981',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': isDark ? '#0f172a' : '#ffffff',
        },
      });
    }

    // 4b. Dedicated Tembici (Bike Brasília) & JET Scooter Hubs layer
    if (!map.getLayer('ev-stations-circle')) {
      map.addLayer({
        id: 'ev-stations-circle',
        type: 'circle',
        source: SRC_STATIONS,
        minzoom: 11.4,
        layout: { visibility: stationVis },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11.4, 4.5, 14, 7.2, 16.5, 9.5],
          'circle-color': [
            'match',
            ['get', 'provider'],
            'jet',
            '#0284c7',
            '#f97316',
          ],
          'circle-stroke-width': 2.2,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    // 5. Alternative route candidates (clickable directly on map)
    if (!map.getLayer('ev-alt-routes-casing')) {
      map.addLayer({
        id: 'ev-alt-routes-casing',
        type: 'line',
        source: SRC_ALT_ROUTES,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': isDark ? '#0f172a' : '#ffffff',
          'line-width': 9,
          'line-opacity': 0.8,
        },
      });
    }
    if (!map.getLayer('ev-alt-routes-line')) {
      map.addLayer({
        id: 'ev-alt-routes-line',
        type: 'line',
        source: SRC_ALT_ROUTES,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': isDark ? '#64748b' : '#94a3b8',
          'line-width': 5.5,
          'line-opacity': 0.85,
        },
      });
    }

    // 6. Active selected route (bold casing + emerald ribbon + color-coded safety segments)
    if (!map.getLayer('ev-active-route-casing')) {
      map.addLayer({
        id: 'ev-active-route-casing',
        type: 'line',
        source: SRC_ACTIVE_ROUTE,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': isDark ? '#022c22' : '#0f172a',
          'line-width': 11,
          'line-opacity': 0.9,
        },
      });
    }
    if (!map.getLayer('ev-active-route-line')) {
      map.addLayer({
        id: 'ev-active-route-line',
        type: 'line',
        source: SRC_ACTIVE_ROUTE,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#22c55e',
          'line-width': 6.5,
          'line-opacity': 1,
        },
      });
    }
    if (!map.getLayer('ev-active-route-safety-line')) {
      map.addLayer({
        id: 'ev-active-route-safety-line',
        type: 'line',
        source: SRC_ROUTE_SAFETY,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': [
            'match',
            ['get', 'safetyClass'],
            'ciclovia',
            '#10b981',
            'ciclofaixa',
            '#0ea5e9',
            'via_calma',
            '#f59e0b',
            '#f43f5e',
          ],
          'line-width': 6.8,
          'line-opacity': 1,
        },
      });
    }

    // 7. Completed portion during live navigation
    if (!map.getLayer('ev-completed-route-line')) {
      map.addLayer({
        id: 'ev-completed-route-line',
        type: 'line',
        source: SRC_COMPLETED_ROUTE,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': isDark ? '#475569' : '#94a3b8',
          'line-width': 6.8,
          'line-opacity': 0.82,
        },
      });
    }

    // 8. Recorded Free Ride breadcrumb & Meus Pedais map replay track
    if (!map.getLayer('ev-ride-track-casing')) {
      map.addLayer({
        id: 'ev-ride-track-casing',
        type: 'line',
        source: SRC_RIDE_TRACK,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': isDark ? '#0c4a6e' : '#082f49',
          'line-width': 10,
          'line-opacity': 0.88,
        },
      });
    }
    if (!map.getLayer('ev-ride-track-line')) {
      map.addLayer({
        id: 'ev-ride-track-line',
        type: 'line',
        source: SRC_RIDE_TRACK,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 5.5,
          'line-opacity': 0.96,
        },
      });
    }
  };

  // Sync route GeoJSON into MapLibre sources
  const syncRoutesToMap = (map: maplibregl.Map) => {
    if (!styleReadyRef.current) return;
    const state = useAppStore.getState();
    const {
      candidates: cands,
      selectedCandidateIdx: selIdx,
      mode: curMode,
      nav: curNav,
      activeRide: curActiveRide,
      rideSessions: curRides,
      replayingRideId: curReplayId,
      showSafetySegments: safetyOn,
    } = state;

    const altSrc = map.getSource(SRC_ALT_ROUTES) as maplibregl.GeoJSONSource | undefined;
    const actSrc = map.getSource(SRC_ACTIVE_ROUTE) as maplibregl.GeoJSONSource | undefined;
    const safetySrc = map.getSource(SRC_ROUTE_SAFETY) as maplibregl.GeoJSONSource | undefined;
    const compSrc = map.getSource(SRC_COMPLETED_ROUTE) as maplibregl.GeoJSONSource | undefined;
    const rideSrc = map.getSource(SRC_RIDE_TRACK) as maplibregl.GeoJSONSource | undefined;
    if (!altSrc || !actSrc || !compSrc) return;

    // Sync Free Ride live breadcrumb OR Meus Pedais replay track
    if (rideSrc) {
      let rideCoords: number[][] = [];
      if (curMode === 'navigate' && curNav.isFreeRide && curActiveRide && curActiveRide.track.length >= 2) {
        rideCoords = curActiveRide.track.map((pt) => [pt.lng, pt.lat]);
      } else if (curMode !== 'navigate' && curReplayId) {
        const replayed = curRides.find((r) => r.id === curReplayId);
        if (replayed && replayed.track.length >= 2) {
          rideCoords = replayed.track.map((pt) => [pt.lng, pt.lat]);
        }
      }
      rideSrc.setData({
        type: 'FeatureCollection',
        features:
          rideCoords.length >= 2
            ? [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: { type: 'LineString', coordinates: rideCoords },
                },
              ]
            : [],
      });
    }

    const altFeatures: GeoJSON.Feature[] =
      curMode === 'navigate'
        ? []
        : cands
            .map((c, idx) => ({ c, idx }))
            .filter(({ idx }) => idx !== selIdx)
            .map(({ c, idx }) => ({
              type: 'Feature',
              properties: { candidateIdx: idx, profile: c.profile },
              geometry: {
                type: 'LineString',
                coordinates: c.coords.map((pt) => [pt[0], pt[1]]),
              },
            }));

    altSrc.setData({ type: 'FeatureCollection', features: altFeatures });

    const active = curNav.isFreeRide ? undefined : cands[selIdx];
    if (!active || active.coords.length < 2) {
      actSrc.setData({ type: 'FeatureCollection', features: [] });
      safetySrc?.setData({ type: 'FeatureCollection', features: [] });
      compSrc.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const lineCoords = active.coords.map((pt) => [pt[0], pt[1]]);
    actSrc.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { profile: active.profile },
          geometry: { type: 'LineString', coordinates: lineCoords },
        },
      ],
    });

    if (safetySrc) {
      if (safetyOn) {
        const segs = buildSafetyRouteSegments(active.coords, active.profile);
        safetySrc.setData(segs.geojson);
      } else {
        safetySrc.setData({ type: 'FeatureCollection', features: [] });
      }
    }

    // Split completed segment when navigating
    if (curMode === 'navigate' && curNav.distanceAlongM > 15) {
      const totalM = Math.max(1, active.distanceKm * 1000);
      const ratio = Math.min(1, curNav.distanceAlongM / totalM);
      const splitIdx = Math.max(2, Math.floor(ratio * lineCoords.length));
      compSrc.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: lineCoords.slice(0, splitIdx) },
          },
        ],
      });
    } else {
      compSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  // Initialize MapLibre instance once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initial = useAppStore.getState();
    const initialCap = getCapitalBySlug(initial.selectedCitySlug);
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyle(initial.theme, initial.basemap) as maplibregl.StyleSpecification | string,
      center: initialCap.center,
      zoom: initialCap.zoom,
      pitch: 0,
      bearing: 0,
      maxPitch: 68,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    const onStyleLoad = () => {
      styleReadyRef.current = true;
      attachOverlayLayers(map);
      syncRoutesToMap(map);
    };

    map.on('style.load', onStyleLoad);

    // Click alternative route directly on map to select it
    map.on('click', 'ev-alt-routes-line', (e) => {
      const idx = e.features?.[0]?.properties?.candidateIdx;
      if (typeof idx === 'number') {
        useAppStore.getState().selectCandidate(idx);
      }
    });

    // Click Tembici / JET station circle to show XSS-safe DOM popup with 1-tap routing CTA
    map.on('click', 'ev-stations-circle', (e) => {
      const feat = e.features?.[0];
      if (!feat || feat.geometry.type !== 'Point') return;
      const props = feat.properties as {
        id?: string;
        provider?: 'tembici' | 'jet';
        name?: string;
        subtitle?: string;
        capacityHint?: string;
      };
      const coords = feat.geometry.coordinates as LngLat;
      const isJet = props.provider === 'jet';
      const activeCap = getCapitalBySlug(useAppStore.getState().selectedCitySlug);

      const root = document.createElement('div');
      root.style.cssText = 'font-family:Inter,sans-serif;min-width:190px;padding:2px 0';

      const badgeEl = document.createElement('div');
      badgeEl.style.cssText = `font-size:10px;font-weight:800;text-transform:uppercase;color:${isJet ? '#0284c7' : '#ea580c'};margin-bottom:2px`;
      badgeEl.textContent = isJet ? '⚡ Hub Patinete JET' : `🚲 ${activeCap.bikeShareBrand}`;
      root.appendChild(badgeEl);

      const titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:13px;font-weight:700;color:#0f172a';
      titleEl.textContent = props.name || 'Estação de Mobilidade';
      root.appendChild(titleEl);

      if (props.subtitle || props.capacityHint) {
        const subEl = document.createElement('div');
        subEl.style.cssText = 'font-size:11px;color:#475569;margin-top:2px';
        subEl.textContent = [props.subtitle, props.capacityHint].filter(Boolean).join(' • ');
        root.appendChild(subEl);
      }

      const routeBtn = document.createElement('button');
      routeBtn.type = 'button';
      routeBtn.style.cssText =
        'margin-top:8px;width:100%;background:#059669;color:#fff;border:none;border-radius:10px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer';
      routeBtn.textContent = 'Ir até esta estação';

      const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '250px', offset: 14 })
        .setLngLat(coords)
        .setDOMContent(root)
        .addTo(map);

      routeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        popup.remove();
        void useAppStore.getState().setDestination(
          {
            id: props.id || `station-${Date.now()}`,
            name: props.name || 'Estação de Mobilidade',
            subtitle: props.subtitle || 'Brasília, DF',
            coords,
            source: 'curated',
          },
          true
        );
      });
      root.appendChild(routeBtn);
    });

    // Click POI circle to show crisp XSS-safe DOM popup
    map.on('click', 'ev-pois-circle', (e) => {
      const feat = e.features?.[0];
      if (!feat || feat.geometry.type !== 'Point') return;
      const props = feat.properties as { name?: string; label?: string; kind?: string };
      const coords = feat.geometry.coordinates as LngLat;
      const root = document.createElement('div');
      root.style.cssText = 'font-family:Inter,sans-serif;padding:2px 0';
      const badgeEl = document.createElement('div');
      badgeEl.style.cssText = 'font-size:11px;font-weight:700;color:#059669;margin-bottom:2px';
      badgeEl.textContent = props.kind === 'oficina' ? '🔧 Oficina / Loja' : '🅿️ Bicicletário';
      const titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:13px;font-weight:600;color:#0f172a';
      titleEl.textContent = props.name || props.label || 'Ponto Cicloviário';
      root.appendChild(badgeEl);
      root.appendChild(titleEl);
      new maplibregl.Popup({ closeButton: true, maxWidth: '240px', offset: 12 })
        .setLngLat(coords)
        .setDOMContent(root)
        .addTo(map);
    });

    // Click bike lane to inspect name/kind when not picking a waypoint
    map.on('click', 'ev-lanes-dedicated', (e) => {
      const st = useAppStore.getState();
      if (st.mapPickTarget || st.isEditingWaypoints || st.mode === 'navigate') return;
      const feat = e.features?.[0];
      if (!feat) return;
      const props = feat.properties as { name?: string; label?: string; kind?: string };
      const root = document.createElement('div');
      root.style.cssText = 'font-family:Inter,sans-serif;padding:2px 0';
      const badgeEl = document.createElement('div');
      badgeEl.style.cssText = `font-size:11px;font-weight:700;color:${props.kind === 'ciclofaixa' ? '#0284c7' : '#059669'}`;
      badgeEl.textContent = props.label || 'Ciclovia';
      const titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:12px;font-weight:600;color:#0f172a';
      titleEl.textContent = props.name || 'Malha Cicloviária DF';
      root.appendChild(badgeEl);
      root.appendChild(titleEl);
      new maplibregl.Popup({ closeButton: false, maxWidth: '230px', offset: 10 })
        .setLngLat(e.lngLat)
        .setDOMContent(root)
        .addTo(map);
    });

    // General map click for picking origin/dest/via/hazard or dismissing context popup
    map.on('click', (e) => {
      const st = useAppStore.getState();
      if (st.mapPickTarget || st.isEditingWaypoints) {
        void st.handleMapClick([+e.lngLat.lng.toFixed(6), +e.lngLat.lat.toFixed(6)]);
        return;
      }
      if (st.mapContextPin) {
        st.closeMapContextPin();
      }
    });

    // Desktop right-click -> open pin-anchored quick place popup
    map.on('contextmenu', (e) => {
      const st = useAppStore.getState();
      if (st.mode === 'navigate') return;
      e.preventDefault();
      void st.openMapContextPin([+e.lngLat.lng.toFixed(6), +e.lngLat.lat.toFixed(6)]);
    });

    // Mobile long-press (~450ms single-finger hold) -> open quick place popup
    const canvas = map.getCanvas();
    let longPressTimer: number | null = null;
    let pressStartPt: { x: number; y: number } | null = null;

    const cancelLongPress = () => {
      if (longPressTimer !== null) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      pressStartPt = null;
    };

    const onTouchStart = (ev: TouchEvent) => {
      if (ev.touches.length !== 1) {
        cancelLongPress();
        return;
      }
      const st = useAppStore.getState();
      if (st.mode === 'navigate' || st.mapPickTarget) return;
      const touch = ev.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      pressStartPt = { x, y };

      longPressTimer = window.setTimeout(() => {
        longPressTimer = null;
        if (!pressStartPt) return;
        const lngLat = map.unproject([pressStartPt.x, pressStartPt.y]);
        if (navigator.vibrate) {
          try {
            navigator.vibrate(18);
          } catch {
            // Ignore
          }
        }
        void useAppStore.getState().openMapContextPin([+lngLat.lng.toFixed(6), +lngLat.lat.toFixed(6)]);
      }, 450);
    };

    const onTouchMove = (ev: TouchEvent) => {
      if (!pressStartPt || ev.touches.length !== 1) {
        cancelLongPress();
        return;
      }
      const touch = ev.touches[0];
      const rect = canvas.getBoundingClientRect();
      const dx = touch.clientX - rect.left - pressStartPt.x;
      const dy = touch.clientY - rect.top - pressStartPt.y;
      if (dx * dx + dy * dy > 100) {
        cancelLongPress();
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', cancelLongPress, { passive: true });
    canvas.addEventListener('touchcancel', cancelLongPress, { passive: true });

    // If user drags map during live nav, pause auto-follow so they can pan freely
    map.on('dragstart', () => {
      cancelLongPress();
      const st = useAppStore.getState();
      if (st.mode === 'navigate' && st.nav.followUser) {
        st.updateNavTelemetry({ followUser: false });
      }
    });
    map.on('zoomstart', cancelLongPress);

    // Hover cursor feedback
    ['ev-alt-routes-line', 'ev-pois-circle', 'ev-stations-circle', 'ev-lanes-dedicated'].forEach((layerId) => {
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = useAppStore.getState().mapPickTarget ? 'crosshair' : '';
      });
    });

    return () => {
      cancelLongPress();
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', cancelLongPress);
      canvas.removeEventListener('touchcancel', cancelLongPress);
      map.remove();
      mapRef.current = null;
      styleReadyRef.current = false;
    };
  }, []);

  // Lazy-load the active capital's CicloMapa lanes, POIs, and shared bike-share stations on demand
  useEffect(() => {
    let cancelled = false;
    const cap = getCapitalBySlug(selectedCitySlug);
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
    const lanesUrl =
      cap.slug === 'brasilia'
        ? `${baseUrl}data/ciclomapa-df-lanes.geojson`
        : `${baseUrl}${cap.lanesUrl}`;
    const poisUrl =
      cap.slug === 'brasilia'
        ? `${baseUrl}data/ciclomapa-df-pois.geojson`
        : `${baseUrl}${cap.poisUrl}`;

    Promise.all([
      fetch(lanesUrl).then((r) => (r.ok ? r.json() : null)),
      fetch(poisUrl).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([lanes, pois]) => {
        if (cancelled) return;
        const map = mapRef.current;
        if (lanes) {
          lanesDataRef.current = lanes;
          buildLaneSpatialIndex(lanes);
          if (map && styleReadyRef.current) {
            const src = map.getSource(SRC_LANES) as maplibregl.GeoJSONSource | undefined;
            src?.setData(lanes);
            syncRoutesToMap(map);
          }
        }
        if (pois) {
          poisDataRef.current = pois;
          const mergedStations = buildMobilityStationsCollection(
            pois,
            cap.slug,
            cap.bikeShareBrand
          );
          stationsDataRef.current = mergedStations.geojson;
          if (map && styleReadyRef.current) {
            const src = map.getSource(SRC_POIS) as maplibregl.GeoJSONSource | undefined;
            src?.setData(pois);
            const stationSrc = map.getSource(SRC_STATIONS) as maplibregl.GeoJSONSource | undefined;
            stationSrc?.setData(mergedStations.geojson);
          }
        }
      })
      .catch(() => {
        // Offline or missing static files — map & fallback stations still work cleanly
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCitySlug]);

  // Update map style on theme / basemap changes
  const prevStyleKeyRef = useRef(`${theme}-${basemap}`);
  useEffect(() => {
    const map = mapRef.current;
    const nextKey = `${theme}-${basemap}`;
    if (!map || prevStyleKeyRef.current === nextKey) return;
    prevStyleKeyRef.current = nextKey;
    styleReadyRef.current = false;
    map.setStyle(getMapStyle(theme, basemap) as maplibregl.StyleSpecification | string);
  }, [theme, basemap]);

  // Cursor when picking a point on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = mapPickTarget || isEditingWaypoints ? 'crosshair' : '';
  }, [mapPickTarget, isEditingWaypoints]);

  // Toggle bike lanes / POIs / Stations visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReadyRef.current) return;
    const laneVis = showBikeLanes ? 'visible' : 'none';
    ['ev-lanes-proibido', 'ev-lanes-calm', 'ev-lanes-dedicated-casing', 'ev-lanes-dedicated'].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', laneVis);
    });
    if (map.getLayer('ev-pois-circle')) {
      map.setLayoutProperty('ev-pois-circle', 'visibility', showPois ? 'visible' : 'none');
    }
    if (map.getLayer('ev-stations-circle')) {
      map.setLayoutProperty('ev-stations-circle', 'visibility', showStations ? 'visible' : 'none');
    }
  }, [showBikeLanes, showPois, showStations]);

  // Sync routes, safety segments & ride replay/breadcrumb whenever state updates
  useEffect(() => {
    const map = mapRef.current;
    if (map) syncRoutesToMap(map);
  }, [
    candidates,
    selectedCandidateIdx,
    mode,
    showSafetySegments,
    nav.distanceAlongM,
    nav.isFreeRide,
    activeRide?.track.length,
    replayingRideId,
    rideSessions,
  ]);

  // Fit bounds & render Start/Finish pins when replaying a ride from Meus Pedais
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    replayMarkersRef.current.forEach((m) => m.remove());
    replayMarkersRef.current = [];

    if (!replayingRideId || mode === 'navigate') return;
    const replayed = rideSessions.find((r) => r.id === replayingRideId);
    if (!replayed || replayed.track.length < 2) return;

    const bounds = new maplibregl.LngLatBounds();
    replayed.track.forEach((pt) => bounds.extend([pt.lng, pt.lat]));
    const isDesktop = window.innerWidth >= 1024;
    map.fitBounds(bounds, {
      padding: isDesktop
        ? { top: 88, bottom: 90, left: 460, right: 80 }
        : { top: 96, bottom: 320, left: 48, right: 48 },
      duration: 650,
      pitch: 0,
      bearing: 0,
    });

    const first = replayed.track[0];
    const last = replayed.track[replayed.track.length - 1];
    const startEl = document.createElement('div');
    startEl.innerHTML = `<div style="width:26px;height:26px;border-radius:999px;background:#0284c7;color:#fff;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.28)">I</div>`;
    const endEl = document.createElement('div');
    endEl.innerHTML = `<div style="width:26px;height:26px;border-radius:999px;background:#0f172a;color:#fff;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.28)">F</div>`;

    replayMarkersRef.current.push(
      new maplibregl.Marker({ element: startEl }).setLngLat([first.lng, first.lat]).addTo(map),
      new maplibregl.Marker({ element: endEl }).setLngLat([last.lng, last.lat]).addTo(map)
    );
  }, [replayingRideId, rideSessions, mode]);

  // Fit bounds smoothly when a new route is calculated or loaded
  useEffect(() => {
    const map = mapRef.current;
    const active = candidates[selectedCandidateIdx];
    if (!map || !active || active.coords.length < 2 || fitBoundsNonce === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    active.coords.forEach((c) => bounds.extend([c[0], c[1]]));

    const isDesktop = window.innerWidth >= 1024;
    map.fitBounds(bounds, {
      padding: isDesktop
        ? { top: 88, bottom: 90, left: 430, right: 80 }
        : { top: 96, bottom: 320, left: 42, right: 42 },
      duration: 750,
      pitch: 0,
      bearing: 0,
    });
  }, [fitBoundsNonce]);

  // Fly to searched/selected place
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToTarget) return;
    map.flyTo({
      center: flyToTarget.coords,
      zoom: flyToTarget.zoom ?? 15,
      duration: 750,
    });
  }, [flyToTarget]);

  // Render Waypoint & Arterial Crossing Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    waypointMarkersRef.current.forEach((m) => m.remove());
    waypointMarkersRef.current = [];
    crossingMarkersRef.current.forEach((m) => m.remove());
    crossingMarkersRef.current = [];

    const active = candidates[selectedCandidateIdx];
    if (!active) return;

    // Waypoint markers (draggable when editing or previewing)
    active.waypoints.forEach((wp, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === active.waypoints.length - 1;
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center shadow-lg select-none transition-transform';
      if (isStart) {
        el.innerHTML = `<div style="width:28px;height:28px;border-radius:999px;background:#059669;color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.28)">A</div>`;
      } else if (isEnd) {
        el.innerHTML = `<div style="width:28px;height:28px;border-radius:999px;background:#0f172a;color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.28)">B</div>`;
      } else {
        el.innerHTML = `<div style="width:22px;height:22px;border-radius:999px;background:#0284c7;color:#fff;font-weight:700;font-size:10px;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.25);cursor:grab">${idx}</div>`;
      }

      const draggable = mode !== 'navigate' && (isEditingWaypoints || (!isStart && !isEnd));
      const marker = new maplibregl.Marker({ element: el, draggable }).setLngLat(wp).addTo(map);
      if (draggable) {
        marker.on('dragend', () => {
          const ll = marker.getLngLat();
          void useAppStore.getState().updateWaypoint(idx, [+ll.lng.toFixed(6), +ll.lat.toFixed(6)]);
        });
      }
      waypointMarkersRef.current.push(marker);
    });

    // Arterial crossing danger pills — stagger closely-spaced crossings (e.g. L2N / EIXÃO N / W3N) so none overlap
    const placedCrossings: Array<{ coords: LngLat; offsetY: number }> = [];
    active.crossings.forEach((c) => {
      let offsetY = 0;
      const closeCount = placedCrossings.filter(
        (prev) =>
          Math.abs(prev.coords[0] - c.coords[0]) < 0.009 && Math.abs(prev.coords[1] - c.coords[1]) < 0.009
      ).length;
      if (closeCount === 1) offsetY = -22;
      else if (closeCount === 2) offsetY = 22;
      else if (closeCount >= 3) offsetY = closeCount % 2 === 0 ? -36 : 36;
      placedCrossings.push({ coords: c.coords, offsetY });

      const el = document.createElement('div');
      el.setAttribute('data-crossing-tag', c.shortTag);
      el.innerHTML = `<div style="background:${c.danger === 'alta' ? '#dc2626' : '#d97706'};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;border:2px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);white-space:nowrap;cursor:pointer">⚠ ${c.shortTag}</div>`;
      const popup = new maplibregl.Popup({ offset: 14, maxWidth: '240px' }).setHTML(
        `<div style="font-family:Inter,sans-serif">
           <div style="font-size:11px;font-weight:800;color:#dc2626">TRAVESSIA DE ATENÇÃO</div>
           <div style="font-size:13px;font-weight:700;color:#0f172a;margin:2px 0">${c.name}</div>
           <div style="font-size:12px;color:#475569;line-height:1.35">${c.note}</div>
         </div>`
      );
      const marker = new maplibregl.Marker({ element: el, offset: [0, offsetY] })
        .setLngLat(c.coords)
        .setPopup(popup)
        .addTo(map);
      crossingMarkersRef.current.push(marker);
    });
  }, [candidates, selectedCandidateIdx, isEditingWaypoints, mode]);

  // Render Community & Local Hazard Pins (XSS-safe DOM popup + Confirmar/Remover buttons)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    hazardMarkersRef.current.forEach((m) => m.remove());
    hazardMarkersRef.current = [];
    if (!showHazards) return;

    const iconMap: Record<string, string> = {
      buraco: '🕳️',
      bloqueio: '🚧',
      iluminacao: '💡',
      raizes: '🌳',
      cruzamento: '⚠️',
      agua: '💧',
    };

    hazards.forEach((h) => {
      const el = document.createElement('div');
      const badge = document.createElement('div');
      badge.style.cssText =
        'width:30px;height:30px;border-radius:10px;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer';
      badge.textContent = iconMap[h.kind] ?? '⚠️';
      el.appendChild(badge);

      const popupRoot = document.createElement('div');
      popupRoot.style.cssText = 'font-family:Inter,sans-serif;min-width:170px';

      const headerEl = document.createElement('div');
      headerEl.style.cssText = 'font-size:10px;font-weight:800;color:#d97706;text-transform:uppercase';
      headerEl.textContent = h.isCommunity
        ? `Alerta da Comunidade (${h.confirmations} conf.)`
        : `Alerta no Mapa (${h.confirmations} conf.)`;
      popupRoot.appendChild(headerEl);

      const titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:13px;font-weight:700;color:#0f172a;margin:2px 0';
      titleEl.textContent = h.title;
      popupRoot.appendChild(titleEl);

      if (h.note) {
        const noteEl = document.createElement('div');
        noteEl.style.cssText = 'font-size:12px;color:#475569;margin-bottom:6px';
        noteEl.textContent = h.note;
        popupRoot.appendChild(noteEl);
      }

      const actionsEl = document.createElement('div');
      actionsEl.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:6px';

      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.setAttribute('data-hazard-confirm', h.id);
      confirmBtn.disabled = Boolean(h.confirmedByMe);
      confirmBtn.style.cssText =
        'flex:1;background:#059669;color:#fff;border:none;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer';
      confirmBtn.textContent = h.confirmedByMe ? '✓ Confirmado' : `Confirmar (${h.confirmations})`;
      confirmBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        void useAppStore.getState().confirmHazard(h.id);
      });
      actionsEl.appendChild(confirmBtn);

      const st = useAppStore.getState();
      const canDelete = !h.isCommunity || !h.userId || h.userId === st.authUser?.id;
      if (canDelete) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.setAttribute('data-hazard-delete', h.id);
        delBtn.style.cssText =
          'background:#f1f5f9;color:#e11d48;border:1px solid #cbd5e1;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer';
        delBtn.textContent = 'Remover';
        delBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          void useAppStore.getState().deleteHazard(h.id);
        });
        actionsEl.appendChild(delBtn);
      }

      popupRoot.appendChild(actionsEl);

      const popup = new maplibregl.Popup({ offset: 16, maxWidth: '240px' }).setDOMContent(popupRoot);
      const marker = new maplibregl.Marker({ element: el }).setLngLat(h.coords).setPopup(popup).addTo(map);
      hazardMarkersRef.current.push(marker);
    });
  }, [hazards, showHazards]);

  // Render Saved Places (Casa, Trabalho, Favoritos) pins on map (XSS-safe DOM nodes)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    savedPlaceMarkersRef.current.forEach((m) => m.remove());
    savedPlaceMarkersRef.current = [];
    if (mode === 'navigate') return;

    savedPlaces.forEach((sp) => {
      const bg = sp.category === 'home' ? '#059669' : sp.category === 'work' ? '#0284c7' : '#d97706';
      const icon = sp.category === 'home' ? '🏠' : sp.category === 'work' ? '💼' : '⭐';
      const el = document.createElement('div');
      const pill = document.createElement('div');
      pill.style.cssText = `display:flex;align-items:center;gap:4px;background:${bg};color:#fff;font-family:Inter,sans-serif;font-size:11px;font-weight:700;padding:3px 8px 3px 6px;border-radius:999px;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.28);cursor:pointer;white-space:nowrap`;
      const iconSpan = document.createElement('span');
      iconSpan.textContent = icon;
      const labelSpan = document.createElement('span');
      labelSpan.textContent = sp.label.slice(0, 18);
      pill.appendChild(iconSpan);
      pill.appendChild(labelSpan);
      el.appendChild(pill);
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        void useAppStore.getState().setDestination(
          {
            id: sp.id,
            name: sp.label,
            subtitle: sp.address,
            coords: sp.coords,
            source: 'curated',
          },
          true
        );
      });
      const marker = new maplibregl.Marker({ element: el }).setLngLat(sp.coords).addTo(map);
      savedPlaceMarkersRef.current.push(marker);
    });
  }, [savedPlaces, mode]);

  // Elevation chart hover synced marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const active = candidates[selectedCandidateIdx];
    if (hoverCoordIndex === null || !active || !active.coords[hoverCoordIndex]) {
      hoverMarkerRef.current?.remove();
      hoverMarkerRef.current = null;
      return;
    }
    const pt = active.coords[hoverCoordIndex];
    if (!hoverMarkerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:16px;height:16px;border-radius:999px;background:#0284c7;border:3px solid #fff;box-shadow:0 2px 10px rgba(2,132,199,0.55)"></div>`;
      hoverMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([pt[0], pt[1]]).addTo(map);
    } else {
      hoverMarkerRef.current.setLngLat([pt[0], pt[1]]);
    }
  }, [hoverCoordIndex, candidates, selectedCandidateIdx]);

  // Long-press / Right-click dropped target pin marker + smooth centering + live screen projection for callout bubble
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!mapContextPin || mode === 'navigate') {
      contextPinMarkerRef.current?.remove();
      contextPinMarkerRef.current = null;
      lastCenteredContextKeyRef.current = null;
      useAppStore.getState().setMapContextScreenPos(null);
      return;
    }

    if (!contextPinMarkerRef.current) {
      const el = document.createElement('div');
      el.id = 'eixoverde-context-pin-marker';
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <div class="gps-pulse-ring" style="position:absolute;width:36px;height:36px;border-radius:999px;background:rgba(244,63,94,0.32)"></div>
        <div style="width:26px;height:26px;border-radius:999px 999px 999px 4px;transform:rotate(-45deg);background:#f43f5e;border:3px solid #ffffff;box-shadow:0 6px 16px rgba(0,0,0,0.38);display:flex;align-items:center;justify-content:center">
          <div style="width:8px;height:8px;border-radius:999px;background:#ffffff"></div>
        </div>
      `;
      contextPinMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(mapContextPin.coords)
        .addTo(map);
    } else {
      contextPinMarkerRef.current.setLngLat(mapContextPin.coords);
    }

    const syncProjectedPos = () => {
      const pt = map.project(mapContextPin.coords);
      const rect = map.getContainer().getBoundingClientRect();
      useAppStore.getState().setMapContextScreenPos({
        x: rect.left + pt.x,
        y: rect.top + pt.y,
      });
    };

    syncProjectedPos();

    // Smoothly center the map onto the marked pin with sidebar/bottom-sheet padding so the callout sits cleanly above it
    const coordKey = `${mapContextPin.coords[0]},${mapContextPin.coords[1]}`;
    if (lastCenteredContextKeyRef.current !== coordKey) {
      lastCenteredContextKeyRef.current = coordKey;
      const isDesktop = window.innerWidth >= 1024;
      map.easeTo({
        center: mapContextPin.coords,
        padding: isDesktop
          ? { top: 155, bottom: 40, left: 430, right: 64 }
          : { top: 195, bottom: Math.round(window.innerHeight * 0.48), left: 20, right: 20 },
        duration: 420,
      });
    }

    map.on('move', syncProjectedPos);
    map.on('zoom', syncProjectedPos);
    map.on('resize', syncProjectedPos);

    return () => {
      map.off('move', syncProjectedPos);
      map.off('zoom', syncProjectedPos);
      map.off('resize', syncProjectedPos);
    };
  }, [mapContextPin, mode]);

  // Live GPS / Demo Navigation Puck & Silky Camera Follow
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!nav.currentPos) {
      gpsMarkerRef.current?.remove();
      gpsMarkerRef.current = null;
      smoothedHeadingRef.current = null;
      return;
    }

    if (!gpsMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <div class="gps-pulse-ring" style="position:absolute;width:44px;height:44px;border-radius:999px;background:rgba(16,185,129,0.28)"></div>
        <div data-puck-arrow style="width:34px;height:34px;border-radius:999px;background:#059669;border:3px solid #ffffff;box-shadow:0 6px 16px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;transition:transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L19 21L12 17L5 21L12 2Z"/></svg>
        </div>
      `;
      gpsMarkerRef.current = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
        .setLngLat(nav.currentPos)
        .addTo(map);
    } else {
      gpsMarkerRef.current.setLngLat(nav.currentPos);
    }

    // Apply gentle exponential low-pass angular smoothing so curves & compass turns glide cleanly
    const prevHeading = smoothedHeadingRef.current;
    const smoothHeading =
      prevHeading === null
        ? nav.currentHeading
        : (prevHeading + normalizeAngleDiff(nav.currentHeading - prevHeading) * 0.45 + 360) % 360;
    smoothedHeadingRef.current = smoothHeading;

    const arrow = gpsMarkerRef.current.getElement().querySelector('[data-puck-arrow]') as HTMLElement | null;
    if (arrow) {
      arrow.style.transform = `rotate(${smoothHeading}deg)`;
    }

    if (mode === 'navigate' && nav.followUser) {
      const targetPitch = nav.pitch3D ? 56 : 0;
      map.easeTo({
        center: nav.currentPos,
        zoom: Math.max(map.getZoom(), 16.4),
        bearing: smoothHeading,
        pitch: targetPitch,
        duration: 360,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    }
  }, [nav.currentPos, nav.currentHeading, nav.followUser, mode]);

  // Dedicated 3D / 2D Camera Toggle (flat pitch 0 in 2D while still keeping live heading rotation)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mode === 'navigate') {
      map.stop();
      const heading = smoothedHeadingRef.current ?? useAppStore.getState().nav.currentHeading;
      if (nav.pitch3D) {
        map.touchPitch.enable();
        map.easeTo({
          pitch: 56,
          bearing: heading,
          duration: 360,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });
      } else {
        // Flat 2D top-down view that still rotates smoothly with phone compass / heading
        map.touchPitch.disable();
        map.jumpTo({ pitch: 0, bearing: heading });
      }
    } else {
      map.touchPitch.enable();
      smoothedHeadingRef.current = null;
      if (map.getPitch() > 2 || Math.abs(map.getBearing()) > 1) {
        map.easeTo({ pitch: 0, bearing: 0, duration: 480, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    }
  }, [nav.pitch3D, mode]);

  return (
    <div
      ref={containerRef}
      id="eixoverde-map-canvas"
      className="fixed inset-0 h-full w-full"
      aria-label="Mapa interativo EixoVerde"
    />
  );
}
