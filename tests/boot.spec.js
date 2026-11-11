// Game bisa dibuka, dimulai, disimpan, dan dilanjutkan.
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('layar judul tampil & game baru bisa dimulai', async ({ page }) => {
  const errors = await h.boot(page);
  await expect(page.locator('#title .logo')).toContainText('LUMINA');
  await h.newGame(page);
  const st = await h.S(page);
  expect(st.map).toBe('village'); expect(st.lv).toBe(1); expect(st.stage).toBe(0);
  await expect(page.locator('#hud')).toBeVisible();
  h.noErrors(errors);
});

test('simpan lalu lanjutkan', async ({ page }) => {
  const errors = await h.boot(page);
  await h.newGame(page);
  await h.G(page, () => { window.__game.S.gold = 777; window.__game.saveGame(window.__game.sc); sessionStorage.setItem('kept', '1'); });
  await page.reload();
  await page.waitForFunction(() => document.getElementById('title') && window.__game && window.__game.sc);
  await h.press(page, 'a', 1, 300); // pilihan awal = Lanjutkan
  await page.waitForFunction(() => !window.__game.G.title);
  expect((await h.S(page)).gold).toBe(777);
  h.noErrors(errors);
});
