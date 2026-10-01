# Latihan Hari 5 — State Management & Modern Frontend Architecture

Latihan **pelayar** untuk logik tulen `state/` dan `utils/` hari ini — tanpa DOM, tanpa rangkaian, tanpa build. Kerja utama hari ini tetap projek GeoLapor Vite anda ([`hari-5/lab.md`](../../../hari-5/lab.md)); latihan ini membuktikan logiknya dan disemak automatik dalam platform (semakan `⇒`). Setiap checkpoint Lab 5.1–5.3 menamakan latihannya.

| Fail | Lab · langkah | Topik |
|------|---------------|-------|
| `latihan-01.js` | 5.1 · 1–2 | Store pub/sub: `set` objek/fungsi, langkau tanpa perubahan, `langgan` → nyahlanggan, `ciptaStore` |
| `latihan-02.js` | 5.1 · 4, 8, 10 | Selector: `memoAkhir`, `pilihLaporanDitapis`, `pilihLaporanDipilih`, `pilihRingkasan`, `[lng, lat]` → `[lat, lng]` |
| `latihan-03.js` | 5.1 · 5–6 | Tindakan dengan API palsu: `muatLaporan`, `pilih`, `tukarPenapis` |
| `latihan-04.js` | 5.1 · 11 | URL: `queryDariPenapis`, `penapisDariUrl`, `adaPenapisDalamUrl` |
| `latihan-05.js` | 5.1 · 12–13 | Optimistic update: `gantiLaporan` tanpa mutasi, `tukarStatus` dengan rollback + notis |
| `latihan-06.js` | 5.2 · 2–5 | Arah dependency (`langgarArah`), kelompok grid, kiraan bucu |
| `latihan-07.js` | 5.2 · 6–7 | `bbox` dari sempadan, `debounce`, batal request lama (`AbortController`) |
| `latihan-08.js` | 5.3 · 1, 4 | Pepijat tanaman P1–P4 + handler error global |

- Setiap bahagian (A, B, C …) **berdiri sendiri**: pembantu `SEDIA` dalam kod persediaan menggantikan kebergantungan antara bahagian.
- Tanpa platform (Node 22+): `node latihan-01.js`.
