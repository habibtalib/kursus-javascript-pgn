// semak.js — penyemak automatik services/api.js (Node 22+, mock API MESTI berjalan di :3000).
//   node semak.js               → semak services/api.js ANDA
// Nota: mencipta & memadam SATU laporan ujian. `npm run reset-data` (dalam projek/api) memulihkan data asal.
import assert from 'node:assert/strict';

const sasaran = './services/api.js';
const api = await import(sasaran);

try {
  await fetch('http://localhost:3000/api/kesihatan', { signal: AbortSignal.timeout(2000) });
} catch {
  console.log('❌ Mock API tidak berjalan. Buka terminal lain: cd projek/api && npm start');
  process.exit(1);
}

const jangkaApiError = async (janji, status) => {
  try {
    await janji;
  } catch (e) {
    assert.ok(e instanceof api.ApiError, `jangka ApiError, dapat ${e?.name}: ${e?.message}`);
    assert.equal(e.name, 'ApiError');
    assert.equal(e.status, status);
    return e;
  }
  assert.fail(`jangka ApiError ${status}, tetapi tiada ralat dilontar`);
};

let idUjian = null;
const ujian = {
  async 'ApiError'() {
    const e = new api.ApiError('mesej', 422, { tajuk: 'x' });
    assert.ok(e instanceof Error);
    assert.deepEqual([e.name, e.message, e.status, e.medan], ['ApiError', 'mesej', 422, { tajuk: 'x' }]);
    assert.equal(new api.ApiError('m', 500).medan, null, 'medan lalai null');
  },
  async 'senaraiKategori'() {
    const k = await api.senaraiKategori();
    assert.equal(k.length, 5);
    assert.ok('kod' in k[0] && 'warna' in k[0]);
  },
  async 'senaraiLaporan + tapisan'() {
    const fc = await api.senaraiLaporan({ status: 'baharu', q: '', had: 3 });
    assert.ok(fc, 'senaraiLaporan memulangkan null — adakah content-type geo+json dibaca sebagai JSON?');
    assert.equal(fc.type, 'FeatureCollection', 'geo+json mesti dibaca sebagai JSON');
    assert.ok(fc.features.length <= 3 && fc.features.every((f) => f.properties.status === 'baharu'), 'tapisan status/had mesti dihantar dalam query string');
    const kotak = await api.senaraiLaporan({ bbox: [101.67, 2.9, 101.72, 2.95] });
    assert.ok(kotak.features.length > 0, 'bbox array mesti dihantar sebagai "a,b,c,d"');
  },
  async 'dapatkanLaporan 404'() {
    const e = await jangkaApiError(api.dapatkanLaporan('LPR-9999'), 404);
    assert.match(e.message, /LPR-9999/, 'mesej mesti diambil dari badan { ralat }');
  },
  async 'ciptaLaporan 422'() {
    const e = await jangkaApiError(api.ciptaLaporan({ tajuk: 'x' }), 422);
    assert.ok(e.medan && 'tajuk' in e.medan, 'medan mesti diisi dari badan 422');
  },
  async 'cipta → kemaskini → padam'() {
    const f = await api.ciptaLaporan({ tajuk: 'Ujian semak.js', kategori: 'lain-lain', lat: 2.93, lng: 101.69 });
    assert.match(f.id, /^LPR-\d{4}$/);
    idUjian = f.id;
    const f2 = await api.kemaskiniLaporan(f.id, { status: 'selesai' });
    assert.equal(f2.properties.status, 'selesai');
    assert.equal(await api.padamLaporan(f.id), null, '204 → null');
    idUjian = null;
    await jangkaApiError(api.dapatkanLaporan(f.id), 404);
  },
  async 'lapisan & statistik'() {
    const l = await api.senaraiLapisan();
    assert.deepEqual(l.map((x) => x.id), ['sempadan-zon', 'sungai', 'kemudahan']);
    const sungai = await api.dapatkanLapisan('sungai');
    assert.equal(sungai.type, 'FeatureCollection');
    const s = await api.dapatkanStatistik();
    assert.equal(typeof s.jumlah, 'number');
  },
  async 'mintaJson timeout → ApiError 0'() {
    await jangkaApiError(api.mintaJson('/api/kesihatan?lambat=2000', { timeoutMs: 300 }), 0);
  },
  async 'mintaJson 500'() {
    await jangkaApiError(api.mintaJson('/api/kesihatan?gagal=1'), 500);
  },
  async 'AbortController pemanggil'() {
    const p = new AbortController();
    const janji = api.senaraiLaporan({ lambat: 2000 }, { signal: p.signal });
    setTimeout(() => p.abort(), 100);
    await assert.rejects(janji, { name: 'AbortError' }, 'batal oleh pemanggil mesti kekal AbortError');
  },
};

let lulus = 0;
for (const [nama, uji] of Object.entries(ujian)) {
  try {
    await uji();
    console.log(`✅ ${nama}`);
    lulus++;
  } catch (ralat) {
    const butiran =
      ['strictEqual', 'deepStrictEqual'].includes(ralat.operator)
        ? `dapat ${JSON.stringify(ralat.actual)} · jangka ${JSON.stringify(ralat.expected)}`
        : ralat.message.split('\n')[0];
    console.log(`❌ ${nama} — ${butiran}`);
  }
}
if (idUjian) await fetch(`http://localhost:3000/api/laporan/${idUjian}`, { method: 'DELETE', headers: { 'X-API-Key': 'latihan-pgn-2026' } });
console.log(`\n${lulus}/${Object.keys(ujian).length} lulus (${sasaran})`);
process.exitCode = lulus === Object.keys(ujian).length ? 0 : 1;
