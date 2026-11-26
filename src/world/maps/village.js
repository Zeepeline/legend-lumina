'use strict';
// Peta: Desa Lumina (Tata letak organik: sumur pusat, setapak terhubung, pekarangan rumah, bengkel terpadu & rumpun pohon)
MAPS.village = {
  id: 'village', name: 'Desa Lumina', w: 1024, h: 712, bgm: 'town', ground: 'village', customGround: 'gnd_village_custom', glow: [512, 345, 480], crowd: 3,
  paths: [
    // Jalan Utara masuk dari barat laut pelataran (asimetris T426)
    [480, 285, 495, 230, 13], [495, 230, 526, 182, 14], [526, 182, 510, 110, 14], [510, 110, 512, 0, 14],
    // Jalan Barat lewat selatan kebun & masuk dari barat daya
    [0, 560, 160, 535, 14], [160, 535, 240, 480, 13], [240, 480, 320, 440, 13],
    [320, 440, 408, 410, 13], [408, 410, 442, 375, 12],
    // Jalan Timur bercabang lewat selatan kandang ke Padang Angin
    [570, 315, 680, 315, 12], [680, 315, 750, 320, 13], [750, 320, 795, 244, 13], [795, 244, 1024, 250, 14],
    // Jalan Selatan melengkung ke jembatan & Hutan Lumina
    [485, 385, 450, 460, 13], [450, 460, 435, 550, 13], [435, 550, 512, 640, 14], [512, 640, 512, 712, 16],
    // Percabangan setapak utara (Pak Darto & Joko di barat; Penginapan, Pasar Bu Sari & Kebun Timur di timur)
    [495, 230, 360, 230, 11], [360, 230, 270, 235, 10], [270, 235, 180, 230, 9],
    [526, 182, 580, 224, 10], [580, 224, 652, 234, 10], [652, 234, 742, 248, 10], [742, 248, 795, 244, 10],
    [795, 244, 868, 200, 9], [868, 200, 942, 166, 9],
    // Setapak Rumah Arka & lingkar tenggara (Bengkel Pak Besi terpadu + Rumah Merah + Warga Selatan)
    [435, 550, 474, 580, 9], [474, 580, 512, 582, 9], [512, 582, 590, 620, 9],
    [750, 320, 766, 425, 10], [766, 425, 760, 542, 10], [760, 542, 784, 608, 10], [784, 608, 868, 606, 10],
    [590, 620, 672, 594, 10], [672, 594, 784, 608, 10], [672, 594, 678, 554, 9],
    [435, 550, 440, 618, 9], [440, 618, 380, 638, 9],
    // Penghubung pelataran tengah desa (bebas lingkaran kaku, tidak menabrak sumur)
    [442, 375, 485, 408, 13], [485, 408, 545, 408, 13], [545, 408, 570, 315, 13],
    [480, 285, 520, 305, 13], [520, 305, 570, 315, 13], [480, 285, 442, 375, 13],
  ],
  discs: [],
  gardens: [[110, 365, 72, 52, 0], [110, 428, 72, 44, 1]],
  objs: [
    ['houseA', 355, 213], ['houseC', 642, 203], ['houseB', 250, 424], ['houseB', 380, 614],
    ['houseB', 947, 142], ['houseBrown', 180, 215], ['houseRed', 669, 542], ['houseProto', 526, 552],
    ['blacksmith', 854, 532], ['well', 506, 375], ['crateCart', 442, 220], ['benchWood', 443, 202],
    // Rumpun pohon alami pembingkai desa (variasi jenis & semak pelapis, bebas garis jalan & teras rumah)
    ['treeAd', 108, 108], ['treeA', 148, 128], ['treeA', 266, 186], ['apple1', 86, 174],
    ['treeA', 382, 82], ['treeAd', 432, 78], ['treeA', 588, 92],
    ['treeAd', 718, 86], ['treeA', 768, 94], ['apple1', 816, 114], ['orange1', 862, 128], ['apple1', 842, 166],
    ['treeAd', 78, 288], ['treeA', 64, 342], ['treeA', 58, 408], ['treeAd', 64, 482], ['treeA', 132, 280],
    ['treeAd', 124, 624], ['treeA', 168, 634], ['apple1', 214, 616], ['treeA', 292, 650], ['treeA', 436, 666],
    ['treeAd', 650, 656], ['treeA', 716, 654], ['treeAd', 776, 658], ['apple1', 844, 652],
    ['treeA', 918, 656], ['treeAd', 954, 594], ['treeA', 956, 466],
    // Semak & bunga tepi rumpun + taman hijau bekas tapak bengkel lama
    ['bushG1', 166, 104], ['bushP', 274, 202], ['bushG1', 642, 104], ['bushP', 788, 124],
    ['bushW', 306, 434], ['bushP', 412, 518], ['bushP', 314, 648], ['bushW', 732, 556],
    ['bushG1', 804, 656], ['bushG1', 194, 646],
    ['benchWood', 692, 416], ['bushP', 722, 410], ['bushW', 666, 422], ['apple1', 716, 452],
    ['reeds', 215, 600], ['reeds', 205, 595], ['reeds', 87, 680], ['reeds', 824, 306],
    // Pasar Bu Sari, Kebun Barat & Lentera Desa
    ['market', 746, 222], ['barrel', 816, 215], ['crate', 812, 200], ['benchWood', 704, 274],
    ['dummy', 236, 472], ['scarecrow', 198, 404], ['seedsack', 96, 482], ['basket', 200, 484], ['watercan', 192, 372],
    ['sign', 214, 440], ['lampPost', 440, 305], ['lampPost', 425, 490], ['lamp', 380, 410], ['lamp', 644, 400],
    ['hay', 85, 497], ['hay', 670, 280], ['barrel', 945, 275], ['mailbox', 320, 220],
    // Pekarangan tiap rumah (burgage plot)
    ['hay', 130, 225], ['barrel', 154, 220], ['woodpile', 102, 206], ['fence', 86, 226], ['fence', 104, 226],
    ['pot', 396, 220], ['planter', 284, 214], ['pot', 584, 200], ['planter', 602, 214],
    ['barrel', 886, 152], ['basket', 906, 160], ['hay', 980, 166], ['fence', 868, 176], ['fence', 886, 176],
    ['woodpile', 316, 420], ['barrel', 314, 402],
    ['woodpile', 314, 616], ['barrel', 316, 598], ['fence', 296, 632], ['fence', 314, 632],
    ['pot', 550, 566], ['planter', 578, 565], ['woodpile', 600, 542],
    ['barrel', 613, 560], ['planter', 640, 556], ['woodpile', 734, 536],
    // Kompleks Bengkel Pak Besi terpadu (tenggara desa)
    ['forge', 904, 560], ['anvilBesi', 832, 574], ['crate', 926, 540], ['barrel', 802, 554],
    ['woodpile', 928, 514], ['hay', 904, 464],
    // Papan petunjuk & pagar kebun
    ['sign', 72, 600], ['sign', 548, 652], ['sign', 960, 280], ['sign', 670, 230], ['sign', 770, 240],
    ['fence', 106, 365], ['fence', 122, 365], ['fence', 138, 365], ['fence', 154, 365], ['fence', 170, 365],
    ['fence', 106, 420], ['fence', 122, 420], ['fence', 138, 420], ['fence', 154, 420], ['fence', 170, 420], ['fence', 186, 420],
  ],
  ranch: { x: 840, y: 310, w: 110, h: 48, gate: [318, 342] },
  walls: [
    [840, 310, 110, 6], [840, 352, 110, 6], [944, 310, 6, 48], [840, 310, 6, 8], [840, 342, 6, 16],
    [0, 0, 1024, 60], [0, 0, 46, 560], [0, 620, 46, 92], [978, 0, 46, 238], [978, 296, 46, 416],
    [0, 676, 478, 40], [546, 676, 478, 40], [110, 365, 72, 52]
  ],
  border: { top: 70, bottom: 670, left: 44, right: 980, gap: [474, 550], gapR: [228, 304], gapL: [560, 620], types: ['treeAd', 'treeBd', 'pined'] },
  exits: [{ x: 0, y: 560, w: 12, h: 60, to: 'lake', tx: 1350, ty: 500, dir: 'left', label: 'Danau Cermin' },
    { x: 474, y: 700, w: 76, h: 30, to: 'forest', tx: 640, ty: 44, dir: 'down', label: 'Hutan Lumina' },
    { x: 1010, y: 238, w: 30, h: 58, to: 'meadow', tx: 30, ty: 330, dir: 'right', label: 'Padang Angin' }],
  npcs: [
    { id: 'elder', ch: 'elder', name: 'Tetua Bram', x: 486, y: 95, dir: 'down' },
    { id: 'girl', ch: 'girl', name: 'Lina', x: 380, y: 235, dir: 'left', wander: 18 },
    { id: 'farmer', ch: 'farmer', name: 'Pak Darto', x: 330, y: 235, dir: 'right', wander: 18 },
    { id: 'merchant', ch: 'merchant', name: 'Bu Sari', x: 730, y: 245, dir: 'down' },
    { id: 'child', ch: 'child', name: 'Dodi', x: 540, y: 410, dir: 'left', wander: 22 },
    { id: 'guard', ch: 'guard', name: 'Penjaga', x: 470, y: 652, dir: 'right' },
    { id: 'woman', ch: 'woman', name: 'Bu Lastri', x: 250, y: 445, dir: 'down', wander: 16 },
    { id: 'smith', ch: 'smith', name: 'Pak Besi', x: 856, y: 568, dir: 'left' },
    { id: 'chick_master', ch: 'child', name: 'Kiki Penggembala', x: 820, y: 330, dir: 'down', wander: 14 },
    { id: 'mira', ch: 'woman', name: 'Mira', x: 600, y: 350, dir: 'down' },
    { id: 'ayam', ch: 'child', name: 'Ayam Desa', x: 150, y: 460, dir: 'down', wander: 18 },
  ],
  animals: [['cat', 480, 345, 0], ['cat', 540, 345, 1], ['fox', 640, 600, 0], ['cat', 320, 235, 0], ['fox', 270, 600, 0]],
  doors: [[180, 215, 'Pondok Kayu Pak Joko.'], [680, 530, 'Rumah Tepi Sungai.'], [355, 213, 'Rumah Pak Darto & Lina.'],
    [642, 203, { to: 'inn' }], [350, 602, 'Rumah Warga Selatan.'],
    [947, 142, 'Rumah Kebun Timur.'], [512, 556, { to: 'home' }], [250, 424, 'Rumah Bu Lastri. Ada bau kue jahe...'],
    [854, 532, 'Bengkel Pak Besi. Bau arang dan besi panas.'], [513, 66, { to: 'elderhome' }],
    [180, 440, { to: 'arena', tx: 220, ty: 280, label: 'Arena Latihan' }]],
  butterflies: 7,
};
