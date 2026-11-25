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
    const pl = this.pl, [dx, dy] = DIRV[pl.dir], ang = Math.atan2(dy, dx);
    const fin = (wt === 'sword' && (combo || 1) === 3) || (combo || 1) === 5;
    const cIdx = fin ? 2 : (((combo || 1) - 1) % 3);
    const sd = (pl.dir === 'left' || pl.dir === 'right') ? 'side' : pl.dir;
    // Transisi postur tubuh Arka (windup side1 -> lunge side2 -> follow-through side3 -> idle)
    pl.atkPose = cIdx === 1 ? '3' : '1';
    pl.setFrame(sd + pl.atkPose);
    this.time.delayedCall(35, () => { if (pl && !pl.dead && pl.atkT > 0) { pl.atkPose = '2'; pl.setFrame(sd + '2'); } });
    this.time.delayedCall(125, () => { if (pl && !pl.dead && pl.atkT > 0) { pl.atkPose = '3'; pl.setFrame(sd + '3'); } });
    this.time.delayedCall(195, () => { if (pl) pl.atkPose = null; });

    // Titik genggam tangan Arka (terkunci di telapak tangan, bukan melayang)
    /* titik genggam = telapak tangan pada frame tebas (heroHand, systems/sword_hand.js); pedang lalu mengikuti tangan tiap frame (swordToHand) */
    const H = this.heroHand ? this.heroHand(pl, 2) : null;
    const hx = H ? H.x : pl.x + dx * 5, hy = H ? H.y : pl.y - 7 + dy * 4, depth = pl.y + (dy < 0 ? -2 : 4);
    this.swingSword(wt, cIdx, fin, ang, dx, dy, hx, hy);

    // Jejak sapuan fisik bilah pedang (vfx_swing_combo): hanya jejak udara yang dibelah pedang, tanpa ledakan semu di ruang kosong
    const drawnArc = typeof HERO_SWD !== 'undefined' && HERO_SWD && sd === 'side' && wt === 'sword'; /* smear sudah ada di sprite */
    if (drawnArc) { /* tanpa jejak tambahan */ } else if (this.textures.exists('vfx_swing_combo')) {
      const sRow = wt === 'spear' ? 3 : (fin ? 4 : cIdx);
      /* jejak baru muncul saat bilah mulai mengayun (setelah ancang-ancang), bukan saat pedang baru terangkat */
      this.time.delayedCall(45 * (fin ? 1.45 : 1) * (wt === 'axe' ? 1.6 : 1), () => {
        if (!this.pl || this.pl.dead) return;
        const vfx = this.add.sprite(hx, hy, 'vfx_swing_combo', sRow * 4 + 1)
          .setOrigin(14 / 48, 18 / 36).setRotation(ang).setFlipY(dx < 0)
          .setScale(wt === 'axe' ? 1.2 : 1).setDepth(depth + 1);
        if (ARC_TINT[S.eq.wpn]) vfx.setTint(ARC_TINT[S.eq.wpn]);
        vfx.play('vfx_swing_' + sRow);
        vfx.once('animationcomplete', () => vfx.destroy());
      });
    } else {
      const s = (wt === 'axe' ? 1.25 : 1) * (fin ? 1.35 : 1);
      const a = this.add.image(hx + dx * 4, hy + dy * 3, this.arcTex()).setRotation(ang).setScale(s * .7).setTint(arcTint(wt));
      a.setFlipY(cIdx === 1).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: a, alpha: 0, scale: s, duration: CFX.arcT, ease: 'Cubic.easeOut', onComplete: () => a.destroy() });
    }

    if (fin) {
      this.cameras.main.shake(70, .003);
      if (wt === 'axe') {
        const gx = hx + dx * 12, gy = hy + dy * 10, crack = this.add.graphics().setDepth(gy - 2);
        crack.lineStyle(2, 0x5a3418, 0.9).beginPath();
        crack.moveTo(gx - dx * 8, gy - dy * 8); crack.lineTo(gx, gy);
        crack.lineTo(gx + dx * 12 + dy * 8, gy + dy * 12 - dx * 8); crack.strokePath();
        this.tweens.add({ targets: crack, alpha: 0, duration: 600, ease: 'Quad.easeIn', onComplete: () => crack.destroy() });
        sfxAt('boom', gx, gy, this);
      }
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
    this.time.delayedCall(65, () => {
      if (!s.active || e.hp <= 0) return; /* mati: tetap putih sampai pudar */
      if (keep !== null && keep !== 0xffffff) s.setTint(keep);
      else s.clearTint();
    });
    const y = s.y - (e.D.r || 8) * (e.sc || 1);
    const pl = this.pl, cIdx = (((pl && pl.combo) || 1) - 1) % 5, fin = cIdx === 4 || crit;
    // T548: Hit-stop freeze frame 48ms (Cobo #13) saat serangan berat / kombo penutup / kritikal
    if (fin && !this._hitStopping) {
      this._hitStopping = true;
      const prevT = this.time.timeScale, prevP = this.physics.world.timeScale;
      this.time.timeScale = 0.05; this.physics.world.timeScale = 0.05;
      setTimeout(() => {
        this._hitStopping = false;
        if (this.time) { this.time.timeScale = prevT || 1; this.physics.world.timeScale = prevP || 1; }
      }, 48);
    }
    const hitAng = pl ? Math.atan2(y - (pl.y - 7), s.x - pl.x) : 0;
    const sgn = Math.cos(hitAng) < 0 ? -1 : 1;
    const vecOff = [0.42 * sgn, -0.58 * sgn, 0.07 * sgn, 0, 0.31 * sgn][cIdx] || 0;

    // Semburan benturan organik (vfx_hit_impact): HANYA meledak di titik kontak tubuh musuh sesuai vektor sabetan pedang!
    if (this.textures.exists('vfx_hit_impact')) {
      const imp = this.add.sprite(s.x, y, 'vfx_hit_impact', fin ? 6 : 1)
        .setOrigin(12 / 48, 18 / 36).setRotation(hitAng + vecOff)
        .setDepth(s.y + 6);
      if (crit && !fin) imp.setTint(0xfff2a8);
      imp.play(fin ? 'vfx_hit_1' : 'vfx_hit_0');
      imp.once('animationcomplete', () => imp.destroy());
    } else {
      const ring = this.add.image(s.x, y, this.arcTex())
        .setScale(.25).setTint(crit ? 0xffd25a : 0xffffff)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(s.y + 6);
      ring.setRotation(hitAng + vecOff);
      this.tweens.add({ targets: ring, scale: crit ? .8 : .55, alpha: 0, duration: 140, onComplete: () => ring.destroy() });
    }
    if (crit || fin) this.cameras.main.shake(65, .0028);
    else this.cameras.main.shake(35, .0011); /* sentak halus di tiap pukulan */
  },

  updChargeFx(holdT) {
    const pl = this.pl; if (!pl || pl.dead) return;
    const [dx, dy] = DIRV[pl.dir], ang = Math.atan2(dy, dx), sgn = dx < 0 ? -1 : 1;
    const sd = (pl.dir === 'left' || pl.dir === 'right') ? 'side' : pl.dir;
    pl.anims.stop(); pl.atkPose = '1'; pl.setFrame(sd + '1');
    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword', tier = { wsword: 0 }[S.eq.wpn] ?? 1;
    const sw = this.sword.setTexture(wt === 'spear' ? 'wspear' : wt === 'axe' ? 'waxe' : 'sword' + tier);
    sw._hold = 0; sw._shT = 0; sw._off = null; sw.setAlpha(1); /* pose jurus mengambil alih dari siaga */
    sw.setVisible(true).setPosition(pl.x - dx * 3, pl.y - 7).setFlipY(dx < 0).setDepth(pl.y + 2).setRotation(ang + 2.55 * sgn);
    if (holdT >= .45) sw.setTintFill(0xffffff); else sw.clearTint();
    if (this.textures.exists('vfx_charge_spin')) {
      if (!this.chgWind || !this.chgWind.active) this.chgWind = this.add.sprite(pl.x, pl.y, 'vfx_charge_spin', 0).setOrigin(.5, 32 / 48);
      const fIdx = holdT < .32 ? 0 : (holdT < .62 ? 1 : 2), wide = 1 + Math.min(.55, Math.max(0, holdT - .45) * .65);
      this.chgWind.setPosition(pl.x, pl.y + 1).setFrame(fIdx).setScale(wide, 1).setDepth(pl.y - .2);
    }
  },
  clearChargeFx() {
    if (this.chgWind) { this.chgWind.destroy(); this.chgWind = null; }
    const sw = this.sword, held = sw && (sw._off || sw._hold || sw._shT); /* ayun/siaga/sarung: dikelola sword_hand.js */
    if (sw && !held && (!this.pl || this.pl.atkT <= 0)) { sw.clearTint(); sw.setVisible(false); }
    if (this.pl) this.pl.atkPose = null;
  },
  spinFx(tt, hMul = 1) {
    const pl = this.pl; if (!pl || pl.dead) return;
    const [dx, dy] = DIRV[pl.dir], ang = Math.atan2(dy, dx), sgn = dx < 0 ? -1 : 1;
    const sd = (pl.dir === 'left' || pl.dir === 'right') ? 'side' : pl.dir, f0 = pl.flipX;
    pl.atkPose = '2'; pl.setFrame(sd + '2');
    this.time.delayedCall(75, () => { if (pl && !pl.dead) { pl.flipX = !f0; pl.setFrame(sd + '2'); } });
    this.time.delayedCall(175, () => { if (pl && !pl.dead) { pl.flipX = f0; pl.atkPose = '3'; pl.setFrame(sd + '3'); } });
    this.time.delayedCall(280, () => { if (pl) { pl.flipX = pl.dir === 'left'; pl.atkPose = null; } });
    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword', tier = { wsword: 0 }[S.eq.wpn] ?? 1;
    const sw = this.sword.setTexture(wt === 'spear' ? 'wspear' : wt === 'axe' ? 'waxe' : 'sword' + tier);
    sw._hold = 0; sw._shT = 0; sw._off = null; sw.setAlpha(1);
    sw.clearTint().setVisible(true).setPosition(pl.x, pl.y - 7).setFlipY(dx < 0).setDepth(pl.y + 4).setRotation(ang - 2.6 * sgn);
    this.tweens.add({ targets: sw, rotation: ang + 3.8 * sgn, duration: 240, ease: 'Cubic.easeOut', onComplete: () => sw.setVisible(false) });
    if (this.textures.exists('vfx_charge_spin')) {
      const sp = this.add.sprite(pl.x, pl.y - 7, 'vfx_charge_spin', 3)
        .setOrigin(.5, .5).setFlipX(dx < 0).setScale((1 + (tt - 1) * .12) * hMul).setDepth(pl.y + 3);
      if (ARC_TINT[S.eq.wpn]) sp.setTint(ARC_TINT[S.eq.wpn]);
      sp.play('vfx_charge_release'); sp.once('animationcomplete', () => sp.destroy());
    }
    this.cameras.main.shake(90, .0035);
  },

  enemyWindFx(e, isWolf, isGob) {
    const s = e.spr, D = e.D; if (!s || !s.active) return;
    s.setVelocity(-e.lx * 16, -e.ly * 16);
    if (isWolf && s.anims) { e.atkAnim = D.tex + (Math.random() < .5 ? '_bite' : '_pounce'); s.anims.stop(); s.setFrame(22); }
    else if (isGob && s.anims) { e.atkAnim = D.tex + (Math.random() < .65 ? '_slash' : '_bite'); s.anims.stop(); s.setFrame(41); }
    else s.setTint(0xffa07a);
  },
  enemySlashFx(e, isWolf, isGob) {
    const s = e.spr; if (!s || !s.active) return;
    if ((isWolf || isGob) && s.anims && e.atkAnim) s.play({ key: e.atkAnim, startFrame: 2 }, true);
    if (!this.textures.exists('vfx_swing_combo')) return;
    const ang = Math.atan2(e.ly || 0, e.lx || 1), sRow = isWolf ? 0 : (e.atkAnim?.endsWith('_bite') ? 1 : 0);
    const vfx = this.add.sprite(s.x + (e.lx || 0) * 6, s.y - 9 + (e.ly || 0) * 4, 'vfx_swing_combo', sRow * 4 + 1)
      .setOrigin(14 / 48, 18 / 36).setRotation(ang).setFlipY((e.lx || 0) < 0)
      .setScale(isWolf ? .95 : .88).setTint(isWolf ? 0xd8f0ff : 0xffe4d8).setDepth(s.y + 3);
    vfx.play('vfx_swing_' + sRow); vfx.once('animationcomplete', () => vfx.destroy());
  },
  enemySmashFx(e, step) {
    const s = e.spr; if (!s || !s.active) return;
    if (s.anims) { s.anims.stop(); s.setFrame(27); }
    const dir = s.flipX ? -1 : 1, ix = s.x + dir * 16, iy = s.y + 1;
    if (this.textures.exists('vfx_swing_combo')) {
      const sm = this.add.sprite(s.x + dir * 4, s.y - 16, 'vfx_swing_combo', 4 * 4 + 1)
        .setOrigin(14 / 48, 18 / 36).setFlipX(dir < 0).setScale(step === 3 ? 1.45 : 1.25).setTint(0xffe0a8).setDepth(s.y + 4);
      sm.play('vfx_swing_4'); sm.once('animationcomplete', () => sm.destroy());
    }
    if (this.textures.exists('vfx_charge_spin')) {
      const gw = this.add.sprite(ix, iy, 'vfx_charge_spin', step === 3 ? 2 : 1).setOrigin(.5, 32 / 48).setScale(step === 3 ? 1.25 : .95, 1).setDepth(s.y - .2);
      this.tweens.add({ targets: gw, scaleX: (step === 3 ? 1.55 : 1.2), alpha: 0, duration: 240, onComplete: () => gw.destroy() });
    }
  },
  enemyRingFx(x, y, tint, sc = .85) {
    if (!this.textures.exists('vfx_charge_spin')) return;
    const gw = this.add.sprite(x, y, 'vfx_charge_spin', 1).setOrigin(.5, 32 / 48).setScale(sc, sc * .55).setTint(tint).setDepth(y - .2);
    this.tweens.add({ targets: gw, scaleX: sc * 1.35, scaleY: sc * .75, alpha: 0, duration: 240, onComplete: () => gw.destroy() });
  },
  rollFx() {
    const pl = this.pl; if (!pl || pl.dead) return;
    this.sparkle(pl.x, pl.y - 2, 'dot', 5);
    pl.setTintFill(0xffffff);
    this.time.delayedCall(40, () => { if (pl && !pl.dead && !pl.flash) pl.clearTint(); });
    const [dx, dy] = DIRV[pl.dir] || [0, 1], px = pl.x, py = pl.y - 6, perpX = -dy, perpY = dx;
    const wg = this.add.graphics().setDepth(pl.y - 1).lineStyle(1.5, 0xe8f4ff, 0.85);
    [-7, -2.5, 2.5, 7].forEach(off => {
      const sx = px + perpX * off - dx * 4, sy = py + perpY * off - dy * 4;
      wg.lineBetween(sx, sy, sx - dx * 20, sy - dy * 20);
    });
    this.tweens.add({ targets: wg, alpha: 0, duration: 150, onComplete: () => wg.destroy() });
    this.time.addEvent({ delay: 40, repeat: 3, callback: () => { if (pl && !pl.dead && this.puff) this.puff(pl.x, pl.y); } });
    this.time.delayedCall(160, () => {
      if (pl && !pl.dead && !pl.flash) {
        pl.setTintFill(0xffffff);
        this.time.delayedCall(40, () => { if (pl && !pl.dead && !pl.flash) pl.clearTint(); });
        if (this.puff) this.puff(pl.x, pl.y);
      }
    });
  },
  updLowHp() {
    if (!this.lowHpG || !this.lowHpG.active) this.lowHpG = this.add.graphics().setScrollFactor(0).setDepth(2.5e5);
    const maxhp = (typeof stat === 'function') ? stat().maxhp : 100;
    if (S.hp < maxhp * .3 && S.hp > 0) {
      this.lowHpG.setVisible(true).clear().fillStyle(0xcc1122, Math.max(0.05, .25 + .2 * Math.sin(this.t * 6)));
      const b = 14;
      this.lowHpG.fillRect(0, 0, VW, b).fillRect(0, VH - b, VW, b).fillRect(0, b, b, VH - b * 2).fillRect(VW - b, b, b, VH - b * 2);
    } else this.lowHpG.setVisible(false);
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
        if (pl.body) pl.body.setVelocity(dx * CFX.lunge, dy * CFX.lunge);
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
    const wasDodged = pl && pl.perfectDodged;
    const px = pl ? pl.x : 0, py = pl ? pl.y : 0;
    const r = hurt0.apply(this, arguments);
    if (pl && !wasDodged && pl.perfectDodged) {
      // T317: Menghindar sempurna siluet biru & overlay waktu melambat
      const ghost = this.add.image(px, py, pl.texture.key, pl.frame.name)
        .setOrigin(.5, 1).setFlipX(pl.flipX).setTint(0x40b0ff).setAlpha(0.75).setDepth(py - 1)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: ghost, alpha: 0, scale: 1.1, duration: 400, onComplete: () => ghost.destroy() });
      if (!OPT.lite) {
        const tint = this.add.rectangle(0, 0, VW, VH, 0x184890, 0.12).setOrigin(0, 0).setScrollFactor(0).setDepth(9997);
        this.tweens.add({ targets: tint, alpha: 0, duration: 200, delay: 100, onComplete: () => tint.destroy() });
      }
    }
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
