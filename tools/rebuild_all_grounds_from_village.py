#!/usr/bin/env python3
"""
Rebuild all outdoor map ground textures with Village Lumina as the golden benchmark:
1. Exact Village grass color & authentic micro-pixel texture.
2. 100% continuous unbroken paths (standardized 28px width, golden dirt palette #ba9460).
3. 0 discs (no circular bulges or artificial blisters).
4. Lake without the encircling road (clean nature & shoreline).
5. Deepwood completely continuous, no breaks, no discs.
6. Swamp clean delta, no corner discs.
"""
import os
import math
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Benchmark Village Palette
VILLAGE_PALETTE = {
    'grass_c1': np.array([71., 148., 64.]),   # Bayangan dasar rumput
    'grass_c2': np.array([88., 155., 68.]),   # Rumput utama
    'grass_c3': np.array([98., 167., 74.]),   # Rumput segar
    'grass_c4': np.array([106., 175., 78.]),  # Pucuk kilau matahari
    'road_core': np.array([201., 164., 110.]), # #c9a46e Tanah emas utama
    'road_high': np.array([216., 180., 126.]), # #d8b47e Kilau terang tengah
    'road_shad': np.array([173., 142., 91.]),  # #ad8e5b Bayangan tapak
    'road_fringe': np.array([142., 140., 78.]),# Transisi dither ke rumput
    'sand_edge': np.array([210., 195., 150.]), # Tepian pasir pantai air
}

MAP_DEFS = {
    'deepwood': {
        'w': 2400, 'h': 1800, 'theme': 'forest_lush',
        'paths': [
            [2400, 730, 1900, 730, 14],
            [1900, 730, 2000, 360, 14],
            [1900, 730, 1500, 980, 14],
            [1500, 980, 1100, 900, 14],
            [1100, 900, 700, 560, 14],
            [700, 560, 520, 420, 14],
            [1500, 980, 1550, 1420, 13],
            [1100, 900, 900, 1250, 14],
            [900, 1250, 650, 1450, 14],
            [650, 1450, 380, 1540, 14]
        ],
        'ponds': [
            [1250, 470, 150, 70],
            [1420, 560, 90, 50],
            [330, 1250, 160, 90],
            [1900, 1500, 140, 70]
        ]
    },
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
        'preserve_water': True
    },
    'lake': {
        'w': 1400, 'h': 1000, 'theme': 'grass',
        # HANYA jalan masuk dari Desa ke dermaga dan cabang utara ke Jalan Raya Lama.
        # TIDAK ADA jalan lingkar!
        'paths': [
            [1400, 500, 1000, 500, 14],
            [1000, 500, 820, 110, 14],
            [820, 110, 820, 0, 14]
        ],
        'preserve_water': True
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
        'preserve_water': True
    },
    'road': {
        'w': 900, 'h': 2000, 'theme': 'grass',
        'paths': [
            [450, 2000, 450, 1500, 14], [450, 1500, 360, 1100, 14],
            [360, 1100, 520, 700, 14], [520, 700, 450, 300, 14], [450, 300, 450, 0, 14]
        ],
        'preserve_water': False
    },
    'swamp': {
        'w': 1280, 'h': 960, 'theme': 'swamp',
        'paths': [
            [0, 480, 150, 500, 13], [150, 500, 300, 520, 13],
            [640, 0, 640, 160, 14], [640, 160, 560, 260, 13], [560, 260, 460, 330, 13],
            [460, 330, 380, 430, 13], [380, 430, 300, 520, 13],
            [300, 520, 420, 640, 13], [420, 640, 560, 720, 13], [560, 720, 640, 820, 13],
            [640, 160, 780, 250, 12], [780, 250, 880, 360, 12], [880, 360, 960, 560, 12]
        ],
        'ponds': [
            [620, 440, 120, 66],
            [180, 770, 110, 60],
            [190, 200, 90, 50]
        ]
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
        'preserve_water': True
    }
}

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

def build_ground(map_id):
    cfg = MAP_DEFS[map_id]
    w, h = cfg['w'], cfg['h']
    print(f"\n>>> [MEMBANGUN ULANG TANAH] {map_id.upper()} ({w}x{h})...")
    
    # 1. Buka ground asli jika ada (untuk melestarikan air dan bayangan pohon)
    input_path = os.path.join(ROOT, 'tiled', 'ground', f'{map_id}_ground.png')
    has_orig = os.path.exists(input_path)
    if has_orig:
        im_orig = Image.open(input_path).convert('RGB')
        if im_orig.size != (w, h):
            im_orig = im_orig.resize((w, h), Image.BILINEAR)
        arr_orig = np.array(im_orig, dtype=np.float32)
    else:
        arr_orig = np.zeros((h, w, 3), dtype=np.float32)
        
    # 2. Deteksi Area Air Asli
    is_water = np.zeros((h, w), dtype=bool)
    Y, X = np.ogrid[:h, :w]
    
    if cfg.get('preserve_water') and has_orig:
        # Air berwarna biru
        is_water = (arr_orig[:, :, 2] > 150) & (arr_orig[:, :, 2] > arr_orig[:, :, 1] + 10)
        
    if 'ponds' in cfg:
        for p in cfg['ponds']:
            cx, cy, rx, ry = p
            dist_e = ((X - cx)/rx)**2 + ((Y - cy)/ry)**2
            is_water |= (dist_e <= 1.0)
            
    # Di Lake: pastikan air danau terisi rapi
    if map_id == 'lake':
        is_water |= (((X - 560)/330)**2 + ((Y - 500)/210)**2 <= 1.0)
        
    # Di Swamp: pastikan kolam pojok kanan benar-benar bersih (bukan air)
    if map_id == 'swamp':
        c1 = ((X - 1090)/90)**2 + ((Y - 200)/50)**2 <= 1.3
        c2 = ((X - 1080)/120)**2 + ((Y - 800)/64)**2 <= 1.3
        is_water[c1 | c2] = False
        
    # 3. Hitung Jarak ke Jalan Resmi 100% KONTINU (Continuous Unbroken Path)
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
        # Kurva mikro halus di tepian jalan
        dist_to_roads = np.minimum(dist_to_roads, d - r)
        
    is_road = (dist_to_roads <= 0) & (~is_water)
    border_road = (dist_to_roads > 0) & (dist_to_roads <= 2.5) & (~is_water)
    border_road_outer = (dist_to_roads > 2.5) & (dist_to_roads <= 5.0) & (~is_water)
    
    # 4. Bangun Tekstur Permukaan Berstandar Desa Lumina
    seed = abs(hash(map_id)) % 10000
    n_macro = generate_noise_2d(w, h, scale=96, seed=seed + 1)
    n_med   = generate_noise_2d(w, h, scale=24, seed=seed + 2)
    n_micro = generate_noise_2d(w, h, scale=4,  seed=seed + 3) # Pixel art micro texture!
    val = n_macro * 0.45 + n_med * 0.35 + n_micro * 0.20
    
    theme = cfg['theme']
    if theme == 'snow':
        c1 = np.array([215., 226., 238.])
        c2 = np.array([228., 236., 246.])
        c3 = np.array([240., 245., 252.])
        c4 = np.array([252., 253., 255.])
    elif theme == 'swamp':
        c1 = np.array([72., 112., 64.])
        c2 = np.array([84., 128., 74.])
        c3 = np.array([96., 144., 82.])
        c4 = np.array([108., 156., 92.])
    elif theme == 'forest':
        # Lereng Hutan Lumina: atas persis Village, bawah kanopi dalam
        gy = np.linspace(0, 1, h)[:, None, None]
        c1 = VILLAGE_PALETTE['grass_c1'][None, None, :] * (1 - gy*0.22)
        c2 = VILLAGE_PALETTE['grass_c2'][None, None, :] * (1 - gy*0.22)
        c3 = VILLAGE_PALETTE['grass_c3'][None, None, :] * (1 - gy*0.22)
        c4 = VILLAGE_PALETTE['grass_c4'][None, None, :] * (1 - gy*0.22)
    elif theme == 'forest_lush':
        # Deepwood: hutan purba kaya warna berbasis standar Village
        c1 = VILLAGE_PALETTE['grass_c1'] * 0.88
        c2 = VILLAGE_PALETTE['grass_c2'] * 0.90
        c3 = VILLAGE_PALETTE['grass_c3'] * 0.92
        c4 = VILLAGE_PALETTE['grass_c4'] * 0.94
    else:
        # Standar Emas Murni Desa Lumina (Meadow, Lake, Road)
        c1 = VILLAGE_PALETTE['grass_c1']
        c2 = VILLAGE_PALETTE['grass_c2']
        c3 = VILLAGE_PALETTE['grass_c3']
        c4 = VILLAGE_PALETTE['grass_c4']
        
    t1 = np.clip(val / 0.38, 0, 1)[:, :, None]
    col_low = c1 * (1 - t1) + c2 * t1
    t2 = np.clip((val - 0.38) / 0.30, 0, 1)[:, :, None]
    col_mid = c2 * (1 - t2) + c3 * t2
    t3 = np.clip((val - 0.68) / 0.32, 0, 1)[:, :, None]
    col_high = c3 * (1 - t3) + c4 * t3
    
    surface = np.where(val[:, :, None] < 0.38, col_low,
                       np.where(val[:, :, None] < 0.68, col_mid, col_high))
                       
    # 5. Bangun Tekstur Jalan Emas Lumina
    rn = generate_noise_2d(w, h, scale=12, seed=seed + 99)[:, :, None]
    road_col = VILLAGE_PALETTE['road_shad'] * (1 - rn) + VILLAGE_PALETTE['road_high'] * rn
    
    # 6. Komposisi Bersih & Sempurna
    out = np.zeros((h, w, 3), dtype=np.float32)
    
    # a. Dasar Permukaan
    is_base = (~is_water) & (~is_road) & (~border_road) & (~border_road_outer)
    out[is_base] = surface[is_base]
    if has_orig and theme not in ('snow',):
        # 18% bayangan kontak objek asli
        out[is_base] = out[is_base] * 0.82 + arr_orig[is_base] * 0.18
        
    # b. Air & Tepian Pasir
    if np.any(is_water):
        # Garis pantai pasir
        shore = binary_dilation(is_water, structure=np.ones((5, 5))) & (~is_water) & (~is_road)
        out[shore] = VILLAGE_PALETTE['sand_edge']
        
        # Air biru cerah
        water_blue = np.array([195., 145., 65.]) # BGR [65, 145, 195] -> RGB [65, 145, 195]
        if has_orig and cfg.get('preserve_water'):
            out[is_water] = arr_orig[is_water]
        else:
            # Sintesis air danau jernih
            wn = generate_noise_2d(w, h, scale=8, seed=seed + 45)[:, :, None]
            water_synth = np.array([65., 135., 185.])[None, None, :] * (1 - wn*0.15) + np.array([85., 165., 215.])[None, None, :] * (wn*0.15)
            out[is_water] = water_synth[is_water]
            
    # c. Jalan Resmi (100% Unbroken & Continuous)
    out[is_road] = road_col[is_road]
    
    # d. Dithering Tepi Jalan
    d1 = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 0)
    d2 = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 1)
    
    out[border_road & d1] = road_col[border_road & d1] * 0.65 + VILLAGE_PALETTE['road_fringe'] * 0.35
    out[border_road & d2] = surface[border_road & d2] * 0.40 + VILLAGE_PALETTE['road_fringe'] * 0.60
    
    out[border_road_outer & d1] = surface[border_road_outer & d1] * 0.75 + VILLAGE_PALETTE['road_fringe'] * 0.25
    out[border_road_outer & d2] = surface[border_road_outer & d2]
    
    # 7. Simpan Gambar
    out_img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    out_tiled = os.path.join(ROOT, 'tiled', 'ground', f'{map_id}_ground.png')
    out_asset = os.path.join(ROOT, 'assets', 'img', 'ground', f'gnd_{map_id}_custom.png')
    
    out_img.save(out_tiled, 'PNG')
    out_img.save(out_asset, 'PNG')
    print(f"  [SUKSES] {map_id.upper()} disimpan di {out_tiled} & {out_asset}")

if __name__ == '__main__':
    for mid in ['deepwood', 'meadow', 'lake', 'forest', 'road', 'swamp', 'snow']:
        build_ground(mid)
