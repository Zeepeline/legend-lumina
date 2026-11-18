'use strict';
// Rona warna "sore keemasan" ala screenshot Dimraeth pemilik (v1.47.0): seluruh layar luar-ruang digeser ke kuning-zaitun hangat,
// bayangan lebih pekat, biru diredam, plus vinyet lembut. Aktif HANYA saat sore keemasan (jam 15.5 - 18.6).
// Pagi, siang, dan malam hari kembali ke pencahayaan alami & malam biru gelap sejuk.
// WebGL: ColorMatrix + Vignette di kamera (1 lintasan layar). Canvas: lapisan MULTIPLY. Mati di dalam ruangan, gua, salju, dan OPT.lite.
const GRADE_OFF = /^(snow|cave)/;
const GRADE_M = [1.15, .45, 0, 0, -14, 0, 1.14, 0, 0, -4, 0, .1, .55, 0, -2, 0, 0, 0, 1, 0];
function isGoldenHour() {
  const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
  return h >= 15.5 && h <= 18.6;
}
function gradeOn(M) {
  // Gaya visual natural: rona warna senja dinonaktifkan agar warna game tetap natural dan jernih
  return false;
}
function gradeCam(sc, cam, on, vig) {
  if (sc.game.renderer.type !== Phaser.WEBGL || !cam.postFX) return false;
  cam.postFX.clear();
  if (on) {
    cam.postFX.addColorMatrix().set(GRADE_M);
    if (vig) cam.postFX.addVignette(.5, .5, .92, .16);
  }
  return true;
}
{ const W = World.prototype, _cr = W.create;
  W.create = function () {
    const r = _cr.apply(this, arguments), on = gradeOn(this.M);
    this._gradeKey = this.M.id + (on ? '+' : '-');
    if (!gradeCam(this, this.cameras.main, on, false)) {
      this._gradeRect = this.add.rectangle(0, 0, VW, VH, 0xffe2a0, .5)
        .setOrigin(0).setScrollFactor(0).setDepth(9e6)
        .setBlendMode(Phaser.BlendModes.MULTIPLY).setVisible(on);
    }
    if (!this._gradeHook) {
      this._gradeHook = 1;
      this.events.on('postupdate', () => {
        if (G.scene !== this || !this.M) return;
        const curOn = gradeOn(this.M), key = this.M.id + (curOn ? '+' : '-');
        if (this._gradeKey !== key) {
          this._gradeKey = key;
          gradeCam(this, this.cameras.main, curOn, false);
          if (this._gradeRect) this._gradeRect.setVisible(curOn);
        }
        const gl = this.scene.get('GL');
        if (gl && gl.cameras && gl.cameras.main && gl._gradeKey !== key) {
          gl._gradeKey = key;
          gradeCam(gl, gl.cameras.main, curOn, true);
        }
      });
    }
    return r;
  };
}
