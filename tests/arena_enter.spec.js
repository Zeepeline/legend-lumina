// Arena Latihan (peta tanpa objs) bisa dimasuki tanpa error & adegan tetap berjalan
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('masuk arena tanpa objs tidak menghentikan game', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { window.__game.sc.scene.restart({ map: 'arena', x: 220, y: 200, dir: 'up' }); });
  await page.waitForTimeout(400);
  await h.G(page, () => { window.__game.sc.enemies.forEach(e => e.spr.destroy()); window.__game.sc.enemies.length = 0; }); /* musuh bisa mendorong keluar pintu */
  await page.waitForTimeout(5000);
  const a = await h.G(page, () => [window.__game.sc.M.id, window.__game.sc.t, !!window.__game.sc.pl]);
  await page.waitForTimeout(1000);
  const b = await h.G(page, () => window.__game.sc.t);
  expect(a[0]).toBe('arena'); expect(a[2]).toBe(true); expect(b).toBeGreaterThan(a[1]);
  h.noErrors(errors);
});
