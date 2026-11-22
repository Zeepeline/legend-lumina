'use strict';
// Peta: Danau Cermin (bab 4, lentera kuno, perahu ke Kuil Penjaga Cahaya, jalan ke Kota Lumina tertutup longsor)
// World Design Review: lihat docs/BENUA_LUMINA.md (Kuil Penjaga Cahaya, Kota Lumina)
MAPS.lake = {
  id: 'lake', name: 'Danau Cermin', w: 1400, h: 1000, scale: 1.5, bgm: 'meadow', ground: 'meadow', customGround: 'gnd_lake_custom',
  paths: [
    [1400, 500, 1000, 500, 14],
    [1000, 500, 820, 110, 13],
    [820, 110, 820, 0, 13]
  ],
  discs: [],
  ponds: [
    [560, 425, 330, 210],
    // Anak Sungai Cermin: keluar dari danau tenggara (820, 615) -> tepi perbatasan (1332, 652) [Global 2932, 3712]
    [820, 615, 26, 22], [930, 625, 26, 22], [1060, 638, 27, 23], [1190, 646, 28, 24], [1332, 652, 28, 24]
  ],
  objs: [
    ['shrine', 560, 445], ['campfire', 1110, 560], ['pebbles', 890, 500],
    ['pebbles', 230, 480], ['dockboat', 980, 520], ['dockboat', 250, 485],
    ['lakelighthouse', 1140, 430],
    ['rock', 470, 395, { ok: 'cincin batu pulau kuil di tengah danau' }],
    ['rock', 650, 395, { ok: 'cincin batu pulau kuil di tengah danau' }],
    ['rock', 520, 485, { ok: 'cincin batu pulau kuil di tengah danau' }],
    ['rock', 610, 490, { ok: 'cincin batu pulau kuil di tengah danau' }],
    // Batu loncatan arungan anak sungai cermin (T340) & hiasan tepi air (T345)
    ['pebbles', 840, 630], ['pebbles', 850, 640],
    ['dock', 560, 649], ['boat', 610, 625], ['lotuspad', 750, 525], ['lotuspad', 450, 345], ['pebbles', 990, 850], ['bushG1', 1092, 936],
    ['houseC', 1120, 300], ['barrel', 1180, 300], ['crate', 1060, 300], ['fence', 1150, 340], ['fence', 1168, 340],
    ['stele', 1010, 452, {
      text: 'Prasasti Danau Cermin:\n"Cahaya lahir di utara, tumbuh di selatan, lalu pulang di barat. Hanya cahaya yang pulang yang boleh menyeberang."'
    }],
    ['sign', 880, 200, { text: 'Jalan ke KOTA LUMINA (utara)\nPerbaikan longsor oleh Dewan Kota.', lore: 'kota_lumina' }],
    ['verdant_rock_large', 1220, 190], ['verdant_bush', 1120, 180], ['verdant_tree', 1300, 160],
    ['log', 900, 130]],
  walls: [[0, 0, 780, 40], [860, 0, 540, 40], [0, 0, 40, 1000], [0, 960, 1400, 40], [1360, 0, 40, 470], [1360, 530, 40, 470]],
  border: { top: 40, bottom: 960, left: 40, right: 1360, gapR: [470, 530], gapT: [780, 860], types: ['treeA', 'treeB', 'pine'] },
  exits: [{ x: 780, y: 0, w: 80, h: 12, to: 'road', tx: 450, ty: 1940, dir: 'up', label: 'Jalan Raya Lama' },
    { x: 1388, y: 470, w: 12, h: 60, to: 'village', tx: 40, ty: 590, dir: 'right', label: 'Desa Lumina' }],
  npcs: [
    { id: 'gun', ch: 'gun', name: 'Pak Gun', x: 930, y: 170, dir: 'left' },
    { id: 'ratih', ch: 'ratih', name: 'Nenek Ratih', x: 1040, y: 560, dir: 'left' }
  ],
  lanterns: [[560, 191], [560, 669], [206, 425]],
  fish: [[890, 445], [1060, 815]],
  boat: [902, 437],
  feedSpots: [[890, 445]],
  enemies: [['frog', 300, 260], ['frog', 820, 760], ['wisp', 240, 800], ['wisp', 900, 220], ['slimep', 1200, 760], ['frog', 1180, 840], ['wisp', 360, 840]],
  trees: { n: 760, min: 30, types: [['verdant_tree', .35], ['treeA', .25], ['verdant_bush', .15], ['verdant_rock_large', .1], ['rock', .15]] },
};
