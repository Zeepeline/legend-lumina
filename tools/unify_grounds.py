#!/usr/bin/env python3
"""
Unify all ground textures across Legenda Lumina:
1. Harmonize grass colors to match the authentic Desa Lumina palette.
2. Standardize road color (golden dirt #ba9460) and width (28px main, 24px minor) with organic dithering.
3. Clean lake (remove loop encircling lake).
4. Clean swamp (remove artificial corner circles).
5. Clean meadow top right and snow right circles.
"""
import os
import math
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, distance_transform_edt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def generate_noise_2d(width, height, scale, seed=42):
    np.random.seed(seed)
    gw, gh = int(np.ceil(width / scale)) + 2, int(np.ceil(height / scale)) + 2
    grid = np.random.rand(gh, gw)
    y_indices = np.linspace(0, gh - 1, height)
    x_indices = np.linspace(0, gw - 1, width)
    y0 = np.floor(y_indices).astype(int)
    y1 = np.clip(y0 + 1, 0, gh - 1)
    x0 = np.floor(x_indices).astype(int)
    x1 = np.clip(x0 + 1, 0, gw - 1)
    wy = (y_indices - y0)[:, None]
    wx = (x_indices - x0)[None, :]
    top = grid[y0[:, None], x0] * (1 - wx) + grid[y0[:, None], x1] * wx
    bot = grid[y1[:, None], x0] * (1 - wx) + grid[y1[:, None], x1] * wx
    return top * (1 - wy) + bot * wy

# --- PALET STANDAR BENUA LUMINA ---
# 1. Rumput Desa Lumina (Standar Emas untuk seluruh area hijau)
LUMINA_GRASS = {
    'c1': np.array([74., 136., 58.]),   # Bayangan dasar
    'c2': np.array([88., 154., 68.]),   # Rumput utama
    'c3': np.array([98., 166., 76.]),   # Pucuk rumput segar
    'c4': np.array([112., 180., 84.]),  # Kilau matahari
    'c_trans1': np.array([130., 150., 76.]),
    'c_trans2': np.array([168., 146., 92.])
}

# 2. Jalan Tanah Lumina (Standar Emas Jalan)
ROAD_COLORS = {
    'highlight': np.array([204., 168., 114.]),
    'main': np.array([186., 148., 96.]),
    'shadow': np.array([168., 130., 80.]),
    'fringe': np.array([142., 140., 78.])
}

# Konfigurasi per peta
MAP_CONFIGS = {
    'meadow': {
        'w': 1440, 'h': 1040, 'theme': 'grass',
        'paths': [
            [0, 330, 260, 330, 14], [260, 330, 460, 460, 14], [460, 460, 820, 470, 14],
            [820, 470, 1040, 340, 14], [1040, 340, 1200, 200, 13],
            [460, 460, 420, 720, 14], [420, 720, 300, 840, 13],
            [820, 470, 1000, 700, 14], [1000, 700, 1220, 760, 13],
            [260, 330, 300, 190, 12], [1000, 700, 1000, 1040, 14],
            [460, 460, 600, 250, 13], [600, 250, 600, 0, 14]
        ],
        'water_mask_func': lambda arr: (arr[:, :, 2] > 180) & (arr[:, :, 2] > arr[:, :, 1] + 20)
    },
    'lake': {
        'w': 1400, 'h': 1000, 'theme': 'grass',
        # HANYA jalan masuk dari Desa (timur) ke dermaga dan cabang ke utara (Jalan Raya Lama).
        # TIDAK ADA jalan mengelilingi danau!
        'paths': [
            [1400, 500, 1000, 500, 14],
            [1000, 500, 820, 110, 14],
            [820, 110, 820, 0, 14]
        ],
        'water_mask_func': lambda arr: (arr[:, :, 2] > 160) & (arr[:, :, 2] > arr[:, :, 1] + 15)
    },
    'road': {
        'w': 900, 'h': 2000, 'theme': 'grass',
        'paths': [
            [450, 2000, 450, 1500, 14], [450, 1500, 360, 1100, 14],
            [360, 1100, 520, 700, 14], [520, 700, 450, 300, 14], [450, 300, 450, 0, 14]
        ],
        'water_mask_func': None
    },
    'forest': {
        'w': 1280, 'h': 1200, 'theme': 'forest',
        'paths': [
            [0, 730, 220, 730, 14], [220, 730, 410, 690, 14], [220, 730, 200, 560, 12],
            [1280, 530, 1060, 530, 14], [1060, 530, 1000, 320, 13],
            [1060, 530, 930, 530, 13], [930, 530, 780, 620, 14], [780, 620, 700, 780, 14],
            [640, 0, 640, 160, 14], [640, 160, 420, 260, 14], [420, 260, 380, 440, 14],
            [380, 440, 400, 560, 14], [400, 560, 410, 690, 14],
            [410, 690, 700, 780, 14], [700, 780, 640, 920, 14], [640, 920, 640, 1010, 14],
            [420, 260, 760, 320, 13], [760, 320, 1000, 320, 13],
            [380, 440, 200, 560, 12], [200, 560, 180, 820, 12],
            [700, 780, 1000, 850, 12]
        ],
        'water_mask_func': lambda arr: (arr[:, :, 2] > 160) & (arr[:, :, 2] > arr[:, :, 1] + 15)
    },
    'snow': {
        'w': 1280, 'h': 1200, 'theme': 'snow',
        'paths': [
            [640, 1200, 610, 1100, 14], [610, 1100, 560, 1000, 14], [560, 1000, 605, 900, 14],
            [605, 900, 575, 800, 14], [575, 800, 620, 690, 14], [620, 690, 640, 560, 13],
            [640, 560, 595, 460, 13], [595, 460, 625, 380, 14], [625, 380, 640, 230, 14],
            [560, 1000, 430, 935, 12], [430, 935, 320, 840, 12], [320, 840, 260, 760, 12],
            [605, 900, 690, 860, 12], [690, 860, 820, 830, 12], [820, 830, 930, 790, 12],
            [930, 790, 1020, 720, 12]
        ],
        'water_mask_func': lambda arr: (arr[:, :, 2] > 180) & (arr[:, :, 2] > arr[:, :, 1] + 30)
    },
    'swamp': {
        'w': 1280, 'h': 960, 'theme': 'swamp',
        'paths': [
            [0, 480, 150, 500, 12], [150, 500, 300, 520, 12],
            [640, 0, 640, 160, 14], [640, 160, 560, 260, 13], [560, 260, 460, 330, 13],
            [460, 330, 380, 430, 13], [380, 430, 300, 520, 13],
            [300, 520, 420, 640, 13], [420, 640, 560, 720, 13], [560, 720, 640, 820, 13],
            [640, 160, 780, 250, 11], [780, 250, 880, 360, 11], [880, 360, 960, 560, 11]
        ],
        'water_mask_func': lambda arr: (arr[:, :, 2] > 140) & (arr[:, :, 2] > arr[:, :, 1] + 10)
    }
}

def process_map(map_id):
    cfg = MAP_CONFIGS[map_id]
    w, h = cfg['w'], cfg['h']
    input_path = os.path.join(ROOT, 'tiled', 'ground', f'{map_id}_ground.png')
    output_tiled = os.path.join(ROOT, 'tiled', 'ground', f'{map_id}_ground.png')
    output_asset = os.path.join(ROOT, 'assets', 'img', 'ground', f'gnd_{map_id}_custom.png')
    
    print(f"\n==========================================")
    print(f"MENGHARMONISASIKAN TANAH & JALAN: {map_id.upper()}")
    print(f"==========================================")
    
    im_base = Image.open(input_path).convert('RGB')
    if im_base.size != (w, h):
        im_base = im_base.resize((w, h), Image.BILINEAR)
    arr_base = np.array(im_base, dtype=np.float32)
    
    # 1. Deteksi Area Air / Sungai / Danau asli (agar tetap terjaga airnya)
    if cfg['water_mask_func']:
        is_water = cfg['water_mask_func'](arr_base)
    else:
        is_water = np.zeros((h, w), dtype=bool)
        
    # Khusus di swamp: hapus dua lingkaran air buatan di pojok kanan
    if map_id == 'swamp':
        Y, X = np.ogrid[:h, :w]
        # Ponds pojok kanan: (1090, 200, 90, 50) dan (1080, 800, 120, 64)
        c1 = ((X - 1090)/90)**2 + ((Y - 200)/50)**2 <= 1.2
        c2 = ((X - 1080)/120)**2 + ((Y - 800)/64)**2 <= 1.2
        is_water[c1 | c2] = False
        print("  [Swamp] Menghapus 2 kolam bulatan kaku di pojok kanan")
        
    # 2. Hitung Jarak ke Jalan Resmi (Paths) dengan Lebar Terstandar
    Y, X = np.ogrid[:h, :w]
    dist_to_roads = np.full((h, w), 1e6, dtype=np.float32)
    for seg in cfg['paths']:
        x1, y1, x2, y2, r = seg
        dx = x2 - x1
        dy = y2 - y1
        L = dx*dx + dy*dy
        if L == 0:
            d = np.hypot(X - x1, Y - y1)
        else:
            t = np.clip(((X - x1)*dx + (Y - y1)*dy) / L, 0, 1)
            px = x1 + t * dx
            py = y1 + t * dy
            d = np.hypot(X - px, Y - py)
        # Tambahkan variasi organik mikro pada tepi jalan (±1.5px)
        noise_edge = np.sin(X * 0.15) * np.cos(Y * 0.15) * 1.5
        dist_to_roads = np.minimum(dist_to_roads, d - (r + noise_edge))
        
    # Masker jalan resmi
    is_road = (dist_to_roads <= 0) & (~is_water)
    border_road = (dist_to_roads > 0) & (dist_to_roads <= 3.0) & (~is_water)
    border_road_outer = (dist_to_roads > 3.0) & (dist_to_roads <= 5.5) & (~is_water)
    
    # 3. Bangun Tekstur Permukaan Utama (Grass / Forest / Snow / Swamp)
    seed_base = abs(hash(map_id)) % 10000
    n_macro = generate_noise_2d(w, h, scale=96, seed=seed_base + 10)
    n_med   = generate_noise_2d(w, h, scale=32, seed=seed_base + 20)
    n_micro = generate_noise_2d(w, h, scale=8, seed=seed_base + 30)
    val = n_macro * 0.50 + n_med * 0.35 + n_micro * 0.15
    
    if cfg['theme'] == 'snow':
        c1 = np.array([215., 226., 238.])
        c2 = np.array([228., 236., 246.])
        c3 = np.array([240., 245., 252.])
        c4 = np.array([252., 253., 255.])
    elif cfg['theme'] == 'swamp':
        # Warna rawa yang menyatu alami dengan rumput Lumina
        c1 = np.array([72., 112., 64.])
        c2 = np.array([84., 128., 74.])
        c3 = np.array([96., 144., 82.])
        c4 = np.array([110., 158., 94.])
    elif cfg['theme'] == 'forest':
        # Hutan: transisi dari rumput Lumina di utara ke kanopi dalam di selatan
        grad_y = np.linspace(0, 1, h)[:, None, None]
        c1 = LUMINA_GRASS['c1'][None, None, :] * (1 - grad_y*0.25)
        c2 = LUMINA_GRASS['c2'][None, None, :] * (1 - grad_y*0.25)
        c3 = LUMINA_GRASS['c3'][None, None, :] * (1 - grad_y*0.25)
        c4 = LUMINA_GRASS['c4'][None, None, :] * (1 - grad_y*0.25)
    else:
        # Grass (Desa Lumina Standard untuk Meadow, Lake, Road)
        c1 = LUMINA_GRASS['c1']
        c2 = LUMINA_GRASS['c2']
        c3 = LUMINA_GRASS['c3']
        c4 = LUMINA_GRASS['c4']
        
    t1 = np.clip(val / 0.38, 0, 1)[:, :, None]
    col_low = c1 * (1 - t1) + c2 * t1
    t2 = np.clip((val - 0.38) / 0.30, 0, 1)[:, :, None]
    col_mid = c2 * (1 - t2) + c3 * t2
    t3 = np.clip((val - 0.68) / 0.32, 0, 1)[:, :, None]
    col_high = c3 * (1 - t3) + c4 * t3
    
    surface_blend = np.where(val[:, :, None] < 0.38, col_low,
                             np.where(val[:, :, None] < 0.68, col_mid, col_high))
                             
    # 4. Bangun Tekstur Jalan Tanah Standar Emas
    road_noise = generate_noise_2d(w, h, scale=16, seed=seed_base + 88)
    r_main = ROAD_COLORS['main']
    r_high = ROAD_COLORS['highlight']
    r_shad = ROAD_COLORS['shadow']
    
    road_surface = r_main * 0.70 + (r_high if True else r_shad)
    rt = road_noise[:, :, None]
    road_surface = r_shad * (1 - rt) + r_high * rt
    
    # 5. Gabungkan Lapisan
    result = np.zeros_like(arr_base)
    
    # a. Area Permukaan Rumput/Salju/Hutan
    is_surface = (~is_water) & (~is_road) & (~border_road) & (~border_road_outer)
    result[is_surface] = surface_blend[is_surface]
    
    # Pertahankan bayangan objek/pohon asli (20% bayangan asli + 80% warna baru yang harmonis)
    orig_shades = arr_base[is_surface]
    result[is_surface] = result[is_surface] * 0.82 + orig_shades * 0.18
    
    # b. Area Air (asli)
    result[is_water] = arr_base[is_water]
    
    # c. Area Jalan Resmi
    result[is_road] = road_surface[is_road]
    
    # d. Tepi Jalan Halus (Dithering & Overhang)
    dither_1 = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 0)
    dither_2 = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 1)
    
    # Lapis 1 tepi jalan
    result[border_road & dither_1] = road_surface[border_road & dither_1] * 0.60 + ROAD_COLORS['fringe'] * 0.40
    result[border_road & dither_2] = surface_blend[border_road & dither_2] * 0.45 + ROAD_COLORS['fringe'] * 0.55
    
    # Lapis 2 luar tepi jalan
    result[border_road_outer & dither_1] = surface_blend[border_road_outer & dither_1] * 0.75 + ROAD_COLORS['fringe'] * 0.25
    result[border_road_outer & dither_2] = surface_blend[border_road_outer & dither_2]
    
    # 6. Simpan Hasil ke tiled/ground/ dan assets/img/ground/
    out_img = Image.fromarray(np.clip(result, 0, 255).astype(np.uint8))
    out_img.save(output_tiled, 'PNG')
    out_img.save(output_asset, 'PNG')
    print(f"  [BERHASIL] {map_id.upper()} diperbarui (Ground harmonis + Jalan terstandarisasi)")

if __name__ == '__main__':
    for mid in ['meadow', 'lake', 'road', 'forest', 'snow', 'swamp']:
        process_map(mid)
