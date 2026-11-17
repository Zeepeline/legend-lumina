'use strict';
// Peta: Desa Lumina (Tata Letak Presisi Meniru Referensi Asli)
MAPS.village = {
  id: 'village', name: 'Desa Lumina', w: 1024, h: 712, bgm: 'town', ground: 'village', glow: [512, 345, 480], crowd: 3,
  paths: [
    // Jalan Utara masuk dari barat laut pelataran (asimetris T426)
    [480, 285, 495, 230, 13], [495, 230, 526, 182, 14], [526, 182, 510, 110, 14], [510, 110, 512, 0, 14],
    // Jalan Barat lewat selatan kebun & masuk dari barat daya
    [0, 560, 160, 535, 14], [160, 535, 240, 480, 13], [240, 480, 320, 440, 13],
    [320, 440, 408, 410, 13], [408, 410, 442, 375, 12],
    // Jalan Timur bercabang lewat bengkel ke Padang Angin
    [570, 315, 680, 315, 12], [680, 315, 750, 320, 13], [750, 320, 795, 244, 13], [795, 244, 1024, 250, 14],
    // Jalan Selatan melengkung ke jembatan & Hutan Lumina
    [485, 385, 450, 460, 13], [450, 460, 435, 550, 13], [435, 550, 512, 640, 14],
    [512, 640, 512, 712, 16],
    // Percabangan setapak pintu rumah
    [495, 230, 360, 230, 11],
    [360, 230, 270, 235, 10], [270, 235, 180, 230, 9],
    [526, 182, 630, 215, 11],
    [680, 315, 700, 395, 9],
    [512, 640, 590, 620, 11], [590, 620, 670, 540, 10],
  ],
    discs: [[512, 345, 62], [462, 330, 46], [566, 368, 52], [520, 300, 38]],
  gardens: [[110, 365, 72, 52, 0], [110, 428, 72, 44, 1]],
  objs: [
    ['bigtree', 512, 80, { ok: 'rumah pohon Tetua Bram di puncak utara desa' }],
    ['houseA', 355, 213],
    ['houseC', 630, 213],
    ['houseB', 245, 390],
    ['houseB', 742, 411, { flip: 1 }],
    ['houseB', 512, 556],
    ['houseBrown', 180, 215],
    ['houseRed', 680, 530],
    ['well', 512, 345],
    // Pelataran sumur asimetris (T421)
    ['board', 552, 325],
    ['crateCart', 585, 355],
    ['benchWood', 472, 365],
    ['bench', 548, 375],
    // Pepohonan rindang di sekitar rumah warga (animasi wind sway)
    ['treeA', 120, 110],
    ['treeA', 150, 130],
    ['treeA', 110, 170],
    ['treeA', 380, 80],
    ['treeA', 430, 75],
    ['treeA', 465, 95],
    ['treeA', 720, 85],
    ['treeA', 765, 90],
    ['treeA', 810, 115],
    ['treeA', 795, 170],
    ['treeA', 850, 175],
    ['treeA', 65, 330],
    ['treeA', 55, 395],
    ['treeA', 60, 475],
    ['treeA', 565, 580],
    ['treeA', 665, 600],
    ['treeA', 730, 590],
    ['treeA', 230, 615],
    ['treeA', 275, 625],
    ['treeA', 320, 630],
    ['treeA', 285, 205],
    ['treeA', 140, 275],
    ['treeA', 785, 485],
    ['treeA', 835, 520],
    // Gelagah di tepi air (T417)
    ['reeds', 215, 600], ['reeds', 205, 595], ['reeds', 285, 615],
    ['reeds', 440, 642], ['reeds', 570, 642],
    ['fieldoven', 430, 620],
    ['market', 746, 222], ['barrel', 816, 215], ['crate', 560, 215],
    
    ['bell', 440, 260],
    ['dummy', 150, 445], ['sign', 214, 440],
     
    ['lampPost', 440, 305], ['lampPost', 584, 305],
    ['lamp', 380, 410], ['lamp', 644, 400],
    ['forge', 964, 560], ['bellows', 942, 564], ['anvil', 916, 556],
    ['barrel', 900, 540], ['crate', 960, 510], ['log', 970, 600],
    ['hay', 100, 480], ['hay', 670, 280],
    ['hay', 850, 275], ['barrel', 945, 275],
    ['pot', 396, 220], ['pot', 590, 220], ['planter', 570, 225], ['mailbox', 320, 220],
    // T381: Jejak kehidupan di depan rumah warga
    ['hay', 130, 225], ['barrel', 154, 220], // Pondok Pak Joko (petani: jerami & tong benih)
    ['pot', 290, 396], ['planter', 200, 396], // Rumah Bu Lastri (bunga & pot tanaman harum)
    ['woodpile', 734, 540], ['barrel', 626, 540], // Rumah Tepi Sungai (kayu bakar & gentong air)
    ['crate', 695, 420], ['barrel', 790, 420], // Bengkel Pak Besi (peti perkakas & tong arang)
    ['pot', 545, 565], ['planter', 572, 565], // Rumah Arka (pot & bunga samping teras timur)
    ['stele', 570, 280, { lore: 'prasasti_desa' }],
    ['sign', 450, 410, { text: 'PERSIMPANGAN ALUN-ALUN\n← Danau Cermin · ↑ Rumah Tetua · ↓ Hutan Lumina · → Pasar & Padang' }],
    ['sign', 72, 600, { text: 'Barat: DANAU CERMIN' }],
    ['sign', 548, 652, { text: 'Selatan: Hutan Lumina\nHati-hati, banyak monster!' }],
    ['sign', 960, 280, { text: 'Timur: Padang Angin\nLebih jauh lagi ada Gua Batu.' }],
    ['sign', 670, 230, { text: 'Penginapan "Daun Emas"\nMasuk lewat pintu. Istirahat 10 G' }],
    ['sign', 770, 240, { text: 'Kios Bu Sari\nRamuan & perlengkapan' }],
    // Pagar kayu pekarangan kebun di sisi kiri Rumah Cokelat (W)
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
    { id: 'woman', ch: 'woman', name: 'Bu Lastri', x: 260, y: 415, dir: 'down', wander: 16 },
    { id: 'smith', ch: 'smith', name: 'Pak Besi', x: 720, y: 435, dir: 'right' },
    { id: 'chick_master', ch: 'child', name: 'Kiki Penggembala', x: 820, y: 330, dir: 'down', wander: 14 },
    { id: 'ayam', ch: 'child', name: 'Ayam Desa', x: 150, y: 460, dir: 'down', wander: 18 },
  ],
  animals: [['cat', 480, 345, 0], ['cat', 540, 345, 1], ['fox', 640, 600, 0], ['cat', 320, 235, 0], ['fox', 270, 600, 0]],
  doors: [[180, 215, 'Pondok Kayu Pak Joko.'], [680, 530, 'Rumah Tepi Sungai.'], [355, 213, 'Rumah Pak Darto & Lina.'],
    [630, 213, { to: 'inn' }], [512, 556, { to: 'home' }], [245, 390, 'Rumah Bu Lastri. Ada bau kue jahe...'],
    [742, 411, 'Bengkel Pak Besi. Bau arang dan besi panas.'], [513, 66, { to: 'elderhome' }],
    [180, 440, { to: 'arena', tx: 220, ty: 280, label: 'Arena Latihan' }]],
  butterflies: 7,
};
