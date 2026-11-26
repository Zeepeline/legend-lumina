"""Bangun sprite rumah prototipe 3/4 oblique anti-mixel dari gambar konsep.

Memproses gambar mentah (latar toska) menjadi kanvas logis 80x84 yang diskala
integer 2x NEAREST menjadi 160x168 px di assets/img/buildings/sp_house_proto.png,
sekaligus mencetak metrik chim, pintu, dan kotak jendela untuk town_lights.js.
"""
from collections import deque
import os
import sys
import numpy as np
from PIL import Image, ImageDraw

DEFAULT_SRC = (
    '/Users/herlambang/.gemini/antigravity/brain/'
    'ab1c480f-6d86-4dc3-9b19-9cae2ad67479/'
    'raw_house_proto_1795676678846.jpg'
)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT_PATH = os.path.join(ROOT, 'assets', 'img', 'buildings', 'sp_house_proto.png')
CMP_PATH = (
    '/Users/herlambang/.gemini/antigravity/brain/'
    'ab1c480f-6d86-4dc3-9b19-9cae2ad67479/scratch/house_proto_comparison.png'
)
UMBER_OUTLINE = (46, 30, 34)


def flood_remove_bg(rgba: np.ndarray, tol: float = 42.0) -> np.ndarray:
    """Hapus latar belakang polos lewat flood-fill dari 4 tepi agar bagian dalam aman."""
    h, w, _ = rgba.shape
    rgb = rgba[..., :3].astype(np.float32)
    corners = np.concatenate([
        rgb[:16, :16].reshape(-1, 3),
        rgb[:16, -16:].reshape(-1, 3),
        rgb[-16:, :16].reshape(-1, 3),
        rgb[-16:, -16:].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0)
    dist = np.linalg.norm(rgb - bg[None, None, :], axis=-1)
    bg_like = dist <= tol

    bg_mask = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bg_like[y, x] and not bg_mask[y, x]:
                bg_mask[y, x] = True
                q.append((y, x))
    for y in range(1, h - 1):
        for x in (0, w - 1):
            if bg_like[y, x] and not bg_mask[y, x]:
                bg_mask[y, x] = True
                q.append((y, x))

    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < h and 0 <= nx < w and not bg_mask[ny, nx] and bg_like[ny, nx]:
                bg_mask[ny, nx] = True
                q.append((ny, nx))

    out = rgba.copy()
    out[bg_mask, 3] = 0

    # Bersihkan sisa pinggiran toska 1 px yang masih menempel di tepi luar siluet.
    for _ in range(2):
        alpha_on = out[..., 3] > 0
        padded = np.pad(bg_mask, 1, mode='constant', constant_values=True)
        touch_bg = (
            padded[:-2, 1:-1] | padded[2:, 1:-1] | padded[1:-1, :-2] | padded[1:-1, 2:]
        )
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        teal_fringe = (g > r + 12) & (b > r + 10) & (dist < 115)
        lum = 0.3 * r + 0.59 * g + 0.11 * b
        drop = alpha_on & touch_bg & teal_fringe & (lum > 72)
        if not np.any(drop):
            break
        bg_mask |= drop
        out[drop, 3] = 0
    return out


def remove_orphan_pixels(alpha: np.ndarray, min_size: int = 3) -> np.ndarray:
    """Buang komponen alpha terpisah yang sangat kecil (piksel yatim)."""
    h, w = alpha.shape
    seen = np.zeros((h, w), dtype=bool)
    out = alpha.copy()
    for y in range(h):
        for x in range(w):
            if out[y, x] == 0 or seen[y, x]:
                continue
            comp = []
            q = deque([(y, x)])
            seen[y, x] = True
            while q:
                cy, cx = q.popleft()
                comp.append((cy, cx))
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and out[ny, nx] > 0:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if len(comp) < min_size:
                for cy, cx in comp:
                    out[cy, cx] = 0
    return out


def quantize_warm_palette(logical_rgba: np.ndarray, max_colors: int = 19) -> np.ndarray:
    """Kuantisasi piksel opak ke palet terbatas sambil menjaga biru kaca jendela & nyala lentera."""
    res = logical_rgba.copy()
    mask = res[..., 3] > 0
    h, w, _ = res.shape
    yy, xx = np.mgrid[0:h, 0:w]

    # Bersihkan sisa pinggiran toska pada resolusi logis sebelum kuantisasi.
    padded = np.pad(~mask, 1, mode='constant', constant_values=True)
    touch_out = padded[:-2, 1:-1] | padded[2:, 1:-1] | padded[1:-1, :-2] | padded[1:-1, 2:]
    r, g, b = res[..., 0].astype(int), res[..., 1].astype(int), res[..., 2].astype(int)
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    teal_edge = mask & touch_out & (g > r + 14) & (b > r + 10)
    res[teal_edge, :3] = UMBER_OUTLINE

    # Jaga kaca jendela biru & nyala inti lentera agar tidak tersapu MEDIANCUT (raw_house_proto front-gable).
    r, g, b = res[..., 0].astype(int), res[..., 1].astype(int), res[..., 2].astype(int)
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    glass_mask = (
        mask
        & (xx >= 42) & (xx <= 56) & (yy >= 54) & (yy <= 66)
        & (b >= r + 2) & (lum < 150)
    )
    lantern_mask = (
        mask
        & (xx >= 32) & (xx <= 40) & (yy >= 56) & (yy <= 66)
        & (r > 195) & (r - b > 65)
    )

    body_mask = mask & ~glass_mask & ~lantern_mask
    opaque_rgb = res[body_mask, :3]
    strip = Image.fromarray(opaque_rgb.reshape(1, -1, 3), 'RGB')
    q_strip = strip.quantize(
        colors=max_colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE
    ).convert('RGB')
    q_arr = np.asarray(q_strip).reshape(-1, 3).copy()

    # Ganti warna hampir hitam pekat dengan cokelat umber hangat khas storybook.
    dark = np.max(q_arr, axis=-1) < 34
    q_arr[dark] = UMBER_OUTLINE
    res[body_mask, :3] = q_arr

    # Petakan kaca jendela ke 2 nada biru-slate & nyala inti lentera ke kuning hangat.
    if np.any(glass_mask):
        gl = lum[glass_mask]
        res[glass_mask, :3] = np.where(gl[:, None] < 80, (44, 62, 90), (68, 92, 128))
    if np.any(lantern_mask):
        res[lantern_mask, :3] = (248, 192, 92)
    return res


def analyze_metrics(final_img: Image.Image) -> dict:
    """Hitung metrik piksel 2x2, warna unik, posisi cerobong, pintu, dan jendela."""
    a = np.asarray(final_img)
    h, w, _ = a.shape
    mx = float(np.mean(np.all(a[:, 0::2] == a[:, 1::2], axis=-1)))
    my = float(np.mean(np.all(a[0::2, :] == a[1::2, :], axis=-1)))
    opaque = a[a[..., 3] > 0, :3]
    colors = len(np.unique(opaque.reshape(-1, 3), axis=0))
    bb = final_img.getbbox()

    # Deteksi cerobong kiri-atas (di bagian paling atas sebelah kiri pusat)
    ys, xs = np.where((a[..., 3] > 0) & (np.arange(h)[:, None] < 48) & (np.arange(w)[None, :] < 75))
    chim_dx = round(float(np.mean(xs) - w / 2)) if len(xs) else -28
    chim_dy = int(np.min(ys) + 4) if len(ys) else 10

    # Deteksi kaca jendela biru-slate di dalam bukaan jendela (x 84..114, y 108..134)
    r, g, b, al = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int), a[..., 3]
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    glass = (
        (al > 200)
        & (b >= r + 4)
        & (lum < 155)
        & (np.arange(w)[None, :] >= 84)
        & (np.arange(w)[None, :] <= 114)
        & (np.arange(h)[:, None] >= 108)
        & (np.arange(h)[:, None] <= 134)
    )
    wys, wxs = np.where(glass)
    win_box = (
        [int(wxs.min()), int(wys.min()), int(wxs.max() - wxs.min()) + 1, int(wys.max() - wys.min()) + 1]
        if len(wxs)
        else [90, 114, 16, 14]
    )

    # Estimasi pusat pintu (area kusen kayu lengkung di sisi kiri-tengah, x 32..80)
    door_band = (
        (al > 200)
        & (np.arange(w)[None, :] >= 32)
        & (np.arange(w)[None, :] <= 80)
        & (np.arange(h)[:, None] >= 106)
        & (np.arange(h)[:, None] <= 160)
    )
    # Engsel besi pintu berwarna abu-biru tua (r dan b dekat, lebih gelap dari kayu terang)
    iron = door_band & (np.abs(r - b) < 18) & (lum < 110) & (lum > 45)
    dys, dxs = np.where(iron)
    door_cx = round(float(np.mean(dxs))) if len(dxs) else 56

    return {
        'size': (w, h),
        'block_2x2': (round(mx, 4), round(my, 4)),
        'unique_colors': colors,
        'bbox': bb,
        'chim': [chim_dx, chim_dy],
        'win_box': win_box,
        'door_cx': door_cx,
        'door_offset_from_center': door_cx - w // 2,
    }


def make_comparison(proto: Image.Image) -> None:
    """Buat papan perbandingan berdampingan hero_mc2 di depan rumah lama vs prototipe."""
    hero_sheet = Image.open(os.path.join(ROOT, 'assets/img/hero/hero_mc2.png')).convert('RGBA')
    hero = hero_sheet.crop((20, 8, 44, 56))  # 24x48 idle_down0
    house_a = Image.open(os.path.join(ROOT, 'assets/img/buildings/sp_houseA.png')).convert('RGBA')
    house_c1 = Image.open(os.path.join(ROOT, 'assets/img/buildings/sp_b_cityHouse1.png')).convert('RGBA')

    items = [
        ('sp_houseA 100x132', house_a, 34),
        ('sp_b_cityHouse1 100x132', house_c1, 70),
        ('sp_house_proto 160x168', proto, 56),
    ]
    cw, ch = 560, 220
    board = Image.new('RGBA', (cw, ch), (132, 174, 88, 255))
    draw = ImageDraw.Draw(board)
    draw.rectangle([0, 174, cw, ch], fill=(166, 134, 92, 255))  # jalur tanah depan rumah

    x = 24
    for label, bldg, door_px_x in items:
        by = 190 - bldg.height
        board.alpha_composite(bldg, (x, by))
        hx = x + door_px_x - hero.width // 2
        hy = 190 - hero.height + 6
        # Bayangan kaki karakter
        draw.ellipse([hx + 3, hy + hero.height - 5, hx + hero.width - 3, hy + hero.height + 1], fill=(55, 45, 32, 110))
        board.alpha_composite(hero, (hx, hy))
        draw.text((x, 8), label, fill=(24, 24, 24, 255))
        x += bldg.width + 64

    board.resize((cw * 2, ch * 2), Image.Resampling.NEAREST).save(CMP_PATH)


def main(src_path: str) -> None:
    raw = np.asarray(Image.open(src_path).convert('RGBA'))
    clean = flood_remove_bg(raw)
    clean_img = Image.fromarray(clean, 'RGBA')
    bb = clean_img.getbbox()
    cropped = clean_img.crop(bb)

    cw, ch = cropped.size
    scale = min(78.0 / cw, 82.0 / ch)
    nw, nh = max(1, round(cw * scale)), max(1, round(ch * scale))
    small = cropped.resize((nw, nh), Image.Resampling.BOX)

    arr = np.asarray(small).copy()
    arr[..., 3] = np.where(arr[..., 3] >= 120, 255, 0)
    arr[..., 3] = remove_orphan_pixels(arr[..., 3], min_size=3)

    logical = Image.new('RGBA', (80, 84), (0, 0, 0, 0))
    px = (80 - nw) // 2
    py = 84 - nh
    logical.alpha_composite(Image.fromarray(arr, 'RGBA'), (px, py))
    logical = Image.fromarray(quantize_warm_palette(np.asarray(logical), max_colors=20), 'RGBA')

    final = logical.resize((160, 168), Image.Resampling.NEAREST)
    final.save(OUT_PATH)
    make_comparison(final)
    metrics = analyze_metrics(final)
    print('Saved:', OUT_PATH)
    print('Comparison:', CMP_PATH)
    for k, v in metrics.items():
        print(f'  {k}: {v}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC)
