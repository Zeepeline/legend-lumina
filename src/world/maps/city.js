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
  id: 'road', name: 'Jalan Raya Lama', w: 900, h: 2000, scale: 3.4, bgm: 'field', ground: 'meadow',
  paths: [[450, 2000, 450, 1500, 16], [450, 1500, 360, 1100, 16], [360, 1100, 520, 700, 16], [520, 700, 450, 300, 16], [450, 300, 450, 0, 16]],
  discs: [[400, 1260, 70], [470, 520, 60]],
  objs: [['stele', 500, 1720, { lore: 'batu_mil' }], ['stele', 560, 660, { text: 'Batu penanda jalan, aksaranya kuno: "AUREL — 40 langkah kuda".\nKota yang namanya tertulis di sini sudah lama tak ada.' }],
    ['rock', 300, 900], ['rock', 312, 930], ['stump', 600, 820], ['log', 620, 1600],
    ['crate', 360, 1240], ['crate', 330, 1210], ['barrel', 430, 1290], ['barrel', 450, 1294], ['hay', 340, 1290], ['coffeekettle', 330, 1250], ['coffeeshrub', 260, 840], ['coffeeshrub', 640, 1500], ['sign', 470, 1210, { text: 'Pos Istirahat Kafilah\nKota Lumina: setengah hari ke utara.' }]],
  walls: [[0, 0, 410, 40], [490, 0, 410, 40], [0, 0, 40, 2000], [860, 0, 40, 2000], [0, 1960, 410, 40], [490, 1960, 410, 40]],
  border: { top: 40, bottom: 1960, left: 40, right: 860, gap: [410, 490], gapT: [410, 490], types: ['treeA', 'treeB', 'pine'] },
  exits: [{ x: 410, y: 1988, w: 80, h: 12, to: 'lake', tx: 820, ty: 70, dir: 'down', label: 'Danau Cermin' },
    { x: 410, y: 0, w: 80, h: 12, to: 'kgate', tx: 600, ty: 860, dir: 'up', label: 'Kota Lumina' }],
  npcs: [{ id: 'kafilah', ch: 'darma', name: 'Kusir Kafilah', x: 410, y: 1250, dir: 'down' }],
  enemies: [['wolf', 300, 1700], ['wolf', 600, 1620], ['boar', 560, 1420], ['boar', 280, 1050], ['wolf', 640, 980], ['bee', 300, 760], ['bee', 640, 600], ['boar', 360, 420], ['wolf', 560, 300]],
  trees: { n: 900, min: 28, types: [['treeA', .4], ['treeB', .3], ['pine', .15], ['rock', .15]] },
};

MAPS.kgate = {
  id: 'kgate', name: 'Gerbang Kota Lumina', w: 1200, h: 900, bgm: 'town', ground: 'village', glow: [600, 360, 600],
  paths: [[600, 900, 600, 0, 34], [600, 640, 300, 640, 12], [600, 640, 900, 640, 12]],
  discs: [[600, 300, 120], [300, 640, 50], [900, 640, 50]],
  ponds: [[300, 470, 210, 70], [900, 470, 210, 70]],
  objs: [['gatehouse', 600, 404], ...[[60, 404], [192, 404], [324, 404], [876, 404], [1008, 404], [1140, 404]].map(([x, y]) => ['cwall', x, y]),
    ...lampRow(560, 560, 2, 80), ...lampRow(560, 720, 2, 80), ...lampRow(540, 250, 3, 60),
    ['sign', 680, 600, { text: 'KOTA LUMINA — Kota Seribu Lentera\n↑ Masuk lewat gerbang di utara → Distrik Pasar.' }], ['bounty_board', 720, 600], ['crate', 260, 620], ['crate', 282, 616], ['barrel', 330, 630], ['crate', 880, 620], ['barrel', 930, 626],
    ['houseB', 200, 230], ['houseC', 1000, 230], ['planter', 470, 300], ['planter', 730, 300],
    ['pigeons', 680, 520], ['pigeons', 420, 680],
    ['archerytarget', 340, 720]],
  walls: [[0, 0, 540, 40], [660, 0, 540, 40], [0, 0, 40, 900], [1160, 0, 40, 900], [0, 860, 560, 40], [640, 860, 560, 40], [0, 380, 564, 26], [636, 380, 564, 26]],
  border: { top: 40, bottom: 860, left: 40, right: 1160, gap: [560, 640], gapT: [540, 660], types: ['treeA', 'treeB'] },
  exits: [{ x: 560, y: 888, w: 80, h: 12, to: 'road', tx: 450, ty: 60, dir: 'down', label: 'Jalan Raya Lama' },
    { x: 540, y: 0, w: 120, h: 12, to: 'kpasar', tx: 800, ty: 1150, dir: 'up', label: 'Distrik Pasar' }],
  npcs: citizens([['gj1', 'guard', 'Penjaga Gerbang', 540, 450, 'gerbang', 0], ['gj2', 'guard', 'Penjaga Gerbang', 660, 450, 'gerbang', 0], ['gw1', 'woman', 'Pelancong', 300, 700, 'warga'], ['gw2', 'farmer', 'Petani', 900, 700, 'warga']]),
  trees: { n: 160, min: 30, types: [['treeA', .5], ['bushG1', .3], ['rock', .2]] },
};

MAPS.kpasar = {
  id: 'kpasar', name: 'Distrik Pasar', w: 1600, h: 1200, bgm: 'town', ground: 'village', glow: [800, 600, 900],
  paths: [[800, 1200, 800, 0, 34], [0, 620, 1600, 620, 30], [400, 360, 1200, 360, 18], [400, 900, 1200, 900, 18], [400, 360, 400, 900, 18], [1200, 360, 1200, 900, 18]],
  discs: [[800, 620, 170], [400, 900, 40], [1200, 360, 40]],
  objs: [['fountain', 800, 640, { ok: 'air mancur di tengah alun-alun pasar' }], ...[[640, 500], [960, 500], [640, 790], [960, 790]].map(([x, y]) => ['market', x, y]),
    ...lampRow(480, 560, 2, 640), ...lampRow(480, 700, 2, 640), ...lampRow(700, 430, 3, 100), ...lampRow(700, 850, 3, 100), ...lampRow(200, 580, 3, 120), ...lampRow(1160, 580, 3, 120),
    ...houseRow(180, 300, 2), ...houseRow(1300, 300, 2), ...houseRow(180, 1100, 2), ...houseRow(1300, 1100, 2), ['houseC', 560, 300], ['houseA', 1040, 300], ['houseB', 560, 1100], ['houseC', 1040, 1100],
    ['bench', 720, 720], ['bench', 880, 720], ['planter', 690, 560], ['planter', 910, 560], ['barrel', 520, 840], ['crate', 1080, 840],
    ['ringbooth', 720, 480],
    ['sign', 860, 1120, { text: 'DISTRIK PASAR\nUtara: Distrik Akademi · Barat: Kota Bawah · Timur: Balai Dewan' }],
    ['sign', 1540, 680, { text: 'BALAI DEWAN KOTA\nTertutup untuk umum. Urusan dewan saja.' }], ['sign', 610, 330, { text: 'Penginapan "Seribu Lentera"' }]],
  walls: [[0, 0, 760, 40], [840, 0, 760, 40], [0, 0, 40, 590], [0, 650, 40, 550], [1560, 0, 40, 1200], [0, 1160, 760, 40], [840, 1160, 760, 40]],
  border: { top: 40, bottom: 1160, left: 40, right: 1560, gap: [760, 840], gapT: [760, 840], gapL: [590, 650], types: ['treeAd', 'treeBd'] },
  exits: [{ x: 760, y: 1188, w: 80, h: 12, to: 'kgate', tx: 600, ty: 60, dir: 'down', label: 'Gerbang Kota' },
    { x: 760, y: 0, w: 80, h: 12, to: 'kakademi', tx: 700, ty: 960, dir: 'up', label: 'Distrik Akademi' },
    { x: 0, y: 590, w: 12, h: 60, to: 'kbawah', tx: 1150, ty: 500, dir: 'left', label: 'Kota Bawah' }],
  doors: [[560, 300, { to: 'kinn' }], [180, 300, 'Rumah penjahit. Pintunya terkunci.'], [1300, 300, 'Kantor Serikat Dagang cabang Kota Lumina. Penjaganya menatapmu tajam.'], [1040, 300, 'Toko buku. "Tutup sampai ujian Akademi selesai."']],
  npcs: [{ id: 'kmerchant', ch: 'merchant', name: 'Pedagang Pasar', x: 640, y: 530, dir: 'down' }, { id: 'rudi', ch: 'child', name: 'Rudi', x: 980, y: 700, dir: 'left', wander: 20 },
    ...citizens([['kp1', 'woman', 'Warga', 700, 760, 'warga'], ['kp2', 'farmer', 'Warga', 900, 470, 'warga'], ['kp3', 'merchant', 'Pedagang', 960, 530, 'pedagang', 0], ['kp4', 'girl', 'Gadis Kota', 520, 660, 'warga'],
      ['kp5', 'smith', 'Kuli Angkut', 1100, 880, 'pedagang'], ['kp6', 'joko', 'Pedagang Rempah', 640, 820, 'pedagang', 0], ['kp7', 'woman', 'Warga', 300, 640, 'warga'], ['kp8', 'guard', 'Penjaga Kota', 1480, 640, 'penjaga', 0]])],
  animals: [['cat', 760, 760, 0], ['cat', 1150, 520, 1]],
  trees: { n: 120, min: 30, types: [['treeA', .4], ['bushG1', .4], ['planter', .2]] },
};

MAPS.kakademi = {
  id: 'kakademi', name: 'Distrik Akademi', w: 1400, h: 1000, bgm: 'town', ground: 'village', glow: [700, 500, 700],
  paths: [[700, 1000, 700, 380, 30], [300, 640, 1100, 640, 16], [300, 640, 300, 420, 12], [1100, 640, 1100, 420, 12]],
  discs: [[700, 520, 150], [300, 380, 70], [1100, 380, 70]],
  objs: [['academy', 700, 380], ['shrine', 700, 600], ...lampRow(560, 440, 4, 94), ...lampRow(600, 760, 3, 100), ...lampRow(240, 660, 2, 120), ...lampRow(1040, 660, 2, 120),
    ['bench', 580, 620], ['bench', 820, 620], ['planter', 520, 520], ['planter', 880, 520], ['planter', 520, 700], ['planter', 880, 700],
    ['pot', 460, 690], ['pot', 940, 690],
    ['dummy', 250, 700], ['dummy', 1150, 700],
    ['telescope', 630, 480],
    ['clockworktower', 340, 480],
    ['houseA', 300, 380], ['houseC', 1100, 380], ['sign', 760, 900, { text: 'AKADEMI CAHAYA\nDidirikan oleh para penyintas Aurel. Ilmu adalah lentera.' }]],
  walls: [[0, 0, 1400, 40], [0, 0, 40, 1000], [1360, 0, 40, 1000], [0, 960, 660, 40], [740, 960, 660, 40]],
  border: { top: 40, bottom: 960, left: 40, right: 1360, gap: [660, 740], types: ['treeA', 'treeB', 'pine'] },
  exits: [{ x: 660, y: 988, w: 80, h: 12, to: 'kpasar', tx: 800, ty: 60, dir: 'down', label: 'Distrik Pasar' }],
  doors: [[700, 380, { to: 'arsip' }], [300, 380, 'Asrama murid. "Hanya murid Akademi."'], [1100, 380, 'Rumah guru. Ada papan nama: "L." Sisanya sudah pudar.']],
  npcs: citizens([['ka1', 'girl', 'Murid Akademi', 600, 700, 'murid'], ['ka2', 'child', 'Murid Muda', 820, 560, 'murid'], ['ka3', 'woman', 'Murid Akademi', 1000, 700, 'murid'], ['ka4', 'elder', 'Guru Tua', 400, 640, 'murid', 0], ['ka5', 'guard', 'Penjaga Akademi', 650, 470, 'penjaga', 0]]),
  trees: { n: 260, min: 30, types: [['treeA', .5], ['bushP', .2], ['bushG1', .3]] },
};

MAPS.kbawah = {
  id: 'kbawah', name: 'Kota Bawah', w: 1200, h: 1000, bgm: 'town', ground: 'village',
  paths: [[1200, 500, 200, 500, 18], [400, 500, 400, 345, 12], [700, 500, 700, 880, 12], [950, 500, 950, 160, 12], [200, 500, 200, 860, 12]],
  discs: [[560, 640, 80]],
  objs: [...houseRow(160, 330, 3, 118, ['houseB', 'houseC']), ...houseRow(560, 330, 3, 118, ['houseC', 'houseB']), ...houseRow(300, 800, 3, 118, ['houseC', 'houseB']), ...houseRow(820, 800, 3, 118, ['houseB', 'houseC']),
    ['pot', 560, 640], ['barrel', 520, 610], ['barrel', 600, 612], ['crate', 500, 680], ['bench', 620, 690], ['lamp', 480, 560], ['lamp', 1080, 560],
    ['crate', 1060, 440], ['barrel', 1100, 446], ['crate', 260, 600], ['hay', 300, 680], ['streetdrum', 680, 680], ['sign', 640, 560, { text: 'DAPUR UMUM\nMakan gratis untuk yang butuh. — L.' }]],
  walls: [[0, 0, 1200, 40], [0, 0, 40, 1000], [1160, 0, 40, 470], [1160, 530, 40, 470], [0, 960, 1200, 40]],
  border: { top: 40, bottom: 960, left: 40, right: 1160, gapR: [470, 530], types: ['treeAd', 'treeBd'] },
  exits: [{ x: 1188, y: 470, w: 12, h: 60, to: 'kpasar', tx: 60, ty: 620, dir: 'right', label: 'Distrik Pasar' }],
  doors: [[160, 330, 'Rumah petak. Terdengar batuk dari dalam.'], [560, 330, 'Rumah petak kosong. Pemiliknya pindah ke Lembah Besi... lalu kembali lagi.']],
  npcs: [{ id: 'lestari', ch: 'lestari', name: 'Guru Lestari', x: 560, y: 600, dir: 'down' },
    { id: 'arena_master', ch: 'guard', name: 'Pengawas Gelanggang', x: 700, y: 700, dir: 'down' },
    ...citizens([['kb1', 'child', 'Anak Kota Bawah', 650, 680, 'bawah'], ['kb2', 'farmer', 'Mantan Penambang', 300, 560, 'bawah'], ['kb3', 'woman', 'Ibu Kota Bawah', 900, 560, 'bawah'], ['kb4', 'child', 'Anak Kota Bawah', 450, 700, 'bawah']])],
  animals: [['cat', 700, 600, 0], ['cat', 380, 520, 1]],
  trees: { n: 80, min: 30, types: [['bushG1', .5], ['rock', .5]] },
};
