# Prompt — Remodel Arka (gaya "Nusantara Senja Emas")

Tujuan: Arka menjadi **patokan gaya** untuk semua tokoh. NPC nantinya mengikuti bagian "Gaya bersama" di bawah.
Susunan lembar 1–6 **sama persis** dengan `docs/PROMPT_ARKA.md` (4×6 sel, latar magenta, tanpa senjata), jadi jalur potong-pasang lama tetap bisa dipakai.

## Rancangan Arka baru

Identitas yang dipertahankan agar pemain tetap mengenalinya:
- rambut cokelat kastanye jabrik berantakan dengan beberapa helai hijau mint,
- mata biru tua,
- warna utama biru dengan aksen emas.

| Bagian | Rancangan |
|---|---|
| Proporsi | ±2,5 kepala (sedikit lebih ramping dari chibi), bahu & siku & lutut berbentuk, tangan kecil tapi jelas |
| Kepala | ikat kepala (udeng) nila bermotif batik kecil; dua ujung kainnya berkibar ke belakang (siluet khas Arka) |
| Atasan | jaket pendek kerah tegak, biru tua, berlis emas bermotif kawung sederhana di tepi dan ujung lengan |
| Selempang | kain merah oker menyilang dari bahu kanan ke pinggang kiri, diikat di pinggang |
| Pinggang | kain batik cokelat-emas pendek dililit di atas celana (seperti sarung pendek), sabuk kulit dengan gesper bulat |
| Bawah | celana gelap, betis dibebat kain krem, sepatu kulit cokelat |
| Aksesori | liontin kecil kristal bercahaya di dada (pecahan cahaya), satu-satunya titik terang di tubuhnya |
| Wajah | mata kecil berkilau (bukan mata besar anime), alis tebal ekspresif, pipi sedikit merah, senyum percaya diri |

## Gaya bersama (untuk Arka & semua NPC)
```
STYLE: "Nusantara Senja Emas" — original fantasy pixel art for a top-down 3/4 action RPG. Warm golden-dusk palette, light from the top-left with a thin golden rim light on hair and shoulders, 3-4 tone shading per material, dark warm-brown 1-pixel outline (not pure black). Characters are about 2.5 heads tall with readable shapes: shoulders, elbows, knees, cloth folds, fluttering cloth ends. Clothing is fantasy inspired by Indonesian traditional dress (kebaya, batik cloth wraps, udeng head cloth, sashes, sarong wraps, caping hats) — stylized, not historical costume. Each character has a bold unique silhouette (hair, hat, prop). Faces are simple but expressive: small shiny eyes, thick eyebrows, a hint of blush. Crisp pixel art with hard square pixels, no anti-aliasing, no blur, no gradients. Not chibi-blocky, not anime big-eyes, not 3D.
```

## Langkah 0 — lembar desain (buat dulu, setujui, lalu jadikan referensi)
```
[Gaya bersama]
Create an original character design sheet of ARKA, the young hero (about 16 years old) of the RPG "Legenda Lumina".
Design: messy spiky chestnut-brown hair with a few mint-green strands; indigo batik udeng head cloth with two long tails fluttering behind; dark-blue short jacket with a standing collar and simple gold kawung-pattern trim on the hem and cuffs; ochre-red sash across the chest from right shoulder to left hip, knotted at the waist; short brown-and-gold batik cloth wrapped over dark trousers; leather belt with a round buckle; cream cloth wraps on the shins; brown leather shoes; a small glowing crystal pendant on the chest. Dark-blue eyes, thick eyebrows, confident friendly expression. No weapon.
Layout on a solid flat magenta #FF00FF background: top row = full-body pixel sprites at game size facing DOWN, RIGHT and UP (same size, feet on one baseline); bottom = the same three views enlarged 4x for detail, plus a face close-up. No text, no labels.
```
Bila hasilnya kurang cocok, perbaiki satu hal per pesan (misalnya "ikat kepalanya lebih kecil", "jaketnya lebih biru tua"). Simpan hasil yang disetujui sebagai `assets/reference/arka_v2_ref.png`.

## Blok umum lembar 1–6 (ganti blok umum di `PROMPT_ARKA.md` dengan ini)
```
Use the attached design sheet as the exact character reference: this is Arka, the hero, in the "Nusantara Senja Emas" style. Keep the IDENTICAL design, colors and proportions: about 2.5 heads tall, messy spiky chestnut-brown hair with mint-green strands, indigo batik udeng head cloth with two fluttering tails, dark-blue short jacket with gold kawung trim, ochre-red sash across the chest, short brown-gold batik cloth over dark trousers, cream shin wraps, brown shoes, small glowing crystal pendant, dark warm-brown 1-pixel outline, golden rim light from the top-left. The udeng tails and the sash ends react to motion (flutter behind when moving or attacking).
SHEET RULES: image 1024x1536, exactly 4 columns x 6 rows of equal square cells (256x256), one pose per cell, character centered in its cell, feet on the same baseline in every cell, the character exactly the same size in every frame (about 60% of the cell height). Solid flat magenta background #FF00FF everywhere. No grid lines, no borders, no text, no labels, no numbers, no ground, no shadow. Crisp pixel art with hard square pixels, no anti-aliasing, no blur, no gradients, same limited palette as the reference.
EMPTY HANDS: never draw a sword, bow or any weapon, no motion trails, no slash effects, no glow except the small pendant, no particles - the game adds weapons and effects separately. Hands are posed as if gripping a weapon. Rows marked RIGHT face to the right (the game mirrors them for left).
```
Isi baris per lembar: pakai **Lembar 1–6 di `docs/PROMPT_ARKA.md`** tanpa perubahan.

## Setelah lembar masuk (tugas Claude/agen)
1. Simpan lembar ke `assets/raw/hero/arka_v2_sheetN.png`.
2. Potong per sel dengan alat yang sama seperti Arka lama, lalu bangun ulang `assets/img/hero/hero_arka.png` (nama frame tetap).
3. **Kalibrasi ulang titik genggam pedang** (`HERO_HAND` di `systems/sword_hand.js`) dan lapisan pedang (`tools/gen_sword_layer.py`), karena posisi tangan di proporsi baru berubah.
4. Cek: diam, jalan 3 arah, kombo 1–3, serangan berat, guling, kena pukul, kalah, sihir, busur, pose memancing/tanam/tidur.
