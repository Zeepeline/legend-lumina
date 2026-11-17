#!/usr/bin/env python3
"""Ekstrak, defringe & bersihkan sprite sheet pohon apel HD (berbuah & tanpa buah)
dari media_1794863972705_919a24b4.jpg.
Merapikan cropping & menghilangkan seluruh halo/fringe putih di pinggir:
- Filter checkerboard presisi + deteksi sisa fringe putih JPEG.
- Defringe pass pada perbatasan tepi luar daun agar tidak ada garis putih.
- Pruning debu/noise terisolasi (hanya mempertahankan partikel daun hijau asli).
- Titik tumpu batang pohon terpusat tepat di (72, 138) pada setiap frame 144x144.
- Resolusi HD 100% pixel-art murni tanpa downscaling kasar.
- Menyimpan:
  * assets/img/nature/tree_apple_fruit.png (1152x144, 8 frame)
  * assets/img/nature/tree_apple_bare.png (1152x144, 8 frame)
  * assets/img/apple1.png & varian frame 0
  * assets/img/apple2.png & varian frame 0
"""
from collections import deque
import os
from PIL import Image

SRC = '/Users/herlambang/.gemini/antigravity/brain/cfbc75d1-f33a-4d17-8507-04ca25a2c78d/.user_uploaded/media_1794863972705_919a24b4.jpg'
ROOT = os.path.join(os.path.dirname(__file__), '..')
ARTIFACT_DIR = '/Users/herlambang/.gemini/antigravity/brain/cfbc75d1-f33a-4d17-8507-04ca25a2c78d'

FW, FH = 144, 144
ANC_X, ANC_Y = 72, 138


def is_fringe_or_bg(r, g, b):
    # Buah apel merah/oranye utuh
    if r >= 150 and (r - b) >= 30 and (r - g) >= 15:
        return False
    # Checkerboard netral
    if r >= 200 and g >= 200 and b >= 200 and max(r, g, b) - min(r, g, b) <= 25:
        return True
    # Fringe terang keputihan dari background JPEG
    if min(r, g, b) >= 135 and b >= 105:
        return True
    if r >= 160 and g >= 175 and b >= 130:
        return True
    if (r + g + b) >= 510:
        return True
    return False


def build_sheet(raw_im, y_min, y_max):
    W, H = raw_im.size
    pix = raw_im.load()

    # 1. Mask awal (hapus checkerboard & fringe putih)
    mask = [[False] * W for _ in range(H)]
    for y in range(y_min, y_max):
        for x in range(W):
            r, g, b = pix[x, y][:3]
            if not is_fringe_or_bg(r, g, b):
                mask[y][x] = True

    # 2. Defringe tepi luar (bersihkan pixel keputihan yang menempel di outline)
    for y in range(y_min, y_max):
        for x in range(W):
            if mask[y][x]:
                r, g, b = pix[x, y][:3]
                is_edge = any(
                    not (0 <= x + dx < W and y_min <= y + dy < y_max and mask[y + dy][x + dx])
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]
                )
                if is_edge:
                    if (r + g + b) >= 420 or (min(r, g, b) >= 110 and b >= 85):
                        if not (r >= 150 and (r - b) >= 30):
                            mask[y][x] = False

    # 3. Prune noise terisolasi (hapus titik debu <= 3 pixel yang bukan hijau murni)
    visited = set()
    for y in range(y_min, y_max):
        for x in range(W):
            if mask[y][x] and (x, y) not in visited:
                comp = []
                q = deque([(x, y)])
                visited.add((x, y))
                while q:
                    cx, cy = q.popleft()
                    comp.append((cx, cy))
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < W and y_min <= ny < y_max and mask[ny][nx] and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            q.append((nx, ny))
                if len(comp) <= 3:
                    rgbs = [pix[cx, cy][:3] for cx, cy in comp]
                    avg_r = sum(c[0] for c in rgbs) / len(rgbs)
                    avg_g = sum(c[1] for c in rgbs) / len(rgbs)
                    if avg_g <= avg_r + 15:
                        for cx, cy in comp:
                            mask[cy][cx] = False

    # 4. Batas kolom berdasarkan pusat batang alami antar pohon (~128 px)
    approx_trunks = [59.5, 189.0, 316.2, 444.8, 572.4, 700.4, 828.5, 956.5]
    bounds = [0]
    for i in range(7):
        bounds.append((approx_trunks[i] + approx_trunks[i + 1]) / 2)
    bounds.append(W)

    sheet = Image.new('RGBA', (FW * 8, FH), (0, 0, 0, 0))
    sheet_pix = sheet.load()

    for col in range(8):
        x_left = bounds[col]
        x_right = bounds[col + 1]

        tree_pixels = []
        for y in range(y_min, y_max):
            for x in range(int(x_left), int(x_right)):
                if mask[y][x]:
                    r, g, b = pix[x, y][:3]
                    tree_pixels.append((x, y, (r, g, b, 255)))

        if not tree_pixels:
            continue

        ys = [p[1] for p in tree_pixels]
        max_y = max(ys)
        bot_pts = [p[0] for p in tree_pixels if p[1] >= max_y - 8]
        tc_x = sum(bot_pts) / len(bot_pts)
        tc_y = max_y

        col_offset = col * FW
        for x, y, rgba in tree_pixels:
            dest_x = int(round(ANC_X + (x - tc_x)))
            dest_y = int(round(ANC_Y + (y - tc_y)))
            if 0 <= dest_x < FW and 0 <= dest_y < FH:
                sheet_pix[col_offset + dest_x, dest_y] = rgba

    return sheet


def main():
    if not os.path.exists(SRC):
        print('Sumber tidak ditemukan:', SRC)
        return

    raw_im = Image.open(SRC).convert('RGBA')

    # Baris 1: Pohon berbuah (y=15..148)
    fruit_sheet = build_sheet(raw_im, 15, 148)
    # Baris 2: Pohon tanpa buah (y=184..322)
    bare_sheet = build_sheet(raw_im, 184, 322)

    out_dir = os.path.join(ROOT, 'assets/img/nature')
    os.makedirs(out_dir, exist_ok=True)

    p_fruit = os.path.join(out_dir, 'tree_apple_fruit.png')
    p_bare = os.path.join(out_dir, 'tree_apple_bare.png')
    fruit_sheet.save(p_fruit)
    bare_sheet.save(p_bare)
    print(f'Tersimpan: {p_fruit} {fruit_sheet.size}')
    print(f'Tersimpan: {p_bare} {bare_sheet.size}')

    # Frame 0 statis untuk cadangan
    f0_fruit = fruit_sheet.crop((0, 0, FW, FH))
    f0_bare = bare_sheet.crop((0, 0, FW, FH))

    for target in [
        os.path.join(ROOT, 'assets/img/apple1.png'),
        os.path.join(ROOT, 'assets/img/nature/apple1.png'),
        os.path.join(ROOT, 'assets/img/nature/gpt_i_apple1.png'),
        os.path.join(ROOT, 'assets/img/gpt_i_apple1.png'),
    ]:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        f0_fruit.save(target)

    for target in [
        os.path.join(ROOT, 'assets/img/apple2.png'),
        os.path.join(ROOT, 'assets/img/nature/apple2.png'),
        os.path.join(ROOT, 'assets/img/nature/gpt_i_apple2.png'),
        os.path.join(ROOT, 'assets/img/gpt_i_apple2.png'),
    ]:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        f0_bare.save(target)

    # Simpan juga ke artifact dir untuk review user
    if os.path.exists(ARTIFACT_DIR):
        fruit_sheet.save(os.path.join(ARTIFACT_DIR, 'tree_apple_fruit_clean.png'))
        bare_sheet.save(os.path.join(ARTIFACT_DIR, 'tree_apple_bare_clean.png'))

    print('Selesai membuat sprite sheet bersih pohon apel!')


if __name__ == '__main__':
    main()
