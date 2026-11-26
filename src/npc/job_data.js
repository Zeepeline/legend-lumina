'use strict';
// PEKERJAAN BERURUTAN per NPC (koordinat lokal peta). Mesin: npc/jobs.js. Aturan: docs/NPC_RULES.md bag. 9.
// Langkah: { x, y, do: aksi JOB_ACTS, dur, tx, ty (yang dihadapi), take/drop: barang JOB_ITEMS, say }
const JOBS = {
  village: {
    farmer: { hours: [6, 18], steps: [
      { x: 214, y: 378, do: 'take', take: 'watercan' }, { x: 200, y: 440, do: 'water', tx: 146, ty: 450, dur: 5 },
      { x: 96, y: 440, do: 'water', tx: 146, ty: 450, dur: 5 }, { x: 214, y: 378, do: 'put', drop: 'none' },
      { x: 196, y: 462, do: 'hoe', tx: 146, ty: 450, dur: 8 }, { x: 150, y: 486, do: 'hoe', tx: 146, ty: 450, dur: 8, say: 'Tanahnya gembur, bagus.' },
      { x: 200, y: 474, do: 'harvest', tx: 146, ty: 470, dur: 6, take: 'basket' },
      { x: 720, y: 246, do: 'put', drop: 'basket', dur: 3, say: 'Sayur segar, Bu Sari!' }, { x: 340, y: 244, do: 'rest', dur: 8 } ] },
    smith: { hours: [7, 19], steps: [
      { x: 916, y: 548, do: 'take', take: 'iron' }, { x: 904, y: 576, do: 'stoke', tx: 904, ty: 550, dur: 6 },
      { x: 856, y: 576, at: [843, 575], do: 'hammer', tx: 832, ty: 574, dur: 12, say: 'Besi panas siap ditempa!' },
      { x: 904, y: 576, do: 'stoke', tx: 904, ty: 550, dur: 4 },
      { x: 856, y: 576, at: [843, 575], do: 'hammer', tx: 832, ty: 574, dur: 8 },
      { x: 916, y: 548, do: 'put', drop: 'iron', dur: 2 }, { x: 868, y: 556, do: 'rest', dur: 8 } ] },
    merchant: { hours: [7, 19], steps: [
      { x: 726, y: 248, do: 'sweep', dur: 6 }, { x: 470, y: 236, do: 'take', take: 'crate', tx: 442, ty: 220, dur: 3 },
      { x: 780, y: 246, do: 'put', drop: 'crate', tx: 746, ty: 222, dur: 3 },
      { x: 746, y: 240, do: 'serve', tx: 746, ty: 300, dur: 25, say: 'Ada barang bagus hari ini!' } ] },
    woman: { hours: [6, 18], steps: [
      { x: 270, y: 450, do: 'sweep', dur: 8 }, { x: 486, y: 390, do: 'draw', tx: 506, ty: 370, take: 'bucket', dur: 5 },
      { x: 276, y: 452, do: 'put', drop: 'bucket', dur: 3 }, { x: 250, y: 462, do: 'wash', dur: 10, say: 'Cucian hari ini banyak sekali.' } ] },
    vl1: { hours: [6, 18], steps: [
      { x: 526, y: 390, do: 'draw', tx: 506, ty: 370, take: 'bucket', dur: 5 }, { x: 606, y: 214, do: 'put', drop: 'bucket', tx: 590, ty: 200, dur: 3 },
      { x: 526, y: 390, do: 'draw', tx: 506, ty: 370, take: 'bucket', dur: 5 }, { x: 560, y: 582, do: 'put', drop: 'bucket', tx: 550, ty: 566, dur: 3 } ] },
    vl2: { hours: [6, 16], steps: [ /* 16–21: menyalakan lentera (LIFE_ROLES.lamplighter) */
      { x: 424, y: 316, do: 'wipe', tx: 424, ty: 280, dur: 5 }, { x: 490, y: 478, do: 'wipe', tx: 490, ty: 440, dur: 5 },
      { x: 376, y: 412, do: 'wipe', tx: 376, ty: 380, dur: 5 }, { x: 628, y: 412, do: 'wipe', tx: 644, ty: 390, dur: 5 } ] },
    chick_master: { hours: [6, 18], steps: [
      { x: 690, y: 290, do: 'take', take: 'hay', tx: 670, ty: 280, dur: 3 }, { x: 826, y: 320, do: 'feed', tx: 880, ty: 330, dur: 8 },
      { x: 826, y: 364, do: 'feed', tx: 880, ty: 340, dur: 8, drop: 'hay', say: 'Makan yang banyak ya!' }, { x: 820, y: 340, do: 'sweep', dur: 6 } ] },
    elder: { hours: [7, 18], steps: [
      { x: 490, y: 130, do: 'sweep', dur: 6 }, { x: 470, y: 216, do: 'read', dur: 14 }, { x: 540, y: 396, do: 'inspect', tx: 506, ty: 370, dur: 6 } ] },
    mira: { hours: [6, 20], steps: [ /* penyihir: baca mantra → berkati sumur, kebun, lentera */
      { x: 600, y: 350, do: 'read', dur: 14, say: 'Mantra ini... ah, halaman berikutnya.' },
      { x: 546, y: 396, do: 'cast', tx: 506, ty: 380, dur: 8, say: 'Semoga airnya selalu jernih.' },
      { x: 205, y: 450, do: 'cast', tx: 146, ty: 450, dur: 8, say: 'Tumbuhlah, benih kecil.' },
      { x: 505, y: 478, do: 'cast', tx: 490, ty: 440, dur: 6 }, { x: 560, y: 590, do: 'inspect', tx: 572, ty: 565, dur: 5 } ] },
    guard: { hours: [0, 24], steps: [
      { x: 478, y: 652, do: 'watch', dur: 8 }, { x: 440, y: 550, do: 'watch', dur: 3 }, { x: 450, y: 440, do: 'watch', dur: 3 },
      { x: 208, y: 474, do: 'drill', tx: 236, ty: 472, dur: 12, say: 'Hyaa! Sekali lagi!' }, { x: 290, y: 470, do: 'rest', dur: 8 },
      { x: 570, y: 315, do: 'watch', dur: 4 }, { x: 750, y: 315, do: 'watch', dur: 3 }, { x: 940, y: 262, do: 'watch', dur: 8, say: 'Gerbang timur aman.' },
      { x: 495, y: 232, do: 'watch', dur: 4 } ] },
  },
  meadow: {
    joko: { hours: [6, 18], steps: [
      { x: 352, y: 232, do: 'harvest', tx: 352, ty: 214, dur: 6, take: 'hay' }, { x: 300, y: 190, do: 'put', drop: 'hay', dur: 3 },
      { x: 300, y: 190, do: 'mill', tx: 300, ty: 150, dur: 10 }, { x: 300, y: 190, do: 'take', take: 'sack' },
      { x: 270, y: 380, do: 'put', drop: 'sack', dur: 3, say: 'Tepung baru, Bayu!' } ] },
    wati: { hours: [6, 18], steps: [
      { x: 250, y: 238, do: 'hoe', tx: 250, ty: 220, dur: 8 }, { x: 330, y: 258, do: 'harvest', tx: 330, ty: 240, dur: 6, take: 'basket' },
      { x: 190, y: 300, do: 'put', drop: 'basket', dur: 3 }, { x: 180, y: 300, do: 'wash', dur: 8 } ] },
    darma: { hours: [6, 18], steps: [
      { x: 630, y: 366, do: 'chop', tx: 630, ty: 350, dur: 10, take: 'wood' }, { x: 520, y: 300, do: 'put', drop: 'wood', dur: 2 },
      { x: 520, y: 300, do: 'hammer', tx: 520, ty: 280, dur: 8 } ] },
    bayu: { hours: [7, 19], steps: [ { x: 248, y: 384, do: 'serve', dur: 20 }, { x: 300, y: 384, do: 'take', take: 'crate' },
      { x: 248, y: 384, do: 'put', drop: 'crate' }, { x: 230, y: 388, do: 'sweep', dur: 6 } ] },
  },
  forest: {
    hunter: { hours: [0, 24], steps: [
      { x: 630, y: 190, do: 'stoke', tx: 650, ty: 180, dur: 6 }, { x: 570, y: 120, do: 'inspect', dur: 6 }, { x: 610, y: 100, do: 'watch', dur: 8 },
      { x: 606, y: 106, do: 'aim', tx: 530, ty: 106, dur: 16, say: 'Tarik napas... lepas!' }, { x: 676, y: 190, do: 'rest', dur: 8 } ] },
  },
};
NPC_BARKS.mira = ['Sihir itu mendengarkan, bukan memerintah.', 'Topiku? Warisan guruku.', 'Jangan sentuh bukuku, ya.'];
