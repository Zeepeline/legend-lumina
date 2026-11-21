#!/usr/bin/env python3
"""
Generate realistic visual preview of TRUE FLUFFY CUMULUS CLOUD SHADOWS (☁️).
Using clustered overlapping circular domes with a flat bottom base,
quantized to retro pixel grid, moving gently over the ground.
"""
import os
import math
from PIL import Image, ImageDraw, ImageEnhance

def generate_preview():
    W, H = 384, 256
    # 1. Draw crisp cumulus cloud silhouettes (☁️)
    cloud_img = Image.new('L', (W, H), 0)
    draw = ImageDraw.Draw(cloud_img)

    def draw_puff(cx, cy, rx, ry):
        draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)

    # Cloud Cluster 1: Giant Majestic Cumulus (Kiri Atas)
    # Flat base bottom
    draw_puff(130, 95, 75, 26)
    # Billowing puffy circular lobes across the top
    draw_puff(75, 90, 28, 26)
    draw_puff(100, 75, 34, 32)
    draw_puff(135, 62, 42, 38) # Peak dome
    draw_puff(170, 72, 36, 32)
    draw_puff(195, 88, 26, 24)

    # Cloud Cluster 2: Medium Cumulus Cloud (Kanan Bawah)
    draw_puff(310, 195, 55, 22)
    draw_puff(280, 188, 28, 25)
    draw_puff(310, 175, 35, 30)
    draw_puff(345, 185, 28, 24)

    # Cloud Cluster 3: Small Floating Fluff (Kanan Atas)
    draw_puff(300, 55, 32, 14)
    draw_puff(290, 48, 18, 16)
    draw_puff(312, 46, 20, 18)

    # Quantize to 2x2 retro pixel steps so edges are staircase pixel art
    B = 2
    pixel_mask = Image.new('L', (W, H), 0)
    p_draw = ImageDraw.Draw(pixel_mask)
    for y in range(0, H, B):
        for x in range(0, W, B):
            if cloud_img.getpixel((x + B // 2, y + B // 2)) > 120:
                p_draw.rectangle([x, y, x + B - 1, y + B - 1], fill=255)

    # Load ground and hero
    ground_full = Image.open('tiled/ground/village_ground.png').convert('RGBA')
    hero_sheet = Image.open('assets/img/hero/hero_arka.png').convert('RGBA')
    hero_frame = hero_sheet.crop((0, 0, 48, 40))

    # Base scene 384x256
    scene = ground_full.crop((120, 80, 120 + W, 80 + H)).copy()

    # Place Arka in the middle
    arka_x = W // 2 - 24
    arka_y = H // 2 - 20
    draw_scene = ImageDraw.Draw(scene)
    draw_scene.ellipse([arka_x + 13, arka_y + 34, arka_x + 35, arka_y + 42], fill=(12, 22, 16, 170))
    scene.alpha_composite(hero_frame, (arka_x, arka_y))

    # Create shaded version of scene (subtle 20% darker, cooler tone)
    enhancer = ImageEnhance.Brightness(scene)
    shaded_scene = enhancer.enhance(0.80)
    blue_overlay = Image.new('RGBA', (W, H), (15, 30, 60, 35))
    shaded_scene.alpha_composite(blue_overlay)

    # Composite: where mask is 255, use shaded_scene; elsewhere use sunny scene
    scene_with_cloud = Image.composite(shaded_scene, scene, pixel_mask)

    # Scale 2x for crisp retro pixels
    scale = 2
    cw, ch = W * scale, H * scale
    header_h = 44
    margin = 12
    board_w = (cw * 2) + (margin * 3)
    board_h = ch + header_h + (margin * 2)

    board = Image.new('RGB', (board_w, board_h), (24, 26, 32))
    b_draw = ImageDraw.Draw(board)

    # Paste left: Full Sunlight
    left_img = scene.resize((cw, ch), Image.NEAREST)
    board.paste(left_img, (margin, header_h + margin))
    b_draw.rectangle([margin - 1, header_h + margin - 1, margin + cw + 1, header_h + margin + ch + 1], outline=(55, 62, 80), width=2)
    b_draw.text((margin + 12, 14), "1. SAAT KENA SINAR MATAHARI (TERANG)", fill=(230, 240, 255))

    # Paste right: Fluffy Cumulus Cloud Shade
    right_img = scene_with_cloud.resize((cw, ch), Image.NEAREST)
    board.paste(right_img, (margin * 2 + cw, header_h + margin))
    b_draw.rectangle([margin * 2 + cw - 1, header_h + margin - 1, margin * 2 + cw + cw + 1, header_h + margin + ch + 1], outline=(100, 160, 230), width=2)
    b_draw.text((margin * 2 + cw + 12, 14), "2. BAYANGAN AWAN GUMPALAN KAPAS / KUMULUS (☁️ BENTUK AWAN NYATA)", fill=(120, 220, 255))

    artifact_dir = '/Users/herlambang/.gemini/antigravity/brain/3eaa4214-0ece-4950-b84e-514e5dac3552'
    out_path = os.path.join(artifact_dir, 'cloud_shadow_preview.png')
    board.save(out_path, 'PNG')
    print('Updated cumulus cloud preview saved at:', out_path)

if __name__ == '__main__':
    generate_preview()
