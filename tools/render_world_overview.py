#!/usr/bin/env python3
"""
Generate a complete, high-resolution composite of the entire world map of Legenda Lumina in 1 image.
Features:
1. Seamless Contiguous World: Area peralihan dihapus total! Peta-peta utama saling menempel rapat langsung di pintu masuk/keluarnya.
2. 100% Rich 5-Stage Continuous Road Gradient: Seluruh jalan tanah menggunakan gradasi halus 5 rona warna emas Lumina (#dcba84 -> #c29a64 -> #aa8452 -> #8e6c40 -> #747a3c).
3. Rich Natural Dirt Patches: Sebaran bercak cokelat alami lebat (~25-28%) di seluruh benua.
4. Preserved Original Lakes & Water: Danau Cermin dan kolam air asli dijaga 100% utuh.
"""
import os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Koordinat Global Wilayah Menempel Langsung Tanpa Medan Peralihan
WORLD_POS = {
    'village': (3000, 3000, 1024, 712, 'Desa Lumina'),
    'forest': (2872, 3712, 1280, 1200, 'Hutan Lumina & Kuil Kuno'),
    'meadow': (4024, 2920, 1440, 1040, 'Padang Angin & Kincir'),
    'lake': (1600, 3060, 1400, 1000, 'Danau Cermin'),
    'road': (1970, 1060, 900, 2000, 'Jalan Raya Lama & Monolit'),
    'snow': (3984, 1720, 1280, 1200, 'Puncak Beku'),
    'swamp': (6752, 3960, 1280, 960, 'Rawa Senja'),
    'deepwood': (472, 3712, 2400, 1800, 'Hutan Dalam & Reruntuhan Aurel'),
    'river': (4152, 3960, 2600, 1000, 'Jalur Sungai Senja'),
    'kgate': (1820, 160, 1200, 900, 'Gerbang Kota Lumina'),
    'kpasar': (1620, -1040, 1600, 1200, 'Distrik Pasar Kota Lumina'),
    'kakademi': (1720, -2040, 1400, 1000, 'Distrik Akademi & Kastil'),
    'kbawah': (420, -920, 1200, 1000, 'Kota Bawah & Kanal'),
    'kpermukiman': (3220, -920, 1400, 1000, 'Distrik Permukiman'),
}

def render_overview():
    print(">>> Merender Peta Dunia Utuh (Kontigu & Mulus Tanpa Medan Peralihan)...")
    
    pad = 120
    min_x = min(p[0] for p in WORLD_POS.values()) - pad
    min_y = min(p[1] for p in WORLD_POS.values()) - pad
    max_x = max(p[0] + p[2] for p in WORLD_POS.values()) + pad
    max_y = max(p[1] + p[3] for p in WORLD_POS.values()) + pad
    
    total_w = max_x - min_x
    total_h = max_y - min_y
    print(f"  [Canvas Bounds] X: [{min_x}, {max_x}], Y: [{min_y}, {max_y}] -> Ukuran: {total_w} x {total_h}")

    # 1. Base Background: Hijau Alami Lumina (#4a883a)
    world_img = Image.new('RGB', (total_w, total_h), (74, 136, 58))
    
    # 2. Urutan Penempelan Peta agar Kontigu dan Bebas Tabrakan:
    # Lake ditempel dipotong di y <= 652 (garis Y_global = 3712), sehingga Danau Cermin utuh 100%
    # dan anak sungai keluar di (1332, 652) [Global 2932, 3712],
    # lalu Forest ditempel di Y_global = 3712 menyambung anak sungai persis dari (60, 0) [Global 2932, 3712]!
    order = ['road', 'snow', 'meadow', 'river', 'swamp', 'village', 'lake', 'deepwood', 'forest', 'kgate', 'kpasar', 'kakademi', 'kbawah', 'kpermukiman']
    for map_id in order:
        if map_id not in WORLD_POS:
            continue
        gx, gy, mw, mh, title = WORLD_POS[map_id]
        dest_x = int(gx - min_x)
        dest_y = int(gy - min_y)
        
        ground_path = os.path.join(ROOT, 'tiled', 'ground', f'{map_id}_ground.png')
        if os.path.exists(ground_path):
            area_img = Image.open(ground_path).convert('RGB')
            if area_img.size != (mw, mh):
                area_img = area_img.resize((mw, mh), Image.Resampling.LANCZOS)
            
            # Khusus Lake: perbatasan selatan menempel rapat di Y_global = 3712 (y_lokal = 652)
            # Area di bawah Y_global = 3712 adalah domain Deepwood dan Forest
            if map_id == 'lake':
                cut_h = int(3712 - gy)  # 652 px
                area_img = area_img.crop((0, 0, mw, cut_h))
            
            world_img.paste(area_img, (dest_x, dest_y))
            print(f"  [OK] Peta Utama ditempel: {map_id} ({mw}x{mh}) di ({dest_x}, {dest_y})")
        else:
            # Distrik Kota Lumina: Paving batu halus dengan jalan utama emas Lumina
            synth = Image.new('RGB', (mw, mh), (218, 210, 198))
            s_draw = ImageDraw.Draw(synth)
            for py in range(0, mh, 16):
                s_draw.line([(0, py), (mw, py)], fill=(195, 185, 172), width=1)
            for px in range(0, mw, 16):
                s_draw.line([(px, 0), (px, mh)], fill=(195, 185, 172), width=1)
                
            # Jalan koridor utama emas Lumina
            if map_id == 'kgate':
                s_draw.line([(600, 900), (600, 380)], fill=(156, 124, 80), width=48)
                s_draw.line([(600, 900), (600, 380)], fill=(186, 148, 96), width=38)
                s_draw.line([(300, 640), (900, 640)], fill=(156, 124, 80), width=36)
                s_draw.line([(300, 640), (900, 640)], fill=(186, 148, 96), width=28)
            elif map_id == 'kpasar':
                s_draw.line([(800, 1200), (800, 0)], fill=(156, 124, 80), width=48)
                s_draw.line([(800, 1200), (800, 0)], fill=(186, 148, 96), width=38)
                s_draw.line([(0, 620), (1600, 620)], fill=(156, 124, 80), width=44)
                s_draw.line([(0, 620), (1600, 620)], fill=(186, 148, 96), width=34)
            elif map_id == 'kakademi':
                s_draw.line([(700, 1000), (700, 380)], fill=(156, 124, 80), width=48)
                s_draw.line([(700, 1000), (700, 380)], fill=(186, 148, 96), width=38)
            elif map_id == 'kbawah':
                s_draw.line([(1200, 500), (200, 500)], fill=(156, 124, 80), width=44)
                s_draw.line([(1200, 500), (200, 500)], fill=(186, 148, 96), width=34)
            s_draw.rectangle([6, 6, mw - 6, mh - 6], outline=(120, 110, 100), width=8)
            world_img.paste(synth, (dest_x, dest_y))
            print(f"  [OK] Kota ditempel: {map_id} ({mw}x{mh})")

    # 3. Label Nama Wilayah Utama Elegan
    banner_draw = ImageDraw.Draw(world_img)
    for map_id, (gx, gy, mw, mh, title) in WORLD_POS.items():
        dest_x = int(gx - min_x)
        dest_y = int(gy - min_y)
        bx, by = dest_x + 30, dest_y + 30
        bw, bh = len(title) * 11 + 40, 42
        banner_draw.rectangle([bx, by, bx + bw, by + bh], fill=(22, 28, 36), outline=(210, 175, 95), width=2)
        banner_draw.text((bx + 20, by + 12), title, fill=(255, 240, 200))
        
    # 4. Simpan Hasil Akhir
    out_asset = os.path.join(ROOT, 'assets', 'img', 'world_map_overview.png')
    out_brain = '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6/world_map_overview.png'
    
    # Skala pratinjau proporsional
    scale_w = 3200
    scale_h = int(total_h * (3200.0 / total_w))
    display_img = world_img.resize((scale_w, scale_h), Image.Resampling.LANCZOS)
    display_img.save(out_asset, 'PNG', optimize=True)
    display_img.save(out_brain, 'PNG', optimize=True)
    print(f"  [OK] Gambar peta tersimpan di: {out_asset} ({scale_w}x{scale_h})")
    print(f"  [OK] Gambar peta tersalin ke artefak: {out_brain}")

if __name__ == '__main__':
    render_overview()
