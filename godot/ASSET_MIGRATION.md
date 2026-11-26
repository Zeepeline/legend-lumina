# Migrasi Aset Legenda Lumina ke Godot (`godot/assets/art/`)

Dokumen ini mencatat aset PNG yang sudah dipindahkan (`git mv`) dari `assets/img/` ke `godot/assets/art/` agar aset terpakai dan sisa aset proyek web lama terlihat jelas untuk bersih-bersih bertahap.

## 1. Fase 1 — Vertical Slice Desa Lumina (36 File)

- **Hero (2):** `hero_mc2_slave.png`, `hero_mc2.png`
- **VFX (3):** `vfx_swing_combo.png`, `vfx_hit_impact.png`, `vfx_charge_spin.png`
- **Ground (7):** `gnd_grass.png`, `gnd_grass_light.png`, `gnd_grass_dark.png`, `gnd_dirt.png`, `gnd_edge_sprout.png`, `gnd_water_sprout.png`, `deco_sprout_objs.png`
- **Buildings (9):** `sp_houseA.png`, `sp_houseB.png`, `sp_houseC.png`, `sp_house_brown_cottage.png`, `sp_house_red_cottage.png`, `sp_house_proto.png`, `sp_blacksmith_forge.png`, `sp_b_well.png`, `sp_b_i_market.png`
- **Props (5):** `benchWood.png`, `crateCart.png`, `lampPost.png`, `planter.png`, `pot.png`
- **NPC (8):** `npc_elder.png`, `npc_farmer.png`, `npc_merchant.png`, `npc_smith.png`, `npc_guard.png`, `npc_girl.png`, `npc_child.png`, `npc_woman.png`
- **Monsters (2):** `esh_boar.png`, `esh_slaver.png`

## 2. Fase 2 — Wilayah Alam, Interior Desa, Seluruh `esh_*`, & Satwa Damai (68 File)

- **Monsters `esh_*` (17):** `esh_bat.png`, `esh_bee.png`, `esh_frog.png`, `esh_gchief.png`, `esh_ghost.png`, `esh_gking.png`, `esh_golem.png`, `esh_mimic.png`, `esh_plant.png`, `esh_salam.png`, `esh_samurai.png`, `esh_shroom.png`, `esh_skel.png`, `esh_slaver_captain.png`, `esh_snake.png`, `esh_wisp.png`, `esh_witch.png`
- **Animals (5):** `ani_deer.png`, `ani_duck.png`, `ani_owl.png`, `ani_rabbit.png`, `ani_squirrel.png`
- **Goblin Camp (12):** `goblin_banner.png`, `goblin_cage.png`, `goblin_cauldron.png`, `goblin_forge.png`, `goblin_fortress.png`, `goblin_gate.png`, `goblin_hut.png`, `goblin_shrine.png`, `goblin_torch.png`, `goblin_totem.png`, `goblin_tower.png`, `goblin_wagon.png`
- **Interior (10):** `int_room1.png`, `int_room2.png`, `int_room3.png`, `int_chest.png`, `int_bed_red.png`, `int_bed_blue.png`, `int_fireplace.png`, `int_workbench.png`, `int_bookshelf.png`, `int_table_flower.png`
- **NPC (14):** `npc_inn.png`, `npc_mom.png`, `npc_priest.png`, `mila_sheet.png`, `npc_hunter.png`, `npc_joko.png`, `npc_wati.png`, `npc_darma.png`, `npc_bayu.png`, `npc_gun.png`, `npc_ratih.png`, `npc_hermit.png`, `npc_nila.png`, `npc_lestari.png`
- **Buildings (3):** `sp_b_windmill.png`, `sp_b_shrine.png`, `fountain.png`
- **Ground & Water (6):** `deco_water_dock.png`, `deco_water_boat.png`, `deco_water_lilypad.png`, `deco_water_lotus.png`, `deco_water_reeds_lush.png`, `gnd_hills_sprout.png`
- **Props (1):** `bench.png`

**Total Fase 1 + 2 + 3 sudah dipindahkan ke `godot/assets/`:** 205 file (190 PNG/art, 2 ikon, 13 audio).

## 3. Fase 3 — Kota Lumina, Interior Kota, Audio Asli, & Ikon (101 File)

- **Musik (`godot/assets/audio/music/`, 4 MP3):** `bgm_village.mp3`, `bgm_exploration.mp3`, `bgm_battle.mp3`, `bgm_boss.mp3`.
- **SFX Tempur (`godot/assets/audio/sfx/`, 9 OGG/WAV):** `hit_deep.wav`, `hit_heavy.wav`, `hit_metal.ogg`, `hit_punch_heavy.ogg`, `hit_punch_med.ogg`, `slash_chop.ogg`, `slash_slice.ogg`, `swing_heavy.wav`, `swing_light.wav`.
- **Ikon Aplikasi (`godot/assets/icons/`, 2 PNG):** `icon-192.png`, `icon-512.png`.
- **Tanah Kota (1 PNG):** `gnd_city_cobble.png`.
- **Bangunan & Struktur Kota Lumina (51 PNG):**
  - Umum & rumah (12): `sp_b_gatehouse.png`, `sp_b_citywall_l.png`, `sp_b_citywall_r.png`, `sp_b_barakBayaran.png`, `sp_b_balaiDewan.png`, `sp_b_academy.png`, `sp_b_blades.png`, `sp_b_cityHouse1.png`..`sp_b_cityHouse5.png`.
  - Kios pasar (5): `sp_b_stall_butcher.png`, `sp_b_stall_food.png`, `sp_b_stall_potion.png`, `sp_b_stall_scroll.png`, `sp_b_stall_weapon.png`.
  - Garnisun (15): `sp_b_gar_hall.png`, `sp_b_gar_barracks.png`, `sp_b_gar_barracks2.png`, `sp_b_gar_stable.png`, `sp_b_gar_pen.png`, `sp_b_gar_dummy.png`, `sp_b_gar_bag.png`, `sp_b_gar_shields.png`, `sp_b_gar_target.png`, `sp_b_gar_target2.png`, `sp_b_gar_target3.png`, `sp_b_gar_supply.png`, `sp_b_gar_rack.png`, `sp_b_gar_hayrack.png`, `sp_b_gar_barricade.png`.
  - Akademi (19): `sp_b_acad_dorm.png`, `sp_b_acad_gate.png`, `sp_b_acad_fence.png`, `sp_b_acad_post.png`, `sp_b_acad_fountain.png`, `sp_b_acad_greenhouse.png`, `sp_b_acad_lamp.png`, `sp_b_acad_statue.png`, `sp_b_acad_bench.png`, `sp_b_acad_board.png`, `sp_b_acad_crates.png`, `sp_b_acad_crates2.png`, `sp_b_acad_cypress.png`, `sp_b_acad_dummy.png`, `sp_b_acad_pottree.png`, `sp_b_acad_rack.png`, `sp_b_acad_target.png`, `sp_b_acad_topiary.png`, `sp_b_acad_wall.png`.
- **Properti Kota (10 PNG):** `gpt_city_lamp.png`, `gpt_city_lamp2.png`, `gpt_city_banner.png`, `gpt_city_banner_sm.png`, `gpt_city_board.png`, `gpt_city_cart.png`, `gpt_city_fence.png`, `gpt_city_flower_p.png`, `gpt_city_flower_w.png`, `gpt_city_guard.png`.
- **Perabot Interior Kota (10 PNG):** `int_rug_red.png`, `int_rug_blue.png`, `int_table_round.png`, `int_chair.png`, `int_candlestand.png`, `int_banner_blue.png`, `int_banner_red.png`, `int_clock.png`, `int_crate.png`, `int_barrel.png`.
- **NPC Kota (14 PNG):** `npc_guard_spear.png`, `npc_sheet_gk1.png`, `npc_sheet_gk2.png`, `npc_sheet_gk3.png`, `npc_sheet_gk4.png`, `npc_sheet_merc1.png`, `npc_sheet_courier.png`, `npc_sheet_ps1.png`, `npc_sheet_ps2.png`, `npc_sheet_pm1.png`, `npc_sheet_pm2.png`, `npc_sheet_ac1.png`, `npc_sheet_ac2.png`, `npc_sheet_bw1.png`.

## 4. Pembersihan Sisa File Web Lama (Selesai)

Seluruh kode, bundel, dependensi, skrip bantu, dan sisa aset proyek web lama (`src/`, `dist/`, `tests/`, `tools/`, `assets/img/`, `assets/lib/`, `assets/templates/`, `node_modules/`, `venv/`, beserta file konfigurasi web di root) telah dibersihkan dari repositori setelah migrasi Fase 1–3 selesai.

Yang dipertahankan di repositori:
- `godot/` — Proyek utama Godot 4.7.2 beserta 205 aset terpakai di `godot/assets/`.
- `docs/` — Dokumentasi desain dunia, cerita, & aturan visual.
- `assets/ref/` — Referensi gambar lokal (diabaikan di `.gitignore`).
