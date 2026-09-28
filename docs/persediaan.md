# Persediaan Pra-Kursus — Kursus Pengaturcaraan JavaScript (PGN)

[← Indeks docs](./README.md) · [Jadual](../JADUAL.md) · [Cheat sheet JS](./cheat-sheet-js.md) · [Pautan rujukan](./pautan-rujukan.md)

> **Tarikh kursus:** 28 Sep – 2 Okt 2026 · Bilik Latihan KBS, Aras 14.
> **Siapkan senarai semak ini sekurang-kurangnya 5 hari bekerja sebelum kursus.** Komputer jabatan biasanya memerlukan **kelulusan / tiket IT** untuk memasang perisian (Node.js, VS Code, sambungan). Hantar permohonan awal. Jangan tunggu pagi Isnin.

---

## 🧭 Kenapa persediaan ini penting

Kursus ini bersifat **amali**: setiap sesi ada lab, dan aplikasi **GeoLapor** dibina sedikit demi sedikit dari Hari 1 hingga Hari 5. Jika Node.js tidak dapat dipasang pada Hari 1, peserta tidak dapat menjalankan mock API pada Hari 2. Jika `npm install` tersekat oleh proksi pada Hari 4, peserta tidak dapat berpindah ke Vite. **Setiap 10 minit yang hilang kerana pemasangan ialah 10 minit lab yang hilang.**

Bilik latihan mungkin **tiada internet yang stabil**, jadi semua lab boleh disiapkan secara luar talian dengan mock API (`http://localhost:3000`). Syaratnya: repo dan `node_modules` sudah disalin ke komputer anda **sebelum** kursus (lihat [§4 Kit luar talian](#4-kit-luar-talian-wajib)).

---

## 1. Senarai semak ringkas

| # | Perkara | Wajib? | Perlu kelulusan IT? | Tanda |
|---|---------|--------|---------------------|-------|
| 1 | Browser **Google Chrome** atau **Microsoft Edge** versi terkini | ✅ | Biasanya tidak | ☐ |
| 2 | **Visual Studio Code** (terkini) | ✅ | Ya (kebanyakan jabatan) | ☐ |
| 3 | Sambungan VS Code: ESLint, Prettier, Live Server | ✅ | Mungkin (akses Marketplace) | ☐ |
| 4 | **Node.js 22 LTS** atau lebih baharu (termasuk `npm`) | ✅ | Ya | ☐ |
| 5 | Salinan repo kursus + `node_modules` (kit luar talian) | ✅ | Tidak (salin dari USB/pemacu kongsi) | ☐ |
| 6 | Pemasangan disahkan dengan arahan di [§3](#3-sahkan-pemasangan) | ✅ | — | ☐ |
| 7 | Sambungan VS Code pilihan: Thunder Client **atau** REST Client | ⭐ Pilihan | Mungkin | ☐ |
| 8 | **Git** | ⭐ Pilihan | Ya | ☐ |
| 9 | Postman (desktop) | ⭐ Pilihan | Ya | ☐ |
| 10 | QGIS (untuk melihat fail sampel & menukar ECW) | ⭐ Pilihan | Ya | ☐ |

> 💡 **Tip — jika IT tidak sempat meluluskan:** maklumkan jurulatih **sebelum** kursus. Jurulatih boleh sediakan laptop gantian atau pakej *portable* (VS Code *zip* dan Node.js *zip* untuk Windows yang tidak memerlukan hak pentadbir).

---

## 2. Pemasangan langkah demi langkah

### 2.1 Browser — Chrome atau Edge

- Kemas kini ke versi terkini: menu **⋮ → Bantuan → Perihal Google Chrome** (atau **⋯ → Bantuan & maklum balas → Perihal Microsoft Edge**).
- Kita guna **DevTools** (`F12` atau `Ctrl+Shift+I`, macOS `Cmd+Opt+I`) setiap hari — tab **Console**, **Sources**, **Network** dan **Application**.
- Firefox juga boleh, tetapi nota dan tangkapan skrin menggunakan Chrome DevTools.

### 2.2 Visual Studio Code + sambungan

1. Muat turun dari <https://code.visualstudio.com/> dan pasang.
2. Buka panel **Extensions** (`Ctrl+Shift+X`) dan pasang:

| Sambungan | ID | Guna dalam kursus |
|-----------|----|-------------------|
| **ESLint** | `dbaeumer.vscode-eslint` | Tunjuk amaran kualiti kod terus dalam editor (Hari 4 S3) |
| **Prettier – Code formatter** | `esbenp.prettier-vscode` | Format kod automatik semasa simpan |
| **Live Server** | `ritwickdey.LiveServer` | Hidang fail HTML Hari 1–3 melalui `http://127.0.0.1:5500` (bukan `file://`) |
| ⭐ Thunder Client | `rangav.vscode-thunder-client` | Uji API dari dalam VS Code (pilihan) |
| ⭐ REST Client | `humao.rest-client` | Uji API menggunakan fail `.http` teks biasa (pilihan; mudah dikongsi) |

Jika Marketplace disekat, pasang dari baris arahan (selepas fail `.vsix` dimuat turun oleh IT):

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ritwickdey.LiveServer
# atau dari fail luar talian:
code --install-extension ./ritwickdey.LiveServer-5.7.9.vsix
```

3. Tetapan disyorkan (**File → Preferences → Settings**, cari dan tetapkan):
   - `Editor: Format On Save` → ✅
   - `Editor: Default Formatter` → *Prettier – Code formatter*
   - `Files: Auto Save` → `onFocusChange` (supaya Live Server sentiasa melihat fail terkini)

### 2.3 Node.js 22 LTS

- Muat turun pemasang **LTS** dari <https://nodejs.org/en/download>. Versi 22 (*Jod*) atau 24 (*Krypton*) sama-sama sesuai. Kursus memerlukan **v22 ke atas**.
- Windows: pilih pemasang `.msi` dan kekalkan pilihan **"Add to PATH"**. Selepas pasang, **tutup dan buka semula** terminal/VS Code supaya `PATH` baharu dibaca.
- `npm` dipasang bersama Node.js. Anda tidak perlu memasangnya berasingan.

> ⚠️ **Kesilapan lazim — Node lama dalam `PATH`.** Sesetengah komputer sudah ada Node 14/16 dari projek lama. `node -v` akan menunjukkan versi lama itu. Nyahpasang versi lama atau pastikan versi baharu berada di hadapan dalam `PATH`.

### 2.4 Git (pilihan)

- <https://git-scm.com/downloads>. Tidak wajib: repo kursus boleh disalin sebagai folder atau zip.
- Jika dipasang, tetapkan identiti **latihan** (jangan guna akaun peribadi pada komputer kongsi):
  ```bash
  git config --global user.name "Peserta Latihan"
  git config --global user.email "peserta@latihan.test"
  ```

---

## 3. Sahkan pemasangan

Buka **terminal** (VS Code: `` Ctrl+` ``; Windows: *Command Prompt* atau *PowerShell*) dan jalankan:

| Arahan | Output dijangka (contoh) | Jika gagal |
|--------|--------------------------|------------|
| `node -v` | `v22.x.x` atau `v24.x.x` (**≥ v22**) | Pasang semula Node LTS; buka semula terminal |
| `npm -v` | `10.x.x` atau lebih baharu | Datang bersama Node; semak `PATH` |
| `node -e "console.log([1,2,3].at(-1))"` | `3` | Node terlalu lama (`.at()` perlukan v16.6+) |
| `node --test --help` | Teks bantuan (tiada error) | Node terlalu lama |
| `code -v` | Nombor versi VS Code | Dalam VS Code: `Ctrl+Shift+P` → *Shell Command: Install 'code' command in PATH* |
| `git --version` *(pilihan)* | `git version 2.x` | Abaikan jika tidak memasang Git |
| `npm config get registry` | `https://registry.npmjs.org/` | Lihat [§5 Proksi](#5-proksi--firewall-jabatan) |

Ujian ringkas modul ES (sama seperti yang kita guna sepanjang kursus):

```bash
node --input-type=module -e "const s = { type: 'Point', coordinates: [101.6958, 2.9264] }; console.log(JSON.stringify(s))"
# {"type":"Point","coordinates":[101.6958,2.9264]}
```

---

## 4. Kit luar talian (WAJIB)

Bilik latihan mungkin tiada internet yang stabil. Siapkan langkah di bawah **di pejabat, dengan internet**, sebelum kursus.

### 4.1 Salin repo

1. Dapatkan folder `kursus-javascript-pgn-5-hari/` daripada jurulatih (USB / pemacu kongsi / `git clone`).
2. Letakkan di laluan **pendek tanpa ruang**, contohnya `C:\latihan\kursus-javascript-pgn-5-hari` atau `~/latihan/kursus-javascript-pgn-5-hari`.
   > ⚠️ Elakkan folder OneDrive yang di-sync. `node_modules` mengandungi ribuan fail kecil dan proses sync boleh mengunci fail semasa `npm`.

### 4.2 Pasang `node_modules` sebelum kursus

```bash
cd projek/api
npm ci                 # mock API tiada dependency — langkah ini hanya mengesahkan npm berfungsi
cd ../geolapor-mula
npm ci                 # starter Vite (Hari 4) — leaflet, turf, proj4, shpjs, togeojson, geotiff, …
```

- `npm ci` memasang **tepat** mengikut `package-lock.json`, jadi semua peserta mendapat versi yang sama. Itulah sebabnya kita guna `ci`, bukan `install`.
- Selepas berjaya, folder `node_modules/` wujud dalam setiap projek. **Jangan padam.** Jika perlu pasang semula di bilik latihan tanpa internet, cuba cache npm tempatan:
  ```bash
  npm ci --prefer-offline      # guna cache ~/.npm dahulu; hanya ke rangkaian jika tiada dalam cache
  ```
- 💡 Jurulatih juga boleh menyediakan zip `node_modules` (OS yang sama sahaja: Windows ↔ Windows) sebagai sandaran.

### 4.3 Salinan tempatan Leaflet (Hari 1–3, tanpa bundler)

Latihan Hari 1–3 memuatkan Leaflet melalui tag `<link>`/`<script>`. Tanpa internet, CDN gagal dan peta tidak dimuatkan.

1. Semak sama ada repo sudah mengandungi salinan Leaflet (contohnya folder `vendor/leaflet/` di bawah `projek/latihan/`).
2. Jika tiada, muat turun **Leaflet 1.9.4** dari <https://leafletjs.com/download.html> (zip), atau salin fail dari `projek/geolapor-mula/node_modules/leaflet/dist/` selepas `npm ci`:
   ```text
   projek/latihan/vendor/leaflet/
   ├── leaflet.css
   ├── leaflet.js
   └── images/        (marker-icon.png, marker-shadow.png, …)
   ```
3. Dalam HTML, gunakan laluan tempatan:
   ```html
   <link rel="stylesheet" href="../vendor/leaflet/leaflet.css" />
   <script src="../vendor/leaflet/leaflet.js"></script>
   ```

### 4.4 Tile peta tanpa internet

Tile OpenStreetMap (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) **memerlukan internet**. Jika tiada:

- Peta tetap berfungsi dalam **mod tanpa tile**: latar kosong, tetapi layer GeoJSON dari mock API (`/api/lapisan/sempadan-zon`, `sungai`, `kemudahan`) dan marker laporan tetap dilukis. Ini sudah cukup untuk semua lab.
- Tetapkan warna latar supaya peta tidak kelihatan "rosak":
  ```css
  #peta { background: #e8eef3; }
  ```
- ⭐ Jika jurulatih menyediakan fail PMTiles/MBTiles tempatan, ikut arahan dalam [`nota/08-web-mapping-leaflet.md`](../nota/08-web-mapping-leaflet.md).

### 4.5 Hidupkan mock API

```bash
cd projek/api
npm start              # sama dengan: node server.mjs
# (biarkan terminal ini terbuka sepanjang lab; Ctrl+C untuk henti)
```

Dalam terminal **kedua**:

```bash
curl http://localhost:3000/api/kesihatan
# {"ok":true,"masa":"2026-09-28T09:00:00+08:00"}   ← nilai masa akan berbeza
```

Atau buka <http://localhost:3000/api/kesihatan> dalam browser. Untuk memulihkan data asal selepas lab: `npm run reset-data` (dalam `projek/api`).

> 💡 Windows PowerShell lama: `curl` ialah alias kepada `Invoke-WebRequest`. Guna `curl.exe http://localhost:3000/api/kesihatan` atau buka URL dalam browser.

---

## 5. Proksi / firewall jabatan

Jika `npm ci` tersekat (`ETIMEDOUT`, `ECONNREFUSED`, `SELF_SIGNED_CERT_IN_CHAIN`), rangkaian jabatan mungkin menggunakan proksi. Dapatkan alamat proksi daripada IT, kemudian:

```bash
npm config set proxy http://proksi.jabatan.example:8080
npm config set https-proxy http://proksi.jabatan.example:8080
npm config get proxy          # sahkan
# selepas kursus / di rangkaian lain:
npm config delete proxy
npm config delete https-proxy
```

Jika proksi memintas TLS dengan sijil dalaman (error `SELF_SIGNED_CERT_IN_CHAIN`):

```bash
# ✅ Cara betul: minta fail sijil CA jabatan daripada IT
npm config set cafile "C:\\sijil\\ca-jabatan.pem"
```

> ⚠️ **Awas — `npm config set strict-ssl false`.** Arahan ini **mematikan semakan sijil TLS** untuk semua muat turun npm dan membuka ruang serangan *man-in-the-middle*. Guna **hanya** sebagai langkah sementara dengan kebenaran IT, kemudian pulihkan dengan `npm config set strict-ssl true`. Cara yang betul ialah `cafile`.

---

## 6. 🧯 Masalah lazim & penyelesaian

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Port 3000 sedang digunakan…` / `EADDRINUSE :::3000` | Port 3000 sudah digunakan (server lama masih berjalan, atau aplikasi lain) | Tutup terminal lama (`Ctrl+C`). Cari proses: macOS/Linux `lsof -i :3000`; Windows `netstat -ano \| findstr :3000` → `taskkill /PID <pid> /F`. Jalan terakhir: `PORT=3001 npm start` (Windows cmd: `set PORT=3001 && npm start`), kemudian tukar URL API aplikasi (`VITE_API_URL`) ke `:3001` |
| PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled on this system` | *Execution policy* Windows menyekat skrip `.ps1` | Guna **Command Prompt** (`cmd`) sebagai terminal VS Code, **atau** (dengan kebenaran IT) `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `'node' is not recognized…` / `command not found: node` | `PATH` belum dikemas kini | Tutup & buka semula VS Code/terminal; log keluar/masuk Windows |
| Konsol: `Access to script at 'file:///…/main.js' from origin 'null' has been blocked by CORS policy` | Membuka HTML terus dengan `file://`; modul ES (`type="module"`) **tidak** dibenarkan dari `file://` | Klik kanan HTML → **Open with Live Server** (`http://127.0.0.1:5500/…`) |
| Konsol: `Failed to fetch` / `net::ERR_CONNECTION_REFUSED` ke `localhost:3000` | Mock API tidak berjalan | `cd projek/api && npm start` |
| `npm ci` gagal: `The package-lock.json … not in sync` | `package.json` diubah tanpa mengemas kini lockfile | Jangan ubah `package.json` kit kursus; minta salinan asal daripada jurulatih |
| `npm ci` gagal: `SELF_SIGNED_CERT_IN_CHAIN` | Proksi jabatan memintas TLS | Lihat [§5](#5-proksi--firewall-jabatan) — `cafile` |
| `EPERM: operation not permitted, unlink …node_modules…` | Antivirus atau OneDrive mengunci fail | Pindahkan repo keluar dari OneDrive; tutup VS Code, cuba semula |
| Peta kelabu tanpa tile | Tiada internet / OSM disekat | Normal di bilik latihan — layer GeoJSON tetap dipaparkan ([§4.4](#44-tile-peta-tanpa-internet)) |
| Marker Leaflet tidak kelihatan (ikon pecah) | Folder `images/` Leaflet tidak disalin | Salin `leaflet/dist/images/` bersama `leaflet.css` |

---

## 7. Bacaan ringan sebelum Hari 1 (pilihan, ±1 jam)

- [`cheat-sheet-js.md`](./cheat-sheet-js.md): imbas sekali lalu sahaja.
- [`nota/01-asas-javascript.md`](../nota/01-asas-javascript.md): bahagian "Bagaimana JavaScript berjalan dalam browser".
- [`cheat-sheet-geospatial.md`](./cheat-sheet-geospatial.md): jadual **`[lng, lat]` vs `[lat, lng]`**. Ini kesilapan paling kerap dalam kursus ini.
- [`borang-penilaian-kendiri.md`](./borang-penilaian-kendiri.md): isi lajur **Sebelum** (5 minit).
