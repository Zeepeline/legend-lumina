"""Penggambar tokoh NPC 48x48 (turunan templat tools/gen_char_template.py): badan chibi + pendandanan per NPC.
draw(d, P, st) -> (Image RGBA 48x48, {'a1':(x,y),'a2':(x,y)}). d = Down|Up|Side (Side menghadap KANAN).
P = pose (lihat poses.py); st = gaya NPC (lihat roster.py). Cahaya kiri-atas, garis tepi berwarna (docs/ART_BIBLE.md)."""
import os, sys
sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')))
from gen_char_template import Sprite, rows, rect, line2, mix, S, GROUND, CX
from . import props

SKINS = {'light': (240, 200, 168), 'pale': (248, 224, 200), 'tan': (214, 160, 118), 'dark': (160, 108, 76), 'ruddy': (238, 176, 152)}
EYE = (58, 38, 44); BLUSH = (238, 150, 140); WHITE = (255, 255, 255)
SPANS = [6, 10, 12, 14, 16, 16, 16, 16, 16, 16, 14, 12, 10, 6]  # kepala membulat: pipi & dagu menyempit
GOLD = (236, 190, 70)


def in_hair(kind, d, r, c):  # r = baris kepala 0..13, c = kolom 0..15 (dari tepi kiri baris terlebar)
    if kind == 'bald': return False
    if d == 'Down':
        if r <= (3 if kind == 'cepak' else 4): return True
        if kind == 'cepak': return r <= 5 and (c <= 2 or c >= 13)
        if r == 5: return c <= 3 or c >= 12 or c in (6, 9)  # poni bergerigi, dahi terlihat
        if kind in ('long', 'braid2'): return r <= 13 and (c <= 2 or c >= 13)
        return r <= (9 if kind == 'curly' else 8) and (c <= 1 or c >= 14)
    if d == 'Up':
        if r <= 9: return True
        return r <= (13 if kind in ('long', 'braid2') else 10) and 2 <= c <= 13
    if r <= 4: return True
    if r == 5: return c <= 11 or kind == 'bangs'
    lim = 13 if kind == 'long' else 10
    return r <= lim and c <= (8 if r <= 9 else 6)


def hair_mask(kind, d, cx, hy, ty):
    M = set(); L0 = cx - 8
    for r, w in enumerate(SPANS):
        l = cx - w // 2
        for x in range(l, l + w):
            if in_hair(kind, d, r, x - L0): M.add((x, hy + r))
    sd = d == 'Side'
    if kind == 'bun': M |= rows(hy - 3, [4, 6, 6], cx - (2 if sd else 0))
    if kind in ('spiky', 'messy'):
        for k in (3, 7, 11): M |= rect(L0 + k, hy - 1, L0 + k + 1, hy - 1) | ({(L0 + k, hy - 2)} if k == 7 else set())
    if kind == 'curly':
        M |= rect(L0 - 1, hy + 4, L0 - 1, hy + 9) | rect(L0 + 16, hy + 4, L0 + 16, hy + 9) | rect(L0 + 3, hy - 1, L0 + 12, hy - 1)
    if kind == 'long':
        if d == 'Down': M |= rect(L0 + 1, hy + 14, L0 + 3, ty + 4) | rect(L0 + 12, hy + 14, L0 + 14, ty + 4)
        elif d == 'Up': M |= rect(L0 + 2, hy + 14, L0 + 13, ty + 4)
        else: M |= rect(L0 - 1, hy + 8, L0 + 4, ty + 4)
    if kind == 'pony':
        if d == 'Side': M |= rect(cx - 11, hy + 3, cx - 9, hy + 12)
        elif d == 'Up': M |= rect(cx - 1, hy + 10, cx + 1, ty + 4)
        else: M |= rect(cx - 1, hy - 2, cx + 1, hy - 1)
    if kind == 'braid1':
        if d == 'Side': M |= rect(cx - 11, hy + 6, cx - 9, ty + 6)
        elif d == 'Up': M |= rect(cx - 1, hy + 10, cx + 1, ty + 7)
    if kind == 'braid2':
        if d == 'Side': M |= rect(cx - 11, hy + 6, cx - 9, ty + 6)
        else: M |= rect(L0 - 2, hy + 8, L0 - 1, ty + 5) | rect(L0 + 16, hy + 8, L0 + 17, ty + 5)
    return M


def hat_parts(kind, d, cx, hy, hc):
    sd = d == 'Side'; P = []
    if kind == 'caping': P.append((rows(hy - 4, [4, 8, 12, 16, 20, 24, 24], cx), hc))
    elif kind == 'jerami': P += [(rows(hy - 3, [8, 12, 12], cx), hc), (rows(hy, [22, 24], cx), mix(hc, (255, 230, 160), .25))]
    elif kind == 'peci': P.append((rows(hy - 1, [10, 14, 16, 16], cx), hc))
    elif kind == 'pet':
        P.append((rows(hy - 1, [12, 16, 16, 16], cx), hc))
        P.append((rect(cx + 4, hy + 2, cx + 10, hy + 3) if sd else rect(cx - 7, hy + 4, cx + 6, hy + 4), mix(hc, (20, 20, 40), .35)))
    elif kind == 'kerucut': P.append((rows(hy - 7, [2, 4, 6, 8, 10, 12, 14, 18, 20], cx), hc))
    elif kind == 'bulat': P += [(rows(hy - 3, [10, 12, 12, 12], cx), hc), (rows(hy + 1, [18, 18], cx), mix(hc, (30, 30, 50), .25))]
    elif kind == 'bersayap':
        P += [(rows(hy - 3, [10, 12, 12, 12], cx), hc), (rows(hy + 1, [20, 20], cx), mix(hc, (30, 30, 50), .25)), (rect(cx + 2, hy - 9, cx + 4, hy - 4), (206, 52, 52))]
    elif kind == 'rajut': P += [(rows(hy - 1, [12, 14, 16, 16, 16], cx), hc), (rect(cx - 1, hy - 3, cx + 1, hy - 2), mix(hc, WHITE, .4))]
    elif kind == 'helm':
        P += [(rows(hy - 1, [10, 14, 16, 16, 16], cx), (176, 184, 198)), (rect(cx - 1, hy - 6, cx + 1, hy - 2), hc)]
    elif kind == 'sorban': P += [(rows(hy - 3, [10, 14, 16, 16, 16, 16], cx), hc), (rect(cx - 8, hy + 1, cx + 7, hy + 1), mix(hc, (30, 20, 20), .3))]
    elif kind in ('tudung', 'kerudung'):
        L0 = cx - 8; M = set()
        for r, w in enumerate(SPANS):
            l = cx - w // 2
            for x in range(l, l + w):
                c = x - L0
                if r <= 4 or (d == 'Up' and r <= 12) or (d == 'Side' and r <= 11 and c <= 8) or (d != 'Side' and r <= 12 and (c <= 2 or c >= 13)): M.add((x, hy + r))
        M |= rect(L0 - 1, hy + 3, L0 + 16, hy + 4) if kind == 'tudung' else set()
        if kind == 'kerudung': M |= rect(L0 + 2, hy + 12, L0 + 13, hy + 14) if d != 'Side' else rect(L0, hy + 11, L0 + 8, hy + 14)
        P.append((M, hc))
    elif kind == 'ikat': P.append((rect(cx - 8, hy + 4, cx + 7, hy + 4) if not sd else rect(cx - 8, hy + 4, cx + 7, hy + 4), hc))
    elif kind == 'pita': P.append((rect(cx - 8, hy + 1, cx - 4, hy + 3) | rect(cx - 3, hy + 2, cx - 2, hy + 2), hc))
    return P


def draw(d, P, st):
    sp = Sprite(); side = d == 'Side'
    kid, eld, fat = st.get('kid'), st.get('elder'), st.get('fat', 0)
    th, ll = (5, 5) if kid else (8, 6) if eld else (8, 9)
    H = 14 + th + ll; sc = .72 if kid else 1
    b = P.get('bob', 0) + P.get('crouch', 0) + P.get('drop', 0)
    base = GROUND - H + 1 + b
    hy = base + P.get('hy', 0) + (1 if eld else 0); ty = base + 14 + P.get('sq', 0)
    ux = P.get('dx', 0) + ((P.get('lean', 0) + (1 if eld else 0)) if side else 0); cx = CX + ux
    SK = SKINS[st.get('skin', 'light')]; TOP = st.get('top', (214, 208, 196)); PANT = st.get('pants', (150, 120, 90)); BOOT = st.get('boots', (110, 84, 62))
    robe = st.get('robe'); dress = st.get('dress'); gy = GROUND
    tl, tr = (cx - 5 - fat, cx + 4 + fat) if not side else (cx - 5, cx + 4 + fat * 2)
    g = dict(cx=cx, hy=hy, ty=ty, th=th, tl=tl, tr=tr, side=side)
    # ---- kaki ----
    def leg(z, hipx, dx, lift, dim=0, w=4):
        L = max(3, GROUND - (ty + th) + 1 - lift); top = ty + th; skin = []; pants = []; boot = []
        for r in range(L):
            x = hipx + round(dx * (r / max(1, L - 1))); y = top + r; row = [(x + i, y) for i in range(w)]
            (pants if r < 4 else boot if r >= L - 3 else skin).extend(row)
        sp.part(z, 'Body', skin + pants[-w:], SK, dim=dim)
        sp.part(z + .1, 'Clothes', pants, PANT, dim=dim)
        sp.part(z + .1, 'Clothes', boot + ([(hipx + dx + w, gy - lift)] if side else []), BOOT, dim=dim)
    sit = P.get('sit')
    if sit == 'chair':
        if side: sp.part(2, 'Clothes', rect(cx - 4, ty + th, cx + 7, ty + th + 2), PANT); sp.part(2.1, 'Clothes', rect(cx + 6, ty + th, cx + 9, ty + th + 4), BOOT)
        else:
            for x0 in (cx - 6, cx + 2): sp.part(2, 'Clothes', rect(x0, ty + th, x0 + 3, ty + th + 2), PANT); sp.part(2.1, 'Clothes', rect(x0, gy - 2, x0 + 3, gy), BOOT)
    elif sit == 'cross':
        sp.part(2, 'Clothes', rect(cx - 9, gy - 3, cx + 8, gy - 1), PANT); sp.part(2.1, 'Clothes', rect(cx - 10, gy - 2, cx - 7, gy), BOOT); sp.part(2.1, 'Clothes', rect(cx + 6, gy - 2, cx + 9, gy), BOOT)
    elif not side:
        sp_ = P.get('splay', 0); lL, lR = P.get('liftL', 0), P.get('liftR', 0)
        leg(2, CX - 5 - sp_, -sp_ // 2 if sp_ else 0, lL); leg(2, CX + 1 + sp_, sp_ // 2 if sp_ else 0, lR)
    else:
        sh = round(P.get('s', 0) * (P.get('amp', 3) + 1))
        leg(1.5, CX + P.get('lean', 0), -sh, P.get('liftF', 0), dim=.18); leg(2, CX - 4 + P.get('lean', 0), sh, P.get('liftN', 0))
    # ---- badan ----
    if robe or dress:
        hem = (gy - 3) if robe else ty + th + 3; tun = set()
        for y in range(ty, hem + 1):
            gr = min(3, (y - ty) * 3 // max(1, hem - ty)); tun |= rect(tl - gr, y, tr + gr, y)
    else: tun = rect(tl, ty, tr, ty + th - 1) | rect(tl - 1, ty + th - 2, tr + 1, ty + th - 1)
    sp.part(2.5, 'Body', rect(tl, ty, tr, ty + th - 1), SK)
    sp.part(3, 'Clothes', tun, robe or dress or TOP)
    dress_body(sp, d, st, g)
    # ---- lengan ----
    sx2, sx1 = (cx - 8 - fat, cx + 6 + fat) if not side else (cx - 2, cx - 2); sy = ty + 1
    hands = {}; k = {'short': 4, 'long': 99, 'none': 0}[st.get('sleeve', 'short')]
    def arm(z, sx, rel, dim, who, fist=False):
        ex, ey = sx + round(rel[0] * sc), sy + round(rel[1] * sc); pts = line2((sx, sy), (ex, ey)); kk = min(len(pts) - 2 if k > 50 else k, len(pts))
        sp.part(z, 'Body', pts, SK, dim=dim)
        if kk > 0: sp.part(z + .1, 'Clothes', pts[:kk], robe or TOP if st.get('sleeve_robe') else TOP, outline=False, dim=dim)
        if st.get('bracer') and len(pts) > 5: sp.part(z + .15, 'Clothes', pts[max(kk, len(pts) - 5):len(pts) - 2], st['bracer'], outline=False, dim=dim)
        if st.get('gloves') and len(pts) > 2: sp.part(z + .15, 'Clothes', pts[-2:], st['gloves'], outline=False, dim=dim)
        hands[who] = (ex + 1, ey + 1)
    rest = (0, th - 1)
    a1, a2 = P.get('a1', rest), P.get('a2', rest)
    if side: arm(1.2, sx2, a2, .18, 'a2'); arm(4, sx1, a1, 0, 'a1')
    else: arm(4, sx2, a2, 0, 'a2'); arm(4, sx1, a1, 0, 'a1')
    for pr in P.get('props', []): props.draw(sp, pr, hands, d, st, dict(cx=cx, ty=ty, th=th, hy=hy))
    # ---- kepala ----
    hx = cx; hc = st.get('hair', (80, 52, 40))
    sp.part(5, 'Body', rows(hy, SPANS, hx), SK)
    sp.part(5.05, 'Body', face_shadow(d, hx, hy), mix(SK, (150, 80, 80), .28), outline=False, shade=False)
    face(sp, d, st, hx, hy, P, SK)
    hk = st.get('hairstyle', 'short')
    if hk != 'bald' or st.get('hat'): pass
    sp.part(5.5, 'Hair', hair_mask(hk, d, hx, hy, ty), hc)
    if st.get('hat'): [sp.part(5.7, 'Hair', m, c) for m, c in hat_parts(st['hat'], d, hx, hy, st.get('hatc', (150, 110, 70)))]
    if st.get('headband'): sp.part(5.8, 'Hair', rect(hx - 8, hy + 3, hx + 7, hy + 4) if d != 'Side' else rect(hx - 8, hy + 3, hx + 7, hy + 4), st['headband'], outline=False)
    for x, y, c in P.get('fx', []): sp.dot(6, 'Gear', CX + x, GROUND + y, c)
    flat, _ = sp.render()
    return flat, hands


def face_shadow(d, cx, hy):
    """Bayangan lembut di wajah (cahaya dari kiri-atas): tepi kanan pipi & baris dagu."""
    M = set()
    for r in range(6, len(SPANS)):
        w = SPANS[r]; l = cx - w // 2; R = l + w - 1
        if d != 'Side': M.add((R, hy + r))
        if r >= len(SPANS) - 2: M |= {(x, hy + r) for x in range(l + 2, R + 1)} if d != 'Up' else set()
    return M


def face(sp, d, st, cx, hy, P, SK):
    mouth = mix(SK, (120, 50, 50), .55); eyes = P.get('eyes', 'open'); mo = P.get('mouth', 0); hair = st.get('hair', (80, 52, 40))
    bc = st.get('beardc', hair)
    def eye(ex):
        if eyes == 'closed': [sp.dot(5.1, 'Body', ex + i, hy + 9, EYE) for i in (0, 1)]; return
        h = 4 if eyes == 'wide' else 3
        for dx in (0, 1):
            for dy in range(h): sp.dot(5.1, 'Body', ex + dx, hy + 7 + dy - (1 if eyes == 'wide' else 0), EYE)
        sp.dot(5.2, 'Body', ex, hy + 7 - (1 if eyes == 'wide' else 0), WHITE)
    if d == 'Down':
        eye(cx - 4); eye(cx + 2)
        for x in (cx - 6, cx - 5, cx + 4, cx + 5): sp.dot(5.1, 'Body', x, hy + 10, BLUSH)
        for dx in (-1, 0):
            sp.dot(5.1, 'Body', cx + dx, hy + 11, mouth)
            if mo: sp.dot(5.1, 'Body', cx + dx, hy + 12, mix(mouth, (60, 20, 30), .5))
            if mo == 2: sp.dot(5.1, 'Body', cx + dx + (-1 if dx < 0 else 1), hy + 12, mix(mouth, (60, 20, 30), .5))
        if st.get('brow'): [sp.dot(5.2, 'Body', cx + o + i, hy + 6, hair) for o in (-4, 2) for i in (0, 1)]
        if st.get('stache'): sp.part(5.3, 'Hair', rect(cx - 4, hy + 10, cx + 3, hy + 10) if st['stache'] == 'thin' else rect(cx - 5, hy + 10, cx + 4, hy + 11) - {(cx - 1, hy + 11), (cx, hy + 11)}, bc, outline=False)
        if st.get('scar'): sp.dot(5.3, 'Body', cx - 6, hy + 9, (200, 90, 90)); sp.dot(5.3, 'Body', cx - 5, hy + 10, (200, 90, 90)); sp.dot(5.3, 'Body', cx - 6, hy + 8, (200, 90, 90))
        if st.get('glasses'):
            gc = st.get('glassc', (70, 60, 70))
            for ex in (cx - 5, cx + 1): sp.part(5.4, 'Gear', rect(ex, hy + 6, ex + 3, hy + 10) - rect(ex + 1, hy + 7, ex + 2, hy + 9), gc, outline=False, shade=False)
            sp.dot(5.4, 'Gear', cx - 1, hy + 7, gc); sp.dot(5.4, 'Gear', cx, hy + 7, gc)
    elif d == 'Side':
        ex = cx + 3; eye(ex)
        sp.dot(5.1, 'Body', ex - 3, hy + 10, BLUSH); sp.dot(5.1, 'Body', ex - 2, hy + 10, BLUSH)
        sp.dot(5.1, 'Body', cx + 8, hy + 9, SK)
        for dx in (0, 1): sp.dot(5.1, 'Body', cx + 5 + dx, hy + 11, mouth)
        if mo: sp.dot(5.1, 'Body', cx + 5, hy + 12, mix(mouth, (60, 20, 30), .5)); sp.dot(5.1, 'Body', cx + 6, hy + 12, mix(mouth, (60, 20, 30), .5))
        if st.get('stache'): sp.part(5.3, 'Hair', rect(cx + 5, hy + 10, cx + 8, hy + 10), bc, outline=False)
        if st.get('glasses'): gc = st.get('glassc', (70, 60, 70)); sp.part(5.4, 'Gear', rect(ex - 1, hy + 6, ex + 2, hy + 9) - rect(ex, hy + 7, ex + 1, hy + 8), gc, outline=False, shade=False); sp.part(5.4, 'Gear', rect(cx - 6, hy + 7, ex - 2, hy + 7), gc, outline=False, shade=False)
        if st.get('scar'): sp.dot(5.3, 'Body', cx + 3, hy + 9, (200, 90, 90)); sp.dot(5.3, 'Body', cx + 4, hy + 10, (200, 90, 90))
    bd = st.get('beard')
    if bd and d != 'Up':
        if d == 'Down': M = rows(hy + 10, [12, 10, 8, 6], cx) if bd == 'short' else rows(hy + 10, [12, 12, 10, 10, 8, 8, 8, 6, 6, 4, 4, 2], cx)
        else: M = rect(cx + 1, hy + 10, cx + 8, hy + 12) if bd == 'short' else rect(cx - 1, hy + 10, cx + 8, hy + 13) | rect(cx, hy + 14, cx + 6, hy + 18) | rect(cx + 1, hy + 19, cx + 4, hy + 21)
        M = {p for p in M if p not in {(cx - 1, hy + 11), (cx, hy + 11)} or d == 'Side'}
        sp.part(5.2, 'Hair', M, bc)
    elif bd and d == 'Up' and bd == 'long': pass


def dress_body(sp, d, st, g):
    """Pakaian tambahan di badan: zirah, sabuk, celemek, jubah, tas punggung, syal, dll."""
    cx, ty, th, tl, tr, side = g['cx'], g['ty'], g['th'], g['tl'], g['tr'], g['side']
    ar = st.get('armor')
    if ar:
        kind, col = ar; body = rect(tl, ty, tr, ty + th - 3)
        sp.part(3.2, 'Clothes', body, col)
        if kind == 'chain': [sp.dot(3.25, 'Clothes', x, y, mix(col, (30, 40, 70), .35)) for x, y in body if (x + y) % 2 == 0 and x > tl and y > ty and x < tr and y < ty + th - 3]
        if kind == 'scale': [sp.dot(3.25, 'Clothes', x, y, mix(col, WHITE, .25)) for x, y in body if (x + 2 * (y % 2)) % 4 == 0]
        if kind == 'plate' and d == 'Down': sp.part(3.3, 'Clothes', rect(cx - 1, ty + 1, cx, ty + 2), GOLD, outline=False)
        if kind == 'leather' or st.get('studs'): [sp.dot(3.3, 'Clothes', x, ty + 2 + 2 * j, (200, 200, 210)) for j, x in enumerate((tl + 2, tr - 2)) for _ in (0,)] if d != 'Up' else None
        if st.get('pauldron'):
            pc = st['pauldron']
            if side: sp.part(4.3, 'Clothes', rect(cx - 4, ty - 1, cx, ty + 2), pc)
            else: sp.part(4.3, 'Clothes', rect(tl - 3, ty - 1, tl, ty + 2), pc)
            if not side and st.get('pauldron2'): sp.part(4.3, 'Clothes', rect(tr, ty - 1, tr + 3, ty + 2), pc)
    ap = st.get('apron')
    if ap:
        if d == 'Down': sp.part(3.3, 'Clothes', rect(cx - 4, ty + 2, cx + 3, ty + th + 2), ap)
        elif d == 'Side': sp.part(3.3, 'Clothes', rect(tr - 1, ty + 2, tr + 1, ty + th + 2), ap)
        else: sp.part(3.3, 'Clothes', rect(cx - 5, ty + th - 3, cx + 4, ty + th - 3), ap, outline=False)
    if st.get('vest'):
        vc = st['vest']
        if d == 'Down': sp.part(3.15, 'Clothes', rect(tl, ty, tl + 2, ty + th - 2) | rect(tr - 2, ty, tr, ty + th - 2), vc)
        else: sp.part(3.15, 'Clothes', rect(tl, ty, tr, ty + th - 2), vc)
    if st.get('belt'):
        sp.part(3.35, 'Clothes', rect(tl - 1, ty + th - 2, tr + 1, ty + th - 2), st['belt'], outline=False, shade=False)
        if d == 'Down': sp.dot(3.4, 'Clothes', cx - 1, ty + th - 2, GOLD); sp.dot(3.4, 'Clothes', cx, ty + th - 2, GOLD)
    if st.get('hip'):
        for j, c in enumerate(st['hip']): sp.dot(3.4, 'Clothes', (tl - 2 + j * 2) if d != 'Side' else (cx - 4 + j * 2), ty + th - 1, c)
    if st.get('sash'):
        sc_ = st['sash']
        if d != 'Side': sp.part(3.45, 'Clothes', {(tl + i, ty + 1 + i * (th - 3) // 9) for i in range(10)} | {(tl + i, ty + 2 + i * (th - 3) // 9) for i in range(10)}, sc_, outline=False)
    if st.get('scarf'):
        sc_ = st['scarf']; sp.part(4.4, 'Clothes', rect(cx - 5 if not side else cx - 4, ty - 1, cx + 4, ty), sc_)
        if d == 'Down': sp.part(4.4, 'Clothes', rect(cx + 2, ty + 1, cx + 3, ty + 5), sc_)
    if st.get('towel'): sp.part(4.45, 'Clothes', rect(tr - 2, ty - 1, tr + 1, ty + 4) if d != 'Side' else rect(cx - 4, ty - 1, cx - 1, ty + 3), (240, 238, 230))
    cape = st.get('cape')
    if cape:
        if d == 'Up': sp.part(3.5, 'Clothes', rect(tl - 1, ty, tr + 1, ty + th + 2), cape)
        elif d == 'Down': sp.part(3.3, 'Clothes', rect(tl - 3, ty, tl + 2, ty + th + 1), cape)
        else: sp.part(2.4, 'Clothes', rect(tl - 4, ty + 1, tl + 1, ty + th + 3), cape)
    bk = st.get('back')
    if bk:
        kind, col = bk
        if kind == 'quiver':
            if d == 'Up': sp.part(3.5, 'Clothes', {(cx + 1 + i // 3, ty - 1 + i) for i in range(10)} | {(cx + 2 + i // 3, ty - 1 + i) for i in range(10)}, col); sp.part(3.55, 'Clothes', rect(cx, ty - 4, cx + 3, ty - 2), (206, 52, 52), outline=False)
            elif side: sp.part(2.4, 'Clothes', rect(tl - 4, ty - 1, tl - 1, ty + 8), col); sp.part(2.45, 'Clothes', rect(tl - 4, ty - 4, tl - 2, ty - 2), (206, 52, 52), outline=False)
            else: sp.part(2.4, 'Clothes', rect(tr, ty - 3, tr + 2, ty - 2), (206, 52, 52), outline=False)
        elif kind == 'pack':
            if d == 'Up': sp.part(3.5, 'Clothes', rect(tl - 1, ty - 1, tr + 1, ty + th), col); sp.part(3.55, 'Clothes', rect(tl, ty - 4, tr, ty - 2), mix(col, (200, 190, 170), .4))
            elif side: sp.part(2.4, 'Clothes', rect(tl - 5, ty - 2, tl, ty + th), col); sp.part(2.45, 'Clothes', rect(tl - 5, ty - 5, tl, ty - 3), mix(col, (200, 190, 170), .4))
            else: sp.part(3.45, 'Clothes', rect(tl + 1, ty, tl + 2, ty + th - 2) | rect(tr - 2, ty, tr - 1, ty + th - 2), mix(col, (30, 30, 30), .3), outline=False)
        elif kind == 'shield':
            if d == 'Up': sp.part(3.5, 'Clothes', rows(ty - 1, [6, 8, 10, 10, 10, 10, 8, 6], cx), col)
            elif side: sp.part(2.4, 'Clothes', rect(tl - 3, ty - 1, tl, ty + 7), col)
            else: sp.part(2.4, 'Clothes', rect(tr + 1, ty - 1, tr + 2, ty + 3), col)
        elif kind == 'satchel':
            if d != 'Side': sp.part(3.45, 'Clothes', {(tl + i, ty + i * (th - 2) // 9) for i in range(10)}, mix(col, (30, 20, 10), .3), outline=False)
            sp.part(3.5, 'Clothes', rect(tr - 3 if d != 'Side' else tl - 2, ty + th - 3, tr + 1 if d != 'Side' else tl + 3, ty + th + 1), col)
        elif kind == 'sack': sp.part(3.5, 'Clothes', rect(tl - 1, ty - 2, tr + 1, ty + 3), col) if d == 'Up' else None
        elif kind == 'sword':
            if d == 'Up': sp.part(3.5, 'Clothes', {(tl + 1 + i, ty + 8 - i) for i in range(9)} | {(tl + 2 + i, ty + 8 - i) for i in range(9)}, (190, 196, 208))
            elif d == 'Down': sp.part(4.4, 'Clothes', rect(tr - 2, ty - 5, tr - 1, ty - 1), mix(col, (200, 200, 220), .2))
            else: sp.part(2.4, 'Clothes', {(tl - 6 + i, ty + 9 - i) for i in range(8)} | {(tl - 5 + i, ty + 9 - i) for i in range(8)}, (190, 196, 208))
    if st.get('sheath') and d != 'Up':
        sx_ = tl - 3 if d == 'Down' else tl
        sp.part(3.4, 'Clothes', {(sx_ + i, ty + th - 1 + i // 2) for i in range(7)}, (110, 84, 62))
