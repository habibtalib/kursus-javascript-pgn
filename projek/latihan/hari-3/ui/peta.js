// ui/peta.js — KOD SEDIA (versi siap Latihan 03) untuk Latihan 04 & 05.
// INGAT: Leaflet guna [lat, lng]; GeoJSON guna [lng, lat].
import L from '../lib/leaflet.js';
import { dapatkanLapisan, senaraiLapisan } from '../services/api.js';

export const PUSAT_PUTRAJAYA = [2.9264, 101.6958]; // [lat, lng] — susunan Leaflet!

/** Cipta peta + tile OSM + kawalan skala + kawalan layer. */
export function binaPeta(idElemen = 'peta') {
  const peta = L.map(idElemen, { zoomControl: true }).setView(PUSAT_PUTRAJAYA, 13);

  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(peta);

  L.control.scale({ imperial: false }).addTo(peta);
  const kawalan = L.control.layers({ OpenStreetMap: osm }, {}, { collapsed: false }).addTo(peta);
  return { peta, kawalan };
}

/** Kandungan popup sebagai ELEMEN DOM — bindPopup(string) = innerHTML = risiko XSS. */
export function kandunganPopup(feature) {
  const { id, tajuk, kategori, status, catatan } = feature.properties;
  const div = document.createElement('div');
  div.className = 'popup';
  const tajukEl = document.createElement('strong');
  tajukEl.textContent = tajuk;
  const meta = document.createElement('p');
  meta.textContent = `${id} · ${kategori} · ${status}`;
  div.append(tajukEl, meta);
  if (catatan) {
    const p = document.createElement('p');
    p.textContent = catatan;
    div.append(p);
  }
  return div;
}

/**
 * Layer laporan (titik) sebagai circleMarker berwarna ikut kategori.
 * @returns {{ lapisan: L.GeoJSON, indeks: Map<string, L.CircleMarker> }}
 */
export function lapisanLaporan(fc, kategori = new Map()) {
  const indeks = new Map(); // id laporan → layer, untuk "klik senarai → zum marker"
  const lapisan = L.geoJSON(fc, {
    pointToLayer: (feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 7,
        weight: 2,
        color: '#ffffff',
        fillColor: kategori.get(feature.properties.kategori)?.warna ?? '#616e7c',
        fillOpacity: 0.9,
      }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup(() => kandunganPopup(feature)); // fungsi → dibina bila dibuka
      layer.bindTooltip(document.createTextNode(feature.properties.tajuk));
      indeks.set(feature.properties.id, layer);
    },
  });
  // Pastikan addData (laporan baharu) juga masuk indeks — onEachFeature dipanggil semula.
  return { lapisan, indeks };
}

const GAYA_LAPISAN = {
  'sempadan-zon': { color: '#7b61ff', weight: 2, fillOpacity: 0.08, dashArray: '6 4' },
  sungai: { color: '#1d7fd1', weight: 3 },
};

/** Muat semua layer rujukan dari API dan daftar dalam kawalan layer. */
export async function tambahLapisanRujukan(peta, kawalan) {
  const senarai = await senaraiLapisan();
  const hasil = await Promise.allSettled(senarai.map((m) => dapatkanLapisan(m.id)));
  hasil.forEach((h, i) => {
    const meta = senarai[i];
    if (h.status === 'rejected') {
      console.warn(`Lapisan ${meta.id} gagal dimuat:`, h.reason.message);
      return;
    }
    const lapisan = L.geoJSON(h.value, {
      style: () => GAYA_LAPISAN[meta.id] ?? { color: '#444', weight: 1 },
      pointToLayer: (_f, latlng) =>
        L.circleMarker(latlng, { radius: 5, color: '#8a4b08', fillColor: '#f59e0b', fillOpacity: 0.9, weight: 1 }),
      onEachFeature: (f, layer) => layer.bindTooltip(document.createTextNode(f.properties.nama ?? f.properties.kod ?? meta.nama)),
    });
    kawalan.addOverlay(lapisan, meta.nama);
    if (meta.id === 'sempadan-zon') lapisan.addTo(peta).bringToBack();
  });
}

/** GeoJSON [lng, lat] → Leaflet [lat, lng]. Tulis sekali, guna di mana-mana. */
export const keLatLng = ([lng, lat]) => [lat, lng];
