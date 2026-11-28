#!/usr/bin/env python3
"""Remake gerbang masuk Kota Lumina (sp_b_gatehouse.png) pada resolusi penuh 198x148 (HD pixel-art 1x)
dengan detail batu berbevel, genteng biru-sabak bertumpuk, kayu cedar bertekstur, panji berlipat,
dan lentera bercahaya agar 100% setara ketajamannya dengan 5 rumah kota baru.
"""

import math
from pathlib import Path
from PIL import Image

OUT_PATH = Path("godot/assets/art/buildings/sp_b_gatehouse.png")

OUT = (44, 28, 20, 255)
STONE_DD = (80, 75, 68, 255)
STONE_D = (108, 102, 92, 255)
STONE_M = (138, 132, 118, 255)
STONE_L = (168, 162, 146, 255)
STONE_H = (196, 190, 174, 255)
MOSS = (88, 116, 72, 255)

ROOF_DD = (30, 44, 68, 255)
ROOF_D = (48, 68, 98, 255)
ROOF_M = (72, 100, 138, 255)
ROOF_L = (102, 134, 172, 255)
ROOF_H = (136, 166, 202, 255)

WOOD_DD = (68, 40, 24, 255)
WOOD_D = (102, 62, 36, 255)
WOOD_M = (144, 90, 52, 255)
WOOD_L = (182, 122, 74, 255)

BANNER_DD = (88, 20, 24, 255)
BANNER_D = (124, 30, 34, 255)
BANNER_M = (168, 42, 46, 255)
BANNER_L = (198, 62, 62, 255)
GOLD_D = (176, 130, 40, 255)
GOLD_M = (224, 178, 66, 255)
GOLD_L = (254, 232, 138, 255)

IRON_D = (40, 42, 50, 255)
IRON_M = (70, 74, 86, 255)
IRON_L = (106, 112, 126, 255)


def draw_hd_stone(px, x0: int, y0: int, x1: int, y1: int, brick_w: int = 12, brick_h: int = 7) -> None:
    for y in range(y0, y1):
        ry = (y - y0) % brick_h
        row = (y - y0) // brick_h
        for x in range(x0, x1):
            rx = (x - x0 + (row % 2) * (brick_w // 2)) % brick_w
            bx = (x - x0 + (row % 2) * (brick_w // 2)) // brick_w
            seed = (bx * 37 + row * 73) % 11
            if ry == 0 or rx == 0:
                px[x, y] = STONE_DD
            elif ry == 1 or rx == 1:
                px[x, y] = STONE_H if seed < 4 else STONE_L
            elif ry == brick_h - 1 or rx == brick_w - 1:
                px[x, y] = STONE_D
            else:
                # Shading silinder/sisi kanan lebih gelap
                if x >= x1 - 4:
                    px[x, y] = STONE_D
                elif x <= x0 + 3:
                    px[x, y] = STONE_L
                elif seed == 0 and ry > 3 and y > y1 - 24:
                    px[x, y] = MOSS
                elif seed in (1, 2):
                    px[x, y] = STONE_L
                elif seed in (9, 10):
                    px[x, y] = STONE_D
                else:
                    px[x, y] = STONE_M


def draw_hd_roof(px, cx: int, top_y: int, bot_y: int, half_w: int) -> None:
    height = bot_y - top_y
    for y in range(top_y, bot_y + 1):
        t = (y - top_y) / max(1.0, float(height))
        # Sedikit melengkung elegan (concave medieval spire)
        hw = max(2, int(round(2 + (t ** 1.12) * (half_w - 2))))
        sy = (y - top_y) % 5
        srow = (y - top_y) // 5
        for x in range(cx - hw, cx + hw + 1):
            if x == cx - hw or x == cx + hw or y == top_y or y == bot_y:
                px[x, y] = OUT
                continue
            sx = (x - (cx - hw) + (srow % 2) * 3) % 6
            rel = (x - cx) / max(1.0, float(hw))
            if sy == 4 or sx == 0:
                px[x, y] = ROOF_DD if rel > 0.1 else ROOF_D
            elif sy == 0:
                px[x, y] = ROOF_H if rel < -0.15 else (ROOF_L if rel < 0.35 else ROOF_M)
            else:
                if rel < -0.25:
                    px[x, y] = ROOF_L
                elif rel < 0.22:
                    px[x, y] = ROOF_M
                else:
                    px[x, y] = ROOF_D
    # Puncak tombak emas
    for y in range(max(1, top_y - 7), top_y):
        px[cx, y] = GOLD_L if y < top_y - 4 else GOLD_M
        if y == top_y - 4:
            px[cx - 1, y] = GOLD_M
            px[cx + 1, y] = GOLD_D
        px[cx - 1, y] = OUT if px[cx - 1, y][3] == 0 else px[cx - 1, y]
        px[cx + 1, y] = OUT if px[cx + 1, y][3] == 0 else px[cx + 1, y]


def draw_hd_banner(px, cx: int, y0: int, w: int, h: int) -> None:
    hw = w // 2
    # Palang kayu + ujung emas
    for x in range(cx - hw - 2, cx + hw + 3):
        px[x, y0 - 2] = WOOD_L
        px[x, y0 - 1] = WOOD_D
    px[cx - hw - 2, y0 - 2] = GOLD_L
    px[cx + hw + 2, y0 - 2] = GOLD_M

    for y in range(y0, y0 + h):
        dy = y - y0
        cur_hw = hw if dy < h - 6 else max(0, int(round(hw * (1.0 - (dy - (h - 6)) / 6.0))))
        for x in range(cx - cur_hw, cx + cur_hw + 1):
            if x == cx - cur_hw or x == cx + cur_hw or dy == 0:
                px[x, y] = OUT
            elif x == cx - cur_hw + 1 or x == cx + cur_hw - 1:
                px[x, y] = GOLD_M if x < cx else GOLD_D
            else:
                # Lipatan kain halus
                if x < cx - 2:
                    px[x, y] = BANNER_L if (x % 3 == 0) else BANNER_M
                elif x > cx + 2:
                    px[x, y] = BANNER_DD if (x % 3 == 0) else BANNER_D
                else:
                    px[x, y] = BANNER_M
    # Lambang bintang/fleur emas di tengah
    cy = y0 + h // 2 - 2
    for dy in range(-4, 5):
        px[cx, cy + dy] = GOLD_L if dy < 0 else GOLD_M
    for dx in range(-3, 4):
        px[cx + dx, cy] = GOLD_L if dx <= 0 else GOLD_M
    for dx, dy in ((-2, -2), (2, -2), (-2, 2), (2, 2)):
        px[cx + dx, cy + dy] = GOLD_D


def draw_hd_lantern(px, x: int, y: int) -> None:
    # Braket besi
    for dx in (-2, -1, 0, 1, 2):
        px[x + dx, y - 4] = IRON_D
    px[x, y - 3] = IRON_L
    # Kaca lentera menyala
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            if abs(dx) == 2 or abs(dy) == 2:
                px[x + dx, y + dy] = IRON_D
            elif dx == 0 and dy == 0:
                px[x + dx, y + dy] = (255, 252, 224, 255)
            else:
                px[x + dx, y + dy] = (255, 214, 108, 255)
    px[x, y + 3] = IRON_D


def main() -> None:
    w, h = 198, 148
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = im.load()

    # 1. Tembok sayap kiri & kanan
    draw_hd_stone(px, 2, 76, 28, 144)
    draw_hd_stone(px, 170, 76, 196, 144)
    for mx in (4, 14, 172, 182):
        draw_hd_stone(px, mx, 68, mx + 8, 77, 8, 5)

    # 2. Dinding jembatan tengah gerbang
    draw_hd_stone(px, 56, 56, 142, 144)
    for mx in range(60, 134, 13):
        draw_hd_stone(px, mx, 47, mx + 9, 57, 9, 5)
    # Balok kayu cedar bertekstur
    for x in range(58, 140):
        px[x, 63] = OUT
        px[x, 64] = WOOD_L
        px[x, 65] = WOOD_M
        px[x, 66] = WOOD_M if x % 5 != 0 else WOOD_D
        px[x, 67] = WOOD_D
        px[x, 68] = WOOD_DD

    # 3. Menara kembar kiri & kanan
    for tx0, tx1 in ((26, 62), (136, 172)):
        draw_hd_stone(px, tx0, 52, tx1, 146)
        draw_hd_stone(px, tx0 - 2, 132, tx1 + 2, 146, 10, 7)
        # Pelindung kayu (machicolation) di bawah atap
        for x in range(tx0 - 3, tx1 + 3):
            px[x, 48] = WOOD_L
            px[x, 49] = WOOD_M
            px[x, 50] = WOOD_D
            px[x, 51] = WOOD_DD
            if x % 6 == 0:
                for dy in range(52, 56):
                    px[x, dy] = WOOD_D
                    px[x + 1, dy] = WOOD_DD
        tcx = (tx0 + tx1) // 2
        # Jendela celah panah berbingkai batu
        for y in range(62, 75):
            for x in range(tcx - 3, tcx + 4):
                if abs(x - tcx) <= 1 and y >= 64 and y <= 73:
                    px[x, y] = OUT
                elif y == 62 or y == 74 or abs(x - tcx) == 3:
                    px[x, y] = STONE_DD
                else:
                    px[x, y] = STONE_H
        draw_hd_roof(px, tcx, 10, 48, 22)
        draw_hd_banner(px, tcx, 84, 16, 28)

    # 4. Lubang gerbang melengkung terbuka (transparan agar bisa dilewati)
    arch_cx = 99
    arch_r = 28
    arch_top_y = 106
    for y in range(arch_top_y - arch_r, 148):
        for x in range(arch_cx - arch_r, arch_cx + arch_r + 1):
            inside = abs(x - arch_cx) < arch_r if y >= arch_top_y else ((x - arch_cx) ** 2 + (y - arch_top_y) ** 2) < (arch_r ** 2)
            if inside:
                px[x, y] = (0, 0, 0, 0)

    # Batu voussoir lengkungan + batu kunci (keystone)
    for y in range(arch_top_y - arch_r - 7, 146):
        for x in range(arch_cx - arch_r - 7, arch_cx + arch_r + 8):
            if px[x, y][3] == 0:
                continue
            dx = x - arch_cx
            dy = min(0, y - arch_top_y)
            d = math.hypot(dx, dy)
            if arch_r <= d <= arch_r + 6.0:
                ang = math.atan2(dy, dx)
                seg = int(round(ang * 5.0))
                if d <= arch_r + 1.2 or d >= arch_r + 5.0:
                    px[x, y] = OUT
                elif abs(dx) <= 3 and y < arch_top_y - arch_r + 2:
                    px[x, y] = STONE_H
                else:
                    px[x, y] = STONE_L if seg % 2 == 0 else STONE_M

    # Teralis besi terangkat (portcullis) di puncak lengkungan
    for x in range(arch_cx - arch_r + 4, arch_cx + arch_r - 3, 6):
        for y in range(arch_top_y - arch_r + 3, arch_top_y - 4):
            if (x - arch_cx) ** 2 + (y - arch_top_y) ** 2 < (arch_r - 1) ** 2:
                px[x, y] = IRON_D
                px[x + 1, y] = IRON_L if y % 3 == 0 else IRON_M
    for bar_y in (arch_top_y - 16, arch_top_y - 8):
        for x in range(arch_cx - arch_r + 3, arch_cx + arch_r - 2):
            if (x - arch_cx) ** 2 + (bar_y - arch_top_y) ** 2 < (arch_r - 1) ** 2:
                px[x, bar_y] = IRON_L
                px[x, bar_y + 1] = IRON_D

    # Panji utama di atas lengkungan & 2 lentera dinding
    draw_hd_banner(px, arch_cx, 54, 18, 22)
    draw_hd_lantern(px, arch_cx - arch_r - 9, 108)
    draw_hd_lantern(px, arch_cx + arch_r + 9, 108)

    # Outline luar 1 piksel tegas (#2c1c14)
    to_out: list[tuple[int, int]] = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] != 0:
                continue
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] > 0 and px[nx, ny] != OUT:
                    to_out.append((x, y))
                    break
    for x, y in to_out:
        px[x, y] = OUT

    im.save(OUT_PATH)
    print(f"Saved HD {OUT_PATH} {im.size}")


if __name__ == "__main__":
    main()
