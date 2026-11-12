const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 7: rumah Arka, perabot, peti', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { S.gold = 2000; });
  // beli rumah lewat pintu desa
  await h.goto(page, 'village', 874, 252, 'up'); await page.waitForTimeout(400);
  await h.G(page, () => { window.__game.sc.enterRoom('home'); });
  for (let i = 0; i < 12 && await h.G(page, () => window.__game.sc.M.id !== 'home'); i++) await h.press(page, 'a', 1, 500); await page.waitForFunction(() => window.__game.sc.M.id === 'home', null, { timeout: 8000 }); await page.waitForTimeout(600);
  expect(await h.G(page, () => [S.home.owned, S.gold])).toEqual([1, 1750]);
  // beli ranjang & taruh
  const r = await h.G(page, () => {
    const sc = window.__game.sc; sc.pl.setPosition(100, 200); sc.pl.dir = 'up';
    sc.startCarry({ t: 'bed', x: 0, y: 0, v: 0 }, true); sc.updCarry(); const ok = sc.carry.ok; sc.carryKey('a');
    sc.pl.setPosition(160, 230); sc.startCarry({ t: 'box', x: 0, y: 0, v: 0 }, true); sc.updCarry(); const bad = sc.carry.ok; sc.carryKey('b');
    sc.pl.setPosition(230, 200); sc.pl.dir = 'up'; sc.startCarry({ t: 'box', x: 0, y: 0, v: 0 }, true); sc.updCarry(); sc.carryKey('a');
    return { ok, bad, items: S.home.items.map(f => f.t), store: S.home.store };
  });
  console.log(r);
  expect(r.ok).toBe(true); expect(r.bad).toBe(false); expect(r.items).toEqual(expect.arrayContaining(['bed', 'box'])); // rumah bisa punya perabot bawaan (lemari, #21)
  // simpan & muat ulang ruangan: perabot tetap ada
  await h.goto(page, 'village', 874, 260, 'down'); await h.goto(page, 'home', 160, 226, 'up'); await page.waitForTimeout(500);
  expect(await h.G(page, () => window.__game.sc.hf.length)).toBe(await h.G(page, () => S.home.items.length));
  await h.G(page, () => { S.inv.herb = 5; homeInit().box.herb = 2; });
  h.noErrors(errors);
});
