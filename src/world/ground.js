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
  const org = !!M._paths0;
  return (x, y) => {
    let d = org ? (vnoise(x, y, 22, 77) - .5) * 8 + (vnoise(x, y, 7, 78) - .5) * 3 : 0; const d0 = d; d = 1e9;
    for (const [x1, y1, x2, y2, r] of caps) {
      const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy; let t = L ? ((x - x1) * dx + (y - y1) * dy) / L : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x - (x1 + dx * t), ey = y - (y1 + dy * t); const v = Math.sqrt(ex * ex + ey * ey) - r; if (v < d) d = v;
    }
    for (const [cx, cy, r] of discs) { const v = Math.hypot(x - cx, y - cy) - r; if (v < d) d = v; }
    for (const [cx, cy, rx, ry, w] of rings) { const e = Math.hypot((x - cx) / rx, (y - cy) / ry); const v = Math.abs(e - 1) * (rx + ry) / 2 - w / 2; if (v < d) d = v; }
    return d + d0;
  };
}
function pondE(P, x, y) { return Math.hypot((x - P[0]) / P[2], (y - P[1]) / P[3]); }
const GROUND = {
  village: { g: ['#4a843e', '#5a9c48', '#6eb452', '#82c65a'], edge: '#3d7232', path: 'dirt', tuft: '#3c6e2e', tuft2: '#8ed060' },
  forest: { g: ['#3e7432', '#4b843a', '#5c9946', '#6eaf50'], edge: '#326026', path: 'dirt', tuft: '#305c24', tuft2: '#7ec050' },
  meadow: { g: ['#4e8a40', '#5ea24a', '#74bc58', '#88ce64'], edge: '#407632', path: 'dirt', tuft: '#40742e', tuft2: '#96dc68' },
  swamp: { g: ['#4a6a4a', '#567a50', '#628858', '#507048'], edge: '#3e5a3e', path: 'dirt', tuft: '#3a5a3a', tuft2: '#8ab070' },
  snow: { g: ['#e2ecf6', '#eaf2fa', '#dae6f2', '#f2f7fc'], edge: '#c4d6e8', path: 'dirt', tuft: '#b4c8de', tuft2: '#ffffff', ice: 1 },
  cave: { g: ['#2c2834', '#332e3c', '#28242e', '#38323f'], path: 'cave' },
};
// ---- gradasi tanah di perbatasan wilayah (dunia terbuka) ----
// Dalam pita BLEND_W px dari tepi, piksel memakai warna tanah tetangga dengan peluang naik dari 0 ke 0,5 tepat di garis.
// Keputusan memakai noise koordinat GLOBAL & urutan id peta, sehingga kedua sisi garis menghitung pola yang sama (tanpa jahitan).
// Sisi tanpa tetangga (hutan lebat pengisi celah, systems/wilds.js) memudar ke tanah hutan yang gelap.
function blendW(gA, gB) {
  if (!gA || !gB) return 150;
  if (gA === 'snow' || gB === 'snow') return 320;
  if (gA === 'swamp' || gB === 'swamp') return 240;
  return 150;
}
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
    const bw = blendW(M.ground, B.ground);
    if (B.ground !== M.ground) segs.push({ side, a0: r[0], a1: r[1], G: GROUND[B.ground].g.map(h2r), first: M.id < id, bw });
  }
  for (const side of ['N', 'S', 'W', 'E']) { // celah kosong → hutan lebat
    const len = side === 'N' || side === 'S' ? M.w : M.h, rs = cover[side].sort((p, q) => p[0] - q[0]); let at = 0;
    for (const [a, b] of rs.concat([[len, len]])) {
      if (a - at > 40) segs.push({ side, a0: at, a1: a, G: WILD_G.map(h2r), first: true, wild: 1, bw: 150 });
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
    let best = null, bd = 999;
    for (const s of segs) {
      const along = s.side === 'N' || s.side === 'S' ? x : y; if (along < s.a0 || along > s.a1) continue;
      const d = s.side === 'N' ? y : s.side === 'S' ? H - 1 - y : s.side === 'W' ? x : W - 1 - x;
      const maxW = s.bw || BLEND_W;
      if (d < maxW && d < bd) { bd = d; best = s; }
    }
    if (!best) return null;
    const curW = best.bw || BLEND_W;
    const gx = x + PX, gy = y + PY, n = vnoise(gx, gy, 22, 31) * .7 + hash(gx, gy, 32) * .3;
    const half = best.wild ? .62 : .5, p = half * (1 - bd / curW); // peluang warna tetangga
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
  const d = ctx.getImageData(0, 0, el.width, el.height).data;
  d.w = el.width; d.h = el.height; d.size = el.width;
  TILE_CACHE[k] = d;
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
  const VW = VERDANT[M.ground] && !GP.ice && verdantTiles(M);
  const water = (i, t, x, y) => {
    if (!GP.ice && M.ground !== 'cave' && typeof verdantWater === 'function') { put(i, verdantWater(t, x + GX, y + GY)); return; }
    put(i, h2r(GP.ice ? (t > .82 ? '#e8f8ff' : t > .55 ? '#c4e8f8' : '#a8d8f0') : (t > .82 ? '#7cd0f0' : t > .55 ? '#4aa6e0' : '#3a8ed0')));
  };
  for (let y = RY; y < RY + RH; y++) for (let x = RX; x < RX + RW; x++) {
    const i = ((y - RY) * RW + (x - RX)) * 4;
    let tR = 9, dR = 999;
    if (R) {
      const ry = riverY(R, x), onBr = x >= R.bridge[0] && x <= R.bridge[1], dv = Math.abs(y - ry);
      const hw = R.w / 2 * 1.15 + (onBr ? 0 : (vnoise(x + GX, y + GY, 22, 51) * .55 + vnoise(x + GX, y + GY, 7, 53) * .45 - .5) * 14);
      if (onBr && dv < hw + 5) {
        const bx = x - R.bridge[0], bw = R.bridge[1] - R.bridge[0], by = Math.round(y - (ry - hw - 5)), bh = Math.round((hw + 5) * 2);
        if (typeof bridgeWoodPix === 'function') { put(i, bridgeWoodPix(by, bx, bh, bw)); continue; }
        const ly = (y + 1000) % 8; put(i, ly === 0 ? h2r('#382012') : ly === 1 ? h2r('#cca06a') : h2r('#9e683e')); continue;
      }
      tR = dv / hw; dR = dv - hw;
    }
    if (M.id === 'lake' && x >= 832 && x <= 886 && y >= 700 && y <= 722 && typeof bridgeWoodPix === 'function') { put(i, bridgeWoodPix(x - 832, y - 700, 54, 22)); continue; }
    let tPL = 9, dPL = 999, wr = 30;
    if (PL.length) { tPL = waterE(PL, x, y, GX, GY); wr = waterE.r || 30; dPL = (tPL - 1) * wr; }
    const wt = Math.min(tR, tPL);
    if (wt < 1) {
      const ds = sd(x, y);
      if (tPL < 1 && ds < 2.0) {
        const u = Math.round(x + y * 0.12), v = Math.round((ds + 2.0) * 3.5);
        if (typeof bridgeWoodPix === 'function') { put(i, bridgeWoodPix(u, v, 9999, 14)); continue; }
        const ly = (y + 1000) % 8; put(i, ly === 0 ? h2r('#382012') : ly === 1 ? h2r('#cca06a') : h2r('#9e683e')); continue;
      }
      water(i, tR <= tPL ? tR : (wr < 92 ? Math.max(tPL, .25) : tPL), x, y); continue;
    }
    const bd = Math.min(dR, dPL);
    if (bd < 20) {
      if (typeof verdantBank === 'function') {
        const north = dR <= dPL ? (y < riverY(R, x)) : (waterE(PL, x, y + 4, GX, GY) < tPL);
        const b = verdantBank(M, bd, x + GX, y + GY, north);
        if (b) { put(i, b); continue; }
      }
      if (bd < 5) { put(i, h2r(bd < 1.5 ? '#8a7a5a' : '#d2b473')); continue; }
    }
    const d = sd(x, y);
    if (cave) {
      if (d < 0) { const v = vor(x, y, 9, 21); if (v.m < 1.2) { put(i, CMORT); continue; } put(i, CSTONE[Math.floor(hash(v.id, 3, 13) * 4)], v.v < -3 ? .14 : v.v > 3 ? -.12 : 0); continue; }
      // dinding batu
      const n = vnoise(x, y, 10, 5) * .6 + vnoise(x, y, 3, 6) * .4; let c = Gc[n < .35 ? 2 : n < .55 ? 0 : n < .72 ? 1 : 3];
      if (d < 3) c = h2r('#6e6680'); else if (d < 6) c = h2r('#4a4456');
      put(i, c); continue;
    }
    if (VERDANT[M.ground] && GP.path === 'dirt' && d >= -7 && d <= 7 && typeof verdantEdgePix === 'function') {
      const ve = verdantEdgePix(M, x + GX, y + GY, d); if (ve) { put(i, ve); continue; }
    }
    if (d < 0) {
      if (M.pathType === 'paving' || M.ground === 'paving') {
        const im = IMGEL.gnd_city_cobble;
        if (im && im.width) {
          const gx = ((x + GX) % 64 + 64) % 64, gy = ((y + GY) % 64 + 64) % 64;
          const ti = (gy * 64 + gx) * 4;
          if (!M._cobbleData) { const [, tx] = mk(64, 64); tx.drawImage(im, 0, 0); M._cobbleData = tx.getImageData(0, 0, 64, 64).data; }
          const cd = M._cobbleData; put(i, [cd[ti], cd[ti + 1], cd[ti + 2]], d > -1.5 ? -.12 : 0); continue;
        }
        // Fallback paving abu-abu jika gambar belum di-cache
        const v = vor(x, y, 8, 12);
        const CP = [[156, 150, 168], [140, 134, 154], [172, 166, 184], [128, 122, 142]];
        put(i, v.m < 1.3 ? [90, 84, 100] : CP[Math.floor(hash(v.id, 3, 13) * 4)], d > -1.5 ? -.12 : 0);
        continue;
      }
      if (GP.path === 'dirt' && VERDANT[M.ground]) { const vp = verdantPix(M, x + GX, y + GY, 1); if (vp) { put(i, vp); continue; } }
      if (GP.path === 'dirt') { const n = vnoise(x, y, 6, 3), k = n < .3 ? 1 : n < .7 ? 0 : 2; let c = DIRT[k]; if (hash(x, y, 8) > .985) c = h2r('#8a7a6a'); put(i, c, d > -2 ? -.12 : 0); continue; }
      const v = vor(x, y, 7, 11);
      if (v.m < 1.25) { put(i, d > -1.5 ? MORT2 : MORT); continue; }
      put(i, STONE[Math.floor(hash(v.id, 3, 13) * 4)], v.v < -3 ? .2 : v.v > 2.5 ? -.06 : 0); continue;
    }
    const n = vnoise(x + GX, y + GY, 26, 1) * .55 + vnoise(x + GX, y + GY, 8, 2) * .45;
    let k = n < .33 ? 0 : n < .5 ? 1 : n < .68 ? 2 : 3, f = 0;
    if (glow && !VW) { const g = Math.max(0, 1 - Math.hypot(x - glow[0], (y - glow[1]) * 1.3) / glow[2]); f = g * g * .16; }
    if (d < 2.2 && !(VERDANT[M.ground] && GP.path === 'dirt' && verdantTiles(M))) { put(i, EDGE, f * .5); continue; }
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
  const near = (X, Y) => { if (R && Math.abs(Y - riverY(R, X)) < R.w / 2 + 6) return true; return ponds.length > 0 && waterE(ponds, X, Y, GX, GY) < 1 + 14 / Math.max(waterE.r, 1); };
  if (cave) {
    for (let n = 0; n < W * H / 260; n++) { const X = Math.floor(hash(n, 1, 22) * W), Y = Math.floor(hash(n, 2, 22) * H); if (out(X, Y)) continue; const d = sd(X, Y); if (d > 2 && d < 60 && hash(n, 3, 22) > .6) { const col = hash(n, 4, 22) > .5 ? '#9a6aff' : '#5ac8ff'; px(x, col, X, Y); px(x, shade(col, .5), X, Y - 1); } else if (d < -4) { px(x, '#6a6476', X, Y); } }
    return c;
  }
  const vOK = VERDANT[M.ground] && verdantTiles(M);
  if (vOK || M.ground === 'meadow') verdantDeco(x, M, [RX, RY, RW, RH], GX, GY, sd, near);
  if (!vOK && M.ground !== 'meadow') for (let n = 0; n < W * H / 1600; n++) {
    const X = Math.floor(hash(n, 1, 21) * W), Y = Math.floor(hash(n, 2, 21) * H); if (out(X, Y) || near(X, Y)) continue;
    const d = sd(X, Y);
    if (d >= -1.5 && d <= 3.2 && GP.path === 'dirt') {
      if (hash(n, 5, 21) > 0.48) { px(x, GP.tuft, X, Y); px(x, GP.tuft2, X, Y - 1); }
      else if (hash(n, 5, 21) > 0.28) { px(x, '#9a8870', X, Y); px(x, '#7a6a58', X + 1, Y); }
      continue;
    }
    if (d < 3) continue;
    const r = hash(n, 3, 21);
    if (r < 0.7) { px(x, GP.tuft, X, Y); px(x, GP.tuft2, X, Y - 1); }
    else if (r < 0.95) {
      const fl = GP.ice ? '#cfe6fa' : ['#ffffff', '#fff0b0', '#ffc8d4', '#d8c8f8'][Math.floor(hash(n, 4, 21) * 4)];
      px(x, fl, X, Y); px(x, GP.ice ? '#ffffff' : '#ffea88', X, Y - 1);
    } else { ellF(x, '#d6d0c4', X, Y, 2.5, 1.6); }
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
  // teratai hanya di danau/kolam luas, bukan di alur sungai sempit mengalir
  if (!GP.ice) for (const P of (M.ponds || [])) {
    if ((P[2] || 0) < 65 || (P[3] || 0) < 50) continue;
    for (let n = 0; n < 3; n++) {
      const a = hash(n, 1, 77) * 6.28, r = .25 + hash(n, 2, 77) * .45;
      const X = P[0] + Math.cos(a) * P[2] * r, Y = P[1] + Math.sin(a) * P[3] * r;
      if (waterE(ponds, X, Y, GX, GY) > .75) continue;
      const pad = typeof IMGEL !== 'undefined' ? (n % 2 ? IMGEL.deco_water_lotus : IMGEL.deco_water_lilypad) : null;
      if (pad && pad.width) {
        x.drawImage(pad, X - pad.width / 4, Y - pad.height / 4, pad.width / 2, pad.height / 2);
      } else {
        ellF(x, '#3f8a34', X, Y, 4, 2.5); ellF(x, '#6cc04a', X - 1, Y - .5, 2.5, 1.5);
      }
    }
  }
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
  const open = openSides(M), inGap = (g, v) => g && v > g[0] - 22 && v < g[1] + 22;
  const T = b.types || ['pined', 'pine', 'round'], tp = (k, s2) => T[Math.floor(hash(k, 9, s2) * T.length)];
  if (!open.N) for (let x = 24; x < M.w - 20; x += 64) {
    if (inGap(b.gapT, x)) continue; n++; out.push([tp(n, 41), x + Math.round((hash(n, 2, 41) - .5) * 12), Math.max(16, b.top - 12)]);
  }
  for (let y = b.top + 32; y < b.bottom - 16; y += 64) {
    if (!open.W && !inGap(b.gapL, y)) { n++; out.push([tp(n, 42), Math.max(16, b.left - 16), y]); }
    if (!open.E && !inGap(b.gapR, y)) { n++; out.push([tp(n, 42), Math.min(M.w - 16, b.right + 16), y]); }
  }
  if (!open.S) for (let x = 32; x < M.w - 30; x += 64) {
    if (inGap(b.gap, x)) continue; n++; out.push([tp(n, 43), x + Math.round((hash(n, 2, 43) - .5) * 12), b.bottom + 24]);
  }
  const exs = mapDoors(M);
  return out.filter(o => !exs.some(ex => o[1] > ex.x - 56 && o[1] < ex.x + ex.w + 56 && o[2] > ex.y - 56 && o[2] < ex.y + ex.h + 64));
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
