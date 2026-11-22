'use strict';
// Bayangan Daun Bergoyang & Proyeksi Miring Dinamis (T448, T552) — referensi: Cobo #18, Stardew
// Di bawah pohon besar: elips bayangan lembut bergerak memanjang/memendek mengikuti pergeseran matahari (pagi/siang/senja).

(() => {
  const W = World.prototype;
  const _origSpawnObj = W.spawnObj;

  function sunShadowParams() {
    const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
    if (h >= 6 && h < 11.5) { // pagi: bayangan panjang miring ke barat
      const p = (h - 6) / 5.5;
      return { scX: 1.35 - 0.25 * p, scY: 0.88, rot: 0.14 - 0.08 * p, offX: 4 - 3 * p, a: 0.24 };
    }
    if (h >= 11.5 && h < 14.5) { // siang: bayangan memendek di bawah kanopi
      return { scX: 0.98, scY: 0.8, rot: 0, offX: 0, a: 0.28 };
    }
    if (h >= 14.5 && h < 19) { // senja: bayangan memanjang ke timur
      const p = (h - 14.5) / 4.5;
      return { scX: 1.05 + 0.35 * p, scY: 0.9, rot: -0.06 - 0.12 * p, offX: 2 + 5 * p, a: 0.22 };
    }
    return { scX: 1.0, scY: 0.85, rot: 0, offX: 1, a: 0.14 }; // malam: bayangan rembulan lembut
  }

  W.spawnObj = function (o) {
    const s = _origSpawnObj.apply(this, arguments);
    const type = o[0], x = o[1], y = o[2];

    if (s && (type.startsWith('tree') || type === 'verdant_tree') && this.add) {
      s._shd = 1; /* bayangan pohon bergerak sendiri; object_shadows.js melewati */
      if (!this.textures.exists('tree_shadow_dither')) {
        const [c, ctx] = mk(64, 32);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(32, 16, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        this.textures.addCanvas('tree_shadow_dither', c);
      }

      const p = sunShadowParams();
      const sh = this.add.image(x + p.offX, y - 2, 'tree_shadow_dither')
        .setOrigin(0.5, 0.5)
        .setScale(p.scX, p.scY)
        .setRotation(p.rot)
        .setAlpha(p.a)
        .setDepth(y - 0.8);

      // Optimasi performa: Hindari 500+ tweens aktif sekaligus yang bikin stutter.
      // Cukup beri goyangan halus jika bukan OPT.lite dan dibatasi maksimal 24 pohon.
      this._treeShCount = (this._treeShCount || 0) + 1;
      if (!OPT.lite && this._treeShCount <= 24) {
        const windPhase = ((x * 0.035 + y * 0.025) * 400) % 1400;
        this.tweens.add({
          targets: sh,
          x: x + p.offX + 2.4,
          duration: 1400,
          delay: Math.abs(windPhase),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    return s;
  };
})();
