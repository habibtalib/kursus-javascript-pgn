# Cheat Sheet JavaScript (ES2024) — satu halaman

[← Indeks docs](./README.md) · [Cheat sheet geospatial](./cheat-sheet-geospatial.md) · [Glosari](./glosari.md) · Nota penuh: [`nota/`](../nota/README.md)

> Cetak dua muka. Contoh menggunakan data **GeoLapor** (sintetik). Ingat: **GeoJSON = `[lng, lat]`**.

## 1. Variable & jenis

| Sintaks | Scope | Boleh tugas semula? | Guna |
|---------|------|---------------------|------|
| `const x = 1` | Blok `{}` | ❌ (tapi isi objek/array boleh diubah) | **Default** |
| `let x = 1` | Blok `{}` | ✅ | Kaunter, nilai yang berubah |
| `var x = 1` | Fungsi (hoisted) | ✅ | ❌ Elak — kod lama sahaja |

| Jenis | Contoh | `typeof` |
|-------|--------|----------|
| string | `'tanah'`, `` `LPR-${n}` `` | `'string'` |
| number | `101.6958`, `NaN`, `Infinity` | `'number'` |
| bigint | `10n` | `'bigint'` |
| boolean | `true` | `'boolean'` |
| undefined | `let a;` | `'undefined'` |
| null | `null` | `'object'` ⚠️ (pepijat sejarah) |
| symbol | `Symbol('id')` | `'symbol'` |
| object / array / function | `{}`, `[]`, `() => {}` | `'object'`, `'object'`, `'function'` → guna `Array.isArray()` |

**Falsy:** `false 0 -0 0n '' null undefined NaN`. Semua nilai lain truthy (termasuk `'0'`, `[]`, `{}`).

## 2. Operator

| Operator | Maksud | Contoh |
|----------|--------|--------|
| `===` / `!==` | Sama ketat (tiada tukaran jenis) — **sentiasa guna** | `'1' === 1 // false` |
| `==` | Sama longgar ❌ | `'1' == 1 // true` |
| `??` | Nilai default jika `null`/`undefined` sahaja | `had ?? 20` (0 kekal 0) |
| `\|\|` | Nilai default jika falsy | `q \|\| 'semua'` |
| `?.` | Optional chaining | `f?.properties?.tajuk` |
| `??=` `\|\|=` `&&=` | Tugasan logik | `opsyen.had ??= 20` |
| `...` | Spread / rest | `{ ...p, status: 'selesai' }` |
| `**` | Kuasa | `2 ** 10` |
| `a ? b : c` | Ternari | `ok ? 'Berjaya' : 'Gagal'` |

## 3. Kawalan aliran & loop

```js
if (status === 'baharu') { … } else if (status === 'selesai') { … } else { … }

switch (kategori) {
  case 'tanah': warna = '#8d6e63'; break;
  case 'utiliti': warna = '#1e88e5'; break;
  default: warna = '#757575';
}

for (let i = 0; i < n; i++) { … }            // indeks
for (const f of features) { … }             // nilai (array, Set, Map, string)
for (const kunci in objek) { … }            // key objek (elak untuk array)
while (syarat) { … }   do { … } while (syarat);
break;  continue;
```

## 4. String

| Method | Hasil |
|--------|-------|
| `` `Laporan ${id}: ${tajuk}` `` | Template literal (berbilang baris dibenarkan) |
| `s.trim()` · `s.toLowerCase()` · `s.toUpperCase()` | Bersih / tukar huruf |
| `s.includes('rosak')` · `s.startsWith('LPR-')` · `s.endsWith('.shp')` | Boolean |
| `s.split(',')` · `arr.join(', ')` | String ↔ array |
| `s.padStart(4, '0')` | `'7'` → `'0007'` |
| `s.replaceAll(' ', '-')` · `s.slice(0, 3)` · `s.at(-1)` | Ganti / potong / aksara terakhir |
| `Number('2.93')` · `parseFloat('2.93abc')` · `n.toFixed(5)` | Nombor ↔ string |

## 5. Array — method paling kerap (atas `fc.features`)

| Method | Pulangkan | Ubah asal? | Contoh |
|--------|-----------|------------|--------|
| `map(fn)` | Array baharu (sama panjang) | ❌ | `features.map(f => f.properties.tajuk)` |
| `filter(fn)` | Array baharu (subset) | ❌ | `features.filter(f => f.properties.status === 'baharu')` |
| `reduce(fn, awal)` | Satu nilai | ❌ | `features.reduce((n, f) => n + 1, 0)` |
| `find(fn)` / `findIndex(fn)` | Item / indeks pertama (`undefined` / `-1`) | ❌ | `features.find(f => f.id === 'LPR-0001')` |
| `some(fn)` / `every(fn)` | Boolean | ❌ | `features.some(f => f.properties.kategori === 'tanah')` |
| `forEach(fn)` | `undefined` | ❌ | Kesan sampingan sahaja (log, DOM) |
| `includes(x)` | Boolean | ❌ | `['baharu','selesai'].includes(status)` |
| `toSorted(fn)` / `sort(fn)` | Array tersusun | ❌ / ✅ | `features.toSorted((a, b) => a.properties.dicipta.localeCompare(b.properties.dicipta))` |
| `toReversed()` · `toSpliced()` · `with(i, v)` | Salinan baharu (ES2023) | ❌ | Sesuai untuk state immutable |
| `push` · `pop` · `shift` · `unshift` · `splice` | — | ✅ | Elak pada state |
| `slice(a, b)` · `concat()` · `flat()` · `flatMap()` | Array baharu | ❌ | |
| `Object.groupBy(arr, fn)` | Objek kumpulan (ES2024) | ❌ | `Object.groupBy(features, f => f.properties.kategori)` |

## 6. Objek, destructuring, spread

```js
const { id, properties: { tajuk, status = 'baharu' } } = feature;   // destructuring bersarang + default
const [lng, lat] = feature.geometry.coordinates;                    // ⚠️ lng dahulu!
const { kategori, ...lain } = feature.properties;                   // rest
const baharu = { ...feature.properties, status: 'selesai' };        // salinan cetek + ubah
Object.keys(o)  Object.values(o)  Object.entries(o)  Object.fromEntries(pasangan)
structuredClone(o)                                                  // salinan dalam
```

## 7. Fungsi

```js
function jumlah(a, b = 0) { return a + b; }          // deklarasi (hoisted), default parameter
const kuasaDua = (x) => x * x;                         // arrow — pulang tersirat
const buatObj = (id) => ({ id });                      // pulangkan objek: bungkus dengan ()
const semua = (...nombor) => nombor.length;            // rest
function pembilang() { let n = 0; return () => ++n; }  // closure
```

## 8. Modul ES

```js
// utils/geo.js
export function jarakKm(a, b) { … }        // named export
export default ciptaPeta;                  // default export (satu sahaja)
// main.js
import { jarakKm, tapisLaporan } from './utils/geo.js';   // sambungan .js WAJIB tanpa bundler
import ciptaPeta from './ui/peta.js';
```

HTML: `<script type="module" src="./main.js"></script>`. Modul: `defer` automatik, *strict mode*, scope sendiri, dan **tidak berfungsi dari `file://`** (guna Live Server/Vite).

## 9. Async, Promise & fetch (corak GeoLapor)

```js
// services/api.js — corak ringkas mintaJson
export async function mintaJson(laluan, { method = 'GET', body, signal, timeoutMs = 8000 } = {}) {
  const res = await fetch(`${BASE}${laluan}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'latihan-pgn-2026' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ?? AbortSignal.timeout(timeoutMs),
  });
  if (res.status === 204) return null;                    // DELETE berjaya — tiada badan
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.ralat ?? res.statusText, res.status, data?.medan);
  return data;                                            // ⚠️ fetch TIDAK reject untuk 4xx/5xx
}
```

| Promise | Selesai apabila | Gagal apabila |
|---------|-----------------|---------------|
| `Promise.all([...])` | Semua berjaya → array hasil | **Satu** gagal |
| `Promise.allSettled([...])` | Semua selesai → `{status, value/reason}` | Tidak pernah |
| `Promise.race([...])` | Yang pertama selesai (berjaya/gagal) | Yang pertama gagal |
| `Promise.any([...])` | Yang pertama berjaya | Semua gagal (`AggregateError`) |

```js
const [zon, sungai] = await Promise.all([dapatkanLapisan('sempadan-zon'), dapatkanLapisan('sungai')]);
```

## 10. DOM & event

| Tugas | Kod |
|-------|-----|
| Pilih | `document.getElementById('senarai')` · `document.querySelector('#borang input[name=tajuk]')` · `querySelectorAll('.kad')` |
| Cipta dengan selamat | `const li = document.createElement('li'); li.textContent = tajuk; ul.append(li);` |
| ❌ Bahaya | `ul.innerHTML = `<li>${tajuk}</li>`` → XSS jika `tajuk` dari pengguna |
| Atribut / data | `el.setAttribute('aria-busy', 'true')` · `el.dataset.id = 'LPR-0001'` |
| Kelas / gaya | `el.classList.add('aktif')` · `toggle('tersembunyi', syarat)` · `el.style.color = 'red'` |
| Kosongkan | `ul.replaceChildren()` |
| Event | `btn.addEventListener('click', (e) => { … })` |
| Delegasi | `ul.addEventListener('click', (e) => { const li = e.target.closest('li[data-id]'); if (li) pilih(li.dataset.id); })` |
| Borang | `borang.addEventListener('submit', (e) => { e.preventDefault(); const data = Object.fromEntries(new FormData(borang)); })` |
| Event lazim | `click` `input` `change` `keyup` `submit` `DOMContentLoaded` |

## 11. Browser storage

| API | Saiz | Tamat | Guna |
|-----|------|-------|------|
| `localStorage` | ~5 MB, string sahaja | Kekal | Keutamaan UI, draf borang kecil |
| `sessionStorage` | ~5 MB, string sahaja | Tab ditutup | Keadaan sementara tab |
| IndexedDB | Besar (kuota browser), objek & Blob | Kekal | Cache layer GeoJSON besar |

```js
localStorage.setItem('penapis', JSON.stringify({ kategori: 'tanah' }));
const penapis = JSON.parse(localStorage.getItem('penapis') ?? '{}');
```

⚠️ Jangan simpan token/kata laluan dalam `localStorage` (boleh dibaca oleh sebarang skrip XSS).

## 12. Error & debugging

```js
class ApiError extends Error {
  constructor(mesej, status, medan) { super(mesej); this.name = 'ApiError'; this.status = status; this.medan = medan; }
}
try { await ciptaLaporan(data); }
catch (err) { if (err instanceof ApiError && err.status === 422) paparRalat(err.medan); else throw err; }
finally { butang.disabled = false; }

window.addEventListener('error', (e) => console.error('Ralat global:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Promise tidak ditangkap:', e.reason));
```

| Alat | Guna |
|------|------|
| `console.log / info / warn / error` | Log bertahap |
| `console.table(features.map(f => f.properties))` | Papar array objek sebagai jadual |
| `console.group('Muat')` … `console.groupEnd()` | Kumpul log |
| `console.time('render')` … `console.timeEnd('render')` | Ukur masa |
| `console.assert(dalamMalaysia(c), 'Koordinat terbalik?', c)` | Log hanya jika syarat palsu |
| `debugger;` | Titik henti dalam kod (DevTools mesti dibuka) |
| DevTools **Sources** | Breakpoint, *step over/into*, *watch*, *call stack* |
| DevTools **Network** | Status, header, badan request/response, *throttling* |
| `node --test` | Jalankan fail `*.test.js` (ujian unit tanpa pustaka) |
