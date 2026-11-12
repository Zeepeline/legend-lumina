'use strict';
// Rasa bertarung (gelombang 3): ancang-ancang (#1), kombo (#2), musuh elit (#4),
// penanda bahaya (#14), animasi terkena (#89 sebagian), meteran waspada (#120), musuh menghindar (#146)
const ELITE_RATE = .06, ELITE_LOOT = ['shard', 'hipotion', 'ether'];
const DODGERS = ['fly', 'lunge', 'ghost'];
function markOver(sc, e, txt, col) {
  if (e.mk) e.mk.destroy();
  const s = e.spr, t = sc.add.text(s.x, s.y - s.displayHeight - 8, txt, { fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: col, stroke: '#1a0e08', strokeThickness: 3 }).setOrigin(.5, 1).setDepth(9000);
  e.mk = t; t.setScale(.4); sc.tweens.add({ targets: t, scale: 1, duration: 120, ease: 'Back.easeOut' });
  sc.time.delayedCall(650, () => { if (e.mk === t) e.mk = null; sc.tweens.add({ targets: t, alpha: 0, y: t.y - 6, duration: 200, onComplete: () => t.destroy() }); });
}
function dangerEdge(side) {
  const id = 'dg_' + side; let d = document.getElementById(id);
  if (!d) { d = document.createElement('div'); d.id = id; d.className = 'danger ' + side; UI.appendChild(d); }
  d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
}
Object.assign(World.prototype, {
  makeElite(e) {
    e.elite = true; e.hp = e.max = Math.round(e.max * 2.2);
    e.D = Object.assign({}, e.D, { atk: Math.round(e.D.atk * 1.3), exp: e.D.exp * 3, gold: (e.D.gold || [1, 2]).map(g => g * 3), name: (e.D.name || '') + ' Elit' });
    e.sc *= 1.15; e.spr.setScale(e.sc); e.eT = 3;
    e.aura = this.add.ellipse(e.spr.x, e.spr.y, 26 * e.sc, 10 * e.sc, 0xffd84a, .35).setDepth(e.spr.y - 1);
    this.tweens.add({ targets: e.aura, alpha: .1, scaleX: 1.3, scaleY: 1.3, duration: 600, yoyo: true, repeat: -1 });
  },
  // dipanggil tiap frame sesudah updEnemy
  updFeel(e, dt, locked) {
    const s = e.spr; if (locked || e.hp <= 0) return;
    if (e.mk) e.mk.setPosition(s.x, s.y - s.displayHeight - 8 - (e.D.fly ? 10 : 0));
    if (e.aura) e.aura.setPosition(s.x, s.y).setDepth(s.y - 1);
    if (e.boss) return;
    const pl = this.pl, d = Math.hypot(pl.x - s.x, pl.y - s.y);
    // meteran waspada: ? saat curiga, ! saat mengejar
    if (!e.alert && d < 165 && d >= 120) { e.alert = 1; markOver(this, e, '?', '#fff3c0'); }
    else if (e.alert !== 2 && d < 120 && !pl.dead) { e.alert = 2; markOver(this, e, '!', '#ff5a3a'); sfx('jump'); }
    else if (e.alert && d > 230) e.alert = 0;
    // ancang-ancang: tanda ! + kedip setiap kali musuh mulai bersiap menyerang
    const wind = ['wind', 'swind', 'cwind', 'throw'].includes(e.st);
    if (wind && !e.wasWind) { markOver(this, e, '!', '#ffd84a'); this.tweens.add({ targets: s, scaleX: e.sc * 1.12, duration: 80, yoyo: true, repeat: 1 }); }
    e.wasWind = wind;
    if (e.D.ai === 'shoot' && e.alert === 2 && e.shootT < .35 && !e.shootWarn) { e.shootWarn = 1; markOver(this, e, '!', '#ffd84a'); }
    if (e.shootT > .5) e.shootWarn = 0;
    // pola tambahan musuh elit: lingkaran peluru
    if (e.elite && e.alert === 2) { e.eT -= dt; if (e.eT <= .5 && !e.eW) { e.eW = 1; markOver(this, e, '!!', '#ffd84a'); } if (e.eT <= 0) { e.eT = rnd(3.5, 5); e.eW = 0; this.eShoot(e, 'seed', [0, 1, 2, 3, 4, 5, 6, 7].map(i => i * Math.PI / 4), Math.round(e.D.atk * .7), true); } }
    // musuh gesit menghindar dari bola api/panah
    if (DODGERS.includes(e.D.ai) && (e.dodgeCd = (e.dodgeCd || 0) - dt) <= 0) {
      for (const p of this.shots) {
        if (!p.mine) continue; const rx = s.x - p.gx, ry = s.y - p.gy, ahead = (rx * p.vx + ry * p.vy) / Math.hypot(p.vx, p.vy);
        if (ahead > 0 && ahead < 55 && Math.abs(rx * p.vy - ry * p.vx) / Math.hypot(p.vx, p.vy) < 14) {
          e.dodgeCd = 2.5; if (Math.random() < .45) { const n = Math.hypot(p.vx, p.vy), side = Math.random() < .5 ? 1 : -1; e.kb = .16; e.kbx = -p.vy / n * 190 * side; e.kby = p.vx / n * 190 * side; popWorld(s.x, s.y - 22, 'menghindar!', 'xp'); this.puff(s.x, s.y); }
          break;
        }
      }
    }
  },
  // penanda bahaya: serangan dari luar layar
  dangerFrom(sx, sy) {
    const v = this.cameras.main.worldView; if (v.contains(sx, sy)) return;
    const pl = this.pl, dx = sx - pl.x, dy = sy - pl.y;
    dangerEdge(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'));
  },
  // animasi terkena pukul pada Arka
  hurtAnim() { const pl = this.pl; this.tweens.add({ targets: pl, scaleX: 1.15, scaleY: .85, duration: 70, yoyo: true }); },
});
