// ─────────────────────────────────────────────────────────────────────────────
// Latihan 03 — S2 · Format vektor: nama medan DBF & koordinat RSO (Checkpoint C)
// Jalankan: node latihan-03.js   (atau butang Jalankan di Pelatih — tiada npm, tiada rangkaian)
// Setiap bahagian BERDIRI SENDIRI: A, B dan C hanya guna data di bawah.
// ─────────────────────────────────────────────────────────────────────────────

// Medan properties zon sebelum dieksport ke Shapefile (fail .dbf).
const medanZon = ['kod', 'nama', 'keluasan_ha'];
// Medan laporan GeoLapor sebagai jadual: dua medan koordinat bermula dengan 10 aksara yang sama.
const medanLaporan = ['id', 'tajuk', 'status', 'koordinat_lat', 'koordinat_lng'];

// ── A. Had 10 aksara DBF ─────────────────────────────────────────────────────
// TODO A: namaMedanDbf(nama) → nama medan seperti yang disimpan dalam .dbf: MAKSIMUM 10 aksara
//   (aksara ke-11 dan seterusnya dibuang). Inilah sebabnya `keluasan_ha` kembali sebagai `keluasan_h`.
function namaMedanDbf(nama) {
  return nama;
}

console.log('A1', namaMedanDbf('keluasan_ha')); // ⇒ A1 keluasan_h
console.log('A2', medanZon.map(namaMedanDbf).join(', ')); // ⇒ A2 kod, nama, keluasan_h

// ── B. Nama bertembung selepas dipotong ──────────────────────────────────────
// TODO B: medanDbfUnik(senarai) → nama DBF yang UNIK, gaya GDAL/QGIS:
//   potong ke 10 aksara; jika nama itu sudah digunakan, ambil 8 aksara pertama + '_1'
//   (kemudian '_2', '_3', … sehingga unik).
function medanDbfUnik(senarai) {
  return senarai;
}

console.log('B1', medanDbfUnik(medanLaporan).join(', ')); // ⇒ B1 id, tajuk, status, koordinat_, koordina_1
console.log('B2', medanDbfUnik(['nama_pegawai', 'nama_pegawai_2', 'nama_pegawai_3']).join(', ')); // ⇒ B2 nama_pegaw, nama_peg_1, nama_peg_2

// ── C. Darjah atau meter? ────────────────────────────────────────────────────
// TODO C: jenisKoordinat([x, y]) → 'darjah' jika |x| <= 180 dan |y| <= 90, jika tidak 'meter'.
//   Koordinat dalam meter (RSO, EPSG:3375) perlu diunjur semula ke WGS84 sebelum dipaparkan di Leaflet.
function jenisKoordinat([x, y]) {
  return undefined;
}

console.log('C1 zon RSO:', jenisKoordinat([407029.9, 325142.5])); // ⇒ C1 zon RSO: meter
console.log('C2 selepas keWgs84:', jenisKoordinat([101.66, 2.9377])); // ⇒ C2 selepas keWgs84: darjah
console.log('C3 y terlalu besar:', jenisKoordinat([101.66, 325142.5])); // ⇒ C3 y terlalu besar: meter
