import sys, os, colorsys
from PIL import Image

def recolor_snow_tree(src_path, dst_path, canopy_height=50.0):
    """
    Mengubah warna daun pohon menjadi pohon salju/es dengan gradasi halus (smooth curve)
    tanpa hard-banding / garis horizontal kaku.
    """
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))

    for y in range(h):
        for x in range(w):
            r, g, b, a = img.getpixel((x, y))
            if a == 0:
                continue

            # colorsys: r, g, b in 0..1 -> h, l, s in 0..1
            h_val, l_val, s_val = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
            h_deg = h_val * 360.0

            # Deteksi dedaunan hijau (h antara 50 deg dan 170 deg)
            if 50.0 < h_deg < 170.0:
                # Gradasi vertikal kontinu dari pucuk (k=0.75) ke bawah kanopi (k=0.30)
                t = min(1.0, y / canopy_height)
                k = 0.75 - 0.45 * (t ** 0.85)

                # Geser hue ke arah Cyan/Es (200 deg)
                diff = (200.0 - h_deg + 180.0) % 360.0 - 180.0
                new_h = ((h_deg + diff * 0.6) % 360.0) / 360.0
                new_s = s_val * 0.35
                new_l = min(1.0, l_val + (1.0 - l_val) * k)

                nr, ng, nb = colorsys.hls_to_rgb(new_h, new_l, new_s)
                out.putpixel((x, y), (int(nr * 255), int(ng * 255), int(nb * 255), a))
            else:
                out.putpixel((x, y), (r, g, b, a))

    out.save(dst_path)
    print(f"Berhasil merender pohon salju: {dst_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Penggunaan: python3 recolor_tree.py <input_tree.png> <output_tree.png> [canopy_height]")
        sys.exit(1)
    ch = float(sys.argv[3]) if len(sys.argv) > 3 else 50.0
    recolor_snow_tree(sys.argv[1], sys.argv[2], ch)

