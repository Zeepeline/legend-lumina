# Prompt ChatGPT — sprite sheet lengkap Arka (karakter utama)

Acuan: `assets/reference/arka_ref.png` = sprite Arka sekarang (`assets/img/hero_custom.png`, 12 frame 20×26) diperbesar 8×.
Cara pakai: di SATU obrolan ChatGPT, unggah `arka_ref.png`, lalu kirim prompt Lembar 1. Lembar berikutnya dikirim di obrolan yang sama (agar wajah/warna konsisten).
Setiap lembar = 4 kolom × 6 baris, 1024×1536 (tegak). Senjata & efek TIDAK digambar (game menempel pedang/tombak/kapak/busur + jejak ayunan sendiri).
Hasil disimpan ke `assets/raw/hero/arka_sheetN.png`; Claude/agen memotong per sel (latar magenta) lalu mengecilkan ke tinggi ±26 px.

## Blok umum (sudah ikut di tiap prompt)
```
Use the attached image as the exact character reference: this is Arka, the hero. Keep the IDENTICAL design, colors, proportions and pixel-art style: chibi top-down 3/4 JRPG hero, messy spiky chestnut-brown hair with a few tiny mint-green highlights, big dark-blue eyes, blue jacket/tunic with navy shading and small gold trims, white-silver chest straps, brown belt with a gold buckle, dark trousers, brown boots, dark 1-pixel outline.
SHEET RULES: image 1024x1536, exactly 4 columns x 6 rows of equal square cells (256x256), one pose per cell, character centered in its cell, feet on the same baseline in every cell, the character exactly the same size in every frame (about 55% of the cell height). Solid flat magenta background #FF00FF everywhere. No grid lines, no borders, no text, no labels, no numbers, no ground, no shadow. Crisp pixel art with hard square pixels, no anti-aliasing, no blur, no gradients, same limited palette as the reference.
EMPTY HANDS: never draw a sword, bow or any weapon, no motion trails, no slash effects, no glow, no particles - the game adds weapons and effects separately. Hands are posed as if gripping a weapon. Rows marked RIGHT face to the right (the game mirrors them for left).
```

## Lembar 1 — diam & jalan
```
[blok umum]
Rows (each row = 4 frames, left to right, one smooth loop):
Row 1: facing DOWN (toward camera), idle breathing loop, very subtle up-down motion.
Row 2: facing DOWN, walk cycle (contact, passing, contact, passing), arms swinging.
Row 3: facing UP (back to camera), idle breathing loop.
Row 4: facing UP, walk cycle.
Row 5: facing RIGHT, idle breathing loop.
Row 6: facing RIGHT, walk cycle.
```

## Lembar 2 — serangan kombo 1 & 2
```
[blok umum]
Each row = 4 frames: wind-up, strike, follow-through, recover. Hands grip an invisible one-handed sword.
Row 1: facing DOWN, combo hit 1 - horizontal slash from his right to his left.
Row 2: facing DOWN, combo hit 2 - backhand slash from his left to his right.
Row 3: facing UP, combo hit 1 - horizontal slash.
Row 4: facing UP, combo hit 2 - backhand slash.
Row 5: facing RIGHT, combo hit 1 - forward horizontal slash, body leaning in.
Row 6: facing RIGHT, combo hit 2 - rising backhand slash.
```

## Lembar 3 — pukulan penutup & serangan berat
```
[blok umum]
Rows 1-3 = combo hit 3 (finisher), 4 frames: jump-up wind-up, overhead chop down, impact crouch, recover. Two hands on an invisible sword.
Row 1: facing DOWN finisher. Row 2: facing UP finisher. Row 3: facing RIGHT finisher.
Rows 4-6 = heavy charged attack, 4 frames: crouch and pull back (charging), hold charge (tense, hair lifting), explosive lunging swing, recover.
Row 4: facing DOWN heavy. Row 5: facing UP heavy. Row 6: facing RIGHT heavy.
```

## Lembar 4 — berguling, kena pukul, kalah
```
[blok umum]
Rows 1-3 = dodge roll, 4 frames: dive, curled ball, curled ball rotated, landing crouch.
Row 1: rolling DOWN (toward camera). Row 2: rolling UP. Row 3: rolling RIGHT.
Row 4: frames 1-2 = hurt flinch facing DOWN (head snapped back, eyes shut), frames 3-4 = hurt flinch facing RIGHT.
Row 5: facing DOWN, defeat: stagger, drop to knees, fall forward, lying face-down on the ground.
Row 6: facing DOWN, getting up after defeat: lying, push up, kneel, stand ready.
```

## Lembar 5 — sihir & busur
```
[blok umum]
Rows 1-3 = casting a spell, 4 frames: gather (hands together at chest), raise hand, thrust open palm forward, recover. No glow or magic effect drawn.
Row 1: facing DOWN cast. Row 2: facing UP cast. Row 3: facing RIGHT cast.
Rows 4-6 = archery pose with an INVISIBLE bow, 4 frames: raise, draw string back, hold aim, release.
Row 4: facing DOWN. Row 5: facing UP. Row 6: facing RIGHT.
```

## Lembar 6 — kehidupan sehari-hari (opsional)
```
[blok umum]
Row 1: facing RIGHT, fishing: cast an invisible rod overhead and forward (4 frames).
Row 2: facing RIGHT, fishing: waiting then pulling back hard (4 frames).
Row 3: facing DOWN, crouching to pick up / harvest a plant (4 frames).
Row 4: facing DOWN, swinging an invisible hoe or watering can (4 frames).
Row 5: facing DOWN, victory pose: fist pump, jump, land, smile (4 frames).
Row 6: facing DOWN, sitting down on the ground then sleeping, eyes closed (4 frames).
```

## Kalau hasil meleset
- Wajah/warna berubah → "Same character as the reference image, redo with identical colors and proportions."
- Ukuran tiap frame beda → "Make the character exactly the same size and baseline in every cell, redo."
- Muncul pedang/efek → "Remove all weapons and effects, keep empty gripping hands."
- Satu baris jelek → "Keep everything, redraw only row N."
