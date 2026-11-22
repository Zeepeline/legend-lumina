import os
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, binary_erosion

def generate_noise_2d(width, height, scale, seed=42):
    np.random.seed(seed)
    # Grid kasar yang diinterpolasi bilinearly
    gw, gh = int(np.ceil(width / scale)) + 2, int(np.ceil(height / scale)) + 2
    grid = np.random.rand(gh, gw)
    
    # Bilinear interpolation
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

def smooth_village_ground():
    input_path = 'tiled/ground/village_ground.png'
    output_asset = 'assets/img/ground/gnd_village_custom.png'
    output_tiled = 'tiled/ground/village_ground.png'
    
    im = Image.open(input_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    
    print(f"Memproses gambar: {w}x{h} piksel...")
    
    # 1. Segmentasi area Rumput vs Jalan
    # Rumput dominan hijau: G > R + 10 dan G > B + 10
    is_grass = (arr[:, :, 1] > arr[:, :, 0] + 10) & (arr[:, :, 1] > arr[:, :, 2] + 10)
    is_path = ~is_grass
    
    # 2. De-tiling & Organic Grass Palette
    # Buat variasi padang rumput alami berbasis noise multi-oktaf
    noise_macro = generate_noise_2d(w, h, scale=96, seed=101)  # Gelombang besar (bayangan/angin)
    noise_med   = generate_noise_2d(w, h, scale=32, seed=202)  # Variasi rumpun sedang
    noise_micro = generate_noise_2d(w, h, scale=8, seed=303)   # Tekstur daun mikro
    
    # Palet warna rumput standar Verdant Legenda Lumina:
    # C1: Rumput dalam/teduh #448036 -> [68, 128, 54]
    # C2: Rumput dasar hijau #52943e -> [82, 148, 62]
    # C3: Rumput terang/senja #62a84a -> [98, 168, 74]
    # C4: Pucuk rumput cerah  #74be56 -> [116, 190, 86]
    c1 = np.array([68., 128., 54.])
    c2 = np.array([82., 148., 62.])
    c3 = np.array([98., 168., 74.])
    c4 = np.array([116., 190., 86.])
    
    combined_noise = noise_macro * 0.5 + noise_med * 0.35 + noise_micro * 0.15
    
    # Bentuk rumput baru yang kaya variasi dan bebas dari pola ubin 16px
    grass_blend = np.zeros_like(arr)
    for y in range(h):
        for x in range(w):
            val = combined_noise[y, x]
            if val < 0.38:
                t = val / 0.38
                col = c1 * (1 - t) + c2 * t
            elif val < 0.68:
                t = (val - 0.38) / 0.30
                col = c2 * (1 - t) + c3 * t
            else:
                t = (val - 0.68) / 0.32
                col = c3 * (1 - t) + c4 * t
            grass_blend[y, x] = col

    # Terapkan rumput baru pada area rumput
    result = arr.copy()
    # Campurkan rumput halus (75% rumput organik baru + 25% basis untuk mempertahankan bayangan pohon/bangunan)
    result[is_grass] = grass_blend[is_grass] * 0.78 + arr[is_grass] * 0.22
    
    # 3. Penyempurnaan Garis Perbatasan (Smooth Transition & Grass Overhang)
    # Temukan batas perbatasan: piksel rumput yang bertetangga dengan jalan
    border_grass = is_grass & binary_dilation(is_path, structure=np.ones((3, 3)))
    border_path = is_path & binary_dilation(is_grass, structure=np.ones((3, 3)))
    border_path_2 = is_path & binary_dilation(border_path, structure=np.ones((3, 3))) & ~border_path
    
    # Warna transisi lumut / tanah basah di perbatasan
    # c_trans1 (dekat rumput): zaitun berlumut [105, 138, 70] (#698a46)
    # c_trans2 (dekat jalan): tanah lembab kekuningan [140, 130, 80] (#8c8250)
    c_trans1 = np.array([105., 138., 70.])
    c_trans2 = np.array([140., 130., 80.])
    
    # A. Terapkan warna transisi di sisi rumput paling luar (border_grass)
    # Menggunakan dithering halus agar transisi tidak tajam
    np.random.seed(777)
    dither_mask_grass = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 0)
    trans_weight_grass = 0.55
    result[border_grass & dither_mask_grass] = (
        result[border_grass & dither_mask_grass] * (1 - trans_weight_grass) +
        c_trans1 * trans_weight_grass
    )
    
    # B. Terapkan warna transisi di sisi jalan pertama (border_path)
    dither_mask_path = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 1)
    trans_weight_path1 = 0.60
    result[border_path] = (
        result[border_path] * (1 - trans_weight_path1) +
        c_trans2 * trans_weight_path1
    )
    
    # C. Terapkan dithering 1-piksel tipis pada lapis jalan kedua (border_path_2)
    trans_weight_path2 = 0.28
    result[border_path_2 & dither_mask_path] = (
        result[border_path_2 & dither_mask_path] * (1 - trans_weight_path2) +
        c_trans2 * trans_weight_path2
    )
    
    # D. Grass Blades Overhang (Juntaian helai rumput acak yang menjorok ke jalan)
    # Untuk memecah garis kotak 16px secara total!
    # Buat helai rumput V-shape / 1-3 piksel acak dari border_grass ke border_path
    rand_fringe = np.random.rand(h, w)
    # Sekitar 42% piksel perbatasan jalan yang bertetangga dengan rumput ditumbuhi pucuk rumput
    fringe_candidates = border_path & (rand_fringe < 0.44)
    
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if fringe_candidates[y, x]:
                # Ambil warna rumput tetangga terdekat
                grass_neighbors = []
                for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    if is_grass[y + dy, x + dx]:
                        grass_neighbors.append(result[y + dy, x + dx])
                if grass_neighbors:
                    chosen_col = grass_neighbors[np.random.randint(len(grass_neighbors))]
                    # Berikan sedikit variasi warna pucuk
                    tip_col = chosen_col * 0.95 + c4 * 0.05
                    result[y, x] = tip_col
                    # Kadang menjorok 1 piksel lagi (ujung runcing helai rumput setinggi 2px)
                    if rand_fringe[y, x] < 0.15:
                        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            ny, nx = y - dy, x - dx # menjauhi arah rumput
                            if 0 <= ny < h and 0 <= nx < w and is_path[ny, nx]:
                                result[ny, nx] = tip_col * 0.85 + c_trans1 * 0.15
                                break

    # Simpan hasil berkualitas tinggi
    final_arr = np.clip(result, 0, 255).astype(np.uint8)
    
    # Tambahkan channel alpha penuh (255)
    final_rgba = np.dstack([final_arr, np.full((h, w), 255, dtype=np.uint8)])
    out_im = Image.fromarray(final_rgba, mode='RGBA')
    
    out_im.save(output_asset, format='PNG')
    out_im.save(output_tiled, format='PNG')
    print(f"Berhasil menyimpan tanah yang diperhalus ke:\n  - {output_asset}\n  - {output_tiled}")

if __name__ == '__main__':
    smooth_village_ground()
