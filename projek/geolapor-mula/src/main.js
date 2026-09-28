// main.js — Titik masuk GeoLapor (projek PERMULAAN Hari 4).
//
// Keadaan sekarang: halaman memaparkan peta kosong sahaja. Isi TODO mengikut lab:
//   [H4-S1] npm install  → semua pustaka sudah disenaraikan dalam package.json
//   [H4-S2] Pindahkan kod Hari 1–3 anda ke dalam modul Vite:
//           utils/geo.js (Hari 1) · services/api.js (Hari 2) · ui/*.js (Hari 3)
//           kemudian baca/tulis format geospatial: io/format.js · io/raster.js · io/lidar.js · utils/unjuran.js
//   [H4-S3] npm run lint → baiki semua error & amaran · npm run format
//   [H4-S4] services/cache.js → localStorage (penapis, draf borang) & IndexedDB (cache layer)
//   [H5-S1] state/store.js → store berpusat; UI melanggan store
// Rujukan: hari-4/lab.md · hari-5/lab.md
import 'leaflet/dist/leaflet.css';
import './style.css';
import { ciptaPeta } from './ui/peta.js';

const peta = ciptaPeta(document.getElementById('peta'));

// TODO [H4-S2]: Semak sambungan API — import { mintaJson } dari './services/api.js' dan panggil
//   mintaJson('/api/kesihatan'). Kemas kini lencana #status-api ("API: dalam talian"/"luar talian").
//   URL API datang dari .env → import.meta.env.VITE_API_URL (salin .env.example → .env).

// TODO [H4-S2]: Muat laporan (senaraiLaporan) → lukis marker di peta + senarai (#senarai).
//   ⚠️ GeoJSON [lng, lat]  vs  Leaflet [lat, lng]

// TODO [H4-S2]: Muat kategori (senaraiKategori) → isi <select name="kategori"> dalam #penapis & #borang.

// TODO [H4-S2]: Klik peta → isi lat/lng dalam #borang. Hantar borang → ciptaLaporan → papar error 422.
peta.on('click', (e) => {
  console.info('Klik peta [lat, lng]:', e.latlng.lat.toFixed(5), e.latlng.lng.toFixed(5));
});

// TODO [H4-S2]: Panel #panel-fail — import fail (bacaFail / bacaGeoTIFF / bacaLAS) & eksport laporan.
// TODO [H4-S4]: Simpan penapis dalam localStorage; cache layer rujukan dalam IndexedDB.
