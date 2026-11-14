from PIL import Image

# Let's inspect row_idle.png
idle_img = Image.open('/tmp/archer_debug/row_idle.png')
w, h = idle_img.size
# Find where badge is: badge has bluish/purple text 'Idle' inside a dark rounded box
# Pixels in badge:
# Let's look at colors: badge has background ~(20, 20, 50) and borders ~(70, 70, 130)
# Let's see non-black columns:
col_sums = [sum(sum(idle_img.getpixel((x, y))) for y in range(h)) for x in range(w)]
# Find intervals where col_sums > 200
intervals = []
in_int = False
sx = 0
for x, s in enumerate(col_sums):
    if s > 200:
        if not in_int:
            in_int = True
            sx = x
    else:
        if in_int:
            in_int = False
            intervals.append((sx, x))
if in_int: intervals.append((sx, w))

print("row_idle intervals (relative to x=240):")
for idx, (x1, x2) in enumerate(intervals):
    # crop and check
    sub = idle_img.crop((x1, 0, x2, h))
    sub.save(f'/tmp/archer_debug/idle_{idx}.png')
    print(f"  {idx}: x={x1}..{x2} (w={x2-x1}) saved as idle_{idx}.png")
