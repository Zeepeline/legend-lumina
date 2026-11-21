# Kombo 10 jurus "ahli pedang" dari rangka 2D Arka (tampak samping). Prinsip: rantai gerak pinggul→badan→bahu→lengan→
# pergelangan→pedang (pedang punya sudut pergelangan sendiri), ancang-ancang lambat → tebasan kilat (coretan bilah) →
# gerak lanjutan & tahan, kuda-kuda (lutut, langkah, perpindahan berat), tangan kedua ikut menggenggam, durasi per frame.
# Pakai: python3 tools/rig2d/arka_combo2.py OUT → arka_combo2.gif
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
import arka_cutout as A

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/rig2d'
CW, CH = 128, 92
BASE = (52, 70)  # titik pinggul di kanvas saat dx=dy=0

# ── potongan tampak samping (hadap kanan) dari sprite asli ──
f = A.frame(4); ref = f.copy()
HEAD = A.cut(f, 0, 47, 0, 23); ARM = A.cut(f, 18, 24, 24, 32); TORSO = A.fill_holes(f, ref)
# kaki 2 ruas (paha + betis/sepatu) dengan sendi lutut → IK: telapak menapak tanah, lutut menekuk sendiri
def thigh(x0, x1):  # celana di bawah jaket (baris 31–35) disalin (menyusup ke bawah jaket)
    l = np.zeros_like(TORSO); l[31:36, x0:x1 + 1] = TORSO[31:36, x0:x1 + 1]; return l
def shin(x0, x1): return A.cut(TORSO, x0, x1, 35, 39)
THB, THF = thigh(17, 24), thigh(25, 33); SHB, SHF = shin(17, 24), shin(25, 33)
TORSO[34:36, 17:34, 3] = 0  # pangkal paha milik ruas paha
L1, L2 = 1.5, 2.0  # paha (pinggul 33→lutut 35), betis (lutut→telapak 37) sesuai sprite
ARMB = ARM.copy(); ARMB[..., :3] = (ARMB[..., :3] * .82).astype(np.uint8)  # lengan belakang (sedikit lebih gelap), hanya saat dua tangan
SW, SWG = A.sword_img()
HIP, NECK, SHO, HAND, HPB, HPF = (25, 33), (25, 23), (21, 25), (21, 31), (21, 33), (28, 33)

def rot(px, py, cx, cy, ang):  # putar titik (koordinat layar, sudut CCW layar)
    r = math.radians(ang); x, y = px - cx, py - cy
    return cx + x * math.cos(r) + y * math.sin(r), cy - x * math.sin(r) + y * math.cos(r)

def blit(cv, img, piv, ang, at):
    """tempel img diputar ang° (RotSprite) di titik piv-nya, sehingga piv jatuh di 'at' (kanvas)"""
    if not img[..., 3].any(): return
    pad = int(max(img.shape[:2])); big = np.zeros((img.shape[0] + 2 * pad, img.shape[1] + 2 * pad, 4), np.uint8)
    big[pad:pad + img.shape[0], pad:pad + img.shape[1]] = img; pv = (piv[0] + pad, piv[1] + pad)
    if abs(ang) > .5:
        s8 = A.scale2x(A.scale2x(A.scale2x(big)))
        big = np.array(Image.fromarray(s8).rotate(ang, resample=Image.NEAREST, center=(pv[0] * 8 + 4, pv[1] * 8 + 4))
                       .resize((big.shape[1], big.shape[0]), Image.NEAREST))
    ys, xs = np.nonzero(big[..., 3] > 128); ty = ys - pv[1] + round(at[1]); tx = xs - pv[0] + round(at[0])
    ok = (ty >= 0) & (ty < CH) & (tx >= 0) & (tx < CW); cv[ty[ok], tx[ok]] = big[ys[ok], xs[ok]]

def pose_points(P):
    hx, hy = BASE[0] + P['dx'], BASE[1] + P['dy']
    to = lambda p: (hx + p[0] - HIP[0], hy + p[1] - HIP[1])
    t = P['t']
    sho = rot(*to(SHO), hx, hy, t); hand = rot(sho[0] + HAND[0] - SHO[0], sho[1] + HAND[1] - SHO[1], *sho, P['a'] + t)
    return (hx, hy), sho, hand

GROUND = BASE[1] + 4  # telapak sprite samping di baris 37 (pinggul 33)
def ang_of(dx, dy): return math.degrees(math.atan2(dx, dy))  # sudut CCW yang memutar arah 'bawah' ke (dx, dy)
def leg_ik(cv, TH, SH, hp, at, la, P):
    hx, hy = at; reach = L1 + L2
    # target pergelangan: di tanah (jarak langkah dari sudut kaki la) bila menapak; saat di udara: kaki terlipat
    if P['dy'] > -2:
        fx = hx - math.sin(math.radians(la)) * (reach + 1.5); fy = GROUND - .5
    else:
        fx = hx - math.sin(math.radians(la)) * reach * .7 + 1; fy = hy + reach * .7
    dx, dy = fx - hx, fy - hy; d = min(math.hypot(dx, dy), reach - .01)
    base = math.atan2(dy, dx); k = math.acos(max(-1, min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))))
    th = base - k  # lutut menekuk ke depan (arah hadap +x)
    kx, ky = hx + math.cos(th) * L1, hy + math.sin(th) * L1
    a1 = ang_of(kx - hx, ky - hy); a2 = ang_of(fx - kx, fy - ky) if math.hypot(fx - kx, fy - ky) > .1 else a1
    a1 = max(-45, min(45, a1)); a2 = max(-40, min(40, a2))  # kaki kecil: tekukan dibatasi agar tidak terpuntir
    kx, ky = rot(hx, hy + L1, hx, hy, a1)
    knee_src = (hp[0], hp[1] + 2)
    blit(cv, TH, hp, a1, (hx, hy))
    tmp = np.zeros_like(cv); blit(tmp, SH, knee_src, a2, (kx, ky)); ys = np.nonzero(tmp[..., 3] > 128)[0]
    if len(ys) and P['dy'] > -2:  # menapak: telapak ditempel ke garis tanah (maks ±3 px)
        sh = int(max(-3, min(3, GROUND - ys.max()))); tmp = np.roll(tmp, sh, axis=0)
    m = tmp[..., 3] > 128; cv[m] = tmp[m]
def fix_ground(P):
    P = dict(P); P['dy'] = min(P['dy'], 2)  # jongkok maks 2 px (lutut menekuk lewat IK, telapak tetap di tanah)
    (hx, hy), sho, hand = pose_points(P)
    for _ in range(40):
        tx, ty = tip_of(hand, P['a'] + P['t'] + P['w'])
        if ty <= GROUND + (2 if P.get('slam') else -1): break
        ang = P['a'] + P['t'] + P['w']  # putar ke arah yang membawa ujung ke DEPAN (x lebih besar), bukan ke belakang
        P['w'] += 4 if tip_of(hand, ang + 4)[0] >= tip_of(hand, ang - 4)[0] else -4
    return P

def draw(P):
    P = fix_ground(P)
    cv = np.zeros((CH, CW, 4), np.uint8); t = P['t']
    (hx, hy), sho, hand = pose_points(P); to = lambda p: (hx + p[0] - HIP[0], hy + p[1] - HIP[1])
    sw_ang = P['a'] + t + P['w']
    behind = 150 < (sw_ang % 360) < 260  # pedang di belakang kepala
    # lengan belakang: dua tangan → ikut sudut lengan depan; selain itu mengimbangi
    raised = 60 < ((P['a'] + t) % 360) < 260  # lengan terangkat di atas bahu → digambar di belakang kepala (wajah tidak tertutup)
    if P.get('two'): blit(cv, ARMB, SHO, P['a'] + t - 6, (sho[0] - 1, sho[1]))  # tangan kedua ikut menggenggam
    if behind or raised: blit(cv, SW, SWG, sw_ang, hand)
    for TH, SH, hp, la in ((THB, SHB, HPB, P['lb']), (THF, SHF, HPF, P['lf'])): leg_ik(cv, TH, SH, hp, to(hp), la, P)
    blit(cv, TORSO, HIP, t, (hx, hy))  # badan menutupi pangkal kedua kaki
    neck = rot(*to(NECK), hx, hy, t)
    if raised: blit(cv, ARM, SHO, P['a'] + t, sho)
    blit(cv, HEAD, NECK, t * .5 + P.get('ht', 0), (neck[0] + P.get('hx', 0), neck[1] + P.get('hy', 0)))
    if not raised: blit(cv, ARM, SHO, P['a'] + t, sho)
    if not (behind or raised): blit(cv, SW, SWG, sw_ang, hand)
    return Image.fromarray(cv), hand, sw_ang, P

def tip_of(hand, ang, L=len(A.SWORD) - 4): return rot(hand[0], hand[1] + L, hand[0], hand[1], ang)

READY = dict(a=30, w=80, t=4, dx=0, dy=1, lf=-8, lb=10, fdx=2, bdx=-2)  # kuda-kuda: pedang condong ke depan-atas, lutut tekuk
def K(ms, smear=False, **kw):
    p = dict(READY); p.update(kw); p['ms'] = ms; p['smear'] = smear; return p
# tiap jurus: daftar kunci-pose (ms = lama menuju pose ini). Tebasan = 1–2 kunci cepat dengan coretan.
MOVES = [
    ('1 Tebas Turun', [K(160, a=175, w=45, t=-10, dy=0, lf=-15, fdx=0, ht=4), K(50, True, a=95, w=10, t=6, dx=3),
                       K(50, True, a=25, w=-25, t=14, dx=5, dy=2, lf=-28, fdx=6, lb=22), K(140, a=12, w=-35, t=16, dx=5, dy=2, lf=-28, fdx=6, lb=22)]),
    ('2 Tebas Balik', [K(90, a=0, w=-50, t=18, dx=5, dy=2, lf=-28, fdx=6, lb=22), K(50, True, a=100, w=30, t=0, dx=6),
                       K(50, True, a=165, w=60, t=-10, dx=7, dy=0), K(150, a=178, w=70, t=-12, dx=7, ht=-3)]),
    ('3 Tebas Datar', [K(130, a=-40, w=-60, t=-8, dx=5), K(45, True, a=40, w=-40, t=6, dx=8),
                       K(45, True, a=110, w=-10, t=12, dx=10), K(140, a=130, w=0, t=12, dx=10)]),
    ('4 Tusukan', [K(150, a=60, w=30, t=-6, dx=6, lf=-5, fdx=0), K(45, True, a=88, w=2, t=10, dx=15, lf=-35, fdx=8, lb=30, bdx=-4),
                   K(160, a=90, w=0, t=10, dx=16, lf=-35, fdx=8, lb=30, bdx=-4)]),
    ('5 Putaran', [K(110, a=90, w=0, t=0, dx=16, spin=1), K(380, a=90, w=0, t=0, dx=18, spin=1, smear=True), K(120, a=110, w=20, dx=18)]),
    ('6 Kibasan Ganda', [K(80, a=150, w=50, t=-6, dx=18), K(45, True, a=40, w=-30, t=12, dx=20, lf=-20, fdx=4),
                         K(60, a=30, w=-45, t=12, dx=20, lf=-20, fdx=4), K(45, True, a=150, w=55, t=-8, dx=21), K(120, a=160, w=60, t=-8, dx=21)]),
    ('7 Lompat Tebas', [K(150, a=40, w=20, t=8, dx=21, dy=5, lf=-30, lb=30, fdx=2, bdx=-2), K(110, a=190, w=40, t=-12, dx=24, dy=-14, lf=-40, lb=-20, fdx=2, ht=3),
                        K(70, a=200, w=50, t=-14, dx=26, dy=-15, lf=-40, lb=-20, fdx=2),
                        K(45, True, a=60, w=-10, t=14, dx=28, dy=-4, lf=-10, lb=10), K(60, True, a=15, w=-40, t=18, dx=29, dy=5, lf=-30, lb=30, fdx=5, bdx=-3),
                        K(150, a=10, w=-45, t=18, dx=29, dy=5, lf=-30, lb=30, fdx=5, bdx=-3)]),
    ('8 Sapuan Rendah', [K(120, a=-50, w=-20, t=20, dx=29, dy=6, lf=-35, lb=35, fdx=6, bdx=-5, hy=1), K(45, True, a=40, w=-45, t=24, dx=31, dy=7, lf=-35, lb=35, fdx=6, bdx=-5),
                         K(45, True, a=110, w=-50, t=24, dx=33, dy=7, lf=-35, lb=35, fdx=6, bdx=-5), K(150, a=125, w=-40, t=20, dx=33, dy=6, lf=-35, lb=35, fdx=6, bdx=-5)]),
    ('9 Terjangan', [K(140, a=70, w=25, t=-4, dx=30, dy=2), K(40, True, a=90, w=0, t=12, dx=44, lf=-35, fdx=8, lb=35, bdx=-5, ghost=1),
                     K(40, True, a=90, w=0, t=12, dx=56, lf=-35, fdx=8, lb=35, bdx=-5, ghost=1), K(160, a=92, w=-2, t=10, dx=58, lf=-35, fdx=8, lb=35, bdx=-5)]),
    ('10 Hantaman Akhir', [K(170, a=170, w=20, t=-12, dx=58, dy=-3, two=1, ht=4, lf=-15, lb=15),
                           K(130, a=178, w=25, t=-14, dx=60, dy=-9, two=1, lf=-30, lb=-10),
                           K(45, True, a=120, w=0, t=8, dx=64, dy=-3, two=1, lf=-25, lb=20),
                           K(45, True, a=48, w=-6, t=18, dx=68, dy=3, two=1, lf=-35, lb=35, slam=1),
                           K(320, a=44, w=-8, t=20, dx=68, dy=3, two=1, lf=-35, lb=35, slam=2), K(240, **(READY | {'dx': 68}))]),
]

def lerp(p, q, u):
    o = {}
    for k in set(p) | set(q):
        a, b = p.get(k, READY.get(k, 0)), q.get(k, READY.get(k, 0))
        o[k] = a + (b - a) * u if isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) else b
    return o
def ease(u): return u * u * (3 - 2 * u)

frames = []  # (gambar, durasi)
CHECK = []
cur = dict(READY); cur['ms'] = 0; prev_tip = None; ghosts = []
for name, keys in MOVES:
    for kp in keys:
        steps = max(1, round(kp['ms'] / 45)) if not kp.get('spin') else 9
        for s in range(1, steps + 1):
            u = s / steps; P = lerp(cur, kp, ease(u) if not kp['smear'] else u)
            P['dx'] *= .35  # kamera mengikuti pelan (Arka tetap maju, tidak lompat posisi)
            img, hand, sang, P = draw(P)
            if kp.get('spin') and .3 < u < .7:  # setengah putaran: badan berbalik (cermin di sumbu pinggul)
                arr = np.array(img); hx0 = round(BASE[0] + P['dx']); out = np.zeros_like(arr)
                for x in range(CW):
                    mx = 2 * hx0 - x
                    if 0 <= mx < CW: out[:, x] = arr[:, mx]
                img = Image.fromarray(out); hand = None
            layer = Image.new('RGBA', (CW, CH)); d = ImageDraw.Draw(layer)
            hx, hy = BASE[0] + P['dx'], BASE[1] + max(P['dy'], 0)
            sh = 9 - min(5, max(0, -P['dy']) * .4)
            d.ellipse((hx - sh, GROUND - 1, hx + sh, GROUND + 3), fill=(18, 28, 14, 120))
            for g in ghosts: layer.alpha_composite(g)
            if kp['smear'] and hand is not None and prev_tip is not None:  # coretan bilah: bidang antara pose pedang sebelumnya & sekarang
                (ph, pa) = prev_tip; poly = []
                for j in range(7):
                    v = j / 6; poly.append(tip_of((ph[0] + (hand[0] - ph[0]) * v, ph[1] + (hand[1] - ph[1]) * v), pa + (sang - pa) * v))
                for j in range(6, -1, -1):
                    v = j / 6; poly.append(tip_of((ph[0] + (hand[0] - ph[0]) * v, ph[1] + (hand[1] - ph[1]) * v), pa + (sang - pa) * v, 7))
                d.polygon(poly, fill=(225, 240, 255, 150)); d.line(poly[:7], fill=(255, 255, 255, 235), width=2)
            if kp.get('spin') and kp['smear']:  # sapuan melingkar setinggi pedang (pinggang)
                r = 30; cy = BASE[1] - 12 + P['dy']; cx = BASE[0] + P['dx']
                d.arc((cx - r, cy - r * .35, cx + r, cy + r * .35), -90, -90 + 360 * u, fill=(235, 245, 255, 210), width=3)
            layer.alpha_composite(img)
            if P.get('slam'):
                k = min(1, s / steps) if kp.get('slam') == 1 else 1; d2 = ImageDraw.Draw(layer)
                tx, ty = tip_of(hand, sang); r = 8 + 18 * (u if kp.get('slam') == 2 else 0)
                d2.ellipse((tx - r, GROUND - r * .32, tx + r, GROUND + r * .32), outline=(255, 240, 190, int(255 * (1 - u * .8))), width=2)
                for j in range(10):
                    a2 = j * .63 + u; d2.point((tx + math.cos(a2) * r * 1.1, GROUND - 1 - abs(math.sin(a2)) * 10 * (1 - u)), fill=(196, 160, 110, 255))
            if P.get('ghost'): gc = img.copy(); arr = np.array(gc); arr[..., 3] = (arr[..., 3] * .35).astype(np.uint8); arr[..., :3] = (arr[..., :3] * .5 + 120).astype(np.uint8); ghosts = (ghosts + [Image.fromarray(arr)])[-2:]
            else: ghosts = []
            frames.append((layer, kp['ms'] / steps, name, bool(P.get('slam')) and kp.get('slam') == 1 and s == steps)); CHECK.append((name, P, kp.get('spin')))
            if hand is not None: prev_tip = (hand, sang)
        cur = dict(kp)

# ── pemeriksaan anatomi tiap frame (tanpa efek): satu tubuh utuh, telapak di tanah, pedang di atas tanah, wajah terlihat ──
def components(m):
    seen = np.zeros_like(m); n = 0; H, W = m.shape
    for y0, x0 in zip(*np.nonzero(m)):
        if seen[y0, x0]: continue
        n += 1; st = [(y0, x0)]; seen[y0, x0] = 1
        while st:
            y, x = st.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and m[yy, xx] and not seen[yy, xx]: seen[yy, xx] = 1; st.append((yy, xx))
    return n
SWsave = SW.copy(); bad = []
EYE = HEAD[..., 2].astype(int) - HEAD[..., 0] > 60  # piksel mata biru di potongan kepala
for i, (name, P, spin) in enumerate(CHECK):
    SW[...] = 0; body, hand, sang, Q = draw(P); SW[...] = SWsave
    m = np.array(body)[..., 3] > 128; ys = np.nonzero(m)[0]
    msg = []
    if components(m) > 1: msg.append('bagian lepas')
    if Q['dy'] >= 0 and ys.max() > GROUND + 1: msg.append('telapak tenggelam %d' % (ys.max() - GROUND))
    tx, ty = tip_of(hand, sang)
    if ty > GROUND + 3: msg.append('pedang tembus tanah')
    SW[...] = 0; full = np.array(draw(P)[0]); SW[...] = SWsave  # yang diperiksa: lengan/badan, bukan pedang yang lewat
    head_only = np.zeros((CH, CW, 4), np.uint8); (hx, hy), _, _ = pose_points(Q); to = (hx + NECK[0] - HIP[0], hy + NECK[1] - HIP[1])
    neck = rot(*to, hx, hy, Q['t']); blit(head_only, np.where(EYE[..., None], HEAD, 0).astype(np.uint8), NECK, Q['t'] * .5 + Q.get('ht', 0), (neck[0] + Q.get('hx', 0), neck[1] + Q.get('hy', 0)))
    em = head_only[..., 3] > 0
    if em.sum() and not spin and (np.abs(full[em][:, :3].astype(int) - head_only[em][:, :3]).sum(1) > 30).mean() > .5: msg.append('wajah tertutup')
    if msg: bad.append((i, name, msg))
print('PERIKSA', len(CHECK), 'frame;', len(bad), 'bermasalah')
if os.environ.get('DBG'):  # simpan frame bermasalah, tiap potongan terpisah diwarnai beda
    for i, name, msg in bad[:8]:
        SW[...] = 0; body = np.array(draw(CHECK[i][1])[0]); SW[...] = SWsave
        Image.fromarray(body).resize((CW * 4, CH * 4), Image.NEAREST).save(os.path.join(OUT, 'dbg_%03d.png' % i))
for b in bad[:40]: print('  frame', b[0], b[1], ', '.join(b[2]))

S = 4; gif, dur = [], []
for img, ms, name, flash in frames:
    bg = Image.new('RGBA', (CW, CH + 12), (70, 108, 52, 255)); d = ImageDraw.Draw(bg)
    for gy in range(CH + 12 - 22, CH + 12, 3): d.line((0, gy, CW, gy), fill=(64, 100, 48, 255))
    shake = 2 if flash else 0
    bg.alpha_composite(img, (shake, 12)); d = ImageDraw.Draw(bg); d.rectangle((0, 0, CW, 11), fill=(26, 20, 12, 255)); d.text((4, 0), name, fill=(255, 236, 170, 255))
    if flash: bg = Image.blend(bg, Image.new('RGBA', bg.size, (255, 255, 240, 255)), .45)
    gif.append(bg.resize((CW * S, (CH + 12) * S), Image.NEAREST).convert('RGB')); dur.append(max(30, int(ms)))
dur[-1] = 900
gif[0].save(os.path.join(OUT, 'arka_combo2.gif'), save_all=True, append_images=gif[1:], duration=dur, loop=0)
print('ok', len(gif), 'frame', sum(dur), 'ms')
# video MP4 (selalu bisa diputar di HP): tiap frame diulang sesuai durasinya pada 60 fps
import subprocess, tempfile
tmp = tempfile.mkdtemp(); k = 0
for im, ms in zip(gif, dur):
    for _ in range(max(1, round(ms / 16.67))): im.save(os.path.join(tmp, '%05d.png' % k)); k += 1
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(tmp, '%05d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-crf', '18', os.path.join(OUT, 'arka_combo2.mp4')], check=True)
print('mp4', os.path.join(OUT, 'arka_combo2.mp4'))
