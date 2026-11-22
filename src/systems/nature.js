'use strict';
// ALAM — sebaran pohon mengikuti pola alami, satu baris pohon pembatas, semak & bunga bergoyang.
// 1) Sebaran (scatter M.trees/M.decor) memakai tanah yang TERLIHAT (kisi grass_edge), bukan jalur lama:
//    pohon hanya di rumput (≥ 2 kotak dari tanah/pasir/air), bergerombol (derau rumpun), lebih rapat di tepi air & tepi
//    peta, padang terbuka di antaranya; jenis pohon berpetak-petak (satu rumpun = satu jenis). Jumlah sama dengan dulu.
//    Semak tumbuh di bawah/tepi rumpun; batu & benda lain tetap, kecuali yang jatuh di air/jalan.
// 2) Pohon pembatas = SATU baris (borderTrees) di tepi yang menghadap luar dunia; tepi yang bersambung ke wilayah lain
//    terbuka. Hutan pengisi di luar dunia (wilds.js) tidak lagi berisi pohon (hemat render).
// 3) Semak/bunga Sprout bergoyang: strip frame (bagian atas bergeser, pangkal diam) + anim '<kunci>_bw_sway'.
const NATURE = {
  on: true, step: 14, edgeBand: 170, edgeBonus: .1, river: [2, 7], decoKeep: .35, decoNear: 96,
  grove: { big: 230, small: 90, seed: 517 }, species: 340,
  treeRx: /tree|pine|round|redwood|willow|apple|orange|pear/i, underRx: /bush|mush|fern/i,
  sway: { on: true, rx: /^sp(Bush|Berry|Sun|Flower|Sprout)/, frames: 6, fps: 4, amp: { spBush: 2, spBerry: 2, spSun: 2 } },
};
const natIsTree = t => NATURE.treeRx.test(t) || !!(typeof SPROUT_TREES !== 'undefined' && SPROUT_TREES.map[t]);
// jarak (kotak) ke air & ke bukan-rumput, BFS sekali per peta
function natureFields(M) {
  if (M._nat !== undefined) return M._nat;
  const E = typeof grassEdgeData === 'function' && grassEdgeData(M); if (!E || !E.grass) return null;
  const C = E.cols, R = E.rows, N = C * R;
  const bfs = src => {
    const d = new Int16Array(N).fill(999), q = [];
    for (let i = 0; i < N; i++) if (src(i)) { d[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) {
      const k = q[h], c = k % C, r = (k / C) | 0;
      for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const cc = c + i, rr = r + j; if (cc < 0 || rr < 0 || cc >= C || rr >= R) continue;
        const n = rr * C + cc; if (d[n] > d[k] + 1) { d[n] = d[k] + 1; q.push(n); }
      }
    }
    return d;
  };
  return (M._nat = { E, C, R, dW: bfs(i => E.Wm[i]), dN: bfs(i => !E.grass[i] || E.Wm[i]) });
}
// tapak benda besar (rumah, tembok, benteng, kios …) dari objek peta: [x0, y0, x1, y1] — hiasan & pohon tidak boleh menimpa
function natureFoot(L) {
  const out = [];
  for (const o of L) {
    const d = OBJ[o[0]]; if (!d || !d.col || d.col[0] < 40) continue;
    const hw = d.col[0] / 2 + 6, H = d.fade || d.mm ? Math.max(40, Math.min(170, d.col[0] * 1.4)) : d.col[1] + d.col[2] + 24;
    out.push([o[1] - hw, o[2] - H, o[1] + hw, o[2] + 12]);
  }
  return out;
}
const natInFoot = (F, x, y, px = 0, py = 0) => F.some(r => x > r[0] - px && x < r[2] + px && y > r[1] && y < r[3] + py);
// titik yang harus tetap terlihat (dermaga, perahu, peti, NPC, titik pancing, papan) dari wilayah ini & tetangga: [x, y, r] lokal
function natureKeep(M) {
  if (M._natK) return M._natK;
  const out = [], P = typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id], ox = P ? P[0] : 0, oy = P ? P[1] : 0;
  const benua = P && typeof BENUA !== 'undefined' && BENUA && typeof isOutdoorRegion === 'function';
  const ids = benua ? Object.keys(WORLD_POS).filter(isOutdoorRegion) : [M.id];
  for (const id of ids) {
    const N = MAPS[id], Q = P ? WORLD_POS[id] : [0, 0]; if (!N) continue;
    if (Q[0] > ox + M.w + 200 || Q[0] + N.w < ox - 200 || Q[1] > oy + M.h + 200 || Q[1] + N.h < oy - 200) continue;
    const add = (x, y, r) => { const X = x + Q[0] - ox, Y = y + Q[1] - oy; if (X > -r && Y > -r && X < M.w + r && Y < M.h + r) out.push([X, Y, r]); };
    for (const o of N.objs || []) if (/^(dock|dockboat|boat|sign|campfire|well|board)$/.test(o[0])) add(o[1], o[2], o[0] === 'dock' ? 90 : 56);
    for (const c of N.chests || []) add(c.x, c.y, 40);
    for (const n of N.npcs || []) add(n.x, n.y, 40);
    for (const f of N.fish || []) add(f[0], f[1], 52);
  }
  return (M._natK = out);
}
/* pohon (tajuk ±90 px di atas pangkal; raksasa ×1,5) tidak menutupi titik penting: pohon di selatan titik paling berbahaya */
const natKeepOk = (K, x, y, t) => {
  const g = /redwood/i.test(t) ? 1.5 : 1;
  return !K.some(([X, Y, r]) => Math.abs(x - X) < r * g && y - Y > -r * .5 && y - Y < r * 1.6 * g);
};
// kotak dalam (di dalam baris pembatas)
function natureBox(M) {
  const b = M.border;
  return b ? [b.left + 26, b.top + 40, b.right - 26, b.bottom - 6] : [40, 50, M.w - 40, M.h - 30];
}
function natureScatter(M, spec, base) {
  const F = natureFields(M); if (!F) return null;
  const { C, R, dW, dN } = F, S = GRASS_EDGE.cell, G = NATURE.grove, seed = (M.w * 7 + M.h) | 0;
  const cell = (x, y) => { const c = Math.floor(x / S), r = Math.floor(y / S); return c < 0 || r < 0 || c >= C || r >= R ? -1 : r * C + c; };
  const isForest = SCATTER_FOREST_RX.test(M.ground || '') || SCATTER_FOREST_RX.test(M.id || '');
  const isU = t => NATURE.underRx.test(t);
  const trees = base.filter(o => natIsTree(o[0])), under = base.filter(o => isU(o[0])), rest = base.filter(o => !natIsTree(o[0]) && !isU(o[0]));
  const tTypes = spec.types.filter(([t]) => natIsTree(t)), tSum = tTypes.reduce((a, [, p]) => a + p, 0);
  const foot = natureFoot(M.objs || []), keep = natureKeep(M);
  const clear = (x, y, tree) => !natInFoot(foot, x, y, tree ? 30 : 0, tree ? 70 : 0) && scatterClearBase(M, () => 999, [], null, [0, 0], x, y, { min: 0 });
  const [x0, y0, x1, y1] = natureBox(M), out = [];
  // sel spasial untuk jarak antarpohon
  const B = new Map(), bk = (x, y) => Math.floor(x / 64) + ',' + Math.floor(y / 64);
  const near = (x, y, r, rx) => {
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) for (const o of B.get((Math.floor(x / 64) + i) + ',' + (Math.floor(y / 64) + j)) || []) {
      if ((!rx || rx.test(o[0])) && Math.hypot(o[1] - x, o[2] - y) < r) return true;
    }
    return false;
  };
  const put = o => { out.push(o); const k = bk(o[1], o[2]); if (!B.has(k)) B.set(k, []); B.get(k).push(o); };
  for (const o of M.objs || []) if (natIsTree(o[0])) { const k = bk(o[1], o[2]); if (!B.has(k)) B.set(k, []); B.get(k).push(o); }
  // 1) pohon: kandidat berskor (rumpun + tepi air + tepi peta), diambil dari skor tertinggi
  if (trees.length && tTypes.length) {
    const cand = [], st = NATURE.step;
    for (let y = y0; y < y1; y += st) for (let x = x0; x < x1; x += st) {
      const X = x + (hash(x, y, seed) - .5) * st, Y = y + (hash(x, y, seed + 1) - .5) * st, k = cell(X, Y);
      if (k < 0 || dN[k] < 2 || dN[cell(X, Y - 20)] < 1) continue; /* batang & tajuk di rumput */
      let s = vnoise(X, Y, G.big, G.seed + seed) * .62 + vnoise(X, Y, G.small, G.seed + seed + 1) * .38;
      const w = dW[k]; if (w >= NATURE.river[0] && w <= NATURE.river[1]) s += .32 * (1 - (w - NATURE.river[0]) / (NATURE.river[1] - NATURE.river[0] + 1));
      const de = Math.min(X - x0, x1 - X, Y - y0, y1 - Y); if (de < NATURE.edgeBand) s += NATURE.edgeBonus * (1 - de / NATURE.edgeBand);
      cand.push([s + hash(x, y, seed + 2) * .1, X, Y]);
    }
    cand.sort((a, b) => b[0] - a[0]);
    const sp = Math.round((spec.sp || 52) * (isForest ? .82 : .92));
    for (const [, x, y] of cand) {
      if (out.length >= trees.length) break;
      if (near(x, y, sp, NATURE.treeRx) || !clear(x, y, 1)) continue;
      let r = vnoise(x, y, NATURE.species, seed + 9) * tSum, t = tTypes[0][0]; /* jenis berpetak */
      for (const [tt, p] of tTypes) { if (r < p) { t = tt; break; } r -= p; }
      if (!natKeepOk(keep, x, y, t)) continue;
      const snowy = M.id === 'meadow' && y > M.h - 400 && hash(Math.round(x), Math.round(y), 33) < (y - (M.h - 400)) / 400;
      if (snowy && /verdant_tree|treeA|treeB/.test(t)) t = 'pine'; /* dekat Puncak Beku → pinus */
      put([t, Math.round(x), Math.round(y)]);
    }
  } else for (const o of trees) put(o);
  // 2) semak/jamur: di bawah & tepi rumpun (cincin 26–70 px dari pohon)
  const host = out.length ? out : (M.objs || []).filter(o => natIsTree(o[0]));
  let n = 0;
  for (const o of under) {
    let done = false;
    for (let a = 0; a < 14 && !done && host.length; a++, n++) {
      const h = host[Math.floor(hash(n, 1, seed + 5) * host.length)], ang = hash(n, 2, seed + 5) * 6.283, d = 26 + hash(n, 3, seed + 5) * 44;
      const x = Math.round(h[1] + Math.cos(ang) * d), y = Math.round(h[2] + Math.sin(ang) * d * .7 + 10), k = cell(x, y);
      if (k < 0 || dN[k] < 1 || x < x0 || x > x1 || y < y0 || y > y1 || near(x, y, 26) || !clear(x, y)) continue;
      put([o[0], x, y, ...o.slice(3)]); done = true;
    }
  }
  // 3) lainnya (batu, pot, …) tetap, asal tidak di air
  for (const o of rest) { const k = cell(o[1], o[2]); if (k >= 0 && !F.E.Wm[k] && !near(o[1], o[2], 22) && !natInFoot(foot, o[1], o[2])) put(o); }
  return out;
}
// pohon yang berdiri di tanah/pasir/air (data peta lama): geser ke rumput terdekat (≤ 4 kotak), buang bila di air tanpa rumput
function natureTreesOnGrass(M, L) {
  const F = natureFields(M); if (!F) return L;
  const { C, R, dN, E } = F, S = GRASS_EDGE.cell, [x0, y0, x1, y1] = natureBox(M), out = [];
  const at = (c, r) => c < 0 || r < 0 || c >= C || r >= R ? 0 : dN[r * C + c];
  for (const o of L) {
    if (!natIsTree(o[0]) || o[1] < x0 || o[1] > x1 || o[2] < y0 || o[2] > y1) { out.push(o); continue; }
    const c = Math.floor(o[1] / S), r = Math.floor((o[2] - 4) / S);
    if (at(c, r) >= 1) { out.push(o); continue; }
    let best = null;
    for (let d = 1; d <= 4 && !best; d++) for (let j = -d; j <= d && !best; j++) for (let i = -d; i <= d; i++) {
      if (Math.max(Math.abs(i), Math.abs(j)) !== d || at(c + i, r + j) < 2) continue; best = [i, j]; break;
    }
    if (best) out.push([o[0], o[1] + best[0] * S, o[2] + best[1] * S, ...o.slice(3)]);
    else if (!E.Wm[r * C + c]) out.push(o);
  }
  return out;
}
// pohon pembatas: satu baris; buang yang menghadap wilayah lain (benua) atau berdiri di air
function natureBorder(M, L) {
  if (typeof WORLD_POS === 'undefined' || !WORLD_POS[M.id] || typeof regionOwner !== 'function' || !(typeof BENUA !== 'undefined' && BENUA)) return L;
  const [ox, oy] = WORLD_POS[M.id];
  return L.filter(o => {
    const x = o[1], y = o[2], dl = x, dr = M.w - x, dt = y, db = M.h - y, m = Math.min(dl, dr, dt, db);
    const out = m === dl ? [ox - 24, oy + y] : m === dr ? [ox + M.w + 24, oy + y] : m === dt ? [ox + x, oy - 24] : [ox + x, oy + M.h + 24];
    return !regionOwner(out[0], out[1]) && regionOwner(ox + x, oy + y) === M.id;
  });
}
(() => {
  if (!NATURE.on) return;
  if (typeof MAPS !== 'undefined' && MAPS.river && !MAPS.river.border) { /* Jalur Sungai dulu tanpa baris pembatas (hanya hutan pengisi) */
    MAPS.river.border = { top: 30, bottom: 970, left: 40, right: 2560, gapL: [500, 560], gapR: [450, 510], types: ['treeA', 'treeB', 'pine'] };
  }
  const _sc0 = scatter;
  scatter = function (M, spec) {
    const base = _sc0.apply(this, arguments);
    if (!M || M.indoor || typeof GRASS_EDGE === 'undefined' || !GRASS_EDGE.maps.includes(M.id)) return base;
    try { return natureScatter(M, spec, base) || base; } catch (e) { console.warn('nature', e); return base; }
  };
  if (typeof sproutDecoFor === 'function') { /* semak/jamur hiasan Sprout: kebanyakan di dekat pohon, jarang di padang terbuka */
    const _sd0 = sproutDecoFor;
    sproutDecoFor = function (M, base) {
      const L = _sd0.apply(this, arguments); if (!L) return L;
      const T = base.filter(o => natIsTree(o[0])), R = NATURE.decoNear, foot = natureFoot(base);
      return L.filter(o => !natInFoot(foot, o[1], o[2]) && (!/^sp(Bush|Berry|Mush)/.test(o[0]) ||
        T.some(t => Math.abs(t[1] - o[1]) < R && Math.abs(t[2] - o[2]) < R) || hash(o[1], o[2], 611) < NATURE.decoKeep));
    };
  }
  const _mo0 = mapObjects;
  mapObjects = function (M) {
    const L = _mo0.apply(this, arguments);
    return M && !M.indoor && typeof GRASS_EDGE !== 'undefined' && GRASS_EDGE.maps.includes(M.id) ? natureTreesOnGrass(M, L) : L;
  };
  const _bt0 = borderTrees;
  borderTrees = function (M) {
    if (!M.border || !(typeof BENUA !== 'undefined' && BENUA) || typeof WORLD_POS === 'undefined' || !WORLD_POS[M.id]) return _bt0.apply(this, arguments);
    const b = M.border, T = b.types || ['pined', 'pine', 'round'], tp = (k, s2) => T[Math.floor(hash(k, 9, s2) * T.length)], out = [];
    const inGap = (g, v) => g && v > g[0] - 22 && v < g[1] + 22; let n = 0;
    for (let x = 24; x < M.w - 20; x += 64) {
      if (!inGap(b.gapT, x)) { n++; out.push([tp(n, 41), x + Math.round((hash(n, 2, 41) - .5) * 12), Math.max(16, b.top - 12)]); }
    }
    for (let y = b.top + 32; y < b.bottom - 16; y += 64) {
      if (!inGap(b.gapL, y)) { n++; out.push([tp(n, 42), Math.max(16, b.left - 16), y]); }
      if (!inGap(b.gapR, y)) { n++; out.push([tp(n, 42), Math.min(M.w - 16, b.right + 16), y]); }
    }
    for (let x = 32; x < M.w - 30; x += 64) if (!inGap(b.gap, x)) { n++; out.push([tp(n, 43), x + Math.round((hash(n, 2, 43) - .5) * 12), b.bottom + 24]); }
    const exs = mapDoors(M);
    return natureBorder(M, out.filter(o => !exs.some(ex => o[1] > ex.x - 56 && o[1] < ex.x + ex.w + 56 && o[2] > ex.y - 56 && o[2] < ex.y + ex.h + 64)));
  };
})();
// warna tumbuhan per biome (rawa: pohon, semak & bunga lebih suram/keruh), lewat setTint (gambar asli tetap)
const NATURE_TINT = { swamp: 0xa9b896, rx: /tree|pine|round|redwood|willow|bush|fern|^sp(Bush|Berry|Flower|Sprout|Mush|Sun|Tree)|reeds|cattail/i };
function natureBiomeTint(sc, s, o) {
  if (!s || !s.setTint || !o || !NATURE_TINT.rx.test(o[0] + ' ' + ((s.texture && s.texture.key) || ''))) return;
  const B = typeof BENUA !== 'undefined' && BENUA && typeof regionOwner === 'function';
  const id = B ? regionOwner(s.x, s.y) : sc.M && sc.M.id, t = NATURE_TINT[id];
  if (t) s.setTint(t);
}
// ── semak & bunga bergoyang ──
function natureSwayTex(sc, key) {
  const k = key + '_bw', T = sc.textures; if (T.exists(k)) return k;
  if (!T.exists(key)) return null;
  const src = T.get(key).getSourceImage(), w = src.width, h = src.height, F = NATURE.sway.frames, A = NATURE.sway.amp[key] || 1, P = A + 1;
  const [c0, x0] = mk(w, h); x0.drawImage(src, 0, 0); const d = x0.getImageData(0, 0, w, h).data;
  const FW = w + P * 2, [cv, x] = mk(FW * F, h), im = x.createImageData(FW * F, h), o = im.data, Hc = Math.round(h * .8);
  for (let f = 0; f < F; f++) {
    const ph = Math.sin(f / F * Math.PI * 2);
    for (let y = 0; y < h; y++) {
      const dx = y < Hc ? Math.round(A * ph * Math.pow((Hc - y) / Hc, 1.1)) : 0;
      for (let X = 0; X < w; X++) {
        const si = (y * w + X) * 4; if (!d[si + 3]) continue;
        const di = (y * FW * F + f * FW + X + P + dx) * 4; o[di] = d[si]; o[di + 1] = d[si + 1]; o[di + 2] = d[si + 2]; o[di + 3] = d[si + 3];
      }
    }
  }
  x.putImageData(im, 0, 0);
  const t = T.addCanvas(k, cv); for (let f = 0; f < F; f++) t.add(f, 0, f * FW, 0, FW, h);
  const fr = [...Array(F).keys()].map(i => ({ key: k, frame: i }));
  if (!sc.anims.exists(k + '_sway')) sc.anims.create({ key: k + '_sway', frames: fr, frameRate: NATURE.sway.fps, repeat: -1 });
  return k;
}
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _spawn0 = W.spawnObj, _up0 = W.update;
  W.spawnObj = function (o) {
    const s = _spawn0.apply(this, arguments);
    natureBiomeTint(this, s, o);
    const key = s && s.texture && s.texture.key;
    if (!s || !NATURE.sway.on || (typeof OPT !== 'undefined' && OPT.lite) || !key || !NATURE.sway.rx.test(key) || /_bw$/.test(key)) return s;
    const k = natureSwayTex(this, key); if (!k) return s;
    const x = o[1], y = o[2];
    s.setTexture(k, 0).play({ key: k + '_sway', startFrame: Math.abs(Math.round(x * 5 + y * 11)) % NATURE.sway.frames });
    s.anims.timeScale = .8 + Math.abs(Math.sin(x * 12.9898 + y * 78.233)) * .4;
    s._bw = 1; if (!(this.bushes || (this.bushes = [])).includes(s)) this.bushes.push(s); /* tetap bergoyang saat disentuh Arka */
    return s;
  };
  W.update = function (time, delta) {
    _up0.apply(this, arguments);
    this._bwT = (this._bwT || 0) - (delta || 16);
    if (this._bwT <= 0 && this.bushes) { this._bwT = 2000; this.bushes = this.bushes.filter(b => b.active); } /* objek petak yang dibuang */
  };
})();
