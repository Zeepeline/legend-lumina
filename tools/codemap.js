// Membuat docs/CODEMAP.md: daftar SEMUA fungsi, metode World, const global & objek OBJ_SPAWN beserta file:baris.
// Agen cukup grep file ini untuk tahu harus membuka file mana. Jalankan: node tools/codemap.js (otomatis di npm run check)
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(src\/[^"]+)"/g)].map(m => m[1]);
const out = ['# CODEMAP (dibuat otomatis oleh `node tools/codemap.js`, JANGAN diedit manual)', '',
  'Cari nama di sini (`grep -n "namaFungsi" docs/CODEMAP.md`), lalu buka file:baris itu saja.',
  'Format: `nama` baris. Urutan file = urutan muat di index.html.', ''];
let total = 0;
for (const f of files) {
  const L = fs.readFileSync(path.join(root, f), 'utf8').split('\n');
  const desc = (L[1] || '').replace(/^\/\/\s*/, '').trim();
  let mode = null; const items = [];
  L.forEach((l, i) => {
    let m;
    if (/^Object\.assign\((World\.prototype|OBJ_SPAWN)/.test(l)) mode = l.includes('OBJ_SPAWN') ? 'obj' : 'mix';
    else if (/^class World/.test(l)) mode = 'mix';
    if ((m = l.match(/^(?:async\s+)?function\s+([\w$]+)/))) items.push(`\`${m[1]}()\` ${i + 1}`);
    else if ((m = l.match(/^(?:const|let|var)\s+([\w$]+)/))) items.push(`\`${m[1]}\` ${i + 1}`);
    else if (mode && (m = l.match(/^ {2}(?:async\s+)?([\w$]+)\s*\(/)) && !/^(if|for|while|switch|catch)$/.test(m[1])) items.push((mode === 'obj' ? `obj \`${m[1]}\`` : `\`.${m[1]}()\``) + ` ${i + 1}`);
  });
  total += items.length;
  out.push(`## ${f} (${L.length} baris)`, desc ? `_${desc}_` : '', items.join(' · '), '');
}
fs.writeFileSync(path.join(root, 'docs', 'CODEMAP.md'), out.join('\n'));
console.log(`CODEMAP: ${files.length} file, ${total} nama`);
