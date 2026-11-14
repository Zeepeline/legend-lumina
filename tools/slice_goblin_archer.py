from PIL import Image

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGB')
w, h = img.size

# Let's inspect horizontal lines with text or content
# Sum brightness along columns and rows
row_brightness = [sum(sum(img.getpixel((x, y))) for x in range(w)) / (w * 3) for y in range(h)]
for y in range(0, h, 20):
    print(f"y={y:3d}: avg={row_brightness[y]:.1f}")
