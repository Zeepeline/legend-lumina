# Potong lembar interior pemilik (assets/raw/interior/sheet_interior.png) jadi sprite:
#  - HD (resolusi asli, latar transparan): assets/raw/interior/hd/int_<nama>.png
#  - versi game (skala 1/3.5 = sama dengan aset Verdant): assets/img/int_<nama>.png
# Jalankan: python3 -I tools/gen_interior.py
import json, numpy as np
from PIL import Image
from scipy import ndimage
R = __file__.rsplit('/', 2)[0] + '/'
SRC = R + 'assets/raw/interior/sheet_interior.png'
F = 3.5
NAMES = {3: 'fireplace', 4: 'bed_red', 5: 'bed_blue', 6: 'wardrobe', 7: 'bookshelf', 8: 'hutch', 9: 'chest', 10: 'chest_iron', 11: 'cupboard',
  12: 'barrel', 13: 'stove', 14: 'jarshelf', 15: 'workbench', 16: 'bench', 17: 'table_flower', 18: 'table_tea', 19: 'flowerstand', 20: 'drawer',
  21: 'table_cloth', 22: 'chair', 23: 'table_round', 24: 'stool_sq', 25: 'stool', 26: 'crate', 27: 'stool_low', 28: 'rug_red', 29: 'rug_green',
  30: 'rug_blue', 31: 'planter_flowers', 32: 'candlestand', 33: 'bookcase_low', 34: 'cupboard_fruit', 35: 'pots', 36: 'bucket', 37: 'tub',
  38: 'utensil_rack', 39: 'sofa', 40: 'bucket2', 41: 'sack', 42: 'box_small', 43: 'washtub', 44: 'plant_palm', 45: 'pot_flower_w', 46: 'pot_flower_r',
  47: 'planter_box', 48: 'plant_tall', 49: 'painting', 50: 'clock', 51: 'banner_red', 52: 'banner_blue', 53: 'plant_table', 54: 'lantern',
  55: 'plant_small', 56: 'stairs', 57: 'door', 0: 'room1', 1: 'room2', 2: 'room3'}
src = Image.open(SRC).convert('RGB'); A = np.array(src).astype(int)
mask = np.abs(A).sum(2) > 36
lab, n = ndimage.label(ndimage.binary_closing(mask, iterations=2))
objs = []
for s in ndimage.find_objects(lab):
    h, w = s[0].stop - s[0].start, s[1].stop - s[1].start
    if h * w > 400: objs.append(s)
objs.sort(key=lambda s: (s[0].start // 60, s[1].start))
meta = {}
for k, s in enumerate(objs):
    nm = NAMES.get(k)
    if not nm: continue
    lid = lab[s[0].start + (s[0].stop - s[0].start) // 2, s[1].start + (s[1].stop - s[1].start) // 2]
    comp = np.zeros(mask.shape, bool); comp[s] = ndimage.binary_fill_holes(ndimage.binary_closing(mask, iterations=2)[s] & (lab[s] > 0))
    sub = A[s]; al = (comp[s] & (ndimage.binary_dilation(mask[s], iterations=1) | ndimage.binary_fill_holes(mask[s]))).astype(np.uint8) * 255
    hd = Image.fromarray(np.dstack([sub, al]).astype(np.uint8), 'RGBA'); hd.save(R + 'assets/raw/interior/hd/int_' + nm + '.png')
    W, H = max(1, round(hd.width / F)), max(1, round(hd.height / F))
    sm = np.array(hd.resize((W, H), Image.BOX)).astype(float)
    a = sm[..., 3] > 110; rgb = sm[..., :3] / np.maximum(sm[..., 3:4] / 255, .01)
    Image.fromarray(np.dstack([rgb.clip(0, 255), a * 255]).astype(np.uint8), 'RGBA').save(R + 'assets/img/int_' + nm + '.png')
    meta[nm] = [W, H]
json.dump(meta, open(R + 'assets/raw/interior/sizes.json', 'w'), indent=0)
print(len(meta), 'sprite')
