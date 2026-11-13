'use strict';
// MODE BENUA (dunia satu peta, tahap 1): semua wilayah luar ruang dibangun SEKALIGUS dalam satu scene `World` berkoordinat
// global (WORLD_POS). File tiap wilayah TIDAK diubah: datanya digeser saat MAPS.benua dibangun (buildBenua). Interior/gua tetap
// peta terpisah. Save tetap menyimpan id wilayah + koordinat lokal (benuaLocalize), jadi kompatibel dengan mode lama.
// BAWAAN sejak v1.29.0. Matikan (mode lama multi-scene): ?benua=0 (diingat di localStorage), nyalakan: ?benua=1.
// Status & sisa pekerjaan: docs/HANDOFF_OPENWORLD.md.
const BENUA = (() => {
  try {
    const q = /[?&]benua=([01])/.exec(location.search);
    if (q) localStorage.setItem('lumina_benua', q[1]);
    const v = localStorage.getItem('lumina_benua');
    if (v !== null) return v === '1';
    return !navigator.webdriver; // BAWAAN: mode benua. Tes otomatis lama memakai mode lama kecuali lumina_benua='1'
  } catch (_) { return false; }
})();
const OBJ_CELL = 512, OBJ_NEAR = 1000; // petak objek & jarak muat
function isOutdoorRegion(id) { const M = MAPS[id]; return !!(M && WORLD_POS[id] && !M.indoor && M.ground !== 'room' && M.ground !== 'cave'); }
function regionAt(x, y) {
  for (const id of buildBenua().regions) { const [ox, oy] = WORLD_POS[id], M = MAPS[id]; if (x >= ox && x < ox + M.w && y >= oy && y < oy + M.h) return id; }
  return null;
}
// geser koordinat secara umum: objek {x, y} dan larik angka [x, y, ...]
function shiftDeep(v, ox, oy) {
  if (Array.isArray(v)) {
    if (v.length >= 2 && typeof v[0] === 'number' && typeof v[1] === 'number') return [v[0] + ox, v[1] + oy, ...v.slice(2).map(e => shiftDeep(e, ox, oy))];
    return v.map(e => shiftDeep(e, ox, oy));
  }
  if (v && typeof v === 'object') {
    const o = {};
    for (const k in v) o[k] = (k === 'x' && typeof v.x === 'number') ? v.x + ox : (k === 'y' && typeof v.y === 'number') ? v.y + oy : shiftDeep(v[k], ox, oy);
    return o;
  }
  return v;
}
const BENUA_SHIFT = ['gardens', 'gate', 'torches', 'iceGate', 'crystal', 'barrier', 'mochi', 'ranch', 'glow', 'paths', 'discs', 'rings', 'bosses', 'home',
  'loreSpots', 'lanterns', 'boat', 'reliefs', 'sealDoor', 'patok'];
const BFIELD = {};
function benuaField(k) { // data wilayah (mis. 'patok', 'ranch') berkoordinat global, untuk kode runtime yang membaca this.M.k
  if (!(k in BFIELD)) {
    const id = buildBenua().regions.find(r => MAPS[r][k] !== undefined);
    BFIELD[k] = id ? shiftDeep(MAPS[id][k], WORLD_POS[id][0], WORLD_POS[id][1]) : null;
  }
  return BFIELD[k];
}
function regionClone(id) { // salinan peta wilayah dengan koordinat global (untuk pemanggil spawnX yang membaca this.M)
  const M = MAPS[id], [ox, oy] = WORLD_POS[id], C = Object.assign({}, M, { _ox: ox, _oy: oy });
  for (const k of BENUA_SHIFT) if (M[k] !== undefined) C[k] = shiftDeep(M[k], ox, oy);
  return C;
}
function buildBenua() {
  if (MAPS.benua) return MAPS.benua;
  const ids = Object.keys(WORLD_POS).filter(isOutdoorRegion);
  const B = { id: 'benua', benua: 1, name: 'Benua Lumina', ground: 'meadow', regions: ids, objs: [], walls: [], npcs: [], enemies: [], chests: [],
    fish: [], doors: [], feedSpots: [], animals: [], exits: [], bosses: [], paths: [], butterflies: 0 };
  const xs = ids.map(id => WORLD_POS[id][0]), ys = ids.map(id => WORLD_POS[id][1]);
  B.x0 = Math.min(...xs); B.y0 = Math.min(...ys);
  B.w = Math.max(...ids.map(id => WORLD_POS[id][0] + MAPS[id].w)) - B.x0; B.h = Math.max(...ids.map(id => WORLD_POS[id][1] + MAPS[id].h)) - B.y0;
  for (const id of ids) {
    const M = MAPS[id], [ox, oy] = WORLD_POS[id], S2 = v => shiftDeep(v, ox, oy);
    for (const o of mapObjects(M)) B.objs.push([o[0], o[1] + ox, o[2] + oy, o[3]]);
    for (const r of [...mapWalls(M), ...blockRects(M)]) B.walls.push([r[0] + ox, r[1] + oy, r[2], r[3]]);
    if (M.river) {
      const R = M.river;
      for (let x = 0; x < M.w; x += 8) {
        if (x + 8 > R.bridge[0] + 4 && x < R.bridge[1] - 4) continue;
        B.walls.push([x + ox, riverY(R, x + 4) - R.w / 2 - 1 + oy, 8, R.w + 2]);
      }
    }
    if (M.ring) {
      const R = M.ring;
      for (let a = 0; a < 360; a += 4) {
        if (Math.abs(a - 270) < R.gap - 2) continue; const t = a * Math.PI / 180;
        B.walls.push([R.cx + Math.cos(t) * R.r - 6 + ox, R.cy + Math.sin(t) * R.r - 6 + oy, 12, 12]);
      }
    }
    for (const n of M.npcs || []) B.npcs.push(Object.assign(S2(n), { reg: id }));
    for (const e of M.enemies || []) B.enemies.push([e[0], e[1] + ox, e[2] + oy, ...e.slice(3)]);
    for (const k of ['chests', 'fish', 'doors', 'feedSpots', 'animals', 'bosses', 'paths']) for (const v of M[k] || []) B[k].push(S2(v));
    for (const ex of M.exits || []) if (!isOutdoorRegion(ex.to)) B.exits.push(Object.assign({}, ex, { x: ex.x + ox, y: ex.y + oy }));
    B.butterflies += M.butterflies || 0;
  }
  // objek dimuat per petak saat Arka mendekat (benua_scene.js streamObjs); create tidak membuat objek apa pun
  B._list = []; B.cells = new Map();
  for (const o of B.objs) {
    const k = Math.floor(o[1] / OBJ_CELL) + ',' + Math.floor(o[2] / OBJ_CELL);
    if (!B.cells.has(k)) B.cells.set(k, []);
    B.cells.get(k).push(o);
  }
  MAPS.benua = B;
  return B;
}
// data masuk scene: wilayah luar ruang → peta benua (koordinat global)
function benuaData(data) {
  const id = data.map || 'village';
  if (!BENUA || data.passive || G.title || !isOutdoorRegion(id)) return data;
  const [ox, oy] = WORLD_POS[id];
  return Object.assign({}, data, { map: 'benua', x: (data.x || S.x) + ox, y: (data.y || S.y) + oy, region: id, quiet: true, cam: null });
}
// dipanggil saveGame: simpan wilayah & koordinat lokal
function benuaLocalize(sc) {
  const id = regionAt(sc.pl.x, sc.pl.y) || sc.regId || 'village', [ox, oy] = WORLD_POS[id];
  S.map = id; S.x = Math.round(sc.pl.x - ox); S.y = Math.round(sc.pl.y - oy);
}
// tujuan misi dalam koordinat global
function benuaTarget(goal) {
  if (isOutdoorRegion(goal[0])) { const [ox, oy] = WORLD_POS[goal[0]]; return { x: goal[1] + ox, y: goal[2] + oy }; }
  const B = buildBenua(), cur = S.map, nx = routeNext(cur, goal[0]);
  const ex = B.exits.find(e => e.to === goal[0]) || B.exits.find(e => e.to === nx);
  if (ex) return { x: ex.x + ex.w / 2, y: ex.y + ex.h / 2 };
  if (nx && isOutdoorRegion(nx)) { const [ox, oy] = WORLD_POS[nx]; return { x: ox + MAPS[nx].w / 2, y: oy + MAPS[nx].h / 2 }; }
  return null;
}
