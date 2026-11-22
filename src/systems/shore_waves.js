'use strict';
// OMBAK PANTAI — lapisan air tipis naik ke pasir, ujungnya berbuih putih, lalu surut meninggalkan pasir basah.
// Mengikuti bentuk petak pasir autotile (grass_edge.js tl.sand): tiap kotak daratan yang menempel air dapat sprite 16 px,
// frame dipilih dari waktu + fase posisi (ombak merambat di sepanjang pantai). Hanya kotak di layar yang diberi sprite.
const SHORE = { on: true, frames: 10, period: 2.6, reach: [0, 1, 2, 4, 5, 6, 6, 5, 3, 2], wet: 7,
  film: [214, 240, 228, .7], foam: [255, 255, 252, .95], dampC: [150, 120, 80, .22] };
// atlas: untuk tiap petak lembar (kolom, baris) yang dipakai sebagai tepi pasir → SHORE.frames frame 16×16
function shoreAtlas(sc) {
  if (shoreAtlas.idx) return shoreAtlas.idx;
  const sh = getTileData(GRASS_EDGE.sheet); if (!sh) return null;
  const list = []; for (const v of Object.values(GRASS_EDGE_MAP)) for (const [c, r] of v) if (!list.some(q => q[0] === c && q[1] === r)) list.push([c, r]);
  const F = SHORE.frames, [cv, x] = mk(16 * F, 16 * list.length), img = x.createImageData(16 * F, 16 * list.length), D = img.data, idx = {};
  list.forEach(([tc, tr], li) => {
    // jarak (piksel) dari tepi transparan petak ke dalam pasir
    const d = new Uint8Array(256); let any = 0;
    for (let i = 0; i < 256; i++) { const a = sh[((tr * 16 + (i >> 4)) * sh.w + tc * 16 + (i & 15)) * 4 + 3]; d[i] = a > 128 ? 99 : 0; if (!d[i]) any = 1; }
    if (!any) return; idx[tc + ',' + tr] = li;
    for (let it = 0; it < 8; it++) for (let i = 0; i < 256; i++) {
      if (!d[i]) continue; const y = i >> 4, xx = i & 15; let v = d[i];
      if (xx) v = Math.min(v, d[i - 1] + 1); if (xx < 15) v = Math.min(v, d[i + 1] + 1);
      if (y) v = Math.min(v, d[i - 16] + 1); if (y < 15) v = Math.min(v, d[i + 16] + 1); d[i] = v;
    }
    for (let f = 0; f < F; f++) {
      const r = SHORE.reach[f], back = f >= SHORE.reach.indexOf(Math.max(...SHORE.reach));
      for (let i = 0; i < 256; i++) {
        const dd = d[i]; if (!dd || dd > SHORE.wet) continue; let c = null;
        if (dd < r) c = SHORE.film; if (r && dd === r) c = SHORE.foam; else if (r && dd === r - 1 && f % 2) c = SHORE.foam;
        if (!c && back && dd > r && dd <= Math.max(...SHORE.reach)) c = SHORE.dampC;
        if (!c) continue; const o = ((li * 16 + (i >> 4)) * 16 * F + f * 16 + (i & 15)) * 4;
        D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = c[3] * 255;
      }
    }
  });
  x.putImageData(img, 0, 0); const t = sc.textures.exists('wfx_shore') ? null : sc.textures.addCanvas('wfx_shore', cv);
  if (t) list.forEach((q, li) => { for (let f = 0; f < F; f++) t.add(li * F + f, 0, f * 16, li * 16, 16, 16); });
  return (shoreAtlas.idx = idx);
}
// kotak daratan tepi air dalam satu wilayah → Map(k → indeks atlas)
function shoreCells(M) {
  const E = grassEdgeData(M); if (!E || !E.Wm) return null; if (E.shore) return E.shore;
  const A = shoreAtlas.idx, C = E.cols, R = E.rows, out = new Map(); if (!A) return null;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const k = r * C + c; if (E.Wm[k]) continue; let w = 0;
    for (let j = -1; j <= 1 && !w; j++) for (let i = -1; i <= 1; i++) {
      const cc = c + i, rr = r + j; if (cc >= 0 && rr >= 0 && cc < C && rr < R && E.Wm[rr * C + cc]) { w = 1; break; }
    }
    if (!w) continue; const a = A[E.tl.sand[k * 2] + ',' + E.tl.sand[k * 2 + 1]]; if (a !== undefined) out.set(k, a);
  }
  return (E.shore = out);
}
function shoreStep(sc, dt) {
  if (!SHORE.on || !sc.M || (typeof OPT !== 'undefined' && OPT.lite)) return;
  if (typeof G !== 'undefined' && G.scene && G.scene !== sc) return;
  if (!shoreAtlas(sc)) return;
  if (sc._shoreOn && sc._shoreOn.size && ![...sc._shoreOn.values()][0].scene) { sc._shoreOn = null; sc._shorePool = null; } /* scene dimulai ulang */
  const on = sc._shoreOn || (sc._shoreOn = new Map()), pool = sc._shorePool || (sc._shorePool = []);
  const v = sc.cameras.main.worldView, S = GRASS_EDGE.cell, F = SHORE.frames, t = (sc._shoreT = (sc._shoreT || 0) + dt), seen = new Set();
  const regs = sc.M.benua ? GRASS_EDGE.maps.map(id => [MAPS[id], WORLD_POS[id]]) : GRASS_EDGE.maps.includes(sc.M.id) ? [[sc.M, [0, 0]]] : [];
  for (const [M, P] of regs) {
    if (!M || !P || v.right < P[0] || v.bottom < P[1] || v.x > P[0] + M.w || v.y > P[1] + M.h) continue;
    const cells = shoreCells(M); if (!cells) continue; const E = grassEdgeData(M);
    const c0 = Math.max(0, ((v.x - P[0]) / S | 0) - 1), c1 = Math.min(E.cols - 1, ((v.right - P[0]) / S | 0) + 1);
    const r0 = Math.max(0, ((v.y - P[1]) / S | 0) - 1), r1 = Math.min(E.rows - 1, ((v.bottom - P[1]) / S | 0) + 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const k = r * E.cols + c, a = cells.get(k); if (a === undefined) continue;
      const key = M.id + ':' + k; seen.add(key); let s = on.get(key);
      if (!s) {
        s = pool.pop() || sc.add.image(0, 0, 'wfx_shore', 0).setOrigin(0).setDepth(-1e6 + 4);
        s.setVisible(true).setPosition(P[0] + c * S, P[1] + r * S); on.set(key, s);
      }
      const ph = vnoise(c * 16, r * 16, 90, 41) * 2.2 + (c + r) * .07; /* fase: ombak merambat & tidak serempak */
      s.setFrame(a * F + (Math.floor(((t / SHORE.period) + ph) * F) % F + F) % F);
    }
  }
  for (const [key, s] of on) if (!seen.has(key)) { s.setVisible(false); pool.push(s); on.delete(key); }
}
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _up0 = W.update;
  W.update = function (time, delta) {
    _up0.apply(this, arguments);
    try { shoreStep(this, Math.min(.1, (delta || 16) / 1000)); } catch (e) { SHORE.on = false; console.warn('shore_waves', e); }
  };
})();
