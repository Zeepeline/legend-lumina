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
  bayaran: ['Pedang disewa per hari, per musim, atau per perang.', 'Dewan bayar tepat waktu. Serikat Dagang... kadang.', 'Mau kerja? Tunjukkan dulu cara kau memegang pedang.'],
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
    { x: 410, y: 0, w: 80, h: 12, to: 'kgate', tx: 1300, ty: 860, dir: 'up', label: 'Kota Lumina' }],
  npcs: [{ id: 'kafilah', ch: 'darma', name: 'Kusir Kafilah', x: 410, y: 1250, dir: 'down' }],
  enemies: [['wolf', 300, 1700], ['wolf', 600, 1620], ['boar', 560, 1420], ['boar', 280, 1050], ['wolf', 640, 960], ['bee', 300, 760], ['bee', 640, 600], ['boar', 360, 420], ['wolf', 560, 300],
    ['goblin_elite', 700, 1060], ['goblin_shaman', 775, 1120],
    ['goblin_archer', 590, 1040], ['goblin_archer', 805, 1040],
    ['goblin', 650, 1150], ['goblin', 745, 1150]],
  trees: { n: 900, min: 28, types: [['treeA', .4], ['treeB', .3], ['pine', .15], ['rock', .15]] },
};

MAPS.kgate = {
  // Peta dilebarkan 700 px ke barat (v1.88.0) untuk GARNISUN KOTA; isi lama digeser +700 sehingga gapura tetap di titik benua yang sama.
  id: 'kgate', customGround: 'gnd_kgate_custom', name: 'Gerbang Kota Lumina', w: 1900, h: 900, bgm: 'town', ground: 'village', pathType: 'paving', glow: [1300, 360, 600], crowd: 6,
  paths: [[1300, 900, 1300, 0, 48], [1300, 640, 1000, 640, 12], [1300, 640, 1600, 640, 12], /* jalan utama menembus gapura sampai Distrik Pasar */
    [1000, 640, 514, 636, 14], /* Pos Sayap Barat → gerbang Garnisun */
    // GARNISUN: jalan lingkar (segi delapan, pusat 380,500, jari-jari 190) + jalan ke pintu tiap bangunan
    [570, 500, 514, 634, 18], [514, 634, 380, 690, 18], [380, 690, 246, 634, 18], [246, 634, 190, 500, 18],
    [190, 500, 246, 366, 18], [246, 366, 380, 310, 18], [380, 310, 514, 366, 18], [514, 366, 570, 500, 18],
    [380, 226, 380, 310, 22], [160, 348, 246, 366, 16], [645, 348, 514, 366, 16], 
    [566, 206, 500, 206, 18], [500, 206, 500, 352, 16]], /* ubin dari pintu Kandang Kuda (kanan atas, pintu di sisi kiri) ke jalan lingkar */
  discs: [[1300, 460, 80], [1000, 640, 50], [1600, 640, 50], [380, 312, 30], /* + lantai ubin di bawah Kandang Kuda */
    [548, 186, 26], [592, 180, 34], [640, 176, 36], [686, 182, 26], [608, 140, 34], [656, 136, 40], [650, 100, 30], /* + lantai ubin di bawah Markas, Barak & Barak Prajurit */
    [296, 212, 24], [330, 212, 24], [363, 212, 24], [397, 212, 24], [430, 212, 24], [464, 212, 24],
    [300, 190, 26], [340, 190, 26], [380, 190, 26], [420, 190, 26], [460, 190, 26],
    [70, 332, 24], [102, 332, 24], [134, 332, 24], [166, 332, 24], [198, 332, 24], [230, 332, 24],
    [76, 310, 26], [113, 310, 26], [150, 310, 26], [187, 310, 26], [224, 310, 26],
    [530, 332, 24], [563, 332, 24], [596, 332, 24], [628, 332, 24], [661, 332, 24], [694, 332, 24],
    [536, 310, 26], [574, 310, 26], [612, 310, 26], [650, 310, 26], [688, 310, 26]],
  calm: [[380, 500, 330], [612, 150, 120]], /* lapangan & lingkar Garnisun bebas pohon/batu acak */
  ponds: [[910, 790, 140, 60], [1690, 790, 140, 60]], /* kolam utuh di dalam peta (dulu terpotong tepi peta) */
  objs: [
    ['gatehouse', 1300, 442], /* gapura menjorok ke depan garis tembok */
    ['citywallL', 965, 424], ['citywallR', 1634, 424], /* tembok kota (gambar pemilik): x 721–1209 & 1391–1877, ujungnya masuk 8 px di belakang sayap gapura */
    ['gpt_city_lamp', 1230, 486], ['gpt_city_lamp', 1370, 486],
    ['gpt_city_banner_sm', 1200, 486], ['gpt_city_banner_sm', 1400, 486],
    ['gpt_city_banner', 1266, 340], ['gpt_city_banner', 1334, 340],
    ['gpt_city_fence', 1210, 840], ['gpt_city_fence', 1410, 840],
    ['gpt_city_rock_lg', 1470, 600], ['gpt_city_rock_sm', 1500, 615],
    ['gpt_city_flower_w', 1255, 660], ['gpt_city_flower_p', 1345, 660],
    ['sign', 1250, 660, { text: 'PERSIMPANGAN GERBANG\n↑ Distrik Pasar · ↓ Jalan Raya Lama · ← Garnisun Kota · → Sayap Timur' }],
    ['sign', 1370, 840, { text: 'SELAMAT DATANG DI KOTA LUMINA\nKota Seribu Lentera\n↑ Masuk gerbang utama menuju Distrik Pasar' }],
    ['sign', 1380, 600, { text: 'KOTA LUMINA — Kota Seribu Lentera\n↑ Masuk lewat gerbang di utara → Distrik Pasar.' }],
    ['bounty_board', 1420, 600],
    ['crate', 1580, 620], ['barrel', 1630, 626],
    ['barakBayaran', 1000, 628], ['sign', 1072, 640, { text: 'BARAK TENTARA BAYARAN\nPasukan sewaan Kota Lumina. Siap dikontrak.' }],
    ['crate', 1110, 656], ['crate', 1132, 652], ['barrel', 1160, 662],
    ['planter', 1170, 490], ['planter', 1430, 490],
    ['pigeons', 1380, 520], ['pigeons', 1120, 680],
    // GARNISUN KOTA (gambar pemilik) — di barat gapura, sebelah ujung tembok kota. Bangunan MELINGKARI lapangan latihan:
    // Markas Pengawal (utara), Kandang Kuda (pojok kanan atas, pintu menghadap ke dalam), Barak (barat laut), Barak Prajurit (timur laut); pintu masuk di tenggara.
    ['garhall', 380, 222], ['garbarracks', 150, 342], ['garbarracks2', 612, 342], ['garstable', 612, 190],
    ['garpen', 380, 540], ['gardummy', 285, 470], ['gardummy', 475, 470], ['garbag', 272, 590], ['garshields', 488, 592],
    ['gartarget', 320, 650], ['gartarget2', 380, 650], ['gartarget3', 440, 650],
    ['garsupply', 150, 180], ['garrack', 640, 700], ['garhayrack', 170, 810], ['garbarricade', 610, 812], ['garrack', 90, 480],
    ['gpt_city_lamp', 236, 316], ['gpt_city_lamp', 524, 316], ['gpt_city_lamp', 236, 700], ['gpt_city_lamp', 600, 610],
    ['sign', 650, 610, { text: 'GARNISUN KOTA LUMINA\nMarkas Pengawal · Barak · Lapangan Latihan · Kandang Kuda' }]
  ],
  walls: [
    [0, 0, 1240, 40], [1360, 0, 540, 40],
    [0, 0, 40, 900], [1860, 0, 40, 900],
    [0, 860, 1260, 40], [1340, 860, 560, 40],
    [700, 380, 560, 44], [1340, 380, 560, 44]
  ],
  border: { top: 40, bottom: 860, left: 40, right: 1860, gap: [1260, 1340], gapT: [1240, 1360], types: ['treeA', 'treeB'] },
  doors: [[1000, 628, 'Barak Tentara Bayaran. Pintunya dijaga: "Kontrak hanya untuk pemegang izin Dewan."']],
  exits: [
    { x: 1260, y: 888, w: 80, h: 12, to: 'road', tx: 450, ty: 60, dir: 'down', label: 'Jalan Raya Lama' },
    { x: 1240, y: 0, w: 120, h: 12, to: 'kpasar', tx: 800, ty: 1150, dir: 'up', label: 'Distrik Pasar' } /* lewat jalan di balik gapura */
  ],
  npcs: citizens([
    ['gj1', 'guard_spear', 'Penjaga Gerbang', 1256, 492, 'gerbang', 0],
    ['gj2', 'guard_spear', 'Penjaga Gerbang', 1344, 492, 'gerbang', 0],
    ['merc1', 'guard_spear', 'Perekrut Tentara Bayaran', 1030, 668, 'bayaran', 0],
    ['courier', 'boy', 'Budi Kurir Kilat', 1080, 720, 'warga', 0],
    ['gw1', 'woman', 'Pelancong', 1000, 700, 'warga'],
    ['gw2', 'farmer', 'Petani', 1600, 700, 'warga'],
    ['gk1', 'guard_spear', 'Kapten Bratasena', 410, 262, 'gerbang', 0], ['gk2', 'guard_spear', 'Prajurit Anggara', 330, 500, 'gerbang'],
    ['gk3', 'guard_spear', 'Pemanah Raka', 380, 590, 'gerbang', 0], ['gk4', 'farmer', 'Pak Sardi si Tukang Kuda', 536, 226, 'warga', 0],
    ['gk5', 'guard_spear', 'Prajurit Tegar', 680, 380, 'gerbang', 0]
  ]),
  trees: { n: 40, min: 30, types: [['treeA', .3], ['bushG1', .4], ['rock', .3]] },
};

MAPS.kpasar = {
  id: 'kpasar', customGround: 'gnd_kpasar_custom', name: 'Distrik Pasar', w: 1600, h: 1200, bgm: 'town', ground: 'village', glow: [800, 600, 900], crowd: 12,
  paths: [[800, 1200, 800, 0, 34], [0, 620, 1600, 620, 30], [400, 360, 1200, 360, 18], [400, 900, 1200, 900, 30], [410, 566, 1190, 566, 26], /* selasar Pasar Raya */ [400, 360, 400, 900, 18], [1200, 360, 1200, 900, 18]],
  discs: [[800, 620, 170], [400, 900, 40], [1200, 360, 40], /* + lantai ubin di bawah kios Pasar Raya */
    ...[470, 530, 590, 1010, 1070, 1130].flatMap(x => [[x, 505, 62], [x, 835, 62]])],
  objs: [['fountain', 800, 640, { ok: 'air mancur di tengah alun-alun pasar' }],
    // PASAR RAYA: deretan kios tenda (gambar pemilik) menghadap selasar pasar; kios lama 'market' tetap di ujung utara/selatan
    ...[[470, 'potion'], [590, 'butcher'], [1010, 'weapon'], [1130, 'scroll']].map(([x, k]) => ['stall_' + k, x, 540]),
    ...[[470, 'food'], [590, 'scroll'], [1010, 'potion'], [1130, 'weapon']].map(([x, k]) => ['stall_' + k, x, 870]),
    ...[[668, 250], [932, 250], [668, 1020], [932, 1020]].map(([x, y]) => ['market', x, y]),
    // Distrik Pasar = niaga saja: deret ruko perkotaan (rumah bertanda gantung) di utara & selatan; rumah warga ada di Distrik Permukiman
    ...[[180, 2], [312, 4], [560, 5], [1040, 3], [1300, 4], [1432, 2]].map(([x, n]) => ['cityHouse' + n, x, 300]),
    ...[[180, 3], [312, 2], [560, 4], [1040, 5], [1300, 3], [1432, 4]].map(([x, n]) => ['cityHouse' + n, x, 1100]),
    ...lampRow(530, 596, 2, 540), ...lampRow(480, 700, 2, 640), ...lampRow(700, 430, 3, 100), ...lampRow(700, 850, 3, 100), ...lampRow(200, 580, 3, 120), ...lampRow(1160, 580, 3, 120),
    ['bench', 720, 720], ['bench', 880, 720],
    ['ringbooth', 620, 720],
    // T406 & T407: Kuil/Shrine & Kedai Pasar
    ['shrine', 800, 470], // Kuil menghadap alun-alun pasar (utara air mancur)
    ['benchWood', 510, 310], ['barrel', 490, 314], ['sign', 530, 320, { text: 'Kedai Seribu Lentera' }],
    ['sign', 860, 1120, { text: 'DISTRIK PASAR\nUtara: Distrik Akademi · Barat: Kota Bawah · Timur: Distrik Permukiman' }],
    ['sign', 1520, 700, { text: 'DISTRIK PERMUKIMAN\n→ Rumah warga Kota Lumina. Pasar berhenti di sini.' }],
      ['sign', 610, 330, { text: 'Penginapan "Seribu Lentera"' }]],
  walls: [[0, 0, 760, 40], [840, 0, 760, 40], [0, 0, 40, 590], [0, 650, 40, 550], [1560, 0, 40, 590], [1560, 650, 40, 550], [0, 1160, 760, 40],
    [840, 1160, 760, 40]],
  border: { top: 40, bottom: 1160, left: 40, right: 1560, gap: [760, 840], gapT: [760, 840], gapL: [590, 650], gapR: [590, 650], types: ['treeAd', 'treeBd'] },
  exits: [{ x: 760, y: 1188, w: 80, h: 12, to: 'kgate', tx: 1300, ty: 60, dir: 'down', label: 'Gerbang Kota' },
    { x: 760, y: 0, w: 80, h: 12, to: 'kakademi', tx: 700, ty: 960, dir: 'up', label: 'Distrik Akademi' },
    { x: 0, y: 590, w: 12, h: 60, to: 'kbawah', tx: 1150, ty: 500, dir: 'left', label: 'Kota Bawah' },
    { x: 1588, y: 590, w: 12, h: 60, to: 'kpermukiman', tx: 60, ty: 500, dir: 'right', label: 'Distrik Permukiman' }],
  doors: [[560, 300, { to: 'kinn' }], [180, 300, 'Rumah penjahit. Pintunya terkunci.'],
    [1300, 300, 'Kantor Serikat Dagang cabang Kota Lumina. Penjaganya menatapmu tajam.'],
    [1040, 300, 'Toko buku. "Tutup sampai ujian Akademi selesai."'],
    [312, 300, 'Toko kain. "Kembali besok, stok sedang dihitung."'], [1432, 300, 'Gudang Serikat Dagang. Peti-peti bersegel menumpuk di balik jendela.'],
    [180, 1100, 'Toko rempah. Aromanya tercium sampai ke jalan, tetapi pintunya terkunci.'], [312, 1100, 'Toko perkakas. "Buka saat lonceng sore."'],
      [560, 1100, 'Kantor pos kota. Tutup sampai kafilah berikutnya tiba.'],
    [1040, 1100, 'Rumah makan. "Penuh! Datang lagi nanti."'], [1300, 1100, 'Toko topi dan jubah. Tirainya tertutup.'],
      [1432, 1100, 'Kantor timbangan pasar. Hanya petugas Serikat yang boleh masuk.']],
  npcs: [{ id: 'kmerchant', ch: 'merchant', name: 'Pedagang Pasar', x: 700, y: 590, dir: 'down' },
    { id: 'auctioneer', ch: 'elder', name: 'Juru Lelang Bastian', x: 740, y: 380, dir: 'down' },
    { id: 'rudi', ch: 'child', name: 'Rudi', x: 980, y: 700, dir: 'left', wander: 20 },
    ...citizens([['kp1', 'woman', 'Warga', 700, 760, 'warga'], ['kp2', 'farmer', 'Warga', 900, 470, 'warga'], ['kp3', 'merchant', 'Pedagang', 940, 590, 'pedagang', 0], ['kp4', 'girl', 'Gadis Kota', 520, 660, 'warga'],
      ['kp5', 'smith', 'Kuli Angkut', 1100, 880, 'pedagang'], ['kp6', 'joko', 'Pedagang Rempah', 660, 910, 'pedagang', 0], ['kp7', 'woman', 'Warga', 300, 640, 'warga'], ['kp8', 'guard', 'Penjaga Kota', 1480, 640, 'penjaga', 0]])],
  animals: [['cat', 760, 760, 0], ['cat', 1150, 520, 1]],
  trees: { n: 30, min: 30, types: [['bushG1', .5], ['planter', .3], ['rock', .2]] },
};

// DISTRIK PERMUKIMAN — rumah warga Kota Lumina (rumah perkotaan pemilik), dipisah dari Distrik Pasar. Masuk dari barat (Distrik Pasar).
// Jalan utama y 500 + alun-alun kecil bersumur & kuil; deret rumah utara (y 390) menghadap jalan utama, deret selatan (y 770) menghadap jalan belakang y 856.
const permRow = (xs, y, order) => xs.map((x, i) => ['cityHouse' + order[i % order.length], x, y]);
const PERM_N = [220, 360, 500, 900, 1040, 1180], PERM_S = [220, 360, 500, 640, 780, 920, 1060, 1200];
MAPS.kpermukiman = {
  id: 'kpermukiman', customGround: 'gnd_kpermukiman_custom', name: 'Distrik Permukiman', w: 1400, h: 1000, bgm: 'town', ground: 'village',
    glow: [700, 500, 700], crowd: 8,
  paths: [[40, 500, 1300, 500, 26], [140, 500, 140, 856, 14], [1300, 500, 1300, 856, 14], [140, 856, 1300, 856, 18], [700, 376, 700, 440, 20],
    ...PERM_N.map(x => [x, 396, x, 506, 12]), ...PERM_S.map(x => [x, 776, x, 862, 12])],
  discs: [[700, 500, 110]],
  objs: [...permRow(PERM_N, 390, [1, 3, 2, 4, 5, 3]), ...permRow(PERM_S, 770, [4, 2, 5, 1, 3, 4, 2, 5]),
    ['well', 700, 520, { ok: 'sumur warga di tengah alun-alun permukiman' }], ['balaiDewan', 700, 372], ['shrine', 700, 632],
    ['sign', 636, 384, { text: 'BALAI DEWAN KOTA\nKantor pemerintahan Kota Lumina.\nPenerimaan warga: hari pasar.' }], ['bench', 620, 560], ['bench', 780, 560],
    ['benchWood', 880, 580], ['barrel', 905, 584], ['sign', 930, 580, { text: 'Kedai Warga' }],
    ...lampRow(240, 470, 6, 190), ...lampRow(240, 890, 6, 190),
    ['planter', 300, 540], ['planter', 560, 540], ['planter', 840, 540], ['planter', 1100, 540], ['pot', 430, 560], ['pot', 1000, 560],
    ['bushP', 560, 650], ['bushG1', 840, 660], ['bushP', 300, 640], ['bushG1', 1120, 650],
    ['sign', 90, 450, { text: 'DISTRIK PERMUKIMAN\nRumah warga Kota Lumina\n← Distrik Pasar' }],
    ['sign', 1320, 540, { text: 'Jalan buntu. Tembok kota di timur sedang diperbaiki.' }]],
  walls: [[0, 0, 1400, 40], [0, 0, 40, 470], [0, 530, 40, 470], [1360, 0, 40, 1000], [0, 960, 1400, 40]],
  border: { top: 40, bottom: 960, left: 40, right: 1360, gapL: [470, 530], types: ['treeAd', 'treeBd'] },
  exits: [{ x: 0, y: 470, w: 12, h: 60, to: 'kpasar', tx: 1500, ty: 620, dir: 'left', label: 'Distrik Pasar' }],
  doors: [[700, 372, 'Balai Dewan Kota. "Urusan izin dan pajak dilayani pada hari pasar. Silakan datang kembali."'],
    ...PERM_N.map(x => [x, 390, 'Rumah warga. Terdengar orang bercakap di dalam.']),
    ...PERM_S.map(x => [x, 770, 'Rumah warga. Tirai jendelanya tertutup rapat.'])],
  npcs: citizens([['kr1', 'woman', 'Warga', 420, 540, 'warga'], ['kr2', 'child', 'Anak Kota', 760, 600, 'warga'],
    ['kr3', 'farmer', 'Warga', 1000, 540, 'warga'],
    ['kr4', 'elder', 'Kakek Warga', 300, 900, 'warga'], ['kr5', 'girl', 'Gadis Kota', 900, 890, 'warga'],
      ['kr6', 'guard', 'Penjaga Kota', 160, 540, 'penjaga', 0]]),
  animals: [['cat', 600, 600, 0], ['cat', 1100, 620, 1]],
  trees: { n: 24, min: 30, types: [['bushG1', .4], ['bushP', .3], ['planter', .2], ['rock', .1]] },
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
  /* jalan utama + jalan setapak berubin ke pintu tiap rumah (deret atas turun ke jalan utama, deret bawah lewat selasar depan) */
  paths: [[1200, 500, 200, 500, 14], [700, 500, 700, 880, 10], [950, 500, 950, 160, 10], [200, 500, 200, 830, 10],
    [530, 500, 530, 710, 10], [530, 710, 700, 710, 10],
    ...[160, 278, 396, 560, 678, 796].map(x => [x, 336, x, 506, 13]), [200, 812, 1066, 812, 12]], /* selasar menempel kaki rumah deret bawah */
  discs: [[560, 640, 80], [700, 700, 50]],
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
