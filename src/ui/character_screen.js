'use strict';
// H3b: Layar Karakter Beranimasi (Sprite hidup, Ras x Kelas, Poin Atribut, Set & Familiar)
(() => {
  const s = document.createElement('style');
  s.textContent = '#charui{position:fixed;inset:0;z-index:80;background:radial-gradient(circle at 50% 40%,#1d1b2d,#090a10 82%);' +
    'display:flex;align-items:center;justify-content:center;color:#f4ead0;font-family:"Pixelify Sans",monospace}' +
    '.ch-box{width:min(96vw,690px);max-height:94vh;overflow:auto;background:linear-gradient(180deg,#191826,#10101a);' +
    'border:2px solid #9e783a;border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.85);padding:12px}' +
    '.ch-hd{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3c3424;padding-bottom:6px;flex-wrap:wrap;gap:6px}' +
    '.ch-main{display:grid;grid-template-columns:230px 1fr;gap:12px;margin-top:10px}@media(max-width:600px){.ch-main{grid-template-columns:1fr}}' +
    '.ch-pnl{background:#12131f;border:1px solid #333750;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}' +
    '.ch-row{display:flex;justify-content:space-between;align-items:center;' +
    'background:#1a1c2d;padding:5px 8px;border-radius:6px;border:1px solid #2c304a}' +
    '.ch-row.sel{border-color:#ffd05a;background:#26231a}' +
    '.ch-pill{padding:3px 7px;border-radius:6px;border:1px solid #4a4f70;background:#1d2034;' +
    'color:#d6e0f0;font:700 11px "Pixelify Sans",monospace;cursor:pointer}' +
    '.ch-pill.on{background:#523c1a;border-color:#ffd05a;color:#fff2b8}' +
    '.ch-btn{background:linear-gradient(#785328,#503516);border:1px solid #d4a656;color:#fff4c8;padding:5px 9px;border-radius:6px;cursor:pointer;' +
    'font:700 11px "Pixelify Sans",monospace}.ch-btn:disabled{opacity:.4;cursor:not-allowed}';
  document.head.appendChild(s);
})();

openAttr = async function () { // eslint-disable-line no-global-assign
  if (document.getElementById('charui')) return;
  G.lock++; sfx('cur'); attrInit();
  S.origin = Object.assign({ cls: 'pendekar', race: 'manusia' }, S.origin || {});
  S.familiar = Object.assign({ unlocked: false, active: false, kind: 'crow' }, S.familiar || {});

  let pose = 'walk', sel = 0, tick = 0, nextAction = null;
  const poses = {
    idle: ['idle_down0', 'idle_down1', 'idle_down2', 'idle_down3'],
    walk: ['walk8d_0', 'walk8d_1', 'walk8d_2', 'walk8d_3', 'walk8d_4', 'walk8d_5', 'walk8d_6', 'walk8d_7'],
    slash: ['atk1_side0', 'atk1_side1', 'atk1_side2', 'atk1_side3']
  };
  const races = Object.keys(ORIGIN_RACES), classes = Object.keys(ORIGIN_CLASSES);

  const w = document.createElement('div');
  w.id = 'charui';
  w.innerHTML = `<div class="ch-box">
    <div class="ch-hd"><b style="color:#ffd874;font-size:15px">✦ KARAKTER ARKA</b><span id="ch-title" style="color:#9ee8ff;font-size:12px"></span></div>
    <div class="ch-main"><div class="ch-pnl" id="ch-left"></div><div class="ch-pnl" id="ch-right"></div></div>
    <div style="display:flex;justify-content:space-between;gap:6px;margin-top:10px;flex-wrap:wrap">
      <div style="display:flex;gap:6px"><button class="ch-btn" id="ch-skl">✦ Jurus</button><button class="ch-btn" id="ch-tal">🌳 Pohon Bakat</button></div>
      <button class="ch-btn" id="ch-cls" style="background:linear-gradient(#7e362e,#4e1d18)">✕ Tutup</button>
    </div></div>`;
  document.body.appendChild(w);

  const left = w.querySelector('#ch-left'), right = w.querySelector('#ch-right');

  function render() {
    const st = stat(), org = getOriginData(), arch = typeof getArchetype === 'function' ? getArchetype() : null;
    const sets = typeof activeSets === 'function' ? activeSets() : [];
    w.querySelector('#ch-title').textContent = `${S.heroName || 'Arka'} · Lv ${S.lv} · ${org.title}`;

    const raceBtns = races.map(id =>
      `<button class="ch-pill${S.origin.race === id ? ' on' : ''}" data-race="${id}">${ORIGIN_RACES[id].ic} ${ORIGIN_RACES[id].n.split(' ')[0]}</button>`
    ).join('');
    const clsBtns = classes.map(id =>
      `<button class="ch-pill${S.origin.cls === id ? ' on' : ''}" data-cls="${id}">${ORIGIN_CLASSES[id].ic} ${ORIGIN_CLASSES[id].n}</button>`
    ).join('');
    const famLbl = S.familiar.unlocked ? (S.familiar.active ? '🦅 Gagak Senja: Aktif' : '🦅 Gagak Senja: Nonaktif') : '🔒 Gagak Senja (Rakit Jimat)';
    left.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <canvas id="ch-spr" width="96" height="84"
        style="background:radial-gradient(#262a42,#0e101c);border:1px solid #444b6e;border-radius:8px;image-rendering:pixelated"></canvas>
      <div style="display:flex;gap:4px">${[['idle', 'Diam'], ['walk', 'Jalan'], ['slash', 'Tebas']].map(([k, n]) =>
        `<button class="ch-pill${pose === k ? ' on' : ''}" data-pose="${k}">${n}</button>`).join('')}</div></div>
      <div style="font-size:11px;color:#ffd05a;font-weight:700">RAS: ${org.race.ic} ${org.race.n}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">${raceBtns}</div>
      <div style="font-size:10px;color:#9ed8ff">${org.race.perk}</div>
      <div style="font-size:11px;color:#ffd05a;font-weight:700">KELAS: ${org.cls.ic} ${org.cls.n}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">${clsBtns}</div>
      <div style="font-size:10px;color:#b8f0a8">${org.cls.perk}</div>
      <button class="ch-pill${S.familiar.active ? ' on' : ''}" id="ch-fam" style="text-align:center">${famLbl}</button>`;

    const statLine = `HP ${S.hp}/${st.maxhp} · MP ${S.mp}/${st.maxmp} · STA ${st.maxsta || 100}<br>` +
      `ATK <b>${st.atk}</b> · MAG <b>${st.mag}</b> · DEF <b>${st.def}</b> · SPD ${Math.round(st.spd * 100)}% · CRIT ${Math.round((st.crit || 0) * 100)}%` +
      (st.regen ? ` · Regen ${st.regen}` : '');
    right.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <b style="color:#ffd874;font-size:13px">ALOKASI ATRIBUT</b><span style="color:#8af0ff;font-size:12px">Sisa Poin: <b>${S.ap}</b></span></div>` +
      ATTR.map(([k, n, d], i) => `<div class="ch-row${sel === i ? ' sel' : ''}" data-idx="${i}">
        <div><b>${n} (${k.toUpperCase()})</b><div style="font-size:10px;color:#9aa8c4">${d}</div></div>
        <div style="display:flex;align-items:center;gap:6px"><b style="color:#ffd05a;font-size:14px">${S.attr[k]}</b>
          <button class="ch-btn" data-add="${k}" ${!S.ap ? 'disabled' : ''}>+1</button></div></div>`).join('') +
      `<div style="background:#191b2a;border:1px solid #353954;border-radius:6px;padding:7px;font-size:11px;` +
      `line-height:1.4;color:#dce6f8">${statLine}</div>` +
      `<div style="background:#161a26;border:1px solid #2e344a;border-radius:6px;padding:7px;font-size:11px;color:#b8c4dc">
        <div><b style="color:#ffd05a">Aliran Aktif:</b> ${arch ? arch.n : '-'}</div>
        <div><b style="color:#8ae89a">Set Aktif:</b> ${sets.length ? sets.map(x => x.n).join(', ') : 'Belum ada set lengkap'}</div></div>`;

    left.querySelectorAll('[data-pose]').forEach(b => { b.onclick = () => { pose = b.dataset.pose; sfx('cur'); render(); }; });
    left.querySelectorAll('[data-race]').forEach(b => { b.onclick = () => { S.origin.race = b.dataset.race; sfx('ok'); updHud(); render(); }; });
    left.querySelectorAll('[data-cls]').forEach(b => { b.onclick = () => { S.origin.cls = b.dataset.cls; sfx('ok'); updHud(); render(); }; });
    left.querySelector('#ch-fam').onclick = () => {
      if (!S.familiar.unlocked) {
        sfx('buzz');
        popWorld(G.scene?.pl?.x || 0, (G.scene?.pl?.y || 0) - 24, 'Rakit Jimat Gagak Senja di Kerajinan!', 'xp');
        return;
      }
      S.familiar.active = !S.familiar.active;
      sfx(S.familiar.active ? 'ok' : 'back');
      if (G.scene && G.scene.syncFamiliar) G.scene.syncFamiliar();
      render();
    };
    right.querySelectorAll('[data-add]').forEach(b => { b.onclick = () => addAttr(b.dataset.add); });
  }

  function addAttr(k) {
    if (!S.ap) { sfx('buzz'); return; }
    S.attr[k]++; S.ap--; sfx('ok'); updHud(); render();
  }

  function drawHero() {
    const cv = w.querySelector('#ch-spr');
    if (!cv) return;
    const x = cv.getContext('2d'), sc = G.scene;
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, cv.width, cv.height);
    x.fillStyle = 'rgba(0,0,0,.38)'; x.beginPath(); x.ellipse(48, 74, 16, 5, 0, 0, 7); x.fill();
    const list = poses[pose] || poses.walk, fn = list[(tick++) % list.length];
    const scTex = sc && sc.textures;
    const tKey = scTex && scTex.exists('ch_hero') ? 'ch_hero' : (scTex && scTex.exists('hero') ? 'hero' : null);
    const tex = tKey ? scTex.get(tKey) : null;
    const fb = pose === 'walk' ? 'down1' : pose === 'slash' ? 'side3' : 'down0';
    const fr = tex && (tex.has(fn) ? tex.get(fn) : tex.has(fb) ? tex.get(fb) : tex.get('down0'));
    const im = tex && tex.getSourceImage ? tex.getSourceImage() : (fr && fr.source && fr.source.image);
    if (fr && im) {
      const scK = Math.min(1.5, 68 / Math.max(40, fr.cutHeight));
      const dw = fr.cutWidth * scK, dh = fr.cutHeight * scK;
      x.drawImage(im, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, Math.round(48 - dw / 2), Math.round(76 - dh), Math.round(dw), Math.round(dh));
    }
  }

  render();
  drawHero();
  const raf = setInterval(drawHero, 220);

  await new Promise(res => {
    const prev = UIH;
    const close = () => { clearInterval(raf); w.remove(); UIH = prev; res(); };
    w.querySelector('#ch-cls').onclick = () => { sfx('back'); close(); };
    w.querySelector('#ch-skl').onclick = () => { nextAction = 'skills'; sfx('ok'); close(); };
    w.querySelector('#ch-tal').onclick = () => { nextAction = 'talent'; sfx('ok'); close(); };
    UIH = k => {
      if (k === 'b' || k === 'menu' || k === 'back') { sfx('back'); close(); }
      else if (k === 'down') { sel = (sel + 1) % ATTR.length; sfx('cur'); render(); }
      else if (k === 'up') { sel = (sel + ATTR.length - 1) % ATTR.length; sfx('cur'); render(); }
      else if (k === 'a') addAttr(ATTR[sel][0]);
    };
  });
  G.lock--;
  if (nextAction === 'skills' && typeof openSkills === 'function') await openSkills();
  else if (nextAction === 'talent' && typeof openTalentTree === 'function') await openTalentTree();
};
