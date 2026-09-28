// ─────────────────────────────────────────────────────────────────────────────
// Latihan 03 — S2 · Template literal, method string & fungsi
// Jalankan: node latihan-03.js   atau   index.html?latihan=03
// ─────────────────────────────────────────────────────────────────────────────

const f = {
  type: 'Feature',
  id: 'LPR-0001',
  geometry: { type: 'Point', coordinates: [101.6958, 2.9264] },
  properties: { id: 'LPR-0001', tajuk: '  Papan tanda sempadan rosak ', kategori: 'infrastruktur', status: 'baharu' },
};

// ── A. Template literal ────────────────────────────────────────────────────
// TODO A1: bina `ringkasan` berbilang baris dengan backtick:
//   [LPR-0001] Papan tanda sempadan rosak        ← tajuk di-trim()
//     Kategori : INFRASTRUKTUR                   ← toUpperCase()
//     Status   : 🆕 Baharu                        ← ternary: baharu → '🆕 Baharu', selainnya status asal
const tajuk = f.properties.tajuk; // ← trim
const ringkasan = '';
console.log('A1', ringkasan);

// ── B. Method string — lengkapkan supaya output sepadan ────────────────────
console.log('B1' /* , 'LPR-0007'.split(?) */); // ⇒ B1 [ 'LPR', '0007' ]
console.log('B2' /* , startsWith, includes */); // ⇒ B2 true true
console.log('B3' /* , padStart */); // ⇒ B3 0042 LPR-0042
console.log('B4' /* , replaceAll */); // ⇒ B4 alam sekitar
console.log('B5', Number('101.6958') + 1, parseFloat('2.9264°')); // ⇒ RAMAL: ______

// ── C. Tiga cara menulis fungsi ────────────────────────────────────────────
// TODO C1 (deklarasi): formatKoordinat([lng, lat], dp = 5) → "lat, lng" dengan toFixed(dp)
function formatKoordinat(koordinat, dp) {
  return ''; // ← tulis sendiri
}
// TODO C2 (ungkapan fungsi): keRadian(darjah) → darjah * π / 180
const keRadian = function (darjah) {
  return 0;
};
// TODO C3 (arrow): labelKategori('alam-sekitar') → 'ALAM SEKITAR'
const labelKategori = (kod) => kod;

console.log('C1', formatKoordinat(f.geometry.coordinates)); // ⇒ C1 2.92640, 101.69580
console.log('C2', formatKoordinat(f.geometry.coordinates, 2)); // ⇒ C2 2.93, 101.70
console.log('C3', keRadian(180).toFixed(4), labelKategori('alam-sekitar')); // ⇒ C3 3.1416 ALAM SEKITAR

// ── D. jarakKm — haversine ─────────────────────────────────────────────────
// TODO D: lengkapkan. R = 6371 km.
//   dLat = rad(lat2−lat1), dLng = rad(lng2−lng1)
//   a = sin²(dLat/2) + cos(rad lat1)·cos(rad lat2)·sin²(dLng/2)
//   jarak = 2 · R · asin(√a)
function jarakKm(a, b) {
  return NaN;
}
const putrajaya = [101.6958, 2.9264];
const cyberjaya = [101.6505, 2.9223];
console.log('D1', jarakKm(putrajaya, cyberjaya).toFixed(2), 'km'); // ⇒ D1 5.05 km
console.log('D2', jarakKm(putrajaya, putrajaya)); // ⇒ D2 0

// ── E. Default parameter & rest ────────────────────────────────────────────
// TODO E1: purata(...nombor) — pulang 0 jika tiada argumen
function purata() {
  return 0;
}
console.log('E1', purata(2.9264, 2.9223, 2.9395).toFixed(4), purata()); // ⇒ E1 2.9294 0

// TODO E2: sapa(nama = 'Pegawai', jabatan = 'PGN') → `Salam ${nama} (${jabatan})`
const sapa = () => '';
console.log('E2', sapa(), '|', sapa('Aina'), '|', sapa(undefined, 'JUPEM'));
// ⇒ E2 Salam Pegawai (PGN) | Salam Aina (PGN) | Salam Pegawai (JUPEM)

// ── F. Closure ─────────────────────────────────────────────────────────────
// TODO F1: buatPenjanaId(awalan = 'LPR', mula = 1) memulangkan FUNGSI yang setiap kali
//          dipanggil memberi ID seterusnya: 'LPR-0011', 'LPR-0012', …
function buatPenjanaId(awalan = 'LPR', mula = 1) {
  return () => '';
}
const janaId = buatPenjanaId('LPR', 11);
const janaIdUji = buatPenjanaId('UJI');
console.log('F1', janaId(), janaId(), janaIdUji(), janaId()); // ⇒ F1 LPR-0011 LPR-0012 UJI-0001 LPR-0013

// ── G. Fungsi tertib tinggi ────────────────────────────────────────────────
// TODO G1: prosesSemua(senarai, fn) — panggil fn untuk setiap item, kumpul hasil dalam array baharu
function prosesSemua(senarai, fn) {
  return [];
}
console.log('G1', prosesSemua([putrajaya, cyberjaya], (k) => formatKoordinat(k, 3)));
// ⇒ G1 [ '2.926, 101.696', '2.922, 101.650' ]
