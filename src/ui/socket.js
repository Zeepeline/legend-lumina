'use strict';
// Menu Pasang Permata (#23)
async function socketMenu() {
  const wpns = Object.keys(S.inv).filter(id => ITEMS[id] && ITEMS[id].k === 'wpn');
  if (!wpns.length) {
    await say('Kamu tidak membawa senjata di dalam tas.', 'Pak Besi');
    return;
  }
  const r = await choose({
    head: 'Pilih Senjata untuk Soket',
    x: 30, y: 30, w: 220,
    items: [...wpns.map(id => {
      const g = S.socket && S.socket[id];
      return { t: icon(id) + itemName(id), r: g ? ITEMS[g]?.n : '(kosong)' };
    }), { t: 'Kembali' }]
  });
  if (r < 0 || r >= wpns.length) return;
  const wpnId = wpns[r];

  // Daftar permata yang didukung
  const GEMS = [
    { id: 'amethyst_gem', n: 'Kecubung Ungu', eff: 'Vampir: Serangan kritis memulihkan 3 HP' },
    { id: 'shard', n: 'Pecahan Kristal', eff: 'Hawa Beku: 25% peluang tebasan membekukan musuh' },
    { id: 'ore', n: 'Bijih Padat', eff: 'Hantaman Kokoh: Serang +3 & dorongan kuat' },
    { id: 'spore', n: 'Spora Alami', eff: 'Racun Alami: Tebasan memberi efek racun pada musuh' }
  ];

  const gItems = GEMS.map(g => ({
    t: icon(g.id) + g.n,
    r: has(g.id) ? `Punya x${S.inv[g.id]}` : 'Tidak Ada',
    dis: !has(g.id)
  }));
  if (S.socket && S.socket[wpnId]) {
    gItems.push({ t: 'Lepas Permata Saat Ini' });
  }
  gItems.push({ t: 'Batal' });

  const gr = await choose({
    head: `Soket · ${ITEMS[wpnId].n}`,
    x: 20, y: 30, w: 250,
    items: gItems,
    foot: i => i < GEMS.length ? GEMS[i].eff : 'Biaya pemasangan: Gratis bahan terpasang.'
  });

  if (gr < 0 || gr === gItems.length - 1) return;
  if (S.socket && S.socket[wpnId] && gr === gItems.length - 2) {
    const oldGem = S.socket[wpnId];
    addItem(oldGem, 1);
    delete S.socket[wpnId];
    sfx('ok');
    updHud();
    await say(`Permata ${ITEMS[oldGem]?.n || ''} berhasil dilepas dan kembali ke tas.`, 'Pak Besi');
    return;
  }

  const gem = GEMS[gr];
  if (!has(gem.id)) {
    sfx('buzz');
    await say(`Kamu tidak memiliki ${gem.n}.`, 'Pak Besi');
    return;
  }

  if (S.socket && S.socket[wpnId]) {
    addItem(S.socket[wpnId], 1); // kembalikan permata lama
  }
  addItem(gem.id, -1);
  S.socket = S.socket || {};
  S.socket[wpnId] = gem.id;
  sfx('boom');
  await sleep(250);
  sfx('chest');
  updHud();
  await say(`KLIK! Permata ${gem.n} berhasil dipasang ke ${ITEMS[wpnId].n}! Efek: ${gem.eff}`, 'Pak Besi');
}

