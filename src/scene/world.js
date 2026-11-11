'use strict';
// Scene utama Phaser: membangun peta, update per frame, kamera. Metode lain ditambahkan lewat file mixin (Object.assign(World.prototype, ...)).
// ---------------- SCENE ----------------
class World extends Phaser.Scene {
  constructor() { super('world'); }
  create(data) {
    if (!this.textures.exists('cat0')) buildTextures(this);
    if (!HUD) buildHud(ICONS);
    G.scene = this;
    const M = this.M = MAPS[data.map || 'village'];
    if (!this.textures.exists('gs_' + M.id)) this.textures.addCanvas('gs_' + M.id, bakeGround(this, M));
    S.seen[M.id] = 1;
    this.trans = false; this.t = 0; this.bossOn = false; this.crystal = null; this.dt = 1 / 60; this.dark = null; this.bossE = null; this.barrier = null; this.dustT = 0; this.regT = 0; this.night = null; this.glows = null; this.holdA = 0; this.dashCd = 0; this.trail = []; this.digT = rnd(35, 55); this.fishing = false; this.garden = null; this.boulder = null; this.gateS = null; this.mochi = null; this.charged = false; this.bMoving = false; this.curBoss = null;
    this.physics.world.setBounds(0, 0, M.w, M.h);
    this.add.image(0, 0, 'gs_' + M.id).setOrigin(0).setDepth(-1e6);
    this.walls = this.physics.add.staticGroup();
    this.shG = this.add.graphics().setDepth(-9e5);
    this.aimG = this.add.graphics().setDepth(9e4);
    this.fades = []; this.inter = []; this.npcs = []; this.enemies = []; this.shots = []; this.picks = []; this.critters = []; this.lights = [];
    for (const r of M.walls || []) this.wall(...r);
    for (const r of blockRects(M)) this.wall(...r);
    if (M.river) { const R = M.river; for (let x = 0; x < M.w; x += 8) { if (x + 8 > R.bridge[0] + 4 && x < R.bridge[1] - 4) continue; const ry = riverY(R, x + 4); this.wall(x, ry - R.w / 2 - 1, 8, R.w + 2); } }
    if (M.ring) { const R = M.ring; for (let a = 0; a < 360; a += 4) { if (Math.abs(a - 270) < R.gap - 2) continue; const t = a * Math.PI / 180; this.wall(R.cx + Math.cos(t) * R.r - 6, R.cy + Math.sin(t) * R.r * .8 - 8, 12, 10); } }
    for (const o of mapObjects(M)) this.spawnObj(o);
    for (const f of M.furn || []) { const [w, h, solid] = FURN[f[0]]; if (solid) this.wall(f[1], f[2] + h * .35, w, h * .65); }
    this.doors = [];
    for (const d of M.doors || []) { if (typeof d[2] === 'object') { const to = d[2].to; this.doors.push({ x: d[0], y: d[1], to }); this.inter.push({ x: d[0], y: d[1] + 4, r: 14, fn: () => this.enterRoom(to, d) }); } else this.inter.push({ x: d[0], y: d[1] + 4, r: 14, fn: () => talk(null, [d[2]]) }); }
    for (const f of M.fish || []) { this.add.sprite(f[0], f[1], 'ripple').play('ripple').setDepth(-8e5).setAlpha(.9); this.lights.push({ x: f[0], y: f[1], small: 1 }); this.inter.push({ x: f[0], y: f[1], r: 26, fn: () => this.fish(f) }); }
    if (M.gardens) this.spawnGarden();
    if (M.gate) this.spawnPuzzle();
    for (const c of M.chests || []) if (!c.needFlag || S.flags[c.needFlag]) this.spawnChest(c);
    if (M.crystal) this.spawnCrystal();
    if (M.barrier && !S.flags.seal_open) this.spawnBarrier();
    if (M.mochi && S.side.mochi === 1) this.spawnMochi();
    if (M.id === 'village' && S.side.mochi === 3 && !S.pet) this.spawnCritter(['cat', 586, 300, 2]);
    for (const n of M.npcs || []) this.spawnNpc(n);
    for (const a of M.animals || []) this.spawnCritter(a);
    for (let i = 0; i < (M.butterflies || 0); i++) this.spawnFly(i);
    for (const e of M.enemies || []) this.spawnEnemy(e[0], e[1], e[2]);
    if (!G.title && isNight() && (M.id === 'forest' || M.id === 'meadow')) for (let i = 0; i < 4; i++) { const P = M.paths[(i * 3 + 2) % M.paths.length]; this.spawnEnemy('wisp', (P[0] + P[2]) / 2 + rnd(-30, 30), (P[1] + P[3]) / 2 + rnd(-20, 20)); }
    // pemain
    const pl = this.pl = this.physics.add.sprite(data.x || S.x, data.y || S.y, 'ch_hero', (data.dir === 'left' || data.dir === 'right' ? 'side' : data.dir || 'down') + '0').setOrigin(.5, 1);
    pl.body.setSize(10, 6).setOffset(5, CH_FH - 7); pl.setCollideWorldBounds(true);
    pl.dir = data.dir || 'down'; pl.flipX = pl.dir === 'left'; pl.atkCd = 0; pl.atkT = 0; pl.inv = 0; pl.kb = 0; pl.dead = false;
    pl.sh = this.add.image(pl.x, pl.y, 'shadow').setAlpha(.25);
    this.physics.add.collider(pl, this.walls);
    for (const n of this.npcs) this.physics.add.collider(pl, n.spr);
    for (const e of this.enemies) if (e.D.ai === 'turret') this.physics.add.collider(pl, e.spr);
    this.sword = this.add.image(0, 0, 'sword0').setOrigin(.1, .5).setVisible(false);
    this.bars = this.add.graphics().setDepth(1e5);
    if (M.dark) this.dark = this.add.renderTexture(0, 0, VW, VH).setOrigin(0).setScrollFactor(0).setDepth(2e5);
    else if (!M.indoor) { this.night = this.add.renderTexture(0, 0, VW, VH).setOrigin(0).setScrollFactor(0).setDepth(2e5); this.glows = this.lights.filter(L => !L.small).map(L => this.add.image(L.x, L.y, L.big ? 'nlL' : 'nlW').setTint(0xffc870).setBlendMode(Phaser.BlendModes.ADD).setDepth(2.01e5).setAlpha(0)); }
    if (S.pet && !M.indoor && !G.title) { this.pet = this.add.sprite(pl.x - 14, pl.y, 'cat2', 0).setOrigin(.5, 1); this.pet.sh = this.add.image(pl.x, pl.y, 'shadow').setAlpha(.18).setScale(.8, .7); } else this.pet = null;
    this.weather = M.id === 'swamp' ? 'fog' : (!M.indoor && !M.dark && !G.title && hash(S.day, M.w, Math.floor(S.time / 6)) < .25) ? 'rain' : 'clear';
    if (this.weather === 'rain') this.add.particles(0, 0, 'rain', { x: { min: -40, max: VW + 40 }, y: -10, lifespan: 700, speedY: { min: 300, max: 360 }, speedX: { min: -70, max: -50 }, alpha: { start: .7, end: .3 }, frequency: 12, quantity: 2 }).setScrollFactor(0).setDepth(1.95e5);
    if (this.weather === 'fog') this.add.particles(0, 0, 'fog', { x: { min: -60, max: VW + 60 }, y: { min: -20, max: VH + 20 }, lifespan: 9000, speedX: { min: 4, max: 12 }, scale: { start: 1.6, end: 2.4 }, alpha: { start: 0, end: .2, ease: 'Sine.inOut' }, frequency: 500 }).setScrollFactor(0).setDepth(1.95e5);
    // partikel suasana
    const amb = this.weather === 'rain' ? null : { forest: ['leaf', 0xffffff, 900], meadow: ['petal', 0xffffff, 700], village: ['petal', 0xffffff, 1600], cave: ['dot', 0xb8a8ff, 500], swamp: ['dot', 0xa0ffc0, 600] }[M.id];
    const motes = M.id === 'cave' || M.id === 'swamp';
    if (amb && !G.title) this.add.particles(0, 0, amb[0], { x: { min: -20, max: VW + 20 }, y: motes ? { min: 0, max: VH } : -8, lifespan: 6000, speedY: motes ? { min: -6, max: 6 } : { min: 14, max: 28 }, speedX: { min: -14, max: 6 }, rotate: { min: 0, max: 360 }, alpha: motes ? { start: .7, end: 0 } : 1, tint: amb[1], frequency: amb[2] }).setScrollFactor(0).setDepth(1.9e5);
    // kamera
    const cam = this.cameras.main; cam.setBounds(0, 0, M.w, M.h); cam.setRoundPixels(true);
    this.camFollow = !G.title;
    this.cx = clamp(pl.x - VW / 2, 0, M.w - VW); this.cy = clamp(pl.y - 12 - VH / 2, 0, M.h - VH);
    if (G.title) { pl.setVisible(false); pl.sh.setVisible(false); this.cx = 250; this.cy = 160; }
    cam.setScroll(Math.round(this.cx), Math.round(this.cy));
    this.events.on('postupdate', this.camStep, this);
    this.events.once('shutdown', () => this.events.off('postupdate', this.camStep, this));
    this.mpT = 0;
    playBGM(G.title ? 'town' : this.weather === 'rain' ? null : M.bgm);
    if (!G.title) achCheck(this);
    FADE.style.opacity = 0;
    if (!G.title) { updHud(); showHud(true); if (!data.quiet) banner(M.name, M.id === 'village' ? 'SELAMAT DATANG DI' : 'MEMASUKI'); }
    if (data.after) data.after(this);
  }
  wall(x, y, w, h) { const z = this.add.zone(x + w / 2, y + h / 2, w, h); this.physics.add.existing(z, true); this.walls.add(z); return z; }
  shadow(x, y, rx, ry) { this.add.image(x + 1, y, 'shadowb').setDisplaySize(rx * 2.4, ry * 2.6).setAlpha(this.M.dark ? .5 : .32).setDepth(-9e5); }
  spawnObj(o) {
    const [type, x, y, opt] = o; const d = OBJ[type];
    const s = this.add.sprite(x, y, d.key, 0).setOrigin(.5, 1).setDepth(y);
    if (opt && opt.flip) s.setFlipX(true);
    if (d.col && d.col[0]) this.wall(x - d.col[0] / 2, y - d.col[1] - d.col[2], d.col[0], d.col[1]);
    if (type === 'shrine') { this.wall(x - 56, y - 30, 14, 12); this.wall(x + 42, y - 30, 14, 12); s.setDepth(y - 60); }
    if (type === 'cavemouth') { s.setDepth(y - 30); this.wall(x - 46, y - 40, 22, 40); this.wall(x + 24, y - 40, 22, 40); }
    if (d.fade) this.fades.push({ s, l: x - s.width / 2 + 6, r: x + s.width / 2 - 6, t: y - s.height + 8, b: y - (d.col ? d.col[1] + d.col[2] : 4) });
    if (type === 'sign') this.inter.push({ x, y: y + 2, r: 14, fn: () => talk(null, [opt.text]) });
    if (d.chim) {
      const cx = x + (opt && opt.flip ? -1 : 1) * d.chim[0], cy = y - s.height + d.chim[1];
      this.add.particles(cx, cy, 'smoke', { lifespan: 2600, speedY: { min: -16, max: -9 }, speedX: { min: -2, max: 7 }, scale: { start: .5, end: 1.5 }, alpha: { start: .5, end: 0 }, frequency: 480 }).setDepth(y + 1);
    }
    if (type === 'forge') this.add.particles(x, y - 22, 'doto', { lifespan: 700, speedY: { min: -30, max: -12 }, speedX: { min: -8, max: 8 }, alpha: { start: 1, end: 0 }, frequency: 160 }).setDepth(y + 1);
    if (type === 'fountain') this.add.particles(x, y - 66, 'dot', { lifespan: 650, speedX: { min: -22, max: 22 }, speedY: { min: -26, max: -8 }, gravityY: 90, alpha: { start: .8, end: 0 }, frequency: 110, tint: 0xd8f6ff }).setDepth(y + 1);
    if (type === 'windmill') { const b = this.add.image(x, y - 70, 'blades').setDepth(y + 1); this.tweens.add({ targets: b, angle: 360, duration: 7000, repeat: -1 }); this.fades.push({ s: b, l: x - 36, r: x + 36, t: y - 110, b: y - 22 }); }
    if (type === 'cryst' || type === 'crystp') this.lights.push({ x, y: y - 8 });
    if (type === 'lamp') this.lights.push({ x, y: y - 24, big: 1 });
    if (type === 'forge') this.lights.push({ x, y: y - 14, big: 1 });
    if (d.chim) { this.lights.push({ x: x - 26, y: y - 22 }); this.lights.push({ x: x + 26, y: y - 22 }); }
    return s;
  }
  spawnChest(c) {
    const open = !!S.flags[c.id];
    const s = this.add.image(c.x, c.y, open ? 'chesto' : 'chest').setOrigin(.5, 1).setDepth(c.y); this.shadow(c.x, c.y, 9, 3);
    this.wall(c.x - 8, c.y - 8, 16, 8);
    this.inter.push({ x: c.x, y: c.y + 4, r: 14, fn: () => this.openChest(c, s) });
    return s;
  }
  spawnCrystal() {
    const C = this.M.crystal, lit = S.stage >= 5;
    const s = this.crystal = this.add.sprite(C.x, C.y, lit ? 'crystal_lit' : 'crystal', 0).setOrigin(.5, 1).setDepth(C.y);
    if (lit) s.play('crystal_lit');
    this.tweens.add({ targets: s, y: C.y - 3, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.wall(C.x - 10, C.y - 10, 20, 10);
    this.inter.push({ x: C.x, y: C.y + 4, r: 18, fn: () => this.useCrystal() });
  }
  spawnBarrier() {
    const B = this.M.barrier;
    const s = this.add.sprite(B.x, B.y + 6, 'barrier').setOrigin(.5, 1).setDepth(B.y + 6).play('barrier').setAlpha(.9);
    const w = this.wall(B.x - B.w / 2, B.y - 6, B.w, 12);
    this.barrier = { s, w };
    this.inter.push({ x: B.x, y: B.y + 10, r: 22, fn: () => this.touchBarrier() });
  }
  spawnMochi() {
    const P = this.M.mochi; const s = this.add.sprite(P.x, P.y, 'cat2', 0).setOrigin(.5, 1).setDepth(P.y).play('cat2_mv'); s.anims.timeScale = .4;
    this.mochi = s; this.inter.push({ x: P.x, y: P.y, r: 18, fn: () => this.takeMochi() });
  }
  spawnNpc(n) {
    const s = this.physics.add.sprite(n.x, n.y, 'ch_' + n.ch, 'down0').setOrigin(.5, 1).setDepth(n.y);
    s.body.setSize(12, 7).setOffset(4, CH_FH - 8); s.setImmovable(true); s.setCollideWorldBounds(true);
    this.physics.add.collider(s, this.walls);
    const o = { n, spr: s, ch: n.ch, home: { x: n.x, y: n.y }, t: rnd(1, 3), dir: n.dir, sh: this.add.image(n.x, n.y, 'shadow').setAlpha(.25) };
    this.face(o, n.dir); this.npcs.push(o);
    this.inter.push({ npc: o, r: n.reach || 16, fn: () => this.talkNpc(o) });
    // tanda ! untuk NPC yang punya misi
    o.mark = this.add.text(n.x, n.y - 30, '!', { fontFamily: 'Pixelify Sans, monospace', fontSize: '12px', color: '#ffe23a', stroke: '#5a3a10', strokeThickness: 3 }).setOrigin(.5, 1).setDepth(9e4).setVisible(false);
    this.tweens.add({ targets: o.mark, y: n.y - 33, duration: 400, yoyo: true, repeat: -1 });
  }
  face(o, dir) { o.dir = dir; const s = o.spr; s.anims.stop(); s.setFrame((dir === 'left' || dir === 'right' ? 'side' : dir) + '0'); s.flipX = dir === 'left'; }
  spawnCritter([kind, x, y, v]) {
    const key = kind + v; const s = this.add.sprite(x, y, key, 0).setOrigin(.5, 1).setDepth(y);
    const sh = this.add.image(x, y, 'shadow').setAlpha(.18).setScale(.8, .7);
    this.critters.push({ s, sh, key, home: { x, y }, busy: false, t: rnd(.5, 3) });
  }
  spawnFly(i) {
    const key = i % 3 ? 'fly' : 'fly2'; const x = rnd(120, this.M.w - 120), y = rnd(160, this.M.h - 120);
    const s = this.add.sprite(x, y, key).play(key); s.anims.setProgress(Math.random());
    this.critters.push({ s, fly: 1, ax: x, ay: y, ph: rnd(0, 6), sp: rnd(.4, .8) });
  }
  spawnEnemy(type, x, y) {
    const D = ENEMY[type];
    const s = this.physics.add.sprite(x, y, D.tex, D.ch ? 'down0' : 0).setOrigin(.5, 1).setDepth(y);
    if (D.scale) s.setScale(D.scale);
    if (D.ch) s.body.setSize(10, 7).setOffset(5, CH_FH - 8);
    else { const bw = Math.min(14, s.width - 4); s.body.setSize(bw, 6).setOffset((s.width - bw) / 2, s.height - 7); }
    if (!D.fly) this.physics.add.collider(s, this.walls);
    s.setCollideWorldBounds(true);
    if (D.ai === 'turret') s.setImmovable(true);
    if (!D.ch) { s.play(D.tex + '_mv'); s.anims.setProgress(Math.random()); } else s.anims.stop();
    const e = { D, type, spr: s, sc: D.scale || 1, hp: D.hp, max: D.hp, st: 'idle', t: rnd(.2, 1.2), home: { x, y }, ph: rnd(0, 6), shootT: rnd(1, 2.5), flash: 0, kb: 0, cd: 0, boss: ['boss', 'gboss', 'qboss', 'sboss', 'wboss'].includes(D.ai), sh: this.add.image(x, y, D.scale ? 'shadowb' : 'shadow').setAlpha(.22) };
    if (D.fly) e.sh.setScale(.7);
    if (D.ai === 'ghost') { e.phT = rnd(2, 3.5); s.setAlpha(.9); }
    this.enemies.push(e); return e;
  }
  update(time, dms) {
    const dt = this.dt = Math.min(dms, 50) / 1000; this.t += dt;
    this.pump();
    const pl = this.pl;
    if (G.title) { this.cx = 250 + Math.sin(this.t * .12) * 200; this.cy = 150 + Math.sin(this.t * .09) * 60; }
    const locked = !!UIH || G.lock > 0 || G.title || this.trans;
    if (!pl.dead) {
      pl.atkCd -= dt; pl.atkT -= dt; pl.inv -= dt;
      const sd = pl.dir === 'left' || pl.dir === 'right' ? 'side' : pl.dir;
      if (pl.kb > 0) { pl.kb -= dt; pl.setVelocity(pl.kbx, pl.kby); }
      else if (locked) { pl.setVelocity(0); pl.anims.stop(); pl.setFrame(sd + '0'); }
      else {
        const v = Input.vec(), m = Math.hypot(v.x, v.y), sp = (pl.atkT > 0 ? 26 : this.holdA > .45 ? 50 : 86) * stat().spd;
        if (pl.dashT > 0) { pl.dashT -= dt; pl.setVelocity(pl.dvx, pl.dvy); this.ghostT = (this.ghostT || 0) - dt; if (this.ghostT <= 0) { this.ghostT = .03; const g = this.add.image(pl.x, pl.y, pl.texture.key, pl.frame.name).setOrigin(.5, 1).setFlipX(pl.flipX).setTint(0x9ad8ff).setAlpha(.6).setDepth(pl.y - 1); this.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() }); } }
        else pl.setVelocity(v.x * sp, v.y * sp);
        if (m > .3 && v.y < -.5) for (const d of this.doors) if (Math.abs(pl.x - d.x) < 10 && pl.y < d.y + 15 && pl.y > d.y - 4) { this.enterRoom(d.to, [d.x, d.y]); break; }
        if (m > .15) {
          if (pl.atkT <= 0) pl.dir = Math.abs(v.x) > Math.abs(v.y) * 1.05 ? (v.x > 0 ? 'right' : 'left') : (v.y > 0 ? 'down' : 'up');
          const k = 'hero_' + (pl.dir === 'left' || pl.dir === 'right' ? 'side' : pl.dir);
          pl.flipX = pl.dir === 'left';
          if (pl.atkT > 0) { pl.anims.stop(); pl.setFrame(sd + '3'); }
          else { if (pl.anims.currentAnim?.key !== k || !pl.anims.isPlaying) pl.play(k, true); pl.anims.timeScale = (.6 + m * .5) * stat().spd; }
          this.dustT -= dt; if (this.dustT <= 0 && m > .6) { this.dustT = .28; this.puff(pl.x - v.x * 4, pl.y - 1); }
        } else { pl.anims.stop(); pl.setFrame(sd + (pl.atkT > 0 ? '3' : '0')); pl.flipX = pl.dir === 'left'; }
      }
      pl.setAlpha(pl.inv > 0 ? (Math.floor(this.t * 20) % 2 ? .35 : 1) : 1);
    }
    if (!locked && !pl.dead) this.updSkills(dt);
    if (!locked) {
      S.time += dt / 15; if (S.time >= 24) { S.time -= 24; S.day++; }
      if (this.boulder) this.updBoulder(dt);
      if (this.pet) this.updPet(dt);
      if (this.garden) this.updGarden();
      this.mpT += dt; if (this.mpT > 2.6) { this.mpT = 0; const st = stat(); if (S.mp < st.maxmp) { S.mp++; updHud(); } }
      const st = stat(); if (st.regen) { this.regT += dt; if (this.regT > 2) { this.regT = 0; if (S.hp < st.maxhp && S.hp > 0) { S.hp = Math.min(st.maxhp, S.hp + 2); updHud(); } } }
    }
    for (const o of this.npcs) this.updNpc(o, dt, locked);
    for (const c of this.critters) this.updCritter(c, dt);
    for (const e of this.enemies) if (e.hp > 0) this.updEnemy(e, dt, locked);
    this.enemies = this.enemies.filter(e => e.hp > 0);
    this.updShots(dt, locked);
    this.updPicks(dt);
    for (const f of this.fades) { const b = !G.title && pl.x > f.l && pl.x < f.r && pl.y < f.b && pl.y > f.t; const a = b ? .55 : 1; if (f.s.alpha !== a) f.s.alpha += (a - f.s.alpha) * .25; if (Math.abs(f.s.alpha - a) < .02) f.s.alpha = a; }
    this.bars.clear();
    for (const e of this.enemies) if (!e.boss && e.hp > 0 && e.hp < e.max) {
      const w = 16, x = Math.round(e.spr.x - w / 2), y = Math.round(e.spr.y - e.spr.displayHeight - 4 - (e.D.fly ? 10 : 0));
      this.bars.fillStyle(0x1a0a0a, .85).fillRect(x - 1, y - 1, w + 2, 4); this.bars.fillStyle(0xff5a4a, 1).fillRect(x, y, Math.ceil(w * e.hp / e.max), 2);
    }
    // garis bidik sihir
    this.aimG.clear();
    if (Input.aim.on && Input.aim.drag && !locked && !pl.dead) {
      const a = Math.atan2(Input.aim.y, Input.aim.x), ox = pl.x, oy = pl.y - 9;
      for (let i = 1; i <= 8; i++) { const X = ox + Math.cos(a) * i * 11, Y = oy + Math.sin(a) * i * 11, r = i === 8 ? 3.5 : 2; this.aimG.fillStyle(0x5a2a00, .8).fillCircle(X, Y, r + 1); this.aimG.fillStyle(i === 8 ? 0xff7a2a : 0xffe27a, 1).fillCircle(X, Y, r); }
    }
    for (const o of this.npcs) if (o.mark) { o.mark.setVisible(!G.title && this.npcHasQuest(o.n.id)); o.mark.x = o.spr.x; }
    if (!locked && !pl.dead) this.checkZones();
  }
  puff(x, y) { const p = this.add.image(x, y, 'smoke').setScale(.35).setAlpha(.5).setDepth(y - 1).setTint(this.M.id === 'cave' ? 0x8a8494 : 0xe8dcc0); this.tweens.add({ targets: p, scale: .8, alpha: 0, y: y - 4, duration: 380, onComplete: () => p.destroy() }); }
  camStep() {
    const pl = this.pl, M = this.M, cam = this.cameras.main;
    if (this.camFollow && pl) {
      const tx = pl.x - VW / 2, ty = pl.y - 12 - VH / 2, k = Math.exp(-this.dt * 9);
      let ox = (this.cx - tx) * k, oy = (this.cy - ty) * k;
      if (Math.abs(ox) < .5) ox = 0; if (Math.abs(oy) < .5) oy = 0;
      const sx = clamp(Math.round(pl.x) - VW / 2 + Math.round(ox), 0, M.w - VW), sy = clamp(Math.round(pl.y) - 12 - VH / 2 + Math.round(oy), 0, M.h - VH);
      this.cx = tx + ox; this.cy = ty + oy;
      cam.setScroll(sx, sy);
    }
    if (G.title) cam.setScroll(Math.round(this.cx), Math.round(this.cy));
    if (pl) {
      pl.setDepth(pl.y); pl.sh.setPosition(Math.round(pl.x), Math.round(pl.y) - 1).setDepth(pl.y - .5);
      if (this.sword.visible) this.sword.setDepth(pl.y + (pl.dir === 'up' ? -1 : 1));
    }
    updPops(cam);
    if (this.night) {
      const d = this.night, sx = cam.scrollX, sy = cam.scrollY, n = nightAmt(), rain = this.weather === 'rain' ? .16 : 0;
      d.clear();
      if (n + rain > .02) {
        const col = n > .05 ? lerpCol(0x40220c, 0x0a1238, clamp((n - .1) / .3, 0, 1)) : 0x1a2430;
        d.fill(col, 1); d.setAlpha(Math.min(.74, n + rain));
        if (n > .12) { d.erase('nlS', Math.round(pl.x - sx - 38), Math.round(pl.y - 12 - sy - 38)); for (const L of this.lights) { const r = L.big ? 54 : L.small ? 38 : 18, k = L.big ? 'nlL' : L.small ? 'nlS' : 'nlW', X = L.x - sx, Y = L.y - sy; if (X > -60 && X < VW + 60 && Y > -60 && Y < VH + 60) d.erase(k, Math.round(X - r), Math.round(Y - r)); } for (const p of this.shots) if (p.kind === 'fire') d.erase('nlS', Math.round(p.gx - sx - 38), Math.round(p.gy - 9 - sy - 38)); for (const e of this.enemies) if (e.type === 'wisp') d.erase('nlS', Math.round(e.spr.x - sx - 38), Math.round(e.spr.y - 16 - sy - 38)); }
      }
      if (this.glows) { const ga = clamp((n - .15) * 1.3, 0, .55); for (const g of this.glows) g.setAlpha(ga * (.9 + Math.sin(this.t * 3 + g.x) * .1)); }
      updClock();
    }
    if (this.pet) { this.pet.setDepth(this.pet.y); this.pet.sh.setPosition(this.pet.x, this.pet.y - 1).setDepth(this.pet.y - .5); }
    if (this.dark) {
      const d = this.dark, sx = cam.scrollX, sy = cam.scrollY; d.clear(); d.fill(0x06040c, .92);
      const fl = 1 + Math.sin(this.t * 7) * .03;
      d.erase('light', Math.round(pl.x - sx - 80 * fl), Math.round(pl.y - 10 - sy - 80 * fl));
      for (const L of this.lights) { const X = L.x - sx, Y = L.y - sy; if (X > -40 && X < VW + 40 && Y > -40 && Y < VH + 40) d.erase('lights', Math.round(X - 36), Math.round(Y - 36)); }
      for (const e of this.enemies) if (e.boss) d.erase('light', Math.round(e.spr.x - sx - 80), Math.round(e.spr.y - 20 - sy - 80));
      for (const p of this.shots) if (p.kind === 'fire') d.erase('lights', Math.round(p.gx - sx - 36), Math.round(p.gy - 9 - sy - 36));
    }
  }
  pump() {
    while (Input.q.length) {
      const k = Input.q.shift();
      if (UIH) { UIH(k.startsWith('j') ? k.slice(1) : k); continue; }
      if (G.lock > 0 || this.trans || this.pl?.dead || G.title) { Input.castAng = null; continue; }
      if (k === 'a') this.actionA(); else if (k === 'b') this.magic(); else if (k === 'dash') this.dash(); else if (k === 'nova') this.nova(); else if (k === 'item') this.drink(); else if (k === 'menu') mainMenu(this); else if (k === 'map') openMap(this); else if (k === 'bag') openBag(this);
    }
  }
  front(dist = 12) { const [dx, dy] = DIRV[this.pl.dir]; return { x: this.pl.x + dx * dist, y: this.pl.y - 3 + dy * dist }; }
  actionA() {
    const f = this.front(11); let best = null, bd = 1e9;
    for (const it of this.inter) {
      if (it.rect) { const [rx, ry, rw, rh] = it.rect; if (f.x > rx && f.x < rx + rw && f.y > ry && f.y < ry + rh && bd > 5) { bd = 5; best = it; } continue; }
      const x = it.npc ? it.npc.spr.x : it.x, y = it.npc ? it.npc.spr.y - 3 : it.y;
      const d = Math.hypot(x - f.x, y - f.y); if (d < it.r && d < bd) { bd = d; best = it; }
    }
    if (best) { this.pl.setVelocity(0); sfx('ok'); best.fn(); return; }
    this.attack();
  }
  sparkle(x, y, key = 'dot', n = 10) {
    const p = this.add.particles(x, y, key, { lifespan: 600, speed: { min: 20, max: 60 }, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 }, emitting: false }).setDepth(y + 20);
    p.explode(n); this.time.delayedCall(700, () => p.destroy());
  }
  checkZones() {
    const pl = this.pl, M = this.M;
    for (const ex of M.exits || []) if (pl.x > ex.x && pl.x < ex.x + ex.w && pl.y > ex.y && pl.y < ex.y + ex.h) {
      if (ex.to === 'forest' && S.stage === 0) { pl.y -= 6; this.guardStop(); return; }
      this.goto(ex.to, ex.tx, ex.ty, ex.dir); return;
    }
    if (!this.bossOn) for (const B of M.bosses || []) {
      if (S.stage < B.need || S.flags[B.flag]) continue; const z = B.zone;
      if (pl.x > z[0] && pl.x < z[0] + z[2] && pl.y > z[1] && pl.y < z[1] + z[3]) { this.startBoss(B); break; }
    }
  }
  async guardStop() {
    G.lock++; const g = this.npcs.find(n => n.n.id === 'guard'); if (g) this.face(g, 'down');
    await say('Tunggu! Hutan sedang berbahaya. Temui Tetua Bram di rumah pohon dulu.', 'Penjaga'); G.lock--;
  }
  goto(map, x, y, dir, extra = {}) {
    if (this.trans) return; this.trans = true;
    FADE.style.opacity = 1; S.map = map; S.x = x; S.y = y; S.dir = dir; saveGame(null);
    setTimeout(() => this.scene.restart(Object.assign({ map, x, y, dir }, extra)), 360);
  }
}
