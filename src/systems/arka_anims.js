// Pose Arka tambahan: pick (tambang/panen), hoe (kebun/gali), sleep (tidur), fish_pull (di juice.js + fishing.js).
// Memakai pl._emote (dibaca heroFrame, gfx/hero_arka.js). Selalu berbatas waktu `t` agar tak pernah menyangkut.
function arkaPose(sc, k, t, fps) {
  const pl = sc && sc.pl; if (!pl || !pl.active || pl.dead || sc.fishing || typeof IMGEL === 'undefined' || !IMGEL.hero_arka) return;
  if (pl._emote && pl._emote.k !== k && pl._emote.t == null) return; // jangan menimpa pose tanpa batas waktu
  if (pl.dir === 'left' || pl.dir === 'right') pl.flipX = pl.dir === 'left';
  pl._emote = { k, fps: fps || 8, loop: 1, t };
}
{ const W = World.prototype;
  const wrap = (name, k, t, fps, ok) => {
    const f = W[name]; if (typeof f !== 'function' || f._arka) return;
    W[name] = function () {
      try { if (!ok || ok.apply(this, arguments)) arkaPose(this, k, t, fps); } catch (e) { /* pose opsional */ }
      return f.apply(this, arguments);
    };
    W[name]._arka = 1;
  };
  wrap('jxNodePop', 'pick', .5, 9);
  wrap('tendPlot', 'hoe', .8, 8, function (i) { return this.plotState(i) !== 'grow'; });
  wrap('digTreasure', 'hoe', 1, 8);
  wrap('petDig', 'hoe', .8, 8);
  for (const n of Object.getOwnPropertyNames(W)) if (/^harvest[A-Z]/.test(n)) wrap(n, 'pick', .9, 8);
}
{ const slp0 = sleepToMorning; // layar sedang gelap saat dipanggil; pose tampak ketika fade-in
  sleepToMorning = function () { // eslint-disable-line no-global-assign
    if (typeof G !== 'undefined' && G.scene) arkaPose(G.scene, 'sleep', 2.2, 3);
    return slp0.apply(this, arguments);
  };
}
