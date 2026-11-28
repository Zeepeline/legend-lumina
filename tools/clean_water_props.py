"""Bersihkan semua pohon, semak, batu, jamur, dan dekorasi alam yang berdiri di atas air
di seluruh 14 peta luar Benua Lumina (berdasarkan gambar tanah final gnd_<id>_custom.png).

Jalankan dari akar repo: python3 tools/clean_water_props.py
"""
import os
import re
import numpy as np
from PIL import Image

from seam_ground import is_water, regions

OUT_GND = 'godot/assets/art/ground/gnd_%s_custom.png'
MAP_DIR = 'godot/maps'

# Hanya hapus prop alam/tumbuhan/batu; JANGAN hapus NPC, musuh, peti, kuil, jembatan, bangunan, portal, spot memancing.
PROP_PREFIXES = (
    'NatTree', 'BorderTree', 'NatDeco', 'DwTree', 'WildTree', 'CityTree', 'VillageTree',
    'Tree', 'GiantTree', 'Pine', 'Oak', 'Apple', 'Orange', 'SwampTree', 'SnowTree',
    'Bush', 'Shrub', 'Rock', 'Stone', 'Boulder', 'Mushroom', 'Flower', 'Grass',
    'Stump', 'Log', 'Fern', 'Reed', 'Decor', 'Prop', 'Moss', 'Plant', 'SproutTree',
)
PROTECTED_KEYWORDS = (
    'Npc', 'NPC', 'Enemy', 'Boss', 'Chest', 'Shrine', 'Portal', 'Door', 'Bridge',
    'Fish', 'Sign', 'House', 'Inn', 'Temple', 'Gate', 'Wall', 'Tower', 'Stall',
    'Well', 'Camp', 'Fire', 'Lamp', 'Banner', 'Fence', 'Spawn', 'Grave', 'Spring',
)


def is_cleanable_prop(node_name: str) -> bool:
    for kw in PROTECTED_KEYWORDS:
        if kw.lower() in node_name.lower():
            return False
    return node_name.startswith(PROP_PREFIXES)


def in_water(wmask: np.ndarray, x: float, y: float, radius: int = 8) -> bool:
    H, W = wmask.shape
    ix, iy = int(round(x)), int(round(y))
    if ix < 0 or iy < 0 or ix >= W or iy >= H:
        return False
    y0, y1 = max(0, iy - radius), min(H, iy + radius + 1)
    x0, x1 = max(0, ix - radius), min(W, ix + radius + 1)
    patch = wmask[y0:y1, x0:x1]
    # Anggap berdiri di atas air bila pusatnya air atau >= 35% tapaknya adalah air
    return bool(wmask[iy, ix] or (patch.mean() >= 0.35))


def clean_scene(rid: str) -> int:
    tscn_path = os.path.join(MAP_DIR, f'{rid}.tscn')
    gnd_path = OUT_GND % rid
    if not os.path.exists(tscn_path) or not os.path.exists(gnd_path):
        return 0

    arr = np.array(Image.open(gnd_path).convert('RGBA'))
    wmask = is_water(arr)

    text = open(tscn_path, 'r', encoding='utf-8').read()
    # Pisah per blok [node ...]
    parts = re.split(r'(?=\n\[node )', text)
    kept = []
    removed = 0
    removed_names = set()

    for idx, block in enumerate(parts):
        if idx == 0:
            kept.append(block)
            continue
        m_hdr = re.match(r'\n\[node name="([^"]+)"[^\]]*parent="([^"]+)"', block)
        if not m_hdr:
            kept.append(block)
            continue
        name, parent = m_hdr.group(1), m_hdr.group(2)
        # Hapus anak dari node yang sudah dihapus
        if parent in removed_names or any(parent.startswith(rn + '/') for rn in removed_names):
            continue
        if parent == 'YSorted' and is_cleanable_prop(name):
            m_pos = re.search(r'position = Vector2\((-?[\d.]+),\s*(-?[\d.]+)\)', block)
            if m_pos:
                px, py = float(m_pos.group(1)), float(m_pos.group(2))
                rad = 10 if 'Tree' in name else 6
                if in_water(wmask, px, py, rad):
                    removed += 1
                    removed_names.add('YSorted/' + name)
                    removed_names.add(name)
                    continue
        kept.append(block)

    if removed > 0:
        open(tscn_path, 'w', encoding='utf-8').write(''.join(kept))
    return removed


def main() -> None:
    R = regions()
    total = 0
    for rid in R:
        n = clean_scene(rid)
        if n > 0:
            print(f'  {rid}: hapus {n} pohon/prop di atas air')
        total += n
    print(f'Total dibersihkan di seluruh Benua Lumina: {total} prop')


if __name__ == '__main__':
    main()
