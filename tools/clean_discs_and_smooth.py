import os
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation

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

BIOMES = {
    'meadow': {
        'c1': np.array([72., 134., 58.]),
        'c2': np.array([88., 154., 70.]),
        'c3': np.array([108., 178., 86.]),
        'c4': np.array([128., 198., 102.]),
        'c_trans1': np.array([114., 146., 76.]),
        'c_trans2': np.array([154., 138., 86.]),
        'type': 'grass',
        'paths': [
            [0, 330, 260, 330, 14], [260, 330, 460, 460, 14], [460, 460, 820, 470, 14], [820, 470, 1040, 340, 14], [1040, 340, 1200, 200, 13],
            [460, 460, 420, 720, 12], [420, 720, 300, 840, 12], [820, 470, 1000, 700, 12], [1000, 700, 1220, 760, 12],
            [260, 330, 300, 190, 11], [1000, 700, 1000, 1040, 13], [460, 460, 600, 250, 12], [600, 250, 600, 0, 12],
        ],
        'discs': [[300, 180, 52], [140, 220, 70], [480, 220, 66], [240, 360, 50], [560, 640, 30], [300, 860, 56], [1240, 770, 66], [1200, 196, 40]]
    },
    'forest': {
        'c1': np.array([54., 102., 42.]),
        'c2': np.array([68., 122., 52.]),
        'c3': np.array([82., 142., 62.]),
        'c4': np.array([98., 164., 76.]),
        'c_trans1': np.array([96., 122., 62.]),
        'c_trans2': np.array([128., 116., 74.]),
        'type': 'grass',
        'paths': [
            [0, 730, 220, 730, 12], [220, 730, 410, 690, 12], [220, 730, 200, 560, 11],
            [1280, 530, 1060, 530, 12], [1060, 530, 1000, 320, 12],
            [1060, 530, 930, 530, 12], [930, 530, 780, 620, 12], [780, 620, 700, 780, 12],
            [640, 0, 640, 160, 14], [640, 160, 420, 260, 14], [420, 260, 380, 440, 14], [380, 440, 400, 560, 14], [400, 560, 410, 690, 14],
            [410, 690, 700, 780, 14], [700, 780, 640, 920, 14], [640, 920, 640, 1010, 14],
            [420, 260, 760, 320, 12], [760, 320, 1000, 320, 12],
            [380, 440, 200, 560, 11], [200, 560, 180, 820, 11],
            [700, 780, 1000, 850, 11],
        ],
        'discs': [
            [60, 730, 40], [1220, 530, 40],
            [930, 310, 85], [1030, 270, 95], [1120, 230, 90], [1020, 360, 75], [1150, 330, 70],
            [180, 846, 58], [1030, 860, 62], [640, 1068, 92], [380, 440, 30], [640, 150, 34]
        ]
    },
    'lake': {
        'c1': np.array([64., 124., 60.]),
        'c2': np.array([78., 144., 72.]),
        'c3': np.array([98., 168., 88.]),
        'c4': np.array([118., 188., 106.]),
        'c_trans1': np.array([104., 138., 76.]),
        'c_trans2': np.array([142., 132., 88.]),
        'type': 'grass',
        'paths': [
            [0, 550, 160, 550, 14], [160, 550, 260, 660, 14], [260, 660, 280, 820, 13], [280, 820, 560, 742, 13],
            [560, 742, 900, 700, 13], [900, 700, 1120, 480, 13], [1120, 480, 1080, 320, 12], [1080, 320, 820, 110, 12],
            [820, 110, 820, 0, 12],
        ],
        'discs': [[1080, 470, 70], [1120, 320, 60], [820, 110, 50]]
    },
    'snow': {
        'c1': np.array([210., 224., 236.]),
        'c2': np.array([224., 234., 244.]),
        'c3': np.array([238., 244., 250.]),
        'c4': np.array([250., 252., 255.]),
        'c_trans1': np.array([184., 202., 218.]),
        'c_trans2': np.array([156., 172., 190.]),
        'type': 'snow',
        'paths': [
            [640, 1200, 640, 1080, 14], [640, 1080, 640, 860, 13], [640, 860, 640, 640, 14],
            [640, 640, 640, 420, 14], [640, 420, 640, 230, 14], [640, 230, 640, 0, 14],
            [640, 860, 320, 760, 12], [320, 760, 260, 760, 12],
            [640, 860, 960, 720, 12], [960, 720, 1020, 720, 12],
            [640, 640, 640, 560, 13],
        ],
        'discs': [[640, 230, 100], [640, 560, 50], [260, 760, 48], [1020, 720, 48], [640, 1080, 44]]
    },
    'swamp': {
        'c1': np.array([68., 96., 68.]),
        'c2': np.array([82., 114., 82.]),
        'c3': np.array([96., 132., 94.]),
        'c4': np.array([112., 150., 110.]),
        'c_trans1': np.array([98., 116., 84.]),
        'c_trans2': np.array([122., 112., 88.]),
        'type': 'swamp',
        'paths': [
            [0, 480, 160, 480, 14], [160, 480, 300, 520, 14], [300, 520, 460, 680, 13], [460, 680, 640, 840, 13],
            [640, 840, 820, 680, 13], [820, 680, 960, 560, 14], [960, 560, 1120, 480, 14], [1120, 480, 1280, 480, 14],
            [640, 0, 640, 150, 14], [640, 150, 460, 320, 12], [460, 320, 300, 520, 12],
            [640, 150, 820, 320, 12], [820, 320, 960, 560, 12],
        ],
        'discs': [[60, 480, 40], [640, 840, 92], [300, 520, 46], [960, 560, 46], [640, 150, 34]]
    },
    'road': {
        'c1': np.array([68., 128., 54.]),
        'c2': np.array([82., 148., 62.]),
        'c3': np.array([98., 168., 74.]),
        'c4': np.array([116., 190., 86.]),
        'c_trans1': np.array([108., 136., 72.]),
        'c_trans2': np.array([144., 134., 84.]),
        'type': 'grass',
        'paths': [
            [400, 2000, 400, 1720, 16], [400, 1720, 400, 1260, 16], [400, 1260, 560, 520, 16],
            [560, 520, 400, 260, 16], [400, 260, 400, 0, 16],
        ],
        'discs': [[400, 1260, 70], [560, 520, 60], [400, 260, 40], [500, 1720, 40]]
    },
    'deepwood': {
        'c1': np.array([44., 88., 36.]),
        'c2': np.array([58., 108., 48.]),
        'c3': np.array([72., 128., 58.]),
        'c4': np.array([88., 148., 72.]),
        'c_trans1': np.array([84., 110., 54.]),
        'c_trans2': np.array([112., 98., 62.]),
        'type': 'grass',
        'paths': [
            [2400, 730, 2000, 730, 14], [2000, 730, 1700, 860, 14], [1700, 860, 1400, 860, 14],
            [1400, 860, 1000, 960, 14], [1000, 960, 700, 860, 14], [700, 860, 520, 560, 14],
            [520, 560, 520, 400, 14],
            [1000, 960, 900, 1320, 14], [900, 1320, 600, 1460, 14], [600, 1460, 380, 1540, 14],
            [1700, 860, 1750, 1050, 14], [1750, 1050, 1550, 1420, 14],
            [2000, 730, 2000, 330, 12],
        ],
        'discs': [[2000, 330, 105], [900, 1320, 85], [1960, 760, 80]]
    }
}

def clean_and_smooth_area(area_name):
    cfg = BIOMES[area_name]
    input_path = f'tiled/ground/{area_name}_ground.png'
    output_asset = f'assets/img/ground/gnd_{area_name}_custom.png'
    output_tiled = f'tiled/ground/{area_name}_ground.png'
    
    if not os.path.exists(input_path):
        print(f"Skipping {area_name}: not found")
        return
        
    print(f"\n>>> Membersihkan bulatan & menghaluskan {area_name.upper()}...")
    im = Image.open(input_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    
    # 1. Surface blend generation
    seed_base = abs(hash(area_name)) % 10000
    noise_macro = generate_noise_2d(w, h, scale=96, seed=seed_base + 11)
    noise_med   = generate_noise_2d(w, h, scale=32, seed=seed_base + 22)
    noise_micro = generate_noise_2d(w, h, scale=8, seed=seed_base + 33)
    val = noise_macro * 0.50 + noise_med * 0.35 + noise_micro * 0.15
    
    c1, c2, c3, c4 = cfg['c1'], cfg['c2'], cfg['c3'], cfg['c4']
    t1 = np.clip(val / 0.38, 0, 1)[:, :, None]
    col_low = c1 * (1 - t1) + c2 * t1
    t2 = np.clip((val - 0.38) / 0.30, 0, 1)[:, :, None]
    col_mid = c2 * (1 - t2) + c3 * t2
    t3 = np.clip((val - 0.68) / 0.32, 0, 1)[:, :, None]
    col_high = c3 * (1 - t3) + c4 * t3
    
    surface_blend = np.where(val[:, :, None] < 0.38, col_low,
                             np.where(val[:, :, None] < 0.68, col_mid, col_high))
                             
    # 2. Hitung jarak ke seluruh path (jalan resmi)
    Y, X = np.ogrid[:h, :w]
    dist_to_paths = np.full((h, w), 1e6, dtype=np.float32)
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
        dist_to_paths = np.minimum(dist_to_paths, d - r)
        
    # 3. Masker bulatan discs
    disc_mask = np.zeros((h, w), dtype=bool)
    for disc in cfg['discs']:
        cx, cy, r = disc[:3]
        d = np.hypot(X - cx, Y - cy)
        disc_mask |= (d <= r + 8)
        
    # Area bulatan yang berada di luar jalan raya (kelebihan clearing bundar)
    # Harus diubah menjadi tanah rumput/biome alami
    unwanted_dirt = disc_mask & (dist_to_paths > 4)
    print(f"  Piksel bulatan kaku yang dihapus: {np.sum(unwanted_dirt)}")
    
    # 4. Ganti area bulatan yang dihapus dengan surface_blend
    result = arr.copy()
    result[unwanted_dirt] = surface_blend[unwanted_dirt]
    
    # 5. Segmentasi ulang permukaan
    if cfg['type'] == 'snow':
        is_main = (result[:, :, 0] > 180) & (result[:, :, 1] > 180) & (result[:, :, 2] > 190)
    elif cfg['type'] == 'swamp':
        is_main = (result[:, :, 1] >= result[:, :, 0] - 5) & (result[:, :, 1] >= result[:, :, 2] - 5)
    else:
        is_main = (result[:, :, 1] > result[:, :, 0] + 5) & (result[:, :, 1] > result[:, :, 2] + 5)
        
    is_other = ~is_main
    
    # Perhalus seluruh permukaan utama
    result[is_main] = surface_blend[is_main] * 0.82 + result[is_main] * 0.18
    
    # 6. Haluskan tepi jalan/sungai dengan dithering & overhang
    border_main = is_main & binary_dilation(is_other, structure=np.ones((3, 3)))
    border_other = is_other & binary_dilation(is_main, structure=np.ones((3, 3)))
    border_other_2 = is_other & binary_dilation(border_other, structure=np.ones((3, 3))) & ~border_other
    
    c_trans1 = cfg['c_trans1']
    c_trans2 = cfg['c_trans2']
    
    dither_mask_main = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 0)
    dither_mask_other = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 1)
    
    result[border_main & dither_mask_main] = (
        result[border_main & dither_mask_main] * 0.45 + c_trans1 * 0.55
    )
    result[border_other] = (
        result[border_other] * 0.40 + c_trans2 * 0.60
    )
    result[border_other_2 & dither_mask_other] = (
        result[border_other_2 & dither_mask_other] * 0.72 + c_trans2 * 0.28
    )
    
    np.random.seed(seed_base + 99)
    fringe_p = np.random.rand(h, w)
    fringe_mask = border_other & (fringe_p < 0.26)
    result[fringe_mask] = c1 * 0.85 + c2 * 0.15
    
    # Simpan hasil
    out_img = Image.fromarray(np.clip(result, 0, 255).astype(np.uint8))
    out_img.save(output_tiled, 'PNG')
    out_img.save(output_asset, 'PNG')
    print(f"  [OK] Tersimpan di {output_tiled} & {output_asset}")

if __name__ == '__main__':
    for area in ['meadow', 'forest', 'lake', 'snow', 'swamp', 'road', 'deepwood']:
        clean_and_smooth_area(area)
