'use strict';
// Sprite monster dari lembar GPT pemilik (dibersihkan oleh tools/gpt_monsters.py → assets/img/mon_<key>.png, strip 2 frame).
// Tekstur lama (slime, wolf, …) digambar ULANG di kanvasnya sendiri (ukuran sama) agar animasi <key>_mv tetap sah.
// Kunci baru g_<id> = musuh khusus/boss yang dulu meminjam sprite monster lain → tekstur & animasi baru, ENEMY[id].tex diganti.
const GPT_MON = ['slime', 'slimeb', 'slimer', 'slimei', 'slimep', 'slimef', 'wolf', 'wolfs', 'snake', 'boar', 'frog', 'salam',
  'bat', 'batc', 'bee', 'wisp', 'shroom', 'plant', 'squeen', 'ghost', 'golem', 'golemi'];
const GPT_MON_NEW = ['gold_slime', 'gsnake', 'golemk', 'kryos', 'bounty_wolf', 'bounty_frog', 'bounty_gargoyle', 'king_slime'];
IMG_LIST.push(...GPT_MON.map(k => 'mon_' + k), ...GPT_MON_NEW.map(id => 'mon_g_' + id));
function applyGptMonsters(sc) {
  const T = sc.textures, A = sc.anims;
  for (const k of GPT_MON) {
    const img = IMGEL['mon_' + k]; if (!img || !T.exists(k)) continue;
    const t = T.get(k), cv = t.getSourceImage();
    if (!cv.getContext || cv.width !== img.width || cv.height !== img.height) continue; // ukuran beda → biarkan sprite lama
    const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.drawImage(img, 0, 0);
    if (t.refresh) t.refresh();
  }
  for (const id of GPT_MON_NEW) {
    const img = IMGEL['mon_g_' + id], D = ENEMY[id]; if (!img || !D) continue;
    const key = 'g_' + id, fw = img.width / 2;
    if (!T.exists(key)) { const t = T.addImage(key, img); t.add(0, 0, 0, 0, fw, img.height); t.add(1, 0, fw, 0, fw, img.height); }
    if (!A.exists(key + '_mv')) A.create({ key: key + '_mv', frames: [{ key, frame: 0 }, { key, frame: 1 }], frameRate: 5, repeat: -1 });
    D.tex = key;
  }
}
