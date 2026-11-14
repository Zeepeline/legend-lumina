from PIL import Image

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGB')

# Let's count goblins in row 1:
# Let's crop individual images into a debug folder to visually confirm
import os
os.makedirs('/tmp/archer_debug', exist_ok=True)

# Save the row strips
img.crop((240, 10, 1000, 90)).save('/tmp/archer_debug/row_idle.png')
img.crop((240, 95, 1000, 185)).save('/tmp/archer_debug/row_walk.png')
img.crop((240, 185, 1015, 275)).save('/tmp/archer_debug/row_run.png')
img.crop((10, 275, 1015, 385)).save('/tmp/archer_debug/row_shoot_rain.png')
img.crop((10, 385, 1015, 480)).save('/tmp/archer_debug/row_melee_hurt.png')
img.crop((10, 480, 1015, 580)).save('/tmp/archer_debug/row_death_spawn.png')
print('Debug strips saved in /tmp/archer_debug')
