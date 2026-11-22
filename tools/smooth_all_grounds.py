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
    'forest': {
        'c1': np.array([54., 102., 42.]),
        'c2': np.array([68., 122., 52.]),
        'c3': np.array([82., 142., 62.]),
        'c4': np.array([98., 164., 76.]),
        'c_trans1': np.array([96., 122., 62.]),
        'c_trans2': np.array([128., 116., 74.]),
        'type': 'grass'
    },
    'meadow': {
        'c1': np.array([72., 134., 58.]),
        'c2': np.array([88., 154., 70.]),
        'c3': np.array([108., 178., 86.]),
        'c4': np.array([128., 198., 102.]),
        'c_trans1': np.array([114., 146., 76.]),
        'c_trans2': np.array([154., 138., 86.]),
        'type': 'grass'
    },
    'lake': {
        'c1': np.array([64., 124., 60.]),
        'c2': np.array([78., 144., 72.]),
        'c3': np.array([98., 168., 88.]),
        'c4': np.array([118., 188., 106.]),
        'c_trans1': np.array([104., 138., 76.]),
        'c_trans2': np.array([142., 132., 88.]),
        'type': 'grass'
    },
    'road': {
        'c1': np.array([68., 128., 54.]),
        'c2': np.array([82., 148., 62.]),
        'c3': np.array([98., 168., 74.]),
        'c4': np.array([116., 190., 86.]),
        'c_trans1': np.array([108., 136., 72.]),
        'c_trans2': np.array([144., 134., 84.]),
        'type': 'grass'
    },
    'deepwood': {
        'c1': np.array([44., 88., 36.]),
        'c2': np.array([58., 108., 48.]),
        'c3': np.array([72., 128., 58.]),
        'c4': np.array([88., 148., 72.]),
        'c_trans1': np.array([84., 110., 54.]),
        'c_trans2': np.array([112., 98., 62.]),
        'type': 'grass'
    },
    'swamp': {
        'c1': np.array([68., 96., 68.]),
        'c2': np.array([82., 114., 82.]),
        'c3': np.array([96., 132., 94.]),
        'c4': np.array([112., 150., 110.]),
        'c_trans1': np.array([98., 116., 84.]),
        'c_trans2': np.array([122., 112., 88.]),
        'type': 'swamp'
    },
    'snow': {
        'c1': np.array([210., 224., 236.]),
        'c2': np.array([224., 234., 244.]),
        'c3': np.array([238., 244., 250.]),
        'c4': np.array([250., 252., 255.]),
        'c_trans1': np.array([184., 202., 218.]),
        'c_trans2': np.array([156., 172., 190.]),
        'type': 'snow'
    }
}

def process_area(area_name):
    cfg = BIOMES[area_name]
    input_path = f'tiled/ground/{area_name}_ground.png'
    output_asset = f'assets/img/ground/gnd_{area_name}_custom.png'
    output_tiled = f'tiled/ground/{area_name}_ground.png'
    
    if not os.path.exists(input_path):
        print(f"Skipping {area_name}: {input_path} not found")
        return
        
    print(f"\n>>> Memproses area: {area_name.upper()} ({input_path})...")
    im = Image.open(input_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    
    # 1. Segmentasi permukaan utama vs jalan/air/batu
    if cfg['type'] == 'snow':
        is_main = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 180) & (arr[:, :, 2] > 190)
    elif cfg['type'] == 'swamp':
        is_main = (arr[:, :, 1] >= arr[:, :, 0] - 5) & (arr[:, :, 1] >= arr[:, :, 2] - 5)
    else:
        is_main = (arr[:, :, 1] > arr[:, :, 0] + 5) & (arr[:, :, 1] > arr[:, :, 2] + 5)
        
    is_other = ~is_main
    
    # 2. De-Tiling & Organic Surface Generation
    seed_base = abs(hash(area_name)) % 10000
    noise_macro = generate_noise_2d(w, h, scale=96, seed=seed_base + 11)
    noise_med   = generate_noise_2d(w, h, scale=32, seed=seed_base + 22)
    noise_micro = generate_noise_2d(w, h, scale=8, seed=seed_base + 33)
    
    combined_noise = noise_macro * 0.50 + noise_med * 0.35 + noise_micro * 0.15
    
    c1, c2, c3, c4 = cfg['c1'], cfg['c2'], cfg['c3'], cfg['c4']
    surface_blend = np.zeros_like(arr)
    
    # Gradasi multi-tier
    val = combined_noise
    t1 = np.clip(val / 0.38, 0, 1)[:, :, None]
    col_low = c1 * (1 - t1) + c2 * t1
    
    t2 = np.clip((val - 0.38) / 0.30, 0, 1)[:, :, None]
    col_mid = c2 * (1 - t2) + c3 * t2
    
    t3 = np.clip((val - 0.68) / 0.32, 0, 1)[:, :, None]
    col_high = c3 * (1 - t3) + c4 * t3
    
    surface_blend = np.where(val[:, :, None] < 0.38, col_low,
                             np.where(val[:, :, None] < 0.68, col_mid, col_high))
    
    result = arr.copy()
    # Campurkan tekstur organik (78% organik baru + 22% bayangan pohon/objek asli)
    result[is_main] = surface_blend[is_main] * 0.78 + arr[is_main] * 0.22
    
    # 3. Penyempurnaan Garis Perbatasan & Overhang
    border_main = is_main & binary_dilation(is_other, structure=np.ones((3, 3)))
    border_other = is_other & binary_dilation(is_main, structure=np.ones((3, 3)))
    border_other_2 = is_other & binary_dilation(border_other, structure=np.ones((3, 3))) & ~border_other
    
    c_trans1 = cfg['c_trans1']
    c_trans2 = cfg['c_trans2']
    
    # Dither mask selang-seling 1px
    dither_mask_main = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 0)
    dither_mask_other = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 1)
    
    # Transisi lapis utama paling luar
    result[border_main & dither_mask_main] = (
        result[border_main & dither_mask_main] * 0.45 + c_trans1 * 0.55
    )
    
    # Transisi lapis jalan/tanah pertama
    result[border_other] = (
        result[border_other] * 0.40 + c_trans2 * 0.60
    )
    
    # Transisi lapis jalan/tanah kedua
    result[border_other_2 & dither_mask_other] = (
        result[border_other_2 & dither_mask_other] * 0.72 + c_trans2 * 0.28
    )
    
    # Overhang Fringe (Ujung helai rumput / kristal salju menjorok ke jalan)
    np.random.seed(seed_base + 99)
    rand_fringe = np.random.rand(h, w)
    fringe_candidates = border_other & (rand_fringe < 0.44)
    
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if fringe_candidates[y, x]:
                neighbors = []
                for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    if is_main[y + dy, x + dx]:
                        neighbors.append(result[y + dy, x + dx])
                if neighbors:
                    chosen = neighbors[np.random.randint(len(neighbors))]
                    tip_col = chosen * 0.95 + c4 * 0.05
                    result[y, x] = tip_col
                    if rand_fringe[y, x] < 0.15:
                        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            ny, nx = y - dy, x - dx
                            if 0 <= ny < h and 0 <= nx < w and is_other[ny, nx]:
                                result[ny, nx] = tip_col * 0.85 + c_trans1 * 0.15
                                break
                                
    # Simpan hasil berkualitas tinggi
    final_arr = np.clip(result, 0, 255).astype(np.uint8)
    final_rgba = np.dstack([final_arr, np.full((h, w), 255, dtype=np.uint8)])
    out_im = Image.fromarray(final_rgba, mode='RGBA')
    
    out_im.save(output_asset, format='PNG')
    out_im.save(output_tiled, format='PNG')
    print(f"  ✓ Selesai: {area_name} ({w}x{h}) disimpan ke asset & tiled.")

def main():
    areas = ['forest', 'meadow', 'lake', 'road', 'deepwood', 'swamp', 'snow']
    for a in areas:
        process_area(a)
    print("\n[SELESAI] Seluruh 7 area peta berhasil diperhalus 100%!")

if __name__ == '__main__':
    main()
