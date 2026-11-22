# AGENTS.md — Legenda Lumina (baca ini dulu, file lain hanya sesuai tugas)

Pemilik berbahasa Indonesia: balas & tulis teks game dalam **Bahasa Indonesia**. **Jangan pernah membahas isi `docs/SPOILER_ENDING.md` dengan pemilik.**
**Aturan gambar referensi pemilik:** bila pemilik memberi gambar (ruangan, peta, aset, UI), hasil di game WAJIB identik dengan gambar itu — rasio, bentuk, ukuran relatif, susunan & kepadatan sama persis. Pakai gambarnya langsung (potong/skala bulat) bila bisa; jangan "menafsirkan ulang" atau melonggarkan tata letak.
Proyek: action RPG top-down untuk browser/HP, **Phaser 3.80.1**, skrip klasik global tanpa bundler (urutan muat = `index.html`). Live: https://zeepeline.github.io/legend-lumina/ (setiap push ke `main` langsung deploy).

## Hemat konteks (WAJIB)
1. **Cari dulu, baru baca.** Fungsi/const → `grep -n "nama" docs/CODEMAP.md` (file:baris). Dokumen → `docs/INDEX.md` (judul bagian + baris). Lalu baca potongan itu saja (offset/limit ±60 baris).
2. **Jangan membuka:** `dist/`, `assets/`, `node_modules/`, `test-results/`, `docs/arsip/`, file data besar secara utuh (`data/*.js` → grep kuncinya).
3. **Baca dokumen hanya sesuai tugas** (tabel di bawah). Jangan membaca semua dokumen "untuk berjaga-jaga".
4. **Output perintah dipangkas:** tes `--reporter=line` lalu `grep -E "passed|failed|Error"`; log panjang ke file `/tmp/*.txt` lalu grep. Full suite (>10 menit) jalankan di latar belakang.
5. **Satu sesi = satu tugas.** Di akhir sesi perbarui catatan serah-terima (`docs/HANDOFF_*.md`: status, file disentuh, langkah berikut) agar sesi berikutnya tidak menelusuri ulang.

## Dokumen per jenis tugas
| Tugas | Wajib baca (bagian relevan saja) |
|---|---|
| Menulis/mengubah kode apa pun | `docs/CODE_RULES.md` |
| Tugas kecil siap ambil (agen konteks terbatas) | `docs/TASKS_AGENT.md` — ambil SATU tugas teratas |
| Lanjutan dunia terbuka (open world) | `docs/HANDOFF_OPENWORLD.md` |
| Menaruh objek/dekorasi/peta | `docs/PLACEMENT_RULES.md` (+ `docs/GEOGRAFI.md` untuk sungai, kota, penanda) |
| NPC, dialog, rutinitas | `docs/NPC_RULES.md` |
| Cerita, misi, bab, boss | `docs/GAME_DESIGN.md` (+ `SPOILER_ENDING.md`, rahasia) |
| Wilayah/kota/dungeon baru | `docs/WORLD_DESIGN.md` (checklist bag. 23) + `docs/BENUA_LUMINA.md` + `docs/DUNIA_FANTASI.md` |
| Gambar/aset/animasi/VFX tempur | `docs/TASKS_GPT_ASET.md` (gaya Senja Emas), `docs/ART_BIBLE.md`, `ASSET_RULES.md`, `VALIDATION_RULES.md`, `ANIMATION_RULES.md`, `COMBAT_VFX_RULES.md` |
| Cek apakah fitur lama sudah ada | `grep -n "kata" docs/arsip/*.md` |

## Menjalankan & cek
- Lokal: `python3 -m http.server 8000` → `http://localhost:8000`. Satu file: `python3 tools/bundle.py` → `dist/game.html`.
- Konsol: `__game.S` (status), `__game.sc` (scene aktif), `__game.press('a')`, `__game.sc.goto('swamp', 640, 60, 'down')`.
- **Sebelum push:** `npm run check` (sintaks, ukuran ≤400 baris/≤160 kolom, tata letak 0 masalah, CODEMAP & INDEX diperbarui) + tes terkait.
- Tes: `PHASER_LOCAL=/path/phaser.min.js npx playwright test tests/<x>.spec.js`. Helper (`tests/helpers.js`): `boot`, `newGame`, `loadGame`, `goto`, `press`, `flush`, `G`, `hold`, `faceNpc`, `talkTo`, `learnAll`, `noErrors`. Tes memblokir service worker.
- Rilis: naikkan `lumina-vNN` di `sw.js` & `GAME_VERSION`, `python3 tools/bundle.py`, `npm run check`, commit, `git fetch origin main && git rebase FETCH_HEAD && git push`.

## Peta folder `src/` (rincian per fungsi: `docs/CODEMAP.md`)
`core/` util, audio, input, state & simpan (`S`, `OPT`) · `data/` tabel item/musuh/misi/lore · `art/` pixel art kode (`artNama()`) · `world/` peta (`maps/`), `objects.js` (`OBJ`), `spawn/` (`OBJ_SPAWN[tipe]` perilaku objek), `layout.js` (`WORLD_POS`, `NEIGH`) · `gfx/` tekstur & aset GPT · `scene/world.js` inti scene (jangan tambah fitur di sini) · `systems/` fitur sebagai mixin (`life/` objek interaktif, `economy/`, `regions.js`, `stream.js`, `openworld.js`, …) · `ai/` musuh & boss · `npc/` dialog & rutinitas · `ui/` menu DOM · `main.js`.

## Jebakan yang pernah bikin bug
- Global `const/let` (`S`, `ITEMS`, `World`) **tidak** ada di `window`; di tes tulis `S`, bukan `window.S`.
- Jangan menimpa fungsi dari file yang dimuat **belakangan** (`openMap`, `openFishLog`); buat fungsi baru (`openMapNew`) + delegasi. Satu `ReferenceError` menghentikan sisa file.
- TDZ: jangan pakai variabel sebelum `const`-nya. `tone()` = audio, `toneC()` = warna; hindari nama global ganda (cek CODEMAP).
- Banyak scene `World` jalan bersamaan (wilayah pasif): di `create()` pakai `this.pl0`, efek layar di `makeActiveFx`, wilayah aktif = `G.scene`.
- Scene di-**restart** (instance sama): reset properti per peta di awal `create()`.
- Kamera manual di `camStep()` (dibulatkan piksel, batas `camB`); jangan `startFollow`, jangan `setBounds(0,0,M.w,M.h)` untuk wilayah luar ruang.
- Depth = y dasar sprite, `setOrigin(.5, 1)`. Fisika `fixedStep: false`. Tembok = `Zone` di luar display list.
- `G.lock++` selalu dipasangkan `G.lock--` di `finally`; `talk()` sudah mengunci sendiri. Format dialog: `say(teks, nama)`, `talk(nama, [..])`, `choose({ head, items })`.
- Field baru di `S` wajib punya default di `newState()`. Save: `localStorage` `legenda_lumina_arpg_v2`.
- Tanah per chunk (`stream.js`): `genGround` harus murni fungsi posisi; jangan pakai tekstur `gs_<peta>` untuk luar ruang.
- Objek baru: `artNama()` + entri `OBJ` (+ `sh` bayangan) + perilaku di `world/spawn/`. Aset GPT pemilik wajib lolos `VALIDATION_RULES`.
- Malam: `RenderTexture` alpha 1 lalu `setAlpha()`, bukan `fill(warna, alpha<1)`.
- Edit lewat sed/skrip: jangan sisipkan `//` di tengah pernyataan satu baris, pakai `/* */`.

## Status (maks 1 baris per fitur)
- **Dunia:** Desa Lumina, Hutan Lumina (+ Hutan Dalam, Reruntuhan Aurel, Jalur Sungai Senja), Padang Angin (+ Desa Kincir), Gua Batu, Rawa Senja, Puncak Beku, Danau Cermin, Jalan Raya Lama, Kota Lumina (4 area) + interior.
- **Cerita:** Bab 1–5 (stage 0–27), jurnal 3 lapis tujuan, lore & misteri, 4 misi sampingan.
- **Sistem:** 7 jurus/5 guru, 4 gaya senjata, status, pancing, kebun, masak, tempa, teleport, siang-malam & cuaca & musim, Rumah Arka, kandang, ekonomi, 3 slot simpan, PWA, gamepad. Fitur 1–1000 (gelombang) selesai, arsip di `docs/arsip/`.
- **Dunia terbuka:** posisi global + peralihan + streaming tanah + wilayah pasif & handoff + kamera lintas wilayah (v1.27.x). Lanjutan: `docs/HANDOFF_OPENWORLD.md`.
- **Souls-lite (arah Dimraeth):** stamina serang/berguling, Botol Cahaya, Jejak Cahaya saat kalah (`systems/souls.js`, v1.30.0). Roadmap pilar: `docs/GAME_DESIGN.md` bagian akhir.
- **Sprite monster GPT:** 30 monster dari lembar pemilik dibersihkan (`assets/img/monsters/mon_*.png`, dipasang `gfx/gptmonsters.js`); 8 musuh khusus/boss kini punya sprite sendiri (`g_<id>`). Humanoid (goblin, tengkorak, Morgath, mimic) belum.
- **Pemburu Liar (antagonis cerita):** sheet kode `slaver` (34px) & `slaver_captain` (46px, kapak dua tangan; AI `elite_brute`) via `tools/gen_slaver_sheets.py` → `esh_*`; data di `ENEMY`, belum ada di peta (spawn: `__game.sc.spawnEnemy('slaver', x, y)`).
- **Desain dunia organik (v1.35.0):** jalan tanah berliku otomatis, lapangan/tepi hutan/pohon alami, sungai menyambung (`world/organic.js`, `world/water.js`). Aturan: `docs/WORLD_REFACTOR.md` §7.
- **Patokan gaya aset (v1.38.0):** pohon `treeA`/`treeAd`/`treeSn` + set Verdant. `round`, semak neon (`bushG1/G2`, `bushy`), `stump` dialihkan, pinus diwarnai ulang (`gfx/style_unify.js`). Aset baru WAJIB senada treeA.
- **Layar & suasana (v1.39.0):** bawaan layar penuh mendatar + kontrol transparan (`body.full`, `LAYOUT_FULL`/`VW` dinamis di `core/util.js`); cuaca kabut & cahaya malam (`systems/atmos.js`); musik lewat WebAudio + suara hujan (`core/audio.js`); kesulitan di `DIFF` (`core/state.js`).
- **Interior gambar (v1.42.0):** rumah Arka/penginapan/tetua/Lina = gambar ruangan pemilik apa adanya (`world/interior_layouts.js` `INT_ROOMS`, zoom kamera 2, tembok persegi per perabot). Lembar sprite di `world/interior_sheet.js`.
- **Sprite Arka lengkap (v1.43.0):** 39 animasi 4 frame dari 6 lembar ChatGPT (`assets/img/hero/hero_arka.png`); pemutar `gfx/hero_arka.js` (diam, jalan, kombo 1-2-3, berat, guling, kena pukul, kalah, sihir, busur). Pose `fish_pull`/`pick`/`hoe`/`sleep` dipasang via `pl._emote` (juice.js, fishing.js, systems/arka_anims.js). Prompt: `docs/PROMPT_ARKA.md`.
- **Lembar musuh baru (v1.44.0):** `assets/img/monsters/esh_<id>.png`; daftar & varian di `ESH` (`gfx/enemy_sheets.js`), animasi dipilih dari `e.st`. Selesai: golem (+golemi, golemk), ghost. Prompt: `docs/PROMPT_MUSUH.md`.
- **Juice partikel & animasi (v1.45.0):** `systems/juice.js` — `jx(nama,x,y,n,opsi)` 4 pemancar bersama (spark/chip/mote/star); percikan & serpihan kena pukul, butiran saat mati/ancang-ancang, ekor proyektil, bayangan guling, naik level (sorak), pulih, memancing, bangkit. Pose khusus Arka lewat `pl._emote`. v1.46.0 ala Dimraeth: zona bahaya di tanah (`jxTele`), aura status (`jxAura`), kawah hantaman, nisan Jejak Cahaya; `sparkle()` kini memakai pemancar bersama.
- **Rona warna keemasan (v1.47.0):** `systems/grade.js` — ColorMatrix + vinyet di kamera World & scene tanah `GL` (acuan screenshot Dimraeth pemilik); mati di dalam ruangan/gua/salju/`OPT.lite`; `OPT.grade = false` mematikan.
- **Aset gaya "Senja Emas" (rencana):** 376 tugas ChatGPT di `docs/TASKS_GPT_ASET.md` (bagian N = hutan alami) (tanah, tumbuhan, bangunan, NPC, musuh, VFX, UI, ikon); hasil ke `assets/raw/gpt2/`. Setelah tanah + vegetasi masuk, gaya ini menggantikan patokan treeA.
- **Pedang digambar per frame (v1.51):** `tools/gen_sword_layer.py` → `assets/img/hero/hero_swl{0,1}.png` (sel 80×96, nama frame = nama frame tubuh; pedang + kepalan sudah di tangan). `systems/sword_bake.js` menampilkan lapisan ini saat tebasan biasa (`atk*`) dan siaga (frame diam/jalan), lalu pedang tempelan terbang ke punggung. Jurus/tombak/kapak/busur tetap pedang tempelan lama. Ubah sudut/titik tangan di skrip Python lalu jalankan ulang (`venv/bin/python tools/gen_sword_layer.py tools/sword_src`).
- **Serangan Arka (v1.50):** pedang digenggam di kepalan per frame (`systems/sword_hand.js`: tabel `HERO_HAND`; aset baru `art/sword_art.js`: pedang 22×6 berpivot di tengah gagang + `fist_grip` di atasnya; pedang di punggung saat diam), ayunan ancang→sapu→pantul (`sword_swing.js`), lalu siaga ±1,8 dtk memegang pedang sebelum disarungkan (`swordRest`/`swordCarry`), ritme frame tak rata (`hero_arka.js`), damage pedang tertunda 55 ms (`WEAPON_STYLE`), jejak tebasan menunggu bilah bergerak; baris `hero_slave.png` yang salinan biru diwarnai ulang (`tools/fix_slave_rows.py`).
- **Animasi NPC (v1.51):** pose prosedural dari potret sendiri (`gfx/npc_rig.js`) + aksi `npcAct(o,'mourn|die|panic|cheer|captive|offer|...')`, `npcEmote`, lembar Mila asli (`mila_sheet.png`); API & contoh: `docs/NPC_ANIM.md`.
- **Rumput satu sumber (v1.52.0):** `src/world/grass.js` `GRASS` (base/light/dark = petak di `assets/img/ground/`). Semua tanah lewat `grassPass`: gambar utuh `gnd_<peta>_custom`, tanah prosedural (`verdantTiles` memakai `GRASS.base`), gradasi perbatasan, lantai hutan pengisi (`wilds.js`). **Ganti rumput = ubah `GRASS` atau ganti PNG-nya saja**; jangan sunting `gnd_*_custom`/`GROUND` untuk rumput. Pengecualian: `GRASS.skip` (gua, ruangan).
- **Tepi rumput berpetak (v1.53.0):** `src/world/grass_edge.js` — autotile 47 bentuk dari `assets/img/ground/gnd_edge_sprout.png` (Sprout Lands, 16 px) + tanah `DIRT_S`, pasir `SAND_S`, air `WATER_S` (+ kilau `gnd_water_sprout.png`) gaya Sprout Lands. Lapis petak bawah→atas: air (dangkal/sedang/dalam), pita pasir `GRASS_EDGE.sand` kotak, tanah, rumput; semua dari kelas piksel `gnd_<peta>_custom`. Aktif untuk SEMUA wilayah luar (`GRASS_EDGE.maps`); palet air & pita khas per peta di `EDGE_PAL` (rawa = lumpur keruh, salju = es & tepi salju). Kota (k*) memakai gambar hasil `node tools/bake_ground.js <id>` — jalankan ulang bila jalan/kolam kota diubah. Kelas piksel dibaca di ½ resolusi (`GRASS_EDGE.q`).
- **Bersih-bersih (v1.55.0):** folder sumber (`assets/raw`, `assets/aseprite`, `enemy_image`, `tiled`), unduhan asli, kode isometrik & skrip alat yang bahannya ikut terhapus sudah dibuang — ambil dari riwayat git (sebelum v1.55.0) bila perlu membuat ulang sprite. Tekstur `verdant_*` (gambar GPT-nya tak pernah ada; dulu kanvas kosong = objek tak terlihat tapi menghalangi) kini memakai gambar Sprout (`SPROUT_ALIAS`), kecuali tebing `verdant_cliff_*` (masih kosong).
- **Hiasan & air hidup Sprout (v1.54.0):** `systems/sprout_deco.js` — objek `sp*` dari `deco_sprout_objs.png` (2×), disebar per kotak autotile (`SPROUT_DECO` peluang per kotak rumput/tanah/pasir/air) + semak/batu/tunggul lama di peta itu memakai gambar Sprout (`SPROUT_DECO.swap`, jenis tetap). `systems/water_fx.js` — riak & kilau (`WATER_FX` jumlah/detik); `systems/shore_waves.js` — ombak pantai naik-surut di tepi pasir mengikuti bentuk petak (`SHORE` jangkauan/periode). Keduanya mati saat `OPT.lite`.
- **Kota gaya Sprout (v1.57.0):** jalan kota k* = paving batu berpetak (`EDGE_PAL[k*].road = 'cobble'`, pola `cobbleTile()` di grass_edge.js; paving abu-abu lama ikut jadi jalan). `systems/city_style.js` mewarnai ulang kastil, properti kota & semua bangunan desa/kota GPT ke palet Sprout (`CITY_STYLE.keys`, gambar asli tidak diubah).
- **Pohon Sprout (v1.58.0):** `systems/sprout_trees.js` — pohon biasa di wilayah luar = pohon Sprout 3× (`SPROUT_TREES.map` jenis → bentuk big/tall + varian d/sn/sw) dengan goyang angin kode 8 frame; redwood = pohon raksasa digambar kode (`sproutGiantSrc`); apel tidak diganti.
- **Berikutnya:** konten ekspansi Bab 6 (`BENUA_LUMINA.md` bag. 7) & eksplorasi teka-teki kuil kuno.
- **Sprite humanoid via kode:** tengkorak, kepala/raja goblin, Morgath, mimic = atlas `esh_<id>.png` dari `tools/gen_humanoid_sheets.py` (rig piksel, 4×6; goblin & dukun juga dihasilkan tetapi tetap memakai sprite GPT).
