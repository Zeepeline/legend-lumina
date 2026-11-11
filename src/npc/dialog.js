'use strict';
// Percakapan NPC, toko, bengkel, penginapan
Object.assign(World.prototype, {
  npcHasQuest(id) {
    const sd = S.side;
    return (id === 'elder' && [0, 5, 8, 9, 13].includes(S.stage)) || (id === 'hermit' && S.stage === 6) || (id === 'nila' && S.stage === 10) || (id === 'girl' && S.stage === 14) || (S.stage === 15 && { farmer: 'm_darto', merchant: 'm_sari', child: 'm_dodi' }[id] && !S.flags[{ farmer: 'm_darto', merchant: 'm_sari', child: 'm_dodi' }[id]]) || (id === 'elder' && S.stage === 18) || (id === 'ratih' && S.stage >= 17 && !S.lore.ratih) || (id === 'wati' && S.side.patok === 0) || (id === 'darma' && S.side.patok === 2) || (id === 'girl' && sd.mochi === 3 && !S.pet) || (id === 'mom' && has('fish') && has('veg')) || (id === 'hunter' && S.stage === 1) || (id === 'girl' && (sd.mochi === 0 || sd.mochi === 2)) ||
      (id === 'farmer' && (sd.darto === 0 || (sd.darto === 1 && has('jelly', 5)))) || (id === 'joko' && (sd.joko === 0 || (sd.joko === 1 && has('tusk', 3))));
  },
  async talkNpc(o) {
    const id = o.n.id, nm = o.n.name, pl = this.pl;
    const dir = Math.abs(pl.x - o.spr.x) > Math.abs(pl.y - o.spr.y) ? (pl.x > o.spr.x ? 'right' : 'left') : (pl.y > o.spr.y ? 'down' : 'up');
    if (o.walking) { o.spr.setVelocity(0); o.walking = false; }
    this.face(o, dir);
    const T = (...l) => talk(nm, l), gain = async (lines) => { sfx('chest'); updHud(); await talk(null, lines); };
    if (!(await this.storyTalk(id, nm, T, gain))) switch (id) {
      case 'elder':
        if (S.stage === 0) {
          await T('Ah, Arka. Syukurlah kamu datang.', 'Akhir-akhir ini cahaya Kristal Lumina di selatan hutan makin redup.', 'Pemburu Raka sedang menyelidiki hutan. Temui dia di pintu masuk hutan, di selatan desa.', 'Bawa ini. Dan belilah perlengkapan di desa sebelum pergi.');
          S.stage = 1; addItem('potion', 2); S.gold += 30; banner('Temui Pemburu Raka', 'MISI BARU', false, 2200);
          await gain(['Dapat Ramuan x2 dan 30 G!', 'Tips: SERANG menebas, OBAT minum ramuan, TAS membuka inventaris. Tombol SIHIR bisa ditarik untuk membidik bola api!']);
        } else if (S.stage < 5) await T(['', 'Pemburu Raka menunggumu di pintu masuk hutan.', 'Pecahan Segel dijaga para pemimpin monster. Jangan memaksakan diri, naikkan levelmu dulu.', 'Segel sudah terbuka? Hati-hati, Raja Goblin itu kuat sekali.', 'Sentuh kristalnya agar cahayanya kembali!'][S.stage], 'Kalau terluka, beristirahatlah di penginapan Bu Rina.');
        else if (S.stage === 5) {
          await T('Lihat! Cahaya kristal kembali menyinari pohon tua ini!', 'Kamu pahlawan Desa Lumina, Arka. Terimalah hadiah ini.');
          S.stage = 6; S.gold += 200; addItem('hipotion', 3); saveGame(this);
          await gain(['Dapat 200 G dan Ramuan Besar x3!']);
          banner('Kristal Lumina pulih', 'BAB 1 SELESAI', true, 2600); await sleep(2600);
          await T('Tapi... ada yang mengganjal. Raja Goblin tidak mungkin menyegel kuil sendirian.', 'Kabut aneh terus mengalir dari Rawa Senja, di selatan Padang Angin. Pertapa Sura tinggal di sana.', 'Temuilah dia. Hati-hati, monster rawa jauh lebih kuat. Bersiaplah dulu di bengkel Pak Besi.');
          S.stage = 6; updHud(); banner('Temui Pertapa Sura', 'BAB 2 · MISI BARU', false, 2400);
        } else if (S.stage === 6 || S.stage === 7) await T(S.stage === 6 ? 'Rawa Senja ada di selatan Padang Angin. Ikuti jalan ke bawah dari kincir angin.' : 'Morgath? Murid yang dulu diusir dari desa... Jadi dia dalangnya. Hentikan dia, Arka!');
        else if (S.stage === 8) {
          await T('Kabut sudah hilang dan kristal bersinar lebih terang dari sebelumnya!', 'Morgath tidak akan mengganggu Lumina lagi. Terima ini, warisan keluarga kami.');
          S.stage = 9; S.gold += 300; addItem('hipotion', 3); addItem('ether', 3); saveGame(this);
          await gain(['Dapat 300 G, Ramuan Besar x3, dan Eter x3!']);
          banner('Bab 3 menanti...', 'BAB 2 SELESAI', true, 3000);
        } else if (S.stage === 9) {
          await T('Arka, ada kabar buruk. Pak Joko melihat badai salju aneh di utara Padang Angin, padahal ini musim panas!', 'Penjaga Nila tinggal di kaki Puncak Beku. Temui dia. Bawa Penawar, hawa dingin di sana bisa membekukan tubuhmu.');
          S.stage = 10; addItem('antidote', 3); updHud(); await gain(['Dapat Penawar x3!']); banner('Temui Penjaga Nila', 'BAB 3 · MISI BARU', false, 2400);
        } else if (S.stage >= 10 && S.stage <= 12) await T(['Puncak Beku ada di utara Padang Angin. Ikuti jalan ke atas dari kincir angin.', 'Obor kuno? Konon api itu menyegel naga es berabad-abad lalu.', 'Naga Es... Hati-hati, Arka. Kami semua berdoa untukmu.'][S.stage - 10]);
        else if (S.stage === 13) {
          await T('Badai salju sudah reda! Kamu mengalahkan naga es?!', 'Lumina berutang nyawa padamu, Arka. Kamu pahlawan sejati desa ini.');
          S.stage = 14; S.gold += 500; addItem('hipotion', 5); addItem('ether', 5); saveGame(this);
          await gain(['Dapat 500 G, Ramuan Besar x5, dan Eter x5!']);
          banner('TERIMA KASIH SUDAH BERMAIN', 'BAB 3 SELESAI', true, 3500);
        } else await T(S.flags.golem ? 'Golem Purba, Morgath... Kamu pahlawan terbesar dalam sejarah Lumina!' : 'Kudengar Golem Purba di Gua Batu menyimpan perisai legendaris. Mungkin tantangan berikutnya untukmu?');
        break;
      case 'nila':
        if (S.stage < 10) await T('Brrr... Puncak ini makin dingin setiap hari. Ada yang tidak beres di atas sana.', 'Kalau mau naik, jangan lupa bawa Penawar. Dinginnya bisa membuatmu lambat.');
        else if (S.stage === 10) {
          await T('Kamu Arka dari Lumina? Syukurlah! Naga Es Kryos telah bangun di puncak.', 'Dulu leluhur kami menyegelnya dengan tiga Obor Kuno. Apinya padam, dan gerbang es menutup jalan ke puncak.', 'Nyalakan ketiga obor itu! Hati-hati, para penjaga es akan bangkit saat api menyala. Cek PETA untuk letaknya.');
          S.stage = 11; addItem('hipotion', 2); updHud(); await gain(['Dapat Ramuan Besar x2!']); banner('Nyalakan 3 Obor Kuno', 'MISI BARU', false, 2200);
        } else if (S.stage === 11) await T(`Obor menyala: ${[0, 1, 2].filter(k => S.flags['torch' + k]).length}/3. Satu di barat, satu di timur, satu di tengah sebelum gerbang es.`);
        else if (S.stage === 12) await T('Gerbang es sudah mencair! Kryos menyemburkan es. Menyamping saat dia mengambil napas, lalu serang!', 'Senjata api... maksudku, Bola Api-mu akan membakarnya.');
        else await T('Langit kembali biru. Terima kasih, pahlawan Lumina!');
        break;
      case 'hunter':
        if (S.stage === 1) {
          await T('Arka! Tetua mengutusmu? Bagus.', 'Raja Goblin menyegel Kuil Kristal dengan sihir. Segelnya terbuat dari 3 kepingan.', 'Kepingan itu dibagikan ke anak buahnya: Kepala Goblin di perkemahan timur, Ratu Jamur di kebun jamur barat daya, dan Ular Raksasa di sarang tenggara.', 'Kalahkan mereka, ambil ketiga Pecahan Segel, lalu buka segel di gerbang kuil.', 'Mereka kuat. Latih dirimu melawan monster kecil dulu dan tempa senjata di bengkel Pak Besi.');
          S.stage = 2; updHud(); banner('Rebut 3 Pecahan Segel', 'MISI BARU', false, 2200);
        } else await T(S.stage === 2 ? `Pecahan segel: ${S.inv.seal || 0}/3. Cek PETA, tanda ☠ menunjukkan tempat para pemimpin monster.` : S.stage >= 4 ? 'Kamu mengalahkan Raja Goblin?! Luar biasa!' : 'Gerbang kuil ada di ujung selatan. Semoga berhasil!');
        break;
      case 'girl':
        if (S.side.mochi === 0) {
          await T('Hai Arka! Mau ke hutan, ya? Ini ramuan dari apel kebun.', '...Sebenarnya aku sedih. Kucingku, Mochi, kabur ke hutan kemarin.', 'Dia putih dan suka sembunyi di dekat jalan barat hutan. Kalau ketemu, tolong bawa pulang ya!');
          S.side.mochi = 1; addItem('potion'); await gain(['Dapat Ramuan!', 'Misi sampingan: Cari Mochi di Hutan Lumina.']);
        } else if (S.side.mochi === 2) {
          await T('MOCHI!! Terima kasih, Arka! Ini hadiah dariku dan ibu.'); addItem('mochi', -1); S.side.mochi = 3; addItem('hipotion', 2); S.gold += 30;
          await gain(['Dapat Ramuan Besar x2 dan 30 G!']);
          await this.offerPet(T);
        } else if (S.side.mochi === 3 && !S.pet) await this.offerPet(T);
        else await T(S.pet ? 'Mochi kelihatan senang ikut berpetualang. Jaga dia ya!' : pick(['Mochi suka tidur di bawah pohon besar sekarang.', 'Air mancur ini katanya terhubung dengan kristal di hutan.', S.stage >= 5 ? 'Pohon tua bersinar lagi! Cantik sekali.' : 'Hati-hati dengan jamur. Sporanya beracun!']));
        break;
      case 'farmer':
        if (S.side.darto === 0) { await T('Slime-slime itu mencuri sayurku tiap malam!', 'Bisa bawakan 5 Lendir Slime sebagai bukti kamu sudah mengusir mereka? Nanti kuberi imbalan.'); S.side.darto = 1; await talk(null, ['Misi sampingan: Kumpulkan 5 Lendir Slime untuk Pak Darto.']); }
        else if (S.side.darto === 1 && has('jelly', 5)) { await T('Wah, 5 Lendir Slime! Kebunku aman sekarang. Terima ini, jimat buatan nenekku.'); addItem('jelly', -5); addItem('amulet'); S.gold += 40; S.side.darto = 2; await gain(['Dapat Jimat Daun dan 40 G! (Pasang di TAS: HP pulih perlahan)']); }
        else if (S.side.darto === 1) await T(`Lendir Slime: ${S.inv.jelly || 0}/5. Slime banyak di jalan masuk hutan.`);
        else await T(pick(['Panen wortel tahun ini bagus!', 'Slime melompat-lompat. Serang saat mereka diam!', 'Goblin dan serigala menerjang setelah berhenti sebentar. Menghindarlah ke samping!']));
        break;
      case 'merchant': await this.shop(); break;
      case 'hermit':
        if (S.stage === 6) {
          await T('Hmm... pemuda dari Lumina. Aku sudah menunggumu.', 'Kabut ini sihir Morgath, murid Tetua Bram yang dulu diusir karena mempelajari sihir terlarang.', 'Dialah yang memberi Raja Goblin kekuatan untuk menyegel kuil. Kabutnya menyedot cahaya kristal sedikit demi sedikit.', 'Morgath bersembunyi di jantung rawa, di selatan. Dia bisa berpindah tempat dan memanggil wisp. Jangan berdiri diam!');
          S.stage = 7; updHud(); banner('Kalahkan Morgath', 'MISI BARU', false, 2200);
        } else await T(S.stage >= 8 ? 'Kabut menipis. Terima kasih, anak muda.' : pick(['Katak rawa melompat jauh. Jaga jarak!', 'Wisp menghilang sesekali. Serang saat ia bercahaya.', 'Nova Es bisa memperlambat musuh. Berguna melawan Morgath.']));
        break;
      case 'mom':
        if (has('fish') && has('veg')) { if (await ask('Mau kumasakkan Sup Ikan?\n(1 Ikan Mas + 1 Sayur Segar)', nm)) { addItem('fish', -1); addItem('veg', -1); addItem('stew'); await gain(['Dapat Sup Ikan! (HP +100, MP +10)']); } }
        else await T('Halo, Arka! Bawakan Ikan Mas dan Sayur Segar, nanti kumasakkan Sup Ikan yang hangat.', 'Ikan bisa dipancing di air yang beriak. Sayur bisa ditanam di kebun desa.');
        break;
      case 'smith': await this.smithy(); break;
      case 'inn': await this.innTalk(); break;
      case 'child': await T(pick(['Aku mau jadi petualang kayak Kak Arka!', 'Pak Besi bisa menempa pedang dari bahan monster lho!', 'Di timur desa ada kincir angin besar. Anginnya kencang sekali!'])); break;
      case 'guard': await T(S.stage === 0 ? 'Tetua Bram mencarimu. Rumah pohonnya di tengah desa.' : 'Jalan ke Hutan Lumina ada di belakangku. Ke timur ada Padang Angin, tapi monsternya lebih kuat.'); break;
      case 'woman':
        if (!S.flags.lastri) { S.flags.lastri = 1; await T('Kue jaheku baru matang. Eh, kamu mau ke hutan? Bawa ini saja.'); addItem('ether'); await gain(['Dapat Eter!']); }
        else await T('Dulu suamiku juga penjaga desa. Kalau lelah, jangan memaksakan diri ya.');
        break;
      case 'joko':
        if (S.side.joko === 0) { await T('Selamat datang di Padang Angin! Kincirku menggiling gandum untuk desa.', 'Babi hutan akan menyeruduk lurus. Minggir ke samping, biar mereka menabrak batu!', 'Bisa bawakan 3 Taring Babi? Akan kutukar dengan sepatu ajaib.', 'Ini bekal dulu.'); S.side.joko = 1; addItem('potion', 2); await gain(['Dapat Ramuan x2!', 'Misi sampingan: Bawa 3 Taring Babi ke Pak Joko.']); }
        else if (S.side.joko === 1 && has('tusk', 3)) { await T('Taring bagus! Ini Sepatu Angin, larimu akan secepat angin padang.'); addItem('tusk', -3); addItem('boots'); S.side.joko = 2; await gain(['Dapat Sepatu Angin! (Pasang di TAS)']); }
        else await T(S.side.joko === 1 ? `Taring Babi: ${S.inv.tusk || 0}/3.` : pick(['Gua Batu ada di timur laut. Di dalam gelap, jadi hati-hati.', 'Hantu kadang tembus pandang. Tunggu dia terlihat jelas!', 'Golem lambat, tapi pukulannya bikin tanah bergetar.']));
        break;
    }
  },
  async offerPet(T) {
    await T('Eh, Mochi terus menatapmu... Sepertinya dia ingin ikut berpetualang!');
    if (await ask('Ajak Mochi ikut berpetualang?\n(Ia kadang menggali barang berguna)', 'Lina')) { S.pet = true; sfx('lvl'); await talk('Lina', ['Hore! Jaga dia baik-baik ya. Mochi pintar menemukan barang!']); for (const c of this.critters) if (c.key === 'cat2') { c.s.destroy(); c.sh.destroy(); } this.critters = this.critters.filter(c => c.key !== 'cat2'); this.pet = this.add.sprite(this.pl.x - 14, this.pl.y, 'cat2', 0).setOrigin(.5, 1); this.pet.sh = this.add.image(this.pl.x, this.pl.y, 'shadow').setAlpha(.18).setScale(.8, .7); }
  },
  async shop() {
    G.lock++;
    await say('Selamat datang! Mau beli atau jual?', 'Bu Sari');
    for (; ;) {
      const m = await choose({ head: 'Kios Bu Sari · ' + S.gold + ' G', x: 80, y: 50, w: 128, items: [{ t: 'Beli' }, { t: 'Jual barang' }, { t: 'Keluar' }] });
      if (m === 0) await buyMenu('Kios Bu Sari', ['potion', 'hipotion', 'antidote', 'ether', 'seed', 'rod']);
      else if (m === 1) await sellMenu();
      else break;
    }
    G.lock--;
  },
  async smithy() {
    G.lock++;
    await say(pick(['Heh, butuh senjata? Bengkel Pak Besi siap!', 'Bawakan bahan monster, akan kutempa jadi barang hebat.']), 'Pak Besi');
    for (; ;) {
      const m = await choose({ head: 'Bengkel Pak Besi · ' + S.gold + ' G', x: 70, y: 50, w: 148, items: [{ t: 'Beli perlengkapan' }, { t: 'Tempa dengan bahan' }, { t: 'Tingkatkan (+1)' }, { t: 'Keluar' }] });
      if (m === 0) await buyMenu('Bengkel Pak Besi', ['isword', 'ispear', 'hbow', 'chain']);
      else if (m === 1) await forgeMenu();
      else if (m === 2) await upgradeMenu();
      else break;
    }
    G.lock--;
  },
  async innTalk() {
    G.lock++;
    const m = await choose({ head: 'Penginapan Bu Rina', x: 70, y: 50, w: 150, items: [{ t: 'Menginap', r: '10 G' }, { t: 'Masak' }, { t: 'Keluar' }] });
    if (m === 1) { await cookMenu(); G.lock--; return; }
    const ok = m === 0;
    if (ok) {
      if (S.gold < 10) { sfx('buzz'); await say('Maaf, uangmu belum cukup.', 'Bu Rina'); }
      else { S.gold -= 10; await fadeTo(1); const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp; updHud(); sfx('heal'); await sleep(500); await fadeTo(0); saveGame(this); sfx('save'); await say('Selamat pagi! Tidurmu nyenyak? Permainan sudah tersimpan.', 'Bu Rina'); }
    }
    G.lock--;
  },
});
