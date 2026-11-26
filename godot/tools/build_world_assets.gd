extends SceneTree

const TILESET_PATH: String = "res://maps/tilesets/sprout_overworld.tres"
const DECO_OBJS_PATH: String = "res://assets/art/ground/deco_sprout_objs.png"


func _init() -> void:
	var ts: TileSet = _build_tileset()
	ResourceSaver.save(ts, TILESET_PATH)
	ts = MapBuilderHelper.load_res(TILESET_PATH) as TileSet
	var buildings: Dictionary = _build_all_buildings()
	_build_interiors(ts)
	_build_village_map(ts, buildings)
	WildMapsBuilder.build_all(ts, buildings)
	CityMapsBuilder.build_all(ts, buildings)
	print_rich("[color=green]All 24 worlds & interiors generated successfully.[/color]")
	quit(0)


func _build_tileset() -> TileSet:
	var ts: TileSet = TileSet.new()
	ts.tile_size = Vector2i(16, 16)
	ts.add_physics_layer()
	ts.set_physics_layer_collision_layer(0, 1)
	ts.set_physics_layer_collision_mask(0, 0)

	ts.add_terrain_set()
	ts.set_terrain_set_mode(0, TileSet.TERRAIN_MODE_MATCH_CORNERS_AND_SIDES)
	ts.add_terrain(0)
	ts.set_terrain_name(0, 0, "Grass")
	ts.set_terrain_color(0, 0, Color(0.45, 0.78, 0.35))

	ts.add_custom_data_layer()
	ts.set_custom_data_layer_name(0, "walkable")
	ts.set_custom_data_layer_type(0, TYPE_BOOL)

	ts.add_custom_data_layer()
	ts.set_custom_data_layer_name(1, "footstep")
	ts.set_custom_data_layer_type(1, TYPE_STRING_NAME)

	ts.add_custom_data_layer()
	ts.set_custom_data_layer_name(2, "terrain_type")
	ts.set_custom_data_layer_type(2, TYPE_STRING_NAME)

	var dirt_src: TileSetAtlasSource = TileSetAtlasSource.new()
	dirt_src.texture = MapBuilderHelper.load_res("res://assets/art/ground/gnd_dirt.png") as Texture2D
	dirt_src.texture_region_size = Vector2i(16, 16)
	ts.add_source(dirt_src, 0)
	for r: int in 8:
		for c: int in 8:
			var coords: Vector2i = Vector2i(c, r)
			dirt_src.create_tile(coords)
			var td: TileData = dirt_src.get_tile_data(coords, 0)
			td.set_custom_data("walkable", true)
			td.set_custom_data("footstep", &"dirt")
			td.set_custom_data("terrain_type", &"dirt")

	var edge_src: TileSetAtlasSource = TileSetAtlasSource.new()
	edge_src.texture = MapBuilderHelper.load_res("res://assets/art/ground/gnd_edge_sprout.png") as Texture2D
	edge_src.texture_region_size = Vector2i(16, 16)
	ts.add_source(edge_src, 1)

	var edge_sigs: Dictionary = {
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
	var bits: Array[int] = [
		TileSet.CELL_NEIGHBOR_TOP_SIDE, TileSet.CELL_NEIGHBOR_RIGHT_SIDE,
		TileSet.CELL_NEIGHBOR_BOTTOM_SIDE, TileSet.CELL_NEIGHBOR_LEFT_SIDE,
		TileSet.CELL_NEIGHBOR_TOP_RIGHT_CORNER, TileSet.CELL_NEIGHBOR_BOTTOM_RIGHT_CORNER,
		TileSet.CELL_NEIGHBOR_BOTTOM_LEFT_CORNER, TileSet.CELL_NEIGHBOR_TOP_LEFT_CORNER,
	]
	for sig: String in edge_sigs:
		var coords_list: Array = edge_sigs[sig]
		for idx: int in coords_list.size():
			var cr: Array = coords_list[idx]
			var coords: Vector2i = Vector2i(cr[0], cr[1])
			edge_src.create_tile(coords)
			var td: TileData = edge_src.get_tile_data(coords, 0)
			td.terrain_set = 0
			td.terrain = 0
			if sig == "11111111":
				td.probability = 1.0 if idx == 0 else 0.3
			for b_idx: int in 8:
				td.set_terrain_peering_bit(bits[b_idx], 0 if sig[b_idx] == "1" else -1)
			td.set_custom_data("walkable", true)
			td.set_custom_data("footstep", &"grass")
			td.set_custom_data("terrain_type", &"grass")

	var water_src: TileSetAtlasSource = TileSetAtlasSource.new()
	water_src.texture = MapBuilderHelper.load_res("res://assets/art/ground/gnd_water_sprout.png") as Texture2D
	water_src.texture_region_size = Vector2i(16, 16)
	ts.add_source(water_src, 2)
	water_src.create_tile(Vector2i(0, 0))
	water_src.set_tile_animation_columns(Vector2i(0, 0), 4)
	water_src.set_tile_animation_frames_count(Vector2i(0, 0), 4)
	water_src.set_tile_animation_speed(Vector2i(0, 0), 4.0)
	var w_td: TileData = water_src.get_tile_data(Vector2i(0, 0), 0)
	w_td.add_collision_polygon(0)
	w_td.set_collision_polygon_points(0, 0, PackedVector2Array([
		Vector2(-8, -8), Vector2(8, -8), Vector2(8, 8), Vector2(-8, 8)
	]))
	w_td.set_custom_data("walkable", false)
	w_td.set_custom_data("footstep", &"water")
	w_td.set_custom_data("terrain_type", &"water")

	var cobble_src: TileSetAtlasSource = TileSetAtlasSource.new()
	cobble_src.texture = MapBuilderHelper.load_res("res://assets/art/ground/gnd_city_cobble.png") as Texture2D
	cobble_src.texture_region_size = Vector2i(16, 16)
	ts.add_source(cobble_src, 3)
	for r: int in 4:
		for c: int in 4:
			var c_coords: Vector2i = Vector2i(c, r)
			cobble_src.create_tile(c_coords)
			var c_td: TileData = cobble_src.get_tile_data(c_coords, 0)
			c_td.set_custom_data("walkable", true)
			c_td.set_custom_data("footstep", &"stone")
			c_td.set_custom_data("terrain_type", &"cobble")

	return ts


func _build_all_buildings() -> Dictionary:
	var specs: Array[Array] = [
		["house_a", "res://assets/art/buildings/sp_houseA.png", Vector2(98, 44), true],
		["house_b", "res://assets/art/buildings/sp_houseB.png", Vector2(96, 44), true],
		["house_c", "res://assets/art/buildings/sp_houseC.png", Vector2(98, 44), true],
		["house_brown", "res://assets/art/buildings/sp_house_brown_cottage.png", Vector2(102, 44), true],
		["house_red", "res://assets/art/buildings/sp_house_red_cottage.png", Vector2(102, 44), true],
		["house_proto", "res://assets/art/buildings/sp_house_proto.png", Vector2(118, 46), true],
		["blacksmith", "res://assets/art/buildings/sp_blacksmith_forge.png", Vector2(104, 46), true],
		["well", "res://assets/art/buildings/sp_b_well.png", Vector2(32, 18), false],
		["market_stall", "res://assets/art/buildings/sp_b_i_market.png", Vector2(54, 22), false],
		["windmill", "res://assets/art/buildings/sp_b_windmill.png", Vector2(70, 32), true],
		["shrine_ruin", "res://assets/art/buildings/sp_b_shrine.png", Vector2(80, 26), false],
		["fountain", "res://assets/art/buildings/fountain.png", Vector2(62, 26), false],
		["gatehouse", "res://assets/art/buildings/sp_b_gatehouse.png", Vector2.ZERO, true],
		["citywall_l", "res://assets/art/buildings/sp_b_citywall_l.png", Vector2(480, 26), false],
		["citywall_r", "res://assets/art/buildings/sp_b_citywall_r.png", Vector2(480, 26), false],
		["barak_bayaran", "res://assets/art/buildings/sp_b_barakBayaran.png", Vector2(104, 42), true],
		["balai_dewan", "res://assets/art/buildings/sp_b_balaiDewan.png", Vector2(100, 56), true],
		["academy", "res://assets/art/buildings/sp_b_academy.png", Vector2(220, 44), true],
		["blades", "res://assets/art/buildings/sp_b_blades.png", Vector2(70, 32), true],
		["city_house_1", "res://assets/art/buildings/sp_b_cityHouse1.png", Vector2(90, 42), true],
		["city_house_2", "res://assets/art/buildings/sp_b_cityHouse2.png", Vector2(90, 42), true],
		["city_house_3", "res://assets/art/buildings/sp_b_cityHouse3.png", Vector2(90, 42), true],
		["city_house_4", "res://assets/art/buildings/sp_b_cityHouse4.png", Vector2(90, 42), true],
		["city_house_5", "res://assets/art/buildings/sp_b_cityHouse5.png", Vector2(90, 42), true],
		["stall_butcher", "res://assets/art/buildings/sp_b_stall_butcher.png", Vector2(96, 36), false],
		["stall_food", "res://assets/art/buildings/sp_b_stall_food.png", Vector2(96, 36), false],
		["stall_potion", "res://assets/art/buildings/sp_b_stall_potion.png", Vector2(96, 36), false],
		["stall_scroll", "res://assets/art/buildings/sp_b_stall_scroll.png", Vector2(96, 36), false],
		["stall_weapon", "res://assets/art/buildings/sp_b_stall_weapon.png", Vector2(96, 36), false],
		["gar_hall", "res://assets/art/buildings/sp_b_gar_hall.png", Vector2(196, 52), true],
		["gar_barracks", "res://assets/art/buildings/sp_b_gar_barracks.png", Vector2(184, 48), true],
		["gar_barracks2", "res://assets/art/buildings/sp_b_gar_barracks2.png", Vector2(184, 48), true],
		["gar_stable", "res://assets/art/buildings/sp_b_gar_stable.png", Vector2(174, 48), true],
		["gar_pen", "res://assets/art/buildings/sp_b_gar_pen.png", Vector2(92, 34), false],
		["acad_dorm", "res://assets/art/buildings/sp_b_acad_dorm.png", Vector2(168, 46), true],
		["acad_greenhouse", "res://assets/art/buildings/sp_b_acad_greenhouse.png", Vector2(110, 48), true],
		["acad_gate", "res://assets/art/buildings/sp_b_acad_gate.png", Vector2.ZERO, true],
		["acad_fountain", "res://assets/art/buildings/sp_b_acad_fountain.png", Vector2(52, 24), false],
	]
	var scenes: Dictionary = {}
	for spec: Array in specs:
		var id: String = spec[0]
		var scene_path: String = "res://maps/buildings/%s.tscn" % id
		_save_building_scene(scene_path, id.capitalize(), spec[1], spec[2], spec[3])
		scenes[id] = MapBuilderHelper.load_res(scene_path) as PackedScene
	return scenes


func _save_building_scene(
	save_path: String,
	node_name: String,
	tex_path: String,
	col_sz: Vector2,
	has_fade: bool
) -> void:
	var root: StaticBody2D = StaticBody2D.new()
	root.name = node_name
	root.collision_layer = 1
	root.collision_mask = 0
	root.set_script(MapBuilderHelper.BUILDING_SCRIPT)

	var tex: Texture2D = MapBuilderHelper.load_res(tex_path) as Texture2D
	var h: float = float(tex.get_height())
	var spr: Sprite2D = Sprite2D.new()
	spr.name = "Sprite2D"
	spr.texture = tex
	spr.offset = Vector2(0.0, -h * 0.5)
	root.add_child(spr)
	spr.owner = root

	if col_sz != Vector2.ZERO:
		var col: CollisionShape2D = CollisionShape2D.new()
		col.name = "CollisionShape2D"
		var rect: RectangleShape2D = RectangleShape2D.new()
		rect.size = col_sz
		col.shape = rect
		col.position = Vector2(0.0, -col_sz.y * 0.5 - 2.0)
		root.add_child(col)
		col.owner = root

	if has_fade:
		var fade_area: Area2D = Area2D.new()
		fade_area.name = "FadeArea"
		fade_area.collision_layer = 0
		fade_area.collision_mask = 2
		root.add_child(fade_area)
		fade_area.owner = root

		var fcol: CollisionShape2D = CollisionShape2D.new()
		fcol.name = "CollisionShape2D"
		var frect: RectangleShape2D = RectangleShape2D.new()
		var fw: float = maxf(64.0, col_sz.x + 12.0) if col_sz != Vector2.ZERO else float(tex.get_width()) * 0.8
		var fh: float = maxf(36.0, h - col_sz.y - 8.0)
		frect.size = Vector2(fw, fh)
		fcol.shape = frect
		fcol.position = Vector2(0.0, -col_sz.y - frect.size.y * 0.5 - 4.0)
		fade_area.add_child(fcol)
		fcol.owner = root

	MapBuilderHelper.save_scene(root, save_path)


func _build_interiors(ts: TileSet) -> void:
	# 1. Home (int_room1.png: 127x111)
	_build_image_room("res://maps/interiors/home.tscn", "Home", "res://assets/art/interior/int_room1.png", false,
		127, 111, Vector2(58, 86), Vector2(58, 102), &"from_home",
		[Rect2(93, 42, 24, 14), Rect2(95, 56, 22, 11), Rect2(33, 56, 42, 22), Rect2(10, 64, 14, 28), Rect2(103, 72, 14, 20)],
		44, 72, 92, Vector2(92, 52), Vector2(24, 52), &"home_c1", &"bread_mila", 1, 15, "", "", "")

	# 2. Inn (int_room2.png: 136x112)
	_build_image_room("res://maps/interiors/inn.tscn", "Inn", "res://assets/art/interior/int_room2.png", false,
		136, 112, Vector2(68, 86), Vector2(68, 102), &"from_inn",
		[Rect2(92, 42, 34, 6), Rect2(11, 42, 13, 9), Rect2(111, 48, 15, 16), Rect2(10, 60, 26, 32), Rect2(100, 65, 26, 27)],
		54, 83, 92, Vector2(22, 68), Vector2.ZERO, &"", &"", 0, 0,
		"BuRina", "npc_inn_name", "res://assets/art/npc/npc_inn.png", Vector2(66, 54), "res://data/dialogues/inn_greet.tres")

	# 3. Elder Home (int_room3.png: 127x109)
	_build_image_room("res://maps/interiors/elderhome.tscn", "ElderHome", "res://assets/art/interior/int_room3.png", false,
		127, 109, Vector2(62, 82), Vector2(62, 98), &"from_elderhome",
		[Rect2(10, 42, 14, 23), Rect2(93, 42, 23, 14), Rect2(50, 52, 23, 24), Rect2(73, 52, 13, 22), Rect2(103, 53, 11, 12), Rect2(103, 68, 14, 20), Rect2(10, 72, 26, 16)],
		48, 77, 88, Vector2.ZERO, Vector2(78, 48), &"elder_c1", &"ether", 2, 45, "", "", "")

	# 4. Lina Home (int_room1.png flipped: 127x111)
	_build_image_room("res://maps/interiors/linahome.tscn", "LinaHome", "res://assets/art/interior/int_room1.png", true,
		127, 111, Vector2(69, 86), Vector2(69, 102), &"from_linahome",
		[Rect2(10, 42, 24, 14), Rect2(10, 56, 22, 11), Rect2(52, 56, 42, 22), Rect2(103, 64, 14, 28), Rect2(10, 72, 14, 20)],
		55, 83, 92, Vector2.ZERO, Vector2.ZERO, &"", &"", 0, 0,
		"BuWulan", "npc_mom_name", "res://assets/art/npc/npc_mom.png", Vector2(88, 54), "res://data/dialogues/mom_greet.tres")

	# 5. Kuil Penjaga Cahaya (interior kuil batu 20x16 = 320x256)
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Temple", ts, 20, 16)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 1.5)
	dirt.modulate = Color(0.62, 0.66, 0.78)
	grass.queue_free()

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(160, 120))
	MapBuilderHelper.add_npc(ysorted, root, "PendetaElian", "npc_priest_name", "res://assets/art/npc/npc_priest.png", "res://data/dialogues/priest_greet.tres", Vector2(215, 130), "left")
	MapBuilderHelper.add_chest(ysorted, root, "TempleChest", &"temple_c1", &"crystal_sword", 1, 80, Vector2(96, 135))
	MapBuilderHelper.add_borders(root, [
		Rect2(0, 0, 320, 44), Rect2(0, 0, 24, 256), Rect2(296, 0, 24, 256),
		Rect2(0, 240, 132, 24), Rect2(188, 240, 132, 24),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(160, 206))
	MapBuilderHelper.add_portal(root, "ToLake", Vector2(160, 244), "res://maps/lake.tscn", &"from_temple", Vector2(44, 18))
	MapBuilderHelper.save_scene(root, "res://maps/interiors/temple.tscn")


func _build_image_room(
	save_path: String,
	node_name: String,
	bg_path: String,
	flip_h: bool,
	w: int,
	h: int,
	entry_pos: Vector2,
	exit_pos: Vector2,
	village_spawn: StringName,
	solid_rects: Array[Rect2],
	dl: int,
	dr: int,
	fb: int,
	bed_pos: Vector2,
	chest_pos: Vector2,
	chest_id: StringName,
	chest_item: StringName,
	chest_qty: int,
	chest_gold: int,
	npc_node: String,
	npc_key: String,
	npc_tex: String,
	npc_pos: Vector2 = Vector2.ZERO,
	npc_dlg: String = ""
) -> void:
	var root: Node2D = Node2D.new()
	root.name = node_name
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 2.0)
	root.set_meta("map_bounds", Rect2i(0, 0, w, h))

	var bg_dark: ColorRect = ColorRect.new()
	bg_dark.name = "Backdrop"
	bg_dark.color = Color(0.05, 0.03, 0.03, 1.0)
	bg_dark.position = Vector2(-240, -160)
	bg_dark.size = Vector2(w + 480, h + 320)
	bg_dark.z_index = -5
	root.add_child(bg_dark)
	bg_dark.owner = root

	var bg: Sprite2D = Sprite2D.new()
	bg.name = "RoomBg"
	bg.texture = MapBuilderHelper.load_res(bg_path) as Texture2D
	bg.centered = false
	bg.flip_h = flip_h
	bg.z_index = -2
	root.add_child(bg)
	bg.owner = root

	var ysorted: Node2D = Node2D.new()
	ysorted.name = "YSorted"
	ysorted.y_sort_enabled = true
	root.add_child(ysorted)
	ysorted.owner = root

	if bed_pos != Vector2.ZERO:
		MapBuilderHelper.add_bed(root, "BedInteract", bed_pos)
	if chest_pos != Vector2.ZERO and not String(chest_id).is_empty():
		MapBuilderHelper.add_chest(ysorted, root, "RoomChest", chest_id, chest_item, chest_qty, chest_gold, chest_pos)
	if not npc_node.is_empty():
		MapBuilderHelper.add_npc(ysorted, root, npc_node, npc_key, npc_tex, npc_dlg, npc_pos, "down")

	var walls: Array[Rect2] = [
		Rect2(0, 0, w, 42), Rect2(0, 0, 10, h), Rect2(w - 10, 0, 10, h),
		Rect2(0, fb, dl, h - fb), Rect2(dr, fb, w - dr, h - fb),
	]
	walls.append_array(solid_rects)
	MapBuilderHelper.add_borders(root, walls)

	var spawns: Node2D = Node2D.new()
	spawns.name = "SpawnPoints"
	root.add_child(spawns)
	spawns.owner = root
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", entry_pos)

	MapBuilderHelper.add_portal(root, "ToVillage", exit_pos, "res://maps/village.tscn", village_spawn, Vector2(dr - dl, 16))
	MapBuilderHelper.save_scene(root, save_path)


func _build_village_map(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 64
	var rows: int = 45
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Village", ts, cols, rows)
	var root: Node2D = m["root"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(31.5, 22.5), 5.2, 4.0)
	var road_segs: Array[Array] = [
		[Vector2(30, 19), Vector2(32, 0), 1.4], [Vector2(28, 24), Vector2(18, 29), 1.3],
		[Vector2(18, 29), Vector2(0, 36), 1.4], [Vector2(35, 20), Vector2(46, 20), 1.3],
		[Vector2(46, 20), Vector2(50, 16), 1.3], [Vector2(50, 16), Vector2(63, 16), 1.4],
		[Vector2(31, 25), Vector2(28, 33), 1.3], [Vector2(28, 33), Vector2(32, 44), 1.6],
		[Vector2(31, 14), Vector2(11, 14), 1.0], [Vector2(33, 13), Vector2(46, 15), 1.0],
		[Vector2(47, 20), Vector2(48, 36), 1.1], [Vector2(48, 36), Vector2(54, 37), 1.1],
		[Vector2(28, 34), Vector2(36, 37), 1.0], [Vector2(36, 37), Vector2(48, 36), 1.0],
		[Vector2(28, 34), Vector2(23, 39), 1.0],
	]
	for seg: Array in road_segs:
		MapBuilderHelper.carve_road(grid, cols, rows, seg[0], seg[1], seg[2])
	for spot: Vector2i in [
		Vector2i(22, 13), Vector2i(40, 13), Vector2i(16, 26), Vector2i(24, 38),
		Vector2i(59, 9), Vector2i(11, 13), Vector2i(42, 34), Vector2i(33, 35),
		Vector2i(53, 33), Vector2i(46, 14), Vector2i(12, 28)
	]:
		MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(spot.x, spot.y), 2.2, 1.4)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	var b_placements: Array[Array] = [
		["HouseDarto", "house_a", Vector2(355, 213)], ["Inn", "house_c", Vector2(642, 203)],
		["HouseLastri", "house_b", Vector2(250, 424)], ["HouseSouth", "house_b", Vector2(380, 614)],
		["HouseEast", "house_b", Vector2(947, 142)], ["HouseJoko", "house_brown", Vector2(180, 215)],
		["HouseRed", "house_red", Vector2(669, 542)], ["HouseArka", "house_proto", Vector2(526, 552)],
		["Blacksmith", "blacksmith", Vector2(854, 532)], ["VillageWell", "well", Vector2(506, 375)],
		["MarketStall", "market_stall", Vector2(746, 222)],
	]
	for bp: Array in b_placements:
		var b_inst: Node2D = (buildings[bp[1]] as PackedScene).instantiate() as Node2D
		b_inst.name = bp[0]
		b_inst.position = bp[2]
		ysorted.add_child(b_inst)
		b_inst.owner = root

	var tree_placements: Array[Array] = [
		[Vector2(108, 108), "big_dark"], [Vector2(148, 128), "big"], [Vector2(266, 186), "tall"],
		[Vector2(382, 82), "big"], [Vector2(432, 78), "big_dark"], [Vector2(588, 92), "big"],
		[Vector2(718, 86), "big_dark"], [Vector2(768, 94), "tall"], [Vector2(862, 128), "big"],
		[Vector2(78, 288), "big_dark"], [Vector2(64, 342), "big"], [Vector2(64, 482), "tall_dark"],
		[Vector2(124, 646), "big_dark"], [Vector2(168, 650), "big"], [Vector2(292, 650), "tall"],
		[Vector2(436, 666), "big"], [Vector2(650, 656), "big_dark"], [Vector2(716, 654), "big"],
		[Vector2(776, 658), "tall_dark"], [Vector2(918, 656), "big"], [Vector2(954, 594), "big_dark"],
		[Vector2(956, 466), "tall"], [Vector2(716, 452), "big"],
	]
	for idx: int in tree_placements.size():
		var tp: Array = tree_placements[idx]
		MapBuilderHelper.add_tree(ysorted, root, "Tree_%d" % idx, tp[0], tp[1])

	MapBuilderHelper.add_prop(ysorted, root, "CrateCart", "res://assets/art/props/crateCart.png", Vector2(442, 224), Vector2(34, 14))
	MapBuilderHelper.add_prop(ysorted, root, "BenchPlazaN", "res://assets/art/props/benchWood.png", Vector2(443, 202), Vector2(26, 8))
	MapBuilderHelper.add_prop(ysorted, root, "BenchPlazaE", "res://assets/art/props/benchWood.png", Vector2(692, 416), Vector2(26, 8))
	MapBuilderHelper.add_prop(ysorted, root, "BenchMarket", "res://assets/art/props/benchWood.png", Vector2(704, 274), Vector2(26, 8))
	MapBuilderHelper.add_prop(ysorted, root, "LampCenter", "res://assets/art/props/lampPost.png", Vector2(440, 305), Vector2(10, 6))
	MapBuilderHelper.add_prop(ysorted, root, "LampSouth", "res://assets/art/props/lampPost.png", Vector2(425, 490), Vector2(10, 6))
	MapBuilderHelper.add_prop(ysorted, root, "Planter1", "res://assets/art/props/planter.png", Vector2(284, 214), Vector2(28, 8))
	MapBuilderHelper.add_prop(ysorted, root, "Planter2", "res://assets/art/props/planter.png", Vector2(578, 565), Vector2(28, 8))
	MapBuilderHelper.add_prop(ysorted, root, "Pot1", "res://assets/art/props/pot.png", Vector2(396, 220), Vector2(14, 6))
	MapBuilderHelper.add_prop(ysorted, root, "Pot2", "res://assets/art/props/pot.png", Vector2(550, 566), Vector2(14, 6))

	var deco_tex: Texture2D = MapBuilderHelper.load_res(DECO_OBJS_PATH) as Texture2D
	for b_pos: Vector2 in [
		Vector2(166, 104), Vector2(274, 202), Vector2(642, 104),
		Vector2(788, 124), Vector2(306, 434), Vector2(412, 518), Vector2(732, 556)
	]:
		MapBuilderHelper.add_atlas_prop(ysorted, root, "Bush", deco_tex, Rect2(16, 48, 16, 16), 2.0, b_pos, Vector2(22, 8))
	for f_pos: Vector2 in [
		Vector2(470, 340), Vector2(548, 342), Vector2(315, 250),
		Vector2(615, 260), Vector2(488, 570), Vector2(722, 410)
	]:
		MapBuilderHelper.add_atlas_prop(ysorted, root, "Flower", deco_tex, Rect2(99, 39, 9, 6), 2.0, f_pos, Vector2.ZERO)

	var market_items: Array[StringName] = [&"potion", &"hi_potion", &"ether", &"bread_mila", &"honey"]
	var smith_items: Array[StringName] = [&"iron_sword", &"steel_sword", &"iron_spear", &"battle_axe", &"leather_vest", &"iron_chainmail"]
	MapBuilderHelper.add_npc(ysorted, root, "TetuaBram", "npc_elder_name", "res://assets/art/npc/npc_elder.png", "res://data/dialogues/elder_intro.tres", Vector2(486, 145), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PakDarto", "npc_farmer_name", "res://assets/art/npc/npc_farmer.png", "res://data/dialogues/farmer_greet.tres", Vector2(335, 238), "right", 16.0)
	MapBuilderHelper.add_npc(ysorted, root, "Lina", "npc_lina_name", "res://assets/art/npc/npc_girl.png", "res://data/dialogues/villager_greet.tres", Vector2(382, 238), "left", 16.0)
	MapBuilderHelper.add_npc(ysorted, root, "BuSari", "npc_merchant_name", "res://assets/art/npc/npc_merchant.png", "res://data/dialogues/merchant_greet.tres", Vector2(730, 245), "down", 0.0, &"village_market", "ui_shop_village", market_items)
	MapBuilderHelper.add_npc(ysorted, root, "PakBesi", "npc_smith_name", "res://assets/art/npc/npc_smith.png", "res://data/dialogues/smith_greet.tres", Vector2(856, 568), "left", 0.0, &"village_smith", "ui_shop_smith", smith_items)
	MapBuilderHelper.add_npc(ysorted, root, "Penjaga", "npc_guard_name", "res://assets/art/npc/npc_guard.png", "res://data/dialogues/guard_greet.tres", Vector2(468, 650), "right")

	MapBuilderHelper.add_chest(ysorted, root, "VillageChest", &"village_c1", &"potion", 2, 25, Vector2(140, 488))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitV", "rabbit", Vector2(240, 290))
	MapBuilderHelper.add_animal(ysorted, root, "SquirrelV", "squirrel", Vector2(695, 445))
	MapBuilderHelper.add_animal(ysorted, root, "DuckV", "duck", Vector2(830, 315))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 470, 32), Rect2(554, -16, 470, 32),
		Rect2(-16, 0, 32, 550), Rect2(-16, 626, 32, 94),
		Rect2(1008, 0, 32, 230), Rect2(1008, 302, 32, 418),
		Rect2(0, 704, 474, 32), Rect2(550, 704, 474, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(512, 428))
	MapBuilderHelper.add_spawn(spawns, root, "FromGlade", &"from_glade", Vector2(215, 470))
	MapBuilderHelper.add_spawn(spawns, root, "FromForest", &"from_forest", Vector2(512, 666))
	MapBuilderHelper.add_spawn(spawns, root, "FromMeadow", &"from_meadow", Vector2(972, 266))
	MapBuilderHelper.add_spawn(spawns, root, "FromLake", &"from_lake", Vector2(48, 588))
	MapBuilderHelper.add_spawn(spawns, root, "FromHome", &"from_home", Vector2(526, 580))
	MapBuilderHelper.add_spawn(spawns, root, "FromInn", &"from_inn", Vector2(642, 232))
	MapBuilderHelper.add_spawn(spawns, root, "FromElderHome", &"from_elderhome", Vector2(512, 118))
	MapBuilderHelper.add_spawn(spawns, root, "FromLinaHome", &"from_linahome", Vector2(355, 240))

	MapBuilderHelper.add_portal(root, "ToForest", Vector2(512, 710), "res://maps/forest.tscn", &"from_village")
	MapBuilderHelper.add_portal(root, "ToMeadow", Vector2(1012, 266), "res://maps/meadow.tscn", &"from_village", Vector2(22, 60))
	MapBuilderHelper.add_portal(root, "ToLake", Vector2(12, 588), "res://maps/lake.tscn", &"from_village", Vector2(22, 60))
	MapBuilderHelper.add_portal(root, "ToTrainingGlade", Vector2(182, 456), "res://maps/training_glade.tscn", &"from_village", Vector2(24, 24))
	MapBuilderHelper.add_portal(root, "DoorHome", Vector2(526, 558), "res://maps/interiors/home.tscn", &"default", Vector2(22, 12))
	MapBuilderHelper.add_portal(root, "DoorInn", Vector2(642, 208), "res://maps/interiors/inn.tscn", &"default", Vector2(22, 12))
	MapBuilderHelper.add_portal(root, "DoorElderHome", Vector2(512, 74), "res://maps/interiors/elderhome.tscn", &"default", Vector2(28, 14))
	MapBuilderHelper.add_portal(root, "DoorLinaHome", Vector2(355, 218), "res://maps/interiors/linahome.tscn", &"default", Vector2(22, 12))
	MapBuilderHelper.save_scene(root, "res://maps/village.tscn")
