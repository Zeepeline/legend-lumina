'use strict';
// Gambar bangunan & properti buatan kode (5) — isi: lihat docs/CODEMAP.md
function artGrainSifter() {
  const c = mkC(24, 20);
  // Meja kayu penyangga
  c.f('#5c4033', 3, 10, 18, 2);
  c.f('#3e2723', 4, 12, 2, 7);
  c.f('#3e2723', 18, 12, 2, 7);
  c.f('#4e342e', 10, 12, 4, 7);
  // Wadah / mangkuk kayu besar di bawah
  c.f('#6d4c41', 5, 8, 14, 4);
  c.f('#ffffff', 6, 9, 12, 3); // gundukan tepung putih
  c.f('#fff9c4', 7, 8, 10, 2);
  // Bingkai lingkaran ayakan kayu & kawat saringan
  c.f('#8d6e63', 3, 3, 18, 5);
  c.f('#bcaaa4', 4, 4, 16, 3);
  c.f('#cfd8dc', 5, 4, 14, 2); // kawat saringan abu-abu
  c.f('#ffd54f', 7, 3, 4, 2); // biji gandum di atas ayakan
  c.f('#ffb300', 13, 3, 4, 2);
  // Tangkai bulir gandum hiasan di samping meja
  c.f('#8d6e63', 1, 6, 1, 10);
  c.f('#fbc02d', 0, 4, 3, 3);
  c.f('#f57f17', 1, 2, 2, 3);
  return outline(c, '#2a1a08');
}

// Bangku tukang sol sepatu kulit tradisional (24x20)
function artCobblerBench() {
  const c = mkC(24, 20);
  // Bangku kayu kokoh
  c.f('#4e342e', 3, 11, 18, 3);
  c.f('#3e2723', 4, 14, 2, 5);
  c.f('#3e2723', 18, 14, 2, 5);
  // Balok tumpuan pijakan sepatu
  c.f('#6d4c41', 10, 8, 4, 3);
  // Cetakan kayu sol sepatu (wooden last)
  c.f('#d7ccc8', 5, 8, 5, 3);
  c.f('#bcaaa4', 7, 7, 3, 2);
  // Kaleng semir hitam lilin lebah terbuka & sikat bulu kuda
  c.f('#212121', 15, 9, 3, 2);
  c.f('#ffb300', 16, 9, 1, 1); // semir lilin lebah
  c.f('#8d6e63', 19, 8, 3, 2); // gagang sikat
  c.f('#424242', 19, 10, 3, 1); // bulu sikat kuda
  // Potongan kulit samak cokelat di bawah bangku
  c.f('#795548', 7, 16, 5, 2);
  c.f('#a1887f', 13, 16, 4, 2);
  return outline(c, '#211510');
}

// Panggung wayang boneka kayu mini bertirai merah (26x24)
function artPuppeteerStage() {
  const c = mkC(26, 24);
  // Kaki penyangga panggung kayu
  c.f('#4e342e', 4, 18, 3, 5);
  c.f('#4e342e', 19, 18, 3, 5);
  // Meja / kotak dasar panggung kayu
  c.f('#5c4033', 2, 14, 22, 5);
  c.f('#3e2723', 2, 18, 22, 1);
  c.f('#d7ccc8', 4, 15, 18, 2); // papan lantai panggung
  // Tiang samping panggung
  c.f('#8d6e63', 3, 2, 2, 13);
  c.f('#8d6e63', 21, 2, 2, 13);
  // Atap kanopi panggung ungu berenda emas
  c.f('#4a148c', 2, 1, 22, 3);
  c.f('#ffd54f', 2, 4, 22, 1);
  // Tirai beledu merah tersingkap di kiri & kanan
  c.f('#c62828', 4, 3, 4, 10);
  c.f('#b71c1c', 5, 4, 2, 8);
  c.f('#c62828', 18, 3, 4, 10);
  c.f('#b71c1c', 19, 4, 2, 8);
  c.f('#ffd54f', 7, 7, 2, 1); // tali pengikat tirai emas
  c.f('#ffd54f', 17, 7, 2, 1);
  // Papan latar panggung biru langit & awan
  c.f('#90caf9', 8, 4, 10, 8);
  c.f('#ffffff', 10, 5, 6, 2);
  c.f('#81c784', 8, 11, 10, 2); // bukit hijau latar
  // Boneka ksatria kecil & boneka naga bertali
  c.f('#9e9e9e', 9, 8, 3, 4); // ksatria perak
  c.f('#e53935', 10, 7, 1, 1); // bulu helm merah
  c.f('#ffd54f', 8, 9, 1, 2); // pedang kecil
  c.f('#43a047', 14, 8, 4, 4); // naga hijau
  c.f('#ffb300', 17, 9, 1, 2); // sayap naga
  // Benang tali boneka transparan putih ke atas
  c.f('#e0e0e0', 10, 3, 1, 5);
  c.f('#e0e0e0', 15, 3, 1, 5);
  return outline(c, '#211510');
}

// Jam matahari batu pualam kuno (22x22)
function artSundial() {
  const c = mkC(22, 22);
  // Dasar tugu pualam bertingkat
  c.f('#cfd8dc', 5, 17, 12, 3);
  c.f('#b0bec5', 4, 19, 14, 2);
  c.f('#90a4ae', 3, 20, 16, 2);
  // Tiang pilar pualam silinder
  c.f('#eceff1', 7, 8, 8, 9);
  c.f('#cfd8dc', 9, 8, 4, 9);
  c.f('#81c784', 6, 11, 2, 5); // sulur ivy kecil melilit
  c.f('#4caf50', 14, 13, 2, 4);
  // Piringan bundar jam matahari (cakram pualam)
  c.f('#b0bec5', 2, 4, 18, 5);
  c.f('#ffffff', 3, 3, 16, 5);
  c.f('#eceff1', 4, 2, 14, 5);
  // Garis-garis ukiran jam romawi kuno
  c.f('#78909c', 6, 4, 1, 2);
  c.f('#78909c', 11, 3, 1, 2);
  c.f('#78909c', 15, 4, 1, 2);
  c.f('#78909c', 7, 6, 1, 1);
  c.f('#78909c', 14, 6, 1, 1);
  // Jarum segitiga perunggu gnomon (miring ke tengah)
  c.f('#f57f17', 10, 1, 2, 4);
  c.f('#ffb300', 11, 2, 2, 3);
  c.f('#ffd54f', 11, 1, 1, 2);
  // Bayangan tajam gnomon di piringan
  c.f('#546e7a', 12, 4, 4, 2);
  return outline(c, '#263238');
}
