'use strict';
// Peta: Padang Angin
// ---------------- PADANG ANGIN ----------------
MAPS.meadow = {
  id: 'meadow', name: 'Padang Angin', w: 1440, h: 1040, bgm: 'meadow', ground: 'meadow', customGround: 'gnd_meadow_custom', glow: [700, 500, 800],
  paths: [
    [0, 330, 260, 330, 14], [260, 330, 460, 460, 14], [460, 460, 820, 470, 14], [820, 470, 1040, 340, 14], [1040, 340, 1200, 200, 13],
    [460, 460, 420, 720, 12], [420, 720, 300, 840, 12], [820, 470, 1000, 700, 12], [1000, 700, 1220, 760, 12],
    [260, 330, 185, 298, 10], [185, 298, 138, 276, 10], [260, 330, 298, 286, 11], [298, 286, 300, 194, 11],
    [298, 286, 386, 294, 10], [386, 294, 482, 276, 10], [482, 276, 547, 330, 10], [260, 330, 268, 382, 10],
    [420, 720, 500, 836, 10], [500, 836, 636, 846, 10],
    [1000, 700, 1000, 1040, 13], [460, 460, 600, 250, 12], [600, 250, 600, 0, 12],
  ],
  discs: [],
  ponds: [
    [660, 730, 150, 82],
    // Alur Sungai Senja membelah Padang Angin (T336): hulu utara -> kolam -> hilir tenggara
    [726, 0, 44, 38], [730, 60, 46, 40], [740, 120, 48, 42], [750, 180, 50, 44],
    [760, 240, 50, 44], [750, 300, 50, 44], [730, 360, 48, 42], [710, 410, 46, 40],
    // Celah arungan di jalan padang (y ≈ 465)
    [670, 530, 50, 44], [660, 600, 52, 46],
    // Hilir Padang menuju tenggara
    [790, 770, 50, 44], [850, 810, 50, 44], [910, 850, 48, 42],
    // Celah arungan di jalan swamp (x ≈ 1000, y ≈ 890)
    [1060, 930, 48, 42], [1110, 970, 50, 44], [1150, 1005, 50, 44], [1176, 1040, 50, 44],
  ],
  flowers: 1,
  objs: [
    ['reeds', 490, 730], ['reeds', 830, 730], ['reeds', 780, 360], ['reeds', 800, 365],['dock', 640, 822], ['boat', 692, 798],
    // papan arah di persimpangan (fitur #674)
    ['sign', 488, 500, { text: 'Papan arah: ↑ Puncak Beku · → Gua Batu & Rawa Senja · ← Desa Lumina' }],
    ['sign', 812, 440, { text: 'Papan arah: ↗ Gua Batu · ↘ Rawa Senja · ← Desa Lumina' }],
    ['windmill', 300, 170], ['campfire', 380, 240], ['hay', 250, 220], ['hay', 352, 214], ['hay', 330, 240],
    ['fence', 230, 250], ['fence', 248, 250], ['fence', 340, 250], ['fence', 358, 250],
    ['houseA', 140, 252], ['houseB', 480, 246], ['crate', 214, 352], ['barrel', 232, 356], ['crate', 214, 396],
    // Pekarangan & rumpun organik Desa Kincir (lumbung gandum, bebas tutup atap & jalur)
    ['woodpile', 74, 244], ['basket', 82, 264], ['fence', 64, 270], ['fence', 82, 270], ['barrel', 202, 246], ['seedsack', 202, 262],
    ['scarecrow', 112, 302], ['apple1', 76, 178], ['treeA', 204, 146],
    ['cart', 236, 176], ['seedsack', 356, 178], ['barrel', 368, 192], ['woodpile', 224, 198], ['orange1', 386, 138], ['treeAd', 218, 116], ['bushP', 374, 162],
    ['woodpile', 544, 246], ['barrel', 548, 226], ['fence', 538, 266], ['fence', 556, 266], ['bushP', 418, 266], ['treeA', 558, 166], ['apple1', 432, 142],
    ['benchWood', 188, 374], ['hay', 186, 396], ['bushW', 290, 404], ['apple1', 144, 392], ['lampPost', 286, 320], ['lamp', 418, 286],
    ['sign', 420, 300, { text: 'DESA KINCIR\nLumbung gandum Benua Lumina.' }],
    ['pigeons', 360, 280],
    ['teatable', 406, 248],
    ['scenicbench', 280, 860],
    ['cavemouth', 1200, 170],
    ['sign', 120, 300, { text: 'Padang Angin\nBarat: Desa Lumina · Timur laut: Gua Batu' }],
    ['sign', 970, 960, { text: 'Selatan: RAWA SENJA\nBerbahaya! Hanya untuk petualang berpengalaman.' }],
    ['sign', 660, 90, { text: 'Utara: PUNCAK BEKU\nDingin menusuk. Bawa Penawar & Ramuan.' }],
    ['rock', 480, 80], ['rock', 800, 80], ['pebbles', 460, 86], ['pebbles', 820, 86],
    ['sign', 1150, 230, { text: 'GUA BATU\nTempat Golem Purba tidur. Jangan berisik!' }],
    ['rock', 560, 380], ['rock', 900, 600], ['rock', 1100, 520], ['log', 630, 350], ['stump', 380, 600], ['rock', 180, 700],
    ['rock', 350, 310], ['bushG1', 378, 320], ['pebbles', 350, 326],
    ['rock', 860, 410], ['bushy', 876, 416], ['pebbles', 848, 418],
    ['bushy', 520, 560], ['bushv', 980, 400], ['bushP', 760, 560], ['bushW', 600, 600], ['bushG1', 380, 520],
    ['treeA', 150, 450], ['apple2', 620, 300], ['orange1', 900, 260], ['treeB', 1300, 600], ['apple1', 1100, 900],
    ['viewpoint', 300, 110, { id: 'vp_meadow', name: 'Bukit Kincir Angin' }],
    ['lumina_shard', 300, 70, { id: 'ls_meadow_hill' }],
    ['mush', 260, 110],
    // Batu loncatan arungan & hiasan tepi Sungai Senja (T336 & T345)
    ['pebbles', 690, 465], ['pebbles', 680, 475],
    ['pebbles', 1000, 890], ['pebbles', 990, 900],
    ['pebbles', 800, 230], ['bushG2', 815, 310], ['bushW', 800, 870], ['pebbles', 1160, 960],
    // Klaster selatan & timur Padang Angin (dermaga, tanjung pandang, batas rawa, mulut gua, lapangan samurai)
    ['barrel', 584, 882], ['crate', 558, 886], ['lamp', 610, 866], ['woodpile', 724, 846],
    ['bushW', 756, 864], ['treeA', 540, 892], ['apple1', 744, 904],
    ['lampPost', 248, 846], ['bushP', 238, 874], ['rock', 342, 876], ['pebbles', 328, 886], ['treeAd', 214, 818], ['orange1', 356, 824],
    ['lampPost', 954, 944], ['stump', 930, 962], ['woodpile', 912, 956], ['bushG1', 1084, 836], ['treeAd', 1116, 816],
    ['rock', 1140, 168], ['rock', 1258, 176], ['pebbles', 1118, 184], ['bushG2', 1276, 206], ['lamp', 1136, 212], ['treeAd', 1296, 198],
    ['stump', 1184, 796], ['rock', 1296, 766], ['pebbles', 1284, 780], ['bushW', 1292, 804], ['treeA', 1322, 724],
  ],
  chests: [{ id: 'm1', x: 300, y: 870, item: 'potion3' }, { id: 'm2', x: 1250, y: 780, item: 'ring' }],
  walls: [[0, 0, 560, 60], [640, 0, 800, 60], [0, 0, 40, 296], [0, 364, 40, 676], [1400, 0, 40, 1040], [0, 1006, 960, 40], [1040, 1006, 400, 40]],
  border: {
    top: 60, bottom: 1000, left: 40, right: 1400, gapL: [290, 370], gapT: [560, 640], gap: [960, 1040],
    types: ['verdant_tree', 'verdant_tree', 'treeAd']
  },
  exits: [{ x: 0, y: 296, w: 14, h: 68, to: 'village', tx: 1000, ty: 266, dir: 'left', label: 'Desa Lumina' },
    { x: 1180, y: 160, w: 40, h: 22, to: 'cave', tx: 120, ty: 790, dir: 'up', label: 'Gua Batu' },
    { x: 560, y: 0, w: 80, h: 12, to: 'snow', tx: 640, ty: 1150, dir: 'up', label: 'Puncak Beku' },
    { x: 960, y: 1026, w: 80, h: 30, to: 'swamp', tx: 640, ty: 44, dir: 'down', label: 'Rawa Senja' }],
  fish: [[660, 820], [690, 240], [1110, 1020]],
  feedSpots: [[660, 780]],
  npcs: [{ id: 'joko', ch: 'joko', name: 'Pak Joko', x: 340, y: 290, dir: 'down', wander: 26 },
    { id: 'wati', ch: 'wati', name: 'Wati', x: 180, y: 290, dir: 'down', wander: 22 },
    { id: 'darma', ch: 'darma', name: 'Darma', x: 520, y: 290, dir: 'left' },
    { id: 'bayu', ch: 'bayu', name: 'Pedagang Bayu', x: 248, y: 372, dir: 'down' },
    { id: 'domba', ch: 'child', name: 'Domba Padang', x: 280, y: 220, dir: 'down', wander: 18 }],
  patok: [560, 652],
  enemies: [
    ['goblin_archer', 540, 510],
    ['goblin_shaman', 504, 534],
    ['king_slime', 700, 260],
    ['bounty_wolf', 840, 710],
    ['samurai', 1240, 720],
    ['bee', 626, 256], ['bee', 610, 338], ['boar', 640, 420], ['slimer', 700, 500], ['plant', 560, 540],
    ['wolf', 900, 420], ['bee', 960, 380], ['boar', 1000, 560], ['plant', 1120, 600], ['slimer', 1060, 660],
    ['snake', 400, 760], ['boar', 260, 780], ['plant', 340, 920], ['bee', 200, 880],
    ['wolf', 1180, 880], ['boar', 1300, 820], ['plant', 1180, 700], ['slimer', 880, 860], ['wolf', 1100, 300], ['bee', 1260, 300],
  ],
  trees: {
    n: 95, min: 36, sp: 58,
    types: [['verdant_tree', .35], ['treeB', .15], ['apple1', .08], ['orange1', .06],
      ['verdant_rock_med', .18], ['verdant_rock_large', .08], ['rock', .1]]
  },
  butterflies: 10,
  cliffs: [],
};
