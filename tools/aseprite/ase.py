# Pembaca/penulis berkas .aseprite tanpa aplikasi Aseprite (format resmi: github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md).
# Baca: lapisan, frame, durasi, tag animasi, palet → gambar RGBA per frame (lapisan terlihat digabung).
# Pakai: python3 tools/aseprite/ase.py info <file>      |  python3 tools/aseprite/ase.py sheet <file> <out.png>
import struct, zlib, sys
import numpy as np
from PIL import Image

def read(path):
    b = open(path, 'rb').read()
    size, magic, nframes, W, H, depth = struct.unpack_from('<IHHHHH', b, 0)
    assert magic == 0xA5E0, 'bukan berkas aseprite'
    trans = b[28]
    off = 128; layers, frames, tags, pal = [], [], [], [(0, 0, 0, 0)] * 256
    for fi in range(nframes):
        fsize, fmagic, old_chunks, dur = struct.unpack_from('<IHHH', b, off)
        nchunks = struct.unpack_from('<I', b, off + 12)[0] or old_chunks
        p = off + 16; cels = []
        for _ in range(nchunks):
            csize, ctype = struct.unpack_from('<IH', b, p); d = p + 6
            if ctype == 0x2004:  # lapisan
                flags, ltype, child, _, _, blend, opacity = struct.unpack_from('<HHHHHHB', b, d)
                n = struct.unpack_from('<H', b, d + 16)[0]; name = b[d + 18:d + 18 + n].decode('utf8', 'replace')
                layers.append(dict(name=name, visible=bool(flags & 1), type=ltype, opacity=opacity))
            elif ctype == 0x2005:  # sel (gambar di satu lapisan pada frame ini)
                li, x, y, op, ct = struct.unpack_from('<HhhBH', b, d)
                if ct in (0, 2):
                    w, h = struct.unpack_from('<HH', b, d + 16); raw = b[d + 20:p + csize]
                    if ct == 2: raw = zlib.decompress(raw)
                    cels.append(dict(layer=li, x=x, y=y, op=op, w=w, h=h, data=raw))
                elif ct == 1:
                    cels.append(dict(layer=li, link=struct.unpack_from('<H', b, d + 16)[0], x=x, y=y, op=op))
            elif ctype == 0x2018:  # tag animasi
                n = struct.unpack_from('<H', b, d)[0]; q = d + 10
                for _ in range(n):
                    fr, to, direc = struct.unpack_from('<HHB', b, q); q += 17
                    ln = struct.unpack_from('<H', b, q)[0]; tags.append(dict(name=b[q + 2:q + 2 + ln].decode('utf8', 'replace'), frm=fr, to=to)); q += 2 + ln
            elif ctype == 0x2019:  # palet
                psize, first, last = struct.unpack_from('<III', b, d); q = d + 20
                for i in range(first, last + 1):
                    fl = struct.unpack_from('<H', b, q)[0]; r, g, bb, a = b[q + 2:q + 6]; pal[i] = (r, g, bb, a); q += 6
                    if fl & 1: q += 2 + struct.unpack_from('<H', b, q)[0]
            p += csize
        frames.append(dict(dur=dur, cels=cels)); off += fsize
    return dict(W=W, H=H, depth=depth, trans=trans, layers=layers, frames=frames, tags=tags, pal=pal)

def render(A, fi):
    W, H = A['W'], A['H']; out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cels = sorted(A['frames'][fi]['cels'], key=lambda c: c['layer'])
    for c in cels:
        L = A['layers'][c['layer']]
        if not L['visible'] or L['type'] != 0: continue
        if 'link' in c: c = next((k for k in A['frames'][c['link']]['cels'] if k['layer'] == c['layer']), None)
        if not c or 'data' not in c: continue
        w, h = c['w'], c['h']
        if A['depth'] == 32: arr = np.frombuffer(c['data'], np.uint8)[:w * h * 4].reshape(h, w, 4).copy()
        elif A['depth'] == 16:
            g = np.frombuffer(c['data'], np.uint8)[:w * h * 2].reshape(h, w, 2); arr = np.dstack([g[..., 0]] * 3 + [g[..., 1]])
        else:
            idx = np.frombuffer(c['data'], np.uint8)[:w * h].reshape(h, w); P = np.array(A['pal'], np.uint8); arr = P[idx].copy(); arr[idx == A['trans'], 3] = 0
        im = Image.fromarray(arr, 'RGBA')
        if c['op'] < 255 or L['opacity'] < 255:
            a = np.array(im); a[..., 3] = (a[..., 3].astype(int) * c['op'] * L['opacity'] // 65025).astype(np.uint8); im = Image.fromarray(a)
        out.alpha_composite(im, (c['x'], c['y']))
    return out

if __name__ == '__main__':
    cmd, path = sys.argv[1], sys.argv[2]; A = read(path)
    if cmd == 'info':
        print(f"{A['W']}×{A['H']} · {len(A['frames'])} frame · {A['depth']} bit · lapisan {[l['name'] for l in A['layers']]} · tag {[(t['name'], t['frm'], t['to']) for t in A['tags']]}")
    elif cmd == 'sheet':
        n = len(A['frames']); cols = min(n, 8); rows = (n + cols - 1) // cols
        sh = Image.new('RGBA', (A['W'] * cols, A['H'] * rows))
        for i in range(n): sh.paste(render(A, i), ((i % cols) * A['W'], (i // cols) * A['H']))
        sh.save(sys.argv[3]); print('ok', sh.size)
