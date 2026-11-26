'use strict';
// Polesan kombat & VFX ala Dimraeth: smear kontras ganda, percikan searah, isi ulang MP, stack & detonasi Bleed/Poison, awan miasma, & jejak proyektil.
{
  const W = World.prototype;
  const ensureTex = (sc, key, w, h, draw) => {
    if (sc.textures.exists(key)) return key;
    const g = sc.make.graphics({ add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
    return key;
  };
  const dualArcTex = sc => {
    if (sc.textures.exists('vfx_dual_arc')) return 'vfx_dual_arc';
    const [c, x] = mk(72, 72), cx = 36, cy = 36;
    x.fillStyle = '#120c18';
    x.beginPath();
    x.arc(cx, cy, 34, -1.35, 1.35);
    x.arc(cx - 10, cy, 24, 1.25, -1.25, true);
    x.closePath();
    x.fill();
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.arc(cx + 1, cy, 31, -1.15, 1.15);
    x.arc(cx - 6, cy, 26, 1.08, -1.08, true);
    x.closePath();
    x.fill();
    sc.textures.addCanvas('vfx_dual_arc', c);
    return 'vfx_dual_arc';
  };
  const sparkLineTex = sc => ensureTex(sc, 'vfx_spark_line', 14, 4, g => {
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(0, 2, 10, 0, 14, 2);
    g.fillTriangle(0, 2, 10, 4, 14, 2);
  });
  const bloodDropTex = sc => ensureTex(sc, 'vfx_blood_drop', 12, 8, g => {
    g.fillStyle(0x7c1420, 0.85);
    g.fillEllipse(6, 4, 10, 5);
    g.fillStyle(0xb81e2c, 0.75);
    g.fillEllipse(5, 3.5, 5, 2.5);
  });
  const miasmaTex = sc => ensureTex(sc, 'vfx_miasma_puff', 28, 28, g => {
    g.fillStyle(0x521c78, 0.36);
    g.fillCircle(14, 14, 13);
    g.fillStyle(0x9a4ae0, 0.34);
    g.fillCircle(13, 13, 8);
    g.fillStyle(0xc888ff, 0.28);
    g.fillCircle(11, 11, 4);
  });

  const dropBlood = (sc, x, y, n = 1) => {
    if (OPT.lite || !sc || !sc.add) return;
    const key = bloodDropTex(sc);
    for (let i = 0; i < n; i++) {
      const b = sc.add.image(x + rnd(-8, 8), y + rnd(-3, 3), key).setDepth(y - 0.4)
        .setScale(0.75 + Math.random() * 0.5).setAlpha(0.85);
      sc.tweens.add({ targets: b, alpha: 0, delay: 1600, duration: 1200, onComplete: () => b.destroy() });
    }
  };

  const flyMote = (sc, fx, fy, pl) => {
    if (OPT.lite || !sc || !sc.add || !pl) return;
    const k = sparkLineTex(sc), m = sc.add.image(fx, fy, k).setDepth(fy + 42)
      .setBlendMode(Phaser.BlendModes.ADD).setTint(0x7ee8ff).setScale(0.55, 0.8);
    const ox = fx + rnd(-12, 12), oy = fy - 14 - Math.random() * 10, o = { t: 0 };
    sc.tweens.add({
      targets: o, t: 1, duration: 220, ease: 'Quad.easeIn',
      onUpdate: () => {
        if (!m.active || !pl.active) return;
        const t = o.t, u = 1 - t, tx = pl.x, ty = pl.y - 12;
        m.setPosition(u * u * fx + 2 * u * t * ox + t * t * tx, u * u * fy + 2 * u * t * oy + t * t * ty);
        m.setRotation(Math.atan2(ty - m.y, tx - m.x)).setAlpha(1 - t * 0.35);
      },
      onComplete: () => m.destroy()
    });
  };

  const _slashFx = W.slashFx;
  if (_slashFx) W.slashFx = function (wt, combo) {
    _slashFx.call(this, wt, combo);
    const fin = (wt === 'sword' && (combo || 1) === 3) || (combo || 1) === 5;
    if (OPT.lite || (!fin && wt !== 'axe') || !this.pl || this.pl.dead) return;
    const pl = this.pl, [dx, dy] = DIRV[pl.dir] || [1, 0], ang = Math.atan2(dy, dx);
    const cIdx = fin ? 2 : (((combo || 1) - 1) % 3);
    this.time.delayedCall(45, () => {
      if (!this.pl || this.pl.dead) return;
      const hx = this.pl.x + dx * 6, hy = this.pl.y - 8 + dy * 4;
      const a = this.add.image(hx, hy, dualArcTex(this)).setRotation(ang)
        .setFlipY(dx < 0 ? cIdx !== 1 : cIdx === 1).setTint(arcTint(wt))
        .setScale(0.7).setAlpha(0.95).setDepth(this.pl.y + 12);
      this.tweens.add({ targets: a, scale: fin ? 1.35 : 1.15, alpha: 0, duration: 180, ease: 'Cubic.easeOut', onComplete: () => a.destroy() });
    });
  };

  const _hitFx = W.hitFx;
  if (_hitFx) W.hitFx = function (e, crit) {
    _hitFx.call(this, e, crit);
    const s = e && e.spr;
    if (OPT.lite || !s || !s.active) return;
    const pl = this.pl, baseA = pl ? Math.atan2(s.y - pl.y, s.x - pl.x) : 0;
    const iy = s.y - ((e.D && e.D.r) || 8) * (e.sc || 1) * 0.85, n = crit ? 8 : 5, k = sparkLineTex(this);
    for (let i = 0; i < n; i++) {
      const ag = baseA + (Math.random() - 0.5) * 1.45, sp = (crit ? 26 : 18) + Math.random() * 18;
      const ln = this.add.image(s.x, iy, k).setDepth(s.y + 39).setBlendMode(Phaser.BlendModes.ADD)
        .setRotation(ag).setTint(crit ? 0xffe66b : 0xfff4dc).setScale(0.75 + Math.random() * 0.5, 0.85);
      this.tweens.add({
        targets: ln, x: s.x + Math.cos(ag) * sp, y: iy + Math.sin(ag) * sp,
        scaleX: 0.2, alpha: 0, duration: 140 + Math.random() * 70, ease: 'Quad.easeOut', onComplete: () => ln.destroy()
      });
    }
  };

  const _cast = W.castSpell, _nova = W.nova;
  if (_cast) W.castSpell = function () {
    this._inSpellCast = true;
    try { return _cast.apply(this, arguments); } finally { this._inSpellCast = false; }
  };
  if (_nova) W.nova = function () {
    this._inSpellCast = true;
    try { return _nova.apply(this, arguments); } finally { this._inSpellCast = false; }
  };

  const _hitEnemy = W.hitEnemy;
  if (_hitEnemy) W.hitEnemy = function (e, base, crit, nx, ny) {
    const poi = (e && e.poiStk) || 0;
    if (poi > 0 && !crit && !this._inDetonate && Math.random() < Math.min(0.3, 0.12 + poi * 0.03)) {
      crit = true;
      if (this.jx && e.spr) this.jx('spark', e.spr.x, e.spr.y - 10, 4, { tint: 0xd88aff });
    }
    const fromSpell = this._inSpellCast || this._inDetonate || (this._curShot && this._curShot.kind === 'fire');
    const r = _hitEnemy.call(this, e, base, crit, nx, ny);
    if (!e || !e.spr) return r;
    const pl = this.pl;
    if (!fromSpell && pl && !pl.dead && this.t - (this._mpHitT || -9) >= 0.16) {
      this._mpHitT = this.t;
      const st = stat(), add = Math.min(crit ? 2 : 1, Math.max(0, st.maxmp - S.mp));
      if (add > 0) {
        S.mp += add;
        updHud();
        flyMote(this, e.spr.x, e.spr.y - 10, pl);
        if (this.t - (this._mpPopT || -9) >= 0.45) {
          this._mpPopT = this.t;
          popWorld(pl.x, pl.y - 26, '+' + add + ' MP', 'mpgain');
        }
      }
    }
    if (e.hp > 0 && !fromSpell && pl && this.bleedEnemy) {
      const isFin = pl.combo === 3 || pl.combo === 5;
      if (crit || isFin) {
        this.bleedEnemy(e, Math.max(2, Math.round(stat().atk * 0.2)), 4.5, 1);
        dropBlood(this, e.spr.x, e.spr.y - 1, 1);
      }
    }
    return r;
  };

  const _spin = W.spin;
  if (_spin) W.spin = function (holdDur) {
    const r = _spin.call(this, holdDur), pl = this.pl, tt = typeof tierOf === 'function' ? tierOf('spin') : 1;
    const hMul = Math.min(1.4, 1 + Math.max(0, (holdDur || 0.5) - 0.45) * 0.6), rad = (30 + tt * 8) * hMul;
    this.time.delayedCall(85, () => {
      if (!this.pl || this.pl.dead || this.trans) return;
      let boom = false;
      for (const e of this.enemies || []) {
        if (e.hp <= 0 || !e.spr || !e.spr.active || !(e.bleedStk > 0)) continue;
        const dx = e.spr.x - pl.x, dy = e.spr.y - pl.y, d = Math.hypot(dx, dy) || 1;
        if (d > rad + (e.D?.r || 8) * (e.sc || 1)) continue;
        const stk = e.bleedStk;
        e.bleedStk = 0; e.bleed = 0; boom = true;
        const burst = Math.max(4, Math.round(stat().atk * (0.28 * stk)));
        this._inDetonate = true;
        try { this.hitEnemy(e, burst, true, dx / d, dy / d); } finally { this._inDetonate = false; }
        if (e.spr && e.spr.active) {
          popWorld(e.spr.x, e.spr.y - e.spr.displayHeight - 16, 'LED. DARAH x' + stk + '!', 'crit');
          dropBlood(this, e.spr.x, e.spr.y - 1, 2);
          if (!OPT.lite) {
            const rg = this.add.image(e.spr.x, e.spr.y - 10, dualArcTex(this))
              .setTint(0xff4252).setBlendMode(Phaser.BlendModes.ADD).setScale(0.35).setDepth(e.spr.y + 42);
            this.tweens.add({ targets: rg, scale: 1.4, alpha: 0, duration: 220, onComplete: () => rg.destroy() });
          }
        }
      }
      if (boom) this.cameras.main.shake(110, 0.005);
    });
    return r;
  };

  W.spawnMiasma = function (x, y, rad, mag, tier) {
    const ticks = 5, rHit = rad * 0.9, key = miasmaTex(this);
    const emit = () => {
      if (!this.scene || !this.scene.isActive() || !this.pl || this.trans) return;
      if (!OPT.lite) {
        for (let i = 0; i < 6; i++) {
          const ag = Math.random() * Math.PI * 2, dist = Math.random() * rHit * 0.72;
          const p = this.add.image(x + Math.cos(ag) * dist, y + Math.sin(ag) * dist * 0.7, key)
            .setDepth(y - 0.5).setAlpha(0.55).setScale(0.7 + Math.random() * 0.6);
          this.tweens.add({
            targets: p, y: p.y - 6, scale: p.scaleX * 1.25, alpha: 0, duration: 720,
            onComplete: () => p.destroy()
          });
        }
      }
      for (const e of this.enemies || []) {
        if (e.hp <= 0 || !e.spr || !e.spr.active) continue;
        const dx = e.spr.x - x, dy = e.spr.y - y, d = Math.hypot(dx, dy) || 1;
        if (d > rHit + (e.D?.r || 8) * (e.sc || 1)) continue;
        if (this.poisonEnemy) this.poisonEnemy(e, mag * (0.16 + 0.05 * tier), 4, 1);
        this._inDetonate = true;
        try { this.hitEnemy(e, Math.max(2, Math.round(mag * 0.22)), false, dx / d * 0.1, dy / d * 0.1); }
        finally { this._inDetonate = false; }
      }
    };
    emit();
    for (let i = 1; i < ticks; i++) this.time.delayedCall(i * 750, emit);
  };

  const _updShots = W.updShots;
  if (_updShots) W.updShots = function (dt, locked) {
    if (locked) return _updShots.call(this, dt, locked);
    const prev = [];
    for (const p of this.shots || []) {
      if (p.mine && (p.kind === 'fire' || p.kind === 'arrow')) prev.push(p);
    }
    const r = _updShots.call(this, dt, locked);
    this._curShot = null;
    if (OPT.lite) return r;
    const k = sparkLineTex(this);
    for (const p of prev) {
      if (p.dead && p.kind === 'fire') {
        const ex = this.add.circle(p.gx, p.gy - 9, 6, 0xff8830, 0.65).setBlendMode(Phaser.BlendModes.ADD).setDepth(p.gy + 8);
        this.tweens.add({ targets: ex, scale: 2.8, alpha: 0, duration: 180, onComplete: () => ex.destroy() });
        if (this.jx) this.jx('spark', p.gx, p.gy - 9, 6, { tint: 0xffb84a });
      } else if (!p.dead) {
        p._trT = (p._trT || 0) - dt;
        const iv = p.kind === 'fire' ? 0.04 : 0.035;
        if (p._trT <= 0) {
          p._trT = iv;
          const ag = Math.atan2(p.vy, p.vx);
          const tr = this.add.image(p.gx, p.gy - 9, k).setDepth(p.gy + 1).setBlendMode(Phaser.BlendModes.ADD)
            .setRotation(ag).setTint(p.kind === 'fire' ? 0xffa840 : 0xfff2c8)
            .setScale(p.kind === 'fire' ? 0.65 : 0.85, 0.7).setAlpha(0.75);
          this.tweens.add({ targets: tr, alpha: 0, scaleX: 0.2, duration: 120, onComplete: () => tr.destroy() });
        }
      }
    }
    return r;
  };
}
