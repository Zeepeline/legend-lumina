'use strict';
// Dunia asli game dalam tampilan isometrik. Data: tools/export_iso_maps.js (proto/iso/maps/<id>.json + <id>_ground.webp + tex/)
// dan tools/export_iso_world.js (world.json = posisi global wilayah, sama dengan mode benua game).
// Logika tetap kartesius (koordinat game apa adanya); hanya tampilan diproyeksikan 2:1.
//   iso.html                          → DUNIA TERBUKA: semua wilayah luar ruang menyatu, dimuat bertahap sesuai jarak
//   iso.html?peta=forest&x=640&y=600  → dunia terbuka, muncul di Hutan Lumina (koordinat lokal wilayah)
//   iso.html?peta=cave                → peta terpisah (gua/dalam ruangan), pintu kembali ke dunia terbuka
const ISO_DIR = 'proto/iso/maps/';
const ISO_FLAT = /puddle|decal|crack|leafpile|petal/; // tempelan tanah: dipanggang ke lantai lalu ikut diproyeksikan
const ISO_SKIP = /shadow|cr_cloud/; // bayangan top-down & awan: dibuang (bayangan iso dibuat sendiri)
const ISO_TILE = 2048; // potongan tekstur lantai (batas aman GPU HP 4096)
const ISO_CAMZ = .62; // kamera ditarik jauh seperti pratinjau desa prototipe yang disetujui pemilik
const ISO_NOLUSH = /^(cave|snow|swamp|pl_river_swamp)$/; // wilayah dengan tanah khas: rumput tidak diganti
const ISO_LOAD = 700, ISO_DROP = 1500; // jarak muat / buang wilayah dari Arka (px dunia)

class IsoWorld extends IsoScene {
  init() {
    const q = new URLSearchParams(location.search);
    this.pid = q.get('peta') || 'village';
    this.spawnQ = q.get('x') ? [+q.get('x'), +q.get('y')] : null;
    window.zAt = () => 0; /* peta game datar: tanpa tebing prototipe */
  }
  preload() {
    this.load.json('isoIndex', ISO_DIR + 'index.json');
    this.load.json('isoWorld', ISO_DIR + 'world.json');
    this.load.image('treeA', 'assets/img/treeA.png');
    this.load.spritesheet('hero', 'assets/img/hero_arka.png', { frameWidth: 48, frameHeight: 40 });
    this.load.spritesheet('hero_iso_idle', 'assets/img/iso/hero_idle_iso.png', { frameWidth: 48, frameHeight: 44 });
    this.load.spritesheet('wolf_hd', 'assets/img/mon_wolf_hd.png', { frameWidth: 128, frameHeight: 96 });
  }
  create() {
    const A = this.anims, wa = (k, a, b, fps, rep) => A.exists(k) || A.create({ key: k, frames: A.generateFrameNumbers('wolf_hd', { start: a, end: b }), frameRate: fps, repeat: rep });
    wa('w_idle', 0, 6, 8, -1); wa('w_run', 14, 20, 13, -1); wa('w_pounce', 28, 32, 14, 0); wa('w_hurt', 35, 39, 14, 0); wa('w_die', 42, 45, 8, 0); wa('w_howl', 49, 54, 12, 0);
    fxTextures(this.textures);
    this.IDX = this.cache.json.get('isoIndex') || {}; const WJ = this.cache.json.get('isoWorld') || {};
    this.open = !!WJ[this.pid] || !this.IDX[this.pid];
    // wilayah: dunia terbuka = semua wilayah luar ruang di posisi global (digeser agar semua positif); peta terpisah = satu wilayah
    if (this.open) {
      const ids = Object.keys(WJ), x0 = Math.min(...ids.map(i => WJ[i][0])) - 400, y0 = Math.min(...ids.map(i => WJ[i][1])) - 400;
      this.regs = ids.map(id => ({ id, ox: WJ[id][0] - x0, oy: WJ[id][1] - y0, w: WJ[id][2], h: WJ[id][3] }));
      this.MW = Math.max(...this.regs.map(r => r.ox + r.w)) + 400; this.MH = Math.max(...this.regs.map(r => r.oy + r.h)) + 400;
      if (!WJ[this.pid]) this.pid = 'village';
    } else {
      const m = this.IDX[this.pid]; this.regs = [{ id: this.pid, ox: 0, oy: 0, w: m.w, h: m.h }]; this.MW = m.w; this.MH = m.h;
    }
    for (const r of this.regs) Object.assign(r, { st: 'none', objs: [], props: [], wolves: [], exits: [] });
    this.ter = null; this.houses = []; this.solids = []; this.props = []; this.wolves = []; this.wave = 1; this.loadQ = [];
    // Arka
    const R0 = this.regs.find(r => r.id === this.pid), [lx, ly] = this.spawnQ || [R0.w / 2, R0.h / 2];
    this.spawn = [R0.ox + lx, R0.oy + ly]; this.needSpawn = !this.spawnQ;
    this.hero = new IsoHero(this, this.spawn[0], this.spawn[1]); this.hero.face(0, 1);
    // kamera & efek (sama dengan prototipe)
    const cam = this.cameras.main; cam.setRoundPixels(true); this.fit(); this.scale.on('resize', () => this.fit());
    cam.setBackgroundColor(ISO_NOLUSH.test(this.pid) && !this.open ? '#14110c' : '#22381a');
    if (this.game.renderer.type === Phaser.WEBGL && cam.postFX) cam.postFX.addVignette(.5, .5, .95, .12);
    this.pe = this.add.particles(0, 0, 'fx_sq', { emitting: false, lifespan: { min: 200, max: 480 }, speed: { min: 60, max: 190 }, gravityY: 260,
      scale: { start: 1.5, end: .4 }, tint: { onEmit: () => this._tint }, angle: { onEmit: () => this._ang + rndR(-this._spr, this._spr) } }).setDepth(9e5);
    this.motes = this.add.particles(0, 0, 'fx_dot', { lifespan: 4200, frequency: 260, speedY: { min: -6, max: -2 }, speedX: { min: -4, max: 6 },
      alpha: { start: 0, end: 0 }, scale: { min: .4, max: .8 }, tint: 0xfff2b0, blendMode: 'ADD',
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-260, -160, 520, 320) } }).setDepth(9e5);
    this.motes.ops.alpha.onUpdate = (p, k, t) => Math.sin(t * Math.PI) * .7;
    this.hs = 0; this.exitArmed = false; this.ready = false;
    this.scene.add('ui', IsoUI, true); this.ui = this.scene.get('ui'); isoInput(this); this.makeHud(); this.mapPicker();
    const H = this.hero; cam.scrollX = isoX(H.x, H.y) - cam.width / 2; cam.scrollY = isoY(H.x, H.y) - 14 - cam.height / 2;
    this.stream(); this.time.addEvent({ delay: 400, loop: true, callback: () => this.stream() });
    window.__iso = this;
  }
  // ── streaming wilayah: muat yang dekat Arka, buang yang jauh ──
  regAt(x, y) { return this.regs.find(r => x >= r.ox && x < r.ox + r.w && y >= r.oy && y < r.oy + r.h); }
  dist(r, x, y) { return Math.hypot(Math.max(r.ox - x, 0, x - r.ox - r.w), Math.max(r.oy - y, 0, y - r.oy - r.h)); }
  stream() {
    const H = this.hero;
    for (const r of this.regs) {
      const d = this.dist(r, H.x, H.y);
      if (d < ISO_LOAD && r.st === 'none') { r.st = 'queued'; this.loadQ.push(r); }
      else if (d > ISO_DROP && r.st === 'ready') this.unloadReg(r);
    }
    this.loadQ.sort((a, b) => this.dist(a, H.x, H.y) - this.dist(b, H.x, H.y)); this.nextLoad();
    const cur = this.regAt(H.x, H.y); if (cur && cur !== this.curReg) { this.curReg = cur; this.hudName.setText('ISOMETRIK · ' + ((this.IDX[cur.id] || {}).name || cur.id));
      const sel = document.getElementById('isoPeta'); if (sel && !/^pl_/.test(cur.id)) sel.value = cur.id; }
  }
  nextLoad() {
    if (this.loading || !this.loadQ.length) return;
    const r = this.loadQ.shift(); if (r.st !== 'queued') return this.nextLoad();
    this.loading = r; r.st = 'loading'; const L = this.load, jk = 'r_' + r.id;
    const onJson = (k, t, D) => { if (k !== jk) return; for (const n of new Set(D.objs.map(o => o[0]))) if (!this.textures.exists('x_' + n)) L.image('x_' + n, ISO_DIR + 'tex/' + n + '.png'); };
    L.on('filecomplete-json-' + jk, onJson);
    if (!this.cache.json.exists(jk)) L.json(jk, ISO_DIR + r.id + '.json');
    L.image('g_' + r.id, ISO_DIR + r.id + '_ground.webp');
    L.once('complete', () => {
      L.off('filecomplete-json-' + jk, onJson);
      if (this.cache.json.exists(jk) && this.cache.json.get(jk).objs.some(o => !this.textures.exists('x_' + o[0]))) { onJson(jk, 0, this.cache.json.get(jk)); }
      this.buildReg(r, this.cache.json.get(jk)); this.loading = null; this.nextLoad();
    });
    L.start();
  }
  buildReg(r, D) {
    r.D = D; r.wg = this.wallGrid(D.walls); r.st = 'ready';
    const flat = [], stand = [];
    for (const o of D.objs) {
      if (!this.textures.exists('x_' + o[0]) || ISO_SKIP.test(o[0])) continue;
      (ISO_FLAT.test(o[0]) || o[9] < o[2] - 30 ? flat : stand).push(o);
    }
    this.bakeFloor(r, flat); this.textures.remove('g_' + r.id); /* sumber lantai tak dipakai lagi setelah diproyeksikan */
    for (const [n, lx, ly, ox, oy, sx, sy, fl, al, dep, tint, rot] of stand) {
      const x = lx + r.ox, y = ly + r.oy;
      const img = this.add.image(Math.round(isoX(x, y)), Math.round(isoY(x, y)), 'x_' + n).setOrigin(ox, oy).setScale(sx, sy).setFlipX(!!fl)
        .setAlpha(al).setRotation(rot);
      if (tint) img.setTint(tint);
      const up = dep > ly + 30 ? 400 : 0; img.setDepth(x + y + up); r.objs.push(img);
      const tall = img.displayHeight > 40 && al > .5;
      if (tall && !up) r.objs.push(this.add.image(img.x + 4, img.y - 1, 'fx_shadow').setScale(Math.min(4, img.displayWidth / 24), Math.min(2.4, img.displayWidth / 40)).setDepth(-5e4).setAlpha(.7));
      if (tall) r.props.push({ img, d: x + y, al, b: img.getBounds() });
    }
    this.forestRing(r); this.makeExits(r);
    for (const [, ex, ey] of (D.enemies || []).slice(0, 10)) {
      const x = ex + r.ox, y = ey + r.oy; if (this.wallAt(x, y, 6) || Math.hypot(x - this.hero.x, y - this.hero.y) < 260) continue;
      const w = new IsoWolf(this, x, y); w.reg = r; r.wolves.push(w); this.wolves.push(w);
    }
    this.props = this.regs.flatMap(q => q.props);
    if (!this.ready && r === this.regAt(this.spawn[0], this.spawn[1])) {
      if (this.needSpawn) { const [x, y] = this.findSpawn(r); Object.assign(this.hero, { x, y }); this.spawn = [x, y]; }
      this.ready = true; this.cameras.main.fadeIn(350);
    }
  }
  unloadReg(r) {
    for (const o of r.objs) o.destroy();
    for (const w of r.wolves) { w.spr.destroy(); w.sh.destroy(); }
    this.wolves = this.wolves.filter(w => w.reg !== r);
    for (const k of r.floorKeys || []) this.textures.remove(k);
    Object.assign(r, { st: 'none', objs: [], props: [], wolves: [], exits: [], wg: null, floorKeys: [] });
    this.props = this.regs.flatMap(q => q.props);
  }
  // ── lantai: gambar top-down asli + tempelan, diproyeksikan 2:1 (x - y, (x + y) / 2) per potongan ──
  bakeFloor(r, flat) {
    const src = this.textures.get('g_' + r.id).getSourceImage(), W = r.w, H = r.h;
    const base = document.createElement('canvas'); base.width = W; base.height = H;
    const b = base.getContext('2d'); b.drawImage(src, 0, 0, W, H);
    for (const [n, x, y, ox, oy, sx, sy, fl, al, , , rot] of flat) {
      const im = this.textures.get('x_' + n).getSourceImage();
      b.save(); b.globalAlpha = al; b.translate(x, y); b.rotate(rot); b.scale(sx * (fl ? -1 : 1), sy); b.drawImage(im, -ox * im.width, -oy * im.height); b.restore();
    }
    const PW = W + H, PH = Math.ceil((W + H) / 2), X0 = isoX(r.ox, r.oy) - H, Y0 = isoY(r.ox, r.oy); r.floorKeys = [];
    for (let ty = 0; ty < PH; ty += ISO_TILE) for (let tx = 0; tx < PW; tx += ISO_TILE) {
      const cw = Math.min(ISO_TILE, PW - tx), ch = Math.min(ISO_TILE, PH - ty), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.setTransform(1, .5, -1, .5, H - tx, -ty); g.drawImage(base, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
      if (!ISO_NOLUSH.test(r.id)) this.lushGrass(g, cw, ch, X0 + tx, Y0 + ty);
      const key = 'iso_floor_' + r.id + '_' + tx + '_' + ty; if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, cv); r.floorKeys.push(key); r.objs.push(this.add.image(X0 + tx, Y0 + ty, key).setOrigin(0).setDepth(-1e5));
    }
  }
  // rumput asli → bintik rumput prototipe (PAL.grass, helai gelap/terang), bayangan & tepi asli tetap lewat faktor terang
  lushGrass(g, w, h, ox, oy) {
    const im = g.getImageData(0, 0, w, h), d = im.data, P = PAL.grass.map(hexRGB), dk = hexRGB(PAL.grassDk), lt = P[3];
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4; if (d[i + 3] < 8) continue;
      const r = d[i], gg = d[i + 1], b = d[i + 2]; if (!(gg > r + 16 && gg > b + 16)) continue;
      const X = px + ox, Y = py + oy, n = hash2(X, Y, 5);
      let c = n < .62 ? P[0] : n < .8 ? P[1] : n < .9 ? P[2] : n < .97 ? P[3] : P[4];
      if (hash2(X >> 1, Y, 9) < .012) c = dk; else if (hash2(X >> 1, Y + 1, 9) < .012) c = lt; /* helai rumput */
      const f = Math.min(1.12, Math.max(.55, (r + gg + b) / 380)) * (.82 + vnoise(X, Y * 2, 120, 3) * .2);
      d[i] = c[0] * f; d[i + 1] = c[1] * f; d[i + 2] = c[2] * f;
    }
    g.putImageData(im, 0, 0);
  }
  // hutan lebat di luar dunia (bagian tepi wilayah yang tidak bersambung dengan wilayah lain), hiasan tanpa tabrakan
  forestRing(r) {
    const T = 16, RW = 8, W = Math.ceil(r.w / T), H = Math.ceil(r.h / T);
    if (ISO_NOLUSH.test(r.id) && r.id !== 'snow') return;
    for (let k = 1; k <= RW; k++) for (let t = -RW; t < Math.max(W, H) + RW; t++) {
      for (const [tx, ty] of [[t, -k], [-k, t], [t, H - 1 + k], [W - 1 + k, t]]) {
        if (tx < -RW || ty < -RW || tx > W + RW || ty > H + RW) continue;
        const gx = r.ox + tx * T, gy = r.oy + ty * T; if (hash2(gx + 99, gy + 99, 7) > .45) continue;
        const x = gx + hash2(gx, gy, 51) * T, y = gy + hash2(gx, gy, 52) * T;
        if (this.regs.some(q => x > q.ox - 12 && x < q.ox + q.w + 12 && y > q.oy - 12 && y < q.oy + q.h + 12)) continue; /* tepi bersambung: kosongkan */
        const sx = Math.round(isoX(x, y)), sy = Math.round(isoY(x, y)), sc = .85 + hash2(gx, gy, 53) * .4;
        if (k <= 3) r.objs.push(this.add.image(sx + 3, sy, 'fx_shadow').setScale(2.2 * sc, 1.3 * sc).setDepth(-5e4).setAlpha(.6));
        r.objs.push(this.add.image(sx, sy, 'treeA').setOrigin(.5, 1).setScale(sc).setDepth(x + y));
      }
    }
  }
  // ── tembok: persegi kartesius asli per wilayah (kisi 64 px); di luar wilayah / wilayah belum dimuat = buntu ──
  wallGrid(walls) {
    const G = new Map(), C = 64;
    for (const w of walls) for (let j = Math.floor(w[1] / C); j <= Math.floor((w[1] + w[3]) / C); j++)
      for (let k = Math.floor(w[0] / C); k <= Math.floor((w[0] + w[2]) / C); k++) { const key = k + ',' + j; if (!G.has(key)) G.set(key, []); G.get(key).push(w); }
    return G;
  }
  wallAt(x, y, rad) {
    const r = this.regAt(x, y); if (!r || r.st !== 'ready') return true;
    const lx = x - r.ox, ly = y - r.oy, L = r.wg.get(Math.floor(lx / 64) + ',' + Math.floor(ly / 64)); if (!L) return false;
    for (const w of L) if (lx > w[0] - rad && lx < w[0] + w[2] + rad && ly > w[1] - rad && ly < w[1] + w[3] + rad) return true;
    return false;
  }
  findSpawn(r) { // tengah wilayah; bila tembok, cari titik lapang terdekat melingkar
    const cx = r.ox + r.w / 2, cy = r.oy + r.h / 2;
    for (let d = 0; d < 600; d += 12) for (let a = 0; a < 6.28; a += .4) {
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; if (!this.wallAt(x, y, 10) && !this.inExit(x, y, 20)) return [x, y];
    }
    return [cx, cy];
  }
  // ── pintu: dunia terbuka hanya ke peta terpisah (gua, dalam ruangan); peta terpisah kembali ke dunia terbuka ──
  makeExits(r) {
    const WJ = this.cache.json.get('isoWorld') || {};
    for (const e of r.D.exits) {
      if (this.open && WJ[e.to]) continue; /* antar wilayah luar ruang: menyambung langsung */
      const x = e.x + r.ox, y = e.y + r.oy, cx = x + e.w / 2, cy = y + e.h / 2, ok = !!this.IDX[e.to];
      r.exits.push(Object.assign({}, e, { x, y }));
      const g = this.add.graphics().setDepth(-4.8e4); g.fillStyle(ok ? 0xfff0b0 : 0x9a9080, .22);
      g.fillPoints([[x, y], [x + e.w, y], [x + e.w, y + e.h], [x, y + e.h]].map(([a, b]) => ({ x: isoX(a, b), y: isoY(a, b) })), true);
      r.objs.push(g, this.add.text(isoX(cx, cy), isoY(cx, cy) - 16, '➜ ' + (e.label || (this.IDX[e.to] || {}).name || e.to), { fontFamily: 'monospace', fontSize: '13px',
        color: ok ? '#fff2c0' : '#b8b0a0', stroke: '#1a140a', strokeThickness: 3 }).setOrigin(.5).setDepth(8e5));
    }
  }
  inExit(x, y, m = 0) {
    for (const r of this.regs) for (const e of r.exits) if (x > e.x - m && x < e.x + e.w + m && y > e.y - m && y < e.y + e.h + m) return e;
    return null;
  }
  checkExit() {
    const H = this.hero, e = this.inExit(H.x, H.y);
    if (!e) { this.exitArmed = true; return; }
    if (!this.exitArmed || this.leaving) return;
    if (!this.IDX[e.to]) { this.exitArmed = false; this.toast((e.label || e.to) + ' belum diubah ke isometrik'); return; }
    this.leaving = true; this.cameras.main.fadeOut(300, 10, 8, 6);
    this.time.delayedCall(320, () => { location.search = '?peta=' + e.to + '&x=' + Math.round(e.tx) + '&y=' + Math.round(e.ty); });
  }
  // ── HUD & pilih wilayah (dunia terbuka: teleport; peta terpisah: buka halamannya) ──
  makeHud() {
    const u = this.ui; this.hpBack = u.add.rectangle(14, 14, 104, 9, 0x1a140a, .8).setOrigin(0).setStrokeStyle(1, 0xd8c08a, .8);
    this.hpBar = u.add.rectangle(16, 16, 100, 5, 0xd2483c).setOrigin(0);
    this.hudName = u.add.text(14, 26, 'ISOMETRIK · memuat…', { fontFamily: 'monospace', fontSize: '9px', color: '#f0e2b0', stroke: '#1a140a', strokeThickness: 3 });
    this.toastT = u.add.text(u.scale.width / 2, 40, '', { fontFamily: 'monospace', fontSize: '11px', color: '#fff2c0', stroke: '#1a140a', strokeThickness: 4 }).setOrigin(.5).setAlpha(0);
  }
  mapPicker() {
    if (document.getElementById('isoPeta')) return;
    const s = document.createElement('select'); s.id = 'isoPeta';
    s.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9;font:11px monospace;background:#1a140acc;color:#f0e2b0;border:1px solid #d8c08a;border-radius:4px;padding:3px';
    for (const [id, m] of Object.entries(this.IDX)) {
      if (/^pl_/.test(id) && this.open) continue;
      const o = document.createElement('option'); o.value = id; o.textContent = (this.open && !this.regs.some(r => r.id === id) ? '⌂ ' : '') + (m.name || id);
      if (id === this.pid) o.selected = true; s.appendChild(o);
    }
    s.onchange = () => {
      const r = this.open && this.regs.find(q => q.id === s.value);
      if (!r) { location.search = '?peta=' + s.value; return; }
      this.cameras.main.fadeOut(200, 10, 8, 6);
      this.time.delayedCall(220, () => { /* lompat: tunggu wilayah tujuan termuat lalu cari titik lapang */
        Object.assign(this.hero, { x: r.ox + r.w / 2, y: r.oy + r.h / 2 }); this.stream();
        const go = () => { if (r.st !== 'ready') return this.time.delayedCall(150, go); const [x, y] = this.findSpawn(r); Object.assign(this.hero, { x, y }); this.spawn = [x, y];
          const c = this.cameras.main; c.scrollX = isoX(x, y) - c.width / 2; c.scrollY = isoY(x, y) - 14 - c.height / 2; c.fadeIn(300); };
        go();
      });
    };
    document.body.appendChild(s);
  }
  fit() { const h = this.scale.height; this.cameras.main.setZoom(Math.max(1, h / ISO.VH) * ISO_CAMZ); }
  spawnWave() { }
  killWolf(w) {
    this.hitStop(.12); this.shake(160, .006); w.spr.setTintFill(0xffffff); /* mati: putih lalu memudar */
    this.time.delayedCall(120, () => { this.burst(isoX(w.x, w.y), isoY(w.x, w.y) - 10, 16, 0xfff6d0, -90, 70);
      this.tweens.add({ targets: [w.spr, w.sh], alpha: 0, duration: 420, onComplete: () => { w.spr.destroy(); w.sh.destroy(); } }); });
    this.time.delayedCall(800, () => { this.wolves = this.wolves.filter(o => o !== w); if (w.reg) w.reg.wolves = w.reg.wolves.filter(o => o !== w); });
  }
  heroHit(dmg) {
    const h = this.hero; this.hitStop(.09); this.shake(180, .008); this.num(isoX(h.x, h.y), isoY(h.x, h.y) - 32, '-' + dmg, '#ff6a5a', true);
    this.burst(isoX(h.x, h.y), isoY(h.x, h.y) - 12, 10, 0xff6a5a, -90, 90); h.spr.setTint(0xff9a8a); this.time.delayedCall(140, () => h.spr.clearTint());
    this.sfx('hurt'); this.flashHud();
    if (h.st === 'dead') this.time.delayedCall(1600, () => { Object.assign(h, { hp: h.max, st: 'move', x: this.spawn[0], y: this.spawn[1], inv: 1.5 }); this.toast('Arka bangkit kembali'); });
  }
  update(t, dms) { if (!this.ready) { this.render(); return; } super.update(t, dms); this.checkExit(); }
  render() {
    const H = this.hero;
    for (const a of [H, ...this.wolves]) {
      a.z = 0; const sx = isoX(a.x, a.y), sy = isoY(a.x, a.y);
      a.spr.setPosition(Math.round(sx + (a.st === 'wind' ? Math.sin(a.t * 70) * .8 : 0)), Math.round(sy)).setDepth(a.x + a.y + 1);
      a.sh.setPosition(Math.round(sx), Math.round(sy)).setDepth(-4.5e4);
      if (a.fl > 0) { a.fl -= .016; if (a.fl <= 0 && a.st !== 'dead') a.spr.clearTint(); }
      if (a === H) a.spr.setAlpha(a.inv > 0 && a.st !== 'roll' && Math.floor(a.inv * 20) % 2 ? .6 : 1);
    }
    // pohon/rumah di depan Arka jadi tembus pandang
    const pd = H.x + H.y, hs = isoX(H.x, H.y), hy = isoY(H.x, H.y) - 12;
    for (const p of this.props) p.img.setAlpha(p.d > pd && p.b.contains(hs, hy) ? Math.min(p.al, .45) : p.al);
    this.hpBar.width = 100 * H.hp / H.max;
    const cam = this.cameras.main, tx = hs - cam.width / 2, ty = isoY(H.x, H.y) - 14 - cam.height / 2;
    cam.scrollX += (tx - cam.scrollX) * .14; cam.scrollY += (ty - cam.scrollY) * .14;
    this.motes.setPosition(hs, isoY(H.x, H.y));
  }
}
