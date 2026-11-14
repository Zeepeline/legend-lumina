from PIL import Image

cleaned = Image.open('/tmp/archer_sprites/cleaned_sheet.png')
w, h = cleaned.size

def get_row_sprites(y1, y2, x_start=0, x_end=1024, min_w=15, gap_thresh=6):
    col_has = []
    for x in range(x_start, x_end):
        has = any(cleaned.getpixel((x, y))[3] > 0 for y in range(y1, y2))
        col_has.append(has)
    
    clusters = []
    in_c = False
    sx = 0
    consecutive_empty = 0
    for idx, has in enumerate(col_has):
        x = x_start + idx
        if has:
            if not in_c:
                in_c = True
                sx = x
            consecutive_empty = 0
        else:
            if in_c:
                consecutive_empty += 1
                if consecutive_empty >= gap_thresh:
                    in_c = False
                    ex = x - consecutive_empty + 1
                    if ex - sx >= min_w:
                        clusters.append((sx, ex))
                    consecutive_empty = 0
    if in_c:
        ex = x_end - consecutive_empty
        if ex - sx >= min_w:
            clusters.append((sx, ex))
    return clusters

print("Idle (y 10..90):", get_row_sprites(10, 90, 240, 1000))
print("Walk (y 95..185):", get_row_sprites(95, 185, 240, 1000))
print("Run (y 185..275):", get_row_sprites(185, 275, 240, 1015))
print("Shoot (y 280..380):", get_row_sprites(280, 380, 10, 530))
print("Rain (y 280..380):", get_row_sprites(280, 380, 530, 1015))
print("Melee (y 385..480):", get_row_sprites(385, 480, 10, 530))
print("Hurt (y 385..480):", get_row_sprites(385, 480, 530, 1015))
print("Death (y 480..580):", get_row_sprites(480, 580, 10, 530))
print("Spawn (y 480..580):", get_row_sprites(480, 580, 530, 1015))

