'use strict';
// Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (2) — isi: lihat docs/CODEMAP.md
const MAIL_LIST = [
  { id: 'elder_start', from: 'Tetua Bram', title: 'Awal Perjalanan', text: 'Arka, langkahmu membanggakan desa. Teruslah berlatih dan jaga dirimu di rimba.', gift: { gold: 50 }, cond: () => S.stage >= 0 },
  { id: 'lina_mochi', from: 'Lina & Mochi', title: 'Terima Kasih Mochi', text: 'Arka! Mochi mengeong senang sekali sejak kamu tolong. Ini ada buah beri manis untuk bekalmu.', gift: { item: 'berry', n: 3 }, cond: () => S.side?.mochi >= 3 || S.pet },
  { id: 'rina_dapur', from: 'Bu Rina', title: 'Salam Dapur Penginapan', text: 'Aroma masakanmu tercium harum. Petualang butuh sayur segar agar staminanya tetap prima!', gift: { item: 'veg', n: 2 }, cond: () => (S.st?.cooked || 0) >= 1 },
  { id: 'darto_lendir', from: 'Pak Darto', title: 'Bantuan Slime', text: 'Pagar kebunku sekarang kokoh berkat perekat lendir itu. Ini ramuan besar simpananku untukmu.', gift: { item: 'hipotion', n: 1 }, cond: () => S.side?.darto >= 2 || S.stage >= 3 },
  { id: 'kembara_jalan', from: 'Kang Kembara', title: 'Salam Sang Pengelana', text: 'Dunia ini luas, kawan! Aku berdagang keliling dari desa hingga kota sesuai hari. Semoga sukses!', gift: { gold: 40 }, cond: () => S.day >= 2 }
];

async function openMailbox() {
  if (G.lock > 0) return;
  G.lock++; sfx('cur');
  S.mail = S.mail || [];
  S.readMail = S.readMail || {};

  // Cek apakah ada surat baru yang memenuhi syarat
  for (const m of MAIL_LIST) {
    if (!S.mail.includes(m.id) && m.cond()) {
      S.mail.push(m.id);
    }
  }

  for (;;) {
    const unreadCount = S.mail.filter(id => !S.readMail[id]).length;
    const items = S.mail.map(id => {
      const m = MAIL_LIST.find(x => x.id === id);
      const isUnread = !S.readMail[id];
      return {
        t: (isUnread ? '✉ ' : '📭 ') + m.title,
        r: m.from
      };
    });
    items.push({ t: 'Tutup' });

    const r = await choose({
      head: `Kotak Surat Rumah · ${unreadCount ? unreadCount + ' Baru!' : 'Kosong'}`,
      x: 30, y: 30, w: 230,
      items,
      foot: i => i < S.mail.length ? `Dari: ${MAIL_LIST.find(x => x.id === S.mail[i])?.from}` : 'Periksa surat kiriman dari penduduk Lumina.'
    });

    if (r < 0 || r >= S.mail.length) break;

    const mailId = S.mail[r];
    const m = MAIL_LIST.find(x => x.id === mailId);
    const wasUnread = !S.readMail[mailId];
    S.readMail[mailId] = true;

    sfx('talk');
    await talk(m.from, [m.text]);

    if (wasUnread && m.gift) {
      if (m.gift.gold) {
        S.gold += m.gift.gold;
        sfx('coin');
        popWorld(S.x || 512, (S.y || 380) - 24, `+${m.gift.gold} G`, 'gold');
        await say(`Kamu menemukan lampiran ${m.gift.gold} G di dalam amplop!`, m.from);
      } else if (m.gift.item) {
        addItem(m.gift.item, m.gift.n || 1);
        sfx('chest');
        popWorld(S.x || 512, (S.y || 380) - 24, `+${ITEMS[m.gift.item].n}`, 'heal');
        await say(`Kamu menerima bingkisan ${ITEMS[m.gift.item].n} x${m.gift.n || 1}!`, m.from);
      }
      updHud();
    }
  }
  G.lock--;
}

// ---------------- 6. ENSIKLOPEDIA BENUA LUMINA (#71) ----------------
const CODEX_FLORA = ['herb', 'berry', 'apple', 'orange', 'honey', 'mush', 'gmush', 'frost_flower', 'river_orchid'];
const CODEX_FAUNA = ['fish', 'gfish', 'moonfish', 'rainfish', 'egg', 'wool', 'river_prawn', 'canary_feather', 'sparrow_feather'];
const CODEX_BUGS = ['bug_beetle', 'bug_butterfly', 'bug_dragonfly', 'bug_firefly'];
const CODEX_MINERAL = ['ore', 'shard', 'amethyst_gem', 'fossil_ammonite', 'obsidian', 'brass_cog', 'lake_pearl'];

async function openEncyclopedia() {
  if (G.lock > 0) return;
  G.lock++; sfx('cur');

  const totalItems = CODEX_FLORA.length + CODEX_FAUNA.length + CODEX_BUGS.length + CODEX_MINERAL.length + BEAST.length;
  const foundFlora = CODEX_FLORA.filter(id => has(id) || S.seen?.[id] || (S.inv && S.inv[id])).length;
  const foundFauna = CODEX_FAUNA.filter(id => has(id) || (S.fishLog && S.fishLog[id]) || (S.inv && S.inv[id])).length;
  const foundBugs = CODEX_BUGS.filter(id => has(id) || (S.inv && S.inv[id])).length;
  const foundMineral = CODEX_MINERAL.filter(id => has(id) || (S.inv && S.inv[id])).length;
  const foundBeast = BEAST.filter(k => S.kills && S.kills[k] > 0).length;
  const totalFound = foundFlora + foundFauna + foundBugs + foundMineral + foundBeast;
  const pct = Math.round((totalFound / totalItems) * 100);

  for (;;) {
    const tabs = [
      { t: `🌿 Flora (${foundFlora}/${CODEX_FLORA.length})`, list: CODEX_FLORA },
      { t: `🐟 Fauna & Akuatik (${foundFauna}/${CODEX_FAUNA.length})`, list: CODEX_FAUNA },
      { t: `🦋 Serangga Lumina (${foundBugs}/${CODEX_BUGS.length})`, list: CODEX_BUGS },
      { t: `💎 Mineral & Harta (${foundMineral}/${CODEX_MINERAL.length})`, list: CODEX_MINERAL },
      { t: `👾 Bestiari (${foundBeast}/${BEAST.length})`, beast: true },
      { t: 'Tutup' }
    ];

    const r = await choose({
      head: `ENSIKLOPEDIA LUMINA · ${pct}% Selesai`,
      x: 20, y: 20, w: 260,
      items: tabs,
      foot: () => `Koleksi Dunia: <b>${totalFound}/${totalItems} entri (${pct}%)</b> terungkap di Benua Lumina.`
    });

    if (r < 0 || r === tabs.length - 1) break;

    const cat = tabs[r];
    if (cat.beast) {
      if (typeof openBestiary === 'function') await openBestiary(G.scene);
      continue;
    }

    const items = cat.list.map(id => {
      const it = ITEMS[id];
      const discovered = has(id) || (S.inv && S.inv[id]) || (S.fishLog && S.fishLog[id]);
      return {
        t: discovered ? icon(id) + it.n : '❓ ????????',
        r: discovered ? (it.src || 'Benua Lumina') : 'Belum ditemukan'
      };
    });
    items.push({ t: 'Kembali' });

    await choose({
      head: cat.t,
      x: 20, y: 20, w: 260,
      items,
      foot: i => {
        if (i < cat.list.length) {
          const id = cat.list[i];
          const it = ITEMS[id];
          const discovered = has(id) || (S.inv && S.inv[id]) || (S.fishLog && S.fishLog[id]);
          return discovered ? `${it.d}<br>📍 <b>Lokasi:</b> ${it.src || 'Di alam liar'}` : 'Jelajahi sudut benua untuk menemukan entri ini.';
        }
        return '';
      }
    });
  }
  G.lock--;
}

// ---------------- 7. SISTEM ALKIMIA EKSPERIMEN (#27) ----------------
const ALCHEMY_FORMULAS = [
  { mats: ['herb', 'honey'], out: 'elixir_life', n: 1, name: 'Eliksir Pemulih Agung' },
  { mats: ['herb', 'cave_moss', 'leather_polish'], out: 'potion_agility', n: 1, name: 'Ramuan Kelincahan' },
  { mats: ['shard', 'frost_flower', 'frost_moss'], out: 'potion_frostcloak', n: 1, name: 'Ramuan Jubah Es' },
  { mats: ['gmush', 'cave_water'], out: 'potion_nightvision', n: 1, name: 'Ramuan Penglihatan Malam' }
];

async function openAlchemyTable() {
  if (G.lock > 0) return;
  G.lock++; sfx('cur');
  S.alchemyRecipes = S.alchemyRecipes || {};

  for (;;) {
    const mats = Object.keys(S.inv).filter(id => ITEMS[id] && (ITEMS[id].k === 'mat' || ITEMS[id].k === 'use') && S.inv[id] > 0);
    if (mats.length < 2) {
      await say('Kamu butuh sedikitnya 2 bahan herbal/mineral berbeda di tas untuk eksperimen alkimia.');
      break;
    }

    const mItems = mats.map(id => ({
      t: icon(id) + ITEMS[id].n + ' x' + S.inv[id],
      r: ITEMS[id].src || 'Bahan Alkimia'
    }));
    mItems.push({ t: 'Batal' });

    // Pilih Bahan 1
    const r1 = await choose({
      head: 'Meja Alkimia · Pilih Bahan Pertama',
      x: 24, y: 24, w: 250,
      items: mItems,
      foot: i => i < mats.length ? ITEMS[mats[i]].d : 'Campurkan bahan bebas untuk menemukan ramuan ajaib baru.'
    });
    if (r1 < 0 || r1 === mats.length) break;
    const mat1 = mats[r1];

    // Pilih Bahan 2
    const mItems2 = mats.filter(id => id !== mat1 || S.inv[id] >= 2).map(id => ({
      t: icon(id) + ITEMS[id].n + ' x' + S.inv[id]
    }));
    mItems2.push({ t: 'Batal' });

    const r2 = await choose({
      head: `Alkimia · Campur dengan ${ITEMS[mat1].n}`,
      x: 24, y: 24, w: 250,
      items: mItems2,
      foot: () => 'Pilih bahan kedua untuk diseduh ke dalam kuali alkimia.'
    });
    if (r2 < 0 || r2 >= mItems2.length - 1) continue;
    const mat2 = mats.filter(id => id !== mat1 || S.inv[id] >= 2)[r2];

    // Eksekusi Pencampuran
    sfx('fire');
    await sleep(250);
    sfx('splash');
    await sleep(250);

    // Cari resep yang cocok
    const chosen = [mat1, mat2].sort();
    const match = ALCHEMY_FORMULAS.find(f => {
      const fm = [...f.mats].sort();
      return fm.length === 2 && fm[0] === chosen[0] && fm[1] === chosen[1];
    });

    addItem(mat1, -1);
    addItem(mat2, -1);

    if (match) {
      addItem(match.out, match.n);
      S.alchemyRecipes[match.out] = true;
      sfx('chest');
      popWorld(S.x || 512, (S.y || 380) - 20, `+${ITEMS[match.out].n}!`, 'heal');
      await say(`BERHASIL! Formula bereaksi sempurna menghasilkan ${ITEMS[match.out].n}! Resep telah tersimpan di catatan.`);
    } else {
      addItem('potion_failed', 1);
      sfx('buzz');
      popWorld(S.x || 512, (S.y || 380) - 20, '+Campuran Aneh', 'mpc');
      await say('BLUBB... Campuran mengeluarkan asap pekat berbau aneh. Kamu mendapatkan Campuran Aneh.');
    }
    updHud();
  }
  G.lock--;
}

// ---------------- 8. BRANKAS DESA & BUNGA SIMPANAN (#42) ----------------
async function openVillageVault(sc) {
  if (G.lock > 0) return;
  G.lock++; sfx('cur');
  S.bank = S.bank || { gold: 0, day: S.day || 1 };

  // Hitung akumulasi bunga simpanan (2% per hari game)
  if ((S.day || 1) > (S.bank.day || 1)) {
    const elapsedDays = Math.max(1, (S.day || 1) - (S.bank.day || 1));
    let earnedTotal = 0;
    for (let d = 0; d < elapsedDays; d++) {
      const interest = Math.floor((S.bank.gold || 0) * 0.02);
      if (interest > 0) {
        S.bank.gold += interest;
        earnedTotal += interest;
      }
    }
    S.bank.day = S.day || 1;
    if (earnedTotal > 0) {
      sfx('coin');
      await say(`Brankas Desa mencairkan bunga tabungan sebesar +${earnedTotal} G (${elapsedDays} hari simpanan)!`);
    }
  }

  for (;;) {
    const saldo = S.bank.gold || 0;
    const estNextDay = Math.floor(saldo * 0.02);
    const r = await choose({
      head: `Brankas Desa Lumina · Saldo: ${saldo} G`,
      x: 30, y: 30, w: 260,
      items: [
        { t: '💰 Setor Koin Emas (50 G)', dis: S.gold < 50 },
        { t: '💰 Setor Koin Emas (100 G)', dis: S.gold < 100 },
        { t: '💰 Setor Semua Koin Emas', dis: S.gold <= 0 },
        { t: '💳 Tarik Koin (50 G)', dis: saldo < 50 },
        { t: '💳 Tarik Koin (100 G)', dis: saldo < 100 },
        { t: '💳 Tarik Semua Koin', dis: saldo <= 0 },
        { t: 'Tutup' }
      ],
      foot: () => `Dompet: ${S.gold} G · Estimasi Bunga Harian (2%): +${estNextDay} G saat fajar.`
    });

    if (r < 0 || r === 6) break;

    if (r === 0) { // Setor 50 G
      S.gold -= 50; S.bank.gold += 50; sfx('coin');
      popWorld(S.x || 512, (S.y || 380) - 20, '-50 G Simpan', 'gold');
    } else if (r === 1) { // Setor 100 G
      S.gold -= 100; S.bank.gold += 100; sfx('coin');
      popWorld(S.x || 512, (S.y || 380) - 20, '-100 G Simpan', 'gold');
    } else if (r === 2) { // Setor Semua
      const all = S.gold; S.gold = 0; S.bank.gold += all; sfx('coin');
      popWorld(S.x || 512, (S.y || 380) - 20, `-${all} G Simpan`, 'gold');
    } else if (r === 3) { // Tarik 50 G
      S.bank.gold -= 50; S.gold += 50; sfx('coin');
      popWorld(S.x || 512, (S.y || 380) - 20, '+50 G Tarik', 'heal');
    } else if (r === 4) { // Tarik 100 G
      S.bank.gold -= 100; S.gold += 100; sfx('coin');
      popWorld(S.x || 512, (S.y || 380) - 20, '+100 G Tarik', 'heal');
    } else if (r === 5) { // Tarik Semua
      const all = S.bank.gold; S.bank.gold = 0; S.gold += all; sfx('coin');
      popWorld(S.x || 512, (S.y || 380) - 20, `+${all} G Tarik`, 'heal');
    }
    updHud();
  }
  G.lock--;
}

// ---------------- 9. PAPAN REKOR PETUALANG / HALL OF FAME (#95) ----------------
async function openHallOfFame() {
  if (G.lock > 0) return;
  G.lock++; sfx('cur');

  // Cari ikan terberat
  let heaviestFish = '-';
  let heaviestW = 0;
  for (const [id, f] of Object.entries(S.fishLog || {})) {
    if (f.w && f.w > heaviestW) {
      heaviestW = f.w;
      heaviestFish = `${ITEMS[id]?.n || id} (${f.w.toFixed(1)} kg · ${f.l.toFixed(0)} cm)`;
    }
  }

  // Rekor boss rematch
  const records = S.records || {};
  const bossLines = [
    `Ratu Jamur: ${records.squeen ? records.squeen.toFixed(1) + ' dtk' : '(Belum dicoba)'}`,
    `Golem Purba: ${records.golemk ? records.golemk.toFixed(1) + ' dtk' : '(Belum dicoba)'}`,
    `Naga Es Kryos: ${records.kryos ? records.kryos.toFixed(1) + ' dtk' : '(Belum dicoba)'}`
  ];

  const items = [
    { t: '🐟 Ikan Terberat', r: heaviestFish },
    { t: '⏱ Waktu Rematch Boss', r: records.squeen || records.golemk || records.kryos ? 'Tercatat' : '-' },
    { t: '👣 Langkah Kaki Petualang', r: `${S.st?.steps || 0} langkah` },
    { t: '⚔ Monster Ditaklukkan', r: `${S.st?.kills || 0} ekor` },
    { t: '⛏ Batu Ditambang', r: `${S.st?.mined || 0} urat batu` },
    { t: 'Tutup' }
  ];

  await choose({
    head: '🏆 Papan Rekor Petualang Lumina',
    x: 20, y: 25, w: 280,
    items,
    foot: i => {
      if (i === 1) return bossLines.join(' · ');
      if (i === 0) return 'Tangkapan ikan paling memukau dari seluruh perairan benua.';
      return 'Pencapaian pribadi terbaik sepanjang perjalanan Arka.';
    }
  });

  G.lock--;
}

// ---------------- 10. BOSS REMATCH DI KUIL INGATAN (#12) ----------------
const MEMORY_BOSSES = [
  { id: 'squeen', n: 'Kenangan Ratu Jamur', type: 'squeen', hpMul: 1.3, atkMul: 1.25, cond: () => S.flags?.mb_queen || S.stage >= 2, gold: 120, exp: 90 },
  { id: 'golemk', n: 'Kenangan Golem Purba', type: 'golemk', hpMul: 1.35, atkMul: 1.3, cond: () => S.flags?.golem || S.stage >= 6, gold: 200, exp: 160 },
  { id: 'kryos', n: 'Kenangan Naga Es Kryos', type: 'kryos', hpMul: 1.4, atkMul: 1.35, cond: () => S.flags?.dragon || S.stage >= 13, gold: 350, exp: 280 }
];

async function openMemoryTrials(sc) {
  if (G.lock > 0) return;
  G.lock++; sfx('cur');

  const available = MEMORY_BOSSES.map(b => {
    const unlocked = b.cond();
    const best = S.records?.[b.id] ? ` [${S.records[b.id].toFixed(1)}s]` : '';
    return {
      t: (unlocked ? '🔮 ' : '🔒 ') + b.n + best,
      r: unlocked ? 'Tersedia' : 'Terkunci',
      dis: !unlocked,
      boss: b
    };
  });
  available.push({ t: 'Tutup' });

  const r = await choose({
    head: 'Cermin Ingatan · Kuil Suci',
    x: 25, y: 30, w: 270,
    items: available,
    foot: i => i < MEMORY_BOSSES.length ? 'Tantang kembali kenangan boss masa lalu dalam wujud lebih kuat!' : 'Pantulan cermin suci merekam jejak musuh-musuh kuat.'
  });

  if (r < 0 || r >= MEMORY_BOSSES.length) {
    G.lock--;
    return;
  }

  const chosen = available[r].boss;
  G.lock--;

  // Mulai simulasi rematch
  await say(`Cermin Ingatan bercahaya terang... Kenangan pertarungan melawan ${chosen.n} diwujudkan kembali di altar kuil!`);
  startRematchBattle(sc, chosen);
}

