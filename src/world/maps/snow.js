'use strict';
// Peta: Puncak Beku (bab 3, obor kuno & Naga Es Kryos)
MAPS.snow = {
  id: 'snow', name: 'Puncak Beku', w: 1280, h: 1200, bgm: 'cave', ground: 'snow',
  paths: [[640, 1200, 640, 1000, 14], [640, 1000, 400, 860, 13], [400, 860, 260, 760, 13], [640, 1000, 860, 840, 13], [860, 840, 1020, 720, 13],
    [640, 1000, 640, 560, 13], [640, 560, 640, 380, 14], [640, 380, 640, 230, 14]],
  discs: [[640, 230, 100], [640, 560, 50], [260, 760, 48], [1020, 720, 48], [640, 1080, 44]],
  ponds: [[380, 1000, 80, 44], [900, 500, 110, 56], [300, 470, 80, 46]],
  objs: [['sign', 690, 1110, { text: 'PUNCAK BEKU\nTiga obor kuno menjaga gerbang es menuju puncak.' }],
    ...[60, 120, 180, 240, 300, 360, 420, 480, 540, 740, 800, 860, 920, 980, 1040, 1100, 1160, 1220].map(x => ['rock', x, 392]),
    ['rock', 520, 640], ['rock', 760, 660], ['stump', 440, 940], ['log', 820, 960], ['bones', 600, 300], ['bones', 700, 320],
    ['frostflower', 480, 840], ['frostflower', 800, 780],
    ['viewpoint', 640, 110, { id: 'vp_snow', name: 'Puncak Abadi Kryos' }],
    ['lumina_shard', 640, 70, { id: 'ls_snow_peak' }]],
  walls: [[0, 0, 1280, 40], [0, 0, 40, 1200], [1240, 0, 40, 1200], [0, 1170, 600, 30], [680, 1170, 600, 30], [40, 372, 560, 26], [680, 372, 560, 26]],
  border: { top: 40, bottom: 1160, left: 40, right: 1240, gap: [600, 680], types: ['treeSn'] },
  exits: [{ x: 600, y: 1188, w: 80, h: 12, to: 'meadow', tx: 600, ty: 80, dir: 'down', label: 'Padang Angin' }],
  npcs: [{ id: 'nila', ch: 'nila', name: 'Penjaga Nila', x: 596, y: 1080, dir: 'down' }],
  torches: [[260, 744], [1020, 704], [640, 530]],
  iceGate: [600, 372, 80, 26],
  chests: [
    { id: 'n1', x: 160, y: 1060, item: 'hipotion2' },
    { id: 'n2', x: 1130, y: 1040, item: 'antidote3' },
    { id: 'n3', x: 640, y: 150, item: 'fspear', needFlag: 'dragon' }
  ],
  enemies: [['wolfs', 520, 1040], ['slimef', 760, 1040], ['wolfs', 420, 900], ['salam', 330, 820], ['slimei', 200, 700], ['wolfs', 300, 640],
    ['salam', 860, 900], ['slimef', 960, 800], ['wolfs', 1100, 660], ['golemi', 1000, 600], ['batc', 900, 700],
    ['golemi', 560, 600], ['slimef', 720, 620], ['wolfs', 640, 720], ['salam', 520, 760], ['batc', 760, 480], ['slimei', 480, 480]],
  bosses: [{ type: 'kryos', flag: 'dragon', x: 640, y: 210, zone: [540, 236, 200, 110], need: 12, after: 'dragon',
    intro: [
      ['???', 'Kraaah... Siapa berani menyalakan api di wilayahku?'],
      ['Kryos', 'Aku Kryos, Naga Es! Morgath membangunkanku sebelum dia lenyap. Lumina akan membeku selamanya!']
    ]
  }],
  trees: { n: 1100, min: 30, types: [['treeSn', .62], ['rock', .26], ['bushW', .12]] },
};
