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
// ---------------- MASAK (penginapan) ----------------
async function cookMenu() {
  let sel = 0; const can = R => Object.entries(R.need).every(([k, n]) => has(k, n));
  for (; ;) {
    const r = await choose({ head: 'Dapur Bu Rina', x: 24, y: 22, w: 240, start: sel,
      items: [...COOK.map(R => ({ t: icon(R.id) + ITEMS[R.id].n, r: 'x' + (S.inv[R.id] || 0) })), { t: 'Kembali' }],
      foot: i => { if (i >= COOK.length) return ''; const R = COOK[i]; return ITEMS[R.id].d + '<br>Bahan: ' + Object.entries(R.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · '); } });
    if (r < 0 || r === COOK.length) return; sel = r; const R = COOK[r];
    if (!can(R)) { sfx('buzz'); await say('Bahannya belum cukup. Ikan dari memancing, sayur dari kebun.', 'Bu Rina'); continue; }
    for (const [k, n] of Object.entries(R.need)) addItem(k, -n); addItem(R.id); sfx('fire'); await sleep(300); sfx('chest'); updHud();
    await say(`Harum sekali! ${ITEMS[R.id].n} siap. Makan dari TAS saat dibutuhkan.`, 'Bu Rina');
  }
}
// ---------------- UPGRADE (bengkel) ----------------
function upgCost(id) { const u = (S.up[id] || 0) + 1; return { gold: 60 * u * u + 40, need: u >= 4 ? { ore: u, shard: u - 2 } : { ore: u } }; }
async function upgradeMenu() {
  let sel = 0;
  for (; ;) {
    const L = Object.keys(S.inv).filter(id => ITEMS[id] && (ITEMS[id].k === 'wpn' || ITEMS[id].k === 'arm'));
    const r = await choose({ head: 'Tingkatkan · ' + S.gold + ' G', x: 24, y: 22, w: 240, start: sel,
      items: [...L.map(id => { const u = S.up[id] || 0; return { t: icon(id) + itemName(id), r: u >= UPG.max ? 'MAKS' : upgCost(id).gold + ' G', dis: u >= UPG.max }; }), { t: 'Kembali' }],
      foot: i => { if (i >= L.length) return 'Setiap tingkat: senjata Serang +' + UPG.wpn + ', baju Tahan +' + UPG.arm + '.'; const id = L[i]; if ((S.up[id] || 0) >= UPG.max) return 'Sudah tingkat maksimal!'; const C = upgCost(id); return (ITEMS[id].k === 'wpn' ? 'Serang +' + UPG.wpn : 'Tahan +' + UPG.arm) + '<br>Bahan: ' + Object.entries(C.need).map(([k, n]) => `${icon(k)}${ITEMS[k].n} ${S.inv[k] || 0}/${n}`).join(' · '); } });
    if (r < 0 || r === L.length) return; sel = r; const id = L[r], C = upgCost(id);
    if (S.gold < C.gold || !Object.entries(C.need).every(([k, n]) => has(k, n))) { sfx('buzz'); await say('Bahan atau uangnya belum cukup. Bijih Batu dari golem, Pecahan Kristal dari makhluk es.', 'Pak Besi'); continue; }
    S.gold -= C.gold; for (const [k, n] of Object.entries(C.need)) addItem(k, -n); S.up[id] = (S.up[id] || 0) + 1;
    sfx('boom'); await sleep(250); sfx('chest'); G.scene.cameras.main.flash(200, 255, 200, 120); updHud();
    await say(`TANG! ${itemName(id)} jadi lebih kuat!`, 'Pak Besi');
  }
}
