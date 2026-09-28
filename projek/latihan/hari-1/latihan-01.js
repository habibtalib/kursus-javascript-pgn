// ─────────────────────────────────────────────────────────────────────────────
// Latihan 01 — S1 · Asas: variable, jenis data, operator, kawalan aliran, loop
// Jalankan: node latihan-01.js   atau   index.html?latihan=01
// Lengkapkan setiap TODO. Output jangkaan ditulis dalam komen "// ⇒".
// Cuba sendiri dahulu! Tersekat > 10 minit? Tanya jurulatih atau pasangan anda.
// ─────────────────────────────────────────────────────────────────────────────

// ── A. var / let / const ────────────────────────────────────────────────────
// TODO A1: isytihar KATEGORI_SAH (tidak akan ditetapkan semula) berisi 5 kategori laporan yang sah
//          (lihat senarai kategori dalam projek/api/README.md),
//          dan bilanganDiproses (akan berubah) bermula 0, kemudian tambah 1.
const KATEGORI_SAH = []; // ← isi
let bilanganDiproses = 0;
// ...tambah 1 di sini
console.log('A1', KATEGORI_SAH.length, bilanganDiproses); // ⇒ A1 5 1

// TODO A2: tukar status objek const di bawah kepada 'dalam-tindakan'. Adakah error? Kenapa tidak?
const laporan = { id: 'LPR-0001', status: 'baharu' };
console.log('A2', laporan.status); // ⇒ A2 dalam-tindakan

// ── B. Jenis data & typeof ──────────────────────────────────────────────────
// TODO B1: lelar contohNilai dengan for...of, push(typeof nilai) ke dalam `jenis`.
const contohNilai = ['LPR-0001', 101.6958, true, null, undefined, [101.6958, 2.9264], { type: 'Point' }, function () {}];
const jenis = [];
console.log('B1', jenis.join(' | ')); // ⇒ B1 string | number | boolean | object | undefined | object | object | function

// TODO B2: buktikan array ialah array dan null ialah null (typeof tidak membantu!)
console.log('B2' /* , ?, ? */); // ⇒ B2 true true

// TODO B3: typeof NaN, dan semak Number('abc') ialah NaN dengan Number.isNaN
console.log('B3' /* , ?, ? */); // ⇒ B3 number true

// ── C. Operator — RAMAL dahulu, kemudian jalankan ──────────────────────────
console.log('C1', 0.1 + 0.2, (0.1 + 0.2).toFixed(2)); // ⇒ ramalan anda: ______
console.log('C2', '5' + 3, '5' - 3, 7 % 3, 2 ** 10); // ⇒ ramalan anda: ______
console.log('C3', '1' == 1, '1' === 1, null == undefined, null === undefined); // ⇒ ______
console.log('C4', true && 'ya', 0 || 'lalai', !''); // ⇒ ______

// ── D. if / else if / else ──────────────────────────────────────────────────
// TODO D1: tetapkan `zon`:
//   lat < 0.8 atau lat > 7.5 → 'Di luar julat latitud Malaysia'
//   lat < 3.0                → 'Selatan Lembah Klang'
//   selainnya                → 'Utara Lembah Klang'
const lat = 2.9264;
let zon;
console.log('D1', zon); // ⇒ D1 Selatan Lembah Klang

// ── E. switch ───────────────────────────────────────────────────────────────
// TODO E: untuk setiap status, tetapkan label dengan switch:
//   baharu → 'Baharu' · dalam-tindakan → 'Dalam Tindakan' · selesai & ditolak → 'Ditutup'
//   selainnya → 'Status tidak sah'    (jangan lupa break!)
const senaraiStatus = ['baharu', 'dalam-tindakan', 'selesai', 'ditolak', 'hilang'];
for (const status of senaraiStatus) {
  let label;
  console.log('E', status, '→', label);
}

// ── F. Loop ─────────────────────────────────────────────────────────────────
// TODO F1: loop for (let i = 0; ...) — untuk setiap koordinat [lng, lat]:
//   jika di luar kotak Malaysia (lng 99.5–119.5, lat 0.8–7.5) → console.log('F1', i, 'LUAR kotak Malaysia') dan `continue`
//   jika tidak → bilanganSah++
const senaraiKoordinat = [
  [101.6958, 2.9264],
  [2.935, 101.701],
  [151.2093, -33.8688],
  [100.3327, 5.4164],
];
let bilanganSah = 0;
console.log('F1', 'sah =', bilanganSah); // ⇒ F1 1 LUAR…, F1 2 LUAR…, F1 sah = 2

// TODO F2: dengan while, cari ID pertama 'LPR-000N' yang BELUM digunakan.
//   Petua: 'LPR-' + String(nombor).padStart(4, '0')
const idDigunakan = ['LPR-0001', 'LPR-0002', 'LPR-0003'];
let idBaharu;
console.log('F2', idBaharu); // ⇒ F2 LPR-0004

// TODO F3: do...while — naikkan `cubaan`; berjaya apabila cubaan >= 3; berhenti juga jika cubaan mencapai 5.
let cubaan = 0;
let berjaya = false;
console.log('F3', 'cubaan =', cubaan, 'berjaya =', berjaya); // ⇒ F3 cubaan = 3 berjaya = true

// TODO F4: for...of + break — simpan ID PERTAMA yang statusnya 'selesai'.
let pertamaSelesai = null;
const statusIkutId = [['LPR-0001', 'baharu'], ['LPR-0004', 'selesai'], ['LPR-0009', 'selesai']];
console.log('F4', pertamaSelesai); // ⇒ F4 LPR-0004
