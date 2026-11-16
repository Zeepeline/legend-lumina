# Prompt ChatGPT — sprite sheet musuh

Acuan gaya: `assets/reference/musuh_gaya_ref.png` (Arka, Forest Wolf, Goblin, Slime — gaya & ketebalan garis yang sudah ada di game).
Cara pakai: SATU obrolan ChatGPT, unggah `musuh_gaya_ref.png`, lalu kirim prompt satu musuh per gambar. Musuh berikutnya di obrolan yang sama.
Setiap lembar = 4 kolom × 6 baris, 1024×1536, latar magenta. Simpan ke `assets/raw/enemy/<id>.png` (nama id di judul).
Musuh biasa TIDAK butuh animasi mati: saat mati game membuatnya putih lalu memudar (v1.43.1). Bos tetap punya animasi mati.
Tidak perlu lembar baru: slime merah/es/racun/api (pakai Slime yang ada + warna), Kelelawar Gua & Gargoyle (warna dari Kelelawar),
Golem Es & Golem Purba (warna dari Golem), Ular Raksasa (Ular diperbesar), Raja Rawa Toksin (Katak diperbesar). Bos menyusul di lembar terpisah.

## Blok umum (tempel di awal setiap prompt) — v2 GARANG (souls-like)
```
Use the attached image only for PIXEL SIZE, outline thickness and camera angle (top-down 3/4 view). The MOOD must be dark fantasy, souls-like: this monster is a real threat that can kill the hero. Menacing, feral, ugly-dangerous, NOT cute, NOT chibi, NOT cartoon, no big friendly eyes, no smiles. Muted, slightly desaturated earthy colors with deep dark shadows, scars, wounds, rot, dirt, sharp teeth or claws; eyes small and glowing (sickly yellow, ember red or pale). Heavy dark 1-pixel outline, strong shading from the top-left.
SHEET RULES: image 1024x1536, exactly 4 columns x 6 rows of equal square cells (256x256), one pose per cell, the monster centered in its cell, feet/bottom on the same baseline in every cell, the monster the same size in every frame. Solid flat magenta background #FF00FF everywhere. No grid lines, no borders, no text, no labels, no ground, no cast shadow. Crisp pixel art, hard square pixels, no anti-aliasing, no blur, no gradients.
NO comic effects: no stars, no sweat drops, no motion lines, no impact marks, no X eyes. The monster faces RIGHT in every frame (the game mirrors it for left). No projectiles or slash trails - the game draws those.
Rows: 1 idle loop (breathing, twitching, threatening), 2 move loop, 3 WIND-UP before attacking (clear, exaggerated, scary tell the player can read), 4 attack (fast, violent), 5 hurt recoil (frames 1-2) + staggered/off-balance (frames 3-4), 6 ALERT when it spots the hero: threat display (roar, hiss, rearing up, bristling) - 4 frames, body stays the same size. NO death animation (the game turns the monster white and fades it out).
```

## Urutan prioritas (paling sering muncul dulu)

### 1. `frog` — Katak Rawa (11 tempat, lompat)
```
[blok umum]
Monster: bloated swamp toad, size of a large dog, warty dark olive-brown skin covered in slimy pustules and leeches, scarred pale-yellow belly, small glowing sickly-yellow eyes, wide mouth with jagged little teeth, drool.
Row 1 idle: throat puffing in and out. Row 2 move: hop forward (crouch, airborne, airborne, land).
Row 3 wind-up: crouches low, throat sac swells veiny and red, mouth opening. Row 4 attack: barbed tongue whips forward (tongue part of the body), then snaps back.
Row 5 hurt recoil / staggered.
```

### 2. `boar` — Babi Hutan (11 tempat, menyeruduk)
```
[blok umum]
Monster: huge feral boar, matted dark-brown fur with a spiky black mane, old arrow shafts stuck in its back, chipped yellow tusks, scarred snout, small ember-red eyes, foam at the mouth. As tall as the hero's chest, longer than the hero.
Row 1 idle: snorting, steam puff from the nose. Row 2 move: trotting.
Row 3 wind-up: scrapes the ground with a front hoof, head lowered, tusks forward. Row 4 attack: full-speed charge, body stretched, dust under hooves.
Row 5 hurt recoil / staggered.
```

### 3. `bee` — Tawon (11 tempat, terbang)
```
[blok umum]
Monster: giant hornet the size of a cat, dirty amber and black armored stripes, torn veined wings, long dripping stinger, mandibles, cluster of red eyes. Small flying enemy hovering at the hero's head height (bottom of the cell = shadow position, body floats above it).
Row 1 idle: hovering, wings in 4 flap positions. Row 2 move: flying forward, body tilted.
Row 3 wind-up: pulls back, stinger curled forward, glinting. Row 4 attack: fast diving sting thrust.
Row 5 hurt recoil / staggered.
```

### 4. `plant` — Bunga Pemakan (10 tempat, menembak diam)
```
[blok umum]
Monster: carnivorous corpse-flower rooted in the ground, dark crimson petals with rotting edges, a gaping mouth lined with thorn-teeth, thick thorny vine stem, bones tangled in the roots. Taller than the hero. It never walks.
Row 1 idle: swaying. Row 2 'move' = emerging from the ground (sprout, half, almost, full).
Row 3 wind-up: leans back, mouth bulging. Row 4 attack: snaps forward and spits a seed (small seed at the mouth only).
Row 5 hurt recoil / staggered.
```

### 5. `snake` — Ular (9 tempat, merayap)
```
[blok umum]
Monster: venomous viper, dark moss-green scales with a black diamond pattern, scarred, pale-yellow slit eyes, long dripping fangs, forked tongue. Low to the ground, long body in an S curve.
Row 1 idle: coiled, head swaying, tongue flicking. Row 2 move: slithering S-wave.
Row 3 wind-up: rears up high, hood-like neck flare, mouth open. Row 4 attack: fast lunge bite forward, then recoils.
Row 5 hurt recoil / staggered.
```

### 6. `wisp` — Wisp (8 tempat, melayang)
```
[blok umum]
Monster: will-o'-wisp lure, a cold pale-teal flame with a tiny screaming skull face inside, dark smoky edges, ghost-light flickering. Floats above its shadow point.
Row 1 idle: bobbing, flame flickering. Row 2 move: drifting forward, flame trail stretched backward.
Row 3 wind-up: shrinks and glows brighter. Row 4 attack: bursts forward in a flash.
Row 5 hurt recoil / staggered.
```

### 7. `ghost` — Hantu (7 tempat, menembus)
```
[blok umum]
Monster: wraith of a drowned villager, tattered grey-blue burial shroud, gaunt skull-like face with empty glowing eye sockets, long bony clawed hands, wispy torn tail instead of legs (pale colors, no real transparency). Taller than the hero, floating.
Row 1 idle: floating up and down. Row 2 move: gliding forward, tail waving.
Row 3 wind-up: arms raised, face stretched into a scream. Row 4 attack: lunges forward with clawed ghostly hands.
Row 5 hurt recoil / staggered.
```

### 8. `shroom` — Jamur Racun (6 tempat, menembak spora)
```
[blok umum]
Monster: fungal husk, a hunched rotting creature overgrown by a dark purple-red mushroom cap with sickly spots, root-like legs, glowing spores in the gills, no visible eyes except two faint pale lights under the cap. As tall as the hero.
Row 1 idle: cap bobbing. Row 2 move: waddling.
Row 3 wind-up: squats, cap swells and trembles. Row 4 attack: cap puffs a small cloud of purple spores (cloud stays near the cap).
Row 5 hurt recoil / staggered.
```

### 9. `bat` — Kelelawar (juga dipakai Kelelawar Gua & Gargoyle Merah lewat warna)
```
[blok umum]
Monster: giant cave bat, dark purple-grey mangy fur, torn leathery wings with visible bones, big ragged ears, long fangs, glowing red eyes. Flying at the hero's head height (bottom of the cell = shadow position).
Row 1 idle: hovering, 4 wing-beat positions. Row 2 move: flying forward.
Row 3 wind-up: wings spread wide, screeching. Row 4 attack: swooping bite dive.
Row 5 hurt recoil / staggered.
```

### 10. `skel` — Tengkorak (4 tempat, melempar tulang)
```
[blok umum]
Monster: undead skeleton soldier, yellowed cracked bones, broken helmet, rusted chainmail scraps, glowing pale-teal eye sockets, a quiver of bones on the back. Same height as the hero.
Row 1 idle: rattling. Row 2 move: walking stiffly.
Row 3 wind-up: pulls an arm back holding a bone. Row 4 attack: throws the bone (bone leaves the hand only in frame 3).
Row 5 hurt recoil / staggered, skull rattling loose.
```

### 11. `salam` — Salamander (3 tempat, api)
```
[blok umum]
Monster: magma salamander, charcoal-black skin cracked with glowing orange lava veins, ember spines on the back, smoking nostrils, burning yellow eyes, low four-legged lizard body.
Row 1 idle: tail ember flickering. Row 2 move: scurrying.
Row 3 wind-up: inflates throat, glow in the mouth. Row 4 attack: short flame spurt from the mouth (flame stays close).
Row 5 hurt recoil / staggered.
```

### 12. `golem` — Golem (juga Golem Es & Golem Purba lewat warna)
```
[blok umum]
Monster: ancient war golem, cracked dark granite body bound with rusted chains, moss and old spear tips stuck in it, glowing amber rune cracks and eyes, massive fists. About 1.5x the hero's height.
Row 1 idle: slow breathing, glow pulsing. Row 2 move: heavy stomping walk.
Row 3 wind-up: raises both fists high over the head. Row 4 attack: ground slam, small rock chips at the fists.
Row 5 hurt recoil / staggered.
```

### 13. `mimic` — Peti Mimic
```
[blok umum]
Monster: treasure chest mimic, old dark wood with rusted iron bands, the lid opens into a fleshy maw with rows of jagged teeth and a long dark-purple tongue, spider-like bony legs underneath. About two-thirds of the hero's height.
Row 1 idle: closed, pretending to be a chest, one leg twitching out. Row 2 move: hopping on little legs, lid flapping.
Row 3 wind-up: lid creaks open, tongue out, eye glaring. Row 4 attack: big chomp forward.
Row 5 hurt recoil / staggered.
```

## Kalau hasil meleset
- Masih imut → "Too cute. Make it a menacing dark-fantasy souls-like monster: feral, scarred, muted colors, small glowing eyes, no cartoon expressions. Redo."
- Ukuran piksel beda dari acuan → "Same pixel size and outline as the reference image, redo."
- Ukuran tiap frame beda → "Same size and baseline in every cell, redo."
- Menghadap kiri → "Face RIGHT in every frame."
- Satu baris jelek → "Keep everything, redraw only row N."
