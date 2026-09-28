# Glosari EN ↔ BM

[← Indeks docs](./README.md) · [Cheat sheet JS](./cheat-sheet-js.md) · [Cheat sheet geospatial](./cheat-sheet-geospatial.md)

> Nota kursus ditulis dalam Bahasa Melayu, tetapi **istilah teknikal diguna dalam English** ("Manglish industri"): *default*, *promise*, *array*, *callback*, *event listener* dan sebagainya, seperti yang developer Malaysia sebut setiap hari dan supaya peserta boleh mencari dokumentasi rasmi. Lajur Bahasa Melayu hanyalah gloss untuk rujukan jika anda terjumpa istilah BM di tempat lain; nota kursus tidak menggunakannya. Nama dalam kod GeoLapor (`ciptaStore`, `langgan`, `tapisLaporan`…) sengaja dalam BM supaya jelas mana kod **kita** dan mana API **pustaka**.
> Susunan: abjad ikut istilah English.

| English | Bahasa Melayu (gloss) | Contoh / konteks dalam kursus |
|---------|-----------------------|-------------------------------|
| annotation | anotasi | Komen `//` yang menerangkan kod |
| API key | kunci API | `X-API-Key: latihan-pgn-2026` (latihan sahaja) |
| argument | argumen | Nilai yang dihantar semasa memanggil fungsi: `jarakKm(a, b)` |
| array | tatasusunan | `fc.features` ialah array |
| asynchronous (async) | tak segerak | `async`/`await` |
| attribute | atribut | `el.setAttribute('aria-busy', 'true')`; atribut jadual `.dbf` |
| attribution | atribusi | `© OpenStreetMap contributors` wajib pada peta |
| authentication | pengesahan (identiti) | Siapa anda? (log masuk, token) |
| axis | paksi | Susunan paksi lat/lng |
| body (request/response) | badan (permintaan/respons) | `body: JSON.stringify(data)` |
| bounding box (bbox) | cakupan / kotak sempadan | `[minLng, minLat, maxLng, maxLat]` |
| breakpoint | titik henti | Klik nombor baris dalam DevTools Sources |
| browser storage | storan pelayar | `localStorage`, IndexedDB |
| browser | pelayar | Chrome, Edge |
| buffer | penampan | `turf.buffer(titik, 0.5, { units: 'kilometers' })` |
| bug | pepijat | Koordinat terbalik ialah bug paling lazim |
| bundler | pengikat | Vite (Hari 4) |
| cache | cache | Cache layer GeoJSON dalam IndexedDB |
| chaining | rantaian | `.then().then()`; `?.` |
| component | komponen | Fungsi UI `ui/senarai.js` yang menerima data dan memaparkannya |
| compression | mampatan | LAZ = LAS dimampatkan; ECW = mampatan wavelet |
| console | konsol | `console.table()` |
| constant | pemalar | `const KATEGORI = [...]` |
| control flow | kawalan aliran | `if`, `else`, `switch` |
| coordinate | koordinat | `[lng, lat]` |
| data type | jenis data | string, number, boolean, object… |
| datum | datum | GDM2000 (EPSG:4742), WGS 84 |
| debug | nyahpepijat | DevTools Sources, `debugger;` |
| deep (copy) | dalam (salinan) | `structuredClone(obj)` |
| default | pratetap / nilai lalai | Default parameter `perpuluhan = 5` |
| dependency | kebergantungan | Pakej dalam `package.json` |
| dependency-free | bebas kebergantungan | Mock API guna Node `http` sahaja |
| derived state | keadaan terbitan | Laporan ditapis = `tapisLaporan(laporan, penapis)` |
| destructure / destructuring | nyahstruktur | `const { tajuk } = f.properties` |
| Document Object Model (DOM) | Model Objek Dokumen | `document.querySelector()` |
| element | elemen | `<li>`, `<div>`: nod dalam DOM |
| end-to-end (E2E) | hujung ke hujung | Demo GeoLapor dari borang → API → peta |
| error | ralat | `ApiError` dengan `status` & `medan` |
| event delegation | delegasi event | Satu listener pada `<ul>` untuk semua `<li>` |
| event handler | pengendali event | Fungsi yang dijalankan apabila event berlaku |
| event listener | pendengar (event) | `addEventListener('click', fn)` |
| exception | pengecualian | `throw new ApiError(...)` |
| field | medan | `properties.kategori`; medan borang |
| filter | penapis / tapisan | `?kategori=tanah`; `tapisLaporan()` |
| function signature | tandatangan (fungsi) | `mintaJson(laluan, { method, body, signal, timeoutMs })` |
| geometry | geometri | `feature.geometry` |
| hoisting | angkatan | Deklarasi `var`/`function` dinaikkan ke atas scope |
| hook | cangkuk | React hooks; Git hooks |
| host / hosting | hos / menghoskan | Hos fail statik `projek/data/` |
| immutable | tak boleh ubah | `{ ...s, penapis: {...} }` dan bukan `s.penapis.x = …` |
| latency | kependaman | Simulasi `?lambat=2000` |
| latitude | latitud | Paksi utara-selatan; Malaysia ≈ 0.8–7.5 |
| layer | lapisan | Layer rujukan `sempadan-zon`, `sungai`, `kemudahan` |
| lockfile | fail kunci | `package-lock.json` |
| longitude | longitud | Paksi timur-barat; Malaysia ≈ 99.5–119.5 |
| loop | gelung | `for…of`, `while` |
| map service | perkhidmatan peta | WMS, WFS, WMTS |
| metadata | metadata | Header GeoTIFF / LAS |
| method (HTTP) | kaedah (HTTP) | GET, POST, PATCH, DELETE |
| method (object) | kaedah (objek) | `features.map()` |
| mock API | API olok-olok | `projek/api/server.mjs` |
| module | modul | `utils/geo.js` dengan `export` |
| object | objek | `{ kod, nama, warna }` |
| offline | luar talian | Lab boleh dibuat tanpa internet |
| one-way (unidirectional) data flow | aliran data satu hala | Tindakan → store → UI (Hari 5) |
| operator | operator | `===`, `??`, `?.` |
| package | pakej | `npm install leaflet` |
| pagination | penomboran halaman | `had` (limit) & `mula` (offset) |
| parallel / sequential | selari / bersiri | `Promise.all` vs `await` satu demi satu |
| parser | penghurai | `JSON.parse`, `shpjs` |
| point cloud | titik awan | LAS/LAZ daripada LiDAR |
| projection | unjuran | EPSG:3375 Peninsula RSO |
| publish–subscribe (pub/sub) | penerbitan-langganan | Corak store Hari 5 |
| raster data | data raster | GeoTIFF, ECW: grid piksel |
| reference | rujukan (memori) | Objek baharu = reference baharu → store tahu ada perubahan |
| reproject | unjur semula | `proj4('EPSG:3375', 'EPSG:4326', xy)` |
| request | permintaan | `fetch()` menghantar request HTTP |
| response | respons | `const res = await fetch(url)` |
| rest | sisa | `(...args)`, `const { a, ...lain } = o` |
| return value | nilai pulangan | `return jarak;` |
| ring (polygon) | gelang (poligon) | Ring luar + lubang dalam `Polygon` |
| routing | penghalaan | Laluan `/api/laporan/:id` |
| running project | projek berjalan | GeoLapor, dibina Hari 1–5 |
| scope | skop | Scope blok, fungsi, modul |
| script | skrip | `npm run dev`; `<script type="module">` |
| selector | pemilih | CSS selector; fungsi selector state `pilihLaporanDitapis()` |
| server | pelayan | Mock API di `localhost:3000` |
| service layer | lapisan perkhidmatan | `services/api.js` |
| shallow (copy) | cetek (salinan) | `{ ...obj }` hanya menyalin aras pertama |
| side effect | kesan sampingan | Mengubah DOM, log, `fetch` |
| single source of truth | sumber kebenaran tunggal | Satu store untuk laporan, penapis & pilihan |
| spatial analysis | analisis ruang | Turf.js: buffer, titik dalam poligon |
| spread | sebaran | `[...a, ...b]` |
| state | keadaan | Data semasa aplikasi dalam store |
| status code | kod status | 200, 201, 204, 401, 404, 422, 500 |
| subscribe | langgan | `const nyahlanggan = store.langgan(render)` |
| subscriber | dilanggan / pelanggan | Fungsi yang didaftar melalui `store.langgan(fn)` |
| template literal | templat literal | `` `LPR-${n}` `` |
| tile | jubin | Tile peta 256×256 px `{z}/{x}/{y}` |
| timeout | waktu tamat | `AbortSignal.timeout(8000)` |
| token | token | Bearer token untuk API berpengesahan |
| trade-off | tukar ganti | Kelajuan vs ketepatan `simplify` |
| unit test | ujian unit | `node --test` untuk `utils/geo.js` |
| unsubscribe | nyahlanggan | Fungsi yang dipulangkan oleh `langgan()` |
| upload / download | muat naik / muat turun | Import fail `.zip` Shapefile |
| valid / invalid | sah / tidak sah | 422 Unprocessable Content |
| validation | pengesahan (input) / validasi | 422 dengan `medan` |
| variable | pembolehubah | `let`, `const` |
| vector data | data vektor | Titik, garis, poligon: GeoJSON, Shapefile |
| zoom | zum | `peta.setView([lat, lng], 14)` |

## Singkatan

| Singkatan | Maksud | Nota |
|-----------|--------|------|
| API | Application Programming Interface | Antara muka antara program |
| CORS | Cross-Origin Resource Sharing | Kebenaran browser untuk `fetch` merentas asal |
| CRS | Coordinate Reference System | Sistem rujukan koordinat |
| CRUD | Create, Read, Update, Delete | POST, GET, PATCH, DELETE |
| COG | Cloud Optimized GeoTIFF | GeoTIFF yang boleh dibaca separa melalui HTTP |
| EPSG | *European Petroleum Survey Group*: pendaftaran kod CRS | EPSG:4326, EPSG:3375 |
| GDM2000 | Geocentric Datum of Malaysia 2000 | Datum rasmi Malaysia |
| JSON | JavaScript Object Notation | Format data teks |
| LiDAR | Light Detection and Ranging | Sumber data LAS/LAZ |
| OGC | Open Geospatial Consortium | Badan standard WMS/WFS/GeoPackage |
| RSO | Rectified Skew Orthomorphic | Projection rasmi Semenanjung / Borneo |
| REST | Representational State Transfer | Gaya reka bentuk API berasaskan sumber |
| WMS / WFS / WMTS | Web Map / Feature / Map Tile Service | Perkhidmatan OGC |
| XSS | Cross-Site Scripting | Sebab kita guna `textContent` |
