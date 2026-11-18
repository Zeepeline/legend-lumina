'use strict';
// Posisi global wilayah luar ruang (WORLD_POS mode benua) → proto/iso/maps/world.json untuk dunia terbuka isometrik.
// Pakai: python3 -m http.server 8010 & node tools/export_iso_world.js
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--use-gl=swiftshader'] });
  const page = await b.newPage(); await page.route(/sw\.js/, r => r.abort());
  await page.route(/cdnjs.*phaser/, r => r.fulfill({ body: fs.readFileSync(process.env.PHASER_LOCAL || '/home/claude/rpg/node_modules/phaser/dist/phaser.min.js'), contentType: 'application/javascript' }));
  await page.goto('http://localhost:8010/index.html'); await page.waitForFunction(() => typeof WORLD_POS !== 'undefined' && typeof buildBenua === 'function', null, { timeout: 60000 });
  const W = await page.evaluate(() => { const B = buildBenua(), o = {}; for (const id of B.regions) o[id] = [WORLD_POS[id][0], WORLD_POS[id][1], MAPS[id].w, MAPS[id].h, MAPS[id].ground || '']; return o; });
  fs.writeFileSync(path.join(__dirname, '../proto/iso/maps/world.json'), JSON.stringify(W));
  console.log(Object.keys(W).length, 'wilayah', JSON.stringify(W).slice(0, 600));
  await b.close();
})();
