// ─────────────────────────────────────────────────────────────────────────────
// Latihan 02 — S2 · DOM Element Manipulation: render senarai dari API dengan SELAMAT
// Buka: http://localhost:5500/?l=02   (mock API mesti berjalan: cd projek/api && npm start)
// Rujukan: hari-3/README.md §S2 (template, DocumentFragment, textContent vs innerHTML)
// ─────────────────────────────────────────────────────────────────────────────
import { senaraiLaporan, senaraiKategori, ApiError } from './services/api.js';
import { formatKoordinat } from './utils/geo.js';
import { semak, ringkasan } from './lib/semak.js';

const ul = document.getElementById('senarai-laporan');
const kiraan = document.getElementById('kiraan');
const pilihKategori = document.getElementById('tapis-kategori');
const LABEL_STATUS = { baharu: 'Baharu', 'dalam-tindakan': 'Dalam tindakan', selesai: 'Selesai', ditolak: 'Ditolak' };

// TODO 1 — Lengkapkan kadLaporan(feature, kategori) → <li>
//   a) klon: document.getElementById('tpl-laporan').content.firstElementChild.cloneNode(true)
//   b) li.dataset.id = id
//   c) .kad-tajuk, .kad-kategori (nama dari Map kategori), .kad-status (LABEL_STATUS) → textContent
//   d) .kad-status: classList.add(`status-${status}`)
//   e) .kad-koordinat: `📍 ${formatKoordinat(feature.geometry.coordinates)}`
//   f) li.style.borderLeftColor = warna kategori
function kadLaporan(feature, kategori) {
  // TODO
  return document.createElement('li');
}

// TODO 2 — renderSenarai(features, kategori)
//   Bina semua kad dalam document.createDocumentFragment(), kemudian ul.replaceChildren(serpihan).
//   Kemas kini #kiraan: "40 laporan".
function renderSenarai(features, kategori) {
  // TODO
}

// TODO 3 — Isi <select id="tapis-kategori"> — satu new Option(nama, kod) bagi setiap kategori.
function isiKategori(senarai) {
  // TODO
}

// TODO 4 — Keadaan memuat: set aria-busy="true" pada ul SEBELUM fetch, buang dalam finally.
//   Jika ApiError → papar mesej dalam SATU <li class="kosong"> (textContent!).
try {
  const [fc, senaraiKat] = await Promise.all([senaraiLaporan(), senaraiKategori()]);
  const kategori = new Map(senaraiKat.map((k) => [k.kod, k]));
  isiKategori(senaraiKat);

  // TODO 5 — Demo XSS (sudah disediakan). Selepas TODO 1–2 siap, perhatikan kad pertama.
  //   Kemudian CUBA sekejap: dalam kadLaporan tukar textContent → innerHTML untuk .kad-tajuk. Apa berlaku?
  //   Pulihkan kepada textContent selepas itu!
  const jahat = structuredClone(fc.features[0]);
  jahat.properties.id = 'LPR-XSS';
  jahat.properties.tajuk = '<img src=x onerror="alert(\'XSS! kuki anda: \' + document.cookie)">Tajuk jahat';
  renderSenarai([jahat, ...fc.features], kategori);

  semak('1  kad pertama ada data-id', ul.firstElementChild?.dataset.id === 'LPR-XSS');
  semak('2  bilangan kad = bilangan feature + 1', ul.children.length === fc.features.length + 1);
  semak('3  pilihan kategori diisi (≥ 5 + "Semua")', pilihKategori.options.length >= 6);
  semak('5a tajuk jahat dipapar sebagai TEKS', ul.querySelector('.kad-tajuk')?.textContent.startsWith('<img'));
  semak('5b tiada <img> disuntik ke dalam senarai', ul.querySelector('img') === null);
} catch (ralat) {
  // TODO 4 (error)
  console.error(ralat);
} finally {
  // TODO 4 (finally)
}

ringkasan('Latihan 02');
