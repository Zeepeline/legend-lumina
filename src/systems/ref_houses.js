'use strict';
// RUMAH DARI REFERENSI PEMILIK — rumah A/B/C, pondok merah/cokelat & pandai besi memakai gambar hasil tools/bake_houses.py
// (dari assets/img/buildings/ref_house_small.png & ref_house_big.png: atap diwarnai ulang merah/cokelat sesuai identitas,
// + tenda toko, tungku & landasan pandai besi). Ukuran = kanvas lama → tata letak & tabrakan tetap.
// Rumah ini dikeluarkan dari pembuat rumah kode (sprout_houses.js); houseBlue & kios tetap dari sana. Matikan: REF_HOUSES.on = false.
const REF_HOUSES = {
  on: true,
  map: { gpt_i_houseA: 'sp_houseA', houseA: 'sp_houseA', gpt_i_houseB: 'sp_houseB', houseB: 'sp_houseB', gpt_i_houseC: 'sp_houseC',
    houseC: 'sp_houseC', gpt_v_house_red_cottage: 'sp_house_red_cottage', gpt_v_house_brown_cottage: 'sp_house_brown_cottage',
    gpt_v_blacksmith_forge: 'sp_blacksmith_forge' },
};
IMG_LIST.push(...new Set(Object.values(REF_HOUSES.map)));
if (REF_HOUSES.on && typeof SPROUT_HOUSES !== 'undefined' && SPROUT_HOUSES.list) for (const k in REF_HOUSES.map) delete SPROUT_HOUSES.list[k];
const _buildTexturesRef = buildTextures;
buildTextures = function (sc) {
  if (REF_HOUSES.on && !buildTextures.refDone) {
    for (const [k, v] of Object.entries(REF_HOUSES.map)) if (IMGEL[k] && IMGEL[v]) { IMGEL[k] = IMGEL[v]; IMGEL[k]._sprout = 1; }
    buildTextures.refDone = 1;
  }
  return _buildTexturesRef.apply(this, arguments);
};
