'use strict';
// Penyeragaman gaya: PATOKAN = pohon treeA / treeAd / treeSn (hijau alami, garis luar halus) + set Verdant yang senada.
// Aset menyimpang diganti (data peta tetap memakai nama jenis lama):
//   round → treeAd (ikut bergoyang) · bushG1/bushG2 → verdant_bush · bushy → verdant_bush_small · stump/deadtree → verdant_stump
//   pine/pined → bentuk tetap, warna daun dipetakan ke palet pinus hutan tua (i_treeWoodsPine) yang senada treeA.
Object.assign(OBJ.round, { key: 'treeAd', col: [10, 6, 2], sh: [18, 5] });
Object.assign(OBJ.pine, { key: 'i_treeA', col: [10, 6, 2], sh: [18, 5] });
Object.assign(OBJ.pined, { key: 'treeAd', col: [10, 6, 2], sh: [18, 5] });
Object.assign(OBJ.treePine, { key: 'i_treeA', col: [10, 6, 2], sh: [18, 5] });
Object.assign(OBJ.treeWoodsPine, { key: 'i_treeA', col: [10, 6, 2], sh: [18, 5] });
Object.assign(OBJ.treeWoodsRound, { key: 'treeAd', col: [10, 6, 2], sh: [18, 5] });
Object.assign(OBJ.verdant_tree, { key: 'i_treeA', col: [10, 6, 2], sh: [18, 5] });
OBJ.bushG1.key = OBJ.bushG2.key = 'verdant_bush';
OBJ.bushy.key = 'verdant_bush_small';
OBJ.stump.key = 'verdant_stump'; OBJ.deadtree.key = 'verdant_stump';
OBJ_SPAWN.round = OBJ_SPAWN.treeA; OBJ_SPAWN.treeB = OBJ_SPAWN.treeA;
OBJ_SPAWN.pine = OBJ_SPAWN.treeA; OBJ_SPAWN.pined = OBJ_SPAWN.treeA;
OBJ_SPAWN.treePine = OBJ_SPAWN.treeA; OBJ_SPAWN.treeWoodsPine = OBJ_SPAWN.treeA; OBJ_SPAWN.treeWoodsRound = OBJ_SPAWN.treeA;
OBJ_SPAWN.verdant_tree = OBJ_SPAWN.treeA;
// warna daun: urutan kecerahan sumber dipetakan ke urutan kecerahan palet acuan (kontras & bentuk tetap)
