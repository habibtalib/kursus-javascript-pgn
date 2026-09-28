# Cheat Sheet Geospatial untuk Pembangun JavaScript

[← Indeks docs](./README.md) · [Cheat sheet JS](./cheat-sheet-js.md) · Nota: [08 Leaflet](../nota/08-web-mapping-leaflet.md) · [09 Format data](../nota/09-format-data-geospatial.md) · [10 Turf](../nota/10-analisis-ruang-turf.md)

> Semua koordinat contoh ialah **sintetik** sekitar Putrajaya. Kod EPSG disahkan dengan [epsg.io](https://epsg.io/) pada 26 Sep 2026.

## 1. ⚠️ Susunan paksi — `[lng, lat]` atau `[lat, lng]`?

**Peraturan emas:** GeoJSON dan hampir semua pustaka *data* menggunakan **x dahulu = longitud dahulu**. Leaflet (pustaka *paparan*) menggunakan **latitud dahulu**.

| Pustaka / format | Susunan | Contoh Putrajaya |
|------------------|---------|------------------|
| **GeoJSON** (RFC 7946) | `[lng, lat]` | `"coordinates": [101.6958, 2.9264]` |
| **Turf.js** | `[lng, lat]` | `turf.point([101.6958, 2.9264])` |
| **proj4** | `[x, y]` = `[lng, lat]` / `[easting, northing]` | `proj4('EPSG:4326', 'EPSG:3375', [101.6958, 2.9264])` |
| **MapLibre GL JS** | `[lng, lat]` | `map.setCenter([101.6958, 2.9264])` |
| **OpenLayers** | `[x, y]` dalam projection peta | `fromLonLat([101.6958, 2.9264])` |
| **WKT** | `x y` = `lng lat` | `POINT (101.6958 2.9264)` |
| **KML** | `lng,lat[,alt]` | `<coordinates>101.6958,2.9264,0</coordinates>` |
| **Leaflet** | `[lat, lng]` ⚠️ | `L.marker([2.9264, 101.6958])` · `map.setView([2.9264, 101.6958], 14)` |
| Google Maps / borang manusia | `lat, lng` | "2.9264, 101.6958" |
| **WMS 1.3.0 / WFS 2.0 + EPSG:4326** | `lat, lng` ⚠️ (paksi rasmi EPSG) | `BBOX=2.90,101.65,2.96,101.73` |

```js
// Tukar dengan jelas — jangan terbalikkan secara senyap
const [lng, lat] = feature.geometry.coordinates;   // GeoJSON → variable bernama
L.marker([lat, lng]);                              // → Leaflet
// L.geoJSON(fc) menukar sendiri — tiada swap manual diperlukan
// Semakan kewarasan Malaysia: lng 99.5–119.5, lat 0.8–7.5
```

> 💡 Bagi Malaysia, koordinat terbalik menghasilkan **latitud ≈ 101°**, yang tidak wujud (had ±90°). Gejalanya: marker "hilang" (dilukis di luar dunia, di atas kutub) atau `fitBounds` melompat ke tempat pelik. (Error `Invalid LatLng object` pula muncul jika koordinat ialah `NaN`, contohnya string yang tidak ditukar dengan `Number()`.) Semak dengan `dalamMalaysia()` sebelum memaparkan.

## 2. Jenis geometri GeoJSON

| Jenis | `coordinates` | Contoh GeoLapor |
|-------|---------------|-----------------|
| `Point` | `[lng, lat]` | Laporan tapak |
| `MultiPoint` | `[[lng, lat], …]` | — |
| `LineString` | `[[lng, lat], …]` (≥ 2) | `sungai.geojson` |
| `MultiLineString` | `[[[lng, lat], …], …]` | — |
| `Polygon` | `[[[lng, lat], …, titik pertama]]`: gelang luar **tertutup** (titik pertama = terakhir), lubang selepasnya; RFC 7946: luar lawan jam | `sempadan-zon.geojson` |
| `MultiPolygon` | `[[[[lng, lat], …]], …]` | Pulau/kawasan terpisah |
| `GeometryCollection` | `geometries: […]` | Elak jika boleh |

Struktur: `FeatureCollection { features: [Feature { id, geometry, properties }] }`. `bbox` (pilihan) = `[minLng, minLat, maxLng, maxLat]`.

## 3. Sistem koordinat (CRS) di Malaysia

| EPSG | Nama | Jenis | Unit | Guna |
|------|------|-------|------|------|
| **4326** | WGS 84 | Geografi | darjah | GeoJSON, GPS, API web: **format pertukaran default** |
| **4742** | GDM2000 | Geografi | darjah | Datum geodetik rasmi Malaysia (≈ WGS 84 pada ketepatan paparan web) |
| **3857** | WGS 84 / Pseudo-Mercator | Projected | meter | Tile web (OSM, Google, Leaflet dalaman). **Jangan** guna untuk ukur luas/jarak |
| **3375** | GDM2000 / Peninsula RSO | Projected (Hotine Oblique Mercator) | meter | Pemetaan Semenanjung (`sempadan-zon-rso.zip`) |
| **3376** | GDM2000 / East Malaysia BRSO | Projected | meter | Sabah & Sarawak |
| **3377–3385** | GDM2000 / *State* Grid (Cassini) | Projected (Cassini-Soldner) | meter | Kadaster negeri: 3377 Johor · 3378 Sembilan & Melaka · 3379 Pahang · 3380 Selangor · 3381 Terengganu · 3382 Pinang · 3383 Kedah & Perlis · 3384 Perak · 3385 Kelantan |
| 4390–4398 | Kertau 1968 / *State* Grid | Cassini (datum lama) | meter | Data warisan pra-GDM2000: perlu transformasi datum |

```js
import proj4 from 'proj4';
// Definisi dari https://epsg.io/3375.proj4
proj4.defs('EPSG:3375', '+proj=omerc +no_uoff +lat_0=4 +lonc=102.25 +alpha=323.025796466667 +gamma=323.130102361111 +k=0.99984 +x_0=804671 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
const [e, n] = proj4('EPSG:4326', 'EPSG:3375', [101.6958, 2.9264]);   // ≈ [411007.1, 323878.6] meter
const [lng, lat] = proj4('EPSG:3375', 'EPSG:4326', [e, n]);             // kembali ≈ [101.6958, 2.9264]
// EPSG:4326 dan EPSG:3857 sudah terbina dalam proj4
```

> ⚠️ Fail `.prj` Shapefile memberitahu CRS. **Tiada `.prj` = teka = bahaya.** Nilai koordinat ratusan ribu (cth `411007`) ialah meter (RSO/Cassini), bukan darjah.

## 4. Leaflet 1.9 — potongan kod

```js
const peta = L.map('peta').setView([2.9264, 101.6958], 13);           // [lat, lng], zum
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap contributors',        // atribusi WAJIB
}).addTo(peta);

const lapisan = L.geoJSON(fc, {
  pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 6 }),
  style: (f) => ({ color: '#1565c0', weight: 2 }),
  onEachFeature: (f, layer) => layer.bindPopup(() => {                  // selamat: textContent
    const el = document.createElement('div'); el.textContent = f.properties.tajuk; return el;
  }),
}).addTo(peta);

peta.fitBounds(lapisan.getBounds());
peta.on('click', (e) => console.log(e.latlng.lat, e.latlng.lng));
peta.on('moveend', () => console.log(peta.getBounds().toBBoxString())); // "minLng,minLat,maxLng,maxLat"
lapisan.clearLayers(); lapisan.addData(fcBaharu);                      // kemas kini tanpa cipta semula
L.control.layers({ OSM: osm }, { Zon: zon, Sungai: sungai }).addTo(peta);

// WMS dari GeoServer (paparan imej)
L.tileLayer.wms('https://geoserver.contoh.test/geoserver/wms', {
  layers: 'ruang:sempadan_zon', format: 'image/png', transparent: true, version: '1.1.1',
}).addTo(peta);
```

## 5. Turf.js 7 — 10 fungsi teratas

| Fungsi | Guna | Contoh |
|--------|------|--------|
| `turf.point / lineString / polygon / featureCollection` | Cipta geometri | `turf.point([101.6958, 2.9264], { id: 'LPR-0001' })` |
| `turf.distance(a, b, { units })` | Jarak (default km) | `turf.distance(a, b)` → `2.185` |
| `turf.buffer(f, r, { units })` | Zon penampan | `turf.buffer(a, 0.5, { units: 'kilometers' })` |
| `turf.booleanPointInPolygon(pt, poly)` | Titik dalam poligon? | Laporan dalam zon mana |
| `turf.pointsWithinPolygon(pts, poly)` | Tapis titik dalam kawasan | Laporan dalam penampan |
| `turf.area(poly)` | Luas (m²) | `/ 10000` → hektar |
| `turf.length(line, { units })` | Panjang garis | Panjang sungai |
| `turf.bbox(geojson)` | `[minLng, minLat, maxLng, maxLat]` | `fitBounds` / query `bbox=` |
| `turf.centroid(geojson)` | Titik tengah | Label zon |
| `turf.nearestPoint(pt, fc)` | Titik terdekat | Kemudahan terdekat dengan laporan |
| `turf.simplify(f, { tolerance })` | Kurangkan bucu (prestasi) | `tolerance: 0.0001` (darjah) |

## 6. Format fail → pustaka JS

| Format | Jenis | Baca (JS) | Tulis (JS) | Nota |
|--------|-------|-----------|------------|------|
| GeoJSON `.geojson` | Vektor | `JSON.parse` / `res.json()` | `JSON.stringify` | Asli web; EPSG:4326 |
| Shapefile `.shp/.shx/.dbf/.prj` (zip) | Vektor | `shpjs` | `@mapbox/shp-write` | Nama medan ≤ 10 aksara; semak `.prj` |
| GeoPackage `.gpkg` | Vektor/raster (SQLite) | `sql.js` (+ nyahkod geometri GPKG) | ⭐ (lanjutan) | Satu fail; standard OGC |
| KML / KMZ | Vektor | `@tmcw/togeojson` (+ `JSZip` untuk KMZ) | `tokml` | KMZ = zip berisi `doc.kml` |
| GeoTIFF `.tif` / COG | Raster | `geotiff` (geotiff.js) | ⭐ `geotiff` (terhad) | COG boleh dibaca separa melalui HTTP Range |
| ECW `.ecw` | Raster | ❌ tiada pustaka JS | ❌ | Tukar ke GeoTIFF/COG dengan GDAL/QGIS |
| LAS / LAZ | Point cloud | `@loaders.gl/las` | ❌ | Kursus: header, bilangan titik, bbox sahaja |
| CSV lat/lng | Jadual | `split` / `papaparse` → bina Feature | Bina baris | Semak nama lajur & susunan |
| WKT / WKB | Geometri teks/binari | `wellknown` / `terraformer` | sama | Lazim dalam pangkalan data spatial |
| FlatGeobuf `.fgb` | Vektor | `flatgeobuf` | `flatgeobuf` | Strim + penapisan bbox melalui HTTP |
| PMTiles / MBTiles | Tile | `pmtiles` / (MBTiles perlukan server) | CLI | Hos tile tanpa tile server |

## 7. GDAL / OGR — arahan pantas

```bash
ogrinfo -so sempadan-zon-rso.shp sempadan-zon-rso            # ringkasan: CRS, bilangan, medan
ogr2ogr -f GeoJSON -t_srs EPSG:4326 -lco RFC7946=YES zon.geojson /vsizip/sempadan-zon-rso.zip
ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:3375 zon-rso.shp zon.geojson
ogr2ogr -f GPKG kemudahan.gpkg kemudahan.geojson -nln kemudahan
ogr2ogr -f KML kemudahan.kml kemudahan.geojson
ogr2ogr -f GeoJSON titik.geojson titik.csv -oo X_POSSIBLE_NAMES=lng -oo Y_POSSIBLE_NAMES=lat -a_srs EPSG:4326
gdalinfo dem-putrajaya.tif                                     # saiz, CRS, geotransform, statistik
gdalwarp -t_srs EPSG:4326 input.tif output-4326.tif           # unjur semula raster
gdal_translate -of COG -co COMPRESS=DEFLATE imej.ecw imej-cog.tif   # ECW → COG (perlu pemacu ECW)
pdal info --summary sampel.las                                 # LAS/LAZ (PDAL, bukan GDAL)
```

> ⚠️ Kebanyakan build GDAL **tidak** menyertakan pemacu ECW (lesen SDK proprietari). Guna QGIS (OSGeo4W) atau pasukan GIS yang ada lesen untuk penukaran sekali sahaja, kemudian simpan sebagai COG.

## 8. OGC — URL template (GeoServer)

```text
# WMS GetCapabilities
https://<hos>/geoserver/wms?service=WMS&version=1.3.0&request=GetCapabilities

# WMS GetMap (1.1.1: BBOX = minLng,minLat,maxLng,maxLat bagi EPSG:4326)
https://<hos>/geoserver/wms?service=WMS&version=1.1.1&request=GetMap&layers=ruang:sempadan_zon
  &styles=&srs=EPSG:4326&bbox=101.65,2.90,101.73,2.96&width=512&height=512&format=image/png&transparent=true

# WFS GetFeature → GeoJSON (1.x; outputFormat=application/json)
https://<hos>/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ruang:sempadan_zon
  &outputFormat=application/json&srsName=EPSG:4326&maxFeatures=100&bbox=101.65,2.90,101.73,2.96,EPSG:4326

# WMTS (tile pra-render)
https://<hos>/geoserver/gwc/service/wmts?service=WMTS&request=GetCapabilities
```

| Perkhidmatan | Pulangkan | Guna dalam JS |
|--------------|-----------|---------------|
| **WMS** | Imej (PNG/JPEG) | `L.tileLayer.wms(...)`: paparan sahaja, tiada atribut |
| **WMTS / XYZ** | Tile imej pra-render | `L.tileLayer(...)`: paling pantas |
| **WFS** | Ciri vektor (GeoJSON/GML) | `fetch` → `L.geoJSON`: boleh ditapis, di-popup, dianalisis Turf |

> ⚠️ **Susunan paksi bbox**: WMS **1.3.0** + `CRS=EPSG:4326` menggunakan `minLat,minLng,maxLat,maxLng`. WMS 1.1.1 + `SRS=EPSG:4326` menggunakan `minLng,minLat,maxLng,maxLat`. Jika imej kosong, cuba tukar versi atau susunan.

## 9. Susunan `bbox`

| Konteks | Susunan |
|---------|---------|
| GeoJSON `bbox`, Turf `turf.bbox()`, `bboxDari()` GeoLapor, query `?bbox=` mock API | `minLng,minLat,maxLng,maxLat` (barat, selatan, timur, utara) |
| Leaflet `getBounds().toBBoxString()` | `minLng,minLat,maxLng,maxLat` ✅ sama |
| Leaflet `L.latLngBounds([[lat1,lng1],[lat2,lng2]])` | sudut `[lat, lng]` ⚠️ |
| WMS 1.3.0 EPSG:4326 | `minLat,minLng,maxLat,maxLng` ⚠️ |

```js
// Muat laporan dalam paparan semasa sahaja (mock API GeoLapor)
const bbox = peta.getBounds().toBBoxString();      // "101.65,2.90,101.73,2.96"
const fc = await senaraiLaporan({ bbox });          // GET /api/laporan?bbox=…
```
