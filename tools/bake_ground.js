// Render tanah prosedural (genGround) satu peta menjadi gambar utuh assets/img/ground/gnd_<id>_custom.png.
// Dipakai untuk peta kota (kgate, kpasar, kakademi, kbawah): tepi petak (world/grass_edge.js) butuh gambar sumber,
// dan menghitung tanah prosedural utuh di HP terlalu lambat. Jalankan ulang bila jalan/kolam peta itu diubah:
//   python3 -m http.server 8000 &   lalu   node tools/bake_ground.js kgate kpasar kakademi kbawah
//   (opsional: PORT=8010, CHROME=/usr/bin/google-chrome bila browser Playwright belum terpasang)
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const ids = process.argv.slice(2), root = path.join(__dirname, '..'), port = process.env.PORT || 8000;
  if (!ids.length) { console.log('pakai: node tools/bake_ground.js <id peta> ...'); return; }
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), page = await (await b.newContext()).newPage();
  await page.route(/cdnjs.*phaser/, r => r.fulfill({ body: fs.readFileSync(path.join(root, 'assets/lib/phaser.min.js')), contentType: 'application/javascript' }));
  await page.goto(`http://localhost:${port}/index.html`); await page.waitForFunction(() => window.__game && window.__game.sc, null, { timeout: 90000 });
  for (const id of ids) {
    const url = await page.evaluate(id => {
      const M = MAPS[id], cg = M.customGround, on = GRASS_EDGE.on; delete M.customGround; GRASS_EDGE.on = false;
      try { return genGround(M).toDataURL(); } finally { GRASS_EDGE.on = on; if (cg) M.customGround = cg; }
    }, id);
    const out = path.join(root, 'assets/img/ground', `gnd_${id}_custom.png`);
    fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('tulis', out);
  }
  await b.close();
})();
