// Mira (penyihir desa): memakai lembar aslinya, lalu membaca & merapal sebagai pekerjaan
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('Mira memakai lembarnya dan menyelesaikan pekerjaan', async ({ page }) => {
  test.setTimeout(200_000);
  const errors = await h.boot(page); await h.newGame(page);
  const seen = new Set(); let r;
  for (let i = 0; i < 180; i++) {
    r = await h.G(page, () => {
      const g = window.__game, o = g.sc.npcs.find(n => n.n.id === 'mira'); g.S.time = 10; g.sc.weather = 'clear';
      g.sc.pl.setPosition(o.spr.x + 60, o.spr.y + 30);
      return { ch: o.ch, sc: o.baseSc, n: o.jobCount || 0, i: o.jobI || 0, fail: o.jobFail || 0, fr: o.spr.frame.name, st: o.st, x: o.spr.x | 0, y: o.spr.y | 0 };
    });
    seen.add(r.fr.replace(/\d+$/, ''));
    if (/^cast[23]/.test(r.fr) || (i === 6)) await page.screenshot({ path: `test-results/mira-${r.fr.replace(/\d/, '')}.png` });
    if (seen.has('cast') && seen.has('read') && r.n > 1) break;
    await page.waitForTimeout(700);
  }
  console.log(JSON.stringify(r), [...seen].join());
  expect(r.ch).toBe('s_mira');
  expect(seen.has('read')).toBe(true);
  expect(seen.has('cast')).toBe(true);
  expect(r.n).toBeGreaterThan(0);
  h.noErrors(errors);
});
