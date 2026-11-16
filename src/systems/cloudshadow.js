'use strict';
// T447: Bayangan awan berjalan
// 3-4 gambar bayangan awan (elips lembut gelap, 300-600 px, alpha .10-.16) bergerak pelan (8-14 px/dtk)
// mengikuti arah angin, posisi dunia (ikut kamera), depth di atas tanah & di bawah objek tinggi (-8.9e5).
// Hanya siang, luar ruang, cuaca cerah/berawan. Opsi OPT.lite mematikan.
(function () {
  function ensureCloudTex(sc) {
    if (sc.textures.exists('tex_cloud_shadow')) return;
    const w = 256, h = 140;
    const [c, x] = mk(w, h);
    const grad = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(10, 24, 18, 0.9)');
    grad.addColorStop(0.6, 'rgba(10, 24, 18, 0.5)');
    grad.addColorStop(1, 'rgba(10, 24, 18, 0)');
    x.fillStyle = grad;
    x.beginPath();
    x.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, Math.PI * 2);
    x.fill();
    sc.textures.addCanvas('tex_cloud_shadow', c);
  }

  const CLOUD_COUNT = 4;
  function initClouds(sc) {
    ensureCloudTex(sc);
    if (sc._cloudShadows && sc._cloudShadows.length === CLOUD_COUNT && sc._cloudShadows[0].active) return;
    (sc._cloudShadows || []).forEach(c => c.destroy());
    sc._cloudShadows = [];
    const mw = (sc.M && sc.M.w) || 1200, mh = (sc.M && sc.M.h) || 800;

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const img = sc.add.image(
        (i * (mw / CLOUD_COUNT) + 100) % mw,
        (i * (mh / CLOUD_COUNT) + 80) % mh,
        'tex_cloud_shadow'
      );
      img.setDepth(-8.9e5);
      const scaleX = 1.3 + (i % 3) * 0.45; // 330px - 560px
      const scaleY = scaleX * 0.55;
      img.setScale(scaleX, scaleY);
      img.setAlpha(0.11 + (i % 3) * 0.02); // 0.11 - 0.15
      img.speedX = 9 + (i % 3) * 2;       // 9 - 13 px/dtk
      img.speedY = 3 + (i % 2) * 1.5;
      sc._cloudShadows.push(img);
    }
  }

  const origUpdAtmos = World.prototype.updAtmos;
  World.prototype.updAtmos = function (dt) {
    if (typeof origUpdAtmos === 'function') origUpdAtmos.call(this, dt);
    if (typeof OPT !== 'undefined' && OPT.lite) {
      if (this._cloudShadows) this._cloudShadows.forEach(c => c.setVisible(false));
      return;
    }
    const isOutdoor = this.M && !this.M.indoor && !this.M.dark;
    const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
    const isDay = h >= 6 && h <= 18;
    const isGoodWeather = !this.weather || this.weather === 'clear' || this.weather === 'cloudy';

    if (!isOutdoor || !isDay || !isGoodWeather) {
      if (this._cloudShadows) this._cloudShadows.forEach(c => c.setVisible(false));
      return;
    }

    initClouds(this);
    const mw = (this.M && this.M.w) || 1200, mh = (this.M && this.M.h) || 800;
    const step = dt || (1 / 60);

    for (let i = 0; i < this._cloudShadows.length; i++) {
      const c = this._cloudShadows[i];
      if (!c || !c.active) continue;
      c.setVisible(true);
      c.x += c.speedX * step;
      c.y += c.speedY * step;
      if (c.x > mw + 250) c.x = -250;
      if (c.y > mh + 200) c.y = -200;
    }
  };
})();
