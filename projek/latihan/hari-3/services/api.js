// services/api.js — layer servis ke mock API GeoLapor.
// SALINAN hasil Hari 2 supaya latihan Hari 3 berdiri sendiri (tanpa build → API_URL ialah constant).
// Hari 4 (Vite): API_URL → import.meta.env.VITE_API_URL ?? 'http://localhost:3000'.
// API DIKUNCI — nama & tandatangan fungsi jangan ditukar.

export const API_URL = 'http://localhost:3000';

// ⚠️ Key MOCK untuk latihan sahaja. Apa-apa yang ada dalam kod frontend boleh dibaca
// sesiapa (View Source / DevTools). Sistem sebenar: token sesi pengguna / proksi di server.
const API_KEY = 'latihan-pgn-2026';

/** Error API yang bermakna untuk UI: mesej BM, kod status HTTP, dan error per medan (422). */
export class ApiError extends Error {
  /**
   * @param {string} mesej
   * @param {number} [status=0] 0 = tiada response (rangkaian / timeout)
   * @param {Record<string, string> | null} [medan=null] error per medan (422), cth { tajuk: 'Tajuk wajib…' }
   * @param {{ cause?: unknown }} [pilihan] error asal (Error cause, ES2022)
   */
  constructor(mesej, status = 0, medan = null, pilihan) {
    super(mesej, pilihan);
    this.name = 'ApiError';
    this.status = status;
    this.medan = medan ?? null;
  }
}

/**
 * Asas semua panggilan: fetch + JSON + header + timeout + error seragam.
 * @param {string} laluan cth '/api/laporan?status=baharu'
 * @param {{method?: string, body?: unknown, signal?: AbortSignal, timeoutMs?: number}} [pilihan]
 * @returns {Promise<any>} JSON response, atau null untuk 204
 */
export async function mintaJson(laluan, { method = 'GET', body, signal, timeoutMs = 10000 } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-API-Key'] = API_KEY;

  // Gabung isyarat pemanggil (cth batal carian lama) dengan had masa.
  const tamat = AbortSignal.timeout(timeoutMs);
  const isyarat = signal ? AbortSignal.any([signal, tamat]) : tamat;

  let res;
  try {
    res = await fetch(`${API_URL}${laluan}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: isyarat,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e; // dibatalkan oleh pemanggil — pemanggil yang abaikan
    if (e.name === 'TimeoutError') throw new ApiError(`Tiada respons dalam ${timeoutMs} ms`, 0, null, { cause: e });
    throw new ApiError('Tidak dapat menghubungi pelayan API. Adakah mock API berjalan?', 0, null, { cause: e });
  }

  if (res.status === 204) return null;
  // Server menghantar application/json ATAU application/geo+json → semak dengan includes('json')
  const jenis = res.headers.get('Content-Type') ?? '';
  const data = jenis.includes('json') ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    throw new ApiError(data?.ralat ?? `HTTP ${res.status}`, res.status, data?.medan);
  }
  return data;
}

/** Buang key kosong supaya URL kemas: { kategori: '', q: 'papan' } → 'q=papan'. */
function queryDari(tapisan = {}) {
  const pasangan = Object.entries(tapisan).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const qs = new URLSearchParams(pasangan).toString(); // array bbox → "a,b,c,d"
  return qs ? `?${qs}` : '';
}

/** GET /api/laporan → FeatureCollection. tapisan: { kategori, status, q, bbox, had, mula } */
export function senaraiLaporan(tapisan = {}, { signal } = {}) {
  return mintaJson(`/api/laporan${queryDari(tapisan)}`, { signal });
}

export function dapatkanLaporan(id, { signal } = {}) {
  return mintaJson(`/api/laporan/${encodeURIComponent(id)}`, { signal });
}

/** POST /api/laporan — data: { tajuk, kategori, catatan, lat, lng } → Feature (201) */
export function ciptaLaporan(data) {
  return mintaJson('/api/laporan', { method: 'POST', body: data });
}

/** PATCH /api/laporan/:id — perubahan separa, cth { status: 'selesai' } */
export function kemaskiniLaporan(id, perubahan) {
  return mintaJson(`/api/laporan/${encodeURIComponent(id)}`, { method: 'PATCH', body: perubahan });
}

/** DELETE /api/laporan/:id → null (204) */
export function padamLaporan(id) {
  return mintaJson(`/api/laporan/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** GET /api/kategori → [{ kod, nama, warna }] */
export function senaraiKategori({ signal } = {}) {
  return mintaJson('/api/kategori', { signal });
}

/** GET /api/lapisan → [{ id, nama, jenis, url }] */
export function senaraiLapisan({ signal } = {}) {
  return mintaJson('/api/lapisan', { signal });
}

/** GET /api/lapisan/:id → FeatureCollection */
export function dapatkanLapisan(id, { signal } = {}) {
  return mintaJson(`/api/lapisan/${encodeURIComponent(id)}`, { signal });
}

/** GET /api/statistik → { jumlah, ikutKategori, ikutStatus } */
export function dapatkanStatistik({ signal } = {}) {
  return mintaJson('/api/statistik', { signal });
}
