'use strict';
// Pantulan Karakter di Air (T460) — referensi: RPG klasik / Sea of Stars
// Saat pemain berdiri <= 30 px di utara air: buat/tampilkan sprite terbalik (setFlipY),
// alpha 0.25, warna kebiruan, tepat di bawah pemain saat titik pantulnya adalah air.

(() => {
  const W = World.prototype;
  const _origUpdate = W.update;

  W.update = function (time, dms) {
    _origUpdate.apply(this, arguments);

    const pl = this.pl;
    if (!pl || !pl.active || pl.dead || G.title || G.lock > 0) {
      if (this.reflectSpr) this.reflectSpr.setVisible(false);
      return;
    }

    if (!this.reflectSpr && this.add) {
      this.reflectSpr = this.add.image(pl.x, pl.y, pl.texture.key, pl.frame.name)
        .setOrigin(0.5, 0)
        .setFlipY(true)
        .setAlpha(0.25)
        .setTint(0x60a0f0)
        .setDepth(pl.y - 1);
    }

    const rSpr = this.reflectSpr;
    if (!rSpr) return;

    // Cek apakah ada air dalam jarak <= 30 px di selatan pemain
    const checkY = pl.y + 16;
    let isWater = false;

    if (typeof waterFlowAt === 'function' && waterFlowAt(pl.x, checkY)) {
      isWater = true;
    } else if (typeof groundAt === 'function') {
      const g = groundAt(pl.x, checkY);
      if (g === 'water' || g === 'shallow') isWater = true;
    } else if (typeof waterE === 'function' && this.M?.ponds) {
      if (waterE(this.M.ponds, pl.x, checkY) < 1.1) isWater = true;
    }

    if (isWater) {
      rSpr.setVisible(true);
      rSpr.setPosition(pl.x, pl.y);
      rSpr.setTexture(pl.texture.key, pl.frame.name);
      rSpr.setFlipX(pl.flipX);
      rSpr.setDepth(pl.y - 1);
    } else {
      rSpr.setVisible(false);
    }
  };
})();
