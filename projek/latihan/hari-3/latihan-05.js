// ─────────────────────────────────────────────────────────────────────────────
// Latihan 05 — S4 · Form Handling: validasi, FormData, POST JSON, error 422
// Buka: http://localhost:5500/?l=05
// Hasil: halaman GeoLapor Hari 3 lengkap (peta + senarai + tapisan + borang).
// Rujukan: hari-3/README.md §S4 (FormData, Constraint Validation API, 422).
// ─────────────────────────────────────────────────────────────────────────────
import L from './lib/leaflet.js';
import { senaraiLaporan, senaraiKategori, ciptaLaporan, ApiError } from './services/api.js';
import { renderSenarai, isiPilihanKategori, indeksKategori } from './ui/senarai.js';
import { binaPeta, lapisanLaporan, tambahLapisanRujukan } from './ui/peta.js';
import { semak, ringkasan } from './lib/semak.js';

// ── Kod sedia (ringkasan Latihan 04) ───────────────────────────────────────
const ul = document.getElementById('senarai-laporan');
const kiraan = document.getElementById('kiraan');
const borang = document.getElementById('borang-laporan');
const mesej = document.getElementById('mesej-borang');
const butang = borang.querySelector('button[type="submit"]');

const { peta, kawalan } = binaPeta('peta');
const kategori = indeksKategori(await senaraiKategori());
const senaraiKat = [...kategori].map(([kod, k]) => ({ kod, ...k }));
isiPilihanKategori(document.getElementById('tapis-kategori'), senaraiKat);
isiPilihanKategori(borang.elements.kategori, senaraiKat);
tambahLapisanRujukan(peta, kawalan).catch(console.warn);

let lapisan = null;
let indeks = new Map();
async function muatSemula() {
  const fc = await senaraiLaporan();
  renderSenarai(ul, fc.features, kategori);
  kiraan.textContent = `${fc.features.length} laporan`;
  lapisan?.remove();
  ({ lapisan, indeks } = lapisanLaporan(fc, kategori));
  lapisan.addTo(peta);
}

let penanda = null;
peta.on('click', (e) => {
  borang.elements.lat.value = e.latlng.lat.toFixed(6);
  borang.elements.lng.value = e.latlng.lng.toFixed(6);
  paparRalat('lat', '');
  paparRalat('lng', '');
  penanda ??= L.marker(e.latlng).addTo(peta);
  penanda.setLatLng(e.latlng);
});
await muatSemula();

// ── TODO 1 — Lengkapkan error message BM mengikut ValidityState ──────────────
//   Key = nama property ValidityState: valueMissing, tooLong, rangeUnderflow, rangeOverflow, badInput, customError
const MESEJ = {
  tajuk: { valueMissing: 'Tajuk wajib diisi.', customError: 'Tajuk sekurang-kurangnya 5 aksara (tanpa ruang kosong).', tooLong: 'Tajuk maksimum 120 aksara.' },
  kategori: { valueMissing: 'Pilih satu kategori.' },
  catatan: { tooLong: 'Catatan maksimum 500 aksara.' },
  lat: { valueMissing: 'Klik peta untuk memilih lokasi.' /* TODO: badInput, rangeUnderflow, rangeOverflow */ },
  lng: { valueMissing: 'Klik peta untuk memilih lokasi.' /* TODO */ },
};

// mesejUntuk(el): cari key PERTAMA dalam MESEJ[el.name] yang el.validity[kunci] === true.
//   Jika tiada → pulangkan el.validationMessage (mesej default browser).
function mesejUntuk(el) {
  // TODO
  return el.validationMessage;
}

// ── TODO 2 — paparRalat(nama, teks) ─────────────────────────────────────────
//   Cari <p data-ralat-untuk="nama"> dalam borang → textContent = teks
//   Set aria-invalid="true"/"false" pada borang.elements[nama]
function paparRalat(nama, teks) {
  // TODO
}

// ── TODO 3 — sahkan(): pulangkan true jika semua medan sah ──────────────────
//   a) Peraturan tersuai: tajuk.setCustomValidity(tajuk.value && tajuk.value.trim().length < 5 ? 'pendek' : '')
//   b) Untuk setiap el dalam borang.elements (ada name & willValidate): checkValidity() → paparRalat(...)
//   c) Fokus medan PERTAMA yang salah.
function sahkan() {
  // TODO
  return borang.checkValidity();
}

// Kosongkan error bila pengguna membetulkan medan (delegasi 'input' pada borang) — sudah disediakan.
borang.addEventListener('input', (e) => {
  if (e.target.name) paparRalat(e.target.name, '');
});

// ── TODO 4 — paparRalatPelayan(ralat) → teks mesej ringkas ─────────────────
//   422 → untuk setiap [nama, teks] dalam (ralat.medan ?? {}) → paparRalat(nama, teks); pulang 'Semak medan bertanda merah.'
//   401 → 'Kunci API tidak sah (semak X-API-Key).'   lain-lain → ralat.message
function paparRalatPelayan(ralat) {
  // TODO
  return ralat.message;
}

// ── TODO 5 — submit ─────────────────────────────────────────────────────────
//   1. e.preventDefault()                        5. butang.disabled = true (elak hantar dua kali)
//   2. if (!sahkan()) return                     6. const feature = await ciptaLaporan(badan)
//   3. data = Object.fromEntries(new FormData(borang))
//   4. badan = { ...data, lat: Number(data.lat), lng: Number(data.lng) }   ← FormData = STRING!
//   7. await muatSemula(); flyTo + openPopup layer baharu (indeks.get(id)); borang.reset(); mesej ✅ (kelas 'berjaya')
//   8. catch → mesej ⚠️ paparRalatPelayan(ralat) (kelas 'gagal')   9. finally → butang.disabled = false
borang.addEventListener('submit', async (e) => {
  e.preventDefault(); // (diberi) Tanpa ini browser menghantar borang secara GET & memuat semula halaman — cuba buang sekejap, lihat URL!
  // TODO 2–9
});

// ── Semakan automatik (jangan ubah) ──────────────────────────────────────────────────────
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
borang.reset();
borang.requestSubmit(); // requestSubmit() mencetuskan event submit (submit() TIDAK)
semak('3a borang kosong → ralat tajuk dipapar', borang.querySelector('[data-ralat-untuk="tajuk"]').textContent === 'Tajuk wajib diisi.');
semak('3b fokus pada medan pertama yang salah', document.activeElement === borang.elements.tajuk);

borang.elements.tajuk.value = '   ab   ';
sahkan();
semak('3c peraturan tersuai: "   ab   " terlalu pendek', borang.elements.tajuk.validity.customError);

try {
  await ciptaLaporan({ tajuk: '', kategori: 'tiada', lat: 50, lng: 10 }); // pintas validasi klien
  semak('4  pelayan menolak data tidak sah (422)', false);
} catch (ralat) {
  semak('4  pelayan menolak data tidak sah (422)', ralat.status === 422 && Object.keys(ralat.medan ?? {}).length > 0);
  paparRalatPelayan(ralat);
  console.log('   medan 422:', ralat.medan);
}

if (new URLSearchParams(location.search).has('uji')) {
  const sebelum = ul.children.length;
  borang.reset();
  borang.elements.tajuk.value = 'Ujian borang latihan 05';
  borang.elements.kategori.value = 'lain-lain';
  borang.elements.catatan.value = '<b>bukan tebal</b> — mesti dipapar sebagai teks';
  peta.fire('click', { latlng: L.latLng(2.93, 101.69) });
  borang.requestSubmit();
  await tunggu(800);
  semak('5a laporan baharu muncul dalam senarai', ul.children.length === sebelum + 1);
  semak('5b mesej kejayaan', mesej.classList.contains('berjaya'));
  semak('5c borang dikosongkan', borang.elements.tajuk.value === '');
  console.info('ℹ️ Semakan 5 mencipta satu laporan ujian. Pulihkan data: cd projek/api && npm run reset-data');
} else {
  borang.reset();
  for (const p of borang.querySelectorAll('.ralat')) p.textContent = '';
  console.info('ℹ️ Tambah &uji pada URL untuk semakan 5 (mencipta SATU laporan ujian melalui borang).');
}

ringkasan('Latihan 05');
