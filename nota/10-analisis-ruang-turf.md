# 10 · Analisis Ruang di Browser dengan Turf.js 7

> Nota topikal · Indeks: [`./README.md`](./README.md)

## Objektif nota

Selepas membaca nota ini, anda boleh:

- **Menerangkan** bila analisis ruang patut dibuat di browser (Turf) dan bila di server (PostGIS/GeoServer).
- **Menggunakan** fungsi Turf teras — `distance`, `buffer`, `booleanPointInPolygon`, `pointsWithinPolygon`, `bbox`, `centroid`, `area`, `length`, `along`, `nearestPoint` — dengan unit yang betul.
- **Menjawab** soalan GeoLapor seperti "laporan mana dalam zon Z1?" dan "laporan mana dalam 1 km dari sungai?".
- **Mempercepat** peta dengan `simplify` dan **mengelompokkan** titik dengan `clustersKmeans` / `clustersDbscan`.

---

## 1. Kenapa Turf?

GeoJSON hanyalah objek JavaScript. Untuk soalan "berapa jauh", "di dalam atau di luar", "berapa luas", kita perlukan **geometri sfera** — bukan Pythagoras biasa (1° longitud di Putrajaya ≈ 111 km, tetapi di Kutub ≈ 0 km).

**Turf.js** ialah pustaka analisis ruang modular untuk JavaScript yang:

- menerima & memulangkan **GeoJSON** (tiada format baharu untuk dipelajari),
- berfungsi di browser **dan** Node.js (jadi boleh diuji dengan `node --test`),
- modular — boleh import satu fungsi (`@turf/distance`) atau semua (`@turf/turf`).

| Buat di browser (Turf) | Buat di server (PostGIS/GeoServer) |
|------------------------|-------------------------------------|
| Ratusan–puluhan ribu feature yang sudah dimuat | Jutaan rekod / seluruh negara |
| Interaksi segera (klik → "zon mana?") | Hasil mesti konsisten untuk semua pengguna/laporan rasmi |
| Preview sebelum hantar | Keputusan yang disimpan (audit) |
| Luar talian | Data sulit yang tidak patut dihantar ke browser |

```bash
npm install @turf/turf@7
```

```js
import * as turf from '@turf/turf';              // semua (mudah untuk kursus)
// atau lebih kecil untuk produksi:
import { distance } from '@turf/distance';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
```

> 💡 **Tip:** Turf 7 menggunakan **named export** untuk pakej individu (`import { distance } from '@turf/distance'`). Contoh lama di internet (`import distance from '@turf/distance'`) ialah gaya Turf 6.

---

## 2. Data contoh (sintetik, Putrajaya)

Semua output di bawah **diuji** dengan `@turf/turf` 7.4 dalam Node.

```js
import * as turf from '@turf/turf';

// Pembantu Turf mencipta GeoJSON yang sah — [lng, lat] seperti biasa
const a = turf.point([101.6958, 2.9264], { id: 'LPR-0001' });
const b = turf.point([101.7100, 2.9400], { id: 'LPR-0003' });
const c = turf.point([101.6500, 2.9200], { id: 'LPR-0002' });
const laporan = turf.featureCollection([a, b, c]);

// Satu zon segi empat (cincin poligon MESTI tertutup: titik pertama = titik terakhir)
const zon = turf.polygon(
  [[[101.68, 2.91], [101.72, 2.91], [101.72, 2.95], [101.68, 2.95], [101.68, 2.91]]],
  { kod: 'Z1', nama: 'Zon Presint Sintetik' },
);

const sungai = turf.lineString(
  [[101.66, 2.90], [101.69, 2.93], [101.73, 2.96]],
  { nama: 'Sungai Sintetik A' },
);
```

---

## 3. Ukuran

### 3.1 Jarak & unit

```js
turf.distance(a, b);                        // 2.185  (default: kilometers)
turf.distance(a, b, { units: 'meters' });   // 2185
```

Unit yang diterima: `kilometers` (default), `meters`, `miles`, `nauticalmiles`, `degrees`, `radians`, dan lain-lain. Jarak Turf ialah **jarak bulatan besar (haversine)** — sama seperti `jarakKm()` yang anda tulis pada Hari 1. Bandingkan hasilnya sebagai ujian!

### 3.2 Panjang, keluasan, titik sepanjang garisan

```js
turf.length(sungai);                         // 10.270  km
turf.along(sungai, 1).geometry.coordinates;  // [101.66636, 2.90636] — titik 1 km dari hulu
turf.area(zon);                              // meter persegi → 19757091
(turf.area(zon) / 10_000).toFixed(1);        // '1975.7' hektar
```

> ⚠️ `turf.area()` **sentiasa** memulangkan **meter persegi** (tiada pilihan `units`). Bahagi 10 000 untuk hektar, 1 000 000 untuk km².

### 3.3 Kotak sempadan & pusat

```js
turf.bbox(laporan);                          // [101.65, 2.92, 101.71, 2.94]  → [minLng, minLat, maxLng, maxLat]
turf.centroid(zon).geometry.coordinates;     // [101.7, 2.93]
turf.bboxPolygon(turf.bbox(laporan));        // bbox → Polygon (untuk dilukis)
```

`bbox` Turf ialah susunan yang sama dengan `bboxDari()` (Hari 1) dan parameter `?bbox=` mock API. Untuk Leaflet, tukar:

```js
const [minLng, minLat, maxLng, maxLat] = turf.bbox(laporan);
peta.fitBounds([[minLat, minLng], [maxLat, maxLng]]);  // Leaflet: [[lat, lng], [lat, lng]]
```

---

## 4. Hubungan ruang (di dalam / berdekatan)

### 4.1 Titik dalam poligon

```js
turf.booleanPointInPolygon(a, zon);                                // true
turf.booleanPointInPolygon(turf.point([101.65, 2.92]), zon);       // false

// Tapis banyak titik sekali gus
turf.pointsWithinPolygon(laporan, zon).features.map((f) => f.properties.id);
// ['LPR-0001', 'LPR-0003']
```

**Kes GeoLapor — "zon mana laporan ini?"** (klik marker → papar nama zon):

```js
/** @returns {string|null} kod zon yang mengandungi laporan, atau null */
function cariZon(laporanFeature, zonFC) {
  const jumpa = zonFC.features.find((z) => turf.booleanPointInPolygon(laporanFeature, z));
  return jumpa?.properties.kod ?? null;
}
```

**Kes GeoLapor — kira laporan per zon** (untuk statistik):

```js
function kiraLaporanIkutZon(laporanFC, zonFC) {
  return Object.fromEntries(
    zonFC.features.map((z) => [z.properties.kod, turf.pointsWithinPolygon(laporanFC, z).features.length]),
  );
}
```

### 4.2 Penampan (buffer) — "dalam 1 km dari sungai"

```js
const zonPenampan = turf.buffer(sungai, 1, { units: 'kilometers' }); // Feature<Polygon>
turf.pointsWithinPolygon(laporan, zonPenampan).features.map((f) => f.properties.id);
// ['LPR-0001', 'LPR-0003']
```

Alternatif tanpa poligon — jarak terus ke garisan:

```js
turf.pointToLineDistance(c, sungai, { units: 'meters' }); // 2357 → LPR-0002 di luar 1 km
```

> 💡 **Tip:** Untuk papar zon penampan di peta: `L.geoJSON(zonPenampan, { style: { color: '#0284c7', dashArray: '4', fillOpacity: 0.1 } })`. Pengguna faham analisis bila mereka **nampak** kawasannya.

### 4.3 Titik terdekat

```js
const lokasiSaya = turf.point([101.70, 2.935]);
const terdekat = turf.nearestPoint(lokasiSaya, laporan);
terdekat.properties;
// { id: 'LPR-0001', featureIndex: 0, distanceToPoint: 1.0639... }  ← km
```

> ⚠️ `nearestPoint` **menambah** `featureIndex` dan `distanceToPoint` ke `properties` feature yang dipulangkan. Jangan hantar objek ini terus ke API sebagai laporan — medan tambahan itu akan ikut.

---

## 5. Prestasi: `simplify`

Poligon sempadan sebenar boleh ada puluhan ribu verteks. Pada zum 10, kebanyakan verteks jatuh dalam piksel yang sama — membazir memori, CPU dan lebar jalur.

`turf.simplify` menggunakan algoritma **Ramer–Douglas–Peucker**: buang verteks yang tidak mengubah bentuk lebih daripada `tolerance` (dalam **darjah** untuk data 4326).

```js
// Garisan berbelit 500 verteks (sintetik)
const berbelit = turf.lineString(
  Array.from({ length: 500 }, (_, i) => [101.6 + i * 0.0005, 2.9 + Math.sin(i / 10) * 0.01]),
);
const ringkas = turf.simplify(berbelit, { tolerance: 0.0005, highQuality: false });
berbelit.geometry.coordinates.length; // 500
ringkas.geometry.coordinates.length;  // 72  — asal TIDAK diubah (mutate: false secara default)
```

| `tolerance` (darjah) | ≈ meter di Malaysia | Sesuai zum |
|----------------------|---------------------|-----------|
| 0.00001 | ~1 m | 18+ |
| 0.0001 | ~11 m | 14–16 |
| 0.001 | ~110 m | 10–12 |
| 0.01 | ~1.1 km | 6–8 |

> ⚠️ `simplify` boleh menghasilkan poligon **bertindih sendiri** atau jurang antara poligon jiran (kerana setiap poligon dipermudah berasingan). Untuk **paparan** sahaja — jangan simpan hasil simplify sebagai data rasmi, dan jangan kira `area` daripadanya. Untuk sempadan berkongsi (topologi), permudahkan di server (mapshaper / PostGIS `ST_SimplifyPreserveTopology`).

---

## 6. Pengelompokan (clustering) analitik

Berbeza dengan *Leaflet.markercluster* (paparan — nota 13), kluster Turf ialah **analisis**: ia menambah atribut `cluster` ke setiap titik.

```js
const titik = turf.randomPoint(50, { bbox: [101.6, 2.85, 101.75, 3.0] }); // data rawak sintetik

// K-means: anda tetapkan BILANGAN kluster
const km = turf.clustersKmeans(titik, { numberOfClusters: 4 });
km.features[0].properties; // { cluster: 0..3, centroid: [lng, lat] }

// DBSCAN: anda tetapkan JARAK maksimum & minimum titik → bilangan kluster ditemui sendiri
const db = turf.clustersDbscan(titik, 2, { units: 'kilometers', minPoints: 3 });
db.features[0].properties; // { dbscan: 'core' | 'edge' | 'noise', cluster?: n }
```

| | K-means | DBSCAN |
|---|---|---|
| Input utama | bilangan kluster `k` | jarak `maxDistance` + `minPoints` |
| Titik terpencil | tetap dimasukkan ke kluster | ditanda `noise` |
| Guna GeoLapor | bahagikan laporan kepada 4 pasukan lapangan | kesan "titik panas" aduan (≥3 laporan dalam 2 km) |

---

## 7. Menguji fungsi ruang anda dengan Turf

Turf berguna sebagai **oracle** untuk menguji fungsi anda sendiri (`utils/geo.js`):

```js
// utils/geo.turf.test.js — contoh; jalankan: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as turf from '@turf/turf';
import { jarakKm, bboxDari } from './geo.js';

test('jarakKm sepadan dengan turf.distance (±1 m)', () => {
  const p1 = [101.6958, 2.9264];
  const p2 = [101.7100, 2.9400];
  assert.ok(Math.abs(jarakKm(p1, p2) - turf.distance(p1, p2)) < 0.001);
});

test('bboxDari sepadan dengan turf.bbox', () => {
  const fc = turf.featureCollection([turf.point([101.65, 2.92]), turf.point([101.71, 2.94])]);
  assert.deepEqual(bboxDari(fc.features), turf.bbox(fc));
});
```

> Nota: `turf.distance` menerima `Feature<Point>` **atau** array koordinat `[lng, lat]` terus.

---

## 8. Senarai rujukan pantas

| Soalan | Fungsi | Pulangan |
|--------|--------|----------|
| Berapa jauh A ke B? | `distance(a, b, {units})` | nombor |
| Panjang garisan? | `length(line, {units})` | nombor |
| Luas poligon? | `area(poly)` | m² |
| Kotak sempadan? | `bbox(geojson)` | `[minX, minY, maxX, maxY]` |
| Titik tengah? | `centroid(geojson)` / `center(geojson)` | Feature<Point> |
| Titik dalam poligon? | `booleanPointInPolygon(pt, poly)` | boolean |
| Titik mana dalam poligon? | `pointsWithinPolygon(pts, poly)` | FeatureCollection |
| Kawasan dalam jarak X? | `buffer(geojson, X, {units})` | Feature<Polygon> |
| Titik terdekat? | `nearestPoint(pt, pts)` | Feature<Point> (+`distanceToPoint`) |
| Jarak titik ke garisan? | `pointToLineDistance(pt, line, {units})` | nombor |
| Titik pada jarak X sepanjang garisan? | `along(line, X, {units})` | Feature<Point> |
| Kurangkan verteks? | `simplify(geojson, {tolerance})` | GeoJSON |
| Kelompok? | `clustersKmeans`, `clustersDbscan` | FeatureCollection (+`cluster`) |
| Titik rawak (ujian)? | `randomPoint(n, {bbox})` | FeatureCollection |

---

## ⚠️ Kesilapan lazim

| Simptom | Punca | Pembetulan |
|---------|-------|------------|
| Jarak ribuan km untuk dua titik di Putrajaya | Koordinat `[lat, lng]` diberi | Turf = GeoJSON = `[lng, lat]` |
| `Error: First and last Position are not equivalent` | Cincin poligon tidak ditutup | Ulang titik pertama di hujung |
| Keputusan jarak/keluasan mengarut untuk data RSO | Turf mengandaikan **WGS84 darjah** | Tukar ke 4326 dahulu (`keWgs84`) |
| `buffer` 1 = buffer 1 km sedangkan mahu 1 m | Unit default `kilometers` | Sentiasa tulis `{ units: 'meters' }` secara eksplisit |
| `import distance from '@turf/distance'` → undefined | Gaya Turf 6 | Turf 7: `import { distance } from '@turf/distance'` |
| Browser beku semasa `pointsWithinPolygon` besar | O(titik × verteks) di thread utama | Tapis dahulu dengan `bbox`, gunakan Web Worker, atau pindah ke PostGIS |
| Keluasan poligon berbeza daripada QGIS | Turf guna model sfera; QGIS mungkin elipsoid/projection | Untuk nilai rasmi, kira dalam GIS/server dengan CRS yang betul |

---

## 📖 Bacaan buku

> *JavaScript All-in-One For Dummies* (Minnick, 2023) tidak mempunyai bab tentang topik ini. Guna nota ini dan rujukan rasmi di bawah.


## Rujukan rasmi

- Turf.js (dokumentasi & senarai modul): <https://turfjs.org/>
- `simplify`: <https://turfjs.org/docs/api/simplify> · `booleanPointInPolygon`: <https://turfjs.org/docs/api/booleanPointInPolygon> · `buffer`: <https://turfjs.org/docs/api/buffer>
- RFC 7946 GeoJSON: <https://datatracker.ietf.org/doc/html/rfc7946>

## Digunakan pada Hari N

- **Hari 1** — bandingkan `jarakKm`/`bboxDari` anda dengan konsep Turf (§3).
- **Hari 4 (utama)** — S1/S2: pasang `@turf/turf`, analisis laporan dalam zon & dalam 1 km sungai (§4).
- **Hari 5** — S2: prestasi peta dengan `simplify` (§5), kluster analitik (§6); S3: Turf sebagai oracle ujian `node --test` (§7).
