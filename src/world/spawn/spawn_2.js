'use strict';
// Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World
Object.assign(OBJ_SPAWN, {
  brokenbridge(s, x, y, opt, d, type) {
    if (S.flags && S.flags.bridge_fixed) {
      s.setTexture('log').setScale(1.2, 0.9);
    } else {
      s.setTint(0x8a7050);
      this.inter.push({
        x, y: y + 2, r: 24,
        fn: async () => {
          if (S.flags && S.flags.bridge_fixed) {
            await say('Jembatan kayu telah diperbaiki dengan kokoh!');
            return;
          }
          const canFix = has('log', 5) && S.gold >= 40;
          if (await ask(`Jembatan kayu tua ini ambruk. Perbaiki jembatan pintas? (Butuh: 5 Kayu & 40 G · Punya: ${S.inv.log || 0}/5 kayu, ${S.gold} G)`)) {
            if (canFix) {
              G.lock++;
              addItem('log', -5);
              S.gold -= 40;
              S.flags = S.flags || {};
              S.flags.bridge_fixed = 1;
              sfx('boom');
              await sleep(250);
              sfx('chest');
              this.sparkle(x, y - 8, 'spark', 12);
              s.clearTint().setTexture('log').setScale(1.2, 0.9);
              updHud();
              if (typeof checkTitles === 'function') checkTitles();
              await say('KLOK! KLOK! Jembatan kayu berhasil diperbaiki! Jalan pintas menyeberang sungai kini terbuka lebar.');
              G.lock--;
            } else {
              sfx('buzz');
              await say('Bahan kayu atau koin belum mencukupi (Perlu 5 Kayu & 40 G).');
            }
          }
        }
      });
    }
  },
  board(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 4, r: 18,
      fn: async () => {
        if (typeof openNoticeBoard === 'function') await openNoticeBoard();
        else await this.bountyBoard();
      }
    });
  },
  bombbarrel(s, x, y, opt, d, type) {
    s.setTint(0xff5533);
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        if (s._exploded) return;
        s._exploded = true;
        sfx('fire');
        popWorld(x, y - 20, 'FUSSS...', 'crit');
        this.tweens.add({
          targets: s,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 120,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            this.shockwave(x, y, 55, 30);
            for (const e of this.enemies) {
              if (e.hp > 0 && Math.hypot(e.spr.x - x, e.spr.y - y) < 60) {
                this.hitEnemy(e, 45, true, (e.spr.x - x) || 1, (e.spr.y - y) || 1);
              }
            }
            this.puff(x, y - 6);
            s.destroy();
          }
        });
      }
    });
  },
  bramble(s, x, y, opt, d, type) {
    s.setTint(0x7a6855);
  },
  minestone(s, x, y, opt, d, type) {
    s.minedHp = 3;
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        G.lock++;
        sfx('boom');
        this.camShake(80, .003);
        this.sparkle(x, y - 10, 'spark', 8);
        s.minedHp = (s.minedHp || 3) - 1;
        this.tweens.add({ targets: s, angle: 5, duration: 60, yoyo: true, repeat: 2, onComplete: () => { s.angle = 0; } });
        if (s.minedHp <= 0) {
          this.puff(x, y - 8);
          sfx('crit');
          addItem('ore', ri(1, 2));
          addItem('shard', 1);
          if (Math.random() < 0.35) addItem('amethyst_gem', 1);
          S.st = S.st || {}; S.st.mined = (S.st.mined || 0) + 1;
          popWorld(x, y - 24, '+Hasil Tambang!', 'gold');
          updHud();
          s.destroy();
          await say('KRAKK!! Batu urat tambang pecah berkeping-keping! Kamu mendapatkan Bijih Batu dan Pecahan Kristal langka.');
        } else {
          await say(`TANGG! Kamu memahat urat batu tambang (${s.minedHp}/3 retakan). Lanjutkan memahat!`);
        }
        G.lock--;
      }
    });
  },
  village_vault(s, x, y, opt, d, type) {
    s.setTint(0x9aa8b8);
    this.inter.push({
      x, y: y + 4, r: 24,
      fn: async () => {
        if (typeof openVillageVault === 'function') await openVillageVault(this);
        else await say('Brankas besi kokoh Balai Desa Lumina.');
      }
    });
  },
  mirror_memory(s, x, y, opt, d, type) {
    s.setTint(0x88ccff);
    this.inter.push({
      x, y: y + 4, r: 24,
      fn: async () => {
        if (typeof openMemoryTrials === 'function') await openMemoryTrials(this);
        else await say('Cermin Ingatan memancarkan pantulan masa lalu.');
      }
    });
  },
  fame_board(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 4, r: 22,
      fn: async () => {
        if (typeof openHallOfFame === 'function') await openHallOfFame();
        else await say('Papan Rekor Petualang Benua Lumina.');
      }
    });
  },
  bounty_board(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 4, r: 22,
      fn: async () => {
        if (typeof openCityBounties === 'function') await openCityBounties(this);
        else await say('Papan Buronan Monster Langka Kota Lumina.');
      }
    });
  },
  deadtree(s, x, y, opt, d, type) {
    s.setTint(0x7a6552);
    s.chopHp = 3;
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        G.lock++;
        sfx('hit');
        this.sparkle(x, y - 10, 'spark', 6);
        this.puff(x + rnd(-8, 8), y - 6);
        s.chopHp = (s.chopHp || 3) - 1;
        this.tweens.add({ targets: s, angle: 6, duration: 60, yoyo: true, repeat: 2, onComplete: () => { s.angle = 0; } });
        if (s.chopHp <= 0) {
          sfx('boom');
          this.camShake(100, 0.005);
          addItem('log', ri(3, 4));
          S.st = S.st || {}; S.st.trees = (S.st.trees || 0) + 1;
          popWorld(x, y - 20, '+Kayu Gelondong!', 'gold');
          updHud();
          s.destroy();
          await say('KRAAAKKK! Pohon lapuk tumbang dan terbelah menjadi kayu gelondong melimpah.');
        } else {
          await say(`TEBAS! Ayunan kapak menancap ke batang lapuk (${s.chopHp}/3 tebasan).`);
        }
        G.lock--;
      }
    });
  },
  rune_pillar(s, x, y, opt, d, type) {
    const pElem = d.elem || 'fire'; // 'fire', 'ice', 'light'
    const pColor = pElem === 'fire' ? 0xff6644 : pElem === 'ice' ? 0x66ccff : 0xffea00;
    s.setTint(pColor);
    this.inter.push({
      x, y: y + 4, r: 22,
      fn: async () => {
        if (typeof interactRunePillar === 'function') await interactRunePillar(this, s, pElem, x, y);
        else await say(`Pilar Runa Kuno berukir simbol ${pElem}.`);
      }
    });
  },
  fountain(s, x, y, opt, d, type) {
    this.add.particles(x, y - 66, 'dot', { lifespan: 650, speedX: { min: -22, max: 22 }, speedY: { min: -26, max: -8 }, gravityY: 90, alpha: { start: .8, end: 0 }, frequency: 110, tint: 0xd8f6ff }).setDepth(y + 1);
    this.inter.push({
      x, y: y + 8, r: 26,
      fn: async () => {
        await this.interactFountain(x, y);
      }
    });
  },
  windmill(s, x, y, opt, d, type) {
    { const b = this.add.image(x, y - 70, 'blades').setDepth(y + 1); this.tweens.add({ targets: b, angle: 360, duration: 7000, repeat: -1 }); this.fades.push({ s: b, l: x - 36, r: x + 36, t: y - 110, b: y - 22 }); }
  },
  cryst(s, x, y, opt, d, type) {
    this.lights.push({ x, y: y - 8 });
  },
  lamp(s, x, y, opt, d, type) {
    this.lights.push({ x, y: y - 24, big: 1 });
  },
  viewpoint(s, x, y, opt, d, type) {
    this.lights.push({ x, y: y - 10 });
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        G.lock++;
        sfx('bell');
        this.sparkle(x, y - 12, 'spark', 14);
        const vid = opt?.id || (this.M.id + '_' + x + '_' + y);
        S.viewpoints = S.viewpoints || {};
        const isNew = !S.viewpoints[vid];
        S.viewpoints[vid] = 1;
        const name = opt?.name || ('Puncak ' + this.M.name);
        // Buka kabut peta di sekitar viewpoint
        if (typeof fogOf === 'function') {
          const f = fogOf(this.M.id).split(''), cw = this.M.w / 20, ch = this.M.h / 20;
          for (let cy = 0; cy < 20; cy++) for (let cx = 0; cx < 20; cx++) {
            if (Math.hypot((cx + .5) * cw - x, (cy + .5) * ch - y) < 360) f[cy * 20 + cx] = '1';
          }
          S.fog[this.M.id] = f.join(''); this.miniFor = null;
        }
        if (isNew) {
          S.exp += 35;
          banner(name, 'TITIK PANDANG DITEMUKAN', true, 2000);
          popWorld(x, y - 28, '+35 EXP · Panorama Terbuka!', 'crit');
          sfx('save');
          updHud();
          await sleep(1200);
        }
        await say(`Kamu berdiri di ${name}. Hamparan benua Lumina terbentang luas sejauh mata memandang. Peta area ini terbuka jelas!`, 'Titik Pandang');
        G.lock--;
      }
    });
  },
  lumina_shard(s, x, y, opt, d, type) {
    const sid = opt?.id || (this.M.id + '_shard_' + x + '_' + y);
    if (S.shards && S.shards[sid]) { s.destroy(); return; }
    this.lights.push({ x, y: y - 8, big: 1 });
    s.y -= 8;
    this.tweens.add({ targets: s, y: s.y - 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.inter.push({
      x, y, r: 18,
      fn: async () => {
        if (S.shards && S.shards[sid]) return;
        S.shards = S.shards || {};
        S.shards[sid] = 1;
        sfx('spark');
        this.sparkle(x, y - 8, 'spark', 16);
        s.destroy();
        const total = Object.keys(S.shards).length;
        gainExp(this, 50);
        banner(`PECAHAN LUMINA (${total})!`, '+50 EXP · Kristal Langka Ditemukan', true, 1600);
        updHud();
      }
    });
  },
});
OBJ_SPAWN.stele = OBJ_SPAWN.sign;
OBJ_SPAWN.bloom = OBJ_SPAWN.pot;
OBJ_SPAWN.apple2 = OBJ_SPAWN.apple1;
OBJ_SPAWN.orange1 = OBJ_SPAWN.apple1;
OBJ_SPAWN.benchWood = OBJ_SPAWN.bench;
OBJ_SPAWN.crystp = OBJ_SPAWN.cryst;
