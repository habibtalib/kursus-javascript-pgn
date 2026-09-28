// reset-data.mjs — Pulihkan data/laporan.json daripada salinan asal (data/asal/laporan.json).
// Guna:  npm run reset-data   (server yang sedang berjalan akan terus nampak data asal)
import { copyFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const asal = fileURLToPath(new URL('./data/asal/laporan.json', import.meta.url));
const kerja = fileURLToPath(new URL('./data/laporan.json', import.meta.url));

copyFileSync(asal, kerja);
const bil = JSON.parse(readFileSync(kerja, 'utf8')).length;
console.log(`Data laporan dipulihkan: ${bil} rekod asal.`);
