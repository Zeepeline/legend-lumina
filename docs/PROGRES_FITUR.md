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
| 72 | 5 | 0 | 923 |

## Selesai

| No | Fitur | File utama | Gelombang |
|---|---|---|---|
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
| 11+ | sisanya per kategori, P1/P2 dulu | — |

## Dibatalkan

_(belum ada)_
