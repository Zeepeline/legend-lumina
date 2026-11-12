const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 10: kalender, musim, jam toko', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  const r = await h.G(page, () => { const out = {}; for (const d of [0, 6, 7, 14, 21, 28]) { S.day = d; out[d] = [dayName(), season().id]; } S.day = 0; return out; });
  expect(r[0]).toEqual(['Senin', 'semi']); expect(r[6]).toEqual(['Minggu', 'semi']); expect(r[7][1]).toBe('panas'); expect(r[21][1]).toBe('dingin'); expect(r[28][1]).toBe('semi');
  // tanaman lebih lambat di musim dingin
  const g = await h.G(page, () => { const p = { seed: 'seed' }; S.day = 0; const semi = plotHours(p); S.day = 21; const dingin = plotHours(p); S.day = 0; return [semi, dingin]; });
  expect(g[1]).toBeGreaterThan(g[0]);
  // toko tutup malam & bengkel libur Minggu
  expect(await h.G(page, () => { S.time = 21; return !!shopShut('Kios Bu Sari'); })).toBe(true);
  expect(await h.G(page, () => { S.time = 10; S.day = 0; return !!shopShut('Kios Bu Sari'); })).toBe(false);
  expect(await h.G(page, () => { S.time = 10; S.day = 6; return !!shopShut('Bengkel Pak Besi'); })).toBe(true);
  // tidur sampai pagi
  expect(await h.G(page, () => { S.day = 2; S.time = 22; sleepToMorning(); return [S.day, S.time]; })).toEqual([3, 7]);
  // musim dingin: lapisan warna & salju muncul di padang, banner saat ganti musim
  await h.G(page, () => { S.day = 21; S.time = 10; }); await h.goto(page, 'meadow', 600, 400, 'up'); await page.waitForTimeout(800);
  expect(await h.G(page, () => { const sc = window.__game.sc; return [!!sc.seaOv, !!sc.seaP, document.getElementById('hDate').textContent.includes('Dingin')]; })).toEqual([true, true, true]);
  h.noErrors(errors);
});
