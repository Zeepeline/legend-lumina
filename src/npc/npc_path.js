'use strict';
// Pencari jalan NPC (A* kisi 8 px) mengitari tembok scene, agar NPC sampai ke tempat kerja dan tidak menabrak rumah.
const NPC_NAV = { cell: 8, margin: 160, maxCells: 24000, reach: 30 };
/* petak terlarang dalam kotak (x0,y0)+(w,h petak); kaki NPC ±13×7 px, titik acuan = dasar sprite */
function npcNavGrid(sc, x0, y0, w, h) {
  const C = NPC_NAV.cell, blocked = new Uint8Array(w * h);
  for (const z of sc.walls.getChildren()) {
    const b = z.body; if (!b || !b.enable) continue;
    const i0 = Math.max(0, Math.ceil((b.x - 8 - x0) / C)), i1 = Math.min(w - 1, Math.floor((b.x + b.width + 8 - x0) / C));
    const j0 = Math.max(0, Math.ceil((b.y - 2 - y0) / C)), j1 = Math.min(h - 1, Math.floor((b.y + b.height + 9 - y0) / C));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) blocked[j * w + i] = 1;
  }
  return blocked;
}
/* daftar titik [x,y] menuju (tx,ty), atau null bila titik itu tak terjangkau (≥ NPC_NAV.reach px) */
function npcFindPath(sc, sx, sy, tx, ty) {
  const C = NPC_NAV.cell, m = NPC_NAV.margin;
  const x0 = Math.floor((Math.min(sx, tx) - m) / C) * C, y0 = Math.floor((Math.min(sy, ty) - m) / C) * C;
  const w = Math.ceil((Math.abs(tx - sx) + 2 * m) / C) + 2, h = Math.ceil((Math.abs(ty - sy) + 2 * m) / C) + 2;
  if (w * h > NPC_NAV.maxCells) return null;
  const B = npcNavGrid(sc, x0, y0, w, h), N = w * h;
  const at = (x, y) => Math.round((y - y0) / C) * w + Math.round((x - x0) / C);
  const s = at(sx, sy), t = at(tx, ty), ti = t % w, tj = (t - ti) / w;
  const est = k => Math.hypot(k % w - ti, Math.floor(k / w) - tj);
  const cost = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), done = new Uint8Array(N);
  const heap = [], push = (k, f) => {
    let i = heap.length; heap.push([f, k]);
    while (i && heap[(i - 1) >> 1][0] > heap[i][0]) { const p = (i - 1) >> 1; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop(); if (!heap.length) return top[1];
    heap[0] = last;
    for (let i = 0; ;) {
      let c = i * 2 + 1; if (c >= heap.length) break;
      if (c + 1 < heap.length && heap[c + 1][0] < heap[c][0]) c++;
      if (heap[i][0] <= heap[c][0]) break;
      [heap[i], heap[c]] = [heap[c], heap[i]]; i = c;
    }
    return top[1];
  };
  let best = s; cost[s] = 0; push(s, est(s));
  while (heap.length) {
    const k = pop(); if (done[k]) continue; done[k] = 1;
    if (est(k) < est(best)) best = k;
    if (k === t) break;
    const i = k % w, j = (k - i) / w;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const a = i + di, b = j + dj; if ((!di && !dj) || a < 0 || b < 0 || a >= w || b >= h) continue;
      const q = b * w + a; if (B[q] && !(B[k] && di * dj === 0)) continue; /* boleh keluar bila mulai di petak terlarang */
      if (di && dj && (B[j * w + a] || B[b * w + i])) continue;
      const c = cost[k] + (di && dj ? 1.414 : 1) + (B[q] ? 6 : 0);
      if (c < cost[q]) { cost[q] = c; from[q] = k; push(q, c + est(q)); }
    }
  }
  if (est(best) * C > NPC_NAV.reach) return null;
  const out = []; for (let k = best; k !== -1 && k !== s; k = from[k]) out.push(k);
  out.reverse(); const pts = []; let ld = 0;
  out.forEach((k, n) => { // hanya titik belok & akhir
    const d = n + 1 < out.length ? out[n + 1] - k : 0;
    if (d !== ld || !d) pts.push([x0 + (k % w) * C, y0 + Math.floor(k / w) * C]);
    ld = d;
  });
  return pts;
}
