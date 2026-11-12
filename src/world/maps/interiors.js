'use strict';
// Interior: penginapan, rumah pohon, rumah Lina
// ---------------- INTERIOR ----------------
function makeRoom(id, name, back, o) {
  return Object.assign({ id, name, w: 320, h: 336, bgm: 'town', ground: 'room', indoor: 1, room: [56, 80, 208, 160], objs: [],
    walls: [[40, 40, 240, 40], [40, 40, 16, 220], [264, 40, 16, 220], [40, 240, 100, 16], [180, 240, 100, 16], [124, 256, 16, 40], [180, 256, 16, 40]],
    exits: [{ x: 140, y: 254, w: 40, h: 40, to: 'village', tx: back[0], ty: back[1], dir: 'down', label: 'Desa Lumina' }] }, o);
}
MAPS.inn = makeRoom('inn', 'Penginapan Daun Emas', [752, 238], {
  furn: [['rug', 132, 150, 0], ['counter', 120, 106], ['bed', 62, 120, 0], ['bed', 62, 176, 1], ['bed', 236, 120, 1], ['bed', 236, 176, 0], ['shelf', 64, 52, 1], ['shelf', 216, 52, 2]], windows: [110, 190],
  doors: [
    [82, 78, 'Buku Tamu Penginapan: "Banyak musafir mengeluhkan monster malam yang lebih ganas. Pastikan membawa obor atau ramuan sebelum berpetualang saat gelap."'],
    [234, 78, 'Buku Kuliner Desa: "Ikan Bakar Lumina memulihkan tenaga lebih besar daripada ikan mentah. Dapur Bu Rina selalu terbuka untuk tamu yang ingin memasak!"']
  ],
  npcs: [{ id: 'inn', ch: 'inn', name: 'Bu Rina', x: 160, y: 102, dir: 'down', reach: 30 }],
});
MAPS.elderhome = makeRoom('elderhome', 'Rumah Pohon Tetua', [513, 306], {
  wallc: '#d8c49a', furn: [['rug', 132, 140, 1], ['shelf', 64, 52, 0], ['shelf', 104, 52, 3], ['shelf', 220, 52, 5], ['table', 76, 130], ['bed', 238, 100, 1], ['stove', 176, 50]], windows: [146],
  chests: [{ id: 'e1', x: 230, y: 216, item: 'ether2' }],
  objs: [['village_vault', 68, 206]],
  doors: [
    [82, 78, 'Buku tua: "...Morgath, murid yang terusir dari desa, mempelajari sihir segel di Rawa Senja..."'],
    [122, 78, 'Catatan Tetua: "Kristal Lumina meredup setiap kali kabut rawa menebal. Apakah ada hubungannya?"'],
    [238, 78, 'Buku Iklim Benua: "Saat hujan turun, tanah menjadi sangat subur. Tanaman kebun tumbuh 2x lipat lebih cepat dan ikan langka bermunculan di perairan!"']
  ],
});
MAPS.linahome = makeRoom('linahome', 'Rumah Lina', [272, 238], {
  wallc: '#f0d8c8', furn: [['rug', 132, 160, 0], ['table', 143, 112], ['stove', 64, 50], ['shelf', 220, 52, 4], ['bed', 62, 150, 0], ['bed', 236, 150, 1]], windows: [120, 180],
  doors: [
    [238, 78, 'Catatan Harian Lina: "Mochi sangat suka ikan mas segar. Kucing desa juga suka dielus kepalanya! ...Eh, ada 1 Benih Sayur terselip di sini!"', 'lina_shelf']
  ],
  npcs: [{ id: 'mom', ch: 'mom', name: 'Bu Wulan', x: 120, y: 112, dir: 'down' }],
});
MAPS.temple = makeRoom('temple', 'Kuil Penjaga Cahaya', [0, 0], {
  wallc: '#b4bfd2', floor: ['#6e7890', '#9aa4b8', '#a8b2c4', '#828ca2'], ground: 'room', bgm: 'cave', furn: [['rug', 132, 150, 1]], windows: [],
  objs: [['altar', 160, 140], ['mirror_memory', 84, 136], ['templekoipond', 88, 190], ['birdbath', 230, 190]],
  exits: [{ x: 140, y: 254, w: 40, h: 40, to: 'lake', tx: 936, ty: 530, dir: 'down', label: 'Danau Cermin' }],
  reliefs: [[86, 70, 'kuil_relief'], [234, 70, 'kuil_aurel']], sealDoor: [160, 74],
  npcs: [{ id: 'temple_priest', ch: 'priest', name: 'Pendeta Elian', x: 200, y: 136, dir: 'left', reach: 30 }],
});
MAPS.kinn = makeRoom('kinn', 'Penginapan Seribu Lentera', [560, 300], {
  objs: [['musicbox', 216, 172]],
  wallc: '#e8d0b0', furn: [['rug', 132, 150, 2], ['counter', 120, 106], ['bed', 62, 120, 0], ['bed', 62, 176, 1], ['table', 224, 180], ['shelf', 64, 52, 1], ['shelf', 216, 52, 3]], windows: [110, 190],
  doors: [
    [82, 78, 'Lukisan Dinding Kuno: "Tampak pemandangan Danau Cermin di masa silam sebelum kabut menelan kuil suci di tengahnya..."'],
    [234, 78, 'Panduan Berkelana Kota: "Distrik Pasar menjual berbagai macam bahan olahan. Temui para perajin untuk memperkuat perlengkapanmu!"']
  ],
  exits: [{ x: 140, y: 254, w: 40, h: 40, to: 'kpasar', tx: 560, ty: 320, dir: 'down', label: 'Distrik Pasar' }],
  npcs: [
    { id: 'inn', ch: 'inn', name: 'Bu Laras', x: 160, y: 102, dir: 'down', reach: 30 },
    { id: 'dice_gambler', ch: 'joko', name: 'Bram si Pengelana', x: 240, y: 172, dir: 'left', reach: 28 }
  ],
});
MAPS.arsip = makeRoom('arsip', 'Arsip Akademi Cahaya', [0, 0], {
  wallc: '#8a7a6a', floor: ['#5a4a3a', '#7a6248', '#84694e', '#6a5440'], bgm: 'cave', furn: [['rug', 132, 150, 1], ['table', 143, 140], ['shelf', 64, 52, 0], ['shelf', 104, 52, 3], ['shelf', 176, 52, 5], ['shelf', 216, 52, 1]], windows: [],
  objs: [['alchemytable', 230, 190]],
  exits: [{ x: 140, y: 254, w: 40, h: 40, to: 'kakademi', tx: 700, ty: 400, dir: 'down', label: 'Distrik Akademi' }],
  loreSpots: [[64, 84, 'arsip_selene'], [104, 84, 'arsip_rongga'], [176, 84, 'arsip_bram'], [216, 84, 'arsip_morgath']],
});
