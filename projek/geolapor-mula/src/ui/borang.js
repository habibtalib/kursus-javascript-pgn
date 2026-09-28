// ui/borang.js — Borang laporan baharu (#borang). TODO [H4-S2]: pindah kod Hari 3 anda ke sini.
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */

/**
 * Sediakan borang: FormData → { tajuk, kategori, catatan, lat, lng } → onHantar(data).
 * - Validasi klien: tajuk 5–120 aksara, kategori wajib, lat/lng nombor dalam Malaysia (dalamMalaysia)
 * - Error 422 daripada server: err.medan → papar dalam <p class="ralat-medan" data-ralat="…">
 * - [H4-S4] Simpan draf borang dalam localStorage pada setiap 'input'
 * @param {HTMLFormElement} form
 * @param {{ onHantar: (data: object) => Promise<void> }} pilihan
 */
export function sediakanBorang(form, { onHantar }) {
  // TODO
  throw new Error('TODO [H4-S2]: sediakanBorang belum dilaksanakan');
}

/** Isi medan lat/lng daripada klik peta. lngLat = [lng, lat] (susunan GeoJSON) */
export function isiKoordinat(form, [lng, lat]) {
  // TODO
  throw new Error('TODO [H4-S2]: isiKoordinat belum dilaksanakan');
}
