'use strict';
// Generator tanah, tabrakan grid, penyebar pohon
// ---------------- generator tanah ----------------
function riverY(R, x) { return R.y + Math.sin(x * R.k) * R.amp + Math.sin(x * R.k * 2.7 + 1) * R.amp * .3; }
// rect (opsional): hanya bentuk yang dekat potongan itu ikut dihitung. Hasil identik untuk jarak < SD_PAD,
// dan semua keputusan gambar memakai ambang jauh di bawah itu.
const SD_PAD = 96;
function makeSD(M, rect) {
  let caps = M.paths || [], discs = M.discs || [], rings = M.rings || [];
  if (rect) {
    const [X, Y, W, H] = rect, x0 = X - SD_PAD, y0 = Y - SD_PAD, x1 = X + W + SD_PAD, y1 = Y + H + SD_PAD;
    caps = caps.filter(([a, b, c, d, r]) => Math.max(a, c) + r >= x0 && Math.min(a, c) - r <= x1 && Math.max(b, d) + r >= y0 && Math.min(b, d) - r <= y1);
    discs = discs.filter(([cx, cy, r]) => cx + r >= x0 && cx - r <= x1 && cy + r >= y0 && cy - r <= y1);
    rings = rings.filter(([cx, cy, rx, ry, w]) => cx + rx + w >= x0 && cx - rx - w <= x1 && cy + ry + w >= y0 && cy - ry - w <= y1);
  }
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
  village: { g: ['#427a36', '#4c8c3e', '#589c44', '#68ac4c'], edge: '#38682a', path: 'stone', tuft: '#346428', tuft2: '#7ac456' },
  forest: { g: ['#3a6c2e', '#447c34', '#508e3a', '#5ea042'], edge: '#2e5824', path: 'dirt', tuft: '#2c5422', tuft2: '#70b448' },
  meadow: { g: ['#468238', '#52943e', '#60a648', '#72ba54'], edge: '#3a6c2c', path: 'dirt', tuft: '#386828', tuft2: '#86cc5c' },
  swamp: { g: ['#4a6a4a', '#567a50', '#628858', '#507048'], edge: '#3e5a3e', path: 'dirt', tuft: '#3a5a3a', tuft2: '#8ab070' },
  snow: { g: ['#e2ecf6', '#eaf2fa', '#dae6f2', '#f2f7fc'], edge: '#c4d6e8', path: 'dirt', tuft: '#b4c8de', tuft2: '#ffffff', ice: 1 },
  cave: { g: ['#2c2834', '#332e3c', '#28242e', '#38323f'], path: 'cave' },
};
// ---- gradasi tanah di perbatasan wilayah (dunia terbuka) ----
// Dalam pita BLEND_W px dari tepi, piksel memakai warna tanah tetangga dengan peluang naik dari 0 ke 0,5 tepat di garis.
// Keputusan memakai noise koordinat GLOBAL & urutan id peta, sehingga kedua sisi garis menghitung pola yang sama (tanpa jahitan).
// Sisi tanpa tetangga (hutan lebat pengisi celah, systems/wilds.js) memudar ke tanah hutan yang gelap.
const BLEND_W = 150;
const WILD_G = ['#2f5f24', '#36692a', '#3d7330', '#2a5620'];
function edgeSegs(M) {
  if (M._eseg !== undefined) return M._eseg;
  M._eseg = null;
  if (M.indoor || typeof WORLD_POS === 'undefined' || !WORLD_POS[M.id] || !GROUND[M.ground] || M.ground === 'cave') return null;
  const P = WORLD_POS[M.id], segs = [], cover = { N: [], S: [], W: [], E: [] };
  for (const [id, Q] of Object.entries(WORLD_POS)) {
    const B = MAPS[id]; if (id === M.id || !B || B.indoor || !GROUND[B.ground]) continue;
    const ox = Q[0] - P[0], oy = Q[1] - P[1], tol = 12;
    const ovX = [Math.max(0, ox), Math.min(M.w, ox + B.w)], ovY = [Math.max(0, oy), Math.min(M.h, oy + B.h)];
    let side = null, r = null;
    const hy = ovY[1] > ovY[0], hx = ovX[1] > ovX[0];
    if (hy && Math.abs(ox - M.w) < tol) { side = 'E'; r = ovY; }
    else if (hy && Math.abs(ox + B.w) < tol) { side = 'W'; r = ovY; }
    else if (hx && Math.abs(oy - M.h) < tol) { side = 'S'; r = ovX; }
    else if (hx && Math.abs(oy + B.h) < tol) { side = 'N'; r = ovX; }
    if (!side) continue;
    cover[side].push(r);
    if (B.ground !== M.ground) segs.push({ side, a0: r[0], a1: r[1], G: GROUND[B.ground].g.map(h2r), first: M.id < id });
  }
  for (const side of ['N', 'S', 'W', 'E']) { // celah kosong → hutan lebat
    const len = side === 'N' || side === 'S' ? M.w : M.h, rs = cover[side].sort((p, q) => p[0] - q[0]); let at = 0;
    for (const [a, b] of rs.concat([[len, len]])) {
      if (a - at > 40) segs.push({ side, a0: at, a1: a, G: WILD_G.map(h2r), first: true, wild: 1 });
      at = Math.max(at, b);
    }
  }
  M._eseg = segs.length ? segs : null;
  return M._eseg;
}
function edgeBlend(M) {
  const segs = edgeSegs(M); if (!segs) return null;
  const [PX, PY] = WORLD_POS[M.id], W = M.w, H = M.h;
  return (x, y, k) => {
    let best = null, bd = BLEND_W;
    for (const s of segs) {
      const along = s.side === 'N' || s.side === 'S' ? x : y; if (along < s.a0 || along > s.a1) continue;
      const d = s.side === 'N' ? y : s.side === 'S' ? H - 1 - y : s.side === 'W' ? x : W - 1 - x;
      if (d < bd) { bd = d; best = s; }
    }
    if (!best) return null;
    const gx = x + PX, gy = y + PY, n = vnoise(gx, gy, 22, 31) * .7 + hash(gx, gy, 32) * .3;
    const half = best.wild ? .62 : .5, p = half * (1 - bd / BLEND_W); // peluang warna tetangga
    const useOther = best.first ? n < p : n >= 1 - p;
    return useOther ? best.G[k % best.G.length] : null;
  };
}
// Bisa menggambar sebagian peta saja (rect = [x, y, w, h]) untuk tanah per chunk (systems/stream.js).
// Warna dihitung murni dari posisi, jadi potongan yang bersebelahan menyambung tanpa jahitan.
let TILE_CACHE = null;
function getTileData(k) {
  if (!TILE_CACHE) TILE_CACHE = {};
  if (TILE_CACHE[k] !== undefined) return TILE_CACHE[k];
  const el = (typeof IMGEL !== 'undefined' && (IMGEL['gpt_' + k] || IMGEL[k]));
  if (!el || !el.width) { TILE_CACHE[k] = null; return null; }
  const [c, ctx] = mk(el.width, el.height); ctx.drawImage(el, 0, 0);
  TILE_CACHE[k] = ctx.getImageData(0, 0, el.width, el.height).data;
  return TILE_CACHE[k];
}
function genGround(M, rect) {
  if (M.ground === 'room') return genRoom(M);
  const pos = (typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id]) || [0, 0];
  const GX = pos[0], GY = pos[1];
  const W = M.w, H = M.h, [RX, RY, RW, RH] = rect || [0, 0, W, H], img = new ImageData(RW, RH), D = img.data, sd = makeSD(M, rect), GP = GROUND[M.ground];
  const Gc = GP.g.map(h2r), glow = M.glow, cave = GP.path === 'cave';
  const blend = edgeBlend(M);
  const STONE = ['#eae2d6', '#ddd4c9', '#f1ebe1', '#d2c8bd'].map(h2r), MORT = h2r('#b5b8a2'), MORT2 = h2r('#9ea38a');
  const CSTONE = ['#5a5466', '#524c5e', '#625c6e', '#4a4456'].map(h2r), CMORT = h2r('#2a2630');
  const DIRT = ['#c9a46e', '#ba9460', '#d8b47e', '#ad8656'].map(h2r);
  const EDGE = GP.edge ? h2r(GP.edge) : null, R = M.river, ponds = pondsAll(M), PL = pondsNear(M, RX, RY, RX + RW, RY + RH);
  const put = (i, c, f = 0) => { let r = c[0], g = c[1], b = c[2]; if (f > 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } D[i] = r; D[i + 1] = g; D[i + 2] = b; D[i + 3] = 255; };
  const vor = (x, y, cell, s) => {
    const gx = Math.floor(x / cell), gy = Math.floor(y / cell); let d1 = 1e9, d2 = 1e9, id = 0, fx = 0, fy = 0;
    for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      const cx = gx + k, cy = gy + j, px2 = (cx + .15 + .7 * hash(cx, cy, s)) * cell, py2 = (cy + .15 + .7 * hash(cx, cy, s + 1)) * cell;
      const dd = Math.hypot(x - px2, y - py2); if (dd < d1) { d2 = d1; d1 = dd; id = cx * 7919 + cy; fx = px2; fy = py2; } else if (dd < d2) d2 = dd;
    }
    return { m: d2 - d1, id, v: (x - fx) + (y - fy) };
  };
  const VW = VERDANT[M.ground] && !GP.ice && verdantTiles();
  const water = (i, t, x, y) => { if (VW) { put(i, verdantWater(t, x + GX, y + GY)); return; } let c = GP.ice ? (t > .82 ? '#e8f8ff' : t > .55 ? '#c4e8f8' : '#a8d8f0') : t > .82 ? '#7cd0f0' : t > .55 ? '#4aa6e0' : '#3a8ed0'; const rp = Math.sin(x * .15 + y * .9) + Math.sin(x * .05 - y * .3) * 1.3; if (rp > 1.85 && t < .8) c = '#a8e8ff'; put(i, h2r(c)); };
  for (let y = RY; y < RY + RH; y++) for (let x = RX; x < RX + RW; x++) {
    const i = ((y - RY) * RW + (x - RX)) * 4;
    if (R) {
      const ry = riverY(R, x), dv = Math.abs(y - ry), hw = R.w / 2;
      if (x >= R.bridge[0] && x <= R.bridge[1] && dv < hw + 5) {
        const bx = x - R.bridge[0], bw = R.bridge[1] - R.bridge[0];
        if (bx < 3 || bx > bw - 3) { put(i, h2r('#5e3b20')); continue; }
        const ly = (y + 1000) % 6; put(i, ly === 0 ? h2r('#6e4222') : ly === 1 ? h2r('#c8945a') : h2r('#a8703e'), (hash(x >> 3, Math.floor((y + 1000) / 6), 5) - .5) * .12); continue;
      }
      if (dv < hw) { water(i, dv / hw, x, y); continue; }
      if (VW && dv < hw + 4) { const b = verdantBank(M, dv - hw, x + GX, y + GY, y < ry); if (b) { put(i, b); continue; } }
      else if (dv < hw + 4) { put(i, h2r(dv < hw + 1.5 ? '#8a7a5a' : '#cdb684')); continue; }
    }
    let inPond = false;
    if (PL.length) {
      const we = waterE(PL, x, y, GX, GY), wr = waterE.r;
      if (we < 1) {
        const ds = sd(x, y);
        if (ds < 1.5) { if (ds > -1.5) { put(i, h2r('#5e3b20')); continue; } const ly = (y + 1000) % 6; put(i, h2r(ly === 0 ? '#6e4222' : ly === 1 ? '#c8945a' : '#a8703e')); continue; }
        water(i, wr < 70 ? Math.max(we, .5) : we, x, y); continue;
      }
      if (we < 1 + 5 / wr) {
        if (VW) { const b = verdantBank(M, (we - 1) * wr, x + GX, y + GY, waterE(PL, x, y + 4, GX, GY) < we); if (b) { put(i, b); continue; } }
        else { put(i, h2r(we < 1 + 2 / wr ? '#8a7a5a' : '#d6c08c')); continue; }
      }
    }
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
      if (GP.path === 'dirt' && VERDANT[M.ground] && (d < -2 || hash(x + GX, y + GY, 32) < .5)) { const vp = verdantPix(M, x + GX, y + GY, 1); if (vp) { put(i, vp); continue; } }
      if (GP.path === 'dirt') { const n = vnoise(x, y, 6, 3), k = n < .3 ? 1 : n < .7 ? 0 : 2; let c = DIRT[k]; if (hash(x, y, 8) > .985) c = h2r('#8a7a6a'); put(i, c, d > -2 ? -.12 : 0); continue; }
      const v = vor(x, y, 7, 11);
      if (v.m < 1.25) { put(i, d > -1.5 ? MORT2 : MORT); continue; }
      put(i, STONE[Math.floor(hash(v.id, 3, 13) * 4)], v.v < -3 ? .2 : v.v > 2.5 ? -.06 : 0); continue;
    }
    const n = vnoise(x + GX, y + GY, 26, 1) * .55 + vnoise(x + GX, y + GY, 8, 2) * .45;
    let k = n < .33 ? 0 : n < .5 ? 1 : n < .68 ? 2 : 3, f = 0;
    if (glow && !VW) { const g = Math.max(0, 1 - Math.hypot(x - glow[0], (y - glow[1]) * 1.3) / glow[2]); f = g * g * .16; }
    if (d < 2.2 && !(VERDANT[M.ground] && GP.path === 'dirt' && verdantTiles())) { put(i, EDGE, f * .5); continue; }
    if (d < 4 && hash(x, y, 4) > .5) k = Math.max(0, k - 1);
    const vc = VERDANT[M.ground] && verdantPix(M, x + GX, y + GY);
    if (vc) {
      if (blend && hash(x + GX, y + GY, 31) < .35) { const c2 = blend(x, y, k); if (c2) { put(i, c2, f); continue; } }
      put(i, vc, f);
    } else {
      if (blend) { const c2 = blend(x, y, k); if (c2) { put(i, c2, f); continue; } }
      put(i, Gc[k], f);
    }
  }
  const [c, x] = mk(RW, RH); x.putImageData(img, 0, 0); x.translate(-RX, -RY);
  const out = (X, Y) => X < RX - 10 || X > RX + RW + 10 || Y < RY - 10 || Y > RY + RH + 10;
  const near = (X, Y) => { if (R && Math.abs(Y - riverY(R, X)) < R.w / 2 + 6) return true; return ponds.length > 0 && waterE(ponds, X, Y, GX, GY) < 1.15; };
  if (cave) {
    for (let n = 0; n < W * H / 260; n++) { const X = Math.floor(hash(n, 1, 22) * W), Y = Math.floor(hash(n, 2, 22) * H); if (out(X, Y)) continue; const d = sd(X, Y); if (d > 2 && d < 60 && hash(n, 3, 22) > .6) { const col = hash(n, 4, 22) > .5 ? '#9a6aff' : '#5ac8ff'; px(x, col, X, Y); px(x, shade(col, .5), X, Y - 1); } else if (d < -4) { px(x, '#6a6476', X, Y); } }
    return c;
  }
  const vOK = VERDANT[M.ground] && verdantTiles();
  if (vOK) verdantDeco(x, M, [RX, RY, RW, RH], GX, GY, sd, near);
  if (!vOK) for (let n = 0; n < W * H / (M.flowers ? 60 : 90); n++) {
    const X = Math.floor(hash(n, 1, 21) * W), Y = Math.floor(hash(n, 2, 21) * H); if (out(X, Y)) continue;
    if (sd(X, Y) < 3 || near(X, Y)) continue;
    const r = hash(n, 3, 21), forest = M.ground === 'forest';
    if (r < (M.flowers ? .55 : .78)) { px(x, GP.tuft, X, Y); px(x, GP.tuft, X - 1, Y - 1); px(x, GP.tuft, X + 1, Y - 1); px(x, GP.tuft2, X, Y - 2); }
    else if (r < .97 || forest) {
      const fl = GP.ice ? ['#ffffff', '#cfe6fa', '#b4d4f0'][Math.floor(hash(n, 4, 21) * 3)] :
        ['#ffffff', '#fff0b0', '#ffc8d4', '#d8c8f8', '#ffd09c'][Math.floor(hash(n, 4, 21) * 5)];
      px(x, fl, X, Y - 1); px(x, fl, X - 1, Y); px(x, fl, X + 1, Y); px(x, fl, X, Y + 1); px(x, GP.ice ? '#ffffff' : '#ffea88', X, Y);
    }
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
  if (!GP.ice) for (const P of (M.ponds || [])) for (let n = 0; n < 7; n++) { const a = hash(n, 1, 77) * 6.28, r = .3 + hash(n, 2, 77) * .5; const X = P[0] + Math.cos(a) * P[2] * r, Y = P[1] + Math.sin(a) * P[3] * r; if (waterE(ponds, X, Y, GX, GY) > .8) continue; ellF(x, '#3f8a34', X, Y, 4, 2.5); ellF(x, '#6cc04a', X - 1, Y - .5, 2.5, 1.5); if (n % 2) { px(x, '#ffb4d8', X + 1, Y - 1); px(x, '#ffffff', X + 2, Y - 1); } }
  return c;
}
// kotak tabrakan dari grid (dinding gua, kolam)
function blockRects(M) {
  const out = [], cs = 16, sd = makeSD(M), cave = M.ground === 'cave', ponds = pondsAll(M);
  if (!cave && !ponds.length) return out;
  for (let gy = 0; gy < Math.ceil(M.h / cs); gy++) {
    let run = -1;
    for (let gx = 0; gx <= Math.ceil(M.w / cs); gx++) {
      const x = gx * cs + 8, y = gy * cs + 8; let b = false;
      if (gx < Math.ceil(M.w / cs)) { if (cave && sd(x, y) > 5) b = true; if (ponds.length && waterE(ponds, x, y, ...waterGXY(M)) < .94 && sd(x, y) > 6) b = true; }
      if (b && run < 0) run = gx; if (!b && run >= 0) { out.push([run * cs, gy * cs, (gx - run) * cs, cs]); run = -1; }
    }
  }
  // gabungkan kotak yang persis bertumpuk vertikal (lebih sedikit badan fisika)
  const key = r => r[0] + ',' + r[2], open = {}, merged = [];
  for (const r of out) { const k = key(r), o = open[k]; if (o && o[1] + o[3] === r[1]) o[3] += r[3]; else { const n = r.slice(); merged.push(n); open[k] = n; } }
  return merged;
}
function scatter(M, spec) {
  const sd = makeSD(M), out = [], R = M.river, ponds = pondsAll(M);
  const ok = (x, y, t) => {
    const d = sd(x, y);
    if (spec.near) { if (d < spec.near[0] || d > spec.near[1]) return false; }
    else if (d < spec.min) return false;
    if (R && Math.abs(y - riverY(R, x)) < R.w / 2 + 14) return false;
    if (ponds.length && waterE(ponds, x, y, ...waterGXY(M)) < 1.25) return false;
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
function openSides(M) {
  if (!M.id || M.indoor || typeof WORLD_POS === 'undefined' || !WORLD_POS[M.id]) return {};
  const P = WORLD_POS[M.id], sides = {};
  for (const [id, Q] of Object.entries(WORLD_POS)) {
    if (id === M.id) continue; const B = typeof MAPS !== 'undefined' && MAPS[id]; if (!B || B.indoor) continue;
    const overlapY = Q[1] < P[1] + M.h && Q[1] + B.h > P[1], overlapX = Q[0] < P[0] + M.w && Q[0] + B.w > P[0];
    if (overlapY && Math.abs(Q[0] - (P[0] + M.w)) < 10) sides.E = true;
    if (overlapY && Math.abs((Q[0] + B.w) - P[0]) < 10) sides.W = true;
    if (overlapX && Math.abs(Q[1] - (P[1] + M.h)) < 10) sides.S = true;
    if (overlapX && Math.abs((Q[1] + B.h) - P[1]) < 10) sides.N = true;
  }
  return sides;
}
function borderTrees(M) {
  const out = [], b = M.border; if (!b) return out; let n = 0;
  const open = openSides(M), inGap = (g, v) => g && v > g[0] - 14 && v < g[1] + 14;
  const T = b.types || ['pined', 'pine', 'round'], tp = (k, s2) => T[Math.floor(hash(k, 9, s2) * T.length)];
  if (!open.N) for (let y = 34; y <= b.top + 6; y += 18) for (let x = 8 + ((y / 18) % 2) * 14; x < M.w; x += 30) {
    if (inGap(b.gapT, x)) continue; n++; out.push([tp(n, 41), x + Math.round((hash(n, 2, 41) - .5) * 10), y + Math.round(hash(n, 3, 41) * 6)]);
  }
  for (let y = b.top + 20; y < M.h + 40; y += 24) {
    if (!open.W) for (const x of [14, 36]) { if (inGap(b.gapL, y)) continue; n++; out.push([tp(n, 42), x + Math.round((hash(n, 2, 42) - .5) * 8), y]); }
    if (!open.E) for (const x of [M.w - 36, M.w - 14]) { if (inGap(b.gapR, y)) continue; n++; out.push([tp(n, 42), x + Math.round((hash(n, 2, 42) - .5) * 8), y]); }
  }
  if (!open.S) for (let y = b.bottom + 16; y < M.h + 50; y += 20) for (let x = 50 + ((y / 20) % 2) * 14; x < M.w - 40; x += 28) {
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
function mapWalls(M) {
  if (!M.walls) return [];
  if (M.indoor) return M.walls;
  const open = openSides(M);
  return M.walls.filter(([x, y, w, h]) => {
    if (open.N && y <= 10 && h <= 70) return false;
    if (open.S && y + h >= M.h - 10 && h <= 70) return false;
    if (open.W && x <= 10 && w <= 70) return false;
    if (open.E && x + w >= M.w - 10 && w <= 70) return false;
    return true;
  });
}
