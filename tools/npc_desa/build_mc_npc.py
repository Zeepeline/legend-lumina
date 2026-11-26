#!/usr/bin/env python3
"""Memproses lembar mentah 5-arah (tools/npc_desa/raw_<id>.png) menjadi sprite sheet NPC 48x48
bergaya MC (hero_mc2 / vl3-vl5): skala piksel tajam, palet <=15 warna, garis tepi (6,1,5),
kepala seragam per arah, idle/talk, animasi kegiatan, dan jalan 8 arah.

Pakai: venv/bin/python tools/npc_desa/build_mc_npc.py [elder woman child ...]
"""
import os
import sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mc2'))
from cleanup import despeckle  # noqa: E402

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
DIR_RAW = os.path.join(ROOT, 'tools', 'npc_desa')
DIR_OUT = os.path.join(ROOT, 'assets', 'img', 'npc')
F = 48
OUT = (6, 1, 5)
DARK_SUM = 85  # jaga rambut cokelat tua tetap berwarna, hanya garis luar gelap -> OUT

SPECS = {
    'girl': {'raw': 'raw_girl.png', 'target_h': 43, 'waist': 30, 'head_h': 17, 'n_colors': 14, 'acts': ['laugh', 'clap']},
    'merchant': {'raw': 'raw_merchant.png', 'target_h': 45, 'waist': 31, 'head_h': 17, 'n_colors': 14, 'acts': ['sweep', 'arrange', 'give']},
    'elder': {'raw': 'raw_elder.png', 'target_h': 44, 'waist': 30, 'head_h': 17, 'n_colors': 14, 'acts': ['sweep', 'read']},
    'woman': {'raw': 'raw_woman.png', 'target_h': 44, 'waist': 30, 'head_h': 17, 'n_colors': 14, 'acts': ['sweep', 'draw']},
    'child': {'raw': 'raw_child.png', 'target_h': 36, 'waist': 34, 'head_h': 15, 'n_colors': 14, 'acts': ['laugh', 'clap']},
    'chick_master': {'raw': 'raw_chick_master.png', 'target_h': 37, 'waist': 34, 'head_h': 15, 'n_colors': 14, 'acts': ['sweep', 'laugh']},
    'vl1': {'raw': 'raw_vl1.png', 'target_h': 44, 'waist': 30, 'head_h': 17, 'n_colors': 14, 'acts': ['draw']},
    'vl2': {'raw': 'raw_vl2.png', 'target_h': 45, 'waist': 31, 'head_h': 17, 'n_colors': 14, 'acts': ['light']},
    'joko': {'raw': 'raw_joko.png', 'target_h': 45, 'waist': 31, 'head_h': 17, 'n_colors': 14, 'acts': ['harvest', 'mill']},
    'wati': {'raw': 'raw_wati.png', 'target_h': 44, 'waist': 30, 'head_h': 17, 'n_colors': 14, 'acts': ['hoe', 'harvest']},
    'darma': {'raw': 'raw_darma.png', 'target_h': 45, 'waist': 31, 'head_h': 17, 'n_colors': 14, 'acts': ['hammer']},
    'bayu': {'raw': 'raw_bayu.png', 'target_h': 44, 'waist': 30, 'head_h': 17, 'n_colors': 14, 'acts': ['arrange', 'sweep']},
    'md1': {'raw': 'raw_md1.png', 'target_h': 45, 'waist': 31, 'head_h': 17, 'n_colors': 14, 'acts': ['mill']},
    'md2': {'raw': 'raw_md2.png', 'target_h': 40, 'waist': 32, 'head_h': 16, 'n_colors': 14, 'acts': ['fish']},
}


def chroma_mask(rgb):
    """Mask latar hijau terang dari tepi gambar + kantong hijau jenuh murni tanpa merusak baju hijau."""
    t = rgb.astype(int)
    H, W = t.shape[:2]
    pure_bg = (t[..., 1] - t[..., 0] > 65) & (t[..., 1] - t[..., 2] > 65) & (t[..., 1] > 115)
    seed = np.zeros((H, W), dtype=bool)
    seed[0, :] = pure_bg[0, :]
    seed[-1, :] = pure_bg[-1, :]
    seed[:, 0] = pure_bg[:, 0]
    seed[:, -1] = pure_bg[:, -1]
    bg = seed | pure_bg
    greenish = (t[..., 1] > t[..., 0] + 18) & (t[..., 1] > t[..., 2] + 18)
    dark = (t.sum(-1) < 150) & ~greenish
    halo_cand = (t[..., 1] > t[..., 0] + 10) & (t[..., 1] > t[..., 2] + 10) & ~dark
    for _ in range(3):
        p = np.pad(bg, 1)
        nbr = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
        bg = bg | (halo_cand & nbr)
    p = np.pad(bg, 1)
    nbr = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    bg = bg | (nbr & (t[..., 1] - t[..., 0] > 35) & (t[..., 1] - t[..., 2] > 35))
    return ~bg


def biggest_component(fg):
    """Pertahankan satu komponen terhubung terbesar (8-arah) pada potongan sprite."""
    ys, xs = np.nonzero(fg)
    if not len(ys):
        return fg
    cy, cx = ys.mean(), xs.mean()
    k = ((ys - cy) ** 2 + (xs - cx) ** 2).argmin()
    seed = np.zeros_like(fg)
    seed[ys[k], xs[k]] = True
    while True:
        p = np.pad(seed, 1)
        nx = fg & (
            seed
            | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
            | p[:-2, :-2] | p[:-2, 2:] | p[2:, :-2] | p[2:, 2:]
        )
        if (nx == seed).all():
            break
        seed = nx
    return seed


def find_bands(proj, min_len=10, merge_gap=4):
    """Temukan rentang kontigu dari proyeksi boolean 1D."""
    spans = []
    in_s = False
    s = 0
    for i, v in enumerate(proj):
        if v and not in_s:
            s = i
            in_s = True
        elif not v and in_s:
            spans.append((s, i - 1))
            in_s = False
    if in_s:
        spans.append((s, len(proj) - 1))
    merged = []
    for a, b in spans:
        if merged and a - merged[-1][1] <= merge_gap:
            merged[-1] = (merged[-1][0], b)
        elif b - a + 1 >= min_len:
            merged.append((a, b))
    return merged


def extract_rows(raw_path):
    """Potong 5 baris arah (SIDE, SE, UP, DOWN, NE) menjadi list crop RGBA."""
    rgb = np.array(Image.open(raw_path).convert('RGB'))
    fg = chroma_mask(rgb)
    rgba = np.zeros((*rgb.shape[:2], 4), dtype=np.uint8)
    rgba[..., :3] = rgb
    rgba[fg, 3] = 255
    row_bands = find_bands(fg.any(1), min_len=40, merge_gap=6)
    assert len(row_bands) == 5, f"{raw_path}: butuh 5 baris, dapat {len(row_bands)}: {row_bands}"
    rows = []
    for y0, y1 in row_bands:
        band_fg = fg[y0:y1 + 1]
        col_bands = find_bands(band_fg.any(0), min_len=18, merge_gap=5)
        crops = []
        for x0, x1 in col_bands:
            sub_fg = band_fg[:, x0:x1 + 1]
            comp = biggest_component(sub_fg)
            ys, xs = np.nonzero(comp)
            if len(ys) < 100:
                continue
            cy0, cy1 = int(ys.min()), int(ys.max())
            cx0, cx1 = int(xs.min()), int(xs.max())
            patch = rgba[y0 + cy0:y0 + cy1 + 1, x0 + cx0:x0 + cx1 + 1].copy()
            patch[~comp[cy0:cy1 + 1, cx0:cx1 + 1]] = 0
            bottom_gap = (y1 - y0) - cy1
            crops.append((patch, bottom_gap))
        rows.append(crops)
    return rows


def eye_score(arr):
    """Hitung seberapa jelas mata gelap vertikal di paruh atas kepala yang diapit kulit."""
    t = arr[:max(4, arr.shape[0] // 2)].astype(int)
    on = t[..., 3] > 0
    sk = on & (t[..., 0] > 165) & (t[..., 1] > 105) & (t[..., 2] < 185)
    dk = on & (t[..., :3].sum(-1) < 200)
    sc = 0
    H, W = t.shape[:2]
    for y, x in zip(*np.nonzero(dk)):
        if 0 < x < W - 1 and sk[y, x - 1] and sk[y, x + 1]:
            sc += 2
            if y + 1 < H and dk[y + 1, x]:
                sc += 3
        elif 0 < x < W - 1 and (sk[y, x - 1] or sk[y, x + 1]):
            sc += 1
    return sc


def outline_score(arr):
    """Pastikan tepi luar berwarna gelap agar outline tidak putus saat downscale nearest."""
    m = arr[..., 3] > 0
    p = np.pad(m, 1)
    edge = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
    if not edge.any():
        return 0.0
    lum = arr[edge, :3].astype(int).sum(-1)
    return float((lum < 210).mean())


def shrink_crop(patch, target_h, ref_raw_h):
    """Downscale nearest-neighbor dengan pencarian fase sub-piksel terbaik untuk mata & outline."""
    scale = target_h / ref_raw_h
    H0, W0 = patch.shape[:2]
    W = max(8, round(W0 * scale))
    H = max(12, round(H0 * scale))
    best = None
    for oy in range(6):
        ys = np.minimum(((np.arange(H) + (oy + 0.5) / 6.0) / scale).astype(int), H0 - 1)
        for ox in range(6):
            xs = np.minimum(((np.arange(W) + (ox + 0.5) / 6.0) / scale).astype(int), W0 - 1)
            b = patch[ys][:, xs]
            score = eye_score(b) * 3.0 + outline_score(b) * 10.0
            if best is None or score > best[0]:
                best = (score, b)
    return best[1]


def quantize_rows(raw_rows, n_colors):
    """Kuantisasi seluruh frame satu NPC ke 1 palet bersih + OUT=(6,1,5)."""
    pixels = []
    for row in raw_rows:
        for arr, _ in row:
            m = arr[..., 3] > 0
            rgb = arr[m, :3].astype(int)
            bright = rgb[rgb.sum(-1) >= DARK_SUM]
            if len(bright):
                pixels.append(bright)
    all_px = np.concatenate(pixels, axis=0).astype(float)
    order = np.argsort(all_px.sum(1))
    idx = np.linspace(0, len(all_px) - 1, n_colors).astype(int)
    C = all_px[order[idx]].copy()
    for _ in range(35):
        d = ((all_px[:, None, :] - C[None, :, :]) ** 2).sum(-1)
        k = d.argmin(1)
        C = np.array([all_px[k == i].mean(0) if (k == i).any() else C[i] for i in range(n_colors)])
    C = np.clip(np.round(C), 0, 255).astype(np.uint8)

    out_rows = []
    for row in raw_rows:
        out_r = []
        for arr, bgap in row:
            b = arr.copy()
            m = b[..., 3] > 0
            rgb = b[..., :3].astype(int)
            dark = m & (rgb.sum(-1) < DARK_SUM)
            lit = m & ~dark
            b[dark, :3] = OUT
            if lit.any():
                d = ((b[lit][:, None, :3].astype(float) - C[None, :, :].astype(float)) ** 2).sum(-1)
                b[lit, :3] = C[d.argmin(1)]
            out_r.append((b, bgap))
        out_rows.append(out_r)
    return out_rows, C


def tidy_cell(a):
    """Buang piksel yatim, bersihkan bintik mixel, pastikan garis tepi luar = OUT."""
    H, W = a.shape[:2]
    t = a[..., :3].astype(int)
    green_shoe = (a[..., 3] > 0) & (t[..., 1] - t[..., 0] > 35) & (t[..., 1] - t[..., 2] > 35)
    green_shoe[:H - 4] = False
    a[green_shoe] = 0
    m = a[..., 3] > 0
    p = np.pad(m, 1)
    n8 = sum(p[1 + y:1 + y + H, 1 + x:1 + x + W] for y in (-1, 0, 1) for x in (-1, 0, 1) if y or x)
    a[m & (n8 <= 1)] = 0
    a = despeckle(a)
    m = a[..., 3] > 0
    p = np.pad(m, 1)
    edge = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
    edge[H - 1] = False
    a[edge, :3] = OUT
    return a


def place_in_cell(arr, bottom_offset, right_profile=False):
    """Tempatkan potongan sprite di sel 48x48, kepala di tengah x=24, kaki menempel ke bawah."""
    c = np.zeros((F, F, 4), dtype=np.uint8)
    h, w = arr.shape[:2]
    head_scan = max(10, round(h * 0.38))
    hd_cols = np.nonzero(arr[:min(h, head_scan), :, 3].any(0))[0]
    if len(hd_cols):
        if right_profile:
            half_hw = 6.5 if h <= 39 else 7.5
            hx = float(hd_cols[-1]) - half_hw
        else:
            hx = (float(hd_cols[0]) + float(hd_cols[-1]) + 1.0) / 2.0
    else:
        hx = w / 2.0
    x0 = min(max(round(F / 2.0 - hx), 0), F - w)
    y_bot = F - bottom_offset
    y0 = y_bot - h
    if y0 < 0:
        arr = arr[-y0:]
        y0 = 0
    c[y0:y0 + arr.shape[0], x0:x0 + w] = arr
    return tidy_cell(c)


def top_y(a):
    ys = np.nonzero(a[..., 3].any(1))[0]
    return int(ys[0]) if len(ys) else F


def bot_y(a):
    ys = np.nonzero(a[..., 3].any(1))[0]
    return int(ys[-1]) if len(ys) else -1


def pick_best_head_idx(cells):
    """Pilih indeks frame dengan skor ketajaman mata terbaik (atau frame 0 bila tampak belakang)."""
    return max(range(len(cells)), key=lambda i: (eye_score(cells[i]), -i))


def unify_head(cells, ref_idx, head_h=17):
    """Seragamkan kepala di seluruh frame satu arah agar wajah & rambut tidak berkedip."""
    R = cells[ref_idx]
    t0 = top_y(R)
    out = []
    for a in cells:
        b = a.copy()
        t = top_y(a)
        h = min(head_h, F - t, F - t0)
        b[:t + h] = 0
        mask = R[t0:t0 + h, :, 3] > 0
        dest = b[t:t + h]
        dest[mask] = R[t0:t0 + h][mask]
        b[t:t + h] = dest
        out.append(tidy_cell(b))
    return out


def ensure_col0_grounded(cells):
    """Putar urutan walk sehingga col 0 menyentuh y=47 (syarat tests/npc_sheets.spec.js)."""
    if bot_y(cells[0]) == F - 1:
        return cells
    for i, a in enumerate(cells):
        if bot_y(a) == F - 1:
            return cells[i:] + cells[:i]
    a = cells[0].copy()
    gap = (F - 1) - bot_y(a)
    if gap > 0:
        b = np.zeros_like(a)
        b[gap:] = a[:F - gap]
        cells[0] = b
    return cells


def make_sym_stand(cells, leg_rows=7):
    """Pilih frame berdiri terbaik (lengan turun simetris) & ratakan kedua kaki di y=47 untuk pose diam."""
    def score(item):
        idx, c = item
        bl = int((c[F - 1, :24, 3] > 0).sum())
        br = int((c[F - 1, 24:, 3] > 0).sum())
        # Hitung simetri lengan kiri-kanan di bagian pinggang agar tidak memilih frame lengan terangkat
        mid_y = max(0, top_y(c) + 14)
        arm_l = int((c[mid_y:F - leg_rows, :24, 3] > 0).sum())
        arm_r = int((c[mid_y:F - leg_rows, 24:, 3] > 0).sum())
        arm_sym = -abs(arm_l - arm_r)
        # Prefer frame dengan kedua kaki dekat lantai dan lengan simetris
        bot_l = int((c[F - 2:, :24, 3] > 0).sum())
        bot_r = int((c[F - 2:, 24:, 3] > 0).sum())
        return min(bl, br) * 20 + min(bot_l, bot_r) * 5 + arm_sym - (1 if idx > 4 else 0)

    best = max(enumerate(cells), key=score)[1].copy()
    bl = int((best[F - 1, :24, 3] > 0).sum())
    br = int((best[F - 1, 24:, 3] > 0).sum())
    leg_y = F - leg_rows
    if bl > br + 1 or (bl >= 2 and br == 0):
        best[leg_y:, 24:] = best[leg_y:, 23::-1][:, :24]
    elif br > bl + 1 or (br >= 2 and bl == 0):
        best[leg_y:, :24] = best[leg_y:, 47:23:-1]
    return tidy_cell(best)


def breathe(a, waist=30):
    b = a.copy()
    up = a[:waist].copy()
    b[:waist] = 0
    b[1:waist + 1] = np.where(up[..., 3:] > 0, up, b[1:waist + 1])
    return tidy_cell(b)


def crouch(a, n=1, leg_rows=7):
    """Turunkan badan di atas betis sebesar n px (kaki tetap di y=47)."""
    b = a.copy()
    cut = F - leg_rows
    up = a[:cut].copy()
    b[:cut] = 0
    b[n:cut + n] = np.where(up[..., 3:] > 0, up, b[n:cut + n])
    return tidy_cell(b)


def find_pal_colors(a):
    """Ambil warna kulit, baju terang, aksen hijau/emas, kayu, gelap dari sel NPC."""
    m = (a[..., 3] > 0) & ~((a[..., :3] == OUT).all(-1))
    cols = [tuple(int(v) for v in c) for c in np.unique(a[m, :3], axis=0)]
    # Kulit sejati: R tinggi tapi tidak merah menyala seperti pita topi (R - G < 72)
    warm = [c for c in cols if c[0] > 165 and c[1] >= 110 and c[0] - c[2] > 28 and c[0] - c[1] < 72]
    if not warm:
        warm = [c for c in cols if c[0] > 165 and c[0] - c[2] > 28]
    skin = max(warm, key=lambda c: c[0] + c[1] * 0.5) if warm else max(cols, key=sum)
    skin_d = min(warm, key=lambda c: c[0] + c[1]) if len(warm) > 1 else skin
    cream = max(cols, key=lambda c: c[0] + c[1] + c[2])
    mid_brown = min(
        [c for c in cols if c[0] >= c[2] + 10 and 90 < sum(c) < 420] or cols,
        key=lambda c: abs(sum(c) - 240),
    )
    greens = [c for c in cols if c[1] >= c[0] and c[1] > c[2] + 8]
    accent = max(greens, key=lambda c: c[1] - c[2]) if greens else (warm[0] if warm else mid_brown)
    dark_brown = min(cols, key=sum)
    return dict(skin=skin, skin_d=skin_d, cream=cream, wood=mid_brown, accent=accent, dark=dark_brown)


def draw_rect_ol(b, pts):
    """Gambar piksel dengan garis tepi OUT otomatis di sekelilingnya."""
    for x, y, _ in pts:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < F and 0 <= ny < F and b[ny, nx, 3] == 0:
                b[ny, nx] = (*OUT, 255)
    for x, y, col in pts:
        if 0 <= x < F and 0 <= y < F:
            b[y, x] = (*col, 255)


def body_metrics(frame):
    """Hitung tinggi badan, leher, dada, dan jarak lengan secara proporsional."""
    t = top_y(frame)
    ch = max(24, F - t)
    neck = min(F - 8, t + round(ch * 0.42))
    chest = min(F - 10, t + round(ch * 0.52))
    leg_rows = 5 if ch <= 39 else 7
    arm_dx = round(ch * 0.13)
    return dict(t=t, ch=ch, neck=neck, chest=chest, leg_rows=leg_rows, arm_dx=arm_dx)


def make_talk_row(id_frame):
    bm = body_metrics(id_frame)
    nod = breathe(id_frame, bm['neck'])
    pal = find_pal_colors(id_frame)
    gest = id_frame.copy()
    hx = 24 - round(bm['ch'] * 0.21)
    hy = min(F - bm['leg_rows'] - 3, bm['chest'])
    pts = [
        (hx, hy, pal['cream']), (hx + 1, hy, pal['cream']),
        (hx, hy - 1, pal['skin']), (hx + 1, hy - 1, pal['skin']),
        (hx, hy - 2, pal['skin']),
    ]
    draw_rect_ol(gest, pts)
    return [id_frame, nod, tidy_cell(gest), nod]


def happy_eyes_side(b):
    """Ubah mata vertikal samping menjadi garis lengkung senyum bahagia."""
    t = top_y(b)
    for y in range(t + 5, min(F, t + 18)):
        for x in range(18, 34):
            if tuple(b[y, x, :3]) == OUT and b[y, x - 1, 3] and tuple(b[y, x - 1, :3]) != OUT:
                if b[y, x + 1, 3] and tuple(b[y, x + 1, :3]) != OUT:
                    skin_c = b[y, x - 1]
                    if tuple(b[y + 1, x, :3]) == OUT:
                        b[y + 1, x] = skin_c
                    if x + 1 < F and tuple(b[y, x + 1, :3]) != OUT:
                        b[y, x + 1] = (*OUT, 255)
                    return b
    return b


def draw_broom(b, hx, hy, bx, by, pal):
    """Gambar sapu ijuk piksel tegas di depan badan menggunakan palet NPC."""
    n = max(1, abs(bx - hx), abs(by - hy))
    pts = []
    for k in range(-3, n + 1):
        x = round(hx + (bx - hx) * k / n)
        y = round(hy + (by - hy) * k / n)
        pts.append((x, y, pal['wood']))
    for dy in range(4):
        w = 1 + (dy + 1) // 2
        for dx in range(-w, w + 1):
            col = pal['dark'] if dy == 0 else (pal['cream'] if (dx + dy) % 2 == 0 else pal['skin_d'])
            pts.append((bx + dx, min(F - 2, by + dy), col))
    draw_rect_ol(b, pts)
    draw_rect_ol(b, [
        (hx - 2, hy, pal['cream']), (hx - 1, hy, pal['cream']),
        (hx, hy, pal['skin']), (hx + 1, hy, pal['skin']),
        (hx, hy + 1, pal['skin_d']),
    ])
    return tidy_cell(b)


def act_laugh(ctx):
    is_side, waist = ctx['IS'], ctx['waist']
    pal = find_pal_colors(is_side)
    bm = body_metrics(is_side)
    l1 = happy_eyes_side(crouch(is_side, 1, bm['leg_rows']))
    l2 = happy_eyes_side(breathe(is_side, waist))
    cx = 24 + bm['arm_dx']
    cy = body_metrics(l1)['chest']
    draw_rect_ol(l1, [
        (cx - 1, cy, pal['cream']), (cx, cy, pal['skin']),
        (cx + 1, cy - 1, pal['skin']), (cx + 1, cy, pal['skin_d']),
    ])
    return [is_side, tidy_cell(l1), tidy_cell(l2), breathe(is_side, waist)]


def act_clap(ctx):
    is_side, waist = ctx['IS'], ctx['waist']
    pal = find_pal_colors(is_side)
    bm = body_metrics(is_side)

    def with_clap(base, open_gap=0):
        b = base.copy()
        cy = min(F - bm['leg_rows'] - 4, body_metrics(b)['chest'])
        cx = 24 + bm['arm_dx'] + open_gap
        pts = [
            (cx - 3, cy + 1, pal['cream']), (cx - 2, cy + 1, pal['cream']), (cx - 1, cy, pal['cream']),
            (cx, cy - 1, pal['skin']), (cx + 1, cy - 1, pal['skin']),
            (cx, cy, pal['skin']), (cx + 1, cy, pal['skin_d']), (cx, cy + 1, pal['skin_d']),
        ]
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    return [with_clap(is_side, 1), with_clap(crouch(is_side, 1, bm['leg_rows']), 0), with_clap(is_side, 1), is_side]


def act_sweep(ctx):
    is_side, reach, waist = ctx['IS'], ctx['reach_side'], ctx['waist']
    pal = find_pal_colors(is_side)
    bm = body_metrics(reach)
    hx = 24 + bm['arm_dx'] - 1
    hy = bm['chest']
    lr = bm['leg_rows']
    return [
        draw_broom(reach.copy(), hx, hy, hx + 7, F - 5, pal),
        draw_broom(crouch(reach, 1, lr), hx + 2, hy + 1, hx + 10, F - 5, pal),
        draw_broom(reach.copy(), hx - 1, hy, hx + 4, F - 5, pal),
        draw_broom(crouch(reach, 1, lr), hx + 2, hy + 1, hx + 11, F - 5, pal),
        draw_broom(breathe(reach, waist), hx, hy - 1, hx + 6, F - 7, pal),
        is_side,
    ]


def act_arrange(ctx):
    id_down, waist = ctx['ID'], ctx['waist']
    pal = find_pal_colors(id_down)
    bm = body_metrics(id_down)

    def with_tray(base, dx=0, dy=0):
        b = base.copy()
        y = min(F - bm['leg_rows'] - 5, body_metrics(b)['chest'] + 2 + dy)
        x = 24 + dx
        pts = []
        for ix in range(-2, 3):
            pts.append((x + ix, y, pal['accent'] if ix in (-1, 1) else pal['cream']))
            pts.append((x + ix, y + 1, pal['wood']))
            pts.append((x + ix, y + 2, pal['dark']))
        pts += [(x - 3, y + 1, pal['skin']), (x + 3, y + 1, pal['skin'])]
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    return [
        id_down,
        with_tray(id_down, -1, 0),
        with_tray(breathe(id_down, bm['neck']), 0, 1),
        with_tray(id_down, 1, 0),
        with_tray(breathe(id_down, waist), 0, 0),
        id_down,
    ]


def act_give(ctx):
    is_side, reach = ctx['IS'], ctx['reach_side']
    pal = find_pal_colors(is_side)
    bm = body_metrics(reach)

    def with_parcel(base, dx=0):
        b = base.copy()
        y = min(F - bm['leg_rows'] - 5, body_metrics(b)['chest'])
        x = 24 + bm['arm_dx'] + 1 + dx
        pts = [
            (x - 3, y, pal['cream']), (x - 2, y, pal['cream']),
            (x - 1, y, pal['skin']), (x, y, pal['skin']),
            (x + 1, y - 2, pal['cream']), (x + 2, y - 2, pal['accent']), (x + 3, y - 2, pal['cream']),
            (x + 1, y - 1, pal['wood']), (x + 2, y - 1, pal['wood']), (x + 3, y - 1, pal['wood']),
            (x + 1, y, pal['cream']), (x + 2, y, pal['cream']), (x + 3, y, pal['cream']),
            (x + 1, y + 1, pal['skin_d']), (x + 2, y + 1, pal['skin_d']),
        ]
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    return [is_side, with_parcel(reach, 0), with_parcel(breathe(reach, bm['neck']), 1), is_side]


def act_read(ctx):
    """Membaca kitab terbuka di depan dada (Down, 4 frame)."""
    id_down = ctx['ID']
    pal = find_pal_colors(id_down)
    bm = body_metrics(id_down)

    def with_book(base, dy=0):
        b = base.copy()
        y = min(F - bm['leg_rows'] - 5, body_metrics(b)['chest'] + 1 + dy)
        pts = []
        for ix in range(-3, 4):
            if ix == 0:
                pts += [(24, y, pal['wood']), (24, y + 1, pal['wood']), (24, y + 2, pal['dark'])]
            else:
                pts += [(24 + ix, y, pal['cream']), (24 + ix, y + 1, pal['cream']), (24 + ix, y + 2, pal['wood'])]
        pts += [(20, y + 1, pal['skin']), (28, y + 1, pal['skin'])]
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    b0 = with_book(id_down, 0)
    b1 = with_book(breathe(id_down, bm['neck']), 1)
    return [id_down, b0, b1, b0]


def act_draw(ctx):
    """Menimba air sumur (Up, 6 frame): mengulur tali, menarik naik ember kayu."""
    iu, waist = ctx['IU'], ctx['waist']
    pal = find_pal_colors(iu)
    bm = body_metrics(iu)
    lr = bm['leg_rows']

    def with_bucket(base, lift=0, rope_len=6):
        b = base.copy()
        hx, hy = 33, max(bm['t'] + 10, body_metrics(b)['chest'] - lift)
        pts = [(hx - 2, hy, pal['cream']), (hx - 1, hy, pal['skin']), (hx, hy, pal['skin'])]
        for ry in range(1, rope_len):
            pts.append((hx + 1, min(F - 3, hy + ry), pal['cream']))
        by = min(F - 5, hy + rope_len)
        for dy in range(4):
            for dx in range(4):
                col = pal['cream'] if dy == 0 and dx in (1, 2) else (pal['wood'] if dy < 3 else pal['dark'])
                pts.append((hx + dx, by + dy, col))
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    return [
        with_bucket(iu, lift=0, rope_len=6),
        with_bucket(crouch(iu, 1, lr), lift=-1, rope_len=8),
        with_bucket(breathe(iu, waist), lift=1, rope_len=5),
        with_bucket(iu, lift=3, rope_len=3),
        with_bucket(crouch(iu, 1, lr), lift=1, rope_len=5),
        iu,
    ]


def act_light(ctx):
    """Menyalakan lentera dengan tongkat penyulut panjang (Up, 6 frame)."""
    iu, waist = ctx['IU'], ctx['waist']
    pal = find_pal_colors(iu)
    bm = body_metrics(iu)
    lr = bm['leg_rows']

    def with_torch(base, raise_dy=0):
        b = base.copy()
        t_cur = top_y(b)
        hx = 31
        hy = max(t_cur + 6, body_metrics(b)['chest'] - raise_dy)
        pts = [(hx - 1, hy + 1, pal['cream']), (hx, hy, pal['skin'])]
        tx, ty = min(F - 3, hx + 4), max(2, hy - 12 - raise_dy // 2)
        n = max(1, abs(tx - hx), abs(ty - hy))
        for k in range(1, n + 1):
            px = round(hx + (tx - hx) * k / n)
            py = round(hy + (ty - hy) * k / n)
            pts.append((px, py, pal['wood']))
        # Kepala bara hangat di ujung tongkat penyulut
        pts += [
            (tx, ty - 1, pal['cream']), (tx + 1, ty - 1, pal['skin']),
            (tx, ty, pal['skin']), (tx + 1, ty, pal['skin_d']),
        ]
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    return [
        with_torch(iu, 0),
        with_torch(breathe(iu, waist), 3),
        with_torch(iu, 5),
        with_torch(crouch(iu, 1, lr), 4),
        with_torch(breathe(iu, waist), 2),
        iu,
    ]


def act_hoe(ctx):
    """Mencangkul tanah ke depan (Side kanan, 4 frame cocok NPC_SHEET_SEQ.hoe)."""
    is_side, reach = ctx['IS'], ctx['reach_side']
    pal = find_pal_colors(is_side)
    bm = body_metrics(reach)
    lr = bm['leg_rows']

    def with_hoe(base, hx, hy, bx, by):
        b = base.copy()
        pts = [(hx - 1, hy, pal['cream']), (hx, hy, pal['skin'])]
        n = max(1, abs(bx - hx), abs(by - hy))
        for k in range(n + 1):
            pts.append((round(hx + (bx - hx) * k / n), round(hy + (by - hy) * k / n), pal['wood']))
        # Bilah cangkul besi gelap mengarah ke bawah/dalam
        for d in range(4):
            pts.append((bx + (0 if by < hy else 1), min(F - 2, by + d), pal['dark'] if d < 2 else pal['cream']))
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    t = bm['t']
    return [
        with_hoe(is_side, 27, t + 23, 35, t + 26),
        with_hoe(breathe(reach, ctx['waist']), 28, t + 16, 36, t + 10),
        with_hoe(crouch(reach, 1, lr), 29, t + 25, 38, F - 5),
        with_hoe(is_side, 28, t + 24, 36, F - 7),
    ]


def act_harvest(ctx):
    """Memanen hasil kebun (Side kanan, 4 frame cocok NPC_SHEET_SEQ.harvest)."""
    is_side, reach = ctx['IS'], ctx['reach_side']
    pal = find_pal_colors(is_side)
    bm = body_metrics(is_side)
    lr = bm['leg_rows']

    def with_crop(base, dx=0, dy=0):
        b = base.copy()
        cx = 29 + dx
        cy = min(F - 4, body_metrics(b)['chest'] + dy)
        pts = [
            (cx - 2, cy, pal['skin']), (cx - 1, cy - 1, pal['wood']), (cx, cy - 1, pal['cream']),
            (cx + 1, cy - 1, pal['accent']), (cx, cy, pal['cream']), (cx + 1, cy, pal['wood']),
            (cx + 2, cy, pal['accent']), (cx + 1, cy + 1, pal['wood']),
        ]
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    return [
        crouch(reach, 1, lr),
        with_crop(crouch(reach, 2, lr), 1, 7),
        with_crop(crouch(is_side, 1, lr), 0, 2),
        with_crop(is_side, -1, -1),
    ]


def act_mill(ctx):
    """Mengangkat dan memanggul karung tepung (Side kanan, 6 frame)."""
    is_side, reach, waist = ctx['IS'], ctx['reach_side'], ctx['waist']
    pal = find_pal_colors(is_side)
    bm = body_metrics(is_side)
    lr = bm['leg_rows']

    def with_sack(base, sx, sy):
        b = base.copy()
        pts = []
        for dy in range(6):
            for dx in range(4):
                col = pal['dark'] if (dy == 0 and dx in (1, 2)) else (pal['wood'] if dy in (1, 5) else pal['cream'])
                pts.append((sx + dx, min(F - 3, sy + dy), col))
        pts += [(sx - 1, sy + 2, pal['skin']), (sx, sy + 3, pal['skin'])]
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    cy = bm['chest']
    return [
        crouch(reach, 1, lr),
        with_sack(crouch(reach, 2, lr), 30, cy + 2),
        with_sack(is_side, 29, cy - 2),
        with_sack(breathe(is_side, waist), 29, cy - 3),
        with_sack(crouch(is_side, 1, lr), 30, cy + 1),
        is_side,
    ]


def act_hammer(ctx):
    """Memalu ke depan (Down, 4 frame cocok LIFE_ANIM_FACE.hammer & NPC_SHEET_SEQ.hammer)."""
    id_down = ctx['ID']
    pal = find_pal_colors(id_down)
    bm = body_metrics(id_down)
    lr = bm['leg_rows']

    def with_hammer(base, hy, head_dy=-5):
        b = base.copy()
        hx = 14
        ty = max(4, hy + head_dy)
        pts = [(hx, hy, pal['skin']), (hx + 1, hy, pal['cream'])]
        n = max(1, abs(ty - hy))
        for k in range(1, n + 1):
            pts.append((hx, round(hy + (ty - hy) * k / n), pal['wood']))
        for dx in range(-2, 3):
            for dy in (0, 1):
                pts.append((hx + dx, ty + dy, pal['dark'] if dy == 1 else pal['cream']))
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    cy = bm['chest']
    return [
        with_hammer(id_down, cy, -5),
        with_hammer(breathe(id_down, bm['neck']), cy - 5, -6),
        with_hammer(crouch(id_down, 1, lr), cy + 3, 5),
        with_hammer(id_down, cy + 1, -3),
    ]


def act_fish(ctx):
    """Memancing dengan joran bambu (Side kanan, 6 frame)."""
    is_side, reach, waist = ctx['IS'], ctx['reach_side'], ctx['waist']
    pal = find_pal_colors(is_side)
    bm = body_metrics(is_side)
    lr = bm['leg_rows']

    def with_rod(base, hx, hy, tx, ty):
        b = base.copy()
        pts = [(hx - 1, hy, pal['cream']), (hx, hy, pal['skin'])]
        n = max(1, abs(tx - hx), abs(ty - hy))
        for k in range(1, n + 1):
            pts.append((round(hx + (tx - hx) * k / n), round(hy + (ty - hy) * k / n), pal['wood']))
        # Tali pancing tipis dari ujung joran
        for ly in range(ty + 1, min(F - 2, ty + 14)):
            pts.append((tx, ly, pal['cream']))
        draw_rect_ol(b, pts)
        return tidy_cell(b)

    cy = bm['chest']
    return [
        with_rod(is_side, 27, cy, 40, max(4, cy - 11)),
        with_rod(breathe(reach, waist), 26, cy - 1, 38, max(3, cy - 13)),
        with_rod(reach, 28, cy, 42, max(6, cy - 8)),
        with_rod(breathe(is_side, waist), 28, cy + 1, 42, max(7, cy - 7)),
        with_rod(crouch(is_side, 1, lr), 26, cy - 2, 39, max(2, cy - 14)),
        with_rod(is_side, 27, cy, 40, max(4, cy - 11)),
    ]


ACT_BUILDERS = {
    'laugh': act_laugh,
    'clap': act_clap,
    'sweep': act_sweep,
    'arrange': act_arrange,
    'give': act_give,
    'read': act_read,
    'draw': act_draw,
    'light': act_light,
    'hoe': act_hoe,
    'harvest': act_harvest,
    'mill': act_mill,
    'hammer': act_hammer,
    'fish': act_fish,
}


def build_one(npc_id):
    sp = SPECS[npc_id]
    raw_rows = extract_rows(os.path.join(DIR_RAW, sp['raw']))
    down_med_h = float(np.median([arr.shape[0] for arr, _ in raw_rows[3]]))
    resamp_rows = []
    for row in raw_rows:
        row_h = float(np.median([arr.shape[0] for arr, _ in row]))
        ref_h = 0.7 * row_h + 0.3 * down_med_h
        max_bgap = min(g for _, g in row)
        r_list = []
        for arr, bgap in row:
            sm = shrink_crop(arr, sp['target_h'], ref_h)
            rel_gap = round((bgap - max_bgap) * (sp['target_h'] / ref_h))
            rel_gap = min(max(rel_gap, 0), 2)
            r_list.append((sm, rel_gap))
        resamp_rows.append(r_list)

    q_rows, _ = quantize_rows(resamp_rows, sp['n_colors'])
    dirs_cells = []
    for r_i, row in enumerate(q_rows):
        is_side = (r_i == 0)
        cells = [place_in_cell(arr, bgap, right_profile=is_side) for arr, bgap in row]
        ref_idx = pick_best_head_idx(cells) if r_i not in (2, 4) else 0
        cells = unify_head(cells, ref_idx, head_h=sp['head_h'])
        cells = ensure_col0_grounded(cells)
        dirs_cells.append(cells)

    SIDE, SE, UP, DOWN, NE = dirs_cells

    def pick_side_stand(cells):
        grounded = [c for c in cells if bot_y(c) == F - 1] or cells
        return min(grounded, key=lambda c: int((c[-4:, :, 3] > 0).sum(1).max()))

    leg_rows = 5 if sp['target_h'] <= 39 else 7
    ID = make_sym_stand(DOWN, leg_rows=leg_rows)
    IS = pick_side_stand(SIDE)
    IU = make_sym_stand(UP, leg_rows=leg_rows)
    waist = sp['waist']

    idle_row = [ID, breathe(ID, waist), IS, breathe(IS, waist), IU, breathe(IU, waist)]
    talk_row = make_talk_row(ID)
    reach_side = max(SIDE, key=lambda c: int(np.nonzero(c[top_y(c) + 12:top_y(c) + 28, :, 3].any(0))[0].max()))
    ctx = dict(ID=ID, IS=IS, IU=IU, reach_side=reach_side, waist=waist)
    acts_rows = [ACT_BUILDERS[a](ctx) for a in sp['acts']]

    sheet_rows = [DOWN, UP, SIDE, idle_row, talk_row, *acts_rows, SE, NE]
    sheet = np.zeros((F * len(sheet_rows), F * 8, 4), dtype=np.uint8)
    for r, row in enumerate(sheet_rows):
        for c, fr in enumerate(row[:8]):
            sheet[r * F:(r + 1) * F, c * F:(c + 1) * F] = fr

    colors = {tuple(int(v) for v in p) for p in sheet[sheet[..., 3] > 0][:, :3]}
    assert len(colors) <= 16, f"{npc_id}: terlalu banyak warna ({len(colors)})"
    for r in range(len(sheet_rows)):
        cell0 = sheet[r * F:(r + 1) * F, :F]
        assert int((cell0[..., 3] > 0).sum()) >= 80, f"{npc_id}: baris {r} col 0 kosong"
        if r < 3:
            assert int((cell0[F - 1, :, 3] > 0).sum()) > 0, f"{npc_id}: kaki baris {r} tidak sentuh y=47"

    out_path = os.path.join(DIR_OUT, f'npc_sheet_{npc_id}.png')
    Image.fromarray(sheet).save(out_path)
    print(f"Saved {out_path} size={sheet.shape[1]}x{sheet.shape[0]} rows={len(sheet_rows)} colors={len(colors)}")
    return out_path


def make_comparison_preview(out_png):
    """Buat pratinjau 3x berdampingan: hero_mc2, vl3, girl, merchant."""
    mc = Image.open(os.path.join(ROOT, 'assets', 'img', 'hero', 'hero_mc2.png')).convert('RGBA')
    vl3 = Image.open(os.path.join(DIR_OUT, 'npc_sheet_vl3.png')).convert('RGBA')
    girl = Image.open(os.path.join(DIR_OUT, 'npc_sheet_girl.png')).convert('RGBA')
    merc = Image.open(os.path.join(DIR_OUT, 'npc_sheet_merchant.png')).convert('RGBA')

    crop_mc = lambda r, c=0: mc.crop((c * 64 + 8, r * 56 + 8, c * 64 + 56, r * 56 + 56))
    crop48 = lambda im, r, c=0: im.crop((c * 48, r * 48, (c + 1) * 48, (r + 1) * 48))

    cols_frames = [
        [crop_mc(0, 0), crop_mc(4, 0), crop_mc(2, 0), crop_mc(47, 0), crop_mc(43, 1), crop_mc(11, 1)],
        [crop48(vl3, 3, 0), crop48(vl3, 3, 2), crop48(vl3, 3, 4), crop48(vl3, 6, 0), crop48(vl3, 4, 2), crop48(vl3, 5, 1)],
        [crop48(girl, 3, 0), crop48(girl, 3, 2), crop48(girl, 3, 4), crop48(girl, 7, 0), crop48(girl, 5, 1), crop48(girl, 6, 1)],
        [crop48(merc, 3, 0), crop48(merc, 3, 2), crop48(merc, 3, 4), crop48(merc, 8, 0), crop48(merc, 5, 1), crop48(merc, 6, 2)],
    ]
    cw, ch = 48 * 4, 48 * 6
    canvas = Image.new('RGBA', (cw, ch), (112, 146, 94, 255))
    arr = np.array(canvas)
    for r in range(6):
        arr[(r + 1) * 48 - 1, :, :3] = (92, 124, 78)
    canvas = Image.fromarray(arr)
    for ci, frames in enumerate(cols_frames):
        for ri, fr in enumerate(frames):
            canvas.alpha_composite(fr, (ci * 48, ri * 48))
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    canvas.resize((cw * 3, ch * 3), Image.NEAREST).save(out_png)
    print(f"Saved preview {out_png} size={cw*3}x{ch*3}")


def make_village_preview(out_png):
    """Pratinjau 3x seluruh NPC Desa Lumina baru (hero_mc2 + 8 NPC) pada 4 baris: Down, Side, Up, Kegiatan."""
    mc = Image.open(os.path.join(ROOT, 'assets', 'img', 'hero', 'hero_mc2.png')).convert('RGBA')
    crop_mc = lambda r, c=0: mc.crop((c * 64 + 8, r * 56 + 8, c * 64 + 56, r * 56 + 56))
    crop48 = lambda im, r, c=0: im.crop((c * 48, r * 48, (c + 1) * 48, (r + 1) * 48))

    ids = [
        ('girl', 5, 1), ('merchant', 5, 1), ('elder', 6, 2), ('woman', 5, 1),
        ('child', 5, 1), ('chick_master', 5, 1), ('vl1', 5, 2), ('vl2', 5, 2),
    ]
    cols = [[crop_mc(0, 0), crop_mc(4, 0), crop_mc(2, 0), crop_mc(11, 1)]]
    for nid, ar, ac in ids:
        im = Image.open(os.path.join(DIR_OUT, f'npc_sheet_{nid}.png')).convert('RGBA')
        cols.append([crop48(im, 3, 0), crop48(im, 3, 2), crop48(im, 3, 4), crop48(im, ar, ac)])

    cw, ch = 48 * len(cols), 48 * 4
    canvas = Image.new('RGBA', (cw, ch), (112, 146, 94, 255))
    arr = np.array(canvas)
    for r in range(4):
        arr[(r + 1) * 48 - 1, :, :3] = (92, 124, 78)
    canvas = Image.fromarray(arr)
    for ci, frames in enumerate(cols):
        for ri, fr in enumerate(frames):
            canvas.alpha_composite(fr, (ci * 48, ri * 48))
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    canvas.resize((cw * 3, ch * 3), Image.NEAREST).save(out_png)
    print(f"Saved village preview {out_png} size={cw*3}x{ch*3}")


def make_meadow_preview(out_png):
    """Pratinjau 3x NPC Padang Angin & Desa Kincir (hero_mc2 + 6 NPC) pada 4 baris: Down, Side, Up, Kegiatan."""
    mc = Image.open(os.path.join(ROOT, 'assets', 'img', 'hero', 'hero_mc2.png')).convert('RGBA')
    crop_mc = lambda r, c=0: mc.crop((c * 64 + 8, r * 56 + 8, c * 64 + 56, r * 56 + 56))
    crop48 = lambda im, r, c=0: im.crop((c * 48, r * 48, (c + 1) * 48, (r + 1) * 48))

    ids = [('joko', 5, 3), ('wati', 5, 2), ('darma', 5, 2), ('bayu', 5, 2), ('md1', 5, 2), ('md2', 5, 2)]
    cols = [[crop_mc(0, 0), crop_mc(4, 0), crop_mc(2, 0), crop_mc(11, 1)]]
    for nid, ar, ac in ids:
        im = Image.open(os.path.join(DIR_OUT, f'npc_sheet_{nid}.png')).convert('RGBA')
        cols.append([crop48(im, 3, 0), crop48(im, 3, 2), crop48(im, 3, 4), crop48(im, ar, ac)])

    cw, ch = 48 * len(cols), 48 * 4
    canvas = Image.new('RGBA', (cw, ch), (112, 146, 94, 255))
    arr = np.array(canvas)
    for r in range(4):
        arr[(r + 1) * 48 - 1, :, :3] = (92, 124, 78)
    canvas = Image.fromarray(arr)
    for ci, frames in enumerate(cols):
        for ri, fr in enumerate(frames):
            canvas.alpha_composite(fr, (ci * 48, ri * 48))
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    canvas.resize((cw * 3, ch * 3), Image.NEAREST).save(out_png)
    print(f"Saved meadow preview {out_png} size={cw*3}x{ch*3}")


if __name__ == '__main__':
    targets = [a for a in sys.argv[1:] if not a.startswith('-')] or list(SPECS.keys())
    for nid in targets:
        build_one(nid)
    make_comparison_preview(
        '/Users/herlambang/.gemini/antigravity/brain/30b89580-cd38-43fd-a825-dd019a0652b0/npc_preview_3x.png'
    )
    make_village_preview(
        '/Users/herlambang/.gemini/antigravity/brain/30b89580-cd38-43fd-a825-dd019a0652b0/npc_desa_all_3x.png'
    )
    make_meadow_preview(
        '/Users/herlambang/.gemini/antigravity/brain/30b89580-cd38-43fd-a825-dd019a0652b0/npc_meadow_all_3x.png'
    )
