'use strict';
// Sistem Warga Latar Ringan (Ambient Crowd) — ala Stoneshard / Assassin's Creed.
// Warga non-kunci berjalan santai di jalan setapak perkotaan/pedesaan tanpa membebani game state atau save.

const CROWD_POOL = ['boy', 'girl', 'farmer', 'merchant', 'elder', 'woman', 'child', 'darma', 'joko'];

Object.assign(World.prototype, {
  spawnCrowd(n = 6, area) {
    if (!this.crowd) this.crowd = [];
    const M = this.M;
    if (!M) return;
    const count = Math.min(Math.max(1, n), 12);
    const paths = (M.paths && M.paths.length) ? M.paths : [[M.w / 2, M.h / 2, M.w / 2, M.h / 2, 20]];

    for (let i = 0; i < count; i++) {
      // Pilih segmen jalan setapak secara acak
      const seg = paths[Math.floor(Math.random() * paths.length)];
      const t = Math.random();
      const sx = Math.round(seg[0] + (seg[2] - seg[0]) * t);
      const sy = Math.round(seg[1] + (seg[3] - seg[1]) * t);

      // Pilih tipe karakter acak yang valid
      const ch = CROWD_POOL[Math.floor(Math.random() * CROWD_POOL.length)];
      const texKey = 'ch_' + ch;
      if (!this.textures.exists(texKey)) continue;

      const spr = this.physics.add.sprite(sx, sy, texKey, 'down0').setOrigin(.5, 1).setDepth(sy);
      spr.body.setSize(12, 7).setOffset((spr.width - 12) / 2, spr.height - 8);
      spr.setImmovable(true);
      spr.setCollideWorldBounds(true);
      if (this.walls) this.physics.add.collider(spr, this.walls);

      const sh = this.add.image(sx, sy, 'shadow').setAlpha(.22);
      const person = {
        spr, sh, ch,
        speed: rnd(18, 28),
        tx: sx, ty: sy,
        idleT: rnd(1, 3),
        walking: false,
        dir: 'down'
      };

      // Interaksi sapaan ringan satu baris
      this.inter.push({
        x: sx, y: sy, r: 18,
        crowdPerson: person,
        fn: () => {
          const lines = (typeof cityLines !== 'undefined' && (cityLines.warga || cityLines.pedagang))
            ? (Math.random() < .5 ? cityLines.warga : cityLines.pedagang)
            : ['Hari yang cerah di Lumina.', 'Semoga harimu menyenangkan, petualang!'];
          const line = lines[Math.floor(Math.random() * lines.length)];
          say(line, 'Warga');
        }
      });

      this.crowd.push(person);
    }
  },

  updCrowd(dt) {
    if (!this.crowd || !this.crowd.length) return;
    const pl = this.pl;
    const paths = this.M && this.M.paths;

    for (let i = this.crowd.length - 1; i >= 0; i--) {
      const c = this.crowd[i];
      if (!c.spr || !c.spr.active) {
        if (c.sh && c.sh.active) c.sh.destroy();
        this.crowd.splice(i, 1);
        continue;
      }

      // Optimasi Kinerja HP: Culling jika di luar 500 px dari Arka
      const dPl = pl ? Math.hypot(c.spr.x - pl.x, c.spr.y - pl.y) : 0;
      if (dPl > 500) {
        c.spr.setVelocity(0, 0);
        continue;
      }

      const s = c.spr;
      s.setDepth(s.y);
      if (c.sh) c.sh.setPosition(s.x, s.y);

      // Pembaruan posisi interaksi
      const it = this.inter.find(item => item.crowdPerson === c);
      if (it) { it.x = s.x; it.y = s.y; }

      if (c.idleT > 0) {
        c.idleT -= dt;
        s.setVelocity(0, 0);
        if (c.walking) {
          c.walking = false;
          s.anims.stop();
          const sd = (c.dir === 'left' || c.dir === 'right') ? 'side' : c.dir;
          s.setFrame(sd + '0');
        }
        continue;
      }

      // Jika belum punya target jalan atau sudah dekat target
      const distToTarget = Math.hypot(c.tx - s.x, c.ty - s.y);
      if (distToTarget < 8 || !c.walking) {
        c.idleT = rnd(1.5, 4.0);
        c.walking = false;
        s.setVelocity(0, 0);
        // Pilih target baru di jalan setapak
        if (paths && paths.length) {
          const seg = paths[Math.floor(Math.random() * paths.length)];
          const t = Math.random();
          c.tx = Math.round(seg[0] + (seg[2] - seg[0]) * t);
          c.ty = Math.round(seg[1] + (seg[3] - seg[1]) * t);
        }
        continue;
      }

      // Berjalan menuju target
      c.walking = true;
      const angle = Math.atan2(c.ty - s.y, c.tx - s.x);
      const vx = Math.cos(angle) * c.speed;
      const vy = Math.sin(angle) * c.speed;
      s.setVelocity(vx, vy);

      // Orientasi arah hadap & animasi jalan
      let dir = 'down';
      if (Math.abs(vx) > Math.abs(vy)) dir = vx < 0 ? 'left' : 'right';
      else dir = vy < 0 ? 'up' : 'down';
      c.dir = dir;
      s.flipX = dir === 'left';

      const animDir = (dir === 'left' || dir === 'right') ? 'side' : dir;
      const animKey = c.ch + '_' + animDir;
      if (this.anims.exists(animKey) && s.anims.currentAnim?.key !== animKey) {
        s.play(animKey);
      }
    }
  },

  clearCrowd() {
    if (!this.crowd) return;
    for (const c of this.crowd) {
      if (c.spr && c.spr.active) c.spr.destroy();
      if (c.sh && c.sh.active) c.sh.destroy();
    }
    this.crowd = [];
    if (this.inter) this.inter = this.inter.filter(it => !it.crowdPerson);
  }
});

// Sambungkan ke update loop scene
const _updAmbP = World.prototype.updAmbient;
World.prototype.updAmbient = function (dt) {
  if (this.updCrowd) this.updCrowd(dt);
  return _updAmbP.call(this, dt);
};
