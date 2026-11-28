"""Generate tilesheet modular 16x16 bersih untuk standar industri TileMap Godot (lumina_tileset.png).
Ukuran: 256x32 px (16 kolom x 2 baris, masing-masing 16x16 px).
Baris 0:
  0..3  : Rumput bersih (#96c458)
  4..7  : Jalan tanah (#b58c5e)
  8..11 : Pasir pantai (#dec692)
  12..15: Air sungai (#72b6b8)
Baris 1:
  0..3  : Paving kota (#9c968c)
  4..7  : Salju (#dce8f2)
  8..11 : Rumput rawa (#6f8a54)
  12..15: Air dalam (#589ca4)
"""
import numpy as np
from PIL import Image

OUT = 'godot/assets/art/ground/lumina_tileset.png'
T = 16


def fill_tile(rng, base_rgb, amp=4, speckles=()):
    tile = np.full((T, T, 4), [*base_rgb, 255], dtype=np.uint8)
    n = rng.integers(-amp, amp + 1, size=(T, T, 1))
    tile[..., :3] = np.clip(tile[..., :3].astype(int) + n, 0, 255).astype(np.uint8)
    for col, count, horiz in speckles:
        for _ in range(count):
            y = int(rng.integers(1, T - 1))
            x = int(rng.integers(1, T - 2))
            tile[y, x, :3] = col
            if horiz:
                tile[y, x + 1, :3] = col
            elif rng.random() < 0.5:
                tile[y - 1, x, :3] = col
    return tile


def make_cobble(rng):
    tile = fill_tile(rng, (156, 150, 140), amp=4)
    # Garis nat batu halus 8x8
    tile[0, :, :3] = (128, 122, 114)
    tile[8, :, :3] = (128, 122, 114)
    tile[:8, 0, :3] = (128, 122, 114)
    tile[8:, 8, :3] = (128, 122, 114)
    return tile


def make_cliff_top(rng, variant):
    """Tebing atas berumput dengan bibir batu cokelat di bawah."""
    tile = fill_tile(rng, (124, 92, 62), amp=6)
    # Dinding batu vertikal di bagian bawah (y=7..15)
    for x in (3, 8, 13):
        tile[7:, x, :3] = (84, 60, 40)
    tile[11, :, :3] = (96, 70, 48)
    # Rumput menggantung di atas (y=0..6)
    grass = fill_tile(rng, (150, 196, 88), amp=4)
    tile[0:6, :] = grass[0:6, :]
    # Garis bayangan hijau tua di bawah rumput
    tile[6, :, :3] = (96, 138, 54)
    for x in range(0, T, 3):
        tile[7, x, :3] = (96, 138, 54)
    if variant == 0:
        tile[6:, 0, :3] = (72, 50, 34)
    elif variant == 3:
        tile[6:, 15, :3] = (72, 50, 34)
    return tile


def make_cliff_wall(rng, variant):
    """Dinding tebing batu vertikal dengan retakan batu."""
    tile = fill_tile(rng, (118, 86, 58), amp=7)
    for x in (4, 10):
        tile[:, x, :3] = (82, 58, 38)
    tile[5, :10, :3] = (92, 66, 44)
    tile[11, 4:, :3] = (92, 66, 44)
    # Highlight atas tiap bongkahan batu
    tile[1, 1:4, :3] = (146, 114, 82)
    tile[6, 5:10, :3] = (146, 114, 82)
    tile[12, 11:15, :3] = (146, 114, 82)
    if variant == 0:
        tile[:, 0, :3] = (68, 48, 32)
    elif variant == 3:
        tile[:, 15, :3] = (68, 48, 32)
    return tile


def make_stairs(rng):
    """Tangga batu abu-abu untuk naik-turun tebing."""
    tile = fill_tile(rng, (148, 144, 136), amp=4)
    for y in (0, 4, 8, 12):
        tile[y, 1:15, :3] = (182, 178, 170)
        tile[y + 3, 1:15, :3] = (102, 98, 92)
    tile[:, 0, :3] = (90, 84, 78)
    tile[:, 15, :3] = (90, 84, 78)
    return tile


def make_stepping_dirt(rng):
    """Jalan tanah dengan batu pijakan abu-abu membulat."""
    tile = fill_tile(rng, (181, 140, 94), amp=5)
    for cy, cx, ry, rx in ((4, 5, 2, 3), (11, 10, 2, 3)):
        for dy in range(-ry, ry + 1):
            for dx in range(-rx, rx + 1):
                if dx * dx / (rx * rx + 0.5) + dy * dy / (ry * ry + 0.5) <= 1.0:
                    col = (164, 160, 150) if dy < 0 else (136, 132, 124)
                    tile[cy + dy, cx + dx, :3] = col
    return tile


def make_flower_grass(rng, flower_rgb):
    """Rumput bersih dengan 3-4 bunga kecil warna cerah."""
    tile = fill_tile(rng, (150, 196, 88), amp=4, speckles=[((132, 178, 72), 4, False)])
    for cy, cx in ((4, 4), (10, 11), (12, 4)):
        tile[cy, cx, :3] = (252, 240, 164)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            tile[cy + dy, cx + dx, :3] = flower_rgb
        if cy + 2 < T:
            tile[cy + 2, cx, :3] = (88, 140, 52)
    return tile


def make_garden(rng, has_crops):
    """Lahan kebun tanah garapan gelap + opsional tunas tanaman."""
    tile = fill_tile(rng, (122, 86, 56), amp=4)
    for y in (3, 7, 11, 15):
        tile[y, :, :3] = (96, 66, 42)
    if has_crops:
        for cy in (2, 6, 10):
            for cx in (3, 8, 13):
                tile[cy, cx, :3] = (96, 164, 62)
                tile[cy - 1, cx, :3] = (128, 196, 78)
    return tile


def make_fence(rng, kind):
    """Pagar kayu di atas rumput bersih."""
    tile = fill_tile(rng, (150, 196, 88), amp=4)
    wood = (142, 98, 58)
    dark = (92, 60, 36)
    hi = (176, 128, 82)
    if kind in (0, 1, 2):  # horizontal
        tile[6:9, :, :3] = wood
        tile[6, :, :3] = hi
        tile[9, :, :3] = dark
        tile[11:13, :, :3] = wood
        tile[13, :, :3] = dark
        posts = (2, 12) if kind == 0 else ((2,) if kind == 1 else (12,))
        for px in posts:
            tile[4:14, px:px + 3, :3] = wood
            tile[4, px:px + 3, :3] = hi
            tile[14, px:px + 3, :3] = dark
    else:  # vertical
        tile[:, 6:10, :3] = wood
        tile[:, 6, :3] = hi
        tile[:, 10, :3] = dark
    return tile


def make_wood_plank(rng, vertical):
    """Papan kayu jembatan / dermaga."""
    tile = fill_tile(rng, (164, 118, 72), amp=4)
    if vertical:
        for x in (0, 4, 8, 12):
            tile[:, x, :3] = (112, 76, 44)
    else:
        for y in (0, 4, 8, 12):
            tile[y, :, :3] = (112, 76, 44)
    return tile


def make_grass_edge_mask(rng, mask):
    """Buat ubin pinggiran rumput bergerigi transparan 16x16 untuk bitmask 4-arah:
    bit 0 (1) = Utara (N) ada rumput, bit 1 (2) = Timur (E), bit 2 (4) = Selatan (S), bit 3 (8) = Barat (W).
    Rumput menjorok bergerigi 2-4px ke dalam ubin jalan/pasir + 1px bayangan hijau tua."""
    tile = np.zeros((T, T, 4), dtype=np.uint8)
    g_base = np.array([150, 196, 88, 255], dtype=np.uint8)
    g_hi = np.array([164, 208, 100, 255], dtype=np.uint8)
    g_sh = np.array([104, 146, 58, 255], dtype=np.uint8)
    # Pola gigi rumput organik (panjang 2..4px)
    jag = [3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 3, 2, 3, 4, 2, 3]
    if mask & 1:  # N
        for x in range(T):
            d = jag[x]
            for y in range(d):
                tile[y, x] = g_hi if (y == 0 and x % 2 == 0) else g_base
            tile[d, x] = g_sh
    if mask & 4:  # S
        for x in range(T):
            d = jag[(x + 5) % T]
            for y in range(T - d, T):
                tile[y, x] = g_base
            tile[T - d - 1, x] = g_sh
    if mask & 8:  # W
        for y in range(T):
            d = jag[(y + 3) % T]
            for x in range(d):
                tile[y, x] = g_base
            if tile[y, d, 3] == 0:
                tile[y, d] = g_sh
    if mask & 2:  # E
        for y in range(T):
            d = jag[(y + 9) % T]
            for x in range(T - d, T):
                tile[y, x] = g_base
            if tile[y, T - d - 1, 3] == 0:
                tile[y, T - d - 1] = g_sh
    return tile


def main():
    rng = np.random.default_rng(2026)
    sheet = np.zeros((T * 5, T * 16, 4), dtype=np.uint8)

    for v in range(4):
        # Row 0: Rumput (v=3 diberi sedikit bunga liar kecil halus)
        g_spec = [((132, 178, 72), 5, False), ((168, 212, 104), 4, False)]
        if v == 3:
            g_spec.append(((246, 234, 152), 2, False))
        sheet[0:T, (0 + v) * T:(1 + v) * T] = fill_tile(rng, (150, 196, 88), amp=4, speckles=g_spec)
        # Jalan tanah dengan variasi kerikil lembut
        d_spec = [((158, 118, 76), 5, False), ((198, 160, 114), 4, False)]
        if v == 2:
            d_spec.append(((142, 134, 124), 2, True))
        sheet[0:T, (4 + v) * T:(5 + v) * T] = fill_tile(rng, (181, 140, 94), amp=5, speckles=d_spec)
        # Pasir pantai
        sheet[0:T, (8 + v) * T:(9 + v) * T] = fill_tile(
            rng, (222, 198, 146), amp=4,
            speckles=[((202, 178, 128), 4, False), ((234, 214, 166), 3, False)],
        )
        # Air sungai
        sheet[0:T, (12 + v) * T:(13 + v) * T] = fill_tile(
            rng, (114, 182, 184), amp=3,
            speckles=[((146, 206, 208), 3, True), ((96, 162, 166), 2, True)],
        )
        # Row 1
        sheet[T:T * 2, (0 + v) * T:(1 + v) * T] = make_cobble(rng)
        sheet[T:T * 2, (4 + v) * T:(5 + v) * T] = fill_tile(
            rng, (220, 232, 242), amp=3,
            speckles=[((198, 214, 230), 4, False), ((238, 244, 250), 3, False)],
        )
        sheet[T:T * 2, (8 + v) * T:(9 + v) * T] = fill_tile(
            rng, (111, 138, 84), amp=4,
            speckles=[((92, 118, 68), 4, False), ((128, 154, 98), 3, False)],
        )
        sheet[T:T * 2, (12 + v) * T:(13 + v) * T] = fill_tile(
            rng, (88, 156, 164), amp=3,
            speckles=[((112, 178, 184), 3, True), ((74, 138, 148), 2, True)],
        )
        # Row 2: Tebing atas (0..3), Dinding tebing (4..7), Tangga (8..9), Batu pijakan (10..11), Bunga (12..15)
        sheet[T * 2:T * 3, (0 + v) * T:(1 + v) * T] = make_cliff_top(rng, v)
        sheet[T * 2:T * 3, (4 + v) * T:(5 + v) * T] = make_cliff_wall(rng, v)
        # Row 3: Kebun (0..3), Pagar (4..7), Papan kayu (12..15)
        sheet[T * 3:T * 4, (0 + v) * T:(1 + v) * T] = make_garden(rng, v >= 2)
        sheet[T * 3:T * 4, (4 + v) * T:(5 + v) * T] = make_fence(rng, v)
        sheet[T * 3:T * 4, (12 + v) * T:(13 + v) * T] = make_wood_plank(rng, v >= 2)

    sheet[T * 2:T * 3, 8 * T:9 * T] = make_stairs(rng)
    sheet[T * 2:T * 3, 9 * T:10 * T] = make_stairs(rng)
    sheet[T * 2:T * 3, 10 * T:11 * T] = make_stepping_dirt(rng)
    sheet[T * 2:T * 3, 11 * T:12 * T] = make_stepping_dirt(rng)
    for idx, fcol in enumerate(((224, 92, 92), (244, 212, 76), (110, 174, 240), (248, 248, 244))):
        sheet[T * 2:T * 3, (12 + idx) * T:(13 + idx) * T] = make_flower_grass(rng, fcol)
    # Row 3 col 8..11: rumput tepi sungai (hijau + air)
    for v in range(4):
        tile = fill_tile(rng, (114, 182, 184), amp=3)
        gr = fill_tile(rng, (150, 196, 88), amp=4)
        if v == 0:
            tile[0:5, :] = gr[0:5, :]
        elif v == 1:
            tile[11:16, :] = gr[11:16, :]
        elif v == 2:
            tile[:, 0:5] = gr[:, 0:5]
        else:
            tile[:, 11:16] = gr[:, 11:16]
        sheet[T * 3:T * 4, (8 + v) * T:(9 + v) * T] = tile

    # Row 4: 16 ubin pinggiran rumput bergerigi transparan (bitmask N=1, E=2, S=4, W=8)
    for m in range(16):
        sheet[T * 4:T * 5, m * T:(m + 1) * T] = make_grass_edge_mask(rng, m)

    Image.fromarray(sheet).save(OUT)
    print('Saved:', OUT, sheet.shape)


if __name__ == '__main__':
    main()
