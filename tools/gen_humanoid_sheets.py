#!/usr/bin/env python3
"""Sprite humanoid musuh digambar lewat kode (tanpa ChatGPT): skel, goblin, goblin_shaman, gchief, gking, witch, mimic.
Rig piksel kecil (kepala/torso/lengan/kaki/senjata) per frame, digambar langsung di skala game, lalu diberi bayangan
(cahaya kiri-atas, hangat di sorot / teal di bayangan) dan garis tepi 1 px BERWARNA (bukan hitam), tanpa anti-aliasing.
Keluaran: assets/img/monsters/esh_<id>.png (4 kolom x 6 baris: idle, move, wind, atk, hurt, alert; menghadap KANAN,
kaki di baris bawah tiap frame, badan di tengah) + JSON {fw, fh, h} di stdout untuk entri ESH (src/gfx/enemy_sheets.js).
Pemakaian: venv/bin/python tools/gen_humanoid_sheets.py [id ...]   (tanpa argumen = semua)
Pratinjau 4x: ... --preview <dir>"""
import json, math, sys, os
import numpy as np
from PIL import Image, ImageDraw

CW, CH_, AX, AY = 120, 110, 60, 100  # kanvas kerja & titik jangkar (tengah kaki)
ROWS = ['idle', 'move', 'wind', 'atk', 'hurt', 'alert']

def hx(s): return np.array([int(s[i:i + 2], 16) for i in (1, 3, 5)], float)
def mix(a, b, t):
    a = hx(a) if isinstance(a, str) else a.astype(float); b = hx(b) if isinstance(b, str) else b.astype(float)
    return np.round(a * (1 - t) + b * t).astype(np.uint8)
def tone_hi(c): return mix(c, '#ffe8b0', .32)
def tone_lo(c): return mix(c, '#1c3a4c', .40)
def tone_ol(c): return mix(c, '#16102a', .80)

def sh(m, dx, dy):
    o = np.zeros_like(m)
    h, w = m.shape
    ys, yd = (slice(dy, h), slice(0, h - dy)) if dy >= 0 else (slice(0, h + dy), slice(-dy, h))
    xs, xd = (slice(dx, w), slice(0, w - dx)) if dx >= 0 else (slice(0, w + dx), slice(-dx, w))
    o[ys, xs] = m[yd, xd]; return o

class Cv:
    def __init__(s): s.a = np.zeros((CH_, CW, 4), np.uint8)
    def mask(s, fn):
        im = Image.new('L', (CW, CH_), 0); fn(ImageDraw.Draw(im)); return np.array(im) > 0
    def part(s, fn, col, outline=True, shade=True):
        m = s.mask(fn); c = hx(col) if isinstance(col, str) else col
        if m.sum() == 0: return
        s.a[m] = (*c.astype(np.uint8), 255)
        if shade:
            hl = m & ~sh(m, 1, 1); lo = m & ~sh(m, -1, -1)
            lo2 = m & ~sh(m, -2, -2) & ~hl if m.sum() > 50 else lo
            s.a[lo2] = (*mix(c, tone_lo(c), .5), 255); s.a[lo] = (*tone_lo(c), 255); s.a[hl & ~lo] = (*tone_hi(c), 255)
        if outline:
            ring = (sh(m, 1, 0) | sh(m, -1, 0) | sh(m, 0, 1) | sh(m, 0, -1)) & ~m
            s.a[ring] = (*tone_ol(c), 255)
    def px(s, x, y, col):
        x, y = int(round(x)) + AX, int(round(y)) + AY
        if 0 <= x < CW and 0 <= y < CH_: s.a[y, x] = (*(hx(col) if isinstance(col, str) else col).astype(np.uint8), 255)
    def rect(s, x0, y0, x1, y1, col):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1): s.px(x, y, col)

def P(x, y): return (int(round(x)) + AX, int(round(y)) + AY)
def line(d, a, b, w=1):
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]), 1) * 2)
    for i in range(n + 1):
        x = a[0] + (b[0] - a[0]) * i / n; y = a[1] + (b[1] - a[1]) * i / n
        r = w / 2
        d.ellipse([round(x - r + .01), round(y - r + .01), round(x + r - .51), round(y + r - .51)] if w > 1 else [round(x), round(y)] * 2, fill=255)
def ell(d, cx, cy, rx, ry): d.ellipse([P(cx - rx, cy - ry), P(cx + rx, cy + ry)], fill=255)
def poly(d, pts): d.polygon([P(*p) for p in pts], fill=255)
def vec(th, L): return (math.sin(math.radians(th)) * L, math.cos(math.radians(th)) * L)  # 0=bawah, 90=kanan(depan), 180=atas

def pose(**k):
    p = dict(b=0, l=0, hd=(0, 0), fa=(20, 30), ba=(-10, 0), w=150, fl=(1, 0), bl=(-1, 0), open=0, glow=.3, sq=0, hs=0)
    p.update(k); return p

# ---- gambar senjata (berpangkal di tangan, sudut th: 0=bawah, 90=depan, 180=atas)
def weapon(cv, kind, h, th, pz):
    hxp, hyp = h
    def along(a, b): return (hxp + vec(th, 1)[0] * a, hyp + vec(th, 1)[1] * a), (hxp + vec(th, 1)[0] * b, hyp + vec(th, 1)[1] * b)
    if kind == 'sword' or kind == 'dagger' or kind == 'great':
        L, W = {'sword': (15, 4), 'dagger': (7, 3), 'great': (22, 5)}[kind]
        col = '#a8a49a' if kind != 'great' else '#7a7a90'
        a, b = along(1, L)
        nrm = vec(th + 90, W / 2)
        cv.part(lambda d: poly(d, [(a[0] - nrm[0], a[1] - nrm[1]), (a[0] + nrm[0], a[1] + nrm[1]), (b[0] + nrm[0] * .3, b[1] + nrm[1] * .3), (b[0] + vec(th, 1.5)[0], b[1] + vec(th, 1.5)[1])]), col)
        if kind != 'dagger':   # penjaga & sarung
            g1 = along(0, 0)[0]; pp = vec(th + 90, 3)
            cv.part(lambda d: line(d, P(g1[0] - pp[0], g1[1] - pp[1]), P(g1[0] + pp[0], g1[1] + pp[1]), 2), '#c8a040' if kind == 'great' else '#8a6a3a')
        c0, c1 = along(-4, 0)
        cv.part(lambda d: line(d, P(*c0), P(*c1), 2), '#5a3a22')
        if kind == 'sword':  # karat
            for t, c in ((6, '#8a5a3a'), (11, '#7a4a30')): q = along(t, t)[0]; cv.px(q[0], q[1], c)
    elif kind in ('staff', 'wstaff'):
        a, b = along(-8, 20)
        cv.part(lambda d: line(d, P(*a), P(*b), 2), '#5a3a28' if kind == 'staff' else '#4a3040')
        top = along(20, 20)[0]; glow = pz['glow']
        oc = '#7aff9a' if kind == 'staff' else '#f060f0'
        r = 3 + (1 if glow > .6 else 0)
        cv.part(lambda d: ell(d, top[0], top[1], r, r), oc, outline=True)
        if glow > .6:
            for (ox, oy) in ((-r - 2, 0), (r + 2, 0), (0, -r - 2), (0, r + 2)): cv.px(top[0] + ox, top[1] + oy, tone_hi(hx(oc)))
        cv.px(top[0] - 1, top[1] - 1, '#f4fff0')
        if kind == 'wstaff':  # kait melengkung
            cv.part(lambda d: line(d, P(top[0] - 3, top[1] + 1), P(top[0] - 4, top[1] - 3), 1), '#4a3040')
    elif kind == 'club':
        a, b = along(-3, 13)
        cv.part(lambda d: line(d, P(*a), P(*b), 3), '#6a4a2a')
        hd = along(13, 17)[1]
        cv.part(lambda d: ell(d, hd[0], hd[1], 4, 4), '#7a5a34')
        for i in range(6):
            an = th + 20 + i * 60; q = vec(an, 5)
            cv.px(hd[0] + q[0], hd[1] + q[1], '#d8d0b8'); cv.px(hd[0] + q[0] * 1.2, hd[1] + q[1] * 1.2, '#b0a890')
    elif kind in WEAPONS: WEAPONS[kind](cv, h, th, pz)   # senjata tambahan (gen_slaver_sheets.py)
    elif kind == 'bone':  # tulang yang dilempar
        a, b = along(0, 6)
        cv.part(lambda d: line(d, P(*a), P(*b), 2), '#e8e2d0')

SPEC = {}
WEAPONS = {}
def S(**k): return k

# ---- bagian tubuh
def draw_char(cv, sp, pz):
    legL, torL, tw, hr = sp['legL'], sp['torL'], sp['tw'], sp['hr']
    sq = pz['sq']; hipY = -legL + sq + pz['b'] * 0
    hip = (0, hipY + pz['b']); S_ = (pz['l'] + 1 + sp.get('lean0', 0), hipY - torL + pz['b'] + (1 if sp.get('hunch') else 0) * 0)
    skin, cloth, pants = sp['skin'], sp['cloth'], sp['pants']
    lw, aw, ul, fl_ = sp['lw'], sp['aw'], sp['ul'], sp['fal']
    shoulder_b, shoulder_f = (S_[0] - 1, S_[1] + 1), (S_[0] + 1, S_[1] + 1)
    def arm(a, root, col):
        e = (root[0] + vec(a[0], ul)[0], root[1] + vec(a[0], ul)[1]); h = (e[0] + vec(a[1], fl_)[0], e[1] + vec(a[1], fl_)[1])
        cv.part(lambda d: (line(d, P(*root), P(*e), aw), line(d, P(*e), P(*h), aw)), col)
        cv.part(lambda d: ell(d, h[0], h[1], 1.2 if aw < 3 else 1.6, 1.2 if aw < 3 else 1.6), sp.get('hand', skin), outline=False, shade=False)
        return h
    def leg(f, behind):
        fx, lift = f; hp = (hip[0] + (-1 if behind else 1), hip[1]); ft = (fx, -lift)
        kn = ((hp[0] + ft[0]) / 2 + 2 + sq * .6, (hp[1] + ft[1]) / 2 - sq * .3)
        cv.part(lambda d: (line(d, P(*hp), P(*kn), lw), line(d, P(*kn), P(*ft), lw)), pants)
        bt = sp['boot']
        cv.part(lambda d: d.rectangle([P(ft[0] - 1, ft[1] - 1), P(ft[0] + 3, ft[1] + (0 if lift else 0))], fill=255), bt)
    robe = sp.get('robe')
    # urutan: lengan belakang, kaki belakang, torso/jubah, kaki depan, kepala, lengan depan + senjata
    arm(pz['ba'], shoulder_b, tone_lo(skin) if sp.get('tintback', 1) else skin)
    if not robe: leg(pz['bl'], True)
    if sp.get('tail'): sp['tail'](cv, pz, hip)
    # torso
    cv.part(lambda d: line(d, P(*hip), P(*S_), tw), cloth)
    if sp.get('ribs'): sp['ribs'](cv, hip, S_, tw)
    if robe:
        hem = -1 - max(0, pz['fl'][1] * .4); sw = pz['fl'][0] * .5 - pz['bl'][0] * .2
        top = (S_[0] - tw / 2, S_[1]); topr = (S_[0] + tw / 2, S_[1])
        wb = robe
        cv.part(lambda d: poly(d, [(top[0], top[1]), (topr[0], topr[1]), (hip[0] + wb + sw + 1, hem), (hip[0] - wb + sw * .4 - 1, hem + 1)]), cloth)
        cv.part(lambda d: line(d, P(*hip), P(*S_), tw), cloth, outline=False)
        # kaki kecil mengintip
        for f in (pz['bl'], pz['fl']):
            ft = (f[0] * .6, -f[1]); cv.part(lambda d: d.rectangle([P(ft[0] - 1, ft[1] - 1), P(ft[0] + 2, ft[1])], fill=255), sp['boot'])
        if sp.get('belt'): cv.rect(hip[0] - tw / 2 + 1, hip[1] - 1, hip[0] + tw / 2 - 1, hip[1] - 1, sp['belt'])
        if sp.get('trim'): cv.rect(top[0] + 1, hem - 1, hip[0] + wb + sw - 1, hem - 1, sp['trim'])
    else:
        leg(pz['fl'], False)
        if sp.get('belt'): cv.rect(hip[0] - tw / 2 + 1, hip[1] - 2, hip[0] + tw / 2 - 1, hip[1] - 2, sp['belt'])
    if sp.get('shoulder'): sp['shoulder'](cv, shoulder_f)
    # kepala
    hc = (S_[0] + pz['hd'][0] + sp.get('hdx', 1), S_[1] - hr + 1 + pz['hd'][1] + sp.get('neck', 0))
    sp['head'](cv, hc, pz)
    # lengan depan + senjata
    h = arm(pz['fa'], shoulder_f, skin if not sp.get('sleeve') else sp['sleeve'])
    if sp.get('weapon'): weapon(cv, sp['weapon'], h, pz['w'], pz)
    if sp.get('after'): sp['after'](cv, hc, pz, h)
    return hc

# ---- kepala
def head_goblin(big=1.0, hood=True, tusk=False, crown=False, scar=False, skin='#7ac84a', hoodc='#6a4a2a', eye='#ff3a2a'):
    def f(cv, c, pz):
        x, y = c; rx, ry = 5.5 * big, 4.5 * big; o = pz['open']
        cv.part(lambda d: poly(d, [(x - 3, y - 1), (x - 11 * big, y - 5 * big), (x - 4, y + 2)]), skin)   # telinga
        cv.part(lambda d: ell(d, x, y, rx, ry), skin)
        cv.part(lambda d: poly(d, [(x + rx - 1, y - 1), (x + rx + 3, y + 1), (x + rx - 1, y + 2)]), skin)   # hidung
        if o:
            cv.part(lambda d: poly(d, [(x - 1, y + 2), (x + rx + 1, y + 2), (x + rx, y + 3 + o * 1.5), (x, y + 3 + o * 1.5)]), '#3a0f1a', shade=False)
            cv.px(x + 3, y + 3, '#f0ead0'); cv.px(x + 1, y + 3, '#f0ead0')
        else:
            cv.rect(x, y + 2, x + 4, y + 2, '#3a0f1a'); cv.px(x + 3, y + 1, '#f0ead0')
        if hood:
            cv.part(lambda d: poly(d, [(x - rx - 1, y + 1), (x - rx, y - ry - 1), (x + 1, y - ry - 2), (x + rx - 1, y - ry), (x + 1, y - 2), (x - 3, y)]), hoodc)
        cv.rect(x + 1, y - 2, x + 3, y - 2, '#241818'); cv.px(x + 2, y - 1, eye); cv.px(x + 3, y - 1, eye)
        if tusk: cv.px(x + 3, y + 1, '#f4efd8'); cv.px(x + 3, y, '#f4efd8'); cv.px(x + 4, y - 1, '#f4efd8')
        if scar: cv.px(x - 1, y - 1, '#5a1a1a'); cv.px(x, y, '#5a1a1a'); cv.px(x + 1, y + 1, '#5a1a1a')
        if crown:
            cv.part(lambda d: poly(d, [(x - 4, y - ry - 1), (x - 4, y - ry - 6), (x - 2, y - ry - 3), (x, y - ry - 7), (x + 2, y - ry - 3), (x + 4, y - ry - 6), (x + 4, y - ry - 1)]), '#ffd23a')
            cv.px(x, y - ry - 3, '#ff3a5a')
    return f

def head_skull(cv, c, pz):
    x, y = c; o = pz['open']
    cv.part(lambda d: ell(d, x, y - 2, 5.5, 4.5), '#e8e2d0')
    cv.part(lambda d: d.rectangle([P(x + 1, y), P(x + 5, y + 1)], fill=255), '#d8d0bc', outline=False)   # tulang pipi
    cv.part(lambda d: d.rectangle([P(x - 1, y + 2 + o), P(x + 4, y + 4 + o)], fill=255), '#c8bea8')   # rahang bawah
    if o: cv.rect(x - 1, y + 2, x + 3, y + 1 + o, '#2e2638')
    for i in range(0, 5, 2): cv.px(x - 1 + i, y + 2 + o, '#f8f2e0')
    cv.part(lambda d: d.rectangle([P(x, y - 4), P(x + 3, y - 1)], fill=255), '#1a0a1a', outline=False, shade=False)   # rongga mata
    cv.px(x + 2, y - 3, '#ff6a3a'); cv.px(x + 2, y - 2, '#ff3a2a')
    cv.px(x + 5, y - 1, '#3a3040')
    cv.px(x - 3, y - 5, '#f8f2e0'); cv.px(x - 4, y - 4, '#f8f2e0')

def head_witch(cv, c, pz):
    x, y = c; o = pz['open']
    cv.part(lambda d: poly(d, [(x - 5, y - 2), (x - 8, y + 9), (x - 3, y + 9), (x - 1, y + 2)]), '#5a4a8a')     # rambut panjang belakang
    cv.part(lambda d: ell(d, x, y, 4.5, 4.5), '#dccce8')
    cv.part(lambda d: poly(d, [(x + 3, y), (x + 6, y + 1), (x + 3, y + 2)]), '#dccce8')
    cv.part(lambda d: poly(d, [(x - 5, y - 2), (x - 2, y - 5), (x + 4, y - 4), (x + 3, y - 2), (x - 2, y - 1)]), '#6a5aa0')  # poni
    cv.px(x + 2, y, '#e83ae0'); cv.px(x + 3, y, '#e83ae0'); cv.rect(x + 1, y - 1, x + 3, y - 1, '#2a1a3a')
    cv.rect(x + 1, y + 2, x + 3, y + 2 + (1 if o else 0), '#8a1a5a')
    # topi runcing miring
    cv.part(lambda d: ell(d, x, y - 5, 8, 2), '#3a2a64')
    cv.part(lambda d: poly(d, [(x - 4, y - 5), (x + 4, y - 5), (x + 3, y - 10), (x + 1, y - 13), (x - 2 - o, y - 16)]), '#5a48a0')
    cv.rect(x - 4, y - 6, x + 4, y - 6, '#c84ae0')

# ---- ornamen khusus
def ribs(cv, hip, S_, tw):
    cx, cy = (hip[0] + S_[0]) / 2, (hip[1] + S_[1]) / 2
    cv.part(lambda d: d.rectangle([P(cx - 2, cy - 4), P(cx + 2, cy + 3)], fill=255), '#2e2638', outline=False, shade=False)
    for i in range(-3, 3, 2): cv.rect(cx - 2, cy + i, cx + 2, cy + i, '#e8e2d0')
    cv.rect(cx - 3, cy - 5, cx + 3, cy - 5, '#d8d0bc')
def pad_chief(cv, s):
    cv.part(lambda d: ell(d, s[0] + 1, s[1] - 1, 4, 3), '#6a6a78')
    for dx in (-2, 1): cv.px(s[0] + dx, s[1] - 5, '#d8d0b8'); cv.px(s[0] + dx, s[1] - 4, '#b0a890')
def pad_king(cv, s):
    cv.part(lambda d: ell(d, s[0] + 1, s[1] - 1, 5, 3), '#4a3a2a')
    cv.part(lambda d: ell(d, s[0] + 1, s[1] - 2, 3, 1.5), '#8a7a5a', outline=False, shade=False)
def gem_king(cv, hc, pz, h): pass

SPEC['skel'] = S(legL=12, torL=10, tw=6, hr=5, skin='#e8e2d0', cloth='#5a5068', pants='#d8d0bc', boot='#c8bea8', lw=2, aw=2, ul=7, fal=7,
                 head=head_skull, ribs=ribs, weapon='sword', hand='#e8e2d0', sleeve=None, hdx=1)
SPEC['goblin'] = S(lean0=2, legL=7, torL=6, tw=8, hr=5, skin='#7ac84a', cloth='#8a6a3a', pants='#5a4a2a', boot='#4a3420', lw=3, aw=2, ul=5, fal=5,
                   head=head_goblin(), weapon='dagger', belt='#4a3420', hdx=2)
SPEC['goblin_shaman'] = S(lean0=2, legL=6, torL=8, tw=7, hr=5, skin='#7ac84a', cloth='#4a6a5a', pants='#3a4a3a', boot='#3a2a1a', lw=2, aw=2, ul=5, fal=5,
                          head=head_goblin(hoodc='#3a5a4a', eye='#ffe03a'), weapon='staff', robe=6, trim='#d8c070', hdx=2, hunch=1)
SPEC['gchief'] = S(lean0=1, legL=11, torL=11, tw=11, hr=6, skin='#5f9a3a', cloth='#6a4a2a', pants='#4a3a24', boot='#3a2a1a', lw=4, aw=4, ul=7, fal=7,
                   head=head_goblin(big=1.15, hood=False, tusk=True, scar=True, skin='#5f9a3a'), weapon='club', belt='#c8a040', shoulder=pad_chief, hdx=2)
SPEC['gking'] = S(legL=11, torL=12, tw=12, hr=6, skin='#6ab83a', cloth='#7a3aa8', pants='#3a2a4a', boot='#2a1a3a', lw=3, aw=4, ul=8, fal=8,
                  head=head_goblin(big=1.15, hood=False, crown=True, tusk=True, skin='#6ab83a', eye='#ffea3a'), weapon='great', robe=9, trim='#ffd23a', belt='#ffd23a',
                  shoulder=pad_king, hdx=2, sleeve='#6a2a98')
SPEC['witch'] = S(legL=7, torL=10, tw=7, hr=5, skin='#dccce8', cloth='#4c3a82', pants='#2a1a3a', boot='#2a1a3a', lw=2, aw=2, ul=7, fal=6,
                  head=head_witch, weapon='wstaff', robe=7, trim='#c84ae0', hdx=1, sleeve='#4c3a82', hand='#dccce8')

# ---- set pose standar (disesuaikan per musuh lewat parameter)
def poses(k):
    R = {}
    ws = k.get('rest_w', 140)
    R['idle'] = [pose(b=b, fa=(25, 45 + b * 6), ba=(-12, -5 + b * 4), w=ws + b * 4, hd=(0, b), glow=.25 + .12 * i) for i, b in enumerate((0, -1, -1, 0))]
    mv = [((5, 0), (-5, 0), k.get('mb', 1)), ((0, 0), (-1, 3), 0), ((-5, 0), (5, 0), k.get('mb', 1)), ((0, 3), (0, 0), 0)]
    R['move'] = [pose(b=b, fl=f, bl=g, l=1, fa=(10 + (i % 2) * 15, 40 + 10 * (i % 2)), ba=(-25 + (i % 2) * 25, 0), w=ws, hd=(1, 0)) for i, (f, g, b) in enumerate(mv)]
    wa = k['wind']
    R['wind'] = [pose(l=-1 - i, sq=i * .8, fa=wa[i][0], ba=wa[i][1], w=wa[i][2], hd=(-i * .7, i * .2), glow=.45 + .15 * i, open=1 if i > 1 else 0,
                      fl=(1 + i, 0), bl=(-2 - i, 0)) for i in range(4)]
    aa = k['atk']
    R['atk'] = [pose(l=2 + i * 1.3, sq=1, fa=aa[i][0], ba=aa[i][1], w=aa[i][2], hd=(1 + i * .5, 1), glow=1.0 if i < 3 else .5, open=1 if i == 1 else 0,
                     fl=(3 + i, 0), bl=(-4, 0)) for i in range(4)]
    R['hurt'] = [pose(l=-3, b=0, hd=(-3, -1), fa=(-30, -20), ba=(-50, -40), w=190, open=2, fl=(2, 0), bl=(-3, 1)),
                 pose(l=-4, b=1, hd=(-4, -1), fa=(-45, -30), ba=(-60, -50), w=200, open=2, fl=(2, 0), bl=(-4, 1)),
                 pose(l=3, b=1, sq=1, hd=(2, 3), fa=(40, 100), ba=(10, 60), w=130, open=1, fl=(3, 0), bl=(-3, 0)),
                 pose(l=4, b=2, sq=2, hd=(3, 4), fa=(50, 110), ba=(20, 70), w=120, open=1, fl=(2, 0), bl=(-3, 0))]
    al = k['alert']
    R['alert'] = [pose(l=-2 - (i % 2), b=-(i % 2), hd=(-2, -2 - (i % 2)), fa=al[i % 2][0], ba=al[i % 2][1], w=al[i % 2][2], open=2, glow=.8, sq=1, fl=(2, 0), bl=(-3, 0)) for i in range(4)]
    return R

KEYS = {
    'skel': dict(rest_w=165, wind=[((60, 100), (-20, 0), 165), ((100, 140), (-20, 0), 190), ((140, 170), (-20, 0), 215), ((150, 180), (-20, 0), 235)],
                 atk=[((120, 150), (-10, 0), 230), ((90, 110), (-10, 0), 130), ((60, 85), (-10, 0), 70), ((50, 80), (-10, 0), 60)],
                 alert=[((120, 170), (100, 150), 200), ((140, 175), (120, 165), 185)]),
    'goblin': dict(rest_w=100, wind=[((40, 70), (-10, 0), 90), ((20, 50), (-10, 0), 120), ((-10, 20), (-10, 0), 160), ((-40, 0), (-10, 0), 195)],
                   atk=[((10, 50), (-10, 0), 200), ((70, 90), (-10, 0), 120), ((95, 100), (-10, 0), 90), ((80, 90), (-10, 0), 80)],
                   alert=[((100, 150), (110, 150), 170), ((120, 170), (120, 170), 150)]),
    'goblin_shaman': dict(mb=2, rest_w=125, wind=[((60, 120), (60, 110), 170), ((100, 150), (90, 140), 175), ((130, 170), (110, 160), 180), ((140, 175), (130, 170), 185)],
                          atk=[((120, 170), (100, 150), 185), ((100, 120), (100, 130), 140), ((95, 100), (90, 110), 100), ((80, 90), (80, 100), 95)],
                          alert=[((110, 150), (120, 160), 180), ((130, 165), (130, 170), 175)]),
    'gchief': dict(rest_w=135, wind=[((60, 100), (-10, 20), 160), ((120, 150), (-10, 20), 190), ((150, 175), (0, 20), 215), ((165, 180), (0, 20), 235)],
                   atk=[((140, 170), (-10, 20), 225), ((100, 130), (-10, 20), 160), ((60, 90), (-10, 20), 70), ((40, 70), (-10, 20), 40)],
                   alert=[((150, 170), (140, 170), 200), ((160, 175), (160, 175), 190)]),
    'gking': dict(mb=2, rest_w=150, wind=[((60, 100), (-10, 20), 170), ((120, 150), (-10, 20), 200), ((150, 175), (0, 20), 225), ((165, 180), (0, 20), 240)],
                  atk=[((150, 175), (-10, 20), 235), ((100, 130), (-10, 20), 160), ((60, 90), (-10, 20), 75), ((45, 70), (-10, 20), 50)],
                  alert=[((150, 170), (150, 170), 205), ((160, 175), (160, 175), 195)]),
    'witch': dict(mb=2, rest_w=172, wind=[((60, 120), (60, 110), 175), ((100, 150), (90, 140), 180), ((130, 170), (110, 160), 185), ((150, 178), (140, 175), 190)],
                  atk=[((120, 170), (110, 160), 185), ((100, 120), (100, 130), 140), ((95, 100), (90, 110), 100), ((80, 90), (80, 100), 95)],
                  alert=[((130, 170), (140, 175), 190), ((140, 178), (150, 178), 185)]),
}

# ---- Peti Mimic (bukan humanoid): peti kayu berpita logam, tutup membuka jadi mulut bergigi + lidah
def mimic_frame(lid=0, hop=0, dx=0, tongue=0, tilt=0, eyes=1, feet=(0, 0), squash=0):
    cv = Cv(); W, Hb = 11, 13 - squash; by = -3 - hop; ox = dx
    for f, fx in zip(feet, (-6, 4)):   # kaki cakar kecil
        cv.part(lambda d: d.rectangle([P(ox + fx, -3 - hop + 1), P(ox + fx + 3, -max(0, f))], fill=255), '#4a3a2a')
    hy = by - Hb                        # sisi atas badan peti
    hinge = (ox - W + 1, hy)
    # bagian dalam mulut (terlihat saat tutup terbuka)
    ang = math.radians(lid); L = 2 * W - 1
    tip = (hinge[0] + math.cos(ang) * L, hinge[1] - math.sin(ang) * L)
    front = (ox + W - 1, hy)
    if lid > 4:
        cv.part(lambda d: poly(d, [hinge, front, tip]), '#5a0f1a', outline=False, shade=False)
    # badan peti
    cv.part(lambda d: d.rectangle([P(ox - W, hy), P(ox + W - 1, by)], fill=255), '#7a4e2a')
    for x in (ox - W + 4, ox + W - 5): cv.part(lambda d: d.rectangle([P(x, hy), P(x + 1, by)], fill=255), '#8a8c96', outline=False)
    cv.rect(ox - W + 1, hy + 3, ox + W - 2, hy + 3, '#5a3a20')
    cv.part(lambda d: d.rectangle([P(ox + 2, hy + 1), P(ox + 5, hy + 5)], fill=255), '#d8b040', outline=False)   # gembok
    cv.px(ox + 3, hy + 3, '#3a2a14')
    if lid > 4:
        cv.part(lambda d: poly(d, [(ox - W + 1, hy + 1), (front[0], hy + 1), (front[0], hy + 1)]), '#5a0f1a', outline=False, shade=False)
        # gigi bawah
        for i in range(0, 2 * W - 3, 4): cv.px(ox - W + 2 + i, hy - 1, '#f4efd8'); cv.px(ox - W + 2 + i, hy - 2 if lid > 15 else hy - 1, '#f4efd8')
        if tongue:
            tx = front[0] + tongue
            cv.part(lambda d: poly(d, [(ox - 2, hy - 1), (tx - 2, hy - 2 - tongue * .12), (tx + 1, hy - 1 - tongue * .1), (tx - 1, hy + 1), (ox + 1, hy + 3)]), '#e0507a')
            cv.px(tx - 1, hy, '#f0a0b0')
    # tutup: dua titik sudut tebal menurut sudut
    th = 5
    def lidpoly(d):
        a = [hinge, tip]
        n = (math.sin(ang) * th, math.cos(ang) * th)     # tebal tutup ke atas-normal
        poly(d, [(a[0][0], a[0][1]), (a[1][0], a[1][1]), (a[1][0] - n[0], a[1][1] - n[1] if False else a[1][1] - n[1]), (a[0][0] - n[0], a[0][1] - n[1])])
    cv.part(lidpoly, '#8a5a30')
    mid = ((hinge[0] + tip[0]) / 2, (hinge[1] + tip[1]) / 2)
    ang_n = (math.sin(ang), math.cos(ang))
    cv.part(lambda d: line(d, P(hinge[0] + 5 * math.cos(ang), hinge[1] - 5 * math.sin(ang) - 1),
                          P(hinge[0] + 5 * math.cos(ang) - ang_n[0] * 4, hinge[1] - 5 * math.sin(ang) - 1 - ang_n[1] * 4 + 4), 2), '#8a8c96', outline=False, shade=False) if False else None
    if lid > 4:   # gigi atas menggantung dari tutup & mata kuning
        for i in range(3, 2 * W - 2, 4):
            x = hinge[0] + math.cos(ang) * i; y = hinge[1] - math.sin(ang) * i
            cv.px(x, y + 1, '#f4efd8'); cv.px(x, y + 2, '#f4efd8')
        if eyes:
            ex = hinge[0] + math.cos(ang) * 14; ey = hinge[1] - math.sin(ang) * 14
            cv.px(ex, ey - 2, '#ffe03a'); cv.px(ex + 1, ey - 2, '#ffe03a')
    else:
        cv.rect(ox - W + 4, hy - 4, ox - W + 5, hy - 4, '#8a8c96'); cv.rect(ox + W - 5, hy - 4, ox + W - 4, hy - 4, '#8a8c96')
        if eyes and lid > 0: cv.px(ox + 3, hy - 1, '#ffe03a')
    return cv

def mimic_frames():
    I = [mimic_frame(lid=l, hop=0, eyes=1) for l in (0, 0, 3, 0)]
    M = [mimic_frame(lid=18 + 8 * (i % 2), hop=h, feet=ft) for i, (h, ft) in enumerate(((0, (0, 0)), (4, (3, 0)), (0, (0, 0)), (4, (0, 3))))]
    Wd = [mimic_frame(lid=l, hop=h, dx=-d, squash=sq) for (l, h, d, sq) in ((10, 0, 1, 1), (25, 0, 2, 2), (42, 1, 3, 2), (58, 3, 4, 0))]
    A = [mimic_frame(lid=l, hop=0, dx=d, tongue=t) for (l, d, t) in ((58, 3, 3), (30, 6, 12), (4, 7, 8), (20, 3, 0))]
    H = [mimic_frame(lid=30, dx=-3, hop=1, tongue=0), mimic_frame(lid=45, dx=-4, hop=2, tongue=0),
         mimic_frame(lid=12, dx=1, hop=0, squash=1), mimic_frame(lid=22, dx=0, hop=0, squash=1)]
    Al = [mimic_frame(lid=l, hop=h, tongue=t, feet=(0, 0)) for (l, h, t) in ((62, 0, 6), (66, 3, 9), (62, 0, 6), (66, 3, 9))]
    return [I, M, Wd, A, H, Al]

def build(eid):
    if eid == 'mimic': grid = mimic_frames()
    else:
        sp = SPEC[eid]; R = poses(KEYS[eid]); grid = []
        for r in ROWS:
            row = []
            for pz in R[r]:
                cv = Cv(); draw_char(cv, sp, pz)
                low = np.argwhere(cv.a[..., 3] > 0)[:, 0].max()   # kaki selalu menapak: samakan garis kaki di AY+1
                cv.a = np.roll(cv.a, AY + 1 - low, axis=0); row.append(cv)
            grid.append(row)
    L = Rr = U = 0
    for row in grid:
        for cv in row:
            a = np.argwhere(cv.a[..., 3] > 0)
            L = max(L, AX - a[:, 1].min()); Rr = max(Rr, a[:, 1].max() + 1 - AX); U = max(U, AY + 1 - a[:, 0].min())
    for r, row in enumerate(grid):
        for c, cv in enumerate(row):
            if cv.a[AY + 2:, :, 3].any(): print(f'PERINGATAN {eid} r{r} f{c}: piksel di bawah garis kaki', file=sys.stderr)
    half = int(max(L, Rr)) + 1; FW, FH = half * 2, int(U) + 2
    at = np.zeros((FH * 6, FW * 4, 4), np.uint8)
    for r, row in enumerate(grid):
        for c, cv in enumerate(row):
            f = cv.a[AY + 1 - (FH - 1):AY + 2, AX - half:AX + half]
            at[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = f[-FH:]
    os.makedirs('assets/img/monsters', exist_ok=True)
    Image.fromarray(at).save(f'assets/img/monsters/esh_{eid}.png', optimize=True)
    h0 = max(AY + 1 - np.argwhere(cv.a[..., 3] > 0)[:, 0].min() for cv in grid[0])
    return {'fw': FW, 'fh': FH, 'h': int(h0)}, at

import gen_slaver_sheets
gen_slaver_sheets.register(sys.modules[__name__])   # slaver & slaver_captain

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--') and not os.path.isdir(a)]
    prev = sys.argv[sys.argv.index('--preview') + 1] if '--preview' in sys.argv else None
    out = {}
    for e in args or list(SPEC) + ['mimic']:
        out[e], at = build(e)
        if prev:
            im = Image.fromarray(at); bg = Image.new('RGBA', im.size, (70, 110, 70, 255)); bg.alpha_composite(im)
            bg.resize((im.width * 4, im.height * 4), Image.NEAREST).save(os.path.join(prev, f'{e}_x4.png'))
    print(json.dumps(out))
