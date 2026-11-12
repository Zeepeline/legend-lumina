# AGENTS.md: panduan untuk AI agent yang melanjutkan proyek ini

Pemilik proyek berbahasa Indonesia: balas dan tulis teks game dalam **Bahasa Indonesia**.

**Hemat konteks:** jangan membaca semua file. Pakai peta file di bawah untuk menemukan 1–3 file yang relevan, lalu baca file itu saja. Setiap file punya ringkasan di baris ke-2.

## Proyek

**Legenda Lumina**: action RPG top-down untuk browser (utamanya HP), dengan **Phaser 3.80.1** dari CDN. Tanpa bundler: `index.html` memuat skrip biasa (bukan ES module) berurutan, dan semua file berbagi scope global.

## Menjalankan

- Dengan server lokal (wajib untuk `index.html`, karena gambar PNG dibaca ke kanvas):
  `python3 -m http.server 8000` lalu buka `http://localhost:8000`
- Satu file tanpa server: `python3 tools/bundle.py` → `dist/game.html`
- Debug di konsol: `__game.S` (status), `__game.sc` (scene), `__game.press('a')`, `__game.sc.goto('swamp', 640, 60, 'down')`

## Peta file (`src/`)

| File | Isi |
| --- | --- |
| `core/util.js` | `VW`/`VH` (ukuran layar game), `rnd`, `clamp`, `sleep`, `$` |
| `core/audio.js` | musik `TRACKS`, `playBGM(nama)`, efek `sfx(nama)` |
| `core/input.js` | `Input` (keyboard, joystick, tombol), `KEYMAP`, `layout()` |
| `core/state.js` | status pemain `S`, `newState()`, `stat()`, `has()`, `addItem()`, simpan/muat, pengaturan perangkat `OPT` (`saveOpt()`), upgrade `UPG`/`S.up`/`itemName()`, bonus masakan `BUFF`/`S.buff` |
| `data/items.js` | `ITEMS`, `COOK` (masak di penginapan), `RECIPES` (tempa) |
| `data/enemies.js` | `ENEMY` (stat & jenis AI tiap musuh), `PROJ` (proyektil) |
| `data/quests.js` | `STAGE_TXT`, `STAGE_GOAL` (misi utama), `SKILLS`, `ACH` (pencapaian) |
| `art/base.js` | kanvas & warna, **aturan gaya**: `toneC()` (bayangan kebiruan/sorotan kekuningan), `outline()` (garis tepi berwarna), `renderMap()` |
| `art/monsters2.js` | **sprite monster versi garang** (menimpa `MON` lama, kunci palet sama), `shadeMon()` pencahayaan otomatis, `monFrame2()` frame animasi otomatis (`anim`: walk/squash/bob) |
| `art/nature.js` · `buildings.js` · `characters.js` · `monsters.js` · `items.js` · `fx.js` · `interior.js` | pixel art buatan kode, per jenis |
| `world/objects.js` | `OBJ`: tekstur, kotak tabrakan, bayangan, pudar, cerobong tiap objek dunia |
| `world/maps/*.js` | satu file per peta: jalan, objek, NPC, musuh, boss, peti, pintu keluar |
| `world/ground.js` | generator tanah, tabrakan grid (gua/kolam), penyebar pohon |
| `gfx/textures.js` | `IMG_LIST` (PNG di `assets/img`), `buildTextures()`: daftar semua tekstur & animasi |
| `gfx/bake.js` | bayangan objek dipanggang ke tekstur tanah |
| `scene/world.js` | scene Phaser `World`: `create()` (bangun peta), `update()`, `camStep()` (kamera), `actionA()`, `checkZones()` |
| `systems/combat.js` | `WEAPON_STYLE` (pedang/tombak/kapak/busur, dipilih lewat `ITEMS[..].wt`), serang, sihir, damage, `hitStop()`, drop, EXP, proyektil, kalah |
| `systems/skills.js` | dash, tebasan putar, nova es |
| `systems/learn.js` | **sistem belajar jurus**: `JURUS` (aliran, guru, syarat, biaya, dialog latihan), `learnTalk()` (guru mengajar), `castSpell()` (Kabut Racun, Cahaya Pulih, Lentera Suci), penguasaan I–III (`tierOf`, `useJurus`, `MASTERY`). Jurus baru: tambah ke `JURUS` + efeknya |
| `systems/ambient.js` | **suasana alam** per peta (`ENV`): burung/kelinci/tupai yang kabur, kupu-kupu, kunang-kunang, ikan melompat, bayangan awan, berkas cahaya, kabut, suara latar, Daun Obat & Buah Beri di tepi jalan; juga **penunjuk misi** `updQuestGuide()` (panah di tepi layar / bintang di atas tujuan, dari `questTarget()` di `ui/map.js`). Kartu misi di `updHud()` (`ui/widgets.js`) |
| `systems/qol.js` | kenyamanan: ikon interaksi & tombol kontekstual, bilah HP musuh, jeda otomatis, rincian naik level, coba lagi boss |
| `systems/feel.js` | rasa bertarung: tanda "!" ancang-ancang & waspada, musuh elit (`makeElite`), penanda bahaya tepi layar, musuh menghindar (`updFeel`) |
| `systems/sound.js` | lagu per wilayah & malam (`bgmFor`), musik tarung dinamis (`swapBGM`), suara jauh-dekat (`sfxAt`), langkah per tanah (`groundAt`) |
| `systems/craft.js` | poin atribut (`S.attr`, `openAttr`, membungkus `stat()`), kerajinan (`CRAFT`), alat lempar (`useTool`), 2 slot alat (`S.tools`) |
| `systems/explore.js` | kabut peta (`S.fog`), rahasia per wilayah liar (`freeSpot` mengikuti aturan penempatan), peta harta (`S.tmap`), peta besar `openMapNew` (zoom, ikon) |
| `systems/ranch.js` | Kandang Arka (`S.farm`, `STOCK`, `M.ranch` di data peta), benih (`SEEDS`), irigasi |
| `systems/fishing.js` | mancing: `FISH` (lokasi/jam/cuaca/legendaris), `tugGame` tarik-ulur, rekor ukuran, Buku Ikan `openFishLogNew`, akuarium (`FCAT.tank`) |
| `systems/season.js` | kalender & musim (`season()`, `dayName()`, 7 hari/musim), jam toko (`shopShut`, membungkus `buyMenu`/`upgradeMenu`), lapisan warna & partikel musim, `sleepToMorning` |
| `systems/polish.js` | tangkis, elemen (`ELEM`/`WEAK`, `curElem`), kunci target (`lockE`), kelangkaan `rarity()`, notifikasi `toastItem` (membungkus `addItem`), ukuran huruf, hemat baterai |
| `systems/home.js` | Rumah Arka (`S.home`, peta `home`): beli rumah, katalog `FCAT`, tata perabot bebas (`startCarry`/`carryKey`), peti `openBox`, perluasan |
| `systems/status.js` | efek status `STATUS` (racun/terbakar/dingin) pemain & musuh; sumber = `fx` di `ENEMY`/`PROJ` |
| `systems/travel.js` | teleport: `WARPS` (posisi patung per peta), aktif di `S.warps` |
| `systems/chapter4.js` | Bab 4 (investigasi tanpa boss), `storyTalk()` (dialog cerita yang menimpa dialog biasa), Desa Kincir, lentera & perahu Danau Cermin, kuil, prasasti (`readLore`) |
| `systems/chapter5.js` | Bab 5 (perjalanan & kota, tanpa boss): longsor Danau Cermin, `ch5Talk()`, arsip (`ARSIP`) |
| `world/maps/wild.js` | zona alam luas: Hutan Dalam (+ Reruntuhan Aurel, barat Hutan Lumina) & Jalur Sungai Senja (Hutan Lumina ↔ Rawa Senja) |
| `world/maps/city.js` | Jalan Raya Lama + Kota Lumina (4 area). NPC warga pakai `lines` (dialog acak, `cityLines`) |
| `data/lore.js` | jurnal: `LORE` (catatan), `MYSTERY` (misteri besar), `midGoal()` (penyelidikan), `learn(id)` |
| `systems/chapter3.js` | Bab 3: obor kuno, gerbang es, AI Naga Es (`updDragon`, ai `dboss`) |
| `systems/life.js` | interior, memancing, kebun, teka-teki batu, Mochi |
| `systems/story.js` | segel kuil, kristal, peti (termasuk peti terkunci) |
| `systems/daynight.js` · `achievements.js` | jam & malam · cek pencapaian |
| `ai/enemies.js` | AI musuh biasa (`updEnemy`, cabang per `ai`) |
| `ai/bosses.js` | AI boss, `startBoss()`, `bossDown()` |
| `npc/dialog.js` | `talkNpc()` (semua dialog per NPC), `npcHasQuest()` (tanda !), toko, bengkel, penginapan |
| `npc/npcs.js` | gerak dasar NPC, sapaan (`NPC_BARKS`), hewan |
| `npc/brain.js` | **rutinitas NPC** sesuai peran (`NPC_ROLE`, `WORK`, `STORY_NPC`): bekerja, berpatroli, duduk, mengobrol, pulang saat malam. Aturan: `docs/NPC_RULES.md` |
| `ui/widgets.js` | `say`, `talk`, `choose`, `ask`, `banner`, `popWorld`, HUD (`updHud`) |
| `ui/savecode.js` | ekspor/impor kode save (`saveCode()`, `readCode()`, `codeDialog()`) |
| `ui/shop.js` (juga `cookMenu`, `upgradeMenu`) · `bag.js` (tas & **jurnal** `openQuests`) · `map.js` · `menus.js` · `title.js` | layar toko/tempa, tas & buku misi, peta, menu utama/bestiari, judul |
| `main.js` | mulai Phaser |

Lainnya: `docs/GAME_DESIGN.md` (arah cerita & story bible), `docs/WORLD_DESIGN.md` (aturan dunia & wilayah), `docs/BENUA_LUMINA.md` (desain benua yang disetujui), `index.html` (urutan skrip), `styles.css` (gaya UI), `assets/img/*.png` (aset dari gambar referensi), `assets/reference/` (gambar asli), `docs/ART_BIBLE.md` (aturan gaya), `docs/sprites/` (lembar contoh), `tools/` (bundle, pemotong aset).

## Cara menambah sesuatu (file yang disentuh)

- **Monster:** `art/monsters.js` (peta piksel di `MON`) → `gfx/textures.js` (`addStrip` + animasi `<nama>_mv`) → `data/enemies.js` → taruh di `world/maps/<peta>.js` (`enemies`).
- **AI baru:** cabang `case` baru di `ai/enemies.js` (atau metode boss di `ai/bosses.js` + `case` di `updEnemy`).
- **Item:** `data/items.js` + ikon di `art/items.js` (`ICONS_DEF`). Dijual di `npc/dialog.js` (daftar `buyMenu`).
- **NPC/dialog:** `npcs` di file peta + `case '<id>'` di `talkNpc()` (`npc/dialog.js`). Karakter baru: palet di `CHARS` (`art/characters.js`).
- **Peta baru:** file baru di `world/maps/`, tambahkan `<script>` di `index.html` (setelah `world/ground.js`), hubungkan lewat `exits` di kedua peta. Navigasi misi (`routeNext`) otomatis mengikuti.
- **Misi utama:** `data/quests.js` (`STAGE_TXT`, `STAGE_GOAL`) + dialog yang menaikkan `S.stage`.
- **Metode scene baru:** taruh di file mixin yang sesuai (`Object.assign(World.prototype, { ... })`). Kalau perlu file baru, muat setelah `scene/world.js` di `index.html`.

## Aturan penting (sering bikin bug)

- **Objek baru:** buat fungsi `art<NamaObjek>()` (boleh pakai `mkC(w, h)`) lalu tambahkan entri di `OBJ`. Tekstur **didaftarkan otomatis** di `buildTextures` bila nama fungsinya cocok dengan `OBJ[..].key`. Item baru tanpa `ICONS_DEF` memakai ikon cadangan otomatis, tapi sebaiknya buat ikonnya.
- **Aset pemilik:** potret NPC `assets/img/npc_<ch>.png` (32×32, dari `assets/raw/extracted_pixel_assets/rpg_npcs`) otomatis menggantikan gambar kode untuk NPC dengan `ch` itu (`regPortrait`). Hewan `assets/img/ani_*.png` dipakai di `systems/ambient.js`. Aset buatan pemilik sendiri, aman dipakai.
- **Sebelum push:** jalankan CI (Actions → CI → Run workflow) atau `npm test` lokal. Game sempat tidak bisa dibuka karena ikon yang hilang.

- **Scene di-restart, bukan dibuat ulang.** `this.scene.restart()` memakai instance `World` yang sama. Properti per-peta (`this.boulder`, `this.garden`, `this.bossOn`, dll.) **harus di-reset di awal `create()`** (`scene/world.js`).
- **Kamera manual** di `camStep()` (event `postupdate`), dibulatkan ke piksel agar layar tidak bergetar. Jangan pakai `startFollow`.
- **Fisika** arcade `fixedStep: false` (mulus di layar 90/120 Hz).
- **Depth = y dasar sprite**, semua sprite `setOrigin(.5, 1)`.
- **Kunci input saat UI terbuka:** `G.lock++`/`G.lock--` berpasangan. `UIH` adalah handler input UI aktif. `talk()` sudah mengunci sendiri.
- **Bayangan objek** dipanggang ke tanah (`gfx/bake.js`). Objek baru di `OBJ` perlu properti `sh`.
- **Jangan menimpa fungsi dari file yang dimuat belakangan** (mis. `openMap`, `openFishLog` di `ui/`, yang dimuat setelah `systems/`): dalam mode strict, satu `ReferenceError` menghentikan sisa file. Buat fungsi baru (`openMapNew`) lalu jadikan fungsi lama pendelegasi.
- **`tone()` = audio, `toneC()` = warna.** Semua file berbagi scope global, jadi hindari nama fungsi ganda.
- **Save** di `localStorage` (`legenda_lumina_arpg_v2`). Field baru di `S` wajib diberi default di `newState()`.
- **Malam:** `RenderTexture` diisi alpha 1 lalu `setAlpha()`. Jangan pakai `fill(warna, alpha<1)` (tampilannya pudar saat ada `erase`).

## Penempatan objek & aset (WAJIB)

**Ikuti `docs/PLACEMENT_RULES.md`.** Setiap objek harus punya alasan logis berada di titiknya: tidak di tengah jalan, tidak menutup pintu atau jalan keluar, tidak bertumpuk, tidak di air, dan benda alam liar (api unggun, tulang, jamur) tidak ada di permukiman. **Sebelum push, `node tools/check-layout.js` harus "0 masalah"** (juga dijalankan oleh `npm run check`). Periksa hasil potongan gambar dengan mata sebelum dipakai.

## NPC & dialog (WAJIB)

**Ikuti `docs/NPC_RULES.md`:** tidak ada NPC yang hanya diam; setiap NPC punya peran dan rutinitas (`npc/brain.js`). Format dialog yang benar: `say('teks', 'Nama')`, `talk('Nama', [..])`, `choose({ head, items: [{ t }] })`. `popWorld` adalah fungsi global. Setiap `G.lock++` wajib dibuka lagi di `finally`. Untuk mengecek semua objek interaktif tidak membeku: `npm run sapu`.

## Arah desain & cerita

**Wajib mengikuti `docs/GAME_DESIGN.md`** untuk semua cerita, misi, bab, NPC, dan boss: tiga lapis tujuan (langsung, tengah, jangka panjang), misteri diungkap bertahap, tidak semua bab punya boss, dunia bereaksi terhadap tindakan pemain. Misteri utama dan peta pengungkapan per bab ada di bagian "Story bible". Jangan membocorkan rahasia besar lebih cepat dari jadwal di tabel itu. **Musuh terakhir & akhir cerita** ada di `docs/SPOILER_ENDING.md`: wajib dipatuhi, tapi **pemilik tidak ingin spoiler**, jadi jangan pernah membahas isinya dengan pemilik.

## Aturan dunia & wilayah

**Wajib mengikuti `docs/WORLD_DESIGN.md`** sebelum menambah wilayah, kota, desa, dungeon, atau lokasi apa pun. Fokus saat ini adalah **Benua Lumina**; benua lain hanya untuk lore dan foreshadowing. Setiap lokasi baru wajib lolos **World Design Review** (checklist di bagian 23). Jika banyak jawaban belum jelas, **usulkan desainnya ke pemilik dulu, jangan langsung diimplementasikan.** Rancangan benua **sudah disetujui** di `docs/BENUA_LUMINA.md`; implementasikan bertahap sesuai urutan bab di bagian 7. Ukuran peta mengikuti fungsi lokasinya (kota jauh lebih besar dari desa, alam boleh sangat luas dan dibagi beberapa zona), bukan ukuran seragam.

## Gaya visual

**Wajib mengikuti `docs/ART_BIBLE.md`:** cahaya dari kiri-atas, bayangan kebiruan, sorotan kekuningan, garis tepi berwarna (bukan hitam), palet cerah lembut, karakter chibi 20×26 px, skala aset referensi 0,62×. Aset baru dari gambar referensi dipotong dengan `tools/extract_assets.py` lalu disimpan ke `assets/img/` dan didaftarkan di `IMG_LIST` (`gfx/textures.js`).

## Tes & CI

- Tes Playwright di `tests/*.spec.js` (pembantu di `tests/helpers.js`). Workflow CI (`.github/workflows/ci.yml`) **hanya manual** (Actions → CI → Run workflow): menjalankan `npm run check`, cek `dist/` terbaru, lalu `npm test`. Laporan + screenshot ada di artefak `laporan-tes`.
- Setiap push ke `main`, `pages.yml` langsung men-deploy game ke GitHub Pages (tanpa tes).
- Lokal tanpa internet: `PHASER_LOCAL=/path/phaser.min.js npm test`.

## Status

**Tulis maksimal 1 baris per fitur.** Daftar lengkap fitur kecil ada di `docs/FITUR.md`.

- **Dunia:** Desa Lumina, Hutan Lumina (+ Hutan Dalam, Reruntuhan Aurel, Jalur Sungai Senja), Padang Angin (+ Desa Kincir), Gua Batu, Rawa Senja, Puncak Beku, Danau Cermin, Jalan Raya Lama, Kota Lumina (Gerbang, Pasar, Akademi, Kota Bawah) + 6 interior.
- **Cerita:** Bab 1–5 (stage 0–27; Bab 4 & 5 tanpa boss), jurnal 3 lapis tujuan + lore + misteri, foreshadowing sesuai `docs/SPOILER_ENDING.md`, 4 misi sampingan.
- **NPC:** semua NPC beraktivitas sesuai peran & pulang saat malam (`npc/brain.js`).
- **Sistem:** belajar 7 jurus dari 5 guru (penguasaan I–III), 4 gaya senjata, status, pancing, kebun, masak, upgrade, teleport, siang-malam & cuaca, suasana alam, puluhan objek interaktif (`systems/life.js`), penunjuk misi, simpan otomatis, ekspor/impor save, PWA, gamepad. Gelombang 1–7 (lihat `docs/PROGRES_FITUR.md`): 3 slot simpan, peta mini & kabut, kombo & musuh elit, musik dinamis, atribut & kerajinan, rahasia & peta harta, Rumah Arka.
- **Aset pemilik:** 21 potret NPC + hewan (`assets/img/npc_*`, `ani_*`), dekorasi Pixel 16. Gambar salah potong ada di `assets/raw/salah-potong/` (jangan dipakai).

**Fitur 1–1000:** dikerjakan per gelombang, progres di `docs/PROGRES_FITUR.md` (wajib diperbarui tiap gelombang).

**Berikutnya:** Bab 6 (Lembah Besi & Simpang Rantau, `docs/BENUA_LUMINA.md` bag. 7), perluas Desa Lumina, Balai Dewan & Pelabuhan Danau, sprite Arka 4 arah dari pemilik.

Catatan tes: fungsi di `h.G(page, fn)` jangan mengembalikan objek Phaser (misal hasil `setPosition`), karena serialisasinya bisa macet; bungkus dengan `{ }`. Tes memblokir service worker (`playwright.config.js`).

Setelah menyelesaikan fitur, **perbarui bagian Status ini**.
