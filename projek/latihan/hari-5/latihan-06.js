// ─────────────────────────────────────────────────────────────────────────────
// Latihan 06 — S2 · Arah dependency, clustering & bucu (seni bina + prestasi peta)
// Jalankan: node latihan-06.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B, C mengikut apa-apa susunan.
// Rujukan: hari-5/README.md §2.1 (layer & arah dependency) · §2.5 (clustering, simplify)
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan satu bahagian dan tunggu ia siap.
async function jalankan(bahagian) {
  try {
    await bahagian();
  } catch (e) {
    console.log(`❌ ${bahagian.name}:`, e.message);
  }
}

// SEDIA: selesaikan laluan import relatif → laluan dari akar projek.
//   selesaikan('src/state/tindakan.js', '../ui/notis.js') → 'src/ui/notis.js'
//   selesaikan('src/ui/peta.js', 'leaflet')               → 'leaflet'   (pakej npm: tidak berubah)
function selesaikan(dari, spesifikasi) {
  if (!spesifikasi.startsWith('.')) return spesifikasi;
  const bahagian = dari.split('/').slice(0, -1);
  for (const b of spesifikasi.split('/')) {
    if (b === '..') bahagian.pop();
    else if (b !== '.') bahagian.push(b);
  }
  return bahagian.join('/');
}
// SEDIA: layer sesuatu fail — 'src/state/tindakan.js' → 'state'; 'src/main.js' → 'main.js'.
const lapisan = (laluan) => laluan.split('/')[1];
// SEDIA: layer bawah yang TIDAK boleh bergantung pada ui/ atau Leaflet (README §2.1).
const LAPISAN_BAWAH = ['state', 'services', 'io', 'utils'];

// ── A. Kuatkuasakan arah dependency ────────────────────────────────────────
// TODO A: langgarArah(fail, spesifikasi) → true jika import itu MELANGGAR arah dependency:
//   fail berada dalam LAPISAN_BAWAH  DAN  sasaran (selesaikan(fail, spesifikasi)) ialah
//   - fail dalam src/ui/…   ATAU
//   - pakej 'leaflet' atau 'leaflet.<apa-apa>' (cth 'leaflet.markercluster')
//   Inilah yang dilakukan oleh peraturan ESLint `no-restricted-imports` dalam Lab 5.2 langkah 3.
function langgarArah(fail, spesifikasi) {
  return false; // ← tulis sendiri
}

function bahagianA() {
  console.log(
    'A1',
    langgarArah('src/state/tindakan.js', '../ui/notis.js'),
    langgarArah('src/state/pemilih.js', '../utils/geo.js'),
    langgarArah('src/utils/geo.js', 'leaflet'),
    langgarArah('src/ui/peta.js', 'leaflet'),
  ); // ⇒ A1 true false true false
  console.log(
    'A2',
    langgarArah('src/services/api.js', 'leaflet.markercluster'),
    langgarArah('src/ui/senarai.js', '../state/pemilih.js'),
    langgarArah('src/main.js', './ui/peta.js'),
    langgarArah('src/io/format.js', '../ui/../utils/geo.js'),
  ); // ⇒ A2 true false false false
}
await jalankan(bahagianA);

// SEDIA: enam laporan sebagai titik [lng, lat].
const titik = [
  [101.6958, 2.9264],
  [101.6505, 2.9223],
  [101.7112, 2.9395],
  [101.6801, 2.9012],
  [101.6633, 2.915],
  [101.702, 2.9301],
];

// ── B. Apa yang markercluster lakukan pada zum rendah ─────────────────────
// TODO B: kelompokGrid(titik, saizSel) → objek { kunci: bilangan } — titik dalam sel grid yang SAMA dikira bersama.
//   kunci sel = `${Math.floor(lng / saizSel)}:${Math.floor(lat / saizSel)}`
//   (zum rendah = sel besar = sedikit kelompok; zum tinggi = sel kecil = marker individu)
function kelompokGrid(titik, saizSel) {
  return {}; // ← tulis sendiri
}

function bahagianB() {
  const bilangan = (k) => Object.values(k).sort((a, b) => b - a);
  const kasar = bilangan(kelompokGrid(titik, 0.1));
  console.log('B1', kasar.length, 'kelompok:', kasar.join(',')); // ⇒ B1 2 kelompok: 4,2
  const halus = bilangan(kelompokGrid(titik, 0.02));
  console.log('B2', halus.length, 'kelompok:', halus.join(',')); // ⇒ B2 5 kelompok: 2,1,1,1,1
}
await jalankan(bahagianB);

// SEDIA: GeoJSON sampel untuk mengira bucu (cth log "Bucu: X → Y" selepas simplify).
const zon = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { nama: 'Zon A' },
      geometry: { type: 'Polygon', coordinates: [[[101.68, 2.91], [101.7, 2.91], [101.7, 2.93], [101.68, 2.93], [101.68, 2.91]]] },
    },
    { type: 'Feature', properties: { nama: 'Parit' }, geometry: { type: 'LineString', coordinates: [[101.69, 2.92], [101.695, 2.925], [101.7, 2.927]] } },
    { type: 'Feature', properties: { nama: 'Pintu air' }, geometry: { type: 'Point', coordinates: [101.69, 2.92] } },
  ],
};
const duaZon = {
  type: 'MultiPolygon',
  coordinates: [
    [[[101.6, 2.9], [101.61, 2.9], [101.61, 2.91], [101.6, 2.91], [101.6, 2.9]]],
    [[[101.7, 2.9], [101.71, 2.9], [101.71, 2.91], [101.7, 2.9]]],
  ],
};

// ── C. Kira bucu (seperti coordAll(geojson).length dalam Turf) ─────────────
// TODO C: kiraBucu(geojson) → bilangan pasangan koordinat dalam FeatureCollection / Feature / geometri:
//   FeatureCollection → jumlah semua features;  Feature → geometrinya (null → 0)
//   Point → 1 · MultiPoint/LineString → coordinates.length · MultiLineString/Polygon → coordinates.flat().length
//   MultiPolygon → coordinates.flat(2).length
function kiraBucu(geojson) {
  return 0; // ← tulis sendiri
}

function bahagianC() {
  console.log('C1', `Bucu: ${kiraBucu(zon)}`); // ⇒ C1 Bucu: 9
  console.log('C2', kiraBucu(duaZon), kiraBucu(zon.features[1]), kiraBucu({ type: 'Feature', geometry: null })); // ⇒ C2 9 3 0
}
await jalankan(bahagianC);
