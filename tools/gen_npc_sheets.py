#!/usr/bin/env python3
"""Pembuat lembar sprite NPC (docs/NPC_ROSTER.md): tiap NPC -> assets/img/npc/npc_sheet_<id>.png (8 kolom x 48 px; baris 0-4 tetap, 5+ kegiatan sesuai urutan di dokumen).
Tubuh dasar = templat Lumina (tools/gen_char_template.py); penampilan di tools/npcgen/roster.py; pose di tools/npcgen/poses.py.
  python3 tools/gen_npc_sheets.py            semua NPC + perbarui NPC_SHEETS di src/npc/life_sheet.js
  python3 tools/gen_npc_sheets.py gk2 st1    hanya yang disebut (tanpa mengubah life_sheet.js)
  python3 tools/gen_npc_sheets.py --preview gk2 st1 -o /path/out.png   lembar kontak (tidak menulis aset)"""
import os, re, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from npcgen.figure import draw
from npcgen import poses, roster

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = os.path.join(ROOT, 'assets', 'img', 'npc'); LS = os.path.join(ROOT, 'src', 'npc', 'life_sheet.js')
F = 48


def frame(d, P, st): return draw(d, P, st)[0]


def sheet(npc_id, acts):
    st = roster.S[npc_id]; rows_ = 5 + len(acts)
    im = Image.new('RGBA', (8 * F, rows_ * F), (0, 0, 0, 0))
    put = lambda c, r, fr: im.alpha_composite(fr, (c * F, r * F))
    for r, d in enumerate(('Down', 'Up', 'Side')):
        for f in range(4): put(f, r, frame(d, poses.loco('walk', d, f, st), st))
    for i, d in enumerate(('Down', 'Side', 'Up')):
        for k in (0, 1): put(i * 2 + k, 3, frame(d, poses.loco('idle', d, k, st), st))
    for f in range(4): put(f, 4, frame('Down', poses.loco('talk', 'Down', f, st), st))
    for i, a in enumerate(acts):
        face, n, fn = poses.ACTS[a]
        for f in range(n): put(f, 5 + i, frame(face, fn(f, st), st))
    return im


def preview(ids, out, docs):
    sheets = [sheet(i, docs.get(i, [])) for i in ids]; W = 8 * F; H = max(s.height for s in sheets)
    cv = Image.new('RGBA', (W * len(sheets), H), (122, 150, 112, 255))
    for k, s in enumerate(sheets): cv.alpha_composite(s, (k * W, 0))
    cv.save(out); print('pratinjau ->', out, cv.size)


def write_registry(docs, ids):
    src = open(LS).read(); body = '\n'.join(f"  {i}: [{', '.join(repr(a) for a in docs[i])}]," for i in ids)
    blk = f"const NPC_SHEETS = {{ // {{{{GEN}}}} dibuat tools/gen_npc_sheets.py dari docs/NPC_ROSTER.md (urutan = baris 5+ di lembar)\n{body}\n}}; // {{{{/GEN}}}}"
    pat = re.compile(r"const NPC_SHEETS = \{.*?\n\};( // \{\{/GEN\}\})?", re.S)
    assert pat.search(src), 'blok NPC_SHEETS tidak ditemukan'
    open(LS, 'w').write(pat.sub(lambda m: blk, src, 1))


def main(argv):
    docs = roster.parse_doc(); prev = '--preview' in argv; out = None
    if '-o' in argv: out = argv[argv.index('-o') + 1]; argv = [a for a in argv if a not in ('-o', out)]
    ids = [a for a in argv if not a.startswith('-')]; allrun = not ids
    ids = ids or [i for i in docs if i in roster.S]
    missing = [i for i in docs if i not in roster.S]
    unknown = sorted({a for i in ids for a in docs.get(i, []) if a not in poses.ACTS})
    if unknown: print('animasi belum ada:', unknown); sys.exit(1)
    if prev: return preview(ids, out or '/tmp/npc_preview.png', docs)
    for i in ids:
        sheet(i, docs[i]).save(os.path.join(OUT, f'npc_sheet_{i}.png'))
    print(f'{len(ids)} lembar ditulis ->', OUT, '| tanpa gaya:', missing or '-')
    if allrun: write_registry(docs, ids); print('NPC_SHEETS diperbarui di', os.path.relpath(LS, ROOT))


if __name__ == '__main__':
    main(sys.argv[1:])
