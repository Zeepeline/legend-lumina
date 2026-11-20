import math
from PIL import Image

TILE_DIR = 'assets/img/iso/tiles/'
BLOCK_DIR = 'assets/img/iso/blocks/'

# Muat ubin belah ketupat yang sudah dihaluskan
g_tiles = [Image.open(f'{TILE_DIR}grass_{i:02d}.png').convert('RGBA') for i in range(16)]

# Muat balok tebing yang sudah didefringe
b_full = Image.open(f'{BLOCK_DIR}block_00_cliff_full_a.png').convert('RGBA')
b_ramp = Image.open(f'{BLOCK_DIR}block_07_cliff_ramp_slope.png').convert('RGBA')
b_stairs = Image.open(f'{BLOCK_DIR}block_08_cliff_stairs_stone.png').convert('RGBA')
b_water1 = Image.open(f'{BLOCK_DIR}block_12_cliff_water_shore_a.png').convert('RGBA')
b_water2 = Image.open(f'{BLOCK_DIR}block_13_cliff_water_shore_b.png').convert('RGBA')

# Pohon & Arka
tree = Image.open('assets/img/nature/treeA.png').convert('RGBA')
tree = tree.resize((int(tree.width * 1.8), int(tree.height * 1.8)), Image.Resampling.LANCZOS)

arka_sheet = Image.open('assets/img/hero/hero_custom.png').convert('RGBA')
arka = arka_sheet.crop((0, 0, 32, 32))
arka = arka.resize((64, 64), Image.Resampling.NEAREST)

TW = 240
TH = 120
ZH = 85

W, H = 1920, 1280
canv = Image.new('RGBA', (W, H), (14, 18, 24, 255))
OX = W // 2
OY = 160

grid_z = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

for y in range(8):
    for x in range(8):
        z = grid_z[y][x]
        sx = OX + (x - y) * (TW // 2)
        sy = OY + (x + y) * (TH // 2) - z * ZH
        
        if z == 0:
            if x >= 5 and y >= 5:
                tile = b_water1 if (x+y)%2 == 0 else b_water2
                canv.paste(tile, (sx - tile.width // 2, sy), tile)
            else:
                t_idx = (x * 3 + y * 7) % 8
                tile = g_tiles[t_idx]
                canv.alpha_composite(tile, (sx - 121, sy - 1))
                
        elif z == 1:
            if x == 4 and y == 5:
                tile = b_stairs
                canv.paste(tile, (sx - tile.width // 2, sy), tile)
            elif x == 2 and y == 4:
                tile = b_ramp
                canv.paste(tile, (sx - tile.width // 2, sy), tile)
            else:
                tile = b_full
                canv.paste(tile, (sx - tile.width // 2, sy), tile)
                
            top_tile = g_tiles[4 + (x + y) % 4]
            canv.alpha_composite(top_tile, (sx - 121, sy - 1))

tree_x = OX + (3 - 3) * (TW // 2)
tree_y = OY + (3 + 3) * (TH // 2) - 1 * ZH + 10
canv.paste(tree, (tree_x - tree.width // 2, tree_y - tree.height + 20), tree)

arka_x = OX + (4 - 4) * (TW // 2)
arka_y = OY + (4 + 4) * (TH // 2) - 1 * ZH + 10
canv.paste(arka, (arka_x - 32, arka_y - 54), arka)

bbox = canv.getbbox()
res = canv.crop((bbox[0] - 30, bbox[1] - 30, bbox[2] + 30, bbox[3] + 30))
res.save('assets/raw/iso/preview_layered_terrain_diorama.png')
print(f"Hasil diorama disimpan ke assets/raw/iso/preview_layered_terrain_diorama.png ({res.size})")
