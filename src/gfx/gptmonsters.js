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
  const hd = IMGEL.mon_slime_hd;
  if (hd) {
    if (!T.exists('slime_hd')) sc.textures.addSpriteSheet('slime_hd', hd, { frameWidth: 100, frameHeight: 100 });
    const regA = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('slime_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regA('slime_hd_idle', 0, 5, 7, -1);
    regA('slime_hd_hop', 7, 13, 11, -1);
    regA('slime_hd_atk', 14, 20, 11, 0);
    regA('slime_hd_hurt', 21, 23, 10, 0);
    regA('slime_hd_die', 28, 34, 9, 0);
    regA('slime_hd_mv', 7, 13, 11, -1);
    if (ENEMY.slime) { ENEMY.slime.tex = 'slime_hd'; ENEMY.slime.scale = 0.46; }
    if (ENEMY.slimeb) { ENEMY.slimeb.tex = 'slime_hd'; ENEMY.slimeb.scale = 0.52; }
    if (ENEMY.king_slime) { ENEMY.king_slime.tex = 'slime_hd'; ENEMY.king_slime.scale = 0.95; }
  }
  const whd = IMGEL.mon_wolf_hd;
  if (whd) {
    if (!T.exists('wolf_hd')) sc.textures.addSpriteSheet('wolf_hd', whd, { frameWidth: 128, frameHeight: 96 });
    const regW = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('wolf_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regW('wolf_hd_idle', 0, 6, 8, -1);
    regW('wolf_hd_walk', 7, 13, 10, -1);
    regW('wolf_hd_run', 14, 20, 12, -1);
    regW('wolf_hd_bite', 21, 25, 11, 0);
    regW('wolf_hd_pounce', 28, 32, 11, 0);
    regW('wolf_hd_hurt', 35, 39, 10, 0);
    regW('wolf_hd_die', 42, 45, 8, 0);
    regW('wolf_hd_howl', 49, 54, 9, 0);
    regW('wolf_hd_mv', 7, 13, 10, -1);
    if (ENEMY.wolf) { ENEMY.wolf.tex = 'wolf_hd'; ENEMY.wolf.scale = 0.44; }
  }
  const wehd = IMGEL.mon_wolf_elite_hd;
  if (wehd) {
    if (!T.exists('wolf_elite_hd')) sc.textures.addSpriteSheet('wolf_elite_hd', wehd, { frameWidth: 168, frameHeight: 116 });
    const regWE = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('wolf_elite_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regWE('wolf_elite_hd_idle', 0, 6, 8, -1);
    regWE('wolf_elite_hd_walk', 7, 13, 10, -1);
    regWE('wolf_elite_hd_run', 14, 19, 12, -1);
    regWE('wolf_elite_hd_bite', 21, 25, 11, 0);
    regWE('wolf_elite_hd_pounce', 28, 31, 10, 0);
    regWE('wolf_elite_hd_hurt', 35, 39, 10, 0);
    regWE('wolf_elite_hd_die', 42, 46, 8, 0);
    regWE('wolf_elite_hd_howl', 49, 52, 8, 0);
    regWE('wolf_elite_hd_mv', 7, 13, 10, -1);
    if (ENEMY.bounty_wolf) { ENEMY.bounty_wolf.tex = 'wolf_elite_hd'; ENEMY.bounty_wolf.scale = 0.56; }
  }
  const ghd = IMGEL.mon_goblin_hd;
  if (ghd) {
    if (!T.exists('goblin_hd')) sc.textures.addSpriteSheet('goblin_hd', ghd, { frameWidth: 120, frameHeight: 84 });
    const regG = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('goblin_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regG('goblin_hd_idle', 0, 9, 8, -1);
    regG('goblin_hd_walk', 10, 19, 10, -1);
    regG('goblin_hd_run', 20, 29, 12, -1);
    regG('goblin_hd_bite', 30, 33, 10, 0);
    regG('goblin_hd_slash', 40, 45, 11, 0);
    regG('goblin_hd_hurt', 50, 55, 10, 0);
    regG('goblin_hd_die', 60, 64, 8, 0);
    regG('goblin_hd_mv', 10, 19, 10, -1);
    if (ENEMY.goblin) { ENEMY.goblin.tex = 'goblin_hd'; ENEMY.goblin.scale = 0.46; delete ENEMY.goblin.ch; }
  }
  const gahd = IMGEL.mon_goblin_archer_hd;
  if (gahd) {
    if (!T.exists('goblin_archer_hd')) sc.textures.addSpriteSheet('goblin_archer_hd', gahd, { frameWidth: 120, frameHeight: 84 });
    const regGA = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('goblin_archer_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regGA('goblin_archer_hd_idle', 0, 7, 8, -1);
    regGA('goblin_archer_hd_walk', 8, 15, 9, -1);
    regGA('goblin_archer_hd_run', 16, 24, 11, -1);
    regGA('goblin_archer_hd_shoot', 25, 29, 9, 0);
    regGA('goblin_archer_hd_rain', 30, 34, 9, 0);
    regGA('goblin_archer_hd_melee', 35, 40, 9, 0);
    regGA('goblin_archer_hd_hurt', 41, 45, 8, 0);
    regGA('goblin_archer_hd_die', 46, 50, 8, 0);
    regGA('goblin_archer_hd_mv', 8, 15, 9, -1);
    if (ENEMY.goblin_archer) {
      ENEMY.goblin_archer.tex = 'goblin_archer_hd';
      ENEMY.goblin_archer.scale = 0.46;
      delete ENEMY.goblin_archer.ch;
    }
  }
  const gehd = IMGEL.mon_goblin_elite;
  if (gehd) {
    if (!T.exists('goblin_elite')) sc.textures.addSpriteSheet('goblin_elite', gehd, { frameWidth: 96, frameHeight: 80 });
    const regGE = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('goblin_elite', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regGE('goblin_elite_idle', 0, 7, 8, -1);
    regGE('goblin_elite_walk', 8, 15, 9, -1);
    regGE('goblin_elite_run', 16, 19, 10, -1);
    regGE('goblin_elite_charge', 20, 23, 11, -1);
    regGE('goblin_elite_smash', 24, 28, 10, 0);
    regGE('goblin_elite_sweep', 29, 31, 9, 0);
    regGE('goblin_elite_hurt', 32, 34, 10, 0);
    regGE('goblin_elite_die', 35, 37, 7, 0);
    regGE('goblin_elite_roar', 38, 39, 6, -1);
    regGE('goblin_elite_mv', 8, 15, 9, -1);
    if (ENEMY.goblin_elite) {
      ENEMY.goblin_elite.tex = 'goblin_elite';
      ENEMY.goblin_elite.scale = 1.0;
      delete ENEMY.goblin_elite.ch;
    }
  }
}
