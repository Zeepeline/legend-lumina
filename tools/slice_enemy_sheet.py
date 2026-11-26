#!/usr/bin/env python3
"""Pemotong & pembersih atlas monster 4 kolom x 6 baris (tanpa ketergantungan scipy).
Pemakaian: python3 tools/slice_enemy_sheet.py <id> <raw_path>
Keluaran: assets/img/monsters/esh_<id>.png + pratinjau 4x di scratch/ + JSON {id, fw, fh, h}."""
import json
import sys
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image

TARGET_H = {
    'frog': 24, 'boar': 30, 'bee': 22, 'plant': 38, 'snake': 25,
    'wisp': 24, 'shroom': 32, 'bat': 24, 'salam': 25, 'golem': 50, 'ghost': 36,
}
FLYING = {'bee', 'bat', 'wisp'}
SCRATCH = Path('/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479/scratch')


def detect_bg_mask(rgb):
    """Deteksi latar magenta solid (#FF00FF) atau warna sudut via flood-fill 4-arah."""
    r, g, b = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    mag = (r > 155) & (g < 125) & (b > 155) & (np.abs(r - b) < 95)
    if mag.mean() > 0.20:
        bg = mag.copy()
        H, W = rgb.shape[:2]
        q = deque()
        for y in (0, H - 1):
            for x in range(0, W, 4):
                if bg[y, x]:
                    q.append((y, x))
        for x in (0, W - 1):
            for y in range(0, H, 4):
                if bg[y, x]:
                    q.append((y, x))
        ref = np.array([255.0, 0.0, 255.0])
        while q:
            cy, cx = q.popleft()
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx]:
                    if np.linalg.norm(rgb[ny, nx].astype(float) - ref) < 100:
                        bg[ny, nx] = True
                        q.append((ny, nx))
        return bg

    H, W = rgb.shape[:2]
    corners = np.array([rgb[0, 0], rgb[0, W - 1], rgb[H - 1, 0], rgb[H - 1, W - 1]], dtype=float)
    ref = np.median(corners, axis=0)
    bg = np.zeros((H, W), dtype=bool)
    q = deque()
    for cy, cx in ((0, 0), (0, W - 1), (H - 1, 0), (H - 1, W - 1)):
        if np.linalg.norm(rgb[cy, cx].astype(float) - ref) < 52:
            bg[cy, cx] = True
            q.append((cy, cx))
    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx]:
                if np.linalg.norm(rgb[ny, nx].astype(float) - ref) < 52:
                    bg[ny, nx] = True
                    q.append((ny, nx))
    return bg


def clean_cell_edges(sm):
    """Buang semburat magenta, piksel yatim, & beri garis tepi gelap pada halo terang."""
    c = sm[..., :3].astype(int)
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    m = sm[..., 3] > 0
    bad = m & (r - g > 28) & (b - g > 28) & (np.abs(r - b) < 105)
    L = (0.3 * r + 0.59 * g + 0.11 * b) * 0.65
    sm[bad, 0] = np.clip(L, 0, 255)[bad].astype(np.uint8)
    sm[bad, 1] = np.clip(L * 0.78, 0, 255)[bad].astype(np.uint8)
    sm[bad, 2] = np.clip(L * 0.72, 0, 255)[bad].astype(np.uint8)
    pink = m & (r > 135) & (b > 115) & (g < 105) & ((b - g) > 35)
    sm[pink, 3] = 0

    m = sm[..., 3] > 0
    H, W = m.shape
    p = np.pad(m, 1)
    n8 = sum(p[1 + dy:1 + dy + H, 1 + dx:1 + dx + W].astype(int)
             for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    sm[m & (n8 <= 1)] = 0

    m = sm[..., 3] > 0
    p = np.pad(m, 1)
    edge = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
    lum = 0.3 * sm[..., 0].astype(float) + 0.59 * sm[..., 1] + 0.11 * sm[..., 2]
    halo = edge & (lum > 135)
    sm[halo, 0] = 18
    sm[halo, 1] = 12
    sm[halo, 2] = 20

    # Buang serpihan kecil terisolasi yang menyentuh tepi kiri/kanan (bocor sel sebelah)
    m = sm[..., 3] > 0
    if m.sum() > 40:
        vis = np.zeros_like(m)
        comps = []
        for y in range(H):
            for x in range(W):
                if m[y, x] and not vis[y, x]:
                    q = deque([(y, x)])
                    vis[y, x] = True
                    pts = []
                    while q:
                        cy, cx = q.popleft()
                        pts.append((cy, cx))
                        for ny in range(max(0, cy - 1), min(H, cy + 2)):
                            for nx in range(max(0, cx - 1), min(W, cx + 2)):
                                if m[ny, nx] and not vis[ny, nx]:
                                    vis[ny, nx] = True
                                    q.append((ny, nx))
                    comps.append(pts)
        biggest = max(len(c) for c in comps) if comps else 0
        for pts in comps:
            if len(pts) < biggest * 0.08 and any(px <= 1 or px >= W - 2 for _, px in pts):
                for py, px in pts:
                    sm[py, px] = 0


def shrink_box(rgb, bg, y0, y1, x0, x1, f):
    H, W = rgb.shape[:2]
    y0, x0 = max(0, y0 - 4), max(0, x0 - 4)
    y1, x1 = min(H, y1 + 4), min(W, x1 + 4)
    sub_rgb = rgb[y0:y1, x0:x1].astype(float)
    a = (~bg[y0:y1, x0:x1]).astype(float)
    pm = np.dstack([sub_rgb * a[..., None], a * 255.0]).clip(0, 255).astype(np.uint8)
    w = max(1, round((x1 - x0) / f))
    h = max(1, round((y1 - y0) / f))
    s2 = np.array(Image.fromarray(pm).resize((w, h), Image.BOX)).astype(float)
    al = s2[..., 3:4]
    col = np.where(al > 0, s2[..., :3] / np.maximum(al, 1.0) * 255.0, 0).clip(0, 255)
    out = np.dstack([col, np.where(al[..., 0] > 128, 255, 0)]).astype(np.uint8)
    clean_cell_edges(out)
    return out, y0, x0


def detect_grid_cc(fg):
    """Deteksi komponen terhubung 4-arah di gambar beresolusi 1/4, fallback ke kisi 6x4."""
    H, W = fg.shape
    sh = max(1, H // 4)
    sw = max(1, W // 4)
    small = np.array(Image.fromarray((fg * 255).astype(np.uint8)).resize((sw, sh), Image.MAX if hasattr(Image, 'MAX') else Image.NEAREST)) > 0
    # Dilasi ringan 2 piksel di resolusi 1/4 agar bagian terpisah kecil (ekor/spora) menyatu
    dil = small.copy()
    for _ in range(2):
        p = np.pad(dil, 1)
        dil = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:] | dil
    vis = np.zeros_like(dil)
    boxes = []
    min_area = (sh * sw) / 400
    for y in range(sh):
        for x in range(sw):
            if dil[y, x] and not vis[y, x]:
                q = deque([(y, x)])
                vis[y, x] = True
                my0 = my1 = y
                mx0 = mx1 = x
                cnt = 0
                while q:
                    cy, cx = q.popleft()
                    cnt += 1
                    my0 = min(my0, cy); my1 = max(my1, cy)
                    mx0 = min(mx0, cx); mx1 = max(mx1, cx)
                    for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                        if 0 <= ny < sh and 0 <= nx < sw and dil[ny, nx] and not vis[ny, nx]:
                            vis[ny, nx] = True
                            q.append((ny, nx))
                if cnt >= min_area:
                    y0 = max(0, int(my0 * H / sh))
                    y1 = min(H, int((my1 + 1) * H / sh))
                    x0 = max(0, int(mx0 * W / sw))
                    x1 = min(W, int((mx1 + 1) * W / sw))
                    # Trim tepat ke fg penuh
                    pts = np.argwhere(fg[y0:y1, x0:x1])
                    if len(pts):
                        py0, px0 = pts.min(axis=0)
                        py1, px1 = pts.max(axis=0) + 1
                        boxes.append([y0 + int(py0), y0 + int(py1), x0 + int(px0), x0 + int(px1)])

    boxes.sort(key=lambda b: (b[0] + b[1]) / 2)
    rows, cur = [], []
    thresh = H / 16
    for bx in boxes:
        if cur and (bx[0] + bx[1]) / 2 - np.mean([(c[0] + c[1]) / 2 for c in cur]) > thresh:
            rows.append(sorted(cur, key=lambda c: c[2]))
            cur = []
        cur.append(bx)
    if cur:
        rows.append(sorted(cur, key=lambda c: c[2]))

    if len(rows) == 6 and all(len(rw) == 4 for rw in rows):
        cols = np.median([[(b[2] + b[3]) / 2 for b in rw] for rw in rows], axis=0)
        return rows, cols, True

    cw, ch = W / 4.0, H / 6.0
    rows_fb = []
    for r in range(6):
        rw = []
        for c in range(4):
            gy0, gy1 = int(round(r * ch)), int(round((r + 1) * ch))
            gx0, gx1 = int(round(c * cw)), int(round((c + 1) * cw))
            pts = np.argwhere(fg[gy0:gy1, gx0:gx1])
            if len(pts):
                py0, px0 = pts.min(axis=0)
                py1, px1 = pts.max(axis=0) + 1
                rw.append([gy0 + int(py0), gy0 + int(py1), gx0 + int(px0), gx0 + int(px1)])
            else:
                rw.append([gy0 + 4, gy1 - 4, gx0 + 4, gx1 - 4])
        rows_fb.append(rw)
    cols_fb = np.array([(c + 0.5) * cw for c in range(4)])
    return rows_fb, cols_fb, False


def build(eid, raw_path):
    im_rgba = Image.open(raw_path).convert('RGBA')
    arr = np.array(im_rgba)
    rgb = arr[..., :3]
    alpha_zero = arr[..., 3] < 32
    bg = detect_bg_mask(rgb) | alpha_zero
    rows, cols, exact_cc = detect_grid_cc(~bg)

    idle_heights = [b[1] - b[0] for b in rows[0] if b[1] > b[0]]
    idle_h = float(np.median(idle_heights)) if idle_heights else (rgb.shape[0] / 8.0)
    f = max(1.0, idle_h / TARGET_H.get(eid, 28))

    cut = []
    for rw in rows[:6]:
        base = max(b[1] for b in rw)
        mid_y = np.median([(b[0] + b[1]) / 2 for b in rw])
        fr = []
        for c, (y0, y1, x0, x1) in enumerate(rw[:4]):
            ci = c if not exact_cc else int(np.argmin(np.abs(cols - (x0 + x1) / 2)))
            sm, ys, xs = shrink_box(rgb, bg, y0, y1, x0, x1, f)
            ay = (mid_y - ys) / f if eid in FLYING else (base - ys) / f
            ax = (cols[ci] - xs) / f
            fr.append((sm, ax, ay))
        cut.append(fr)

    L = R = U = D = 0
    for fr in cut:
        for sm, cx, ay in fr:
            pts = np.argwhere(sm[..., 3] > 0)
            if not len(pts):
                continue
            L = max(L, cx - pts[:, 1].min())
            R = max(R, pts[:, 1].max() + 1 - cx)
            U = max(U, ay - pts[:, 0].min())
            D = max(D, pts[:, 0].max() + 1 - ay)

    half = int(np.ceil(max(L, R))) + 2
    FW = max(24, half * 2)
    FH = max(24, int(np.ceil(U + max(0, D))) + 3) if eid in FLYING else max(24, int(np.ceil(U)) + 2)
    anchor_y = int(np.ceil(U)) + 1 if eid in FLYING else (FH - 2)

    atlas = np.zeros((FH * 6, FW * 4, 4), dtype=np.uint8)
    for r, fr in enumerate(cut):
        for c, (sm, cx, ay) in enumerate(fr):
            dx = int(round(half - cx))
            dy = int(round(anchor_y - ay))
            h, w = sm.shape[:2]
            cell = np.zeros((FH, FW, 4), dtype=np.uint8)
            sy0, sx0 = max(0, -dy), max(0, -dx)
            ty0, tx0 = max(0, dy), max(0, dx)
            hh, ww = min(h - sy0, FH - ty0), min(w - sx0, FW - tx0)
            if hh > 0 and ww > 0:
                cell[ty0:ty0 + hh, tx0:tx0 + ww] = sm[sy0:sy0 + hh, sx0:sx0 + ww]
            nz = int((cell[..., 3] > 0).sum())
            assert nz >= 25, f'{eid} sel ({r},{c}) terlalu kosong ({nz} px)'
            atlas[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = cell

    out_path = Path(f'assets/img/monsters/esh_{eid}.png')
    Image.fromarray(atlas).save(out_path, optimize=True)

    SCRATCH.mkdir(parents=True, exist_ok=True)
    prev = Image.new('RGBA', (FW * 4 * 4, FH * 6 * 4), (32, 36, 48, 255))
    scaled = Image.fromarray(atlas).resize((FW * 4 * 4, FH * 6 * 4), Image.NEAREST)
    prev.paste(scaled, (0, 0), scaled)
    prev.save(SCRATCH / f'esh_{eid}_preview.png')

    pts0 = np.argwhere(cut[0][0][0][..., 3] > 0)
    body_h = int(round(pts0[:, 0].max() - pts0[:, 0].min() + 1)) if len(pts0) else TARGET_H.get(eid, 28)
    return {'id': eid, 'fw': FW, 'fh': FH, 'h': body_h, 'exact_cc': exact_cc}


if __name__ == '__main__':
    res = build(sys.argv[1], sys.argv[2])
    print(json.dumps(res))
