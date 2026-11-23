"""Pose per frame: gerak dasar (walk/idle/talk) dan 35 animasi kegiatan (docs/NPC_ROSTER.md §2-3).
Lengan a1/a2 = ujung relatif terhadap bahu (x maju/kanan, y turun); a1 = tangan utama (samping: lengan dekat; depan/belakang: lengan sisi kanan gambar).
props = [(jenis, tangan, sudut, {opsi})]. fx = [(dx, dy, warna)] relatif (CX=24, GROUND=47)."""
import math

SPARK = (255, 232, 120); DUST = (214, 206, 190); LEAFC = (112, 168, 84); FLOUR = (246, 244, 236)
STANCE = dict(s=.8, amp=2)


def rest(st): return (0, 4 if st.get('kid') else 7)


def loco(anim, d, f, st):
    R = rest(st)[1]; P = {}
    if anim == 'walk':
        s = math.cos(f / 4 * 2 * math.pi); P.update(bob=[0, -1, 0, -1][f], s=s, amp=3)
        if d == 'Side': P.update(liftN=[0, 0, 0, 1][f], liftF=[0, 1, 0, 0][f], a1=(round(-s * 3), R), a2=(round(s * 3), R))
        else: P.update(liftL=[0, 1, 0, 0][f], liftR=[0, 0, 0, 1][f], a2=(0, R + round(s * 2)), a1=(0, R - round(s * 2)))
    elif anim == 'idle':
        P.update(sq=f, hy=f)
    elif anim == 'talk':
        P.update(mouth=[0, 1, 0, 1][f], hy=[0, 1, 0, 0][f])
        if f == 2: P['a1'] = (-3, 3)
        if f == 3: P['a1'] = (-2, 5)
    return P


def ready(w, **k):
    P = dict(crouch=1, a1=(5, 5), a2=(3, 4), props=[(w, 'a1', 65)], **STANCE); P.update(k); return P


def train(f, st):
    w = st.get('weapon', 'wspear')
    return [ready(w), ready(w, lean=-1, a1=(-3, 2), a2=(-1, 3), props=[(w, 'a1', 20)]),
            ready(w, crouch=0, a1=(4, 3), a2=(2, 3), props=[(w, 'a1', 5)], fx=[(-6, -21, DUST), (-4, -20, DUST)]),
            ready(w, crouch=0, lean=2, a1=(8, 4), a2=(6, 4), props=[(w, 'a1', 0)], fx=[(23, -15, SPARK), (22, -18, SPARK), (24, -12, SPARK)]),
            ready(w, crouch=0, lean=1, a1=(6, 2), a2=(4, 3), props=[(w, 'a1', 35)]), ready(w, sq=1)][f]


def spar_attack(f, st):
    w = st.get('weapon', 'wsword'); w = w if w not in ('spear', 'wspear') else 'wsword'
    return [ready(w, props=[(w, 'a1', 55)]), ready(w, lean=1, a1=(2, -5), a2=(2, -3), props=[(w, 'a1', 80, {'z': 5.9})]),
            ready(w, crouch=0, lean=1, a1=(7, 3), a2=(5, 3), props=[(w, 'a1', -35)]),
            ready(w, crouch=2, lean=2, a1=(8, 5), a2=(6, 4), props=[(w, 'a1', -25)]), ready(w, props=[(w, 'a1', 55)])][f]


def spar_block(f, st):
    w = st.get('weapon', 'wsword'); w = w if w not in ('spear', 'wspear') else 'wsword'
    return [ready(w, props=[(w, 'a1', 55)]), ready(w, a1=(6, -3), a2=(4, -2), props=[(w, 'a1', 90)]),
            ready(w, dx=-1, a1=(6, -3), a2=(4, -2), eyes='closed', props=[(w, 'a1', 90)], fx=[(12, -22, SPARK), (14, -25, SPARK), (11, -26, SPARK)]),
            ready(w, props=[(w, 'a1', 55)])][f]


def salute(f, st):
    w = st.get('weapon', 'wspear'); pr = [(w, 'a2', 90)] if st.get('weapon') or st.get('salute_w') else []
    return [dict(a2=(2, 7), props=pr), dict(a2=(2, 7), a1=(3, 1), props=pr), dict(a2=(2, 7), a1=(3, 1), bob=-1, props=pr), dict(a2=(2, 7), props=pr)][f]


def shoot(f, st):
    bk = dict(short=st.get('bowshort')); pr = lambda **k: [('bow', 'a2', 180, dict(bk, **k))]
    return [dict(a2=(-1, 6), props=pr()), dict(a2=(-1, 6), a1=(-1, -5), props=pr()), dict(a2=(-2, -1), a1=(-3, 0), props=pr(arrow=1)),
            dict(a2=(-5, -3), a1=(2, -4), props=pr(pull=1, arrow=1), dx=0), dict(a2=(-5, -3), a1=(2, -4), props=pr(pull=1, arrow=1), sq=-1),
            dict(a2=(-5, -3), a1=(5, -2), props=pr(), fx=[(-14, -22, (230, 220, 190)), (-14, -25, (230, 220, 190))]), dict(a2=(-1, 6), props=pr())][f]


def inspect(f, st):
    R = rest(st)[1]
    return [dict(a1=(-3, R - 1), a2=(-3, R)), dict(lean=1, hy=1, a1=(-3, R - 1), a2=(-3, R)), dict(lean=1, a1=(8, 0), a2=(-3, R)),
            dict(a1=(3, 2), a2=(-3, R)), dict(a1=(-3, R - 1), a2=(-3, R))][f]


def groom(f, st):
    t = st.get('tool', 'brush'); ang = 80 if t == 'fork' else 0
    return [dict(a1=(4, 5), a2=(3, 5), props=[(t, 'a1', ang)]), dict(a1=(8, 0), a2=(3, 5), props=[(t, 'a1', ang)]),
            dict(a1=(5, 0), a2=(3, 5), props=[(t, 'a1', ang)], fx=[(14, -30, DUST), (16, -28, DUST)]),
            dict(crouch=3, lean=2, a1=(8, 6), a2=(4, 5), props=[(t, 'a1', ang)]), dict(a1=(3, -6), a2=(3, 5)), dict(a1=(4, 5), a2=(3, 5), props=[(t, 'a1', ang)])][f]


def sharpen(f, st):
    w = st.get('weapon', 'sword'); w = w if w not in ('spear', 'wspear') else 'sword'
    b = dict(crouch=4, splay=2, a2=(2, 5), props=[(w, 'a2', 0)])
    def m(a1, fx=(), **k): return dict(b, a1=a1, props=[(w, 'a2', 0), ('whet', 'a1', 0)], fx=list(fx), **k)
    return [m((-4, 3)), m((-10, 3)), m((-6, 4), [(-4, -9, SPARK), (-1, -8, SPARK)]), m((-3, 4), [(2, -9, SPARK)]),
            dict(crouch=3, splay=2, a1=(-1, -1), a2=(0, -3), props=[(w, 'a2', 80)]), m((-4, 3))][f]


def arrange(f, st):
    g = st.get('goods', ('bottle', None)); k = lambda who, **x: [(g[0], who, 0, dict(c=g[1], **x))]
    return [dict(a1=(-4, 1), a2=(4, 1), props=k('mid')), dict(crouch=1, hy=1, a1=(-3, 5), a2=(3, 5), props=k('mid')),
            dict(crouch=1, a1=(-5, 6), a2=(0, 6), props=k('a1')), dict(crouch=1, a1=(-1, 6), a2=(5, 6), props=k('a2')),
            dict(a1=(-4, 5), a2=(4, 5)), dict(mouth=1, a1=(-2, 7), a2=(2, 7))][f]


def call(f, st):
    g = st.get('goods', ('bottle', None))
    return [dict(a1=(-5, -4)), dict(a1=(-5, -4), mouth=2, hy=1), dict(a2=(1, -9), mouth=1, props=[(g[0], 'a2', 0, dict(c=g[1]))]), dict(mouth=0, a1=(0, 7))][f]


def give(f, st):
    g = st.get('give', 'parcel'); pk = lambda who: [(g, who, 0, {})]
    return [dict(a1=(3, 2), a2=(3, 3), props=pk('mid')), dict(a1=(8, 2), a2=(7, 3), props=pk('a1')), dict(a1=(8, 3), a2=(0, 7)),
            dict(hy=1, a1=(1, 6), a2=(0, 7))][f]


def pay(f, st):
    return [dict(a1=(-1, 7)), dict(a1=(2, 4), props=[('coin', 'a1', 0)]), dict(a1=(8, 3), props=[('coin', 'a1', 0)]),
            dict(a1=(3, 2), a2=(3, 3), mouth=1, props=[('parcel', 'mid', 0)])][f]


def refuse(f, st):
    return [dict(a1=(3, 3), a2=(2, 3)), dict(a1=(3, 3), a2=(2, 3), hdx=-1), dict(a1=(3, 3), a2=(2, 3), hdx=1), dict(a1=(3, 3), a2=(2, 3), lean=-1, hy=1, bob=0)][f]


def browse(f, st):
    return [dict(), dict(hdx=-2), dict(hdx=2), dict(a1=(2, -3)), dict(a1=(-4, -6))][f]


def play(f, st):
    if st.get('inst') == 'flute':
        base = dict(a1=(-5, -3), a2=(3, -3), props=[('flute', 'a1', 180)])
        return [dict(base), dict(base, dx=-1), dict(base, hy=1), dict(base, dx=1, eyes='closed'), dict(base, fx=[(4, -37, SPARK), (7, -40, SPARK)]), dict(base)][f]
    base = dict(props=[('lute', 'lap', 0)])
    return [dict(base, a1=(-4, 4), a2=(4, 3)), dict(base, dx=-1, a1=(-3, 6), a2=(4, 3)), dict(base, a1=(-4, 3), a2=(4, 3), hy=1),
            dict(base, dx=1, a1=(-3, 5), a2=(4, 3), eyes='closed'), dict(base, a1=(-3, 7), a2=(4, 3), fx=[(8, -33, SPARK), (10, -36, SPARK)]), dict(base, a1=(-4, 4), a2=(4, 3))][f]


def drum(f, st):
    b = dict(props=[('drum', 'belly', 0, {'z': 3.8})])
    return [dict(b, a1=(-3, 0), a2=(3, 0)), dict(b, a1=(-3, -1), a2=(3, 5)), dict(b, a1=(-3, 5), a2=(3, -1)), dict(b, a1=(-3, 5), a2=(3, -1)),
            dict(b, crouch=1, a1=(-3, 5), a2=(3, 5)), dict(b, a1=(-3, 0), a2=(3, 0), mouth=2)][f]


def announce(f, st):
    return [dict(a1=(-4, 3), props=[('scroll', 'a1', 0)]), dict(a1=(-4, 0), a2=(4, 0), props=[('scroll', 'mid', 0, {'open': 1})]),
            dict(a1=(-4, 0), a2=(4, 0), hy=1, mouth=1, props=[('scroll', 'mid', 0, {'open': 1})]),
            dict(a1=(-4, 0), a2=(3, -4), mouth=2, props=[('scroll', 'a1', 0, {'open': 1})]), dict(a1=(-4, 0), a2=(4, 0), hy=1, props=[('scroll', 'mid', 0, {'open': 1})]),
            dict(a1=(-4, 3), props=[('scroll', 'a1', 0)])][f]


def clap(f, st):
    return [dict(a1=(4, 1), a2=(6, 1)), dict(a1=(5, 1), a2=(5, 1)), dict(a1=(4, 1), a2=(6, 1)), dict(a1=(5, 1), a2=(5, 1), mouth=1)][f]


def laugh(f, st):
    return [dict(a1=(2, 5), a2=(2, 6)), dict(a1=(2, 5), a2=(2, 6), hy=-1, mouth=2, lean=-1), dict(a1=(2, 5), a2=(2, 6), lean=2, hy=1, mouth=2),
            dict(a1=(1, -5), a2=(2, 6), mouth=2, fx=[(7, -28, (130, 190, 240))])][f]


def cheers(f, st):
    c = st.get('cup', 'cup')
    return [dict(a1=(-3, 4), props=[(c, 'a1', 0)]), dict(a1=(-1, -6), props=[(c, 'a1', 0)]),
            dict(a1=(-9, -3), props=[(c, 'a1', 0, {'foam': 1})], fx=[(-5, -33, (252, 252, 248)), (-6, -35, (252, 252, 248))]),
            dict(a1=(-5, -5), hy=-1, props=[(c, 'a1', 0)])][f]


def drink(f, st):
    c = st.get('cup', 'cup'); b = dict(drop=6, sit='chair')
    return [dict(b, a1=(-3, 3), props=[(c, 'a1', 0)]), dict(b, a1=(-5, -3), props=[(c, 'a1', 0)]), dict(b, a1=(-5, -4), hy=-1, props=[(c, 'a1', 0)]),
            dict(b, a1=(-3, 0), props=[(c, 'a1', 0)], mouth=1), dict(b, sq=1, hy=1, a1=(-3, 3), props=[(c, 'a1', 0)])][f]


def pray(f, st):
    k = dict(crouch=5, splay=1)
    return [dict(), dict(k), dict(k, hy=1, a1=(-3, 3), a2=(3, 3)), dict(k, hy=1, a1=(-3, 3), a2=(3, 3), fx=[(0, -16, (255, 220, 110)), (1, -19, (255, 240, 170))]), dict()][f]


def stamp(f, st):
    return [dict(a2=(1, 5), a1=(-1, 3), props=[('papers', 'a2', 0)]), dict(a2=(1, 5), a1=(0, -6), props=[('papers', 'a2', 0), ('stamp', 'a1', 0)]),
            dict(a2=(1, 5), a1=(0, 3), props=[('papers', 'a2', 0), ('stamp', 'a1', 0)], fx=[(8, -9, SPARK)]), dict(a1=(-2, -2), a2=(2, -2), props=[('paper', 'mid', 0)])][f]


def lecture(f, st):
    bk = lambda o=1: [('book', 'a2', 0, {'open': o, 'c': st.get('bookc')})]
    return [dict(a2=(4, 2), props=bk()), dict(a2=(4, 2), a1=(-1, -9), props=bk()), dict(a2=(4, 2), a1=(-9, -2), props=bk()),
            dict(a2=(4, 2), hy=1, a1=(-4, 2), props=bk(0)), dict(a2=(4, 2), a1=(-7, 2), mouth=1, props=bk(0)), dict(a2=(4, 2), props=bk())][f]


def study(f, st):
    b = dict(a2=(1, 4), props=[('book', 'a2', 0, {'open': 1}), ('quill', 'a1', 30)])
    return [dict(b, a1=(-2, 4)), dict(b, a1=(-1, 4)), dict(b, a1=(-3, 4)), dict(b, a1=(1, -7)), dict(b, a1=(-2, 4), hy=-1, eyes='wide')][f]


def read(f, st):
    bk = [('book', 'mid', 0, {'open': 1, 'c': st.get('bookc')})]
    return [dict(a1=(-5, 2), a2=(5, 2), props=bk), dict(a1=(-5, 2), a2=(5, 2), props=bk, hdx=1), dict(a1=(-5, 0), a2=(5, 2), props=bk), dict(a1=(-5, 2), a2=(5, 2), props=bk, hy=1)][f]


def stargaze(f, st):
    t = [('telescope', (34, 34), 55)]
    return [dict(a1=(4, 0), props=t), dict(crouch=2, hy=2, a1=(4, 1), props=t), dict(a1=(4, -1), props=t), dict(a1=(7, -8), props=t)][f]


def draw_(f, st):
    return [dict(a1=(-3, -2), a2=(3, -2), props=[('crank', 'mid', 0)]), dict(a1=(-3, -5), a2=(3, -2)), dict(a1=(-3, 2), a2=(3, -2)),
            dict(crouch=2, a1=(-2, 5), a2=(2, 5), props=[('bucket', 'mid', 0, {'water': 1})], fx=[(0, -5, (110, 170, 230))]),
            dict(a1=(-2, -1), a2=(2, -1), props=[('bucket', 'mid', 0, {'water': 1})]), dict(crouch=1, a1=(-4, 6), props=[('bucket', 'a1', 0)])][f]


def sweep(f, st):
    pr = lambda a: [('broom', 'a1', a)]
    return [dict(a1=(5, 6), a2=(3, 5), props=pr(-65)), dict(a1=(1, 6), a2=(0, 5), props=pr(-85), fx=[(-2, -3, DUST), (0, -2, DUST)]),
            dict(a1=(3, 3), a2=(2, 3), props=pr(-45)), dict(a1=(8, 6), a2=(5, 5), props=pr(-50), fx=[(16, -3, DUST), (18, -2, DUST), (15, -1, DUST)]),
            dict(a1=(6, 6), a2=(-2, 5), props=pr(-80), sq=1), dict(a1=(5, 6), a2=(3, 5), props=pr(-65))][f]


def light(f, st):
    p = lambda a, L=34: [('pole', 'a1', a, {'L': L})]
    return [dict(a1=(2, 0), a2=(-2, 0), props=p(84)), dict(a1=(1, -6), a2=(-1, -6), props=p(90)), dict(a1=(1, -8), a2=(-1, -8), props=p(90, 38)),
            dict(a1=(1, -8), a2=(-1, -8), bob=-1, liftL=1, liftR=1, props=p(90, 38)), dict(a1=(2, 1), a2=(-2, 1), props=p(86)),
            dict(a1=(1, -1), a2=(-3, 3), props=p(125, 26))][f]


def tendlight(f, st):
    j = lambda **k: [('jug', 'a1', 0, dict(k, c=(214, 176, 70)))]
    return [dict(a1=(-2, 2), props=j()), dict(a1=(-3, -6), props=j()), dict(a1=(-1, -8), props=j(), fx=[(4, -24, (240, 210, 90)), (4, -22, (240, 210, 90))]),
            dict(a1=(-2, 2), a2=(2, -6), props=j()), dict(a1=(-2, 3), props=j())][f]


def prune(f, st):
    sh = lambda o: [('shears', 'a1', 10, {'open': o})]
    return [dict(a1=(5, 4), a2=(4, 4), props=sh(0)), dict(a1=(5, 4), a2=(4, 4), props=sh(1)),
            dict(a1=(5, 4), a2=(4, 4), props=sh(0), fx=[(16, -8, LEAFC), (14, -3, LEAFC), (18, -1, LEAFC)]),
            dict(crouch=4, lean=2, a1=(6, 6), a2=(4, 5), props=sh(0)), dict(crouch=4, lean=2, a1=(6, 6), a2=(4, 5), props=sh(1)), dict(a1=(2, -6), a2=(0, 7))][f]


def mill(f, st):
    return [dict(crouch=4, lean=3, a1=(5, 9), a2=(4, 9)), dict(crouch=2, lean=2, a1=(4, 4), a2=(3, 5), props=[('sack', 'mid', 0)]),
            dict(lean=1, a1=(1, -5), a2=(0, -4), props=[('sack', 'shoulder', 0)]),
            dict(lean=1, s=1, amp=3, a1=(1, -5), a2=(0, -4), liftN=1, props=[('sack', 'shoulder', 0)]),
            dict(crouch=3, lean=2, a1=(4, 6), a2=(3, 6), props=[('sack', 'mid', 0)], fx=[(4, -4, FLOUR), (6, -3, FLOUR), (3, -2, FLOUR)]),
            dict(a1=(3, 3), a2=(4, 3), fx=[(9, -14, FLOUR), (7, -12, FLOUR), (10, -11, FLOUR)])][f]


def warm(f, st):
    b = dict(drop=6, sit='cross')
    return [dict(b, a1=(-1, 4), a2=(1, 4)), dict(b, a1=(1, -3), a2=(-1, -3)), dict(b, a1=(0, -4), a2=(0, -4), dx=1), dict(b, a1=(-3, 1), a2=(3, 1), sq=1)][f]


def fish(f, st):
    r = lambda a, **k: [('rod', 'a1', a, k)]
    return [dict(a1=(5, 3), a2=(4, 3), props=r(55)), dict(lean=-1, a1=(3, 3), a2=(2, 3), props=r(150)),
            dict(lean=1, a1=(6, 3), a2=(5, 3), props=r(20), fx=[(22, -14, (230, 230, 240)), (27, -12, (230, 230, 240)), (30, -8, (230, 230, 240))]),
            dict(drop=5, sit='chair', a1=(5, 3), a2=(4, 3), props=r(35)), dict(drop=5, sit='chair', a1=(6, 1), a2=(4, 3), props=r(65), fx=[(18, -27, (255, 90, 90)), (18, -24, (255, 90, 90))]),
            dict(a1=(5, 1), a2=(4, 3), props=r(85), fx=[(20, -30, (200, 220, 240)), (21, -31, (200, 220, 240)), (22, -30, (200, 220, 240))])][f]


# nama: (arah gambar, jumlah frame, fungsi) — arah mengikuti LIFE_ANIM_FACE di src/npc/life_sheet.js (selain itu 'Side')
ACTS = {
    'train': ('Side', 6, train), 'spar_attack': ('Side', 5, spar_attack), 'spar_block': ('Side', 4, spar_block), 'salute': ('Side', 4, salute),
    'shoot': ('Up', 7, shoot), 'inspect': ('Side', 5, inspect), 'groom': ('Side', 6, groom), 'sharpen': ('Down', 6, sharpen),
    'arrange': ('Down', 6, arrange), 'call': ('Down', 4, call), 'give': ('Side', 4, give), 'pay': ('Side', 4, pay), 'refuse': ('Side', 4, refuse),
    'browse': ('Up', 5, browse), 'play': ('Down', 6, play), 'drum': ('Down', 6, drum), 'announce': ('Down', 6, announce), 'clap': ('Side', 4, clap),
    'laugh': ('Side', 4, laugh), 'cheers': ('Down', 4, cheers), 'drink': ('Down', 5, drink), 'pray': ('Up', 5, pray), 'stamp': ('Up', 4, stamp),
    'lecture': ('Down', 6, lecture), 'study': ('Up', 5, study), 'read': ('Down', 4, read), 'stargaze': ('Up', 4, stargaze), 'draw': ('Up', 6, draw_),
    'sweep': ('Side', 6, sweep), 'light': ('Up', 6, light), 'tendlight': ('Up', 5, tendlight), 'prune': ('Side', 6, prune), 'mill': ('Side', 6, mill),
    'warm': ('Up', 4, warm), 'fish': ('Side', 6, fish),
}
