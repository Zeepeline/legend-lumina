'use strict';
// Seni prosedural prototipe isometrik (gaya "Senja Emas": rumput kuning-hijau, tanah oker, bayangan zaitun, cahaya dari kiri atas).
// Ubin belah ketupat 32×16 digambar per piksel (tajam, tanpa anti-alias). Rumah isometrik digambar dari poligon lalu alfanya ditegaskan.
const PAL = {
  grass: ['#5ea338', '#579c33', '#4c8a2b', '#6aaf42', '#3b6c20'], grassDk: '#3b6c20', grassRim: '#2f5a1a',
  rot: ['#6a5a72', '#5e5068', '#74647c', '#4a3e54'], rotCrack: '#a070c8',
  dirt: ['#c8a868', '#bf9f60', '#ad8f53', '#d2b474'], dirtDk: '#957a46',
  stone: ['#b9ad8a', '#a99e7d', '#c7bc98', '#9a8f70'], stoneGap: '#7d735a',
  water: ['#3a88c8', '#4b98dc', '#2f74ae'], waterDk: '#245a8a', farm: ['#8a6a3a', '#7d5f33', '#94733f'], farmRow: '#6a4f2a',
  cliffL: ['#8e948c', '#80867e', '#9ba299'], cliffR: ['#5a6058', '#4e544c', '#686e66'], cliffRoot: '#343832',
  shadow: 'rgba(30,34,28,.32)', outline: '#20241e',
};
function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const inDia = (px, py) => Math.abs(px + .5 - 16) / 16 + Math.abs(py + .5 - 8) / 8 <= 1;

// satu ubin: jenis + varian (deterministik dari hash)
function tileCanvas(kind, v, sc) {
  const tex = sc && sc.textures && sc.textures.exists('iso_tileset') ? sc.textures.get('iso_tileset').getSourceImage() : null;
  if (tex && (kind === 'grass' || kind === 'dirt')) {
    const c = mkCanvas(32, 16), x = c.getContext('2d');
    const col = v % 4;
    const row = kind === 'grass' ? (v < 4 ? 0 : 1) : 2;
    x.drawImage(tex, col * 32, row * 16, 32, 16, 0, 0, 32, 16);
    return c;
  }
  const c = mkCanvas(32, 16), x = c.getContext('2d'), img = x.createImageData(32, 16), D = img.data;
  const set = (px, py, col) => { const [r, g, b] = hexRGB(col), i = (py * 32 + px) * 4; D[i] = r; D[i + 1] = g; D[i + 2] = b; D[i + 3] = 255; };
  for (let py = 0; py < 16; py++) for (let px = 0; px < 32; px++) {
    if (!inDia(px, py)) continue; const n = hash2(px + v * 37, py + v * 11, kind.length);
    let col;
    if (kind === 'grass') col = n < .62 ? PAL.grass[0] : n < .8 ? PAL.grass[1] : n < .9 ? PAL.grass[2] : n < .97 ? PAL.grass[3] : PAL.grass[4];
    else if (kind === 'dirt') col = n < .6 ? PAL.dirt[0] : n < .82 ? PAL.dirt[1] : n < .94 ? PAL.dirt[2] : n < .985 ? PAL.dirt[3] : PAL.dirtDk;
    else if (kind === 'stone') {
      const gx = (px + Math.floor(py / 4) * 3) % 8, gy = py % 4;
      col = gx === 0 || gy === 0 ? PAL.stoneGap : PAL.stone[Math.floor(hash2(Math.floor((px + Math.floor(py / 4) * 3) / 8), Math.floor(py / 4), v) * 4)];
    }
    else if (kind === 'rot') col = n < .03 ? PAL.rotCrack : PAL.rot[Math.floor(hash2(px >> 1, py >> 1, v + 7) * 4)];
    else if (kind === 'water') col = n < .7 ? PAL.water[0] : n < .9 ? PAL.water[1] : PAL.water[2];
    else if (kind === 'farm') col = (py + Math.floor(px / 2)) % 4 === 0 ? PAL.farmRow : PAL.farm[Math.floor(n * 3)];
    set(px, py, col);
  }
  // rumput: helai kecil lebih gelap/terang
  if (kind === 'grass') for (let i = 0; i < 5; i++) {
    const px = 6 + Math.floor(hash2(i, v, 3) * 20), py = 4 + Math.floor(hash2(v, i, 5) * 8);
    if (inDia(px, py) && inDia(px, py - 1)) { set(px, py, PAL.grassDk); set(px, py - 1, PAL.grass[3]); }
  }
  x.putImageData(img, 0, 0); return c;
}

// tegaskan alfa (hilangkan anti-alias kanvas) → tepi piksel tajam
function crispAlpha(c) {
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), D = d.data;
  for (let i = 3; i < D.length; i += 4) D[i] = D[i] >= 128 ? 255 : 0;
  x.putImageData(d, 0, 0); return c;
}
function poly(x, pts, col) { x.fillStyle = col; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) x.lineTo(p[0], p[1]); x.closePath(); x.fill(); }

// Rumah isometrik: tapak W×D ubin, dinding setinggi wh px, atap pelana (bubungan searah sumbu x).
// Koordinat kanvas: titik (x,y,z) dunia relatif sudut atas tapak → (ox + x - y, oy + (x + y)/2 - z).
function houseCanvas(o) {
  const T = ISO.T, W = o.w * T, D = o.d * T, wh = o.wall || 26, rh = o.roofH || 22, ov = 4;
  const cw = W + D + 2 * ov + 2, ch = (W + D) / 2 + wh + rh + 2 * ov + 4, ox = D + ov + 1, oy = wh + rh + ov + 2;
  const c = mkCanvas(cw, ch), x = c.getContext('2d'), P = (px, py, z) => [ox + px - py, oy + (px + py) / 2 - z];
  const wallL = o.wallCol || '#e8d2a6', wallR = o.wallColDk || '#c2a77c', beam = o.beam || '#6a4a2c', roof = o.roof || ['#c9a24e', '#a8843c', '#8a6a2e'];
  // dinding depan-kiri (menghadap +y, terang) & depan-kanan (menghadap +x, gelap)
  poly(x, [P(0, D, 0), P(W, D, 0), P(W, D, wh), P(0, D, wh)], wallL);
  poly(x, [P(W, 0, 0), P(W, D, 0), P(W, D, wh), P(W, 0, wh)], wallR);
  // kayu rangka: tiang & balok
  x.strokeStyle = beam; x.lineWidth = 2;
  const line = (a, b) => { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); };
  for (let i = 0; i <= o.w; i++) line(P(i * T, D, 0), P(i * T, D, wh));
  for (let j = 0; j <= o.d; j++) line(P(W, j * T, 0), P(W, j * T, wh));
  line(P(0, D, wh * .55), P(W, D, wh * .55)); line(P(W, 0, wh * .55), P(W, D, wh * .55));
  line(P(0, D, 1), P(W, D, 1)); line(P(W, 0, 1), P(W, D, 1));
  // pintu (dinding kiri, tengah) & jendela
  const dc = Math.floor(o.w / 2) * T + T / 2;
  poly(x, [P(dc - 5, D, 0), P(dc + 5, D, 0), P(dc + 5, D, 15), P(dc - 5, D, 15)], '#4a3220');
  poly(x, [P(dc - 4, D, 0), P(dc + 4, D, 0), P(dc + 4, D, 14), P(dc - 4, D, 14)], '#6e4a2c');
  const win = (pts, lit) => { poly(x, pts.map(p => [p[0], p[1]]), '#3a2f22'); };
  for (let i = 0; i < o.w; i++) { const cx = i * T + T / 2; if (Math.abs(cx - dc) < 10) continue;
    poly(x, [P(cx - 4, D, wh * .62), P(cx + 4, D, wh * .62), P(cx + 4, D, wh * .9), P(cx - 4, D, wh * .9)], '#3a2f22');
    poly(x, [P(cx - 3, D, wh * .66), P(cx + 3, D, wh * .66), P(cx + 3, D, wh * .86), P(cx - 3, D, wh * .86)], '#e8c870'); }
  for (let j = 0; j < o.d; j++) { const cy = j * T + T / 2;
    poly(x, [P(W, cy - 4, wh * .62), P(W, cy + 4, wh * .62), P(W, cy + 4, wh * .9), P(W, cy - 4, wh * .9)], '#2a2218');
    poly(x, [P(W, cy - 3, wh * .66), P(W, cy + 3, wh * .66), P(W, cy + 3, wh * .86), P(W, cy - 3, wh * .86)], '#b89a52'); }
  // atap pelana: bubungan di y = D/2 setinggi wh+rh, juntai ov
  const zr = wh + rh, ym = D / 2;
  poly(x, [P(-ov, -ov, wh - 2), P(W + ov, -ov, wh - 2), P(W + ov, ym, zr), P(-ov, ym, zr)], roof[2]); // sisi belakang (gelap)
  poly(x, [P(-ov, D + ov, wh - 2), P(W + ov, D + ov, wh - 2), P(W + ov, ym, zr), P(-ov, ym, zr)], roof[0]); // sisi depan
  poly(x, [P(W, 0, wh), P(W, D, wh), P(W, ym, zr)], wallR); // segitiga pelana kanan
  line(P(W, 0, wh), P(W, ym, zr)); line(P(W, D, wh), P(W, ym, zr));
  // baris atap (jerami/genteng)
  x.strokeStyle = roof[1]; x.lineWidth = 1;
  for (let k = 1; k < 5; k++) { const t = k / 5; line(P(-ov, ym + (D / 2 + ov) * t, zr - (rh + 2) * t), P(W + ov, ym + (D / 2 + ov) * t, zr - (rh + 2) * t)); }
  x.strokeStyle = '#f0d890'; line(P(-ov, ym, zr), P(W + ov, ym, zr));
  // cerobong
  if (o.chimney) { const cx = W * .7; poly(x, [P(cx, ym - 3, zr - 6), P(cx + 6, ym - 3, zr - 6), P(cx + 6, ym - 3, zr + 10), P(cx, ym - 3, zr + 10)], '#8a7a66');
    poly(x, [P(cx + 6, ym - 3, zr - 6), P(cx + 6, ym + 3, zr - 6), P(cx + 6, ym + 3, zr + 10), P(cx + 6, ym - 3, zr + 10)], '#6a5c4c'); }
  crispAlpha(c);
  // garis tepi gelap 1 px di sekeliling siluet
  const d = x.getImageData(0, 0, cw, ch), A = d.data, out = new Uint8Array(cw * ch);
  for (let py = 0; py < ch; py++) for (let px = 0; px < cw; px++) {
    if (A[(py * cw + px) * 4 + 3]) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qx = px + dx, qy = py + dy; if (qx >= 0 && qy >= 0 && qx < cw && qy < ch && A[(qy * cw + qx) * 4 + 3]) { out[py * cw + px] = 1; break; } }
  }
  const [r, g, b] = hexRGB(PAL.outline);
  for (let i = 0; i < out.length; i++) if (out[i]) { A[i * 4] = r; A[i * 4 + 1] = g; A[i * 4 + 2] = b; A[i * 4 + 3] = 255; }
  x.putImageData(d, 0, 0);
  return { c, ox, oy };
}

// tekstur efek: bulan sabit tebasan, cincin bahaya, titik partikel, bayangan elips
function fxTextures(T) {
  const add = (k, w, h, fn) => { if (T.exists(k)) return; const c = mkCanvas(w, h); fn(c.getContext('2d'), c); T.addCanvas(k, c); };
  add('fx_slash', 64, 64, (x) => {
    for (let i = 0; i < 6; i++) { x.strokeStyle = `rgba(255,${246 - i * 6},${214 - i * 20},${.95 - i * .14})`; x.lineWidth = 7 - i;
      x.beginPath(); x.arc(32, 32, 24 - i * 1.4, -1.25, 1.25); x.stroke(); }
    x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(32, 32, 26, -1.05, 1.05); x.stroke();
  });
  add('fx_dot', 4, 4, x => { x.fillStyle = '#fff'; x.fillRect(1, 0, 2, 4); x.fillRect(0, 1, 4, 2); });
  add('fx_sq', 2, 2, x => { x.fillStyle = '#fff'; x.fillRect(0, 0, 2, 2); });
  add('fx_shadow', 24, 12, x => { x.fillStyle = 'rgba(30,28,14,.38)'; x.beginPath(); x.ellipse(12, 6, 11, 5, 0, 0, 7); x.fill(); });
  add('fx_dust', 40, 20, x => { x.strokeStyle = 'rgba(240,226,192,.7)'; x.lineCap = 'round';
    for (let i = 0; i < 3; i++) { x.lineWidth = 4 - i; x.beginPath(); x.ellipse(20, 14, 16 - i * 2, 7 - i, 0, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } });
}

// Varian rumah dari SATU gambar pixel art (house_a) agar semua rumah sama detailnya: atap diwarnai ulang (hue/saturasi,
// kecerahan tiap piksel dipertahankan → shading & detail tetap), plester sedikit digeser. Pintu & bunga dikecualikan.
const HOUSE_VARIANTS = {
  merah: null,
  jerami: { roof: [44, .55, 1.08], wall: [38, .32] },
  batu: { roof: [210, .16, .92], wall: [30, .18] },
  kayu: { roof: [24, .45, .78], wall: [32, .4] },
  lumut: { roof: [150, .32, .9], wall: [40, .25] }, /* sentuhan fantasi: atap genteng hijau-teal */
};
function rgb2hsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx]; }
function hsv2rgb(h, s, v) { const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; }
function houseVariant(img, o) {
  const c = mkCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); if (!o) return c;
  const d = x.getImageData(0, 0, c.width, c.height), D = d.data, W = c.width, H = c.height;
  for (let i = 0; i < D.length; i += 4) {
    if (!D[i + 3]) continue; const px = (i / 4) % W, py = Math.floor(i / 4 / W), [h, s, v] = rgb2hsv(D[i], D[i + 1], D[i + 2]);
    const keep = py > H * .47 && px < W * .55; // pintu, jendela & kotak bunga
    if (!keep && (h < 32 || h > 345) && s > .42 && v > .25 && py < H * .72) { const [r, g, b] = hsv2rgb(o.roof[0], Math.min(1, s * o.roof[1] * 1.6), Math.min(1, v * o.roof[2]));
      D[i] = r; D[i + 1] = g; D[i + 2] = b; continue; }
    if (o.wall && h > 25 && h < 50 && s < .45 && s > .12 && v > .7) { const [r, g, b] = hsv2rgb(o.wall[0], s * (o.wall[1] / .3), v); D[i] = r; D[i + 1] = g; D[i + 2] = b; }
  }
  x.putImageData(d, 0, 0); return c;
}
