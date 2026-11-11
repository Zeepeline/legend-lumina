// Pembantu tes: memulai game, menekan tombol, melewati dialog, pindah peta.
const { expect } = require('@playwright/test');

async function boot(page, { fresh = true } = {}) {
  const errors = [];
  // Di sandbox tanpa internet: PHASER_LOCAL=/path/phaser.min.js. Di GitHub Actions dipakai CDN asli.
  if (process.env.PHASER_LOCAL) {
    const fs = require('fs');
    await page.route(/cdnjs.*phaser/, r => r.fulfill({ body: fs.readFileSync(process.env.PHASER_LOCAL), contentType: 'application/javascript' }));
    await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  }
  page.on('pageerror', e => errors.push(e.message));
  if (fresh) await page.addInitScript(() => { try { if (!sessionStorage.getItem('kept')) localStorage.clear(); } catch (_) { } });
  await page.goto('/index.html');
  await page.waitForFunction(() => document.getElementById('title') && window.__game && window.__game.sc, null, { timeout: 30_000 });
  return errors;
}
// Catatan: fungsi jangan mengembalikan objek Phaser (serialisasi bisa macet); bungkus dengan { }.
const G = (page, fn, arg) => page.evaluate(fn, arg);
async function press(page, k, n = 1, wait = 150) { for (let i = 0; i < n; i++) { await G(page, k => window.__game.press(k), k); await page.waitForTimeout(wait); } }
async function flush(page, max = 40) { // tekan A sampai semua dialog tertutup
  for (let i = 0; i < max; i++) {
    const open = await G(page, () => !!document.querySelector('.dlg'));
    if (!open) { await page.waitForTimeout(250); if (!(await G(page, () => !!document.querySelector('.dlg')))) return; }
    await press(page, 'a', 1, 180);
  }
}
async function newGame(page) {
  await press(page, 'a', 1, 300);
  await page.waitForFunction(() => !window.__game.G.title, null, { timeout: 10_000 });
  await page.waitForTimeout(2600); await flush(page);
}
async function goto(page, map, x, y, dir = 'down') {
  await G(page, ([m, x, y, d]) => window.__game.sc.goto(m, x, y, d), [map, x, y, dir]);
  await page.waitForFunction(m => window.__game.sc.M.id === m && !window.__game.sc.trans, map, { timeout: 15_000 });
  await page.waitForTimeout(600); await flush(page);
}
async function hold(page, dir, ms) { await G(page, d => window.__game.Input.held.push(d), dir); await page.waitForTimeout(ms); await G(page, () => window.__game.Input.held.length = 0); }
async function faceNpc(page, id) { await G(page, id => { const sc = window.__game.sc, n = sc.npcs.find(n => n.n.id === id); n.n.wander = 0; n.spr.setVelocity(0); sc.pl.setPosition(n.spr.x, n.spr.y + 12); sc.pl.dir = 'up'; }, id); await page.waitForTimeout(150); }
async function talkTo(page, id) { await faceNpc(page, id); await press(page, 'a', 1, 400); await flush(page); }
const S = page => G(page, () => JSON.parse(JSON.stringify(window.__game.S)));
async function killBoss(page) {
  await page.waitForFunction(() => window.__game.sc.enemies.some(e => e.boss && e.awake), null, { timeout: 20_000 });
  await G(page, () => { const sc = window.__game.sc, e = sc.enemies.find(e => e.boss); e.faded = false; e.hp = 1; sc.hitEnemy(e, 9999, false, 0, 1); });
  await page.waitForTimeout(3500); await flush(page); await page.waitForTimeout(800); await flush(page);
}
function noErrors(errors) { expect(errors, 'error JavaScript di halaman').toEqual([]); }
module.exports = { boot, G, press, flush, newGame, goto, hold, faceNpc, talkTo, S, killBoss, noErrors };
