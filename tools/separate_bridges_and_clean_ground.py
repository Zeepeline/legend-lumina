"""Pisahkan jembatan kayu menjadi node Sprite2D terpisah di tiap peta .tscn (bisa ditarik-tarik di Godot Editor)
dan hapus layer ground tambahan (GroundDirt, GroundSand, GroundGrass) di bawah GroundSprite pada 14 peta luar.

Jalankan dari akar repo: python3 tools/separate_bridges_and_clean_ground.py
"""
import json
import os
import re
import shutil

from seam_ground import regions

BRIDGES_JSON = 'tools/bridges/bridges.json'
BRIDGE_DST_DIR = 'godot/assets/art/bridges'
MAP_DIR = 'godot/maps'
UNUSED_GROUND_NODES = ('GroundDirt', 'GroundSand', 'GroundGrass')


def copy_bridge_assets() -> None:
    os.makedirs(BRIDGE_DST_DIR, exist_ok=True)
    for fn in os.listdir('tools/bridges'):
        if fn.endswith('.png'):
            shutil.copy2(os.path.join('tools/bridges', fn), os.path.join(BRIDGE_DST_DIR, fn))


def process_map(rid: str, bridges: list) -> None:
    path = os.path.join(MAP_DIR, f'{rid}.tscn')
    if not os.path.exists(path):
        return
    text = open(path, 'r', encoding='utf-8').read()

    # 1) Pisah per blok [node ...] dan hapus GroundDirt, GroundSand, GroundGrass serta Bridge_* lama
    parts = re.split(r'(?=\n\[node )', text)
    header = parts[0]
    kept_nodes = []
    removed_layers = 0
    for block in parts[1:]:
        m_hdr = re.match(r'\n\[node name="([^"]+)"[^\]]*parent="([^"]+)"', block)
        if m_hdr:
            name, parent = m_hdr.group(1), m_hdr.group(2)
            if parent == '.' and (name in UNUSED_GROUND_NODES or name.startswith('Bridge_')):
                removed_layers += 1
                continue
        kept_nodes.append(block)

    # Hapus ext_resource bridge lama bila ada agar tidak duplikat
    header = re.sub(r'\[ext_resource type="Texture2D"[^\]]*path="res://assets/art/bridges/[^"]+"[^\]]*\]\n', '', header)

    # 2) Tambahkan ext_resource & node Sprite2D untuk tiap jembatan di peta ini
    bridge_ext_lines = []
    bridge_node_blocks = []
    used_files = {}
    for idx, b in enumerate(bridges):
        fn = os.path.basename(b['img'])
        if fn not in used_files:
            ext_id = f'bridge_tex_{len(used_files)}'
            used_files[fn] = ext_id
            bridge_ext_lines.append(
                f'[ext_resource type="Texture2D" path="res://assets/art/bridges/{fn}" id="{ext_id}"]\n'
            )
        ext_id = used_files[fn]
        bx, by = int(b['x']), int(b['y'])
        bridge_node_blocks.append(
            f'\n[node name="Bridge_{idx}" type="Sprite2D" parent="."]\n'
            f'z_index = -6\n'
            f'position = Vector2({bx}, {by})\n'
            f'texture = ExtResource("{ext_id}")\n'
            f'centered = false\n'
        )

    if bridge_ext_lines:
        # Sisipkan ext_resource tepat setelah baris [gd_scene ...]
        m_gd = re.match(r'(\[gd_scene[^\]]*\]\n\n?)', header)
        if m_gd:
            header = header[:m_gd.end()] + ''.join(bridge_ext_lines) + header[m_gd.end():]
        else:
            header = ''.join(bridge_ext_lines) + header

    # Sisipkan Bridge_* tepat sebelum [node name="YSorted" ...]
    final_nodes = []
    inserted = False
    for block in kept_nodes:
        if not inserted and block.startswith('\n[node name="YSorted"'):
            final_nodes.extend(bridge_node_blocks)
            inserted = True
        final_nodes.append(block)
    if not inserted:
        final_nodes.extend(bridge_node_blocks)

    new_text = header + ''.join(final_nodes)
    open(path, 'w', encoding='utf-8').write(new_text)
    print(f'  {rid}: hapus {removed_layers} layer ground tambahan, pasang {len(bridges)} node Bridge_*')


def main() -> None:
    copy_bridge_assets()
    B = json.load(open(BRIDGES_JSON))
    for rid in regions():
        process_map(rid, B.get(rid, []))


if __name__ == '__main__':
    main()
