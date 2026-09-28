// lib/leaflet.js — muat Leaflet 1.9.4 sebagai ES module TANPA build.
// 1) Cuba CDN (unpkg). 2) Jika gagal (tiada internet / CDN disekat) → salinan tempatan vendor/leaflet/.
// Guna:  import L from './lib/leaflet.js';   → L.map(...), L.tileLayer(...), L.geoJSON(...)
//
// Kenapa versi dipin (@1.9.4)? URL tanpa versi boleh bertukar ke versi major baharu esok pagi
// dan memecahkan kod anda tanpa amaran. Pin versi = keputusan sedar.

const CDN = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';
const TEMPATAN = new URL('../vendor/leaflet/leaflet-src.esm.js', import.meta.url).href;

let L;
try {
  L = await import(CDN);
} catch (ralat) {
  console.warn('[leaflet] CDN gagal — guna salinan tempatan vendor/leaflet/.', ralat.message);
  L = await import(TEMPATAN);
}

export default L;
