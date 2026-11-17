# TASKS_GPT_ASET — daftar tugas ChatGPT (G001–G376) untuk aset gaya "Senja Emas"

Tujuan: seluruh aset dunia Legenda Lumina (tanah, tumbuhan, bangunan, karakter, musuh, efek, UI, ikon) dibuat ulang dalam satu gaya
baru yang hangat dan keemasan, setara kualitas screenshot acuan pemilik (16-11-2026). Semua desain ORISINAL milik Legenda Lumina.
Rona warna di game sudah menyesuaikan (v1.47.0, `src/systems/grade.js`). Setelah set tanah + vegetasi masuk, gaya ini MENGGANTIKAN
patokan treeA (AGENTS.md).

## Cara pakai (pemilik)
1. **Satu obrolan ChatGPT per bagian** (A, B, C, …). Di awal setiap obrolan kirim SATU pesan pembuka berisi:
   - blok **GAYA UMUM** di bawah (+ blok **GARANG** khusus bagian I Musuh),
   - semua blok **LAYOUT** di bawah,
   - lampirkan **style key** = hasil tugas G001 yang sudah kamu setujui (untuk G001 sendiri belum ada lampiran),
   - tutup dengan: `Remember these rules for every image in this chat. Reply "OK" and wait for my tasks.`
2. Setelah ChatGPT menjawab OK, kirim prompt tugas satu per satu (baris "Prompt" tiap tugas). Satu tugas = satu gambar.
3. Simpan hasil ke nama file di baris "Simpan" lalu kirim ke Claude/agen untuk dipotong & dipasang. Centang `[x]` tugasnya.
4. Jangan unggah screenshot game lain ke ChatGPT dan jangan menyebut nama game lain di prompt: semua aset harus desain kita sendiri.
5. Urutan disarankan: A1 → B (padang, hutan, desa) → C pohon & semak → N hutan alami → E rumah desa → H NPC desa → I musuh → K efek → sisanya.

## Blok GAYA UMUM (tempel di pesan pembuka setiap obrolan)
```
STYLE RULES for every image in this chat (follow the attached style key image if provided):
- Top-down 3/4 view pixel art for a mobile action RPG. Original designs only; do not imitate characters, creatures, logos or assets from any existing game.
- Warm late-afternoon golden light from the UPPER LEFT, soft and slightly hazy. Shadows fall to the lower right, soft and deep olive, never pure black.
- Palette: sun-baked yellow-green grass (#bdc452, #a7b046, #747a31), warm ochre earth (#d4ba5e, #a6914a), deep olive shadows (#4a5825, #313326),
  darkest tone #1e1c16. Muted teal (#4f7a6a) and dusty blue (#6a7f8f) only as small accents. Everything slightly desaturated. No neon, no pure white except tiny highlights.
- Shading: 3-4 tones per material, soft painterly clusters, very little dithering, chunky readable shapes.
- Outlines: objects and characters have a 1-pixel outline in a DARKER SHADE of their own color (not black). Ground textures have no outline.
- Scale: one game pixel = one art pixel. A human character is about 32 art pixels tall. A floor tile is 16 art pixels.
- Clean pixels: hard square pixels, no anti-aliasing, no blur, no gradients, no noise, no text, no letters, no numbers, no watermark, no frame or grid lines.
```

## Blok GARANG (tambahan untuk obrolan Musuh)
```
MONSTER MOOD: dark fantasy, souls-like threat. Menacing, feral, scarred, ugly-dangerous, NOT cute, NOT chibi, no big friendly eyes, no smiles,
no comic effects (no stars, sweat drops, motion lines, X eyes). Small glowing eyes (sickly yellow, ember red or pale). Correct anatomy in every frame:
never extra legs, arms or toes.
```

## Blok LAYOUT (tempel semua di pesan pembuka)
```
LAYOUT CODES used in my tasks:
[LAYOUT: CONCEPT] 1536x1024 landscape concept frame of a game screen (top-down 3/4 camera), no UI, no text.
[LAYOUT: SEAMLESS] 1024x1024 square texture that tiles seamlessly on all four sides. Flat, even lighting, no objects that stand out.
[LAYOUT: STAMP 4x4] 1024x1024, exactly 4x4 equal cells (256x256), one piece per cell, centered, solid flat magenta #FF00FF background.
[LAYOUT: OBJ 2x2] 1024x1024, 2x2 equal cells, one object per cell, base of each object on the cell's lower baseline, magenta #FF00FF background.
[LAYOUT: OBJ 2x4] 1024x2048 portrait, 2 columns x 4 rows, one object per cell, same baseline rules, magenta #FF00FF background.
[LAYOUT: BUILDING] 1024x1024, one building centered, front door facing the camera (south), magenta #FF00FF background, no ground around it.
[LAYOUT: ANIM 4x1] 1024x256, 4 animation frames left to right, same size and position in every frame, magenta #FF00FF background (or seamless if a water surface).
[LAYOUT: ANIM 4x2] 1024x512, 2 rows of 4 animation frames (one animated object per row), magenta #FF00FF background.
[LAYOUT: CHAR 4x6] 1024x1536, 4 columns x 6 rows (256x256 cells). Rows: 1 idle facing DOWN, 2 walk DOWN, 3 idle facing UP, 4 walk UP, 5 idle facing RIGHT,
  6 walk RIGHT (4 frames each, smooth loops). Feet on the same baseline, same size in every cell, magenta #FF00FF background, no weapon effects.
[LAYOUT: ENEMY 4x6] 1024x1536, 4x6 cells. Monster faces RIGHT in every frame. Rows: 1 idle, 2 move, 3 WIND-UP (clear readable tell before attacking),
  4 attack, 5 hurt recoil (frames 1-2) + staggered (frames 3-4), 6 alert/threat display when it spots the hero. No death row. Magenta background.
[LAYOUT: BOSS 4x6 A] / [LAYOUT: BOSS 4x6 B] 1024x1536, 4x6 cells, boss faces RIGHT, rows as written in the task, magenta background.
[LAYOUT: ANIMAL 4x4] 1024x1024, 4x4 cells, animal faces RIGHT, rows as written in the task, magenta background.
[LAYOUT: PORTRAIT 2x2] 1024x1024, 2x2 cells, chest-up dialogue portrait facing slightly right, plain magenta background, same character in all 4.
[LAYOUT: VFX 4x4] 1024x1024, 4x4 cells read left-to-right, top-to-bottom as frames, SOLID BLACK #000000 background (effect will be drawn with additive light),
  bright core and soft colored falloff drawn in pixels.
[LAYOUT: ICON 6x6] 1024x1024, 6x6 equal cells, one icon per cell, each icon fills about 80% of its cell, magenta #FF00FF background.
[LAYOUT: UI] 1024x1024 sheet of separate UI pieces on magenta #FF00FF, each piece separated by at least 32 px, 9-slice frames drawn with clear plain centers.
```

## Untuk Claude/agen yang memasang
- Potong pakai `tools/gen_enemy.py` (musuh) / `tools/gen_hero.py` (karakter 4x6, fungsi `frames_of` + `shrink`) / skrip baru untuk stamp & tekstur
  (pola sama: latar magenta → alfa, perkecil ke ukuran game di baris "Ukuran di game", buang semburat magenta di tepi). VFX: latar hitam → mode ADD.
- Tekstur SEAMLESS diperkecil ke 256×256 lalu dipakai `genGround` (`src/world/ground_verdant.js`) menggantikan `gnd_*`; potongan tepi dipasang
  di sepanjang batas rumput–jalan (pola `verdantBank`).
- Bagian N: `pangkal_*` ditaruh di bawah setiap pohon (depth = y pohon − 1); `kanopi_*` mengisi celah antar pohon rapat (depth tinggi,
  transparan saat menutupi pemain seperti `fades`); `bayangan_kanopi` = lapisan MULTIPLY di area rapat; `akar_raksasa` & `pohon_tumbang` = tembok
  alami (collision); `dahan_depan` = lapisan paling atas di Hutan Dalam; lantai & pohon berganti bertahap dari pinggir ke inti.
- Aset baru wajib lolos `docs/VALIDATION_RULES.md`. Bila hasil ChatGPT tidak rapi (jumlah baris/kolom salah, ukuran beda), minta ulang SATU baris saja.

## Ringkasan isi
| Bagian | Isi | Tugas |
|---|---|---|
| A | Gambar patokan suasana 10 wilayah | 10 |
| B | Tanah, tepi, air, tebing, jembatan, ladang | 60 |
| C | Pohon & tumbuhan | 22 |
| D | Batu & alam | 10 |
| E | Bangunan | 25 |
| F | Properti desa/kota/dunia | 28 |
| G | Markas goblin | 6 |
| H | 27 NPC (sprite + potret), 8 warga, Arka | 64 |
| I | 18 musuh + 9 bos (2 lembar + potret) | 45 |
| J | Hewan & ikan | 15 |
| K | Efek visual | 30 |
| L | UI | 18 |
| M | Ikon (432 ikon) | 12 |
| N | Hutan alami: pangkal pohon, kanopi, pohon per umur, tumbuhan bawah, lantai hutan, penghalang, inti magis | 31 |

## A. Gambar patokan suasana
Obrolan "Patokan". Kerjakan A1 dulu: itu jadi STYLE KEY untuk semua obrolan lain.
### [x] G001. Gambar patokan suasana: padang
- Simpan: `assets/raw/gpt2/patokan/padang.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a sunny meadow clearing: worn ochre dirt patches with soft leafy scalloped edges inside yellow-green grass, clumps of dark olive ferns, a few wildflowers, a lone broad tree casting a soft shadow, light shafts from the upper left. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: INI GAMBAR KUNCI. Setelah disetujui pemilik, lampirkan gambar ini di SETIAP obrolan berikutnya sebagai "style key".
### [x] G002. Gambar patokan suasana: hutan
- Simpan: `assets/raw/gpt2/patokan/hutan.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a forest clearing: tall broad-leaf trees around the edges with dense dark canopies, mossy roots, fern beds, a winding dirt path, a fallen log, light shafts and floating pollen. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [x] G003. Gambar patokan suasana: hutan dalam
- Simpan: `assets/raw/gpt2/patokan/hutan_dalam.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of an old deep forest: giant mossy trunks, hanging vines, dim green-gold light, mushrooms, a small stream with stepping stones. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [x] G004. Gambar patokan suasana: desa
- Simpan: `assets/raw/gpt2/patokan/desa.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a small farming village square: timber-and-plaster cottages with thatched and red-tiled roofs, a stone well, a market stall, fences, vegetable plots, warm golden light. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [x] G005. Gambar patokan suasana: rawa
- Simpan: `assets/raw/gpt2/patokan/rawa.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a murky swamp: olive water with lily pads, reeds, twisted dead trees, wooden boardwalk, low mist, muted sickly greens. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [x] G006. Gambar patokan suasana: salju
- Simpan: `assets/raw/gpt2/patokan/salju.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a snowy mountain pass: soft blue-white snow with warm sunlit highlights, frosted pines, icy rocks, a frozen pond. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [x] G007. Gambar patokan suasana: gua
- Simpan: `assets/raw/gpt2/patokan/gua.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a stone cave: dark warm-grey rock floor, purple crystals glowing softly, stalagmites, a narrow path lit by a torch. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [x] G008. Gambar patokan suasana: danau
- Simpan: `assets/raw/gpt2/patokan/danau.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a calm lake shore: sandy-ochre bank, reeds, a wooden pier with a rowboat, gentle ripples, a small lighthouse in the distance. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [ ] G009. Gambar patokan suasana: kota
- Simpan: `assets/raw/gpt2/patokan/kota.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a medieval market town street: cobblestone road, stone and timber houses, banners, lamp posts, crates and barrels, a fountain. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.
### [ ] G010. Gambar patokan suasana: markas goblin
- Simpan: `assets/raw/gpt2/patokan/markas_goblin.png` · Ukuran di game: bukan untuk dipotong (acuan suasana & warna)
- Prompt: `[LAYOUT: CONCEPT] Concept frame of a crude goblin war camp: spiked log palisade, patched hide huts, a cooking cauldron, banners on poles, torches, trampled mud. Include one small original adventurer (about 32 px tall in game scale) for scale.`
- Cek: Warna & cahaya cocok dengan blok gaya; tidak ada teks/logo; skala karakter kecil.

## B. Tanah, air, tebing, ladang
Obrolan "Tanah".
### [x] G011. padang: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/padang_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of sun-baked yellow-green meadow grass. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol. Selesai disetujui & mulus sempurna.
### [x] G012. padang: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/padang_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of warm ochre dirt.`
- Cek: Mulus saat diulang 2×2. Selesai disetujui & mulus sempurna.
### [ ] G013. padang: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/padang_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where sun-baked yellow-green meadow grass overlaps warm ochre dirt: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [x] G014. padang: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/padang_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for sun-baked yellow-green meadow grass: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel. Selesai dipotong 16 varian + ekspor 16 sprite game ke `assets/img/nature/clutter_*.png`.
### [x] G015. padang: tepi air (tebing kecil tanah ke air)
- Simpan: `assets/raw/gpt2/tanah/padang_tepiair.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Shoreline pieces where sun-baked yellow-green meadow grass meets calm water: a thin darker earth lip, a few reeds and pebbles at the waterline. Row 1: straight shore facing up, right, down, left. Row 2: outer corners. Row 3: inner corners. Row 4: four small rocks/reed clumps standing in water. Only the land part is drawn; water area is magenta.`
- Cek: Hanya bagian darat yang digambar; air = magenta. Selesai dipotong 12 ubin tepian 32×32 px + 4 objek air (batu & alang-alang) bersih transparan.
### [ ] G016. hutan: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/hutan_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of slightly deeper green forest grass with tiny leaf litter. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G017. hutan: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/hutan_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of brown-ochre forest dirt with twigs.`
- Cek: Mulus saat diulang 2×2.
### [ ] G018. hutan: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/hutan_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where slightly deeper green forest grass with tiny leaf litter overlaps brown-ochre forest dirt with twigs: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G019. hutan: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/hutan_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for slightly deeper green forest grass with tiny leaf litter: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G020. hutan: tepi air (tebing kecil tanah ke air)
- Simpan: `assets/raw/gpt2/tanah/hutan_tepiair.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Shoreline pieces where slightly deeper green forest grass with tiny leaf litter meets calm water: a thin darker earth lip, a few reeds and pebbles at the waterline. Row 1: straight shore facing up, right, down, left. Row 2: outer corners. Row 3: inner corners. Row 4: four small rocks/reed clumps standing in water. Only the land part is drawn; water area is magenta.`
- Cek: Hanya bagian darat yang digambar; air = magenta.
### [ ] G021. hutan dalam: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/hutan_dalam_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of dark mossy forest floor with moss tufts. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G022. hutan dalam: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/hutan_dalam_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of damp dark-brown soil with roots.`
- Cek: Mulus saat diulang 2×2.
### [ ] G023. hutan dalam: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/hutan_dalam_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where dark mossy forest floor with moss tufts overlaps damp dark-brown soil with roots: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G024. hutan dalam: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/hutan_dalam_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for dark mossy forest floor with moss tufts: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G025. hutan dalam: tepi air (tebing kecil tanah ke air)
- Simpan: `assets/raw/gpt2/tanah/hutan_dalam_tepiair.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Shoreline pieces where dark mossy forest floor with moss tufts meets calm water: a thin darker earth lip, a few reeds and pebbles at the waterline. Row 1: straight shore facing up, right, down, left. Row 2: outer corners. Row 3: inner corners. Row 4: four small rocks/reed clumps standing in water. Only the land part is drawn; water area is magenta.`
- Cek: Hanya bagian darat yang digambar; air = magenta.
### [ ] G026. desa: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/desa_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of trimmed bright yellow-green village grass. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G027. desa: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/desa_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of packed light-ochre dirt road.`
- Cek: Mulus saat diulang 2×2.
### [ ] G028. desa: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/desa_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where trimmed bright yellow-green village grass overlaps packed light-ochre dirt road: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G029. desa: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/desa_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for trimmed bright yellow-green village grass: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G030. desa: tepi air (tebing kecil tanah ke air)
- Simpan: `assets/raw/gpt2/tanah/desa_tepiair.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Shoreline pieces where trimmed bright yellow-green village grass meets calm water: a thin darker earth lip, a few reeds and pebbles at the waterline. Row 1: straight shore facing up, right, down, left. Row 2: outer corners. Row 3: inner corners. Row 4: four small rocks/reed clumps standing in water. Only the land part is drawn; water area is magenta.`
- Cek: Hanya bagian darat yang digambar; air = magenta.
### [ ] G031. rawa: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/rawa_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of soggy olive-green marsh grass. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G032. rawa: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/rawa_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of grey-brown sticky mud with puddles.`
- Cek: Mulus saat diulang 2×2.
### [ ] G033. rawa: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/rawa_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where soggy olive-green marsh grass overlaps grey-brown sticky mud with puddles: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G034. rawa: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/rawa_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for soggy olive-green marsh grass: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G035. rawa: tepi air (tebing kecil tanah ke air)
- Simpan: `assets/raw/gpt2/tanah/rawa_tepiair.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Shoreline pieces where soggy olive-green marsh grass meets calm water: a thin darker earth lip, a few reeds and pebbles at the waterline. Row 1: straight shore facing up, right, down, left. Row 2: outer corners. Row 3: inner corners. Row 4: four small rocks/reed clumps standing in water. Only the land part is drawn; water area is magenta.`
- Cek: Hanya bagian darat yang digambar; air = magenta.
### [ ] G036. salju: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/salju_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of soft snow with warm sunlit highlights and cool blue shadows. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G037. salju: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/salju_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of trampled snow path with exposed frozen dirt.`
- Cek: Mulus saat diulang 2×2.
### [ ] G038. salju: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/salju_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where soft snow with warm sunlit highlights and cool blue shadows overlaps trampled snow path with exposed frozen dirt: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G039. salju: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/salju_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for soft snow with warm sunlit highlights and cool blue shadows: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G040. gua: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/gua_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of dark warm-grey rough cave rock floor. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G041. gua: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/gua_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of loose gravel and dust path.`
- Cek: Mulus saat diulang 2×2.
### [ ] G042. gua: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/gua_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where dark warm-grey rough cave rock floor overlaps loose gravel and dust path: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G043. gua: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/gua_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for dark warm-grey rough cave rock floor: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G044. danau: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/danau_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of lush lakeside grass. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G045. danau: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/danau_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of pale sandy-ochre shore sand.`
- Cek: Mulus saat diulang 2×2.
### [ ] G046. danau: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/danau_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where lush lakeside grass overlaps pale sandy-ochre shore sand: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G047. danau: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/danau_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for lush lakeside grass: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G048. danau: tepi air (tebing kecil tanah ke air)
- Simpan: `assets/raw/gpt2/tanah/danau_tepiair.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Shoreline pieces where lush lakeside grass meets calm water: a thin darker earth lip, a few reeds and pebbles at the waterline. Row 1: straight shore facing up, right, down, left. Row 2: outer corners. Row 3: inner corners. Row 4: four small rocks/reed clumps standing in water. Only the land part is drawn; water area is magenta.`
- Cek: Hanya bagian darat yang digambar; air = magenta.
### [ ] G049. jalan raya: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/jalan_raya_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of dry roadside grass. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G050. jalan raya: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/jalan_raya_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of old wide dirt road with wheel ruts and stones.`
- Cek: Mulus saat diulang 2×2.
### [ ] G051. jalan raya: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/jalan_raya_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where dry roadside grass overlaps old wide dirt road with wheel ruts and stones: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G052. jalan raya: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/jalan_raya_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for dry roadside grass: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G053. kota: tekstur tanah utama (mulus, diulang)
- Simpan: `assets/raw/gpt2/tanah/kota_dasar.png` · Ukuran di game: 256×256 px di game (diulang tanpa sambungan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of small trimmed lawn patches. Very low contrast, no single object stands out, subtle variation only.`
- Cek: Saat dijajarkan 2×2 tidak terlihat garis sambungan; tidak ada objek menonjol.
### [ ] G054. kota: tekstur tanah kedua (jalan/petak)
- Simpan: `assets/raw/gpt2/tanah/kota_jalan.png` · Ukuran di game: 256×256 px di game (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless tiling ground texture of grey-ochre cobblestone street.`
- Cek: Mulus saat diulang 2×2.
### [ ] G055. kota: potongan tepi antara rumput & jalan
- Simpan: `assets/raw/gpt2/tanah/kota_tepi.png` · Ukuran di game: tiap potongan ±32×32 px di game
- Prompt: `[LAYOUT: STAMP 4x4] Edge pieces where small trimmed lawn patches overlaps grey-ochre cobblestone street: the grass edge is soft and scalloped with small leafy bumps (no hard line). Row 1: straight edge facing up, right, down, left. Row 2: four outer corners. Row 3: four inner corners. Row 4: four small isolated grass islands. Each piece shows ONLY the grass part with its leafy rim; the rest of the cell is magenta.`
- Cek: Tepi rumput bergerigi daun lembut seperti gambar patokan; bagian jalan = magenta.
### [ ] G056. kota: hiasan tanah kecil
- Simpan: `assets/raw/gpt2/tanah/kota_hiasan.png` · Ukuran di game: tiap hiasan 6–20 px di game
- Prompt: `[LAYOUT: STAMP 4x4] 16 small ground decorations for small trimmed lawn patches: grass tufts, tiny weeds, pebbles, twigs, fallen leaves, small flowers, a mushroom. All tiny and flat to the ground.`
- Cek: Kecil & rendah; tidak ada yang lebih besar dari 1/4 sel.
### [ ] G057. air dangkal
- Simpan: `assets/raw/gpt2/tanah/air_dangkal.png` · Ukuran di game: 256×256 px
- Prompt: `[LAYOUT: SEAMLESS] Seamless shallow water texture: olive-teal water with visible sandy bottom, soft light caustics.`
### [ ] G058. air dalam
- Simpan: `assets/raw/gpt2/tanah/air_dalam.png` · Ukuran di game: 256×256 px
- Prompt: `[LAYOUT: SEAMLESS] Seamless deep water texture: dark teal-green, gentle wave highlights, desaturated.`
### [ ] G059. air arus
- Simpan: `assets/raw/gpt2/tanah/air_arus.png` · Ukuran di game: 256×256 px per frame
- Prompt: `[LAYOUT: ANIM 4x1] 4-frame loop of a seamless flowing river surface (flow left to right), small white streaks drifting.`
### [ ] G060. air riak
- Simpan: `assets/raw/gpt2/tanah/air_riak.png` · Ukuran di game: riak ±16–32 px
- Prompt: `[LAYOUT: VFX 4x4] Water ripples and splashes: row 1 small ripple ring expanding (4 frames), row 2 footstep splash (4), row 3 fish jump splash (4), row 4 rain drop impact (4).`
### [ ] G061. air terjun
- Simpan: `assets/raw/gpt2/tanah/air_terjun.png` · Ukuran di game: ±48×64 px
- Prompt: `[LAYOUT: ANIM 4x1] 4-frame loop of a small waterfall 2 tiles wide falling down a mossy rock ledge, foam at the bottom.`
### [ ] G062. jembatan kayu
- Simpan: `assets/raw/gpt2/tanah/jembatan_kayu.png` · Ukuran di game: lebar 32 px
- Prompt: `[LAYOUT: STAMP 4x4] Wooden plank bridge pieces seen from above: horizontal section, vertical section, left end, right end, top end, bottom end, rope posts, broken planks variant.`
### [ ] G063. jembatan batu
- Simpan: `assets/raw/gpt2/tanah/jembatan_batu.png` · Ukuran di game: lebar 32–48 px
- Prompt: `[LAYOUT: STAMP 4x4] Old stone arch bridge pieces: horizontal and vertical sections, ends, mossy variants.`
### [ ] G064. tebing rumput
- Simpan: `assets/raw/gpt2/tanah/tebing_rumput.png` · Ukuran di game: tinggi tebing 32 px
- Prompt: `[LAYOUT: STAMP 4x4] Grassy cliff set: grass top edge, vertical earth cliff face with roots, outer and inner corners, a cliff slope ramp, a wooden stair.`
### [ ] G065. tebing batu
- Simpan: `assets/raw/gpt2/tanah/tebing_batu.png` · Ukuran di game: tinggi 32 px
- Prompt: `[LAYOUT: STAMP 4x4] Rocky cliff set (warm grey stone with moss on top): straight faces, corners, broken edge, stone steps.`
### [ ] G066. tebing salju
- Simpan: `assets/raw/gpt2/tanah/tebing_salju.png` · Ukuran di game: tinggi 32 px
- Prompt: `[LAYOUT: STAMP 4x4] Snowy cliff set: snow cap edge, icy rock face, corners, icicles.`
### [ ] G067. dinding gua
- Simpan: `assets/raw/gpt2/tanah/dinding_gua.png` · Ukuran di game: tinggi 32 px
- Prompt: `[LAYOUT: STAMP 4x4] Cave wall set seen top-down 3/4: rough rock wall faces, corners, wall top, crystal veins.`
### [ ] G068. jalan batu
- Simpan: `assets/raw/gpt2/tanah/jalan_batu.png` · Ukuran di game: batu 8–16 px
- Prompt: `[LAYOUT: STAMP 4x4] Stepping-stone and flagstone path pieces set into grass, with grass growing between stones.`
### [ ] G069. ladang
- Simpan: `assets/raw/gpt2/tanah/ladang.png` · Ukuran di game: petak 16×16 px
- Prompt: `[LAYOUT: STAMP 4x4] Farm plot pieces: tilled dark soil, watered soil (darker), seed rows, sprout stages (4), grown crop stages for 4 crops (cabbage, carrot, wheat, pumpkin).`
### [ ] G070. pagar ladang
- Simpan: `assets/raw/gpt2/tanah/pagar_ladang.png` · Ukuran di game: tinggi 16–20 px
- Prompt: `[LAYOUT: STAMP 4x4] Low wooden farm fence pieces: horizontal, vertical, corners, gate closed, gate open, broken post.`

## C. Pohon & tumbuhan
Obrolan "Vegetasi".
### [x] G071. pohon padang
- Simpan: `assets/raw/gpt2/vegetasi/pohon_padang.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 broad round-canopy meadow trees, slightly different shapes, sunlit yellow-green tops and deep olive undersides. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel. Selesai dipotong 4 variasi + animasi sway 8 frame ke `assets/img/nature/`.
### [x] G072. pohon buah
- Simpan: `assets/raw/gpt2/vegetasi/pohon_buah.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 fruit trees: apple tree, apple tree heavy with fruit, orange tree, pear tree. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel. Selesai dipotong 4 variasi + animasi sway 8 frame ke `assets/img/nature/fruit_*.png`.
### [x] G073. pohon hutan
- Simpan: `assets/raw/gpt2/vegetasi/pohon_hutan.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 tall forest trees with dense layered canopies and visible trunks at the bottom. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel. Selesai dipotong 4 variasi + animasi sway 8 frame ke `assets/img/nature/forest_*.png`.
### [x] G074. pohon hutan dalam
- Simpan: `assets/raw/gpt2/vegetasi/pohon_hutan_dalam.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 giant ancient trees: mossy trunk, hollow trunk, a tree with an owl hole, a tree with a beehive. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel. Selesai dipotong 4 varian + animasi sway 8 frame ke `assets/img/nature/deepwood_*.png`.
### [ ] G075. pohon jarum
- Simpan: `assets/raw/gpt2/vegetasi/pohon_jarum.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 conifers: tall pine, short pine, cool blue-green fir, a dead pine. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G076. pohon rawa
- Simpan: `assets/raw/gpt2/vegetasi/pohon_rawa.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 swamp trees: twisted dead tree, mangrove with arching roots, weeping willow, hollow mangrove. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G077. pohon salju
- Simpan: `assets/raw/gpt2/vegetasi/pohon_salju.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 snow-covered trees: snowy pine, frosted round tree, bare frozen tree, ice-crusted fir. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G078. pohon istimewa
- Simpan: `assets/raw/gpt2/vegetasi/pohon_istimewa.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 special trees: a wish tree with hanging ribbons, a sacred old tree with a small shrine, a glowing spirit tree, a big village landmark tree. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G079. pohon kota
- Simpan: `assets/raw/gpt2/vegetasi/pohon_kota.png` · Ukuran di game: pohon 48–96 px tinggi
- Prompt: `[LAYOUT: OBJ 2x2] 4 town trees: small trimmed tree in a stone planter, row tree, flowering tree, topiary. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G080. semak
- Simpan: `assets/raw/gpt2/vegetasi/semak.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 bushes: round leafy bushes (light and dark), flowering bushes (white, pink, purple), berry bush, thorny bramble, small shrubs. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [x] G081. pakis
- Simpan: `assets/raw/gpt2/vegetasi/pakis.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 fern clumps and broad-leaf undergrowth in dark olive greens, small to large. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel. Selesai dipotong 16 varian + ekspor 6 sprite game ke `assets/img/nature/fern_*.png`.
### [x] G082. bunga liar
- Simpan: `assets/raw/gpt2/vegetasi/bunga_liar.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 wildflower clusters: white, yellow, pink, violet, blue, mixed. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel. Selesai dipotong 16 varian + ekspor 8 sprite game ke `assets/img/nature/flower_*.png`.
### [ ] G083. rumput tinggi
- Simpan: `assets/raw/gpt2/vegetasi/rumput_tinggi.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] tall grass clumps swaying: 4 different clumps × 4 frames each. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G084. ilalang
- Simpan: `assets/raw/gpt2/vegetasi/ilalang.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 reed and cattail clumps for water edges. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G085. jamur
- Simpan: `assets/raw/gpt2/vegetasi/jamur.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 mushrooms: single, clusters, glowing cave mushrooms, poisonous red ones, shelf fungus on a log. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G086. akar sulur
- Simpan: `assets/raw/gpt2/vegetasi/akar_sulur.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 pieces of roots, hanging vines, ivy patches and creepers. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G087. tunggul batang
- Simpan: `assets/raw/gpt2/vegetasi/tunggul_batang.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 stumps, fallen logs, broken branches, hollow logs, cut firewood. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G088. daun gugur
- Simpan: `assets/raw/gpt2/vegetasi/daun_gugur.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 fallen leaf piles and scattered leaves in autumn ochre, brown and green. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G089. tanaman air
- Simpan: `assets/raw/gpt2/vegetasi/tanaman_air.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 lily pads, lotus flowers, floating algae, water weeds. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G090. tanaman salju
- Simpan: `assets/raw/gpt2/vegetasi/tanaman_salju.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 frost flowers, ice grass, snowy shrubs, frozen berries. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G091. tanaman gua
- Simpan: `assets/raw/gpt2/vegetasi/tanaman_gua.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 cave plants: pale roots, glowing moss, luminous mushrooms, crystal sprouts. Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.
### [ ] G092. kebun kopi
- Simpan: `assets/raw/gpt2/vegetasi/kebun_kopi.png` · Ukuran di game: objek 8–32 px
- Prompt: `[LAYOUT: OBJ 2x4] 8 crop plants at full size: coffee shrub, tea bush, chili, tomato, corn, sunflower, grape vine, berry bush (2x4 grid). Each sits on the same baseline; soft contact shadow allowed only as a separate darker blob under the base (no long cast shadow).`
- Cek: Pangkal batang/akar di garis bawah sel; tidak terpotong tepi sel.

## D. Batu & alam
Obrolan "Alam".
### [ ] G093. batu besar
- Simpan: `assets/raw/gpt2/alam/batu_besar.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 large boulders with moss on top, warm grey stone.`
### [ ] G094. batu sedang
- Simpan: `assets/raw/gpt2/alam/batu_sedang.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 medium and small rocks, pebbles, flat stones.`
### [ ] G095. pilar batu
- Simpan: `assets/raw/gpt2/alam/pilar_batu.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 stone pillars and standing stones, one with carved runes.`
### [ ] G096. batu sungai
- Simpan: `assets/raw/gpt2/alam/batu_sungai.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 smooth river stones and stepping stones, wet highlights.`
### [ ] G097. kristal
- Simpan: `assets/raw/gpt2/alam/kristal.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 crystal clusters: purple, blue, gold, broken.`
### [ ] G098. stalagmit
- Simpan: `assets/raw/gpt2/alam/stalagmit.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 stalagmites and dripstones with a drip.`
### [ ] G099. batu geode
- Simpan: `assets/raw/gpt2/alam/batu_geode.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 special rocks: geode rock cracked open, fossil bed, ore vein rock, orchid growing on a rock.`
### [ ] G100. tumpukan batu
- Simpan: `assets/raw/gpt2/alam/tumpukan_batu.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 stone cairns and rock piles.`
### [ ] G101. es
- Simpan: `assets/raw/gpt2/alam/es.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 ice formations: ice chasm crack, ice fishing hole, icy boulder, frozen spike.`
### [ ] G102. tambang
- Simpan: `assets/raw/gpt2/alam/tambang.png` · Ukuran di game: batu 8–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 mining props: ore rock (iron), ore rock (gold), minecart, pickaxe stuck in rock.`

## E. Bangunan
Obrolan "Bangunan".
### [ ] G103. rumah a
- Simpan: `assets/raw/gpt2/bangunan/rumah_a.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] small cottage, timber frame and cream plaster, thatched roof, flower box. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G104. rumah b
- Simpan: `assets/raw/gpt2/bangunan/rumah_b.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] two-storey village house, red tile roof, wooden balcony. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G105. rumah c
- Simpan: `assets/raw/gpt2/bangunan/rumah_c.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] long farmhouse with a covered porch and firewood stack. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G106. rumah d
- Simpan: `assets/raw/gpt2/bangunan/rumah_d.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] stone cottage with a slate roof and chimney smoke. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G107. rumah coklat
- Simpan: `assets/raw/gpt2/bangunan/rumah_coklat.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] dark-wood hunter cabin with antlers above the door. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G108. rumah merah
- Simpan: `assets/raw/gpt2/bangunan/rumah_merah.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] red-roofed shop house with a hanging sign bracket (blank sign). Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G109. rumah arka
- Simpan: `assets/raw/gpt2/bangunan/rumah_arka.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] the hero's modest family home: small cottage with a vegetable patch and a mailbox. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G110. penginapan
- Simpan: `assets/raw/gpt2/bangunan/penginapan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] village inn: two storeys, warm windows, a blank hanging sign, benches outside. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G111. pandai besi
- Simpan: `assets/raw/gpt2/bangunan/pandai_besi.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] blacksmith workshop: open front with forge glow, anvil, chimney. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G112. balai desa
- Simpan: `assets/raw/gpt2/bangunan/balai_desa.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] village hall: larger timber building with a bell on the roof. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G113. akademi
- Simpan: `assets/raw/gpt2/bangunan/akademi.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] town academy: stone building with arched windows and a small tower. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G114. gerbang kota
- Simpan: `assets/raw/gpt2/bangunan/gerbang_kota.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] town gatehouse: stone arch with wooden doors and two small towers. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G115. tembok kota
- Simpan: `assets/raw/gpt2/bangunan/tembok_kota.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: STAMP 4x4] town wall pieces: straight horizontal, vertical, corner, damaged section, with walkway top. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G116. kincir angin
- Simpan: `assets/raw/gpt2/bangunan/kincir_angin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ANIM 4x1] windmill with 4-frame rotating sails. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G117. mercusuar
- Simpan: `assets/raw/gpt2/bangunan/mercusuar.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] lakeside lighthouse, white and red, small keeper hut. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G118. menara jam
- Simpan: `assets/raw/gpt2/bangunan/menara_jam.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] clockwork tower with a visible clock face and gears. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G119. kuil koi
- Simpan: `assets/raw/gpt2/bangunan/kuil_koi.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] small temple with a koi pond in front. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G120. kuil hutan
- Simpan: `assets/raw/gpt2/bangunan/kuil_hutan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] woodland shrine: stone base, wooden roof, offerings. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G121. pos jaga
- Simpan: `assets/raw/gpt2/bangunan/pos_jaga.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] wooden watchtower with a ladder. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G122. dermaga
- Simpan: `assets/raw/gpt2/bangunan/dermaga.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: STAMP 4x4] wooden pier pieces: straight, end, corner, posts, mooring rope, ladder. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G123. perahu
- Simpan: `assets/raw/gpt2/bangunan/perahu.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: OBJ 2x2] 4 boats: rowboat, fishing boat, docked boat with net, small raft. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G124. pasar
- Simpan: `assets/raw/gpt2/bangunan/pasar.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: OBJ 2x2] 4 market stalls with cloth canopies: fruit, fish, cloth, pottery. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G125. mulut gua
- Simpan: `assets/raw/gpt2/bangunan/mulut_gua.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] a cave entrance in a rock face with wooden support beams. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G126. reruntuhan
- Simpan: `assets/raw/gpt2/bangunan/reruntuhan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: STAMP 4x4] ancient ruin pieces: broken columns, collapsed arch, cracked floor tiles, statue base. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.
### [ ] G127. jembatan rusak
- Simpan: `assets/raw/gpt2/bangunan/jembatan_rusak.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: BUILDING] a broken wooden bridge over a gap, planks missing, rope hanging. Door clearly readable, front facing the camera (south).`
- Cek: Pintu menghadap bawah layar; tidak ada tulisan di papan.

## F. Properti desa, kota & dunia
Obrolan "Properti".
### [ ] G128. sumur air mancur
- Simpan: `assets/raw/gpt2/properti/sumur_air_mancur.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] stone well, village fountain (2 frames water), birdbath, water trough. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G129. bangku
- Simpan: `assets/raw/gpt2/properti/bangku.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] wooden bench, stone bench, scenic bench facing a view, picnic table. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G130. lampu
- Simpan: `assets/raw/gpt2/properti/lampu.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] lamp post, street gas lamp, standing brazier, wall torch. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G131. api unggun
- Simpan: `assets/raw/gpt2/properti/api_unggun.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: ANIM 4x2] campfire burning, 4 frames, with log ring. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G132. obor
- Simpan: `assets/raw/gpt2/properti/obor.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: ANIM 4x2] torch and brazier flames, 4 frames each (2 rows). Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G133. pagar
- Simpan: `assets/raw/gpt2/properti/pagar.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] picket fence piece, rail fence piece, stone low wall piece, gate. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G134. papan
- Simpan: `assets/raw/gpt2/properti/papan.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] blank signpost, notice board with blank papers, bounty board with blank posters, stone stele (no readable text). Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G135. kotak surat lonceng
- Simpan: `assets/raw/gpt2/properti/kotak_surat_lonceng.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] mailbox, village bell on a frame, weathervane, birdhouse on a pole. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G136. peti tong
- Simpan: `assets/raw/gpt2/properti/peti_tong.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x4] wooden crate, stacked crates, barrel, open barrel of water, explosive barrel marked with a red band, sack of grain. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G137. gerobak
- Simpan: `assets/raw/gpt2/properti/gerobak.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] hand cart, cart full of crates, merchant wagon, broken cart. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G138. kayu bakar
- Simpan: `assets/raw/gpt2/properti/kayu_bakar.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] woodpile, chopping block with axe, hay bale, stacked hay. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G139. latihan
- Simpan: `assets/raw/gpt2/properti/latihan.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] training dummy, archery target, knife-throwing target board, arm-wrestling table. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G140. dapur luar
- Simpan: `assets/raw/gpt2/properti/dapur_luar.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] outdoor clay oven, skewer campfire rack, coffee kettle over fire, tea table with cups. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G141. kerajinan
- Simpan: `assets/raw/gpt2/properti/kerajinan.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] crafting workbench, alchemy table with flasks, potter's wheel, wooden loom. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G142. olahan
- Simpan: `assets/raw/gpt2/properti/olahan.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] stone mortar and pestle, cheese barrel, honey pot, drying rack with herbs. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G143. pandai besi alat
- Simpan: `assets/raw/gpt2/properti/pandai_besi_alat.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] anvil, forge, bellows, quenching barrel. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G144. hiburan
- Simpan: `assets/raw/gpt2/properti/hiburan.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] high-striker strength test, ring-toss booth, street drum, violin on a stand. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G145. kotak musik teropong
- Simpan: `assets/raw/gpt2/properti/kotak_musik_teropong.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] music box on a pedestal, brass telescope on tripod, barber chair, viewpoint railing. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G146. altar kuil
- Simpan: `assets/raw/gpt2/properti/altar_kuil.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] stone altar, small totem pole, rune pillar glowing faintly, crystal shrine. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G147. benda cahaya
- Simpan: `assets/raw/gpt2/properti/benda_cahaya.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] glowing light shard (lumina shard) on a stand, memory mirror in a stone frame, wish tree ribbon post, ancient stele. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G148. brankas desa
- Simpan: `assets/raw/gpt2/properti/brankas_desa.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] village vault: iron-banded strongbox, treasure chest closed, treasure chest open, small chest. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G149. burung kota
- Simpan: `assets/raw/gpt2/properti/burung_kota.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: ANIM 4x2] pigeons pecking (4 frames), canary on a perch (4 frames). Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G150. pot tanaman
- Simpan: `assets/raw/gpt2/properti/pot_tanaman.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] flower planter box, clay pot with flowers, hanging basket, garden bed. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G151. rambu jalan
- Simpan: `assets/raw/gpt2/properti/rambu_jalan.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] road milestone, direction post with blank arrows, fallen sign, lantern on a pole. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G152. batas wilayah
- Simpan: `assets/raw/gpt2/properti/batas_wilayah.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] wooden archway marking a path, stone border marker, rope fence with posts, ruined gate posts. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G153. mancing
- Simpan: `assets/raw/gpt2/properti/mancing.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] fishing spot props: bucket of fish, fishing rod rack, net on poles, bait box. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G154. kandang
- Simpan: `assets/raw/gpt2/properti/kandang.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] chicken coop, animal pen fence, feed trough, small barn. Readable silhouettes at small size; no readable letters anywhere.`
### [ ] G155. ritual
- Simpan: `assets/raw/gpt2/properti/ritual.png` · Ukuran di game: objek 12–40 px
- Prompt: `[LAYOUT: OBJ 2x2] cauldron on fire, candle circle, stone circle, spirit lantern. Readable silhouettes at small size; no readable letters anywhere.`

## G. Markas goblin
Obrolan "Goblin".
### [ ] G156. markas goblin: palisade
- Simpan: `assets/raw/gpt2/goblin/palisade.png` · Ukuran di game: objek 24–64 px
- Prompt: `[LAYOUT: STAMP 4x4] spiked log palisade pieces: straight, corner, gate closed, gate open, broken section, watch platform. Crude, menacing, dirty.`
### [ ] G157. markas goblin: gubuk
- Simpan: `assets/raw/gpt2/goblin/gubuk.png` · Ukuran di game: objek 24–64 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 goblin huts made of patched hides, bones and sticks. Crude, menacing, dirty.`
### [ ] G158. markas goblin: menara
- Simpan: `assets/raw/gpt2/goblin/menara.png` · Ukuran di game: objek 24–64 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 goblin structures: lookout tower, cage with a prisoner silhouette, war banner pole, trophy totem. Crude, menacing, dirty.`
### [ ] G159. markas goblin: perkakas
- Simpan: `assets/raw/gpt2/goblin/perkakas.png` · Ukuran di game: objek 24–64 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 goblin props: crude forge, bubbling cauldron, loot pile, supply wagon. Crude, menacing, dirty.`
### [ ] G160. markas goblin: obor_goblin
- Simpan: `assets/raw/gpt2/goblin/obor_goblin.png` · Ukuran di game: objek 24–64 px
- Prompt: `[LAYOUT: ANIM 4x2] goblin skull torch and fire pit, 4 frames each. Crude, menacing, dirty.`
### [ ] G161. markas goblin: kuil_goblin
- Simpan: `assets/raw/gpt2/goblin/kuil_goblin.png` · Ukuran di game: objek 24–64 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 goblin shrine pieces: idol, bone altar, drum, painted rock. Crude, menacing, dirty.`

## H. NPC, warga & potret dialog
Obrolan "Karakter". Satu NPC = 2 tugas (sprite lalu potret) di obrolan yang sama.
### [ ] G162. NPC Tetua Bram: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/elder.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Tetua Bram": old village elder, long white beard, green-brown robe, wooden staff, kind but tired eyes.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G163. Potret dialog Tetua Bram
- Simpan: `assets/raw/gpt2/potret/elder.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Tetua Bram" (old village elder, long white beard, green-brown robe, wooden staff, kind but tired eyes): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G164. NPC Lina: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/girl.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Lina": young woman, the hero's childhood friend, short auburn hair with a ribbon, apron over a simple dress.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G165. Potret dialog Lina
- Simpan: `assets/raw/gpt2/potret/girl.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Lina" (young woman, the hero's childhood friend, short auburn hair with a ribbon, apron over a simple dress): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G166. NPC Pak Darto: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/farmer.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pak Darto": stocky farmer, straw hat, rolled sleeves, holding a hoe.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G167. Potret dialog Pak Darto
- Simpan: `assets/raw/gpt2/potret/farmer.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pak Darto" (stocky farmer, straw hat, rolled sleeves, holding a hoe): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G168. NPC Bu Sari: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/merchant.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Bu Sari": cheerful middle-aged shopkeeper woman, headscarf, coin pouch, colorful shawl.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G169. Potret dialog Bu Sari
- Simpan: `assets/raw/gpt2/potret/merchant.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Bu Sari" (cheerful middle-aged shopkeeper woman, headscarf, coin pouch, colorful shawl): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G170. NPC Dodi: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/child.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Dodi": small village boy, messy hair, patched shorts, wooden toy sword.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G171. Potret dialog Dodi
- Simpan: `assets/raw/gpt2/potret/child.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Dodi" (small village boy, messy hair, patched shorts, wooden toy sword): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G172. NPC Pak Besi: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/smith.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pak Besi": burly blacksmith, leather apron, soot on arms, bald with a thick beard.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G173. Potret dialog Pak Besi
- Simpan: `assets/raw/gpt2/potret/smith.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pak Besi" (burly blacksmith, leather apron, soot on arms, bald with a thick beard): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G174. NPC Bu Rina: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/inn.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Bu Rina": innkeeper woman, hair in a bun, carries a tray.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G175. Potret dialog Bu Rina
- Simpan: `assets/raw/gpt2/potret/inn.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Bu Rina" (innkeeper woman, hair in a bun, carries a tray): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G176. NPC Bu Laras: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/inn2.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Bu Laras": second innkeeper, older woman, shawl and ladle.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G177. Potret dialog Bu Laras
- Simpan: `assets/raw/gpt2/potret/inn2.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Bu Laras" (second innkeeper, older woman, shawl and ladle): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G178. NPC Pemburu Raka: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/hunter.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pemburu Raka": lean hunter, hooded cloak, bow on back, fur collar.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G179. Potret dialog Pemburu Raka
- Simpan: `assets/raw/gpt2/potret/hunter.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pemburu Raka" (lean hunter, hooded cloak, bow on back, fur collar): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G180. NPC Pertapa Sura: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/hermit.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pertapa Sura": hermit sage, ragged grey robe, prayer beads, long hair, barefoot.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G181. Potret dialog Pertapa Sura
- Simpan: `assets/raw/gpt2/potret/hermit.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pertapa Sura" (hermit sage, ragged grey robe, prayer beads, long hair, barefoot): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G182. NPC Penjaga Nila: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/nila.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Penjaga Nila": female guard, light armor, spear, ponytail.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G183. Potret dialog Penjaga Nila
- Simpan: `assets/raw/gpt2/potret/nila.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Penjaga Nila" (female guard, light armor, spear, ponytail): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G184. NPC Nenek Ratih: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/ratih.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Nenek Ratih": tiny old grandmother, hunched, cane, herb basket.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G185. Potret dialog Nenek Ratih
- Simpan: `assets/raw/gpt2/potret/ratih.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Nenek Ratih" (tiny old grandmother, hunched, cane, herb basket): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G186. NPC Pak Gun: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/gun.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pak Gun": old miner, helmet with candle, pickaxe.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G187. Potret dialog Pak Gun
- Simpan: `assets/raw/gpt2/potret/gun.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pak Gun" (old miner, helmet with candle, pickaxe): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G188. NPC Rudi: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/rudi.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Rudi": young apprentice, vest, satchel, eager pose.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G189. Potret dialog Rudi
- Simpan: `assets/raw/gpt2/potret/rudi.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Rudi" (young apprentice, vest, satchel, eager pose): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G190. NPC Guru Lestari: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/lestari.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Guru Lestari": teacher, long robe, book under arm, spectacles.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G191. Potret dialog Guru Lestari
- Simpan: `assets/raw/gpt2/potret/lestari.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Guru Lestari" (teacher, long robe, book under arm, spectacles): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G192. NPC Wati: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/wati.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Wati": young flower seller, basket of flowers, braids.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G193. Potret dialog Wati
- Simpan: `assets/raw/gpt2/potret/wati.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Wati" (young flower seller, basket of flowers, braids): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G194. NPC Darma: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/darma.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Darma": traveling scholar, wide hat, scroll case.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G195. Potret dialog Darma
- Simpan: `assets/raw/gpt2/potret/darma.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Darma" (traveling scholar, wide hat, scroll case): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G196. NPC Guru Akademi 1: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/ka4.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Guru Akademi 1": academy master of sword, armored coat, scar.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G197. Potret dialog Guru Akademi 1
- Simpan: `assets/raw/gpt2/potret/ka4.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Guru Akademi 1" (academy master of sword, armored coat, scar): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G198. NPC Guru Akademi 2: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/ka5.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Guru Akademi 2": academy master of magic, flowing robe, glowing staff tip.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G199. Potret dialog Guru Akademi 2
- Simpan: `assets/raw/gpt2/potret/ka5.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Guru Akademi 2" (academy master of magic, flowing robe, glowing staff tip): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G200. NPC Pedagang Pasar: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/kmerchant.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pedagang Pasar": town market trader, turban, ledger book.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G201. Potret dialog Pedagang Pasar
- Simpan: `assets/raw/gpt2/potret/kmerchant.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pedagang Pasar" (town market trader, turban, ledger book): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G202. NPC Pak Joko: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/joko.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pak Joko": ferryman, wide straw hat, oar.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G203. Potret dialog Pak Joko
- Simpan: `assets/raw/gpt2/potret/joko.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pak Joko" (ferryman, wide straw hat, oar): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G204. NPC Pedagang Bayu: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/bayu.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pedagang Bayu": wandering peddler with a huge backpack of goods.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G205. Potret dialog Pedagang Bayu
- Simpan: `assets/raw/gpt2/potret/bayu.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pedagang Bayu" (wandering peddler with a huge backpack of goods): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G206. NPC Sambo, Pemburu Gelap: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/sambo.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Sambo, Pemburu Gelap": shady poacher, dark hood, crossbow, sly grin.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G207. Potret dialog Sambo, Pemburu Gelap
- Simpan: `assets/raw/gpt2/potret/sambo.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Sambo, Pemburu Gelap" (shady poacher, dark hood, crossbow, sly grin): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G208. NPC Pak Teguh, Nelayan: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/pancing.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Pak Teguh, Nelayan": old fisherman, rain hat, fishing rod, fish basket.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G209. Potret dialog Pak Teguh, Nelayan
- Simpan: `assets/raw/gpt2/potret/pancing.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Pak Teguh, Nelayan" (old fisherman, rain hat, fishing rod, fish basket): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G210. NPC Kusir Kafilah: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/kafilah.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Kusir Kafilah": caravan driver, long coat, whip, goggles on hat.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G211. Potret dialog Kusir Kafilah
- Simpan: `assets/raw/gpt2/potret/kafilah.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Kusir Kafilah" (caravan driver, long coat, whip, goggles on hat): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G212. NPC Penjaga Gerbang 1: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/gj1.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Penjaga Gerbang 1": town gate guard, helmet, halberd, tabard.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G213. Potret dialog Penjaga Gerbang 1
- Simpan: `assets/raw/gpt2/potret/gj1.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Penjaga Gerbang 1" (town gate guard, helmet, halberd, tabard): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G214. NPC Penjaga Gerbang 2: jalan & diam 4 arah
- Simpan: `assets/raw/gpt2/npc/gj2.png` · Ukuran di game: tinggi ±30 px (sedikit lebih pendek dari Arka 33 px)
- Prompt: `[LAYOUT: CHAR 4x6] Original character "Penjaga Gerbang 2": second town gate guard, heavier, shield and sword.`
- Cek: Wajah & warna konsisten di 24 frame; ukuran sama tiap sel.
### [ ] G215. Potret dialog Penjaga Gerbang 2
- Simpan: `assets/raw/gpt2/potret/gj2.png` · Ukuran di game: potret 64×64 px di kotak dialog
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the same character "Penjaga Gerbang 2" (second town gate guard, heavier, shield and sword): neutral, happy, angry or serious, surprised or sad.`
- Cek: Sama dengan sprite NPC-nya.
### [ ] G216. Warga umum 1: young farmer man
- Simpan: `assets/raw/gpt2/npc/warga1.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: young farmer man.`
### [ ] G217. Warga umum 2: young village woman with a basket
- Simpan: `assets/raw/gpt2/npc/warga2.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: young village woman with a basket.`
### [ ] G218. Warga umum 3: old man with a pipe
- Simpan: `assets/raw/gpt2/npc/warga3.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: old man with a pipe.`
### [ ] G219. Warga umum 4: old woman with a shawl
- Simpan: `assets/raw/gpt2/npc/warga4.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: old woman with a shawl.`
### [ ] G220. Warga umum 5: teenage boy with a fishing pole
- Simpan: `assets/raw/gpt2/npc/warga5.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: teenage boy with a fishing pole.`
### [ ] G221. Warga umum 6: girl with a kite
- Simpan: `assets/raw/gpt2/npc/warga6.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: girl with a kite.`
### [ ] G222. Warga umum 7: town noble in a long coat
- Simpan: `assets/raw/gpt2/npc/warga7.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: town noble in a long coat.`
### [ ] G223. Warga umum 8: traveling bard with a lute
- Simpan: `assets/raw/gpt2/npc/warga8.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: CHAR 4x6] Original background villager: traveling bard with a lute.`
### [ ] G224. Arka: cek warna di gaya baru (opsional)
- Simpan: `assets/raw/gpt2/npc/arka_cek.png` · Ukuran di game: 33 px
- Prompt: `[LAYOUT: CHAR 4x6] Same hero as the attached Arka reference image (assets/reference/arka_ref.png), identical design and proportions, only re-lit with the warm golden lighting of the style key.`
- Cek: Hanya bila Arka terlihat terlalu dingin/terang di samping aset baru.
### [ ] G225. Potret dialog Arka
- Simpan: `assets/raw/gpt2/potret/arka.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Dialogue portraits of the hero Arka (attach assets/reference/arka_ref.png): neutral, determined, smiling, hurt.`
- Cek: Desain identik dengan sprite Arka.

## I. Musuh & bos
Obrolan "Musuh". Blok gaya musuh = blok gaya umum + blok GARANG di bawah. Varian warna TIDAK perlu dibuat: Slime Emas/Biru/Merah/Es/Racun/Api (dari Slime), Kelelawar Gua (dari Kelelawar), Serigala Salju & Taring Perak (dari Serigala), Golem Es & Golem Purba (dari Golem).
### [ ] G226. Musuh Slime
- Simpan: `assets/raw/enemy/slime.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Monster: jelly blob, translucent green with a darker core and dissolved bones inside.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G227. Musuh Peti Mimic
- Simpan: `assets/raw/enemy/mimic.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #13.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G228. Musuh Kelelawar
- Simpan: `assets/raw/enemy/bat.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #9.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G229. Musuh Tawon
- Simpan: `assets/raw/enemy/bee.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #3.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G230. Musuh Jamur Racun
- Simpan: `assets/raw/enemy/shroom.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #8.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G231. Musuh Bunga Pemakan
- Simpan: `assets/raw/enemy/plant.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #4.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G232. Musuh Tengkorak
- Simpan: `assets/raw/enemy/skel.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #10.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G233. Musuh Goblin
- Simpan: `assets/raw/enemy/goblin.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Monster: wiry goblin raider, patched leather, crude cleaver, yellow eyes, sharp ears.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G234. Musuh Goblin Pemanah
- Simpan: `assets/raw/enemy/goblin_archer.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Monster: goblin with a short bow and quiver, hood made of hide.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G235. Musuh Dukun Goblin
- Simpan: `assets/raw/enemy/goblin_shaman.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Monster: goblin shaman, bone mask, feathered staff, glowing green fetishes.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G236. Musuh Serigala
- Simpan: `assets/raw/enemy/wolf.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Monster: lean grey forest wolf, scarred muzzle, bristling fur.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G237. Musuh Ular
- Simpan: `assets/raw/enemy/snake.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #5.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G238. Musuh Babi Hutan
- Simpan: `assets/raw/enemy/boar.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #2.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G239. Musuh Katak Rawa
- Simpan: `assets/raw/enemy/frog.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #1 (perbaiki baris 5-6).`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G240. Musuh Wisp
- Simpan: `assets/raw/enemy/wisp.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #6.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G241. Musuh Salamander
- Simpan: `assets/raw/enemy/salam.png` · Ukuran di game: lihat TARGET_H di tools/gen_enemy.py
- Prompt: `[LAYOUT: ENEMY 4x6] Use the monster description from docs/PROMPT_MUSUH.md #11.`
- Cek: Garang (bukan imut), jumlah kaki/anggota badan benar di setiap frame, menghadap KANAN.
### [ ] G242. Musuh Hantu — SUDAH v1.44.1
- Simpan: `assets/raw/enemy/ghost.png` · Ukuran di game: -
- Prompt: `(sudah dipasang)`
- Cek: Lewati.
### [ ] G243. Musuh Golem — SUDAH v1.44.0
- Simpan: `assets/raw/enemy/golem.png` · Ukuran di game: -
- Prompt: `(sudah dipasang)`
- Cek: Lewati.
### [ ] G244. Bos Kepala Goblin: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/gchief_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: hulking goblin chieftain, spiked pauldrons, huge jagged cleaver, war paint. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G245. Bos Kepala Goblin: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/gchief_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: hulking goblin chieftain, spiked pauldrons, huge jagged cleaver, war paint. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G246. Potret bos Kepala Goblin
- Simpan: `assets/raw/gpt2/potret/gchief.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of hulking goblin chieftain, spiked pauldrons, huge jagged cleaver, war paint: calm threat, angry, enraged phase 2, defeated.`
### [ ] G247. Bos Ratu Jamur: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/squeen_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: towering fungal queen, mushroom crown, spore-veil cloak, root-like legs. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G248. Bos Ratu Jamur: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/squeen_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: towering fungal queen, mushroom crown, spore-veil cloak, root-like legs. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G249. Potret bos Ratu Jamur
- Simpan: `assets/raw/gpt2/potret/squeen.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of towering fungal queen, mushroom crown, spore-veil cloak, root-like legs: calm threat, angry, enraged phase 2, defeated.`
### [ ] G250. Bos Ular Raksasa: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/gsnake_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: giant serpent with armored scales and a horned head. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G251. Bos Ular Raksasa: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/gsnake_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: giant serpent with armored scales and a horned head. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G252. Potret bos Ular Raksasa
- Simpan: `assets/raw/gpt2/potret/gsnake.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of giant serpent with armored scales and a horned head: calm threat, angry, enraged phase 2, defeated.`
### [ ] G253. Bos Raja Goblin: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/gking_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: goblin king in a stolen rusted crown, fur mantle, two-handed spiked mace. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G254. Bos Raja Goblin: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/gking_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: goblin king in a stolen rusted crown, fur mantle, two-handed spiked mace. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G255. Potret bos Raja Goblin
- Simpan: `assets/raw/gpt2/potret/gking.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of goblin king in a stolen rusted crown, fur mantle, two-handed spiked mace: calm threat, angry, enraged phase 2, defeated.`
### [ ] G256. Bos Morgath: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/witch_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: corrupted sorceress, tattered dark robes, floating shards of black crystal, glowing eyes (original design). Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G257. Bos Morgath: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/witch_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: corrupted sorceress, tattered dark robes, floating shards of black crystal, glowing eyes (original design). Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G258. Potret bos Morgath
- Simpan: `assets/raw/gpt2/potret/witch.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of corrupted sorceress, tattered dark robes, floating shards of black crystal, glowing eyes (original design): calm threat, angry, enraged phase 2, defeated.`
### [ ] G259. Bos Naga Es Kryos: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/kryos_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: ice dragon, crystalline frost spikes, pale blue scales, freezing breath glow in the throat. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G260. Bos Naga Es Kryos: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/kryos_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: ice dragon, crystalline frost spikes, pale blue scales, freezing breath glow in the throat. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G261. Potret bos Naga Es Kryos
- Simpan: `assets/raw/gpt2/potret/kryos.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of ice dragon, crystalline frost spikes, pale blue scales, freezing breath glow in the throat: calm threat, angry, enraged phase 2, defeated.`
### [ ] G262. Bos Raja Slime Mahkota: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/king_slime_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: enormous slime with a crown sunk inside it and swallowed swords. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G263. Bos Raja Slime Mahkota: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/king_slime_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: enormous slime with a crown sunk inside it and swallowed swords. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G264. Potret bos Raja Slime Mahkota
- Simpan: `assets/raw/gpt2/potret/king_slime.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of enormous slime with a crown sunk inside it and swallowed swords: calm threat, angry, enraged phase 2, defeated.`
### [ ] G265. Bos Raja Rawa Toksin: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/bounty_frog_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: giant toxic toad elite, purple warts, poison sacs. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G266. Bos Raja Rawa Toksin: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/bounty_frog_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: giant toxic toad elite, purple warts, poison sacs. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G267. Potret bos Raja Rawa Toksin
- Simpan: `assets/raw/gpt2/potret/bounty_frog.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of giant toxic toad elite, purple warts, poison sacs: calm threat, angry, enraged phase 2, defeated.`
### [ ] G268. Bos Gargoyle Merah: lembar 1 (gerak & serangan dasar)
- Simpan: `assets/raw/enemy/bounty_gargoyle_1.png` · Ukuran di game: 2–3× tinggi Arka
- Prompt: `[LAYOUT: BOSS 4x6 A] Boss: red stone gargoyle, bat wings, horned, cracked lava veins. Rows: 1 idle, 2 move, 3 attack A wind-up, 4 attack A strike, 5 attack B wind-up, 6 attack B strike.`
- Cek: Ancang-ancang tiap serangan sangat jelas & berbeda.
### [ ] G269. Bos Gargoyle Merah: lembar 2 (fase 2, terhuyung, mati)
- Simpan: `assets/raw/enemy/bounty_gargoyle_2.png` · Ukuran di game: sama dengan lembar 1
- Prompt: `[LAYOUT: BOSS 4x6 B] Same boss: red stone gargoyle, bat wings, horned, cracked lava veins. Rows: 1 phase-change roar (enraged, glowing), 2 enraged move, 3 special attack wind-up, 4 special attack, 5 staggered/kneeling (4 frames), 6 death (4 frames, last = defeated on the ground).`
- Cek: Desain identik dengan lembar 1.
### [ ] G270. Potret bos Gargoyle Merah
- Simpan: `assets/raw/gpt2/potret/bounty_gargoyle.png` · Ukuran di game: 64×64 px
- Prompt: `[LAYOUT: PORTRAIT 2x2] Menacing boss portraits of red stone gargoyle, bat wings, horned, cracked lava veins: calm threat, angry, enraged phase 2, defeated.`

## J. Hewan
Obrolan "Hewan".
### [ ] G271. Hewan: rusa
- Simpan: `assets/raw/gpt2/hewan/rusa.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: deer. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G272. Hewan: kelinci
- Simpan: `assets/raw/gpt2/hewan/kelinci.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: rabbit. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G273. Hewan: tupai
- Simpan: `assets/raw/gpt2/hewan/tupai.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: squirrel. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G274. Hewan: bebek
- Simpan: `assets/raw/gpt2/hewan/bebek.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: duck (land and swimming). Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G275. Hewan: burung hantu
- Simpan: `assets/raw/gpt2/hewan/burung_hantu.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: owl. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G276. Hewan: rubah
- Simpan: `assets/raw/gpt2/hewan/rubah.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: fox. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G277. Hewan: kucing
- Simpan: `assets/raw/gpt2/hewan/kucing.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: house cat (pet). Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G278. Hewan: anjing
- Simpan: `assets/raw/gpt2/hewan/anjing.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: village dog (pet). Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G279. Hewan: domba
- Simpan: `assets/raw/gpt2/hewan/domba.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: sheep. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G280. Hewan: sapi
- Simpan: `assets/raw/gpt2/hewan/sapi.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: cow. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G281. Hewan: ayam
- Simpan: `assets/raw/gpt2/hewan/ayam.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: chicken and chicks. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G282. Hewan: kupu
- Simpan: `assets/raw/gpt2/hewan/kupu.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: butterflies in 4 colors (flying). Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G283. Hewan: burung terbang
- Simpan: `assets/raw/gpt2/hewan/burung_terbang.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: small birds flying overhead with their ground shadow. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G284. Hewan: kunang
- Simpan: `assets/raw/gpt2/hewan/kunang.png` · Ukuran di game: hewan kecil 8–24 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Peaceful wildlife: fireflies (glow blobs) and moths. Rows: 1 idle (look around), 2 walk, 3 run/flee, 4 special (eat, peck, groom).`
- Cek: Imut boleh untuk hewan damai; ukuran sama tiap frame.
### [ ] G285. Ikan untuk koleksi pancing
- Simpan: `assets/raw/gpt2/hewan/ikan.png` · Ukuran di game: ikon 16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 different freshwater, lake, swamp and legendary fish seen from the side, plus an old boot.`

## K. Efek visual (VFX)
Obrolan "Efek". Latar HITAM, bukan magenta.
### [ ] G286. Efek: tebas pedang
- Simpan: `assets/raw/gpt2/vfx/tebas_pedang.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] three sword slash arcs for a 3-hit combo: crescent swooshes, pale gold-white, 4 frames each (rows 1-3), row 4 finisher overhead chop arc.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G287. Efek: tusuk tombak
- Simpan: `assets/raw/gpt2/vfx/tusuk_tombak.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] spear thrust streaks: straight lance flash, 4 frames, plus a sweeping spear arc.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G288. Efek: belah kapak
- Simpan: `assets/raw/gpt2/vfx/belah_kapak.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] heavy axe cleave: wide thick arc with dust, 4 frames, plus ground impact.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G289. Efek: panah
- Simpan: `assets/raw/gpt2/vfx/panah.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] arrow in flight (4 rotations), arrow trail streak, arrow hit spark, charged arrow glow.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G290. Efek: serangan berat
- Simpan: `assets/raw/gpt2/vfx/serangan_berat.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] charge-up glow gathering into the hands (4 frames), release burst (4 frames), spinning slash ring (8 frames).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G291. Efek: benturan
- Simpan: `assets/raw/gpt2/vfx/benturan.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] hit impacts: normal hit spark burst, critical hit star burst, blocked/parry clang flash, heavy smash shockwave, 4 frames each.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G292. Efek: debu
- Simpan: `assets/raw/gpt2/vfx/debu.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] dust effects: dodge-roll dust crescent swoosh on the ground, footstep puff, landing ring of dust, skid trail, 4 frames each.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G293. Efek: tanda bahaya
- Simpan: `assets/raw/gpt2/vfx/tanda_bahaya.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] enemy telegraph markers on the ground: thin red circle shrinking (4 frames), red cone for frontal attacks, red line for charge, filled red area pulse.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G294. Efek: kawah
- Simpan: `assets/raw/gpt2/vfx/kawah.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] ground crater and crack marks after a heavy slam, 4 sizes, plus rock debris chunks.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G295. Efek: api
- Simpan: `assets/raw/gpt2/vfx/api.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] fireball projectile loop (4), fire explosion (8), burning ground patch loop (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G296. Efek: es
- Simpan: `assets/raw/gpt2/vfx/es.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] ice shard projectile (4), frost nova ring (8), frozen block overlay for a frozen enemy (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G297. Efek: cahaya suci
- Simpan: `assets/raw/gpt2/vfx/cahaya_suci.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] holy lantern light: warm golden radiant burst (8), light beams column (4), sparkle motes (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G298. Efek: racun
- Simpan: `assets/raw/gpt2/vfx/racun.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] poison spit glob (4), toxic cloud puff loop (8), bubbling poison puddle (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G299. Efek: petir
- Simpan: `assets/raw/gpt2/vfx/petir.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] lightning strike from above (8), electric arc chain (4), static sparks (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G300. Efek: sembuh
- Simpan: `assets/raw/gpt2/vfx/sembuh.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] healing: rising green motes and leaves (8), healing ring (4), flask drink glow (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G301. Efek: naik level
- Simpan: `assets/raw/gpt2/vfx/naik_level.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] level-up: golden pillar of light (8), expanding ring (4), star burst (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G302. Efek: mati musuh
- Simpan: `assets/raw/gpt2/vfx/mati_musuh.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] enemy death: white flash then soul motes rising (8), dark corruption wisps for bosses (8).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G303. Efek: ambil barang
- Simpan: `assets/raw/gpt2/vfx/ambil_barang.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] item pickup: coin sparkle (4), loot beam by rarity white/green/blue/purple/gold (4 frames each).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G304. Efek: peti buka
- Simpan: `assets/raw/gpt2/vfx/peti_buka.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] chest opening glow rays (8) and floating sparkles (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G305. Efek: status
- Simpan: `assets/raw/gpt2/vfx/status.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] small status markers above a head: burning flame, poison bubbles, frozen snowflake, stagger swirl (no comic stars), enrage red aura, sleep — 4 frames each.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G306. Efek: air
- Simpan: `assets/raw/gpt2/vfx/air.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] splash when entering water (8), wake ripples behind a swimmer (4), fishing bobber plop (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G307. Efek: cuaca
- Simpan: `assets/raw/gpt2/vfx/cuaca.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] rain streak sprites (4 lengths), rain splash on ground (4), snowflakes (8 shapes), falling leaves (8 shapes).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G308. Efek: suasana
- Simpan: `assets/raw/gpt2/vfx/suasana.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] atmosphere particles: pollen and dust motes (8), fireflies glow (4), embers (4), mist wisps (4).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G309. Efek: sinar matahari
- Simpan: `assets/raw/gpt2/vfx/sinar_matahari.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] soft diagonal sun shafts coming from the upper left, 4 different shafts, very soft edges.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G310. Efek: bayangan awan
- Simpan: `assets/raw/gpt2/vfx/bayangan_awan.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] 4 large soft cloud shadow blobs (very soft, will be drawn at low opacity).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G311. Efek: kabut
- Simpan: `assets/raw/gpt2/vfx/kabut.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] 4 large soft fog sheets that can tile horizontally.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G312. Efek: teleport
- Simpan: `assets/raw/gpt2/vfx/teleport.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] teleport statue activation: rune circle (8), vanish beam (8), arrive burst (8).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G313. Efek: jejak cahaya
- Simpan: `assets/raw/gpt2/vfx/jejak_cahaya.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] dropped light trace marker on the ground: glowing gravestone-shaped light marker with orbiting motes (8 frames).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G314. Efek: sihir lingkar
- Simpan: `assets/raw/gpt2/vfx/sihir_lingkar.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] magic rune circles under the caster for 4 schools: fire, ice, light, nature (4 frames each).`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).
### [ ] G315. Efek: ledakan tong
- Simpan: `assets/raw/gpt2/vfx/ledakan_tong.png` · Ukuran di game: efek 8–64 px
- Prompt: `[LAYOUT: VFX 4x4] barrel explosion (8 frames) with smoke and debris.`
- Cek: Latar HITAM pekat (bukan magenta) — game memakai mode cahaya tambah (ADD).

## L. Antarmuka (UI)
Obrolan "UI".
### [ ] G316. UI: hud bingkai
- Simpan: `assets/raw/gpt2/ui/hud_bingkai.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] HUD frame: dark wood and brass frame for HP, MP and stamina bars, with empty bar slots. No letters or words anywhere (the game adds text).`
### [ ] G317. UI: bar
- Simpan: `assets/raw/gpt2/ui/bar.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] bar fills: HP red, MP blue, stamina gold, EXP green; each as left cap, middle tile, right cap; plus damage-trail white. No letters or words anywhere (the game adds text).`
### [ ] G318. UI: tombol aksi
- Simpan: `assets/raw/gpt2/ui/tombol_aksi.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] round touch buttons: attack (sword icon), magic (spark icon), dash (double chevron), potion (heart flask), interact (hand), with pressed state. No letters or words anywhere (the game adds text).`
### [ ] G319. UI: joystick
- Simpan: `assets/raw/gpt2/ui/joystick.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] virtual joystick base ring and knob, semi-transparent style, two sizes. No letters or words anywhere (the game adds text).`
### [ ] G320. UI: tombol menu
- Simpan: `assets/raw/gpt2/ui/tombol_menu.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] small rounded tab buttons for BAG, MAP, MENU (icon only, no letters) with normal and pressed state. No letters or words anywhere (the game adds text).`
### [ ] G321. UI: kotak dialog
- Simpan: `assets/raw/gpt2/ui/kotak_dialog.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] dialogue box 9-slice frame (parchment inside dark wood), name tag plate, next-arrow indicator (4 frames). No letters or words anywhere (the game adds text).`
### [ ] G322. UI: kotak pilihan
- Simpan: `assets/raw/gpt2/ui/kotak_pilihan.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] choice list panel 9-slice, selected-row highlight, cursor hand. No letters or words anywhere (the game adds text).`
### [ ] G323. UI: panel menu
- Simpan: `assets/raw/gpt2/ui/panel_menu.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] large menu panel 9-slice, tab headers, divider line, scroll bar. No letters or words anywhere (the game adds text).`
### [ ] G324. UI: slot item
- Simpan: `assets/raw/gpt2/ui/slot_item.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] inventory slot frames: empty, selected, rarity borders (common, uncommon, rare, epic, legendary), equipped tick. No letters or words anywhere (the game adds text).`
### [ ] G325. UI: kartu misi
- Simpan: `assets/raw/gpt2/ui/kartu_misi.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] quest tracker card frame, main quest star badge, side quest leaf badge, objective bullet. No letters or words anywhere (the game adds text).`
### [ ] G326. UI: bar bos
- Simpan: `assets/raw/gpt2/ui/bar_bos.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] boss health bar frame with ornate ends, phase notch markers. No letters or words anywhere (the game adds text).`
### [ ] G327. UI: banner wilayah
- Simpan: `assets/raw/gpt2/ui/banner_wilayah.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] area-entered banner frame (scroll/plaque), decorative ends. No letters or words anywhere (the game adds text).`
### [ ] G328. UI: peta bingkai
- Simpan: `assets/raw/gpt2/ui/peta_bingkai.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] world map frame, map pins (player, quest, teleport, shop, inn, danger, light trace). No letters or words anywhere (the game adds text).`
### [ ] G329. UI: minimap
- Simpan: `assets/raw/gpt2/ui/minimap.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] round minimap frame with compass N marker. No letters or words anywhere (the game adds text).`
### [ ] G330. UI: toast
- Simpan: `assets/raw/gpt2/ui/toast.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] small notification toast frame and icons: item gained, level up, quest updated, warning. No letters or words anywhere (the game adds text).`
### [ ] G331. UI: layar judul
- Simpan: `assets/raw/gpt2/ui/layar_judul.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] title screen background art: the village at golden hour seen from a hill (no text), plus an empty logo plaque. No letters or words anywhere (the game adds text).`
### [ ] G332. UI: kursor target
- Simpan: `assets/raw/gpt2/ui/kursor_target.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] lock-on target marker (4 frames), interact prompt bubble, exclamation alert marker. No letters or words anywhere (the game adds text).`
### [ ] G333. UI: angka damage
- Simpan: `assets/raw/gpt2/ui/angka_damage.png` · Ukuran di game: sesuai layar 844×390
- Prompt: `[LAYOUT: UI] pixel number glyphs 0-9 for damage in white, critical gold, heal green, plus "+" and "-" signs. No letters or words anywhere (the game adds text).`

## M. Ikon
Obrolan "Ikon".
### [ ] G334. Ikon: senjata
- Simpan: `assets/raw/gpt2/ikon/senjata.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 weapon icons: swords, spears, axes, bows from wooden to legendary. Same lighting and outline for all icons.`
### [ ] G335. Ikon: zirah
- Simpan: `assets/raw/gpt2/ikon/zirah.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 armor and accessory icons: tunics, leather and metal armor, cloaks, rings, amulets, boots, hats. Same lighting and outline for all icons.`
### [ ] G336. Ikon: ramuan
- Simpan: `assets/raw/gpt2/ikon/ramuan.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 consumable icons: potions (red, blue, green, gold), light flask, elixirs, bombs, scrolls. Same lighting and outline for all icons.`
### [ ] G337. Ikon: makanan
- Simpan: `assets/raw/gpt2/ikon/makanan.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 food icons: bread, soups, grilled fish, skewers, cakes, fruits, tea, coffee. Same lighting and outline for all icons.`
### [ ] G338. Ikon: bahan
- Simpan: `assets/raw/gpt2/ikon/bahan.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 material icons: wood, stone, ores, ingots, hides, bones, slime gel, ectoplasm, feathers, herbs, crystals. Same lighting and outline for all icons.`
### [ ] G339. Ikon: benih panen
- Simpan: `assets/raw/gpt2/ikon/benih_panen.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 seed bag and crop icons. Same lighting and outline for all icons.`
### [ ] G340. Ikon: kunci misi
- Simpan: `assets/raw/gpt2/ikon/kunci_misi.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 quest and key item icons: keys, letters, relic fragments, maps, badges, light shards. Same lighting and outline for all icons.`
### [ ] G341. Ikon: perabot
- Simpan: `assets/raw/gpt2/ikon/perabot.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 furniture icons for the home shop. Same lighting and outline for all icons.`
### [ ] G342. Ikon: jurus
- Simpan: `assets/raw/gpt2/ikon/jurus.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 skill icons for 7 combat arts and 5 teachers, plus passive skills. Same lighting and outline for all icons.`
### [ ] G343. Ikon: status ikon
- Simpan: `assets/raw/gpt2/ikon/status_ikon.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 small status and buff icons (burn, poison, chill, regen, attack up, defense up, speed up, warm, etc.). Same lighting and outline for all icons.`
### [ ] G344. Ikon: pencapaian
- Simpan: `assets/raw/gpt2/ikon/pencapaian.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 achievement badge icons (bronze, silver, gold frames with symbols). Same lighting and outline for all icons.`
### [ ] G345. Ikon: ekonomi
- Simpan: `assets/raw/gpt2/ikon/ekonomi.png` · Ukuran di game: ikon 16×16 px
- Prompt: `[LAYOUT: ICON 6x6] 36 economy icons: coins, gem, receipts, shop scales, bounty poster, fame star, reputation laurel. Same lighting and outline for all icons.`

## N. Hutan alami (tambahan 17-11-2026)
Obrolan "Vegetasi" (lanjutan). Tujuan: pohon terlihat tumbuh dari tanah, kanopi menyatu, lantai & tumbuhan berubah dari pinggir ke inti hutan, dan ada penghalang alami. Kerjakan setelah G001 & bagian C.

### [ ] G346. Gambar patokan: hutan dari pinggir ke inti
- Simpan: `assets/raw/gpt2/patokan/hutan_kedalaman.png` · Ukuran di game: bukan untuk dipotong (acuan suasana)
- Prompt: `[LAYOUT: CONCEPT] Concept frame showing a forest getting deeper from left to right: left = sunny forest edge with young trees, grass and flowers; middle = dense mature forest, shaded floor, ferns, roots crossing the path; right = ancient dark core with giant mossy trees, mist and faint magical glow. One small original adventurer for scale.`
- Cek: Perubahan dari pinggir ke inti terlihat jelas dari warna, cahaya, ukuran pohon dan lantai.

### [ ] G347. Pangkal pohon: akar menjalar & lumut
- Simpan: `assets/raw/gpt2/vegetasi/pangkal_pohon.png` · Ukuran di game: lebar 24–48 px, tinggi 8–16 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 tree base pieces drawn WITHOUT the trunk above: root flares spreading into the ground, moss collars, small ferns and grass hugging the base, a few with exposed roots and pebbles. Flat to the ground, wider than tall; the center top is left open where a trunk will stand.`
- Cek: Hanya bagian tanah/akar; tidak ada batang. Bisa ditaruh di bawah pohon mana pun.

### [ ] G348. Pangkal pohon raksasa
- Simpan: `assets/raw/gpt2/vegetasi/pangkal_raksasa.png` · Ukuran di game: lebar 64–96 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 huge tree bases for giant ancient trees: thick buttress roots arching over the ground, moss, mushrooms between roots, one with a hollow, one with a small spring. Without the upper trunk.`
- Cek: Akar cukup besar untuk jadi penghalang jalan.

### [ ] G349. Kanopi penyambung (tanpa batang)
- Simpan: `assets/raw/gpt2/vegetasi/kanopi_sambung.png` · Ukuran di game: lebar 64–128 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 large leafy canopy masses WITHOUT trunks, seen from above at 3/4 angle, irregular organic outlines, sunlit tops and deep shaded undersides, designed to overlap neighboring trees and close gaps in a dense forest roof.`
- Cek: Tepinya tidak bulat sempurna; bisa ditumpuk dengan kanopi pohon lain.

### [ ] G350. Kanopi tepi atap hutan
- Simpan: `assets/raw/gpt2/vegetasi/kanopi_tepi.png` · Ukuran di game: potongan 32–64 px
- Prompt: `[LAYOUT: STAMP 4x4] Canopy edge pieces for a continuous forest roof: straight edges facing down, up, left and right, outer corners, inner corners, and four ragged gap fillers. Leaves only, no trunks.`
- Cek: Tepi bawah kanopi (yang menghadap kamera) paling detail.

### [ ] G351. Bayangan kanopi di lantai
- Simpan: `assets/raw/gpt2/vegetasi/bayangan_kanopi.png` · Ukuran di game: 256×256 px (diulang, digambar transparan)
- Prompt: `[LAYOUT: SEAMLESS] Seamless dappled shade pattern for a forest floor: soft dark leaf-shadow shapes with small sunlit gaps, drawn in flat dark olive on a pure white background (the game will use it as a shadow mask). Pixel clusters, no blur.`
- Cek: Saat diulang tidak terlihat sambungan; hanya 2 warna (gelap & putih).

### [ ] G352. Anakan pohon
- Simpan: `assets/raw/gpt2/vegetasi/anakan.png` · Ukuran di game: tinggi 12–24 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 tree saplings and seedlings: thin stems with a few leaves, small young bushes turning into trees, a sapling with a protective stick, a sprouting acorn.`

### [ ] G353. Pohon muda
- Simpan: `assets/raw/gpt2/vegetasi/pohon_muda.png` · Ukuran di game: tinggi 32–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 young forest trees: slender trunks, small airy canopies with light passing through, slightly different species (oak-like, birch-like with pale bark, chestnut-like, maple-like).`
- Cek: Lebih kecil & lebih terang dari pohon dewasa.

### [ ] G354. Pohon dewasa variasi spesies
- Simpan: `assets/raw/gpt2/vegetasi/pohon_dewasa_b.png` · Ukuran di game: tinggi 64–80 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 mature forest trees of different species from the earlier forest trees: pale-barked birch-like tree, broad chestnut-like tree, tall ash-like tree, a leaning tree with a split trunk.`
- Cek: Siluet tiap pohon berbeda jelas.

### [ ] G355. Pohon raksasa akar terbuka
- Simpan: `assets/raw/gpt2/vegetasi/pohon_raksasa.png` · Ukuran di game: tinggi 96–128 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 giant ancient forest trees: massive trunks with exposed roots, vines and moss, canopies that would cover a whole clearing, one with a doorway-like hollow, one with glowing mushrooms on the bark.`

### [ ] G356. Tumbuhan bawah rapat
- Simpan: `assets/raw/gpt2/vegetasi/semak_tinggi.png` · Ukuran di game: tinggi 16–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 dense understory clumps: tall ferns, thick head-high bushes, tangled shrubs, young bamboo-like stems, wild grasses gone to seed. Dark shaded bottoms, sunlit tips.`
- Cek: Cukup tinggi untuk menutupi sebagian badan karakter.

### [ ] G357. Tumbuhan berdaun lebar
- Simpan: `assets/raw/gpt2/vegetasi/daun_lebar.png` · Ukuran di game: tinggi 12–28 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 broad-leaf forest floor plants: huge heart-shaped leaves, wide lily-like leaves, hosta-like clumps, giant clover, wild ginger, leafy plants with small flowers.`

### [ ] G358. Dinding semak tepi jalan
- Simpan: `assets/raw/gpt2/vegetasi/pagar_semak.png` · Ukuran di game: potongan 32×24 px
- Prompt: `[LAYOUT: STAMP 4x4] Natural thicket wall pieces made of tangled bushes, ferns and brambles for lining forest paths: horizontal piece, vertical piece, corners, ends, a gap with a small opening, a variant with flowers, a variant with thorns.`
- Cek: Harus terlihat tumbuh alami, bukan pagar yang dipangkas.

### [ ] G359. Tepi jalan setapak hutan (tidak rapi)
- Simpan: `assets/raw/gpt2/tanah/hutan_tepi_jalan.png` · Ukuran di game: potongan ±32×32 px
- Prompt: `[LAYOUT: STAMP 4x4] Messy forest path edges where grass, ferns and moss creep onto a dirt path: straight edges facing up, right, down, left, outer corners, inner corners, and four tufts of grass growing in the middle of the path. Only the vegetation is drawn; the path area is magenta.`
- Cek: Tepinya menjorok tidak rata; beberapa daun & rumput keluar ke jalan.

### [ ] G360. Akar melintang jalan
- Simpan: `assets/raw/gpt2/vegetasi/akar_melintang.png` · Ukuran di game: panjang 16–48 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 roots crossing a forest path: thin roots, thick roots rising out of the ground and diving back in, roots with moss, horizontal and diagonal directions. Flat, low to the ground.`

### [ ] G361. Daun gugur & jejak di jalan
- Simpan: `assets/raw/gpt2/tanah/hutan_jejak.png` · Ukuran di game: 6–24 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 small path details: scattered fallen leaves, leaf piles, muddy footprints, hoof prints, small puddles, broken twigs, acorns and pine cones, a lost feather.`

### [ ] G362. Pohon tumbang melintang (penghalang)
- Simpan: `assets/raw/gpt2/alam/pohon_tumbang.png` · Ukuran di game: panjang 48–96 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 large fallen trees lying across the ground: one horizontal, one diagonal, one broken in two with a gap you could squeeze through, one overgrown with moss and mushrooms. Roots of the fallen tree visible at one end.`
- Cek: Cukup besar untuk menghalangi jalan (dipakai sebagai tembok alami).

### [ ] G363. Batang berlubang & sarang
- Simpan: `assets/raw/gpt2/alam/batang_sarang.png` · Ukuran di game: 16–48 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 forest story objects: hollow log big enough to crawl through, tree stump with an animal den, bird nest in a broken branch on the ground, beehive hanging from a low branch.`

### [ ] G364. Batu besar berlumut setengah terkubur
- Simpan: `assets/raw/gpt2/alam/batu_lumut.png` · Ukuran di game: 24–64 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 large mossy boulders half sunk into the forest floor, ferns growing around them, one with an old carved mark, one split by a tree root.`

### [ ] G365. Sisa-sisa cerita hutan
- Simpan: `assets/raw/gpt2/alam/sisa_hutan.png` · Ukuran di game: 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 small story remains in a forest: animal skull and bones, abandoned campfire ring, arrows stuck in a tree root, torn cloth on a branch, rusty sword in moss, broken cart wheel, old trap, fallen lantern, scattered coins, a weathered wooden marker.`
- Cek: Tidak ada tulisan; gaya gelap tapi tidak sadis.

### [ ] G366. Tanah hutan gelap
- Simpan: `assets/raw/gpt2/tanah/hutan_gelap.png` · Ukuran di game: 256×256 px (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless dark forest soil texture with small roots, decayed leaf bits and tiny moss spots.`
- Cek: Mulus saat diulang.

### [ ] G367. Lumpur hutan
- Simpan: `assets/raw/gpt2/tanah/hutan_lumpur.png` · Ukuran di game: 256×256 px (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless wet forest mud texture with shallow puddles and footprints, dark brown and olive.`

### [ ] G368. Hamparan daun gugur
- Simpan: `assets/raw/gpt2/tanah/hutan_daun.png` · Ukuran di game: 256×256 px (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless carpet of fallen leaves on a forest floor, mostly ochre, brown and dull green leaves.`

### [ ] G369. Karpet lumut
- Simpan: `assets/raw/gpt2/tanah/hutan_lumut.png` · Ukuran di game: 256×256 px (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless thick moss carpet texture, deep green with lighter cushions and tiny sprouts.`

### [ ] G370. Tepi antar lantai hutan
- Simpan: `assets/raw/gpt2/tanah/hutan_tepi_lantai.png` · Ukuran di game: potongan ±32×32 px
- Prompt: `[LAYOUT: STAMP 4x4] Soft organic transition pieces where moss and leaf litter spread over dark forest soil: straight edges facing up, right, down, left, outer corners, inner corners, four small moss islands. Only the moss/leaf part is drawn; the rest is magenta.`

### [ ] G371. Akar raksasa pembatas jalur
- Simpan: `assets/raw/gpt2/vegetasi/akar_raksasa.png` · Ukuran di game: tebal 16–24 px
- Prompt: `[LAYOUT: STAMP 4x4] Giant root barrier pieces that wall off forest areas: long horizontal root, long vertical root, corners, T-junction, root end diving into the ground, root arch you can walk under, broken root with a gap. Thick, mossy, clearly impassable.`
- Cek: Terbaca jelas sebagai halangan, tapi tetap alami (bukan tembok).

### [ ] G372. Rumput tinggi tersibak
- Simpan: `assets/raw/gpt2/vegetasi/rumput_sibak.png` · Ukuran di game: tinggi 16–20 px
- Prompt: `[LAYOUT: ANIM 4x2] Row 1: a tall grass clump parting when someone walks through it (4 frames: still, pushed apart, fully parted, springing back). Row 2: a fern clump doing the same.`

### [ ] G373. Dahan lapisan depan
- Simpan: `assets/raw/gpt2/vegetasi/dahan_depan.png` · Ukuran di game: lebar 96–192 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 overhanging leafy branches seen very close to the camera, drawn as dark olive silhouettes with a few lit leaf edges: branch reaching from the left, from the right, from the top, and a hanging vine curtain. They will be drawn above everything.`
- Cek: Gelap & sederhana agar tidak menutupi permainan.

### [ ] G374. Pohon inti hutan magis
- Simpan: `assets/raw/gpt2/vegetasi/pohon_inti.png` · Ukuran di game: tinggi 96–128 px
- Prompt: `[LAYOUT: OBJ 2x2] 4 trees of a cursed magical forest core: twisted dark bark, faintly glowing teal or violet veins, sparse ashen leaves, one with crystals growing from it, one with hanging spirit lanterns of light.`
- Cek: Langsung terasa "berbahaya" dibanding pohon biasa.

### [ ] G375. Tanah inti terkutuk
- Simpan: `assets/raw/gpt2/tanah/hutan_inti.png` · Ukuran di game: 256×256 px (diulang)
- Prompt: `[LAYOUT: SEAMLESS] Seamless cursed forest floor: dark violet-grey soil, withered grass, thin glowing cracks, small dead leaves.`

### [ ] G376. Tumbuhan inti magis
- Simpan: `assets/raw/gpt2/vegetasi/tumbuhan_inti.png` · Ukuran di game: 8–32 px
- Prompt: `[LAYOUT: STAMP 4x4] 16 strange plants of a magical forest core: glowing mushrooms, thorny black vines, pale ghost flowers, crystal sprouts, withered bushes, pulsing pods.`

