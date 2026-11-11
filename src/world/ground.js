'use strict';
// Generator tanah, tabrakan grid, penyebar pohon
// ---------------- generator tanah ----------------
function riverY(R, x) { return R.y + Math.sin(x * R.k) * R.amp + Math.sin(x * R.k * 2.7 + 1) * R.amp * .3; }
function makeSD(M) {
  const caps = M.paths || [], discs = M.discs || [], rings = M.rings || [];
  return (x, y) => {
    let d = 1e9;
    for (const [x1, y1, x2, y2, r] of caps) {
      const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy; let t = L ? ((x - x1) * dx + (y - y1) * dy) / L : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x - (x1 + dx * t), ey = y - (y1 + dy * t); const v = Math.sqrt(ex * ex + ey * ey) - r; if (v < d) d = v;
    }
    for (const [cx, cy, r] of discs) { const v = Math.hypot(x - cx, y - cy) - r; if (v < d) d = v; }
    for (const [cx, cy, rx, ry, w] of rings) { const e = Math.hypot((x - cx) / rx, (y - cy) / ry); const v = Math.abs(e - 1) * (rx + ry) / 2 - w / 2; if (v < d) d = v; }
    return d;
  };
}
function pondE(P, x, y) { return Math.hypot((x - P[0]) / P[2], (y - P[1]) / P[3]); }
const GROUND = {
  village: { g: ['#7ec462', '#8ccf6c', '#98d877', '#a6e083'], edge: '#72b85c', path: 'stone', tuft: '#5fa84a', tuft2: '#b8ec98' },
  forest: { g: ['#3f7d2c', '#4f9234', '#5ea33c', '#6cb244'], edge: '#3a6e28', path: 'dirt', tuft: '#2f6420', tuft2: '#5aa03a' },
  meadow: { g: ['#8cc45e', '#9ccf66', '#aad870', '#b6de7a'], edge: '#7cb452', path: 'dirt', tuft: '#6aa846', tuft2: '#d0f08e' },
  swamp: { g: ['#4a6a4a', '#567a50', '#628858', '#507048'], edge: '#3e5a3e', path: 'dirt', tuft: '#3a5a3a', tuft2: '#8ab070' },
  cave: { g: ['#2c2834', '#332e3c', '#28242e', '#38323f'], path: 'cave' },
};
function genGround(M) {
  if (M.ground === 'room') return genRoom(M);
  const W = M.w, H = M.h, img = new ImageData(W, H), D = img.data, sd = makeSD(M), GP = GROUND[M.ground];
  const Gc = GP.g.map(h2r), glow = M.glow, cave = GP.path === 'cave';
  const STONE = ['#eae2d6', '#ddd4c9', '#f1ebe1', '#d2c8bd'].map(h2r), MORT = h2r('#b5b8a2'), MORT2 = h2r('#9ea38a');
  const CSTONE = ['#5a5466', '#524c5e', '#625c6e', '#4a4456'].map(h2r), CMORT = h2r('#2a2630');
  const DIRT = ['#c9a46e', '#ba9460', '#d8b47e', '#ad8656'].map(h2r);
  const EDGE = GP.edge ? h2r(GP.edge) : null, R = M.river, ponds = M.ponds || [];
  const put = (i, c, f = 0) => { let r = c[0], g = c[1], b = c[2]; if (f > 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } D[i] = r; D[i + 1] = g; D[i + 2] = b; D[i + 3] = 255; };
  const vor = (x, y, cell, s) => {
    const gx = Math.floor(x / cell), gy = Math.floor(y / cell); let d1 = 1e9, d2 = 1e9, id = 0, fx = 0, fy = 0;
    for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      const cx = gx + k, cy = gy + j, px2 = (cx + .15 + .7 * hash(cx, cy, s)) * cell, py2 = (cy + .15 + .7 * hash(cx, cy, s + 1)) * cell;
      const dd = Math.hypot(x - px2, y - py2); if (dd < d1) { d2 = d1; d1 = dd; id = cx * 7919 + cy; fx = px2; fy = py2; } else if (dd < d2) d2 = dd;
    }
    return { m: d2 - d1, id, v: (x - fx) + (y - fy) };
  };
  const water = (i, t, x, y) => { let c = t > .82 ? '#7cd0f0' : t > .55 ? '#4aa6e0' : '#3a8ed0'; const rp = Math.sin(x * .15 + y * .9) + Math.sin(x * .05 - y * .3) * 1.3; if (rp > 1.85 && t < .8) c = '#a8e8ff'; put(i, h2r(c)); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (R) {
      const ry = riverY(R, x), dv = Math.abs(y - ry), hw = R.w / 2;
      if (x >= R.bridge[0] && x <= R.bridge[1] && dv < hw + 5) {
        const bx = x - R.bridge[0], bw = R.bridge[1] - R.bridge[0];
        if (bx < 3 || bx > bw - 3) { put(i, h2r('#5e3b20')); continue; }
        const ly = (y + 1000) % 6; put(i, ly === 0 ? h2r('#6e4222') : ly === 1 ? h2r('#c8945a') : h2r('#a8703e'), (hash(x >> 3, Math.floor((y + 1000) / 6), 5) - .5) * .12); continue;
      }
      if (dv < hw) { water(i, dv / hw, x, y); continue; }
      if (dv < hw + 4) { put(i, h2r(dv < hw + 1.5 ? '#8a7a5a' : '#cdb684')); continue; }
    }
    let inPond = false;
    for (const P of ponds) { const e = pondE(P, x, y); if (e < 1) { water(i, e, x, y); inPond = true; break; } if (e < 1 + 5 / P[3]) { put(i, h2r(e < 1 + 2 / P[3] ? '#8a7a5a' : '#d6c08c')); inPond = true; break; } }
    if (inPond) continue;
    const d = sd(x, y);
    if (cave) {
      if (d < 0) { const v = vor(x, y, 9, 21); if (v.m < 1.2) { put(i, CMORT); continue; } put(i, CSTONE[Math.floor(hash(v.id, 3, 13) * 4)], v.v < -3 ? .14 : v.v > 3 ? -.12 : 0); continue; }
      // dinding batu
      const n = vnoise(x, y, 10, 5) * .6 + vnoise(x, y, 3, 6) * .4; let c = Gc[n < .35 ? 2 : n < .55 ? 0 : n < .72 ? 1 : 3];
      if (d < 3) c = h2r('#6e6680'); else if (d < 6) c = h2r('#4a4456');
      put(i, c); continue;
    }
    if (d < 0) {
      if (GP.path === 'dirt') { const n = vnoise(x, y, 6, 3), k = n < .3 ? 1 : n < .7 ? 0 : 2; let c = DIRT[k]; if (hash(x, y, 8) > .985) c = h2r('#8a7a6a'); put(i, c, d > -2 ? -.12 : 0); continue; }
      const v = vor(x, y, 7, 11);
      if (v.m < 1.25) { put(i, d > -1.5 ? MORT2 : MORT); continue; }
      put(i, STONE[Math.floor(hash(v.id, 3, 13) * 4)], v.v < -3 ? .2 : v.v > 2.5 ? -.06 : 0); continue;
    }
    const n = vnoise(x, y, 26, 1) * .55 + vnoise(x, y, 8, 2) * .45;
    let k = n < .33 ? 0 : n < .5 ? 1 : n < .68 ? 2 : 3, f = 0;
    if (glow) { const g = Math.max(0, 1 - Math.hypot(x - glow[0], (y - glow[1]) * 1.3) / glow[2]); f = g * g * .16; }
    if (d < 2.2) { put(i, EDGE, f * .5); continue; }
    if (d < 4 && hash(x, y, 4) > .5) k = Math.max(0, k - 1);
    put(i, Gc[k], f);
  }
  const [c, x] = mk(W, H); x.putImageData(img, 0, 0);
  const near = (X, Y) => { if (R && Math.abs(Y - riverY(R, X)) < R.w / 2 + 6) return true; for (const P of ponds) if (pondE(P, X, Y) < 1.15) return true; return false; };
  if (cave) {
    for (let n = 0; n < W * H / 260; n++) { const X = Math.floor(hash(n, 1, 22) * W), Y = Math.floor(hash(n, 2, 22) * H); const d = sd(X, Y); if (d > 2 && d < 60 && hash(n, 3, 22) > .6) { const col = hash(n, 4, 22) > .5 ? '#9a6aff' : '#5ac8ff'; px(x, col, X, Y); px(x, shade(col, .5), X, Y - 1); } else if (d < -4) { px(x, '#6a6476', X, Y); } }
    return c;
  }
  for (let n = 0; n < W * H / (M.flowers ? 60 : 90); n++) {
    const X = Math.floor(hash(n, 1, 21) * W), Y = Math.floor(hash(n, 2, 21) * H);
    if (sd(X, Y) < 3 || near(X, Y)) continue;
    const r = hash(n, 3, 21), forest = M.ground === 'forest';
    if (r < (M.flowers ? .55 : .78)) { px(x, GP.tuft, X, Y); px(x, GP.tuft, X - 1, Y - 1); px(x, GP.tuft, X + 1, Y - 1); px(x, GP.tuft2, X, Y - 2); }
    else if (r < .97 || forest) { const fl = ['#ffffff', '#ffd84a', '#ff8ac0', '#b48aea', '#ff6a5a'][Math.floor(hash(n, 4, 21) * 5)]; px(x, fl, X, Y - 1); px(x, fl, X - 1, Y); px(x, fl, X + 1, Y); px(x, fl, X, Y + 1); px(x, '#ffe27a', X, Y); }
    else { ellF(x, '#d6d0c4', X, Y, 2.5, 1.6); px(x, '#f0ece2', X - 1, Y - 1); }
  }
  for (const [gx, gy, gw, gh, t] of (M.gardens || [])) {
    fr(x, '#5e3b20', gx - 2, gy - 2, gw + 4, gh + 4); fr(x, '#8a5a32', gx, gy, gw, gh);
    for (let ry = gy + 5; ry < gy + gh - 2; ry += 12) {
      fr(x, '#6a4224', gx + 2, ry + 4, gw - 4, 3); fr(x, '#a8703e', gx + 2, ry + 3, gw - 4, 1);
      for (let cx = gx + 8; cx < gx + gw - 4; cx += 13) {
        const kind = (t + Math.floor(cx / 13) + Math.floor(ry / 12)) % 3;
        if (kind === 0) { ellF(x, '#3f8a34', cx, ry + 2, 5, 3.5); ellF(x, '#7cc84a', cx, ry + 1, 4, 2.6); ellF(x, '#b4ec7a', cx - 1, ry, 1.6, 1.2); }
        else if (kind === 1) { fr(x, '#ff8a2a', cx - 1, ry + 3, 3, 2); for (let l = -2; l <= 2; l++) fr(x, '#4f9a34', cx + l, ry - 2 + Math.abs(l), 1, 5 - Math.abs(l)); px(x, '#8ad85a', cx, ry - 2); }
        else { fr(x, '#b02a4a', cx - 2, ry + 2, 4, 3); fr(x, '#d84a6a', cx - 2, ry + 2, 2, 1); fr(x, '#3a7a2a', cx - 3, ry - 2, 2, 4); fr(x, '#5a9a3a', cx + 1, ry - 3, 2, 5); }
      }
    }
  }
  // teratai di kolam
  for (const P of ponds) for (let n = 0; n < 7; n++) { const a = hash(n, 1, 77) * 6.28, r = .3 + hash(n, 2, 77) * .5; const X = P[0] + Math.cos(a) * P[2] * r, Y = P[1] + Math.sin(a) * P[3] * r; ellF(x, '#3f8a34', X, Y, 4, 2.5); ellF(x, '#6cc04a', X - 1, Y - .5, 2.5, 1.5); if (n % 2) { px(x, '#ffb4d8', X + 1, Y - 1); px(x, '#ffffff', X + 2, Y - 1); } }
  return c;
}
// kotak tabrakan dari grid (dinding gua, kolam)
function blockRects(M) {
  const out = [], cs = 16, sd = makeSD(M), cave = M.ground === 'cave', ponds = M.ponds || [];
  if (!cave && !ponds.length) return out;
  for (let gy = 0; gy < Math.ceil(M.h / cs); gy++) {
    let run = -1;
    for (let gx = 0; gx <= Math.ceil(M.w / cs); gx++) {
      const x = gx * cs + 8, y = gy * cs + 8; let b = false;
      if (gx < Math.ceil(M.w / cs)) { if (cave && sd(x, y) > 5) b = true; for (const P of ponds) if (pondE(P, x, y) < .94) b = true; }
      if (b && run < 0) run = gx; if (!b && run >= 0) { out.push([run * cs, gy * cs, (gx - run) * cs, cs]); run = -1; }
    }
  }
  return out;
}
function scatter(M, spec) {
  const sd = makeSD(M), out = [], R = M.river, ponds = M.ponds || [];
  const ok = (x, y, t) => {
    const d = sd(x, y);
    if (spec.near) { if (d < spec.near[0] || d > spec.near[1]) return false; }
    else if (d < spec.min) return false;
    if (R && Math.abs(y - riverY(R, x)) < R.w / 2 + 14) return false;
    for (const P of ponds) if (pondE(P, x, y) < 1.25) return false;
    for (const o of M.objs) if (Math.hypot(o[1] - x, o[2] - y) < (OBJ[o[0]].mm ? 70 : 26)) return false;
    for (const c of M.chests || []) if (Math.hypot(c.x - x, c.y - y) < 30) return false;
    for (const f of M.fish || []) if (Math.hypot(f[0] - x, f[1] - y) < 34) return false;
    if (M.gate && (Math.hypot(M.gate.boulder[0] - x, M.gate.boulder[1] - y) < 40 || Math.hypot(M.gate.plate[0] - x, M.gate.plate[1] - y) < 40 || Math.hypot(M.gate.x - x, M.gate.y - y) < 40)) return false;
    for (const e of M.enemies || []) if (Math.hypot(e[1] - x, e[2] - y) < 22) return false;
    for (const n of M.npcs || []) if (Math.hypot(n.x - x, n.y - y) < 30) return false;
    for (const B of M.bosses || []) { const z = B.zone; if (x > z[0] - 20 && x < z[0] + z[2] + 20 && y > z[1] - 20 && y < z[1] + z[3] + 30) return false; }
    if (M.ring && Math.hypot(x - M.ring.cx, y - M.ring.cy) < M.ring.r + 22) return false;
    if (M.mochi && Math.hypot(x - M.mochi.x, y - M.mochi.y) < 30) return false;
    for (const ex of M.exits || []) if (x > ex.x - 30 && x < ex.x + ex.w + 30 && y > ex.y - 30 && y < ex.y + ex.h + 50) return false;
    for (const t of out) if (Math.hypot(t[1] - x, t[2] - y) < (spec.sp || 24)) return false;
    return true;
  };
  for (let n = 0; n < spec.n; n++) {
    const x = 20 + hash(n, 1, 31 + M.w) * (M.w - 40), y = 40 + hash(n, 2, 31 + M.w) * (M.h - 40);
    const edge = !spec.near && (x < 70 || x > M.w - 70 || y > M.h - 50);
    if (edge && sd(x, y) < 10) continue;
    if (!edge && !ok(x, y)) continue; if (edge && !ok2(x, y)) continue;
    let r = hash(n, 3, 31), type = spec.types[0][0];
    for (const [t, p] of spec.types) { if (r < p) { type = t; break; } r -= p; }
    out.push([type, Math.round(x), Math.round(y)]);
  }
  function ok2(x, y) { for (const t of out) if (Math.hypot(t[1] - x, t[2] - y) < 20) return false; for (const ex of M.exits || []) if (x > ex.x - 30 && x < ex.x + ex.w + 30 && y > ex.y - 30 && y < ex.y + ex.h + 50) return false; return true; }
  return out;
}
function borderTrees(M) {
  const out = [], b = M.border; let n = 0;
  const inGap = (g, v) => g && v > g[0] - 14 && v < g[1] + 14;
  const T = b.types || ['pined', 'pine', 'round'], tp = (k, s2) => T[Math.floor(hash(k, 9, s2) * T.length)];
  for (let y = 34; y <= b.top + 6; y += 18) for (let x = 8 + ((y / 18) % 2) * 14; x < M.w; x += 30) { n++; out.push([tp(n, 41), x + Math.round((hash(n, 2, 41) - .5) * 10), y + Math.round(hash(n, 3, 41) * 6)]); }
  for (let y = b.top + 20; y < M.h + 40; y += 24) {
    for (const x of [14, 36]) { if (inGap(b.gapL, y)) continue; n++; out.push([tp(n, 42), x + Math.round((hash(n, 2, 42) - .5) * 8), y]); }
    for (const x of [M.w - 36, M.w - 14]) { if (inGap(b.gapR, y)) continue; n++; out.push([tp(n, 42), x + Math.round((hash(n, 2, 42) - .5) * 8), y]); }
  }
  for (let y = b.bottom + 16; y < M.h + 50; y += 20) for (let x = 50 + ((y / 20) % 2) * 14; x < M.w - 40; x += 28) {
    if (inGap(b.gap, x)) continue; n++; out.push([tp(n, 43), x, y]);
  }
  return out;
}
function ringObjects(M) {
  const R = M.ring; if (!R) return []; const out = [];
  for (let a = 0; a < 360; a += 9) { if (Math.abs(a - 270) < R.gap) continue; const t = a * Math.PI / 180; out.push([a % 18 ? 'bushG1' : 'rock', Math.round(R.cx + Math.cos(t) * R.r), Math.round(R.cy + Math.sin(t) * R.r * .8)]); }
  return out;
}
function mapObjects(M) {
  if (!M._list) M._list = [...M.objs, ...ringObjects(M), ...(M.border ? borderTrees(M) : []), ...(M.trees ? scatter(M, M.trees) : []), ...(M.decor ? scatter(M, M.decor) : [])];
  return M._list;
}
