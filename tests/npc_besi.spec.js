// Pak Besi menempa dengan lembar sprite: menempel di landasan saat menempa, kembali ke titik jalan sesudahnya
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('Pak Besi menempa di landasan lalu lanjut bekerja', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = await h.boot(page); await h.newGame(page);
  const fr = new Set(); let at = null, after = null, r, shot = 0;
  for (let i = 0; i < 140; i++) {
    r = await h.G(page, () => {
      const g = window.__game, o = g.sc.npcs.find(n => n.n.id === 'smith'); g.S.time = 10; g.sc.weather = 'clear';
      g.sc.pl.setPosition(700, 500);
      return { ch: o.ch, sc: o.baseSc, n: o.jobCount || 0, f: o.spr.frame.name, st: o.st, x: o.spr.x | 0, y: o.spr.y | 0, at: !!o.atPos, tex: !!g.sc.textures.exists('anvil_besi'), c: o.spr.body.checkCollision.none, tool: !!o.tool, iron: !!(o.carry && o.carry.visible) };
    });
    if (r.at && r.f.startsWith('hammer')) { at = r; fr.add(r.f); if (shot < 4 && fr.size > shot) { shot = fr.size; await page.screenshot({ path: `test-results/besi-${r.f}.png` }); } }
    else if (at && !r.at) { after = after || r; if (r.n > at.n + 1 || r.f.startsWith('walk')) break; }
    if (at && after) break;
    await page.waitForTimeout(350);
  }
  console.log(JSON.stringify({ at, after, fr: [...fr] }));
  expect(r.ch).toBe('s_smith'); expect(r.sc).toBe(1); expect(r.tex).toBe(true);
  expect(at && [at.x, at.y]).toEqual([753, 467]); expect(at.tool).toBe(false); expect(at.iron).toBe(false);
  expect(fr.size).toBeGreaterThan(1);
  expect(after).toBeTruthy(); expect(after.c).toBe(false);
  h.noErrors(errors);
});
