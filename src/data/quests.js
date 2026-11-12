'use strict';
// Teks misi, tujuan misi, jurus, pencapaian
const STAGE_TXT = ['Temui Tetua Bram di rumah pohon', 'Temui Pemburu Raka di pintu masuk Hutan Lumina', 'Rebut 3 Pecahan Segel dari pemimpin monster di hutan', 'Kalahkan Raja Goblin di Kuil Kristal', 'Sentuh Kristal Lumina untuk memulihkannya', 'Lapor ke Tetua Bram', 'Bab 2: Temui Pertapa Sura di Rawa Senja (selatan Padang Angin)', 'Kalahkan Morgath di jantung Rawa Senja', 'Lapor ke Tetua Bram', 'Bicara lagi dengan Tetua Bram', 'Bab 3: Temui Penjaga Nila di Puncak Beku (utara Padang Angin)', 'Nyalakan 3 Obor Kuno di Puncak Beku', 'Kalahkan Naga Es Kryos di puncak gunung', 'Lapor ke Tetua Bram', 'Bab 4: Bicara dengan Lina di desa', 'Tanyai penduduk desa tentang mimpi buruk', 'Periksa prasasti di Pohon Induk saat malam', 'Cari danau berkilau seperti cermin di barat desa', 'Tanyakan Tetua Bram tentang kamar di kuil', 'Bab 5: Tanyakan Nenek Ratih soal jalan ke Kota Lumina', 'Bantu Pak Gun membuka longsor di utara Danau Cermin', 'Tempuh Jalan Raya Lama menuju Kota Lumina', 'Cari Rudi, cucu Nenek Ratih, di Distrik Pasar', 'Temui Guru Lestari di Kota Bawah (barat pasar)', 'Bawa 3 Sayur Segar atau 3 Ikan untuk dapur umum', 'Baca catatan di Arsip Akademi (pintu utama Akademi)', 'Ceritakan temuanmu kepada Guru Lestari', ''];
const STAGE_GOAL = [['village', 486, 324], ['forest', 600, 90], null, ['forest', 640, 1046], ['forest', 640, 1076], ['village', 486, 324], ['swamp', 604, 130], ['swamp', 640, 840], ['village', 486, 324], ['village', 486, 324], ['snow', 596, 1080], null, ['snow', 640, 260], ['village', 486, 324], ['village', 604, 318], null, ['village', 560, 366], ['lake', 1010, 470], ['village', 486, 324], ['lake', 1040, 560], ['lake', 930, 190], ['kgate', 600, 700], ['kpasar', 980, 700], ['kbawah', 560, 620], ['kbawah', 560, 620], ['kakademi', 700, 400], ['kbawah', 560, 620]];
const SKILLS = [{ lv: 2, n: 'Dash', d: 'SHIFT / tombol DASH: melesat & kebal sesaat.' }, { lv: 3, n: 'Tebasan Putar', d: 'Tahan SERANG lalu lepas: tebas ke segala arah.' }, { lv: 5, n: 'Nova Es', d: 'Tahan SIHIR (atau C): ledakan es 8 MP, musuh melambat.' }];
const ACH = [
  { id: 'k10', n: 'Pemburu Pemula', d: 'Kalahkan 10 monster', ok: () => totalKills() >= 10, gift: ['gold', 30] },
  { id: 'k100', n: 'Pembasmi Monster', d: 'Kalahkan 100 monster', ok: () => totalKills() >= 100, gift: ['gold', 150] },
  { id: 'explore', n: 'Penjelajah', d: 'Kunjungi keenam wilayah', ok: () => ['village', 'forest', 'meadow', 'cave', 'swamp', 'snow'].every(m => S.seen[m]), gift: ['ether', 3] },
  { id: 'fish5', n: 'Pemancing', d: 'Tangkap 5 ikan', ok: () => S.st.fish >= 5, gift: ['gold', 50] },
  { id: 'farm3', n: 'Petani Muda', d: 'Panen 3 kali', ok: () => S.st.harvest >= 3, gift: ['seed', 5] },
  { id: 'puzzle', n: 'Pemecah Teka-teki', d: 'Buka gerbang di Gua Batu', ok: () => !!S.flags.cave_gate, gift: ['gold', 40] },
  { id: 'bosses', n: 'Penakluk', d: 'Kalahkan semua boss & mini-boss', ok: () => ['mb_goblin', 'mb_queen', 'mb_snake', 'boss', 'golem', 'witch', 'dragon'].every(f => S.flags[f]), gift: ['hipotion', 5] },
  { id: 'beast', n: 'Ahli Monster', d: 'Lengkapi bestiari monster biasa', ok: () => BEAST.every(k => S.kills[k]), gift: ['medal', 1] },
  { id: 'mine5', n: 'Palu Penambang', d: 'Tambang 5 urat batu bijih di gua', ok: () => (S.st?.mined || 0) >= 5, gift: ['gold', 60] },
  { id: 'barrel3', n: 'Pakar Peledak', d: 'Ledakkan 3 tong bubuk mesiu', ok: () => (S.st?.barrels || 0) >= 3, gift: ['gold', 50] },
  { id: 'socket1', n: 'Tatah Permata', d: 'Pasang permata pada senjata di Bengkel', ok: () => Object.keys(S.socket || {}).length > 0, gift: ['ether', 2] },
  { id: 'night8', n: 'Penjaga Malam', d: 'Kalahkan 8 monster varian malam', ok: () => (S.st?.nightKills || 0) >= 8, gift: ['gold', 75] },
  { id: 'back5', n: 'Langkah Bayangan', d: 'Lakukan 5 serangan Backstab dari belakang', ok: () => (S.st?.backstabs || 0) >= 5, gift: ['gold', 60] },
  { id: 'craft10', n: 'Tangan Terampil', d: 'Buat 10 barang di kerajinan', ok: () => (S.st?.crafted || 0) >= 10, gift: ['gold', 80] },
  { id: 'bridge1', n: 'Pembuat Jembatan', d: 'Perbaiki jembatan rusak di alam liar', ok: () => !!S.flags?.bridge_fixed, gift: ['gold', 100] },
  { id: 'rich1000', n: 'Kantung Tebal', d: 'Kumpulkan akumulasi 1.000 G', ok: () => (S.st?.goldEarned || 0) >= 1000, gift: ['gold', 150] },
];
