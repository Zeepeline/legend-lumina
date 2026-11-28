"""Ekstrak ubin persegi bersih dari tileset alternatif (tanpa celah checkerboard)
dan kemas rapat ke grid 16x16 per baris kategori (Rumput, Jalan, Batu Pijakan, Sungai).
"""
from collections import deque
import numpy as np
from PIL import Image

SRC = '/Users/herlambang/.gemini/antigravity/brain/4c73037a-1f44-48ba-94d7-b1f1783f10b0/.user_uploaded/media_1795836157356_73996154.jpg'
OUT = 'godot/assets/art/ground/lumina_tileset_alt.png'
T = 16


def main():
    im = Image.open(SRC).convert('RGBA')
    a = np.array(im)
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    fg = ~((mx < 88) & ((mx - mn) < 22) & (b >= r - 4))
    a[~fg, 3] = 0

    H, W = fg.shape
    vis = np.zeros_like(fg)
    boxes = []
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            if fg[y, x] and not vis[y, x]:
                q = deque([(y, x)])
                vis[y, x] = True
                y0 = y1 = y
                x0 = x1 = x
                while q:
                    cy, cx = q.popleft()
                    if cy < y0: y0 = cy
                    if cy > y1: y1 = cy
                    if cx < x0: x0 = cx
                    if cx > x1: x1 = cx
                    for ny, nx in ((cy - 2, cx), (cy + 2, cx), (cy, cx - 2), (cy, cx + 2)):
                        if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and not vis[ny, nx]:
                            vis[ny, nx] = True
                            q.append((ny, nx))
                bw, bh = x1 - x0 + 1, y1 - y0 + 1
                if 44 <= bw <= 76 and 44 <= bh <= 76:
                    boxes.append((x0, y0, bw, bh))

    boxes.sort(key=lambda t: (t[1] // 60, t[0]))
    rows = {0: [], 1: [], 2: [], 3: []}  # 0:Rumput, 1:Jalan, 2:Batu, 3:Sungai

    for x0, y0, bw, bh in boxes:
        # Potong 3px dari tepi luar agar bebas sisa checkerboard
        crop = a[y0 + 3:y0 + bh - 3, x0 + 3:x0 + bw - 3]
        if crop.shape[0] < 16 or crop.shape[1] < 16:
            continue
        tile = np.array(Image.fromarray(crop).resize((T, T), Image.Resampling.NEAREST))
        tile[..., 3] = 255
        cx = x0 + bw * 0.5
        mr, mg, mb = tile[..., 0].mean(), tile[..., 1].mean(), tile[..., 2].mean()
        if cx >= 500 and cx <= 760 and mb > mr + 10:
            rows[3].append(tile)
        elif cx >= 310 and cx < 500 and abs(mr - mg) < 22:
            rows[2].append(tile)
        elif mg > mr + 8 and cx < 320:
            rows[0].append(tile)
        elif cx < 500:
            rows[1].append(tile)

    max_cols = max(max(len(v) for v in rows.values()), 1)
    sheet = np.zeros((T * 4, T * max_cols, 4), dtype=np.uint8)
    for row_idx, tiles in rows.items():
        for col_idx, t in enumerate(tiles):
            sheet[row_idx * T:(row_idx + 1) * T, col_idx * T:(col_idx + 1) * T] = t
        print(f'Baris {row_idx}: {len(tiles)} ubin bersih 16x16')

    Image.fromarray(sheet).save(OUT)
    print(f'Saved packed tilesheet: {OUT} ({sheet.shape[1]}x{sheet.shape[0]})')


if __name__ == '__main__':
    main()
