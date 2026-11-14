from PIL import Image

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGB')
w, h = img.size

# Check where labels are: labels have distinct color/banner shape
# E.g. x < 250
for y in range(0, h, 20):
    active_left = sum(1 for x in range(0, 200) if max(img.getpixel((x, y))) > 30)
    # print sample
# Let's crop sample slices to visualize or inspect
# Band 0 (y=7..90): Idle row (labels 'Idle' is usually near x=250 or left)
# Let's inspect x distribution in each band!
