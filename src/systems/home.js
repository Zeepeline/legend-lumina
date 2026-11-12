'use strict';
// Gelombang 7: Rumah Arka (#46), peti penyimpanan (#32), perluasan (#492), tata perabot bebas (#493),
// dapur rumah (#497), bengkel rumah (#498)
const HOME_PRICE = 250, HOME_CAP = [6, 10, 14], HOME_EXT = [0, 300, 600];
const FCAT = {
  bed: { n: 'Ranjang', p: 60, w: 22, h: 36, act: 'sleep', d: 'Tidur memulihkan HP & MP lalu menyimpan permainan.' },
  table: { n: 'Meja', p: 30, w: 34, h: 22 },
  shelf: { n: 'Rak Buku', p: 40, w: 36, h: 28, wallOnly: 1 },
  rug: { n: 'Karpet', p: 25, w: 56, h: 34, flat: 1 },
  stove: { n: 'Tungku Dapur', p: 80, w: 30, h: 30, act: 'cook', d: 'Memasak di rumah sendiri.' },
  craft: { n: 'Meja Kerajinan', p: 90, w: 26, h: 22, tex: 'crafttable', act: 'craft', d: 'Membuat barang dari bahan.' },
  box: { n: 'Peti Penyimpanan', p: 50, w: 18, h: 16, tex: 'chest', act: 'box', d: 'Simpan barang agar tas lebih lega.' },
  alchemy: { n: 'Meja Alkimia', p: 100, w: 26, h: 22, tex: 'fieldoven', act: 'alchemy', d: 'Meracik ramuan eksperimen di rumah.' },
  trophy: { n: 'Rak Trofi Kayu', p: 90, w: 24, h: 22, tex: 'shelf', act: 'trophy', d: 'Pajang piala, fosil, atau permata legendaris.' },
  wardrobe: { n: 'Lemari Pakaian', p: 80, w: 24, h: 32, tex: 'shelf', act: 'wardrobe', d: 'Ganti warna jubah Arka.' },
  plant: { n: 'Pot Tanaman', p: 15, w: 28, h: 20, tex: 'i_planter' },
};
const ROOM_IN = { x: 58, y: 84, r: 262, b: 238 }, DOOR_LANE = { x: 128, y: 196, r: 192, b: 260 };
MAPS.home = makeRoom('home', 'Rumah Arka', [874, 250], { wallc: '#ead6b6', furn: [], windows: [110, 190], npcs: [] });
function homeInit() {
  if (!S.home) S.home = { owned: 0, lv: 0, items: [], box: {} };
  // Default ranjang & lemari pakaian untuk rumah
  if (S.home.items && S.home.items.length === 0 && S.home.owned) {
    S.home.items.push({ t: 'bed', x: 62, y: 90, v: 0 });
    S.home.items.push({ t: 'wardrobe', x: 236, y: 86, v: 0 });
  }
  return S.home;
}
function furnTex(sc, t, v) {
  const C = FCAT[t]; if (C.tex) return C.tex; const key = 'hf_' + t + (v ? 1 : 0);
  if (!sc.textures.exists(key)) { const [c, x] = mk(C.w + 2, C.h + 2); drawFurn(x, t, 1, 1, v); sc.textures.addCanvas(key, c); }
  return key;
}
Object.assign(World.prototype, {
  spawnHome() {
    this.hf = []; this.carry = null; if (this.M.id !== 'home') return; const H = homeInit();
    this.inter.push({ x: 160, y: 86, r: 18, fn: () => this.homeMenu() });
    const b = this.add.text(160, 66, '📋', { fontSize: '12px' }).setOrigin(.5).setDepth(70);
    for (const f of H.items) this.placeFurnSprite(f);

    // Tamu Warga Berkunjung ke Rumah (#500)
    // Sore hari antara jam 16:00 - 18:00
    if (S.time >= 16 && S.time <= 18 && (S.side?.mochi >= 3 || S.flags?.bridge_fixed || S.stage >= 2)) {
      const visitors = [
        { id: 'lina', name: 'Lina', ch: 'girl', msg: 'Arka! Kebetulan lewat, aku mampir melihat rumahmu yang rapi ini. Mochi juga tampak senang sekali di sini!', gift: 'berry', n: 3 },
        { id: 'rina', name: 'Bu Rina', ch: 'inn', msg: 'Sore Arka! Dapur penginapan baru saja masak sup hangat. Ini bekal makan malam untukmu, jangan lupa istirahat!', gift: 'stew', n: 1 },
        { id: 'elder', name: 'Tetua Bram', ch: 'elder', msg: 'Arka, langkahmu menjaga ketenteraman desa sangat berarti bagi kami semua. Teruslah berjalan dengan dada tegak.', gift: 'tea', n: 1 }
      ];
      // Tampilkan 1 pengunjung sore jika beruntung
      const v = visitors[Math.floor(Math.random() * visitors.length)];
      const vx = 140, vy = 150;
      this.spawnNpc({ id: 'guest_' + v.id, ch: v.ch, name: v.name + ' (Tamu Sore)', x: vx, y: vy, dir: 'down', wander: 0 });
      this.inter.push({
        x: vx, y: vy + 4, r: 20,
        fn: async () => {
          G.lock++;
          sfx('talk');
          await say(v.msg, v.name);
          if (!this._guestGift) {
            this._guestGift = true;
            if (v.gift) {
              addItem(v.gift, v.n);
              sfx('chest');
              popWorld(vx, vy - 20, `+${v.n} ${ITEMS[v.gift]?.n || v.gift}!`, 'heal');
              await say(`${v.name} membawakan buah tangan: +${v.n} ${ITEMS[v.gift]?.n || v.gift}!`);
            }
          }
          G.lock--;
        }
      });
    }
  },
  placeFurnSprite(f) {
    const C = FCAT[f.t], s = this.add.image(f.x, f.y, furnTex(this, f.t, f.v)).setOrigin(0, 0).setDepth(C.flat ? -5e5 : f.y + C.h);
    if (C.tex) { s.setOrigin(.5, 1).setPosition(f.x + C.w / 2, f.y + C.h); if (f.v) s.setFlipX(true); }
    const o = { f, s, wall: C.flat ? null : this.wall(f.x, f.y + C.h * .4, C.w, C.h * .6) };
    if (C.act) this.inter.push(o.it = { x: f.x + C.w / 2, y: f.y + C.h + 6, r: 16, fn: () => this.useFurn(o) });
    this.hf.push(o); return o;
  },
  removeFurnSprite(o) { o.s.destroy(); if (o.wall) this.walls.remove(o.wall, true, true); if (o.it) this.inter = this.inter.filter(i => i !== o.it); this.hf = this.hf.filter(x => x !== o); },
  async useFurn(o) {
    const a = FCAT[o.f.t].act; G.lock++;
    try {
      if (a === 'sleep') { await fadeTo(1); sleepToMorning(); const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp; updHud(); sfx('heal'); await sleep(500); await fadeTo(0); saveGame(this); sfx('save'); await say('Tidur di ranjang sendiri memang paling nyenyak. Permainan tersimpan.', 'Rumah'); }
      else if (a === 'cook') await cookMenu('Dapur Rumah Arka', 'Arka');
      else if (a === 'craft') await openCraft(this);
      else if (a === 'alchemy') await openAlchemyTable();
      else if (a === 'trophy') await this.useTrophyShelf(o);
      else if (a === 'wardrobe') await this.useWardrobe();
      else if (a === 'box') await openBox();
    } finally { G.lock--; }
  },
  async useTrophyShelf(o) {
    const H = homeInit();
    H.trophies = H.trophies || {};
    const cur = H.trophies[o.f.x + '_' + o.f.y];
    if (cur) {
      if (await ask(`Rak memajang: ${ITEMS[cur]?.n || cur}. Ambil kembali ke tas?`)) {
        addItem(cur, 1);
        delete H.trophies[o.f.x + '_' + o.f.y];
        sfx('ok');
        updHud();
        await say(`Kamu mengambil kembali ${ITEMS[cur]?.n || cur} dari rak trofi.`);
      }
      return;
    }
    const TROPHY_CANDIDATES = ['mini_trophy', 'fossil_ammonite', 'lake_pearl', 'amethyst_gem', 'gfish', 'aurelring'];
    const available = TROPHY_CANDIDATES.filter(id => has(id));
    if (!available.length) {
      await say('Kamu belum memiliki barang trofi koleksi di tas (Piala Martil, Fosil Amonit, Mutiara Danau, Permata Kecubung, atau Ikan Emas).');
      return;
    }
    const items = available.map(id => ({ t: icon(id) + ITEMS[id].n, r: 'Punya x' + S.inv[id] }));
    items.push({ t: 'Batal' });
    const r = await choose({
      head: 'Pilih Trofi untuk Dipajang',
      x: 30, y: 50, w: 220,
      items,
      foot: () => 'Pajang kebanggaan petualanganmu di dinding rumah.'
    });
    if (r < 0 || r >= available.length) return;
    const chosen = available[r];
    addItem(chosen, -1);
    H.trophies[o.f.x + '_' + o.f.y] = chosen;
    sfx('chest');
    updHud();
    await say(`KLIK! ${ITEMS[chosen].n} berhasil dipajang anggun di atas rak trofi!`);
  },
  async homeMenu() {
    const H = homeInit(); G.lock++;
    try {
      for (; ;) {
        const cap = HOME_CAP[H.lv], next = HOME_EXT[H.lv + 1];
        const r = await choose({ head: `Rumah Arka · perabot ${H.items.length}/${cap}`, x: 30, y: 50, w: 250,
          items: [{ t: 'Beli perabot' }, { t: 'Tata perabot', dis: !H.items.length }, { t: 'Simpan perabot ke gudang', dis: !H.items.length }, { t: next ? 'Perluas rumah' : 'Rumah sudah paling luas', r: next ? next + ' G' : '', dis: !next }, { t: 'Tutup' }],
          foot: i => ['Perabot muncul di depanmu. A: taruh · DASH: putar · B: batal', 'Pilih perabot lalu pindahkan', 'Perabot kembali ke gudang (uang tidak kembali, bisa dipasang lagi)', 'Menambah batas perabot', ''][i] || '' });
        if (r === 0) { const t = await this.pickCatalog(); if (t) { this.startCarry({ t, x: 0, y: 0, v: 0 }, true); return; } }
        else if (r === 1) { const o = await this.pickPlaced('Tata yang mana?'); if (o) { this.removeFurnSprite(o); H.items = H.items.filter(f => f !== o.f); this.startCarry(o.f, false); return; } }
        else if (r === 2) { const o = await this.pickPlaced('Simpan yang mana?'); if (o) { this.removeFurnSprite(o); H.items = H.items.filter(f => f !== o.f); H.store = H.store || {}; H.store[o.f.t] = (H.store[o.f.t] || 0) + 1; sfx('ok'); } }
        else if (r === 3) { if (S.gold < next) { sfx('buzz'); await say('Uangmu belum cukup.', 'Tukang'); continue; } S.gold -= next; H.lv++; updHud(); sfx('chest'); await say(`Rumah diperluas! Sekarang muat ${HOME_CAP[H.lv]} perabot.`, 'Tukang'); }
        else return;
      }
    } finally { G.lock--; }
  },
  async pickCatalog() {
    const H = homeInit(), keys = Object.keys(FCAT), st = H.store || {};
    if (H.items.length >= HOME_CAP[H.lv]) { sfx('buzz'); await say('Rumah sudah penuh. Perluas rumah atau simpan perabot ke gudang.', 'Rumah'); return null; }
    const r = await choose({ head: 'Katalog perabot · ' + S.gold + ' G', x: 24, y: 30, w: 270, items: [...keys.map(k => ({ t: FCAT[k].n, r: st[k] ? 'gudang ×' + st[k] : FCAT[k].p + ' G' })), { t: 'Kembali' }], foot: i => i < keys.length ? (FCAT[keys[i]].d || 'Hiasan rumah.') : '' });
    if (r < 0 || r >= keys.length) return null; const k = keys[r];
    if (st[k]) { st[k]--; if (!st[k]) delete st[k]; return k; }
    if (S.gold < FCAT[k].p) { sfx('buzz'); await say('Uangmu belum cukup.', 'Rumah'); return null; }
    S.gold -= FCAT[k].p; updHud(); sfx('chest'); return k;
  },
  async pickPlaced(head) {
    const L = this.hf; const r = await choose({ head, x: 30, y: 50, w: 230, items: [...L.map(o => ({ t: FCAT[o.f.t].n })), { t: 'Batal' }] });
    return r >= 0 && r < L.length ? L[r] : null;
  },
  startCarry(f, isNew) {
    const C = FCAT[f.t], s = this.add.image(0, 0, furnTex(this, f.t, f.v)).setOrigin(0, 0).setAlpha(.75).setDepth(9e4);
    this.carry = { f, s, isNew }; popWorld(this.pl.x, this.pl.y - 34, 'A: taruh · DASH: putar · B: batal', 'xp');
  },
  furnOk(f) {
    const C = FCAT[f.t], r = { x: f.x, y: f.y, r: f.x + C.w, b: f.y + C.h };
    if (r.x < ROOM_IN.x || r.r > ROOM_IN.r || r.y < ROOM_IN.y || r.b > ROOM_IN.b) return false;
    if (C.wallOnly && r.y > ROOM_IN.y + 4) return false;
    if (!C.flat && r.x < DOOR_LANE.r && r.r > DOOR_LANE.x && r.b > DOOR_LANE.y) return false;
    if (!C.flat) { for (const o of this.hf) { const D = FCAT[o.f.t]; if (D.flat) continue; if (r.x < o.f.x + D.w && r.r > o.f.x && r.y < o.f.y + D.h && r.b > o.f.y) return false; }
      const p = this.pl; if (p.x > r.x - 4 && p.x < r.r + 4 && p.y > r.y + C.h * .4 - 4 && p.y < r.b + 4) return false; }
    if (r.x < 176 && r.r > 144 && r.y < 104) return false; // papan rumah
    return true;
  },
  updCarry() {
    const c = this.carry; if (!c) return; const C = FCAT[c.f.t], [dx, dy] = DIRV[this.pl.dir];
    let x = this.pl.x + dx * (C.w / 2 + 14) - C.w / 2, y = this.pl.y + dy * (C.h / 2 + 12) - C.h + (dy < 0 ? 0 : 8);
    if (C.wallOnly) y = ROOM_IN.y; x = Math.round(x / 4) * 4; y = Math.round(y / 4) * 4;
    c.f.x = x; c.f.y = y; c.s.setPosition(x, y); c.ok = this.furnOk(c.f); c.s.setTint(c.ok ? 0xffffff : 0xff6a5a);
  },
  carryKey(k) {
    const c = this.carry; if (!c) return false;
    if (k === 'a') { if (!c.ok) { sfx('buzz'); popWorld(this.pl.x, this.pl.y - 30, 'Tidak muat di sini', 'hurt'); return true; } c.s.destroy(); this.carry = null; homeInit().items.push(c.f); this.placeFurnSprite(c.f); sfx('ok'); saveGame(this); return true; }
    if (k === 'dash') { c.f.v = c.f.v ? 0 : 1; const C = FCAT[c.f.t]; if (C.tex) c.s.setFlipX(!!c.f.v); else c.s.setTexture(furnTex(this, c.f.t, c.f.v)); sfx('cur'); return true; }
    if (k === 'b') { c.s.destroy(); this.carry = null; const H = homeInit(); if (c.isNew) { H.store = H.store || {}; H.store[c.f.t] = (H.store[c.f.t] || 0) + 1; popWorld(this.pl.x, this.pl.y - 30, 'disimpan ke gudang', 'xp'); } else { H.items.push(c.f); this.placeFurnSprite(c.f); } sfx('back'); return true; }
    return false;
  },
});
World.prototype.useWardrobe = async function () {
  const outfits = [
    { id: 'default', n: 'Jubah Petualang (Biru Standar)', tint: 0xffffff },
    { id: 'fire', n: 'Jubah Mentari (Merah Api)', tint: 0xff7777 },
    { id: 'forest', n: 'Jubah Belantara (Hijau Hutan)', tint: 0x88ff88 },
    { id: 'snow', n: 'Jubah Puncak (Putih Salju)', tint: 0xe0f7fa },
    { id: 'shadow', n: 'Jubah Bayangan Senyap (Hitam Abu)', tint: 0x888899 }
  ];

  const items = outfits.map(o => ({
    t: (S.outfit === o.id ? '✓ ' : '  ') + o.n,
    r: S.outfit === o.id ? 'Dipakai' : ''
  }));
  items.push({ t: 'Tutup' });

  const r = await choose({
    head: 'Lemari Pakaian Arka · Warna Jubah',
    x: 20, y: 25, w: 275,
    items,
    foot: () => 'Kustomisasi penampilan Arka murni kosmetik tanpa merubah stat!'
  });

  if (r >= 0 && r < outfits.length) {
    S.outfit = outfits[r].id;
    sfx('ok');
    if (this.pl) {
      this.pl.setTint(outfits[r].tint);
    }
    popWorld(this.pl.x, this.pl.y - 20, 'Penampilan Diperbarui!', 'heal');
    saveGame(this);
  }
};

World.prototype.buyHome = async function () {
  if (G.lock) return; G.lock++;
  try {
    await say('Rumah kosong ini sudah lama tak berpenghuni. Ada papan: "Dijual. Hubungi kepala desa."', 'Rumah Kosong');
    const r = await choose({ head: 'Beli rumah ini?', x: 60, y: 70, w: 200, items: [{ t: 'Beli', r: HOME_PRICE + ' G' }, { t: 'Nanti saja' }] });
    if (r !== 0) { this.pl.y += 10; return; }
    if (S.gold < HOME_PRICE) { sfx('buzz'); await say(`Uangmu belum cukup (${S.gold}/${HOME_PRICE} G).`, 'Rumah Kosong'); this.pl.y += 10; return; }
    S.gold -= HOME_PRICE; homeInit().owned = 1; updHud(); sfx('chest');
    await say('Rumah ini sekarang milikmu! Masuk dan tata sesukamu lewat papan 📋 di dinding.', 'Rumah Arka');
  } finally { G.lock--; }
  if (homeInit().owned) this.goto('home', 160, 226, 'up');
};
async function openBox() {
  const B = homeInit().box; let mode = 0;
  for (; ;) {
    const src = mode ? B : S.inv, ids = Object.keys(src).filter(id => src[id] > 0 && ITEMS[id] && ITEMS[id].k !== 'key' && !(mode === 0 && (S.eq.wpn === id || S.eq.arm === id || S.eq.acc === id)));
    const r = await choose({ head: mode ? 'Peti · ambil barang' : 'Peti · simpan barang', x: 24, y: 30, w: 270,
      items: [{ t: mode ? '⇄ Ganti ke: Simpan' : '⇄ Ganti ke: Ambil' }, ...ids.map(id => ({ t: icon(id) + ITEMS[id].n, r: 'x' + src[id] })), { t: 'Tutup' }], foot: () => 'A: pindahkan 1 · isi peti tidak hilang' });
    if (r < 0 || r > ids.length) return; if (r === 0) { mode ^= 1; continue; }
    const id = ids[r - 1]; if (mode) { B[id]--; if (!B[id]) delete B[id]; addItem(id, 1); } else { addItem(id, -1); B[id] = (B[id] || 0) + 1; } sfx('cur'); updHud();
  }
}
