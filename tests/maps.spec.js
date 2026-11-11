// Semua peta bisa dimasuki tanpa error. Screenshot tiap peta dilampirkan ke laporan.
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
const MAPS = [['village', 512, 380], ['forest', 640, 60], ['meadow', 60, 330], ['cave', 120, 780], ['swamp', 640, 60], ['inn', 160, 226], ['elderhome', 160, 226], ['linahome', 160, 226]];

test('semua peta bisa dimasuki', async ({ page }, info) => {
  const errors = await h.boot(page);
  await h.newGame(page);
  for (const [m, x, y] of MAPS) {
    await h.goto(page, m, x, y);
    expect(await h.G(page, () => window.__game.sc.M.id)).toBe(m);
    await info.attach('peta-' + m, { body: await page.screenshot(), contentType: 'image/png' });
  }
  h.noErrors(errors);
});

test('pintu rumah & keluar lagi', async ({ page }) => {
  const errors = await h.boot(page);
  await h.newGame(page);
  await h.G(page, () => window.__game.sc.pl.setPosition(513, 300));
  await h.hold(page, 'up', 500);
  await page.waitForFunction(() => window.__game.sc.M.id === 'elderhome', null, { timeout: 8000 });
  await page.waitForTimeout(500);
  await h.hold(page, 'down', 1200);
  await page.waitForFunction(() => window.__game.sc.M.id === 'village', null, { timeout: 8000 });
  h.noErrors(errors);
});
