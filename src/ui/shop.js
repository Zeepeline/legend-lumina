'use strict';
// Menu beli, jual, tempa
// ---------------- TOKO / TEMPA / JUAL ----------------
const icon = id => `<img class="ic" src="${ICONS[id]}">`;
const ownedEq = id => has(id) ? ' ✓' : '';
async function buyMenu(title, list) {
  let sel = 0;
  // Diskon loyalitas belanja (#44)
  S.spent = S.spent || { village: 0, city: 0 };
  const loc = title.includes('Kota') ? 'city' : 'village';
  const spentVal = S.spent[loc] || 0;
  let loyaltyDisc = 0;
  let loyaltyStars = '';
  if (spentVal >= 600) { loyaltyDisc = 0.15; loyaltyStars = ' ⭐⭐⭐'; }
  else if (spentVal >= 350) { loyaltyDisc = 0.10; loyaltyStars = ' ⭐⭐'; }
  else if (spentVal >= 150) { loyaltyDisc = 0.05; loyaltyStars = ' ⭐'; }

  // Diskon keakraban bila pedagang berteman akrab
  const relDisc = (title.includes('Sari') && (S.rel?.merchant >= 3)) ? 0.2 : 0;
  const totalDisc = Math.min(0.35, loyaltyDisc + relDisc);
  const discountMul = 1 - totalDisc;

  for (; ;) {
    const hasBuyback = S.buyback && S.buyback.length > 0;
    const discLabel = totalDisc > 0 ? ` (Diskon ${Math.round(totalDisc * 100)}%${loyaltyStars})` : '';
    const r = await choose({ head: title + ' · ' + S.gold + ' G' + discLabel, x: 46, y: 30, w: 196, start: sel,
      items: [
        ...(hasBuyback ? [{ t: `↺ Beli Kembali (${S.buyback.length})`, r: 'riwayat' }] : []),
        ...list.map(id => {
          const it = ITEMS[id], eq = it.k !== 'use' && it.k !== 'mat';
          const finalPrice = Math.max(1, Math.round(it.price * discountMul));
          return { t: icon(id) + it.n + (eq ? ownedEq(id) : ` (${S.inv[id] || 0})`), r: finalPrice + ' G', dis: eq && has(id) };
        }),
        { t: 'Kembali' }
      ],
      foot: i => {
        if (hasBuyback && i === 0) return 'Beli kembali barang yang baru saja kamu jual dengan harga yang sama.';
        const actualIdx = hasBuyback ? i - 1 : i;
        return actualIdx < list.length ? ITEMS[list[actualIdx]].d : 'Uangmu: ' + S.gold + ' G';
      }
    });
    if (r < 0 || r === (hasBuyback ? list.length + 1 : list.length)) return;
    sel = r;

    // Fitur #462: Beli Kembali Barang Toko
    if (hasBuyback && r === 0) {
      await buybackMenu();
      continue;
    }

    const actualIdx = hasBuyback ? r - 1 : r;
    const id = list[actualIdx], it = ITEMS[id];
    const finalPrice = Math.max(1, Math.round(it.price * discountMul));
    if (S.gold < finalPrice) { sfx('buzz'); await say('Uangnya kurang.'); continue; }
    S.gold -= finalPrice;
    S.spent[loc] = (S.spent[loc] || 0) + finalPrice;
    addItem(id); sfx('coin'); updHud();
    if (['wpn', 'arm', 'acc'].includes(it.k)) { const sl = it.k; if (await ask(`${it.n} dibeli! Langsung pasang?`)) { S.eq[sl] = id; sfx('ok'); updHud(); } }
  }
}

async function buybackMenu() {
  for (;;) {
    if (!S.buyback || !S.buyback.length) {
      await say('Tidak ada barang dalam daftar beli kembali.');
      return;
    }
    const items = S.buyback.map(b => ({
      t: icon(b.id) + ITEMS[b.id].n + ' x' + b.n,
      r: (b.price * b.n) + ' G'
    }));
    items.push({ t: 'Kembali' });

    const r = await choose({
      head: 'Beli Kembali · ' + S.gold + ' G',
      x: 40, y: 30, w: 210,
      items,
      foot: i => i < S.buyback.length ? ITEMS[S.buyback[i].id].d : 'Beli kembali barang yang sebelumnya terjual.'
    });

    if (r < 0 || r === S.buyback.length) return;
    const b = S.buyback[r];
    const cost = b.price * b.n;
    if (S.gold < cost) {
      sfx('buzz');
      await say('Uangmu tidak cukup untuk membeli kembali barang ini.');
      continue;
    }
    S.gold -= cost;
    addItem(b.id, b.n);
    S.buyback.splice(r, 1);
    sfx('coin');
    updHud();
    await say(`Berhasil membeli kembali ${ITEMS[b.id].n} x${b.n}!`);
  }
}
async function sellMenu() {
  let sel = 0;
  for (; ;) {
    const mats = Object.keys(S.inv).filter(id => ITEMS[id].sell && S.inv[id] > 0);
    if (!mats.length) { await say('Kamu tidak punya barang untuk dijual. Kalahkan monster, memancing, atau berkebun dulu.'); return; }
    
    // Fitur #36: Jual Cepat Barang Sampah (monster drops biasa yang tidak dikunci)
    const junkList = mats.filter(id => ITEMS[id].junk && !S.locked?.[id]);
    const junkTotal = junkList.reduce((acc, id) => acc + ITEMS[id].sell * S.inv[id], 0);

    const items = [];
    if (junkList.length > 0) {
      items.push({ t: `⚡ Jual Semua Sampah (${junkList.length} jenis)`, r: `+${junkTotal} G` });
    }
    items.push(...mats.map(id => {
      const isLocked = S.locked && S.locked[id];
      return {
        t: (isLocked ? '🔒 ' : '') + icon(id) + ITEMS[id].n + ' x' + S.inv[id],
        r: isLocked ? '(Terkunci)' : ITEMS[id].sell + ' G',
        dis: isLocked
      };
    }));
    items.push({ t: 'Kembali' });

    const r = await choose({
      head: 'Jual bahan · ' + S.gold + ' G',
      x: 46, y: 26, w: 210,
      start: Math.min(sel, items.length - 1),
      items,
      foot: i => {
        if (junkList.length > 0 && i === 0) return 'Jual cepat semua drop monster biasa yang tidak terkunci.';
        const actualIdx = junkList.length > 0 ? i - 1 : i;
        if (actualIdx >= 0 && actualIdx < mats.length) {
          const id = mats[actualIdx];
          return ITEMS[id].d + (S.locked?.[id] ? ' <span style="color:#ff8a8a">(Terkunci di Tas)</span>' : '');
        }
        return '';
      }
    });

    if (r < 0 || r === items.length - 1) return;
    sel = r;

    if (junkList.length > 0 && r === 0) {
      // Eksekusi Jual Semua Sampah
      if (await ask(`Jual semua sampah (${junkList.length} jenis) seharga ${junkTotal} G?`)) {
        S.buyback = S.buyback || [];
        for (const id of junkList) {
          S.buyback.unshift({ id, n: S.inv[id], price: ITEMS[id].sell });
          delete S.inv[id];
        }
        if (S.buyback.length > 8) S.buyback = S.buyback.slice(0, 8);
        S.gold += junkTotal;
        S.st = S.st || {};
        S.st.goldEarned = (S.st.goldEarned || 0) + junkTotal;
        sfx('coin');
        updHud();
        await say(`Berhasil menjual semua barang sampah! Kamu mendapatkan ${junkTotal} G.`);
      }
      continue;
    }

    const actualIdx = junkList.length > 0 ? r - 1 : r;
    const id = mats[actualIdx];
    if (S.locked && S.locked[id]) {
      sfx('buzz');
      await say('Barang ini sedang dikunci di tas. Buka kuncinya di TAS terlebih dahulu bila ingin menjual.');
      continue;
    }

    addItem(id, -1);
    S.gold += ITEMS[id].sell;
    S.st = S.st || {};
    S.st.goldEarned = (S.st.goldEarned || 0) + ITEMS[id].sell;
    S.buyback = S.buyback || [];
    S.buyback.unshift({ id, n: 1, price: ITEMS[id].sell });
    if (S.buyback.length > 8) S.buyback.pop();
    sfx('coin');
    updHud();
  }
}
async function forgeMenu() {
  let sel = 0;
  const can = R => S.gold >= R.gold && Object.entries(R.need).every(([k, n]) => has(k, n));
  for (; ;) {
    const r = await choose({ head: 'Tempa · ' + S.gold + ' G', x: 30, y: 22, w: 228, start: sel,
      items: [...RECIPES.map(R => ({ t: icon(R.id) + ITEMS[R.id].n + ownedEq(R.id), r: R.gold + ' G', dis: has(R.id) })), { t: 'Kembali' }],
      foot: i => { if (i >= RECIPES.length) return ''; const R = RECIPES[i]; return ITEMS[R.id].d + '<br>Bahan: ' + Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · '); } });
    if (r < 0 || r === RECIPES.length) return; sel = r; const R = RECIPES[r];
    if (!can(R)) { sfx('buzz'); await say('Bahan atau uangnya belum cukup.', 'Pak Besi'); continue; }
    S.gold -= R.gold; for (const [k, n] of Object.entries(R.need)) addItem(k, -n); addItem(R.id);
    sfx('boom'); await sleep(250); sfx('chest'); G.scene.cameras.main.flash(200, 255, 200, 120); updHud();
    const it = ITEMS[R.id], sl = it.k;
    if (await ask(`TANG! TANG! ${it.n} selesai ditempa! Langsung pasang?`, 'Pak Besi')) { S.eq[sl] = R.id; sfx('ok'); updHud(); }
  }
}
// ---------------- MASAK (penginapan & perkemahan) ----------------
async function cookMenu(title = 'Dapur Bu Rina', chef = 'Bu Rina') {
  let sel = 0; const can = R => Object.entries(R.need).every(([k, n]) => has(k, n));
  for (; ;) {
    const r = await choose({ head: title, x: 24, y: 22, w: 240, start: sel,
      items: [...COOK.map(R => ({ t: icon(R.id) + ITEMS[R.id].n, r: 'x' + (S.inv[R.id] || 0) })), { t: 'Kembali' }],
      foot: i => { if (i >= COOK.length) return ''; const R = COOK[i]; return ITEMS[R.id].d + '<br>Bahan: ' + Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · '); } });
    if (r < 0 || r === COOK.length) return; sel = r; const R = COOK[r];
    if (!can(R)) { sfx('buzz'); await say('Bahannya belum cukup. Ikan dari memancing, sayur dari kebun/alam liar.', chef); continue; }

    // Fitur #388: Buat Banyak Sekaligus (Batch Cooking)
    const maxBatch = Math.min(...Object.entries(R.need).map(([k, n]) => Math.floor((S.inv[k] || 0) / n)));
    let cookCount = 1;
    if (maxBatch > 1) {
      const opts = [{ t: 'Masak 1 piring', n: 1 }];
      if (maxBatch >= 5) opts.push({ t: 'Masak 5 piring', n: 5 });
      opts.push({ t: 'Masak Maksimal ' + maxBatch + ' piring', n: maxBatch });
      opts.push({ t: 'Batal', n: 0 });
      const cRes = await choose({ head: 'Porsi Masakan · ' + ITEMS[R.id].n, x: 40, y: 50, w: 220, items: opts });
      if (cRes < 0 || opts[cRes].n === 0) continue;
      cookCount = opts[cRes].n;
    }

    for (const [k, n] of Object.entries(R.need)) addItem(k, -(n * cookCount));
    addItem(R.id, cookCount); sfx('fire'); await sleep(300); sfx('chest');
    S.st = S.st || {}; S.st.cooked = (S.st.cooked || 0) + cookCount;
    updHud();
    await say(`Harum sekali! ${ITEMS[R.id].n} (x${cookCount}) siap disajikan. Makan dari TAS saat dibutuhkan.`, chef);
  }
}
// ---------------- UPGRADE (bengkel) ----------------
function upgCost(id) { const u = (S.up[id] || 0) + 1; return { gold: 60 * u * u + 40, need: u >= 4 ? { ore: u, shard: u - 2 } : { ore: u } }; }
async function upgradeMenu() {
  let sel = 0;
  for (; ;) {
    const L = Object.keys(S.inv).filter(id => ITEMS[id] && (ITEMS[id].k === 'wpn' || ITEMS[id].k === 'arm'));
    const r = await choose({
      head: 'Bengkel Pak Besi · ' + S.gold + ' G',
      x: 24, y: 22, w: 240, start: sel,
      items: [
        { t: '⚡ Pasang Permata Senjata' },
        ...L.map(id => {
          const it = ITEMS[id], u = (S.up[id] || 0), cost = upgCost(id);
          return { t: icon(id) + it.n + (u ? ' +' + u : ''), r: u >= UPG.max ? 'MAKS' : cost.gold + ' G', dis: u >= UPG.max };
        }),
        { t: 'Kembali' }
      ],
      foot: i => {
        if (i === 0) return 'Sisipkan permata berkekuatan khusus ke senjatamu (Kecubung, Kristal, Bijih, Spora).';
        const actualIdx = i - 1;
        if (actualIdx < L.length) {
          const id = L[actualIdx], cost = upgCost(id);
          const needs = Object.entries(cost.need).map(([k, n]) => `${icon(k)}${ITEMS[k]?.n || k} ${S.inv[k] || 0}/${n}`).join(' · ');
          return ITEMS[id].d + '<br>Biaya: <b>' + cost.gold + ' G</b> · Bahan: ' + needs;
        }
        return '';
      }
    });

    if (r < 0 || r === L.length + 1) return;
    sel = r;

    // Fitur #23: Soket Permata Senjata
    if (r === 0) {
      await socketMenu();
      continue;
    }

    const actualIdx = r - 1;
    const id = L[actualIdx], u = (S.up[id] || 0);
    if (u >= UPG.max) { sfx('buzz'); continue; }
    const cost = upgCost(id);
    const canGold = S.gold >= cost.gold;
    const canMats = Object.entries(cost.need).every(([k, n]) => has(k, n));
    if (!canGold || !canMats) {
      sfx('buzz');
      await say('Bahan atau koin belum mencukupi untuk meningkatkan perlengkapan ini.', 'Pak Besi');
      continue;
    }

    S.gold -= cost.gold;
    for (const [k, n] of Object.entries(cost.need)) addItem(k, -n);
    S.up[id] = u + 1;
    sfx('boom');
    await sleep(250);
    sfx('chest');
    updHud();
    await say(`TANG! TANG! ${ITEMS[id].n} berhasil ditingkatkan menjadi +${S.up[id]}!`, 'Pak Besi');
  }
}

// Menu Pasang Permata (#23)
async function socketMenu() {
  const wpns = Object.keys(S.inv).filter(id => ITEMS[id] && ITEMS[id].k === 'wpn');
  if (!wpns.length) {
    await say('Kamu tidak membawa senjata di dalam tas.', 'Pak Besi');
    return;
  }
  const r = await choose({
    head: 'Pilih Senjata untuk Soket',
    x: 30, y: 30, w: 220,
    items: [...wpns.map(id => {
      const g = S.socket && S.socket[id];
      return { t: icon(id) + itemName(id), r: g ? ITEMS[g]?.n : '(kosong)' };
    }), { t: 'Kembali' }]
  });
  if (r < 0 || r >= wpns.length) return;
  const wpnId = wpns[r];

  // Daftar permata yang didukung
  const GEMS = [
    { id: 'amethyst_gem', n: 'Kecubung Ungu', eff: 'Vampir: Serangan kritis memulihkan 3 HP' },
    { id: 'shard', n: 'Pecahan Kristal', eff: 'Hawa Beku: 25% peluang tebasan membekukan musuh' },
    { id: 'ore', n: 'Bijih Padat', eff: 'Hantaman Kokoh: Serang +3 & dorongan kuat' },
    { id: 'spore', n: 'Spora Alami', eff: 'Racun Alami: Tebasan memberi efek racun pada musuh' }
  ];

  const gItems = GEMS.map(g => ({
    t: icon(g.id) + g.n,
    r: has(g.id) ? `Punya x${S.inv[g.id]}` : 'Tidak Ada',
    dis: !has(g.id)
  }));
  if (S.socket && S.socket[wpnId]) {
    gItems.push({ t: 'Lepas Permata Saat Ini' });
  }
  gItems.push({ t: 'Batal' });

  const gr = await choose({
    head: `Soket · ${ITEMS[wpnId].n}`,
    x: 20, y: 30, w: 250,
    items: gItems,
    foot: i => i < GEMS.length ? GEMS[i].eff : 'Biaya pemasangan: Gratis bahan terpasang.'
  });

  if (gr < 0 || gr === gItems.length - 1) return;
  if (S.socket && S.socket[wpnId] && gr === gItems.length - 2) {
    const oldGem = S.socket[wpnId];
    addItem(oldGem, 1);
    delete S.socket[wpnId];
    sfx('ok');
    updHud();
    await say(`Permata ${ITEMS[oldGem]?.n || ''} berhasil dilepas dan kembali ke tas.`, 'Pak Besi');
    return;
  }

  const gem = GEMS[gr];
  if (!has(gem.id)) {
    sfx('buzz');
    await say(`Kamu tidak memiliki ${gem.n}.`, 'Pak Besi');
    return;
  }

  if (S.socket && S.socket[wpnId]) {
    addItem(S.socket[wpnId], 1); // kembalikan permata lama
  }
  addItem(gem.id, -1);
  S.socket = S.socket || {};
  S.socket[wpnId] = gem.id;
  sfx('boom');
  await sleep(250);
  sfx('chest');
  updHud();
  await say(`KLIK! Permata ${gem.n} berhasil dipasang ke ${ITEMS[wpnId].n}! Efek: ${gem.eff}`, 'Pak Besi');
}
