# Nota Topikal — Kursus Pengaturcaraan JavaScript (PGN)

> Nota mendalam yang dirujuk **merentas hari**. `hari-N/README.md` memberi ringkasan konsep bagi setiap sesi; folder ini pula menerangkan **kenapa** sesuatu corak digunakan, dengan kod beranotasi, kesilapan lazim dan pautan rasmi.
> Jadual: [`JADUAL.md`](../JADUAL.md) · Dokumen sokongan: [`docs/README.md`](../docs/README.md)

## Cara guna

1. **Sebelum sesi**, baca *Objektif nota* dan bahagian pertama nota bagi hari tersebut (lihat lajur **Hari**). Sepuluh minit sudah memadai.
2. **Semasa lab**, rujuk blok kod beranotasi. Jangan salin buta: baca komen `//` dahulu, kemudian taip sendiri. Jari yang menaip lebih cepat ingat daripada mata yang membaca.
3. **Selepas lab**, semak senarai *⚠️ Kesilapan lazim* terhadap kod anda sendiri. Kebanyakan pepijat peserta kursus lepas ada dalam senarai itu.
4. **Ragu tentang nama endpoint atau medan API?** [`projek/api/README.md`](../projek/api/README.md) menang.
5. Semua contoh menggunakan domain **GeoLapor** (laporan tapak sintetik sekitar Putrajaya/Cyberjaya) dan **mock API** `http://localhost:3000`. Tiada data PGN/JUPEM sebenar.

## Indeks

| # | Fail | Topik | Hari |
|---|------|-------|------|
| 01 | [`01-asas-javascript.md`](./01-asas-javascript.md) | Cara JS berjalan dalam browser, `<script>` (`defer`/`module`), jenis data, operator, `==` vs `===`, truthy/falsy, `if`/`switch`, loop | 1 |
| 02 | [`02-fungsi-skop-closure.md`](./02-fungsi-skop-closure.md) | Deklarasi vs ungkapan vs arrow function, default parameter & rest, scope blok/fungsi, hoisting, TDZ, closure, `this` | 1 |
| 03 | [`03-es6-moden.md`](./03-es6-moden.md) | Template literal, destructuring, spread/rest, `?.`, `??`, `??=`, ES Modules (`import`/`export`) | 1, 4 |
| 04 | [`04-array-objek-json.md`](./04-array-objek-json.md) | Objek & array, `map`/`filter`/`reduce`/`find`/`some`/`sort`, salinan tidak boleh ubah, `JSON.parse`/`stringify`, GeoJSON sebagai objek JS | 1, 2 |
| 05 | [`05-async-promise-await.md`](./05-async-promise-await.md) | Event loop, microtask vs task, callback → Promise → `async`/`await`, `Promise.all/allSettled/race/any`, `AbortController` | 2 |
| 06 | [`06-http-rest-fetch.md`](./06-http-rest-fetch.md) | HTTP & REST, kod status, header, CORS & preflight, corak auth, pagination, taksonomi error → `ApiError`, retry, menguji API (curl, Postman, Thunder Client, `.http`) | 2 → 5 |
| 07 | [`07-dom-event-borang.md`](./07-dom-event-borang.md) | Pemilihan & perentasan DOM, `textContent` vs `innerHTML` (XSS), `createElement`, event delegation, `FormData`, validasi, paparan error 422 | 3 |
| 08 | [`08-web-mapping-leaflet.md`](./08-web-mapping-leaflet.md) | Web mapping dengan Leaflet: tile, CRS, OGC WMS/WMTS/WFS, GeoServer, Leaflet vs MapLibre vs OpenLayers vs ArcGIS, adaptasi ke sistem sedia ada | 3, 5 |
| 09 | [`09-format-data-geospatial.md`](./09-format-data-geospatial.md) | Format data geospatial: Shapefile, GeoPackage, GeoJSON, GeoTIFF, ECW, KML/KMZ, LAS/LAZ (+ COG, FlatGeobuf, PMTiles…), pustaka JS, GDAL, CRS Malaysia | 4 |
| 10 | [`10-analisis-ruang-turf.md`](./10-analisis-ruang-turf.md) | Analisis ruang dengan Turf.js: jarak, buffer, titik-dalam-poligon, bbox, simplify | 4, 5 |
| 11 | [`11-tooling-npm-vite-eslint.md`](./11-tooling-npm-vite-eslint.md) | Tooling: npm, semver, lockfile, Vite, `import.meta.env`, ESLint 9 flat config, Prettier | 4 |
| 12 | [`12-storan-pelayar.md`](./12-storan-pelayar.md) | Browser storage: `localStorage`, `sessionStorage`, IndexedDB, had & keselamatan | 4 |
| 13 | [`13-state-dan-arkitektur.md`](./13-state-dan-arkitektur.md) | State & arkitektur: store pub/sub, kemas kini tidak boleh ubah, selector, layer UI/state/service/util | 5 |
| 14 | [`14-debugging-dan-amalan-terbaik.md`](./14-debugging-dan-amalan-terbaik.md) | Debugging & amalan terbaik: console, breakpoint, DevTools, `try…catch`, custom error, `node --test`, senarai semak | 1, 2, 5 |

## Peta nota ikut hari

> Di Pelatih, nota utama setiap hari (dan nota 10 pada Hari 4) dipaparkan pada halaman Hari di bawah **Nota & panduan** melalui `hari-N/HANDOUT.md`.

| Hari | Tema aturcara | Nota utama | Nota sokongan |
|------|---------------|-----------|---------------|
| 1 | Modern JavaScript (ES6+) Core Syntax | [01](./01-asas-javascript.md) (S1), [02](./02-fungsi-skop-closure.md) (S1–S2), [03](./03-es6-moden.md) (S2–S4), [04](./04-array-objek-json.md) (S4) | [14](./14-debugging-dan-amalan-terbaik.md) (console asas) |
| 2 | Asynchronous JavaScript & Web API Integration | [05](./05-async-promise-await.md) (S1–S3), [06](./06-http-rest-fetch.md) (S1, S4) | [04](./04-array-objek-json.md) (JSON), [14](./14-debugging-dan-amalan-terbaik.md) (`try…catch`, tab Network) |
| 3 | JavaScript DOM Manipulation & Event Handling | [07](./07-dom-event-borang.md) (S1–S4), [08](./08-web-mapping-leaflet.md) (S2–S3) | [06](./06-http-rest-fetch.md) (POST + 422) |
| 4 | Web Development Tooling & Ecosystem | [11](./11-tooling-npm-vite-eslint.md) (S1–S3), [09](./09-format-data-geospatial.md) (S2), [12](./12-storan-pelayar.md) (S4) | [10](./10-analisis-ruang-turf.md), [03](./03-es6-moden.md) (ES Modules) |
| 5 | State Management & Modern Frontend Architecture | [13](./13-state-dan-arkitektur.md) (S1–S2), [14](./14-debugging-dan-amalan-terbaik.md) (S3) | [08](./08-web-mapping-leaflet.md) (prestasi peta, WMS/WFS), [10](./10-analisis-ruang-turf.md) (simplify), [06](./06-http-rest-fetch.md) (retry, optimistic update) |

## Format setiap nota

Setiap fail mempunyai struktur yang sama supaya mudah diimbas:

- **Objektif nota** — 3–5 perkara yang anda patut boleh *lakukan* selepas membaca (kata kerja boleh diukur: menulis, menerangkan, membezakan, membaiki).
- **Konsep + KENAPA** — setiap bahagian bermula dengan masalah yang diselesaikan, kemudian barulah sintaks. Kod beranotasi, jadual perbandingan, dan rajah Mermaid jika membantu.
- **💡 Tip** — pintasan dan tabiat yang menjimatkan masa.
- **⚠️ Kesilapan lazim** — pepijat yang paling kerap dilihat jurulatih, dengan cara mengesan dan membaikinya.
- **Rujukan rasmi** — MDN, spesifikasi, dan dokumentasi pustaka. Pautan disemak sebelum kursus.
- **Digunakan pada Hari N** — sesi aturcara di mana nota ini dipakai.

## Konvensyen dalam nota

| Konvensyen | Maksud |
|------------|--------|
| `[lng, lat]` | Susunan koordinat **GeoJSON** (longitud dahulu). Leaflet guna `[lat, lng]` — sentiasa semak! |
| `LPR-0001` | ID laporan sintetik yang dijana mock API |
| `pegawai1@latihan.test` | E-mel sintetik; domain `.test` dikhaskan dan tidak akan wujud di Internet |
| `latihan-pgn-2026` | API key **latihan** untuk mock API sahaja — bukan corak untuk sistem sebenar (lihat [06](./06-http-rest-fetch.md)) |
| `// →` | Output yang dijangka dalam console |
| `// ❌` / `// ✅` | Contoh salah / betul |

> **Prosa Bahasa Melayu, kod English.** Nama fungsi projek (cth `tapisLaporan`, `mintaJson`) dalam BM kerana ia domain kita; keyword, API browser dan istilah teknikal kekal English supaya anda boleh mencarinya di MDN dan Stack Overflow.
