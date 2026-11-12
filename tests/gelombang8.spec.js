const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 8: kandang, ternak, benih, irigasi', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { S.gold = 3000; homeInit().owned = 1; });
  await h.goto(page, 'village', 800, 365, 'right'); await page.waitForTimeout(600);
  const r = await h.G(page, () => {
    const sc = window.__game.sc, F = farmInit();
    for (const k of ['hen', 'sheep', 'cow']) { const a = { k, name: k, love: 0 }; F.animals.push(a); sc.spawnStock(a, F.animals.length - 1); }
    const cow = sc.herd[2]; S.inv.feed = 2; cow.a.fed = S.day; cow.a.love = 7; cow.a.got = -1;
    for (let i = 0; i < 60; i++) sc.updRanch(.1);
    const inPen = sc.herd.every(o => { const R = sc.M.ranch; return o.s.x > R.x && o.s.x < R.x + R.w && o.s.y > R.y && o.s.y < R.y + R.h; });
    return { herd: sc.herd.length, inPen, mark: !!cow.mk, tex: sc.textures.exists('rn_cow') };
  });
  expect(r).toEqual({ herd: 3, inPen: true, mark: true, tex: true });
  // ambil susu lewat menu hewan
  await h.G(page, () => { window.__game.sc.tendStock(window.__game.sc.herd[2]); }); await page.waitForTimeout(400);
  await h.press(page, 'down', 2, 150); await h.press(page, 'a', 1, 400);
  expect(await h.G(page, () => S.inv.milk)).toBe(2);
  // kebun: benih beri + irigasi
  const g = await h.G(page, () => { S.inv.seed_b = 1; S.garden = S.garden || []; S.garden[0] = { t: gameHours() - 4.1, seed: 'seed_b', plot: 'village0' }; farmInit().irrig.village0 = 1; return window.__game.sc.plotState(0); });
  expect(g).toBe('ripe');
  h.noErrors(errors);
});
