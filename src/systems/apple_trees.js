'use strict';
// Sistem Pohon Apel Siklus Berbuah & Tanpa Buah (8 Frame Wind Sway)
// Menyimpan siklus panen di S.apple_trees[tid], otomatis bersemi kembali
// setelah siklus hari baru, waktu game 3 jam, atau 90 detik bermain.

function isAppleTreeFruiting(tid) {
  if (!S || !S.apple_trees) return true;
  const rec = S.apple_trees[tid];
  if (!rec) return true;
  const curDay = S.day || 1, curTime = S.time != null ? S.time : 8, curPlay = (S.st && S.st.playTime) || 0;
  // 1. Hari baru berlalu
  if (curDay > (rec.day || 1)) { delete S.apple_trees[tid]; return true; }
  // 2. Waktu game berlalu >= 3 jam
  const diffTime = curTime < (rec.time || 0) ? (curTime + 24 - rec.time) : (curTime - (rec.time || 0));
  if (diffTime >= 3) { delete S.apple_trees[tid]; return true; }
  // 3. Waktu bermain >= 90 detik
  if (curPlay - (rec.t || 0) >= 90) { delete S.apple_trees[tid]; return true; }
  return false;
}

function setupAppleTree(scene, s, x, y, opt, d, type) {
  const isOrange = type === 'orange1';
  const tid = opt?.id || (scene.M.id + '_apple_' + Math.round(x) + '_' + Math.round(y));
  let fruiting = isAppleTreeFruiting(tid);

  s.setScale(0.53);
  s.setOrigin(0.5, 0.96);

  if (scene.fades) {
    const fd = scene.fades.find(f => f.s === s);
    if (fd) {
      fd.l = x - 32; fd.r = x + 32; fd.t = y - 72; fd.b = y - 8;
    }
  }

  const applyTreeVisual = () => {
    const hasOrangeTex = isOrange && scene.textures.exists('orange1');
    const texKey = hasOrangeTex ? 'orange1' : (fruiting ? 'tree_apple_fruit' : 'tree_apple_bare');
    const animKey = hasOrangeTex ? null : (fruiting ? 'tree_apple_fruit_sway' : 'tree_apple_bare_sway');
    if (scene.textures.exists(texKey)) {
      s.setTexture(texKey);
    }
    if (animKey && scene.anims.exists(animKey)) {
      const curIdx = s.anims && s.anims.currentFrame ? s.anims.currentFrame.index - 1 : Math.abs(Math.round(x * 7 + y * 13)) % 8;
      s.play({ key: animKey, startFrame: curIdx });
      s.anims.timeScale = 0.85 + (Math.abs(Math.sin(x * 12.9898 + y * 78.233)) * 0.3);
    }
  };

  applyTreeVisual();

  // Daftarkan pohon apel aktif ke scene untuk pengecekan pemulihan berbuah otomatis
  if (!scene._appleTrees) scene._appleTrees = [];
  scene._appleTrees.push({
    s, x, y, tid, isOrange,
    checkFruit: () => {
      const nowFruiting = isAppleTreeFruiting(tid);
      if (nowFruiting && !fruiting) {
        fruiting = true;
        applyTreeVisual();
        scene.sparkle(x, y - 20, 'dotg', 12);
        popWorld(x, y - 24, 'Bunga Apel Mekar!', 'xp');
      }
    }
  });

  scene.inter.push({
    x, y: y - 10, r: 22,
    name: isOrange ? 'Pohon Jeruk' : (fruiting ? 'Pohon Apel (Berbuah)' : 'Pohon Apel (Tumbuh)'),
    fn: async () => {
      G.lock++;
      sfx('swing');
      scene.tweens.add({
        targets: s, angle: 4, duration: 70, yoyo: true, repeat: 4,
        onComplete: () => { s.angle = 0; }
      });
      scene.puff(x, y - 6);

      for (let i = 0; i < 4; i++) {
        const leaf = scene.add.image(x + rnd(-16, 16), y - 24, 'leaf').setDepth(y + 1);
        scene.tweens.add({
          targets: leaf, y: y + rnd(-4, 6), x: leaf.x + rnd(-12, 12),
          angle: rnd(-30, 30), alpha: 0, duration: rnd(600, 900),
          onComplete: () => leaf.destroy()
        });
      }

      fruiting = isAppleTreeFruiting(tid);
      if (fruiting) {
        const fruitId = isOrange ? 'orange' : 'apple';
        const count = Math.random() < 0.3 ? 2 : 1;
        addItem(fruitId, count);
        sfx('blip');
        updHud();
        scene.sparkle(x, y - 12, 'dotg', 10);
        popWorld(x, y - 20, `+${count} ${ITEMS[fruitId]?.n || 'Apel'}`, 'xp');

        // Catat waktu panen
        S.apple_trees = S.apple_trees || {};
        S.apple_trees[tid] = {
          day: S.day || 1,
          time: S.time != null ? S.time : 8,
          t: (S.st && S.st.playTime) || 0
        };

        // Ganti langsung ke pohon tanpa buah
        fruiting = false;
        applyTreeVisual();
        await say(
          `Kamu menggoyang dahan pohon dengan kuat. ${count} buah ${ITEMS[fruitId]?.n || 'apel'} ranum jatuh ke tanganmu!\n` +
          '(Pohon kini tanpa buah, tunggu siklus berikutnya)'
        );
      } else {
        const roll = Math.random();
        if (roll < 0.25) {
          const coinGain = rnd(3, 7);
          S.gold += coinGain; sfx('coin'); updHud();
          scene.sparkle(x, y - 12, 'doto', 8);
          popWorld(x, y - 20, `+${coinGain} G`, 'gold');
          await say(`Terdengar bunyi gemerincing dari sela dahan! Seseorang tampaknya pernah menyembunyikan koin tua di sini (+${coinGain} G).`);
        } else if (roll > 0.90) {
          sfx('buzz'); sfx('hurt');
          scene.camShake(180, .005);
          const st = stat();
          const dmg = Math.min(S.hp - 1, 6);
          if (dmg > 0) S.hp -= dmg;
          updHud();
          addItem('honey', 1);
          popWorld(scene.pl.x, scene.pl.y - 18, `-${dmg} HP (Sengatan Lebah!)`, 'crit');
          await say(
            `DENGG!! Kawanan lebah liar terusik dari sarangnya dan menyengatmu (-${dmg} HP), ` +
            'namun kamu berhasil mengamankan Sarang Madu Liar! (+1 Madu Liar)'
          );
        } else {
          await say('Dedaunan berguguran tertiup angin sepoi-sepoi. Pohon apel ini masih dalam masa tumbuh dan belum berbuah kembali.');
        }
      }
      G.lock--;
    }
  });
}
