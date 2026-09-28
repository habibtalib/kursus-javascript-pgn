# Borang Penilaian Kendiri — Sebelum & Selepas Kursus

[← Indeks docs](./README.md) · [Jadual & objektif](../JADUAL.md) · [Rubrik projek akhir](./rubrik-projek-akhir.md)

> **Untuk kegunaan peribadi anda.** Borang ini **bukan** penilaian rasmi dan tidak dihantar kepada penganjur (kecuali anda memilih untuk berkongsi dengan jurulatih). Borang **penilaian kursus rasmi** diedarkan oleh penganjur pada akhir Hari 5.
>
> **Cara guna:**
> 1. **Sebelum Hari 1** (atau 9.00 pagi Hari 1): isi lajur **Sebelum** untuk semua baris (±10 minit). Jujur. Markah rendah pada awal kursus adalah **dijangka**.
> 2. **Setiap petang**: isi lajur **Selepas** untuk hari tersebut, dan tulis **bukti** (fail/fungsi yang anda tulis sendiri).
> 3. **Hari 5, selepas demo**: semak semula semua baris. Baris dengan **Selepas ≤ 2** menjadi senarai ulang kaji anda.
>
> Salin fail ini ke folder peribadi (cth `nota-saya/penilaian-kendiri.md`) sebelum mengisi.

---

## Skala 1–5

| Skala | Maksud | Contoh bagi "menulis `fetch` POST" |
|-------|--------|------------------------------------|
| **1** | Belum pernah dengar / tidak faham istilah | "Apa itu POST?" |
| **2** | Faham konsep apabila diterangkan, tetapi belum boleh buat | Faham POST menghantar data, tetapi tidak tahu sintaks |
| **3** | Boleh buat **dengan merujuk** nota/contoh | Salin corak dari nota, ubah suai, dan berjaya |
| **4** | Boleh buat **sendiri** tanpa rujukan & boleh membaiki error biasa | Tulis `fetch` POST + semak `res.ok` + kendali 422 tanpa melihat nota |
| **5** | Boleh **menerangkan kenapa** & mengajar rakan / memilih antara alternatif | Terangkan kenapa `fetch` tidak reject untuk 422 dan bila guna `Promise.allSettled` |

---

## Hari 1 — Modern JavaScript (ES6+) Core Syntax

| Kod | Saya boleh… | Sebelum | Selepas | Bukti / nota |
|-----|-------------|:-------:|:-------:|--------------|
| H1-S1a | Membezakan `var` / `let` / `const` dan memilih yang betul | | | |
| H1-S1b | Mengenal pasti jenis data (string, number, boolean, array, object, null, undefined) dan menggunakan `typeof` | | | |
| H1-S1c | Menerangkan scope blok vs fungsi dan hoisting | | | |
| H1-S1d | Menulis kawalan aliran (`if/else`, `switch`) dan loop (`for`, `for…of`, `while`, `do…while`) | | | |
| H1-S2a | Menggunakan template literal | | | |
| H1-S2b | Menulis fungsi (deklarasi, ungkapan, arrow) dengan default parameter & rest | | | |
| H1-S2c | Menerangkan dan menggunakan closure | | | |
| H1-S3a | Menggunakan destructuring objek & array (termasuk `feature.properties`, `geometry.coordinates`) | | | |
| H1-S3b | Menggunakan spread/rest, `?.`, `??` dan perbandingan ketat `===` | | | |
| H1-S4a | Menggunakan `map` / `filter` / `reduce` / `find` / `some` / `sort` atas `features` | | | |
| H1-S4b | Menukar data dengan `JSON.parse` / `JSON.stringify` | | | |
| H1-S4c | Menulis dan mengimport modul ES (`export` / `import`), contohnya `utils/geo.js` | | | |

## Hari 2 — Asynchronous JavaScript & Web API Integration

| Kod | Saya boleh… | Sebelum | Selepas | Bukti / nota |
|-----|-------------|:-------:|:-------:|--------------|
| H2-S1a | Menerangkan call stack, event loop, task vs microtask | | | |
| H2-S1b | Menerangkan callback dan masalah *callback hell* | | | |
| H2-S1c | Menerangkan HTTP, REST, method, kod status dan JSON | | | |
| H2-S2a | Mencipta dan chain Promise (`then` / `catch` / `finally`) | | | |
| H2-S2b | Memilih antara `Promise.all` / `allSettled` / `race` / `any` | | | |
| H2-S3a | Menulis `async/await` dengan `try…catch…finally` | | | |
| H2-S3b | Membezakan pelaksanaan parallel vs sequential | | | |
| H2-S4a | Menggunakan `fetch` untuk GET / POST / PATCH / DELETE dengan header & badan JSON | | | |
| H2-S4b | Mengendali status HTTP (401, 404, 422, 500) dan network error | | | |
| H2-S4c | Membatalkan request dengan `AbortController` / timeout | | | |
| H2-S4d | Menguji API dengan `curl` / Thunder Client / REST Client | | | |

## Hari 3 — DOM Manipulation & Event Handling

| Kod | Saya boleh… | Sebelum | Selepas | Bukti / nota |
|-----|-------------|:-------:|:-------:|--------------|
| H3-S1a | Memilih elemen (`getElementById`, `querySelector(All)`) dan merentas pokok DOM | | | |
| H3-S2a | Mencipta/mengubah elemen, atribut, kelas dan gaya | | | |
| H3-S2b | Memaparkan data API **dengan selamat** (`textContent` / `createElement`, bukan `innerHTML`) | | | |
| H3-S2c | Memaparkan peta Leaflet, marker, popup dan `L.geoJSON` | | | |
| H3-S3a | Mengendali `click` / `change` / `input` / `keyup` dan delegasi event | | | |
| H3-S3b | Mengendali event peta (klik peta → isi koordinat; klik senarai → zum) | | | |
| H3-S4a | Membina borang dengan validasi asas & `FormData`, kemudian POST JSON | | | |
| H3-S4b | Memaparkan error validasi 422 per medan | | | |

## Hari 4 — Web Development Tooling & Ecosystem

| Kod | Saya boleh… | Sebelum | Selepas | Bukti / nota |
|-----|-------------|:-------:|:-------:|--------------|
| H4-S1a | Menggunakan npm (`init`, `install`, `ci`, scripts) dan membaca semver & lockfile | | | |
| H4-S2a | Mencipta projek Vite, menjalankan dev server dan build produksi | | | |
| H4-S2b | Menggunakan `import.meta.env` (`VITE_API_URL`) | | | |
| H4-S2c | Membaca Shapefile / KML / KMZ / GeoPackage ke GeoJSON | | | |
| H4-S2d | Mengeksport GeoJSON / KML / Shapefile | | | |
| H4-S2e | Menukar projection EPSG:3375 ↔ EPSG:4326 dengan proj4 | | | |
| H4-S2f | Membaca metadata GeoTIFF / LAS (saiz, bbox, bilangan titik) dan menerangkan pilihan untuk ECW | | | |
| H4-S3a | Mengkonfigur ESLint (flat config) + Prettier dan membaiki amaran | | | |
| H4-S4a | Menggunakan `localStorage` / `sessionStorage` dan menerangkan hadnya | | | |
| H4-S4b | Menggunakan IndexedDB untuk cache layer GeoJSON | | | |

## Hari 5 — State Management & Modern Frontend Architecture

| Kod | Saya boleh… | Sebelum | Selepas | Bukti / nota |
|-----|-------------|:-------:|:-------:|--------------|
| H5-S1a | Menerangkan kenapa aplikasi memerlukan *single source of truth* | | | |
| H5-S1b | Membina store pub/sub (`ciptaStore` → `dapat` / `set` / `langgan`) dengan kemas kini immutable | | | |
| H5-S1c | Mengira keadaan terbitan (senarai ditapis, statistik) dan tidak menyimpannya | | | |
| H5-S1d | Menyegerakkan peta + senarai + penapis, dan menyimpan penapis dalam URL (`URLSearchParams`) | | | |
| H5-S1e | Melaksanakan optimistic update dengan rollback apabila API gagal | | | |
| H5-S2a | Menyusun aplikasi kepada layer UI · state · service · util dengan arah dependency yang betul | | | |
| H5-S2b | Meningkatkan prestasi peta (clustering, `simplify`, muat ikut `bbox`, debounce) | | | |
| H5-S2c | Menerangkan secara ringkas React / Vue / Svelte / Node.js dan bila memilihnya | | | |
| H5-S2d | Menerangkan cara menyepadukan peta JS dengan sistem sedia ada (WMS/WFS GeoServer, auth, CORS/proksi) | | | |
| H5-S3a | Menggunakan DevTools (Console, breakpoint, Sources, Network) untuk mencari punca pepijat | | | |
| H5-S3b | Mencipta custom error dan global error handler | | | |
| H5-S3c | Menulis ujian ringkas dengan `node --test` | | | |
| H5-S3d | Menyemak kod dengan senarai semak kod bersih & keselamatan | | | |
| H5-S3e | Mendemokan GeoLapor dan menerangkan kod saya sendiri | | | |

---

## Ringkasan diri

| Benang kursus | Purata Sebelum | Purata Selepas | Perubahan |
|---------------|:--------------:|:--------------:|:---------:|
| Asas & JS moden (H1) | | | |
| Async & **API** (H2) | | | |
| DOM, borang & peta (H3) | | | |
| Tooling & **format geospatial** (H4) | | | |
| State, arkitektur & amalan terbaik (H5) | | | |

---

## Soalan refleksi (isi pada Hari 5)

1. Tiga perkara yang saya **boleh buat sekarang** tetapi tidak boleh pada Isnin lalu:
   - …
2. Satu konsep yang paling **sukar** dan apa yang akhirnya membantu saya faham:
   - …
3. Satu sistem / tugasan di tempat kerja (PGN) yang boleh saya **perbaiki** dengan apa yang dipelajari (cth memaparkan layer GeoServer dalam aplikasi web, mengautomasikan penukaran format, membina borang laporan lapangan):
   - …
4. Tiga baris dengan skor **Selepas ≤ 2** yang akan saya ulang kaji dalam 2 minggu akan datang, dan nota yang akan saya rujuk:
   - … → [`nota/…`](../nota/README.md)
5. Satu langkah seterusnya dalam pembelajaran saya (cth TypeScript, satu framework, Node.js backend, OpenLayers/MapLibre, ujian automatik):
   - …

---

## Petua untuk borang penilaian kursus rasmi (penganjur)

Maklum balas anda membantu penganjur dan jurulatih memperbaiki kursus akan datang. Supaya komen anda **berguna**:

- **Spesifik:** "Lab 2.4 (fetch POST) terlalu singkat. Perlukan 15 minit lagi" lebih membantu daripada "masa tidak cukup".
- **Rujuk sesi/hari** menggunakan kod di atas (cth H4-S2c).
- **Nyatakan apa yang berkesan**, bukan hanya apa yang perlu diubah. Ini memastikan perkara baik dikekalkan.
- **Relevan dengan kerja:** nyatakan topik yang paling berguna untuk tugasan PGN anda (API, peta, format fail…), dan topik yang ingin didalami dalam kursus lanjutan.
- Kemudahan (bilik, rangkaian, peralatan) dinilai berasingan daripada kandungan.
