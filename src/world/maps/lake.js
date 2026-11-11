'use strict';
// Peta: Danau Cermin (bab 4, lentera kuno, perahu ke Kuil Penjaga Cahaya, jalan ke Kota Lumina tertutup longsor)
// World Design Review: lihat docs/BENUA_LUMINA.md (Kuil Penjaga Cahaya, Kota Lumina)
MAPS.lake = {
  id: 'lake', name: 'Danau Cermin', w: 1400, h: 1000, scale: 1.5, bgm: 'meadow', ground: 'meadow',
  paths: [[1400, 500, 940, 500, 14], [940, 500, 900, 300, 10], [900, 300, 560, 262, 10], [560, 262, 240, 330, 10], [240, 330, 205, 500, 10],
    [205, 500, 240, 670, 10], [240, 670, 560, 742, 10], [560, 742, 900, 700, 10], [900, 700, 940, 500, 10], [1000, 500, 1000, 330, 11], [1000, 330, 820, 110, 11], [820, 110, 820, 0, 11]],
  discs: [[1080, 470, 70], [1120, 320, 60], [820, 110, 50]],
  ponds: [[560, 500, 330, 210]],
  objs: [['shrine', 560, 520], ['rock', 470, 470], ['rock', 650, 470], ['rock', 520, 560], ['rock', 610, 565],
    ['houseC', 1120, 300], ['barrel', 1180, 300], ['crate', 1060, 300], ['fence', 1150, 340], ['fence', 1168, 340],
    ['stele', 1010, 452, { text: 'Prasasti Danau Cermin:\n"Cahaya lahir di utara, tumbuh di selatan, lalu pulang di barat. Hanya cahaya yang pulang yang boleh menyeberang."' }],
    ['sign', 880, 200, { text: 'Jalan ke KOTA LUMINA (utara)\nPerbaikan longsor oleh Dewan Kota.', lore: 'kota_lumina' }],
    ['log', 900, 130]],
  walls: [[0, 0, 780, 40], [860, 0, 540, 40], [0, 0, 40, 1000], [0, 960, 1400, 40], [1360, 0, 40, 470], [1360, 530, 40, 470]],
  border: { top: 40, bottom: 960, left: 40, right: 1360, gapR: [470, 530], gapT: [780, 860], types: ['treeA', 'treeB', 'pine'] },
  exits: [{ x: 780, y: 0, w: 80, h: 12, to: 'road', tx: 450, ty: 1940, dir: 'up', label: 'Jalan Raya Lama' },
    { x: 1388, y: 470, w: 12, h: 60, to: 'village', tx: 40, ty: 590, dir: 'right', label: 'Desa Lumina' }],
  npcs: [{ id: 'gun', ch: 'gun', name: 'Pak Gun', x: 930, y: 170, dir: 'left' }, { id: 'ratih', ch: 'ratih', name: 'Nenek Ratih', x: 1040, y: 560, dir: 'left' }],
  lanterns: [[560, 266], [560, 744], [206, 500]],
  boat: [902, 512],
  enemies: [['frog', 300, 260], ['frog', 820, 760], ['wisp', 240, 800], ['wisp', 900, 220], ['slimep', 1200, 760], ['frog', 1180, 840], ['wisp', 360, 840]],
  trees: { n: 760, min: 30, types: [['treeA', .4], ['treeB', .3], ['bushG1', .15], ['rock', .15]] },
};
