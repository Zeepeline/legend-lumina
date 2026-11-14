from PIL import Image

src_path = '/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg'
img = Image.open(src_path).convert('RGB')

# Let's inspect each action's count of frames from visual layout:
# Idle: top row, label 'Idle' at x~250. How many sprites to the right of 'Idle'?
# Walk: second row, label 'Walk'. How many sprites?
# Run: third row, label 'Run'. How many sprites?
# Attack (Shoot): row 4 left.
# Attack (Arrow Rain): row 4 right.
# Attack (Melee): row 5 left.
# Hurt: row 5 right.
# Death: row 6 left.
# Spawn: row 6 right.
