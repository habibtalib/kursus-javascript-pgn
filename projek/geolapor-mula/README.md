# GeoLapor — projek permulaan (Hari 4)

Rangka Vite 7 untuk memindahkan kerja Hari 1–3 anda ke alat pembangunan moden. Pada mulanya aplikasi **hanya memaparkan peta kosong** — anda mengisi setiap `TODO` mengikut [`hari-4/lab.md`](../../hari-4/lab.md) dan kemudian [`hari-5/lab.md`](../../hari-5/lab.md).

```bash
cd projek/geolapor-mula
npm install              # semua pustaka sudah disenaraikan dalam package.json
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm run dev              # http://localhost:5173
npm run lint             # ESLint 9
npm run format           # Prettier 3
npm run build && npm run preview
```

**Windows (PowerShell):**

```powershell
cd projek/geolapor-mula
npm install
Copy-Item .env.example .env
npm run dev
npm run lint
npm run format
npm run build; if ($LASTEXITCODE -eq 0) { npm run preview }
```

Pastikan mock API berjalan dalam terminal lain: `cd projek/api && npm start`.

## Struktur

```text
index.html               susun atur penuh: #peta #penapis #senarai #borang #statistik #notis #panel-fail …
src/
├── main.js              titik masuk — senarai TODO ikut sesi [H4-S1 … H5-S1]
├── style.css            gaya siap (tidak perlu diubah)
├── ui/peta.js           ✅ ciptaPeta() SIAP · TODO lukisLaporan, paparGeoJSON
├── ui/senarai.js        TODO renderSenarai (dari Hari 3)
├── ui/borang.js         TODO sediakanBorang, isiKoordinat (dari Hari 3)
├── ui/penapis.js        TODO sediakanPenapis
├── ui/statistik.js      TODO renderStatistik
├── ui/notis.js          TODO paparNotis
├── utils/geo.js         TODO — salin modul Hari 1 anda (nama fungsi ikut fail rangka)
├── utils/unjuran.js     ✅ RSO_PROJ diberi · TODO keWgs84
├── services/api.js      TODO — salin modul Hari 2 anda (URL dari import.meta.env)
├── services/cache.js    TODO [H4-S4] localStorage & IndexedDB
├── io/format.js         TODO bacaFail, eksportGeoJSON, eksportKML, eksportShapefile
├── io/raster.js         TODO bacaGeoTIFF
├── io/lidar.js          TODO bacaLAS
└── state/store.js       TODO [H5-S1] ciptaStore (Hari 5)
```

Fail rangka bermula dengan `/* eslint-disable no-unused-vars … */` — **buang baris itu** apabila anda melaksanakan fungsi dalam fail tersebut, supaya ESLint dapat membantu anda semula.

Fail sampel untuk import: [`../data/`](../data/README.md) (juga di `http://localhost:3000/data/…`).
