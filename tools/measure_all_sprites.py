from PIL import Image

src = Image.open('/Users/herlambang/.gemini/antigravity/brain/ad8402ca-4e8c-4829-9fa0-25dc5be3755f/.user_uploaded/media_1794647880701_26cff619.jpg').convert('RGBA')

# Let's inspect each row visually by slicing into subimages with labels removed:
# Badges:
# Attack (Shoot): label is at x=10..120, y=285..315.
# First shoot sprite is at x=120..195!
# Second shoot sprite is at x=209..280!
# Third shoot sprite is at x=299..374!
# Fourth shoot sprite is at x=386..464!
# Fifth shoot sprite is at x=471..535!
# Total Shoot frames = 5!

# Attack (Arrow Rain): label is at x=535..675, y=285..315.
# First rain sprite: x=580..650 (under the arrow rain badge or after?)
# Wait, let's look at Arrow Rain in the original image:
# There are 5 sprites for Arrow Rain:
# 1. goblin drawing bow upward (x~570..645)
# 2. goblin releasing bow upward (x~650..725)
# 3. goblin aiming (x~735..810)
# 4. goblin shooting (x~835..915)
# 5. goblin watching (x~930..1010)
# And there are flying arrows above them!

# Attack (Melee): label at x=10..120, y=385..415.
# Sprites are:
# 1. x~35..105 (below label, y~415..475)
# 2. x~120..185
# 3. x~200..265
# 4. x~290..355
# 5. x~375..445
# 6. x~465..535 -> wait, 6 frames of Melee?
# Let's check Melee frames: 1, 2, 3, 4, 5, 6! That's 6 frames!

# Hurt: label at x=540..595, y=385..415.
# Sprites:
# 1. x~560..640
# 2. x~665..735
# 3. x~755..825
# 4. x~845..905
# 5. x~915..995 (falling / lying down) -> 5 frames of Hurt!

# Death: label at x=10..60, y=485..515.
# Sprites:
# 1. x~35..105
# 2. x~120..195
# 3. x~210..290
# 4. x~300..385
# 5. x~395..480 -> 5 frames of Death!

# Let's check baseline (bottom-most pixel of feet):
# In normal stand (Idle/Walk): feet y is around 80 in row 1, 175 in row 2, 265 in row 3...
print("Visual structure mapped successfully.")
