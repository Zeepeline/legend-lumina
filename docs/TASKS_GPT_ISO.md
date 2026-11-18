# TASKS_GPT_ISO — tugas ChatGPT untuk versi ISOMETRIK (I001–I105)

Dasar: prototipe isometrik Desa Lumina (`iso.html`, `proto/iso/`, 18-11-2026) disetujui pemilik ("cukup bagus dibanding top-down").
Dokumen ini hanya berisi aset yang BERBEDA untuk isometrik. Aset yang tetap dipakai dari `docs/TASKS_GPT_ASET.md`:
tekstur tanah mulus (B & N, diputar 45° + dipipihkan oleh kode), pohon/semak/batu/properti kecil (C, D, F, N), musuh menghadap kanan (I),
efek melayang (K), UI (L), ikon (M), potret dialog (H). Yang diganti oleh dokumen ini: karakter (8 arah), bangunan, tebing/ketinggian,
interior, jembatan/pagar (2 arah), efek yang menempel di tanah.

## Cara pakai (pemilik)
1. **Mulai dari bagian A (Arka).** Satu obrolan ChatGPT baru. Pesan pertama: blok GAYA ISO + blok LAYOUT ISO di bawah, lampirkan
   `assets/reference/arka_ref.png` (desain Arka) dan `assets/reference/iso_ref.png` (screenshot prototipe = sudut kamera & warna),
   tutup dengan `Remember these rules for every image in this chat. Reply "OK" and wait for my tasks.`
2. Kirim prompt tugas satu per satu. Satu tugas = satu gambar. Simpan ke nama file di "Simpan", kirim ke Claude, centang `[x]`.
3. Bagian lain: obrolan baru per bagian, pesan pertama sama (+ lampirkan hasil I014 "Patokan isometrik: desa" sebagai STYLE KEY ISO bila sudah ada).
4. Jangan unggah screenshot game lain dan jangan menyebut nama game lain: semua desain milik Legenda Lumina.
5. Urutan: A (Arka) → B patokan desa → D bangunan desa → C tebing & air → F NPC desa → sisanya.

## Blok GAYA ISO (pesan pembuka setiap obrolan)
```
STYLE RULES for every image in this chat:
- ISOMETRIC pixel art for a mobile action RPG, true 2:1 isometric projection: floor tiles are diamonds twice as wide as tall,
  camera looks down at the classic isometric angle. Follow the attached screenshot for camera angle, scale and colors.
- Original designs only; do not imitate characters, creatures, logos or assets from any existing game.
- Warm late-afternoon golden light from the UPPER LEFT. Left-facing surfaces are lit, right-facing surfaces are in shade.
  Shadows fall to the lower right, soft deep olive, never pure black.
- Palette: yellow-green grass (#a9b94e, #93a541, #5f6e2c), ochre earth (#c9ae62, #9a8549), plaster (#e8d2a6), timber (#6a4a2c),
  thatch (#c9a24e), red tile (#b0583c), stone (#b9ad8a, #7d735a), darkest tone #1e1c16. Slightly desaturated, no neon.
- Shading: 3-4 tones per material, chunky readable pixel clusters, very little dithering.
- Outlines: 1-pixel outline in a darker shade of the local color on characters and objects; floor tiles have no outline.
- Scale: one game pixel = one art pixel. A human is about 32 px tall. A floor diamond is 32x16 px. One height level (cliff) is 26 px.
- Clean pixels: hard square pixels, no anti-aliasing, no blur, no gradients, no text, no letters, no watermark, no grid lines.
```

## Blok LAYOUT ISO (tempel di pesan pembuka)
```
LAYOUT CODES:
[LAYOUT: ISO CHAR 4x5] 1024x1280, 4 columns (animation frames, left to right) x 5 rows (directions), 256x256 cells.
  Row 1 facing DOWN (toward camera), row 2 facing DOWN-RIGHT (diagonal, three-quarter front), row 3 facing RIGHT (side),
  row 4 facing UP-RIGHT (diagonal, three-quarter back), row 5 facing UP (back to camera). Left-facing directions are mirrored by the game.
  Feet on the same baseline, character the same size in every cell, solid magenta #FF00FF background, no weapons or effects drawn.
[LAYOUT: ISO NPC 4x5x2] 2048x1280: the left half is ISO CHAR 4x5 with an idle loop, the right half is ISO CHAR 4x5 with a walk cycle.
[LAYOUT: ISO ONE 4x2] / [LAYOUT: ISO ONE 4x4] 1024 wide, 256x256 cells, one facing direction as written, magenta background.
[LAYOUT: ISO CONCEPT] 1536x1024 isometric game screen, no UI, no text.
[LAYOUT: ISO TILE 4x4] 1024x512, 4x4 cells of 256x128, each cell holds exactly one 2:1 diamond floor tile filling the cell, magenta outside the diamond.
[LAYOUT: ISO BLOCK 4x4] 1024x1024, 4x4 cells, each cell one isometric terrain block piece (diamond top + side faces), magenta background.
[LAYOUT: ISO OBJ 4x2] 1024x512, 4x2 cells, one isometric object per cell standing on the cell's lower baseline, magenta background.
[LAYOUT: ISO ANIM 4x2] 1024x512, 2 rows of 4 animation frames, magenta background.
[LAYOUT: ISO BUILDING] 1024x1024, one isometric building centered, its ground footprint is a 2:1 diamond, magenta background, no ground around it.
[LAYOUT: ISO ROOM] 1536x1024, one cut-away isometric room centered, magenta background outside the room.
[LAYOUT: ENEMY UP 4x4] 1024x1024, 4x4 cells, monster facing UP-RIGHT, rows as written, magenta background, same monster design as the attached sheet.
[LAYOUT: VFX 4x4] 1024x1024, 4x4 cells read left-to-right, top-to-bottom as frames, SOLID BLACK background (additive light), pixel-drawn glow.
```

## Untuk Claude/agen yang memasang
- Karakter 5 arah: potong pakai `frames_of` + `shrink` dari `tools/gen_hero.py` (5 baris), cerminkan baris 2–4 untuk arah kiri.
  Pemilih arah di `proto/iso/iso_actors.js` (`dirOf`) diganti 8 arah: sudut layar dibagi 8 sektor.
- Ubin & blok: potong per sel, perkecil ke 32×16 (ubin) / lebar 32 (blok), dipanggang ke kanvas tanah seperti `bakeGround()`.
- Bangunan: pakai gambar apa adanya (skala bulat), tapak belah ketupat jadi persegi tabrakan dunia di `IMAP.houses`.
- Tekstur mulus top-down (TASKS_GPT_ASET B/N) → ubin iso: putar 45°, skala Y 0,5, potong belah ketupat 32×16.

## A. Arka 8 arah (KERJAKAN DULU)
Obrolan "Arka ISO". Lampirkan `assets/reference/arka_ref.png` + `assets/reference/iso_ref.png`. Setiap lembar = SATU animasi dalam 5 arah (3 arah sisanya dicerminkan game).

### [ ] I001. Arka 5 arah: diam
- Simpan: `assets/raw/iso/arka/idle.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, idle breathing loop, very subtle up-down motion.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I002. Arka 5 arah: jalan
- Simpan: `assets/raw/iso/arka/walk.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, walk cycle (contact, passing, contact, passing), arms swinging.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I003. Arka 5 arah: lari
- Simpan: `assets/raw/iso/arka/run.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, run cycle, leaning forward, longer strides.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I004. Arka 5 arah: tebas1
- Simpan: `assets/raw/iso/arka/atk1.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, combo hit 1: wind-up, horizontal slash from his right to his left, follow-through, recover; hands grip an invisible one-handed sword.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I005. Arka 5 arah: tebas2
- Simpan: `assets/raw/iso/arka/atk2.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, combo hit 2: wind-up, backhand slash from his left to his right, follow-through, recover.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I006. Arka 5 arah: tebas3
- Simpan: `assets/raw/iso/arka/atk3.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, combo finisher: small jump wind-up, overhead chop down with both hands, impact crouch, recover.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I007. Arka 5 arah: berat
- Simpan: `assets/raw/iso/arka/heavy.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, heavy charged attack: crouch and pull back, hold charge (tense, hair lifting), explosive lunging swing, recover.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I008. Arka 5 arah: guling
- Simpan: `assets/raw/iso/arka/roll.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, dodge roll: dive, curled ball, curled ball rotated, landing crouch.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I009. Arka 5 arah: kena
- Simpan: `assets/raw/iso/arka/hurt.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, frames 1-2 hurt flinch (head snapped back, eyes shut), frames 3-4 staggered off-balance.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I010. Arka 5 arah: sihir
- Simpan: `assets/raw/iso/arka/cast.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, casting: hands together at chest, raise hand, thrust open palm forward, recover (no glow drawn).`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I011. Arka 5 arah: busur
- Simpan: `assets/raw/iso/arka/bow.png` · Ukuran di game: tinggi ±33 px (sama dengan Arka sekarang)
- Prompt: `[LAYOUT: ISO CHAR 4x5] Arka, archery with an INVISIBLE bow: raise, draw string back, hold aim, release.`
- Cek: Wajah & warna identik dengan arka_ref.png; baris 2 & 4 benar-benar diagonal (bukan samping/depan); ukuran & garis kaki sama di 20 sel.

### [ ] I012. Arka: kalah & bangkit (1 arah)
- Simpan: `assets/raw/iso/arka/die.png` · Ukuran di game: ±33 px
- Prompt: `[LAYOUT: ISO ONE 4x2] Arka facing DOWN-RIGHT. Row 1 defeat: stagger, drop to knees, fall forward, lying face-down. Row 2 getting up: lying, push up, kneel, stand ready.`

### [ ] I013. Arka: kehidupan sehari-hari (1 arah)
- Simpan: `assets/raw/iso/arka/life.png` · Ukuran di game: ±33 px
- Prompt: `[LAYOUT: ISO ONE 4x4] Arka facing DOWN-RIGHT. Row 1 fishing cast with an invisible rod, row 2 pulling a fish, row 3 crouch to harvest, row 4 cheer (fist pump, jump, land, smile).`


## B. Gambar patokan isometrik
Obrolan "Patokan ISO". Lampirkan `assets/reference/iso_ref.png` (screenshot prototipe).

### [ ] I014. Patokan isometrik: desa
- Simpan: `assets/raw/iso/patokan/desa.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a farming village on two ground levels: a raised grassy plateau with a stone stair, timber cottages, a stone plaza with a well, dirt paths, a pond. One small original hero (about 32 px tall in game scale) for scale.`
- Cek: Kerjakan "desa" dulu. Setelah disetujui = STYLE KEY ISO, lampirkan di semua obrolan lain.

### [ ] I015. Patokan isometrik: hutan
- Simpan: `assets/raw/iso/patokan/hutan.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a forest clearing that gets deeper toward the top: young trees at the bottom, dense mature forest, an ancient dark core with giant roots and mist. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I016. Patokan isometrik: rawa
- Simpan: `assets/raw/iso/patokan/rawa.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a murky swamp with boardwalks over olive water, reeds, twisted trees, mist. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I017. Patokan isometrik: gua
- Simpan: `assets/raw/iso/patokan/gua.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a cave on two levels with a rock ledge, crystals, a torch-lit path. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I018. Patokan isometrik: salju
- Simpan: `assets/raw/iso/patokan/salju.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a snowy mountain pass with icy cliffs on several height levels, frosted pines, a frozen pond. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I019. Patokan isometrik: kota
- Simpan: `assets/raw/iso/patokan/kota.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a market town street with stone houses, a raised city wall walkway, cobblestones, a fountain. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I020. Patokan isometrik: markas goblin
- Simpan: `assets/raw/iso/patokan/markas_goblin.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a goblin war camp on a muddy hill, log palisade with a gate, hide huts, watch platform. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I021. Patokan isometrik: arena
- Simpan: `assets/raw/iso/patokan/arena.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a small combat moment: the hero dodging a lunging wolf in a forest clearing, a thin red danger ring on the ground. One small original hero (about 32 px tall in game scale) for scale.`


## C. Tanah, ketinggian, air, jembatan
Obrolan "Tanah ISO".

### [ ] I022. Catatan tekstur tanah
- Prompt: `(tidak perlu digenerate) Tekstur SEAMLESS di TASKS_GPT_ASET bagian B & N tetap dipakai: kode memutar 45° dan memipihkan 50% jadi ubin belah ketupat.`
- Cek: Lewati.

### [ ] I023. Ubin isometrik rumput: variasi tepi
- Simpan: `assets/raw/iso/tanah/tepi_rumput.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 isometric diamond floor tiles of grass meeting other ground: row 1 plain variations, row 2 edges toward each of the 4 diamond sides, row 3 corners, row 4 small decorative variants (cracks, tufts, pebbles). Every tile is an exact 2:1 diamond.`
- Cek: Tepi belah ketupat lurus & pas 2:1.

### [ ] I024. Ubin isometrik tanah: variasi tepi
- Simpan: `assets/raw/iso/tanah/tepi_tanah.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 isometric diamond floor tiles of dirt path meeting other ground: row 1 plain variations, row 2 edges toward each of the 4 diamond sides, row 3 corners, row 4 small decorative variants (cracks, tufts, pebbles). Every tile is an exact 2:1 diamond.`
- Cek: Tepi belah ketupat lurus & pas 2:1.

### [ ] I025. Ubin isometrik batu: variasi tepi
- Simpan: `assets/raw/iso/tanah/tepi_batu.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 isometric diamond floor tiles of stone plaza meeting other ground: row 1 plain variations, row 2 edges toward each of the 4 diamond sides, row 3 corners, row 4 small decorative variants (cracks, tufts, pebbles). Every tile is an exact 2:1 diamond.`
- Cek: Tepi belah ketupat lurus & pas 2:1.

### [ ] I026. Ubin isometrik salju: variasi tepi
- Simpan: `assets/raw/iso/tanah/tepi_salju.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 isometric diamond floor tiles of snow meeting other ground: row 1 plain variations, row 2 edges toward each of the 4 diamond sides, row 3 corners, row 4 small decorative variants (cracks, tufts, pebbles). Every tile is an exact 2:1 diamond.`
- Cek: Tepi belah ketupat lurus & pas 2:1.

### [ ] I027. Ubin isometrik lumpur: variasi tepi
- Simpan: `assets/raw/iso/tanah/tepi_lumpur.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 isometric diamond floor tiles of swamp mud meeting other ground: row 1 plain variations, row 2 edges toward each of the 4 diamond sides, row 3 corners, row 4 small decorative variants (cracks, tufts, pebbles). Every tile is an exact 2:1 diamond.`
- Cek: Tepi belah ketupat lurus & pas 2:1.

### [ ] I028. Ubin isometrik gua: variasi tepi
- Simpan: `assets/raw/iso/tanah/tepi_gua.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 isometric diamond floor tiles of cave rock floor meeting other ground: row 1 plain variations, row 2 edges toward each of the 4 diamond sides, row 3 corners, row 4 small decorative variants (cracks, tufts, pebbles). Every tile is an exact 2:1 diamond.`
- Cek: Tepi belah ketupat lurus & pas 2:1.

### [ ] I029. Blok tebing isometrik: tebing rumput
- Simpan: `assets/raw/iso/tanah/tebing_rumput.png` · Ukuran di game: tinggi tebing 26 px per lantai
- Prompt: `[LAYOUT: ISO BLOCK 4x4] Isometric height blocks of grassy earth cliff with roots and a soft grass lip: one full block (diamond top + left face + right face), left face only, right face only, outer corner, inner corner, top edge pieces facing each direction, a slope/ramp block, stone stairs block, a 2-level tall block.`
- Cek: Muka kiri lebih terang (cahaya dari kiri atas), muka kanan lebih gelap.

### [ ] I030. Blok tebing isometrik: tebing batu
- Simpan: `assets/raw/iso/tanah/tebing_batu.png` · Ukuran di game: tinggi tebing 26 px per lantai
- Prompt: `[LAYOUT: ISO BLOCK 4x4] Isometric height blocks of warm grey rock cliff with moss on top: one full block (diamond top + left face + right face), left face only, right face only, outer corner, inner corner, top edge pieces facing each direction, a slope/ramp block, stone stairs block, a 2-level tall block.`
- Cek: Muka kiri lebih terang (cahaya dari kiri atas), muka kanan lebih gelap.

### [ ] I031. Blok tebing isometrik: tebing salju
- Simpan: `assets/raw/iso/tanah/tebing_salju.png` · Ukuran di game: tinggi tebing 26 px per lantai
- Prompt: `[LAYOUT: ISO BLOCK 4x4] Isometric height blocks of icy rock cliff with a snow cap and icicles: one full block (diamond top + left face + right face), left face only, right face only, outer corner, inner corner, top edge pieces facing each direction, a slope/ramp block, stone stairs block, a 2-level tall block.`
- Cek: Muka kiri lebih terang (cahaya dari kiri atas), muka kanan lebih gelap.

### [ ] I032. Blok tebing isometrik: tebing gua
- Simpan: `assets/raw/iso/tanah/tebing_gua.png` · Ukuran di game: tinggi tebing 26 px per lantai
- Prompt: `[LAYOUT: ISO BLOCK 4x4] Isometric height blocks of dark cave rock wall with crystal veins: one full block (diamond top + left face + right face), left face only, right face only, outer corner, inner corner, top edge pieces facing each direction, a slope/ramp block, stone stairs block, a 2-level tall block.`
- Cek: Muka kiri lebih terang (cahaya dari kiri atas), muka kanan lebih gelap.

### [ ] I033. Blok tebing isometrik: tebing rawa
- Simpan: `assets/raw/iso/tanah/tebing_rawa.png` · Ukuran di game: tinggi tebing 26 px per lantai
- Prompt: `[LAYOUT: ISO BLOCK 4x4] Isometric height blocks of muddy bank with roots and hanging moss: one full block (diamond top + left face + right face), left face only, right face only, outer corner, inner corner, top edge pieces facing each direction, a slope/ramp block, stone stairs block, a 2-level tall block.`
- Cek: Muka kiri lebih terang (cahaya dari kiri atas), muka kanan lebih gelap.

### [ ] I034. Blok tebing isometrik: dinding kota
- Simpan: `assets/raw/iso/tanah/dinding_kota.png` · Ukuran di game: tinggi tebing 26 px per lantai
- Prompt: `[LAYOUT: ISO BLOCK 4x4] Isometric height blocks of cut stone city wall with a walkway on top: one full block (diamond top + left face + right face), left face only, right face only, outer corner, inner corner, top edge pieces facing each direction, a slope/ramp block, stone stairs block, a 2-level tall block.`
- Cek: Muka kiri lebih terang (cahaya dari kiri atas), muka kanan lebih gelap.

### [ ] I035. jembatan kayu isometrik (2 arah)
- Simpan: `assets/raw/iso/tanah/jembatan_kayu.png` · Ukuran di game: lebar 32 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] wooden plank bridge pieces in BOTH isometric directions: row 1 running along the down-right diagonal (straight, end A, end B, corner), row 2 running along the up-right diagonal (straight, end A, end B, broken piece).`

### [ ] I036. jembatan batu isometrik (2 arah)
- Simpan: `assets/raw/iso/tanah/jembatan_batu.png` · Ukuran di game: lebar 32 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] old stone arch bridge pieces in BOTH isometric directions: row 1 running along the down-right diagonal (straight, end A, end B, corner), row 2 running along the up-right diagonal (straight, end A, end B, broken piece).`

### [ ] I037. dermaga isometrik (2 arah)
- Simpan: `assets/raw/iso/tanah/dermaga.png` · Ukuran di game: lebar 32 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] wooden pier pieces in BOTH isometric directions: row 1 running along the down-right diagonal (straight, end A, end B, corner), row 2 running along the up-right diagonal (straight, end A, end B, broken piece).`

### [ ] I038. papan rawa isometrik (2 arah)
- Simpan: `assets/raw/iso/tanah/papan_rawa.png` · Ukuran di game: lebar 32 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] swamp boardwalk on stilts pieces in BOTH isometric directions: row 1 running along the down-right diagonal (straight, end A, end B, corner), row 2 running along the up-right diagonal (straight, end A, end B, broken piece).`

### [ ] I039. tangga kayu isometrik (2 arah)
- Simpan: `assets/raw/iso/tanah/tangga_kayu.png` · Ukuran di game: lebar 32 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] wooden stairs and ladders between levels pieces in BOTH isometric directions: row 1 running along the down-right diagonal (straight, end A, end B, corner), row 2 running along the up-right diagonal (straight, end A, end B, broken piece).`

### [ ] I040. pagar isometrik (2 arah)
- Simpan: `assets/raw/iso/tanah/pagar.png` · Ukuran di game: lebar 32 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] wooden fences, stone low walls and gates pieces in BOTH isometric directions: row 1 running along the down-right diagonal (straight, end A, end B, corner), row 2 running along the up-right diagonal (straight, end A, end B, broken piece).`

### [ ] I041. Air isometrik: tepi & riak
- Simpan: `assets/raw/iso/tanah/air.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] Isometric water: row 1 deep and shallow water diamonds, row 2 shore edges toward the 4 diamond sides with a thin earth lip, row 3 shore corners, row 4 ripples and lily pads.`

### [ ] I042. Air terjun isometrik
- Simpan: `assets/raw/iso/tanah/air_terjun.png` · Ukuran di game: 1 lantai
- Prompt: `[LAYOUT: ISO ANIM 4x2] Row 1 a waterfall pouring down a left cliff face (4 frames), row 2 down a right cliff face (4 frames), foam at the bottom.`


## D. Bangunan isometrik
Obrolan "Bangunan ISO".

### [ ] I043. Bangunan isometrik: rumah a
- Simpan: `assets/raw/iso/bangunan/rumah_a.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] small timber cottage, cream plaster, thatched roof, flower box. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I044. Bangunan isometrik: rumah b
- Simpan: `assets/raw/iso/bangunan/rumah_b.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] two-storey village house, red tile roof, wooden balcony. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I045. Bangunan isometrik: rumah c
- Simpan: `assets/raw/iso/bangunan/rumah_c.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] long farmhouse with a covered porch and firewood stack. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I046. Bangunan isometrik: rumah d
- Simpan: `assets/raw/iso/bangunan/rumah_d.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] stone cottage, slate roof, chimney. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I047. Bangunan isometrik: rumah arka
- Simpan: `assets/raw/iso/bangunan/rumah_arka.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] the hero's modest family home with a small vegetable patch. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I048. Bangunan isometrik: rumah pemburu
- Simpan: `assets/raw/iso/bangunan/rumah_pemburu.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] dark-wood hunter cabin with antlers above the door. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I049. Bangunan isometrik: toko
- Simpan: `assets/raw/iso/bangunan/toko.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] shop house with an empty hanging sign bracket and awning. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I050. Bangunan isometrik: penginapan
- Simpan: `assets/raw/iso/bangunan/penginapan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] two-storey village inn, warm windows, benches outside. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I051. Bangunan isometrik: pandai besi
- Simpan: `assets/raw/iso/bangunan/pandai_besi.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] blacksmith workshop with an open side, forge glow, chimney. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I052. Bangunan isometrik: balai desa
- Simpan: `assets/raw/iso/bangunan/balai_desa.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] village hall with a bell on the roof. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I053. Bangunan isometrik: rumah pohon tetua
- Simpan: `assets/raw/iso/bangunan/rumah_pohon_tetua.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] the village elder's house built into a giant ancient tree. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I054. Bangunan isometrik: akademi
- Simpan: `assets/raw/iso/bangunan/akademi.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] town academy, stone, arched windows, small tower. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I055. Bangunan isometrik: gerbang kota
- Simpan: `assets/raw/iso/bangunan/gerbang_kota.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] town gatehouse with two towers and wooden doors. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I056. Bangunan isometrik: kincir angin
- Simpan: `assets/raw/iso/bangunan/kincir_angin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] windmill (separate sail piece on a second cell for rotation). The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I057. Bangunan isometrik: mercusuar
- Simpan: `assets/raw/iso/bangunan/mercusuar.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] lakeside lighthouse with a keeper hut. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I058. Bangunan isometrik: menara jam
- Simpan: `assets/raw/iso/bangunan/menara_jam.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] clockwork tower. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I059. Bangunan isometrik: kuil hutan
- Simpan: `assets/raw/iso/bangunan/kuil_hutan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] woodland shrine with a wooden roof. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I060. Bangunan isometrik: pos jaga
- Simpan: `assets/raw/iso/bangunan/pos_jaga.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] wooden watchtower with a ladder. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I061. Bangunan isometrik: pasar
- Simpan: `assets/raw/iso/bangunan/pasar.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] 4 market stalls with cloth canopies (2x2). The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I062. Bangunan isometrik: mulut gua
- Simpan: `assets/raw/iso/bangunan/mulut_gua.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] cave entrance in a rock cliff with support beams. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I063. Bangunan isometrik: reruntuhan
- Simpan: `assets/raw/iso/bangunan/reruntuhan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] ancient ruins: broken columns, collapsed arch, cracked floor (2x2). The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I064. Bangunan isometrik: gubuk goblin
- Simpan: `assets/raw/iso/bangunan/gubuk_goblin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] 4 goblin hide huts (2x2). The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I065. Bangunan isometrik: palisade goblin
- Simpan: `assets/raw/iso/bangunan/palisade_goblin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] spiked log palisade pieces in both isometric directions with a gate. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I066. Bangunan isometrik: menara goblin
- Simpan: `assets/raw/iso/bangunan/menara_goblin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] goblin lookout tower and cage (2 cells). The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.


## E. Interior isometrik
Obrolan "Interior ISO". Pengganti 4 ruangan gambar sekarang + 2 baru.

### [ ] I067. Interior isometrik: rumah arka
- Simpan: `assets/raw/iso/interior/rumah_arka.png` · Ukuran di game: ruangan ±256×160 px
- Prompt: `[LAYOUT: ISO ROOM] Cut-away isometric room (only the two back walls are drawn, the front walls are removed): the hero's cozy home: bed, fireplace, wardrobe, small table with flowers, rug. Door gap at the front-left edge of the floor.`
- Cek: Lantai belah ketupat penuh; perabot tidak menutupi pintu.

### [ ] I068. Interior isometrik: penginapan
- Simpan: `assets/raw/iso/interior/penginapan.png` · Ukuran di game: ruangan ±256×160 px
- Prompt: `[LAYOUT: ISO ROOM] Cut-away isometric room (only the two back walls are drawn, the front walls are removed): village inn: four beds, writing desk, jar shelf, barrels. Door gap at the front-left edge of the floor.`
- Cek: Lantai belah ketupat penuh; perabot tidak menutupi pintu.

### [ ] I069. Interior isometrik: rumah tetua
- Simpan: `assets/raw/iso/interior/rumah_tetua.png` · Ukuran di game: ruangan ±256×160 px
- Prompt: `[LAYOUT: ISO ROOM] Cut-away isometric room (only the two back walls are drawn, the front walls are removed): elder's tree house: bookshelves, round table with a candle, blue bed. Door gap at the front-left edge of the floor.`
- Cek: Lantai belah ketupat penuh; perabot tidak menutupi pintu.

### [ ] I070. Interior isometrik: rumah lina
- Simpan: `assets/raw/iso/interior/rumah_lina.png` · Ukuran di game: ruangan ±256×160 px
- Prompt: `[LAYOUT: ISO ROOM] Cut-away isometric room (only the two back walls are drawn, the front walls are removed): a young woman's home: fireplace, flower pots, tea table, two beds. Door gap at the front-left edge of the floor.`
- Cek: Lantai belah ketupat penuh; perabot tidak menutupi pintu.

### [ ] I071. Interior isometrik: toko
- Simpan: `assets/raw/iso/interior/toko.png` · Ukuran di game: ruangan ±256×160 px
- Prompt: `[LAYOUT: ISO ROOM] Cut-away isometric room (only the two back walls are drawn, the front walls are removed): shop interior: counter, shelves of goods, crates. Door gap at the front-left edge of the floor.`
- Cek: Lantai belah ketupat penuh; perabot tidak menutupi pintu.

### [ ] I072. Interior isometrik: pandai besi
- Simpan: `assets/raw/iso/interior/pandai_besi.png` · Ukuran di game: ruangan ±256×160 px
- Prompt: `[LAYOUT: ISO ROOM] Cut-away isometric room (only the two back walls are drawn, the front walls are removed): smithy interior: forge, anvil, weapon racks. Door gap at the front-left edge of the floor.`
- Cek: Lantai belah ketupat penuh; perabot tidak menutupi pintu.


## F. NPC 8 arah
Obrolan "NPC ISO".

### [ ] I073. NPC Tetua Bram: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/elder.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Tetua Bram": old village elder, long white beard, green-brown robe, wooden staff.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I074. NPC Lina: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/girl.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Lina": the hero's childhood friend, short auburn hair with a ribbon, apron.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I075. NPC Pak Darto: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/farmer.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Pak Darto": stocky farmer, straw hat, rolled sleeves.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I076. NPC Bu Sari: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/merchant.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Bu Sari": cheerful shopkeeper woman, headscarf, colorful shawl.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I077. NPC Dodi: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/child.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Dodi": small village boy, messy hair, wooden toy sword.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I078. NPC Pak Besi: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/smith.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Pak Besi": burly bald blacksmith, thick beard, leather apron.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I079. NPC Bu Rina: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/inn.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Bu Rina": innkeeper woman, hair in a bun, carries a tray.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I080. NPC Pemburu Raka: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/hunter.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Pemburu Raka": lean hunter, hooded cloak, bow on back.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I081. NPC Penjaga Nila: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/nila.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Penjaga Nila": female guard, light armor, spear, ponytail.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I082. NPC Nenek Ratih: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/ratih.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Nenek Ratih": tiny hunched grandmother with a cane and herb basket.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I083. NPC Pak Teguh: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/pancing.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Pak Teguh": old fisherman, rain hat, fishing rod.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I084. NPC Penjaga Gerbang: diam & jalan 5 arah
- Simpan: `assets/raw/iso/npc/gj1.png` · Ukuran di game: tinggi ±30 px
- Prompt: `[LAYOUT: ISO NPC 4x5x2] Original character "Penjaga Gerbang": town gate guard, helmet, halberd.`
- Cek: Wajah & warna konsisten di 40 sel.

### [ ] I085. Catatan NPC lain
- Prompt: `(tidak perlu digenerate) NPC lain & potret dialog memakai tugas TASKS_GPT_ASET bagian H; sprite 4 arah lama masih bisa dipakai sementara.`
- Cek: Lewati.


## G. Musuh: pose membelakangi
Obrolan "Musuh" yang sama dengan TASKS_GPT_ASET (blok GARANG tetap dipakai).

### [ ] I086. Catatan musuh
- Prompt: `(tidak perlu digenerate ulang) Lembar musuh 4x6 menghadap KANAN (TASKS_GPT_ASET bagian I) tetap dipakai di isometrik: dicerminkan untuk kiri. Tugas di bawah hanya MENAMBAH pose menghadap ke atas-kanan untuk musuh utama agar tidak selalu terlihat dari samping.`
- Cek: Lewati.

### [ ] I087. Serigala: pose membelakangi (atas-kanan)
- Simpan: `assets/raw/iso/musuh/wolf_up.png` · Ukuran di game: sama dengan lembar musuh
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same Serigala monster as in my existing sheet (attach it), now facing UP-RIGHT (back three-quarter view). Rows: 1 idle, 2 move, 3 wind-up, 4 attack.`
- Cek: Desain identik dengan lembar menghadap kanan.

### [ ] I088. Goblin: pose membelakangi (atas-kanan)
- Simpan: `assets/raw/iso/musuh/goblin_up.png` · Ukuran di game: sama dengan lembar musuh
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same Goblin monster as in my existing sheet (attach it), now facing UP-RIGHT (back three-quarter view). Rows: 1 idle, 2 move, 3 wind-up, 4 attack.`
- Cek: Desain identik dengan lembar menghadap kanan.

### [ ] I089. Babi Hutan: pose membelakangi (atas-kanan)
- Simpan: `assets/raw/iso/musuh/boar_up.png` · Ukuran di game: sama dengan lembar musuh
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same Babi Hutan monster as in my existing sheet (attach it), now facing UP-RIGHT (back three-quarter view). Rows: 1 idle, 2 move, 3 wind-up, 4 attack.`
- Cek: Desain identik dengan lembar menghadap kanan.

### [ ] I090. Tengkorak: pose membelakangi (atas-kanan)
- Simpan: `assets/raw/iso/musuh/skel_up.png` · Ukuran di game: sama dengan lembar musuh
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same Tengkorak monster as in my existing sheet (attach it), now facing UP-RIGHT (back three-quarter view). Rows: 1 idle, 2 move, 3 wind-up, 4 attack.`
- Cek: Desain identik dengan lembar menghadap kanan.

### [ ] I091. Golem: pose membelakangi (atas-kanan)
- Simpan: `assets/raw/iso/musuh/golem_up.png` · Ukuran di game: sama dengan lembar musuh
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same Golem monster as in my existing sheet (attach it), now facing UP-RIGHT (back three-quarter view). Rows: 1 idle, 2 move, 3 wind-up, 4 attack.`
- Cek: Desain identik dengan lembar menghadap kanan.

### [ ] I092. Katak Rawa: pose membelakangi (atas-kanan)
- Simpan: `assets/raw/iso/musuh/frog_up.png` · Ukuran di game: sama dengan lembar musuh
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same Katak Rawa monster as in my existing sheet (attach it), now facing UP-RIGHT (back three-quarter view). Rows: 1 idle, 2 move, 3 wind-up, 4 attack.`
- Cek: Desain identik dengan lembar menghadap kanan.

### [ ] I093. Bos Kepala Goblin: pose membelakangi
- Simpan: `assets/raw/iso/musuh/gchief_up.png` · Ukuran di game: sama dengan lembar bos
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same boss Kepala Goblin as in my existing boss sheet (attach it), facing UP-RIGHT. Rows: 1 idle, 2 move, 3 main attack wind-up, 4 main attack.`

### [ ] I094. Bos Ratu Jamur: pose membelakangi
- Simpan: `assets/raw/iso/musuh/squeen_up.png` · Ukuran di game: sama dengan lembar bos
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same boss Ratu Jamur as in my existing boss sheet (attach it), facing UP-RIGHT. Rows: 1 idle, 2 move, 3 main attack wind-up, 4 main attack.`

### [ ] I095. Bos Raja Goblin: pose membelakangi
- Simpan: `assets/raw/iso/musuh/gking_up.png` · Ukuran di game: sama dengan lembar bos
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same boss Raja Goblin as in my existing boss sheet (attach it), facing UP-RIGHT. Rows: 1 idle, 2 move, 3 main attack wind-up, 4 main attack.`

### [ ] I096. Bos Morgath: pose membelakangi
- Simpan: `assets/raw/iso/musuh/witch_up.png` · Ukuran di game: sama dengan lembar bos
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same boss Morgath as in my existing boss sheet (attach it), facing UP-RIGHT. Rows: 1 idle, 2 move, 3 main attack wind-up, 4 main attack.`

### [ ] I097. Bos Naga Es Kryos: pose membelakangi
- Simpan: `assets/raw/iso/musuh/kryos_up.png` · Ukuran di game: sama dengan lembar bos
- Prompt: `[LAYOUT: ENEMY UP 4x4] The same boss Naga Es Kryos as in my existing boss sheet (attach it), facing UP-RIGHT. Rows: 1 idle, 2 move, 3 main attack wind-up, 4 main attack.`


## H. Efek di bidang tanah
Obrolan "Efek ISO".

### [ ] I098. Efek isometrik: tebasan tanah
- Simpan: `assets/raw/iso/vfx/tebasan_tanah.png` · Ukuran di game: efek 16–64 px
- Prompt: `[LAYOUT: VFX 4x4] sword slash crescents lying FLAT on the isometric ground plane (squashed 2:1), for 4 screen directions: right, down-right, down, up-right; 4 frames each.`
- Cek: Latar HITAM (kecuali bayangan: magenta).

### [ ] I099. Efek isometrik: tebasan berat
- Simpan: `assets/raw/iso/vfx/tebasan_berat.png` · Ukuran di game: efek 16–64 px
- Prompt: `[LAYOUT: VFX 4x4] heavy and spin attack rings flat on the isometric ground (8 frames) plus a finisher impact crack (4 frames).`
- Cek: Latar HITAM (kecuali bayangan: magenta).

### [ ] I100. Efek isometrik: cincin bahaya
- Simpan: `assets/raw/iso/vfx/cincin_bahaya.png` · Ukuran di game: efek 16–64 px
- Prompt: `[LAYOUT: VFX 4x4] enemy telegraph markers flat on isometric ground: thin red ring shrinking (8 frames), red cone in 4 directions, red line for a charge.`
- Cek: Latar HITAM (kecuali bayangan: magenta).

### [ ] I101. Efek isometrik: debu guling
- Simpan: `assets/raw/iso/vfx/debu_guling.png` · Ukuran di game: efek 16–64 px
- Prompt: `[LAYOUT: VFX 4x4] dodge-roll dust crescents flat on the ground for 4 directions, 4 frames each.`
- Cek: Latar HITAM (kecuali bayangan: magenta).

### [ ] I102. Efek isometrik: kawah
- Simpan: `assets/raw/iso/vfx/kawah.png` · Ukuran di game: efek 16–64 px
- Prompt: `[LAYOUT: VFX 4x4] ground impact craters and cracks flat on isometric ground, 4 sizes, plus flying rock chips.`
- Cek: Latar HITAM (kecuali bayangan: magenta).

### [ ] I103. Efek isometrik: lingkaran sihir
- Simpan: `assets/raw/iso/vfx/lingkaran_sihir.png` · Ukuran di game: efek 16–64 px
- Prompt: `[LAYOUT: VFX 4x4] magic rune circles flat on isometric ground for fire, ice, light and nature (4 frames each).`
- Cek: Latar HITAM (kecuali bayangan: magenta).

### [ ] I104. Efek isometrik: bayangan
- Simpan: `assets/raw/iso/vfx/bayangan.png` · Ukuran di game: efek 16–64 px
- Prompt: `[LAYOUT: VFX 4x4] soft isometric contact shadows: small, medium, large, huge, and a long tree shadow pointing down-right.`
- Cek: Latar HITAM (kecuali bayangan: magenta).

### [ ] I105. Catatan efek lain
- Prompt: `(tidak perlu digenerate ulang) Efek yang melayang (percikan, api, es, petir, partikel, cuaca) dari TASKS_GPT_ASET bagian K tetap dipakai.`
- Cek: Lewati.

