// ─────────────────────────────────────────────────────────────────────────────
// Latihan 02 — S2 · Penapis & statistik GeoLapor (40 laporan, Checkpoint B)
// Jalankan: node latihan-02.js   (atau butang Jalankan di Pelatih — tiada rangkaian)
// Fungsi yang sama anda salin ke projek/geolapor-mula/src/utils/geo.js (langkah Bahagian B).
// Setiap bahagian BERDIRI SENDIRI: A dan B hanya guna `laporan` di bawah.
// ─────────────────────────────────────────────────────────────────────────────
// (Sudah disediakan) 40 laporan, data yang sama seperti GET /api/laporan selepas `npm run reset-data`.
import { laporan } from './data/laporan.js';

// ── A. tapisLaporan: status + carian ────────────────────────────────────────
// TODO A: tapisLaporan(features, { kategori, status, q } = {}) → array BAHARU.
//   - kategori / status: mesti sama tepat (jika diberi)
//   - q: cari dalam properties.tajuk, TIDAK sensitif huruf, abaikan ruang di hujung ('  PAPAN ' = 'papan')
//   - tiada penapis → semua laporan
function tapisLaporan(features, { kategori, status, q } = {}) {
  return [];
}

console.log('A1 semua:', tapisLaporan(laporan).length); // ⇒ A1 semua: 40
console.log('A2 status selesai:', tapisLaporan(laporan, { status: 'selesai' }).length); // ⇒ A2 status selesai: 8
console.log('A3 cari papan (tanpa status):', tapisLaporan(laporan, { q: '  PAPAN ' }).length); // ⇒ A3 cari papan (tanpa status): 5
console.log('A4 selesai + papan:', tapisLaporan(laporan, { status: 'selesai', q: 'papan' }).map((f) => f.properties.id).join(', ')); // ⇒ A4 selesai + papan: LPR-0009, LPR-0010
console.log('A5 utiliti baharu:', tapisLaporan(laporan, { kategori: 'utiliti', status: 'baharu' }).length); // ⇒ A5 utiliti baharu: 3

// ── B. kiraIkut: panel Statistik ────────────────────────────────────────────
// TODO B: kiraIkut(features, medan) → { nilai: bilangan } ikut properties[medan].
function kiraIkut(features, medan) {
  return {};
}

const ikutStatus = kiraIkut(laporan, 'status');
console.log('B1', ['baharu', 'dalam-tindakan', 'selesai', 'ditolak'].map((s) => `${s}=${ikutStatus[s]}`).join(' ')); // ⇒ B1 baharu=18 dalam-tindakan=11 selesai=8 ditolak=3
const ikutKategori = kiraIkut(laporan, 'kategori');
console.log('B2 kategori:', Object.keys(ikutKategori).length, '· jumlah', Object.values(ikutKategori).reduce((a, b) => a + b, 0)); // ⇒ B2 kategori: 5 · jumlah 40
