'use strict';
// Kilatan bintang putih 4 sudut di titik kena (ala Dimraeth): muncul sekejap saat pukulan pemain mengenai musuh.
// Membungkus hitFx (combat_fx.js, dimuat lebih dulu). Tekstur 'vfx_star4' digambar kode sekali.
{
  const W = World.prototype, _hit = W.hitFx;
  W.hitStarTex = function () {
    if (this.textures.exists('vfx_star4')) return 'vfx_star4';
    const g = this.make.graphics({ add: false }), c = 16;
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(c, 0, c - 2.2, c, c + 2.2, c); g.fillTriangle(c, 32, c - 2.2, c, c + 2.2, c);   /* sinar tegak */
    g.fillTriangle(0, c, c, c - 2.2, c, c + 2.2); g.fillTriangle(32, c, c, c - 2.2, c, c + 2.2);   /* sinar mendatar */
    g.fillCircle(c, c, 3.2); g.generateTexture('vfx_star4', 32, 32); g.destroy(); return 'vfx_star4';
  };
  W.hitFx = function (e, crit) {
    _hit.call(this, e, crit);
    const s = e && e.spr; if (!s || !s.active || OPT.lite) return;
    const pl = this.pl, k = .5 + Math.random() * .2;
    const x = pl ? s.x + (pl.x - s.x) * .3 : s.x, y = s.y - (e.D && e.D.r || 8) * (e.sc || 1) * .9;
    const st = this.add.image(x, y, this.hitStarTex()).setDepth(s.y + 40).setBlendMode(Phaser.BlendModes.ADD)
      .setScale(k * .4).setRotation(Math.random() * .5 - .25).setAlpha(1);
    if (crit) st.setTint(0xfff2a8);
    this.tweens.add({ targets: st, scale: k * (crit ? 1.9 : 1.4), alpha: 0, duration: 150, ease: 'Cubic.easeOut', onComplete: () => st.destroy() });
  };
}
// Tebasan berat tokoh baru (lepas tenaga): kilatan bintang besar di depan tubuh + getar layar singkat (Heavy Strike Dimraeth).
{
  const W = World.prototype, _spin = W.spin;
  if (_spin) W.spin = function (holdDur) {
    const r = _spin.call(this, holdDur), pl = this.pl;
    if (typeof HERO_SWD !== 'undefined' && HERO_SWD && pl && !OPT.lite) {
      const [dx, dy] = DIRV[pl.dir] || [1, 0];
      this.time.delayedCall(70, () => {
        if (!this.pl || this.pl.dead) return;
        const st = this.add.image(pl.x + dx * 18, pl.y - 16 + dy * 12, this.hitStarTex()).setDepth(pl.y + 50)
          .setBlendMode(Phaser.BlendModes.ADD).setScale(.6).setTint(0xfff6c8);
        this.tweens.add({ targets: st, scale: 2.6, alpha: 0, duration: 200, ease: 'Cubic.easeOut', onComplete: () => st.destroy() });
        this.cameras.main.shake(90, .004);
      });
    }
    return r;
  };
}
