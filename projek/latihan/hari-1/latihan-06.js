// ─────────────────────────────────────────────────────────────────────────────
// Latihan 06 — S4 · ES Modules: bina & guna utils/geo.js
// 1) Lengkapkan TODO dalam utils/geo.js   2) node semak.js → 6/6 ✅   3) node latihan-06.js
// ─────────────────────────────────────────────────────────────────────────────
// TODO 1: import laporanContoh (named export) dari './data/laporan-contoh.js'
// TODO 2: import 6 fungsi dari './utils/geo.js'
import { laporanContoh } from './data/laporan-contoh.js';
import { formatKoordinat, jarakKm, tapisLaporan, kiraIkut, bboxDari, dalamMalaysia } from './utils/geo.js';

const { features } = laporanContoh;

// TODO 3: asingkan `sah` dan `rosak` dengan dalamMalaysia
const sah = features;
const rosak = [];
console.log('1', `sah=${sah.length}`, `rosak=${rosak.map((f) => f.id)}`); // ⇒ 1 sah=9 rosak=LPR-0010

console.log('2', formatKoordinat(sah[0].geometry.coordinates)); // ⇒ 2 2.92640, 101.69580

// TODO 4: 3 laporan paling hampir dengan PEJABAT — map → toSorted → slice → map
const PEJABAT = [101.6934, 2.9257];
const terdekat = [];
console.log('3', terdekat); // ⇒ 3 [ 'LPR-0001 (0.28 km)', 'LPR-0002 (1.65 km)', 'LPR-0003 (2.23 km)' ]

console.log('4a', tapisLaporan(sah, { status: 'baharu' }).length); // ⇒ 4a 4
console.log('4b', tapisLaporan(sah, { kategori: 'tanah', status: 'baharu' }).map((f) => f.id)); // ⇒ 4b [ 'LPR-0003' ]
console.log('4c', tapisLaporan(sah, { q: 'SEMPADAN' }).map((f) => f.id)); // ⇒ 4c [ 'LPR-0001', 'LPR-0003' ]
console.log('4d', tapisLaporan(sah).length); // ⇒ 4d 9

console.log('5', kiraIkut(sah, 'status')); // ⇒ 5 { baharu: 4, 'dalam-tindakan': 2, selesai: 2, ditolak: 1 }

console.log('6a', bboxDari(sah)); // ⇒ 6a [ 101.644, 2.9012, 101.722, 2.9555 ]
console.log('6b', bboxDari(features)); // ⇒ RAMAL: apa jadi jika rekod rosak dimasukkan?
console.log('6c', bboxDari([])); // ⇒ 6c null
