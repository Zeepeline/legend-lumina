'use strict';
// Pak Besi menempa memakai lembar sprite: landasan di peta = landasan di lembar (baris 4 kolom 7), jadi pose tempa menyatu dengan objek peta.
{
  const bt0 = buildTextures;
  buildTextures = function (sc) {
    const r = bt0.apply(this, arguments), img = IMGEL.npc_sheet_smith;
    if (img && img.width === 384 && !sc.textures.exists('anvil_besi')) {
      const c = document.createElement('canvas'); c.width = 18; c.height = 10;
      c.getContext('2d').drawImage(img, 7 * 48 + 15, 4 * 48 + 38, 18, 10, 0, 0, 18, 10); sc.textures.addCanvas('anvil_besi', c);
    }
    return r;
  };
  /* selama menempa: berdiri tepat di sisi landasan (st.at), tanpa dorongan fisika; selesai/disela → kembali ke titik langkah */
  const off = o => { if (!o.atPos) return; const [x, y] = o.atPos; o.atPos = null; o.spr.body.checkCollision.none = false; o.spr.setPosition(x, y); };
  const start0 = World.prototype.npcActStart;
  World.prototype.npcActStart = function (o, g) {
    start0.call(this, o, g);
    if (g.act !== 'job' || !g.job.at || !this.anims.exists(o.ch + '__hammer')) return;
    const K = jobOf(this, o); if (!K) return;
    o.atPos = [o.spr.x, o.spr.y]; o.spr.body.checkCollision.none = true; o.spr.setVelocity(0).setPosition(g.job.at[0] + K.ox, g.job.at[1] + K.oy);
  };
  const upd0 = World.prototype.updNpc;
  World.prototype.updNpc = function (o, dt, locked) {
    if (o.atPos && (o.st !== 'act' || o.duo || o.act || !o.goal || !o.goal.job || !o.goal.job.at)) { off(o); o.poseUntil = 0; this.face(o, o.dir); }
    upd0.call(this, o, dt, locked);
    if (o.atPos && o.carry) o.carry.setVisible(false); /* besinya sudah tergambar di landasan */
  };
}
