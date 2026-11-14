'use strict';
// Tata letak dunia terbuka (Tahap 1): posisi relatif wilayah tetangga dihitung dari pasangan pintu keluar
// di tepi peta (pintu A→B di tepi timur A disejajarkan dengan pintu B→A di tepi barat B, dst.).
// Dipakai systems/openworld.js untuk menggambar wilayah tetangga & menyeberang tanpa layar hitam.
function exitSide(M, e) { return e.x < 20 ? 'W' : e.x + e.w > M.w - 20 ? 'E' : e.y < 20 ? 'N' : e.y + e.h > M.h - 20 ? 'S' : null; }
const OPP = { W: 'E', E: 'W', N: 'S', S: 'N' };
// ---- Tahap 2: posisi global benua (disetujui pemilik: "geser & beri jarak") ----
// Wilayah alam diberi jarak; celahnya diisi medan peralihan (MAPS 'pl_*') yang dibuat otomatis.
// Kelompok kota & Jalan Raya Lama tetap menempel (sudah pas). Koordinat global = posisi kiri-atas wilayah.
const WORLD_POS = {
  village: [3000, 3000], lake: [1600, 3090], road: [1970, 1090], kgate: [1820, 190], kpasar: [1620, -1010], kakademi: [1720, -2010], kbawah: [420, -890],
  meadow: [4424, 2600], snow: [4500, 1000], forest: [2872, 4112], deepwood: [72, 4112], river: [4552, 4112], swamp: [7552, 4112],
};
// [wilayah A, wilayah B, jenis tanah, nama] — dihubungkan lewat medan peralihan
const PERALIHAN = [
  ['village', 'meadow', 'meadow', 'Jalan Desa–Padang'], ['village', 'forest', 'meadow', 'Tepi Hutan Lumina'],
  ['meadow', 'snow', 'meadow', 'Lereng Puncak Beku', [
    [736, 0, 28, 28], [734, 40, 28, 28], [732, 80, 30, 30], [730, 120, 30, 30], [728, 160, 32, 32],
    [728, 240, 32, 32], [726, 280, 34, 34], [726, 320, 34, 34], [726, 360, 34, 34], [726, 400, 34, 34],
  ]], ['meadow', 'swamp', 'meadow', 'Dataran Senja', [
    [1176, 0, 42, 38], [1174, 50, 44, 40], [1172, 100, 44, 40], [1170, 150, 44, 40], [1170, 190, 40, 36],
    [1172, 290, 40, 36], [1174, 330, 44, 40], [1176, 380, 44, 40], [1176, 430, 44, 40], [1176, 472, 44, 40],
  ]],
  ['forest', 'deepwood', 'forest', 'Rimba Peralihan'], ['forest', 'river', 'forest', 'Hulu Sungai Senja', [
    [0, 586, 32, 18], [40, 588, 34, 20], [80, 590, 34, 22], [120, 592, 34, 22], [160, 594, 34, 22],
    [200, 596, 34, 22], [240, 598, 34, 22], [280, 600, 34, 22], [320, 600, 34, 22], [360, 600, 34, 20], [400, 600, 32, 18],
  ]], ['river', 'swamp', 'swamp', 'Muara Rawa'],
];
const SIDE_OF = (M, e) => e.x < 20 ? 'W' : e.x + e.w > M.w - 20 ? 'E' : e.y < 20 ? 'N' : e.y + e.h > M.h - 20 ? 'S' : null;
// monster peralihan: jenis dari kedua wilayah yang diapit, ditaruh di samping jalan (tidak di jalan, tidak di pintu)
function plEnemies(A, B, paths) {
  if (typeof ENEMY === 'undefined') return []; // dimuat juga oleh tools/check-layout.js (tanpa data musuh)
  const types = [...new Set([...(A.enemies || []), ...(B.enemies || [])].map(e => e[0]).filter(t => { const E = ENEMY[t]; return E && !BOSS_AI.includes(E.ai) && !E.isBounty && !(E.scale > 1.3); }))]; if (!types.length) return [];
  const out = []; let k = 0;
  for (const [x1, y1, x2, y2] of paths) { const L = Math.hypot(x2 - x1, y2 - y1); if (L < 140) continue; for (let d = Math.min(160, L / 2); d < L - 70; d += 260) { const t = d / L, px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t, nx = -(y2 - y1) / L, ny = (x2 - x1) / L, side = k % 2 ? 1 : -1; out.push([types[k++ % types.length], Math.round(px + nx * 54 * side), Math.round(py + ny * 54 * side)]); } }
  return out.slice(0, 6);
}
(function buildPeralihan() {
  const PAD = 300, GAPW = 84, inside = (M, e, d) => { const s = SIDE_OF(M, e), cx = e.x + e.w / 2, cy = e.y + e.h / 2; return s === 'W' ? [cx + d, cy] : s === 'E' ? [cx - d, cy] : s === 'N' ? [cx, cy + d] : [cx, cy - d]; };
  for (const item of PERALIHAN) {
    const a = item[0], b = item[1], ground = item[2], name = item[3], ponds = item[4] || [];
    const A = MAPS[a], B = MAPS[b], ea = A.exits.find(e => e.to === b), eb = B.exits.find(e => e.to === a); if (!ea || !eb) { console.warn('Peralihan tanpa pintu', a, b); continue; }
    const sa = SIDE_OF(A, ea), PA = WORLD_POS[a], PB = WORLD_POS[b];
    const ga = [PA[0] + ea.x + ea.w / 2, PA[1] + ea.y + ea.h / 2], gb = [PB[0] + eb.x + eb.w / 2, PB[1] + eb.y + eb.h / 2];
    const vert = sa === 'N' || sa === 'S', top = vert ? (sa === 'S' ? PA[1] + A.h : PB[1] + B.h) : 0, bot = vert ? (sa === 'S' ? PB[1] : PA[1]) : 0;
    const left = vert ? 0 : (sa === 'E' ? PA[0] + A.w : PB[0] + B.w), right = vert ? 0 : (sa === 'E' ? PB[0] : PA[0]);
    let X, Y, W, H;
    if (vert) {
      let minX = Math.min(PA[0], PB[0]);
      if (a === 'village' && b === 'forest') minX = Math.max(minX, 3000);
      const maxX = Math.max(PA[0] + A.w, PB[0] + B.w);
      X = minX; W = maxX - minX; Y = top; H = bot - top;
    } else {
      const minY = Math.min(PA[1], PB[1]), maxY = Math.max(PA[1] + A.h, PB[1] + B.h);
      Y = minY; H = maxY - minY; X = left; W = right - left;
    }
    const id = 'pl_' + a + '_' + b, la = [ga[0] - X, ga[1] - Y], lb = [gb[0] - X, gb[1] - Y];
    // pintu peralihan: di tepi yang menempel ke A dan ke B
    const door = (p, side, to, txy) => side === 'N' ? { x: p[0] - GAPW / 2, y: 0, w: GAPW, h: 12, to, tx: txy[0], ty: txy[1], dir: 'up', label: MAPS[to].name } : side === 'S' ? { x: p[0] - GAPW / 2, y: H - 12, w: GAPW, h: 12, to, tx: txy[0], ty: txy[1], dir: 'down', label: MAPS[to].name } : side === 'W' ? { x: 0, y: p[1] - GAPW / 2, w: 12, h: GAPW, to, tx: txy[0], ty: txy[1], dir: 'left', label: MAPS[to].name } : { x: W - 12, y: p[1] - GAPW / 2, w: 12, h: GAPW, to, tx: txy[0], ty: txy[1], dir: 'right', label: MAPS[to].name };
    const sideA = { S: 'N', N: 'S', E: 'W', W: 'E' }[sa], sideB = { N: 'S', S: 'N', E: 'W', W: 'E' }[sideA === 'N' ? 'N' : sideA === 'S' ? 'S' : sideA === 'W' ? 'W' : 'E'];
    const sb = { N: 'S', S: 'N', W: 'E', E: 'W' }[sideA];
    const exits = [door(la, sideA, a, inside(A, ea, 34)), door(lb, sb, b, inside(B, eb, 34))];
    // jalan setapak berbentuk L yang menyambung kedua pintu
    const mid = vert ? (la[1] + lb[1]) / 2 : (la[0] + lb[0]) / 2;
    const paths = vert ? [[la[0], la[1], la[0], mid, 14], [la[0], mid, lb[0], mid, 14], [lb[0], mid, lb[0], lb[1], 14]] : [[la[0], la[1], mid, la[1], 14], [mid, la[1], mid, lb[1], 14], [mid, lb[1], lb[0], lb[1], 14]];
    const topX = sideA === 'N' ? la[0] : lb[0], botX = sideA === 'N' ? lb[0] : la[0]; // pintu atas/bawah (A bisa di atas atau di bawah)
    const border = vert ? { top: 40, bottom: H - 40, gapT: [topX - 40, topX + 40], gap: [botX - 40, botX + 40], types: ground === 'forest' ? ['pined', 'pine', 'round'] : ['treeAd', 'treeBd', 'treeA'] }
      : { top: 40, bottom: H - 40, gapL: sideA === 'W' ? [la[1] - 40, la[1] + 40] : [lb[1] - 40, lb[1] + 40], gapR: sideA === 'E' ? [la[1] - 40, la[1] + 40] : [lb[1] - 40, lb[1] + 40], types: ground === 'forest' ? ['pined', 'pine', 'round'] : ['treeAd', 'treeBd', 'treeA'] };
    let TT = { meadow: [['treeA', .2], ['treeB', .15], ['bushG2', .2], ['bushG1', .15], ['rock', .2], ['apple1', .05], ['stump', .05]], forest: [['treeAd', .3], ['treeBd', .25], ['pined', .2], ['bushG2', .1], ['stump', .05], ['rock', .1]], swamp: [['bushG1', .35], ['rock', .25], ['stump', .2], ['treeBd', .2]] }[ground];
    if (id === 'pl_meadow_snow') TT = [['treeA', .15], ['treeSn', .25], ['rock', .25], ['bushW', .15], ['bushG2', .1], ['stump', .1]];
    MAPS[id] = { id, name, w: Math.round(W), h: Math.round(H), ground, bgm: A.bgm, scale: Math.max(A.scale || 1, B.scale || 1), peralihan: [a, b],
      paths, discs: [], objs: [], ponds, npcs: [], enemies: plEnemies(A, B, paths), exits, border,
      trees: { n: Math.round(W * H / (ground === 'forest' ? 2600 : 4600)), min: 30, types: TT } };
    WORLD_POS[id] = [Math.round(X), Math.round(Y)];
    // pintu lama A→B dan B→A sekarang menuju medan peralihan
    Object.assign(ea, { to: id, tx: la[0] + (sideA === 'N' ? 0 : sideA === 'S' ? 0 : sideA === 'W' ? 34 : -34), ty: la[1] + (sideA === 'N' ? 34 : sideA === 'S' ? -34 : 0), label: name });
    Object.assign(eb, { to: id, tx: lb[0] + (sb === 'W' ? 34 : sb === 'E' ? -34 : 0), ty: lb[1] + (sb === 'N' ? 34 : sb === 'S' ? -34 : 0), label: name });
  }
})();
const NEIGH = {}; // id → [{ to, side, ox, oy, ex }]
(function buildNeighbors() {
  for (const A of Object.values(MAPS)) {
    if (A.indoor) continue; NEIGH[A.id] = [];
    for (const ea of A.exits || []) {
      const B = MAPS[ea.to], side = exitSide(A, ea); if (!B || B.indoor || !side) continue;
      const eb = (B.exits || []).find(e => e.to === A.id && exitSide(B, e) === OPP[side]); if (!eb) continue;
      const ca = [ea.x + ea.w / 2, ea.y + ea.h / 2], cb = [eb.x + eb.w / 2, eb.y + eb.h / 2];
      let ox, oy;
      if (side === 'E') { ox = A.w; oy = ca[1] - cb[1]; } else if (side === 'W') { ox = -B.w; oy = ca[1] - cb[1]; }
      else if (side === 'N') { oy = -B.h; ox = ca[0] - cb[0]; } else { oy = A.h; ox = ca[0] - cb[0]; }
      if (WORLD_POS[A.id] && WORLD_POS[B.id]) { ox = WORLD_POS[B.id][0] - WORLD_POS[A.id][0]; oy = WORLD_POS[B.id][1] - WORLD_POS[A.id][1]; }
      NEIGH[A.id].push({ to: B.id, side, ox: Math.round(ox), oy: Math.round(oy), ex: ea });
    }
    // Tambahkan tetangga outdoor yang menempel di WORLD_POS meskipun tanpa pasangan exit
    const PA = WORLD_POS[A.id];
    if (PA) {
      const has = new Set(NEIGH[A.id].map(n => n.to));
      for (const [bid, PB] of Object.entries(WORLD_POS)) {
        if (bid === A.id || has.has(bid)) continue;
        const B = MAPS[bid]; if (!B || B.indoor) continue;
        const ox = PB[0] - PA[0], oy = PB[1] - PA[1];
        if (ox < A.w + 10 && ox + B.w > -10 && oy < A.h + 10 && oy + B.h > -10) {
          let side = null; /* butuh perbatasan bersama >= 160 px: sudut/celah sempit bukan jalan */
          const spanX = Math.min(A.w, ox + B.w) - Math.max(0, ox), spanY = Math.min(A.h, oy + B.h) - Math.max(0, oy);
          if (Math.abs(ox + B.w) < 10 && spanY >= 160) side = 'W';
          else if (Math.abs(ox - A.w) < 10 && spanY >= 160) side = 'E';
          else if (Math.abs(oy + B.h) < 10 && spanX >= 160) side = 'N';
          else if (Math.abs(oy - A.h) < 10 && spanX >= 160) side = 'S';
          if (side) {
            const overlapX0 = Math.max(0, ox), overlapX1 = Math.min(A.w, ox + B.w);
            const overlapY0 = Math.max(0, oy), overlapY1 = Math.min(A.h, oy + B.h);
            const cx = (overlapX0 + overlapX1) / 2, cy = (overlapY0 + overlapY1) / 2;
            const ex = side === 'E' ? { x: A.w - 12, y: cy - 20, w: 12, h: 40 }
              : side === 'W' ? { x: 0, y: cy - 20, w: 12, h: 40 }
              : side === 'S' ? { x: cx - 20, y: A.h - 12, w: 40, h: 12 }
              : { x: cx - 20, y: 0, w: 40, h: 12 };
            NEIGH[A.id].push({ to: bid, side, ox: Math.round(ox), oy: Math.round(oy), ex, auto: 1 }); /* tanpa pintu: boleh lewat di mana saja */
            has.add(bid);
          }
        }
      }
    }
  }
})();
