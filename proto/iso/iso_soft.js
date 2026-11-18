'use strict';
// Gaya "pixel art lembut" (pilihan pemilik 18-11-2026): tetap piksel, tapi semua peralihan membaur.
// Tanah dihitung per piksel dari JARAK BERTANDA ke tiap bentuk (jalan, alun-alun, kolam, ladang, tanah rusak) → tepi bergradasi,
// rumput menjorok, bayangan halus (AO) di tepi & kaki tebing. Tebing: batu-tanah alami dengan bibir rumput menggantung, tanpa pola bata.
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const sstep = (a, b, x) => { const t = clampN((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mul3 = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

function bakeGroundSoft(src) {
  const N = IMAP.N, T = ISO.T, ox = N * T + 24, oy = ISO.ZH + 24, W = N * 2 * T + 48, H = N * T + ISO.ZH + 64;
  const c = mkCanvas(W, H), x = c.getContext('2d'), out = x.createImageData(W, H), O = out.data;
  const S = {}; for (const k in src) S[k] = texData(src[k]);
  const smp = (t, wx, wy) => { const px = ((Math.floor(wx) % t.w) + t.w) % t.w, py = ((Math.floor(wy) % t.h) + t.h) % t.h, i = (py * t.w + px) * 4; return [t.d[i], t.d[i + 1], t.d[i + 2]]; };
  const P = IMAP.plaza;
  // jarak bertanda (px; negatif = di dalam)
  const sdPath = (wx, wy) => { let m = 1e9; for (const [ax, ay, bx, by, w] of IMAP.paths) m = Math.min(m, segDist(wx / T, wy / T, ax, ay, bx, by) * T - w * T * .5); return m; };
  const sdCirc = (wx, wy, c0) => Math.hypot(wx / T - c0[0], wy / T - c0[1]) * T - c0[2] * T;
  const sdFarm = (wx, wy) => { let m = 1e9; for (const [fx, fy, fw, fh] of IMAP.farms) { const qx = Math.abs(wx - (fx + fw / 2) * T) - (fw / 2 - .6) * T, qy = Math.abs(wy - (fy + fh / 2) * T) - (fh / 2 - .6) * T;
    m = Math.min(m, Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - 8); } return m; };
  const grassC = (wx, wy) => { const n = vnoise(wx, wy, 70, 11), a = smp(S.grass, wx, wy);
    return n < .4 ? lerp3(smp(S.dark, wx, wy), a, sstep(.3, .4, n)) : n > .62 ? lerp3(a, smp(S.light, wx, wy), sstep(.62, .72, n)) : a; };
  const rotC = (wx, wy) => { const n = vnoise(wx, wy, 6, 21), b = lerp3([88, 74, 98], [116, 100, 124], n); return vnoise(wx, wy, 3, 22) > .86 ? [176, 120, 220] : b; };
  const waterC = (d) => lerp3([86, 160, 196], [40, 104, 150], sstep(-6, -34, d));
  const ramp = (wx, wy) => { const R = IMAP.ramp, s = (wx + wy) / T, dd = (wx - wy) / T; return dd >= R.d0 && dd <= R.d1 && s >= R.s0 - .3 && s <= R.s1 + .2; };
  const colAt = (wx, wy, z) => {
    let col = grassC(wx, wy); const wob = (vnoise(wx, wy, 9, 3) - .5) * 7, tuft = vnoise(wx, wy, 2.2, 7);
    // jalan tanah: tepi bergradasi + rumput menjorok + AO tipis di sisi tanah
    const dp = sdPath(wx, wy) + wob;
    if (dp < 4) { const dirt = mul3(smp(S.dirt, wx, wy), 1 - .16 * sstep(-5, 0, dp)), t = sstep(3, -2, dp + (tuft > .7 ? 3 : 0)); col = lerp3(col, dirt, t); }
    // alun-alun & tangga batu
    const dc = sdCirc(wx, wy, P) + wob * .6, rp = ramp(wx, wy) ? -6 : 99, ds = Math.min(dc, rp);
    if (ds < 4) { const st = mul3(smp(S.cobble, wx * .75, wy * .75), 1 - .14 * sstep(-6, 0, ds)); col = lerp3(col, st, sstep(3, -2, ds + (tuft > .75 ? 3 : 0))); }
    // ladang: alur tanah lembut
    const df = sdFarm(wx, wy) + wob * .5;
    if (df < 4) { const fur = .82 + .18 * Math.sin(wy / 3.2), soil = mul3(smp(S.dirt, wx, wy), .78 * fur), sprout = Math.sin(wy / 3.2) > .55 && vnoise(wx, wy, 3, 30) > .45;
      col = lerp3(col, sprout ? [86, 140, 52] : soil, sstep(3, -3, df)); }
    // tanah rusak
    if (IMAP.rot) { const dr = sdCirc(wx, wy, IMAP.rot) + wob * 1.4; if (dr < 6) col = lerp3(col, rotC(wx, wy), sstep(6, -4, dr)); }
    // kolam: tepi lumpur → air dangkal → dalam
    const dw = sdCirc(wx, wy, IMAP.pond) + wob * .8;
    if (dw < 5) { const mud = mul3(smp(S.dirt, wx, wy), .72); col = dw > 0 ? lerp3(col, mud, sstep(5, 0, dw)) : lerp3(mud, waterC(dw), sstep(0, -4, dw)); }
    // bayangan halus di kaki tebing dataran tinggi
    if (z < .05 && !ramp(wx, wy)) { const sb = (wx + wy) / T - IMAP.plateauS; if (sb >= 0 && sb < .7) col = mul3(col, .7 + .3 * sstep(0, .7, sb)); }
    return col;
  };
  const ter = [], zt = [];
  for (let ty = 0; ty < N; ty++) { ter[ty] = []; zt[ty] = []; for (let tx = 0; tx < N; tx++) { ter[ty][tx] = terrainAt(tx, ty); zt[ty][tx] = zAt((tx + .5) * T, (ty + .5) * T); } }
  const order = []; for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) order.push([tx, ty]);
  order.sort((a, b) => (zt[a[1]][a[0]] - zt[b[1]][b[0]]) || (a[0] + a[1] - b[0] - b[1]));
  const put = (px, py, r, g, b) => { if (px < 0 || py < 0 || px >= W || py >= H) return; const i = (py * W + px) * 4; O[i] = r; O[i + 1] = g; O[i + 2] = b; O[i + 3] = 255; };
  const ROCK = [[150, 136, 112], [126, 114, 94], [104, 94, 78]], ROCKR = [[112, 102, 86], [94, 86, 72], [78, 70, 60]];
  for (const [tx, ty] of order) {
    const z = zt[ty][tx], bx = ox + (tx - ty) * T - T, by = oy + (tx + ty) * T / 2 - z * ISO.ZH;
    const zl = ty + 1 < N ? zt[ty + 1][tx] : 0, zr = tx + 1 < N ? zt[ty][tx + 1] : 0;
    for (const [dz, left] of [[z - zl, true], [z - zr, false]]) { // muka tebing alami
      const h = Math.round(dz * ISO.ZH); if (h < 2) continue;
      for (let i = 0; i < 16; i++) {
        const gx = (tx * 16 + i) * (left ? 1 : -1) + ty * 31, lip = 2 + Math.floor(vnoise(gx, 0, 3, 41) * 4); // bibir rumput menggantung
        for (let j = 0; j < h; j++) {
          const px = left ? bx + i : bx + 16 + i, py = Math.floor((left ? by + 8 + i / 2 : by + 16 - i / 2) + j);
          const streak = vnoise(gx, j, 4, left ? 43 : 44), pal = left ? ROCK : ROCKR, k = j / h;
          let cc = lerp3(pal[0], pal[2], clampN(k * .8 + (streak - .5) * .6, 0, 1));
          if (vnoise(gx, j, 2, 45) > .8) cc = mul3(cc, 1.12); /* kilau batu */
          if (j < lip) cc = lerp3([74, 132, 44], [52, 98, 32], j / lip); /* rumput menggantung */
          else if (j > h - 4) cc = mul3(cc, .72 + .07 * (h - j)); /* gelap di kaki */
          put(px, py, cc[0] | 0, cc[1] | 0, cc[2] | 0);
        }
      }
    }
    for (let py = 0; py < 16; py++) for (let px = 0; px < 32; px++) {
      if (!inDia(px, py)) continue; const sx = px - 16 + .5, sy = py + .5, wx = tx * T + sy + sx / 2, wy = ty * T + sy - sx / 2;
      let col = colAt(wx, wy, z);
      // tepi atas dataran tinggi sedikit lebih terang (cahaya kiri atas)
      if (z > .95) { const sb = IMAP.plateauS - (wx + wy) / T; if (sb >= 0 && sb < .25) col = mul3(col, 1.08); }
      put(bx + px, by + py, col[0] | 0, col[1] | 0, col[2] | 0);
    }
  }
  x.putImageData(out, 0, 0);
  return { c, ox, oy, ter, zt };
}

// bayangan lembut (gradasi radial) & cahaya matahari halus layar
function softTextures(T) {
  PAL.outline = '#4a3d2c'; /* garis tepi rumah: coklat gelap, bukan hampir-hitam */
  const c = mkCanvas(32, 16), x = c.getContext('2d'), g = x.createRadialGradient(16, 8, 1, 16, 8, 15);
  g.addColorStop(0, 'rgba(24,30,18,.42)'); g.addColorStop(.6, 'rgba(24,30,18,.22)'); g.addColorStop(1, 'rgba(24,30,18,0)');
  x.setTransform(1, 0, 0, .5, 0, 4); x.fillStyle = g; x.fillRect(0, 0, 32, 32); if (!T.exists('fx_shadow')) T.addCanvas('fx_shadow', c);
  const s = mkCanvas(64, 256), y = s.getContext('2d'), gs = y.createLinearGradient(0, 0, 64, 0);
  gs.addColorStop(0, 'rgba(255,250,220,0)'); gs.addColorStop(.5, 'rgba(255,250,220,1)'); gs.addColorStop(1, 'rgba(255,250,220,0)');
  y.fillStyle = gs; y.fillRect(0, 0, 64, 256); if (!T.exists('soft_beam')) T.addCanvas('soft_beam', s);
}
function softScene(sc) {
  softTextures(sc.textures);
  const cam = sc.cameras.main;
  if (sc.game.renderer.type === Phaser.WEBGL && cam.postFX) {
    const cm = cam.postFX.addColorMatrix(); cm.contrast(-.05); cm.saturate(.08, true); cm.brightness(1.08, true);
    cam.postFX.addBloom(0xffffff, 1, 1, 1, .12, 2);
  }
  // sinar matahari lembut dari kiri atas (ruang layar)
  const ui = sc.ui; if (!ui) return;
  for (let i = 0; i < 3; i++) {
    const b = ui.add.image(-40 + i * 110, -60, 'soft_beam').setOrigin(.5, 0).setRotation(-.62).setScale(1.4 + i * .5, 2.4).setAlpha(.07 - i * .015)
      .setBlendMode('ADD').setDepth(-10);
    ui.tweens.add({ targets: b, alpha: b.alpha * .5, duration: 3000 + i * 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
