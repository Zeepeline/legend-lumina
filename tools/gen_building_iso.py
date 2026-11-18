#!/usr/bin/env python3
"""
Potong dan bersihkan aset bangunan isometrik dari generator (latar magenta #FF00FF)
Simpan ke assets/img/iso/house_a.png dengan transparansi bersih dan skala tajam.
"""
import os, sys
from PIL import Image

def is_magenta(r, g, b):
    return r > 160 and g < 110 and b > 160 and abs(r - b) < 65

def process_building(src_path, out_path, target_width=112):
    if not os.path.exists(src_path):
        print(f"Error: {src_path} tidak ditemukan")
        return False
    
    im = Image.open(src_path).convert('RGB')
    w, h = im.size
    rgba = im.convert('RGBA')
    pix = rgba.load()
    
    # Bersihkan background magenta
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if is_magenta(r, g, b):
                pix[x, y] = (0, 0, 0, 0)
            elif r > 180 and b > 180 and g < 135:
                # Magenta fringe suppression
                pix[x, y] = (r, g, b, 0)
    
    bbox = rgba.getbbox()
    if not bbox:
        print("Error: Tidak ada bangunan terdeteksi")
        return False
    
    crop = rgba.crop(bbox)
    scale = target_width / crop.width
    new_w = target_width
    new_h = max(1, int(round(crop.height * scale)))
    
    scaled = crop.resize((new_w, new_h), Image.NEAREST)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    scaled.save(out_path)
    print(f"Berhasil membuat bangunan: {out_path} ({scaled.width}x{scaled.height})")
    return True

if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'assets/raw/iso/bangunan/rumah_a.png'
    out = sys.argv[2] if len(sys.argv) > 2 else 'assets/img/iso/house_a.png'
    process_building(src, out)
