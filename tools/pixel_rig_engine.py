#!/usr/bin/env python3
"""
Pixel Rig & Slash Animation Engine (Penusbmic-style Procedural & Layered Pixel Rig)
Mengimplementasikan manipulasi pixel berlapis, Z-index swapping, simulasi inersia kabel/jubah,
smear arcs, dan snap-to-grid tanpa blur.

Keluaran:
- Spritesheet kombo 24 frame (PNG transparan)
- Animated GIF kombo 24 frame (85ms per frame / 11.75 FPS)
"""
import math, os
from PIL import Image

# Ukuran Kanvas Per Frame (lebar 72px, tinggi 52px untuk mengakomodasi topi lebar, tebasan panjang, dan petir tanah)
FW, FH = 96, 96
GROUND_Y = 70

# Palet Warna Murni
C_TRANS = (0, 0, 0, 0)
C_BLACK = (20, 22, 26, 255)       # Siluet utama jubah & topi
C_DARK = (40, 44, 54, 255)        # Lipatan kain & bayangan topi
C_WHITE = (255, 255, 255, 255)    # Mata, kabel, dan bilah pedang
C_CYAN = (100, 230, 255, 255)     # Energi petir & inti tebasan
C_DUST = (235, 235, 240, 255)     # Debu tanah
C_BG = (35, 26, 38, 255)
C_CYAN_CORE = (220, 255, 255, 255)
C_CYAN_BRIGHT = (0, 245, 255, 255)
C_CYAN_MID = (0, 160, 230, 255)
C_CYAN_DARK = (0, 80, 160, 220)
C_DUST_LIGHT = (225, 210, 190, 255)
          # Latar showcase (merah anggur ala tutorial)

def rotate_stamp(dst, spr, cx, cy, ang_rad, pivot):
    """Putar sprite dengan nearest-neighbor grid snap murni tanpa sub-pixel blur"""
    ca, sa = math.cos(ang_rad), math.sin(ang_rad)
    w, h = spr.size
    ext = int(math.hypot(w, h)) + 2
    for y in range(int(cy) - ext, int(cy) + ext + 1):
        for x in range(int(cx) - ext, int(cx) + ext + 1):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            u = dx * ca + dy * sa + pivot[0]
            v = -dx * sa + dy * ca + pivot[1]
            if 0 <= u < w and 0 <= v < h and 0 <= x < dst.width and 0 <= y < dst.height:
                p = spr.getpixel((int(u), int(v)))
                if p[3] > 100:
                    dst.putpixel((x, y), p)


def create_penusbmic_vfx(frame_idx):
    """
    Menghasilkan lapisan VFX (layer 'VFX') terpisah:
    Memakai siluet asli masterclass Penusbmic (735 px Attack 1 & 1525 px Attack 2):
    - F2: Authentic Penusbmic 735-pixel Attack 1 Crescent Slash (VFX_f26.png)
    - F3: Authentic Penusbmic Dissipation Trail (VFX_f27.png)
    - F8: Upward Diagonal Cross Slash (meniru anatomi tebasan Penusbmic bersudut -0.7 rad)
    - F9: Cross Slash Dissipation
    - F12: Overhead Katana Charging Glint
    - F13: Vertical In-Flight Smear
    - F14: Authentic Penusbmic 1525-pixel Giant Overhead Spiral Slam (VFX_f31.png)
    - F15: Authentic Penusbmic Ripple Dissipation (VFX_f32.png)
    - F16: Authentic Penusbmic Ripple 2 (VFX_f33.png)
    - F18..F20: Electric ground crawl
    - F23: The iconic Sheath Click & 4-Point Star Glint
    """
    im = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    C_WHITE = (255, 255, 255, 255)
    C_CYAN_HOT = (0, 245, 255, 255)
    C_CYAN_MID = (0, 160, 235, 255)
    C_CYAN_DEEP = (0, 80, 170, 220)
    C_DUST = (185, 165, 145, 255)
    C_DUST_LIGHT = (230, 215, 195, 255)

    # 1. SWIPE 1 (F0..F5)
    if frame_idx == 1:
        for sx, sy in [(20, 50), (22, 53), (18, 55), (23, 56)]:
            if 0 <= sx < FW and 0 <= sy < FH: im.putpixel((sx, sy), C_CYAN_DEEP)

    elif frame_idx == 2:
        # F2: AUTHENTIC PENUSBMIC ATTACK 1 CRESCENT SLASH (735 pixels)
        v26_path = '/tmp/penusbmic_cels/VFX_f26.png'
        if os.path.exists(v26_path):
            v26 = Image.open(v26_path)
            # Copy all white pixels
            for y in range(FH):
                for x in range(FW):
                    p = v26.getpixel((x, y))
                    if p[3] > 50:
                        im.putpixel((x, y), C_WHITE)
            # Add foot dust
            for dx, dy in [(23, 68), (24, 68), (25, 68), (22, 67), (25, 67)]:
                if 0 <= dx < FW and 0 <= dy < FH: im.putpixel((dx, dy), C_DUST)

    elif frame_idx == 3:
        # F3: AUTHENTIC PENUSBMIC DISSIPATION TRAIL (153 pixels)
        v27_path = '/tmp/penusbmic_cels/VFX_f27.png'
        if os.path.exists(v27_path):
            v27 = Image.open(v27_path)
            for y in range(FH):
                for x in range(FW):
                    p = v27.getpixel((x, y))
                    if p[3] > 50:
                        im.putpixel((x, y), C_WHITE)
        for dx, dy in [(24, 67), (25, 67)]:
            if 0 <= dx < FW and 0 <= dy < FH: im.putpixel((dx, dy), C_DUST_LIGHT)

    elif frame_idx == 4:
        for sx, sy in [(82, 45), (84, 48), (81, 51)]:
            if 0 <= sx < FW and 0 <= sy < FH: im.putpixel((sx, sy), C_WHITE)

    # 2. CROSS SLASH (F6..F11)
    elif frame_idx == 7:
        for sx, sy in [(25, 58), (27, 56), (29, 59)]:
            if 0 <= sx < FW and 0 <= sy < FH: im.putpixel((sx, sy), C_CYAN_DEEP)

    elif frame_idx == 8:
        # F8: UPWARD DIAGONAL CROSS SLASH (meniru busur sabit tebal Penusbmic)
        for t_step in range(130):
            t = t_step / 129.0
            cx = 26 + t * 50
            cy = 65 - t * 45 - 6.0 * math.sin(t * math.pi * 0.9)
            thick = 1.0 + t * 14.0 if t < 0.25 else (5.5 + 4.5 * math.sin((t - 0.25) / 0.45 * math.pi) if t < 0.7 else 5.5 * (1.0 - (t - 0.7) / 0.3 * 0.25))
            nx, ny = 0.55, 0.83
            for off in range(-int(thick * 0.45), int(thick * 0.65) + 1):
                px = int(cx + nx * off)
                py = int(cy + ny * off)
                if 0 <= px < FW and 0 <= py < FH:
                    im.putpixel((px, py), C_WHITE)

        # Sparks past tip (76, 20)
        for sx, sy in [(78, 18), (80, 17), (82, 19), (83, 21), (79, 15), (75, 14)]:
            if 0 <= sx < FW and 0 <= sy < FH: im.putpixel((sx, sy), C_WHITE)
        for dx, dy in [(28, 68), (29, 68), (30, 68)]:
            if 0 <= dx < FW and 0 <= dy < FH: im.putpixel((dx, dy), C_DUST)

    elif frame_idx == 9:
        for t_step in range(50, 125, 2):
            t = t_step / 129.0
            cx = int(26 + t * 50 + 1)
            cy = int(65 - t * 45 - 6.0 * math.sin(t * math.pi * 0.9) - 2)
            if 0 <= cx < FW and 0 <= cy < FH and (cx + cy) % 2 == 0:
                im.putpixel((cx, cy), C_WHITE)
        for sx, sy in [(79, 17), (82, 19), (84, 21), (77, 16)]:
            if 0 <= sx < FW and 0 <= sy < FH: im.putpixel((sx, sy), C_WHITE)

    elif frame_idx == 10:
        for sx, sy in [(81, 18), (83, 20), (76, 17)]:
            if 0 <= sx < FW and 0 <= sy < FH: im.putpixel((sx, sy), C_CYAN_DEEP)

    # 3. TWO-HANDED HEAVY SLAM (F12..F17)
    elif frame_idx == 12:
        gx, gy = 38, 20
        if 0 <= gx < FW and 0 <= gy < FH: im.putpixel((gx, gy), C_WHITE)
        for d in [-2, -1, 1, 2]:
            if 0 <= gx + d < FW: im.putpixel((gx + d, gy), C_WHITE)
            if 0 <= gy + d < FH: im.putpixel((gx, gy + d), C_WHITE)

    elif frame_idx == 13:
        for y in range(22, 60):
            vx = int(40 + (y - 22) * 0.35)
            if 0 <= vx < FW and 0 <= y < FH: im.putpixel((vx, y), C_WHITE)
            if 0 <= vx - 1 < FW and 0 <= y < FH: im.putpixel((vx - 1, y), C_WHITE)
            if 0 <= vx + 1 < FW and 0 <= y < FH: im.putpixel((vx + 1, y), C_WHITE)

    elif frame_idx == 14:
        # F14: AUTHENTIC PENUSBMIC ATTACK 2 GIANT SLAM (1525 pixels)
        v31_path = '/tmp/penusbmic_cels/VFX_f31.png'
        if os.path.exists(v31_path):
            v31 = Image.open(v31_path)
            for y in range(FH):
                for x in range(FW):
                    p = v31.getpixel((x, y))
                    if p[3] > 50:
                        im.putpixel((x, y), C_WHITE)

    elif frame_idx == 15:
        # F15: AUTHENTIC PENUSBMIC RIPPLE DISSIPATION
        v32_path = '/tmp/penusbmic_cels/VFX_f32.png'
        if os.path.exists(v32_path):
            v32 = Image.open(v32_path)
            for y in range(FH):
                for x in range(FW):
                    p = v32.getpixel((x, y))
                    if p[3] > 50:
                        im.putpixel((x, y), C_WHITE)

    elif frame_idx == 16:
        v33_path = '/tmp/penusbmic_cels/VFX_f33.png'
        if os.path.exists(v33_path):
            v33 = Image.open(v33_path)
            for y in range(FH):
                for x in range(FW):
                    p = v33.getpixel((x, y))
                    if p[3] > 50:
                        im.putpixel((x, y), C_WHITE)

    # 4. ELECTRIC CRAWL & THE ICONIC SHEATH CLICK (F18..F23)
    elif frame_idx == 18:
        bolts = [
            [(36, 44), (38, 42), (42, 43), (48, 48), (54, 55), (55, 62)],
            [(55, 63), (52, 65), (48, 64), (44, 65), (40, 65)],
            [(56, 63), (60, 65), (64, 64), (70, 65)]
        ]
        for b in bolts:
            for bx, by in b:
                if 0 <= bx < FW and 0 <= by < FH:
                    im.putpixel((bx, by), C_WHITE)
                    if 0 <= bx + 1 < FW: im.putpixel((bx + 1, by), C_WHITE)

    elif frame_idx == 19:
        bolts2 = [
            [(38, 65), (41, 64), (45, 65), (50, 64)],
            [(59, 64), (63, 65), (67, 64), (70, 65)],
            [(55, 56), (57, 54)]
        ]
        for b in bolts2:
            for bx, by in b:
                if 0 <= bx < FW and 0 <= by < FH: im.putpixel((bx, by), C_WHITE)

    elif frame_idx == 20:
        for px, py in [(40, 65), (48, 64), (62, 65), (66, 64)]:
            if 0 <= px < FW and 0 <= py < FH: im.putpixel((px, py), C_WHITE)

    elif frame_idx == 23:
        # F23: THE ICONIC SHEATH CLICK & 4-POINT STAR GLINT!
        gx, gy = 36, 54
        for dy in range(2):
            for dx in range(2):
                if 0 <= gx + dx < FW and 0 <= gy + dy < FH: im.putpixel((gx + dx, gy + dy), C_WHITE)
        for r in range(2, 7):
            if 0 <= gx - r < FW and 0 <= gy < FH: im.putpixel((gx - r, gy), C_WHITE)
            if 0 <= gx + 1 + r < FW and 0 <= gy < FH: im.putpixel((gx + 1 + r, gy), C_WHITE)
            if 0 <= gx < FW and 0 <= gy - r < FH: im.putpixel((gx, gy - r), C_WHITE)
            if 0 <= gx < FW and 0 <= gy + 1 + r < FH: im.putpixel((gx, gy + 1 + r), C_WHITE)
        for dx, dy in [(-1, -1), (2, -1), (-1, 2), (2, 2)]:
            if 0 <= gx + dx < FW and 0 <= gy + dy < FH: im.putpixel((gx + dx, gy + dy), C_WHITE)

    return im

class CyberRoninRig:
    def __init__(self):
        self.build_parts()
        # Inisialisasi node kabel inersia (5 node)
        self.cable_nodes = [[28.0, 22.0] for _ in range(6)]

    def build_parts(self):
        # 1. Hat (Topi Kasa Lebar Datar)
        hw, hh = 26, 7
        self.hat = Image.new('RGBA', (hw, hh), C_TRANS)
        # Brim (datar lebar)
        for y in range(3, 5):
            for x in range(hw):
                self.hat.putpixel((x, y), C_BLACK)
        # Knob puncak
        for y in range(3):
            for x in range(11, 15):
                self.hat.putpixel((x, y), C_BLACK)
        # Highlight tipis
        self.hat.putpixel((13, 3), C_DARK)
        self.hat.putpixel((14, 3), C_DARK)
        self.hat_pv = (13, 3)

        # 2. Katana
        sw, sh = 32, 6
        self.sword = Image.new('RGBA', (sw, sh), C_TRANS)
        # Gagang hitam (x=0..6)
        for y in range(2, 4):
            for x in range(0, 7):
                self.sword.putpixel((x, y), C_BLACK)
        # Pommel putih
        self.sword.putpixel((0, 2), C_WHITE)
        self.sword.putpixel((0, 3), C_WHITE)
        # Bilah putih menyala (x=7..31)
        for y in range(2, 4):
            for x in range(7, 32):
                self.sword.putpixel((x, y), C_WHITE)
        self.sword_pv = (5, 2.5) # Pivot di gagang

    def update_cable(self, anchor_x, anchor_y, vel_x, vel_y):
        """Simulasi inersia kabel verlet 6 node"""
        self.cable_nodes[0] = [anchor_x, anchor_y]
        seg_len = 2.4
        for i in range(1, len(self.cable_nodes)):
            # Inersia melawan pergerakan badan
            self.cable_nodes[i][0] -= vel_x * 0.35
            self.cable_nodes[i][1] -= vel_y * 0.35 + 0.2 # Sedikit tarikan gravitasi
            # Constraint jarak antar ruas
            dx = self.cable_nodes[i][0] - self.cable_nodes[i-1][0]
            dy = self.cable_nodes[i][1] - self.cable_nodes[i-1][1]
            dist = math.hypot(dx, dy)
            if dist > 0.001:
                scale = seg_len / dist
                self.cable_nodes[i][0] = self.cable_nodes[i-1][0] + dx * scale
                self.cable_nodes[i][1] = self.cable_nodes[i-1][1] + dy * scale

    def render_frame(self, params, bg_color=None, frame_idx=None):
        """
        params: dict berisi:
          - bx, by (pusat badan)
          - hx, hy (posisi kepala/topi relatif badan)
          - crouch (kedalaman merunduk)
          - sword_pos (sx, sy, ang, z_layer: 'front' atau 'back')
          - cloak_dir (arah kibaran jubah: -1 kiri, 1 kanan, 0 netral)
          - smear_arc: None atau list garis busur tebasan
          - dust: list titik debu
          - lightning: list garis petir
        """
        img = Image.new('RGBA', (FW, FH), bg_color or C_TRANS)
        bx = params.get('bx', 32)
        by = params.get('by', 30)
        crouch = params.get('crouch', 0)
        actual_by = by + crouch

        # Update kabel
        head_x = bx + params.get('hx', 0)
        head_y = actual_by - 12 + params.get('hy', 0)
        vx = params.get('vx', 0)
        vy = params.get('vy', 0)
        self.update_cable(head_x - 3, head_y + 4, vx, vy)

        sw = params.get('sword')
        # LAYER 1: SWORD (jika Z-layer == 'back')
        if sw and sw.get('z') == 'back':
            rotate_stamp(img, self.sword, sw['x'], sw['y'], sw['ang'], self.sword_pv)

        # LAYER 2: BODY & LEGS
        leg_l = bx - 4 - params.get('spread', 0)
        leg_r = bx + 4 + params.get('spread', 0)
        for y in range(int(actual_by + 4), GROUND_Y):
            for x in range(int(leg_l), int(leg_l + 3)):
                if 0 <= x < FW and 0 <= y < FH: img.putpixel((x, y), C_BLACK)
            for x in range(int(leg_r - 2), int(leg_r + 1)):
                if 0 <= x < FW and 0 <= y < FH: img.putpixel((x, y), C_BLACK)

        # LAYER 3: CLOAK (Jubah dengan Conservation of Mass)
        cloak_flow = params.get('cloak_flow', 0)
        for y in range(int(actual_by - 6), GROUND_Y - 1):
            progress = (y - (actual_by - 6)) / max(1, (GROUND_Y - 1 - (actual_by - 6)))
            w_left = 4 + progress * 5 - cloak_flow * 4
            w_right = 4 + progress * 5 + cloak_flow * 4
            for x in range(int(bx - w_left), int(bx + w_right)):
                if 0 <= x < FW and 0 <= y < FH:
                    # Shading lipatan
                    col = C_DARK if (x == int(bx - w_left) or x == int(bx + w_right - 1)) else C_BLACK
                    img.putpixel((x, y), col)

        # LAYER 4: CABLE (Kabel melengkung putih di belakang kepala)
        for i in range(len(self.cable_nodes) - 1):
            nx, ny = int(self.cable_nodes[i][0]), int(self.cable_nodes[i][1])
            if 0 <= nx < FW and 0 <= ny < FH:
                img.putpixel((nx, ny), C_WHITE)
                if nx + 1 < FW: img.putpixel((nx + 1, ny), C_WHITE)

        # LAYER 5: HEAD (Topi Kasa + Siluet Wajah + Mata Putih Kotak)
        # Siluet wajah di bawah topi
        for y in range(int(head_y + 2), int(head_y + 9)):
            for x in range(int(head_x - 3), int(head_x + 5)):
                if 0 <= x < FW and 0 <= y < FH: img.putpixel((x, y), C_BLACK)
        # Topi Kasa
        hat_tilt = params.get('hat_tilt', 0)
        rotate_stamp(img, self.hat, head_x, head_y + 3, hat_tilt, self.hat_pv)
        # Mata Putih Kotak Tunggal (2x3 pixel)
        eye_x = int(head_x + 1)
        eye_y = int(head_y + 4)
        for dy in range(3):
            for dx in range(2):
                px, py = eye_x + dx, eye_y + dy
                if 0 <= px < FW and 0 <= py < FH: img.putpixel((px, py), C_WHITE)

        # LAYER 6: SWORD (jika Z-layer == 'front')
        if sw and sw.get('z') != 'back':
            rotate_stamp(img, self.sword, sw['x'], sw['y'], sw['ang'], self.sword_pv)

        # LAYER 7: VFX (Smear Arc, Petir, Debu)
        vfx = params.get('vfx_cel')
        if vfx is None and frame_idx is not None:
            vfx = create_penusbmic_vfx(frame_idx)
        if vfx is not None:
            img.alpha_composite(vfx)

        # Fallback legacy
        arc = params.get('smear_arc')
        if arc:
            for pt in arc:
                px, py, thick = pt
                for dy in range(-thick, thick + 1):
                    for dx in range(-thick, thick + 1):
                        qx, qy = int(px + dx), int(py + dy)
                        if 0 <= qx < FW and 0 <= qy < FH:
                            img.putpixel((qx, qy), C_WHITE if dy == 0 else C_CYAN)

        # Debu Lantai
        dust = params.get('dust')
        if dust:
            for dx, dy in dust:
                if 0 <= dx < FW and 0 <= dy < FH: img.putpixel((dx, dy), C_DUST)

        # Petir Merambat
        lightnings = params.get('lightning')
        if lightnings:
            for seg in lightnings:
                for lx, ly in seg:
                    if 0 <= lx < FW and 0 <= ly < FH: img.putpixel((lx, ly), C_CYAN)

        return img

def build_penusbmic_24_combo(bg_color=C_BG):
    """Membangun kombo 24 frame lengkap Penusbmic"""
    rig = CyberRoninRig()
    frames = []

    # 24 Definisi Keyframe Berurutan:
    # -------------------------------------------------------------
    # FASE 1: Quick Draw Horizontal Swipe (Frame 0-5)
    # -------------------------------------------------------------
    # F0: Idle Battle Stance
    f0 = rig.render_frame({
        'bx': 28, 'by': 56, 'crouch': 0, 'vx': 0, 'vy': 0,
        'sword': {'x': 30, 'y': 60, 'ang': 0.15, 'z': 'back'},
        'cloak_flow': 0.1
    }, bg_color)
    frames.append((f0, 85))

    # F1: Wind-up (Crouch mendalam, pedang ditarik ke belakang sarung)
    f1 = rig.render_frame({
        'bx': 26, 'by': 56, 'crouch': 4, 'vx': -4, 'vy': 4,
        'hat_tilt': 0.1,
        'sword': {'x': 20, 'y': 62, 'ang': -0.3, 'z': 'back'},
        'cloak_flow': -0.4
    }, bg_color)
    frames.append((f1, 85))

    # F2: Fast Lunge & Slash Peak (Busur putih tebal melintas!)
    arc_f2 = [(x, int(33 - 3 * math.sin((x - 18) / 44.0 * math.pi)), 1) for x in range(18, 62, 2)]
    f2 = rig.render_frame({
        'bx': 35, 'by': 56, 'crouch': 2, 'vx': 9, 'vy': -2,
        'spread': 4, 'hat_tilt': 0.05,
        'sword': {'x': 54, 'y': 58, 'ang': 0.05, 'z': 'front'},
        'cloak_flow': -0.7,
        'smear_arc': arc_f2,
        'dust': [(24, 43), (23, 42), (25, 43)]
    }, bg_color)
    frames.append((f2, 85))

    # F3: Slash Follow-through
    f3 = rig.render_frame({
        'bx': 37, 'by': 56, 'crouch': 2, 'vx': 2, 'vy': 0,
        'spread': 3,
        'sword': {'x': 58, 'y': 59, 'ang': 0.1, 'z': 'front'},
        'cloak_flow': -0.5,
        'dust': [(23, 43)]
    }, bg_color)
    frames.append((f3, 85))

    # F4: Micro Recoil 1
    f4 = rig.render_frame({
        'bx': 36, 'by': 56, 'crouch': 1, 'vx': -1, 'vy': 0,
        'spread': 2,
        'sword': {'x': 56, 'y': 59, 'ang': 0.15, 'z': 'front'},
        'cloak_flow': -0.2
    }, bg_color)
    frames.append((f4, 85))

    # F5: Settle Transition
    f5 = rig.render_frame({
        'bx': 34, 'by': 56, 'crouch': 0, 'vx': -1, 'vy': -1,
        'sword': {'x': 50, 'y': 58, 'ang': 0.3, 'z': 'front'},
        'cloak_flow': 0.0
    }, bg_color)
    frames.append((f5, 85))

    # -------------------------------------------------------------
    # FASE 2: Reverse Turn & Cross Slash (Frame 6-11)
    # -------------------------------------------------------------
    # F6: Pivot Turn Buildup (Badan berputar memanfaatkan momentum)
    f6 = rig.render_frame({
        'bx': 33, 'by': 56, 'crouch': 2, 'vx': -2, 'vy': 2,
        'hat_tilt': -0.15,
        'sword': {'x': 40, 'y': 56, 'ang': -0.8, 'z': 'front'},
        'cloak_flow': 0.4
    }, bg_color)
    frames.append((f6, 85))

    # F7: Windup 2 (Pedang diputar ke bawah belakang)
    f7 = rig.render_frame({
        'bx': 32, 'by': 56, 'crouch': 3, 'vx': 0, 'vy': 1,
        'hat_tilt': -0.1,
        'sword': {'x': 26, 'y': 64, 'ang': -2.2, 'z': 'back'},
        'cloak_flow': 0.6
    }, bg_color)
    frames.append((f7, 85))

    # F8: Cross Slash Strike! (Tebasan menyilang dari bawah ke atas)
    arc_f8 = [(x, int(42 - (x - 22) * 0.65), 1) for x in range(22, 58, 2)]
    f8 = rig.render_frame({
        'bx': 38, 'by': 56, 'crouch': 1, 'vx': 6, 'vy': -3,
        'spread': 3,
        'sword': {'x': 52, 'y': 48, 'ang': -0.7, 'z': 'front'},
        'cloak_flow': 0.8,
        'smear_arc': arc_f8,
        'dust': [(27, 43), (28, 42)]
    }, bg_color)
    frames.append((f8, 85))

    # F9: Cross Follow-through
    f9 = rig.render_frame({
        'bx': 39, 'by': 56, 'crouch': 0, 'vx': 1, 'vy': -1,
        'spread': 2,
        'sword': {'x': 55, 'y': 46, 'ang': -0.85, 'z': 'front'},
        'cloak_flow': 0.5
    }, bg_color)
    frames.append((f9, 85))

    # F10: Recoil 2
    f10 = rig.render_frame({
        'bx': 38, 'by': 56, 'crouch': 1, 'vx': -1, 'vy': 1,
        'sword': {'x': 52, 'y': 49, 'ang': -0.8, 'z': 'front'},
        'cloak_flow': 0.2
    }, bg_color)
    frames.append((f10, 85))

    # F11: Transition to Overhead (Kedua tangan mulai memegang pedang)
    f11 = rig.render_frame({
        'bx': 35, 'by': 56, 'crouch': 0, 'vx': -2, 'vy': -2,
        'sword': {'x': 44, 'y': 48, 'ang': -1.4, 'z': 'front'},
        'cloak_flow': 0.0
    }, bg_color)
    frames.append((f11, 85))

    # -------------------------------------------------------------
    # FASE 3: Two-Handed Heavy Slam Finisher (Frame 12-17)
    # -------------------------------------------------------------
    # F12: High Jump / Overhead Wind-up (Pedang diangkat tinggi di atas topi)
    f12 = rig.render_frame({
        'bx': 33, 'by': 56, 'crouch': -3, 'vx': 1, 'vy': -5,
        'hat_tilt': -0.05,
        'sword': {'x': 34, 'y': 37, 'ang': -1.57, 'z': 'front'}, # Tegak lurus ke atas
        'cloak_flow': -0.2
    }, bg_color)
    frames.append((f12, 85))

    # F13: Apex of Jump (Kabel melayang ke atas)
    f13 = rig.render_frame({
        'bx': 34, 'by': 56, 'crouch': -4, 'vx': 2, 'vy': -1,
        'sword': {'x': 35, 'y': 36, 'ang': -1.5, 'z': 'front'},
        'cloak_flow': -0.3
    }, bg_color)
    frames.append((f13, 85))

    # F14: Downward Heavy Slam Drop! (Tebasan vertikal cepat ke tanah)
    arc_f14 = [(int(48 - 4 * math.sin((y - 12) / 32.0 * math.pi)), y, 1) for y in range(12, 44, 2)]
    f14 = rig.render_frame({
        'bx': 37, 'by': 56, 'crouch': 3, 'vx': 5, 'vy': 7,
        'spread': 5, 'hat_tilt': 0.15,
        'sword': {'x': 50, 'y': 64, 'ang': 1.45, 'z': 'front'}, # Hantam tanah
        'cloak_flow': -0.6,
        'smear_arc': arc_f14,
        'dust': [(47, 43), (48, 42), (52, 43), (53, 42)]
    }, bg_color)
    frames.append((f14, 85))

    # F15: Ground Impact Stomp & Sparks! (Pedang menancap, debu memercik ke samping)
    dust_f15 = [(45, 43), (44, 42), (43, 43), (54, 43), (55, 42), (57, 43), (51, 41)]
    f15 = rig.render_frame({
        'bx': 38, 'by': 56, 'crouch': 4, 'vx': 1, 'vy': 0,
        'spread': 5, 'hat_tilt': 0.15,
        'sword': {'x': 50, 'y': 67, 'ang': 1.57, 'z': 'front'},
        'cloak_flow': -0.7,
        'dust': dust_f15
    }, bg_color)
    frames.append((f15, 85))

    # F16: Recoil Bounce (+2px kepala dan pedang membal)
    f16 = rig.render_frame({
        'bx': 37, 'by': 56, 'crouch': 3, 'vx': -1, 'vy': -1,
        'spread': 4, 'hat_tilt': 0.1,
        'sword': {'x': 49, 'y': 65, 'ang': 1.55, 'z': 'front'},
        'cloak_flow': -0.5,
        'dust': [(43, 43), (56, 43)]
    }, bg_color)
    frames.append((f16, 85))

    # F17: Impact Settle (Pedang masih menancap)
    f17 = rig.render_frame({
        'bx': 37, 'by': 56, 'crouch': 3, 'vx': 0, 'vy': 0,
        'spread': 4,
        'sword': {'x': 49, 'y': 66, 'ang': 1.57, 'z': 'front'},
        'cloak_flow': -0.3
    }, bg_color)
    frames.append((f17, 85))

    # -------------------------------------------------------------
    # FASE 4: Electric Burst & Sheath Recovery (Frame 18-23)
    # -------------------------------------------------------------
    # F18: Lightning Surge! (Petir keluar dari kabel & merambat di tanah)
    lightning_f18 = [
        [(30, 24), (32, 22), (36, 23), (42, 28), (48, 35), (49, 41)], # Kabel ke pedang
        [(49, 42), (46, 43), (42, 42), (38, 43), (34, 43)],           # Merambat ke kiri
        [(50, 42), (54, 43), (58, 42), (63, 43)]                       # Merambat ke kanan
    ]
    f18 = rig.render_frame({
        'bx': 37, 'by': 56, 'crouch': 3, 'vx': 0, 'vy': 0,
        'spread': 4,
        'sword': {'x': 49, 'y': 66, 'ang': 1.57, 'z': 'front'},
        'cloak_flow': -0.2,
        'lightning': lightning_f18
    }, bg_color)
    frames.append((f18, 95))

    # F19: Lightning Lingering Sparks
    lightning_f19 = [
        [(44, 43), (40, 42), (36, 43)],
        [(52, 43), (57, 42), (61, 43)],
        [(49, 37), (51, 35)]
    ]
    f19 = rig.render_frame({
        'bx': 36, 'by': 56, 'crouch': 2, 'vx': -1, 'vy': -1,
        'spread': 3,
        'sword': {'x': 48, 'y': 64, 'ang': 1.5, 'z': 'front'},
        'cloak_flow': -0.1,
        'lightning': lightning_f19
    }, bg_color)
    frames.append((f19, 85))

    # F20: Cabut Pedang dari Tanah
    f20 = rig.render_frame({
        'bx': 34, 'by': 56, 'crouch': 1, 'vx': -1, 'vy': -1,
        'spread': 2,
        'sword': {'x': 45, 'y': 60, 'ang': 1.1, 'z': 'front'},
        'cloak_flow': 0.0
    }, bg_color)
    frames.append((f20, 85))

    # F21: Blade Flick / Spin (Memutar bilah sebelum disarungkan)
    f21 = rig.render_frame({
        'bx': 32, 'by': 56, 'crouch': 0, 'vx': -1, 'vy': 0,
        'sword': {'x': 38, 'y': 58, 'ang': 0.3, 'z': 'front'},
        'cloak_flow': 0.1
    }, bg_color)
    frames.append((f21, 85))

    # F22: Penyarungan Pedang (Ujung bilah masuk ke sarung pinggul)
    f22 = rig.render_frame({
        'bx': 30, 'by': 56, 'crouch': 0, 'vx': -1, 'vy': 0,
        'sword': {'x': 32, 'y': 59, 'ang': 0.15, 'z': 'back'},
        'cloak_flow': 0.05
    }, bg_color)
    frames.append((f22, 100))

    # F23: Idle Settle Complete (Jubah dan kabel kembali diam)
    f23 = rig.render_frame({
        'bx': 28, 'by': 56, 'crouch': 0, 'vx': 0, 'vy': 0,
        'sword': {'x': 30, 'y': 60, 'ang': 0.15, 'z': 'back'},
        'cloak_flow': 0.0
    }, bg_color)
    frames.append((f23, 150))

    return frames

if __name__ == '__main__':
    print('Generating Penusbmic 24-Frame Full Combo...')
    # 1. Versi Showcase (dengan background wine-red ala tutorial)
    frames_showcase = build_penusbmic_24_combo(bg_color=C_BG)
    images_showcase = [f[0].resize((FW * 4, FH * 4), Image.NEAREST) for f in frames_showcase]
    durations = [f[1] for f in frames_showcase]
    gif_showcase = '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6/cyber_ronin_24frame_combo.gif'
    images_showcase[0].save(gif_showcase, save_all=True, append_images=images_showcase[1:], duration=durations, loop=0)
    print('Showcase GIF created:', gif_showcase)

    # 2. Versi Spritesheet Transparan untuk Game Engine
    frames_trans = build_penusbmic_24_combo(bg_color=C_TRANS)
    sheet = Image.new('RGBA', (FW * 24, FH), C_TRANS)
    for idx, (f, _) in enumerate(frames_trans):
        sheet.paste(f, (idx * FW, 0))
    sheet_path = '/Users/herlambang/.gemini/antigravity/brain/7cb893f0-37f2-441d-80ba-aab2cf6e93a6/cyber_ronin_24frame_sheet.png'
    sheet.save(sheet_path)
    print('Transparent Spritesheet created:', sheet_path)
