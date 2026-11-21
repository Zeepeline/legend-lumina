#!/usr/bin/env python3
"""
Ekspor berkas .aseprite untuk seluruh 11 NPC Desa Lumina:
- Simpan ke assets/aseprite/npc_<id>.aseprite
- Lengkap dengan frame timeline dan tag animasi:
  * Idle_Down (frame 1-4)
  * Walk_Down (frame 5-8)
  * Idle_Up (frame 9-12)
  * Walk_Up (frame 13-16)
  * Idle_Side (frame 17-20)
  * Walk_Side (frame 21-24)
  * Act_Talk (frame 25-28)
  * Act_Work (frame 29-32)
"""

import os, subprocess
from PIL import Image

FW, FH = 48, 40
NPCS = ['elder', 'girl', 'farmer', 'merchant', 'child', 'guard', 'woman', 'smith', 'inn', 'mom', 'priest']

tmp_base = '/tmp/npc_aseprite_frames'
os.makedirs(tmp_base, exist_ok=True)
os.makedirs('assets/aseprite', exist_ok=True)

for npc in NPCS:
    sheet = Image.open(f'assets/img/npc/npc_{npc}.png').convert('RGBA')
    npc_tmp = f'{tmp_base}/{npc}'
    os.makedirs(npc_tmp, exist_ok=True)
    
    # Simpan 32 frame individual
    idx = 1
    for r in range(8):
        for c in range(4):
            cell = sheet.crop((c * FW, r * FH, (c + 1) * FW, (r + 1) * FH))
            cell.save(f'{npc_tmp}/frame_{idx:02d}.png')
            idx += 1
            
    # Buat skrip lua untuk Aseprite
    lua = f'''
local spr = Sprite({FW}, {FH})
local layer = spr.layers[1]
layer.name = "Character"

for i = 2, 32 do
    spr:newFrame()
end

for i = 1, 32 do
    spr.frames[i].duration = 0.12
    local num = string.format("%02d", i)
    local img = Image{{ fromFile = "{npc_tmp}/frame_" .. num .. ".png" }}
    spr:newCel(layer, spr.frames[i], img, Point(0, 0))
end

spr:newTag(1,  4,  "Idle_Down")
spr:newTag(5,  8,  "Walk_Down")
spr:newTag(9,  12, "Idle_Up")
spr:newTag(13, 16, "Walk_Up")
spr:newTag(17, 20, "Idle_Side")
spr:newTag(21, 24, "Walk_Side")
spr:newTag(25, 28, "Act_Social_Talk")
spr:newTag(29, 32, "Act_Village_Work")

spr:saveCopyAs("assets/aseprite/npc_{npc}.aseprite")
'''
    lua_path = f'/tmp/build_npc_{npc}.lua'
    with open(lua_path, 'w') as f:
        f.write(lua)
        
    subprocess.run(['/Applications/Aseprite.app/Contents/MacOS/aseprite', '-b', '--script', lua_path], check=True)
    print(f"Exported assets/aseprite/npc_{npc}.aseprite!")

print("Semua berkas Aseprite NPC Desa berhasil dibuat!")
