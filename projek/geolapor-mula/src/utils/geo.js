// utils/geo.js — Fungsi tulen untuk data laporan GeoJSON.
// TODO [H4-S2]: SALIN modul Hari 1 anda (projek/latihan/hari-1/…) ke sini. Nama & tandatangan mesti sama dengan fail rangka di bawah (jangan ubah):
//
// ⚠️ GeoJSON sentiasa [lng, lat].
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */

/** "2.92640, 101.69580" (lat, lng) */
export function formatKoordinat([lng, lat], dp = 5) {
  throw new Error('TODO: formatKoordinat');
}

/** Jarak haversine (km) antara dua titik [lng, lat] */
export function jarakKm(a, b) {
  throw new Error('TODO: jarakKm');
}

/** Tapis Feature ikut kategori, status, q (cari tajuk, tidak sensitif huruf) → array BAHARU */
export function tapisLaporan(features, { kategori, status, q } = {}) {
  throw new Error('TODO: tapisLaporan');
}

/** { nilai: bilangan } ikut properties[medan] */
export function kiraIkut(features, medan) {
  throw new Error('TODO: kiraIkut');
}

/** [minLng, minLat, maxLng, maxLat] atau null jika kosong */
export function bboxDari(features) {
  throw new Error('TODO: bboxDari');
}

/** lng 99.5–119.5, lat 0.8–7.5 */
export function dalamMalaysia([lng, lat]) {
  throw new Error('TODO: dalamMalaysia');
}
