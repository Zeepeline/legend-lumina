// Kota Lumina: Distrik Pasar = niaga saja, rumah warga di Distrik Permukiman (rumah perkotaan pemilik, city_house_N)
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('Pasar & Permukiman terpisah, rumah perkotaan terpakai', async ({ page }) => {
  const errors = await h.boot(page);
  const d = await h.G(page, () => {
    const kinds = id => MAPS[id].objs.map(o => o[0]), old = k => /^house[ABC]$/.test(k), city = k => /^cityHouse[1-5]$/.test(k);
    const perm = MAPS.kpermukiman, pasar = MAPS.kpasar;
    const inside = (M, o) => o[1] > 40 && o[1] < M.w - 40 && o[2] > 40 && o[2] < M.h - 40;
    return {
      pasarOld: kinds('kpasar').filter(old).length, pasarCity: kinds('kpasar').filter(city).length,
      permOld: kinds('kpermukiman').filter(old).length, permCity: kinds('kpermukiman').filter(city).length,
      doorsOk: perm.objs.filter(o => city(o[0])).every(o => perm.doors.some(r => r[0] === o[1] && r[1] === o[2])),
      pasarDoorsOk: pasar.objs.filter(o => city(o[0])).every(o => pasar.doors.some(r => r[0] === o[1] && r[1] === o[2])),
      inBounds: perm.objs.every(o => inside(perm, o)) && pasar.objs.every(o => inside(pasar, o)),
      east: pasar.exits.find(e => e.to === 'kpermukiman'), back: perm.exits.find(e => e.to === 'kpasar'),
      texOk: [1, 2, 3, 4, 5].every(n => OBJ['cityHouse' + n] && OBJ['cityHouse' + n].key === 'cityHouse' + n),
    };
  });
  expect(d.pasarOld, 'pasar tak lagi berisi rumah lama').toBe(0);
  expect(d.pasarCity).toBeGreaterThan(0);
  expect(d.permOld, 'permukiman hanya rumah perkotaan').toBe(0);
  expect(d.permCity).toBeGreaterThanOrEqual(10);
  expect(d.doorsOk && d.pasarDoorsOk, 'tiap rumah punya pintu/teks').toBe(true);
  expect(d.inBounds).toBe(true); expect(d.texOk).toBe(true);
  // pintu timur pasar ⇄ barat permukiman saling menunjuk & mendarat di dalam peta tujuan
  expect(d.east && d.back).toBeTruthy();
  expect(d.east.tx).toBeLessThan(200); expect(d.back.tx).toBeGreaterThan(1300);
  h.noErrors(errors);
});
