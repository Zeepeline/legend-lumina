'use strict';
// Peta: zona alam luas — Hutan Dalam (+ Reruntuhan Aurel) di barat Hutan Lumina, Jalur Sungai dari Hutan Lumina ke Rawa Senja
// World Design Review: docs/BENUA_LUMINA.md (Hutan Lumina: Hutan Dalam & Reruntuhan Aurel; Sungai Senja)
const ruinRing = (cx, cy, r, n) => [...Array(n)].map((_, i) => { const a = i / n * Math.PI * 2; return [i % 3 ? 'rock' : 'stalag', Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * .6)]; });
MAPS.deepwood = {
  id: 'deepwood', name: 'Hutan Dalam', w: 2400, h: 1800, bgm: 'field', ground: 'forest', scale: 2.2,
  paths: [[2400, 730, 1900, 730, 13], [1900, 730, 1500, 980, 12], [1500, 980, 1100, 900, 12], [1100, 900, 700, 560, 12], [700, 560, 520, 420, 12],
    [1500, 980, 1600, 1400, 10], [1600, 1400, 1200, 1580, 10], [1100, 900, 900, 1300, 10], [1900, 730, 2000, 360, 10]],
  discs: [[520, 400, 210], [2000, 330, 90], [1600, 1420, 80], [900, 1320, 70], [1500, 980, 60], [1960, 760, 50]],
  ponds: [[1250, 470, 150, 70], [1420, 560, 90, 50], [330, 1250, 160, 90], [1900, 1500, 140, 70]],
  objs: [
    // Reruntuhan Aurel (barat laut): cincin batu, kuil runtuh, prasasti
    ['shrine', 520, 400], ...ruinRing(520, 400, 170, 14), ['stele', 440, 330, { lore: 'aurel_gerbang' }], ['stele', 610, 470, { lore: 'aurel_istana' }],
    ['rune_pillar', 480, 270, { elem: 'fire' }],
    ['rune_pillar', 520, 250, { elem: 'ice' }],
    ['rune_pillar', 560, 270, { elem: 'light' }],
    ['stele', 520, 220, { text: 'TEKA-TEKI PILAR AUREL:\n"Kekuatan fajar menyala lebih dahulu (Api),\ndibekukan badai salju (Es),\nlalu disinari lentera suci abadi (Cahaya)."' }],
    ['root', 380, 520], ['root', 680, 300], ['root', 300, 380], ['root', 560, 560], ['root', 470, 250], ...ruinRing(520, 400, 95, 9),
    ['stalag', 360, 420], ['rock', 450, 470], ['rock', 600, 330], ['mush', 340, 470], ['mush', 700, 520], ['mush', 480, 300], ['bushG2', 410, 560], ['bushG2', 650, 250],
    // Pohon Tua raksasa (timur laut)
    ['bigtree', 2000, 330], ['stele', 2070, 380, { lore: 'pohon_tua' }],
    // kemah pemburu gelap
    ['campfire', 1530, 1470],
    ['bramble', 1720, 1450],
    ['hay', 1560, 1400], ['crate', 1640, 1390], ['barrel', 1660, 1400], ['log', 1600, 1460], ['sign', 1680, 1450, { text: 'DILARANG MASUK\nPerburuan lumut lumen. — Kelompok Sambo' }],
    // jamur & lumut bercahaya
    ...[[885, 1300], [940, 1330], [870, 1340], [1200, 1100], [1230, 1130], [700, 1500], [1800, 1100], [1830, 1120], [400, 700], [2200, 1200]].map(([x, y]) => ['mush', x, y]),
    ['sign', 2300, 690, { text: 'HUTAN DALAM\nJangan tinggalkan jalan setapak. Lumut bercahaya menunjukkan arah pulang.' }]],
  walls: [[0, 0, 2400, 30], [0, 0, 40, 1800], [2360, 0, 40, 700], [2360, 760, 40, 1040], [0, 1770, 2400, 30]],
  exits: [{ x: 2388, y: 700, w: 12, h: 60, to: 'forest', tx: 60, ty: 730, dir: 'right', label: 'Hutan Lumina' }],
  npcs: [{ id: 'sambo', ch: 'darma', name: 'Sambo, Pemburu Gelap', x: 1600, y: 1360, dir: 'down', wander: 18 }],
  chests: [{ id: 'dw1', x: 520, y: 360, item: 'aurelring' }, { id: 'dw2', x: 2050, y: 280, item: 'gold250' }, { id: 'dw3', x: 120, y: 1700, item: 'hipotion2' }, { id: 'dw4', x: 1180, y: 1600, item: 'ether3' }, { id: 'dw_bramble', x: 1760, y: 1450, item: 'gold180', needFlag: 'dw_bramble' }],
  fish: [[1250, 540], [330, 1340]],
  enemies: [['wolf', 2100, 900], ['wolf', 2150, 960], ['boar', 1800, 600], ['plant', 1700, 820], ['shroom', 1350, 1000], ['shroom', 1300, 1060], ['bee', 1000, 700], ['bee', 1050, 760],
    ['ghost', 560, 520], ['ghost', 420, 300], ['golem', 640, 260], ['wisp', 800, 600], ['plant', 900, 1200], ['snake', 700, 1400], ['snake', 1200, 1500], ['wolf', 1900, 1300], ['boar', 2100, 1500], ['golem', 300, 500], ['ghost', 1500, 400]],
  trees: { n: 3600, min: 26, types: [['treeAd', .35], ['treeBd', .3], ['pined', .15], ['bushG2', .1], ['stump', .05], ['rock', .05]] },
};
MAPS.river = {
  id: 'river', name: 'Jalur Sungai Senja', w: 2600, h: 1000, bgm: 'field', ground: 'meadow', scale: 1.8,
  paths: [[0, 530, 400, 530, 12], [400, 530, 700, 760, 11], [700, 760, 1200, 700, 11], [1200, 700, 1500, 300, 11], [1500, 300, 2100, 260, 11], [2100, 260, 2400, 480, 11], [2400, 480, 2600, 480, 12], [1200, 700, 1700, 820, 9], [1700, 820, 2200, 760, 9]],
  discs: [[1300, 840, 70], [1800, 180, 70], [600, 300, 80]],
  // Alur utama Sungai Senja (T338) & anak sungai dari barat (T339)
  ponds: [
    // Alur utama dari utara (1048, 0) ke selatan (1048, 600)
    [1048, 0, 48, 40], [1048, 70, 50, 42], [1048, 140, 50, 42], [1048, 210, 52, 44],
    [1048, 280, 52, 44], [1048, 350, 52, 44], [1048, 420, 52, 44], [1048, 490, 52, 44],
    [1050, 560, 54, 46], [1080, 600, 54, 46],
    // Anak sungai dari barat (0, 600) menyatu ke alur utama di (1048, 600)
    [0, 600, 26, 22], [50, 600, 26, 22], [110, 600, 26, 22], [170, 600, 28, 24],
    [230, 600, 28, 24], [290, 600, 28, 24], [350, 600, 28, 24], [410, 600, 28, 24],
    // arungan di x ≈ 490 (jalan [400, 530 -> 700, 760])
    [560, 600, 28, 24], [620, 600, 28, 24], [680, 600, 28, 24], [740, 600, 30, 26],
    [800, 600, 30, 26], [860, 600, 30, 26], [920, 600, 32, 26], [980, 600, 34, 28],
    // Alur utama berlanjut ke timur (1048, 600) ke muara rawa (2600, 600)
    [1140, 600, 48, 42], [1200, 600, 48, 42],
    // arungan di x ≈ 1280 (jalan [1200, 700 -> 1500, 300])
    [1360, 590, 48, 42], [1430, 580, 50, 44], [1500, 580, 50, 44], [1570, 585, 50, 44],
    [1640, 590, 50, 44], [1710, 595, 50, 44], [1780, 600, 50, 44], [1850, 600, 50, 44],
    [1920, 600, 50, 44], [1990, 600, 50, 44], [2060, 600, 50, 44], [2130, 600, 50, 44],
    [2200, 600, 50, 44], [2270, 600, 50, 44], [2340, 600, 50, 44], [2410, 600, 50, 44],
    [2480, 600, 50, 44], [2550, 600, 50, 44], [2600, 600, 50, 44],
  ],
  objs: [['rock', 700, 440], ['rock', 720, 470], ['rock', 1520, 420], ['rock', 1540, 690], ['rock', 2120, 520],
    ['pebbles', 750, 580], ['pebbles', 1560, 840], ['pebbles', 1280, 600], ['pebbles', 1280, 580],
    ['pebbles', 490, 600], ['pebbles', 480, 605],
    ['brokenbridge', 1430, 560, { ok: 'jembatan rusak di atas aliran sungai senja' }],
    ['orchidrock', 870, 520], ['canaryperch', 1240, 680],
    ['windmill', 1800, 160], ['fence', 1760, 220], ['fence', 1778, 220], ['fence', 1840, 220], ['stele', 1880, 210, { lore: 'kincir_tua' }],
    ['hay', 1270, 840], ['barrel', 1330, 830], ['log', 1300, 880], ['sign', 1380, 860, { text: 'Kemah Nelayan Sungai' }],
    ['stele', 730, 262, { lore: 'sungai_senja' }], ['sign', 60, 490, { text: 'JALUR SUNGAI SENJA\nTimur: Rawa Senja · Barat: Hutan Lumina' }]],
  walls: [[0, 0, 2600, 30], [0, 0, 40, 500], [0, 560, 40, 440], [2560, 0, 40, 450], [2560, 510, 40, 490], [0, 970, 2600, 30]],
  exits: [{ x: 0, y: 500, w: 12, h: 60, to: 'forest', tx: 1200, ty: 530, dir: 'left', label: 'Hutan Lumina' },
    { x: 2588, y: 450, w: 12, h: 60, to: 'swamp', tx: 60, ty: 480, dir: 'right', label: 'Rawa Senja' }],
  npcs: [{ id: 'pancing', ch: 'joko', name: 'Pak Teguh, Nelayan', x: 1290, y: 800, dir: 'down', wander: 16 }],
  chests: [{ id: 'rv1', x: 1820, y: 120, item: 'gold180' }, { id: 'rv2', x: 2480, y: 900, item: 'ether2' }, { id: 'rv3', x: 120, y: 900, item: 'hipotion2' }],
  fish: [[760, 630], [1000, 820], [1580, 760], [2000, 590]],
  enemies: [['frog', 800, 640], ['frog', 1080, 780], ['snake', 1200, 500], ['bee', 1400, 200], ['bee', 1440, 240], ['boar', 1900, 400], ['plant', 2200, 300], ['frog', 2300, 680], ['snake', 1700, 900], ['boar', 400, 800], ['wolf', 300, 300], ['plant', 2450, 820]],
  trees: { n: 1700, min: 28, types: [['treeA', .35], ['treeB', .25], ['bushG1', .15], ['round', .1], ['rock', .15]] },
};
