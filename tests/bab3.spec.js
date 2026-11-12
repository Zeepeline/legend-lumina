const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('senjata, status, pengaturan, bab 3', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = await h.boot(page); await h.newGame(page);
  // senjata
  for (const w of ['ispear', 'baxe', 'hbow', 'fspear']) {
    await h.G(page, w => { const S = window.__game.S; S.inv[w] = 1; S.eq.wpn = w; window.__game.sc.pl.atkCd = 0; window.__game.press('a'); }, w);
    await page.waitForTimeout(700);
  }
  expect(await h.G(page, () => window.__game.sc.shots.length >= 0)).toBe(true);
  // status
  await h.G(page, () => { const sc = window.__game.sc; window.__game.S.hp = 80; sc.inflict(['poison', 3]); sc.inflict(['chill', 3]); });
  await page.waitForTimeout(1600);
  const st = await h.G(page, () => [window.__game.S.hp, window.__game.sc.speedMul(), document.getElementById('hSt')?.textContent]);
  console.log('status', st); expect(st[0]).toBeLessThan(80); expect(st[1]).toBeLessThan(1);
  await h.G(page, () => { window.__game.S.inv.antidote = 1; window.__game.sc.useItem('antidote'); });
  expect(await h.G(page, () => Object.keys(window.__game.sc.pst).length)).toBe(0);
  // pengaturan
  await h.press(page, 'menu', 1, 300); await h.press(page, 'down', 11, 120); await h.press(page, 'a', 1, 300);
  expect(await h.G(page, () => document.body.innerText.includes('PENGATURAN'))).toBe(true);
  await h.press(page, 'a', 1, 200); await h.press(page, 'b', 1, 200); await h.press(page, 'b', 1, 200);
  expect(await h.G(page, () => JSON.parse(localStorage.getItem('legenda_lumina_opt')).mus)).toBe(4);
  // bab 3
  await h.G(page, () => { const S = window.__game.S; S.lv = 30; S.stage = 9; }); await h.learnAll(page);
  await h.goto(page, 'village', 512, 360, 'up'); await h.talkTo(page, 'elder');
  expect((await h.S(page)).stage).toBe(10);
  await h.goto(page, 'meadow', 600, 120, 'up'); await h.hold(page, 'up', 1500);
  await page.waitForFunction(() => window.__game.sc.M.id === 'snow', null, { timeout: 8000 }); await page.waitForTimeout(800); await h.flush(page);
  await h.G(page, () => { const sc = window.__game.sc; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)); });
  await h.talkTo(page, 'nila'); expect((await h.S(page)).stage).toBe(11);
  for (const [x, y] of [[260, 744], [1020, 704], [640, 530]]) {
    await h.G(page, ([x, y]) => { const sc = window.__game.sc; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)); sc.pl.setPosition(x, y + 16); sc.pl.dir = 'up'; window.__game.S.hp = 999; }, [x, y]);
    await h.press(page, 'a', 1, 400); await page.waitForTimeout(1500); await h.flush(page); await page.waitForTimeout(500); await h.flush(page);
  }
  expect((await h.S(page)).stage).toBe(12);
  await h.G(page, () => { const sc = window.__game.sc; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)); sc.pl.setPosition(640, 420); });
  await h.hold(page, 'up', 1600); await page.waitForTimeout(2600); await h.flush(page);
  await page.waitForFunction(() => window.__game.sc.enemies.some(e => e.boss && e.awake), null, { timeout: 15000 });
  await h.killBoss(page);
  expect((await h.S(page)).stage).toBe(13);
  await h.goto(page, 'village', 512, 360, 'up'); await h.talkTo(page, 'elder'); await page.waitForTimeout(3000); await h.flush(page);
  expect((await h.S(page)).stage).toBe(14);
  h.noErrors(errors);
});
