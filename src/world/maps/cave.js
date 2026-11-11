'use strict';
// Peta: Gua Batu (gelap, teka-teki batu, Golem Purba)
// ---------------- GUA BATU ----------------
MAPS.cave = {
  id: 'cave', name: 'Gua Batu', w: 1120, h: 920, bgm: 'cave', ground: 'cave', dark: 1,
  paths: [
    [120, 800, 420, 700, 26], [420, 700, 300, 420, 24], [300, 420, 620, 300, 24], [620, 300, 900, 460, 26],
    [420, 700, 860, 790, 22], [620, 300, 640, 120, 20], [120, 800, 120, 900, 24],
  ],
  discs: [[120, 800, 76], [420, 700, 84], [300, 420, 72], [620, 300, 86], [900, 470, 128], [860, 790, 72], [640, 110, 56]],
  objs: [
    ['sign', 170, 760, { text: 'Gua Batu. Kristal ungu menerangi jalan.\nGolem Purba tidur di ruang timur.\nGerbang utara: dorong batu ke pelat bercahaya.' }],
  ],
  chests: [{ id: 'g1', x: 860, y: 800, item: 'potion3' }, { id: 'g2', x: 640, y: 100, item: 'key' }, { id: 'g3', x: 960, y: 420, item: 'shield', needFlag: 'golem' }],
  exits: [{ x: 80, y: 880, w: 80, h: 40, to: 'meadow', tx: 1200, ty: 210, dir: 'down', label: 'Padang Angin' }],
  enemies: [
    ['batc', 400, 680], ['skel', 460, 720], ['slimei', 360, 740], ['ghost', 300, 430], ['skel', 240, 450], ['batc', 340, 380],
    ['golem', 600, 300], ['ghost', 680, 330], ['slimei', 560, 260], ['skel', 640, 140], ['batc', 600, 100],
    ['skel', 820, 780], ['ghost', 900, 800], ['slimei', 860, 740], ['batc', 760, 760],
  ],
  bosses: [{ type: 'golemk', flag: 'golem', x: 920, y: 470, zone: [820, 380, 180, 170], need: 0, after: 'golemchest',
    intro: [[null, 'Tanah bergetar... Batu-batu di ruangan ini menyatu!'], ['Golem Purba', 'GRRRMMM... PENYUSUP... HANCUR...']] }],
  gate: { x: 631, y: 204, w: 60, boulder: [270, 392], plate: [334, 456] },
  decor: { n: 900, near: [-16, -3], types: [['stalag', .45], ['cryst', .2], ['crystp', .2], ['bones', .15]] },
};
