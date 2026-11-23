'use strict';
// Peta: Jalan Raya Lama + Kota Lumina "Kota Seribu Lentera" (gerbang, pasar, akademi, kota bawah). Desain: docs/BENUA_LUMINA.md
// Pembantu: deretan rumah & lentera
const houseRow = (x0, y, n, dx = 132, types = ['houseA', 'houseB', 'houseC']) => [...Array(n)].map((_, i) => [types[i % types.length], x0 + i * dx, y]);
const lampRow = (x0, y, n, dx) => [...Array(n)].map((_, i) => ['lamp', x0 + i * dx, y]);
const cityLines = {
  warga: ['Malam di sini tak pernah gelap. Seribu lentera, katanya. Aku belum pernah menghitungnya.', 'Harga roti naik lagi. Gandum dari Desa Kincir makin jarang datang.', 'Kudengar Akademi menolak murid baru tahun ini. Ada apa di dalam sana?', 'Dewan dan Serikat Dagang bertengkar soal pajak lagi. Kami yang kena getahnya.'],
  pedagang: ['Kain dari Teluk Karang! Rempah dari Simpang Rantau! Lihat-lihat dulu!', 'Serikat menaikkan sewa lapak. Kalau begini terus, aku pulang ke desa saja.', 'Serpihan kristal? Ssst... jangan keras-keras. Yang punya izin cuma orang Serikat.'],
  murid: ['Ujian sihir cahaya minggu depan. Aku belum hafal satu pun mantra.', 'Arsip lantai bawah? Hanya guru yang boleh masuk.', 'Konon dulu Akademi melatih para Penjaga Cahaya. Sekarang tinggal cerita.'],
  bawah: ['Dapur umum Guru Lestari satu-satunya alasan anak-anak di sini masih bisa makan.', 'Orang atas tak pernah turun ke sini. Kecuali penagih sewa.', 'Aku dulu penambang di Lembah Besi. Lembahnya makin dingin, jadi aku pindah ke kota.'],
  gerbang: ['Selamat datang di Kota Lumina! Lewat saja di bawah lengkungan gerbang, lurus ke utara menuju Distrik Pasar.', 'Gerbang terbuka untuk pendatang. Pasar ada di balik tembok ini, ikuti jalan batu ke utara.'],
  penjaga: ['Gerbang dibuka dari fajar sampai tengah malam. Jangan bikin onar.', 'Sejak jalan longsor dibuka, pendatang dari timur makin banyak.'],
};
const citizens = (list) => list.map(([id, ch, name, x, y, kind, wander = 22]) => ({ id, ch, name, x, y, dir: 'down', wander, lines: cityLines[kind] }));

MAPS.road = {
  id: 'road', name: 'Jalan Raya Lama', w: 900, h: 2000, scale: 3.4, bgm: 'field', ground: 'meadow', customGround: 'gnd_road_custom',
  paths: [[450, 2000, 450, 1500, 16], [450, 1500, 360, 1100, 16], [360, 1100, 520, 700, 16], [520, 700, 450, 300, 16], [450, 300, 450, 0, 16]],
  discs: [],
  objs: [['stele', 500, 1720, { lore: 'batu_mil' }],
    ['stele', 560, 660, { text: 'Batu penanda jalan, aksaranya kuno: "AUREL — 40 langkah kuda".\nKota yang namanya tertulis di sini sudah lama tak ada.' }],
    ['stele', 390, 260, { text: 'Batu Mil Utara\nKota Lumina: 2 langkah busur di utara.' }],
    ['stele', 400, 1500, { text: 'Batu Mil Selatan\nDanau Cermin: 10 langkah busur di selatan.' }],
    ['campfire', 560, 520], ['bench', 560, 480], ['crate', 590, 520], ['barrel', 540, 545],
    ['cart', 390, 880], ['crate', 420, 876], ['barrel', 380, 894],
    ['rock', 300, 900], ['rock', 312, 930], ['stump', 600, 820], ['log', 620, 1600],
    ['crate', 360, 1240], ['crate', 330, 1210], ['barrel', 430, 1290], ['barrel', 450, 1294], ['hay', 340, 1290], ['coffeekettle', 330, 1250],
    ['coffeeshrub', 260, 840], ['coffeeshrub', 640, 1500],
    // Markas Suku Goblin Perompak Kafilah (tebing timur Jalan Raya Lama)
    ['goblin_fortress', 760, 950, { ok: 'benteng utama suku goblin perompak di tebing jalan' }],
    ['goblin_hut', 790, 890, { ok: 'barak suku goblin perompak' }],
    ['goblin_tower', 720, 900, { ok: 'menara intip utara jalan' }],
    ['goblin_tower', 770, 1080, { ok: 'menara intip selatan jalan' }],
    ['goblin_forge', 700, 1010, { ok: 'tempat tempa senjata suku goblin perompak' }],
    ['goblin_wagon', 560, 1140, { ok: 'gerobak rampasan suku goblin perompak' }],
    ['crate', 590, 1150], ['barrel', 540, 1160],
    ['goblin_cage', 640, 1120, { ok: 'kurungan tawanan kafilah goblin' }],
    ['goblin_gate', 510, 1100, { ok: 'palang pos tol perompak samping jalan' }],
    ['goblin_totem', 490, 1140],
    ['goblin_torch', 540, 1080], ['goblin_torch', 740, 990],
    ['goblin_banner', 500, 1070], ['goblin_banner', 720, 960],
    // T433: Properti cerita khas markas perompak Jalan Raya (barang kafilah curian)
    ['crate', 740, 920], ['crate', 710, 1040], ['barrel', 750, 1020],
    ['crate', 660, 1140], ['barrel', 680, 1150], ['log', 580, 1180],
    ['sign', 470, 1210, { text: 'Pos Istirahat Kafilah\nKota Lumina: setengah hari ke utara.\nAWAS: Suku Goblin Perompak bersarang di tebing timur!' }]],
  // T445: Tebing timur sepanjang markas perompak
  cliffs: [
    [810, 840, 810, 1180, 'W'],
  ],
  walls: [[0, 0, 410, 40], [490, 0, 410, 40], [0, 0, 40, 2000], [860, 0, 40, 2000], [0, 1960, 410, 40], [490, 1960, 410, 40]],
  border: { top: 40, bottom: 1960, left: 40, right: 860, gap: [410, 490], gapT: [410, 490], types: ['treeA', 'treeB', 'pine'] },
  exits: [{ x: 410, y: 1988, w: 80, h: 12, to: 'lake', tx: 820, ty: 70, dir: 'down', label: 'Danau Cermin' },
    { x: 410, y: 0, w: 80, h: 12, to: 'kgate', tx: 600, ty: 860, dir: 'up', label: 'Kota Lumina' }],
  npcs: [{ id: 'kafilah', ch: 'darma', name: 'Kusir Kafilah', x: 410, y: 1250, dir: 'down' }],
  enemies: [['wolf', 300, 1700], ['wolf', 600, 1620], ['boar', 560, 1420], ['boar', 280, 1050], ['wolf', 640, 960], ['bee', 300, 760], ['bee', 640, 600], ['boar', 360, 420], ['wolf', 560, 300],
    ['goblin_elite', 700, 1060], ['goblin_shaman', 775, 1120],
    ['goblin_archer', 590, 1040], ['goblin_archer', 805, 1040],
    ['goblin', 650, 1150], ['goblin', 745, 1150]],
  trees: { n: 900, min: 28, types: [['treeA', .4], ['treeB', .3], ['pine', .15], ['rock', .15]] },
};

MAPS.kgate = {
  id: 'kgate', customGround: 'gnd_kgate_custom', name: 'Gerbang Kota Lumina', w: 1200, h: 900, bgm: 'town', ground: 'village', pathType: 'paving', glow: [600, 360, 600], crowd: 6,
  paths: [[600, 900, 600, 380, 48], [600, 640, 300, 640, 12], [600, 640, 900, 640, 12]],
  discs: [[600, 460, 80], [300, 640, 50], [900, 640, 50]],
  ponds: [[150, 840, 160, 70], [1050, 840, 160, 70]],
  objs: [
    ['gatehouse', 600, 424],
    ['citywallL', 261, 424], ['citywallR', 938, 424], /* tembok kota (gambar pemilik): x 21–501 & 699–1177, rapat ke sayap gapura */
    ['gpt_city_lamp', 554, 474], ['gpt_city_lamp', 646, 474],
    ['gpt_city_banner_sm', 526, 474], ['gpt_city_banner_sm', 674, 474],
    ['gpt_city_banner', 566, 340], ['gpt_city_banner', 634, 340],
    ['gpt_city_cliff_l', 160, 840, { ok: 'tebing sungai kiri bawah sesuai referensi' }],
    ['gpt_city_cliff_r', 1040, 840, { ok: 'tebing sungai kanan bawah sesuai referensi' }],
    ['gpt_city_fence', 510, 840], ['gpt_city_fence', 710, 840],
    ['gpt_city_rock_lg', 770, 600], ['gpt_city_rock_sm', 800, 615],
    ['gpt_city_flower_w', 555, 660], ['gpt_city_flower_p', 645, 660],
    ['sign', 550, 660, { text: 'PERSIMPANGAN GERBANG\n↑ Distrik Pasar · ↓ Jalan Raya Lama · ← Pos Sayap Barat · → Sayap Timur' }],
    ['sign', 670, 840, { text: 'SELAMAT DATANG DI KOTA LUMINA\nKota Seribu Lentera\n↑ Masuk gerbang utama menuju Distrik Pasar' }],
    ['sign', 680, 600, { text: 'KOTA LUMINA — Kota Seribu Lentera\n↑ Masuk lewat gerbang di utara → Distrik Pasar.' }],
    ['bounty_board', 720, 600],
    ['crate', 260, 620], ['crate', 282, 616], ['barrel', 330, 630], ['crate', 880, 620], ['barrel', 930, 626],
    ['planter', 470, 490], ['planter', 730, 490],
    ['pigeons', 680, 520], ['pigeons', 420, 680],
    ['archerytarget', 340, 720]
  ],
  walls: [
    [0, 0, 540, 40], [660, 0, 540, 40],
    [0, 0, 40, 900], [1160, 0, 40, 900],
    [0, 860, 560, 40], [640, 860, 560, 40],
    [0, 380, 560, 44], [640, 380, 560, 44]
  ],
  border: { top: 40, bottom: 860, left: 40, right: 1160, gap: [560, 640], gapT: [540, 660], types: ['treeA', 'treeB'] },
  exits: [
    { x: 560, y: 888, w: 80, h: 12, to: 'road', tx: 450, ty: 60, dir: 'down', label: 'Jalan Raya Lama' },
    { x: 560, y: 388, w: 80, h: 20, to: 'kpasar', tx: 800, ty: 1150, dir: 'up', label: 'Distrik Pasar' }
  ],
  npcs: citizens([
    ['gj1', 'guard_spear', 'Penjaga Gerbang', 562, 456, 'gerbang', 0],
    ['gj2', 'guard_spear', 'Penjaga Gerbang', 638, 456, 'gerbang', 0],
    ['courier', 'boy', 'Budi Kurir Kilat', 380, 720, 'warga', 0],
    ['gw1', 'woman', 'Pelancong', 300, 700, 'warga'],
    ['gw2', 'farmer', 'Petani', 900, 700, 'warga']
  ]),
  trees: { n: 40, min: 30, types: [['treeA', .3], ['bushG1', .4], ['rock', .3]] },
};

MAPS.kpasar = {
  id: 'kpasar', customGround: 'gnd_kpasar_custom', name: 'Distrik Pasar', w: 1600, h: 1200, bgm: 'town', ground: 'village', glow: [800, 600, 900], crowd: 12,
  paths: [[800, 1200, 800, 0, 34], [0, 620, 1600, 620, 30], [400, 360, 1200, 360, 18], [400, 900, 1200, 900, 18], [400, 360, 400, 900, 18], [1200, 360, 1200, 900, 18]],
  discs: [[800, 620, 170], [400, 900, 40], [1200, 360, 40], [640, 500, 60], [960, 500, 60], [640, 790, 60], [960, 790, 60]],
  objs: [['fountain', 800, 640, { ok: 'air mancur di tengah alun-alun pasar' }],
    ...[[640, 500], [960, 500], [640, 790], [960, 790], [640, 420], [960, 420], [640, 860], [960, 860], [510, 430], [1090, 430], [510, 850], [1090, 850], [668, 250], [932, 250], [668, 1020], [932, 1020]].map(([x, y]) => ['market', x, y]),
    ...houseRow(180, 170, 2), ...houseRow(1300, 170, 2), ...houseRow(180, 440, 2), ...houseRow(1300, 440, 2),
    ...houseRow(180, 780, 2), ...houseRow(1300, 780, 2),
    ...houseRow(180, 300, 2), ...houseRow(1300, 300, 2), ...houseRow(180, 1100, 2), ...houseRow(1300, 1100, 2), ['houseC', 560, 300], ['houseA', 1040, 300], ['houseB', 560, 1100], ['houseC', 1040, 1100],
    ['crateCart', 530, 500], ['crateCart', 1070, 790],
    ['crate', 560, 504], ['crate', 560, 488], ['barrel', 576, 500], ['barrelNew', 576, 486],
    ['crate', 1030, 498], ['barrel', 1045, 504], ['crate', 1030, 484],
    ['crate', 560, 792], ['barrel', 576, 792], ['hay', 560, 808],
    ['crate', 1030, 792], ['barrel', 1045, 788], ['hay', 1030, 806],
    ...lampRow(480, 560, 2, 640), ...lampRow(480, 700, 2, 640), ...lampRow(700, 430, 3, 100), ...lampRow(700, 850, 3, 100), ...lampRow(200, 580, 3, 120), ...lampRow(1160, 580, 3, 120),
    ['bench', 720, 720], ['bench', 880, 720], ['planter', 690, 560], ['planter', 910, 560], ['barrel', 430, 840], ['crate', 1170, 840],
    ['ringbooth', 720, 480],
    // T406 & T407: Kuil/Shrine & Kedai Pasar
    ['shrine', 800, 470], // Kuil menghadap alun-alun pasar (utara air mancur)
    ['benchWood', 510, 310], ['barrel', 490, 314], ['sign', 530, 320, { text: 'Kedai Seribu Lentera' }],
    ['sign', 860, 1120, { text: 'DISTRIK PASAR\nUtara: Distrik Akademi · Barat: Kota Bawah · Timur: Balai Dewan' }],
    ['sign', 1540, 680, { text: 'BALAI DEWAN KOTA\nTertutup untuk umum. Urusan dewan saja.' }], ['sign', 610, 330, { text: 'Penginapan "Seribu Lentera"' }]],
  walls: [[0, 0, 760, 40], [840, 0, 760, 40], [0, 0, 40, 590], [0, 650, 40, 550], [1560, 0, 40, 1200], [0, 1160, 760, 40], [840, 1160, 760, 40]],
  border: { top: 40, bottom: 1160, left: 40, right: 1560, gap: [760, 840], gapT: [760, 840], gapL: [590, 650], types: ['treeAd', 'treeBd'] },
  exits: [{ x: 760, y: 1188, w: 80, h: 12, to: 'kgate', tx: 600, ty: 440, dir: 'down', label: 'Gerbang Kota' },
    { x: 760, y: 0, w: 80, h: 12, to: 'kakademi', tx: 700, ty: 960, dir: 'up', label: 'Distrik Akademi' },
    { x: 0, y: 590, w: 12, h: 60, to: 'kbawah', tx: 1150, ty: 500, dir: 'left', label: 'Kota Bawah' }],
  doors: [[560, 300, { to: 'kinn' }], [180, 300, 'Rumah penjahit. Pintunya terkunci.'], [1300, 300, 'Kantor Serikat Dagang cabang Kota Lumina. Penjaganya menatapmu tajam.'], [1040, 300, 'Toko buku. "Tutup sampai ujian Akademi selesai."']],
  npcs: [{ id: 'kmerchant', ch: 'merchant', name: 'Pedagang Pasar', x: 640, y: 530, dir: 'down' },
    { id: 'auctioneer', ch: 'elder', name: 'Juru Lelang Bastian', x: 740, y: 380, dir: 'down' },
    { id: 'rudi', ch: 'child', name: 'Rudi', x: 980, y: 700, dir: 'left', wander: 20 },
    ...citizens([['kp1', 'woman', 'Warga', 700, 760, 'warga'], ['kp2', 'farmer', 'Warga', 900, 470, 'warga'], ['kp3', 'merchant', 'Pedagang', 960, 530, 'pedagang', 0], ['kp4', 'girl', 'Gadis Kota', 520, 660, 'warga'],
      ['kp5', 'smith', 'Kuli Angkut', 1100, 880, 'pedagang'], ['kp6', 'joko', 'Pedagang Rempah', 640, 820, 'pedagang', 0], ['kp7', 'woman', 'Warga', 300, 640, 'warga'], ['kp8', 'guard', 'Penjaga Kota', 1480, 640, 'penjaga', 0]])],
  animals: [['cat', 760, 760, 0], ['cat', 1150, 520, 1]],
  trees: { n: 30, min: 30, types: [['bushG1', .5], ['planter', .3], ['rock', .2]] },
};

// KOMPLEKS AKADEMI berpagar (x 120–1280, y 100–640), gerbang lengkung di tengah bawah menghadap alun-alun.
// Area: gedung utama (tengah), asrama & rumah guru (belakang + sisi), Lapangan Latihan (kiri bawah),
// Taman Akademi dengan air mancur (kanan bawah), halaman depan berlampu (tengah).
const ACAD_BOX = { X0: 120, X1: 1280, Y0: 100, Y1: 640, gate: 700 };
function acadYard() {
  const { X0, X1, Y0, Y1, gate } = ACAD_BOX, o = [];
  const row = (a, b, y) => { /* pagar 81 px bersambung dari a; sisa di ujung ditutup tiang */
    let x = a + 41; for (; x + 40 <= b; x += 81) o.push(['acadfence', x, y]);
    if (x - 41 < b - 6) o.push(['acadpost', b - 7, y]);
  };
  row(X0, X1, Y0); row(X0, gate - 45, Y1); row(gate + 45, X1, Y1);
  for (let y = Y0 + 36; y < Y1 - 10; y += 36) { o.push(['acadpost', X0 + 6, y]); o.push(['acadpost', X1 - 6, y]); }
  o.push(['acadgate', gate, Y1 + 2]);
  return o;
}
MAPS.kakademi = {
  id: 'kakademi', customGround: 'gnd_kakademi_custom', name: 'Distrik Akademi', w: 1400, h: 1000, bgm: 'town', ground: 'village', glow: [700, 500, 700], crowd: 5,
  /* paving dirancang (gambar tanah dibuat dari bentuk ini: jalan utama, teras, jalan melintang, lapangan, taman, alun-alun) */
  paths: [[700, 1000, 700, 384, 28], [284, 464, 1116, 464, 16], [243, 384, 243, 480, 10], [303, 384, 303, 480, 10], [1097, 384, 1097, 480, 10], [1157, 384, 1157, 480, 10],
    [1040, 480, 1040, 524, 10], [176, 760, 512, 760, 16], [1100, 582, 1214, 582, 10]],
  discs: [[700, 382, 140], [1212, 558, 60], [300, 350, 90], [1100, 350, 90], [348, 560, 140], [1040, 572, 60], [700, 776, 150]],
  objs: [['academy', 700, 380], ...acadYard(),
    // halaman depan: lampu sepanjang jalan, teleskop, papan pengumuman dekat gerbang
    ...lampRow(620, 460, 2, 160), ['acadlamp', 620, 572], ['acadlamp', 780, 572],
    ['telescope', 630, 500], ['telescope', 770, 500], ['pot', 650, 400], ['pot', 750, 400], ['acadboard', 592, 628],
    ['planter', 548, 504], ['planter', 852, 504],
    // gedung belakang: asrama & aula
    ['acaddorm', 300, 380], ['acaddorm', 1100, 380, { flip: 1 }], /* asrama barat & timur (gambar pemilik, timur dicerminkan) */
    ['acadcypress', 190, 210], ['acadtopiary', 300, 200], ['acadcypress', 410, 210],
    ['acadcypress', 990, 210], ['acadtopiary', 1100, 200], ['acadcypress', 1210, 210],
    // Lapangan Latihan (kiri bawah)
    ['acaddummy', 220, 520], ['acaddummy', 270, 540], ['acaddummy', 320, 520], ['acadtarget', 430, 500], ['acadtarget', 480, 500],
    ['acadrack', 400, 600], ['acadcrates', 500, 606], ['acadcrates2', 180, 610], ['clockworktower', 160, 470],
    // Taman Akademi (kanan bawah)
    ['acadfountain', 1040, 586], ['acadbench', 950, 600], ['acadbench', 1040, 660],
    ['acadstatue', 900, 530], ['acadcypress', 880, 624], ['acadtopiary', 980, 504], ['acadtopiary', 1124, 504],
    ['acadgreenhouse', 1214, 562], /* rumah kaca (gambar pemilik) */
    // alun-alun di luar gerbang
    ['shrine', 700, 760], ['acadpottree', 640, 676], ['acadpottree', 760, 676],
    ...lampRow(560, 720, 2, 280), ...lampRow(620, 880, 2, 160), ...lampRow(240, 680, 2, 120), ...lampRow(1040, 680, 2, 120),
    ['acadbench', 560, 800], ['acadbench', 840, 800], ['planter', 480, 720], ['planter', 920, 720],
    ['pot', 420, 700], ['pot', 980, 700],
    // T407: Kedai Cendekiawan Akademi (pindah ke luar pagar)
    ['benchWood', 190, 806], ['barrel', 222, 806], ['sign', 250, 806, { text: 'Kedai Buku & Teh' }],
    ['sign', 760, 900, { text: 'AKADEMI CAHAYA\nDidirikan oleh para penyintas Aurel. Ilmu adalah lentera.' }]],
  walls: [[0, 0, 1400, 40], [0, 0, 40, 1000], [1360, 0, 40, 1000], [0, 960, 660, 40], [740, 960, 660, 40],
    [655, 630, 24, 12], [721, 630, 24, 12]], /* pilar gerbang Akademi */
  border: { top: 40, bottom: 960, left: 40, right: 1360, gap: [660, 740], types: ['treeA', 'treeB', 'pine'] },
  exits: [{ x: 660, y: 988, w: 80, h: 12, to: 'kpasar', tx: 800, ty: 60, dir: 'down', label: 'Distrik Pasar' }],
  doors: [[700, 380, { to: 'arsip' }], [1214, 562, 'Rumah kaca Akademi. Bibit langka & tanaman obat tumbuh hangat di balik kaca.'], [243, 380, 'Asrama murid. "Hanya murid Akademi."'], [303, 380, 'Asrama murid, sayap timur. Terdengar murid berlatih membaca mantra.'], [1097, 380, 'Asrama murid, sayap timur. Bau roti panggang dari dapur bersama.'], [1157, 380, 'Asrama guru. Pintu kamar paling ujung. Ada papan nama: "L." Sisanya sudah pudar.']],
  npcs: citizens([['ka1', 'girl', 'Murid Akademi', 600, 700, 'murid'], ['ka2', 'child', 'Murid Muda', 1000, 540, 'murid'], ['ka3', 'woman', 'Murid Akademi', 1000, 700, 'murid'], ['ka4', 'elder', 'Guru Tua', 360, 580, 'murid', 0], ['ka5', 'guard', 'Penjaga Akademi', 640, 700, 'penjaga', 0]]),
  trees: { n: 40, min: 30, types: [['bushP', .4], ['bushG1', .3], ['treeA', .15], ['rock', .15]] },
};

MAPS.kbawah = {
  id: 'kbawah', customGround: 'gnd_kbawah_custom', name: 'Kota Bawah', w: 1200, h: 1000, bgm: 'town', ground: 'village', crowd: 8,
  paths: [[1200, 500, 200, 500, 14], [400, 500, 400, 345, 10], [700, 500, 700, 880, 10], [950, 500, 950, 160, 10], [200, 500, 200, 860, 10], [530, 500, 530, 710, 10], [530, 710, 700, 710, 10]],
  discs: [[560, 640, 80], [700, 700, 50], [950, 260, 40], [200, 760, 40]],
  objs: [...houseRow(160, 330, 3, 118, ['houseB', 'houseC']), ...houseRow(560, 330, 3, 118, ['houseC', 'houseB']), ...houseRow(300, 800, 3, 118, ['houseC', 'houseB']), ...houseRow(820, 800, 3, 118, ['houseB', 'houseC']),
    ['pot', 580, 640], ['barrel', 500, 610], ['barrel', 600, 612], ['crate', 490, 680], ['bench', 620, 660], ['lamp', 480, 560], ['lamp', 1080, 560],
    ['crate', 1060, 440], ['barrel', 1100, 446], ['barrelNew', 1080, 470],
    ['crate', 260, 600], ['crate', 240, 620], ['hay', 300, 680], ['hay', 260, 720],
    ['streetdrum', 680, 650], ['barrel', 740, 710], ['crate', 750, 690],
    ['barrel', 380, 380], ['crate', 420, 380], ['woodpile', 720, 380], ['barrel', 930, 220],
    // T407: Kedai & Shrine Kota Bawah (di area pelataran bebas jalur)
    ['benchWood', 590, 670], ['barrel', 615, 672], ['sign', 565, 670, { text: 'Kedai Buruh' }],
    ['shrine', 760, 700], // Shrine pelindung distrik bawah
    ['sign', 640, 560, { text: 'DAPUR UMUM\nMakan gratis untuk yang butuh. — L.' }]],
  walls: [[0, 0, 1200, 40], [0, 0, 40, 1000], [1160, 0, 40, 470], [1160, 530, 40, 470], [0, 960, 1200, 40]],
  border: { top: 40, bottom: 960, left: 40, right: 1160, gapR: [470, 530], types: ['treeAd', 'treeBd'] },
  exits: [{ x: 1188, y: 470, w: 12, h: 60, to: 'kpasar', tx: 60, ty: 620, dir: 'right', label: 'Distrik Pasar' }],
  doors: [[160, 330, 'Rumah petak. Terdengar batuk dari dalam.'], [560, 330, 'Rumah petak kosong. Pemiliknya pindah ke Lembah Besi... lalu kembali lagi.']],
  npcs: [{ id: 'lestari', ch: 'lestari', name: 'Guru Lestari', x: 560, y: 600, dir: 'down' },
    { id: 'arena_master', ch: 'guard', name: 'Pengawas Gelanggang', x: 700, y: 700, dir: 'down' },
    { id: 'night_merchant', ch: 'merchant', name: 'Pedagang Pasar Malam', x: 500, y: 640, dir: 'down' },
    ...citizens([['kb1', 'child', 'Anak Kota Bawah', 650, 680, 'bawah'], ['kb2', 'farmer', 'Mantan Penambang', 300, 560, 'bawah'], ['kb3', 'woman', 'Ibu Kota Bawah', 900, 560, 'bawah'], ['kb4', 'child', 'Anak Kota Bawah', 450, 700, 'bawah']])],
  animals: [['cat', 700, 600, 0], ['cat', 380, 520, 1]],
  trees: { n: 20, min: 30, types: [['bushG1', .5], ['rock', .5]] },
};
