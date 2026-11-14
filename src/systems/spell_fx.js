'use strict';
// Efek khusus jurus: Kabut Racun, Cahaya Pulih, Lentera Suci (T322)
Object.assign(World.prototype, {
  spellFx(id, t = 1) {
    const pl = this.pl;
    if (!pl) return;
    if (id === 'venom') {
      // Kabut Racun: gelembung hijau naik & awan berdenyut
      const cloud = this.add.ellipse(pl.x, pl.y - 6, 60 + t * 14, 40 + t * 10, 0x4ade80, 0.35).setDepth(pl.y + 1);
      this.tweens.add({ targets: cloud, scaleX: 1.25, scaleY: 1.25, alpha: 0, duration: 650, ease: 'Sine.easeOut', onComplete: () => cloud.destroy() });
      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 60, () => {
          if (!this.pl) return;
          this.sparkle(pl.x + rnd(-24, 24), pl.y - rnd(2, 14), 'dotg', 2);
        });
      }
    } else if (id === 'heal') {
      // Cahaya Pulih: pilar cahaya hijau-emas + daun melayang ke atas
      const pillar = this.add.rectangle(pl.x, pl.y - 20, 26, 56, 0x86efac, 0.45).setDepth(pl.y + 3);
      this.tweens.add({ targets: pillar, alpha: 0, scaleY: 1.3, duration: 500, ease: 'Quad.easeOut', onComplete: () => pillar.destroy() });
      for (let i = 0; i < 6; i++) {
        this.time.delayedCall(i * 50, () => {
          if (!this.pl) return;
          this.sparkle(pl.x + rnd(-10, 10), pl.y - 6 - i * 5, 'dot', 2);
        });
      }
    } else if (id === 'holy') {
      // Lentera Suci: sinar silang emas + titik cahaya mengorbit Arka 1 s
      const g = this.add.graphics().setDepth(pl.y + 3);
      g.lineStyle(3, 0xfef08a, 0.85);
      g.beginPath();
      g.moveTo(pl.x - 36, pl.y - 10); g.lineTo(pl.x + 36, pl.y - 10);
      g.moveTo(pl.x, pl.y - 46); g.lineTo(pl.x, pl.y + 26);
      g.strokePath();
      this.tweens.add({ targets: g, alpha: 0, scale: 1.4, duration: 550, ease: 'Quad.easeOut', onComplete: () => g.destroy() });
      for (let i = 0; i < 3; i++) {
        const o = { ang: (i * 2.09) };
        const dot = this.add.image(pl.x, pl.y - 10, 'doto').setTint(0xffea75).setDepth(pl.y + 4);
        this.tweens.add({
          targets: o, ang: o.ang + 6.28, duration: 1000,
          onUpdate: () => {
            if (!dot.active || !this.pl) return;
            dot.setPosition(pl.x + Math.cos(o.ang) * 24, pl.y - 10 + Math.sin(o.ang) * 16);
          },
          onComplete: () => dot.destroy()
        });
      }
    }
  }
});
