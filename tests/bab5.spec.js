// Bab 5: longsor, Jalan Raya Lama, Kota Lumina, Kota Bawah, Arsip Akademi
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('bab 5 kota lumina', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { const S = window.__game.S; S.lv = 30; S.hp = 999; S.stage = 19; S.time = 11; S.inv.veg = 3; });
  const clear = () => h.G(page, () => { window.__game.sc.enemies.forEach(e => { if (!e.boss) e.spr.setPosition(3000, 3000); }); });
  await h.goto(page, 'lake', 1040, 590, 'up'); await clear();
  await h.talkTo(page, 'ratih'); expect((await h.S(page)).stage).toBe(20);
  await h.faceNpc(page, 'gun'); await h.press(page, 'a', 1, 400); await h.flush(page);   // tanya "bantu?" → Ya
  for (let i = 0; i < 10 && (await h.S(page)).stage === 20; i++) {
    await h.G(page, () => { const sc = window.__game.sc; for (const e of sc.slideWave || []) if (e.hp > 0) sc.hitEnemy(e, 9999, false, 0, 1); });
    await page.waitForTimeout(900); await h.flush(page);
  }
  expect((await h.S(page)).stage).toBe(21); expect((await h.S(page)).flags.road_open).toBe(1);
  await h.G(page, () => { const sc = window.__game.sc; sc.pl.setPosition(820, 40); }); await h.hold(page, 'up', 700);
  await page.waitForFunction(() => window.__game.sc.M.id === 'road', null, { timeout: 8000 }); await page.waitForTimeout(500); await h.flush(page);
  await h.goto(page, 'kgate', 600, 820, 'up'); await page.waitForTimeout(1200);
  expect((await h.S(page)).stage).toBe(22);
  await page.screenshot({ path: '/tmp/c-gate.png' });
  await h.goto(page, 'kpasar', 900, 720, 'up'); await page.screenshot({ path: '/tmp/c-pasar.png' });
  await h.talkTo(page, 'rudi'); expect((await h.S(page)).stage).toBe(23);
  await h.goto(page, 'kbawah', 560, 650, 'up'); await page.screenshot({ path: '/tmp/c-bawah.png' });
  await h.talkTo(page, 'lestari'); expect((await h.S(page)).stage).toBe(24);
  await h.talkTo(page, 'lestari'); await h.flush(page);
  let st = await h.S(page); expect(st.stage).toBe(25); expect(st.inv.akey).toBe(1);
  await h.goto(page, 'kakademi', 700, 440, 'up'); await page.screenshot({ path: '/tmp/c-akademi.png' });
  await h.hold(page, 'up', 600);
  await page.waitForFunction(() => window.__game.sc.M.id === 'arsip' && !window.__game.sc.trans, null, { timeout: 8000 }); await page.waitForTimeout(500);
  for (const x of [64, 104, 176, 216]) { await h.G(page, x => { const sc = window.__game.sc; sc.pl.setPosition(x, 100); sc.pl.dir = 'up'; }, x); await h.press(page, 'a', 1, 400); await h.flush(page); }
  await page.waitForTimeout(400); expect((await h.S(page)).stage).toBe(26);
  await h.goto(page, 'kbawah', 560, 650, 'up'); await h.talkTo(page, 'lestari'); await h.flush(page);
  st = await h.S(page); expect(st.stage).toBe(27);
  h.noErrors(errors);
});
