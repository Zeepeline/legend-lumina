#!/usr/bin/env python3
"""Generator terpadu untuk SELURUH 10 varian pohon Legenda Lumina:
- Gaya seragam: pixel-art detail skala 2x crisp, 6 tingkat warna daun + 5 tingkat warna batang,
  outline luar 1 piksel gelap berwarna tegas, dan sprite sheet animasi 8 frame (akar diam, daun bergoyang).
- Varian tinggi (giant, tall_dark, tall, snow_tall) berbasis siluet pohon referensi pemilik.
- Varian rimbun bulat (big, big_dark, snow, swamp, apple, orange) berbasis siluet tree_big.png
  yang ditingkatkan ke gaya detail 2x + outline + animasi 8 frame yang sama persis.
"""

from collections import deque
import math
from pathlib import Path
from PIL import Image

REF_TALL_PATH = Path(
    "/Users/herlambang/.gemini/antigravity/brain/4c73037a-1f44-48ba-94d7-b1f1783f10b0/.user_uploaded/media_1795784696272_c6a1b292.jpg"
)
REF_BROADLEAF_PATH = Path(
    "/Users/herlambang/.gemini/antigravity/brain/4c73037a-1f44-48ba-94d7-b1f1783f10b0/broadleaf_trees_spritesheet_1795842275335.jpg"
)
OUT_DIR = Path("godot/assets/art/nature")

# Palet daun 6 tingkat per bioma
PAL_DARK_FOREST = [
    (22, 46, 36), (34, 68, 46), (48, 94, 56),
    (68, 122, 64), (96, 150, 74), (132, 178, 88),
]
PAL_SUNNY_GREEN = [
    (30, 62, 40), (46, 92, 48), (66, 126, 56),
    (92, 158, 66), (126, 186, 78), (164, 210, 102),
]
PAL_SNOW = [
    (44, 72, 92), (72, 108, 130), (110, 148, 172),
    (156, 192, 212), (204, 228, 240), (238, 248, 254),
]
PAL_SWAMP = [
    (28, 42, 32), (44, 62, 42), (62, 84, 50),
    (84, 108, 58), (108, 132, 68), (134, 154, 84),
]

BARK_WARM = [
    (48, 28, 20), (74, 44, 30), (102, 62, 40), (130, 82, 52), (156, 102, 66),
]
BARK_COLD = [
    (44, 36, 40), (68, 56, 58), (94, 78, 76), (118, 98, 92), (144, 122, 114),
]
BARK_SWAMP = [
    (36, 32, 24), (56, 48, 34), (78, 66, 46), (100, 84, 58), (122, 104, 72),
]

OUTLINE_DARK = (18, 34, 26)
OUTLINE_SUNNY = (24, 46, 28)
OUTLINE_SNOW = (32, 52, 68)
OUTLINE_SWAMP = (22, 32, 24)
OUTLINE_BARK = (34, 20, 14)


def extract_clean_tree(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    bg_r, bg_g, bg_b, _ = px[4, 4]

    def is_bg(r: int, g: int, b: int) -> bool:
        if abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b) < 54:
            return True
        if r > 224 and g > 224 and b > 224 and (max(r, g, b) - min(r, g, b)) < 24:
            return True
        return False

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

    bbox = im.getbbox()
    if not bbox:
        return im
    im = im.crop(bbox)
    cw, ch = im.size
    cpx = im.load()
    for y in range(int(ch * 0.90), ch):
        for x in range(cw):
            r, g, b, a = cpx[x, y]
            if a > 0 and g >= r - 2:
                cpx[x, y] = (0, 0, 0, 0)
    bbox2 = im.getbbox()
    return im.crop(bbox2) if bbox2 else im


def stylize_tree_grid(
    im: Image.Image,
    gw: int,
    gh: int,
    foliage_pal: list[tuple[int, int, int]],
    bark_pal: list[tuple[int, int, int]],
    outline_leaf: tuple[int, int, int],
    snow_cap: bool = False,
    fruit_color: tuple[int, int, int] | None = None,
) -> Image.Image:
    im = im.convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    iw, ih = im.size
    ratio = min((gw - 6) / iw, (gh - 3) / ih)
    nw = max(1, int(round(iw * ratio)))
    nh = max(1, int(round(ih * ratio)))
    small = im.resize((nw, nh), Image.Resampling.LANCZOS)

    kind = [[0] * gw for _ in range(gh)]
    ox = (gw - nw) // 2
    oy = gh - 1 - nh
    spx = small.load()

    grid = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    gpx = grid.load()

    for y in range(nh):
        gy = oy + y
        yy = y / max(1.0, nh - 1.0)
        shade_boost = 1.0 - 0.34 * math.pow(min(1.0, yy / 0.72), 0.9)
        # Kurva salju kontinu smoothstep (pixel-tree-assets skill)
        snow_k = (0.75 - 0.45 * math.pow(min(1.0, yy / 0.65), 0.85)) if snow_cap else 0.0
        for x in range(nw):
            gx = ox + x
            r, g, b, a = spx[x, y]
            if a < 140:
                continue
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            is_leaf = (yy < 0.64) or (g >= r - 5 and g >= b - 4)
            if is_leaf:
                kind[gy][gx] = 1
                v = max(0.0, min(0.999, lum * 0.86 + shade_boost * 0.24 - 0.08 + snow_k * 0.35))
                idx = int(v * len(foliage_pal))
                gpx[gx, gy] = (*foliage_pal[idx], 255)
            else:
                kind[gy][gx] = 2
                v = max(0.0, min(0.999, lum * 1.48 - yy * 0.10))
                idx = int(v * len(bark_pal))
                gpx[gx, gy] = (*bark_pal[idx], 255)

    # Tambahkan buah (apel merah / jeruk keemasan) di klaster kanopi jika diminta
    if fruit_color is not None:
        hi = (min(255, fruit_color[0] + 65), min(255, fruit_color[1] + 65), min(255, fruit_color[2] + 55))
        spots = [
            (0.32, 0.26), (0.64, 0.24), (0.48, 0.36),
            (0.28, 0.46), (0.70, 0.44), (0.54, 0.52),
        ]
        for sx, sy in spots:
            fx = ox + int(nw * sx)
            fy = oy + int(nh * sy)
            if 1 <= fx < gw - 1 and 1 <= fy < gh - 1 and kind[fy][fx] == 1:
                gpx[fx, fy] = (*fruit_color, 255)
                gpx[fx + 1, fy] = (*fruit_color, 255)
                gpx[fx, fy + 1] = (*fruit_color, 255)
                gpx[fx + 1, fy + 1] = (*fruit_color, 255)
                gpx[fx, fy] = (*hi, 255)

    # Outline luar 1 piksel gelap berwarna tegas
    out_pixels: list[tuple[int, int, tuple[int, int, int]]] = []
    for y in range(gh):
        for x in range(gw):
            if kind[y][x] != 0:
                continue
            adj_leaf = False
            adj_bark = False
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < gw and 0 <= ny < gh:
                    if kind[ny][nx] == 1:
                        adj_leaf = True
                    elif kind[ny][nx] == 2:
                        adj_bark = True
            if adj_leaf:
                out_pixels.append((x, y, outline_leaf))
            elif adj_bark:
                out_pixels.append((x, y, OUTLINE_BARK))
    for x, y, col in out_pixels:
        gpx[x, y] = (*col, 255)

    return grid


def build_pixel_sheet(grid: Image.Image, frames: int = 8, max_sway: float = 1.5, scale: int = 2) -> Image.Image:
    gw, gh = grid.size
    fw, fh = gw * scale, gh * scale
    sheet = Image.new("RGBA", (fw * frames, fh), (0, 0, 0, 0))
    gpx = grid.load()
    canopy_limit = 0.68

    for f in range(frames):
        phase = 2.0 * math.pi * f / frames
        frame_1x = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
        fpx = frame_1x.load()
        for y in range(gh):
            yy = y / max(1.0, gh - 1.0)
            if yy >= canopy_limit:
                dx = 0
            else:
                strength = math.pow((canopy_limit - yy) / canopy_limit, 1.2)
                dx = int(round(math.sin(phase + yy * 2.4) * max_sway * strength))
            for x in range(gw):
                c = gpx[x, y]
                if c[3] == 0:
                    continue
                nx = x + dx
                if 0 <= nx < gw:
                    fpx[nx, y] = c
        sheet.paste(frame_1x.resize((fw, fh), Image.Resampling.NEAREST), (f * fw, 0))
    return sheet


def save_variant(
    name: str,
    src: Image.Image,
    gw: int,
    gh: int,
    foliage_pal: list[tuple[int, int, int]],
    bark_pal: list[tuple[int, int, int]],
    outline_leaf: tuple[int, int, int],
    max_sway: float = 1.4,
    snow_cap: bool = False,
    fruit_color: tuple[int, int, int] | None = None,
) -> None:
    grid = stylize_tree_grid(src, gw, gh, foliage_pal, bark_pal, outline_leaf, snow_cap, fruit_color)
    base_out = grid.resize((gw * 2, gh * 2), Image.Resampling.NEAREST)
    sheet_out = build_pixel_sheet(grid, frames=8, max_sway=max_sway, scale=2)
    base_out.save(OUT_DIR / f"{name}.png")
    sheet_out.save(OUT_DIR / f"{name}_sheet.png")
    print(f"Saved {name}.png {base_out.size} & {name}_sheet.png {sheet_out.size}")


def main() -> None:
    tall_src = extract_clean_tree(Image.open(REF_TALL_PATH))
    bl = Image.open(REF_BROADLEAF_PATH).convert("RGBA")
    bw, bh = bl.size
    oak_src = extract_clean_tree(bl.crop((0, 0, int(bw * 0.26), bh)))
    apple_src = extract_clean_tree(bl.crop((int(bw * 0.26), 0, int(bw * 0.50), bh)))
    orange_src = extract_clean_tree(bl.crop((int(bw * 0.50), 0, int(bw * 0.74), bh)))
    swamp_src = extract_clean_tree(bl.crop((int(bw * 0.74), 0, bw, bh)))

    # 3 varian pinus/tinggi berbasis tree_tall (tree_tall dibiarkan utuh sebagai patokan)
    save_variant("tree_giant", tall_src, 60, 117, PAL_DARK_FOREST, BARK_WARM, OUTLINE_DARK, max_sway=1.7)
    save_variant("tree_tall_dark", tall_src, 36, 69, PAL_DARK_FOREST, BARK_WARM, OUTLINE_DARK, max_sway=1.3)
    save_variant("tree_tall_snow", tall_src, 34, 65, PAL_SNOW, BARK_COLD, OUTLINE_SNOW, max_sway=1.1, snow_cap=True)

    # 6 varian pohon daun lebar (Oak, Apel, Jeruk, Rawa) bergaya pixel-art seragam tree_tall + 8 frame animasi
    save_variant("tree_big", oak_src, 42, 50, PAL_SUNNY_GREEN, BARK_WARM, OUTLINE_SUNNY, max_sway=1.2)
    save_variant("tree_big_dark", oak_src, 42, 50, PAL_DARK_FOREST, BARK_WARM, OUTLINE_DARK, max_sway=1.2)
    save_variant("tree_big_snow", oak_src, 42, 50, PAL_SNOW, BARK_COLD, OUTLINE_SNOW, max_sway=1.1, snow_cap=True)
    save_variant("tree_big_swamp", swamp_src, 44, 52, PAL_SWAMP, BARK_SWAMP, OUTLINE_SWAMP, max_sway=1.1)
    save_variant("tree_apple", apple_src, 42, 50, PAL_SUNNY_GREEN, BARK_WARM, OUTLINE_SUNNY, max_sway=1.2, fruit_color=(214, 48, 48))
    save_variant("tree_orange", orange_src, 42, 50, PAL_SUNNY_GREEN, BARK_WARM, OUTLINE_SUNNY, max_sway=1.2, fruit_color=(238, 138, 32))


if __name__ == "__main__":
    main()
