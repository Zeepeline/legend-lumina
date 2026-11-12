const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 9: ikan per jam/cuaca, tarik-ulur, rekor, akuarium', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.goto(page, 'forest', 446, 628, 'up');
  const pools = await h.G(page, () => { const sc = window.__game.sc, ids = () => fishPool(sc, true).map(F => F.id);
    S.time = 6; const pagi = ids(); S.time = 22; const malam = ids(); sc.weather = 'rain'; const hujan = ids(); sc.weather = 'clear'; S.time = 12; return { pagi, malam, hujan }; });
  expect(pools.pagi).toContain('trout'); expect(pools.pagi).toContain('leg_forest'); expect(pools.malam).toContain('moonfish'); expect(pools.malam).not.toContain('trout'); expect(pools.hujan).toContain('rainfish');
  // tarik-ulur: tahan terus → tali putus; tahan-lepas → dapat
  const snap = await h.G(page, async () => { Input.keys.a = true; const r = await tugGame({ d: 3 }); Input.keys.a = false; return r; });
  expect(snap).toBe('snap');
  const ok = await h.G(page, async () => { const iv = setInterval(() => { const t = document.querySelector('#tug .tg-t'); Input.keys.a = !(t && (t.classList.contains('hot') || parseFloat(t.style.width) > 60)); }, 30); const r = await tugGame({ d: 2 }); clearInterval(iv); Input.keys.a = false; return r; });
  expect(ok).toBe('ok');
  // rekor & buku ikan lama yang tersimpan sebagai objek
  const rec = await h.G(page, () => { S.fishLog = { fish: { count: 2, firstHour: 3 }, gfish: 1 }; logFish('fish', 30); const a = logFish('fish', 35); logFish('gfish', 20); return [a, S.fishLog.fish.count, S.fishLog.gfish.count]; });
  expect(rec).toEqual([true, 4, 2]);
  // akuarium
  await h.G(page, () => { S.home = { owned: 1, lv: 0, box: {}, items: [{ t: 'tank', x: 64, y: 140, v: 0, fish: ['trout', 'gfish'] }] }; });
  await h.goto(page, 'home', 160, 226, 'up'); await page.waitForTimeout(500);
  expect(await h.G(page, () => window.__game.sc.hf[0].swim.length)).toBe(2);
  h.noErrors(errors);
});
