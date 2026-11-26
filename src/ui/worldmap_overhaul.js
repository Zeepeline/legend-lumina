'use strict';
// H5: Peta Dunia Interaktif (Zona Bahaya Lv, Pin Guru Jurus, Peti Harta/Resep, & Patung Teleport cepat)
const WMAP_FLT = { danger: true, guru: true, chest: true, warp: true };

(() => {
  const s = document.createElement('style');
  s.textContent = '#wm-bar{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin-bottom:6px}' +
    '.wmf{font:700 11px "Pixelify Sans",monospace;padding:3px 8px;border-radius:10px;border:1px solid #6e5a38;' +
    'background:#241c14;color:#d8c8a4;cursor:pointer}.wmf.on{background:#4f3a1e;border-color:#ffd05a;color:#fff4c2}' +
    '#wm-tip{min-height:18px;font:700 12px "Pixelify Sans",monospace;color:#ffe69a;margin-top:5px;text-align:center;' +
    'display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}';
  document.head.appendChild(s);
})();

function wmapRegXY(reg, lx, ly) {
  const p = typeof WORLD_POS !== 'undefined' && WORLD_POS[reg];
  return p ? [p[0] + lx, p[1] + ly] : [lx, ly];
}

function collectWorldMapPins() {
  const pins = [], chestMaps = {};
  if (typeof JURUS !== 'undefined' && typeof MAPS !== 'undefined') {
    for (const k in JURUS) {
      const J = JURUS[k];
      let found = null;
      for (const mId in MAPS) {
        const npc = (MAPS[mId].npcs || []).find(n => n.id === J.guru);
        if (npc && WORLD_POS[mId]) { found = { mId, x: npc.x, y: npc.y, name: npc.name }; break; }
      }
      if (!found) continue;
      const [gx, gy] = wmapRegXY(found.mId, found.x, found.y);
      const done = learned(k), ready = !done && J.can();
      pins.push({ kind: 'guru', id: k, gx, gy, reg: found.mId, label: `${J.n} (${found.name})`, done, ready });
    }
  }
  if (typeof WARPS !== 'undefined') {
    for (const mId in WARPS) {
      if (!WORLD_POS[mId]) continue;
      const [wx, wy] = WARPS[mId], [gx, gy] = wmapRegXY(mId, wx, wy);
      const active = !!(S.warps && S.warps[mId]);
      pins.push({ kind: 'warp', id: mId, gx, gy, wx, wy, reg: mId, label: 'Patung ' + (MAPS[mId]?.name || mId), active });
    }
  }
  if (typeof MAPS !== 'undefined') {
    for (const mId in MAPS) {
      const M = MAPS[mId];
      if (!WORLD_POS[mId] || !M.chests) continue;
      for (const c of M.chests) {
        if (S.flags && S.flags[c.id]) continue;
        const [gx, gy] = wmapRegXY(mId, c.x, c.y);
        chestMaps[c.id] = 1;
        pins.push({ kind: 'chest', id: c.id, gx, gy, reg: mId, label: c.lock || c.locked ? 'Peti Terkunci (' + M.name + ')' : 'Peti Harta (' + M.name + ')' });
      }
    }
  }
  return pins;
}

function drawWorldMapOverlays(ctx, v) {
  const { panX, panY, s, minX, minY, blink } = v;
  const toX = gx => panX + (gx - minX) * s, toY = gy => panY + (gy - minY) * s;

  if (WMAP_FLT.danger && typeof LEVEL_WILAYAH !== 'undefined') {
    ctx.save();
    for (const id in LEVEL_WILAYAH) {
      const pos = WORLD_POS[id], m = MAPS[id], lv = LEVEL_WILAYAH[id];
      if (!pos || !m || lv <= 1 || m.indoor) continue;
      const cx = toX(pos[0] + (m.w || 1024) / 2), cy = toY(pos[1] + (m.h || 1024) / 2);
      const rad = Math.min(m.w || 800, m.h || 800) * s * .38;
      if (cx + rad < 0 || cx - rad > v.w || cy + rad < 0 || cy - rad > v.h) continue;
      const hard = (S.lv || 1) < lv;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = hard ? 'rgba(255,95,75,.72)' : 'rgba(110,230,130,.5)';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(14, rad), 0, 7); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '700 9px "Pixelify Sans",monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(18,14,12,.82)'; ctx.fillRect(cx - 21, cy + 12, 42, 13);
      ctx.fillStyle = hard ? '#ff9482' : '#9cffaa';
      ctx.fillText(`⚠ Lv ${lv}`, cx, cy + 21);
    }
    ctx.restore();
  }

  const pins = collectWorldMapPins();
  ctx.save();
  ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const p of pins) {
    if (!WMAP_FLT[p.kind]) continue;
    const x = toX(p.gx), y = toY(p.gy);
    if (x < -16 || x > v.w + 16 || y < -16 || y > v.h + 16) continue;
    if (p.kind === 'guru') {
      ctx.fillStyle = p.done ? '#3e7e46' : p.ready ? (blink ? '#ffd040' : '#ff9830') : '#44506a';
      ctx.strokeStyle = '#120e0c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText(p.done ? '✓' : p.ready ? '!' : '📖', x, y + .5);
    } else if (p.kind === 'warp') {
      ctx.fillStyle = p.active ? '#2886e8' : '#4a525e';
      ctx.strokeStyle = p.active ? '#b8f0ff' : '#20242c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText('🌀', x, y + .5);
    } else if (p.kind === 'chest' && (S.seen && S.seen[p.reg])) {
      ctx.fillStyle = '#a8742a'; ctx.strokeStyle = '#281608'; ctx.lineWidth = 1.2;
      ctx.fillRect(x - 5, y - 4, 10, 8); ctx.strokeRect(x - 5, y - 4, 10, 8);
      ctx.fillStyle = '#ffe88a'; ctx.fillRect(x - 1, y - 2, 2, 4);
    }
  }
  ctx.restore();
}

function mountWorldMapHud(overlay, hint, redraw, closeMap) {
  if (document.getElementById('wm-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'wm-bar';
  const defs = [['danger', '⚠ Bahaya'], ['guru', '📖 Guru'], ['chest', '🎁 Harta'], ['warp', '🌀 Teleport']];
  defs.forEach(([k, n]) => {
    const b = document.createElement('button');
    b.className = 'wmf' + (WMAP_FLT[k] ? ' on' : '');
    b.textContent = n;
    b.onclick = () => { WMAP_FLT[k] = !WMAP_FLT[k]; b.classList.toggle('on', WMAP_FLT[k]); sfx('cur'); redraw(); };
    bar.appendChild(b);
  });
  const cv = overlay.querySelector('canvas');
  if (cv) overlay.insertBefore(bar, cv);

  const tip = document.createElement('div');
  tip.id = 'wm-tip';
  tip.textContent = 'Ketuk pin Guru / Harta / Teleport biru untuk info & pindah cepat';
  overlay.insertBefore(tip, hint);

  const prevUIH = UIH;
  let closed = false;
  const safeClose = () => {
    if (closed) return;
    closed = true;
    UIH = prevUIH;
    closeMap();
  };
  const btnClose = overlay.querySelector('.wmb.r');
  if (btnClose) btnClose.onclick = () => { sfx('back'); safeClose(); };
  UIH = k => {
    if (['b', 'back', 'menu', 'map'].includes(k)) { sfx('back'); safeClose(); }
  };
  overlay._wmClose = safeClose;
}

function clickWorldMapPin(cx, cy, v) {
  const { panX, panY, s, minX, minY, sc, closeMap } = v;
  const toX = gx => panX + (gx - minX) * s, toY = gy => panY + (gy - minY) * s;
  const pins = collectWorldMapPins().filter(p => WMAP_FLT[p.kind] && (p.kind !== 'chest' || (S.seen && S.seen[p.reg])));
  let best = null, bd = 18;
  for (const p of pins) {
    const d = Math.hypot(toX(p.gx) - cx, toY(p.gy) - cy);
    if (d < bd) { bd = d; best = p; }
  }
  const tip = document.getElementById('wm-tip');
  if (!best || !tip) return;
  sfx('cur');
  if (best.kind === 'warp') {
    if (!best.active) {
      tip.textContent = `🌀 ${best.label} (Belum diaktifkan — sentuh langsung di lokasi)`;
      return;
    }
    tip.innerHTML = `<span>🌀 ${best.label} aktif!</span> <button class="wmb g" id="wm-go" style="padding:3px 10px;font-size:11px">⚡ Pindah Cepat</button>`;
    const go = tip.querySelector('#wm-go');
    if (go) go.onclick = () => {
      sfx('ice');
      if (v.overlay && v.overlay._wmClose) v.overlay._wmClose();
      else closeMap();
      if (sc && sc.goto) sc.goto(best.id, best.wx, best.wy + 18, 'down');
    };
  } else {
    tip.textContent = (best.kind === 'guru' ? '📖 ' : '🎁 ') + best.label;
  }
}
