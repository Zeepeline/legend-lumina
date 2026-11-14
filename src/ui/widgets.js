'use strict';
// UI DOM: dialog (say/talk), menu (choose/ask), banner, angka melayang, HUD
// =====================================================================
//  UI (DOM di atas kanvas): dialog, menu, HUD, angka kerusakan
// =====================================================================
let UIH = null;            // handler input aktif untuk UI (null = gameplay)
const G = { lock: 0, title: true, scene: null };
function win(cls, html = '') { const d = document.createElement('div'); d.className = 'win ' + cls; d.innerHTML = html; UI.appendChild(d); return d; }
function fadeTo(v) { FADE.style.opacity = v; return sleep(360); }
function shake() { if (!OPT.shake) return; SCREEN.classList.remove('shake'); void SCREEN.offsetWidth; SCREEN.classList.add('shake'); }

// ---- dialog ----
// Catatan: say(teks, nama) & choose({ head, items }). Format lama/salah dari agent lain juga diterima agar layar tidak membeku:
//   say('Nama', ['baris', ...])  → dialog beberapa baris;  choose('Judul', ['opsi', ...])  → menu
const DLG_LOG = []; // riwayat dialog (fitur #880)
function say(text, name) {
  if (Array.isArray(name)) return talk(text, name);
  if (Array.isArray(text)) return talk(name || null, text);
  DLG_LOG.push({ name: name || '', text: String(text) }); if (DLG_LOG.length > 60) DLG_LOG.shift();
  return new Promise(res => {
    const prev = UIH;
    const w = win('dlg act', (name ? `<div class="nm">${name}</div>` : '') + '<div class="tx"></div><div class="more">▼</div>');
    const tx = w.querySelector('.tx'); let i = 0, done = false;
    const spd = [1, 2, 4, 999][OPT.txt != null ? OPT.txt : 1] || 2;
    const tick = setInterval(() => { i += spd + (Input.keys && (Input.keys.a || Input.keys.b) ? 3 : 0); tx.textContent = text.slice(0, i); if (i % 4 < spd && text[i] && text[i] !== ' ' && spd < 4) sfx('blip'); if (i >= text.length) finish(); }, 24);
    function finish() { clearInterval(tick); tx.textContent = text; done = true; w.classList.add('done'); }
    const h = k => {
      if (k !== 'a' && k !== 'b' && k !== 'tap') return;
      if (!done) { finish(); return; }
      w.remove(); UIH = prev; res();
    };
    h.tap = true; UIH = h;
    w.addEventListener('pointerdown', e => { e.stopPropagation(); press('tap'); });
  });
}
async function talk(name, lines) { G.lock++; try { for (const l of lines) await say(l, name); } finally { G.lock--; } }

// ---- menu pilihan ----
// items: [{t, r, dis, desc}]  → Promise<index | -1>
function choose(o, items) {
  if (typeof o === 'string' || Array.isArray(o)) { const head = typeof o === 'string' ? o : null, list = Array.isArray(o) ? o : items || []; o = { head, x: 24, y: 40, w: 260, items: list.map(t => typeof t === 'string' ? { t } : t) }; }
  if (!o || !Array.isArray(o.items) || !o.items.length) { console.warn('choose() tanpa pilihan'); return Promise.resolve(-1); }
  return new Promise(res => {
    const prev = UIH;
    const w = win('menu act', (o.head ? `<div class="mh">${o.head}</div>` : '') + '<div class="ops"></div>' + (o.foot ? '<div class="mf"></div>' : ''));
    Object.assign(w.style, o.style || {});
    const maxW = Math.min(276, o.w || 260);
    const leftX = o.x != null ? clamp(o.x, 6, 282 - maxW) : null;
    const topY = o.y != null ? clamp(o.y, 6, 180) : null;
    if (leftX != null) w.style.left = leftX + 'px'; if (topY != null) w.style.top = topY + 'px';
    if (o.w) w.style.width = maxW + 'px';
    w.style.maxWidth = 'calc(100% - 12px)';
    if (o.right != null) w.style.right = o.right + 'px'; if (o.bottom != null) w.style.bottom = o.bottom + 'px';
    const ops = w.querySelector('.ops'), mf = w.querySelector('.mf');
    let sel = Math.max(0, o.start || 0);
    const els = o.items.map((it, i) => {
      const e = document.createElement('div'); e.className = 'opt' + (it.dis ? ' dis' : ''); e.innerHTML = `<b style="font-weight:400">${it.t}</b>` + (it.r != null ? `<span>${it.r}</span>` : '');
      e.addEventListener('pointerdown', ev => { ev.stopPropagation(); sel = i; draw(); pick(); }); ops.appendChild(e); return e;
    });
    function draw() {
      els.forEach((e, i) => e.classList.toggle('sel', i === sel));
      if (els[sel]) els[sel].scrollIntoView({ block: 'nearest' });
      if (mf) mf.innerHTML = (o.foot && o.foot(sel)) || '';
    }
    function pick() { const it = o.items[sel]; if (it.dis) { sfx('buzz'); return; } sfx('ok'); close(sel); }
    function close(v) { w.remove(); UIH = prev; res(v); }
    const h = k => {
      if (k === 'up' || k === 'jup') { sel = (sel + o.items.length - 1) % o.items.length; sfx('cur'); draw(); }
      else if (k === 'down' || k === 'jdown') { sel = (sel + 1) % o.items.length; sfx('cur'); draw(); }
      else if (k === 'a') pick();
      else if ((k === 'b' || k === 'menu' || k === 'back') && o.cancel !== false) { sfx('back'); close(-1); }
    };
    UIH = h; draw();
  });
}
async function ask(q, name, yes = 'Ya', no = 'Tidak') {
  G.lock++;
  const w = win('dlg', (name ? `<div class="nm">${name}</div>` : '') + `<div class="tx">${q}</div>`);
  const r = await choose({ items: [{ t: yes }, { t: no }], right: 8, bottom: 62 });
  w.remove(); G.lock--; return r === 0;
}
const BANNER_QUEUE = [];
let BANNER_BUSY = false;
function processBannerQueue() {
  if (BANNER_BUSY || !BANNER_QUEUE.length) return;
  BANNER_BUSY = true;
  const item = BANNER_QUEUE.shift();
  const b = win('banner' + (item.big ? ' big' : ''), (item.sub ? `<small>${item.sub}</small>` : '') + item.text);
  if (item.onCreated) item.onCreated(b);
  setTimeout(() => b.classList.add('out'), item.ms);
  setTimeout(() => {
    b.remove();
    BANNER_BUSY = false;
    processBannerQueue();
  }, item.ms + 600);
}
function banner(text, sub, big, ms = 1800) {
  let createdEl = null;
  if (BANNER_QUEUE.length >= 3) BANNER_QUEUE.shift();
  BANNER_QUEUE.push({ text, sub, big, ms, onCreated: el => { createdEl = el; } });
  processBannerQueue();
  return createdEl;
}

// ---- angka melayang (menempel di dunia) ----
const POPS = [];
function popWorld(x, y, text, cls = '') {
  const e = document.createElement('div'); const col = typeof cls === 'string' && cls[0] === '#'; e.className = 'pop ' + (col ? '' : cls); if (col) e.style.color = cls; e.textContent = text; UI.appendChild(e);
  POPS.push({ e, x, y }); setTimeout(() => { e.remove(); const i = POPS.findIndex(p => p.e === e); if (i >= 0) POPS.splice(i, 1); }, 900);
}
function updPops(cam) { for (const p of POPS) { p.e.style.left = Math.round(p.x - cam.scrollX) + 'px'; p.e.style.top = Math.round(p.y - cam.scrollY) + 'px'; } }

// ---- HUD ----
let HUD = null;
function buildHud(icons) {
  HUD = document.createElement('div');
  HUD.innerHTML = `<div id="hud"><div class="lv">LV<b id="hLv">1</b></div><div class="bars">
   <div class="bar hp" id="hHp"><i></i><span></span></div><div class="bar mp" id="hMp"><i></i><span></span></div><div class="bar sta" id="hSta" style="height:4px"><i></i></div><div class="bar xp" id="hXp"><i></i></div></div></div>
   <div id="hDate"></div><div id="hud2"><span id="hClock">☀</span><span id="hCompass" style="font-size:9px;color:#ffe27a;margin:0 2px;">🧭 U</span><span><img src="${icons.coin}"><b id="hGold">0</b></span><span class="pt"><img src="${icons.potion}"><b id="hPot">0</b></span></div>
   <div id="fps-meter" style="display:${OPT.fps ? 'block' : 'none'};position:absolute;top:28px;left:4px;font-size:9px;color:#a0f080;background:rgba(0,0,0,0.55);padding:2px 5px;border-radius:3px;z-index:9000;pointer-events:none;font-family:monospace;">60 FPS</div>
   <div id="quest"></div><div id="boss"><span id="bName"></span><div class="bar"><i id="bHp"></i></div></div>`;
  UI.appendChild(HUD);
}
function updHud() {
  if (!HUD) return; const st = stat();
  $('hLv').textContent = S.lv;
  const hp = $('hHp'); hp.firstChild.style.width = (S.hp / st.maxhp * 100) + '%'; hp.lastChild.textContent = S.hp + '/' + st.maxhp; hp.classList.toggle('low', S.hp <= st.maxhp * .3);
  const mp = $('hMp'); mp.firstChild.style.width = (S.mp / st.maxmp * 100) + '%'; mp.lastChild.textContent = S.mp + '/' + st.maxmp;
  const sta = $('hSta'); if (sta) { const curSta = S.sta != null ? S.sta : st.maxsta; sta.firstChild.style.width = (curSta / st.maxsta * 100) + '%'; }
  $('hXp').firstChild.style.width = (S.exp / need(S.lv) * 100) + '%';
  $('hGold').textContent = Math.floor(S.gold || 0); $('hPot').textContent = (S.inv.potion || 0) + (S.inv.hipotion || 0);
  const compEl = $('hCompass');
  if (compEl && G.scene?.pl) {
    const cardMap = { up: 'U', down: 'S', left: 'B', right: 'T' };
    const cDir = cardMap[G.scene.pl.dir] || 'U';
    compEl.textContent = `🧭 ${cDir}`;
  }
  const q = $('quest');
  const prog = { 2: [S.inv.seal || 0, 3], 11: [[0, 1, 2].filter(k => S.flags['torch' + k]).length, 3], 15: [['m_darto', 'm_sari', 'm_dodi'].filter(k => S.flags[k]).length, 3], 25: [(typeof ARSIP !== 'undefined' ? ARSIP : []).filter(k => S.lore[k]).length, 4] }[S.stage];
  const txt = STAGE_TXT[S.stage];
  q.innerHTML = txt ? `<div class="qh">★ MISI UTAMA</div><div class="qt">${txt}${prog ? ` <span class="qp">${prog[0]}/${prog[1]}</span>` : ''}</div><div class="qf">ketuk: Jurnal<span class="qd"></span></div>` : '';
  q.style.display = txt ? '' : 'none';
  if (!q._tap) { q._tap = 1; q.addEventListener('pointerdown', e => { e.stopPropagation(); if (!G.lock && !G.title) openQuests(); }); }
}
function showHud(v) { if (!HUD) return; for (const id of ['hud', 'hud2', 'quest']) $(id).style.opacity = v ? 1 : 0; }
function bossBar(name, f) { const b = $('boss'); if (name === null) { b.style.display = 'none'; return; } b.style.display = 'block'; $('bName').textContent = name; $('bHp').style.width = Math.max(0, f * 100) + '%'; }
SCREEN.addEventListener('pointerdown', () => { if (UIH && UIH.tap) press('tap'); });
// Ikon kecil "tersimpan" di pojok saat simpan otomatis
function autoSaveIcon() { let e = $('autosv'); if (!e) { e = document.createElement('div'); e.id = 'autosv'; e.textContent = '💾 tersimpan'; SCREEN.appendChild(e); } e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); }
