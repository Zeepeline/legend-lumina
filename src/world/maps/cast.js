'use strict';
// PEMERAN KOTA & DESA — NPC tambahan yang mengisi bangunan & ruang publik (kios, sumur, kuil, balai, akademi, garnisun, penginapan).
// Peran & kegiatan: npc/life_roles.js · rencana: npc/life_plan.js · interaksi antar-NPC: npc/life_duos.js.
// Sprite saat ini = karakter yang sudah ada (pengganti); lembar sprite asli per NPC: docs/NPC_ROSTER.md + npc/life_sheet.js.
// Baris: [id, ch, nama, x, y, peran, opsi] — opsi: { leash, workR, shout, lines, story }
const CAST_TALK = {
  soldier: ['Latihan pagi, siang, sore. Kapten tak kenal lelah.', 'Kalau serigala mendekati gerbang, kami yang pertama maju.'],
  archer: ['Tarik napas, tahan, lepas. Itu saja rahasianya.', 'Sasaran ketiga itu sudah penuh lubang. Minta ganti ke Kapten.'],
  captain: ['Garnisun Kota Lumina tidak pernah tidur.', 'Kau punya kuda-kuda yang lumayan. Pernah ikut latihan?'],
  stablehand: ['Kuda-kuda ini lebih jujur daripada kebanyakan orang.', 'Jerami harus diganti tiap pagi, kalau tidak mereka ngambek.'],
  merc: ['Bayar di muka, kerja sampai tuntas.', 'Tiga musim di perbatasan, satu bekas luka per musim.'],
  stall: ['Lihat-lihat dulu, belum beli tak apa.', 'Barang di kios ini kupilih sendiri satu per satu.'],
  shopper: ['Aku cuma mau beli roti, tapi lihat semua yang dijual ini...', 'Pasar ini paling ramai menjelang siang.'],
  musician: ['Lagu ini tentang seribu lentera yang menyala bersama.', 'Sekeping koin untuk satu lagu, kalau berkenan.'],
  crier: ['Dengar, dengar! Dewan Kota mengumumkan hari pasar tambahan!', 'Kabar hari ini: jalan selatan rawan, pergilah berombongan.'],
  priest: ['Kuil kecil ini dibangun warga sendiri, batu demi batu.', 'Nyalakan satu lilin bila hatimu sedang berat.'],
  water: ['Sumur ini tak pernah kering, bahkan di musim kemarau.', 'Ember ketiga hari ini. Punggungku...'],
  official: ['Izin dagang? Isi formulir, cap tiga kali, tunggu seminggu.', 'Balai Dewan buka sejak fajar.'],
  teacher: ['Cahaya bukan hanya sihir. Ia juga ingatan dunia.', 'Muridku hari ini lebih banyak melamun.'],
  student: ['Mantra pertama selalu yang paling sulit.', 'Jangan bilang Guru aku tertidur di kelas tadi.'],
  gardener: ['Tanaman obat di rumah kaca butuh kehangatan.', 'Pagar hidup ini kupangkas tiap tiga hari.'],
  astronomer: ['Bintang Penunjuk terbit di atas menara jam.', 'Langit malam menyimpan peta yang lebih tua dari kota ini.'],
  sweeper: ['Kota bersih, hati senang.', 'Daun gugur tak pernah habis.'], lamplighter: ['Seribu lentera, satu orang. Itu aku.', 'Senja adalah jam kerjaku.'],
  patron: ['Sup di sini paling enak se-Lumina.', 'Duduklah, pesan sesuatu!'],
  scholar: ['Arsip ini menyimpan catatan para Penjaga Cahaya.', 'Ssst, ini ruang baca.'],
  drummer: ['Dum-dum-tak! Ritme ini dari kampung ibuku.', 'Anak-anak suka menari kalau aku main.'], miller: ['Kincir ini menggiling gandum untuk dua desa.'],
  lightkeeper: ['Mercusuar ini menuntun perahu pulang saat kabut.', 'Minyak lampu harus diisi tiap senja.'],
  traveler: ['Perjalanan masih jauh. Api ini teman terbaik.', 'Dari mana asalmu, anak muda?'], courier: ['Paket, surat, kabar! Kurir tercepat di Lumina.'],
};
const CAST = {
  kgate: [
    ['gk6', 'guard_spear', 'Prajurit Dimas', 470, 520, 'soldier'], ['gk7', 'guard', 'Prajurit Sekar', 262, 520, 'soldier'],
    ['gk8', 'wati', 'Pemanah Laras', 440, 714, 'archer'], ['gk9', 'hunter', 'Tentara Bayaran Rangga', 960, 690, 'merc'],
    ['gk10', 'nila', 'Tentara Bayaran Wulan', 1100, 700, 'merc'],
  ],
  kpasar: [
    ['st1', 'hermit', 'Nenek Saga', 470, 562, 'stall', { shout: ['Ramuan segar, baru diseduh!', 'Penawar racun di sini!'] }],
    ['st2', 'smith', 'Pak Darto', 590, 562, 'stall', { shout: ['Daging segar! Roti hangat!', 'Ayam panggang, tinggal dua!'] }],
    ['st3', 'hunter', 'Gilang', 1010, 562, 'stall', { shout: ['Pedang tajam, tombak kuat!', 'Coba dulu genggamannya!'] }],
    ['st4', 'elder', 'Ki Arsa', 1130, 562, 'stall', { shout: ['Peta, gulungan, tinta!', 'Jimat kepulangan, laris manis!'] }],
    ['st5', 'woman', 'Bu Ratna', 470, 892, 'stall', { shout: ['Teh, madu, keju!', 'Bekal perjalanan, murah!'] }],
    ['st6', 'darma', 'Arsa Muda', 590, 892, 'stall', { shout: ['Gulungan kakek, harga cucu!', 'Pewarna kain, empat warna!'] }],
    ['st7', 'lestari', 'Laras', 1010, 892, 'stall', { shout: ['Ramuan resep Nenek Saga!', 'Eliksir, sekali teguk!'] }],
    ['st8', 'guard', 'Bimo', 1130, 892, 'stall', { shout: ['Zirah besi, tahan lama!', 'Busur pemburu ada!'] }],
    ['ps1', 'mom', 'Nyonya Melati', 840, 600, 'shopper'], ['ps2', 'farmer', 'Pak Harun', 760, 820, 'shopper'],
    ['ps3', 'inn', 'Kirana si Pemetik Kecapi', 760, 690, 'musician'], ['ps4', 'gun', 'Mang Ujang', 800, 800, 'sweeper'],
    ['ps5', 'joko', 'Pak Lentera', 620, 640, 'lamplighter'], ['ps6', 'priest', 'Romo Anom', 846, 500, 'priest'],
    ['ps7', 'child', 'Tole si Kurir Pasar', 980, 640, 'courier'],
  ],
  kpermukiman: [
    ['pm1', 'merchant', 'Juru Warta Bram', 760, 430, 'crier'], ['pm2', 'elder', 'Pak Wiryo', 650, 420, 'official'],
    ['pm3', 'woman', 'Bu Sumi', 740, 560, 'water'], ['pm4', 'priest', 'Romo Gita', 650, 660, 'priest'],
    ['pm5', 'mom', 'Bu Ani', 520, 520, 'citizen'], ['pm6', 'lestari', 'Bu Tini', 560, 530, 'citizen'],
    ['pm7', 'farmer', 'Pak Damar', 900, 520, 'lamplighter'],
  ],
  kakademi: [
    ['ac1', 'lestari', 'Guru Wening', 592, 660, 'teacher'], ['ac2', 'girl', 'Murid Tara', 560, 690, 'student'],
    ['ac3', 'child', 'Murid Bagas', 630, 700, 'student'], ['ac4', 'mila', 'Murid Sinta', 600, 722, 'student'],
    ['ac5', 'farmer', 'Pak Taman', 1150, 600, 'gardener'], ['ac6', 'witch', 'Ahli Bintang Orion', 700, 520, 'astronomer'],
    ['ac7', 'guard', 'Kadet Wira', 270, 580, 'soldier'], ['ac8', 'wati', 'Kadet Nara', 455, 580, 'archer'],
    ['ac9', 'gun', 'Pak Sapu', 700, 600, 'sweeper'],
  ],
  kbawah: [
    ['bw1', 'child', 'Kiko si Penabuh', 720, 676, 'drummer'], ['bw2', 'ratih', 'Pengamen Seruling', 600, 700, 'musician'],
    ['bw3', 'mom', 'Mbok Jum', 500, 560, 'sweeper'],
  ],
  village: [['vl1', 'lestari', 'Mbak Sari', 470, 400, 'water'], ['vl2', 'darma', 'Pak Obor', 600, 300, 'lamplighter'],
    ['vl3', 'darma', 'Mas Tarno', 560, 440, 'citizen', {
      lines: ['Pagi, Arka. Desa tenang, begini saja sudah syukur.',
        'Habis dari sumur, mau mampir ke kebun Pak Darto.'] }],
    ['vl4', 'ratih', 'Nenek Sumi', 440, 470, 'citizen', {
      lines: ['Sudah makan, Cu? Jangan berangkat dengan perut kosong.',
        'Dulu waktu Nenek muda, desa ini cuma tiga rumah.'] }],
    ['vl5', 'woman', 'Mbak Ningsih', 660, 370, 'citizen', {
      lines: ['Cucianku belum kering, semoga tidak hujan.',
        'Kalau ke sumur pagi-pagi, airnya paling segar.'] }],
    ['kn1', 'guard', 'Kesatria Arvan', 520, 500, 'guard', {
      lines: ['Aku singgah sebentar sebelum kembali bertugas.',
        'Desa setenang ini pantas dijaga baik-baik.'] }]],
  meadow: [['md1', 'farmer', 'Pak Giling', 260, 232, 'miller'], ['md2', 'gun', 'Tole Pemancing', 660, 780, 'fisher']],
  lake: [['lk1', 'hermit', 'Penjaga Mercusuar Tirta', 1100, 470, 'lightkeeper'], ['lk2', 'hunter', 'Musafir Kelana', 1080, 594, 'traveler']],
  road: [['rd1', 'darma', 'Musafir Gani', 590, 552, 'traveler'], ['rd2', 'woman', 'Musafir Laila', 530, 556, 'traveler']],
  kinn: [['in1', 'farmer', 'Pelanggan Bagus', 110, 200, 'patron'], ['in2', 'woman', 'Pelanggan Rini', 200, 220, 'patron']],
  inn: [['in3', 'hunter', 'Musafir Arif', 110, 170, 'patron']],
  temple: [['tp1', 'girl', 'Calon Imam Dewi', 130, 240, 'priest']],
  arsip: [['ar1', 'elder', 'Pustakawan Ki Lontar', 160, 220, 'scholar'], ['ar2', 'lestari', 'Peneliti Ayu', 100, 250, 'scholar']],
};
// peran untuk NPC yang sudah ada di peta
const CAST_ROLE = {
  kgate: { gk1: 'captain', gk2: 'soldier', gk3: 'archer', gk4: 'stablehand', gk5: 'soldier', merc1: 'merc', courier: 'courier' },
  kpasar: { kp1: 'shopper', kp4: 'shopper', kp7: 'shopper' }, kakademi: { ka1: 'student', ka3: 'student' },
};
for (const id in CAST) {
  const M = MAPS[id]; if (!M) continue; M.npcs = M.npcs || [];
  for (const [nid, ch, name, x, y, role, o = {}] of CAST[id]) {
    const leash = o.leash || (role === 'stall' ? 50 : M.indoor ? 60 : undefined), workR = o.workR || (role === 'stall' ? 60 : undefined);
    const n = { id: nid, ch, name, x, y, dir: 'down', wander: 22, role, leash, workR, lines: o.lines || CAST_TALK[role] };
    M.npcs.push(Object.assign(n, o.shout ? { shout: o.shout } : {}));
  }
}
for (const id in CAST_ROLE) for (const n of (MAPS[id] && MAPS[id].npcs) || []) if (CAST_ROLE[id][n.id]) n.role = CAST_ROLE[id][n.id];
