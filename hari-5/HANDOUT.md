# Nota Pelajar — Hari 5: State Management & Modern Frontend Architecture

Nota rujukan penuh untuk Hari 5. Baca bersama slaid dan lab hari ini.

**Kandungan:**

- Nota 13 — State Management & Arkitektur Frontend Moden
- Nota 14 — Debugging, Error Handling, Ujian & Amalan Terbaik

**Nota sokongan:** Nota 08 (Edaran Hari 3) — Web Mapping dengan Leaflet, OGC & GeoServer; Nota 10 (Edaran Hari 4) — Analisis Ruang di Browser dengan Turf.js 7; Nota 06 (Edaran Hari 2) — HTTP, REST & Fetch API — Bekerja dengan API Secara Profesional.

---

## 13 · State Management & Arkitektur Frontend Moden

> Nota topikal · Indeks: `./README.md`

### Objektif nota

Selepas membaca nota ini, anda boleh:

- **Menerangkan** kenapa aplikasi peta memerlukan *satu sumber kebenaran* dan **membina** store pub/sub (`ciptaStore`) dengan kemas kini *immutable*.
- **Menulis** *selector* (keadaan terbitan) dengan memo ringkas, **menyegerakkan** peta + senarai + penapis melalui pelanggan store, dan **menyimpan** penapis dalam URL.
- **Melaksanakan** *optimistic update* dengan *rollback* sasaran apabila API gagal, dan **mengujinya** dengan API palsu.
- **Menyusun** aplikasi kepada layer `ui → state → services/io → utils` dengan arah dependency yang betul.
- **Memilih** teknik prestasi peta (clustering, simplify, muat ikut `bbox`, debounce) dan **membandingkan** store kita dengan Redux Toolkit, Zustand, Pinia, Signals serta React/Vue/Svelte.

---

### 1. Kenapa state management?

Pada Hari 3, GeoLapor dibina dengan event handler yang **terus** mengubah DOM:

```js
// ❌ Hari 3 — setiap handler tahu tentang semua UI lain
butangSimpan.addEventListener('click', async () => {
  const baharu = await ciptaLaporan(data);
  senaraiUl.append(binaLi(baharu));     // kemas kini senarai
  lapisanLaporan.addData(baharu);       // kemas kini peta
  kiraanEl.textContent = ++jumlah;      // kemas kini kiraan
  // statistik? penapis aktif? laporan dipilih? ... terlupa satu → UI bercanggah
});
```

Dengan 3 komponen, ada 3 hubungan. Dengan 6 komponen (peta, senarai, borang, penapis, statistik, notis), setiap handler perlu tahu tentang 5 yang lain — dan satu yang terlupa menyebabkan **peta menunjukkan 12 laporan tetapi senarai 11**.

Penyelesaian: **satu store** memegang keadaan; UI hanya (a) **membaca** keadaan untuk melukis dan (b) **meminta** perubahan melalui tindakan. Tiada komponen UI perlu tahu komponen lain wujud.

```mermaid
flowchart LR
    U[Klik / taip] --> T[state/tindakan.js]
    T -->|await| A[services/api.js]
    T -->|store.set| S[(state/store.js)]
    S -->|langgan| P[ui/peta.js]
    S -->|langgan| L[ui/senarai.js]
    S -->|langgan| ST[ui/statistik.js]
    S -->|langgan| N[ui/notis.js]
    S -->|langgan| URL[state/url.js]
```

Ini **aliran data satu hala** (*unidirectional data flow*) — idea yang sama di sebalik Redux, Vuex/Pinia, Elm dan Flux.

#### Jenis keadaan

| Jenis | Contoh GeoLapor | Tempat |
|-------|-----------------|--------|
| Salinan data server | `laporan`, `kategori` | store (di-sync dengan API) |
| Keadaan UI global | `dipilihId`, `memuat`, `ralat`, `notis` | store |
| Keadaan navigasi | `penapis` | store **+ URL** |
| Keadaan setempat | teks sedang ditaip, `<details>` terbuka | elemen DOM itu sendiri |
| Keadaan terbitan | laporan ditapis, kiraan ikut kategori | **tidak disimpan** — dikira oleh selector |

---

### 2. Store pub/sub — `state/store.js`

Ini kod **sebenar** `state/store.js` yang diajar pada Hari 5:

```js
// state/store.js — Store berpusat ringkas (corak pub/sub). Diajar pada Hari 5 (S1).
//
// Aliran data satu hala:
//   tindakan pengguna → store.set(...) → semua pelanggan (langgan) dipanggil → UI dilukis semula

/**
 * @template {object} T
 * @param {T} keadaanAwal
 * @returns {{ dapat: () => T, set: (kemaskiniAtauFungsi: Partial<T> | ((keadaan: T) => Partial<T>)) => void,
 *            langgan: (fn: (baharu: T, lama: T) => void) => () => void }}
 */
export function ciptaStore(keadaanAwal) {
  let keadaan = { ...keadaanAwal };
  const pelanggan = new Set();

  return {
    /** Keadaan semasa. Jangan ubah terus — guna set(). */
    dapat() {
      return keadaan;
    },

    /** Kemas kini keadaan (objek separa ATAU fungsi yang memulangkan objek separa). */
    set(kemaskiniAtauFungsi) {
      const tampalan =
        typeof kemaskiniAtauFungsi === 'function' ? kemaskiniAtauFungsi(keadaan) : kemaskiniAtauFungsi;
      if (!tampalan || typeof tampalan !== 'object') return;

      // Tiada perubahan sebenar (semua nilai sama rujukan) → jangan maklumkan pelanggan
      const berubah = Object.keys(tampalan).some((k) => !Object.is(keadaan[k], tampalan[k]));
      if (!berubah) return;

      const lama = keadaan;
      keadaan = { ...keadaan, ...tampalan }; // objek BAHARU — keadaan lama tidak diubah (immutable)
      for (const fn of [...pelanggan]) fn(keadaan, lama);
    },

    /** Daftar pelanggan. Memulangkan fungsi untuk berhenti melanggan. */
    langgan(fn) {
      pelanggan.add(fn);
      return () => pelanggan.delete(fn);
    },
  };
}
```

| Keputusan | Kenapa |
|-----------|--------|
| Closure (`let keadaan` di dalam fungsi) | Tiada siapa boleh menukar `keadaan` kecuali melalui `set()` — enkapsulasi tanpa kelas (nota 02). |
| `set(objek)` **atau** `set(fungsi)` | Objek untuk kes mudah (`{ memuat: true }`); fungsi apabila nilai baharu bergantung pada nilai **terkini** (`s => ({ laporan: [...s.laporan, baharu] })`). |
| Gabung cetek `{ ...keadaan, ...tampalan }` | Hanya hantar medan yang berubah. Medan lain dikekalkan **dengan rujukan yang sama**. |
| Semak `Object.is` sebelum memaklumkan | `store.set({ n: 0 })` apabila `n` sudah 0 tidak mencetuskan lukisan semula — menjimatkan kerja & mengelak infinite loop (pelanggan yang memanggil `set` semula). |
| Pelanggan terima `(baharu, lama)` | Pelanggan boleh semak `baharu.penapis !== lama.penapis` dan **langkau kerja** — murah kerana kita immutable. |
| `for (const fn of [...pelanggan])` | Lelaran atas **salinan** Set: jika pelanggan nyahlanggan (atau melanggan) semasa dimaklumkan, lelaran tidak terganggu. |
| `langgan` pulangkan `nyahlanggan` | Komponen yang dibuang mesti berhenti mendengar — jika tidak, ia terus melukis ke elemen yang sudah tiada (kebocoran memori). |

```js
// Cuba dalam console / node --input-type=module
const store = ciptaStore({ kiraan: 0 });
const nyahlanggan = store.langgan((baharu, lama) => console.log(lama.kiraan, '→', baharu.kiraan));
store.set({ kiraan: 1 });                       // 0 → 1
store.set((k) => ({ kiraan: k.kiraan + 1 }));   // 1 → 2
store.set({ kiraan: 2 });                       // (senyap — tiada perubahan)
nyahlanggan();
store.set({ kiraan: 99 });                      // (senyap — sudah nyahlanggan)
```

> 💡 **Idea mod dev (pilihan):** `Object.freeze(keadaan)` selepas setiap `set` menjadikan mutasi terus (`store.dapat().memuat = true`) melontar `TypeError` dalam modul — pepijat ditangkap awal. Ia **cetek** (objek bersarang tidak dibekukan) dan ada kos kecil, jadi implementasi di atas tidak menggunakannya; boleh dibungkus dengan `if (import.meta.env.DEV)`.

---

### 3. Kemas kini *immutable*

Store mengesan perubahan dengan **perbandingan rujukan** (`Object.is`). Mutasi mengekalkan rujukan → store fikir tiada perubahan:

```js
// ❌ Mutasi — array SAMA; Object.is(lama, baharu) === true → set() diabaikan, UI tidak dilukis semula
const s = store.dapat();
s.laporan.push(laporanBaharu);
store.set({ laporan: s.laporan });

// ✅ Immutable — array BAHARU
store.set((s) => ({ laporan: [...s.laporan, laporanBaharu] }));
```

| Operasi | ❌ Mutasi | ✅ Immutable |
|---------|----------|-------------|
| Tambah | `arr.push(x)` | `[...arr, x]` |
| Buang | `arr.splice(i, 1)` | `arr.filter((f) => f.id !== id)` · `arr.toSpliced(i, 1)` (ES2023) |
| Ganti satu | `arr[i] = x` | `arr.map((f) => (f.id === id ? x : f))` · `arr.with(i, x)` (ES2023) |
| Susun | `arr.sort(fn)` | `arr.toSorted(fn)` (ES2023) |
| Terbalik | `arr.reverse()` | `arr.toReversed()` (ES2023) |
| Medan bersarang | `f.properties.status = 's'` | `{ ...f, properties: { ...f.properties, status: 's' } }` |
| Salinan dalam | — | `structuredClone(obj)` — mahal, guna jarang (cth sebelum eksport) |

```js
const asal = [3, 1, 2];
const tersusun = asal.toSorted((a, b) => a - b); // [1, 2, 3]
asal;                                             // [3, 1, 2] — tidak berubah
asal.with(0, 9);                                  // [9, 1, 2]
asal.toSpliced(1, 1);                             // [3, 2]
```

> ⚠️ **Spread adalah cetek.** `{ ...f }` menyalin `f` tetapi `f.properties` masih objek yang **sama**. Setiap aras yang anda ubah mesti disalin.

---

### 4. Keadaan terbitan & *selector* — `state/pemilih.js`

**Jangan simpan apa yang boleh dikira.** Jika store menyimpan `laporan` **dan** `laporanDitapis`, dua medan itu boleh bercanggah. Sebaliknya, tulis **selector** — fungsi tulen `(keadaan) => nilai`:

```js
// src/state/pemilih.js
import { tapisLaporan, kiraIkut } from '../utils/geo.js';

/** Ingat hasil terakhir; kira semula hanya jika argumen (rujukan) berubah. */
export function memoAkhir(fn) {
  let argLama = null;
  let hasilLama;
  return (...arg) => {
    const sama = argLama !== null && arg.length === argLama.length && arg.every((a, i) => a === argLama[i]);
    if (!sama) {
      argLama = arg;
      hasilLama = fn(...arg);
    }
    return hasilLama;
  };
}

const tapisMemo = memoAkhir(tapisLaporan);

export const pilihLaporanDitapis = (s) => tapisMemo(s.laporan, s.penapis);

export const pilihLaporanDipilih = (s) => s.laporan.find((f) => f.id === s.dipilihId) ?? null;

export const pilihRingkasan = (s) => {
  const ditapis = pilihLaporanDitapis(s);
  return {
    jumlah: s.laporan.length,
    dipapar: ditapis.length,
    ikutKategori: kiraIkut(ditapis, 'kategori'),
    ikutStatus: kiraIkut(ditapis, 'status'),
  };
};
```

- `tapisLaporan`/`kiraIkut` ialah fungsi **Hari 1** — digunakan semula tanpa perubahan.
- `memoAkhir` sah **kerana** kita immutable: rujukan `laporan` & `penapis` yang sama ⇒ hasil yang sama. Menukar `dipilihId` tidak memaksa penapisan semula (diuji: `pilihLaporanDitapis` memulangkan rujukan yang **sama**).
- Rujukan yang stabil juga membolehkan komponen UI melangkau lukisan: `if (senarai !== senaraiLama) …`.

---

### 5. Tindakan — `state/tindakan.js`

**Tindakan** ialah satu-satunya tempat yang memanggil API **dan** mengubah store. `api` **disuntik** (bukan di-`import`) supaya boleh diganti dengan objek palsu dalam ujian.

```js
// src/state/tindakan.js
const gantiLaporan = (senarai, id, fn) => senarai.map((f) => (f.id === id ? fn(f) : f));

/**
 * @param {ReturnType<import('./store.js').ciptaStore>} store
 * @param {typeof import('../services/api.js')} api  disuntik → boleh diuji dengan API palsu
 */
export function ciptaTindakan(store, api) {
  return {
    async muatLaporan() {
      store.set({ memuat: true, ralat: null });
      try {
        const fc = await api.senaraiLaporan();
        store.set({ laporan: fc.features, memuat: false });
      } catch (ralat) {
        store.set({ memuat: false, ralat: ralat.message });
      }
    },

    pilih(id) {
      store.set({ dipilihId: id });
    },

    tukarPenapis(tampalan) {
      store.set((s) => ({ penapis: { ...s.penapis, ...tampalan } }));
    },

    /** Optimistic update: ubah UI dahulu, sahkan dengan server, undur SATU rekod jika gagal. */
    async tukarStatus(id, statusBaru) {
      const asal = store.dapat().laporan.find((f) => f.id === id);
      if (!asal) return;

      // 1. Optimistik — pengguna nampak perubahan serta-merta
      store.set((s) => ({
        laporan: gantiLaporan(s.laporan, id, (f) => ({ ...f, properties: { ...f.properties, status: statusBaru } })),
      }));

      try {
        // 2. Sahkan — server ialah sumber kebenaran muktamad (mengisi `dikemaskini`)
        const dariPelayan = await api.kemaskiniLaporan(id, { status: statusBaru });
        store.set((s) => ({ laporan: gantiLaporan(s.laporan, id, () => dariPelayan) }));
      } catch (ralat) {
        // 3. Rollback sasaran + beritahu pengguna
        store.set((s) => ({
          laporan: gantiLaporan(s.laporan, id, () => asal),
          notis: { jenis: 'ralat', mesej: `Status ${id} tidak disimpan: ${ralat.message}` },
        }));
      }
    },
  };
}
```

#### Kenapa rollback **sasaran**?

Versi paling ringkas menyimpan **seluruh** senarai sebelum perubahan (`const sebelum = store.dapat().laporan`) dan memulihkannya jika gagal. Itu betul untuk satu klik — tetapi jika pengguna menukar **dua** status dengan pantas dan yang pertama gagal selepas yang kedua berjaya, `sebelum` akan **memadam** kejayaan kedua. Ujian di bawah membuktikannya: rollback sasaran lulus, rollback seluruh senarai gagal.

| Sesuai optimistik | Tidak sesuai |
|-------------------|--------------|
| Tukar status, kegemaran, susun semula | **Cipta** (ID `LPR-{0000}` dijana server) — guna pesimistik atau ID sementara |
| Kadar kejayaan tinggi, mudah diundur | Tidak boleh diundur / ada kesan sampingan (e-mel, kewangan) |

Uji dengan mock API: `?gagal=1` (500) atau buang header `X-API-Key` (401) — kedua-duanya mesti menyebabkan rollback + notis.

---

### 6. Menyegerakkan peta + senarai + penapis

Setiap modul UI ikut satu kontrak: **`pasangX(elemen, { store, tindakan })` → pulangkan cleanup**. Ia membaca melalui selector, menulis melalui tindakan.

```js
// src/ui/senarai.js — render dari store, tanpa innerHTML
import { pilihLaporanDitapis } from '../state/pemilih.js';

export function pasangSenarai(ul, { store, tindakan }) {
  ul.addEventListener('click', (e) => {                 // delegasi event (Hari 3)
    const li = e.target.closest('li[data-id]');
    if (li) tindakan.pilih(li.dataset.id);
  });

  let senaraiLama = null;
  function lukis(s) {
    const senarai = pilihLaporanDitapis(s);
    if (senarai !== senaraiLama) {                      // langkau jika hasil selector sama (memo)
      senaraiLama = senarai;
      ul.replaceChildren(
        ...senarai.map((f) => {
          const li = document.createElement('li');
          li.dataset.id = f.id;
          li.textContent = `${f.id} · ${f.properties.tajuk}`; // textContent — selamat XSS
          return li;
        }),
      );
    }
    for (const li of ul.children) li.classList.toggle('dipilih', li.dataset.id === s.dipilihId);
  }

  lukis(store.dapat());
  return store.langgan(lukis);                          // cleanup = nyahlanggan
}
```

```js
// src/ui/peta.js (petikan) — layer laporan
import L from 'leaflet';
import { pilihLaporanDitapis, pilihLaporanDipilih } from '../state/pemilih.js';

export function pasangLapisanLaporan(peta, { store, tindakan }) {
  const lapisan = L.geoJSON(null, {
    onEachFeature: (f, layer) => layer.on('click', () => tindakan.pilih(f.id)),
  }).addTo(peta);

  const lukis = (baharu, lama) => {
    const ditapis = pilihLaporanDitapis(baharu);
    if (!lama || ditapis !== pilihLaporanDitapis(lama)) lapisan.clearLayers().addData(ditapis);
    if (!lama || baharu.dipilihId !== lama.dipilihId) {
      const f = pilihLaporanDipilih(baharu);
      if (f) {
        const [lng, lat] = f.geometry.coordinates;      // ⚠️ GeoJSON: lng dahulu
        peta.flyTo([lat, lng], 16);                     // ⚠️ Leaflet: lat dahulu
      }
    }
  };
  lukis(store.dapat(), null);
  return store.langgan(lukis);
}
```

Tukar dropdown kategori → `tindakan.tukarPenapis({ kategori })` → `store.set` → senarai, peta, statistik, URL **semuanya** dikemas kini. Penapis tidak tahu peta wujud.

> 💡 Corak yang sama boleh dilanjutkan meluas: `pasangX(el, { store, tindakan })`, `state/tindakan.js` dengan rollback sasaran, dan `state/url.js` — bandingkan dengan kod anda, atau tanya jurulatih jika tersekat.

---

### 7. Keadaan dalam URL — `state/url.js`

Penapis dalam URL = pautan boleh dikongsi, boleh ditanda buku, dan butang **Back** berfungsi.

```js
// src/state/url.js
const MEDAN_PENAPIS = ['kategori', 'status', 'q'];

export function penapisDariUrl(search) {
  const p = new URLSearchParams(search);
  return Object.fromEntries(MEDAN_PENAPIS.map((k) => [k, p.get(k) ?? '']));
}

export function queryDariPenapis(penapis) {
  const p = new URLSearchParams();
  for (const k of MEDAN_PENAPIS) if (penapis[k]) p.set(k, penapis[k]); // abaikan nilai kosong
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

/** Browser sahaja: tulis penapis ke URL setiap kali ia berubah, baca semula bila Back/Forward. */
export function segerakUrl(store) {
  store.set({ penapis: penapisDariUrl(location.search) });       // URL menang semasa mula
  const nyahlanggan = store.langgan((baharu, lama) => {
    if (baharu.penapis === lama.penapis) return;
    const url = `${location.pathname}${queryDariPenapis(baharu.penapis)}${location.hash}`;
    history.replaceState(null, '', url);                         // tiada reload, tiada entri sejarah baharu
  });
  const bilaPopstate = () => store.set({ penapis: penapisDariUrl(location.search) });
  window.addEventListener('popstate', bilaPopstate);
  return () => {
    nyahlanggan();
    window.removeEventListener('popstate', bilaPopstate);
  };
}
```

```js
queryDariPenapis({ kategori: '', status: 'baharu', q: 'Jalan 2 & 3' }); // '?status=baharu&q=Jalan+2+%26+3'
penapisDariUrl('?status=baharu&q=Jalan+2+%26+3');                       // { kategori: '', status: 'baharu', q: 'Jalan 2 & 3' }
```

- `penapisDariUrl`/`queryDariPenapis` ialah fungsi **tulen** → diuji dengan `node --test`. `segerakUrl` menyentuh `location`/`history` → diuji dalam browser.
- `replaceState` untuk carian ditaip (elak 12 entri sejarah untuk "l-a-m-p-u"); `pushState` jika mahu Back kembali ke penapis sebelumnya.
- ⚠️ `` `?q=${q}` `` rosak apabila `q` mengandungi `&`/`#` — sentiasa guna `URLSearchParams`.
- Hubungan dengan `localStorage` (nota 12): URL untuk **berkongsi**, localStorage untuk **mengingat** pilihan peribadi. Jika kedua-duanya ada, URL menang.

---

### 8. Arkitektur berlapis

```mermaid
flowchart TB
    MAIN["main.js — composition root"]
    UI["ui/ — peta · senarai · borang · penapis · statistik · notis"]
    STATE["state/ — store · pemilih · tindakan · url"]
    SVC["services/ & io/ — api · cache · format · raster · lidar"]
    UTIL["utils/ — geo · projection (fungsi tulen)"]
    MAIN --> UI & STATE & SVC
    UI --> STATE
    UI --> UTIL
    STATE --> UTIL
    STATE -. "api disuntik" .-> SVC
    SVC --> UTIL
```

| Layer | Tanggungjawab | Boleh import | **Tidak boleh** | Uji dengan |
|---------|---------------|--------------|-----------------|-----------|
| `utils/` | Logik tulen: kira, tapis, unjur | pustaka tulen (Turf, proj4) | DOM, `L`, `fetch`, layer lain | `node --test` (mudah) |
| `services/`, `io/` | Dunia luar: HTTP, storage, fail | `utils/` | `state/`, `ui/` | `node --test` + fetch/IndexedDB palsu |
| `state/` | Keadaan, selector, tindakan | `utils/`; `services/` **melalui suntikan** | `ui/`, DOM, `L` | `node --test` + API palsu |
| `ui/` | DOM, Leaflet, event | `state/`, `utils/`, Leaflet | `services/` terus | browser |
| `main.js` | Sambung semua; tiada logik | semua | — | manual / E2E |

Kenapa arah ini penting:

1. **Tukar UI tanpa sentuh logik** — beralih Leaflet → OpenLayers hanya mengubah `ui/peta.js`.
2. **Tukar backend tanpa sentuh UI** — mock API → API sebenar → GeoServer WFS hanya mengubah `services/`.
3. **Uji tanpa browser** — semakin banyak logik di bawah, semakin banyak ujian milisaat.

> 💡 Semak pelanggaran: `grep -rn "from '../ui" src/state src/services src/utils` mesti kosong. Modul yang diuji dengan `node --test` dan gagal kerana `document is not defined` ialah **isyarat seni bina** — logik itu berada di layer yang salah.

#### Struktur folder (sasaran akhir Hari 5)

```text
projek/geolapor-mula/
├── index.html · package.json · vite.config.js · eslint.config.js
├── tests/                  *.test.js  → "test": "node --test \"tests/**/*.test.js\""
└── src/
    ├── main.js             composition root
    ├── services/           api.js (ApiError, mintaJson, senaraiLaporan, …) · cache.js
    ├── state/              store.js (+ pemilih.js · tindakan.js · url.js — Lab Hari 5)
    ├── io/                 format.js · raster.js · lidar.js
    ├── utils/              geo.js · unjuran.js
    └── ui/                 peta.js · senarai.js · borang.js · penapis.js · statistik.js · notis.js
                            (+ lapisan.js · fail.js · analisis.js)
```

#### Komponen sebagai fungsi

Framework memberi "komponen"; dalam vanilla JS, **fungsi pemasang** memadai:

```js
/**
 * Kontrak:  pasangX(elemenAkar, { store, tindakan }) → cleanup()
 *  - terima elemen (jangan querySelector global) → boleh dipasang dua kali, mudah diuji
 *  - baca melalui selector, tulis melalui tindakan
 *  - pulangkan cleanup (nyahlanggan + buang listener global)
 */
export function pasangKiraan(el, { store }) {
  const lukis = (s) => { el.textContent = `${pilihLaporanDitapis(s).length} laporan`; };
  lukis(store.dapat());
  return store.langgan(lukis);
}
```

---

### 9. Prestasi aplikasi peta

| Gejala | Teknik | Alat |
|--------|--------|------|
| Ribuan marker bertindih, peta tersekat | **Clustering** | `leaflet.markercluster` · MapLibre `cluster: true` · `supercluster` |
| Poligon sempadan berat | **Simplify** | `turf.simplify` (nota 10) · `ogr2ogr -simplify` · mapshaper |
| Muat semua rekod negara pada permulaan | **Muat ikut `bbox`** | `?bbox=minLng,minLat,maxLng,maxLat` |
| Request bertubi-tubi semasa pan/taip | **Debounce** + `AbortController` | `nyahlantun()` dalam `ui/penapis.js` |

**a) Clustering**

```bash
npm install leaflet.markercluster
```

```js
import L from 'leaflet';                          // Leaflet 1.9 UMD juga menetapkan window.L — plugin memerlukannya
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const kluster = L.markerClusterGroup({ disableClusteringAtZoom: 17, chunkedLoading: true });
kluster.addLayer(L.geoJSON(fc));                  // tambah layer GeoJSON ke kumpulan kluster
peta.addLayer(kluster);
// Kemas kini: kluster.clearLayers(); kluster.addLayer(L.geoJSON(fcBaharu));
```

**b) Simplify untuk paparan**

```js
import { simplify } from '@turf/simplify';
const zonRingkas = simplify(zonFc, { tolerance: 0.0005, highQuality: false }); // ~50 m; asal tidak diubah
L.geoJSON(zonRingkas).addTo(peta);   // PAPARAN sahaja — kira keluasan/analisis dengan data asal
```

**c) Muat ikut `bbox` + debounce + batal request lama**

```js
import { nyahlantun } from './ui/penapis.js';
import { senaraiLaporan } from './services/api.js';

let pengawal = null;
const muatDalamPandangan = nyahlantun(async () => {
  pengawal?.abort();                              // batal request sebelumnya yang belum selesai
  pengawal = new AbortController();
  const b = peta.getBounds();
  const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]; // susunan API: minLng,minLat,maxLng,maxLat
  try {
    const fc = await senaraiLaporan({ bbox, had: 500 }, { signal: pengawal.signal }); // bbox array → "a,b,c,d"
    store.set({ laporan: fc.features });
  } catch (err) {
    if (err.name !== 'AbortError') store.set({ ralat: err.message }); // AbortError = sengaja, abaikan
  }
}, 300);

peta.on('moveend', muatDalamPandangan);           // 'moveend' sekali selepas pan/zum, bukan 'move' (60×/s)
```

```js
// ui/penapis.js — debounce: tangguh panggilan sehingga pengguna berhenti `ms` milisaat
export function nyahlantun(fn, ms = 300) {
  let pemasa;
  return (...args) => {
    clearTimeout(pemasa);
    pemasa = setTimeout(() => fn(...args), ms);
  };
}
```

> ⚠️ `senaraiLaporan` patut melontar semula `AbortError` **asal** apabila pemanggil membatalkan (bukan `ApiError`), jadi semakan `err.name === 'AbortError'` berfungsi. Timeout dan network error pula menjadi `ApiError` dengan `status: 0`.

**d) Ukur dahulu.** DevTools → **Performance** (rakam pan/zum) dan `console.time('tapis')`. Jangan optimumkan 40 titik.

---

### 10. Pustaka state popular — idea yang sama

Cari tiga perkara dalam mana-mana pustaka: **di mana keadaan disimpan, bagaimana ia dikemas kini, bagaimana UI dimaklumkan.**

| Pustaka | Ekosistem | Kemas kini | UI dimaklumkan melalui | Tambahan |
|---------|-----------|-----------|------------------------|----------|
| **Store kita** | Vanilla | `set(tampalan \| fn)` | `langgan(fn)` | — |
| **Redux Toolkit** | Kebanyakannya React | `dispatch(action)` → *reducer* tulen (Immer benarkan sintaks "mutasi") | `useSelector` | DevTools *time-travel*, RTK Query |
| **Zustand** | React / vanilla | `setState(partial \| fn)` — hampir sama dengan kita | hook / `subscribe` | Sangat kecil, middleware `persist` |
| **Pinia** | Vue | ubah `state` terus dalam *actions* (reaktiviti Vue mengesan) | automatik | *getters* ≈ selector |
| **Signals** (Preact Signals, SolidJS, Angular; cadangan TC39) | Pelbagai | `isyarat.value = x` | dependency tracking automatik | `computed()` ≈ selector + memo automatik |

```js
// Zustand (vanilla) — diuji
import { createStore } from 'zustand/vanilla';
const store = createStore(() => ({ penapis: { kategori: '' } }));
store.subscribe((baharu, lama) => console.log(lama.penapis.kategori, '→', baharu.penapis.kategori));
store.setState((s) => ({ penapis: { ...s.penapis, kategori: 'tanah' } }));  //  → tanah

// Redux Toolkit — slice
import { createSlice } from '@reduxjs/toolkit';
const laporanSlice = createSlice({
  name: 'laporan',
  initialState: { senarai: [], penapis: { kategori: '' } },
  reducers: {
    tukarPenapis(state, action) { state.penapis.kategori = action.payload; }, // Immer → immutable di sebalik tabir
  },
});

// Signals (@preact/signals-core) — diuji
import { signal, computed, effect } from '@preact/signals-core';
const penapis = signal({ kategori: '', status: '', q: '' });
const laporan = signal([]);
const ditapis = computed(() => tapisLaporan(laporan.value, penapis.value)); // memo automatik
effect(() => console.log('dipapar', ditapis.value.length));                 // "langgan" automatik
penapis.value = { ...penapis.value, kategori: 'tanah' };
```

> 💡 **Untuk projek PGN:** satu halaman peta dengan 3–6 panel → store vanilla ini **memadai** dan tiada dependency untuk diselenggara. Beralih ke pustaka apabila sudah memilih framework (React → Zustand/Redux Toolkit; Vue → Pinia).

---

### 11. React, Vue, Svelte — ciri yang sama

Ciri: dropdown kategori + kiraan laporan ditapis. Perhatikan: **state → paparan diterbitkan**, persis seperti store + selector kita.

```jsx
// React (JSX)
import { useState, useMemo } from 'react';
export function Penapis({ laporan }) {
  const [kategori, setKategori] = useState('');
  const ditapis = useMemo(() => tapisLaporan(laporan, { kategori }), [laporan, kategori]); // ≈ memoAkhir
  return (
    <label>
      Kategori
      <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
        <option value="">Semua</option>
        <option value="tanah">Tanah</option>
      </select>
      <span>{ditapis.length} laporan</span>  {/* JSX melarikan teks secara automatik — selamat XSS */}
    </label>
  );
}
```

```vue
<!-- Vue 3 (SFC, Composition API) -->
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ laporan: Array });
const kategori = ref('');
const ditapis = computed(() => tapisLaporan(props.laporan, { kategori: kategori.value }));
</script>
<template>
  <label>Kategori
    <select v-model="kategori"><option value="">Semua</option><option value="tanah">Tanah</option></select>
    <span>{{ ditapis.length }} laporan</span>
  </label>
</template>
```

```svelte
<!-- Svelte 5 (runes) -->
<script>
  let { laporan } = $props();
  let kategori = $state('');
  let ditapis = $derived(tapisLaporan(laporan, { kategori }));
</script>
<label>Kategori
  <select bind:value={kategori}><option value="">Semua</option><option value="tanah">Tanah</option></select>
  <span>{ditapis.length} laporan</span>
</label>
```

| | React | Vue | Svelte | Vanilla + store kita |
|---|---|---|---|---|
| Keadaan | `useState` | `ref` | `$state` | `store` |
| Terbitan | `useMemo` | `computed` | `$derived` | selector + `memoAkhir` |
| Kemas kini DOM | Virtual DOM diff | Reaktiviti + VDOM | Dikompil kepada kemas kini DOM terus | `langgan` + `replaceChildren` manual |
| Peta Leaflet | `react-leaflet` | `vue-leaflet` | pembalut manual | terus |

Dan **Node.js**: JavaScript yang sama di server — `projek/api/server.mjs` (mock API) ialah contohnya. Framework backend (Express, Fastify, NestJS) + PostGIS ialah langkah seterusnya untuk API sebenar.

---

### 12. Menguji layer state (`node --test`)

Semua ujian di bawah **lulus** terhadap `store.js` + `pemilih.js`/`tindakan.js`/`url.js` di atas (15 ujian, Node 22+). Letak dalam folder `tests/` dan jalankan `npm test` (`"test": "node --test \"tests/**/*.test.js\""`).

```js
// tests/store.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ciptaStore } from '../src/state/store.js';

test('dapat() memulangkan keadaan awal', () => {
  const store = ciptaStore({ kiraan: 0 });
  assert.deepEqual(store.dapat(), { kiraan: 0 });
});

test('set(objek) menggabung dan mencipta objek baharu', () => {
  const store = ciptaStore({ a: 1, b: 2 });
  const sebelum = store.dapat();
  store.set({ b: 3 });
  assert.deepEqual(store.dapat(), { a: 1, b: 3 });
  assert.notEqual(store.dapat(), sebelum); // rujukan berbeza
  assert.equal(sebelum.b, 2);              // yang lama tidak berubah
});

test('set(fungsi) menerima keadaan semasa', () => {
  const store = ciptaStore({ kiraan: 1 });
  store.set((s) => ({ kiraan: s.kiraan + 1 }));
  assert.equal(store.dapat().kiraan, 2);
});

test('langgan dipanggil dengan (baharu, lama) dan boleh nyahlanggan', () => {
  const store = ciptaStore({ n: 0 });
  const panggilan = [];
  const nyahlanggan = store.langgan((baru, lama) => panggilan.push([lama.n, baru.n]));
  store.set({ n: 1 });
  nyahlanggan();
  store.set({ n: 2 });
  assert.deepEqual(panggilan, [[0, 1]]);
});

test('set tanpa perubahan tidak memaklumkan pelanggan', () => {
  const store = ciptaStore({ n: 0 });
  let dipanggil = 0;
  store.langgan(() => dipanggil++);
  store.set({ n: 0 });
  assert.equal(dipanggil, 0);
});
```

```js
// tests/tindakan.test.js (petikan) — API palsu, tiada rangkaian
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ciptaStore } from '../src/state/store.js';
import { ciptaTindakan } from '../src/state/tindakan.js';

const laporan = (id, status) => ({
  type: 'Feature', id,
  geometry: { type: 'Point', coordinates: [101.69, 2.93] },
  properties: { id, status, tajuk: `Laporan ${id}` },
});
const storeAwal = () => ciptaStore({
  laporan: [laporan('LPR-0001', 'baharu'), laporan('LPR-0002', 'baharu')],
  penapis: { kategori: '', status: '', q: '' }, dipilihId: null, memuat: false, ralat: null, notis: null,
});

test('tukarStatus: rollback rekod itu sahaja + notis bila API gagal', async () => {
  const store = storeAwal();
  const api = { kemaskiniLaporan: async () => { throw new Error('Ralat HTTP 500'); } };
  await ciptaTindakan(store, api).tukarStatus('LPR-0001', 'selesai');
  const s = store.dapat();
  assert.equal(s.laporan[0].properties.status, 'baharu');       // diundur
  assert.equal(s.notis.jenis, 'ralat');
  assert.match(s.notis.mesej, /LPR-0001.*500/);
});

test('rollback sasaran tidak memadam kejayaan serentak rekod lain', async () => {
  const store = storeAwal();
  const api = {
    kemaskiniLaporan: async (id, { status }) => {
      if (id === 'LPR-0001') { await new Promise((r) => setTimeout(r, 10)); throw new Error('gagal'); }
      return laporan(id, status);
    },
  };
  const t = ciptaTindakan(store, api);
  await Promise.all([t.tukarStatus('LPR-0001', 'selesai'), t.tukarStatus('LPR-0002', 'ditolak')]);
  const [a, b] = store.dapat().laporan;
  assert.equal(a.properties.status, 'baharu');   // gagal → diundur
  assert.equal(b.properties.status, 'ditolak');  // berjaya → kekal
});
```

Lebih lanjut tentang `node --test`: Nota 14 (Edaran Hari 5).

---

### ⚠️ Kesilapan lazim

| Simptom | Punca | Pembetulan |
|---------|-------|------------|
| UI tidak dikemas kini selepas `set` | Mutasi (`push`, `sort`, `f.properties.x = …`) → rujukan sama → `set` diabaikan | Cipta objek/array baharu (§3) |
| Senarai & peta tunjuk bilangan berbeza | Keadaan terbitan disimpan dua kali | Satu `laporan` + selector |
| Infinite loop / "Maximum call stack" | Pelanggan memanggil `set` dengan nilai baharu setiap kali | Semak `baharu.x !== lama.x` sebelum bertindak; jangan cipta objek baharu tanpa sebab |
| Komponen dibuang tetapi masih melukis / error `null` | Tidak nyahlanggan | Simpan & panggil cleanup |
| Rollback memadam perubahan lain | Rollback seluruh senarai | Rollback sasaran satu rekod (§5) |
| Rollback senyap — pengguna fikir berjaya | Tiada notis | Set `notis` dalam `catch` |
| Selector memo tidak pernah "kena" | Argumen objek baharu setiap panggilan (`{ ...s.penapis }`) | Hantar rujukan dari store terus |
| URL rosak dengan `&` dalam carian | Template literal | `URLSearchParams` |
| `document is not defined` dalam `node --test` | Logik DOM dalam `state/`/`utils/` | Pindahkan ke `ui/` |
| `L.markerClusterGroup is not a function` | Plugin dimuat sebelum Leaflet / CSS tidak diimport | `import L from 'leaflet'` dahulu, kemudian `import 'leaflet.markercluster'` |

---

### Rujukan rasmi

- MDN — `structuredClone`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone> · `Array.prototype.toSorted`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted> · `Array.prototype.with`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with> · `Object.freeze`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze>
- MDN — `URLSearchParams`: <https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams> · `history.replaceState`: <https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState> · `popstate`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event>
- Redux Toolkit: <https://redux-toolkit.js.org/> · Zustand: <https://zustand.docs.pmnd.rs/> · Pinia: <https://pinia.vuejs.org/> · Preact Signals: <https://preactjs.com/guide/v10/signals/> · Cadangan TC39 Signals: <https://github.com/tc39/proposal-signals>
- React: <https://react.dev/learn> · Vue: <https://vuejs.org/guide/introduction.html> · Svelte: <https://svelte.dev/docs/svelte/overview> · Node.js: <https://nodejs.org/en/learn/getting-started/introduction-to-nodejs>
- Leaflet.markercluster: <https://github.com/Leaflet/Leaflet.markercluster> · Turf `simplify`: <https://turfjs.org/docs/api/simplify>
- Node.js test runner: <https://nodejs.org/api/test.html>

### Digunakan pada Hari N

- **Hari 1** — fungsi tulen `tapisLaporan`/`kiraIkut` yang kemudian menjadi asas selector.
- **Hari 2** — `services/api.js`, `AbortController`, `ApiError` yang digunakan oleh tindakan.
- **Hari 3** — delegasi event & render tanpa `innerHTML` dalam komponen.
- **Hari 5 (utama)** — S1: store, immutable, selector, sinkroni, URL, optimistic update (§1–§7, §10); S2: layer, folder, komponen, prestasi, framework (§8, §9, §11); S3: ujian layer state (§12).

---

## 14 · Debugging, Error Handling, Ujian & Amalan Terbaik

> Nota topikal · Indeks: `./README.md`

### Objektif nota

Selepas membaca nota ini, anda boleh:

- **Mengikuti** kitaran debugging bersistem dan **menggunakan** method `console` (`table`, `group`, `time`, `assert`, `trace`, `dir`), `debugger`, serta jenis breakpoint dalam DevTools (baris, bersyarat, logpoint, fetch/XHR, pengecualian).
- **Menggunakan** panel Sources, Network dan Application untuk mengesan pepijat API, CORS dan storage.
- **Menulis** error handling berlapis: `try…catch…finally`, custom error (`ApiError`), `error.cause`, lontar semula, dan handler global `error`/`unhandledrejection`.
- **Menulis & menjalankan** ujian pantas dengan `node --test` + `node:assert/strict` (termasuk `fetch` palsu dengan `mock`).
- **Menyemak** kod terhadap senarai semak kod bersih dan keselamatan sebelum demo.

---

### 1. Debugging ialah kaedah, bukan tekaan

Pembangun baharu menukar kod secara rawak sehingga "ia berfungsi". Pembangun berpengalaman mengikut kitaran:

```mermaid
flowchart LR
    A[1. Hasilkan semula<br/>langkah tepat] --> B[2. Sempitkan<br/>UI? state? API? data?]
    B --> C[3. Hipotesis<br/>'status tidak dihantar']
    C --> D[4. Sahkan<br/>breakpoint / Network]
    D --> E[5. Baiki<br/>perubahan minimum]
    E --> F[6. Uji<br/>tulis ujian yang dahulu gagal]
    F -.->|pepijat lain| A
```

**Sempitkan mengikut layer** (nota 13): Adakah request dihantar? (Network) → Adakah response betul? (Network → Response) → Adakah store dikemas kini? (`store.dapat()`) → Adakah UI melukis? (Elements). Setiap soalan membuang separuh ruang carian.

---

### 2. `console` — lebih daripada `log`

| Method | Guna | Contoh GeoLapor |
|--------|------|-----------------|
| `console.log(a, b)` | Log biasa — **hantar objek sebagai argumen berasingan**, bukan `'x' + obj` | `console.log('laporan', f)` |
| `console.table(arr)` | Array objek sebagai jadual (boleh susun lajur) | `console.table(store.dapat().laporan.map((f) => f.properties))` |
| `console.group/groupCollapsed(label)` + `groupEnd()` | Kumpul log berkaitan | log setiap perubahan store |
| `console.time(l)` / `timeEnd(l)` | Ukur tempoh | `console.time('tapis')` … `console.timeEnd('tapis')` |
| `console.assert(syarat, …)` | Log **hanya** jika syarat palsu | `console.assert(dalamMalaysia(f.geometry.coordinates), 'Koordinat terbalik?', f.id)` |
| `console.trace()` | Cetak susunan panggilan (siapa memanggil saya?) | dalam `store.set` — cari siapa mengubah `penapis` |
| `console.dir(obj)` | Objek sebagai pokok property (berguna untuk elemen DOM) | `console.dir(document.querySelector('#peta'))` |
| `console.warn/error` | Tahap amaran/error (boleh ditapis dalam Console) | error API |
| `console.count(l)` | Kira berapa kali baris dicapai | berapa kali pelanggan dipanggil? |

```js
// Logger store — pasang dalam mod dev sahaja (main.js)
if (import.meta.env.DEV) {
  store.langgan((baharu, lama) => {
    const berubah = Object.keys(baharu).filter((k) => baharu[k] !== lama[k]);
    console.groupCollapsed(`store: ${berubah.join(', ')}`);
    for (const k of berubah) console.log(k, lama[k], '→', baharu[k]);
    console.groupEnd();
  });
  window.__geolapor = { store };   // cuba dalam Console: __geolapor.store.dapat()
}
```

> ⚠️ `console.log(obj)` dalam Chrome memaparkan objek **secara langsung (live)** — jika objek dimutasi kemudian, anda nampak nilai **baharu** apabila mengembangnya. Guna `console.log(structuredClone(obj))` atau `JSON.stringify` untuk petikan pada masa itu. (Satu lagi sebab untuk immutable!)

---

### 3. DevTools (Chrome / Edge)

Buka: **F12** atau `Ctrl+Shift+I` (Mac: `Cmd+Opt+I`).

#### 3.1 Sources — hentikan masa

| Jenis breakpoint | Cara | Bila |
|------------------|------|------|
| **Baris** | Klik nombor baris | Asas |
| **Bersyarat** | Klik kanan nombor baris → *Add conditional breakpoint* → `id === 'LPR-0007'` | Loop / banyak panggilan, hanya satu kes bermasalah |
| **Logpoint** | Klik kanan → *Add logpoint* → `'status', f.properties.status` | "console.log tanpa ubah kod" — tiada lupa buang |
| **`debugger;`** | Tulis dalam kod | Kod dijana/sukar dicari; **buang sebelum commit** (ESLint `no-debugger`) |
| **Fetch/XHR** | Panel kanan → *XHR/fetch Breakpoints* → `+` → `/api/laporan` | "Siapa yang menghantar request ini?" |
| **Event listener** | *Event Listener Breakpoints* → Mouse → click | Tidak tahu handler mana yang berjalan |
| **Pengecualian** | Ikon ⏸ *Pause on exceptions* (+ *caught*) | Error ditelan oleh `catch` |

Semasa berhenti: **Step over** (F10), **Step into** (F11), **Step out** (Shift+F11), **Resume** (F8). Panel **Scope** menunjukkan variable tempatan/closure; **Watch** untuk ungkapan (`store.dapat().penapis`); **Call Stack** untuk laluan panggilan.

**Source maps:** Vite dev server memberi *source map* secara automatik, jadi breakpoint diletak pada `src/state/tindakan.js` asal walaupun browser menjalankan kod yang diubah. Untuk build produksi, `build.sourcemap: true` dalam `vite.config.js` (pertimbangkan sama ada source map patut didedahkan secara awam).

#### 3.2 Network — "adakah server betul atau saya?"

| Semak | Di mana | Contoh pepijat |
|-------|---------|----------------|
| Request dihantar? | Senarai (tapis **Fetch/XHR**) | Tiada baris → handler tidak berjalan / `preventDefault` hilang |
| URL & query | *Headers → General* | `?bbox=2.9,101.6,…` → lat/lng terbalik |
| Header request | *Headers → Request* | `X-API-Key` tiada → 401 |
| Badan dihantar | *Payload* | `[object Object]` → lupa `JSON.stringify` |
| Status | Lajur Status | 422 → lihat *Response* `medan` |
| Response | *Response* / *Preview* | HTML (`<!doctype`) bukan JSON → URL salah → `Unexpected token '<'` |
| CORS | Console + baris merah `(failed) CORS` | Server tiada `Access-Control-Allow-Origin` → proxy (nota 11) |
| Kelewatan | *Timing* · *Throttling: Slow 4G* | Uji spinner & `timeoutMs` |

💡 Klik kanan request → **Copy as cURL** → jalankan di terminal untuk mengasingkan masalah browser vs server.

#### 3.3 Application

`Local storage`, `Session storage`, `IndexedDB` (lihat cache layer), `Cache storage`, *Clear site data* (nota 12).

#### 3.4 Elements & Console trik

- `$0` = elemen yang dipilih dalam Elements; `$$('li[data-id]')` = `querySelectorAll` sebagai array.
- Klik pautan `fail.js:42` pada error merah → terus ke baris dalam Sources.
- *Preserve log* supaya log tidak hilang selepas muat semula.

---

### 4. Error handling

#### 4.1 `try…catch…finally`

```js
async function muatLaporan() {
  store.set({ memuat: true, ralat: null });
  try {
    const fc = await senaraiLaporan(store.dapat().penapis);
    store.set({ laporan: fc.features });
  } catch (err) {
    store.set({ ralat: err.message });           // mesej BM untuk pengguna
    console.error('muatLaporan gagal', err);     // butiran teknikal untuk pembangun
  } finally {
    store.set({ memuat: false });                // SENTIASA berjalan — spinner tidak tersangkut
  }
}
```

Empat peraturan:

1. **Tangkap hanya apa yang anda boleh kendalikan.** `catch (e) {}` kosong menyembunyikan pepijat.
2. **Lontar semula** apa yang bukan urusan anda (`throw err`).
3. **`finally`** untuk pembersihan yang mesti berlaku.
4. **Pengguna nampak mesej berguna (BM); console nampak butiran** (stack, `cause`).

> ⚠️ `try…catch` **tidak** menangkap error dalam Promise yang tidak di-`await`: `try { fetchSesuatu(); } catch {}` — error berlaku kemudian, di luar blok. Sentiasa `await` (atau `.catch()`).

#### 4.2 Custom error — `ApiError` (`services/api.js`)

```js
/** Error API dengan status HTTP & error medan (422). status 0 = network/timeout. */
export class ApiError extends Error {
  constructor(mesej, status, medan) {
    super(mesej);
    this.name = 'ApiError';          // tanpa ini, err.name ialah 'Error'
    this.status = status;
    this.medan = medan ?? null;      // 422: { tajuk: 'Wajib diisi', … }
  }
}
```

Kenapa kelas sendiri? Supaya pemanggil boleh **membezakan** jenis kegagalan:

```js
try {
  await ciptaLaporan(data);
} catch (err) {
  if (err.name === 'AbortError') return;                         // dibatalkan sengaja — bukan error
  if (err instanceof ApiError && err.status === 422) {
    paparRalatMedan(err.medan);                                  // di sebelah medan borang
  } else if (err instanceof ApiError && err.status === 401) {
    notis('Kunci API tidak sah', 'ralat');
  } else if (err instanceof ApiError && err.status === 0) {
    notis('Tiada sambungan ke pelayan. Cuba lagi.', 'amaran');
  } else {
    throw err;                                                   // tidak dijangka → biar handler global
  }
}
```

| `status` | Maksud (mock API GeoLapor) | Tindakan UI |
|----------|---------------------------|-------------|
| 0 | Rangkaian putus / timeout | Butang "Cuba lagi" |
| 401 | Tiada/salah `X-API-Key` | Mesej konfigurasi |
| 404 | Laporan tiada | Buang dari senarai, notis |
| 422 | Validasi gagal (`medan`) | Tanda medan borang |
| 500 | Server error (`?gagal=1`) | Notis + rollback (nota 13) |

#### 4.3 `error.cause` — error chain (ES2022)

Apabila membungkus error peringkat rendah, **jangan buang** error asal:

```js
function huraiLapisan(teks) {
  try {
    return JSON.parse(teks);
  } catch (err) {
    throw new Error('Fail lapisan bukan GeoJSON yang sah', { cause: err }); // cause = error asal
  }
}

try {
  huraiLapisan('{rosak');
} catch (err) {
  console.error(err.message);        // 'Fail lapisan bukan GeoJSON yang sah'
  console.error(err.cause.name);     // 'SyntaxError' — butiran asal masih ada
}
```

`ApiError` di atas menerima 3 argumen; jika mahu menyokong `cause`, lanjutkan tandatangan dengan objek pilihan keempat dan hantar ke `super(mesej, pilihan)` — tanpa mengubah pemanggil sedia ada.

#### 4.4 Handler global — jaring keselamatan terakhir

```js
// main.js — tangkap apa yang terlepas (BUKAN pengganti try…catch)
window.addEventListener('error', (e) => {
  console.error('Ralat tidak ditangkap:', e.error ?? e.message);
  notis('Ralat tidak dijangka. Sila muat semula halaman.', 'ralat');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise ditolak tanpa catch:', e.reason);
  notis('Operasi gagal. Cuba lagi.', 'ralat');
});
```

Dalam produksi, di sinilah error dihantar ke log server (Sentry, endpoint dalaman) — **tanpa** data peribadi.

---

### 5. Ujian pantas dengan `node --test`

Node.js 22+ ada *test runner* terbina — **tiada pakej**. Layer `utils/`, `state/` (dan `services/` dengan `fetch` palsu) boleh diuji kerana tidak menyentuh DOM (nota 13 §8).

#### 5.1 Struktur & arahan

```text
projek/geolapor-mula/
├── package.json     "type": "module", "scripts": { "test": "node --test \"tests/**/*.test.js\"" }
├── src/…
└── tests/
    ├── geo.test.js       import … from '../src/utils/geo.js'
    ├── store.test.js     import … from '../src/state/store.js'
    └── tindakan.test.js
```

```bash
npm test                              # jalankan skrip di atas
node --test                           # tanpa argumen: cari *.test.js / test/**/*.js secara automatik
node --test "tests/**/*.test.js"      # glob — PETIKAN wajib (supaya Node, bukan shell, mengembangkannya)
node --test --watch                   # jalankan semula bila fail disimpan
node --test --test-name-pattern="rollback"   # hanya ujian yang namanya sepadan
```

> ⚠️ **Kesilapan lazim — `node --test src/state/`.** Memberi **folder** sebagai argumen gagal pada Node terkini (diuji pada Node 26: `✖ src/state … 'test failed'`) kerana ia dianggap nama fail. Guna `node --test` tanpa argumen atau glob berpetik.

#### 5.2 `node:assert/strict` — yang paling kerap

| Fungsi | Guna |
|--------|------|
| `assert.equal(a, b)` | `a === b` (mod strict) |
| `assert.deepEqual(a, b)` | Kandungan objek/array sama (strict: jenis pun sama) |
| `assert.notEqual(a, b)` | Rujukan berbeza (cth objek baharu selepas `set`) |
| `assert.ok(x)` | Truthy |
| `assert.match(str, /re/)` | String sepadan regex |
| `assert.throws(fn, jangkaan)` | Fungsi sync melontar |
| `await assert.rejects(janji, jangkaan)` | Promise di-reject (async) |

#### 5.3 Ujian `utils/geo.js`

```js
// tests/geo.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { jarakKm, tapisLaporan, kiraIkut, bboxDari, dalamMalaysia } from '../src/utils/geo.js';

const titik = (id, lng, lat, kategori, status, tajuk) => ({
  type: 'Feature', id,
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { id, kategori, status, tajuk },
});
const SAMPEL = [
  titik('LPR-0001', 101.6958, 2.9264, 'infrastruktur', 'baharu', 'Papan tanda sempadan rosak'),
  titik('LPR-0002', 101.6500, 2.9200, 'tanah', 'selesai', 'Tanah runtuh kecil'),
  titik('LPR-0003', 101.7100, 2.9400, 'infrastruktur', 'dalam-tindakan', 'Lampu jalan padam'),
];

describe('jarakKm', () => {
  test('titik sama = 0', () => assert.equal(jarakKm([101.7, 2.9], [101.7, 2.9]), 0));
  test('1 darjah latitud ≈ 111.19 km', () => {
    assert.ok(Math.abs(jarakKm([101.7, 2], [101.7, 3]) - 111.19) < 0.01);
  });
});
describe('tapisLaporan', () => {
  test('tanpa penapis pulangkan semua', () => assert.equal(tapisLaporan(SAMPEL).length, 3));
  test('ikut kategori + carian tanpa huruf besar/kecil', () => {
    const hasil = tapisLaporan(SAMPEL, { kategori: 'infrastruktur', q: 'LAMPU' });
    assert.deepEqual(hasil.map((f) => f.id), ['LPR-0003']);
  });
  test('tidak mengubah array asal', () => {
    tapisLaporan(SAMPEL, { status: 'selesai' });
    assert.equal(SAMPEL.length, 3);
  });
});
test('kiraIkut kategori', () => {
  assert.deepEqual(kiraIkut(SAMPEL, 'kategori'), { infrastruktur: 2, tanah: 1 });
});
test('bboxDari [minLng, minLat, maxLng, maxLat]', () => {
  assert.deepEqual(bboxDari(SAMPEL), [101.65, 2.92, 101.71, 2.94]);
  assert.equal(bboxDari([]), null);
});
test('dalamMalaysia menolak koordinat terbalik [lat, lng]', () => {
  assert.equal(dalamMalaysia([101.6958, 2.9264]), true);
  assert.equal(dalamMalaysia([2.9264, 101.6958]), false);
});
```

Ujian `store.js` dan `tindakan.js` (optimistic + rollback): lihat nota 13 §12 (Nota 13 (Edaran Hari 5)).

#### 5.4 Ujian `services/api.js` dengan `fetch` palsu

`mock.method(globalThis, 'fetch', …)` menggantikan `fetch` sementara — tiada server diperlukan:

```js
// tests/api.test.js
import { test, mock, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mintaJson, ApiError } from '../src/services/api.js';

afterEach(() => mock.restoreAll());   // pulihkan fetch sebenar selepas setiap ujian

const jawapan = (status, badan) =>
  new Response(badan === null ? null : JSON.stringify(badan), { status, headers: { 'Content-Type': 'application/json' } });

test('422 → ApiError dengan status & medan', async () => {
  mock.method(globalThis, 'fetch', async () => jawapan(422, { ralat: 'Data tidak sah', medan: { tajuk: 'Wajib diisi' } }));
  await assert.rejects(mintaJson('/api/laporan', { method: 'POST', body: {} }), (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 422);
    assert.deepEqual(err.medan, { tajuk: 'Wajib diisi' });
    return true;
  });
});

test('POST menghantar X-API-Key & JSON', async () => {
  const f = mock.method(globalThis, 'fetch', async () => jawapan(201, { id: 'LPR-0041' }));
  await mintaJson('/api/laporan', { method: 'POST', body: { tajuk: 'Uji' } });
  const [, pilihan] = f.mock.calls[0].arguments;
  assert.equal(pilihan.headers['X-API-Key'], 'latihan-pgn-2026');
  assert.equal(pilihan.body, '{"tajuk":"Uji"}');
});

test('rangkaian putus → ApiError status 0', async () => {
  mock.method(globalThis, 'fetch', async () => { throw new TypeError('fetch failed'); });
  await assert.rejects(mintaJson('/api/kesihatan'), { name: 'ApiError', status: 0 });
});

test('204 → null', async () => {
  mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }));
  assert.equal(await mintaJson('/api/laporan/LPR-0001', { method: 'DELETE' }), null);
});
```

> ⚠️ **Perangkap `import.meta.env` dalam Node (diuji):** `import.meta.env` hanya wujud dalam Vite. Dalam `node --test`, `import.meta.env.VITE_API_URL` melontar `TypeError: Cannot read properties of undefined (reading 'VITE_API_URL')` **semasa import** — semua ujian fail itu gagal. Guna optional chaining: `import.meta.env?.VITE_API_URL ?? 'http://localhost:3000'`. Dengan perubahan itu, keempat-empat ujian di atas lulus.

#### 5.5 Apa yang patut diuji dahulu?

Logik yang **mudah salah** dan **mahal jika salah**: penukaran koordinat (`[lng, lat]`!), penapisan, rollback optimistik, pemetaan status HTTP → `ApiError`. Jangan uji Leaflet sendiri — ia sudah diuji oleh pembangunnya.

---

### 6. JSDoc — jenis tanpa TypeScript

VS Code membaca komen JSDoc dan memberi autolengkap + amaran jenis. Tambah `// @ts-check` di baris pertama fail untuk semakan lebih ketat.

```js
// @ts-check
/**
 * Jarak bulatan besar antara dua titik.
 * @param {[number, number]} a  [lng, lat] — susunan GeoJSON
 * @param {[number, number]} b  [lng, lat]
 * @returns {number} jarak dalam kilometer
 */
export function jarakKm(a, b) { /* … */ }

/** @typedef {{ kategori?: string, status?: string, q?: string }} Penapis */

/**
 * @param {GeoJSON.Feature[]} features
 * @param {Penapis} [penapis]
 */
export function tapisLaporan(features, penapis = {}) { /* … */ }
```

---

### 7. Senarai semak kod bersih

| # | Semak | Contoh |
|---|-------|--------|
| C1 | Nama bermakna & konsisten: fungsi = kata kerja, data = kata nama | `muatLaporan()`, `laporanDitapis` — bukan `data2`, `doIt()` |
| C2 | Satu fungsi, satu tugas (≲ 30 baris) | `pasangSenarai` tidak memanggil `fetch` |
| C3 | Tiada nombor/string ajaib | `const TTL_MS = 24 * 60 * 60 * 1000` |
| C4 | Fungsi tulen di `utils/`; kesan sampingan di tepi | `tapisLaporan` tidak menyentuh DOM |
| C5 | Immutable dalam store | `map`/spread — tiada `push` pada keadaan |
| C6 | `const` default, `let` bila perlu, tiada `var`; `===` sentiasa | ESLint `prefer-const`, `no-var`, `eqeqeq` |
| C7 | Tiada `console.log` / `debugger` sisa | `npm run lint` bersih |
| C8 | Error dikendalikan di peringkat betul; tiada `catch {}` kosong tanpa komen | §4 |
| C9 | Komen menerangkan **kenapa**, bukan **apa** | `// [lng, lat] — susunan GeoJSON` |
| C10 | JSDoc pada fungsi awam modul | §6 |
| C11 | Prettier + ESLint 0 error | `npm run lint && npx prettier --check .` |
| C12 | Ujian hijau | `npm test` |

---

### 8. Senarai semak keselamatan frontend

| # | Semak | Kenapa |
|---|-------|--------|
| K1 | **Tiada `innerHTML`** dengan data pengguna/API — guna `textContent` / `createElement`; popup Leaflet diberi elemen DOM | XSS: tajuk `<img src=x onerror=alert(1)>` akan dijalankan |
| K2 | **Tiada rahsia dalam frontend** — semua `VITE_*` dibundel ke JS awam | Sesiapa boleh buka DevTools → Sources |
| K3 | Key `latihan-pgn-2026` hanya untuk mock API latihan | Sistem sebenar: SSO/token + proxy backend |
| K4 | **Validasi di server** — validasi klien hanya untuk UX | Penyerang memanggil API terus dengan `curl` |
| K5 | Token/kata laluan tidak dalam `localStorage` | Skrip XSS boleh membacanya; guna kuki `HttpOnly` |
| K6 | **CORS bukan pengesahan** — ia hanya mengawal browser mana boleh *membaca* response | `curl` tidak peduli CORS; lindungi API dengan auth |
| K7 | HTTPS di luar localhost | Key/token boleh dihidu di rangkaian |
| K8 | `npm audit` + versi disemat (lockfile) | Dependency terjejas |
| K9 | Content Security Policy (CSP) di web server | Had sumber skrip; `script-src 'self'` menyekat skrip sebaris yang disuntik |
| K10 | Pautan luar `target="_blank"` dengan `rel="noopener noreferrer"` | Elak tabnabbing |
| K11 | `postMessage`: sahkan `event.origin` | Mesej daripada laman lain |
| K12 | Data sintetik sahaja dalam latihan (`@latihan.test`) | Tiada data PGN/JUPEM sebenar |

```http
# Contoh header CSP (ditetapkan oleh web server, bukan JS) untuk GeoLapor + tile OSM
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://tile.openstreetmap.org;
  connect-src 'self' http://localhost:3000; style-src 'self'; script-src 'self'; object-src 'none'
```

---

### ⚠️ Kesilapan lazim

| Simptom | Punca | Pembetulan |
|---------|-------|------------|
| `Unexpected token '<', "<!doctype"... is not valid JSON` | URL salah → server pulangkan HTML (404/index.html) | Semak URL dalam Network; semak `res.ok` sebelum `res.json()` |
| `TypeError: Cannot read properties of undefined (reading 'properties')` | `find` pulangkan `undefined` | `?.` + semak `if (!f) return` |
| Spinner tersangkut selepas error | `memuat: false` hanya dalam cabang berjaya | `finally` |
| Error "hilang" — tiada apa berlaku | `catch {}` kosong / Promise tidak di-`await` | Log + kendalikan; `await`; handler `unhandledrejection` |
| Log menunjukkan nilai "masa depan" | Console Chrome memaparkan objek live | `structuredClone` / `JSON.stringify` semasa log |
| `node --test src/state/` gagal | Folder sebagai argumen | `node --test` atau glob berpetik |
| `document is not defined` dalam ujian | Modul yang diuji menyentuh DOM | Pindah logik ke `utils/`/`state/` |
| `Cannot read properties of undefined (reading 'VITE_API_URL')` dalam ujian | `import.meta.env` tiada dalam Node | `import.meta.env?.VITE_API_URL` |
| Ujian lulus walaupun kod rosak | `assert.rejects` tanpa `await` | `await assert.rejects(...)` |
| `err instanceof ApiError` palsu | Membandingkan kelas dari salinan modul lain / error bukan dari `mintaJson` | Semak `err.name === 'ApiError'` sebagai sandaran |

---

### Rujukan rasmi

- Chrome DevTools — Breakpoints: <https://developer.chrome.com/docs/devtools/javascript/breakpoints> · Network: <https://developer.chrome.com/docs/devtools/network> · Console API: <https://developer.chrome.com/docs/devtools/console/api>
- MDN — `console`: <https://developer.mozilla.org/en-US/docs/Web/API/console> · `debugger`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger> · `try...catch`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch> · `Error.cause`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause>
- MDN — event `error`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event> · `unhandledrejection`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event>
- Node.js — Test runner: <https://nodejs.org/api/test.html> · Assert: <https://nodejs.org/api/assert.html>
- JSDoc: <https://jsdoc.app/>
- MDN — CSP: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP> · CORS: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS>
- OWASP Top 10: <https://owasp.org/www-project-top-ten/> · XSS Prevention Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html>
- npm audit: <https://docs.npmjs.com/cli/v11/commands/npm-audit>

### Digunakan pada Hari N

- **Hari 1** — `console`, syntax error, `try…catch` asas dengan `JSON.parse`.
- **Hari 2** — `ApiError`, status HTTP, tab Network, `AbortError`.
- **Hari 3** — `textContent` vs `innerHTML` (K1), breakpoint event listener.
- **Hari 4** — ESLint (`no-debugger`, `no-console`), `npm audit`, source maps Vite.
- **Hari 5 (utama)** — S3: debugging bersistem, error berlapis, handler global, `node --test`, senarai semak kod bersih & keselamatan.
