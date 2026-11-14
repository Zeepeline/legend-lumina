from PIL import Image

img = Image.open('/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg').convert('RGB')
w, h = img.size

# Let's inspect each row of sprites:
# Row 0: Idle (starts after label 'Idle')
# Row 1: Walk
# Row 2: Run
# Row 3: Attack (Shoot) / Attack (Arrow Rain)
# Row 4: Attack (Melee) / Hurt
# Row 5: Death / Spawn
# Row 6: FX / Additional

# Let's find columns with gaps (>25 threshold)
def get_boxes_in_y_range(y1, y2, x_min=0, x_max=1024):
    col_active = []
    for x in range(x_min, x_max):
        active = any(max(img.getpixel((x, y))) > 20 for y in range(y1, y2))
        col_active.append(active)
    
    boxes = []
    in_box = False
    start_x = 0
    for idx, act in enumerate(col_active):
        x = x_min + idx
        if act:
            if not in_box:
                in_box = True
                start_x = x
        else:
            if in_box:
                in_box = False
                if x - start_x > 10:
                    boxes.append((start_x, x))
    if in_box:
        boxes.append((start_x, x_max))
    return boxes

print("Row 1 (around y 10..90):", get_boxes_in_y_range(10, 90, x_min=240))
print("Row 2 (around y 100..180):", get_boxes_in_y_range(100, 180, x_min=240))
print("Row 3 (around y 190..275):", get_boxes_in_y_range(190, 275, x_min=240))
print("Row 4 (around y 280..380):", get_boxes_in_y_range(280, 380, x_min=0))
print("Row 5 (around y 390..475):", get_boxes_in_y_range(390, 475, x_min=0))
print("Row 6 (around y 480..570):", get_boxes_in_y_range(480, 570, x_min=0))
