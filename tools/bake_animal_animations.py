#!/usr/bin/env python3
"""
bake_animal_animations.py
Membuat sprite sheet animasi 4 frame (128x32 px) untuk 5 hewan di Legenda Lumina:
- rabbit: Idle Sniff -> Crouch -> Airborne Hop -> Landing
- squirrel: Hold Nut -> Nibble/Chew -> Alert Look-Up -> Tail Flick/Settle
- deer: Standing Proud -> Lower Head -> Grazing Nibble -> Raise & Hoof Step
- duck: Resting Stand -> Waddle Step -> Peck/Dabble -> Wing Flutter
- owl: Perched Idle -> Blink & Fluff -> Head Turn 45 deg -> Return & Wing Rustle

Juga mengekspor file GIF animasi 4x ke artifact directory untuk preview.
"""

import os
from PIL import Image
import numpy as np

ARTIFACT_DIR = "/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479"
ANIM_DIR = "assets/img/animals"

def load_orig(name):
    path = f"{ANIM_DIR}/orig/ani_{name}.png"
    if not os.path.exists(path):
        path = f"{ANIM_DIR}/ani_{name}.png"
    return Image.open(path).convert("RGBA")

# -------------------------------------------------------------
# 1. RABBIT (128x32 strip, 4 frames of 32x32)
# -------------------------------------------------------------
def make_rabbit_frames():
    orig = load_orig("rabbit")
    arr0 = np.array(orig)
    frames = [arr0.copy()]
    
    # Frame 1: Crouch / Anticipate (squash down 1-2px, ears tilt back 1px)
    arr1 = np.zeros_like(arr0)
    # Head & ears & body squash down by 1-2px
    # Ears: y=3..12, x=10..22 -> move down 1px, tilt back
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Tail (x >= 23, y <= 21): stays or compacts slightly
            if x >= 23:
                arr1[min(31, y + 1), x] = c
            # Ears (y <= 12, x >= 11): shift down 1, right 1 (tilted back)
            elif y <= 12 and x >= 11:
                arr1[min(31, y + 1), min(31, x + 1)] = c
            # Head (x <= 13, y <= 12): shift down 1
            elif x <= 13 and y <= 12:
                arr1[min(31, y + 1), x] = c
            # Feet / ground (y >= 26): stay on ground
            elif y >= 26:
                arr1[y, x] = c
            # Body: squash down
            else:
                arr1[min(31, y + 1), x] = c
    frames.append(arr1)
    
    # Frame 2: Airborne Hop (stretch, lift 3px up, paws reach forward, hind legs kick back)
    arr2 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Shift whole rabbit up 3px and left 1px (hopping forward)
            ny = y - 3
            nx = x - 1
            if 0 <= ny < 32 and 0 <= nx < 32:
                # Ears stream back (right 2px)
                if y <= 13 and x >= 12:
                    nx2 = min(31, nx + 2)
                    arr2[ny, nx2] = c
                # Hind legs kick back (right 2px, up 1px)
                elif y >= 24 and x >= 16:
                    nx2 = min(31, nx + 2)
                    arr2[min(31, ny + 1), nx2] = c
                # Front paws stretch forward (left 1px)
                elif y >= 24 and x <= 15:
                    nx2 = max(0, nx - 1)
                    arr2[ny, nx2] = c
                else:
                    arr2[ny, nx] = c
    # Add a soft faint shadow on the ground at y=29..30
    for sx in range(12, 22):
        arr2[29, sx] = [40, 20, 20, 60]
    frames.append(arr2)
    
    # Frame 3: Landing / Impact (touches ground, front paws compress, ears flop forward)
    arr3 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Front paws on ground
            if y >= 25 and x <= 15:
                arr3[y, x] = c
            # Ears flop forward (shift left 1px)
            elif y <= 12 and x >= 11:
                arr3[y, max(0, x - 1)] = c
            # Body slightly pitched forward
            else:
                arr3[y, max(0, x - 1)] = c
    frames.append(arr3)
    
    return [Image.fromarray(f, 'RGBA') for f in frames]

# -------------------------------------------------------------
# 2. SQUIRREL (128x32 strip, 4 frames of 32x32)
# -------------------------------------------------------------
def make_squirrel_frames():
    orig = load_orig("squirrel")
    arr0 = np.array(orig)
    frames = [arr0.copy()]
    
    # Frame 1: Nibble / Chew (head bobs down 1px, tail swishes back 1px)
    arr1 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Head (x <= 16, y <= 16): bob down 1px
            if x <= 16 and y <= 16:
                arr1[min(31, y + 1), x] = c
            # Tail (x >= 18, y <= 24): tip sways back 1px
            elif x >= 18 and y <= 18:
                arr1[y, min(31, x + 1)] = c
            else:
                arr1[y, x] = c
    frames.append(arr1)
    
    # Frame 2: Alert Look-Up (head lifts 1px, ears perk up, tail arches tensely)
    arr2 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Head and ears (x <= 16, y <= 16): lift up 1px
            if x <= 16 and y <= 16:
                arr2[max(0, y - 1), x] = c
            # Tail curls higher up 1px
            elif x >= 18 and y <= 22:
                arr2[max(0, y - 1), x] = c
            else:
                arr2[y, x] = c
    # Add gleam to eye in frame 2 for alert look
    arr2[10, 11] = [255, 255, 230, 255]
    frames.append(arr2)
    
    # Frame 3: Tail Flick / Settle (tail waves smoothly forward 1px, head begins lowering)
    arr3 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Tail tip curls slightly forward (left 1px)
            if x >= 18 and y <= 16:
                arr3[y, max(0, x - 1)] = c
            else:
                arr3[y, x] = c
    frames.append(arr3)
    
    return [Image.fromarray(f, 'RGBA') for f in frames]

# -------------------------------------------------------------
# 3. DEER (128x32 strip, 4 frames of 32x32)
# -------------------------------------------------------------
def make_deer_frames():
    orig = load_orig("deer")
    arr0 = np.array(orig)
    frames = [arr0.copy()]
    
    # Frame 1: Lower Head (neck bends forward-down, antlers angle down 2px)
    arr1 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Head, antlers, and neck (x <= 15, y <= 18): drop down 2px, left 1px
            if x <= 15 and y <= 18:
                ny = min(31, y + 2)
                nx = max(0, x - 1)
                arr1[ny, nx] = c
            else:
                arr1[y, x] = c
    frames.append(arr1)
    
    # Frame 2: Grazing Nibble (head reaches down 4px near grass, tail flicks up 1px)
    arr2 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Head & neck grazing at ground level (drop 4px, left 1px)
            if x <= 15 and y <= 18:
                ny = min(31, y + 4)
                nx = max(0, x - 1)
                arr2[ny, nx] = c
            # Tail (x >= 24, y <= 18): flick up 1px
            elif x >= 24 and y <= 18:
                arr2[max(0, y - 1), x] = c
            else:
                arr2[y, x] = c
    frames.append(arr2)
    
    # Frame 3: Raise & Hoof Step (head rising, front left leg flexes forward 1px)
    arr3 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Head halfway back up (drop 1px from idle)
            if x <= 15 and y <= 18:
                arr3[min(31, y + 1), x] = c
            # Front left leg (x in [9..13], y >= 23): step slightly forward
            elif 9 <= x <= 13 and y >= 23:
                arr3[max(0, y - 1), max(0, x - 1)] = c
            else:
                arr3[y, x] = c
    frames.append(arr3)
    
    return [Image.fromarray(f, 'RGBA') for f in frames]

# -------------------------------------------------------------
# 4. DUCK (128x32 strip, 4 frames of 32x32)
# -------------------------------------------------------------
def make_duck_frames():
    orig = load_orig("duck")
    arr0 = np.array(orig)
    frames = [arr0.copy()]
    
    # Frame 1: Waddle Step (body shifts down 1px, feet alternate, tail wiggles)
    arr1 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Body & head shift down 1px
            if y <= 25:
                arr1[min(31, y + 1), x] = c
            # Left foot (x in 12..16, y >= 26) steps forward 1px
            elif 12 <= x <= 16:
                arr1[y, max(0, x - 1)] = c
            else:
                arr1[y, x] = c
    frames.append(arr1)
    
    # Frame 2: Peck / Dabble (bill and head dip down 2px, tail angles up 1px)
    arr2 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Head and bill (x <= 15, y <= 15): dip down 2px, forward 1px
            if x <= 15 and y <= 15:
                arr2[min(31, y + 2), max(0, x - 1)] = c
            # Tail (x >= 20, y in 14..20): tilt up 1px
            elif x >= 20 and 14 <= y <= 20:
                arr2[max(0, y - 1), x] = c
            else:
                arr2[y, x] = c
    frames.append(arr2)
    
    # Frame 3: Wing Flutter (head level, wings fluff out on sides 1px, tail shakes)
    arr3 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Wing region (x in 13..21, y in 16..22): expand slightly
            if 13 <= x <= 21 and 16 <= y <= 22:
                arr3[max(0, y - 1), x] = c
                # extra feather ruffle pixel
                if x == 18 and y == 16:
                    arr3[15, 18] = [190, 161, 135, 255]
            else:
                arr3[y, x] = c
    frames.append(arr3)
    
    return [Image.fromarray(f, 'RGBA') for f in frames]

# -------------------------------------------------------------
# 5. OWL (128x32 strip, 4 frames of 32x32)
# -------------------------------------------------------------
def make_owl_frames():
    orig = load_orig("owl")
    arr0 = np.array(orig)
    frames = [arr0.copy()]
    
    # Frame 1: Blink & Chest Puff (eyes narrow into sleepy cute slit, chest expands 1px)
    arr1 = arr0.copy()
    # Eye rows are around y=6..10. Close upper eyelids with cream feathers:
    cream = [244, 234, 217, 255]
    dark_pupil = [31, 11, 8, 255]
    for ey in [6, 7, 8]:
        for ex in range(8, 13):
            if arr1[ey, ex, 3] > 0:
                arr1[ey, ex] = cream
        for ex in range(16, 21):
            if arr1[ey, ex, 3] > 0:
                arr1[ey, ex] = cream
    # Slit pupil line at y=9
    for ex in [10, 11, 18, 19]:
        arr1[9, ex] = dark_pupil
    frames.append(arr1)
    
    # Frame 2: Head Swivel 45 deg to Left! (head & eyes shift left 2px, body stays perched)
    arr2 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Head (y <= 14): shift left 2px
            if y <= 14:
                nx = max(0, x - 2)
                arr2[y, nx] = c
            else:
                # Body stays steady
                arr2[y, x] = c
    frames.append(arr2)
    
    # Frame 3: Return & Wing Rustle (head back to center, wings puff 1px outward)
    arr3 = np.zeros_like(arr0)
    for y in range(32):
        for x in range(32):
            c = arr0[y, x]
            if c[3] == 0:
                continue
            # Wing edges (x <= 7 or x >= 23, y in 14..24) rustle 1px
            if (x <= 8 or x >= 22) and 14 <= y <= 24:
                arr3[max(0, y - 1), x] = c
            else:
                arr3[y, x] = c
    frames.append(arr3)
    
    return [Image.fromarray(f, 'RGBA') for f in frames]

# -------------------------------------------------------------
# MAIN GENERATOR
# -------------------------------------------------------------
def main():
    generators = {
        "rabbit": make_rabbit_frames,
        "squirrel": make_squirrel_frames,
        "deer": make_deer_frames,
        "duck": make_duck_frames,
        "owl": make_owl_frames,
    }
    
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    
    for name, gen_fn in generators.items():
        frames = gen_fn()
        w, h = 32, 32
        
        # Build 128x32 strip
        strip_im = Image.new("RGBA", (w * len(frames), h), (0, 0, 0, 0))
        for i, fr in enumerate(frames):
            strip_im.paste(fr, (i * w, 0))
        
        # Save to assets/img/animals/ani_<name>.png
        out_strip_path = f"{ANIM_DIR}/ani_{name}.png"
        strip_im.save(out_strip_path)
        print(f"Saved sprite sheet: {out_strip_path} ({strip_im.size})")
        
        # Also save 4x preview strip in artifact dir
        preview_strip = strip_im.resize((strip_im.width * 4, strip_im.height * 4), Image.NEAREST)
        preview_strip.save(f"{ARTIFACT_DIR}/ani_{name}_strip_4x.png")
        
        # Save animated GIF in artifact dir (4x scale, 200ms per frame)
        gif_frames = [fr.resize((w * 4, h * 4), Image.NEAREST) for fr in frames]
        gif_path = f"{ARTIFACT_DIR}/ani_{name}.gif"
        gif_frames[0].save(
            gif_path,
            save_all=True,
            append_images=gif_frames[1:],
            duration=[220, 180, 240, 180],
            loop=0,
            disposal=2
        )
        print(f"Saved animated preview: {gif_path}")

if __name__ == "__main__":
    main()
