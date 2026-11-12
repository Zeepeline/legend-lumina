# Progres Fitur 1–1000

Sumber daftar: `docs/RENCANA_FITUR.md` (1–100) dan `docs/RENCANA_FITUR_101-1000.md` (101–1000).
Dikerjakan **bertahap per gelombang**, mulai dari yang paling berdampak dan murah. Setiap gelombang wajib lulus `npm run check` dan tes (`npm test`), serta punya tes sendiri di `tests/gelombangN.spec.js`.

**Cara memakai (untuk agent):**
1. Ambil gelombang berikutnya di bagian "Rencana gelombang".
2. Kerjakan, tes, push.
3. Pindahkan nomornya ke "Selesai" (dengan file utama), lalu perbarui ringkasan.
4. Fitur yang ternyata tidak cocok: tulis di "Dibatalkan" beserta alasannya. Jangan diam-diam dilewati.

## Ringkasan

| Selesai | Sebagian | Dibatalkan | Sisa |
|---|---|---|---|
| 164 | 5 | 0 | 831 |

## Selesai

| No | Fitur | File utama | Gelombang |
|---|---|---|---|
| 74 | Penyesuaian tata letak, skala & margin tombol virtual kustom (skala 80%-140% & margin 8-28px) | `core/input.js` (`layout`), `ui/menus.js` (`openSettings`) | 23 |
| 169 | Magnet koin emas & material jatuhan otomatis (tarikan halus radius 70 px) | `systems/combat.js` (`updPicks`) | 23 |
| 497 | Dapur masak mandiri di rumah Arka (kompor terpasang di rumah untuk masak bekal & hidangan) | `systems/home.js` (`stove`), `world/maps/interior.js` | 23 |
| 418 | Pewarna alami dari bunga & corak jubah baru (4 botol pewarna kelopak & opsi jubah celup di lemari) | `data/items.js`, `systems/craft.js`, `systems/home.js` (`useWardrobe`) | 23 |
| 181/183 | Skuad taktis goblin: pemanah jarak jauh & dukun penyembuh | `data/enemies.js` (`goblin_archer`, `goblin_shaman`), `ai/enemies.js` | 23 |
| 442 | Misi kurir ekspedisi kilat antar-kota (Budi Kurir Kilat di gerbang kota, antar paket dalam 180 dtk) | `world/maps/city.js`, `npc/dialog.js` (`talkCourier`) | 23 |
| 40 | Balai lelang barang antik Kota Lumina (Juru Lelang Bastian di pasar, tawar-menawar ketukan palu) | `world/maps/city.js`, `npc/dialog.js` (`talkAuctioneer`) | 23 |
| 17 | Pohon bakat keahlian Arka (3 cabang: Pendekar Pedang, Penyihir Bijak, Penjelajah Alam) | `ui/menus.js` (`openTalentTree`), `core/state.js` (`S.talents`) | 22 |
| 197 | Musuh Raja Slime membelah diri (Mahkota emas meletus pecah menjadi 3 slime kecil) | `data/enemies.js` (`king_slime`), `systems/combat.js` | 22 |
| 438 | Kotak bekal perjalanan (bento simpan 3 masakan untuk santap instan darurat) | `data/items.js` (`lunchbox`), `systems/craft.js` (`useTool`) | 22 |
| 460 | Pasar malam eksotis Kota Lumina (kios malam jam 19.00-05.00 jual barang langka & permata) | `world/maps/city.js`, `npc/dialog.js` (`talkNightMerchant`) | 22 |
| 425 | Lilin sarang lebah penerang gua (resep lilin madu pendaran cahaya 2,2× lipat 5 menit) | `data/items.js` (`candle`), `systems/craft.js` (`CRAFT`, `useTool`) | 22 |
| 38 | Tren harga pasar mingguan (rotasi 3 pekan: Pekan Ikan +40%, Alam +50%, Logam +35%) | `ui/shop.js` (`sellMenu`, `getTrendMul`) | 22 |
| 56 | Perahu nelayan & mancing danau dalam (dayung ke pulau tengah & pancing ikan patin raksasa / rembulan) | `world/maps/lake.js` (`dockboat`), `scene/world.js`, `data/items.js` | 22 |
| 11 | Pertarungan gelombang di arena Kota Lumina (3 gelombang musuh bertahap berhadiah 250 G & Gelar Juara) | `world/maps/city.js`, `npc/dialog.js` (`startCityArena`) | 21 |
| 241 | Papan buronan monster langka Kota Lumina (Taring Perak, Raja Rawa, Gargoyle Merah) | `systems/economy.js` (`openCityBounties`), `data/enemies.js`, `world/maps/city.js` | 21 |
| 420 | Peleburan batangan logam di tungku kerajinan (Batangan Besi & Batangan Kristal) | `systems/craft.js` (`CRAFT`), `data/items.js` (`iron_bar`, `crystal_bar`) | 21 |
| 496 | Ranjang nyaman & buff tidur "Bugar" (durasi 10 menit +15% EXP & +5% speed) | `systems/home.js` (`bed_cozy`), `core/state.js` (`BUFF.rested`) | 21 |
| 208 | Mekanik kerangka bangkit kembali (tengkorak runtuh bergetar & bangkit jika tak dibakar) | `systems/combat.js` (`hitEnemy`) | 21 |
| 495 | Kustomisasi lantai & dinding interior rumah Arka (papan perabot 📋: pilihan motif ubin & dinding) | `systems/home.js` (`chooseHomeStyle`), `core/state.js` (`S.homeStyle`) | 21 |
| 83 | Mode landscape responsif layar lebar (tata letak kontrol sudut ergonomis rasio >= 1.5) | `core/input.js` (`layout`), `styles.css` (`wide-land`) | 21 |
| 15 | Tingkat kesulitan (Santai/Normal/Sulit) | `core/state.js` (`DIFF`), `ui/menus.js` | 1 |
| 34 | Perbandingan perlengkapan ▲▼ di tas | `ui/bag.js` (`cmp`) | 1 |
| 75 | Kecepatan teks (4 tingkat) + tahan untuk mempercepat | `ui/widgets.js` (`say`) | 1 |
| 180 | Coba lagi dari depan arena saat kalah melawan boss | `systems/combat.js` (`defeat`), `systems/qol.js` | 1 |
| 851 | Tombol aksi kontekstual (BICARA/BUKA/MASUK/BACA/AMBIL) | `systems/qol.js` | 1 |
| 852 | Ikon interaksi di atas benda/NPC | `systems/qol.js` | 1 |
| 877 | Jeda otomatis + simpan saat aplikasi disembunyikan | `systems/qol.js` | 1 |
| 888 | Rincian kenaikan statistik saat naik level | `systems/qol.js` (`levelUpDetail`) | 1 |
| 904 | Bilah HP kecil di atas musuh (bisa dimatikan) | `systems/qol.js` | 1 |
| 960 | Nomor versi di layar judul | `ui/title.js`, `GAME_VERSION` | 1 |
| 963–964 | Cadangan save bergilir (3) + pemulihan save rusak | `core/state.js` (`readSaveRaw`) | 1 |
| 73 | Tutorial bertahap: tips muncul sekali saat situasinya terjadi (bisa dimatikan) | `systems/qol.js` (`TIPS`, `updTips`) | 2 |
| 79 | 3 slot simpan (pilih slot di judul, konfirmasi timpa) | `core/state.js` (`setSlot`, `slotInfo`), `ui/menus.js` (`chooseSlot`) | 2 |
| 82 | Peta mini di kiri atas (ketuk = peta besar) | `systems/qol.js` (`updMinimap`) | 2 |
| 880 | Riwayat dialog (60 terakhir) di MENU | `ui/widgets.js` (`DLG_LOG`), `ui/menus.js` (`openDlgLog`) | 2 |
| 909 | Simpan cepat (sudah ada di MENU, dicatat) | `ui/menus.js` | 2 |
| 910 | Simpan saat halaman ditutup | `systems/qol.js` (`pagehide`) | 2 |
| 1 | Ancang-ancang: tanda "!" + kedip sebelum musuh menyerang/menembak | `systems/feel.js` (`updFeel`) | 3 |
| 2 | Kombo pedang 3 pukulan (ke-3 ×1,6 dan dorongan ×1,9) | `systems/combat.js` (`attack`) | 3 |
| 4 | Musuh elit (6%): HP ×2,2, aura emas, peluru melingkar, hadiah langka | `systems/feel.js` (`makeElite`), `scene/world.js` | 3 |
| 14 | Penanda bahaya merah di tepi layar saat diserang dari luar layar | `systems/feel.js` (`dangerFrom`), `styles.css` | 3 |
| 120 | Meteran waspada musuh "?" lalu "!" | `systems/feel.js` | 3 |
| 146 | Musuh gesit (terbang/menerjang/hantu) menghindari bola api & panah | `systems/feel.js` | 3 |
| 86 | Lagu khas wilayah: salju, rawa, hutan, kota | `systems/sound.js` (`TRACKS`, `bgmFor`) | 4 |
| 87 | Musik dinamis: lagu tarung saat dikejar musuh, memudar halus | `systems/sound.js` (`updSound`, `swapBGM`) | 4 |
| 88 | Langkah kaki sesuai tanah (rumput, tanah, batu, salju, kayu, air) | `systems/sound.js` (`groundAt`, `stepSound`) | 4 |
| 911 | Lagu desa/kota versi malam yang lembut | `systems/sound.js` | 4 |
| 915 | Lagu kemenangan setelah boss (sudah ada, dicatat) | `core/audio.js` | 4 |
| 919 | Suara jauh-dekat + kiri/kanan untuk suara musuh | `systems/sound.js` (`sfxAt`) | 4 |
| 16 | Poin atribut: 3/level untuk Kekuatan, Sihir, Ketahanan, Kelincahan (save lama dapat poin susulan) | `systems/craft.js` (`ATTR`, `openAttr`) | 5 |
| 26 | Kerajinan di MENU: ramuan, penawar, bom, asap, jaring, panah, umpan | `systems/craft.js` (`CRAFT`, `openCraft`) | 5 |
| 29 | Bom asap & jaring | `systems/craft.js` (`useTool`) | 5 |
| 30 | 2 tombol alat cepat (R/F di keyboard), bisa diatur | `systems/craft.js` (`openToolSlots`, `updToolBtns`) | 5 |
| 407 | Bom api (meledak + membakar) | `systems/craft.js` | 5 |
| 411 | Panah Tajam buatan (×1,6, menembus) | `systems/combat.js` (`shootArrow`) | 5 |
| 412 | Umpan pancing (ikan langka lebih sering) | `systems/life.js` (`fish`) | 5 |
| 61 | Kabut peta: terbuka sesuai area yang dilalui (peta besar & mini, tersimpan) | `systems/explore.js` (`updFog`, `drawFog`) | 6 |
| 63 | Rahasia: semak kering (bakar/bom), batu retak (bom), 3 per wilayah liar | `systems/explore.js` (`initSecrets`, `freeSpot`) | 6 |
| 66 | Peta harta sobek → ✖ di peta → gali harta besar | `systems/explore.js` (`giveTreasureMap`, `digTreasure`) | 6 |
| 665 | Titik galian bercahaya | `systems/explore.js` | 6 |
| 675 | Jarak ke tujuan (meter) di kartu misi & peta | `systems/ambient.js`, `systems/explore.js` | 6 |
| 678 | Zoom peta: tombol −/+, roda tetikus, cubit, geser; ↑/↓ di keyboard | `systems/explore.js` (`openMapNew`) | 6 |
| 679 | Ikon NPC di peta (guru 📖, pemburu 🏹, tetua 📜) | `systems/explore.js` (`ROLE_ICON`) | 6 |
| 680 | Ikon toko di peta (🛒 toko, ⚒ bengkel, 🛏 penginapan) | `systems/explore.js` | 6 |
| 46 | Rumah Arka: rumah kosong di desa dibeli 250 G, ditata lewat papan 📋 | `systems/home.js`, `world/maps/village.js` | 7 |
| 32 | Peti penyimpanan rumah (simpan/ambil barang) | `systems/home.js` (`openBox`) | 7 |
| 493 | Tata perabot bebas: angkat, geser, putar, cek muat/tidak (merah) | `systems/home.js` (`startCarry`, `furnOk`) | 7 |
| 497 | Dapur rumah (Tungku → masak) | `systems/home.js` | 7 |
| 498 | Bengkel rumah (Meja Kerajinan) | `systems/home.js` | 7 |
| 674 | Papan arah kayu di 4 persimpangan (Padang Angin, Hutan Lumina) | `world/maps/meadow.js`, `forest.js` | 7 |
| 47 | Peternakan: Kandang Arka di desa (ikut rumah), beli ayam/domba/sapi, maks 6 | `systems/ranch.js`, `world/maps/village.js` (`ranch`) | 8 |
| 514 | Kandang ayam: telur harian | `systems/ranch.js` | 8 |
| 515 | Kandang sapi: susu harian (item baru Susu Segar) | `systems/ranch.js` | 8 |
| 519 | Kasih sayang: elus tiap hari, ♥ ≥ 6 → hasil ×2 | `systems/ranch.js` (`tendStock`) | 8 |
| 505 | Irigasi per petak (250 G): tumbuh 2× lebih cepat | `systems/ranch.js` (`plantPlot`, `plotHours`) | 8 |
| 51 | Mancing lebih dalam: 11 jenis per lokasi/jam/cuaca, ikan raksasa | `systems/fishing.js` (`FISH`, `fishPool`) | 9 |
| 571 | Tarik-ulur: tahan untuk menggulung, lepas saat tali merah | `systems/fishing.js` (`tugGame`) | 9 |
| 572 | Ikan per jam (trout pagi, lele malam, belut senja, rembulan tengah malam) | `systems/fishing.js` | 9 |
| 573 | Ikan per cuaca (hujan) | `systems/fishing.js` | 9 |
| 575 | Ukuran ikan (cm) + rekor per jenis di Buku Ikan | `systems/fishing.js` (`logFish`) | 9 |
| 576 | 3 ikan legendaris (hutan, rawa, sungai), butuh umpan & waktu tepat | `systems/fishing.js` | 9 |
| 583 | Akuarium di Rumah Arka (pajang 4 ikan, berenang) | `systems/fishing.js` (`FCAT.tank`) | 9 |
| 574 | Ikan musim dingin (lubang es Puncak Beku, sudah ada, dicatat) | `systems/life.js` (`fishIceHole`) | 9 |
| 701 | Kalender: hari, tanggal, musim, tahun (HUD kiri atas) | `systems/season.js` (`dateTxt`) | 10 |
| 702 | Nama hari Senin–Minggu | `systems/season.js` | 10 |
| 703 | Bengkel libur hari Minggu | `systems/season.js` (`shopShut`) | 10 |
| 704 | Toko buka 08.00–18.00 | `systems/season.js` (`wrapShops`) | 10 |
| 49 | 4 musim × 7 hari mengubah warna dunia, kebun, ikan, monster | `systems/season.js` (`SEASONS`) | 10 |
| 714 | Semi: kelopak bunga berjatuhan, benih tumbuh lebih cepat | `systems/season.js` | 10 |
| 715 | Panas: ikan +15% lebih besar | `systems/season.js` | 10 |
| 716 | Gugur: daun jingga berguguran | `systems/season.js` | 10 |
| 717 | Dingin: salju turun di desa & alam, tanaman lambat, monster lebih ganas | `systems/season.js` | 10 |
| — | Tidur di penginapan/ranjang rumah melompat ke pagi (07.00) | `systems/season.js` (`sleepToMorning`) | 10 |
| 99 | Hemat baterai: 30 FPS & partikel musim mati | `systems/polish.js` (`applyLite`) | 11 |
| 3 | Tangkis: serang ≤0,18 dtk sebelum kena pukul → musuh terpental, pukulan berikut kritis | `systems/polish.js` | 11 |
| 5 | Kelemahan elemen: es lemah api, api lemah es, tanaman lemah api (LEMAH! berwarna) | `systems/polish.js` (`ELEM`, `WEAK`) | 11 |
| 6 | Kunci target: ketuk musuh / tombol T; sihir & panah membidik otomatis | `systems/polish.js` (`setLock`, `updLock`) | 11 |
| 35 | Urutkan tas: jenis / nilai / baru / nama (DASH atau ketuk label) | `ui/bag.js` (`BAG_SORT`) | 11 |
| 37 | Warna kelangkaan: biru langka, ungu epik, jingga legendaris | `systems/polish.js` (`rarity`) | 11 |
| 76 | Ukuran huruf 4 tingkat | `systems/polish.js` (`applyFont`), `styles.css` | 11 |
| 81 | Notifikasi barang bertumpuk di pojok kiri bawah | `systems/polish.js` (`toastItem`) | 11 |
| 45 | Papan permintaan barang: 3 tugas harian warga di desa (rotasi per hari) | `systems/economy.js` (`openNoticeBoard`) | 12 |
| 39 | Pedagang keliling berjadwal (Kang Kembara) berganti lokasi & barang langka per hari | `systems/economy.js` (`isMerchantHere`) | 12 |
| 374 | Kunci item di tas (🔒 kebal dari aksi jual) via tombol DASH | `ui/bag.js` (`toggleLock`) | 12 |
| 36 | Jual cepat barang sampah (⚡ jual semua drop monster biasa) di toko | `ui/shop.js` (`sellMenu`) | 12 |
| 28 | Buku resep di MENU: katalog resep tempa, masak & kerajinan beserta status bahan | `systems/economy.js` (`openRecipeBook`) | 12 |
| 18 | Sistem gelar pemain: terbuka dari pencapaian & beri bonus pasif status | `systems/economy.js` (`TITLES`, `checkTitles`) | 12 |
| 25 | Layar rekap statistik petualangan (waktu main, monster, bos, langkah, koin) | `systems/economy.js` (`openStatsAndTitles`) | 12 |
| 22 | Set perlengkapan (bonus stat pasif saat mengenakan kombinasi set yang cocok) | `data/items.js` (`SETS`, `activeSets`), `core/state.js` | 13 |
| 371 | Simpan pasang perlengkapan (3 preset loadout cepat di tas) | `ui/bag.js` (`handleLoadout`) | 13 |
| 13 | Pukulan kritis dari belakang / backstab (damage ×1.8 saat musuh membelakangi) | `systems/combat.js` | 13 |
| 69 | Monster malam hari lebih buas (mata menyala, hadiah EXP & koin bertambah) | `systems/combat.js` (`killEnemy`) | 13 |
| 388 | Buat banyak sekaligus di kerajinan & masak (opsi ×1, ×5, Maks) | `systems/craft.js` (`openCraft`), `ui/shop.js` (`cookMenu`) | 13 |
| 462 | Beli kembali barang toko (riwayat 8 item terakhir yang terjual di toko) | `ui/shop.js` (`buybackMenu`) | 13 |
| 62 | Penanda pribadi di peta (taruh/hapus hingga 5 pin 📍 di peta besar) | `systems/explore.js` (`openMapNew`) | 13 |
| 52 | Penambangan di Gua (urat batu geoda `minestone` dengan retakan & hasil bijih/kristal) | `world/maps/cave.js`, `scene/world.js` | 14 |
| 23 | Permata & soket senjata (pasang permata kecubung/kristal/bijih/spora di Bengkel Pak Besi) | `ui/shop.js` (`socketMenu`), `systems/combat.js` | 14 |
| 10 | Rintangan medan tempur (tong peledak `bombbarrel` & semak berduri `bramble`) | `world/objects.js`, `scene/world.js` | 14 |
| 8 | Taktik flanking musuh berkelompok (musuh menyebar mengepung Arka saat mengejar) | `ai/enemies.js` | 14 |
| 96 | Tantangan harian aksi (Daily Feats di MENU dengan hadiah koin & EXP berkala) | `systems/economy.js` (`openDailyFeats`), `ui/menus.js` | 14 |
| 375 | Tanda item baru `BARU` di tas (badge otomatis hilang setelah item dilihat/disorot) | `ui/bag.js`, `core/state.js` | 14 |
| 91 | Rumput dan semak bergoyang saat Arka melintas | `scene/world.js` | 14 |
| 70 | Jembatan rusak & jalan pintas (bisa diperbaiki dengan 5 Kayu + 40 G) | `world/maps/wild.js`, `scene/world.js` | 15 |
| 485 | Kotak surat rumah Arka (menerima surat kiriman warga & hadiah lampiran) | `world/maps/village.js`, `systems/economy.js` (`openMailbox`) | 15 |
| 372 | Tukar cepat senjata (shortcut Q / tombol pintas menukar senjata utama & cadangan) | `core/input.js`, `scene/world.js` (`swapWeapon`), `ui/bag.js` | 15 |
| 44 | Diskon langganan toko (akumulasi belanja membuka diskon hingga 15% ⭐⭐⭐) | `ui/shop.js` (`buyMenu`), `core/state.js` | 15 |
| 376 | Info sumber & habitat item (panduan lokasi asal bahan di tooltip tas) | `data/items.js` (`src`), `ui/bag.js` | 15 |
| 90 | Air beranimasi & percikan langkah (audio debur & percikan air di zona perairan dangkal) | `scene/world.js` | 15 |
| 94 | Pencapaian ekstra & gelar baru (8 pencapaian baru & 6 gelar progresif di menu) | `data/quests.js` (`ACH`), `systems/economy.js` (`TITLES`) | 15 |
| 71 | Ensiklopedia Benua Lumina (katalog koleksi flora, fauna, mineral, bestiari & % kelengkapan) | `systems/economy.js` (`openEncyclopedia`), `ui/menus.js` | 16 |
| 27 | Alkimia & eksperimen ramuan (meracik 2 bahan bebas di meja alkimia rumah/akademi) | `systems/economy.js` (`openAlchemyTable`), `systems/home.js` | 16 |
| 33 | 5 Senjata legendaris tersembunyi (Surya Aurel, Bayangan Senja, Gempa Gua, Glasier, Rembulan) | `data/items.js`, `systems/combat.js` | 16 |
| 373 | Tombol "Pakai Terbaik" (evaluasi cerdas & otomatis memasang set perlengkapan terkuat) | `ui/bag.js` (`autoEquipBest`) | 16 |
| 67 | Titik pemandangan indah (bangku santai di ketinggian untuk pemulihan & kabut terbuka) | `world/objects.js`, `world/maps/meadow.js`, `scene/world.js` | 16 |
| 9 | Panggilan bantuan musuh terdesak (goblin/serigala/babi memanggil kawan saat sekarat) | `ai/enemies.js` | 16 |
| 92 | Pendaran lentera malam dinamis (denyut sinar bernapas pada lampu & obor di kegelapan) | `scene/world.js` | 16 |
| 199 | Peti palsu / Mimic penggigit (peti jebakan di gua/reruntuhan yang menyerang) | `data/enemies.js` (`mimic`), `systems/story.js` | 17 |
| 198 | Slime emas langka (varian lincah bernilai 150-250 G & 100 EXP yang kabur) | `data/enemies.js` (`gold_slime`), `scene/world.js` | 17 |
| 346 | Jimat kepulangan / batu teleport saku (teleportasi seketika ke depan Rumah Arka) | `data/items.js` (`hearthstone`), `systems/craft.js` | 17 |
| 54 | Menangkap serangga & koleksi serangga (jaring serangga & tab Ensiklopedia) | `data/items.js`, `systems/craft.js`, `systems/economy.js` | 17 |
| 499 | Rak pajangan trofi di rumah Arka (pajangan piala, fosil, permata & ikan legendaris) | `systems/home.js` (`useTrophyShelf`) | 17 |
| 72 | Kompas mata angin & arah di HUD (orientasi mata angin U/S/T/B di bilah status) | `ui/widgets.js` (`updHud`) | 17 |
| 98 | Mode pengembang / menu debug (ketuk versi 5x untuk QA, teleport peta, dan alat) | `ui/title.js`, `ui/menus.js` (`openDebugMenu`) | 17 |
| 12 | Boss rematch di Kuil Ingatan (uji tanding boss versi lebih kuat, catat rekor waktu tercepat) | `world/maps/interiors.js`, `systems/economy.js` (`openMemoryTrials`) | 18 |
| 42 | Brankas desa & bunga simpanan (titip/tarik emas di balai desa, bunga 2% per hari) | `world/maps/interiors.js`, `systems/economy.js` (`openVillageVault`) | 18 |
| 408 | Bom es kerajinan (resep pecahan kristal + air stalaktit, ledakan beku area 45 px) | `data/items.js` (`fbomb`), `systems/craft.js` | 18 |
| 68 | Cuaca ekstrem: sambaran petir di padang/rawa & badai salju memperlambat langkah | `systems/ambient.js`, `systems/status.js` | 18 |
| 84 | Pencarian cepat di tas (filter instan kata kunci ramuan, panah, ikan, bom, dll.) | `ui/bag.js` (`BAG_SEARCH`) | 18 |
| 7 | Serangan menukik musuh terbang (manuver swoop tajam kelelawar, bisa ditangkis hingga jatuh) | `ai/enemies.js` (`fly`), `systems/polish.js` | 18 |
| 95 | Papan rekor petualang / Hall of Fame (papan prestasi rekor ikan, waktu rematch, langkah) | `world/maps/village.js`, `systems/economy.js` (`openHallOfFame`) | 18 |
| 21 | Lemari pakaian & warna jubah Arka (kustomisasi warna busana di kamar tidur rumah) | `systems/home.js` (`useWardrobe`), `core/state.js` | 19 |
| 500 | Tamu warga berkunjung ke rumah (Lina/Bu Rina/Tetua bertamu sore hari membawa hidangan) | `systems/home.js` | 19 |
| 53 | Menebang pohon lapuk & kayu gelondong (pohon tua lapuk di tepi hutan menghasilkan kayu) | `world/maps/forest.js`, `scene/world.js` | 19 |
| 43 | Barter langsung dengan penduduk (tukar komoditas hasil alam langsung tanpa uang) | `npc/dialog.js`, `systems/economy.js` (`openDirectBarter`) | 19 |
| 65 | Teka-teki pilar runa kuno (pilar elemen Api-Es-Cahaya di Reruntuhan Aurel berhadiah peti) | `world/maps/wild.js`, `systems/story.js` (`interactRunePillar`) | 19 |
| 410 | Petasan pengalih perhatian musuh (alat lempar letupan penarik perhatian musuh selama 4 dtk) | `data/items.js` (`firecracker`), `systems/craft.js` | 19 |
| 77 | Mode aksesibilitas buta warna (kontras tinggi & label teks damage [KRIT!] [LEMAH!]) | `ui/menus.js`, `systems/combat.js`, `systems/polish.js` | 19 |
| 20 | Kemampuan jelajah: mendorong batu besar (dorong batu purba membuka ceruk gua rahasia) | `world/maps/cave.js`, `systems/life.js` (`updBoulder`) | 20 |
| 58 | Peliharaan anjing pelacak harta (anjing Kuro setia menggonggong mendekati rahasia & peti) | `npc/dialog.js`, `systems/life.js` (`updPet`) | 20 |
| 55 | Mode kamera foto & snapshot (mode jepret foto lanskap petualangan bebas HUD) | `ui/menus.js` (`openPhotoMode`) | 20 |
| 50 | Seni memasak: kualitas bintang tiga (timing ketukan masak hasilkan bonus buff +50% & HP/MP) | `ui/shop.js` (`cookMenu`) | 20 |
| 31 | Kantong tas kulit sapi (item penata tas & bonus +5% nilai jual di toko) | `data/items.js` (`leather_pouch`), `ui/shop.js` | 20 |
| 93 | Filter efek layar opsional (opsi atmosferik: Standar / Hangat / Vinyet / Retro CRT) | `ui/menus.js`, `systems/polish.js` (`applyScreenFilter`) | 20 |
| 502 | Petak kebun bunga rumah & buket wangi (tanam benih aster di kebun, panen buket segar) | `systems/ranch.js`, `data/items.js` (`seed_flower`) | 20 |

## Sebagian

| No | Sudah | Belum |
|---|---|---|
| 74 | Ukuran (4) & transparansi (3) tombol | Geser posisi tombol sendiri |
| 89 | Animasi terkena (penyok) & jatuh saat kalah | Frame gambar khusus Arka (butuh aset) |
| 492 | Perluasan rumah: batas perabot 6 → 10 → 14 | Kamar/dapur/gudang sebagai ruangan baru |
| 718 | Warna seluruh dunia berganti per musim | Daun pohon berganti gambar (butuh aset pohon musiman) |
| 48 | 3 jenis benih (sayur, beri, daun obat) + irigasi | Petak kebun tambahan (desa sudah padat; butuh lahan baru) |

## Sudah ada sebelum daftar dibuat (tidak dihitung ulang)

Simpan otomatis, ekspor/impor save, teleport, peta + penunjuk misi, belajar jurus, masak, pancing dasar, kebun dasar, siang-malam, cuaca dasar, monitor FPS, gamepad, PWA, suasana alam, NPC beraktivitas.

## Rencana gelombang

| Gelombang | Isi (nomor) | Tema |
|---|---|---|
| ~~2~~ | ✅ selesai | — |
| ~~3~~ | ✅ selesai | — |
| ~~4~~ | ✅ selesai | — |
| ~~5~~ | ✅ selesai | — |
| ~~6~~ | ✅ selesai (674 papan arah pindah ke gelombang 7: perlu penempatan di data peta) | — |
| ~~7~~ | ✅ selesai | — |
| ~~8~~ | ✅ selesai | — |
| ~~9~~ | ✅ selesai | — |
| ~~10~~ | ✅ selesai | — |
| ~~11~~ | ✅ selesai: 99, 3, 5, 6, 35, 37, 76, 81 | — |
| ~~12~~ | ✅ selesai: 45, 39, 374, 36, 28, 18, 25 | Ekonomi Desa, Karakter & Kenyamanan Tas |
| ~~13~~ | ✅ selesai: 22, 371, 13, 69, 388, 462, 62 | Sinergi Perlengkapan, Taktik & Eksplorasi Malam |
| ~~14~~ | ✅ selesai: 52, 23, 10, 8, 96, 375, 91 | Penambangan, Permata Soket, Flanking AI, & Interaksi Medan |
| ~~15~~ | ✅ selesai: 70, 485, 372, 44, 376, 90, 94 | Eksplorasi Pintas, Kotak Surat Rumah & Alur Tempur |
| ~~16~~ | ✅ selesai: 71, 27, 33, 373, 67, 9, 92 | Ensiklopedia Benua, Alkimia Eksperimen & Relik Legendaris |
| ~~17~~ | ✅ selesai: 199, 198, 346, 54, 499, 72, 98 | Kejutan Liar, Relik Teleport Saku & Koleksi Alam |
| ~~18~~ | ✅ selesai: 12, 42, 408, 68, 84, 7, 95 | Rematch Boss, Brankas Desa, Bom Es & Cuaca Ekstrem |
| ~~19~~ | ✅ selesai: 21, 500, 53, 43, 65, 410, 77 | Lemari Pakaian, Tamu Rumah, Tebang Pohon & Pilar Runa |
| ~~20~~ | ✅ selesai: 20, 58, 55, 50, 31, 93, 502 | Mendorong Batu, Anjing Kuro, Kamera, Masak Bintang & Kebun Bunga |
| ~~21~~ | ✅ selesai: 11, 241, 420, 496, 208, 495, 83 | Arena Gelombang, Papan Buronan, Batang Logam, Buff Bugar, Tengkorak Bangkit & Landscape Lebar |
| ~~22~~ | ✅ selesai: 17, 197, 438, 460, 425, 38, 56 | Pohon Bakat Arka, Raja Slime Pecah, Kotak Bekal, Pasar Malam, Lilin Sarang Lebah, Tren Pasar Mingguan, & Perahu Danau Dalam |
| ~~A~~ | ✅ Performa: culling, entitas jauh tidur, tembok di luar daftar tampilan (CPU/frame Hutan Dalam 14,7 → 5,8 ms) | — |
| ~~B~~ | ✅ Tanah per chunk 64 px (masuk wilayah Hutan Dalam 1,9 dtk → 0,19 dtk; memori tanah maks ±26 MB vs ±93 MB), bayangan diindeks (33,6 → 4,5 ms/potongan), tabrakan gua/kolam digabung vertikal. Atlas tidak dikerjakan: Phaser 3.80 sudah menggabungkan 16 tekstur per batch & culling menyisakan ±150 objek | — |
| C1 | ✅ Tahap 1 dunia terbuka: 13 sambungan tepi (26 arah) tanpa layar hitam; wilayah tetangga terlihat di tepi; kamera menyambung | — |
| C2 | ✅ Posisi global benua tanpa tumpang tindih (`WORLD_POS`), 7 medan peralihan otomatis (termasuk Dataran Senja 3.368 px), jalan & monster peralihan | Wilayah aktif masih berganti per scene (jeda singkat); tanah antarwilayah belum dibaur |
| C3 | Stamina, lari cepat, memanjat tebing, meluncur | — |
| C4 | Menara pandang, koleksi tersebar, teka-teki dunia | — |
| ~~23~~ | ✅ selesai: 74, 169, 497, 418, 181/183, 442, 40 | Skala & Margin Tombol Kustom, Magnet Koin, Dapur Rumah, Pewarna Bunga, Goblin Taktis, Kurir Kilat, & Balai Lelang |
| 24+ | sisanya per kategori, P1/P2 dulu | — |

## Dibatalkan

_(belum ada)_
