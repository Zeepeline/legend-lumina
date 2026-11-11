// Cek sintaks semua file JS di src/ + pastikan setiap file dimuat di index.html (dan sebaliknya).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(path.relative(root, p)); } })(path.join(root, 'src'));
let bad = 0;
for (const f of files) { try { execFileSync(process.execPath, ['--check', path.join(root, f)], { stdio: 'pipe' }); } catch (e) { bad++; console.error('SINTAKS SALAH:', f, '\n', e.stderr.toString()); } }
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const loaded = [...html.matchAll(/<script src="(src\/[^"]+)"/g)].map(m => m[1]);
for (const f of files) if (!loaded.includes(f)) { bad++; console.error('Tidak dimuat di index.html:', f); }
for (const f of loaded) if (!files.includes(f)) { bad++; console.error('index.html memuat file yang tidak ada:', f); }
console.log(`${files.length} file diperiksa, ${bad} masalah`);
process.exit(bad ? 1 : 0);
