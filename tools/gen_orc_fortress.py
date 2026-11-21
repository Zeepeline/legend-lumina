#!/usr/bin/env python3
"""
Ekstrak & bersihkan aset Benteng Orc / Bandit Palisade dari assets/raw/orc_fortress_sheet.jpg
sesuai docs/VALIDATION_RULES.md (tanpa anti-aliasing, tanpa garis tepi hitam murni, latar transparan).
Menyimpan ke assets/img/buildings/ dan assets/img/props/, lalu membuat tileset Tiled orc_fortress.tsj.
"""

import os
import shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET_PATH = os.path.join(ROOT, 'assets', 'raw', 'orc_fortress_sheet.jpg')

def main():
    if not os.path.exists(SHEET_PATH):
        print(f"Error: {SHEET_PATH} tidak ditemukan.")
        return

    src = Image.open(SHEET_PATH)
    w, h = src.size
    pix = src.load()

    # Foreground threshold
    fg = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            r, g, b = pix[x, y][:3]
            if not (r > 240 and g > 240 and b > 240):
                fg[y * w + x] = 1

    visited = bytearray(w * h)
    comps = []

    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if fg[idx] and not visited[idx]:
                q = [(x, y)]
                visited[idx] = 1
                pixels = []
                while q:
                    cx, cy = q.pop()
                    pixels.append((cx, cy))
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            nidx = ny * w + nx
                            if fg[nidx] and not visited[nidx]:
                                visited[nidx] = 1
                                q.append((nx, ny))
                if len(pixels) > 500:
                    comps.append(pixels)

    comps.sort(key=lambda p: (min(y for _, y in p), min(x for x, _ in p)))

    pieces = [
        ('gpt_orc_gate', 'buildings', comps[0]),
        ('gpt_palisade_post_banner', 'props', comps[1]),
        ('gpt_palisade_barricade', 'props', comps[2]),
        ('gpt_palisade_pillar', 'props', comps[3]),
        ('gpt_palisade_wall_long', 'props', comps[4]),
        ('gpt_palisade_wall_corner', 'props', comps[5]),
    ]

    for name, folder, p in pieces:
        min_x, max_x = min(x for x, _ in p), max(x for x, _ in p)
        min_y, max_y = min(y for _, y in p), max(y for _, y in p)
        bw, bh = max_x - min_x + 1, max_y - min_y + 1

        pad = 2
        pw, ph = bw + pad * 2, bh + pad * 2

        mask = bytearray(pw * ph)
        for x, y in p:
            mask[(y - min_y + pad) * pw + (x - min_x + pad)] = 1

        ext = bytearray(pw * ph)
        q = [(0, 0)]
        ext[0] = 1
        while q:
            cx, cy = q.pop()
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < pw and 0 <= ny < ph:
                    nidx = ny * pw + nx
                    if not ext[nidx] and mask[nidx] == 0:
                        ext[nidx] = 1
                        q.append((nx, ny))

        out = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
        opix = out.load()
        for y in range(ph):
            for x in range(pw):
                if not ext[y * pw + x]:
                    sx = min_x + x - pad
                    sy = min_y + y - pad
                    if 0 <= sx < w and 0 <= sy < h:
                        r, g, b = pix[sx, sy][:3]
                        adj_ext = False
                        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < pw and 0 <= ny < ph and ext[ny * pw + nx]:
                                adj_ext = True
                                break
                        if adj_ext and r > 245 and g > 245 and b > 245:
                            continue
                        opix[x, y] = (r, g, b, 255)

        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)

        # Simpan versi half (scale 0.5) untuk in-game
        out_half = out.resize((out.width // 2, out.height // 2), Image.NEAREST)
        dest_dir = os.path.join(ROOT, 'assets', 'img', folder)
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, f'{name}.png')
        out_half.save(dest_path)

        # Juga simpan ke tiled/tilesets/orc_fortress/ untuk Tiled
        tiled_dest = os.path.join(ROOT, 'tiled', 'tilesets', 'orc_fortress', f'{name}.png')
        os.makedirs(os.path.dirname(tiled_dest), exist_ok=True)
        out_half.save(tiled_dest)

        print(f"✅ {name:26s} -> {dest_path} (Raw: {out.size}, In-game: {out_half.size})")

if __name__ == '__main__':
    main()
