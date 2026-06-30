# VNTrek — Trình Lập Kế Hoạch Du Lịch Việt Nam 🧭

[English Version (Bản tiếng Anh)](README.en.md) | [Vietnamese Version (Bản tiếng Việt)](README.md)

<div align="center">

<picture>
  <img src="client/public/logo-light.svg" alt="VNTrek" height="96" />
</picture>

<br />
<br />

Ứng dụng lập kế hoạch du lịch tự lưu trữ (self-hosted) với khả năng cộng tác thời gian thực — tích hợp bản đồ tương tác, quản lý ngân sách, danh sách hành lý, nhật ký hành trình và trợ lý AI.

<br />

<a href="http://vntrek.vantrungit.com"><img alt="Demo" src="https://img.shields.io/badge/Demo-Dùng_thử-111827?style=for-the-badge" /></a>
&nbsp;
<a href="https://hub.docker.com/r/sherwinvn/vntrek"><img alt="Docker" src="https://img.shields.io/badge/Docker-Sẵn_sàng-2496ED?style=for-the-badge" /></a>
&nbsp;
<a href="https://me.momo.vn/1MIVTysqCOUBidTRfdU3Iv/QBeXQBKXOgwlayK"><img alt="Momo" src="https://img.shields.io/badge/Momo-Ủng_hộ-da2175?style=for-the-badge" /></a>
&nbsp;
<a href="https://github.com/SherwinVN/VNTREK"><img alt="Roadmap" src="https://img.shields.io/badge/Mã_nguồn-GitHub-0EA5E9?style=for-the-badge" /></a>
<br />
<a href="https://ko-fi.com/vantrungle"><img alt="Ko-fi" src="https://img.shields.io/badge/Ko--fi-Ủng_hộ-FF5E5B?style=for-the-badge" /></a>
&nbsp;
<a href="https://buymeacoffee.com/sherwinvn"><img alt="BMAC" src="https://img.shields.io/badge/Buy_Me_A_Coffee-Ủng_hộ-FFDD00?style=for-the-badge" /></a>
<br />
<a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/giấy_phép-AGPL_v3-6B7280?style=flat-square" /></a>
<a href="https://github.com/SherwinVN/VNTREK/releases"><img alt="Phiên bản mới nhất" src="https://img.shields.io/github/v/release/SherwinVN/VNTREK?include_prereleases&style=flat-square&color=6B7280" /></a>
<a href="https://github.com/SherwinVN/VNTREK"><img alt="Stars" src="https://img.shields.io/github/stars/SherwinVN/VNTREK?style=flat-square&color=6B7280" /></a>

</div>

---

## 📌 LƯU Ý BẢN QUYỀN & GIẤY PHÉP (AGPL v3)
Dự án này là một phiên bản sửa đổi (fork) từ dự án gốc **TREK** được phát triển bởi **Maurice B.** tại địa chỉ [github.com/mauriceboe/TREK](https://github.com/mauriceboe/TREK).

Dự án được phân phối dưới giấy phép **GNU AGPL v3**. Bạn được tự do chạy, chỉnh sửa và chia sẻ dự án này với điều kiện mọi thay đổi trên mã nguồn của bạn phải được mở công khai dưới cùng một giấy phép AGPL v3.
- **Tác giả gốc**: Maurice B. ([GitHub](https://github.com/mauriceboe/TREK))
- **Người Việt hóa & Chỉnh sửa**: Lê Văn Trung - SherwinVN ([GitHub](https://github.com/SherwinVN))

---

## Các tính năng chính

#### 🧭 Lập kế hoạch chuyến đi
- **Kéo & thả tiện lợi** — Sắp xếp các điểm đến theo từng ngày một cách trực quan.
- **Bản đồ tương tác** — Hỗ trợ Leaflet hoặc Mapbox GL hiển thị tòa nhà 3D, địa hình, ảnh đánh dấu vị trí và định tuyến đường đi.
- **Tìm kiếm địa điểm** — Sử dụng Google Places hoặc OpenStreetMap (miễn phí, không cần khóa API).
- **Nhập dữ liệu** — Nhập danh sách địa điểm trực tiếp từ Google Maps, Naver Maps, hoặc tệp GPX, KML/KMZ, GeoJSON.
- **Ghi chú theo ngày** — Thêm ghi chú kèm mốc thời gian và thẻ biểu tượng.
- **Tối ưu hóa lộ trình** — Tự động sắp xếp các điểm đến theo thứ tự đường đi ngắn nhất.
- **Dự báo thời tiết** — Xem dự báo 16 ngày qua Open-Meteo và dữ liệu khí hậu lịch sử.

#### 🧳 Quản lý hành trình
- **Đặt chỗ** — Lưu trữ thông tin chuyến bay, khách sạn, nhà hàng kèm file vé và mã xác nhận; tự động nhập từ email hoặc tệp PDF.
- **Chi phí** — Quản lý chi tiêu nhóm, chia tiền theo kiểu Splitwise, hỗ trợ đa tiền tệ.
- **Danh sách hành lý** — Tạo danh sách đồ dùng theo danh mục, gán người chuẩn bị và theo dõi tiến độ.
- **Theo dõi cân nặng hành lý** — Phân bổ trọng lượng thông minh.
- **Quản lý tài liệu** — Đính kèm file PDF, vé tàu xe, ảnh trực tiếp vào chuyến đi.
- **Xuất tệp PDF** — Xuất toàn bộ lộ trình chuyến đi ra file PDF chuyên nghiệp để in ấn hoặc đọc ngoại tuyến.

---

## 🚀 Hướng dẫn cài đặt nhanh (Docker Compose)

Tạo một tệp `docker-compose.yml`:

```yaml
services:
  vntrek:
    image: sherwinvn/vntrek:latest
    container_name: vntrek
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
    tmpfs:
      - /tmp:noexec,nosuid,size=64m
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ENCRYPTION_KEY=${ENCRYPTION_KEY:-}   # Tạo bằng: openssl rand -hex 32
      - TZ=Asia/Ho_Chi_Minh
      - LOG_LEVEL=info
      - APP_URL=http://localhost:3000
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    restart: unless-stopped
```

Sau đó chạy lệnh:
```bash
docker compose up -d
```

Truy cập hệ thống tại: `http://localhost:3000`

---

## 🛠 Cấu hình biến môi trường

| Biến số | Mô tả | Mặc định |
|---|---|---|
| `PORT` | Cổng dịch vụ | `3000` |
| `NODE_ENV` | Môi trường hoạt động (`production` / `development`) | `production` |
| `ENCRYPTION_KEY` | Khóa mã hóa dữ liệu nhạy cảm (API keys, SMTP). Khuyên dùng: `openssl rand -hex 32` | Tự sinh |
| `TZ` | Múi giờ hệ thống | `Asia/Ho_Chi_Minh` |
| `DEFAULT_LANGUAGE` | Ngôn ngữ mặc định | `vi` |
| `APP_URL` | Địa chỉ URL công khai của bạn | — |

---

## 🤝 Ủng hộ tác giả

Nếu ứng dụng giúp cho hành trình của bạn trở nên tuyệt vời hơn, bạn có thể ủng hộ nhà phát triển thông qua các kênh sau:

- **Ví Momo (Ưu tiên)**: [me.momo.vn/vantrungit](https://me.momo.vn/1MIVTysqCOUBidTRfdU3Iv/QBeXQBKXOgwlayK)
- **Ko-fi**: [ko-fi.com/vantrungle](https://ko-fi.com/vantrungle)
- **Buy Me a Coffee**: [buymeacoffee.com/sherwinvn](https://buymeacoffee.com/sherwinvn)

Mọi báo cáo lỗi hoặc yêu cầu tính năng xin vui lòng gửi tại: [SherwinVN/VNTREK Issues](https://github.com/SherwinVN/VNTREK/issues)

---

## 📊 Nguồn dữ liệu (Data sources)

- Ranh giới quốc gia và tỉnh/thành phố trên bản đồ Atlas được cung cấp bởi dự án [**geoBoundaries**](https://www.geoboundaries.org/) (Runfola et al., 2020), phát hành dưới giấy phép [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Ranh giới hành chính cấp tỉnh Việt Nam (34 tỉnh/thành phố) được cung cấp bởi [**Vietnamese Provinces Database**](https://github.com/SherwinVN/vietnamese-provinces-database), phát hành dưới giấy phép [MIT](https://github.com/SherwinVN/vietnamese-provinces-database/blob/master/LICENSE). Dữ liệu GIS có nguồn gốc từ Bản đồ đơn vị hành chính Việt Nam do Nhà xuất bản Tài nguyên — Môi trường và Bản đồ Việt Nam (Bộ Nông nghiệp và Môi trường) phát hành.

Chi tiết về các tài liệu và thư viện của bên thứ ba được ghi nhận đầy đủ tại [NOTICE.md](NOTICE.md).

---

## 🗺️ Cập nhật dữ liệu bản đồ hành chính Việt Nam

Khi [Vietnamese Provinces Database](https://github.com/SherwinVN/vietnamese-provinces-database) có bản cập nhật mới (theo nghị định của Chính phủ), làm theo các bước sau để cập nhật dữ liệu ranh giới tỉnh trên bản đồ:

### Bước 1: Clone repo dữ liệu

```bash
git clone https://github.com/SherwinVN/vietnamese-provinces-database.git /tmp/vn-provinces
cd /tmp/vn-provinces
git pull  # lấy bản mới nhất
```

### Bước 2: Chạy script build

Script tự động download GIS SQL ZIP + JSON tên tỉnh từ GitHub, parse WKT inline, không cần cài thêm dependency.

```bash
cd /path/to/VNTREK
node scripts/build-vn-provinces.mjs
```

Script sẽ:
1. Download JSON tên tỉnh (34 tỉnh/thành phố)
2. Download GIS SQL ZIP (~32 MB), giải nén
3. Parse 34 INSERT của bảng `gis_provinces`
4. Chuyển WKT MULTIPOLYGON → GeoJSON coordinates
5. Kết hợp tên tỉnh từ JSON
6. Quantize coordinates (3 số lẻ ~110m)
7. Ghi ra `server/assets/atlas/vn_provinces.geojson.gz`

### Bước 3: Kiểm tra

```bash
node -e "
  const zlib = require('zlib');
  const fs = require('fs');
  const geo = JSON.parse(zlib.gunzipSync(fs.readFileSync('server/assets/atlas/vn_provinces.geojson.gz')));
  console.log('Số tỉnh:', geo.features.length);
  console.log('Danh sách:', geo.features.map(f => f.properties.name_en).join(', '));
"
```

### Bước 4: Commit

```bash
git add server/assets/atlas/vn_provinces.geojson.gz
git commit -m "chore(vn-provinces): cập nhật ranh giới tỉnh theo dữ liệu mới"
```

> Dữ liệu GeoJSON được nén gzip (~1-3MB) nên commit trực tiếp vào git là an toàn. Server sẽ tự động load bản mới sau khi deploy.

## 📄 Giấy phép (License)

VNTrek được phát hành dưới giấy phép [GNU AGPL v3](LICENSE). Bạn có thể tự chạy máy chủ (self-host) tự do cho mục đích cá nhân hoặc nội bộ doanh nghiệp. Nếu bạn chỉnh sửa mã nguồn và cung cấp VNTrek dưới dạng một dịch vụ trực tuyến qua mạng cho bên thứ ba, bạn bắt buộc phải mở công khai mã nguồn đã chỉnh sửa đó dưới cùng giấy phép AGPL v3.
