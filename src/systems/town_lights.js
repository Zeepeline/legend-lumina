'use strict';
// CAHAYA DESA & KOTA — jendela rumah menyala saat malam (kaca pada gambar, kusen & teralis tetap) dan lampu jalan dipindah ke tepi jalan.
// Dimuat paling akhir (sebelum main.js). Jendela: kotak [x,y,w,h] piksel gambar per jenis objek; kaca = piksel gelap/kebiruan di kotak itu.
const TOWN_LIGHTS = {
  lampRx: /^(lamp|lampPost|gpt_city_lamp2?)$/, head: { lamp: 22, lampPost: 34, gpt_city_lamp: 54, gpt_city_lamp2: 50, acadlamp: 54 },
  near: 3, maxR: 14, gap: 64, glass: [255, 176, 56], pool: 24,
};
const TOWN_WIN = {
  houseA: [[68, 72, 12, 12], [92, 114, 14, 16]], houseB: [[60, 72, 16, 18], [86, 120, 16, 16]],
  houseC: [[36, 86, 14, 12], [90, 86, 16, 12]], houseRed: [[94, 112, 16, 16]],
  houseProto: [[90, 120, 18, 16]], blacksmith: [[80, 106, 16, 18]],
  cityHouse1: [[29, 73, 10, 11], [62, 70, 14, 15], [45, 107, 11, 10]], cityHouse2: [[25, 70, 14, 14], [63, 70, 6, 14], [60, 107, 13, 10]],
  cityHouse3: [[47, 44, 6, 13], [47, 68, 14, 14], [38, 106, 10, 8]],
  cityHouse4: [[33, 30, 6, 11], [33, 49, 6, 11], [29, 69, 15, 14], [67, 73, 8, 10], [23, 106, 9, 8]],
  cityHouse5: [[36, 38, 8, 11], [27, 63, 21, 14], [78, 54, 5, 10], [48, 101, 11, 9]],
  barakBayaran: [[21, 74, 7, 18], [86, 74, 8, 18]], balaiDewan: [[42, 102, 25, 24]],
  academy: [[41, 123, 26, 24], [119, 108, 40, 34], [209, 123, 26, 24], [129, 75, 19, 21], [208, 161, 13, 12], [226, 161, 13, 12]],
  acaddorm: [...[20, 45, 71, 97, 124, 148].map(x => [x, 73, 16, 17]), [70, 115, 11, 12]],
  garhall: [[75, 82, 13, 15], [97, 84, 14, 17], [120, 82, 13, 15], [157, 82, 24, 14], [49, 122, 7, 10], [154, 122, 7, 10], [174, 122, 7, 10]],
  garbarracks: [[46, 108, 7, 9], [145, 108, 7, 9], [164, 108, 7, 9]],
  garbarracks2: [[122, 44, 16, 16], [29, 100, 10, 8], [55, 100, 10, 8], [79, 100, 10, 8], [109, 100, 9, 8], [143, 100, 7, 8]],
};
TOWN_WIN.houseBrown = TOWN_WIN.houseRed; /* gambar yang sama (ref_houses.js) */
/* tekstur kaca menyala untuk satu jenis bangunan (hanya piksel kaca) */
function townWinTex(sc, type, s) {
  const key = 'litwin_' + type; if (sc.textures.exists(key)) return key;
  const im = s.texture.getSourceImage(), [c, x] = mk(im.width, im.height); x.drawImage(im, 0, 0);
  const D = x.getImageData(0, 0, c.width, c.height), d = D.data, keep = new Uint8Array(c.width * c.height), [R, G, B] = TOWN_LIGHTS.glass;
  for (const [a, b, w, h] of TOWN_WIN[type]) for (let j = b; j < b + h; j++) for (let i = a; i < a + w; i++) {
    const o = (j * c.width + i) * 4, L = .3 * d[o] + .59 * d[o + 1] + .11 * d[o + 2];
    if (d[o + 3] < 200 || !(L < 52 || (d[o + 2] >= d[o] - 4 && L < 175))) continue;
    const k = 1 - .22 * (j - b) / h; keep[j * c.width + i] = 1; /* atas sedikit lebih terang */
    d[o] = R; d[o + 1] = Math.round(G * k); d[o + 2] = Math.round(B * k);
  }
  for (let k = 0; k < keep.length; k++) if (!keep[k]) d[k * 4 + 3] = 0;
  x.putImageData(D, 0, 0); sc.textures.addCanvas(key, c); return key;
}
/* 0..1: terang jendela rumah ke-k; tiap rumah menyala/padam sedikit berbeda waktu */
function townWinLit(h, k) {
  const on = 17.2 + (k % 10) * .15, off = 5 + (k % 7) * .15;
  if (h >= on) return Math.min(1, (h - on) / .4);
  return h < off ? Math.min(1, (off - h) / .4) : 0;
}
function townSpawnWindows(sc, type, s, x, y, opt) {
  sc.lights = sc.lights.filter(L => !(L.window && Math.abs(L.x - x) === 26 && L.y === y - 22)); /* titik lama di dinding */
  const flip = !!(opt && (opt.flip || opt.flipX)), g = sc.add.image(x, y, townWinTex(sc, type, s)).setOrigin(.5, 1).setDepth(y + .2);
  g.setFlipX(flip).setAlpha(0); const k = Math.abs(Math.round(x * 7 + y * 13));
  (sc.winL = sc.winL || []).push({ g, s, k });
  for (const [a, b, w, h] of TOWN_WIN[type]) {
    const dx = a + w / 2 - s.width / 2; sc.lights.push({ x: Math.round(x + (flip ? -dx : dx)), y: Math.round(y - s.height + b + h / 2), window: 1 });
  }
}
for (const type in TOWN_WIN) {
  const old = OBJ_SPAWN[type];
  OBJ_SPAWN[type] = function (s, x, y, opt, d, t) { if (old) old.call(this, s, x, y, opt, d, t); townSpawnWindows(this, type, s, x, y, opt); };
}
/* sumber cahaya = kepala lampu (dulu 24–28 px untuk semua; lampu akademi & kota-2 tidak bercahaya) */
for (const type in TOWN_LIGHTS.head) {
  const old = OBJ_SPAWN[type];
  OBJ_SPAWN[type] = function (s, x, y, opt, d, t) {
    const n = this.lights.length; if (old) old.call(this, s, x, y, opt, d, t);
    const L = { x, y: y - TOWN_LIGHTS.head[type], big: 1, street: 1 };
    if (this.lights.length > n) Object.assign(this.lights[n], L); else this.lights.push(L);
  };
}
/* lampu di tengah jalan / jauh dari jalan → kotak rumput tepi jalan terdekat yang bebas */
function townLampFit(M, L) {
  if (M._lampFit) return; const E = grassEdgeData(M); if (!E || !E.Wm) return; M._lampFit = 1;
  const S = GRASS_EDGE.cell, C = E.cols, R = E.rows, T = TOWN_LIGHTS, inR = (c, r) => c >= 0 && r >= 0 && c < C && r < R;
  const road = (c, r) => { const k = r * C + c; return inR(c, r) && !E.Wm[k] && !E.grass[k] && !E.strip[k]; };
  const roadIn = (c, r, n) => { for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) if (road(c + i, r + j)) return true; return false; };
  const lamps = L.filter(o => T.lampRx.test(o[0])), solid = [...mapWalls(M), ...blockRects(M)];
  const hidden = []; /* kaki lampu tidak boleh di dalam benda atau tertutup bangunan/pohon di depannya */
  for (const o of L) {
    const d = OBJ[o[0]]; if (!d || lamps.includes(o) || !d.col || !d.col[0]) continue;
    const tall = TOWN_WIN[o[0]] || d.chim ? 130 : d.fade ? 70 : 8, w = Math.max(d.col[0], TOWN_WIN[o[0]] ? 100 : 0);
    hidden.push([o[1] - w / 2, o[2] - Math.max(tall, d.col[1] + d.col[2]), w, Math.max(tall, d.col[1] + d.col[2])]);
  }
  const hit = (x, y, A, p) => A.some(w => x > w[0] - p && x < w[0] + w[2] + p && y > w[1] - p && y < w[1] + w[3] + p);
  const pts = [...(M.doors || []).map(d => [d[0], d[1] + 12, 34]), ...(M.npcs || []).map(n => [n.x, n.y, 22])];
  const free = (o, x, y) => x > 24 && y > 40 && x < M.w - 24 && y < M.h - 24 && !hit(x, y, solid, 6) && !hit(x, y, hidden, 8) &&
    !pts.some(p => Math.hypot(p[0] - x, p[1] - y) < p[2]) && !lamps.some(q => q !== o && Math.hypot(q[1] - x, q[2] - y) < T.gap);
  const log = [];
  for (const o of lamps) {
    if (o[3] && o[3].ok) continue;
    const c = Math.floor(o[1] / S), r = Math.floor((o[2] - 3) / S); if (!road(c, r) && roadIn(c, r, T.near)) continue;
    let best = null, bd = 1e9;
    for (let j = -T.maxR; j <= T.maxR; j++) for (let i = -T.maxR; i <= T.maxR; i++) {
      const a = c + i, b = r + j, k = b * C + a; if (!inR(a, b) || !E.grass[k] || E.Wm[k]) continue;
      if (!road(a + 1, b) && !road(a - 1, b) && !road(a, b + 1) && !road(a, b - 1)) continue;
      const X = a * S + S / 2, Y = b * S + 13, D = Math.hypot(X - o[1], Y - o[2]); if (D < bd && free(o, X, Y)) { bd = D; best = [X, Y]; }
    }
    if (best) { log.push([o[0], o[1], o[2], ...best]); o[1] = best[0]; o[2] = best[1]; } else log.push([o[0], o[1], o[2], 'tanpa tempat']);
  }
  M._lampLog = log;
}
{
  const _mo = mapObjects;
  mapObjects = function (M) {
    const L = _mo.apply(this, arguments);
    if (M && !M.indoor && GRASS_EDGE.maps.includes(M.id)) { try { townLampFit(M, L); } catch (e) { console.warn('town_lights', e); } }
    return L;
  };
  const create0 = World.prototype.create, upd0 = World.prototype.update, fx0 = World.prototype.makeActiveFx, drop0 = World.prototype.dropActiveFx;
  World.prototype.create = function (...a) { this.winL = []; this._lampP = []; return create0.apply(this, a); };
  /* pendar lampu jalan dari kumpulan sendiri: lampu Benua dibuat belakangan, jadi daftar glows sekali-buat tidak memuatnya */
  World.prototype.makeActiveFx = function () {
    fx0.apply(this, arguments); if (!this.glows) return;
    for (const g of this.glows) if (this.lights.some(L => (L.street || L.window) && L.x === g.x && L.y === g.y)) g.destroy();
    this.glows = this.glows.filter(g => g.active);
  };
  World.prototype.dropActiveFx = function () { for (const g of this._lampP || []) g.destroy(); this._lampP = []; return drop0.apply(this, arguments); };
  World.prototype.update = function () {
    upd0.apply(this, arguments); this.townLightsUpd();
  };
}
Object.assign(World.prototype, {
  townLightsUpd() {
    const v = this.cameras && this.cameras.main && this.cameras.main.worldView; if (!v || !this.winL) return;
    const h = S.time, n = nightAmt(); this.winT = (this.winT || 0) + 1;
    if (this.winT % 120 === 0) this.winL = this.winL.filter(w => w.g.active && w.s.active);
    for (const w of this.winL) if (w.g.active && w.s.active) w.g.setAlpha(townWinLit(h, w.k) * w.s.alpha * (.94 + Math.sin(this.t * 1.7 + w.k) * .06));
    if (!this.night || !this._lampP) return;
    const a = clamp((n - .15) * 1.3, 0, .3); let used = 0;
    if (a > 0) for (const L of this.lights) {
      if (!L.street || used >= TOWN_LIGHTS.pool || L.x < v.x - 60 || L.x > v.right + 60 || L.y < v.y - 60 || L.y > v.bottom + 60) continue;
      const g = this._lampP[used] || (this._lampP[used] = this.add.image(0, 0, 'nlL').setTint(0xff9a3c)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(2.01e5));
      g.setVisible(true).setPosition(L.x, L.y).setAlpha(a * (.92 + Math.sin(this.t * 3 + L.x) * .08)); used++;
    }
    for (let i = used; i < this._lampP.length; i++) this._lampP[i].setVisible(false);
  },
});
