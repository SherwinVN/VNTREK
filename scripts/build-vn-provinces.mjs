#!/usr/bin/env node
/**
 * Build Vietnam province boundary GeoJSON from vietnamese-provinces-database.
 *
 * 1. Downloads province names from JSON
 * 2. Downloads GIS SQL ZIP, extracts WKT MultiPolygon geometries
 * 3. Converts to GeoJSON, quantizes coordinates, gzips output
 *
 * Usage:  node scripts/build-vn-provinces.mjs
 * Output: server/assets/atlas/vn_provinces.geojson.gz
 */

import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { createWriteStream } from 'fs'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

const OUT_DIR = path.resolve('server/assets/atlas')
const GB_REF = 'master'

// URL for the simplified JSON (province codes + names)
const JSON_URL =
  `https://raw.githubusercontent.com/SherwinVN/vietnamese-provinces-database/${GB_REF}/json/vn_only_simplified_json_generated_data_vn_units_minified.json`

// The GIS ZIP filename (update when the source repo releases a new version)
const GIS_ZIP_FILE = 'postgresql_ImportData_gis_2026-06-20__12_32_01.sql.zip'
const GIS_ZIP_URL =
  `https://raw.githubusercontent.com/SherwinVN/vietnamese-provinces-database/${GB_REF}/postgresql/gis/${GIS_ZIP_FILE}`

// ── helpers ─────────────────────────────────────────────────────────────────

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${url} (${res.status})`)
  const fileStream = createWriteStream(dest)
  await finished(Readable.fromWeb(res.body).pipe(fileStream))
}

/**
 * Parse a WKT MULTIPOLYGON string into GeoJSON coordinate array.
 * Accepts "MULTIPOLYGON (((x y, ...), (x y, ...)), ((x y, ...)))"
 * and "MULTIPOLYGON(((x y,...),(x y,...)),((x y,...)))" (no spaces).
 */
function parseWktMultiPolygon(wkt) {
  // Strip "MULTIPOLYGON" and outer parens
  let inner = wkt.replace(/^MULTIPOLYGON\s*/i, '').trim()
  if (!inner.startsWith('(')) throw new Error(`Expected '(' after MULTIPOLYGON: ${wkt.slice(0, 60)}`)
  // Remove outermost parens: ((...), (...)) → (...), (...)
  inner = inner.slice(1, -1).trim()
  return parsePolygonList(inner)
}

function parsePolygonList(str) {
  const polygons = []
  let i = 0
  while (i < str.length) {
    if (str[i] === ',') { i++; continue }
    if (str[i] === ' ') { i++; continue }
    if (str[i] === '(') {
      const [ringList, next] = parseBalancedParens(str, i)
      polygons.push(parseRingList(ringList))
      i = next
    } else {
      i++
    }
  }
  return polygons
}

function parseRingList(str) {
  const rings = []
  let i = 0
  while (i < str.length) {
    if (str[i] === ',') { i++; continue }
    if (str[i] === ' ') { i++; continue }
    if (str[i] === '(') {
      const [coordText, next] = parseBalancedParens(str, i)
      rings.push(parseCoords(coordText))
      i = next
    } else {
      i++
    }
  }
  return rings
}

function parseCoords(text) {
  return text.split(',').map(pair => {
    const [x, y] = pair.trim().split(/\s+/).map(Number)
    return [x, y]
  })
}

function parseBalancedParens(str, start) {
  if (str[start] !== '(') throw new Error(`Expected '(' at ${start}`)
  let depth = 0
  let i = start
  while (i < str.length) {
    if (str[i] === '(') depth++
    if (str[i] === ')') {
      depth--
      if (depth === 0) {
        return [str.slice(start + 1, i), i + 1]
      }
    }
    i++
  }
  throw new Error('Unbalanced parentheses')
}

function parseWktPolygon(wkt) {
  let inner = wkt.replace(/^POLYGON\s*/i, '').trim()
  inner = inner.slice(1, -1).trim()
  const [coordText] = parseBalancedParens(inner, 0)
  return parseCoords(coordText)
}

/**
 * Quantize coordinates: round to N decimal places, drop consecutive duplicates.
 * GeoJSON uses [lng, lat] order — same as WKT x y.
 */
function quantizeCoords(coords, decimals) {
  const factor = 10 ** decimals
  const seen = new Set()
  return coords.filter(([x, y]) => {
    const rx = Math.round(x * factor) / factor
    const ry = Math.round(y * factor) / factor
    const key = `${rx},${ry}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).map(([x, y]) => [
    Math.round(x * factor) / factor,
    Math.round(y * factor) / factor,
  ])
}

function quantizeRing(ring, decimals) {
  const q = quantizeCoords(ring, decimals)
  // Ensure ring is closed: first == last
  if (q.length > 0) {
    const f = q[0]; const l = q[q.length - 1]
    if (f[0] !== l[0] || f[1] !== l[1]) q.push([f[0], f[1]])
  }
  return q
}

function quantizeMultiPolygon(multiPoly, decimals) {
  return multiPoly.map(poly =>
    poly.map(ring => quantizeRing(ring, decimals))
  )
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('▸ Downloading province names from JSON…')
  const jsonTmp = '/tmp/vn_provinces.json'
  await download(JSON_URL, jsonTmp)
  const provinces = JSON.parse(fs.readFileSync(jsonTmp, 'utf8'))
  const nameByCode = {}
  for (const p of provinces) {
    nameByCode[p.Code] = {
      name: p.FullName,
      // Generate English name by removing the leading unit prefix
      name_en: p.FullName.replace(/^(Thành phố|Tỉnh)\s*/, ''),
    }
  }
  console.log(`  ✓ ${provinces.length} provinces loaded`)

  // Build a map of province codes to their ward counts for reference
  const wardCountByCode = {}
  for (const p of provinces) {
    wardCountByCode[p.Code] = (p.Wards || []).length
  }

  console.log('▸ Downloading GIS SQL ZIP (~32 MB)…')
  const zipTmp = '/tmp/vn_gis.zip'
  await download(GIS_ZIP_URL, zipTmp)
  console.log('  ✓ Downloaded')

  // Decompress & parse — accumulate SQL content then parse all INSERTs
  console.log('▸ Parsing GIS geometry data…')
  const { default: unzipper } = await import('unzipper')
  const features = []
  let buffer = ''

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipTmp)
      .pipe(unzipper.Parse())
      .on('entry', entry => {
        if (!entry.path.endsWith('.sql')) {
          entry.autodrain()
          return
        }
        entry.on('data', chunk => { buffer += chunk.toString('utf8') })
        entry.on('end', () => entry.autodrain())
      })
      .on('close', resolve)
      .on('error', reject)
  })

  // Parse all INSERT statements from the complete SQL buffer
  let pos = 0
  while (pos < buffer.length) {
    // Find next INSERT
    const insertStart = buffer.indexOf('INSERT INTO gis_provinces', pos)
    if (insertStart === -1) break

    // Find the terminating semicolon for this statement
    const insertEnd = buffer.indexOf(';\n', insertStart)
    if (insertEnd === -1) break

    const stmt = buffer.slice(insertStart, insertEnd).trim()
    pos = insertEnd + 2

    const valuesStart = stmt.indexOf('VALUES')
    if (valuesStart === -1) continue

    const valuesPart = stmt.slice(valuesStart + 6).trim()
    const tuples = splitValuesTuples(valuesPart)

    for (const tuple of tuples) {
      try {
        const parsed = parseProvinceTuple(tuple)
        if (!parsed) continue
        const { code, wktMultiPolygon } = parsed
        const coords = parseWktMultiPolygon(wktMultiPolygon)
        const quantized = quantizeMultiPolygon(coords, 3)

        const info = nameByCode[code]
        features.push({
          type: 'Feature',
          properties: {
            province_code: code,
            name: info?.name || code,
            name_en: info?.name_en || code,
            iso_a2: 'VN',
            iso_3166_2: `VN-${code}`,
            admin: 'Vietnam',
            ward_count: wardCountByCode[code] || 0,
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: quantized,
          },
        })
      } catch (err) {
        console.warn(`  ⚠ Failed to parse province tuple: ${err.message}`)
      }
    }
  }

  console.log(`  ✓ ${features.length} province boundaries parsed`)

  if (features.length === 0) {
    console.error('✗ No province boundaries found! Check the GIS ZIP format.')
    process.exit(1)
  }

  // Sort by province code for deterministic output
  features.sort((a, b) => a.properties.province_code.localeCompare(b.properties.province_code))

  // ── Add island districts: Hoàng Sa (Đà Nẵng) & Trường Sa (Khánh Hòa) ──
  console.log('▸ Downloading island district GeoJSON files…')
  const islandUrls = [
    {
      url: 'https://raw.githubusercontent.com/SherwinVN/vietnamese-provinces-database/master/dataset-generation-scripts/resources/gis/sapnhapbando_geojson/xa1904.geojson',
      code: '48',
      name: 'Đặc khu Hoàng Sa',
      name_en: 'Hoang Sa',
    },
    {
      url: 'https://raw.githubusercontent.com/SherwinVN/vietnamese-provinces-database/master/dataset-generation-scripts/resources/gis/sapnhapbando_geojson/xa2123.geojson',
      code: '56',
      name: 'Đặc khu Trường Sa',
      name_en: 'Truong Sa',
    },
  ]
  for (const island of islandUrls) {
    const tmp = `/tmp/vn_island_${island.code}.geojson`
    await download(island.url, tmp)
    const gj = JSON.parse(fs.readFileSync(tmp, 'utf8'))
    fs.unlinkSync(tmp)
    if (!gj.features || gj.features.length === 0) {
      console.warn(`  ⚠ No features found for ${island.name}`)
      continue
    }
    const src = gj.features[0]
    const coords = quantizeMultiPolygon(src.geometry.coordinates, 3)
    features.push({
      type: 'Feature',
      properties: {
        province_code: island.code,
        name: island.name,
        name_en: island.name_en,
        iso_a2: 'VN',
        iso_3166_2: `VN-${island.code}`,
        admin: 'Vietnam',
        ward_count: 0,
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: coords,
      },
    })
    console.log(`  ✓ ${island.name} added (${JSON.stringify(src.geometry?.coordinates).length} bytes raw)`)
  }

  const fc = { type: 'FeatureCollection', features }
  const json = JSON.stringify(fc)
  const rawSize = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2)
  console.log(`  Raw JSON size: ${rawSize} MB`)

  // Gzip
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, 'vn_provinces.geojson.gz')
  const gzipped = zlib.gzipSync(Buffer.from(json), { level: 9 })
  fs.writeFileSync(outPath, gzipped)
  const gzSize = (gzipped.length / 1024 / 1024).toFixed(2)
  console.log(`  ✓ Written to ${outPath} (${gzSize} MB gzipped, ${features.length} features)`)

  // Cleanup
  fs.unlinkSync(jsonTmp)
  fs.unlinkSync(zipTmp)
  console.log('  ✓ Temp files cleaned up')
}

/**
 * Split VALUES part into individual tuples, correctly handling nested parens.
 * Each tuple: ('01','...',123.45,ST_GeomFromText('...',4326),ST_GeomFromText('...',4326))
 * Tuples are separated by ),( when inside the outer VALUES list.
 */
function splitValuesTuples(valuesPart) {
  const tuples = []
  let i = 0
  // Skip leading whitespace
  while (i < valuesPart.length && valuesPart[i] === ' ') i++
  // Skip leading parenthesis
  if (valuesPart[i] === '(') i++

  let depth = 0
  let start = i
  for (; i < valuesPart.length; i++) {
    if (valuesPart[i] === '(') depth++
    else if (valuesPart[i] === ')') {
      depth--
      if (depth < 0) {
        // End of this tuple
        tuples.push(valuesPart.slice(start, i))
        // Skip past ) and any , or whitespace
        i++
        while (i < valuesPart.length && (valuesPart[i] === ',' || valuesPart[i] === ' ')) i++
        start = i
        if (valuesPart[i] === '(') { depth = 0; i++ }
        else break
      }
    }
  }
  if (i > start) tuples.push(valuesPart.slice(start, i))

  return tuples.filter(t => t.trim().length > 0)
}

/**
 * Parse a single province tuple to extract province_code and geom WKT.
 * Format: '01','server_id',123.45,ST_GeomFromText('POLYGON(...)',4326),ST_GeomFromText('MULTIPOLYGON(...)',4326)
 */
function parseProvinceTuple(tuple) {
  // Split by comma but respect quoted strings and nested function calls
  const parts = splitTupleFields(tuple)
  if (parts.length < 5) return null

  const code = parts[0].replace(/^'|'$/g, '')
  // parts[4] should be: ST_GeomFromText('MULTIPOLYGON(...)',4326)
  const geomField = parts[4]
  const wktMatch = geomField.match(/ST_GeomFromText\s*\(\s*'(MULTIPOLYGON[\s\S]+?)'/i)
  if (!wktMatch) return null
  return { code, wktMultiPolygon: wktMatch[1] }
}

/**
 * Split a tuple by top-level commas (not inside quotes or nested functions).
 */
function splitTupleFields(str) {
  const fields = []
  let i = 0
  let start = 0
  let depth = 0
  let inQuote = false

  while (i < str.length) {
    const ch = str[i]
    if (ch === "'" && (i === 0 || str[i - 1] !== '\\')) inQuote = !inQuote
    else if (!inQuote) {
      if (ch === '(') depth++
      else if (ch === ')') depth--
      else if (ch === ',' && depth === 0) {
        fields.push(str.slice(start, i).trim())
        start = i + 1
      }
    }
    i++
  }
  fields.push(str.slice(start).trim())
  return fields
}

main().catch(err => {
  console.error('Build failed:', err)
  process.exit(1)
})
