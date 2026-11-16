#!/usr/bin/env python3
"""Potong lembar sprite Arka dari ChatGPT (assets/raw/hero/arka_sheetN.png, latar magenta) jadi atlas game.
Seni asli: 1 piksel seni = ±5 px gambar → diperkecil /5 dengan warna mayoritas per blok (tetap tajam, tanpa blur).
Keluaran: assets/img/hero_arka.png (frame FW×FH, satu baris per animasi) + assets/raw/hero/rows/*.png (pratinjau baris).
Pemakaian: python3 tools/gen_hero.py            (nama baris di ROWS di bawah)"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

SRC = 'assets/raw/hero'; P = 5; FW, FH = 48, 40
# nama animasi per baris tiap lembar (urut atas → bawah); None = lewati baris
ROWS = {
    1: ['idle_down', 'walk_down', 'idle_up', 'walk_up', 'idle_side', 'walk_side_a', 'walk_side'],
    2: ['atk1_down', 'atk2_down', 'atk1_up', 'atk2_up', 'atk1_side', 'atk2_side'],
    3: ['atk3_down', 'atk3_up', 'atk3_side', 'heavy_down', 'heavy_up', 'heavy_side'],
    4: ['roll_down', 'roll_up', 'roll_side', 'hurt', 'die', 'rise'],
    5: ['cast_down', 'cast_up', 'cast_side', 'bow_down', 'bow_side_a', 'bow_side', 'bow_up'],
    6: ['fish_cast', 'fish_pull', 'pick', 'hoe', 'cheer', 'cheer_b', 'sleep'],
}

def frames_of(path):
    im = np.array(Image.open(path).convert('RGB')).astype(int)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    bg = (r > 170) & (g < 110) & (b > 170) & (abs(r - b) < 70)
    fg = nd.binary_opening(~bg, iterations=1)
    lab, n = nd.label(nd.binary_dilation(fg, iterations=7))
    boxes = []
    for o in nd.find_objects(lab):
        y0, y1, x0, x1 = o[0].start + 7, o[0].stop - 7, o[1].start + 7, o[1].stop - 7
        if (y1 - y0) * (x1 - x0) > 1500: boxes.append([y0, y1, x0, x1])
    boxes.sort(key=lambda b: (b[0] + b[1]) / 2)
    rows, cur = [], []
    for bx in boxes:
        if cur and (bx[0] + bx[1]) / 2 - np.mean([(c[0] + c[1]) / 2 for c in cur]) > 90: rows.append(cur); cur = []
        cur.append(bx)
    if cur: rows.append(cur)
    rows = [sorted(rw, key=lambda b: b[2]) for rw in rows]
    # pusat kolom: median pusat-x per indeks kolom dari baris berisi 4 frame
    cols = np.median([[(b[2] + b[3]) / 2 for b in rw] for rw in rows if len(rw) == 4], axis=0)
    return im, ~bg, rows, cols

def shrink(im, mask, y0, y1, x0, x1):
    """pilih offset grid 0..P-1 dengan variasi blok terkecil, lalu ambil warna median per blok"""
    best = None
    for oy in range(P):
        for ox in range(P):
            ys, xs = y0 - P * 2 + oy, x0 - P * 2 + ox
            h, w = (y1 - ys) // P + 2, (x1 - xs) // P + 2
            blk = im[ys:ys + h * P, xs:xs + w * P].reshape(h, P, w, P, 3)
            v = blk.std(axis=(1, 3)).sum()
            if best is None or v < best[0]: best = (v, ys, xs, h, w)
    _, ys, xs, h, w = best
    blk = im[ys:ys + h * P, xs:xs + w * P].reshape(h, P, w, P, 3).transpose(0, 2, 1, 3, 4).reshape(h, w, P * P, 3)
    mk = mask[ys:ys + h * P, xs:xs + w * P].reshape(h, P, w, P).transpose(0, 2, 1, 3).reshape(h, w, P * P)
    out = np.zeros((h, w, 4), np.uint8)
    for j in range(h):
        for i in range(w):
            m = mk[j, i]
            if m.sum() * 2 <= P * P: continue
            px = blk[j, i][m]; out[j, i, :3] = np.median(px, axis=0); out[j, i, 3] = 255
    return out, ys, xs

def main():
    os.makedirs(SRC + '/rows', exist_ok=True)
    anims, strips = {}, []
    for s in range(1, 7):
        im, mask, rows, cols = frames_of(f'{SRC}/arka_sheet{s}.png')
        names = ROWS[s]
        if len(rows) != len(names): print(f'lembar {s}: {len(rows)} baris, ROWS punya {len(names)}', file=sys.stderr)
        for k, rw in enumerate(rows):
            name = names[k] if k < len(names) else f's{s}r{k + 1}'
            if name is None: continue
            base = max(b[1] for b in rw)                      # garis kaki baris
            fr = []
            for c, (y0, y1, x0, x1) in enumerate(rw):
                ci = int(np.argmin(abs(cols - (x0 + x1) / 2)))
                small, ys, xs = shrink(im, mask, y0, y1, x0, x1)
                cx = (cols[ci] - xs) / P; by = (base - ys) / P     # pusat kolom & kaki dalam koordinat kecil
                f = np.zeros((FH, FW, 4), np.uint8)
                dx, dy = int(round(FW / 2 - cx)), int(round(FH - 1 - by))
                hh, ww = small.shape[:2]
                sy0, sx0 = max(0, -dy), max(0, -dx); ty0, tx0 = max(0, dy), max(0, dx)
                hh2, ww2 = min(hh - sy0, FH - ty0), min(ww - sx0, FW - tx0)
                if hh2 > 0 and ww2 > 0: f[ty0:ty0 + hh2, tx0:tx0 + ww2] = small[sy0:sy0 + hh2, sx0:sx0 + ww2]
                fr.append(f)
            strip = np.concatenate(fr, axis=1)
            Image.fromarray(strip).resize((strip.shape[1] * 4, FH * 4), Image.NEAREST).save(f'{SRC}/rows/{s}_{k + 1}_{name}.png')
            anims[name] = [len(strips), len(fr)]; strips.append(fr)
    W = max(len(f) for f in strips) * FW
    atlas = np.zeros((len(strips) * FH, W, 4), np.uint8)
    for r, fr in enumerate(strips):
        for c, f in enumerate(fr): atlas[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = f
    Image.fromarray(atlas).save('assets/img/hero_arka.png')
    json.dump({'fw': FW, 'fh': FH, 'anims': anims}, open(f'{SRC}/hero_arka.json', 'w'), indent=0)
    print('atlas', atlas.shape, len(anims), 'animasi')

if __name__ == '__main__': main()
