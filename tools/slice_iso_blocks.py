import os
from PIL import Image

SRC = 'assets/raw/iso/tanah/tebing_rumput.png'
OUT_DIR = 'assets/img/iso/blocks/'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC).convert('RGBA')
W, H = img.size
cols, rows = 4, 4
cw = W // cols
ch = H // rows

def clean_block(tile):
    pix = tile.load()
    tw, th = tile.size
    for y in range(th):
        for x in range(tw):
            r, g, b, a = pix[x, y]
            is_magenta = (r > g + 15 and b > g + 15) or \
                         (r > 140 and b > 140 and g < 110) or \
                         (r > 120 and b > 120 and g < 75)
            if is_magenta:
                pix[x, y] = (0, 0, 0, 0)
            elif a > 0:
                # Spill suppression di tepi batu/rumput/air
                if r > g + 10 and b > g + 10:
                    pix[x, y] = (int(g * 0.9), g, int(g * 0.8), a)
    return tile

block_names = [
    'cliff_full_a', 'cliff_full_b', 'cliff_full_c', 'cliff_full_d',
    'cliff_inner_corner', 'cliff_wall_left', 'cliff_wall_right', 'cliff_ramp_slope',
    'cliff_stairs_stone', 'cliff_rocky_jutting', 'cliff_tall_double_a', 'cliff_tall_double_b',
    'cliff_water_shore_a', 'cliff_water_shore_b', 'cliff_water_shore_c', 'cliff_water_shore_d'
]

idx = 0
for r in range(rows):
    for c in range(cols):
        box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
        cell = img.crop(box)
        clean = clean_block(cell)
        bbox = clean.getbbox()
        if bbox:
            cropped = clean.crop(bbox)
        else:
            cropped = clean
            
        out_name = f'block_{idx:02d}_{block_names[idx]}.png'
        out_path = os.path.join(OUT_DIR, out_name)
        cropped.save(out_path)
        print(f"Extracted & defringed {out_name}: {cropped.size}")
        idx += 1

print("\nSukses mengekstrak 16 balok tebing isometrik tanpa halo magenta!")
