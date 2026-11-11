'use strict';
// Menu beli, jual, tempa
// ---------------- TOKO / TEMPA / JUAL ----------------
const icon = id => `<img class="ic" src="${ICONS[id]}">`;
const ownedEq = id => has(id) ? ' ✓' : '';
async function buyMenu(title, list) {
  let sel = 0;
  for (; ;) {
    const r = await choose({ head: title + ' · ' + S.gold + ' G', x: 46, y: 30, w: 196, start: sel,
      items: [...list.map(id => { const it = ITEMS[id], eq = it.k !== 'use' && it.k !== 'mat'; return { t: icon(id) + it.n + (eq ? ownedEq(id) : ` (${S.inv[id] || 0})`), r: it.price + ' G', dis: eq && has(id) }; }), { t: 'Kembali' }],
      foot: i => i < list.length ? ITEMS[list[i]].d : 'Uangmu: ' + S.gold + ' G' });
    if (r < 0 || r === list.length) return; sel = r; const id = list[r], it = ITEMS[id];
    if (S.gold < it.price) { sfx('buzz'); await say('Uangnya kurang.'); continue; }
    S.gold -= it.price; addItem(id); sfx('coin'); updHud();
    if (['wpn', 'arm', 'acc'].includes(it.k)) { const sl = it.k; if (await ask(`${it.n} dibeli! Langsung pasang?`)) { S.eq[sl] = id; sfx('ok'); updHud(); } }
  }
}
async function sellMenu() {
  let sel = 0;
  for (; ;) {
    const mats = Object.keys(S.inv).filter(id => ITEMS[id].sell && S.inv[id] > 0);
    if (!mats.length) { await say('Kamu tidak punya barang untuk dijual. Kalahkan monster, memancing, atau berkebun dulu.'); return; }
    const r = await choose({ head: 'Jual bahan · ' + S.gold + ' G', x: 46, y: 26, w: 196, start: Math.min(sel, mats.length), items: [...mats.map(id => ({ t: icon(id) + ITEMS[id].n + ' x' + S.inv[id], r: ITEMS[id].sell + ' G' })), { t: 'Kembali' }],
      foot: i => i < mats.length ? ITEMS[mats[i]].d + ' (ingat: bahan dipakai untuk tempa)' : '' });
    if (r < 0 || r === mats.length) return; sel = r; const id = mats[r];
    addItem(id, -1); S.gold += ITEMS[id].sell; sfx('coin'); updHud();
  }
}
async function forgeMenu() {
  let sel = 0;
  const can = R => S.gold >= R.gold && Object.entries(R.need).every(([k, n]) => has(k, n));
  for (; ;) {
    const r = await choose({ head: 'Tempa · ' + S.gold + ' G', x: 30, y: 22, w: 228, start: sel,
      items: [...RECIPES.map(R => ({ t: icon(R.id) + ITEMS[R.id].n + ownedEq(R.id), r: R.gold + ' G', dis: has(R.id) })), { t: 'Kembali' }],
      foot: i => { if (i >= RECIPES.length) return ''; const R = RECIPES[i]; return ITEMS[R.id].d + '<br>Bahan: ' + Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · '); } });
    if (r < 0 || r === RECIPES.length) return; sel = r; const R = RECIPES[r];
    if (!can(R)) { sfx('buzz'); await say('Bahan atau uangnya belum cukup.', 'Pak Besi'); continue; }
    S.gold -= R.gold; for (const [k, n] of Object.entries(R.need)) addItem(k, -n); addItem(R.id);
    sfx('boom'); await sleep(250); sfx('chest'); G.scene.cameras.main.flash(200, 255, 200, 120); updHud();
    const it = ITEMS[R.id], sl = it.k;
    if (await ask(`TANG! TANG! ${it.n} selesai ditempa! Langsung pasang?`, 'Pak Besi')) { S.eq[sl] = R.id; sfx('ok'); updHud(); }
  }
}
