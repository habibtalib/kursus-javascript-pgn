# Lab Hari 5 — State, Seni Bina, Ujian & Demo

[← README Hari 5](./README.md) · [Jadual](../JADUAL.md) · [Rubrik Projek Akhir](../docs/rubrik-projek-akhir.md)

> **Folder kerja:** projek GeoLapor Vite anda dari Hari 4 (salinan `projek/geolapor-mula/` yang telah anda isi). Jika projek anda rosak teruk, salin semula `projek/geolapor-mula/` dan ambil `services/api.js` + `utils/geo.js` anda sendiri.
> **Dua terminal sepanjang hari:** (1) `cd projek/api && npm start` → mock API `http://localhost:3000`; (2) `npm run dev` dalam folder GeoLapor anda.
> **Git (pilihan):** commit selepas setiap ✅ checkpoint — `git commit -am "Lab 5.1: store"`.

> 🪟 **Pengguna Windows:** jalankan arahan terminal dalam **Git Bash** (terminal lalai VS Code — lihat [persediaan §2.5](../docs/persediaan.md#25-terminal-vs-code-di-windows--git-bash)). Arahan PowerShell disediakan untuk langkah utama.

| Lab | Sesi | Tempoh | Hasil |
|-----|------|--------|-------|
| 5.1 | S1 | ≈ 50 min (langkah 1–10 teras; 11–13 selepas mini-kuliah) | `store.js` + ujian · `pemilih.js` · `tindakan.js` · UI melanggan store · URL state · optimistic update |
| 5.2 | S2 | ≈ 30 min (langkah 1–4 teras; 5–7 jika masa) | Struktur folder + peraturan ESLint arah dependency · clustering · simplify · bbox + debounce |
| 5.3 | S3 | ≈ 18 min | Latih-tubi debugging · `node --test` · global error handler · persediaan demo |
| Demo | S3 | ≈ 45 min | Demo GeoLapor ikut rubrik |

---

## Lab 5.1 — Store berpusat, selector, URL & optimistic update (S1)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - State vs props, reactivity: B3 · Bab 3 (Building React Components) — ms. 300–304 (**PDF 324–328**)
> - Store pub/sub (`subscribe`, `set`, `update`): B5 · Bab 6 (Advanced Svelte Reactivity) — ms. 483–490 (**PDF 507–514**)
> - Keadaan terbitan: B4 · Bab 4 (Using Data and Reactivity) — ms. 405–408 (**PDF 429–432**)

### 🎯 Objektif
- Membina `ciptaStore` dan membuktikannya dengan 5 ujian `node --test`.
- Memindahkan data laporan, penapis dan pilihan ke **satu** store.
- Menukar senarai, peta, penapis dan statistik supaya **melanggan** store (tiada UI memanggil UI lain).
- Menyegerakkan penapis dengan URL; melaksanakan tukar status optimistik dengan rollback.

### Prasyarat
- GeoLapor Vite Hari 4 berjalan: peta Leaflet + senarai + borang memaparkan data dari mock API.
- `src/services/api.js` mengeksport `senaraiLaporan` dan `kemaskiniLaporan` (Hari 2), menghantar `X-API-Key: latihan-pgn-2026` untuk PATCH.
- `src/utils/geo.js` mengeksport `tapisLaporan` dan `kiraIkut` (Hari 1).
- `package.json` mengandungi `"type": "module"` (template Vite sudah ada).

### Langkah

**1. Store.** Cipta `src/state/store.js` — taip sendiri daripada [README §1.3](./README.md#13-store-pubsub--30-baris-tanpa-pustaka) (jangan salin-tampal; baca setiap komen).

**2. Ujian store dahulu.** Cipta folder `tests/` di akar projek (sebelah `src/`) dan fail `tests/store.test.js` dengan 5 ujian dari [README §3.3](./README.md#33-ujian-pantas-dengan-node---test). Tambah skrip:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "node --test \"tests/**/*.test.js\""
  }
}
```

```bash
npm test
```

Jangkaan: `ℹ pass 5` · `ℹ fail 0`. Sekarang **rosakkan** store dengan sengaja (buang baris `if (!berubah) return;`) → jalankan semula → ujian "tanpa perubahan" merah. Pulihkan. Anda baru membuktikan ujian itu benar-benar menguji sesuatu.

**3. Keadaan awal + store dalam `main.js`.**

```js
// src/main.js (bahagian atas)
import * as api from './services/api.js';
import { ciptaStore } from './state/store.js';

const store = ciptaStore({
  laporan: [],
  kategori: [],
  penapis: { kategori: '', status: '', q: '' },
  dipilihId: null,
  lapisanAktif: ['sempadan-zon'],
  memuat: false,
  ralat: null,
  notis: null,
});

if (import.meta.env.DEV) window.__geolapor = { store };
```

Buka DevTools → Console: `__geolapor.store.dapat()` → objek keadaan anda.

**4. Selector.** Cipta `src/state/pemilih.js` ([README §1.5](./README.md#15-keadaan-terbitan--selector)) dengan `memoAkhir`, `pilihLaporanDitapis`, `pilihLaporanDipilih`, `pilihRingkasan`.

**5. Tindakan.** Cipta `src/state/tindakan.js` dengan `ciptaTindakan(store, api)` → `muatLaporan`, `pilih`, `tukarPenapis` ([README §1.6](./README.md#16-aliran-data-satu-hala-tindakan--store--pelanggan)). Dalam `main.js`:

```js
import { ciptaTindakan } from './state/tindakan.js';

const tindakan = ciptaTindakan(store, api);
const deps = { store, tindakan };
if (import.meta.env.DEV) window.__geolapor = { store, tindakan };

tindakan.muatLaporan();
```

Console: `__geolapor.store.dapat().laporan.length` → ≈ 40.

**6. Logger store (dev sahaja).** Tambah dalam `main.js` — anda akan menggunakannya sepanjang hari:

```js
if (import.meta.env.DEV) {
  store.langgan((baru, lama) => {
    const berubah = Object.keys(baru).filter((k) => baru[k] !== lama[k]);
    console.groupCollapsed(`store: ${berubah.join(', ')}`);
    for (const k of berubah) console.log(k, lama[k], '→', baru[k]);
    console.groupEnd();
  });
}
```

**7. Senarai melanggan store.** Tulis semula modul senarai anda sebagai `pasangSenarai(ul, { store, tindakan })` ([README §1.7](./README.md#17-menyegerakkan-peta--senarai--penapis)). **Buang** semua kod lama yang memanggil `renderSenarai(...)` dari handler borang/peta.

```js
// main.js
import { pasangSenarai } from './ui/senarai.js';
pasangSenarai(document.getElementById('senarai'), deps);
```

**8. Peta melanggan store.** Dalam `src/ui/peta.js`, tambah `pasangLapisanLaporan(peta, { store, tindakan })`. Klik marker → `tindakan.pilih(id)` → senarai menyerlah `li.dipilih` **dan** peta terbang ke titik itu. Klik `<li>` → sama.

> ⚠️ Semak baris `peta.flyTo([lat, lng], 16)` — koordinat GeoJSON ialah `[lng, lat]`. Buat destructuring dahulu: `const [lng, lat] = f.geometry.coordinates;`

**9. Penapis.** Pastikan borang penapis anda (`<form id="penapis">`) mempunyai kawalan dengan `name="kategori"`, `name="status"`, `name="q"`, kemudian pasang `pasangPenapis` ([README §1.7](./README.md#17-menyegerakkan-peta--senarai--penapis)).

```html
<form id="penapis">
  <select name="kategori">
    <option value="">Semua kategori</option>
    <option value="infrastruktur">Infrastruktur</option>
    <option value="alam-sekitar">Alam sekitar</option>
    <option value="tanah">Tanah</option>
    <option value="utiliti">Utiliti</option>
    <option value="lain-lain">Lain-lain</option>
  </select>
  <select name="status">
    <option value="">Semua status</option>
    <option value="baharu">Baharu</option>
    <option value="dalam-tindakan">Dalam tindakan</option>
    <option value="selesai">Selesai</option>
    <option value="ditolak">Ditolak</option>
  </select>
  <input name="q" type="search" placeholder="Cari tajuk…" />
</form>
```

**10. Statistik dari selector.** Tulis `src/ui/statistik.js`:

```js
import { pilihRingkasan } from '../state/pemilih.js';

export function pasangStatistik(kotak, { store }) {
  const lukis = (s) => {
    const { jumlah, dipapar, ikutStatus } = pilihRingkasan(s);
    const baris = [
      `${dipapar} daripada ${jumlah} laporan dipapar`,
      ...Object.entries(ikutStatus).map(([status, n]) => `${status}: ${n}`),
    ];
    kotak.replaceChildren(
      ...baris.map((teks) => {
        const p = document.createElement('p');
        p.textContent = teks;
        return p;
      }),
    );
  };
  lukis(store.dapat());
  return store.langgan(lukis);
}
```

> 💡 Statistik di sini dikira **di klien** daripada laporan yang ditapis — ia berubah serta-merta dengan penapis. `GET /api/statistik` (Hari 2) memberi angka keseluruhan dari server; kedua-duanya berguna untuk tujuan berbeza.

**11. URL state.** Cipta `src/state/url.js` ([README §1.8](./README.md#18-keadaan-dalam-url-urlsearchparams)); dalam `main.js` panggil `segerakUrl(store)` **selepas** memasang penapis.

Uji: pilih kategori "tanah" → bar alamat menjadi `?kategori=tanah` → salin URL → buka dalam tab baharu → penapis, senarai dan peta sama.

**12. Optimistic update.** Tambah `tukarStatus(id, statusBaru)` ke `tindakan.js` ([README §1.9](./README.md#19-optimistic-update-dengan-rollback)). Kemudian tambah `<select>` status pada setiap `<li>` dalam `pasangSenarai`:

```js
// dalam senarai.map((f) => { … }) — selepas li.textContent
const pilihStatus = document.createElement('select');
pilihStatus.dataset.tindakan = 'status';
for (const s of ['baharu', 'dalam-tindakan', 'selesai', 'ditolak']) {
  pilihStatus.add(new Option(s, s, false, s === f.properties.status));
}
li.append(' ', pilihStatus);
```

```js
// listener delegasi tambahan dalam pasangSenarai
ul.addEventListener('change', (e) => {
  if (e.target.dataset.tindakan !== 'status') return;
  const id = e.target.closest('li[data-id]').dataset.id;
  tindakan.tukarStatus(id, e.target.value);
});
```

Pasang `pasangNotis` ([README §2.3](./README.md#23-komponen-sebagai-fungsi)) pada `<div id="notis" hidden></div>`.

**13. Paksa kegagalan — tiga cara.** Tukar status, dan untuk setiap cara pastikan status **berubah serta-merta lalu kembali** dan notis error muncul:

| Cara | Langkah | Jangkaan di Network |
|------|---------|---------------------|
| A. Sekat request | DevTools → Network → klik kanan request `PATCH` terdahulu → **Block request URL** | `(blocked:devtools)` |
| B. Server mati | `Ctrl+C` pada terminal mock API → cuba → hidupkan semula `npm start` | `(failed) net::ERR_CONNECTION_REFUSED` |
| C. Key salah | Ubah sementara nilai `X-API-Key` dalam `api.js` → cuba → pulihkan | `401` · `{ "ralat": "Kunci API tidak sah" }` |

> 💡 **Rasai beza optimistik.** DevTools → Network → *Throttling* → **Slow 4G**, kemudian tukar status: `<select>` berubah serta-merta walaupun `PATCH` mengambil beberapa saat. Mock API juga menerima `?gagal=1` (paksa 500) dan `?lambat=2000` — cuba dengan `curl` (lihat [nota 06](../nota/06-http-rest-fetch.md)) untuk melihat bentuk error response yang perlu dikendalikan oleh `mintaJson`.

### ✅ Checkpoint 5.1
- [ ] `npm test` → 5 ujian store lulus.
- [ ] Tukar kategori → senarai, marker peta **dan** statistik berubah; logger store menunjukkan **hanya** `penapis` berubah.
- [ ] Klik marker ↔ senarai menyerlah dan peta terbang ke lokasi yang betul (Putrajaya/Cyberjaya, bukan Kutub Utara).
- [ ] URL `?kategori=…&q=…` boleh dibuka dalam tab baharu dengan keadaan sama.
- [ ] Tukar status berjaya → kekal; gagal (A/B/C) → kembali + notis.
- [ ] `grep -rn "renderSenarai\|lukisMarker" src/ui/borang.js` — tiada panggilan terus antara modul UI (sesuaikan nama dengan kod lama anda).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Ubah `store.dapat().memuat = true` → UI tidak berubah | Menulis terus ke objek keadaan memintas `set()` — tiada pelanggan dimaklumkan | Sentiasa `store.set({ memuat: true })` (⭐ `Object.freeze` dalam mod dev menangkap ini — README §1.3) |
| Senarai tidak berubah selepas tambah laporan | `push` pada array dalam store (mutasi) | `store.set((s) => ({ laporan: [...s.laporan, baru] }))` |
| `Cannot read properties of undefined (reading 'filter')` dalam selector | `laporan` menjadi `undefined` — `muatLaporan` terlupa `await` atau `fc.features` salah eja | Semak logger store: nilai `laporan` selepas muat |
| Peta melukis semula setiap kali taip dalam borang laporan | Pelanggan peta tidak membandingkan `baru`/`lama` | Langkau jika `pilihLaporanDitapis(baru) === pilihLaporanDitapis(lama)` |
| Senarai dilukis dua kali setiap perubahan | `pasangSenarai` dipanggil dua kali (cth HMR Vite) | Simpan & panggil cleanup: `if (import.meta.hot) import.meta.hot.dispose(cleanup)` — atau muat semula halaman |
| URL tidak berubah | `segerakUrl` dipanggil sebelum `store` wujud / penapis dikemas kini dengan mutasi | `tukarPenapis` mesti cipta objek `penapis` baharu |
| `node --test` → `SyntaxError: Cannot use import statement` | `package.json` tiada `"type": "module"` | Tambah, atau namakan fail `.mjs` |
| `node --test tests/` gagal "Could not find" | Folder sebagai argumen | `npm test` atau corak glob berpetik `node --test "tests/**/*.test.js"` |

### ⭐ Cabaran
1. **`pushState` untuk tukar kategori/status** (bukan `q`) supaya butang Back memulihkan penapis sebelumnya. Uji bahawa `popstate` menyegerakkan borang penapis.
2. **Kedudukan peta dalam URL hash** — `#16/2.9264/101.6958` (zum/lat/lng) dikemas kini pada `moveend`; dibaca semasa mula.
3. **Buat asal (*undo*)** — simpan 10 keadaan `laporan` terakhir dalam array; `Ctrl+Z` → `store.set({ laporan: sejarah.pop() })`. Kenapa ini mudah **hanya** kerana kita immutable?
4. **Padam optimistik** — `padamLaporan` dengan rollback yang memulihkan rekod pada **indeks asal**.

---

## Lab 5.2 — Susun layer & prestasi peta (S2)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Komponen & komposisi: B3 · Bab 3 (Building React Components) — ms. 298–300, 321–325 (**PDF 322–324, 345–349**)
> - React, Vue, Svelte — perbandingan: B3 · Bab 1; B4 · Bab 1; B5 · Bab 1 — ms. 264–271, 343–344, 423–425 (**PDF 288–295, 367–368, 447–449**)
> - Node.js secara ringkas: B7 · Bab 1 (Node.js Fundamentals) — ms. 560–562, 566–567 (**PDF 584–586, 590–591**)

### 🎯 Objektif
- Menyusun `src/` kepada `ui/ · state/ · services/ · io/ · utils/` mengikut [README §2.2](./README.md#22-struktur-folder-geolapor-akhir).
- **Menguatkuasakan** arah dependency dengan ESLint (bukan hanya dengan niat baik).
- Menambah clustering, simplify dan pemuatan ikut `bbox` + debounce.

### Prasyarat
- ✅ Checkpoint 5.1.
- ESLint 9 dikonfigurasi (Hari 4) dengan `eslint.config.js`.
- Pakej: `npm install leaflet.markercluster @turf/turf` (Turf mungkin sudah dipasang Hari 4).

### Langkah

**1. Pindah fail.** Susun semula mengikut struktur README §2.2. Gunakan VS Code (seret fail dalam Explorer) — ia menawarkan untuk **mengemas kini import** secara automatik. Kemudian:

```bash
npm run dev     # tiada error import dalam terminal/console
npm test        # masih hijau
```

**2. Semak arah dependency secara manual.**

```bash
grep -rn "from '\.\./ui" src/state src/services src/io src/utils
grep -rn "from 'leaflet'" src/state src/services src/io src/utils
grep -rn "document\.\|window\." src/state/store.js src/state/pemilih.js src/state/tindakan.js src/utils
```

**Windows (PowerShell):**

```powershell
$lapisan = 'src/state', 'src/services', 'src/io', 'src/utils'
Get-ChildItem $lapisan -Recurse -File | Select-String -Pattern "from '\.\./ui"
Get-ChildItem $lapisan -Recurse -File | Select-String -Pattern "from 'leaflet'"
Get-ChildItem src/state/store.js, src/state/pemilih.js, src/state/tindakan.js, src/utils -Recurse -File |
  Select-String -Pattern 'document\.|window\.'
```

Ketiga-tiga mesti **kosong** (kecuali `state/url.js`, yang sengaja menyentuh `location`/`history` — ia adalah *adapter* browser; ⭐ pindahkannya ke `ui/` jika anda mahu ketat).

**3. Kuatkuasakan dengan ESLint.** Tambah blok ini **selepas** konfigurasi sedia ada dalam `eslint.config.js`:

```js
  {
    // Layer bawah tidak boleh bergantung pada UI (arah dependency S2)
    files: ['src/state/**/*.js', 'src/services/**/*.js', 'src/io/**/*.js', 'src/utils/**/*.js'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/ui/**', 'leaflet', 'leaflet.*'],
          message: 'Lapisan state/services/io/utils tidak boleh import ui/ atau Leaflet.',
        }],
      }],
    },
  },
  {
    // Fail ujian berjalan dalam Node, bukan browser
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
```

Uji peraturan: tambah sementara `import { pasangNotis } from '../ui/notis.js';` di atas `src/state/tindakan.js` → `npm run lint`:

```text
src/state/tindakan.js
  1:1  error  '../ui/notis.js' import is restricted from being used by a pattern.
              Lapisan state/services/io/utils tidak boleh import ui/ atau Leaflet.  no-restricted-imports
```

Buang baris itu. `npm run lint` → 0 error.

**4. Clustering.** Dalam `src/ui/peta.js`, gantikan penambahan layer laporan terus ke peta dengan `L.markerClusterGroup()` ([README §2.5a](./README.md#25-prestasi-aplikasi-peta)). Import CSS kedua-dua fail. Zum keluar ke paras 10 → titik bergabung menjadi bulatan bernombor; zum ≥ 17 → marker individu.

> ⚠️ `import L from 'leaflet'` **mesti** mendahului `import 'leaflet.markercluster'` — pemalam itu menampal objek global `L` yang dicipta oleh Leaflet.

**5. Simplify layer sempadan.** Semasa memuat `sempadan-zon` (dari `dapatkanLapisan('sempadan-zon')`), ringkaskan untuk paparan dan log perbezaan:

```js
import { simplify, coordAll } from '@turf/turf';

const asal = await api.dapatkanLapisan('sempadan-zon');
const ringkas = simplify(asal, { tolerance: 0.0005, highQuality: false }); // mutate: false (default) — asal kekal
console.log(`Bucu: ${coordAll(asal).length} → ${coordAll(ringkas).length}`);
L.geoJSON(ringkas, { style: { color: '#555', weight: 1, fillOpacity: 0.05 } }).addTo(peta);
```

> 💡 Data sampel kita kecil (5 zon ringkas), jadi pengurangan mungkin sedikit. Cuba `tolerance: 0.005` dan lihat bentuk zon menjadi kasar — itulah sebabnya simplify **hanya untuk paparan**.

**6. Muat ikut `bbox` + debounce.** Cipta `src/utils/masa.js` (`debounce`) dan tambah handler `moveend` ([README §2.5c](./README.md#25-prestasi-aplikasi-peta)). Dalam Network, pan peta dengan laju:
- Jangkaan: hanya **satu** request `GET /api/laporan?bbox=…` selepas anda berhenti 300 ms.
- Jika anda berhenti seketika lalu pan lagi, request lama menunjukkan `(canceled)`.

> ⚠️ Dengan bbox, laporan di luar paparan **tiada** dalam store. Putuskan: adakah senarai & statistik menunjukkan "dalam paparan" atau "semua"? Tulis keputusan anda sebagai komen dalam `peta.js`. (Untuk 40 laporan, "semua" lebih mudah — bbox di sini ialah latihan untuk data besar.)

**7. Ujian debounce (pilihan tetapi disyorkan).** `tests/masa.test.js` — menggunakan pemasa palsu `node:test`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debounce } from '../src/utils/masa.js';

test('debounce: hanya panggilan terakhir dijalankan', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const dipanggil = [];
  const d = debounce((x) => dipanggil.push(x), 300);
  d(1); d(2); d(3);
  t.mock.timers.tick(299);
  assert.deepEqual(dipanggil, []);
  t.mock.timers.tick(1);
  assert.deepEqual(dipanggil, [3]);
});
```

### ✅ Checkpoint 5.2
- [ ] Struktur `src/` sepadan README §2.2; `npm run dev` & `npm test` berjalan.
- [ ] `npm run lint` 0 error; peraturan `no-restricted-imports` terbukti menangkap import salah.
- [ ] Marker berkelompok pada zum rendah.
- [ ] Log "Bucu: X → Y" dipaparkan; sempadan masih dilukis dengan betul.
- [ ] Pan laju → satu request bbox (atau request lama `(canceled)`).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `L.markerClusterGroup is not a function` | Susunan import terbalik / markercluster tidak dipasang | Import `leaflet` dahulu; `npm ls leaflet.markercluster` |
| Kelompok tiada gaya (nombor tanpa bulatan) | CSS markercluster tidak diimport | Import `MarkerCluster.css` **dan** `MarkerCluster.Default.css` |
| `npx eslint` memaparkan versi 10 / error konfigurasi | ESLint tidak dipasang dalam projek, `npx` memuat turun versi terkini | `npm i -D eslint@9 @eslint/js@9 globals` kemudian `npm run lint` |
| `globals is not defined` dalam `eslint.config.js` | Terlupa import | `import globals from 'globals';` |
| `?bbox=` memulangkan 0 laporan | Susunan bbox salah (`lat` dahulu) | `minLng,minLat,maxLng,maxLat` — `getWest(), getSouth(), getEast(), getNorth()` |
| Console penuh `AbortError` | Error abort dilog sebagai error sebenar | Abaikan `ralat.name === 'AbortError'` (atau `ralat.cause?.name`) |

### ⭐ Cabaran
1. **WMS dari GeoServer.** Jika jurulatih menyediakan GeoServer di rangkaian bilik (Docker `docker.osgeo.org/geoserver`), tambah `L.tileLayer.wms` dengan layer yang diberi dan masukkan ke `L.control.layers` ([README §2.8a](./README.md#28-menyesuaikan-pemetaan-js-ke-dalam-sistem-pgn-sedia-ada)). Buka Network — perhatikan setiap tile ialah request `GetMap` dengan `BBOX=`.
2. **WFS sebagai GeoJSON.** Bina URL `GetFeature` dengan `URLSearchParams` dan papar hasilnya dengan `L.geoJSON`. Adakah koordinat `[lng, lat]`?
3. **Pindahkan `muatDalamPaparan` ke tindakan** — `tindakan.muatDalamBbox(bbox, signal)` supaya `ui/peta.js` tidak mengimport `services/`. Kemas kini peraturan ESLint untuk melarang `ui/` mengimport `services/`.
4. **Ukur.** DevTools → Performance → rakam zum keluar/masuk sebelum & selepas clustering dengan 2,000 titik palsu (jana dengan loop di console). Bandingkan tempoh *Scripting* dan *Rendering*.

---

## Lab 5.3 — Debugging, ujian & persediaan demo (S3)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Debugging (breakpoint, watch): B6 · Bab 3 (Testing Your JavaScript) — ms. 542–547 (**PDF 566–571**)
> - Ujian unit: B6 · Bab 3 (Testing Your JavaScript) — ms. 547–553 (**PDF 571–577**)
> - Objek `Error`, `try…catch`, handler: B7 · Bab 7 (Error Handling and Debugging) — ms. 653–660 (**PDF 677–684**)

### 🎯 Objektif
- Mengesan 4 pepijat tanaman menggunakan DevTools (bukan meneka).
- Menulis ujian untuk `utils/geo.js` dan (⭐) `state/tindakan.js` dengan API palsu.
- Memasang global error handler.
- Menyediakan demo mengikut rubrik.

### Prasyarat
- ✅ Checkpoint 5.1 (5.2 digalakkan).

### Langkah

**1. Latih-tubi debugging (10 min).** Pasangan A memasukkan **satu** pepijat di bawah ke kod pasangan B (tanpa memberitahu yang mana), kemudian bertukar. Pencari mesti menyebut **panel DevTools** yang digunakan untuk menemuinya.

| # | Pepijat tanaman (ganti baris asal) | Gejala |
|---|-----------------------------------|--------|
| P1 | `peta.flyTo(f.geometry.coordinates, 16);` dalam `ui/peta.js` | Klik laporan → peta terbang ke Artik |
| P2 | `const fc = api.senaraiLaporan();` (tanpa `await`) dalam `muatLaporan` | Senarai kosong; error `reading 'filter'` |
| P3 | `const s = store.dapat(); s.laporan.push(baru); store.set({ laporan: s.laporan });` dalam tindakan cipta laporan | Laporan baharu tidak muncul sehingga penapis ditukar |
| P4 | `` mintaJson(`/api/laporan?q=${q}`) `` dengan `q = 'Jalan 2 & 3'` | Carian memulangkan keputusan pelik |

<details><summary>Petunjuk (buka selepas mencuba)</summary>

- **P1** — *Sources*: breakpoint dalam pelanggan `dipilihId` → *Scope* menunjukkan `[101.69, 2.92]` dihantar sebagai `[lat, lng]` → lat 101 (> 90) dikepit ke kutub. Baiki: `const [lng, lat] = …; peta.flyTo([lat, lng], 16)`.
- **P2** — *Console*: klik pautan error → lihat `fc` ialah `Promise {<pending>}`. Logger store menunjukkan `laporan: undefined`. Baiki: `await`.
- **P3** — *Console*: logger store **tidak** mencetak `laporan` (rujukan sama). Baiki: `[...s.laporan, baru]`.
- **P4** — *Network*: request sebenar ialah `?q=Jalan%202%20&%203` → server melihat `q=Jalan 2 ` dan parameter kosong ` 3`. Baiki: `URLSearchParams`.
</details>

**2. Ujian `utils/geo.js`.** Cipta `tests/geo.test.js` ([README §3.3](./README.md#33-ujian-pantas-dengan-node---test)). `npm test` → 13 ujian lulus (8 geo + 5 store). Tambah **satu ujian anda sendiri** untuk `formatKoordinat` — jangkaan `"2.92640, 101.69580"` bagi `[101.6958, 2.9264]`.

**3. ⭐ Ujian tindakan dengan API palsu.** Cipta `tests/tindakan.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ciptaStore } from '../src/state/store.js';
import { ciptaTindakan } from '../src/state/tindakan.js';

const laporan = (id, status) => ({
  type: 'Feature', id,
  geometry: { type: 'Point', coordinates: [101.69, 2.92] },
  properties: { id, status, kategori: 'tanah', tajuk: `Laporan ${id}` },
});
const keadaanAwal = () => ({
  laporan: [laporan('LPR-0001', 'baharu'), laporan('LPR-0002', 'baharu')],
  penapis: { kategori: '', status: '', q: '' }, dipilihId: null,
  memuat: false, ralat: null, notis: null,
});

test('tukarStatus gagal: UI optimistik dahulu, kemudian rollback + notis', async () => {
  const store = ciptaStore(keadaanAwal());
  const dilihat = [];
  store.langgan((s) => dilihat.push(s.laporan[0].properties.status));
  const api = { kemaskiniLaporan: async () => { throw new Error('Pelayan tidak dapat dihubungi'); } };

  await ciptaTindakan(store, api).tukarStatus('LPR-0001', 'selesai');

  assert.deepEqual(dilihat, ['selesai', 'baharu']);                  // optimistik → rollback
  assert.equal(store.dapat().laporan[1].properties.status, 'baharu'); // rekod lain tidak disentuh
  assert.match(store.dapat().notis.mesej, /LPR-0001/);
});

test('muatLaporan: set memuat, kemudian laporan', async () => {
  const store = ciptaStore(keadaanAwal());
  const jejak = [];
  store.langgan((s) => jejak.push(s.memuat));
  const api = { senaraiLaporan: async () => ({ type: 'FeatureCollection', features: [laporan('LPR-0009', 'baharu')] }) };
  await ciptaTindakan(store, api).muatLaporan();
  assert.deepEqual(jejak, [true, false]);
  assert.equal(store.dapat().laporan.length, 1);
});
```

Perhatikan: **tiada** mock API, tiada browser, tiada rangkaian — hasil suntikan `api` (README §1.6).

**4. Global error handler.** Tambah listener `error` dan `unhandledrejection` dalam `main.js` ([README §3.2](./README.md#32-trycatch-error-tersuai--handler-global)). Uji dari console:

```js
setTimeout(() => { throw new Error('ujian global'); });
Promise.reject(new Error('ujian promise'));
```

Kedua-duanya mesti memaparkan notis BM (bukan hanya merah di console).

**5. Senarai semak pra-demo (5 min).**

- [ ] Mock API dihidupkan semula dengan data bersih: `cd projek/api && npm run reset-data && npm start`
- [ ] `npm run dev` berjalan; tiada error merah di console semasa muat
- [ ] `npm test` hijau · `npm run lint` 0 error
- [ ] Fail untuk import disediakan (cth `projek/data/kemudahan.kml`, `sempadan-zon-rso.zip`)
- [ ] URL berpenapis untuk pembukaan demo disalin (cth `http://localhost:5173/?kategori=tanah`)
- [ ] Setiap ahli boleh menerangkan: `store.set`, satu selector, `tukarStatus`, satu fungsi `utils/geo.js`
- [ ] Semak kendiri terhadap gate rubrik: tiada `innerHTML` dengan data, `[lng, lat]` betul, data sintetik sahaja

```bash
# Semakan pantas gate keselamatan
grep -rn "innerHTML" src/     # setiap hasil mesti TIDAK menggunakan data API/pengguna
```

**Windows (PowerShell):**

```powershell
Get-ChildItem src -Recurse -File | Select-String -Pattern 'innerHTML'
```

### ✅ Checkpoint 5.3
- [ ] Sekurang-kurangnya 2 pepijat tanaman ditemui dengan panel DevTools yang dinamakan.
- [ ] `npm test` → ≥ 13 ujian lulus (⭐ ≥ 15 dengan ujian tindakan).
- [ ] Error global dipaparkan sebagai notis.
- [ ] Senarai semak pra-demo ditanda.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `ReferenceError: document is not defined` semasa `npm test` | Fail ujian mengimport modul yang menyentuh DOM/Leaflet | Uji hanya `utils/` & `state/`; pindahkan logik keluar dari `ui/` |
| `ReferenceError: localStorage is not defined` | `state/` menggunakan browser storage terus | Suntik storage sebagai parameter, atau uji bahagian tulen sahaja |
| Ujian async lulus walaupun sepatutnya gagal | Terlupa `await` pada fungsi yang diuji / `test` tidak `async` | `test('…', async () => { await … })` |
| `assert.equal` gagal untuk objek sama | `equal` membandingkan rujukan | `assert.deepEqual` untuk kandungan |
| Handler `error` global tidak menangkap error dalam `async` | Error dalam Promise pergi ke `unhandledrejection` | Daftar kedua-dua listener |

### ⭐ Cabaran
1. **Ujian URL:** `penapisDariUrl(queryDariPenapis(p))` sama dengan `p` untuk `q` mengandungi `&`, `#`, ruang dan huruf Jawi.
2. **Liputan:** `node --test --experimental-test-coverage` — fungsi mana dalam `utils/geo.js` belum diuji?
3. **Ujian `utils/unjuran.js`:** tukar titik RSO (EPSG:3375) yang diketahui ke WGS84 dan semak dalam toleransi 1e-6° (`keWgs84`).

---

## Demo GeoLapor (S3)

Ikut [`docs/rubrik-projek-akhir.md`](../docs/rubrik-projek-akhir.md) dan skrip demo dalam [README §3.6](./README.md#36-demo-geolapor). Masa: **7 minit** per kumpulan (6 minit demo + 1 minit soalan panel; +1 minit pertukaran). Panel akan memilih satu baris kod secara rawak dan meminta anda menerangkannya.

Selepas demo: isi lajur **Selepas** dalam [`docs/borang-penilaian-kendiri.md`](../docs/borang-penilaian-kendiri.md) dan borang penilaian kursus rasmi penganjur.
