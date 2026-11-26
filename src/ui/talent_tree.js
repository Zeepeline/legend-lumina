'use strict';
// H2: Pohon Bakat Radial 4 Cabang (SVG konektor, pratinjau animasi, efek pasif lengkap)
TALENT_DEFS.grd = {
  n: 'Penjaga Baja', ic: '🛡',
  nodes: [
    { id: 'g1', n: 'Zirah Hidup', d: 'Pertahanan bawaan meningkat tajam (+2/+4/+6 DEF).' },
    { id: 'g2', n: 'Pijakan Kukuh', d: 'Mengurangi kerusakan pukul musuh & menaikkan HP maks (+8/+16/+24 HP).' },
    { id: 'g3', n: 'Embun Botol', d: 'Pemulihan HP dari Ramuan & Botol Cahaya bertambah (+15%/+30%/+45%).' }
  ]
};

// Wiring efek pasif seluruh 4 cabang yang belum terhubung penuh
(() => {
  const stat0 = stat;
  stat = function () { // eslint-disable-line no-global-assign
    const st = stat0.apply(this, arguments);
    const T = (typeof S !== 'undefined' && S && S.talents) || {};
    const grd = T.grd || [0, 0, 0], war = T.war || [0, 0, 0];
    st.def += (grd[0] || 0) * 2;
    st.maxhp += (grd[1] || 0) * 8;
    st.crit = (st.crit || 0) + (war[1] || 0) * .04;
    return st;
  };

  const W = World.prototype;
  const hit0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    const war0 = (S && S.talents && S.talents.war && S.talents.war[0]) || 0;
    if (war0 > 0 && e && !this._inShots && !this.curElem && !this._cleaveHit) {
      base = Math.round((base || 0) * (1 + war0 * .06));
      this._cleaveHit = true;
      try {
        for (const o of this.enemies || []) {
          if (o !== e && o.hp > 0 && Math.hypot(o.spr.x - e.spr.x, o.spr.y - e.spr.y) < 16 + war0 * 6) {
            hit0.call(this, o, Math.round(base * .45), false, nx, ny);
          }
        }
      } finally { this._cleaveHit = false; }
    }
    return hit0.call(this, e, base, crit, nx, ny);
  };

  const spMul0 = W.speedMul;
  W.speedMul = function () {
    let m = spMul0 ? spMul0.apply(this, arguments) : 1;
    const exp2 = (S && S.talents && S.talents.exp && S.talents.exp[2]) || 0;
    if (exp2 > 0 && this.pl && this.pl._terrain === 'bog' && S.eq?.acc !== 'boots') m /= .82;
    return m;
  };

  const mg0 = W.magic;
  W.magic = function () {
    const mp0 = S.mp, r = mg0.apply(this, arguments);
    const mag0 = (S && S.talents && S.talents.mag && S.talents.mag[0]) || 0;
    if (mag0 > 0 && S.mp < mp0) { S.mp = Math.min(stat().maxmp, S.mp + 1); updHud(); }
    return r;
  };

  const use0 = W.useItem;
  W.useItem = function (id) {
    const hp0 = S.hp, r = use0.apply(this, arguments);
    const grd2 = (S && S.talents && S.talents.grd && S.talents.grd[2]) || 0;
    if (r && grd2 > 0 && S.hp > hp0) {
      const bonus = Math.max(1, Math.round((S.hp - hp0) * grd2 * .15));
      S.hp = Math.min(stat().maxhp, S.hp + bonus);
      updHud();
    }
    return r;
  };

  const s = document.createElement('style');
  s.textContent = '#ttree{position:fixed;inset:0;z-index:80;background:radial-gradient(circle at 50% 45%,#1c2236,#0a0c14 82%);' +
    'display:flex;align-items:center;justify-content:center;color:#f4ead0;font-family:"Pixelify Sans",monospace}' +
    '.tt-box{width:min(96vw,680px);max-height:94vh;overflow:auto;background:linear-gradient(180deg,#181c2b,#0f121d);' +
    'border:2px solid #9a7438;border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.85);padding:12px}' +
    '.tt-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;border-bottom:1px solid #3c3424;padding-bottom:8px}' +
    '.tt-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:12px;margin-top:10px}@media(max-width:600px){.tt-grid{grid-template-columns:1fr}}' +
    '.tt-board{position:relative;height:256px;background:radial-gradient(circle,#1e2438,#0c0f18);' +
    'border:1px solid #3c425e;border-radius:10px;overflow:hidden}' +
    '.tt-node{position:absolute;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;border:2px solid #58607e;' +
    'background:#1a2034;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:.12s}' +
    '.tt-node.on{border-color:#ffd05a;box-shadow:0 0 12px rgba(255,208,90,.45);background:#2b2316}' +
    '.tt-node.sel{outline:2px solid #fff;transform:translate(-50%,-50%) scale(1.12)}' +
    '.tt-node small{font-size:9px;color:#ffd87a;line-height:1}' +
    '.tt-card{background:#121624;border:1px solid #353c56;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}' +
    '.tt-btn{background:linear-gradient(#785328,#503516);border:1px solid #d4a656;color:#fff4c8;padding:6px 10px;' +
    'border-radius:6px;cursor:pointer;font:700 12px "Pixelify Sans",monospace}' +
    '.tt-btn:disabled{opacity:.45;cursor:not-allowed}';
  document.head.appendChild(s);
})();

openTalentTree = async function () { // eslint-disable-line no-global-assign
  if (document.getElementById('ttree')) return;
  G.lock++; sfx('cur');
  S.talents = Object.assign({ war: [0, 0, 0], mag: [0, 0, 0], exp: [0, 0, 0], grd: [0, 0, 0] }, S.talents || {});
  if (!Array.isArray(S.talents.grd)) S.talents.grd = [0, 0, 0];

  const POS = {
    war: [[50, 35], [37, 20], [63, 18]],
    mag: [[32, 50], [16, 36], [16, 65]],
    exp: [[68, 50], [84, 36], [84, 65]],
    grd: [[50, 66], [37, 83], [63, 83]]
  };
  const COL = { war: '#ff6e5a', mag: '#70c8ff', exp: '#78e678', grd: '#f4c05a' };
  const FLAT = [];
  ['war', 'mag', 'exp', 'grd'].forEach(cat => [0, 1, 2].forEach(i => FLAT.push({ cat, i, x: POS[cat][i][0], y: POS[cat][i][1] })));

  let selIdx = 0;
  let animFrame = 0;
  const w = document.createElement('div');
  w.id = 'ttree';
  w.innerHTML = `<div class="tt-box">
    <div class="tt-head"><b style="color:#ffd874;font-size:15px">✦ POHON BAKAT ARKA</b><span id="tt-pts" style="color:#9ee8ff;font-size:12px"></span></div>
    <div class="tt-grid"><div class="tt-board" id="tt-board"></div><div class="tt-card" id="tt-card"></div></div>
    <div style="display:flex;justify-content:space-between;gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="tt-btn" id="tt-rst">↩ Reset Bakat (50 G)</button>
      <button class="tt-btn" id="tt-cls" style="background:linear-gradient(#7e362e,#4e1d18)">✕ Tutup</button>
    </div></div>`;
  document.body.appendChild(w);

  const board = w.querySelector('#tt-board'), card = w.querySelector('#tt-card');
  let raf = null;

  function render() {
    const tp = getTalentPoints();
    w.querySelector('#tt-pts').textContent = `Poin Bebas: ${tp.free} · Terpakai: ${tp.spent} (Lv ${S.lv})`;
    let svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">';
    ['war', 'mag', 'exp', 'grd'].forEach(cat => {
      const p = POS[cat], v = S.talents[cat];
      svg += `<line x1="50" y1="50" x2="${p[0][0]}" y2="${p[0][1]}" stroke="${v[0] > 0 ? COL[cat] : '#3a425a'}" stroke-width="1.3"/>`;
      svg += `<line x1="${p[0][0]}" y1="${p[0][1]}" x2="${p[1][0]}" y2="${p[1][1]}" stroke="${v[1] > 0 ? COL[cat] : '#3a425a'}" stroke-width="1.2"/>`;
      svg += `<line x1="${p[0][0]}" y1="${p[0][1]}" x2="${p[2][0]}" y2="${p[2][1]}" stroke="${v[2] > 0 ? COL[cat] : '#3a425a'}" stroke-width="1.2"/>`;
    });
    svg += '</svg><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:28px;height:28px;' +
      'border-radius:50%;background:radial-gradient(#fff6c8,#d4982a);border:2px solid #fff;box-shadow:0 0 16px #ffd05a;' +
      'display:flex;align-items:center;justify-content:center;color:#2a1808;font-weight:700">✦</div>';
    board.innerHTML = svg;

    FLAT.forEach((n, idx) => {
      const lv = (S.talents[n.cat] && S.talents[n.cat][n.i]) || 0;
      const b = document.createElement('button');
      b.className = 'tt-node' + (lv > 0 ? ' on' : '') + (idx === selIdx ? ' sel' : '');
      b.style.left = n.x + '%'; b.style.top = n.y + '%';
      b.innerHTML = `<span>${TALENT_DEFS[n.cat].ic}</span><small>${lv}/3</small>`;
      b.onclick = () => { selIdx = idx; sfx('cur'); render(); };
      board.appendChild(b);
    });

    const cur = FLAT[selIdx], C = TALENT_DEFS[cur.cat], nd = C.nodes[cur.i], lv = (S.talents[cur.cat][cur.i]) || 0;
    card.innerHTML = `<div style="font-size:13px;color:${COL[cur.cat]};font-weight:700">${C.ic} ${C.n}</div>
      <div style="font-size:15px;font-weight:700;color:#fff4cc">${nd.n} <span style="color:#ffd05a">${'★'.repeat(lv)}${'☆'.repeat(3 - lv)}</span></div>
      <canvas id="tt-cv" width="220" height="72" style="background:#0a0d16;border:1px solid #2b3348;border-radius:6px;width:100%"></canvas>
      <div style="font-size:12px;color:#cbd6ea;line-height:1.35">${nd.d}</div>
      <button class="tt-btn" id="tt-up" ${lv >= 3 || tp.free <= 0 ? 'disabled' : ''}>${lv >= 3 ? 'Maksimal (★★★)' : 'Tingkatkan (+1 Poin)'}</button>`;
    card.querySelector('#tt-up').onclick = () => upgradeCur();
  }

  function upgradeCur() {
    const tp = getTalentPoints(), cur = FLAT[selIdx];
    const lv = S.talents[cur.cat][cur.i] || 0;
    if (tp.free <= 0 || lv >= 3) { sfx('buzz'); return; }
    S.talents[cur.cat][cur.i]++;
    sfx('lvl'); updHud();
    if (G.scene && G.scene.pl) popWorld(G.scene.pl.x, G.scene.pl.y - 24, `${TALENT_DEFS[cur.cat].nodes[cur.i].n} ★${lv + 1}`, 'crit');
    render();
  }

  function drawPreview() {
    const cv = w.querySelector('#tt-cv');
    if (!cv) return;
    const x = cv.getContext('2d'), cur = FLAT[selIdx], c = COL[cur.cat];
    animFrame++;
    const t = animFrame * .12;
    x.fillStyle = '#0a0d16'; x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = '#20263a'; x.fillRect(0, 56, cv.width, 16);
    x.fillStyle = '#8ef09a'; x.fillRect(46, 32, 10, 22);
    x.fillStyle = '#b43428'; x.fillRect(44, 42, 14, 14);
    x.strokeStyle = c; x.lineWidth = 2;
    if (cur.cat === 'war') {
      x.beginPath(); x.arc(72, 42, 18 + (Math.sin(t) + 1) * 4, -.9, .9); x.stroke();
      x.fillStyle = '#ff6060'; x.fillRect(156, 36, 16, 18);
    } else if (cur.cat === 'mag') {
      const px = 66 + ((animFrame * 4) % 90);
      x.fillStyle = '#7ad4ff'; x.beginPath(); x.arc(px, 42 + Math.sin(t * 2) * 3, 5, 0, 7); x.fill();
      x.strokeRect(px - 8, 34, 16, 16);
    } else if (cur.cat === 'exp') {
      const dx = 40 + ((animFrame * 3) % 120);
      x.fillStyle = '#78e678'; x.fillRect(dx, 40, 12, 14);
      x.fillStyle = 'rgba(120,230,120,.35)'; x.fillRect(dx - 12, 42, 10, 10);
    } else {
      x.beginPath(); x.arc(51, 44, 18 + Math.sin(t * 1.5) * 2, 0, 7); x.stroke();
    }
  }

  render();
  raf = setInterval(drawPreview, 50);

  await new Promise(res => {
    const prev = UIH;
    const close = () => { clearInterval(raf); w.remove(); UIH = prev; res(); };
    w.querySelector('#tt-cls').onclick = () => { sfx('back'); close(); };
    w.querySelector('#tt-rst').onclick = () => {
      if (S.gold < 50) { sfx('buzz'); popWorld(G.scene?.pl?.x || 0, (G.scene?.pl?.y || 0) - 24, 'Butuh 50 G', 'hurt'); return; }
      S.gold -= 50;
      S.talents = { war: [0, 0, 0], mag: [0, 0, 0], exp: [0, 0, 0], grd: [0, 0, 0] };
      sfx('heal'); updHud(); render();
    };
    UIH = k => {
      if (k === 'b' || k === 'menu' || k === 'back') { sfx('back'); close(); }
      else if (k === 'right' || k === 'down') { selIdx = (selIdx + 1) % FLAT.length; sfx('cur'); render(); }
      else if (k === 'left' || k === 'up') { selIdx = (selIdx + FLAT.length - 1) % FLAT.length; sfx('cur'); render(); }
      else if (k === 'a') upgradeCur();
    };
  });
  G.lock--;
};
