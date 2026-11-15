'use strict';
// Suasana cahaya & kabut (wilayah aktif saja):
// - lapisan kabut berlapis (2 lembar noise lembut, parallax & bergeser) untuk cuaca 'fog'; lebih tebal pagi hari
// - cahaya hangat berkedip untuk SEMUA lampu di layar saat malam (lampu besar sudah punya `this.glows`) + lentera kecil di sekitar Arka
const ATMOS_POOL = 18;
function fogSheetTex(sc) {
  if (sc.textures.exists('fogsheet')) return;
  const N = 256, [c, x] = mk(N, N), D = x.createImageData(N, N), d = D.data;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {      // noise berulang mulus (tiled) 2 oktaf
    const v = vnoise(i, j, 64, 301) * .65 + vnoise(i, j, 24, 302) * .35, w = (a, b) => vnoise(a, b, 64, 301) * .65 + vnoise(a, b, 24, 302) * .35;
    const fx = i / N, fy = j / N, t = v * (1 - fx) * (1 - fy) + w(i - N, j) * fx * (1 - fy) + w(i, j - N) * (1 - fx) * fy + w(i - N, j - N) * fx * fy;
    const a = Math.max(0, Math.min(1, (t - .32) * 2.2)), o = (j * N + i) * 4;
    d[o] = 232; d[o + 1] = 238; d[o + 2] = 240; d[o + 3] = Math.round(a * 200);
  }
  x.putImageData(D, 0, 0); sc.textures.addCanvas('fogsheet', c);
}
Object.assign(World.prototype, {
  updAtmos(dt) {
    if (G.title || !this.M) return;
    if (this.M.indoor && this._bgM !== this.M) { this._bgM = this.M; this.cameras.main.setBackgroundColor('#0e0907'); } /* luar ruangan sempit: gelap, bukan hijau */
    const outdoor = !this.M.indoor && !this.M.dark, n = typeof nightAmt === 'function' ? nightAmt() : 0;
    if (this._atmosM !== this.M || !this._fogL || !this._fogL[0].active) {
      (this._fogL || []).forEach(o => o.destroy()); (this._glP || []).forEach(o => o.destroy()); fogSheetTex(this);
      this._fogL = [0, 1].map(k => this.add.tileSprite(0, 0, VW, VH, 'fogsheet').setOrigin(0).setScrollFactor(0).setDepth(1.9e5 + k).setAlpha(0)
        .setTileScale(k ? 1.6 : 1.1));
      this._glP = []; this._lant = null; this._atmosM = this.M; this._fogA = 0;
    }
    // kabut: target alpha menurut cuaca & jam (pagi lebih tebal), berubah halus
    const h = S.time || 12, morning = h >= 4 && h < 9 ? 1 : h >= 17 && h < 20 ? .6 : .35;
    const want = outdoor && this.weather === 'fog' ? .3 + .35 * morning : 0;
    this._fogA += (want - this._fogA) * Math.min(1, dt * .8);
    const cam = this.cameras.main;
    this._fogL.forEach((f, k) => {
      f.setAlpha(this._fogA * (k ? .7 : 1)).setVisible(this._fogA > .01);
      f.tilePositionX = cam.scrollX * (k ? .55 : .3) + this.t * (k ? 7 : 4); f.tilePositionY = cam.scrollY * (k ? .55 : .3) + this.t * (k ? 1.5 : .8);
      f.setTint(n > .3 ? 0x8090b8 : 0xffffff);
    });
    // cahaya hangat lampu kecil + lentera Arka saat malam
    const ga = outdoor ? Math.max(0, Math.min(.6, (n - .12) * 1.4)) : 0, fogBoost = 1 + this._fogA * .8;
    if (!this._lant) this._lant = this.add.image(0, 0, 'nlL').setTint(0xffd890).setBlendMode(Phaser.BlendModes.ADD).setDepth(2e5 + 2);
    const pl = this.pl;
    this._lant.setVisible(ga > 0 && !!pl).setAlpha(ga * .45);
    if (pl) this._lant.setPosition(pl.x, pl.y - 12).setScale((.55 + Math.sin(this.t * 4) * .02) * fogBoost);
    let used = 0;
    if (ga > 0) {
      const v = cam.worldView;
      for (const L of this.lights) {
        if (!L.small || used >= ATMOS_POOL || L.x < v.x - 40 || L.x > v.right + 40 || L.y < v.y - 40 || L.y > v.bottom + 40) continue;
        const g = this._glP[used] || (this._glP[used] = this.add.image(0, 0, 'nlW').setTint(0xffb050).setBlendMode(Phaser.BlendModes.ADD).setDepth(2e5 + 1));
        g.setVisible(true).setPosition(L.x, L.y).setScale(.9 * fogBoost).setAlpha(ga * (.85 + Math.sin(this.t * 5 + L.x) * .15)); used++;
      }
    }
    for (let i = used; i < this._glP.length; i++) this._glP[i].setVisible(false);
    if (this.glows && fogBoost > 1) for (const g of this.glows) g.setScale(fogBoost);
  }
});
