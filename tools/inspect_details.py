from PIL import Image

cleaned = Image.open('/tmp/archer_sprites/cleaned_sheet.png')

# Let's inspect Shoot: (11, 195)
# In row 280..380, why is (11, 195) so wide?
# Because the badge was at 8..120, did any pixel remain? Let's check:
for x in range(11, 195):
    ys = [y for y in range(280, 380) if cleaned.getpixel((x, y))[3] > 0]
    if ys:
        print(f"x={x}: y={min(ys)}..{max(ys)}")
        break
for x in range(194, 11, -1):
    ys = [y for y in range(280, 380) if cleaned.getpixel((x, y))[3] > 0]
    if ys:
        print(f"end x={x}: y={min(ys)}..{max(ys)}")
        break

