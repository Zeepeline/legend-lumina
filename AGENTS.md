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
| `art/nature.js` · `buildings.js` · `characters.js` · `monsters.js` · `items.js` · `fx.js` · `interior.js` | pixel art buatan kode, per jenis |
| `world/objects.js` | `OBJ`: tekstur, kotak tabrakan, bayangan, pudar, cerobong tiap objek dunia |
| `world/maps/*.js` | satu file per peta: jalan, objek, NPC, musuh, boss, peti, pintu keluar |
| `world/ground.js` | generator tanah, tabrakan grid (gua/kolam), penyebar pohon |
| `gfx/textures.js` | `IMG_LIST` (PNG di `assets/img`), `buildTextures()`: daftar semua tekstur & animasi |
| `gfx/bake.js` | bayangan objek dipanggang ke tekstur tanah |
| `scene/world.js` | scene Phaser `World`: `create()` (bangun peta), `update()`, `camStep()` (kamera), `actionA()`, `checkZones()` |
| `systems/combat.js` | `WEAPON_STYLE` (pedang/tombak/kapak/busur, dipilih lewat `ITEMS[..].wt`), serang, sihir, damage, `hitStop()`, drop, EXP, proyektil, kalah |
| `systems/skills.js` | dash, tebasan putar, nova es |
| `systems/status.js` | efek status `STATUS` (racun/terbakar/dingin) pemain & musuh; sumber = `fx` di `ENEMY`/`PROJ` |
| `systems/travel.js` | teleport: `WARPS` (posisi patung per peta), aktif di `S.warps` |
| `systems/chapter3.js` | Bab 3: obor kuno, gerbang es, AI Naga Es (`updDragon`, ai `dboss`) |
| `systems/life.js` | interior, memancing, kebun, teka-teki batu, Mochi |
| `systems/story.js` | segel kuil, kristal, peti (termasuk peti terkunci) |
| `systems/daynight.js` · `achievements.js` | jam & malam · cek pencapaian |
| `ai/enemies.js` | AI musuh biasa (`updEnemy`, cabang per `ai`) |
| `ai/bosses.js` | AI boss, `startBoss()`, `bossDown()` |
| `npc/dialog.js` | `talkNpc()` (semua dialog per NPC), `npcHasQuest()` (tanda !), toko, bengkel, penginapan |
| `npc/npcs.js` | gerak NPC & hewan |
| `ui/widgets.js` | `say`, `talk`, `choose`, `ask`, `banner`, `popWorld`, HUD (`updHud`) |
| `ui/savecode.js` | ekspor/impor kode save (`saveCode()`, `readCode()`, `codeDialog()`) |
| `ui/shop.js` (juga `cookMenu`, `upgradeMenu`) · `bag.js` · `map.js` · `menus.js` · `title.js` | layar toko/tempa, tas & buku misi, peta, menu utama/bestiari, judul |
| `main.js` | mulai Phaser |

Lainnya: `index.html` (urutan skrip), `styles.css` (gaya UI), `assets/img/*.png` (aset dari gambar referensi), `assets/reference/` (gambar asli), `docs/ART_BIBLE.md` (aturan gaya), `docs/sprites/` (lembar contoh), `tools/` (bundle, pemotong aset).

## Cara menambah sesuatu (file yang disentuh)

- **Monster:** `art/monsters.js` (peta piksel di `MON`) → `gfx/textures.js` (`addStrip` + animasi `<nama>_mv`) → `data/enemies.js` → taruh di `world/maps/<peta>.js` (`enemies`).
- **AI baru:** cabang `case` baru di `ai/enemies.js` (atau metode boss di `ai/bosses.js` + `case` di `updEnemy`).
- **Item:** `data/items.js` + ikon di `art/items.js` (`ICONS_DEF`). Dijual di `npc/dialog.js` (daftar `buyMenu`).
- **NPC/dialog:** `npcs` di file peta + `case '<id>'` di `talkNpc()` (`npc/dialog.js`). Karakter baru: palet di `CHARS` (`art/characters.js`).
- **Peta baru:** file baru di `world/maps/`, tambahkan `<script>` di `index.html` (setelah `world/ground.js`), hubungkan lewat `exits` di kedua peta. Navigasi misi (`routeNext`) otomatis mengikuti.
- **Misi utama:** `data/quests.js` (`STAGE_TXT`, `STAGE_GOAL`) + dialog yang menaikkan `S.stage`.
- **Metode scene baru:** taruh di file mixin yang sesuai (`Object.assign(World.prototype, { ... })`). Kalau perlu file baru, muat setelah `scene/world.js` di `index.html`.

## Aturan penting (sering bikin bug)

- **Scene di-restart, bukan dibuat ulang.** `this.scene.restart()` memakai instance `World` yang sama. Properti per-peta (`this.boulder`, `this.garden`, `this.bossOn`, dll.) **harus di-reset di awal `create()`** (`scene/world.js`).
- **Kamera manual** di `camStep()` (event `postupdate`), dibulatkan ke piksel agar layar tidak bergetar. Jangan pakai `startFollow`.
- **Fisika** arcade `fixedStep: false` (mulus di layar 90/120 Hz).
- **Depth = y dasar sprite**, semua sprite `setOrigin(.5, 1)`.
- **Kunci input saat UI terbuka:** `G.lock++`/`G.lock--` berpasangan. `UIH` adalah handler input UI aktif. `talk()` sudah mengunci sendiri.
- **Bayangan objek** dipanggang ke tanah (`gfx/bake.js`). Objek baru di `OBJ` perlu properti `sh`.
- **`tone()` = audio, `toneC()` = warna.** Semua file berbagi scope global, jadi hindari nama fungsi ganda.
- **Save** di `localStorage` (`legenda_lumina_arpg_v2`). Field baru di `S` wajib diberi default di `newState()`.
- **Malam:** `RenderTexture` diisi alpha 1 lalu `setAlpha()`. Jangan pakai `fill(warna, alpha<1)` (tampilannya pudar saat ada `erase`).

## Arah desain & cerita

**Wajib mengikuti `docs/GAME_DESIGN.md`** untuk semua cerita, misi, bab, NPC, dan boss: tiga lapis tujuan (langsung, tengah, jangka panjang), misteri diungkap bertahap, tidak semua bab punya boss, dunia bereaksi terhadap tindakan pemain. Misteri utama dan peta pengungkapan per bab ada di bagian "Story bible". Jangan membocorkan rahasia besar lebih cepat dari jadwal di tabel itu.

## Gaya visual

**Wajib mengikuti `docs/ART_BIBLE.md`:** cahaya dari kiri-atas, bayangan kebiruan, sorotan kekuningan, garis tepi berwarna (bukan hitam), palet cerah lembut, karakter chibi 20×26 px, skala aset referensi 0,62×. Aset baru dari gambar referensi dipotong dengan `tools/extract_assets.py` lalu disimpan ke `assets/img/` dan didaftarkan di `IMG_LIST` (`gfx/textures.js`).

## Tes & CI

- Tes Playwright di `tests/*.spec.js` (pembantu di `tests/helpers.js`). Workflow CI (`.github/workflows/ci.yml`) **hanya manual** (Actions → CI → Run workflow): menjalankan `npm run check`, cek `dist/` terbaru, lalu `npm test`. Laporan + screenshot ada di artefak `laporan-tes`.
- Setiap push ke `main`, `pages.yml` langsung men-deploy game ke GitHub Pages (tanpa tes).
- Lokal tanpa internet: `PHASER_LOCAL=/path/phaser.min.js npm test`.

## Status

Sudah ada: 6 wilayah (+ Puncak Beku) + 3 interior, 30 jenis musuh, 8 boss/mini-boss, misi bab 1–3 (stage 0–14), 3 misi sampingan, tas/perlengkapan/tempa/toko, 4 gaya senjata, jurus (dash, tebasan putar, nova es), efek status + Penawar, siang-malam, cuaca, pancing, kebun, teka-teki (batu & obor), bestiari, pencapaian, peta, hit-stop + getar, menu pengaturan, teleport 6 patung, ekspor/impor kode save, upgrade +1..+5 di bengkel, masak 5 resep dengan bonus sementara, PWA (`manifest.webmanifest`, `sw.js`; naikkan `VERSI` di `sw.js` saat rilis besar).

Belum (sesuai `docs/GAME_DESIGN.md`): jurnal 3 lapis tujuan & petunjuk, sistem hubungan NPC, foreshadowing misteri utama di Bab 1–3, Bab 4 (investigasi tanpa boss). Lainnya: sprite karakter bergaya gambar referensi (menunggu lembar sprite dari pemilik), gamepad, bab 4.

Setelah menyelesaikan fitur, **perbarui bagian Status ini**.
