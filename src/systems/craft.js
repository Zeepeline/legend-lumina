'use strict';
// Gelombang 5: poin atribut (#16), kerajinan (#26), bom & alat lempar (#29, #407),
// slot alat cepat (#30), anak panah buatan (#411), umpan pancing (#412)
Object.assign(ITEMS, {
  bomb: { n: 'Bom Api', k: 'use', tool: 'bomb', price: 20, sell: 8, d: 'Lempar ke depan. Meledak membakar musuh di sekitarnya.' },
  smoke: { n: 'Bom Asap', k: 'use', tool: 'smoke', price: 14, sell: 5, d: 'Kepulan asap membuat musuh di sekitarmu bingung dan diam sesaat.' },
  net: { n: 'Jaring', k: 'use', tool: 'net', price: 16, sell: 6, d: 'Lempar ke depan. Menjerat musuh pertama yang kena selama 3 detik.' },
  sarrow: { n: 'Panah Tajam', k: 'mat', price: 3, sell: 1, d: 'Dipakai otomatis saat memanah: kerusakan ×1,6 dan menembus musuh.' },
  bait: { n: 'Umpan Pancing', k: 'mat', price: 4, sell: 1, d: 'Dipakai otomatis saat memancing: ikan langka lebih sering datang.' },
});
Object.assign(ICON_MAP, {
  bomb: ['....K.....', '....YK....', '...DDDD...', '..DCCCCD..', '.DCLCCCCD.', '.DCCCCCCD.', '.DCCCCCCD.', '..DCCCCD..', '...DDDD...'],
  net: ['..........', '.K.K.K.K..', 'K.K.K.K.K.', '.K.K.K.K..', 'K.K.K.K.K.', '.K.K.K.K..', 'K.K.K.K.K.', '..........'],
  arrowi: ['.........W', '........WW', '.......K..', '......K...', '.....K....', '....K.....', 'F..K......', 'FFK.......', '.FF.......'],
});
Object.assign(ICONS_DEF, {
  bomb: ['bomb', { C: '#3a3446', L: '#8a8098', D: '#1a1622', K: '#6a4a2a', Y: '#ffb03a' }],
  smoke: ['bomb', { C: '#a8a8b0', L: '#e8e8f0', D: '#5a5a66', K: '#6a4a2a', Y: '#d8d8e0' }],
  net: ['net', { K: '#c8a870' }],
  sarrow: ['arrowi', { K: '#8a5a2a', W: '#ffe08a', F: '#ffffff' }],
  bait: ['blob', { C: '#c84a7a', L: '#ff9ac0', D: '#7a2a4a', E: '#3a1a2a' }],
});
const CRAFT = [
  { id: 'potion', n: 1, need: { herb: 3 } },
  { id: 'antidote', n: 1, need: { herb: 1, berry: 1 } },
  { id: 'bomb', n: 1, need: { ore: 1, spore: 1 } },
  { id: 'smoke', n: 2, need: { spore: 1, herb: 1 } },
  { id: 'net', n: 1, need: { pelt: 1, wool: 1 } },
  { id: 'sarrow', n: 5, need: { feather: 1, bone: 1 } },
  { id: 'bait', n: 3, need: { berry: 1, jelly: 1 } },
];
const ATTR = [['str', 'Kekuatan', '+1 serangan'], ['int', 'Sihir', '+2 kekuatan sihir'], ['vit', 'Ketahanan', '+5 HP maks & +0,5 pertahanan'], ['agi', 'Kelincahan', '+1% kecepatan & +1% kritikal']];
function attrInit() {
  if (!S.attr) S.attr = { str: 0, int: 0, vit: 0, agi: 0 };
  const spent = Object.values(S.attr).reduce((a, b) => a + b, 0), total = (S.lv - 1) * 3;
  S.ap = Math.max(0, total - spent);
}
// tambahkan atribut ke stat() tanpa mengubah rumus lama
const _statBase = stat;
stat = function () {
  const s = _statBase(); const a = S && S.attr; if (!a) return s;
  s.atk += a.str; s.mag += a.int * 2; s.maxhp += a.vit * 5; s.def += Math.floor(a.vit * .5);
  s.spd = Math.round((s.spd + Math.min(.3, a.agi * .01)) * 100) / 100; s.crit = a.agi * .01; return s;
};
async function openAttr() {
  attrInit(); let sel = 0;
  for (; ;) {
    const st = stat();
    const r = await choose({ head: `Atribut · sisa poin: ${S.ap}`, sel, x: 30, y: 50, w: 260,
      items: [...ATTR.map(([k, n]) => ({ t: n, r: '' + S.attr[k], dis: !S.ap })), { t: 'Tutup' }],
      foot: i => i < 4 ? ATTR[i][2] + `<br>ATK ${st.atk} · MAG ${st.mag} · HP ${st.maxhp} · DEF ${st.def}` : 'Tiap naik level dapat 3 poin.' });
    if (r < 0 || r >= 4) return; sel = r;
    if (!S.ap) { sfx('buzz'); continue; }
    S.attr[ATTR[r][0]]++; S.ap--; sfx('ok'); updHud();
  }
}
const canCraft = R => Object.entries(R.need).every(([k, n]) => has(k, n));
async function openCraft(sc) {
  let sel = 0;
  for (; ;) {
    const r = await choose({ head: 'Kerajinan', sel, x: 20, y: 40, w: 280,
      items: [...CRAFT.map(R => ({ t: icon(R.id) + ITEMS[R.id].n + (R.n > 1 ? ' ×' + R.n : ''), r: 'x' + (S.inv[R.id] || 0), dis: !canCraft(R) })), { t: 'Atur slot alat' }, { t: 'Tutup' }],
      foot: i => { if (i >= CRAFT.length) return i === CRAFT.length ? 'Pilih alat untuk 2 tombol cepat' : ''; const R = CRAFT[i]; return ITEMS[R.id].d + '<br>Bahan: ' + Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · '); } });
    if (r < 0 || r > CRAFT.length) return;
    if (r === CRAFT.length) { await openToolSlots(); continue; }
    sel = r; const R = CRAFT[r];
    if (!canCraft(R)) { sfx('buzz'); continue; }

    // Fitur #388: Buat Banyak Sekaligus (Batch Crafting)
    const maxBatch = Math.min(...Object.entries(R.need).map(([k, n]) => Math.floor((S.inv[k] || 0) / n)));
    let makeCount = 1;
    if (maxBatch > 1) {
      const opts = [{ t: 'Buat 1x (' + R.n + ' barang)', n: 1 }];
      if (maxBatch >= 5) opts.push({ t: 'Buat 5x (' + (R.n * 5) + ' barang)', n: 5 });
      opts.push({ t: 'Buat Maksimal ' + maxBatch + 'x (' + (R.n * maxBatch) + ' barang)', n: maxBatch });
      opts.push({ t: 'Batal', n: 0 });
      const bRes = await choose({ head: 'Jumlah Produksi · ' + ITEMS[R.id].n, x: 40, y: 50, w: 220, items: opts });
      if (bRes < 0 || opts[bRes].n === 0) continue;
      makeCount = opts[bRes].n;
    }

    for (const [k, n] of Object.entries(R.need)) addItem(k, -(n * makeCount));
    addItem(R.id, R.n * makeCount); sfx('chest'); S.crafted = (S.crafted || 0) + (R.n * makeCount);
    S.st = S.st || {}; S.st.crafted = (S.st.crafted || 0) + (R.n * makeCount);
    if (ITEMS[R.id].tool || R.id === 'potion') { S.tools = S.tools || [null, null]; if (!S.tools.includes(R.id)) { const i = S.tools.indexOf(null); if (i >= 0) S.tools[i] = R.id; } }
    updToolBtns();
  }
}
async function openToolSlots() {
  S.tools = S.tools || [null, null];
  for (; ;) {
    const r = await choose({ head: 'Slot alat cepat', x: 30, y: 60, w: 250, items: [0, 1].map(i => ({ t: 'Slot ' + (i + 1), r: S.tools[i] ? ITEMS[S.tools[i]].n : '(kosong)' })).concat([{ t: 'Kembali' }]) });
    if (r < 0 || r > 1) return;
    const opts = Object.keys(ITEMS).filter(id => ITEMS[id].k === 'use' && has(id));
    const c = await choose({ head: 'Isi slot ' + (r + 1), x: 40, y: 70, w: 240, items: [...opts.map(id => ({ t: icon(id) + ITEMS[id].n, r: 'x' + S.inv[id] })), { t: '(kosongkan)' }] });
    if (c < 0) continue; S.tools[r] = c < opts.length ? opts[c] : null; sfx('ok'); updToolBtns();
  }
}
function updToolBtns() {
  for (const i of [0, 1]) {
    const b = document.getElementById('bX' + (i + 1)); if (!b) continue;
    const id = S && S.tools && S.tools[i];
    if (!id) { b.style.display = 'none'; continue; }
    b.style.display = ''; b.innerHTML = `${icon(id)}<small>${S.inv[id] || 0}</small>`; b.classList.toggle('empty', !has(id));
  }
}
Object.assign(World.prototype, {
  useSlot(i) {
    const id = S.tools && S.tools[i]; if (!id) return;
    if (!has(id)) { popWorld(this.pl.x, this.pl.y - 30, ITEMS[id].n + ' habis', 'hurt'); sfx('buzz'); return; }
    this.useItem(id); updToolBtns();
  },
  useTool(id) {
    const pl = this.pl; if (pl.atkCd > 0) return false; pl.atkCd = .45;
    if (id === 'hearthstone') {
      G.lock++;
      sfx('save');
      popWorld(pl.x, pl.y - 28, 'Membaca Mantra Kepulangan...', 'mpc');
      this.sparkle(pl.x, pl.y - 10, 'dot', 16);
      this.time.delayedCall(1200, () => {
        G.lock--;
        if (!pl.dead && !this.trans) {
          sfx('heal');
          this.goto('village', 512, 380, 'down');
          popWorld(512, 360, 'Tiba di Depan Rumah Arka!', 'heal');
        }
      });
      return true;
    }
    const kind = ITEMS[id].tool, a = this.aimAngle(), dx = Math.cos(a), dy = Math.sin(a), st = stat();
    addItem(id, -1); updHud(); updToolBtns();
    if (kind === 'smoke') {
      sfx('spore'); for (let i = 0; i < 10; i++) this.puff(pl.x + rnd(-40, 40), pl.y + rnd(-30, 20));
      for (const e of this.enemies) if (e.hp > 0 && Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) < 95) { this.freezeEnemy(e, 2.5); e.alert = 0; }
      popWorld(pl.x, pl.y - 34, 'asap!', 'xp'); return true;
    }
    // bom & jaring: terbang melengkung ke titik tujuan
    const R = kind === 'bomb' ? 80 : 110, tx = pl.x + dx * R, ty = pl.y + dy * R;
    const o = this.add.image(pl.x, pl.y - 10, kind === 'bomb' ? 'dot' : 'spark').setTint(kind === 'bomb' ? 0x3a2a2a : 0xe8dcc0).setScale(kind === 'bomb' ? 3 : 1.4).setDepth(pl.y + 20);
    sfx('swing');
    const p = { t: 0 };
    this.tweens.add({ targets: p, t: 1, duration: 420, onUpdate: () => { o.setPosition(pl.x + (tx - pl.x) * p.t, pl.y - 10 + (ty - pl.y) * p.t - Math.sin(p.t * Math.PI) * 30); o.rotation += .3;
        if (kind === 'net') {
          // Tangkap serangga liar (#54)
          const bugs = ['bug_beetle', 'bug_butterfly', 'bug_dragonfly', 'bug_firefly'];
          const hitCritter = this.critters.find(c => Math.hypot(c.s.x - o.x, c.s.y - o.y) < 22);
          if (hitCritter) {
            hitCritter.s.destroy();
            this.critters = this.critters.filter(c => c !== hitCritter);
            const gainedBug = bugs[ri(0, bugs.length - 1)];
            addItem(gainedBug, 1);
            sfx('ok');
            popWorld(o.x, o.y - 18, `+1 ${ITEMS[gainedBug].n}!`, 'heal');
            p.hit = 1; this.tweens.killTweensOf(p); o.destroy();
            return;
          }
          const e = this.enemies.find(e => e.hp > 0 && !e.netted && Math.hypot(e.spr.x - o.x, e.spr.y - 6 - o.y) < 16);
          if (e) { e.netted = 1; this.freezeEnemy(e, 3); popWorld(e.spr.x, e.spr.y - 24, 'terjerat!', 'mpc'); p.hit = 1; this.tweens.killTweensOf(p); o.destroy(); this.time.delayedCall(3000, () => e.netted = 0); }
        } },
      onComplete: () => {
        o.destroy(); if (kind !== 'bomb') return;
        this.time.delayedCall(250, () => {
          sfxAt('boom', tx, ty, this); this.blastAt(tx, ty); this.camShake(160, .007); this.sparkle(tx, ty - 6, 'doto', 18); for (let i = 0; i < 6; i++) this.puff(tx + rnd(-16, 16), ty + rnd(-10, 10));
          for (const e of this.enemies) if (e.hp > 0 && Math.hypot(e.spr.x - tx, e.spr.y - ty) < 44) { const n = Math.hypot(e.spr.x - tx, e.spr.y - ty) || 1; this.hitEnemy(e, 18 + st.mag * 1.2, false, (e.spr.x - tx) / n, (e.spr.y - ty) / n); this.burnEnemy(e, Math.max(2, st.mag * .25), 2.5); }
          if (Math.hypot(pl.x - tx, pl.y - ty) < 30) this.hurtPlayer(6, tx, ty);
        });
      } });
    return true;
  },
});
