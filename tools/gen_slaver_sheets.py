"""Sheet Pemburu Liar (slaver) & Kapten Pemburu (slaver_captain): memakai rig gen_humanoid_sheets.py.
Dipasang lewat register(H) dari gen_humanoid_sheets (H = modul utamanya, supaya SPEC/KEYS terdaftar di modul yang sama).
slaver = perampok kurus berompi kulit gelap, ikat kepala merah lusuh, pedang besi, gulungan tali di pinggang.
slaver_captain = besar berotot, lengan telanjang berparut, pelindung bahu besi bergerigi, kapak dua tangan; tell = kapak diangkat ke atas kepala."""
import math

def register(H):
    Cv, P, line, ell, poly, vec, hx, S = H.Cv, H.P, H.line, H.ell, H.poly, H.vec, H.hx, H.S

    def axe(cv, h, th, pz):   # kapak dua tangan: tangkai kayu, bilah baja melengkung ke depan, taji di belakang
        x0, y0 = h
        def at(a, s):
            v, n = vec(th, a), vec(th - 90, s)
            return (x0 + v[0] + n[0], y0 + v[1] + n[1])
        a0, a1 = at(-6, 0), at(27, 0)
        cv.part(lambda d: line(d, P(*a0), P(*a1), 2), '#5a3a22')
        cv.part(lambda d: poly(d, [at(18, 0), at(12, 9), at(14, 12), at(31, 13), at(30, 7), at(28, 0)]), '#5e6278')   # bilah lebar bergerigi
        cv.part(lambda d: poly(d, [at(24, -1), at(28, -5), at(31, -1)]), '#4e5268')                                   # taji belakang
        cv.part(lambda d: line(d, P(*at(13, 11)), P(*at(31, 13)), 1), '#eef2ff', outline=False, shade=False)           # mata kapak mengilap
        cv.px(*at(20, 6), '#2a2a3a'); cv.px(*at(24, 8), '#2a2a3a')                                                     # takik & noda
        for t in (-3, 1): q = at(t, 0); cv.px(q[0], q[1], '#3a2416')   # lilitan pegangan

    H.WEAPONS['axe'] = axe

    def head_slaver(cv, c, pz):
        x, y = c; o = pz['open']; sk = '#c89468'
        cv.part(lambda d: ell(d, x, y, 4.6, 4.6), sk)
        cv.part(lambda d: poly(d, [(x + 3, y), (x + 6, y + 1), (x + 3, y + 2)]), sk)           # hidung
        cv.part(lambda d: poly(d, [(x - 5, y - 1), (x - 4, y - 5), (x + 4, y - 5), (x + 5, y - 2), (x - 2, y - 2)]), '#9a2a2a')   # ikat kepala
        cv.part(lambda d: poly(d, [(x - 4, y - 3), (x - 9, y - 1 + o), (x - 8, y + 2), (x - 4, y)]), '#7a1e22')                    # ujung ikatan
        cv.rect(x + 1, y - 1, x + 3, y - 1, '#1c1218'); cv.px(x + 3, y, '#f4ecd0')               # alis & mata
        cv.rect(x, y + 3, x + 3, y + 3, '#5a4030')                                             # janggut tipis
        cv.rect(x + 1, y + 2, x + 3, y + 2 + (1 if o else 0), '#4a1418')

    def head_captain(cv, c, pz):
        x, y = c; o = pz['open']; sk = '#b8805a'
        cv.part(lambda d: ell(d, x, y, 6.2, 5.6), sk)
        cv.part(lambda d: poly(d, [(x + 4, y), (x + 8, y + 2), (x + 4, y + 3)]), sk)
        cv.part(lambda d: ell(d, x - 1, y - 4, 6, 2.4), '#2a2022')                                # rambut cepak gelap
        cv.part(lambda d: poly(d, [(x - 4, y + 2), (x + 5, y + 2), (x + 5, y + 7 + o), (x - 3, y + 6)]), '#3a2a2a')   # janggut lebat
        cv.rect(x, y - 2, x + 4, y - 2, '#150e10'); cv.px(x + 2, y - 1, '#ff5a2a'); cv.px(x + 3, y - 1, '#ff5a2a')   # alis tebal & mata menyala
        cv.rect(x + 1, y + 3, x + 4, y + 3 + o, '#4a1418')
        if o: cv.px(x + 2, y + 3, '#f0ead0'); cv.px(x + 4, y + 3, '#f0ead0')
        for i in range(3): cv.px(x - 3 + i, y - 1 + i, '#7a2a24')                                 # bekas luka di pipi

    def rope(torL):
        def f(cv, s):   # gulungan tali di pinggang (hampir di pinggul = bahu + panjang torso)
            hx_, hy_ = s[0] - 3, s[1] + torL - 2
            cv.part(lambda d: ell(d, hx_, hy_, 3, 2.4), '#8a7650')
            cv.px(hx_, hy_, '#5a4a30'); cv.px(hx_ - 1, hy_ - 1, '#d8c898'); cv.px(hx_ + 1, hy_ + 1, '#6a5a3a')
        return f

    def plate_captain(cv, s):   # pelindung bahu besi bergerigi + tali kulit
        cv.part(lambda d: ell(d, s[0] + 1, s[1] - 1, 5, 3.4), '#6e7288')
        for dx in (-3, 0, 3): cv.px(s[0] + dx, s[1] - 5, '#c8ccd8'); cv.px(s[0] + dx, s[1] - 4, '#9094a8')
        cv.rect(s[0] - 3, s[1] + 2, s[0] + 4, s[1] + 2, '#4a3220')

    def scars(cv, hc, pz, h):   # pita parut di lengan depan
        cv.px(h[0] - 2, h[1] - 3, '#7a3a34'); cv.px(h[0] - 3, h[1] - 4, '#7a3a34')

    H.SPEC['slaver'] = S(lean0=1, legL=11, torL=10, tw=6, hr=5, skin='#c89468', cloth='#3a2c28', pants='#4a4640', boot='#2a2018', lw=2, aw=2, ul=6, fal=6,
                         head=head_slaver, weapon='sword', belt='#7a5a30', sleeve='#5a4838', shoulder=rope(10), hdx=1)
    H.SPEC['slaver_captain'] = S(lean0=1, legL=14, torL=14, tw=13, hr=7, skin='#b8805a', cloth='#4a2a26', pants='#2e2a30', boot='#1e1818', lw=5, aw=5, ul=8, fal=8,
                                 head=head_captain, weapon='axe', belt='#8a6a34', shoulder=plate_captain, after=scars, hdx=2, hand='#b8805a')

    two = lambda a, w: (a, a, w)   # kedua tangan memegang gagang yang sama
    H.KEYS['slaver'] = dict(
        rest_w=120, mb=1,
        wind=[((60, 110), (-15, 0), 130), ((110, 150), (-15, 0), 165), ((140, 170), (-15, 0), 190), ((155, 180), (-15, 0), 205)],
        atk=[((130, 160), (-15, 0), 200), ((95, 120), (-15, 0), 130), ((60, 85), (-15, 0), 80), ((50, 75), (-15, 0), 70)],
        alert=[((120, 160), (110, 150), 175), ((135, 170), (125, 165), 160)])
    H.KEYS['slaver_captain'] = dict(
        rest_w=140, mb=2,
        wind=[((70, 100), (60, 90), 130), ((125, 140), (115, 130), 165), ((155, 170), (145, 160), 190), ((170, 180), (165, 178), 200)],
        atk=[((150, 170), (140, 160), 195), ((100, 120), (95, 115), 140), ((50, 70), (45, 65), 70), ((35, 55), (30, 50), 55)],
        alert=[((140, 170), (135, 165), 195), ((150, 175), (145, 170), 185)])
