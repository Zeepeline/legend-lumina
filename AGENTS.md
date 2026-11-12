# AGENTS.md — Legenda Lumina (baca ini dulu, file lain hanya sesuai tugas)

Pemilik berbahasa Indonesia: balas & tulis teks game dalam **Bahasa Indonesia**. **Jangan pernah membahas isi `docs/SPOILER_ENDING.md` dengan pemilik.**
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
| Lanjutan dunia terbuka (open world) | `docs/HANDOFF_OPENWORLD.md` |
| Menaruh objek/dekorasi/peta | `docs/PLACEMENT_RULES.md` |
| NPC, dialog, rutinitas | `docs/NPC_RULES.md` |
| Cerita, misi, bab, boss | `docs/GAME_DESIGN.md` (+ `SPOILER_ENDING.md`, rahasia) |
| Wilayah/kota/dungeon baru | `docs/WORLD_DESIGN.md` (checklist bag. 23) + `docs/BENUA_LUMINA.md` |
| Gambar/aset/animasi | `docs/ART_BIBLE.md`, `ASSET_RULES.md`, `VALIDATION_RULES.md`, `ANIMATION_RULES.md` |
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
- Objek baru: `artNama()` + entri `OBJ` (+ `sh` bayangan) + perilaku di `world/spawn/`. Aset GPT pemilik wajib lolos `VALIDATION_RULES` (siapkan via `tools/prep_gpt_assets.py`); jangan pakai `assets/raw/salah-potong/`.
- Malam: `RenderTexture` alpha 1 lalu `setAlpha()`, bukan `fill(warna, alpha<1)`.
- Edit lewat sed/skrip: jangan sisipkan `//` di tengah pernyataan satu baris, pakai `/* */`.

## Status (maks 1 baris per fitur)
- **Dunia:** Desa Lumina, Hutan Lumina (+ Hutan Dalam, Reruntuhan Aurel, Jalur Sungai Senja), Padang Angin (+ Desa Kincir), Gua Batu, Rawa Senja, Puncak Beku, Danau Cermin, Jalan Raya Lama, Kota Lumina (4 area) + interior.
- **Cerita:** Bab 1–5 (stage 0–27), jurnal 3 lapis tujuan, lore & misteri, 4 misi sampingan.
- **Sistem:** 7 jurus/5 guru, 4 gaya senjata, status, pancing, kebun, masak, tempa, teleport, siang-malam & cuaca & musim, Rumah Arka, kandang, ekonomi, 3 slot simpan, PWA, gamepad. Fitur 1–1000 (gelombang) selesai, arsip di `docs/arsip/`.
- **Dunia terbuka:** posisi global + peralihan + streaming tanah + wilayah pasif & handoff + kamera lintas wilayah (v1.27.x). Lanjutan: `docs/HANDOFF_OPENWORLD.md`.
- **Berikutnya:** selesaikan dunia terbuka (handoff) → gerak (stamina, panjat, glider) → Bab 6 (`BENUA_LUMINA.md` bag. 7).
