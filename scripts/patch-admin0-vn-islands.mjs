#!/usr/bin/env node
// Patch admin0.geojson.gz — merge Hoàng Sa & Trường Sa islands into the Vietnam
// admin0 feature so the country boundary includes both archipelagos at all zoom levels.
//
// Usage: node scripts/patch-admin0-vn-islands.mjs

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ATLAS_DIR = path.join(__dirname, '..', 'server', 'assets', 'atlas')
const ADM0_FILE = path.join(ATLAS_DIR, 'admin0.geojson.gz')
const VNP_FILE = path.join(ATLAS_DIR, 'vn_provinces.geojson.gz')

// ADM0_DECIMALS = 2 (same as build-atlas-geo.mjs)
const DECIMALS = 2

function quantizeRing(ring, decimals) {
  const m = 10 ** decimals
  const out = []
  let prevX, prevY
  for (const pt of ring) {
    const x = Math.round(pt[0] * m) / m
    const y = Math.round(pt[1] * m) / m
    if (x === prevX && y === prevY) continue
    out.push([x, y])
    prevX = x; prevY = y
  }
  return out
}

function quantizeGeometryToDecimals(geom, decimals) {
  if (!geom) return null
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates.map(r => quantizeRing(r, decimals)).filter(r => r.length >= 4)
    return rings.length ? { type: 'Polygon', coordinates: rings } : null
  }
  if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates
      .map(poly => poly.map(r => quantizeRing(r, decimals)).filter(r => r.length >= 4))
      .filter(poly => poly.length)
    return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null
  }
  return geom
}

const adm0Gz = fs.readFileSync(ADM0_FILE)
const adm0 = JSON.parse(zlib.gunzipSync(adm0Gz))

const vnpGz = fs.readFileSync(VNP_FILE)
const vnp = JSON.parse(zlib.gunzipSync(vnpGz))

// Find Vietnam feature in admin0
const vnIdx = adm0.features.findIndex(f => f.properties.ADM0_A3 === 'VNM')
if (vnIdx === -1) {
  console.error('Vietnam (VNM) not found in admin0!')
  process.exit(1)
}

const vnFeature = adm0.features[vnIdx]
const vnCoords = vnFeature.geometry.type === 'MultiPolygon'
  ? vnFeature.geometry.coordinates
  : [vnFeature.geometry.coordinates] // wrap Polygon in array

// Find island features in vn_provinces
const islandNames = ['Đặc khu Hoàng Sa', 'Đặc khu Trường Sa']
let addedCount = 0
for (const islandName of islandNames) {
  const island = vnp.features.find(f => f.properties.name === islandName)
  if (!island) {
    console.warn(`  ! Island "${islandName}" not found in vn_provinces, skipping`)
    continue
  }
  const qGeom = quantizeGeometryToDecimals(island.geometry, DECIMALS)
  if (!qGeom) {
    console.warn(`  ! Island "${islandName}" geometry collapsed after quantization, skipping`)
    continue
  }
  const islandCoords = qGeom.type === 'MultiPolygon'
    ? qGeom.coordinates
    : [qGeom.coordinates]
  for (const poly of islandCoords) {
    vnCoords.push(poly)
  }
  addedCount++
}

// Normalize to MultiPolygon
vnFeature.geometry = {
  type: 'MultiPolygon',
  coordinates: vnCoords,
}

adm0.features[vnIdx] = vnFeature

// Write back
const fc = { type: 'FeatureCollection', features: adm0.features }
const gz = zlib.gzipSync(Buffer.from(JSON.stringify(fc)), { level: 9 })
fs.writeFileSync(ADM0_FILE, gz)

const totalIslands = islandNames.length
console.log(`Patched admin0.geojson.gz — merged ${addedCount}/${totalIslands} islands into Vietnam (VNM)`)
console.log(`Vietnam now has ${vnCoords.length} polygon groups`)
console.log(`File size: ${(gz.length / 1e6).toFixed(2)} MB gzipped`)
