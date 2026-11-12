'use strict';
// Gelombang 12: Papan Permintaan (#45), Pedagang Keliling (#39), Gelar & Bonus Pasif (#18),
// Layar Statistik (#25), Buku Resep (#28), Kunci Item Tas (#374), Jual Cepat Sampah (#36)

// ---------------- 1. SISTEM GELAR & BONUS PASIF (#18) ----------------
const TITLES = {
  'Petualang Pemula': { n: 'Petualang Pemula', d: 'Langkah awal penjelajah Benua Lumina.', bonus: '', check: () => true },
  'Penebas Rimba': { n: 'Penebas Rimba', d: 'Telah mengalahkan lebih dari 25 monster.', bonus: '+2 Serangan (ATK)', atk: 2, check: () => (S.st?.kills || 0) >= 25 },
  'Pembasmi Monster': { n: 'Pembasmi Monster', d: 'Telah mengalahkan 100 monster buas.', bonus: '+5 Serangan & +5 HP Maksimal', atk: 5, maxhp: 5, check: () => (S.st?.kills || 0) >= 100 },
  'Nelayan Handal': { n: 'Nelayan Handal', d: 'Telah memancing sedikitnya 15 ekor ikan.', bonus: '+10% Kecepatan Gerak di Air & Pancingan Cepat', spd: 0.1, check: () => (S.st?.fish || 0) >= 15 },
  'Petani Rajin': { n: 'Petani Rajin', d: 'Telah memanen sedikitnya 10 kali hasil kebun.', bonus: '+10 HP Maksimal', maxhp: 10, check: () => (S.st?.harvest || 0) >= 10 },
  'Kolektor Harta': { n: 'Kolektor Harta', d: 'Telah mengumpulkan total 500 G sepanjang perjalanan.', bonus: '+1 Pertahanan (DEF)', def: 1, check: () => (S.st?.goldEarned || S.gold || 0) >= 500 },
  'Penakluk Bos': { n: 'Penakluk Bos', d: 'Telah menundukkan monster penguasa.', bonus: '+3 Serangan & +2 Pertahanan', atk: 3, def: 2, check: () => (S.st?.bosses || 0) >= 1 || S.stage >= 5 },
  'Penjelajah Lumina': { n: 'Penjelajah Lumina', d: 'Telah menempuh lebih dari 5.000 langkah perjalanan.', bonus: '+15% Kecepatan Lari (SPD)', spd: 0.15, check: () => (S.st?.steps || 0) >= 5000 },
  'Si Palu Batu': { n: 'Si Palu Batu', d: 'Telah menambang sedikitnya 5 kali urat geoda gua.', bonus: '+2 Pertahanan (DEF)', def: 2, check: () => (S.st?.mined || 0) >= 5 },
  'Ahli Peledak': { n: 'Ahli Peledak', d: 'Telah meledakkan sedikitnya 3 tong bubuk mesiu tempur.', bonus: '+3 Serangan (ATK)', atk: 3, check: () => (S.st?.barrels || 0) >= 3 },
  'Pemburu Malam': { n: 'Pemburu Malam', d: 'Telah menundukkan monster buas di kegelapan malam.', bonus: '+10 HP & +2 Serangan', maxhp: 10, atk: 2, check: () => (S.st?.nightKills || 0) >= 8 },
  'Bayangan Senyap': { n: 'Bayangan Senyap', d: 'Ahli menyergap musuh dari arah belakang (Backstab).', bonus: '+15% Kecepatan Lari (SPD)', spd: 0.15, check: () => (S.st?.backstabs || 0) >= 5 },
  'Pembuka Rintangan': { n: 'Pembuka Rintangan', d: 'Telah merenovasi jembatan rusak di alam liar.', bonus: '+5 HP & +1 Pertahanan', maxhp: 5, def: 1, check: () => !!S.flags?.bridge_fixed },
  'Saudagar Muda': { n: 'Saudagar Muda', d: 'Telah mengumpulkan akumulasi kekayaan 1.000 G.', bonus: '+10% Diskon Toko & +1 DEF', def: 1, check: () => (S.st?.goldEarned || 0) >= 1000 },
};

function checkTitles() {
  if (!S) return;
  S.titles = S.titles || ['Petualang Pemula'];
  S.title = S.title || 'Petualang Pemula';
  for (const id in TITLES) {
    if (!S.titles.includes(id) && TITLES[id].check()) {
      S.titles.push(id);
      if (typeof toastItem === 'function') toastItem(null, `🏆 Gelar Baru Terbuka: "${TITLES[id].n}"!`);
    }
  }
}

// ---------------- 2. PAPAN PERMINTAAN DESA (#45) ----------------
// Permintaan harian yang diacak berdasarkan hari kalender (S.day)
const BOARD_POOL = [
  { id: 'jelly', n: 4, gold: 24, exp: 18, req: 'Pak Darto butuh Lendir Slime untuk perekat kayu pagar.', from: 'Pak Darto' },
  { id: 'herb', n: 3, gold: 22, exp: 16, req: 'Bu Lastri membutuhkan Daun Obat untuk persediaan obat herba.', from: 'Bu Lastri' },
  { id: 'berry', n: 5, gold: 25, exp: 20, req: 'Lina mencari Buah Beri segar untuk camilan sore Mochi.', from: 'Lina' },
  { id: 'fish', n: 2, gold: 26, exp: 22, req: 'Bu Rina mencari Ikan Mas segar untuk menu makan siang penginapan.', from: 'Bu Rina' },
  { id: 'tusk', n: 2, gold: 35, exp: 30, req: 'Pak Besi butuh Taring Babi keras sebagai gagang pahat tempa.', from: 'Pak Besi' },
  { id: 'ore', n: 2, gold: 40, exp: 35, req: 'Penjaga desa memerlukan Bijih Batu untuk menambal benteng.', from: 'Penjaga Desa' },
  { id: 'spore', n: 3, gold: 28, exp: 24, req: 'Tetua Bram meminta Spora Jamur untuk penelitian debu kristal.', from: 'Tetua Bram' },
  { id: 'apple', n: 3, gold: 30, exp: 25, req: 'Dodi ingin Apel Segar manis untuk pesta buah anak-anak.', from: 'Dodi' },
  { id: 'wool', n: 1, gold: 32, exp: 25, req: 'Penenun desa mencari Bulu Domba halus untuk merajut syal.', from: 'Penenun Desa' },
];

function getBoardQuests(day = S.day || 1) {
  // 3 permintaan per hari terprediksi secara siklus
  const seed = (day * 3) % BOARD_POOL.length;
  const q1 = BOARD_POOL[seed];
  const q2 = BOARD_POOL[(seed + 3) % BOARD_POOL.length];
  const q3 = BOARD_POOL[(seed + 6) % BOARD_POOL.length];
  return [q1, q2, q3];
}

async function openNoticeBoard() {
  if (G.lock > 0) return;
  G.lock++; sfx('cur');
  S.boardDay = S.boardDay || S.day;
  S.boardDone = S.boardDone || {};
  if (S.boardDay !== S.day) {
    S.boardDay = S.day;
    S.boardDone = {};
  }
  
  for (;;) {
    const list = getBoardQuests(S.day);
    const dayStr = typeof dayName === 'function' ? dayName() : `Hari ke-${S.day}`;
    const items = list.map((q, idx) => {
      const done = S.boardDone[idx];
      const hasItem = has(q.id, q.n);
      const ready = !done && hasItem;
      const count = S.inv[q.id] || 0;
      return {
        t: (done ? '✓ ' : ready ? '★ ' : '• ') + q.from,
        r: done ? 'SELESAI' : `${count}/${q.n} ${ITEMS[q.id].n}`,
        dis: done
      };
    });
    items.push({ t: 'Tutup' });

    const r = await choose({
      head: `PAPAN PERMINTAAN DESA · ${dayStr}`,
      x: 18, y: 20, w: 270,
      items,
      foot: (i) => {
        if (i >= list.length) return 'Bantu warga desa setiap hari untuk koin dan EXP tambahan!';
        const q = list[i];
        if (S.boardDone[i]) return '✓ Permintaan ini sudah kamu selesaikan hari ini.';
        return `<b>${q.from}:</b> "${q.req}"<br>Hadiah: <b>+${q.gold} G</b> · <b>+${q.exp} EXP</b>`;
      }
    });

    if (r < 0 || r >= list.length) break;

    const q = list[r];
    if (S.boardDone[r]) {
      sfx('buzz');
      continue;
    }

    if (!has(q.id, q.n)) {
      sfx('buzz');
      await say(`Kamu belum memiliki cukup ${ITEMS[q.id].n} (${S.inv[q.id] || 0}/${q.n}).`);
      continue;
    }

    // Serahkan barang
    addItem(q.id, -q.n);
    S.gold += q.gold;
    S.st = S.st || {};
    S.st.goldEarned = (S.st.goldEarned || 0) + q.gold;
    S.boardDone[r] = true;
    sfx('coin');
    if (typeof popWorld === 'function' && G.scene && G.scene.pl) {
      popWorld(G.scene.pl.x, G.scene.pl.y - 20, `+${q.gold} G`, 'gold');
    }
    await sleep(200);
    sfx('heal');
    if (typeof gainExp === 'function') gainExp(q.exp);
    else {
      S.exp = (S.exp || 0) + q.exp;
      if (typeof updHud === 'function') updHud();
    }
    checkTitles();
    await say(`Barang diserahkan ke kurir desa! Kamu menerima hadiah ${q.gold} G dan ${q.exp} EXP dari ${q.from}.`);
  }
  G.lock--;
}

// ---------------- 3. PEDAGANG KELILING (#39 "Kang Kembara") ----------------
// Jadwal rute pedagang berdasarkan hari kalender (7 hari):
// Senin & Kamis: Desa Lumina (dekat jembatan/pasar)
// Selasa: Padang Angin (dekat kincir)
// Rabu: Danau Cermin (tepi dermaga)
// Jumat: Hutan Lumina (persimpangan jalan)
// Sabtu: Kota Lumina (depan akademi)
// Minggu: Libur berkelana di Penginapan
const MERCHANT_SCHEDULE = {
  village: [0, 3], // Senin & Kamis
  meadow: [1],     // Selasa
  lake: [2],       // Rabu
  forest: [4],     // Jumat
  city: [5],       // Sabtu
};

function isMerchantHere(mapId) {
  const dayIdx = (S.day || 0) % 7;
  const days = MERCHANT_SCHEDULE[mapId];
  return days && days.includes(dayIdx);
}

// Barang dagangan langka Kang Kembara berganti per musim/hari
function getMerchantStock() {
  return ['hipotion', 'holy_water', 'sarrow', 'bait', 'bomb', 'net', 'lockpick', 'f_hero'];
}

async function talkKangKembara() {
  const dName = typeof dayName === 'function' ? dayName() : `Hari ke-${S.day}`;
  await talk('Kang Kembara', [
    `Salam petualang! Hari ${dName} ini langkah kakiku singgah di mari.`,
    'Aku membawa komoditas pilihan dari seantero penjuru benua yang jarang dijual di kios biasa.'
  ]);
  const r = await choose({
    head: `Kang Kembara Si Musafir · ${S.gold} G`,
    x: 40, y: 40, w: 200,
    items: [
      { t: 'Lihat Barang Langka' },
      { t: 'Tanya Kabar Wilayah Lain' },
      { t: 'Pamit' }
    ]
  });
  if (r === 0) {
    await buyMenu('Kang Kembara Si Musafir', getMerchantStock());
  } else if (r === 1) {
    const tales = [
      'Kudengar di utara Puncak Beku ada bunga kristal yang hanya mekar di sela batu salju abadi.',
      'Danau Cermin di malam hari kadang memantulkan pendaran misterius dari dasar perairannya.',
      'Di kedalaman Gua Batu, retakan dinding yang rapuh konon bisa dijebol dengan bom api!',
      'Hati-hati melangkah di Rawa Senja, kabut tebalnya sering menyamarkan sarang ular beracun.'
    ];
    await talk('Kang Kembara', [pick(tales)]);
  }
}

// ---------------- 4. BUKU RESEP (#28) ----------------
async function openRecipeBook() {
  const tabs = ['Tempa', 'Masak', 'Kerajinan'];
  let tab = 0, sel = 0;
  for (;;) {
    let list = [];
    if (tab === 0) list = RECIPES;
    else if (tab === 1) list = COOK;
    else list = CRAFT;

    const items = list.map(R => {
      const it = ITEMS[R.id];
      const can = Object.entries(R.need).every(([k, n]) => has(k, n));
      const hasIt = has(R.id);
      return {
        t: (can ? '★ ' : '• ') + icon(R.id) + it.n,
        r: hasIt ? `Punya x${S.inv[R.id]}` : (can ? 'Bahan Cukup' : 'Kurang Bahan'),
        dis: !can
      };
    });
    items.push({ t: 'Tutup' });

    const r = await choose({
      head: `BUKU RESEP · Kategori: ${tabs[tab]}`,
      x: 14, y: 18, w: 280,
      start: sel,
      items,
      foot: (i) => {
        if (i >= list.length) return 'Bahan bisa didapat dari monster, tambang batu, kebun, & alam liar.';
        const R = list[i];
        const it = ITEMS[R.id];
        const costStr = R.gold ? ` · Biaya: <b>${R.gold} G</b>` : '';
        const needs = Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k]?.n || k} ${S.inv[k] || 0}/${n}`).join(' · ');
        return `<b>${it.n}:</b> ${it.d}${costStr}<br>Bahan: ${needs}`;
      }
    });

    if (r < 0 || r === list.length) {
      // Jika menekan tutup, keluar; jika ingin ganti kategori via keyboard/touch
      break;
    }
    sel = r;
    // Beralih tab kategori berikutnya bila memilih item
    tab = (tab + 1) % 3;
    sel = 0;
    sfx('cur');
  }
}

// ---------------- 5. STATISTIK & GELAR PEMAIN (#25 & #18) ----------------
async function openStatsAndTitles() {
  checkTitles();
  S.st = S.st || {};
  const tabs = ['Statistik', 'Pilih Gelar'];
  let tab = 0;
  
  for (;;) {
    if (tab === 0) {
      // Rekap Statistik Petualangan
      const st = stat();
      const mins = Math.floor((S.st.playTime || 0) / 60);
      const hours = Math.floor(mins / 60);
      const timeStr = `${hours}j ${mins % 60}m`;
      const rows = [
        ['Waktu Bermain', timeStr],
        ['Monster Dikalahkan', `${S.st.kills || 0} ekor`],
        ['Bos Dikalahkan', `${S.st.bosses || 0} kali`],
        ['Ikan Dipancing', `${S.st.fish || 0} ekor`],
        ['Hasil Panen', `${S.st.harvest || 0} tanaman`],
        ['Barang Dirakit (Craft)', `${S.st.crafted || 0} kali`],
        ['Makanan Dimasak', `${S.st.cooked || 0} piring`],
        ['Total Langkah', `${S.st.steps || 0} langkah`],
        ['Tangkisan Berhasil (Parry)', `${S.parries || 0} kali`],
        ['Total Koin Didapat', `${S.st.goldEarned || S.gold} G`],
      ];

      const r = await choose({
        head: `STATISTIK ARKA · Lv ${S.lv} (${S.title || 'Petualang'})`,
        x: 16, y: 16, w: 275,
        items: [...rows.map(([t, val]) => ({ t, r: val })), { t: '▶ Buka Daftar Gelar Kehormatan' }, { t: 'Tutup' }],
        foot: (i) => i < rows.length ? `Rekap catatan perjalanan Arka selama menjelajahi dunia Lumina.` : 'Ubah gelar untuk mendapatkan bonus atribut pasif.'
      });

      if (r < 0 || r === rows.length + 1) break;
      if (r === rows.length) { tab = 1; sfx('cur'); continue; }
    } else {
      // Daftar Gelar & Pasif
      const tList = Object.keys(TITLES);
      const items = tList.map(id => {
        const T = TITLES[id];
        const owned = S.titles.includes(id);
        const active = S.title === id;
        return {
          t: (active ? '★ ' : owned ? '✓ ' : '🔒 ') + T.n,
          r: active ? 'DIPAKAI' : (owned ? 'Siap' : 'Terkunci'),
          dis: !owned
        };
      });
      items.push({ t: '◀ Kembali ke Statistik' });

      const r = await choose({
        head: `GELAR KEHORMATAN · Aktif: ${S.title || '-'}`,
        x: 16, y: 16, w: 275,
        items,
        foot: (i) => {
          if (i >= tList.length) return 'Gelar terbuka otomatis saat pencapaian petualangan terpenuhi.';
          const T = TITLES[tList[i]];
          const owned = S.titles.includes(tList[i]);
          return `<b>${T.n}:</b> ${T.d}<br>Bonus Pasif: <span style="color:#ffe066">${T.bonus || 'Tidak ada'}</span>${owned ? '' : '<br><i>(Belum terbuka)</i>'}`;
        }
      });

      if (r < 0) break;
      if (r === tList.length) { tab = 0; sfx('cur'); continue; }

      const chosen = tList[r];
      if (S.titles.includes(chosen)) {
        S.title = chosen;
        sfx('ok');
        if (typeof updHud === 'function') updHud();
        await say(`Gelar diubah menjadi "${TITLES[chosen].n}". Bonus pasif (${TITLES[chosen].bonus || 'Normal'}) kini aktif!`);
      } else {
        sfx('buzz');
      }
    }
  }
}


// ---------------- 6. TANTANGAN HARIAN AKSI (#96) ----------------
const DAILY_FEATS_DEF = [
  { id: 'kills', n: 'Pemburu Monster', d: 'Kalahkan 4 monster apapun hari ini', goal: 4, gold: 40, exp: 30, getCur: () => S.st?.kills || 0 },
  { id: 'mined', n: 'Penambang Urat', d: 'Tambang batu bijih di gua', goal: 2, gold: 50, exp: 35, getCur: () => S.st?.mined || 0 },
  { id: 'parry', n: 'Ahli Tangkis', d: 'Lakukan tangkisan serangan tepat waktu (Parry)', goal: 2, gold: 45, exp: 40, getCur: () => S.parries || 0 },
  { id: 'craft', n: 'Tangan Terampil', d: 'Rakit ramuan/alat di kerajinan', goal: 2, gold: 35, exp: 25, getCur: () => S.st?.crafted || 0 },
  { id: 'fish', n: 'Tangkapan Air', d: 'Pancing ikan dari danau/sungai', goal: 2, gold: 45, exp: 30, getCur: () => S.st?.fish || 0 },
];

function getDailyFeats() {
  const seed = (S.day * 2) % DAILY_FEATS_DEF.length;
  return [
    DAILY_FEATS_DEF[seed],
    DAILY_FEATS_DEF[(seed + 2) % DAILY_FEATS_DEF.length],
    DAILY_FEATS_DEF[(seed + 3) % DAILY_FEATS_DEF.length]
  ];
}

async function openDailyFeats() {
  S.dailyFeats = S.dailyFeats || {};
  if (S.dailyFeats.day !== S.day) {
    S.dailyFeats = { day: S.day, claimed: {}, baseline: {} };
    const feats = getDailyFeats();
    for (const f of feats) {
      S.dailyFeats.baseline[f.id] = f.getCur();
    }
  }

  for (;;) {
    const feats = getDailyFeats();
    const items = feats.map((f, i) => {
      const base = S.dailyFeats.baseline[f.id] || 0;
      const prog = Math.max(0, f.getCur() - base);
      const done = prog >= f.goal;
      const claimed = S.dailyFeats.claimed[i];
      return {
        t: (claimed ? '✓ ' : done ? '★ ' : '• ') + f.n,
        r: claimed ? 'KLAIMED' : done ? 'KLAIM HADIAH' : `${Math.min(f.goal, prog)}/${f.goal}`,
        dis: claimed
      };
    });
    items.push({ t: 'Tutup' });

    const r = await choose({
      head: `TANTANGAN HARIAN · Hari ke-${S.day}`,
      x: 18, y: 20, w: 270,
      items,
      foot: i => i < feats.length ? `${feats[i].d}<br>Hadiah: <b>+${feats[i].gold} G</b> · <b>+${feats[i].exp} EXP</b>` : 'Selesaikan aksi harian untuk bonus koin dan EXP.'
    });

    if (r < 0 || r >= feats.length) break;

    const f = feats[r];
    if (S.dailyFeats.claimed[r]) {
      sfx('buzz');
      continue;
    }
    const base = S.dailyFeats.baseline[f.id] || 0;
    const prog = Math.max(0, f.getCur() - base);
    if (prog < f.goal) {
      sfx('buzz');
      await say(`Tantangan "${f.n}" belum selesai (${prog}/${f.goal}).`);
      continue;
    }

    S.dailyFeats.claimed[r] = true;
    S.gold += f.gold;
    S.st = S.st || {};
    S.st.goldEarned = (S.st.goldEarned || 0) + f.gold;
    sfx('coin');
    await sleep(200);
    sfx('heal');
    if (typeof gainExp === 'function') gainExp(f.exp);
    else {
      S.exp = (S.exp || 0) + f.exp;
      if (typeof updHud === 'function') updHud();
    }
    checkTitles();
    await say(`Tantangan "${f.n}" berhasil diklaim! Hadiah: +${f.gold} G dan +${f.exp} EXP.`);
  }
}

// ---------------- 5. KOTAK SURAT RUMAH ARKA (#485) ----------------
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

function startRematchBattle(sc, target) {
  if (sc.bossOn) return;
  sc.bossOn = true;
  playBGM('boss');
  sc.rematchStart = Date.now();
  sc.rematchTarget = target;

  const bx = 160, by = 130;
  const e = sc.spawnEnemy(target.type, bx, by);
  e.rematch = true;
  e.maxhp = Math.floor(e.maxhp * target.hpMul);
  e.hp = e.maxhp;
  e.D.atk = Math.floor(e.D.atk * target.atkMul);
  sc.bossE = e;
  bossBar(target.n, 1);
  popWorld(bx, by - 24, '⚔ UJIAN DIMULAI!', 'crit');
  sc.camShake(200, 0.008);

  // Monitor kemenangan rematch
  const timerCheck = sc.time.addEvent({
    delay: 300,
    loop: true,
    callback: async () => {
      if (e.hp <= 0 || !e.spr.active) {
        timerCheck.remove();
        sc.bossOn = false;
        bossBar(null);
        const elapsedSec = (Date.now() - sc.rematchStart) / 1000;
        S.records = S.records || {};
        const prev = S.records[target.id];
        const isNewRecord = !prev || elapsedSec < prev;
        if (isNewRecord) S.records[target.id] = elapsedSec;

        playBGM('victory');
        sfx('chest');
        addItem('amethyst_gem', 1);
        S.gold += target.gold;
        if (typeof gainExp === 'function') gainExp(target.exp);
        else S.exp = (S.exp || 0) + target.exp;
        updHud();

        await say(`LUAR BIASA! Kamu menaklukkan ${target.n} dalam waktu ${elapsedSec.toFixed(1)} detik! ${isNewRecord ? '⭐ REKOR TERBARU TERCATAT!' : ''}\nHadiah Ujian: +${target.gold} G, +${target.exp} EXP & 1 Permata Kecubung.`);
        playBGM(bgmFor(sc.M));
      }
    }
  });
}

// ---------------- 11. BARTER LANGSUNG DENGAN PENDUDUK (#43) ----------------
const BARTER_DEALS = [
  { in: 'herb', inCount: 5, out: 'hipotion', outCount: 1, desc: '5 Daun Obat ➔ 1 Ramuan Besar' },
  { in: 'jelly', inCount: 4, out: 'bait', outCount: 3, desc: '4 Lendir Slime ➔ 3 Umpan Pancing' },
  { in: 'tusk', inCount: 3, out: 'sarrow', outCount: 10, desc: '3 Taring Babi ➔ 10 Panah Tajam' },
  { in: 'log', inCount: 6, out: 'iron', outCount: 1, desc: '6 Kayu Gelondong ➔ 1 Pedang Besi Tempa' }
];

World.prototype.openDirectBarter = async function () {
  G.lock++; sfx('cur');
  for (;;) {
    const items = BARTER_DEALS.map(d => {
      const have = S.inv[d.in] || 0;
      const can = have >= d.inCount;
      return {
        t: (can ? '🔄 ' : '🔒 ') + d.desc,
        r: `${have}/${d.inCount}`,
        dis: !can,
        deal: d
      };
    });
    items.push({ t: 'Tutup' });

    const r = await choose({
      head: '🔄 Barter Langsung Hasil Alam',
      x: 20, y: 25, w: 280,
      items,
      foot: () => 'Tukar langsung hasil petualangan tanpa memerlukan koin uang!'
    });

    if (r < 0 || r >= BARTER_DEALS.length) break;

    const chosen = BARTER_DEALS[r];
    addItem(chosen.in, -chosen.inCount);
    addItem(chosen.out, chosen.outCount);
    sfx('chest');
    popWorld(this.pl.x, this.pl.y - 20, `+${chosen.outCount} ${ITEMS[chosen.out]?.n || chosen.out}!`, 'heal');
    await say(`Barter berhasil! Kamu menukar ${chosen.inCount} ${ITEMS[chosen.in]?.n} dan mendapatkan ${chosen.outCount} ${ITEMS[chosen.out]?.n}.`);
    updHud();
  }
  G.lock--;
};

// ---------------- 12. PAPAN BURONAN MONSTER LANGKA (#241) ----------------
const CITY_BOUNTIES = [
  { id: 'bounty_wolf', name: 'Taring Perak', map: 'meadow', x: 800, y: 720, rew: 200, loc: 'Padang Angin (dekat pohon buah)', d: 'Serigala berbulu perak yang lincah dan ganas meneror kafilah pedagang.' },
  { id: 'bounty_frog', name: 'Raja Rawa Toksin', map: 'swamp', x: 880, y: 380, rew: 250, loc: 'Rawa Senja (ceruk timur)', d: 'Katak raksasa purba penyembur lendir beracun pekat di kubangan rawa.' },
  { id: 'bounty_gargoyle', name: 'Gargoyle Merah', map: 'cave', x: 600, y: 220, rew: 300, loc: 'Gua Batu (lorong kristal utara)', d: 'Monster bersayap api yang bersembunyi di langit-langit kegelapan gua.' }
];

async function openCityBounties(sc) {
  G.lock++; sfx('cur');
  S.bountiesDone = S.bountiesDone || {};
  try {
    for (;;) {
      const items = CITY_BOUNTIES.map(b => {
        const done = !!S.bountiesDone[b.id];
        return {
          t: (done ? '✓ ' : '⚔ ') + b.name,
          r: done ? 'SELESAI' : `${b.rew} G`,
          dis: done,
          bounty: b
        };
      });
      items.push({ t: 'Tutup' });

      const r = await choose({
        head: '📜 PAPAN BURONAN KOTA LUMINA',
        x: 20, y: 30, w: 280,
        items,
        foot: (i) => {
          if (i >= CITY_BOUNTIES.length) return 'Buru monster langka yang meresahkan jalan perdagangan.';
          const b = CITY_BOUNTIES[i];
          const done = !!S.bountiesDone[b.id];
          return `<b>${b.name}:</b> ${b.d}<br>Lokasi: <i>${b.loc}</i> · Hadiah: <b>${b.rew} G</b> ${done ? '(Terklaim)' : ''}`;
        }
      });

      if (r < 0 || r >= CITY_BOUNTIES.length) break;

      const chosen = CITY_BOUNTIES[r];
      await say(`[MAKLUMAT BURONAN]\nTarget: ${chosen.name}\nLokasi: ${chosen.loc}\nHadiah: ${chosen.rew} G\n\n"${chosen.d}"`, 'Gerbang Kota');
    }
  } finally {
    G.lock--;
  }
}
