'use strict';
// T506: Fasilitas Markas Rumah Arka (Stronghold) & T507: Ikatan Sekutu & Perbekalan Pagi
Object.assign(ITEMS, {
  elixir_vit: {
    n: 'Elixir Ketahanan', k: 'use', hp: 45, buff: [['def', 180]], price: 75, sell: 30,
    d: 'Racikan Tungku Alkimia Markas: pulihkan 45 HP & efek Kebal (+25% DEF) 3 menit.'
  },
  oil_fire: {
    n: 'Minyak Senjata Api', k: 'use', buff: [['fire_oil', 180]], price: 65, sell: 25,
    d: 'Oleskan ke senjata: serangan fisik membakar musuh selama 3 menit.'
  },
  oil_ice: {
    n: 'Minyak Senjata Es', k: 'use', buff: [['ice_oil', 180]], price: 65, sell: 25,
    d: 'Oleskan ke senjata: serangan fisik melambatkan musuh selama 3 menit.'
  },
});
Object.assign(ICONS_DEF, {
  elixir_vit: ['bigflask', { C: '#4aa8ff', L: '#b8e8ff', D: '#1e5088', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
  oil_fire: ['flask', { C: '#ff6a2a', L: '#ffc08a', D: '#882810', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
  oil_ice: ['flask', { C: '#6ad8ff', L: '#d8f8ff', D: '#246888', G: '#d8e8f0', W: '#ffffff', K: '#8a5a32' }],
});
const STRONGHOLD_STATIONS = [
  { key: 'alchemy', n: 'Tungku Alkimia Markas', ic: '⚗', cost: { ore: 2, herb: 2 }, gold: 60, d: 'Meracik Elixir Ketahanan & Minyak Senjata Api/Es.' },
  { key: 'anvil', n: 'Paron Tempa Markas', ic: '🔨', cost: { ore: 2, bone: 1 }, gold: 60, d: 'Mengasah senjata untuk buff Tajam (+10% ATK seharian).' },
  { key: 'mapTable', n: 'Meja Peta & Prasasti', ic: '🗺', cost: { ore: 1, spore: 2 }, gold: 50, d: 'Memantau lokasi bos/elit & kesiapan level wilayah.' },
];
const STRONGHOLD_ALCHEMY = [
  { id: 'elixir_vit', n: 1, need: { herb: 2, jelly: 1 } },
  { id: 'oil_fire', n: 1, need: { spore: 1, ore: 1 } },
  { id: 'oil_ice', n: 1, need: { shard: 1, herb: 1 } },
];
const ALLY_BONDS = [
  { id: 'merchant', name: 'Bu Sari', gift: [['herb', 2], ['seed_flower', 1]], recipe: { id: 'hipotion', n: 1, need: { potion: 1, herb: 2 } } },
  { id: 'smith', name: 'Pak Besi', gift: [['sarrow', 5], ['ore', 1]], recipe: { id: 'oil_fire', n: 2, need: { ore: 1, berry: 1 } } },
  { id: 'hermit', name: 'Pertapa Sura', gift: [['spore', 2], ['cave_moss', 1]], recipe: { id: 'elixir_vit', n: 1, need: { herb: 1, spore: 1 } } },
  { id: 'sambo', name: 'Sambo', gift: [['bait', 2], ['potion', 1]], recipe: { id: 'oil_ice', n: 2, need: { herb: 1, jelly: 1 } } },
];
function shInit() {
  if (!S.stronghold) S.stronghold = { alchemy: 0, anvil: 0, mapTable: 0, sharpenDay: 0 };
  return S.stronghold;
}
function activeAllies() {
  if (!S || !S.rel) return [];
  return ALLY_BONDS.filter(a => (S.rel[a.id] || 0) >= 3);
}
{
  const W = World.prototype;
  const spawnHome0 = W.spawnHome;
  W.spawnHome = function () {
    const r = spawnHome0.apply(this, arguments);
    if (this.M.id === 'home') {
      const sh = shInit();
      if (sh.alchemy) {
        const s = this.add.image(88, 128, 'fieldoven').setOrigin(.5, 1).setDepth(128);
        this.inter.push({ x: 88, y: 132, r: 18, fn: () => this.useStrongholdStation('alchemy') });
        this.hf.push({ f: { t: 'alchemy', x: 75, y: 106 }, s });
      }
      if (sh.anvil) {
        const s = this.add.image(232, 132, 'anvil').setOrigin(.5, 1).setDepth(132);
        this.inter.push({ x: 232, y: 136, r: 18, fn: () => this.useStrongholdStation('anvil') });
        this.hf.push({ f: { t: 'craft', x: 220, y: 112 }, s });
      }
      if (sh.mapTable) {
        const s = this.add.image(160, 122, 'crafttable').setOrigin(.5, 1).setDepth(122);
        this.inter.push({ x: 160, y: 126, r: 18, fn: () => this.useStrongholdStation('mapTable') });
        this.hf.push({ f: { t: 'table', x: 147, y: 102 }, s });
      }
    }
    if (this.M.id === 'village' || this.M.benua) {
      const ox = (this.M.benua && typeof WORLD_POS !== 'undefined' && WORLD_POS.village) ? WORLD_POS.village[0] : 0;
      const oy = (this.M.benua && typeof WORLD_POS !== 'undefined' && WORLD_POS.village) ? WORLD_POS.village[1] : 0;
      // Pekarangan Rumah Arka: papan Fasilitas Markas (T506) & Peti Perbekalan Sekutu (T507)
      const bx = ox + 482, by = oy + 564, cx = ox + 534, cy = oy + 564;
      this.add.image(bx, by, 'crafttable').setOrigin(.5, 1).setDepth(by);
      this.inter.push({ x: bx, y: by + 4, r: 18, fn: () => this.openStrongholdMenu() });
      this.add.image(cx, cy, 'chest').setOrigin(.5, 1).setDepth(cy);
      this.inter.push({ x: cx, y: cy + 4, r: 18, fn: () => this.claimAllyBox() });
    }
    return r;
  };
}
Object.assign(World.prototype, {
  async openStrongholdMenu() {
    const sh = shInit(); G.lock++;
    try {
      for (; ;) {
        const items = STRONGHOLD_STATIONS.map(st => ({
          t: `${st.ic} ${st.n}`,
          r: sh[st.key] ? 'Siap Pakai' : `Bangun (${st.gold} G)`
        }));
        items.push({ t: '📦 Peti Perbekalan Sekutu', r: activeAllies().length + ' Sekutu ♥♥♥' });
        items.push({ t: 'Tutup' });
        const r = await choose({
          head: 'Fasilitas Markas Rumah Arka', x: 20, y: 36, w: 276, items,
          foot: i => i < 3 ? STRONGHOLD_STATIONS[i].d : i === 3 ? 'Ambil kiriman bahan harian dari sekutu akrab (3 ♥).' : ''
        });
        if (r < 0 || r >= items.length - 1) return;
        if (r === 3) { await this.claimAllyBox(); continue; }
        const st = STRONGHOLD_STATIONS[r];
        if (!sh[st.key]) {
          const hasMat = Object.entries(st.cost).every(([k, n]) => has(k, n));
          const costTxt = Object.entries(st.cost).map(([k, n]) => `${ITEMS[k].n} x${n}`).join(' + ');
          if (!hasMat && S.gold < st.gold) {
            sfx('buzz');
            await say(`Butuh ${costTxt} (atau ${st.gold} G) untuk membangun ${st.n}.`, 'Markas');
            continue;
          }
          if (hasMat) { for (const [k, n] of Object.entries(st.cost)) addItem(k, -n); }
          else S.gold -= st.gold;
          sh[st.key] = 1; sfx('fanfare'); updHud();
          this.sparkle(this.pl.x, this.pl.y - 12, 'spark', 16);
          await say(`${st.n} selesai dibangun di Rumah Arka!`, 'Markas');
          if (this.M.id === 'home') this.spawnHome();
        } else {
          await this.useStrongholdStation(st.key);
        }
      }
    } finally { G.lock--; }
  },
  async useStrongholdStation(key) {
    const sh = shInit();
    if (!sh[key]) return this.openStrongholdMenu();
    if (key === 'anvil') {
      if (sh.sharpenDay === S.day) {
        await say('Senjatamu sudah diasah tajam hari ini (+10% ATK aktif seharian).', 'Paron Tempa Markas');
        return;
      }
      sh.sharpenDay = S.day; S.buff = S.buff || {}; S.buff.sharp = 900;
      sfx('crit'); this.sparkle(this.pl.x, this.pl.y - 12, 'spark', 14);
      popWorld(this.pl.x, this.pl.y - 28, 'Senjata Tajam! +10% ATK', 'crit');
      updStatusHud(this); updHud();
      await say('SRING! Mata senjatamu diasah berkilau di Paron Markas (+10% ATK sepanjang hari ini)!', 'Paron Tempa Markas');
      return;
    }
    if (key === 'mapTable') {
      const regs = Object.entries(typeof LEVEL_WILAYAH !== 'undefined' ? LEVEL_WILAYAH : { village: 1, forest: 3, meadow: 5, cave: 7, swamp: 8, snow: 10 });
      const lines = regs.slice(0, 7).map(([id, lv]) => {
        const nm = (MAPS[id] && MAPS[id].name) || id;
        const ok = S.lv >= lv ? '✅ Siap' : `⚠ Lv ${lv}`;
        return `• ${nm}: ${ok}`;
      }).join('\n');
      const r = await choose({
        head: 'Meja Peta & Prasasti Markas', x: 24, y: 44, w: 268,
        items: [{ t: '🗺 Lihat Kesiapan Wilayah' }, { t: '⚔ Ujian Bayangan (Tantang Elit)' }, { t: 'Tutup' }],
        foot: () => 'Pantau wilayah atau uji build melawan proyeksi musuh tangguh.'
      });
      if (r === 0) await say(`Peta Taktis Benua Lumina (Arka Lv ${S.lv}):\n${lines}`, 'Meja Peta & Prasasti');
      else if (r === 1 && this.startShadowTrial) await this.startShadowTrial();
      return;
    }
    // Tungku Alkimia Markas (termasuk resep sekutu bila sudah 3 ♥)
    const list = [...STRONGHOLD_ALCHEMY];
    for (const a of activeAllies()) if (a.recipe) list.push(a.recipe);
    for (; ;) {
      const items = list.map(R => ({
        t: icon(R.id) + ITEMS[R.id].n + (R.n > 1 ? ' ×' + R.n : ''),
        r: 'x' + (S.inv[R.id] || 0),
        dis: !canCraft(R)
      }));
      items.push({ t: 'Tutup' });
      const c = await choose({
        head: 'Tungku Alkimia Markas', x: 20, y: 40, w: 276, items,
        foot: i => i < list.length
          ? ITEMS[list[i].id].d + '<br>Bahan: ' + Object.entries(list[i].need).map(([k, n]) => `${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · ')
          : 'Racik ramuan tempur & minyak senjata.'
      });
      if (c < 0 || c >= list.length) break;
      const R = list[c];
      if (!canCraft(R)) { sfx('buzz'); continue; }
      for (const [k, n] of Object.entries(R.need)) addItem(k, -n);
      addItem(R.id, R.n); sfx('chest'); updHud();
      popWorld(this.pl.x, this.pl.y - 26, '+' + ITEMS[R.id].n, 'heal');
    }
  },
  async claimAllyBox() {
    const allies = activeAllies();
    if (!allies.length) {
      await say('Peti Sekutu masih kosong. Capai keakraban penuh (♥♥♥) dengan Bu Sari atau Pak Besi agar mereka mengirim bantuan setiap pagi!', 'Peti Sekutu');
      return false;
    }
    if (S.allyBoxDay === S.day) {
      await say('Kamu sudah mengambil kiriman perbekalan sekutu pagi ini. Tidurlah hingga esok pagi untuk kiriman berikutnya.', 'Peti Sekutu');
      return false;
    }
    S.allyBoxDay = S.day;
    const rec = [];
    for (const a of allies) {
      S.allyRecipes = S.allyRecipes || {}; S.allyRecipes[a.id] = 1;
      for (const [id, n] of a.gift) { addItem(id, n); rec.push(`${ITEMS[id]?.n || id} x${n}`); }
    }
    sfx('chest'); updHud();
    this.sparkle(this.pl.x, this.pl.y - 12, 'spark', 16);
    await say(`Kiriman pagi dari sekutu akrab (${allies.map(a => a.name).join(', ')}):\nDiterima: ${rec.join(', ')}!`, 'Peti Sekutu');
    return true;
  },
});
