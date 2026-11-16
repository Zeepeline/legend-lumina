'use strict';
// "Juice" v1.45: lapisan partikel & animasi tambahan di atas sistem yang ada (tanpa mengubah logika tempur).
// - jx(nama, x, y, n, opsi): 4 pemancar partikel bersama per scene (spark, chip, mote, star) → murah, tanpa objek baru per partikel.
// - Kena pukul: percikan searah tebasan + serpihan sewarna bahan musuh + bintang saat kritikal.
// - Mati: butiran cahaya naik saat musuh memutih; ancang-ancang musuh: butiran merah mengumpul ke badan.
// - Arka: bayangan-ikut saat berguling, serpihan saat terluka, sorak + pilar cahaya saat naik level, butiran hijau saat pulih,
//   pose memancing, bangkit setelah kalah. Ala Dimraeth: zona bahaya di tanah, aura status, kawah hantaman, nisan Jejak Cahaya.
//   OPT.lite → jumlah partikel separuh, tanpa bayangan-ikut & butiran ancang-ancang.
const JX_MAT = [ // warna serpihan per jenis musuh (dicocokkan ke awalan id)
  [/^slimeb/, 0x5aa8e8], [/^slimer|^slimef/, 0xe8643a], [/^slimei/, 0xa8e0ff], [/^slimep/, 0x9a5ad0], [/^slime/, 0x6fd36a],
  [/^golemi/, 0xbfe2ff], [/^golem/, 0x8a7f78], [/^ghost|^wisp/, 0xcfd8ff], [/^skel/, 0xe8e2cf], [/^plant|^frog|^snake/, 0x6f9a3c],
  [/^shroom|^squeen/, 0xc65a7a], [/^bat/, 0x7a5a9a], [/^bee/, 0xe8c040], [/^salam/, 0xff8a3a], [/^mimic/, 0xb07a3a],
];
function jxMat(e) { const id = e.id || ''; for (const [re, c] of JX_MAT) if (re.test(id)) return c; return 0xb23a3a; }
function jxTextures(T) {
  if (T.exists('jx_sq')) return;
  const mkc = (k, w, h, fn) => { const c = T.createCanvas(k, w, h), x = c.getContext(); x.fillStyle = '#fff'; fn(x); c.refresh(); };
  mkc('jx_sq', 2, 2, x => x.fillRect(0, 0, 2, 2));
  mkc('jx_mote', 5, 5, x => { x.globalAlpha = .45; x.fillRect(1, 0, 3, 5); x.fillRect(0, 1, 5, 3); x.globalAlpha = 1; x.fillRect(1, 1, 3, 3); });
  const tomb = T.createCanvas('jx_tomb', 12, 15), t = tomb.getContext(), R = (c, x, y, w, h) => { t.fillStyle = c; t.fillRect(x, y, w, h); };
  R('#2a2630', 2, 1, 8, 13); R('#2a2630', 1, 3, 10, 11); R('#2a2630', 0, 12, 12, 3); R('#8d8a96', 3, 2, 6, 11); R('#8d8a96', 2, 4, 8, 9);
  R('#b9b6c2', 3, 2, 5, 1); R('#b9b6c2', 2, 4, 1, 7); R('#5d596a', 9, 5, 1, 8); R('#4a4654', 5, 5, 2, 6); R('#4a4654', 4, 7, 4, 1);
  R('#5a7a3a', 1, 13, 10, 1); R('#6f9a3c', 1, 12, 2, 1); R('#6f9a3c', 8, 12, 3, 1); tomb.refresh();
  { const c = T.createCanvas('jx_arc', 40, 20), x = c.getContext(); x.strokeStyle = '#fff'; x.lineCap = 'round'; /* sabit debu, lancip di ujung */
    for (let i = 0; i < 4; i++) {
      x.globalAlpha = .28; x.lineWidth = 5 - i * 1.2; x.beginPath(); x.arc(20, 30, 24, Math.PI * (1.22 + i * .04), Math.PI * (1.78 - i * .04)); x.stroke();
    }
    c.refresh();
    const l = T.createCanvas('jx_line', 48, 1), y = l.getContext(), gr = y.createLinearGradient(0, 0, 48, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); y.fillStyle = gr; y.fillRect(0, 0, 48, 1); l.refresh(); }
  mkc('jx_star', 7, 7, x => { x.fillRect(3, 0, 1, 7); x.fillRect(0, 3, 7, 1); x.fillRect(2, 2, 3, 3); });
}
const JX_CFG = {
  spark: ['jx_sq', { lifespan: { min: 130, max: 280 }, speed: { min: 80, max: 230 }, scale: { start: 1.4, end: 0 }, blendMode: 'ADD' }],
  chip: ['jx_sq', { lifespan: { min: 300, max: 540 }, speed: { min: 40, max: 140 }, gravityY: 300, scale: { start: 1.7, end: .7 },
    alpha: { start: 1, end: 0 } }],
  mote: ['jx_mote', { lifespan: { min: 480, max: 950 }, speedY: { min: -58, max: -20 }, speedX: { min: -14, max: 14 }, scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 }, blendMode: 'ADD' }],
  pop: ['jx_mote', { lifespan: { min: 380, max: 620 }, speed: { min: 18, max: 62 }, scale: { start: 1.1, end: 0 }, alpha: { start: 1, end: 0 } }],
  star: ['jx_star', { lifespan: { min: 340, max: 620 }, speed: { min: 50, max: 140 }, scale: { start: 1.3, end: 0 }, rotate: { start: 0, end: 180 },
    blendMode: 'ADD' }],
};
Object.assign(World.prototype, {
  // pancarkan n partikel: o = { ang (radian), spread (derajat), tint, rx, ry (sebaran posisi) }
  jx(name, x, y, n, o = {}) {
    if (OPT.lite) n = Math.ceil(n / 2);
    const J = this._jx || (this._jx = { em: {}, st: {} });
    let em = J.em[name];
    if (!em || !em.scene) {
      jxTextures(this.textures); const [tex, cfg] = JX_CFG[name], st = J.st[name] = { ang: 0, spread: 180, tint: 0xffffff };
      const c = Object.assign({ emitting: false, tint: { onEmit: () => st.tint } }, cfg);
      if (cfg.speed) c.angle = { onEmit: () => st.ang + (Math.random() * 2 - 1) * st.spread };
      em = J.em[name] = this.add.particles(0, 0, tex, c);
    }
    const st = J.st[name]; st.ang = (o.ang || 0) * 180 / Math.PI; st.spread = o.spread == null ? 180 : o.spread;
    st.tint = o.tint == null ? 0xffffff : o.tint;
    em.setDepth(y + 24);
    if (o.rx || o.ry) for (let i = 0; i < n; i++) em.emitParticleAt(x + rnd(-(o.rx || 0), o.rx || 0), y + rnd(-(o.ry || 0), o.ry || 0), 1);
    else em.emitParticleAt(x, y, n);
  },
  jxLevelUp() {
    const pl = this.pl; if (!pl) return;
    pl._emote = { k: 'cheer', fps: 7, loop: 1, t: 1.15 };
    this.jx('star', pl.x, pl.y - 14, 16, { tint: 0xffe07a });
    const col = i => this.jx('mote', pl.x, pl.y - 4, 5, { tint: i % 2 ? 0xfff2b0 : 0x9ae8ff, rx: 9, ry: 3 });
    for (let i = 0; i < 6; i++) this.time.delayedCall(i * 110, () => { if (pl.active) col(i); });
  },
  jxWind(e) { // butiran merah mengumpul ke badan musuh selama ancang-ancang
    if (OPT.lite) return; jxTextures(this.textures);
    const s = e.spr, cy = () => s.y - (e.D.r || 8) * (e.sc || 1), R = 18 + (e.D.r || 8);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2 + Math.random(), m = this.add.image(s.x + Math.cos(a) * R, cy() + Math.sin(a) * R * .7, 'jx_mote')
        .setTint(e.boss ? 0xffc04a : 0xff5a4a).setBlendMode('ADD').setDepth(s.y + 30).setAlpha(0);
      this.tweens.add({ targets: m, x: s.x, y: cy(), alpha: { from: 0, to: 1 }, scale: { from: 1.3, to: .4 }, duration: 260 + i * 22, ease: 'Quad.easeIn',
        onComplete: () => m.destroy() });
    }
  },
  jxGhost() { // bayangan-ikut saat berguling
    const pl = this.pl, g = this.add.image(pl.x, pl.y, pl.texture.key, pl.frame.name).setOrigin(pl.originX, pl.originY).setFlipX(pl.flipX)
      .setScale(pl.scaleX, pl.scaleY).setTint(0x8fd0ff).setAlpha(.5).setDepth(pl.depth - 1);
    this.tweens.add({ targets: g, alpha: 0, duration: 210, onComplete: () => g.destroy() });
  },
  jxShots(dt) { // ekor partikel proyektil + percikan saat proyektil hilang (kena/padam)
    const M = this._jxSh || (this._jxSh = new Map()), live = this.shots || [];
    for (const sh of live) {
      const s = sh.s; if (!s || !s.active) continue;
      let m = M.get(sh);
      const col = sh.kind === 'fire' ? 0xff9a3a : sh.kind === 'arrow' ? 0xfff2d0 : s.isTinted ? s.tintTopLeft : 0xbfe8ff;
      if (!m) M.set(sh, m = { t: 0, x: s.x, y: s.y, c: col });
      m.x = s.x; m.y = s.y; m.t -= dt;
      if (m.t > 0) continue; const arrow = sh.kind === 'arrow';
      m.t = arrow ? .05 : .035; this.jx(arrow ? 'spark' : 'mote', s.x, s.y, 1, { tint: m.c, rx: 1.5, ry: 1.5 });
    }
    if (M.size > live.length) for (const [sh, m] of M) {
      if (live.includes(sh)) continue; M.delete(sh);
      this.jx('spark', m.x, m.y, 7, { tint: m.c }); if (sh.kind !== 'arrow') this.jx('mote', m.x, m.y, 4, { tint: m.c, rx: 4, ry: 4 });
    }
  },
  // ── ala Dimraeth: zona bahaya di tanah, aura status, kawah hantaman, nisan Jejak Cahaya ──
  jxTele(e) { // cincin merah tipis di tanah yang menutup selama ancang-ancang (gaya acuan Dimraeth: halus, tidak menutupi tanah)
    const s = e.spr, pl = this.pl, a = Math.atan2(pl.y - s.y, pl.x - s.x), r0 = (e.D.r || 8) * (e.sc || 1), R = r0 + 12;
    const cx = s.x + Math.cos(a) * (r0 + 8), cy = s.y - 2 + Math.sin(a) * (r0 + 8) * .8, g = this.add.graphics().setDepth(1.5), T0 = Math.max(.2, e.t || .4);
    const o = { p: 0 }, done = () => { if (g.active) this.tweens.add({ targets: g, alpha: 0, duration: 140, onComplete: () => g.destroy() }); };
    this.tweens.add({ targets: o, p: 1, duration: T0 * 1000, onComplete: done, onUpdate: () => {
      if (!g.active) return; g.clear(); if (e.hp <= 0 || !s.active) { g.destroy(); return; }
      const k = 1.35 - .35 * o.p; g.fillStyle(0xff6a5a, .05 + .07 * o.p).fillEllipse(cx, cy, R * 2, R * 1.5);
      g.lineStyle(1, 0xff8a7a, .35 + .45 * o.p).strokeEllipse(cx, cy, R * 2 * k, R * 1.5 * k);
    } });
  },
  jxSwoosh(x, y, vx, vy, big) { // sabit debu pucat di tanah + garis laju tipis di belakang gerakan cepat
    jxTextures(this.textures); const a = Math.atan2(vy, vx), k = big ? 1.25 : .85;
    const d = this.add.image(x - Math.cos(a) * 6, y + 1, 'jx_arc').setRotation(a - Math.PI / 2).setTint(0xf0e2c0).setAlpha(.55)
      .setScale(k * .7, k * .6).setDepth(y - 2);
    this.tweens.add({ targets: d, alpha: 0, scaleX: k * 1.25, scaleY: k, x: d.x - Math.cos(a) * 7, y: d.y - Math.sin(a) * 5, duration: 380,
      onComplete: () => d.destroy() });
    const l = this.add.image(x, y - 9, 'jx_line').setOrigin(1, .5).setRotation(a).setTint(0xfff6dc).setAlpha(.5).setScale(big ? 1.5 : 1, 1).setDepth(y - 1);
    this.tweens.add({ targets: l, alpha: 0, scaleX: l.scaleX * 1.3, duration: 240, onComplete: () => l.destroy() });
  },
  jxCrater(x, y, R) { // bekas hantaman: retakan gelap yang memudar pelan
    const g = this.add.graphics().setDepth(1.2); g.fillStyle(0x1a1410, .34).fillEllipse(x, y, R * 1.25, R * .85);
    g.lineStyle(1, 0x120e0a, .6);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2 + rnd(-.3, .3), l = R * rnd(.55, .95);
      const mx = x + Math.cos(a) * l * .5 + rnd(-3, 3), my = y + Math.sin(a) * l * .34 + rnd(-2, 2);
      g.lineBetween(x, y, mx, my); g.lineBetween(mx, my, x + Math.cos(a) * l, y + Math.sin(a) * l * .68);
    }
    this.tweens.add({ targets: g, alpha: 0, delay: 3500, duration: 2500, onComplete: () => g.destroy() });
  },
  jxDustRing(x, y, r = 18) { // cincin debu hantaman melingkar di tanah ala Souls-lite
    const g = this.add.graphics().setDepth(y - 1);
    g.lineStyle(1.8, 0xdfd3b8, 0.65);
    g.strokeEllipse(x, y, r * 0.7, r * 0.45);
    this.tweens.add({
      targets: g, scaleX: 1.8, scaleY: 1.6, alpha: 0, duration: 220,
      ease: 'Cubic.easeOut', onComplete: () => g.destroy()
    });
  },
  jxPostureBreak(x, y) { // kilau pecah kristal emas saat musuh stagger / terbuka riposte
    this.jx('star', x, y, 7, { tint: 0xffea78 });
    this.jx('spark', x, y, 9, { tint: 0xffffff, spread: 180 });
    const g = this.add.graphics().setDepth(y + 20).setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(0xfff2a0, 0.85);
    g.fillCircle(x, y, 12);
    this.tweens.add({
      targets: g, scaleX: 2.2, scaleY: 2.2, alpha: 0, duration: 180,
      ease: 'Quad.easeOut', onComplete: () => g.destroy()
    });
  },
  jxAura(dt) { // aura status: terbakar, racun, beku/dingin, terhuyung, mengamuk (musuh) + status pemain
    const L = this._jxL; L.au = (L.au || 0) - dt; if (L.au > 0) return; L.au = OPT.lite ? .16 : .08;
    for (const e of this.enemies || []) {
      const s = e.spr; if (e.hp <= 0 || !s.active || !s.visible) continue;
      const h = s.displayHeight, w = s.displayWidth * .3, top = s.y - h;
      if (e.burn > 0) { this.jx('mote', s.x, s.y - h * .45, 2, { tint: Math.random() < .5 ? 0xff7a2a : 0xffd04a, rx: w, ry: h * .35 }); }
      if (e.poison > 0 && Math.random() < .6) this.jx('pop', s.x, top + 2, 1, { tint: 0x7ae05a, rx: w, ry: 3 });
      if (e.frz > 0 && Math.random() < .5) this.jx('star', s.x, s.y - h * .5, 1, { tint: 0xbfeaff, rx: w, ry: h * .4 });
      else if (e.slow > 0 && Math.random() < .5) this.jx('pop', s.x, s.y - 3, 1, { tint: 0x9ad8ff, rx: w, ry: 2 });
      const a = this.t * 9;
      if (e.staggerT > 0) this.jx('spark', s.x + Math.cos(a) * w * 1.2, top - 2 + Math.sin(a) * 2.5, 1, { tint: 0xffe07a, spread: 20, ang: a });
      if (e.rageT > 0 || e.enrageT > 0) this.jx('mote', s.x, s.y - h * .3, 1, { tint: 0xff3a2a, rx: w * 1.3, ry: h * .3 });
    }
    const pl = this.pl, P = this.pst || {};
    if (P.burn > 0) this.jx('mote', pl.x, pl.y - 12, 2, { tint: Math.random() < .5 ? 0xff7a2a : 0xffd04a, rx: 6, ry: 9 });
    if (P.poison > 0 && Math.random() < .6) this.jx('pop', pl.x, pl.y - 26, 1, { tint: 0x7ae05a, rx: 6, ry: 3 });
    if (P.chill > 0 && Math.random() < .6) this.jx('star', pl.x, pl.y - 12, 1, { tint: 0xbfeaff, rx: 7, ry: 10 });
  },
  jxTick(dt) {
    const pl = this.pl; if (!pl || !pl.active) return;
    // naik level & pulih (dibandingkan dengan frame sebelumnya)
    const L = this._jxL || (this._jxL = { lv: S.lv, hp: S.hp, gh: 0, fish: 0 });
    if (S.lv > L.lv) this.jxLevelUp();
    else if (S.hp - L.hp >= Math.max(8, stat().maxhp * .12) && !pl.dead) {
      this.jx('mote', pl.x, pl.y - 10, 12, { tint: 0x8af0a0, rx: 8, ry: 8 }); this.jx('star', pl.x, pl.y - 16, 4, { tint: 0xc8ffd0 });
    }
    L.lv = S.lv; L.hp = S.hp;
    if (pl.dead) G._jxDied = 1;
    // bayangan-ikut saat berguling
    if (pl._roll > 0 && !OPT.lite) {
      L.gh -= dt; const v = pl.body.velocity;
      if (L.gh <= 0) { L.gh = .06; this.jxGhost(); if (v.length() > 60) this.jxSwoosh(pl.x, pl.y, v.x, v.y, false); }
    } else L.gh = 0;
    // pose memancing
    if (this.fishing) { L.fish += dt; pl.flipX = pl.dir === 'left'; pl._emote = { k: 'fish_cast', f: Math.min(3, Math.floor(L.fish / .13)) }; }
    else if (L.fish) { L.fish = 0; pl._emote = null; }
    this.jxShots(dt);
    this.jxAura(dt);
    // nisan di titik Jejak Cahaya (emas yang tertinggal saat kalah)
    const ls = this.lostS;
    if (ls && ls.active && (!this._jxTomb || !this._jxTomb.active)) {
      jxTextures(this.textures); this._jxTomb = this.add.image(ls.x, ls.y, 'jx_tomb').setOrigin(.5, 1).setScale(1.4);
    }
    if (this._jxTomb && !(ls && ls.active)) { this._jxTomb.destroy(); this._jxTomb = null; }
    if (this._jxTomb) {
      this._jxTomb.setPosition(ls.x, ls.y + 4).setDepth(ls.y - .5);
      if (Math.random() < dt * 5) this.jx('mote', ls.x, ls.y - 12, 1, { tint: 0xffe28a, rx: 5, ry: 4 });
    }
    // ancang-ancang musuh + debu langkah musuh besar
    for (const e of this.enemies || []) {
      const w = e.hp > 0 && (e.st === 'wind' || e.st === 'swind' || e.st === 'cwind');
      const bv = e.hp > 0 && e.spr.body ? e.spr.body.velocity : null, sp = bv ? bv.length() : 0;
      if (sp > 105 && !OPT.lite) {
        e._jxSw = (e._jxSw || 0) - dt; if (e._jxSw <= 0) { e._jxSw = .11; this.jxSwoosh(e.spr.x, e.spr.y, bv.x, bv.y, (e.D.r || 8) >= 10); }
      }
      else e._jxSw = 0;
      if (w && !e._jxW) { this.jxWind(e); if (!e.boss && e.D.ai !== 'golem') this.jxTele(e); } e._jxW = w;
      if (e.hp > 0 && (e.D.r || 0) >= 12 && this.puff && e.spr.body && e.spr.body.velocity.length() > 8) {
        e._jxStep = (e._jxStep || 0) - dt; if (e._jxStep <= 0) { e._jxStep = .38; this.puff(e.spr.x + rnd(-6, 6), e.spr.y); }
      }
    }
  },
});
{ const W = World.prototype, _cr = W.create, _hit = W.hitFx, _kill = W.killEnemy, _hurt = W.hurtPlayer, _sw = W.shockwave;
  W.create = function () {
    this._jx = null; this._jxL = null; this._jxSh = null; this._jxTomb = null; const r = _cr.apply(this, arguments), pl = this.pl;
    if (!this._jxHook) { this._jxHook = 1; this.events.on('postupdate', (t, d) => this.jxTick(Math.min(.1, d / 1000))); }
    if (G._jxDied && pl && this === G.scene) {
      G._jxDied = 0; pl._emote = { k: 'rise', fps: 4.5, t: .95 }; this.jx('mote', pl.x, pl.y - 6, 10, { tint: 0xfff2b0, rx: 8, ry: 4 });
    }
    return r;
  };
  W.hitFx = function (e, crit) {
    const r = _hit.apply(this, arguments), s = e && e.spr, pl = this.pl; if (!s || !s.active) return r;
    const y = s.y - (e.D.r || 8) * (e.sc || 1), ang = pl ? Math.atan2(y - (pl.y - 7), s.x - pl.x) : 0, fin = crit || (pl && pl.combo === 5);
    this.jx('spark', s.x, y, fin ? 11 : 6, { ang, spread: fin ? 50 : 34, tint: crit ? 0xffe07a : 0xffffff });
    this.jx('chip', s.x, y, fin ? 8 : 4, { ang: ang - .35, spread: 55, tint: jxMat(e) });
    if (crit) this.jx('star', s.x, y, 5, { tint: 0xffd25a });
    return r;
  };
  W.killEnemy = function (e) {
    const s = e && e.spr, x = s && s.x, y = s && s.y - (e.D.r || 8) * (e.sc || 1), r = _kill.apply(this, arguments);
    if (s && x != null) {
      const R = (e.D.r || 8) * (e.sc || 1);
      this.jx('chip', x, y, e.boss ? 18 : 8, { ang: -Math.PI / 2, spread: 80, tint: jxMat(e) });
      this.jx('mote', x, y, e.boss ? 26 : 9, { rx: R, ry: R, tint: e.boss ? 0xffe6a0 : 0xffffff });
      const more = () => { this.jx('mote', x, y, 12, { rx: R * 1.3, ry: R, tint: 0xffe6a0 }); this.jx('star', x, y, 5, { tint: 0xffd25a }); };
      if (e.boss) for (let i = 1; i < 5; i++) this.time.delayedCall(i * 160, more);
    }
    return r;
  };
  W.hurtPlayer = function (dmg, sx, sy) {
    const pl = this.pl, hp = S.hp, r = _hurt.apply(this, arguments);
    if (pl && S.hp < hp) {
      pl._emote = null; const ang = sx == null ? -Math.PI / 2 : Math.atan2(pl.y - sy, pl.x - sx);
      this.jx('chip', pl.x, pl.y - 12, 6, { ang: ang - .3, spread: 50, tint: 0xff6a5a });
      this.jx('spark', pl.x, pl.y - 12, 5, { ang, spread: 40, tint: 0xffd0c8 });
    }
    return r;
  };
  if (W.openChest) { const _oc = W.openChest;
    W.openChest = function (c) {
      if (c && !S.flags[c.id]) { this.jx('star', c.x, c.y - 8, 10, { tint: 0xffd25a }); this.jx('mote', c.x, c.y - 6, 8, { tint: 0xfff2b0, rx: 7, ry: 3 }); }
      return _oc.apply(this, arguments);
    };
  }
  const SPK = { dot: 0xffffff, dotg: 0xbff09a, doto: 0xffb04a, spark: 0xffe07a };
  W.sparkle = function (x, y, key = 'dot', n = 10) { this.jx('pop', x, y, n, { tint: SPK[key] || 0xffffff }); }; /* dulu: pemancar baru tiap panggilan */
  W.shockwave = function (x, y, R) {
    const r = _sw.apply(this, arguments), n = OPT.lite ? 6 : 12;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2; this.jx('chip', x + Math.cos(a) * R * .55, y + Math.sin(a) * R * .4, 2, { ang: a - .5, spread: 30, tint: 0x8a7a6a });
    }
    this.jxCrater(x, y, R);
    if (this.puff) for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .4; this.puff(x + Math.cos(a) * R * .6, y + Math.sin(a) * R * .45); }
    return r;
  };
  if (W.slashFx) {
    const _slash = W.slashFx;
    W.slashFx = function (wt, combo) {
      const pl = this.pl;
      if (pl) {
        const [dx, dy] = DIRV[pl.dir], cIdx = ((combo || 1) - 1) % 5, fin = cIdx === 4;
        const ang = Math.atan2(dy, dx);
        this.jx('spark', pl.x + dx * 14, pl.y - 7 + dy * 8, fin ? 5 : 2, {
          ang, spread: 35, tint: wt === 'axe' ? 0xffc27a : 0xfffae0
        });
        if (fin) this.jxDustRing(pl.x + dx * 16, pl.y + 2, 22);
      }
      return _slash.apply(this, arguments);
    };
  }
}
