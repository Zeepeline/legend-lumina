'use strict';
// Rig piksel NPC: dari 1 potret (atau lembar Mila) dibangun pose jalan/napas/berlutut/jatuh lewat potong-geser-cermin kanvas (tanpa warna baru)
// Pita badan (kepala/badan/kaki) dideteksi dari baris piksel buram; identitas, palet & siluet tetap milik gambar asli (ANIMATION_RULES).
const NPC_FR = {}; // ch -> { walk:{down,up,side}, top, offer, poses:true }
const NPC_RIG_DIRS = ['down', 'up', 'side'];
function rigCv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').imageSmoothingEnabled = false; return c; }
function rigCrop(img, sx, sy, w, h) { const c = rigCv(w, h); c.getContext('2d').drawImage(img, sx, sy, w, h, 0, 0, w, h); return c; }
/* pita badan: top..neck = kepala, neck..hip = badan, hip..bot = kaki; cx = pusat kolom */
function rigBands(c) {
  const W = c.width, H = c.height, d = c.getContext('2d').getImageData(0, 0, W, H).data;
  const wid = [], runs = []; let top = -1, bot = -1, x0 = W, x1 = 0;
  for (let y = 0; y < H; y++) {
    let n = 0, r = 0, prev = false;
    for (let x = 0; x < W; x++) {
      const on = d[(y * W + x) * 4 + 3] > 0;
      if (on) { n++; if (!prev) r++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
      prev = on;
    }
    wid[y] = n; runs[y] = r;
    if (n) { if (top < 0) top = y; bot = y; }
  }
  if (top < 0) return { top: 0, bot: H - 1, neck: 4, hip: H - 4, cx: W >> 1, x0: 0, x1: W - 1, W, H };
  const h = bot - top + 1;
  let neck = top + Math.round(h * .4), best = 1e9;
  for (let y = top + Math.round(h * .3); y <= top + Math.round(h * .52); y++) if (wid[y] < best) { best = wid[y]; neck = y; }
  let leg = 0; while (bot - leg >= top && runs[bot - leg] >= 2) leg++;
  leg = Math.max(3, Math.min(leg, Math.round(h * .32)));
  const hip = Math.max(neck + 3, bot - leg + 1);
  return { top, bot, neck, hip, cx: Math.round((x0 + x1 + 1) / 2), x0, x1, W, H };
}
/* susun ulang pita: dT/dL tambah-kurangi tinggi badan/kaki, lf skala kaki, sh miring badan (piksel di bahu), hx/hy geser kepala,
   lx0/ly0 & lx1/ly1 geser kaki kiri/kanan */
function rigCompose(src, B, o = {}) {
  const W = B.W, c = rigCv(W, B.H), x = c.getContext('2d');
  const hH = B.neck - B.top, tH0 = B.hip - B.neck, lH0 = B.bot - B.hip + 1;
  const lH = Math.max(2, Math.round(o.lf ? lH0 * o.lf : lH0 + (o.dL || 0))), tH = Math.max(2, tH0 + (o.dT || 0));
  const lt = B.bot - lH + 1, tt = lt - tH, ht = tt - hH, sh = o.sh || 0;
  x.drawImage(src, 0, B.hip, B.cx, lH0, (o.lx0 || 0), lt + (o.ly0 || 0), B.cx, lH);
  x.drawImage(src, B.cx, B.hip, W - B.cx, lH0, B.cx + (o.lx1 || 0), lt + (o.ly1 || 0), W - B.cx, lH);
  for (let i = 0; i < tH; i++) {
    const sy = B.neck + Math.min(tH0 - 1, Math.floor(i * tH0 / tH)), dx = tH > 1 ? Math.round(sh * (tH - 1 - i) / (tH - 1)) : 0;
    x.drawImage(src, 0, sy, W, 1, dx, tt + i, W, 1);
  }
  x.drawImage(src, 0, B.top, W, hH, sh + (o.hx || 0), ht + (o.hy || 0), W, hH);
  return c;
}
/* tubuh tergeletak: putar tepat 90 derajat searah jarum jam (kepala ke kanan), alas = garis kaki semula */
function rigLie(src, B) {
  const W = B.W, H = B.H, s = src.getContext('2d').getImageData(0, 0, W, H), o = rigCv(W, H), ox = o.getContext('2d'), od = ox.createImageData(W, H);
  const sx = Math.round(W / 2 - ((H - 1 - B.bot) + (H - 1 - B.top)) / 2), sy = B.bot - B.x1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4; if (!s.data[i + 3]) continue;
    const nx = H - 1 - y + sx, ny = x + sy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const j = (ny * W + nx) * 4; od.data[j] = s.data[i]; od.data[j + 1] = s.data[i + 1]; od.data[j + 2] = s.data[i + 2]; od.data[j + 3] = 255;
  }
  ox.putImageData(od, 0, 0); return o;
}
/* semua pose dari frame diam; kunci = nama frame */
function rigPoses(base, B) {
  const kn = { lf: .45, dT: -1, hy: 1 };
  return {
    w_a: rigCompose(base, B, { lx0: -1, lx1: 1, ly0: -1 }), w_b: rigCompose(base, B, { lx0: -1, lx1: 1, ly1: -1 }), w_p: rigCompose(base, B, { dT: 1 }),
    crouch: rigCompose(base, B, { dT: -1, dL: -1 }), stretch: rigCompose(base, B, { dT: 1 }),
    kneel: rigCompose(base, B, kn), kneel2: rigCompose(base, B, { ...kn, sh: 1, hy: 2 }), pray: rigCompose(base, B, { lf: .45, dT: -1 }),
    lean0: rigCompose(base, B, { sh: 1 }), lean1: rigCompose(base, B, { sh: 2, hx: 1 }),
    hurt: rigCompose(base, B, { sh: 3, hx: 1, dT: -1, hy: 1 }), stagger: rigCompose(base, B, { lf: .6, dT: -1, sh: 2, hy: 1 }), lie: rigLie(base, B),
  };
}
function rigPerDir(base, B) { return { br: rigCompose(base, B, { dT: 1 }), nod: rigCompose(base, B, { hy: 1 }) }; }
/* daftar [nama, kanvas] lengkap dari tiga frame diam (down/up/side) -> dipakai potret & karakter kode */
function rigFrames(b, fw, fh) {
  const out = [], Bd = rigBands(b.down), P = rigPoses(b.down, Bd);
  for (const n in P) out.push([n, P[n]]);
  const seen = new Map();
  for (const d of NPC_RIG_DIRS) {
    const key = b[d] === b.down ? 'down' : d;
    if (!seen.has(key)) seen.set(key, rigPerDir(b[d], rigBands(b[d])));
    const pd = seen.get(key); out.push(['br' + d, pd.br], ['nod' + d, pd.nod]);
  }
  return { frames: out, top: Bd.top };
}
/* frame jalan standar bila ch tak punya daftar sendiri */
function npcWalkFrames(k, d) { const F = NPC_FR[k]; return F && F.walk ? F.walk[d] : [d + '1', d + '0', d + '2', d + '0']; }
/* potret 32x32 atau lembar multi-arah 48x40 -> tekstur 'ch_<k>': 12 frame standar + pose */
function regNpcRig(T, k, img) {
  let FW = 32, FH = 32, F = [], S = IMGEL.mila_sheet;
  const walk = { down: ['down1', 'down3', 'down2', 'down3'], up: ['up1', 'up3', 'up2', 'up3'], side: ['side1', 'side3', 'side2', 'side3'] };
  let b, extra = [];
  const isSheet48 = img && img.width === 192 && img.height >= 240;
  const mila = k === 'mila' && S && S.width >= 128 && S.height >= 224;
  if (isSheet48) {
    FW = 48; FH = 40;
    const f = (r, c) => rigCrop(img, c * FW, r * FH, FW, FH);
    const map = {
      down: [[0, 0], [1, 0], [1, 1], [1, 2]],
      up: [[2, 0], [3, 0], [3, 1], [3, 2]],
      side: [[4, 0], [5, 0], [5, 1], [5, 2]]
    };
    for (const d of NPC_RIG_DIRS) map[d].forEach(([r, c], i) => F.push([d + i, f(r, c)]));
    F.push(['down4', f(1, 3)], ['up4', f(3, 3)], ['side4', f(5, 3)]);
    walk.down = ['down1', 'down2', 'down3', 'down4'];
    walk.up = ['up1', 'up2', 'up3', 'up4'];
    walk.side = ['side1', 'side2', 'side3', 'side4'];
    F.push(['brdown', f(0, 1)], ['brup', f(2, 1)], ['brside', f(4, 1)]);
    F.push(['noddown', f(6, 1)], ['nodup', f(2, 2)], ['nodside', f(6, 2)]);
    for (let i = 0; i < 4; i++) {
      F.push(['offer' + i, f(6, i)]);
      F.push(['act' + i, f(7, i)]);
    }
    b = { down: f(0, 0), up: f(2, 0), side: f(4, 0) };
  } else if (mila) {
    const f = (r, c) => rigCrop(S, c * FW, r * FW, FW, FW);
    const map = { down: [[1, 0], [1, 1], [1, 3], [1, 2]], up: [[2, 0], [3, 1], [3, 3], [3, 2]], side: [[4, 0], [5, 0], [5, 1], [5, 2]] };
    for (const d of NPC_RIG_DIRS) map[d].forEach(([r, c], i) => F.push([d + i, f(r, c)]));
    F.push(['side4', f(5, 3)]); walk.side = ['side1', 'side2', 'side3', 'side4'];
    for (let i = 0; i < 4; i++) F.push(['offer' + i, f(0, i)]);
    b = { down: f(1, 0), up: f(2, 0), side: f(4, 0) };
  } else {
    const c = rigCrop(img, 0, 0, FW, FW), B = rigBands(c);
    const st = [c, rigCompose(c, B, { lx0: -1, lx1: 1, ly0: -1 }), rigCompose(c, B, { lx0: -1, lx1: 1, ly1: -1 }), rigCompose(c, B, { dT: 1 })];
    for (const d of NPC_RIG_DIRS) st.forEach((cv, i) => F.push([d + i, cv]));
    b = { down: c, up: c, side: c };
  }
  const R = rigFrames(b, FW, FH); extra = R.frames;
  const all = F.concat(extra), cv = rigCv(FW * all.length, FH), x = cv.getContext('2d'), pos = new Map();
  all.forEach(([n, c], i) => { if (!pos.has(c)) { pos.set(c, pos.size); x.drawImage(c, pos.get(c) * FW, 0); } });
  const t = T.addCanvas('ch_' + k, cv);
  for (const [n, c] of all) if (!t.has(n)) t.add(n, 0, pos.get(c) * FW, 0, FW, FH);
  NPC_FR[k] = { walk, top: R.top, offer: !!(mila || isSheet48), poses: true, fw: FW, fh: FH };
}
/* karakter buatan kode (strip 12 frame fw x fh): salin strip lalu tambah pose di kanan; kembalikan { cv, ex:[[nama,x]] } */
function rigAppend(sc, fw, fh, k) {
  const fr = n => rigCrop(sc, n * fw, 0, fw, fh);
  const b = { down: fr(0), up: fr(4), side: fr(8) }, R = rigFrames(b, fw, fh), cv = rigCv(sc.width + fw * R.frames.length, fh), x = cv.getContext('2d');
  x.drawImage(sc, 0, 0); const ex = [];
  R.frames.forEach(([n, c], i) => { x.drawImage(c, sc.width + i * fw, 0); ex.push([n, sc.width + i * fw]); });
  NPC_FR[k] = { top: R.top, offer: false, poses: true, fw, fh };
  return { cv, ex };
}
