'use strict';
// Jurnal: catatan lore (LORE), misteri jangka panjang (MYSTERY), penyelidikan jangka menengah (midGoal). Lihat docs/GAME_DESIGN.md
// LORE[id] = [kategori, judul, isi]. Didapat lewat learn(id) → S.lore[id] = 1
const LORE = {
  tanda: ['Petunjuk', 'Tanda di tanganku', 'Saat menyentuh Kristal Lumina, tanda berbentuk daun di telapak tanganku berkedip. Hangat... seperti dikenali.'],
  suara_goblin: ['Petunjuk', 'Gumaman Raja Goblin', '"Suara itu... berjanji... cahaya untukku..." katanya sebelum tumbang. Suara siapa?'],
  suara_morgath: ['Petunjuk', 'Kata terakhir Morgath', '"Dia di bawah akar... menjanjikan cahaya abadi..." Morgath juga mendengar suara itu?'],
  suara_kryos: ['Petunjuk', 'Bisikan yang membangunkan naga', 'Kryos bilang ia dibangunkan oleh bisikan dari bawah tanah. Morgath hanya menyampaikannya.'],
  relief_obor: ['Petunjuk', 'Relief di obor kuno', 'Ukiran seorang wanita mengangkat tangan bercahaya. Di telapaknya ada tanda daun... sama seperti tanganku.'],
  sura_selene: ['Petunjuk', 'Nama dari Pertapa Sura', '"Matamu mirip seseorang... Selene." Sura langsung diam setelah mengucapkan nama itu.'],
  prasasti_desa: ['Sejarah', 'Prasasti Pohon Induk', 'Tulisan kuno hampir terhapus: "...para Penjaga Cahaya menancapkan kristal, agar yang tertidur tetap tertidur..."'],
  prasasti_hutan: ['Sejarah', 'Akar raksasa', 'Akar sebesar rumah menembus tanah hutan. Terlalu besar untuk pohon mana pun di sini.'],
  prasasti_gua: ['Sejarah', 'Ukiran tambang', 'Ukiran di dinding gua: golem-golem dibuat untuk menjaga urat kristal. Gua ini dulunya tambang.'],
  prasasti_rawa: ['Sejarah', 'Atap di bawah air', 'Di bawah air rawa tampak atap-atap batu. Prasasti yang tenggelam menyebut satu nama: "Aurel".'],
  kincir_serikat: ['Dunia', 'Serikat Dagang', 'Serikat Dagang dari Simpang Rantau membeli lahan di mana-mana. Kata Darma, mereka butuh gudang untuk serpihan kristal dari Lembah Besi.'],
  kota_lumina: ['Dunia', 'Kota Lumina', 'Kota Seribu Lentera di barat laut. Ada Dewan Kota dan Akademi Cahaya. Jalannya tertutup longsor.'],
  mimpi: ['Petunjuk', 'Mimpi yang sama', 'Pak Darto, Bu Sari, dan Dodi memimpikan hal yang sama: akar hitam di bawah desa, dan wanita bercahaya yang menangis.'],
  visi_pohon: ['Petunjuk', 'Penglihatan di Pohon Induk', 'Tanda di tanganku menyala. Aku melihat akar hitam berdenyut di bawah kristal... lalu sebuah danau berkilau seperti cermin di barat.'],
  ratih: ['Petunjuk', 'Kesaksian Nenek Ratih', '16 tahun lalu, seorang wanita bercahaya menyeberangi Danau Cermin dengan perahu sambil menggendong bayi. Paginya perahu itu kembali kosong.'],
  kuil_relief: ['Sejarah', 'Relief Perang Akar', 'Seribu tahun lalu sesuatu bangkit dari bawah akar. Para Penjaga Cahaya menancapkan kristal di seluruh benua untuk menahannya. Kristal adalah segel.'],
  kuil_aurel: ['Sejarah', 'Relief Kerajaan Aurel', 'Sebuah kota besar bermenara tinggi bernama Aurel. Di bawahnya, akar hitam menjalar... lalu kota itu runtuh.'],
  kuil_kamar: ['Petunjuk', 'Kamar terkunci', 'Pintu kamar terbuka saat tanda di tanganku menyentuhnya. Di dalam: buaian kosong, dan gelang kecil dengan tanda daun yang sama.'],
  bram_aku: ['Petunjuk', 'Pengakuan Tetua Bram', '16 tahun lalu Bram menemukanku, masih bayi, di samping Kristal Lumina. Ia berjanji pada seseorang untuk merahasiakan sisanya.'],
};
// Misteri besar: muncul saat open() benar, terjawab (sebagian) saat ans() mengembalikan teks
const MYSTERY = [
  { q: 'Kenapa kristal-kristal meredup bersamaan?', open: () => S.stage >= 1, ans: () => S.lore.kuil_relief && 'Kristal adalah segel yang menahan sesuatu di bawah akar. Segelnya melemah.' },
  { q: 'Siapa "suara" yang menghasut para penjahat?', open: () => S.lore.suara_goblin, ans: () => null, hint: () => `Petunjuk: ${['suara_goblin', 'suara_morgath', 'suara_kryos'].filter(k => S.lore[k]).length}/3` },
  { q: 'Kenapa tanda di tanganku menyala?', open: () => S.lore.tanda, ans: () => null },
  { q: 'Siapa Selene?', open: () => S.lore.sura_selene, ans: () => null },
  { q: 'Siapa wanita bercahaya dalam mimpi?', open: () => S.lore.mimpi, ans: () => null },
  { q: 'Apa yang disembunyikan Tetua Bram?', open: () => S.lore.kuil_kamar, ans: () => S.lore.bram_aku && 'Aku ditemukan bayi di samping kristal. Bram belum mau bercerita semuanya.' },
  { q: 'Apa yang ada di bawah akar?', open: () => S.lore.visi_pohon, ans: () => null },
];
// Penyelidikan jangka menengah, mengikuti tahap cerita
function midGoal() {
  const s = S.stage;
  if (s < 5) return 'Kenapa monster di sekitar desa mengamuk, dan kenapa Kristal Lumina meredup?';
  if (s < 9) return 'Siapa Morgath, dan kenapa ia mengincar Lumina?';
  if (s < 14) return 'Siapa yang membangunkan naga es di utara?';
  if (s < 19) return 'Mimpi buruk apa yang menghantui penduduk desa?';
  return 'Siapa wanita bercahaya itu? Catatan para Penjaga Cahaya tersimpan di Akademi Cahaya, Kota Lumina, tapi jalannya tertutup longsor.';
}
function learn(id) {
  if (!LORE[id] || S.lore[id]) return false;
  const before = MYSTERY.filter(m => m.open()).length; S.lore[id] = 1; sfx('save');
  const after = MYSTERY.filter(m => m.open()).length;
  banner(LORE[id][1], after > before ? 'MISTERI BARU · JURNAL' : 'JURNAL DIPERBARUI', false, 2000);
  return true;
}
