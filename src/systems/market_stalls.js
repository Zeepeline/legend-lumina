'use strict';
// PASAR RAYA (Distrik Pasar) — 3 kios tenda dari gambar pemilik (assets/img/buildings/sp_b_stall_<jenis>.png):
// ramuan, senjata & zirah, bahan pangan. Tiap kios bisa didatangi dari depan (meja) untuk berbelanja/menjual.
const STALLS = {
  potion: { n: 'Kios Ramuan Nenek Saga',
    items: ['potion', 'hipotion', 'antidote', 'ether', 'holy_water', 'healing_salve', 'elixir_life', 'potion_agility', 'potion_frostcloak', 'bug_balm'] },
  weapon: { n: 'Kios Senjata Gilang', items: ['isword', 'ispear', 'hbow', 'chain', 'iron', 'iron_bar'] },
  food: { n: 'Kios Pangan Bu Ratna',
    items: ['tea_flask', 'honey_jar', 'aged_cheese', 'glazed_skewer', 'grilled_prawn', 'chrys_tea', 'coffee_cup', 'wheat_flour', 'seed_carrot', 'seed_wheat'] },
};
REF_HOUSES.tex.push('stall_potion', 'stall_weapon', 'stall_food');
IMG_LIST.push('sp_b_stall_potion', 'sp_b_stall_weapon', 'sp_b_stall_food');
for (const k in STALLS) {
  OBJ_SPAWN['stall_' + k] = function (s, x, y) {
    this.inter.push({ x, y: y + 12, r: 34, fn: () => this.stallShop(k) });
  };
}
Object.assign(World.prototype, {
  async stallShop(k) {
    const T = STALLS[k], items = T.items.filter(i => ITEMS[i]);
    G.lock++;
    try {
      for (; ;) {
        const m = await choose({ head: `${T.n} · ${S.gold} G`, x: 80, y: 50, w: 176, items: [{ t: 'Beli' }, { t: 'Jual barang' }, { t: 'Keluar' }] });
        if (m === 0) await buyMenu(T.n + ' (Kota)', items);
        else if (m === 1) await sellMenu();
        else break;
      }
    } finally { G.lock--; }
  },
});
