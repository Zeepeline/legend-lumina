import os, math
import numpy as np
from PIL import Image, ImageDraw

# Generator Pengganti Runtime Spritesheet Game:
# Dari Stickman (gen_humanoid_sheets.py) -> Chibi ARPG Padat 100% Setara Arka
# Keluaran:
# 1. assets/img/monsters/esh_slaver.png (4 kolom x 6 baris, fw=76, fh=50)
# 2. assets/img/monsters/esh_slaver_captain.png (4 kolom x 6 baris, fw=114, fh=80)

arka_img = Image.open('assets/img/hero/hero_arka.png').convert('RGBA')
scimitar_img = Image.open('tools/sword_src/bandit_scimitar.png').convert('RGBA')
axe_img = Image.open('tools/sword_src/real_battleaxe.png').convert('RGBA')
fist_img = Image.open('tools/sword_src/fist_grip.png').convert('RGBA')

HERO_FW, HERO_FH = 48, 40
PV_SCIM = (5.5, 4.5)
PV_AXE  = (4.5, 7.5)
PV_FIST = (2.5, 2.5)

# Pemetaan Baris Atlas ESH (4 kolom x 6 baris):
# Row 0: idle
# Row 1: move
# Row 2: wind (ancang-ancang)
# Row 3: atk (tebasan)
# Row 4: hurt (kena pukul)
# Row 5: alert (siaga)

def stamp(dst, spr, cx, cy, ang, pivot):
    ca, sa = math.cos(ang), math.sin(ang)
    w, h = spr.size
    ext = int(max(w, h)) + 2
    for y in range(int(cy) - ext, int(cy) + ext + 1):
        for x in range(int(cx) - ext, int(cx) + ext + 1):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            u = dx * ca + dy * sa + pivot[0]
            v = -dx * sa + dy * ca + pivot[1]
            if 0 <= u < w and 0 <= v < h and 0 <= x < dst.width and 0 <= y < dst.height:
                p = spr.getpixel((int(u), int(v)))
                if p[3] > 20: dst.putpixel((x, y), p)

def transform_to_bandit(cell_crop):
    arr = np.array(cell_crop).astype(int)
    # Kulit sawo matang
    mask_skin = (arr[..., 3] > 200) & (arr[..., 0] >= 185) & (arr[..., 1] >= 115) & (arr[..., 0] > arr[..., 1]) & (arr[..., 1] > arr[..., 2])
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 0.90, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 0.77, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 0.60, 0, 255)
    # Rambut hitam legam
    mask_hair = (arr[..., 3] > 200) & (arr[..., 0] < 185) & (arr[..., 0] > arr[..., 1]) & (arr[..., 1] > arr[..., 2]) & (arr[..., 0] > 35)
    arr[mask_hair, 0] = np.clip(arr[mask_hair, 0] * 0.35, 0, 255)
    arr[mask_hair, 1] = np.clip(arr[mask_hair, 1] * 0.32, 0, 255)
    arr[mask_hair, 2] = np.clip(arr[mask_hair, 2] * 0.35, 0, 255)
    # Rompi kulit cokelat tua
    mask_cloth = (arr[..., 3] > 200) & (arr[..., 2] > arr[..., 0] + 10)
    arr[mask_cloth, 0] = 58
    arr[mask_cloth, 1] = 44
    arr[mask_cloth, 2] = 40
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')

def transform_to_boss(cell_crop):
    arr = np.array(cell_crop).astype(int)
    # Kulit sawo matang brawler
    mask_skin = (arr[..., 3] > 200) & (arr[..., 0] >= 185) & (arr[..., 1] >= 115) & (arr[..., 0] > arr[..., 1]) & (arr[..., 1] > arr[..., 2])
    arr[mask_skin, 0] = np.clip(arr[mask_skin, 0] * 0.88, 0, 255)
    arr[mask_skin, 1] = np.clip(arr[mask_skin, 1] * 0.75, 0, 255)
    arr[mask_skin, 2] = np.clip(arr[mask_skin, 2] * 0.58, 0, 255)
    # Rompi zirah perang gelap
    mask_cloth = (arr[..., 3] > 200) & (arr[..., 2] > arr[..., 0] + 10)
    arr[mask_cloth, 0] = 68
    arr[mask_cloth, 1] = 48
    arr[mask_cloth, 2] = 42
    # Rambut hitam
    mask_hair = (arr[..., 3] > 200) & (arr[..., 0] < 185) & (arr[..., 0] > arr[..., 1]) & (arr[..., 1] > arr[..., 2]) & (arr[..., 0] > 35)
    arr[mask_hair, 0] = np.clip(arr[mask_hair, 0] * 0.32, 0, 255)
    arr[mask_hair, 1] = np.clip(arr[mask_hair, 1] * 0.30, 0, 255)
    arr[mask_hair, 2] = np.clip(arr[mask_hair, 2] * 0.35, 0, 255)
    out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    # Janggut alami di dagu bawah
    for y in range(25, 28):
        for x in range(18, 32):
            if y < out.height and x < out.width:
                p = out.getpixel((x, y))
                if p[3] > 200 and p[0] > 140 and p[1] > 80 and p[0] > p[1]:
                    out.putpixel((x, y), (42, 30, 36, 255))
    return out

# Konfigurasi Frame Animasi ESH (Baris Arka, Sudut Senjata, Posisi Tangan)
ESH_SETUP_SLAVER = {
    # row 0: idle
    0: [{"ra": 4, "col": c, "hx": 27.0, "hy": 29.0, "ang": 0.2} for c in range(4)],
    # row 1: move (walk)
    1: [{"ra": 6, "col": c, "hx": 28.0, "hy": 28.5, "ang": 0.3} for c in range(4)],
    # row 2: wind (ancang-ancang)
    2: [{"ra": 18, "col": 0, "hx": 26.5, "hy": 28.0, "ang": 2.1},
        {"ra": 18, "col": 1, "hx": 29.0, "hy": 22.0, "ang": -2.2},
        {"ra": 15, "col": 1, "hx": 27.0, "hy": 21.0, "ang": 0.0},
        {"ra": 18, "col": 1, "hx": 29.0, "hy": 22.0, "ang": -2.2}],
    # row 3: atk (tebasan golok)
    3: [{"ra": 11, "col": 2, "hx": 33.5, "hy": 26.0, "ang": -0.6},
        {"ra": 11, "col": 3, "hx": 29.0, "hy": 27.5, "ang": -1.1},
        {"ra": 12, "col": 2, "hx": 32.5, "hy": 26.0, "ang": 0.8},
        {"ra": 18, "col": 2, "hx": 34.0, "hy": 28.0, "ang": 0.0}],
    # row 4: hurt (kena pukul)
    4: [{"ra": 22, "col": 2, "hx": 22.0, "hy": 26.0, "ang": -0.8},
        {"ra": 22, "col": 3, "hx": 20.0, "hy": 28.0, "ang": -1.2},
        {"ra": 22, "col": 2, "hx": 22.0, "hy": 26.0, "ang": -0.8},
        {"ra": 22, "col": 3, "hx": 20.0, "hy": 28.0, "ang": -1.2}],
    # row 5: alert (siaga)
    5: [{"ra": 18, "col": 0, "hx": 26.5, "hy": 28.0, "ang": 1.8},
        {"ra": 18, "col": 0, "hx": 26.5, "hy": 28.0, "ang": 1.9},
        {"ra": 18, "col": 0, "hx": 26.5, "hy": 28.0, "ang": 2.0},
        {"ra": 18, "col": 0, "hx": 26.5, "hy": 28.0, "ang": 1.9}]
}

ESH_SETUP_CAPTAIN = {
    # row 0: idle
    0: [{"ra": 4, "col": c, "hx": 26.0, "hy": 29.0, "ang": 0.2} for c in range(4)],
    # row 1: move (walk)
    1: [{"ra": 6, "col": c, "hx": 27.0, "hy": 28.0, "ang": 0.3} for c in range(4)],
    # row 2: wind (ancang-ancang angkat kapak ke atas kepala)
    2: [{"ra": 18, "col": 0, "hx": 18.0, "hy": 32.0, "ang": 2.6},
        {"ra": 18, "col": 1, "hx": 28.0, "hy": 13.0, "ang": -1.8},
        {"ra": 18, "col": 1, "hx": 28.0, "hy": 12.0, "ang": -2.0},
        {"ra": 18, "col": 1, "hx": 28.0, "hy": 13.0, "ang": -1.8}],
    # row 3: atk (hantaman kapak seismik)
    3: [{"ra": 11, "col": 2, "hx": 33.0, "hy": 22.0, "ang": -0.8},
        {"ra": 12, "col": 2, "hx": 34.0, "hy": 25.0, "ang": 0.6},
        {"ra": 12, "col": 2, "hx": 34.0, "hy": 34.0, "ang": 1.4},
        {"ra": 12, "col": 3, "hx": 32.0, "hy": 35.0, "ang": 1.5}],
    # row 4: hurt (kena pukul)
    4: [{"ra": 22, "col": 2, "hx": 22.0, "hy": 26.0, "ang": -0.8},
        {"ra": 22, "col": 3, "hx": 20.0, "hy": 28.0, "ang": -1.2},
        {"ra": 22, "col": 2, "hx": 22.0, "hy": 26.0, "ang": -0.8},
        {"ra": 22, "col": 3, "hx": 20.0, "hy": 28.0, "ang": -1.2}],
    # row 5: alert (siaga / auman)
    5: [{"ra": 18, "col": 3, "hx": 32.0, "hy": 20.0, "ang": -0.5},
        {"ra": 18, "col": 3, "hx": 32.0, "hy": 20.0, "ang": -0.5},
        {"ra": 15, "col": 2, "hx": 28.0, "hy": 26.0, "ang": 0.1},
        {"ra": 4,  "col": 0, "hx": 26.0, "hy": 29.0, "ang": 0.2}]
}

def bake_sheet(target_path, fw, fh, scale, weapon_img, pivot_w, transform_fn, setup):
    sheet = Image.new('RGBA', (fw * 4, fh * 6), (0, 0, 0, 0))
    for r in range(6):
        frames = setup[r]
        for c in range(4):
            cfg = frames[c]
            ra, col = cfg["ra"], cfg["col"]
            crop = arka_img.crop((col * HERO_FW, ra * HERO_FH, (col + 1) * HERO_FW, (ra + 1) * HERO_FH))
            char = transform_fn(crop)
            
            # Buat kanvas kerja seukuran frame Arka
            work = Image.new('RGBA', (HERO_FW, HERO_FH), (0, 0, 0, 0))
            work.paste(char, (0, 0), char)
            stamp(work, weapon_img, cfg["hx"], cfg["hy"], cfg["ang"], pivot_w)
            stamp(work, fist_img, cfg["hx"], cfg["hy"], cfg["ang"], PV_FIST)
            
            # Jika skala != 1, resize
            if scale != 1.0:
                nw, nh = int(round(HERO_FW * scale)), int(round(HERO_FH * scale))
                work = work.resize((nw, nh), Image.NEAREST)
            
            # Posisikan di sel (kaki menapak di dasar sel, tengah horizontal)
            cw, ch = work.size
            # Temukan dasar kaki
            bb = work.getbbox()
            ox = (fw - cw) // 2
            # Anchor kaki di dekat dasar sel (fh - 3)
            bottom_y = bb[3] if bb else ch
            oy = (fh - 4) - bottom_y
            
            cell_x = c * fw + ox
            cell_y = r * fh + oy
            sheet.paste(work, (cell_x, cell_y), work)
            
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    sheet.save(target_path, optimize=True)
    print(f"SUCCESS: Baked {target_path} ({fw*4}x{fh*6})!")

# 1. Bake Pemburu Liar (slaver) - fw=76, fh=50, scale=1.0
bake_sheet('assets/img/monsters/esh_slaver.png', 76, 50, 1.0, scimitar_img, PV_SCIM, transform_to_bandit, ESH_SETUP_SLAVER)

# 2. Bake Kapten Pemburu (slaver_captain) - fw=114, fh=80, scale=1.28 (Lebih besar, gagah, kapak perang)
bake_sheet('assets/img/monsters/esh_slaver_captain.png', 114, 80, 1.28, axe_img, PV_AXE, transform_to_boss, ESH_SETUP_CAPTAIN)
