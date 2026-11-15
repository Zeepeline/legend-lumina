import os
from PIL import Image, ImageDraw, ImageFont

# Path referensi dan render
ref_path = "/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794725932314_5fcdb7f1.jpg"
render_path = "/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/village_all_dirt_and_lush_trees.png"

ref_img = Image.open(ref_path).convert("RGB")
render_img = Image.open(render_path).convert("RGB")

# Target height 720
target_h = 720
ref_w = int(ref_img.width * (target_h / ref_img.height))
ref_resized = ref_img.resize((ref_w, target_h), Image.Resampling.LANCZOS)

render_w = int(render_img.width * (target_h / render_img.height))
render_resized = render_img.resize((render_w, target_h), Image.Resampling.LANCZOS)

total_w = ref_w + render_w + 20
banner_h = 60
comp = Image.new("RGB", (total_w, target_h + banner_h), (25, 25, 30))

draw = ImageDraw.Draw(comp)

# Banner header
draw.rectangle([(0, 0), (total_w, banner_h)], fill=(18, 20, 24))
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
except:
    font = ImageFont.load_default()
    font_sub = font

draw.text((ref_w // 2 - 140, 18), "REFERENSI TARGET AWAL", fill=(255, 215, 0), font=font)
draw.text((ref_w + 20 + render_w // 2 - 230, 18), "HASIL: JALAN TANAH ALAMI + PEPOHONAN RINDANG", fill=(100, 255, 120), font=font)

# Paste images
comp.paste(ref_resized, (0, banner_h))
# Separator line
draw.line([(ref_w + 10, banner_h), (ref_w + 10, target_h + banner_h)], fill=(80, 80, 90), width=4)
comp.paste(render_resized, (ref_w + 20, banner_h))

out_path = "/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/village_dirt_roads_and_trees_side_by_side.png"
comp.save(out_path, quality=95)
print("Saved comparison side by side to:", out_path)
