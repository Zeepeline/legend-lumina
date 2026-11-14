from PIL import Image
import os, json

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGB')
w, h = img.size

# Let's write a utility to find bounding boxes of connected components or column clusters
def find_sprites_in_band(y1, y2, x1, x2, count, threshold=20):
    # Scan columns
    col_active = []
    for x in range(x1, x2):
        # sprite pixel check
        # avoid header/badges if any: badges have purple/blue tint and specific y
        active = sum(1 for y in range(y1, y2) if max(img.getpixel((x, y))) > threshold)
        col_active.append(active > 2)
    
    # cluster columns
    clusters = []
    in_c = False
    sx = 0
    for idx, act in enumerate(col_active):
        x = x1 + idx
        if act:
            if not in_c:
                in_c = True
                sx = x
        else:
            if in_c:
                in_c = False
                if x - sx > 8: # min width
                    clusters.append((sx, x))
    if in_c:
        clusters.append((sx, x2))
    
    # Filter out small clusters like arrows flying or tiny badges if any, or merge close ones
    # print found
    print(f"Found {len(clusters)} clusters in [{x1}..{x2}, {y1}..{y2}]: {clusters}")
    return clusters

# Row 1: Idle (x1=280, x2=960, y1=20, y2=85)
idle_clusters = find_sprites_in_band(20, 85, 275, 960, 7)
# Row 2: Walk (x1=270, x2=960, y1=115, y2=185)
walk_clusters = find_sprites_in_band(115, 185, 270, 960, 8)
# Row 3: Run (x1=265, x2=1015, y1=200, y2=275)
run_clusters = find_sprites_in_band(200, 275, 265, 1015, 8)

# Row 4: Shoot (x1=20, x2=550, y1=290, y2=375)
shoot_clusters = find_sprites_in_band(290, 375, 20, 545, 5)
# Row 4: Arrow Rain (x1=560, x2=1015, y1=290, y2=385)
rain_clusters = find_sprites_in_band(290, 385, 560, 1015, 5)

# Row 5: Melee (x1=20, x2=535, y1=395, y2=475)
melee_clusters = find_sprites_in_band(395, 475, 20, 535, 5)
# Row 5: Hurt (x1=550, x2=1010, y1=395, y2=475)
hurt_clusters = find_sprites_in_band(395, 475, 550, 1010, 4)

# Row 6: Death (x1=20, x2=520, y1=490, y2=570)
death_clusters = find_sprites_in_band(490, 570, 20, 520, 5)

