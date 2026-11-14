'use strict';
// Rasa tempur ala Dimraeth: bidik bantu, langkah maju saat menebas, busur tebasan, kilat & percikan saat kena, debu berguling.
// HANYA efek & rasa. Angka damage/stamina tetap di combat.js & souls.js (file terkunci, JANGAN diubah).
const CFX = { aim: 64, lunge: 120, lungeT: .07, arcT: 170 };
const ARC_TINT = { csword: 0x8ae8ff, ssword: 0xd8e4ff, leg_moon: 0xc8b8ff };
function arcTint(wt) {
  return ARC_TINT[S.eq.wpn] || (wt === 'axe' ? 0xffc27a : 0xfff1c4);
}

Object.assign(World.prototype, {
  arcTex() { // bulan sabit putih bergradasi (diwarnai dengan setTint)
    if (this.textures.exists('arcfx')) return 'arcfx';
    const [c, x] = mk(72, 72), cx = 36, cy = 36;
    for (let i = 0; i < 6; i++) {
      x.globalAlpha = .18 + i * .14;
      x.fillStyle = '#ffffff';
      x.beginPath();
      x.arc(cx, cy, 33 - i, -1.25, 1.25);
      x.arc(cx - 9 + i * 1.2, cy, 26 - i * .6, 1.15, -1.15, true);
      x.closePath();
      x.fill();
    }
    x.globalAlpha = 1;
    this.textures.addCanvas('arcfx', c);
    return 'arcfx';
  },

  slashFx(wt, combo) {
    const pl = this.pl, [dx, dy] = DIRV[pl.dir], ang = Math.atan2(dy, dx), fin = combo === 3;
    if (wt === 'spear') { // tusukan: garis cahaya lurus
      const tipX = pl.x + dx * 28, tipY = pl.y - 9 + dy * 22;
      const g = this.add.image(pl.x + dx * 18, pl.y - 9 + dy * 14, this.arcTex())
        .setRotation(ang).setScale(1.5, .35).setTint(arcTint(wt));
      g.setDepth(pl.y + (dy < 0 ? -2 : 4)).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: g, alpha: 0, scaleX: 1.9, duration: CFX.arcT, onComplete: () => g.destroy() });
      // Cincin debu di ujung tusukan (T313)
      this.puff(tipX, tipY);
      const ring = this.add.ellipse(tipX, tipY, 14, 8, 0xffffff, 0.4).setDepth(tipY - 1);
      this.tweens.add({ targets: ring, scaleX: 1.8, scaleY: 1.8, alpha: 0, duration: 150, onComplete: () => ring.destroy() });
      return;
    }
    const s = (wt === 'axe' ? 1.25 : 1) * (fin ? 1.35 : combo === 2 ? 1.1 : 1);
    const tint = arcTint(wt), flipY = combo === 2, depth = pl.y + (dy < 0 ? -2 : 4);
    const ox = pl.x + dx * 10, oy = pl.y - 9 + dy * 8;
    const a = this.add.image(ox, oy, this.arcTex()).setRotation(ang).setScale(s * .75).setTint(tint);
    a.setFlipY(flipY).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    if (fin && !OPT.lite && a.preFX && this.renderer?.type === Phaser.WEBGL) {
      try { a.preFX.addGlow(tint, 2, 0, false, 0.1, 8); } catch (_) {}
    }
    this.tweens.add({
      targets: a, alpha: 0, scale: s, duration: CFX.arcT + (fin ? 60 : 0),
      ease: 'Cubic.easeOut', onComplete: () => a.destroy()
    });
    // 2 salinan busur mengekor (T312)
    [{ delay: 25, a: 0.5, rOff: -0.12 }, { delay: 50, a: 0.25, rOff: -0.24 }].forEach(trail => {
      this.time.delayedCall(trail.delay, () => {
        if (!this.pl || this.pl.dead) return;
        const tRot = ang + trail.rOff * (flipY ? -1 : 1);
        const ghost = this.add.image(ox, oy, this.arcTex()).setRotation(tRot).setScale(s * .68).setTint(tint).setAlpha(trail.a);
        ghost.setFlipY(flipY).setDepth(depth - 0.1).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: ghost, alpha: 0, scale: s * 0.95, duration: Math.max(40, CFX.arcT - trail.delay + 20),
          ease: 'Cubic.easeOut', onComplete: () => ghost.destroy()
        });
      });
    });
    // 3 percikan kecil di ujung busur (T312)
    const tipX = ox + Math.cos(ang) * (24 * s), tipY = oy + Math.sin(ang) * (24 * s);
    if (this.sparkle) this.sparkle(tipX, tipY, 'spark', 3);
    if (fin) {
      this.cameras.main.shake(70, .003);
      if (!OPT.lite) {
        const flash = this.add.rectangle(0, 0, VW, VH, 0xffffff, 0.25)
          .setOrigin(0, 0).setScrollFactor(0).setDepth(9999).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: flash, alpha: 0, duration: 80, onComplete: () => flash.destroy() });
      }
      const radial = this.add.graphics().setDepth(depth + 1);
      radial.lineStyle(1.5, 0xffffff, 0.9);
      for (let i = 0; i < 6; i++) {
        const rAng = (i / 6) * Math.PI * 2 + ang, rIn = 6, rOut = 18;
        radial.lineBetween(tipX + Math.cos(rAng) * rIn, tipY + Math.sin(rAng) * rIn, tipX + Math.cos(rAng) * rOut, tipY + Math.sin(rAng) * rOut);
      }
      this.tweens.add({ targets: radial, alpha: 0, scale: 1.3, duration: 120, ease: 'Quad.easeOut', onComplete: () => radial.destroy() });
    }
    if (wt === 'axe' && fin) {
      const gx = ox + dx * 14, gy = oy + dy * 10;
      const crack = this.add.graphics().setDepth(gy - 2);
      crack.lineStyle(2, 0x5a3418, 0.9);
      crack.beginPath();
      crack.moveTo(gx - dx * 8, gy - dy * 8); crack.lineTo(gx, gy);
      crack.lineTo(gx + dx * 12 + dy * 8, gy + dy * 12 - dx * 8);
      crack.moveTo(gx, gy); crack.lineTo(gx + dx * 14 - dy * 8, gy + dy * 14 + dx * 8);
      crack.strokePath();
      this.tweens.add({ targets: crack, alpha: 0, duration: 600, ease: 'Quad.easeIn', onComplete: () => crack.destroy() });
      sfxAt('boom', gx, gy, this);
    }
  },

  nearFoe(r) {
    let best = null, bd = r;
    for (const e of this.enemies) {
      if (e.hp <= 0 || !e.spr.active) continue;
      const d = Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  },

  hitFx(e, crit) {
    const s = e.spr;
    if (!s || !s.active) return;
    const keep = s.isTinted ? s.tintTopLeft : null;
    s.setTintFill(0xffffff);
    this.time.delayedCall(55, () => {
      if (!s.active) return;
      if (keep !== null && keep !== 0xffffff) s.setTint(keep);
      else s.clearTint();
    });
    const y = s.y - (e.D.r || 8) * (e.sc || 1);
    const ring = this.add.image(s.x, y, this.arcTex())
      .setScale(.25).setTint(crit ? 0xffd25a : 0xffffff)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(s.y + 6);
    ring.setRotation(Math.random() * 6.28);
    this.tweens.add({
      targets: ring, scale: crit ? .8 : .55, alpha: 0, duration: 140,
      onComplete: () => ring.destroy()
    });
    // Percikan kena sesuai bahan musuh (T324)
    const t = e.type || '', tex = e.D?.tex || '';
    if (t.includes('slime') || tex.includes('slime')) {
      const col = t.includes('gold') ? 'doto' : 'dotg';
      this.sparkle(s.x, y, col, crit ? 10 : 5);
    } else if (t.includes('golem') || t.includes('mimic') || tex.includes('golem')) {
      this.sparkle(s.x, y, 'spark', crit ? 12 : 7);
      this.sparkle(s.x, y, 'dot', crit ? 6 : 3);
    } else if (t.includes('skel') || t.includes('ghost') || t.includes('witch') || tex.includes('skel')) {
      this.sparkle(s.x, y, 'doto', crit ? 8 : 4);
    } else {
      this.sparkle(s.x, y, 'spark', crit ? 8 : 4);
    }
    if (crit) this.cameras.main.shake(60, .0025);
  },

  rollFx() {
    const pl = this.pl;
    this.sparkle(pl.x, pl.y - 2, 'dot', 5);
  },

  updLowHp(dt) {
    if (!this.lowHpG || !this.lowHpG.active) {
      this.lowHpG = this.add.graphics().setScrollFactor(0).setDepth(2.5e5);
    }
    const maxhp = (typeof stat === 'function') ? stat().maxhp : 100;
    if (S.hp < maxhp * .3 && S.hp > 0) {
      this.lowHpG.setVisible(true);
      this.lowHpG.clear();
      const alpha = Math.max(0.05, .25 + .2 * Math.sin(this.t * 6));
      this.lowHpG.fillStyle(0xcc1122, alpha);
      const b = 14;
      this.lowHpG.fillRect(0, 0, VW, b);
      this.lowHpG.fillRect(0, VH - b, VW, b);
      this.lowHpG.fillRect(0, b, b, VH - b * 2);
      this.lowHpG.fillRect(VW - b, b, b, VH - b * 2);
    } else {
      this.lowHpG.setVisible(false);
    }
  }
});

{
  const W = World.prototype;
  const attack0 = W.attack;
  W.attack = function () {
    const pl = this.pl;
    if (!pl || pl.dead || pl.atkCd > 0) return attack0.apply(this, arguments);

    const e = this.nearFoe(CFX.aim), v = Input.vec();
    if (e) {
      const ex = e.spr.x - pl.x, ey = e.spr.y - pl.y;
      const face = Math.abs(ex) > Math.abs(ey) ? (ex < 0 ? 'left' : 'right') : (ey < 0 ? 'up' : 'down');
      if (Math.hypot(v.x, v.y) < .3 || ex * v.x + ey * v.y > 0) pl.dir = face;
    }

    const r = attack0.apply(this, arguments);
    if (!(pl.atkCd > 0)) return r;

    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword';
    if (wt !== 'bow') {
      this.slashFx(wt, pl.combo || 1);
      if (!pl.dashT || pl.dashT <= 0) {
        const [dx, dy] = DIRV[pl.dir];
        pl.dashT = CFX.lungeT;
        pl.dvx = dx * CFX.lunge;
        pl.dvy = dy * CFX.lunge;
        this.ghostT = CFX.lungeT + .05;
      }
    }
    return r;
  };

  const hit0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit) {
    const r = hit0.apply(this, arguments);
    this.hitFx(e, crit);
    return r;
  };

  const dash0 = W.dash;
  W.dash = function () {
    const pl = this.pl, was = pl && pl.dashT > 0, r = dash0.apply(this, arguments);
    if (pl && !was && pl.dashT > .1) this.rollFx();
    return r;
  };

  const sta0 = W.updStamina;
  W.updStamina = function (dt, sprint, moving) {
    if (sprint && moving && this.pl) {
      this.runDustT = (this.runDustT || 0) - dt;
      if (this.runDustT <= 0) {
        this.runDustT = .18;
        this.sparkle(this.pl.x, this.pl.y - 1, 'dot', 2);
      }
    }
    return sta0.apply(this, arguments);
  };

  const kill0 = W.killEnemy;
  W.killEnemy = function (e) {
    const s = e && e.spr, x = s && s.x, y = s && s.y;
    const r = kill0.apply(this, arguments);
    if (s) {
      const p = this.add.image(x, y - 8, this.arcTex()).setScale(.3).setTint(0xffffff).setAlpha(.8).setDepth(y + 6);
      this.tweens.add({ targets: p, scale: 1, alpha: 0, angle: 180, duration: 260, onComplete: () => p.destroy() });
    }
    return r;
  };

  const hurt0 = W.hurtPlayer;
  W.hurtPlayer = function (atk, sx, sy, fx) {
    const pl = this.pl, prevParries = S?.parries || 0, hp0 = S.hp;
    const r = hurt0.apply(this, arguments);
    if ((S?.parries || 0) > prevParries && pl) {
      const bx = (pl.x + (sx || pl.x)) / 2, by = (pl.y + (sy || pl.y)) / 2;
      this.hitStop(.12, 50);
      const ring = this.add.graphics().setDepth(pl.y + 6);
      const ro = { r: 6 };
      this.tweens.add({
        targets: ro, r: 48, duration: 240, ease: 'Quad.easeOut',
        onUpdate: () => {
          ring.clear(); ring.lineStyle(3, 0xffe066, 1 - ro.r / 48).strokeCircle(bx, by, ro.r);
        },
        onComplete: () => ring.destroy()
      });
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.4, spd = rnd(60, 140);
        const p = this.add.rectangle(bx, by, 3, 3, 0xffea78).setDepth(pl.y + 7);
        this.physics.add.existing(p);
        p.body.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
        this.tweens.add({ targets: p, alpha: 0, scale: 0.2, duration: 180, onComplete: () => p.destroy() });
      }
      if (!OPT.lite) {
        const edge = this.add.graphics().setScrollFactor(0).setDepth(9998);
        edge.lineStyle(6, 0xffd700, 0.45).strokeRect(0, 0, VW, VH);
        this.tweens.add({ targets: edge, alpha: 0, duration: 140, onComplete: () => edge.destroy() });
      }
    }
    if (S.hp < hp0 && hp0 - S.hp >= stat().maxhp * .15 && navigator.vibrate) {
      try { navigator.vibrate(25); } catch (_) {}
    }
    return r;
  };

  const up0 = W.update;
  W.update = function (t, dl) {
    up0.call(this, t, dl);
    if (!this.passive && !G.title && this.pl) {
      this.updLowHp(dl / 1000);
      const v = typeof Input !== 'undefined' ? Input.vec() : { x: 0, y: 0 };
      const m = Math.hypot(v.x, v.y);
      let targetAngle = 0;
      if (m > 0.25 && !G.lock) {
        if (Math.abs(v.x) > 0.35 && Math.abs(v.y) > 0.35) {
          targetAngle = v.x > 0 ? (v.y > 0 ? 5 : -4) : (v.y > 0 ? -5 : 4);
        }
      }
      const cur = this.pl.angle || 0;
      this.pl.angle = cur + (targetAngle - cur) * Math.min(1, (dl / 1000) * 14);
    }
  };

  const shoot0 = W.shootArrow;
  W.shootArrow = function () {
    shoot0.apply(this, arguments);
    const arrow = this.shots[this.shots.length - 1];
    if (arrow && arrow.kind === 'arrow') {
      const origX = arrow.gx, origY = arrow.gy;
      this.time.addEvent({
        delay: 50, repeat: 8,
        callback: () => {
          if (arrow.s?.active && this.sparkle) this.sparkle(arrow.s.x, arrow.s.y, 'dot', 1);
        }
      });
    }
  };
}
