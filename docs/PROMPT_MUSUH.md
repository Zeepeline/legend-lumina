# Prompt ChatGPT — sprite sheet musuh

Acuan gaya: `assets/reference/musuh_gaya_ref.png` (Arka, Forest Wolf, Goblin, Slime — gaya & ketebalan garis yang sudah ada di game).
Cara pakai: SATU obrolan ChatGPT, unggah `musuh_gaya_ref.png`, lalu kirim prompt satu musuh per gambar. Musuh berikutnya di obrolan yang sama.
Setiap lembar = 4 kolom × 6 baris, 1024×1536, latar magenta. Simpan ke `assets/raw/enemy/<id>.png` (nama id di judul).
Tidak perlu lembar baru: slime merah/es/racun/api (pakai Slime yang ada + warna), Kelelawar Gua & Gargoyle (warna dari Kelelawar),
Golem Es & Golem Purba (warna dari Golem), Ular Raksasa (Ular diperbesar), Raja Rawa Toksin (Katak diperbesar). Bos menyusul di lembar terpisah.

## Blok umum (tempel di awal setiap prompt)
```
Use the attached image as the STYLE reference (the hero, the wolf, the goblin and the slime are already in my game). Draw a NEW monster in exactly that pixel-art style: top-down 3/4 view JRPG, soft natural colors, dark 1-pixel outline, chunky readable shapes, same pixel size as the reference.
SHEET RULES: image 1024x1536, exactly 4 columns x 6 rows of equal square cells (256x256), one pose per cell, the monster centered in its cell, feet/bottom on the same baseline in every cell, the monster the same size in every frame. Solid flat magenta background #FF00FF everywhere. No grid lines, no borders, no text, no labels, no ground, no cast shadow. Crisp pixel art, hard square pixels, no anti-aliasing, no blur, no gradients.
The monster faces RIGHT in every frame (the game mirrors it for left). Only small effects that are part of the body are allowed (drool, sparks in the hand); no big projectiles, no slash trails - the game draws those.
Rows: 1 idle loop, 2 move loop, 3 WIND-UP warning before attacking (clear, exaggerated tell), 4 attack, 5 hurt (frames 1-2) + stunned/dizzy (frames 3-4), 6 death (last frame = collapsed or fading).
```

## Urutan prioritas (paling sering muncul dulu)

### 1. `frog` — Katak Rawa (11 tempat, lompat)
```
[blok umum]
Monster: chubby swamp frog, moss-green back with darker spots, cream belly, big round eyes, a bit grumpy. Small: about half the hero's height.
Row 1 idle: throat puffing in and out. Row 2 move: hop forward (crouch, airborne, airborne, land).
Row 3 wind-up: crouches low, cheeks puff up huge. Row 4 attack: long tongue lash forward (tongue part of the body), then pulls back.
Row 5 hurt / dizzy with little stars. Row 6 death: flips on its back, legs twitch, flattens.
```

### 2. `boar` — Babi Hutan (11 tempat, menyeruduk)
```
[blok umum]
Monster: wild boar, bristly brown fur with a darker mane ridge, two white curved tusks, small angry red eyes. Long body, about as tall as the hero's waist, longer than the hero.
Row 1 idle: snorting, steam puff from the nose. Row 2 move: trotting.
Row 3 wind-up: scrapes the ground with a front hoof, head lowered, tusks forward. Row 4 attack: full-speed charge, body stretched, dust under hooves.
Row 5 hurt / dizzy. Row 6 death: tumbles onto its side.
```

### 3. `bee` — Tawon (11 tempat, terbang)
```
[blok umum]
Monster: big angry wasp, yellow and black stripes, translucent pale-blue wings, sharp stinger, compound red eyes. Small flying enemy hovering at the hero's head height (bottom of the cell = shadow position, body floats above it).
Row 1 idle: hovering, wings in 4 flap positions. Row 2 move: flying forward, body tilted.
Row 3 wind-up: pulls back, stinger curled forward, glinting. Row 4 attack: fast diving sting thrust.
Row 5 hurt / dizzy spinning. Row 6 death: wings stop, falls and crumples.
```

### 4. `plant` — Bunga Pemakan (10 tempat, menembak diam)
```
[blok umum]
Monster: carnivorous flower rooted in the ground, big pink-magenta bloom with a toothy mouth in the center, thick green stem and leaves. About the hero's height. It never walks.
Row 1 idle: swaying. Row 2 'move' = emerging from the ground (sprout, half, almost, full).
Row 3 wind-up: leans back, mouth bulging. Row 4 attack: snaps forward and spits a seed (small seed at the mouth only).
Row 5 hurt / dizzy wilting. Row 6 death: withers, petals fall, shrinks into a stump.
```

### 5. `snake` — Ular (9 tempat, merayap)
```
[blok umum]
Monster: forest snake, lime-green scales with a yellow belly and dark diamond pattern, slit eyes, forked tongue. Low to the ground, long body in an S curve.
Row 1 idle: coiled, head swaying, tongue flicking. Row 2 move: slithering S-wave.
Row 3 wind-up: rears up high, hood-like neck flare, mouth open. Row 4 attack: fast lunge bite forward, then recoils.
Row 5 hurt / dizzy. Row 6 death: goes limp and flat.
```

### 6. `wisp` — Wisp (8 tempat, melayang)
```
[blok umum]
Monster: small floating spirit flame, pale cyan-white core with a soft blue outer flame, two tiny dark eyes, little sparkles. Floats above its shadow point.
Row 1 idle: bobbing, flame flickering. Row 2 move: drifting forward, flame trail stretched backward.
Row 3 wind-up: shrinks and glows brighter. Row 4 attack: bursts forward in a flash.
Row 5 hurt / dizzy flickering. Row 6 death: flickers out into small sparks.
```

### 7. `ghost` — Hantu (7 tempat, menembus)
```
[blok umum]
Monster: sad ghost in a tattered pale-blue sheet, hollow dark eyes, wispy tail instead of legs, slightly transparent look (use lighter colors, not real transparency). About the hero's height, floating.
Row 1 idle: floating up and down. Row 2 move: gliding forward, tail waving.
Row 3 wind-up: arms raised, face stretched into a scream. Row 4 attack: lunges forward with clawed ghostly hands.
Row 5 hurt / dizzy. Row 6 death: dissolves upward into wisps.
```

### 8. `shroom` — Jamur Racun (6 tempat, menembak spora)
```
[blok umum]
Monster: walking poison mushroom, pink-red cap with cream spots, stubby cream body with tiny feet, angry eyes under the cap. About two-thirds of the hero's height.
Row 1 idle: cap bobbing. Row 2 move: waddling.
Row 3 wind-up: squats, cap swells and trembles. Row 4 attack: cap puffs a small cloud of purple spores (cloud stays near the cap).
Row 5 hurt / dizzy. Row 6 death: cap falls off, body shrivels.
```

### 9. `bat` — Kelelawar (juga dipakai Kelelawar Gua & Gargoyle Merah lewat warna)
```
[blok umum]
Monster: cave bat, purple fur, large leathery wings, big ears, tiny fangs, glowing yellow eyes. Flying at the hero's head height (bottom of the cell = shadow position).
Row 1 idle: hovering, 4 wing-beat positions. Row 2 move: flying forward.
Row 3 wind-up: wings spread wide, screeching. Row 4 attack: swooping bite dive.
Row 5 hurt / dizzy. Row 6 death: falls with folded wings.
```

### 10. `skel` — Tengkorak (4 tempat, melempar tulang)
```
[blok umum]
Monster: skeleton warrior, off-white bones, cracked skull with glowing teal eye sockets, torn brown cloth around the waist, rusty shoulder pad. Same height as the hero.
Row 1 idle: rattling. Row 2 move: walking stiffly.
Row 3 wind-up: pulls an arm back holding a bone. Row 4 attack: throws the bone (bone leaves the hand only in frame 3).
Row 5 hurt / dizzy, skull wobbling. Row 6 death: collapses into a pile of bones.
```

### 11. `salam` — Salamander (3 tempat, api)
```
[blok umum]
Monster: fire salamander, orange-red skin with yellow spots, glowing ember on its tail tip, low four-legged lizard body.
Row 1 idle: tail ember flickering. Row 2 move: scurrying.
Row 3 wind-up: inflates throat, glow in the mouth. Row 4 attack: short flame spurt from the mouth (flame stays close).
Row 5 hurt / dizzy. Row 6 death: curls up, ember goes out, turns grey.
```

### 12. `golem` — Golem (juga Golem Es & Golem Purba lewat warna)
```
[blok umum]
Monster: heavy stone golem, grey-brown rock body, moss on the shoulders, glowing amber cracks and eyes, huge fists. About 1.5x the hero's height.
Row 1 idle: slow breathing, glow pulsing. Row 2 move: heavy stomping walk.
Row 3 wind-up: raises both fists high over the head. Row 4 attack: ground slam, small rock chips at the fists.
Row 5 hurt / dizzy. Row 6 death: crumbles into a pile of rocks.
```

### 13. `mimic` — Peti Mimic
```
[blok umum]
Monster: treasure chest mimic, wooden chest with iron bands, inside a dark mouth with sharp teeth and a long purple tongue, one eye in the lid. About two-thirds of the hero's height.
Row 1 idle: closed, pretending to be a chest (tiny breathing). Row 2 move: hopping on little legs, lid flapping.
Row 3 wind-up: lid creaks open, tongue out, eye glaring. Row 4 attack: big chomp forward.
Row 5 hurt / dizzy. Row 6 death: lid falls open, coins spill out.
```

## Kalau hasil meleset
- Gaya beda dari acuan → "Same pixel size, outline and colors style as the reference image, redo."
- Ukuran tiap frame beda → "Same size and baseline in every cell, redo."
- Menghadap kiri → "Face RIGHT in every frame."
- Satu baris jelek → "Keep everything, redraw only row N."
