class_name MapBuilderHelper
extends RefCounted

const SPROUT_TREE_SCENE: PackedScene = preload("res://systems/world/sprout_tree.tscn")
const NPC_SCENE: PackedScene = preload("res://systems/npc/npc.tscn")
const ENEMY_SCENE: PackedScene = preload("res://systems/enemies/enemy_base.tscn")
const PORTAL_SCENE: PackedScene = preload("res://systems/world/portal.tscn")
const SHRINE_SCENE: PackedScene = preload("res://systems/world/shrine.tscn")
const CHEST_SCENE: PackedScene = preload("res://systems/world/chest.tscn")
const ANIMAL_SCENE: PackedScene = preload("res://systems/world/ambient_animal.tscn")
const FISHING_SPOT_SCENE: PackedScene = preload("res://systems/world/fishing_spot.tscn")
const BUILDING_SCRIPT: Script = preload("res://systems/world/building_prop.gd")
const SPAWN_SCRIPT: Script = preload("res://systems/world/spawn_point.gd")
const BED_SCRIPT: Script = preload("res://systems/world/bed_interactable.gd")

## Pemetaan 47 signature bitmask (N,E,S,W,NE,SE,SW,NW) ke koordinat atlas gnd_edge_sprout.png (Source 1).
const EDGE_SIG_MAP: Dictionary = {
	"11111111": [[0, 0], [1, 0], [2, 0], [3, 0]],
	"00100000": [[0, 2]], "00000000": [[1, 2]], "11110100": [[6, 2]], "11110010": [[7, 2]],
	"10110000": [[8, 2]], "11010000": [[9, 2]], "10100000": [[0, 3], [0, 4]], "01100100": [[1, 3]],
	"01110110": [[2, 3]], "00110010": [[3, 3]], "11111000": [[6, 3]], "11110001": [[7, 3]],
	"01110000": [[8, 3]], "11100000": [[9, 3]], "11101100": [[1, 4]], "10110011": [[3, 4]],
	"11111011": [[4, 4]], "11111101": [[5, 4]], "11100100": [[6, 4]], "01110010": [[7, 4]],
	"01110100": [[8, 4]], "10110010": [[9, 4]], "10000000": [[0, 5]], "11001000": [[1, 5]],
	"11011001": [[2, 5]], "10010001": [[3, 5]], "11110111": [[4, 5]], "11111110": [[5, 5]],
	"11011000": [[6, 5]], "10110001": [[7, 5]], "11101000": [[8, 5]], "11010001": [[9, 5]],
	"01000000": [[0, 6]], "01010000": [[1, 6], [2, 6]], "00010000": [[3, 6]], "01100000": [[4, 6]],
	"00110000": [[5, 6]], "11111100": [[6, 6]], "11110110": [[7, 6]], "11110000": [[0, 7], [1, 7]],
	"11110101": [[2, 7]], "11111010": [[3, 7]], "11000000": [[4, 7]], "10010000": [[5, 7]],
	"11111001": [[6, 7]], "11110011": [[7, 7]],
}


static func load_res(path: String) -> Resource:
	return ResourceLoader.load(path)


static func create_outdoor_base(map_name: String, ts: TileSet, cols: int, rows: int) -> Dictionary:
	var root: Node2D = Node2D.new()
	root.name = map_name
	root.y_sort_enabled = true
	root.set_meta("is_indoor", false)
	root.set_meta("camera_zoom", 1.25)
	root.set_meta("is_dark_cave", false)

	var dirt: TileMapLayer = TileMapLayer.new()
	dirt.name = "GroundDirt"
	dirt.z_index = -12
	dirt.tile_set = ts
	root.add_child(dirt)
	dirt.owner = root
	fill_dirt_layer(dirt, cols, rows)

	var sand: TileMapLayer = TileMapLayer.new()
	sand.name = "GroundSand"
	sand.z_index = -11
	sand.tile_set = ts
	root.add_child(sand)
	sand.owner = root

	var grass: TileMapLayer = TileMapLayer.new()
	grass.name = "GroundGrass"
	grass.z_index = -10
	grass.tile_set = ts
	root.add_child(grass)
	grass.owner = root

	var water: TileMapLayer = TileMapLayer.new()
	water.name = "GroundWater"
	water.z_index = -9
	water.tile_set = ts
	root.add_child(water)
	water.owner = root

	var ysorted: Node2D = Node2D.new()
	ysorted.name = "YSorted"
	ysorted.y_sort_enabled = true
	root.add_child(ysorted)
	ysorted.owner = root

	var spawns: Node2D = Node2D.new()
	spawns.name = "SpawnPoints"
	root.add_child(spawns)
	spawns.owner = root

	var grid: Array[bool] = []
	grid.resize(cols * rows)
	grid.fill(true)

	var water_grid: Array[bool] = []
	water_grid.resize(cols * rows)
	water_grid.fill(false)

	return {
		"root": root,
		"dirt": dirt,
		"sand": sand,
		"grass": grass,
		"water": water,
		"ysorted": ysorted,
		"spawns": spawns,
		"grid": grid,
		"water_grid": water_grid,
		"cols": cols,
		"rows": rows,
	}


static func fill_dirt_layer(layer: TileMapLayer, cols: int, rows: int) -> void:
	for r: int in rows:
		for c: int in cols:
			var tx: int = (c * 7 + r * 13) % 4
			var ty: int = (c * 3 + r * 5) % 4
			layer.set_cell(Vector2i(c, r), 0, Vector2i(tx, ty))


static func fill_cobble_rect(layer: TileMapLayer, c0: int, r0: int, c1: int, r1: int) -> void:
	for r: int in range(r0, r1 + 1):
		for c: int in range(c0, c1 + 1):
			var tx: int = (c * 5 + r * 11) % 4
			var ty: int = (c * 7 + r * 3) % 4
			layer.set_cell(Vector2i(c, r), 3, Vector2i(tx, ty))


static func carve_cobble_road(
	dirt_layer: TileMapLayer,
	grass_grid: Array[bool],
	cols: int,
	rows: int,
	p0: Vector2,
	p1: Vector2,
	radius: float
) -> void:
	var steps: int = maxi(4, int(p0.distance_to(p1) * 2.0))
	for s: int in steps + 1:
		var t: float = float(s) / float(steps)
		var pt: Vector2 = p0.lerp(p1, t)
		for r: int in rows:
			for c: int in cols:
				var dx: float = (float(c) - pt.x) / radius
				var dy: float = (float(r) - pt.y) / radius
				if dx * dx + dy * dy <= 1.0:
					grass_grid[r * cols + c] = false
					var tx: int = (c * 5 + r * 11) % 4
					var ty: int = (c * 7 + r * 3) % 4
					dirt_layer.set_cell(Vector2i(c, r), 3, Vector2i(tx, ty))


static func carve_ellipse(grid: Array[bool], cols: int, rows: int, center: Vector2, rx: float, ry: float) -> void:
	for r: int in rows:
		for c: int in cols:
			var dx: float = (float(c) - center.x) / rx
			var dy: float = (float(r) - center.y) / ry
			if dx * dx + dy * dy <= 1.0:
				grid[r * cols + c] = false


static func carve_road(grid: Array[bool], cols: int, rows: int, p0: Vector2, p1: Vector2, radius: float) -> void:
	var steps: int = maxi(4, int(p0.distance_to(p1) * 2.0))
	for s: int in steps + 1:
		var t: float = float(s) / float(steps)
		carve_ellipse(grid, cols, rows, p0.lerp(p1, t), radius, radius)


## Pemetaan 47-tile autotile rumput secara deterministik tanpa kecacatan tepi atau lubang sudut.
static func apply_grass_autotile(layer: TileMapLayer, grid: Array[bool], cols: int, rows: int) -> void:
	for _pass: int in 2:
		var snap: Array[bool] = grid.duplicate()
		for r: int in range(1, rows - 1):
			for c: int in range(1, cols - 1):
				var idx: int = r * cols + c
				var n: int = 0
				for oy: int in range(-1, 2):
					for ox: int in range(-1, 2):
						if ox == 0 and oy == 0:
							continue
						if snap[(r + oy) * cols + (c + ox)]:
							n += 1
				if snap[idx] and n <= 2:
					grid[idx] = false
				elif not snap[idx] and n >= 6:
					grid[idx] = true

	for r: int in rows:
		for c: int in cols:
			if not grid[r * cols + c]:
				continue
			var n_on: bool = grid[maxi(0, r - 1) * cols + c]
			var e_on: bool = grid[r * cols + mini(cols - 1, c + 1)]
			var s_on: bool = grid[mini(rows - 1, r + 1) * cols + c]
			var w_on: bool = grid[r * cols + maxi(0, c - 1)]
			var ne_on: bool = n_on and e_on and grid[maxi(0, r - 1) * cols + mini(cols - 1, c + 1)]
			var se_on: bool = s_on and e_on and grid[mini(rows - 1, r + 1) * cols + mini(cols - 1, c + 1)]
			var sw_on: bool = s_on and w_on and grid[mini(rows - 1, r + 1) * cols + maxi(0, c - 1)]
			var nw_on: bool = n_on and w_on and grid[maxi(0, r - 1) * cols + maxi(0, c - 1)]
			var sig: String = "%d%d%d%d%d%d%d%d" % [
				1 if n_on else 0, 1 if e_on else 0, 1 if s_on else 0, 1 if w_on else 0,
				1 if ne_on else 0, 1 if se_on else 0, 1 if sw_on else 0, 1 if nw_on else 0
			]
			var coords_list: Array = EDGE_SIG_MAP.get(sig, [[0, 0]])
			var pick: int = 0
			if sig == "11111111" and coords_list.size() == 4:
				var hv: int = _hash_int(c, r, 107) % 16
				pick = 0 if hv < 12 else hv - 12
			elif coords_list.size() > 1:
				pick = _hash_int(c, r, 109) % coords_list.size()
			var cr: Array = coords_list[pick]
			layer.set_cell(Vector2i(c, r), 1, Vector2i(int(cr[0]), int(cr[1])))


static func _classify_pixel(col: Color, grey_road: bool) -> int:
	var r: float = col.r * 255.0
	var g: float = col.g * 255.0
	var b: float = col.b * 255.0
	var l: float = r + g + b
	if l >= 600.0 and b >= r and b >= g - 4.0:
		return 5
	if b > r + 25.0 and b > g + 4.0:
		return 4
	if (g > r + 10.0 and g > b + 8.0) or (g > r + 25.0 and b < g + 45.0 and b > r) or (g >= r - 6.0 and g > b + 60.0):
		return 1
	if grey_road and (maxf(r, maxf(g, b)) - minf(r, minf(g, b))) < 40.0 and l > 200.0:
		return 2
	if l < 120.0:
		return 2
	if r > b + 30.0 and r >= g:
		return 2
	return 1


## Membaca peta tanah kustom gnd_<id>_custom.png dan membangun TileMapLayer 47-tile + air + pasir + jalan.
static func build_ground_from_custom_png(
	m: Dictionary,
	region_id: StringName,
	biome: StringName,
	use_cobble: bool,
	extra_roads: Array[Array] = [],
	bridges: Array[Rect2i] = []
) -> void:
	var dirt: TileMapLayer = m["dirt"]
	var sand: TileMapLayer = m["sand"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var grid: Array[bool] = m["grid"]
	var water_grid: Array[bool] = m["water_grid"]
	var cols: int = int(m["cols"])
	var rows: int = int(m["rows"])

	var rel_path: String = "res://tools/custom_grounds/gnd_%s_custom.png" % str(region_id)
	var abs_path: String = ProjectSettings.globalize_path(rel_path)
	var img: Image = Image.load_from_file(abs_path)
	if img == null or img.is_empty():
		push_warning("MapBuilderHelper: custom ground tidak ditemukan: %s" % rel_path)
		apply_grass_autotile(grass, grid, cols, rows)
		return

	var iw: int = img.get_width()
	var ih: int = img.get_height()
	var foam_grid: Array[bool] = []
	foam_grid.resize(cols * rows)
	foam_grid.fill(false)

	for r: int in rows:
		for c: int in cols:
			var cg: int = 0
			var cr: int = 0
			var cw: int = 0
			var cf: int = 0
			for dy: int in [3, 7, 11, 14]:
				for dx: int in [3, 7, 11, 14]:
					var sx: int = clampi(c * 16 + dx, 0, iw - 1)
					var sy: int = clampi(r * 16 + dy, 0, ih - 1)
					var cls: int = _classify_pixel(img.get_pixel(sx, sy), use_cobble)
					if cls == 5:
						cf += 1
					elif cls == 4:
						cw += 1
					elif cls == 2:
						cr += 1
					else:
						cg += 1
			var idx: int = r * cols + c
			if cw >= 8:
				water_grid[idx] = true
				grid[idx] = false
			elif cf >= 8:
				foam_grid[idx] = true
				grid[idx] = false
			elif cr > cg:
				grid[idx] = false
			else:
				grid[idx] = true

	# Buih (5) hanya dianggap air bila menempel langsung ke sel air sejati (4)
	for r: int in rows:
		for c: int in cols:
			var idx: int = r * cols + c
			if not foam_grid[idx]:
				continue
			var adj_water: bool = false
			for oy: int in range(-1, 2):
				for ox: int in range(-1, 2):
					var nr: int = r + oy
					var nc: int = c + ox
					if nr >= 0 and nr < rows and nc >= 0 and nc < cols and water_grid[nr * cols + nc]:
						adj_water = true
						break
				if adj_water:
					break
			if adj_water:
				water_grid[idx] = true
			else:
				grid[idx] = true

	# Bersihkan air terisolasi agar genangan/bintik toska kecil menjadi rumput normal
	var wsnap: Array[bool] = water_grid.duplicate()
	for r: int in rows:
		for c: int in cols:
			var idx: int = r * cols + c
			if not wsnap[idx]:
				continue
			var n: int = 0
			for oy: int in range(-1, 2):
				for ox: int in range(-1, 2):
					if ox == 0 and oy == 0:
						continue
					var nr: int = clampi(r + oy, 0, rows - 1)
					var nc: int = clampi(c + ox, 0, cols - 1)
					if wsnap[nr * cols + nc]:
						n += 1
			if n <= 3:
				water_grid[idx] = false
				grid[idx] = true

	for seg: Array in extra_roads:
		carve_road(grid, cols, rows, seg[0], seg[1], float(seg[2]))
		var steps: int = maxi(4, int((seg[0] as Vector2).distance_to(seg[1] as Vector2) * 2.0))
		for s: int in steps + 1:
			var pt: Vector2 = (seg[0] as Vector2).lerp(seg[1] as Vector2, float(s) / float(steps))
			var rad: int = ceili(float(seg[2]))
			for r2: int in range(maxi(0, int(pt.y) - rad), mini(rows, int(pt.y) + rad + 1)):
				for c2: int in range(maxi(0, int(pt.x) - rad), mini(cols, int(pt.x) + rad + 1)):
					water_grid[r2 * cols + c2] = false

	for br: Rect2i in bridges:
		for r2: int in range(maxi(0, br.position.y), mini(rows, br.end.y)):
			for c2: int in range(maxi(0, br.position.x), mini(cols, br.end.x)):
				water_grid[r2 * cols + c2] = false
				grid[r2 * cols + c2] = false

	# Gambar pasir pantai di daratan yang berbatasan air + cat air
	for r: int in rows:
		for c: int in cols:
			var idx: int = r * cols + c
			if water_grid[idx]:
				water.set_cell(Vector2i(c, r), 2, Vector2i(0, 0))
				sand.set_cell(Vector2i(c, r), 4, Vector2i((c * 3 + r) % 4, (r * 5) % 4))
				continue
			var near_water: bool = false
			for oy: int in range(-1, 2):
				for ox: int in range(-1, 2):
					var nr: int = r + oy
					var nc: int = c + ox
					if nr >= 0 and nr < rows and nc >= 0 and nc < cols and water_grid[nr * cols + nc]:
						near_water = true
						break
				if near_water:
					break
			if near_water:
				sand.set_cell(Vector2i(c, r), 4, Vector2i((c * 5 + r) % 4, (c + r * 3) % 4))
				if grid[idx]:
					grid[idx] = false
			if use_cobble and not grid[idx] and not water_grid[idx]:
				var tx: int = (c * 5 + r * 11) % 4
				var ty: int = (c * 7 + r * 3) % 4
				dirt.set_cell(Vector2i(c, r), 3, Vector2i(tx, ty))

	apply_grass_autotile(grass, grid, cols, rows)
	_apply_biome_modulation(dirt, sand, grass, water, biome)


static func _apply_biome_modulation(
	dirt: TileMapLayer,
	sand: TileMapLayer,
	grass: TileMapLayer,
	water: TileMapLayer,
	biome: StringName
) -> void:
	match biome:
		&"forest":
			grass.modulate = Color(0.84, 0.92, 0.84)
			dirt.modulate = Color(0.86, 0.78, 0.72)
		&"deepwood":
			grass.modulate = Color(0.72, 0.84, 0.76)
			dirt.modulate = Color(0.76, 0.70, 0.66)
		&"meadow":
			grass.modulate = Color(1.04, 1.04, 0.94)
		&"swamp":
			grass.modulate = Color(0.70, 0.80, 0.62)
			dirt.modulate = Color(0.76, 0.72, 0.60)
			sand.modulate = Color(0.78, 0.76, 0.66)
			water.modulate = Color(0.72, 0.84, 0.72)
		&"snow":
			grass.modulate = Color(1.32, 1.44, 1.56)
			dirt.modulate = Color(0.86, 0.90, 0.96)
			sand.modulate = Color(1.04, 1.08, 1.14)
			water.modulate = Color(0.82, 0.96, 1.10)
		&"city":
			grass.modulate = Color(0.95, 0.98, 0.92)


static func paint_water_ellipse(water: TileMapLayer, grid: Array[bool], cols: int, rows: int, center: Vector2, rx: float, ry: float) -> void:
	for r: int in rows:
		for c: int in cols:
			var dx: float = (float(c) - center.x) / rx
			var dy: float = (float(r) - center.y) / ry
			if dx * dx + dy * dy <= 1.0:
				water.set_cell(Vector2i(c, r), 2, Vector2i(0, 0))
				grid[r * cols + c] = false


static func clear_water_rect(water: TileMapLayer, c0: int, r0: int, c1: int, r1: int) -> void:
	for r: int in range(r0, r1 + 1):
		for c: int in range(c0, c1 + 1):
			water.erase_cell(Vector2i(c, r))


static func add_tree(ysorted: Node2D, root: Node, node_name: String, pos: Vector2, variant: String) -> void:
	var t_inst: SproutTree = SPROUT_TREE_SCENE.instantiate() as SproutTree
	t_inst.name = node_name
	t_inst.position = pos
	t_inst.variant = variant
	ysorted.add_child(t_inst)
	t_inst.owner = root


static func add_tree_ring(
	ysorted: Node2D,
	root: Node,
	w: int,
	h: int,
	step: int,
	variant_a: String,
	variant_b: String,
	skip_rects: Array[Rect2]
) -> void:
	var idx: int = 0
	var pts: Array[Vector2] = []
	for x: int in range(56, w - 40, step):
		pts.append(Vector2(x, 62 + ((x * 7) % 24)))
		pts.append(Vector2(x + 16, h - 42 - ((x * 5) % 22)))
	for y: int in range(110, h - 90, step):
		pts.append(Vector2(52 + ((y * 5) % 22), y))
		pts.append(Vector2(w - 52 - ((y * 7) % 22), y + 14))
	for p: Vector2 in pts:
		var blocked: bool = false
		for sr: Rect2 in skip_rects:
			if sr.has_point(p):
				blocked = true
				break
		if not blocked:
			add_tree(ysorted, root, "RingTree_%d" % idx, p, variant_a if idx % 2 == 0 else variant_b)
			idx += 1


## Memasang deretan pohon HANYA di tepi luar kontinen (tepi yang menyentuh wilayah lain dibiarkan terbuka).
static func add_open_tree_border(
	ysorted: Node2D,
	root: Node,
	region_id: StringName,
	w: int,
	h: int,
	step: int,
	variant_a: String,
	variant_b: String,
	skip_rects: Array[Rect2] = []
) -> void:
	var idx: int = 0
	var x: int = 44
	while x < w - 36:
		if not WorldLayout.is_point_on_shared_edge(region_id, "N", float(x), 24.0):
			var p_n: Vector2 = Vector2(float(x), 46.0 + float((x * 7) % 18))
			if not _in_any_rect(p_n, skip_rects):
				add_tree(ysorted, root, "BorderTree_%d" % idx, p_n, variant_a if idx % 2 == 0 else variant_b)
				idx += 1
		if not WorldLayout.is_point_on_shared_edge(region_id, "S", float(x), 24.0):
			var p_s: Vector2 = Vector2(float(x + 12), float(h) - 24.0 - float((x * 5) % 18))
			if not _in_any_rect(p_s, skip_rects):
				add_tree(ysorted, root, "BorderTree_%d" % idx, p_s, variant_b if idx % 2 == 0 else variant_a)
				idx += 1
		x += step

	var y: int = 96
	while y < h - 72:
		if not WorldLayout.is_point_on_shared_edge(region_id, "W", float(y), 24.0):
			var p_w: Vector2 = Vector2(36.0 + float((y * 5) % 18), float(y))
			if not _in_any_rect(p_w, skip_rects):
				add_tree(ysorted, root, "BorderTree_%d" % idx, p_w, variant_a if idx % 2 == 0 else variant_b)
				idx += 1
		if not WorldLayout.is_point_on_shared_edge(region_id, "E", float(y), 24.0):
			var p_e: Vector2 = Vector2(float(w) - 36.0 - float((y * 7) % 18), float(y + 10))
			if not _in_any_rect(p_e, skip_rects):
				add_tree(ysorted, root, "BorderTree_%d" % idx, p_e, variant_b if idx % 2 == 0 else variant_a)
				idx += 1
		y += step


## Membentuk batas collider tepi peta HANYA di sisi yang mengarah keluar Benua Lumina.
static func add_open_borders(root: Node2D, region_id: StringName) -> void:
	var rects: Array[Rect2] = WorldLayout.outer_boundary_rects(region_id, 12.0)
	if not rects.is_empty():
		add_borders(root, rects)


static func add_garden_bed(ysorted: Node2D, root: Node, node_name: String, pos: Vector2, kind: int) -> void:
	var bed: Node2D = Node2D.new()
	bed.name = node_name
	bed.position = pos
	bed.z_index = -7
	ysorted.add_child(bed)
	bed.owner = root
	var frame: Polygon2D = Polygon2D.new()
	frame.name = "Soil"
	frame.color = Color("#7c4e2a")
	frame.polygon = PackedVector2Array([-36, -24, 36, -24, 36, 22, -36, 22])
	bed.add_child(frame)
	frame.owner = root
	var rim: Polygon2D = Polygon2D.new()
	rim.name = "Rim"
	rim.z_index = -1
	rim.color = Color("#543318")
	rim.polygon = PackedVector2Array([-38, -26, 38, -26, 38, 24, -38, 24])
	bed.add_child(rim)
	rim.owner = root
	for ry: int in [-14, 0, 14]:
		for cx: int in [-24, -8, 8, 24]:
			var crop: Polygon2D = Polygon2D.new()
			crop.name = "Crop_%d_%d" % [cx, ry]
			crop.position = Vector2(float(cx), float(ry))
			crop.color = Color("#5fc242") if ((kind + cx + ry) % 2 == 0) else Color("#e57435")
			crop.polygon = PackedVector2Array([-4, -3, 4, -3, 4, 3, -4, 3])
			bed.add_child(crop)
			crop.owner = root


static func add_prop(
	parent: Node,
	scene_root: Node,
	prop_name: String,
	tex_path: String,
	pos: Vector2,
	col_sz: Vector2,
	walkable_z: int = 0
) -> void:
	add_scaled_prop(parent, scene_root, prop_name, tex_path, pos, 1.0, col_sz, walkable_z)


static func add_scaled_prop(
	parent: Node,
	scene_root: Node,
	prop_name: String,
	tex_path: String,
	pos: Vector2,
	scale_val: float,
	col_sz: Vector2,
	walkable_z: int = 0
) -> void:
	var tex: Texture2D = load_res(tex_path) as Texture2D
	if tex == null:
		return
	if col_sz == Vector2.ZERO:
		var spr: Sprite2D = Sprite2D.new()
		spr.name = prop_name
		spr.position = pos
		spr.texture = tex
		spr.scale = Vector2(scale_val, scale_val)
		spr.offset = Vector2(0.0, -float(tex.get_height()) * 0.5)
		spr.z_index = walkable_z
		parent.add_child(spr)
		spr.owner = scene_root
		return

	var body: StaticBody2D = StaticBody2D.new()
	body.name = prop_name
	body.position = pos
	body.collision_layer = 1
	body.collision_mask = 0
	parent.add_child(body)
	body.owner = scene_root

	var spr_b: Sprite2D = Sprite2D.new()
	spr_b.name = "Sprite2D"
	spr_b.texture = tex
	spr_b.scale = Vector2(scale_val, scale_val)
	spr_b.offset = Vector2(0.0, -float(tex.get_height()) * 0.5)
	body.add_child(spr_b)
	spr_b.owner = scene_root

	var col: CollisionShape2D = CollisionShape2D.new()
	col.name = "CollisionShape2D"
	var rect: RectangleShape2D = RectangleShape2D.new()
	rect.size = col_sz
	col.shape = rect
	col.position = Vector2(0.0, -col_sz.y * 0.5)
	body.add_child(col)
	col.owner = scene_root


static func add_atlas_prop(
	parent: Node,
	scene_root: Node,
	prefix: String,
	atlas_tex: Texture2D,
	region: Rect2,
	scale_f: float,
	pos: Vector2,
	col_sz: Vector2
) -> void:
	var at: AtlasTexture = AtlasTexture.new()
	at.atlas = atlas_tex
	at.region = region
	if col_sz != Vector2.ZERO:
		var body: StaticBody2D = StaticBody2D.new()
		body.name = "%s_%d_%d" % [prefix, int(pos.x), int(pos.y)]
		body.position = pos
		body.collision_layer = 1
		body.collision_mask = 0
		parent.add_child(body)
		body.owner = scene_root

		var spr: Sprite2D = Sprite2D.new()
		spr.name = "Sprite2D"
		spr.texture = at
		spr.scale = Vector2(scale_f, scale_f)
		spr.offset = Vector2(0.0, -region.size.y * 0.5)
		body.add_child(spr)
		spr.owner = scene_root

		var col: CollisionShape2D = CollisionShape2D.new()
		col.name = "CollisionShape2D"
		var rect: RectangleShape2D = RectangleShape2D.new()
		rect.size = col_sz
		col.shape = rect
		col.position = Vector2(0.0, -col_sz.y * 0.5)
		body.add_child(col)
		col.owner = scene_root
	else:
		var spr: Sprite2D = Sprite2D.new()
		spr.name = "%s_%d_%d" % [prefix, int(pos.x), int(pos.y)]
		spr.position = pos
		spr.texture = at
		spr.scale = Vector2(scale_f, scale_f)
		spr.offset = Vector2(0.0, -region.size.y * 0.5)
		spr.z_index = -5
		parent.add_child(spr)
		spr.owner = scene_root


## Menyebarkan rumpun pohon bioma, semak, batu, kayu, lumut, jamur, bunga, dan hiasan air secara organik & deterministik.
static func populate_nature_and_deco(
	m: Dictionary,
	region_id: StringName,
	biome: StringName,
	avoid_pts: Array[Vector2] = [],
	extra_skips: Array[Rect2] = []
) -> void:
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var grid: Array[bool] = m["grid"]
	var water_grid: Array[bool] = m["water_grid"]
	var cols: int = int(m["cols"])
	var rows: int = int(m["rows"])

	var keep_pts: Array[Vector2] = avoid_pts.duplicate()
	for ch: Node in ysorted.get_children():
		if ch is Node2D:
			var n2: Node2D = ch as Node2D
			keep_pts.append(n2.position)
	var spawns_node: Node = root.get_node_or_null("SpawnPoints")
	if spawns_node != null:
		for s: Node in spawns_node.get_children():
			if s is Node2D:
				keep_pts.append((s as Node2D).position)
	for ch: Node in root.get_children():
		if ch is Portal:
			keep_pts.append((ch as Node2D).position)

	var placed_trees: Array[Vector2] = []
	for ch: Node in ysorted.get_children():
		if ch is SproutTree:
			placed_trees.append((ch as Node2D).position)

	var seed_val: int = _hash_int(cols, rows, String(region_id).hash())
	var step_cells: int = 3
	var min_tree_dist: float = 56.0
	var tree_threshold: int = 58
	var max_trees: int = 120
	if biome == &"deepwood":
		step_cells = 3
		min_tree_dist = 64.0
		tree_threshold = 44
		max_trees = 135
	elif biome == &"forest":
		step_cells = 3
		min_tree_dist = 56.0
		tree_threshold = 46
		max_trees = 85
	elif biome == &"snow" or biome == &"swamp":
		step_cells = 3
		min_tree_dist = 58.0
		tree_threshold = 52
		max_trees = 70
	elif biome == &"city":
		step_cells = 4
		min_tree_dist = 78.0
		tree_threshold = 72
		max_trees = 24
	elif biome == &"village":
		step_cells = 4
		min_tree_dist = 76.0
		tree_threshold = 76
		max_trees = 14

	var added_trees: int = 0
	for r: int in range(3, rows - 3, step_cells):
		for c: int in range(3, cols - 3, step_cells):
			if added_trees >= max_trees:
				break
			if not _is_clear_grass_block(grid, water_grid, cols, rows, c, r, 1):
				continue
			var score: int = _hash_int(c, r, seed_val) % 100
			if score < tree_threshold:
				continue
			var ox: float = float((_hash_int(c, r, seed_val + 3) % 18) - 9)
			var oy: float = float((_hash_int(c, r, seed_val + 7) % 18) - 9)
			var pos: Vector2 = Vector2(float(c) * 16.0 + 8.0 + ox, float(r) * 16.0 + 8.0 + oy)
			if _in_any_rect(pos, extra_skips) or _too_close(pos, keep_pts, 64.0) or _too_close(pos, placed_trees, min_tree_dist):
				continue
			var variant: String = _pick_biome_tree(biome, _hash_int(c, r, seed_val + 11))
			add_tree(ysorted, root, "NatTree_%d" % added_trees, pos, variant)
			placed_trees.append(pos)
			keep_pts.append(pos)
			added_trees += 1

	# Semak, batu, bunga, dan clutter organik di tanah rumput
	var max_deco: int = 110 if (biome == &"deepwood" or biome == &"river") else (42 if biome == &"city" else 76)
	var added_deco: int = 0
	var placed_deco: Array[Vector2] = []
	for r: int in range(2, rows - 2, 2):
		for c: int in range(2, cols - 2, 2):
			if added_deco >= max_deco:
				break
			var idx: int = r * cols + c
			if not grid[idx] or water_grid[idx]:
				continue
			var hv: int = _hash_int(c, r, seed_val + 29) % 100
			if hv < 82:
				continue
			var pos: Vector2 = Vector2(float(c) * 16.0 + float((_hash_int(c, r, 41) % 12) + 2), float(r) * 16.0 + float((_hash_int(c, r, 43) % 12) + 2))
			if _in_any_rect(pos, extra_skips) or _too_close(pos, keep_pts, 36.0) or _too_close(pos, placed_deco, 32.0):
				continue
			var kind: int = _hash_int(c, r, seed_val + 53) % 10
			_spawn_biome_deco(ysorted, root, biome, kind, added_deco, pos)
			placed_deco.append(pos)
			added_deco += 1

	# Hiasan air di sungai/danau/rawa
	var max_wdeco: int = 38
	var added_w: int = 0
	var placed_w: Array[Vector2] = []
	for r: int in range(1, rows - 1, 2):
		for c: int in range(1, cols - 1, 2):
			if added_w >= max_wdeco:
				break
			var idx: int = r * cols + c
			if not water_grid[idx]:
				continue
			var near_land: bool = (not water_grid[r * cols + maxi(0, c - 1)]) or (not water_grid[r * cols + mini(cols - 1, c + 1)]) or (not water_grid[maxi(0, r - 1) * cols + c]) or (not water_grid[mini(rows - 1, r + 1) * cols + c])
			if not near_land and (_hash_int(c, r, 71) % 10) > 2:
				continue
			if (_hash_int(c, r, seed_val + 67) % 100) < 74:
				continue
			var pos: Vector2 = Vector2(float(c) * 16.0 + 8.0, float(r) * 16.0 + 8.0)
			if _too_close(pos, placed_w, 48.0) or _too_close(pos, keep_pts, 32.0):
				continue
			_spawn_water_deco(root, biome, added_w, pos)
			placed_w.append(pos)
			added_w += 1


static func _pick_biome_tree(biome: StringName, h: int) -> String:
	var k: int = h % 10
	match biome:
		&"village":
			if k < 2:
				return "apple"
			if k == 2:
				return "orange"
			return "big" if k < 7 else "big_dark"
		&"meadow":
			if k == 0:
				return "apple"
			if k == 1:
				return "orange"
			return "big" if k < 7 else "tall"
		&"forest":
			if k < 4:
				return "tall_dark"
			return "big_dark" if k < 8 else "tall"
		&"deepwood":
			if k < 3:
				return "giant"
			return "tall_dark" if k < 7 else "big_dark"
		&"snow":
			return "snow" if k < 7 else "snow_tall"
		&"swamp":
			return "swamp" if k < 7 else "big_dark"
		&"city":
			return "apple" if k == 0 else ("big" if k < 7 else "tall")
		_:
			return "big" if k < 6 else "tall"


static func _spawn_biome_deco(ysorted: Node2D, root: Node, biome: StringName, kind: int, idx: int, pos: Vector2) -> void:
	var tex_path: String = "res://assets/art/ground/deco_tuft.png"
	var sc: float = 1.2
	var col_sz: Vector2 = Vector2.ZERO
	var z_off: int = -5
	if biome == &"snow":
		if kind < 3:
			tex_path = "res://assets/art/nature/bushW.png"
			sc = 0.72
			col_sz = Vector2(20, 8)
		elif kind < 6:
			tex_path = "res://assets/art/nature/gpt_rock.png"
			sc = 0.80
			col_sz = Vector2(18, 8)
		else:
			tex_path = "res://assets/art/nature/clutter_pebbles.png"
			sc = 1.0
	elif biome == &"deepwood":
		if kind < 2:
			tex_path = "res://assets/art/nature/bushG2.png"
			sc = 0.72
			col_sz = Vector2(22, 8)
		elif kind < 4:
			tex_path = "res://assets/art/nature/deepwood_moss_island_1.png"
			sc = 0.90
		elif kind < 6:
			tex_path = "res://assets/art/nature/dwclutter_fallen_leaves.png"
		elif kind < 8:
			tex_path = "res://assets/art/nature/dwclutter_mushroom.png"
		else:
			tex_path = "res://assets/art/nature/stumpWoods.png"
			sc = 0.80
			col_sz = Vector2(16, 8)
	elif biome == &"swamp":
		if kind < 3:
			tex_path = "res://assets/art/nature/bushG2.png"
			sc = 0.72
			col_sz = Vector2(22, 8)
		elif kind < 6:
			tex_path = "res://assets/art/ground/deco_mushroom.png"
		elif kind < 8:
			tex_path = "res://assets/art/ground/deco_reeds.png"
			sc = 0.65
		else:
			tex_path = "res://assets/art/nature/gpt_log.png"
			col_sz = Vector2(20, 8)
	else:
		if kind < 2:
			tex_path = "res://assets/art/nature/bushG1.png" if biome != &"city" else "res://assets/art/nature/bushP.png"
			sc = 0.70
			col_sz = Vector2(20, 8)
		elif kind == 2:
			tex_path = "res://assets/art/nature/bushP.png"
			sc = 0.72
			col_sz = Vector2(18, 8)
		elif kind == 3:
			tex_path = "res://assets/art/nature/clutter_clovers.png"
		elif kind == 4:
			tex_path = "res://assets/art/ground/deco_fl_y1.png"
			sc = 1.4
		elif kind == 5:
			tex_path = "res://assets/art/ground/deco_fl_p1.png"
			sc = 1.4
		elif kind == 6:
			tex_path = "res://assets/art/ground/deco_fl_v1.png"
			sc = 1.4
		elif kind == 7:
			tex_path = "res://assets/art/nature/clutter_wild_cluster.png"
		elif kind == 8:
			tex_path = "res://assets/art/nature/gpt_rock.png"
			sc = 0.78
			col_sz = Vector2(18, 8)
		else:
			tex_path = "res://assets/art/nature/gpt_mush.png"
	if col_sz != Vector2.ZERO:
		z_off = 0
	add_scaled_prop(ysorted, root, "NatDeco_%d" % idx, tex_path, pos, sc, col_sz, z_off)


static func _spawn_water_deco(root: Node2D, biome: StringName, idx: int, pos: Vector2) -> void:
	if biome == &"snow":
		add_scaled_prop(root, root, "WaterDeco_%d" % idx, "res://assets/art/ground/deco_water_rock_small.png", pos, 0.55, Vector2.ZERO, -8)
		return
	var k: int = idx % 4
	if k == 0:
		add_scaled_prop(root, root, "WaterDeco_%d" % idx, "res://assets/art/ground/deco_water_reeds_lush.png", pos, 0.55, Vector2.ZERO, -8)
	elif k == 1:
		add_scaled_prop(root, root, "WaterDeco_%d" % idx, "res://assets/art/ground/deco_water_lilypad.png", pos, 0.48, Vector2.ZERO, -8)
	elif k == 2:
		add_scaled_prop(root, root, "WaterDeco_%d" % idx, "res://assets/art/ground/deco_water_lotus.png", pos, 0.50, Vector2.ZERO, -8)
	else:
		add_scaled_prop(root, root, "WaterDeco_%d" % idx, "res://assets/art/ground/deco_water_rock_med.png", pos, 0.45, Vector2.ZERO, -8)


static func _is_clear_grass_block(grid: Array[bool], water_grid: Array[bool], cols: int, rows: int, cx: int, cy: int, rad: int) -> bool:
	for oy: int in range(-rad, rad + 1):
		for ox: int in range(-rad, rad + 1):
			var nx: int = clampi(cx + ox, 0, cols - 1)
			var ny: int = clampi(cy + oy, 0, rows - 1)
			var idx: int = ny * cols + nx
			if not grid[idx] or water_grid[idx]:
				return false
	return true


static func _in_any_rect(p: Vector2, rects: Array[Rect2]) -> bool:
	for r: Rect2 in rects:
		if r.has_point(p):
			return true
	return false


static func _too_close(p: Vector2, pts: Array[Vector2], min_d: float) -> bool:
	var min_sq: float = min_d * min_d
	for q: Vector2 in pts:
		if p.distance_squared_to(q) < min_sq:
			return true
	return false


static func _hash_int(a: int, b: int, seed_val: int) -> int:
	var h: int = (a * 374761393 + b * 668265263 + seed_val * 2147483647) & 0x7fffffff
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff
	return h ^ (h >> 16)


static func add_npc(
	ysorted: Node2D,
	root: Node,
	node_name: String,
	name_key: String,
	tex_path: String,
	dlg_path: String,
	pos: Vector2,
	facing: String = "down",
	wander: float = 0.0,
	shop_id: StringName = &"",
	shop_title_key: String = "",
	shop_items: Array[StringName] = [],
	teach_skill_id: StringName = &"",
	teach_cost: int = 0
) -> void:
	var npc_inst: NpcActor = NPC_SCENE.instantiate() as NpcActor
	npc_inst.name = node_name
	npc_inst.npc_name_key = name_key
	npc_inst.sprite_sheet = load_res(tex_path) as Texture2D
	if not dlg_path.is_empty():
		npc_inst.dialogue = load_res(dlg_path) as DialogueData
	npc_inst.position = pos
	npc_inst.facing_dir = facing
	npc_inst.wander_radius = wander
	npc_inst.shop_id = shop_id
	npc_inst.shop_title_key = shop_title_key
	npc_inst.shop_item_ids = shop_items
	npc_inst.teach_skill_id = teach_skill_id
	npc_inst.teach_cost = teach_cost
	ysorted.add_child(npc_inst)
	npc_inst.owner = root


static func add_enemy(ysorted: Node2D, root: Node, node_name: String, enemy_id: String, pos: Vector2) -> void:
	var enemy: EnemyBase = ENEMY_SCENE.instantiate() as EnemyBase
	enemy.name = node_name
	enemy.data = load_res("res://data/enemies/%s.tres" % enemy_id) as EnemyData
	enemy.position = pos
	ysorted.add_child(enemy)
	enemy.owner = root


static func add_chest(
	ysorted: Node2D,
	root: Node,
	node_name: String,
	cid: StringName,
	item_id: StringName,
	qty: int,
	gold: int,
	pos: Vector2
) -> void:
	var c: ChestProp = CHEST_SCENE.instantiate() as ChestProp
	c.name = node_name
	c.chest_id = cid
	c.reward_item_id = item_id
	c.reward_qty = qty
	c.reward_gold = gold
	c.position = pos
	ysorted.add_child(c)
	c.owner = root


static func add_animal(ysorted: Node2D, root: Node, node_name: String, species: String, pos: Vector2) -> void:
	var a: AmbientAnimal = ANIMAL_SCENE.instantiate() as AmbientAnimal
	a.name = node_name
	a.species = species
	a.position = pos
	ysorted.add_child(a)
	a.owner = root


static func add_shrine(ysorted: Node2D, root: Node, pos: Vector2) -> void:
	var sh: ShrineProp = SHRINE_SCENE.instantiate() as ShrineProp
	sh.name = "LightShrine"
	sh.position = pos
	ysorted.add_child(sh)
	sh.owner = root


static func add_fishing_spot(root: Node, node_name: String, pos: Vector2) -> void:
	var fs: FishingSpot = FISHING_SPOT_SCENE.instantiate() as FishingSpot
	fs.name = node_name
	fs.position = pos
	root.add_child(fs)
	fs.owner = root


static func add_spawn(spawns_parent: Node, root: Node, node_name: String, id: StringName, pos: Vector2) -> void:
	var marker: Marker2D = Marker2D.new()
	marker.name = node_name
	marker.position = pos
	marker.set_script(SPAWN_SCRIPT)
	marker.set("spawn_id", id)
	spawns_parent.add_child(marker)
	marker.owner = root


static func add_portal(
	root: Node,
	node_name: String,
	pos: Vector2,
	target_map: String,
	target_spawn: StringName,
	box_size: Vector2 = Vector2(48, 22)
) -> void:
	var p: Portal = PORTAL_SCENE.instantiate() as Portal
	p.name = node_name
	p.position = pos
	p.target_map = target_map
	p.target_spawn_id = target_spawn
	if box_size != Vector2(48, 20):
		var col: CollisionShape2D = p.get_node_or_null("CollisionShape2D") as CollisionShape2D
		if col != null:
			var rect: RectangleShape2D = RectangleShape2D.new()
			rect.size = box_size
			col.shape = rect
	root.add_child(p)
	p.owner = root


static func add_borders(root: Node, rects: Array[Rect2]) -> void:
	var borders: StaticBody2D = StaticBody2D.new()
	borders.name = "Borders"
	borders.collision_layer = 1
	borders.collision_mask = 0
	root.add_child(borders)
	borders.owner = root
	for idx: int in rects.size():
		var r: Rect2 = rects[idx]
		var col: CollisionShape2D = CollisionShape2D.new()
		col.name = "Wall_%d" % idx
		var shape: RectangleShape2D = RectangleShape2D.new()
		shape.size = r.size
		col.shape = shape
		col.position = r.position + r.size * 0.5
		borders.add_child(col)
		col.owner = root


static func add_bed(root: Node, node_name: String, pos: Vector2) -> void:
	var area: Area2D = Area2D.new()
	area.name = node_name
	area.position = pos
	area.collision_layer = 64
	area.collision_mask = 0
	area.set_script(BED_SCRIPT)
	root.add_child(area)
	area.owner = root

	var col: CollisionShape2D = CollisionShape2D.new()
	col.name = "CollisionShape2D"
	var shape: CircleShape2D = CircleShape2D.new()
	shape.radius = 20.0
	col.shape = shape
	area.add_child(col)
	col.owner = root


static func save_scene(root: Node, path: String) -> void:
	var packed: PackedScene = PackedScene.new()
	packed.pack(root)
	ResourceSaver.save(packed, path)
	root.free()
