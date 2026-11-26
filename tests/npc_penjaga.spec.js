// Penjaga desa: memakai lembar kesatria, menebas boneka latihan & duduk istirahat
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('Penjaga berlatih di boneka lalu istirahat', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { const o = window.__game.sc.npcs.find(n => n.n.id === 'guard'); o.spr.setPosition(300, 470); o.jobI = JOBS.village.guard.steps.findIndex(s => s.do === 'drill'); o.st = 'think'; o.t = .1; });
  const fr = new Set(); let r;
  for (let i = 0; i < 160 && !fr.has('sit0'); i++) {
    r = await h.G(page, () => {
      const g = window.__game, o = g.sc.npcs.find(n => n.n.id === 'guard'); g.S.time = 10; g.sc.weather = 'clear'; g.sc.pl.setPosition(250, 520);
      return { ch: o.ch, sc: o.baseSc, f: o.spr.frame.name, x: o.spr.x | 0, y: o.spr.y | 0, flip: o.spr.flipX };
    });
    if (/^(slash|sit)/.test(r.f) && !fr.has(r.f)) { await page.screenshot({ path: `test-results/jaga-${r.f}.png` }); expect(r.flip).toBe(false); }
    fr.add(r.f); await page.waitForTimeout(250);
  }
  console.log(JSON.stringify(r), [...fr].join());
  expect(r.ch).toBe('s_guard'); expect(r.sc).toBe(1);
  expect(fr.has('slash0') && fr.has('slash3')).toBe(true); expect(fr.has('sit0')).toBe(true);
  h.noErrors(errors);
});
