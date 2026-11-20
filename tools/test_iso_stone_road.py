import random
from PIL import Image

TILE_GRASS = 'assets/img/iso/tiles/'
TILE_STONE = 'assets/img/iso/tiles_stone/'
BLOCK_DIR = 'assets/img/iso/blocks/'

# Muat ubin rumput dan batu
g_tiles = [Image.open(f'{TILE_GRASS}grass_{i:02d}.png').convert('RGBA') for i in range(16)]
s_tiles = [Image.open(f'{TILE_STONE}stone_{i:02d}.png').convert('RGBA') for i in range(16)]

# Muat balok tebing & tangga
b_full = Image.open(f'{BLOCK_DIR}block_00_cliff_full_a.png').convert('RGBA')
b_stairs = Image.open(f'{BLOCK_DIR}block_08_cliff_stairs_stone.png').convert('RGBA')

# Pohon & Hero
tree = Image.open('assets/img/nature/treeA.png').convert('RGBA')
tree = tree.resize((int(tree.width * 1.8), int(tree.height * 1.8)), Image.Resampling.LANCZOS)

arka_sheet = Image.open('assets/img/hero/hero_custom.png').convert('RGBA')
arka = arka_sheet.crop((0, 0, 32, 32))
arka = arka.resize((64, 64), Image.Resampling.NEAREST)

TW = 240
TH = 120
ZH = 85

W, H = 2000, 1400
canv = Image.new('RGBA', (W, H), (14, 18, 24, 255))
OX = W // 2
OY = 120

# 8x8 grid:
# 'G' = Grass
# 'S' = Stone road
# 'P' = Stone plaza
# 'C' = Cliff (z=1)
grid = [
    ['C', 'C', 'C', 'C', 'C', 'G', 'G', 'G'],
    ['C', 'C', 'C', 'C', 'C', 'G', 'G', 'G'],
    ['C', 'C', 'C', 'C', 'C', 'G', 'G', 'G'],
    ['G', 'G', 'stairs', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'S', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'S', 'S', 'P', 'P', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'P', 'P', 'S', 'S'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'S']
]

for y in range(8):
    for x in range(8):
        cell = grid[y][x]
        z = 1 if cell == 'C' else 0
        
        sx = OX + (x - y) * (TW // 2)
        sy = OY + (x + y) * (TH // 2) - z * ZH
        
        if cell == 'C':
            # Balok tebing penuh
            canv.paste(b_full, (sx - b_full.width // 2, sy), b_full)
            # Rumput di atas tebing
            top_tile = g_tiles[4 + (x + y) % 4]
            canv.alpha_composite(top_tile, (sx - 121, sy - 1))
            
        elif cell == 'stairs':
            # Tangga batu menghubungkan dataran tinggi tebing ke jalan batu bawah
            canv.paste(b_stairs, (sx - b_stairs.width // 2, sy), b_stairs)
            
        elif cell == 'S':
            # Jalan setapak batu (variasi ubin tepi batu & rumput)
            s_idx = (x + y * 2) % 4
            tile = s_tiles[s_idx]
            canv.alpha_composite(tile, (sx - 121, sy - 1))
            
        elif cell == 'P':
            # Alun-alun batu paving besar (baris 0 batu polos & baris 3 lumut)
            p_idx = random.choice([0, 1, 2, 3, 12, 13])
            tile = s_tiles[p_idx]
            canv.alpha_composite(tile, (sx - 121, sy - 1))
            
        else: # 'G'
            # Rumput padang & bunga
            g_idx = 4 + (x * 2 + y * 5) % 4 if (x + y) % 2 == 0 else (x * 3 + y * 7) % 4
            tile = g_tiles[g_idx]
            canv.alpha_composite(tile, (sx - 121, sy - 1))

# Tambahkan pohon di atas tebing dan di tepi jalan
tree1_x = OX + (1 - 1) * (TW // 2)
tree1_y = OY + (1 + 1) * (TH // 2) - 1 * ZH + 10
canv.paste(tree, (tree1_x - tree.width // 2, tree1_y - tree.height + 20), tree)

tree2_x = OX + (7 - 2) * (TW // 2)
tree2_y = OY + (7 + 2) * (TH // 2) + 10
canv.paste(tree, (tree2_x - tree.width // 2, tree2_y - tree.height + 20), tree)

# Tambahkan Arka berjalan di atas jalan batu (x=3, y=5)
arka_x = OX + (3 - 5) * (TW // 2)
arka_y = OY + (3 + 5) * (TH // 2) + 10
canv.paste(arka, (arka_x - 32, arka_y - 54), arka)

bbox = canv.getbbox()
res = canv.crop((bbox[0] - 20, bbox[1] - 20, bbox[2] + 20, bbox[3] + 20))
res.save('assets/raw/iso/preview_stone_road_diorama.png')
print(f"Hasil diorama jalan batu disimpan ke assets/raw/iso/preview_stone_road_diorama.png ({res.size})")
