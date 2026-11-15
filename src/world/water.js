'use strict';
// Bentuk air alami: elips `ponds` digabung halus (smooth union) jadi alur sungai menyambung,
// lalu garis pantai diberi liuk noise (teluk & tanjung). Dipakai untuk gambar tanah, tabrakan, dan sebaran objek.
// waterE(...) < 1 = air. Setelah dipanggil: waterE.r = jari-jari elips terdekat (px), waterE.cy = pusat y-nya.
// Elips berurutan yang kecil (sungai) & berdekatan (< 220 px) disambung dengan elips perantara agar alur tidak putus.
const WATER_WIDEN = 1.3;
function pondsBase(M) {
  if (M._pondsB && M._pondsB.src === M.ponds) return M._pondsB;
  // sungai (elips kecil ≤ 70 px) dilebarkan 1.3× agar terasa seperti sungai, bukan parit; danau besar tetap
  const P0 = M.ponds || [], small = Q => Q && Math.min(Q[2], Q[3]) <= 70, near = (a, b) => small(b) && Math.hypot(a[0] - b[0], a[1] - b[1]) < 220;
  const P = P0.map((Q, i) => small(Q) && (near(Q, P0[i - 1]) || near(Q, P0[i + 1])) ? [Q[0], Q[1], Math.round(Q[2] * WATER_WIDEN), Math.round(Q[3] * WATER_WIDEN)] : Q), out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[i + 1]; out.push(a);
    if (!b || Math.min(a[2], a[3]) > 70 * WATER_WIDEN || Math.min(b[2], b[3]) > 70 * WATER_WIDEN) continue;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d > 220) continue;
    const step = Math.min(a[2], a[3], b[2], b[3]) * .8, n = Math.ceil(d / step);
    for (let k = 1; k < n; k++) {
      const t = k / n;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]);
    }
  }
  out.src = M.ponds; return M._pondsB = out;
}
// semua air dunia dalam koordinat global (elips + sungai berliku di dekat tepi wilayah), untuk menyambung air antarwilayah
let WGLOB = null;
function waterGlobal() {
  if (WGLOB) return WGLOB; WGLOB = [];
  if (typeof WORLD_POS === 'undefined') return WGLOB;
  for (const id in WORLD_POS) {
    const M = MAPS[id]; if (!M || M.indoor) continue; const [X, Y] = WORLD_POS[id];
    for (const P of pondsBase(M)) WGLOB.push([P[0] + X, P[1] + Y, P[2], P[3], id]);
    if (M.river) for (let x = 0; x <= M.w; x += 12) {
      if (x > 200 && x < M.w - 200) continue; const r = M.river.w / 2 * 1.1;
      WGLOB.push([x + X, riverY(M.river, x) + Y, r, r, id]);
    }
  }
  return WGLOB;
}
// elips wilayah ini + elips wilayah tetangga yang menyentuh area dekat tepinya (koordinat lokal)
function pondsAll(M) {
  if (M._pondsX && M._pondsX.src === M.ponds) return M._pondsX;
  const out = pondsBase(M).slice(), pos = typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id];
  if (pos && !M.indoor) for (const [gx, gy, rx, ry, id] of waterGlobal()) {
    if (id === M.id) continue; const x = gx - pos[0], y = gy - pos[1];
    if (x + rx * 2 > -160 && x - rx * 2 < M.w + 160 && y + ry * 2 > -160 && y - ry * 2 < M.h + 160) out.push([x, y, rx, ry]);
  }
  out.src = M.ponds; return M._pondsX = out;
}
function pondsNear(M, x0, y0, x1, y1) {
  return pondsAll(M).filter(P => P[0] + P[2] * 1.6 + 40 > x0 && P[0] - P[2] * 1.6 - 40 < x1 && P[1] + P[3] * 1.6 + 40 > y0 && P[1] - P[3] * 1.6 - 40 < y1);
}
function waterE(L, x, y, GX = 0, GY = 0) {
  let sum = 0, best = 9, bp = null; const k = .16;
  for (const P of L) {
    const e = Math.hypot((x - P[0]) / P[2], (y - P[1]) / P[3]);
    if (e < best) { best = e; bp = P; }
    if (e < 3) sum += Math.exp(-e / k);
  }
  if (!bp) return 9;
  const r = Math.min(bp[2], bp[3]); waterE.r = r; waterE.cy = bp[1];
  if (best > 2.4) return best;
  const s = sum > 0 ? -k * Math.log(sum) : best;
  const A = Math.max(3, Math.min(34, r * .2)), sc = Math.max(10, Math.min(80, r * .45)), X = x + GX, Y = y + GY;
  const n = vnoise(X, Y, sc, 51) * .7 + vnoise(X, Y, sc * .35, 52) * .3;
  return s + (n - .5) * 2 * A / r;
}
// posisi global peta (untuk noise yang menyambung antarwilayah)
// semua pintu peta: pintu biasa (M.exits) + sambungan perbatasan antarwilayah (NEIGH[...].ex)
function mapDoors(M) { return [...(M.exits || []), ...((typeof NEIGH !== 'undefined' && NEIGH[M.id]) || []).map(n => n.ex).filter(Boolean)]; }
function waterGXY(M) { return (typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id]) || [0, 0]; }

// hiasan & musuh yang tercebur karena sungai dilebarkan digeser ke darat terdekat (kuil, prasasti, pintu, peti TIDAK digeser)
const WATER_MOVABLE = /bush|mush|apple|orange|pear|flower|bloom|bones|stump|log|tree|pine|rock|herb|grass|fern/i;
function waterRelocate() {
  for (const id in MAPS) {
    const M = MAPS[id]; if (M.indoor) continue;
    const L = pondsBase(M), [GX, GY] = waterGXY(M), R = M.river;
    const wet = (x, y, m) => (L.length && waterE(L, x, y, GX, GY) < 1 + m / Math.max(waterE.r || 30, 1)) || (R && Math.abs(y - riverY(R, x)) < R.w / 2 + m);
    const door = (x, y) => mapDoors(M).some(ex => x > ex.x - 56 && x < ex.x + ex.w + 56 && y > ex.y - 56 && y < ex.y + ex.h + 64);
    const fix = o => { if (!wet(o[1], o[2], 6) && !door(o[1], o[2])) return;
      for (let r = 10; r <= 160; r += 10) for (let a = 0; a < 12; a++) {
        const x = o[1] + Math.cos(a * .5236) * r, y = o[2] + Math.sin(a * .5236) * r;
        if (x > 20 && y > 20 && x < M.w - 20 && y < M.h - 20 && !wet(x, y, 14) && !door(x, y)) { o[1] = Math.round(x); o[2] = Math.round(y); return; }
      } };
    for (const o of M.objs || []) if (Array.isArray(o) && WATER_MOVABLE.test(o[0])) fix(o);
    for (const e of M.enemies || []) if (Array.isArray(e)) fix(e);
  }
}
