#!/usr/bin/env python3
"""
Ekspor seluruh peta game Legenda Lumina ke format Tiled Map Editor (.tmj / .tsj).
Jalankan: python3 tools/export_to_tiled.py
Hasil disimpan di folder tiled/:
  tiled/maps/<id>.tmj        -> Buka file ini di Tiled Map Editor
  tiled/tilesets/objects.tsj -> Tileset koleksi gambar objek
  tiled/ground/<id>.png      -> Gambar lantai/tanah peta
"""

import os
import sys
import json
import glob
import re
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TILED_DIR = os.path.join(ROOT, 'tiled')
MAPS_DIR = os.path.join(TILED_DIR, 'maps')
TILESETS_DIR = os.path.join(TILED_DIR, 'tilesets')
GROUND_DIR = os.path.join(TILED_DIR, 'ground')

os.makedirs(MAPS_DIR, exist_ok=True)
os.makedirs(TILESETS_DIR, exist_ok=True)
os.makedirs(GROUND_DIR, exist_ok=True)

print("🚀 Memulai proses ekspor ke format Tiled Map Editor...")

# 1. Index semua gambar yang ada di assets/img dan proto/iso/maps/tex
IMAGE_INDEX = {}

# Cek proto/iso/maps/tex (tekstur objek hasil render)
for f in glob.glob(os.path.join(ROOT, 'proto', 'iso', 'maps', 'tex', '*.png')):
    base = os.path.basename(f)
    stem = base.replace('____BASE.png', '').replace('__0.png', '').replace('.png', '')
    if stem not in IMAGE_INDEX:
        try:
            im = Image.open(f)
            IMAGE_INDEX[stem] = (f, im.width, im.height)
        except Exception:
            pass

# Cek assets/img (buildings, nature, props)
for sub in ['buildings', 'nature', 'props', 'interior', 'monsters', 'npc', 'animals']:
    for f in glob.glob(os.path.join(ROOT, 'assets', 'img', sub, '*.png')):
        stem = os.path.splitext(os.path.basename(f))[0]
        if stem not in IMAGE_INDEX:
            try:
                im = Image.open(f)
                IMAGE_INDEX[stem] = (f, im.width, im.height)
            except Exception:
                pass

print(f"📦 Terindeks {len(IMAGE_INDEX)} jenis gambar objek.")

# 2. Parse OBJ dari src/world/objects.js
OBJ_DEF = {}
obj_js = open(os.path.join(ROOT, 'src', 'world', 'objects.js')).read()
# Ambil pola: namaObjek: { key: "...", ... }
matches = re.findall(r'(\w+):\s*\{\s*key:\s*["\']([^"\']+)["\']', obj_js)
for k, key in matches:
    OBJ_DEF[k] = key

print(f"📋 Ditemukan {len(OBJ_DEF)} definisi objek di objects.js.")

# 3. Bangun Tileset Koleksi Gambar (objects.tsj)
tileset_tiles = []
type_to_gid = {}
gid = 1

# Kumpulkan semua objek yang memiliki gambar
sorted_keys = sorted(OBJ_DEF.keys())
for k in sorted_keys:
    key = OBJ_DEF[k]
    # Cari gambar berdasarkan key, k, atau variasi gpt_/i_
    match = IMAGE_INDEX.get(key) or IMAGE_INDEX.get(k) or IMAGE_INDEX.get('i_' + k) or IMAGE_INDEX.get('gpt_' + k) or IMAGE_INDEX.get(key.replace('i_', '')) or IMAGE_INDEX.get(key.replace('gpt_', ''))
    if match:
        img_path, w, h = match
        rel_img_path = os.path.relpath(img_path, TILESETS_DIR)
        tile_id = gid - 1
        tileset_tiles.append({
            "id": tile_id,
            "image": rel_img_path,
            "imagewidth": w,
            "imageheight": h,
            "type": k
        })
        type_to_gid[k] = gid
        gid += 1

tsj_data = {
    "columns": 0,
    "grid": {
        "height": 1,
        "orientation": "orthogonal",
        "width": 1
    },
    "margin": 0,
    "name": "objects",
    "spacing": 0,
    "tilecount": len(tileset_tiles),
    "tiledversion": "1.10.0",
    "tileheight": 256,
    "tilewidth": 256,
    "type": "tileset",
    "version": "1.10",
    "tiles": tileset_tiles
}

tsj_file = os.path.join(TILESETS_DIR, 'objects.tsj')
with open(tsj_file, 'w') as f:
    json.dump(tsj_data, f, indent=2)

print(f"✅ Tileset berhasil dibuat: {tsj_file} ({len(tileset_tiles)} objek bergambar)")

# 4. Parse Peta dari src/world/maps/*.js
map_files = glob.glob(os.path.join(ROOT, 'src', 'world', 'maps', '*.js'))
exported_maps = []

for mf in map_files:
    content = open(mf).read()
    # Cari id, w, h
    id_m = re.search(r"id:\s*['\"]([^'\"]+)['\"]", content)
    w_m = re.search(r"w:\s*(\d+)", content)
    h_m = re.search(r"h:\s*(\d+)", content)
    name_m = re.search(r"name:\s*['\"]([^'\"]+)['\"]", content)
    
    if not (id_m and w_m and h_m):
        continue
        
    map_id = id_m.group(1)
    map_w = int(w_m.group(1))
    map_h = int(h_m.group(1))
    map_name = name_m.group(1) if name_m else map_id

    # Parse objs: [['treeA', 100, 200], ...]
    objs = []
    objs_block = re.search(r"objs:\s*\[([\s\S]*?)\]\s*,\s*(?:trees|paths|discs|npcs|exits|enemies|fish)", content)
    if objs_block:
        obj_matches = re.findall(r"\[\s*['\"]([^'\"]+)['\"]\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)", objs_block.group(1))
        for t, x, y in obj_matches:
            objs.append((t, float(x), float(y)))

    # Parse npcs: [{ id: 'elder', name: 'Tetua Bram', x: 486, y: 95 }, ...]
    npcs = []
    npc_matches = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?x:\s*(\d+).*?y:\s*(\d+)", content)
    for nid, nm, nx, ny in npc_matches:
        npcs.append((nid, nm, int(nx), int(ny)))

    # Parse exits: [{ x: 474, y: 700, w: 76, h: 30, to: 'forest', ... }]
    exits = []
    exit_matches = re.findall(r"\{\s*x:\s*(\d+),\s*y:\s*(\d+),\s*w:\s*(\d+),\s*h:\s*(\d+),\s*to:\s*['\"]([^'\"]+)['\"]", content)
    for ex, ey, ew, eh, eto in exit_matches:
        exits.append((int(ex), int(ey), int(ew), int(eh), eto))

    # Konversi background ground jika ada
    ground_webp = os.path.join(ROOT, 'proto', 'iso', 'maps', f"{map_id}_ground.webp")
    ground_png = os.path.join(GROUND_DIR, f"{map_id}_ground.png")
    rel_ground_png = None
    if os.path.exists(ground_webp):
        try:
            im = Image.open(ground_webp)
            im.save(ground_png, 'PNG')
            rel_ground_png = os.path.relpath(ground_png, MAPS_DIR)
        except Exception:
            pass

    # Bangun Layer Tiled
    layers = []
    layer_id = 1

    # Layer 1: Image Layer Ground
    if rel_ground_png:
        layers.append({
            "id": layer_id,
            "name": "Ground",
            "type": "imagelayer",
            "visible": True,
            "opacity": 1,
            "x": 0,
            "y": 0,
            "image": rel_ground_png
        })
        layer_id += 1

    # Layer 2: Object Group (Pohon, Bangunan, Dekorasi)
    tiled_objects = []
    obj_id = 1
    for t, x, y in objs:
        ogid = type_to_gid.get(t)
        # Ambil ukuran asli gambar atau perkiraan
        match = IMAGE_INDEX.get(OBJ_DEF.get(t, t)) or IMAGE_INDEX.get(t)
        ow = match[1] if match else 32
        oh = match[2] if match else 32
        
        # Di Tiled, objek bertile memiliki pivot di bottom-left (y adalah dasar, x adalah kiri)
        # Di game origin-nya (0.5, 1.0) yaitu tengah bawah.
        # Maka: tx = x - ow / 2, ty = y
        tx = x - ow / 2.0
        ty = y
        
        obj_entry = {
            "id": obj_id,
            "name": t,
            "type": t,
            "x": round(tx, 1),
            "y": round(ty, 1),
            "width": ow,
            "height": oh,
            "visible": True
        }
        if ogid:
            obj_entry["gid"] = ogid
        tiled_objects.append(obj_entry)
        obj_id += 1

    layers.append({
        "id": layer_id,
        "name": "Objects (Pohon, Rumah, Dekorasi)",
        "type": "objectgroup",
        "visible": True,
        "opacity": 1,
        "objects": tiled_objects
    })
    layer_id += 1

    # Layer 3: NPCs
    npc_objects = []
    for nid, nm, nx, ny in npcs:
        npc_objects.append({
            "id": obj_id,
            "name": nm,
            "type": "NPC",
            "x": nx - 16,
            "y": ny - 32,
            "width": 32,
            "height": 32,
            "point": False,
            "properties": [{"name": "id", "type": "string", "value": nid}]
        })
        obj_id += 1

    if npc_objects:
        layers.append({
            "id": layer_id,
            "name": "NPCs",
            "type": "objectgroup",
            "visible": True,
            "opacity": 1,
            "objects": npc_objects
        })
        layer_id += 1

    # Layer 4: Exits / Portals
    exit_objects = []
    for ex, ey, ew, eh, eto in exits:
        exit_objects.append({
            "id": obj_id,
            "name": f"Ke {eto}",
            "type": "Exit",
            "x": ex,
            "y": ey,
            "width": ew,
            "height": eh,
            "properties": [{"name": "to", "type": "string", "value": eto}]
        })
        obj_id += 1

    if exit_objects:
        layers.append({
            "id": layer_id,
            "name": "Pintu Keluar (Exits)",
            "type": "objectgroup",
            "visible": True,
            "opacity": 1,
            "objects": exit_objects
        })
        layer_id += 1

    # Data Map Tiled (.tmj)
    tmj_data = {
        "compressionlevel": -1,
        "width": int(map_w / 16),
        "height": int(map_h / 16),
        "tilewidth": 16,
        "tileheight": 16,
        "infinite": False,
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "tiledversion": "1.10.0",
        "type": "map",
        "version": "1.10",
        "tilesets": [
            {
                "firstgid": 1,
                "source": "../tilesets/objects.tsj"
            }
        ],
        "layers": layers
    }

    out_tmj = os.path.join(MAPS_DIR, f"{map_id}.tmj")
    with open(out_tmj, 'w') as f:
        json.dump(tmj_data, f, indent=2)

    exported_maps.append(map_id)
    print(f"  🗺️  Exported: {map_id} ({map_w}x{map_h} px, {len(objs)} objek) -> tiled/maps/{map_id}.tmj")

print(f"\n🎉 SELESAI! {len(exported_maps)} peta berhasil diekspor ke folder: {MAPS_DIR}")
