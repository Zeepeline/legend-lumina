# Arka 3D dari sprite aslinya: tampak depan/samping/belakang (assets/img/hero/hero_arka.png) → model voxel (irisan siluet),
# warna tiap sisi diambil langsung dari piksel sprite; dipotong per bagian (kepala, badan, lengan, kaki) dan dipasang di rangka sendi;
# pedang anak sendi tangan kanan. Dirender 8 arah isometrik.  Jalankan: /tmp/bv/bin/python tools/rig3d/arka_voxel.py OUT
import bpy, math, sys, os
import numpy as np
from PIL import Image

OUT = sys.argv[-1] if len(sys.argv) > 1 else '/tmp/rig3dv'
os.makedirs(os.path.join(OUT, 'raw'), exist_ok=True)
SHEET = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'img', 'hero', 'hero_arka.png')
R = math.radians
FW, FH = 48, 40

def frame(row, col=0):
    im = Image.open(SHEET).convert('RGBA').crop((col * FW, row * FH, col * FW + FW, row * FH + FH))
    a = np.array(im); m = a[..., 3] > 128
    ys, xs = np.nonzero(m); return a, m, xs.min(), xs.max(), ys.min(), ys.max()

FR, BK, SD = frame(0), frame(2), frame(4)  # idle_down, idle_up, idle_side (menghadap kanan)
H = FR[5] - FR[4] + 1  # tinggi tokoh (piksel)
cxF = (FR[2] + FR[3]) / 2; cxB = (BK[2] + BK[3]) / 2; cxS = (SD[2] + SD[3]) / 2

def at(F, col, z):  # piksel frame F pada kolom col & ketinggian z (0 = telapak kaki)
    a, m, x0, x1, y0, y1 = F; r = y1 - z
    if r < 0 or r >= FH or col < 0 or col >= FW: return None
    return a[r, col] if m[r, col] else None

xr = range(int(min(FR[2] - cxF, -(BK[3] - cxB))) - 1, int(max(FR[3] - cxF, -(BK[2] - cxB))) + 2)
yr = range(int(-(SD[3] - cxS)) - 1, int(-(SD[2] - cxS)) + 2)
def front(x, z): return at(FR, int(round(x + cxF)), z)
def back(x, z): return at(BK, int(round(cxB - x)), z)
def side(y, z): return at(SD, int(round(cxS - y)), z)  # kolom kanan sprite = depan (−Y)

vox = set()
for z in range(H):
    for x in xr:
        if front(x, z) is None and back(x, z) is None: continue
        for y in yr:
            if side(y, z) is not None: vox.add((x, y, z))

# bulatkan kepala & badan (superelipsoid di dalam siluet) → tidak kotak dari sudut diagonal
def round_part(z0, z1, p=2.6):
    ks = [v for v in vox if z0 <= v[2] < z1]
    if not ks: return
    xs = [v[0] for v in ks]; ys = [v[1] for v in ks]
    cx, cy, cz = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, (z0 + z1) / 2
    ax, ay, az = (max(xs) - min(xs)) / 2 + .8, (max(ys) - min(ys)) / 2 + .8, (z1 - z0) / 2 + .8
    for v in ks:
        if abs((v[0] - cx) / ax) ** p + abs((v[1] - cy) / ay) ** p + abs((v[2] - cz) / az) ** p > 1.25: vox.discard(v)
# bagian tubuh (proporsi chibi Arka): kaki < LEG, badan < HEAD, kepala ≥ HEAD; lengan = kolom luar pada pita badan
LEG = int(H * .22); HEAD = int(H * .47)
round_part(HEAD, H, 2.4); round_part(LEG, HEAD, 3.2)
tor = [x for (x, y, z) in vox if LEG <= z < HEAD]
TX = (max(abs(min(tor)), abs(max(tor))))  # setengah lebar badan+lengan
ARMX = TX - 3
def part(x, y, z):
    if z >= HEAD: return 'head'
    if z < LEG: return 'legL' if x > 0 else 'legR'
    if x >= ARMX: return 'armL'
    if x <= -ARMX: return 'armR'
    return 'torso'

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
mat = bpy.data.materials.new('vox'); mat.use_nodes = True
nt = mat.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 1
at_ = nt.nodes.new('ShaderNodeAttribute'); at_.attribute_name = 'col'
nt.links.new(at_.outputs['Color'], bs.inputs['Base Color'])
nt.links.new(at_.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = .55

def lin(c): return [((v / 255 + .055) / 1.055) ** 2.4 if v / 255 > .04045 else v / 255 / 12.92 for v in c[:3]] + [1]
DIRS6 = [((0, -1, 0), 'F'), ((0, 1, 0), 'B'), ((1, 0, 0), 'S'), ((-1, 0, 0), 'S'), ((0, 0, 1), 'T'), ((0, 0, -1), 'D')]
QUAD = {(0, -1, 0): [(0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)], (0, 1, 0): [(1, 1, 0), (0, 1, 0), (0, 1, 1), (1, 1, 1)],
        (1, 0, 0): [(1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)], (-1, 0, 0): [(0, 1, 0), (0, 0, 0), (0, 0, 1), (0, 1, 1)],
        (0, 0, 1): [(0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)], (0, 0, -1): [(0, 1, 0), (1, 1, 0), (1, 0, 0), (0, 0, 0)]}

def colour(x, y, z, k):
    c = {'F': front(x, z), 'B': back(x, z), 'S': side(y, z)}.get(k)
    if k == 'T': c = side(y, z) if side(y, z) is not None else front(x, z)
    if c is None: c = front(x, z) if front(x, z) is not None else (back(x, z) if back(x, z) is not None else side(y, z))
    if k == 'D' or c is None: c = (40, 30, 30, 255)
    return c

def build(name, keys, piv):
    verts, faces, cols = [], [], []
    for (x, y, z) in keys:
        for n, k in DIRS6:
            if (x + n[0], y + n[1], z + n[2]) in vox and part(x + n[0], y + n[1], z + n[2]) == name: continue
            b = len(verts); verts += [(x + a - piv[0] - .5, y + c - piv[1] - .5, z + d - piv[2]) for (a, c, d) in QUAD[n]]
            faces.append((b, b + 1, b + 2, b + 3)); cols.append(lin(colour(x, y, z, k)))
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    at = me.color_attributes.new('col', 'FLOAT_COLOR', 'CORNER')
    for i, f in enumerate(me.polygons):
        for li in f.loop_indices: at.data[li].color = cols[i]
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(mat); return o

def empty(name, parent, loc):
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e); e.parent = parent; e.location = loc; e.rotation_mode = 'XYZ'; return e

parts = {}
for v in vox: parts.setdefault(part(*v), []).append(v)
# sendi (koordinat voxel absolut) → empty bertingkat
J = {'hips': (0, 0, LEG), 'chest': (0, 0, LEG + 2), 'head': (0, 0, HEAD), 'shL': (ARMX, 0, HEAD - 2), 'shR': (-ARMX, 0, HEAD - 2),
     'hpL': (2, 0, LEG), 'hpR': (-2, 0, LEG)}
root = empty('root', None, (0, 0, 0))
hips = empty('hips', root, J['hips'])
chest = empty('chest', hips, (0, 0, 2))
head = empty('head', chest, (0, 0, HEAD - LEG - 2))
shL = empty('shL', chest, (ARMX, 0, HEAD - LEG - 4)); shR = empty('shR', chest, (-ARMX, 0, HEAD - LEG - 4))
hpL = empty('hpL', hips, (2, 0, 0)); hpR = empty('hpR', hips, (-2, 0, 0))
def attach(o, j, jabs): o.parent = j; o.location = (0, 0, 0)
for name, (j, ja) in {'head': (head, J['head']), 'torso': (chest, J['chest']), 'armL': (shL, J['shL']), 'armR': (shR, J['shR']),
                      'legL': (hpL, J['hpL']), 'legR': (hpR, J['hpR'])}.items():
    if name in parts: attach(build(name, parts[name], ja), j, ja)
# pedang (warna baja & gagang dari palet Arka), di ujung lengan kanan
low = min(z for (x, y, z) in parts['armR']) - (HEAD - 2)
hand = empty('handR', shR, (0, -0.5, low))
def bx(name, par, size, loc, rgb):
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.active_object; o.name = name; o.scale = size; o.location = loc
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = lin(rgb); b.inputs['Emission Color'].default_value = lin(rgb); b.inputs['Emission Strength'].default_value = .5
    o.data.materials.append(m); o.parent = par; return o
sw = empty('sword', hand, (0, 0, 0)); sw.rotation_euler = (R(-90), 0, 0)
bx('grip', sw, (1, 1, 3), (0, 0, 0), (120, 72, 40)); bx('guard', sw, (4, 1, 1), (0, 0, -2), (214, 170, 70))
bx('blade', sw, (1.4, .6, 11), (0, 0, -8), (220, 226, 236))

def pose(**a):
    for o in (hips, chest, head, shL, shR, hpL, hpR): o.rotation_euler = (0, 0, 0)
    hips.location = (0, 0, LEG + a.get('bob', 0))
    for k, v in a.items():
        if k != 'bob': bpy.data.objects[k].rotation_euler = tuple(R(t) for t in v)
def idle(t):
    b = math.sin(t * 2 * math.pi); pose(bob=.35 * max(0, b), shL=(3 * b, 0, 4), shR=(-25, 0, -4))
def run(t):
    s, c = math.sin(t * 2 * math.pi), math.cos(t * 2 * math.pi)
    pose(bob=.9 * abs(c), chest=(10, 0, 5 * s), hpL=(-40 * s, 0, 0), hpR=(40 * s, 0, 0), shL=(45 * s, 0, 6), shR=(-45 * s - 20, 0, -6))
def slash(t):
    if t < .35: k = t / .35; arm = (-160 * k, 0, -25 * k); tw = 25 * k
    elif t < .6: k = (t - .35) / .25; arm = (-160 + 220 * k, 0, -25 + 70 * k); tw = 25 - 70 * k
    else: k = (t - .6) / .4; arm = (60 - 50 * k, 0, 45 - 35 * k); tw = -45 + 35 * k
    pose(chest=(8, 0, tw), shR=arm, shL=(20, 0, 15), hpL=(-25, 0, 0), hpR=(15, 0, 0))
ANIMS = {'idle': (idle, 4), 'run': (run, 8), 'slash': (slash, 6)}

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 46
d = 200; cam.location = (d * math.sin(R(45)), -d * math.cos(R(45)), d * math.tan(R(20)) + H * .45)
cam.rotation_euler = (R(70), 0, R(45))  # 20° di atas cakrawala: wajah tampak seperti sprite asli
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 2.2; sun.rotation_euler = (R(40), R(-25), R(20))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (.6, .62, .7, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = .6
sc.render.engine = 'CYCLES'; sc.cycles.samples = 8; sc.cycles.device = 'CPU'
sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = 64; sc.render.filter_size = .01
sc.view_settings.view_transform = 'Standard'
DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se']
for di, dn in enumerate(DIRS):
    root.rotation_euler = (0, 0, R(45 + 45 * di))
    for an, (fn, n) in ANIMS.items():
        for f in range(n):
            fn(f / n); bpy.context.view_layer.update()
            sc.render.filepath = os.path.join(OUT, 'raw', f'{an}_{dn}_{f}.png'); bpy.ops.render.render(write_still=True)
print('SELESAI', OUT, 'voxel', len(vox), {k: len(v) for k, v in parts.items()})
