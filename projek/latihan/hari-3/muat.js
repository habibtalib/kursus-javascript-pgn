// muat.js — pemuat latihan. index.html?l=03 → latihan-03.js
// Anda TIDAK perlu mengubah fail ini.
import { mintaJson, API_URL } from './services/api.js';

const param = new URLSearchParams(location.search);
const nombor = (param.get('l') ?? '').padStart(2, '0');

// Tanda pautan latihan semasa.
for (const a of document.querySelectorAll('#nav-latihan a')) {
  const n = new URL(a.href).searchParams.get('l');
  if (n === nombor) a.setAttribute('aria-current', 'page');
}

// Status mock API — membantu mengesan "API tak hidup" lebih awal.
const lencana = document.getElementById('status-api');
mintaJson('/api/kesihatan', { timeoutMs: 3000 })
  .then(() => {
    lencana.textContent = 'API OK';
    lencana.classList.add('ok');
  })
  .catch(() => {
    lencana.textContent = 'API tiada';
    lencana.classList.add('gagal');
    lencana.title = `Tidak dapat capai ${API_URL}. Jalankan: cd projek/api && npm start`;
  });

// Muat latihan dipilih.
const info = document.getElementById('info-latihan');
if (/^0[1-5]$/.test(nombor)) {
  const fail = `./latihan-${nombor}.js`;
  info.textContent = `Memuat ${fail.slice(2)} — lihat Console (F12) untuk semakan.`;
  try {
    await import(fail);
  } catch (ralat) {
    info.textContent = `Ralat semasa memuat ${fail.slice(2)}: ${ralat.message} (lihat Console)`;
    console.error(ralat);
  }
} else {
  info.textContent = 'Pilih latihan di bar atas (01–05).';
}
