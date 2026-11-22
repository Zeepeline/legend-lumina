import os
import subprocess
import io
import numpy as np
from PIL import Image, ImageDraw
import cv2

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

def catmull_rom(p0, p1, p2, p3, n_points=35):
    t = np.linspace(0, 1, n_points)[:, None]
    t2 = t * t
    t3 = t2 * t
    q0 = -t3 + 2.0*t2 - t
    q1 = 3.0*t3 - 5.0*t2 + 2.0
    q2 = -3.0*t3 + 4.0*t2 + t
    q3 = t3 - t2
    return 0.5 * (p0 * q0 + p1 * q1 + p2 * q2 + p3 * q3)

def interpolate_spline(pts, n_per_seg=35):
    if len(pts) < 2:
        return np.array(pts, dtype=float)
    p_start = 2 * np.array(pts[0], dtype=float) - np.array(pts[1], dtype=float)
    p_end = 2 * np.array(pts[-1], dtype=float) - np.array(pts[-2], dtype=float)
    all_pts = [p_start] + [np.array(p, dtype=float) for p in pts] + [p_end]
    curve = []
    for i in range(len(all_pts) - 3):
        seg = catmull_rom(all_pts[i], all_pts[i+1], all_pts[i+2], all_pts[i+3], n_per_seg)
        curve.append(seg[:-1])
    curve.append(np.array([pts[-1]], dtype=float))
    return np.vstack(curve)

# =========================================================================
# STANDAR MUTLAK TEKSTUR & WARNA JALAN (PATOKAN DESA LUMINA UNTUK SEMUA PETA)
# =========================================================================
UNIFIED_ROAD = {
    'center': np.array([186., 148., 96.]),  # Emas tanah Lumina (#ba9460)
    'edge':   np.array([156., 124., 80.]),  # Cokelat tepi jalan (#9c7c50)
    'dither': np.array([120., 132., 74.]),  # Dithering transisi rumput (#78844a)
    'dirt_core': np.array([178., 140., 92.]),  # Petak tanah alami cokelat
    'dirt_edge': np.array([148., 118., 76.]),  # Tepi petak tanah
}

# =========================================================================
# STANDAR MUTLAK SUNGAI & PERAIRAN ALAMI DUNIA (UNIFIED NATURAL WATER SYSTEM)
# 1. Danau: 100% LITERAL DANAU ALAMI ASIMETRIS (bukan bulat/elips!) dengan
#    teluk, tanjung, dan lekukan pantai bergelombang alami.
# 2. Sungai: ALUR MELIAK-LIUK DINAMIS (High-Curvature Meandering Curves)
# 3. Tekstur: Air Biru Lumina 3 Lapis + Buih Ombak Putih + Riak Pixel Art $45^\circ$
# =========================================================================
RIVER_CONFIGS = {
    'snow': {
        'branches': [
            {
                # Hulu Sungai Senja: menuruni lereng es meliuk-liuk dinamis
                # Global exit: (3984 + 766, 1720 + 1200) = (4750, 2920)
                'pts': [
                    (700, 150), (760, 260), (690, 420), (780, 580),
                    (710, 750), (790, 930), (730, 1080), (766, 1200)
                ],
                'r_sand': 64.0, 'r_water': 44.0, 'r_deep': 22.0
            }
        ],
        'use_natural_lake': False,
        'sand_core': np.array([210., 222., 234.]),  # Pasir es / tepian es Lumina
        'sand_rim':  np.array([180., 196., 214.]),
    },
    'lake': {
        'branches': [
            {
                # Anak Sungai Cermin: keluar dari teluk tenggara Danau Cermin (820, 615) meliuk menuju tepi selatan (1332, 652)
                # Global exit: (1600 + 1332, 3060 + 652) = (2932, 3712) persis di perbatasan utara Hutan Lumina!
                'pts': [
                    (820, 615), (930, 625), (1060, 638), (1190, 646), (1332, 652)
                ],
                'r_sand': 54.0, 'r_water': 36.0, 'r_deep': 18.0
            }
        ],
        'use_natural_lake': True,  # Danau Cermin asimetris alami (BUKAN BULAT!)
        'sand_core': np.array([214., 193., 141.]),  # Pasir emas pantai (#d6c18d)
        'sand_rim':  np.array([170., 138., 82.]),   # Pasir basah tepi air (#aa8a52)
    },
    'deepwood': {
        'branches': [],
        'use_natural_lake': True,  # Danau-danau Deepwood asimetris alami (BUKAN BULAT!)
        'sand_core': np.array([214., 193., 141.]),
        'sand_rim':  np.array([170., 138., 82.]),
    },
    'forest': {
        'branches': [
            {
                # Anak Sungai Cermin: masuk dari Danau Cermin di (60, 0) [Global 2932, 3712]
                # Meliuk-liuk anggun berayun dinamis (bukan siku-siku, bukan garis lurus!)
                # Mengalir ke selatan, melewati jembatan kayu di (380, 590) -> keluar di (1280, 848) [Global 4152, 4560]
                'pts': [
                    (60, 0), (68, 70), (56, 160), (74, 260), (62, 360), (84, 460),
                    (140, 530), (230, 580), (380, 590),
                    (500, 510), (660, 660), (840, 540), (1020, 700), (1160, 780), (1280, 848)
                ],
                'r_sand': 54.0, 'r_water': 36.0, 'r_deep': 18.0
            }
        ],
        'use_natural_lake': False,
        'sand_core': np.array([214., 193., 141.]),
        'sand_rim':  np.array([170., 138., 82.]),
    },
    'meadow': {
        'branches': [
            {
                # Alur Sungai Senja membelah Padang Angin: meliuk-liuk dinamis dengan kelokan meander
                # Masuk dari Snow di (726, 0) [Global 4750, 2920] -> keluar di (1176, 1040) [Global 5200, 3960]
                'pts': [
                    (726, 0), (790, 110), (710, 220), (800, 340), (720, 440),
                    (650, 560), (630, 670), (660, 730), (770, 760), (880, 830),
                    (960, 880), (1070, 930), (1140, 990), (1176, 1040)
                ],
                'r_sand': 68.0, 'r_water': 46.0, 'r_deep': 24.0
            }
        ],
        'use_natural_lake': False,
        'sand_core': np.array([214., 193., 141.]),
        'sand_rim':  np.array([170., 138., 82.]),
    },
    'river': {
        'branches': [
            # Cabang utara: meliuk masuk dari Meadow di (1048, 0) [Global 5200, 3960]
            {
                'pts': [(1048, 0), (1080, 130), (1015, 270), (1085, 430), (1048, 600)],
                'r_sand': 68.0, 'r_water': 46.0, 'r_deep': 24.0
            },
            # Cabang barat: anak sungai dari Forest meliuk masuk di (0, 600) [Global 4152, 4560]
            {
                'pts': [(0, 600), (160, 530), (340, 670), (520, 530), (720, 670), (900, 540), (1048, 600)],
                'r_sand': 54.0, 'r_water': 36.0, 'r_deep': 18.0
            },
            # Alur Utama Sungai Senja ke muara rawa senja: MELIAK-LIUK MEANDER MEGAH (ayunan $\pm 100$ px!)
            {
                'pts': [
                    (1048, 600), (1180, 500), (1380, 710), (1600, 480),
                    (1850, 720), (2100, 470), (2350, 690), (2490, 540), (2600, 600)
                ],
                'r_sand': 72.0, 'r_water': 48.0, 'r_deep': 26.0
            }
        ],
        'use_natural_lake': False,
        'sand_core': np.array([214., 193., 141.]),
        'sand_rim':  np.array([170., 138., 82.]),
    },
    'swamp': {
        'branches': [
            # Masuk dari River di (0, 600) [Global 6752, 4560]
            {
                'pts': [(0, 600), (70, 600), (130, 580)],
                'r_sand': 72.0, 'r_water': 48.0, 'r_deep': 26.0
            },
            # Delta cabang utara ke kolam tengah
            {
                'pts': [(130, 580), (200, 535), (290, 500), (410, 465), (510, 445), (620, 440)],
                'r_sand': 56.0, 'r_water': 38.0, 'r_deep': 18.0
            },
            # Delta cabang selatan ke kolam selatan
            {
                'pts': [(70, 600), (110, 670), (145, 720), (180, 770)],
                'r_sand': 56.0, 'r_water': 38.0, 'r_deep': 18.0
            }
        ],
        'use_natural_lake': True,  # Danau-danau rawa senja asimetris alami (BUKAN BULAT!)
        'sand_core': np.array([200., 185., 135.]),
        'sand_rim':  np.array([150., 130., 80.]),
    }
}

MAP_CONFIGS = {
    'village': {
        'w': 1024, 'h': 712, 'theme': 'grass',
        'grass_c1': np.array([62., 120., 48.]),
        'grass_c2': np.array([74., 136., 58.]),
        'grass_c3': np.array([92., 154., 72.]),
        'grass_c4': np.array([110., 172., 88.]),
        'paths': [
            [0, 560, 110, 560, 17], [110, 560, 220, 520, 17], [220, 520, 320, 440, 17],
            [320, 440, 408, 410, 17], [408, 410, 442, 375, 17],
            [570, 315, 680, 315, 16], [680, 315, 750, 320, 17], [750, 320, 795, 244, 17], [795, 244, 1024, 250, 17],
            [485, 385, 450, 460, 16], [450, 460, 435, 550, 17], [435, 550, 512, 640, 17], [512, 640, 512, 712, 18],
            [495, 230, 360, 230, 14], [360, 230, 270, 235, 14], [270, 235, 180, 230, 13],
            [526, 182, 580, 216, 14], [580, 216, 620, 216, 14],
            [680, 315, 700, 395, 13], [512, 640, 590, 620, 14], [590, 620, 670, 540, 13],
            [435, 550, 440, 618, 13], [440, 618, 380, 638, 13],
            [442, 375, 485, 408, 17], [485, 408, 545, 408, 17], [545, 408, 570, 315, 17],
            [480, 285, 520, 305, 17], [520, 305, 570, 315, 17], [480, 285, 442, 375, 17],
        ]
    },
    'deepwood': {
        'w': 2400, 'h': 1800, 'theme': 'grass',
        'grass_c1': np.array([52., 104., 42.]),
        'grass_c2': np.array([66., 122., 52.]),
        'grass_c3': np.array([80., 140., 64.]),
        'grass_c4': np.array([96., 158., 76.]),
        'paths': [
            [2400, 730, 2050, 730, 17],
            [2050, 730, 1850, 560, 17],
            [1850, 560, 1600, 420, 17],
            [1600, 420, 1300, 380, 17],
            [1300, 380, 1050, 450, 17],
            [1050, 450, 800, 600, 17],
            [800, 600, 650, 850, 17],
            [650, 850, 600, 1150, 17],
            [2050, 730, 1750, 880, 17],
            [1750, 880, 1500, 980, 17],
            [1500, 980, 1550, 1420, 16],
            [1100, 900, 900, 1250, 17],
            [900, 1250, 650, 1450, 17],
            [650, 1450, 380, 1540, 17],
        ]
    },
    'lake': {
        'w': 1400, 'h': 1000, 'theme': 'grass',
        'grass_c1': np.array([60., 118., 48.]),
        'grass_c2': np.array([74., 136., 58.]),
        'grass_c3': np.array([92., 154., 72.]),
        'grass_c4': np.array([110., 172., 88.]),
        'paths': [
            [0, 550, 160, 550, 17],
            [160, 550, 260, 660, 17],
            [260, 660, 280, 820, 16],
            [280, 820, 560, 742, 16],
            [820, 110, 820, 0, 17],
            [1120, 480, 1080, 320, 16],
            [1080, 320, 820, 110, 16],
            [1120, 480, 1400, 500, 17],
        ]
    },
    'meadow': {
        'w': 1440, 'h': 1040, 'theme': 'grass',
        'grass_c1': np.array([62., 120., 48.]),
        'grass_c2': np.array([74., 136., 58.]),
        'grass_c3': np.array([92., 154., 72.]),
        'grass_c4': np.array([110., 172., 88.]),
        'paths': [
            [0, 330, 260, 330, 17], [260, 330, 460, 460, 17], [460, 460, 820, 470, 17], [820, 470, 1040, 340, 17], [1040, 340, 1200, 200, 16],
            [460, 460, 420, 720, 16], [420, 720, 300, 840, 16], [820, 470, 1000, 700, 16], [1000, 700, 1220, 760, 16],
            [260, 330, 300, 190, 14], [1000, 700, 1000, 1040, 17], [460, 460, 600, 250, 16], [600, 250, 600, 0, 16],
        ]
    },
    'forest': {
        'w': 1280, 'h': 1200, 'theme': 'grass',
        'grass_c1': np.array([54., 108., 44.]),
        'grass_c2': np.array([68., 126., 54.]),
        'grass_c3': np.array([84., 144., 66.]),
        'grass_c4': np.array([102., 162., 80.]),
        'paths': [
            [0, 730, 220, 730, 17], [220, 730, 410, 690, 17], [220, 730, 200, 560, 15],
            [1060, 530, 1280, 778, 17],
            [1060, 530, 930, 530, 17], [930, 530, 780, 620, 17], [780, 620, 700, 780, 17],
            [640, 0, 640, 160, 18], [640, 160, 420, 260, 18], [420, 260, 380, 440, 18], [380, 440, 400, 560, 18], [400, 560, 410, 690, 18],
            [410, 690, 700, 780, 18], [700, 780, 640, 920, 18], [640, 920, 640, 1010, 18],
            [420, 260, 760, 320, 16], [760, 320, 1000, 320, 16],
            [380, 440, 200, 560, 15], [200, 560, 180, 820, 15],
            [700, 780, 1000, 850, 15],
        ]
    },
    'road': {
        'w': 900, 'h': 2000, 'theme': 'grass',
        'grass_c1': np.array([62., 120., 48.]),
        'grass_c2': np.array([74., 136., 58.]),
        'grass_c3': np.array([92., 154., 72.]),
        'grass_c4': np.array([110., 172., 88.]),
        'paths': [
            [450, 2000, 450, 1500, 18], [450, 1500, 360, 1100, 18],
            [360, 1100, 520, 700, 18], [520, 700, 450, 300, 18], [450, 300, 450, 0, 18]
        ]
    },
    'swamp': {
        'w': 1280, 'h': 960, 'theme': 'swamp',
        'grass_c1': np.array([62., 92., 62.]),
        'grass_c2': np.array([76., 108., 76.]),
        'grass_c3': np.array([90., 124., 88.]),
        'grass_c4': np.array([106., 142., 102.]),
        'paths': [
            [0, 480, 160, 480, 17], [160, 480, 300, 520, 17], [300, 520, 460, 680, 17], [460, 680, 640, 840, 17],
            [640, 840, 820, 680, 17], [820, 680, 960, 560, 17], [960, 560, 1120, 480, 17], [1120, 480, 1280, 480, 17],
            [640, 0, 640, 150, 17], [640, 150, 460, 320, 16], [460, 320, 300, 520, 16],
            [640, 150, 820, 320, 16], [820, 320, 960, 560, 16],
        ]
    },
    'snow': {
        'w': 1280, 'h': 1200, 'theme': 'snow',
        'grass_c1': np.array([215., 226., 238.]),
        'grass_c2': np.array([228., 236., 246.]),
        'grass_c3': np.array([240., 245., 252.]),
        'grass_c4': np.array([252., 253., 255.]),
        'paths': [
            [640, 1200, 610, 1100, 17], [610, 1100, 560, 1000, 17], [560, 1000, 605, 900, 17], [605, 900, 575, 800, 17], [575, 800, 620, 690, 17],
            [620, 690, 640, 560, 17], [640, 560, 595, 460, 17], [595, 460, 625, 380, 17], [625, 380, 640, 230, 17],
            [560, 1000, 430, 935, 15], [430, 935, 320, 840, 15], [320, 840, 260, 760, 15],
            [605, 900, 690, 860, 15], [690, 860, 820, 830, 15], [820, 830, 930, 790, 15], [930, 790, 1020, 720, 15]
        ]
    },
    'river': {
        'w': 2600, 'h': 1000, 'theme': 'river',
        'grass_c1': np.array([62., 120., 48.]),
        'grass_c2': np.array([74., 136., 58.]),
        'grass_c3': np.array([92., 154., 72.]),
        'grass_c4': np.array([110., 172., 88.]),
        'paths': [
            [0, 530, 400, 530, 17], [400, 530, 700, 760, 17], [700, 760, 1200, 700, 17],
            [872, 0, 950, 260, 17], [950, 260, 1200, 700, 17],
            [1200, 700, 1500, 300, 17], [1500, 300, 2100, 260, 17], [2100, 260, 2400, 480, 17],
            [2400, 480, 2600, 480, 17], [1200, 700, 1700, 820, 15], [1700, 820, 2200, 760, 15]
        ]
    }
}

def get_natural_lake_mask(name, w, h):
    """Mengambil masker danau asli yang bertepi asimetris alami (BUKAN BULAT) dari git HEAD~1"""
    try:
        raw = subprocess.check_output(['git', 'show', f'HEAD~1:tiled/ground/{name}_ground.png'])
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        if im.size != (w, h):
            im = im.resize((w, h), Image.Resampling.LANCZOS)
        arr = np.array(im)
        is_water = (arr[:, :, 2] > 140) & (arr[:, :, 2] > arr[:, :, 0] + 25)
        # Hilangkan noise kecil yang bukan danau utama
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(is_water.astype(np.uint8))
        clean_mask = np.zeros((h, w), dtype=bool)
        for lbl_id in range(1, num_labels):
            if stats[lbl_id, cv2.CC_STAT_AREA] > 800:
                clean_mask |= (labels == lbl_id)
        
        # Penyesuaian presisi Danau Cermin (lake):
        # 1. Potong anak sungai lama di y > 695 (digambar terpisah via spline branches)
        # 2. Geser badan danau ke atas 75 px agar seluruh danau cermin berada di Y <= 635 (Y_global <= 3695)
        #    sehingga tidak pernah terpotong oleh perbatasan Deepwood/Forest di Y_global = 3712!
        if name == 'lake':
            clean_mask[695:, :] = False
            M = np.float32([[1, 0, 0], [0, 1, -75]])
            clean_mask = cv2.warpAffine(clean_mask.astype(np.uint8), M, (w, h)) > 0
            
        return clean_mask
    except Exception as e:
        print(f"  [WARN] Tidak bisa ambil lake mask dari HEAD~1 ({e}), menggunakan fallback.")
        return np.zeros((h, w), dtype=bool)

def render_unified_natural_water(result, name, w, h, seed_base):
    if name not in RIVER_CONFIGS:
        return np.zeros((h, w), dtype=bool)
    
    rcfg = RIVER_CONFIGS[name]
    sand_core = rcfg['sand_core']
    sand_rim  = rcfg['sand_rim']
    
    n_shore = generate_noise_2d(w, h, scale=24.0, seed=seed_base + 301)
    n_sand_grain = generate_noise_2d(w, h, scale=4.0, seed=seed_base + 302)
    
    dist_sand_min = np.full((h, w), 999.0, dtype=np.float32)
    dist_water_min = np.full((h, w), 999.0, dtype=np.float32)
    dist_deep_min = np.full((h, w), 999.0, dtype=np.float32)
    
    Y_coords, X_coords = np.ogrid[:h, :w]
    
    # 1. RENDER SUNGAI MELIAK-LIUK DINAMIS (High-Curvature Meandering Curves)
    for b in rcfg.get('branches', []):
        pts = b['pts']
        r_sand = b['r_sand']
        r_water = b['r_water']
        r_deep = b['r_deep']
        
        spline = interpolate_spline(pts, n_per_seg=35).astype(np.int32)
        mask_line = np.zeros((h, w), dtype=np.uint8)
        cv2.polylines(mask_line, [spline], isClosed=False, color=255, thickness=1)
        raw_dist = cv2.distanceTransform(255 - mask_line, cv2.DIST_L2, 5)
        
        eff_dist = raw_dist + (n_shore - 0.5) * 12.0
        
        dist_sand_min = np.minimum(dist_sand_min, eff_dist / r_sand)
        dist_water_min = np.minimum(dist_water_min, eff_dist / r_water)
        dist_deep_min = np.minimum(dist_deep_min, eff_dist / r_deep)
        
    # 2. RENDER DANAU ALAMI ASIMETRIS (BUKAN BULAT/ELIPS!)
    if rcfg.get('use_natural_lake', False):
        nat_lake_mask = get_natural_lake_mask(name, w, h)
        if np.sum(nat_lake_mask) > 100:
            lake_u8 = nat_lake_mask.astype(np.uint8)
            # Distance ke dalam air (kedalaman)
            inner_d = cv2.distanceTransform(lake_u8, cv2.DIST_L2, 5)
            # Distance ke luar air (pantai pasir)
            outer_d = cv2.distanceTransform(1 - lake_u8, cv2.DIST_L2, 5)
            
            # Tambahkan noise pantai bergelombang alami
            eff_inner = inner_d + (n_shore - 0.5) * 6.0
            eff_outer = outer_d + (n_shore - 0.5) * 6.0
            
            # Kedalaman air danau asimetris
            # Air: inner_d > 0 -> dist_water_min <= 1.0
            lake_water_dist = np.where(lake_u8 > 0, np.clip(1.0 - (eff_inner / 30.0), 0.0, 1.0), 1.0 + (eff_outer / 26.0))
            lake_deep_dist  = np.where(lake_u8 > 0, np.clip(1.0 - (eff_inner / 50.0), 0.0, 1.0), 999.0)
            lake_sand_dist  = np.where(lake_u8 > 0, 0.0, eff_outer / 26.0)
            
            dist_water_min = np.minimum(dist_water_min, lake_water_dist)
            dist_deep_min  = np.minimum(dist_deep_min, lake_deep_dist)
            dist_sand_min  = np.minimum(dist_sand_min, lake_sand_dist)
            print(f"  [DANAU ASIMETRIS ALAMI]: {np.sum(nat_lake_mask)} px danau alami dipasang tanpa lingkaran kaku!")
            
    mask_sand = dist_sand_min <= 1.0
    mask_water = dist_water_min <= 1.0
    mask_deep = dist_deep_min <= 0.65
    
    # Buih ombak pantai setebal 3-4 piksel di sepanjang garis pantai alami
    mask_foam = (dist_water_min > 0.86) & (dist_water_min <= 1.02)
    
    # Pasir bantaran bergradasi halus
    t_sand = np.clip((dist_sand_min - 0.55) / 0.45, 0, 1)
    sand_col = (1 - t_sand[:, :, None]) * sand_rim + t_sand[:, :, None] * sand_core
    sand_col += (n_sand_grain[:, :, None] - 0.5) * 12.0
    
    # Terapkan bantaran pasir
    result[mask_sand] = sand_col[mask_sand]
    
    # Dither tepi luar bantaran pasir ke tanah/rumput
    edge_dither = (dist_sand_min > 0.90) & (dist_sand_min <= 1.0)
    checker = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 0)
    dither_mask = edge_dither & checker
    result[dither_mask] = result[dither_mask] * 0.4 + sand_col[dither_mask] * 0.6
    
    # Air biru jernih Lumina
    # Dangkal: [74, 217, 226], Tengah: [58, 146, 221], Dalam: [35, 71, 122]
    water_col = np.full((h, w, 3), [58, 146, 221], dtype=np.float32)
    
    # Air dalam
    water_col[mask_deep] = [35, 71, 122]
    
    # Air dangkal toska di dekat pantai
    mask_shal = (dist_water_min > 0.60) & (dist_water_min <= 1.0)
    t_shal = np.clip((dist_water_min[mask_shal] - 0.60) / 0.40, 0, 1)[:, None]
    water_col[mask_shal] = (1 - t_shal) * [58, 146, 221] + t_shal * [74, 217, 226]
    
    # Terapkan air
    result[mask_water] = water_col[mask_water]
    
    # Riak gelombang permukaan diagonal 45 derajat (retro pixel art waves)
    diag_wave = ((X_coords + Y_coords) % 16 < 5) & (Y_coords % 8 < 2) & mask_water & (~mask_foam)
    result[diag_wave] = [220, 245, 255]
    
    # Buih ombak putih tepi pantai (shore foam)
    result[mask_foam] = [245, 252, 255]
    
    print(f"  [UNIFIED WATER ENGINE]: {np.sum(mask_water)} px air biru + {np.sum(mask_foam)} px buih ombak + {np.sum(mask_sand)} px pasir emas dipasang!")
    return mask_sand

def process_map(name):
    cfg = MAP_CONFIGS[name]
    w, h = cfg['w'], cfg['h']
    seed_base = abs(hash(name)) % 10000
    
    print(f"\n==========================================")
    print(f"Memproses {name.upper()} ({w}x{h}) - Danau Asimetris Alami & Sungai Meliak-Liuk...")
    
    # 1. Gunakan Tekstur Rumput Asli Tiny Swords (Seamless Tiling Langsung)
    grid_y, grid_x = np.indices((h, w))
    ts_tile = cv2.imread('assets/img/ground/gnd_grass.png') # 128x128 asli Tiny Swords
    th, tw = ts_tile.shape[:2]
    n_tiles_x = int(np.ceil(w / tw))
    n_tiles_y = int(np.ceil(h / th))
    grass_tiled = np.tile(ts_tile, (n_tiles_y, n_tiles_x, 1))[:h, :w]
    
    # Nuansa bioma (hutan sedikit lebih teduh, rawa sedikit lebih kehijauan zaitun)
    if name == 'forest':
        hsv_g = cv2.cvtColor(grass_tiled, cv2.COLOR_BGR2HSV).astype(float)
        hsv_g[:, :, 2] = np.clip(hsv_g[:, :, 2] * 0.90, 0, 255)
        grass_blend = cv2.cvtColor(hsv_g.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    elif name == 'deepwood':
        hsv_g = cv2.cvtColor(grass_tiled, cv2.COLOR_BGR2HSV).astype(float)
        hsv_g[:, :, 2] = np.clip(hsv_g[:, :, 2] * 0.82, 0, 255)
        grass_blend = cv2.cvtColor(hsv_g.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    elif name == 'swamp':
        hsv_g = cv2.cvtColor(grass_tiled, cv2.COLOR_BGR2HSV).astype(float)
        hsv_g[:, :, 0] = np.clip(hsv_g[:, :, 0] - 5, 0, 179)
        hsv_g[:, :, 2] = np.clip(hsv_g[:, :, 2] * 0.85, 0, 255)
        grass_blend = cv2.cvtColor(hsv_g.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    else:
        grass_blend = grass_tiled.astype(np.float32)
    
    # 2. Hitung jarak ke seluruh segmen jalan dengan border rapi Tiny Swords
    # (grid_y, grid_x sudah ada di atas)
    
    # Hitung jarak dasar d ke poros jalan dan simpan radius jalan r_ref
    dist_raw = np.full((h, w), 999.0, dtype=np.float32)
    r_ref = np.full((h, w), 18.0, dtype=np.float32)
    
    for seg in cfg['paths']:
        x1, y1, x2, y2, r = seg
        dx = x2 - x1
        dy = y2 - y1
        L = dx*dx + dy*dy
        if L == 0:
            d = np.hypot(grid_x - x1, grid_y - y1)
        else:
            t = np.clip(((grid_x - x1)*dx + (grid_y - y1)*dy) / L, 0, 1)
            px = x1 + t * dx
            py = y1 + t * dy
            d = np.hypot(grid_x - px, grid_y - py)
        mask = d < dist_raw
        dist_raw[mask] = d[mask]
        r_ref[mask] = float(r)
        
    # --- BORDER RUMPUT RAPI GAYA TINY SWORDS (STEPPED SCALLOPED ARCS) ---
    freq_leaf = generate_noise_2d(w, h, scale=8.0,  seed=seed_base + 301)
    freq_bush = generate_noise_2d(w, h, scale=20.0, seed=seed_base + 302)
    # Undakan kubah daun terkuantisasi (stepped pixel arcs 2-3 px) tanpa stray pixels
    scallop = np.floor((np.sin(freq_leaf * np.pi * 3.2) * 0.5 + 0.5) ** 1.6 * 4.0) * 1.5 + np.floor((freq_bush - 0.5) * 3.0)
    
    # Jarak efektif jalan tanah setelah tertutup juntaian rumput
    u_dirt = (dist_raw + scallop) / (r_ref + 2.0)
    road_occupied = (u_dirt <= 0.95)
    
    # Mask air awal untuk memproteksi bercak cokelat dari tercebur ke danau/sungai
    water_premask = np.zeros((h, w), dtype=bool)
    if name in RIVER_CONFIGS:
        for b in RIVER_CONFIGS[name].get('branches', []):
            spline = interpolate_spline(b['pts'], n_per_seg=20).astype(np.int32)
            cv2.polylines(water_premask.astype(np.uint8), [spline], isClosed=False, color=1, thickness=int(b['r_sand'] * 2.2))
        if RIVER_CONFIGS[name].get('use_natural_lake', False):
            nlk = get_natural_lake_mask(name, w, h)
            if np.sum(nlk) > 100:
                cv2.dilate(nlk.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35)), dst=water_premask.astype(np.uint8))
                water_premask = water_premask > 0
    
    # Mulai kanvas dari rumput/dasar
    result = grass_blend.copy()
    
    # 3. TERAPKAN BERCAK COKELAT ORGANIK ALAMI LEBAT
    valid_terrain = (~road_occupied) & (~water_premask)
    
    n_p1 = generate_noise_2d(w, h, scale=56, seed=seed_base + 77)
    n_p2 = generate_noise_2d(w, h, scale=20, seed=seed_base + 88)
    n_p3 = generate_noise_2d(w, h, scale=8,  seed=seed_base + 99)
    val_patch = n_p1 * 0.55 + n_p2 * 0.35 + n_p3 * 0.10
    
    patch_core = (val_patch > 0.62) & valid_terrain
    patch_border = (val_patch > 0.58) & (val_patch <= 0.62) & valid_terrain
    
    n_dirt = generate_noise_2d(w, h, scale=8, seed=seed_base + 111)[:, :, None]
    dirt_core_var = UNIFIED_ROAD['dirt_core'] * (0.92 + 0.16 * n_dirt)
    dirt_edge_var = UNIFIED_ROAD['dirt_edge'] * (0.92 + 0.16 * n_dirt)
    
    result[patch_core] = dirt_core_var[patch_core]
    
    dither_checker = ((np.arange(h)[:, None] + np.arange(w)[None, :]) % 2 == 0)
    result[patch_border & dither_checker] = dirt_edge_var[patch_border & dither_checker] * 0.65 + result[patch_border & dither_checker] * 0.35
    result[patch_border & ~dither_checker] = dirt_edge_var[patch_border & ~dither_checker] * 0.25 + result[patch_border & ~dither_checker] * 0.75
    
    cov_pct = (np.sum(patch_core) + np.sum(patch_border)) / max(1, np.sum(valid_terrain)) * 100
    print(f"  [BERCAK COKELAT SEBARAN LEBAT]: {cov_pct:.1f}% daratan tertutup petak tanah alami!")
    
    # 4. RENDER JALAN TANAH EMAS DENGAN TEKNIK HANA PIX (SOIL CLODS & BUSHY BORDER)
    mask_dirt = u_dirt < 1.0
    if np.any(mask_dirt):
        # A. Bangkitkan struktur gumpalan tanah padat (interconnected soil mounds)
        n_clod_lg = generate_noise_2d(w, h, scale=16.0, seed=seed_base + 401)
        n_clod_sm = generate_noise_2d(w, h, scale=8.0,  seed=seed_base + 402)
        n_clod_hi = generate_noise_2d(w, h, scale=3.0,  seed=seed_base + 403)
        
        mound_map = (n_clod_lg * 0.50 + n_clod_sm * 0.35 + n_clod_hi * 0.15)
        # Pencahayaan 3D vertikal (highlight atas clod, shadow bawah clod)
        grad_y = np.gradient(mound_map, axis=0) * 18.0
        
        # Palet Tanah Emas Lumina ala Hana Pix
        C_CREVICE = np.array([88., 60., 34.])   # Celah retakan tanah gelap (#583c22)
        C_SHADOW  = np.array([134., 96., 56.])  # Tanah bayangan (#866038)
        C_BASE    = np.array([174., 132., 80.]) # Tanah utama hangat (#ae8450)
        C_MOUND   = np.array([204., 160., 102.])# Tanah terang / gumpalan terangkat (#cc9f66)
        C_HILITE  = np.array([228., 190., 134.])# Highlight puncak gumpalan (#e4be86)
        
        dirt_val = mound_map[mask_dirt] + grad_y[mask_dirt] * 0.25
        
        t0 = np.clip(dirt_val / 0.35, 0, 1)[:, None]
        c_low = C_CREVICE * (1 - t0) + C_SHADOW * t0
        
        t1 = np.clip((dirt_val - 0.35) / 0.25, 0, 1)[:, None]
        c_mid = C_SHADOW * (1 - t1) + C_BASE * t1
        
        t2 = np.clip((dirt_val - 0.60) / 0.22, 0, 1)[:, None]
        c_hi = C_BASE * (1 - t2) + C_MOUND * t2
        
        t3 = np.clip((dirt_val - 0.82) / 0.18, 0, 1)[:, None]
        c_top = C_MOUND * (1 - t3) + C_HILITE * t3
        
        dirt_col = np.where(dirt_val[:, None] < 0.35, c_low,
                   np.where(dirt_val[:, None] < 0.60, c_mid,
                   np.where(dirt_val[:, None] < 0.82, c_hi, c_top)))
        
        # Alur tapak tengah jalan yang lebih terinjak/padat (u_dirt < 0.35)
        center_rut = np.clip(1.0 - (u_dirt[mask_dirt] / 0.35), 0, 1)[:, None]
        dirt_col += center_rut * 10.0
        
        # Butiran grit mikro pixel art
        dirt_col += (n_clod_hi[mask_dirt, None] - 0.5) * 14.0
        
        # Taburan kerikil batu kecil (pebbles) sporadis khas Hana Pix
        np.random.seed(seed_base + 777)
        peb = np.random.rand(np.sum(mask_dirt))
        is_p_hi = (peb > 0.992) & (u_dirt[mask_dirt] < 0.82)
        is_p_sh = (peb > 0.984) & (peb <= 0.992) & (u_dirt[mask_dirt] < 0.85)
        dirt_col[is_p_hi] = np.array([238., 228., 204.]) # kerikil batu krem terang
        dirt_col[is_p_sh] = np.array([72., 48., 26.])    # bayangan batu
        
        # B. Hana Pix Drop Shadow: Bayangan juntaian rumput yang menimpa tanah di tepi
        edge_shadow_zone = u_dirt[mask_dirt] > 0.78
        edge_sh_factor = np.clip((u_dirt[mask_dirt][edge_shadow_zone] - 0.78) / 0.22, 0, 1)[:, None]
        dirt_col[edge_shadow_zone] = dirt_col[edge_shadow_zone] * (1.0 - 0.42 * edge_sh_factor) + C_CREVICE * (0.42 * edge_sh_factor)
        
        result[mask_dirt] = dirt_col
        
        # C. Border Rumput Rapi Tiny Swords: Highlight Pucuk Daun Solid & Bayangan Jatuh Tegas
        mask_grass_rim = (u_dirt >= 1.0) & (u_dirt < 1.20)
        if np.any(mask_grass_rim):
            u_g = np.clip((u_dirt[mask_grass_rim] - 1.0) / 0.20, 0, 1)[:, None]
            
            C_GRASS_TIP = np.array([182., 214., 88.]) # Puncak daun terang Tiny Swords (#b6d658)
            C_GRASS_BODY= np.array([124., 168., 58.]) # Badan daun rumput (#7ca83a)
            
            leaf_prominence = np.sin(freq_leaf[mask_grass_rim] * np.pi * 3.2)
            leaf_hi = (leaf_prominence > 0.35) & (u_g[:, 0] < 0.45)
            
            bg_g = result[mask_grass_rim]
            rim_col = np.where(leaf_hi[:, None], C_GRASS_TIP, C_GRASS_BODY * (1 - u_g) + bg_g * u_g)
            
            # Tanpa dither catur bintik-bintik: hasil solid dan bersih!
            result[mask_grass_rim] = rim_col
            
        print(f"  [JALAN & BORDER TINY SWORDS DIPASANG]: {np.sum(mask_dirt)} piksel jalan bertekstur tanah & border rapi!")
    
    # 5. RENDER SISTEM AIR & SUNGAI TERPADU
    if name in RIVER_CONFIGS:
        render_unified_natural_water(result, name, w, h, seed_base)
        
    # 6. Simpan hasil
    out_arr = np.clip(result, 0, 255).astype(np.uint8)
    out_img = Image.fromarray(out_arr)
    
    tiled_path = f'tiled/ground/{name}_ground.png'
    custom_path = f'assets/img/ground/gnd_{name}_custom.png'
    
    out_img.save(tiled_path, 'PNG')
    out_img.save(custom_path, 'PNG')
    print(f"  -> Disimpan ke {tiled_path} dan {custom_path}")

if __name__ == '__main__':
    for map_name in ['village', 'deepwood', 'lake', 'meadow', 'forest', 'road', 'swamp', 'snow', 'river']:
        process_map(map_name)
    print("\n[SELESAI LENGKAP] Seluruh danau asimetris alami dan sungai meliak-liuk kini 100% SERAGAM & MEWAH!")
