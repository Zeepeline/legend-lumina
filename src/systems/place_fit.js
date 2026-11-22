'use strict';
// LETAK SESUAI TANAH — data peta lama (musuh, peti, NPC, titik pancing) dibuat untuk tanah lama; tanah sekarang = gambar peta.
// Sekali per wilayah (saat mapObjects pertama, gambar sudah dimuat), data diubah di tempat:
// - musuh/peti/NPC yang jatuh di air atau di dalam tembok/benda → digeser ke petak darat bebas terdekat (≤ PLACE_FIT.maxR kotak);
// - jalan lama (M.paths) yang menyeberangi air di gambar (dulu "arungan" yang bisa dilalui) → jembatan kayu otomatis
//   (BRIDGES.list ditambah; tembok air world_fit otomatis berlubang di jembatan);
// - titik pancing yang tidak di air / terlalu jauh dari darat → dipindah ke petak air di tepi darat terdekat (riak tetap di air,
//   Arka bisa menjangkaunya dari darat, jarak interaksi 26 px).
const PLACE_FIT = { on: true, pad: 6, maxR: 8, fishMax: 12, ford: { on: true, max: 200, gap: 90, side: 24 },
  boatRx: /^(boat|dockboat)$/, padRx: /^lotuspad$/, reedRx: /^reeds$/, waterR: 12,
  /* penghalang alami yang jatuh di jalan tanah (bukan kota) → ke rumput tepi jalan */
  offPath: /^(rock|spRock|spRockB|pebbles|stump|stumpWoods|log|deadtree|orchidrock|verdant_rock_\w+|bush\w*|spBush|spBerry|spStump|spLog)$/ };
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
  placeWaterObjs(M, L, E, mine, log);
  const ents = [...(M.enemies || []).map(e => [e[1], e[2]]), ...(M.npcs || []).map(n => [n.x, n.y]), ...(M.chests || []).map(c => [c.x, c.y])];
  const clearOf = (x, y) => !ents.some(([X, Y]) => Math.hypot(X - x, Y - y) < 24); /* jangan menimpa musuh/NPC/peti */
  if (!/^k/.test(M.id)) placeOffPath(M, L, E, (x, y) => !hit(x, y) && mine(x, y) && clearOf(x, y), log);
  if (log.length) M._pfLog = log; /* untuk pemeriksaan: MAPS[id]._pfLog */
}
// batu/tunggul/semak di jalan tanah → rumput terdekat (≤ 3 kotak); hiasan Sprout yang tak punya tempat dibuang
function placeOffPath(M, L, E, free, log) {
  const S = GRASS_EDGE.cell, C = E.cols, R = E.rows, at = (c, r) => c >= 0 && r >= 0 && c < C && r < R ? r * C + c : -1;
  const onPath = k => k >= 0 && !E.Wm[k] && !E.grass[k] && !E.strip[k];
  const grass = k => k >= 0 && E.grass[k] && !E.Wm[k];
  for (const o of L.slice()) {
    if (!PLACE_FIT.offPath.test(o[0])) continue;
    const c = Math.floor(o[1] / S), r = Math.floor((o[2] - 3) / S); if (!onPath(at(c, r))) continue;
    let best = null;
    for (let d = 1; d <= 3 && !best; d++) for (let j = -d; j <= d && !best; j++) for (let i = -d; i <= d; i++) {
      const X = (c + i) * S + S / 2, Y = (r + j) * S + 12;
      if (Math.max(Math.abs(i), Math.abs(j)) !== d || !grass(at(c + i, r + j)) || !free(X, Y)) continue; best = [X, Y]; break;
    }
    if (best) { log.push('jalan ' + o[0]); o[1] = best[0]; o[2] = best[1]; continue; }
    if (/^sp|^pebbles$/.test(o[0]) && M._list) { const i = M._list.indexOf(o); if (i >= 0) { M._list.splice(i, 1); log.push('buang ' + o[0]); } }
  }
}
// benda air: dermaga (pangkal di darat, menjorok ke air di utara), perahu & teratai di air, buluh di tepi air
function placeWaterObjs(M, L, E, mine, log) {
  const S = GRASS_EDGE.cell, C = E.cols, R = E.rows, PF = PLACE_FIT;
  const W = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !!E.Wm[r * C + c], Lnd = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !E.Wm[r * C + c];
  const near = (c0, r0, ok) => { /* sel terdekat (cincin demi cincin) yang memenuhi ok */
    const fine = (c, r) => ok(c, r) && mine(c * S + 8, r * S + 14); /* titik akhir (r·S+14) harus di wilayah sendiri */
    if (fine(c0, r0)) return [c0, r0];
    for (let d = 1; d <= PF.waterR; d++) for (let j = -d; j <= d; j++) for (let i = -d; i <= d; i++) {
      if (Math.max(Math.abs(i), Math.abs(j)) === d && fine(c0 + i, r0 + j)) return [c0 + i, r0 + j];
    }
    return null;
  };
  const move = (o, x, y, what) => { if (o[1] === x && o[2] === y) return; log.push(what + ' ' + o[1] + ',' + o[2]); o[1] = x; o[2] = y; };
  const docks = [];
  for (const o of L) if (o[0] === 'dock') {
    const ok = (c, r) => Lnd(c, r) && Lnd(c - 1, r) && Lnd(c + 1, r) && W(c, r - 2) && W(c - 1, r - 2) && W(c + 1, r - 2) && W(c, r - 3);
    const p = near(Math.floor(o[1] / S), Math.floor((o[2] - 2) / S), ok);
    if (p) move(o, p[0] * S + S / 2, p[1] * S + 14, 'dermaga');
    docks.push([o[1] - 24, o[2] - 60, o[1] + 24, o[2] + 4]);
  }
  const onDock = (x, y) => docks.some(d => x > d[0] - 22 && x < d[2] + 22 && y > d[1] && y < d[3] + 8);
  for (const o of L) {
    const c0 = Math.floor(o[1] / S), r0 = Math.floor((o[2] - 6) / S);
    if (PF.boatRx.test(o[0])) {
      const ok = (c, r) => W(c - 1, r) && W(c, r) && W(c + 1, r) && [[0, 1], [0, 2], [-2, 0], [2, 0], [0, -1]].some(([i, j]) => Lnd(c + i, r + j)) &&
        !onDock(c * S + 8, r * S + 14);
      const p = near(c0, r0, ok); if (p) move(o, p[0] * S + S / 2, p[1] * S + 14, 'perahu');
    } else if (PF.padRx.test(o[0])) {
      const ok = (c, r) => W(c, r) && W(c - 1, r) && W(c + 1, r) && W(c, r - 1) && W(c, r + 1);
      const p = near(c0, r0, ok); if (p) move(o, p[0] * S + S / 2, p[1] * S + 12, 'teratai');
    } else if (PF.reedRx.test(o[0])) {
      const ok = (c, r) => Lnd(c, r) && [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]].some(([i, j]) => W(c + i, r + j));
      const p = near(c0, r0, ok); if (p) move(o, p[0] * S + S / 2, p[1] * S + 12, 'buluh');
    }
  }
  if (OBJ.dock && OBJ.dock.col) OBJ.dock.col = [0, 0, 0]; /* dermaga bisa dipijak (air di bawahnya dibuka world_fit) */
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
