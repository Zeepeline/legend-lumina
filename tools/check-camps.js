// Pemeriksa markas goblin & simetri (T427)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console, Math, Object, Array, JSON, matchMedia: () => ({ matches: false, addEventListener() {} }), innerWidth: 400, innerHeight: 800, addEventListener() {}, document: { createElement: () => ({ getContext: () => ({}) }) } };
ctx.window = ctx; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8').replace(/^'use strict';/, ''), ctx, { filename: f });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]);

for (const f of files) if (/world\/(objects|ground|maps\/|layout)/.test(f)) { try { load(f); } catch (e) { console.error('Gagal memuat', f, e.message); } }
const { MAPS, OBJ } = vm.runInContext('({ MAPS, OBJ })', ctx);

console.log('--- PEMERIKSA MARKAS GOBLIN & SIMETRI (T427) ---');

let hasIssue = false;

for (const [id, M] of Object.entries(MAPS)) {
  if (M.indoor) continue;
  const objs = M.objs || [];
  const fortress = objs.find(o => o[0] === 'goblin_fortress');
  if (!fortress) continue;

  const [_, fx, fy] = fortress;
  const gobObjs = objs.filter(o => o[0].startsWith('goblin_') && o[0] !== 'goblin_fortress');
  
  // (a) Hitung skor simetri terhadap x benteng
  let symCount = 0;
  for (let i = 0; i < gobObjs.length; i++) {
    const [t1, x1, y1] = gobObjs[i];
    const dx1 = x1 - fx;
    // cari pasangan bertipe sama di sisi seberang: dx2 ~= -dx1 (selisih <= 20) dan dy <= 25
    const match = gobObjs.find((o, j) => {
      if (i === j || o[0] !== t1) return false;
      const dx2 = o[1] - fx;
      return Math.abs(dx2 + dx1) <= 20 && Math.abs(o[2] - y1) <= 25;
    });
    if (match) symCount++;
  }
  const symRatio = gobObjs.length ? Math.round((symCount / gobObjs.length) * 100) : 0;

  // (b) Pohon/semak dalam 40 px dari objek goblin_*
  const trees = objs.filter(o => o[0].startsWith('tree') || o[0].startsWith('bush'));
  const treeIssues = [];
  for (const go of [fortress, ...gobObjs]) {
    for (const tr of trees) {
      const d = Math.hypot(go[1] - tr[1], go[2] - tr[2]);
      if (d < 40) treeIssues.push(`${tr[0]} (${tr[1]},${tr[2]}) terlalu dekat (${Math.round(d)}px) ke ${go[0]}`);
    }
  }

  // (c) Musuh berkumpul > 3 dalam radius 80 px
  const enemies = M.enemies || [];
  const crowdIssues = [];
  for (let i = 0; i < enemies.length; i++) {
    const e1 = enemies[i];
    let nearby = 0;
    for (let j = 0; j < enemies.length; j++) {
      if (Math.hypot(e1[1] - enemies[j][1], e1[2] - enemies[j][2]) < 80) nearby++;
    }
    if (nearby > 3) crowdIssues.push(`Musuh menumpuk (${nearby}) di dekat (${e1[1]},${e1[2]})`);
  }

  console.log(`\nMarkas: ${M.name || id} (${id})`);
  console.log(`  Lokasi benteng: (${fx}, ${fy})`);
  console.log(`  Skor simetri: ${symRatio}% ${symRatio > 40 ? '⚠️ [PERINGATAN: Terlalu simetris/kaku]' : '✅ [Organik]'}`);
  if (treeIssues.length) {
    console.log(`  Pohon terlalu dekat (${treeIssues.length}):`);
    treeIssues.slice(0, 3).forEach(ti => console.log(`    - ${ti}`));
  }
  if (crowdIssues.length) {
    console.log(`  Peringatan kerumunan musuh: ${[...new Set(crowdIssues)].length} titik`);
  }
}
