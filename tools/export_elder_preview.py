#!/usr/bin/env python3
"""
Generate Pratinjau Tetua Bram (elder):
- Komparasi berdampingan Arka vs Tetua Bram (skala 3x)
- GIF Walk Cycle Tetua Bram (skala 3x)
- GIF Idle & Aktivitas Tetua Bram (skala 3x)
"""

import os
from PIL import Image

FW, FH = 48, 40
SCALE = 3

artifact_dir = '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6'
os.makedirs(artifact_dir, exist_ok=True)

arka_img = Image.open('assets/img/hero/hero_arka.png').convert('RGBA')
elder_img = Image.open('assets/img/npc/npc_elder.png').convert('RGBA')

# 1. Komparasi Wajah & Kepala: Arka vs Tetua Bram
# 3 pose: Front Idle, Side Idle, Walk
comp_w = (FW * 3 + 24) * 2
comp = Image.new('RGBA', (comp_w, (FH + 16) * 2), (0, 0, 0, 0))

# Baris 1: Arka (Front Idle, Side Idle, Walk Down)
a_front = arka_img.crop((0, 0, FW, FH))
a_side  = arka_img.crop((0, 4 * FH, FW, 5 * FH))
a_walk  = arka_img.crop((0, 1 * FH, FW, 2 * FH))

comp.paste(a_front, (12, 12), a_front)
comp.paste(a_side, (12 + FW + 12, 12), a_side)
comp.paste(a_walk, (12 + (FW + 12) * 2, 12), a_walk)

# Baris 2: Tetua Bram (Front Idle, Side Idle, Walk Down)
e_front = elder_img.crop((0, 0, FW, FH))
e_side  = elder_img.crop((0, 4 * FH, FW, 5 * FH))
e_walk  = elder_img.crop((0, 1 * FH, FW, 2 * FH))

y2 = FH + 24
comp.paste(e_front, (12, y2), e_front)
comp.paste(e_side, (12 + FW + 12, y2), e_side)
comp.paste(e_walk, (12 + (FW + 12) * 2, y2), e_walk)

comp_scaled = comp.resize((comp.width * SCALE, comp.height * SCALE), Image.NEAREST)
comp_scaled.save(f'{artifact_dir}/elder_vs_arka_comparison_3x.png')
print(f"Saved: {artifact_dir}/elder_vs_arka_comparison_3x.png")

# 2. GIF Walk Down Tetua Bram (4 Frame)
walk_frames = []
for c in range(4):
    fr = elder_img.crop((c * FW, 1 * FH, (c + 1) * FW, 2 * FH))
    walk_frames.append(fr.resize((FW * SCALE, FH * SCALE), Image.NEAREST))

walk_frames[0].save(
    f'{artifact_dir}/elder_walk_cycle_3x.gif',
    save_all=True,
    append_images=walk_frames[1:],
    duration=150,
    loop=0,
    disposal=2
)
print(f"Saved: {artifact_dir}/elder_walk_cycle_3x.gif")

# 3. GIF Aktivitas Tetua Bram: Mengelus Janggut & Mengangkat Tongkat Permata
act_frames = []
# Row 6: talk / caress beard (4 frames) + Row 7: work / wisdom staff (4 frames)
for r in [6, 7]:
    for c in range(4):
        fr = elder_img.crop((c * FW, r * FH, (c + 1) * FW, (r + 1) * FH))
        act_frames.append(fr.resize((FW * SCALE, FH * SCALE), Image.NEAREST))

act_frames[0].save(
    f'{artifact_dir}/elder_activities_3x.gif',
    save_all=True,
    append_images=act_frames[1:],
    duration=180,
    loop=0,
    disposal=2
)
print(f"Saved: {artifact_dir}/elder_activities_3x.gif")

# 4. Sheet Lengkap 32 Frame Tetua Bram
sheet_scaled = elder_img.resize((elder_img.width * 2, elder_img.height * 2), Image.NEAREST)
sheet_scaled.save(f'{artifact_dir}/elder_full_sheet_2x.png')
print(f"Saved: {artifact_dir}/elder_full_sheet_2x.png")
