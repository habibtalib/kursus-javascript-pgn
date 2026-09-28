// ─────────────────────────────────────────────────────────────────────────────
// Latihan 03 — S2 · Mencipta & merantai Promise
// Jalankan: node latihan-03.js   (tiada rangkaian)
// ─────────────────────────────────────────────────────────────────────────────
import { muatLapisanCb } from './simulasi.js';

// ── A. TODO: tunggu(ms) → Promise yang resolve selepas ms ──────────────────
const tunggu = (ms) => Promise.resolve(); // ← betulkan dengan new Promise + setTimeout

// ── B. TODO: "promisify" — bungkus muatLapisanCb dalam Promise ─────────────
//   ralat → reject(ralat) · berjaya → resolve(data)
function muatLapisan(id) {
  return Promise.reject(new Error('TODO: muatLapisan belum ditulis'));
}

const p = muatLapisan('sungai');
p.catch(() => {}); // elak amaran "unhandled rejection" semasa TODO
console.log('A1', p instanceof Promise, String(p)); // ⇒ A1 true [object Promise]

// ── C. TODO: ratakan callback hell Latihan 02 menjadi chain .then ─────────
//   tunggu(10) → muat sempadan-zon → muat sungai → muat kemudahan
//   → console.log('C1', { zon, sungai, kemudahan }, masa)      ⇒ C1 { zon: 5, sungai: 3, kemudahan: 8 } ≈610 ms
//   → kemudian muat 'jalan-raya' (akan reject)
//   → .catch cetak 'C3 ❌ …'  → .finally cetak 'C4 finally …'
//   INGAT: setiap .then yang memulakan kerja async mesti `return` promise itu!
const mula = performance.now();
const kiraan = {};

// ── D. TODO: RAMAL kemudian jalankan ───────────────────────────────────────
// Promise.resolve(2)
//   .then((x) => x * 10)
//   .then((x) => { if (x > 10) throw new Error(`Nilai ${x} terlalu besar`); return x; })
//   .catch((e) => { console.log('D1 ❌', e.message); return 0; })
//   .then((x) => console.log('D2 selepas pulih:', x));
// Ramalan D2: ______

// ── E. Cari pepijat: kenapa data undefined? Betulkan. ──────────────────────
tunggu(900)
  .then(() => {
    muatLapisan('kemudahan').catch(() => {});
  })
  .then((data) => console.log('E1 data =', data)); // mahu: objek FeatureCollection
