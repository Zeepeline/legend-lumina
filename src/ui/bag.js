'use strict';
// Tas (inventaris) & buku misi
// ---------------- TAS (INVENTARIS) ----------------
const BAG_TABS = [['use', 'Pakai'], ['eq', 'Perlengkapan'], ['mat', 'Bahan'], ['key', 'Penting']];
let BAG_SORT = 0;
async function openBag(sc) {
  G.lock++; sfx('ok');
  const w = win('act', ''); w.id = 'bagw'; let tab = 0, sel = 0;
  function list() { const k = BAG_TABS[tab][0], L = Object.keys(S.inv).filter(id => S.inv[id] > 0 && (k === 'eq' ? ['wpn', 'arm', 'acc'].includes(ITEMS[id].k) : ITEMS[id].k === k)); const val = id => ITEMS[id].price || (ITEMS[id].sell || 0) * 2, got = id => (S.got && S.got[id]) || 0; return BAG_SORT === 1 ? L.sort((a, b) => val(b) - val(a)) : BAG_SORT === 2 ? L.sort((a, b) => got(b) - got(a)) : BAG_SORT === 3 ? L.sort((a, b) => ITEMS[a].n.localeCompare(ITEMS[b].n)) : L; }
  function isEq(id) { return Object.values(S.eq).includes(id); }
  function draw() {
    const L = list(); sel = clamp(sel, 0, Math.max(0, L.length - 1)); const st = stat();
    const activeS = typeof activeSets === 'function' ? activeSets() : [];
    const setsBadge = activeS.length ? `<div style="font-size:9px;color:#ffe066;margin-top:2px;">★ ${activeS.map(s => s.n).join(', ')}</div>` : '';
    const loadoutBtns = [0, 1, 2].map(i => {
      const lo = S.loadouts && S.loadouts[i];
      return `<span class="lo-btn${lo ? ' has' : ''}" data-lo="${i}" style="display:inline-block;padding:1px 5px;margin:0 2px;background:${lo ? '#4a7a3a' : '#3a3a48'};color:#fff;border-radius:3px;font-size:9px;cursor:pointer;">${i + 1}${lo ? '✓' : ''}</span>`;
    }).join('');

    const srcText = L.length && ITEMS[L[sel]].src ? `<br><span style="color:#8ae8ff;font-size:9px;">📍 Sumber: ${ITEMS[L[sel]].src}</span>` : '';
    const altWpnText = S.eq.altWpn ? `<br>Cadangan: <b>${ITEMS[S.eq.altWpn]?.n || '-'}</b> [Q]` : '';
    w.innerHTML = `<div class="bt">${BAG_TABS.map(([k, n], i) => `<span class="tb${i === tab ? ' on' : ''}" data-t="${i}">${n}</span>`).join('')}<span class="srt">urut: ${['jenis', 'nilai', 'baru', 'nama'][BAG_SORT]}</span><span class="gold">${S.gold} G</span></div>
     <div class="bb"><div class="bl">${L.length ? L.map((id, i) => {
       const isLck = S.locked && S.locked[id];
       const isNew = S.newItems && S.newItems[id];
       const gemId = S.socket && S.socket[id];
       const gemBadge = gemId ? ` [💎]` : '';
       const altBadge = S.eq.altWpn === id ? ` <span style="color:#8ae8ff;font-size:8px;">[Cadangan]</span>` : '';
       return `<div class="bi${i === sel ? ' sel' : ''}" data-i="${i}">${icon(id)}<span class="r${typeof rarity === 'function' ? rarity(id) : 0}">${itemName(id)}${gemBadge}${altBadge}</span>${isNew ? '<small style="color:#ff8a3a;font-size:8px;font-weight:bold;margin-left:2px;">BARU</small>' : ''}<b>${isLck ? '🔒 ' : ''}${isEq(id) ? 'E' : 'x' + S.inv[id]}</b></div>`;
     }).join('') : '<div class="empty">Kosong</div>'}</div>
     <div class="bs"><div class="mh">Arka · Lv ${S.lv} (${S.title || 'Petualang'})</div>${['wpn', 'arm', 'acc'].map(s => {
       const eqId = S.eq[s];
       const eqGem = eqId && S.socket && S.socket[eqId] ? ` [💎 ${ITEMS[S.socket[eqId]]?.n || ''}]` : '';
       return `<div class="eqs">${eqId ? icon(eqId) + itemName(eqId) + eqGem : '<i>(kosong)</i>'}</div>`;
     }).join('')}
     <div style="margin:4px 0 2px;font-size:9px;color:#a8a8b8;">Preset: ${loadoutBtns}</div>
     ${setsBadge}
     <div class="st2">Serang <b>${st.atk}</b> · Tahan <b>${st.def}</b><br>Sihir <b>${st.mag}</b> · Lari <b>${st.spd}</b><br>HP <b>${S.hp}/${st.maxhp}</b>${altWpnText}</div></div></div>
     <div class="bd">${L.length ? ITEMS[L[sel]].d + cmp(L[sel]) + hint(L[sel]) + srcText : '◀ ▶ ganti kategori · A pilih · DASH kunci/buka · 1/2/3 Preset · [C] Pakai Terbaik · B tutup'}</div>`;
    const so = w.querySelector('.srt'); if (so) so.onpointerdown = ev => { ev.stopPropagation(); BAG_SORT = (BAG_SORT + 1) % 4; sfx('cur'); draw(); };
    w.querySelectorAll('.tb').forEach(e => e.onpointerdown = ev => { ev.stopPropagation(); tab = +e.dataset.t; sel = 0; sfx('cur'); draw(); });
    w.querySelectorAll('.bi').forEach(e => e.onpointerdown = ev => {
      ev.stopPropagation();
      const i = +e.dataset.i;
      if (L[i] && S.newItems && S.newItems[L[i]]) {
        delete S.newItems[L[i]];
      }
      if (i === sel) act();
      else { sel = i; sfx('cur'); draw(); }
    });
    w.querySelectorAll('.lo-btn').forEach(e => e.onpointerdown = async ev => { ev.stopPropagation(); await handleLoadout(+e.dataset.lo); });
    const s2 = w.querySelector('.bi.sel'); if (s2) s2.scrollIntoView({ block: 'nearest' });
  }
  // Perbandingan dengan yang sedang dipakai (fitur #34): ▲ hijau lebih baik, ▼ merah lebih buruk
  function cmp(id) {
    const it = ITEMS[id], slot = it.k; if (!['wpn', 'arm', 'acc'].includes(slot) || isEq(id)) return '';
    const cur = ITEMS[S.eq[slot]] || {}, up = id => (S.up && S.up[id]) || 0;
    const v = (o, i, k) => (o[k] || 0) + (k === 'atk' && slot === 'wpn' ? UPG.wpn * up(i) : 0) + (k === 'def' && slot === 'arm' ? UPG.arm * up(i) : 0);
    return ' ' + ['atk', 'def', 'mag'].map(k => { const d = v(it, id, k) - v(cur, S.eq[slot], k); return d ? `<span style="color:${d > 0 ? '#3a9a3a' : '#c83a3a'}">${{ atk: 'Serang', def: 'Tahan', mag: 'Sihir' }[k]} ${d > 0 ? '▲+' : '▼'}${d}</span>` : ''; }).filter(Boolean).join(' ');
  }
  function hint(id) { const k = ITEMS[id].k; return k === 'use' ? ' <span class="y">[A: pakai]</span>' : ['wpn', 'arm', 'acc'].includes(k) ? (isEq(id) ? ' <span class="y">[A: lepas]</span>' : ' <span class="y">[A: pasang]</span>') : ''; }
  async function handleLoadout(slotIdx) {
    S.loadouts = S.loadouts || [null, null, null];
    const current = S.loadouts[slotIdx];
    if (!current) {
      // Simpan perlengkapan saat ini
      S.loadouts[slotIdx] = { wpn: S.eq.wpn, arm: S.eq.arm, acc: S.eq.acc };
      sfx('ok');
      if (typeof toastItem === 'function') toastItem(null, `Preset ${slotIdx + 1} disimpan!`);
    } else {
      // Pasang atau perbarui
      const r = await choose({
        head: `PRESET ${slotIdx + 1}`,
        x: 40, y: 50, w: 200,
        items: [
          { t: 'Gunakan Perlengkapan Ini' },
          { t: 'Perbarui dengan yang Dipakai' },
          { t: 'Kosongkan Slot Preset' },
          { t: 'Batal' }
        ],
        foot: () => `Senjata: ${ITEMS[current.wpn]?.n || '-'} · Zirah: ${ITEMS[current.arm]?.n || '-'} · Aks: ${ITEMS[current.acc]?.n || '-'}`
      });
      if (r === 0) {
        // Pasang jika punya barangnya
        for (const k of ['wpn', 'arm', 'acc']) {
          const id = current[k];
          if (id && has(id)) S.eq[k] = id;
          else if (!id) S.eq[k] = null;
        }
        sfx('ok');
        updHud();
        if (typeof toastItem === 'function') toastItem(null, `Preset ${slotIdx + 1} terpasang!`);
      } else if (r === 1) {
        S.loadouts[slotIdx] = { wpn: S.eq.wpn, arm: S.eq.arm, acc: S.eq.acc };
        sfx('ok');
        if (typeof toastItem === 'function') toastItem(null, `Preset ${slotIdx + 1} diperbarui!`);
      } else if (r === 2) {
        S.loadouts[slotIdx] = null;
        sfx('back');
      }
    }
    draw();
  }
  function toggleLock(id) {
    S.locked = S.locked || {};
    if (S.locked[id]) {
      delete S.locked[id];
      sfx('back');
      if (typeof toastItem === 'function') toastItem(null, `Kunci dibuka: ${ITEMS[id].n}`);
    } else {
      S.locked[id] = true;
      sfx('ok');
      if (typeof toastItem === 'function') toastItem(null, `🔒 Dikunci: ${ITEMS[id].n} (kebal dari jual)`);
    }
    draw();
  }
  function autoEquipBest() {
    const inv = S.inv || {};
    const wpns = Object.keys(inv).filter(id => ITEMS[id] && ITEMS[id].k === 'wpn');
    const arms = Object.keys(inv).filter(id => ITEMS[id] && ITEMS[id].k === 'arm');
    const accs = Object.keys(inv).filter(id => ITEMS[id] && ITEMS[id].k === 'acc');

    const score = id => {
      const it = ITEMS[id] || {};
      const u = (S.up && S.up[id]) || 0;
      return (it.atk || 0) * 2 + u * UPG.wpn * 2 + (it.def || 0) * 2 + u * UPG.arm * 2 + (it.mag || 0) * 1.5 + ((it.spd || 0) * 40);
    };

    let bestWpn = S.eq.wpn;
    for (const w of wpns) if (score(w) > score(bestWpn)) bestWpn = w;

    let bestArm = S.eq.arm;
    for (const a of arms) if (score(a) > score(bestArm)) bestArm = a;

    let bestAcc = S.eq.acc;
    for (const ac of accs) if (!bestAcc || score(ac) > score(bestAcc)) bestAcc = ac;

    S.eq.wpn = bestWpn;
    S.eq.arm = bestArm;
    S.eq.acc = bestAcc;
    sfx('chest');
    updHud();
    if (typeof toastItem === 'function') toastItem(null, `⚡ Perlengkapan terbaik dipasang!`);
    draw();
  }
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
      else if (k === 'swap') {
        const L = list();
        if (L.length && L[sel] && ITEMS[L[sel]]?.k === 'wpn') {
          const wpnId = L[sel];
          if (S.eq.altWpn === wpnId) {
            S.eq.altWpn = null;
            sfx('back');
            if (typeof toastItem === 'function') toastItem(null, `Batal jadikan senjata cadangan`);
          } else {
            S.eq.altWpn = wpnId;
            sfx('ok');
            if (typeof toastItem === 'function') toastItem(null, `Cadangan: ${ITEMS[wpnId].n} (Tekan Q untuk tukar)`);
          }
          draw();
        }
      }
      else if (k === 'nova') {
        // Tombol C / Nova / Klik shortcut untuk Pasang Terbaik (#373)
        autoEquipBest();
      }
      else if (k === 'dash') {
        // Tekan DASH untuk mengunci / membuka kunci item (Fitur #374)
        const L = list();
        if (L.length && L[sel]) toggleLock(L[sel]);
      }
      else if (k === 'item') { BAG_SORT = (BAG_SORT + 1) % 4; sfx('cur'); draw(); }
      else if (['b', 'menu', 'back', 'bag'].includes(k)) { w.remove(); UIH = prev; sfx('back'); res(); }
    };
    UIH = h;
  });
  G.lock--;
}
// Jurnal: 3 lapis tujuan (sekarang, penyelidikan, misteri besar) + catatan lore
async function openQuests() {
  const sd = S.side, side = [];
  side.push(['Golem Purba (opsional)', 'Kalahkan Golem Purba di Gua Batu', !!S.flags.golem]);
  side.push(['Mochi hilang', ['Bicara dengan Lina', 'Cari Mochi di barat Hutan Lumina', 'Bawa Mochi pulang ke Lina', S.pet ? 'Selesai · Mochi ikut berpetualang' : 'Selesai'][sd.mochi], sd.mochi === 3]);
  side.push(['Lendir untuk Pak Darto', ['Bicara dengan Pak Darto', `Kumpulkan Lendir Slime (${Math.min(5, S.inv.jelly || 0)}/5)`, 'Selesai'][sd.darto], sd.darto === 2]);
  if (S.seen.meadow) side.push(['Taring untuk Pak Joko', ['Bicara dengan Pak Joko di Padang Angin', `Kumpulkan Taring Babi (${Math.min(3, S.inv.tusk || 0)}/3)`, 'Selesai'][sd.joko], sd.joko === 2]);
  if (sd.patok) side.push(['Batas Ladang Desa Kincir', ['', 'Cari patok batu kuno di ladang selatan Desa Kincir', 'Tunjukkan patok itu kepada Darma', 'Selesai'][sd.patok], sd.patok === 3]);
  const now = STAGE_TXT[S.stage] ? STAGE_TXT[S.stage] + (S.stage === 2 ? ` (${S.inv.seal || 0}/3)` : '') + (S.stage === 15 ? ` (${['m_darto', 'm_sari', 'm_dodi'].filter(k => S.flags[k]).length}/3)` : '') : 'Belum ada tugas utama. Jelajahi dunia, misteri masih menunggu.';
  const myst = MYSTERY.filter(m => m.open()), lore = Object.keys(LORE).filter(k => S.lore[k]);
  const tabs = ['Tujuan', 'Misteri', 'Catatan'];
  let tab = 0, sel = 0;
  const w = win('menu jrn'); Object.assign(w.style, { left: '12px', right: '12px', top: '14px', bottom: '14px' });
  const sec = (h, t) => `<div class="jh">${h}</div><div class="jt">${t}</div>`;
  function draw() {
    let body = '';
    if (tab === 0) body = sec('SEKARANG', now) + sec('PENYELIDIKAN', midGoal()) + sec('MISTERI BESAR', myst.length ? myst.filter(m => !m.ans()).map(m => '❓ ' + m.q).join('<br>') || 'Semua pertanyaan sementara terjawab...' : '<i>Belum ada. Dunia ini menyimpan lebih banyak dari yang terlihat.</i>')
      + `<div class="jh">MISI SAMPINGAN</div>` + side.map(([t, d, done]) => `<div class="qr${done ? ' done' : ''}"><b>${done ? '✓' : '•'} ${t}</b><br>${d}</div>`).join('');
    else if (tab === 1) body = myst.length ? myst.map(m => { const a = m.ans(); return `<div class="qr${a ? ' done' : ''}"><b>${a ? '💡' : '❓'} ${m.q}</b>${a ? '<br>' + a : m.hint ? '<br>' + m.hint() : ''}</div>`; }).join('') : '<i>Belum ada misteri yang tercatat.</i>';
    else body = lore.length ? lore.map((k, i) => `<div class="qr jl${i === sel ? ' sel' : ''}" data-i="${i}"><b>${LORE[k][1]}</b> <small>· ${LORE[k][0]}</small>${i === sel ? '<br>' + LORE[k][2] : ''}</div>`).join('') : '<i>Belum ada catatan. Baca prasasti, dengarkan penduduk, perhatikan sekitar.</i>';
    w.innerHTML = `<div class="bt">${tabs.map((n, i) => `<span class="tb${i === tab ? ' on' : ''}" data-t="${i}">${n}</span>`).join('')}<span class="gold">B: tutup</span></div><div class="jb">${body}</div>`;
    w.querySelectorAll('.tb').forEach(e => e.onpointerdown = ev => { ev.stopPropagation(); tab = +e.dataset.t; sel = 0; sfx('cur'); draw(); });
    w.querySelectorAll('.jl').forEach(e => e.onpointerdown = ev => { ev.stopPropagation(); sel = +e.dataset.i; sfx('cur'); draw(); });
    const s = w.querySelector('.jl.sel'); if (s) s.scrollIntoView({ block: 'nearest' });
  }
  G.lock++; draw();
  await new Promise(res => {
    const prev = UIH;
    UIH = k => {
      if (k === 'left' || k === 'right') { tab = (tab + (k === 'left' ? 2 : 1)) % 3; sel = 0; sfx('cur'); draw(); }
      else if ((k === 'up' || k === 'down') && tab === 2 && lore.length) { sel = (sel + (k === 'up' ? lore.length - 1 : 1)) % lore.length; sfx('cur'); draw(); }
      else if ((k === 'up' || k === 'down') && tab !== 2) w.querySelector('.jb').scrollTop += k === 'up' ? -40 : 40;
      else if (k === 'b' || k === 'menu' || k === 'back' || k === 'a') { sfx('back'); UIH = prev; res(); }
    };
    w.addEventListener('pointerdown', ev => { if (ev.target === w) { UIH = prev; res(); } });
  });
  w.remove(); G.lock--;
}
