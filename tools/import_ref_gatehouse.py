#!/usr/bin/env python3
"""Ekstrak gerbang masuk Kota Lumina hasil generate (latar putih + lengkungan terbuka)
ke godot/assets/art/buildings/sp_b_gatehouse.png (198x148) dengan pinggiran bersih & outline #2e1e16.
"""

from collections import deque
from pathlib import Path
from PIL import Image

SRC_PATH = Path(
    "/Users/herlambang/.gemini/antigravity/brain/4c73037a-1f44-48ba-94d7-b1f1783f10b0/medieval_city_gatehouse_sprite_1795823212329.jpg"
)
OUT_PATH = Path("godot/assets/art/buildings/sp_b_gatehouse.png")
OUT_COL = (46, 30, 22, 255)


def remove_white_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_white(r: int, g: int, b: int) -> bool:
        return r > 232 and g > 232 and b > 232 and (max(r, g, b) - min(r, g, b)) < 24

    # Flood-fill dari tepi (otomatis membersihkan luar + lubang gerbang bawah!)
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_white(*px[x, y][:3]):
                visited[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[y][x] and is_white(*px[x, y][:3]):
                visited[y][x] = True
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        px[cx, cy] = (0, 0, 0, 0)
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                if is_white(*px[nx, ny][:3]):
                    visited[ny][nx] = True
                    q.append((nx, ny))

    # Bersihkan juga kotak putih kecil di sela-sela teralis besi portcullis (tengah lengkungan)
    for y in range(int(h * 0.42), int(h * 0.62)):
        for x in range(int(w * 0.38), int(w * 0.62)):
            r, g, b, a = px[x, y]
            if a > 0 and is_white(r, g, b):
                px[x, y] = (0, 0, 0, 0)

    # Bersihkan halo putih 1px di tepi
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            r, g, b, a = px[x, y]
            if a > 0 and r > 210 and g > 210 and b > 210:
                if (
                    px[x - 1, y][3] == 0
                    or px[x + 1, y][3] == 0
                    or px[x, y - 1][3] == 0
                    or px[x, y + 1][3] == 0
                ):
                    px[x, y] = (0, 0, 0, 0)

    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def main() -> None:
    clean = remove_white_bg(Image.open(SRC_PATH))
    fw, fh = 198, 148
    iw, ih = clean.size
    ratio = min((fw - 2) / iw, (fh - 2) / ih)
    nw = max(1, int(round(iw * ratio)))
    nh = max(1, int(round(ih * ratio)))
    resized = clean.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    ox = (fw - nw) // 2
    oy = fh - nh
    rpx = resized.load()
    cpx = canvas.load()
    for y in range(nh):
        for x in range(nw):
            r, g, b, a = rpx[x, y]
            if a < 140:
                continue
            if r < 34 and g < 34 and b < 38:
                cpx[ox + x, oy + y] = OUT_COL
            else:
                cpx[ox + x, oy + y] = (r, g, b, 255)

    canvas.save(OUT_PATH)
    print(f"Saved {OUT_PATH} {canvas.size}")


if __name__ == "__main__":
    main()
