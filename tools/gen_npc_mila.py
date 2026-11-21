#!/usr/bin/env python3
"""Potong lembar Mila dari pemilik (assets/raw/npc_mila/mila_sheet1.png, 4 kolom x 7 baris, latar magenta) jadi atlas game.
Baris sumber: 0 diam bawah memegang roti, 1 jalan bawah, 2 diam atas, 3 jalan atas, 4 diam samping, 5 jalan samping A, 6 jalan samping B.
Keluaran: assets/img/npc/mila_sheet.png (28 frame 32x32, kaki di baris bawah, tepi tajam, semua sisi menghadap KANAN supaya
flipX=true berarti kiri) + pratinjau 4x di scratch. Urutan frame atlas: baris sumber 0..6 x kolom 0..3 (index = baris*4 + kolom).
Pemakaian: venv/bin/python tools/gen_npc_mila.py [pratinjau.png]"""
import sys
import numpy as np
from PIL import Image
sys.path.insert(0, 'tools')
import gen_hero
from gen_hero import frames_of, shrink
from gen_enemy import dejunk

gen_hero.P = 4              # 1 piksel seni = 4 px gambar
FW = FH = 32
FLIP_ROWS = {5}             # baris sumber yang menghadap kiri -> dicerminkan jadi kanan

def main():
    im, mask, rows, cols = frames_of('assets/raw/npc_mila/mila_sheet1.png')
    assert len(rows) == 7, len(rows)
    atlas = np.zeros((FH * 7, FW * 4, 4), np.uint8)
    for r, rw in enumerate(rows):
        base = max(b[1] for b in rw)
        for c, (y0, y1, x0, x1) in enumerate(rw[:4]):
            ci = int(np.argmin(abs(cols - (x0 + x1) / 2)))
            small, ys, xs = shrink(im, mask, y0, y1, x0, x1)
            dejunk(small)
            cx = (cols[ci] - xs) / 4; by = (base - ys) / 4
            if r in FLIP_ROWS: small = small[:, ::-1]; cx = small.shape[1] - cx
            dx, dy = int(round(FW / 2 - cx)), int(round(FH - 1 - by))
            h, w = small.shape[:2]; f = np.zeros((FH, FW, 4), np.uint8)
            sy0, sx0, ty0, tx0 = max(0, -dy), max(0, -dx), max(0, dy), max(0, dx)
            hh, ww = min(h - sy0, FH - ty0), min(w - sx0, FW - tx0)
            if hh > 0 and ww > 0: f[ty0:ty0 + hh, tx0:tx0 + ww] = small[sy0:sy0 + hh, sx0:sx0 + ww]
            f[..., 3] = np.where(f[..., 3] > 0, 255, 0)
            atlas[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = f
    Image.fromarray(atlas).save('assets/img/npc/mila_sheet.png')
    if len(sys.argv) > 1:
        bg = Image.new('RGBA', (atlas.shape[1], atlas.shape[0]), (110, 150, 110, 255))
        bg.alpha_composite(Image.fromarray(atlas)); bg.resize((bg.width * 4, bg.height * 4), Image.NEAREST).save(sys.argv[1])
    print('atlas', atlas.shape)

if __name__ == '__main__': main()
