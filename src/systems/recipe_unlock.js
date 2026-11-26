'use strict';
// H4a: Sistem Drop Resep Rahasia (Peti & Musuh Elit) + Kitab Miasma & Buku Resep diperluas
if (typeof BUFF !== 'undefined') BUFF.poison_oil = { n: 'Minyak Bisa', ic: '☣' };
Object.assign(ITEMS, {
  panah_racun: {
    n: 'Minyak Bisa Panah', k: 'use', buff: [['poison_oil', 90]], price: 45, sell: 18,
    d: 'Olesan racun 90 dtk: serangan fisik & panah melukai musuh dengan Racun.'
  },
  panah_ledak: {
    n: 'Bubuk Kilau Senja', k: 'use', buff: [['fire_oil', 75]], price: 55, sell: 22,
    d: 'Olesan bara 75 dtk: panah & bilah pedang meletuskan api tambahan.'
  },
  elixir_ksatria: {
    n: 'Eliksir Ksatria', k: 'use', hp: 75, mp: 20, buff: [['atk', 45], ['def', 45]], price: 95, sell: 38,
    d: 'Ramuan agung +75 HP, +20 MP, serta +Kuat & +Kebal 45 detik.'
  },
  fam_crow: {
    n: 'Jimat Gagak Senja', k: 'use', price: 110, sell: 40,
    d: 'Memanggil Familiar Gagak Senja secara permanen untuk menyerang & menarik drop.'
  },
  kitab_miasma: {
    n: 'Kitab Miasma Rawa', k: 'use', spellbook: 'venom', price: 140, sell: 55,
    d: 'Baca dari tas: Kabut Racun meledak melukai musuh & memperlambat lebih lama.'
  }
});

Object.assign(ICONS_DEF, {
  panah_racun: ['potion', { C: '#48b848', L: '#a2ff8a', D: '#1f5a20', G: '#d8f4e8', K: '#7a5230' }],
  panah_ledak: ['fire', { C: '#ff7030', L: '#ffe680', D: '#a42212' }],
  elixir_ksatria: ['potion', { C: '#d49a28', L: '#fff4a8', D: '#7a4a10', G: '#e8f6ff', K: '#6a4020' }],
  fam_crow: ['shard', { C: '#42385c', L: '#c89eff', D: '#1a1428' }],
  kitab_miasma: ['tome', { C: '#44265c', L: '#a864e0', D: '#1c0c2a', Y: '#a4ff7a', W: '#e6f4dc' }]
});

SPELLBOOK_INFO.venom = {
  n: 'Kitab Miasma Rawa',
  title: 'MIASMA BERACUN GANDA',
  msg: 'Modifikasi aktif: Kabut Racun kini memicu ledakan racun kuat di sekitar musuh!'
};

const SECRET_RECIPES = [
  { id: 'fam_crow', n: 1, need: { feather: 2, berry: 2 }, hint: 'Peti Hutan Lumina atau kalahkan monster berbulu' },
  { id: 'panah_racun', n: 2, need: { herb: 2, spore: 2 }, hint: 'Musuh rawa / elit Rawa Senja' },
  { id: 'panah_ledak', n: 2, need: { spore: 2, ore: 1 }, hint: 'Musuh elit Padang Angin / Gua Batu' },
  { id: 'elixir_ksatria', n: 1, need: { hipotion: 1, ore: 2, herb: 2 }, hint: 'Peti Gua Batu atau bos Golem' },
  { id: 'kitab_miasma', n: 1, need: { ecto: 2, spore: 3 }, hint: 'Peti Rawa Senja atau bos Rawa' }
];

function syncUnlockedRecipes() {
  if (typeof S === 'undefined' || !S) return;
  S.recipes = S.recipes || {};
  for (const R of SECRET_RECIPES) {
    if (S.recipes[R.id] && !CRAFT.some(c => c.id === R.id)) CRAFT.push({ id: R.id, n: R.n, need: R.need });
  }
}

function unlockRecipe(id, sc) {
  S.recipes = S.recipes || {};
  if (S.recipes[id]) return false;
  S.recipes[id] = true;
  syncUnlockedRecipes();
  sfx('fanfare');
  const it = ITEMS[id];
  if (it) banner(it.n, 'RESEP BARU TERBUKA', true, 2400);
  if (sc && sc.pl) popWorld(sc.pl.x, sc.pl.y - 36, '📜 Resep: ' + (it ? it.n : id), 'gold');
  return true;
}

(() => {
  const ls0 = loadSave;
  loadSave = function () { const ok = ls0.apply(this, arguments); if (ok) syncUnlockedRecipes(); return ok; }; // eslint-disable-line no-global-assign
  const ng0 = newState;
  newState = function () { const s = ng0.apply(this, arguments); setTimeout(syncUnlockedRecipes, 0); return s; }; // eslint-disable-line no-global-assign

  const W = World.prototype;
  const cr0 = W.create;
  W.create = function () { syncUnlockedRecipes(); return cr0.apply(this, arguments); };

  const chest0 = W.openChest;
  W.openChest = async function (c, spr) {
    const was = c && S.flags && S.flags[c.id];
    const r = await chest0.apply(this, arguments);
    if (!was && c && S.flags && S.flags[c.id]) {
      const m = this.M?.id;
      const mapPick = m === 'forest' ? 'fam_crow' : m === 'cave' ? 'elixir_ksatria' : m === 'swamp' ? 'kitab_miasma' : null;
      if (mapPick && !(S.recipes && S.recipes[mapPick])) unlockRecipe(mapPick, this);
    }
    return r;
  };

  const kill0 = W.killEnemy;
  W.killEnemy = function (e) {
    const r = kill0.apply(this, arguments);
    if (e && (e.boss || e.elite || Math.random() < .15)) {
      const pool = SECRET_RECIPES.map(x => x.id).filter(id => !(S.recipes && S.recipes[id]));
      if (pool.length) {
        const pickId = e.boss ? pool[0] : (e.elite || Math.random() < .4 ? pool[ri(0, pool.length - 1)] : null);
        if (pickId) unlockRecipe(pickId, this);
      }
    }
    return r;
  };

  const cast0 = W.castSpell;
  if (cast0) W.castSpell = function (id) {
    const r = cast0.apply(this, arguments);
    if (id === 'venom' && S.spellbooks && S.spellbooks.venom) {
      for (const e of this.enemies || []) {
        if (e.hp > 0 && Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y) < 95) {
          this.poisonEnemy(e, stat().mag * .25, 6, 3);
          e.slow = 4.5;
        }
      }
    }
    return r;
  };

  const hit0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    const r = hit0.apply(this, arguments);
    if (e && e.hp > 0) {
      if (buffOn('poison_oil') && this.poisonEnemy) this.poisonEnemy(e, Math.max(2, stat().atk * .2), 4, 2);
      if (buffOn('fire_oil') && this.burnEnemy) this.burnEnemy(e, Math.max(2, stat().atk * .25), 3);
    }
    return r;
  };
})();

if (typeof openRecipeBook === 'function') {
  openRecipeBook = async function () { // eslint-disable-line no-global-assign
    syncUnlockedRecipes();
    const tabs = ['Tempa', 'Masak', 'Kerajinan', 'Resep Rahasia'];
    let tab = 0, sel = 0;
    for (;;) {
      const list = tab === 0 ? RECIPES : tab === 1 ? COOK : tab === 2 ? CRAFT : SECRET_RECIPES;
      const items = list.map(R => {
        const it = ITEMS[R.id], locked = tab === 3 && !(S.recipes && S.recipes[R.id]);
        if (locked) return { t: '🔒 ??? (' + it.n.slice(0, 6) + '...)', r: 'Terkunci', dis: true };
        const can = Object.entries(R.need).every(([k, n]) => has(k, n));
        return { t: (can ? '★ ' : '• ') + icon(R.id) + it.n, r: has(R.id) ? `Punya x${S.inv[R.id]}` : (can ? 'Siap' : 'Kurang'), dis: !can && tab < 3 };
      });
      items.push({ t: 'Ganti Kategori ▸' }, { t: 'Tutup' });
      const r = await choose({
        head: `BUKU RESEP · ${tabs[tab]}`, x: 14, y: 18, w: 280, start: sel, items,
        foot: i => {
          if (i === list.length) return 'Tekan A untuk berganti kategori resep.';
          if (i > list.length) return 'Tutup buku resep.';
          const R = list[i], it = ITEMS[R.id];
          if (tab === 3 && !(S.recipes && S.recipes[R.id])) return `Resep belum ditemukan.<br>Petunjuk: <i>${R.hint}</i>`;
          const needs = Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k]?.n || k} ${S.inv[k] || 0}/${n}`).join(' · ');
          return `<b>${it.n}:</b> ${it.d}<br>Bahan: ${needs}`;
        }
      });
      if (r < 0 || r === list.length + 1) break;
      tab = (tab + 1) % tabs.length; sel = 0; sfx('cur');
    }
  };
}
