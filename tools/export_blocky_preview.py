#!/usr/bin/env python3
"""
Generate visual comparison of 3 authentic BLOCKY PIXEL-ART cloud shadow designs
built on orthogonal staircase grid (no curved bezier/circle arcs),
matching user's reference screenshot style.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance

W, H = 384, 256
GRID = 4 # 4x4 pixel blocks
cols = W // GRID # 96
rows = H // GRID # 64

# Base ground + Arka scene
ground_full = Image.open('tiled/ground/village_ground.png').convert('RGBA')
hero_sheet = Image.open('assets/img/hero/hero_arka.png').convert('RGBA')
hero_frame = hero_sheet.crop((0, 0, 48, 40))

base_scene = ground_full.crop((120, 80, 120 + W, 80 + H)).copy()
arka_x = W // 2 - 24
arka_y = H // 2 - 20
draw_scene = ImageDraw.Draw(base_scene)
draw_scene.ellipse([arka_x + 13, arka_y + 34, arka_x + 35, arka_y + 42], fill=(12, 22, 16, 170))
base_scene.alpha_composite(hero_frame, (arka_x, arka_y))

# Shaded version
enhancer = ImageEnhance.Brightness(base_scene)
shaded_scene = enhancer.enhance(0.78)
blue_overlay = Image.new('RGBA', (W, H), (15, 30, 60, 35))
shaded_scene.alpha_composite(blue_overlay)

def make_cloud_image(fill_fn):
    grid = np.zeros((rows, cols), dtype=np.uint8)
    def block(c1, r1, c2, r2):
        grid[r1:r2+1, c1:c2+1] = 1
    def unblock(c1, r1, c2, r2):
        grid[r1:r2+1, c1:c2+1] = 0
    fill_fn(block, unblock)
    full_mask = np.repeat(np.repeat(grid * 255, GRID, axis=0), GRID, axis=1)
    mask_img = Image.fromarray(full_mask)
    return Image.composite(shaded_scene, base_scene, mask_img), grid

# DESIGN 1: Chunky Stepped Cumulus (Sesuai Karakter Referensi User: Patah Piksel Tegas + Tonjolan Samping)
def fill_design_1(block, unblock):
    # Main body
    block(38, 24, 72, 42)
    block(42, 20, 68, 23)
    block(46, 16, 64, 19)
    block(50, 12, 60, 15) # Puncak atas
    # Pundak samping kanan & tonjolan khas ala referensi
    block(66, 15, 71, 18)
    block(68, 19, 74, 25)
    block(72, 26, 76, 34)
    block(69, 35, 75, 40)
    # Tonjolan kecil di ujung atas kanan (cerobong awan)
    block(67, 10, 70, 14)
    block(68, 7, 70, 9)
    # Undakan kiri
    block(34, 27, 37, 39)
    block(31, 31, 33, 37)
    # Undakan bawah bertingkat
    block(42, 43, 66, 45)
    block(46, 46, 60, 48)
    block(50, 49, 56, 50)
    # Awan kecil pendamping
    block(12, 48, 24, 56)
    block(15, 45, 21, 47)
    block(82, 10, 92, 18)
    block(84, 7, 90, 9)

# DESIGN 2: Broad Pixel-Art Overcast (Gumpalan Meluas Bertangga Alami)
def fill_design_2(block, unblock):
    # Gumpalan lebar dengan undakan tangga berjejer
    block(32, 22, 74, 44)
    block(36, 18, 70, 21)
    block(42, 14, 64, 17)
    block(48, 10, 58, 13) # Puncak
    block(28, 27, 31, 38) # Lekukan kiri
    block(25, 31, 27, 36)
    block(75, 25, 78, 38) # Lekukan kanan
    block(79, 29, 81, 35)
    block(38, 45, 68, 48) # Dasar bawah
    block(44, 49, 62, 52)
    # Celah lubang sinar kecil di tengah (100% pixel art staircase)
    unblock(52, 26, 56, 30)
    unblock(53, 31, 55, 33)
    # Awan kecil melayang
    block(14, 12, 26, 20)
    block(17, 9, 23, 11)

# DESIGN 3: Dual Floating Clusters (Dua Kluster Awan Pixel Beriringan)
def fill_design_3(block, unblock):
    # Kluster 1 (Besar di tengah)
    block(34, 18, 64, 38)
    block(38, 14, 58, 17)
    block(44, 10, 52, 13)
    block(30, 23, 33, 32)
    block(65, 21, 69, 33)
    block(40, 39, 58, 42)
    block(45, 43, 53, 45)
    # Kluster 2 (Sedang di kanan bawah)
    block(70, 40, 88, 54)
    block(74, 36, 84, 39)
    block(77, 33, 81, 35)
    block(67, 44, 69, 50)
    block(73, 55, 83, 57)
    # Awan kecil di kiri atas
    block(10, 26, 20, 34)
    block(12, 23, 18, 25)

img_d1, g1 = make_cloud_image(fill_design_1)
img_d2, g2 = make_cloud_image(fill_design_2)
img_d3, g3 = make_cloud_image(fill_design_3)

# Stitch comparison board
scale = 2
cw, ch = W * scale, H * scale
header_h = 50
margin = 12
board_w = (cw * 3) + (margin * 4)
board_h = ch + header_h + (margin * 2)

board = Image.new('RGB', (board_w, board_h), (24, 26, 32))
b_draw = ImageDraw.Draw(board)

options_data = [
    ('DESAIN A: Stepped Cumulus (Patah Ortogonal Ala Referensi)', img_d1),
    ('DESAIN B: Broad Stepped Overcast (Awan Berundak + Celah)', img_d2),
    ('DESAIN C: Dual Floating Pixel Clusters (2 Kluster Terpisah)', img_d3)
]

for idx, (title, card_img) in enumerate(options_data):
    x_pos = margin + idx * (cw + margin)
    y_pos = margin + header_h
    b_draw.rectangle([x_pos - 1, margin, x_pos + cw + 1, margin + header_h - 6], fill=(36, 42, 56))
    b_draw.text((x_pos + 12, margin + 14), title, fill=(240, 220, 160))
    upscaled = card_img.resize((cw, ch), Image.NEAREST)
    board.paste(upscaled, (x_pos, y_pos))
    b_draw.rectangle([x_pos - 1, y_pos - 1, x_pos + cw + 1, y_pos + ch + 1], outline=(70, 85, 115), width=2)

artifact_dir = '/Users/herlambang/.gemini/antigravity/brain/3eaa4214-0ece-4950-b84e-514e5dac3552'
out_path = f'{artifact_dir}/pixel_blocky_cloud_preview.png'
board.save(out_path, 'PNG')
print('Blocky pixel cloud comparison saved at:', out_path)
