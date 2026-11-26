'use strict';
// Efek tempur & kejelasan Fase 1 ala Dimraeth: panah arah kaki 360°, debu langkah, impact ring, flash 2-tahap, bintang pusing, & notif cooldown.
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
  const footArrowTex = sc => ensureTex(sc, 'vfx_foot_arrow', 16, 16, g => {
    g.fillStyle(0x141820, 0.9);
    g.fillTriangle(15, 8, 5, 2, 8, 8);
    g.fillTriangle(15, 8, 5, 14, 8, 8);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(14, 8, 6, 3.5, 9, 8);
    g.fillTriangle(14, 8, 6, 12.5, 9, 8);
  });
  const dustPuffTex = sc => ensureTex(sc, 'vfx_dust_puff', 8, 8, g => {
    g.fillStyle(0xe8d9b8, 0.72);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xfff4dc, 0.45);
    g.fillCircle(3.5, 3.5, 1.5);
  });
  const impactRingTex = sc => ensureTex(sc, 'vfx_impact_ring', 32, 32, g => {
    g.lineStyle(2, 0xffffff, 1);
    g.strokeCircle(16, 16, 13);
  });
  const stunStarTex = sc => ensureTex(sc, 'vfx_stun_star', 8, 8, g => {
    g.fillStyle(0x2a1a06, 0.9);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xffe66b, 1);
    g.fillRect(3, 1, 2, 6);
    g.fillRect(1, 3, 6, 2);
  });

  const spawnDust = (sc, x, y, n) => {
    if (OPT.lite || !sc || !sc.add) return;
    const key = dustPuffTex(sc);
    for (let i = 0; i < n; i++) {
      const ox = (Math.random() - 0.5) * 10, oy = (Math.random() - 0.5) * 4;
      const p = sc.add.image(x + ox, y + oy, key).setDepth(y - 0.3).setAlpha(0.75)
        .setScale(0.65 + Math.random() * 0.45);
      sc.tweens.add({
        targets: p,
        x: p.x + (Math.random() - 0.5) * 12,
        y: p.y - 4 - Math.random() * 5,
        scale: 1.45,
        alpha: 0,
        duration: 260,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  };

  const popCd = (sc, pl) => {
    if (!pl || pl.dead || G.lock) return;
    if (sc.t - (sc._cdPopT || 0) <= 0.45) return;
    sc._cdPopT = sc.t;
    popWorld(pl.x, pl.y - 6, 'Cooldown!', 'cd');
  };

  const _up = W.update;
  if (_up) W.update = function (t, dl) {
    _up.call(this, t, dl);
    const pl = this.pl;
    if (this.passive || G.title || !pl || pl.dead || this.trans) {
      if (this._footArrow && this._footArrow.scene) this._footArrow.setVisible(false);
      return;
    }
    if (!this._footArrow || !this._footArrow.scene) {
      this._footArrow = this.add.image(pl.x, pl.y, footArrowTex(this)).setOrigin(0.5);
    }
    if (G.lock > 0 || UIH || pl.ghost) {
      this._footArrow.setVisible(false);
      return;
    }
    let targAng;
    const v = typeof Input !== 'undefined' ? Input.vec() : { x: 0, y: 0 };
    const m = Math.hypot(v.x, v.y);
    if (typeof Input !== 'undefined' && Input.aim && Input.aim.on && Input.aim.drag && Input.aim.ang != null) {
      targAng = Input.aim.ang;
    } else if (m > 0.15) {
      targAng = Math.atan2(v.y, v.x);
    } else {
      const dv = (typeof DIRV !== 'undefined' && DIRV[pl.dir]) || [0, 1];
      targAng = Math.atan2(dv[1], dv[0]);
    }
    if (this._footAng == null) this._footAng = targAng;
    const dt = Math.min(dl || 16, 50) / 1000;
    const diff = Math.atan2(Math.sin(targAng - this._footAng), Math.cos(targAng - this._footAng));
    this._footAng += diff * Math.min(1, dt * 18);
    const a = this._footAng;
    this._footArrow.setVisible(true)
      .setPosition(pl.x + Math.cos(a) * 14, pl.y - 3 + Math.sin(a) * 9)
      .setRotation(a).setDepth(pl.y - 0.2).setAlpha(0.85);

    if (!OPT.lite && !pl.swim && pl.body) {
      const spd = Math.hypot(pl.body.velocity.x, pl.body.velocity.y);
      if (spd > 75) {
        this._dustT = (this._dustT || 0) - dt;
        if (this._dustT <= 0) {
          this._dustT = 0.14;
          spawnDust(this, pl.x, pl.y - 1, 2);
        }
      } else {
        this._dustT = 0;
      }
    }
  };

  const _dash = W.dash;
  if (_dash) W.dash = function () {
    const pl = this.pl, wasDash = pl ? pl.dashT : 0;
    if (pl && typeof learned === 'function' && learned('dash') && (this.dashCd > 0 || pl.dashT > 0)) {
      popCd(this, pl);
    }
    const r = _dash.apply(this, arguments);
    if (pl && pl.dashT > 0 && wasDash <= 0) spawnDust(this, pl.x, pl.y - 1, 5);
    return r;
  };

  const _spin = W.spin;
  if (_spin) W.spin = function (holdDur) {
    const r = _spin.call(this, holdDur), pl = this.pl;
    if (pl && !pl.dead && !OPT.lite) {
      spawnDust(this, pl.x, pl.y - 1, 5);
      const [dx, dy] = (typeof DIRV !== 'undefined' && DIRV[pl.dir]) || [1, 0];
      this.time.delayedCall(70, () => {
        if (!this.pl || this.pl.dead) return;
        const ring = this.add.image(pl.x + dx * 18, pl.y - 14 + dy * 10, impactRingTex(this))
          .setDepth(pl.y + 49).setBlendMode(Phaser.BlendModes.ADD)
          .setTint(0xffe66b).setScale(0.35).setAlpha(0.95);
        this.tweens.add({
          targets: ring, scale: 1.7, alpha: 0, duration: 190, ease: 'Cubic.easeOut',
          onComplete: () => ring.destroy()
        });
      });
    }
    return r;
  };

  const _hitFx = W.hitFx;
  if (_hitFx) W.hitFx = function (e, crit) {
    _hitFx.call(this, e, crit);
    const s = e && e.spr;
    if (OPT.lite || !s || !s.active) return;
    const pl = this.pl, fin = ((((pl && pl.combo) || 1) - 1) % 5) === 4;
    if (!crit && !fin) return;
    const iy = s.y - ((e.D && e.D.r) || 8) * (e.sc || 1) * 0.85;
    const ring = this.add.image(s.x, iy, impactRingTex(this)).setDepth(s.y + 38)
      .setBlendMode(Phaser.BlendModes.ADD).setTint(crit ? 0xffe478 : 0xffffff)
      .setScale(0.25).setAlpha(0.95);
    this.tweens.add({
      targets: ring, scale: crit ? 1.55 : 1.2, alpha: 0, duration: 170, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });
  };

  const _hitEnemy = W.hitEnemy;
  if (_hitEnemy) W.hitEnemy = function (e, base, crit, nx, ny) {
    const prevStg = (e && e.staggerT) || 0;
    const r = _hitEnemy.call(this, e, base, crit, nx, ny);
    if (!e || e.hp <= 0 || !e.spr || !e.spr.active) return r;
    const s = e.spr, newStg = (e.staggerT || 0) > 0 && prevStg <= 0;
    if (crit || newStg) {
      this.time.delayedCall(70, () => {
        if (!s.active || e.hp <= 0) return;
        s.setTintFill(0xff3838);
        e.flash = Math.max(e.flash || 0, 0.08);
        this.time.delayedCall(75, () => { if (s.active && e.hp > 0) s.clearTint(); });
      });
    }
    if (newStg && !OPT.lite) {
      const k = stunStarTex(this), stars = [0, 1, 2].map(() => this.add.image(s.x, s.y, k).setDepth(s.y + 45));
      const o = { a: 0 }, dur = Math.round((e.staggerT || 0.8) * 1000);
      this.tweens.add({
        targets: o, a: Math.PI * 4, duration: dur, ease: 'Linear',
        onUpdate: () => {
          if (!s.active || e.hp <= 0) { stars.forEach(st => st.active && st.destroy()); return; }
          const cy = s.y - s.displayHeight - 6;
          stars.forEach((st, i) => {
            if (!st.active) return;
            const ag = o.a + i * (Math.PI * 2 / 3);
            st.setPosition(s.x + Math.cos(ag) * 9, cy + Math.sin(ag) * 3.5).setDepth(s.y + 45);
          });
        },
        onComplete: () => stars.forEach(st => st.active && st.destroy())
      });
    }
    return r;
  };

  const _magic = W.magic;
  if (_magic) W.magic = function () {
    if (this.pl && this.pl.atkCd > 0) popCd(this, this.pl);
    return _magic.apply(this, arguments);
  };

  const _nova = W.nova;
  if (_nova) W.nova = function () {
    if (this.pl && this.pl.atkCd > 0 && typeof learned === 'function' && learned('nova')) popCd(this, this.pl);
    return _nova.apply(this, arguments);
  };

  const _killEnemy = W.killEnemy;
  if (_killEnemy) W.killEnemy = function (e) {
    const wasAlive = e && e.hp > 0;
    const r = _killEnemy.call(this, e);
    const foe = e && (e.elite || e.boss) && !(e.D && e.D.isBounty);
    if (wasAlive && e.hp <= 0 && !e.reanimating && foe && typeof banner === 'function') {
      const nm = e.D && e.D.name ? e.D.name.toUpperCase() : 'ELIT';
      banner('MUSUH TANGGUH TUMBANG', nm, 'foe', 2400);
    }
    return r;
  };
}
