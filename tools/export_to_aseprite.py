#!/usr/bin/env python3
"""
Eksportir Aseprite Asli untuk Shadow Swordsman (Cyber Ronin)
Menghasilkan file `.aseprite` resmi dengan 6 layer terpisah:
- VFX
- Sword
- Head
- Wire
- Cloak
- Body

Dan 4 Tag Animasi:
- "Swipe 1" (Frame 1-6)
- "Cross Slash" (Frame 7-12)
- "Heavy Slam" (Frame 13-18)
- "Electric & Sheath" (Frame 19-24)
"""
import math, os, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from PIL import Image

FW, FH = 96, 96
GROUND_Y = 70

C_TRANS = (0, 0, 0, 0)
C_BLACK = (20, 22, 26, 255)
C_DARK = (40, 44, 54, 255)
C_WHITE = (255, 255, 255, 255)
C_CYAN = (100, 230, 255, 255)
C_DUST = (235, 235, 240, 255)

from tools.pixel_rig_engine import CyberRoninRig, rotate_stamp, create_penusbmic_vfx

def decompose_24_frames():
    rig = CyberRoninRig()
    tmp_dir = '/tmp/ronin_ase_cels'
    os.makedirs(tmp_dir, exist_ok=True)

    # 24 Parameters definition
    params_list = [
        # FASE 1: Swipe 1
        {'bx': 28, 'by': 56, 'crouch': 0, 'vx': 0, 'vy': 0, 'sword': {'x': 30, 'y': 60, 'ang': 0.15, 'z': 'back'}, 'cloak_flow': 0.1},
        {'bx': 26, 'by': 56, 'crouch': 4, 'vx': -4, 'vy': 4, 'hat_tilt': 0.1, 'sword': {'x': 20, 'y': 62, 'ang': -0.3, 'z': 'back'}, 'cloak_flow': -0.4},
        {'bx': 35, 'by': 56, 'crouch': 2, 'vx': 9, 'vy': -2, 'spread': 4, 'hat_tilt': 0.05, 'sword': {'x': 54, 'y': 58, 'ang': 0.05, 'z': 'front'}, 'cloak_flow': -0.7,
         'smear_arc': [(x, int(33 - 3 * math.sin((x - 18) / 44.0 * math.pi)), 1) for x in range(18, 62, 2)], 'dust': [(24, 43), (23, 42), (25, 43)]},
        {'bx': 37, 'by': 56, 'crouch': 2, 'vx': 2, 'vy': 0, 'spread': 3, 'sword': {'x': 58, 'y': 59, 'ang': 0.1, 'z': 'front'}, 'cloak_flow': -0.5, 'dust': [(23, 43)]},
        {'bx': 36, 'by': 56, 'crouch': 1, 'vx': -1, 'vy': 0, 'spread': 2, 'sword': {'x': 56, 'y': 59, 'ang': 0.15, 'z': 'front'}, 'cloak_flow': -0.2},
        {'bx': 34, 'by': 56, 'crouch': 0, 'vx': -1, 'vy': -1, 'sword': {'x': 50, 'y': 58, 'ang': 0.3, 'z': 'front'}, 'cloak_flow': 0.0},

        # FASE 2: Cross Slash
        {'bx': 33, 'by': 56, 'crouch': 2, 'vx': -2, 'vy': 2, 'hat_tilt': -0.15, 'sword': {'x': 40, 'y': 56, 'ang': -0.8, 'z': 'front'}, 'cloak_flow': 0.4},
        {'bx': 32, 'by': 56, 'crouch': 3, 'vx': 0, 'vy': 1, 'hat_tilt': -0.1, 'sword': {'x': 26, 'y': 64, 'ang': -2.2, 'z': 'back'}, 'cloak_flow': 0.6},
        {'bx': 38, 'by': 56, 'crouch': 1, 'vx': 6, 'vy': -3, 'spread': 3, 'sword': {'x': 52, 'y': 48, 'ang': -0.7, 'z': 'front'}, 'cloak_flow': 0.8,
         'smear_arc': [(x, int(42 - (x - 22) * 0.65), 1) for x in range(22, 58, 2)], 'dust': [(27, 43), (28, 42)]},
        {'bx': 39, 'by': 56, 'crouch': 0, 'vx': 1, 'vy': -1, 'spread': 2, 'sword': {'x': 55, 'y': 46, 'ang': -0.85, 'z': 'front'}, 'cloak_flow': 0.5},
        {'bx': 38, 'by': 56, 'crouch': 1, 'vx': -1, 'vy': 1, 'sword': {'x': 52, 'y': 49, 'ang': -0.8, 'z': 'front'}, 'cloak_flow': 0.2},
        {'bx': 35, 'by': 56, 'crouch': 0, 'vx': -2, 'vy': -2, 'sword': {'x': 44, 'y': 48, 'ang': -1.4, 'z': 'front'}, 'cloak_flow': 0.0},

        # FASE 3: Heavy Slam
        {'bx': 33, 'by': 56, 'crouch': -3, 'vx': 1, 'vy': -5, 'hat_tilt': -0.05, 'sword': {'x': 34, 'y': 37, 'ang': -1.57, 'z': 'front'}, 'cloak_flow': -0.2},
        {'bx': 34, 'by': 56, 'crouch': -4, 'vx': 2, 'vy': -1, 'sword': {'x': 35, 'y': 36, 'ang': -1.5, 'z': 'front'}, 'cloak_flow': -0.3},
        {'bx': 37, 'by': 56, 'crouch': 3, 'vx': 5, 'vy': 7, 'spread': 5, 'hat_tilt': 0.15, 'sword': {'x': 50, 'y': 64, 'ang': 1.45, 'z': 'front'}, 'cloak_flow': -0.6,
         'smear_arc': [(int(48 - 4 * math.sin((y - 12) / 32.0 * math.pi)), y, 1) for y in range(12, 44, 2)], 'dust': [(47, 43), (48, 42), (52, 43), (53, 42)]},
        {'bx': 38, 'by': 56, 'crouch': 4, 'vx': 1, 'vy': 0, 'spread': 5, 'hat_tilt': 0.15, 'sword': {'x': 50, 'y': 67, 'ang': 1.57, 'z': 'front'}, 'cloak_flow': -0.7,
         'dust': [(45, 43), (44, 42), (43, 43), (54, 43), (55, 42), (57, 43), (51, 41)]},
        {'bx': 37, 'by': 56, 'crouch': 3, 'vx': -1, 'vy': -1, 'spread': 4, 'hat_tilt': 0.1, 'sword': {'x': 49, 'y': 65, 'ang': 1.55, 'z': 'front'}, 'cloak_flow': -0.5, 'dust': [(43, 43), (56, 43)]},
        {'bx': 37, 'by': 56, 'crouch': 3, 'vx': 0, 'vy': 0, 'spread': 4, 'sword': {'x': 49, 'y': 66, 'ang': 1.57, 'z': 'front'}, 'cloak_flow': -0.3},

        # FASE 4: Electric & Sheath
        {'bx': 37, 'by': 56, 'crouch': 3, 'vx': 0, 'vy': 0, 'spread': 4, 'sword': {'x': 49, 'y': 66, 'ang': 1.57, 'z': 'front'}, 'cloak_flow': -0.2,
         'lightning': [[(30, 24), (32, 22), (36, 23), (42, 28), (48, 35), (49, 41)], [(49, 42), (46, 43), (42, 42), (38, 43), (34, 43)], [(50, 42), (54, 43), (58, 42), (63, 43)]]},
        {'bx': 36, 'by': 56, 'crouch': 2, 'vx': -1, 'vy': -1, 'spread': 3, 'sword': {'x': 48, 'y': 64, 'ang': 1.5, 'z': 'front'}, 'cloak_flow': -0.1,
         'lightning': [[(44, 43), (40, 42), (36, 43)], [(52, 43), (57, 42), (61, 43)], [(49, 37), (51, 35)]]},
        {'bx': 34, 'by': 56, 'crouch': 1, 'vx': -1, 'vy': -1, 'spread': 2, 'sword': {'x': 45, 'y': 60, 'ang': 1.1, 'z': 'front'}, 'cloak_flow': 0.0},
        {'bx': 32, 'by': 56, 'crouch': 0, 'vx': -1, 'vy': 0, 'sword': {'x': 38, 'y': 58, 'ang': 0.3, 'z': 'front'}, 'cloak_flow': 0.1},
        {'bx': 30, 'by': 56, 'crouch': 0, 'vx': -1, 'vy': 0, 'sword': {'x': 32, 'y': 59, 'ang': 0.15, 'z': 'back'}, 'cloak_flow': 0.05},
        {'bx': 28, 'by': 56, 'crouch': 0, 'vx': 0, 'vy': 0, 'sword': {'x': 30, 'y': 60, 'ang': 0.15, 'z': 'back'}, 'cloak_flow': 0.0},
    ]

    layer_names = ['VFX', 'Sword', 'Head', 'Wire', 'Cloak', 'Body']

    for f_idx, params in enumerate(params_list):
        cels = {name: Image.new('RGBA', (FW, FH), C_TRANS) for name in layer_names}

        bx = params.get('bx', 32)
        by = params.get('by', 30)
        crouch = params.get('crouch', 0)
        actual_by = by + crouch

        head_x = bx + params.get('hx', 0)
        head_y = actual_by - 12 + params.get('hy', 0)
        vx = params.get('vx', 0)
        vy = params.get('vy', 0)
        rig.update_cable(head_x - 3, head_y + 4, vx, vy)

        # 1. Body
        leg_l = bx - 4 - params.get('spread', 0)
        leg_r = bx + 4 + params.get('spread', 0)
        for y in range(int(actual_by + 4), GROUND_Y):
            for x in range(int(leg_l), int(leg_l + 3)):
                if 0 <= x < FW and 0 <= y < FH: cels['Body'].putpixel((x, y), C_BLACK)
            for x in range(int(leg_r - 2), int(leg_r + 1)):
                if 0 <= x < FW and 0 <= y < FH: cels['Body'].putpixel((x, y), C_BLACK)

        # 2. Cloak
        cloak_flow = params.get('cloak_flow', 0)
        for y in range(int(actual_by - 6), GROUND_Y - 1):
            progress = (y - (actual_by - 6)) / max(1, (GROUND_Y - 1 - (actual_by - 6)))
            w_left = 4 + progress * 5 - cloak_flow * 4
            w_right = 4 + progress * 5 + cloak_flow * 4
            for x in range(int(bx - w_left), int(bx + w_right)):
                if 0 <= x < FW and 0 <= y < FH:
                    col = C_DARK if (x == int(bx - w_left) or x == int(bx + w_right - 1)) else C_BLACK
                    cels['Cloak'].putpixel((x, y), col)

        # 3. Wire
        for i in range(len(rig.cable_nodes) - 1):
            nx, ny = int(rig.cable_nodes[i][0]), int(rig.cable_nodes[i][1])
            if 0 <= nx < FW and 0 <= ny < FH:
                cels['Wire'].putpixel((nx, ny), C_WHITE)
                if nx + 1 < FW: cels['Wire'].putpixel((nx + 1, ny), C_WHITE)

        # 4. Head
        for y in range(int(head_y + 2), int(head_y + 9)):
            for x in range(int(head_x - 3), int(head_x + 5)):
                if 0 <= x < FW and 0 <= y < FH: cels['Head'].putpixel((x, y), C_BLACK)
        hat_tilt = params.get('hat_tilt', 0)
        rotate_stamp(cels['Head'], rig.hat, head_x, head_y + 3, hat_tilt, rig.hat_pv)
        eye_x, eye_y = int(head_x + 1), int(head_y + 4)
        for dy in range(3):
            for dx in range(2):
                px, py = eye_x + dx, eye_y + dy
                if 0 <= px < FW and 0 <= py < FH: cels['Head'].putpixel((px, py), C_WHITE)

        # 5. Sword
        sw = params.get('sword')
        if sw:
            rotate_stamp(cels['Sword'], rig.sword, sw['x'], sw['y'], sw['ang'], rig.sword_pv)

        # 6. VFX Layer (Animasi Slash Arc, Smear, Shockwave, Petir & Star Glint)
        cels['VFX'] = create_penusbmic_vfx(f_idx)

        # Save layer images for this frame
        for name in layer_names:
            fn = f'{tmp_dir}/{name}_f{f_idx:02d}.png'
            cels[name].save(fn)

    print('Exported 24 frames x 6 layers to:', tmp_dir)
    return tmp_dir, layer_names, len(params_list)

def generate_aseprite_file(tmp_dir, layer_names, num_frames):
    out_ase = os.path.abspath('assets/aseprite/shadow_swordsman.aseprite')
    out_png = os.path.abspath('assets/aseprite/shadow_swordsman_sheet.png')
    out_gif = os.path.abspath('assets/aseprite/shadow_swordsman_combo.gif')

    # Buat skrip Lua untuk Aseprite
    lua_script = f"""
-- Aseprite Lua Script to build Shadow Swordsman
local spr = Sprite({FW}, {FH})
spr.filename = "{out_ase}"

-- Remove default initial layer
local defLayer = spr.layers[1]

-- Create 6 layers in bottom-to-top order
-- Stack: Body (bottom), Cloak, Wire, Head, Sword, VFX (top)
local layerNames = {{ "Body", "Cloak", "Wire", "Head", "Sword", "VFX" }}
local layers = {{}}
for _, name in ipairs(layerNames) do
    local l = spr:newLayer()
    l.name = name
    layers[name] = l
end

if defLayer then spr:deleteLayer(defLayer) end

-- Populate {num_frames} frames
for f = 1, {num_frames} do
    if f > 1 then spr:newFrame() end
    local fr = spr.frames[f]
    fr.duration = 0.085 -- 85 ms per frame!

    local fIdx = f - 1
    for _, name in ipairs(layerNames) do
        local celPath = string.format("{tmp_dir}/%s_f%02d.png", name, fIdx)
        local celImg = Image{{fromFile=celPath}}
        if celImg then
            spr:newCel(layers[name], fr, celImg, Point(0, 0))
        end
    end
end

-- Create Animation Tags
local function addTag(name, fromF, toF, color)
    local tag = spr:newTag(fromF, toF)
    tag.name = name
    tag.color = color
end

addTag("Swipe 1", 1, 6, Color{{r=255, g=100, b=100}})
addTag("Cross Slash", 7, 12, Color{{r=100, g=255, b=100}})
addTag("Heavy Slam", 13, 18, Color{{r=255, g=200, b=50}})
addTag("Electric & Sheath", 19, 24, Color{{r=100, g=200, b=255}})

-- Save native Aseprite file
spr:saveCopyAs("{out_ase}")
print("Saved Aseprite file:", "{out_ase}")

-- Export full animated GIF
spr:saveCopyAs("{out_gif}")
print("Exported GIF:", "{out_gif}")

app.command.Exit()
"""
    lua_path = '/tmp/build_ronin.lua'
    with open(lua_path, 'w') as f:
        f.write(lua_script)

    # Jalankan Aseprite via CLI batch mode
    aseprite_bin = os.path.expanduser('~/bin/aseprite')
    cmd = [aseprite_bin, '-b', '--script', lua_path]
    print('Running Aseprite CLI:', ' '.join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    print('STDOUT:', res.stdout)
    if res.stderr: print('STDERR:', res.stderr)

    # Ekspor spritesheet juga via Aseprite CLI
    cmd_sheet = [aseprite_bin, '-b', out_ase, '--sheet', out_png, '--data', out_png.replace('.png', '.json'), '--list-tags']
    subprocess.run(cmd_sheet, capture_output=True)
    print('Exported spritesheet:', out_png)

if __name__ == '__main__':
    tmp_dir, layers, n_frames = decompose_24_frames()
    generate_aseprite_file(tmp_dir, layers, n_frames)
