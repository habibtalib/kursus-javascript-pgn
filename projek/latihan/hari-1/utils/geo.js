// utils/geo.js — utiliti geospatial tulen (tiada DOM, tiada rangkaian).
// LATIHAN Hari 1 (S4). API DIKUNCI — JANGAN tukar nama/tandatangan.
// Semak kerja anda:  node semak.js
// Semua koordinat dalam susunan GeoJSON: [lng, lat].

const JEJARI_BUMI_KM = 6371;
const KOTAK_MALAYSIA = { minLng: 99.5, maxLng: 119.5, minLat: 0.8, maxLat: 7.5 };

const keRadian = (darjah) => (darjah * Math.PI) / 180;

/**
 * @param {[number, number]} koordinat [lng, lat]
 * @param {number} [dp=5]
 * @returns {string} "lat, lng" cth "2.92640, 101.69580"
 */
export function formatKoordinat([lng, lat], dp = 5) {
  // TODO 1: salin dari Latihan 03 (C1)
  return '';
}

/**
 * Jarak haversine dalam km.
 * @param {[number, number]} a [lng, lat]
 * @param {[number, number]} b [lng, lat]
 */
export function jarakKm(a, b) {
  // TODO 2: salin dari Latihan 03 (D) — guna JEJARI_BUMI_KM & keRadian
  return NaN;
}

/**
 * @param {object[]} features
 * @param {{kategori?: string, status?: string, q?: string}} [tapisan]
 * @returns {object[]} array BAHARU
 */
export function tapisLaporan(features, { kategori, status, q } = {}) {
  // TODO 3: guna filter. Kriteria kosong ('' / undefined) diabaikan.
  //   q: carian dalam properties.tajuk, TIDAK peka huruf besar/kecil (toLowerCase + includes)
  return features;
}

/**
 * @param {object[]} features
 * @param {string} medan cth 'status'
 * @returns {Record<string, number>} cth { baharu: 4, selesai: 2 }
 */
export function kiraIkut(features, medan) {
  // TODO 4: guna reduce (lihat Latihan 05, E1) — tetapi medan kini parameter
  return {};
}

/**
 * @param {object[]} features
 * @returns {[number, number, number, number] | null} [minLng, minLat, maxLng, maxLat] atau null jika kosong
 */
export function bboxDari(features) {
  // TODO 5: kumpul semua [lng, lat], kemudian Math.min(...)/Math.max(...)
  //   ⭐ Sokong LineString/Polygon juga (koordinat bersarang) — petua: fungsi rekursif + flatMap
  return null;
}

/**
 * @param {[number, number]} koordinat [lng, lat]
 * @returns {boolean}
 */
export function dalamMalaysia([lng, lat]) {
  // TODO 6: guna KOTAK_MALAYSIA (destructuring!)
  return true;
}
