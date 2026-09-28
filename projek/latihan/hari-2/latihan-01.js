// ─────────────────────────────────────────────────────────────────────────────
// Latihan 01 — S1 · Call stack, event loop, task vs microtask
// Jalankan: node latihan-01.js   atau   index.html?latihan=01   (tiada rangkaian)
// ─────────────────────────────────────────────────────────────────────────────

// ── A. RAMAL susunan output SEBELUM menjalankan ────────────────────────────
// Tulis ramalan anda di sini:  _ · _ · _ · _ · _ · _ · _
console.log('A');
setTimeout(() => console.log('B  (task / macrotask: setTimeout 0)'), 0);
Promise.resolve().then(() => console.log('C  (microtask: then)'));
queueMicrotask(() => console.log('D  (microtask: queueMicrotask)'));
(async () => {
  console.log('E  (async: sebelum await)');
  await null;
  console.log('F  (async: selepas await)');
})();
console.log('G  (akhir skrip)'); // ⇒ RAMAL: susunan penuh A–G = _ _ _ _ _ _ _

// TODO A2: Selepas menjalankan, tulis PERATURAN yang menerangkan susunan itu (3 langkah):
//   1. ______   2. ______   3. ______

// ── B. Kod berat menyekat event loop ───────────────────────────────────────
// RAMAL: berapa ms selepas `mula` setTimeout(…, 0) di bawah sebenarnya berjalan?  ______
setTimeout(() => {
  const mula = performance.now();
  setTimeout(() => {
    console.log(`B2 setTimeout(…, 0) sebenarnya berjalan selepas ≈${Math.round(performance.now() - mula)} ms`);
  }, 0);
  while (performance.now() - mula < 300) {
    // loop sibuk 300 ms
  }
  console.log('B1 gelung berat selesai'); // ⇒ B1 gelung berat selesai
}, 50);

// TODO B3 (browser sahaja): tukar 300 kepada 5000, jalankan dalam index.html dan cuba klik/skrol
//   halaman semasa loop berjalan. Apa berlaku? Kenapa?
