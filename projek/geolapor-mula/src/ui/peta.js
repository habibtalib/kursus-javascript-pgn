// ui/peta.js — Semua kod Leaflet di sini. (Hari 3 → pindah ke Vite pada Hari 4)
//
// ⚠️ GeoJSON = [lng, lat]  ·  Leaflet = [lat, lng]
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */
import L from 'leaflet';

const PUSAT_PUTRAJAYA = [2.925, 101.7]; // [lat, lng] untuk Leaflet

/**
 * Cipta peta Leaflet dengan tile OpenStreetMap (SUDAH SIAP — supaya halaman tidak kosong).
 * @param {HTMLElement} bekas
 * @returns {L.Map}
 */
export function ciptaPeta(bekas) {
  const peta = L.map(bekas).setView(PUSAT_PUTRAJAYA, 13);
  const jubin = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(peta);

  // Luar talian? Papar mesej, layer data tempatan tetap berfungsi.
  let bilGagal = 0;
  jubin.on('tileerror', () => {
    if (++bilGagal === 3) document.getElementById('amaran-luar-talian').hidden = false;
  });

  L.control.scale({ metric: true, imperial: false }).addTo(peta);
  return peta;
}

/**
 * TODO [H4-S2] (pindah dari Hari 3): lukis laporan sebagai L.circleMarker berwarna ikut kategori.
 * - Popup: bina dengan document.createElement + textContent (JANGAN string HTML dengan data pengguna)
 * - Klik marker → onPilih(id); guna L.DomEvent.stopPropagation(e) supaya klik peta tidak tercetus
 * @param {L.Map} peta
 * @param {object[]} features Feature laporan
 * @param {{ warnaKategori?: Record<string,string>, onPilih?: (id: string) => void }} pilihan
 */
export function lukisLaporan(peta, features, pilihan = {}) {
  // TODO
  throw new Error('TODO [H4-S2]: lukisLaporan belum dilaksanakan');
}

/**
 * TODO [H4-S2]: papar GeoJSON (layer rujukan / fail import) dengan L.geoJSON; pulangkan layer.
 * Petua: poligon guna bindTooltip (bukan popup) supaya klik peta masih sampai ke borang.
 */
export function paparGeoJSON(peta, fc, gaya = {}) {
  // TODO
  throw new Error('TODO [H4-S2]: paparGeoJSON belum dilaksanakan');
}
