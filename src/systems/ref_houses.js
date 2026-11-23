'use strict';
// RUMAH DARI REFERENSI PEMILIK — rumah A/B/C, pondok merah/cokelat & pandai besi memakai gambar hasil tools/bake_houses.py
// (dari assets/img/buildings/ref_house_small.png & ref_house_big.png: atap diwarnai ulang merah/cokelat sesuai identitas,
// + tenda toko, tungku & landasan pandai besi). Ukuran = kanvas lama → tata letak & tabrakan tetap.
// Rumah ini dikeluarkan dari pembuat rumah kode (sprout_houses.js); houseBlue & kios tetap dari sana. Matikan: REF_HOUSES.on = false.
const REF_HOUSES = {
  on: true,
  map: {
    gpt_i_houseA: 'sp_houseA', i_houseA: 'sp_houseA', houseA: 'sp_houseA',
    gpt_i_houseB: 'sp_b_cityHouse1', i_houseB: 'sp_b_cityHouse1', houseB: 'sp_b_cityHouse1', /* sp_houseB dihapus pemilik → rumah perkotaan 1 */
    gpt_i_houseC: 'sp_houseC', i_houseC: 'sp_houseC', houseC: 'sp_houseC',
    gpt_v_house_red_cottage: 'sp_house_red_cottage', house_red_cottage: 'sp_house_red_cottage', houseRed: 'sp_house_red_cottage',
    /* pondok cokelat dihapus pemilik → pondok merah */
    gpt_v_house_brown_cottage: 'sp_house_red_cottage', house_brown_cottage: 'sp_house_red_cottage', houseBrown: 'sp_house_red_cottage',
    i_fountain: 'fountain', /* sp_b_i_fountain dihapus pemilik → buildings/fountain.png (83×85, kanvas sama) */
    gpt_v_blacksmith_forge: 'sp_blacksmith_forge', blacksmith_forge: 'sp_blacksmith_forge', blacksmith: 'sp_blacksmith_forge',
    gpt_v_inn_2story: 'sp_houseC', inn2: 'sp_houseC',
    cityHouse1: 'sp_b_cityHouse1', balaiDewan: 'sp_b_balaiDewan', barakBayaran: 'sp_b_barakBayaran',
    cityHouse2: 'sp_b_cityHouse2',
    cityHouse3: 'sp_b_cityHouse3',
    cityHouse4: 'sp_b_cityHouse4',
    cityHouse5: 'sp_b_cityHouse5',
    gpt_v_village_well: 'sp_b_well', village_well: 'sp_b_well', well: 'sp_b_well',
    gpt_v_market_stall: 'sp_b_i_market', market_stall: 'sp_b_i_market', i_market: 'sp_b_i_market', market: 'sp_b_i_market',
  },
};
// bangunan lain (tools/bake_buildings.py): tekstur kunci → gambar sp_b_<kunci>, diganti setelah buildTextures membuatnya
REF_HOUSES.tex = ['academy', 'i_market', 'well', 'windmill', 'blades', 'shrine'];
IMG_LIST.push(...new Set(Object.values(REF_HOUSES.map)), ...REF_HOUSES.tex.map(k => 'sp_b_' + k));
if (REF_HOUSES.on && typeof SPROUT_HOUSES !== 'undefined' && SPROUT_HOUSES.list) {
  for (const k in REF_HOUSES.map) delete SPROUT_HOUSES.list[k];
  for (const k of REF_HOUSES.tex) delete SPROUT_HOUSES.list[k];
}
const _buildTexturesRef = buildTextures;
buildTextures = function (sc) {
  if (REF_HOUSES.on && !buildTextures.refDone) {
    for (const [k, v] of Object.entries(REF_HOUSES.map)) {
      if (IMGEL[v]) { IMGEL[k] = IMGEL[v]; IMGEL[k]._sprout = 1; }
    }
    buildTextures.refDone = 1;
  }
  const r = _buildTexturesRef.apply(this, arguments), T = sc && sc.textures;
  if (REF_HOUSES.on && T) {
    for (const [k, v] of Object.entries(REF_HOUSES.map)) {
      const im = IMGEL[v];
      if (!im || (T.exists(k) && T.get(k).getSourceImage() === im)) continue;
      if (T.exists(k)) T.remove(k);
      T.addImage(k, im);
    }
    for (const k of REF_HOUSES.tex) {
      const im = IMGEL['sp_b_' + k];
      if (!im || (T.exists(k) && T.get(k).getSourceImage() === im)) continue;
      if (T.exists(k)) T.remove(k);
      T.addImage(k, im);
    }
  }
  return r;
};
