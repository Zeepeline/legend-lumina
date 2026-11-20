'use strict';
// Scene prototipe isometrik: muat aset, panggang tanah, pasang rumah/objek, jalankan aktor, efek tempur, kamera, HUD.
const IMG = ['treeA', 'apple1', 'bigtree', 'bushG1', 'bushG2', 'bushP', 'gpt_verdant_rock_med', 'gpt_verdant_rock_large', 'gpt_verdant_stump', 'gpt_v_village_well', 'lampPost',
  'gpt_barrel', 'benchWood', 'crateCart', 'deco_fl_y1', 'deco_fl_p2', 'deco_tuft', 'deco_pebbles', 'deco_mushroom'];
const GRADE = [1.05, .12, 0, 0, -4, 0, 1.04, 0, 0, -2, 0, .04, .84, 0, 0, 0, 0, 0, 1, 0];

class IsoUI extends Phaser.Scene { constructor() { super({ key: 'ui', active: false }); } }

function isoSubdir(k) {
  if (k.startsWith('hero_') || k === 'hero') return 'hero';
  if (k.startsWith('mon_') || k === 'wolf_hd') return 'monsters';
  if (k.startsWith('gnd_') || k.startsWith('deco_')) return 'ground';
  if (k.startsWith('gpt_v_')) return 'buildings';
  if (k.startsWith('iso_') || k.startsWith('cliff_')) return 'iso';
  if (/tree|apple|bush|rock|stump/i.test(k)) return 'nature';
  return 'props';
}

class IsoScene extends Phaser.Scene {
  constructor() { super({ key: 'iso' }); }
  preload() {
    for (const k of IMG) this.load.image(k, 'assets/img/' + isoSubdir(k) + '/' + k + '.png');
    this.load.spritesheet('hero', 'assets/img/hero/hero_arka.png', { frameWidth: 48, frameHeight: 40 });
    this.load.spritesheet('hero_iso_idle', 'assets/img/iso/hero_idle_iso.png', { frameWidth: 48, frameHeight: 44 });
    for (const k of ['gnd_grass', 'gnd_grass_light', 'gnd_grass_dark', 'gnd_dirt']) this.load.image(k, 'assets/img/ground/' + k + '.png');
    this.load.image('gnd_city_cobble', 'assets/img/ground/gnd_city_cobble.png');
    for (const k of ['gpt_v_inn_2story', 'gpt_v_blacksmith_forge', 'gpt_v_house_red_cottage', 'gpt_v_house_red_shop', 'gpt_v_house_brown_cottage', 'gpt_v_tavern_brown',
      'gpt_v_chapel_church', 'gpt_v_guild_townhall', 'gpt_v_windmill', 'gpt_v_barn_ranch', 'gpt_v_watchtower', 'gpt_v_house_brown_wing', 'gpt_v_market_stall'])
      this.load.image(k, 'assets/img/buildings/' + k + '.png');
    this.load.image('iso_house_a', 'assets/img/iso/house_a.png');
    this.load.image('iso_tileset', 'assets/img/iso/iso_tileset_32x16.png');
    this.load.image('cliff_block', 'assets/img/iso/cliff_block.png');
    this.load.image('cliff_stairs', 'assets/img/iso/cliff_stairs.png');
    this.load.spritesheet('wolf_hd', 'assets/img/monsters/mon_wolf_hd.png', { frameWidth: 128, frameHeight: 96 });
  }
  create() {
    const A = this.anims, wa = (k, a, b, fps, rep) => A.create({ key: k, frames: A.generateFrameNumbers('wolf_hd', { start: a, end: b }), frameRate: fps, repeat: rep });
    wa('w_idle', 0, 6, 8, -1); wa('w_run', 14, 20, 13, -1); wa('w_pounce', 28, 32, 14, 0); wa('w_hurt', 35, 39, 14, 0); wa('w_die', 42, 45, 8, 0); wa('w_howl', 49, 54, 12, 0);
    if (new URLSearchParams(location.search).get('tanah') === 'lembut') softTextures(this.textures); fxTextures(this.textures);
    // tanah
    const TM = new URLSearchParams(location.search).get('tanah'), src = k => this.textures.get(k).getSourceImage();
    const tsrc = { grass: src('gnd_grass'), light: src('gnd_grass_light'), dark: src('gnd_grass_dark'), dirt: src('gnd_dirt'), cobble: src('gnd_city_cobble') };
    const G = TM === 'asli' ? bakeGroundTex(tsrc) : TM === 'lembut' ? bakeGroundSoft(tsrc) : bakeGround(this);
    this.ter = G.ter; this.textures.addCanvas('iso_ground', G.c);
    this.add.image(-G.ox, -G.oy, 'iso_ground').setOrigin(0).setDepth(-1e5);
    this.waterFx(G);
    // rumah
    const allB = IMAP.houses.concat((IMAP.extra || []).map(([img, tx, ty, w, d]) => ({ t: [tx, ty, w, d], img })));
    this.houses = allB.map((h, i) => {
      const [tx, ty, w, d] = h.t, x0 = tx * ISO.T, y0 = ty * ISO.T;
      let img;
      if (h.img && this.textures.exists(h.img)) { /* bangunan game awal apa adanya (sudah bersudut 3/4) */
        const cx = x0 + w * ISO.T * .5, cy = y0 + d * ISO.T * .5, tex = this.textures.get(h.img).getSourceImage(), sc = (w + d) * ISO.T * 1.08 / tex.width;
        img = this.add.image(isoX(cx, cy), isoY(cx, cy) + 8, h.img).setOrigin(.5, 1).setScale(sc);
      } else if (this.textures.exists('iso_house_a')) { /* semua rumah dari gambar detail yang sama + varian atap → gaya seragam */
        const vk = h.variant || ['merah', 'jerami', 'batu', 'kayu', 'lumut'][i % 5], key = 'iso_house_' + vk;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, houseVariant(this.textures.get('iso_house_a').getSourceImage(), HOUSE_VARIANTS[vk]));
        const cx = x0 + w * ISO.T * .5, cy = y0 + d * ISO.T * .5, sc = .72 + (w + d) * .03;
        img = this.add.image(isoX(cx, cy), isoY(cx, cy), key).setOrigin(.5, .92).setScale(sc).setFlipX(!!h.flip);
      } else {
        const art = houseCanvas(Object.assign({ w, d }, h)); this.textures.addCanvas('house' + i, art.c);
        img = this.add.image(isoX(x0, y0) - art.ox, isoY(x0, y0) - art.oy, 'house' + i).setOrigin(0);
      }
      const sh = this.add.ellipse(isoX(x0 + w * ISO.T, y0 + d * ISO.T * .5) + 6, isoY(x0 + w * ISO.T, y0 + d * ISO.T) - 2, (w + d) * 10, (w + d) * 3, 0x282412, .28).setDepth(-9e4);
      return { x: x0, y: y0, w: w * ISO.T, d: d * ISO.T, img, base: x0 + y0 + (w + d) * ISO.T - 10, sh };
    });
    // objek
    this.solids = []; this.props = [];
    for (const p of isoProps()) {
      const sx = isoX(p.x, p.y), sy = isoY(p.x, p.y, zAt(p.x, p.y));
      if (p.flat) { this.add.image(sx, sy, p.k).setOrigin(.5, .8).setDepth(-5e4 + p.x + p.y); continue; }
      const img = this.add.image(sx, sy, p.k).setOrigin(.5, .94).setScale(p.s).setDepth(p.x + p.y);
      if (p.tree) { this.add.image(sx + 8, sy - 1, 'fx_shadow').setScale(2.4 * p.s, 1.8 * p.s).setDepth(-5e4); img.setFlipX(hash2(p.x, p.y, 2) < .5); }
      else this.add.image(sx + 2, sy, 'fx_shadow').setScale(img.displayWidth / 22, .9).setDepth(-5e4);
      if (p.r) this.solids.push({ x: p.x, y: p.y, r: p.r });
      this.props.push({ img, x: p.x, y: p.y, tree: p.tree });
    }
    if (this.textures.exists('cliff_stairs')) {
      const rx = 138, ry = 122;
      this.add.image(isoX(rx, ry), isoY(rx, ry, 0) + 4, 'cliff_stairs').setOrigin(.5, .8).setDepth(rx + ry);
    }
    isoFantasy(this);
    // aktor
    this.hero = new IsoHero(this, 24 * ISO.T, 28.5 * ISO.T); this.hero.face(-.4, 1);
    this.wolves = []; this.wave = 0; this.spawnWave();
    // kamera, rona warna, efek
    const cam = this.cameras.main; cam.setRoundPixels(true); this.fit();
    this.scale.on('resize', () => this.fit());
    if (this.game.renderer.type === Phaser.WEBGL && cam.postFX) { cam.postFX.addVignette(.5, .5, .95, .12); }
    this._soft = new URLSearchParams(location.search).get('tanah') === 'lembut';
    this.pe = this.add.particles(0, 0, 'fx_sq', { emitting: false, lifespan: { min: 200, max: 480 }, speed: { min: 60, max: 190 }, gravityY: 260,
      scale: { start: 1.5, end: .4 }, tint: { onEmit: () => this._tint }, angle: { onEmit: () => this._ang + rndR(-this._spr, this._spr) } }).setDepth(9e5);
    this.motes = this.add.particles(0, 0, 'fx_dot', { lifespan: 4200, frequency: 260, speedY: { min: -6, max: -2 }, speedX: { min: -4, max: 6 },
      alpha: { start: 0, end: 0, ease: t => Math.sin(t * Math.PI) }, scale: { min: .4, max: .8 }, tint: 0xfff2b0, blendMode: 'ADD',
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-260, -160, 520, 320) } }).setDepth(9e5);
    this.motes.ops.alpha.onUpdate = (p, k, t) => Math.sin(t * Math.PI) * .7;
    this.hs = 0; this.shakeT = 0;
    // UI
    this.scene.add('ui', IsoUI, true); this.ui = this.scene.get('ui'); isoInput(this); this.makeHud(); if (this._soft) softScene(this);
    window.__iso = this;
  }
  fit() { const h = this.scale.height; this.cameras.main.setZoom(Math.max(1, h / ISO.VH)); }
  spawnWave() {
    this.wave++; const n = Math.min(5, 1 + this.wave);
    for (let i = 0; i < n; i++) {
      let x, y; do { x = rndR(27, 37) * ISO.T; y = rndR(30, 38) * ISO.T; } while (this.ter[Math.floor(y / 16)][Math.floor(x / 16)] !== 'grass' || this.solids.some(s => Math.hypot(s.x - x, s.y - y) < 14));
      this.wolves.push(new IsoWolf(this, x, y));
    }
    if (this.wave > 1) this.toast('Gelombang ' + this.wave + ': ' + n + ' serigala');
  }
  waterFx(G) {
    for (let ty = 0; ty < IMAP.N; ty++) for (let tx = 0; tx < IMAP.N; tx++) {
      if (G.ter[ty][tx] !== 'water' || hash2(tx, ty, 41) > .45) continue;
      const wx = (tx + hash2(tx, ty, 42)) * ISO.T, wy = (ty + hash2(tx, ty, 43)) * ISO.T;
      const s = this.add.rectangle(isoX(wx, wy), isoY(wx, wy), rndR(3, 6), 1, 0xd8f0e0, 0).setDepth(-9.5e4);
      this.tweens.add({ targets: s, alpha: { from: 0, to: .8 }, x: s.x + 3, duration: rndR(900, 1700), yoyo: true, repeat: -1, delay: rndR(0, 2000) });
    }
  }
  // ── efek & umpan balik ──
  burst(x, y, n, tint, ang = 0, spread = 180) { this._tint = tint; this._ang = ang; this._spr = spread; this.pe.emitParticleAt(x, y, n); }
  shake(t, s) { this.cameras.main.shake(t, s); }
  hitStop(t) { this.hs = Math.max(this.hs, t); }
  num(x, y, txt, col, big) {
    const t = this.add.text(x, y, txt, { fontFamily: 'monospace', fontSize: big ? '11px' : '9px', color: col, stroke: '#1a140a', strokeThickness: 3 }).setOrigin(.5).setDepth(9.5e5);
    const dx = rndR(-14, 14); this.tweens.add({ targets: t, x: x + dx, duration: 620, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: t, y: { from: y, to: y - 18 }, duration: 260, ease: 'Quad.easeOut', yoyo: false,
      onComplete: () => this.tweens.add({ targets: t, y: y - 8, alpha: 0, duration: 380, ease: 'Quad.easeIn', onComplete: () => t.destroy() }) });
  }
  fxDust(x, y, sx, sy) {
    const d = this.add.image(isoX(x, y) - sx * 6, isoY(x, y, zAt(x, y)) + 1, 'fx_dust').setRotation(Math.atan2(sy, sx) - Math.PI / 2).setScale(.5, .4)
      .setDepth(x + y - 2).setAlpha(.7);
    this.tweens.add({ targets: d, alpha: 0, scaleX: .9, scaleY: .6, duration: 340, onComplete: () => d.destroy() });
  }
  fxAlert(w) { const t = this.add.text(isoX(w.x, w.y), isoY(w.x, w.y) - 30, '!', { fontFamily: 'monospace', fontSize: '14px', color: '#ff5a3a', stroke: '#1a0a06', strokeThickness: 3 })
    .setOrigin(.5).setDepth(9e5); this.tweens.add({ targets: t, y: t.y - 8, alpha: 0, delay: 350, duration: 400, onComplete: () => t.destroy() }); }
  fxTele(w, dur) { // cincin merah tipis di tanah yang menutup ke posisi bidikan, lalu terkunci saat menerjang
    const g = this.add.graphics().setDepth(-4e4), o = { p: 0 };
    this.tweens.add({ targets: o, p: 1, duration: dur * 1000, onUpdate: () => {
      g.clear(); if (w.st === 'dead' || w.st === 'hurt') return; const x = isoX(w.lx, w.ly), y = isoY(w.lx, w.ly), r = 26 - 12 * o.p;
      g.fillStyle(0xff5a3a, .08 + .14 * o.p).fillEllipse(x, y, 30, 15); g.lineStyle(1, 0xff7a5a, .4 + .5 * o.p).strokeEllipse(x, y, r * 2, r);
    }, onComplete: () => this.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() }) });
  }
  heroStrike(h, C) {
    const [dx, dy] = scr2world(h.fsx, h.fsy), cx = h.x + dx * 15, cy = h.y + dy * 15, fin = C === COMBO[2];
    const sx = isoX(h.x, h.y), sy = isoY(h.x, h.y, h.z) - 12, ang = Math.atan2(h.fsy, h.fsx);
    const sl = this.add.image(sx + h.fsx * 12, sy + h.fsy * 7, 'fx_slash').setRotation(ang).setScale(fin ? 1.1 : .85, (fin ? 1.1 : .85) * (.55 + .45 * Math.abs(h.fsx)))
      .setFlipY(h.combo === 1).setBlendMode('ADD').setDepth(h.x + h.y + 30);
    this.tweens.add({ targets: sl, alpha: 0, scaleX: sl.scaleX * 1.2, duration: 230, ease: 'Quad.easeIn', onComplete: () => sl.destroy() });
    let any = false;
    for (const w of this.wolves) {
      if (w.st === 'dead' || Math.hypot(w.x - cx, w.y - cy) > (fin ? 22 : 18)) continue; any = true;
      const dead = w.hurt(C.dmg, h.x, h.y, C.kb), ex = isoX(w.x, w.y), ey = isoY(w.x, w.y) - 10;
      w.spr.setTintFill(0xffffff); w.fl = .08; this.burst(ex, ey, fin ? 14 : 8, 0xfff2d0, ang * 57.3, 40); this.burst(ex, ey, fin ? 8 : 4, 0x8a2a1a, ang * 57.3, 70);
      this.num(ex, ey - 12, '' + C.dmg, fin ? '#ffd25a' : '#ffffff', fin);
      if (dead) this.killWolf(w);
    }
    if (any) { this.hitStop(C.hs); this.shake(fin ? 140 : 70, fin ? .006 : .003); this.sfx(fin ? 'crit' : 'hit'); }
  }
  killWolf(w) {
    this.hitStop(.12); this.shake(160, .006); w.spr.play('w_die'); w.spr.setTintFill(0xffffff);
    this.time.delayedCall(260, () => { this.burst(isoX(w.x, w.y), isoY(w.x, w.y) - 10, 16, 0xfff6d0, -90, 70);
      this.tweens.add({ targets: [w.spr, w.sh], alpha: 0, duration: 420, onComplete: () => { w.spr.destroy(); w.sh.destroy(); } }); });
    this.time.delayedCall(800, () => { this.wolves = this.wolves.filter(o => o !== w); if (!this.wolves.length) this.time.delayedCall(1800, () => this.spawnWave()); });
  }
  heroHit(dmg) {
    const h = this.hero; this.hitStop(.09); this.shake(180, .008); this.num(isoX(h.x, h.y), isoY(h.x, h.y) - 32, '-' + dmg, '#ff6a5a', true);
    this.burst(isoX(h.x, h.y), isoY(h.x, h.y) - 12, 10, 0xff6a5a, -90, 90); h.spr.setTint(0xff9a8a); this.time.delayedCall(140, () => h.spr.clearTint());
    this.sfx('hurt'); this.flashHud();
    if (h.st === 'dead') this.time.delayedCall(1600, () => { Object.assign(h, { hp: h.max, st: 'move', x: 24 * ISO.T, y: 28.5 * ISO.T, inv: 1.5 }); this.toast('Arka bangkit di alun-alun'); });
  }
  // ── HUD ──
  makeHud() {
    const u = this.ui; this.hpBack = u.add.rectangle(14, 14, 104, 9, 0x1a140a, .8).setOrigin(0).setStrokeStyle(1, 0xd8c08a, .8);
    this.hpBar = u.add.rectangle(16, 16, 100, 5, 0xd2483c).setOrigin(0);
    u.add.text(14, 26, 'PROTOTIPE ISOMETRIK · Desa Lumina', { fontFamily: 'monospace', fontSize: '9px', color: '#f0e2b0', stroke: '#1a140a', strokeThickness: 3 });
    u.add.text(14, 38, 'Joystick kiri: jalan · SERANG: tebas (3 kombo) · GULING: hindari terjangan', { fontFamily: 'monospace', fontSize: '8px',
      color: '#e8dcb0', stroke: '#1a140a', strokeThickness: 3 });
    this.toastT = u.add.text(u.scale.width / 2, 40, '', { fontFamily: 'monospace', fontSize: '11px', color: '#fff2c0', stroke: '#1a140a', strokeThickness: 4 }).setOrigin(.5).setAlpha(0);
  }
  flashHud() { this.tweens.add({ targets: this.hpBack, alpha: { from: 1, to: .8 }, duration: 80, yoyo: true, repeat: 2 }); }
  toast(s) { this.toastT.setText(s).setPosition(this.ui.scale.width / 2, 40).setAlpha(1); this.tweens.add({ targets: this.toastT, alpha: 0, delay: 1600, duration: 500 }); }
  // ── suara sederhana berlapis (WebAudio) ──
  sfx(k, v = 0) {
    const ctx = this.sound.context; if (!ctx || ctx.state !== 'running') return; const t = ctx.currentTime;
    const noise = (dur, f0, f1, vol, q = 1) => { const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = b; f.type = 'bandpass'; f.Q.value = q;
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      s.connect(f).connect(g).connect(ctx.destination); s.start(t); };
    const thump = (f0, f1, dur, vol) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur); };
    if (k === 'swing') noise(.16, 900 + v * 300, 3800, .35, 1.4);
    else if (k === 'hit') { thump(140, 50, .14, .7); noise(.09, 2400, 800, .5, .8); }
    else if (k === 'crit') { thump(110, 36, .24, .9); noise(.16, 3000, 500, .6, .7); }
    else if (k === 'hurt') { thump(220, 80, .18, .6); noise(.12, 1500, 600, .4); }
    else if (k === 'roll') noise(.22, 500, 1500, .25, .8);
    else if (k === 'growl') { thump(90, 70, .35, .25); noise(.35, 300, 200, .15, 3); }
    else if (k === 'lunge') noise(.18, 700, 2400, .3, 1.2);
  }
  update(_, dms) {
    /* HP lambat: waktu nyata dipecah jadi langkah ≤ 1/30 dtk → kecepatan tetap sama walau fps turun (bukan gerak lambat) */
    const total = Math.min(.2, (this.game.loop.rawDelta || dms) / 1000), /* waktu nyata: delta Phaser dihaluskan/dipatok 16,7 ms → gerak lambat di HP */ n = Math.max(1, Math.ceil(total / .034)), dt = total / n;
    for (let i = 0; i < n; i++) {
      IN.poll(dt);
      if (this.hs > 0) { this.hs -= dt; this.anims.pauseAll(); continue; }
      this.anims.resumeAll();
      this.hero.update(dt); for (const w of this.wolves) w.update(dt);
    }
    this.render(this.hs > 0);
  }
  render(frozen) {
    const H = this.hero;
    for (const a of [H, ...this.wolves]) {
      a.z = zAt(a.x, a.y); const sx = isoX(a.x, a.y), sy = isoY(a.x, a.y, a.z);
      a.spr.setPosition(Math.round(sx + (a.st === 'wind' ? Math.sin(a.t * 70) * .8 : 0)), Math.round(sy)).setDepth(a.x + a.y + 1);
      a.sh.setPosition(Math.round(sx), Math.round(sy)).setDepth(-4.5e4);
      if (a.fl > 0 && !frozen) { a.fl -= .016; if (a.fl <= 0 && a.st !== 'dead') a.spr.clearTint(); }
      if (a === H) a.spr.setAlpha(a.inv > 0 && a.st !== 'roll' && Math.floor(a.inv * 20) % 2 ? .6 : 1);
    }
    // kedalaman rumah relatif pemain + tembus pandang bila menutupi
    const pd = H.x + H.y, hs = isoX(H.x, H.y), hy = isoY(H.x, H.y, H.z);
    for (const h of this.houses) {
      const front = H.x >= h.x + h.w || H.y >= h.y + h.d, b = h.img.getBounds(), over = b.contains(hs, hy - 10);
      h.img.setDepth(over ? (front ? pd - 1 : pd + 2) : h.base); h.img.setAlpha(over && !front ? .55 : 1);
    }
    for (const p of this.props) if (p.tree) {
      const b = p.img.getBounds(), behind = p.x + p.y > pd && b.contains(hs, hy - 10); p.img.setAlpha(behind ? .5 : 1);
    }
    this.hpBar.width = 100 * H.hp / H.max;
    const cam = this.cameras.main, tx = isoX(H.x, H.y) - cam.width / 2, ty = isoY(H.x, H.y, H.z) - 14 - cam.height / 2;
    cam.scrollX += (tx - cam.scrollX) * .14; cam.scrollY += (ty - cam.scrollY) * .14;
    this.motes.setPosition(isoX(H.x, H.y), isoY(H.x, H.y));
  }
}

// ?peta=<id> (bawaan: village) = peta asli game; ?peta=proto atau ?tanah=… = desa prototipe lama
function isoUseWorld() { const q = new URLSearchParams(location.search); return typeof IsoWorld !== 'undefined' && !q.get('tanah') && q.get('peta') !== 'proto'; }
window.addEventListener('load', () => {
  const W = isoUseWorld() && typeof IsoWind === 'function'; /* dunia: semua objek satu pipeline angin (tanpa ganti jalur gambar) */
  new Phaser.Game({ type: Phaser.AUTO, parent: 'game', pixelArt: true, backgroundColor: '#2a3a1c', scene: [isoUseWorld() ? IsoWorld : IsoScene],
    render: W ? { pipeline: { IsoWind }, defaultPipeline: 'IsoWind', autoMobilePipeline: false } : {}, fps: { smoothStep: false },
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, input: { activePointers: 3 } });
});
