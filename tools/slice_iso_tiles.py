import os
import math
from PIL import Image

SRC = 'assets/raw/iso/tanah/tepi_rumput.png'
OUT_DIR = 'assets/img/iso/tiles/'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC).convert('RGBA')
W, H = img.size
cols, rows = 4, 4
cw = W // cols # 256
ch = H // rows # 170

def clean_and_smooth_tile(cell, col_idx, row_idx):
    tw, th = cell.size # 256 x 170
    pix = cell.load()
    
    # 1. Deteksi foreground murni vs magenta background / fringe
    fg = [[False] * th for _ in range(tw)]
    for y in range(th):
        for x in range(tw):
            r, g, b, a = pix[x, y]
            is_magenta = (r > g + 15 and b > g + 15) or \
                         (r > 140 and b > 140 and g < 110) or \
                         (r > 120 and b > 120 and g < 75)
            if not is_magenta and a > 50:
                fg[x][y] = True
            else:
                pix[x, y] = (0, 0, 0, 0)
                
    # 2. Cari titik puncak atas sel
    top_y = 18
    for y in range(15, 35):
        if any(fg[x][y] for x in range(120, 136)):
            top_y = y
            break
            
    # Diamond 2:1 berukuran 240 x 120 dengan 1px bleed (242 x 122)
    out_w, out_h = 242, 122
    out = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))
    opix = out.load()
    
    cx, cy = 121.0, 61.0
    
    # 3. Salin piksel & ekstrapolasi tepi (bleed) agar tidak berlubang
    for y in range(out_h):
        for x in range(out_w):
            dx = abs(x + 0.5 - cx) / 120.0
            dy = abs(y + 0.5 - cy) / 60.0
            
            # Diamond interior dengan bleed 1.5px
            if dx + dy <= 1.018:
                src_x = int(8 + x - 1)
                src_y = int(top_y + y - 1)
                
                if 0 <= src_x < tw and 0 <= src_y < th and fg[src_x][src_y]:
                    r, g, b, _ = pix[src_x, src_y]
                    # De-fringe spill suppression
                    if b > g:
                        b = int(g * 0.7)
                    if r > g * 1.3 and b > g * 0.8:
                        r = int(g * 0.9)
                        b = int(g * 0.6)
                    opix[x, y] = (r, g, b, 255)
                else:
                    # Inward sampling dari pusat
                    vx = cx - x
                    vy = cy - y
                    dist = math.hypot(vx, vy)
                    if dist > 0:
                        nx, ny = vx / dist, vy / dist
                        found = False
                        for step in range(1, 14):
                            sx = int(src_x + nx * step)
                            sy = int(src_y + ny * step)
                            if 0 <= sx < tw and 0 <= sy < th and fg[sx][sy]:
                                r, g, b, _ = pix[sx, sy]
                                if b > g:
                                    b = int(g * 0.7)
                                opix[x, y] = (r, g, b, 255)
                                found = True
                                break
                        if not found:
                            opix[x, y] = (100, 175, 45, 255)
                            
    # 4. Normalisasi garis luar (menghilangkan border/outline hitam buatan AI di tepi ubin)
    for y in range(out_h):
        for x in range(out_w):
            dx = abs(x + 0.5 - cx) / 120.0
            dy = abs(y + 0.5 - cy) / 60.0
            if 0.95 <= dx + dy <= 1.018:
                vx = cx - x
                vy = cy - y
                dist = math.hypot(vx, vy)
                if dist > 0:
                    ix = int(x + (vx / dist) * 4)
                    iy = int(y + (vy / dist) * 4)
                    if 0 <= ix < out_w and 0 <= iy < out_h and opix[ix, iy][3] > 0:
                        r1, g1, b1, _ = opix[x, y]
                        r2, g2, b2, _ = opix[ix, iy]
                        # Jika piksel tepi jauh lebih gelap (outline), samarkan ke warna rumput bagian dalam
                        if g1 < g2 * 0.8:
                            nr = int(r1 * 0.25 + r2 * 0.75)
                            ng = int(g1 * 0.25 + g2 * 0.75)
                            nb = int(b1 * 0.25 + b2 * 0.75)
                            opix[x, y] = (nr, ng, nb, 255)

    return out

idx = 0
for r in range(rows):
    for c in range(cols):
        box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
        cell = img.crop(box)
        cleaned = clean_and_smooth_tile(cell, c, r)
        out_name = f'grass_{idx:02d}.png'
        out_path = os.path.join(OUT_DIR, out_name)
        cleaned.save(out_path)
        print(f"Extracted & smoothed {out_name}: {cleaned.size}")
        idx += 1

print("\n16 ubin lantai isometrik berhasil dibersihkan dan dihaluskan tepinya!")
