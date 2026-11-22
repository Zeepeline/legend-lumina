#!/usr/bin/env python3
"""
generate_new_animals.py
Membuat aset baru 100% fresh (dari scratch) untuk 5 satwa liar di Legenda Lumina:
- rabbit (kelinci)
- squirrel (tupai)
- deer (rusa)
- duck (bebek)
- owl (burung hantu)

Desain: Clean 16-bit pixel art bergaya Sprout Lands / ARPG klasik (chibi, imut, palet bersih, kontur tajam).
Ukuran: 128x32 px (4 frame per hewan, masing-masing 32x32 px).
"""

import os
from PIL import Image
import numpy as np

ARTIFACT_DIR = "/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479"
OUT_DIR = "assets/img/animals"

def hex_to_rgba(h, a=255):
    h = h.lstrip('#')
    return [int(h[i:i+2], 16) for i in (0, 2, 4)] + [a]

# =============================================================================
# 1. NEW RABBIT (Kelinci Imut - 4 Frame)
# Frame 0: Idle Sit (Telinga tegak, hidung mengendus)
# Frame 1: Crouch (Tubuh memadat, ancang-ancang)
# Frame 2: Hop Melompat (Airborne +3px, telinga rebah ke belakang)
# Frame 3: Landing (Kaki depan menyentuh tanah, pemulihan)
# =============================================================================
def draw_new_rabbit():
    # Palet
    K = hex_to_rgba('#22181c') # Outline gelap
    W = hex_to_rgba('#fffcf8') # Bulu putih utama
    S = hex_to_rgba('#e2d0ba') # Shading bulu
    D = hex_to_rgba('#baa48c') # Shading gelap
    P = hex_to_rgba('#f4a4b4') # Pink telinga dalam & hidung
    E = hex_to_rgba('#181014') # Mata hitam
    G = hex_to_rgba('#ffffff') # Kilau mata
    _ = [0, 0, 0, 0]           # Transparan

    # Frame 0: Sit Idle (32x32)
    # Kelinci menghadap ke kiri
    f0 = np.zeros((32, 32, 4), dtype=np.uint8)
    # Telinga (x=16..22, y=8..18)
    # Telinga belakang
    for y, x in [(9, 19), (10, 19), (11, 20), (12, 20), (13, 19)]: f0[y, x] = K
    for y, x in [(10, 18), (11, 19), (12, 19)]: f0[y, x] = S
    # Telinga depan
    for y, x in [(7, 16), (7, 17), (8, 15), (8, 18), (9, 15), (9, 18), (10, 15), (10, 18),
                 (11, 15), (11, 18), (12, 16), (12, 18), (13, 16), (13, 18)]: f0[y, x] = K
    for y, x in [(8, 16), (8, 17), (9, 16), (9, 17), (10, 16), (10, 17), (11, 16), (11, 17), (12, 17)]: f0[y, x] = P
    
    # Kepala (x=9..18, y=14..22)
    for y, x in [(14, 12), (14, 13), (14, 14), (14, 15),
                 (15, 11), (15, 16),
                 (16, 10), (16, 17),
                 (17, 9),  (17, 18),
                 (18, 9),  (18, 18),
                 (19, 10), (19, 18),
                 (20, 11), (20, 17),
                 (21, 12), (21, 16),
                 (22, 13), (22, 14), (22, 15)]: f0[y, x] = K
    # Isi kepala
    for y in range(15, 22):
        for x in range(11, 18):
            if f0[y, x, 3] == 0:
                f0[y, x] = W if y <= 18 and x <= 15 else S
    # Mata & Hidung
    f0[17, 11] = K; f0[17, 12] = E; f0[16, 12] = G
    f0[18, 9] = P # Hidung pink
    f0[19, 11] = P # Pipi semu

    # Badan & Paha (x=14..25, y=18..28)
    for y, x in [(18, 19), (18, 20), (19, 21), (19, 22), (20, 23), (21, 24),
                 (22, 24), (23, 25), (24, 25), (25, 25), (26, 24), (27, 23),
                 (28, 22), (28, 21), (28, 20), (28, 19), (28, 18), (28, 17),
                 (28, 16), (28, 15), (28, 14), (28, 13), (27, 12)]: f0[y, x] = K
    # Isi badan
    for y in range(19, 28):
        for x in range(13, 25):
            if f0[y, x, 3] == 0:
                f0[y, x] = W if (x <= 18 and y <= 24) else S
    # Ekor bulat di belakang (x=24..27, y=21..24)
    for y, x in [(21, 25), (21, 26), (22, 27), (23, 27), (24, 26), (24, 25)]: f0[y, x] = K
    for y, x in [(22, 25), (22, 26), (23, 25), (23, 26)]: f0[y, x] = W
    # Kaki depan & belakang di tanah
    for x in range(13, 16): f0[28, x] = K; f0[27, x] = W
    for x in range(18, 23): f0[28, x] = K; f0[27, x] = S

    # Frame 1: Crouch (Squash 2px down)
    f1 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                # Kepala & telinga turun 2px, telinga rebah ke kanan 1px
                if y <= 14: # telinga
                    ny = min(31, y + 2)
                    nx = min(31, x + 2)
                    f1[ny, nx] = f0[y, x]
                elif y <= 22: # kepala
                    ny = min(31, y + 2)
                    f1[ny, x] = f0[y, x]
                else: # badan memadat
                    f1[y, x] = f0[y, x]

    # Frame 2: Airborne Hop (Naik 4px, stretch ke depan)
    f2 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                ny = y - 4
                nx = x - 1
                if 0 <= ny < 32 and 0 <= nx < 32:
                    # Telinga rebah ke belakang ditiup angin
                    if y <= 14:
                        nx = min(31, nx + 3)
                        f2[ny, nx] = f0[y, x]
                    # Kaki belakang menendang lurus ke belakang
                    elif y >= 25 and x >= 18:
                        f2[min(31, ny + 1), min(31, nx + 2)] = f0[y, x]
                    # Kaki depan menjangkau ke depan
                    elif y >= 25 and x <= 17:
                        f2[ny, max(0, nx - 2)] = f0[y, x]
                    else:
                        f2[ny, nx] = f0[y, x]
    # Bayangan kecil di tanah
    for sx in range(13, 22): f2[29, sx] = [40, 20, 30, 70]

    # Frame 3: Landing (Kaki depan menyentuh tanah, telinga sedikit terlempar ke depan)
    f3 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if y <= 14: # Telinga condong ke depan 1px dari inersia
                    f3[y, max(0, x - 1)] = f0[y, x]
                else:
                    f3[y, x] = f0[y, x]

    return [f0, f1, f2, f3]

# =============================================================================
# 2. NEW SQUIRREL (Tupai Imut dengan Ekor Rimbun - 4 Frame)
# Frame 0: Idle Hold Nut (Pegang kenari, ekor melengkung indah)
# Frame 1: Nibble Chew (Kepala bergoyang 1px, kunyah kenari)
# Frame 2: Alert (Kepala tegak, mata berkilau waspada)
# Frame 3: Tail Swish (Ekor mengibas lembut ke depan)
# =============================================================================
def draw_new_squirrel():
    K = hex_to_rgba('#261412') # Outline cokelat tua
    R = hex_to_rgba('#d46222') # Bulu jingga kemerahan
    L = hex_to_rgba('#ea8238') # Highlight bulu
    S = hex_to_rgba('#9c3e14') # Bayangan bulu
    B = hex_to_rgba('#fce8cc') # Perut & pipi krem
    N = hex_to_rgba('#dca042') # Kenari / acorn emas
    NC = hex_to_rgba('#6a3818') # Tutup kenari
    E = hex_to_rgba('#1a0c0a') # Mata hitam
    G = hex_to_rgba('#ffffff') # Kilau mata

    f0 = np.zeros((32, 32, 4), dtype=np.uint8)
    
    # Ekor Tupai Rimbun (Besar di kanan, x=18..29, y=8..27)
    tail_pts = [
        (8, 22), (8, 23), (8, 24),
        (9, 21), (9, 25), (9, 26),
        (10, 20), (10, 27),
        (11, 20), (11, 28),
        (12, 20), (12, 28),
        (13, 21), (13, 28),
        (14, 21), (14, 28),
        (15, 22), (15, 27),
        (16, 22), (16, 27),
        (17, 23), (17, 26),
        (18, 23), (18, 25),
        (19, 24), (20, 24)
    ]
    for y, x in tail_pts: f0[y, x] = K
    # Isi ekor dengan gradasi jingga
    for y in range(9, 20):
        for x in range(21, 28):
            if f0[y, x, 3] == 0:
                f0[y, x] = L if x >= 24 else R
    for y in range(12, 23):
        for x in range(21, 26):
            if f0[y, x, 3] == 0:
                f0[y, x] = R if y <= 16 else S

    # Kepala & Telinga (x=8..17, y=10..18)
    # Telinga
    f0[10, 14] = K; f0[10, 15] = R; f0[11, 14] = K; f0[11, 15] = B
    f0[10, 17] = K; f0[11, 17] = S; f0[11, 18] = K
    # Batas kepala
    for y, x in [(12, 12), (12, 13), (12, 14), (12, 15), (12, 16),
                 (13, 10), (13, 11), (13, 17),
                 (14, 9),  (14, 18),
                 (15, 8),  (15, 18),
                 (16, 8),  (16, 17),
                 (17, 9),  (17, 16),
                 (18, 10), (18, 15)]: f0[y, x] = K
    # Isi kepala
    for y in range(13, 18):
        for x in range(9, 17):
            if f0[y, x, 3] == 0:
                f0[y, x] = B if (x <= 12 and y >= 15) else (L if y <= 14 else R)
    # Mata & Hidung
    f0[14, 11] = K; f0[14, 12] = E; f0[13, 12] = G
    f0[15, 8] = K

    # Badan & Kaki (x=12..21, y=18..28)
    for y, x in [(18, 16), (19, 17), (20, 18), (21, 19), (22, 20), (23, 20),
                 (24, 20), (25, 19), (26, 18), (27, 17), (28, 16), (28, 15),
                 (28, 14), (28, 13), (28, 12), (27, 11), (26, 11), (25, 12),
                 (24, 12), (23, 12), (22, 12), (21, 12), (20, 13), (19, 14)]: f0[y, x] = K
    # Isi badan
    for y in range(19, 28):
        for x in range(12, 20):
            if f0[y, x, 3] == 0:
                f0[y, x] = B if x <= 15 else S

    # Kenari (Acorn) di tangan (x=9..13, y=18..21)
    f0[18, 10] = NC; f0[18, 11] = NC; f0[18, 12] = NC
    f0[19, 9] = K;   f0[19, 10] = N;  f0[19, 11] = N;  f0[19, 12] = K
    f0[20, 10] = N;  f0[20, 11] = N;  f0[21, 10] = K;  f0[21, 11] = K
    # Cakar depan memegang kenari
    f0[19, 9] = B; f0[20, 12] = B

    # Frame 1: Nibble Chew (Kepala turun 1px, ekor goyang sedikit)
    f1 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                # Kepala turun 1px
                if x <= 18 and y <= 18:
                    f1[min(31, y + 1), x] = f0[y, x]
                # Ekor melambai mundur 1px
                elif x >= 20 and y <= 15:
                    f1[y, min(31, x + 1)] = f0[y, x]
                else:
                    f1[y, x] = f0[y, x]

    # Frame 2: Alert (Kepala naik 1px, telinga tegak, mata berkilau besar)
    f2 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if x <= 18 and y <= 18:
                    f2[max(0, y - 1), x] = f0[y, x]
                elif x >= 20 and y <= 18: # Ekor tegang ke atas
                    f2[max(0, y - 1), x] = f0[y, x]
                else:
                    f2[y, x] = f0[y, x]
    # Ekstra kilau di mata
    f2[13, 11] = G

    # Frame 3: Tail Swish (Ekor melengkung maju ke depan)
    f3 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if x >= 20 and y <= 14:
                    f3[y, max(0, x - 1)] = f0[y, x]
                else:
                    f3[y, x] = f0[y, x]

    return [f0, f1, f2, f3]

# =============================================================================
# 3. NEW DEER (Rusa Anggun dengan Tanduk Gagah - 4 Frame)
# Frame 0: Proud Stance (Berdiri gagah, dada bidang, tanduk bercabang)
# Frame 1: Bow Head (Menundukkan kepala ke arah rumput)
# Frame 2: Grazing (Merumput di tanah, ekor mengibas)
# Frame 3: Step & Raise (Mengangkat kepala, kaki depan melangkah)
# =============================================================================
def draw_new_deer():
    K = hex_to_rgba('#281612') # Outline cokelat gelap
    B = hex_to_rgba('#b66832') # Cokelat tubuh rusa
    L = hex_to_rgba('#d68a48') # Highlight bulu
    S = hex_to_rgba('#7a3a18') # Shading tubuh
    W = hex_to_rgba('#fae8d2') # Bintik putih & perut
    A = hex_to_rgba('#e4b878') # Tanduk emas bercabang
    E = hex_to_rgba('#1c0c08') # Mata hitam

    f0 = np.zeros((32, 32, 4), dtype=np.uint8)

    # Tanduk Bercabang Megah (x=5..19, y=2..9)
    antlers = [
        (2, 7), (2, 14), (3, 7), (3, 14), (4, 8), (4, 13),
        (3, 5), (3, 16), (4, 6), (4, 15), # Cabang samping
        (5, 9), (5, 12), (6, 9), (6, 12), (7, 10), (7, 11)
    ]
    for y, x in antlers: f0[y, x] = A
    # Outline tanduk
    for y, x in antlers:
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < 32 and 0 <= nx < 32 and f0[ny, nx, 3] == 0:
                f0[ny, nx] = K

    # Kepala Rusa (x=7..15, y=9..15)
    for y, x in [(9, 9), (9, 10), (9, 11), (9, 12),
                 (10, 8), (10, 13),
                 (11, 7), (11, 14),
                 (12, 6), (12, 14),
                 (13, 6), (13, 13),
                 (14, 7), (14, 12),
                 (15, 8), (15, 9), (15, 10), (15, 11)]: f0[y, x] = K
    for y in range(10, 15):
        for x in range(7, 14):
            if f0[y, x, 3] == 0:
                f0[y, x] = L if y <= 11 else B
    # Mata & moncong
    f0[11, 9] = E; f0[13, 6] = K; f0[14, 7] = W

    # Leher anggun (x=9..14, y=14..18)
    for y in range(15, 19):
        f0[y, 9] = K; f0[y, 14] = K
        for x in range(10, 14): f0[y, x] = B

    # Badan Rusa (x=11..25, y=17..23)
    for y, x in [(17, 14), (17, 15), (17, 16), (17, 17), (17, 18), (17, 19), (17, 20), (17, 21), (17, 22), (17, 23),
                 (18, 24), (19, 25), (20, 25), (21, 24), (22, 23),
                 (23, 22), (23, 21), (23, 20), (23, 19), (23, 18), (23, 17), (23, 16), (23, 15), (23, 14), (23, 13),
                 (22, 12), (21, 11), (20, 11), (19, 12), (18, 13)]: f0[y, x] = K
    for y in range(18, 23):
        for x in range(12, 25):
            if f0[y, x, 3] == 0:
                f0[y, x] = S if y >= 22 else B
    # Bintik putih khas rusa
    f0[19, 16] = W; f0[19, 20] = W; f0[20, 18] = W; f0[20, 22] = W

    # Ekor kecil di belakang (x=24..26, y=17..20)
    f0[18, 25] = K; f0[18, 26] = W; f0[19, 26] = K

    # 4 Kaki Jenjang (Kaki depan x=12..15, Kaki belakang x=21..24, y=23..29)
    # Kaki depan kiri & kanan
    for y in range(23, 29):
        f0[y, 13] = B; f0[y, 15] = S
    f0[29, 13] = K; f0[29, 15] = K # Kuku hitam
    # Kaki belakang kiri & kanan
    for y in range(23, 29):
        f0[y, 21] = B; f0[y, 23] = S
    f0[29, 21] = K; f0[29, 23] = K

    # Frame 1: Bow Head (Kepala turun 3px, maju 1px)
    f1 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                # Kepala & leher & tanduk turun 3px, condong kiri 1px
                if y <= 18 and x <= 15:
                    ny = min(31, y + 3)
                    nx = max(0, x - 1)
                    f1[ny, nx] = f0[y, x]
                else:
                    f1[y, x] = f0[y, x]

    # Frame 2: Grazing Nibble (Kepala menyentuh tanah, ekor tegak)
    f2 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if y <= 18 and x <= 15:
                    ny = min(31, y + 6)
                    nx = max(0, x - 2)
                    f2[ny, nx] = f0[y, x]
                elif x >= 24 and y <= 20: # Ekor mengibas naik
                    f2[max(0, y - 1), x] = f0[y, x]
                else:
                    f2[y, x] = f0[y, x]

    # Frame 3: Step & Raise (Kepala naik, kaki depan melangkah)
    f3 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if y <= 18 and x <= 15: # Kepala setengah naik
                    f3[min(31, y + 1), x] = f0[y, x]
                elif 12 <= x <= 16 and y >= 24: # Kaki depan kiri terangkat 1px
                    f3[max(0, y - 1), max(0, x - 1)] = f0[y, x]
                else:
                    f3[y, x] = f0[y, x]

    return [f0, f1, f2, f3]

# =============================================================================
# 4. NEW DUCK (Bebek Mallard Cantik - 4 Frame)
# Frame 0: Idle Float / Stand (Kepala zamrud, paruh jingga, bulu rapi)
# Frame 1: Waddle Step (Goyang waddle, langkah kaki berselaput)
# Frame 2: Dabble Peck (Mematuk ke air/tanah, ekor terangkat)
# Frame 3: Wing Flutter (Kepak sayap ceria, bulu mengembang)
# =============================================================================
def draw_new_duck():
    K = hex_to_rgba('#1c1e18') # Outline gelap
    G = hex_to_rgba('#288844') # Hijau zamrud kepala
    GL = hex_to_rgba('#3ec468')# Kilau hijau kepala
    W = hex_to_rgba('#fcfcf8') # Cincin leher putih
    B = hex_to_rgba('#84522c') # Dada cokelat
    BL = hex_to_rgba('#a87042')# Sayap cokelat terang
    S = hex_to_rgba('#58361e') # Bayangan sayap
    O = hex_to_rgba('#f28418') # Paruh & kaki jingga
    E = hex_to_rgba('#141414') # Mata hitam

    f0 = np.zeros((32, 32, 4), dtype=np.uint8)

    # Kepala Bebek (x=8..16, y=10..17)
    for y, x in [(10, 11), (10, 12), (10, 13), (10, 14),
                 (11, 10), (11, 15),
                 (12, 9),  (12, 16),
                 (13, 9),  (13, 16),
                 (14, 9),  (14, 16),
                 (15, 10), (15, 15)]: f0[y, x] = K
    for y in range(11, 15):
        for x in range(10, 16):
            if f0[y, x, 3] == 0:
                f0[y, x] = GL if (x <= 13 and y <= 12) else G
    # Mata
    f0[12, 12] = E; f0[11, 12] = [255, 255, 255, 255]

    # Paruh Bebek Jingga (x=4..9, y=13..15)
    f0[13, 5] = K; f0[13, 6] = K; f0[13, 7] = K; f0[13, 8] = K
    f0[14, 4] = K; f0[14, 5] = O; f0[14, 6] = O; f0[14, 7] = O; f0[14, 8] = O
    f0[15, 5] = K; f0[15, 6] = K; f0[15, 7] = K

    # Cincin Leher Putih (y=16, x=10..15)
    for x in range(10, 16): f0[16, x] = W

    # Badan Bebek (x=9..24, y=17..26)
    for y, x in [(17, 10), (17, 16), (17, 17), (17, 18), (17, 19), (17, 20),
                 (18, 9),  (18, 21), (18, 22), (18, 23),
                 (19, 8),  (19, 24), # Ujung ekor
                 (20, 8),  (20, 23),
                 (21, 8),  (21, 22),
                 (22, 9),  (22, 21),
                 (23, 10), (23, 20),
                 (24, 11), (24, 12), (24, 13), (24, 14), (24, 15), (24, 16), (24, 17), (24, 18), (24, 19)]: f0[y, x] = K
    for y in range(18, 24):
        for x in range(9, 23):
            if f0[y, x, 3] == 0:
                f0[y, x] = B if x <= 13 else (BL if y <= 20 else S)
    # Garis sayap biru royal mallard khas
    f0[20, 16] = [40, 80, 200, 255]; f0[20, 17] = [40, 80, 200, 255]; f0[20, 18] = W

    # Kaki Selaput Jingga (x=12..18, y=25..28)
    f0[25, 13] = O; f0[26, 13] = O; f0[27, 12] = O; f0[27, 13] = O; f0[27, 14] = O
    f0[25, 17] = O; f0[26, 17] = O; f0[27, 16] = O; f0[27, 17] = O; f0[27, 18] = O

    # Frame 1: Waddle Step (Badan bergeser 1px, kaki melangkah bergantian)
    f1 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if y <= 24: # Badan & kepala goyang turun 1px
                    f1[min(31, y + 1), x] = f0[y, x]
                elif 12 <= x <= 15: # Kaki kiri melangkah maju 1px
                    f1[y, max(0, x - 1)] = f0[y, x]
                else:
                    f1[y, x] = f0[y, x]

    # Frame 2: Dabble Peck (Paruh & kepala menyentuh air/tanah)
    f2 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if x <= 16 and y <= 16: # Kepala turun 3px, maju 1px
                    ny = min(31, y + 3)
                    nx = max(0, x - 1)
                    f2[ny, nx] = f0[y, x]
                elif x >= 20 and y <= 21: # Ekor terangkat 1px
                    f2[max(0, y - 1), x] = f0[y, x]
                else:
                    f2[y, x] = f0[y, x]

    # Frame 3: Wing Flutter (Sayap mengembang ke samping)
    f3 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                if 14 <= x <= 22 and 18 <= y <= 22:
                    # Sayap mengembang naik 2px
                    f3[max(0, y - 2), x] = f0[y, x]
                    f3[max(0, y - 1), min(31, x + 1)] = BL
                else:
                    f3[y, x] = f0[y, x]

    return [f0, f1, f2, f3]

# =============================================================================
# 5. NEW OWL (Burung Hantu Bijak & Imut - 4 Frame)
# Frame 0: Perched Watchful (Mata emas bulat besar, bulu dada anggun)
# Frame 1: Slow Sleepy Blink (Kedip mata lembut, bulu mengembang)
# Frame 2: Head Swivel 45 deg (Putaran kepala khas burung hantu ke kiri)
# Frame 3: Wing Rustle (Kepala kembali, kibas sayap pelan)
# =============================================================================
def draw_new_owl():
    K = hex_to_rgba('#201416') # Outline cokelat tua
    B = hex_to_rgba('#8c5026') # Bulu cokelat tubuh
    L = hex_to_rgba('#b8723c') # Bulu cokelat terang
    S = hex_to_rgba('#5a2e14') # Bayangan sayap
    F = hex_to_rgba('#faeed8') # Cakram wajah & dada krem
    Y = hex_to_rgba('#f4b824') # Mata emas terang
    O = hex_to_rgba('#ea7818') # Paruh jingga
    E = hex_to_rgba('#180a0c') # Pupil mata hitam
    G = hex_to_rgba('#ffffff') # Kilau mata

    f0 = np.zeros((32, 32, 4), dtype=np.uint8)

    # Rumbai Telinga (Ear Tufts, x=8..10 & x=21..23, y=5..8)
    for y, x in [(5, 9), (6, 9), (6, 10), (7, 10),
                 (5, 22), (6, 22), (6, 21), (7, 21)]: f0[y, x] = K
    f0[6, 9] = L; f0[6, 22] = L

    # Kepala Bulat Burung Hantu (x=8..23, y=8..18)
    for y, x in [(8, 11), (8, 12), (8, 13), (8, 14), (8, 15), (8, 16), (8, 17), (8, 18), (8, 19), (8, 20),
                 (9, 10), (9, 21),
                 (10, 9), (10, 22),
                 (11, 8), (11, 23),
                 (12, 8), (12, 23),
                 (13, 8), (13, 23),
                 (14, 8), (14, 23),
                 (15, 9), (15, 22),
                 (16, 10), (16, 21),
                 (17, 11), (17, 20),
                 (18, 12), (18, 13), (18, 18), (18, 19)]: f0[y, x] = K
    for y in range(9, 18):
        for x in range(9, 23):
            if f0[y, x, 3] == 0:
                f0[y, x] = F

    # Dua Mata Bulat Emas Raksasa (x=10..14 & x=17..21, y=10..14)
    # Mata Kiri
    for y, x in [(10, 11), (10, 12), (10, 13), (14, 11), (14, 12), (14, 13),
                 (11, 10), (12, 10), (13, 10), (11, 14), (12, 14), (13, 14)]: f0[y, x] = K
    for y in range(11, 14):
        for x in range(11, 14): f0[y, x] = Y
    f0[12, 12] = E; f0[13, 12] = E; f0[11, 13] = G

    # Mata Kanan
    for y, x in [(10, 18), (10, 19), (10, 20), (14, 18), (14, 19), (14, 20),
                 (11, 17), (12, 17), (13, 17), (11, 21), (12, 21), (13, 21)]: f0[y, x] = K
    for y in range(11, 14):
        for x in range(18, 21): f0[y, x] = Y
    f0[12, 19] = E; f0[13, 19] = E; f0[11, 20] = G

    # Paruh Kecil di Tengah (x=15..16, y=14..16)
    f0[14, 15] = O; f0[14, 16] = O; f0[15, 15] = O; f0[15, 16] = K; f0[16, 15] = K

    # Badan & Sayap Terlipat (x=8..23, y=18..27)
    for y, x in [(18, 8), (18, 23),
                 (19, 8), (19, 23),
                 (20, 8), (20, 23),
                 (21, 9), (21, 22),
                 (22, 9), (22, 22),
                 (23, 10), (23, 21),
                 (24, 11), (24, 20),
                 (25, 12), (25, 19),
                 (26, 13), (26, 14), (26, 15), (26, 16), (26, 17), (26, 18)]: f0[y, x] = K
    # Dada krem
    for y in range(19, 26):
        for x in range(13, 19):
            if f0[y, x, 3] == 0:
                f0[y, x] = F
    # Bintik bulu dada
    f0[20, 14] = B; f0[20, 17] = B; f0[22, 15] = B; f0[22, 16] = B; f0[24, 14] = B; f0[24, 17] = B
    # Sayap cokelat di sisi kiri & kanan
    for y in range(19, 25):
        for x in range(9, 13):
            if f0[y, x, 3] == 0: f0[y, x] = L if x >= 11 else S
        for x in range(19, 23):
            if f0[y, x, 3] == 0: f0[y, x] = L if x <= 20 else S

    # Cakar bertengger di dahan (x=12..14 & x=17..19, y=27..28)
    for x in [12, 13, 14, 17, 18, 19]: f0[27, x] = O; f0[28, x] = K

    # Frame 1: Slow Sleepy Blink (Kelopak mata menutup setengah jadi imut)
    f1 = f0.copy()
    # Tutup kelopak mata atas dengan bulu krem
    for y in [10, 11, 12]:
        for x in range(11, 14): f1[y, x] = F
        for x in range(18, 21): f1[y, x] = F
    # Garis mata tidur tipis di y=13
    for x in [11, 12, 13, 18, 19, 20]: f1[13, x] = K

    # Frame 2: Head Swivel 45 deg to Left! (Kepala berputar ke kiri, badan tetap)
    f2 = np.zeros_like(f0)
    # Salin badan tetap bertengger
    for y in range(19, 32):
        for x in range(32):
            f2[y, x] = f0[y, x]
    # Kepala bergeser ke kiri 3px
    for y in range(0, 19):
        for x in range(32):
            if f0[y, x, 3] > 0:
                nx = max(0, x - 3)
                f2[y, nx] = f0[y, x]

    # Frame 3: Wing Rustle (Kepala kembali, sayap mengembang 1px)
    f3 = np.zeros_like(f0)
    for y in range(32):
        for x in range(32):
            if f0[y, x, 3] > 0:
                # Sayap di sisi kiri & kanan mengembang 1px
                if (x <= 11 or x >= 20) and 18 <= y <= 25:
                    f3[max(0, y - 1), x] = f0[y, x]
                else:
                    f3[y, x] = f0[y, x]

    return [f0, f1, f2, f3]

# =============================================================================
# MAIN RUNNER
# =============================================================================
def main():
    animals = {
        'rabbit': draw_new_rabbit(),
        'squirrel': draw_new_squirrel(),
        'deer': draw_new_deer(),
        'duck': draw_new_duck(),
        'owl': draw_new_owl(),
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    for name, frames_arr in animals.items():
        w, h = 32, 32
        strip = Image.new('RGBA', (w * 4, h), (0, 0, 0, 0))
        pil_frames = []
        for i, arr in enumerate(frames_arr):
            im = Image.fromarray(arr, 'RGBA')
            strip.paste(im, (i * w, 0))
            pil_frames.append(im)

        # Simpan ke assets/img/animals/ani_<name>.png
        out_path = f"{OUT_DIR}/ani_{name}.png"
        strip.save(out_path)
        print(f"Saved new clean animal strip: {out_path} ({strip.size})")

        # Simpan preview 4x di artifact
        strip_4x = strip.resize((w * 4 * 4, h * 4), Image.NEAREST)
        strip_4x.save(f"{ARTIFACT_DIR}/new_{name}_strip_4x.png")

        # Simpan animated GIF 4x
        gif_frames = [im.resize((w * 4, h * 4), Image.NEAREST) for im in pil_frames]
        gif_path = f"{ARTIFACT_DIR}/new_{name}.gif"
        durations = [240, 180, 240, 180] if name == 'rabbit' else [260, 200, 260, 200]
        gif_frames[0].save(
            gif_path,
            save_all=True,
            append_images=gif_frames[1:],
            duration=durations,
            loop=0,
            disposal=2
        )
        print(f"Saved new animated GIF: {gif_path}")

    # Buat perbandingan berdampingan: Aset Lama vs Aset Baru!
    print("Generating side-by-side comparison...")
    names = ['rabbit', 'squirrel', 'deer', 'duck', 'owl']
    comp_w = 64 * len(names)
    comp_h = 64 * 2 + 24 # 2 baris (Lama vs Baru)

    comp_frames = []
    for f in range(4):
        canvas = Image.new('RGBA', (comp_w, comp_h), (28, 32, 40, 255))
        for i, name in enumerate(names):
            # Baris 1: Aset Lama (dari orig/)
            orig_path = f"{OUT_DIR}/orig/ani_{name}.png"
            if os.path.exists(orig_path):
                old_im = Image.open(orig_path).convert('RGBA')
                old_scaled = old_im.resize((64, 64), Image.NEAREST)
                canvas.paste(old_scaled, (i * 64, 8), old_scaled)

            # Baris 2: Aset Baru Animasi Frame f
            new_arr = animals[name][f]
            new_im = Image.fromarray(new_arr, 'RGBA')
            new_scaled = new_im.resize((64, 64), Image.NEAREST)
            canvas.paste(new_scaled, (i * 64, 80), new_scaled)
        comp_frames.append(canvas)

    comp_gif = f"{ARTIFACT_DIR}/animals_old_vs_new_comparison.gif"
    comp_frames[0].save(
        comp_gif,
        save_all=True,
        append_images=comp_frames[1:],
        duration=[260, 200, 260, 200],
        loop=0,
        disposal=2
    )
    print(f"Saved comparison GIF: {comp_gif}")

if __name__ == '__main__':
    main()
