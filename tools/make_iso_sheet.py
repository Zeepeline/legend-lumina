from PIL import Image

OUT_DIR = 'assets/img/iso/ingame_32x16/'
sheet = Image.new('RGBA', (128, 64), (0, 0, 0, 0))

for r in range(4):
    for c in range(4):
        idx = r * 4 + c
        tile = Image.open(f'{OUT_DIR}tile_grass_{idx:02d}.png').convert('RGBA')
        sheet.paste(tile, (c * 32, r * 16))

sheet.save('assets/img/iso/iso_tileset_32x16.png')
print("Saved assets/img/iso/iso_tileset_32x16.png (128x64)")
