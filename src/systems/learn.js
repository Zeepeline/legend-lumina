'use strict';
// Sistem belajar jurus: dipelajari dari guru (NPC), lalu makin mahir dengan dipakai (tingkat I–III).
// S.learn[id] = 1 (sudah dipelajari), S.mast[id] = jumlah pemakaian, S.spell = sihir di tombol SIHIR.
const JURUS = {
  fire:  { n: 'Bola Api', school: 'Sihir Api', kind: 'spell', mp: 3, guru: 'elder', where: 'Tetua Bram, Desa Lumina', can: () => S.stage >= 1, d: 'Ketuk SIHIR: bidik otomatis. Tarik: bidik manual. Membakar musuh.', lesson: ['Sebelum ke hutan, dengarkan baik-baik. Sihir bukan soal kekuatan, tapi soal niat.', 'Rasakan hangat di telapak tanganmu... bayangkan api kecil... lalu lepaskan!'] },
  dash:  { n: 'Dash', school: 'Gerak', kind: 'move', guru: 'hunter', where: 'Pemburu Raka, Hutan Lumina', can: () => S.stage >= 1, d: 'Tombol DASH / Shift: melesat & kebal sesaat.', lesson: ['Kakimu terlalu kaku untuk bertarung di hutan. Serigala tak akan menunggumu.', 'Rendahkan badan, tolak dengan satu kaki, lalu melesat! Lihat? Saat melesat, cakar pun tak sempat mengenaimu.'] },
  spin:  { n: 'Tebasan Putar', school: 'Pedang', kind: 'move', guru: 'smith', where: 'Pak Besi, Desa Lumina (Lv 3, 60 G)', cost: 60, can: () => S.lv >= 3, d: 'Tahan SERANG lalu lepas: tebas ke segala arah.', lesson: ['Pedang bukan cuma untuk menusuk ke depan. Musuh bisa datang dari mana saja.', 'Tahan pegangannya... kumpulkan tenaga di pinggang... lalu putar! Bagus!'] },
  venom: { n: 'Kabut Racun', school: 'Sihir Alam', kind: 'spell', mp: 6, guru: 'hermit', where: 'Pertapa Sura, Rawa Senja', can: () => S.stage >= 7, d: 'Kabut beracun di sekelilingmu: musuh terluka perlahan.', lesson: ['Rawa ini mengajarkanku satu hal: racun juga bagian dari alam.', 'Hirup aroma lumpur, embuskan dengan niat... kabut ini hanya melukai yang memusuhimu.'] },
  nova:  { n: 'Nova Es', school: 'Sihir Es', kind: 'spell', mp: 8, guru: 'nila', where: 'Penjaga Nila, Puncak Beku', can: () => S.stage >= 11, d: 'Ledakan es di sekitarmu: membekukan & melambatkan musuh. (Juga: tahan SIHIR / tombol C)', lesson: ['Di gunung ini, dingin bisa jadi kawan. Para penjaga dulu memakainya untuk menahan naga.', 'Kepalkan tanganmu, bayangkan salju yang paling sunyi... lalu lepaskan sekaligus!'] },
  heal:  { n: 'Cahaya Pulih', school: 'Sihir Cahaya', kind: 'spell', mp: 8, guru: 'lestari', where: 'Guru Lestari, Kota Bawah', can: () => S.stage >= 26, d: 'Pulihkan HP dengan cahaya hangat.', lesson: ['Selene dulu mengajariku ini, waktu kami masih murid. Sekarang giliranku mengajarimu.', 'Cahaya bukan untuk menyerang. Letakkan tangan di dada... rasakan hangatnya... pulihlah.'] },
  holy:  { n: 'Lentera Suci', school: 'Sihir Cahaya', kind: 'spell', mp: 10, guru: 'ka4', where: 'Guru Tua, Distrik Akademi (300 G)', cost: 300, can: () => S.stage >= 27, d: 'Ledakan cahaya di sekelilingmu. Sangat kuat melawan hantu & roh.', lesson: ['Sihir lentera, ilmu para Penjaga Cahaya. Sudah lama tak ada yang mempelajarinya.', 'Bayangkan seribu lentera kota ini menyala di dalam dirimu... sekarang!'] },
};
const MASTERY = [0, 15, 40]; // jumlah pemakaian untuk tingkat I, II, III
const tierOf = id => (S.mast[id] || 0) >= MASTERY[2] ? 3 : (S.mast[id] || 0) >= MASTERY[1] ? 2 : 1;
const learned = id => !!S.learn[id];
function useJurus(sc, id) {
  const before = tierOf(id); S.mast[id] = (S.mast[id] || 0) + 1; const t = tierOf(id);
  if (t > before) { sfx('save'); banner(JURUS[id].n + ' ' + ['', 'I', 'II', 'III'][t], 'JURUS SEMAKIN MAHIR', true, 2200); }
}
const canTeach = id => Object.keys(JURUS).find(k => JURUS[k].guru === id && !learned(k) && JURUS[k].can());
Object.assign(World.prototype, {
  // Dipanggil sebelum dialog biasa. Kembalikan true jika percakapan dipakai untuk mengajar.
  async learnTalk(id, T, gain) {
    const k = canTeach(id); if (!k) return false;
    if (id === 'hunter' && S.stage === 1) return false; // misi Raka dulu, baru mengajar
    const J = JURUS[k];
    await T(J.lesson[0]);
    if (!(await ask(`Pelajari ${J.n}?${J.cost ? `\n(Biaya ${J.cost} G)` : ''}`))) return true;
    if (J.cost && S.gold < J.cost) { await T(`Kumpulkan dulu ${J.cost} G. Ilmu ini tidak murah.`); return true; }
    if (J.cost) S.gold -= J.cost;
    await T(J.lesson[1]);
    S.learn[k] = 1; if (J.kind === 'spell' && (!S.spell || !learned(S.spell))) S.spell = k;
    sfx('chest'); this.sparkle(this.pl.x, this.pl.y - 14, 'doto', 18); updHud();
    banner(J.n, 'JURUS BARU · ' + J.school.toUpperCase(), true, 2600);
    await say(J.d + (J.kind === 'spell' ? '\nAtur sihir di tombol SIHIR lewat MENU → Jurus.' : ''));
    saveGame(this); return true;
  },
  castSpell(id) {
    const pl = this.pl, st = stat(), J = JURUS[id], t = tierOf(id);
    if (pl.atkCd > 0) return; if (S.mp < J.mp) { popWorld(pl.x, pl.y - 30, 'MP kurang!', 'mpc'); sfx('buzz'); return; }
    S.mp -= J.mp; updHud(); pl.atkCd = .45; pl.atkT = .2; useJurus(this, id);
    if (id === 'heal') {
      const n = Math.round(st.maxhp * (.22 + .08 * t)); S.hp = Math.min(st.maxhp, S.hp + n); updHud(); sfx('heal');
      popWorld(pl.x, pl.y - 34, '+' + n, 'heal'); this.sparkle(pl.x, pl.y - 12, 'dot', 16); this.cameras.main.flash(150, 255, 250, 200); return;
    }
    const R = id === 'venom' ? 54 + t * 10 : 70 + t * 12, col = id === 'venom' ? 0x8ae86a : 0xfff2a0;
    sfx(id === 'venom' ? 'hurt' : 'ice'); if (id === 'holy') this.cameras.main.flash(160, 255, 250, 210);
    const g = this.add.graphics().setDepth(pl.y + 2), o = { r: 6 };
    this.tweens.add({ targets: o, r: R, duration: 300, onUpdate: () => { g.clear(); g.fillStyle(col, .22 * (1 - o.r / R / 1.4)).fillEllipse(pl.x, pl.y - 6, o.r * 2, o.r * 1.3); g.lineStyle(2, col, 1 - o.r / R).strokeEllipse(pl.x, pl.y - 6, o.r * 2, o.r * 1.3); }, onComplete: () => g.destroy() });
    for (const e of this.enemies) {
      if (e.hp <= 0) continue; const dx = e.spr.x - pl.x, dy = e.spr.y - pl.y, d = Math.hypot(dx, dy) || 1;
      if (d > R + e.D.r * e.sc) continue;
      if (id === 'venom') { this.hitEnemy(e, st.mag * .5, false, dx / d * .3, dy / d * .3); this.burnEnemy(e, st.mag * (.18 + .07 * t), 3 + t); e.slow = 2; }
      else { const spirit = /ghost|wisp/.test(e.D.tex); this.hitEnemy(e, st.mag * (1.1 + .25 * t) * (spirit ? 2.5 : 1), spirit, dx / d, dy / d); }
    }
  },
});
