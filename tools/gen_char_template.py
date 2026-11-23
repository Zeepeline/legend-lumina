#!/usr/bin/env python3
"""Templat karakter Lumina (buatan sendiri, digambar dari nol lewat kode; mengambil pelajaran dari struktur
"Eris Esra's Character Template" — 5 animasi x arah — tapi bentuk/warna/proporsi mengikuti docs/ART_BIBLE.md).

Kanvas 48x48 (format lembar NPC_ROSTER), chibi ±31 px (kepala 14 + badan 8 + kaki 9), kaki di y=47, tengah x=24. Arah: down, up, side (menghadap KANAN; kiri = flipX).
Animasi: idle 4, walk 4, run 6, interact 4, attack 6, talk 4 (hanya Down). Cahaya kiri-atas, garis tepi berwarna (bukan hitam).
Layer: Body (kulit) · Clothes (baju polos abu-krem agar mudah diwarnai) · Hair & Gear (kosong, untuk dihias).

Jalankan: python3 tools/gen_char_template.py   ->  assets/templates/lumina_char/
"""
import os, math, json, subprocess, shutil
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = os.path.join(ROOT, 'assets', 'templates', 'lumina_char')
S, GROUND, CX, HY0, TY0 = 48, 47, 24, 17, 31   # kanvas 48x48 (docs/NPC_ROSTER.md): tokoh ±31 px, tengah x=24, telapak y=47
ANIMS = [('Idle', 4), ('Walk', 4), ('Run', 6), ('Interact', 4), ('Attack', 6), ('Talk', 4)]
ANIM_DIRS = {'Talk': ['Down']}  # bicara hanya menghadap bawah (baris `talk` NPC_ROSTER)
DIRS = ['Down', 'Up', 'Side']
LAYERS = ['Body', 'Clothes', 'Hair', 'Gear']

mix = lambda a, b, t: tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))
SKIN = (240, 200, 168); TUNIC = (214, 208, 196); PANTS = (172, 168, 162); BOOT = (124, 112, 108)
EYE = (58, 38, 44); BLUSH = (238, 150, 140)


def tones(c):  # (garis tepi, bayangan, dasar, terang): bayangan ke biru-teal, terang ke kuning (ART_BIBLE §2)
    return (tuple(int(v * .36 + 16) for v in c), mix(c, (50, 60, 110), .24), c, mix(c, (255, 240, 190), .32))


class Sprite:
    def __init__(s):
        s.ops = []  # (z, layer, {(x,y): rgb})

    def part(s, z, layer, pts, base, outline=True, shade=True, dim=0):
        pts = {(x, y) for x, y in pts if 0 <= x < S and 0 <= y < S}
        if not pts: return
        ol, sh, ba, lt = tones(mix(base, (30, 30, 50), dim) if dim else base)
        px = {}
        if outline:
            for x, y in pts:
                for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if q not in pts and 0 <= q[0] < S and 0 <= q[1] < S: px[q] = ol
        for x, y in pts:
            c = ba
            if shade:
                if (x + 1, y) not in pts or (x, y + 1) not in pts: c = sh
                elif (x - 1, y) not in pts or (x, y - 1) not in pts or (x - 1, y - 1) not in pts: c = lt
            px[(x, y)] = c
        s.ops.append((z, layer, px))

    def dot(s, z, layer, x, y, c):
        if 0 <= x < S and 0 <= y < S: s.ops.append((z, layer, {(x, y): c}))

    def render(s):
        ops = sorted(s.ops, key=lambda o: o[0])
        flat = Image.new('RGBA', (S, S), (0, 0, 0, 0)); lay = {n: Image.new('RGBA', (S, S), (0, 0, 0, 0)) for n in LAYERS}
        topz = {n: {} for n in LAYERS}
        for z, l, px in ops:
            for p, c in px.items():
                flat.putpixel(p, c + (255,)); lay[l].putpixel(p, c + (255,)); topz[l][p] = z
        for p in list(topz['Clothes']):  # baju yang tertutup bagian Body yang lebih depan (mis. dagu) dilubangi → tumpukan layer = hasil datar
            if topz['Body'].get(p, -1) > topz['Clothes'][p]: lay['Clothes'].putpixel(p, (0, 0, 0, 0))
        return flat, lay


def rows(y0, spans, cx=16):  # spans: lebar tiap baris, dipusatkan di cx
    out = set()
    for i, w in enumerate(spans):
        l = cx - w // 2 + 0
        for x in range(l, l + w): out.add((x, y0 + i))
    return out


def rect(x0, y0, x1, y1): return {(x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)}


def line2(a, b, w=2):  # garis tebal w px (cap persegi) dari a ke b
    n = max(abs(b[0] - a[0]), abs(b[1] - a[1])) + 1; pts = []; seen = set()
    for i in range(n):
        t = i / max(1, n - 1); x = round(a[0] + (b[0] - a[0]) * t); y = round(a[1] + (b[1] - a[1]) * t)
        for dx in range(w):
            for dy in range(w):
                if (x + dx, y + dy) not in seen: seen.add((x + dx, y + dy)); pts.append((x + dx, y + dy))
    return pts


def pose(anim, f, d):
    """Parameter pose: bob (naik-turun badan), head (dx,dy), lean (condong badan dx), s (ayun -1..1), lift (kaki terangkat), arms (ujung lengan relatif bahu)."""
    P = dict(bob=0, hx=0, hy=0, lean=0, s=0.0, amp=3, liftN=0, liftF=0, armN=None, armF=None, fist=False, sq=0)
    if anim == 'Idle':
        P['sq'] = [0, 0, 1, 1][f]; P['hy'] = [0, 0, 1, 1][f]
    elif anim in ('Walk', 'Run'):
        n = 4 if anim == 'Walk' else 6; ph = f / n
        P['s'] = math.cos(ph * 2 * math.pi); P['amp'] = 3 if anim == 'Walk' else 4
        if anim == 'Walk':
            P['bob'] = [0, -1, 0, -1][f]; P['liftN'] = [0, 0, 0, 1][f]; P['liftF'] = [0, 1, 0, 0][f]
        else:
            air = abs(P['s']) < .45
            P['bob'] = -2 if air else 0; P['liftN'] = P['liftF'] = 1 if air else 0; P['lean'] = 1; P['hx'] = 0
            if not air: P['bob'] = [0, 0, 0, 0, 0, 0][f]
    elif anim == 'Interact':
        k = [0, 1, 1, 0][f]; P['sq'] = 0; P['hy'] = [0, 0, 0, 0][f]; P['reach'] = [0, .6, 1, .4][f]
    elif anim == 'Attack':
        P['atk'] = f
    elif anim == 'Talk':
        P['hy'] = [0, 0, 1, 0][f]
    return P


def build(d, anim, f):
    P = pose(anim, f, d); sp = Sprite(); b = P['bob']; sq = P['sq']
    atk = P.get('atk'); reach = P.get('reach', 0)
    lean = P['lean']
    if anim == 'Attack': lean = {0: 0, 1: -1, 2: 2, 3: 2, 4: 1, 5: 0}[atk]; b = {0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}[atk]
    hy = HY0 + b + P['hy'] + (1 if anim == 'Attack' and atk in (2, 3) and d == 'Down' else 0)  # y atas kepala
    hx = P['hx'] + (lean if d == 'Side' else 0)
    ty = TY0 + b + sq                       # y atas badan
    gy = GROUND                            # telapak kaki
    legL = gy - (ty + 8) + 1               # panjang kaki dari y=ty+7 sampai telapak
    side = d == 'Side'
    s_ = P['s']; amp = P['amp']

    def leg(z, hipx, dx, lift, dim=0, w=4):
        L = max(4, legL - lift); top = ty + 8; skin = []; pants = []; boot = []
        for r in range(L):
            x = hipx + round(dx * (r / max(1, L - 1))); y = top + r; row = [(x + i, y) for i in range(w)]
            (pants if r < 4 else boot if r >= L - 3 else skin).extend(row)
        sp.part(z, 'Body', skin + [p for p in pants[-w:]] , SKIN, dim=dim)
        sp.part(z + .1, 'Clothes', pants, PANTS, dim=dim); sp.part(z + .1, 'Clothes', boot + ([(hipx + dx + w, gy - lift)] if side else []), BOOT, dim=dim)

    def arm(z, sx, sy, ex, ey, dim=0, fist=False):
        pts = line2((sx, sy), (ex, ey)); k = min(len(pts), 4)
        sp.part(z, 'Body', pts[:], SKIN, dim=dim)
        sp.part(z + .1, 'Clothes', pts[:k], TUNIC, outline=False, dim=dim)
        if fist: sp.part(z + .2, 'Body', rect(ex - 1, ey - 1, ex + 2, ey + 2), SKIN, dim=dim)

    # ---- kaki ----
    if not side:
        dy = {'Walk': 1, 'Run': 1}.get(anim, 0)
        lL = P['liftN'] if anim in ('Walk', 'Run') and s_ > .2 else 0; lR = P['liftF'] if anim in ('Walk', 'Run') and s_ < -.2 else 0
        if anim == 'Walk': lL = [0, 1, 0, 0][f]; lR = [0, 0, 0, 1][f]
        if anim == 'Run': lL = [0, 1, 2, 0, 0, 1][f] if f != 3 else 0; lR = [0, 0, 1, 1, 2, 0][f]
        leg(2, CX - 5, 0, lL); leg(2, CX + 1, 0, lR)
    else:
        sh = round(s_ * (amp + 1))
        leg(1.5, CX + lean, -sh, P['liftF'], dim=.18); leg(2, CX - 4 + lean, sh, P['liftN'])
    # ---- badan ----
    if not side:
        torso = rect(CX - 5, ty, CX + 4, ty + 7); tun = torso | rect(CX - 6, ty + 6, CX + 5, ty + 7)
    else:
        tx = CX - 5 + lean; torso = rect(tx, ty, tx + 9, ty + 7); tun = torso | rect(tx - 1, ty + 6, tx + 10, ty + 7)
    sp.part(2.5, 'Body', torso, SKIN); sp.part(3, 'Clothes', tun, TUNIC)
    # ---- lengan ----
    if not side:
        base = 0 if anim != 'Idle' else sq
        sw = round(s_ * 2) if anim in ('Walk', 'Run') else 0
        lx, rx = CX - 8, CX + 6
        exl, eyl, exr, eyr = lx, ty + 8 + sw, rx, ty + 8 - sw
        if anim == 'Interact':
            r = reach; exl, eyl = lx + 2 + round(r), ty + 6 - round(r * 3); exr, eyr = rx - 2 - round(r), ty + 6 - round(r * 3)
        if anim == 'Attack':
            eyr = {0: ty + 8, 1: ty + 3, 2: ty + 9 if d == 'Down' else ty + 2, 3: ty + 9 if d == 'Down' else ty + 2, 4: ty + 6, 5: ty + 8}[atk]
            exr = rx - (2 if atk in (2, 3) else 0)
        if anim == 'Talk' and f in (1, 3): exr, eyr = rx - 1, ty + 4
        arm(4, lx, ty + 1, exl, eyl); arm(4, rx, ty + 1, exr, eyr, fist=(anim == 'Attack' and atk in (2, 3)))
    else:
        sw = round(-s_ * amp); sx, sy = CX - 2 + lean, ty + 1
        ex, ey = sx + sw, ty + 8 - (1 if anim == 'Run' else 0); exF, eyF = sx - sw, ty + 8
        if anim == 'Run': ey = ty + 5; eyF = ty + 5
        if anim == 'Interact': ex, ey = sx + 4 + round(reach * 5), ty + 4 - round(reach * 2); exF, eyF = sx - 1, ty + 8
        if anim == 'Attack':
            ex, ey = {0: (sx + 1, ty + 7), 1: (sx - 5, ty + 4), 2: (sx + 10, ty + 3), 3: (sx + 10, ty + 3), 4: (sx + 5, ty + 5), 5: (sx + 1, ty + 7)}[atk]
            exF, eyF = sx - 2, ty + 7
        arm(1.2, sx, sy, exF, eyF, dim=.18); arm(4, sx, sy, ex, ey, fist=(anim == 'Attack' and atk in (2, 3)))
    # ---- kepala ----
    spans = [6, 10, 12, 14, 16, 16, 16, 16, 16, 16, 16, 14, 12, 8]
    head = rows(hy, spans, cx=CX + (hx if side else 0))
    sp.part(5, 'Body', head, SKIN)
    cx = CX + (hx if side else 0)
    mouth = mix(SKIN, (120, 50, 50), .55); talk = (anim == 'Talk' and [0, 1, 0, 1][f]) or 0
    if d == 'Down':
        for ex in (cx - 5, cx + 3):
            for dx in (0, 1):
                for dy in (0, 1, 2): sp.dot(5.1, 'Body', ex + dx, hy + 7 + dy, EYE)
            sp.dot(5.2, 'Body', ex, hy + 7, (255, 255, 255))
        sp.dot(5.1, 'Body', cx - 7, hy + 10, BLUSH); sp.dot(5.1, 'Body', cx - 6, hy + 10, BLUSH); sp.dot(5.1, 'Body', cx + 5, hy + 10, BLUSH); sp.dot(5.1, 'Body', cx + 6, hy + 10, BLUSH)
        for dx in (-1, 0):
            sp.dot(5.1, 'Body', cx + dx, hy + 11, mouth)
            if talk: sp.dot(5.1, 'Body', cx + dx, hy + 12, mix(mouth, (60, 20, 30), .5))
    elif d == 'Side':
        ex = cx + 4
        for dx in (0, 1):
            for dy in (0, 1, 2): sp.dot(5.1, 'Body', ex + dx, hy + 7 + dy, EYE)
        sp.dot(5.2, 'Body', ex, hy + 7, (255, 255, 255)); sp.dot(5.1, 'Body', ex - 3, hy + 10, BLUSH); sp.dot(5.1, 'Body', ex - 2, hy + 10, BLUSH)
        sp.dot(5.1, 'Body', cx + 8, hy + 9, SKIN); sp.dot(5.1, 'Body', cx + 8, hy + 10, SKIN); sp.dot(5.1, 'Body', cx + 5, hy + 11, mouth)
    return sp.render()


README = '''# Templat karakter Lumina

Dasar karakter chibi buatan sendiri (digambar dari nol lewat `tools/gen_char_template.py`, bukan salinan templat pihak lain), untuk didandani jadi NPC/hero dengan jalan 4 arah asli. Tidak dimuat game (tidak ada di `IMG_LIST`); jadi bahan kerja. Berkas di folder ini hasil generator: jangan diedit tangan, ubah skripnya.

- **Kanvas** 48×48 (format lembar `docs/NPC_ROSTER.md`), tengah x=24, telapak di y=47, tinggi 32 px. Garis tepi berwarna, cahaya kiri-atas (`docs/ART_BIBLE.md`).
- **Arah** `Down`, `Up`, `Side`. Side menghadap KANAN; kiri = `flipX` (sama seperti `mila_sheet.png`, `docs/NPC_ANIM.md`).
- **Animasi** Idle 4 · Walk 4 · Run 6 · Interact 4 · Attack 6 (per arah) · Talk 4 (hanya Down). Tag `.aseprite`: `<Anim>_<Arah>`.
- **`npc_sheet_base.png`** = lembar dasar siap dandan sesuai NPC_ROSTER §1 (8 kolom; baris 0–4: walk_down, walk_up, walk_side, idle [bawah, samping, atas × diam/napas], talk). Dandani, simpan sebagai `assets/img/npc/npc_sheet_<id>.png`, lalu tambahkan baris kegiatan (5+).
- **Berkas lain** `lumina_char.aseprite` (layer `Body`, `Clothes`, `Hair`, `Gear`; `Hair` & `Gear` kosong), `All-Sheet.png` (baris = `sheet.json: rows`, kolom = frame), `<Anim>-Sheet.png`.
- **Baju polos** di layer `Clothes` berwarna abu-krem supaya mudah diwarnai ulang; kulit di `Body`.
- Buat ulang: `python3 tools/gen_char_template.py` (butuh Pillow; `.aseprite` ikut dibuat jika `aseprite` ada di PATH).

Belum ada: arah diagonal, Jump, Rotate, kedipan mata; gerak Run di tampak depan/belakang masih tipis. Rambut/senjata digambar di layer `Hair`/`Gear` per frame.
'''


def main():
    shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
    fr = {}; sheets = {}
    for an, n in ANIMS:
        for d in ANIM_DIRS.get(an, DIRS):
            for f in range(n): fr[(an, d, f)] = build(d, an, f)
    # sheet per animasi (baris = arah, kolom = frame) + semua + lembar dasar NPC
    cols = max(n for _, n in ANIMS); nrow = sum(len(ANIM_DIRS.get(an, DIRS)) for an, _ in ANIMS)
    allim = Image.new('RGBA', (cols * S, nrow * S), (0, 0, 0, 0))
    meta = {'frame': [S, S], 'dirs': DIRS, 'anims': {}, 'rows': []}; r = 0
    for an, n in ANIMS:
        dirs = ANIM_DIRS.get(an, DIRS); sh = Image.new('RGBA', (n * S, len(dirs) * S), (0, 0, 0, 0))
        for di, d in enumerate(dirs):
            for f in range(n):
                im = fr[(an, d, f)][0]; sh.alpha_composite(im, (f * S, di * S)); allim.alpha_composite(im, (f * S, r * S))
            meta['rows'].append(f'{an}_{d}'); r += 1
        sh.save(os.path.join(OUT, f'{an}-Sheet.png')); meta['anims'][an] = n
    allim.save(os.path.join(OUT, 'All-Sheet.png'))
    # lembar dasar NPC (docs/NPC_ROSTER.md §1): 8 kolom x 48 px; baris 0-2 jalan bawah/atas/samping, 3 idle (diam+napas: bawah, samping, atas), 4 talk
    base = Image.new('RGBA', (8 * S, 5 * S), (0, 0, 0, 0))
    for i, d in enumerate(DIRS):
        for f in range(4): base.alpha_composite(fr[('Walk', d, f)][0], (f * S, i * S))
        pass
    for i, d in enumerate(('Down', 'Side', 'Up')):
        for k, f in enumerate((0, 2)): base.alpha_composite(fr[('Idle', d, f)][0], ((i * 2 + k) * S, 3 * S))
    for f in range(4): base.alpha_composite(fr[('Talk', 'Down', f)][0], (f * S, 4 * S))
    base.save(os.path.join(OUT, 'npc_sheet_base.png'))
    json.dump(meta, open(os.path.join(OUT, 'sheet.json'), 'w'), indent=1)
    # layer terpisah (untuk .aseprite): tmp/<layer>_<an>_<d>_<f>.png
    tmp = os.path.join(OUT, '_tmp'); os.makedirs(tmp); lua = ['local sp = Sprite(48,48)', 'sp.filename = "lumina_char.aseprite"', 'local lays = {}',
        'for i,n in ipairs({"Body","Clothes","Hair","Gear"}) do local l = (i==1) and sp.layers[1] or sp:newLayer(); l.name = n; lays[n]=l end', 'local fi = 0']
    seq = []
    for an, n in ANIMS:
        for d in ANIM_DIRS.get(an, DIRS):
            for f in range(n):
                seq.append((an, d, f)); [fr[(an, d, f)][1][l].save(os.path.join(tmp, f'{l}_{an}_{d}_{f}.png')) for l in ('Body', 'Clothes')]
    lua.append(f'for i=2,{len(seq)} do sp:newEmptyFrame() end')
    for i, (an, d, f) in enumerate(seq):
        for l in ('Body', 'Clothes'):
            lua.append(f'sp:newCel(lays.{l}, sp.frames[{i + 1}], Image{{fromFile="{tmp}/{l}_{an}_{d}_{f}.png"}}, Point(0,0))')
        lua.append(f'sp.frames[{i + 1}].duration = {0.2 if an == "Idle" else 0.12 if an in ("Walk", "Interact", "Talk") else 0.09}')
    i = 1
    for an, n in ANIMS:
        for d in ANIM_DIRS.get(an, DIRS):
            lua.append(f'sp:newTag({i},{i + n - 1}).name = "{an}_{d}"'); i += n
    lua.append(f'sp:saveAs("{OUT}/lumina_char.aseprite")')
    open(os.path.join(tmp, 'build.lua'), 'w').write('\n'.join(lua))
    try: subprocess.run(['aseprite', '-b', '--script', os.path.join(tmp, 'build.lua')], check=True, capture_output=True)
    except Exception as e: print('aseprite dilewati:', e)
    shutil.rmtree(tmp, ignore_errors=True)
    open(os.path.join(OUT, 'README.md'), 'w').write(README)
    print('selesai ->', OUT, sorted(os.listdir(OUT)))


if __name__ == '__main__':
    main()
