import cv2
import numpy as np
from PIL import Image
from rembg import remove

# 1. Hapus latar belakang gradasi menjadi transparan
input_path = "Colorful Pixel-Art Nature Asset Sheet.png"
img_pil = Image.open(input_path)
img_no_bg = remove(img_pil)
img_np = np.array(img_no_bg)

# 2. Deteksi area masing-masing bangunan berdasarkan transparansi (Alpha channel)
alpha = img_np[:, :, 3]
_, thresh = cv2.threshold(alpha, 50, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Urutkan dari atas ke bawah, lalu kiri ke kanan
bounding_boxes = [cv2.boundingRect(c) for c in contours if cv2.contourArea(c) > 500]
bounding_boxes.sort(key=lambda b: (b[1] // 80, b[0]))

# 3. Simpan setiap bangunan ke file PNG terpisah dengan sedikit margin (padding)
padding = 5
for idx, (x, y, w, h) in enumerate(bounding_boxes, start=1):
    x1 = max(0, x - padding)
    y1 = max(0, y - padding)
    x2 = min(img_np.shape[1], x + w + padding)
    y2 = min(img_np.shape[0], y + h + padding)

    potongan = img_no_bg.crop((x1, y1, x2, y2))
    potongan.save(f"experiment/karakter{idx:03d}.png")

print(f"Selesai! Berhasil memotong {len(bounding_boxes)} bangunan dengan rapi.")
