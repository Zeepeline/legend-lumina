#!/usr/bin/env python3
"""Ekstrak & bersihkan aset Gerbang Kota Lumina dari assets/raw/city_gate_sheet.jpg
sesuai docs/VALIDATION_RULES.md (tanpa anti-aliasing, tanpa garis tepi hitam murni, latar transparan).
Pemakaian: python3 tools/gen_city_gate.py"""
import os
from collections import deque
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..')
SHEET = os.path.join(ROOT, 'assets/raw/city_gate_sheet.jpg')
REF = '/Users/herlambang/.gemini/antigravity/brain/cfbc75d1-f33a-4d17-8507-04ca25a2c78d/.user_uploaded/media_1794831285665_1b994afb.jpg'


def soften_outline(a):
    H, W, _ = a.shape
    op = a[:, :, 3] > 128
    rgb = a[:, :, :3].astype(int)
    for y in range(H):
        for x in range(W):
            if op[y, x] and rgb[y, x].max() < 42:
                edge = False
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if not (0 <= ny < H and 0 <= nx < W) or not op[ny, nx]:
                            edge = True
                            break
                    if edge:
                        break
                if edge:
                    best = np.array([72, 78, 98])
                    for dy in range(-4, 5):
                        for dx in range(-4, 5):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < H and 0 <= nx < W and op[ny, nx] and rgb[ny, nx].max() >= 52:
                                best = rgb[ny, nx]
                                break
                    col = np.clip(best * 0.42 + np.array([0, 4, 18]), 24, 255)
                    a[y, x, :3] = col.astype(np.uint8)
    a[:, :, 3] = np.where(op, 255, 0)
    return a


def clean_crop(im, box, scale=0.5, mode=None):
    sub = im.crop(box).copy()
    a = np.array(sub)
    H, W, _ = a.shape
    bg = np.zeros((H, W), dtype=bool)
    q = deque()
    for x in range(W):
        if a[0, x, :3].max() < 32:
            bg[0, x] = True
            q.append((0, x))
        if a[H - 1, x, :3].max() < 32:
            bg[H - 1, x] = True
            q.append((H - 1, x))
    for y in range(H):
        if a[y, 0, :3].max() < 32:
            bg[y, 0] = True
            q.append((y, 0))
        if a[y, W - 1, :3].max() < 32:
            bg[y, W - 1] = True
            q.append((y, W - 1))
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx] and a[ny, nx, :3].max() < 32:
                bg[ny, nx] = True
                q.append((ny, nx))
    a[bg, 3] = 0

    if mode == 'gate':
        for dx in range(117):
            x = 140 + dx
            norm = (dx - 58.0) / 58.5
            y_top = int(round(140 + 33 * (norm ** 2)))
            for ry in range(max(135, y_top - 2), y_top):
                a[ry, x, :3] = [52, 54, 68]
                a[ry, x, 3] = 255
            for y in range(y_top, H):
                if dx < 8 or dx > 108:
                    if y < 228:
                        col = np.array([58, 44, 40], dtype=float) * (0.72 if (dx in (0, 7, 109, 116)) else 1.0)
                        a[y, x, :3] = col.astype(np.uint8)
                        a[y, x, 3] = 255
                    else:
                        a[y, x, 3] = 0
                else:
                    a[y, x, 3] = 0
        for y in range(224, H):
            for x in range(134, 261):
                a[y, x, 3] = 0
        for y in range(238, H):
            for x in range(W):
                r, g, b, al = [int(v) for v in a[y, x]]
                if al > 0 and g > r + 15 and g > b + 15:
                    if (x < 68 or x > 326) and y < 246:
                        continue
                    a[y, x, 3] = 0

    a = soften_outline(a)
    ys, xs = np.nonzero(a[:, :, 3] > 128)
    if len(ys):
        a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    out = Image.fromarray(a, 'RGBA')
    if scale != 1.0:
        nw, nh = max(1, round(out.width * scale)), max(1, round(out.height * scale))
        out = out.resize((nw, nh), Image.NEAREST)
    return out


def make_cwall(sheet):
    w_crop = sheet.crop((404, 70, 548, 252))
    wa = np.array(w_crop)
    seg = np.zeros((96, 76, 4), dtype=np.uint8)
    top_m = wa[8:38, 18:94].copy()
    for y in range(30):
        for x in range(76):
            if top_m[y, x, :3].max() < 32:
                top_m[y, x, 3] = 0
            elif top_m[y, x, :3].max() < 48 and y < 22:
                top_m[y, x, :3] = [44, 48, 64]
    seg[0:30, :] = top_m
    seg[30:78, :] = wa[112:160, 28:104]
    seg[78:94, :] = wa[128:144, 28:104]
    seg[94:96, :, :3] = [48, 52, 68]
    seg[94:96, :, 3] = 255
    tiled = np.concatenate([seg, seg, seg], axis=1)
    tiled = soften_outline(tiled)
    return Image.fromarray(tiled, 'RGBA').resize((132, 48), Image.NEAREST)


def make_banks(ref_path):
    ref = Image.open(ref_path).convert('RGBA')
    bank_l = ref.crop((0, 504, 344, 682)).copy()
    bank_r = ref.crop((680, 504, 1024, 682)).copy()
    al = np.array(bank_l)
    ar = np.array(bank_r)
    pw = al[68:106, 100:180].copy()
    for y in range(60, 178):
        for x in range(205):
            if y > 56 + max(0, x - 20) * 0.45:
                r, g, b, _ = [int(v) for v in al[y, x]]
                if not (b > 108 and b > g + 14):
                    al[y, x] = pw[(y - 60) % 38, x % 80]
    for x in range(232, 344):
        y_min = int(round(18 + max(0, x - 244) * 0.42)) if x < 322 else int(round(52 + (x - 322) * 1.6))
        for y in range(min(178, y_min)):
            r, g, b, _ = [int(v) for v in al[y, x]]
            if not (r > g - 5 and x <= 322 and y >= 24):
                al[y, x, 3] = 0
    for x in range(344):
        if x < 38:
            y_min = int(round(82 - (x / 38.0) * 12))
        elif x < 62:
            y_min = 38
        elif x < 190:
            y_min = int(round(46 - ((x - 62) / 128.0) * 38))
        else:
            y_min = int(round(8 + max(0, x - 250) * 0.18))
        for y in range(min(178, y_min)):
            ar[y, x, 3] = 0
    al = soften_outline(al)
    ar = soften_outline(ar)
    bl = Image.fromarray(al, 'RGBA').resize((110, 56), Image.NEAREST)
    br = Image.fromarray(ar, 'RGBA').resize((110, 56), Image.NEAREST)
    return bl, br


def main():
    sheet = Image.open(SHEET).convert('RGBA')
    assets = {}
    assets['buildings/gpt_gatehouse.png'] = clean_crop(sheet, (8, 7, 402, 264), 0.5, mode='gate')
    # Top arch overlay (upper 90px of gatehouse so Arka walks underneath the arch!)
    gh = assets['buildings/gpt_gatehouse.png']
    gh_top = Image.new('RGBA', gh.size, (0, 0, 0, 0))
    gh_top.paste(gh.crop((0, 0, gh.width, 90)), (0, 0))
    assets['buildings/gpt_gatehouse_top.png'] = gh_top
    assets['buildings/gpt_cwall.png'] = make_cwall(sheet)
    assets['buildings/gpt_ctower.png'] = clean_crop(sheet, (551, 8, 686, 255), 0.5)
    assets['buildings/gpt_city_bridge.png'] = clean_crop(sheet, (858, 582, 1011, 670), 0.5)

    # Lamp on stone pedestal (combine #11 pedestal + upper lantern/pole of #21, exact match to reference image!)
    lamp_top = clean_crop(sheet, (752, 244, 787, 340), 0.5)
    ped = clean_crop(sheet, (917, 165, 950, 234), 0.5)
    ped = ped.resize((16, 22), Image.NEAREST)
    lamp_full = Image.new('RGBA', (max(lamp_top.width, ped.width), lamp_top.height + ped.height - 4), (0, 0, 0, 0))
    lamp_full.paste(ped, ((lamp_full.width - ped.width) // 2, lamp_full.height - ped.height), ped)
    lamp_full.paste(lamp_top, ((lamp_full.width - lamp_top.width) // 2, 0), lamp_top)
    assets['props/gpt_city_lamp.png'] = lamp_full
    assets['props/gpt_city_lamp2.png'] = clean_crop(sheet, (859, 244, 910, 366), 0.5)
    assets['props/gpt_city_banner.png'] = clean_crop(sheet, (919, 247, 962, 366), 0.5)
    ban_sm_top = clean_crop(sheet, (976, 246, 1011, 319), 0.5)
    ban_sm = Image.new('RGBA', (ban_sm_top.width, ban_sm_top.height + 10), (0, 0, 0, 0))
    # Draw standing post at center bottom (so it stands in the ground like in ref image)
    px = ban_sm_top.width // 2 - 1
    for py in range(ban_sm_top.height - 4, ban_sm.height):
        ban_sm.putpixel((px, py), (54, 46, 52, 255))
        ban_sm.putpixel((px + 1, py), (112, 92, 74, 255))
        ban_sm.putpixel((px + 2, py), (48, 42, 48, 255))
    ban_sm.paste(ban_sm_top, (0, 0), ban_sm_top)
    assets['props/gpt_city_banner_sm.png'] = ban_sm
    assets['props/gpt_city_fence.png'] = clean_crop(sheet, (648, 453, 741, 489), 0.5)
    assets['props/gpt_city_board.png'] = clean_crop(sheet, (661, 499, 733, 564), 0.5)
    assets['props/gpt_city_cart.png'] = clean_crop(sheet, (939, 467, 1016, 566), 0.5)
    assets['props/gpt_city_flower_w.png'] = clean_crop(sheet, (318, 432, 366, 470), 0.5)
    assets['props/gpt_city_flower_p.png'] = clean_crop(sheet, (383, 436, 438, 470), 0.5)
    assets['nature/gpt_city_rock_lg.png'] = clean_crop(sheet, (427, 480, 512, 533), 0.5)
    assets['nature/gpt_city_rock_sm.png'] = clean_crop(sheet, (519, 526, 578, 562), 0.5)
    assets['nature/gpt_city_cliff_s.png'] = clean_crop(sheet, (511, 571, 636, 670), 0.5)
    assets['nature/gpt_city_cliff_c.png'] = clean_crop(sheet, (372, 573, 504, 670), 0.5)

    # Spear guard for NPC portrait (32x32) and standalone prop
    g_raw = clean_crop(sheet, (823, 382, 877, 453), 0.5)
    assets['props/gpt_city_guard.png'] = g_raw
    g_npc = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    gs = g_raw.resize((26, 32), Image.NEAREST)
    g_npc.paste(gs, ((32 - gs.width) // 2, 0), gs)
    assets['npc/npc_guard_spear.png'] = g_npc

    if os.path.exists(REF):
        bl, br = make_banks(REF)
        assets['nature/gpt_city_cliff_l.png'] = bl
        assets['nature/gpt_city_cliff_r.png'] = br

    for rel, im in assets.items():
        p = os.path.join(ROOT, 'assets/img', rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        im.save(p)
        print(f'{rel}: {im.size}')

    # Contact sheet
    cw, ch = 960, 860
    contact = Image.new('RGBA', (cw, ch), (36, 40, 48, 255))
    dr = ImageDraw.Draw(contact)
    cx, cy, row_h = 12, 12, 0
    for rel, im in assets.items():
        name = os.path.basename(rel).replace('.png', '')
        z = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
        if cx + z.width + 20 > cw:
            cx = 12
            cy += row_h + 26
            row_h = 0
        contact.paste(z, (cx, cy + 14), z)
        dr.rectangle([cx, cy + 14, cx + z.width, cy + 14 + z.height], outline=(100, 120, 150, 255))
        dr.text((cx, cy), f'{name} ({im.width}x{im.height})', fill=(240, 220, 140, 255))
        cx += max(z.width + 18, 120)
        row_h = max(row_h, z.height)
    contact.save('/Users/herlambang/.gemini/antigravity/brain/cfbc75d1-f33a-4d17-8507-04ca25a2c78d/scratch_city_contact.png')


if __name__ == '__main__':
    main()
