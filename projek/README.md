# Projek GeoLapor — kod kursus

Semua kod yang dijalankan sepanjang Kursus Pengaturcaraan JavaScript (PGN), 28 Sep – 2 Okt 2026. Jadual: [`../JADUAL.md`](../JADUAL.md).

**GeoLapor** = Sistem Laporan Tapak Geospatial (data **sintetik**). Pegawai lapangan menghantar laporan tapak (titik + kategori + catatan); aplikasi memaparkannya di atas peta bersama layer rujukan, dengan tapisan, CRUD melalui API, import/eksport fail geospatial dan statistik.

## Kandungan

| Folder | Apa | Hari | Dependency |
|--------|-----|------|-----------|
| [`api/`](./api/README.md) | Mock REST API (`server.mjs`) — laporan, kategori, layer, statistik; hidang `data/` di `/data/…` | 2–5 | **tiada** (Node built-ins) |
| [`data/`](./data/README.md) | Fail geospatial sampel: GeoJSON, Shapefile (EPSG:3375), GeoPackage, KML/KMZ, GeoTIFF, LAS + skrip jana/semak (`data/jana/`) | 2–5 | `data/jana/` sahaja |
| `latihan/` | Latihan Hari 1–5 tanpa build (Hari 1–3: HTML + `<script type="module">`; Hari 4–5: logik tulen, jalankan dengan `node` atau di Pelatih) — diselenggara bersama bahan harian | 1–5 | tiada |
| [`geolapor-mula/`](./geolapor-mula/README.md) | **Projek permulaan Hari 4** (Vite): struktur folder + fail rangka dengan `TODO`; memaparkan peta kosong | 4–5 | Vite, Leaflet, Turf, proj4, … |

```text
projek/
├── api/                 server.mjs · reset-data.mjs · data/laporan.json · data/asal/ · data/lapisan/
├── data/                *.geojson *.zip *.gpkg *.kml *.kmz *.tif *.las · jana/ (jana-data.mjs, semak-data.mjs)
├── latihan/             hari-1/ … hari-5/
└── geolapor-mula/       index.html · src/{main.js, services, state, utils, io, ui}
```

## Mula pantas

Keperluan: **Node.js 22 LTS+** dan npm; browser Chrome/Edge terkini. Internet hanya untuk tile peta OSM (lab boleh disiapkan tanpa internet — layer data datang dari mock API tempatan).

```bash
# Terminal 1 — mock API (http://localhost:3000)
cd projek/api
npm start

# Terminal 2 — aplikasi GeoLapor (http://localhost:5173)
cd projek/geolapor-mula
npm install
cp .env.example .env             # VITE_API_URL=http://localhost:3000
npm run dev
```

Perintah lain dalam `geolapor-mula/`:

```bash
npm run build     # bina produksi ke dist/
npm run preview   # hidang dist/ (http://localhost:4173)
npm run lint      # ESLint 9 (flat config)
npm run format    # Prettier 3
```

Selepas demo/latihan yang mengubah data: `cd projek/api && npm run reset-data`.

## Ringkasan seni bina (sasaran Hari 5)

```text
ui/*  ──tindakan──▶  state/tindakan.js ──await──▶ services/api.js ──HTTP──▶ api/server.mjs
  ▲                        │ store.set
  └──── langgan ◀──── state/store.js   (selector: state/pemilih.js · URL: state/url.js)
utils/  geo.js · unjuran.js · analisis.js · masa.js   (fungsi tulen, diuji dengan node --test)
io/     format.js · raster.js · lidar.js               (baca/tulis fail, dimuat dinamik)
```

Nama modul & fungsi yang dikunci (diajar oleh bahan harian): `utils/geo.js` (`formatKoordinat`, `jarakKm`, `tapisLaporan`, `kiraIkut`, `bboxDari`, `dalamMalaysia`), `services/api.js` (`ApiError`, `mintaJson`, `senaraiLaporan`, `dapatkanLaporan`, `ciptaLaporan`, `kemaskiniLaporan`, `padamLaporan`, `senaraiKategori`, `senaraiLapisan`, `dapatkanLapisan`, `dapatkanStatistik`), `state/store.js` (`ciptaStore`), `io/format.js` (`bacaFail`, `eksportGeoJSON`, `eksportKML`, `eksportShapefile`), `utils/unjuran.js` (`RSO_PROJ`, `keWgs84`), `io/raster.js` (`bacaGeoTIFF`), `io/lidar.js` (`bacaLAS`).

## Masalah lazim

| Gejala | Punca / penyelesaian |
|--------|----------------------|
| `EADDRINUSE :3000` | Server lain di port 3000 → hentikannya, atau `PORT=3001 npm start` dan ubah `VITE_API_URL` dalam `.env` |
| Lencana "API: luar talian" | Mock API tidak berjalan, atau `.env` salah — mulakan semula `npm run dev` selepas mengubah `.env` |
| Peta kelabu + amaran tile | Tiada internet — normal di bilik latihan; marker & layer masih berfungsi |
| `npm install` perlahan / gagal | Guna cermin/proksi jabatan; `npm ci` jika `package-lock.json` ada |
| 401 semasa POST/PATCH/DELETE | Header `X-API-Key: latihan-pgn-2026` tiada (`VITE_API_KEY`) |
