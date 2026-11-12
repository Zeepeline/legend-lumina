// Tes performa (Gelombang A): berjalan di beberapa wilayah dengan CPU diperlambat 4× (HP murah),
// mencatat waktu per frame, waktu tiap sistem, jumlah objek, dan memori. Hasil ditulis ke test-results/perf.json.
// Jalankan: PERF=1 npx playwright test tests/perf.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const h = require('./helpers');
const SYS = ['updAmbient', 'updQuestGuide', 'updInteractHint', 'updEnemyBars', 'updTips', 'updMinimap', 'updSound', 'updFog', 'updSecrets', 'updCarry', 'updRanch', 'updSeason', 'updLock', 'updNpc', 'updCritter', 'updEnemy', 'updFeel', 'updShots', 'updPicks', 'updSkills', 'updStatus', 'camStep'];
test.skip(!process.env.PERF, 'tes performa hanya dengan PERF=1');
test('performa', async ({ page }) => {
  test.setTimeout(240000);
  await h.boot(page); await h.newGame(page); await h.flush(page);
  const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await h.G(page, SYS => { OPT.tips = false; window.STREAM_OFF = !!SYS.off; const P = window.__perf = { t: {}, n: 0, frames: [] }; const W = World.prototype;
    for (const k of SYS) { const f = W[k]; if (!f) continue; W[k] = function () { const a = performance.now(); try { return f.apply(this, arguments); } finally { P.t[k] = (P.t[k] || 0) + performance.now() - a; } }; }
    const g = window.__game.sc.game; P.steps = []; let a0 = 0; g.events.on('prestep', () => { a0 = performance.now(); }); g.events.on('postrender', () => { if (a0) P.steps.push(performance.now() - a0); });
    const sc = window.__game.sc, up = sc.update; sc.update = function () { const a = performance.now(); try { return up.apply(this, arguments); } finally { P.frames.push(performance.now() - a); P.n++; } }; }, Object.assign(SYS, { off: !!process.env.NOSTREAM }));
  const out = {};
  for (const [map, x, y, dirs] of [['village', 512, 470, ['left', 'up', 'right', 'down']], ['forest', 420, 300, ['down', 'right', 'up', 'left']], ['kpasar', 700, 700, ['right', 'down', 'left', 'up']], ['deepwood', 700, 420, ['right', 'down', 'left', 'up']]]) {
    await h.goto(page, map, x, y, 'down'); await page.waitForTimeout(800);
    await h.G(page, () => { const P = window.__perf; P.t = {}; P.n = 0; P.frames = []; P.steps = []; P.t0 = performance.now(); window.__game.sc.enemies.forEach(e => e.spr.setPosition(-999, -999)); S.hp = 999; });
    for (const d of dirs) await h.hold(page, d, 1500);
    out[map] = await h.G(page, () => { const P = window.__perf, sc = window.__game.sc, f = P.frames.slice().sort((a, b) => a - b), dt = (performance.now() - P.t0) / 1000;
      const sys = Object.entries(P.t).map(([k, v]) => [k, +(v / P.n).toFixed(3)]).sort((a, b) => b[1] - a[1]).slice(0, 8);
      const S2 = P.steps.slice().sort((a, b) => a - b);
      return { cpu: +(S2.reduce((a, b) => a + b, 0) / S2.length).toFixed(2), cpuP95: +S2[Math.floor(S2.length * .95)].toFixed(2), fps: +(P.n / dt).toFixed(1), updAvg: +(f.reduce((a, b) => a + b, 0) / f.length).toFixed(2), updP95: +f[Math.floor(f.length * .95)].toFixed(2), obj: sc.children.length, bodies: sc.physics.world.bodies.size + sc.physics.world.staticBodies.size, npcs: sc.npcs.length, dom: document.getElementById('ui').querySelectorAll('*').length, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null, texMB: Math.round(Object.values(sc.textures.list).reduce((a, t) => a + (t.source[0] ? t.source[0].width * t.source[0].height * 4 : 0), 0) / 1e6), sys }; });
  }
  fs.mkdirSync('test-results', { recursive: true }); fs.writeFileSync('test-results/perf.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  for (const m in out) expect(out[m].fps).toBeGreaterThan(5);
});
