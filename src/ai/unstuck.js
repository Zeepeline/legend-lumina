'use strict';
// Aturan Lepas-Sangkut Musuh Saat Mengejar (T468) — referensi: Hades
// Kalau musuh sedang mengejar (aggro) dan bergerak < 2 px selama 0.6 detik,
// belok tegak lurus arah ke pemain selama 0.5 detik (pilih sisi yang tidak menabrak).

(() => {
  const _origUpdEnemy = World.prototype.updEnemy;
  World.prototype.updEnemy = function (e, dt) {
    if (!e || e.hp <= 0 || !e.spr || !e.spr.active) {
      return _origUpdEnemy.apply(this, arguments);
    }

    const s = e.spr;
    const pl = this.pl;

    // Hitung posisi sebelum update AI
    const prevX = s.x, prevY = s.y;

    _origUpdEnemy.apply(this, arguments);

    // Jangan proses jika musuh mati, boss, sedang stun/terkena hitstop, atau pemain mati
    if (!s.active || e.hp <= 0 || e.boss || e.staggerT > 0 || (pl && pl.dead)) return;

    const dx = pl.x - s.x, dy = pl.y - s.y;
    const d = Math.hypot(dx, dy);

    // Hanya aktif saat mengejar Arka (jarak pandang wajar 50..220 px)
    const isChasing = d >= 40 && d <= 260 && !e.calmT;
    if (!isChasing) {
      e._stuckT = 0;
      e._unstuckT = 0;
      return;
    }

    // Jika sedang dalam status un-stuck (belok tegak lurus)
    if (e._unstuckT > 0) {
      e._unstuckT -= dt;
      const spd = e.D?.spd || 45;
      const perpX = -dy / d * (e._unstuckSide || 1);
      const perpY = dx / d * (e._unstuckSide || 1);
      s.setVelocity(perpX * spd * 0.9, perpY * spd * 0.9);
      if (Math.abs(s.body.velocity.x) > 2) s.flipX = s.body.velocity.x > 0;
      return;
    }

    // Cek apakah posisi berpindah < 2 px selama 0.6 detik
    const moved = Math.hypot(s.x - prevX, s.y - prevY);
    if (moved < 2 * dt * 60) {
      e._stuckT = (e._stuckT || 0) + dt;
      if (e._stuckT >= 0.6) {
        e._stuckT = 0;
        e._unstuckT = 0.5; // belok selama 0.5 detik
        // Tentukan sisi (kiri atau kanan relatif terhadap arah pemain)
        e._unstuckSide = (e._unstuckSide === 1) ? -1 : 1;
      }
    } else {
      e._stuckT = Math.max(0, (e._stuckT || 0) - dt * 0.5);
    }
  };
})();
