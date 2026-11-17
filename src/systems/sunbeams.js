'use strict';
// T450: Sinar matahari pagi di hutan (jam 6-9 di forest/deepwood)
// 3-5 berkas cahaya miring (trapesium gradien kuning pucat, ADD, alpha 0.08-0.14) berayun pelan.
(function () {
  const BEAM_COUNT = 4;
  function ensureBeams(sc) {
    if (sc._sunbeams && sc._sunbeams.length === BEAM_COUNT && sc._sunbeams[0].active) return;
    (sc._sunbeams || []).forEach(b => b.destroy());
    sc._sunbeams = [];
    for (let i = 0; i < BEAM_COUNT; i++) {
      const g = sc.add.graphics().setScrollFactor(0).setDepth(1.95e5).setBlendMode(Phaser.BlendModes.ADD);
      sc._sunbeams.push(g);
    }
  }

  function drawTrapezoid(g, xTop, wTop, xBot, wBot, h, alpha, col = 0xfff4c2) {
    g.clear();
    if (alpha <= 0.005) return;
    g.fillStyle(col, alpha);
    g.beginPath();
    g.moveTo(xTop, 0);
    g.lineTo(xTop + wTop, 0);
    g.lineTo(xBot + wBot, h);
    g.lineTo(xBot, h);
    g.closePath();
    g.fillPath();
  }

  const origUpdAtmos = World.prototype.updAtmos;
  World.prototype.updAtmos = function (dt) {
    if (typeof origUpdAtmos === 'function') origUpdAtmos.call(this, dt);
    const mId = this.M && this.M.id;
    const isForest = mId === 'forest' || mId === 'deepwood';
    const isOutdoor = this.M && !this.M.indoor && !this.M.dark;
    const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
    // Pagi jam 6.0-9.0 di hutan ATAU Sore Senja Emas (jam 15.8-18.6) di padang/luar ruang ala Dimraeth
    let beamStrength = 0, beamCol = 0xfff4c2;
    if (isForest && h >= 6 && h <= 9) {
      beamStrength = 1 - Math.abs(h - 7.5) / 1.5;
      if (mId === 'deepwood') beamStrength *= 0.25; // Kanopi redwood sangat rapat, sinar matahari berkurang drastis
      beamCol = 0xfff4c2;
    } else if (isOutdoor && h >= 15.8 && h <= 18.6) {
      beamStrength = (1 - Math.abs(h - 17.2) / 1.4) * 0.92;
      if (mId === 'deepwood') beamStrength *= 0.2;
      beamCol = 0xffcb58;
    }

    if (beamStrength <= 0) {
      if (this._sunbeams) {
        this._sunbeams.forEach(b => { if (b.active) b.clear(); });
      }
      return;
    }

    ensureBeams(this);
    const w = (typeof VW !== 'undefined' ? VW : 480);
    const vh = (typeof VH !== 'undefined' ? VH : 270);
    const t = this.t || 0;

    for (let i = 0; i < BEAM_COUNT; i++) {
      const g = this._sunbeams[i];
      if (!g || !g.active) continue;
      const sway = Math.sin(t * 0.8 + i * 1.6) * 16;
      const baseAlpha = 0.08 + (i % 2) * 0.04; // 0.08 - 0.12
      const alpha = baseAlpha * beamStrength;
      const xTop = (w / (BEAM_COUNT + 1)) * (i + 1) - 60 + sway;
      const wTop = 32 + (i % 3) * 12;
      const xBot = xTop + 70 + (i * 10);
      const wBot = wTop + 45;
      drawTrapezoid(g, xTop, wTop, xBot, wBot, vh, alpha, beamCol);
    }
  };
})();
