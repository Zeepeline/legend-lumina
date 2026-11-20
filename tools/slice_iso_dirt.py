import os
from PIL import Image

SRC = 'assets/raw/iso/tanah/tepi_tanah.png'
OUT_DIR = 'assets/img/iso/tiles_dirt/'
INGAME_DIR = 'assets/img/iso/ingame_32x16/'
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(INGAME_DIR, exist_ok=True)

img = Image.open(SRC).convert('RGBA')

col_boxes = [
    (8, 248),
    (264, 504),
    (521, 760),
    (776, 1016)
]

row_boxes = [
    (67, 195),
    (312, 442),
    (568, 698),
    (824, 954)
]

out_w, out_h = 242, 122
cx_out, cy_out = 121.0, 61.0

idx = 0
for r_idx, (y0, y1) in enumerate(row_boxes):
    for c_idx, (x0, x1) in enumerate(col_boxes):
        cell = img.crop((x0, y0, x1, y1))
        cell_scaled = cell.resize((240, 130), Image.Resampling.LANCZOS)
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
                    
                    # Defringe magenta
                    if r_col > g_col + 25 and b_col > g_col + 25:
                        r_col, g_col, b_col = 160, 128, 80
                    elif b_col > g_col and b_col > 120 and r_col > 120:
                        b_col = int(g_col * 0.75)
                        
                    if d > 0.98:
                        alpha = int(255 * (1.02 - d) / 0.04)
                        cpix[x, y] = (r_col, g_col, b_col, max(0, min(255, alpha)))
                    else:
                        cpix[x, y] = (r_col, g_col, b_col, 255)
                        
        out_name = f'dirt_{idx:02d}.png'
        clean.save(os.path.join(OUT_DIR, out_name))
        
        # Downscale to in-game 32x16
        small = clean.resize((32, 16), Image.Resampling.LANCZOS)
        small.save(os.path.join(INGAME_DIR, f'tile_dirt_{idx:02d}.png'))
        idx += 1

print(f'Sukses mengekstrak 16 ubin tanah ke {OUT_DIR} dan {INGAME_DIR}!')
