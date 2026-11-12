// Penjaga aturan ukuran kode (docs/CODE_RULES.md): file JS <= 400 baris, baris <= 160 karakter.
// Pelanggaran lama dicatat di tools/size-baseline.json dan TIDAK boleh bertambah ("ratchet").
// Perbarui baseline hanya bila pelanggaran BERKURANG: node tools/check-size.js --update
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), MAX_LINES = 400, MAX_COL = 160;
const basePath = path.join(__dirname, 'size-baseline.json');
const base = fs.existsSync(basePath) ? JSON.parse(fs.readFileSync(basePath, 'utf8')) : {};
const now = {};
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js')) {
      const L = fs.readFileSync(p, 'utf8').split('\n'), rel = path.relative(root, p);
      const v = { lines: L.length > MAX_LINES ? L.length : 0, long: L.filter(l => l.length > MAX_COL).length };
      if (v.lines || v.long) now[rel] = v;
    }
  }
})(path.join(root, 'src'));
if (process.argv.includes('--update')) {
  fs.writeFileSync(basePath, JSON.stringify(now, null, 1) + '\n');
  console.log('Baseline ukuran diperbarui:', Object.keys(now).length, 'file');
  process.exit(0);
}
let bad = 0;
for (const [f, v] of Object.entries(now)) {
  const b = base[f] || { lines: 0, long: 0 };
  if (v.lines > Math.max(b.lines, MAX_LINES)) { bad++; console.error(`TERLALU PANJANG: ${f} ${v.lines} baris (maks ${MAX_LINES}). Pecah ke file baru (lihat docs/CODE_RULES.md).`); }
  if (v.long > b.long) { bad++; console.error(`BARIS > ${MAX_COL} karakter bertambah di ${f}: ${b.long} -> ${v.long}. Pecah barisnya.`); }
}
const debt = Object.values(now).reduce((a, v) => a + v.long, 0);
console.log(`Ukuran kode: ${bad} pelanggaran baru (utang lama: ${debt} baris panjang di ${Object.keys(now).length} file)`);
process.exit(bad ? 1 : 0);
