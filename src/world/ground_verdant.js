'use strict';
// Tanah Verdant (Padang, Hutan, Hutan Dalam, Desa) gaya Senja Emas (G001 - G024).
// Ubin ground 256×256 px, tepi jalan berenda daun alami, ornamen clutter & pulau rumput.
const VERDANT = {};
const VBAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const VDECO = ['tuft', 'sprout_a', 'sprout_b', 'sprout_c', 'flower_w', 'flower_w2', 'flower_w3', 'flower_b', 'flower_b2', 'flowers', 'flowers_w',
  'mushroom', 'pebble', 'pebbles', 'reeds',
  'water_rock_cluster', 'water_rock_med', 'water_rock_small', 'water_pebble',
  'water_stepstone', 'water_lilypad', 'water_lotus', 'water_reeds_lush', 'water_reeds_short',
  'water_dock', 'water_boat', 'water_pier',
  ...['w', 'p', 'y', 'v'].flatMap(c => [1, 2, 3].map(n => 'fl_' + c + n))];
const MEADOW_FLOWERS = [
  'flower_white_single', 'flower_white_med', 'flower_blue_single', 'flower_blue_med',
  'flower_cream_single', 'flower_cream_med', 'flower_mix_large', 'flower_mix_dense'
];

const V_TILES = [
  'gnd_meadow_base', 'gnd_meadow_path',
  'gnd_forest_base', 'gnd_forest_path',
  'gnd_deepwood_base', 'gnd_deepwood_path',
  'gnd_grass', 'gnd_grass_light', 'gnd_grass_dark', 'gnd_dirt'
];
const CLUTTER_PADANG = [
  'clutter_clover1', 'clutter_clovers', 'clutter_grass1', 'clutter_grass2', 'clutter_grass3',
  'clutter_grass_patch', 'clutter_herb_patch', 'clutter_leaves', 'clutter_mushrooms',
  'clutter_oak_leaf', 'clutter_pebbles', 'clutter_sprout', 'clutter_stepping_stone',
  'clutter_twig', 'clutter_twigs_pile', 'clutter_wild_cluster'
];
const CLUTTER_FOREST = [
  'fclutter_fallen_leaves', 'fclutter_fiddlehead', 'fclutter_forest_flower',
  'fclutter_grass_patch', 'fclutter_grass_tuft', 'fclutter_herb_cluster',
  'fclutter_moss_patch', 'fclutter_mossy_pebbles', 'fclutter_mushroom',
  'fclutter_mushrooms_pair', 'fclutter_oak_leaf', 'fclutter_sprout',
  'fclutter_stepping_stone', 'fclutter_twig', 'fclutter_twigs_pile', 'fclutter_wild_herb'
];
const CLUTTER_DEEPWOOD = [
  'dwclutter_fallen_leaves', 'dwclutter_fiddlehead', 'dwclutter_forest_flower',
  'dwclutter_grass_patch', 'dwclutter_grass_tuft', 'dwclutter_herb_cluster',
  'dwclutter_moss_patch', 'dwclutter_mossy_pebbles', 'dwclutter_mushroom',
  'dwclutter_mushrooms_pair', 'dwclutter_oak_leaf', 'dwclutter_sprout',
  'dwclutter_stepping_stone', 'dwclutter_twig', 'dwclutter_twigs_pile', 'dwclutter_wild_herb'
];
const ISLANDS_PADANG = ['grass_island_1', 'grass_island_2', 'grass_island_3', 'grass_island_4'];
const ISLANDS_FOREST = ['forest_grass_island_1', 'forest_grass_island_2', 'forest_grass_island_3', 'forest_grass_island_4'];
const ISLANDS_DEEPWOOD = ['deepwood_moss_island_1', 'deepwood_moss_island_2', 'deepwood_moss_island_3', 'deepwood_moss_island_4'];
const WATER_DECO_PADANG = ['water_pebble', 'water_rocks', 'water_reeds_slim', 'water_reeds_dense'];
const WATER_DECO_FOREST = ['fwater_pebble', 'fwater_rocks', 'fwater_reeds_slim', 'fwater_reeds_dense'];

if (typeof IMG_LIST !== 'undefined') {
  IMG_LIST.push(
    ...V_TILES, ...VDECO.map(k => 'deco_' + k), ...MEADOW_FLOWERS,
    ...CLUTTER_PADANG, ...CLUTTER_FOREST, ...CLUTTER_DEEPWOOD,
    ...ISLANDS_PADANG, ...ISLANDS_FOREST, ...ISLANDS_DEEPWOOD,
    ...WATER_DECO_PADANG, ...WATER_DECO_FOREST
  );
}

const VT_MAP = {};
function verdantTiles(M) {
  const gKey = (M && (M.id === 'deepwood' ? 'deepwood' : M.ground)) || 'meadow';
  if (VT_MAP[gKey]) return VT_MAP[gKey];
  let bk = 'gnd_meadow_base', pk = 'gnd_meadow_path';
  if (gKey === 'deepwood') { bk = 'gnd_deepwood_base'; pk = 'gnd_deepwood_path'; }
  else if (gKey === 'forest') { bk = 'gnd_forest_base'; pk = 'gnd_forest_path'; }
  const b = getTileData(bk) || getTileData('gnd_grass');
  const p = getTileData(pk) || getTileData('gnd_dirt');
  if (b && p) {
    const l = getTileData('gnd_grass_light') || b;
    const d = getTileData('gnd_grass_dark') || b;
    VT_MAP[gKey] = [b, l, d, p];
    return VT_MAP[gKey];
  }
  return null;
}

const vModW = (v, sz) => ((v % sz) + sz) % sz;
// nilai bercak tanah (0..1) pada koordinat global (ambang tinggi agar tidak menjadi polkadot)
const vDirtN = (X, Y) => vnoise(X, Y, 30, 13) * .75 + vnoise(X, Y, 9, 14) * .25;
const vDirtT = M => M.ground === 'village' ? .82 : M.ground === 'forest' ? .87 : .85;

// warna tanah verdant per piksel (X, Y global); null = petak belum termuat
function verdantPix(M, X, Y, path) {
  const T = verdantTiles(M); if (!T) return null;
  const sz = T[0].size || 128;
  const t = VBAY[(Y & 3) * 4 + (X & 3)] / 16 - .5;
  const ti = (vModW(Y, sz) * sz + vModW(X, sz)) * 4;
  let s;
  if (path || vDirtN(X, Y) > vDirtT(M) + t * .05) s = T[3];
  else {
    const v = vnoise(X, Y, 56, 11) * .75 + vnoise(X, Y, 20, 12) * .25;
    s = v > .6 + t * .1 ? T[1] : v < .4 + t * .1 ? T[2] : T[0];
  }
  return [s[ti], s[ti + 1], s[ti + 2]];
}

// ornamen: grid teratur global + geser acak (jarak seimbang & lapang, tidak menumpuk)
function verdantDeco(x, M, rect, GX, GY, sd, near) {
  const [RX, RY, RW, RH] = rect, isMeadow = M.ground === 'meadow';
  const C = isMeadow ? 84 : 36, fm = M.flowers ? 1.6 : 1;
  const isDeep = M.id === 'deepwood', isForest = M.ground === 'forest' && !isDeep;
  const cList = isDeep ? CLUTTER_DEEPWOOD : isForest ? CLUTTER_FOREST : CLUTTER_PADANG;
  const waterDeco = isForest || isDeep ? WATER_DECO_FOREST : WATER_DECO_PADANG;
  const useNew = typeof IMGEL !== 'undefined' && IMGEL[cList[0]];

  for (let cy = Math.floor((RY + GY - C) / C); cy <= Math.floor((RY + RH + GY) / C); cy++) {
    for (let cx = Math.floor((RX + GX - C) / C); cx <= Math.floor((RX + RW + GX) / C); cx++) {
      const X = cx * C + Math.floor(hash(cx, cy, 61) * (C * 0.5)) - GX;
      const Y = cy * C + Math.floor(hash(cx, cy, 62) * (C * 0.5)) - GY;
      if (X < 0 || Y < 0 || X > M.w - 8 || Y > M.h - 8) continue;

      const d = sd(X + 4, Y + 6);
      if (d < 4) continue; // Jalan setapak tanah bersih lapang

      // Hiasan tepi air / alang-alang
      if (near(X + 4, Y + 6)) {
        if (hash(cx, cy, 67) < 0.15 && useNew) {
          const wKey = waterDeco[Math.floor(hash(cx, cy, 68) * waterDeco.length)];
          const imW = IMGEL[wKey];
          if (imW && !(X + imW.width < RX || X > RX + RW || Y + imW.height < RY || Y > RY + RH)) {
            x.drawImage(imW, X - (imW.width >> 1), Y - (imW.height >> 1));
          }
        }
        continue;
      }

      if (isMeadow) {
        // Padang Angin gaya referensi pemilik: rumput bersih mulus tanpa rumput acak, bunga klaster 2-4 kuntum berjarak lega
        if (hash(cx, cy, 63) < 0.22) {
          const num = 2 + Math.floor(hash(cx, cy, 64) * 3);
          const fKeys = ['flower_white_single', 'flower_white_med', 'flower_blue_single', 'flower_blue_med', 'flower_cream_single',
            'deco_flower_w', 'deco_flower_b', 'deco_fl_w1', 'deco_fl_w2', 'deco_fl_v1', 'deco_fl_v2', 'deco_fl_p1'];
          const offs = [[0, 0], [7, 4], [-6, 5], [4, -5]];
          for (let f = 0; f < num; f++) {
            const k = fKeys[Math.floor(hash(cx * 9 + f, cy * 9 + f, 65) * fKeys.length)];
            const imF = typeof IMGEL !== 'undefined' ? (IMGEL[k] || IMGEL['deco_' + k] || IMGEL.deco_flower_w) : null;
            if (!imF) continue;
            const fx = X + offs[f][0], fy = Y + offs[f][1];
            if (fx + imF.width < RX || fx > RX + RW || fy + imF.height < RY || fy > RY + RH) continue;
            x.drawImage(imF, fx, fy);
          }
        }
        continue;
      }

      let im = null;
      if (useNew) {
        const r = hash(cx, cy, 63);
        const onDirt = vDirtN(X + GX + 4, Y + GY + 6) > vDirtT(M);
        if (onDirt) {
          if (r < 0.15) {
            const idx = 8 + Math.floor(hash(cx, cy, 64) * 8);
            im = IMGEL[cList[idx % cList.length]];
          }
        } else {
          // Bunga liar & rumput kecil tumbuh manis dengan ruang napas luas
          if (r < (0.16 * fm)) {
            const idx = Math.floor(hash(cx, cy, 64) * 8);
            im = IMGEL[cList[idx]];
          }
        }
      } else {
        const W = [['tuft', .12], ['sprout_c', .02], ['sprout_a', .01],
          ['fl_w', .08 * fm], ['fl_p', .04 * fm], ['fl_y', .03 * fm], ['fl_v', .02 * fm],
          ['mushroom', isForest ? .01 : 0]];
        let r = hash(cx, cy, 63), k = null;
        if (vDirtN(X + GX + 4, Y + GY + 6) > vDirtT(M)) k = r < .08 ? 'pebble' : null;
        else for (const [n, p] of W) { if (r < p) { k = n; break; } r -= p; }
        if (k) {
          if (k.startsWith('fl_')) k += 1 + Math.floor(hash(cx, cy, 64) * 3);
          im = IMGEL['deco_' + k];
        }
      }
      if (!im) continue;
      if (X + im.width < RX || X > RX + RW || Y + im.height < RY || Y > RY + RH) continue;
      x.drawImage(im, X, Y);
    }
  }
}

// kaki batu/semak/tunggul ditumbuhi rumput (dipanggil bakeGround setelah bayangan; x ditranslasi -RX,-RY)
const VBASE = /rock|bush|stump|log/;
function verdantBase(x, M, rect) {
  if (!VERDANT[M.ground] || M.ground === 'meadow' || M.indoor) return;
  const im = (typeof IMGEL !== 'undefined' && (IMGEL.clutter_grass1 || IMGEL.fclutter_grass_tuft || IMGEL.deco_tuft));
  if (!im) return;
  if (!M._vbase) M._vbase = mapObjects(M).filter(o => VBASE.test(o[0]) && OBJ[o[0]]).map(o => [o[1], o[2], (OBJ[o[0]].col || [16])[0] + 8]);
  const [RX, RY, RW, RH] = rect || [0, 0, M.w, M.h];
  for (const [ox, oy, w] of M._vbase) {
    if (ox + w < RX - 16 || ox - w > RX + RW + 16 || oy < RY - 8 || oy - 20 > RY + RH) continue;
    const n = 3 + Math.floor(hash(ox, oy, 71) * 3);
    for (let k = 0; k < n; k++) {
      const X = Math.round(ox + (hash(ox, oy, 72 + k) - .5) * w * 1.15 - im.width / 2);
      const Y = Math.round(oy - im.height + 3 + hash(ox, oy, 80 + k) * 4);
      x.drawImage(im, X, Y);
    }
  }
}

// air sungai & danau gaya referensi pemilik: biru jernih kaya, riak lembut, buih kontak tepi
const VWC = {
  deep: [42, 118, 196], mid: [58, 146, 222], shal: [96, 186, 240],
  ripple: [172, 226, 255], foam: [224, 244, 255]
};
function verdantWater(t, X, Y) {
  const b = VBAY[(Y & 3) * 4 + (X & 3)] / 16 - .5, v = t + b * .035 + vnoise(X, Y, 64, 21) * .2 - .1;
  let c = v > .84 ? VWC.shal : v > .35 ? VWC.mid : VWC.deep;
  // riak gelombang air alami mengalir lembut
  const rip = Math.sin(X * 0.12 + Y * 0.6) + Math.sin(X * 0.05 - Y * 0.25) * 1.2;
  if (rip > 1.82 && t < 0.8) c = VWC.ripple;
  else if (t >= 0.94) c = VWC.foam; // buih putih lembut di kontak daratan
  return c;
}

// tepi air alami: tepian pasir keemasan & kerikil sungai halus menyatu mulus tanpa celah hitam
const VBANK = {
  sand: [196, 178, 142], sand2: [172, 154, 120], pebble: [142, 128, 108], foam: [224, 244, 255]
};
function verdantBank(M, d, X, Y, north) {
  if (d < 1.1) return VBANK.foam;
  const n = vnoise(X, Y, 32, 51), w = (north ? 3.5 : 2.0) + n * 4.0;
  if (d < w) {
    const p = hash(X >> 2, Y >> 2, 73);
    return p > 0.6 ? VBANK.pebble : p > 0.25 ? VBANK.sand2 : VBANK.sand;
  }
  return null;
}

function regVerdantTex(T) {
  if (typeof IMGEL === 'undefined' || !T) return;
  for (const k of VDECO) {
    const n = 'deco_' + k, img = IMGEL[n];
    if (img && !T.exists(n)) T.addImage(n, img);
  }
}

// Pantulan pohon & rumah di air (dipanggang ke tanah) (T459)
function verdantReflect(x, M, rect) {
  if (!M.ponds || !M.ponds.length || M.indoor) return;
  const [RX, RY, RW, RH] = rect || [0, 0, M.w, M.h];
  const objs = mapObjects(M);
  for (const o of objs) {
    const type = o[0], ox = o[1], oy = o[2];
    if (!type.startsWith('tree') && !type.startsWith('house')) continue;
    if (typeof waterE !== 'function') continue;
    const distToWater = waterE(M.ponds, ox, oy + 20);
    if (distToWater > 1.3) continue;

    const d = OBJ[type];
    const imgKey = d ? d.key : null;
    const img = imgKey && typeof IMGEL !== 'undefined' ? IMGEL[imgKey] : null;
    if (!img) continue;

    const iw = img.width, ih = img.height;
    if (ox + iw / 2 < RX || ox - iw / 2 > RX + RW || oy > RY + RH + ih || oy + ih < RY) continue;

    x.save();
    x.globalAlpha = 0.22;
    x.translate(ox, oy);
    x.scale(1, -0.6);
    x.drawImage(img, -iw / 2, 0);
    x.restore();
  }
}

// Tepi jalan berenda daun alami (scalloped leaf rim) meniru konsep G001
function verdantScallop(X, Y) {
  const C = 11, gx = Math.floor(X / C), gy = Math.floor(Y / C);
  let minD = 999;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = gx + i, cy = gy + j;
      const jx = (cx + 0.2 + 0.6 * hash(cx, cy, 51)) * C;
      const jy = (cy + 0.2 + 0.6 * hash(cx, cy, 52)) * C;
      const d = Math.hypot(X - jx, Y - jy);
      if (d < minD) minD = d;
    }
  }
  return Math.max(0, 7.5 - minD) * 1.15;
}

function verdantEdgePix(M, X, Y, d) {
  if (d < -7 || d > 7) return null;
  const T = verdantTiles(M); if (!T) return null;
  const sz = T[0].size || 128;
  const da = d + verdantScallop(X, Y) - 3.6;
  const ti = (vModW(Y, sz) * sz + vModW(X, sz)) * 4;
  if (da < -1.8) return [T[3][ti], T[3][ti + 1], T[3][ti + 2]];
  if (da < 0) return [Math.floor(T[3][ti] * 0.80), Math.floor(T[3][ti + 1] * 0.78), Math.floor(T[3][ti + 2] * 0.70)];
  if (da < 1.6) return [Math.floor(T[0][ti] * 0.70), Math.floor(T[0][ti + 1] * 0.74), Math.floor(T[0][ti + 2] * 0.62)];
  return null;
}

// Jembatan kayu rustik estetik sesuai referensi pemilik (Gambar 1)
function bridgeWoodPix(u, v, len, wid) {
  const isPost = (u < 7 || u > len - 7) && (v < 6 || v > wid - 6);
  if (isPost) {
    const pu = u < 7 ? u : (len - u), pv = v < 6 ? v : (wid - v);
    if (pu === 0 || pv === 0) return [90, 54, 28];
    if (pu <= 2 && pv <= 2) return [238, 208, 164];
    return [178, 124, 76];
  }
  if (v < 5 || v > wid - 5) {
    const e = v < 5 ? v : (wid - v);
    return e <= 1 ? [212, 163, 110] : e <= 3 ? [164, 112, 66] : [78, 44, 22];
  }
  const p = (u + 1000) % 8;
  if (p === 0) return [58, 32, 18];
  if (p === 1) return [204, 160, 106];
  if ((v === 6 || v === wid - 7) && (p === 3 || p === 4)) return [42, 20, 10];
  const sh = p === 7 ? -20 : p === 2 ? 10 : 0, g = Math.floor((hash(u >> 2, v >> 1, 19) - 0.5) * 16);
  const r = Math.max(0, Math.min(255, 158 + sh + g)), gg = Math.max(0, Math.min(255, 104 + sh + Math.floor(g * 0.7)));
  return [r, gg, Math.max(0, Math.min(255, 62 + sh + Math.floor(g * 0.5)))];
}
