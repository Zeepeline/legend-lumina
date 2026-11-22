'use strict';
// KOTA & DESA GAYA SPROUT — kastil, tembok, menara, properti kota & semua bangunan desa/kota (gambar GPT)
// Bentuk gambar tidak berubah; hanya warna: batu (abu-abu) → tangga batu krem hangat CITY_STYLE.stone, warna lain diangkat & dilunakkan.
// Dijalankan sekali pada gambar IMGEL sebelum buildTextures membuat tekstur. Matikan: CITY_STYLE.on = false.
const CITY_STYLE = {
  on: true, soft: .85, lift: .22,
  stone: [[70, 62, 78], [128, 120, 124], [170, 162, 156], [202, 194, 182], [228, 222, 208], [244, 240, 228]],
  keys: ['gpt_gatehouse', 'gpt_gatehouse_top', 'gpt_cwall', 'gpt_ctower', 'gpt_city_bridge', 'gpt_city_lamp', 'gpt_city_lamp2',
    'gpt_city_banner', 'gpt_city_banner_sm', 'gpt_city_fence', 'gpt_city_board', 'gpt_city_cart', 'gpt_city_rock_lg', 'gpt_city_rock_sm',
    'gpt_city_cliff_s', 'gpt_city_cliff_c', 'gpt_city_cliff_l', 'gpt_city_cliff_r',
    /* bangunan desa & kota */
    'gpt_v_blacksmith_forge', 'gpt_v_barn_ranch', 'gpt_v_chapel_church', 'gpt_v_fishing_dock', 'gpt_v_guild_townhall', 'gpt_v_house_brown_cottage',
    'gpt_v_house_brown_wing', 'gpt_v_house_red_cottage', 'gpt_v_house_red_shop', 'gpt_v_inn_2story', 'gpt_v_market_stall', 'gpt_v_tavern_brown',
    'gpt_v_village_monument', 'gpt_v_village_well', 'gpt_v_watchtower', 'gpt_v_windmill', 'gpt_windmill', 'gpt_i_houseA', 'gpt_i_houseB',
    'gpt_i_houseC', 'gpt_i_market', 'houseA', 'houseB', 'houseC', 'market', 'fountain'],
};
function cityPastel(img) {
  const [c, x] = mk(img.width, img.height); x.drawImage(img, 0, 0);
  const D = x.getImageData(0, 0, c.width, c.height), d = D.data, R = CITY_STYLE.stone, n = R.length - 1;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const s = mx > 0 ? (mx - mn) / mx : 0, L = .3 * r + .59 * g + .11 * b;
    const t = Math.min(1, Math.max(0, (L - .08) / .72)) * n, i0 = Math.floor(t), i1 = Math.min(n, i0 + 1), f = t - i0;
    const w = Math.min(1, Math.max(0, (s - .18) / .2));
    for (let j = 0; j < 3; j++) {
      const st = (R[i0][j] * (1 - f) + R[i1][j] * f) / 255, cv = [r, g, b][j], so = CITY_STYLE.lift + (L + (cv - L) * CITY_STYLE.soft) * .82;
      d[i + j] = Math.max(0, Math.min(255, (st * (1 - w) + so * w) * 255));
    }
  }
  x.putImageData(D, 0, 0); return c;
}
const _buildTexturesCity = buildTextures;
buildTextures = function (sc) {
  if (CITY_STYLE.on && !buildTextures.cityDone) {
    for (const k of CITY_STYLE.keys) if (IMGEL[k] && IMGEL[k].width > 1) IMGEL[k] = cityPastel(IMGEL[k]);
    buildTextures.cityDone = 1;
  }
  return _buildTexturesCity.apply(this, arguments);
};
