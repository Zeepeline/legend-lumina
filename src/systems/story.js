'use strict';
// Sistem cerita baru & transisi (skenario cerita lama di-reset dari 0)
Object.assign(World.prototype, {
  spawnCh4() {},
  spawnCh5() {},
  spawnIceGate() {},
  updDragon() {},
  ch5Enter() {},
  async readLore(id) {
    if (typeof LORE !== 'undefined' && LORE[id] && LORE[id][2]) {
      return talk(null, [LORE[id][2]]);
    }
  },
  async touchBarrier() {
    return talk(null, ['Reruntuhan gerbang batu kuno di tengah hutan lebat. Lumut dan sulur tanaman menutupi pilar-pilar tua ini.']);
  },
  async takeMochi() {
    G.lock++; sfx('ok'); this.mochi.destroy(); this.inter = this.inter.filter(i => !(i.x === this.M.mochi.x && i.y === this.M.mochi.y));
    S.side.mochi = 2; addItem('mochi'); updHud(); await say('Meong~! Kamu menemukan Mochi, kucing putih Lina. Ia langsung meringkuk di tasmu.'); G.lock--;
  },
  async useCrystal() {
    G.lock++; sfx('heal');
    this.cameras.main.flash(400, 200, 240, 255); this.sparkle(this.crystal.x, this.crystal.y - 16, 'dot', 20);
    const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp; updHud();
    await say('Monolit kristal purba ini memancarkan hawa sejuk yang menenangkan. Tenaga dan staminamu pulih sepenuhnya.');
    G.lock--; saveGame(this);
  },
  async openChest(c, spr) {
    if (S.flags[c.id]) return talk(null, ['Petinya sudah kosong.']);
    // Peti Palsu / Mimic (#199)
    if (c.mimic) {
      G.lock++;
      sfx('crit');
      this.camShake(120, .006);
      spr.setTint(0xff4a4a);
      await sleep(200);
      spr.destroy();
      S.flags[c.id] = true;
      this.spawnEnemy('mimic', c.x, c.y);
      popWorld(c.x, c.y - 18, 'KRAKK! MIMIC!', 'crit');
      await say('KRAAAKKK!! Peti itu membuka taring tajam dan melompat menyerangmu! Itu adalah Mimic!');
      G.lock--;
      return;
    }
    if (c.lock) {
      if (!has('key')) return talk(null, ['Peti ini terkunci rapat. Lubang kuncinya berkarat... mungkin ada kunci tua di suatu tempat.']);
      addItem('key', -1);
      await say('Kunci Tua berputar... KLIK! Peti terbuka.');
    }
    if (c.locked) {
      if (!has('lockpick')) {
        sfx('buzz');
        return talk(null, ['Peti besi ini terkunci rapat dengan gembok tembaga tua. Kamu butuh Peniti Pembobol (dijual di toko/kota) untuk membukanya!']);
      }
      const ok = await ask('Gunakan 1 Peniti Pembobol untuk membuka gembok peti besi ini?', 'Peti Terkunci', 'Bobol Gembok', 'Tinggalkan');
      if (!ok) return;
      addItem('lockpick', -1);
      sfx('step');
      popWorld(c.x, c.y - 12, 'KREK...', 'gold');
      await sleep(350);
      sfx('crit');
      popWorld(c.x, c.y - 16, 'KLAK!', 'crit');
      await sleep(200);
      await say('Kawat peniti bergerak lincah di dalam lubang kunci... KLIK! Gembok besi berhasil terbongkar!');
    }
    S.flags[c.id] = true; spr.setTexture('chesto'); sfx('chest'); G.lock++;
    this.sparkle(c.x, c.y - 10, 'doto', 12); await sleep(300);
    const G2 = {
      iron: ['isword', 1], ether2: ['ether', 2], ether3: ['ether', 3], potion2: ['potion', 2], potion3: ['potion', 3],
      hipotion2: ['hipotion', 2], ring: ['ring', 1], shield: ['cshield', 1], key: ['key', 1], mring: ['mring', 1],
      antidote3: ['antidote', 3], fspear: ['fspear', 1]
    }[c.item] || (ITEMS[c.item] && [c.item, 1]);
    let msg;
    if (c.item.startsWith('gold')) { const n = +c.item.slice(4); S.gold += n; msg = `Dapat ${n} G!`; }
    else {
      addItem(G2[0], G2[1]);
      const it = ITEMS[G2[0]];
      msg = `Dapat ${it.n}${G2[1] > 1 ? ' x' + G2[1] : ''}!` +
        (it.k === 'wpn' || it.k === 'arm' || it.k === 'acc' ? ' Pasang lewat TAS.' : '');
    }
    updHud(); await say(msg); G.lock--;
  },
});

// Teka-teki Pilar Runa Kuno Reruntuhan Aurel (#65)
// Urutan aktivasi: Api -> Es -> Cahaya
async function interactRunePillar(sc, spr, elem, x, y) {
  if (G.lock > 0) return;
  G.lock++;
  S.runePillars = S.runePillars || {};
  S.runePillars.lit = S.runePillars.lit || {};
  if (S.runePillars.step == null) S.runePillars.step = 0;

  if (S.runePillars.solved) {
    G.lock--;
    return say('Ketiga Pilar Runa telah menyala seimbang. Cahaya kuno telah terbangun.');
  }

  const expectedOrder = ['fire', 'ice', 'light'];
  const curExpected = expectedOrder[S.runePillars.step || 0];

  if (elem === curExpected) {
    sfx('magic');
    sc.sparkle(x, y - 10, 'spark', 14);
    spr.setTint(0xffffff);
    popWorld(x, y - 20, `✨ ${elem.toUpperCase()} AKTIF!`, 'heal');
    S.runePillars.lit[elem] = true;
    S.runePillars.step = (S.runePillars.step || 0) + 1;

    if (S.runePillars.step >= 3) {
      // Selesai teka-teki!
      S.runePillars.solved = true;
      sfx('save');
      sc.cameras.main.flash(300, 255, 255, 230);
      sc.camShake(180, 0.008);
      // Munculkan peti harta kuno di tengah altar Reruntuhan Aurel (sesuaikan offset di mode benua)
      const [ox, oy] = (sc.M && sc.M.benua && typeof WORLD_POS !== 'undefined' && WORLD_POS.deepwood) ? WORLD_POS.deepwood : [0, 0];
      const cx = 520 + ox, cy = 290 + oy;
      const secretChest = { id: 'aurel_rune_chest', x: cx, y: cy, item: 'leg_sun' };
      const sp = sc.spawnChest(secretChest);
      sc.sparkle(cx, cy - 10, 'doto', 24);
      sp.setAlpha(0);
      sc.tweens.add({ targets: sp, alpha: 1, duration: 600 });
      saveGame(sc);
      await say('DENGG!! Gema lonceng kuno berdentang di reruntuhan Aurel! Sebuah peti pusaka agung muncul di tengah altar pilar!');
    } else {
      await say(`Pilar ${elem === 'fire' ? 'Api' : 'Es'} menyala terang memancarkan aura magis. Lanjutkan urutan berikutnya!`);
    }
  } else {
    // Salah urutan: reset
    sfx('buzz');
    sc.camShake(100, 0.004);
    popWorld(x, y - 20, 'URUTAN SALAH!', 'crit');
    S.runePillars.step = 0;
    S.runePillars.lit = {};
    await say('ZZZT! Energi runa menolak getaran dan padam kembali! Perhatikan petunjuk prasasti kuno.');
  }
  G.lock--;
}
