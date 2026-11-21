import os, sys, math
from PIL import Image, ImageDraw

arka_img = Image.open('assets/img/hero/hero_arka.png')

# Exact hand positions (x, y in Arka's 48x40 frame) & sword angles (radians) & hand layer (front/back)
# 0 rad = horizontal right (0 degrees)
# -1.57 rad = vertical up (-90 degrees)
# +1.57 rad = vertical down (+90 degrees)
HAND_CALIBRATION = {
    # Hit 1 (Downward slash)
    ('atk1', 0): {'hand': (21, 21), 'angle': -2.4, 'desc': 'Windup pulled back over shoulder'},
    ('atk1', 1): {'hand': (31, 25), 'angle': -1.1, 'desc': 'Coiling forward down'},
    ('atk1', 2): {'hand': (33, 26), 'angle': 0.45, 'desc': 'Full strike downward sweep'},
    ('atk1', 3): {'hand': (28, 29), 'angle': 0.95, 'desc': 'Follow-through near ground'},
    
    # Hit 2 (Upward diagonal cleave)
    ('atk2', 0): {'hand': (24, 27), 'angle': 2.5,  'desc': 'Windup low behind hip'},
    ('atk2', 1): {'hand': (27, 26), 'angle': 1.8,  'desc': 'Sweeping forward up'},
    ('atk2', 2): {'hand': (31, 22), 'angle': -0.7, 'desc': 'Rising upward cleave'},
    ('atk2', 3): {'hand': (29, 21), 'angle': -1.2, 'desc': 'High follow-through apex'},

    # Hit 3 (Piercing Mach Thrust)
    ('atk3', 0): {'hand': (24, 25), 'angle': 0.05, 'desc': 'Chambered at chest level'},
    ('atk3', 1): {'hand': (25, 23), 'angle': 0.0,  'desc': 'Tension coil pointing forward'},
    ('atk3', 2): {'hand': (32, 27), 'angle': 0.0,  'desc': 'Full extension rocket lunge'},
    ('atk3', 3): {'hand': (29, 25), 'angle': 0.0,  'desc': 'Vibrating lock-out'},

    # Rest / Sheathe
    ('idle', 0): {'hand': (25, 26), 'angle': 1.35, 'desc': 'Katana resting at side'},
    ('idle', 1): {'hand': (25, 25), 'angle': 1.45, 'desc': 'Katana sheathed in scabbard'},
    ('idle', 2): {'hand': (25, 26), 'angle': 1.35, 'desc': 'Idle rest'},
    ('idle', 3): {'hand': (25, 25), 'angle': 1.5,  'desc': 'Idle click'}
}

# Colors matching Arka's official palette
SKIN_LIGHT = (253, 207, 164, 255)
SKIN_MID   = (230, 147, 111, 255)
SKIN_DARK  = (170, 88, 77, 255)
SKIN_EDGE  = (58, 28, 34, 255)

SWD_GOLD   = (244, 208, 112, 255)
SWD_GOLD_D = (192, 144, 40, 255)
SWD_STEEL  = (220, 230, 248, 255)
SWD_SHINE  = (255, 255, 255, 255)
SWD_EDGE   = (110, 126, 154, 255)
SWD_GRIP   = (70, 42, 26, 255)

def draw_sword_in_hand(base_img, hx, hy, angle_rad, length=22):
    """Draws the Lumina sword seamlessly baked into Arka's hand with fingers wrapped over the grip"""
    d = ImageDraw.Draw(base_img)
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    
    # 1. Hilt / Grip (passes through palm from behind to in front)
    # Grip extends 4px behind the hand (pommel) and 2px in front (to guard)
    p_back_x = int(hx - cos_a * 5)
    p_back_y = int(hy - sin_a * 5)
    p_fwd_x  = int(hx + cos_a * 2)
    p_fwd_y  = int(hy + sin_a * 2)
    
    # Draw grip line
    d.line([(p_back_x, p_back_y), (p_fwd_x, p_fwd_y)], fill=SWD_GRIP, width=2)
    # Pommel (gold cap at back of grip)
    d.point((p_back_x, p_back_y), fill=SWD_GOLD)
    
    # 2. Guard (Crossguard perpendicular to blade, placed at p_fwd)
    gx0 = int(p_fwd_x - sin_a * 3)
    gy0 = int(p_fwd_y + cos_a * 3)
    gx1 = int(p_fwd_x + sin_a * 3)
    gy1 = int(p_fwd_y - cos_a * 3)
    d.line([(gx0, gy0), (gx1, gy1)], fill=SWD_GOLD, width=1)
    d.point((int((gx0+gx1)/2), int((gy0+gy1)/2)), fill=SWD_GOLD_D)
    
    # 3. Steel Blade (extends from guard to needle tip)
    tip_x = int(p_fwd_x + cos_a * length)
    tip_y = int(p_fwd_y + sin_a * length)
    
    # Dual-tone blade (spine + cutting edge)
    d.line([(p_fwd_x, p_fwd_y), (tip_x, tip_y)], fill=SWD_SHINE, width=2)
    # Edge shadow line
    d.line([(int(p_fwd_x - sin_a), int(p_fwd_y + cos_a)), 
            (int(tip_x - sin_a), int(tip_y + cos_a))], fill=SWD_EDGE, width=1)
    # Bright needle tip
    d.point((tip_x, tip_y), fill=SWD_SHINE)
    
    # 4. FINGERS WRAPPING OVER THE GRIP (This is what makes it physically in the hand!)
    # Draw knuckles & fingers directly over (hx, hy)
    d.rectangle([hx - 1, hy - 1, hx + 1, hy + 1], fill=SKIN_MID)
    d.point((hx, hy - 1), fill=SKIN_LIGHT) # knuckle highlight
    d.point((hx, hy + 1), fill=SKIN_DARK)  # finger crease shadow
    d.point((hx + 1, hy), fill=SKIN_EDGE)  # palm edge

print("Testing calibration...")
for (kind, f), data in HAND_CALIBRATION.items():
    row = 11 if kind == 'atk1' else (12 if kind == 'atk2' else (15 if kind == 'atk3' else 4))
    f_arka = arka_img.crop((f * 48, row * 40, (f + 1) * 48, (row + 1) * 40)).copy()
    hx, hy = data['hand']
    draw_sword_in_hand(f_arka, hx, hy, data['angle'])
    f_arka.save(f'/tmp/calib_{kind}_f{f}.png')
print("Successfully generated calibrated hand frames in /tmp/calib_*")
