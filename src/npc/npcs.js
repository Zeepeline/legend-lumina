'use strict';
// Gerak NPC & hewan serta sapaan otomatis (barking dialog)
const NPC_BARKS = {
  guard: ['Waspada di luar desa.', 'Hutan sedang rawan.', 'Selamat jalan, petualang.'],
  farmer: ['Sayur-sayurku segar!', 'Tanah hari ini subur.', 'Semoga panen melimpah.'],
  merchant: ['Ada barang bagus hari ini!', 'Beli ramuan untuk bekal?', 'Diskon khusus petualang!'],
  girl: ['Mochi ke mana ya...', 'Bunga di desa mekar indah.', 'Semangat petualangannya, Arka!'],
  child: ['Kak Arka keren banget!', 'Mau ikut berburu monster!', 'Lari-lari sore yuk!'],
  smith: ['Besi panas siap ditempa!', 'Butuh pedang yang tajam?', 'Kualitas tempa nomor satu.'],
  hunter: ['Jejak monster ada di mana-mana.', 'Jaga pandanganmu di semak-semak.', 'Busurku tak pernah meleset.'],
  inn: ['Istirahat sejenak bila lelah.', 'Kamar hangat selalu siap.', 'Sup hangat cocok malam ini.'],
  lestari: ['Semua anak berhak makan kenyang.', 'Tetaplah rendah hati, Arka.'],
  woman: ['Cuaca hari ini bersahabat.', 'Hati-hati di jalan ya.'],
  elder: ['Jaga kedamaian desa ini, nak.', 'Angin membawa kabar dari hutan.', 'Belajarlah dari alam sekitar.'],
  chick_master: ['Ayam-ayamku lincah sekali!', 'Jangan kejar anak ayam ya.', 'Pakan jagung bikin bulu berkilau.'],
  ayam: ['Petok petok!', 'Kukuruyuk!', 'Kooook petok petok!'],
  joko: ['Kincir angin berputar tenang.', 'Angin padang terasa sejuk hari ini.', 'Gandum tumbuh subur di lereng.'],
  wati: ['Bunga liar di padang cantik ya.', 'Jangan lupa minum air yang cukup.', 'Padang rumput ini sangat luas.'],
  darma: ['Pagar ladang harus selalu kokoh.', 'Ternak butuh rumput yang segar.', 'Hari yang cerah untuk bekerja.'],
  bayu: ['Barang dagangan segar dari padang!', 'Cari perbekalan perjalanan?', 'Harga pas, kualitas terjamin.'],
  domba: ['Mbeee...', 'Mbeee-mbee!', '*Mengunyah rumput hijau*'],
  hermit: ['Kabut rawa menyimpan ketenangan.', 'Dengarkan bisikan air rawa.', 'Jaga pikiranmu tetap jernih.'],
  nila: ['Udara dingin menusuk tulang.', 'Hati-hati langkah di salju tebal.', 'Tetap hangat di dekat api unggun.'],
  gun: ['Air danau begitu tenang.', 'Umpan cacing bagus untuk ikan mas.', 'Memancing butuh kesabaran.'],
  ratih: ['Danau ini selalu menyejukkan hati.', 'Minum teh hangat enak sekali.', 'Jaga kesehatanmu selalu, cu.'],
  kafilah: ['Kereta siap berangkat!', 'Jalan raya cukup panjang dan berdebu.', 'Kuda butuh istirahat sejenak.'],
  gj1: ['Tunjukkan izin bila lewat.', 'Gerbang kota aman terkendali.', 'Waspada saat bepergian jauh.'],
  gj2: ['Selamat datang di Lumina.', 'Jaga ketertiban di dalam kota.', 'Lapor jika melihat kejanggalan.'],
  courier: ['Surat kilat harus sampai tepat waktu!', 'Paket menumpuk hari ini.', 'Langkah cepat, urusan beres!'],
  gw1: ['Kota ini ramai sekali.', 'Kagum dengan arsitektur kotanya.', 'Perjalanan tadi cukup melelahkan.'],
  gw2: ['Membawa hasil kebun ke kota.', 'Semoga harga pasar hari ini bagus.', 'Sayuran segar baru dipetik.'],
  kmerchant: ['Peralatan lengkap untuk petualang!', 'Diskon khusus barang hari ini.', 'Mari mampir lihat-lihat dulu!'],
  auctioneer: ['Barang langka segera dilelang!', 'Siapkan tawaran terbaikmu!', 'Peluang emas jangan terlewat.'],
  rudi: ['Pasar selalu penuh warna.', 'Aroma jajanan kota sedap sekali.', 'Hari yang sibuk di pasar.'],
  kp1: ['Banyak barang menarik di pasar.', 'Harga barang mulai naik ya.', 'Mau beli bekal makan malam.'],
  kp2: ['Kios rempah ramai sekali.', 'Hari ini cuaca cerah untuk belanja.', 'Jangan lupa tawar harganya.'],
  kp3: ['Bumbu dapur komplit dan segar.', 'Paling murah seantero pasar!', 'Ayo borong sebelum kehabisan.'],
  kp4: ['Kain sutra di toko itu bagus ya.', 'Ingin membeli pita rambut baru.', 'Suka jalan-jalan di pasar kota.'],
  kp5: ['Hati-hati, muatan berat lewat!', 'Keringat hari ini demi keluarga.', 'Tumpukan karung harus lekas pindah.'],
  kp6: ['Kayu manis dan cengkeh pilihan!', 'Wangi rempah bikin masakan lezat.', 'Rempah asli Lumina berkualitas.'],
  kp7: ['Suasana kota selalu hidup.', 'Senang mendengar riuh pasar.', 'Semoga hari ini rezeki lancar.'],
  kp8: ['Tertib antre saat masuk pasar.', 'Keamanan warga adalah prioritas.', 'Tetap waspada terhadap pencopet.'],
  ka1: ['Buku sejarah ini tebal sekali.', 'Ujian mantra semakin dekat.', 'Harus tekun mengulang pelajaran.'],
  ka2: ['Aku ingin jadi penyihir hebat!', 'Eksperimen tadi hampir berhasil.', 'Perpustakaan sangat tenang.'],
  ka3: ['Catatan kuliahku ketinggalan di mana ya.', 'Diskusi kelompok tadi seru sekali.', 'Perlu latihan kontrol mana lagi.'],
  ka4: ['Ilmu pengetahuan adalah pelita hidup.', 'Belajar butuh kesabaran dan tekun.', 'Renungkan setiap lembar ilmu.'],
  ka5: ['Hening di area ruang belajar.', 'Jaga ketenangan akademi ini.', 'Tamu dilarang masuk tanpa izin.'],
  kb1: ['Lari-larian di gang sempit seru!', 'Main petak umpet yuk!', 'Jangan sampai tertangkap ya!'],
  kb2: ['Punggungku sakit bekas menambang.', 'Udara di bawah tanah sangat pengap.', 'Batu bara makin sulit dicari.'],
  kb3: ['Harus hemat air bersih.', 'Semoga dapur bisa terus mengepul.', 'Anak-anak harus makan teratur.'],
  kb4: ['Bermain gundu di tanah lapang.', 'Perut lapar sehabis main seharian.', 'Menunggu ibu pulang memasak.'],
  sambo: ['Hutan gelap bukan untuk pemula.', 'Jejak binatang liar kian langka.', 'Hati-hati tergelincir di lumut.'],
  pancing: ['Ikan sungai suka makan cacing.', 'Menunggu kail bergerak itu nikmat.', 'Aliran air sungai sangat jernih.'],
  mom: ['Arka, jangan lupa makan ya.', 'Ibu selalu mendoakan keselamatanmu.', 'Bawalah bekal sebelum berangkat.'],
  temple_priest: ['Semoga cahaya memberkahi jiwamu.', 'Doa tulus membawa kedamaian.', 'Candi ini tempat menenangkan batin.'],
  dice_gambler: ['Kocok dadu, lihat keberuntunganmu!', 'Kadang menang, kadang belajar lagi.', 'Mau coba bertaruh koin emas?'],
};
const BARK_NODES = [];
function popBark(npcObj, text) {
  if (UIH || G.lock > 0) return;
  const old = BARK_NODES.find(b => b.npc === npcObj);
  if (old) { old.el.remove(); BARK_NODES.splice(BARK_NODES.indexOf(old), 1); }
  const el = document.createElement('div');
  el.className = 'bark';
  el.textContent = text;
  UI.appendChild(el);
  const node = { el, npc: npcObj, t: 2.8 };
  BARK_NODES.push(node);
}
function updBarks(cam, dt) {
  for (let i = BARK_NODES.length - 1; i >= 0; i--) {
    const b = BARK_NODES[i];
    b.t -= dt;
    if (b.t <= 0 || !b.npc.spr || !b.npc.spr.active) {
      b.el.remove();
      BARK_NODES.splice(i, 1);
      continue;
    }
    b.el.style.left = Math.round(b.npc.spr.x - cam.scrollX) + 'px';
    b.el.style.top = Math.round(b.npc.spr.y - cam.scrollY - 30) + 'px';
  }
}

Object.assign(World.prototype, {
  updNpc(o, dt, locked) {
    const s = o.spr; s.setDepth(s.y); o.sh.setPosition(s.x, s.y - 1).setDepth(s.y - .5); if (o.mark) o.mark.y = s.y - 31 + Math.sin(this.t * 6) * 1.5;
    const dPl = Math.hypot(this.pl.x - s.x, this.pl.y - s.y);

    // Reaksi sapaan spontan saat pemain lewat di dekat NPC (jarak 34px)
    o.barkCd = (o.barkCd || rnd(2, 6)) - dt;
    if (!locked && !G.title && dPl < 34 && o.barkCd <= 0 && !UIH) {
      const barks = NPC_BARKS[o.n.id] || NPC_BARKS[o.ch];
      if (barks && barks.length) {
        popBark(o, pick(barks));
        o.barkCd = rnd(12, 22);
      }
    }

    if (o.n.still) { if (o.walking) { s.setVelocity(0); o.walking = false; } return; } // NPC sengaja diam (jarang; beri alasan di data peta)
    this.npcBrain(o, dt, locked, dPl);
  },
  updCritter(c, dt) {
    if (c.fly) {
      c.ph += dt * c.sp;
      c.s.x = c.ax + Math.sin(c.ph * 1.3) * 60 + Math.sin(c.ph * 3.1) * 8;
      c.s.y = c.ay + Math.sin(c.ph * .9) * 40 + Math.cos(c.ph * 4) * 5;
      c.s.setDepth(c.s.y + 40);
      return;
    }
    const s = c.s; c.sh.setPosition(s.x, s.y - 1).setDepth(s.y - .5); s.setDepth(s.y);
    const d = Math.hypot(this.pl.x - s.x, this.pl.y - s.y);
    if (c.busy) return; c.t -= dt;
    if (c.t <= 0 || (d < 22 && !G.title)) {
      const flee = d < 22; let tx, ty;
      if (flee) { const n = d || 1; tx = s.x + (s.x - this.pl.x) / n * 46; ty = s.y + (s.y - this.pl.y) / n * 30; }
      else { tx = c.home.x + rnd(-46, 46); ty = c.home.y + rnd(-26, 26); }
      tx = clamp(tx, 60, this.M.w - 60); ty = clamp(ty, 130, this.M.h - 60);
      const dist = Math.hypot(tx - s.x, ty - s.y); c.busy = true; s.flipX = tx > s.x; s.play(c.key + '_mv'); s.anims.timeScale = flee ? 2.5 : 1;
      this.tweens.add({
        targets: s, x: tx, y: ty, duration: dist / (flee ? 70 : 20) * 1000,
        onComplete: () => { c.busy = false; s.anims.stop(); s.setFrame(0); c.t = rnd(2, 5); }
      });
    }
  },
});
