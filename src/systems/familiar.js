'use strict';
// H6: Familiar Udara Gagak Senja (orbit halus, tembak bulu pelacak beracun/bleed, magnet drop & lentera malam)
function buildFamiliarTex(sc) {
  if (!sc || !sc.textures || sc.textures.exists('fam_crow_sheet')) return;
  const W = 18, H = 16, cv = document.createElement('canvas');
  cv.width = W * 3; cv.height = H;
  const g = cv.getContext('2d');
  const drawFrame = (fi) => {
    const ox = fi * W;
    const p = (x, y, c) => { g.fillStyle = c; g.fillRect(ox + x, y, 1, 1); };
    const wy = fi === 0 ? 3 : fi === 1 ? 6 : 9;
    for (let y = 5; y <= 11; y++) for (let x = 6; x <= 12; x++) p(x, y, '#2b243c');
    for (let x = 7; x <= 11; x++) { p(x, 4, '#181224'); p(x, 12, '#181224'); }
    for (let x = 3; x <= 7; x++) { p(x, wy, '#181224'); p(x, wy + 1, '#4c3e70'); p(x, wy + 2, '#2b243c'); }
    for (let x = 11; x <= 15; x++) { p(x, wy, '#181224'); p(x, wy + 1, '#4c3e70'); }
    p(13, 6, '#e8b848'); p(14, 7, '#e8b848'); p(11, 6, '#ffe078'); p(5, 11, '#3a2e54'); p(4, 12, '#181224');
  };
  [0, 1, 2].forEach(drawFrame);
  const t = sc.textures.addCanvas('fam_crow_sheet', cv);
  for (let i = 0; i < 3; i++) t.add(i, 0, i * W, 0, W, H);
  if (!sc.anims.exists('fam_crow_fly')) {
    sc.anims.create({ key: 'fam_crow_fly', frames: [0, 1, 2, 1].map(i => ({ key: 'fam_crow_sheet', frame: i })), frameRate: 9, repeat: -1 });
  }
}

Object.assign(World.prototype, {
  syncFamiliar() {
    S.familiar = Object.assign({ unlocked: false, active: false, kind: 'crow' }, S.familiar || {});
    if (this.passive || !this.pl) return;
    if (!S.familiar.unlocked || !S.familiar.active) {
      if (this._famSpr) { this._famSpr.destroy(); this._famSpr = null; }
      if (this._famSh) { this._famSh.destroy(); this._famSh = null; }
      return;
    }
    buildFamiliarTex(this);
    if (!this._famSpr || !this._famSpr.active) {
      const fx = this.pl.x - 14, fy = this.pl.y - 22;
      this._famSh = this.add.image(fx, this.pl.y - 2, 'shadow').setScale(.4).setAlpha(.35).setDepth(this.pl.y - 2);
      this._famSpr = this.add.sprite(fx, fy, 'fam_crow_sheet', 0).setDepth(this.pl.y + 8).play('fam_crow_fly');
      this._famShotT = .8;
      this.lights.push({ x: fx, y: fy, small: true, _fam: true });
    }
  },
  updFamiliar(dt) {
    if (this.passive || !this.pl || this.pl.dead) return;
    if (!S.familiar || !S.familiar.unlocked || !S.familiar.active) {
      if (this._famSpr) this.syncFamiliar();
      return;
    }
    if (!this._famSpr || !this._famSpr.active) this.syncFamiliar();
    const s = this._famSpr, sh = this._famSh, pl = this.pl;
    if (!s) return;
    const tx = pl.x + Math.cos(this.t * 1.9) * 18 - (pl.flipX ? -8 : 8);
    const ty = pl.y - 20 + Math.sin(this.t * 3.8) * 4;
    s.x += (tx - s.x) * Math.min(1, dt * 6);
    s.y += (ty - s.y) * Math.min(1, dt * 6);
    s.flipX = tx < s.x ? true : pl.flipX;
    s.setDepth(pl.y + 10);
    if (sh && sh.active) sh.setPosition(s.x, pl.y - 1).setDepth(pl.y - 2);
    for (const l of this.lights || []) if (l._fam) { l.x = s.x; l.y = s.y; }

    this._famShotT = (this._famShotT || 0) - dt;
    if (this._famShotT <= 0 && !G.lock && !UIH && !G.title) {
      let best = null, bd = 165;
      for (const e of this.enemies || []) {
        if (e.hp <= 0 || e.faded) continue;
        const d = Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y);
        if (d < bd) { bd = d; best = e; }
      }
      if (best) {
        this._famShotT = 1.35;
        const sy0 = this.pl.y - 6;
        const a = Math.atan2(best.spr.y - 4 - sy0, best.spr.x - s.x);
        s.flipX = Math.cos(a) < 0;
        const orb = this.add.image(s.x, sy0 - 9, 'spark')
          .setTint(0xd09aff).setScale(.9).setRotation(a).setDepth(sy0 + 4);
        const dmg = Math.max(2, Math.round(stat().mag * .45 + S.lv));
        this.shots.push({
          s: orb, gx: s.x, gy: sy0, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230,
          life: .85, kind: 'fam_bolt', mine: 1, dmg, _famBleed: true
        });
        sfxAt('swing', s.x, s.y, this);
        if (this.jx) this.jx('mote', s.x, s.y, 2, { tint: 0xc89aff, rx: 4, ry: 4 });
      }
    }
  }
});

(() => {
  const W = World.prototype;
  const cr0 = W.create;
  W.create = function () { const r = cr0.apply(this, arguments); if (!this.passive) this.syncFamiliar(); return r; };

  const upd0 = W.update;
  W.update = function (t, dl) { const r = upd0.apply(this, arguments); this.updFamiliar(Math.min(dl || 16, 50) / 1000); return r; };

  const use0 = W.useItem;
  W.useItem = function (id) {
    if (id === 'fam_crow') {
      S.familiar = { unlocked: true, active: true, kind: 'crow' };
      addItem(id, -1);
      sfx('fanfare');
      banner('GAGAK SENJA DIPANGGIL', 'FAMILIAR AKTIF', true, 2200);
      popWorld(this.pl.x, this.pl.y - 30, '🦅 Gagak Senja Siap!', 'purp');
      this.syncFamiliar();
      updHud();
      return true;
    }
    return use0.apply(this, arguments);
  };

  const hit0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    const r = hit0.apply(this, arguments);
    if (this._curShot && this._curShot._famBleed && e && e.hp > 0) {
      if (this.addBleed) this.addBleed(e, 1);
      else if (this.poisonEnemy) this.poisonEnemy(e, 2, 3, 1);
    }
    return r;
  };

  const upk0 = W.updPicks;
  W.updPicks = function (dt) {
    if (S.familiar && S.familiar.unlocked && S.familiar.active && this.pl && !this.pl.dead) {
      for (const p of this.picks || []) {
        if (p.t > 0 || p.got) continue;
        const dx = this.pl.x - p.s.x, dy = this.pl.y - 4 - p.s.y, d = Math.hypot(dx, dy);
        if (d >= 68 && d < 120) {
          p.s.x += dx / d * 150 * dt; p.s.y += dy / d * 150 * dt;
        }
      }
    }
    return upk0.apply(this, arguments);
  };
})();
