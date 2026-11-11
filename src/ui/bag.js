'use strict';
// Tas (inventaris) & buku misi
// ---------------- TAS (INVENTARIS) ----------------
const BAG_TABS = [['use', 'Pakai'], ['eq', 'Perlengkapan'], ['mat', 'Bahan'], ['key', 'Penting']];
async function openBag(sc) {
  G.lock++; sfx('ok');
  const w = win('act', ''); w.id = 'bagw'; let tab = 0, sel = 0;
  function list() { const k = BAG_TABS[tab][0]; return Object.keys(S.inv).filter(id => S.inv[id] > 0 && (k === 'eq' ? ['wpn', 'arm', 'acc'].includes(ITEMS[id].k) : ITEMS[id].k === k)); }
  function isEq(id) { return Object.values(S.eq).includes(id); }
  function draw() {
    const L = list(); sel = clamp(sel, 0, Math.max(0, L.length - 1)); const st = stat();
    w.innerHTML = `<div class="bt">${BAG_TABS.map(([k, n], i) => `<span class="tb${i === tab ? ' on' : ''}" data-t="${i}">${n}</span>`).join('')}<span class="gold">${S.gold} G</span></div>
     <div class="bb"><div class="bl">${L.length ? L.map((id, i) => `<div class="bi${i === sel ? ' sel' : ''}" data-i="${i}">${icon(id)}<span>${ITEMS[id].n}</span><b>${isEq(id) ? 'E' : 'x' + S.inv[id]}</b></div>`).join('') : '<div class="empty">Kosong</div>'}</div>
     <div class="bs"><div class="mh">Arka · Lv ${S.lv}</div>${['wpn', 'arm', 'acc'].map(s => `<div class="eqs">${S.eq[s] ? icon(S.eq[s]) + ITEMS[S.eq[s]].n : '<i>(kosong)</i>'}</div>`).join('')}
     <div class="st2">Serang <b>${st.atk}</b> · Tahan <b>${st.def}</b><br>Sihir <b>${st.mag}</b><br>HP <b>${S.hp}/${st.maxhp}</b></div></div></div>
     <div class="bd">${L.length ? ITEMS[L[sel]].d + hint(L[sel]) : '◀ ▶ ganti kategori · A pilih · B tutup'}</div>`;
    w.querySelectorAll('.tb').forEach(e => e.onpointerdown = ev => { ev.stopPropagation(); tab = +e.dataset.t; sel = 0; sfx('cur'); draw(); });
    w.querySelectorAll('.bi').forEach(e => e.onpointerdown = ev => { ev.stopPropagation(); const i = +e.dataset.i; if (i === sel) act(); else { sel = i; sfx('cur'); draw(); } });
    const s2 = w.querySelector('.bi.sel'); if (s2) s2.scrollIntoView({ block: 'nearest' });
  }
  function hint(id) { const k = ITEMS[id].k; return k === 'use' ? ' <span class="y">[A: pakai]</span>' : ['wpn', 'arm', 'acc'].includes(k) ? (isEq(id) ? ' <span class="y">[A: lepas]</span>' : ' <span class="y">[A: pasang]</span>') : ''; }
  function act() {
    const L = list(); if (!L.length) return; const id = L[sel], it = ITEMS[id];
    if (it.k === 'use') { if (!sc.useItem(id)) sfx('buzz'); }
    else if (['wpn', 'arm', 'acc'].includes(it.k)) {
      if (isEq(id)) { if (it.k === 'acc') { S.eq.acc = null; sfx('back'); } else sfx('buzz'); }
      else { S.eq[it.k] = id; sfx('ok'); const st = stat(); S.hp = Math.min(S.hp, st.maxhp); }
      updHud();
    } else sfx('buzz');
    draw();
  }
  draw();
  await new Promise(res => {
    const prev = UIH;
    const h = k => {
      if (k === 'left' || k === 'right') { tab = (tab + (k === 'left' ? 3 : 1)) % 4; sel = 0; sfx('cur'); draw(); }
      else if (k === 'up' || k === 'down') { const n = list().length; if (n) { sel = (sel + (k === 'up' ? n - 1 : 1)) % n; sfx('cur'); draw(); } }
      else if (k === 'a') act();
      else if (['b', 'menu', 'back', 'bag'].includes(k)) { w.remove(); UIH = prev; sfx('back'); res(); }
    };
    UIH = h;
  });
  G.lock--;
}
async function openQuests() {
  const sd = S.side, rows = [];
  rows.push(['UTAMA', S.stage >= 9 ? 'Bab 2 selesai! Terima kasih sudah bermain.' : STAGE_TXT[S.stage] + (S.stage === 2 ? ` (${S.inv.seal || 0}/3)` : ''), S.stage >= 9]);
  rows.push(['Golem Purba (opsional)', 'Kalahkan Golem Purba di Gua Batu', !!S.flags.golem]);
  rows.push(['Mochi hilang', ['Bicara dengan Lina', 'Cari Mochi di barat Hutan Lumina', 'Bawa Mochi pulang ke Lina', S.pet ? 'Selesai · Mochi ikut berpetualang' : 'Selesai'][sd.mochi], sd.mochi === 3]);
  rows.push(['Lendir untuk Pak Darto', ['Bicara dengan Pak Darto', `Kumpulkan Lendir Slime (${Math.min(5, S.inv.jelly || 0)}/5)`, 'Selesai'][sd.darto], sd.darto === 2]);
  if (S.seen.meadow) rows.push(['Taring untuk Pak Joko', ['Bicara dengan Pak Joko di Padang Angin', `Kumpulkan Taring Babi (${Math.min(3, S.inv.tusk || 0)}/3)`, 'Selesai'][sd.joko], sd.joko === 2]);
  const w = win('menu', `<div class="mh">Buku Misi</div>${rows.map(([t, d, done]) => `<div class="qr${done ? ' done' : ''}"><b>${done ? '✓' : '•'} ${t}</b><br>${d}</div>`).join('')}`);
  Object.assign(w.style, { left: '20px', right: '20px', top: '20px' });
  await choose({ items: [{ t: 'Kembali' }], x: 110, bottom: 14 }); w.remove();
}
