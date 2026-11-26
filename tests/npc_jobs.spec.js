// NPC desa benar-benar bekerja: menyelesaikan langkah JOBS (bukan mondar-mandir) & berhenti di titik kerja
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('NPC desa menyelesaikan pekerjaan berurutan', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { /* bebas pin misi agar semua berjalan; waktu & cuaca dikunci siang cerah */
    window.__game.S.time = 10; window.__game.sc.weather = 'clear';
    for (const o of window.__game.sc.npcs) o.seen = { act: 0, n: 0 };
  });
  for (let i = 0; i < 100; i++) {
    await h.G(page, () => {
      const g = window.__game; g.S.time = 10; g.sc.weather = 'clear';
      for (const o of g.sc.npcs) { o.seen.n++; if (o.st === 'act' && o.goal && o.goal.act === 'job') o.seen.act++; }
    });
    if (i === 60) await page.screenshot({ path: 'test-results/npc-jobs.png' });
    await page.waitForTimeout(1000);
  }
  const r = await h.G(page, () => window.__game.sc.npcs.map(o => ({
    id: o.n.id, job: !!(JOBS.village[o.n.id]), pinned: !!jobOf(window.__game.sc, o) && jobPinned(o, jobOf(window.__game.sc, o)),
    done: o.jobCount || 0, work: o.seen.act, n: o.seen.n, st: o.st, i: o.jobI || 0, fail: o.jobFail || 0,
    x: Math.round(o.spr.x), y: Math.round(o.spr.y),
  })));
  console.log(r.map(x => JSON.stringify(x)).join('\n'));
  const workers = r.filter(x => x.job && !x.pinned);
  expect(workers.length).toBeGreaterThan(5);
  for (const w of workers) expect(w.done, w.id + ' tidak menyelesaikan pekerjaan').toBeGreaterThan(0);
  h.noErrors(errors);
});
test('menyapa di jalan tidak menghitung pekerjaan selesai', async ({ page }) => {
  await h.boot(page); await h.newGame(page);
  const n = await h.G(page, () => {
    const sc = window.__game.sc, o = sc.npcs.find(n => n.n.id === 'smith'); window.__game.S.time = 10;
    o.goal = jobGoal(sc, o, jobOf(sc, o)); o.jobCount = 0; o.st = 'act'; o.t = 0; sc.npcBrain(o, .1, false, 999);
    return o.jobCount;
  });
  expect(n).toBe(0);
});
test('semua titik kerja desa terjangkau', async ({ page }) => {
  await h.boot(page); await h.newGame(page);
  const bad = await h.G(page, () => {
    const sc = window.__game.sc, out = [];
    for (const o of sc.npcs) { const J = JOBS.village[o.n.id]; if (!J) continue;
      J.steps.forEach((s, i) => { if (!npcFindPath(sc, o.home.x, o.home.y, s.x, s.y)) out.push(o.n.id + '#' + i); }); }
    return out;
  });
  expect(bad).toEqual([]);
});
