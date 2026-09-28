// ─────────────────────────────────────────────────────────────────────────────
// Latihan 04 — S3 · Event Handling: tapisan, carian debounce, delegasi, event peta
// Buka: http://localhost:5500/?l=04
// Kod senarai & peta sudah disediakan dalam ui/ (versi siap Latihan 02 & 03).
// Rujukan: hari-3/README.md §S3.
// ─────────────────────────────────────────────────────────────────────────────
import L from './lib/leaflet.js';
import { senaraiLaporan, senaraiKategori, padamLaporan, ApiError } from './services/api.js';
import { renderSenarai, isiPilihanKategori, indeksKategori } from './ui/senarai.js';
import { binaPeta, lapisanLaporan, tambahLapisanRujukan, keLatLng } from './ui/peta.js';
import { semak, ringkasan } from './lib/semak.js';

// ── Kod sedia: rujukan elemen + peta + keadaan ─────────────────────────────
const ul = document.getElementById('senarai-laporan');
const kiraan = document.getElementById('kiraan');
const carian = document.getElementById('carian');
const pilihKategori = document.getElementById('tapis-kategori');
const pilihStatus = document.getElementById('tapis-status');
const borang = document.getElementById('borang-laporan');

const { peta, kawalan } = binaPeta('peta');
const kategori = indeksKategori(await senaraiKategori());
isiPilihanKategori(pilihKategori, [...kategori].map(([kod, k]) => ({ kod, ...k })));
isiPilihanKategori(borang.elements.kategori, [...kategori].map(([kod, k]) => ({ kod, ...k })));
tambahLapisanRujukan(peta, kawalan).catch(console.warn);

const tapisan = { kategori: '', status: '', q: '' };
let lapisan = null; // L.GeoJSON laporan semasa
let indeks = new Map(); // id → layer
let pengawal = null; // AbortController request terakhir

async function muatSemula() {
  pengawal?.abort(); // batalkan request lama — elak response lambat menimpa yang baharu
  pengawal = new AbortController();
  ul.setAttribute('aria-busy', 'true');
  try {
    const fc = await senaraiLaporan(tapisan, { signal: pengawal.signal });
    renderSenarai(ul, fc.features, kategori);
    kiraan.textContent = `${fc.features.length} laporan`;
    lapisan?.remove();
    ({ lapisan, indeks } = lapisanLaporan(fc, kategori));
    lapisan.addTo(peta);
    // TODO 6 — Klik marker → sorot kad. Event marker "naik" ke kumpulan L.GeoJSON:
    //   lapisan.on('click', (e) => sorotKad(e.layer.feature.properties.id));
  } catch (ralat) {
    if (ralat.name === 'AbortError') return; // sengaja dibatalkan — bukan error
    kiraan.textContent = ralat instanceof ApiError ? `⚠️ ${ralat.message}` : '⚠️ Ralat';
  } finally {
    ul.removeAttribute('aria-busy');
  }
}

// TODO 1 — Tambah listener 'change' pada pilihKategori DAN pilihStatus.
//   Dalam handler: tapisan[e.target.name] = e.target.value; muatSemula();
//   Petua: satu loop for…of atas [pilihKategori, pilihStatus].

// TODO 2 — Tulis debounce(fn, ms): pulangkan fungsi baharu yang hanya memanggil fn
//   selepas ms milisaat TANPA panggilan lain. (clearTimeout + setTimeout + closure)
function debounce(fn, ms = 300) {
  // TODO
  return fn; // ← ganti
}

// TODO 3 — Carian: listener 'input' pada #carian → cariTertunda(e.target.value)
//   cariTertunda = debounce((nilai) => { tapisan.q = nilai.trim(); muatSemula(); }, 300)
//   Bonus: listener 'keyup' — jika e.key === 'Escape', kosongkan carian.

// TODO 4 — Delegasi: SATU listener 'click' pada ul.
//   const kad = e.target.closest('li.kad'); jika tiada → return
//   const tindakan = e.target.closest('button[data-tindakan]')?.dataset.tindakan ?? 'zum';
//   'zum'   → zumKe(kad.dataset.id)
//   'padam' → confirm() → await padamLaporan(id) → await muatSemula()  (try…catch!)
function sorotKad(id) {
  for (const li of ul.querySelectorAll('.kad.aktif')) li.classList.remove('aktif');
  const li = ul.querySelector(`[data-id="${CSS.escape(id)}"]`);
  li?.classList.add('aktif');
  li?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function zumKe(id) {
  // TODO: layer = indeks.get(id) → peta.flyTo(layer.getLatLng(), 17) → layer.openPopup() → sorotKad(id)
}

// TODO 5 — peta.on('click', (e) => { ... })
//   Isi borang.elements.lat/lng dengan e.latlng.lat/lng .toFixed(6)
//   Letak/alih satu L.marker sementara (draggable) di e.latlng.  ⚠️ e.latlng ialah {lat, lng} — bukan [lng, lat].

await muatSemula();

// ── Semakan automatik (jangan ubah) ────────────────────────────────────────
const jumlahAwal = ul.children.length;
pilihStatus.value = 'selesai';
pilihStatus.dispatchEvent(new Event('change', { bubbles: true }));
await new Promise((r) => setTimeout(r, 400));
semak('1  tapisan status mengurangkan senarai', ul.children.length < jumlahAwal && ul.children.length > 0);
pilihStatus.value = '';
pilihStatus.dispatchEvent(new Event('change', { bubbles: true }));
await new Promise((r) => setTimeout(r, 400));

let dipanggil = 0;
const d = debounce(() => dipanggil++, 50);
d(); d(); d();
await new Promise((r) => setTimeout(r, 120));
semak('2  debounce: 3 panggilan pantas → 1 pelaksanaan', dipanggil === 1);

const idPertama = ul.firstElementChild?.dataset.id;
ul.firstElementChild?.querySelector('.kad-tajuk').click();
semak('4  klik kad → kad ditanda aktif', ul.firstElementChild?.classList.contains('aktif'));
semak('4b popup dibuka untuk laporan sama', indeks.get(idPertama)?.isPopupOpen());
const idKedua = ul.children[1]?.dataset.id;
indeks.get(idKedua)?.fire('click', { latlng: indeks.get(idKedua).getLatLng() }, true);
semak('6  klik marker → kad sepadan disorot', ul.querySelector('.kad.aktif')?.dataset.id === idKedua);

peta.fire('click', { latlng: L.latLng(2.95, 101.7) });
semak('5  klik peta → lat/lng borang diisi', borang.elements.lat.value === '2.950000' && borang.elements.lng.value === '101.700000');
semak('✳ keLatLng([101.7, 2.95]) → [2.95, 101.7]', keLatLng([101.7, 2.95]).join() === '2.95,101.7');

ringkasan('Latihan 04');
