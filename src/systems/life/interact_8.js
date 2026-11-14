'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
  async interactLighthouse(lx, ly, spr) {
    if (this._inLighthouse) return;
    this._inLighthouse = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Mercusuar Tua Danau Cermin', [
      'Nyalakan Lentera Cermin Mercusuar (Sapu Kabut Danau)',
      'Naik ke Balkon Menara & Pandang Danau',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Light the lighthouse beacon
      sfx('fire');
      this.time.delayedCall(200, () => sfx('crit'));
      this.time.delayedCall(450, () => sfx('bell'));
      this.cameras.main.flash(600, 255, 240, 200);

      // Light glow at lantern chamber
      this.lights.push({ x: lx, y: ly - 42, r: 90 });

      // Golden and silver light sparkles cascading across lake surface
      for (let i = 0; i < 20; i++) {
        this.time.delayedCall(i * 60, () => {
          this.sparkle(lx - 40 - i * 18, ly + rnd(-20, 20), [0xffea78, 0x9ad8ff, 0xffffff][i % 3]);
        });
      }
      await sleep(900);

      const st = stat();
      S.mp = st.maxmp;
      updHud();

      popWorld(lx, ly - 36, '✨ Cahaya Mercusuar Memancar! (MP Penuh)', 'crit');

      // Check if first time lighting
      if (!S.flags.lighthouse_lit) {
        S.flags.lighthouse_lit = 1;
        addItem('lake_pearl', 1);
        updHud();
        sfx('chest');
        popWorld(lx, ly - 48, '+1 Mutiara Danau Cermin!', 'gold');
        await say(
          'Cahaya mercusuar membelah kabut danau dengan megah, memantulkan berkas keemasan di atas permukaan air bagai jutaan cermin!\n' +
          'Kakek penjaga mercusuar meneteskan air mata haru:\n' +
          '"Akhirnya mercusuar ini menyala kembali setelah sekian lama padam... ' +
          'Terimalah Mutiara Danau Cermin ini sebagai tanda terima kasih para pelaut danau!" ' +
          '(+1 Mutiara Danau Cermin & MP Penuh)!',
          'Lentera Danau'
        );
      } else {
        await say(
          'Sorotan cahaya mercusuar memantul anggun di atas tenangnya Danau Cermin. ' +
          'Jiwamu dipenuhi ketenangan dan kejernihan batin (MP Penuh)!',
          'Mercusuar Danau'
        );
      }
    } else if (opt === 1) {
      // Look from balcony
      sfx('water');
      for (let i = 0; i < 6; i++) {
        this.sparkle(this.pl.x + rnd(-10, 10), this.pl.y - rnd(6, 20), 0x9ad8ff);
      }
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 25);
      S.mp = Math.min(st.maxmp, S.mp + 25);
      updHud();
      popWorld(this.pl.x, this.pl.y - 20, 'Panorama Indah (+25 HP/MP)', 'gold');
      await say(
        'Dari balkon kayu mercusuar, hembusan angin sejuk bertiup lembut. ' +
        'Permukaan danau terbentang luas memantulkan awan putih yang berarak damai (+25 HP, +25 MP)!',
        'Balkon Mercusuar'
      );
    }

    this._inLighthouse = false;
    G.lock--;
  },
});
