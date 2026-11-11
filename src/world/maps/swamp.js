'use strict';
// Peta: Rawa Senja (bab 2, Morgath)
// ---------------- RAWA SENJA (bab 2) ----------------
MAPS.swamp = {
  id: 'swamp', name: 'Rawa Senja', w: 1280, h: 960, bgm: 'cave', ground: 'swamp',
  paths: [[640, 0, 640, 160, 14], [640, 160, 420, 300, 13], [420, 300, 300, 520, 13], [640, 160, 880, 320, 13], [880, 320, 960, 560, 13],
    [300, 520, 560, 700, 13], [960, 560, 700, 720, 13], [560, 700, 640, 820, 13], [700, 720, 640, 820, 13]],
  discs: [[640, 840, 92], [300, 520, 46], [960, 560, 46], [640, 150, 34]],
  ponds: [[620, 440, 120, 66], [180, 770, 110, 60], [1080, 800, 120, 64], [1090, 200, 90, 50], [190, 200, 90, 50]],
  objs: [['sign', 676, 130, { text: 'RAWA SENJA\nKabut di sini bukan kabut biasa...' }], ['rock', 560, 300], ['log', 760, 600], ['stump', 420, 620], ['mush', 500, 560], ['mush', 820, 480], ['rock', 880, 700], ['bones', 600, 780], ['bones', 700, 800]],
  chests: [{ id: 's1', x: 300, y: 516, item: 'hipotion2' }, { id: 's2', x: 960, y: 556, item: 'ether3' }, { id: 's3', x: 640, y: 884, item: 'mring', needFlag: 'witch' }],
  walls: [[0, 0, 600, 30], [680, 0, 600, 30], [0, 0, 40, 960], [1240, 0, 40, 960], [0, 930, 1280, 30]],
  exits: [{ x: 600, y: 0, w: 80, h: 12, to: 'meadow', tx: 1000, ty: 990, dir: 'up', label: 'Padang Angin' }],
  npcs: [{ id: 'hermit', ch: 'hermit', name: 'Pertapa Sura', x: 604, y: 130, dir: 'down' }],
  enemies: [['frog', 520, 240], ['frog', 440, 330], ['wisp', 380, 420], ['slimep', 340, 480], ['frog', 260, 560], ['wisp', 420, 620],
    ['frog', 760, 250], ['slimep', 860, 340], ['wisp', 920, 440], ['plant', 1000, 520], ['frog', 900, 620], ['wisp', 820, 680],
    ['slimep', 500, 680], ['ghost', 560, 760], ['snake', 760, 760], ['plant', 720, 560]],
  bosses: [{ type: 'witch', flag: 'witch', x: 640, y: 840, zone: [560, 772, 160, 130], need: 7, after: 'witch',
    intro: [['???', 'Jadi kamu bocah yang merusak rencanaku dengan Raja Goblin...'], ['Morgath', 'Aku Morgath. Cahaya Kristal Lumina seharusnya menjadi milikku! Lenyaplah dalam kabut!']] }],
  fish: [[620, 516]],
  trees: { n: 1500, min: 30, types: [['treeSw', .5], ['treeBd', .2], ['rock', .12], ['bushG2', .18]] },
};
