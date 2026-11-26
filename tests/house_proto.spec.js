// Uji visual & integrasi standar bangunan 3/4 oblique (houseProto + 6 bangunan Desa Lumina).
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

const SCRATCH = '/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479/scratch';

const EXPECTED_DIMS = {
  sp_house_proto: [160, 168],
  sp_houseA: [144, 160],
  sp_houseB: [136, 168],
  sp_houseC: [140, 168],
  sp_house_red_cottage: [148, 156],
  sp_house_brown_cottage: [148, 156],
  sp_blacksmith_forge: [164, 160],
};

test('seluruh 7 bangunan Desa Lumina seragam dimensi, fade, & nyala jendela malam', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await h.boot(page);
  await h.newGame(page);

  const check = await h.G(page, (keys) => {
    const sc = window.__game.sc;
    const dims = {};
    for (const k of keys) {
      const im = IMGEL[k];
      dims[k] = im ? [im.width, im.height] : null;
    }
    const f = sc.fades.find(x => x.s && x.s.texture && x.s.texture.key === 'sp_house_proto');
    return { map: sc.M.id, dims, hasFade: !!f };
  }, Object.keys(EXPECTED_DIMS));

  expect(check.map).toBe('village');
  expect(check.hasFade).toBe(true);
  for (const [k, wh] of Object.entries(EXPECTED_DIMS)) {
    expect(check.dims[k], `Dimensi ${k}`).toEqual(wh);
  }

  // 1. Utara desa: houseBrown, houseA, houseC berdampingan
  await h.G(page, () => {
    S.time = 10;
    const sc = window.__game.sc;
    sc.pl.setPosition(490, 235);
    sc.pl.dir = 'down';
    sc.pl.flipX = false;
  });
  await page.waitForTimeout(450);
  await page.screenshot({ path: SCRATCH + '/village_north_v2.png' });

  // 2. Selatan-tengah desa: houseB kiri, houseProto tengah, houseRed kanan
  await h.G(page, () => {
    S.time = 10;
    const sc = window.__game.sc;
    sc.pl.setPosition(502, 560);
    sc.pl.dir = 'down';
  });
  await page.waitForTimeout(450);
  await page.screenshot({ path: SCRATCH + '/village_south_v2.png' });

  // 3. Belakang atap houseProto: verifikasi fade + Y-sorting
  await h.G(page, () => {
    S.time = 10;
    const sc = window.__game.sc;
    sc.pl.setPosition(526, 486);
    sc.pl.dir = 'down';
  });
  await page.waitForTimeout(500);
  const fadeAlpha = await h.G(page, () => {
    const sc = window.__game.sc;
    const f = sc.fades.find(x => x.s && x.s.texture && x.s.texture.key === 'sp_house_proto');
    return { alpha: f && f.s.alpha, depthHouse: f && f.s.depth, depthPl: sc.pl.depth };
  });
  expect(fadeAlpha.alpha).toBeLessThan(0.7);
  expect(fadeAlpha.depthHouse).toBeGreaterThan(fadeAlpha.depthPl);

  // 4. Bengkel Pandai Besi baru di timur desa
  await h.G(page, () => {
    S.time = 10;
    const sc = window.__game.sc;
    sc.pl.setPosition(836, 568);
    sc.pl.dir = 'down';
  });
  await page.waitForTimeout(450);
  await page.screenshot({ path: SCRATCH + '/village_blacksmith_v2.png' });

  // 5. Malam hari di selatan-tengah: houseB, houseProto, houseRed menyala jendelanya
  await h.G(page, () => {
    S.time = 21.5;
    const sc = window.__game.sc;
    sc.pl.setPosition(502, 562);
    sc.pl.dir = 'down';
  });
  await page.waitForTimeout(650);
  const nightOk = await h.G(page, () => {
    const sc = window.__game.sc;
    return (sc.winL || []).filter(w => w.g && w.g.alpha > 0.5).length;
  });
  expect(nightOk).toBeGreaterThanOrEqual(5);
  await page.screenshot({ path: SCRATCH + '/village_night_v2.png' });

  h.noErrors(errors);
});
