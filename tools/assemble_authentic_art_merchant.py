#!/usr/bin/env python3
"""
Rakit Lembar Spritesheet Bu Sari (Pedagang Desa Lumina):
- Dibuat sendiri (tanpa Pixellab) dengan acuan visual & proporsi Arka
- Spesifikasi karakter:
  * Wajah wanita dewasa usia 35-an ramah, senyum hangat, pipi merona
  * Rambut hitam disanggul rapi dengan tusuk konde kayu
  * Selendang merah marun di pundak, rompi zaitun/krem, rok tenun
  * Sabuk kulit berkantong koin emas
  * Aktivitas: menimbang timbangan dacin & menyapa pelanggan toko
- Dimensi: 192x320 px (8 baris x 4 kolom, sel 48x40 px)
- Aseprite: assets/aseprite/npc_merchant.aseprite
"""

import os, subprocess
import numpy as np
from PIL import Image

FW, FH = 48, 40
GROUND_Y = 38
TARGET_H = 34

src_jpg = '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6/bu_sari_spritesheet_png_1795271248146.jpg'
target_png = 'assets/img/npc/npc_merchant.png'
target_ase = 'assets/aseprite/npc_merchant.aseprite'

im = Image.open(src_jpg).convert('RGBA')
arr = np.array(im)

# Buat mask transparansi untuk latar putih
bg_mask = (arr[..., 0] > 230) & (arr[..., 1] > 230) & (arr[..., 2] > 230)
arr[bg_mask, 3] = 0
clean_im = Image.fromarray(arr)

# Ekstrak 16 sel (4 baris x 4 kolom)
cells = []
scale_ref = TARGET_H / 241.0

for r in range(4):
    row_cells = []
    for c in range(4):
        y0, y1 = r * 256, (r + 1) * 256
        x0, x1 = c * 256, (c + 1) * 256
        zone = (~bg_mask)[y0:y1, x0:x1]
        ys, xs = np.where(zone)
        if len(ys) == 0:
            continue
        crop_box = (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)
        cropped = clean_im.crop(crop_box)
        
        tw = max(1, int(round(cropped.width * scale_ref)))
        th = max(1, int(round(cropped.height * scale_ref)))
        scaled = cropped.resize((tw, th), Image.NEAREST)
        
        # Taruh di kanvas 48x40
        canvas = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        paste_x = int(round((FW - tw) / 2))
        paste_y = GROUND_Y - th + 1
        canvas.paste(scaled, (paste_x, paste_y), scaled)
        row_cells.append(canvas)
    cells.append(row_cells)

sheet = Image.new('RGBA', (FW * 4, FH * 8), (0, 0, 0, 0))

# --- ROW 0: IDLE DOWN (Breathing Subtle Bobbing) ---
# cells[0][0] adalah pose tegak depan
bobs = [0, 1, 0, 0]
for c in range(4):
    fr = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    fr.paste(cells[0][0], (0, bobs[c]), cells[0][0])
    sheet.paste(fr, (c * FW, 0 * FH), fr)

# --- ROW 1: WALK DOWN (4 Frames) ---
for c in range(4):
    sheet.paste(cells[0][c], (c * FW, 1 * FH), cells[0][c])

# --- ROW 2: IDLE UP (Back View Breathing) ---
for c in range(4):
    fr = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    fr.paste(cells[1][0], (0, bobs[c]), cells[1][0])
    sheet.paste(fr, (c * FW, 2 * FH), fr)

# --- ROW 3: WALK UP (4 Frames) ---
for c in range(4):
    sheet.paste(cells[1][c], (c * FW, 3 * FH), cells[1][c])

# --- ROW 4: IDLE SIDE (Side View Breathing) ---
for c in range(4):
    fr = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    fr.paste(cells[2][0], (0, bobs[c]), cells[2][0])
    sheet.paste(fr, (c * FW, 4 * FH), fr)

# --- ROW 5: WALK SIDE (4 Frames) ---
for c in range(4):
    sheet.paste(cells[2][c], (c * FW, 5 * FH), cells[2][c])

# --- ROW 6: ACT TALK (Menyapa Ramah Melambaikan Tangan) ---
# cells[3][2] adalah pose menyapa melambaikan tangan, cells[3][3] memegang kantong koin
sheet.paste(cells[0][0], (0 * FW, 6 * FH), cells[0][0])
sheet.paste(cells[3][2], (1 * FW, 6 * FH), cells[3][2])
sheet.paste(cells[3][2], (2 * FW, 6 * FH), cells[3][2])
sheet.paste(cells[0][0], (3 * FW, 6 * FH), cells[0][0])

# --- ROW 7: ACT TRADE (Menimbang Barang dengan Dacin Kuno & Memegang Kantong Koin) ---
sheet.paste(cells[3][0], (0 * FW, 7 * FH), cells[3][0])
sheet.paste(cells[3][1], (1 * FW, 7 * FH), cells[3][1])
sheet.paste(cells[3][3], (2 * FW, 7 * FH), cells[3][3])
sheet.paste(cells[3][3], (3 * FW, 7 * FH), cells[3][3])

sheet.save(target_png, optimize=True)
print(f"Bake Success: {target_png} ({sheet.size[0]}x{sheet.size[1]})")

# Buat berkas Aseprite resmi
tmp_ase = '/tmp/merchant_ase_cels'
os.makedirs(tmp_ase, exist_ok=True)
for i in range(32):
    r, c = i // 4, i % 4
    cell = sheet.crop((c * FW, r * FH, (c + 1) * FW, (r + 1) * FH))
    cell.save(f'{tmp_ase}/frame_{i:02d}.png')

lua_script = f'''
local spr = Sprite({FW}, {FH})
local layer = spr.layers[1]
layer.name = "Bu_Sari_Pedagang"

for i = 2, 32 do
    spr:newFrame()
end

for i = 1, 32 do
    spr.frames[i].duration = 0.14
    local num = string.format("%02d", i - 1)
    local img = Image{{ fromFile = "{tmp_ase}/frame_" .. num .. ".png" }}
    spr:newCel(layer, spr.frames[i], img, Point(0, 0))
end

spr:newTag(1,  4,  "Idle_Down")
spr:newTag(5,  8,  "Walk_Down")
spr:newTag(9,  12, "Idle_Up")
spr:newTag(13, 16, "Walk_Up")
spr:newTag(17, 20, "Idle_Side")
spr:newTag(21, 24, "Walk_Side")
spr:newTag(25, 28, "Act_Talk")
spr:newTag(29, 32, "Act_Trade")

spr:saveCopyAs("{target_ase}")
'''
with open('/tmp/build_merchant_ase.lua', 'w') as f:
    f.write(lua_script)

subprocess.run(['/Applications/Aseprite.app/Contents/MacOS/aseprite', '-b', '--script', '/tmp/build_merchant_ase.lua'], check=True)
print(f"Exported Aseprite: {target_ase}")
