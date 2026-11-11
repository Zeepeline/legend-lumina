'use strict';
// Teks misi, tujuan misi, jurus, pencapaian
const STAGE_TXT = ['Temui Tetua Bram di rumah pohon', 'Temui Pemburu Raka di pintu masuk Hutan Lumina', 'Rebut 3 Pecahan Segel dari pemimpin monster di hutan', 'Kalahkan Raja Goblin di Kuil Kristal', 'Sentuh Kristal Lumina untuk memulihkannya', 'Lapor ke Tetua Bram', 'Bab 2: Temui Pertapa Sura di Rawa Senja (selatan Padang Angin)', 'Kalahkan Morgath di jantung Rawa Senja', 'Lapor ke Tetua Bram', ''];
const STAGE_GOAL = [['village', 486, 324], ['forest', 600, 90], null, ['forest', 640, 1046], ['forest', 640, 1076], ['village', 486, 324], ['swamp', 604, 130], ['swamp', 640, 840], ['village', 486, 324]];
const SKILLS = [{ lv: 2, n: 'Dash', d: 'SHIFT / tombol DASH: melesat & kebal sesaat.' }, { lv: 3, n: 'Tebasan Putar', d: 'Tahan SERANG lalu lepas: tebas ke segala arah.' }, { lv: 5, n: 'Nova Es', d: 'Tahan SIHIR (atau C): ledakan es 8 MP, musuh melambat.' }];
const ACH = [
  { id: 'k10', n: 'Pemburu Pemula', d: 'Kalahkan 10 monster', ok: () => totalKills() >= 10, gift: ['gold', 30] },
  { id: 'k100', n: 'Pembasmi Monster', d: 'Kalahkan 100 monster', ok: () => totalKills() >= 100, gift: ['gold', 150] },
  { id: 'explore', n: 'Penjelajah', d: 'Kunjungi kelima wilayah', ok: () => ['village', 'forest', 'meadow', 'cave', 'swamp'].every(m => S.seen[m]), gift: ['ether', 3] },
  { id: 'fish5', n: 'Pemancing', d: 'Tangkap 5 ikan', ok: () => S.st.fish >= 5, gift: ['gold', 50] },
  { id: 'farm3', n: 'Petani Muda', d: 'Panen 3 kali', ok: () => S.st.harvest >= 3, gift: ['seed', 5] },
  { id: 'puzzle', n: 'Pemecah Teka-teki', d: 'Buka gerbang di Gua Batu', ok: () => !!S.flags.cave_gate, gift: ['gold', 40] },
  { id: 'bosses', n: 'Penakluk', d: 'Kalahkan semua boss & mini-boss', ok: () => ['mb_goblin', 'mb_queen', 'mb_snake', 'boss', 'golem', 'witch'].every(f => S.flags[f]), gift: ['hipotion', 5] },
  { id: 'beast', n: 'Ahli Monster', d: 'Lengkapi bestiari monster biasa', ok: () => BEAST.every(k => S.kills[k]), gift: ['medal', 1] },
];
