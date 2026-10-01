# 03 · JavaScript Moden (ES6+) — Template Literal, Destructuring, Spread/Rest, `?.`, `??` & ES Modules

> Nota topikal (rujukan merentas hari) · Indeks: [`README.md`](./README.md)

## Objektif nota

- **Menulis** template literal berbilang baris dengan interpolasi, dan **menerangkan** kenapa ia tidak selamat untuk membina HTML dengan data pengguna.
- **Membuat destructuring** pada `feature.properties` dan `geometry.coordinates` (termasuk nilai default, nama semula dan bersarang).
- **Menggunakan** spread/rest untuk menyalin & menggabung objek/array tanpa mengubah asal.
- **Menggunakan** `?.`, `??` dan `??=` untuk data API yang mungkin tiada medan.
- **Menyusun** kod kepada ES Modules dengan `export`/`import` (named & default) dan **menerangkan** peraturan laluan modul dalam browser.

---

## 1. Kenapa "moden"?

ES2015 (ES6) dan kemas kini tahunan selepasnya mengubah cara JavaScript ditulis. Kod pustaka yang anda akan baca (Leaflet, Turf, dokumentasi MDN) menggunakan sintaks ini. Faedah utama:

| Masalah lama | Penyelesaian moden |
|--------------|---------------------|
| `'Laporan ' + id + ' (' + status + ')'` | `` `Laporan ${id} (${status})` `` |
| `var p = f.properties; var tajuk = p.tajuk; var status = p.status;` | `const { tajuk, status } = f.properties;` |
| `Object.assign({}, lama, { status: 'selesai' })` | `{ ...lama, status: 'selesai' }` |
| `f && f.properties && f.properties.catatan` | `f?.properties?.catatan` |
| `x !== null && x !== undefined ? x : 20` | `x ?? 20` |
| Semua fail berkongsi global `window` | `import { jarakKm } from './utils/geo.js'` |

Browser sasaran kursus (Chrome/Edge terkini) menyokong **ES2024** sepenuhnya — tiada transpiler diperlukan.

---

## 2. Template literal

```js
const laporan = { id: 'LPR-0001', tajuk: 'Papan tanda sempadan rosak', status: 'baharu' };
const [lng, lat] = [101.6958, 2.9264];

// Interpolasi ${…} — sebarang ungkapan
const ringkas = `${laporan.id}: ${laporan.tajuk} [${laporan.status.toUpperCase()}]`;
// → 'LPR-0001: Papan tanda sempadan rosak [BAHARU]'

// Berbilang baris — baris baharu dikekalkan
const mesej = `Laporan diterima.
Lokasi: ${lat.toFixed(4)}, ${lng.toFixed(4)}
Masa: ${new Date('2026-09-01T09:15:00+08:00').toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}`;

// Membina URL — ingat encodeURIComponent untuk nilai pengguna
const q = 'papan & tiang';
const url = `/api/laporan?q=${encodeURIComponent(q)}&had=20`;
// → '/api/laporan?q=papan%20%26%20tiang&had=20'
```

> 💡 Untuk URL dengan banyak query, `URLSearchParams` lebih selamat daripada template literal — ia mengekod setiap nilai secara automatik (lihat [nota 06](./06-http-rest-fetch.md)).

> ⚠️ **Template literal + `innerHTML` + data pengguna = XSS.**
> ```js
> senarai.innerHTML = `<li>${laporan.tajuk}</li>`;   // ❌ tajuk "<img src=x onerror=alert(1)>" akan dilaksana
> const li = document.createElement('li');
> li.textContent = laporan.tajuk;                    // ✅ dipaparkan sebagai teks
> ```
> Lihat [nota 07](./07-dom-event-borang.md) §3.

### Method string berguna

```js
'  Tiang condong  '.trim();                 // → 'Tiang condong'
'LPR-0001'.startsWith('LPR-');              // → true
'Papan Tanda'.toLowerCase().includes('tanda'); // → true (carian tanpa sensitif huruf)
String(7).padStart(4, '0');                 // → '0007'  → `LPR-${…}`
'alam-sekitar'.replaceAll('-', ' ');        // → 'alam sekitar'
'101.6958,2.9264'.split(',').map(Number);   // → [101.6958, 2.9264]
```

---

## 3. Destructuring

### 3.1 Objek

```js
const feature = {
  type: 'Feature',
  id: 'LPR-0001',
  geometry: { type: 'Point', coordinates: [101.6958, 2.9264] },
  properties: {
    id: 'LPR-0001', tajuk: 'Papan tanda sempadan rosak', kategori: 'infrastruktur',
    status: 'baharu', catatan: 'Tiang condong, perlu ganti.', pelapor: 'pegawai1@latihan.test',
  },
};

const { tajuk, status } = feature.properties;         // ambil ikut NAMA
const { kategori: kod } = feature.properties;         // nama semula → kod = 'infrastruktur'
const { lampiran = [] } = feature.properties;         // default jika undefined → []
const { id, ...selebihnya } = feature.properties;     // rest: semua kecuali id
```

### 3.2 Array — ikut KEDUDUKAN

```js
const [lng, lat] = feature.geometry.coordinates;      // GeoJSON: [lng, lat]
const [, latSahaja] = feature.geometry.coordinates;   // langkau elemen pertama
```

> ⚠️ **Susunan koordinat!** GeoJSON = `[lng, lat]`. Leaflet `L.marker([lat, lng])`. Destructuring dengan nama yang jelas (`const [lng, lat] = …`) adalah pertahanan terbaik: kemudian tulis `L.marker([lat, lng])` — nama menjadikan kesilapan kelihatan.

### 3.3 Bersarang & dalam parameter

```js
// Bersarang: terus ke koordinat
const { geometry: { coordinates: [x, y] }, properties: { tajuk: t } } = feature;

// Dalam parameter fungsi — corak paling kerap dalam kursus
function labelPopup({ properties: { tajuk, status }, geometry: { coordinates: [lng, lat] } }) {
  return `${tajuk} (${status}) @ ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
labelPopup(feature);
// → 'Papan tanda sempadan rosak (baharu) @ 2.9264, 101.6958'

// Dalam loop
for (const { properties: { id, status } } of [feature]) {
  console.log(id, status);
}

// Tukar dua nilai (cth membetulkan [lat, lng] yang terbalik)
let a = 2.9264, b = 101.6958;
[a, b] = [b, a];          // a = 101.6958, b = 2.9264
```

> ⚠️ **Destructuring `undefined`** akan throw error: `const { tajuk } = undefined;` → `TypeError: Cannot destructure property 'tajuk' of 'undefined'`. Berlaku bila API memulangkan 404 dan anda terus buat destructuring. Semak dahulu, atau beri default: `const { tajuk } = laporan ?? {};`.

---

## 4. Spread & rest (`...`)

Tiga titik yang sama, dua peranan:

- **Spread** — *kembangkan* (di sebelah kanan / dalam panggilan): salin, gabung.
- **Rest** — *kumpulkan* (di sebelah kiri / dalam parameter): baki.

```js
// Spread array — salin & gabung
const asal = ['infrastruktur', 'tanah'];
const salinan = [...asal];                          // array baharu
const semua = [...asal, 'utiliti', 'lain-lain'];    // gabung
Math.max(...[3, 9, 4]);                             // → 9

// Spread objek — salin & timpa (yang kemudian menang)
const laporanLama = { id: 'LPR-0001', status: 'baharu', catatan: 'Tiang condong' };
const laporanBaru = { ...laporanLama, status: 'dalam-tindakan' };
// laporanLama tidak berubah → penting untuk store Hari 5

// Kemas kini bersarang — spread SETIAP tahap yang berubah
const featureBaru = {
  ...feature,
  properties: { ...feature.properties, status: 'selesai', dikemaskini: '2026-09-02T10:00:00+08:00' },
};
feature.properties.status;       // → 'baharu' (asal kekal)
featureBaru.properties.status;   // → 'selesai'

// Rest — buang medan (cth sebelum hantar PATCH)
const { id: _abaikan, dicipta, ...bolehDikemaskini } = feature.properties;
```

> ⚠️ **Spread ialah salinan cetek (shallow).** `{ ...feature }` menyalin tahap pertama sahaja; `featureSalin.properties` masih **objek yang sama**. Mengubah `featureSalin.properties.status = 'x'` akan mengubah asal juga. Untuk salinan dalam penuh: `structuredClone(feature)`.

---

## 5. Optional chaining `?.` dan nullish coalescing `??`

Data dari API tidak selalu lengkap: `catatan` mungkin tiada, `geometry` mungkin `null` (GeoJSON membenarkannya).

```js
const f1 = { properties: { tajuk: 'A' }, geometry: null };

f1.geometry.coordinates;              // ❌ TypeError: Cannot read properties of null
f1.geometry?.coordinates;             // → undefined (berhenti dengan selamat)
f1.properties?.catatan?.trim();       // → undefined
f1.properties.lampiran?.[0];          // akses indeks
kemaskini?.();                        // panggil jika fungsi wujud

// ?? — default HANYA untuk null/undefined
const catatan = f1.properties.catatan ?? '(tiada catatan)';
const had = 0;
had || 20;   // → 20  ⚠️ 0 dianggap falsy
had ?? 20;   // → 0   ✅

// ??= — tetapkan jika null/undefined
const tetapan = { zum: 0 };
tetapan.zum ??= 12;        // kekal 0
tetapan.pusat ??= [2.9264, 101.6958];   // ditetapkan (ingat: Leaflet [lat, lng])
```

| Operator | Ganti bila nilai kiri ialah | Guna untuk |
|----------|-----------------------------|------------|
| `\|\|` | Mana-mana falsy (`0`, `''`, `false`, `null`, `undefined`, `NaN`) | Jarang — bila `''`/`0` memang "tiada" |
| `??` | `null` atau `undefined` sahaja | **Default untuk data** (had, zum, koordinat, kiraan) |
| `?.` | Hentikan chain jika `null`/`undefined` | Medan pilihan dari API |

> ⚠️ **Jangan tabur `?.` di mana-mana.** Jika `feature.properties` **wajib** (sentiasa ada), `feature.properties?.tajuk` menyembunyikan pepijat: data rosak dipaparkan sebagai kosong dan tiada siapa perasan. Guna `?.` hanya untuk medan yang benar-benar pilihan.

---

## 6. Singkatan objek & computed key

```js
const tajuk = 'Longkang tersumbat', kategori = 'utiliti';
const badan = { tajuk, kategori };             // = { tajuk: tajuk, kategori: kategori }

const medan = 'status';
const tampalan = { [medan]: 'selesai' };       // computed key → { status: 'selesai' }

const api = {
  senarai() { /* … */ },                        // singkatan method
};
```

---

## 7. ES Modules

### 7.1 Kenapa modul?

Sebelum modul, setiap `<script>` berkongsi satu scope global. Dua fail yang mentakrif `function format()` akan bertembung secara senyap. Modul memberi setiap fail scope sendiri dan **kontrak eksplisit**: hanya yang di-`export` boleh digunakan, dan setiap pengguna mesti `import`.

### 7.2 Export & import bernama

```js
// utils/geo.js — satu modul, banyak fungsi tulen
const R_BUMI_KM = 6371;                       // TIDAK di-export → peribadi
const keRad = (d) => (d * Math.PI) / 180;

export function jarakKm([lng1, lat1], [lng2, lat2]) {
  const dLat = keRad(lat2 - lat1), dLng = keRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(keRad(lat1)) * Math.cos(keRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_BUMI_KM * Math.asin(Math.sqrt(a));
}

export function dalamMalaysia([lng, lat]) {
  return lng >= 99.5 && lng <= 119.5 && lat >= 0.8 && lat <= 7.5;
}
```

```js
// main.js
import { jarakKm, dalamMalaysia } from './utils/geo.js';     // nama mesti sepadan
import { jarakKm as jarak } from './utils/geo.js';           // nama semula
import * as geo from './utils/geo.js';                       // namespace: geo.jarakKm(…)

const putrajaya = [101.6958, 2.9264], cyberjaya = [101.6500, 2.9200];
console.log(jarakKm(putrajaya, cyberjaya).toFixed(2), 'km');  // → '5.14 km'
console.log(dalamMalaysia([2.9264, 101.6958]));               // → false (terbalik!)
```

### 7.3 Default export

```js
// ui/peta.js
export default function ciptaPeta(idElemen) { /* … */ }

// main.js
import ciptaPeta from './ui/peta.js';      // tiada { }, nama bebas
```

> 💡 **Konvensyen kursus:** guna **export bernama** untuk semua modul kita (`utils/geo.js`, `services/api.js`, `state/store.js`). Nama bernama boleh dikesan oleh editor, sukar tersalah eja, dan konsisten merentas modul. Default export kita temui dalam pustaka (cth `import JSZip from 'jszip'`).

### 7.4 Peraturan laluan modul

| Konteks | `import … from './utils/geo.js'` | `import L from 'leaflet'` (bare specifier) |
|---------|------------------------------------|--------------------------------------------|
| Browser tanpa build (Hari 1–3) | ✅ **Mesti** ada `./` dan sambungan `.js` | ❌ Gagal — browser tidak tahu `node_modules` (kecuali *import map*) |
| Vite (Hari 4–5) | ✅ | ✅ Vite menyelesaikan dari `node_modules` |
| Node.js (`node --test`) | ✅ | ✅ |

```js
import { jarakKm } from './utils/geo';        // ❌ browser: 404 (tiada .js)
import { jarakKm } from 'utils/geo.js';       // ❌ browser: bare specifier
import { jarakKm } from './utils/geo.js';     // ✅
```

### 7.5 Import dinamik

Muat pustaka berat hanya bila perlu (cth pembaca Shapefile hanya bila pengguna memilih fail `.zip`):

```js
butangImport.addEventListener('change', async (e) => {
  const fail = e.target.files[0];
  if (fail.name.endsWith('.zip')) {
    const { default: shp } = await import('shpjs');   // dimuat kali pertama sahaja
    const geojson = await shp(await fail.arrayBuffer());
    // …
  }
});
```

Vite memecahkan pustaka yang diimport secara dinamik kepada *chunk* berasingan — muatan awal lebih ringan (Hari 5, prestasi).

> ⚠️ **Modul hanya dilaksana sekali** walaupun diimport oleh 5 fail. Ini ciri, bukan pepijat: `state/store.js` yang mencipta satu `store` akan dikongsi oleh semua pengimport — itulah "sumber kebenaran tunggal".

---

## ⚠️ Kesilapan lazim

| Kesilapan | Gejala | Pembetulan |
|-----------|--------|------------|
| `const [lat, lng] = feature.geometry.coordinates` | Marker di Lautan Hindi / Antartika | GeoJSON ialah `[lng, lat]` |
| Destructuring response 404 | `Cannot destructure property … of 'undefined'` | Semak `res.ok` dahulu; `?? {}` |
| Spread cetek untuk objek bersarang | Asal turut berubah | Spread setiap tahap / `structuredClone` |
| `\|\|` untuk default nombor | `zum=0` jadi 12 | `??` |
| `?.` pada medan wajib | Pepijat data tersembunyi | `?.` hanya untuk medan pilihan |
| Import tanpa `.js` dalam browser | 404 dalam tab Network | Tulis `./fail.js` penuh |
| `import` dalam `<script>` biasa | `Cannot use import statement outside a module` | `<script type="module">` |
| Default export diimport dengan `{ }` | `does not provide an export named` | Padankan jenis export |
| Template literal ke `innerHTML` | XSS | `textContent` / `createElement` |

---

## 📖 Bacaan buku

> *JavaScript All-in-One For Dummies* (Minnick, 2023) — pengayaan selepas nota ini. Halaman PDF = muka surat cetak + 24.
>
> - **Template literal, string method** — B1 · Bab 3 (Using Data), *String data type* — ms. 69–73 (**PDF 93–97**)
> - **Destructuring & spread array** — B1 · Bab 6 (Using Arrays), *Destructuring Arrays; Spreading Arrays* — ms. 122–123 (**PDF 146–147**)
> - **Salin objek dengan spread** — B1 · Bab 7 (Making and Using Objects), *Comparing and Copying Objects* — ms. 132–134 (**PDF 156–158**)
> - **ES Modules `import`/`export`** — B1 · Bab 12 (Using JavaScript Modules), *Keseluruhan bab* — ms. 223–229 (**PDF 247–253**)
> - **`import()` dinamik** — B1 · Bab 12 (Using JavaScript Modules), *Loading Dynamic Modules* — ms. 229 (**PDF 253**)


## Rujukan rasmi

- MDN — Template literals: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals>
- MDN — Destructuring: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring>
- MDN — Spread syntax: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax>
- MDN — Optional chaining: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining>
- MDN — Nullish coalescing: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing>
- MDN — JavaScript modules: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules>
- MDN — `import()` dinamik: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import>
- MDN — `structuredClone()`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone>
- RFC 7946 — GeoJSON (susunan `[lng, lat]`, §3.1.1): <https://datatracker.ietf.org/doc/html/rfc7946>

## Digunakan pada Hari N

| Hari | Sesi | Bahagian nota |
|------|------|---------------|
| 1 | S2 · Modern Strings & Functions | §2 (template literal, method string) |
| 1 | S3 · Destructuring & Operators | §3 (destructuring `properties` & `coordinates`), §4 (spread/rest), §5 (`?.`, `??`) |
| 1 | S4 · Modern Array Methods & ES Modules | §7.1–7.4 → modul `utils/geo.js` |
| 2 | S4 · Fetch API Integration | §2 (URL), §6 (singkatan objek untuk badan JSON) |
| 4 | S2 · Module Bundlers & Build Tools | §7.4 (bare specifier via Vite), §7.5 (import dinamik) |
| 5 | S1 · State Management | §4 (spread untuk kemas kini tidak boleh ubah), §7.5 (modul sekali laksana = store dikongsi) |
