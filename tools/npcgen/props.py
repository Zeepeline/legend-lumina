"""Properti yang dipegang NPC. draw(sp, (kind, who, ang, kw), hands, d, st, g): `who` = 'a1'|'a2'|'mid' (rata-rata dua tangan) | (x,y) absolut,
ang = derajat (0 = kanan, 90 = atas). Semua digambar di layer Gear."""
import math
from gen_char_template import rect, mix

WOOD = (156, 108, 66); STEEL = (196, 202, 214); CLOTH = (230, 222, 200); GOLD = (240, 196, 70); LEAF = (110, 160, 80)


def pt(p, ang, t):
    a = math.radians(ang); return (round(p[0] + math.cos(a) * t), round(p[1] - math.sin(a) * t))


def ray(p, ang, a, b):
    return [pt(p, ang, t) for t in range(a, b + 1)]


def thick(pts, w=2): return {(x + i, y + j) for x, y in pts for i in range(w) for j in range(w)}


def draw(sp, pr, hands, d, st, g):
    pr = list(pr); kind, who = pr[0], pr[1]; ang = pr[2] if len(pr) > 2 else 0; kw = pr[3] if len(pr) > 3 else {}
    if who == 'mid': h = ((hands['a1'][0] + hands['a2'][0]) // 2, (hands['a1'][1] + hands['a2'][1]) // 2)
    elif isinstance(who, tuple): h = who
    elif who == 'lap': h = (g['cx'], g['ty'] + g['th'])
    elif who == 'belly': h = (g['cx'], g['ty'] + g['th'] - 1)
    elif who == 'shoulder': h = (g['cx'] - 3, g['ty'] - 3)
    else: h = hands[who]
    z = kw.get('z', 4.6); G = lambda pts, c, o=True, sh=False: sp.part(z, 'Gear', pts, c, outline=o, shade=sh)
    col = kw.get('c')
    if kind in ('spear', 'wspear'):
        G(ray(h, ang, -10, 9), WOOD, False); tip = ray(h, ang, 10, 13)
        G(thick(tip, 1) | {(x, y + 1) for x, y in tip[:2]}, STEEL if kind == 'spear' else CLOTH, True)
    elif kind in ('sword', 'wsword'):
        G(ray(h, ang + 90, -2, 2), (170, 140, 70), False); G(thick(ray(h, ang, 2, 12), 2), STEEL if kind == 'sword' else (206, 170, 110))
    elif kind == 'dagger': G(thick(ray(h, ang, 1, 6), 1), STEEL)
    elif kind == 'axe':
        G(ray(h, ang, -2, 9), WOOD, False); e = pt(h, ang, 8); G(rect(e[0] - 2, e[1] - 3, e[0] + 1, e[1] + 1), STEEL)
    elif kind == 'bow':
        pull = kw.get('pull', 0); L = 8 if not kw.get('short') else 6
        arc = [pt(pt(h, ang + 90, t), ang, round(3 - 3 * (t / L) ** 2)) for t in range(-L, L + 1)]
        G(arc, WOOD, False); top, bot = pt(h, ang + 90, L), pt(h, ang + 90, -L)
        mid = pt(h, ang + 180, round(pull * 5))
        for x, y in _line(top, mid) + _line(mid, bot): sp.dot(z - .05, 'Gear', x, y, (236, 230, 214))
        if kw.get('arrow'): sp.part(z + .05, 'Gear', ray(mid, ang, 0, 12), (210, 190, 150), outline=False)
    elif kind == 'broom':
        G(ray(h, ang, -3, 16), WOOD, False); e = pt(h, ang, 16); perp = ang + 90
        G({pt(e, ang, t) for t in range(0, 5)} | {pt(pt(e, ang, t), perp, s) for t in range(2, 6) for s in (-2, -1, 1, 2)}, (196, 160, 80))
    elif kind == 'pole':
        L = kw.get('L', 30); G(ray(h, ang, -6, L), WOOD, False); e = pt(h, ang, L)
        if kw.get('lit', 1): G(rect(e[0] - 1, e[1] - 4, e[0] + 1, e[1]), (250, 150, 50)); sp.dot(z + .1, 'Gear', e[0], e[1] - 3, (255, 236, 130))
    elif kind == 'scroll':
        if kw.get('open'): G(rect(h[0] - 3, h[1], h[0] + 3, h[1] + 9), CLOTH)
        else: G(rect(h[0] - 1, h[1] - 3, h[0] + 1, h[1] + 3), CLOTH); sp.dot(z + .1, 'Gear', h[0], h[1] - 3, (200, 80, 80))
    elif kind == 'book':
        w = 5 if kw.get('open') else 3; G(rect(h[0] - w, h[1] - 3, h[0] + w, h[1] + 2), col or (150, 70, 60))
        if kw.get('open'): sp.part(z + .1, 'Gear', rect(h[0] - 4, h[1] - 2, h[0] + 4, h[1] + 1), CLOTH, outline=False)
    elif kind == 'cup':
        G(rect(h[0] - 1, h[1] - 2, h[0] + 1, h[1] + 1), col or WOOD)
        if kw.get('foam'): sp.dot(z + .1, 'Gear', h[0], h[1] - 3, WHITE_)
    elif kind == 'bowl': G(rect(h[0] - 2, h[1], h[0] + 2, h[1] + 2), (190, 140, 100)); sp.dot(z + .1, 'Gear', h[0], h[1], (150, 90, 50))
    elif kind == 'jug': G(rect(h[0] - 2, h[1] - 2, h[0] + 2, h[1] + 3), col or (186, 120, 84)); G(rect(h[0] - 1, h[1] - 4, h[0] + 1, h[1] - 3), col or (186, 120, 84))
    elif kind == 'bucket':
        G(rect(h[0] - 3, h[1], h[0] + 3, h[1] + 4), WOOD); sp.dot(z + .1, 'Gear', h[0] - 3, h[1] - 1, WOOD); sp.dot(z + .1, 'Gear', h[0] + 3, h[1] - 1, WOOD)
        if kw.get('water'): sp.part(z + .1, 'Gear', rect(h[0] - 2, h[1], h[0] + 2, h[1]), (110, 170, 230), outline=False)
    elif kind == 'basket': G(rect(h[0] - 4, h[1], h[0] + 4, h[1] + 3), (196, 160, 90)); G(rect(h[0] - 3, h[1] - 2, h[0] + 3, h[1] - 1), (196, 160, 90), False)
    elif kind == 'parcel': G(rect(h[0] - 4, h[1] - 3, h[0] + 3, h[1] + 3), (190, 150, 100)); sp.part(z + .1, 'Gear', rect(h[0] - 1, h[1] - 3, h[0], h[1] + 3), (210, 70, 70), outline=False)
    elif kind == 'flute': G(thick(ray(h, ang, -2, 10), 1), (226, 196, 110))
    elif kind == 'lute':
        G(rect(h[0] - 4, h[1] - 2, h[0] + 3, h[1] + 3) | rect(h[0] - 3, h[1] - 3, h[0] + 2, h[1] + 4), (176, 112, 66)); G(ray((h[0] + 2, h[1] - 2), 40, 0, 12), (130, 86, 50), False)
        sp.dot(z + .1, 'Gear', h[0] - 1, h[1], (60, 40, 30))
    elif kind == 'drum': G(rect(h[0] - 5, h[1] - 3, h[0] + 4, h[1] + 3), (170, 100, 60)); sp.part(z + .1, 'Gear', rect(h[0] - 5, h[1] - 3, h[0] + 4, h[1] - 2), (236, 220, 180), outline=False)
    elif kind == 'rod': G(ray(h, ang, -3, 22), (150, 120, 60), False)
    elif kind == 'candle': G(rect(h[0], h[1] - 1, h[0] + 1, h[1] + 3), (250, 244, 224)); sp.dot(z + .1, 'Gear', h[0], h[1] - 3, (255, 210, 90)); sp.dot(z + .1, 'Gear', h[0], h[1] - 2, (255, 150, 60))
    elif kind == 'brush': G(rect(h[0] - 1, h[1] - 1, h[0] + 3, h[1] + 1), WOOD); sp.part(z + .1, 'Gear', rect(h[0] - 1, h[1] + 1, h[0] + 3, h[1] + 2), (210, 190, 130), outline=False)
    elif kind == 'fork':
        G(ray(h, ang, -4, 14), WOOD, False); e = pt(h, ang, 14); G({pt(pt(e, ang, t), ang + 90, s) for t in range(0, 4) for s in (-2, 0, 2)}, (150, 150, 160), False)
    elif kind == 'shears':
        o = kw.get('open', 0); a1, a2 = ang + (14 if o else 3), ang - (14 if o else 3)
        G(thick(ray(h, a1, 0, 9), 1), STEEL); G(thick(ray(h, a2, 0, 9), 1), STEEL); G(ray(h, ang + 180, 0, 4), (160, 60, 60), False)
    elif kind == 'stamp': G(rect(h[0] - 1, h[1] - 5, h[0] + 1, h[1]), WOOD); G(rect(h[0] - 3, h[1] + 1, h[0] + 3, h[1] + 2), (170, 60, 60))
    elif kind == 'quill': G(ray(h, ang, 0, 8), (240, 238, 228), False); sp.dot(z + .1, 'Gear', *pt(h, ang, 8), (90, 90, 200))
    elif kind == 'papers': G(rect(h[0] - 3, h[1] - 3, h[0] + 3, h[1] + 3), (240, 234, 212)); sp.part(z + .1, 'Gear', rect(h[0] - 3, h[1] - 3, h[0] + 3, h[1] - 3), (215, 208, 186), outline=False)
    elif kind == 'paper': G(rect(h[0] - 2, h[1] - 4, h[0] + 3, h[1] + 3), (240, 234, 212)); sp.dot(z + .1, 'Gear', h[0], h[1] - 1, (200, 60, 60))
    elif kind == 'glass': G(thick(ray(h, ang, 0, 4), 1), WOOD); e = pt(h, ang, 7); G(rect(e[0] - 2, e[1] - 2, e[0] + 2, e[1] + 2) - rect(e[0] - 1, e[1] - 1, e[0] + 1, e[1] + 1), (200, 170, 70))
    elif kind == 'sack': G(rect(h[0] - 4, h[1] - 4, h[0] + 4, h[1] + 4), (206, 184, 140)); sp.part(z + .1, 'Gear', rect(h[0] - 2, h[1] - 6, h[0] + 2, h[1] - 5), (206, 184, 140))
    elif kind == 'censer':
        G(rect(h[0] - 2, h[1], h[0] + 2, h[1] + 2), (200, 160, 70)); G(ray(h, 90, 1, 6), (150, 130, 80), False)
        for i, (dx, dy) in enumerate(((0, -3), (1, -4), (0, -5))): sp.dot(z + .1, 'Gear', h[0] + dx, h[1] + dy + 1, (220, 220, 226))
    elif kind == 'umbrella':
        G(ray(h, 90, -3, 8), WOOD, False); G(rows_([6, 10, 14], h[0], h[1] - 11), col or (240, 150, 170))
    elif kind == 'coin': G(rect(h[0], h[1] - 1, h[0] + 1, h[1]), GOLD); sp.dot(z + .1, 'Gear', h[0], h[1] - 1, (255, 250, 200))
    elif kind == 'fan': G(rect(h[0] - 3, h[1] - 3, h[0] + 3, h[1] - 1) | rect(h[0] - 2, h[1] - 4, h[0] + 2, h[1] - 4), (214, 186, 120)); G(ray(h, 270, 0, 3), WOOD, False)
    elif kind == 'chicken':
        G(rect(h[0] - 3, h[1] - 3, h[0] + 3, h[1] + 3), (240, 236, 226)); sp.dot(z + .1, 'Gear', h[0] + 3, h[1] - 4, (210, 60, 60)); sp.dot(z + .1, 'Gear', h[0] + 4, h[1] - 3, (240, 190, 70))
    elif kind == 'lantern':
        G(rect(h[0] - 1, h[1], h[0] + 1, h[1] + 3), (80, 70, 60)); sp.part(z + .1, 'Gear', rect(h[0], h[1] + 1, h[0], h[1] + 2), (255, 220, 110), outline=False)
    elif kind == 'bottle': G(rect(h[0] - 1, h[1] - 2, h[0] + 1, h[1] + 3), col or (120, 190, 230)); sp.dot(z + .1, 'Gear', h[0], h[1] - 3, (180, 140, 90))
    elif kind == 'bread': G(rect(h[0] - 3, h[1] - 1, h[0] + 3, h[1] + 1), (222, 170, 100)); sp.dot(z + .1, 'Gear', h[0] - 1, h[1] - 1, (246, 210, 150))
    elif kind == 'veg': G(rect(h[0] - 2, h[1] - 1, h[0] + 2, h[1] + 2), col or (120, 180, 80))
    elif kind == 'whet': G(rect(h[0], h[1], h[0] + 2, h[1] + 1), (150, 150, 160))
    elif kind == 'telescope':
        for dx in (-5, 0, 5): sp.part(z - .5, 'Gear', ray((h[0] + dx // 2, h[1] + 4), 270 + (dx * 3), 0, 13), (110, 84, 62), outline=False, shade=False)
        G(thick(ray(h, ang, -2, 11), 2), (206, 168, 80))
    elif kind == 'crank': G(ray(h, ang, 0, 4), WOOD, False)
    elif kind == 'blanket': sp.part(z - 1.5, 'Clothes', rect(h[0] - 5, h[1], h[0] + 5, h[1] + 6), col or (140, 80, 70))
    for x, y, c in kw.get('fx', []): sp.dot(z + .2, 'Gear', x, y, c)


WHITE_ = (252, 252, 248)


def _line(a, b):
    n = max(abs(b[0] - a[0]), abs(b[1] - a[1])) + 1
    return [(round(a[0] + (b[0] - a[0]) * i / max(1, n - 1)), round(a[1] + (b[1] - a[1]) * i / max(1, n - 1))) for i in range(n)]


def rows_(spans, cx, y0):
    return {(cx - w // 2 + i, y0 + r) for r, w in enumerate(spans) for i in range(w)}
