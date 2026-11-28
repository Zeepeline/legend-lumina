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
		Rect2(0, 0, 284, 12), Rect2(356, 0, 284, 12),
		Rect2(0, 0, 12, 480), Rect2(628, 0, 12, 480), Rect2(0, 468, 640, 12),
	])
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(320, 62))
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(320, 125))
	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(320, 14), "res://maps/village.tscn", &"from_glade")
	MapBuilderHelper.populate_nature_and_deco(m, &"training_glade", &"forest")
	MapBuilderHelper.save_scene(root, "res://maps/training_glade.tscn")


static func _build_forest(ts: TileSet) -> void:
	var cols: int = 80
	var rows: int = 75
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Forest", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"forest", &"forest", false,
		[[Vector2(32, 0), Vector2(40, 8), 1.8]],
		[Rect2i(22, 32, 8, 12), Rect2i(2, 42, 8, 8)]
	)

	# Markas Goblin + palisade
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
	MapBuilderHelper.add_scaled_prop(ysorted, root, "ForestPalisadeW", "res://assets/art/props/gpt_palisade_wall_long.png", Vector2(842, 322), 0.52, Vector2(64, 18))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "ForestPalisadeB", "res://assets/art/props/gpt_palisade_barricade.png", Vector2(1015, 385), 0.52, Vector2(36, 16))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(640, 1065))
	MapBuilderHelper.add_fishing_spot(root, "ForestFish", Vector2(215, 600))
	MapBuilderHelper.add_npc(ysorted, root, "PemburuRaka", "npc_hunter_name", "res://assets/art/npc/npc_mc_hunter.png", "res://data/dialogues/hunter_greet.tres", Vector2(540, 115), "down")
	MapBuilderHelper.add_chest(ysorted, root, "ForestChest1", &"forest_c1", &"hi_potion", 1, 45, Vector2(1060, 320))
	MapBuilderHelper.add_chest(ysorted, root, "ForestChest2", &"forest_c2", &"iron_sword", 1, 0, Vector2(210, 820))
	MapBuilderHelper.add_chest(ysorted, root, "ForestChest3", &"forest_c3", &"ether", 2, 30, Vector2(676, 165))
	MapBuilderHelper.add_animal(ysorted, root, "DeerForest", "deer", Vector2(490, 440))
	MapBuilderHelper.add_animal(ysorted, root, "DeerForest2", "deer", Vector2(360, 880))
	MapBuilderHelper.add_animal(ysorted, root, "OwlForest", "owl", Vector2(540, 250))
	MapBuilderHelper.add_animal(ysorted, root, "SquirrelForest1", "squirrel", Vector2(720, 560))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitForest1", "rabbit", Vector2(420, 175))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitForest2", "rabbit", Vector2(820, 920))

	MapBuilderHelper.add_enemy(ysorted, root, "BossGoblinChief", "gchief", Vector2(1010, 320))
	MapBuilderHelper.add_enemy(ysorted, root, "BossSlaverCapt", "slaver_captain", Vector2(290, 645))
	MapBuilderHelper.add_enemy(ysorted, root, "Slaver1", "slaver", Vector2(245, 665))
	MapBuilderHelper.add_enemy(ysorted, root, "Slaver2", "slaver", Vector2(335, 685))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarF1", "boar", Vector2(490, 230))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarF2", "boar", Vector2(760, 460))
	MapBuilderHelper.add_enemy(ysorted, root, "BatF1", "bat", Vector2(440, 390))
	MapBuilderHelper.add_enemy(ysorted, root, "BatF2", "bat", Vector2(680, 740))
	MapBuilderHelper.add_enemy(ysorted, root, "ShroomF1", "shroom", Vector2(205, 760))
	MapBuilderHelper.add_enemy(ysorted, root, "ShroomF2", "shroom", Vector2(480, 960))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeF1", "snake", Vector2(960, 830))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeF2", "snake", Vector2(1080, 580))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarF3", "boar", Vector2(860, 1020))

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(512, 120))
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(512, 62))
	MapBuilderHelper.add_spawn(spawns, root, "FromDeepwood", &"from_deepwood", Vector2(62, 730))
	MapBuilderHelper.add_spawn(spawns, root, "FromRiver", &"from_river", Vector2(1216, 530))
	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(512, 14), "res://maps/village.tscn", &"from_forest")
	MapBuilderHelper.add_portal(root, "ToDeepwood", Vector2(14, 730), "res://maps/deepwood.tscn", &"from_forest", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToRiver", Vector2(1266, 530), "res://maps/river.tscn", &"from_forest", Vector2(22, 56))

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"forest", 1280, 1200, 88, "tall_dark", "big_dark")
	MapBuilderHelper.populate_nature_and_deco(m, &"forest", &"forest", [Vector2(640, 1065)], [Rect2(830, 130, 410, 275)])
	MapBuilderHelper.add_open_borders(root, &"forest")
	MapBuilderHelper.save_scene(root, "res://maps/forest.tscn")


static func _build_meadow(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 90
	var rows: int = 65
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Meadow", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"meadow", &"meadow", false,
		[[Vector2(0, 36), Vector2(14, 22), 1.8]],
		[Rect2i(42, 24, 10, 11)]
	)

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

	MapBuilderHelper.add_scaled_prop(ysorted, root, "MeadowDock", "res://assets/art/ground/deco_water_dock.png", Vector2(640, 818), 0.72, Vector2(56, 22))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "MeadowBoat", "res://assets/art/ground/deco_water_boat.png", Vector2(700, 785), 0.65, Vector2(40, 18))
	MapBuilderHelper.add_prop(ysorted, root, "MeadowBench", "res://assets/art/props/bench.png", Vector2(280, 845), Vector2(40, 10))
	MapBuilderHelper.add_prop(ysorted, root, "CaveEntrance", "res://assets/art/buildings/sp_b_shrine.png", Vector2(1200, 180), Vector2(76, 22))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(460, 425))
	MapBuilderHelper.add_npc(ysorted, root, "PakJoko", "npc_joko_name", "res://assets/art/npc/npc_mc_joko.png", "res://data/dialogues/joko_greet.tres", Vector2(340, 290), "down", 20.0)
	MapBuilderHelper.add_npc(ysorted, root, "Wati", "npc_wati_name", "res://assets/art/npc/npc_mc_wati.png", "res://data/dialogues/wati_greet.tres", Vector2(185, 290), "down", 18.0)
	MapBuilderHelper.add_npc(ysorted, root, "Darma", "npc_darma_name", "res://assets/art/npc/npc_mc_darma.png", "res://data/dialogues/darma_greet.tres", Vector2(520, 290), "left")
	var shop_items: Array[StringName] = [&"potion", &"hi_potion", &"ether", &"honey", &"leather_vest"]
	MapBuilderHelper.add_npc(ysorted, root, "PedagangBayu", "npc_bayu_name", "res://assets/art/npc/npc_mc_bayu.png", "res://data/dialogues/bayu_greet.tres", Vector2(248, 372), "down", 0.0, &"meadow_shop", "ui_shop_meadow", shop_items)

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

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(340, 340))
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(62, 586))
	MapBuilderHelper.add_spawn(spawns, root, "FromCave", &"from_cave", Vector2(1200, 224))
	MapBuilderHelper.add_spawn(spawns, root, "FromSnow", &"from_snow", Vector2(600, 62))
	MapBuilderHelper.add_spawn(spawns, root, "FromSwamp", &"from_swamp", Vector2(1000, 978))

	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(14, 586), "res://maps/village.tscn", &"from_meadow", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToCave", Vector2(1200, 192), "res://maps/cave.tscn", &"from_meadow", Vector2(44, 24))
	MapBuilderHelper.add_portal(root, "ToSnow", Vector2(600, 14), "res://maps/snow.tscn", &"from_meadow")
	MapBuilderHelper.add_portal(root, "ToSwamp", Vector2(1000, 1026), "res://maps/swamp.tscn", &"from_meadow")

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"meadow", 1440, 1040, 92, "big", "tall", [Rect2(950, 960, 110, 80)])
	MapBuilderHelper.populate_nature_and_deco(m, &"meadow", &"meadow")
	MapBuilderHelper.add_open_borders(root, &"meadow")
	MapBuilderHelper.save_scene(root, "res://maps/meadow.tscn")


static func _build_lake(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 88
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Lake", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"lake", &"lake", false,
		[[Vector2(87, 31), Vector2(62, 31), 1.6]],
		[Rect2i(50, 26, 8, 8)]
	)

	var house_lake: Node2D = (buildings["house_c"] as PackedScene).instantiate() as Node2D
	house_lake.name = "HouseLake"
	house_lake.position = Vector2(1120, 300)
	ysorted.add_child(house_lake)
	house_lake.owner = root

	MapBuilderHelper.add_scaled_prop(ysorted, root, "LakeDock", "res://assets/art/ground/deco_water_dock.png", Vector2(960, 505), 0.72, Vector2(54, 20))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "LakePier", "res://assets/art/ground/deco_water_pier.png", Vector2(820, 495), 0.68, Vector2(0, 0), -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "LakeBoat", "res://assets/art/ground/deco_water_boat.png", Vector2(905, 455), 0.65, Vector2(40, 18))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "Lotus1", "res://assets/art/ground/deco_water_lotus.png", Vector2(745, 515), 0.55, Vector2.ZERO, -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "Lilypad1", "res://assets/art/ground/deco_water_lilypad.png", Vector2(455, 345), 0.55, Vector2.ZERO, -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "Reeds1", "res://assets/art/ground/deco_water_reeds_lush.png", Vector2(855, 560), 0.62, Vector2.ZERO, -2)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "RockClusterL", "res://assets/art/ground/deco_water_rock_cluster.png", Vector2(210, 420), 0.65, Vector2(36, 18))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(1035, 465))
	MapBuilderHelper.add_fishing_spot(root, "LakeFish", Vector2(880, 495))
	MapBuilderHelper.add_npc(ysorted, root, "PakGun", "npc_gun_name", "res://assets/art/npc/npc_gun.png", "res://data/dialogues/gun_greet.tres", Vector2(930, 175), "left")
	MapBuilderHelper.add_npc(ysorted, root, "NenekRatih", "npc_ratih_name", "res://assets/art/npc/npc_ratih.png", "res://data/dialogues/ratih_greet.tres", Vector2(1045, 560), "left")
	MapBuilderHelper.add_animal(ysorted, root, "DuckLake", "duck", Vector2(980, 620))

	MapBuilderHelper.add_enemy(ysorted, root, "FrogL1", "frog", Vector2(300, 740))
	MapBuilderHelper.add_enemy(ysorted, root, "WispL1", "wisp", Vector2(240, 800))
	MapBuilderHelper.add_enemy(ysorted, root, "WispL2", "wisp", Vector2(900, 240))
	MapBuilderHelper.add_enemy(ysorted, root, "FrogL2", "frog", Vector2(1180, 820))

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(1120, 500))
	MapBuilderHelper.add_spawn(spawns, root, "FromVillage", &"from_village", Vector2(1348, 500))
	MapBuilderHelper.add_spawn(spawns, root, "FromRoad", &"from_road", Vector2(820, 64))
	MapBuilderHelper.add_spawn(spawns, root, "FromTemple", &"from_temple", Vector2(980, 520))

	MapBuilderHelper.add_portal(root, "ToVillage", Vector2(1394, 500), "res://maps/village.tscn", &"from_lake", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToRoad", Vector2(820, 14), "res://maps/road.tscn", &"from_lake")
	MapBuilderHelper.add_portal(root, "ToTemple", Vector2(945, 500), "res://maps/interiors/temple.tscn", &"default", Vector2(28, 28))

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"lake", 1408, 992, 92, "big", "tall_dark")
	MapBuilderHelper.populate_nature_and_deco(m, &"lake", &"lake")
	MapBuilderHelper.add_open_borders(root, &"lake")
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
		[Vector2(39, 19), Vector2(56, 29), 2.2], [Vector2(56, 29), Vector2(54, 49), 1.9],
	]
	for p: Array in paths:
		MapBuilderHelper.carve_road(grid, cols, rows, p[0], p[1], p[2])
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	var rock_tex: Texture2D = MapBuilderHelper.load_res("res://assets/art/ground/deco_sprout_objs.png") as Texture2D
	for cpos: Vector2 in [
		Vector2(140, 690), Vector2(410, 620), Vector2(300, 350), Vector2(610, 230), Vector2(890, 380)
	]:
		MapBuilderHelper.add_atlas_prop(ysorted, root, "CaveRock", rock_tex, Rect2(128, 18, 16, 12), 2.0, cpos, Vector2(24, 10))
		var lt: PointLight2D = PointLight2D.new()
		lt.name = "CrystalLight_%d" % int(cpos.x)
		lt.position = cpos
		lt.color = Color(0.45, 0.85, 1.0)
		lt.energy = 0.85
		lt.texture_scale = 1.6
		var g: Gradient = Gradient.new()
		g.colors = PackedColorArray([Color(0.5, 0.9, 1.0, 1.0), Color(0.2, 0.6, 0.9, 0.0)])
		g.offsets = PackedFloat32Array([0.0, 1.0])
		var gtex: GradientTexture2D = GradientTexture2D.new()
		gtex.width = 96
		gtex.height = 96
		gtex.fill = GradientTexture2D.FILL_RADIAL
		gtex.fill_from = Vector2(0.5, 0.5)
		gtex.fill_to = Vector2(1.0, 0.5)
		gtex.gradient = g
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
		Rect2(0, 0, 1120, 12), Rect2(0, 0, 12, 928), Rect2(1108, 0, 12, 928),
		Rect2(0, 916, 80, 12), Rect2(160, 916, 960, 12),
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
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"swamp", &"swamp", false,
		[[Vector2(0, 30), Vector2(18, 30), 1.6]],
		[Rect2i(14, 26, 12, 10), Rect2i(26, 20, 16, 10), Rect2i(34, 0, 12, 14), Rect2i(36, 46, 10, 12)]
	)

	MapBuilderHelper.add_scaled_prop(ysorted, root, "SwampLotus", "res://assets/art/ground/deco_water_lotus.png", Vector2(660, 480), 0.65, Vector2.ZERO, -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "SwampReeds1", "res://assets/art/ground/deco_reeds.png", Vector2(465, 360), 0.72, Vector2.ZERO, -2)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "SwampMush1", "res://assets/art/ground/deco_mushroom.png", Vector2(540, 310), 1.0, Vector2.ZERO, -2)
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

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(640, 120))
	MapBuilderHelper.add_spawn(spawns, root, "FromMeadow", &"from_meadow", Vector2(640, 62))
	MapBuilderHelper.add_spawn(spawns, root, "FromRiver", &"from_river", Vector2(62, 480))
	MapBuilderHelper.add_portal(root, "ToMeadow", Vector2(640, 14), "res://maps/meadow.tscn", &"from_swamp")
	MapBuilderHelper.add_portal(root, "ToRiver", Vector2(14, 480), "res://maps/river.tscn", &"from_swamp", Vector2(22, 56))

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"swamp", 1280, 960, 88, "swamp", "big_dark", [Rect2(580, 0, 120, 70)])
	MapBuilderHelper.populate_nature_and_deco(m, &"swamp", &"swamp")
	MapBuilderHelper.add_open_borders(root, &"swamp")
	MapBuilderHelper.save_scene(root, "res://maps/swamp.tscn")


static func _build_snow(ts: TileSet) -> void:
	var cols: int = 80
	var rows: int = 75
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Snow", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"snow", &"snow", false,
		[[Vector2(40, 74), Vector2(36, 56), 1.7], [Vector2(36, 56), Vector2(40, 20), 1.6]],
		[Rect2i(32, 26, 16, 12), Rect2i(32, 48, 16, 12), Rect2i(34, 62, 14, 13)]
	)

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

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(640, 1080))
	MapBuilderHelper.add_spawn(spawns, root, "FromMeadow", &"from_meadow", Vector2(640, 1136))
	MapBuilderHelper.add_portal(root, "ToMeadow", Vector2(640, 1186), "res://maps/meadow.tscn", &"from_snow")

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"snow", 1280, 1200, 92, "snow", "snow_tall")
	MapBuilderHelper.populate_nature_and_deco(m, &"snow", &"snow")
	MapBuilderHelper.add_open_borders(root, &"snow")
	MapBuilderHelper.save_scene(root, "res://maps/snow.tscn")


static func _build_deepwood(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 150
	var rows: int = 112
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Deepwood", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"deepwood", &"deepwood", false,
		[[Vector2(149, 25), Vector2(138, 44), 2.0]],
		[Rect2i(70, 38, 22, 22), Rect2i(136, 22, 14, 26)]
	)

	var ruin: Node2D = (buildings["shrine_ruin"] as PackedScene).instantiate() as Node2D
	ruin.name = "AurelRuin"
	ruin.position = Vector2(560, 310)
	ysorted.add_child(ruin)
	ruin.owner = root

	MapBuilderHelper.add_prop(ysorted, root, "DwGoblinFort", "res://assets/art/goblin/goblin_fortress.png", Vector2(440, 1340), Vector2(150, 48))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwOrcGate", "res://assets/art/buildings/gpt_orc_gate.png", Vector2(540, 1500), 0.72, Vector2(96, 24))
	MapBuilderHelper.add_prop(ysorted, root, "DwGoblinShrine", "res://assets/art/goblin/goblin_shrine.png", Vector2(610, 1385), Vector2(48, 22))
	MapBuilderHelper.add_prop(ysorted, root, "DwGoblinTower", "res://assets/art/goblin/goblin_tower.png", Vector2(360, 1420), Vector2(30, 18))
	MapBuilderHelper.add_prop(ysorted, root, "DwGoblinHut", "res://assets/art/goblin/goblin_hut.png", Vector2(640, 1445), Vector2(56, 24))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwPalisadeBanner", "res://assets/art/props/gpt_palisade_post_banner.png", Vector2(420, 1505), 0.50, Vector2(32, 16))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwMoss1", "res://assets/art/nature/deepwood_moss_island_1.png", Vector2(680, 430), 1.0, Vector2.ZERO, -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwMoss2", "res://assets/art/nature/deepwood_moss_island_2.png", Vector2(1740, 1280), 1.0, Vector2.ZERO, -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwMoss3", "res://assets/art/nature/deepwood_moss_island_1.png", Vector2(1420, 620), 1.0, Vector2.ZERO, -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwMoss4", "res://assets/art/nature/deepwood_moss_island_2.png", Vector2(960, 1040), 1.0, Vector2.ZERO, -5)

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(560, 375))
	MapBuilderHelper.add_npc(ysorted, root, "Sambo", "npc_sambo_name", "res://assets/art/npc/npc_mc_darma.png", "res://data/dialogues/sambo_greet.tres", Vector2(1310, 810), "down")
	# Micro-landmark: Perkemahan Penjelajah Sambo (obor, jamur, semak ungu)
	MapBuilderHelper.add_prop(ysorted, root, "DwCampTorch", "res://assets/art/goblin/goblin_torch.png", Vector2(1272, 798), Vector2(10, 8))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwCampShroom", "res://assets/art/nature/clutter_mushrooms.png", Vector2(1352, 822), 1.1, Vector2.ZERO, -4)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwCampBushP", "res://assets/art/nature/bushP.png", Vector2(1258, 836), 0.75, Vector2(18, 8))
	# Lorong rahasia & peti tersembunyi di celah utara (ala Secret Woods)
	MapBuilderHelper.add_chest(ysorted, root, "DwSecretChest", &"dw_secret", &"hi_potion", 2, 180, Vector2(1460, 215))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwSecretBush1", "res://assets/art/nature/bushP.png", Vector2(1425, 225), 0.72, Vector2(18, 8))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwSecretBush2", "res://assets/art/nature/bushP.png", Vector2(1495, 225), 0.72, Vector2(18, 8))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "DwSecretShroom", "res://assets/art/nature/clutter_mushrooms.png", Vector2(1460, 244), 1.2, Vector2.ZERO, -4)
	MapBuilderHelper.add_chest(ysorted, root, "DwChest1", &"dw_c1", &"crystal_sword", 1, 120, Vector2(560, 420))
	MapBuilderHelper.add_chest(ysorted, root, "DwChest2", &"dw_c2", &"iron_chainmail", 1, 0, Vector2(1940, 1390))
	MapBuilderHelper.add_chest(ysorted, root, "DwChest3", &"dw_c3", &"hi_potion", 2, 100, Vector2(340, 1510))
	MapBuilderHelper.add_animal(ysorted, root, "SquirrelDw", "squirrel", Vector2(2040, 460))
	MapBuilderHelper.add_animal(ysorted, root, "SquirrelDw2", "squirrel", Vector2(1140, 480))
	MapBuilderHelper.add_animal(ysorted, root, "OwlDw1", "owl", Vector2(1620, 420))
	MapBuilderHelper.add_animal(ysorted, root, "OwlDw2", "owl", Vector2(880, 760))
	MapBuilderHelper.add_animal(ysorted, root, "DeerDw1", "deer", Vector2(1760, 740))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitDw1", "rabbit", Vector2(1480, 1180))
	MapBuilderHelper.add_animal(ysorted, root, "OwlDw3", "owl", Vector2(460, 880))

	MapBuilderHelper.add_enemy(ysorted, root, "BossGKing", "gking", Vector2(520, 1410))
	MapBuilderHelper.add_enemy(ysorted, root, "BossSQueen", "squeen", Vector2(1820, 1340))
	MapBuilderHelper.add_enemy(ysorted, root, "GhostDw1", "ghost", Vector2(640, 410))
	MapBuilderHelper.add_enemy(ysorted, root, "GhostDw2", "ghost", Vector2(1180, 620))
	MapBuilderHelper.add_enemy(ysorted, root, "GhostDw3", "ghost", Vector2(920, 320))
	MapBuilderHelper.add_enemy(ysorted, root, "GolemDw1", "golem", Vector2(820, 470))
	MapBuilderHelper.add_enemy(ysorted, root, "GolemDw2", "golem", Vector2(1460, 1360))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarDw1", "boar", Vector2(1880, 430))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarDw2", "boar", Vector2(1540, 960))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarDw3", "boar", Vector2(2120, 680))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeDw1", "snake", Vector2(1060, 1180))
	MapBuilderHelper.add_enemy(ysorted, root, "SnakeDw2", "snake", Vector2(1980, 1020))
	MapBuilderHelper.add_enemy(ysorted, root, "ShroomDw1", "shroom", Vector2(1320, 440))
	MapBuilderHelper.add_enemy(ysorted, root, "ShroomDw2", "shroom", Vector2(760, 980))
	MapBuilderHelper.add_enemy(ysorted, root, "BatDw1", "bat", Vector2(1680, 560))
	MapBuilderHelper.add_enemy(ysorted, root, "BatDw2", "bat", Vector2(1240, 1060))
	MapBuilderHelper.add_enemy(ysorted, root, "BatDw3", "bat", Vector2(520, 1140))

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(2260, 402))
	MapBuilderHelper.add_spawn(spawns, root, "FromForest", &"from_forest", Vector2(2330, 402))
	MapBuilderHelper.add_portal(root, "ToForest", Vector2(2386, 402), "res://maps/forest.tscn", &"from_deepwood", Vector2(22, 56))

	# Koridor Choke & Release: dinding pohon raksasa mengapit Gerbang Rimba Timur & lorong rahasia utara
	var choke_trees: Array[Array] = [
		[Vector2(2280, 305), "giant"], [Vector2(2205, 312), "tall_dark"], [Vector2(2130, 302), "giant"],
		[Vector2(2285, 502), "giant"], [Vector2(2210, 496), "tall_dark"], [Vector2(2135, 508), "giant"],
		[Vector2(1405, 275), "giant"], [Vector2(1515, 275), "giant"], [Vector2(1460, 145), "giant"],
		[Vector2(1040, 1290), "giant"], [Vector2(1090, 1380), "tall_dark"], [Vector2(1135, 1465), "giant"],
	]
	for ci: int in choke_trees.size():
		var ct: Array = choke_trees[ci]
		MapBuilderHelper.add_tree(ysorted, root, "DwChokeTree_%d" % ci, ct[0] as Vector2, str(ct[1]))

	var atmo: DeepwoodAtmosphere = DeepwoodAtmosphere.new()
	atmo.name = "DeepwoodAtmosphere"
	root.add_child(atmo)
	atmo.owner = root

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"deepwood", 2400, 1792, 68, "tall_dark", "giant")
	MapBuilderHelper.populate_nature_and_deco(
		m, &"deepwood", &"deepwood",
		[Vector2(560, 375), Vector2(1310, 810), Vector2(1460, 215), Vector2(1820, 1340)],
		[Rect2(320, 1280, 360, 260), Rect2(1410, 175, 100, 90)]
	)
	MapBuilderHelper.add_open_borders(root, &"deepwood")
	MapBuilderHelper.save_scene(root, "res://maps/deepwood.tscn")


static func _build_river(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 162
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("River", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"river", &"river", false,
		[[Vector2(0, 33), Vector2(16, 33), 1.6]],
		[Rect2i(48, 22, 16, 26), Rect2i(84, 18, 18, 28), Rect2i(124, 22, 14, 26)]
	)

	var wm: Node2D = (buildings["windmill"] as PackedScene).instantiate() as Node2D
	wm.name = "RiverWindmill"
	wm.position = Vector2(1820, 185)
	ysorted.add_child(wm)
	wm.owner = root

	MapBuilderHelper.add_prop(ysorted, root, "RiverGoblinFort", "res://assets/art/goblin/goblin_fortress.png", Vector2(2260, 165), Vector2(150, 48))
	MapBuilderHelper.add_prop(ysorted, root, "RiverGoblinHut", "res://assets/art/goblin/goblin_hut.png", Vector2(2120, 215), Vector2(56, 24))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "RiverPier", "res://assets/art/ground/deco_water_pier.png", Vector2(1060, 560), 0.72, Vector2(0, 0), -5)
	MapBuilderHelper.add_scaled_prop(ysorted, root, "RiverRockCluster", "res://assets/art/ground/deco_water_rock_cluster.png", Vector2(880, 565), 0.65, Vector2(36, 18))
	MapBuilderHelper.add_shrine(ysorted, root, Vector2(1180, 725))
	MapBuilderHelper.add_fishing_spot(root, "RiverFish", Vector2(1060, 625))
	MapBuilderHelper.add_npc(ysorted, root, "PakTeguh", "npc_teguh_name", "res://assets/art/npc/npc_mc_joko.png", "res://data/dialogues/teguh_greet.tres", Vector2(1240, 770), "down", 14.0)
	MapBuilderHelper.add_chest(ysorted, root, "RiverChest1", &"rv_1", &"hi_potion", 1, 90, Vector2(1840, 225))
	MapBuilderHelper.add_chest(ysorted, root, "RiverChest2", &"rv_2", &"ether", 2, 70, Vector2(2280, 860))

	MapBuilderHelper.add_enemy(ysorted, root, "BossGSnake", "gsnake", Vector2(1620, 420))
	MapBuilderHelper.add_enemy(ysorted, root, "FrogRv1", "frog", Vector2(560, 640))
	MapBuilderHelper.add_enemy(ysorted, root, "FrogRv2", "frog", Vector2(1380, 660))
	MapBuilderHelper.add_enemy(ysorted, root, "BeeRv1", "bee", Vector2(920, 250))
	MapBuilderHelper.add_enemy(ysorted, root, "BeeRv2", "bee", Vector2(1980, 260))
	MapBuilderHelper.add_enemy(ysorted, root, "PlantRv1", "plant", Vector2(2140, 360))

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(120, 530))
	MapBuilderHelper.add_spawn(spawns, root, "FromForest", &"from_forest", Vector2(62, 530))
	MapBuilderHelper.add_spawn(spawns, root, "FromSwamp", &"from_swamp", Vector2(2526, 480))
	MapBuilderHelper.add_portal(root, "ToForest", Vector2(14, 530), "res://maps/forest.tscn", &"from_river", Vector2(22, 56))
	MapBuilderHelper.add_portal(root, "ToSwamp", Vector2(2578, 480), "res://maps/swamp.tscn", &"from_river", Vector2(22, 56))

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"river", 2592, 992, 92, "big", "tall")
	MapBuilderHelper.populate_nature_and_deco(m, &"river", &"river", [Vector2(1180, 725)])
	MapBuilderHelper.add_open_borders(root, &"river")
	MapBuilderHelper.save_scene(root, "res://maps/river.tscn")


static func _build_road(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 56
	var rows: int = 125
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Road", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"road", &"road", false,
		[[Vector2(28, 124), Vector2(28, 114), 1.8], [Vector2(28, 10), Vector2(28, 0), 1.8]]
	)

	var ft: Node2D = (buildings["fountain"] as PackedScene).instantiate() as Node2D
	ft.name = "RoadFountain"
	ft.position = Vector2(448, 1120)
	ysorted.add_child(ft)
	ft.owner = root

	MapBuilderHelper.add_prop(ysorted, root, "RoadGoblinWagon", "res://assets/art/goblin/goblin_wagon.png", Vector2(315, 575), Vector2(36, 14))
	MapBuilderHelper.add_prop(ysorted, root, "RoadGoblinHut", "res://assets/art/goblin/goblin_hut.png", Vector2(265, 535), Vector2(56, 24))
	MapBuilderHelper.add_prop(ysorted, root, "RoadGoblinTorch", "res://assets/art/goblin/goblin_torch.png", Vector2(345, 608), Vector2(10, 8))
	MapBuilderHelper.add_scaled_prop(ysorted, root, "RoadPalisadeBarricade", "res://assets/art/props/gpt_palisade_barricade.png", Vector2(360, 625), 0.52, Vector2(36, 14))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(448, 1205))
	MapBuilderHelper.add_npc(ysorted, root, "KusirKafilah", "npc_kafilah_name", "res://assets/art/npc/npc_mc_darma.png", "res://data/dialogues/kafilah_greet.tres", Vector2(395, 1185), "down")
	MapBuilderHelper.add_chest(ysorted, root, "RoadChest1", &"road_c1", &"hi_potion", 1, 60, Vector2(355, 560))
	MapBuilderHelper.add_chest(ysorted, root, "RoadChest2", &"road_c2", &"ether", 2, 50, Vector2(545, 230))
	MapBuilderHelper.add_animal(ysorted, root, "RabbitRoad", "rabbit", Vector2(340, 1520))

	MapBuilderHelper.add_enemy(ysorted, root, "BoarRd1", "boar", Vector2(320, 1600))
	MapBuilderHelper.add_enemy(ysorted, root, "BeeRd1", "bee", Vector2(580, 1380))
	MapBuilderHelper.add_enemy(ysorted, root, "BoarRd2", "boar", Vector2(560, 880))
	MapBuilderHelper.add_enemy(ysorted, root, "SlaverRd1", "slaver", Vector2(390, 595))
	MapBuilderHelper.add_enemy(ysorted, root, "SlaverRd2", "slaver", Vector2(490, 320))

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(448, 1820))
	MapBuilderHelper.add_spawn(spawns, root, "FromLake", &"from_lake", Vector2(448, 1936))
	MapBuilderHelper.add_spawn(spawns, root, "FromKGate", &"from_kgate", Vector2(448, 62))
	MapBuilderHelper.add_portal(root, "ToLake", Vector2(448, 1986), "res://maps/lake.tscn", &"from_road")
	MapBuilderHelper.add_portal(root, "ToKGate", Vector2(448, 14), "res://maps/kgate.tscn", &"from_road")

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"road", 896, 2000, 92, "big", "tall")
	MapBuilderHelper.populate_nature_and_deco(m, &"road", &"road", [Vector2(448, 1205)])
	MapBuilderHelper.add_open_borders(root, &"road")
	MapBuilderHelper.save_scene(root, "res://maps/road.tscn")
