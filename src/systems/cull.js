'use strict';
// Optimalisasi Kamera Culling (T487)
// Menyembunyikan objek statis (pohon, batu, dekorasi) di luar layar kamera (+ margin 64 px)
// Berjalan tiap 0.25 detik untuk menghemat draw-calls & rendering di HP.

(() => {
  const CULL_MARGIN_X = 120;
  const CULL_MARGIN_TOP = 260; // Mengakomodasi kanopi pohon redwood setinggi 216 px
  const CULL_MARGIN_BOT = 80;
  const CULL_INTERVAL = 0.25;

  const W = World.prototype;
  const _origSpawnObj = W.spawnObj;

  W.spawnObj = function (o) {
    const s = _origSpawnObj.apply(this, arguments);
    if (s && s.active && s.visible !== undefined) {
      if (!this._cullables) this._cullables = [];
      this._cullables.push(s);
    }
    return s;
  };

  const _origUpdate = W.update;
  W.update = function (time, dms) {
    _origUpdate.apply(this, arguments);

    // Jalankan culling setiap CULL_INTERVAL detik
    this._cullTimer = (this._cullTimer || 0) + (this.dt || 0.016);
    if (this._cullTimer >= CULL_INTERVAL) {
      this._cullTimer = 0;
      this.cullOffscreen();
    }
  };

  W.cullOffscreen = function () {
    const cam = this.cameras?.main;
    if (!cam || !this._cullables || !this._cullables.length) return;

    const vw = cam.worldView;
    const minX = vw.x - CULL_MARGIN_X;
    const maxX = vw.right + CULL_MARGIN_X;
    const minY = vw.y - CULL_MARGIN_TOP;
    const maxY = vw.bottom + CULL_MARGIN_BOT;

    let writeIdx = 0;
    const list = this._cullables;
    const len = list.length;

    for (let i = 0; i < len; i++) {
      const s = list[i];
      if (!s || !s.active) continue; // Hapus objek yang sudah dihancurkan
      list[writeIdx++] = s;

      const inView = s.x >= minX && s.x <= maxX && s.y >= minY && s.y <= maxY;
      if (s.visible !== inView) {
        s.setVisible(inView);
      }
    }
    list.length = writeIdx;
  };
})();
