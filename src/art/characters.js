'use strict';
// Karakter manusia (peta piksel + mod + palet di CHARS)
// ---------- karakter ----------
const CH_BODY = {
  down: ["......HHHH......", "....HHHHHHHH....", "...HHHHHHHHHH...", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "..HHHSHHHHSHHH..", "..HHSSSHHSSSHH..", "..HSSSSSSSSSSH..", "..HSSESSSSESSH..", "..HSSESSSSESSH..", "..HSrSSSSSSrSH..", "...SSSSSSSSSS...", "....SSSSSSSS....", "....DCCCCCCD....", "...CCCCCCCCCC...", "..SCCCCCCCCCCS..", "..SCCCCCCCCCCS..", "...BBBBBBBBBB...", "....PPPPPPPP...."],
  up: ["......HHHH......", "....HHHHHHHH....", "...HHHHHHHHHH...", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "..HHHHHHHHHHHH..", "...HHHHHHHHHH...", "....SHHHHHHS....", "....DCCCCCCD....", "...CCCCCCCCCC...", "..SCCCCCCCCCCS..", "..SCCCCCCCCCCS..", "...BBBBBBBBBB...", "....PPPPPPPP...."],
  side: [".....HHHH.......", "...HHHHHHHH.....", "..HHHHHHHHHH....", "..HHHHHHHHHHH...", "..HHHHHHHHHHHH..", "..HHHHHHHHSHHH..", "..HHHHHHSSSSHH..", "..HHHHHSSSSSSH..", "..HHHHSSSSSESS..", "..HHHHSSSSSESS..", "..HHHHSSSSSSrS..", "...HHHSSSSSSS...", ".....SSSSSSS....", ".....DCCCCD.....", "....CCCCCCCC....", ".....CCSSCC.....", ".....CCSSCC.....", ".....BBBBBB.....", ".....PPPPPP....."]
};
const CH_LEGS = {
  down: [[".....PP..PP.....", ".....KK..KK....."], [".....PP..KK.....", ".....KK........."], [".....KK..PP.....", ".........KK....."]],
  up: [[".....PP..PP.....", ".....KK..KK....."], [".....PP..KK.....", ".....KK........."], [".....KK..PP.....", ".........KK....."]],
  side: [["......PPPP......", "......KKKK......"], [".....PP..PP.....", "....KK....KK...."], ["......PP.PP.....", ".....KK..KK....."]]
};
function chMods(r, dir, o) {
  const set = (x, y, c) => { if (r[y] && x >= 0 && x < 16) r[y][x] = c; };
  const get = (x, y) => r[y] ? r[y][x] : '.';
  if (o.long) {
    if (dir === 'down') for (let y = 11; y <= 16; y++) { set(2, y, 'H'); set(13, y, 'H'); if (y > 12) { set(1, y, 'H'); set(14, y, 'H'); } }
    if (dir === 'up') for (let y = 11; y <= 16; y++) for (let x = 3; x <= 12; x++) set(x, y, 'H');
    if (dir === 'side') for (let y = 11; y <= 16; y++) { set(2, y, 'H'); set(3, y, 'H'); set(4, y, 'H'); }
  }
  if (o.ribbon) { if (dir === 'side') { set(3, 1, 'R'); set(2, 2, 'R'); set(3, 2, 'R'); } else { set(11, 1, 'R'); set(12, 1, 'R'); set(12, 2, 'R'); set(13, 2, 'R'); set(3, 2, 'R'); set(2, 2, 'R'); set(3, 1, 'R'); } }
  if (o.beard) {
    if (dir === 'down') { for (let x = 4; x <= 11; x++) set(x, 11, 'W'); for (let x = 5; x <= 10; x++) { set(x, 12, 'W'); set(x, 13, 'W'); } for (let x = 6; x <= 9; x++) set(x, 14, 'W'); set(7, 15, 'W'); set(8, 15, 'W'); }
    if (dir === 'side') { for (let x = 8; x <= 13; x++) set(x, 11, 'W'); for (let x = 8; x <= 12; x++) set(x, 12, 'W'); set(9, 13, 'W'); set(10, 13, 'W'); set(11, 13, 'W'); set(10, 14, 'W'); }
  }
  if (o.apron) { const xs = dir === 'side' ? [8, 9, 10] : [5, 6, 7, 8, 9, 10]; for (let y = 14; y <= 18; y++) for (const x of xs) if (get(x, y) !== '.') set(x, y, 'A'); }
  if (o.scarf) { const xs = dir === 'side' ? [5, 6, 7, 8, 9, 10] : [4, 5, 6, 7, 8, 9, 10, 11]; for (const x of xs) set(x, 13, 'R'); if (dir === 'side') { set(4, 13, 'R'); set(3, 14, 'R'); set(4, 14, 'R'); } if (dir === 'up') { set(9, 14, 'R'); set(9, 15, 'R'); set(10, 15, 'R'); } }
  if (o.hat) {
    for (let y = 0; y <= 4; y++) for (let x = 0; x < 16; x++) { if (y < 4) { if (x >= 4 && x <= 11) set(x, y, 'Y'); else if (get(x, y) === 'H') set(x, y, '.'); } }
    for (let x = 0; x < 16; x++) set(x, 4, 'Y'); for (let x = 1; x < 15; x++) set(x, 5, 'Y');
    for (let x = 4; x <= 11; x++) set(x, 3, 'R'); set(0, 4, '.'); set(15, 4, '.');
  }
  if (o.helm) { for (let y = 0; y <= 6; y++) for (let x = 0; x < 16; x++) if (get(x, y) === 'H') set(x, y, 'M'); if (dir !== 'up') for (let x = 3; x <= 12; x++) if (get(x, 6) === 'M') set(x, 6, 'D'); set(7, 0, 'R'); set(8, 0, 'R'); }
  if (o.crown) { for (let x = 4; x <= 11; x++) set(x, 1, 'Y'); for (let x = 4; x <= 11; x += 2) set(x, 0, 'Y'); set(7, 1, 'R'); set(8, 1, 'R'); }
  if (o.ears && dir !== 'up') { if (dir === 'down') { set(0, 7, 'S'); set(1, 7, 'S'); set(1, 8, 'S'); set(15, 7, 'S'); set(14, 7, 'S'); set(14, 8, 'S'); } else { set(4, 6, 'S'); set(3, 5, 'S'); set(4, 7, 'S'); } }
  if (o.robe) { r[17] = (dir === 'side' ? '.....CCCCCC.....' : '...CCCCCCCCCC...').split(''); r[18] = (dir === 'side' ? '....CCCCCCCC....' : '...CCCCCCCCCC...').split(''); }
}
function chLegs(dir, f, o) {
  if (o.robe || o.dress) {
    const base = dir === 'side' ? ["....CCCCCCCC....", "......KKKK......"] : ["...CCCCCCCCCC...", ".....KK..KK....."];
    if (f === 1) base[1] = dir === 'side' ? ".....KK..KK....." : ".....KK...KK....";
    if (f === 2) base[1] = dir === 'side' ? "......KK.KK....." : "....KK...KK.....";
    return base;
  }
  return CH_LEGS[dir][f];
}
// satu karakter -> strip 9 frame (down0-2, up0-2, side0-2), frame 20x26
const CH_FW = 20, CH_FH = 26;
function artChar(pal, mods = {}) {
  const P = Object.assign({ E: '#3a2438', r: '#ff9e9a', S: '#ffd6b0', B: '#7a4a32', K: '#5a3a30', W: '#ffffff', A: '#fbf3e4', Y: '#f4cc68', R: '#e85a4a', M: '#c0c8d6' }, pal);
  if (!pal.D) P.D = toneC(P.C, -.28);
  const frames = [];
  for (const dir of ['down', 'up', 'side']) for (let f = 0; f < 4; f++) {
    const r = CH_BODY[dir].map(s => s.split(''));
    // kilau mata ala gambar referensi
    if (dir === 'down') { if (r[8][5] === 'E') r[8][5] = 'W'; if (r[8][10] === 'E') r[8][10] = 'W'; }
    if (dir === 'side' && r[8][11] === 'E') r[8][11] = 'W';
    chMods(r, dir, mods);
    if (f === 3) { // pose serang: lengan maju
      if (dir === 'side') { r[15][11] = 'S'; r[15][12] = 'S'; r[14][11] = 'C'; }
      else { r[15][2] = '.'; r[16][2] = '.'; r[14][2] = 'S'; r[15][13] = '.'; r[16][13] = '.'; r[14][13] = 'S'; }
    }
    const legs = chLegs(dir, f === 3 ? 1 : f, mods).map(s => s.split(''));
    const rows = r.concat(legs).map(a => a.join(''));
    const spr = renderMap(rows, P);
    outline(spr);
    const [fc, fx] = mk(CH_FW, CH_FH); fx.drawImage(spr, 1, CH_FH - spr.height - (f === 1 || f === 2 ? 1 : 0));
    frames.push(fc);
  }
  return strip(frames);
}
const CHARS = {
  hero: [{ H: '#8a5434', C: '#4a7ad8', P: '#56506e', K: '#6a4232', R: '#ee5a4a' }, { scarf: 1 }],
  elder: [{ H: '#e2e2ea', C: '#7a5aa8', K: '#4a3a5a' }, { beard: 1, robe: 1 }],
  girl: [{ H: '#ffd64a', C: '#8ac4f0', K: '#5a4a8a', R: '#ff6a9a' }, { long: 1, ribbon: 1, dress: 1 }],
  farmer: [{ H: '#8a5a2a', C: '#f0ece0', P: '#3a5ab8', K: '#5a3420' }, { hat: 1 }],
  inn: [{ H: '#b8432a', C: '#5aa04a', K: '#4a2c18' }, { long: 1, apron: 1, dress: 1 }],
  merchant: [{ H: '#3a2a20', C: '#c84a3a', K: '#4a2c18' }, { apron: 1, long: 1, dress: 1 }],
  child: [{ H: '#e88a3a', C: '#f0c040', P: '#3a8a5a' }, {}],
  guard: [{ H: '#5a3a2a', C: '#a83a3a', P: '#4a4a5a', M: '#b8c0cc' }, { helm: 1 }],
  woman: [{ H: '#5a3a2a', C: '#e88ab0', K: '#5a2a3a' }, { long: 1, dress: 1 }],
  goblin: [{ H: '#3a2a1a', S: '#7ac84a', C: '#8a6a3a', P: '#5a4a2a', E: '#ff3a2a', r: '#5aa83a', B: '#4a3420' }, { ears: 1 }],
  gking: [{ H: '#3a2a1a', S: '#6ab83a', C: '#7a3aa8', P: '#3a2a4a', E: '#ffea3a', r: '#4a983a', Y: '#ffd23a', R: '#ff3a5a' }, { ears: 1, crown: 1, robe: 1 }],
};
Object.assign(CHARS, {
  skel: [{ H: '#e8e2d0', S: '#f0ead8', C: '#5a5068', P: '#4a4258', E: '#1a0a1a', r: '#d8d0bc', K: '#3a3040', B: '#c8bea8' }, {}],
  joko: [{ H: '#6a4a2a', C: '#d8a040', P: '#5a6a3a', K: '#5a3420', Y: '#e8c870' }, { hat: 1 }],
});
CHARS.hunter = [{ H: '#3a2a1a', C: '#5a7a3a', P: '#5a4a3a', Y: '#a87a3a', K: '#5a3420' }, { hat: 1 }];
Object.assign(CHARS, {
  witch: [{ H: '#5a4a8a', C: '#3a2a5a', S: '#dccce8', E: '#e83ae0', r: '#c8a8d8', Y: '#3a2a5a', R: '#c84ae0', K: '#2a1a3a' }, { hat: 1, robe: 1, long: 1 }],
  hermit: [{ H: '#d8d8e0', C: '#6a7a5a', K: '#4a3a2a' }, { beard: 1, robe: 1 }],
  lestari: [{ H: '#5a3a6a', C: '#4a6ac8', P: '#3a3a5a', K: '#2a2a3a', Y: '#e8d8a0' }, { long: 1 }],
  gun: [{ H: '#3a2a1a', C: '#c87a3a', P: '#5a4a3a', K: '#3a2a1a', Y: '#e8c050' }, { hat: 1 }],
  ratih: [{ H: '#e4e4ec', C: '#6a8aa4', P: '#4a5a6a', K: '#3a3a4a', Y: '#d0a878' }, { long: 1 }],
  wati: [{ H: '#3a2414', C: '#7ab05a', P: '#6a5a3a', K: '#3a2a1a', Y: '#f0c890' }, { long: 1 }],
  darma: [{ H: '#2a1a10', C: '#a03a3a', P: '#3a3a4a', K: '#2a2a2a', Y: '#e8c050' }, { hat: 1 }],
  bayu: [{ H: '#5a3a1a', C: '#e0a040', P: '#5a4a3a', K: '#3a2a1a', Y: '#7ac0e0' }, { hat: 1 }],
  nila: [{ H: '#f0f4fa', C: '#3a7ac8', P: '#4a5a7a', K: '#2a3a5a', Y: '#8ad0ff' }, { hat: 1, long: 1 }],
  mom: [{ H: '#e8b040', C: '#d87a5a', K: '#5a3a2a' }, { long: 1, dress: 1, apron: 1 }],
  priest: [{ H: '#e0e4f0', C: '#f0f4fc', K: '#8aa0c8', Y: '#ffd870' }, { robe: 1, beard: 0 }],
});
