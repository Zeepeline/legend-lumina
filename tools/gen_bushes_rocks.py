"""Generate aset pixel art semak (bushes) dan batu (rocks) bergaya kohesif dengan pohon Legenda Lumina.
Semua sprite memakai outline gelap lembut, shading 3-4 tingkat, dan bayangan kontak tipis di bawahnya.
Output: godot/assets/art/nature/{bush_green,bush_berry,bush_swamp,bush_snow,rock_big,rock_small,rock_moss,rock_snow,rock_river}.png
"""
import os
import numpy as np
from PIL import Image

OUT_DIR = "godot/assets/art/nature"


def add_outline_and_shadow(canvas: np.ndarray, outline_rgb: tuple[int, int, int]) -> np.ndarray:
    """Tambahkan outline 1px di sekeliling piksel solid dan bayangan kontak tipis di bawah."""
    h, w, _ = canvas.shape
    out = canvas.copy()
    alpha = canvas[..., 3] > 0

    # Outline 4-arah
    for y in range(h):
        for x in range(w):
            if alpha[y, x]:
                continue
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and alpha[ny, nx]:
                    out[y, x] = [outline_rgb[0], outline_rgb[1], outline_rgb[2], 255]
                    break

    # Bayangan kontak tipis 1px di baris paling bawah objek
    solid = out[..., 3] > 0
    for x in range(w):
        ys = np.where(solid[:, x])[0]
        if len(ys) > 0:
            by = int(ys[-1])
            if by + 1 < h and out[by + 1, x, 3] == 0:
                out[by + 1, x] = [20, 28, 18, 90]
    return out


def make_bush(pal: dict[str, tuple[int, int, int]], berries: bool = False, snow_cap: bool = False, seed: int = 1) -> Image.Image:
    """Buat sprite semak 20x16 px 3-lobe rimbun."""
    w, h = 20, 16
    rng = np.random.default_rng(seed)
    c = np.zeros((h, w, 4), dtype=np.uint8)

    # 3 lobe bulat yang saling menyatu (kiri, tengah-atas, kanan)
    lobes = [
        (6.0, 9.2, 4.6, 3.8),
        (10.0, 6.8, 5.2, 4.3),
        (13.8, 9.4, 4.4, 3.6),
    ]
    for y in range(1, h - 2):
        for x in range(1, w - 1):
            best_d = 99.0
            for cx, cy, rx, ry in lobes:
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d < best_d:
                    best_d = d
            jitter = float(rng.uniform(-0.10, 0.10))
            if best_d + jitter <= 1.0:
                # Shading berdasarkan tinggi y & jarak dari puncak cahaya (kiri-atas)
                if snow_cap and y <= 6 and best_d < 0.85:
                    col = pal["snow_hi"] if y <= 4 else pal["snow_sh"]
                elif y <= 5 or (y <= 7 and x <= 11 and best_d < 0.55):
                    col = pal["hi"]
                elif y >= 11:
                    col = pal["dark"]
                elif y >= 9:
                    col = pal["sh"]
                else:
                    col = pal["mid"]
                c[y, x] = [col[0], col[1], col[2], 255]

    # Tambah tekstur daun kecil (beberapa piksel highlight & shadow di tengah)
    for _ in range(10):
        px = int(rng.integers(4, w - 4))
        py = int(rng.integers(4, 11))
        if c[py, px, 3] > 0:
            col = pal["hi"] if py < 8 else pal["sh"]
            c[py, px] = [col[0], col[1], col[2], 255]

    if berries:
        for bx, by in [(6, 8), (9, 6), (12, 9), (14, 7), (8, 10)]:
            if c[by, bx, 3] > 0:
                c[by, bx] = [224, 58, 58, 255]
                if by - 1 >= 0 and c[by - 1, bx, 3] > 0:
                    c[by - 1, bx] = [252, 132, 118, 255]

    out = add_outline_and_shadow(c, pal["out"])
    return Image.fromarray(out)


def make_rock(w: int, h: int, pal: dict[str, tuple[int, int, int]], moss: bool = False, snow_cap: bool = False, round_river: bool = False, seed: int = 10) -> Image.Image:
    """Buat sprite batu organik dengan facet shading 3-4 tingkat."""
    rng = np.random.default_rng(seed)
    c = np.zeros((h, w, 4), dtype=np.uint8)
    cx, cy = w * 0.5, h * 0.56
    rx, ry = w * 0.39, h * 0.36

    for y in range(1, h - 2):
        for x in range(1, w - 1):
            dx = (x - cx) / rx
            dy = (y - cy) / ry
            # Sedikit pipih di bawah agar terasa menapak tanah
            if dy > 0:
                dy *= 1.25
            d = dx * dx + dy * dy
            if not round_river:
                # Sedikit bersudut seperti batu alam
                d += 0.12 * np.sin(x * 0.9 + seed) * np.cos(y * 0.8)
            if d <= 1.0:
                if snow_cap and y <= int(h * 0.42):
                    col = pal["snow_hi"] if y <= int(h * 0.30) else pal["snow_sh"]
                elif y <= int(h * 0.36) and x < int(w * 0.65):
                    col = pal["hi"]
                elif y >= int(h * 0.72):
                    col = pal["dark"]
                elif x >= int(w * 0.68) or y >= int(h * 0.58):
                    col = pal["sh"]
                else:
                    col = pal["mid"]
                c[y, x] = [col[0], col[1], col[2], 255]

    # Tambah retakan halus 1px di batu besar
    if w >= 20:
        for rx_i, ry_i in [(int(w * 0.42), int(h * 0.48)), (int(w * 0.46), int(h * 0.54)), (int(w * 0.52), int(h * 0.58))]:
            if c[ry_i, rx_i, 3] > 0:
                c[ry_i, rx_i] = [pal["dark"][0], pal["dark"][1], pal["dark"][2], 255]

    if moss:
        moss_hi = (118, 166, 68)
        moss_sh = (78, 122, 48)
        for y in range(int(h * 0.52), h - 2):
            for x in range(2, w - 2):
                if c[y, x, 3] > 0 and rng.random() < 0.45:
                    mc = moss_hi if y < int(h * 0.68) else moss_sh
                    c[y, x] = [mc[0], mc[1], mc[2], 255]

    out = add_outline_and_shadow(c, pal["out"])
    return Image.fromarray(out)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    pal_green = {
        "hi": (122, 184, 72),
        "mid": (82, 146, 56),
        "sh": (54, 108, 44),
        "dark": (38, 78, 36),
        "out": (26, 48, 24),
        "snow_hi": (236, 246, 252),
        "snow_sh": (196, 218, 232),
    }
    pal_swamp = {
        "hi": (106, 140, 66),
        "mid": (74, 106, 52),
        "sh": (50, 76, 40),
        "dark": (34, 54, 30),
        "out": (22, 36, 20),
    }
    pal_rock = {
        "hi": (178, 182, 180),
        "mid": (142, 148, 148),
        "sh": (106, 112, 116),
        "dark": (76, 82, 88),
        "out": (42, 46, 52),
        "snow_hi": (236, 246, 252),
        "snow_sh": (196, 218, 232),
    }
    pal_river = {
        "hi": (166, 178, 182),
        "mid": (128, 142, 148),
        "sh": (94, 108, 116),
        "dark": (68, 80, 88),
        "out": (38, 46, 54),
    }

    assets = {
        "bush_green.png": make_bush(pal_green, berries=False, snow_cap=False, seed=11),
        "bush_berry.png": make_bush(pal_green, berries=True, snow_cap=False, seed=22),
        "bush_swamp.png": make_bush(pal_swamp, berries=False, snow_cap=False, seed=33),
        "bush_snow.png": make_bush(pal_green, berries=False, snow_cap=True, seed=44),
        "rock_big.png": make_rock(22, 18, pal_rock, moss=False, snow_cap=False, seed=55),
        "rock_small.png": make_rock(14, 11, pal_rock, moss=False, snow_cap=False, seed=66),
        "rock_moss.png": make_rock(22, 18, pal_rock, moss=True, snow_cap=False, seed=77),
        "rock_snow.png": make_rock(22, 18, pal_rock, moss=False, snow_cap=True, seed=88),
        "rock_river.png": make_rock(16, 12, pal_river, moss=False, snow_cap=False, round_river=True, seed=99),
    }

    for name, img in assets.items():
        path = os.path.join(OUT_DIR, name)
        img.save(path)
    print(f"Generated {len(assets)} bush & rock sprites in {OUT_DIR}")


if __name__ == "__main__":
    main()
