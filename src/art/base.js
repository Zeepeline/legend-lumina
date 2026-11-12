'use strict';
// Dasar gambar: kanvas, warna, aturan gaya (toneC, garis tepi berwarna), renderMap
// =====================================================================
//  ART — semua pixel art digambar lewat kode (tanpa file gambar)
// =====================================================================
const OUT = '#2b1d24';
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingEnabled = false; return [c, x]; }
const _rgb = new Map();
function h2r(h) { let v = _rgb.get(h); if (!v) { const n = parseInt(h.slice(1), 16); v = [n >> 16 & 255, n >> 8 & 255, n & 255]; _rgb.set(h, v); } return v; }
function r2h(r, g, b) { return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); }
function shade(h, f) { let [r, g, b] = h2r(h); if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return r2h(r, g, b); }
function mix(a, b, t) { const A = h2r(a), B = h2r(b); return r2h(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function hash(x, y, s = 0) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y, sc, s) {
  const fx = x / sc, fy = y / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const fr = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
const px = (x, c, a, b) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), 1, 1); };
function ellF(x, c, cx, cy, rx, ry) {
  x.fillStyle = c;
  for (let j = Math.ceil(-ry); j <= ry; j++) { const w = rx * Math.sqrt(Math.max(0, 1 - j * j / (ry * ry))); const a = Math.round(cx - w), b = Math.round(cx + w); if (b > a) x.fillRect(a, Math.round(cy + j), b - a, 1); }
}
// ===== ART BIBLE: aturan gaya (diambil dari gambar referensi) =====
// - Cahaya dari kiri-atas. Bayangan bergeser ke biru/teal, sorotan bergeser ke kuning.
// - Garis tepi BERWARNA: warna gelap dari isi di sebelahnya, bukan hitam.
// - Palet cerah, kontras lembut, 4-5 tingkat per material.
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hsl2hex(h, s, l) { h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r, g, b; if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]; return r2h((r + m) * 255, (g + m) * 255, (b + m) * 255); }
const _tone = new Map();
function hueToward(h, t, a) { let d = ((t - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), a); }
function toneC(hex, f) {
  const k = hex + f; let v = _tone.get(k); if (v) return v;
  let [h, s, l] = rgb2hsl(...h2r(hex));
  if (f < 0) { h = hueToward(h, 235, -f * 38); l = l * (1 + f * .85); s = Math.min(1, s + -f * .08); }
  else { h = hueToward(h, 55, f * 26); l = l + (1 - l) * f * .9; s = Math.max(0, s - f * .05); }
  v = hsl2hex(h, s, Math.max(0, Math.min(1, l))); _tone.set(k, v); return v;
}
function outline(c, col) {
  const w = c.width, h = c.height, x = c.getContext('2d', { willReadFrequently: true }), d = x.getImageData(0, 0, w, h).data;
  const A = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 40;
  const [o, ox] = mk(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (A(i, j)) continue; let r = 0, g = 0, b = 0, n = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (A(i + dx, j + dy)) { const k = ((j + dy) * w + i + dx) * 4; r += d[k]; g += d[k + 1]; b += d[k + 2]; n++; }
    if (!n) continue;
    ox.fillStyle = col === 'force' ? OUT : toneC(r2h(r / n, g / n, b / n), -.72); ox.fillRect(i, j, 1, 1);
  }
  x.globalCompositeOperation = 'destination-over'; x.drawImage(o, 0, 0); x.globalCompositeOperation = 'source-over';
  return c;
}
function flipC(c) { const [f, x] = mk(c.width, c.height); x.scale(-1, 1); x.drawImage(c, -c.width, 0); return f; }
// gabungkan beberapa frame (kanvas) jadi satu strip
// Kanvas kosong (dipakai gambar-gambar objek baru di art/nature/, art/buildings/, interior.js)
function mkC(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return c; }
function strip(frames) {
  const w = frames[0].width, h = frames[0].height, [c, x] = mk(w * frames.length, h);
  frames.forEach((f, i) => x.drawImage(f, i * w, 0)); return { c, fw: w, fh: h, n: frames.length };
}
const SHADEK = 'HCPYAMKWR';
function renderMap(rows, pal) {
  { const W = Math.max(...rows.map(r => r.length)); rows = rows.map(r => r.padEnd(W, '.')); }
  const h = rows.length, w = rows[0].length, [c, x] = mk(w + 2, h + 2);
  const at = (xx, yy) => yy >= 0 && yy < h && xx >= 0 && xx < w && rows[yy][xx] !== '.';
  const same = (xx, yy, ch) => yy >= 0 && yy < h && xx >= 0 && xx < w && rows[yy][xx] === ch;
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const ch = rows[yy][xx]; if (ch === '.') continue; let col = pal[ch]; if (!col) continue;
    if (SHADEK.includes(ch)) { if (!same(xx, yy + 1, ch) || !same(xx + 1, yy, ch)) col = toneC(col, -.22); else if (!same(xx, yy - 1, ch) || !same(xx - 1, yy, ch)) col = toneC(col, .2); }
    fr(x, col, xx + 1, yy + 1, 1, 1);
  }
  return c;
}
