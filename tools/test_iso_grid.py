import random
from PIL import Image

OUT_DIR = 'assets/img/iso/tiles/'

# Muat ke-16 ubin yang sudah dibersihkan total dari gerigi & outline
tiles = [Image.open(f'{OUT_DIR}grass_{i:02d}.png').convert('RGBA') for i in range(16)]

TW = 240
TH = 120

# Buat canvas untuk grid isometrik 6x6
GRID_N = 6
CANV_W = (GRID_N + GRID_N) * (TW // 2) + 200
CANV_H = (GRID_N + GRID_N) * (TH // 2) + 250

canvas = Image.new('RGBA', (CANV_W, CANV_H), (15, 18, 24, 255))

OX = CANV_W // 2
OY = 60

random.seed(42)

# Susun ubin lantai rumput alami (row 0: polos, row 1: bunga/semanggi, row 3: batu kecil)
for y in range(GRID_N):
    for x in range(GRID_N):
        if x == 0 or y == 0:
            tile_idx = random.choice([0, 1, 2, 3])
        elif x == 3 and y == 3:
            tile_idx = 14 # Batu besar di tengah
        elif (x + y) % 3 == 0:
            tile_idx = random.choice([4, 5, 6, 7]) # Bunga putih/kuning & semanggi
        elif (x + y) % 4 == 0:
            tile_idx = random.choice([12, 13, 15]) # Variasi kerikil/batu kecil
        else:
            tile_idx = random.choice([0, 1, 2, 3])
            
        tile = tiles[tile_idx]
        
        # Posisi isometrik persis: tile 242x122 memiliki offset pusat di (121, 61)
        sx = OX + (x - y) * (TW // 2) - 121
        sy = OY + (x + y) * (TH // 2) - 1
        
        # alpha_composite memberikan blending tepi yang halus (anti-aliased) tanpa gerigi kaku
        canvas.alpha_composite(tile, (sx, sy))

bbox = canvas.getbbox()
result = canvas.crop((bbox[0] - 20, bbox[1] - 20, bbox[2] + 20, bbox[3] + 20))
result.save('assets/raw/iso/preview_iso_tiled_map.png')
print(f"Hasil susunan isometrik disimpan ke assets/raw/iso/preview_iso_tiled_map.png ({result.size})")
