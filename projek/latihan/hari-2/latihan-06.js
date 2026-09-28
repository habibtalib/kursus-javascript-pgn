// ─────────────────────────────────────────────────────────────────────────────
// Latihan 06 — S3 · async/await, try…catch…finally, sequential vs parallel, jenis error
// Mock API mesti berjalan.
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:3000';
const LAPISAN = ['sempadan-zon', 'sungai', 'kemudahan'];
const masa = (mula) => `≈${Math.round((performance.now() - mula) / 100) * 100} ms`;

// ── A. TODO: tulis semula ambilJson dengan async/await ─────────────────────
//   - await fetch(url)
//   - baca badan: await res.json().catch(() => null)
//   - jika !res.ok: cipta Error(data?.ralat ?? `HTTP ${res.status}`), tetapkan ralat.status, throw
async function ambilJson(url) {
  const res = await fetch(url);
  return res.json();
}

// ── B. TODO: muatDenganStatus(label, url) ──────────────────────────────────
//   cetak '⏳ memuatkan…' → try: await ambilJson → '✅ n feature' → return fc
//   catch: '❌ mesej' → return null      finally: '⏹️ tutup penunjuk loading'
async function muatDenganStatus(label, url) {}

// ── C. TODO: bersiri() guna for...of + await; selari() guna Promise.all ────
//   Setiap layer ?lambat=1000. RAMAL masa kedua-duanya: ______ / ______
async function bersiri() {}
async function selari() {}

// ── D. TODO: kelaskan(e) → 'RANGKAIAN' (TypeError) / 'PELAYAN' (>=500) / 'TIDAK DIJUMPAI' (404) / 'PERMINTAAN SALAH' (4xx)
function kelaskan(e) {
  return 'LAIN';
}
async function jenisRalat() {
  const ujian = [
    ['port salah', 'http://localhost:3999/api/kesihatan'],
    ['?gagal=1', `${API_URL}/api/kesihatan?gagal=1`],
    ['id tiada', `${API_URL}/api/laporan/LPR-9999`],
    ['bbox rosak', `${API_URL}/api/laporan?bbox=abc`],
  ];
  for (const [label, url] of ujian) {
    try {
      await ambilJson(url);
      console.log('D', label.padEnd(10), '→ (tiada ralat dilontar — ambilJson belum semak res.ok?)');
    } catch (e) {
      console.log('D', label.padEnd(10), '→', kelaskan(e));
    }
  }
}

// Top-level await dibenarkan dalam ES module
await muatDenganStatus('sungai', `${API_URL}/api/lapisan/sungai?lambat=500`);
await muatDenganStatus('sungai (gagal)', `${API_URL}/api/lapisan/sungai?gagal=1`);
await bersiri();
await selari();
await jenisRalat();

// ── E. RAMAL: berapa lama "forEach selesai"? Kenapa? Betulkan dengan for...of atau Promise.all ─
const mula = performance.now();
LAPISAN.forEach(async (id) => {
  await ambilJson(`${API_URL}/api/lapisan/${id}?lambat=300`);
});
console.log('E1 forEach "selesai" dalam', masa(mula));
