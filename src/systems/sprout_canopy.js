'use strict';
// DETAIL TAJUK POHON LEBAR — tajuk Sprout (24×31, dibesarkan 3×) berupa gumpalan bundar halus. Di sini dipecah jadi gerombol daun berlapis
// (acuan pemilik: assets/ref/Terrain/Resources/Wood/Trees/Tree3.png): tepi bergelombang, garis luar gelap, gradasi terang di atas → gelap di bawah,
// lengkung bayangan di bawah tiap gerombol, kilau di kiri-atasnya, dan garis tumpang tindih antar gerombol.
// Bekerja di piksel 3× SEBELUM diwarnai varian (warna tetap hijau dominan → tetap ikut tint hutan/salju/rawa). Siluet hanya DIPANGKAS (tidak membesar):
// ukuran, tabrakan & titik pangkal batang tidak berubah. Matikan: CANOPY.on = false.
const CANOPY = { on: true, step: 14, steps: 7 };
function sproutCanopyDetail(d, W, H) {
  if (!CANOPY.on) return;
  const at = (x, y) => (y * W + x) * 4;
  let lim = H - 1; /* batas bawah tajuk; rumput kecil di kaki batang (juga hijau) tidak ikut dihitung */
  const leaf = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y > lim) return false;
    const i = at(x, y); return d[i + 3] > 128 && d[i + 1] > d[i] + 4 && d[i + 1] >= d[i + 2];
  };
  for (let y = 0, started = false; y < H; y++) { /* tajuk = deretan baris daun yang menyambung dari atas */
    let n = 0; for (let x = 0; x < W; x++) if (leaf(x, y)) n++;
    if (n >= 6) started = true; else if (started) { lim = y - 1; break; }
  }
  let top = H, bot = 0, left = W, right = 0; const cols = [];
  for (let y = 0; y <= lim; y++) for (let x = 0; x < W; x++) if (leaf(x, y)) {
    top = Math.min(top, y); bot = Math.max(bot, y); left = Math.min(left, x); right = Math.max(right, x);
    const i = at(x, y); cols.push([d[i] + d[i + 1] + d[i + 2], i]); /* [kecerahan, indeks] */
  }
  if (cols.length < 200) return;
  cols.sort((a, b) => a[0] - b[0]);
  const avg = (a, b) => {
    let r = 0, g = 0, bl = 0;
    for (let k = a; k < b; k++) { const i = cols[k][1]; r += d[i]; g += d[i + 1]; bl += d[i + 2]; }
    return [r / (b - a), g / (b - a), bl / (b - a)];
  };
  const q = Math.max(1, Math.floor(cols.length * .12)), lo = avg(0, q), hi = avg(cols.length - q, cols.length);
  const deep = [lo[0] * .66, lo[1] * .7, lo[2] * .74 + 6], N = CANOPY.steps, ramp = [];
  for (let k = 0; k < N; k++) { /* gelap dalam → terang (dua langkah teratas sedikit hangat kena cahaya) */
    const f = k / (N - 1), warm = k >= N - 2 ? [10, 5, -12] : [0, 0, 0];
    const c = [0, 1, 2].map(j => deep[j] + (hi[j] - deep[j]) * f + warm[j]);
    if (c[1] < c[0] + 6) c[1] = c[0] + 6; if (c[2] > c[1]) c[2] = c[1]; /* tetap 'daun' bagi tint varian */
    ramp.push(c.map(v => Math.max(0, Math.min(255, Math.round(v)))));
  }
  const edge = [lo[0] * .42, lo[1] * .52 + 4, lo[2] * .5 + 8].map(Math.round);
  if (edge[1] < edge[0] + 6) edge[1] = edge[0] + 6;
  if (edge[2] > edge[1]) edge[2] = edge[1];
  // gerombol: kisi berselang-seling bergeser acak, hanya yang berpusat di dalam tajuk
  const S = CANOPY.step, R = S * .74, cl = [];
  for (let j = 0, y = top + S * .5; y < bot + S * .5; j++, y += S * .86) for (let x = left + (j % 2 ? S : S * .5); x < right + S * .5; x += S) {
    const cx = x + (hash(j, Math.round(x), 91) - .5) * S * .5;
    const cy = Math.min(bot - 5, y + (hash(Math.round(y), j, 92) - .5) * S * .45); /* baris dasar dijepit ke dalam tajuk */
    if (leaf(Math.round(cx), Math.round(cy))) cl.push([cx, cy]);
  }
  if (cl.length < 6) return;
  const core = (x, y) => leaf(x - 4, y) && leaf(x + 4, y) && leaf(x, y - 4) && leaf(x, y + 4) &&
    leaf(x - 3, y - 3) && leaf(x + 3, y + 3) && leaf(x + 3, y - 3) && leaf(x - 3, y + 3); /* bukan tepi: tak boleh dipangkas */
  for (const c of cl) c.push(R * (.86 + .3 * hash(Math.round(c[0]), Math.round(c[1]), 96))); /* jari tiap gerombol berbeda */
  cl.sort((m, n) => m[1] - n[1]); /* ditumpuk dari atas ke bawah: gerombol bawah menimpa gerombol di atasnya (seperti acuan) */
  const own = new Int16Array(W * H).fill(-1), cover = new Uint8Array(W * H), keep = new Uint8Array(W * H);
  for (let y = top; y <= bot; y++) for (let x = left; x <= right; x++) {
    if (!leaf(x, y)) continue;
    let o = -1, n = 0, nb = 0, nd = 1e9;
    for (let k = 0; k < cl.length; k++) {
      const e = Math.hypot(x - cl[k][0], y - cl[k][1]); if (e < nd) { nd = e; nb = k; }
      if (e <= cl[k][2] + (hash(x, y, 94) - .5) * 2) { o = k; n++; } /* di dalam cakram gerombol (tepi sedikit bergerigi) */
    }
    const p = y * W + x; cover[p] = n;
    if (o >= 0) { own[p] = o; keep[p] = 1; } /* tepi di luar semua cakram dipangkas → siluet bergelombang */
    else if (core(x, y) || (y >= bot - 5 && leaf(x - 3, y) && leaf(x + 3, y))) { own[p] = nb; keep[p] = 1; } /* inti & dasar tajuk (menempel ke batang) tetap */
  }
  const span = Math.max(1, bot - top), out = new Uint8ClampedArray(d.length);
  for (let y = top; y <= bot; y++) for (let x = left; x <= right; x++) {
    const p = y * W + x; if (!keep[p]) continue;
    const [ox, oy, r] = cl[own[p]], dx = x - ox, dy = y - oy, dd = Math.hypot(dx, dy);
    let t = .86 - .74 * ((y - top) / span) + Math.max(-1, Math.min(1, (-dx - dy) / (r * 1.4))) * .13;
    if (dy > 0 && dd > r * .55) t -= .09 + .12 * Math.min(1, (dd - r * .55) / (r * .45)); /* lengkung bayangan di bawah gerombol */
    if (dx + dy < 0 && dd > r * .5 && dd <= r * .92 && dy < r * .25) t += .2; /* kilau di kiri-atas gerombol */
    if (cover[p] >= 2 && dd > r - 2.4 && dy < 0) t += .16; /* tepi atas gerombol yang menimpa gerombol lain: terang */
    if (y < top + span * .55 && hash(x, y, 93) < .05) t += .14; /* percikan cahaya */
    else if (y > top + span * .35 && hash(x, y, 95) < .035) t -= .2; /* bintik daun dalam bayangan */
    const c = ramp[Math.max(0, Math.min(N - 1, Math.round(t * (N - 1))))], i = at(x, y);
    out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; out[i + 3] = 255;
  }
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && out[at(x, y) + 3] > 0;
  for (let y = top; y <= bot; y++) for (let x = left; x <= right; x++) { /* garis luar gelap 1 px di semua tepi tajuk */
    if (!on(x, y) || (on(x - 1, y) && on(x + 1, y) && on(x, y - 1) && on(x, y + 1))) continue;
    const i = at(x, y); out[i] = edge[0]; out[i + 1] = edge[1]; out[i + 2] = edge[2];
  }
  for (let y = top; y <= bot; y++) for (let x = left; x <= right; x++) { /* tulis balik: hanya area tajuk (batang & lainnya tak tersentuh) */
    if (!leaf(x, y)) continue;
    const i = at(x, y), o = out[i + 3];
    if (!o) { d[i + 3] = 0; continue; }
    d[i] = out[i]; d[i + 1] = out[i + 1]; d[i + 2] = out[i + 2]; d[i + 3] = 255;
  }
}
