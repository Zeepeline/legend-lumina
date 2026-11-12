// Sistem pendukung: toko, tempa, pancing, kebun, teka-teki, peti terkunci, malam, tas, peta.
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('beli di toko & tempa di bengkel', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { const S = window.__game.S; S.gold = 500; S.inv.pelt = 3; });
  await h.faceNpc(page, 'merchant'); await h.press(page, 'a', 1, 400); await h.flush(page);
  await h.press(page, 'a', 1, 300); await h.press(page, 'a', 1, 300); // Beli → Ramuan
  await h.press(page, 'b', 1, 200); await h.press(page, 'b', 1, 200); await h.flush(page);
  expect((await h.S(page)).inv.potion).toBe(4);
  await h.G(page, () => { const sc = window.__game.sc, n = sc.npcs.find(n => n.n.id === 'smith'); sc.pl.setPosition(n.spr.x + 14, n.spr.y); sc.pl.dir = 'left'; });
  await h.press(page, 'a', 1, 400); await h.flush(page);
  await h.press(page, 'down', 1, 150); await h.press(page, 'a', 1, 300); await h.press(page, 'a', 1, 800); // Tempa → Rompi Kulit
  await h.press(page, 'a', 1, 500);
  for (let i = 0; i < 4; i++) await h.press(page, 'b', 1, 200);
  const st = await h.S(page);
  expect(st.inv.leather).toBe(1); expect(st.eq.arm).toBe('leather');
  h.noErrors(errors);
});

test('memancing & berkebun', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { window.__game.S.inv.rod = 1; window.__game.S.inv.seed = 1; });
  await h.goto(page, 'forest', 446, 628, 'up');
  await h.G(page, () => window.__game.sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)));
  await h.press(page, 'a', 1, 200);
  await page.waitForFunction(() => [...document.querySelectorAll('.pop')].some(e => e.textContent === '!'), null, { timeout: 6000 });
  await h.press(page, 'a', 1, 400); await h.flush(page);
  const st = await h.S(page); expect((st.inv.fish || 0) + (st.inv.gfish || 0) + (st.inv.oldboot || 0)).toBe(1);
  await h.goto(page, 'village', 400, 530, 'down');
  await h.press(page, 'a', 1, 400); await h.press(page, 'a', 1, 400); await h.flush(page); // buka menu benih → tanam
  await h.G(page, () => window.__game.S.time += 7); await page.waitForTimeout(1300);
  await h.press(page, 'a', 1, 300); await h.flush(page);
  expect((await h.S(page)).inv.veg).toBe(3);
  h.noErrors(errors);
});

test('teka-teki batu membuka gerbang & kunci membuka peti', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.goto(page, 'cave', 254, 392, 'right');
  await h.G(page, () => window.__game.sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)));
  const until = async (dir, cond) => { await h.G(page, d => window.__game.Input.held.push(d), dir); await page.waitForFunction(cond, null, { timeout: 15_000 }); await h.G(page, () => window.__game.Input.held.length = 0); await page.waitForTimeout(300); };
  await until('right', () => window.__game.sc.boulder.x >= 334);
  await h.G(page, () => { window.__game.sc.pl.setPosition(334, 372); });
  await until('down', () => !!window.__game.S.flags.cave_gate);
  await page.waitForTimeout(1500); await h.flush(page);
  await h.G(page, () => { const sc = window.__game.sc; sc.pl.setPosition(640, 116); sc.pl.dir = 'up'; });
  await h.press(page, 'a', 1, 500); await h.flush(page);
  expect((await h.S(page)).inv.key).toBe(1);
  const gold = (await h.S(page)).gold;
  await h.goto(page, 'forest', 1060, 876, 'up');
  await h.G(page, () => window.__game.sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)));
  await h.press(page, 'a', 1, 600); await h.flush(page); await page.waitForTimeout(800); await h.flush(page);
  expect((await h.S(page)).gold).toBe(gold + 150);
  h.noErrors(errors);
});

test('malam hari menggelapkan layar', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => window.__game.S.time = 21); await page.waitForTimeout(400);
  expect(await h.G(page, () => window.__game.sc.night.alpha)).toBeGreaterThan(.5);
  h.noErrors(errors);
});

test('tas, peta, menu bisa dibuka & ditutup', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  for (const k of ['bag', 'map']) {
    await h.press(page, k, 1, 400);
    expect(await h.G(page, () => !!document.querySelector('#bagw, #mapw'))).toBe(true);
    await h.press(page, 'b', 1, 300);
    expect(await h.G(page, () => window.__game.G.lock)).toBe(0);
  }
  await h.press(page, 'menu', 1, 300); await h.press(page, 'b', 1, 300);
  expect(await h.G(page, () => window.__game.G.lock)).toBe(0);
  h.noErrors(errors);
});
