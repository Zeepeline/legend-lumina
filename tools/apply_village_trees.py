import re, subprocess

# Kita sesuaikan posisi pohon agar tidak menabrak kandang (840, 310, w: 110, h: 48) dan jalan timur (y=245-250)
# (840, 360) geser ke (910, 375) atau (905, 380) di luar kandang
# (835, 245) geser ke (870, 210) di atas jalan timur

trees_to_add = [
    # Belakang & samping Rumah Merah NW (355, 213)
    "['treeOak', 240, 95]",
    "['treeOak', 320, 85]",
    "['treeOak', 410, 85]",
    "['treeOak', 200, 160]",
    "['treeOak', 440, 175]",
    
    # Belakang & samping Penginapan / Kios Bu Sari NE (630, 213 & 746, 222)
    "['treeOak', 600, 85]",
    "['treeOak', 690, 85]",
    "['treeOak', 770, 95]",
    "['treeOak', 830, 150]",
    "['treeOak', 870, 205]", # aman dari jalan timur y=245
    
    # Belakang & samping Rumah Cokelat W (245, 390) & Kebun (110, 365)
    "['treeOak', 65, 330]",
    "['treeOak', 150, 310]",
    "['treeOak', 50, 420]",
    "['treeOak', 65, 500]",
    
    # Belakang & samping Pandai Besi E (742, 411)
    "['treeOak', 915, 375]", # aman dari kandang
    "['treeOak', 855, 450]",
    "['treeOak', 830, 520]",
    
    # Area antara E dan S (halaman selatan timur)
    "['treeOak', 660, 580]",
    "['treeOak', 725, 595]",
    
    # Dekat kolam samping barat bawah
    "['treeOak', 245, 620]",
    "['treeOak', 325, 630]",
]

with open('src/world/maps/village.js', 'r') as f:
    content = f.read()

# Masukkan ke dalam objs sebelum penutup array
# Cari posisi setelah ['lantern', 188, 495],
tree_str = ",\n    " + ",\n    ".join(trees_to_add)
content_new = content.replace("['lantern', 188, 495]", "['lantern', 188, 495]" + tree_str)

with open('src/world/maps/village.js', 'w') as f:
    f.write(content_new)

print("Saved. Checking layout...")
res = subprocess.run(['node', 'tools/check-layout.js'], capture_output=True, text=True)
print(res.stdout)
