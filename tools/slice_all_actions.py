from PIL import Image
import os, json

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
src = Image.open(src_path).convert('RGBA')

# Let's write a robust segmentation for all actions.
# We remove dark badge colors or isolate them by coordinate.
# Badges:
# - 'Idle': x: 245..295, y: 10..35
# - 'Walk': x: 245..295, y: 100..125
# - 'Run': x: 245..295, y: 190..215
# - 'Attack (Shoot)': x: 10..115, y: 285..315
# - 'Attack (Arrow Rain)': x: 535..675, y: 285..315
# - 'Attack (Melee)': x: 10..115, y: 385..415
# - 'Hurt': x: 540..585, y: 385..415
# - 'Death': x: 10..60, y: 485..515
# - 'Spawn': x: 540..600, y: 485..515

# Let's zero out badge areas in a copy of src:
cleaned = src.copy()
badges = [
    (240, 10, 298, 38),   # Idle
    (240, 100, 298, 128), # Walk
    (240, 190, 295, 218), # Run
    (8, 285, 120, 315),   # Attack (Shoot)
    (530, 285, 680, 315), # Attack (Arrow Rain)
    (8, 385, 120, 415),   # Attack (Melee)
    (540, 385, 595, 415), # Hurt
    (8, 485, 75, 515),    # Death
    (535, 485, 615, 515), # Spawn
]
for (bx1, by1, bx2, by2) in badges:
    for x in range(bx1, bx2):
        for y in range(by1, by2):
            cleaned.putpixel((x, y), (0, 0, 0, 0))

# Also zero out portrait area in top left: x: 0..245, y: 0..280
for x in range(0, 245):
    for y in range(0, 280):
        cleaned.putpixel((x, y), (0, 0, 0, 0))

# Also zero out bottom area: y >= 580 (FX / Additional)
for x in range(src.width):
    for y in range(580, src.height):
        cleaned.putpixel((x, y), (0, 0, 0, 0))

# Make black background transparent (threshold brightness <= 18)
for x in range(cleaned.width):
    for y in range(cleaned.height):
        r, g, b, a = cleaned.getpixel((x, y))
        if max(r, g, b) <= 15:
            cleaned.putpixel((x, y), (0, 0, 0, 0))

os.makedirs('/tmp/archer_sprites', exist_ok=True)
cleaned.save('/tmp/archer_sprites/cleaned_sheet.png')
print("Cleaned sheet saved.")
