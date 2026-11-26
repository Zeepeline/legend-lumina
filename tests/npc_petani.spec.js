// Pak Darto: menyiram (kaleng dari lembar, bukan ikon), mencangkul, memanen, istirahat
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
for (const [act, anim] of [['water', 'water'], ['hoe', 'hoe'], ['harvest', 'harvest'], ['rest', 'sit']]) {
  test('Pak Darto: ' + act, async ({ page }) => {
    test.setTimeout(90_000);
    const errors = await h.boot(page); await h.newGame(page);
    await h.G(page, a => {
      const g = window.__game, o = g.sc.npcs.find(n => n.n.id === 'farmer'), i = JOBS.village.farmer.steps.findIndex(s => s.do === a), st = JOBS.village.farmer.steps[i];
      o.spr.setPosition(st.x + 12, st.y); o.jobI = i; o.st = 'think'; o.t = .1; if (a === 'water') jobCarry(g.sc, o, 'watercan');
      g.sc.pl.setPosition(st.x + 50, st.y + 45);
    }, act);
    let r, ok = 0, bad = 0;
    for (let i = 0; i < 120 && ok < 6; i++) {
      r = await h.G(page, () => {
        const g = window.__game, o = g.sc.npcs.find(n => n.n.id === 'farmer'); g.S.time = 10; g.sc.weather = 'clear';
        return { ch: o.ch, sc: o.baseSc, f: o.spr.frame.name, carry: !!(o.carry && o.carry.visible), tool: !!o.tool, dir: o.dir, flip: o.spr.flipX };
      });
      if (r.f.startsWith(anim) && !r.f.startsWith('walk')) { ok++; if (act === 'water' && r.carry || r.tool) bad++; if (ok === 3) await page.screenshot({ path: `test-results/darto-${act}.png` }); }
      await page.waitForTimeout(200);
    }
    console.log(act, JSON.stringify(r), ok, bad);
    expect(r.ch).toBe('s_farmer'); expect(r.sc).toBe(1); expect(ok).toBeGreaterThan(2); expect(bad).toBe(0);
    h.noErrors(errors);
  });
}
