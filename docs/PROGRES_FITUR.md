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
| 29 | 2 | 0 | 969 |

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

## Sebagian

| No | Sudah | Belum |
|---|---|---|
| 74 | Ukuran (4) & transparansi (3) tombol | Geser posisi tombol sendiri |
| 89 | Animasi terkena (penyok) & jatuh saat kalah | Frame gambar khusus Arka (butuh aset) |

## Sudah ada sebelum daftar dibuat (tidak dihitung ulang)

Simpan otomatis, ekspor/impor save, teleport, peta + penunjuk misi, belajar jurus, masak, pancing dasar, kebun dasar, siang-malam, cuaca dasar, monitor FPS, gamepad, PWA, suasana alam, NPC beraktivitas.

## Rencana gelombang

| Gelombang | Isi (nomor) | Tema |
|---|---|---|
| ~~2~~ | ✅ selesai | — |
| ~~3~~ | ✅ selesai | — |
| ~~4~~ | ✅ selesai | — |
| 5 | 16, 26, 30, 29, 407, 411, 412 | Poin atribut, meja kerajinan, slot alat, bom, panah, umpan |
| 6 | 61, 63, 66, 665, 674, 675, 678, 679, 680 | Kabut peta, rahasia, peta harta, penanda dan zoom peta |
| 7 | 46, 492, 493, 497, 498, 32 | Rumah Arka & perabot |
| 8 | 47, 514, 515, 519, 48, 505 | Peternakan & kebun lebih luas |
| 9 | 51, 571–576, 583 | Mancing mendalam & akuarium |
| 10 | 49, 714–718, 701–704 | Musim & kalender |
| 11+ | sisanya per kategori, P1/P2 dulu | — |

## Dibatalkan

_(belum ada)_
