'use strict';
// Bab 5 "Kota Seribu Lentera" (perjalanan & kota, tanpa boss): longsor, Jalan Raya Lama, Kota Lumina, Kota Bawah, Arsip Akademi
// Tahap: 19 tanya Ratih → 20 bantu longsor → 21 jalan raya → 22 cari Rudi → 23 temui Lestari → 24 bahan dapur umum → 25 baca arsip (4) → 26 lapor Lestari → 27 selesai
const ARSIP = ['arsip_selene', 'arsip_rongga', 'arsip_bram', 'arsip_morgath'];
Object.assign(World.prototype, {
  spawnCh5() {
    const M = this.M, ox = M._ox || 0, oy = M._oy || 0; /* _ox/_oy: mode benua (koordinat global) */
    if (M.id === 'lake' && !S.flags.road_open) {
      this.ch5O = [ox, oy];
      this.slideWall = this.wall(760 + ox, 40 + oy, 120, 60);
      this.slideS = [[790, 96], [816, 84], [842, 92], [770, 110], [806, 112], [860, 104]].map(([x, y]) => [x + ox, y + oy]).map(([x, y]) => this.add.image(x, y, 'i_rock' in this.textures.list ? 'i_rock' : 'rock').setOrigin(.5, 1).setDepth(y));
    }
    if (M.id === 'kgate' && M._ox === undefined) this.ch5Enter('kgate');
  },
  ch5Enter(id) { // dipanggil saat masuk wilayah (mode benua: dari updBenua)
    if (id === 'kgate' && S.stage === 21) { S.stage = 22; updHud(); this.time.delayedCall(900, () => banner('Kota Seribu Lentera', 'BAB 5 · KOTA LUMINA', true, 3000)); saveGame(this); }
  },
  async clearSlide() {
    G.lock++;
    await talk('Pak Gun', ['Itu dia! Monster batu keluar lagi dari reruntuhan! Tolong, anak muda!']);
    G.lock--;
    sfx('roar'); this.camShake(300, .005);
    const [sox, soy] = this.ch5O || [0, 0];
    this.slideWave = [[700, 180], [940, 180], [820, 230]].map(([x, y]) => this.spawnEnemy('golem', x + sox, y + soy)); for (const e of this.slideWave) { e.hp = e.max = Math.round(e.hp * 1.6); }
    const chk = this.time.addEvent({ delay: 400, loop: true, callback: async () => {
      if (this.slideWave.some(e => e.hp > 0)) return;
      chk.remove(); S.flags.road_open = 1; this.slideWall.destroy(); sfx('boom'); this.camShake(400, .006);
      for (const s of this.slideS) this.tweens.add({ targets: s, alpha: 0, y: s.y - 10, duration: 700, onComplete: () => s.destroy() });
      S.stage = 21; updHud(); await sleep(700);
      await talk('Pak Gun', ['Terima kasih! Dengan monster itu pergi, batu-batu ini mudah disingkirkan.', 'Jalan Raya Lama terbuka lagi. Ikuti ke utara, Kota Lumina setengah hari perjalanan. Hati-hati, serigala suka mengikuti kafilah.']);
      banner('Tempuh Jalan Raya Lama', 'PERJALANAN', false, 2400); saveGame(this);
    } });
  },
  arsipRead(id) {
    if (S.stage !== 25 || !ARSIP.includes(id)) return;
    const n = ARSIP.filter(k => S.lore[k]).length;
    if (n < 4) banner('Catatan arsip ' + n + '/4', 'PENYELIDIKAN', false, 1500);
    else { S.stage = 26; updHud(); this.time.delayedCall(1600, () => banner('Ceritakan kepada Guru Lestari', 'PENYELIDIKAN', false, 2400)); saveGame(this); }
  },
  async ch5Talk(id, nm, T, gain) {
    const st = S.stage;
    if (id === 'ratih' && st === 19) {
      await T('Kamu sudah ke kuil, ya? Wajahmu berubah, seperti orang yang baru menemukan sesuatu.', 'Kalau kamu mencari jawaban, cucuku Rudi bekerja di Kota Lumina. Katanya Akademi Cahaya menyimpan catatan segala hal.', 'Tapi jalannya tertutup longsor. Pak Gun dan para pekerja Dewan sudah berminggu-minggu di sana. Coba tanya dia, di utara danau.');
      S.stage = 20; updHud(); banner('Bantu membuka longsor', 'BAB 5 · KOTA SERIBU LENTERA', true, 2800); saveGame(this); return true;
    }
    if (id === 'gun') {
      if (st === 20 && !S.flags.road_open) { await T('Kamu mau ke kota? Jalannya masih tertutup.', 'Setiap kami menggeser batu, monster batu muncul dari reruntuhan di bawahnya. Konon dulu ini jalan raya Kerajaan Aurel.'); if (await ask('Bantu mengusir monster batu?', 'Pak Gun')) await this.clearSlide(); return true; }
      await T(S.flags.road_open ? 'Jalan sudah terbuka. Dewan akan menambah lentera di sepanjang jalan, katanya.' : 'Longsornya parah. Kami butuh waktu.'); return true;
    }
    if (id === 'kafilah') { await T('Kafilah Serikat Dagang dari Simpang Rantau. Kami bawa peti untuk gudang Kota Lumina.', S.lore.peti_segel ? 'Isinya? Bukan urusanmu.' : 'Jangan sentuh peti-peti bersegel gading itu. Perintah langsung dari Ketua.'); if (!S.lore.peti_segel) learn('peti_segel'); return true; }
    if (id === 'rudi') {
      if (st === 22) {
        await T('Nenek Ratih menyuruhmu? Wah, Nenek masih sehat?', 'Masuk Arsip Akademi? Susah. Aku cuma tukang angkut buku. Arsip bawah tanah hanya boleh dibuka atas izin guru.', 'Tapi ada satu guru yang baik: Guru Lestari, penjaga arsip. Sekarang dia lebih sering di Kota Bawah, mengurus dapur umum. Barat dari pasar ini.');
        S.stage = 23; updHud(); return true;
      }
      await T(pick(['Seribu lentera di kota ini dinyalakan setiap senja oleh petugas Dewan. Aku pernah ikut, kakiku pegal!', 'Kalau ketemu Nenek, bilang aku akan pulang setelah jalan dibuka.', 'Serikat menyewa semua gudang di dekat gerbang. Isinya peti-peti berat dan dingin.'])); return true;
    }
    if (id === 'lestari') {
      if (st === 23) {
        await T('Kamu dari Desa Lumina? ...Pantas. Matamu mengingatkanku pada seseorang.', 'Arsip bawah? Aku memang memegang kuncinya. Tapi lihat dulu sekitarmu: orang-orang di sini kelaparan. Gandum dari Desa Kincir hampir tak datang lagi.', 'Bawakan aku bahan makanan untuk dapur umum, 3 Sayur Segar atau 3 Ikan, lalu kita bicara soal arsip.');
        S.stage = 24; updHud(); return true;
      }
      if (st === 24) {
        const k = has('veg', 3) ? 'veg' : has('fish', 3) ? 'fish' : null;
        if (!k) { await T('Sayur dari kebunmu atau ikan dari danau, 3 saja cukup. Anak-anak di sini sudah lama tak makan sayur.'); return true; }
        addItem(k, -3);
        await T('Terima kasih. Kamu tidak harus melakukannya, tapi kamu melakukannya.', S.side.patok === 3 ? 'Oh ya, kabarnya ladang Desa Kincir selamat dari Serikat. Gandum mungkin akan datang lagi. Kalau itu ulahmu juga... hmm.' : 'Andai Desa Kincir bisa mengirim gandum lagi...', 'Ini kunci arsip. Masuklah lewat pintu utama Akademi. Baca apa yang kamu perlu, dan jangan bilang siapa pun aku yang memberimu.');
        S.stage = 25; addItem('akey'); updHud(); await gain(['Dapat Kunci Arsip!']); return true;
      }
      if (st === 26) {
        await T('Kamu membaca semuanya? ...Duduklah.', 'Selene adalah sahabatku di Akademi. Murid terbaik yang pernah ada. Lalu suatu hari ia pergi, dan wajahnya dihapus dari potret atas perintah Dewan.', 'Aku tak tahu kenapa. Tapi ada satu hal lagi: catatan tambang Lembah Besi hilang dari arsip bulan lalu. Hanya orang dengan izin Dewan atau Serikat yang bisa mengambilnya.', 'Kalau kamu ingin tahu kenapa kristal-kristal meredup, mulailah dari Lembah Besi.');
        S.stage = 27; updHud(); S.gold += 400; addItem('ether', 3); await gain(['Dapat 400 G dan Eter x3!']);
        banner('Jejak menuju Lembah Besi', 'BAB 5 SELESAI', true, 3200); saveGame(this); return true;
      }
      await T(st >= 27 ? 'Hati-hati dengan Serikat, Arka. Mereka punya mata di mana-mana.' : 'Dapur umum buka setiap sore. Semua boleh makan.'); return true;
    }
    if (id === 'ka5' && st < 25 && st >= 22) { await T('Arsip bawah hanya untuk guru. Tanpa izin, tak ada yang boleh lewat.'); return true; }
    if (id === 'sambo') { await T(pick(['Lumut lumen laku keras di Kota Lumina. Lentera-lentera kota butuh cahaya, kan?', 'Pemburu Raka menyebutku pencuri. Hutan ini bukan miliknya.', 'Di reruntuhan barat ada hantu prajurit. Aku tak pernah ke sana setelah gelap.', 'Akar di reruntuhan itu... kadang berdenyut. Sumpah.'])); return true; }
    if (id === 'pancing') { await T(st >= 8 ? pick(['Sejak kabut rawa hilang, ikan kembali ke sungai! Kudengar nelayan Desa Muara di hilir juga senang.', 'Pancing di air yang berkilau. Ikan emas suka arus tenang.']) : pick(['Ikan di sungai ini makin sedikit. Airnya pahit sejak kabut aneh menutupi rawa di hilir.', 'Nelayan Desa Muara di muara sungai menyalahkan orang hulu. Padahal sumber racunnya dari rawa.'])); return true; }
    if (id === 'kmerchant') { await buyMenu('Pedagang Pasar Kota', ['hipotion', 'ether', 'antidote', 'chain', 'ispear', 'hbow']); return true; }
    if (id === 'elder' && st >= 19 && st < 27) { await T(st === 19 ? 'Kalau kamu ingin ke Kota Lumina, tanyakan Nenek Ratih di Danau Cermin. Cucunya bekerja di sana.' : 'Kota Lumina... Sudah lama aku tak ke sana. Sampaikan salamku pada Akademi, kalau masih ada yang ingat aku.'); return true; }
    if (id === 'elder' && st >= 27) { await T('Kamu ke Arsip, ya? ...Lestari. Tentu saja dia.', 'Arka, ada hal-hal yang akan kuceritakan. Tapi tidak hari ini. Hati-hati di Lembah Besi.'); return true; }
    return false;
  },
});
