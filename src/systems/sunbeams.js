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
    if (this._sunbeams) {
      this._sunbeams.forEach(b => { if (b.active) b.destroy(); });
      this._sunbeams = [];
    }
  };
})();
