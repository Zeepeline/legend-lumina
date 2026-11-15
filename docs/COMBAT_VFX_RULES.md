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

## 6. Spesifikasi *Charge Attack* (Gelombang Angin Tanah Meluas & Tebasan Putar 360°)

Aset: `assets/img/vfx_charge_spin.png` (`588×48`, 7 frame @ `84×48`).

1. **Fase Menahan Tombol (*Expanding Ground-Wind Shockwave* — Frame `0..2`)**:
   - **Tubuh Karakter Tetap Bersih**: Arka merendahkan kuda-kuda (`side1`) dengan pedang ditarik ke pinggang belakang (`-145°` s/d `-152°`, berkilat putih penuh saat `holdA >= 0.45s`). **Jangan** menaruh pilar vertikal yang menutupi tubuh/kepala Arka.
   - **Aset Angin Tanah yang Meluas (`draw_expanding_ground_wind`)**:
     - Hanya gelombang angin di tanah tepat di bawah kaki yang **semakin meluas secara radial ke kiri-kanan semakin lama tombol ditahan**:
       - **Frame 0 (`holdA < 0.32s` — *Hold Awal*)**: Cincin angin kecil di bawah kaki (`radius ~12 px`).
       - **Frame 1 (`0.32s–0.62s` — *Hold Sedang*)**: Gelombang angin melebar (`radius ~21 px`) dengan ekor angin melengkung naik di ujung kiri-kanan.
       - **Frame 2 (`> 0.62s` — *Hold Lama / Penuh*)**: Gelombang angin meluas lebar (`radius ~34 px` + `scaleX` terus bertambah hingga `1.55×`) dengan cincin lapis kedua di bagian dalam.
2. **Fase Pelepasan (*360° Spiral Cleave & Sequential Hit Timing* — Frame `3..6`)**:
   - **Frame 3 (*Release Whip*)**: Pedang menyabet area depan lebih dulu (`-152° → +25°`); musuh di depan langsung terkena tebasan pada `0 ms`.
   - **Frame 4 (*360° Cyclone Peak*)**: Arka memutar badan (`flipX`) menyapu punggungnya (`+25° → +335°`); jejak bilah membentuk pusaran elips 360° (`rx = 1.28, ry = 0.78`), dan musuh di belakang terkena tebasan `70 ms` kemudian sesuai urutan lewatnya bilah pedang.
   - **Frame 5–6 (*Vortex Break Apart $\to$ Dissipation*)**: Ekor pusaran menguap searah putaran pedang menjadi pita tipis dan percikan kecil.
   - Radius dan damage tebasan 360° ikut membesar (`hMul` hingga `1.4×`) sebanding dengan lamanya pemain menahan tombol.

---

## 7. Fisika & Anatomi Partikel Sekunder (Hasil Studi `pixelfx`)

Koreografi tubuh dan ayunan bilah utama tetap menggunakan standar *Legenda Lumina* (Bagian 1–6), namun untuk **efek partikel sekunder** (percikan baja, serpihan angin, debu lantai, bara, dan serpihan benturan), gunakan prinsip fisika dan anatomi partikel dari `patch-gg/pixelfx`:

### 7.1 Sepuluh Spesies Partikel (Jangan Hanya Titik `1×1` Seragam!)
1. **`SPARK` (Percikan Benturan Baja — *Two-Tone Velocity Streak & Floor Bounce*)**:
   - **Bentuk**: Bukan titik bulat, melainkan **garis kecepatan 2-warna** sepanjang vektor gerak $(u_x, u_y)$ dengan panjang proporsional terhadap laju: $L = \min(9, 1 + v \cdot 0.022)$.
   - **Warna**: Bagian kepala ($45\%$ depan) berwarna panas (`#ffffff` $\to$ `#fff3a6`), ekor ($55\%$ belakang) berwarna lebih dingin (`#ff8a2a` $\to$ `#f2561d`).
   - **Fisika**: Meluncur cepat ($150\text{–}400\text{ px/s}$), gravitasi sedang ($g = 420\text{ px/s}^2$), *air drag* ($2.2/\text{s}$), dan **memantul saat menyentuh lantai** ($v_y \leftarrow -0.45 |v_y|$, $v_x \leftarrow 0.7 v_x$).
2. **`MOTE` (Serpihan Angin Bilah / *Blade Shavings*)**:
   - **Asal**: Terkelupas (*flung off*) dari tepi luar busur ayunan pedang (`r = R_outer`) searah tangen ayunan + sedikit gaya sentrifugal keluar.
   - **Bentuk**: Garis tipis memanjang mengikuti kecepatan ($g = 0$, *drag* ringan $0.6/\text{s}$), kepala terang dan ekor `55%` lebih redup.
3. **`DOTTED TRACE` (Jejak Residu Dither di Ekor Tebasan)**:
   - Saat busur tebasan (*smear*) mulai menyusut pada fase *Decay*, tinggalkan **deretan titik-titik tipis (`1 px`) tepat di garis keliling luar lintasan ujung pedang (`R_outer - 0.5`)** yang memudar dengan pola *Ordered Bayer 4×4 Dither*.
4. **`STREAK` (Garis Hisap Konvergensi saat *Charge / Windup*)**:
   - Muncul di radius luar ($14\text{–}26\text{ px}$) lalu **dipercepat masuk** menuju titik fokus senjata ($v \leftarrow v + 3v \cdot dt$), dengan ujung depan putih tajam dan ekor bergradasi.
5. **`GRIT` (Kerikil Kecil / *Hot Chips* yang Berhenti di Tanah)**:
   - Terpental dengan gravitasi penuh ($g = 950\text{ px/s}^2$), memantul sekali di tanah ($v_y \leftarrow -0.25 v_y$), lalu **berhenti diam di permukaan tanah ($v_x = v_y = 0$)** selama beberapa milidetik sebelum menghilang. Digambar `1×1` atau `2×2` dengan sisi bawah lebih gelap (`0.7×`).
6. **`SHARD` & `CHUNK` (Serpihan Tajam & Bongkahan Batu Berfaset yang Berputar)**:
   - Memiliki sudut rotasi $\theta$ dan kecepatan putar $\omega$ ($\theta \leftarrow \theta + \omega \cdot dt$).
   - Digambar sebagai poligon kecil berfaset dengan **pencahayaan 3-sisi** (sisi menghadap kiri-atas terang `light`, tengah `body`, sisi bawah-kanan gelap `shade`, plus `1 px` *dark outline* `#1a1422`). Saat berhenti di tanah, memicu 1–2 kepulan `DUST` kecil.
7. **`EMBER` (Bara Mengambang dengan Turbulensi Sinus)**:
   - Bergerak naik perlahan ($v_y = -30\text{ px/s}$) sambil meliuk-liuk secara organik menggunakan gelombang sinus ganda: $v_x \mathrel{+}= \cos(2.3t + \text{seed})\cdot 45\,dt$, $v_y \mathrel{+}= \sin(3t + \text{seed})\cdot 20\,dt$, dan berkedip (*flicker*) menjelang padam.
8. **`SMOKE` & `DUST` (Kepulan Asap/Debu 3-Lapis Bervolume)**:
   - Digambar di layer belakang (`back`) menggunakan **3 cakram transparan bertumpuk**: cakram dasar, inti bawah yang lebih pekat (`0.74r`), dan **tudung atas yang terkena cahaya (`lit cap`)** saat kepulan masih muda (`age < 0.5`).
9. **`BROKEN RING` (Cincin Kejut yang Retak Menjadi Busur Sabit)**:
   - Cincin kejut (*shockwave ring*) tidak sekadar membesar lalu transparan, melainkan **terbelah menjadi 5–7 segmen busur sabit** dengan celah (*gap*) yang makin melebar, ketebalan ujung yang meruncing, dan kecepatan radial yang sedikit bervariasi per segmen.
10. **`BLADE GLINT / SPARKLE` (Kilau Bintang 4-Lengan di Titik Awal/Akhir Ayunan)**:
    - Saat pedang selesai ditarik (*charge penuh*) atau tepat ketika ujung bilah menyelesaikan sabetan (*slash end*), munculkan kilau bintang 4-lengan (`CROSS` + `DIAG` dengan inti `WHITE` 1px) yang membesar cepat (`ease.outBack`) lalu menyusut dalam `150–220 ms`.

### 7.2 Aturan *Ordered Bayer Dither* vs *Alpha Blend* & Larangan Percikan Api pada Hit Biasa
- **Dilarang Memakai Percikan Api pada Tebasan Fisik Biasa**: Saat pedang/senjata biasa mengenai musuh (`hitFx`), **jangan** memunculkan percikan api berwarna kuning/oranye/merah (`sparkle('spark'/'doto')` atau `SPARK` api) agar tebasan fisik tetap bersih (cukup *White Hit-Flash* + semburan angin/benturan putih `vfx_hit_impact` + `MOTE`/`DOTTED TRACE` pada ayunan bilah). Gunakan percikan api/bara (`SPARK`/`EMBER`) khusus untuk jurus berelemen api atau hantaman tanah khusus.
- **Partikel Keras (`MOTE`, `SHARD`, `GRIT`, `DOTTED TRACE`)**: **Jangan** memudarkan dengan *alpha opacity* halus yang membuat piksel terlihat kabur/becek. Gunakan pengurangan jumlah piksel (**4×4 Ordered Bayer Dither**).
- **Partikel Volume Lembut (`SMOKE`, `DUST`, `VAPOUR`)**: Boleh menggunakan *translucent disc* (`alpha 0.35–0.65`) di layer belakang karakter/musuh.

---

## 8. Prinsip Animasi & *Smear Interpolation* ala `t3ssel8r`

Berdasarkan studi video devlog `t3ssel8r` (*"Making an Animation for my 3D Pixel Art Game"* — `youtu.be/1FrIBkuq0ZI`), terdapat **4 pilar utama** untuk membuat animasi serangan pixel-art terasa berbobot, cepat (*snappy*), dan hidup:

### 8.1 *Smear Interpolation* vs Interpolasi Linear (`4:05 smear interpolation`)
- **Masalah Interpolasi Biasa**: Pada pixel art ber-framerate rendah, interpolasi posisi pedang secara linear di antara dua frame membuat pedang tampak "melayang tanggung" atau memotong lurus menembus tubuh (*chord clipping*).
- **Solusi *Cylindrical / Polar Smear Mesh***:
  1. Lintasan gagang pedang (*Hilt*) dan ujung pedang (*Tip*) diinterpolasikan dalam **koordinat polar/silinder mengelilingi poros bahu/tubuh karakter**, bukan garis lurus Kartesius.
  2. Selama frame tebasan cepat (*active cut*), seluruh ruang sapuan antara posisi $(\text{Hilt}(u), \text{Tip}(u))$ dari sudut frame sebelumnya $\theta_{t-1}$ hingga sudut saat ini $\theta_t$ diisi menjadi **jaring pita *Smear* (*Swept Quad Fan*)** yang meruncing di pangkal awal dan menempel penuh di sepanjang bilah pedang pada $\theta_t$.
  3. **lompatan *Snappy* (Tanpa Frame Tengah yang Lambat)**: Gerakan besar (*large action*) melompat langsung dari **Pose Windup Ekstrem** ke **Pose Ekstensi Penuh + Smear Sabit** dalam 1 langkah tajam, bukan dicicil dengan banyak posisi pedang di tengah jalan.

### 8.2 Rantai Kinematika Tubuh & *Counter-Balance* (`4:47 animation second pass`)
Ayunan pedang yang bertenaga tidak boleh hanya menggerakkan lengan (seperti *first pass* yang kaku), melainkan melibatkan seluruh tubuh:
1. **Coiling (Puntiran Antisipasi)**: Lutut menekuk rendah, badan memuntir ke belakang (*torso twist*), dan senjata ditarik jauh ke belakang bahu.
2. **Center-of-Mass Shift & Whip Chain**: Titik pusat massa (*Center of Mass*) dan kaki tumpuan melangkah maju **mendahului** ayunan tangan, lalu tenaga mengalir berurutan seperti cambuk: $\text{Kaki} \to \text{Pinggul} \to \text{Bahu} \to \text{Siku} \to \text{Tangan} \to \text{Ujung Pedang}$.
3. **Counter-Balance Arm & Overshoot**: Saat tangan kanan mengayunkan pedang habis ke depan/samping, **lengan kiri terentang ke arah berlawanan sebagai penyeimbang (*counter-balance*)**, dan tubuh sedikit melampaui titik henti (*overshoot*) sebelum kembali stabil (*settle*).

### 8.3 *Secondary Motion / Overlapping Action* (`6:03 secondary motion and tweaks`)
Untuk menghilangkan kesan kaku pada sprite piksel, tambahkan **gerakan sekunder yang tertinggal fase (*phase-lagged follow-through*)** menggunakan dinamika pegas (*second-order dynamics*) pada elemen pakaian/rambut/syal:
- **Saat Menerjang (*Lunge*)**: Jubah, syal, dan rambut tertarik berkibar ke belakang berlawanan dengan arah dorongan badan.
- **Saat Berhenti Mendadak (*Impact / Follow-Through Stop*)**: Ketika tubuh berhenti di akhir tebasan, jubah dan rambut **masih meneruskan momentumnya mengayun sedikit ke depan (*overshoot whip*)** selama 1–2 frame sebelum turun kembali ke posisi tenang.

### 8.4 *Selective Frame Dropping* (Kontras Ritme Frame)
- **Aksi Besar (*The Slash*)**: Gunakan sedikit frame posisi tubuh namun dibantu **Smear Frame lebar** agar terasa eksplosif.
- **Aksi Kecil (*Windup Coiling & Recovery Settle*)**: Gunakan *limited animation* dan penahanan frame (*frame holds*) dengan *secondary motion* halus pada rambut/jubah agar ritme antara "tahan $\to$ ledak $\to$ tahan" terbaca jelas oleh mata pemain.

---

## 9. Wajib Preview Sebelum Implementasi

Setiap kali membuat atau memodifikasi aset VFX pertarungan:
1. Render **GIF animasi komparasi berdampingan** (*Kolom Kiri: Tebas Angin / Whiff* vs *Kolom Kanan: Kena Musuh / On-Hit Impact*) dengan `Image.NEAREST` (tanpa interpolasi blur).
2. Render **lembar Breakdown Puncak (*Peak Frame Sheet*)** untuk setiap tahap kombo agar bentuk siluet dan keterkaitan bilah pedang terlihat jelas per frame.
3. Tampilkan ke pemilik melalui artifact review terlebih dahulu sebelum mengubah kode di `src/systems/combat_fx.js`.
