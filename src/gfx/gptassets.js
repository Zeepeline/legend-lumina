'use strict';
// Aset buatan pemilik (GPT) yang menggantikan tampilan lama. Gambar disiapkan oleh tools/prep_gpt_assets.py
// (dibersihkan sesuai docs/VALIDATION_RULES.md, ukurannya disamakan dengan tekstur lama agar tata letak tetap benar).
const GPT_SWAP = [
  "i_treeA", "treeAd", "treeSn", "i_apple1",
  "i_bushP", "i_bushW", "bush", "bushv", "rock",
  "i_rockWoods", "log", "hay", "i_cart", "crate", "barrel", "fence", "sign", "lamp",
  "mush", "stele", "i_houseA", "i_houseB", "i_houseC", "i_market", "windmill", "pebbles",
  "verdant_tree", "verdant_rock_large", "verdant_rock_med", "verdant_rock_pillar",
  "verdant_bush", "verdant_bush_small", "verdant_stump", "verdant_log",
  "verdant_cliff_corner", "verdant_cliff_straight", "verdant_cliff_slope"
];
const GPT_LOOK = {
  "domba": "g094", "ayam": "g090", "chick_master": "g023", "child": "g055", "rudi": "g074",
  "dice_gambler": "g026", "pancing": "g058", "sambo": "g017", "kafilah": "g025", "kmerchant": "g059",
  "gj1": "guard_spear", "gj2": "guard_spear", "gw1": "g010", "gw2": "g021", "kp1": "g053", "kp2": "g057",
  "kp3": "g011", "kp4": "g036", "kp5": "g051", "kp6": "g022", "kp7": "g002", "kp8": "g040",
  "ka1": "g037", "ka2": "g075", "ka3": "g063", "ka4": "g032", "ka5": "g077", "kb1": "g073",
  "kb2": "g052", "kb3": "g012", "kb4": "g056"
};
IMG_LIST.push('gpt_v_village_well', 'gpt_v_house_brown_cottage', 'gpt_v_house_red_cottage');
IMG_LIST.push(...GPT_SWAP.map(k => 'gpt_' + k), ...[...new Set(Object.values(GPT_LOOK))].map(k => 'npc_' + k));
for (const k of new Set(Object.values(GPT_LOOK))) if (!CHARS[k]) CHARS[k] = CHARS.child; // gambar asli dari npc_<k>.png (regPortrait)
// NPC berwajah kembar mendapat karakter sendiri (berdasarkan id)
for (const id in MAPS) for (const n of MAPS[id].npcs || []) if (GPT_LOOK[n.id] && !(n.id === 'inn')) n.ch = GPT_LOOK[n.id];
function applyGptSwap(T, A) {
  for (const hk of ['gpt_v_house_brown_cottage', 'gpt_v_house_red_cottage']) {
    if (IMGEL[hk]) {
      if (T.exists(hk)) T.remove(hk);
      const th = T.addImage(hk, IMGEL[hk]);
      th.add(0, 0, 0, 0, IMGEL[hk].width, IMGEL[hk].height);
    }
  }
  if (IMGEL['gpt_gatehouse']) {
    if (T.exists('gatehouse')) T.remove('gatehouse');
    const tg = T.addImage('gatehouse', IMGEL['gpt_gatehouse']);
    tg.add(0, 0, 0, 0, IMGEL['gpt_gatehouse'].width, IMGEL['gpt_gatehouse'].height);
  }
  if (IMGEL['gpt_gatehouse_top']) {
    if (T.exists('gpt_gatehouse_top')) T.remove('gpt_gatehouse_top');
    const tgt = T.addImage('gpt_gatehouse_top', IMGEL['gpt_gatehouse_top']);
    tgt.add(0, 0, 0, 0, IMGEL['gpt_gatehouse_top'].width, IMGEL['gpt_gatehouse_top'].height);
  }
  if (IMGEL['gpt_cwall']) {
    if (T.exists('cwall')) T.remove('cwall');
    const tc = T.addImage('cwall', IMGEL['gpt_cwall']);
    tc.add(0, 0, 0, 0, IMGEL['gpt_cwall'].width, IMGEL['gpt_cwall'].height);
  }
  if (IMGEL['gpt_ctower']) {
    if (T.exists('ctower')) T.remove('ctower');
    const tt = T.addImage('ctower', IMGEL['gpt_ctower']);
    tt.add(0, 0, 0, 0, IMGEL['gpt_ctower'].width, IMGEL['gpt_ctower'].height);
  }
  if (IMGEL['gpt_city_bridge']) {
    if (T.exists('city_bridge')) T.remove('city_bridge');
    const tb = T.addImage('city_bridge', IMGEL['gpt_city_bridge']);
    tb.add(0, 0, 0, 0, IMGEL['gpt_city_bridge'].width, IMGEL['gpt_city_bridge'].height);
  }
  const cityProps = ['gpt_city_lamp', 'gpt_city_lamp2', 'gpt_city_banner', 'gpt_city_banner_sm', 'gpt_city_fence',
    'gpt_city_rock_lg', 'gpt_city_rock_sm', 'gpt_city_flower_w', 'gpt_city_flower_p',
    'gpt_city_cliff_l', 'gpt_city_cliff_r', 'gpt_city_cart', 'gpt_city_board', 'gpt_city_bridge', 'gpt_ctower'];
  for (const cp of cityProps) {
    if (IMGEL[cp]) {
      if (T.exists(cp)) T.remove(cp);
      const tc = T.addImage(cp, IMGEL[cp]);
      tc.add(0, 0, 0, 0, IMGEL[cp].width, IMGEL[cp].height);
    }
  }
  if (IMGEL['gpt_v_village_well']) {
    if (T.exists('well')) T.remove('well');
    const tw = T.addImage('well', IMGEL['gpt_v_village_well']);
    tw.add(0, 0, 0, 0, IMGEL['gpt_v_village_well'].width, IMGEL['gpt_v_village_well'].height);
  }
  for (const tk of ['tree_apple_fruit', 'tree_apple_bare', 'tree_redwood']) {
    const img = IMGEL[tk];
    if (img && img.width > img.height * 4) {
      if (T.exists(tk)) T.remove(tk);
      const t = T.addImage(tk, img);
      const fw = img.width / 8, animKey = tk + '_sway';
      for (let i = 0; i < 8; i++) t.add(i, 0, i * fw, 0, fw, img.height);
      if (A) { /* tekstur dibuat ulang → anim lama menunjuk frame mati */
        if (A.exists(animKey)) A.remove(animKey);
        A.create({ key: animKey, frames: [...Array(8).keys()].map(i => ({ key: tk, frame: i })), frameRate: 4, repeat: -1 });
      }
    }
  }
  for (const k of GPT_SWAP) {
    const img = IMGEL['gpt_' + k]; if (!img) continue;
    if (T.exists(k)) T.remove(k);
    const t = T.addImage(k, img);
    if ((k === 'i_treeA' || k === 'treeAd' || k === 'treeSn') && img.width > img.height * 4) {
      const fw = img.width / 8, animKey = k + '_sway';
      for (let i = 0; i < 8; i++) t.add(i, 0, i * fw, 0, fw, img.height);
      if (A) { /* tekstur dibuat ulang → anim lama menunjuk frame mati */
        if (A.exists(animKey)) A.remove(animKey);
        A.create({ key: animKey, frames: [...Array(8).keys()].map(i => ({ key: k, frame: i })), frameRate: 4, repeat: -1 });
      }
    } else {
      t.add(0, 0, 0, 0, img.width, img.height);
    }
  }
}
