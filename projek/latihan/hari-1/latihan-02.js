// ─────────────────────────────────────────────────────────────────────────────
// Latihan 02 — S1 · Objek laporan, GeoJSON pertama, scope & hoisting
// Jalankan: node latihan-02.js   atau   index.html?latihan=02
// ─────────────────────────────────────────────────────────────────────────────

// ── A. Satu laporan = satu GeoJSON Feature ─────────────────────────────────
// TODO A: lengkapkan objek ikut struktur laporan GeoLapor (8 medan dalam properties — lihat data/laporan-contoh.js untuk contoh).
//   Lokasi: lng 101.6958, lat 2.9264  → coordinates: [lng, lat]  (BUKAN [lat, lng]!)
const laporan = {
  type: 'Feature',
  id: 'LPR-0001',
  geometry: { type: 'Point', coordinates: [] }, // ← isi
  properties: {
    id: 'LPR-0001',
    tajuk: 'Papan tanda sempadan rosak',
    // kategori, status, catatan, pelapor, dicipta, dikemaskini ← isi
  },
};

console.log('A1', laporan.properties.tajuk); // ⇒ A1 Papan tanda sempadan rosak
console.log('A2' /* , lng */); // ⇒ A2 101.6958
console.log('A3' /* , lat */); // ⇒ A3 2.9264

const medan = 'kategori';
console.log('A4' /* , guna laporan.properties[medan] */); // ⇒ A4 infrastruktur

// TODO A5: tambah medan `keutamaan`, kemudian delete. Kira key dengan Object.keys(...).length
console.log('A5' /* , ? */); // ⇒ A5 8

// ── B. FeatureCollection ───────────────────────────────────────────────────
// TODO B1: bina koleksi { type: 'FeatureCollection', features: [laporan] }, kemudian push 2 Feature lagi:
//   LPR-0002 · [101.688, 2.9395] · 'Longgokan sisa binaan' · alam-sekitar · dalam-tindakan
//   LPR-0003 · [101.7102, 2.9147] · 'Batu sempadan lot hilang' · tanah · baharu
const koleksi = { type: 'FeatureCollection', features: [] };
console.log('B1', koleksi.features.length); // ⇒ B1 3

// TODO B2: for...of — kira berapa feature berstatus 'baharu'
let bilanganBaharu = 0;
console.log('B2', 'baharu =', bilanganBaharu); // ⇒ B2 baharu = 2

// TODO B3: for...in — kumpul key objek laporan.geometry ke dalam array `kunci`
const kunci = [];
console.log('B3', kunci.join(',')); // ⇒ B3 type,coordinates

// ── C. Scope — RAMAL output C1–C4 sebelum jalankan ──────────────────────────
if (true) {
  var bocor = 'var bocor keluar dari blok';
  let terkurung = 'let kekal dalam blok';
  console.log('C1', terkurung);
}
console.log('C2', bocor);
console.log('C3', typeof terkurung);

function kiraDalamFungsi() {
  var tempatan = 1;
  return tempatan + 1;
}
console.log('C4', kiraDalamFungsi(), typeof tempatan);

// ── D. Hoisting & TDZ — RAMAL dahulu ───────────────────────────────────────
console.log('D1', diangkat);
var diangkat = 'nilai';

try {
  console.log(belumSedia);
} catch (ralat) {
  console.log('D2', ralat.name);
}
let belumSedia = 'nilai';

console.log('D3', sapa('PGN'));
function sapa(nama) {
  return 'Salam, ' + nama;
}

// ── E. var vs let dalam loop — RAMAL: apa dicetak, dan dalam susunan apa? ─
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('E1 var', i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('E2 let', j), 0);
}
console.log('E0', 'baris ini keluar bila?');
