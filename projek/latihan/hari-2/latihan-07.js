// ─────────────────────────────────────────────────────────────────────────────
// Latihan 07 — S4 · fetch mentah: POST / PATCH / DELETE, header, 401/422/204, AbortController
// Mock API mesti berjalan. (Mencipta & memadam SATU laporan ujian.)
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:3000';
const API_KEY = 'latihan-pgn-2026';

async function cetakRespons(label, res) {
  const badan = res.status === 204 ? '(tiada badan)' : await res.json();
  console.log(label, res.status, res.statusText, badan);
  return badan;
}

// ── A. POST TANPA X-API-Key (sudah siap — jalankan & perhatikan) ───────────
let res = await fetch(`${API_URL}/api/laporan`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tajuk: 'Ujian tanpa kunci', kategori: 'tanah', lat: 2.93, lng: 101.69 }),
});
await cetakRespons('A', res); // ⇒ A 401 Unauthorized { ralat: 'Kunci API tidak sah' }

// ── B. TODO: POST data TIDAK sah (dengan key) ──────────────────────────────
//   badan: { tajuk: 'Abc', kategori: 'jalan', lat: 101.69, lng: 2.93 }
//   cetak response, kemudian lelar b.medan → console.log('B  ·', medan, '→', mesej)
//   ⇒ B 422 … (4 medan)

// ── C. TODO: POST data sah → 201 ───────────────────────────────────────────
//   { tajuk: 'Ujian Lab 7 — longkang tersumbat', kategori: 'infrastruktur', catatan: '…', lat: 2.9301, lng: 101.6902 }
//   cetak res.status, cipta.id, cipta.geometry.coordinates, header 'location'
//   RAMAL: susunan coordinates dalam response — [lat, lng] atau [lng, lat]?
let cipta = null;

// ── D. TODO: PATCH /api/laporan/:id { status: 'dalam-tindakan' } → 200 ─────

// ── E. TODO: DELETE /api/laporan/:id → 204; kemudian GET id sama → 404 ─────

// ── F. TODO: AbortController — GET /api/laporan?lambat=3000, abort selepas 300 ms
//   try/catch → console.log('F', e.name)   ⇒ F AbortError

// ── G. TODO: AbortSignal.timeout(1000) pada GET ?lambat=3000
//   ⇒ G TimeoutError
