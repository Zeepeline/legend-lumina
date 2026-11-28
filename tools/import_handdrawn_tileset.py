"""Potong ubin 16x16 dari tileset hand-drawn pemilik (Rumput, Tanah, Pasir, Air, Batu Paving,
dan pinggiran rumput bergerigi) ke godot/assets/art/ground/lumina_tileset.png
dengan tetap mempertahankan koordinat 16x5 agar seluruh 14 peta langsung ter-update otomatis.
"""
import numpy as np
from PIL import Image

SRC = '/Users/herlambang/.gemini/antigravity/brain/4c73037a-1f44-48ba-94d7-b1f1783f10b0/.user_uploaded/media_1795839440507_7f83e4b8.jpg'
OUT = 'godot/assets/art/ground/lumina_tileset.png'
T = 16


def sample_4_tiles(im, box):
    """Ambil area interior (x0,y0,x1,y1), resize ke 32x32 (2x2 ubin 16x16) -> 4 varian ubin."""
    crop = im.crop(box).resize((T * 2, T * 2), Image.Resampling.LANCZOS)
    a = np.array(crop)
    return [
        a[0:T, 0:T],
        a[0:T, T:T * 2],
        a[T:T * 2, 0:T],
        a[T:T * 2, T:T * 2],
    ]


def make_seamless_4_tiles(im, box, rng, amp=4, horiz_ripple=False):
    """Ambil palet warna rata-rata dari blok hand-drawn, lalu buat 4 ubin 16x16 mulus
    tanpa bunga dan tanpa garis diagonal berulang."""
    crop = np.array(im.crop(box))
    base = crop[..., :3].mean(axis=(0, 1))
    out = []
    for _ in range(4):
        tile = np.full((T, T, 4), [base[0], base[1], base[2], 255], dtype=float)
        n = rng.integers(-amp, amp + 1, size=(T, T, 1))
        tile[..., :3] = np.clip(tile[..., :3] + n, 0, 255)
        if horiz_ripple:
            for _r in range(3):
                y = int(rng.integers(1, T - 1))
                x = int(rng.integers(1, T - 3))
                hi = np.clip(base * 1.12, 0, 255)
                tile[y, x:x + 2, :3] = hi
        out.append(tile.astype(np.uint8))
    return out


def make_medieval_cobble_4_tiles(rng):
    """4 ubin paving batu kota abad pertengahan 16x16 hangat, membulat halus, tanpa outline hitam keras."""
    grout = np.array([124, 115, 104, 255], dtype=np.uint8)
    pal = [
        np.array([168, 160, 148], dtype=float),
        np.array([178, 170, 156], dtype=float),
        np.array([156, 149, 138], dtype=float),
        np.array([172, 164, 150], dtype=float),
    ]
    layouts = [
        [(1, 1, 6, 6), (8, 1, 7, 6), (1, 8, 8, 7), (10, 8, 5, 7)],
        [(1, 1, 8, 6), (10, 1, 5, 6), (1, 8, 6, 7), (8, 8, 7, 7)],
        [(1, 1, 7, 7), (9, 1, 6, 6), (1, 9, 6, 6), (8, 8, 7, 7)],
        [(1, 1, 6, 7), (8, 1, 7, 7), (1, 9, 8, 6), (10, 9, 5, 6)],
    ]
    tiles = []
    for idx, stones in enumerate(layouts):
        tile = np.full((T, T, 4), grout, dtype=np.uint8)
        for s_i, (sx, sy, sw, sh) in enumerate(stones):
            base = pal[(idx + s_i) % len(pal)]
            hi = np.clip(base * 1.09, 0, 255).astype(np.uint8)
            sh_c = np.clip(base * 0.90, 0, 255).astype(np.uint8)
            for dy in range(sh):
                for dx in range(sw):
                    # Bulatkan 4 sudut batu agar terasa organik
                    if (dx == 0 or dx == sw - 1) and (dy == 0 or dy == sh - 1):
                        continue
                    px = base + rng.integers(-3, 4)
                    if dy == 0:
                        col = hi
                    elif dy == sh - 1:
                        col = sh_c
                    else:
                        col = np.clip(px, 0, 255).astype(np.uint8)
                    tile[sy + dy, sx + dx, :3] = col
                    tile[sy + dy, sx + dx, 3] = 255
        tiles.append(tile)
    return tiles


def main():
    src = Image.open(SRC).convert('RGBA')
    W, H = src.size
    rng = np.random.default_rng(777)
    # Baca lumina_tileset.png yang sudah ada dan perluas ke 256x144 (9 baris) untuk Baris 7-8 GroundDeco transparan
    old_sheet = np.array(Image.open(OUT).convert('RGBA'))
    sheet = np.zeros((T * 9, T * 16, 4), dtype=np.uint8)
    sheet[:min(old_sheet.shape[0], T * 9), :T * 16] = old_sheet[:min(old_sheet.shape[0], T * 9), :T * 16]

    # 1) Rumput polos mulus tanpa bunga (palet dari blok kiri atas)
    grass_tiles = make_seamless_4_tiles(src, (int(W * 0.08), int(H * 0.11), int(W * 0.17), int(H * 0.23)), rng, amp=4)
    # 2) Jalan Tanah mulus tanpa garis diagonal berulang
    dirt_tiles = make_seamless_4_tiles(src, (int(W * 0.30), int(H * 0.10), int(W * 0.44), int(H * 0.28)), rng, amp=5)
    # 3) Pasir mulus tanpa garis diagonal berulang
    sand_tiles = make_seamless_4_tiles(src, (int(W * 0.55), int(H * 0.10), int(W * 0.69), int(H * 0.28)), rng, amp=4)
    # 4) Air Sungai mulus dengan riak horizontal tipis
    water_tiles = make_seamless_4_tiles(src, (int(W * 0.80), int(H * 0.10), int(W * 0.94), int(H * 0.28)), rng, amp=3, horiz_ripple=True)
    # 5) Paving Batu Kota abad pertengahan hangat & membulat halus
    cobble_tiles = make_medieval_cobble_4_tiles(rng)

    for v in range(4):
        sheet[0:T, (0 + v) * T:(1 + v) * T] = grass_tiles[v]
        sheet[0:T, (4 + v) * T:(5 + v) * T] = dirt_tiles[v]
        sheet[0:T, (8 + v) * T:(9 + v) * T] = sand_tiles[v]
        sheet[0:T, (12 + v) * T:(13 + v) * T] = water_tiles[v]
        sheet[T:T * 2, (0 + v) * T:(1 + v) * T] = cobble_tiles[v]

    # Sesuaikan warna pinggiran rumput bergerigi (Baris 4) agar menyatu 100% dengan warna rumput baru
    g_mean = grass_tiles[0][..., :3].mean(axis=(0, 1))
    g_hi = np.clip(g_mean * 1.08, 0, 255).astype(np.uint8)
    g_base = g_mean.astype(np.uint8)
    g_sh = np.clip(g_mean * 0.62, 0, 255).astype(np.uint8)
    jag = [3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 3, 2, 3, 4, 2, 3]
    for m in range(16):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        if m & 1:
            for x in range(T):
                d = jag[x]
                for y in range(d):
                    tile[y, x, :3] = g_hi if (y == 0 and x % 2 == 0) else g_base
                    tile[y, x, 3] = 255
                tile[d, x, :3] = g_sh; tile[d, x, 3] = 255
        if m & 4:
            for x in range(T):
                d = jag[(x + 5) % T]
                for y in range(T - d, T):
                    tile[y, x, :3] = g_base; tile[y, x, 3] = 255
                tile[T - d - 1, x, :3] = g_sh; tile[T - d - 1, x, 3] = 255
        if m & 8:
            for y in range(T):
                d = jag[(y + 3) % T]
                for x in range(d):
                    tile[y, x, :3] = g_base; tile[y, x, 3] = 255
                if tile[y, d, 3] == 0:
                    tile[y, d, :3] = g_sh; tile[y, d, 3] = 255
        if m & 2:
            for y in range(T):
                d = jag[(y + 9) % T]
                for x in range(T - d, T):
                    tile[y, x, :3] = g_base; tile[y, x, 3] = 255
                if tile[y, T - d - 1, 3] == 0:
                    tile[y, T - d - 1, :3] = g_sh; tile[y, T - d - 1, 3] = 255
        sheet[T * 4:T * 5, m * T:(m + 1) * T] = tile

    # Baris 5: 16 ubin tepian pantai pasir basah + buih air putih-biru muda (bitmask N=1, E=2, S=4, W=8)
    s_mean = sand_tiles[0][..., :3].mean(axis=(0, 1))
    s_wet = np.clip(s_mean * 0.84, 0, 255).astype(np.uint8)
    foam = np.array([218, 244, 246], dtype=np.uint8)
    wave = [2, 3, 2, 1, 2, 3, 3, 2, 1, 2, 3, 2, 2, 3, 1, 2]
    for m in range(16):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        if m & 1:  # N ada pasir/daratan
            for x in range(T):
                d = wave[x]
                for y in range(d):
                    tile[y, x, :3] = s_wet; tile[y, x, 3] = 255
                tile[d, x, :3] = foam; tile[d, x, 3] = 215
        if m & 4:  # S
            for x in range(T):
                d = wave[(x + 6) % T]
                for y in range(T - d, T):
                    tile[y, x, :3] = s_wet; tile[y, x, 3] = 255
                tile[T - d - 1, x, :3] = foam; tile[T - d - 1, x, 3] = 215
        if m & 8:  # W
            for y in range(T):
                d = wave[(y + 4) % T]
                for x in range(d):
                    tile[y, x, :3] = s_wet; tile[y, x, 3] = 255
                if tile[y, d, 3] == 0:
                    tile[y, d, :3] = foam; tile[y, d, 3] = 215
        if m & 2:  # E
            for y in range(T):
                d = wave[(y + 10) % T]
                for x in range(T - d, T):
                    tile[y, x, :3] = s_wet; tile[y, x, 3] = 255
                if tile[y, T - d - 1, 3] == 0:
                    tile[y, T - d - 1, :3] = foam; tile[y, T - d - 1, 3] = 215
        sheet[T * 5:T * 6, m * T:(m + 1) * T] = tile

    # Baris 6: 16 ubin transisi lembut jalan tanah -> pasir (bitmask N=1, E=2, S=4, W=8)
    d_mean = dirt_tiles[0][..., :3].mean(axis=(0, 1))
    d_base = d_mean.astype(np.uint8)
    d_blend = np.clip(d_mean * 0.65 + s_mean * 0.35, 0, 255).astype(np.uint8)
    dw = [2, 3, 2, 1, 3, 2, 2, 1, 2, 3, 2, 2, 1, 2, 3, 2]
    for m in range(16):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        if m & 1:  # N ada jalan tanah
            for x in range(T):
                d = dw[x]
                for y in range(d):
                    tile[y, x, :3] = d_base; tile[y, x, 3] = 255
                tile[d, x, :3] = d_blend; tile[d, x, 3] = 200
        if m & 4:  # S
            for x in range(T):
                d = dw[(x + 5) % T]
                for y in range(T - d, T):
                    tile[y, x, :3] = d_base; tile[y, x, 3] = 255
                tile[T - d - 1, x, :3] = d_blend; tile[T - d - 1, x, 3] = 200
        if m & 8:  # W
            for y in range(T):
                d = dw[(y + 3) % T]
                for x in range(d):
                    tile[y, x, :3] = d_base; tile[y, x, 3] = 255
                if tile[y, d, 3] == 0:
                    tile[y, d, :3] = d_blend; tile[y, d, 3] = 200
        if m & 2:  # E
            for y in range(T):
                d = dw[(y + 9) % T]
                for x in range(T - d, T):
                    tile[y, x, :3] = d_base; tile[y, x, 3] = 255
                if tile[y, T - d - 1, 3] == 0:
                    tile[y, T - d - 1, :3] = d_blend; tile[y, T - d - 1, 3] = 200
        sheet[T * 6:T * 7, m * T:(m + 1) * T] = tile

    # Baris 7: 16 ubin dekorasi tanah transparan (GroundDeco)
    # 0..4: bunga (merah, kuning, biru, putih, pink), 5..8: rumpun rumput liar, 9..12: kerikil jalan, 13..15: lumut/semanggi
    flower_cols = [(228, 92, 92), (246, 214, 78), (110, 174, 240), (248, 248, 244), (242, 148, 178)]
    for i, fc in enumerate(flower_cols):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        pts = [(5, 5), (11, 10)] if i % 2 == 0 else [(4, 10), (11, 5), (8, 12)]
        for cy, cx in pts:
            tile[cy, cx] = [252, 240, 158, 255]
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                tile[cy + dy, cx + dx] = [fc[0], fc[1], fc[2], 255]
            if cy + 2 < T:
                tile[cy + 2, cx] = [84, 134, 52, 255]
        sheet[T * 7:T * 8, i * T:(i + 1) * T] = tile
    # 5..8: helai rumput liar transparan
    for i in range(4):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        for _ in range(3):
            y = int(rng.integers(4, 14))
            x = int(rng.integers(2, 13))
            tile[y, x] = [96, 142, 56, 255]
            tile[y - 1, x] = [118, 168, 68, 255]
            tile[y - 2, max(0, x - 1)] = [138, 186, 80, 255]
            tile[y - 1, min(15, x + 1)] = [118, 168, 68, 255]
        sheet[T * 7:T * 8, (5 + i) * T:(6 + i) * T] = tile
    # 9..12: kerikil kecil transparan untuk jalan tanah
    for i in range(4):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        for _ in range(3):
            y = int(rng.integers(2, 13))
            x = int(rng.integers(2, 13))
            tile[y, x] = [156, 148, 138, 255]
            tile[y, x + 1] = [132, 124, 114, 255]
            tile[y + 1, x] = [116, 108, 98, 255]
        sheet[T * 7:T * 8, (9 + i) * T:(10 + i) * T] = tile
    # 13..15: semanggi / lumut halus
    for i in range(3):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        for _ in range(4):
            y = int(rng.integers(3, 13))
            x = int(rng.integers(3, 13))
            tile[y, x] = [98, 148, 60, 255]
            tile[y - 1, x] = [116, 166, 72, 255]
            tile[y, x + 1] = [116, 166, 72, 255]
        sheet[T * 7:T * 8, (13 + i) * T:(14 + i) * T] = tile

    # Baris 8: 16 ubin Ground Decals, Worn Paths, & Grass Patches (transparan)
    # 0..3: Grass Patches (bercak rumput organik sedikit lebih gelap/rimbun untuk memecah padang polos)
    gp_dark = np.clip(g_mean * 0.87, 0, 255).astype(np.uint8)
    gp_mid = np.clip(g_mean * 0.93, 0, 255).astype(np.uint8)
    gp_blade = np.clip(g_mean * 0.76, 0, 255).astype(np.uint8)
    for i in range(4):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        cx, cy = 7.5 + float(rng.uniform(-1.2, 1.2)), 7.5 + float(rng.uniform(-1.2, 1.2))
        rx, ry = 5.5 + (i % 2) * 1.0, 4.8 + ((i + 1) % 2) * 1.0
        for y in range(T):
            for x in range(T):
                dist = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + float(rng.uniform(-0.18, 0.18))
                if dist < 0.72:
                    tile[y, x] = [gp_dark[0], gp_dark[1], gp_dark[2], 155]
                elif dist < 1.05:
                    tile[y, x] = [gp_mid[0], gp_mid[1], gp_mid[2], 115]
        # Tambah 3-4 helai rumput halus di atas bercak
        for _ in range(4):
            bx = int(rng.integers(3, 13))
            by = int(rng.integers(4, 13))
            tile[by, bx] = [gp_blade[0], gp_blade[1], gp_blade[2], 210]
            tile[by - 1, bx] = [gp_dark[0], gp_dark[1], gp_dark[2], 200]
        sheet[T * 8:T * 9, i * T:(i + 1) * T] = tile

    # 4..7: Worn Paths (bercak tanah terinjak transparan untuk depan pintu rumah, sumur, & persimpangan)
    wp_core = np.clip(d_mean * 0.96, 0, 255).astype(np.uint8)
    wp_edge = np.clip(d_mean * 1.05, 0, 255).astype(np.uint8)
    for i in range(4):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        cx, cy = 7.5 + float(rng.uniform(-1.0, 1.0)), 7.5 + float(rng.uniform(-1.0, 1.0))
        rx, ry = 5.2 + (i % 2) * 1.2, 4.6 + ((i + 1) % 2) * 1.0
        for y in range(T):
            for x in range(T):
                dist = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + float(rng.uniform(-0.22, 0.22))
                if dist < 0.65:
                    tile[y, x] = [wp_core[0], wp_core[1], wp_core[2], 175]
                elif dist < 1.0:
                    tile[y, x] = [wp_edge[0], wp_edge[1], wp_edge[2], 110]
        sheet[T * 8:T * 9, (4 + i) * T:(5 + i) * T] = tile

    # 8..10: City Cobble Cracks & Mossy Grout (retakan batu halus & lumut tipis untuk paving kota)
    crack_c = np.array([92, 85, 76, 185], dtype=np.uint8)
    moss_c = np.array([106, 138, 68, 170], dtype=np.uint8)
    for i in range(3):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        x, y = int(rng.integers(3, 6)), int(rng.integers(3, 6))
        for _ in range(7):
            if 1 <= x < T - 1 and 1 <= y < T - 1:
                tile[y, x] = crack_c
            x += int(rng.choice([0, 1, 1]))
            y += int(rng.choice([0, 1]))
        if i >= 1:
            for _ in range(4):
                mx, my = int(rng.integers(2, 14)), int(rng.integers(2, 14))
                tile[my, mx] = moss_c
                if mx + 1 < T:
                    tile[my, mx + 1] = moss_c
        sheet[T * 8:T * 9, (8 + i) * T:(9 + i) * T] = tile

    # 11..13: Fallen Leaves (daun gugur di bawah pohon hutan & desa)
    leaf_pals = [
        [(110, 152, 62), (142, 174, 72), (168, 128, 64)],
        [(176, 118, 56), (146, 98, 48), (118, 156, 66)],
        [(94, 136, 56), (124, 162, 68), (156, 112, 54)],
    ]
    for i in range(3):
        tile = np.zeros((T, T, 4), dtype=np.uint8)
        lpal = leaf_pals[i]
        for _ in range(5):
            lx = int(rng.integers(2, 13))
            ly = int(rng.integers(2, 13))
            lc = lpal[int(rng.integers(0, len(lpal)))]
            tile[ly, lx] = [lc[0], lc[1], lc[2], 220]
            tile[ly, lx + 1] = [max(0, lc[0] - 20), max(0, lc[1] - 20), max(0, lc[2] - 15), 200]
        sheet[T * 8:T * 9, (11 + i) * T:(12 + i) * T] = tile

    # 14..15: Wheel Tracks (bekas roda gerobak halus: 14=horizontal, 15=vertikal)
    rut_c = np.clip(d_mean * 0.80, 0, 255).astype(np.uint8)
    rut_hi = np.clip(d_mean * 0.90, 0, 255).astype(np.uint8)
    # 14: horizontal
    tile_h = np.zeros((T, T, 4), dtype=np.uint8)
    for x in range(T):
        if x % 5 != 4:
            tile_h[4, x] = [rut_c[0], rut_c[1], rut_c[2], 145]
            tile_h[5, x] = [rut_hi[0], rut_hi[1], rut_hi[2], 95]
            tile_h[11, x] = [rut_c[0], rut_c[1], rut_c[2], 145]
            tile_h[12, x] = [rut_hi[0], rut_hi[1], rut_hi[2], 95]
    sheet[T * 8:T * 9, 14 * T:15 * T] = tile_h
    # 15: vertikal
    tile_v = np.zeros((T, T, 4), dtype=np.uint8)
    for y in range(T):
        if y % 5 != 4:
            tile_v[y, 4] = [rut_c[0], rut_c[1], rut_c[2], 145]
            tile_v[y, 5] = [rut_hi[0], rut_hi[1], rut_hi[2], 95]
            tile_v[y, 11] = [rut_c[0], rut_c[1], rut_c[2], 145]
            tile_v[y, 12] = [rut_hi[0], rut_hi[1], rut_hi[2], 95]
    sheet[T * 8:T * 9, 15 * T:16 * T] = tile_v

    Image.fromarray(sheet).save(OUT)
    print('Updated hand-drawn tileset:', OUT, sheet.shape)


if __name__ == '__main__':
    main()
