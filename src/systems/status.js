'use strict';
// Efek status: racun/terbakar/dingin pada pemain, terbakar/beku pada musuh
// Pemain: this.pst = { poison, burn, chill } (sisa detik). Musuh: e.burn, e.frz.
// Sumber: ENEMY[..].fx / PROJ[..].fx = ['poison'|'burn'|'chill', detik, peluang 0-1]
const STATUS = {
  poison: { n: 'Racun', ic: '☠', tint: 0xb8f0a0, every: 1, dmg: () => 2 + Math.floor(S.lv * .4), c: 'hurt' },
  burn: { n: 'Terbakar', ic: '🔥', tint: 0xffc090, every: .5, dmg: () => 2 + Math.floor(S.lv * .3), c: 'crit' },
  chill: { n: 'Dingin', ic: '❄', tint: 0xb0e0ff, every: 0, slow: .55, c: 'mpc' },
};
Object.assign(World.prototype, {
  // Beri status ke pemain. fx = [jenis, detik, peluang]
  inflict(fx) {
    if (!fx || this.pl.dead) return; const [k, sec, ch = 1] = fx;
    if (Math.random() > ch) return;
    if (k === 'poison' && S.eq.acc === 'amulet') return; // Jimat Daun kebal racun
    if (k === 'chill' && buffOn('warm')) return; // Sup Jahe: kebal dingin
    const fresh = !(this.pst[k] > 0); this.pst[k] = Math.max(this.pst[k] || 0, sec);
    if (fresh) { popWorld(this.pl.x, this.pl.y - 38, STATUS[k].n + '!', STATUS[k].c); this.pstT[k] = STATUS[k].every; }
    updStatusHud(this);
  },
  cure(k) { if (k) delete this.pst[k]; else this.pst = {}; this.pl.clearTint(); updStatusHud(this); },
  speedMul() {
    let mul = this.pst.chill > 0 ? STATUS.chill.slow : 1;
    if (this.pl && this.pl.snowSlow) mul *= 0.75; // Salju tebal memperlambat langkah (#68)
    return mul;
  },
  updStatus(dt) {
    const pl = this.pl; let any = null;
    for (const k in S.buff) { if (S.buff[k] > 0) { S.buff[k] -= dt; if (S.buff[k] <= 0) { delete S.buff[k]; popWorld(pl.x, pl.y - 38, 'Efek ' + BUFF[k].n + ' habis', 'xp'); updStatusHud(this); updHud(); } } }
    for (const k in this.pst) {
      if (!(this.pst[k] > 0)) continue;
      this.pst[k] -= dt; any = k; const D = STATUS[k];
      if (D.every) { this.pstT[k] -= dt; if (this.pstT[k] <= 0) { this.pstT[k] = D.every; if (S.hp > 1) { const d = Math.min(D.dmg(), S.hp - 1); S.hp -= d; popWorld(pl.x + rnd(-6, 6), pl.y - 30, '-' + d, D.c); updHud(); } } }
      if (Math.random() < dt * 6) this.sparkle(pl.x + rnd(-5, 5), pl.y - rnd(8, 20), k === 'chill' ? 'dot' : k === 'burn' ? 'doto' : 'dotg', 1);
      if (this.pst[k] <= 0) { delete this.pst[k]; updStatusHud(this); if (!Object.keys(this.pst).length) pl.clearTint(); }
    }
    if (any && !this.charged && pl.inv <= 0) pl.setTint(STATUS[any].tint);
  },
  // Status pada musuh. Kembalikan true jika musuh beku (lewati AI).
  enemyStatus(e, dt) {
    const s = e.spr;
    if (e.burn > 0) {
      e.burn -= dt; e.burnT = (e.burnT || 0) - dt;
      if (e.burnT <= 0) { e.burnT = .5; const d = Math.max(1, Math.round(e.burnDmg - e.D.def * .3)); e.hp -= d; popWorld(s.x + rnd(-5, 5), s.y - s.displayHeight - 4, '' + d, 'crit'); if (e.boss) bossBar(e.D.name, e.hp / e.max); if (e.hp <= 0) { this.killEnemy(e); return true; } }
      if (Math.random() < dt * 8) this.sparkle(s.x + rnd(-5, 5), s.y - rnd(4, s.displayHeight), 'doto', 1);
      if (e.flash <= 0 && !(e.frz > 0)) s.setTint(0xffb080);
      if (e.burn <= 0 && e.flash <= 0) s.clearTint();
    }
    if (e.frz > 0) {
      e.frz -= dt; s.setVelocity(0); s.anims.pause(); if (e.flash <= 0) s.setTint(0x9ad8ff);
      if (e.frz <= 0) { s.anims.resume(); s.clearTint(); }
      return e.frz > 0;
    }
    return false;
  },
  burnEnemy(e, dmg, sec = 2) { if (e.hp <= 0) return; e.burn = Math.max(e.burn || 0, sec); e.burnDmg = dmg; },
  freezeEnemy(e, sec) { if (e.hp <= 0) return; if (!(e.frz > 0)) popWorld(e.spr.x, e.spr.y - e.spr.displayHeight - 10, 'beku!', 'mpc'); e.frz = e.boss ? sec * .3 : sec; },
});
// Ikon status di HUD (sebelah jam)
function updStatusHud(sc) {
  let el = $('hSt'); const h2 = $('hud2'); if (!h2) return;
  if (!el) { el = document.createElement('span'); el.id = 'hSt'; h2.appendChild(el); }
  const ks = Object.keys(sc.pst).filter(k => sc.pst[k] > 0);
  const bs = Object.keys(S.buff || {}).filter(k => S.buff[k] > 0);
  el.textContent = ks.map(k => STATUS[k].ic).join('') + bs.map(k => BUFF[k].ic).join(''); el.style.display = ks.length + bs.length ? '' : 'none';
}
