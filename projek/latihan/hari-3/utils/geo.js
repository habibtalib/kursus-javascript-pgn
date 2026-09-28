// utils/geo.js — utiliti geospatial tulen (tiada DOM, tiada rangkaian).
// SALINAN hasil Hari 1 (projek/latihan/hari-1/utils/geo.js) supaya latihan Hari 3 berdiri sendiri.
// API DIKUNCI — nama & tandatangan jangan ditukar.
// Semua koordinat dalam susunan GeoJSON: [lng, lat].

const JEJARI_BUMI_KM = 6371;

/** Kotak kasar Malaysia. Singapura & Brunei juga di dalamnya — ini semakan kewarasan, bukan sempadan. */
const KOTAK_MALAYSIA = { minLng: 99.5, maxLng: 119.5, minLat: 0.8, maxLat: 7.5 };

const keRadian = (darjah) => (darjah * Math.PI) / 180;

/**
 * Format koordinat untuk paparan manusia: "lat, lng".
 * @param {[number, number]} koordinat [lng, lat] (susunan GeoJSON)
 * @param {number} [dp=5] bilangan tempat perpuluhan (5 dp ≈ 1.1 m)
 * @returns {string} cth "2.92640, 101.69580"
 */
export function formatKoordinat([lng, lat], dp = 5) {
  return `${lat.toFixed(dp)}, ${lng.toFixed(dp)}`;
}

/**
 * Jarak bulatan besar (haversine) antara dua titik, dalam km.
 * @param {[number, number]} a [lng, lat]
 * @param {[number, number]} b [lng, lat]
 * @returns {number}
 */
export function jarakKm([lng1, lat1], [lng2, lat2]) {
  const dLat = keRadian(lat2 - lat1);
  const dLng = keRadian(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(keRadian(lat1)) * Math.cos(keRadian(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * JEJARI_BUMI_KM * Math.asin(Math.sqrt(h));
}

/**
 * Tapis laporan. Setiap kriteria pilihan; kriteria kosong diabaikan.
 * @param {object[]} features senarai GeoJSON Feature
 * @param {{kategori?: string, status?: string, q?: string}} [tapisan]
 * @returns {object[]} array BAHARU (asal tidak diubah)
 */
export function tapisLaporan(features, { kategori, status, q } = {}) {
  const carian = q?.trim().toLowerCase();
  return features.filter(({ properties: p }) => {
    if (kategori && p.kategori !== kategori) return false;
    if (status && p.status !== status) return false;
    if (carian && !p.tajuk.toLowerCase().includes(carian)) return false;
    return true;
  });
}

/**
 * Kira bilangan feature ikut nilai satu medan properties.
 * @param {object[]} features
 * @param {string} medan cth 'kategori' atau 'status'
 * @returns {Record<string, number>} cth { baharu: 5, selesai: 2 }
 */
export function kiraIkut(features, medan) {
  return features.reduce((kiraan, f) => {
    const nilai = f.properties?.[medan] ?? '(tiada)';
    kiraan[nilai] = (kiraan[nilai] ?? 0) + 1;
    return kiraan;
  }, {});
}

/** Kumpul semua pasangan [lng, lat] daripada sebarang geometri (Point, LineString, Polygon, Multi*). */
function semuaKoordinat(koordinat) {
  if (typeof koordinat[0] === 'number') return [koordinat]; // satu kedudukan
  return koordinat.flatMap(semuaKoordinat); // turun satu aras
}

/**
 * Kotak sempadan (bounding box) semua feature.
 * @param {object[]} features
 * @returns {[number, number, number, number] | null} [minLng, minLat, maxLng, maxLat]; null jika tiada koordinat
 */
export function bboxDari(features) {
  const titik = features.filter((f) => f.geometry?.coordinates).flatMap((f) => semuaKoordinat(f.geometry.coordinates));
  if (titik.length === 0) return null;

  const lngs = titik.map(([lng]) => lng);
  const lats = titik.map(([, lat]) => lat);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

/**
 * Adakah titik dalam kotak kasar Malaysia? Berguna untuk mengesan [lat, lng] terbalik.
 * @param {[number, number]} koordinat [lng, lat]
 * @returns {boolean}
 */
export function dalamMalaysia([lng, lat]) {
  const { minLng, maxLng, minLat, maxLat } = KOTAK_MALAYSIA;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}
