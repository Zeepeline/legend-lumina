'use strict';
// Teks misi, tujuan misi, jurus, pencapaian
// Teks misi dunia bebas (seluruh skenario lama di-reset ke nol)
const STAGE_TXT = new Proxy([], {
  get(target, prop) {
    if (prop === 'length') return 35;
    if (typeof prop === 'string' && !isNaN(prop)) return 'Jelajahi dunia Lumina dan bertualang dengan bebas';
    return target[prop];
  }
});
const STAGE_GOAL = new Proxy([], {
  get(target, prop) {
    if (prop === 'length') return 35;
    if (typeof prop === 'string' && !isNaN(prop)) return null;
    return target[prop];
  }
});
const SKILLS = [
  { lv: 2, n: 'Dash', d: 'SHIFT / tombol DASH: melesat & kebal sesaat.' },
  { lv: 3, n: 'Tebasan Putar', d: 'Tahan SERANG lalu lepas: tebas ke segala arah.' },
  { lv: 5, n: 'Nova Es', d: 'Tahan SIHIR (atau C): ledakan es 8 MP, musuh melambat.' }
];
const ACH = [
  { id: 'k10', n: 'Pemburu Pemula', d: 'Kalahkan 10 monster', ok: () => totalKills() >= 10, gift: ['gold', 30] },
  { id: 'k100', n: 'Pembasmi Monster', d: 'Kalahkan 100 monster', ok: () => totalKills() >= 100, gift: ['gold', 150] },
  {
    id: 'explore', n: 'Penjelajah', d: 'Kunjungi keenam wilayah',
    ok: () => ['village', 'forest', 'meadow', 'cave', 'swamp', 'snow'].every(m => S.seen[m]), gift: ['ether', 3]
  },
  { id: 'fish5', n: 'Pemancing', d: 'Tangkap 5 ikan', ok: () => S.st.fish >= 5, gift: ['gold', 50] },
  { id: 'farm3', n: 'Petani Muda', d: 'Panen 3 kali', ok: () => S.st.harvest >= 3, gift: ['seed', 5] },
  { id: 'puzzle', n: 'Pemecah Teka-teki', d: 'Buka gerbang di Gua Batu', ok: () => !!S.flags.cave_gate, gift: ['gold', 40] },
  {
    id: 'bosses', n: 'Penakluk', d: 'Kalahkan semua boss & mini-boss',
    ok: () => ['mb_goblin', 'mb_queen', 'mb_snake', 'boss', 'golem', 'witch', 'dragon'].every(f => S.flags[f]), gift: ['hipotion', 5]
  },
  { id: 'beast', n: 'Ahli Monster', d: 'Lengkapi bestiari monster biasa', ok: () => BEAST.every(k => S.kills[k]), gift: ['medal', 1] },
  { id: 'mine5', n: 'Palu Penambang', d: 'Tambang 5 urat batu bijih di gua', ok: () => (S.st?.mined || 0) >= 5, gift: ['gold', 60] },
  { id: 'barrel3', n: 'Pakar Peledak', d: 'Ledakkan 3 tong bubuk mesiu', ok: () => (S.st?.barrels || 0) >= 3, gift: ['gold', 50] },
  { id: 'socket1', n: 'Tatah Permata', d: 'Pasang permata pada senjata di Bengkel', ok: () => Object.keys(S.socket || {}).length > 0, gift: ['ether', 2] },
  { id: 'night8', n: 'Penjaga Malam', d: 'Kalahkan 8 monster varian malam', ok: () => (S.st?.nightKills || 0) >= 8, gift: ['gold', 75] },
  { id: 'back5', n: 'Langkah Bayangan', d: 'Lakukan 5 serangan Backstab dari belakang', ok: () => (S.st?.backstabs || 0) >= 5, gift: ['gold', 60] },
  { id: 'craft10', n: 'Tangan Terampil', d: 'Buat 10 barang di kerajinan', ok: () => (S.st?.crafted || 0) >= 10, gift: ['gold', 80] },
  { id: 'bridge1', n: 'Pembuat Jembatan', d: 'Perbaiki jembatan rusak di alam liar', ok: () => !!S.flags?.bridge_fixed, gift: ['gold', 100] },
  { id: 'rich1000', n: 'Kantung Tebal', d: 'Kumpulkan akumulasi 1.000 G', ok: () => (S.st?.goldEarned || 0) >= 1000, gift: ['gold', 150] },
  { id: 'fish50', n: 'Kail Emas', d: 'Tangkap 50 ikan', ok: () => (S.st?.fish || 0) >= 50, gift: ['gold', 200] },
  { id: 'harvest30', n: 'Petani Rajin', d: 'Panen 30 kali', ok: () => (S.st?.harvest || 0) >= 30, gift: ['seed', 5] },
  { id: 'craft20', n: 'Keahlian Pengrajin', d: 'Buat 20 barang kerajinan', ok: () => (S.st?.crafted || 0) >= 20, gift: ['gold', 120] },
  { id: 'cook15', n: 'Juru Masak Desa', d: 'Masak 15 hidangan', ok: () => (S.st?.cooked || 0) >= 15, gift: ['potion', 3] },
  { id: 'mine40', n: 'Penambang', d: 'Tambang 40 kali', ok: () => (S.st?.mined || 0) >= 40, gift: ['gold', 150] },
  { id: 'barrel25', n: 'Penghancur Tong', d: 'Pecahkan 25 tong', ok: () => (S.st?.barrels || 0) >= 25, gift: ['ether', 2] },
  { id: 'tree30', n: 'Penebang', d: 'Tebang 30 pohon', ok: () => (S.st?.trees || 0) >= 30, gift: ['gold', 100] },
  { id: 'steps20k', n: 'Kaki Baja', d: 'Berjalan 20.000 langkah', ok: () => (S.st?.steps || 0) >= 20000, gift: ['boots', 1] },
  { id: 'play5h', n: 'Betah di Lumina', d: 'Bermain selama 5 jam', ok: () => (S.st?.playTime || 0) >= 18000, gift: ['hipotion', 2] },
  { id: 'back10', n: 'Bayangan', d: 'Serang dari belakang 10 kali', ok: () => (S.st?.backstabs || 0) >= 10, gift: ['gold', 120] },
  { id: 'gold5k', n: 'Saudagar Muda', d: 'Kumpulkan total 5.000 G', ok: () => (S.st?.goldEarned || 0) >= 5000, gift: ['gold', 300] },
  { id: 'boss5', n: 'Penakluk Tangguh', d: 'Kalahkan 5 boss', ok: () => (S.st?.bosses || 0) >= 5, gift: ['hipotion', 3] },
  { id: 'k500', n: 'Legenda Pemburu', d: 'Kalahkan 500 monster', ok: () => totalKills() >= 500, gift: ['gold', 500] },
  { id: 'lv20', n: 'Pahlawan Muda', d: 'Capai level 20', ok: () => (S.lv || 1) >= 20, gift: ['hipotion', 2] },
  { id: 'lv30', n: 'Pahlawan Lumina', d: 'Capai level 30', ok: () => (S.lv || 1) >= 30, gift: ['gold', 600] },
  { id: 'warp5', n: 'Pengelana Cahaya', d: 'Aktifkan 5 patung teleport', ok: () => Object.keys(S.warps || {}).length >= 5, gift: ['ether', 3] },
  { id: 'fish100', n: 'Raja Pemancing', d: 'Tangkap 100 ikan', ok: () => (S.st?.fish || 0) >= 100, gift: ['gold', 400] },
  { id: 'tree100', n: 'Rimbawan', d: 'Tebang 100 pohon', ok: () => (S.st?.trees || 0) >= 100, gift: ['gold', 300] },
  { id: 'k1000', n: 'Momok Monster', d: 'Kalahkan 1.000 monster', ok: () => totalKills() >= 1000, gift: ['gold', 1000] },
];
