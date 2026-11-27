# AGENTS.md — Legenda Lumina (Godot 4.7.2)

Pemilik berbahasa Indonesia: balas & tulis semua teks game dalam **Bahasa Indonesia** (`godot/localization/lumina.csv`).
**Jangan pernah membahas isi `docs/SPOILER_ENDING.md` dengan pemilik.**
**Aturan gambar referensi pemilik:** bila pemilik memberi gambar (ruangan, peta, aset, UI), hasil di game WAJIB identik dengan gambar itu — rasio, bentuk, ukuran relatif, susunan, dan kepadatan sama persis.

Proyek kini berjalan sepenuhnya di **Godot 4.7.2** (`godot/project.godot`, renderer `GL Compatibility`, resolusi dasar `480×270`, jendela `1280×720`, filter teksture Nearest + pixel snap) menargetkan **PC/Mac dan Android**.

## Aturan Teknis Wajib Godot 4.7.2
1. **Referensi Autoload lewat `*.ref`:** Gunakan `EventsBus.ref`, `GameStateStore.ref`, `AudioService.ref`, `SaveService.ref`, `SceneService.ref` — JANGAN memakai nama autoload telanjang (`Events`, `GameState`, dll.) agar pemeriksaan `--check-only --script` selalu lolos.
2. **Static Typing 100%:** Wajib deklarasikan tipe eksplisit (`: Type` atau `:=`), jangan pernah menulis `var x = ...` tanpa tipe.
3. **Tanpa `print(` mentah:** Gunakan `print_rich(...)` atau `print_verbose(...)`.
4. **Muat resource aman:** Gunakan `preload(...)` untuk aset statis atau helper `ResourceLoader.load(path_var)`; hindari literal `load("res://...png/tscn")` di runtime.
5. **Registrasi `class_name` sebelum tool CLI:** Setiap menambah skrip dengan `class_name`, jalankan `--headless --path godot --import --quit` lebih dulu sebelum mengeksekusi skrip tool/tes.
6. **Audio di Headless:** Saat `AudioServer.get_driver_name() == "Dummy"`, hindari `.play()` pada `AudioStreamPlayer` agar tidak menimbulkan *playback leak* saat proses headless keluar.

## Peta Struktur `godot/`
- `godot/autoload/` — Singleton inti (`events.gd`, `game_state.gd`, `audio_manager.gd`, `save_manager.gd` v4, `scene_manager.gd`).
- `godot/core/` — Logika murni (`combat_math.gd`, `inventory_logic.gd`, `craft_logic.gd`, `item_database.gd`, `skill_database.gd`, `quest_database.gd`, `state_machine/`).
- `godot/resources/` & `godot/data/` — Tipe `Resource` & data `.tres` (`weapons/`, `armors/`, `items/`, `enemies/`, `dialogues/`).
- `godot/systems/` — Pemain (`player/`), AI musuh (`enemies/`), tempur (`combat/`), NPC & guru (`npc/`), dialog (`dialogue/`), dunia & interaksi (`world/`).
- `godot/ui/` — HUD, kontrol sentuh, tas/perlengkapan, toko, peta benua, jurnal/jurus/kerajinan, menu jeda.
- `godot/tools/` — Generator dunia (`build_world_assets.gd`, `map_builder_helper.gd`, `build_wild_maps.gd`, `build_city_maps.gd`) berbagi `TileSet` `maps/tilesets/sprout_overworld.tres`.
- `godot/assets/` — Aset PNG terpakai (`art/`), audio BGM MP3 & SFX OGG/WAV (`audio/`), ikon (`icons/`).

## Menjalankan & Verifikasi
- Validasi penuh: `GODOT_BIN=/Applications/Godot.app/Contents/MacOS/Godot bash ~/.gemini/config/skills/godot-jrpg-dev/scripts/validate_project.sh godot`
- Suite tes otomatis (8 bagian): `/Applications/Godot.app/Contents/MacOS/Godot --headless --path godot --script res://tests/run_tests.gd`
- Regenerasi seluruh 24 peta & interior: `/Applications/Godot.app/Contents/MacOS/Godot --headless --path godot --script res://tools/build_world_assets.gd`

## Dokumen Referensi `docs/`
- Desain game & pilar tempur: `docs/GAME_DESIGN.md` (`docs/SPOILER_ENDING.md` **rahasia**, jangan dibahas)
- Dunia, wilayah, & geografi: `docs/BENUA_LUMINA.md`, `docs/DUNIA_FANTASI.md`, `docs/GEOGRAFI.md`, `docs/PLACEMENT_RULES.md`
- Gaya visual, NPC, & cerita: `docs/ART_BIBLE.md`, `docs/NPC_ROSTER.md`, `docs/STORY_JOURNAL.md`

## Status Proyek Saat Ini
- **24 Peta & Interior:** Desa Lumina, Arena Latihan, Hutan Lumina, Hutan Dalam, Jalur Sungai Senja, Padang Angin, Gua Batu, Rawa Senja, Puncak Beku, Danau Cermin, Jalan Raya Lama, 5 distrik Kota Lumina (`kgate`, `kpasar`, `kpermukiman`, `kakademi`, `kbawah`), serta 8 interior/gelanggang (`home`, `inn`, `elderhome`, `linahome`, `temple`, `kinn`, `arsip`, `arena`).
- **Gameplay & Konten:** 24 musuh + bos 2 fase, 6 senjata, 4 zirah, 12 item, 38 dialog, 5 jurus sihir + guru, 9 misi & 6 pencapaian, 9 resep kerajinan/tempa, spot memancing, toko, peti, satwa liar, siang-malam & cahaya gua, BGM/SFX asli, save v4 (migrasi v1–v3), serta `export_presets.cfg` untuk Android & macOS.
- **Tanah benua menyambung (2026-11-27):** semua wilayah luar memakai tanah gaya Sprout KOTAK-KOTAK yang sama (kota = paving batu); `python3 tools/seam_ground.py` (sumber `tools/ground_src/`) menyamakan ukuran gambar tanah dengan kotak `WorldLayout`, menyambung jalan yang putus di perbatasan, dan mengganti garis batas lurus dengan batas bergelombang (salju/rawa memudar). Cek visual semua perbatasan: `xvfb-run -s "-screen 0 1280x720x24" Godot --path godot --rendering-driver opengl3 --script res://tests/_probe_edges.gd` → `/tmp/gt/e_*.png`.
- **Jembatan (2026-11-27):** 8 jembatan kayu (Danau 1, Hutan 1, Sungai 4, Rawa 1, Salju 1) dari posisi & gambar versi web lama (`tools/bridges/`), ditempel ke gambar tanah oleh `seam_ground.py`, yang juga menulis `godot/core/bridges_data.gd`; `BenuaWorld` menghapus petak air (tabrakan) di bawahnya. Petak air TileMap tak terlihat (air = gambar tanah). Uji: `tests/_probe_bridges.gd`.
- **Pose merapal (2026-11-27):** `hero_mc2.png` baris 25–27 = cast bawah/atas/samping (samping: badan atas frame jalan bertangan maju di atas kaki diam; bawah/atas: badan naik-turun 1 px). `Player.try_cast_skill` memutar `cast_*` 0,34 dtk (`cast_anim_t` menahan anim diam/jalan). Game Godot belum punya senjata busur, jadi pose busur belum dipakai. Uji: `tests/_probe_cast.gd`.
- **Palet NPC (2026-11-27):** 35 sprite NPC yang dipakai game disamakan ke palet tokoh utama: 11 warna `CHARACTER_STYLE.md` + abu muda, abu tua, cokelat (keputusan pemilik, untuk uban/zirah/kulit gelap), lalu dibersihkan (`tools/sprite_clean.py`). `python3 tools/npc_palette.py [--preview]`; aslinya di `tools/npc_src/` (sumber tetap, jalankan ulang aman). Tinggi NPC masih beragam (25–47 px).
- **NPC bertubuh tokoh utama (2026-11-27):** 24 NPC kini memakai lembar `npc_mc_<id>.png` (512×224, sel 64×56) yang dibangun dari tubuh & animasi `hero_mc2.png` dengan badan dicat ulang: potongan baju berbeda per NPC (kemeja, rompi, zirah, selempang, overall, kancing, celemek, rok/jubah, celana, kerah, sabuk, topi, tudung) (`python3 tools/npc_from_mc.py`, atur di dict `NPC`). Kepala MC diganti kepala baru buatan `tools/npc_heads.py` (posisi dicocokkan per frame): `gaya_rambut` = poni | belah | cepak | jabrik | panjang | kuncir | sanggul | keriting | botak; `mata` = titik | sipit | bulat | senyum | kacamata; `alis`, `mulut`, `pipi`, `kumis`, `jenggot`, `keriput`; `kulit` = terang | sawo | gelap; `topi` = caping | topi | tudung | helm. `npc.gd` punya cabang format 512×224.
