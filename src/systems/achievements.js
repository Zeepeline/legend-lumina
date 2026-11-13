'use strict';
// Cek pencapaian
function totalKills() { return Object.values(S.kills).reduce((a, b) => a + b, 0); }
function achCheck(sc) {
  for (const A of ACH) if (!S.ach[A.id] && A.ok()) {
    S.ach[A.id] = 1; const [it, n] = A.gift; if (it === 'gold') S.gold += n; else addItem(it, n);
    sfx('lvl'); banner(A.n, 'PENCAPAIAN', false, 2200);
    if (sc && sc.pl) popWorld(sc.pl.x, sc.pl.y - 34, '+' + (it === 'gold' ? n + ' G' : ITEMS[it].n), 'gold');
    updHud();
  }
}
