// Alur misi utama dari awal sampai Bab 2 selesai (boss dikalahkan paksa agar cepat).
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('misi utama bab 1 & 2', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { const S = window.__game.S; S.lv = 20; S.hp = 999; });
  await h.talkTo(page, 'elder'); expect((await h.S(page)).stage).toBe(1);
  await h.goto(page, 'forest', 600, 110);
  await h.talkTo(page, 'hunter'); expect((await h.S(page)).stage).toBe(2);
  // tiga mini-boss
  for (const [x, y] of [[1010, 250], [180, 790], [1030, 800]]) {
    await h.G(page, ([x, y]) => { const sc = window.__game.sc; sc.enemies.forEach(e => { if (!e.boss) e.spr.setPosition(3000, 3000); }); sc.pl.setPosition(x, y); }, [x, y]);
    await h.hold(page, 'down', 500); await page.waitForTimeout(2200); await h.flush(page);
    await h.killBoss(page);
  }
  expect((await h.S(page)).inv.seal).toBe(3);
  // buka segel
  await h.G(page, () => { const sc = window.__game.sc; sc.pl.setPosition(640, 1000); sc.pl.dir = 'up'; });
  await h.press(page, 'a', 1, 400); await page.waitForTimeout(2600); await h.flush(page);
  expect((await h.S(page)).stage).toBe(3);
  // Raja Goblin
  await h.G(page, () => { window.__game.sc.pl.setPosition(640, 975); }); await h.hold(page, 'down', 700);
  await page.waitForTimeout(2500); await h.flush(page); await h.killBoss(page);
  expect((await h.S(page)).stage).toBe(4);
  await h.G(page, () => { const sc = window.__game.sc; sc.pl.setPosition(640, 1092); sc.pl.dir = 'up'; });
  await h.press(page, 'a', 1, 400); await page.waitForTimeout(2600); await h.flush(page);
  expect((await h.S(page)).stage).toBe(5);
  await h.goto(page, 'village', 512, 360, 'up');
  await h.talkTo(page, 'elder'); await page.waitForTimeout(3000); await h.flush(page);
  expect((await h.S(page)).stage).toBe(6);
  // Bab 2
  await h.goto(page, 'swamp', 604, 160, 'up');
  await h.talkTo(page, 'hermit'); expect((await h.S(page)).stage).toBe(7);
  await h.G(page, () => { const sc = window.__game.sc; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)); sc.pl.setPosition(640, 740); });
  await h.hold(page, 'down', 700); await page.waitForTimeout(2500); await h.flush(page); await h.killBoss(page);
  expect((await h.S(page)).stage).toBe(8);
  await h.goto(page, 'village', 512, 360, 'up');
  await h.talkTo(page, 'elder');
  expect((await h.S(page)).stage).toBe(9);
  h.noErrors(errors);
});
