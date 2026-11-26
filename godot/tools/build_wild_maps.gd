class_name WildMapsBuilder
extends RefCounted


static func build_all(ts: TileSet, buildings: Dictionary) -> void:
	_build_training_glade(ts)
	_build_forest(ts)
	_build_meadow(ts, buildings)
	_build_lake(ts, buildings)
	_build_cave(ts)
	_build_swamp(ts)
	_build_snow(ts)
	_build_deepwood(ts, buildings)
	_build_river(ts, buildings)
	_build_road(ts, buildings)


static func _build_training_glade(ts: TileSet) -> void:
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("TrainingGlade", ts, 40, 30)
	var root: Node2D = m["root"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_road(grid, 40, 30, Vector2(20, 0), Vector2(20, 12), 1.6)
	MapBuilderHelper.carve_ellipse(grid, 40, 30, Vector2(20, 16), 7.0, 5.2)
	MapBuilderHelper.carve_road(grid, 40, 30, Vector2(25, 15), Vector2(31, 14), 1.2)
	MapBuilderHelper.paint_water_ellipse(water, grid, 40, 30, Vector2(32.5, 13.5), 2.8, 2.5)
	MapBuilderHelper.apply_grass_autotile(grass, grid, 40, 30)

	MapBuilderHelper.add_tree_ring(ysorted, root, 640, 480, 74, "big_dark", "tall_dark", [Rect2(260, 0, 120, 100)])
	MapBuilderHelper.add_shrine(ysorted, root, Vector2(238, 165))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarWest", "boar", Vector2(190, 310))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarEast", "boar", Vector2(425, 295))
	MapBuilderHelper.add_enemy(ysorted, root, "SlaverScout", "slaver", Vector2(332, 365))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitGlade", "rabbit", Vector2(160, 210))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 284, 32), Rect2(356, -16, 284, 32),
		Rect2(-16, 0, 32, 480), Rect2(624, 0, 32, 480), Rect2(0, 464, 640, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(320, 62))
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(320, 125))
	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(320, 14), "res://maps/village.tscn", &"from_glade")
	MapBuilderHelper.save_scene(root, "res://maps/training_glade.tscn")


static func _build_forest(ts: TileSet) -> void:
	var cols: int = 80
	var rows: int = 75
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Forest", ts, cols, rows)
	var root: Node2D = m["root"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	var roads: Array[Array] = [
		[Vector2(40, 0), Vector2(40, 12), 1.6], [Vector2(40, 12), Vector2(26, 18), 1.5],
		[Vector2(26, 18), Vector2(24, 43), 1.5], [Vector2(24, 43), Vector2(12, 46), 1.3],
		[Vector2(12, 46), Vector2(0, 46), 1.4], [Vector2(26, 18), Vector2(62, 20), 1.3],
		[Vector2(62, 20), Vector2(66, 33), 1.4], [Vector2(66, 33), Vector2(79, 33), 1.5],
		[Vector2(25, 43), Vector2(42, 49), 1.5], [Vector2(42, 49), Vector2(40, 66), 1.5],
		[Vector2(42, 49), Vector2(62, 54), 1.2],
	]
	for seg: Array in roads:
		MapBuilderHelper.carve_road(grid, cols, rows, seg[0], seg[1], seg[2])
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(64, 19), 7.5, 6.0)
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(40, 66), 4.0, 3.0)

	# Sungai melintang & Anak Sungai Cermin dengan jembatan jalan x=23..26
	for wx: int in range(0, cols, 3):
		var wy: float = 37.5 + sin(float(wx) * 0.14) * 1.4
		MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(wx, wy), 2.3, 1.8)
	for ny: int in range(0, 38, 3):
		MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(4.5 + sin(float(ny) * 0.2) * 1.1, ny), 2.1, 2.0)
	MapBuilderHelper.clear_water_rect(water, 23, 34, 26, 41)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1280, 1200, 92, "tall_dark", "big_dark", [
		Rect2(580, 0, 120, 90), Rect2(0, 660, 90, 130), Rect2(1190, 470, 90, 130)
	])
	# Markas Goblin (12 aset goblin_*)
	MapBuilderHelper.add_prop(ysorted, root, "GoblinFortress", "res://assets/art/goblin/goblin_fortress.png", Vector2(1110, 200), Vector2(150, 48))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinCage", "res://assets/art/goblin/goblin_cage.png", Vector2(1168, 165), Vector2(44, 22))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinGate", "res://assets/art/goblin/goblin_gate.png", Vector2(930, 340), Vector2(0, 0), 1)
	MapBuilderHelper.add_prop(ysorted, root, "GoblinTowerW", "res://assets/art/goblin/goblin_tower.png", Vector2(885, 315), Vector2(30, 18))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinTowerE", "res://assets/art/goblin/goblin_tower.png", Vector2(1185, 270), Vector2(30, 18))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinForge", "res://assets/art/goblin/goblin_forge.png", Vector2(955, 275), Vector2(48, 22))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinHut1", "res://assets/art/goblin/goblin_hut.png", Vector2(920, 225), Vector2(56, 24))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinHut2", "res://assets/art/goblin/goblin_hut.png", Vector2(985, 195), Vector2(56, 24))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinShrine", "res://assets/art/goblin/goblin_shrine.png", Vector2(1065, 255), Vector2(48, 22))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinCauldron", "res://assets/art/goblin/goblin_cauldron.png", Vector2(1030, 295), Vector2(42, 20))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinWagon", "res://assets/art/goblin/goblin_wagon.png", Vector2(1135, 348), Vector2(36, 14))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinTorch", "res://assets/art/goblin/goblin_torch.png", Vector2(905, 355), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinBanner", "res://assets/art/goblin/goblin_banner.png", Vector2(888, 342), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "GoblinTotem", "res://assets/art/goblin/goblin_totem.png", Vector2(945, 368), Vector2(12, 8))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(640, 1065))
	MapBuilderHelper.add_fishing_spot(root, "ForestFish", Vector2(215, 600))
	MapBuilderHelper.add_npc(ysorted, root, "PemburuRaka", "npc_hunter_name", "res://assets/art/npc/npc_hunter.png", "res://data/dialogues/hunter_greet.tres", Vector2(600, 110), "down")
	MapBuilderHelper.add_chest(ysorted, root, "ForestChest1", &"forest_c1", &"hi_potion", 1, 45, Vector2(1060, 320))
	MapBuilderHelper.add_chest(ysorted, root, "ForestChest2", &"forest_c2", &"iron_sword", 1, 0, Vector2(210, 820))
	MapBuilderHelper.add_chest(ysorted, root, "ForestChest3", &"forest_c3", &"ether", 2, 30, Vector2(676, 165))
	MapBuilderHelper.add_animal(ysorted, root, "DeerForest", "deer", Vector2(490, 440))
	MapBuilderHelper.add_animal(ysorted, root, "OwlForest", "owl", Vector2(540, 250))

	MapBuilderHelper.add_enemy(ysorted, root, "BossGoblinChief", "gchief", Vector2(1010, 320))
	MapBuilderHelper.add_enemy(ysorted, root, "BossSlaverCapt", "slaver_captain", Vector2(290, 645))
	MapBuilderHelper.add_enemy(ysorted, root, "Slaver1", "slaver", Vector2(245, 665))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarF1", "boar", Vector2(490, 230))
	MapBuilderHelper.add_enemy(ysorted, root, "BatF1", "bat", Vector2(440, 390))
	MapBuilderHelper.add_enemy(ysorted, root, "ShroomF1", "shroom", Vector2(205, 760))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeF1", "snake", Vector2(960, 830))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 600, 32), Rect2(680, -16, 600, 32),
		Rect2(-16, 0, 32, 700), Rect2(-16, 760, 32, 440),
		Rect2(1264, 0, 32, 500), Rect2(1264, 560, 32, 640), Rect2(0, 1184, 1280, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(640, 120))
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(640, 62))
	MapBuilderHelper.add_spawn(spawns, root, "FromDeepwood", &"from_deepwood", Vector2(62, 730))
	MapBuilderHelper.add_spawn(spawns, root, "FromRiver", &"from_river", Vector2(1216, 530))
	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(640, 14), "res://maps/village.tscn", &"from_forest")
	MapBuilderHelper.add_portal(root, "ToDeepwood", Vector2(14, 730), "res://maps/deepwood.tscn", &"from_forest", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToRiver", Vector2(1266, 530), "res://maps/river.tscn", &"from_forest", Vector2(22, 56))
	MapBuilderHelper.save_scene(root, "res://maps/forest.tscn")


static func _build_meadow(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 90
	var rows: int = 65
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Meadow", ts, cols, rows)
	var root: Node2D = m["root"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	var roads: Array[Array] = [
		[Vector2(0, 21), Vector2(16, 21), 1.5], [Vector2(16, 21), Vector2(29, 29), 1.5],
		[Vector2(29, 29), Vector2(51, 29), 1.5], [Vector2(51, 29), Vector2(65, 21), 1.4],
		[Vector2(65, 21), Vector2(75, 13), 1.4], [Vector2(16, 21), Vector2(19, 13), 1.2],
		[Vector2(29, 29), Vector2(37, 15), 1.3], [Vector2(37, 15), Vector2(37, 0), 1.4],
		[Vector2(29, 29), Vector2(26, 45), 1.3], [Vector2(51, 29), Vector2(62, 44), 1.3],
		[Vector2(62, 44), Vector2(62, 64), 1.4], [Vector2(62, 44), Vector2(77, 46), 1.4],
	]
	for seg: Array in roads:
		MapBuilderHelper.carve_road(grid, cols, rows, seg[0], seg[1], seg[2])

	MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(41, 45.5), 8.5, 4.8)
	for sy: int in range(0, 26, 3):
		MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(46, sy), 2.5, 2.3)
	MapBuilderHelper.clear_water_rect(water, 43, 27, 49, 31)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1440, 1040, 96, "big", "tall", [
		Rect2(0, 280, 90, 110), Rect2(540, 0, 120, 80), Rect2(940, 960, 120, 80)
	])
	var windmill: Node2D = (buildings["windmill"] as PackedScene).instantiate() as Node2D
	windmill.name = "Windmill"
	windmill.position = Vector2(300, 180)
	ysorted.add_child(windmill)
	windmill.owner = root

	var house_w: Node2D = (buildings["house_a"] as PackedScene).instantiate() as Node2D
	house_w.name = "HouseMeadowW"
	house_w.position = Vector2(150, 248)
	ysorted.add_child(house_w)
	house_w.owner = root

	var house_e: Node2D = (buildings["house_b"] as PackedScene).instantiate() as Node2D
	house_e.name = "HouseMeadowE"
	house_e.position = Vector2(485, 245)
	ysorted.add_child(house_e)
	house_e.owner = root

	MapBuilderHelper.add_prop(ysorted, root, "MeadowDock", "res://assets/art/ground/deco_water_dock.png", Vector2(640, 818), Vector2(64, 24))
	MapBuilderHelper.add_prop(ysorted, root, "MeadowBoat", "res://assets/art/ground/deco_water_boat.png", Vector2(700, 785), Vector2(48, 22))
	MapBuilderHelper.add_prop(ysorted, root, "MeadowBench", "res://assets/art/props/bench.png", Vector2(280, 845), Vector2(40, 10))
	MapBuilderHelper.add_prop(ysorted, root, "CaveEntrance", "res://assets/art/buildings/sp_b_shrine.png", Vector2(1200, 180), Vector2(76, 22))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(460, 425))
	MapBuilderHelper.add_npc(ysorted, root, "PakJoko", "npc_joko_name", "res://assets/art/npc/npc_joko.png", "res://data/dialogues/joko_greet.tres", Vector2(340, 290), "down", 20.0)
	MapBuilderHelper.add_npc(ysorted, root, "Wati", "npc_wati_name", "res://assets/art/npc/npc_wati.png", "res://data/dialogues/wati_greet.tres", Vector2(185, 290), "down", 18.0)
	MapBuilderHelper.add_npc(ysorted, root, "Darma", "npc_darma_name", "res://assets/art/npc/npc_darma.png", "res://data/dialogues/darma_greet.tres", Vector2(520, 290), "left")
	var shop_items: Array[StringName] = [&"potion", &"hi_potion", &"ether", &"honey", &"leather_vest"]
	MapBuilderHelper.add_npc(ysorted, root, "PedagangBayu", "npc_bayu_name", "res://assets/art/npc/npc_bayu.png", "res://data/dialogues/bayu_greet.tres", Vector2(248, 372), "down", 0.0, &"meadow_shop", "ui_shop_meadow", shop_items)

	MapBuilderHelper.add_chest(ysorted, root, "MeadowChest1", &"meadow_m1", &"hi_potion", 1, 50, Vector2(300, 868))
	MapBuilderHelper.add_chest(ysorted, root, "MeadowChest2", &"meadow_m2", &"steel_sword", 1, 0, Vector2(1255, 815))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitM", "rabbit", Vector2(410, 340))
	MapBuilderHelper.add_animal(ysorted, root, "DuckM", "duck", Vector2(575, 760))

	MapBuilderHelper.add_enemy(ysorted, root, "BossSamurai", "samurai", Vector2(1240, 720))
	MapBuilderHelper.add_enemy(ysorted, root, "BeeM1", "bee", Vector2(620, 260))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarM1", "boar", Vector2(640, 420))
	MapBuilderHelper.add_enemy(ysorted, root, "PlantM1", "plant", Vector2(560, 540))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarM2", "boar", Vector2(1010, 560))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeM1", "snake", Vector2(400, 760))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 560, 32), Rect2(640, -16, 800, 32),
		Rect2(-16, 0, 32, 296), Rect2(-16, 364, 32, 676),
		Rect2(1424, 0, 32, 1040), Rect2(0, 1024, 960, 32), Rect2(1040, 1024, 400, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(340, 340))
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(62, 330))
	MapBuilderHelper.add_spawn(spawns, root, "FromCave", &"from_cave", Vector2(1200, 224))
	MapBuilderHelper.add_spawn(spawns, root, "FromSnow", &"from_snow", Vector2(600, 62))
	MapBuilderHelper.add_spawn(spawns, root, "FromSwamp", &"from_swamp", Vector2(1000, 978))

	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(14, 330), "res://maps/village.tscn", &"from_meadow", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToCave", Vector2(1200, 192), "res://maps/cave.tscn", &"from_meadow", Vector2(44, 24))
	MapBuilderHelper.add_portal(root, "ToSnow", Vector2(600, 14), "res://maps/snow.tscn", &"from_meadow")
	MapBuilderHelper.add_portal(root, "ToSwamp", Vector2(1000, 1026), "res://maps/swamp.tscn", &"from_meadow")
	MapBuilderHelper.save_scene(root, "res://maps/meadow.tscn")


static func _build_lake(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 88
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Lake", ts, cols, rows)
	var root: Node2D = m["root"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_road(grid, cols, rows, Vector2(87, 31), Vector2(62, 31), 1.6)
	MapBuilderHelper.carve_road(grid, cols, rows, Vector2(62, 31), Vector2(51, 8), 1.4)
	MapBuilderHelper.carve_road(grid, cols, rows, Vector2(51, 8), Vector2(51, 0), 1.4)
	MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(35, 27), 19.0, 12.5)
	for cx: int in range(52, cols, 4):
		MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(cx, 40.5), 2.3, 1.8)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1408, 992, 96, "big", "tall_dark", [
		Rect2(760, 0, 120, 80), Rect2(1320, 440, 88, 120)
	])
	var house_lake: Node2D = (buildings["house_c"] as PackedScene).instantiate() as Node2D
	house_lake.name = "HouseLake"
	house_lake.position = Vector2(1120, 300)
	ysorted.add_child(house_lake)
	house_lake.owner = root

	MapBuilderHelper.add_prop(ysorted, root, "LakeDock", "res://assets/art/ground/deco_water_dock.png", Vector2(960, 505), Vector2(60, 22))
	MapBuilderHelper.add_prop(ysorted, root, "LakeBoat", "res://assets/art/ground/deco_water_boat.png", Vector2(905, 455), Vector2(46, 20))
	MapBuilderHelper.add_prop(ysorted, root, "Lotus1", "res://assets/art/ground/deco_water_lotus.png", Vector2(745, 515), Vector2.ZERO, -1)
	MapBuilderHelper.add_prop(ysorted, root, "Lilypad1", "res://assets/art/ground/deco_water_lilypad.png", Vector2(455, 345), Vector2.ZERO, -1)
	MapBuilderHelper.add_prop(ysorted, root, "Reeds1", "res://assets/art/ground/deco_water_reeds_lush.png", Vector2(855, 560), Vector2.ZERO, 0)

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(1035, 465))
	MapBuilderHelper.add_fishing_spot(root, "LakeFish", Vector2(880, 495))
	MapBuilderHelper.add_npc(ysorted, root, "PakGun", "npc_gun_name", "res://assets/art/npc/npc_gun.png", "res://data/dialogues/gun_greet.tres", Vector2(930, 175), "left")
	MapBuilderHelper.add_npc(ysorted, root, "NenekRatih", "npc_ratih_name", "res://assets/art/npc/npc_ratih.png", "res://data/dialogues/ratih_greet.tres", Vector2(1045, 560), "left")
	MapBuilderHelper.add_animal(ysorted, root, "DuckLake", "duck", Vector2(980, 620))

	MapBuilderHelper.add_enemy(ysorted, root, "FrogL1", "frog", Vector2(300, 740))
	MapBuilderHelper.add_enemy(ysorted, root, "WispL1", "wisp", Vector2(240, 800))
	MapBuilderHelper.add_enemy(ysorted, root, "WispL2", "wisp", Vector2(900, 240))
	MapBuilderHelper.add_enemy(ysorted, root, "FrogL2", "frog", Vector2(1180, 820))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 780, 32), Rect2(860, -16, 548, 32),
		Rect2(-16, 0, 32, 992), Rect2(0, 976, 1408, 32),
		Rect2(1392, 0, 32, 465), Rect2(1392, 535, 32, 457),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(1120, 500))
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(1348, 500))
	MapBuilderHelper.add_spawn(spawns, root, "FromRoad", &"from_road", Vector2(820, 64))
	MapBuilderHelper.add_spawn(spawns, root, "FromTemple", &"from_temple", Vector2(980, 520))

	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(1394, 500), "res://maps/village.tscn", &"from_lake", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToRoad", Vector2(820, 14), "res://maps/road.tscn", &"from_lake")
	MapBuilderHelper.add_portal(root, "ToTemple", Vector2(945, 500), "res://maps/interiors/temple.tscn", &"default", Vector2(28, 28))
	MapBuilderHelper.save_scene(root, "res://maps/lake.tscn")


static func _build_cave(ts: TileSet) -> void:
	var cols: int = 70
	var rows: int = 58
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Cave", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	root.set_meta("is_dark_cave", true)
	dirt.modulate = Color(0.45, 0.42, 0.52)
	grass.modulate = Color(0.28, 0.25, 0.34)

	var rooms: Array[Array] = [
		[Vector2(8, 50), 5.0, 4.0], [Vector2(26, 44), 5.5, 4.5],
		[Vector2(19, 26), 4.8, 4.0], [Vector2(39, 19), 5.5, 4.5],
		[Vector2(56, 29), 8.0, 6.2], [Vector2(54, 49), 4.5, 4.0],
	]
	for rm: Array in rooms:
		MapBuilderHelper.carve_ellipse(grid, cols, rows, rm[0], rm[1], rm[2])
	var paths: Array[Array] = [
		[Vector2(8, 57), Vector2(8, 50), 2.2], [Vector2(8, 50), Vector2(26, 44), 2.2],
		[Vector2(26, 44), Vector2(19, 26), 2.0], [Vector2(19, 26), Vector2(39, 19), 2.0],
		[Vector2(39, 19), Vector2(56, 29), 2.2], [Vector2(26, 44), Vector2(54, 49), 2.0],
	]
	for p: Array in paths:
		MapBuilderHelper.carve_road(grid, cols, rows, p[0], p[1], p[2])
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	# Block non-carved stone wall areas via simple StaticBody blocks along outer edge + torches
	for tp: Vector2 in [Vector2(140, 790), Vector2(420, 690), Vector2(300, 420), Vector2(620, 300), Vector2(860, 470)]:
		var lt: PointLight2D = PointLight2D.new()
		lt.name = "CaveTorch_%d" % int(tp.x)
		lt.position = tp
		lt.color = Color(0.95, 0.72, 0.45)
		lt.energy = 1.15
		lt.texture_scale = 2.4
		var grad: Gradient = Gradient.new()
		grad.colors = PackedColorArray([Color(1, 0.9, 0.7, 1), Color(1, 0.7, 0.4, 0)])
		grad.offsets = PackedFloat32Array([0.0, 1.0])
		var gtex: GradientTexture2D = GradientTexture2D.new()
		gtex.width = 96
		gtex.height = 96
		gtex.fill = GradientTexture2D.FILL_RADIAL
		gtex.fill_from = Vector2(0.5, 0.5)
		gtex.fill_to = Vector2(1.0, 0.5)
		gtex.gradient = grad
		lt.texture = gtex
		root.add_child(lt)
		lt.owner = root

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(180, 780))
	MapBuilderHelper.add_chest(ysorted, root, "CaveChest1", &"cave_g1", &"stone_armor", 1, 0, Vector2(960, 410))
	MapBuilderHelper.add_chest(ysorted, root, "CaveChest2", &"cave_g2", &"hi_potion", 2, 80, Vector2(860, 790))
	MapBuilderHelper.add_chest(ysorted, root, "CaveChest3", &"cave_g3", &"ether", 2, 60, Vector2(620, 260))

	MapBuilderHelper.add_enemy(ysorted, root, "BossGolemK", "golemk", Vector2(900, 465))
	MapBuilderHelper.add_enemy(ysorted, root, "BatC1", "bat", Vector2(400, 680))
	MapBuilderHelper.add_enemy(ysorted, root, "SkelC1", "skel", Vector2(455, 725))
	MapBuilderHelper.add_enemy(ysorted, root, "GhostC1", "ghost", Vector2(300, 430))
	MapBuilderHelper.add_enemy(ysorted, root, "GolemC1", "golem", Vector2(600, 310))
	MapBuilderHelper.add_enemy(ysorted, root, "MimicC1", "mimic", Vector2(890, 790))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1120, 32), Rect2(-16, 0, 32, 928), Rect2(1104, 0, 32, 928),
		Rect2(0, 912, 80, 32), Rect2(160, 912, 960, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(128, 815))
	MapBuilderHelper.add_spawn(spawns, root, "FromMeadow", &"from_meadow", Vector2(120, 840))
	MapBuilderHelper.add_portal(root, "ToMeadow", Vector2(120, 914), "res://maps/meadow.tscn", &"from_cave")
	MapBuilderHelper.save_scene(root, "res://maps/cave.tscn")


static func _build_swamp(ts: TileSet) -> void:
	var cols: int = 80
	var rows: int = 60
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Swamp", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	grass.modulate = Color(0.70, 0.80, 0.62)
	dirt.modulate = Color(0.76, 0.72, 0.60)
	water.modulate = Color(0.72, 0.84, 0.72)

	var roads: Array[Array] = [
		[Vector2(40, 0), Vector2(40, 10), 1.5], [Vector2(40, 10), Vector2(28, 22), 1.4],
		[Vector2(28, 22), Vector2(19, 32), 1.4], [Vector2(19, 32), Vector2(0, 30), 1.4],
		[Vector2(19, 32), Vector2(36, 45), 1.4], [Vector2(36, 45), Vector2(40, 52), 1.6],
		[Vector2(40, 10), Vector2(56, 24), 1.2], [Vector2(56, 24), Vector2(60, 35), 1.2],
	]
	for p: Array in roads:
		MapBuilderHelper.carve_road(grid, cols, rows, p[0], p[1], p[2])
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(40, 51), 5.5, 4.0)
	MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(39, 27.5), 6.5, 3.8)
	MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(11, 48), 5.5, 3.4)
	MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(12, 12.5), 4.5, 2.8)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1280, 960, 94, "big_dark", "tall_dark", [
		Rect2(580, 0, 120, 80), Rect2(0, 420, 90, 120)
	])
	MapBuilderHelper.add_prop(ysorted, root, "SwampLotus", "res://assets/art/ground/deco_water_lotus.png", Vector2(660, 480), Vector2.ZERO, -1)
	MapBuilderHelper.add_shrine(ysorted, root, Vector2(435, 300))
	MapBuilderHelper.add_fishing_spot(root, "SwampFish", Vector2(560, 445))
	MapBuilderHelper.add_npc(ysorted, root, "PertapaSura", "npc_hermit_name", "res://assets/art/npc/npc_hermit.png", "res://data/dialogues/hermit_greet.tres", Vector2(490, 290), "down", 0.0, &"", "", [], &"venom", 0)
	MapBuilderHelper.add_chest(ysorted, root, "SwampChest1", &"swamp_s1", &"hi_potion", 2, 70, Vector2(960, 556))
	MapBuilderHelper.add_chest(ysorted, root, "SwampChest2", &"swamp_s2", &"ether", 3, 50, Vector2(300, 516))
	MapBuilderHelper.add_chest(ysorted, root, "SwampChest3", &"swamp_s3", &"crystal_sword", 1, 150, Vector2(640, 880))

	MapBuilderHelper.add_enemy(ysorted, root, "BossMorgath", "witch", Vector2(640, 800))
	MapBuilderHelper.add_enemy(ysorted, root, "FrogSw1", "frog", Vector2(350, 540))
	MapBuilderHelper.add_enemy(ysorted, root, "WispSw1", "wisp", Vector2(520, 390))
	MapBuilderHelper.add_enemy(ysorted, root, "ShroomSw1", "shroom", Vector2(820, 480))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeSw1", "snake", Vector2(760, 620))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 600, 32), Rect2(680, -16, 600, 32),
		Rect2(-16, 0, 32, 450), Rect2(-16, 510, 32, 450),
		Rect2(1264, 0, 32, 960), Rect2(0, 944, 1280, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(640, 120))
	MapBuilderHelper.add_spawn(spawns, root, "FromMeadow", &"from_meadow", Vector2(640, 62))
	MapBuilderHelper.add_spawn(spawns, root, "FromRiver", &"from_river", Vector2(62, 480))
	MapBuilderHelper.add_portal(root, "ToMeadow", Vector2(640, 14), "res://maps/meadow.tscn", &"from_swamp")
	MapBuilderHelper.add_portal(root, "ToRiver", Vector2(14, 480), "res://maps/river.tscn", &"from_swamp", Vector2(22, 56))
	MapBuilderHelper.save_scene(root, "res://maps/swamp.tscn")


static func _build_snow(ts: TileSet) -> void:
	var cols: int = 80
	var rows: int = 75
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Snow", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	grass.modulate = Color(0.92, 0.96, 1.06)
	dirt.modulate = Color(0.84, 0.88, 0.96)
	water.modulate = Color(0.82, 0.94, 1.05)

	var roads: Array[Array] = [
		[Vector2(40, 74), Vector2(36, 56), 1.6], [Vector2(36, 56), Vector2(40, 35), 1.6],
		[Vector2(40, 35), Vector2(40, 14), 1.6], [Vector2(35, 62), Vector2(17, 48), 1.4],
		[Vector2(38, 56), Vector2(64, 45), 1.4],
	]
	for p: Array in roads:
		MapBuilderHelper.carve_road(grid, cols, rows, p[0], p[1], p[2])
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(40, 14), 6.5, 4.5)
	MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(24, 62), 4.5, 2.5)
	MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(56, 31), 5.5, 3.0)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1280, 1200, 96, "tall_dark", "big_dark", [Rect2(580, 1100, 120, 100)])
	MapBuilderHelper.add_shrine(ysorted, root, Vector2(596, 1040))
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaNila", "npc_nila_name", "res://assets/art/npc/npc_nila.png", "res://data/dialogues/nila_greet.tres", Vector2(565, 1080), "down", 0.0, &"", "", [], &"nova", 0)
	MapBuilderHelper.add_chest(ysorted, root, "SnowChest1", &"snow_n1", &"hi_potion", 2, 60, Vector2(180, 1020))
	MapBuilderHelper.add_chest(ysorted, root, "SnowChest2", &"snow_n2", &"ether", 2, 80, Vector2(1060, 980))
	MapBuilderHelper.add_chest(ysorted, root, "SnowChest3", &"snow_n3", &"iron_spear", 1, 200, Vector2(640, 150))

	MapBuilderHelper.add_enemy(ysorted, root, "BossKryos", "kryos", Vector2(640, 225))
	MapBuilderHelper.add_enemy(ysorted, root, "GolemIce1", "golemi", Vector2(560, 600))
	MapBuilderHelper.add_enemy(ysorted, root, "Salam1", "salam", Vector2(330, 820))
	MapBuilderHelper.add_enemy(ysorted, root, "Salam2", "salam", Vector2(860, 900))
	MapBuilderHelper.add_enemy(ysorted, root, "BatSnow1", "bat", Vector2(900, 700))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1280, 32), Rect2(-16, 0, 32, 1200), Rect2(1264, 0, 32, 1200),
		Rect2(0, 1184, 600, 32), Rect2(680, 1184, 600, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(640, 1080))
	MapBuilderHelper.add_spawn(spawns, root, "FromMeadow", &"from_meadow", Vector2(640, 1136))
	MapBuilderHelper.add_portal(root, "ToMeadow", Vector2(640, 1186), "res://maps/meadow.tscn", &"from_snow")
	MapBuilderHelper.save_scene(root, "res://maps/snow.tscn")


static func _build_deepwood(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 96
	var rows: int = 72
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Deepwood", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	grass.modulate = Color(0.84, 0.90, 0.86)
	dirt.modulate = Color(0.88, 0.84, 0.80)

	var roads: Array[Array] = [
		[Vector2(95, 34), Vector2(72, 34), 1.5], [Vector2(72, 34), Vector2(56, 22), 1.4],
		[Vector2(56, 22), Vector2(24, 20), 1.4], [Vector2(56, 22), Vector2(64, 52), 1.4],
		[Vector2(64, 52), Vector2(22, 58), 1.5],
	]
	for p: Array in roads:
		MapBuilderHelper.carve_road(grid, cols, rows, p[0], p[1], p[2])
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(22, 18), 6.0, 5.0)
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(22, 58), 6.5, 5.2)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1536, 1152, 96, "big_dark", "tall_dark", [Rect2(1430, 480, 106, 120)])
	var ruin: Node2D = (buildings["shrine_ruin"] as PackedScene).instantiate() as Node2D
	ruin.name = "AurelRuin"
	ruin.position = Vector2(360, 240)
	ysorted.add_child(ruin)
	ruin.owner = root

	MapBuilderHelper.add_prop(ysorted, root, "DwGoblinFort", "res://assets/art/goblin/goblin_fortress.png", Vector2(260, 920), Vector2(150, 48))
	MapBuilderHelper.add_prop(ysorted, root, "DwGoblinShrine", "res://assets/art/goblin/goblin_shrine.png", Vector2(410, 955), Vector2(48, 22))
	MapBuilderHelper.add_shrine(ysorted, root, Vector2(360, 290))
	MapBuilderHelper.add_npc(ysorted, root, "Sambo", "npc_sambo_name", "res://assets/art/npc/npc_darma.png", "res://data/dialogues/sambo_greet.tres", Vector2(1040, 820), "down")
	MapBuilderHelper.add_chest(ysorted, root, "DwChest1", &"dw_c1", &"crystal_sword", 1, 120, Vector2(360, 320))
	MapBuilderHelper.add_chest(ysorted, root, "DwChest2", &"dw_c2", &"iron_chainmail", 1, 0, Vector2(1180, 960))
	MapBuilderHelper.add_chest(ysorted, root, "DwChest3", &"dw_c3", &"hi_potion", 2, 100, Vector2(200, 1020))
	MapBuilderHelper.add_animal(ysorted, root, "SquirrelDw", "squirrel", Vector2(1240, 520))

	MapBuilderHelper.add_enemy(ysorted, root, "BossGKing", "gking", Vector2(340, 940))
	MapBuilderHelper.add_enemy(ysorted, root, "BossSQueen", "squeen", Vector2(1060, 880))
	MapBuilderHelper.add_enemy(ysorted, root, "GhostDw1", "ghost", Vector2(420, 300))
	MapBuilderHelper.add_enemy(ysorted, root, "GolemDw1", "golem", Vector2(540, 360))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarDw1", "boar", Vector2(1220, 400))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeDw1", "snake", Vector2(720, 840))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1536, 32), Rect2(-16, 0, 32, 1152),
		Rect2(1520, 0, 32, 500), Rect2(1520, 580, 32, 572), Rect2(0, 1136, 1536, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(1420, 540))
	MapBuilderHelper.add_spawn(spawns, root, "FromForest", &"from_forest", Vector2(1470, 540))
	MapBuilderHelper.add_portal(root, "ToForest", Vector2(1522, 540), "res://maps/forest.tscn", &"from_deepwood", Vector2(22, 56))
	MapBuilderHelper.save_scene(root, "res://maps/deepwood.tscn")


static func _build_river(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 100
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("River", ts, cols, rows)
	var root: Node2D = m["root"]
	var grass: TileMapLayer = m["grass"]
	var water: TileMapLayer = m["water"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	var roads: Array[Array] = [
		[Vector2(0, 33), Vector2(28, 33), 1.5], [Vector2(28, 33), Vector2(48, 46), 1.5],
		[Vector2(48, 46), Vector2(74, 22), 1.5], [Vector2(74, 22), Vector2(99, 30), 1.5],
		[Vector2(48, 46), Vector2(78, 50), 1.3],
	]
	for p: Array in roads:
		MapBuilderHelper.carve_road(grid, cols, rows, p[0], p[1], p[2])
	for ny: int in range(0, 37, 3):
		MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(56, ny), 2.5, 2.2)
	for wx: int in range(0, cols, 3):
		MapBuilderHelper.paint_water_ellipse(water, grid, cols, rows, Vector2(wx, 37.5), 2.5, 2.2)
	MapBuilderHelper.clear_water_rect(water, 54, 34, 62, 41)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1600, 992, 96, "big", "tall", [
		Rect2(0, 470, 90, 110), Rect2(1510, 430, 90, 110)
	])
	var wm: Node2D = (buildings["windmill"] as PackedScene).instantiate() as Node2D
	wm.name = "RiverWindmill"
	wm.position = Vector2(1180, 175)
	ysorted.add_child(wm)
	wm.owner = root

	MapBuilderHelper.add_prop(ysorted, root, "RiverGoblinFort", "res://assets/art/goblin/goblin_fortress.png", Vector2(1390, 155), Vector2(150, 48))
	MapBuilderHelper.add_shrine(ysorted, root, Vector2(780, 720))
	MapBuilderHelper.add_fishing_spot(root, "RiverFish", Vector2(740, 625))
	MapBuilderHelper.add_npc(ysorted, root, "PakTeguh", "npc_teguh_name", "res://assets/art/npc/npc_joko.png", "res://data/dialogues/teguh_greet.tres", Vector2(790, 790), "down", 14.0)
	MapBuilderHelper.add_chest(ysorted, root, "RiverChest1", &"rv_1", &"hi_potion", 1, 90, Vector2(1200, 215))
	MapBuilderHelper.add_chest(ysorted, root, "RiverChest2", &"rv_2", &"ether", 2, 70, Vector2(1420, 860))

	MapBuilderHelper.add_enemy(ysorted, root, "BossGSnake", "gsnake", Vector2(960, 420))
	MapBuilderHelper.add_enemy(ysorted, root, "FrogRv1", "frog", Vector2(560, 640))
	MapBuilderHelper.add_enemy(ysorted, root, "BeeRv1", "bee", Vector2(1020, 250))
	MapBuilderHelper.add_enemy(ysorted, root, "PlantRv1", "plant", Vector2(1280, 300))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1600, 32), Rect2(-16, 0, 32, 480), Rect2(-16, 560, 32, 432),
		Rect2(1584, 0, 32, 440), Rect2(1584, 520, 32, 472), Rect2(0, 976, 1600, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(120, 520))
	MapBuilderHelper.add_spawn(spawns, root, "FromForest", &"from_forest", Vector2(62, 520))
	MapBuilderHelper.add_spawn(spawns, root, "FromSwamp", &"from_swamp", Vector2(1536, 480))
	MapBuilderHelper.add_portal(root, "ToForest", Vector2(14, 520), "res://maps/forest.tscn", &"from_river", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToSwamp", Vector2(1586, 480), "res://maps/swamp.tscn", &"from_river", Vector2(22, 56))
	MapBuilderHelper.save_scene(root, "res://maps/river.tscn")


static func _build_road(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 56
	var rows: int = 80
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Road", ts, cols, rows)
	var root: Node2D = m["root"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_road(grid, cols, rows, Vector2(28, 79), Vector2(27, 50), 1.8)
	MapBuilderHelper.carve_road(grid, cols, rows, Vector2(27, 50), Vector2(29, 25), 1.8)
	MapBuilderHelper.carve_road(grid, cols, rows, Vector2(29, 25), Vector2(28, 6), 1.8)
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(28, 41), 5.0, 4.0)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 896, 1280, 96, "big", "tall", [Rect2(390, 1180, 116, 100)])
	var ft: Node2D = (buildings["fountain"] as PackedScene).instantiate() as Node2D
	ft.name = "RoadFountain"
	ft.position = Vector2(448, 620)
	ysorted.add_child(ft)
	ft.owner = root

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(448, 695))
	MapBuilderHelper.add_npc(ysorted, root, "KusirKafilah", "npc_kafilah_name", "res://assets/art/npc/npc_darma.png", "res://data/dialogues/kafilah_greet.tres", Vector2(400, 680), "down")
	MapBuilderHelper.add_chest(ysorted, root, "RoadChest1", &"road_c1", &"hi_potion", 1, 60, Vector2(360, 420))
	MapBuilderHelper.add_chest(ysorted, root, "RoadChest2", &"road_c2", &"ether", 2, 50, Vector2(540, 220))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitRoad", "rabbit", Vector2(360, 880))

	MapBuilderHelper.add_enemy(ysorted, root, "BoarRd1", "boar", Vector2(320, 920))
	MapBuilderHelper.add_enemy(ysorted, root, "BeeRd1", "bee", Vector2(580, 820))
	MapBuilderHelper.add_enemy(ysorted, root, "SlaverRd1", "slaver", Vector2(450, 320))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 408, 32), Rect2(488, -16, 408, 32),
		Rect2(-16, 0, 32, 1280), Rect2(880, 0, 32, 1280),
		Rect2(0, 1264, 408, 32), Rect2(488, 1264, 408, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(448, 1120))
	MapBuilderHelper.add_spawn(spawns, root, "FromLake", &"from_lake", Vector2(448, 1216))
	MapBuilderHelper.add_spawn(spawns, root, "FromKGate", &"from_kgate", Vector2(448, 62))
	MapBuilderHelper.add_portal(root, "ToLake", Vector2(448, 1266), "res://maps/lake.tscn", &"from_road")
	MapBuilderHelper.add_portal(root, "ToKGate", Vector2(448, 14), "res://maps/kgate.tscn", &"from_road")
	MapBuilderHelper.save_scene(root, "res://maps/road.tscn")
