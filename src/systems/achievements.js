'use strict';
// Cek pencapaian & kabar progres 50% / 90% (T265)
function totalKills() { return Object.values(S.kills || {}).reduce((a, b) => a + b, 0); }

function toastAch(txt) {
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; UI.appendChild(box); }
  const e = document.createElement('div');
  e.className = 'toast r2';
  e.innerHTML = `<span>🏆 ${txt}</span>`;
  box.appendChild(e);
  setTimeout(() => e.remove(), 2500);
}

function achProgCheck() {
  let progMap = {};
  try { progMap = JSON.parse(localStorage.getItem('lumina_achprog')) || {}; } catch (_) {}

  const NUMERIC_ACH = [
    { id: 'k10', n: 'Pemburu Pemula', cur: () => totalKills(), max: 10 },
    { id: 'k100', n: 'Pembasmi Monster', cur: () => totalKills(), max: 100 },
    { id: 'fish5', n: 'Pemancing', cur: () => S.st?.fish || 0, max: 5 },
    { id: 'fish50', n: 'Kail Emas', cur: () => S.st?.fish || 0, max: 50 },
    { id: 'farm3', n: 'Petani Muda', cur: () => S.st?.harvest || 0, max: 3 },
    { id: 'harvest30', n: 'Petani Rajin', cur: () => S.st?.harvest || 0, max: 30 },
    { id: 'mine5', n: 'Palu Penambang', cur: () => S.st?.mined || 0, max: 5 },
    { id: 'mine40', n: 'Penambang', cur: () => S.st?.mined || 0, max: 40 },
    { id: 'barrel3', n: 'Pakar Peledak', cur: () => S.st?.barrels || 0, max: 3 },
    { id: 'barrel25', n: 'Penghancur Tong', cur: () => S.st?.barrels || 0, max: 25 },
    { id: 'craft10', n: 'Tangan Terampil', cur: () => S.st?.crafted || 0, max: 10 },
    { id: 'craft20', n: 'Keahlian Pengrajin', cur: () => S.st?.crafted || 0, max: 20 },
    { id: 'cook15', n: 'Juru Masak Desa', cur: () => S.st?.cooked || 0, max: 15 },
    { id: 'tree30', n: 'Penebang', cur: () => S.st?.trees || 0, max: 30 },
    { id: 'steps20k', n: 'Kaki Baja', cur: () => S.st?.steps || 0, max: 20000 },
    { id: 'rich1000', n: 'Kantung Tebal', cur: () => S.st?.goldEarned || 0, max: 1000 },
    { id: 'night8', n: 'Penjaga Malam', cur: () => S.st?.nightKills || 0, max: 8 },
    { id: 'back5', n: 'Langkah Bayangan', cur: () => S.st?.backstabs || 0, max: 5 }
  ];

  let changed = false;
  for (const item of NUMERIC_ACH) {
    if (S.ach && S.ach[item.id]) continue;
    const val = item.cur();
    const p50Key = item.id + '_50', p90Key = item.id + '_90';
    if (!progMap[p50Key] && val >= item.max * 0.5 && val < item.max) {
      progMap[p50Key] = true;
      changed = true;
      toastAch(`${item.n} 50%`);
    }
    if (!progMap[p90Key] && val >= item.max * 0.9 && val < item.max) {
      progMap[p90Key] = true;
      changed = true;
      toastAch(`${item.n} 90%`);
    }
  }
  if (changed) {
    try { localStorage.setItem('lumina_achprog', JSON.stringify(progMap)); } catch (_) {}
  }
}

function achCheck(sc) {
  achProgCheck();
  for (const A of ACH) if (!S.ach[A.id] && A.ok()) {
    S.ach[A.id] = 1; const [it, n] = A.gift; if (it === 'gold') S.gold += n; else addItem(it, n);
    sfx('lvl'); banner(A.n, 'PENCAPAIAN', false, 2200);
    if (sc && sc.pl) popWorld(sc.pl.x, sc.pl.y - 34, '+' + (it === 'gold' ? n + ' G' : ITEMS[it].n), 'gold');
    updHud();
  }
}
