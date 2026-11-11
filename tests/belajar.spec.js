// Sistem belajar jurus: awal tanpa sihir, belajar dari guru, penguasaan, ganti sihir
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('belajar jurus dari guru', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await h.boot(page); await h.newGame(page);
  let st = await h.S(page); expect(st.learn.fire).toBeFalsy();
  await h.press(page, 'b', 1, 200); expect((await h.S(page)).mp).toBe(st.mp); // belum bisa sihir
  await h.faceNpc(page, 'elder'); await h.press(page, 'a', 1, 400);
  for (let i = 0; i < 30 && !(await h.G(page, () => document.body.innerText.includes('Pelajari Bola Api'))); i++) await h.press(page, 'a', 1, 220);
  await h.press(page, 'a', 1, 300); await h.flush(page);
  st = await h.S(page); expect(st.stage).toBe(1); expect(st.learn.fire).toBe(1); expect(st.spell).toBe('fire');
  await h.G(page, () => { const S = window.__game.S; S.mp = 99; window.__game.press('b'); });
  await page.waitForTimeout(300); expect((await h.S(page)).mast.fire).toBe(1);
  // guru lain: Nila di Puncak Beku (berbayar? tidak) & Guru Tua (300 G)
  await h.G(page, () => { const S = window.__game.S; S.stage = 27; S.gold = 500; S.lv = 30; });
  await h.goto(page, 'kakademi', 420, 660, 'up');
  await h.talkTo(page, 'ka4'); // jawab Ya otomatis lewat flush
  st = await h.S(page); expect(st.learn.holy).toBe(1); expect(st.gold).toBe(200);
  // ganti sihir lewat menu jurus & pakai
  await h.G(page, () => { const S = window.__game.S; S.spell = 'holy'; S.mp = 99; window.__game.press('b'); });
  await page.waitForTimeout(400); expect((await h.S(page)).mast.holy).toBe(1);
  await h.press(page, 'menu', 1, 300); await h.press(page, 'down', 3, 120); await h.press(page, 'a', 1, 400);
  expect(await h.G(page, () => document.body.innerText.includes('JURUS ARKA'))).toBe(true);
  await h.press(page, 'b', 1, 300); await h.press(page, 'b', 1, 300);
  h.noErrors(errors);
});
