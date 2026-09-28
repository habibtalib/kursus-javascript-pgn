// ─────────────────────────────────────────────────────────────────────────────
// Latihan 09 ⭐ — S4 · Cuba semula (retry) dengan exponential backoff
// Prasyarat: services/api.js siap. Mock API mesti berjalan.
// ─────────────────────────────────────────────────────────────────────────────
import { ApiError, mintaJson } from './services/api.js';

const tunggu = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO 1: bolehCubaSemula(e) → true HANYA untuk ApiError dengan status 0, >= 500, atau 429
const bolehCubaSemula = (e) => false;

// TODO 2: denganCubaSemula(fn, { cubaan = 3, tundaAsasMs = 300, log })
//   loop: try { return await fn() } catch (e) {
//     jika sudah cubaan terakhir ATAU !bolehCubaSemula(e) → throw e
//     tunda = tundaAsasMs * 2 ** (ke - 1) + jitter rawak 0–100 ms → log → await tunggu(tunda)
//   }
export async function denganCubaSemula(fn, { cubaan = 3, tundaAsasMs = 300, log = () => {} } = {}) {
  return fn();
}

// Demo A: gagal 2 kali, berjaya kali ke-3  ⇒ 2 baris ↻ kemudian ✅ selepas 3 panggilan
let panggilan = 0;
const tidakStabil = () => {
  panggilan++;
  return mintaJson(panggilan < 3 ? '/api/kesihatan?gagal=1' : '/api/kesihatan');
};
try {
  const hasil = await denganCubaSemula(tidakStabil, { log: (m) => console.log('A ↻', m) });
  console.log('A ✅ selepas', panggilan, 'panggilan:', hasil.ok);
} catch (e) {
  console.log('A ❌', e.message, '(belum ada cuba semula?)');
}

// Demo B: 404 TIDAK patut dicuba semula  ⇒ B ❌ 404 selepas 1 panggilan
panggilan = 0;
try {
  await denganCubaSemula(() => {
    panggilan++;
    return mintaJson('/api/laporan/LPR-9999');
  });
} catch (e) {
  console.log('B ❌', e.status, 'selepas', panggilan, 'panggilan');
}
