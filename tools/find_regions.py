from PIL import Image

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGB')
w, h = img.size

# Let's inspect where pixels > 25 are per row, between x=250 and x=1020
row_active = []
for y in range(h):
    cnt = sum(1 for x in range(250, w) if max(img.getpixel((x, y))) > 25)
    row_active.append(cnt)

# Print intervals of rows that have active sprites
in_band = False
start_y = 0
bands = []
for y in range(h):
    if row_active[y] > 10:
        if not in_band:
            in_band = True
            start_y = y
    else:
        if in_band:
            in_band = False
            if y - start_y > 15: # substantial height
                bands.append((start_y, y))

for idx, (sy, ey) in enumerate(bands):
    print(f"Band {idx}: y={sy}..{ey} (height {ey-sy})")
