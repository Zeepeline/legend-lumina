from PIL import Image

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGBA')
w, h = img.size

# Look at rows:
# Looking at the image:
# Top left:
# - Portrait at x=10..220, y=10..240 with 'Goblin Archer (Normal)' header and color palette
# Rows to the right of portrait:
# Row 0: y=15..85: 'Idle' badge + 7 frames
# Row 1: y=105..175: 'Walk' badge + 8 frames
# Row 2: y=190..270: 'Run' badge + 8 frames
#
# Below portrait:
# Row 3: y=290..375:
#   Left: 'Attack (Shoot)' badge + 5 frames
#   Right: 'Attack (Arrow Rain)' badge + 5 frames
# Row 4: y=390..475:
#   Left: 'Attack (Melee)' badge + 5 frames
#   Right: 'Hurt' badge + 4 frames
# Row 5: y=490..570:
#   Left: 'Death' badge + 5 frames
#   Right: 'Spawn' badge + 5 frames
# Row 6: y=590..675:
#   Left: 'FX (Poison / Status)' badge + 5 frames
#   Right: 'Additional' badge + FX sprites

# Let's verify frame counts by scanning pixel columns in those regions!
