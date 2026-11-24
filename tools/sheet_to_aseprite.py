#!/usr/bin/env python3
"""Ubah lembar NPC 48×48 (format docs/NPC_ROSTER.md) menjadi berkas .aseprite siap sunting.

Pakai:  python3 tools/sheet_to_aseprite.py <id> [keluaran.aseprite]
  - membaca assets/img/npc/npc_sheet_<id>.png dan urutan baris kegiatan dari NPC_SHEETS (src/npc/life_sheet.js)
  - hasil: assets/templates/npc/npc_<id>.aseprite — 1 layer, 1 frame per pose, tag per animasi
    (walk_down, walk_up, walk_side, idle, talk, lalu kegiatan), durasi frame dari NPC_SHEET_FPS, palet = warna lembar.
Ditulis langsung mengikuti spesifikasi berkas Aseprite (tanpa perlu aplikasi Aseprite).
Untuk mengembalikan ke game: di Aseprite → File › Export Sprite Sheet (By Rows, 1 baris per tag, sel 48×48) lalu simpan
sebagai assets/img/npc/npc_sheet_<id>.png; untuk id di HAND (tools/gen_npc_sheets.py) generator tidak menimpanya.
"""
import os, re, struct, sys, zlib
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = 48
FIXED = [('walk_down', 'walk'), ('walk_up', 'walk'), ('walk_side', 'walk'), ('idle', None), ('talk', 'talk')]
TAG_RGB = [(0, 0, 0), (232, 106, 86), (240, 192, 80), (110, 190, 110), (90, 160, 220), (170, 120, 220), (220, 120, 180)]


def sheet_spec(npc_id):
    src = open(os.path.join(ROOT, 'src/npc/life_sheet.js'), encoding='utf8').read()
    m = re.search(r"^\s*" + re.escape(npc_id) + r":\s*\[([^\]]*)\]", src, re.M)
    acts = re.findall(r"'([^']+)'", m.group(1)) if m else []
    fps = dict(re.findall(r"(\w+): (\d+)", re.search(r"const NPC_SHEET_FPS = \{(.*?)\};", src, re.S).group(1)))
    return acts, {k: int(v) for k, v in fps.items()}


def string(s):
    b = s.encode('utf8'); return struct.pack('<H', len(b)) + b


def chunk(kind, data): return struct.pack('<IH', 6 + len(data), kind) + data


def frame_bytes(chunks, ms):
    body = b''.join(chunks)
    return struct.pack('<IHHH2xI', 16 + len(body), 0xF1FA, min(len(chunks), 0xFFFF), ms, len(chunks)) + body


def cel(img):
    """Chunk cel 0x2005 terkompresi, dipotong ke kotak isi (atau 1×1 transparan bila kosong)."""
    bb = img.getbbox() or (0, 0, 1, 1); c = img.crop(bb)
    head = struct.pack('<HhhBHh5x', 0, bb[0], bb[1], 255, 2, 0)
    return chunk(0x2005, head + struct.pack('<HH', c.width, c.height) + zlib.compress(c.tobytes(), 9))


def build(npc_id, out=None):
    acts, fps = sheet_spec(npc_id)
    sheet = Image.open(os.path.join(ROOT, f'assets/img/npc/npc_sheet_{npc_id}.png')).convert('RGBA')
    rows = FIXED + [(a, a) for a in acts]
    frames, tags = [], []
    for r, (name, rate) in enumerate(rows):
        if (r + 1) * F > sheet.height: break
        cells = [sheet.crop((c * F, r * F, c * F + F, r * F + F)) for c in range(8)]
        while cells and cells[-1].getbbox() is None: cells.pop()   # sel kosong di ujung baris
        if not cells: continue
        ms = 400 if rate is None else round(1000 / fps.get(rate, fps.get('default', 8)))
        tags.append((len(frames), len(frames) + len(cells) - 1, name))
        frames += [(im, ms) for im in cells]
    # palet = semua warna lembar (maks 256)
    cols = sorted({c[:3] for _, c in sheet.getcolors(1 << 24) if c[3] > 0})[:255]
    pal = [(0, 0, 0, 0)] + [(r, g, b, 255) for r, g, b in cols]
    first = [
        chunk(0x2007, struct.pack('<HHi8x', 1, 0, 0)),                                   # profil warna sRGB
        chunk(0x2019, struct.pack('<III8x', len(pal), 0, len(pal) - 1) + b''.join(struct.pack('<H4B', 0, *c) for c in pal)),
        chunk(0x2004, struct.pack('<HHHHHHB3x', 3, 0, 0, 0, 0, 0, 255) + string(f'npc_{npc_id}')),
        chunk(0x2018, struct.pack('<H8x', len(tags)) + b''.join(
            struct.pack('<HHBH6x3Bx', a, b, 0, 0, *TAG_RGB[i % len(TAG_RGB)]) + string(n) for i, (a, b, n) in enumerate(tags))),
    ]
    body = b''.join(frame_bytes((first if i == 0 else []) + [cel(im)], ms) for i, (im, ms) in enumerate(frames))
    head = struct.pack('<IHHHHHIH8xB3xHBBhhHH84x', 128 + len(body), 0xA5E0, len(frames), F, F, 32, 1, 100, 0, len(pal), 1, 1, 0, 0, 16, 16)
    out = out or os.path.join(ROOT, 'assets/templates/npc', f'npc_{npc_id}.aseprite')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'wb').write(head + body)
    print(f'{out}: {len(frames)} frame, tag', ', '.join(f'{n}({b - a + 1})' for a, b, n in tags), f'| {len(pal) - 1} warna')
    return out


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    build(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
