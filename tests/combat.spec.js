// Pertarungan: serangan, sihir terarah, jurus, kalah lalu bangun di penginapan, boss muncul lagi.
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('serangan pedang mengurangi HP musuh', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page); await h.learnAll(page);
  await h.G(page, () => window.__game.S.stage = 2);
  await h.goto(page, 'forest', 300, 330, 'up');
  const before = await h.G(page, () => { const sc = window.__game.sc; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)); const e = sc.enemies[0]; e.spr.setPosition(300, 312); e.t = 9; return e.hp; });
  await h.press(page, 'a', 1, 400);
  expect(await h.G(page, () => window.__game.sc.enemies[0].hp)).toBeLessThan(before);
  h.noErrors(errors);
});

test('bola api mengikuti arah bidik & memakai MP', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page); await h.learnAll(page);
  const mp = (await h.S(page)).mp;
  await h.G(page, () => { window.__game.Input.castAng = Math.PI / 4; window.__game.press('b'); });
  await page.waitForTimeout(80);
  const shot = await h.G(page, () => { const p = window.__game.sc.shots[0]; return p && [p.vx, p.vy]; });
  expect(shot).toBeTruthy(); expect(shot[0]).toBeGreaterThan(0); expect(shot[1]).toBeGreaterThan(0);
  expect((await h.S(page)).mp).toBeLessThanOrEqual(mp - 2); // MP bisa pulih 1 di sela tes
  h.noErrors(errors);
});

test('jurus dash, nova es, tebasan putar', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page); await h.learnAll(page);
  await h.G(page, () => { window.__game.S.lv = 6; window.__game.S.mp = 40; });
  await h.press(page, 'dash', 1, 100);
  expect(await h.G(page, () => window.__game.sc.pl.dashT > 0 || window.__game.sc.dashCd > 0)).toBe(true);
  await page.waitForTimeout(600);
  await h.press(page, 'nova', 1, 300);
  expect((await h.S(page)).mp).toBeLessThanOrEqual(32);
  await h.G(page, () => window.__game.Input.keys.a = true); await page.waitForTimeout(650);
  await h.G(page, () => window.__game.Input.keys.a = false); await page.waitForTimeout(100);
  expect(await h.G(page, () => window.__game.sc.pl.atkT > 0)).toBe(true);
  h.noErrors(errors);
});

test('kalah saat boss → bangun di penginapan → boss muncul lagi', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page); await h.learnAll(page);
  await h.G(page, () => { const S = window.__game.S; S.stage = 3; S.flags.seal_open = 1; });
  await h.goto(page, 'forest', 640, 990);
  await h.hold(page, 'down', 700);
  await page.waitForTimeout(2500); await h.flush(page);
  await page.waitForFunction(() => window.__game.sc.enemies.some(e => e.boss));
  await h.G(page, () => { window.__game.S.hp = 1; window.__game.sc.hurtPlayer(999, 640, 900); });
  await page.waitForFunction(() => document.body.innerText.includes('Coba lagi'), null, { timeout: 10_000 });
  await h.press(page, 'down', 1, 200); await h.press(page, 'a', 1, 300); // pilih: bangun di penginapan
  await page.waitForFunction(() => window.__game.sc.M.id === 'inn', null, { timeout: 15_000 });
  await page.waitForTimeout(800); await h.flush(page);
  await h.goto(page, 'forest', 640, 990);
  await h.hold(page, 'down', 700);
  await page.waitForTimeout(2500); await h.flush(page);
  expect(await h.G(page, () => window.__game.sc.enemies.some(e => e.boss))).toBe(true);
  h.noErrors(errors);
});
