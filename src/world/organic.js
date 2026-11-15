'use strict';
// Refactor desain dunia (docs/WORLD_REFACTOR.md) tahap A, B, F-otomatis: jalan TANAH dibelokkan (ujung tetap),
// lapangan bundar tanpa isi penting dikecilkan. Jalan batu (desa, kota, kampus, benteng) tetap lurus = direncanakan.
// Data asli disimpan di M._paths0 / M._discs0. Tepi tak beraturan: noise di makeSD (ground.js), tepi hutan & rumpun: ground.js.
const ORG_SKIP = new Set(['kgate', 'kakademi']);
const ORG_FILL = /tree|pine|rock|bush|stump|log|flower|bloom|pebble|mush|hay|fence|grass|bramble|lamp|sign|board|bench/i;
function orgPlanned(M) { const GP = typeof GROUND !== 'undefined' && GROUND[M.ground]; return !!(M.indoor || !GP || GP.path !== 'dirt' || ORG_SKIP.has(M.id)); }
// satu ruas lurus → beberapa ruas yang berkelok halus (amplitudo ≤ 9% panjang, maks 46 px), titik ujung tetap
function orgCurve(a, b, c, d, r, seed) {
  const L = Math.hypot(c - a, d - b); if (L < 100) return [[a, b, c, d, r]];
  const n = Math.max(2, Math.round(L / 55)), nx = -(d - b) / L, ny = (c - a) / L;
  const s = hash(Math.round(a) + seed, Math.round(b), 5), A = Math.min(L * .09, 46) * (s < .5 ? 1 : -1), f = 1.1 + s * 1.4, out = [];
  let px = a, py = b;
  for (let i = 1; i <= n; i++) {
    const t = i / n, w = i === n ? 0 : Math.sin(t * Math.PI) * Math.sin(t * Math.PI * f + s * 6) * A;
    const qx = i === n ? c : a + (c - a) * t + nx * w, qy = i === n ? d : b + (d - b) * t + ny * w;
    out.push([Math.round(px), Math.round(py), Math.round(qx), Math.round(qy), Math.round(r * (.88 + .24 * hash(i, seed, 7)))]); px = qx; py = qy;
  }
  return out;
}
(function organicWorld() {
  for (const id in MAPS) {
    const M = MAPS[id];
    if (M.river && !M._rw0) { M._rw0 = M.river.w; M.river.w = Math.round(M.river.w * WATER_WIDEN); } /* sungai berliku ikut dilebarkan */
    if (orgPlanned(M) || M._paths0) continue;
    M._paths0 = M.paths || []; M._discs0 = M.discs || [];
    M.paths = M._paths0.flatMap((p, i) => orgCurve(p[0], p[1], p[2], p[3], p[4] || 12, i * 31 + id.length));
    M.discs = M._discs0.map(D => {
      const [x, y, r] = D; if (r <= 26) return D; // batu warp & lapangan kecil tetap
      const poi = (M.objs || []).some(o => !ORG_FILL.test(o[0]) && Math.hypot(o[1] - x, o[2] - y) < r) ||
        (M.npcs || []).some(n => Math.hypot(n.x - x, n.y - y) < r) || (M.chests || []).some(c => Math.hypot(c.x - x, c.y - y) < r);
      return [x, y, Math.round(r * (poi ? .85 : .55)), ...D.slice(3)];
    });
  }
})();
waterRelocate();
