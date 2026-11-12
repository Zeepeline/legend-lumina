// Jurnal, prasasti, Desa Kincir, Bab 4 (investigasi tanpa boss)
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('jurnal, desa kincir, bab 4', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { const S = window.__game.S; S.lv = 30; S.hp = 999; S.stage = 14; S.time = 10; });
  // jurnal terbuka & tertutup
  await h.press(page, 'menu', 1, 300); await h.press(page, 'down', 1, 120); await h.press(page, 'a', 1, 400); await h.press(page, 'a', 1, 400); /* Jelajah → Jurnal */
  expect(await h.G(page, () => !!document.querySelector('.jrn'))).toBe(true);
  await h.press(page, 'right', 2, 200); await h.press(page, 'b', 1, 300); await h.press(page, 'b', 1, 300); await h.press(page, 'b', 1, 300);
  expect(await h.G(page, () => window.__game.G.lock)).toBe(0);
  // Desa Kincir: patok
  await h.goto(page, 'meadow', 300, 330, 'down');
  await h.G(page, () => window.__game.sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)));
  await page.screenshot({ path: '/tmp/kincir.png' });
  await h.talkTo(page, 'wati'); expect((await h.S(page)).side.patok).toBe(1);
  await h.G(page, () => { const sc = window.__game.sc; sc.pl.setPosition(560, 668); sc.pl.dir = 'up'; });
  await h.press(page, 'a', 1, 400); await h.flush(page); expect((await h.S(page)).side.patok).toBe(2);
  await h.talkTo(page, 'darma'); await h.flush(page);
  let st = await h.S(page); expect(st.side.patok).toBe(3); expect(st.lore.kincir_serikat).toBe(1);
  // Bab 4
  await h.goto(page, 'village', 600, 360, 'up');
  await page.screenshot({ path: '/tmp/desa.png' });
  await h.talkTo(page, 'girl'); expect((await h.S(page)).stage).toBe(15);
  for (const id of ['farmer', 'merchant', 'child']) { await h.talkTo(page, id); await h.flush(page); }
  st = await h.S(page); expect(st.stage).toBe(16); expect(st.lore.mimpi).toBe(1);
  await h.G(page, () => { const sc = window.__game.sc; sc.npcs.forEach(n => { n.n.wander = 0; n.spr.setPosition(n.spr.x, n.spr.y); }); sc.pl.setPosition(560, 368); sc.pl.dir = 'up'; window.__game.S.time = 10; });
  await h.press(page, 'a', 1, 500); await h.flush(page);       // baca prasasti → tanya tunggu malam
  await h.press(page, 'a', 1, 2200); await h.flush(page); await page.waitForTimeout(800); await h.flush(page);
  st = await h.S(page); expect(st.stage).toBe(17); expect(st.lore.visi_pohon).toBe(1);
  // ke danau lewat pintu barat
  await h.G(page, () => { window.__game.sc.pl.setPosition(30, 590); }); await h.hold(page, 'left', 900);
  await page.waitForFunction(() => window.__game.sc.M.id === 'lake', null, { timeout: 8000 }); await page.waitForTimeout(700); await h.flush(page);
  await h.G(page, () => window.__game.sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)));
  await page.screenshot({ path: '/tmp/lake.png' });
  await h.talkTo(page, 'ratih'); expect((await h.S(page)).lore.ratih).toBe(1);
  // urutan salah lalu benar
  const light = async ([x, y]) => { await h.G(page, ([x, y]) => { const sc = window.__game.sc; sc.pl.setPosition(x, y + 18); sc.pl.dir = 'up'; }, [x, y]); await h.press(page, 'a', 1, 500); await h.flush(page); };
  await light([206, 500]); expect(await h.G(page, () => window.__game.sc.lanSeq.length)).toBe(0);
  for (const p of [[560, 266], [560, 744], [206, 500]]) await light(p);
  expect((await h.S(page)).flags.lake_path).toBe(1);
  await h.G(page, () => { const sc = window.__game.sc; sc.pl.setPosition(924, 524); sc.pl.dir = 'left'; });
  await h.press(page, 'a', 1, 400); await h.press(page, 'a', 1, 300);
  await page.waitForFunction(() => window.__game.sc.M.id === 'temple' && !window.__game.sc.trans, null, { timeout: 8000 }); await page.waitForTimeout(600);
  for (const x of [86, 234]) { await h.G(page, x => { const sc = window.__game.sc; sc.pl.setPosition(x, 92); sc.pl.dir = 'up'; }, x); await h.press(page, 'a', 1, 400); await h.flush(page); }
  await h.G(page, () => { const sc = window.__game.sc; sc.pl.setPosition(160, 92); sc.pl.dir = 'up'; });
  await h.press(page, 'a', 1, 400); await h.flush(page); await page.waitForTimeout(900); await h.flush(page);
  await page.screenshot({ path: '/tmp/temple.png' });
  st = await h.S(page); expect(st.stage).toBe(18); expect(st.inv.bracelet).toBe(1);
  await h.goto(page, 'village', 486, 350, 'up');
  await h.faceNpc(page, 'elder'); await h.press(page, 'a', 1, 400);
  for (let i = 0; i < 12 && !(await h.G(page, () => document.body.innerText.includes('Bagaimana kamu bertanya'))); i++) await h.press(page, 'a', 1, 250);
  await h.press(page, 'down', 1, 150); await h.press(page, 'a', 1, 300); await h.flush(page); await page.waitForTimeout(600); await h.flush(page);
  st = await h.S(page); expect(st.stage).toBe(19); expect(st.flags.bram_choice).toBe('pelan'); expect(st.lore.bram_aku).toBe(1);
  h.noErrors(errors);
});
