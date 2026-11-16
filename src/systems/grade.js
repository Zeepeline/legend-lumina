'use strict';
// Rona warna "sore keemasan" ala screenshot Dimraeth pemilik (v1.47.0): seluruh layar luar-ruang digeser ke kuning-zaitun hangat,
// bayangan lebih pekat, biru diredam, plus vinyet lembut. Angka matriks dicocokkan ke screenshot acuan
// (rata-rata acuan RGB 136/132/66, bayangan 43/40/23, terang 215/197/100).
// WebGL: ColorMatrix + Vignette di kamera (1 lintasan layar). Canvas: lapisan MULTIPLY. Mati di dalam ruangan, gua, salju, dan OPT.lite.
const GRADE_OFF = /^(snow|cave)/;
const GRADE_M = [1.15, .45, 0, 0, -14, 0, 1.14, 0, 0, -4, 0, .1, .55, 0, -2, 0, 0, 0, 1, 0];
function gradeOn(M) { return M && !M.indoor && !GRADE_OFF.test(M.id || '') && !OPT.lite && OPT.grade !== false; }
function gradeCam(sc, cam, on, vig) {
  if (sc.game.renderer.type !== Phaser.WEBGL || !cam.postFX) return false;
  cam.postFX.clear(); if (on) { cam.postFX.addColorMatrix().set(GRADE_M); if (vig) cam.postFX.addVignette(.5, .5, .92, .16); }
  return true;
}
{ const W = World.prototype, _cr = W.create;
  W.create = function () {
    const r = _cr.apply(this, arguments), on = gradeOn(this.M);
    if (!gradeCam(this, this.cameras.main, on, false) && on) {
      this.add.rectangle(0, 0, VW, VH, 0xffe2a0, .5).setOrigin(0).setScrollFactor(0).setDepth(9e6).setBlendMode(Phaser.BlendModes.MULTIPLY);
    }
    if (!this._gradeHook) { /* lapisan tanah (scene GL terpisah) ikut dirona sesuai wilayah aktif; vinyet cukup di tanah */
      this._gradeHook = 1;
      this.events.on('postupdate', () => {
        if (G.scene !== this) return; const gl = this.scene.get('GL'), key = this.M.id + (gradeOn(this.M) ? '+' : '-');
        if (gl && gl.cameras && gl.cameras.main && gl._gradeKey !== key) { gl._gradeKey = key; gradeCam(gl, gl.cameras.main, gradeOn(this.M), true); }
      });
    }
    return r;
  };
}
