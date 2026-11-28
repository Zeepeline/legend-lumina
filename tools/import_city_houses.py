#!/usr/bin/env python3
"""Potong 5 rumah perkotaan era medieval dari sprite sheet hasil generate,
bersihkan latar belakang putih, dan simpan ke sp_b_cityHouse1..5.png (100x132).
"""

from collections import deque
from pathlib import Path
from PIL import Image

SRC_PATH = Path(
    "/Users/herlambang/.gemini/antigravity/brain/4c73037a-1f44-48ba-94d7-b1f1783f10b0/medieval_city_houses_gen_v3_1795789345497.jpg"
)
OUT_DIR = Path("godot/assets/art/buildings")


def remove_white_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_bg(r: int, g: int, b: int) -> bool:
        return r > 232 and g > 232 and b > 232 and (max(r, g, b) - min(r, g, b)) < 24

    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(*px[x, y][:3]):
                visited[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[y][x] and is_bg(*px[x, y][:3]):
                visited[y][x] = True
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        px[cx, cy] = (0, 0, 0, 0)
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                if is_bg(*px[nx, ny][:3]):
                    visited[ny][nx] = True
                    q.append((nx, ny))

    # Bersihkan pinggiran putih tipis 1px
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
    return im


def split_horizontal_sprites(im: Image.Image) -> list[Image.Image]:
    w, h = im.size
    px = im.load()
    col_has = [any(px[x, y][3] > 0 for y in range(h)) for x in range(w)]
    spans: list[tuple[int, int]] = []
    in_span = False
    start = 0
    for x, has in enumerate(col_has):
        if has and not in_span:
            start = x
            in_span = True
        elif not has and in_span:
            if x - start > 30:
                spans.append((start, x))
            in_span = False
    if in_span and w - start > 30:
        spans.append((start, w))

    sprites: list[Image.Image] = []
    for x0, x1 in spans:
        crop = im.crop((x0, 0, x1, h))
        bbox = crop.getbbox()
        if bbox:
            sprites.append(crop.crop(bbox))
    return sprites


def fit_city_house(im: Image.Image, fw: int = 100, fh: int = 132) -> Image.Image:
    iw, ih = im.size
    ratio = min((fw - 4) / iw, (fh - 4) / ih)
    nw = max(1, int(round(iw * ratio)))
    nh = max(1, int(round(ih * ratio)))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    rpx = resized.load()
    for y in range(nh):
        for x in range(nw):
            r, g, b, a = rpx[x, y]
            if a < 140:
                rpx[x, y] = (0, 0, 0, 0)
            elif r < 34 and g < 34 and b < 38:
                rpx[x, y] = (46, 30, 22, 255)
            else:
                rpx[x, y] = (r, g, b, 255)
    canvas = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    canvas.paste(resized, ((fw - nw) // 2, fh - nh))
    return canvas


def main() -> None:
    clean = remove_white_bg(Image.open(SRC_PATH))
    houses = split_horizontal_sprites(clean)
    assert len(houses) == 5, f"Expected 5 houses, found {len(houses)}"
    for idx, h_im in enumerate(houses, start=1):
        out = fit_city_house(h_im, 100, 132)
        dst = OUT_DIR / f"sp_b_cityHouse{idx}.png"
        out.save(dst)
        print(f"Saved {dst} {out.size}")


if __name__ == "__main__":
    main()
