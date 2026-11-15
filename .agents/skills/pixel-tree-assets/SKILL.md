---
name: pixel-tree-assets
description: >-
  Panduan, prinsip pewarnaan gradasi (smooth lighting/recolor tanpa garis kaku),
  anatomi sprite pohon pixel art top-down, animasi goyangan daun (wind sway),
  serta pembuatan varian musim (hijau, salju/es, musim gugur/oranye, rawa).
  Gunakan skill ini setiap kali membuat, merevisi, memotong dari AI/GPT,
  atau memprogram asset pohon pixel art di Legenda Lumina.
---

# Pixel-Art Tree Assets & Foliage Shading Skill

Panduan standar untuk merancang, memotong dari sprite sheet GPT, mewarnai ulang (*seasonal recoloring*), dan menganimasikan **aset pohon pixel-art** dalam game top-down RPG (Phaser 3 / Legenda Lumina).

---

## 1. Anatomi Pohon Top-Down (Proyeksi 3/4)

Pohon top-down terdiri dari 3 komponen struktural:

```
          [ Pucuk / Lapisan Atas ]  <-- Terkena cahaya matahari / salju paling tebal
         /                        \
       [     Kanopi / Dedaunan    ] <-- Volume kubah daun (cluster rounded masses)
      /       (Bayangan Bawah)     \ <-- Ambient occlusion daun bawah (lebih gelap)
     /                              \
               || Batang ||         <-- Pangkal batang & akar menjalar
             ============           <-- Kontak rumput / tanah (origin y=1.0)
            (  Bayangan  )          <-- Soft shadow oval di tanah (depth sorting)
```

1. **Titik Origin & Sorting Depth**:
   - Origin selalu di dasar batang: `setOrigin(0.5, 1.0)`.
   - `depth` dihitung berdasarkan posisi $Y$ kaki pohon (`y`).
2. **Kubah Daun (*Foliage Clusters*)**:
   - Daun tidak digambar sebagai garis mendatar atau acak, melainkan kelompok bola/gumpalan (*sub-spheres/clusters*).
   - Setiap *cluster* memiliki sisi terang di atas-kiri dan bayangan di bawah-kanan.

---

## 2. Aturan Emas Pewarnaan & Gradasi (Anti-Banding / Anti-Stripe)

> [!CAUTION]
> **DILARANG MENGGUNAKAN PEMOTONGAN DISKRIT / STEP-BASED THRESHOLD PADA WARNA KANOPI!**
> Contoh salah:
> ```javascript
> // SALAH BESAR: Menciptakan 2 garis horizontal kaku melintang di tengah daun!
> const k = yy < 0.25 ? 0.75 : yy < 0.55 ? 0.5 : 0.3;
> ```

### Formula Gradasi Halus (*Continuous Smoothstep Lighting Curve*)
Gunakan kurva transisi kontinu berbasis posisi vertikal $yy$ (di mana $yy = \frac{y - y_{\text{top}}}{H_{\text{foliage}}}$):

$$t = \text{clamp}\left(\frac{y}{H_{\text{target}}}, 0, 1\right)$$

$$k = k_{\text{top}} - (k_{\text{top}} - k_{\text{bottom}}) \times t^{\gamma}$$

- Untuk pohon salju (`treeSn`):
  - $k_{\text{top}} = 0.75$ (salju putih bersih di pucuk)
  - $k_{\text{bottom}} = 0.30$ (warna es sejuk di daun terbawah)
  - $\gamma \approx 0.85$ (penetrasi salju sedikit lebih luas di 30% atas tanpa memotong)
  - **Formula GDScript / JS**:
    ```javascript
    const t = Math.min(1.0, yy / 0.65);
    const k = 0.75 - 0.45 * Math.pow(t, 0.85);
    ```

### Pemetaan Ruang Warna HSL (*Hue & Saturation Shifting*)
Saat mewarnai ulang (*recolor* varian musim):
1. **Pohon Salju / Frost**:
   - Target Hue: `200` (Cyan / Ice Blue).
   - Saturasi: kurangi menjadi `35% - 40%` dari aslinya (`s * 0.35`).
   - Lightness: `L_new = L + (1.0 - L) * k`.
2. **Pohon Musim Gugur / Golden**:
   - Target Hue: `35 - 45` (Gold / Amber Orange).
   - Saturation: naikkan `1.2x`, Lightness hangat.
3. **Pohon Rawa / Korupsi**:
   - Target Hue: `90 - 110` (Olive kusam atau ungu gelap `280`).
   - Saturation: turunkan ke `50%`, Lightness `0.85x`.

---

## 3. Animasi Goyangan Angin (*Wind Sway*)

Sprite sheet pohon beranimasi memiliki karakteristik:
1. **Batas Frame**:
   - Contoh standar: `640x78 px` = 8 frame (`80x78 px` per frame).
2. **Akar & Batang Tetap Kokoh (*Root Anchored*)**:
   - Bagian akar di tanah ($y = 65..78$) **diam** atau hanya bergeser $\le 0.5$ piksel.
3. **Puncak Kanopi Berosilasi**:
   - Goyangan maksimum terjadi di pucuk daun ($y = 0..20$).
   - Daun lepas/gugur kecil melayang di 2–3 frame sebagai pemanis (*juice*).

---

## 4. Script Utilitas Recolor (`tools/recolor_tree.py`)

Gunakan script Python berikut untuk memproses gambar/spritesheet pohon tanpa dependensi berat (`Pillow` murni):

```python
import sys, colorsys
from PIL import Image

def recolor_snow(src_path, dst_path, canopy_height=50.0):
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))

    for y in range(h):
        for x in range(w):
            r, g, b, a = img.getpixel((x, y))
            if a == 0:
                continue

            # Konversi ke HSL (colorsys: h, l, s rentang 0..1)
            h_val, l_val, s_val = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
            h_deg = h_val * 360.0

            # Deteksi dedaunan hijau (h antara 50 deg dan 170 deg)
            if 50.0 < h_deg < 170.0:
                t = min(1.0, y / canopy_height)
                k = 0.75 - 0.45 * (t ** 0.85)

                # Geser hue ke cyan/ice (200 deg)
                diff = (200.0 - h_deg + 180.0) % 360.0 - 180.0
                new_h = (h_deg + diff * 0.6) / 360.0
                new_s = s_val * 0.35
                new_l = min(1.0, l_val + (1.0 - l_val) * k)

                nr, ng, nb = colorsys.hls_to_rgb(new_h, new_l, new_s)
                out.putpixel((x, y), (int(nr * 255), int(ng * 255), int(nb * 255), a))
            else:
                out.putpixel((x, y), (r, g, b, a))

    out.save(dst_path)
    print(f"Saved: {dst_path}")

if __name__ == '__main__':
    recolor_snow(sys.argv[1], sys.argv[2])
```

---

## 5. Checklist Verifikasi Sebelum Commit

- [ ] Tidak ada garis potong horizontal (*banding artifact*) di kanopi saat diperbesar.
- [ ] Daun bagian bawah tetap memiliki kontras bayangan agar pohon tampak bervolume 3D, bukan flat 2D.
- [ ] Batang pohon tidak terkena efek recolor daun (filter HSL mengecualikan warna cokelat $h < 50^\circ$).
- [ ] Perubahan di assets disinkronkan dengan runtime canvas di `src/gfx/textures.js`.
- [ ] `python3 tools/bundle.py && npm run check` menghasilkan **0 masalah**.

