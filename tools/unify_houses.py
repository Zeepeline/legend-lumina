#!/usr/bin/env python3
"""Menyelaraskan palet warna & outline rumah Kota Lumina (sp_b_cityHouse1..5.png)
agar menyatu 100% dengan gaya hangat cozy medieval pixel-art rumah desa (sp_houseA / sp_blacksmith_forge).
Aslinya disimpan di tools/house_src/ agar aman dijalankan ulang.
"""

from pathlib import Path
import shutil
from PIL import Image

BLD_DIR = Path("godot/assets/art/buildings")
SRC_DIR = Path("tools/house_src")
TARGETS = [
    "sp_b_cityHouse1.png",
    "sp_b_cityHouse2.png",
    "sp_b_cityHouse3.png",
    "sp_b_cityHouse4.png",
    "sp_b_cityHouse5.png",
]


def harmonize_house(src_path: Path, dst_path: Path) -> None:
    im = Image.open(src_path).convert("RGBA")
    w, h = im.size
    px = im.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 128:
                px[x, y] = (0, 0, 0, 0)
                continue

            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0

            # 1. Lembutkan outline hitam pekat -> cokelat gelap hangat ala sp_houseA (#2e1e16)
            if r < 34 and g < 34 and b < 38:
                px[x, y] = (46, 30, 22, 255)
                continue

            # 2. Selaraskan atap merah/oranye yang terlalu kontras ke terakota hangat sp_houseA
            if r > g + 35 and r > b + 45:
                nr = int(r * 0.90 + 18)
                ng = int(g * 0.96 + 14)
                nb = int(b * 0.96 + 16)
            # 3. Dinding krem & kayu: sedikit hangatkan dan turunkan kontras ekstrem
            elif lum > 0.72 and abs(r - g) < 28:
                nr = int(min(244, r * 0.96 + 6))
                ng = int(min(232, g * 0.95 + 5))
                nb = int(min(204, b * 0.90 + 6))
            else:
                # Batu & kayu: lembutkan bayangan gelap agar tidak terlalu kontras dibanding sp_houseA
                nr = int(min(255, r * 0.93 + 12))
                ng = int(min(255, g * 0.93 + 10))
                nb = int(min(255, b * 0.91 + 9))

            px[x, y] = (max(0, min(255, nr)), max(0, min(255, ng)), max(0, min(255, nb)), 255)

    im.save(dst_path)
    print(f"Harmonized {dst_path} {im.size}")


def main() -> None:
    SRC_DIR.mkdir(parents=True, exist_ok=True)
    for name in TARGETS:
        dst = BLD_DIR / name
        src = SRC_DIR / name
        if not dst.exists():
            continue
        if not src.exists():
            shutil.copy2(dst, src)
        harmonize_house(src, dst)


if __name__ == "__main__":
    main()
