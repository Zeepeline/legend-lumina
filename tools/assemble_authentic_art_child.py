#!/usr/bin/env python3
"""
Rakit Lembar Spritesheet Dodi (Anak Desa Lumina - 'child'):
- Dibuat sendiri (tanpa Pixellab) dengan acuan visual & proporsi Arka
- Spesifikasi karakter:
  * Anak laki-laki desa ceria usia ~8-10 tahun
  * Wajah polos imut, mata besar berbinar, pipi merona
  * Topi baret/pet kain miring, rambut pirang kecokelatan
  * Kemeja kuning oranye ceria, celana pendek suspender cokelat
  * Ketapel kayu mainan di tangan
- Dimensi: 192x320 px (8 baris x 4 kolom, sel 48x40 px)
- Aseprite: assets/aseprite/npc_child.aseprite
"""

import sys, os, subprocess
import numpy as np
from PIL import Image
from scipy.ndimage import label

FW, FH = 48, 40
GROUND_Y = 38
TARGET_H = 28   # Anak-anak: tinggi ~28 px (lebih mungil dari dewasa 34 px)

def assemble(src_jpg):
    target_png = 'assets/img/npc/npc_child.png'
    target_ase = 'assets/aseprite/npc_child.aseprite'

    im = Image.open(src_jpg).convert('RGBA')
    arr = np.array(im)

    # 1. Mask background putih
    is_white = (arr[..., 0] > 235) & (arr[..., 1] > 235) & (arr[..., 2] > 235)

    # 2. Mask shadow tanah di bagian bawah sel
    y_coords = np.arange(arr.shape[0])[:, None]
    diff = np.maximum(np.maximum(arr[..., 0], arr[..., 1]), arr[..., 2]) - np.minimum(np.minimum(arr[..., 0], arr[..., 1]), arr[..., 2])
    is_low_sat = diff <= 16
    is_shadow_brightness = (arr[..., 0] >= 50) & (arr[..., 0] <= 160)
    is_bottom_zone = (y_coords % 256) >= 218
    is_shadow = is_low_sat & is_shadow_brightness & is_bottom_zone

    arr[is_white | is_shadow, 3] = 0

    # 3. Bersihkan noise/bercak terpencil di bawah sepatu di setiap sel
    for r in range(4):
        for c in range(4):
            y0, y1 = r * 256, (r + 1) * 256
            x0, x1 = c * 256, (c + 1) * 256
            cell_alpha = arr[y0:y1, x0:x1, 3] > 0
            labeled, num_features = label(cell_alpha)
            if num_features > 1:
                # Ambil komponen terbesar (badan karakter)
                sizes = [np.sum(labeled == i) for i in range(1, num_features + 1)]
                max_label = np.argmax(sizes) + 1
                # Pertahankan hanya komponen besar (badan)
                keep_mask = (labeled == max_label)
                arr[y0:y1, x0:x1, 3] = np.where(keep_mask, arr[y0:y1, x0:x1, 3], 0)

    clean_im = Image.fromarray(arr)

    # Deteksi tinggi acuan baris 0
    ref_zone = (arr[:256, :256, 3] > 0)
    ys_ref, _ = np.where(ref_zone)
    ref_h = max(1, ys_ref.max() - ys_ref.min() + 1)
    scale_ref = TARGET_H / float(ref_h)

    cells = []
    for r in range(4):
        row_cells = []
        for c in range(4):
            y0, y1 = r * 256, (r + 1) * 256
            x0, x1 = c * 256, (c + 1) * 256
            zone = (arr[y0:y1, x0:x1, 3] > 0)
            ys, xs = np.where(zone)
            if len(ys) == 0:
                continue
            crop_box = (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)
            cropped = clean_im.crop(crop_box)
            
            tw = max(1, int(round(cropped.width * scale_ref)))
            th = max(1, int(round(cropped.height * scale_ref)))
            scaled = cropped.resize((tw, th), Image.NEAREST)
            
            canvas = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
            paste_x = int(round((FW - tw) / 2))
            paste_y = GROUND_Y - th + 1
            canvas.paste(scaled, (paste_x, paste_y), scaled)
            row_cells.append(canvas)
        cells.append(row_cells)

    sheet = Image.new('RGBA', (FW * 4, FH * 8), (0, 0, 0, 0))

    # --- ROW 0: IDLE DOWN (Breathing Subtle Bobbing) ---
    bobs = [0, 1, 0, 0]
    for c in range(4):
        fr = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        fr.paste(cells[0][0], (0, bobs[c]), cells[0][0])
        sheet.paste(fr, (c * FW, 0 * FH), fr)

    # --- ROW 1: WALK DOWN (4 Frames) ---
    for c in range(4):
        sheet.paste(cells[0][c], (c * FW, 1 * FH), cells[0][c])

    # --- ROW 2: IDLE UP (Back View) ---
    for c in range(4):
        fr = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        fr.paste(cells[1][0], (0, bobs[c]), cells[1][0])
        sheet.paste(fr, (c * FW, 2 * FH), fr)

    # --- ROW 3: WALK UP (4 Frames) ---
    for c in range(4):
        sheet.paste(cells[1][c], (c * FW, 3 * FH), cells[1][c])

    # --- ROW 4: IDLE SIDE (Side View) ---
    for c in range(4):
        fr = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        fr.paste(cells[2][0], (0, bobs[c]), cells[2][0])
        sheet.paste(fr, (c * FW, 4 * FH), fr)

    # --- ROW 5: WALK SIDE (4 Frames) ---
    for c in range(4):
        sheet.paste(cells[2][c], (c * FW, 5 * FH), cells[2][c])

    # --- ROW 6: ACT TALK (Melambaikan Tangan Riang) ---
    sheet.paste(cells[0][0], (0 * FW, 6 * FH), cells[0][0])
    sheet.paste(cells[3][0], (1 * FW, 6 * FH), cells[3][0])
    sheet.paste(cells[3][0], (2 * FW, 6 * FH), cells[3][0])
    sheet.paste(cells[0][0], (3 * FW, 6 * FH), cells[0][0])

    # --- ROW 7: ACT PLAY (Melompat Gembira & Memamerkan Ketapel) ---
    sheet.paste(cells[3][1], (0 * FW, 7 * FH), cells[3][1])
    sheet.paste(cells[3][2], (1 * FW, 7 * FH), cells[3][2])
    sheet.paste(cells[3][3], (2 * FW, 7 * FH), cells[3][3])
    sheet.paste(cells[3][3], (3 * FW, 7 * FH), cells[3][3])

    sheet.save(target_png, optimize=True)
    print(f"Bake Success: {target_png} ({sheet.size[0]}x{sheet.size[1]})")

    # Buat berkas Aseprite resmi
    tmp_ase = '/tmp/child_ase_cels'
    os.makedirs(tmp_ase, exist_ok=True)
    for i in range(32):
        r, c = i // 4, i % 4
        cell = sheet.crop((c * FW, r * FH, (c + 1) * FW, (r + 1) * FH))
        cell.save(f'{tmp_ase}/frame_{i:02d}.png')

    lua_script = f'''
local spr = Sprite({FW}, {FH})
local layer = spr.layers[1]
layer.name = "Dodi_Anak_Desa"

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
spr:newTag(29, 32, "Act_Play")

spr:saveCopyAs("{target_ase}")
'''
    with open('/tmp/build_child_ase.lua', 'w') as f:
        f.write(lua_script)

    subprocess.run(['/Applications/Aseprite.app/Contents/MacOS/aseprite', '-b', '--script', '/tmp/build_child_ase.lua'], check=True)
    print(f"Exported Aseprite: {target_ase}")

if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6/dodi_child_spritesheet_1795271682414.jpg'
    assemble(src)
