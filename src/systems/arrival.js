'use strict';
// Zona Aman Saat Tiba di Wilayah (T467) — referensi: Dark Souls
// Setelah create wilayah baru, setiap musuh non-boss yang berjarak < 200 px dari titik tiba pemain
// diberi masa tenang e.calmT = 3 detik sehingga tidak langsung mengeroyok pemain yang baru masuk.

{
  const _origCreate = World.prototype.create;
  World.prototype.create = function (data) {
    const res = _origCreate.apply(this, arguments);

    // Amankan musuh non-boss di sekitar pemain (< 200 px)
    const pl = this.pl;
    if (pl && Array.isArray(this.enemies)) {
      for (const e of this.enemies) {
        if (!e || e.hp <= 0 || e.boss || !e.spr) continue;
        const d = Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y);
        if (d < 200) {
          e.calmT = 3.0; // Tenang selama 3 detik pertama setelah tiba
          e.alert = 0;
          e.packAggro = false;
          e.wasAggro = false;
        }
      }
    }

    return res;
  };
}
