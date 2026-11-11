// Sapu semua objek interaktif di semua peta: setelah interaksi, layar harus bisa dipakai lagi (G.lock kembali 0) & tanpa error
const { test } = require('@playwright/test');
const h = require('./helpers'); const log = t => { if (process.env.SAPU_LOG) require('fs').appendFileSync(process.env.SAPU_LOG, t + '
'); };
// Lama (±25 menit). Jalankan: npm run sapu   (atau SAPU=1 MAPS=village,kpasar npx playwright test sapu)
test('sapu semua objek interaktif: tidak boleh membeku/error', async ({ page }) => {
  test.setTimeout(900_000);
  log('mulai'); const errors = await h.boot(page); log('boot'); await h.newGame(page); log('newgame');
  await h.G(page, () => { const S = window.__game.S; S.gold = 9999; S.lv = 30; S.hp = 999; S.stage = 27; Object.assign(S.inv, { herb: 9, berry: 9, veg: 9, fish: 9, apple: 9, seed: 9, jelly: 9, wool: 9 }); });
  const maps = await h.G(page, () => Object.keys(MAPS).filter(k => !['temple', 'arsip'].includes(k))).then(a => process.env.MAPS ? a.filter(m => process.env.MAPS.split(',').includes(m)) : a);
  log('peta: ' + maps.join(',')); const bad = [];
  for (const m of maps) {
    log('goto ' + m); await h.G(page, m => { const M = MAPS[m]; window.__game.sc.goto(m, M.w / 2, M.h / 2, 'down'); }, m); log('goto ok');
    try { await page.waitForFunction(m => window.__game.sc.M.id === m && !window.__game.sc.trans, m, { timeout: 15000 }); } catch (_) { bad.push(m + ': gagal masuk'); continue; }
    await page.waitForTimeout(500); await h.flush(page);
    const n = await h.G(page, () => window.__game.sc.inter.length); log('PETA ' + m + ' ' + n);
    for (let i = 0; i < n; i++) {
      const e0 = errors.length; log('  coba ' + m + ' #' + i + ' ' + await h.G(page, i => { const it = window.__game.sc.inter[i]; return it ? it.x + ',' + it.y + ' ' + (it.fn + '').slice(0, 70) : '-'; }, i));
      const info = await h.G(page, i => { const sc = window.__game.sc, it = sc.inter[i]; if (!it) return null; sc.enemies.forEach(e => e.spr.setPosition(5000, 5000)); window.__game.S.hp = 999; window.__game.S.mp = 99; const src = (it.fn + '').slice(0, 80); try { const r = it.fn(); if (r && r.catch) r.catch(e => console.error('ERR-INTER', e && e.message)); } catch (e) { return 'THROW ' + e.message + ' | ' + src; } return src; }, i);
      // jawab dialog/pilihan sampai selesai
      let ok = false;
      for (let k = 0; k < 40; k++) { await page.waitForTimeout(140); const st = await h.G(page, () => [window.__game.G.lock, !!document.querySelector('.dlg,.act,.win'), !!window.__game.sc.trans]); if (!st[0] && !st[1]) { ok = true; break; } if (st[2]) { ok = true; break; } await h.press(page, k % 6 === 5 ? 'b' : 'a', 1, 60); }
      const pos = await h.G(page, i => { const it = window.__game.sc.inter[i]; return it ? it.x + ',' + it.y : '?'; }, i);
      const fz = await h.G(page, () => window.__game.G.lock > 0 && !document.querySelector('.dlg,.act,.win') && !window.__game.sc.trans); if (!ok && fz) { log('   BEKU'); bad.push(`${m} #${i} (${pos}) BEKU: ${info}`); await h.G(page, () => { document.querySelectorAll('.dlg,.act,.win').forEach(e => e.remove()); window.__game.G.lock = 0; }); } else if (!ok) await h.G(page, () => { document.querySelectorAll('.dlg,.act,.win').forEach(e => e.remove()); window.__game.G.lock = 0; window.UIH = null; });
      if (errors.length > e0) bad.push(`${m} #${i} (${pos}) ERROR: ${errors.slice(e0).join(' / ')} :: ${info}`);
      if (info && info.startsWith('THROW')) bad.push(`${m} #${i} (${pos}) ${info}`);
      if (await h.G(page, m => window.__game.sc.M.id !== m, m)) { await h.G(page, m => { const M = MAPS[m]; window.__game.sc.goto(m, M.w / 2, M.h / 2, 'down'); }, m); await page.waitForTimeout(1500); await h.flush(page); }
    }
  }
  log('HASIL ' + bad.length + '\n' + bad.join('\n')); console.log('HASIL ' + bad.length + '\n' + bad.join('\n'));
});
