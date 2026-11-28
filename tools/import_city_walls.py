#!/usr/bin/env python3
"""Potong paket tembok kerajaan modular 3 bagian (horizontal, vertikal, menara sudut)
dan perbarui sp_b_citywall_l.png / sp_b_citywall_r.png agar 100% serasi dengan gerbang kota baru.
"""

from collections import deque
from pathlib import Path
from PIL import Image

SRC_PATH = Path(
    "/Users/herlambang/.gemini/antigravity/brain/4c73037a-1f44-48ba-94d7-b1f1783f10b0/modular_castle_wall_kit_v2_1795823381244.jpg"
)
OUT_DIR = Path("godot/assets/art/buildings")
OUT_COL = (46, 30, 22, 255)


def remove_white_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_white(r: int, g: int, b: int) -> bool:
        return r > 232 and g > 232 and b > 232 and (max(r, g, b) - min(r, g, b)) < 24

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


def split_pieces(im: Image.Image) -> list[Image.Image]:
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

    pieces: list[Image.Image] = []
    for x0, x1 in spans:
        crop = im.crop((x0, 0, x1, h))
        bbox = crop.getbbox()
        if bbox:
            pieces.append(crop.crop(bbox))
    return pieces


def clean_resize(im: Image.Image, tw: int, th: int) -> Image.Image:
    res = im.resize((tw, th), Image.Resampling.LANCZOS)
    px = res.load()
    for y in range(th):
        for x in range(tw):
            r, g, b, a = px[x, y]
            if a < 140:
                px[x, y] = (0, 0, 0, 0)
            elif r < 34 and g < 34 and b < 38:
                px[x, y] = OUT_COL
            else:
                px[x, y] = (r, g, b, 255)
    return res


def tile_horizontal(seg: Image.Image, target_w: int, target_h: int) -> Image.Image:
    sw, sh = seg.size
    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    # Potong 1px outline kiri/kanan saat menyambung agar tidak ada garis sambungan
    inner = seg.crop((1, 0, sw - 1, sh))
    iw = inner.size[0]
    x = 0
    while x < target_w:
        canvas.paste(inner, (x, target_h - sh))
        x += iw
    return canvas


def main() -> None:
    clean = remove_white_bg(Image.open(SRC_PATH))
    pieces = split_pieces(clean)
    assert len(pieces) == 3, f"Expected 3 wall pieces, found {len(pieces)}"

    wall_h = clean_resize(pieces[0], 112, 66)
    wall_v = clean_resize(pieces[1], 44, 140)
    tower = clean_resize(pieces[2], 76, 104)

    wall_h.save(OUT_DIR / "sp_b_citywall_h.png")
    wall_v.save(OUT_DIR / "sp_b_citywall_v.png")
    tower.save(OUT_DIR / "sp_b_citywall_tower.png")

    # Perbarui langsung tembok kiri & kanan Gerbang Kota (488x66 & 486x66)
    wall_l = tile_horizontal(wall_h, 488, 66)
    wall_r = tile_horizontal(wall_h, 486, 66)
    wall_l.save(OUT_DIR / "sp_b_citywall_l.png")
    wall_r.save(OUT_DIR / "sp_b_citywall_r.png")
    print("Saved modular wall kit + updated sp_b_citywall_l/r.png")


if __name__ == "__main__":
    main()
