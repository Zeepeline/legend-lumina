#!/usr/bin/env python3
"""
Potong lembar blok tebing isometrik 4x4 (assets/raw/iso/tanah/tebing_rumput.png)
Simpan potongan ubin tebing kiri, tebing kanan, sudut, dan tangga ke assets/img/iso/
"""
import os, sys
from PIL import Image

def is_magenta(r, g, b):
    return r > 160 and g < 110 and b > 160 and abs(r - b) < 65

def clean_cell(cell):
    w, h = cell.size
    rgba = cell.convert('RGBA')
    pix = rgba.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if is_magenta(r, g, b):
                pix[x, y] = (0, 0, 0, 0)
            elif r > 180 and b > 180 and g < 135:
                pix[x, y] = (r, g, b, 0)
    return rgba

def process_cliffs(src_path, out_dir):
    if not os.path.exists(src_path):
        print(f"Error: {src_path} tidak ditemukan")
        return False
    
    im = Image.open(src_path).convert('RGB')
    W, H = im.size
    cols, rows = 4, 4
    cw, ch = W // cols, H // rows
    
    os.makedirs(out_dir, exist_ok=True)
    
    # Target ukuran muka tebing di game: lebar 16, tinggi 26 px (sesuai ISO.T=16, ISO.ZH=26)
    # Cell (0,1): tebing kiri (lit)
    cell_l = clean_cell(im.crop((1 * cw, 0 * ch, 2 * cw, 1 * ch)))
    bbox_l = cell_l.getbbox()
    if bbox_l:
        crop_l = cell_l.crop(bbox_l)
        scaled_l = crop_l.resize((16, 26), Image.NEAREST)
        scaled_l.save(os.path.join(out_dir, 'cliff_face_l.png'))
        print(f"Saved cliff_face_l.png (16x26)")
    
    # Cell (0,2): tebing kanan (shaded)
    cell_r = clean_cell(im.crop((2 * cw, 0 * ch, 3 * cw, 1 * ch)))
    bbox_r = cell_r.getbbox()
    if bbox_r:
        crop_r = cell_r.crop(bbox_r)
        scaled_r = crop_r.resize((16, 26), Image.NEAREST)
        scaled_r.save(os.path.join(out_dir, 'cliff_face_r.png'))
        print(f"Saved cliff_face_r.png (16x26)")
    
    # Cell (1,3): tangga batu
    cell_stairs = clean_cell(im.crop((3 * cw, 1 * ch, 4 * cw, 2 * ch)))
    bbox_s = cell_stairs.getbbox()
    if bbox_s:
        crop_s = cell_stairs.crop(bbox_s)
        scaled_s = crop_s.resize((32, 34), Image.NEAREST)
        scaled_s.save(os.path.join(out_dir, 'cliff_stairs.png'))
        print(f"Saved cliff_stairs.png (32x34)")
        
    return True

if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'assets/raw/iso/tanah/tebing_rumput.png'
    out = sys.argv[2] if len(sys.argv) > 2 else 'assets/img/iso/'
    process_cliffs(src, out)
