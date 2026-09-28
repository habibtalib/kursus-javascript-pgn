# Latihan Hari 3 — DOM, Event, Borang & Peta Leaflet (tanpa build)

Satu halaman GeoLapor (`index.html`) + lima latihan berperingkat. Setiap latihan ialah satu fail `latihan-NN.js` dengan `TODO`. Semakan automatik dicetak di **Console** (F12) sebagai ✅ / ❌.

| Latihan | Sesi | Fokus | Fail |
|---------|------|-------|------|
| 01 | S1 | Pemilihan & perentasan DOM (`getElementById`, `querySelector(All)`, `closest`, `dataset`, `<template>`) | `latihan-01.js` |
| 02 | S2 | Render senarai dari API dengan **selamat** (`<template>`, `DocumentFragment`, `textContent`) + demo XSS | `latihan-02.js` |
| 03 | S2 | Peta **Leaflet**: tile, `L.geoJSON` (`pointToLayer`, `onEachFeature`, `style`), popup selamat, kawalan layer | `latihan-03.js` |
| 04 | S3 | Event: `change`, `input` + debounce, `keyup`, **delegasi**, klik peta → lat/lng, klik senarai → `flyTo` | `latihan-04.js` |
| 05 | S4 | Borang: Constraint Validation API, mesej BM, `FormData` → POST JSON, error **422** per medan | `latihan-05.js` |

## Cara jalankan (WAJIB melalui `http://`, bukan `file://`)

`<script type="module">` **tidak berfungsi** apabila anda dwiklik `index.html` (`file://…`) — browser menyekat modul atas sebab keselamatan (CORS). Hidangkan folder ini melalui server HTTP.

```bash
# Terminal 1 — mock API (http://localhost:3000)
cd projek/api
npm start

# Terminal 2 — server statik latihan (http://localhost:5500), tanpa dependency
cd projek/latihan/hari-3
node serve.mjs
```

Buka **http://localhost:5500/?l=01** (tukar `01` → `05`). Lencana **API OK / API tiada** di penjuru kanan menunjukkan sama ada mock API boleh dicapai.

Alternatif server statik (pilih satu):

| Alat | Arahan | Nota |
|------|--------|------|
| `serve.mjs` (disyorkan) | `node serve.mjs` | Tiada muat turun, berfungsi luar talian |
| VS Code **Live Server** | Klik kanan `index.html` → *Open with Live Server* | Port default 5500 |
| `npx serve` | `npx serve -l 5500 .` | Perlu internet kali pertama |
| Python | `python3 -m http.server 5500` | Jika Python dipasang |

## Leaflet: CDN dengan sandaran luar talian

- `lib/leaflet.js` mencuba **unpkg** (`leaflet@1.9.4/dist/leaflet-src.esm.js`) dahulu; jika gagal, ia memuat `vendor/leaflet/leaflet-src.esm.js` (salinan tempatan, lesen BSD-2 dalam `vendor/leaflet/LICENSE`).
- CSS dalam `index.html` juga bertukar ke `vendor/leaflet/leaflet.css` jika CDN gagal (`onerror`).
- **Tile OSM** perlukan internet. Tanpa internet, peta berlatar kelabu, tetapi laporan dan layer rujukan (vektor dari mock API) **masih dipapar** — semua latihan masih boleh disiapkan.
- Alternatif jsDelivr: `https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js`.

## Struktur

```text
hari-3/
├── index.html          halaman GeoLapor (rangka tetap — jangan ubah)
├── gaya.css            gaya ringkas
├── muat.js             pemuat: ?l=NN → latihan-NN.js
├── serve.mjs           server statik Node (port 5500)
├── latihan-01.js … latihan-05.js   ← ANDA edit fail ini
├── services/api.js     hasil Hari 2 (API_URL constant, mintaJson, senaraiLaporan, ciptaLaporan, …)
├── utils/geo.js        hasil Hari 1 (formatKoordinat, jarakKm, tapisLaporan, …)
├── ui/senarai.js       kod sedia = versi siap Latihan 02 (digunakan oleh 04 & 05)
├── ui/peta.js          kod sedia = versi siap Latihan 03 (digunakan oleh 04 & 05)
├── lib/leaflet.js      muat Leaflet (CDN → sandaran vendor/)
├── lib/semak.js        semak() → ✅/❌ di Console
└── vendor/leaflet/     Leaflet 1.9.4 (ESM + CSS + imej) untuk luar talian
```

## Nota

- Latihan 05 dengan `&uji` pada URL (`?l=05&uji`) **mencipta satu laporan ujian**. Pulihkan data asal: `cd projek/api && npm run reset-data`.
- Key `X-API-Key: latihan-pgn-2026` dalam `services/api.js` ialah key **mock** untuk latihan. Kod frontend boleh dibaca sesiapa — jangan sekali-kali meletakkan key sebenar di sini.
- Hari 4 memindahkan halaman ini ke **Vite** (`projek/geolapor-mula`): `lib/leaflet.js` diganti `import L from 'leaflet'` dan `API_URL` diganti `import.meta.env.VITE_API_URL`.
