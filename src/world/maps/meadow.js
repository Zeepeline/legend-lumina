'use strict';
// Peta: Padang Angin
// ---------------- PADANG ANGIN ----------------
MAPS.meadow = {
  id: 'meadow', name: 'Padang Angin', w: 1440, h: 1040, bgm: 'meadow', ground: 'meadow', glow: [700, 500, 800],
  paths: [
    [0, 330, 260, 330, 14], [260, 330, 460, 460, 14], [460, 460, 820, 470, 14], [820, 470, 1040, 340, 14], [1040, 340, 1200, 200, 13],
    [460, 460, 420, 720, 12], [420, 720, 300, 840, 12], [820, 470, 1000, 700, 12], [1000, 700, 1220, 760, 12],
    [260, 330, 300, 190, 11], [1000, 700, 1000, 1040, 13],
  ],
  discs: [[300, 180, 52], [300, 860, 56], [1240, 770, 66], [1200, 196, 40]],
  ponds: [[660, 730, 150, 82]],
  flowers: 1,
  objs: [
    ['windmill', 300, 170], ['hay', 250, 220], ['hay', 352, 214], ['hay', 330, 240], ['fence', 230, 250], ['fence', 248, 250], ['fence', 340, 250], ['fence', 358, 250],
    ['cavemouth', 1200, 170],
    ['sign', 120, 300, { text: 'Padang Angin\nBarat: Desa Lumina · Timur laut: Gua Batu' }],
    ['sign', 1040, 960, { text: 'Selatan: RAWA SENJA\nBerbahaya! Hanya untuk petualang berpengalaman.' }],
    ['sign', 1150, 230, { text: 'GUA BATU\nTempat Golem Purba tidur. Jangan berisik!' }],
    ['rock', 560, 380], ['rock', 900, 600], ['rock', 1100, 520], ['log', 700, 360], ['stump', 380, 600], ['rock', 180, 700],
    ['bushy', 520, 560], ['bushv', 980, 400], ['bushP', 760, 560], ['bushW', 600, 600], ['bushG1', 380, 520],
    ['treeA', 150, 450], ['apple2', 620, 300], ['orange1', 900, 260], ['treeB', 1300, 600], ['apple1', 1100, 900],
  ],
  chests: [{ id: 'm1', x: 300, y: 870, item: 'potion3' }, { id: 'm2', x: 1250, y: 780, item: 'ring' }],
  walls: [[0, 0, 1440, 60], [0, 0, 40, 296], [0, 364, 40, 676], [1400, 0, 40, 1040], [0, 1006, 960, 40], [1040, 1006, 400, 40]],
  border: { top: 60, bottom: 1000, left: 40, right: 1400, gapL: [290, 370], gap: [960, 1040], types: ['treeAd', 'treeBd', 'treeA'] },
  exits: [{ x: 0, y: 296, w: 14, h: 68, to: 'village', tx: 1000, ty: 266, dir: 'left', label: 'Desa Lumina' },
    { x: 1180, y: 160, w: 40, h: 22, to: 'cave', tx: 120, ty: 790, dir: 'up', label: 'Gua Batu' },
    { x: 960, y: 1026, w: 80, h: 30, to: 'swamp', tx: 640, ty: 44, dir: 'down', label: 'Rawa Senja' }],
  fish: [[660, 820]],
  npcs: [{ id: 'joko', ch: 'joko', name: 'Pak Joko', x: 340, y: 290, dir: 'down', wander: 26 }],
  enemies: [
    ['bee', 500, 300], ['bee', 560, 330], ['boar', 640, 420], ['slimer', 700, 500], ['plant', 560, 540],
    ['wolf', 900, 420], ['bee', 960, 380], ['boar', 1000, 560], ['plant', 1120, 600], ['slimer', 1060, 660],
    ['snake', 400, 760], ['boar', 260, 780], ['plant', 340, 920], ['bee', 200, 880],
    ['wolf', 1180, 880], ['boar', 1300, 820], ['plant', 1180, 700], ['slimer', 880, 860], ['wolf', 1100, 300], ['bee', 1260, 300],
  ],
  trees: { n: 460, min: 30, sp: 34, types: [['treeA', .15], ['treeB', .12], ['apple1', .06], ['orange1', .04], ['bushG2', .2], ['bushG1', .13], ['rock', .3]] }, butterflies: 10,
};
