'use strict';
// Ayunan pedang Arka: ancang-ancang (tarik ke belakang) → ayun cepat melewati sasaran → pantulan → pulih, tetap di tangan sampai selesai.
// Dipanggil slashFx (combat_fx.js). Posisi pedang dikunci ke kepalan oleh swordToHand (sword_hand.js) lewat sw._off.
Object.assign(World.prototype, {
  swingSword(wt, cIdx, fin, ang, dx, dy, hx, hy) {
    const pl = this.pl, sw = this.sword; if (!sw || !sw.visible) return;
    if (this.bakeOn && this.bakeOn(wt)) { /* digambar per frame: sword_bake.js */
      this.tweens.killTweensOf(sw); sw.setVisible(false); sw._off = null; sw._hold = 0; sw._shT = 0; return;
    }
    /* tween per-nilai dengan awal eksplisit (from → to) dan jeda, agar urutan ancang → ayun → pantul tak bergantung nilai awal tween */
    const keyed = (tg, from, to, delay, duration, ease) => {
      const cfg = { targets: tg, delay, duration, ease };
      for (const k of Object.keys(to)) cfg[k] = { from: from[k], to: to[k] };
      return this.tweens.add(cfg);
    };
    this.tweens.killTweensOf(sw); if (sw._off) this.tweens.killTweensOf(sw._off);
    const sgn = dx < 0 ? -1 : 1, H0 = this.heroHand ? this.heroHand(pl, 0) : { x: hx, y: hy };
    const seq = sw._seq = (sw._seq || 0) + 1; sw._hold = 0; sw._shT = 0;
    const m = fin ? 1.45 : 1, ax = wt === 'axe' ? 1.6 : 1, D = (fin ? .34 : .21) * 1000; /* selaras dengan kunci serangan (atkT) */
    sw.setAlpha(1);
    if (wt === 'spear' || cIdx === 3) { /* tusukan: tarik ke belakang → sentak lurus → tahan → kembali */
      sw._off = { x: -dx, y: -dy }; sw.setRotation(ang).setPosition(H0.x + sw._off.x, H0.y + sw._off.y);
      const o = sw._off, P = { x: -dx * 2, y: -dy * 2 }, T = { x: dx * 3, y: dy * 3 }, R = { x: dx * 2, y: dy * 2 };
      keyed(o, o, P, 0, 45, 'Sine.easeOut'); keyed(o, P, T, 45, 40, 'Cubic.easeIn'); keyed(o, T, R, 85, 90, 'Sine.easeOut');
    } else { /* tebasan: tarik ke belakang (ancang) → ayun cepat melewati sasaran → pantul kembali */
      const a0 = [ang - 1.95 * sgn, ang + 1.02 * sgn, ang - 1.05 * sgn, ang, ang - 2.1 * sgn][cIdx]; /* ancang: bilah miring ke belakang kepala */
      const a1 = [ang + 0.42 * sgn, ang - 0.92 * sgn, ang + 0.32 * sgn, ang, ang + 0.65 * sgn][cIdx];
      const s = Math.sign(a1 - a0) || 1, aP = a0 - s * .3, aO = a1 + s * .17, t1 = 45 * m * ax, t2 = 55 * m * ax;
      sw._off = { x: 0, y: 0 }; sw.setPosition(H0.x, H0.y).setRotation(a0);
      keyed(sw, { rotation: a0 }, { rotation: aP }, 0, t1, 'Sine.easeOut'); keyed(sw, { rotation: aP }, { rotation: aO }, t1, t2, 'Cubic.easeIn');
      keyed(sw, { rotation: aO }, { rotation: a1 }, t1 + t2, 90 * m, 'Back.easeOut');
      /* pivot pedang tetap di kepalan (hanya gerak kecil): dorongan maju besar dulu menggeser gagang keluar dari genggaman */
      const o = sw._off; keyed(o, o, { x: -dx, y: -dy }, 0, t1, 'Sine.easeOut');
      keyed(o, { x: -dx, y: -dy }, { x: dx * (fin ? 2 : 1), y: dy * (fin ? 2 : 1) }, t1, t2, 'Cubic.easeIn');
      if (fin) for (const d of [t1 + 12, t1 + 26, t1 + 40]) this.time.delayedCall(d, () => { /* bayangan sisa bilah (kombo penutup) */
        if (seq !== sw._seq || !sw.visible) return;
        const g = this.add.image(sw.x, sw.y, sw.texture.key).setOrigin(sw.originX, sw.originY).setRotation(sw.rotation).setFlipY(sw.flipY)
          .setTint(0xcfe6ff).setAlpha(.55).setDepth(sw.depth - .1).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: g, alpha: 0, duration: 130, onComplete: () => g.destroy() });
      });
    }
    /* selesai menebas: pedang tetap di tangan (siaga sebentar), baru disarungkan — lihat swordRest di sword_hand.js */
    this.time.delayedCall(D, () => { if (seq === sw._seq && sw.visible) this.swordRest(); });
  }
});
