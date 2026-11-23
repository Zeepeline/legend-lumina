// Lembar sprite NPC (tools/gen_npc_sheets.py): ukuran, baris kegiatan sesuai NPC_SHEETS, tak ada baris kosong
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('lembar NPC lengkap & sesuai NPC_SHEETS', async ({ page }) => {
  test.setTimeout(90_000);
  await h.boot(page);
  const r = await h.G(page, () => {
    const out = { ids: 0, bad: [] };
    for (const id in NPC_SHEETS) {
      out.ids++;
      const img = IMGEL['npc_sheet_' + id], rows = 5 + NPC_SHEETS[id].length;
      if (!img || img.width !== 384 || img.height !== rows * 48) { out.bad.push(id + ': ukuran ' + (img && img.width + 'x' + img.height) + ' != 384x' + rows * 48); continue; }
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
      for (let r = 0; r < rows; r++) {
        const d = g.getImageData(0, r * 48, 48, 48).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
        if (n < 80) out.bad.push(id + ': baris ' + r + ' kosong');
        const f = g.getImageData(0, r * 48 + 47, 384, 1).data; let foot = 0; for (let i = 3; i < 48 * 4; i += 4) if (f[i] > 0) foot++;
        if (r < 3 && foot === 0) out.bad.push(id + ': kaki tidak menyentuh dasar baris ' + r);
      }
    }
    return out;
  });
  expect(r.ids).toBeGreaterThan(50);
  expect(r.bad).toEqual([]);
});
