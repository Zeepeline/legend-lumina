#!/usr/bin/env python3
"""
Bake Spritesheets Seluruh NPC Desa Lumina (11 Karakter):
- 100% Mengikuti Anatomi & Chibi ARPG Style Arka (hero_arka.png)
- Frame: 48x40 (4 kolom x 8 baris = 192x320)
  * Baris 0: idle_down (4 frame)
  * Baris 1: walk_down (4 frame)
  * Baris 2: idle_up (4 frame)
  * Baris 3: walk_up (4 frame)
  * Baris 4: idle_side (4 frame)
  * Baris 5: walk_side (4 frame)
  * Baris 6: act_talk / nod / greet (4 frame)
  * Baris 7: act_work / unique activity khas warga (4 frame) - NON COMBAT!
- Menggantikan stickman kode dan potongan kaku.
"""

import os, sys, math, subprocess
import numpy as np
from PIL import Image, ImageDraw

HERO_FW = 48
HERO_FH = 40

# Muat Sumber Arka
arka_img = Image.open('assets/img/hero/hero_arka.png').convert('RGBA')

# Baris Arka di hero_arka.png:
# idle_down: 0, walk_down: 1, idle_up: 2, walk_up: 3, idle_side: 4, walk_side: 6
# cheer: 36 (talk/greet), pick: 34 (craft/tend), hoe: 35 (work/action)

# Buat direktori cadangan untuk 32x32 lama jika belum ada
os.makedirs('assets/img/npc/backup_32x32', exist_ok=True)

# Helper Stamp Prop / Aksesori dengan Rotasi dan Pivot
def stamp_prop(dst, spr, cx, cy, ang=0.0, pivot=(0, 0)):
    ca, sa = math.cos(ang), math.sin(ang)
    w, h = spr.size
    ext = int(max(w, h)) + 2
    for y in range(int(cy) - ext, int(cy) + ext + 1):
        for x in range(int(cx) - ext, int(cx) + ext + 1):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            u = dx * ca + dy * sa + pivot[0]
            v = -dx * sa + dy * ca + pivot[1]
            if 0 <= u < w and 0 <= v < h and 0 <= x < dst.width and 0 <= y < dst.height:
                p = spr.getpixel((int(u), int(v)))
                if p[3] > 20:
                    dst.putpixel((x, y), p)

# Helper deteksi mask bagian tubuh Arka
def get_masks(arr):
    alpha = arr[..., 3] > 100
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    
    # Kulit muka & tangan
    mask_skin = alpha & (r >= 180) & (g >= 110) & (r > g) & (g > b)
    # Rambut cokelat Arka (bagian atas kepala y <= 21)
    mask_hair = alpha & (r < 185) & (r > g) & (g > b) & (r > 35)
    # Pakaian / Tunic biru Arka
    mask_cloth = alpha & (b > r + 5)
    # Celana / Sabuk / Sepatu
    mask_pants = alpha & (~mask_skin) & (~mask_hair) & (~mask_cloth) & (r < 110) & (g < 110) & (b < 110)
    
    return mask_skin, mask_hair, mask_cloth, mask_pants

# Transformasi Karakter Unik
def transform_elder(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Kulit lebih tua sedikit hangat
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 0.95, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 0.90, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 0.85, 0, 255)
    
    # Rambut & Uban Putih Perak
    arr[mask_hair, 0] = 230
    arr[mask_hair, 1] = 232
    arr[mask_hair, 2] = 238
    
    # Jubah Sage Krem / Earthy Green
    arr[mask_cloth, 0] = 218
    arr[mask_cloth, 1] = 212
    arr[mask_cloth, 2] = 192
    
    # Celana / Sepatu cokelat tua
    arr[mask_pants, 0] = 75
    arr[mask_pants, 1] = 52
    arr[mask_pants, 2] = 40
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    d = ImageDraw.Draw(out)
    
    # Janggut putih panjang Tetua Bram di dada (hanya jika menghadap depan/samping)
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        beard_col = (235, 238, 245, 255)
        beard_shd = (195, 200, 210, 255)
        # Bentuk janggut segitiga menjuntai dari dagu y:21..28
        for by in range(21, 29):
            w = max(1, 4 - (by - 21) // 2)
            for bx in range(24 - w, 24 + w + 1):
                c = beard_col if by < 27 else beard_shd
                out.putpixel((bx, by), c)
    elif 'side' in row_type:
        beard_col = (235, 238, 245, 255)
        for by in range(21, 28):
            w = max(1, 3 - (by - 21) // 2)
            for bx in range(26, 26 + w + 1):
                out.putpixel((bx, by), beard_col)
                
    # Tongkat Tetua (Elder Staff)
    staff_col = (110, 75, 45, 255)
    gem_col = (255, 215, 80, 255)
    gem_core = (255, 245, 180, 255)
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        sx = 34
        # Tongkat kayu dari y:14 sampai y:38
        for sy in range(14, 38):
            out.putpixel((sx, sy), staff_col)
        # Kristal Lumina di puncak
        out.putpixel((sx, 13), gem_col)
        out.putpixel((sx, 12), gem_core)
        out.putpixel((sx - 1, 13), gem_col)
        out.putpixel((sx + 1, 13), gem_col)
    elif 'side' in row_type:
        sx = 33
        for sy in range(15, 38):
            out.putpixel((sx, sy), staff_col)
        out.putpixel((sx, 14), gem_core)
        out.putpixel((sx, 13), gem_col)
        
    return out

def transform_girl(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Kulit cerah merona
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 1.05, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 1.02, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 1.08, 0, 255)
    
    # Rambut cokelat kepang
    arr[mask_hair, 0] = 115
    arr[mask_hair, 1] = 68
    arr[mask_hair, 2] = 42
    
    # Gaun hijau muda segar
    arr[mask_cloth, 0] = 88
    arr[mask_cloth, 1] = 168
    arr[mask_cloth, 2] = 98
    
    # Rok & sepatu
    arr[mask_pants, 0] = 135
    arr[mask_pants, 1] = 90
    arr[mask_pants, 2] = 65
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    # Celemek putih bersih di dada & pinggang
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        apron_col = (248, 245, 235, 255)
        apron_shd = (215, 210, 200, 255)
        for y in range(24, 32):
            for x in range(21, 28):
                c = apron_col if y < 30 else apron_shd
                out.putpixel((x, y), c)
        # Kepang kembar di kiri dan kanan bahu
        braid_col = (115, 68, 42, 255)
        ribbon_col = (235, 95, 120, 255)
        for by in range(18, 26):
            out.putpixel((16, by), braid_col)
            out.putpixel((31, by), braid_col)
        out.putpixel((16, 26), ribbon_col)
        out.putpixel((31, 26), ribbon_col)
        # Pipi merona
        out.putpixel((19, 18), (245, 140, 150, 255))
        out.putpixel((28, 18), (245, 140, 150, 255))
    elif 'side' in row_type:
        # Kepang samping
        for by in range(18, 26):
            out.putpixel((19, by), (115, 68, 42, 255))
        out.putpixel((19, 26), (235, 95, 120, 255))
        out.putpixel((27, 18), (245, 140, 150, 255))
        
    return out

def transform_farmer(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Kulit cokelat terbakar matahari
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 0.92, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 0.82, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 0.65, 0, 255)
    
    # Baju kerja biru linen pudar
    arr[mask_cloth, 0] = 72
    arr[mask_cloth, 1] = 95
    arr[mask_cloth, 2] = 132
    
    # Celana cokelat lusuh
    arr[mask_pants, 0] = 98
    arr[mask_pants, 1] = 74
    arr[mask_pants, 2] = 52
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Topi Caping Jerami Bundar di kepala
    caping_top = (225, 190, 115, 255)
    caping_mid = (185, 150, 85, 255)
    caping_shd = (145, 110, 55, 255)
    # Gambar tudung kerucut melengkung
    for cy in range(4, 14):
        w = (cy - 4) * 2 + 1
        for cx in range(24 - w, 24 + w + 1):
            if 0 <= cx < HERO_FW and 0 <= cy < HERO_FH:
                col = caping_top if cy < 8 else caping_mid if cy < 11 else caping_shd
                out.putpixel((cx, cy), col)
                
    # Cangkul tani kayu & baja di tangan kanan
    hoe_wood = (120, 80, 48, 255)
    hoe_iron = (175, 185, 195, 255)
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        for hy in range(16, 38):
            out.putpixel((34, hy), hoe_wood)
        out.putpixel((33, 16), hoe_iron)
        out.putpixel((34, 15), hoe_iron)
        out.putpixel((35, 16), hoe_iron)
    elif 'side' in row_type:
        for hy in range(16, 37):
            out.putpixel((32, hy), hoe_wood)
        out.putpixel((31, 15), hoe_iron)
        out.putpixel((32, 14), hoe_iron)
        
    return out

def transform_merchant(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Kulit pedagang sawo matang halus
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 0.96, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 0.88, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 0.72, 0, 255)
    
    # Rambut hitam
    arr[mask_hair, 0] = 45
    arr[mask_hair, 1] = 38
    arr[mask_hair, 2] = 40
    
    # Rompi Hijau Zaitun & Blus
    arr[mask_cloth, 0] = 92
    arr[mask_cloth, 1] = 112
    arr[mask_cloth, 2] = 62
    
    # Gaun bawah terracotta
    arr[mask_pants, 0] = 168
    arr[mask_pants, 1] = 78
    arr[mask_pants, 2] = 58
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Selendang Merah-Oranye di leher/kepala
    scarf_col = (198, 62, 45, 255)
    scarf_shd = (145, 38, 28, 255)
    for sy in range(13, 18):
        for sx in range(16, 32):
            if arr[sy, sx, 3] > 100:
                out.putpixel((sx, sy), scarf_col if sy < 16 else scarf_shd)
                
    # Kantong koin emas di pinggang
    pouch_col = (125, 75, 42, 255)
    gold_coin = (255, 215, 60, 255)
    out.putpixel((18, 28), pouch_col)
    out.putpixel((18, 29), pouch_col)
    out.putpixel((19, 28), pouch_col)
    out.putpixel((19, 29), gold_coin)
    
    return out

def transform_child(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Kulit anak cerah
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 1.06, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 1.04, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 1.10, 0, 255)
    
    # Rambut cokelat muda jabrik
    arr[mask_hair, 0] = 135
    arr[mask_hair, 1] = 85
    arr[mask_hair, 2] = 50
    
    # Baju tunik biru ceria
    arr[mask_cloth, 0] = 62
    arr[mask_cloth, 1] = 148
    arr[mask_cloth, 2] = 215
    
    # Celana pendek tan
    arr[mask_pants, 0] = 185
    arr[mask_pants, 1] = 155
    arr[mask_pants, 2] = 110
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    # Pipi bulat kemerahan
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        out.putpixel((19, 18), (250, 150, 155, 255))
        out.putpixel((28, 18), (250, 150, 155, 255))
        
    return out

def transform_guard(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Zirah Baja Mengilap di dada dan bahu
    steel_hi   = 225
    steel_mid  = 175
    steel_dark = 115
    arr[mask_cloth, 0] = steel_mid
    arr[mask_cloth, 1] = steel_mid + 8
    arr[mask_cloth, 2] = steel_mid + 18
    
    # Celana zirah baja
    arr[mask_pants, 0] = 85
    arr[mask_pants, 1] = 95
    arr[mask_pants, 2] = 115
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    d = ImageDraw.Draw(out)
    
    # Helm Prajurit Baja di kepala
    helm_top = (230, 238, 250, 255)
    helm_mid = (175, 185, 205, 255)
    helm_shd = (105, 115, 135, 255)
    for hy in range(6, 17):
        for hx in range(16, 32):
            if arr[hy, hx, 3] > 100:
                c = helm_top if hy < 9 else helm_mid if hy < 14 else helm_shd
                out.putpixel((hx, hy), c)
    # Noseguard / visor baja
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        out.putpixel((24, 16), helm_shd)
        out.putpixel((24, 17), helm_shd)
        
    # Tombak Penjaga Gerbang (Guard Spear)
    spear_shaft = (130, 92, 58, 255)
    spear_head  = (225, 235, 250, 255)
    spear_shd   = (145, 155, 175, 255)
    banner_blue = (45, 85, 175, 255)
    
    sx = 35 if ('down' in row_type or 'talk' in row_type or 'work' in row_type) else 33
    for sy in range(8, 38):
        out.putpixel((sx, sy), spear_shaft)
    # Mata tombak runcing perak
    out.putpixel((sx, 7), spear_shd)
    out.putpixel((sx, 6), spear_head)
    out.putpixel((sx, 5), spear_head)
    out.putpixel((sx, 4), (255, 255, 255, 255))
    out.putpixel((sx - 1, 6), spear_head)
    out.putpixel((sx + 1, 6), spear_head)
    # Pita bendera biru di pangkal mata tombak
    out.putpixel((sx - 1, 8), banner_blue)
    out.putpixel((sx - 2, 9), banner_blue)
    
    return out

def transform_woman(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Rambut disanggul rapi hitam
    arr[mask_hair, 0] = 38
    arr[mask_hair, 1] = 32
    arr[mask_hair, 2] = 35
    
    # Gaun ungu marun / plum
    arr[mask_cloth, 0] = 128
    arr[mask_cloth, 1] = 48
    arr[mask_cloth, 2] = 78
    
    # Rok panjang marun
    arr[mask_pants, 0] = 105
    arr[mask_pants, 1] = 38
    arr[mask_pants, 2] = 62
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Sanggul rambut di atas kepala
    bun_col = (38, 32, 35, 255)
    pin_col = (215, 165, 75, 255)
    for by in range(3, 7):
        for bx in range(22, 26):
            out.putpixel((bx, by), bun_col)
    out.putpixel((26, 4), pin_col)
    out.putpixel((27, 3), pin_col)
    
    # Celemek putih bersih
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        for cy in range(24, 33):
            for cx in range(20, 28):
                out.putpixel((cx, cy), (248, 248, 248, 255) if cy < 31 else (218, 218, 218, 255))
        # Nampan kue jahe harum
        tray_col = (185, 135, 80, 255)
        cookie   = (215, 155, 70, 255)
        sugar    = (255, 245, 220, 255)
        for tx in range(20, 28):
            out.putpixel((tx, 27), tray_col)
        out.putpixel((21, 26), cookie)
        out.putpixel((23, 26), cookie)
        out.putpixel((25, 26), cookie)
        out.putpixel((23, 25), sugar)
        
    return out

def transform_smith(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Kulit tempa kecokelatan berotot
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 0.90, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 0.78, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 0.60, 0, 255)
    
    # Rambut hitam legam
    arr[mask_hair, 0] = 35
    arr[mask_hair, 1] = 30
    arr[mask_hair, 2] = 32
    
    # Celemek kulit tempa tebal cokelat gelap
    arr[mask_cloth, 0] = 68
    arr[mask_cloth, 1] = 42
    arr[mask_cloth, 2] = 30
    
    # Celana kerja abu-abu arang
    arr[mask_pants, 0] = 65
    arr[mask_pants, 1] = 68
    arr[mask_pants, 2] = 72
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Bandana pengikat dahi abu-abu
    band_col = (95, 100, 110, 255)
    for bx in range(16, 32):
        if arr[14, bx, 3] > 100:
            out.putpixel((bx, 14), band_col)
            out.putpixel((bx, 15), band_col)
            
    # Palu Tempa Pandai Besi (Blacksmith Hammer)
    hammer_iron = (145, 152, 162, 255)
    hammer_wood = (105, 68, 42, 255)
    hx = 34 if ('down' in row_type or 'talk' in row_type or 'work' in row_type) else 32
    for hy in range(22, 36):
        out.putpixel((hx, hy), hammer_wood)
    # Kepala palu besi tebal
    out.putpixel((hx - 1, 21), hammer_iron)
    out.putpixel((hx, 21), hammer_iron)
    out.putpixel((hx + 1, 21), hammer_iron)
    out.putpixel((hx - 1, 20), hammer_iron)
    out.putpixel((hx, 20), hammer_iron)
    out.putpixel((hx + 1, 20), hammer_iron)
    
    return out

def transform_inn(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Rambut cokelat kemerahan (auburn)
    arr[mask_hair, 0] = 98
    arr[mask_hair, 1] = 52
    arr[mask_hair, 2] = 38
    
    # Gaun hijau toska segar penginapan
    arr[mask_cloth, 0] = 48
    arr[mask_cloth, 1] = 128
    arr[mask_cloth, 2] = 122
    
    # Rok toska gelap
    arr[mask_pants, 0] = 35
    arr[mask_pants, 1] = 95
    arr[mask_pants, 2] = 90
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Celemek pelayan krem berenda
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        for ay in range(24, 32):
            for ax in range(20, 28):
                out.putpixel((ax, ay), (245, 238, 222, 255) if ay < 30 else (215, 208, 195, 255))
        # Nampan cangkir teh hangat
        tray_wood = (165, 115, 70, 255)
        cup_white = (245, 245, 245, 255)
        tea_steam = (255, 215, 120, 255)
        for tx in range(20, 28):
            out.putpixel((tx, 27), tray_wood)
        out.putpixel((23, 26), cup_white)
        out.putpixel((24, 26), cup_white)
        out.putpixel((23, 25), tea_steam)
        # Kunci kuningan di pinggang
        out.putpixel((18, 29), (225, 185, 65, 255))
        out.putpixel((18, 30), (225, 185, 65, 255))
        
    return out

def transform_mom(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Kulit hangat keibuan
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 1.02, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 0.98, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 0.95, 0, 255)
    
    # Rambut cokelat bergelombang anggun
    arr[mask_hair, 0] = 108
    arr[mask_hair, 1] = 65
    arr[mask_hair, 2] = 42
    
    # Gaun rumah tangga biru keabuan
    arr[mask_cloth, 0] = 78
    arr[mask_cloth, 1] = 98
    arr[mask_cloth, 2] = 128
    
    # Rok panjang
    arr[mask_pants, 0] = 62
    arr[mask_pants, 1] = 78
    arr[mask_pants, 2] = 105
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Selendang ungu lavender lembut melingkar di pundak
    shawl_col = (158, 132, 178, 255)
    shawl_shd = (125, 98, 145, 255)
    for sy in range(21, 26):
        for sx in range(16, 32):
            if arr[sy, sx, 3] > 100:
                c = shawl_col if sy < 24 else shawl_shd
                out.putpixel((sx, sy), c)
                
    return out

def transform_priest(crop, row_type, frame_idx):
    arr = np.array(crop).astype(int)
    mask_skin, mask_hair, mask_cloth, mask_pants = get_masks(arr)
    
    # Rambut putih perak tersisir rapi
    arr[mask_hair, 0] = 228
    arr[mask_hair, 1] = 232
    arr[mask_hair, 2] = 240
    
    # Jubah Sutra Putih Bersih Kuil Lumina
    arr[mask_cloth, 0] = 246
    arr[mask_cloth, 1] = 248
    arr[mask_cloth, 2] = 252
    
    # Jubah bawah putih
    arr[mask_pants, 0] = 215
    arr[mask_pants, 1] = 220
    arr[mask_pants, 2] = 228
    
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    # Stola Emas Seremonial di kedua pundak
    gold_stole = (235, 195, 65, 255)
    gold_shd   = (195, 155, 45, 255)
    if 'down' in row_type or 'talk' in row_type or 'work' in row_type:
        for sy in range(21, 33):
            out.putpixel((20, sy), gold_stole if sy < 30 else gold_shd)
            out.putpixel((27, sy), gold_stole if sy < 30 else gold_shd)
        # Liontin Simbol Cahaya Lumina di tengah dada
        out.putpixel((23, 23), gold_stole)
        out.putpixel((24, 23), (255, 235, 140, 255))
        out.putpixel((23, 24), gold_stole)
        
    return out

# Daftar 11 NPC Desa
VILLAGE_NPCS = {
    'elder': transform_elder,
    'girl': transform_girl,
    'farmer': transform_farmer,
    'merchant': transform_merchant,
    'child': transform_child,
    'guard': transform_guard,
    'woman': transform_woman,
    'smith': transform_smith,
    'inn': transform_inn,
    'mom': transform_mom,
    'priest': transform_priest,
}

# Pemetaan Baris Atlas 8 Baris:
# Row 0: idle_down (4 frames) -> ambil dari Arka row 0
# Row 1: walk_down (4 frames) -> ambil dari Arka row 1
# Row 2: idle_up   (4 frames) -> ambil dari Arka row 2
# Row 3: walk_up   (4 frames) -> ambil dari Arka row 3
# Row 4: idle_side (4 frames) -> ambil dari Arka row 4
# Row 5: walk_side (4 frames) -> ambil dari Arka row 6
# Row 6: act_talk  (4 frames) -> ambil dari Arka row 36 (cheer/nod)
# Row 7: act_work  (4 frames) -> ambil dari Arka row 35 (hoe) atau row 34 (pick)

ROW_CONFIGS = [
    ("idle_down", 0),
    ("walk_down", 1),
    ("idle_up",   2),
    ("walk_up",   3),
    ("idle_side", 4),
    ("walk_side", 6),
    ("act_talk",  36),
    ("act_work",  35),
]

def bake_npc(npc_id, transform_fn):
    target_png = f'assets/img/npc/npc_{npc_id}.png'
    sheet = Image.new('RGBA', (HERO_FW * 4, HERO_FH * 8), (0, 0, 0, 0))
    
    # Backup 32x32 lama jika belum dibackup
    if os.path.exists(target_png):
        old = Image.open(target_png)
        if old.size == (32, 32):
            old.save(f'assets/img/npc/backup_32x32/npc_{npc_id}_32x32.png')
            
    for row_idx, (row_name, arka_row) in enumerate(ROW_CONFIGS):
        for col_idx in range(4):
            # Ambil sel Arka
            crop = arka_img.crop((col_idx * HERO_FW, arka_row * HERO_FH, (col_idx + 1) * HERO_FW, (arka_row + 1) * HERO_FH))
            
            # Jika NPC adalah child, kita skalakan sedikit lebih mungil (0.88x)
            if npc_id == 'child':
                crop_scaled = crop.resize((int(HERO_FW * 0.88), int(HERO_FH * 0.88)), Image.NEAREST)
                cell = Image.new('RGBA', (HERO_FW, HERO_FH), (0, 0, 0, 0))
                # Tempatkan di dasar sel
                cell.paste(crop_scaled, (int((HERO_FW - crop_scaled.width) / 2), HERO_FH - crop_scaled.height), crop_scaled)
                char_cell = transform_fn(cell, row_name, col_idx)
            else:
                char_cell = transform_fn(crop, row_name, col_idx)
                
            cell_x = col_idx * HERO_FW
            cell_y = row_idx * HERO_FH
            sheet.paste(char_cell, (cell_x, cell_y), char_cell)
            
    sheet.save(target_png, optimize=True)
    print(f"Bake Success: {target_png} ({sheet.size[0]}x{sheet.size[1]})")

def main():
    print("Mulai baking seluruh NPC Desa Lumina (11 Karakter) bergaya Arka...")
    for npc_id, fn in VILLAGE_NPCS.items():
        bake_npc(npc_id, fn)
    print("\nSemua 11 NPC Desa berhasil di-bake!")

if __name__ == '__main__':
    main()
