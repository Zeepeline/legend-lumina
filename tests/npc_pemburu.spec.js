// Pemburu Raka (hutan): menarik busur & menembak sasaran, lalu duduk
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
for (const [act, anim, need] of [['aim', 'bow', ['bow0', 'bow2', 'bow3']], ['rest', 'sit', ['sit0']]]) {
  test('Pemburu Raka: ' + act, async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await h.boot(page); await h.newGame(page);
    await h.goto(page, 'forest', 640, 150, 'up');
    await page.waitForTimeout(1500);
    const pre = await h.G(page, a => {
      const g = window.__game, o = g.sc.npcs.find(n => n.n.id === 'hunter'), K = jobOf(g.sc, o), i = K.J.steps.findIndex(s => s.do === a), st = K.J.steps[i];
      for (const e of g.sc.enemies || []) if (e.spr && e.spr.setPosition) e.spr.setPosition(-900, -900);
      const bad = K.J.steps.map((s, j) => npcFindPath(g.sc, o.home.x, o.home.y, s.x + K.ox, s.y + K.oy) ? -1 : j).filter(j => j >= 0);
      o.spr.setPosition(st.x + K.ox + 10, st.y + K.oy); o.jobI = i; o.st = 'think'; o.t = .1; g.sc.pl.setPosition(st.x + K.ox + 20, st.y + K.oy + 60);
      return { bad, map: g.sc.M.id, pin: jobPinned(o, K) };
    }, act);
    await h.G(page, () => { const o = window.__game.sc.npcs.find(n => n.n.id === 'hunter'), p = jobPinned; window.jobPinned = (x, K) => x === o ? false : p(x, K); });
    const fr = new Set(); let r;
    for (let i = 0; i < 160 && !need.every(n => fr.has(n)); i++) {
      r = await h.G(page, () => { const g = window.__game, o = g.sc.npcs.find(n => n.n.id === 'hunter'); g.S.time = 10; g.sc.weather = 'clear'; g.S.hp = 100;
        return { ch: o.ch, sc: o.baseSc, f: o.spr.frame.name, flip: o.spr.flipX, st: o.st, x: o.spr.x | 0, y: o.spr.y | 0, act: o.goal && o.goal.act }; });
      if (r.f.startsWith(anim) && !fr.has(r.f)) await page.screenshot({ path: `test-results/raka-${r.f}.png` });
      fr.add(r.f); await page.waitForTimeout(150);
    }
    console.log(act, JSON.stringify(pre), JSON.stringify(r), [...fr].join());
    expect(pre.bad).toEqual([]); expect(r.ch).toBe('s_hunter'); expect(r.sc).toBe(1);
    for (const n of need) expect(fr.has(n), n).toBe(true);
    if (act === 'aim') expect(r.flip).toBe(true);
    h.noErrors(errors);
  });
}
