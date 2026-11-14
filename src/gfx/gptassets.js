'use strict';
// Aset buatan pemilik (GPT) yang menggantikan tampilan lama. Gambar disiapkan oleh tools/prep_gpt_assets.py
// (dibersihkan sesuai docs/VALIDATION_RULES.md, ukurannya disamakan dengan tekstur lama agar tata letak tetap benar).
const GPT_SWAP = [
  "i_treeA", "treeAd", "treeSn", "round", "pine", "pined", "i_treeWoodsPine", "i_apple1", "i_orange1",
  "i_bushG1", "i_bushG2", "i_bushP", "i_bushW", "i_bushP2", "bush", "bushy", "bushv", "rock",
  "i_rockWoods", "stump", "log", "hay", "i_cart", "crate", "barrel", "fence", "sign", "lamp",
  "mush", "stele", "i_houseA", "i_houseB", "i_houseC", "i_market", "windmill", "pebbles",
  "verdant_tree", "verdant_rock_large", "verdant_rock_med", "verdant_rock_pillar",
  "verdant_bush", "verdant_bush_small", "verdant_stump", "verdant_log",
  "verdant_cliff_corner", "verdant_cliff_straight", "verdant_cliff_slope",
  "tile_verdant_grass", "tile_verdant_dirt"
];
const GPT_LOOK = {
  "domba": "g094", "ayam": "g090", "chick_master": "g023", "child": "g055", "rudi": "g074",
  "dice_gambler": "g026", "pancing": "g058", "sambo": "g017", "kafilah": "g025", "kmerchant": "g059",
  "gj1": "g029", "gj2": "g030", "gw1": "g010", "gw2": "g021", "kp1": "g053", "kp2": "g057",
  "kp3": "g011", "kp4": "g036", "kp5": "g051", "kp6": "g022", "kp7": "g002", "kp8": "g040",
  "ka1": "g037", "ka2": "g075", "ka3": "g063", "ka4": "g032", "ka5": "g077", "kb1": "g073",
  "kb2": "g052", "kb3": "g012", "kb4": "g056"
};
IMG_LIST.push(...GPT_SWAP.map(k => 'gpt_' + k), ...[...new Set(Object.values(GPT_LOOK))].map(k => 'npc_' + k));
for (const k of new Set(Object.values(GPT_LOOK))) if (!CHARS[k]) CHARS[k] = CHARS.child; // gambar asli dari npc_<k>.png (regPortrait)
// NPC berwajah kembar mendapat karakter sendiri (berdasarkan id)
for (const id in MAPS) for (const n of MAPS[id].npcs || []) if (GPT_LOOK[n.id] && !(n.id === 'inn')) n.ch = GPT_LOOK[n.id];
function applyGptSwap(T, A) {
  for (const k of GPT_SWAP) {
    const img = IMGEL['gpt_' + k]; if (!img) continue;
    if (T.exists(k)) T.remove(k);
    const t = T.addImage(k, img);
    if ((k === 'i_treeA' || k === 'treeAd' || k === 'treeSn') && img.width > img.height * 4) {
      const fw = img.width / 8, animKey = k + '_sway';
      for (let i = 0; i < 8; i++) t.add(i, 0, i * fw, 0, fw, img.height);
      if (A && !A.exists(animKey)) A.create({ key: animKey, frames: [...Array(8).keys()].map(i => ({ key: k, frame: i })), frameRate: 6, repeat: -1 });
    } else {
      t.add(0, 0, 0, 0, img.width, img.height);
    }
  }
}
