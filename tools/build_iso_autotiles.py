import math
import os
from PIL import Image

TILE_GRASS = 'assets/img/iso/tiles/'
TILE_STONE = 'assets/img/iso/tiles_stone/'
TILE_DIRT = 'assets/img/iso/tiles_dirt/'
INGAME_DIR = 'assets/img/iso/ingame_32x16/'
SHEET_PATH = 'assets/img/iso/iso_tileset_32x16.png'

W_HI, H_HI = 242, 122
CX_HI, CY_HI = 121.0, 61.0
W0 = 0.25
CORNER_R = 0.39


def in_dia_32x16(px, py):
    return abs(px + 0.5 - 16.0) / 16.0 + abs(py + 0.5 - 8.0) / 8.0 <= 1.0


def edge_w(t):
    # Periodic at t=0 and t=1 -> edge_w(0) == edge_w(1) == W0 for seamless tile-to-tile borders
    return (
        W0
        + 0.035 * math.sin(2.0 * math.pi * t)
        + 0.020 * math.sin(4.0 * math.pi * t)
        + 0.015 * math.sin(6.0 * math.pi * t)
    )


def make_opaque_rgb(img):
    """Fill exterior of 242x122 diamond by radially projecting onto d=0.94 so LANCZOS never bleeds black."""
    src = img.convert('RGBA')
    sp = src.load()
    out = Image.new('RGB', (W_HI, H_HI))
    op = out.load()
    for y in range(H_HI):
        for x in range(W_HI):
            dx = (x + 0.5 - CX_HI) / 120.0
            dy = (y + 0.5 - CY_HI) / 60.0
            d = abs(dx) + abs(dy)
            if d <= 0.96 and sp[x, y][3] >= 200:
                r, g, b, _ = sp[x, y]
                op[x, y] = (r, g, b)
            else:
                scale = 0.94 / (d if d > 1e-6 else 1.0)
                sx = max(0, min(W_HI - 1, int(CX_HI + (x + 0.5 - CX_HI) * scale)))
                sy = max(0, min(H_HI - 1, int(CY_HI + (y + 0.5 - CY_HI) * scale)))
                r, g, b, _ = sp[sx, sy]
                op[x, y] = (r, g, b)
    return out


def to_ingame_32x16(rgb_img):
    small = rgb_img.resize((32, 16), Image.Resampling.LANCZOS).convert('RGBA')
    pix = small.load()
    for py in range(16):
        for px in range(32):
            if in_dia_32x16(px, py):
                r, g, b, _ = pix[px, py]
                pix[px, py] = (r, g, b, 255)
            else:
                pix[px, py] = (0, 0, 0, 0)
    return small


# Precompute clamped isometric (u, v) grid for 242x122
UV_GRID = []
for _y in range(H_HI):
    _row = []
    _dy = (_y + 0.5 - CY_HI) / 60.0
    for _x in range(W_HI):
        _dx = (_x + 0.5 - CX_HI) / 120.0
        _u = max(0.0, min(1.0, (1.0 + _dx + _dy) * 0.5))
        _v = max(0.0, min(1.0, (1.0 - _dx + _dy) * 0.5))
        _row.append((_u, _v))
    UV_GRID.append(_row)


def build_road_mask_tile(road_rgb, grass_rgb, mask):
    rp = road_rgb.load()
    gp = grass_rgb.load()
    out = Image.new('RGB', (W_HI, H_HI))
    op = out.load()
    has_ne = bool(mask & 1)
    has_se = bool(mask & 2)
    has_sw = bool(mask & 4)
    has_nw = bool(mask & 8)
    fil_n = has_ne and has_nw
    fil_e = has_ne and has_se
    fil_s = has_se and has_sw
    fil_w = has_sw and has_nw

    for y in range(H_HI):
        uv_row = UV_GRID[y]
        for x in range(W_HI):
            u, v = uv_row[x]
            g = -1e9
            if has_ne:
                val = edge_w(u) - v
                if val > g:
                    g = val
            if has_se:
                val = edge_w(v) - (1.0 - u)
                if val > g:
                    g = val
            if has_sw:
                val = edge_w(u) - (1.0 - v)
                if val > g:
                    g = val
            if has_nw:
                val = edge_w(v) - u
                if val > g:
                    g = val
            if fil_n:
                val = CORNER_R - math.hypot(u, v)
                if val > g:
                    g = val
            if fil_e:
                val = CORNER_R - math.hypot(1.0 - u, v)
                if val > g:
                    g = val
            if fil_s:
                val = CORNER_R - math.hypot(1.0 - u, 1.0 - v)
                if val > g:
                    g = val
            if fil_w:
                val = CORNER_R - math.hypot(u, 1.0 - v)
                if val > g:
                    g = val

            if g >= 0.0:
                r, gr, b = gp[x, y]
                if g < 0.045:
                    r = int(r * 0.80)
                    gr = int(gr * 0.80)
                    b = int(b * 0.80)
                op[x, y] = (r, gr, b)
            else:
                r, gr, b = rp[x, y]
                if g > -0.055:
                    r = int(r * 0.78)
                    gr = int(gr * 0.78)
                    b = int(b * 0.78)
                op[x, y] = (r, gr, b)
    return to_ingame_32x16(out)


def build_inner_corner_tile(grass_rgb, corner_idx):
    """corner_idx: 0=N (u=0,v=0), 1=E (u=1,v=0), 2=S (u=1,v=1), 3=W (u=0,v=1)."""
    gp = grass_rgb.load()
    rgb = Image.new('RGB', (W_HI, H_HI))
    rp = rgb.load()
    msk = Image.new('L', (W_HI, H_HI), 0)
    mp = msk.load()

    for y in range(H_HI):
        uv_row = UV_GRID[y]
        for x in range(W_HI):
            u, v = uv_row[x]
            if corner_idx == 0:
                du, dv = u, v
            elif corner_idx == 1:
                du, dv = 1.0 - u, v
            elif corner_idx == 2:
                du, dv = 1.0 - u, 1.0 - v
            else:
                du, dv = u, 1.0 - v
            r_dist = math.hypot(du, dv)
            theta = math.atan2(dv, du)
            rad = W0 + 0.015 * math.sin(2.0 * theta)
            g = rad - r_dist
            r, gr, b = gp[x, y]
            if g < 0.055:
                r = int(r * 0.80)
                gr = int(gr * 0.80)
                b = int(b * 0.80)
            rp[x, y] = (r, gr, b)
            if g >= 0.0:
                mp[x, y] = 255

    small_rgb = rgb.resize((32, 16), Image.Resampling.LANCZOS)
    small_msk = msk.resize((32, 16), Image.Resampling.LANCZOS)
    sp = small_rgb.load()
    sm = small_msk.load()
    out = Image.new('RGBA', (32, 16), (0, 0, 0, 0))
    op = out.load()
    for py in range(16):
        for px in range(32):
            if in_dia_32x16(px, py) and sm[px, py] >= 115:
                r, gr, b = sp[px, py]
                op[px, py] = (r, gr, b, 255)
    return out


def build_all():
    os.makedirs(INGAME_DIR, exist_ok=True)
    grass_hi = [make_opaque_rgb(Image.open(f'{TILE_GRASS}grass_{i:02d}.png')) for i in range(16)]
    stone_hi = [make_opaque_rgb(Image.open(f'{TILE_STONE}stone_{i:02d}.png')) for i in range(4)]
    dirt_hi = [make_opaque_rgb(Image.open(f'{TILE_DIRT}dirt_{i:02d}.png')) for i in range(4)]

    # 4 cols x 15 rows = 128 x 240 px
    sheet = Image.new('RGBA', (128, 240), (0, 0, 0, 0))

    # Rows 0-3: 16 grass tiles (crisp seam-free inDia)
    for i in range(16):
        t = to_ingame_32x16(grass_hi[i])
        t.save(f'{INGAME_DIR}tile_grass_{i:02d}.png')
        sheet.paste(t, ((i % 4) * 32, (i // 4) * 16))

    # Rows 4-7: 16 directional stone auto-tiles (mask 0..15)
    for m in range(16):
        t = build_road_mask_tile(stone_hi[m % 4], grass_hi[m % 4], m)
        t.save(f'{INGAME_DIR}tile_stone_{m:02d}.png')
        sheet.paste(t, ((m % 4) * 32, (4 + m // 4) * 16))

    # Rows 8-11: 16 directional dirt auto-tiles (mask 0..15)
    for m in range(16):
        t = build_road_mask_tile(dirt_hi[m % 4], grass_hi[m % 4], m)
        t.save(f'{INGAME_DIR}tile_dirt_{m:02d}.png')
        sheet.paste(t, ((m % 4) * 32, (8 + m // 4) * 16))

    # Row 12: 4 solid stone center variations
    for i in range(4):
        t = to_ingame_32x16(stone_hi[i])
        t.save(f'{INGAME_DIR}tile_stone_solid_{i:02d}.png')
        sheet.paste(t, (i * 32, 12 * 16))

    # Row 13: 4 solid dirt center variations
    for i in range(4):
        t = to_ingame_32x16(dirt_hi[i])
        t.save(f'{INGAME_DIR}tile_dirt_solid_{i:02d}.png')
        sheet.paste(t, (i * 32, 13 * 16))

    # Row 14: 4 inner-corner grass overlays (0=N, 1=E, 2=S, 3=W)
    for i in range(4):
        t = build_inner_corner_tile(grass_hi[i], i)
        t.save(f'{INGAME_DIR}tile_corner_{i:02d}.png')
        sheet.paste(t, (i * 32, 14 * 16))

    sheet.save(SHEET_PATH)
    print(f'Saved {SHEET_PATH} ({sheet.size[0]}x{sheet.size[1]}, 4 cols x 15 rows directional auto-tiles)')


if __name__ == '__main__':
    build_all()
