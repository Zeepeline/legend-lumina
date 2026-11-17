'use strict';
// Warna Langit/Cahaya Ikut Bioma (T457)
// Lapisan warna layar tipis (alpha <= 0.06): salju = biru dingin, rawa = hijau keruh, kota/gurun = netral.
// Berpindah halus 2 detik saat ganti wilayah.

(() => {
  const BIOME_TINTS = {
    snow: 0x6ab2ff,     // Biru dingin
    swamp: 0x486b3a,    // Hijau keruh
    cave: 0x221a30,     // Ungu gua gelap
    deepwood: 0x0a1e12, // Hijau kanopi purba gelap sejuk
    desert: 0xd89a42,   // Oranye gurun hangat
    default: 0xffffff
  };

  const W = World.prototype;
  const _origCreate = W.create;

  W.create = function () {
    const res = _origCreate.apply(this, arguments);
    if (!this.biomeTintRect && this.add) {
      // Buat overlay warna layar menempel di kamera (depth tinggi di atas dunia tapi di bawah UI)
      this.biomeTintRect = this.add.rectangle(0, 0, VW || 844, VH || 390, 0xffffff, 0)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(9600);
      this._curBiomeTint = 0xffffff;
      this._curBiomeAlpha = 0;
    }
    if (this.M) this.applyBiomeTint(this.M.id);
    return res;
  };

  const _origBenuaAmbient = W.benuaAmbient;
  W.benuaAmbient = function (id) {
    if (_origBenuaAmbient) _origBenuaAmbient.call(this, id);
    this.applyBiomeTint(id);
  };

  W.applyBiomeTint = function (id) {
    const r = this.biomeTintRect;
    if (!r || !this.tweens) return;

    const curId = id || (this.M && this.M.id);
    const targetColor = BIOME_TINTS[curId] || BIOME_TINTS.default;
    const isNightTime = typeof nightAmt === 'function' && nightAmt() > 0.3;
    let targetAlpha = 0;
    if (targetColor !== BIOME_TINTS.default && !isNightTime) {
      targetAlpha = (curId === 'deepwood') ? 0.25 : 0.055;
    }

    r.fillColor = targetColor;
    this.tweens.killTweensOf(r);
    this.tweens.add({
      targets: r,
      fillAlpha: targetAlpha,
      duration: 2000,
      ease: 'Linear'
    });
  };
})();
