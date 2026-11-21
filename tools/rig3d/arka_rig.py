# Contoh pipeline "3D → sprite pixel art" (cara Dead Cells): karakter low-poly dengan rangka sendi,
# animasi dikunci di sendi (pedang menempel di tangan → selalu konsisten), dirender 8 arah dari kamera isometrik.
# Jalankan:  /tmp/bv/bin/python tools/rig3d/arka_rig.py OUT_DIR
# Hasil: OUT_DIR/raw/<anim>_<arah>_<frame>.png (RGBA 64×64) → diolah tools/rig3d/pixelize.py
import bpy, math, sys, os
from mathutils import Vector

OUT = sys.argv[-1] if len(sys.argv) > 1 else '/tmp/rig3d'
os.makedirs(os.path.join(OUT, 'raw'), exist_ok=True)
R = math.radians

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, rgb, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = 1.0
    if emit: b.inputs['Emission Color'].default_value = (*rgb, 1); b.inputs['Emission Strength'].default_value = emit
    return m

def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)  # sRGB → linear

M = {k: mat(k, hexc(v)) for k, v in {
    'skin': '#f2c49b', 'hair': '#7a4a26', 'tunic': '#3f6fc4', 'tunicDk': '#2c4f94', 'belt': '#6b4423',
    'pants': '#5a4636', 'boot': '#4a3020', 'steel': '#d8dde6', 'hilt': '#a8742c', 'eye': '#1d1a24'}.items()}

def empty(name, parent, loc):
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e)
    e.parent = parent; e.location = loc; e.rotation_mode = 'XYZ'; return e

def box(name, parent, size, loc, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object; o.name = name; o.scale = size; o.location = loc
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = 2
    o.data.materials.append(m); o.parent = parent; return o

def cyl(name, parent, r, h, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=r, depth=h)
    o = bpy.context.active_object; o.name = name; o.location = loc; o.rotation_euler = rot
    o.data.materials.append(m); o.parent = parent; return o

# ── rangka (sendi = empty; potongan tubuh menempel di sendinya) ──
root = empty('root', None, (0, 0, 0))
hips = empty('hips', root, (0, 0, 0.62))  # proporsi chibi ala Arka: kepala besar, kaki pendek
chest = empty('chest', hips, (0, 0, 0.05))
head = empty('head', chest, (0, 0, 0.4))
sh = {s: empty('sh' + s, chest, (0.25 * k, 0, 0.32)) for s, k in (('L', 1), ('R', -1))}
el = {s: empty('el' + s, sh[s], (0, 0, -0.17)) for s in 'LR'}
hand = {s: empty('hand' + s, el[s], (0, 0, -0.16)) for s in 'LR'}
hp = {s: empty('hp' + s, hips, (0.11 * k, 0, -0.02)) for s, k in (('L', 1), ('R', -1))}
kn = {s: empty('kn' + s, hp[s], (0, 0, -0.28)) for s in 'LR'}

# ── tubuh (karakter menghadap −Y) ──
box('torso', chest, (0.44, 0.28, 0.36), (0, 0, 0.16), M['tunic'], 0.05)
box('skirt', hips, (0.44, 0.27, 0.16), (0, 0, -0.02), M['tunicDk'], 0.03)
box('belt', hips, (0.45, 0.28, 0.06), (0, 0, 0.07), M['belt'])
box('headM', head, (0.56, 0.5, 0.52), (0, 0, 0.2), M['skin'], 0.09)
box('hairTop', head, (0.62, 0.56, 0.2), (0, 0.02, 0.45), M['hair'], 0.08)
box('hairBack', head, (0.62, 0.18, 0.46), (0, 0.2, 0.25), M['hair'], 0.06)
box('fringe', head, (0.58, 0.08, 0.14), (0, -0.25, 0.38), M['hair'], 0.03)
for s, k in (('L', 1), ('R', -1)):
    box('eye' + s, head, (0.08, 0.02, 0.12), (0.12 * k, -0.255, 0.18), M['eye'])
    cyl('uarm' + s, sh[s], 0.075, 0.17, (0, 0, -0.085), M['tunic'])
    cyl('farm' + s, el[s], 0.065, 0.16, (0, 0, -0.08), M['skin'])
    box('fist' + s, hand[s], (0.12, 0.12, 0.12), (0, 0, -0.03), M['skin'], 0.03)
    cyl('thigh' + s, hp[s], 0.1, 0.28, (0, 0, -0.14), M['pants'])
    cyl('shin' + s, kn[s], 0.095, 0.26, (0, 0, -0.13), M['boot'])
    box('foot' + s, kn[s], (0.15, 0.24, 0.09), (0, -0.05, -0.27), M['boot'], 0.03)
# pedang: anak sendi tangan kanan → selalu tergenggam
sw = empty('sword', hand['R'], (0, 0, -0.04))
box('grip', sw, (0.04, 0.04, 0.14), (0, 0, 0), M['hilt'])
box('guard', sw, (0.24, 0.06, 0.05), (0, 0, -0.08), M['hilt'])
box('blade', sw, (0.09, 0.03, 0.55), (0, 0, -0.37), M['steel'])
sw.rotation_euler = (R(-90), 0, 0)  # bilah mengarah ke depan saat lengan turun

# ── animasi (pose per frame lewat sudut sendi) ──
def pose(**a):
    for o in (hips, chest, head, *sh.values(), *el.values(), *hp.values(), *kn.values()): o.rotation_euler = (0, 0, 0)
    hips.location = (0, 0, 0.62 + a.get('bob', 0))
    for k, v in a.items():
        if k == 'bob': continue
        o = bpy.data.objects[k]; o.rotation_euler = tuple(R(x) for x in v)

def idle(t):
    b = math.sin(t * 2 * math.pi)
    pose(bob=0.012 * b, chest=(2 * b, 0, 0), shL=(4, 0, 8), shR=(-10, 0, -8), elR=(-35, 0, 0), elL=(-10, 0, 0))

def run(t):
    s, c = math.sin(t * 2 * math.pi), math.cos(t * 2 * math.pi)
    pose(bob=0.045 * abs(c) - 0.02, chest=(12, 0, 6 * s),
         hpL=(-45 * s, 0, 0), hpR=(45 * s, 0, 0), knL=(max(0, 70 * c), 0, 0), knR=(max(0, -70 * c), 0, 0),
         shL=(40 * s, 0, 8), shR=(-40 * s, 0, -8), elL=(-55, 0, 0), elR=(-60, 0, 0))

def slash(t):  # angkat (0–.35) → tebas menyilang (.35–.6) → tahan/kembali
    if t < .35: k = t / .35; arm = (-150 * k, 0, -30 * k); tw = 25 * k; lean = -5 * k
    elif t < .6: k = (t - .35) / .25; arm = (-150 + 200 * k, 0, -30 + 75 * k); tw = 25 - 70 * k; lean = 15 * k
    else: k = (t - .6) / .4; arm = (50 - 40 * k, 0, 45 - 30 * k); tw = -45 + 30 * k; lean = 15 - 10 * k
    pose(chest=(lean, 0, tw), shR=arm, elR=(-20, 0, 0), shL=(20, 0, 20), elL=(-40, 0, 0), hpL=(-25, 0, 0), knL=(20, 0, 0), hpR=(15, 0, 0))

ANIMS = {'idle': (idle, 4), 'run': (run, 8), 'slash': (slash, 6)}

# ── kamera isometrik ortografis + cahaya ──
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.35
d = 10; cam.location = (d * math.sin(R(45)), -d * math.cos(R(45)), d * math.tan(R(30)) + 0.75)
cam.rotation_euler = (R(60), 0, R(45))
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 3.2; sun.rotation_euler = (R(40), R(-25), R(20))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.6, 0.7, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9

sc.render.engine = 'CYCLES'; sc.cycles.samples = 12; sc.cycles.device = 'CPU'
sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = 72
sc.render.filter_size = 0.01  # piksel tajam (tanpa anti-alias)
sc.view_settings.view_transform = 'Standard'

# 8 arah: S, SW, W, NW, N, NE, E, SE (relatif layar isometrik); karakter diputar, kamera tetap
DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se']
for di, dn in enumerate(DIRS):
    root.rotation_euler = (0, 0, R(45 + 45 * di))  # +45: "s" = menghadap kamera di layar
    for an, (fn, n) in ANIMS.items():
        for f in range(n):
            fn(f / n); bpy.context.view_layer.update()
            sc.render.filepath = os.path.join(OUT, 'raw', f'{an}_{dn}_{f}.png')
            bpy.ops.render.render(write_still=True)
print('SELESAI', OUT)
