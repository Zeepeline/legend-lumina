'use strict';
// LETAK SESUAI TANAH — data peta lama (musuh, peti, NPC, titik pancing) dibuat untuk tanah lama; tanah sekarang = gambar peta.
// Sekali per wilayah (saat mapObjects pertama, gambar sudah dimuat), data diubah di tempat:
// - musuh/peti/NPC yang jatuh di air atau di dalam tembok/benda → digeser ke petak darat bebas terdekat (≤ PLACE_FIT.maxR kotak);
// - jalan lama (M.paths) yang menyeberangi air di gambar (dulu "arungan" yang bisa dilalui) → jembatan kayu otomatis
//   (BRIDGES.list ditambah; tembok air world_fit otomatis berlubang di jembatan);
// - titik pancing yang tidak di air / terlalu jauh dari darat → dipindah ke petak air di tepi darat terdekat (riak tetap di air,
//   Arka bisa menjangkaunya dari darat, jarak interaksi 26 px).
const PLACE_FIT = { on: true, pad: 6, maxR: 8, fishMax: 12, ford: { on: true, max: 200, gap: 90, side: 24 } };
function placeFitMap(M, L) {
  if (M._pf || !PLACE_FIT.on) return;
  const E = typeof grassEdgeData === 'function' && grassEdgeData(M); if (!E || !E.Wm) return;
  M._pf = 1;
  const S = GRASS_EDGE.cell, C = E.cols, R = E.rows, P = PLACE_FIT.pad, B = typeof BENUA !== 'undefined' && BENUA && WORLD_POS[M.id];
  const rects = [...mapWalls(M), ...blockRects(M)].map(w => [w[0], w[1], w[2], w[3]]);
  for (const o of L) { const d = OBJ[o[0]]; if (d && d.col && d.col[0]) rects.push([o[1] - d.col[0] / 2, o[2] - d.col[1] - d.col[2], d.col[0], d.col[1]]); }
  const wetC = (c, r) => c < 0 || r < 0 || c >= C || r >= R || !!E.Wm[r * C + c];
  const wet = (x, y) => wetC(Math.floor(x / S), Math.floor(y / S));
  const hit = (x, y) => rects.some(w => x > w[0] - P && x < w[0] + w[2] + P && y > w[1] - P && y < w[1] + w[3] + P);
  const mine = (x, y) => !B || (typeof regionOwner !== 'function') || regionOwner(B[0] + x, B[1] + y) === M.id;
  const bad = (x, y) => wet(x, y) || wet(x, y - 8) || hit(x, y);
  const free = (x, y) => { /* null = sudah baik / tak ada tempat */
    if (!bad(x, y)) return null;
    for (let d = 1; d <= PLACE_FIT.maxR; d++) for (let j = -d; j <= d; j++) for (let i = -d; i <= d; i++) {
      if (Math.max(Math.abs(i), Math.abs(j)) !== d) continue;
      const X = x + i * S, Y = y + j * S;
      if (X > 24 && Y > 24 && X < M.w - 24 && Y < M.h - 24 && !bad(X, Y) && mine(X, Y)) return [X, Y];
    }
    return null;
  };
  const log = [];
  for (const n of M.npcs || []) { const p = free(n.x, n.y); if (p) { log.push('npc ' + n.id); n.x = p[0]; n.y = p[1]; } }
  for (const e of M.enemies || []) { const p = free(e[1], e[2]); if (p) { log.push('musuh ' + e[0]); e[1] = p[0]; e[2] = p[1]; } }
  for (const c of M.chests || []) { const p = free(c.x, c.y); if (p) { log.push('peti ' + c.id); c.x = p[0]; c.y = p[1]; } }
  // titik pancing: petak air yang bertetangga dengan darat bebas
  const shore = (c, r) => wetC(c, r) && c >= 0 && r >= 0 && c < C && r < R &&
    [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([i, j]) => !wetC(c + i, r + j) && !hit((c + i) * S + S / 2, (r + j) * S + S / 2));
  for (const f of M.fish || []) {
    const c = Math.floor(f[0] / S), r = Math.floor(f[1] / S); if (shore(c, r)) continue;
    let best = null;
    for (let d = 1; d <= PLACE_FIT.fishMax && !best; d++) for (let j = -d; j <= d && !best; j++) for (let i = -d; i <= d; i++) {
      if (Math.max(Math.abs(i), Math.abs(j)) !== d || !shore(c + i, r + j) || !mine((c + i) * S + 8, (r + j) * S + 8)) continue; best = [c + i, r + j]; break;
    }
    if (best) { log.push('pancing ' + f[0] + ',' + f[1]); f[0] = best[0] * S + S / 2; f[1] = best[1] * S + S / 2; }
  }
  if (log.length) M._pfLog = log; /* untuk pemeriksaan: MAPS[id]._pfLog */
}
// titik tengah penyeberangan jalan lama × air gambar (lokal); yang menyusuri tepi air (bukan menyeberang) dilewati
function pathCrossings(M, have) {
  if (M._xing) return M._xing;
  const E = typeof grassEdgeData === 'function' && grassEdgeData(M); if (!E || !E.Wm || !M.paths) return [];
  const S = GRASS_EDGE.cell, F = PLACE_FIT.ford, B = typeof BENUA !== 'undefined' && BENUA && WORLD_POS[M.id], out = [];
  const W = (x, y) => { const c = Math.floor(x / S), r = Math.floor(y / S); return c >= 0 && r >= 0 && c < E.cols && r < E.rows && !!E.Wm[r * E.cols + c]; };
  const rect = (x, y) => { /* kotak jembatan yang akan dibuat di titik ini */
    const b = typeof bridgeFit === 'function' && bridgeFit(M, x, y), h = BRIDGES.width / 2 + 8; if (!b) return null;
    return b.axis === 'v' ? [b.c - h, b.a, b.c + h, b.b] : [b.a, b.c - h, b.b, b.c + h];
  };
  const R = have.map(p => rect(p[0], p[1])).filter(Boolean);
  const taken = (x, y) => {
    const q = rect(x, y); if (!q) return true;
    if ([...have, ...out].some(p => Math.hypot(p[0] - x, p[1] - y) < F.gap)) return true;
    if (R.some(r => q[0] < r[2] && q[2] > r[0] && q[1] < r[3] && q[3] > r[1])) return true; /* tidak bertumpuk dengan jembatan lain */
    R.push(q); return false;
  };
  for (const p of M.paths) {
    const [x1, y1, x2, y2] = p, L = Math.hypot(x2 - x1, y2 - y1); if (L < 8) continue;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, n = Math.ceil(L / 8); let st = -1;
    for (let i = 0; i <= n + 1; i++) {
      const d = Math.min(i * 8, L), w = i <= n && W(x1 + ux * d, y1 + uy * d);
      if (w && st < 0) st = d;
      if (w || st < 0) continue;
      const a = st, b = Math.min((i - 1) * 8, L); st = -1;
      if (b - a > F.max) continue; /* jalan menyusuri air, bukan menyeberang */
      const m = (a + b) / 2, mx = x1 + ux * m, my = y1 + uy * m, q = F.side;
      if (!W(mx - uy * q, my + ux * q) || !W(mx + uy * q, my - ux * q)) continue; /* air harus berlanjut ke kedua sisi jalan */
      if (B && typeof regionOwner === 'function' && regionOwner(B[0] + mx, B[1] + my) !== M.id) continue;
      if (!taken(mx, my)) out.push([Math.round(mx), Math.round(my)]);
    }
  }
  return (M._xing = out);
}
(() => {
  if (!PLACE_FIT.ford.on || typeof BRIDGES === 'undefined' || typeof GRASS_EDGE === 'undefined') return;
  for (const id of GRASS_EDGE.maps) {
    const M = MAPS[id]; if (!M || !M.paths || (typeof WORLD_FIT !== 'undefined' && WORLD_FIT.iceFord.includes(id))) continue; /* es: dilalui langsung */
    const old = BRIDGES.list[id];
    BRIDGES.list[id] = m => { const base = old ? old(m) : []; return [...base, ...pathCrossings(m, base)]; };
  }
})();
(() => {
  const _mo0 = mapObjects;
  mapObjects = function (M) {
    const L = _mo0.apply(this, arguments);
    if (M && !M.indoor && typeof GRASS_EDGE !== 'undefined' && GRASS_EDGE.maps.includes(M.id)) {
      try { placeFitMap(M, L); } catch (e) { PLACE_FIT.on = false; console.warn('place_fit', e); }
    }
    return L;
  };
})();
