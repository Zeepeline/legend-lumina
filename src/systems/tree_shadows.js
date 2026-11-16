'use strict';
// Bayangan Daun Bergoyang di Bawah Pohon (T448) — referensi: target_padang.png, Stardew
// Di bawah pohon besar: elips bayangan bertekstur lembut alpha 0.22, bergoyang sinkron dengan angin.

(() => {
  const W = World.prototype;
  const _origSpawnObj = W.spawnObj;

  W.spawnObj = function (o) {
    const s = _origSpawnObj.apply(this, arguments);
    const type = o[0], x = o[1], y = o[2];

    if (s && (type.startsWith('tree') || type === 'verdant_tree') && this.add) {
      if (!this.textures.exists('tree_shadow_dither')) {
        const [c, ctx] = mk(64, 32);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(32, 16, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        this.textures.addCanvas('tree_shadow_dither', c);
      }

      const sh = this.add.image(x, y - 2, 'tree_shadow_dither')
        .setOrigin(0.5, 0.5)
        .setAlpha(0.22)
        .setDepth(y - 0.8);

      // Goyangan daun halus sinkron dengan angin
      this.tweens.add({
        targets: sh,
        x: x + 2,
        duration: 1200 + ((x * 17) % 600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    return s;
  };
})();
