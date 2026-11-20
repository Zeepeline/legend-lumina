import os
import math
from PIL import Image

SRC = 'assets/raw/iso/tanah/tepi_batu.png'
OUT_DIR = 'assets/img/iso/tiles_stone/'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC).convert('RGBA')

# Koordinat kotak ubin 4x4 eksak
col_boxes = [
    (10, 246),
    (267, 502),
    (523, 758),
    (779, 1014)
]

row_boxes = [
    (62, 201),
    (281, 420),
    (496, 635),
    (711, 850)
]

# Output ukuran standar 242 x 122 (permukaan belah ketupat 240x120 + 1px bleed)
out_w, out_h = 242, 122
cx_out, cy_out = 121.0, 61.0

idx = 0
for r_idx, (y0, y1) in enumerate(row_boxes):
    for c_idx, (x0, x1) in enumerate(col_boxes):
        cell = img.crop((x0, y0, x1, y1))
        # Skalakan sedikit cell jika lebarnya 236x139 ke standar 240x140
        cell_scaled = cell.resize((240, 140), Image.Resampling.LANCZOS)
        tw, th = cell_scaled.size
        pix = cell_scaled.load()
        
        cx_src, cy_src = 120.0, 60.0
        
        clean = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))
        cpix = clean.load()
        
        for y in range(out_h):
            for x in range(out_w):
                dx = abs(x + 0.5 - cx_out) / 120.0
                dy = abs(y + 0.5 - cy_out) / 60.0
                d = dx + dy
                if d <= 1.02:
                    # Inward sampling: buang 14% terluar agar tidak ada outline gelap/gigi gerigi
                    if d <= 0.86:
                        sx = int(cx_src + (x - cx_out))
                        sy = int(cy_src + (y - cy_out))
                    else:
                        scale = 0.86 / d
                        in_x = cx_out + (x - cx_out) * scale
                        in_y = cy_out + (y - cy_out) * scale
                        sx = int(cx_src + (in_x - cx_out))
                        sy = int(cy_src + (in_y - cy_out))
                        
                    sx = max(0, min(tw - 1, sx))
                    sy = max(0, min(th - 1, sy))
                    
                    r_col, g_col, b_col, a_col = pix[sx, sy]
                    
                    # De-fringe: magenta spill suppression
                    if r_col > g_col + 15 and b_col > g_col + 15:
                        # Ganti dengan warna batu netral
                        r_col, g_col, b_col = 140, 138, 130
                    elif b_col > g_col and b_col > 120 and r_col > 120:
                        b_col = int(g_col * 0.8)
                        
                    # Anti-aliased smooth edge (d from 0.98 to 1.02)
                    if d > 0.98:
                        alpha = int(255 * (1.02 - d) / 0.04)
                        cpix[x, y] = (r_col, g_col, b_col, max(0, min(255, alpha)))
                    else:
                        cpix[x, y] = (r_col, g_col, b_col, 255)
                        
        out_name = f'stone_{idx:02d}.png'
        out_path = os.path.join(OUT_DIR, out_name)
        clean.save(out_path)
        print(f"Extracted & smoothed {out_name}: {clean.size}")
        idx += 1

print("\nSukses mengekstrak dan menghaluskan 16 ubin jalan batu isometrik!")
