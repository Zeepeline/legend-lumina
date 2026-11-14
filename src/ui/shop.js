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
    const unitPrice = Math.max(1, Math.round(it.price * discountMul));
    if (S.gold < unitPrice) { sfx('buzz'); await say('Uangnya kurang.'); continue; }

    let count = 1;
    const isConsumable = it.k === 'use' || it.k === 'mat' || it.crop;
    if (isConsumable) {
      const opts = [1, 5, 10].filter(qty => S.gold >= unitPrice * qty);
      if (opts.length > 1) {
        const qtyChoices = opts.map(qty => ({
          t: `Beli ×${qty}`,
          r: `${unitPrice * qty} G`
        }));
        qtyChoices.push({ t: 'Batal' });
        const qc = await choose({
          head: `Berapa banyak ${it.n}?`,
          x: 56, y: 45, w: 160,
          items: qtyChoices,
          foot: () => `Harga satuan: ${unitPrice} G · Emasmu: ${S.gold} G`
        });
        if (qc < 0 || qc >= opts.length) continue;
        count = opts[qc];
      }
    }

    const totalPrice = unitPrice * count;
    if (S.gold < totalPrice) { sfx('buzz'); await say('Uangnya kurang.'); continue; }
    S.gold -= totalPrice;
    S.spent[loc] = (S.spent[loc] || 0) + totalPrice;
    addItem(id, count); sfx('coin'); updHud();
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
    
    // Fitur #31: Bonus Jual Toko +5% jika memiliki Kantong Tas Kulit (leather_pouch)
    const pouchBonus = has('leather_pouch') ? 1.05 : 1.0;
    // Fitur #38: Tren Harga Pasar Mingguan (Weekly Trends)
    const weekIdx = Math.floor((S.day || 1) / 7) % 3;
    // 0: Ikan +40%, 1: Hasil Alam +50%, 2: Logam/Permata +35%
    const isFish = id => ['fish', 'gfish', 'lake_pearl', 'lake_catfish', 'moon_fish'].includes(id);
    const isNature = id => ['herb', 'berry', 'veg', 'spore', 'honey', 'flower_bouquet'].includes(id);
    const isMineral = id => ['ore', 'iron', 'shard', 'amethyst_gem', 'iron_bar', 'crystal_bar'].includes(id);
    const getTrendMul = id => {
      if (weekIdx === 0 && isFish(id)) return 1.4;
      if (weekIdx === 1 && isNature(id)) return 1.5;
      if (weekIdx === 2 && isMineral(id)) return 1.35;
      return 1.0;
    };
    const getItemSell = id => Math.round((ITEMS[id].sell || 1) * pouchBonus * getTrendMul(id));

    // Fitur #36 / T237: Jual Semua Bahan Sampah Biasa Sekaligus
    const isCommonMat = id => {
      const it = ITEMS[id];
      if (!it || it.k !== 'mat' || !it.sell) return false;
      if (typeof rarity === 'function' && rarity(id) > 0) return false;
      return it.junk || (it.sell <= 12 && !it.quest);
    };
    const junkList = mats.filter(id => isCommonMat(id) && !S.locked?.[id]);
    const junkTotal = junkList.reduce((acc, id) => acc + getItemSell(id) * S.inv[id], 0);
    const junkItemCount = junkList.reduce((acc, id) => acc + S.inv[id], 0);

    const trendNames = ['Pekan Ikan Segar (+40%)', 'Pekan Hasil Alam (+50%)', 'Pekan Logam & Permata (+35%)'];
    const curTrend = trendNames[weekIdx];

    const items = [];
    if (junkList.length > 0) {
      items.push({ t: `⚡ Jual Semua Bahan Biasa (${junkItemCount} buah)`, r: `+${junkTotal} G` });
    }
    items.push(...mats.map(id => {
      const isLocked = S.locked && S.locked[id];
      const isHot = getTrendMul(id) > 1.0;
      return {
        t: (isLocked ? '🔒 ' : (isHot ? '🔥 ' : '')) + icon(id) + ITEMS[id].n + ' x' + S.inv[id],
        r: isLocked ? '(Terkunci)' : (getItemSell(id) + ' G' + (isHot ? ' ↑' : '')),
        dis: isLocked
      };
    }));
    items.push({ t: 'Kembali' });

    const r = await choose({
      head: `Jual bahan · ${S.gold} G · ${curTrend}`,
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
      // Eksekusi Jual Semua Bahan Sampah Biasa
      if (await ask(`Jual semua bahan biasa (${junkItemCount} buah) seharga ${junkTotal} G?`)) {
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
        await say(`Berhasil menjual semua bahan biasa! Kamu mendapatkan ${junkTotal} G.`);
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
    const earned = getItemSell(id);
    S.gold += earned;
    S.st = S.st || {};
    S.st.goldEarned = (S.st.goldEarned || 0) + earned;
    S.buyback = S.buyback || [];
    S.buyback.unshift({ id, n: 1, price: earned });
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
      foot: i => {
        if (i >= RECIPES.length) return '';
        const R = RECIPES[i];
        const ing = Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · ');
        return ITEMS[R.id].d + '<br>Bahan: ' + ing;
      }
    });
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
      foot: i => {
        if (i >= COOK.length) return '';
        const R = COOK[i];
        const ing = Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · ');
        return ITEMS[R.id].d + '<br>Bahan: ' + ing;
      }
    });
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
    
    // Mini-game Seni Memasak Kualitas Bintang Tiga (#50)
    let starQuality = false;
    const mini = await choose({
      head: '🍳 Kualitas Masakan · Sentuhan Chef',
      x: 35, y: 40, w: 230,
      items: [
        { t: '⭐ Timing Tepat! (Bakar Sempurna)' },
        { t: 'Masak Santai Biasa' }
      ],
      foot: () => 'Kualitas Bintang ⭐⭐⭐ memperpanjang durasi buff dan pemulihan!'
    });
    if (mini === 0) {
      starQuality = true;
      sfx('crit');
      await sleep(200);
    }

    addItem(R.id, cookCount); sfx('fire'); await sleep(300); sfx('chest');
    S.st = S.st || {}; S.st.cooked = (S.st.cooked || 0) + cookCount;
    updHud();
    if (starQuality) {
      // Masakan Bintang 3: beri buff instan atau bonus tambahan
      if (ITEMS[R.id].buff) {
        for (const [bKey, sec] of ITEMS[R.id].buff) {
          S.buff = S.buff || {};
          S.buff[bKey] = Math.max(S.buff[bKey] || 0, Math.floor(sec * 1.5));
        }
      }
      await say(`LUAR BIASA! Masakan matang dengan KUALITAS BINTANG TIGA [⭐⭐⭐]! Aroma rempah meresap sempurna dan stamina terpompa lebih lama!`, chef);
    } else {
      await say(`Harum sekali! ${ITEMS[R.id].n} (x${cookCount}) siap disajikan. Makan dari TAS saat dibutuhkan.`, chef);
    }
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

