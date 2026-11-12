// Membuat docs/INDEX.md: daftar dokumen aktif + judul bagian & nomor barisnya, agar agen membaca bagian yang perlu saja.
// Jalankan: node tools/docindex.js (otomatis di npm run check). JANGAN mengedit INDEX.md manual.
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'docs');
const SKIP = new Set(['INDEX.md', 'CODEMAP.md']);
const out = ['# INDEX dokumen (otomatis: `node tools/docindex.js`)', '',
  'Baca bagian yang perlu saja: `Read file offset=<baris> limit=<±60>`. ~token = perkiraan biaya membaca utuh.', ''];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && !SKIP.has(f)).sort()) {
  const t = fs.readFileSync(path.join(dir, f), 'utf8'), L = t.split('\n');
  out.push(`## ${f} — ${L[0].replace(/^#\s*/, '')} (${L.length} baris, ~${Math.round(t.length / 4 / 100) * 100} token)`);
  if (f === 'SPOILER_ENDING.md') { out.push('_Isi rahasia: baca hanya saat menulis cerita/bab/boss. JANGAN dibahas dengan pemilik._', ''); continue; }
  const h = []; L.forEach((l, i) => { const m = l.match(/^(##+)\s+(.*)/); if (m && m[1].length <= 3) h.push(`${m[2].replace(/\*\*/g, '')} ${i + 1}`); });
  out.push(h.join(' · ') || '_(tanpa sub-bagian)_', '');
}
fs.writeFileSync(path.join(dir, 'INDEX.md'), out.join('\n'));
console.log('INDEX dokumen dibuat');
