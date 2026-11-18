'use strict';
// Peta asli game dalam tampilan isometrik. Data dari tools/export_iso_maps.js (proto/iso/maps/<id>.json + <id>_ground.webp + tex/).
// Logika tetap kartesius (koordinat peta game apa adanya): tembok & pintu sama persis dengan game; hanya tampilan diproyeksikan 2:1.
//   iso.html?peta=forest            → buka Hutan Lumina
//   iso.html?peta=forest&x=640&y=600 → muncul di titik itu
const ISO_DIR = 'proto/iso/maps/';
const ISO_FLAT = /puddle|decal|crack|leafpile|petal/; // tempelan tanah: dipanggang ke lantai lalu ikut diproyeksikan
const ISO_SKIP = /shadow|cr_cloud/; // bayangan top-down & awan: dibuang (bayangan iso dibuat sendiri)
const ISO_TILE = 2048; // potongan tekstur lantai (batas aman GPU HP 4096)

class IsoWorld extends IsoScene {
  init() {
    const q = new URLSearchParams(location.search);
    this.pid = q.get('peta') || 'village';
    this.spawnQ = q.get('x') ? [+q.get('x'), +q.get('y')] : null;
    window.zAt = () => 0; /* peta game datar: tanpa tebing prototipe */
  }
  preload() {
    this.load.json('isoIndex', ISO_DIR + 'index.json');
    this.load.json('peta', ISO_DIR + this.pid + '.json');
    this.load.image('gsrc', ISO_DIR + this.pid + '_ground.webp');
    this.load.spritesheet('hero', 'assets/img/hero_arka.png', { frameWidth: 48, frameHeight: 40 });
    this.load.spritesheet('hero_iso_idle', 'assets/img/iso/hero_idle_iso.png', { frameWidth: 48, frameHeight: 44 });
    this.load.spritesheet('wolf_hd', 'assets/img/mon_wolf_hd.png', { frameWidth: 128, frameHeight: 96 });
    this.load.on('filecomplete-json-peta', (k, t, D) => {
      for (const n of new Set(D.objs.map(o => o[0]))) this.load.image('x_' + n, ISO_DIR + 'tex/' + n + '.png');
    });
    const bar = this.add.text(12, 12, 'Memuat peta…', { fontFamily: 'monospace', fontSize: '11px', color: '#f0e2b0' });
    this.load.on('progress', p => bar.setText('Memuat peta… ' + Math.round(p * 100) + '%'));
    this.load.on('complete', () => bar.destroy());
  }
  create() {
    const A = this.anims, wa = (k, a, b, fps, rep) => A.exists(k) || A.create({ key: k, frames: A.generateFrameNumbers('wolf_hd', { start: a, end: b }), frameRate: fps, repeat: rep });
    wa('w_idle', 0, 6, 8, -1); wa('w_run', 14, 20, 13, -1); wa('w_pounce', 28, 32, 14, 0); wa('w_hurt', 35, 39, 14, 0); wa('w_die', 42, 45, 8, 0); wa('w_howl', 49, 54, 12, 0);
    fxTextures(this.textures);
    const D = this.D = this.cache.json.get('peta'); this.IDX = this.cache.json.get('isoIndex') || {};
    this.MW = D.w; this.MH = D.h; this.ter = null; this.houses = []; this.solids = [];
    this.buildWalls(D.walls);
    // objek: tempelan tanah dipanggang ke lantai, sisanya berdiri di posisi terproyeksi
    const flat = [], stand = [];
    for (const o of D.objs) {
      if (!this.textures.exists('x_' + o[0]) || ISO_SKIP.test(o[0])) continue;
      (ISO_FLAT.test(o[0]) || o[9] < o[2] - 30 ? flat : stand).push(o);
    }
    this.bakeFloor(flat);
    this.props = [];
    for (const [n, x, y, ox, oy, sx, sy, fl, al, dep, tint, rot] of stand) {
      const img = this.add.image(Math.round(isoX(x, y)), Math.round(isoY(x, y)), 'x_' + n).setOrigin(ox, oy).setScale(sx, sy).setFlipX(!!fl)
        .setAlpha(al).setRotation(rot);
      if (tint) img.setTint(tint);
      const up = dep > y + 30 ? 400 : 0; img.setDepth(x + y + up);
      const tall = img.displayHeight > 40 && al > .5;
      if (tall && !up) this.add.image(img.x + 4, img.y - 1, 'fx_shadow').setScale(Math.min(4, img.displayWidth / 24), Math.min(2.4, img.displayWidth / 40)).setDepth(-5e4).setAlpha(.7);
      this.props.push({ img, d: x + y, tall, al, b: tall ? img.getBounds() : null });
    }
    this.makeExits(D.exits);
    // aktor
    const [hx, hy] = this.spawnQ || this.findSpawn(); this.spawn = [hx, hy];
    this.hero = new IsoHero(this, hx, hy); this.hero.face(0, 1);
    this.wolves = []; this.wave = 1;
    for (const [, ex, ey] of (D.enemies || []).slice(0, 14)) if (!this.wallAt(ex, ey, 6)) this.wolves.push(new IsoWolf(this, ex, ey));
    // kamera & efek (sama dengan prototipe)
    const cam = this.cameras.main; cam.setRoundPixels(true); this.fit(); this.scale.on('resize', () => this.fit());
    if (this.game.renderer.type === Phaser.WEBGL && cam.postFX) cam.postFX.addVignette(.5, .5, .95, .12);
    this.pe = this.add.particles(0, 0, 'fx_sq', { emitting: false, lifespan: { min: 200, max: 480 }, speed: { min: 60, max: 190 }, gravityY: 260,
      scale: { start: 1.5, end: .4 }, tint: { onEmit: () => this._tint }, angle: { onEmit: () => this._ang + rndR(-this._spr, this._spr) } }).setDepth(9e5);
    this.motes = this.add.particles(0, 0, 'fx_dot', { lifespan: 4200, frequency: 260, speedY: { min: -6, max: -2 }, speedX: { min: -4, max: 6 },
      alpha: { start: 0, end: 0 }, scale: { min: .4, max: .8 }, tint: 0xfff2b0, blendMode: 'ADD',
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-260, -160, 520, 320) } }).setDepth(9e5);
    this.motes.ops.alpha.onUpdate = (p, k, t) => Math.sin(t * Math.PI) * .7;
    this.hs = 0; this.exitArmed = false;
    this.scene.add('ui', IsoUI, true); this.ui = this.scene.get('ui'); isoInput(this); this.makeHud(); this.mapPicker();
    const c = this.cameras.main, H = this.hero; c.scrollX = isoX(H.x, H.y) - c.width / 2; c.scrollY = isoY(H.x, H.y) - 14 - c.height / 2;
    c.fadeIn(350);
    window.__iso = this;
  }
  // ── lantai: gambar top-down asli + tempelan, diproyeksikan 2:1 (x - y, (x + y) / 2) per potongan ──
  bakeFloor(flat) {
    const src = this.textures.get('gsrc').getSourceImage(), W = this.MW, H = this.MH;
    const base = document.createElement('canvas'); base.width = W; base.height = H;
    const b = base.getContext('2d'); b.drawImage(src, 0, 0, W, H);
    for (const [n, x, y, ox, oy, sx, sy, fl, al, , , rot] of flat) {
      const im = this.textures.get('x_' + n).getSourceImage();
      b.save(); b.globalAlpha = al; b.translate(x, y); b.rotate(rot); b.scale(sx * (fl ? -1 : 1), sy); b.drawImage(im, -ox * im.width, -oy * im.height); b.restore();
    }
    const PW = W + H, PH = Math.ceil((W + H) / 2);
    for (let ty = 0; ty < PH; ty += ISO_TILE) for (let tx = 0; tx < PW; tx += ISO_TILE) {
      const cw = Math.min(ISO_TILE, PW - tx), ch = Math.min(ISO_TILE, PH - ty), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.setTransform(1, .5, -1, .5, H - tx, -ty); g.drawImage(base, 0, 0);
      const key = 'iso_floor_' + tx + '_' + ty; if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addCanvas(key, cv); this.add.image(-H + tx, ty, key).setOrigin(0).setDepth(-1e5);
    }
    // tepi peta: bayangan lembut agar ujung belah ketupat tidak terpotong tajam
    const e = this.add.graphics().setDepth(-9.9e4); e.lineStyle(10, 0x0c0a06, .35);
    e.strokePoints([[0, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => ({ x: isoX(x, y), y: isoY(x, y) })), true);
  }
  // ── tembok: persegi kartesius asli, dicari lewat kisi 64 px ──
  buildWalls(walls) {
    const G = this.wg = new Map(), C = 64;
    walls.forEach((w, i) => {
      for (let j = Math.floor(w[1] / C); j <= Math.floor((w[1] + w[3]) / C); j++)
        for (let k = Math.floor(w[0] / C); k <= Math.floor((w[0] + w[2]) / C); k++) { const key = k + ',' + j; if (!G.has(key)) G.set(key, []); G.get(key).push(w); }
    });
  }
  wallAt(x, y, r) {
    const L = this.wg.get(Math.floor(x / 64) + ',' + Math.floor(y / 64)); if (!L) return false;
    for (const w of L) if (x > w[0] - r && x < w[0] + w[2] + r && y > w[1] - r && y < w[1] + w[3] + r) return true;
    return false;
  }
  findSpawn() { // dari pintu pertama melangkah ke tengah peta sampai keluar dari pintu & tembok
    const e = this.D.exits[0], cx = this.MW / 2, cy = this.MH / 2;
    if (!e) return [cx, cy];
    let x = e.x + e.w / 2, y = e.y + e.h / 2; const n = Math.hypot(cx - x, cy - y) || 1, sx = (cx - x) / n * 4, sy = (cy - y) / n * 4;
    for (let i = 0; i < 400; i++) { x += sx; y += sy; if (i > 28 && !this.wallAt(x, y, 8) && !this.inExit(x, y, 20)) break; }
    return [x, y];
  }
  // ── pintu antar peta: label + perpindahan ──
  makeExits(exits) {
    this.exits = exits;
    for (const e of exits) {
      const cx = e.x + e.w / 2, cy = e.y + e.h / 2, ok = !!this.IDX[e.to];
      const g = this.add.graphics().setDepth(-4.8e4); g.fillStyle(ok ? 0xfff0b0 : 0x9a9080, .22);
      g.fillPoints([[e.x, e.y], [e.x + e.w, e.y], [e.x + e.w, e.y + e.h], [e.x, e.y + e.h]].map(([x, y]) => ({ x: isoX(x, y), y: isoY(x, y) })), true);
      this.add.text(isoX(cx, cy), isoY(cx, cy) - 16, '➜ ' + (e.label || (this.IDX[e.to] || {}).name || e.to), { fontFamily: 'monospace', fontSize: '8px',
        color: ok ? '#fff2c0' : '#b8b0a0', stroke: '#1a140a', strokeThickness: 3 }).setOrigin(.5).setDepth(8e5);
    }
  }
  inExit(x, y, m = 0) { return this.D.exits.find(e => x > e.x - m && x < e.x + e.w + m && y > e.y - m && y < e.y + e.h + m); }
  checkExit() {
    const H = this.hero, e = this.inExit(H.x, H.y);
    if (!e) { this.exitArmed = true; return; }
    if (!this.exitArmed || this.leaving) return;
    if (!this.IDX[e.to]) { this.exitArmed = false; this.toast((e.label || e.to) + ' belum diubah ke isometrik'); return; }
    this.leaving = true; this.cameras.main.fadeOut(300, 10, 8, 6);
    this.time.delayedCall(320, () => { location.search = '?peta=' + e.to + '&x=' + Math.round(e.tx) + '&y=' + Math.round(e.ty); });
  }
  // ── HUD & pilih peta ──
  makeHud() {
    const u = this.ui; this.hpBack = u.add.rectangle(14, 14, 104, 9, 0x1a140a, .8).setOrigin(0).setStrokeStyle(1, 0xd8c08a, .8);
    this.hpBar = u.add.rectangle(16, 16, 100, 5, 0xd2483c).setOrigin(0);
    u.add.text(14, 26, 'ISOMETRIK · ' + (this.D.name || this.pid), { fontFamily: 'monospace', fontSize: '9px', color: '#f0e2b0', stroke: '#1a140a', strokeThickness: 3 });
    this.toastT = u.add.text(u.scale.width / 2, 40, '', { fontFamily: 'monospace', fontSize: '11px', color: '#fff2c0', stroke: '#1a140a', strokeThickness: 4 }).setOrigin(.5).setAlpha(0);
  }
  mapPicker() {
    if (document.getElementById('isoPeta')) return;
    const s = document.createElement('select'); s.id = 'isoPeta';
    s.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9;font:11px monospace;background:#1a140acc;color:#f0e2b0;border:1px solid #d8c08a;border-radius:4px;padding:3px';
    for (const [id, m] of Object.entries(this.IDX)) { const o = document.createElement('option'); o.value = id; o.textContent = m.name || id; if (id === this.pid) o.selected = true; s.appendChild(o); }
    s.onchange = () => { location.search = '?peta=' + s.value; };
    document.body.appendChild(s);
  }
  spawnWave() { }
  killWolf(w) {
    this.hitStop(.12); this.shake(160, .006); w.spr.setTintFill(0xffffff); /* mati: putih lalu memudar */
    this.time.delayedCall(120, () => { this.burst(isoX(w.x, w.y), isoY(w.x, w.y) - 10, 16, 0xfff6d0, -90, 70);
      this.tweens.add({ targets: [w.spr, w.sh], alpha: 0, duration: 420, onComplete: () => { w.spr.destroy(); w.sh.destroy(); } }); });
    this.time.delayedCall(800, () => { this.wolves = this.wolves.filter(o => o !== w); });
  }
  heroHit(dmg) {
    const h = this.hero; this.hitStop(.09); this.shake(180, .008); this.num(isoX(h.x, h.y), isoY(h.x, h.y) - 32, '-' + dmg, '#ff6a5a', true);
    this.burst(isoX(h.x, h.y), isoY(h.x, h.y) - 12, 10, 0xff6a5a, -90, 90); h.spr.setTint(0xff9a8a); this.time.delayedCall(140, () => h.spr.clearTint());
    this.sfx('hurt'); this.flashHud();
    if (h.st === 'dead') this.time.delayedCall(1600, () => { Object.assign(h, { hp: h.max, st: 'move', x: this.spawn[0], y: this.spawn[1], inv: 1.5 }); this.toast('Arka bangkit kembali'); });
  }
  update(t, dms) { super.update(t, dms); if (this.hero) this.checkExit(); }
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
    for (const p of this.props) if (p.tall) p.img.setAlpha(p.d > pd && p.b.contains(hs, hy) ? Math.min(p.al, .45) : p.al);
    this.hpBar.width = 100 * H.hp / H.max;
    const cam = this.cameras.main, tx = hs - cam.width / 2, ty = isoY(H.x, H.y) - 14 - cam.height / 2;
    cam.scrollX += (tx - cam.scrollX) * .14; cam.scrollY += (ty - cam.scrollY) * .14;
    this.motes.setPosition(hs, isoY(H.x, H.y));
  }
}
