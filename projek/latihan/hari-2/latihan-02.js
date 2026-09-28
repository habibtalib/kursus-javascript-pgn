// ─────────────────────────────────────────────────────────────────────────────
// Latihan 02 — S1 · Callback & "callback hell"
// Jalankan: node latihan-02.js   (tiada rangkaian — guna simulasi.js)
// ─────────────────────────────────────────────────────────────────────────────
import { muatLapisanCb } from './simulasi.js';

// ── A. Satu callback ───────────────────────────────────────────────────────
// TODO A: panggil muatLapisanCb('sungai', (ralat, data) => { … })
//   - jika error: console.log('A ❌', ralat.message) dan return
//   - jika berjaya: console.log('A2 sungai:', data.features.length, 'feature')
// Kemudian, SELEPAS panggilan itu (di luar callback): console.log('A1 permintaan dihantar')
// RAMAL: A1 atau A2 keluar dahulu?

// ── B. Callback hell ───────────────────────────────────────────────────────
// TODO B: muat 'sempadan-zon', KEMUDIAN 'sungai', KEMUDIAN 'kemudahan' (sequential, bersarang).
//   Semak error di SETIAP aras. Di aras paling dalam cetak jumlah feature & masa:
//   console.log(`B ✅ 3 lapisan, ${jumlah} feature, ≈${ms} ms`)
//   Jangkaan: 16 feature, ≈600 ms
const mula = performance.now();

// ── C. Error dalam callback ────────────────────────────────────────────────
// TODO C: muat layer 'jalan-raya' (tidak wujud) dan cetak error message
//   ⇒ C ❌ Lapisan 'jalan-raya' tidak wujud

// ── D. RAMAL: adakah try luar menangkap error dalam setTimeout? ────────────
try {
  setTimeout(() => {
    null.features; // TypeError
  }, 800); // selepas bahagian B (≈600 ms) supaya ranap ini tidak memotong output lain
} catch {
  console.log('D1 try luar menangkap ralat');
}
// TODO D2: jalankan. Apa berlaku? Betulkan dengan meletakkan try...catch DI DALAM callback
//          dan cetak console.log('D2', e.name)
