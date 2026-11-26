'use strict';
// H4b: Kartu Jurus Beranimasi (pratinjau VFX per jurus, sinergi status, bilah mahir & pasang SIHIR)
(() => {
  const s = document.createElement('style');
  s.textContent = '#skcard{position:fixed;inset:0;z-index:80;background:radial-gradient(circle at 50% 45%,#1a1f32,#090a12 85%);' +
    'display:flex;align-items:center;justify-content:center;color:#f4ead0;font-family:"Pixelify Sans",monospace}' +
    '.sk-box{width:min(96vw,680px);max-height:94vh;overflow:auto;background:linear-gradient(180deg,#161a28,#0d1019);' +
    'border:2px solid #8a6c3a;border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.85);padding:12px}' +
    '.sk-grid{display:grid;grid-template-columns:215px 1fr;gap:12px;margin-top:8px}@media(max-width:600px){.sk-grid{grid-template-columns:1fr}}' +
    '.sk-list{display:flex;flex-direction:column;gap:5px}' +
    '.sk-it{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-radius:7px;background:#191f32;' +
    'border:1px solid #303754;cursor:pointer;font-size:12px}.sk-it.sel{border-color:#ffd05a;background:#292418;color:#fff4c2}' +
    '.sk-it.lock{opacity:.58}.sk-card{background:#111522;border:1px solid #353c56;border-radius:10px;' +
    'padding:10px;display:flex;flex-direction:column;gap:7px}' +
    '.sk-tag{display:inline-block;padding:2px 6px;border-radius:5px;font-size:10px;background:#1e2438;border:1px solid #3e4766;color:#bde2ff}' +
    '.sk-btn{background:linear-gradient(#785328,#503516);border:1px solid #d4a656;color:#fff4c8;padding:6px 10px;border-radius:6px;cursor:pointer;' +
    'font:700 12px "Pixelify Sans",monospace}.sk-btn:disabled{opacity:.45;cursor:not-allowed}';
  document.head.appendChild(s);
})();

const SKILL_META = {
  fire: { ic: '🔥', col: '#ff7034', syn: 'Membakar · Meledakkan Kabut Racun', sb: 'fire' },
  dash: { ic: '💨', col: '#80d8ff', syn: 'Kebal Sesaat · Picu Lolos Sempurna', sb: 'dash' },
  spin: { ic: '⚔', col: '#ffe070', syn: 'Tebas 360° · Detonasi Luka Berdarah', sb: null },
  venom: { ic: '☣', col: '#88e86a', syn: 'Racun Beruntun · Miasma Area', sb: 'venom' },
  nova: { ic: '❄', col: '#7ae8ff', syn: 'Bekukan Musuh · Pecah Es', sb: null },
  heal: { ic: '💚', col: '#78ffa8', syn: 'Pulih HP % Maks · Aman Saat Kritis', sb: null },
  holy: { ic: '✨', col: '#fff2a0', syn: 'Bonus ×2,5 vs Hantu & Roh', sb: null }
};

openSkills = async function () { // eslint-disable-line no-global-assign
  if (document.getElementById('skcard')) return;
  G.lock++; sfx('cur');
  const ids = Object.keys(JURUS);
  let sel = 0, animF = 0;

  const w = document.createElement('div');
  w.id = 'skcard';
  w.innerHTML = `<div class="sk-box">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3c3424;padding-bottom:6px;flex-wrap:wrap;gap:6px">
      <b id="sk-hd" style="color:#ffd874;font-size:14px"></b>
      <button class="sk-btn" id="sk-cls" style="background:linear-gradient(#7e362e,#4e1d18)">✕ Tutup</button>
    </div>
    <div class="sk-grid"><div class="sk-list" id="sk-list"></div><div class="sk-card" id="sk-det"></div></div></div>`;
  document.body.appendChild(w);

  const listEl = w.querySelector('#sk-list'), detEl = w.querySelector('#sk-det'), hdEl = w.querySelector('#sk-hd');

  function render() {
    hdEl.textContent = 'JURUS ARKA · SIHIR: ' + (S.spell ? JURUS[S.spell].n : '-');
    listEl.innerHTML = '';
    ids.forEach((k, i) => {
      const J = JURUS[k], L = learned(k), M = SKILL_META[k] || {};
      const badge = L ? (S.spell === k ? '★ ' : '✦ ') : '🔒 ';
      const tier = L ? ['', 'I', 'II', 'III'][tierOf(k)] : J.school.split(' ')[0];
      const b = document.createElement('div');
      b.className = 'sk-it' + (i === sel ? ' sel' : '') + (!L ? ' lock' : '');
      b.innerHTML = `<span>${badge}${M.ic || ''} ${J.n}</span><span style="color:#ffd05a;font-size:11px">${tier}</span>`;
      b.onclick = () => { sel = i; sfx('cur'); render(); };
      listEl.appendChild(b);
    });

    const k = ids[sel], J = JURUS[k], L = learned(k), M = SKILL_META[k] || {}, t = L ? tierOf(k) : 0;
    const nx = t > 0 ? MASTERY[t] : 0, curUse = (S.mast && S.mast[k]) || 0;
    const pct = t >= 3 ? 100 : nx ? Math.min(100, Math.round(curUse / nx * 100)) : 0;
    const hasBook = M.sb && S.spellbooks && S.spellbooks[M.sb];

    const desc = L ? J.d : `Guru: <b>${J.where}</b><br><i>${J.can() ? 'Guru siap melatihmu!' : 'Syarat cerita/level belum terpenuhi.'}</i>`;
    const eqDis = S.spell === k ? 'disabled' : '';
    const eqLbl = S.spell === k ? '★ Terpasang di SIHIR' : '✦ Pasang di Tombol SIHIR';
    detEl.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <b style="font-size:15px;color:${M.col || '#ffd874'}">${M.ic || ''} ${J.n}</b>
        <span style="font-size:11px;color:#ffd874">${L ? `Tingkat ${['', 'I', 'II', 'III'][t]}` : 'Belum Dikuasai'}</span></div>
      <canvas id="sk-cv" width="260" height="84" style="background:#080b12;border:1px solid #2c344a;border-radius:8px;width:100%"></canvas>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <span class="sk-tag">${J.school}</span><span class="sk-tag">${J.mp ? J.mp + ' MP' : 'Pasif / Gerak'}</span>
        ${M.syn ? `<span class="sk-tag">${M.syn}</span>` : ''}
        ${hasBook ? `<span class="sk-tag" style="color:#ffe28a;border-color:#d49830">📖 ${SPELLBOOK_INFO[M.sb].title}</span>` : ''}
      </div>
      <div style="font-size:12px;color:#d6e0f0;line-height:1.35">${desc}</div>
      ${L ? `<div style="font-size:11px;color:#9eb0cc">Penguasaan: ${t >= 3 ? 'MAHIR PENUH' : `${curUse}/${nx} pemakaian`}</div>
        <div style="height:6px;background:#1c2234;border-radius:4px;overflow:hidden">
          <i style="display:block;height:100%;width:${pct}%;background:${M.col || '#ffd05a'}"></i></div>` : ''}
      ${L && J.kind === 'spell' ? `<button class="sk-btn" id="sk-eq" ${eqDis}>${eqLbl}</button>` : ''}`;
    const eq = detEl.querySelector('#sk-eq');
    if (eq) eq.onclick = () => { S.spell = k; sfx('ok'); updHud(); render(); };
  }

  function drawCardAnim() {
    const cv = w.querySelector('#sk-cv');
    if (!cv) return;
    const x = cv.getContext('2d'), k = ids[sel], col = (SKILL_META[k] && SKILL_META[k].col) || '#ffd05a';
    animF++;
    const p = (animF % 40) / 40;
    x.fillStyle = '#080b12'; x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = '#181e2c'; x.fillRect(0, 66, cv.width, 18);
    x.fillStyle = '#7de88c'; x.fillRect(48, 38, 12, 26);
    x.fillStyle = '#b43a2e'; x.fillRect(46, 48, 16, 16);
    x.fillStyle = '#d45a68'; x.fillRect(190, 46, 18, 18);
    x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 2;
    if (k === 'fire') {
      const bx = 66 + p * 124;
      x.beginPath(); x.arc(bx, 50 + Math.sin(p * 12) * 3, 7, 0, 7); x.fill();
    } else if (k === 'dash') {
      const dx = 48 + p * 100;
      x.fillStyle = 'rgba(128,216,255,.35)'; x.fillRect(dx - 24, 42, 14, 22);
      x.fillStyle = '#80d8ff'; x.fillRect(dx, 42, 14, 22);
    } else if (k === 'spin') {
      x.beginPath(); x.arc(54, 52, 26 + Math.sin(p * 6) * 4, p * 6.28, p * 6.28 + 4.4); x.stroke();
    } else if (k === 'venom') {
      for (let i = 0; i < 6; i++) {
        x.globalAlpha = .45; x.beginPath();
        x.arc(54 + Math.cos(i + p * 6) * 34, 54 + Math.sin(i + p * 6) * 14, 10, 0, 7); x.fill();
      }
      x.globalAlpha = 1;
    } else if (k === 'nova' || k === 'holy') {
      x.beginPath(); x.arc(54, 52, 8 + p * 44, 0, 7); x.stroke();
    } else {
      x.beginPath(); x.arc(54, 52, 16 + Math.sin(p * 6) * 4, 0, 7); x.stroke();
      x.font = 'bold 12px monospace'; x.fillText('+HP', 44, 28 - p * 12);
    }
  }

  render();
  const raf = setInterval(drawCardAnim, 45);
  await new Promise(res => {
    const prev = UIH;
    const close = () => { clearInterval(raf); w.remove(); UIH = prev; res(); };
    w.querySelector('#sk-cls').onclick = () => { sfx('back'); close(); };
    UIH = k => {
      if (k === 'b' || k === 'menu' || k === 'back') { sfx('back'); close(); }
      else if (k === 'down' || k === 'right') { sel = (sel + 1) % ids.length; sfx('cur'); render(); }
      else if (k === 'up' || k === 'left') { sel = (sel + ids.length - 1) % ids.length; sfx('cur'); render(); }
      else if (k === 'a') { const id = ids[sel]; if (learned(id) && JURUS[id].kind === 'spell') { S.spell = id; sfx('ok'); updHud(); render(); } }
    };
  });
  G.lock--;
};
