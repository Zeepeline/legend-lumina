'use strict';
// Layar peta & navigasi tujuan misi
// ---------------- PETA ----------------
const MINI = {};
const WORLD = [['forest', 'Hutan Lumina'], ['village', 'Desa Lumina'], ['meadow', 'Padang Angin'], ['cave', 'Gua Batu'], ['swamp', 'Rawa Senja'], ['snow', 'Puncak Beku'], ['lake', 'Danau Cermin'], ['road', 'Jalan Raya Lama'], ['deepwood', 'Hutan Dalam'], ['river', 'Jalur Sungai Senja'], ['kgate', 'Gerbang Kota Lumina'], ['kpasar', 'Distrik Pasar'], ['kakademi', 'Distrik Akademi'], ['kbawah', 'Kota Bawah']];
function buildMini(sc, M, s) {
  const key = M.id + '_' + s.toFixed(4); if (MINI[key]) return MINI[key];
  const w = Math.round(M.w * s), h = Math.round(M.h * s), c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.drawImage(sc.textures.get('gs_' + M.id).getSourceImage(), 0, 0, w, h);
  const list = mapObjects(M).slice().sort((a, b) => a[2] - b[2]);
  for (const o of list) {
    const d = OBJ[o[0]]; const tex = sc.textures.get(d.key); const f = tex.has(0) ? tex.get(0) : tex.get(); const src = tex.getSourceImage();
    const fw = f.cutWidth, fh = f.cutHeight, dw = Math.max(1, fw * s), dh = Math.max(1, fh * s);
    x.save(); x.translate(o[1] * s, o[2] * s); if (o[3] && o[3].flip) x.scale(-1, 1);
    x.drawImage(src, f.cutX, f.cutY, fw, fh, -dw / 2, -dh, dw, dh); x.restore();
  }
  if (M.dark) { x.fillStyle = 'rgba(10,6,20,.25)'; x.fillRect(0, 0, w, h); }
  return MINI[key] = c;
}
function routeNext(from, to) {
  const prev = {}, q = [from], seen = { [from]: 1 };
  while (q.length) { const m = q.shift(); if (m === to) break; for (const ex of MAPS[m].exits || []) if (!seen[ex.to]) { seen[ex.to] = 1; prev[ex.to] = m; q.push(ex.to); } }
  if (!seen[to]) return null; let m = to; while (prev[m] !== from) { m = prev[m]; if (!m) return null; } return m;
}
function questTarget(M) {
  let goal = STAGE_GOAL[S.stage];
  if (S.stage === 2) { const F = MAPS.forest; if ((S.inv.seal || 0) >= 3) goal = ['forest', F.barrier.x, F.barrier.y]; else { const B = F.bosses.find(b => b.after === 'seal' && !S.flags[b.flag]); goal = B ? ['forest', B.x, B.y] : null; } }
  if (S.stage === 11) { const T = MAPS.snow.torches, i = [0, 1, 2].find(k => !S.flags['torch' + k]); goal = i == null ? null : ['snow', T[i][0], T[i][1]]; }
  if (!goal) return null; if (M.id === goal[0]) return { x: goal[1], y: goal[2] };
  const nx = routeNext(M.id, goal[0]); if (!nx) return null; const ex = (M.exits || []).find(e => e.to === nx); return ex && { x: ex.x + ex.w / 2, y: ex.y + ex.h / 2 };
}
async function openMap(sc) {
  G.lock++; sfx('ok');
  const M = sc.M, w = win('act', ''); w.id = 'mapw';
  const boxW = VW - 30, boxH = VH - 74, s = Math.min(boxW / M.w, boxH / M.h);
  w.innerHTML = `<div class="mh"><span>PETA · ${M.name}</span><span style="color:#8a6a4a;font-weight:400">tutup: tombol apa saja</span></div><div class="mbox"><div class="mwrap" style="position:relative"></div></div>
   <div class="leg"><span><i style="width:6px;height:6px;border-radius:50%;background:#ffe23a;box-shadow:0 0 0 1px #3a1a00"></i>Kamu</span><span><i style="width:4px;height:4px;border-radius:50%;background:#7aff7a;box-shadow:0 0 0 1px #0a3a0a"></i>Penduduk</span><span><i style="width:5px;height:4px;background:#ffc83a;box-shadow:0 0 0 1px #4a2a00"></i>Peti</span><span style="color:#d02a2a">☠ Boss</span><span style="color:#c89a00">★ Tujuan misi</span></div>
   <div class="world">Dunia: ${(M.indoor ? '[' + M.name + '] · ' : '') + WORLD.map(([id, n]) => id === M.id ? `<b style="color:#a0481e">[${n}]</b>` : S.seen[id] ? n : '???').join(' — ')}</div>`;
  const wrap = w.querySelector('.mwrap'); const cv = buildMini(sc, M, s); wrap.appendChild(cv);
  const mk2 = (cls, X, Y, html = '') => { const e = document.createElement('div'); e.className = 'mk ' + cls; e.style.left = (X * s) + 'px'; e.style.top = (Y * s) + 'px'; e.innerHTML = html; wrap.appendChild(e); return e; };
  for (const n of sc.npcs) mk2('mn', n.spr.x, n.spr.y - 4);
  for (const c of M.chests || []) if (!S.flags[c.id] && (!c.needFlag || S.flags[c.needFlag])) mk2('mc', c.x, c.y - 4);
  for (const B of M.bosses || []) if (!S.flags[B.flag] && S.stage >= B.need) mk2('mb', B.x, B.y - 10, '☠');
  for (const ex of M.exits || []) { const X = clamp(ex.x + ex.w / 2, 30 / s, M.w - 30 / s), Y = clamp(ex.y + ex.h / 2, 8 / s, M.h - 8 / s); mk2('mx', X, Y, '➜ ' + (S.seen[ex.to] ? ex.label : '???')); }
  const q = questTarget(M); if (q) mk2('mq', q.x, q.y - 6, '★');
  mk2('me', sc.pl.x, sc.pl.y - 4);
  await new Promise(res => { const prev = UIH; const h = k => { if (['a', 'b', 'menu', 'map', 'back', 'tap', 'item', 'bag'].includes(k)) { w.remove(); UIH = prev; sfx('back'); res(); } }; h.tap = true; UIH = h; w.addEventListener('pointerdown', e => { e.stopPropagation(); press('tap'); }); });
  G.lock--;
}
