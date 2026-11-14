from PIL import Image

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGB')

# Let's inspect where badges are:
# In Idle band [275..960, 20..85], what is cluster 0 (275, 354)?
# Let's check max y in (275, 354)
c0_y = [y for y in range(20, 85) if any(max(img.getpixel((x, y))) > 20 for x in range(275, 354))]
print("Idle cluster 0 y range:", min(c0_y), max(c0_y))

# Let's check what x ranges Idle has:
# In user image: 'Idle' badge is at x~250..295, y~13..33.
# The goblin sprites are:
# 1: x~285..350
# 2: x~375..435
# 3: x~450..508
# 4: x~534..598
# 5: x~625..687
# 6: x~710..769
# 7: x~792..859
# 8: x~877..942
# That's 8 sprites in Idle? Wait! Let's count them!
