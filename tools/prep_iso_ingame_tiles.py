import os
from PIL import Image

TILE_DIR = 'assets/img/iso/tiles/'
OUT_DIR = 'assets/img/iso/ingame_32x16/'
os.makedirs(OUT_DIR, exist_ok=True)

# 16 ubin rumput 32x16
for i in range(16):
    img = Image.open(f'{TILE_DIR}grass_{i:02d}.png').convert('RGBA')
    # Resize ke 32x16 menggunakan Lanczos
    scaled = img.resize((32, 16), Image.Resampling.LANCZOS)
    
    # Diamond mask 2:1 dengan anti-aliased feather lembut di tepi luar
    pix = scaled.load()
    cx, cy = 16.0, 8.0
    for y in range(16):
        for x in range(32):
            dx = abs(x + 0.5 - cx) / 16.0
            dy = abs(y + 0.5 - cy) / 8.0
            d = dx + dy
            if d <= 1.05:
                r, g, b, a = pix[x, y]
                # Feathering lembut pada 1px tepi luar
                if d > 0.95:
                    fade = (1.05 - d) / 0.10
                    pix[x, y] = (r, g, b, max(0, min(255, int(a * fade))))
                else:
                    pix[x, y] = (r, g, b, 255)
            else:
                pix[x, y] = (0, 0, 0, 0)
                
    out_path = f'{OUT_DIR}tile_grass_{i:02d}.png'
    scaled.save(out_path)
    print(f"Saved {out_path} ({scaled.size})")

# Tangga batu dan tebing batu
b_stairs = Image.open('assets/img/iso/blocks/block_08_cliff_stairs_stone.png').convert('RGBA')
stairs_scaled = b_stairs.resize((32, 28), Image.Resampling.LANCZOS)
stairs_pix = stairs_scaled.load()
for y in range(stairs_scaled.height):
    for x in range(stairs_scaled.width):
        r, g, b, a = stairs_pix[x, y]
        stairs_pix[x, y] = (r, g, b, 255 if a > 120 else 0)
stairs_scaled.save('assets/img/iso/cliff_stairs.png')
print("Saved assets/img/iso/cliff_stairs.png")

# Balok tebing lurus
b_cliff = Image.open('assets/img/iso/blocks/block_00_cliff_full_a.png').convert('RGBA')
cliff_scaled = b_cliff.resize((32, 30), Image.Resampling.LANCZOS)
cliff_pix = cliff_scaled.load()
for y in range(cliff_scaled.height):
    for x in range(cliff_scaled.width):
        r, g, b, a = cliff_pix[x, y]
        cliff_pix[x, y] = (r, g, b, 255 if a > 120 else 0)
cliff_scaled.save('assets/img/iso/cliff_block.png')
print("Saved assets/img/iso/cliff_block.png")

print("\nSemua aset in-game 32x16 selesai dipersiapkan dengan tepi lembut!")
