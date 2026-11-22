#!/usr/bin/env python3
"""
Generate ground textures for all 7 transition maps (medan peralihan pl_*)
with 100% Unified Village Road standards, rich brown dirt patches, and seamless rivers.
"""
import os
import json
import numpy as np
from PIL import Image
import cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Palet Warna Standar Desa Lumina
ROAD_CORE   = np.array([186., 148., 96.])   # Emas Lumina #ba9460
ROAD_EDGE   = np.array([156., 124., 80.])   # Tepi Cokelat #9c7c50
ROAD_DITHER = np.array([120., 132., 74.])   # Dithering #78844a
DIRT_CORE   = np.array([178., 140., 92.])   # Bercak cokelat alami
DIRT_EDGE   = np.array([148., 118., 76.])

# Palet Rumput Lumina
GRASS_PALETTE = {
    'meadow': [
        np.array([62., 120., 48.]),
        np.array([74., 136., 58.]),
        np.array([92., 154., 72.]),
        np.array([110., 172., 88.])
    ],
    'forest': [
        np.array([48., 102., 40.]),
        np.array([58., 118., 48.]),
        np.array([72., 134., 58.]),
        np.array([88., 150., 70.])
    ],
    'swamp': [
        np.array([62., 92., 62.]),
        np.array([76., 108., 76.]),
        np.array([90., 124., 88.]),
        np.array([106., 142., 102.])
    ]
}

def generate_noise_2d(width, height, scale, seed=42):
    np.random.seed(seed)
    sw = max(2, int(width / scale))
    sh = max(2, int(height / scale))
    small = np.random.rand(sh, sw).astype(np.float32)
    noise = cv2.resize(small, (width, height), interpolation=cv2.INTER_CUBIC)
    return noise

def generate_peralihan_ground(map_id, data):
    w = data['w']
    h = data['h']
    theme = data.get('ground', 'meadow')
    paths = data.get('paths', [])
    ponds = data.get('ponds', [])
    
    print(f"Generating transition ground: {map_id} ({w}x{h}, theme={theme})...")
    
    # 1. Base Grass Texture
    c1, c2, c3, c4 = GRASS_PALETTE.get(theme, GRASS_PALETTE['meadow'])
    seed_base = abs(hash(map_id)) % 10000
    
    n_macro = generate_noise_2d(w, h, scale=96.0, seed=seed_base)
    n_mid   = generate_noise_2d(w, h, scale=36.0, seed=seed_base + 1)
    n_fine  = generate_noise_2d(w, h, scale=12.0, seed=seed_base + 2)
    n_micro = generate_noise_2d(w, h, scale=4.0,  seed=seed_base + 3)
    
    noise_combined = n_macro * 0.45 + n_mid * 0.30 + n_fine * 0.18 + n_micro * 0.07
    norm = (noise_combined - noise_combined.min()) / (noise_combined.max() - noise_combined.min() + 1e-6)
    
    t1 = np.clip(norm / 0.33, 0.0, 1.0)[:, :, None]
    t2 = np.clip((norm - 0.33) / 0.33, 0.0, 1.0)[:, :, None]
    t3 = np.clip((norm - 0.66) / 0.34, 0.0, 1.0)[:, :, None]
    
    ground_rgb = (1.0 - t1) * c1 + (t1 - t2) * c2 + (t2 - t3) * c3 + t3 * c4
    
    # 2. Rich Brown Dirt Patches (Sebaran Lebat Alami ~25-28%)
    n_dirt_cluster = generate_noise_2d(w, h, scale=80.0, seed=seed_base + 10)
    n_dirt_shape   = generate_noise_2d(w, h, scale=28.0, seed=seed_base + 11)
    n_dirt_detail  = generate_noise_2d(w, h, scale=10.0, seed=seed_base + 12)
    dirt_val = n_dirt_cluster * 0.50 + n_dirt_shape * 0.35 + n_dirt_detail * 0.15
    
    dirt_core_mask = dirt_val > 0.62
    dirt_edge_mask = (dirt_val > 0.56) & (~dirt_core_mask)
    
    ground_rgb[dirt_edge_mask] = ground_rgb[dirt_edge_mask] * 0.25 + DIRT_EDGE * 0.75
    ground_rgb[dirt_core_mask] = ground_rgb[dirt_core_mask] * 0.10 + DIRT_CORE * 0.90
    
    # Dither noise on dirt
    dirt_any = dirt_core_mask | dirt_edge_mask
    d_grain = (generate_noise_2d(w, h, scale=2.0, seed=seed_base + 13) - 0.5) * 16.0
    ground_rgb[dirt_any] = np.clip(ground_rgb[dirt_any] + d_grain[dirt_any, None], 0, 255)
    
    # 3. Seamless River (Jika ada ponds)
    if ponds:
        river_mask = np.zeros((h, w), dtype=np.uint8)
        bank_mask  = np.zeros((h, w), dtype=np.uint8)
        
        # Ponds format: [cx, cy, rx, ry]
        for p in ponds:
            cx, cy = int(p[0]), int(p[1])
            rx = int(p[2] if len(p) > 2 else 30)
            ry = int(p[3] if len(p) > 3 else rx)
            # Pasir bantaran (140px)
            cv2.ellipse(bank_mask, (cx, cy), (int(rx * 1.8), int(ry * 1.8)), 0, 0, 360, 255, -1)
            # Alur air utama (96-100px)
            cv2.ellipse(river_mask, (cx, cy), (int(rx * 1.3), int(ry * 1.3)), 0, 0, 360, 255, -1)
            
        # Draw river lines between consecutive ponds if sequential
        if len(ponds) > 1:
            for i in range(len(ponds) - 1):
                p1 = (int(ponds[i][0]), int(ponds[i][1]))
                p2 = (int(ponds[i+1][0]), int(ponds[i+1][1]))
                cv2.line(bank_mask, p1, p2, 255, thickness=130)
                cv2.line(river_mask, p1, p2, 255, thickness=92)
                
        bank_only = (bank_mask > 0) & (river_mask == 0)
        water_only = river_mask > 0
        
        # Pasir bantaran sungai
        ground_rgb[bank_only] = ground_rgb[bank_only] * 0.20 + np.array([186., 168., 120.]) * 0.80
        # Air sungai biru segar
        ground_rgb[water_only] = np.array([65., 125., 175.])
        # Riak dalam air
        water_inner = cv2.erode(river_mask, np.ones((9, 9), np.uint8)) > 0
        ground_rgb[water_inner] = np.array([95., 165., 215.])
    
    # 4. Standard Unified Village Road (Radius 17px, Total 46px)
    if paths:
        path_canvas = np.zeros((h, w), dtype=np.uint8)
        for seg in paths:
            x1, y1, x2, y2 = int(seg[0]), int(seg[1]), int(seg[2]), int(seg[3])
            cv2.line(path_canvas, (x1, y1), (x2, y2), 255, thickness=46)
            cv2.circle(path_canvas, (x1, y1), 23, 255, -1)
            cv2.circle(path_canvas, (x2, y2), 23, 255, -1)
            
        dist = cv2.distanceTransform(path_canvas, cv2.DIST_L2, 5)
        
        # Transisi dithering tepi jalan
        mask_dither = (dist > 0) & (dist <= 6.0)
        mask_edge   = (dist > 6.0) & (dist <= 14.0)
        mask_center = dist > 14.0
        
        ground_rgb[mask_dither] = ground_rgb[mask_dither] * 0.35 + ROAD_DITHER * 0.65
        ground_rgb[mask_edge]   = ground_rgb[mask_edge] * 0.15 + ROAD_EDGE * 0.85
        ground_rgb[mask_center] = ROAD_CORE
        
        # Grain pasir jalan
        r_grain = (generate_noise_2d(w, h, scale=2.5, seed=seed_base + 30) - 0.5) * 14.0
        mask_any_road = dist > 0
        ground_rgb[mask_any_road] = np.clip(ground_rgb[mask_any_road] + r_grain[mask_any_road, None], 0, 255)
        
    final_img = Image.fromarray(np.clip(ground_rgb, 0, 255).astype(np.uint8), mode='RGB')
    
    # Simpan ke tiled/ground dan assets/img/ground
    tiled_path = os.path.join(ROOT, 'tiled', 'ground', f'{map_id}_ground.png')
    final_img.save(tiled_path, 'PNG', optimize=True)
    
    assets_dir = os.path.join(ROOT, 'assets', 'img', 'ground')
    os.makedirs(assets_dir, exist_ok=True)
    asset_path = os.path.join(assets_dir, f'gnd_{map_id}_custom.png')
    final_img.save(asset_path, 'PNG', optimize=True)
    
    print(f"  -> Saved {tiled_path} and {asset_path}")

def main():
    data_file = os.path.join(ROOT, 'tools', 'peralihan_maps_data.json')
    with open(data_file) as f:
        maps_data = json.load(f)
        
    for map_id, data in maps_data.items():
        generate_peralihan_ground(map_id, data)
        
    print("\nAll 7 transition ground textures generated successfully!")

if __name__ == '__main__':
    main()
