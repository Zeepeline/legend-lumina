// Pemeriksa bangunan/objek bergambar: kunci gambar harus ada, kotak tabrakan tidak boleh melebihi gambar, bangunan wajib punya bayangan,
// tidak ada entri OBJ ganda. Pakai: node tools/check-buildings.js  (keluar 1 bila ada MASALAH)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/world/objects.js'), 'utf8').replace(/^'use strict';/, '');
const OBJ = vm.runInNewContext(src + ';OBJ', { console, Math, Object, Array, JSON });
const imgDir = path.join(root, 'assets/img'), imgMap = {};
for (const e of fs.readdirSync(imgDir, { withFileTypes: true })) {
  if (e.isDirectory()) for (const f of fs.readdirSync(path.join(imgDir, e.name))) { if (f.endsWith('.png')) imgMap[f.slice(0, -4)] = path.join(imgDir, e.name, f); }
  else if (e.name.endsWith('.png')) imgMap[e.name.slice(0, -4)] = path.join(imgDir, e.name);
}
const size = f => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const tex = fs.readFileSync(path.join(root, 'src/gfx/textures.js'), 'utf8');
const list = (tex.match(/const IMG_LIST = \[([^\]]*)\]/) || [, ''])[1].match(/['"][^'"]+['"]/g).map(x => x.slice(1, -1));
const zlib = require('zlib');
/* Dekode PNG RGBA 8-bit (tanpa interlace) -> jumlah piksel nyaris putih yang buram (sisa latar JPG di lubang gambar). */
const whiteCount = f => {
  const b = fs.readFileSync(f); if (b[24] !== 8 || b[25] !== 6 || b[28]) return 0;
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), parts = []; let o = 8;
  while (o < b.length) { const n = b.readUInt32BE(o), t = b.toString('latin1', o + 4, o + 8); if (t === 'IDAT') parts.push(b.subarray(o + 8, o + 8 + n)); o += 12 + n; }
  const raw = zlib.inflateSync(Buffer.concat(parts)), st = w * 4, px = Buffer.alloc(st * h);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (st + 1)], r = raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1));
    for (let i = 0; i < st; i++) {
      const a = i >= 4 ? px[y * st + i - 4] : 0, up = y ? px[(y - 1) * st + i] : 0, c = i >= 4 && y ? px[(y - 1) * st + i - 4] : 0;
      const pa = Math.abs(up - c), pb = Math.abs(a - c), pc = Math.abs(a + up - 2 * c);
      px[y * st + i] = (r[i] + [0, a, up, (a + up) >> 1, pb <= pa && pb <= pc ? up : pa <= pc ? a : c][ft === 4 ? 4 : ft] ) & 255;
    }
  }
  let n = 0; for (let i = 0; i < px.length; i += 4) if (px[i + 3] && Math.min(px[i], px[i + 1], px[i + 2]) > 225) n++;
  return n;
};
const issues = [], seen = {};
for (const [id, o] of Object.entries(OBJ)) {
  const name = o.key.replace(/^i_/, '');
  const f = imgMap[o.key] || imgMap[name] || imgMap['gpt_' + name]; // gptassets.js menimpa beberapa tekstur dengan gpt_<nama>
  if (/^gpt_/.test(o.key) && !list.includes(o.key)) issues.push(`OBJ '${id}': '${o.key}' tidak ada di IMG_LIST (tekstur tidak dimuat)`);
  if (!f) continue; // objek gambar-kode (art*.js) tidak punya PNG
  const [w, h] = size(f), c = o.col;
  if (w < 60 && h < 60) continue; // properti kecil (kayu, pagar) bukan bangunan
  if (c && c[0] && (c[0] > w || c[1] + (c[2] || 0) > h)) issues.push(`OBJ '${id}': col ${c} melebihi gambar ${w}x${h}`);
  if (c && c[0] && !o.sh && h >= 60) issues.push(`OBJ '${id}': bangunan ${w}x${h} tanpa bayangan 'sh'`);
  if (o.sh && w >= 60 && o.sh[0] > w) issues.push(`OBJ '${id}': sh ${o.sh} lebih lebar dari gambar ${w}`);
  if (h >= 100 && c && c[0] && !o.fade) issues.push(`OBJ '${id}': gambar ${w}x${h} tinggi tapi tanpa 'fade' (menutupi pemain)`);
  if (!/^gpt_/.test(o.key)) continue; // alias pohon/bangku (kunci sama) disengaja
  const wc = /^gpt_(orc|palisade)/.test(o.key) ? whiteCount(f) : 0;
  if (wc > 150) issues.push(`OBJ '${id}': ${wc} piksel putih buram di ${o.key}.png (sisa latar di lubang?)`);
  const sig = o.key + JSON.stringify(c);
  if (seen[sig]) issues.push(`OBJ '${id}' ganda dengan '${seen[sig]}' (kunci & col sama)`); else seen[sig] = id;
}
console.log(`Periksa bangunan: ${issues.length} masalah`); issues.forEach(i => console.log('  MASALAH ' + i));
process.exit(issues.length ? 1 : 0);
