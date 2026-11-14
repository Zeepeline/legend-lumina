'use strict';
// Layar peta & navigasi tujuan misi
// ---------------- PETA ----------------
const MINI = {};
const WORLD = [['forest', 'Hutan Lumina'], ['village', 'Desa Lumina'], ['meadow', 'Padang Angin'], ['cave', 'Gua Batu'], ['swamp', 'Rawa Senja'], ['snow', 'Puncak Beku'], ['lake', 'Danau Cermin'], ['road', 'Jalan Raya Lama'], ['deepwood', 'Hutan Dalam'], ['river', 'Jalur Sungai Senja'], ['kgate', 'Gerbang Kota Lumina'], ['kpasar', 'Distrik Pasar'], ['kakademi', 'Distrik Akademi'], ['kbawah', 'Kota Bawah']];
function buildMini(sc, M, s) {
  const ov = !M.indoor && typeof groundOverview === 'function' ? groundOverview(M) : null;
  const key = M.id + '_' + s.toFixed(4) + '_' + (ov ? ov.v : 0); if (MINI[key]) return MINI[key];
  for (const k in MINI) if (k.startsWith(M.id + '_' + s.toFixed(4) + '_')) delete MINI[k];
  const w = Math.round(M.w * s), h = Math.round(M.h * s), c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.drawImage(ov ? ov.c : sc.textures.get('gs_' + M.id).getSourceImage(), 0, 0, w, h);
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
  if (!goal) return null; if (M.benua) return benuaTarget(goal); if (M.id === goal[0]) return { x: goal[1], y: goal[2] };
  const nx = routeNext(M.id, goal[0]); if (!nx) return null; const ex = (M.exits || []).find(e => e.to === nx); return ex && { x: ex.x + ex.w / 2, y: ex.y + ex.h / 2 };
}
// peta besar ada di systems/explore.js dan worldmap.js
function openMap(sc) {
  // Jika di mode benua / luar ruang, buka peta benua seluruh dunia yang interaktif
  if (sc && ((sc.M && sc.M.benua) || (typeof isOutdoorRegion === 'function' && isOutdoorRegion(sc.M?.id)))) {
    return openWorldMap(sc);
  }
  return openMapNew(sc);
}
