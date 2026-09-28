// ─────────────────────────────────────────────────────────────────────────────
// Latihan 04 — S2 · fetch ialah Promise: GET, status, header, JSON
// Mock API mesti berjalan: (terminal lain) cd projek/api && npm start
// Jalankan: node latihan-04.js   atau   index.html?latihan=04
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:3000';

// ── A. TODO: GET /api/kesihatan — cetak res.status, res.ok, res.statusText,
//            header content-type, kemudian badan JSON
function bahagianA() {
  return fetch(`${API_URL}/api/kesihatan`).then((res) => {
    console.log('A1' /* , ?, ?, ? */); // ⇒ A1 200 true OK
    console.log('A2' /* , header */); // ⇒ A2 application/json; charset=utf-8
    // return ? → then seterusnya cetak 'A3', data
  });
}

// ── B. TODO: GET /api/kategori — cetak bilangan & senarai kod dipisah koma ─
function bahagianB() {
  return Promise.resolve(); // ⇒ B1 5 infrastruktur, alam-sekitar, tanah, utiliti, lain-lain
}

// ── C. TODO: GET /api/laporan/LPR-9999 — RAMAL: .then atau .catch dipanggil? ─
//   cetak 'C1', res.ok, res.status  kemudian 'C2', badan.ralat
function bahagianC() {
  return Promise.resolve();
}

// ── D. TODO: bina URL dengan URLSearchParams { status: 'baharu', q: 'jalan', had: 5 } ─
//   cetak URL (D1), content-type & header x-jumlah (D2), fc.type (D3), dan setiap id/status/tajuk (D4)
function bahagianD() {
  return Promise.resolve();
}

// ── E. TODO: ambilJson(url) — lontar Error(`HTTP ${res.status}`) jika !res.ok ─
function ambilJson(url) {
  return fetch(url).then((res) => res.json());
}
function bahagianE() {
  return ambilJson(`${API_URL}/api/laporan/LPR-9999`)
    .then(() => console.log('E1 (sepatutnya TIDAK dicetak)'))
    .catch((e) => console.log('E2 ❌', e.message)); // ⇒ E2 ❌ HTTP 404
}

bahagianA()
  .then(bahagianB)
  .then(bahagianC)
  .then(bahagianD)
  .then(bahagianE)
  .catch((e) => console.log('❌ Rangkaian:', e.message, '— adakah mock API berjalan di :3000?'));
