extends SceneTree
## Bangun TileSet standar industri (lumina_overworld.tres) dengan Terrain Set + Physics Air,
## lalu konversi peta percontohan meadow.tscn dari GroundSprite PNG menjadi 100% TileMapLayer murni.

const TILESET_PNG: String = "res://assets/art/ground/lumina_tileset.png"
const TILESET_ALT_PNG: String = "res://assets/art/ground/lumina_tileset_alt.png"
const TILESET_V2_PNG: String = "res://assets/art/ground/lumina_tileset_v2.png"
const TILESET_OUT: String = "res://maps/tilesets/lumina_overworld.tres"
const MEADOW_SCENE: String = "res://maps/meadow.tscn"
const MEADOW_PNG: String = "res://assets/art/ground/gnd_meadow_custom.png"


func _init() -> void:
	var ts: TileSet = _build_tileset()
	var err: Error = ResourceSaver.save(ts, TILESET_OUT)
	if err != OK:
		push_error("Gagal menyimpan %s: %d" % [TILESET_OUT, err])
		quit(1)
		return
	print_rich("[color=green]TileSet tersimpan: %s[/color]" % TILESET_OUT)
	var saved_ts: TileSet = ResourceLoader.load(TILESET_OUT) as TileSet
	_convert_meadow(saved_ts if saved_ts != null else ts)
	quit(0)


func _build_tileset() -> TileSet:
	var ts: TileSet = TileSet.new()
	ts.tile_size = Vector2i(16, 16)
	ts.add_physics_layer(0)
	ts.set_physics_layer_collision_layer(0, 1)
	ts.set_physics_layer_collision_mask(0, 0)

	ts.add_terrain_set(0)
	ts.set_terrain_set_mode(0, TileSet.TERRAIN_MODE_MATCH_CORNERS_AND_SIDES)
	var terrains: Array[Array] = [
		["Rumput", Color("#76b843")],
		["Jalan Tanah", Color("#b58c5e")],
		["Pasir", Color("#dec692")],
		["Air", Color("#4fa8b8")],
		["Paving Kota", Color("#9c968c")],
		["Salju", Color("#dce8f2")],
		["Rawa", Color("#5e7a48")],
		["Alt Rumput", Color("#64a838")],
		["Alt Jalan", Color("#c29460")],
		["Alt Batu Pijakan", Color("#9a9286")],
		["Alt Sungai", Color("#3b88c4")],
		["Alt Tebing", Color("#8a6848")],
	]
	for i: int in terrains.size():
		ts.add_terrain(0, i)
		ts.set_terrain_name(0, i, str(terrains[i][0]))
		ts.set_terrain_color(0, i, terrains[i][1] as Color)

	var atlas: TileSetAtlasSource = TileSetAtlasSource.new()
	atlas.texture = ResourceLoader.load(TILESET_PNG) as Texture2D
	atlas.texture_region_size = Vector2i(16, 16)
	ts.add_source(atlas, 0)

	var full_poly: PackedVector2Array = PackedVector2Array([
		Vector2(-8, -8), Vector2(8, -8), Vector2(8, 8), Vector2(-8, 8),
	])

	for y: int in 9:
		for x: int in 16:
			var coords: Vector2i = Vector2i(x, y)
			atlas.create_tile(coords)
			var td: TileData = atlas.get_tile_data(coords, 0)
			if y < 2:
				var tid: int = _terrain_for_coord(x, y)
				td.terrain_set = 0
				td.terrain = tid
				for peer: int in [
					TileSet.CELL_NEIGHBOR_RIGHT_SIDE,
					TileSet.CELL_NEIGHBOR_BOTTOM_RIGHT_CORNER,
					TileSet.CELL_NEIGHBOR_BOTTOM_SIDE,
					TileSet.CELL_NEIGHBOR_BOTTOM_LEFT_CORNER,
					TileSet.CELL_NEIGHBOR_LEFT_SIDE,
					TileSet.CELL_NEIGHBOR_TOP_LEFT_CORNER,
					TileSet.CELL_NEIGHBOR_TOP_SIDE,
					TileSet.CELL_NEIGHBOR_TOP_RIGHT_CORNER,
				]:
					td.set_terrain_peering_bit(peer as TileSet.CellNeighbor, tid)
				if x >= 12:
					td.add_collision_polygon(0)
					td.set_collision_polygon_points(0, 0, full_poly)
			elif (y == 2 and x < 8) or (y == 3 and x >= 4 and x < 8):
				# Tebing (baris 2 kol 0..7) & Pagar Kayu (baris 3 kol 4..7) punya tabrakan otomatis
				td.add_collision_polygon(0)
				td.set_collision_polygon_points(0, 0, full_poly)

	# Hanya Source 0 (lumina_tileset.png) agar TileSet ringan, bersih, dan bebas crash preview di Godot Editor.
	return ts


func _add_patterns(ts: TileSet) -> void:
	# 1) Tebing + Tangga Batu (5x2)
	var p1: TileMapPattern = TileMapPattern.new()
	p1.set_cell(Vector2i(0, 0), 0, Vector2i(0, 2))
	p1.set_cell(Vector2i(1, 0), 0, Vector2i(1, 2))
	p1.set_cell(Vector2i(2, 0), 0, Vector2i(8, 2))
	p1.set_cell(Vector2i(3, 0), 0, Vector2i(2, 2))
	p1.set_cell(Vector2i(4, 0), 0, Vector2i(3, 2))
	p1.set_cell(Vector2i(0, 1), 0, Vector2i(4, 2))
	p1.set_cell(Vector2i(1, 1), 0, Vector2i(5, 2))
	p1.set_cell(Vector2i(2, 1), 0, Vector2i(9, 2))
	p1.set_cell(Vector2i(3, 1), 0, Vector2i(6, 2))
	p1.set_cell(Vector2i(4, 1), 0, Vector2i(7, 2))
	ts.add_pattern(p1)

	# 2) Dinding Tebing Lurus (4x2)
	var p2: TileMapPattern = TileMapPattern.new()
	for x: int in 4:
		p2.set_cell(Vector2i(x, 0), 0, Vector2i(x, 2))
		p2.set_cell(Vector2i(x, 1), 0, Vector2i(4 + x, 2))
	ts.add_pattern(p2)

	# 3) Kebun Desa (3x2)
	var p3: TileMapPattern = TileMapPattern.new()
	for y: int in 2:
		for x: int in 3:
			p3.set_cell(Vector2i(x, y), 0, Vector2i((x + y * 2) % 4, 3))
	ts.add_pattern(p3)

	# 4) Pagar Kayu Horizontal (4x1)
	var p4: TileMapPattern = TileMapPattern.new()
	p4.set_cell(Vector2i(0, 0), 0, Vector2i(5, 3))
	p4.set_cell(Vector2i(1, 0), 0, Vector2i(4, 3))
	p4.set_cell(Vector2i(2, 0), 0, Vector2i(4, 3))
	p4.set_cell(Vector2i(3, 0), 0, Vector2i(6, 3))
	ts.add_pattern(p4)

	# 5) Taman Bunga (3x3)
	var p5: TileMapPattern = TileMapPattern.new()
	for y: int in 3:
		for x: int in 3:
			if x == 1 and y == 1:
				p5.set_cell(Vector2i(x, y), 0, Vector2i(12, 2))
			elif (x + y) % 2 == 1:
				p5.set_cell(Vector2i(x, y), 0, Vector2i(12 + ((x + y * 2) % 4), 2))
			else:
				p5.set_cell(Vector2i(x, y), 0, Vector2i((x + y) % 3, 0))
	ts.add_pattern(p5)

	# 6) Alun-Alun Paving Kota (3x3)
	var p6: TileMapPattern = TileMapPattern.new()
	for y: int in 3:
		for x: int in 3:
			p6.set_cell(Vector2i(x, y), 0, Vector2i((x + y) % 4, 1))
	ts.add_pattern(p6)


func _alt_terrain_for_coord(_x: int, y: int) -> int:
	# Baris 0: Alt Rumput (7), Baris 1: Alt Jalan (8), Baris 2: Alt Batu Pijakan (9), Baris 3: Alt Sungai (10)
	match y:
		0:
			return 7
		1:
			return 8
		2:
			return 9
		3:
			return 10
	return -1


func _tile_has_pixels(img: Image, x0: int, y0: int) -> bool:
	var opaque: int = 0
	for dy: int in range(0, 16, 2):
		for dx: int in range(0, 16, 2):
			if img.get_pixel(x0 + dx, y0 + dy).a > 0.2:
				opaque += 1
	return opaque >= 4


func _terrain_for_coord(x: int, y: int) -> int:
	if y == 0:
		if x < 4:
			return 0
		if x < 8:
			return 1
		if x < 12:
			return 2
		return 3
	if x < 4:
		return 4
	if x < 8:
		return 5
	if x < 12:
		return 6
	return 3


func _convert_meadow(ts: TileSet) -> void:
	var packed: PackedScene = ResourceLoader.load(MEADOW_SCENE) as PackedScene
	if packed == null:
		push_error("Gagal memuat %s" % MEADOW_SCENE)
		return
	var root: Node2D = packed.instantiate() as Node2D

	var abs_png: String = ProjectSettings.globalize_path(MEADOW_PNG)
	var img: Image = Image.load_from_file(abs_png)
	var cols: int = img.get_width() / 16
	var rows: int = img.get_height() / 16

	# Hapus GroundSprite PNG lama (migrasi ke 100% TileMapLayer)
	var old_spr: Node = root.get_node_or_null("GroundSprite")
	if old_spr != null:
		root.remove_child(old_spr)
		old_spr.free()

	# Siapkan GroundWater (TileMapLayer visible + tabrakan air bawaan)
	var water_layer: TileMapLayer = root.get_node_or_null("GroundWater") as TileMapLayer
	if water_layer == null:
		water_layer = TileMapLayer.new()
		water_layer.name = "GroundWater"
		root.add_child(water_layer)
		water_layer.owner = root
	water_layer.tile_set = ts
	water_layer.z_index = -9
	water_layer.visible = true
	water_layer.modulate = Color.WHITE
	water_layer.self_modulate = Color.WHITE
	water_layer.clear()

	# Siapkan GroundTerrain (TileMapLayer rumput, jalan tanah, pasir)
	var terrain_layer: TileMapLayer = root.get_node_or_null("GroundTerrain") as TileMapLayer
	if terrain_layer == null:
		terrain_layer = TileMapLayer.new()
		terrain_layer.name = "GroundTerrain"
		root.add_child(terrain_layer)
		root.move_child(terrain_layer, 0)
		terrain_layer.owner = root
	terrain_layer.tile_set = ts
	terrain_layer.z_index = -8
	terrain_layer.clear()

	# Klasifikasi grid air dulu agar bisa memilih ubin tepi kiri/kanan sungai dengan tepat
	var is_water_grid: Array[bool] = []
	is_water_grid.resize(cols * rows)
	is_water_grid.fill(false)
	for r: int in rows:
		for c: int in cols:
			var col: Color = img.get_pixel(c * 16 + 8, r * 16 + 8)
			var rv: float = col.r * 255.0
			var gv: float = col.g * 255.0
			var bv: float = col.b * 255.0
			if bv > rv + 15.0 and bv > 130.0 and gv > 110.0 and rv < 175.0:
				is_water_grid[r * cols + c] = true

	var v2_grass: Array[Vector2i] = [Vector2i(0, 0), Vector2i(1, 0), Vector2i(2, 0), Vector2i(0, 2), Vector2i(2, 2), Vector2i(3, 2)]
	var v2_flower: Array[Vector2i] = [Vector2i(0, 4), Vector2i(1, 4), Vector2i(2, 4), Vector2i(3, 4), Vector2i(4, 4)]
	var v2_dirt: Array[Vector2i] = [Vector2i(7, 1), Vector2i(7, 3), Vector2i(6, 3), Vector2i(8, 3)]
	var v2_step: Array[Vector2i] = [Vector2i(7, 6), Vector2i(7, 7), Vector2i(8, 6)]
	var v2_sand: Array[Vector2i] = [Vector2i(11, 0), Vector2i(10, 8), Vector2i(11, 8)]
	var v2_water: Array[Vector2i] = [Vector2i(11, 2), Vector2i(12, 2), Vector2i(11, 3), Vector2i(12, 3), Vector2i(13, 3)]

	for r: int in rows:
		for c: int in cols:
			var h: int = abs((c * 37 + r * 73 + c * r * 11))
			if is_water_grid[r * cols + c]:
				terrain_layer.set_cell(Vector2i(c, r), 2, v2_water[h % v2_water.size()])
			else:
				var col: Color = img.get_pixel(c * 16 + 8, r * 16 + 8)
				var rv: float = col.r * 255.0
				var gv: float = col.g * 255.0
				var bv: float = col.b * 255.0
				if rv > 165.0 and gv > 145.0 and bv > 100.0 and bv < 168.0 and rv > bv + 20.0:
					terrain_layer.set_cell(Vector2i(c, r), 2, v2_sand[h % v2_sand.size()])
				elif rv > 120.0 and rv > gv + 18.0 and gv > 80.0 and bv < 120.0 and rv - bv > 60.0:
					if (h % 9) == 0:
						terrain_layer.set_cell(Vector2i(c, r), 2, v2_step[h % v2_step.size()])
					else:
						terrain_layer.set_cell(Vector2i(c, r), 2, v2_dirt[h % v2_dirt.size()])
				else:
					if (h % 14) == 0:
						terrain_layer.set_cell(Vector2i(c, r), 2, v2_flower[h % v2_flower.size()])
					else:
						terrain_layer.set_cell(Vector2i(c, r), 2, v2_grass[h % v2_grass.size()])

	var out_ps: PackedScene = PackedScene.new()
	out_ps.pack(root)
	var save_err: Error = ResourceSaver.save(out_ps, MEADOW_SCENE)
	root.free()
	if save_err != OK:
		push_error("Gagal menyimpan %s: %d" % [MEADOW_SCENE, save_err])
	else:
		print_rich("[color=green]meadow.tscn berhasil dikonversi ke 100%% TileMapLayer (%dx%d ubin)[/color]" % [cols, rows])
