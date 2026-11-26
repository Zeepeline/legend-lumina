"""Pipeline batch anti-mixel untuk menyeragamkan seluruh 6 bangunan Desa Lumina.

Memproses gambar konsep 3/4 oblique menjadi sprite kanvas logis x2 NEAREST
(block_2x2 == 1.0, <= 24 warna, outline umber hangat, kaca jendela biru-slate
kompatibel town_lights.js), plus varian palet deterministik houseBrown dan
papan lineup perbandingan bersama hero_mc2.
"""
from collections import deque
import os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ART = '/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479'
OUT_DIR = os.path.join(ROOT, 'assets', 'img', 'buildings')
LINEUP_PATH = os.path.join(ART, 'scratch', 'village_buildings_v2_lineup.png')
UMBER = (46, 30, 34)

# Konfigurasi per bangunan: file sumber, ukuran logis (x2 = final), wilayah jendela logis (x0,x1,y0,y1), api?
SPECS = {
    'houseA': {
        'src': os.path.join(ART, 'housea_sprite_1795684884285.jpg'),
        'out': 'sp_houseA.png',
        'logical': (72, 80),
        'glass_zones': [(28, 46, 26, 44), (40, 56, 48, 64)],
        'chim_box': (22, 52),
    },
    'houseB': {
        'src': os.path.join(ART, 'houseb_sprite_1795683028828.jpg'),
        'out': 'sp_houseB.png',
        'logical': (68, 84),
        'glass_zones': [(28, 42, 32, 46), (40, 54, 54, 68)],
        'chim_box': (22, 48),
    },
    'houseC': {
        'src': os.path.join(ART, 'housec_sprite_1795683040536.jpg'),
        'out': 'sp_houseC.png',
        'logical': (70, 84),
        'glass_zones': [(16, 32, 34, 48), (40, 56, 34, 48)],
        'chim_box': (92, 124),
    },
    'houseRed': {
        'src': os.path.join(ART, 'housered_sprite_1795684885831.jpg'),
        'out': 'sp_house_red_cottage.png',
        'logical': (74, 78),
        'glass_zones': [(40, 58, 48, 64)],
        'chim_box': (96, 128),
    },
    'blacksmith': {
        'src': os.path.join(ART, 'sp_b_blacksmith_1795684891399.jpg'),
        'out': 'sp_blacksmith_forge.png',
        'logical': (82, 80),
        'glass_zones': [(35, 51, 48, 66)],
        'fire_zone': (56, 74, 52, 68),
        'chim_box': (104, 138),
    },
}

# Ramp genteng cokelat-zaitun hangat untuk varian houseBrown dari houseRed
BROWN_ROOF_RAMP = [
    (74, 54, 38),
    (106, 80, 50),
    (140, 108, 66),
    (174, 140, 90),
]


def flood_remove_bg(rgba: np.ndarray, tol: float = 44.0) -> np.ndarray:
    """Hapus latar toska dari 4 tepi lewat BFS agar kaca jendela di dalam tetap utuh."""
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

    mask = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bg_like[y, x] and not mask[y, x]:
                mask[y, x] = True
                q.append((y, x))
    for y in range(1, h - 1):
        for x in (0, w - 1):
            if bg_like[y, x] and not mask[y, x]:
                mask[y, x] = True
                q.append((y, x))

    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < h and 0 <= nx < w and not mask[ny, nx] and bg_like[ny, nx]:
                mask[ny, nx] = True
                q.append((ny, nx))

    out = rgba.copy()
    out[mask, 3] = 0
    for _ in range(2):
        alpha_on = out[..., 3] > 0
        pad = np.pad(mask, 1, mode='constant', constant_values=True)
        touch = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        lum = 0.3 * r + 0.59 * g + 0.11 * b
        drop = alpha_on & touch & (g > r + 12) & (b > r + 10) & (dist < 118) & (lum > 72)
        if not np.any(drop):
            break
        mask |= drop
        out[drop, 3] = 0
    return out


def remove_orphan_pixels(alpha: np.ndarray, min_size: int = 3) -> np.ndarray:
    """Buang komponen alpha yatim berukuran kecil di luar siluet."""
    h, w = alpha.shape
    seen = np.zeros((h, w), dtype=bool)
    out = alpha.copy()
    for y in range(h):
        for x in range(w):
            if out[y, x] == 0 or seen[y, x]:
                continue
            comp, q = [], deque([(y, x)])
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


def quantize_logical(logical_rgba: np.ndarray, spec: dict, max_colors: int = 19) -> tuple[np.ndarray, list]:
    """Kuantisasi palet hangat & kunci warna kaca biru-slate di tiap jendela."""
    res = logical_rgba.copy()
    h, w, _ = res.shape
    mask = res[..., 3] > 0
    yy, xx = np.mgrid[0:h, 0:w]

    pad = np.pad(~mask, 1, mode='constant', constant_values=True)
    touch = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    r, g, b = res[..., 0].astype(int), res[..., 1].astype(int), res[..., 2].astype(int)
    res[mask & touch & (g > r + 14) & (b > r + 10), :3] = UMBER

    r, g, b = res[..., 0].astype(int), res[..., 1].astype(int), res[..., 2].astype(int)
    lum = 0.3 * r + 0.59 * g + 0.11 * b

    # Deteksi kaca jendela biru-slate dalam zona kandidat masing-masing
    glass_total = np.zeros((h, w), dtype=bool)
    detected_zones = []
    for x0, x1, y0, y1 in spec.get('glass_zones', []):
        z = (
            mask & (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)
            & (b >= r + 4) & (lum < 150) & (lum > 48)
        )
        if np.any(z):
            glass_total |= z
            wys, wxs = np.where(z)
            detected_zones.append([
                int(wxs.min()) * 2, int(wys.min()) * 2,
                (int(wxs.max() - wxs.min()) + 1) * 2,
                (int(wys.max() - wys.min()) + 1) * 2,
            ])

    # Deteksi nyala api tungku untuk bengkel pandai besi
    fire_mask = np.zeros((h, w), dtype=bool)
    if 'fire_zone' in spec:
        fx0, fx1, fy0, fy1 = spec['fire_zone']
        fire_mask = (
            mask & (xx >= fx0) & (xx <= fx1) & (yy >= fy0) & (yy <= fy1)
            & (r > 180) & (r - b > 60) & (g > 70)
        )

    body_mask = mask & ~glass_total & ~fire_mask
    strip = Image.fromarray(res[body_mask, :3].reshape(1, -1, 3), 'RGB')
    q_strip = strip.quantize(
        colors=max_colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE
    ).convert('RGB')
    q_arr = np.asarray(q_strip).reshape(-1, 3).copy()
    q_arr[np.max(q_arr, axis=-1) < 34] = UMBER
    res[body_mask, :3] = q_arr

    if np.any(glass_total):
        gl = lum[glass_total]
        res[glass_total, :3] = np.where(gl[:, None] < 86, (44, 62, 90), (68, 92, 128))
    if np.any(fire_mask):
        fl = lum[fire_mask]
        res[fire_mask, :3] = np.where(fl[:, None] > 175, (252, 214, 108), (234, 114, 46))
    return res, detected_zones


def make_house_brown(red_logical: np.ndarray) -> np.ndarray:
    """Buat varian houseBrown front-gable secara deterministik dari kanvas logis houseRed."""
    arr = red_logical.copy()
    h, w, _ = arr.shape
    mask = arr[..., 3] > 0
    r, g, b = arr[..., 0].astype(float), arr[..., 1].astype(float), arr[..., 2].astype(float)
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    yy, xx = np.arange(h)[:, None], np.arange(w)[None, :]
    # Pertahankan tepat balok bubungan (x=36..40), cerobong (x=52..60), dan segitiga pelana depan
    is_ridge = (xx >= 36) & (xx <= 40) & (yy <= 26)
    is_chim = (xx >= 52) & (xx <= 60) & (yy <= 24)
    is_gable_wall = (yy >= 27) & (np.abs(xx - 38.5) <= (yy - 27) * 1.34)
    is_roof = mask & (yy >= 2) & (yy <= 48) & ~is_ridge & ~is_chim & ~is_gable_wall & (r > b + 14) & (lum > 48) & (lum < 228)
    if np.any(is_roof):
        lo, hi = np.percentile(lum[is_roof], 5), np.percentile(lum[is_roof], 95)
        t = np.clip((lum - lo) / max(1.0, hi - lo), 0.0, 1.0)
        idx = np.clip(np.round(t * (len(BROWN_ROOF_RAMP) - 1)).astype(int), 0, len(BROWN_ROOF_RAMP) - 1)
        ramp = np.array(BROWN_ROOF_RAMP, dtype=np.uint8)
        arr[is_roof, :3] = ramp[idx[is_roof]]
    return arr


def inspect_output(img: Image.Image, chim_box: tuple[int, int], win_boxes: list) -> dict:
    """Verifikasi blok 2x2, warna unik, posisi cerobong, dan simulasi filter town_lights.js."""
    a = np.asarray(img)
    h, w, _ = a.shape
    mx = float(np.mean(np.all(a[:, 0::2] == a[:, 1::2], axis=-1)))
    my = float(np.mean(np.all(a[0::2, :] == a[1::2, :], axis=-1)))
    uniq = len(np.unique(a[a[..., 3] > 0, :3].reshape(-1, 3), axis=0))

    # Cari puncak cerobong di dalam kotak horizontal cerobong masing-masing
    x_min, x_max = chim_box
    ys, xs = np.where((a[:50, x_min:x_max, 3] > 200))
    top_y = int(ys.min()) if len(ys) else 12
    top_xs = (xs[ys <= top_y + 6] + x_min) if len(ys) else np.array([w // 2])
    chim_dx = round(float(np.mean(top_xs) - w / 2))

    # Simulasi exact town_lights.js pada setiap win_box
    win_previews = []
    for wx, wy, ww, wh in win_boxes:
        lit_count = 0
        rows = []
        for j in range(wy, min(h, wy + wh), 2):
            row = ''
            for i in range(wx, min(w, wx + ww), 2):
                r, g, b, al = map(int, a[j, i])
                L = 0.3 * r + 0.59 * g + 0.11 * b
                lit = al >= 200 and (L < 52 or (b >= r - 4 and L < 175))
                if lit:
                    lit_count += 1
                row += '#' if lit else '.'
            rows.append(row)
        win_previews.append((lit_count, rows))

    return {
        'size': (w, h),
        'block_2x2': (round(mx, 4), round(my, 4)),
        'colors': uniq,
        'chim': [chim_dx, top_y + 4],
        'win_boxes': win_boxes,
        'win_previews': win_previews,
    }


def make_lineup(built: dict) -> None:
    """Render papan perbandingan lineup sumur + 7 bangunan front-gable bersama hero_mc2 (24x48)."""
    hero = Image.open(os.path.join(ROOT, 'assets/img/hero/hero_mc2.png')).convert('RGBA').crop((20, 8, 44, 56))
    proto = Image.open(os.path.join(OUT_DIR, 'sp_house_proto.png')).convert('RGBA')
    well = Image.open(os.path.join(OUT_DIR, 'sp_b_well.png')).convert('RGBA')
    items = [('well (Ref)', well, 42), ('houseProto', proto, 56)] + [
        (k, built[k]['img'], int(built[k]['img'].width * 0.34))
        for k in ('houseA', 'houseB', 'houseC', 'houseRed', 'houseBrown', 'blacksmith')
    ]
    cw = sum(im.width + 26 for _, im, _ in items) + 28
    ch = 216
    board = Image.new('RGBA', (cw, ch), (132, 174, 88, 255))
    d = ImageDraw.Draw(board)
    d.rectangle([0, 174, cw, ch], fill=(166, 134, 92, 255))

    x = 20
    for name, im, door_dx in items:
        by = 192 - im.height
        board.alpha_composite(im, (x, by))
        hx = x + door_dx - hero.width // 2
        hy = 192 - hero.height + 6
        d.ellipse([hx + 3, hy + hero.height - 5, hx + hero.width - 3, hy + hero.height + 1], fill=(55, 45, 32, 110))
        board.alpha_composite(hero, (hx, hy))
        d.text((x, 8), f'{name}\n{im.width}x{im.height}', fill=(24, 24, 24, 255))
        x += im.width + 26
    board.resize((cw * 2, ch * 2), Image.Resampling.NEAREST).save(LINEUP_PATH)


def process_one(name: str, spec: dict) -> tuple[Image.Image, np.ndarray, dict]:
    """Proses satu bangunan dari konsep mentah -> logis -> final 2x."""
    raw = np.asarray(Image.open(spec['src']).convert('RGBA'))
    clean_img = Image.fromarray(flood_remove_bg(raw), 'RGBA')
    cropped = clean_img.crop(clean_img.getbbox())

    lw, lh = spec['logical']
    scale = min((lw - 2.0) / cropped.width, (lh - 2.0) / cropped.height)
    nw, nh = max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))
    small = cropped.resize((nw, nh), Image.Resampling.BOX)

    arr = np.asarray(small).copy()
    arr[..., 3] = np.where(arr[..., 3] >= 120, 255, 0)
    arr[..., 3] = remove_orphan_pixels(arr[..., 3], min_size=3)

    logical = Image.new('RGBA', (lw, lh), (0, 0, 0, 0))
    logical.alpha_composite(Image.fromarray(arr, 'RGBA'), ((lw - nw) // 2, lh - nh))
    q_arr, win_boxes = quantize_logical(np.asarray(logical), spec, max_colors=18)
    q_img = Image.fromarray(q_arr, 'RGBA')
    final = q_img.resize((lw * 2, lh * 2), Image.Resampling.NEAREST)
    final.save(os.path.join(OUT_DIR, spec['out']))
    return final, q_arr, inspect_output(final, spec['chim_box'], win_boxes)


def main() -> None:
    built = {}
    for name, spec in SPECS.items():
        if not os.path.exists(spec['src']):
            print(f'[SKIP] {name}: sumber belum ada ({spec["src"]})')
            continue
        img, log_arr, info = process_one(name, spec)
        built[name] = {'img': img, 'logical': log_arr, 'info': info}

    if 'houseRed' in built:
        brown_log = make_house_brown(built['houseRed']['logical'])
        brown_img = Image.fromarray(brown_log, 'RGBA').resize(
            (SPECS['houseRed']['logical'][0] * 2, SPECS['houseRed']['logical'][1] * 2),
            Image.Resampling.NEAREST,
        )
        brown_img.save(os.path.join(OUT_DIR, 'sp_house_brown_cottage.png'))
        info_br = inspect_output(brown_img, SPECS['houseRed']['chim_box'], built['houseRed']['info']['win_boxes'])
        built['houseBrown'] = {'img': brown_img, 'logical': brown_log, 'info': info_br}

    if len(built) == 6:
        make_lineup(built)
        print('Lineup saved:', LINEUP_PATH)

    for name, b in built.items():
        inf = b['info']
        print(f'\n=== {name} ===')
        print(f"  size={inf['size']}  block_2x2={inf['block_2x2']}  colors={inf['colors']}  chim={inf['chim']}")
        print(f"  TOWN_WIN: {inf['win_boxes']}")
        for idx, (cnt, rows) in enumerate(inf['win_previews']):
            print(f'  win[{idx}] lit_blocks={cnt}:')
            for r in rows:
                print('    ' + r)


if __name__ == '__main__':
    main()
