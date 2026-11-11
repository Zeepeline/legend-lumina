'use strict';
// Ikon item & senjata
const SWORD = ["......", ".....LL", "KKGLLLLLLLLLLD", "KKGLWWWWWWWWWD", ".....LL"];
function artSword(iron) {
  const rows = ["..G...........", "KKGLLLLLLLLLL.", "KKGWWWWWWWWWWL", "..G..........."];
  return outline(renderMap(rows, { K: '#6a3e1e', G: '#e8c050', L: iron ? '#8a96b0' : '#b08a5a', W: iron ? '#e8f0ff' : '#d8b080' }), '#2a1c2a');
}
// Senjata lain (gambar saat dipakai; titik pegangan di kiri, mengarah ke kanan)
function artSpear() { const rows = ["....................W..", "KKKKKKKKKKKKKKKKKKGLLW.", "....................W.."]; return outline(renderMap(rows, { K: '#7a4a24', G: '#e8c050', L: '#c8d4e8', W: '#f4f8ff' }), '#2a1c2a'); }
function artAxe() { const rows = ["..........LLL", ".........LWWL", "KKKKKKKKKLWWL", ".........LWWL", "..........LLL"]; return outline(renderMap(rows, { K: '#7a4a24', L: '#7a8aa8', W: '#e0e8f8' }), '#2a1c2a'); }
function artBow() { const rows = ["..KK.", "...KS", "....S", "...KS", "G..KS", "...KS", "....S", "...KS", "..KK."]; return outline(renderMap(rows, { K: '#9a6a34', S: '#f0e8d0', G: '#e8c050' }), '#2a1c2a'); }
function artArrow() { const rows = ["F.......W.", "FKKKKKKKLW", "F.......W."]; return outline(renderMap(rows, { K: '#9a6a34', F: '#f0f0f0', L: '#c8d4e8', W: '#8a96b0' }), '#2a1c2a'); }
function artCoin() {
  const frames = []; const ws = [3.5, 2.5, 1, 2.5];
  for (let f = 0; f < 4; f++) { const [c, x] = mk(10, 10); ellF(x, '#a8761a', 5, 5, ws[f] + .5, 4.5); ellF(x, '#ffd23a', 5, 5, ws[f], 4); if (ws[f] > 2) { fr(x, '#fff4a0', 4, 3, 1, 3); } frames.push(outline(c, '#4a2e0a')); }
  return strip(frames);
}
function artPotion(col = '#e8324a', hl = '#ff9aaa') { const [c, x] = mk(12, 14); fr(x, '#8a5a32', 4, 0, 4, 2); fr(x, '#d8e8f0', 4, 2, 4, 3); ellF(x, '#d8e8f0', 6, 8.5, 4.5, 4.5); ellF(x, col, 6, 9, 3.6, 3.4); fr(x, hl, 4, 7, 1, 2); px(x, '#ffffff', 4, 6); return outline(c, '#2a1c2a'); }
function artHeart() { const rows = [".RR.RR.", "RWRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."]; return outline(renderMap(rows, { R: '#ff4a5a', W: '#ffffff' }), '#3a1020'); }
// ---------- ikon item (12x12) ----------
const ICON_MAP = {
  flask: ["....KK......", "....KK......", "...GWWG.....", "...GWWG.....", "..GCCCCG....", ".GCLCCCCG...", ".GCLCCCCG...", ".GCCCCCCG...", ".GDCCCCDG...", "..GDDDDG....", "...GGGG....."],
  bigflask: ["....KKK.....", "....GWG.....", "...GWWWG....", "..GCCCCCG...", ".GCLCCCCCG..", "GCLLCCCCCCG.", "GCLCCCCCCCG.", "GCCCCCCCCCG.", "GDCCCCCCCDG.", ".GDDCCCDDG..", "..GGGGGGG..."],
  blob: ["............", "............", "....CCCC....", "...CLLCCC...", "..CLCCCCCC..", "..CCCCCCCC..", ".CCCECCECCC.", ".CCCCCCCCCC.", ".DDDDDDDDDD.", "............"],
  pelt: ["............", "..C..C..C...", ".CCCCCCCCC..", "CCLLCCCCCCC.", "CLCCCCCCCCD.", "CCCCCCCCCCD.", ".CCCCCCCCD..", "..CDCDCDC...", "............"],
  tusk: ["..........C.", ".........CL.", "........CLC.", ".......CLC..", "......CLC...", "....CCLC....", "..CCLCC.....", ".CLCC.......", ".DD........."],
  bone: ["............", ".CC......CC.", "CLLC....CLLC", ".CLCCCCCCLC.", "..CLLLLLLC..", ".CLCCCCCCLC.", "CLLC....CLLC", ".CC......CC."],
  sting: ["............", "....KK......", "...KYYK.....", "..KYKKYK....", "..YKKYYK....", "..KYYKKY....", "...KYYK.....", "....KK......", "....K.......", "....K......."],
  spore: ["............", "...C...C....", "..CLC.CLC...", "...C.C.C.C..", ".C..CLC..C..", "CLC..C..CLC.", ".C.C...C.C..", "..CLC.CLC...", "...C...C...."],
  shard: [".....C......", "....CLC.....", "...CLCCC....", "...CLCCC....", "..CLLCCCD...", "..CLCCCCD...", "...CLCCD....", "....CCD.....", ".....D......"],
  scale: ["............", "...CCCCC....", "..CLLCCCC...", ".CLCCCCCCC..", ".CLCCDCCCD..", ".CCCDCCCDD..", "..CDCCCDD...", "...DDDDD....", "............"],
  ecto: ["....CCC.....", "...CLLCC....", "..CLCCCCC...", "..CECCECC...", "..CCCCCCC...", "..CCCCCCC...", "..C.CC.CC...", "....C...C..."],
  ore: ["............", "...DDDDD....", "..DCCYCCD...", ".DCLCCCCYD..", ".DCCYCCCCD..", ".DCCCCYCCD..", "..DCYCCCD...", "...DDDDD...."],
  sword: ["..........L.", ".........LW.", "........LW..", ".......LW...", "......LW....", ".....LW.....", "..G.LW......", "...GW.......", "..KGG.......", ".K..G.......", "K..........."],
  spear: ["...........W", "..........LW", ".........LL.", "........K...", ".......K....", "......K.....", ".....K......", "....K.......", "...K........", "..K.........", ".K.........."],
  axe: ["......LLL...", ".....LWWWL..", "....KLWWWL..", "...K.LWWL...", "..K...LL....", ".K..........", "K..........."],
  bow: ["...KK.......", "....KK..S...", ".....K.S....", ".....KS.....", ".....SK.....", "....S..K....", "...S...K....", "......KK....", "....KK......"],
  bowl: ["............", "...W..W.....", "....W..W....", "............", ".LLLLLLLLLL.", "CSSSSSSSSSSC", "CCCCCCCCCCCC", ".CDCCCCCCDC.", "..DDDDDDDD..", "............"],
  skewer: ["..........K.", ".........K..", "......CCC...", ".....CLCCE..", "....CCCCC...", "...CCCCC....", "..KCCC......", ".K..........", "K..........."],
  shirt: ["............", "..CC..CC....", ".CCCCCCCC...", "CCCLCCCCCC..", "CC.LCCCC.C..", "...LCCCC....", "...CCCCC....", "...CCCCC....", "...DDDDD...."],
  shield: ["............", ".DCCCCCCD...", ".CLLCCCCC...", ".CLWCCCCC...", ".CLCCCCCC...", ".CCCCCCCD...", "..CCCCCD....", "...CCCD.....", "....DD......"],
  ring: ["............", "....RRR.....", "...RWRRR....", "....RRR.....", "...YYYYY....", "..Y.....Y...", "..Y.....Y...", "..Y.....Y...", "...YYYYY...."],
  amulet: ["..Y.....Y...", "...Y...Y....", "....Y.Y.....", ".....Y......", "....CCC.....", "...CLCCC....", "...CLCCC....", "....CCC.....", ".....C......"],
  boots: ["............", "..CCC.......", "..CCC.......", "..CCC...WW..", "..CCC..WWW..", "..CCCCCCW...", "..CCCCCCCC..", "..DDDDDDDD.."],
  seal: ["......Y.....", ".....YYY....", "....YRRRY...", "...YRYYRY...", "..YRYWYRY...", "...YRYYRY...", "....YRRY....", ".....YY.....", "......Y....."],
  cat: ["..C.C.......", "..CCCC......", ".CECEC......", ".CCPCC.....C", "..CCCCCCCCC.", "..CWWCCCCC..", "...C.C.C.C.."],
};
const ICONS_DEF = {
  potion: ['flask', { C: '#e8475a', L: '#ff9aa8', D: '#b02a40', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
  hipotion: ['bigflask', { C: '#c8389a', L: '#ff9ad8', D: '#8a1a6a', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
  ether: ['flask', { C: '#3a8ee0', L: '#9ad4ff', D: '#2a5aa8', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
  holy_water: ['bigflask', { C: '#5ae8f0', L: '#e0ffff', D: '#2a88b0', G: '#f0f8ff', W: '#ffffff', K: '#c8a838' }],
  roast_veg: ['bread', { C: '#e09832', L: '#ffd664', D: '#9a4e1a', W: '#5a2a0a' }],
  cave_water: ['flask', { C: '#4ad8f8', L: '#e0f8ff', D: '#1a7aa0', G: '#d0ecf8', W: '#ffffff', K: '#5a6274' }],
  cave_moss: ['blob', { C: '#2ac86a', L: '#8affba', D: '#1a6a38', E: '#104020' }],
  frost_flower: ['spore', { C: '#8ae0ff', L: '#e4faff', D: '#3a8ab8' }],
  feather: ['spear', { W: '#ffffff', L: '#d0d8e8', K: '#9aa8c0', G: '#b8c4d8' }],
  tea_flask: ['flask', { C: '#50c878', L: '#b4f0c8', D: '#288848', G: '#d0f0dc', W: '#ffffff', K: '#8a6240' }],
  frog_oil: ['flask', { C: '#78d848', L: '#c4f890', D: '#3c8820', G: '#d8f8d0', W: '#ffffff', K: '#346024' }],
  coffee_bean: ['blob', { C: '#b82020', L: '#ff6464', D: '#701010', E: '#400808' }],
  coffee_cup: ['bowl', { C: '#604230', L: '#8a6248', D: '#382418', W: '#ffffff', S: '#18100c' }],
  river_orchid: ['spore', { C: '#58a8f0', L: '#b4e2ff', D: '#2868a8' }],
  antidote: ['flask', { C: '#58c060', L: '#b8f0a0', D: '#2e8a3e', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
  jelly: ['blob', { C: '#6cd45a', L: '#e0ffd0', D: '#3a9a3a', E: '#1a3a1a' }],
  pelt: ['pelt', { C: '#9aa2b4', L: '#e8ecf4', D: '#5c6680' }],
  tusk: ['tusk', { C: '#f4ead0', L: '#ffffff', D: '#9a6a42' }],
  bone: ['bone', { C: '#ece4d0', L: '#ffffff' }],
  sting: ['sting', { Y: '#ffd23a', K: '#3a2a20' }],
  spore: ['spore', { C: '#b46ae0', L: '#f0d0ff' }],
  shard: ['shard', { C: '#5ad0ff', L: '#e0f8ff', D: '#2a7ac0' }],
  scale: ['scale', { C: '#6ab84a', L: '#c8f088', D: '#3a7a2a' }],
  ecto: ['ecto', { C: '#d8e8ff', L: '#ffffff', E: '#4a3a6a' }],
  ore: ['ore', { C: '#8a8494', L: '#c8c2d2', D: '#4e4858', Y: '#ffd23a' }],
  wsword: ['sword', { L: '#c08a5a', W: '#e8c090', G: '#8a5a32', K: '#5a3a20' }],
  ispear: ['spear', { K: '#8a5a32', L: '#8a96b0', W: '#eef4ff' }],
  fspear: ['spear', { K: '#4a6a9a', L: '#9ad4f4', W: '#f0faff' }],
  f_fish: ['skewer', { C: '#e0904a', L: '#ffd08a', E: '#3a1a10', K: '#8a5a32' }],
  f_soup: ['bowl', { C: '#c8763a', D: '#8a4a20', L: '#fff0d0', S: '#7ac84a', W: '#ffffff' }],
  f_ginger: ['bowl', { C: '#c8763a', D: '#8a4a20', L: '#fff0d0', S: '#f0b040', W: '#ffffff' }],
  f_jelly: ['blob', { C: '#ff8ac0', L: '#fff0f8', D: '#c04a8a', E: '#c04a8a' }],
  f_hero: ['bowl', { C: '#e8c050', D: '#a07a20', L: '#fff8d8', S: '#ff6a4a', W: '#ffffff' }],
  herb: ['bowl', { C: '#4ab83a', D: '#2a7a2a', L: '#c8f0a0', S: '#6ad04a', W: '#ffffff' }],
  berry: ['blob', { C: '#d83a5a', L: '#ffb0c0', D: '#8a1a3a', E: '#3a8a3a' }],
  f_tea: ['bowl', { C: '#c8763a', D: '#8a4a20', L: '#fff0d0', S: '#8ad05a', W: '#ffffff' }],
  f_jam: ['blob', { C: '#a82a5a', L: '#ffb0d0', D: '#6a1a3a', E: '#e8c050' }],
  aurelring: ['ring', { Y: '#e8c050', R: '#5af0d0', W: '#ffffff' }],
  akey: ['key', { Y: '#9ad4f4' }],
  bracelet: ['ring', { Y: '#9ad4f4', R: '#7af0c0', W: '#ffffff' }],
  baxe: ['axe', { K: '#8a5a32', L: '#6a7a9a', W: '#e0e8f8' }],
  hbow: ['bow', { K: '#9a6a34', S: '#f0e8d0' }],
  isword: ['sword', { L: '#8a96b0', W: '#eef4ff', G: '#e8c050', K: '#6a3e1e' }],
  ssword: ['sword', { L: '#6a7a9a', W: '#c8e0ff', G: '#5a8ad8', K: '#3a3050' }],
  csword: ['sword', { L: '#3aa8e0', W: '#d8f8ff', G: '#c88aff', K: '#4a2a6a' }],
  cloth: ['shirt', { C: '#d8c8a0', L: '#f4ead0', D: '#a8986a' }],
  leather: ['shirt', { C: '#9a6440', L: '#c8905e', D: '#6a4228' }],
  chain: ['shirt', { C: '#a0a8b8', L: '#e0e6f0', D: '#6a7080' }],
  cshield: ['shield', { C: '#5ad0ff', L: '#c8f4ff', W: '#ffffff', D: '#2a7ac0' }],
  ring: ['ring', { Y: '#ffd23a', R: '#ff4a3a', W: '#ffd0c0' }],
  amulet: ['amulet', { Y: '#e8c050', C: '#5fbf68', L: '#c4f48e' }],
  boots: ['boots', { C: '#4a7ad8', D: '#2a4a98', W: '#ffffff' }],
  seal: ['seal', { Y: '#ffd23a', R: '#e8502a', W: '#ffffff' }],
  mochi: ['cat', { C: '#f4f0f8', E: '#2a2a2a', P: '#ff9ab0', W: '#ffffff' }],
  plushie: ['cat', { C: '#ffffff', E: '#1a1a24', P: '#ff6a8a', W: '#ffe0eb' }],
  lake_pearl: ['blob', { C: '#e4f4fc', L: '#ffffff', D: '#9ad0ec', E: '#70b4dc' }],
};
// Ikon cadangan untuk item tanpa ICONS_DEF (agar game tidak macet); warna dari nama item agar tetap beragam
function iconFallback(id) {
  const it = (typeof ITEMS !== 'undefined' && ITEMS[id]) || {}, h = [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7), hue = h % 360;
  const c = (l, s = 55) => `hsl(${hue},${s}%,${l}%)`;
  const shape = it.k === 'wpn' ? 'sword' : it.k === 'arm' ? 'shirt' : it.k === 'acc' ? 'ring' : it.k === 'use' ? 'flask' : 'blob';
  return [ICON_MAP[shape] ? shape : 'blob', { C: c(55), L: c(82), D: c(32), E: c(25), G: c(55), K: '#6a4a2a', W: '#ffffff', Y: c(60), R: c(45), S: c(50), M: c(70), B: c(50), P: c(60) }];
}
function artIcon(id) { let def = ICONS_DEF[id]; if (!def || !ICON_MAP[def[0]]) { if (!artIcon.warned) { artIcon.warned = 1; } console.warn('Ikon cadangan dipakai untuk item:', id); def = iconFallback(id); } const [m, pal] = def; const spr = outline(renderMap(ICON_MAP[m], pal)); const [c, x] = mk(14, 14); x.drawImage(spr, Math.floor((14 - spr.width) / 2), Math.floor((14 - spr.height) / 2)); return c; }
Object.assign(ICON_MAP, {
  bread: ['..........', '...CCCC...', '..CLLLLC..', '.CLLCLLLC.', '.CCCCCCCC.', '.DDDDDDDD.', '..........'],
  fish: ["............", "......CC....", "..D..CCCC...", ".DD.CLCCCC..", "DDDCCCCCECC.", ".DD.CCCCCC..", "..D..CCCC...", "......CC...."],
  key: ["............", "..YYY.......", ".Y...Y......", ".Y...YYYYYYY", ".Y...Y...Y.Y", "..YYY......."],
  rod: ["..........K.", ".........K.W", "........K..W", ".......K...W", "......K....W", ".....K.....R", "....K.......", "...K........", "..K.........", ".B.........."],
  medal: ["...R...R....", "...R...R....", "....R.R.....", "....YYY.....", "...YLYYY....", "...YYYYY....", "...YYYYY....", "....YYY....."],
});
Object.assign(ICONS_DEF, {
  fish: ['fish', { C: '#6ab8e8', L: '#d8f4ff', D: '#3a7ab8', E: '#1a1a2a' }],
  gfish: ['fish', { C: '#ffd23a', L: '#fff8c0', D: '#d08a1a', E: '#1a1a2a' }],
  moonfish: ['fish', { C: '#9ad8ff', L: '#ffffff', D: '#4a6ab0', E: '#1a1a2a' }],
  rainfish: ['fish', { C: '#4ad8a0', L: '#d0ffe8', D: '#2a8a60', E: '#1a1a2a' }],
  oldboot: ['boots', { C: '#8a6a4a', D: '#5a3a2a', W: '#b89a7a' }],
  egg: ['blob', { C: '#fff8ea', L: '#ffffff', D: '#e0d4c0', E: '#f0c050' }],
  wool: ['blob', { C: '#f0f4f8', L: '#ffffff', D: '#c8d4e0', E: '#a0b0c4' }],
  f_egg: ['bowl', { C: '#e08a3a', L: '#fff8e8', S: '#ffd84a', D: '#9a5020', W: '#ffffff' }],
  rod: ['rod', { K: '#8a5a32', W: '#e8e8f0', R: '#e83a3a', B: '#5a3a20' }],
  key: ['key', { Y: '#e8c050' }],
  lockpick: ['key', { Y: '#8ab0d8' }],
  medal: ['medal', { R: '#e84a4a', Y: '#ffd23a', L: '#fff8c0' }],
  mring: ['ring', { Y: '#d8e0f0', R: '#5a8aff', W: '#d8e8ff' }],
  bfly_gold: ['blob', { C: '#ffd23a', L: '#fff8a0', D: '#d08a1a', E: '#fffbe0' }],
  bfly_blue: ['blob', { C: '#5ad0ff', L: '#c8f4ff', D: '#2a7ac0', E: '#ffffff' }],
  bfly_pink: ['blob', { C: '#ff8ab0', L: '#ffd0e0', D: '#c84a7a', E: '#ffffff' }],
  firefly_item: ['flask', { C: '#e8ff70', L: '#ffffff', D: '#a0d830', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
});
Object.assign(ICON_MAP, {
  carrot: ["......G.G...", ".....GGG....", "......G.....", ".....CCC....", ".....CLCC...", "....CLCC....", "....CCC.....", "...CCC......", "...CC.......", "..C........."],
  seeds: ["............", "...KKKKK....", "..KCCCCCK...", "..KCDCDCK...", "..KCCCCCK...", "..KCDCCDK...", "..KCCCCCK...", "...KKKKK...."],
});
Object.assign(ICONS_DEF, {
  veg: ['carrot', { G: '#5fbf68', C: '#ff9a3a', L: '#ffd08a' }],
  seed: ['seeds', { K: '#7a5446', C: '#d8b88a', D: '#6a4a2a' }],
  stew: ['blob', { C: '#e8a050', L: '#fff0c0', D: '#a8602a', E: '#7a3a1a' }],
  mush: ['spore', { C: '#8a5a32', L: '#d8a878' }],
  gmush: ['spore', { C: '#3a8ad8', L: '#a0e0ff' }],
  f_mush: ['bowl', { C: '#8a5a32', L: '#f0d8c0', S: '#3a8ad8', D: '#5a3a20', W: '#ffffff' }],
  apple: ['blob', { C: '#e83a3a', L: '#ff9aa0', D: '#9a1a1a', E: '#4a8a3a' }],
  orange: ['blob', { C: '#ff9a2a', L: '#ffd060', D: '#b85a10', E: '#4a8a3a' }],
  honey: ['flask', { C: '#ffd23a', L: '#fff8a0', D: '#d08a1a', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
});
