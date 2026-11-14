'use strict';
// Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (3) — isi: lihat docs/CODEMAP.md
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

        const recMsg = isNewRecord ? '⭐ REKOR TERBARU TERCATAT!' : '';
        await say(
          `LUAR BIASA! Kamu menaklukkan ${target.n} dalam waktu ${elapsedSec.toFixed(1)} detik! ${recMsg}\n` +
          `Hadiah Ujian: +${target.gold} G, +${target.exp} EXP & 1 Permata Kecubung.`
        );
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
  {
    id: 'bounty_wolf', name: 'Taring Perak', map: 'meadow', x: 800, y: 720, rew: 200,
    loc: 'Padang Angin (dekat pohon buah)', d: 'Serigala berbulu perak yang lincah dan ganas meneror kafilah pedagang.'
  },
  {
    id: 'bounty_frog', name: 'Raja Rawa Toksin', map: 'swamp', x: 880, y: 380, rew: 250,
    loc: 'Rawa Senja (ceruk timur)', d: 'Katak raksasa purba penyembur lendir beracun pekat di kubangan rawa.'
  },
  {
    id: 'bounty_gargoyle', name: 'Gargoyle Merah', map: 'cave', x: 600, y: 220, rew: 300,
    loc: 'Gua Batu (lorong kristal utara)', d: 'Monster bersayap api yang bersembunyi di langit-langit kegelapan gua.'
  }
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
