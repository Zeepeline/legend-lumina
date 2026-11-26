// Jalan 8 arah tokoh utama: frame & cermin benar, fase langkah tidak mengulang saat berganti arah, jalan samping 6 frame.
const { test, expect } = require('@playwright/test');
const { loadGame, goto, G, noErrors } = require('./helpers');
test('jalan 8 arah memakai frame dan cermin yang benar', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await loadGame(page);
  await goto(page, 'meadow', 1080, 420);
  const r = await G(page, () => {
    const pl = window.__game.sc.pl, sc = window.__game.sc, out = {}, h = .016;
    const run = (vx, vy, dir, n) => {
      const seen = new Set(); pl.dir = dir;
      for (let i = 0; i < n; i++) { pl.body.velocity.set(vx, vy); heroFrame(sc, h); seen.add(pl.frame.name); }
      return { last: pl.frame.name, flip: pl.flipX, seen: [...seen] };
    };
    const C = { e: [70, 0, 'right'], se: [50, 50, 'down'], s: [0, 70, 'down'], sw: [-50, 50, 'down'],
      w: [-70, 0, 'left'], nw: [-50, -50, 'up'], n: [0, -70, 'up'], ne: [50, -50, 'up'] };
    for (const k in C) { run(...C[k], 40); out[k] = run(...C[k], 90); }
    run(70, 0, 'right', 60); const p0 = pl._ha.ph; run(50, 50, 'down', 12);
    out.phase = [p0, pl._ha.ph]; pl.body.velocity.set(0, 0); heroFrame(sc, h); out.idle = pl.frame.name;
    return out;
  });
  const want = { e: ['walk8s_', false], se: ['walk8ds_', false], s: ['walk8d_', false], sw: ['walk8ds_', true],
    w: ['walk8s_', true], nw: ['walk8us_', true], n: ['walk8u_', false], ne: ['walk8us_', false] };
  for (const k in want) {
    expect(r[k].seen.every(f => f.startsWith(want[k][0])), k + ' ' + r[k].seen).toBe(true);
    expect(r[k].flip, k).toBe(want[k][1]);
    expect(r[k].seen.length, k).toBe(want[k][0] === 'walk8s_' ? 6 : 8);
  }
  const adv = (r.phase[1] - r.phase[0] + 1) % 1; /* 12 langkah × 16 ms ≈ 0,3 putaran */
  expect(adv).toBeGreaterThan(.1); expect(adv).toBeLessThan(.5);
  expect(r.idle).toMatch(/^(idle|blink)_down/);
  noErrors(errors);
});
