---
name: pixel-sword-combo-vfx
description: >-
  Panduan dan standar pembuatan animasi kombo pedang/katana pixel art action RPG
  bergaya Penusbmic / Cyber Samurai, mencakup aturan geometri motion smear non-lingkaran,
  struktur 4 layer Aseprite (Smear, Cloak, Character, Lightning), aturan 2-frame windup
  dengan ambient motes, larangan residual trail pada follow-through, transisi pergelangan
  tangan mulus (wrist roll), dan skrip otomatisasi pipeline Aseprite. Gunakan skill ini
  setiap kali merancang animasi kombo pedang, karakter bersenjata tajam, atau efek tebasan.
---

# Pixel-Art Sword Combo & Combat Animation Skill (Penusbmic Standard)

Gunakan skill ini sebagai aturan baku (*gold standard*) setiap kali merancang, memprogram, atau mengekspor animasi serangan kombo pedang/katana bergaya action RPG top-down / side-view (seperti *Penusbmic Cyber Samurai / Ronin*).

---

## 1. Aturan Emas Geometri Smear (Bukan Sekadar Busur/Lingkaran)

Gunakan geometri fungsional tajam dan **alirkan secara natural (*organic aerodynamic slipstream*)** mengikuti lintasan fisik bilah dari awal hingga akhir ayunan:

1. **Diagonal Natural Sharp Leaf / Polar Slipstream (`✦`)** (Contoh: Tebasan Miring):
   - Meruncing tajam (*needle-sharp tip*) di titik awal lintasan $\theta_{\text{start}}$ (di belakang bahu).
   - Mengikuti kurva busur polar alami sekeliling poros tangan ($R_{\text{in}} \to R_{\text{out}}$), menggembung lembut proporsional (tebal 3–5 px) di tengah lintasan tanpa sudut patah poligon yang kaku.
   - Tepi depan menempel $100\%$ presisi di sepanjang bilah pedang pada posisi $\theta_{\text{end}}$.
   - Membingkai tubuh karakter tanpa menutupi wajah atau topi secara canggung.
2. **Natural Overhead Chop** (Contoh: Tebasan Menghujam Vertikal):
   - Aliran busur aerodinamis vertikal dari atas kepala melengkung mulus ke depan bawah menghujam tanah.
   - Ketebalan smear proporsional dengan panjang pedang dan tinggi badan karakter ($22\text{–}25\text{ px}$), tidak melebar berlebihan.
3. **Aerodynamic Laminar Mach Bullet / Lance** (Contoh: Tusukan Lunge / Mach Thrust):
   - Ujung tombak jarum tajam di bagian depan ($+3\text{–}4\text{ px}$ di depan ujung pedang).
   - Selubung aliran udara laminar melengkung halus parabola membungkus bilah pedang ($hx + 12, hy \pm 4.5\text{ px}$), lalu merapat kembali ke arah tangan.
   - Cincin kompresi udara ramping tunggal ($1\text{ px}$) di pangkal gagang.
4. **Solid Pure White (`#FFFFFF`) & Partikel Alami**:
   - Smear berupa siluet pekat solid murni 1-bit / high contrast tanpa gradasi buram.
   - **Partikel Alami (Bukan Petir Zigzag Kaku)**: Hanya 1–2 serpihan angin (*air motes*) 1px yang terlempar alami di sepanjang vektor tangensial ujung bilah, plus kilau bintang halus (*glint* 1–2px) di ujung pedang saat pelepasan.

---

## 2. Struktur Frame & Timing (Ritme Serangan)

Setiap serangan dalam kombo wajib memiliki 4 fase berurutan:

### A. Fase Windup (Ancang-Ancang Wajib 2–3 Frame)
- **Tujuan**: Membangun antisipasi, gaya berat, dan rasa kekuatan sebelum bilah dilepaskan.
- **Efek Visual**:
  - **DILARANG KERAS** memunculkan garis tebasan (*slash lines*) saat windup!
  - Gunakan **Ambient Cyber Motes (1–2px)** di kejauhan / debu mengapung di sekitar karakter.
  - Tambahkan percikan pengisian daya mini (*charge sparks*) pada bilah katana di layer petir.

### B. Fase Strike (Tebasan Aktif — 1 Frame Saja, 60ms)
- **Tujuan**: Kecepatan supersonik instan.
- **Efek Visual**:
  - Motion smear solid putih pekat (`#FFFFFF`) meledak penuh dari posisi awal bilah hingga posisi akhir.
  - Sambaran petir bergerigi meledak bersamaan di layer `Cyber_Lightning`.

### C. Fase Follow-Through (Hentakan Akhir — 1 Frame, 80ms)
- **Tujuan**: Menunjukkan berat dan penyelesaian ayunan senjata.
- **Aturan Mutlak**:
  - **BERSIH TOTAL DARI GARIS TEBASAN / RESIDUAL TRAIL**.
  - Jangan membiarkan outline garis putih melayang di udara.
  - Karakter memegang katana di pose akhir (menancap tanah, di samping lutut, atau lunge lurus).
  - Jubah terkibas penuh menahan gaya sentrifugal.

### D. Fase Transisi Mulus (*Smooth Wrist Roll* — 1 Frame, 80–90ms)
- **Tujuan**: Menghubungkan serangan sebelumnya ke ancang-ancang serangan berikutnya tanpa gerakan melompat/patah.
- **Mekanika**:
  - Pergelangan tangan berotasi halus (±40° per frame), mengalirkan bilah secara kontinyu.
  - Jubah meluncur turun mengendur alami mengikuti gravitasi.

---

## 3. Struktur 4 Layer Wajib di Aseprite

Pisahkan animasi ke dalam 4 layer mandiri dengan urutan Z-Order berikut:

| Z-Order | Nama Layer | Deskripsi & Isi |
|---|---|---|
| **Layer 4 (Paling Atas)** | `Cyber_Lightning` | Sambaran petir bergerigi, percikan listrik statis, ground shock arcs, dan sheathe glint spark. |
| **Layer 3** | `Character_Sword` | Tubuh karakter, kaki, bayangan tanah, kabel inersia, wajah, topi kasa, dan bilah katana. |
| **Layer 2** | `Cloak_Dynamics` | Jubah dinamis yang bereaksi terhadap gaya inersia (mengembang saat strike, turun saat recovery). |
| **Layer 1 (Paling Bawah)** | `Angular_Motion_Smear` | Motion smear putih pekat solid (hanya aktif pada frame strike) dan ambient motes saat windup. |

---

## 4. Standar Animation Tags di Timeline Aseprite

Gunakan tag terpisah untuk setiap windup dan strike agar animator mudah menavigasi timeline:

```lua
-- Template Tag Aseprite
local t1 = spr:newTag(1, 3);   t1.name = "Windup_1";         t1.color = Color{r=255, g=200, b=50}  -- Emas
local t2 = spr:newTag(4, 6);   t2.name = "Strike_Overhead";  t2.color = Color{r=255, g=80, b=80}   -- Merah
local t3 = spr:newTag(7, 8);   t3.name = "Windup_2";         t3.color = Color{r=255, g=200, b=50}  -- Emas
local t4 = spr:newTag(9, 11);  t4.name = "Strike_Diagonal";  t4.color = Color{r=80, g=200, b=255}  -- Biru Langit
local t5 = spr:newTag(12, 13); t5.name = "Windup_3";         t5.color = Color{r=255, g=200, b=50}  -- Emas
local t6 = spr:newTag(14, 16); t6.name = "Strike_Thrust";    t6.color = Color{r=255, g=120, b=50}  -- Oranye
local t7 = spr:newTag(17, 21); t7.name = "Sheathe_Recovery"; t7.color = Color{r=180, g=120, b=255} -- Ungu
```

---

## 5. Pipeline Ekspor & Sinkronisasi macOS

1. **Generator Python (`tools/create_master_reference_combo.py`)**:
   - Render frame PNG terpisah per layer ke folder sementara (`/tmp/.../vfx`, `cloak`, `char`, `lightning`).
2. **Kompilator Aseprite CLI via Lua**:
   - Buat file `.aseprite` menggunakan binary `/Applications/Aseprite.app/Contents/MacOS/aseprite -b --script <script.lua>`.
   - Simpan langsung ke `assets/aseprite/<nama_file>.aseprite`.
3. **Catatan Auto-Reload Aseprite macOS**:
   - Aseprite GUI menahan file memori jika tab sudah terbuka dengan tanda bintang (`*`).
   - Beritahu pengguna untuk menutup tab lama (**`Cmd + W`**, Don't Save) lalu membuka kembali lewat **File > Open Recent** agar perubahan disk segera termuat.
