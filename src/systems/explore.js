'use strict';
// Gelombang 6: kabut peta (#61), rahasia (#63), peta harta (#66), lubang galian (#665),
// jarak ke tujuan (#675), zoom peta (#678), ikon NPC (#679) & toko (#680)
const FOG_N = 20;
const WILD = ['forest', 'deepwood', 'meadow', 'cave', 'swamp', 'snow', 'lake', 'river', 'road'];
Object.assign(ITEMS, { tmap: { n: 'Peta Harta Sobek', k: 'key', d: 'Menunjuk tempat harta terkubur. Buka PETA: tandanya ✖. Gali di sana dengan tombol aksi.' } });
Object.assign(ICONS_DEF, { tmap: ['seal', { Y: '#e8d8a8', R: '#a0481e', W: '#fff8e0' }] });
const ROLE_ICON = { vendor: '🛒', smith: '⚒', inn: '🛏', cook: '🍲', elder: '📜', hunter: '🏹', hermit: '📖' };
function hash32(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function seeded(seed) { let a = seed; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// ---- kabut ----
function fogOf(id) { S.fog = S.fog || {}; return S.fog[id] || (S.fog[id] = '0'.repeat(FOG_N * FOG_N)); }
function fogSeen(M, x, y) { if (M.indoor || !WILD.includes(M.id) && !/^k/.test(M.id) && M.id !== 'village') return true; const f = fogOf(M.id), cx = clamp(Math.floor(x / M.w * FOG_N), 0, FOG_N - 1), cy = clamp(Math.floor(y / M.h * FOG_N), 0, FOG_N - 1); return f[cy * FOG_N + cx] === '1'; }
function drawFog(ctx, M, k, ox = 0, oy = 0) {
  if (M.indoor) return; const f = fogOf(M.id), cw = M.w / FOG_N * k, ch = M.h / FOG_N * k;
  const W = Math.ceil(M.w * k), H = Math.ceil(M.h * k), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#1c140e'; for (let i = 0; i < FOG_N * FOG_N; i++) if (f[i] !== '1') x.fillRect(Math.floor((i % FOG_N) * cw), Math.floor(Math.floor(i / FOG_N) * ch), Math.ceil(cw) + 1, Math.ceil(ch) + 1);
  ctx.save(); ctx.globalAlpha = .86; ctx.drawImage(c, ox, oy); ctx.restore();
}
Object.assign(World.prototype, {
  updFog(dt) {
    const M = this.M; if (M.indoor || G.title) return; this.fogT = (this.fogT || 0) - dt; if (this.fogT > 0) return; this.fogT = .4;
    const f = fogOf(M.id).split(''), cw = M.w / FOG_N, ch = M.h / FOG_N, R = 150; let ch2 = false;
    for (let cy = 0; cy < FOG_N; cy++) for (let cx = 0; cx < FOG_N; cx++) { const i = cy * FOG_N + cx; if (f[i] === '1') continue; if (Math.hypot((cx + .5) * cw - this.pl.x, (cy + .5) * ch - this.pl.y) < R) { f[i] = '1'; ch2 = true; } }
    if (ch2) { S.fog[M.id] = f.join(''); this.miniFor = null; }
  },
  // ---- tempat kosong yang aman untuk benda rahasia (sesuai PLACEMENT_RULES: tidak di jalan, air, tembok, pintu keluar, benda lain) ----
  freeSpot(rng, tries = 200) {
    const M = this.M, objs = mapObjects(M);
    for (let t = 0; t < tries; t++) {
      const x = 60 + rng() * (M.w - 120), y = 70 + rng() * (M.h - 130);
      if (this.groundAt(x, y) === 'water') continue;
      if ((M.paths || []).some(([x1, y1, x2, y2, w]) => segD(x, y, x1, y1, x2, y2) < (w || 12) + 18)) continue;
      if ((M.exits || []).some(e => Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < 110)) continue;
      if (objs.some(o => Math.hypot(o[1] - x, o[2] - y) < 40)) continue;
      if (this.physics.overlapRect(x - 16, y - 16, 32, 32, false, true).length) continue;
      if (this.npcs.some(n => Math.hypot(n.spr.x - x, n.spr.y - y) < 40)) continue;
      return { x: Math.round(x), y: Math.round(y) };
    }
    return null;
  },
  initSecrets() {
    this.secrets = []; const M = this.M; if (G.title || M.indoor || !WILD.includes(M.id)) return this.initTreasure();
    const rng = seeded(hash32('rahasia_' + M.id)), kinds = ['bush', ['cave', 'snow', 'swamp'].includes(M.id) ? 'crack' : 'bush', 'dig'];
    kinds.forEach((kind, i) => {
      const id = 'sec_' + M.id + '_' + i, p = this.freeSpot(rng); if (!p || S.flags[id]) return;
      const sc = { id, kind, x: p.x, y: p.y };
      if (kind === 'dig') { sc.spr = this.add.image(p.x, p.y - 2, 'spark').setDepth(p.y).setAlpha(.8); this.tweens.add({ targets: sc.spr, alpha: .15, scale: 1.6, duration: 700, yoyo: true, repeat: -1 }); this.inter.push(sc.it = { x: p.x, y: p.y, r: 16, fn: () => this.openSecret(sc) }); }
      else { sc.spr = this.add.image(p.x, p.y, kind === 'bush' ? 'bushy' : 'rock').setOrigin(.5, 1).setDepth(p.y).setTint(kind === 'bush' ? 0x9a8a5a : 0x9890a0); if (kind === 'crack') sc.spr.setScale(1.3);
        sc.wall = this.wall(p.x - 10, p.y - 10, 20, 9);
        this.inter.push(sc.it = { x: p.x, y: p.y + 6, r: 16, fn: () => talk(null, [kind === 'bush' ? 'Semak kering yang rapuh... mungkin bisa dibakar.' : 'Batu ini retak-retak. Ledakan mungkin bisa memecahkannya.']) }); }
      this.secrets.push(sc);
    });
    this.initTreasure();
  },
  initTreasure() {
    const T = S.tmap; if (!T || T.map !== this.M.id) return;
    this.inter.push(this.tIt = { x: T.x, y: T.y, r: 18, fn: () => this.digTreasure() });
  },
  async digTreasure() {
    const T = S.tmap; if (!T) return; G.lock++; sfx('step'); for (let i = 0; i < 4; i++) { this.puff(T.x + rnd(-6, 6), T.y); await sleep(200); }
    S.tmap = null; addItem('tmap', -1); this.inter = this.inter.filter(i => i !== this.tIt);
    const g = ri(150, 300); S.gold += g; addItem('hipotion', 2); addItem('shard', 2); S.treasures = (S.treasures || 0) + 1; sfx('chest'); updHud(); G.lock--;
    await say(`Kamu menemukan peti harta terkubur! Isinya ${g} G, 2 Ramuan Besar, dan 2 Pecahan Kristal.`, 'Harta');
  },
  async openSecret(sc) {
    if (S.flags[sc.id]) return; S.flags[sc.id] = 1; this.inter = this.inter.filter(i => i !== sc.it);
    if (sc.wall) { this.walls.remove(sc.wall, true, true); }
    if (sc.kind === 'bush') { this.sparkle(sc.x, sc.y - 8, 'doto', 16); for (let i = 0; i < 5; i++) this.puff(sc.x + rnd(-8, 8), sc.y - rnd(0, 10)); }
    else this.puff(sc.x, sc.y);
    if (sc.spr) { this.tweens.killTweensOf(sc.spr); this.tweens.add({ targets: sc.spr, alpha: 0, duration: 300, onComplete: () => sc.spr.destroy() }); }
    S.secrets = (S.secrets || 0) + 1; const first = S.secrets === 1;
    const g = ri(25, 60) * (sc.kind === 'crack' ? 2 : 1); S.gold += g; this.drop(sc.x, sc.y, 'item', sc.kind === 'dig' ? ['berry', 'herb', 'ore', 'shard'][ri(0, 3)] : 'shard');
    sfx('chest'); popWorld(sc.x, sc.y - 28, 'Rahasia ditemukan! +' + g + ' G', 'crit'); updHud();
    if ((first || Math.random() < .3) && !S.tmap) this.giveTreasureMap();
  },
  giveTreasureMap() {
    const pool = WILD.filter(id => S.seen[id] && MAPS[id]); const id = pool[ri(0, pool.length - 1)] || 'meadow', M = MAPS[id];
    // titik harta dicari dengan aturan sederhana pada data peta (tanpa fisika peta lain)
    const rng = seeded(hash32('harta_' + Date.now())); let p = null;
    for (let t = 0; t < 300 && !p; t++) { const x = 70 + rng() * (M.w - 140), y = 80 + rng() * (M.h - 150);
      if ((M.paths || []).some(([x1, y1, x2, y2, w]) => segD(x, y, x1, y1, x2, y2) < (w || 12) + 14)) continue;
      if ((M.ponds || []).some(([px, py, rx, ry]) => ((x - px) / (rx + 20)) ** 2 + ((y - py) / (ry + 20)) ** 2 < 1)) continue;
      if ((M.walls || []).some(([wx, wy, ww, wh]) => x > wx - 20 && x < wx + ww + 20 && y > wy - 20 && y < wy + wh + 20)) continue;
      if (mapObjects(M).some(o => Math.hypot(o[1] - x, o[2] - y) < 46)) continue;
      p = { x: Math.round(x), y: Math.round(y) }; }
    if (!p) return; S.tmap = { map: id, x: p.x, y: p.y }; addItem('tmap', 1);
    popWorld(this.pl.x, this.pl.y - 44, 'Peta Harta Sobek!', 'xp');
    this.time.delayedCall(600, () => say(`Ada peta sobek terselip... Tandanya menunjuk ke ${M.name}. Lihat ✖ di PETA saat kamu di sana.`, 'Peta Harta'));
    if (id === this.M.id) this.initTreasure();
  },
  // dipanggil tiap frame: bola api / ledakan membuka semak & batu retak
  updSecrets() {
    if (!this.secrets || !this.secrets.length) return;
    for (const sc of this.secrets) {
      if (S.flags[sc.id] || sc.kind === 'dig') continue;
      if (sc.kind === 'bush' && this.shots.some(p => p.mine && p.kind === 'fire' && Math.hypot(p.gx - sc.x, p.gy - sc.y + 6) < 18)) { popWorld(sc.x, sc.y - 30, 'terbakar!', 'crit'); this.openSecret(sc); }
    }
  },
  blastAt(x, y) { for (const sc of this.secrets || []) if (!S.flags[sc.id] && sc.kind !== 'dig' && Math.hypot(sc.x - x, sc.y - y) < 50) this.openSecret(sc); },
});
// ---- peta besar baru: kabut, ikon NPC/toko, harta, jarak, zoom ----
async function openMapNew(sc) {
  G.lock++; sfx('ok');
  const M = sc.M, w = win('act', ''); w.id = 'mapw';
  const boxW = VW - 30, boxH = VH - 86, s0 = Math.min(boxW / M.w, boxH / M.h); let z = 1;
  const q = questTarget(M), dist = q ? Math.round(Math.hypot(q.x - sc.pl.x, q.y - sc.pl.y) / 8) : null;
  w.innerHTML = `<div class="mh"><span>PETA · ${M.name}</span><span class="zb"><b data-z="-1">−</b><b data-z="1">+</b></span></div><div class="mbox"><div class="mwrap" style="position:relative"></div></div>
   <div class="leg"><span>● Kamu</span><span style="color:#ffd84a">★ Tujuan${dist != null ? ' · ' + dist + ' m' : ''}</span><span>🛒 toko ⚒ bengkel 🛏 penginapan 📖 guru</span>${S.tmap && S.tmap.map === M.id ? '<span style="color:#a0481e">✖ harta</span>' : ''}</div>
   <div class="world">Dunia: ${(M.indoor ? '[' + M.name + '] · ' : '') + WORLD.map(([id, n]) => id === M.id ? `<b style="color:#a0481e">[${n}]</b>` : S.seen[id] ? n : '???').join(' — ')}</div>`;
  const box = w.querySelector('.mbox'), wrap = w.querySelector('.mwrap');
  const draw = () => {
    const s = s0 * z; wrap.innerHTML = ''; const base = buildMini(sc, M, s0), cv = document.createElement('canvas'); cv.width = Math.round(M.w * s); cv.height = Math.round(M.h * s);
    const x = cv.getContext('2d'); x.drawImage(base, 0, 0, cv.width, cv.height); drawFog(x, M, s); wrap.appendChild(cv);
    const mk2 = (cls, X, Y, html = '') => { if (!fogSeen(M, X, Y) && cls !== 'me') return; const e = document.createElement('div'); e.className = 'mk ' + cls; e.style.left = (X * s) + 'px'; e.style.top = (Y * s) + 'px'; e.innerHTML = html; wrap.appendChild(e); return e; };
    const guru = new Set(Object.values(typeof LEARN !== 'undefined' ? LEARN : {}).map(L => L.guru));
    for (const n of sc.npcs) { const id = n.n.id, ic = ROLE_ICON[NPC_ROLE[id]] || (guru.has(id) ? '📖' : null); if (ic) mk2('mi', n.spr.x, n.spr.y - 6, ic); else mk2('mn', n.spr.x, n.spr.y - 4); }
    for (const c of M.chests || []) if (!S.flags[c.id] && (!c.needFlag || S.flags[c.needFlag])) mk2('mc', c.x, c.y - 4);
    for (const B of M.bosses || []) if (!S.flags[B.flag] && S.stage >= B.need) mk2('mb', B.x, B.y - 10, '☠');
    for (const ex of M.exits || []) { const X = clamp(ex.x + ex.w / 2, 30 / s, M.w - 30 / s), Y = clamp(ex.y + ex.h / 2, 8 / s, M.h - 8 / s); const e = document.createElement('div'); e.className = 'mk mx'; e.style.left = X * s + 'px'; e.style.top = Y * s + 'px'; e.innerHTML = '➜ ' + (S.seen[ex.to] ? ex.label : '???'); wrap.appendChild(e); }
    if (S.tmap && S.tmap.map === M.id) { const e = document.createElement('div'); e.className = 'mk mt'; e.style.left = S.tmap.x * s + 'px'; e.style.top = S.tmap.y * s + 'px'; e.textContent = '✖'; wrap.appendChild(e); }
    if (q) { const e = document.createElement('div'); e.className = 'mk mq'; e.style.left = q.x * s + 'px'; e.style.top = (q.y - 6) * s + 'px'; e.textContent = '★'; wrap.appendChild(e); }
    // Render Custom Pins (#62)
    S.pins = S.pins || {};
    const curPins = S.pins[M.id] || [];
    for (let pi = 0; pi < curPins.length; pi++) {
      const pin = curPins[pi];
      const pe = document.createElement('div');
      pe.className = 'mk';
      pe.style.left = (pin.x * s) + 'px';
      pe.style.top = (pin.y * s) + 'px';
      pe.style.fontSize = '12px';
      pe.style.transform = 'translate(-50%, -100%)';
      pe.textContent = '📍';
      wrap.appendChild(pe);
    }
    mk2('me', sc.pl.x, sc.pl.y - 4);
    box.style.justifyContent = box.style.alignItems = z > 1 ? 'flex-start' : 'center'; box.style.overflow = z > 1 ? 'auto' : 'hidden';
    if (z > 1) { box.scrollLeft = sc.pl.x * s - box.clientWidth / 2; box.scrollTop = sc.pl.y * s - box.clientHeight / 2; }
  };
  draw();
  const zoom = d => { const nz = clamp(z + d, 1, 3); if (nz !== z) { z = nz; sfx('cur'); draw(); } };
  w.querySelectorAll('.zb b').forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); zoom(+b.dataset.z); }));
  box.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1 : -1); }, { passive: false });
  // cubit untuk zoom & geser saat diperbesar (tidak menutup peta)
  const pts = new Map(); let pd = 0, moved = false;
  box.addEventListener('pointerdown', e => {
    e.stopPropagation();
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    moved = false;
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pd = Math.hypot(a[0] - b[0], a[1] - b[1]); }
  });
  box.addEventListener('pointermove', e => { const p = pts.get(e.pointerId); if (!p) return;
    if (pts.size === 2) { p[0] = e.clientX; p[1] = e.clientY; const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (Math.abs(d - pd) > 40) { zoom(d > pd ? 1 : -1); pd = d; } moved = true; }
    else if (z > 1) { box.scrollLeft -= e.clientX - p[0]; box.scrollTop -= e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY; if (Math.abs(e.movementX) + Math.abs(e.movementY) > 1) moved = true; } });
  const up = e => {
    const had = pts.delete(e.pointerId);
    if (had && !pts.size && !moved) {
      // Fitur #62: Taruh / Hapus Pin Penanda Pribadi (📍)
      const rect = wrap.getBoundingClientRect();
      const s = s0 * z;
      const clickX = (e.clientX - rect.left) / s;
      const clickY = (e.clientY - rect.top) / s;
      if (clickX >= 0 && clickX <= M.w && clickY >= 0 && clickY <= M.h) {
        S.pins = S.pins || {};
        S.pins[M.id] = S.pins[M.id] || [];
        const existIdx = S.pins[M.id].findIndex(p => Math.hypot(p.x - clickX, p.y - clickY) < 30 / s);
        if (existIdx >= 0) {
          S.pins[M.id].splice(existIdx, 1);
          sfx('back');
          draw();
          return;
        } else if (S.pins[M.id].length < 5) {
          S.pins[M.id].push({ x: Math.round(clickX), y: Math.round(clickY) });
          sfx('ok');
          draw();
          return;
        }
      }
      if (z === 1) press('tap');
    }
  };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', e => pts.delete(e.pointerId));
  await new Promise(res => { const prev = UIH; const h = k => { if (['a', 'b', 'menu', 'map', 'back', 'tap', 'item', 'bag'].includes(k)) { w.remove(); UIH = prev; sfx('back'); res(); } else if (k === 'up') zoom(1); else if (k === 'down') zoom(-1); }; h.tap = true; UIH = h;
    w.addEventListener('pointerdown', e => { e.stopPropagation(); press('tap'); }); });
  G.lock--;
}
