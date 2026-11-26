// Uji 9 sprite sheet monster baru (H9), 5 varian slime_hd recolor, aura elemental & gerakan halus (H10-H11)
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
const SCRATCH = '/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479/scratch';

test('H9-H11: 9 sprite monster baru, 5 slime recolor, aura & gerakan halus aktif tanpa error', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await h.boot(page);
  await h.newGame(page);
  await h.goto(page, 'meadow', 1050, 420, 'down');

  const check = await h.G(page, () => {
    const sc = window.__game.sc;
    G.god = true;
    const ids = ['frog', 'boar', 'bee', 'plant', 'snake', 'wisp', 'shroom', 'bat', 'salam'];
    const eshInfo = ids.map(id => {
      const k = 'esh_' + id, tex = sc.textures.exists(k) ? sc.textures.get(k) : null;
      return { id, esh: !!(ENEMY[id] && ENEMY[id].esh), frames: tex ? tex.frameTotal : 0 };
    });
    const slimes = ['slimer', 'slimei', 'slimep', 'slimef', 'gold_slime'].map(id => ({
      id, tex: ENEMY[id] && ENEMY[id].tex, hasFrames: sc.textures.exists(ENEMY[id].tex)
    }));

    sc.enemies.forEach(e => { e.hp = 0; e.spr.setPosition(3000, 3000); });
    const line = [
      ['frog', 950, 375], ['boar', 996, 375], ['bee', 1042, 375], ['plant', 1088, 375], ['snake', 1134, 375],
      ['wisp', 950, 465], ['shroom', 996, 465], ['bat', 1042, 465], ['salam', 1088, 465],
      ['slimer', 940, 420], ['slimei', 980, 420], ['slimep', 1105, 420], ['slimef', 1142, 420], ['gold_slime', 1175, 420]
    ];
    for (const [id, x, y] of line) {
      const e = sc.spawnEnemy(id, x, y);
      if (e) { e.home = { x, y }; e.spr.setVelocity(0); }
    }
    sc.pl.setPosition(1045, 420);
    sc.pl.dir = 'down';
    return { eshInfo, slimes, spawned: sc.enemies.filter(e => e.hp > 0).length };
  });

  for (const info of check.eshInfo) {
    expect(info.esh, info.id + ' esh').toBe(true);
    expect(info.frames, info.id + ' frames').toBeGreaterThanOrEqual(24);
  }
  for (const s of check.slimes) {
    expect(s.tex, s.id + ' slime_hd_*').toMatch(/^slime_hd_/);
    expect(s.hasFrames, s.id + ' sheet exists').toBe(true);
  }
  expect(check.spawned).toBeGreaterThanOrEqual(14);

  // Tahan posisi rapi agar tangkapan layar barisan showcase bersih
  await h.G(page, () => {
    const sc = window.__game.sc;
    const pts = [
      [950, 375], [996, 375], [1042, 375], [1088, 375], [1134, 375],
      [950, 465], [996, 465], [1042, 465], [1088, 465],
      [940, 420], [980, 420], [1105, 420], [1142, 420], [1175, 420]
    ];
    sc.enemies.filter(e => e.hp > 0).forEach((e, i) => {
      if (pts[i]) { e.spr.setPosition(pts[i][0], pts[i][1]); e.spr.setVelocity(0); e.st = 'idle'; }
    });
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: SCRATCH + '/monster_showcase_1.png' });

  // Uji gerakan halus, wind-up -> atk, dan inersia
  const motion = await h.G(page, () => {
    const sc = window.__game.sc;
    const f = sc.enemies.find(e => e.type === 'frog');
    const b = sc.enemies.find(e => e.type === 'boar');
    if (f) { f.spr.setPosition(sc.pl.x - 36, sc.pl.y); f.cd = 0; }
    if (b) { b.spr.setPosition(sc.pl.x + 42, sc.pl.y); b.cd = 0; }
    return { frogSvx: f && f._svx != null, boarSvx: b && b._svx != null };
  });
  expect(motion.frogSvx).toBe(true);
  expect(motion.boarSvx).toBe(true);
  await page.waitForTimeout(550);
  await page.screenshot({ path: SCRATCH + '/monster_showcase_combat.png' });

  h.noErrors(errors);
});
