// ─────────────────────────────────────────────────────────────────────────────
// Latihan 08 — S4 · Guna services/api.js: kitaran CRUD penuh + ApiError
// Prasyarat: `node semak.js` → 10/10 ✅ (services/api.js siap). Mock API mesti berjalan.
// ─────────────────────────────────────────────────────────────────────────────
import {
  ApiError,
  mintaJson,
  senaraiLaporan,
  dapatkanLaporan,
  ciptaLaporan,
  kemaskiniLaporan,
  padamLaporan,
  senaraiKategori,
  senaraiLapisan,
  dapatkanLapisan,
  dapatkanStatistik,
} from './services/api.js';

// ── TODO 1: mesejPengguna(e) — terjemah error kepada mesej mesra pengguna ─
//   AbortError → null (senyap) · bukan ApiError → 'Ralat tidak dijangka: …'
//   status 0 → '📡 …' · 401 → '🔑 …' · 404 → '🔍 …'
//   422 → `✏️ Semak borang: ${nama medan dipisah koma}` · >=500 → '🛠️ Pelayan bermasalah …'
function mesejPengguna(e) {
  return e.message;
}

// ── TODO 2 (A): dengan SATU Promise.all, ambil kategori, layer & statistik ─
//   ⇒ A1 5 kategori · sempadan-zon, sungai, kemudahan
//   ⇒ A2 jumlah laporan = 40 { … }
// TODO 3: senaraiLaporan({ status: 'baharu', had: 3 }) → cetak id (A3)
// TODO 4: senaraiLaporan({ bbox: [101.67, 2.9, 101.72, 2.95] }) → cetak bilangan (A4)
// TODO 5: dapatkanLapisan('sungai') → cetak jenis geometri feature pertama (A5 LineString)

// ── TODO 6 (B): cipta → kemaskini (status 'selesai', catatan) → padam → dapatkan (404 dalam try/catch)

// ── TODO 7 (C): untuk setiap senario, try/catch dan cetak mesejPengguna(e)
const senario = {
  '422': () => ciptaLaporan({ tajuk: 'x', kategori: 'tiada', lat: 0, lng: 0 }),
  '500': () => senaraiLaporan({ gagal: 1 }),
  timeout: () => mintaJson('/api/laporan?lambat=3000', { timeoutMs: 500 }),
};

// ── TODO 8 (D) ⭐: cari(q) yang MEMBATALKAN carian sebelumnya dengan AbortController
//   await Promise.all([cari('j'), cari('ja'), cari('jalan')])
//   ⇒ "j" dibatalkan · "ja" dibatalkan · "jalan" → n padanan
