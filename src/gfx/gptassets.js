'use strict';
// Aset buatan pemilik (GPT) yang menggantikan tampilan lama. Gambar ada di assets/img (gpt_<kunci>.png)
// (dibersihkan sesuai docs/VALIDATION_RULES.md, ukurannya disamakan dengan tekstur lama agar tata letak tetap benar).
const GPT_SWAP = [ /* hanya yang gambarnya ada di assets/img (gpt_<kunci>.png) */
  "i_bushP", "i_bushW", "bush", "bushv", "rock", "i_rockWoods", "log",
  "mush", "pebbles"
];
const GPT_LOOK = {
  "domba": "g094", "ayam": "g090", "chick_master": "g023", "child": "g055", "rudi": "g074",
  "dice_gambler": "g026", "pancing": "g058", "sambo": "g017", "kafilah": "g025", "kmerchant": "g059",
  "gj1": "guard_spear", "gj2": "guard_spear", "gw1": "g010", "gw2": "g021", "kp1": "g053", "kp2": "g057",
  "kp3": "g011", "kp4": "g036", "kp5": "g051", "kp6": "g022", "kp7": "g002", "kp8": "g040",
  "ka1": "g037", "ka2": "g075", "ka3": "g063", "ka4": "g032", "ka5": "g077", "kb1": "g073",
  "kb2": "g052", "kb3": "g012", "kb4": "g056"
};
/* sumur, rumah, pasar & kincir GPT dihapus pemilik → gambar sp_* (systems/ref_houses.js) */
IMG_LIST.push(...GPT_SWAP.map(k => 'gpt_' + k), 'npc_guard_spear'); /* gNNN tidak punya gambar → wajah CHARS.child (di bawah) */
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
  const cityProps = ['gpt_city_lamp', 'gpt_city_lamp2', 'gpt_city_banner', 'gpt_city_banner_sm', 'gpt_city_fence',
    'gpt_city_rock_lg', 'gpt_city_rock_sm', 'gpt_city_flower_w', 'gpt_city_flower_p',
    'gpt_city_cliff_l', 'gpt_city_cliff_r', 'gpt_city_cart', 'gpt_city_board'];
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
  for (const k of GPT_SWAP) {
    const img = IMGEL['gpt_' + k]; if (!img) continue;
    if (T.exists(k)) T.remove(k);
    const t = T.addImage(k, img);
    t.add(0, 0, 0, 0, img.width, img.height);
  }
}
