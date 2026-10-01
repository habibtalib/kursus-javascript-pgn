// ─────────────────────────────────────────────────────────────────────────────
// Latihan 04 — S1 · Keadaan dalam URL: queryDariPenapis & penapisDariUrl (state/url.js)
// Jalankan: node latihan-04.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B, C mengikut apa-apa susunan.
// Hanya bahagian TULEN url.js — segerakUrl (history/location) kekal dalam projek Vite anda.
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan satu bahagian dan tunggu ia siap.
async function jalankan(bahagian) {
  try {
    await bahagian();
  } catch (e) {
    console.log(`❌ ${bahagian.name}:`, e.message);
  }
}

// SEDIA: tiga medan penapis yang disimpan dalam URL.
const MEDAN_PENAPIS = ['kategori', 'status', 'q'];

// ── A. Penapis → query string ──────────────────────────────────────────────
// TODO A: queryDariPenapis(penapis) → '?kategori=…&status=…&q=…' TANPA medan kosong; '' jika semua kosong.
//   petua: const p = new URLSearchParams();  for (const k of MEDAN_PENAPIS) if (penapis[k]) p.set(k, penapis[k]);
//          const qs = p.toString();  return qs ? `?${qs}` : '';
//   ⚠️ Kod di bawah ialah pepijat P4 (Lab 5.3): template literal tidak mengekod '&', '#' atau ruang.
function queryDariPenapis(penapis) {
  return `?kategori=${penapis.kategori}&status=${penapis.status}&q=${penapis.q}`; // ← betulkan
}

function bahagianA() {
  console.log('A1', queryDariPenapis({ kategori: 'tanah', status: '', q: '' })); // ⇒ A1 ?kategori=tanah
  console.log('A2', queryDariPenapis({ kategori: '', status: 'baharu', q: 'Jalan 2 & 3' })); // ⇒ A2 ?status=baharu&q=Jalan+2+%26+3
  console.log('A3', queryDariPenapis({ kategori: '', status: '', q: 'sungai #1' })); // ⇒ A3 ?q=sungai+%231
  console.log('A4', queryDariPenapis({ kategori: '', status: '', q: '' }) || '(kosong)'); // ⇒ A4 (kosong)
}
await jalankan(bahagianA);

// ── B. Query string → penapis ──────────────────────────────────────────────
// TODO B: penapisDariUrl(search) → { kategori, status, q } — medan yang tiada dalam URL menjadi ''.
//   petua: const p = new URLSearchParams(search);
//          return Object.fromEntries(MEDAN_PENAPIS.map((k) => [k, p.get(k) ?? '']));
function penapisDariUrl(search) {
  return { kategori: '', status: '', q: '' }; // ← tulis sendiri
}

function bahagianB() {
  console.log('B1', JSON.stringify(penapisDariUrl('?kategori=tanah'))); // ⇒ B1 {"kategori":"tanah","status":"","q":""}
  console.log('B2', JSON.stringify(penapisDariUrl('?q=Jalan+2+%26+3&lain=1'))); // ⇒ B2 {"kategori":"","status":"","q":"Jalan 2 & 3"}
  console.log('B3', penapisDariUrl('?status=dalam-tindakan&q=sungai+%231').q); // ⇒ B3 sungai #1
}
await jalankan(bahagianB);

// ── C. Adakah URL membawa penapis? ─────────────────────────────────────────
// TODO C: adaPenapisDalamUrl(search) → true jika SEKURANG-KURANGNYA satu medan penapis ada dalam URL
//   (URL dikongsi menang; tanpa penapis dalam URL, penapis sedia ada dalam store ditulis ke URL).
//   petua: const p = new URLSearchParams(search);  return MEDAN_PENAPIS.some((k) => p.has(k));
function adaPenapisDalamUrl(search) {
  return search !== ''; // ← betulkan: '?lain=1' bukan penapis
}

function bahagianC() {
  console.log('C1', adaPenapisDalamUrl('?q=x'), adaPenapisDalamUrl('?lain=1'), adaPenapisDalamUrl('')); // ⇒ C1 true false false
  console.log('C2', adaPenapisDalamUrl('?status='), adaPenapisDalamUrl('?zum=16'), adaPenapisDalamUrl('?zum=16&kategori=tanah')); // ⇒ C2 true false true
}
await jalankan(bahagianC);
