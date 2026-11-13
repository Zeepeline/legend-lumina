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
  // Dialog cerita yang menimpa dialog biasa. Kembalikan true jika sudah ditangani.
  async storyTalk(id, nm, T, gain, n) {
    const st = S.stage;
    if (n && n.lines) { await T(pick(n.lines)); return true; }
    // ---- Bab 4 ----
    if (id === 'girl' && st === 14) {
      await T('Kak Arka... aku mimpi buruk lagi semalam. Akar hitam di bawah rumah kita, dan seorang wanita bercahaya yang menangis.', 'Mama juga memimpikannya. Kata Mama, banyak orang desa bermimpi hal yang sama.', 'Kak... tolong cari tahu ya?');
      S.stage = 15; updHud(); banner('Tanyai penduduk tentang mimpi buruk', 'BAB 4 · BISIKAN DI BAWAH AKAR', true, 2800); saveGame(this); return true;
    }
    if (st === 15 && ['farmer', 'merchant', 'child'].includes(id)) {
      const k = { farmer: 'm_darto', merchant: 'm_sari', child: 'm_dodi' }[id];
      if (!S.flags[k]) {
        if (id === 'farmer') await T('Mimpi? Iya... akar hitam merayap dari bawah kebunku. Wanita bercahaya itu berdiri di atasnya, menahan akarnya dengan tangan.', 'Aneh, ya. Sejak kecil aku tak pernah bermimpi seburuk ini.');
        if (id === 'merchant') await T('Kamu juga dengar? Aku memimpikannya tiga malam berturut-turut.', 'Wanita itu memanggil sebuah nama, tapi aku tak bisa mendengarnya. Lalu akarnya menelan cahaya.', 'Oh ya, pedagang keliling bilang orang di Kota Lumina juga gelisah. Entah ada hubungannya atau tidak.');
        if (id === 'child') await T('Aku mimpi wanita bercahaya! Dia lihat ke arahku dan senyum, tapi matanya sedih.', 'Habis itu tanahnya gemetar. Aku bangun pas Mochi menggonggong... eh, Mochi kan kucing.');
        S.flags[k] = 1; updHud();
        const n = ['m_darto', 'm_sari', 'm_dodi'].filter(f => S.flags[f]).length;
        if (n < 3) banner('Kesaksian ' + n + '/3', 'PENYELIDIKAN', false, 1600);
        else { learn('mimpi'); await talk(null, ['Semua mimpi menunjuk ke bawah desa... ke akar Pohon Induk. Ada prasasti tua di dekat pohon itu.']); S.stage = 16; updHud(); saveGame(this); }
        return true;
      }
    }
    if (id === 'elder' && st >= 15 && st <= 17) { await T(['Mimpi buruk? Hm... jangan terlalu dipikirkan, Arka. Itu cuma mimpi.', 'Prasasti di Pohon Induk? Tulisannya sudah lama tak terbaca. Jangan... ah, tidak apa-apa.', 'Danau Cermin? Siapa yang memberitahumu tempat itu? ...Hati-hati di sana.'][st - 15]); return true; }
    if (id === 'elder' && st === 18) {
      await T('Gelang itu... dari mana kamu mendapatkannya?', '...Kamu masuk ke kamar di kuil.');
      const r = await choose({ head: 'Bagaimana kamu bertanya?', x: 24, y: 40, w: 240, cancel: false, items: [{ t: 'Desak: "Kenapa Tetua merahasiakannya?"' }, { t: 'Pelan: "Aku hanya ingin tahu siapa aku."' }] });
      S.flags.bram_choice = r === 0 ? 'desak' : 'pelan';
      if (r === 0) await T('...Kamu berhak marah. Baiklah.', 'Enam belas tahun lalu aku menemukanmu, masih bayi, di samping Kristal Lumina. Gelang itu ada di tanganmu.', 'Aku berjanji pada seseorang untuk tidak menceritakan sisanya. Belum sekarang. Maafkan orang tua ini.');
      else await T('...Kamu sudah besar, Arka. Duduklah.', 'Enam belas tahun lalu, di malam yang sangat terang, aku menemukanmu di samping Kristal Lumina. Gelang itu melingkar di tangan kecilmu.', 'Aku berjanji pada seseorang yang sangat menyayangimu untuk menjaga rahasia ini. Aku akan bercerita... saat waktunya tiba. Aku janji.');
      learn('bram_aku'); S.stage = 19; updHud(); S.gold += 300; await gain(['Dapat 300 G.']);
      banner('Pertanyaan baru menunggu', 'BAB 4 SELESAI', true, 3200); saveGame(this); return true;
    }
    if (id === 'elder' && st >= 19 && false) { await T(S.flags.bram_choice === 'pelan' ? 'Arka... terima kasih sudah sabar dengan orang tua ini.' : 'Aku tahu kamu masih kesal. Aku tidak menyalahkanmu.', 'Jalan ke Kota Lumina tertutup longsor. Kalau sudah dibuka, Akademi Cahaya di sana mungkin punya jawaban yang tidak bisa kuberikan.'); return true; }
    if (id === 'ratih') {
      if (!S.lore.ratih && st >= 17) {
        await T('Hm? Anak muda... matamu. Kamu dari Desa Lumina, ya?', 'Aku sudah tinggal di tepi danau ini sejak muda. Cucuku pindah ke Kota Lumina, tapi aku tak mau pergi.', 'Enam belas tahun lalu, di malam paling terang yang pernah kulihat, seorang wanita bercahaya mendayung ke kuil di tengah danau... sambil menggendong bayi.', 'Paginya perahu itu kembali sendiri. Kosong.');
        learn('ratih'); return true;
      }
      await T(pick(st >= 17 ? ['Lentera-lentera kuno itu dulu dinyalakan setiap malam purnama. Kata nenekku, urutannya mengikuti jalan matahari... atau sebaliknya?', 'Kuil itu milik para Penjaga Cahaya. Sudah lama tak ada yang ke sana.'] : ['Danau ini memantulkan bintang bahkan di siang hari. Cantik, kan?', 'Jalan ke Kota Lumina tertutup longsor. Cucuku jadi jarang pulang.'])); return true;
    }
    // ---- Desa Kincir ----
    if (id === 'wati') {
      if (S.side.patok === 0) { await T('Kamu petualang yang menolong Ayah, kan? Aku Wati, anak Pak Joko.', 'Orang Serikat Dagang bilang ladang kami milik mereka. Peta mereka menunjukkan batasnya sampai di kincir!', 'Kakek buyut pernah memasang patok batu di ladang selatan. Kalau ketemu, Darma tak bisa membantah. Tolong carikan?'); S.side.patok = 1; if (this.M.patok) this.spawnPatok(); updHud(); return true; }
      await T(['', 'Patoknya di ladang selatan, di antara rumput tinggi. Dulu dekat batu besar.', 'Ketemu?! Cepat tunjukkan ke Darma!', 'Ladang kami selamat. Desa Kincir berutang padamu!'][S.side.patok]); return true;
    }
    if (id === 'darma') {
      if (S.side.patok === 2) {
        await T('Patok kuno? "Disaksikan Penjaga Cahaya"... Hm. Peta Serikat ternyata salah.', 'Jujur saja, Serikat cuma butuh lahan untuk gudang. Serpihan kristal dari Lembah Besi menumpuk, dan pembeli dari luar benua mau berapa pun.', 'Baik. Aku akan melapor ke Simpang Rantau. Ladang ini tetap milik keluarga Kincir.');
        S.side.patok = 3; learn('kincir_serikat'); S.gold += 150; addItem('seed', 3); await gain(['Wati mengirim hadiah: 150 G dan Benih x3!']); return true;
      }
      await T(S.side.patok === 3 ? 'Serikat sedang membangun gudang di tempat lain. Kristal itu laris sekali, aneh juga.' : 'Aku Darma, utusan Serikat Dagang dari Simpang Rantau. Lahan ini sudah tercatat di peta Serikat.', S.side.patok === 3 ? 'Kadang aku bertanya-tanya, untuk apa orang luar benua membeli serpihan kristal sebanyak itu.' : 'Kalau keluarga Kincir punya bukti lain, silakan tunjukkan.'); return true;
    }
    if (id === 'bayu') {
      const m = await choose({ head: 'Pedagang Keliling Bayu', x: 70, y: 50, w: 160, items: [{ t: 'Beli' }, { t: 'Kabar dari jalan' }, { t: 'Keluar' }] });
      if (m === 0) await buyMenu('Pedagang Keliling', ['antidote', 'hipotion', 'ether', 'seed']);
      else if (m === 1) await T(pick(['Kota Lumina! Kota Seribu Lentera. Sayang jalannya dari Danau Cermin tertutup longsor, jadi aku harus memutar lewat sini.', 'Harga serpihan kristal naik tiga kali lipat bulan ini. Kapal-kapal dari Teluk Karang membawanya ke Benua Timur.', 'Penambang Lembah Besi bilang lembah mereka makin dingin. Padahal sekarang musim panas.', 'Simpang Rantau makin ramai. Serikat Dagang membangun gudang di mana-mana.']));
      return true;
    }
    // ---- foreshadowing kecil ----
    if (id === 'hermit' && st >= 8 && !S.lore.sura_selene) {
      await T('Kabut menipis. Terima kasih, anak muda.', '...Tunggu. Biar kulihat wajahmu. Matamu... mirip seseorang. Selene...', '...Lupakan. Orang tua ini terlalu banyak bicara.'); learn('sura_selene'); return true;
    }
    return false;
  },
});
