// data/laporan-contoh.js — FeatureCollection sintetik untuk latihan Hari 1 (luar talian).
// Semua data REKAAN (sekitar Putrajaya/Cyberjaya). Model ikut struktur laporan GeoLapor (lihat contoh di bawah).
// Susunan koordinat GeoJSON: [lng, lat]  ← longitud DAHULU!
//
// ⚠️ LPR-0010 SENGAJA mempunyai koordinat terbalik ([lat, lng]) — untuk latihan
//    mengesan data rosak dengan dalamMalaysia(). Jangan "betulkan" rekod ini.

export const laporanContoh = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'LPR-0001',
      geometry: { type: 'Point', coordinates: [101.6958, 2.9264] },
      properties: {
        id: 'LPR-0001',
        tajuk: 'Papan tanda sempadan rosak',
        kategori: 'infrastruktur',
        status: 'baharu',
        catatan: 'Tiang condong, perlu ganti.',
        pelapor: 'pegawai1@latihan.test',
        dicipta: '2026-09-01T09:15:00+08:00',
        dikemaskini: '2026-09-01T09:15:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0002',
      geometry: { type: 'Point', coordinates: [101.688, 2.9395] },
      properties: {
        id: 'LPR-0002',
        tajuk: 'Longgokan sisa binaan di tepi tasik',
        kategori: 'alam-sekitar',
        status: 'dalam-tindakan',
        catatan: 'Anggaran 3 lori. Pihak PPj dimaklumkan.',
        pelapor: 'pegawai2@latihan.test',
        dicipta: '2026-09-02T10:40:00+08:00',
        dikemaskini: '2026-09-05T14:00:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0003',
      geometry: { type: 'Point', coordinates: [101.7102, 2.9147] },
      properties: {
        id: 'LPR-0003',
        tajuk: 'Batu sempadan lot hilang',
        kategori: 'tanah',
        status: 'baharu',
        catatan: 'Lot bersebelahan kawasan pembinaan.',
        pelapor: 'pegawai3@latihan.test',
        dicipta: '2026-09-03T08:05:00+08:00',
        dikemaskini: '2026-09-03T08:05:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0004',
      geometry: { type: 'Point', coordinates: [101.6505, 2.9223] },
      properties: {
        id: 'LPR-0004',
        tajuk: 'Lampu jalan tidak berfungsi',
        kategori: 'utiliti',
        status: 'selesai',
        catatan: '4 tiang berturut-turut padam.',
        pelapor: 'pegawai1@latihan.test',
        dicipta: '2026-08-28T21:30:00+08:00',
        dikemaskini: '2026-09-04T11:20:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0005',
      geometry: { type: 'Point', coordinates: [101.6931, 2.9012] },
      properties: {
        id: 'LPR-0005',
        tajuk: 'Hakisan tebing sungai',
        kategori: 'alam-sekitar',
        status: 'baharu',
        catatan: 'Tebing runtuh kira-kira 5 meter.',
        pelapor: 'pegawai4@latihan.test',
        dicipta: '2026-09-06T16:45:00+08:00',
        dikemaskini: '2026-09-06T16:45:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0006',
      geometry: { type: 'Point', coordinates: [101.6589, 2.9301] },
      properties: {
        id: 'LPR-0006',
        tajuk: 'Penutup lurang pecah',
        kategori: 'infrastruktur',
        status: 'dalam-tindakan',
        catatan: null, // sengaja null — untuk latihan ?? (S3)
        pelapor: 'pegawai2@latihan.test',
        dicipta: '2026-09-07T07:50:00+08:00',
        dikemaskini: '2026-09-08T09:00:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0007',
      geometry: { type: 'Point', coordinates: [101.722, 2.948] },
      properties: {
        id: 'LPR-0007',
        tajuk: 'Pencerobohan tanah kerajaan',
        kategori: 'tanah',
        status: 'ditolak',
        catatan: 'Semakan mendapati lot milik persendirian.',
        pelapor: 'pegawai3@latihan.test',
        dicipta: '2026-08-30T13:10:00+08:00',
        dikemaskini: '2026-09-02T15:30:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0008',
      geometry: { type: 'Point', coordinates: [101.644, 2.917] },
      properties: {
        id: 'LPR-0008',
        tajuk: 'Paip air bocor di bahu jalan',
        kategori: 'utiliti',
        status: 'baharu',
        catatan: 'Air bertakung, risiko jalan berlubang.',
        pelapor: 'pegawai4@latihan.test',
        dicipta: '2026-09-08T12:00:00+08:00',
        dikemaskini: '2026-09-08T12:00:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0009',
      geometry: { type: 'Point', coordinates: [101.6802, 2.9555] },
      properties: {
        id: 'LPR-0009',
        tajuk: 'Tanda aras (benchmark) terhakis',
        kategori: 'lain-lain',
        status: 'selesai',
        catatan: 'Plat tanda aras dicat semula.',
        pelapor: 'pegawai1@latihan.test',
        dicipta: '2026-08-25T10:00:00+08:00',
        dikemaskini: '2026-08-29T10:00:00+08:00',
      },
    },
    {
      type: 'Feature',
      id: 'LPR-0010',
      // ⚠️ SENGAJA TERBALIK: sepatutnya [101.7010, 2.9350]
      geometry: { type: 'Point', coordinates: [2.935, 101.701] },
      properties: {
        id: 'LPR-0010',
        tajuk: 'Pokok tumbang menghalang laluan',
        kategori: 'infrastruktur',
        status: 'baharu',
        catatan: 'Dilaporkan melalui telefon.',
        pelapor: 'pegawai2@latihan.test',
        dicipta: '2026-09-09T06:30:00+08:00',
        dikemaskini: '2026-09-09T06:30:00+08:00',
      },
    },
  ],
};
