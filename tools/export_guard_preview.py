#!/usr/bin/env python3
"""
Generate Pratinjau Penjaga Gerbang (guard):
- Komparasi berdampingan Arka vs Penjaga Gerbang (skala 3x)
- GIF Walk Cycle Penjaga (skala 3x)
- GIF Idle & Aktivitas Siaga / Hormat Penjaga (skala 3x)
- Sheet Lengkap 32 Frame Penjaga (skala 2x)
"""

import os
from PIL import Image

FW, FH = 48, 40
SCALE = 3

artifact_dir = '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6'
os.makedirs(artifact_dir, exist_ok=True)

arka_img = Image.open('assets/img/hero/hero_arka.png').convert('RGBA')
guard_img = Image.open('assets/img/npc/npc_guard.png').convert('RGBA')

# 1. Komparasi Wajah & Desain: Arka vs Penjaga
comp_w = (FW * 3 + 24) * 2
comp = Image.new('RGBA', (comp_w, (FH + 16) * 2), (0, 0, 0, 0))

# Baris 1: Arka (Front Idle, Side Idle, Walk Down)
a_front = arka_img.crop((0, 0, FW, FH))
a_side  = arka_img.crop((0, 4 * FH, FW, 5 * FH))
a_walk  = arka_img.crop((0, 1 * FH, FW, 2 * FH))

comp.paste(a_front, (12, 12), a_front)
comp.paste(a_side, (12 + FW + 12, 12), a_side)
comp.paste(a_walk, (12 + (FW + 12) * 2, 12), a_walk)

# Baris 2: Penjaga (Front Idle, Side Idle, Walk Down)
g_front = guard_img.crop((0, 0, FW, FH))
g_side  = guard_img.crop((0, 4 * FH, FW, 5 * FH))
g_walk  = guard_img.crop((0, 1 * FH, FW, 2 * FH))

y2 = FH + 24
comp.paste(g_front, (12, y2), g_front)
comp.paste(g_side, (12 + FW + 12, y2), g_side)
comp.paste(g_walk, (12 + (FW + 12) * 2, y2), g_walk)

comp_scaled = comp.resize((comp.width * SCALE, comp.height * SCALE), Image.NEAREST)
comp_scaled.save(f'{artifact_dir}/guard_vs_arka_comparison_3x.png')
print(f"Saved: {artifact_dir}/guard_vs_arka_comparison_3x.png")

# 2. GIF Walk Down Penjaga (4 Frame)
walk_frames = []
for c in range(4):
    fr = guard_img.crop((c * FW, 1 * FH, (c + 1) * FW, 2 * FH))
    walk_frames.append(fr.resize((FW * SCALE, FH * SCALE), Image.NEAREST))

walk_frames[0].save(
    f'{artifact_dir}/guard_walk_cycle_3x.gif',
    save_all=True,
    append_images=walk_frames[1:],
    duration=150,
    loop=0,
    disposal=2
)
print(f"Saved: {artifact_dir}/guard_walk_cycle_3x.gif")

# 3. GIF Aktivitas Penjaga: Siaga & Hormat Prajurit
act_frames = []
for r in [6, 7]:
    for c in range(4):
        fr = guard_img.crop((c * FW, r * FH, (c + 1) * FW, r * FH + FH))
        act_frames.append(fr.resize((FW * SCALE, FH * SCALE), Image.NEAREST))

act_frames[0].save(
    f'{artifact_dir}/guard_activities_3x.gif',
    save_all=True,
    append_images=act_frames[1:],
    duration=180,
    loop=0,
    disposal=2
)
print(f"Saved: {artifact_dir}/guard_activities_3x.gif")

# 4. Sheet Lengkap 32 Frame Penjaga
sheet_scaled = guard_img.resize((guard_img.width * 2, guard_img.height * 2), Image.NEAREST)
sheet_scaled.save(f'{artifact_dir}/guard_full_sheet_2x.png')
print(f"Saved: {artifact_dir}/guard_full_sheet_2x.png")
