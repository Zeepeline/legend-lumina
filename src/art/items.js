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
};
function artIcon(id) { const [m, pal] = ICONS_DEF[id]; const spr = outline(renderMap(ICON_MAP[m], pal)); const [c, x] = mk(14, 14); x.drawImage(spr, Math.floor((14 - spr.width) / 2), Math.floor((14 - spr.height) / 2)); return c; }
Object.assign(ICON_MAP, {
  fish: ["............", "......CC....", "..D..CCCC...", ".DD.CLCCCC..", "DDDCCCCCECC.", ".DD.CCCCCC..", "..D..CCCC...", "......CC...."],
  key: ["............", "..YYY.......", ".Y...Y......", ".Y...YYYYYYY", ".Y...Y...Y.Y", "..YYY......."],
  rod: ["..........K.", ".........K.W", "........K..W", ".......K...W", "......K....W", ".....K.....R", "....K.......", "...K........", "..K.........", ".B.........."],
  medal: ["...R...R....", "...R...R....", "....R.R.....", "....YYY.....", "...YLYYY....", "...YYYYY....", "...YYYYY....", "....YYY....."],
});
Object.assign(ICONS_DEF, {
  fish: ['fish', { C: '#6ab8e8', L: '#d8f4ff', D: '#3a7ab8', E: '#1a1a2a' }],
  gfish: ['fish', { C: '#ffd23a', L: '#fff8c0', D: '#d08a1a', E: '#1a1a2a' }],
  oldboot: ['boots', { C: '#8a6a4a', D: '#5a3a2a', W: '#b89a7a' }],
  rod: ['rod', { K: '#8a5a32', W: '#e8e8f0', R: '#e83a3a', B: '#5a3a20' }],
  key: ['key', { Y: '#e8c050' }],
  medal: ['medal', { R: '#e84a4a', Y: '#ffd23a', L: '#fff8c0' }],
  mring: ['ring', { Y: '#d8e0f0', R: '#5a8aff', W: '#d8e8ff' }],
});
Object.assign(ICON_MAP, {
  carrot: ["......G.G...", ".....GGG....", "......G.....", ".....CCC....", ".....CLCC...", "....CLCC....", "....CCC.....", "...CCC......", "...CC.......", "..C........."],
  seeds: ["............", "...KKKKK....", "..KCCCCCK...", "..KCDCDCK...", "..KCCCCCK...", "..KCDCCDK...", "..KCCCCCK...", "...KKKKK...."],
});
Object.assign(ICONS_DEF, {
  veg: ['carrot', { G: '#5fbf68', C: '#ff9a3a', L: '#ffd08a' }],
  seed: ['seeds', { K: '#7a5446', C: '#d8b88a', D: '#6a4a2a' }],
  stew: ['blob', { C: '#e8a050', L: '#fff0c0', D: '#a8602a', E: '#7a3a1a' }],
});
