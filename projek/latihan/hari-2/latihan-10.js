// ─────────────────────────────────────────────────────────────────────────────
// Latihan 10 ⭐ (PILIHAN — perlukan internet) · API awam: api.data.gov.my
// Dokumentasi: https://developer.data.gov.my  (Data Catalogue API)
// ─────────────────────────────────────────────────────────────────────────────
const DATA_GOV = 'https://api.data.gov.my/data-catalogue/'; // trailing slash penting (elak 301)

// TODO 1: bina query dengan URLSearchParams:
//   id=fuelprice · limit=3 · sort=-date · filter=level@series_type
// TODO 2: fetch dengan AbortSignal.timeout(8000); lontar Error jika !res.ok; pulangkan res.json()
async function hargaMinyak({ had = 3 } = {}) {
  return [];
}

try {
  const rekod = await hargaMinyak();
  console.log('1', Array.isArray(rekod), rekod.length); // ⇒ 1 true 3
  // TODO 3: untuk setiap rekod, destructure { date, ron95, ron97, diesel } dan cetak dengan toFixed(2)
} catch (e) {
  console.log('❌ API awam tidak dapat dicapai:', e.name, e.message);
}

// ⭐ TODO 4: buka URL yang sama dalam tab browser & dalam DevTools → Network. Cari header
//   `access-control-allow-origin` dalam response. Apakah nilainya, dan kenapa ia membolehkan
//   halaman di localhost:5500 membaca data ini?
