from PIL import Image
import json, os

src = Image.open('/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg').convert('RGBA')

# Target cell size: same height / scale as goblin_hd
# goblin_hd was 120 x 84.
# Let's see: goblin_hd width 120, height 84, baseline y=78.
CELL_W = 120
CELL_H = 84
BASELINE_Y = 78

# Threshold to remove black background:
def clean_crop(x1, y1, x2, y2, feet_y=None):
    box = src.crop((x1, y1, x2, y2))
    # make black / near-black transparent
    arr = box.load()
    bw, bh = box.size
    min_x, max_x = bw, -1
    min_y, max_y = bh, -1
    for py in range(bh):
        for px in range(bw):
            r, g, b, a = arr[px, py]
            # Ignore badge colors: badges have saturation in blue/purple or black background
            # If max(r,g,b) < 18, it's black background
            if max(r, g, b) < 18:
                arr[px, py] = (0, 0, 0, 0)
            else:
                # keep pixel
                if px < min_x: min_x = px
                if px > max_x: max_x = px
                if py < min_y: min_y = py
                if py > max_y: max_y = py
    
    if max_x < min_x:
        return Image.new('RGBA', (CELL_W, CELL_H), (0, 0, 0, 0))
    
    # Tightly cropped sprite
    sprite = box.crop((min_x, min_y, max_x + 1, max_y + 1))
    sw, sh = sprite.size
    
    # Position in cell (CELL_W, CELL_H)
    cell = Image.new('RGBA', (CELL_W, CELL_H), (0, 0, 0, 0))
    # Center horizontally
    dest_x = (CELL_W - sw) // 2
    # Align feet to BASELINE_Y
    if feet_y is None:
        dest_y = BASELINE_Y - sh
    else:
        # feet relative to box
        sprite_feet_y = (feet_y - y1) - min_y
        dest_y = BASELINE_Y - sprite_feet_y
    
    # Clamp if needed
    if dest_y < 0: dest_y = 0
    if dest_y + sh > CELL_H: dest_y = CELL_H - sh
    
    cell.paste(sprite, (dest_x, dest_y), sprite)
    return cell

# Let's inspect coordinates of all frames:
# We will define exact bounding boxes for each action:
actions = {
    'idle': [
        (295, 20, 360, 84, 82),
        (372, 20, 440, 84, 82),
        (448, 20, 515, 84, 82),
        (530, 20, 603, 84, 82),
        (622, 20, 692, 84, 82),
        (706, 20, 775, 84, 82),
        (788, 20, 863, 84, 82),
        (873, 20, 946, 84, 82),
    ],
    'walk': [
        (280, 110, 363, 182, 178),
        (367, 110, 435, 182, 178),
        (442, 110, 515, 182, 178),
        (519, 110, 598, 182, 178),
        (605, 110, 683, 182, 178),
        (694, 110, 765, 182, 178),
        (779, 110, 854, 182, 178),
        (866, 110, 946, 182, 178),
    ],
    'run': [
        (250, 200, 355, 275, 268),
        (363, 200, 430, 275, 268),
        (438, 200, 510, 275, 268),
        (517, 200, 587, 275, 268),
        (601, 200, 672, 275, 268),
        (696, 200, 766, 275, 268),
        (778, 200, 847, 275, 268),
        (863, 200, 930, 275, 268),
        (944, 200, 1012, 275, 268),
    ],
    'shoot': [
        (120, 290, 196, 375, 370),
        (206, 290, 284, 375, 370),
        (296, 290, 378, 375, 370),
        (383, 290, 467, 375, 370),
        (468, 290, 545, 375, 370),
    ],
    'rain': [
        (575, 280, 655, 385, 370),
        (656, 280, 735, 385, 370),
        (740, 280, 825, 385, 370),
        (840, 280, 925, 385, 370),
        (940, 280, 1020, 385, 370),
    ],
    'melee': [
        (30, 410, 110, 480, 475),
        (118, 410, 188, 480, 475),
        (198, 410, 270, 480, 475),
        (288, 410, 358, 480, 475),
        (370, 410, 452, 480, 475),
        (460, 410, 538, 480, 475),
    ],
    'hurt': [
        (555, 405, 645, 478, 474),
        (665, 405, 740, 478, 474),
        (755, 405, 830, 478, 474),
        (845, 405, 910, 478, 474),
        (915, 405, 1005, 478, 474),
    ],
    'death': [
        (30, 510, 110, 575, 570),
        (120, 510, 198, 575, 570),
        (210, 510, 292, 575, 570),
        (300, 510, 388, 575, 570),
        (390, 510, 520, 575, 570),
    ],
}

total_frames = sum(len(f_list) for f_list in actions.values())
print(f"Total animation frames: {total_frames}")

# We will pack into a sprite sheet of 10 columns by rows:
# 46 frames / 10 cols = 5 rows -> 1200 x 420
COLS = 10
ROWS = (total_frames + COLS - 1) // COLS
sheet = Image.new('RGBA', (COLS * CELL_W, ROWS * CELL_H), (0, 0, 0, 0))

frames_meta = {}
anim_meta = {}

idx = 0
for anim_name, f_list in actions.items():
    anim_frames = []
    for f_idx, box_info in enumerate(f_list):
        x1, y1, x2, y2, feet_y = box_info
        frame_img = clean_crop(x1, y1, x2, y2, feet_y)
        col = idx % COLS
        row = idx // COLS
        px = col * CELL_W
        py = row * CELL_H
        sheet.paste(frame_img, (px, py), frame_img)
        
        frame_key = f"{anim_name}_{f_idx}"
        frames_meta[frame_key] = {
            "frame": {"x": px, "y": py, "w": CELL_W, "h": CELL_H},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL_W, "h": CELL_H},
            "sourceSize": {"w": CELL_W, "h": CELL_H},
            "duration": 110
        }
        anim_frames.append(frame_key)
        idx += 1
    
    anim_meta[anim_name] = {
        "frames": anim_frames,
        "frameRate": 9 if anim_name in ['walk', 'rain', 'melee'] else (11 if anim_name == 'run' else 8),
        "repeat": -1 if anim_name in ['idle', 'walk', 'run'] else 0
    }

out_img_path = 'assets/img/mon_goblin_archer_hd.png'
out_json_path = 'assets/data/goblin_archer.json'

sheet.save(out_img_path)
with open(out_json_path, 'w') as f:
    json.dump({
        "frames": frames_meta,
        "animations": anim_meta,
        "meta": {
            "image": "mon_goblin_archer_hd.png",
            "size": {"w": sheet.width, "h": sheet.height},
            "scale": "1"
        }
    }, f, indent=2)

print(f"Saved {out_img_path} ({sheet.size}) and {out_json_path}")
