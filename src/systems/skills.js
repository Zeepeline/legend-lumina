'use strict';
// Jurus: dash, tebasan putar, nova es
Object.assign(World.prototype, {
  updSkills(dt) {
    const pl = this.pl; this.dashCd -= dt;
    if (Input.keys.a && learned('spin') && pl.atkCd < .2) {
      this.holdA += dt;
      if (this.holdA > .45 && !this.charged) { this.charged = true; sfx('cur'); this.sparkle(pl.x, pl.y - 10, 'doto', 6); }
      if (this.charged) { if (Math.floor(this.t * 14) % 2) pl.setTint(0xfff0a0); else pl.clearTint(); }
      if (this.holdA > .12 && this.updChargeFx) this.updChargeFx(this.holdA);
    } else {
      const hDur = this.holdA;
      if (this.clearChargeFx) this.clearChargeFx();
      if (this.charged) { this.charged = false; pl.clearTint(); this.spin(hDur); }
      this.holdA = 0;
    }
  },
  spin(holdDur = .5) {
    const pl = this.pl, st = stat(), tt = tierOf('spin'), hMul = Math.min(1.4, 1 + Math.max(0, (holdDur || .5) - .45) * .6);
    useJurus(this, 'spin'); pl.atkCd = .45; pl.atkT = .3; sfx('swing'); this.time.delayedCall(90, () => sfx('swing'));
    if (this.spinFx) this.spinFx(tt, hMul);
    else {
      const g = this.add.sprite(pl.x, pl.y - 9, 'slash').setOrigin(4 / 28, .5).setDepth(pl.y + 3).play('slash');
      this.tweens.add({ targets: g, rotation: Math.PI * 2, duration: 260, onComplete: () => g.destroy() });
    }
    const rad = (30 + tt * 8) * hMul, dmg = st.atk * (1.3 + .2 * tt) * hMul, [fx, fy] = DIRV[pl.dir] || [1, 0];
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const dx = e.spr.x - pl.x, dy = e.spr.y - pl.y, d = Math.hypot(dx, dy) || 1;
      if (d < rad + e.D.r * e.sc) {
        const isBack = (dx * fx + dy * fy) < -2;
        if (isBack) this.time.delayedCall(70, () => { if (e.hp > 0) this.hitEnemy(e, dmg, Math.random() < .2, dx / d, dy / d); });
        else this.hitEnemy(e, dmg, Math.random() < .2, dx / d, dy / d);
      }
    }
  },
  dash() {
    const pl = this.pl; if (!learned('dash')) { popWorld(pl.x, pl.y - 30, 'Belum belajar Dash', 'xp'); return; }
    if (this.dashCd > 0 || pl.dashT > 0) return;
    const v = Input.vec(); let dx = v.x, dy = v.y; if (Math.hypot(dx, dy) < .3) [dx, dy] = DIRV[pl.dir]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    pl.dashT = .17; pl.dashStartT = this.t; pl.perfectDodged = false;
    pl.dvx = dx * 290; pl.dvy = dy * 290; pl.inv = Math.max(pl.inv, .22 + .04 * tierOf('dash')); this.dashCd = .85 - .1 * tierOf('dash'); useJurus(this, 'dash'); sfx('jump'); this.puff(pl.x, pl.y);
  },
  nova() {
    const pl = this.pl, st = stat(); if (!learned('nova')) { popWorld(pl.x, pl.y - 30, 'Belum belajar Nova Es', 'xp'); return; }
    if (pl.atkCd > 0) return; if (S.mp < 8) { popWorld(pl.x, pl.y - 30, 'MP kurang!', 'mpc'); sfx('buzz'); return; }
    S.mp -= 8; updHud(); pl.atkCd = .5; pl.atkT = .2; sfx('ice'); useJurus(this, 'nova'); this.cameras.main.flash(120, 180, 230, 255);
    const g = this.add.graphics().setDepth(pl.y + 2), o = { r: 6 };
    this.tweens.add({ targets: o, r: 60, duration: 320, onUpdate: () => { g.clear(); g.fillStyle(0xbfe8ff, .25 * (1 - o.r / 70)).fillEllipse(pl.x, pl.y - 4, o.r * 2, o.r * 1.3); g.lineStyle(2, 0xe8f8ff, 1 - o.r / 70).strokeEllipse(pl.x, pl.y - 4, o.r * 2, o.r * 1.3); }, onComplete: () => g.destroy() });
    this.sparkle(pl.x, pl.y - 8, 'dot', 20);
    for (const e of this.enemies) { if (e.hp <= 0) continue; const dx = e.spr.x - pl.x, dy = e.spr.y - pl.y, d = Math.hypot(dx, dy) || 1; if (d < 60 + e.D.r * e.sc) { e.slow = 3; this.hitEnemy(e, st.mag * 1.2, false, dx / d, dy / d); this.freezeEnemy(e, 1.6); } }
  },
});
