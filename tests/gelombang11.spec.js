const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 11: tangkis, elemen, kunci target, tas, notifikasi', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page); await h.learnAll(page);
  await h.goto(page, 'meadow', 600, 400, 'up');
  const r = await h.G(page, () => {
    const sc = window.__game.sc, pl = sc.pl; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000));
    // tangkis
    const w = sc.spawnEnemy('wolf', pl.x, pl.y - 20); const hp0 = S.hp; pl.atkCd = 0; pl.inv = 0; sc.attack(); sc.hurtPlayer(10, w.spr.x, w.spr.y); const parried = S.hp === hp0 && pl.parryCrit > 0;
    // terlambat: kena
    sc.t += 1; pl.inv = 0; sc.hurtPlayer(10, w.spr.x, w.spr.y); const hurt = S.hp < hp0;
    // elemen: slime es kena api 1.7×
    const a = sc.spawnEnemy('slimei', pl.x + 80, pl.y), b = sc.spawnEnemy('slime', pl.x - 80, pl.y); a.hp = b.hp = 999; a.D = Object.assign({}, a.D, { def: 0 }); b.D = Object.assign({}, b.D, { def: 0 });
    sc.curElem = 'fire'; sc.hitEnemy(a, 100, false, 0, 0); sc.hitEnemy(b, 100, false, 0, 0); sc.curElem = null;
    const weak = (999 - a.hp) / (999 - b.hp);
    // kunci target & bidikan
    sc.setLock(a); const ang = sc.aimAngle(); sc.updLock();
    // notifikasi
    addItem('herb', 2); addItem('herb', 1); const toast = document.querySelector('.toast b')?.textContent;
    return { parried, hurt, weak, aimRight: Math.cos(ang) > .9, locked: sc.lockR.visible, toast, rar: [rarity('potion'), rarity('csword'), rarity('leg_forest')] };
  });
  console.log(r);
  expect(r.parried).toBe(true); expect(r.hurt).toBe(true); expect(r.weak).toBeGreaterThan(1.4); expect(r.aimRight).toBe(true); expect(r.locked).toBe(true);
  expect(r.toast).toBe('+3'); expect(r.rar[0]).toBe(0); expect(r.rar[2]).toBe(3);
  // tas: urutkan
  await h.press(page, 'bag', 1, 300); await h.press(page, 'dash', 1, 200);
  expect(await h.G(page, () => document.querySelector('#bagw .srt').textContent)).toContain('nilai');
  await h.press(page, 'b', 1, 200);
  h.noErrors(errors);
});
