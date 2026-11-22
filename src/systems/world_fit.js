'use strict';
// DUNIA COCOK DENGAN GAMBAR — tabrakan & objek mengikuti tanah yang TERLIHAT (gambar peta + autotile grass_edge), bukan data lama.
// 1) Pemilik titik: wilayah benua boleh bertumpuk (Danau menimpa 348 px Hutan Dalam/Hutan). Tiap titik dimiliki SATU wilayah
//    (REGION_PRI, lalu urutan daftar): tanah wilayah lain di situ dibuat transparan, tembok & objeknya di situ dibuang.
// 2) Tembok air = kisi air grass_edge (Wm), dikurangi jembatan → menggantikan tembok kolam lama (blockRects) & sungai rumus (M.river).
// 3) Objek di atas air digeser ke daratan terdekat (≤ 3 kotak), selain benda air (teratai, perahu, dermaga, …).
const WORLD_FIT = { on: true, waterOk: /lily|lotus|WRock|boat|dock|bridge|fish|reed|cattail|ripple|duck|buoy|cliff/i, pri: { lake: -1 } };
function regionOwner(x, y) {
  if (typeof WORLD_POS === 'undefined' || typeof isOutdoorRegion !== 'function') return null;
  const pr = k => WORLD_FIT.pri[k] || 0;
  const L = regionOwner.order || (regionOwner.order = Object.keys(WORLD_POS).filter(isOutdoorRegion).sort((a, b) => pr(b) - pr(a)));
  for (const id of L) { const [ox, oy] = WORLD_POS[id], M = MAPS[id]; if (x >= ox && x < ox + M.w && y >= oy && y < oy + M.h) return id; }
  return null;
}
const fitWater = M => fitOn(M); /* sungai rumus lama (M.river) tidak dipakai untuk tembok */
const fitOn = M => WORLD_FIT.on && M && !M.indoor && M.customGround && typeof GRASS_EDGE !== 'undefined' && GRASS_EDGE.maps.includes(M.id);
const fitBenua = M => typeof BENUA !== 'undefined' && BENUA && !!WORLD_POS[M.id];
// rentang jembatan (lokal) per peta, dari bridges.js
function fitBridgeRects(M) {
  if (typeof BRIDGES === 'undefined' || !BRIDGES.list[M.id]) return [];
  const out = [];
  for (const [x, y] of BRIDGES.list[M.id](M)) {
    const B = bridgeFit(M, x, y); if (!B) continue; const h = BRIDGES.width / 2;
    out.push(B.axis === 'v' ? [B.c - h, B.a, h * 2, B.b - B.a] : [B.a, B.c - h, B.b - B.a, h * 2]);
  }
  return out;
}
// tembok air dari kisi Wm (lokal): runtut mendatar lalu digabung tegak
function waterRects(M) {
  const E = grassEdgeData(M); if (!E || !E.Wm) return null;
  const S = GRASS_EDGE.cell, br = fitBridgeRects(M), P = fitBenua(M) ? WORLD_POS[M.id] : null, out = [];
  const blocked = (c, r) => {
    if (!E.Wm[r * E.cols + c]) return false; const x = c * S + S / 2, y = r * S + S / 2;
    if (br.some(b => x >= b[0] && x < b[0] + b[2] && y >= b[1] && y < b[1] + b[3])) return false;
    if (P && regionOwner(P[0] + x, P[1] + y) !== M.id) return false;
    return true;
  };
  for (let r = 0; r < E.rows; r++) {
    let run = -1;
    for (let c = 0; c <= E.cols; c++) {
      const b = c < E.cols && blocked(c, r);
      if (b && run < 0) run = c; if (!b && run >= 0) { out.push([run * S + 3, r * S, (c - run) * S - 6, S]); run = -1; }
    }
  }
  const open = {}, merged = [];
  for (const q of out) {
    const k = q[0] + ',' + q[2], o = open[k];
    if (o && o[1] + o[3] === q[1]) o[3] += q[3]; else { const n = q.slice(); merged.push(n); open[k] = n; }
  }
  for (const m of merged) { m[1] += 3; m[3] -= 6; } /* sedikit menyusut: tepi buih bisa dipijak */
  return merged;
}
// objek: geser dari air ke daratan terdekat, buang bila tak ada; benua: buang objek di titik milik wilayah lain
function fitObjects(M, L) {
  const E = grassEdgeData(M); if (!E || !E.Wm) return L;
  const S = GRASS_EDGE.cell, W = (c, r) => c < 0 || r < 0 || c >= E.cols || r >= E.rows ? 0 : E.Wm[r * E.cols + c], P = fitBenua(M) ? WORLD_POS[M.id] : null;
  const out = [];
  for (const o of L) {
    if (P && regionOwner(P[0] + o[1], P[1] + o[2]) !== M.id) continue;
    if (WORLD_FIT.waterOk.test(o[0])) { out.push(o); continue; }
    const c = Math.floor(o[1] / S), r = Math.floor((o[2] - 2) / S);
    if (!W(c, r)) { out.push(o); continue; }
    let best = null;
    for (let d = 1; d <= 3 && !best; d++) for (let j = -d; j <= d && !best; j++) for (let i = -d; i <= d; i++) {
      if (Math.max(Math.abs(i), Math.abs(j)) !== d || W(c + i, r + j) || W(c + i, r + j - 1)) continue; best = [i, j]; break;
    }
    if (best) out.push([o[0], o[1] + best[0] * S, o[2] + best[1] * S, ...o.slice(3)]);
  }
  return out;
}
(() => {
  const _block0 = blockRects;
  blockRects = function (M) { if (fitOn(M)) { const R = waterRects(M); if (R) return R; } return _block0.apply(this, arguments); };
  const _walls0 = mapWalls;
  mapWalls = function (M) {
    const L = _walls0.apply(this, arguments);
    if (!fitOn(M) || !fitBenua(M)) return L;
    const [ox, oy] = WORLD_POS[M.id], out = [], E = 60, PC = 32;
    for (const w of L) { /* tembok tepi: dipecah per 32 px, hanya bagian yang di luarnya bukan wilayah mana pun yang dipertahankan */
      const [x, y, ww, hh] = w, nearL = x < E, nearR = x + ww > M.w - E, nearT = y < E, nearB = y + hh > M.h - E;
      const edge = (nearL || nearR) && hh >= 100 ? 'v' : (nearT || nearB) && ww >= 100 ? 'h' : null;
      if (!edge) { if (regionOwner(ox + x + ww / 2, oy + y + hh / 2) === M.id) out.push(w); continue; }
      const n = Math.ceil((edge === 'v' ? hh : ww) / PC);
      for (let k = 0; k < n; k++) {
        const p = edge === 'v' ? [x, y + k * PC, ww, Math.min(PC, hh - k * PC)] : [x + k * PC, y, Math.min(PC, ww - k * PC), hh];
        const cx = ox + p[0] + p[2] / 2, cy = oy + p[1] + p[3] / 2;
        if (regionOwner(cx, cy) !== M.id) continue;
        const outX = edge === 'v' ? (nearL ? ox - 20 : ox + M.w + 20) : cx, outY = edge === 'h' ? (nearT ? oy - 20 : oy + M.h + 20) : cy;
        if (regionOwner(outX, outY)) continue; /* di seberang ada wilayah lain → lorong terbuka */
        const last = out[out.length - 1]; /* gabung potongan berurutan */
        if (last && last._e === edge && (edge === 'v' ? last[0] === p[0] && last[1] + last[3] === p[1] : last[1] === p[1] && last[0] + last[2] === p[0])) {
          if (edge === 'v') last[3] += p[3]; else last[2] += p[2];
        } else { p._e = edge; out.push(p); }
      }
    }
    return out;
  };
  const _objs0 = mapObjects;
  mapObjects = function (M) { const L = _objs0.apply(this, arguments); return fitOn(M) ? fitObjects(M, L) : L; };
})();
// tanah: piksel milik wilayah lain dibuat transparan (dipanggil grassEdgeCanvas)
function fitClipGround(ctx, W, H, X0, Y0, M) {
  if (!fitOn(M) || !fitBenua(M)) return;
  const others = Object.keys(WORLD_POS).filter(id => id !== M.id && isOutdoorRegion(id)).map(id => [WORLD_POS[id][0], WORLD_POS[id][1], MAPS[id].w, MAPS[id].h])
    .filter(r => r[0] < X0 + W && r[0] + r[2] > X0 && r[1] < Y0 + H && r[1] + r[3] > Y0);
  if (!others.length) return;
  const im = ctx.getImageData(0, 0, W, H), d = im.data; let n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (regionOwner(X0 + x, Y0 + y) !== M.id) { d[(y * W + x) * 4 + 3] = 0; n++; } }
  if (n) ctx.putImageData(im, 0, 0);
}
