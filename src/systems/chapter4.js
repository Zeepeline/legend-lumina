'use strict';
// Bab 4 "Bisikan di Bawah Akar" (investigasi, tanpa boss) + Desa Kincir + prasasti lore. Lihat docs/GAME_DESIGN.md & docs/BENUA_LUMINA.md
// Tahap: 14 bicara Lina → 15 tanya 3 penduduk → 16 Pohon Induk malam → 17 Danau Cermin & kuil → 18 tanya Bram → 19 selesai
Object.assign(World.prototype, {
  spawnCh4() {
    const M = this.M;
    for (const [x, y, id] of M.loreSpots || []) this.inter.push({ x, y, r: 16, fn: () => this.readLore(id) });
    if (M.lanterns) {
      this.lanS = M.lanterns.map(([x, y], i) => {
        this.add.image(x, y, 'brazier').setOrigin(.5, 1).setDepth(y); this.wall(x - 8, y - 8, 16, 8);
        const f = this.add.sprite(x, y - 11, 'fire').play('fire').setRotation(-Math.PI / 2).setScale(1.1).setDepth(y + 1).setVisible(!!S.flags.lake_path);
        this.lights.push({ x, y: y - 12 }); this.inter.push({ x, y: y + 4, r: 16, fn: () => this.lightLantern(i) }); return f;
      });
      this.lanSeq = [];
    }
    if (M.boat) { const [x, y] = M.boat; this.add.image(x, y, 'boat').setOrigin(.5, 1).setDepth(y); this.inter.push({ x: x + 22, y: y - 4, r: 22, fn: () => this.useBoat() }); }
    if (M.reliefs) for (const [x, y, id] of M.reliefs) { this.add.image(x, y, 'relief').setOrigin(.5, 1).setDepth(y); this.inter.push({ x, y: y + 12, r: 20, fn: () => this.readLore(id) }); }
    if (M.sealDoor) { const [x, y] = M.sealDoor; this.sealS = this.add.image(x, y, S.lore.kuil_kamar ? 'sealdoor1' : 'sealdoor0').setOrigin(.5, 1).setDepth(y); this.inter.push({ x, y: y + 12, r: 20, fn: () => this.openSealDoor() }); }
    if (M.patok && S.side.patok >= 1) this.spawnPatok();
  },
  spawnPatok() { const [x, y] = this.M.patok || benuaField('patok'); this.add.image(x, y, 'stele').setOrigin(.5, 1).setScale(.7).setDepth(y); this.wall(x - 5, y - 5, 10, 5); this.inter.push({ x, y: y + 4, r: 14, fn: () => this.findPatok() }); },
  async readLore(id) {
    await talk(null, [LORE[id][2]]); learn(id); this.arsipRead(id);
    if (id === 'prasasti_desa' && S.stage === 16) await this.treeVision();
  },
  // ---- Pohon Induk: penglihatan malam ----
  async treeVision() {
    if (!isNight()) {
      if (!(await ask('Mimpi mereka selalu terjadi di malam hari. Tunggu di sini sampai malam?'))) return;
      G.lock++; await fadeTo(1); S.time = 21; await sleep(500); await fadeTo(0); G.lock--;
    }
    G.lock++;
    sfx('ice'); this.cameras.main.flash(900, 120, 220, 255); this.camShake(600, .004);
    this.sparkle(this.pl.x, this.pl.y - 16, 'dot', 30); await sleep(900);
    await talk(null, ['Tanda di telapak tanganmu menyala terang. Tanah di bawah kakimu terasa berdenyut...', 'Sekilas kamu melihat akar hitam yang sangat besar membelit kristal di bawah desa.', 'Lalu suara perempuan, lembut tapi jauh: "...Danau... cermin..."', 'Dan bayangan sebuah danau berkilau di barat, seperti cermin yang memantulkan bintang.']);
    learn('visi_pohon'); S.stage = 17; updHud(); banner('Cari Danau Cermin di barat desa', 'PENYELIDIKAN', false, 2400); G.lock--; saveGame(this);
  },
  // ---- Danau Cermin: lentera kuno ----
  async lightLantern(i) {
    if (S.flags.lake_path) return talk(null, ['Lentera kuno menyala tenang. Permukaan danau berkilau seperti cermin.']);
    if (S.stage < 17) return talk(null, ['Lentera batu kuno. Ada ukiran matahari di sisinya.']);
    const order = [0, 1, 2]; this.lanSeq.push(i); sfx('fire'); this.lanS[i].setVisible(true);
    const ok = this.lanSeq.every((v, k) => v === order[k]);
    if (!ok) {
      await sleep(400); sfx('buzz'); for (const f of this.lanS) f.setVisible(false); this.lanSeq = [];
      return talk(null, ['Apinya padam satu per satu... Urutannya salah. Mungkin prasasti di dermaga memberi petunjuk.']);
    }
    if (this.lanSeq.length < 3) return;
    S.flags.lake_path = 1; sfx('save'); this.cameras.main.flash(500, 220, 240, 255); this.sparkle(560, 500, 'dot', 30);
    banner('Jalan cahaya terbuka', 'DANAU CERMIN', true, 2200);
    await talk(null, ['Cahaya ketiga lentera memantul di permukaan danau, membentuk jalur berkilau menuju kuil di tengah danau.', 'Perahu di dermaga bergoyang pelan, seolah menunggu.']);
    saveGame(this);
  },
  async useBoat() {
    if (!S.flags.lake_path) return talk(null, ['Perahu tua. Setiap kali kamu mendorongnya, kabut tebal turun di tengah danau. Mungkin ada cara lain.']);
    if (!(await ask('Naik perahu menuju kuil di tengah danau?'))) return;
    this.goto('temple', 160, 224, 'up');
  },
  async openSealDoor() {
    if (S.lore.kuil_kamar) return talk(null, ['Kamar kecil yang sunyi. Buaian kosong itu masih di sana.']);
    if (!S.lore.kuil_relief || !S.lore.kuil_aurel) return talk(null, ['Pintu batu tanpa gagang. Ada ukiran telapak tangan di tengahnya. Mungkin pahami dulu relief di dinding kuil.']);
    G.lock++;
    await talk(null, ['Ukiran telapak tangan di pintu... bentuknya sama dengan tanganmu.', 'Kamu menempelkan tangan. Tanda daun di telapakmu menyala.']);
    sfx('save'); this.cameras.main.flash(700, 200, 240, 255); this.sealS.setTexture('sealdoor1'); await sleep(700);
    await talk(null, ['Pintu bergeser. Di dalam ada kamar kecil berdebu: sebuah buaian kosong, dan di atasnya gelang kecil dengan ukiran daun.', 'Siapa yang pernah tinggal di sini? Dan kenapa pintunya hanya terbuka oleh tanda di tanganmu?']);
    learn('kuil_kamar'); addItem('bracelet'); S.stage = 18; updHud();
    banner('Tanyakan Tetua Bram', 'PENYELIDIKAN', false, 2400); G.lock--; saveGame(this);
  },
  // ---- Desa Kincir: patok batas ladang ----
  async findPatok() {
    if (S.side.patok !== 1) return talk(null, ['Patok batu kuno: "Batas tanah keluarga Kincir. Disaksikan Penjaga Cahaya."']);
    await talk(null, ['Di antara rumput tinggi ada patok batu tua. Tulisannya: "Batas tanah keluarga Kincir. Disaksikan Penjaga Cahaya."', 'Batasnya jauh di selatan, bukan di kincir. Tunjukkan ini kepada Darma.']);
    S.side.patok = 2; sfx('ok'); updHud();
  },
  // Dialog cerita lama dinetralkan
  async storyTalk() { return false; },
});
