// ─────────────────────────────────────────────────────────────────────────────
// Latihan 03 — S2 · Peta Leaflet + L.geoJSON + layer rujukan
// Buka: http://localhost:5500/?l=03
// Rujukan: hari-3/README.md §S2 bahagian peta. Dokumentasi: https://leafletjs.com/reference.html
// ⚠️ Leaflet = [lat, lng].  GeoJSON = [lng, lat].
// ─────────────────────────────────────────────────────────────────────────────
import L from './lib/leaflet.js';
import { senaraiLaporan, senaraiKategori, senaraiLapisan, dapatkanLapisan } from './services/api.js';
import { semak, ringkasan } from './lib/semak.js';

// TODO 1 — Cipta peta dalam <div id="peta">, pusat Putrajaya (lat 2.9264, lng 101.6958), zum 13.
//   L.map('peta').setView([?, ?], 13)
const peta = null; // TODO

// TODO 2 — Tambah tile OpenStreetMap:
//   URL 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom 19,
//   attribution '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//   Tambah juga L.control.scale({ imperial: false }).
const osm = null; // TODO

// TODO 3 — Kawalan layer: L.control.layers({ OpenStreetMap: osm }, {}, { collapsed: false }).addTo(peta)
const kawalan = null; // TODO

// TODO 4 — kandunganPopup(feature) → HTMLElement (div.popup: <strong> tajuk, <p> "id · kategori · status", <p> catatan)
//   Semua teks melalui textContent. JANGAN pulangkan string HTML (bindPopup(string) = innerHTML).
function kandunganPopup(feature) {
  // TODO
  return document.createElement('div');
}

const [fc, senaraiKat] = await Promise.all([senaraiLaporan(), senaraiKategori()]);
const warna = new Map(senaraiKat.map((k) => [k.kod, k.warna]));

// TODO 5 — L.geoJSON(fc, { pointToLayer, onEachFeature }).addTo(peta)
//   pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 7, color: '#fff', weight: 2,
//                  fillColor: warna.get(feature.properties.kategori), fillOpacity: 0.9 })
//   onEachFeature: (feature, layer) => layer.bindPopup(() => kandunganPopup(feature))
//   Kemudian: kawalan.addOverlay(lapisanLaporan, 'Laporan')
const lapisanLaporan = null; // TODO

// TODO 6 — peta.fitBounds(lapisanLaporan.getBounds(), { padding: [20, 20] })

// TODO 7 — Layer rujukan: senaraiLapisan() → [{id, nama, jenis}] → dapatkanLapisan(id) (Promise.allSettled)
//   Untuk setiap satu: L.geoJSON(fc, { style, pointToLayer }) → kawalan.addOverlay(lapisan, nama)
//   style untuk garis/poligon: sempadan-zon { color:'#7b61ff', weight:2, fillOpacity:0.08, dashArray:'6 4' },
//                              sungai { color:'#1d7fd1', weight:3 }
//   'sempadan-zon' terus addTo(peta).bringToBack()

semak('1  pusat peta hampir Putrajaya (lat ~2.9)', Math.abs(peta?.getCenter().lat - 2.93) < 0.2);
semak('5a bilangan layer laporan = bilangan feature', lapisanLaporan?.getLayers().length === fc.features.length);
semak('5b layer ialah CircleMarker', lapisanLaporan?.getLayers()[0] instanceof L.CircleMarker);
semak('5c layer ingat feature asal', lapisanLaporan?.getLayers()[0].feature?.type === 'Feature');
semak('7  ≥ 3 overlay dalam kawalan', document.querySelectorAll('.leaflet-control-layers-overlays label').length >= 3);
const ll0 = lapisanLaporan?.getLayers()[0].getLatLng();
semak('✳ GeoJSON [lng,lat] → Leaflet LatLng ditukar betul', ll0?.lat === fc.features[0].geometry.coordinates[1]);

ringkasan('Latihan 03');
