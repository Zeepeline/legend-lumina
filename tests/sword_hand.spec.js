// Regresi: pedang Arka terkunci di tangan saat menebas, tersembunyi sesudahnya, dan tampil di punggung saat diam.
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('pedang digenggam saat menebas & di punggung saat diam', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  const idle = await h.G(page, () => { const sc = window.__game.sc; sc.pl.dir = 'up'; return new Promise(r => setTimeout(() => r(!!(sc._sheath && sc._sheath.visible)), 200)); });
  expect(idle).toBe(true);
  const hit = await h.G(page, () => new Promise(r => {
    const sc = window.__game.sc, pl = sc.pl; pl.dir = 'right'; pl.atkCd = 0; sc.attack();
    setTimeout(() => {
      const w = sc.sword, dx = w.x - pl.x, dy = w.y - pl.y;
      r({ visible: w.visible, dx, dy, sheath: !!(sc._sheath && sc._sheath.visible) });
    }, 120);
  }));
  expect(hit.visible).toBe(true);
  expect(hit.dx).toBeGreaterThan(0); expect(hit.dx).toBeLessThan(20); // di depan badan, dekat telapak tangan
  expect(hit.dy).toBeGreaterThan(-24); expect(hit.dy).toBeLessThan(-6);
  expect(hit.sheath).toBe(false); // pedang di tangan → sarung punggung disembunyikan
  await page.waitForTimeout(600); // selesai menebas → siaga: pedang tetap di tangan, belum di punggung
  const rest = await h.G(page, () => { const sc = window.__game.sc; return { sw: sc.sword.visible, hold: !!sc.sword._hold, sheath: !!(sc._sheath && sc._sheath.visible) }; });
  expect(rest).toEqual({ sw: true, hold: true, sheath: false });
  await page.waitForTimeout(2300); // siaga habis → disarungkan ke punggung
  const back = await h.G(page, () => { const sc = window.__game.sc; return { sw: sc.sword.visible, sheath: !!(sc._sheath && sc._sheath.visible) }; });
  expect(back).toEqual({ sw: false, sheath: true });
  h.noErrors(errors);
});

test('baris serangan skin slave berwarna sama dengan baris diam', async () => {
  // regresi hero_slave.png: baris salinan biru (serangan dst.) harus sudah diwarnai ulang → tools/fix_slave_rows.py tak menemukan baris identik
  const { execFileSync } = require('child_process');
  const out = execFileSync('venv/bin/python', ['tools/fix_slave_rows.py', '--dry', '/dev/null'], { cwd: process.cwd() }).toString();
  expect(out).toContain('baris disalin: []');
});
