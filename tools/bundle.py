# Gabungkan semua file menjadi SATU file: dist/game.html
# Berguna untuk dibuka langsung (klik dua kali) tanpa server, atau dibagikan sebagai satu file.
# Jalankan dari folder proyek:  python3 tools/bundle.py
import base64, json, os, re
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
html = rd('index.html')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + rd('styles.css') + '</style>')
imgs = {}
d = os.path.join(root, 'assets', 'img')
for f in sorted(os.listdir(d)):
    if f.endswith('.png'): imgs[f[:-4]] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(d, f), 'rb').read()).decode()
srcs = re.findall(r'<script src="(src/[^"]+)"></script>', html)
code = 'window.IMG_INLINE = ' + json.dumps(imgs) + ';\n' + '\n'.join(rd(s) for s in srcs)
html = re.sub(r'(<script src="src/[^"]+"></script>\n?)+', lambda m: '<script>\n' + code.replace('</script', '<\\/script') + '\n</script>\n', html, count=1)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
open(os.path.join(root, 'dist', 'game.html'), 'w', encoding='utf-8').write(html)
print('dist/game.html dibuat:', len(srcs), 'skrip,', len(imgs), 'gambar,', len(html) // 1024, 'KB')
