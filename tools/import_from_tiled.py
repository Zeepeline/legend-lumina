#!/usr/bin/env python3
"""
Import perubahan dari Tiled Map Editor (.tmj) kembali ke file peta game (src/world/maps/<id>.js).
Jalankan:
  python3 tools/import_from_tiled.py village    (hanya peta desa)
  python3 tools/import_from_tiled.py            (semua peta)
"""

import os
import sys
import json
import glob
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MAPS_DIR = os.path.join(ROOT, 'tiled', 'maps')
SRC_MAPS_DIR = os.path.join(ROOT, 'src', 'world', 'maps')

# Peta nama file gambar ke jenis objek game
IMG_TO_OBJ = {
    'gpt_v_blacksmith_forge': 'blacksmith',
    'gpt_v_barn_ranch': 'barn',
    'gpt_v_chapel_church': 'church',
    'gpt_v_fishing_dock': 'fishing_dock',
    'gpt_v_guild_townhall': 'townhall',
    'gpt_v_house_brown_cottage': 'house_brown',
    'gpt_v_house_brown_wing': 'house_wing',
    'gpt_v_house_red_cottage': 'house_red',
    'gpt_v_house_red_shop': 'shop_red',
    'gpt_v_inn_2story': 'inn2',
    'gpt_v_market_stall': 'market_stall',
    'gpt_v_tavern_brown': 'tavern',
    'gpt_v_village_monument': 'monument',
    'gpt_v_village_well': 'village_well',
    'gpt_v_watchtower': 'watchtower',
    'gpt_v_windmill': 'v_windmill',
}

target_maps = sys.argv[1:] if len(sys.argv) > 1 else [
    os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(MAPS_DIR, '*.tmj'))
]

print(f"📥 Mengimpor perubahan dari Tiled untuk: {', '.join(target_maps)}")

for mid in target_maps:
    tmj_file = os.path.join(MAPS_DIR, f"{mid}.tmj")
    js_file = os.path.join(SRC_MAPS_DIR, f"{mid}.js")

    if not os.path.exists(tmj_file):
        print(f"  ⚠️ File Tiled tidak ditemukan: {tmj_file}")
        continue
    if not os.path.exists(js_file):
        print(f"  ⚠️ File peta JS tidak ditemukan: {js_file}")
        continue

    try:
        data = json.load(open(tmj_file))
    except Exception as e:
        print(f"  ❌ Gagal membaca {tmj_file}: {e}")
        continue

    # Cek apakah layer Ground (Image Layer) diubah
    ground_layer = None
    for l in data.get('layers', []):
        if l.get('type') == 'imagelayer' or 'Ground' in l.get('name', ''):
            ground_layer = l
            break

    if ground_layer and ground_layer.get('image'):
        rel_img = ground_layer.get('image')
        abs_img = os.path.normpath(os.path.join(MAPS_DIR, rel_img))
        if os.path.exists(abs_img):
            dest_img = os.path.join(ROOT, 'assets', 'img', 'ground', f'gnd_{mid}_custom.png')
            import shutil
            shutil.copyfile(abs_img, dest_img)
            js_txt = open(js_file).read()
            if 'customGround:' not in js_txt:
                js_txt = js_txt.replace(f"ground: '{mid}'", f"ground: '{mid}', customGround: 'gnd_{mid}_custom'")
                with open(js_file, 'w') as f:
                    f.write(js_txt)
            print(f"  🌄 Gambar ground kustom diimpor dari Tiled: {os.path.basename(abs_img)}")

    # Cek apakah ada Tile Layer yang dilukis (misal 'Jalan & Rumput (Paint)')
    paint_layers = [l for l in data.get('layers', []) if l.get('type') == 'tilelayer' and any(gid > 0 for gid in l.get('data', []))]
    if paint_layers:
        from PIL import Image
        terrain_firstgid = 201
        for ts in data.get('tilesets', []):
            if 'terrain' in ts.get('source', '') or ts.get('name') == 'terrain':
                terrain_firstgid = ts.get('firstgid', 201)
                break
        terrain_img_path = os.path.join(ROOT, 'tiled', 'tilesets', 'terrain.png')
        dest_img = os.path.join(ROOT, 'assets', 'img', 'ground', f'gnd_{mid}_custom.png')
        base_img_path = dest_img if os.path.exists(dest_img) else os.path.join(ROOT, 'tiled', 'ground', f'{mid}_ground.png')
        if os.path.exists(terrain_img_path) and os.path.exists(base_img_path):
            base_im = Image.open(base_img_path).convert('RGBA')
            terrain_im = Image.open(terrain_img_path).convert('RGBA')
            painted_count = 0
            for pl in paint_layers:
                pw = pl.get('width', 64)
                for idx, gid in enumerate(pl.get('data', [])):
                    if gid >= terrain_firstgid:
                        tid = gid - terrain_firstgid
                        if 0 <= tid < 32:
                            col = idx % pw
                            row = idx // pw
                            src_x = (tid % 8) * 16
                            src_y = (tid // 8) * 16
                            tile_crop = terrain_im.crop((src_x, src_y, src_x + 16, src_y + 16))
                            base_im.paste(tile_crop, (col * 16, row * 16), tile_crop)
                            painted_count += 1
            if painted_count > 0:
                base_im.save(dest_img)
                js_txt = open(js_file).read()
                if 'customGround:' not in js_txt:
                    js_txt = js_txt.replace(f"ground: '{mid}'", f"ground: '{mid}', customGround: 'gnd_{mid}_custom'")
                    with open(js_file, 'w') as f:
                        f.write(js_txt)
                print(f"  🎨 {painted_count} tile tanah/jalan yang Anda lukis di Tiled berhasil diterapkan ke game!")

    # Buat kamus tileset untuk mencari gid -> tipe objek
    tile_dict = {}
    for ts in data.get('tilesets', []):
        firstgid = ts.get('firstgid', 1)
        # Jika tileset eksternal (.tsj)
        source = ts.get('source')
        tiles_list = ts.get('tiles', [])
        if source:
            ts_path = os.path.normpath(os.path.join(MAPS_DIR, source))
            if os.path.exists(ts_path):
                try:
                    ext_ts = json.load(open(ts_path))
                    tiles_list = ext_ts.get('tiles', [])
                except Exception:
                    pass
        for t in tiles_list:
            gid = firstgid + t.get('id', 0)
            ttype = t.get('type')
            if not ttype and t.get('image'):
                img_base = os.path.splitext(os.path.basename(t.get('image')))[0]
                ttype = IMG_TO_OBJ.get(img_base, img_base)
            tile_dict[gid] = ttype

    # Cari layer 'Objects'
    obj_layer = None
    for l in data.get('layers', []):
        if 'Objects' in l.get('name', ''):
            obj_layer = l
            break

    if not obj_layer:
        print(f"  ⚠️ Layer 'Objects' tidak ditemukan di {tmj_file}")
        continue

    # Konversi koordinat Tiled kembali ke format game
    # Di Tiled: x adalah kiri (tx), y adalah dasar (ty), w adalah lebar
    # Di game: center-x = tx + w / 2, y = ty
    new_objs = []
    for o in obj_layer.get('objects', []):
        otype = o.get('type') or o.get('name')
        if not otype and o.get('gid'):
            otype = tile_dict.get(o.get('gid'))
        if not otype:
            continue
        tx = float(o.get('x', 0))
        ty = float(o.get('y', 0))
        tw = float(o.get('width', 32))
        gx = round(tx + tw / 2.0)
        gy = round(ty)
        # Penyelarasan otomatis untuk objek yang bergeser tipis
        if mid == 'village' and otype == 'pot':
            if gx == 590 and gy == 220:
                gy = 200
            elif gx == 290 and gy == 396:
                gx = 308
                gy = 424
        new_objs.append(f"['{otype}', {gx}, {gy}]")

    # Format array objs untuk file JS
    objs_str = "[\n    " + ",\n    ".join(new_objs) + "\n  ]"

    # Ganti blok objs di file JS dengan pencocokan kurung siku yang aman
    js_content = open(js_file).read()
    m = re.search(r'objs:\s*\[', js_content)
    if not m:
        print(f"  ⚠️ Tidak menemukan pola 'objs: [' di {js_file}")
        continue

    start_idx = m.start()
    bracket_start = m.end() - 1
    depth = 0
    end_idx = -1
    for idx in range(bracket_start, len(js_content)):
        ch = js_content[idx]
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                end_idx = idx + 1
                break

    if end_idx != -1:
        updated_js = js_content[:start_idx] + f"objs: {objs_str}" + js_content[end_idx:]
        with open(js_file, 'w') as f:
            f.write(updated_js)
        print(f"  ✅ Sukses memperbarui {mid}.js: {len(new_objs)} objek tersimpan!")
    else:
        print(f"  ⚠️ Kurung siku penutup tidak cocok untuk 'objs' di {js_file}")

print("\n🎉 Proses import selesai!")
