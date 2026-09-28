# JADUAL — Aturcara Kursus Pengaturcaraan JavaScript (PGN)

> **Tarikh:** 28 Sep – 2 Okt 2026 · **Tempat:** Bilik Latihan KBS, Aras 14
> Masa & tajuk sesi ikut aturcara rasmi. Lajur "Objektif" dan "Benang tambahan" ialah perincian kursus.

## Hari 1 — Modern JavaScript (ES6+) Core Syntax (6 jam 30 minit) · [nota](./hari-1/README.md)

| Masa | Sesi | Aktiviti | Objektif (peserta boleh…) | Benang tambahan |
|------|------|----------|---------------------------|-----------------|
| 9.00 – 11.00 pagi | S1 | Variable Management & Scope | Membezakan `var`/`let`/`const`, jenis data, block/function scope & hoisting; menulis kawalan aliran & loop | Objek laporan & GeoJSON pertama |
| 11.00 – 1.00 tgh | S2 | Modern Strings & Functions | Menggunakan template literal; menulis fungsi (deklarasi, ungkapan, arrow), default parameter, rest, closure | Fungsi `formatKoordinat()`, `jarakKm()` |
| 1.00 – 2.30 ptg | — | Makan tengah hari | | |
| 2.30 – 3.30 ptg | S3 | Destructuring & Operators | Menggunakan destructuring, spread/rest, `?.`, `??`, perbandingan ketat | Destructuring `feature.properties` & `geometry.coordinates` |
| 3.30 – 5.00 ptg | S4 | Modern Array Methods & ES Modules | Menggunakan `map/filter/reduce/find/some/sort`; `JSON.parse/stringify`; `import/export` | Modul `utils/geo.js` atas FeatureCollection |

## Hari 2 — Asynchronous JavaScript & Web API Integration (6 jam 30 minit) · [nota](./hari-2/README.md)

| Masa | Sesi | Aktiviti | Objektif | Benang tambahan |
|------|------|----------|----------|-----------------|
| 9.00 – 11.00 pagi | S1 | Asynchronous Programming Concepts | Menerangkan call stack, event loop, task/microtask; callback & callback hell | Mock API dihidupkan; HTTP, REST, JSON |
| 11.00 – 1.00 tgh | S2 | Promise Handling | Mencipta & chain Promise; `Promise.all/allSettled/race/any` | Muat 3 layer GeoJSON serentak |
| 1.00 – 2.30 ptg | — | Makan tengah hari | | |
| 2.30 – 3.30 ptg | S3 | Async / Await Syntax | Menulis `async/await` dengan `try…catch…finally`; parallel vs sequential | Simulasi `?lambat=` & `?gagal=` |
| 3.30 – 5.00 ptg | S4 | Fetch API Integration | Menggunakan fetch GET/POST/PATCH/DELETE, header, status HTTP, `AbortController`, timeout | **`services/api.js`** lengkap; JSON hantar & terima |

## Hari 3 — JavaScript DOM Manipulation & Event Handling (6 jam 30 minit) · [nota](./hari-3/README.md)

| Masa | Sesi | Aktiviti | Objektif | Benang tambahan |
|------|------|----------|----------|-----------------|
| 9.00 – 11.00 pagi | S1 | DOM Selection & Traversal | Memilih elemen (`getElementById`, `querySelector(All)`) & merentas pokok DOM | Rangka halaman GeoLapor |
| 11.00 – 1.00 tgh | S2 | DOM Element Manipulation | Mencipta/mengubah elemen, atribut, kelas, gaya; render senarai dari data API dengan selamat | Senarai laporan + **peta Leaflet** + `L.geoJSON` |
| 1.00 – 2.30 ptg | — | Makan tengah hari | | |
| 2.30 – 3.30 ptg | S3 | Event Handling | Mengendali `click/change/keyup/input`, delegasi event, event peta | Klik peta → isi koordinat; klik senarai → zum marker |
| 3.30 – 5.00 ptg | S4 | Form Handling | Membina borang dengan validasi asas & `FormData`; POST JSON; papar error 422 | Borang laporan baharu → API → peta dikemas kini |

## Hari 4 — Web Development Tooling & Ecosystem (6 jam 30 minit) · [nota](./hari-4/README.md)

| Masa | Sesi | Aktiviti | Objektif | Benang tambahan |
|------|------|----------|----------|-----------------|
| 9.00 – 11.00 pagi | S1 | Package Management | Menggunakan npm (`init`, `install`, semver, lockfile, scripts) | Pasang leaflet, turf, proj4, shpjs, togeojson, geotiff |
| 11.00 – 1.00 tgh | S2 | Module Bundlers & Build Tools | Mencipta projek Vite, dev server, `import.meta.env`, build produksi | Pindah GeoLapor ke Vite; **baca/tulis format geospatial** |
| 1.00 – 2.30 ptg | — | Makan tengah hari | | |
| 2.30 – 3.30 ptg | S3 | Code Quality & Coding Standards | Mengkonfigur ESLint + Prettier; membaiki amaran; konvensyen penamaan | Lint modul geo & api |
| 3.30 – 5.00 ptg | S4 | Browser Storage | Menggunakan `localStorage`, `sessionStorage`, IndexedDB; had & keselamatan | Cache layer GeoJSON & draf borang luar talian |

## Hari 5 — State Management & Modern Frontend Architecture (5 jam) · [nota](./hari-5/README.md)

| Masa | Sesi | Aktiviti | Objektif | Benang tambahan |
|------|------|----------|----------|-----------------|
| 9.00 – 11.00 pagi | S1 | State Management | Membina store berpusat (pub/sub), aliran data satu hala, keadaan terbitan | State laporan + tapisan + layer peta di-sync |
| 11.00 – 12.30 tgh | S2 | Modern Frontend Architecture | Menyusun aplikasi kepada layer (UI · state · service · util); komponen; gambaran React/Vue/Svelte & Node.js | Clustering, simplify, prestasi peta; MapLibre/OpenLayers |
| 12.30 – 3.00 ptg | — | Makan tengah hari (& solat Jumaat) | | |
| 3.00 – 4.30 ptg | S3 | Best Practices & Conclusion | Menggunakan teknik debugging, `try…catch`, ujian ringkas `node --test`; mendemokan projek | Demo GeoLapor · penilaian · penutup |
