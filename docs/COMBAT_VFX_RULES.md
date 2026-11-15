# COMBAT VFX & MELEE ANIMATION RULES — Panduan Pembuatan Aset Tebasan & Benturan

Dokumen ini merangkum prinsip, arsitektur, rumus prosedural piksel, dan alur kerja pembuatan **Melee Combat VFX & Weapon Choreography** di *Legenda Lumina* (mengacu pada standar visual *pixel-art action RPG* ala Godot battle VFX).

---

## 1. Prinsip Utama: Sebab-Akibat Fisik (*Physical Cause & Effect*)

Efek serangan jarak dekat (**Melee VFX**) **BUKAN** objek mandiri atau proyektil yang terbang menjauh dari karakter, melainkan **akibat fisik langsung dari pergerakan senjata**.

### Aturan Mutlak:
1. **Rantai Sebab-Akibat**:
   $$\text{Postur Tubuh} \longrightarrow \text{Titik Genggam Tangan } (hx, hy) \longrightarrow \text{Sapuan Bilah } (\theta_{\text{start}} \to \theta_{\text{end}}) \longrightarrow \text{Jejak Udara (Whiff)} \longrightarrow \text{Semburan Benturan di Titik Luka (On-Hit)}$$
2. **Dilarang Menambahkan Efek Tanpa Sebab**:
   - **Jangan** menaruh garis angin atau ledakan semu di belakang punggung/kepala karakter jika pedang tidak melewati area tersebut.
   - **Jangan** memunculkan efek tebasan pada frame *Windup* (ancang-ancang) sebelum bilah pedang benar-benar bergerak mengayun.
   - **Jangan** menggunakan poligon segitiga/kotak lurus yang kaku (`polygon` bersudut tajam) atau gambar AI beresolusi tinggi yang di-*downscale* (menghasilkan *blur/pillow-shading*). Gunakan **piksel tajam (*crisp hard pixels*)** dengan kurva organik meruncing.

---

## 2. Pemisahan 2 Lapis Sistem VFX: *Whiff* vs *On-Hit*

Jangan menggabungkan busur ayunan pedang dengan ledakan benturan besar dalam satu sprite statis. Pisahkan menjadi **2 tekstur independen**:

### A. Lapis 1 — Jejak Sapuan Bilah (*Weapon Swing Smear* / `vfx_swing_combo.png`)
- **Kapan Muncul**: Selalu muncul setiap kali karakter mengayunkan senjata (baik menebas angin/*whiff* maupun mengenai musuh).
- **Bentuk & Logika**:
  - Merupakan **jejak udara yang baru saja dibelah oleh bilah pedang (*motion smear*)** dari sudut awal $\theta_{\text{start}}$ menuju sudut saat ini $\theta_{\text{end}}$ dengan poros di tangan $(hx, hy)$.
  - **Ujung Belakang (Tail, $u = 0$)**: Meruncing tipis di sudut awal ayunan $\theta_{\text{start}}$.
  - **Tepi Depan (Leading Edge, $u = 1$)**: Bagian paling tebal dan padat **wajib menempel 100% rapat di sepanjang bilah pedang pada posisi $\theta_{\text{end}}$**.
  - **Fase Peluruhan (*Decay $\to$ Sparks*)**: Ekor belakang menguap terlebih dahulu mengikuti arah gerak menuju ujung bilah, lalu menyisakan 2–3 titik percikan udara kecil di sepanjang garis singgung lintasan ujung pedang.

### B. Lapis 2 — Semburan Benturan Musuh (*Directional On-Hit Burst* / `vfx_hit_impact.png`)
- **Kapan Muncul**: **HANYA** dipicu di dalam `hitFx(e, crit)` ketika bilah pedang benar-benar memotong hitbox musuh.
- **Bentuk & Logika**:
  - **Enemy White Hit-Flash**: Sprite musuh yang terkena tebasan langsung diubah menjadi siluet putih murni (`setTintFill(0xffffff)`) selama `55–65 ms` bersamaan dengan *hitstop*.
  - **Titik Muncul**: Tepat di titik kontak bilah pedang dengan tubuh musuh.
  - **Arah Semburan (*Directional Plumes*)**: Semburan organik melengkung (*Quadratic Bézier tapered wisps*) menyembur keluar dari luka mengikuti **vektor arah gaya sabetan pedang**:
    - Tebasan turun (*Hit 1*) $\rightarrow$ semburan miring ke kanan-bawah (`+24°`).
    - Sabetan balik naik (*Hit 2*) $\rightarrow$ semburan terangkat ke kanan-atas (`-34°`).
    - Sapuan mendatar & tusukan (*Hit 3 & 4*) $\rightarrow$ semburan lurus mendatar (`0°`) menembus ke belakang musuh.
    - Hantaman atas *Finisher* (*Hit 5*) $\rightarrow$ semburan besar (`vfx_hit_1`) meledak ke kanan-bawah (`+18°`) menyapu tanah.

---

## 3. Koreografi Tubuh & Penguncian Tangan (*Hand-Locked Sword & Pose Cycling*)

Agar pedang tidak terlihat melayang di depan badan:

1. **Siklus Postur Tubuh (`pl.atkPose`)**:
   - Jangan membekukan karakter di satu frame (`side3`) selama serangan.
   - Sikluskan frame dari `hero_custom.png` (`20×26` per frame):
     - **Windup (`0–35 ms`)**: `side1` (badan menarik ancang-ancang) atau `side3` (untuk sabetan balik *Hit 2*).
     - **Active Lunge & Impact (`35–125 ms`)**: `side2` (postur tubuh membungkuk rendah menerjang ke depan + dorongan fisik `lunge`).
     - **Follow-Through (`125–195 ms`)**: `side3` sebelum kembali ke `side0` (*idle*).
2. **Koordinat Titik Genggam Tangan (`hx, hy`)**:
   - Gagang pedang (`this.sword`, `origin(0.1, 0.5)`) dan poros `vfx_swing_combo` (`origin(14/48, 18/36)`) dikunci pada koordinat tangan Arka:
     - Di dunia game (`combat_fx.js`): `hx = pl.x + dx * 5`, `hy = pl.y - 7 + dy * 4`.
     - Pada kanvas sprite `20×26` (`side2`): telapak tangan depan berada di piksel `(15, 19)` dengan warna kulit `#fdd2b0` dan bayangan kepalan `#aa584d` yang menutup gagang pedang.

---

## 4. Spesifikasi Rangkaian 5-Hit Melee Combo

| Tahap | Nama Serangan | Sudut Ayunan ($\theta_{\text{start}} \to \theta_{\text{end}}$) | Karakteristik Jejak Bilah (`vfx_swing_combo`) | Vektor *On-Hit Impact* | Pengali Damage (`cMul`) |
|---|---|---|---|---|---|
| **Hit 1** | *Downward Diagonal Slash* | `-85° → +22°` | Sapuan melengkung dari kanan-atas ke kanan-bawah | `+24°` (kanan-bawah) | `1.00×` |
| **Hit 2** | *Upward Reverse Slash* | `+58° → -48°` | Sabetan balik melengkung dari kanan-bawah ke kanan-atas | `-34°` (kanan-atas) | `1.10×` |
| **Hit 3** | *Wide Horizontal Sweep* | `-42° → +8°` | Sapuan mendatar melebar (`rx_scale = 1.22`) | `+4°` (mendatar) | `1.22×` |
| **Hit 4** | *Piercing Lunge Thrust* | `0°` (tusukan lurus `+9 px`) | Selubung kompresi udara berbentuk kerucut *Mach* di sepanjang bilah | `0°` (tembus lurus) | `1.38×` |
| **Hit 5** | *Heavy Overhead Finisher* | `-95° → +32°` | Busur tebasan tebal dari atas kepala menghantam ke tanah | `+18°` (*Heavy Burst* `vfx_hit_1`) | `1.85×` + `'KOMBO!'` |

---

## 5. Rumus Generator Piksel Prosedural (Python / PIL)

Gunakan fungsi berikut saat membuat atau merevisi spritesheet `assets/img/vfx_swing_combo.png` (`192×180`, 5 baris × 4 kolom @ `48×36`) dan `assets/img/vfx_hit_impact.png` (`240×72`, 2 baris × 5 kolom @ `48×36`):

### 5.1 Generator Sapuan Bilah (`draw_blade_sweep_smear`)
```python
def draw_blade_sweep_smear(canvas, hx, hy, ang_start, ang_end, blade_len, thickness=3.5, rx_scale=1.0, phase="peak"):
    px = canvas.load()
    W, H = canvas.size
    steps = 100
    for i in range(steps + 1):
        u = i / steps  # 0.0 = ekor awal ayunan, 1.0 = tepi depan menempel di bilah pedang
        ang = ang_start + (ang_end - ang_start) * u
        rad = math.radians(ang)
        dx, dy = math.cos(rad) * rx_scale, math.sin(rad)

        if phase == "peak":
            band_w = thickness * (u ** 1.35)
            r_outer = blade_len + 0.6 * math.sin(u * math.pi)
            r_inner = max(3.5, r_outer - band_w * 2.1)
            notch = 1.1 * math.sin(u * math.pi * 3) if 0.25 < u < 0.8 else 0.0
            r_inner += max(0.0, notch)
        elif phase == "decay":
            if u < 0.48: continue
            u_local = (u - 0.48) / 0.52
            band_w = (thickness * 0.52) * math.sin(u_local * math.pi)
            r_outer = blade_len + 0.8
            r_inner = r_outer - band_w * 1.7
        elif phase == "sparks":
            if i not in (62, 78, 92): continue
            r_outer, r_inner = blade_len + 1.0, blade_len - 0.1

        r = r_inner
        while r <= r_outer:
            ix, iy = int(round(hx + dx * r)), int(round(hy + dy * r))
            if 0 <= ix < W and 0 <= iy < H:
                px[ix, iy] = (255, 255, 255, 255)
            r += 0.45
```

### 5.2 Generator Semburan Benturan Terarah (`draw_directional_hit_impact`)
```python
def draw_directional_hit_impact(canvas, hit_x, hit_y, force_angle_deg, phase="peak", is_heavy=False):
    px = canvas.load()
    W, H = canvas.size
    scale = 1.28 if is_heavy else 1.0
    plumes = [
        (0,   -6,  17 * scale, 2.1 * scale, 2.7 * scale),
        (-26, -16, 14 * scale, 1.7 * scale, 2.1 * scale),
        (22,   14, 13 * scale, 1.5 * scale, 1.9 * scale),
        (-54, -20, 10 * scale, 1.1 * scale, 1.5 * scale),
        (48,   16,  9 * scale, 1.0 * scale, 1.3 * scale),
    ]
    for (a_off, bend, plen, ws, wm) in plumes:
        for i in range(46):
            t = i / 45.0
            if phase == "decay" and t < 0.40: continue
            if phase == "sparks" and i not in (34, 42): continue
            dist = (t * plen) + (2.5 if phase == "decay" else (4.0 if phase == "sparks" else 0.0))
            cur_ang = math.radians(force_angle_deg + a_off + bend * t)
            cx, cy = hit_x + math.cos(cur_ang) * dist, hit_y + math.sin(cur_ang) * dist
            r = ws * (1 - t) + wm * math.sin(t * math.pi) * (1 - t * 0.4) if phase == "peak" else (
                (wm * 0.58) * math.sin(((t - 0.40) / 0.60) * math.pi) if phase == "decay" else 0.8)
            r_int = int(math.ceil(r))
            for dy in range(-r_int - 1, r_int + 2):
                for dx in range(-r_int - 1, r_int + 2):
                    if dx*dx + dy*dy <= r*r + 0.1:
                        ix, iy = int(round(cx + dx)), int(round(cy + dy))
                        if 0 <= ix < W and 0 <= iy < H:
                            px[ix, iy] = (255, 255, 255, 255)
```

---

## 6. Wajib Preview Sebelum Implementasi

Setiap kali membuat atau memodifikasi aset VFX pertarungan:
1. Render **GIF animasi komparasi berdampingan** (*Kolom Kiri: Tebas Angin / Whiff* vs *Kolom Kanan: Kena Musuh / On-Hit Impact*) dengan `Image.NEAREST` (tanpa interpolasi blur).
2. Render **lembar Breakdown Puncak (*Peak Frame Sheet*)** untuk setiap tahap kombo agar bentuk siluet dan keterkaitan bilah pedang terlihat jelas per frame.
3. Tampilkan ke pemilik melalui artifact review terlebih dahulu sebelum mengubah kode di `src/systems/combat_fx.js`.
