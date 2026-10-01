# 08 · Web Mapping dengan Leaflet, OGC & GeoServer

> Nota topikal · Indeks: [`./README.md`](./README.md)

## Objektif nota

Selepas membaca nota ini, anda boleh:

- **Menerangkan** cara *tile* peta XYZ `z/x/y` berfungsi dan beza tile **raster** dengan tile **vektor**.
- **Membezakan** EPSG:4326 (data) dengan EPSG:3857 (paparan), dan **menukar** susunan `[lng, lat]` (GeoJSON) ↔ `[lat, lng]` (Leaflet) tanpa silap.
- **Membina** peta Leaflet 1.9 dengan tile OSM beratribusi, marker, popup selamat, `L.geoJSON` (`pointToLayer`, `style`, `onEachFeature`), `fitBounds` dan kawalan layer.
- **Memanggil** perkhidmatan OGC (WMS, WMTS, WFS) daripada GeoServer dan memaparkannya dalam Leaflet.
- **Memilih** pustaka peta yang sesuai (Leaflet / MapLibre GL JS / OpenLayers / ArcGIS Maps SDK) dan **merancang** cara menyepadukannya ke dalam sistem PGN sedia ada.

---

## 1. Kenapa peta web berbeza daripada peta desktop?

Dalam QGIS/ArcGIS Pro, fail dibuka terus daripada cakera dan dilukis oleh CPU mesin anda. Dalam browser:

1. **Data mesti dihantar melalui rangkaian** — setiap bait dikira. Peta dunia penuh pada zum 18 ialah berbilion piksel; mustahil dimuat sekali gus.
2. **Browser hanya faham HTML, CSS, JS, imej & JSON** — bukan `.shp` atau `.ecw`. Sesuatu mesti menukar data kepada bentuk yang browser faham (tile imej, GeoJSON, tile vektor).
3. **Pengguna menjangka peta licin** — seret & zum tanpa tersekat.

Penyelesaian industri: **potong dunia kepada tile kecil** (biasanya 256×256 px) dan muat hanya tile yang kelihatan. Di atas tile asas itu, kita tindih **layer data** (GeoJSON, WMS, dsb.).

```mermaid
flowchart TB
    subgraph Browser
      M[Leaflet L.map] --> T[Base tile layer<br/>OSM / tile dalaman]
      M --> W[WMS layer<br/>GeoServer]
      M --> G[GeoJSON layer<br/>GeoLapor API]
    end
    T -->|GET /{z}/{x}/{y}.png| TS[(Tile server)]
    W -->|GET ?SERVICE=WMS&REQUEST=GetMap| GS[(GeoServer)]
    G -->|GET /api/laporan| API[(Mock API :3000)]
```

---

## 2. Tile XYZ: `{z}/{x}/{y}`

| Simbol | Maksud |
|--------|--------|
| `z` | Aras zum. Zum 0 = seluruh dunia dalam **1** tile. Setiap aras menggandakan lebar & tinggi → zum `z` ada `2^z × 2^z` tile. |
| `x` | Lajur tile, 0 di barat (−180°) bertambah ke timur. |
| `y` | Baris tile, 0 di **utara** (≈85.05°U) bertambah ke selatan (skema XYZ/"Slippy Map"). TMS menterbalikkan `y` — punca biasa tile "tunggang terbalik". |

Contoh: Putrajaya (lat 2.9264, lng 101.6958) pada zum 12 ialah tile kira-kira `z=12, x=3205, y=2014` — URL OSM: `https://tile.openstreetmap.org/12/3205/2014.png`.

```js
// Kira nombor tile untuk satu titik — berguna untuk memahami (dan untuk menyediakan tile luar talian)
function jubinUntuk(lat, lng, z) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { z, x, y };
}
console.log(jubinUntuk(2.9264, 101.6958, 12)); // { z: 12, x: 3205, y: 2014 }
```

### Raster vs vektor

| | **Tile raster** (PNG/JPEG/WebP) | **Tile vektor** (MVT/PBF) |
|---|---|---|
| Kandungan | Imej siap dilukis | Geometri + atribut, dilukis di browser (WebGL) |
| Gaya | Tetap (ditentukan di server) | Boleh ubah di klien (tema gelap, label BM) |
| Putaran/condong 3D | Tidak | Ya |
| Saiz | Lebih besar per tile | Lebih kecil, tajam pada semua skala |
| Pustaka | Leaflet (natif) | MapLibre GL JS / OpenLayers (natif); Leaflet perlu plugin |
| Contoh | OSM standard, WMS/WMTS | OpenMapTiles, PMTiles, tile vektor ArcGIS |

> 💡 **Tip:** Untuk kursus ini (dan kebanyakan sistem dalaman), **tile raster + layer GeoJSON** memadai dan paling mudah difahami. Tile vektor menjadi relevan apabila anda perlukan gaya dinamik atau data sangat besar.

---

## 3. CRS: data dalam 4326, paparan dalam 3857

| EPSG | Nama | Unit | Di mana |
|------|------|------|---------|
| **4326** | WGS 84 (geografi) | darjah | **Data**: GeoJSON (RFC 7946 mewajibkan WGS84), GPS, API GeoLapor |
| **3857** | WGS 84 / Pseudo-Mercator | meter | **Paparan**: hampir semua tile web (OSM, Google, Bing) |
| **3375** | GDM2000 / Peninsula RSO | meter | Data rasmi Semenanjung (lihat [nota 09](./09-format-data-geospatial.md)) |

Leaflet secara default menggunakan `L.CRS.EPSG3857` untuk **paparan** tetapi semua API awamnya menerima **lat/lng (darjah)**. Jadi anda jarang perlu menukar 4326→3857 sendiri — Leaflet buat untuk anda. Yang **mesti** anda buat sendiri ialah menukar data RSO (3375) → 4326 **sebelum** memberi kepada Leaflet (guna `keWgs84()` dalam `utils/unjuran.js`).

### ⚠️ Susunan koordinat — ulang sampai hafal

```js
// GeoJSON (RFC 7946) — [longitud, latitud]  →  [x, y]
const feature = { type: 'Feature', geometry: { type: 'Point', coordinates: [101.6958, 2.9264] } };

// Leaflet — [latitud, longitud]  →  [y, x]
L.marker([2.9264, 101.6958]);

// Tukar dengan destructuring — JANGAN indeks [0]/[1] tanpa nama
const [lng, lat] = feature.geometry.coordinates;
L.marker([lat, lng]);

// Atau guna pembantu Leaflet
const latlng = L.GeoJSON.coordsToLatLng(feature.geometry.coordinates); // L.LatLng {lat: 2.9264, lng: 101.6958}
```

**Ujian pantas:** Malaysia berada sekitar **lat 1–7**, **lng 99–119**. Jika `[101.6958, 2.9264]` diberi terus kepada Leaflet, ia dibaca sebagai lat 101.7 (tidak wujud — Leaflet mengepit ke ≈85°) dan marker muncul di luar peta atau di tempat mengarut. Jika marker anda tiada di Malaysia, susunan anda terbalik. `dalamMalaysia([lng, lat])` dalam `utils/geo.js` wujud tepat untuk tangkap kesilapan ini.

---

## 4. Leaflet 1.9 — teras

### 4.1 Peta + tile asas (dengan atribusi)

```html
<!-- Salinan tempatan (luar talian) — lihat §9. Versi CDN: https://unpkg.com/leaflet@1.9.4/dist/leaflet.css -->
<link rel="stylesheet" href="./vendor/leaflet/leaflet.css" />
<div id="peta" style="height: 480px"></div>
<script src="./vendor/leaflet/leaflet.js"></script>
<script type="module" src="./main.js"></script>
```

```js
// main.js — Hari 3 (tanpa bundler; L global daripada <script>)
const peta = L.map('peta', {
  center: [2.9264, 101.6958], // [lat, lng] — Putrajaya
  zoom: 13,
  maxZoom: 19,
});

// Tile OSM: atribusi WAJIB (lesen ODbL) dan hormati polisi penggunaan tile
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(peta);
```

> ⚠️ **Polisi tile OSM:** server `tile.openstreetmap.org` ialah sumbangan komuniti. **Dilarang** memuat turun pukal (*bulk download/prefetch*) untuk kegunaan luar talian, dan aplikasi berat perlu tile server sendiri atau pembekal komersial. Untuk sistem produksi PGN, gunakan tile server/peta asas dalaman.

### 4.2 Marker & popup — kandungan selamat

`bindPopup(string)` **mentafsir HTML**. Jika `tajuk` datang daripada pengguna (borang GeoLapor), string HTML membuka pintu XSS. Beri **elemen DOM** sebaliknya:

```js
function binaPopup(properties) {
  const div = document.createElement('div');
  const h = document.createElement('strong');
  h.textContent = properties.tajuk;          // textContent — tidak ditafsir sebagai HTML
  const p = document.createElement('p');
  p.textContent = `${properties.kategori} · ${properties.status}`;
  div.append(h, p);
  return div;
}

L.marker([2.9264, 101.6958]).bindPopup(binaPopup({
  tajuk: 'Papan tanda sempadan rosak <img src=x onerror=alert(1)>', // cubaan XSS → dipapar sebagai teks
  kategori: 'infrastruktur',
  status: 'baharu',
})).addTo(peta);
```

### 4.3 `L.geoJSON` — satu panggilan untuk seluruh FeatureCollection

```js
const WARNA_KATEGORI = {
  infrastruktur: '#d97706',
  'alam-sekitar': '#16a34a',
  tanah: '#92400e',
  utiliti: '#2563eb',
  'lain-lain': '#6b7280',
};

const lapisanLaporan = L.geoJSON(null, {
  // (1) Point → layer apa? Default: L.marker. circleMarker lebih ringan & boleh diwarna.
  pointToLayer: (feature, latlng) =>            // latlng SUDAH ditukar ke [lat, lng] oleh Leaflet
    L.circleMarker(latlng, {
      radius: 7,
      color: '#fff',
      weight: 1,
      fillColor: WARNA_KATEGORI[feature.properties.kategori] ?? '#6b7280',
      fillOpacity: 0.9,
    }),

  // (2) Gaya untuk layer vektor (Polygon/LineString, juga circleMarker). Pulangkan {} = tiada perubahan.
  style: (feature) => (feature.geometry.type === 'Polygon' ? { color: '#7c3aed', weight: 2, fillOpacity: 0.1 } : {}),

  // (3) Dipanggil sekali per feature — tempat popup, tooltip, event
  onEachFeature: (feature, layer) => {
    layer.bindPopup(binaPopup(feature.properties));
    layer.on('click', () => console.log('Dipilih', feature.id));
  },

  // (4) Tapis tanpa ubah data asal
  filter: (feature) => feature.properties.status !== 'ditolak',
}).addTo(peta);

// Isi daripada API (services/api.js — Hari 2)
const fc = await senaraiLaporan();   // FeatureCollection
lapisanLaporan.clearLayers();
lapisanLaporan.addData(fc);

// Zum supaya semua data kelihatan
if (lapisanLaporan.getLayers().length > 0) {
  peta.fitBounds(lapisanLaporan.getBounds(), { padding: [24, 24], maxZoom: 16 });
}
```

> 💡 **Tip:** Simpan **satu** rujukan `lapisanLaporan` dan guna `clearLayers()` + `addData()` untuk kemas kini. Mencipta `L.geoJSON` baharu setiap kali tapisan berubah akan menyebabkan layer bertindih dan ingatan bocor.

### 4.4 Kawalan layer

```js
const zon = L.geoJSON(await dapatkanLapisan('sempadan-zon'), { style: { color: '#7c3aed', weight: 2 } });
const sungai = L.geoJSON(await dapatkanLapisan('sungai'), { style: { color: '#0284c7', weight: 3 } });

L.control.layers(
  { 'OpenStreetMap': osm },                                   // peta asas (radio)
  { 'Laporan': lapisanLaporan, 'Sempadan zon': zon, 'Sungai': sungai }, // tindihan (checkbox)
  { collapsed: false },
).addTo(peta);

L.control.scale({ metric: true, imperial: false }).addTo(peta);
```

### 4.5 Event peta → borang (Hari 3)

```js
peta.on('click', (e) => {
  const { lat, lng } = e.latlng;                       // Leaflet memberi objek {lat, lng}
  document.querySelector('#lat').value = lat.toFixed(6);
  document.querySelector('#lng').value = lng.toFixed(6);
});

peta.on('moveend', () => {
  const b = peta.getBounds();
  const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]; // susunan bbox GeoJSON/API
  console.log('bbox semasa', bbox.join(','));          // untuk ?bbox= (lihat nota 13 §8)
});
```

---

## 5. Standard OGC: WMS, WMTS, WFS

Sistem geospatial kerajaan (termasuk yang menggunakan GeoServer, ArcGIS Server, MapServer) mendedahkan data melalui **standard OGC**. Kelebihannya: satu server, banyak klien (QGIS, ArcGIS, Leaflet, OpenLayers) tanpa format khas.

| Perkhidmatan | Pulangkan | Guna bila | Operasi utama |
|--------------|-----------|-----------|---------------|
| **WMS** (Web Map Service) | **Imej** (PNG/JPEG) dilukis ikut request | Papar layer besar yang digayakan di server; tiada interaksi per-feature | `GetCapabilities`, `GetMap`, `GetFeatureInfo` |
| **WMTS** (Web Map Tile Service) | **Tile imej** pra-jana, grid tetap | Peta asas / imejan udara besar; sangat pantas (cache) | `GetCapabilities`, `GetTile` |
| **WFS** (Web Feature Service) | **Data vektor** (GML, GeoJSON) | Perlu atribut, klik, tapis, analisis di klien | `GetCapabilities`, `DescribeFeatureType`, `GetFeature` |

### 5.1 Contoh URL (gaya GeoServer, workspace `pgn`)

```text
# WMS — senarai layer & keupayaan
http://localhost:8080/geoserver/pgn/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities

# WMS — satu imej 768×512 bagi kotak Putrajaya
# ⚠️ WMS 1.3.0 + EPSG:4326 → BBOX ialah minLat,minLng,maxLat,maxLng (paksi lat dahulu!)
http://localhost:8080/geoserver/pgn/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap
  &LAYERS=pgn:sempadan_zon&STYLES=&CRS=EPSG:4326
  &BBOX=2.88,101.65,2.98,101.75&WIDTH=768&HEIGHT=512&FORMAT=image/png&TRANSPARENT=true

# WMTS — keupayaan (GeoServer melalui GeoWebCache terbina)
http://localhost:8080/geoserver/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetCapabilities

# WFS — features sebagai GeoJSON, dalam 4326, maksimum 100, tapis bbox
http://localhost:8080/geoserver/pgn/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature
  &TYPENAMES=pgn:kemudahan&OUTPUTFORMAT=application/json&SRSNAME=EPSG:4326
  &COUNT=100&BBOX=101.65,2.88,101.75,2.98,urn:ogc:def:crs:EPSG::4326
```

> ⚠️ **Perangkap paksi:** WMS 1.1.1 guna `SRS=` dan BBOX `minx,miny,...` (lng dahulu). WMS 1.3.0 guna `CRS=` dan untuk EPSG:4326 **lat dahulu**. Imej kosong atau salah tempat biasanya berpunca di sini. Dalam WFS 2.0, tambah URN CRS pada BBOX supaya tafsiran paksi jelas.

### 5.2 WMS dalam Leaflet

```js
const wmsZon = L.tileLayer.wms('http://localhost:8080/geoserver/pgn/wms', {
  layers: 'pgn:sempadan_zon',
  format: 'image/png',
  transparent: true,         // supaya tile asas kelihatan di bawah
  version: '1.3.0',
  attribution: 'Data sintetik latihan',
}).addTo(peta);
// Leaflet menjana GetMap per tile 256×256 dalam EPSG:3857 — paksi tidak menjadi isu di sini.
```

### 5.3 WFS → GeoJSON → `L.geoJSON`

```js
async function muatWfs(typeName, bbox) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: typeName,
    outputFormat: 'application/json', // GeoServer: GeoJSON
    srsName: 'EPSG:4326',
    count: '500',                     // JANGAN tarik semua — had
    bbox: `${bbox.join(',')},urn:ogc:def:crs:EPSG::4326`,
  });
  const res = await fetch(`http://localhost:8080/geoserver/pgn/ows?${params}`);
  if (!res.ok) throw new Error(`WFS gagal: ${res.status}`);
  return res.json();
}
```

> ⚠️ **Semak paksi output:** dengan `srsName=EPSG:4326` sesetengah versi/tetapan GeoServer memulangkan koordinat `[lat, lng]` dalam GeoJSON. Jika titik muncul di tempat pelik, cuba `srsName=urn:ogc:def:crs:OGC:1.3:CRS84` (sentiasa lng,lat) atau semak dengan `dalamMalaysia()`.

---

## 6. GeoServer — asas yang perlu tahu

GeoServer ialah map server sumber terbuka (Java) yang menerbitkan data sebagai WMS/WMTS/WFS/WCS dan OGC API.

| Konsep | Maksud | Contoh latihan |
|--------|--------|----------------|
| **Workspace** | Ruang nama (prefix) | `pgn` |
| **Store** | Sambungan ke sumber data | PostGIS, direktori Shapefile, GeoPackage, GeoTIFF |
| **Layer** | Satu jadual/fail yang diterbitkan | `pgn:sempadan_zon` |
| **Style** | Gaya SLD/CSS untuk WMS | `zon_ungu.sld` |
| **Layer group** | Beberapa layer sebagai satu | `pgn:peta_asas` |
| **GeoWebCache** | Cache tile terbina (WMTS/TMS) | pra-jana tile zum 6–16 |

### CORS

Browser menyekat `fetch()` ke asal (*origin*) lain melainkan server menghantar `Access-Control-Allow-Origin`. `L.tileLayer.wms` (tag `<img>`) **tidak** terkesan CORS, tetapi **WFS melalui `fetch` terkesan**. Pilihan:

1. Aktifkan penapis CORS GeoServer (dalam `web.xml` Jetty/Tomcat — lihat dokumentasi *Running in a production environment → container*), hadkan kepada asal sistem anda — **bukan** `*` untuk data dalaman.
2. **Reverse proxy** (Nginx/Apache/IIS) supaya aplikasi & GeoServer berkongsi asal yang sama: `https://gis.agensi.gov.my/app/` dan `https://gis.agensi.gov.my/geoserver/`. Tiada CORS diperlukan langsung.
3. Semasa pembangunan: `server.proxy` Vite (lihat [nota 11](./11-tooling-npm-vite-eslint.md)).

---

## 7. Perbandingan pustaka peta JavaScript

| | **Leaflet 1.9** | **MapLibre GL JS** | **OpenLayers** | **ArcGIS Maps SDK for JavaScript** |
|---|---|---|---|---|
| Lesen | BSD-2 (bebas) | BSD-3 (bebas; fork sumber terbuka Mapbox GL v1) | BSD-2 (bebas) | Proprietari Esri (perlu akaun/lesen untuk banyak ciri) |
| Rendering | DOM/SVG/Canvas (2D) | **WebGL** (tile vektor, 3D condong/putar) | Canvas + WebGL | WebGL (2D & 3D penuh) |
| Projection | 3857 (default); lain via plugin Proj4Leaflet | 3857 (+ globe) | **Sebarang CRS** melalui proj4 — kuat untuk RSO/Cassini | Banyak CRS, termasuk rujukan ruang Esri |
| OGC | WMS natif; WFS manual (fetch) | Terhad (raster WMS via URL template) | **Paling lengkap**: WMS, WMTS, WFS, GML, KML | Lengkap + perkhidmatan ArcGIS (FeatureServer, MapServer) |
| Saiz / keluk pembelajaran | ~40 KB gz · paling mudah | Sederhana · gaya JSON | Besar · API luas | Besar · ekosistem Esri |
| Kekuatan | Mudah, plugin banyak, sesuai kursus & sistem dalaman | Peta asas vektor cantik, data besar, 3D | GIS "serius" di web, CRS tempatan, standard OGC | Integrasi ArcGIS Enterprise/Online sedia ada |
| Pilih bila | Paparan titik/poligon + WMS, CRUD laporan | Perlu gaya dinamik / tile vektor / PMTiles | Perlu papar data dalam RSO/Cassini asli, WFS-T, alat ukur | Organisasi sudah menggunakan ArcGIS Enterprise |

> 💡 **Tip:** Konsep yang anda pelajari dengan Leaflet (layer, `[lat,lng]` vs `[lng,lat]`, GeoJSON, WMS, event peta) **boleh dipindah** terus ke pustaka lain. Yang berubah hanyalah nama fungsi.

Contoh sama — satu marker Putrajaya:

```js
// Leaflet
L.marker([2.9264, 101.6958]).addTo(peta);                     // [lat, lng]

// MapLibre GL JS
new maplibregl.Marker().setLngLat([101.6958, 2.9264]).addTo(map); // [lng, lat]!

// OpenLayers
new Feature({ geometry: new Point(fromLonLat([101.6958, 2.9264])) }); // [lng, lat] → 3857
```

---

## 8. Menyepadukan peta JS ke dalam sistem PGN sedia ada

Kebanyakan peserta tidak akan membina sistem dari kosong — mereka perlu **menambah peta** kepada sistem sedia ada (PHP/Java/.NET, kadangkala jQuery).

### 8.1 Pilihan integrasi

| Cara | Bila sesuai | Nota |
|------|-------------|------|
| **`<iframe>`** halaman peta berasingan | Paling cepat; sistem lama tidak boleh diubah banyak | Komunikasi dua hala via `window.postMessage` (sahkan `event.origin`!) |
| **Modul ES dalam halaman sedia ada** | Halaman server-rendered (PHP/JSP/Razor) | Satu `<div id="peta">` + `<script type="module" src="/js/peta.js">`; data awal melalui atribut `data-*` atau endpoint JSON |
| **Build Vite → aset statik** | Mahu npm/pustaka tetapi backend kekal | `vite build` → salin `dist/` ke folder `public/` sistem; tetapkan `base` dalam `vite.config.js` |
| **Aplikasi berasingan (SPA)** | Sistem baharu atau modul besar | Backend jadi API sahaja |

```html
<!-- Contoh: halaman PHP sedia ada, tambah peta tanpa mengubah jQuery lama -->
<div id="peta" data-api="/api" data-lapisan="sempadan-zon,sungai" style="height:420px"></div>
<script type="module">
  // Hasil `vite build` GeoLapor disalin ke /js/geolapor/ dalam sistem sedia ada
  import { ciptaPeta } from '/js/geolapor/ui/peta.js';
  const el = document.querySelector('#peta');
  const peta = ciptaPeta(el, {
    onKlikPeta: ([lng, lat]) => { $('#lat').val(lat); $('#lng').val(lng); }, // jQuery lama pun boleh menerima nilai
  });
  // data-* memberi konfigurasi daripada server (PHP/JSP) tanpa JS sebaris
  console.info('API:', el.dataset.api, 'lapisan:', el.dataset.lapisan.split(','));
</script>
```

```js
// iframe → induk: hantar koordinat yang dipilih
window.parent.postMessage({ jenis: 'titik-dipilih', lat: 2.9264, lng: 101.6958 }, 'https://sistem.agensi.test');

// induk: terima — SENTIASA sahkan asal
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://peta.agensi.test') return;
  if (e.data?.jenis === 'titik-dipilih') console.log(e.data.lat, e.data.lng);
});
```

### 8.2 Pengesahan ke GeoServer / API

- **Jangan** letak kata laluan GeoServer atau API key sebenar dalam JS — sesiapa boleh buka DevTools dan membacanya. (Key `latihan-pgn-2026` dalam kursus ini **sengaja** palsu.)
- Corak disyorkan: **proxy backend**. Browser memanggil `/proxy/wfs?...` pada server aplikasi (yang sudah tahu sesi pengguna); server menambah kelayakan GeoServer dan meneruskan request.
- Jika token digunakan (JWT/OAuth2 daripada SSO agensi), hantar dalam header `Authorization: Bearer …` melalui `fetch`. Untuk tile WMS (tag `<img>`) header tidak boleh ditambah → guna proxy atau kuki sesi pada domain yang sama.

### 8.3 Tile luar talian

- Salin `leaflet.js`, `leaflet.css` dan folder `images/` ke `vendor/leaflet/` (lihat §9).
- Untuk peta asas luar talian: jana tile sendiri daripada data yang dibenarkan (cth GeoServer + GeoWebCache seed, atau MBTiles/PMTiles — [nota 09](./09-format-data-geospatial.md)). **Jangan** muat turun pukal tile OSM awam.
- Jika tiada tile langsung, peta tetap berfungsi dengan layer GeoJSON sahaja (latar kosong) — cukup untuk lab.

---

## 9. Leaflet salinan tempatan (luar talian)

```bash
# Dalam projek Vite (Hari 4) — dipakej oleh bundler
npm install leaflet@1.9
```

```js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
```

Untuk Hari 1–3 (tanpa bundler), salin daripada `node_modules/leaflet/dist/` (atau zip dari laman muat turun Leaflet) ke `vendor/leaflet/` dan rujuk dengan laluan relatif seperti §4.1.

> ⚠️ Dengan Vite, ikon marker default kadangkala hilang (laluan imej CSS). Penyelesaian ringkas: guna `L.circleMarker` (tiada imej), atau import ikon secara eksplisit:
> ```js
> import ikonUrl from 'leaflet/dist/images/marker-icon.png';
> import ikon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
> import bayangUrl from 'leaflet/dist/images/marker-shadow.png';
> L.Icon.Default.mergeOptions({ iconUrl: ikonUrl, iconRetinaUrl: ikon2xUrl, shadowUrl: bayangUrl });
> ```

---

## ⚠️ Kesilapan lazim

| Simptom | Punca | Pembetulan |
|---------|-------|------------|
| Peta kelabu/kosong, tiada error | `#peta` tiada ketinggian CSS | Beri `height` eksplisit |
| Tile bercelaru selepas panel dibuka | Saiz bekas berubah selepas peta dicipta | `peta.invalidateSize()` selepas susun atur berubah |
| Marker di Antartika / laut | `[lng, lat]` diberi kepada Leaflet | Destructure `const [lng, lat] = coords` → `L.marker([lat, lng])` |
| Layer bertindih, peta makin perlahan | `L.geoJSON(...).addTo()` baharu setiap kemas kini | Satu layer + `clearLayers()`/`addData()` |
| Popup memaparkan/menjalankan HTML pengguna | `bindPopup(\`<b>${tajuk}</b>\`)` | Bina elemen dengan `textContent` |
| WMS kosong | BBOX paksi salah (1.3.0), nama layer tanpa workspace, `TRANSPARENT` tiada | Uji URL GetMap terus di browser; semak GetCapabilities |
| `fetch` WFS disekat CORS | GeoServer tanpa CORS | Proxy / domain sama / aktifkan CORS terhad |
| `fitBounds` error "Bounds are not valid" | Layer kosong | Semak `getLayers().length > 0` dahulu |

---

## 📖 Bacaan buku

> *JavaScript All-in-One For Dummies* (Minnick, 2023) tidak mempunyai bab tentang topik ini. Guna nota ini dan rujukan rasmi di bawah.


## Rujukan rasmi

- Leaflet — Rujukan API: <https://leafletjs.com/reference.html>
- Leaflet — Tutorial GeoJSON: <https://leafletjs.com/examples/geojson/>
- Leaflet — Tutorial WMS/TMS: <https://leafletjs.com/examples/wms/wms.html>
- Leaflet — Muat turun: <https://leafletjs.com/download.html>
- OSM — Polisi penggunaan tile: <https://operations.osmfoundation.org/policies/tiles/> · Hak cipta & atribusi: <https://www.openstreetmap.org/copyright>
- RFC 7946 — The GeoJSON Format: <https://datatracker.ietf.org/doc/html/rfc7946>
- OGC WMS: <https://www.ogc.org/standards/wms/> · WMTS: <https://www.ogc.org/standards/wmts/> · WFS: <https://www.ogc.org/standards/wfs/>
- GeoServer — WMS reference: <https://docs.geoserver.org/stable/en/user/services/wms/reference/> · WFS reference: <https://docs.geoserver.org/stable/en/user/services/wfs/reference/> · Output format WFS: <https://docs.geoserver.org/stable/en/user/services/wfs/outputformats/> · Workspaces: <https://docs.geoserver.org/stable/en/user/data/webadmin/workspaces/> · Container (CORS): <https://docs.geoserver.org/stable/en/user/production/container/>
- MapLibre GL JS: <https://maplibre.org/maplibre-gl-js/docs/> · OpenLayers: <https://openlayers.org/> · ArcGIS Maps SDK for JavaScript: <https://developers.arcgis.com/javascript/latest/>
- Leaflet.markercluster: <https://github.com/Leaflet/Leaflet.markercluster>

## Digunakan pada Hari N

- **Hari 1** — GeoJSON sebagai objek JS; susunan `[lng, lat]` (§3).
- **Hari 2** — ambil layer GeoJSON daripada API; `bbox` query (§4.5, §5.3).
- **Hari 3 (utama)** — S2: peta Leaflet, `L.geoJSON`, popup selamat; S3: klik peta → borang, klik senarai → zum (§4).
- **Hari 4** — Leaflet melalui npm + Vite, ikon marker (§9); proxy dev (§6).
- **Hari 5** — S2: MapLibre/OpenLayers, integrasi ke sistem sedia ada, WMS/WFS GeoServer (§5–§8).
