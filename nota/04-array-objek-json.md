# 04 · Array, Objek & JSON — GeoJSON sebagai Data JavaScript

> Nota topikal (rujukan merentas hari) · Indeks: [`README.md`](./README.md)

## Objektif nota

- **Membaca, menambah, mengubah dan membuang** property objek, serta **mengulang** objek dengan `Object.keys/values/entries`.
- **Memilih dan menggunakan** method array yang betul (`push/pop`, `forEach`, `map`, `filter`, `reduce`, `find`, `some/every`, `sort`, `flatMap`) atas `FeatureCollection`.
- **Membezakan** method yang **mengubah** (mutating) array dengan yang **memulangkan array baharu**, dan **menulis** kemas kini tidak boleh ubah.
- **Menukar** antara objek JS dan teks JSON dengan `JSON.parse`/`JSON.stringify` (termasuk `replacer`, indentasi dan error handling).
- **Menerangkan** struktur GeoJSON (`FeatureCollection` → `Feature` → `geometry` + `properties`) dan susunan `[lng, lat]`.

---

## 1. Kenapa ini teras kursus?

Hampir **semua** data dalam GeoLapor ialah array objek:

- `GET /api/laporan` → `FeatureCollection` dengan array `features`.
- `GET /api/kategori` → array `[{ kod, nama, warna }]`.
- Fail `sempadan-zon.geojson`, hasil `shpjs`, `togeojson` → semua GeoJSON.

Jika anda mahir `map`/`filter`/`reduce` atas `features`, anda sudah menguasai separuh daripada logik aplikasi peta — tapis ikut kategori, kira statistik, cari laporan terdekat, tukar ke format lain.

---

## 2. Objek

```js
const laporan = {
  id: 'LPR-0001',
  tajuk: 'Papan tanda sempadan rosak',
  kategori: 'infrastruktur',
  status: 'baharu',
  'dikemaskini-oleh': 'pegawai1@latihan.test',   // key dengan '-' perlu petikan
};

laporan.tajuk;                   // notasi titik
laporan['dikemaskini-oleh'];     // notasi kurungan (key khas)
const medan = 'status';
laporan[medan];                  // key dinamik → 'baharu'

laporan.catatan = 'Tiang condong';   // tambah (MUTASI)
delete laporan['dikemaskini-oleh'];  // buang (MUTASI)
'catatan' in laporan;                // → true
Object.hasOwn(laporan, 'lampiran');  // → false

Object.keys(laporan);    // → ['id', 'tajuk', 'kategori', 'status', 'catatan']
Object.values(laporan);  // → ['LPR-0001', …]
Object.entries(laporan); // → [['id', 'LPR-0001'], ['tajuk', …], …]

// Ulang pasangan key-nilai
for (const [kunci, nilai] of Object.entries(laporan)) {
  console.log(`${kunci} = ${nilai}`);
}

// Bina objek dari pasangan (cth kategori → warna)
const kategori = [
  { kod: 'infrastruktur', nama: 'Infrastruktur', warna: '#d9480f' },
  { kod: 'tanah', nama: 'Tanah', warna: '#8d6e63' },
];
const warnaIkutKod = Object.fromEntries(kategori.map((k) => [k.kod, k.warna]));
// → { infrastruktur: '#d9480f', tanah: '#8d6e63' }
```

---

## 3. GeoJSON — objek JS biasa dengan peraturan

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "LPR-0001",
      "geometry": { "type": "Point", "coordinates": [101.6958, 2.9264] },
      "properties": { "id": "LPR-0001", "tajuk": "Papan tanda sempadan rosak", "kategori": "infrastruktur", "status": "baharu" }
    }
  ]
}
```

| Tahap | Kandungan | Nota |
|-------|-----------|------|
| `FeatureCollection` | `features: Feature[]` | Apa yang `/api/laporan` pulangkan |
| `Feature` | `geometry` + `properties` (+ `id`) | Satu laporan |
| `geometry` | `type` + `coordinates` | `Point`, `LineString`, `Polygon`, `Multi*` |
| `coordinates` | **`[longitud, latitud]`** | ⚠️ Terbalik daripada Leaflet `[lat, lng]` |
| `properties` | Objek bebas | Medan laporan (lihat `projek/api/README.md`) |

| Geometri | Bentuk `coordinates` | Contoh dalam `projek/data/` |
|----------|----------------------|-----------------------------|
| `Point` | `[lng, lat]` | Laporan, `kemudahan` |
| `LineString` | `[[lng, lat], [lng, lat], …]` | `sungai.geojson` |
| `Polygon` | `[[[lng, lat], …, sama dengan titik pertama]]` (gelang luar + lubang) | `sempadan-zon.geojson` |

> 💡 **Ingatan:** "**X dahulu, Y kemudian**" — longitud ialah paksi-X (timur-barat). Malaysia: lng ≈ 99.5–119.5, lat ≈ 0.8–7.5. Jika "lat" anda 101, ia terbalik. `dalamMalaysia([lng, lat])` dalam `utils/geo.js` menangkap kesilapan ini.

---

## 4. Array — method asas (silibus)

```js
const ids = ['LPR-0001', 'LPR-0002'];

ids.push('LPR-0003');       // tambah di hujung  → MUTASI, pulang panjang baharu (3)
ids.pop();                  // buang di hujung   → MUTASI, pulang 'LPR-0003'
ids.unshift('LPR-0000');    // tambah di depan   → MUTASI
ids.shift();                // buang di depan    → MUTASI
ids.length;                 // → 2
ids.includes('LPR-0002');   // → true
ids.indexOf('LPR-0009');    // → -1 (tiada)
ids.at(-1);                 // → 'LPR-0002' (elemen terakhir)
ids.join(', ');             // → 'LPR-0001, LPR-0002'
ids.slice(0, 1);            // → ['LPR-0001'] — array BAHARU, asal kekal
```

### Mengubah vs memulangkan baharu

| Mengubah array asal (mutating) ⚠️ | Pulang array baharu (selamat untuk state) ✅ |
|-----------------------------------|---------------------------------------------|
| `push`, `pop`, `shift`, `unshift` | `[...arr, x]`, `arr.slice()`, `arr.concat(x)` |
| `splice` | `arr.toSpliced()` (ES2023), `filter` |
| `sort` | `arr.toSorted()` (ES2023) atau `[...arr].sort()` |
| `reverse` | `arr.toReversed()` (ES2023) |
| `arr[i] = x` | `arr.with(i, x)` (ES2023), `map` |

Hari 1–4 mutasi kadangkala tidak mengapa. Hari 5, store **mesti** menerima array baharu supaya pelanggan tahu data berubah — lihat [nota 13](./13-state-dan-arkitektur.md).

---

## 5. Method array fungsian — atas `features`

Data contoh untuk bahagian ini:

```js
const titik = (id, lng, lat, kategori, status, tajuk) => ({
  type: 'Feature', id,
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { id, kategori, status, tajuk },
});
const features = [
  titik('LPR-0001', 101.6958, 2.9264, 'infrastruktur', 'baharu', 'Papan tanda sempadan rosak'),
  titik('LPR-0002', 101.6500, 2.9200, 'tanah', 'selesai', 'Tanah runtuh kecil'),
  titik('LPR-0003', 101.7100, 2.9400, 'infrastruktur', 'dalam-tindakan', 'Lampu jalan padam'),
  titik('LPR-0004', 101.6800, 2.9100, 'utiliti', 'baharu', 'Paip air bocor'),
];
```

### 5.1 `forEach` — lakukan sesuatu (tiada pulangan)

```js
features.forEach((f, i) => console.log(i, f.properties.tajuk));
```

### 5.2 `map` — tukar setiap elemen (panjang sama)

```js
const tajukSahaja = features.map((f) => f.properties.tajuk);
// → ['Papan tanda sempadan rosak', 'Tanah runtuh kecil', …]

const untukLeaflet = features.map(({ geometry: { coordinates: [lng, lat] } }) => [lat, lng]);
// → [[2.9264, 101.6958], …]   // susunan Leaflet
```

### 5.3 `filter` — pilih sebahagian

```js
const infra = features.filter((f) => f.properties.kategori === 'infrastruktur');   // 2 elemen
const belumSelesai = features.filter(({ properties: { status } }) =>
  status !== 'selesai' && status !== 'ditolak');                                   // 3 elemen
```

### 5.4 `find` / `findIndex` / `some` / `every`

```js
features.find((f) => f.id === 'LPR-0003');          // → Feature LPR-0003 (atau undefined)
features.findIndex((f) => f.id === 'LPR-0003');     // → 2 (atau -1)
features.some((f) => f.properties.status === 'baharu');   // → true (sekurang-kurangnya satu)
features.every((f) => f.geometry.type === 'Point');       // → true (semua)
```

### 5.5 `reduce` — kumpul kepada satu nilai

```js
// Kira ikut kategori → { infrastruktur: 2, tanah: 1, utiliti: 1 }
const ikutKategori = features.reduce((acc, f) => {
  const k = f.properties.kategori;
  acc[k] = (acc[k] ?? 0) + 1;
  return acc;                       // ⚠️ WAJIB pulang acc
}, {});                             // ⚠️ nilai awal {}

// Kotak sempadan (bbox) [minLng, minLat, maxLng, maxLat]
const bbox = features.reduce(
  ([minX, minY, maxX, maxY], { geometry: { coordinates: [x, y] } }) =>
    [Math.min(minX, x), Math.min(minY, y), Math.max(maxX, x), Math.max(maxY, y)],
  [Infinity, Infinity, -Infinity, -Infinity],
);
// → [101.65, 2.91, 101.71, 2.94]
```

Kedua-dua corak ini ialah asas `kiraIkut(features, medan)` dan `bboxDari(features)` dalam `utils/geo.js`. (Node 21+/Chrome 117+ juga ada `Object.groupBy(features, f => f.properties.kategori)` yang memulangkan array per kumpulan.)

### 5.6 `sort` / `toSorted`

```js
// ⚠️ sort() MENGUBAH asal dan secara default membanding sebagai STRING
[10, 9, 100].sort();                 // → [10, 100, 9]  !!
[10, 9, 100].toSorted((a, b) => a - b);  // → [9, 10, 100]

// Susun ikut tajuk (BM) — localeCompare
const ikutTajuk = features.toSorted((a, b) =>
  a.properties.tajuk.localeCompare(b.properties.tajuk, 'ms'));

// Susun ikut jarak dari titik rujukan (terdekat dahulu)
import { jarakKm } from './utils/geo.js';
const rujukan = [101.6958, 2.9264];
const terdekat = features
  .map((f) => ({ f, km: jarakKm(rujukan, f.geometry.coordinates) }))
  .toSorted((a, b) => a.km - b.km)
  .slice(0, 3);
```

### 5.7 Chaining

```js
// "Tajuk laporan infrastruktur yang belum selesai, ikut abjad"
const hasil = features
  .filter((f) => f.properties.kategori === 'infrastruktur')
  .filter((f) => f.properties.status !== 'selesai')
  .map((f) => f.properties.tajuk)
  .toSorted((a, b) => a.localeCompare(b, 'ms'));
// → ['Lampu jalan padam', 'Papan tanda sempadan rosak']
```

### 5.8 `flatMap` — koordinat semua geometri

```js
// Semua titik verteks dari LineString sungai (array bersarang → rata)
const sungai = [
  { geometry: { type: 'LineString', coordinates: [[101.68, 2.93], [101.69, 2.92]] } },
  { geometry: { type: 'LineString', coordinates: [[101.70, 2.95], [101.71, 2.94]] } },
];
const semuaVerteks = sungai.flatMap((f) => f.geometry.coordinates);   // 4 titik
```

| Soalan | Method |
|--------|--------|
| Tukar setiap satu? | `map` |
| Pilih sebahagian? | `filter` |
| Cari **satu**? | `find` |
| Ada sekurang-kurangnya satu? / semua? | `some` / `every` |
| Kumpul kepada nombor/objek? | `reduce` |
| Susun? | `toSorted` |
| Kesan sampingan sahaja (log, lukis)? | `forEach` / `for…of` |

---

## 6. Kemas kini tidak boleh ubah (immutable update)

```js
// Tukar status satu laporan — pulang array BAHARU dengan Feature BAHARU
function kemasKiniStatus(features, id, statusBaru) {
  return features.map((f) =>
    f.id !== id
      ? f                                                      // yang lain: rujukan sama
      : { ...f, properties: { ...f.properties, status: statusBaru } });
}

const selepas = kemasKiniStatus(features, 'LPR-0001', 'dalam-tindakan');
features[0].properties.status;   // → 'baharu'           (asal kekal)
selepas[0].properties.status;    // → 'dalam-tindakan'
selepas[1] === features[1];      // → true (yang tidak berubah dikongsi — jimat memori)

// Tambah & buang
const denganBaharu = [...features, titik('LPR-0005', 101.69, 2.93, 'lain-lain', 'baharu', 'Pokok tumbang')];
const tanpa0002 = features.filter((f) => f.id !== 'LPR-0002');
```

Corak `map` + spread inilah yang digunakan oleh *optimistic update* Hari 5.

---

## 7. JSON

**JSON** (JavaScript Object Notation) ialah format **teks** untuk bertukar data — antara browser dan API, dalam fail `.geojson`, dalam `localStorage`.

### 7.1 JSON ≠ objek JS

| Objek JS | JSON |
|----------|------|
| `{ tajuk: 'A' }` | `{"tajuk":"A"}` — key **mesti** petikan berganda |
| `'petikan tunggal'` | Hanya `"petikan berganda"` |
| `undefined`, fungsi, `Symbol` | ❌ tidak wujud (digugurkan atau jadi `null`) |
| `Date` | Jadi string ISO |
| `NaN`, `Infinity` | Jadi `null` |
| Komen, koma hujung | ❌ tidak dibenarkan |

### 7.2 `JSON.stringify` — objek → teks

```js
const badan = { tajuk: 'Longkang tersumbat', kategori: 'utiliti', lat: 2.9264, lng: 101.6958, sementara: undefined };

JSON.stringify(badan);
// → '{"tajuk":"Longkang tersumbat","kategori":"utiliti","lat":2.9264,"lng":101.6958}'  (undefined digugurkan)

JSON.stringify(badan, null, 2);          // cantik, indentasi 2 — untuk log/eksport fail
JSON.stringify(badan, ['tajuk', 'kategori']);  // replacer array: medan terpilih sahaja
JSON.stringify({ masa: new Date('2026-09-01T01:15:00Z') });
// → '{"masa":"2026-09-01T01:15:00.000Z"}'
```

### 7.3 `JSON.parse` — teks → objek

```js
const teks = '{"type":"Feature","geometry":{"type":"Point","coordinates":[101.6958,2.9264]},"properties":{"tajuk":"A"}}';
const f = JSON.parse(teks);
f.geometry.coordinates[0];   // → 101.6958

// JSON rosak akan throw SyntaxError — sentiasa balut untuk input luar
function selamatParse(teks, lalai = null) {
  try {
    return JSON.parse(teks);
  } catch (ralat) {
    console.warn('JSON tidak sah:', ralat.message);
    return lalai;
  }
}
selamatParse("{tajuk: 'A'}");            // → null + amaran
selamatParse(localStorage.getItem('draf'), {});   // null dari getItem → JSON.parse(null) → null
```

> ⚠️ **`Unexpected token '<'`** semasa `res.json()` hampir selalu bermaksud server memulangkan **HTML** (halaman 404/500 atau `index.html` Vite) dan bukan JSON. Semak URL dan tab *Network* — lihat [nota 06](./06-http-rest-fetch.md).

### 7.4 JSON dalam `fetch` (preview Hari 2)

```js
// Hantar: objek → JSON.stringify → request body
// Terima: res.json() → JSON.parse secara automatik
const res = await fetch('http://localhost:3000/api/laporan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-API-Key': 'latihan-pgn-2026' },
  body: JSON.stringify({ tajuk: 'Longkang tersumbat', kategori: 'utiliti', catatan: '', lat: 2.9264, lng: 101.6958 }),
});
const featureBaru = await res.json();    // 201 → Feature dengan id 'LPR-00xx'
```

### 7.5 Salinan dalam (deep copy)

```js
const salin1 = JSON.parse(JSON.stringify(feature));  // gaya lama: hilang Date, undefined, Map
const salin2 = structuredClone(feature);             // ✅ moden: kekalkan Date, Map, Set
```

---

## ⚠️ Kesilapan lazim

| Kesilapan | Gejala | Pembetulan |
|-----------|--------|------------|
| `reduce` tanpa nilai awal | `TypeError: Reduce of empty array with no initial value` bila tapisan kosong | Sentiasa beri nilai awal (`{}`, `0`, `[]`) |
| Lupa `return acc` dalam `reduce` | `undefined` pada pusingan kedua | `return acc;` |
| `map` dengan `{}` tanpa `return` | Array `[undefined, …]` | `map(f => nilai)` atau `return` |
| `sort()` tanpa comparator untuk nombor | `[10, 100, 9]` | `(a, b) => a - b` |
| `sort()` pada array dari store | State berubah senyap; UI tidak dikemas kini | `toSorted()` |
| `features.filter(...)[0]` untuk cari satu | Membazir, tidak jelas | `find` |
| `forEach` + `push` untuk bina array | Panjang, mudah tersalah | `map` / `filter` |
| `[lat, lng]` dalam GeoJSON | Titik terbalik | `[lng, lat]` + `dalamMalaysia` |
| `JSON.parse` tanpa `try…catch` | Aplikasi rosak pada input luar | Balut, pulang nilai default |
| `JSON.stringify` objek dengan `undefined` | Medan hilang dalam PATCH | Guna `null` bila mahu "kosongkan" |

---

## 📖 Bacaan buku

> *JavaScript All-in-One For Dummies* (Minnick, 2023) — pengayaan selepas nota ini. Halaman PDF = muka surat cetak + 24.
>
> - **Objek (asas GeoJSON)** — B1 · Bab 7 (Making and Using Objects), *Objects: The Basics; Creating Objects; Modifying Objects* — ms. 125–131 (**PDF 149–155**)
> - **`map`/`filter`/`reduce` & method array lain** — B1 · Bab 6 (Using Arrays), *Programming with Array Methods; Looping with Array Methods* — ms. 112–121 (**PDF 136–145**)
> - **`JSON.parse` / `JSON.stringify`** — B1 · Bab 11 (Writing Asynchronous JavaScript), *Working with JSON data* — ms. 220–222 (**PDF 244–246**)
> - **JSON hantar & terima** — B1 · Bab 11 (Writing Asynchronous JavaScript), *Working with JSON data* — ms. 220–222 (**PDF 244–246**)


## Rujukan rasmi

- MDN — Working with objects: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects>
- MDN — Array: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array>
- MDN — `Array.prototype.reduce()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce>
- MDN — `Array.prototype.toSorted()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted>
- MDN — `Object.groupBy()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy>
- MDN — Working with JSON: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON>
- MDN — `JSON.stringify()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify>
- RFC 7946 — The GeoJSON Format: <https://datatracker.ietf.org/doc/html/rfc7946>
- geojson.io (lihat & sunting GeoJSON secara visual): <https://geojson.io/>

## Digunakan pada Hari N

| Hari | Sesi | Bahagian nota |
|------|------|---------------|
| 1 | S1 · Variable Management & Scope | §2 (objek laporan), §3 (GeoJSON pertama) |
| 1 | S4 · Modern Array Methods & ES Modules | §4–5 (method array atas `features`), §7.1–7.3 (JSON) → `tapisLaporan`, `kiraIkut`, `bboxDari` |
| 2 | S4 · Fetch API Integration | §7.4 (JSON hantar & terima), §7.3 (`Unexpected token '<'`) |
| 3 | S2 · DOM Element Manipulation | §5.2 (`map` → `[lat, lng]` untuk Leaflet), §5.6 (susun senarai) |
| 4 | S4 · Browser Storage | §7.3 (`selamatParse` untuk `localStorage`) |
| 5 | S1 · State Management | §4 (jadual mutasi), §6 (kemas kini tidak boleh ubah) |
