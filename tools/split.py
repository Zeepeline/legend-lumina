# Pemecah file besar (dipakai sekali untuk refactor; boleh dipakai lagi).
#   python3 tools/split.py top    <file> <folder> <ringkasan>          # file berisi fungsi/const global
#   python3 tools/split.py mixin  <file> <folder> <ringkasan>          # file Object.assign(World.prototype, {...})
# Hasil: <folder>/<nama>_<n>.js (maks LIMIT baris), daftar file dicetak untuk index.html.
import os, re, sys
LIMIT = 400


def pack(units, limit=LIMIT):
    out, cur, n = [], [], 0
    for u in units:
        if cur and n + len(u) > limit:
            out.append(cur); cur, n = [], 0
        cur.append(u); n += len(u)
    if cur: out.append(cur)
    return out


def split_top(lines):
    """Pecah di awal deklarasi tingkat atas (kolom 0), komentar di atasnya ikut."""
    starts = []
    for i, l in enumerate(lines):
        if re.match(r'(async function|function|const|let|var|class|Object\.assign|//)', l):
            if l.startswith('//') and i and lines[i - 1].startswith('//'): continue
            starts.append(i)
    starts = [s for s in starts if s > 0] or [0]
    units, prev = [], 0
    for s in starts + [len(lines)]:
        if s > prev: units.append(lines[prev:s]); prev = s
    return units


def name_of(u):
    for l in u:
        m = re.match(r'\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(', l)
        if m and not l.lstrip().startswith('//'): return m.group(1)
    return '?'


def split_mixin(body):
    """body = baris di dalam Object.assign(..., { ... }); unit = satu metode (+ komentar di atasnya)."""
    units, cur = [], []
    for l in body:
        if re.match(r'  (async )?[A-Za-z_$][\w$]*\s*\(', l) and any(not x.strip().startswith('//') and x.strip() for x in cur):
            units.append(cur); cur = []
        cur.append(l)
    if cur: units.append(cur)
    fixed = []
    for u in units:
        u = list(u)
        while u and not u[-1].strip(): u.pop()
        if u and not u[-1].rstrip().endswith(','): u[-1] = u[-1].rstrip('\n') + ',\n'
        fixed.append(u)
    return fixed


def main():
    mode, src, folder, desc = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    groups = sys.argv[5] if len(sys.argv) > 5 else None  # mixin: file python berisi fungsi cat(nama)->kategori
    lines = open(src, encoding='utf-8').readlines()
    assert lines[0].startswith("'use strict'")
    base = os.path.splitext(os.path.basename(src))[0]
    os.makedirs(folder, exist_ok=True)
    files = []
    if mode == 'top':
        body = lines[1:]
        while body and body[0].startswith('//'): body = body[1:]
        for i, ch in enumerate(pack(split_top(body)), 1):
            p = os.path.join(folder, f'{base}_{i}.js')
            open(p, 'w', encoding='utf-8').write(f"'use strict';\n// {desc} ({i}) — isi: lihat docs/CODEMAP.md\n" + ''.join(l for u in ch for l in u))
            files.append(p)
    else:
        head = next(i for i, l in enumerate(lines) if l.startswith('Object.assign('))
        tail = max(i for i, l in enumerate(lines) if l.startswith('});'))
        opener = lines[head]
        units = split_mixin(lines[head + 1:tail])
        cats = {}
        if groups:
            ns = {}; exec(open(groups).read(), ns)
            for u in units: cats.setdefault(ns['cat'](name_of(u)), []).append(u)
        else:
            cats[base] = units
        for cat, us in cats.items():
            chunks = pack(us)
            for i, ch in enumerate(chunks, 1):
                nm = cat if len(chunks) == 1 else f'{cat}_{i}'
                p = os.path.join(folder, nm + '.js')
                open(p, 'w', encoding='utf-8').write(f"'use strict';\n// {desc}: {cat} — isi: lihat docs/CODEMAP.md\n" + opener + ''.join(l for u in ch for l in u) + '});\n')
                files.append(p)
    print('\n'.join(files))


main()
