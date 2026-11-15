import re, subprocess

# Kita ganti penambahan pohon di village.js dengan 'treeA' (atau OBJ_SPAWN.treeOak = OBJ_SPAWN.treeA dan treeOak key i_treeA)
with open('src/world/objects.js', 'r') as f:
    obj_js = f.read()

# Update treeOak di objects.js
# treeOak: { key: 'i_treeOak' -> key: 'i_treeA'
obj_js_new = obj_js.replace("treeOak: { key: 'i_treeOak', col: [14, 8, 2], sh: [26, 6], fade: 1 }",
                            "treeOak: { key: 'i_treeA', col: [10, 6, 2], sh: [18, 5], fade: 1 }")

with open('src/world/objects.js', 'w') as f:
    f.write(obj_js_new)

# Update spawn_2.js agar treeOak juga menjalankan animasi sway
with open('src/world/spawn/spawn_2.js', 'r') as f:
    sp_js = f.read()

sp_js_new = sp_js.replace("OBJ_SPAWN.treeAd = OBJ_SPAWN.treeA;",
                          "OBJ_SPAWN.treeAd = OBJ_SPAWN.treeA;\nOBJ_SPAWN.treeOak = OBJ_SPAWN.treeA;")

with open('src/world/spawn/spawn_2.js', 'w') as f:
    f.write(sp_js_new)

print("Updated objects.js and spawn_2.js.")
res = subprocess.run(['node', 'tools/check-layout.js'], capture_output=True, text=True)
print(res.stdout)
