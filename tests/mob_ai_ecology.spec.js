// Tes Paket A (AI, unstuck, soft separation, faksi, bala bantuan, flipX) & Paket B (safe spawn/zone, ekologi, respawn habitat)
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('Paket A: unstuck lintas frame, anti-tumpuk, faksi, bala bantuan, dan arah flipX', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.goto(page, 'meadow', 1050, 420, 'down');

  // 1. Unstuck tidak terpicu palsu di tanah lapang, namun aktif saat tertahan tembok
  const unstuckRes = await h.G(page, async () => {
    const sc = window.__game.sc, pl = sc.pl;
    sc.enemies.forEach(e => { e.hp = 0; e.spr.destroy(); e.sh.destroy(); });
    sc.enemies = [];
    pl.inv = 999;
    const w = sc.spawnEnemy('wolf', pl.x, pl.y - 110, { exact: 1 });
    return !!w;
  });
  expect(unstuckRes).toBe(true);
  await page.waitForTimeout(850);
  const openStuck = await h.G(page, () => {
    const sc = window.__game.sc, w = sc.enemies.find(e => e.type === 'wolf' && e.hp > 0);
    return { ok: !!w, unstuckT: w ? (w._unstuckT || 0) : -1 };
  });
  expect(openStuck.ok).toBe(true);
  expect(openStuck.unstuckT).toBe(0);

  const wallTriggered = await h.G(page, () => {
    const sc = window.__game.sc, pl = sc.pl;
    sc.enemies.forEach(e => { e.hp = 0; e.spr.destroy(); e.sh.destroy(); });
    sc.enemies = [];
    sc.wall(pl.x - 40, pl.y - 46, 80, 14);
    const g = sc.spawnEnemy('goblin', pl.x, pl.y - 54, { exact: 1 });
    return !!g;
  });
  expect(wallTriggered).toBe(true);
  await page.waitForFunction(() => {
    const g = window.__game.sc.enemies.find(e => e.type === 'goblin' && e.hp > 0);
    return g && (g._unstuckT || 0) > 0;
  }, null, { timeout: 3000 });

  // 2. Soft separation pada 4 slime di titik yang sama
  await h.G(page, () => {
    const sc = window.__game.sc, pl = sc.pl;
    sc.enemies.forEach(e => { e.hp = 0; e.spr.destroy(); e.sh.destroy(); });
    sc.enemies = [];
    for (let i = 0; i < 4; i++) sc.spawnEnemy('slime', pl.x, pl.y - 170, { exact: 1 });
  });
  await page.waitForTimeout(850);
  const avgSep = await h.G(page, () => {
    const L = window.__game.sc.enemies.filter(e => e.hp > 0 && e.type === 'slime');
    let sum = 0, cnt = 0;
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      sum += Math.hypot(L[i].spr.x - L[j].spr.x, L[i].spr.y - L[j].spr.y); cnt++;
    }
    return cnt ? sum / cnt : 0;
  });
  expect(avgSep).toBeGreaterThan(12);

  // 3. Koordinasi faksi lintas tipe, bala bantuan walau total musuh > 12, & arah flipX
  await h.goto(page, 'forest', 760, 440, 'down');
  const allyCheck = await h.G(page, () => {
    const sc = window.__game.sc, pl = sc.pl;
    for (const e of sc.enemies) if (Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) < 320) { e.hp = 0; e.spr.destroy(); e.sh.destroy(); }
    sc.enemies = sc.enemies.filter(e => e.hp > 0);
    const g = sc.spawnEnemy('goblin', pl.x - 40, pl.y - 20, { exact: 1 });
    const a = sc.spawnEnemy('goblin_archer', pl.x - 95, pl.y - 20, { exact: 1 });
    const sh = sc.spawnEnemy('goblin_shaman', pl.x - 70, pl.y + 10, { exact: 1 });
    return {
      fac: sameFaction(g, a) && sameFaction(g, sh),
      aliveCount: sc.enemies.filter(o => o.hp > 0).length,
      gid: g.spr.x,
    };
  });
  expect(allyCheck.fac).toBe(true);
  expect(allyCheck.aliveCount).toBeGreaterThan(12);

  await page.waitForTimeout(450);
  const factionRes = await h.G(page, () => {
    const sc = window.__game.sc;
    const ar = sc.enemies.find(e => e.type === 'goblin_archer' && e.hp > 0 && Math.hypot(e.spr.x - sc.pl.x, e.spr.y - sc.pl.y) < 160);
    const sh = sc.enemies.find(e => e.type === 'goblin_shaman' && e.hp > 0 && Math.hypot(e.spr.x - sc.pl.x, e.spr.y - sc.pl.y) < 160);
    const g = sc.enemies.find(e => e.type === 'goblin' && e.hp > 0 && Math.hypot(e.spr.x - sc.pl.x, e.spr.y - sc.pl.y) < 160);
    if (g) { g.hp = Math.max(1, Math.floor(g.max * 0.25)); g.st = 'idle'; g.t = 0; }
    return { arPack: !!(ar && ar.packAggro), shPack: !!(sh && sh.packAggro), hasG: !!g };
  });
  expect(factionRes.arPack).toBe(true);
  expect(factionRes.shPack).toBe(true);
  expect(factionRes.hasG).toBe(true);

  await page.waitForFunction(
    () => window.__game.sc.enemies.filter(
      e => e.type === 'goblin' && e.hp > 0 && Math.hypot(e.spr.x - window.__game.sc.pl.x, e.spr.y - window.__game.sc.pl.y) < 180
    ).length >= 2,
    null,
    { timeout: 2500 }
  );
  const backupRes = await h.G(page, () => {
    const sc = window.__game.sc;
    const callers = sc.enemies.filter(e => e.type === 'goblin' && e.hp > 0 && Math.hypot(e.spr.x - sc.pl.x, e.spr.y - sc.pl.y) < 180);
    const safeOk = callers.every(e => !isWaterAt(sc.M, e.spr.x, e.spr.y) && !isWallAt(sc, e.spr.x, e.spr.y));
    const arch = sc.spawnEnemy('goblin_archer', 820, 440, { exact: 1 });
    const wolf = sc.spawnEnemy('wolf', 820, 460, { exact: 1 });
    setEnemyFlipX(sc, arch, -40); const archL = arch.spr.flipX;
    setEnemyFlipX(sc, arch, 40); const archR = arch.spr.flipX;
    setEnemyFlipX(sc, wolf, -40); const wolfL = wolf.spr.flipX;
    setEnemyFlipX(sc, wolf, 40); const wolfR = wolf.spr.flipX;
    return { count: callers.length, safeOk, archL, archR, wolfL, wolfR };
  });
  expect(backupRes.count).toBeGreaterThanOrEqual(2);
  expect(backupRes.safeOk).toBe(true);
  expect(backupRes.archL).toBe(true); expect(backupRes.archR).toBe(false);
  expect(backupRes.wolfL).toBe(false); expect(backupRes.wolfR).toBe(true);
  h.noErrors(errors);
});

test('Paket B: safe spawn, safe zone desa, ekologi malam & hujan, dan respawn habitat', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.goto(page, 'meadow', 660, 910, 'up');

  // 1. Safe Spawn di tengah danau & Safe Zone Desa Kincir
  const safeRes = await h.G(page, () => {
    const sc = window.__game.sc;
    const b = sc.spawnEnemy('boar', 660, 730); // tepat di tengah danau selatan Padang Angin
    const dryOk = !!(b && !isWaterAt(sc.M, b.spr.x, b.spr.y) && !isWallAt(sc, b.spr.x, b.spr.y));
    const movedOut = b ? (b.spr.x !== 660 || b.spr.y !== 730) : false;
    const intr = sc.spawnEnemy('wolf', 300, 260, { exact: 1 });
    sc.updEnemy(intr, 0.016, false);
    return { dryOk, movedOut, leashedInTown: !!intr.leash };
  });
  expect(safeRes.dryOk).toBe(true);
  expect(safeRes.movedOut).toBe(true);
  expect(safeRes.leashedInTown).toBe(true);

  // 2. Ekologi Malam (boar tidur + bonus SERGAP! x1.35) & Hujan (katak lebih cepat)
  await h.G(page, () => {
    const sc = window.__game.sc;
    sc.enemies.forEach(e => { e.hp = 0; e.spr.destroy(); e.sh.destroy(); });
    sc.enemies = [];
    window.__game.S.time = 22;
    sc.pl.setPosition(1040, 420);
    sc.spawnEnemy('boar', 1130, 420, { exact: 1 });
  });
  await page.waitForTimeout(200);
  const sleepRes = await h.G(page, () => {
    const sc = window.__game.sc, b = sc.enemies.find(e => e.type === 'boar' && e.hp > 0);
    const wasSleeping = !!(b && b.sleeping);
    const hp0 = b.hp;
    sc.hitEnemy(b, 20, false, 1, 0);
    const pops = [...document.querySelectorAll('.pop')].map(el => el.textContent);
    const dmg = hp0 - b.hp;
    return { wasSleeping, woke: !b.sleeping, packAggro: !!b.packAggro, dmg, sergapPop: pops.some(t => t.includes('SERGAP')) };
  });
  expect(sleepRes.wasSleeping).toBe(true);
  expect(sleepRes.woke).toBe(true);
  expect(sleepRes.packAggro).toBe(true);
  expect(sleepRes.sergapPop).toBe(true);
  expect(sleepRes.dmg).toBeGreaterThanOrEqual(20);

  const rainSpd = await h.G(page, () => {
    const sc = window.__game.sc;
    sc.enemies.forEach(e => { e.hp = 0; e.spr.destroy(); e.sh.destroy(); });
    sc.enemies = [];
    window.__game.S.time = 12;
    sc.pl.setPosition(1040, 420);
    const f = sc.spawnEnemy('frog', 1120, 420, { exact: 1 });
    sc.weather = 'clear'; f.alert = 2; f.st = 'idle'; f.t = 0; f.cd = 5;
    f._svx = null; f._svy = null;
    sc.updEnemy(f, 0.016, false);
    const vClear = Math.hypot(f.spr.body.velocity.x, f.spr.body.velocity.y);
    sc.weather = 'rain'; f.st = 'idle'; f.t = 0;
    f._svx = null; f._svy = null;
    sc.updEnemy(f, 0.016, false);
    const vRain = Math.hypot(f.spr.body.velocity.x, f.spr.body.velocity.y);
    sc.weather = 'clear';
    return { vClear, vRain };
  });
  expect(rainSpd.vRain).toBeGreaterThan(rainSpd.vClear);

  // 3. Respawn Habitat Off-Screen (>= 6 jam game & > 420 px dari Arka)
  const respRes = await h.G(page, () => {
    const sc = window.__game.sc, S = window.__game.S;
    sc.enemies.forEach(e => { e.hp = 0; e.spr.destroy(); e.sh.destroy(); });
    sc.enemies = [];
    S.slain = {}; S.slainT = {};
    sc.pl.setPosition(1040, 420);
    const b = sc.spawnEnemy('boar', 1120, 420, { exact: 1 });
    const key = b._spawnKey;
    sc.hitEnemy(b, 9999, false, 1, 0);
    const slainRecorded = !!(S.slain.meadow && S.slain.meadow[key] && S.slainT.meadow && S.slainT.meadow[key]);
    sc.pl.setPosition(220, 880); // pindah jauh (> 420 px dari 1120, 420)
    S.time += 3;
    sc._respT = 0; sc.updHabitatRespawn(0.1);
    const tooEarly = !!(S.slain.meadow && S.slain.meadow[key]);
    S.day += 1; // maju melewati batas 6 jam
    sc._respT = 0; sc.updHabitatRespawn(0.1);
    const respawned = !(S.slain.meadow && S.slain.meadow[key]) && sc.enemies.some(e => e.hp > 0 && e._spawnKey === key);
    return { slainRecorded, tooEarly, respawned };
  });
  expect(respRes.slainRecorded).toBe(true);
  expect(respRes.tooEarly).toBe(true);
  expect(respRes.respawned).toBe(true);
  h.noErrors(errors);
});
