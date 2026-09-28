// ─────────────────────────────────────────────────────────────────────────────
// Latihan 05 — S4 · Method array moden atas FeatureCollection + JSON
// Jalankan: node latihan-05.js   atau   index.html?latihan=05
// ─────────────────────────────────────────────────────────────────────────────
import { laporanContoh } from './data/laporan-contoh.js';

const { features } = laporanContoh;

// ── A. push / pop / forEach ────────────────────────────────────────────────
const tindanan = ['LPR-0001', 'LPR-0002'];
// TODO A1: push 'LPR-0003', kemudian pop ke dalam `dikeluarkan`
const dikeluarkan = undefined;
console.log('A1', dikeluarkan, tindanan); // ⇒ A1 LPR-0003 [ 'LPR-0001', 'LPR-0002' ]

// TODO A2: forEach — kira feature berkategori 'utiliti'
let n = 0;
console.log('A2', 'utiliti =', n); // ⇒ A2 utiliti = 2

// ── B. map ─────────────────────────────────────────────────────────────────
// TODO B1: senarai semua id
const senaraiId = [];
console.log('B1', senaraiId.length, senaraiId[0], senaraiId.at(-1)); // ⇒ B1 10 LPR-0001 LPR-0010

// ── C. filter ──────────────────────────────────────────────────────────────
// TODO C1: feature berstatus 'baharu'
const baharu = [];
console.log('C1', baharu.map((f) => f.id).join(' ')); // ⇒ C1 LPR-0001 LPR-0003 LPR-0005 LPR-0008 LPR-0010

// ── D. find / findIndex / some / every ─────────────────────────────────────
// TODO D1–D3
console.log('D1' /* , find LPR-0007 → ?.properties.tajuk */); // ⇒ D1 Pencerobohan tanah kerajaan
console.log('D2' /* , find LPR-9999 */); // ⇒ D2 undefined
console.log('D3' /* , findIndex LPR-0004 */); // ⇒ D3 3

// TODO D4–D6: lengkapkan dalamKotak([lng, lat]) — lng 99.5–119.5, lat 0.8–7.5
const dalamKotak = ([lng, lat]) => true;
console.log('D4' /* , some: ada yang 'ditolak'? */); // ⇒ D4 true
console.log('D5' /* , every: semua dalam kotak? */); // ⇒ D5 false
const rosak = []; // filter + map → id yang LUAR kotak
console.log('D6', rosak); // ⇒ D6 [ 'LPR-0010' ]

// ── E. reduce ──────────────────────────────────────────────────────────────
// TODO E1: kira bilangan ikut kategori → { infrastruktur: 3, ... }
const ikutKategori = {};
console.log('E1', ikutKategori);
// ⇒ E1 { infrastruktur: 3, 'alam-sekitar': 2, tanah: 2, utiliti: 2, 'lain-lain': 1 }

// ── F. sort / toSorted ─────────────────────────────────────────────────────
// TODO F1: 3 laporan TERKINI (dicipta menurun) — guna toSorted supaya `features` tidak berubah.
//   Petua: string ISO boleh dibanding dengan localeCompare
const terkini = features;
console.log('F1', terkini.slice(0, 3).map((f) => f.id)); // ⇒ F1 [ 'LPR-0010', 'LPR-0008', 'LPR-0006' ]
console.log('F2', features[0].id); // ⇒ F2 LPR-0001
console.log('F3', [10, 9, 1].sort(), [10, 9, 1].sort((a, b) => a - b)); // ⇒ RAMAL: ______

// ── G. Chaining ────────────────────────────────────────────────────────────
// TODO G1: dalam kotak → status BUKAN selesai/ditolak → `${id} ${tajuk}` → 3 pertama
const ringkasan = [];
console.log('G1', ringkasan);

// ── H. JSON ────────────────────────────────────────────────────────────────
// TODO H1: stringify laporanContoh
const teks = '';
console.log('H1', typeof teks, teks.length > 2000, teks.slice(0, 28)); // ⇒ H1 string true {"type":"FeatureCollection",

// TODO H2: parse semula
const semula = {};
console.log('H2', semula.features?.length, semula === laporanContoh); // ⇒ H2 10 false

// TODO H3: stringify dengan inden 2 ruang
console.log('H3' /* , JSON.stringify({ id: 'LPR-0001', lokasi: [101.6958, 2.9264] }, ?, ?) */);

// H4 — RAMAL apa yang hilang/berubah
const pelik = { tarikh: new Date('2026-09-28T01:00:00Z'), tiada: undefined, fn() {}, nan: NaN };
console.log('H4', JSON.stringify(pelik)); // ⇒ RAMAL: ______

// TODO H5: bungkus parse di bawah dengan try...catch, cetak ralat.name
// JSON.parse("{'id': 'LPR-0001'}");
console.log('H5' /* , ? */); // ⇒ H5 SyntaxError
