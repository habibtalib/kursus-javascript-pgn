// semak.js — penyemak automatik untuk utils/geo.js anda (Node sahaja).
//   node semak.js               → semak utils/geo.js ANDA
import assert from 'node:assert/strict';
import { laporanContoh } from './data/laporan-contoh.js';

const sasaran = './utils/geo.js';
const geo = await import(sasaran);
const { features } = laporanContoh;
const sah = features.filter((f) => f.id !== 'LPR-0010');

const hampir = (sebenar, jangkaan, toleransi = 0.01) =>
  assert.ok(Math.abs(sebenar - jangkaan) <= toleransi, `dapat ${sebenar}, jangka ≈ ${jangkaan}`);

const ujian = {
  formatKoordinat() {
    assert.equal(geo.formatKoordinat([101.6958, 2.9264]), '2.92640, 101.69580');
    assert.equal(geo.formatKoordinat([101.6958, 2.9264], 2), '2.93, 101.70');
  },
  jarakKm() {
    hampir(geo.jarakKm([101.6958, 2.9264], [101.6505, 2.9223]), 5.05);
    assert.equal(geo.jarakKm([101.6958, 2.9264], [101.6958, 2.9264]), 0);
    hampir(geo.jarakKm([101.6869, 3.139], [100.3327, 5.4164]), 294.6, 1); // KL → Pulau Pinang
  },
  tapisLaporan() {
    assert.equal(geo.tapisLaporan(sah).length, 9, 'tiada tapisan → semua');
    assert.equal(geo.tapisLaporan(sah, { status: 'baharu' }).length, 4);
    assert.deepEqual(geo.tapisLaporan(sah, { kategori: 'tanah', status: 'baharu' }).map((f) => f.id), ['LPR-0003']);
    assert.deepEqual(geo.tapisLaporan(sah, { q: 'SEMPADAN' }).map((f) => f.id), ['LPR-0001', 'LPR-0003'], 'q tidak peka huruf besar/kecil');
    assert.equal(geo.tapisLaporan(sah, { kategori: '' }).length, 9, "kategori '' diabaikan");
    assert.equal(sah.length, 9, 'array asal tidak boleh diubah');
  },
  kiraIkut() {
    assert.deepEqual(geo.kiraIkut(sah, 'status'), { baharu: 4, 'dalam-tindakan': 2, selesai: 2, ditolak: 1 });
    assert.deepEqual(geo.kiraIkut([], 'status'), {});
  },
  bboxDari() {
    assert.deepEqual(geo.bboxDari(sah), [101.644, 2.9012, 101.722, 2.9555]);
    const garis = [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [[101.6, 2.9], [101.7, 3.0]] }, properties: {} }];
    assert.deepEqual(geo.bboxDari(garis), [101.6, 2.9, 101.7, 3.0], 'LineString juga disokong');
    assert.equal(geo.bboxDari([]), null);
  },
  dalamMalaysia() {
    assert.equal(geo.dalamMalaysia([101.6958, 2.9264]), true);
    assert.equal(geo.dalamMalaysia([2.935, 101.701]), false, 'koordinat terbalik mesti false');
    assert.equal(geo.dalamMalaysia([118.0731, 5.8402]), true, 'Sandakan');
    assert.equal(geo.dalamMalaysia([151.2093, -33.8688]), false, 'Sydney');
  },
};

let lulus = 0;
for (const [nama, uji] of Object.entries(ujian)) {
  try {
    uji();
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
console.log(`\n${lulus}/${Object.keys(ujian).length} lulus (${sasaran})`);
process.exitCode = lulus === Object.keys(ujian).length ? 0 : 1;
