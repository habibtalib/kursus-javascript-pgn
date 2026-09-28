// services/api.js — SEMUA panggilan HTTP ke mock API melalui fail ini.
// TODO [H4-S2]: SALIN modul Hari 2 anda ke sini. Perubahan untuk Vite:
//   URL asas daripada .env (salin .env.example → .env):
//   `?.` — import.meta.env hanya wujud dalam Vite; dalam `node --test` ia undefined.
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */
const API_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000';
// Key LATIHAN sahaja — key sebenar TIDAK boleh berada dalam kod frontend.
const API_KEY = import.meta.env?.VITE_API_KEY ?? 'latihan-pgn-2026';

export class ApiError extends Error {
  constructor(mesej, status, medan) {
    super(mesej);
    this.name = 'ApiError';
    this.status = status;
    this.medan = medan ?? null;
  }
}

/**
 * TODO: fetch `${API_URL}${laluan}` dengan header JSON; X-API-Key (API_KEY) untuk bukan-GET;
 * timeout (AbortSignal.timeout + AbortSignal.any dengan `signal`); 204 → null;
 * !res.ok → throw new ApiError(data.ralat, res.status, data.medan).
 */
export async function mintaJson(laluan, { method = 'GET', body, signal, timeoutMs = 8000 } = {}) {
  throw new Error(`TODO: mintaJson (${API_URL}${laluan}, kunci ${API_KEY ? 'ada' : 'tiada'})`);
}

export function senaraiLaporan(tapisan = {}, { signal } = {}) {
  throw new Error('TODO: senaraiLaporan — GET /api/laporan?kategori=&status=&q=&bbox=');
}
export function dapatkanLaporan(id) {
  throw new Error('TODO: dapatkanLaporan — GET /api/laporan/:id');
}
export function ciptaLaporan(data) {
  throw new Error('TODO: ciptaLaporan — POST /api/laporan');
}
export function kemaskiniLaporan(id, perubahan) {
  throw new Error('TODO: kemaskiniLaporan — PATCH /api/laporan/:id');
}
export function padamLaporan(id) {
  throw new Error('TODO: padamLaporan — DELETE /api/laporan/:id');
}
export function senaraiKategori() {
  throw new Error('TODO: senaraiKategori — GET /api/kategori');
}
export function senaraiLapisan() {
  throw new Error('TODO: senaraiLapisan — GET /api/lapisan');
}
export function dapatkanLapisan(id) {
  throw new Error('TODO: dapatkanLapisan — GET /api/lapisan/:id');
}
export function dapatkanStatistik() {
  throw new Error('TODO: dapatkanStatistik — GET /api/statistik');
}
