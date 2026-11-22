'use strict';
// SEMAK, BATU & HIASAN GAYA SPROUT LANDS — untuk peta di GRASS_EDGE.maps (world/grass_edge.js).
// Lembar: assets/img/ground/deco_sprout_objs.png (Grass_Biom_Objects, 16 px) digambar 2× (proporsi Sprout: objek ≈ setengah tinggi tokoh).
// 1) Objek baru `sp*` di OBJ (tekstur otomatis lewat art<Nama>() di buildTextures).
// 2) Hiasan tambahan disebar per kotak autotile: rumput (semak, bunga, jamur, tunas), tanah/pasir (batu kecil), air (teratai, batu air).
// 3) Objek lama semak/batu/tunggul di peta ini memakai gambar Sprout (jenis & perilaku tetap, hanya teksturnya).
const SPROUT_DECO = {
  on: true, sheet: 'deco_sprout_objs', scale: 2, gap: 22,
  // [jenis, peluang per kotak] — rumput hanya kotak yang 8 tetangganya rumput juga
  grass: [['spBush', .007], ['spBerry', .003], ['spRockB', .002], ['spRock', .004], ['spStump', .0015], ['spLog', .001], ['spMush', .002],
    ['spMush1', .002], ['spMushP', .0015], ['spSprout', .008], ['spSprout2', .008], ['spFlowerY', .006], ['spFlowerY2', .004],
    ['spFlowerB', .004], ['spFlowerP', .006], ['spFlowerP2', .004], ['spSun', .0008]],
  dirt: [['spRock', .003], ['spSprout', .002]],
  sand: [['spRock', .004]],
  water: [['spLily', .012], ['spLilyB', .005], ['spWRock', .002], ['spWRockS', .003]],
  swap: { bushG1: 'spBush', bushG2: 'spBush', bush: 'spBush', verdant_bush: 'spBush', verdant_bush_small: 'spBush', rock: 'spRock',
    rockWoods: 'spRock', verdant_rock_large: 'spRockB', stump: 'spStump', mush: 'spMush', log: 'spLog' },
};
// potongan lembar [x, y, w, h] (piksel asli) + tabrakan 2× [lebar, tinggi, naik]
const SPROUT_OBJ = {
  spBush: [16, 48, 16, 16, [24, 8, 0]], spBerry: [0, 48, 16, 16, [24, 8, 0]], spRock: [114, 18, 10, 8, [16, 6, 0]],
  spRockB: [128, 18, 16, 12, [26, 8, 0]], spStump: [67, 36, 10, 10, [16, 6, 0]], spLog: [80, 35, 16, 10, [28, 6, 0]],
  spMush: [82, 2, 13, 13], spMush1: [100, 4, 10, 11], spMushP: [129, 3, 15, 12], spSprout: [84, 23, 8, 5], spSprout2: [102, 25, 8, 5],
  spFlowerY: [99, 39, 9, 6], spFlowerY2: [114, 37, 11, 9], spFlowerB: [83, 50, 11, 12], spFlowerP: [99, 54, 9, 6], spFlowerP2: [114, 52, 11, 9],
  spSun: [129, 34, 14, 29], spLily: [112, 68, 13, 9], spLilyB: [128, 64, 16, 15], spWRock: [80, 67, 16, 12, [24, 8, 0]], spWRockS: [99, 68, 10, 8],
};
function sproutArt(k) {
  const im = IMGEL[SPROUT_DECO.sheet], d = SPROUT_OBJ[k], s = SPROUT_DECO.scale; if (!im || !d) return null;
  const [c, x] = mk(d[2] * s, d[3] * s); x.imageSmoothingEnabled = false; x.drawImage(im, d[0], d[1], d[2], d[3], 0, 0, d[2] * s, d[3] * s); return c;
}
for (const k in SPROUT_OBJ) {
  const d = SPROUT_OBJ[k]; OBJ[k] = d[4] ? { key: k, col: d[4] } : { key: k };
  window['art' + k[0].toUpperCase() + k.slice(1)] = () => sproutArt(k); /* buildTextures mencari art<Kunci>() */
}
// tekstur verdant_* (gambar GPT-nya tidak pernah ada → dulu kanvas kosong = semak/batu tak terlihat tapi menghalangi) → gambar Sprout
const SPROUT_ALIAS = { verdant_bush: 'spBush', verdant_bush_small: 'spBerry', verdant_stump: 'spStump', verdant_rock_large: 'spRockB',
  verdant_rock_med: 'spRock', verdant_rock_pillar: 'spRockB', verdant_log: 'spLog' };
for (const k in SPROUT_ALIAS) window['art' + k[0].toUpperCase() + k.slice(1)] = () => sproutArt(SPROUT_ALIAS[k]);
// tebing dari lembar Sprout Hills (gnd_hills_sprout.png, petak 16 px, digambar 2×):
// mendatar = dataran rumput + muka tanah; tegak (kiri/kanan) = tepi dataran; lereng = tangga (bisa dilalui)
function sproutHills(parts, w, h) {
  const im = IMGEL.gnd_hills_sprout; if (!im) return mk(32, 32)[0];
  const [c, x] = mk(w * 32, h * 32); x.imageSmoothingEnabled = false;
  for (const [sx, sy, dx, dy] of parts) x.drawImage(im, sx * 16, sy * 16, 16, 16, dx * 32, dy * 32, 32, 32);
  return c;
}
const CLIFF_ROW = [[2, 1, 0, 0], [2, 1, 1, 0], [2, 1, 2, 0], [2, 1, 3, 0], [2, 2, 0, 1], [2, 2, 1, 1], [2, 2, 2, 1], [2, 2, 3, 1]];
const CLIFF_ART = {
  verdant_cliff_straight: () => sproutHills(CLIFF_ROW, 4, 2),
  verdant_cliff_corner: () => sproutHills(CLIFF_ROW, 4, 2),
  verdant_cliff_vert: () => sproutHills([[3, 1, 0, 0], [3, 1, 0, 1], [3, 1, 0, 2], [3, 1, 0, 3]], 1, 4),
  verdant_cliff_slope: () => sproutHills([[2, 1, 0, 0], [4, 4, 1, 0], [5, 4, 2, 0], [2, 1, 3, 0],
    [2, 2, 0, 1], [4, 5, 1, 1], [5, 5, 2, 1], [2, 2, 3, 1]], 4, 2),
};
OBJ.verdant_cliff_vert = { key: 'verdant_cliff_vert', col: [0, 0, 0] };
for (const k in CLIFF_ART) window['art' + k[0].toUpperCase() + k.slice(1)] = CLIFF_ART[k];
// hiasan tambahan untuk satu wilayah (koordinat lokal), stabil per posisi
function sproutDecoFor(M, base) {
  const E = typeof grassEdgeData === 'function' && grassEdgeData(M); if (!E) return null;
  const S = GRASS_EDGE.cell, C = E.cols, R = E.rows, out = [], taken = [];
  const near = (x, y, r) => taken.some(p => Math.abs(p[0] - x) < r && Math.abs(p[1] - y) < r);
  for (const o of base) taken.push([o[1], o[2]]);
  const doors = typeof mapDoors === 'function' ? mapDoors(M) : [];
  const busy = (x, y) => doors.some(ex => x > ex.x - 64 && x < ex.x + ex.w + 64 && y > ex.y - 64 && y < ex.y + ex.h + 72) ||
    (M.npcs || []).some(n => Math.hypot(n.x - x, n.y - y) < 30) || (M.enemies || []).some(e => Math.hypot(e[1] - x, e[2] - y) < 24) ||
    (M.chests || []).some(c => Math.hypot(c.x - x, c.y - y) < 30);
  const all = (m, c, r) => {
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const cc = c + i, rr = r + j; if (cc < 0 || rr < 0 || cc >= C || rr >= R || !m[rr * C + cc]) return 0;
    }
    return 1;
  };
  for (let r = 1; r < R - 1; r++) for (let c = 1; c < C - 1; c++) {
    const k = r * C + c;
    const list = all(E.grass, c, r) ? SPROUT_DECO.grass : E.Wm[k] ? (E.dep[k] >= 2 ? SPROUT_DECO.water : null)
      : all(E.dirt, c, r) ? SPROUT_DECO.dirt : E.strip[k] && !E.Wm[k] ? SPROUT_DECO.sand : null;
    if (!list) continue;
    let h = hash(c, r, 301);
    for (const [t, p] of list) {
      if (h >= p) { h -= p; continue; }
      const x = c * S + 3 + ((hash(c, r, 302) * (S - 6)) | 0), y = r * S + 6 + ((hash(c, r, 303) * (S - 6)) | 0);
      const big = !!SPROUT_OBJ[t][4], gap = big ? 30 : SPROUT_DECO.gap;
      if (!near(x, y, gap) && !busy(x, y)) { out.push([t, x, y, hash(c, r, 304) < .5 ? { flip: 1 } : undefined]); taken.push([x, y]); }
      break;
    }
  }
  return out;
}
// tambahkan ke daftar objek wilayah (dipakai World, benua, peta kecil); hanya disimpan bila gambar sudah dimuat
const _mapObjectsSprout = mapObjects;
mapObjects = function (M) {
  const L = _mapObjectsSprout(M);
  if (!SPROUT_DECO.on || !M || !GRASS_EDGE.maps.includes(M.id)) return L;
  if (!M._spAdded) { const add = sproutDecoFor(M, L); if (add) { L.push(...add); M._spAdded = 1; } }
  return L;
};
// objek lama (semak/batu/tunggul) di peta Sprout memakai gambar Sprout; jenis & perilaku tidak berubah
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _spawn0 = W.spawnObj;
  W.spawnObj = function (o) {
    const s = _spawn0.apply(this, arguments), sw = SPROUT_DECO.swap[o[0]];
    if (s && sw && SPROUT_DECO.on && this.textures.exists(sw) && sproutRegionAt(this, o[1], o[2])) s.setTexture(sw, 0);
    if (s && o[3] && o[3].vert && this.textures.exists('verdant_cliff_vert')) { /* tebing tegak */
      s.setTexture('verdant_cliff_vert', 0).setOrigin(.5, .5);
    }
    return s;
  };
})();
// wilayah ber-autotile di titik (x, y) scene ini → [peta, x lokal, y lokal] atau null (benua memakai koordinat global)
function sproutRegionAt(sc, x, y) {
  const M = sc.M; if (!M) return null;
  if (!M.benua) return GRASS_EDGE.maps.includes(M.id) ? [M, x, y] : null;
  for (const id of GRASS_EDGE.maps) {
    const P = WORLD_POS[id], R = MAPS[id];
    if (P && R && x >= P[0] && y >= P[1] && x < P[0] + R.w && y < P[1] + R.h) return [R, x - P[0], y - P[1]];
  }
  return null;
}
