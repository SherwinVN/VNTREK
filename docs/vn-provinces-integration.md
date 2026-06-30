# Tích hợp bản đồ hành chính Việt Nam

## Mục tiêu

Nhúng dữ liệu GIS tỉnh/thành từ [vietnamese-provinces-database](https://github.com/SherwinVN/vietnamese-provinces-database) vào TREK để:

1. Hiển thị đường viền 34 tỉnh Việt Nam chính xác trên bản đồ
2. Tỉnh thành nổi bật (màu đỏ viền) khi zoom vào Việt Nam
3. Dữ liệu hành chính cập nhật theo nghị định mới nhất (30/2026/QH16)

---

## Kiến trúc tổng thể

```
vietnamese-provinces-database
  └── postgresql/gis/*.sql.zip    GIS data (MultiPolygon, SRID 4326)
          │
          ▼
  scripts/build-vn-provinces.mjs  Build script (trích xuất WKT → GeoJSON → gzip)
          │
          ▼
  server/assets/atlas/vn_provinces.geojson.gz  (committed vào git)
          │
          ▼
  atlasService.ts                 Load vào memory, cache vĩnh viễn
          │
          ▼
  atlas.controller.ts             API endpoint: GET /api/addons/atlas/vn-provinces/geo
          │
          ▼
  Client (useAtlas.ts / MapView.tsx / MapViewGL.tsx)
          │
          ▼
  Leaflet / Mapbox GL             Render province boundaries overlay
```

---

## Các file cần sửa

### 1. Script build — `scripts/build-vn-provinces.mjs` (mới)

**Chức năng:**
- Download GIS SQL ZIP từ GitHub
- Parse WKT geometry từ SQL INSERT statements
- Kết hợp với tên tỉnh từ JSON data
- Quantize coordinates (3 decimal places ~110m, giống admin1 build)
- Gzip output thành `server/assets/atlas/vn_provinces.geojson.gz`

**Input:** `postgresql_ImportData_gis_*.sql.zip` (~32MB) + `vn_only_simplified_json_generated_data_vn_units.json`

**Output:** `server/assets/atlas/vn_provinces.geojson.gz`

### 2. Artifact build — `server/assets/atlas/vn_provinces.geojson.gz` (mới)

GeoJSON FeatureCollection gồm 34 feature, mỗi feature là một tỉnh:
```json
{
  "type": "Feature",
  "properties": {
    "province_code": "79",
    "name": "Hồ Chí Minh",
    "name_en": "Ho Chi Minh",
    "full_name": "Thành phố Hồ Chí Minh"
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [[[...]]]
  }
}
```

### 3. Server service — `server/src/services/atlasService.ts`

**Thêm:**

```typescript
// Module-level cache
let vnProvinceCache: any = null

export function getVnProvinceGeo(): any {
  if (vnProvinceCache) return vnProvinceCache
  // Đọc file, gunzip, parse JSON
  // Cache vĩnh viễn (giống getCountryGeo, getRegionGeo)
}
```

### 4. Nest service — `server/src/nest/atlas/atlas.service.ts`

**Thêm method:**

```typescript
vnProvinceGeo() { return getVnProvinceGeo() }
```

### 5. Nest controller — `server/src/nest/atlas/atlas.controller.ts`

**Thêm endpoint:**

```
GET /api/addons/atlas/vn-provinces/geo
Response: GeoJSON FeatureCollection
Cache: public, max-age=86400 (1 ngày)
Auth: JWT (giống các endpoint atlas khác)
```

### 6. Atlas client — `client/src/pages/atlas/atlas/useAtlas.ts`

**Thêm:**
- Fetch `/vn-provinces/geo` khi mount
- Render `L.geoJSON` layer với style:
  - `fillColor: transparent`
  - `color: #ef4444` (đỏ, nổi bật)
  - `weight: 1.5`
- Filter theo zoom: chỉ hiện khi zoom ≥ 6
- Listen `zoomend` + `moveend` để show/hide + tải dữ liệu

### 7. Main map Leaflet — `client/src/components/Map/MapView.tsx`

**Thêm prop:** `showVietnamBorders?: boolean`

**Khi bật:**
- Fetch GeoJSON từ API
- Render `L.geoJSON` layer với style viền đỏ
- Tự động ẩn/hiện theo zoom
- Kết hợp với viewport detection (chỉ hiện khi map ở VN)

### 8. Main map GL — `client/src/components/Map/MapViewGL.tsx`

**Thêm tương tự MapView.tsx:**
- Dùng `map.addSource()` + `map.addLayer()` với `type: 'line'`
- Style: `line-color: #ef4444`, `line-width: 1.5`
- Filter bằng zoom expression

### 9. Map Settings — `client/src/components/Settings/MapSettingsTab.tsx`

**Thêm toggle switch:**

| Label | Key |
|---|---|
| "Show Vietnam province borders" | `show_vietnam_borders` |

- Lưu vào user settings (bảng `settings`)
- Truyền xuống `MapView` / `MapViewGL` qua prop

### 10. Shared schemas — `shared/src/maps/maps.schema.ts`

**Không cần sửa** (GeoJSON served như static data, không qua Zod validate).

---

## Hiển thị ở đâu

| Màn hình | Hiển thị | Điều kiện |
|---|---|---|
| **Atlas Page** | Province borders với viền đỏ, fill theo visited status | Zoom ≥ 6, Việt Nam trong viewport |
| **Trip Planner Map** | Province borders viền đỏ | Setting bật + zoom ≥ 8 + Việt Nam trong viewport |
| **Journey Map** | Province borders viền đỏ | Setting bật + zoom ≥ 8 + Việt Nam trong viewport |
| **Place Form Modal** | _Không thay đổi_ | Address vẫn là free-text |
| **LocationSelect** | _Không thay đổi_ | Search vẫn qua Nominatim/Google |

**Lưu ý:** Không thêm selector tỉnh/huyện/xã vì ứng dụng dùng global, không chỉ Việt Nam.

---

## Luồng hiển thị

```
User mở map, zoom vào Việt Nam
        │
        ▼
Map phát hiện viewport giao với bbox Việt Nam
        │
        ▼
Client fetch /api/addons/atlas/vn-provinces/geo
        │
        ▼
Server trả về GeoJSON (34 province boundaries, cached)
        │
        ▼
Client render overlay province borders
  - Leaflet: L.geoJSON với style viền đỏ
  - Mapbox GL: map.addSource + map.addLayer
        │
        ▼
User zoom out khỏi VN → layer tự động ẩn
```

---

## So sánh với hệ thống hiện tại

| Tính năng | Hiện tại (geoBoundaries) | Sau tích hợp |
|---|---|---|
| Admin0 (quốc gia) | Có, ~180 nước | Giữ nguyên |
| Admin1 (tỉnh/bang) | Có, global từ geoBoundaries | **Thêm layer VN** chính xác hơn |
| Vietnam province borders | Chung trong admin1, độ chính xác thấp | **Layer riêng**, GIS chính xác, màu nổi bật |
| Nguồn dữ liệu | geoBoundaries (CC BY 4.0) | + Vietnam Administrative Units Reference Map |
| Cập nhật | Theo geoBoundaries release | Theo nghị định chính phủ VN |

---

## Tài liệu tham khảo

- [vietnamese-provinces-database](https://github.com/SherwinVN/vietnamese-provinces-database)
- [geoBoundaries](https://www.geoboundaries.org/)
- [TREK wiki: Map Features](../wiki/Map-Features.md)
- [TREK wiki: Map Settings](../wiki/Map-Settings.md)

---

## Admin0 Island Patch

Vietnam's admin0 country boundary (from geoBoundaries CGAZ ADM0) omits the Hoàng Sa (Paracel) and Trường Sa (Spratly) archipelagos. At the zoomed-out country level these islands are invisible, leaving Vietnam looking incomplete.

The build script `scripts/patch-admin0-vn-islands.mjs` solves this by reading `vn_provinces.geojson.gz`, extracting the 2 island MultiPolygons, and merging their coordinates into the Vietnam (VNM) feature in `admin0.geojson.gz`. Islands are quantized to `ADM0_DECIMALS` (2 decimal places) to match admin0 precision. The main build pipeline `server/scripts/build-atlas-geo.mjs` automatically runs this patch after building admin0 when `vn_provinces.geojson.gz` exists.

Before patching, Vietnam's VNM feature had 25 MultiPolygon parts; after patching, it has 211 (25 mainland + 46 from Hoàng Sa + 140 from Trường Sa).

After patching, the Docker dev container must be restarted and the browser must hard-refresh (Cmd+Shift+R) to bypass the 24h cache on the `countries/geo` endpoint.
