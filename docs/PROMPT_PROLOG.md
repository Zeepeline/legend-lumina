# Prompt ChatGPT — aset prolog cerita baru (Arka budak, Mila)

Sumber cerita: `docs/STORY_JOURNAL.md` (19-11-2026). Format lembar sama dengan `docs/PROMPT_ARKA.md`.
Hasil potong: `venv/bin/python3` + fungsi `tools/gen_hero.py` (lihat skrip pratinjau di catatan sesi).

## Status
- [x] Arka budak lembar 1 (diam & jalan, 7 baris) → `assets/raw/hero_slave/slave_sheet1.png` (+ `_cut.png`)
- [ ] Arka budak lembar 2 (pincang, guling, kena pukul, kalah, bangkit) → `assets/raw/hero_slave/slave_sheet2.png`
- [ ] Mila lembar 1 (diam & jalan 4 arah) → `assets/raw/npc_mila/mila_sheet1.png`

Cara pakai: unggah gambar acuan, tempel prompt, simpan hasil PNG ke path di atas.

## Arka budak — lembar 2
Unggah: `assets/raw/hero_slave/slave_sheet1.png` (desain) + `assets/raw/hero/arka_sheet4.png` (tata letak).
```
Use image 1 as the exact character design (Arka, runaway-slave costume: wet tangled chestnut-brown spiky hair, big dark-blue eyes, torn dull beige/grey-brown sack-cloth tunic, rope belt, torn dark-brown short trousers, barefoot, dirt smudges, reddish shackle scars on wrists, dark 1px outline, chibi top-down 3/4 JRPG pixel art). Use image 2 only for framing, cell size, character size and baseline.
SHEET RULES: image 1024x1536, exactly 4 columns x 6 rows of equal 256x256 cells, character centered, feet on the same baseline per row, same size every frame (about 55% of cell height). Solid flat magenta #FF00FF background. No grid, no text, no shadow, no ground, no weapons, no effects. Crisp hard square pixels, no anti-aliasing, no blur.
Row 1: facing DOWN, weak limping walk cycle (hunched, dragging one leg, holding own arm, exhausted).
Row 2: facing RIGHT, weak limping walk cycle.
Row 3: facing RIGHT, dodge roll: dive, curled ball, curled ball rotated, landing crouch.
Row 4: frames 1-2 hurt flinch facing DOWN, frames 3-4 hurt flinch facing RIGHT.
Row 5: facing DOWN, defeat: stagger, drop to knees, fall forward, lying face-down.
Row 6: facing DOWN, getting up: lying, push up, kneel, stand.
```

## Mila — lembar 1
Unggah: `assets/raw/hero_slave/slave_sheet1.png` (acuan gaya & ukuran piksel).
```
Pixel-art game sprite sheet of a cheerful little village kid NPC for a cozy fantasy JRPG, matching the art style and pixel size of the attached hero sheet (chibi top-down 3/4, dark 1px outline, crisp square pixels, limited warm palette).
Character "Mila": small chibi kid, about 75% of the hero's height. Round smiling face, big warm brown eyes, rosy cheeks, dark-brown hair in two short pigtails tied with small RED cloth ribbons, simple light-green tunic dress with a cream apron, small brown sandals.
SHEET RULES: image 1024x1536, 4 columns x 6 rows of equal cells, character centered, feet on the same baseline, same size every frame. Solid flat magenta #FF00FF background, no grid, no text, no shadow, no ground, no anti-aliasing.
Row 1: facing down, idle, holding a small bread loaf at chest. Row 2: facing down, walk cycle.
Row 3: facing up (back view), idle. Row 4: facing up, walk cycle.
Row 5: facing right, idle. Row 6: facing right, walk cycle.
```
