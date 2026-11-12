// Pemeriksa tata letak peta: objek di tengah jalan, saling menumpuk, menghalangi pintu/keluar/NPC, di dalam air, di luar peta,
// atau objek "alam liar" di dalam permukiman. Aturan lengkap: docs/PLACEMENT_RULES.md
// Pakai: node tools/check-layout.js            (keluar 1 bila ada MASALAH)
//        node tools/check-layout.js --semua     (tampilkan juga PERINGATAN)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console, Math, Object, Array, JSON, matchMedia: () => ({ matches: false, addEventListener() {} }), innerWidth: 400, innerHeight: 800, addEventListener() {}, document: { createElement: () => ({ getContext: () => ({}) }) } };
ctx.window = ctx; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8').replace(/^'use strict';/, ''), ctx, { filename: f });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]);
// muat cukup file untuk MAPS & OBJ (fungsi art/ui tidak dijalankan)

for (const f of files) if (/world\/(objects|ground|maps\/)/.test(f)) { try { load(f); } catch (e) { console.error('Gagal memuat', f, e.message); } }
const { MAPS, OBJ } = vm.runInContext('({ MAPS, OBJ })', ctx);

// ---- aturan ----
const SETTLEMENT = ['village', 'kgate', 'kpasar', 'kakademi', 'kbawah'];               // permukiman
const WILD_ONLY = ['campfire', 'bones', 'dripstone', 'stalag', 'mush', 'bramble', 'totem', 'root', 'icehole', 'icechasm', 'skewercamp'];
const ON_WATER = ['lotuspad', 'dockboat', 'shrine', 'pebbles', 'canalpier', 'templekoipond', 'icehole', 'boat'];
const PATH_OK = ['sign', 'lamp', 'lampPost', 'stele', 'pebbles', 'flowers', 'grass'];   // boleh di tepi jalan (tetap tak boleh di tengah)
const SKIP_TYPES = ['cwall', 'gatehouse'];                                               // bagian struktur (memang menempel)
const issues = [], warns = [];
const box = (t, x, y) => { const o = OBJ[t]; if (!o || !o.col) return null; const [w, h, oy = 0] = o.col; return w ? { x1: x - w / 2, x2: x + w / 2, y1: y - h - oy, y2: y - oy, w, h } : null; };
const segDist = (px, py, x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l)); return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)); };
const boxSegDist = (b, s) => Math.min(...[[b.x1, b.y1], [b.x2, b.y1], [b.x1, b.y2], [b.x2, b.y2], [(b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2]].map(([x, y]) => segDist(x, y, s[0], s[1], s[2], s[3])));
const inPond = (x, y, P) => ((x - P[0]) / P[2]) ** 2 + ((y - P[1]) / P[3]) ** 2 < .85;
const hit = (a, b, m = 0) => a.x1 < b.x2 + m && a.x2 > b.x1 - m && a.y1 < b.y2 + m && a.y2 > b.y1 - m;

for (const [id, M] of Object.entries(MAPS)) {
  if (M.indoor) continue;
  const objs = (M.objs || []).map(([t, x, y, opt], i) => ({ t, x, y, i, ok: opt && opt.ok, b: box(t, x, y) }));
  const tag = o => `${id}: '${o.t}' (${o.x}, ${o.y})`;
  // kandang (M.ranch): area pagar tidak boleh menumpuk gambar objek, jalan, atau NPC
  const visH = t => { const k = OBJ[t] && OBJ[t].key, g = k && path.join(root, 'assets/img', 'gpt_' + k + '.png'), f = k && (fs.existsSync(g) ? g : path.join(root, 'assets/img', k.replace(/^i_/, '') + '.png')); try { const b = fs.readFileSync(f); return b.readUInt32BE(20); } catch (_) { const c = OBJ[t] && OBJ[t].col; return Math.min(120, Math.max(28, (c && c[0] || 20) * 1.4)); } };
  if (M.ranch) { const R = M.ranch, rb = { x1: R.x, y1: R.y - 14, x2: R.x + R.w, y2: R.y + R.h + 6 };
    for (const o of objs) { const c = OBJ[o.t] && OBJ[o.t].col, w = c && c[0] ? c[0] : 20, vis = { x1: o.x - w / 2, x2: o.x + w / 2, y1: o.y - visH(o.t), y2: o.y + 2 }; if (hit(rb, vis)) issues.push(`${id}: kandang menumpuk '${o.t}' (${o.x}, ${o.y})`); }
    for (const s of M.paths || []) if (boxSegDist(rb, s) < (s[4] || 12) / 2 + 2) issues.push(`${id}: kandang menutup jalan (${s.slice(0, 4).join(',')})`);
    for (const a of M.animals || []) if (a[1] > rb.x1 - 8 && a[1] < rb.x2 + 8 && a[2] > rb.y1 - 8 && a[2] < rb.y2 + 8) issues.push(`${id}: hewan ${a[0]} di pagar kandang`);
    for (const n of M.npcs || []) if (n.x > rb.x1 - 8 && n.x < rb.x2 + 8 && n.y > rb.y1 - 8 && n.y < rb.y2 + 8) issues.push(`${id}: NPC ${n.id} berdiri di kandang`); }
  for (const o of objs) {
    if (!OBJ[o.t]) { issues.push(`${tag(o)} tidak terdaftar di OBJ`); continue; }
    if (SKIP_TYPES.includes(o.t)) continue;
    if (o.ok) { if (typeof o.ok !== 'string' || o.ok.length < 8) issues.push(`${tag(o)} punya tanda ok tanpa alasan jelas`); continue; } // disengaja, wajib beri alasan
    // luar peta
    if (o.x < 20 || o.x > M.w - 20 || o.y < 20 || o.y > M.h - 10) issues.push(`${tag(o)} di luar/di tepi batas peta`);
    // di tengah jalan: kotak tabrakan menyentuh poros jalan
    for (const s of M.paths || []) {
      const half = (s[4] || 12) / 2, b = o.b;
      if (b && boxSegDist(b, s) < half && !PATH_OK.includes(o.t)) { issues.push(`${tag(o)} menghalangi jalan setapak (${s.slice(0, 4).join(',')})`); break; }
      if (!b && segDist(o.x, o.y, s[0], s[1], s[2], s[3]) < half * .6 && !PATH_OK.includes(o.t)) { warns.push(`${tag(o)} hiasan tepat di tengah jalan`); break; }
    }
    // di dalam air
    for (const P of M.ponds || []) if (inPond(o.x, o.y, P) && !ON_WATER.includes(o.t)) { issues.push(`${tag(o)} berada di dalam air`); break; }
    // objek alam liar di permukiman
    if (SETTLEMENT.includes(id) && WILD_ONLY.includes(o.t)) issues.push(`${tag(o)} objek alam liar ('${o.t}') di dalam permukiman`);
    // menghalangi pintu keluar
    for (const e of M.exits || []) { const ex = { x1: e.x - 24, x2: e.x + e.w + 24, y1: e.y - 34, y2: e.y + e.h + 34 }; if (o.b && hit(o.b, ex)) issues.push(`${tag(o)} menghalangi pintu keluar ke ${e.to}`); }
    // menghalangi pintu rumah (depan pintu harus kosong)
    for (const d of M.doors || []) { const front = { x1: d[0] - 14, x2: d[0] + 14, y1: d[1], y2: d[1] + 34 }; if (o.b && !/^house|academy|inn|shop/.test(o.t) && hit(o.b, front)) issues.push(`${tag(o)} menghalangi pintu (${d[0]}, ${d[1]})`); }
    // menimpa NPC
    for (const n of M.npcs || []) if (o.b && hit(o.b, { x1: n.x - 7, x2: n.x + 7, y1: n.y - 6, y2: n.y + 2 })) issues.push(`${tag(o)} menimpa posisi NPC ${n.id}`);
  }
  // JANGKAUAN: telusuri peta (kisi 8 px) dari pintu keluar pertama; semua pintu keluar, pintu rumah & NPC harus terjangkau
  { const G = 8, W = Math.ceil(M.w / G), H = Math.ceil(M.h / G), block = new Uint8Array(W * H), pad = 5;
    const mark = (x1, y1, x2, y2) => { for (let gy = Math.max(0, Math.floor((y1 - pad) / G)); gy <= Math.min(H - 1, Math.floor((y2 + pad) / G)); gy++) for (let gx = Math.max(0, Math.floor((x1 - pad) / G)); gx <= Math.min(W - 1, Math.floor((x2 + pad) / G)); gx++) block[gy * W + gx] = 1; };
    for (const [x, y, w, h] of M.walls || []) mark(x, y, x + w, y + h);
    for (const o of objs) if (o.b) mark(o.b.x1, o.b.y1, o.b.x2, o.b.y2);
    for (const P of M.ponds || []) for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) if (inPond(gx * G + 4, gy * G + 4, [P[0], P[1], P[2] / .92, P[3] / .92])) block[gy * W + gx] = 1;
    const cell = (x, y) => [Math.max(0, Math.min(W - 1, Math.floor(x / G))), Math.max(0, Math.min(H - 1, Math.floor(y / G)))];
    const inward = e => { const cx = e.x + e.w / 2, cy = e.y + e.h / 2, d = 28; return e.dir === 'up' ? [cx, cy + d] : e.dir === 'down' ? [cx, cy - d] : e.dir === 'left' ? [cx + d, cy] : [cx - d, cy]; };
    const ex = M.exits || []; if (ex.length) {
      const seen = new Uint8Array(W * H), q = []; const [sx, sy] = cell(...inward(ex[0])); q.push(sy * W + sx); seen[sy * W + sx] = 1;
      while (q.length) { const c = q.pop(), x = c % W, y = (c / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const k = ny * W + nx; if (!seen[k] && !block[k]) { seen[k] = 1; q.push(k); } } }
      const near = (x, y) => { const [gx, gy] = cell(x, y); for (let r = 0; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = gx + dx, Y = gy + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && seen[Y * W + X]) return true; } return false; };
      for (const e of ex.slice(1)) if (!near(...inward(e))) issues.push(`${id}: pintu keluar ke '${e.to}' TIDAK BISA DICAPAI pemain (tertutup tembok/objek/air)`);
      for (const d of M.doors || []) if (!near(d[0], d[1] + 14)) issues.push(`${id}: pintu (${d[0]}, ${d[1]}) tidak bisa dicapai`);
      for (const n of M.npcs || []) if (!near(n.x, n.y + 10)) warns.push(`${id}: NPC ${n.id} (${n.x}, ${n.y}) mungkin tidak terjangkau`);
    } }
  // saling menumpuk
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
    const a = objs[i], b = objs[j]; if (a.ok || b.ok || !a.b || !b.b || SKIP_TYPES.includes(a.t) || SKIP_TYPES.includes(b.t)) continue;
    if (a.t === b.t && ['fence', 'fenceWood', 'rock', 'crate', 'barrel', 'hay', 'lamp', 'cwall'].includes(a.t)) continue; // deretan sengaja
    if (hit(a.b, b.b, -2)) issues.push(`${id}: '${a.t}' (${a.x}, ${a.y}) bertumpuk dengan '${b.t}' (${b.x}, ${b.y})`);
  }
}
// gambar: file ada & tidak terlalu kecil (tanda salah potong)
const tex = fs.readFileSync(path.join(root, 'src/gfx/textures.js'), 'utf8'), list = (tex.match(/const IMG_LIST = \[([^\]]*)\]/) || [, ''])[1].match(/['"][^'"]+['"]/g).map(x => x.slice(1, -1));
for (const k of list) { const f = path.join(root, 'assets/img', k + '.png'); if (!fs.existsSync(f)) issues.push(`gambar '${k}' ada di IMG_LIST tapi file assets/img/${k}.png tidak ada`); }
for (const [k, o] of Object.entries(OBJ)) if (/^i_/.test(o.key) && !list.includes(o.key.slice(2)) && !/i_(cart|treePine|treeOak|rockWoods)$/.test(o.key)) issues.push(`OBJ '${k}' memakai gambar '${o.key}' yang tidak ada di IMG_LIST`);
const all = process.argv.includes('--semua');
for (const m of issues) console.log('MASALAH  ' + m);
if (all) for (const m of warns) console.log('PERINGATAN ' + m);
console.log(`\nPeriksa tata letak: ${issues.length} masalah, ${warns.length} peringatan` + (issues.length ? '  → perbaiki dulu (lihat docs/PLACEMENT_RULES.md)' : ''));
process.exit(issues.length ? 1 : 0);
