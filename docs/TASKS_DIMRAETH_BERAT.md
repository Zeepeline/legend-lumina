# Daftar Tugas Berat Adaptasi Dimraeth & Peningkatan Monster (`H1`–`H11`)

Dokumen acuan pengembangan fitur berat Legenda Lumina hasil studi video *Dimraeth* serta peningkatan visual & gerakan monster.
Setiap item wajib mengikuti aturan `docs/CODE_RULES.md` (<= 400 baris/berkas, <= 160 kolom, Bahasa Indonesia, tanpa galat konsol).

---

## Ringkasan Tugas

- [x] **H1 — Rombak Busur & Panah (`src/systems/bow_overhaul.js`)**
  - Membidik sambil tahan Serang (>= 0,16 dtk) di luar radius interaksi: gerak *strafe* taktis (`0,45x`), garis bidik laser putus-putus berkontras, dan retikel daya di posisi sasaran.
  - Melepas tarikan >= 0,45 dtk meluncurkan **Panah Bidik Penuh** (kecepatan tinggi, menembus, ×1,9 dmg); tarikan penuh >= 0,85 dtk memicu **Tembakan Maut + Volley 3 Panah** dengan jaminan kritikal di tengah.
  - Kompatibel dengan ketuk keyboard (`Z`/`J`/`Space`), tombol sentuh (`#bA`), dan tahan klik kiri tetikus.
  - Tambah **HUD Amunisi Dinamis (`#hud-ammo`)** di pojok kanan bawah ketika senjata bertipe `bow` terpasang (`🏹 Tajam: N · ∞ Biasa`).

- [x] **H2 — Pohon Bakat Radial 4 Cabang (`src/ui/talent_tree.js`)**
  - Desain ulang `openTalentTree()` sebagai jendela **POHON BAKAT ARKA** bertema gelap dengan konektor SVG bercahaya dari inti ke 4 cabang mata angin:
    - Utara: `war` (**Pendekar Pedang** — Tebasan Lebar, Fokus Tajam, Refleks Ksatria)
    - Barat: `mag` (**Penyihir Bijak** — Aliran Mana, Ledakan Mistik, Pancaran Jiwa)
    - Timur: `exp` (**Penjelajah Alam** — Langkah Ringan, Mata Harta, Langkah Kebal)
    - Selatan: `grd` (**Penjaga Baja** — Zirah Hidup, Pijakan Kukuh, Embun Botol)
  - Menyertakan pratinjau `<canvas>` animasi efek tiap simpul bakat, kontrol klik + D-pad/keyboard, tombol tingkatkan `★`, serta Reset Bakat (`50 G`).
  - Memastikan efek pasif seluruh 4 cabang aktif dalam perhitungan `stat()`, serang/cleave, biaya MP, tahan rawa, dan restorasi Botol Cahaya.

- [x] **H3 — Asal-Usul Kelas × Ras & Layar Karakter Hidup (`src/systems/archetype_origin.js`, `src/ui/character_screen.js`)**
  - Tambah sistem **4 Ras** (*Manusia Lumina*, *Penjaga Rimba*, *Darah Aurel*, *Baja Pegunungan*) × **4 Kelas** (*Pendekar*, *Pemburu*, *Penyihir*, *Pengelana*) dengan penskalaan silang antar-atribut (*Cross-Stat Scaling* ala *Dimraeth*).
  - Ganti `openAttr()` menjadi modal **KARAKTER ARKA** interaktif: sprite Arka beranimasi langsung dari `ch_hero` pada `<canvas>` (mode `Diam`, `Jalan`, `Tebas`), pemilih Ras & Kelas, pembagi poin `STR / INT / VIT / AGI`, rekap *Archetype* & *Set Perlengkapan*, saklar Familiar, serta pintasan ke Jurus & Pohon Bakat.

- [x] **H4 — Drop Resep, Kitab Rahasia & Kartu Jurus Beranimasi (`src/systems/recipe_unlock.js`, `src/ui/skill_cards.js`)**
  - Tambah 5 resep rahasia baru (*Minyak Bisa Panah*, *Bubuk Kilau Senja*, *Eliksir Ksatria*, *Jimat Gagak Senja*, *Kitab Miasma Rawa*) yang terbuka lewat peti wilayah & drop musuh elit/bos dengan banner **`RESEP BARU TERBUKA`**.
  - Perluas `openRecipeBook()` dengan kategori **Resep Rahasia** (menunjukkan yang sudah terbuka dan petunjuk lokasi resep terkunci).
  - Rombak `openSkills()` menjadi galeri **Kartu Jurus Beranimasi** lengkap dengan `<canvas>` simulasi VFX 7 jurus, bilah penguasaan `I–III`, sinergi status, indikator Kitab Mantra aktif, serta tombol pasang `SIHIR`.

- [x] **H5 — Peningkatan Peta Dunia (`src/ui/worldmap_overhaul.js`)**
  - Lengkapi `openWorldMap(sc)` dengan lapisan interaktif yang dapat difilter + tutup bersih via tombol `B` / `ESC` / `✕ TUTUP`:
    1. **Zona Bahaya (`⚠ Lv X`)** berdasarkan `LEVEL_WILAYAH`.
    2. **Pin Guru Jurus (`📖`)** beserta indikator jurus siap dipelajari (`!`) atau sudah dikuasai (`✓`).
    3. **Pin Harta & Resep (`🎁`/`📜`)** untuk peti wilayah yang belum dibuka.
    4. **Pin Patung Teleport (`🌀`)** — mengetuk patung aktif menawarkan **Pindah Cepat**.

- [x] **H6 — Familiar Udara Gagak Senja (`src/systems/familiar.js`)**
  - Ciptakan familiar burung **Gagak Senja** piksel prosedural (3 frame kepakan sayap + aura lentera malam).
  - Dapat diperoleh/dirakit via `fam_crow` (*Jimat Gagak Senja*) dan dihidup-matikan dari layar Karakter.
  - Mengorbit mulus di sekitar Arka, menembakkan proyektil bulu bayangan berpelacak (*Bleed* / *Poison*), serta memperluas radius tarik drop barang.

- [x] **H7 — Perombakan Sprite `kn1` Kesatria Arvan (`tools/gen_kn1_sheet.py`, `assets/img/npc/npc_sheet_kn1.png`)**
  - Mengganti sprite `kn1` lama (`80×56`, gaya RPG-Maker & pedang raksasa menusuk Arka) menjadi sprite chibi `48×48` 10 baris (`384×480`) proporsi serasi dengan `gk2` & `hero_mc2` (`1×2` mata piksel gelap, 13 warna, zirah baja & jubah pirus berkilau, sarung pedang di pinggang).
  - Memperbarui `NPC_SHEET_DIM` di `src/npc/life_sheet.js` agar `tests/npc_sheets.spec.js` lulus 100%.

- [x] **H8 — Verifikasi Penuh & Pengujian Regresi (`tests/dimraeth_heavy.spec.js`)**
  - Menjalankan `npm run check` (`0` masalah sintaks, `0` pelanggaran ukuran/kolom, tata letak bersih, `CODEMAP.md` & `INDEX.md` terbarui) dan Playwright tanpa error.

- [x] **H9 — 9 Lembar Sprite Monster Dark-Fantasy 4×6 & 5 Varian Slime Recolor HD (`assets/img/monsters/esh_*.png`, `tools/slice_enemy_sheet.py`, `src/gfx/gptmonsters.js`, `src/gfx/enemy_sheets.js`)**
  - Menghasilkan dan memotong rapi 9 lembar animasi 24 frame (Idle, Move, Wind-up, Attack, Hurt & Stagger, Alert): `frog`, `boar`, `bee`, `plant`, `snake`, `wisp`, `shroom`, `bat`, `salam` beserta varian bos/elitnya (`bounty_frog`, `gsnake`, `kryos`, `squeen`, `batc`, `bounty_gargoyle`).
  - Mengubah 5 varian slime (`slimer`, `slimei`, `slimep`, `slimef`, `gold_slime`) menjadi spritesheet recolor warna asli berbasis animasi 7 frame `slime_hd`.

- [x] **H10 — Sistem Gerakan Halus & Kinematika Monster (`src/systems/enemy_motion.js`)**
  - Menghaluskan kecepatan gerak monster berbasis inersia (`lerp`), sinkronisasi kecepatan animasi `mv`, arah hadap cerdas saat patroli vs menyerang, pegas napas diam, kemiringan badan saat berlari, animasi `wind -> atk` khusus kodok/ular/jamur/bunga/salamander, afterimage saat menerjang cepat, dan penskalaan bayangan udara/lompat.

- [x] **H11 — Aura Partikel Elemental Monster & Perapian HUD (`src/systems/enemy_motion.js`, `styles.css`, `src/systems/bow_overhaul.js`)**
  - Menambah pancaran partikel aura elemen halus untuk `wisp`, `salam`, `slimef`, `slimep`, `slimei`, `gold_slime`, `golemi`, dan `kryos`.
  - Merapikan posisi `#hDate` (`top:54px`) dan `#hud-ammo` (`bottom:6px;right:6px`) agar tidak tumpang tindih dengan bar status maupun misi.
