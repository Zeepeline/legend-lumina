'use strict';
// Tata letak interior gaya lembar pemilik (lihat src/world/interior_sheet.js). Koordinat perabot = [nama, x tengah, y dasar, balik?].
// Ruang: lantai x 56–264, y 80–240; dinding belakang y 44–80; pintu x 140–180 di bawah. Jalur pintu (x 128–192, y 196+) dibiarkan kosong.
const INT_LAYOUT = {
  // Rumah Arka = ruang 1 (perapian, rak, ranjang merah, karpet merah + meja bunga). Ranjang, perapian & lemari = perabot rumah (bisa dipindah, home.js)
  home: { windows: [128, 140], furn2: [['bookcase_low', 196, 96], ['rug_red', 132, 204], ['table_flower', 132, 176], ['stool', 98, 178], ['stool', 166, 178],
    ['chair', 76, 226], ['sack', 94, 236], ['bucket', 222, 146], ['bucket2', 242, 148], ['plant_palm', 248, 236], ['lantern', 232, 72]] },
  // Penginapan = ruang 2 (rak toples, meja kasir, karpet hijau, peti & tong) + 4 ranjang tamu
  inn: { windows: [120, 180], furn2: [['jarshelf', 84, 96], ['hutch', 236, 96], ['plant_tall', 200, 96], ['table_cloth', 160, 128], ['stool', 132, 146],
    ['stool', 188, 146], ['rug_green', 160, 214], ['bed_red', 74, 160], ['bed_blue', 74, 214], ['bed_blue', 246, 160], ['bed_red', 246, 214],
    ['barrel', 112, 236], ['crate', 210, 236], ['painting', 160, 70]] },
  // Rumah Pohon Tetua = ruang 3 (dua rak buku, ranjang biru, karpet merah + meja bundar, peti kayu, tanaman)
  elderhome: { windows: [146], furn2: [['bookshelf', 82, 96], ['bookshelf', 122, 96], ['stove', 184, 96], ['bookcase_low', 238, 96], ['bed_blue', 246, 142],
    ['rug_red', 150, 186], ['table_round', 150, 178], ['chair', 174, 178], ['crate', 98, 236], ['plant_palm', 256, 196], ['clock', 212, 98]] },
  // Rumah Lina = varian ruang 1 (perapian, rak buku, 2 ranjang, karpet biru, meja teh)
  linahome: { windows: [120, 180], furn2: [['fireplace', 78, 96], ['pot_flower_r', 120, 96], ['planter_box', 190, 96], ['bookshelf', 238, 96],
    ['rug_blue', 150, 178], ['table_tea', 150, 150], ['stool', 120, 152], ['bed_red', 74, 206], ['bed_blue', 246, 206], ['plant_small', 256, 236]] },
};
for (const id in INT_LAYOUT) {
  const M = MAPS[id]; if (!M) continue;
  Object.assign(M, { sheet: 1, furn: [] }, INT_LAYOUT[id]);
  sheetWalls(M);
}
// perabot rumah Arka memakai sprite lembar yang sama
Object.assign(FCAT.bed, { tex: 'int_bed_red', w: 28, h: 39 });
Object.assign(FCAT.bed_cozy, { tex: 'int_bed_blue', w: 28, h: 39 });
Object.assign(FCAT.table, { tex: 'int_table_flower', w: 55, h: 31 });
Object.assign(FCAT.shelf, { tex: 'int_bookshelf', w: 31, h: 38 });
Object.assign(FCAT.rug, { tex: 'int_rug_red', w: 34, h: 36 });
Object.assign(FCAT.stove, { tex: 'int_fireplace', w: 28, h: 44, n: 'Perapian & Tungku' });
Object.assign(FCAT.craft, { tex: 'int_workbench', w: 40, h: 27 });
Object.assign(FCAT.box, { tex: 'int_chest', w: 20, h: 27 });
Object.assign(FCAT.alchemy, { tex: 'int_jarshelf', w: 37, h: 29 });
Object.assign(FCAT.trophy, { tex: 'int_bookcase_low', w: 33, h: 34 });
Object.assign(FCAT.wardrobe, { tex: 'int_wardrobe', w: 26, h: 37 });
Object.assign(FCAT.plant, { tex: 'int_plant_palm', w: 21, h: 32 });
// tata letak awal rumah Arka (ruang 1). Rumah dengan perabot bawaan lama dipindah sekali ke posisi baru.
const HOME_DEF2 = { bed: [224, 81], stove: [94, 52], wardrobe: [63, 59] };
const _homeInit0 = homeInit;
homeInit = function () {
  const H = _homeInit0();
  if (H.owned && !H.lay2) {
    H.lay2 = 1;
    if (H.items.length <= 3 && H.items.every(f => HOME_DEF2[f.t])) for (const f of H.items) [f.x, f.y] = HOME_DEF2[f.t];
  }
  return H;
};
