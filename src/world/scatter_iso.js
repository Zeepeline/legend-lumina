'use strict';
// Penempatan pohon & vegetasi isometrik 2.5D: Variable-Radius Poisson-Disc, fBm Groves situasional, dan Asymmetric South Clearance.
const SCATTER_FOREST_RX = /forest|deepwood|swamp/i;
const SCATTER_TREE_RX = /tree|pine|round/i;

function scatterGroveNoise(x, y) {
  return vnoise(x, y, 160, 93) * .65 + vnoise(x, y, 70, 112) * .35;
}

function scatterClearBase(M, sd, ponds, R, gxy, x, y, spec) {
  const d = sd(x, y);
  if (spec.near) { if (d < spec.near[0] || d > spec.near[1]) return false; }
  else if (d < spec.min) return false;
  if (R && Math.abs(y - riverY(R, x)) < R.w / 2 + 16) return false;
  if (ponds.length && waterE(ponds, x, y, gxy[0], gxy[1]) < 1.25) return false;
  for (const o of M.objs) if (Math.hypot(o[1] - x, o[2] - y) < (OBJ[o[0]].mm ? 70 : 26)) return false;
  for (const c of M.chests || []) if (Math.hypot(c.x - x, c.y - y) < 30) return false;
  for (const c of M.calm || []) if (Math.hypot(c[0] - x, c[1] - y) < c[2]) return false; /* area bebas hiasan acak (mis. lapangan Garnisun) */
  for (const f of M.fish || []) if (Math.hypot(f[0] - x, f[1] - y) < 34) return false;
  if (M.gate) {
    const g = M.gate;
    if (Math.hypot(g.boulder[0] - x, g.boulder[1] - y) < 40 || Math.hypot(g.plate[0] - x, g.plate[1] - y) < 40 ||
      Math.hypot(g.x - x, g.y - y) < 40) return false;
  }
  for (const e of M.enemies || []) if (Math.hypot(e[1] - x, e[2] - y) < 22) return false;
  for (const n of M.npcs || []) if (Math.hypot(n.x - x, n.y - y) < 30) return false;
  for (const B of M.bosses || []) {
    const z = B.zone;
    if (x > z[0] - 20 && x < z[0] + z[2] + 20 && y > z[1] - 20 && y < z[1] + z[3] + 30) return false;
  }
  if (M.ring && Math.hypot(x - M.ring.cx, y - M.ring.cy) < M.ring.r + 22) return false;
  if (M.mochi && Math.hypot(x - M.mochi.x, y - M.mochi.y) < 30) return false;
  for (const ex of mapDoors(M)) if (x > ex.x - 64 && x < ex.x + ex.w + 64 && y > ex.y - 64 && y < ex.y + ex.h + 72) return false;
  return true;
}

// Jarak pandang selatan setengah bar (asymmetric isometric clearance): pohon tinggi tidak menutup jalan/sungai/rumah dari depan
function scatterSouthClear(M, sd, ponds, R, gxy, x, y) {
  if (R && y > riverY(R, x) && y - riverY(R, x) < R.w / 2 + 40) return false;
  if (ponds.length && waterE(ponds, x, y - 24, gxy[0], gxy[1]) < 1.25) return false;
  if (sd(x, y - 22) < 0 && sd(x, y) < 22) return false;
  for (const o of M.objs) if (OBJ[o[0]].mm && y > o[2] && Math.hypot(o[1] - x, o[2] - y) < 88) return false;
  return true;
}

function scatterPoissonOk(out, x, y, isT, minSp, isForest) {
  if (!isT) {
    for (const t of out) if (Math.hypot(t[1] - x, t[2] - y) < minSp) return false;
    return true;
  }
  let grp = 0;
  const maxGrp = isForest ? 4 : 3;
  for (const t of out) {
    if (!SCATTER_TREE_RX.test(t[0])) continue;
    const dt = Math.hypot(t[1] - x, t[2] - y);
    if (dt < minSp) return false;
    if (dt <= 82) { grp++; if (grp >= maxGrp) return false; }
  }
  for (const t of out) {
    if (!SCATTER_TREE_RX.test(t[0])) continue;
    const dt = Math.hypot(t[1] - x, t[2] - y);
    if (dt > 82 && dt < 118) {
      let c = 0;
      for (const o of out) if (SCATTER_TREE_RX.test(o[0]) && Math.hypot(t[1] - o[1], t[2] - o[2]) <= 82) c++;
      if (c >= maxGrp) return false;
    }
  }
  return true;
}

function scatter(M, spec) {
  const sd = makeSD(M), out = [], R = M.river, ponds = pondsAll(M), gxy = waterGXY(M);
  const isForest = SCATTER_FOREST_RX.test(M.ground || '') || SCATTER_FOREST_RX.test(M.id || '');
  const clump = !!M._paths0 && !spec.near;
  const densMul = isForest ? 1.45 : (clump ? 1.15 : 1.0);
  const tries = Math.min(Math.round(spec.n * densMul), 950);
  const groveThresh = isForest ? .26 : .38;

  for (let n = 0; n < tries; n++) {
    const x = 24 + hash(n, 1, 31 + M.w) * (M.w - 48);
    const y = 44 + hash(n, 2, 31 + M.w) * (M.h - 48);
    if (clump && scatterGroveNoise(x, y) < groveThresh && hash(n, 8, 31) > .18) continue;

    let r = hash(n, 3, 31), type = spec.types[0][0];
    for (const [t, p] of spec.types) { if (r < p) { type = t; break; } r -= p; }
    const isT = SCATTER_TREE_RX.test(type);
    const edge = !spec.near && (x < 70 || x > M.w - 70 || y > M.h - 50);
    if (edge && sd(x, y) < 10) continue;

    if (!scatterClearBase(M, sd, ponds, R, gxy, x, y, spec)) continue;
    if (isT && !scatterSouthClear(M, sd, ponds, R, gxy, x, y)) continue;

    const minSp = isT ? Math.round((spec.sp || 52) * (isForest ? .85 : 1.0)) : (spec.sp || 26);
    if (!scatterPoissonOk(out, x, y, isT, minSp, isForest)) continue;

    if (M.id === 'meadow' || M.id === 'pl_meadow_snow') {
      const distToSnow = M.id === 'meadow' ? Math.max(0, y - (M.h - 400)) : Math.max(0, 400 - y);
      if (distToSnow > 0 && hash(n, 7, 33) < distToSnow / 400 && (type === 'verdant_tree' || type === 'treeA' || type === 'treeB')) type = 'pine';
    }
    out.push([type, Math.round(x), Math.round(y)]);
  }
  return out;
}
