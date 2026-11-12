// Gelombang 1 (docs/arsip/PROGRES_FITUR.md): kesulitan, kecepatan teks, perbandingan perlengkapan, coba lagi boss, ikon interaksi, bilah HP musuh, cadangan save
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 1', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = await h.boot(page); await h.newGame(page);
  // ikon interaksi muncul di depan Tetua Bram & tombol berubah jadi BICARA
  await h.faceNpc(page, 'elder'); await page.waitForTimeout(400);
  expect(await h.G(page, () => document.getElementById('bA').innerText)).toContain('BICARA');
  // kesulitan Sulit: kerusakan ke pemain lebih besar daripada Santai
  const hit = async d => h.G(page, d => { OPT.diff = d; const sc = window.__game.sc; window.__game.S.hp = 500; sc.pl.inv = 0; sc.pl.dead = false; const b = window.__game.S.hp; sc.hurtPlayer(40, sc.pl.x + 10, sc.pl.y); return b - window.__game.S.hp; }, d);
  const easy = await hit(0); await page.waitForTimeout(900); const hard = await hit(2); await page.waitForTimeout(900);
  console.log('santai', easy, 'sulit', hard); expect(hard).toBeGreaterThan(easy);
  await h.G(page, () => { OPT.diff = 1; });
  // perbandingan perlengkapan di tas
  await h.G(page, () => { window.__game.S.inv.isword = 1; });
  await h.press(page, 'bag', 1, 400); await h.press(page, 'right', 1, 300);
  for (let i = 0; i < 6 && !(await h.G(page, () => /Serang ▲/.test(document.body.innerText))); i++) await h.press(page, 'down', 1, 200);
  expect(await h.G(page, () => /Serang ▲\+\d/.test(document.body.innerText))).toBe(true);
  await h.press(page, 'b', 1, 300);
  // bilah HP musuh
  await h.G(page, () => { window.__game.S.stage = 2; }); await h.goto(page, 'forest', 300, 330, 'up');
  await h.G(page, () => { const sc = window.__game.sc, e = sc.enemies[0]; e.hp = Math.floor(e.max / 2); e.spr.setPosition(300, 290); sc.updEnemyBars(); });
  expect(await h.G(page, () => window.__game.sc.eBar.commandBuffer.length)).toBeGreaterThan(0);
  // cadangan save: save utama rusak → dipulihkan dari cadangan
  const ok = await h.G(page, () => { const sc = window.__game.sc; saveGame(sc); localStorage.setItem(SAVE_KEY + '_bk0', localStorage.getItem(SAVE_KEY)); localStorage.setItem(SAVE_KEY, '{rusak'); return hasSave() && loadSave(); });
  expect(ok).toBe(true);
  h.noErrors(errors);
});
