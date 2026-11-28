extends SceneTree
## Semantic TileMap Auto-Generator untuk seluruh 14 peta luar Benua Lumina.
## Mengonversi semua peta luar dari GroundSprite PNG menjadi 100% TileMapLayer murni
## menggunakan lumina_overworld.tres dengan aturan logika ketat:
##   1. Air dilarang muncul di bawah/dekat bangunan, NPC, peti, kuil, atau SpawnPoints.
##   2. Piksel air terisolasi (1x1) dibersihkan agar tidak ada genangan nyasar.
##   3. Pasir hanya muncul tepat di 1 ubin yang langsung berbatasan dengan air.
##   4. Tiap bioma memakai ubin yang sesuai (Kota=Paving, Salju=Salju, Rawa=Rawa, Alam=Rumput+Bunga V2).

const TILESET_PATH: String = "res://maps/tilesets/lumina_overworld.tres"

const REGIONS: Array[String] = [
	"village", "lake", "meadow", "forest", "deepwood", "river",
	"swamp", "snow", "road", "kgate", "kpasar", "kakademi", "kbawah", "kpermukiman",
]


func _init() -> void:
	var ts: TileSet = ResourceLoader.load(TILESET_PATH) as TileSet
	if ts == null:
		push_error("Gagal memuat %s" % TILESET_PATH)
		quit(1)
		return

	for rid: String in REGIONS:
		_convert_region(rid, ts)

	print_rich("[color=green]Selesai! Semua 14 peta luar kini 100%% TileMapLayer murni.[/color]")
	quit(0)


func _convert_region(rid: String, ts: TileSet) -> void:
	var scene_path: String = "res://maps/%s.tscn" % rid
	var png_path: String = "res://assets/art/ground/gnd_%s_custom.png" % rid
	var packed: PackedScene = ResourceLoader.load(scene_path) as PackedScene
	if packed == null:
		push_error("Gagal memuat %s" % scene_path)
		return
	var abs_png: String = ProjectSettings.globalize_path(png_path)
	var img: Image = Image.load_from_file(abs_png)
	if img == null:
		push_error("Gagal memuat %s" % abs_png)
		return

	var root: Node2D = packed.instantiate() as Node2D
	var cols: int = img.get_width() / 16
	var rows: int = img.get_height() / 16

	# 1) Kumpulkan zona aman (bangunan, NPC, peti, kuil, jembatan, spawn) — DILARANG ADA AIR
	var protected: Array[bool] = []
	protected.resize(cols * rows)
	protected.fill(false)
	_mark_protected_nodes(root, protected, cols, rows)

	# 2) Klasifikasi awal dari gambar tanah (0=grass, 1=road/cobble, 2=water)
	var is_city: bool = rid.begins_with("k")
	var kind: Array[int] = []
	kind.resize(cols * rows)
	kind.fill(0)

	for r: int in rows:
		for c: int in cols:
			var col: Color = img.get_pixel(c * 16 + 8, r * 16 + 8)
			var rv: float = col.r * 255.0
			var gv: float = col.g * 255.0
			var bv: float = col.b * 255.0
			var is_w: bool = bv > rv + 15.0 and bv > 130.0 and gv > 110.0 and rv < 175.0
			var is_dirt: bool = rv > 120.0 and rv > gv + 18.0 and gv > 80.0 and bv < 120.0 and rv - bv > 60.0
			var is_cobble: bool = absf(rv - gv) < 16.0 and (rv - bv) > 2.0 and (rv - bv) < 30.0 and rv > 115.0 and rv < 220.0
			if is_w and not protected[r * cols + c] and not is_city:
				kind[r * cols + c] = 2
			elif is_dirt or (is_city and is_cobble):
				kind[r * cols + c] = 1
			else:
				kind[r * cols + c] = 0

	# 3) Bersihkan genangan air terisolasi (sel air yang punya <= 1 tetangga air diubah jadi rumput)
	var clean_w: Array[int] = kind.duplicate()
	for r: int in range(1, rows - 1):
		for c: int in range(1, cols - 1):
			if kind[r * cols + c] != 2:
				continue
			var wn: int = 0
			if kind[(r - 1) * cols + c] == 2: wn += 1
			if kind[(r + 1) * cols + c] == 2: wn += 1
			if kind[r * cols + (c - 1)] == 2: wn += 1
			if kind[r * cols + (c + 1)] == 2: wn += 1
			if wn <= 1:
				clean_w[r * cols + c] = 0
	kind = clean_w

	# 3b) Sambungkan mulut sungai Danau Cermin (lake kanan-bawah) <-> Hutan Lumina (forest kiri-atas)
	if rid == "lake":
		for r: int in range(maxi(0, rows - 22), mini(rows, rows - 16)):
			for c: int in range(maxi(0, cols - 6), cols):
				kind[r * cols + c] = 2
	elif rid == "forest":
		for r: int in range(0, mini(rows, 6)):
			for c: int in range(0, mini(cols, 6)):
				kind[r * cols + c] = 2
		# Sambungkan sungai Hutan Lumina ke tepi kanan (row 31..34) agar bertemu tepat dengan sungai di Region_river
		for c: int in range(maxi(0, cols - 20), cols):
			var t_f: float = float(c - (cols - 20)) / 19.0
			var mid_r: int = int(round(lerpf(39.0, 32.0, t_f)))
			for dr: int in [-1, 0, 1, 2]:
				var rr: int = clampi(mid_r + dr, 0, rows - 1)
				kind[rr * cols + c] = 2
	elif rid == "river":
		# Pastikan mulut kiri Region_river (col 0..5, row 31..34) menyambung tepat ke tepi kanan Region_forest
		for r: int in range(31, mini(rows, 35)):
			for c: int in range(0, mini(cols, 6)):
				kind[r * cols + c] = 2
		# Sambungkan aliran sungai utama yang terputus di antara tikungan barat & jembatan timur (col 68..91, row 39..41)
		for r: int in range(mini(rows - 1, 39), mini(rows, 42)):
			for c: int in range(mini(cols - 1, 68), mini(cols, 91)):
				kind[r * cols + c] = 2

	# 3c) Pastikan aliran sungai menyambung mulus di bawah setiap jembatan kayu (Bridge_*)
	for ch: Node in root.get_children():
		if ch is Sprite2D and ch.name.begins_with("Bridge"):
			var bspr: Sprite2D = ch as Sprite2D
			if bspr.texture != null:
				var bsz: Vector2 = bspr.texture.get_size() * bspr.scale
				var bx0: int = int(bspr.position.x / 16.0)
				var by0: int = int(bspr.position.y / 16.0)
				var bx1: int = int((bspr.position.x + bsz.x) / 16.0)
				var by1: int = int((bspr.position.y + bsz.y) / 16.0)
				# Isi bagian tengah jembatan (sisakan 1 ubin ujung pangkal jembatan untuk daratan)
				# dan sambungkan otomatis celah pasir/rumput hingga 8 ubin (dengan toleransi belokan +-2 ubin)
				# ke aliran sungai utama di kiri/kanan (atau atas/bawah) jembatan.
				if bsz.y > bsz.x:
					var mid_r: int = int((by0 + by1) * 0.5)
					for r: int in range(maxi(0, by0 + 1), mini(rows, by1 - 1)):
						for c: int in range(maxi(0, bx0), mini(cols, bx1 + 1)):
							kind[r * cols + c] = 2
					# Cari air terdekat di kiri (hingga 8 ubin, toleransi +-2 baris) lalu sambungkan selebar 3 ubin
					var found_l: Vector2i = Vector2i(-1, -1)
					for step: int in range(1, 9):
						var cc: int = bx0 - step
						if cc < 0:
							break
						for dr: int in [0, -1, 1, -2, 2]:
							var rr: int = mid_r + dr
							if rr >= 0 and rr < rows and kind[rr * cols + cc] == 2:
								found_l = Vector2i(cc, rr)
								break
						if found_l.x >= 0:
							break
					if found_l.x >= 0:
						for cc: int in range(found_l.x, bx0 + 1):
							var t_lerp: float = float(cc - found_l.x) / maxf(1.0, float(bx0 - found_l.x))
							var cr: int = int(round(lerpf(float(found_l.y), float(mid_r), t_lerp)))
							for dr: int in [-1, 0, 1]:
								var rr: int = clampi(cr + dr, 0, rows - 1)
								kind[rr * cols + cc] = 2
					# Cari air terdekat di kanan (hingga 8 ubin, toleransi +-2 baris)
					var found_r: Vector2i = Vector2i(-1, -1)
					for step: int in range(1, 9):
						var cc: int = bx1 + step
						if cc >= cols:
							break
						for dr: int in [0, -1, 1, -2, 2]:
							var rr: int = mid_r + dr
							if rr >= 0 and rr < rows and kind[rr * cols + cc] == 2:
								found_r = Vector2i(cc, rr)
								break
						if found_r.x >= 0:
							break
					if found_r.x >= 0:
						for cc: int in range(bx1, found_r.x + 1):
							var t_lerp: float = float(cc - bx1) / maxf(1.0, float(found_r.x - bx1))
							var cr: int = int(round(lerpf(float(mid_r), float(found_r.y), t_lerp)))
							for dr: int in [-1, 0, 1]:
								var rr: int = clampi(cr + dr, 0, rows - 1)
								kind[rr * cols + cc] = 2
				else:
					var mid_c: int = int((bx0 + bx1) * 0.5)
					for r: int in range(maxi(0, by0), mini(rows, by1 + 1)):
						for c: int in range(maxi(0, bx0 + 1), mini(cols, bx1 - 1)):
							kind[r * cols + c] = 2
					# Cari air terdekat di atas & bawah (hingga 8 ubin, toleransi +-2 kolom)
					var found_t: Vector2i = Vector2i(-1, -1)
					for step: int in range(1, 9):
						var rr: int = by0 - step
						if rr < 0:
							break
						for dc: int in [0, -1, 1, -2, 2]:
							var cc: int = mid_c + dc
							if cc >= 0 and cc < cols and kind[rr * cols + cc] == 2:
								found_t = Vector2i(cc, rr)
								break
						if found_t.y >= 0:
							break
					if found_t.y >= 0:
						for rr: int in range(found_t.y, by0 + 1):
							var t_lerp: float = float(rr - found_t.y) / maxf(1.0, float(by0 - found_t.y))
							var cc_mid: int = int(round(lerpf(float(found_t.x), float(mid_c), t_lerp)))
							for dc: int in [-1, 0, 1]:
								var cc: int = clampi(cc_mid + dc, 0, cols - 1)
								kind[rr * cols + cc] = 2
					var found_b: Vector2i = Vector2i(-1, -1)
					for step: int in range(1, 9):
						var rr: int = by1 + step
						if rr >= rows:
							break
						for dc: int in [0, -1, 1, -2, 2]:
							var cc: int = mid_c + dc
							if cc >= 0 and cc < cols and kind[rr * cols + cc] == 2:
								found_b = Vector2i(cc, rr)
								break
						if found_b.y >= 0:
							break
					if found_b.y >= 0:
						for rr: int in range(by1, found_b.y + 1):
							var t_lerp: float = float(rr - by1) / maxf(1.0, float(found_b.y - by1))
							var cc_mid: int = int(round(lerpf(float(mid_c), float(found_b.x), t_lerp)))
							for dc: int in [-1, 0, 1]:
								var cc: int = clampi(cc_mid + dc, 0, cols - 1)
								kind[rr * cols + cc] = 2

	# 4) Hapus GroundSprite PNG lama & kosongkan GroundWater lama
	var old_spr: Node = root.get_node_or_null("GroundSprite")
	if old_spr != null:
		root.remove_child(old_spr)
		old_spr.free()
	var old_water: TileMapLayer = root.get_node_or_null("GroundWater") as TileMapLayer
	if old_water != null:
		old_water.clear()
		old_water.tile_set = ts

	# 5) Siapkan GroundTerrain (1 layer utama untuk semua permukaan + Physics air otomatis)
	var terrain: TileMapLayer = root.get_node_or_null("GroundTerrain") as TileMapLayer
	if terrain == null:
		terrain = TileMapLayer.new()
		terrain.name = "GroundTerrain"
		root.add_child(terrain)
		root.move_child(terrain, 0)
		terrain.owner = root
	terrain.tile_set = ts
	terrain.z_index = -8
	terrain.visible = true
	terrain.modulate = Color.WHITE
	terrain.self_modulate = Color.WHITE
	terrain.clear()

	# 5b) Siapkan GroundEdge (tepian rumput bergerigi transparan di atas jalan tanah & pasir)
	var edge_layer: TileMapLayer = root.get_node_or_null("GroundEdge") as TileMapLayer
	if edge_layer == null:
		edge_layer = TileMapLayer.new()
		edge_layer.name = "GroundEdge"
		root.add_child(edge_layer)
		root.move_child(edge_layer, 1)
		edge_layer.owner = root
	edge_layer.tile_set = ts
	edge_layer.z_index = -7
	edge_layer.visible = true
	edge_layer.modulate = Color.WHITE
	edge_layer.clear()

	# Tandai ubin mana yang rumput hijau (untuk menyalakan tepian bergerigi di jalan/pasir tetangganya)
	var is_grass_cell: Array[bool] = []
	is_grass_cell.resize(cols * rows)
	is_grass_cell.fill(false)

	for r: int in rows:
		for c: int in cols:
			var k: int = kind[r * cols + c]
			var h: int = abs((c * 37 + r * 73 + c * r * 11))
			var v: int = h % 4
			if k == 2:
				# Air Dalam di tengah sungai/danau (jika 4 sisi N,E,S,W semuanya air), Air Dangkal di tepian
				var all_w: bool = (
					r > 0 and kind[(r - 1) * cols + c] == 2
					and r < rows - 1 and kind[(r + 1) * cols + c] == 2
					and c > 0 and kind[r * cols + (c - 1)] == 2
					and c < cols - 1 and kind[r * cols + (c + 1)] == 2
				)
				if rid == "swamp" or all_w:
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(12 + v, 1))
				else:
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(12 + v, 0))
			elif k == 1:
				if is_city:
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(v, 1))
				else:
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(4 + v, 0))
			else:
				var near_water: bool = false
				if rid != "snow" and rid != "swamp" and not is_city:
					for oy: int in [-1, 0, 1]:
						for ox: int in [-1, 0, 1]:
							var rr: int = r + oy
							var cc: int = c + ox
							if rr >= 0 and rr < rows and cc >= 0 and cc < cols and kind[rr * cols + cc] == 2:
								near_water = true
								break
						if near_water:
							break
				if near_water:
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(8 + v, 0))
				elif rid == "snow":
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(4 + v, 1))
				elif rid == "swamp":
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(8 + v, 1))
				else:
					var gv_idx: int = 3 if (h % 8 == 0) else (h % 3)
					terrain.set_cell(Vector2i(c, r), 0, Vector2i(gv_idx, 0))
					is_grass_cell[r * cols + c] = true

	# Lukis pinggiran rumput bergerigi (Baris 4) & tepian pantai pasir-sungai (Baris 5) dengan variasi flip acak
	for r: int in rows:
		for c: int in cols:
			var h: int = abs((c * 37 + r * 73 + c * r * 11))
			if kind[r * cols + c] == 2:
				# Tepian pantai (Baris 5) pada ubin air yang menyentuh daratan/pasir
				var smask: int = 0
				if r > 0 and kind[(r - 1) * cols + c] != 2:
					smask |= 1
				if c < cols - 1 and kind[r * cols + (c + 1)] != 2:
					smask |= 2
				if r < rows - 1 and kind[(r + 1) * cols + c] != 2:
					smask |= 4
				if c > 0 and kind[r * cols + (c - 1)] != 2:
					smask |= 8
				if smask > 0:
					var alt_s: int = 0
					if (smask == 1 or smask == 4) and (h % 2 == 1):
						alt_s = TileSetAtlasSource.TRANSFORM_FLIP_H
					elif (smask == 2 or smask == 8) and (h % 2 == 1):
						alt_s = TileSetAtlasSource.TRANSFORM_FLIP_V
					edge_layer.set_cell(Vector2i(c, r), 0, Vector2i(smask, 5), alt_s)
			elif rid != "snow" and rid != "swamp" and not is_grass_cell[r * cols + c]:
				# Pinggiran rumput bergerigi (Baris 4) pada ubin jalan/pasir yang menyentuh rumput
				var gmask: int = 0
				if r > 0 and is_grass_cell[(r - 1) * cols + c]:
					gmask |= 1
				if c < cols - 1 and is_grass_cell[r * cols + (c + 1)]:
					gmask |= 2
				if r < rows - 1 and is_grass_cell[(r + 1) * cols + c]:
					gmask |= 4
				if c > 0 and is_grass_cell[r * cols + (c - 1)]:
					gmask |= 8
				if gmask > 0:
					var alt_g: int = 0
					if (gmask == 1 or gmask == 4) and (h % 2 == 1):
						alt_g = TileSetAtlasSource.TRANSFORM_FLIP_H
					elif (gmask == 2 or gmask == 8) and (h % 2 == 1):
						alt_g = TileSetAtlasSource.TRANSFORM_FLIP_V
					edge_layer.set_cell(Vector2i(c, r), 0, Vector2i(gmask, 4), alt_g)
				elif kind[r * cols + c] == 0:
					# Ubin pasir yang menyentuh jalan tanah -> transisi lembut tanah-pasir (Baris 6)
					var dmask: int = 0
					if r > 0 and kind[(r - 1) * cols + c] == 1:
						dmask |= 1
					if c < cols - 1 and kind[r * cols + (c + 1)] == 1:
						dmask |= 2
					if r < rows - 1 and kind[(r + 1) * cols + c] == 1:
						dmask |= 4
					if c > 0 and kind[r * cols + (c - 1)] == 1:
						dmask |= 8
					if dmask > 0:
						var alt_d: int = 0
						if (dmask == 1 or dmask == 4) and (h % 2 == 1):
							alt_d = TileSetAtlasSource.TRANSFORM_FLIP_H
						elif (dmask == 2 or dmask == 8) and (h % 2 == 1):
							alt_d = TileSetAtlasSource.TRANSFORM_FLIP_V
						edge_layer.set_cell(Vector2i(c, r), 0, Vector2i(dmask, 6), alt_d)

	# 5c) Siapkan GroundDeco (bunga, rumput liar, kerikil, Grass Patches, Worn Paths, & Ground Decals)
	var deco_layer: TileMapLayer = root.get_node_or_null("GroundDeco") as TileMapLayer
	if deco_layer == null:
		deco_layer = TileMapLayer.new()
		deco_layer.name = "GroundDeco"
		root.add_child(deco_layer)
		root.move_child(deco_layer, 2)
		deco_layer.owner = root
	deco_layer.tile_set = ts
	deco_layer.z_index = -6
	deco_layer.visible = true
	deco_layer.modulate = Color.WHITE
	deco_layer.clear()

	# Kumpulkan posisi pohon & bangunan untuk penempatan Fallen Leaves dan Worn Paths secara kontekstual
	var near_tree: Array[bool] = []
	near_tree.resize(cols * rows)
	near_tree.fill(false)
	var worn_spot: Array[bool] = []
	worn_spot.resize(cols * rows)
	worn_spot.fill(false)

	var ysorted_deco: Node = root.get_node_or_null("YSorted")
	if ysorted_deco != null:
		for ch: Node in ysorted_deco.get_children():
			if not (ch is Node2D):
				continue
			var n2: Node2D = ch as Node2D
			var nm: String = n2.name
			var cx: int = int(n2.position.x / 16.0)
			var cy: int = int(n2.position.y / 16.0)
			if nm.begins_with("NatTree") or nm.begins_with("BorderTree"):
				for dy: int in range(-1, 2):
					for dx: int in range(-1, 2):
						var rr: int = cy + dy
						var cc: int = cx + dx
						if rr >= 0 and rr < rows and cc >= 0 and cc < cols:
							near_tree[rr * cols + cc] = true
			elif nm.contains("House") or nm.contains("Inn") or nm.contains("Temple") or nm.contains("Well") or nm.contains("Shop"):
				# Area terinjak tepat di depan pintu bangunan / sekitar sumur (baris cy+1..cy+2)
				for dy: int in range(1, 3):
					for dx: int in range(-1, 2):
						var rr: int = cy + dy
						var cc: int = cx + dx
						if rr >= 0 and rr < rows and cc >= 0 and cc < cols:
							worn_spot[rr * cols + cc] = true

	# Klaster organik Grass Patches (blok 2x2 / 3x2 di ~12% padang rumput terbuka)
	var grass_patch: Array[bool] = []
	grass_patch.resize(cols * rows)
	grass_patch.fill(false)
	for r: int in range(1, rows - 2):
		for c: int in range(1, cols - 2):
			if not is_grass_cell[r * cols + c] or protected[r * cols + c]:
				continue
			var seed_h: int = abs((c * 71 + r * 131 + c * r * 29)) % 100
			if seed_h < 3:
				var pw: int = 2 + (seed_h % 2)
				var ph: int = 2
				for dy: int in ph:
					for dx: int in pw:
						var rr: int = r + dy
						var cc: int = c + dx
						if rr < rows and cc < cols and is_grass_cell[rr * cols + cc] and not protected[rr * cols + cc]:
							grass_patch[rr * cols + cc] = true

	for r: int in rows:
		for c: int in cols:
			var idx: int = r * cols + c
			var h: int = abs((c * 53 + r * 97 + c * r * 17))
			# 1) Worn Paths di depan pintu rumah / sumur (boleh di zona protected bangunan)
			if worn_spot[idx] and is_grass_cell[idx]:
				deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(4 + (h % 4), 8))
				continue
			if protected[idx]:
				continue
			if is_grass_cell[idx]:
				# 2) Fallen Leaves di sekitar kaki pohon (hutan, desa, padang)
				if near_tree[idx] and (h % 100) < 38:
					deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(11 + (h % 3), 8))
				# 3) Grass Patches klaster organik (~10-15% padang terbuka)
				elif grass_patch[idx]:
					deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(h % 4, 8))
				else:
					# 4) Taburan tipis alami: ~4% bunga, ~5% rumput liar, ~2% semanggi
					var mod_v: int = h % 100
					if mod_v < 4:
						deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(h % 5, 7))
					elif mod_v < 9:
						deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(5 + (h % 4), 7))
					elif mod_v < 11:
						deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(13 + (h % 3), 7))
			elif kind[idx] == 1:
				if is_city:
					# 5) City Cobble Cracks & Moss (~7% di paving batu kota)
					if (h % 100) < 7:
						deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(8 + (h % 3), 8))
				else:
					# 6) Wheel Tracks di jalan utama (road/village) atau kerikil halus (~6%)
					var is_main_road: bool = (rid == "road" or rid == "village")
					var horiz_road: bool = (c > 0 and c < cols - 1 and kind[r * cols + c - 1] == 1 and kind[r * cols + c + 1] == 1)
					var vert_road: bool = (r > 0 and r < rows - 1 and kind[(r - 1) * cols + c] == 1 and kind[(r + 1) * cols + c] == 1)
					if is_main_road and (h % 100) < 10 and (horiz_road or vert_road):
						deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(14 if horiz_road else 15, 8))
					elif (h % 100) < 6:
						deco_layer.set_cell(Vector2i(c, r), 0, Vector2i(9 + (h % 4), 7))

	var out_ps: PackedScene = PackedScene.new()
	out_ps.pack(root)
	var save_err: Error = ResourceSaver.save(out_ps, scene_path)
	root.free()
	if save_err != OK:
		push_error("Gagal menyimpan %s: %d" % [scene_path, save_err])
	else:
		print_rich("  [color=cyan]%s.tscn[/color] -> TileMapLayer (%dx%d ubin)" % [rid, cols, rows])


func _mark_protected_nodes(root: Node2D, protected: Array[bool], cols: int, rows: int) -> void:
	var ysorted: Node = root.get_node_or_null("YSorted")
	if ysorted != null:
		for ch: Node in ysorted.get_children():
			if not (ch is Node2D):
				continue
			var n2: Node2D = ch as Node2D
			var nm: String = n2.name
			# Abaikan pohon/dekorasi alam, lindungi bangunan, NPC, peti, kuil, gerbang
			if nm.begins_with("NatTree") or nm.begins_with("BorderTree") or nm.begins_with("NatDeco"):
				continue
			var rad: int = 3 if (nm.contains("House") or nm.contains("Inn") or nm.contains("Temple") or nm.contains("Gate") or nm.contains("Fort") or nm.contains("Academy")) else 1
			var cx: int = int(n2.position.x / 16.0)
			var cy: int = int(n2.position.y / 16.0)
			for dy: int in range(-rad, rad + 1):
				for dx: int in range(-rad, rad + 1):
					var rr: int = cy + dy
					var cc: int = cx + dx
					if rr >= 0 and rr < rows and cc >= 0 and cc < cols:
						protected[rr * cols + cc] = true

	var spawns: Node = root.get_node_or_null("SpawnPoints")
	if spawns != null:
		for sp: Node in spawns.get_children():
			if sp is Node2D:
				var sp2: Node2D = sp as Node2D
				var cx: int = int(sp2.position.x / 16.0)
				var cy: int = int(sp2.position.y / 16.0)
				for dy: int in range(-2, 3):
					for dx: int in range(-2, 3):
						var rr: int = cy + dy
						var cc: int = cx + dx
						if rr >= 0 and rr < rows and cc >= 0 and cc < cols:
							protected[rr * cols + cc] = true
