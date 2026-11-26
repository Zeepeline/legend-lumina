"""Build assets/img/hero/hero_mc2_slave.png (256x2856, 4x51 cells of 64x56)."""
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
DIR = Path(__file__).resolve().parent
OUT_PNG = ROOT / 'assets/img/hero/hero_mc2_slave.png'
REF_MC2 = ROOT / 'assets/img/hero/hero_mc2.png'
CMP_PNG = Path('/Users/herlambang/.gemini/antigravity/brain/30b89580-cd38-43fd-a825-dd019a0652b0/mc_slave_atlas_3x.png')

FW, FH = 64, 56
ROWS_TOTAL = 51
OUT_COL = (6, 1, 5)
KEEP_LIGHT = (216, 222, 223)
KEEP_MID = (173, 180, 191)
KEEP = {KEEP_LIGHT, KEEP_MID}

HERO_ROW = {
    'idle_down': 0, 'walk_down': 1, 'idle_up': 2, 'walk_up': 3, 'idle_side': 4,
    'walk_side_a': 5, 'walk_side': 6, 'atk1_down': 7, 'atk2_down': 8, 'atk1_up': 9,
    'atk2_up': 10, 'atk1_side': 11, 'atk2_side': 12, 'atk3_down': 13, 'atk3_up': 14,
    'atk3_side': 15, 'heavy_down': 16, 'heavy_up': 17, 'heavy_side': 18,
    'roll_down': 19, 'roll_up': 20, 'roll_side': 21, 'hurt': 22, 'die': 23,
    'rise': 24, 'cast_down': 25, 'cast_up': 26, 'cast_side': 27, 'bow_down': 28,
    'bow_side_a': 29, 'bow_side': 30, 'bow_up': 31, 'fish_cast': 32,
    'fish_pull': 33, 'pick': 34, 'hoe': 35, 'cheer': 36, 'cheer_b': 37,
    'sleep': 38,
}


def chroma_mask(rgb):
    """Return boolean foreground mask removing #00FF00 chroma safely around olive hair."""
    r = rgb[:, :, 0].astype(np.int32)
    g = rgb[:, :, 1].astype(np.int32)
    b = rgb[:, :, 2].astype(np.int32)
    pure_bg = (g - r > 52) & (g - b > 52) & (g > 45)
    # Remove 1px green halo (both bright and dark-green JPEG edge fringe) touching bg
    bg = pure_bg.copy()
    dil = ndimage.binary_dilation(bg, iterations=1)
    bright_halo = dil & (~bg) & (g - r > 26) & (g - b > 26) & ((r + g + b) >= 120)
    dark_halo = dil & (~bg) & (g - r > 28) & (g - b > 28) & (r < 30) & (b < 30)
    bg = bg | bright_halo | dark_halo
    return ~bg


def spans_1d(mask_1d, max_gap=4, min_len=8):
    """Find contiguous True spans merging small gaps."""
    idx = np.where(mask_1d)[0]
    if len(idx) == 0:
        return []
    spans = []
    s = e = int(idx[0])
    for v in idx[1:]:
        v = int(v)
        if v - e <= max_gap + 1:
            e = v
        else:
            if e - s + 1 >= min_len:
                spans.append((s, e + 1))
            s = e = v
    if e - s + 1 >= min_len:
        spans.append((s, e + 1))
    return spans


def extract_grid_cells(path, expected_cols_per_row, min_row_gap=18, merge_col_gap=12, force_n_cols=None):
    """Load sheet, remove chroma, extract tight RGBA patches per row."""
    rgb = np.array(Image.open(path).convert('RGB'))
    fg = chroma_mask(rgb)
    # Remove tiny foreground noise blobs before projection
    lbl, nlbl = ndimage.label(fg, structure=np.ones((3, 3), dtype=bool))
    if nlbl:
        sizes = np.bincount(lbl.ravel())
        keep_lbl = sizes >= 25
        keep_lbl[0] = False
        fg = keep_lbl[lbl]
    rbands = spans_1d(fg.any(axis=1), max_gap=min_row_gap, min_len=24)
    print(f'{path.name}: shape={rgb.shape[1]}x{rgb.shape[0]}, row_bands={len(rbands)} -> {rbands}')
    rows = []
    for ri, (y0, y1) in enumerate(rbands):
        sub_fg = fg[y0:y1, :]
        exp_c = expected_cols_per_row[ri] if ri < len(expected_cols_per_row) else expected_cols_per_row[-1]
        if force_n_cols:
            # Split cleanly using vertical valleys near equal columns to preserve detached smears
            w = rgb.shape[1]
            proj = sub_fg.sum(axis=0)
            cuts = [0]
            for c in range(1, exp_c):
                mid = int(round(w * c / exp_c))
                lo, hi = max(1, mid - w // (exp_c * 3)), min(w - 1, mid + w // (exp_c * 3))
                best = lo + int(np.argmin(proj[lo:hi]))
                cuts.append(best)
            cuts.append(w)
            cspans = [(cuts[c], cuts[c + 1]) for c in range(exp_c)]
        else:
            gap = merge_col_gap
            cspans = spans_1d(sub_fg.any(axis=0), max_gap=gap, min_len=14)
            # Adjust gap slightly if slight under/over split
            if len(cspans) != exp_c:
                for gtry in (6, 8, 10, 14, 18, 22, 4, 2):
                    cand = spans_1d(sub_fg.any(axis=0), max_gap=gtry, min_len=14)
                    if len(cand) == exp_c:
                        cspans = cand
                        break
        cells = []
        for x0, x1 in cspans:
            m = sub_fg[:, x0:x1]
            ys, xs = np.where(m)
            if len(ys) == 0:
                cells.append(np.zeros((10, 10, 4), dtype=np.uint8))
                continue
            ty0, ty1 = int(ys.min()), int(ys.max()) + 1
            tx0, tx1 = int(xs.min()), int(xs.max()) + 1
            patch = np.zeros((ty1 - ty0, tx1 - tx0, 4), dtype=np.uint8)
            patch[:, :, :3] = rgb[y0 + ty0:y0 + ty1, x0 + tx0:x0 + tx1]
            patch[:, :, 3] = np.where(m[ty0:ty1, tx0:tx1], 255, 0)
            cells.append(patch)
        print(f'  row {ri}: {len(cells)} cells (expected {exp_c}), h={[c.shape[0] for c in cells]}, w={[c.shape[1] for c in cells]}')
        rows.append(cells)
    return rows


def detect_smear_mask(patch):
    """Detect bright neutral silver/white smear pixels in slash patches."""
    a = patch[:, :, 3] > 0
    r = patch[:, :, 0].astype(np.int32)
    g = patch[:, :, 1].astype(np.int32)
    b = patch[:, :, 2].astype(np.int32)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    # Neutral white/silver crescent arcs (much brighter & flatter chroma than beige burlap/grey steel)
    light = a & (mn >= 205) & ((mx - mn) <= 22)
    mid = a & (~light) & (mn >= 165) & (mx <= 215) & ((mx - mn) <= 24)
    # Keep mid only if adjacent/connected to light smear so inner iron shackles aren't turned into smear
    if np.any(light):
        near_light = ndimage.binary_dilation(light, iterations=4)
        mid = mid & near_light
    else:
        mid = np.zeros_like(light)
    return light, mid


def shrink_nearest(patch, scale, is_slash=False):
    """Downsample RGBA patch by `scale` cleanly preserving crisp edges, eyes, and smears."""
    h, w = patch.shape[:2]
    tw = max(4, int(round(w * scale)))
    th = max(4, int(round(h * scale)))
    step = 1.0 / scale

    light_m, mid_m = detect_smear_mask(patch) if is_slash else (np.zeros((h, w), bool), np.zeros((h, w), bool))

    # Pick phase (dx, dy) maximizing interior dark eye/line preservation & alpha coverage
    best = None
    best_score = -1e9
    rgb = patch[:, :, :3].astype(np.int32)
    alpha = patch[:, :, 3] > 128
    dark_px = alpha & (rgb.max(axis=2) < 90)
    for dy_f in (0.35, 0.5, 0.65):
        ys = np.clip(np.round((np.arange(th) + dy_f) * step - 0.5).astype(int), 0, h - 1)
        for dx_f in (0.35, 0.5, 0.65):
            xs = np.clip(np.round((np.arange(tw) + dx_f) * step - 0.5).astype(int), 0, w - 1)
            sub_a = alpha[np.ix_(ys, xs)]
            # Score: dark detail preservation in head area + solid body coverage
            head_rows = max(2, th // 3)
            dark_head = dark_px[np.ix_(ys[:head_rows], xs)].sum()
            # Slightly prefer centered phase (0.5, 0.5) on ties
            center_bonus = 2.0 - abs(dx_f - 0.5) - abs(dy_f - 0.5)
            sc = dark_head * 2.5 + sub_a.sum() * 0.05 + center_bonus
            if sc > best_score:
                best_score = sc
                best = (ys, xs)

    ys, xs = best
    out = np.zeros((th, tw, 4), dtype=np.uint8)
    out[:, :, :3] = patch[np.ix_(ys, xs, np.arange(3))]
    out[:, :, 3] = np.where(alpha[np.ix_(ys, xs)], 255, 0)
    out_light = light_m[np.ix_(ys, xs)] & (out[:, :, 3] > 0)
    out_mid = mid_m[np.ix_(ys, xs)] & (out[:, :, 3] > 0)

    # Ensure outer rows/cols aren't blank due to subpixel rounding
    m = out[:, :, 3] > 0
    if np.any(m):
        y_i, x_i = np.where(m)
        out = out[y_i.min():y_i.max() + 1, x_i.min():x_i.max() + 1]
        out_light = out_light[y_i.min():y_i.max() + 1, x_i.min():x_i.max() + 1]
        out_mid = out_mid[y_i.min():y_i.max() + 1, x_i.min():x_i.max() + 1]
    return out, (out_light, out_mid)


def kmeans_palette(pixels, k=12, iters=28):
    """Deterministic K-means over RGB pixels returning (k, 3) uint8 palette."""
    if len(pixels) == 0:
        return np.zeros((k, 3), dtype=np.uint8)
    # Deduplicate weighted by sqrt(count) so rare important tones (eyes/maroon/olive) stay sharp
    uniq, counts = np.unique(pixels.reshape(-1, 3), axis=0, return_counts=True)
    weights = np.sqrt(counts.astype(np.float64))
    pts = uniq.astype(np.float64)
    # Farthest-point deterministic initialization starting from brightest-chroma or first point
    idx0 = int(np.argmax(pts.max(axis=1) - pts.min(axis=1)))
    centers = [pts[idx0]]
    min_d2 = np.sum((pts - centers[0]) ** 2, axis=1)
    for _ in range(k - 1):
        # weight farthest choice mildly by sqrt(count) to avoid 1px outlier artifacts
        pick = int(np.argmax(min_d2 * np.minimum(weights, 4.0)))
        centers.append(pts[pick])
        d2 = np.sum((pts - centers[-1]) ** 2, axis=1)
        min_d2 = np.minimum(min_d2, d2)
    centers = np.array(centers, dtype=np.float64)
    for _ in range(iters):
        d2 = np.sum((pts[:, None, :] - centers[None, :, :]) ** 2, axis=2)
        lab = np.argmin(d2, axis=1)
        moved = False
        for ci in range(k):
            mask = lab == ci
            if np.any(mask):
                w = weights[mask, None]
                nc = np.sum(pts[mask] * w, axis=0) / np.sum(w)
                if np.sum((nc - centers[ci]) ** 2) > 0.25:
                    moved = True
                centers[ci] = nc
        if not moved:
            break
    return np.clip(np.round(centers), 0, 255).astype(np.uint8)


def despeckle(arr, smear_mask=None):
    """Remove 1-2px isolated noise specks unless they belong to smear arcs."""
    a = arr[:, :, 3] > 0
    lbl, n = ndimage.label(a, structure=np.ones((3, 3), dtype=bool))
    if n <= 1:
        return arr
    sizes = np.bincount(lbl.ravel())
    drop = np.zeros_like(a)
    for ci in range(1, n + 1):
        if sizes[ci] <= 2:
            if smear_mask is not None and np.any(smear_mask & (lbl == ci)):
                continue
            drop |= (lbl == ci)
    out = arr.copy()
    out[drop] = 0
    return out


def apply_outline(arr, keep_mask):
    """Seal exterior non-dark foreground edges with 1px OUT_COL, skipping KEEP smear."""
    a = arr[:, :, 3] > 0
    is_out = (arr[:, :, 0] == OUT_COL[0]) & (arr[:, :, 1] == OUT_COL[1]) & (arr[:, :, 2] == OUT_COL[2]) & a
    # Expand 1px canvas temporarily so edges touching border can get outline if safe
    bg = ~a
    exposed = a & (~is_out) & (~keep_mask) & (
        np.roll(bg, 1, 0) | np.roll(bg, -1, 0) | np.roll(bg, 1, 1) | np.roll(bg, -1, 1)
    )
    # Also check outer border rows/cols safely
    exposed[0, :] &= a[0, :] & (~is_out[0, :]) & (~keep_mask[0, :])
    exposed[-1, :] &= a[-1, :] & (~is_out[-1, :]) & (~keep_mask[-1, :])
    exposed[:, 0] &= a[:, 0] & (~is_out[:, 0]) & (~keep_mask[:, 0])
    exposed[:, -1] &= a[:, -1] & (~is_out[:, -1]) & (~keep_mask[:, -1])
    # Convert only if it was an un-outlined non-dark fringe pixel? Better: convert exposed edge to OUT
    # Wait: make sure we don't eat into thin 1px limbs or hair tips unless 3+ thick;
    # Check if exposed pixel sits OUTSIDE dark outline or replaces light anti-alias fringe:
    r, g, b = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int)
    out = arr.copy()
    # Any green-halo/dark-fringe exposed pixel -> OUT; bright foot/hair exposed -> pad OUT outside if room
    h, w = out.shape[:2]
    pad = np.zeros((h + 2, w + 2, 4), dtype=np.uint8)
    pad[1:-1, 1:-1] = out
    pk = np.zeros((h + 2, w + 2), dtype=bool)
    pk[1:-1, 1:-1] = keep_mask
    pa = pad[:, :, 3] > 0
    po = (pad[:, :, 0] == OUT_COL[0]) & (pad[:, :, 1] == OUT_COL[1]) & (pad[:, :, 2] == OUT_COL[2]) & pa
    need = pa & (~po) & (~pk)
    # Put 1px OUT into 4-neighbor transparent pixels next to `need`
    n4 = (
        np.roll(need, 1, 0) | np.roll(need, -1, 0) | np.roll(need, 1, 1) | np.roll(need, -1, 1)
    ) & (~pa)
    # Don't add outline inside tiny 1px crevices completely surrounded? Actually outer bg only:
    bg_lbl, _ = ndimage.label(~pa)
    outer_bg = bg_lbl == bg_lbl[0, 0]
    add_o = n4 & outer_bg
    pad[add_o] = (*OUT_COL, 255)
    # Crop back tight
    yy, xx = np.where(pad[:, :, 3] > 0)
    return pad[yy.min():yy.max() + 1, xx.min():xx.max() + 1]


def quantize_all(items):
    """Quantize list of (patch, (light_m, mid_m)) to 13 body colors + OUT + KEEP (<=16 total)."""
    dark_list = []
    body_pixels = []
    for p, (lm, mm) in items:
        a = p[:, :, 3] > 0
        rgb = p[:, :, :3]
        dark = a & (~lm) & (~mm) & ((rgb.max(axis=2) < 88) | (rgb.mean(axis=2) < 62))
        dark_list.append(dark)
        body = a & (~lm) & (~mm) & (~dark)
        if np.any(body):
            body_pixels.append(rgb[body])
    all_px = np.concatenate(body_pixels, axis=0)
    pal = kmeans_palette(all_px, k=13, iters=32)
    print('Quantized 13 body palette colors:')
    for idx, c in enumerate(pal):
        print(f'  [{idx:2d}] RGB({int(c[0]):3d}, {int(c[1]):3d}, {int(c[2]):3d})')

    out_patches = []
    for (p, (lm, mm)), dark in zip(items, dark_list):
        q = np.zeros_like(p)
        a = p[:, :, 3] > 0
        q[dark] = (*OUT_COL, 255)
        body = a & (~lm) & (~mm) & (~dark)
        if np.any(body):
            pts = p[:, :, :3][body].astype(np.float64)
            d2 = np.sum((pts[:, None, :] - pal[None, :, :].astype(np.float64)) ** 2, axis=2)
            idx = np.argmin(d2, axis=1)
            q[body, :3] = pal[idx]
            q[body, 3] = 255
        q[mm] = (*KEEP_MID, 255)
        q[lm] = (*KEEP_LIGHT, 255)
        km = lm | mm
        q = despeckle(q, smear_mask=km)
        # Recompute keep_mask after potential despeckle crop
        km2 = (
            ((q[:, :, 0] == KEEP_LIGHT[0]) & (q[:, :, 1] == KEEP_LIGHT[1]) & (q[:, :, 2] == KEEP_LIGHT[2])) |
            ((q[:, :, 0] == KEEP_MID[0]) & (q[:, :, 1] == KEEP_MID[1]) & (q[:, :, 2] == KEEP_MID[2]))
        ) & (q[:, :, 3] > 0)
        q = apply_outline(q, km2)
        out_patches.append(q)
    return out_patches, pal


def hair_centroid(arr, pal):
    """Find olive-hair pixel mask & (cx, top_y) for consistent head alignment."""
    a = arr[:, :, 3] > 0
    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
    olive = a & (g >= r) & (g - b >= 22) & (g >= 80)
    ys, xs = np.where(olive)
    if len(xs) < 10:
        ys, xs = np.where(a)
    if len(xs) == 0:
        return arr.shape[1] / 2.0, 0.0
    # Focus on upper 45% of sprite in case olive appears elsewhere
    h = arr.shape[0]
    top_m = ys <= h * 0.45
    if np.any(top_m):
        ys, xs = ys[top_m], xs[top_m]
    return float(np.median(xs)), float(ys.min())


def place_in_cell(arr, cx_ref=None, foot_y=55, min_clear_x=0):
    """Center sprite at FW/2 horizontally (keeping inside 0..FW) and foot at foot_y."""
    cell = np.zeros((FH, FW, 4), dtype=np.uint8)
    h, w = arr.shape[:2]
    if w > FW:
        # Trim excess empty columns if somehow wider (shouldn't happen)
        x0 = (w - FW) // 2
        arr = arr[:, x0:x0 + FW]
        w = FW
    if cx_ref is None:
        # Use upper 55% of opaque mass for torso/head center
        ys, xs = np.where(arr[:, :, 3] > 0)
        up = ys <= h * 0.55
        cx_ref = float(np.median(xs[up])) if np.any(up) else w / 2.0
    ox = int(round(FW / 2 - cx_ref))
    ox = max(min_clear_x, min(FW - w, ox))
    oy = foot_y + 1 - h
    if oy < 0:
        # Trim top if somehow taller than FH (unlikely since h <= 54)
        arr = arr[-oy:, :]
        h = arr.shape[0]
        oy = 0
    cell[oy:oy + h, ox:ox + w] = arr
    return cell


def cell_center(arr, pal=None, use_hair=True):
    """Place a single standing/walk frame centered by its head on bottom y=55."""
    cx = hair_centroid(arr, pal)[0] if use_hair else None
    return place_in_cell(arr, cx_ref=cx, foot_y=55)


def cell_aligned_to_idle(arr, idle_cell, pal, foot_y=55):
    """Align slash/hurt patch to idle_cell by olive-hair centroid and grounded feet."""
    hx_ref, hy_ref = hair_centroid(idle_cell, pal)
    hx_cur, hy_cur = hair_centroid(arr, pal)
    h, w = arr.shape[:2]
    ox = int(round(hx_ref - hx_cur))
    # Prefer hair Y alignment if close to foot Y, otherwise ground feet at foot_y=55
    oy_hair = int(round(hy_ref - hy_cur))
    oy_foot = foot_y + 1 - h
    # Check if hair alignment puts feet near 55 (within +-3 px); if feet float too high, ground near 55
    oy = oy_hair if abs((oy_hair + h - 1) - foot_y) <= 4 else oy_foot
    # Keep entire slash + smear inside cell horizontally
    ox = max(0, min(FW - w, ox))
    oy = max(0, min(FH - h, oy))
    cell = np.zeros((FH, FW, 4), dtype=np.uint8)
    cell[oy:oy + h, ox:ox + w] = arr
    return cell


def unify_walk_heads(cells, pal, ref_idx=0):
    """Copy canonical upper head (above neck shackle) across frames aligned by hair."""
    ref = cells[ref_idx].copy()
    rx, ry = hair_centroid(ref, pal)
    # Find upper head mask in ref: pixels from top of head down to ~15px (skull + eyes, above collar/shackle)
    ry_i = int(round(ry))
    head_end = min(FH, ry_i + 15)
    head_patch = ref[ry_i:head_end, :].copy()
    # Keep only main connected component in head region so no stray shoulder pixels slip in
    ha = head_patch[:, :, 3] > 0
    lbl, n = ndimage.label(ha, structure=np.ones((3, 3), dtype=bool))
    if n > 1:
        sizes = np.bincount(lbl.ravel())
        sizes[0] = 0
        best = int(np.argmax(sizes))
        head_patch[lbl != best] = 0

    out = []
    for i, c in enumerate(cells):
        if i == ref_idx:
            out.append(c)
            continue
        cx, cy = hair_centroid(c, pal)
        dx = int(round(cx - rx))
        dy = int(round(cy - ry))
        nc = c.copy()
        # Erase existing upper head band slightly around target & stamp ref head
        y_dst0 = max(0, ry_i + dy)
        y_dst1 = min(FH, head_end + dy)
        y_src0 = y_dst0 - dy - ry_i
        y_src1 = y_dst1 - dy - ry_i
        for x in range(FW):
            xs = x - dx
            if 0 <= xs < FW:
                sub = head_patch[y_src0:y_src1, xs]
                m = sub[:, 3] > 0
                if np.any(m):
                    # Clear old top fringe just above/around hair so double outline doesn't poke out
                    nc[max(0, y_dst0 - 1):y_dst1, x] = 0
                    # Re-apply slice
                    nc[y_dst0:y_dst1, x][m] = sub[m]
        # Stitch back any gap between head_end+dy and torso below
        out.append(nc)
    return out


def make_breathe(cell, waist_y=40, drop=1):
    """Shift upper torso/head down by `drop` px keeping legs/feet planted."""
    out = cell.copy()
    out[drop:waist_y, :] = cell[0:waist_y - drop, :]
    out[:drop, :] = 0
    return out


def make_hair_sway(cell, pal, dx=1):
    """Shift top olive hair fringes by 1px for subtle wind animation."""
    hx, hy = hair_centroid(cell, pal)
    out = cell.copy()
    hy_i = int(round(hy))
    y1 = min(FH, hy_i + 7)
    r = out[:, :, 0].astype(int)
    g = out[:, :, 1].astype(int)
    b = out[:, :, 2].astype(int)
    olive = (out[:, :, 3] > 0) & (g >= r) & (g - b >= 22) & (g >= 80)
    # Only shift outermost top/right tips cleanly where adjacent is transparent
    mask = olive[hy_i:y1, :]
    ys, xs = np.where(mask)
    for y, x in zip(ys, xs):
        ny = hy_i + y
        nx = x + dx
        if 1 <= nx < FW - 1 and out[ny, nx, 3] == 0 and y <= 4:
            out[ny, nx] = out[ny, x]
    return out


def make_idle4(cell, pal, waist_y=40):
    """4-frame breathing + subtle hair sway idle."""
    f0 = cell.copy()
    f1 = make_breathe(cell, waist_y, drop=1)
    f2 = make_hair_sway(f1, pal, dx=1)
    f3 = make_hair_sway(f0, pal, dx=1)
    return [f0, f1, f2, f3]


def find_skin_color(cell, pal):
    """Pick representative warm skin tone from quantized palette."""
    # Warm tan skin has R > G > B and R - B > 35
    best = None
    best_sc = -1e9
    for c in pal:
        r, g, b = int(c[0]), int(c[1]), int(c[2])
        if r > g > b and (r - b) >= 30 and r >= 170:
            sc = r + g - b * 1.5
            if sc > best_sc:
                best_sc = sc
                best = tuple(int(v) for v in c)
    return best or (225, 178, 128)


def make_blink_frame(cell, pal, hx, hy):
    """Replace upper pixels of dark eye streaks with skin, leaving 1px closed eyelid."""
    out = cell.copy()
    skin = find_skin_color(cell, pal)
    hy_i = int(round(hy))
    hx_i = int(round(hx))
    y0, y1 = max(0, hy_i + 6), min(FH, hy_i + 18)
    x0, x1 = max(0, hx_i - 8), min(FW, hx_i + 9)
    sub = out[y0:y1, x0:x1]
    dark = (sub[:, :, 3] > 0) & (sub[:, :, :3].max(axis=2) <= 55)
    # Exclude exterior silhouette / pixels bordering transparent bg
    bg = sub[:, :, 3] == 0
    interior = dark & ~(
        np.roll(bg, 1, 0) | np.roll(bg, -1, 0) | np.roll(bg, 1, 1) | np.roll(bg, -1, 1)
    )
    r, g, b = sub[:, :, 0].astype(int), sub[:, :, 1].astype(int), sub[:, :, 2].astype(int)
    is_skin = (sub[:, :, 3] > 0) & (r > g) & (g >= b) & (r - b >= 22) & (r >= 135)
    near_skin = (
        np.roll(is_skin, 1, 1) | np.roll(is_skin, -1, 1) | np.roll(is_skin, 1, 0) | np.roll(is_skin, -1, 0)
    )
    eye_px = interior & near_skin
    # Keep bottom row of each eye streak as 1px closed eyelid; fill rows above with skin
    has_below = np.roll(eye_px, -1, 0)
    has_below[-1, :] = False
    upper_eye = eye_px & has_below
    sub[upper_eye] = (*skin, 255)
    out[y0:y1, x0:x1] = sub
    return out


def sym_stand_legs(cell):
    """Make lower legs (y=46..55) symmetric by mirroring planted leg side so both feet rest flat."""
    out = cell.copy()
    y0 = 46
    mid = FW // 2
    left_a = (cell[54:56, :mid, 3] > 0).sum()
    right_a = (cell[54:56, mid:, 3] > 0).sum()
    if right_a >= left_a:
        half = cell[y0:, mid:].copy()
        out[y0:, :mid] = np.fliplr(half)
    else:
        half = cell[y0:, :mid].copy()
        out[y0:, mid:] = np.fliplr(half)
    return out


def make_blink4(cell, pal):
    """4 frames of idle with blinking closed eyes on frames 1 & 2."""
    hx, hy = hair_centroid(cell, pal)
    f0 = cell.copy()
    fb = make_blink_frame(cell, pal, hx, hy)
    f1 = make_breathe(fb, 40, drop=1)
    f2 = make_hair_sway(f1, pal, dx=1)
    return [f0, f1, f2, f0.copy()]


def crouch(cell, px=2, waist_y=40):
    """Squash/crouch upper body down by `px` keeping boots on y=55."""
    out = np.zeros_like(cell)
    out[px:, :] = cell[:FH - px, :]
    # Keep lowest boot/leg section anchored
    out[waist_y + 4:, :] = cell[waist_y + 4:, :]
    # Restore ground bottom soles cleanly
    out[-4:, :] = cell[-4:, :]
    return out


def shift_cell(cell, dx=0, dy=0):
    """Translate cell safely clipping outside 0..FW, 0..FH."""
    out = np.zeros_like(cell)
    sx0 = max(0, -dx)
    sx1 = min(FW, FW - dx)
    sy0 = max(0, -dy)
    sy1 = min(FH, FH - dy)
    out[sy0 + dy:sy1 + dy, sx0 + dx:sx1 + dx] = cell[sy0:sy1, sx0:sx1]
    return out


def pick_stand_index(cells):
    """Pick the walk frame with narrowest lower-leg bounding width (closest to standing rest)."""
    best_i, best_w = 0, 999
    for i, c in enumerate(cells):
        a = c[:, :, 3] > 0
        h = a.shape[0]
        ys, xs = np.where(a[int(h * 0.65):, :])
        span = int(xs.max() - xs.min()) if len(xs) else 999
        if span < best_w:
            best_w = span
            best_i = i
    return best_i


def main():
    w_rows = extract_grid_cells(DIR / 'raw_walk.png', [6, 8, 8, 8, 8], min_row_gap=2, merge_col_gap=14)
    s_rows = extract_grid_cells(DIR / 'raw_slash.png', [4, 4, 4], min_row_gap=0, force_n_cols=4)
    a_rows = extract_grid_cells(DIR / 'raw_actions.png', [4, 4, 4], min_row_gap=2, force_n_cols=4)

    # Flip slash UP horizontally so sword arc matches hero_mc2 slash_up.png
    s_rows[2] = [np.fliplr(p) for p in s_rows[2]]

    # Determine walk standing target height = 48px matching hero_mc2.png (normalize side slightly)
    walk_h_ref = float(np.median([p.shape[0] for p in w_rows[3]]))
    walk_scale = 48.0 / walk_h_ref
    walk_side_h_ref = float(np.median([p.shape[0] for p in w_rows[0]]))
    walk_side_scale = 48.0 / walk_side_h_ref

    # Use col 3 recovery frames in raw_slash, roll ball height ~40px, and HURT[0] for act_scale
    slash_h_ref = float(np.median([s_rows[0][3].shape[0], s_rows[1][3].shape[0], s_rows[2][3].shape[0]]))
    slash_scale = 48.0 / slash_h_ref
    roll_h_ref = float(np.median([p.shape[0] for p in a_rows[0]]))
    roll_scale = 40.0 / roll_h_ref
    act_h_ref = float(a_rows[1][0].shape[0])  # hurt[0] upright recoil
    act_scale = 47.0 / act_h_ref
    print(f'Scales: walk={walk_scale:.4f}, walk_side={walk_side_scale:.4f}, '
          f'slash={slash_scale:.4f}, roll={roll_scale:.4f}, act={act_scale:.4f}')

    all_items = []
    idx_map = {}

    for ri, row in enumerate(w_rows):
        idx_map[('w', ri)] = []
        sc = walk_side_scale if ri == 0 else walk_scale
        for p in row:
            idx_map[('w', ri)].append(len(all_items))
            all_items.append(shrink_nearest(p, sc, is_slash=False))

    for ri, row in enumerate(s_rows):
        idx_map[('s', ri)] = []
        for p in row:
            idx_map[('s', ri)].append(len(all_items))
            all_items.append(shrink_nearest(p, slash_scale, is_slash=True))

    for ri, row in enumerate(a_rows):
        idx_map[('a', ri)] = []
        sc = roll_scale if ri == 0 else act_scale
        for p in row:
            idx_map[('a', ri)].append(len(all_items))
            all_items.append(shrink_nearest(p, sc, is_slash=False))

    q_patches, pal = quantize_all(all_items)

    def get_group(kind, r):
        return [q_patches[i] for i in idx_map[(kind, r)]]

    w_side_raw = get_group('w', 0)  # 6 frames facing right
    w_ds_raw = get_group('w', 1)    # 8 frames SE
    w_u_raw = get_group('w', 2)     # 8 frames UP
    w_d_raw = get_group('w', 3)     # 8 frames DOWN
    w_us_raw = get_group('w', 4)    # 8 frames NE

    sl_side_raw = get_group('s', 0)
    sl_down_raw = get_group('s', 1)
    sl_up_raw = get_group('s', 2)

    roll_raw = get_group('a', 0)
    hurt_raw = get_group('a', 1)
    die_raw = get_group('a', 2)

    # Center all walk frames onto 64x56 bottom-anchored y=55, then unify heads per row
    w_side = unify_walk_heads([cell_center(p, pal) for p in w_side_raw], pal, ref_idx=pick_stand_index(w_side_raw))
    w_ds = unify_walk_heads([cell_center(p, pal) for p in w_ds_raw], pal, ref_idx=pick_stand_index(w_ds_raw))
    w_u = unify_walk_heads([cell_center(p, pal) for p in w_u_raw], pal, ref_idx=pick_stand_index(w_u_raw))
    w_d = unify_walk_heads([cell_center(p, pal) for p in w_d_raw], pal, ref_idx=pick_stand_index(w_d_raw))
    w_us = unify_walk_heads([cell_center(p, pal) for p in w_us_raw], pal, ref_idx=pick_stand_index(w_us_raw))

    d0 = sym_stand_legs(w_d[pick_stand_index(w_d_raw)])
    u0 = sym_stand_legs(w_u[pick_stand_index(w_u_raw)])
    s0 = w_side[pick_stand_index(w_side_raw)]

    sl_side = [cell_aligned_to_idle(p, s0, pal) for p in sl_side_raw]
    sl_down = [cell_aligned_to_idle(p, d0, pal) for p in sl_down_raw]
    sl_up = [cell_aligned_to_idle(p, u0, pal) for p in sl_up_raw]

    roll_side = [cell_center(p, pal, use_hair=False) for p in roll_raw]
    roll_down = [crouch(d0, 2), roll_side[1], roll_side[2], crouch(d0, 1)]
    roll_up = [crouch(u0, 2), roll_side[1], roll_side[2], crouch(u0, 1)]

    hurt_cells = [
        cell_aligned_to_idle(hurt_raw[2], s0, pal),
        cell_aligned_to_idle(hurt_raw[3], s0, pal),
        cell_aligned_to_idle(hurt_raw[2], s0, pal),
        cell_aligned_to_idle(hurt_raw[3], s0, pal),
    ]
    die_cells = [cell_center(p, pal, use_hair=False) for p in die_raw]

    def heavy(base_idle, sl):
        return [crouch(base_idle, 1), crouch(base_idle, 2), sl[1], sl[2]]

    atlas = np.zeros((ROWS_TOTAL * FH, 4 * FW, 4), dtype=np.uint8)

    def put_row(r, frames):
        for c in range(min(4, len(frames))):
            atlas[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = frames[c]

    def put_8dir(r0, frames):
        for i, f in enumerate(frames):
            rr = r0 + (i >> 2)
            cc = i & 3
            atlas[rr * FH:(rr + 1) * FH, cc * FW:(cc + 1) * FW] = f

    rows_data = {
        HERO_ROW['idle_down']: make_idle4(d0, pal),
        HERO_ROW['walk_down']: [w_d[0], w_d[2], w_d[4], w_d[6]],
        HERO_ROW['idle_up']: make_idle4(u0, pal),
        HERO_ROW['walk_up']: [w_u[0], w_u[2], w_u[4], w_u[6]],
        HERO_ROW['idle_side']: make_idle4(s0, pal),
        HERO_ROW['walk_side_a']: [w_side[0], w_side[1], w_side[3], w_side[4]],
        HERO_ROW['walk_side']: [w_side[0], w_side[2], w_side[4], w_side[5]],
        HERO_ROW['atk1_down']: sl_down,
        HERO_ROW['atk2_down']: [sl_down[0], sl_down[1], sl_down[2], sl_down[3]],
        HERO_ROW['atk3_down']: [sl_down[0], sl_down[1], sl_down[2], sl_down[3]],
        HERO_ROW['atk1_up']: sl_up,
        HERO_ROW['atk2_up']: [sl_up[0], sl_up[1], sl_up[2], sl_up[3]],
        HERO_ROW['atk3_up']: [sl_up[0], sl_up[1], sl_up[2], sl_up[3]],
        HERO_ROW['atk1_side']: sl_side,
        HERO_ROW['atk2_side']: [sl_side[0], sl_side[1], sl_side[2], sl_side[3]],
        HERO_ROW['atk3_side']: [sl_side[0], sl_side[1], sl_side[2], sl_side[3]],
        HERO_ROW['heavy_down']: heavy(d0, sl_down),
        HERO_ROW['heavy_up']: heavy(u0, sl_up),
        HERO_ROW['heavy_side']: heavy(s0, sl_side),
        HERO_ROW['roll_down']: roll_down,
        HERO_ROW['roll_up']: roll_up,
        HERO_ROW['roll_side']: roll_side,
        HERO_ROW['hurt']: hurt_cells,
        HERO_ROW['die']: die_cells,
        HERO_ROW['rise']: list(reversed(die_cells)),
        HERO_ROW['cast_down']: [d0, crouch(d0, 2), shift_cell(d0, dy=-1), d0],
        HERO_ROW['cast_up']: [u0, crouch(u0, 2), shift_cell(u0, dy=-1), u0],
        HERO_ROW['cast_side']: [s0, crouch(s0, 2), shift_cell(s0, dx=1, dy=-1), s0],
        HERO_ROW['bow_down']: [d0, crouch(d0, 1), crouch(d0, 1), d0],
        HERO_ROW['bow_side_a']: [s0, crouch(s0, 1), crouch(s0, 1), s0],
        HERO_ROW['bow_side']: [s0, crouch(s0, 1), crouch(s0, 1), s0],
        HERO_ROW['bow_up']: [u0, crouch(u0, 1), crouch(u0, 1), u0],
        HERO_ROW['fish_cast']: [crouch(s0, 1), crouch(s0, 2), shift_cell(s0, dx=1), s0],
        HERO_ROW['fish_pull']: [s0, shift_cell(s0, dx=-1, dy=-1), shift_cell(s0, dx=-1), s0],
        HERO_ROW['pick']: [d0, crouch(d0, 2), crouch(d0, 1), d0],
        HERO_ROW['hoe']: [s0, crouch(s0, 2), shift_cell(s0, dx=1), s0],
        HERO_ROW['cheer']: [d0, shift_cell(d0, dy=-2), shift_cell(d0, dy=-1), d0],
        HERO_ROW['cheer_b']: [d0, crouch(d0, 1), shift_cell(d0, dy=-2), d0],
        HERO_ROW['sleep']: [die_cells[3]] * 4,
    }
    for r, frames in rows_data.items():
        put_row(r, frames)

    put_8dir(39, w_side)  # walk8s_0..5 (6 frames)
    put_8dir(41, w_u)     # walk8u_0..7
    put_8dir(43, w_d)     # walk8d_0..7
    put_row(45, make_blink4(d0, pal))
    put_row(46, make_blink4(s0, pal))
    put_8dir(47, w_ds)    # walk8ds_0..7
    put_8dir(49, w_us)    # walk8us_0..7

    # Validate output constraints
    assert atlas.shape == (ROWS_TOTAL * FH, 4 * FW, 4), f'Bad shape {atlas.shape}'
    opaque = atlas[:, :, 3] > 0
    uniq_cols = np.unique(atlas[opaque][:, :3], axis=0)
    print(f'Output atlas: {4*FW}x{ROWS_TOTAL*FH}, opaque unique colors={len(uniq_cols)}')
    assert len(uniq_cols) <= 16, f'Too many colors: {len(uniq_cols)}'

    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(atlas, 'RGBA').save(OUT_PNG)
    print(f'Saved {OUT_PNG}')

    # Build 3x visual comparison chart: female mc2 vs male slave across key poses
    mc2 = np.array(Image.open(REF_MC2).convert('RGBA'))
    samples = [
        ('idle_down', 0, 0), ('blink_down', 45, 1), ('idle_side', 4, 0), ('idle_up', 2, 0),
        ('walk_se_1', 47, 1), ('walk_ne_1', 49, 1), ('walk_side_2', 39, 2),
        ('atk_side', 11, 1), ('atk_down', 7, 1), ('atk_up', 9, 1),
        ('heavy_side', 18, 2), ('roll_side_2', 21, 1), ('hurt_down', 22, 0), ('die_end', 23, 3),
    ]
    cols = len(samples)
    pad = 4
    cw, ch = FW * 3, FH * 3
    grid = Image.new('RGBA', (cols * (cw + pad) + pad, 2 * (ch + pad) + pad), (42, 48, 56, 255))
    for i, (name, rr, cc) in enumerate(samples):
        x = pad + i * (cw + pad)
        for ri, src in enumerate((mc2, atlas)):
            y = pad + ri * (ch + pad)
            cell = src[rr * FH:(rr + 1) * FH, cc * FW:(cc + 1) * FW]
            assert np.any(cell[:, :, 3] > 0), f'Empty cell {name} row={rr} col={cc} src={ri}'
            im3 = Image.fromarray(cell, 'RGBA').resize((cw, ch), Image.NEAREST)
            grid.alpha_composite(im3, (x, y))
    CMP_PNG.parent.mkdir(parents=True, exist_ok=True)
    grid.save(CMP_PNG)
    print(f'Saved 3x comparison to {CMP_PNG}')


if __name__ == '__main__':
    main()
