'use strict';
// Bentuk air alami: elips `ponds` digabung halus (smooth union) jadi alur sungai menyambung,
// lalu garis pantai diberi liuk noise (teluk & tanjung). Dipakai untuk gambar tanah, tabrakan, dan sebaran objek.
// waterE(...) < 1 = air. Setelah dipanggil: waterE.r = jari-jari elips terdekat (px), waterE.cy = pusat y-nya.
function pondsNear(M, x0, y0, x1, y1) {
  return (M.ponds || []).filter(P => P[0] + P[2] * 1.6 + 40 > x0 && P[0] - P[2] * 1.6 - 40 < x1 && P[1] + P[3] * 1.6 + 40 > y0 && P[1] - P[3] * 1.6 - 40 < y1);
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
function waterGXY(M) { return (typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id]) || [0, 0]; }
