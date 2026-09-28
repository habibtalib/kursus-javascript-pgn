# Data geospatial sampel (sintetik)

Fail dalam folder ini digunakan pada Hari 2–5 (terutamanya **Hari 4 S2 — baca/tulis format geospatial**).

> ⚠️ **SEMUA data ialah SINTETIK** — dijana secara rawak berbenih oleh skrip. Nama zon, sungai dan kemudahan adalah rekaan. Tiada data PGN/JUPEM sebenar atau terperingkat.

## Kandungan

| Fail | Format | CRS | Kandungan | Pustaka JS (baca) |
|------|--------|-----|-----------|-------------------|
| `sempadan-zon.geojson` | GeoJSON Polygon | EPSG:4326 | 5 zon (`kod`, `nama`, `keluasan_ha`) — ZON-A … ZON-E, menjubin kawasan tanpa celah | `JSON.parse` |
| `sempadan-zon-rso.zip` | Shapefile (`.shp .shx .dbf .prj`) | **EPSG:3375** | zon sama dalam meter RSO. Medan DBF `keluasan_ha` dipotong kepada `keluasan_h` (had 10 aksara Shapefile) | `shpjs` + `proj4` |
| `sungai.geojson` | GeoJSON LineString | EPSG:4326 | 3 sungai (`kod`, `nama`, `panjang_km`) | `JSON.parse` |
| `kemudahan.gpkg` | GeoPackage 1.4 | EPSG:4326 | jadual `kemudahan` (Point): `fid`, `kod`, `nama`, `jenis` — 12 titik | `sql.js` |
| `kemudahan.kml` | KML 2.2 | EPSG:4326 | 12 Placemark yang sama (nama, keterangan = jenis, `ExtendedData`) | `@tmcw/togeojson` |
| `kemudahan.kmz` | KMZ (zip berisi `doc.kml`) | EPSG:4326 | sama seperti KML | `jszip` + `@tmcw/togeojson` |
| `dem-putrajaya.tif` | GeoTIFF Float32, 1 band, 100×100 | EPSG:4326 | ketinggian sintetik 13–89 m; bbox `101.66, 2.88, 101.74, 2.97` | `geotiff` |
| `sampel.las` | LAS 1.2, format titik 1 | **EPSG:3375** (VLR GeoKeyDirectory) | 1,000 titik (≈600 m × 600 m); kelas 2 = tanah, 5 = tumbuhan tinggi; Z ≈ 22–51 m | `@loaders.gl/las` |

Kawasan kajian (semua fail): lebih kurang **lng 101.66–101.74, lat 2.88–2.97** (Putrajaya/Cyberjaya).

Fail ini turut dihidang oleh mock API di `http://localhost:3000/data/<nama-fail>` (lihat [`../api/README.md`](../api/README.md)) — berguna untuk `fetch()` tanpa dialog fail.

## Sistem koordinat

| EPSG | Nama | Unit | Guna dalam kursus |
|------|------|------|-------------------|
| 4326 | WGS 84 | darjah | GeoJSON, GPS, Leaflet (`[lat, lng]`!) |
| **3375** | **GDM2000 / Peninsula RSO** | meter | data pemetaan Semenanjung Malaysia; `sempadan-zon-rso.zip`, `sampel.las` |
| 3857 | WGS 84 / Pseudo-Mercator | meter | tile peta web |

Definisi proj4 EPSG:3375 (disemak silang dengan PROJ/pyproj: `(101.69, 2.93) → (410363.20, 324278.14)`):

```text
+proj=omerc +lat_0=4 +lonc=102.25 +alpha=323.0257964666666 +k=0.99984 +x_0=804671 +y_0=0 +no_uoff +gamma=323.1301023611111 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs
```

Fail `.prj` dalam `sempadan-zon-rso.zip` menggunakan **WKT1 gaya OGC/GDAL** (`PROJECTION["Hotine_Oblique_Mercator"]`, `AUTHORITY["EPSG","3375"]`). Varian WKT gaya ESRI (`Rectified_Skew_Orthomorphic_Natural_Origin`) **tidak** dapat dihurai oleh proj4js/shpjs, manakala QGIS/GDAL membaca kedua-duanya — jadi versi OGC dipilih.

> 💡 `shpjs` (`shp(buffer)`) membaca `.prj` dan melakukan reprojection ke WGS84 **secara automatik**. Dalam aplikasi GeoLapor kita membaca `.shp` mentah (`parseShp`) dan memanggil `keWgs84()` sendiri supaya langkah reprojection kelihatan jelas semasa mengajar.

## Jana semula & semak

```bash
cd projek/data/jana
npm install
npm run jana    # node jana-data.mjs  → tulis semula semua fail di atas + data mock API
npm run semak   # node semak-data.mjs → baca semula setiap fail dengan pustaka kursus
```

`jana-data.mjs` deterministik (PRNG berbenih `20260928`) — output sama setiap kali (kecuali cap masa dalam zip). Ia juga menulis:

- `projek/api/data/lapisan/{sempadan-zon,sungai,kemudahan}.geojson` — layer untuk `/api/lapisan/:id`
- `projek/api/data/asal/laporan.json` dan `projek/api/data/laporan.json` — 40 laporan (LPR-0001 = laporan contoh)

| Output | Dijana dengan |
|--------|---------------|
| Shapefile | `@mapbox/shp-write` (koordinat diunjur dahulu dengan `proj4`; `.prj` ditulis sendiri) |
| GeoPackage | `sql.js` — jadual `gpkg_spatial_ref_sys`, `gpkg_contents`, `gpkg_geometry_columns`, `PRAGMA application_id = 'GPKG'`, `user_version = 10400`; geometri = header `GP` + WKB little-endian |
| KML / KMZ | `tokml` / `jszip` (`doc.kml`) |
| GeoTIFF | `geotiff` `writeArrayBuffer` (Float32Array, `ModelPixelScale`, `ModelTiepoint`, `GeographicTypeGeoKey = 4326`) |
| LAS | penulis binari manual (header 227 bait, 1 VLR `LASF_Projection`/34735, rekod titik 28 bait, skala 0.01 m) |

`semak-data.mjs` mengesahkan dengan pustaka yang digunakan peserta: `shpjs`, `sql.js`, `@tmcw/togeojson` + `@xmldom/xmldom`, `jszip`, `geotiff`, `@loaders.gl/las` + `@loaders.gl/core`, `proj4`. Semua fail juga telah disemak dengan GDAL 3.12 (QGIS menggunakan GDAL): Shapefile dikenali sebagai EPSG:3375, GeoPackage/KML/KMZ/GeoTIFF sebagai EPSG:4326, LAS sebagai EPSG:3375.

## Nota ECW

**ECW** (Enhanced Compression Wavelet, Hexagon/ERDAS) ialah format raster **proprietari** yang lazim untuk ortofoto. **Tiada pustaka JavaScript** untuk membacanya dalam browser (SDK ECW berlesen dan tertutup). Tukar dahulu kepada GeoTIFF / **Cloud Optimized GeoTIFF (COG)**:

```bash
# GDAL (dibina dengan pemacu ECW — cth pakej QGIS/OSGeo4W)
gdal_translate -of COG input.ecw output.tif
# pilihan: mampatan & reprojection
gdal_translate -of COG -co COMPRESS=DEFLATE input.ecw output.tif
gdalwarp -t_srs EPSG:4326 -of COG input.ecw output-4326.tif
```

Atau dalam **QGIS**: *Raster → Conversion → Translate (Convert Format)*, pilih GeoTIFF, tanda *COG* dalam pilihan penciptaan. Hasilnya boleh dibaca dengan `geotiff` (seperti `dem-putrajaya.tif`).
