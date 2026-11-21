# Animasi rangka 2D (cutout) dari sprite Arka ASLI: tampak depan/belakang/samping dipotong per bagian (kepala, badan,
# lengan, kaki) + pedang pixel art di genggaman; tiap bagian diputar di sendinya dengan RotSprite (pixel art tetap rapi).
# Semua frame dari potongan yang sama → ukuran, warna, pedang selalu konsisten.
# Pakai: python3 tools/rig2d/arka_cutout.py OUT_DIR   → arka_rig_sheet.png + arka_rig_preview.gif
import sys, os, math
import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/rig2d'
os.makedirs(OUT, exist_ok=True)
SHEET = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'img', 'hero', 'hero_arka.png')
SRC = np.array(Image.open(SHEET).convert('RGBA'))
FW, FH, CW, CH = 48, 40, 96, 80          # frame asli, kanvas hasil
OX, OY = (CW - FW) // 2, CH - FH - 6     # posisi frame asli di kanvas

def frame(row): return SRC[row * FH:row * FH + FH, 0:FW].copy()

def cut(f, x0, x1, y0, y1):
    p = np.zeros_like(f); p[y0:y1 + 1, x0:x1 + 1] = f[y0:y1 + 1, x0:x1 + 1]; f[y0:y1 + 1, x0:x1 + 1, 3] = 0; return p

def fill_holes(img, ref, y0=24, y1=33):  # isi bekas lengan dengan warna jaket terbanyak (badan tidak bolong/belang)
    band = img[y0:y1 + 1]; px = band[band[..., 3] > 0][:, :3]; px = px[px.astype(int).sum(1) > 170]  # abaikan garis tepi gelap
    cols, cnt = np.unique(px, axis=0, return_counts=True); jacket = cols[cnt.argmax()]
    need = (ref[..., 3] > 0) & (img[..., 3] == 0); img[need] = [*jacket, 255]
    return img

# ── pedang pixel art (palet Arka), gagang di (1, 0), bilah ke bawah ──
SWORD = ['.k.', 'kok', 'kgk', 'kgk', 'kgk', 'kKk', 'kGGGGGk', 'kGGKGGk', '.kkWkk.',
         '.kwWsk.', '.kwWsk.', '.kwWsk.', '.kwWsk.', '.kwWsk.', '.kwWsk.', '.kwWsk.', '.kwWsk.', '.kwWsk.', '.kwWsk.',
         '.kwWsk.', '.kwWsk.', '.kwWsk.', '..kWk..', '..kwk..', '...k...']  # pedang besar: bilah 3 px, ±17 px
SC = {'k': (36, 28, 40, 255), 'o': (232, 186, 74, 255), 'g': (122, 76, 40, 255), 'K': (170, 120, 40, 255), 'G': (232, 186, 74, 255),
      'w': (236, 242, 250, 255), 'W': (196, 210, 228, 255), 's': (140, 156, 182, 255)}
def sword_img():
    w = max(len(r) for r in SWORD); im = np.zeros((len(SWORD), w, 4), np.uint8)
    for y, r in enumerate(SWORD):
        off = (w - len(r)) // 2
        for x, ch in enumerate(r):
            if ch in SC: im[y, x + off] = SC[ch]
    return im, (w // 2, 3)  # titik genggam

# ── RotSprite: perbesar ×8 dengan Scale2x (EPX) 3 kali, putar tetangga-terdekat, perkecil lagi ──
def scale2x(a):
    h, w = a.shape[:2]; p = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode='edge')
    E = p[1:-1, 1:-1]; A = p[:-2, 1:-1]; B = p[1:-1, 2:]; C = p[1:-1, :-2]; D = p[2:, 1:-1]
    eq = lambda u, v: np.all(u == v, axis=2)
    o = np.zeros((h * 2, w * 2, 4), a.dtype)
    c0 = eq(C, A) & ~eq(C, D) & ~eq(A, B); c1 = eq(A, B) & ~eq(A, C) & ~eq(B, D)
    c2 = eq(D, C) & ~eq(D, B) & ~eq(C, A); c3 = eq(B, D) & ~eq(B, A) & ~eq(D, C)
    o[0::2, 0::2] = np.where(c0[..., None], A, E); o[0::2, 1::2] = np.where(c1[..., None], B, E)
    o[1::2, 0::2] = np.where(c2[..., None], C, E); o[1::2, 1::2] = np.where(c3[..., None], D, E)
    return o

def place(canvas, part, pivot, ang, dx, dy, flip=False):
    """tempel bagian (koordinat frame asli) diputar ang° di pivot, digeser (dx, dy), ke kanvas"""
    if not part[..., 3].any(): return
    if flip: part = part[:, ::-1]; pivot = (part.shape[1] - 1 - pivot[0], pivot[1])
    if abs(ang) > .5:
        big = scale2x(scale2x(scale2x(part)))
        im = Image.fromarray(big).rotate(ang, resample=Image.NEAREST, center=(pivot[0] * 8 + 4, pivot[1] * 8 + 4))
        part = np.array(im.resize((part.shape[1], part.shape[0]), Image.NEAREST))
    h, w = part.shape[:2]
    m = part[..., 3] > 128
    ys, xs = np.nonzero(m); ty, tx = ys + OY + dy, xs + OX + dx
    ok = (ty >= 0) & (ty < CH) & (tx >= 0) & (tx < CW)
    canvas[ty[ok], tx[ok]] = part[ys[ok], xs[ok]]

def arm_with_sword(arm, hand):
    s, g = sword_img(); big = np.zeros((FH + 34, FW + 20, 4), np.uint8); big[:FH, :FW] = arm
    y0, x0 = hand[1] - g[1], hand[0] - g[0]
    for y in range(s.shape[0]):
        for x in range(s.shape[1]):
            if s[y, x, 3] and 0 <= y0 + y < big.shape[0] and 0 <= x0 + x < big.shape[1]: big[y0 + y, x0 + x] = s[y, x]
    return big

# ── rig per tampak ──
def rig_front(row):
    f = frame(row); ref = f.copy()
    head = cut(f, 0, 47, 0, 24)
    armL = cut(f, 11, 17, 26, 34); armR = cut(f, 29, 35, 26, 34)  # armL = di kiri layar (tangan kanan Arka, pegang pedang)
    legL = cut(f, 17, 23, 35, 39); legR = cut(f, 24, 31, 35, 39)
    torso = f
    return dict(head=(head, (23, 24)), torso=(torso, (23, 34)), armS=(arm_with_sword(armL, (15, 33)), (16, 27)), armF=(armR, (30, 27)),
                legL=(legL, (20, 35)), legR=(legR, (27, 35)))
def rig_side(row):
    f = frame(row); ref = f.copy()
    head = cut(f, 0, 47, 0, 23)
    arm = cut(f, 18, 24, 24, 32); torso = fill_holes(f, ref)
    legB = cut(torso, 17, 24, 34, 39); legF = cut(torso, 25, 33, 34, 39)
    return dict(head=(head, (25, 23)), torso=(torso, (25, 33)), armS=(arm_with_sword(arm, (21, 31)), (21, 25)), legB=(legB, (21, 34)), legF=(legF, (28, 34)))

R = {'down': rig_front(0), 'up': rig_front(2), 'side': rig_side(4)}

# ── pose: (sudut, geser) per bagian ──
def draw(view, P, flip=False):
    if view == 'left': return draw('right', P)[:, ::-1].copy()  # hadap kiri = cermin utuh hadap kanan
    rg = R['side' if view == 'right' else view]; cv = np.zeros((CH, CW, 4), np.uint8)
    AX, AY = P.get('all', (0, 0))  # geser seluruh tubuh (langkah, lompat)
    def put(k, ang=0, dx=0, dy=0):
        if k in rg: img, pv = rg[k]; place(cv, img, pv, ang, dx + AX, dy + AY)
    g = P.get
    if view == 'down':
        order = [('legL', 'legL'), ('legR', 'legR'), ('armF', 'armF'), ('torso', 'torso'), ('head', 'head'), ('armS', 'armS')]
    elif view == 'up':
        order = [('armS', 'armS'), ('legL', 'legL'), ('legR', 'legR'), ('torso', 'torso'), ('armF', 'armF'), ('head', 'head')]
    else:
        order = [('legB', 'legB'), ('torso', 'torso'), ('legF', 'legF'), ('head', 'head'), ('armS', 'armS')]
    by = g('bob', 0)
    for k, _ in order:
        a, dx, dy = g(k, (0, 0, 0))
        put(k, a, dx, dy + (by if k in ('torso', 'head', 'armS', 'armF') else 0))
    return cv

def idle(view, t):
    b = round(math.sin(t * 2 * math.pi))
    return {'bob': -1 if b > 0 else 0, 'head': (0, 0, -1 if b > 0 else 0)}
def run(view, t):
    s = math.sin(t * 2 * math.pi); c = math.cos(t * 2 * math.pi); lift = lambda v: -round(max(0, v) * 2)
    bob = -1 if abs(c) > .5 else 0
    if view in ('down', 'up'):
        return {'bob': bob, 'legL': (0, 0, lift(s)), 'legR': (0, 0, lift(-s)), 'armS': (28 * s, 0, 0), 'armF': (28 * s, 0, 0), 'head': (0, 0, 0)}
    return {'bob': bob, 'legF': (-25 * s, round(2 * s), lift(c)), 'legB': (25 * s, round(-2 * s), lift(-c)), 'armS': (40 * s, 0, 0), 'torso': (-4, 0, 0), 'head': (0, 1, 0)}
def slash(view, t):
    if t < .34: k = t / .34; a = -150 * k; lean = 0
    elif t < .6: k = (t - .34) / .26; a = -150 + 230 * k; lean = round(2 * k)
    else: k = (t - .6) / .4; a = 80 - 60 * k; lean = round(2 * (1 - k))
    if view == 'down': return {'armS': (-a, -lean, 0), 'legL': (0, -1, 0), 'head': (0, -lean // 2, 0), 'torso': (0, 0, 0)}
    if view == 'up': return {'armS': (a, lean, 0), 'head': (0, lean // 2, 0)}
    return {'armS': (a, lean, 0), 'legF': (-20, 2, 0), 'legB': (15, -1, 0), 'torso': (0, lean, 0), 'head': (0, lean, 0)}

if __name__ == '__main__':
  VIEWS = ['down', 'left', 'up', 'right']
  ANIMS = [('idle', idle, 4), ('run', run, 8), ('slash', slash, 6)]
  sheet = Image.new('RGBA', (CW * 8, CH * len(ANIMS) * len(VIEWS)))
  FR = {}
  r = 0
  for an, fn, n in ANIMS:
      for v in VIEWS:
          for i in range(n):
              im = Image.fromarray(draw(v, fn(v if v in ('down', 'up') else 'side', i / n))); FR[(an, v, i)] = im; sheet.paste(im, (i * CW, r * CH))
          r += 1
  sheet.save(os.path.join(OUT, 'arka_rig_sheet.png'))
  S = 3; W = CW * 4; H = CH * 3; gif = []
  for t in range(24):
      bg = Image.new('RGBA', (W, H), (74, 112, 54, 255))
      for ai, (an, fn, n) in enumerate(ANIMS):
          for vi, v in enumerate(VIEWS): bg.alpha_composite(FR[(an, v, t % n)], (vi * CW, ai * CH))
      gif.append(bg.resize((W * S, H * S), Image.NEAREST).convert('RGB'))
  gif[0].save(os.path.join(OUT, 'arka_rig_preview.gif'), save_all=True, append_images=gif[1:], duration=110, loop=0)
  print('ok', sheet.size)
