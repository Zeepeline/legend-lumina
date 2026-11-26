// Uji fitur berat Dimraeth H1-H7 + tangkapan layar visual ke scratch/
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
const SCRATCH = '/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479/scratch';

test('H1-H7 fitur berat Dimraeth berjalan penuh & tanpa galat', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await h.boot(page);
  await h.newGame(page);

  // H7: Posisikan Arka di sebelah Kesatria Arvan (kn1) di Desa Lumina & cek dimensi sprite 384x480
  const knCheck = await h.G(page, () => {
    const img = IMGEL.npc_sheet_kn1;
    const sc = window.__game.sc;
    const kn = sc.npcs.find(n => n.n && n.n.id === 'kn1');
    if (kn) {
      sc.pl.setPosition(kn.spr.x - 24, kn.spr.y + 4);
      sc.pl.dir = 'right';
      sc.pl.flipX = false;
    }
    return { w: img && img.width, h: img && img.height, hasKn: !!kn };
  });
  expect(knCheck.hasKn).toBe(true);
  expect(knCheck.w).toBe(384);
  expect(knCheck.h).toBe(480);
  await page.waitForTimeout(350);
  await page.screenshot({ path: SCRATCH + '/h7_kn1_arka.png' });

  // H1: Pasang Busur, cek HUD amunisi, tahan Serang >= 0.9s untuk bidik laser + tembakan maut 3 panah
  await h.goto(page, 'meadow', 1050, 420, 'right');
  const ammoOk = await h.G(page, () => {
    S.inv.hbow = 1; S.inv.sarrow = 5; S.eq.wpn = 'hbow'; S.lv = 6;
    const sc = window.__game.sc;
    sc.enemies.forEach(e => { e.hp = 0; e.spr.setPosition(3000, 3000); });
    sc.spawnEnemy('slime', 1135, 420);
    updHud();
    const hud = document.getElementById('hud-ammo');
    return { show: hud && hud.style.display, text: hud && hud.innerText };
  });
  expect(ammoOk.show).toBe('flex');
  expect(ammoOk.text).toContain('Tajam');

  await h.G(page, () => { window.__game.Input.keys.a = true; });
  await page.waitForTimeout(950);
  const aimState = await h.G(page, () => ({
    charge: window.__game.sc._bowChargeT,
    channelling: window.__game.sc.pl._channellingMove,
    hasGfx: !!window.__game.sc._bowAimGfx
  }));
  expect(aimState.charge).toBeGreaterThan(0.5);
  expect(aimState.channelling).toBe(true);
  expect(aimState.hasGfx).toBe(true);
  await page.screenshot({ path: SCRATCH + '/h1_bow_aim.png' });

  await h.G(page, () => {
    window.__game.Input.keys.a = false;
    window.__game.press('heavy');
  });
  await page.waitForTimeout(300);
  const shotAfter = await h.G(page, () => ({ shots: window.__game.sc.shots.length, sarrow: S.inv.sarrow }));
  expect(shotAfter.sarrow).toBeLessThan(5);

  // H2: Pohon Bakat Radial 4 cabang + upgrade + reset
  await h.G(page, () => { S.gold = 200; S.lv = 8; openTalentTree(); });
  await page.waitForTimeout(300);
  expect(await h.G(page, () => !!document.getElementById('ttree'))).toBe(true);
  await h.press(page, 'a', 1, 200);
  await page.screenshot({ path: SCRATCH + '/h2_talent_tree.png' });
  const talVal = await h.G(page, () => S.talents.war[0]);
  expect(talVal).toBe(1);
  await h.press(page, 'b', 1, 250);
  expect(await h.G(page, () => window.__game.G.lock)).toBe(0);

  // H3: Layar Karakter Beranimasi + Ras x Kelas + Cross-Stat Scaling
  await h.G(page, () => { S.lv = 8; attrInit(); S.attr.str = 5; openAttr(); });
  await page.waitForTimeout(300);
  expect(await h.G(page, () => !!document.getElementById('charui'))).toBe(true);
  const magBefore = await h.G(page, () => stat().mag);
  await h.G(page, () => { document.querySelector('[data-race="aurel"]').click(); });
  await page.waitForTimeout(200);
  const magAfter = await h.G(page, () => stat().mag);
  expect(magAfter).toBeGreaterThan(magBefore);
  await page.screenshot({ path: SCRATCH + '/h3_char_screen.png' });
  await h.press(page, 'b', 1, 250);
  expect(await h.G(page, () => window.__game.G.lock)).toBe(0);

  // H4: Resep Rahasia + Kartu Jurus Beranimasi
  const recOk = await h.G(page, () => {
    unlockRecipe('fam_crow', window.__game.sc);
    return { rec: !!S.recipes.fam_crow, inCraft: CRAFT.some(c => c.id === 'fam_crow') };
  });
  expect(recOk.rec).toBe(true);
  expect(recOk.inCraft).toBe(true);

  await h.G(page, () => { S.learn.fire = 1; S.learn.dash = 1; S.spell = 'fire'; openSkills(); });
  await page.waitForTimeout(300);
  expect(await h.G(page, () => document.body.innerText.includes('JURUS ARKA'))).toBe(true);
  await page.screenshot({ path: SCRATCH + '/h4_skill_cards.png' });
  await h.press(page, 'b', 1, 250);
  expect(await h.G(page, () => window.__game.G.lock)).toBe(0);

  // H5: Peta Dunia Interaktif + Pin + Warp Teleport
  await h.G(page, () => {
    S.seen.forest = 1; S.warps.village = 1; S.warps.forest = 1;
    openWorldMap(window.__game.sc);
  });
  await page.waitForTimeout(350);
  expect(await h.G(page, () => !!document.getElementById('wm-bar'))).toBe(true);
  await page.screenshot({ path: SCRATCH + '/h5_world_map.png' });
  await h.G(page, () => document.querySelector('#wmap .wmb.r')?.click());
  await page.waitForTimeout(200);
  expect(await h.G(page, () => window.__game.G.lock)).toBe(0);

  // H6: Familiar Gagak Senja mengorbit & menembak musuh
  await h.goto(page, 'meadow', 1050, 420, 'right');
  await h.G(page, () => {
    S.inv.fam_crow = 1;
    const sc = window.__game.sc;
    sc.useItem('fam_crow');
    sc.enemies.forEach(e => { e.hp = 0; e.spr.setPosition(3000, 3000); });
    sc.spawnEnemy('slime', 1105, 420);
    sc._famShotT = 0.05;
  });
  await page.waitForTimeout(550);
  const famOk = await h.G(page, () => {
    const sc = window.__game.sc;
    const slime = sc.enemies.find(e => e.type === 'slime');
    return { hasSpr: !!(sc._famSpr && sc._famSpr.active), active: S.familiar.active, dmgDone: slime && slime.hp < slime.max };
  });
  expect(famOk.hasSpr).toBe(true);
  expect(famOk.active).toBe(true);
  expect(famOk.dmgDone).toBe(true);
  await page.screenshot({ path: SCRATCH + '/h6_familiar_combat.png' });

  h.noErrors(errors);
});
