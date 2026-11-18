// Ekspor peta luar ruang dari game top-down untuk mesin isometrik (proto/iso/maps/).
// Pakai: python3 -m http.server 8010 & lalu  node tools/export_iso_maps.js [id ...]
// Hasil per peta: <id>.json (ukuran, objek, tembok, pintu, musuh) + <id>_ground.webp (lantai penuh top-down). Tampil di iso.html?peta=<id>.
// Tekstur objek: tex/<kunci>__<frame>.png (sekali per kunci+frame).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'proto', 'iso', 'maps');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 } });
  await ctx.addInitScript(() => { window.REGIONS_OFF = true; });
  await ctx.route(/cdnjs.*phaser/, r => r.fulfill({ body: fs.readFileSync(process.env.PHASER_LOCAL || '/home/claude/rpg/node_modules/phaser/dist/phaser.min.js'), contentType: 'application/javascript' }));
  await ctx.route(/sw\.js/, r => r.abort()); await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const errs = []; let page, E; const W = ms => page.waitForTimeout(ms);
  async function fresh() { /* halaman baru per peta: galat satu peta tidak menular */
    if (page) await page.close();
    page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 4).join(' | ')));
    E = (f, a) => page.evaluate(f, a);
    await page.goto('http://localhost:8010/index.html');
    await page.waitForFunction(() => window.__game && window.__game.sc, null, { timeout: 60000 });
    await E(() => window.__game.press('a')); await page.waitForFunction(() => !window.__game.G.title, null, { timeout: 15000 }); await W(2600);
    for (let i = 0; i < 40; i++) { if (!(await E(() => !!document.querySelector('.dlg')))) break; await E(() => window.__game.press('a')); await W(200); }
  }
  await fresh();
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : await E(() => Object.keys(MAPS).filter(k => !MAPS[k].indoor && !MAPS[k].benua && !/^pl_/.test(k) && MAPS[k].ground !== 'room'));
  const doneTex = new Set(fs.readdirSync(path.join(OUT, 'tex')));
  const index = {};
  for (const id of ids) {
    try {
      if (Object.keys(index).length) await fresh();
      await E(id => { S.stage = 30; const M = MAPS[id], e = (M.exits || [])[0]; const x = M.w / 2, y = M.h / 2; const sc = window.__game.sc; sc.trans = false; G.lock = 0; S.map = id; S.x = x; S.y = y; sc.scene.restart({ map: id, x, y, dir: 'down' }); }, id);
      await page.waitForFunction(m => window.__game.sc.M.id === m, id, { timeout: 20000 }); await E(() => { G.lock = 1; }); await W(1500); if (await E(() => window.__game.sc.M.id) !== id) throw new Error('peta berpindah');
      const r = await E(() => {
        const sc = window.__game.sc, M = sc.M, pl = sc.pl, skip = new Set([pl, ...(sc.enemies || []).map(e => e.spr), ...(sc.npcs || []).map(n => n.spr)]);
        const objs = [], tex = {}, cull = new Set(sc._cullables || []); /* objek di luar layar disembunyikan cull.js */
        for (const c of sc.children.list) {
          if (!(c.type === 'Image' || c.type === 'Sprite') || (!c.visible && !cull.has(c)) || skip.has(c) || c.scrollFactorX !== 1 || !c.texture) continue;
          const k = c.texture.key; if (/^(__|gt:|gs_|shadow|fx_|jx_)/.test(k) || c.alpha < .05 || c.depth < -5e5 || c.depth > 5e5) continue;
          const fr = c.frame.name, tk = k + '__' + fr;
          if (!tex[tk]) { const f = c.frame, cv = document.createElement('canvas'); cv.width = f.cutWidth; cv.height = f.cutHeight;
            cv.getContext('2d').drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight); tex[tk] = cv; }
          objs.push([tk, Math.round(c.x * 10) / 10, Math.round(c.y * 10) / 10, +c.originX.toFixed(3), +c.originY.toFixed(3), +c.scaleX.toFixed(3), +c.scaleY.toFixed(3),
            c.flipX ? 1 : 0, +c.alpha.toFixed(2), Math.round(c.depth), c.isTinted ? c.tintTopLeft : 0, +c.rotation.toFixed(3)]);
        }
        const walls = sc.walls.getChildren().map(z => [Math.round(z.x - z.width / 2), Math.round(z.y - z.height / 2), Math.round(z.width), Math.round(z.height)]);
        const g = bakeGround(sc, M);
        window.__tex = tex;
        return { id: M.id, name: M.name, w: M.w, h: M.h, objs, walls, exits: (M.exits || []).map(e => ({ x: e.x, y: e.y, w: e.w, h: e.h, to: e.to, tx: e.tx, ty: e.ty, dir: e.dir, label: e.label })),
          enemies: (sc.enemies || []).map(e => [e.id || (e.D && e.D.tex), Math.round(e.spr.x), Math.round(e.spr.y)]), ground: g.toDataURL('image/png'), texKeys: Object.keys(tex) };
      });
      fs.writeFileSync(path.join(OUT, id + '_ground.png'), Buffer.from(r.ground.split(',')[1], 'base64'));
      require('child_process').execFileSync('python3', ['-c', 'import sys;from PIL import Image;import os;p=sys.argv[1];Image.open(p).convert("RGB").save(p[:-4]+".webp",quality=88,method=6);os.remove(p)', path.join(OUT, id + '_ground.png')]); /* lantai → webp (≈4× lebih kecil) */
      for (const tk of r.texKeys) {
        const fn = tk.replace(/[^a-zA-Z0-9_\-]/g, '_') + '.png'; if (doneTex.has(fn)) continue;
        const d = await E(tk => window.__tex[tk].toDataURL('image/png'), tk); fs.writeFileSync(path.join(OUT, 'tex', fn), Buffer.from(d.split(',')[1], 'base64')); doneTex.add(fn);
      }
      delete r.ground; delete r.texKeys; r.objs.forEach(o => { o[0] = o[0].replace(/[^a-zA-Z0-9_\-]/g, '_'); });
      fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify(r));
      index[id] = { name: r.name, w: r.w, h: r.h, n: r.objs.length };
      console.log(id, r.w + 'x' + r.h, 'objek', r.objs.length, 'tembok', r.walls.length, 'pintu', r.exits.length);
    } catch (e) { console.log('GAGAL', id, e.message.slice(0, 120), JSON.stringify(errs.slice(-2))); }
  }
  const old = fs.existsSync(path.join(OUT, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'))) : {};
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(Object.assign(old, index), null, 1));
  console.log('ERR', JSON.stringify(errs.slice(0, 5))); await b.close();
})();
