import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

const ISLAND_LABELS = [
  { name: 'Hoàng Sa', lng: 111.5, lat: 17.1 },
  { name: 'Trường Sa', lng: 114.6, lat: 11.5 },
]

let cachedPromise: Promise<any> | null = null
let cachedGeo: any = null

function fetchVnBoundary(): Promise<any> {
  if (cachedGeo) return Promise.resolve(cachedGeo)
  if (!cachedPromise) {
    cachedPromise = fetch('/api/static/atlas/vn_boundary.json')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load VN boundary')
        return r.json()
      })
      .then(geo => {
        cachedGeo = geo
        return geo
      })
      .catch(err => {
        cachedPromise = null
        throw err
      })
  }
  return cachedPromise
}

function addIslandLabelsLeaflet(map: L.Map): void {
  ISLAND_LABELS.forEach(({ name, lng, lat }) => {
    const icon = L.divIcon({
      className: '',
      html: `<span style="
        font-size:11px;font-weight:600;color:#64748b;
        text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;
        white-space:nowrap;letter-spacing:0.3px;
        pointer-events:none;user-select:none;
      ">${name}</span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })
    L.marker([lat, lng], { icon, interactive: false, keyboard: false }).addTo(map)
  })
}

const ISLAND_LABELS_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: ISLAND_LABELS.map(({ name, lng, lat }) => ({
    type: 'Feature' as const,
    properties: { name },
    geometry: { type: 'Point' as const, coordinates: [lng, lat] },
  })),
}

// For React Leaflet maps — uses useMap() internally, must be rendered inside <MapContainer>
export default function VnBoundaryOverlay() {
  const map = useMap()
  const layerRef = useRef<L.GeoJSON | null>(null)
  const labelAddedRef = useRef(false)

  useEffect(() => {
    fetchVnBoundary().then(geo => {
      if (geo?.features?.length) {
        layerRef.current = L.geoJSON(geo, {
          interactive: false,
          style: {
            color: '#94a3b8',
            weight: 1,
            fillOpacity: 0,
          },
        }).addTo(map)
      }
    }).catch(() => {})

    if (!labelAddedRef.current) {
      labelAddedRef.current = true
      addIslandLabelsLeaflet(map)
    }

    return () => {
      if (layerRef.current) {
        layerRef.current.remove()
        layerRef.current = null
      }
    }
  }, [map])

  return null
}

// For vanilla Leaflet maps (JourneyMap)
export function addVnBoundaryToMap(map: L.Map): void {
  fetchVnBoundary().then(geo => {
    if (geo?.features?.length) {
      L.geoJSON(geo, {
        interactive: false,
        style: {
          color: '#94a3b8',
          weight: 1,
          fillOpacity: 0,
        },
      }).addTo(map)
    }
  }).catch(() => {})
  addIslandLabelsLeaflet(map)
}

// For Mapbox GL / MapLibre GL maps (JourneyMapGL, MapViewGL)
export async function addVnBoundaryToGlMap(map: mapboxgl.Map | maplibregl.Map): Promise<void> {
  try {
    const geo = await fetchVnBoundary()
    if (!geo?.features?.length) return

    const srcId = 'vn-boundary'
    const labelSrcId = 'vn-island-labels'

    if (map.getSource(srcId)) {
      ;(map.getSource(srcId) as mapboxgl.GeoJSONSource).setData(geo)
      return
    }

    map.addSource(srcId, { type: 'geojson', data: geo as any })
    map.addLayer({
      id: 'vn-boundary-fill',
      type: 'fill',
      source: srcId,
      paint: { 'fill-color': '#94a3b8', 'fill-opacity': 0 },
    } as any)
    map.addLayer({
      id: 'vn-boundary-line',
      type: 'line',
      source: srcId,
      paint: { 'line-color': '#94a3b8', 'line-width': 1, 'line-opacity': 0.5 },
    } as any)

    if (!map.getSource(labelSrcId)) {
      map.addSource(labelSrcId, { type: 'geojson', data: ISLAND_LABELS_GEOJSON as any })
      map.addLayer({
        id: 'vn-island-label',
        type: 'symbol',
        source: labelSrcId,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#64748b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      } as any)
    }
  } catch {}
}

import type mapboxgl from 'mapbox-gl'
import type maplibregl from 'maplibre-gl'
