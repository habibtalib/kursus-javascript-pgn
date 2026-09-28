// ─────────────────────────────────────────────────────────────────────────────
// Latihan 05 — S2 · Promise.all / allSettled / race / any — muat 3 layer GeoJSON
// Mock API mesti berjalan.
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:3000';
const LAPISAN = ['sempadan-zon', 'sungai', 'kemudahan'];

function ambilJson(url) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url.replace(API_URL, '')}`);
    return res.json();
  });
}
const tunggu = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const masa = (mula) => `≈${Math.round((performance.now() - mula) / 100) * 100} ms`;

// ── A. TODO: Promise.all — muat 3 layer SERENTAK (setiap satu ?lambat=1000) ─
//   Destructure hasil [zon, sungai, kemudahan]; cetak bilangan feature + masa.
//   ⇒ A1 5 3 12 ≈1000 ms   ← RAMAL dahulu: 1000 atau 3000?
function bahagianA() {
  const mula = performance.now();
  return Promise.resolve();
}

// ── B. TODO: Promise.all di mana sungai guna ?gagal=1 → cetak 'B2 ❌ …' dalam .catch ─
function bahagianB() {
  return Promise.resolve();
}

// ── C. TODO: Promise.allSettled dengan senario sama — cetak ✅/❌ bagi SETIAP layer ───
//   petua: h.status === 'fulfilled' ? h.value : h.reason
//   akhir: console.log('C', `${berjaya}/${hasil.length} lapisan dimuat — peta tetap dipapar`)
function bahagianC() {
  return Promise.resolve();
}

// ── D. TODO: Promise.race — sungai ?lambat=2000 lawan tamatMasa(500) ───────
function tamatMasa(ms) {
  return tunggu(ms).then(() => {
    throw new Error(`Tamat masa ${ms} ms`);
  });
}
function bahagianD() {
  return Promise.resolve(); // ⇒ D2 ⏱️ Tamat masa 500 ms
}

// ── E. TODO: Promise.any — dua "cermin" (satu ?gagal=1, satu ?lambat=300) ──
//   ⇒ E1 ✅ any: 12 feature dari cermin yang hidup
//   Kemudian any([dua-dua gagal]) → .catch cetak e.name & e.errors.length  ⇒ E2 ❌ AggregateError 2 ralat
function bahagianE() {
  return Promise.resolve();
}

bahagianA()
  .then(bahagianB)
  .then(bahagianC)
  .then(bahagianD)
  .then(bahagianE)
  .catch((e) => console.log('❌ Tidak dijangka:', e.message));
