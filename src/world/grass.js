'use strict';
// RUMPUT — SATU SUMBER untuk seluruh dunia. Ganti tekstur rumput cukup di sini (atau ganti file PNG-nya):
//   base/light/dark = kunci gambar di assets/img/ground/ (petak berulang, ukuran bebas, mis. 128×128).
// Semua jalur tanah lewat grassPass(): gambar tanah utuh per peta (gnd_<peta>_custom), tanah prosedural & gradasi
// perbatasan (genGround), lantai hutan pengisi (wilds.js). Piksel "rumput" (hijau) diganti tekstur GRASS dengan
// terang-gelap asli dipertahankan → bayangan, tepi jalan, rumput gelap di hutan tetap terbaca.
// Tidak tersentuh: jalan/tanah/batu/air/salju (bukan hijau), hiasan sprite di atas tanah (clutter_*, deco_*, pulau rumput).
const GRASS = {
  on: true,
  base: 'gnd_grass', light: 'gnd_grass_light', dark: 'gnd_grass_dark',
  patch: 70,        // ukuran bercak terang/gelap (px)
  ref: 300,         // jumlah R+G+B rumput "normal" pada gambar lama → acuan terang-gelap
  skip: ['swamp', 'snow', 'cave', 'room'],  // tanah khas (M.ground atau M.id) yang tidak diganti
};
function grassTiles() {
  if (grassTiles.t) return grassTiles.t;
  const b = typeof getTileData === 'function' && getTileData(GRASS.base); if (!b) return null;
  const l = getTileData(GRASS.light) || b, d = getTileData(GRASS.dark) || b;
  grassTiles.t = [b, l, d]; return grassTiles.t;
}
const grassSS = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
function grassTex(T, X, Y, o) {
  const w = T.w || T.size || 128, h = T.h || T.size || 128;
  const i = ((((Y % h) + h) % h) * w + (((X % w) + w) % w)) * 4; o[0] = T[i]; o[1] = T[i + 1]; o[2] = T[i + 2];
}
// D = data ImageData (RGBA) berukuran W×H; (X0, Y0) = koordinat GLOBAL piksel kiri-atas (pola menyambung lintas wilayah)
function grassPass(D, W, H, X0, Y0, M) {
  if (!GRASS.on || (M && (GRASS.skip.includes(M.ground) || GRASS.skip.includes(M.id)))) return false;
  const T = grassTiles(); if (!T) return false;
  const a = [0, 0, 0], q = [0, 0, 0];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4; if (D[i + 3] < 8) continue;
    const r = D[i], g = D[i + 1], b = D[i + 2];
    if (!(g > r + 10 && g > b + 8)) continue; /* bukan rumput */
    const X = X0 + x, Y = Y0 + y, n = vnoise(X, Y, GRASS.patch, 11);
    grassTex(T[0], X, Y, a);
    if (n < .4) { const k = grassSS(.3, .4, n); grassTex(T[2], X, Y, q); for (let j = 0; j < 3; j++) a[j] = q[j] + (a[j] - q[j]) * k; }
    else if (n > .62) { const k = grassSS(.62, .72, n); grassTex(T[1], X, Y, q); for (let j = 0; j < 3; j++) a[j] += (q[j] - a[j]) * k; }
    const f = Math.min(1.15, Math.max(.45, (r + g + b) / GRASS.ref));
    D[i] = a[0] * f; D[i + 1] = a[1] * f; D[i + 2] = a[2] * f;
  }
  return true;
}
// untuk kanvas jadi (gambar utuh per peta, lantai hutan pengisi)
function grassCanvas(ctx, W, H, X0, Y0, M) {
  if (!GRASS.on) return;
  const im = ctx.getImageData(0, 0, W, H);
  if (grassPass(im.data, W, H, X0, Y0, M)) ctx.putImageData(im, 0, 0);
}
