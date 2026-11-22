'use strict';
// EFEK AIR HIDUP gaya Sprout — riak melingkar, kilau matahari, buih ombak yang menyapu pasir.
// Hanya di peta ber-autotile (GRASS_EDGE.maps) dan hanya di dalam layar; maks WATER_FX.max sprite (kumpulan dipakai ulang).
// Letak air dibaca dari kisi grassEdgeData (Wm = kotak air, dep = jarak kotak ke daratan).
const WATER_FX = { on: true, ripple: 5, glint: 10, wave: 8, max: 50, line: '#fbfefa', glintC: '#f6fbf2' }; /* jumlah per detik */
function waterFxTex(sc) {
  const T = sc.textures; if (T.exists('wfx_ring')) return;
  { /* riak: 5 frame elips makin besar & putus-putus */
    const [c, x] = mk(24 * 5, 11); x.fillStyle = WATER_FX.line;
    for (let f = 0; f < 5; f++) {
      const rx = 3 + f * 2.2, ry = 1.4 + f * 1, cx = f * 24 + 12, cy = 5;
      for (let a = 0; a < 64; a++) {
        if (f >= 3 && a % (f === 3 ? 4 : 3) === 0) continue; const t = a / 64 * Math.PI * 2;
        x.fillRect(Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), 1, 1);
      }
    }
    const t = T.addCanvas('wfx_ring', c); for (let f = 0; f < 5; f++) t.add(f, 0, f * 24, 0, 24, 11);
  }
  { /* kilau: titik → garis 5 px → titik */
    const [c, x] = mk(7 * 3, 3); x.fillStyle = WATER_FX.glintC;
    x.fillRect(3, 1, 1, 1); x.fillRect(7 + 1, 1, 5, 1); x.fillRect(7 + 3, 0, 1, 3); x.fillRect(14 + 2, 1, 3, 1);
    const t = T.addCanvas('wfx_glint', c); for (let f = 0; f < 3; f++) t.add(f, 0, f * 7, 0, 7, 3);
  }
  { /* buih ombak: garis 14 px bergelombang */
    const [c, x] = mk(14, 3); x.fillStyle = WATER_FX.line;
    for (let i = 0; i < 14; i++) x.fillRect(i, i % 6 < 3 ? 1 : 0, 1, 1); x.fillRect(2, 2, 3, 1); x.fillRect(9, 2, 3, 1);
    T.addCanvas('wfx_wave', c);
  }
}
// kotak air di titik dunia → { E, c, r, k } atau null
function waterFxCell(sc, x, y) {
  const R = typeof sproutRegionAt === 'function' && sproutRegionAt(sc, x, y); if (!R) return null;
  const E = grassEdgeData(R[0]); if (!E || !E.Wm) return null;
  const S = GRASS_EDGE.cell, c = (R[1] / S) | 0, r = (R[2] / S) | 0, k = r * E.cols + c;
  return E.Wm[k] ? { E, c, r, k, lx: R[1], ly: R[2] } : null;
}
function waterFxSpawn(sc, kind) {
  const v = sc.cameras.main.worldView;
  for (let tries = 0; tries < 6; tries++) {
    const x = v.x + Math.random() * v.width, y = v.y + Math.random() * v.height, w = waterFxCell(sc, x, y); if (!w) continue;
    const dep = w.E.dep[w.k]; if (kind === 'ripple' && dep < 2) continue;
    let px = x, py = y, ang = 0, dx = 0, dy = 0;
    if (kind === 'wave') { /* ke sisi daratan terdekat dari kotak tepi */
      if (dep !== 1) continue; const E = w.E, C = E.cols, S = GRASS_EDGE.cell;
      const sides = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([i, j]) => {
        const cc = w.c + i, rr = w.r + j; return cc >= 0 && rr >= 0 && cc < C && rr < E.rows && !E.Wm[rr * C + cc];
      });
      if (!sides.length) continue; [dx, dy] = sides[(Math.random() * sides.length) | 0];
      const ox = x - w.lx, oy = y - w.ly, cx = w.c * S + S / 2, cy = w.r * S + S / 2;
      px = ox + cx + dx * 3 + (dy ? (Math.random() - .5) * 10 : 0); py = oy + cy + dy * 3 + (dx ? (Math.random() - .5) * 10 : 0); ang = dx ? 90 : 0;
    }
    const pool = sc._wfx || (sc._wfx = []); let it = pool.find(p => !p.on);
    if (!it) { if (pool.length >= WATER_FX.max) return; it = { s: sc.add.image(0, 0, 'wfx_ring', 0).setDepth(-1e6 + 5) }; pool.push(it); }
    const key = kind === 'ripple' ? 'wfx_ring' : kind === 'glint' ? 'wfx_glint' : 'wfx_wave';
    it.on = 1; it.kind = kind; it.t = 0; it.life = kind === 'ripple' ? 1.3 : kind === 'glint' ? .7 : 1.6;
    it.x = Math.round(px); it.y = Math.round(py); it.dx = dx; it.dy = dy;
    it.s.setTexture(key, 0).setPosition(it.x, it.y).setAngle(ang).setAlpha(0).setVisible(true);
    return;
  }
}
function waterFxStep(sc, dt) {
  if (!WATER_FX.on || !sc.M || (typeof OPT !== 'undefined' && OPT.lite)) return;
  if (typeof G !== 'undefined' && G.scene && G.scene !== sc) return;
  if (!sc.M.benua && !GRASS_EDGE.maps.includes(sc.M.id)) return;
  if (sc._wfx && sc._wfx.length && !sc._wfx[0].s.scene) { sc._wfx = []; sc._wfxA = null; } /* scene dimulai ulang */
  waterFxTex(sc); const acc = sc._wfxA || (sc._wfxA = { ripple: 0, glint: 0, wave: 0 });
  for (const k in acc) { acc[k] += dt * WATER_FX[k]; while (acc[k] >= 1) { acc[k]--; waterFxSpawn(sc, k); } }
  for (const it of sc._wfx || []) {
    if (!it.on) continue; it.t += dt; const p = it.t / it.life;
    if (p >= 1) { it.on = 0; it.s.setVisible(false); continue; }
    if (it.kind === 'ripple') it.s.setFrame(Math.min(4, (p * 5) | 0)).setAlpha(p < .15 ? p / .15 : 1 - (p - .15) / .85);
    else if (it.kind === 'glint') it.s.setFrame(p < .3 ? 0 : p < .7 ? 1 : 2).setAlpha(Math.sin(p * Math.PI));
    else { /* buih: maju ke pasir lalu surut sambil memudar */
      const m = Math.sin(p * Math.PI) * 3; it.s.setPosition(it.x + it.dx * m, it.y + it.dy * m).setAlpha(Math.sin(p * Math.PI) * .9);
    }
  }
}
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _up0 = W.update;
  W.update = function (time, delta) {
    _up0.apply(this, arguments);
    try { waterFxStep(this, Math.min(.1, (delta || 16) / 1000)); } catch (e) { WATER_FX.on = false; console.warn('water_fx', e); }
  };
})();
