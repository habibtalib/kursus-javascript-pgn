// services/api.js — SATU-SATUNYA tempat aplikasi bercakap dengan mock API GeoLapor.
// LATIHAN Hari 2 (S4). API DIKUNCI — JANGAN tukar nama/tandatangan.
// Semak kerja anda (mock API mesti berjalan):  node semak.js
//
// Hari 1–3 (tanpa bundler): alamat API ialah constant. Hari 4 (Vite): import.meta.env.VITE_API_URL.
const API_URL = 'http://localhost:3000';

// ⚠️ Key LATIHAN sahaja — apa-apa dalam kod frontend boleh dibaca pengguna.
const API_KEY = 'latihan-pgn-2026';

/** Error seragam. status 0 = tiada response HTTP (rangkaian/timeout). */
export class ApiError extends Error {
  constructor(mesej, status, medan) {
    super(mesej);
    // TODO 1: tetapkan this.name = 'ApiError', this.status, this.medan (default null)
  }
}

/**
 * @param {string} laluan cth '/api/laporan?status=baharu'
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal, timeoutMs?: number }} [opsyen]
 * @returns {Promise<any>} JSON, atau null untuk 204
 */
export async function mintaJson(laluan, { method = 'GET', body, signal, timeoutMs = 8000 } = {}) {
  // TODO 2: bina headers
  //   - sentiasa: Accept: application/json
  //   - jika ada body: Content-Type: application/json
  //   - jika method BUKAN GET: X-API-Key: API_KEY
  const headers = {};

  // TODO 3: isyarat gabungan — AbortSignal.timeout(timeoutMs), digabung dengan `signal` pemanggil
  //   (jika ada) melalui AbortSignal.any([...])
  const isyarat = undefined;

  let respons;
  try {
    // TODO 4: fetch(`${API_URL}${laluan}`, { method, headers, body: JSON.stringify(body) jika ada, signal })
    respons = await fetch(`${API_URL}${laluan}`);
  } catch (ralat) {
    // TODO 5: TimeoutError → ApiError(`Tiada respons dalam ${timeoutMs / 1000} saat`, 0)
    //         AbortError   → lontar semula error asal (pemanggil yang batalkan)
    //         selainnya    → ApiError('Tidak dapat menghubungi pelayan. Adakah mock API sedang berjalan?', 0)
    throw ralat;
  }

  // TODO 6: 204 → return null
  // TODO 7: baca JSON HANYA jika content-type mengandungi 'json' (awas: 'application/geo+json'!)
  // TODO 8: jika !respons.ok → throw new ApiError(data?.ralat ?? `HTTP ${status}`, status, data?.medan)
  return respons.json();
}

/** Bina query string; abaikan nilai kosong; array (cth bbox) → dicantum koma. */
function bina(tapisan) {
  // TODO 9: URLSearchParams — langkau undefined/null/''; Array.isArray(nilai) → nilai.join(',')
  return '';
}

// TODO 10: lengkapkan setiap fungsi dengan memanggil mintaJson. Guna encodeURIComponent(id) untuk id.

/** → FeatureCollection */
export function senaraiLaporan(tapisan = {}, { signal } = {}) {
  return mintaJson(`/api/laporan${bina(tapisan)}`, { signal });
}

/** → Feature */
export function dapatkanLaporan(id) {}

/** POST → 201 Feature */
export function ciptaLaporan(data) {}

/** PATCH → Feature */
export function kemaskiniLaporan(id, perubahan) {}

/** DELETE → null (204) */
export function padamLaporan(id) {}

/** → [{ kod, nama, warna }] */
export function senaraiKategori() {}

/** → [{ id, nama, jenis, url }] */
export function senaraiLapisan() {}

/** → FeatureCollection */
export function dapatkanLapisan(id) {}

/** → { jumlah, ikutKategori, ikutStatus } */
export function dapatkanStatistik() {}
