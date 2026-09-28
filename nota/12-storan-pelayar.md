# 12 · Browser Storage: localStorage, sessionStorage, IndexedDB & Cache API

> Nota topikal · Indeks: [`./README.md`](./README.md)

## Objektif nota

Selepas membaca nota ini, anda boleh:

- **Membandingkan** `localStorage`, `sessionStorage`, IndexedDB dan Cache API dari segi saiz, jenis data, hayat dan API sync/async.
- **Menulis** pembalut JSON `simpanLocal()`/`bacaLocal()` yang selamat (try/catch, `QuotaExceededError`, mod peribadi) seperti dalam `services/cache.js`.
- **Membina** cache layer GeoJSON dalam IndexedDB dengan **TTL** (`dapatkanCache`/`simpanCache`) dan **menerangkan** bila perlu versi cache.
- **Menyimpan** draf borang laporan supaya tidak hilang apabila halaman dimuat semula atau rangkaian terputus.
- **Menerangkan** kenapa token/kata laluan/API key **tidak boleh** disimpan dalam browser storage.

---

## 1. Kenapa simpan data di browser?

Pegawai lapangan GeoLapor bekerja di tapak dengan liputan rangkaian yang lemah. Tanpa storage tempatan:

- setiap kali buka aplikasi, layer `sempadan-zon` (mungkin beratus KB) dimuat turun semula;
- tapisan yang dipilih hilang selepas muat semula;
- laporan separuh siap hilang jika tab tertutup atau bateri habis.

Browser storage menyelesaikan masalah **kemudahan & prestasi** — bukan pengganti pangkalan data server. **Server kekal sumber kebenaran**; browser storage ialah *cache* atau *draf*.

---

## 2. Perbandingan

| | `localStorage` | `sessionStorage` | IndexedDB | Cache API |
|---|---|---|---|---|
| Jenis data | **String sahaja** | String sahaja | Objek JS (structured clone), Blob, ArrayBuffer | Pasangan `Request` → `Response` |
| Saiz (anggaran) | ~5 MB per asal | ~5 MB per asal per tab | Besar (peratus ruang cakera; kongsi kuota asal) | Kongsi kuota yang sama |
| API | **Sync** (menyekat thread utama) | Sync | **Async** (event/Promise) | Async (Promise) |
| Hayat | Kekal sehingga dipadam | Tamat bila **tab ditutup** | Kekal (boleh diusir jika cakera penuh) | Kekal (boleh diusir) |
| Dikongsi antara tab | Ya (asal sama) | Tidak | Ya | Ya |
| Sesuai untuk | Tetapan kecil: penapis, tema, layer aktif | Keadaan sementara satu sesi | Layer GeoJSON besar, antrian luar talian, fail | Response HTTP (Service Worker / PWA) |

> 💡 **Tip:** Lihat & ubah semua storage dalam **DevTools → Application** (Chrome/Edge): *Local storage*, *Session storage*, *IndexedDB*, *Cache storage*, dan *Storage → Clear site data*.

---

## 3. localStorage & sessionStorage

### 3.1 API asas

```js
localStorage.setItem('tema', 'gelap');
localStorage.getItem('tema');      // 'gelap'
localStorage.getItem('tiada');     // null (bukan undefined)
localStorage.removeItem('tema');
localStorage.clear();              // ⚠️ padam SEMUA untuk asal ini (termasuk aplikasi lain pada localhost:5173!)

sessionStorage.setItem('langkah', '2'); // API sama; hilang bila tab ditutup
```

### 3.2 Perangkap "string sahaja"

```js
localStorage.setItem('penapis', { kategori: 'tanah' });
localStorage.getItem('penapis');   // '[object Object]'  ← data hilang!

localStorage.setItem('bilangan', 5);
localStorage.getItem('bilangan') + 1; // '51'  ← gabungan string, bukan 6
```

### 3.3 Pembalut JSON yang selamat

`setItem` boleh **melontar** error (storage penuh → `QuotaExceededError`; sesetengah browser dalam mod peribadi/dasar organisasi menyekat storage). `JSON.parse` boleh melontar jika data rosak (diubah manual dalam DevTools, versi lama). Jadi **bungkus**:

```js
// src/services/cache.js (bahagian localStorage) — diuji dalam Node dengan stub localStorage
export function bacaLocal(kunci, lalai = null) {
  try {
    const teks = localStorage.getItem(kunci);
    return teks === null ? lalai : JSON.parse(teks);
  } catch {
    return lalai; // data rosak / storage disekat → guna nilai default, jangan ranapkan aplikasi
  }
}

export function simpanLocal(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
  } catch (err) {
    // QuotaExceededError (penuh) atau SecurityError (disekat dasar/mod peribadi)
    console.warn('localStorage gagal:', err); // aplikasi TERUS berfungsi, cuma tanpa ingatan
  }
}

export function buangLocal(kunci) {
  try {
    localStorage.removeItem(kunci);
  } catch {
    /* abaikan */
  }
}
```

```js
// Guna (main.js): ingat tapisan pengguna. Awalan 'geolapor:' elak bertembung dengan aplikasi lain
// pada asal yang sama (semua projek di localhost:5173 berkongsi localStorage!)
const KUNCI_TAPISAN = 'geolapor:tapisan';
simpanLocal(KUNCI_TAPISAN, { kategori: 'tanah', status: '', q: '' });
const tapisanAwal = { kategori: '', status: '', q: '', ...bacaLocal(KUNCI_TAPISAN, {}) };
```

> 💡 Mahu tahu sama ada simpanan berjaya? Versi lanjutan boleh memulangkan `true`/`false` dan membezakan `err.name === 'QuotaExceededError'` untuk memaparkan notis "Storan penuh".

> ⚠️ `localStorage` adalah **sync**. Menyimpan `JSON.stringify` GeoJSON 3 MB akan membekukan UI beberapa ratus milisaat dan cepat mencecah had 5 MB. Data besar → IndexedDB.

### 3.4 Sync antara tab — event `storage`

```js
// Dipanggil dalam tab LAIN apabila localStorage berubah (bukan dalam tab yang menukar)
window.addEventListener('storage', (e) => {
  if (e.key === 'geolapor:penapis') console.log('Penapis ditukar di tab lain', JSON.parse(e.newValue));
});
```

---

## 4. IndexedDB — untuk layer GeoJSON & data besar

IndexedDB ialah pangkalan data objek dalam browser: **store** (≈ jadual), **key**, **transaksi**, **indeks**. API aslinya berasaskan event (lama); kita bungkus dengan Promise.

### 4.1 Pembalut Promise minimum (tanpa pustaka)

```js
// src/services/cache.js (bahagian IndexedDB) — logik yang sama diuji dengan fake-indexeddb dalam Node
const NAMA_DB = 'geolapor';
const VERSI_DB = 1;
const STOR = 'lapisan';
const TTL_MS = 24 * 60 * 60 * 1000; // cache sah 1 hari

let dbJanji;                           // buka DB SEKALI, guna semula Promise yang sama
function bukaDb() {
  dbJanji ??= new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('IndexedDB tidak disokong'));
    const req = indexedDB.open(NAMA_DB, VERSI_DB);
    // Dipanggil kali pertama / bila VERSI_DB dinaikkan — SATU-SATUNYA tempat cipta object store
    req.onupgradeneeded = () => req.result.createObjectStore(STOR);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbJanji;
}

function transaksi(mod, kerja) {           // mod: 'readonly' | 'readwrite'
  return bukaDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STOR, mod);
        const req = kerja(tx.objectStore(STOR));
        tx.oncomplete = () => resolve(req.result); // tunggu TRANSAKSI siap, bukan sekadar request
        tx.onerror = () => reject(tx.error);
      }),
  );
}
```

> 💡 **Tip:** Untuk produksi, pustaka kecil **idb-keyval** (`get`, `set`, `del`) memberi API yang sama dalam ~600 bait. Kita tulis sendiri di sini supaya anda faham apa yang berlaku di bawahnya.

### 4.2 Cache layer dengan TTL

Cache tanpa tarikh luput = data basi selamanya. Simpan **metadata** (masa disimpan) bersama data:

```js
// src/services/cache.js (sambungan)
/** Dapatkan nilai cache (null jika tiada / luput / IndexedDB gagal). */
export async function dapatkanCache(kunci) {
  try {
    const rekod = await transaksi('readonly', (s) => s.get(kunci));
    if (!rekod || Date.now() - rekod.masa > TTL_MS) return null; // luput → anggap tiada
    return rekod.nilai;
  } catch {
    return null;              // IndexedDB gagal → pemanggil terus ke rangkaian
  }
}

/** Simpan nilai (objek disimpan TERUS — tiada JSON.stringify, tidak seperti localStorage). */
export async function simpanCache(kunci, nilai) {
  try {
    await transaksi('readwrite', (s) => s.put({ nilai, masa: Date.now() }, kunci)); // put = insert atau ganti
  } catch (err) {
    console.warn('IndexedDB gagal:', err);
  }
}

/** Kosongkan semua cache layer (butang "Kosongkan cache" dalam UI). */
export async function kosongkanCache() {
  try {
    await transaksi('readwrite', (s) => s.clear());
  } catch {
    /* abaikan */
  }
}
```

```js
// src/ui/lapisan.js — "cache dahulu, rangkaian jika perlu"
import { dapatkanLapisan } from '../services/api.js';
import { dapatkanCache, simpanCache } from '../services/cache.js';

export async function muatLapisan(id) {
  const kunci = `lapisan:${id}`;
  const cache = await dapatkanCache(kunci);
  if (cache) return { fc: cache, dariCache: true };
  const fc = await dapatkanLapisan(id);
  await simpanCache(kunci, fc);
  return { fc, dariCache: false };
}
```

Keputusan ujian (logik yang sama, fake-indexeddb): panggilan 1 → rangkaian; panggilan 2 (1 s kemudian) → cache; selepas 24 jam → rangkaian semula.

**Versi cache.** Jika bentuk data layer berubah (cth server menambah medan wajib), cache lama boleh merosakkan kod baharu. Dua cara mudah: (1) masukkan versi dalam key — `lapisan:v2:sempadan-zon`; atau (2) naikkan `VERSI_DB` dan kosongkan store dalam `onupgradeneeded`.

> 💡 **Menguji TTL tanpa menunggu 24 jam:** jadikan masa sebagai parameter (`sekarang = Date.now()`) atau palsukan `Date.now` dalam ujian (`node:test` menyediakan `mock.timers`). Ini *dependency injection* ringkas — corak yang sama digunakan untuk `ciptaTindakan(store, api)` pada Hari 5.

---

## 5. Draf borang luar talian

```js
// Contoh draf borang — simpan setiap kali pengguna menaip, pulihkan bila halaman dibuka
import { simpanLocal, bacaLocal, buangLocal } from '../services/cache.js';
import { nyahlantun } from './penapis.js'; // debounce — sama seperti carian penapis

const KUNCI_DRAF = 'geolapor:draf-laporan';

export function pasangDraf(borang) {
  // Pulihkan
  const draf = bacaLocal(KUNCI_DRAF);
  if (draf) {
    for (const [nama, nilai] of Object.entries(draf)) {
      const medan = borang.elements.namedItem(nama);
      if (medan) medan.value = nilai;
    }
  }

  // Simpan — nyahlantun (debounce) elak tulis pada setiap ketukan kekunci
  borang.addEventListener(
    'input',
    nyahlantun(() => simpanLocal(KUNCI_DRAF, Object.fromEntries(new FormData(borang))), 400),
  );

  // Pulangkan fungsi padam draf — panggil selepas POST berjaya (201)
  return () => buangLocal(KUNCI_DRAF);
}
```

Untuk **menghantar** laporan ketika luar talian, simpan dalam store IndexedDB `antrian` dan cuba hantar semula bila `window.addEventListener('online', …)`. (Konsep sahaja dalam kursus — penyegerakan sebenar memerlukan pengendalian konflik.)

---

## 6. Cache API (sebutan)

Cache API menyimpan pasangan **Request/Response** — digunakan oleh **Service Worker** untuk membina PWA yang berfungsi luar talian (cache HTML, JS, tile peta).

```js
const cache = await caches.open('geolapor-v1');
await cache.add('/data/sempadan-zon.geojson');          // fetch + simpan
const res = await cache.match('/data/sempadan-zon.geojson');
const fc = res ? await res.json() : null;
```

Service Worker dan strategi cache (*cache-first*, *network-first*, *stale-while-revalidate*) di luar skop 5 hari — tetapi inilah langkah seterusnya jika aplikasi lapangan perlu berfungsi sepenuhnya tanpa rangkaian.

---

## 7. Kuota & pengusiran

```js
if (navigator.storage?.estimate) {
  const { usage, quota } = await navigator.storage.estimate();
  console.log(`Guna ${(usage / 1e6).toFixed(1)} MB daripada ~${(quota / 1e6).toFixed(0)} MB`);
}
// Minta supaya data tidak diusir secara automatik (browser mungkin tolak/tanya pengguna)
await navigator.storage?.persist?.();
```

- Browser boleh **mengusir** IndexedDB/Cache apabila cakera hampir penuh (kecuali storage "persistent").
- **Mod peribadi/Incognito:** storage wujud tetapi **dipadam** bila tetingkap ditutup; kuota lebih kecil.
- Pengguna boleh *Clear site data* bila-bila masa → kod mesti **sentiasa** boleh berfungsi tanpa cache.

---

## 8. Keselamatan

| Jangan simpan | Kenapa |
|---------------|--------|
| Kata laluan | Mana-mana skrip pada asal yang sama (termasuk skrip XSS atau pustaka pihak ketiga yang terjejas) boleh membaca `localStorage` |
| Token akses jangka panjang / API key sebenar | Sama — dan ia kekal selepas log keluar |
| Data peribadi/terperingkat | Tidak disulitkan pada cakera; komputer kongsi |

Amalan disyorkan:

- Sesi log masuk → **kuki `HttpOnly; Secure; SameSite`** yang ditetapkan server (JavaScript tidak boleh membacanya).
- Jika terpaksa guna token dalam JS (SPA + SSO), simpan **dalam ingatan** (variable) dan perbaharui dengan kuki refresh `HttpOnly`.
- Padam storage berkaitan pengguna semasa log keluar.
- Key `latihan-pgn-2026` dalam kursus ialah key **palsu** untuk mock API — itu satu-satunya sebab ia boleh berada dalam kod frontend.
- Anggap semua data yang **dibaca** dari storage sebagai **tidak dipercayai** (boleh diubah dalam DevTools) — sahkan sebelum guna, jangan masukkan ke `innerHTML`.

---

## ⚠️ Kesilapan lazim

| Simptom | Punca | Pembetulan |
|---------|-------|------------|
| Nilai jadi `'[object Object]'` | `setItem` objek tanpa `JSON.stringify` | Guna `simpanLocal()`/`bacaLocal()` |
| `'5' + 1 = '51'` | Nombor disimpan sebagai string | `JSON.parse` atau `Number()` |
| Aplikasi ranap pada muat awal: `Unexpected token` | Data rosak dalam storage | `try/catch` di sekitar `JSON.parse` + nilai default |
| `QuotaExceededError` | GeoJSON besar dalam localStorage | Pindah ke IndexedDB |
| UI tersekat seketika bila simpan | `localStorage` sync + data besar | IndexedDB (async) |
| Store IndexedDB "tidak wujud" | Cuba `createObjectStore` di luar `onupgradeneeded`, atau versi DB tidak dinaikkan selepas ubah skema | Naikkan nombor versi dalam `indexedDB.open` |
| Data layer lama walaupun server sudah dikemas kini | Tiada TTL/versi | Simpan `masa`; semak TTL semasa baca; versi dalam key; butang `kosongkanCache()` |
| `localStorage.clear()` memadam data aplikasi lain | Semua aplikasi `localhost:5173` berkongsi asal | Awalan key + padam key sendiri sahaja |
| Draf muncul semula selepas berjaya hantar | Draf tidak dipadam | Panggil fungsi padam selepas 201 |

---

## Rujukan rasmi

- MDN — Web Storage API: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API> · `localStorage`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage>
- MDN — IndexedDB API: <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API> · Menggunakan IndexedDB: <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB>
- MDN — Kuota & pengusiran storage: <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria> · `StorageManager.estimate()`: <https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate> · `persist()`: <https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist>
- MDN — Cache API: <https://developer.mozilla.org/en-US/docs/Web/API/Cache>
- idb-keyval: <https://github.com/jakearchibald/idb-keyval>
- OWASP — HTML5 Security Cheat Sheet (Local Storage): <https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html>

## Digunakan pada Hari N

- **Hari 4 (utama)** — S4 Browser Storage: `bacaLocal`/`simpanLocal`, `dapatkanCache`/`simpanCache` + `muatLapisan`, draf borang (§3–§5).
- **Hari 5** — S1: penapis boleh diingat (bersama URL state, nota 13); S3: senarai semak keselamatan (§8).
