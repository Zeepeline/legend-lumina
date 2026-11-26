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
      const img = IMGEL['npc_sheet_' + id], [W, H] = NPC_SHEET_DIM[id] || [48, 48], base = 5 + NPC_SHEETS[id].length;
      const rows = img && [base + 2, base + 4].includes(img.height / H) ? img.height / H : base; /* +2 = diagonal, +4 = diagonal kiri bergambar sendiri */
      if (!img || img.width !== W * 8 || img.height !== rows * H) { out.bad.push(id + ': ukuran ' + (img && img.width + 'x' + img.height) + ' != ' + W * 8 + 'x' + rows * H); continue; }
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
      for (let r = 0; r < rows; r++) {
        const d = g.getImageData(0, r * H, W, H).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
        if (n < 80) out.bad.push(id + ': baris ' + r + ' kosong');
        const f = g.getImageData(0, r * H + H - 1, W * 8, 1).data; let foot = 0; for (let i = 3; i < W * 4; i += 4) if (f[i] > 0) foot++;
        if (r < 3 && foot === 0) out.bad.push(id + ': kaki tidak menyentuh dasar baris ' + r);
      }
    }
    return out;
  });
  expect(r.ids).toBeGreaterThan(50);
  expect(r.bad).toEqual([]);
});
