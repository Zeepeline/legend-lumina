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
