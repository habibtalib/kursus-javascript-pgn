# Mock API GeoLapor

Server REST tiruan untuk Kursus Pengaturcaraan JavaScript (PGN). Kontrak penuh (endpoint, validasi, ralat) terperinci di bawah.

- **Tiada dependency.** Hanya modul terbina dalam Node (`node:http`, `node:fs`, `node:url`, `node:path`). Tiada internet diperlukan.
- **Data sintetik** sahaja: 40 laporan di sekitar Putrajaya/Cyberjaya, pelapor `pegawai1..5@latihan.test`.
- **CORS dibuka** (`*`), termasuk *preflight* `OPTIONS` untuk header `Content-Type` dan `X-API-Key`.

## Jalankan

```bash
cd projek/api
npm start            # http://localhost:3000
npm run dev          # sama, tetapi mula semula automatik bila server.mjs diubah (node --watch)
npm run reset-data   # pulihkan data/laporan.json daripada data/asal/laporan.json
PORT=3001 npm start  # port lain jika 3000 sudah digunakan
```

**Windows (PowerShell):**

```powershell
# cd, npm start, npm run dev dan npm run reset-data sama seperti di atas. Hanya port lain berbeza:
$env:PORT = "3001"; npm start   # kekal dalam sesi terminal ini; buang dengan: Remove-Item Env:PORT
```

Keperluan: Node.js 22+. `npm install` tidak diperlukan (tiada pakej), tetapi selamat dijalankan.

Setiap request dilog ke konsol:

```text
[09:15:02] GET    /api/laporan?kategori=tanah → 200 (1 ms)
[09:15:07] POST   /api/laporan → 422 (0 ms)
```

## Fail

| Fail | Guna |
|------|------|
| `server.mjs` | Server (satu fail, boleh dibaca dari atas ke bawah) |
| `reset-data.mjs` | Skrip `npm run reset-data` |
| `data/laporan.json` | Data kerja — diubah oleh POST/PATCH/DELETE |
| `data/asal/laporan.json` | Salinan asal (jangan ubah) |
| `data/lapisan/*.geojson` | Layer rujukan: `sempadan-zon`, `sungai`, `kemudahan` |

Data dijana oleh `projek/data/jana/jana-data.mjs` (lihat [`../data/README.md`](../data/README.md)). Server membaca `data/laporan.json` pada setiap request, jadi `npm run reset-data` berkesan serta-merta walaupun server sedang berjalan.

## Endpoint

| Method | Endpoint | Response |
|--------|----------|---------|
| GET | `/api/kesihatan` | `{ "ok": true, "masa": "…+08:00" }` |
| GET | `/api/kategori` | `[{ "kod", "nama", "warna" }]` |
| GET | `/api/laporan` | GeoJSON `FeatureCollection` (+ `jumlah`, header `X-Jumlah`) |
| GET | `/api/laporan/:id` | `Feature` · 404 |
| POST | `/api/laporan` 🔑 | 201 `Feature` (+ header `Location`) · 401 · 422 |
| PATCH | `/api/laporan/:id` 🔑 | 200 `Feature` · 401 · 404 · 422 |
| DELETE | `/api/laporan/:id` 🔑 | 204 · 401 · 404 |
| GET | `/api/lapisan` | `[{ "id", "nama", "jenis", "url" }]` |
| GET | `/api/lapisan/:id` | GeoJSON `FeatureCollection` · 404 |
| GET | `/api/statistik` | `{ jumlah, ikutKategori, ikutStatus }` |
| GET | `/data/…` | Fail statik daripada `projek/data/` (senarai fail di `/data/`) |

🔑 = perlu header `X-API-Key: latihan-pgn-2026`.

**Error** sentiasa JSON: `{ "ralat": "…" }`. Validasi (422) menambah `medan`:

```json
{ "ralat": "Data laporan tidak sah", "medan": { "tajuk": "Tajuk wajib, 5–120 aksara", "lng": "Longitud mesti dalam Malaysia (99.5–119.5)" } }
```

**Peraturan validasi** (POST; PATCH mengesahkan medan yang dihantar sahaja):

| Medan | Peraturan |
|-------|-----------|
| `tajuk` | wajib, string 5–120 aksara (selepas `trim`) |
| `kategori` | `infrastruktur` · `alam-sekitar` · `tanah` · `utiliti` · `lain-lain` |
| `lat`, `lng` | **nombor** (bukan string) dalam kotak Malaysia: lat 0.8–7.5, lng 99.5–119.5 |
| `catatan` | pilihan, string ≤ 500 aksara |
| `status` (PATCH) | `baharu` · `dalam-tindakan` · `selesai` · `ditolak` |
| `pelapor` (pilihan) | e-mel `…@latihan.test` (default `pegawai1@latihan.test`) |

**Mod pengajaran** (mana-mana endpoint, termasuk `/data/…`):

| Query | Kesan |
|-------|-------|
| `?lambat=1500` | Lengahkan response 1500 ms (maks 30 s) — latih *loading state*, timeout, `AbortController` |
| `?gagal=1` | Paksa `500 { "ralat": "Ralat pelayan disimulasikan (?gagal=1)" }` — latih `try…catch` & rollback |

## Contoh `curl`

> 🪟 **Windows:** jalankan contoh bash di bawah dalam **Git Bash**. Dalam Windows PowerShell, `curl` ialah alias kepada `Invoke-WebRequest` (bukan curl sebenar), jadi guna `curl.exe` (GET sahaja; PowerShell 5 merosakkan `"` dalam badan JSON) atau versi `Invoke-RestMethod` selepas blok bash.

```bash
API=http://localhost:3000
KUNCI='X-API-Key: latihan-pgn-2026'

# Kesihatan & rujukan
curl $API/api/kesihatan
curl $API/api/kategori
curl $API/api/statistik

# Senarai laporan + penapis (boleh digabung)
curl "$API/api/laporan"
curl "$API/api/laporan?kategori=tanah"
curl "$API/api/laporan?status=baharu,dalam-tindakan"        # koma = beberapa nilai
curl "$API/api/laporan?q=sungai"                           # cari dalam tajuk (tidak sensitif huruf)
curl "$API/api/laporan?bbox=101.66,2.88,101.70,2.92"       # minLng,minLat,maxLng,maxLat
curl "$API/api/laporan?had=5&mula=10"                      # halaman: 5 rekod bermula indeks 10
curl -i "$API/api/laporan?had=1" | grep -i x-jumlah        # jumlah padanan sebelum had/mula

# Satu laporan
curl $API/api/laporan/LPR-0001
curl -i $API/api/laporan/LPR-9999                          # 404 { "ralat": "Laporan LPR-9999 tidak dijumpai" }

# Cipta — bentuk rata ATAU GeoJSON Feature
curl -X POST $API/api/laporan -H "$KUNCI" -H 'Content-Type: application/json' \
  -d '{"tajuk":"Lampu jalan tidak berfungsi","kategori":"infrastruktur","catatan":"Depan blok C","lat":2.9264,"lng":101.6958}'
curl -X POST $API/api/laporan -H "$KUNCI" -H 'Content-Type: application/json' \
  -d '{"type":"Feature","geometry":{"type":"Point","coordinates":[101.7,2.95]},"properties":{"tajuk":"Paip air bocor","kategori":"utiliti"}}'

# 401 — tiada key
curl -i -X POST $API/api/laporan -H 'Content-Type: application/json' -d '{"tajuk":"Ujian"}'

# 422 — tidak sah (tajuk pendek, kategori salah, lat string, lng di luar Malaysia)
curl -i -X POST $API/api/laporan -H "$KUNCI" -H 'Content-Type: application/json' \
  -d '{"tajuk":"abc","kategori":"x","lat":"2.9","lng":150}'

# Kemas kini sebahagian
curl -X PATCH $API/api/laporan/LPR-0001 -H "$KUNCI" -H 'Content-Type: application/json' -d '{"status":"dalam-tindakan"}'
curl -X PATCH $API/api/laporan/LPR-0001 -H "$KUNCI" -H 'Content-Type: application/json' -d '{"catatan":"Pasukan dihantar","lat":2.927,"lng":101.696}'

# Padam
curl -i -X DELETE $API/api/laporan/LPR-0041 -H "$KUNCI"     # 204 (tiada badan)

# Layer rujukan
curl $API/api/lapisan
curl $API/api/lapisan/sempadan-zon
curl $API/api/lapisan/sungai
curl $API/api/lapisan/kemudahan

# Mod pengajaran
time curl "$API/api/laporan?lambat=2000" -o /dev/null -s   # ≈ 2 s
curl -i "$API/api/statistik?gagal=1"                       # 500

# Preflight CORS (apa yang browser hantar sebelum POST dengan X-API-Key)
curl -i -X OPTIONS $API/api/laporan -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type,x-api-key'

# Fail statik projek/data
curl $API/data/
curl -O $API/data/sempadan-zon.geojson
curl -O $API/data/kemudahan.gpkg
```

**Windows (PowerShell):**

```powershell
$api   = 'http://localhost:3000'
$kunci = @{ 'X-API-Key' = 'latihan-pgn-2026' }
$jenis = 'application/json; charset=utf-8'
# 4xx/5xx membaling ralat dalam Windows PowerShell → try { … } catch { kod status; badan }

# Kesihatan & rujukan
Invoke-RestMethod "$api/api/kesihatan"
Invoke-RestMethod "$api/api/kategori"
Invoke-RestMethod "$api/api/statistik"

# Senarai laporan + penapis (boleh digabung) — petik URL yang ada &
Invoke-RestMethod "$api/api/laporan"
Invoke-RestMethod "$api/api/laporan?kategori=tanah"
Invoke-RestMethod "$api/api/laporan?status=baharu,dalam-tindakan"
Invoke-RestMethod "$api/api/laporan?q=sungai"
Invoke-RestMethod "$api/api/laporan?bbox=101.66,2.88,101.70,2.92"
Invoke-RestMethod "$api/api/laporan?had=5&mula=10"
(Invoke-WebRequest -UseBasicParsing "$api/api/laporan?had=1").Headers['X-Jumlah']   # jumlah padanan sebelum had/mula

# Satu laporan
Invoke-RestMethod "$api/api/laporan/LPR-0001"
try { Invoke-WebRequest -UseBasicParsing "$api/api/laporan/LPR-9999" } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }   # 404

# Cipta — bentuk rata ATAU GeoJSON Feature
$rata = @{ tajuk = 'Lampu jalan tidak berfungsi'; kategori = 'infrastruktur'; catatan = 'Depan blok C'; lat = 2.9264; lng = 101.6958 }
Invoke-RestMethod -Method Post -Uri "$api/api/laporan" -Headers $kunci -ContentType $jenis -Body ($rata | ConvertTo-Json -Depth 10)
$feature = @{
  type       = 'Feature'
  geometry   = @{ type = 'Point'; coordinates = @(101.7, 2.95) }
  properties = @{ tajuk = 'Paip air bocor'; kategori = 'utiliti' }
}
Invoke-RestMethod -Method Post -Uri "$api/api/laporan" -Headers $kunci -ContentType $jenis -Body ($feature | ConvertTo-Json -Depth 10)

# 401 — tiada key
try { Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$api/api/laporan" -ContentType $jenis -Body (@{ tajuk = 'Ujian' } | ConvertTo-Json -Depth 10) } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }

# 422 — tidak sah (tajuk pendek, kategori salah, lat string, lng di luar Malaysia)
$salah = @{ tajuk = 'abc'; kategori = 'x'; lat = '2.9'; lng = 150 } | ConvertTo-Json -Depth 10
try { Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$api/api/laporan" -Headers $kunci -ContentType $jenis -Body $salah } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }

# Kemas kini sebahagian
Invoke-RestMethod -Method Patch -Uri "$api/api/laporan/LPR-0001" -Headers $kunci -ContentType $jenis -Body (@{ status = 'dalam-tindakan' } | ConvertTo-Json -Depth 10)
Invoke-RestMethod -Method Patch -Uri "$api/api/laporan/LPR-0001" -Headers $kunci -ContentType $jenis `
  -Body (@{ catatan = 'Pasukan dihantar'; lat = 2.927; lng = 101.696 } | ConvertTo-Json -Depth 10)

# Padam
(Invoke-WebRequest -UseBasicParsing -Method Delete -Uri "$api/api/laporan/LPR-0041" -Headers $kunci).StatusCode   # 204 (tiada badan)

# Layer rujukan
Invoke-RestMethod "$api/api/lapisan"
Invoke-RestMethod "$api/api/lapisan/sempadan-zon"
Invoke-RestMethod "$api/api/lapisan/sungai"
Invoke-RestMethod "$api/api/lapisan/kemudahan"

# Mod pengajaran
(Measure-Command { Invoke-WebRequest -UseBasicParsing "$api/api/laporan?lambat=2000" }).TotalSeconds   # ≈ 2
try { Invoke-WebRequest -UseBasicParsing "$api/api/statistik?gagal=1" } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }   # 500

# Preflight CORS (apa yang browser hantar sebelum POST dengan X-API-Key)
$r = Invoke-WebRequest -UseBasicParsing -Method Options -Uri "$api/api/laporan" -Headers @{
  'Origin'                         = 'http://localhost:5173'
  'Access-Control-Request-Method'  = 'POST'
  'Access-Control-Request-Headers' = 'content-type,x-api-key'
}
$r.StatusCode; $r.Headers

# Fail statik projek/data
(Invoke-WebRequest -UseBasicParsing "$api/data/").Content
Invoke-WebRequest -UseBasicParsing "$api/data/sempadan-zon.geojson" -OutFile sempadan-zon.geojson
Invoke-WebRequest -UseBasicParsing "$api/data/kemudahan.gpkg" -OutFile kemudahan.gpkg
```

Windows PowerShell: guna `curl.exe` (bukan alias `curl`) dan petikan berganda dengan `\"` dalam JSON, atau `Invoke-RestMethod`.

## Nota keselamatan (untuk perbincangan kelas)

- `latihan-pgn-2026` ialah key **latihan**. Apa-apa key dalam kod frontend boleh dibaca oleh sesiapa melalui DevTools — sistem sebenar menggunakan sesi/OAuth di server.
- `Access-Control-Allow-Origin: *` sesuai untuk latihan sahaja.
- Laluan `/data/…` menolak *path traversal* (`..`) dan tidak menghidang `node_modules`.
