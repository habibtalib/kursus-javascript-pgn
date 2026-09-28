// serve.mjs — server statik kecil (Node, tanpa dependency) untuk latihan Hari 3.
// Jalankan dari folder ini:   node serve.mjs        → http://localhost:5500
// Kenapa perlu server? <script type="module"> TIDAK berfungsi dari file:// (sekatan CORS browser).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT ?? 5500);
const JENIS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const laluan = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let fail = normalize(join(AKAR, laluan));
    if (!fail.startsWith(AKAR.endsWith(sep) ? AKAR : AKAR + sep) && fail !== AKAR) {
      res.writeHead(403).end('Dilarang');
      return;
    }
    if ((await stat(fail)).isDirectory()) fail = join(fail, 'index.html');
    const isi = await readFile(fail);
    res.writeHead(200, { 'Content-Type': JENIS[extname(fail)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(isi);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Tidak dijumpai');
  }
}).listen(PORT, () => {
  console.log(`Latihan Hari 3 → http://localhost:${PORT}   (Ctrl+C untuk henti)`);
  console.log('Pastikan mock API juga berjalan: cd ../../api && npm start  → http://localhost:3000');
});
