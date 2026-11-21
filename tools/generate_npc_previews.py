#!/usr/bin/env python3
"""
Generate Pratinjau Visual & GIF Animasi Seluruh 11 NPC Desa Lumina:
- Menghasilkan GIF jalan & aktivitas untuk pratinjau artifact
- Menghasilkan gambar komparasi side-by-side seluruh warga desa berdampingan dengan Arka (skala 3x)
"""

import os
from PIL import Image

FW, FH = 48, 40
SCALE = 3
NPCS = ['elder', 'girl', 'farmer', 'merchant', 'child', 'guard', 'woman', 'smith', 'inn', 'mom', 'priest']
LABELS = {
    'elder': 'Tetua Bram',
    'girl': 'Lina',
    'farmer': 'Pak Darto',
    'merchant': 'Bu Sari',
    'child': 'Dodi & Kiki',
    'guard': 'Penjaga',
    'woman': 'Bu Lastri',
    'smith': 'Pak Besi',
    'inn': 'Bu Rina',
    'mom': 'Bu Wulan',
    'priest': 'Pendeta Elian',
}

artifact_dir = '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6'
os.makedirs(artifact_dir, exist_ok=True)

# 1. Buat Komparasi Parade Warga Desa Lumina + Arka (Side-by-Side)
arka_img = Image.open('assets/img/hero/hero_arka.png').convert('RGBA')
arka_idle = arka_img.crop((0, 0, FW, FH))

# Parade gambar: Arka + 11 NPC = 12 Karakter
parade_w = (1 + len(NPCS)) * (FW + 8)
parade = Image.new('RGBA', (parade_w, FH + 12), (0, 0, 0, 0))

# Tempel Arka
parade.paste(arka_idle, (4, 6), arka_idle)

for i, npc in enumerate(NPCS):
    sheet = Image.open(f'assets/img/npc/npc_{npc}.png').convert('RGBA')
    idle = sheet.crop((0, 0, FW, FH))
    px = (i + 1) * (FW + 8) + 4
    parade.paste(idle, (px, 6), idle)

parade_scaled = parade.resize((parade.width * SCALE, parade.height * SCALE), Image.NEAREST)
parade_scaled.save(f'{artifact_dir}/village_npcs_parade_3x.png')
print(f"Saved: {artifact_dir}/village_npcs_parade_3x.png")

# 2. Buat GIF Animasi Jalan & Aktivitas Warga Desa
# Kita buat GIF showcase jalan (walk down) untuk semua 11 NPC + Arka berbaris jalan bersama!
walk_frames = []
for f_idx in range(4):
    fr = Image.new('RGBA', (parade_w, FH + 12), (0, 0, 0, 0))
    # Arka walk down (baris 1)
    a_fr = arka_img.crop((f_idx * FW, 1 * FH, (f_idx + 1) * FW, 2 * FH))
    fr.paste(a_fr, (4, 6), a_fr)
    
    # NPC walk down (baris 1)
    for i, npc in enumerate(NPCS):
        sheet = Image.open(f'assets/img/npc/npc_{npc}.png').convert('RGBA')
        n_fr = sheet.crop((f_idx * FW, 1 * FH, (f_idx + 1) * FW, 2 * FH))
        px = (i + 1) * (FW + 8) + 4
        fr.paste(n_fr, (px, 6), n_fr)
        
    walk_frames.append(fr.resize((fr.width * SCALE, fr.height * SCALE), Image.NEAREST))

walk_frames[0].save(
    f'{artifact_dir}/village_walk_cycle_3x.gif',
    save_all=True,
    append_images=walk_frames[1:],
    duration=140,
    loop=0,
    disposal=2
)
print(f"Saved: {artifact_dir}/village_walk_cycle_3x.gif")

# 3. Buat GIF Animasi Aktivitas & Percakapan Warga Desa (Baris 6 & 7)
act_frames = []
for f_idx in range(4):
    fr = Image.new('RGBA', (parade_w, FH + 12), (0, 0, 0, 0))
    # Arka cheer (baris 36)
    a_fr = arka_img.crop((f_idx * FW, 36 * FH, (f_idx + 1) * FW, 37 * FH))
    fr.paste(a_fr, (4, 6), a_fr)
    
    # NPC activity (baris 7: act_work)
    for i, npc in enumerate(NPCS):
        sheet = Image.open(f'assets/img/npc/npc_{npc}.png').convert('RGBA')
        n_fr = sheet.crop((f_idx * FW, 7 * FH, (f_idx + 1) * FW, 8 * FH))
        px = (i + 1) * (FW + 8) + 4
        fr.paste(n_fr, (px, 6), n_fr)
        
    act_frames.append(fr.resize((fr.width * SCALE, fr.height * SCALE), Image.NEAREST))

act_frames[0].save(
    f'{artifact_dir}/village_activities_3x.gif',
    save_all=True,
    append_images=act_frames[1:],
    duration=180,
    loop=0,
    disposal=2
)
print(f"Saved: {artifact_dir}/village_activities_3x.gif")

print("Selesai membuat seluruh artefak visual pratinjau!")
