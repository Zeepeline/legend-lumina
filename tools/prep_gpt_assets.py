"""Siapkan aset GPT pemilik untuk game: bersihkan (clean_asset), ubah ukuran, simpan ke assets/img/.
Objek dunia diganti dengan ukuran yang sama dengan tekstur lama agar tata letak & tabrakan tetap benar.
Jalankan ulang setelah mengubah tabel di bawah: python3 tools/prep_gpt_assets.py"""
import sys, os, json, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__)); from clean_asset import clean
R = os.path.join(os.path.dirname(__file__), '..'); TMP = '/tmp/gptprep'; os.makedirs(TMP, exist_ok=True)
N, B1, B2 = 'nature/nat_tree_%03d.png', 'new_builidng_gpt_1/bld_gpt1_%03d.png', 'new_building_gpt_2/bld_gpt2_%03d.png'
# kunci tekstur lama: (sumber, lebar maks, tinggi maks)
SWAP = {
  'i_treeA': (N % 1, 70, 78), 'i_treeB': (N % 5, 68, 76), 'round': (N % 20, 50, 62), 'pine': (N % 6, 40, 60), 'pined': (N % 8, 40, 60), 'i_treeWoodsPine': (N % 7, 60, 72),
  'i_apple1': (N % 12, 66, 76), 'i_apple2': (N % 12, 62, 72), 'i_orange1': (N % 13, 60, 76),
  'i_bushG1': (N % 23, 48, 44), 'i_bushG2': (N % 28, 50, 46), 'i_bushP': (N % 26, 34, 38), 'i_bushW': (N % 25, 34, 32), 'i_bushP2': (N % 30, 32, 32),
  'bush': (N % 29, 28, 19), 'bushy': (N % 23, 28, 20), 'bushv': (N % 27, 28, 20),
  'rock': (N % 36, 22, 15), 'i_rockWoods': (N % 45, 22, 15), 'stump': (N % 75, 22, 16), 'log': (N % 76, 34, 18),
  'hay': (N % 64, 28, 22), 'i_cart': (N % 63, 46, 40), 'crate': (N % 69, 17, 17), 'barrel': (N % 70, 17, 19), 'fence': (N % 72, 22, 15),
  'sign': (N % 60, 22, 26), 'lamp': (N % 61, 16, 32), 'mush': (N % 78, 16, 14), 'stele': (N % 73, 18, 26),
  'i_houseA': (B2 % 1, 100, 132), 'i_houseB': (B2 % 8, 100, 132), 'i_houseC': (B2 % 3, 100, 132),
  'i_market': (B1 % 11, 116, 78), 'windmill': (B2 % 9, 70, 96),
}
# NPC: id → karakter (gambar 32×32, tinggi ±30 px)
LOOK = {
  'domba': 94, 'ayam': 90, 'chick_master': 23, 'child': 55, 'rudi': 74, 'dice_gambler': 26, 'pancing': 58, 'sambo': 17, 'kafilah': 25, 'kmerchant': 59,
  'gj1': 29, 'gj2': 30, 'gw1': 10, 'gw2': 21, 'kp1': 53, 'kp2': 57, 'kp3': 11, 'kp4': 36, 'kp5': 51, 'kp6': 22, 'kp7': 2, 'kp8': 40,
  'ka1': 37, 'ka2': 75, 'ka3': 63, 'ka4': 32, 'ka5': 77, 'kb1': 73, 'kb2': 52, 'kb3': 12, 'kb4': 56,
}
def fit(src, w, h, out):
    clean(os.path.join(R, src), TMP + '/c.png'); im = Image.open(TMP + '/c.png')
    s = min(w / im.width, h / im.height); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    a = np.array(im); a[:, :, 3] = (a[:, :, 3] > 110) * 255; Image.fromarray(a).save(out); return im.size
sizes = {}
for k, (src, w, h) in SWAP.items(): sizes[k] = fit(src, w, h, os.path.join(R, 'assets/img/gpt_%s.png' % k))
for nid, n in LOOK.items():
    p = TMP + '/n.png'; small = fit('new_characters_gpt_1/char_gpt1_%03d.png' % n, 30, 30 if n < 86 else 22, p)
    im = Image.open(p); c = Image.new('RGBA', (32, 32)); c.paste(im, ((32 - im.width) // 2, 32 - im.height)); c.save(os.path.join(R, 'assets/img/npc_g%03d.png' % n))
json.dump({'swap': list(SWAP), 'look': LOOK}, open(os.path.join(R, 'assets/img/gpt_index.json'), 'w'))
print(len(SWAP), 'objek,', len(set(LOOK.values())), 'NPC')
