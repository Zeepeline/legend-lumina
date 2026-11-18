#!/usr/bin/env python3
"""
Potong dan proses lembar sprite karakter Arka isometrik (2:1 projection).
Format input: 4 kolom x 5 baris, latar magenta #FF00FF
Baris:
  0: down (kamera)
  1: down_right (diagonal depan)
  2: right (samping)
  3: up_right (diagonal belakang)
  4: up (belakang)
Keluaran: assets/img/iso/hero_idle_iso.png (5 arah x 4 frame, tinggi ~33px)
"""
import os, sys
from PIL import Image

TARGET_H = 33  # tinggi karakter dalam piksel game
COLS, ROWS = 4, 5
FW, FH = 48, 44  # ukuran frame dalam atlas game (tinggi 44, lebar 48)

def is_magenta(r, g, b):
    # Deteksi warna magenta latar belakang
    return r > 165 and g < 115 and b > 165 and abs(r - b) < 65

def clean_cell_pixels(cell):
    """Hapus latar belakang magenta dan bersihkan pink fringe di tepi"""
    w, h = cell.size
    rgba = cell.convert('RGBA')
    pix = rgba.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if is_magenta(r, g, b):
                pix[x, y] = (0, 0, 0, 0)
            elif r > 180 and b > 180 and g < 140:
                # Soft magenta fringe suppression
                pix[x, y] = (r, g, b, 0)
    
    bbox = rgba.getbbox()
    return rgba, bbox

def process_sheet(src_path, out_path):
    if not os.path.exists(src_path):
        print(f"Error: {src_path} tidak ditemukan")
        return False
    
    im = Image.open(src_path).convert('RGB')
    W, H = im.size
    cw = W // COLS
    ch = H // ROWS
    
    atlas = Image.new('RGBA', (COLS * FW, ROWS * FH), (0, 0, 0, 0))
    
    # 1. Kumpulkan bounding box tiap sel
    heights = []
    cleaned_grid = []
    
    for r in range(ROWS):
        row_cells = []
        for c in range(COLS):
            cell = im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
            clean_cell, bbox = clean_cell_pixels(cell)
            row_cells.append((clean_cell, bbox))
            if bbox:
                heights.append(bbox[3] - bbox[1])
        cleaned_grid.append(row_cells)
    
    if not heights:
        print("Error: Tidak ada karakter terdeteksi di lembar sprite")
        return False
    
    heights.sort()
    median_h = heights[len(heights) // 2]
    scale = TARGET_H / median_h
    print(f"Tinggi karakter median: {median_h}px, skala ke target {TARGET_H}px: {scale:.4f}")
    
    # 2. Skala dan posisikan di atlas
    for r in range(ROWS):
        for c in range(COLS):
            clean_cell, bbox = cleaned_grid[r][c]
            if not bbox:
                continue
            
            char_crop = clean_cell.crop(bbox)
            new_w = max(1, int(round(char_crop.width * scale)))
            new_h = max(1, int(round(char_crop.height * scale)))
            
            # Gunakan NEAREST agar piksel tajam tanpa blur
            scaled = char_crop.resize((new_w, new_h), Image.NEAREST)
            
            # Kaki di baseline (FH - 3), horizontal tengah
            dst_x = c * FW + (FW - new_w) // 2
            dst_y = r * FH + (FH - 3 - new_h)
            
            atlas.paste(scaled, (dst_x, dst_y), scaled)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    atlas.save(out_path)
    print(f"Berhasil membuat atlas: {out_path} ({atlas.size[0]}x{atlas.size[1]})")
    return True

if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'assets/raw/iso/arka/idle.png'
    out = sys.argv[2] if len(sys.argv) > 2 else 'assets/img/iso/hero_idle_iso.png'
    process_sheet(src, out)
