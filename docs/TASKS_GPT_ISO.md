# TASKS_GPT_ISO — tugas ChatGPT untuk versi ISOMETRIK (I001–I128)

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
5. Dunia fantasi kadar sedang: lihat `docs/DUNIA_FANTASI.md` (aturan sudah masuk blok GAYA ISO).
6. Urutan: A (Arka) → B patokan desa → I kristal & Pohon Induk → D bangunan desa → C tebing & air → F NPC desa → sisanya.

## Blok GAYA ISO (pesan pembuka setiap obrolan)
```
STYLE RULES for every image in this chat:
- ISOMETRIC pixel art for a mobile action RPG, true 2:1 isometric projection: floor tiles are diamonds twice as wide as tall,
  camera looks down at the classic isometric angle. Follow the attached screenshot for camera angle, scale and colors.
- Original designs only; do not imitate characters, creatures, logos or assets from any existing game.
- Natural daylight illumination from the UPPER LEFT. Clean, bright natural daylight, neutral sunlight, no yellow/orange twilight tint. Left-facing surfaces are lit, right-facing surfaces are in soft shade.
  Shadows fall to the lower right, soft cool-neutral tone, never pure black.
- Palette: fresh natural green grass (#5ea338, #4c8a2b, #3b6c20), clean natural earth path (#c8a868, #ad8f53), plaster (#f0e2c8), timber (#6a4a2c),
  thatch (#d2a852), red tile (#b84a32), stone (#9ba09d, #6e7270), darkest tone #1e201d. Crisp, natural, clear, no dusk/sunset tint, no neon.
- FANTASY WORLD (moderate): this is NOT Earth. Homes stay warm and familiar, but the world shows magic born from glowing Lumina crystals:
  teal-white hexagonal crystals (#7fe0d8 core #e8fffb) jutting from ground or cliffs with small floating pebbles around them,
  softly glowing plants (lantern flowers, lumen moss, glowing mushrooms), giant mossy roots arching out of the ground, pale ancient ruins
  with carved vine-and-sun motifs. Glow is a small accent (about 10% of the image), never neon, never over the whole scene.
  Near corruption: dark violet-grey soil, black thorns, cracked dull crystals with violet cracks (#7a4a9a).
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
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a farming village on two ground levels: on the raised plateau a colossal ancient Mother Tree whose roots embrace a huge glowing Lumina crystal (a thin beam of light rises from it, pebbles float around it), a stone stair, timber cottages with small crystal lanterns and curled roof ridges, a stone plaza with a well, glowing lantern flowers in gardens, dirt paths, a pond. One small original hero (about 32 px tall in game scale) for scale.`
- Cek: Kerjakan "desa" dulu. Setelah disetujui = STYLE KEY ISO, lampirkan di semua obrolan lain.

### [ ] I015. Patokan isometrik: hutan
- Simpan: `assets/raw/iso/patokan/hutan.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a forest that gets deeper toward the top: young trees at the bottom, dense mature forest with lumen moss glowing softly on trunks and glowing mushrooms, an ancient core with tower-sized trees, giant roots forming arches and bridges, pale Aurel ruins swallowed by roots. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I016. Patokan isometrik: rawa
- Simpan: `assets/raw/iso/patokan/rawa.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a murky swamp with boardwalks over olive water, roofs and pillars of a sunken ancient town rising from the water, giant mushrooms, twisted trees, thin mist, a cracked violet crystal with black thorns near the edge. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I017. Patokan isometrik: gua
- Simpan: `assets/raw/iso/patokan/gua.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of an old abandoned mine cave on two levels: teal crystal veins in the walls, carved-out crystal pits, old mine rails, a dormant stone golem with glowing seams, a crystal-torch-lit path. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I018. Patokan isometrik: salju
- Simpan: `assets/raw/iso/patokan/salju.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a snowy mountain pass on a ridge shaped like a dragon's spine, icy cliffs on several levels, ice crystals, ancient stone torches, frosted pines, a frozen pond, faint daytime aurora ribbons. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I019. Patokan isometrik: kota
- Simpan: `assets/raw/iso/patokan/kota.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a lakeside market town called the city of a thousand lanterns: crystal lanterns everywhere, stone houses with curled roof ridges, a raised city wall walkway, a stone bridge over a mirror-like lake, an academy tower with a crystal glass dome. One small original hero (about 32 px tall in game scale) for scale.`

### [ ] I020. Patokan isometrik: markas goblin
- Simpan: `assets/raw/iso/patokan/markas_goblin.png` · Ukuran di game: acuan, tidak dipotong
- Prompt: `[LAYOUT: ISO CONCEPT] Isometric game screen of a goblin war camp on a muddy hill: log palisade with a gate, hide huts, watch platform, stolen Lumina crystals strapped to bone totems. One small original hero (about 32 px tall in game scale) for scale.`

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
- Prompt: `[LAYOUT: ISO BUILDING] small timber cottage, cream plaster, thatched roof, flower box. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I044. Bangunan isometrik: rumah b
- Simpan: `assets/raw/iso/bangunan/rumah_b.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] two-storey village house, red tile roof, wooden balcony. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I045. Bangunan isometrik: rumah c
- Simpan: `assets/raw/iso/bangunan/rumah_c.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] long farmhouse with a covered porch and firewood stack. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I046. Bangunan isometrik: rumah d
- Simpan: `assets/raw/iso/bangunan/rumah_d.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] stone cottage, slate roof, chimney. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I047. Bangunan isometrik: rumah arka
- Simpan: `assets/raw/iso/bangunan/rumah_arka.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] the hero's modest family home with a small vegetable patch. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I048. Bangunan isometrik: rumah pemburu
- Simpan: `assets/raw/iso/bangunan/rumah_pemburu.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] dark-wood hunter cabin with antlers above the door. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I049. Bangunan isometrik: toko
- Simpan: `assets/raw/iso/bangunan/toko.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] shop house with an empty hanging sign bracket and awning. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I050. Bangunan isometrik: penginapan
- Simpan: `assets/raw/iso/bangunan/penginapan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] two-storey village inn, warm windows, benches outside. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I051. Bangunan isometrik: pandai besi
- Simpan: `assets/raw/iso/bangunan/pandai_besi.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] blacksmith workshop with an open side, forge glow, chimney. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I052. Bangunan isometrik: balai desa
- Simpan: `assets/raw/iso/bangunan/balai_desa.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] village hall with a bell on the roof. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I053. Bangunan isometrik: rumah pohon tetua
- Simpan: `assets/raw/iso/bangunan/rumah_pohon_tetua.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] the village elder's house built into a giant ancient tree. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I054. Bangunan isometrik: akademi
- Simpan: `assets/raw/iso/bangunan/akademi.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] town academy, stone, arched windows, small tower. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I055. Bangunan isometrik: gerbang kota
- Simpan: `assets/raw/iso/bangunan/gerbang_kota.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] town gatehouse with two towers and wooden doors. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I056. Bangunan isometrik: kincir angin
- Simpan: `assets/raw/iso/bangunan/kincir_angin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] windmill (separate sail piece on a second cell for rotation). Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I057. Bangunan isometrik: mercusuar
- Simpan: `assets/raw/iso/bangunan/mercusuar.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] lakeside lighthouse with a keeper hut. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I058. Bangunan isometrik: menara jam
- Simpan: `assets/raw/iso/bangunan/menara_jam.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] clockwork tower. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I059. Bangunan isometrik: kuil hutan
- Simpan: `assets/raw/iso/bangunan/kuil_hutan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] woodland shrine with a wooden roof. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I060. Bangunan isometrik: pos jaga
- Simpan: `assets/raw/iso/bangunan/pos_jaga.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] wooden watchtower with a ladder. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I061. Bangunan isometrik: pasar
- Simpan: `assets/raw/iso/bangunan/pasar.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] 4 market stalls with cloth canopies (2x2). Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I062. Bangunan isometrik: mulut gua
- Simpan: `assets/raw/iso/bangunan/mulut_gua.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] cave entrance in a rock cliff with support beams. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I063. Bangunan isometrik: reruntuhan
- Simpan: `assets/raw/iso/bangunan/reruntuhan.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] ancient Aurel ruins in pale cream stone with carved vine-and-sun motifs: broken columns, collapsed arch, octagonal cracked floor, giant roots wrapping them (2x2). Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I064. Bangunan isometrik: gubuk goblin
- Simpan: `assets/raw/iso/bangunan/gubuk_goblin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] 4 goblin hide huts (2x2). Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I065. Bangunan isometrik: palisade goblin
- Simpan: `assets/raw/iso/bangunan/palisade_goblin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] spiked log palisade pieces in both isometric directions with a gate. Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
- Cek: Dinding kiri-depan terang, kanan-depan gelap; tapak bangunan belah ketupat 2:1; tidak ada tulisan.

### [ ] I066. Bangunan isometrik: menara goblin
- Simpan: `assets/raw/iso/bangunan/menara_goblin.png` · Ukuran di game: rumah 64–128 px lebar
- Prompt: `[LAYOUT: ISO BUILDING] goblin lookout tower and cage (2 cells). Fantasy touch: a small crystal lantern by the door, carved vine motifs on beams, slightly curled roof ridge ends. The front door is on the LEFT-FRONT wall (facing down-left toward the camera).`
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

## I. Aset dunia fantasi (tambahan 18-11-2026)
Obrolan "Fantasi ISO". Pegangan: `docs/DUNIA_FANTASI.md` (kadar fantasi sedang, siang cerah natural, cahaya aksen ±10%).
Kerjakan setelah patokan desa (I014). Urutan: I106 kristal → Kristal Utama → Pohon Induk → bunga lentera & lumen → sisanya.

### [ ] I106. Kristal Lumina (sehat & retak)
- Simpan: `assets/raw/iso/fantasi/kristal.png` · Ukuran di game: 16–96 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Row 1 healthy teal-white Lumina crystals: small cluster, medium cluster, tall single prism, huge crystal set in rock. Row 2 the same four but corrupted: dull, cracked with violet glowing cracks, black thorns at the base.`
- Cek: Kristal sehat menyala teal; retak = kusam ungu.

### [ ] I107. Kristal Utama di akar Pohon Induk
- Simpan: `assets/raw/iso/fantasi/kristal_utama.png` · Ukuran di game: ±96×128 px
- Prompt: `[LAYOUT: ISO BUILDING] The great Lumina crystal of the village: a giant teal-white hexagonal crystal embraced by enormous mossy tree roots, small pebbles floating around it, a stone ring of old carved stones at its base.`
- Cek: Paling penting: jadi penanda desa.

### [ ] I108. Pohon Induk (kanopi)
- Simpan: `assets/raw/iso/fantasi/pohon_induk.png` · Ukuran di game: ±192×192 px
- Prompt: `[LAYOUT: ISO BUILDING] The colossal ancient Mother Tree trunk and canopy seen isometrically (without the crystal at its base): massive twisting trunk, roots spreading out, a canopy as wide as a house cluster with small glowing lantern flowers in it.`

### [ ] I109. Sinar & cahaya kristal
- Simpan: `assets/raw/iso/fantasi/sinar.png` · Ukuran di game: tinggi 64–256 px
- Prompt: `[LAYOUT: VFX 4x4] Row 1 a thin vertical beam of soft light rising from a crystal (4 frames), row 2 crystal pulse ring on the ground (4), row 3 floating light motes (4), row 4 crystal shine glint (4).`
- Cek: Latar HITAM.

### [ ] I110. Batu melayang
- Simpan: `assets/raw/iso/fantasi/batu_melayang.png` · Ukuran di game: 8–64 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] 8 floating rocks from pebble to house-sized boulder, each with dangling roots and earth under it, mossy top; no ground under them (they hover).`
- Cek: Bayangan digambar terpisah oleh game.

### [ ] I111. Pulau batu melayang besar
- Simpan: `assets/raw/iso/fantasi/pulau_melayang.png` · Ukuran di game: ±128 px
- Prompt: `[LAYOUT: ISO BUILDING] A small floating rock island with grass, one tree, a tiny crystal and hanging roots, for sacred places and boss arenas.`

### [ ] I112. Akar raksasa: gapura & jembatan
- Simpan: `assets/raw/iso/fantasi/akar_gapura.png` · Ukuran di game: 64–128 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Giant mossy roots as big as houses: root arch you can walk under (2 isometric directions), root bridge over a gap (2 directions), root wall piece, root emerging from the ground, root diving back in, a hollow root tunnel entrance.`

### [ ] I113. Akar rusak (wilayah berbahaya)
- Simpan: `assets/raw/iso/fantasi/akar_rusak.png` · Ukuran di game: 32–96 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Corrupted giant roots: blackened bark with violet glowing veins, black thorns, dead grey moss; same 8 shapes as healthy giant roots.`

### [ ] I114. Bunga lentera
- Simpan: `assets/raw/iso/fantasi/bunga_lentera.png` · Ukuran di game: 8–24 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 lantern flower plants: row 1 closed in daylight, row 2 open and glowing teal-blue, row 3 garden rows of them, row 4 single tall lantern lilies.`

### [ ] I115. Lumut & jamur lumen
- Simpan: `assets/raw/iso/fantasi/lumen.png` · Ukuran di game: 8–32 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 pieces: lumen moss patches on ground, lumen moss on a stump, on a rock, on a trunk base, glowing mushroom clusters (small to large), a giant glowing mushroom.`

### [ ] I116. Rumput ujung perak & flora padang
- Simpan: `assets/raw/iso/fantasi/flora_padang.png` · Ukuran di game: 8–24 px
- Prompt: `[LAYOUT: ISO TILE 4x4] 16 fantasy meadow plants: silver-tipped grass clumps, crystal-dew clover, wind-bell flowers, puffball seed plants, spiral ferns.`

### [ ] I117. Pohon berdaun kristal
- Simpan: `assets/raw/iso/fantasi/pohon_kristal.png` · Ukuran di game: 64–96 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] 4 sacred trees with crystal leaves (teal, white, pale gold, frosted blue) and 4 young saplings of them.`

### [ ] I118. Pohon menara Hutan Dalam
- Simpan: `assets/raw/iso/fantasi/pohon_menara.png` · Ukuran di game: 128–256 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] 4 tower-sized ancient trees (only the lower trunk and roots fit the frame, canopy cut off at the top as if going above the camera), 4 matching canopy pieces seen from above.`

### [ ] I119. Reruntuhan Aurel: set bangunan
- Simpan: `assets/raw/iso/fantasi/aurel.png` · Ukuran di game: 32–128 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Pale cream ancient Aurel architecture with carved vine-and-sun motifs: broken colonnade, sun gate arch, octagonal plaza tile set, toppled statue, stair to nowhere, dome fragment, carved wall with a glowing rune, root-wrapped tower stump.`

### [ ] I120. Teknologi Penjaga Cahaya
- Simpan: `assets/raw/iso/fantasi/penjaga.png` · Ukuran di game: 16–64 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Ancient light-guardian objects: crystal torch, teleport statue (off and on), glowing inscription stone, dormant golem seat, light-puzzle mirror pedestal, light-beam receiver, sealed crystal door.`
- Cek: Simbol/rune saja, tanpa huruf.

### [ ] I121. Lentera kristal & perabot desa fantasi
- Simpan: `assets/raw/iso/fantasi/lentera.png` · Ukuran di game: 12–40 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Village fantasy props: crystal lantern post, small crystal lantern by a door, hanging lantern string, crystal well cover, rune milestone, shrine to the Mother Tree, crystal wind chime, offering basket of glowing flowers.`

### [ ] I122. Pemukiman tenggelam (Rawa Senja)
- Simpan: `assets/raw/iso/fantasi/tenggelam.png` · Ukuran di game: 32–128 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Sunken ancient town pieces rising from swamp water: half-sunk roof, leaning pillar, arched window above water, broken bridge, sunken statue head, tower top, stairs into water, mossy wall.`

### [ ] I123. Punggung naga (Puncak Beku)
- Simpan: `assets/raw/iso/fantasi/tulang_naga.png` · Ukuran di game: 32–128 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Mountain rock formations shaped like a dragon's spine and ribs, covered in snow and ice crystals, plus ancient stone torches with blue flame.`

### [ ] I124. Kota Seribu Lentera: bangunan khas
- Simpan: `assets/raw/iso/fantasi/kota_lentera.png` · Ukuran di game: 64–128 px
- Prompt: `[LAYOUT: ISO OBJ 4x2] Lakeside city landmarks: academy tower with crystal glass dome, lantern bridge piece, council hall facade, harbor lantern pier, canal arch, lantern market stall, rooftop lantern string, statue of a light guardian.`

### [ ] I125. Hewan fantasi damai
- Simpan: `assets/raw/iso/fantasi/hewan.png` · Ukuran di game: 8–32 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Rows: crystal-antlered deer, rabbit with glowing fur tips, light butterflies (flying), long-tailed blue bird. Each row: idle, walk, flee, special (4 frames each).`
- Cek: Lembut, bukan menakutkan.

### [ ] I126. Hewan fantasi damai 2
- Simpan: `assets/raw/iso/fantasi/hewan2.png` · Ukuran di game: 8–32 px
- Prompt: `[LAYOUT: ANIMAL 4x4] Rows: spiral-horned snow goat, glowing lumen fish (swimming), giant firefly, moss tortoise. Each row: idle, walk, flee, special.`

### [ ] I127. Langit & latar jauh
- Simpan: `assets/raw/iso/fantasi/langit.png` · Ukuran di game: latar layar
- Prompt: `[LAYOUT: ISO CONCEPT] Wide background strip for map edges and title screens: distant floating islands, the far silhouette of the Mother Tree with its light beam, mountains shaped like a dragon spine, two moons in a clear day sky. No foreground.`

### [ ] I128. Tanah dekat kristal & tanah rusak
- Simpan: `assets/raw/iso/fantasi/tanah_kutub.png` · Ukuran di game: ubin 32×16 px
- Prompt: `[LAYOUT: ISO TILE 4x4] Row 1-2: lush blessed ground near crystals (vivid grass with tiny glowing specks, crystal-dew pebbles, flowers). Row 3-4: corrupted ground (violet-grey soil, withered grass, thin violet cracks, black thorn sprouts).`
- Cek: Dua kutub dunia: harmonis & rusak.

