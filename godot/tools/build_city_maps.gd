class_name CityMapsBuilder
extends RefCounted


static func build_all(ts: TileSet, buildings: Dictionary) -> void:
	_build_kgate(ts, buildings)
	_build_kpasar(ts, buildings)
	_build_kpermukiman(ts, buildings)
	_build_kakademi(ts, buildings)
	_build_kbawah(ts, buildings)
	_build_kinn(ts)
	_build_arsip(ts)
	_build_arena(ts)


static func _place_building(
	ysorted: Node2D,
	root: Node,
	buildings: Dictionary,
	key: String,
	node_name: String,
	pos: Vector2
) -> void:
	var inst: Node2D = (buildings[key] as PackedScene).instantiate() as Node2D
	inst.name = node_name
	inst.position = pos
	ysorted.add_child(inst)
	inst.owner = root


static func _build_kgate(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 118
	var rows: int = 56
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KGate", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(81, 55), Vector2(81, 0), 2.8)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(81, 40), Vector2(32, 40), 1.8)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(24, 15), Vector2(24, 42), 1.8)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(10, 22), Vector2(38, 22), 1.6)
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(24, 31), 11.0, 9.5)
	MapBuilderHelper.carve_ellipse(grid, cols, rows, Vector2(81, 29), 5.0, 4.0)
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1888, 896, 120, "big", "tall", [
		Rect2(1220, 0, 160, 100), Rect2(1220, 800, 160, 96), Rect2(680, 340, 1180, 120),
	])

	_place_building(ysorted, root, buildings, "gatehouse", "Gatehouse", Vector2(1300, 442))
	_place_building(ysorted, root, buildings, "citywall_l", "CityWallL", Vector2(965, 424))
	_place_building(ysorted, root, buildings, "citywall_r", "CityWallR", Vector2(1634, 424))
	_place_building(ysorted, root, buildings, "barak_bayaran", "BarakBayaran", Vector2(1000, 628))

	_place_building(ysorted, root, buildings, "gar_hall", "GarHall", Vector2(380, 222))
	_place_building(ysorted, root, buildings, "gar_barracks", "GarBarracksW", Vector2(150, 342))
	_place_building(ysorted, root, buildings, "gar_barracks2", "GarBarracksE", Vector2(612, 342))
	_place_building(ysorted, root, buildings, "gar_stable", "GarStable", Vector2(612, 190))
	_place_building(ysorted, root, buildings, "gar_pen", "GarPen", Vector2(380, 540))

	MapBuilderHelper.add_prop(ysorted, root, "GarDummyW", "res://assets/art/buildings/sp_b_gar_dummy.png", Vector2(285, 470), Vector2(18, 10))
	MapBuilderHelper.add_prop(ysorted, root, "GarDummyE", "res://assets/art/buildings/sp_b_gar_dummy.png", Vector2(475, 470), Vector2(18, 10))
	MapBuilderHelper.add_prop(ysorted, root, "GarBag", "res://assets/art/buildings/sp_b_gar_bag.png", Vector2(272, 590), Vector2(16, 10))
	MapBuilderHelper.add_prop(ysorted, root, "GarShields", "res://assets/art/buildings/sp_b_gar_shields.png", Vector2(488, 592), Vector2(18, 10))
	MapBuilderHelper.add_prop(ysorted, root, "GarTarget1", "res://assets/art/buildings/sp_b_gar_target.png", Vector2(320, 650), Vector2(20, 12))
	MapBuilderHelper.add_prop(ysorted, root, "GarTarget2", "res://assets/art/buildings/sp_b_gar_target2.png", Vector2(380, 650), Vector2(20, 12))
	MapBuilderHelper.add_prop(ysorted, root, "GarTarget3", "res://assets/art/buildings/sp_b_gar_target3.png", Vector2(440, 650), Vector2(20, 12))
	MapBuilderHelper.add_prop(ysorted, root, "GarSupply", "res://assets/art/buildings/sp_b_gar_supply.png", Vector2(150, 180), Vector2(54, 24))
	MapBuilderHelper.add_prop(ysorted, root, "GarRack", "res://assets/art/buildings/sp_b_gar_rack.png", Vector2(640, 700), Vector2(52, 20))
	MapBuilderHelper.add_prop(ysorted, root, "GarHay", "res://assets/art/buildings/sp_b_gar_hayrack.png", Vector2(170, 800), Vector2(60, 20))
	MapBuilderHelper.add_prop(ysorted, root, "GarBarricade", "res://assets/art/buildings/sp_b_gar_barricade.png", Vector2(610, 800), Vector2(60, 20))

	MapBuilderHelper.add_prop(ysorted, root, "GateLampL", "res://assets/art/props/gpt_city_lamp.png", Vector2(1230, 486), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "GateLampR", "res://assets/art/props/gpt_city_lamp.png", Vector2(1370, 486), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "GateBannerL", "res://assets/art/props/gpt_city_banner.png", Vector2(1258, 340), Vector2.ZERO)
	MapBuilderHelper.add_prop(ysorted, root, "GateBannerR", "res://assets/art/props/gpt_city_banner.png", Vector2(1342, 340), Vector2.ZERO)
	MapBuilderHelper.add_prop(ysorted, root, "GateBannerSmL", "res://assets/art/props/gpt_city_banner_sm.png", Vector2(1196, 486), Vector2(10, 6))
	MapBuilderHelper.add_prop(ysorted, root, "GateBannerSmR", "res://assets/art/props/gpt_city_banner_sm.png", Vector2(1404, 486), Vector2(10, 6))
	MapBuilderHelper.add_prop(ysorted, root, "GateBoard", "res://assets/art/props/gpt_city_board.png", Vector2(1420, 600), Vector2(28, 12))
	MapBuilderHelper.add_prop(ysorted, root, "GateFenceL", "res://assets/art/props/gpt_city_fence.png", Vector2(1210, 830), Vector2(40, 10))
	MapBuilderHelper.add_prop(ysorted, root, "GateFenceR", "res://assets/art/props/gpt_city_fence.png", Vector2(1410, 830), Vector2(40, 10))
	MapBuilderHelper.add_prop(ysorted, root, "GateCart", "res://assets/art/props/gpt_city_cart.png", Vector2(1540, 620), Vector2(32, 16))
	MapBuilderHelper.add_prop(ysorted, root, "GateFlowerW", "res://assets/art/props/gpt_city_flower_w.png", Vector2(1250, 660), Vector2.ZERO)
	MapBuilderHelper.add_prop(ysorted, root, "GateFlowerP", "res://assets/art/props/gpt_city_flower_p.png", Vector2(1350, 660), Vector2.ZERO)
	MapBuilderHelper.add_prop(ysorted, root, "GateStatueGuard", "res://assets/art/props/gpt_city_guard.png", Vector2(1200, 660), Vector2(20, 12))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(1160, 740))
	MapBuilderHelper.add_chest(ysorted, root, "KGateChest1", &"kgate_c1", &"hi_potion", 1, 70, Vector2(1460, 720))

	MapBuilderHelper.add_npc(ysorted, root, "KaptenBratasena", "npc_bratasena", "res://assets/art/npc/npc_sheet_gk1.png", "res://data/dialogues/bratasena_greet.tres", Vector2(410, 265), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PrajuritAnggara", "npc_anggara", "res://assets/art/npc/npc_sheet_gk2.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(330, 500), "down", 16.0)
	MapBuilderHelper.add_npc(ysorted, root, "PemanahRaka", "npc_raka_archer", "res://assets/art/npc/npc_sheet_gk3.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(380, 590), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PakSardi", "npc_sardi", "res://assets/art/npc/npc_sheet_gk4.png", "res://data/dialogues/citizen_greet.tres", Vector2(536, 232), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PerekrutBayaran", "npc_merc", "res://assets/art/npc/npc_sheet_merc1.png", "res://data/dialogues/merc_greet.tres", Vector2(1030, 668), "down")
	MapBuilderHelper.add_npc(ysorted, root, "BudiKurir", "npc_courier", "res://assets/art/npc/npc_sheet_courier.png", "res://data/dialogues/courier_greet.tres", Vector2(1100, 705), "down", 12.0)
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaGerbangL", "npc_guard_name", "res://assets/art/npc/npc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(1256, 492), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaGerbangR", "npc_guard_name", "res://assets/art/npc/npc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(1344, 492), "down")

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1250, 32), Rect2(1350, -16, 550, 32),
		Rect2(-16, 0, 32, 896), Rect2(1872, 0, 32, 896),
		Rect2(0, 880, 1250, 32), Rect2(1350, 880, 550, 32),
		Rect2(1204, 404, 62, 28), Rect2(1334, 404, 62, 28),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(1300, 740))
	MapBuilderHelper.add_spawn(spawns, root, "FromRoad", &"from_road", Vector2(1300, 825))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(1300, 62))
	MapBuilderHelper.add_portal(root, "ToRoad", Vector2(1300, 882), "res://maps/road.tscn", &"from_kgate")
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(1300, 14), "res://maps/kpasar.tscn", &"from_kgate")
	MapBuilderHelper.save_scene(root, "res://maps/kgate.tscn")


static func _build_kpasar(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 100
	var rows: int = 75
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KPasar", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(50, 74), Vector2(50, 0), 2.5)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(0, 38), Vector2(99, 38), 2.3)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(25, 22), Vector2(75, 22), 1.6)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(25, 56), Vector2(75, 56), 1.6)
	MapBuilderHelper.fill_cobble_rect(dirt, 38, 28, 62, 48)
	for r: int in range(28, 49):
		for c: int in range(38, 63):
			grid[r * cols + c] = false
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1600, 1200, 130, "big_dark", "tall_dark", [
		Rect2(740, 0, 120, 80), Rect2(740, 1120, 120, 80),
		Rect2(0, 560, 80, 120), Rect2(1520, 560, 80, 120),
	])

	_place_building(ysorted, root, buildings, "fountain", "PasarFountain", Vector2(800, 640))
	var stalls: Array[Array] = [
		["stall_potion", "StallPotionN", Vector2(470, 540)],
		["stall_butcher", "StallButcherN", Vector2(590, 540)],
		["stall_weapon", "StallWeaponN", Vector2(1010, 540)],
		["stall_scroll", "StallScrollN", Vector2(1130, 540)],
		["stall_food", "StallFoodS", Vector2(470, 870)],
		["stall_scroll", "StallScrollS", Vector2(590, 870)],
		["stall_potion", "StallPotionS", Vector2(1010, 870)],
		["stall_weapon", "StallWeaponS", Vector2(1130, 870)],
	]
	for st: Array in stalls:
		_place_building(ysorted, root, buildings, st[0], st[1], st[2])

	var houses: Array[Array] = [
		["city_house_2", "PasarHN1", Vector2(178, 306)], ["city_house_4", "PasarHN2", Vector2(308, 290)],
		["city_house_5", "PasarInnBldg", Vector2(556, 304)], ["city_house_3", "PasarHN4", Vector2(1044, 302)],
		["city_house_4", "PasarHN5", Vector2(1296, 290)], ["city_house_2", "PasarHN6", Vector2(1428, 308)],
		["city_house_3", "PasarHS1", Vector2(178, 1094)], ["city_house_2", "PasarHS2", Vector2(310, 1110)],
		["city_house_4", "PasarHS3", Vector2(556, 1096)], ["city_house_5", "PasarHS4", Vector2(1044, 1094)],
		["city_house_3", "PasarHS5", Vector2(1296, 1110)], ["city_house_4", "PasarHS6", Vector2(1428, 1092)],
	]
	for hs: Array in houses:
		_place_building(ysorted, root, buildings, hs[0], hs[1], hs[2])

	for lp: Vector2 in [Vector2(530, 596), Vector2(1070, 596), Vector2(480, 700), Vector2(1120, 700)]:
		MapBuilderHelper.add_prop(ysorted, root, "Lamp_%d_%d" % [int(lp.x), int(lp.y)], "res://assets/art/props/gpt_city_lamp2.png", lp, Vector2(10, 8))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(800, 470))
	MapBuilderHelper.add_chest(ysorted, root, "KPasarChest1", &"kpasar_c1", &"ether", 2, 90, Vector2(455, 1085))

	var city_market_items: Array[StringName] = [&"potion", &"hi_potion", &"ether", &"grilled_fish", &"shard"]
	var city_smith_items: Array[StringName] = [&"steel_sword", &"crystal_sword", &"iron_spear", &"battle_axe", &"iron_chainmail", &"stone_armor"]
	MapBuilderHelper.add_npc(ysorted, root, "PedagangKota", "npc_city_merchant", "res://assets/art/npc/npc_sheet_ps1.png", "res://data/dialogues/city_market_greet.tres", Vector2(700, 590), "down", 0.0, &"city_market", "ui_shop_city_market", city_market_items)
	MapBuilderHelper.add_npc(ysorted, root, "PandaiBesiKota", "npc_city_smith", "res://assets/art/npc/npc_smith.png", "res://data/dialogues/city_smith_greet.tres", Vector2(940, 590), "down", 0.0, &"city_smith", "ui_shop_city_smith", city_smith_items)
	MapBuilderHelper.add_npc(ysorted, root, "JuruLelangBastian", "npc_bastian", "res://assets/art/npc/npc_elder.png", "res://data/dialogues/bastian_greet.tres", Vector2(740, 390), "down")
	MapBuilderHelper.add_npc(ysorted, root, "WargaPasar", "npc_citizen", "res://assets/art/npc/npc_sheet_ps2.png", "res://data/dialogues/citizen_greet.tres", Vector2(660, 760), "down", 18.0)
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaPasar", "npc_guard_name", "res://assets/art/npc/npc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(1470, 645), "left")

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 756, 32), Rect2(844, -16, 756, 32),
		Rect2(-16, 0, 32, 588), Rect2(-16, 652, 32, 548),
		Rect2(1584, 0, 32, 588), Rect2(1584, 652, 32, 548),
		Rect2(0, 1184, 756, 32), Rect2(844, 1184, 756, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(800, 730))
	MapBuilderHelper.add_spawn(spawns, root, "FromKGate", &"from_kgate", Vector2(800, 1138))
	MapBuilderHelper.add_spawn(spawns, root, "FromKAkademi", &"from_kakademi", Vector2(800, 62))
	MapBuilderHelper.add_spawn(spawns, root, "FromKBawah", &"from_kbawah", Vector2(62, 620))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPermukiman", &"from_kpermukiman", Vector2(1538, 620))
	MapBuilderHelper.add_spawn(spawns, root, "FromKInn", &"from_kinn", Vector2(556, 342))

	MapBuilderHelper.add_portal(root, "ToKGate", Vector2(800, 1186), "res://maps/kgate.tscn", &"from_kpasar")
	MapBuilderHelper.add_portal(root, "ToKAkademi", Vector2(800, 14), "res://maps/kakademi.tscn", &"from_kpasar")
	MapBuilderHelper.add_portal(root, "ToKBawah", Vector2(14, 620), "res://maps/kbawah.tscn", &"from_kpasar", Vector2(22, 60))
	MapBuilderHelper.add_portal(root, "ToKPermukiman", Vector2(1586, 620), "res://maps/kpermukiman.tscn", &"from_kpasar", Vector2(22, 60))
	MapBuilderHelper.add_portal(root, "DoorKInn", Vector2(556, 312), "res://maps/interiors/kinn.tscn", &"default", Vector2(28, 16))
	MapBuilderHelper.save_scene(root, "res://maps/kpasar.tscn")


static func _build_kpermukiman(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 88
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KPermukiman", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(0, 31), Vector2(78, 31), 2.1)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(14, 52), Vector2(74, 52), 1.6)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(44, 24), Vector2(44, 52), 1.8)
	MapBuilderHelper.fill_cobble_rect(dirt, 38, 25, 50, 36)
	for r: int in range(25, 37):
		for c: int in range(38, 51):
			grid[r * cols + c] = false
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1408, 992, 120, "big", "tall", [Rect2(0, 450, 90, 120)])

	_place_building(ysorted, root, buildings, "balai_dewan", "BalaiDewan", Vector2(700, 368))
	_place_building(ysorted, root, buildings, "well", "PermSumur", Vector2(688, 514))
	var res_houses: Array[Array] = [
		["city_house_1", "PermH1", Vector2(210, 412)], ["city_house_3", "PermH2", Vector2(332, 386)],
		["city_house_2", "PermH3", Vector2(464, 404)], ["city_house_4", "PermH4", Vector2(908, 410)],
		["city_house_5", "PermH5", Vector2(1036, 384)], ["city_house_3", "PermH6", Vector2(1170, 408)],
		["city_house_4", "PermH7", Vector2(274, 766)], ["city_house_2", "PermH8", Vector2(396, 788)],
		["city_house_5", "PermH9", Vector2(524, 768)], ["city_house_1", "PermH10", Vector2(628, 774)],
		["city_house_3", "PermH11", Vector2(816, 754)], ["city_house_4", "PermH12", Vector2(950, 778)],
	]
	for rh: Array in res_houses:
		_place_building(ysorted, root, buildings, rh[0], rh[1], rh[2])

	MapBuilderHelper.add_prop(ysorted, root, "PermLamp1", "res://assets/art/props/gpt_city_lamp.png", Vector2(580, 476), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "PermLamp2", "res://assets/art/props/gpt_city_lamp.png", Vector2(820, 476), Vector2(10, 8))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(742, 634))
	MapBuilderHelper.add_chest(ysorted, root, "KPermChest1", &"kpermukiman_c1", &"hi_potion", 2, 80, Vector2(1260, 520))

	MapBuilderHelper.add_npc(ysorted, root, "PetugasDewan", "npc_dewan", "res://assets/art/npc/npc_sheet_pm1.png", "res://data/dialogues/dewan_greet.tres", Vector2(650, 395), "down")
	MapBuilderHelper.add_npc(ysorted, root, "WargaPermukiman", "npc_citizen", "res://assets/art/npc/npc_sheet_pm2.png", "res://data/dialogues/citizen_greet.tres", Vector2(420, 540), "down", 18.0)
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaPerm", "npc_guard_name", "res://assets/art/npc/npc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(160, 540), "down")

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1408, 32), Rect2(-16, 0, 32, 466), Rect2(-16, 534, 32, 458),
		Rect2(1392, 0, 32, 992), Rect2(0, 976, 1408, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(688, 560))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(62, 500))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(14, 500), "res://maps/kpasar.tscn", &"from_kpermukiman", Vector2(22, 60))
	MapBuilderHelper.save_scene(root, "res://maps/kpermukiman.tscn")


static func _build_kakademi(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 88
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KAkademi", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(44, 61), Vector2(44, 24), 2.4)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(18, 29), Vector2(70, 29), 1.6)
	MapBuilderHelper.fill_cobble_rect(dirt, 36, 44, 52, 53)
	for r: int in range(44, 54):
		for c: int in range(36, 53):
			grid[r * cols + c] = false
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1408, 992, 120, "big", "tall", [Rect2(640, 900, 120, 92)])

	_place_building(ysorted, root, buildings, "academy", "AcademyMain", Vector2(704, 380))
	_place_building(ysorted, root, buildings, "acad_dorm", "AcadDormW", Vector2(300, 380))
	_place_building(ysorted, root, buildings, "acad_dorm", "AcadDormE", Vector2(1108, 380))
	_place_building(ysorted, root, buildings, "acad_greenhouse", "AcadGreenhouse", Vector2(1214, 562))
	_place_building(ysorted, root, buildings, "acad_gate", "AcadGate", Vector2(704, 642))
	_place_building(ysorted, root, buildings, "acad_fountain", "AcadFountain", Vector2(1040, 586))

	var fx: int = 160
	while fx <= 600:
		MapBuilderHelper.add_prop(ysorted, root, "AcadFenceL_%d" % fx, "res://assets/art/buildings/sp_b_acad_fence.png", Vector2(fx, 640), Vector2(78, 14))
		fx += 81
	fx = 808
	while fx <= 1248:
		MapBuilderHelper.add_prop(ysorted, root, "AcadFenceR_%d" % fx, "res://assets/art/buildings/sp_b_acad_fence.png", Vector2(fx, 640), Vector2(78, 14))
		fx += 81

	MapBuilderHelper.add_prop(ysorted, root, "AcadLampW", "res://assets/art/buildings/sp_b_acad_lamp.png", Vector2(620, 572), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "AcadLampE", "res://assets/art/buildings/sp_b_acad_lamp.png", Vector2(788, 572), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "AcadBoard", "res://assets/art/buildings/sp_b_acad_board.png", Vector2(592, 628), Vector2(54, 16))
	MapBuilderHelper.add_prop(ysorted, root, "AcadStatue", "res://assets/art/buildings/sp_b_acad_statue.png", Vector2(900, 530), Vector2(40, 20))
	MapBuilderHelper.add_prop(ysorted, root, "AcadBench1", "res://assets/art/buildings/sp_b_acad_bench.png", Vector2(950, 600), Vector2(42, 14))
	MapBuilderHelper.add_prop(ysorted, root, "AcadBench2", "res://assets/art/buildings/sp_b_acad_bench.png", Vector2(840, 800), Vector2(42, 14))
	MapBuilderHelper.add_prop(ysorted, root, "AcadDummy1", "res://assets/art/buildings/sp_b_acad_dummy.png", Vector2(220, 520), Vector2(16, 10))
	MapBuilderHelper.add_prop(ysorted, root, "AcadDummy2", "res://assets/art/buildings/sp_b_acad_dummy.png", Vector2(320, 520), Vector2(16, 10))
	MapBuilderHelper.add_prop(ysorted, root, "AcadTarget1", "res://assets/art/buildings/sp_b_acad_target.png", Vector2(430, 500), Vector2(16, 10))
	MapBuilderHelper.add_prop(ysorted, root, "AcadRack", "res://assets/art/buildings/sp_b_acad_rack.png", Vector2(400, 600), Vector2(20, 12))
	MapBuilderHelper.add_prop(ysorted, root, "AcadCypress1", "res://assets/art/buildings/sp_b_acad_cypress.png", Vector2(880, 624), Vector2(12, 8))
	MapBuilderHelper.add_prop(ysorted, root, "AcadTopiary1", "res://assets/art/buildings/sp_b_acad_topiary.png", Vector2(980, 504), Vector2(12, 8))
	MapBuilderHelper.add_prop(ysorted, root, "AcadPotTree", "res://assets/art/buildings/sp_b_acad_pottree.png", Vector2(640, 676), Vector2(12, 8))
	MapBuilderHelper.add_prop(ysorted, root, "AcadCrates", "res://assets/art/buildings/sp_b_acad_crates.png", Vector2(500, 606), Vector2(38, 16))
	MapBuilderHelper.add_prop(ysorted, root, "AcadWallTop", "res://assets/art/buildings/sp_b_acad_wall.png", Vector2(704, 160), Vector2(72, 16))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(704, 760))
	MapBuilderHelper.add_chest(ysorted, root, "KAkademiChest1", &"kakademi_c1", &"ether", 3, 100, Vector2(1040, 665))

	MapBuilderHelper.add_npc(ysorted, root, "GuruTuaAkademi", "npc_acad_guru", "res://assets/art/npc/npc_sheet_ac1.png", "res://data/dialogues/acad_guru_greet.tres", Vector2(635, 580), "down", 0.0, &"", "", [], &"holy", 150)
	MapBuilderHelper.add_npc(ysorted, root, "MuridAkademi", "npc_acad_student", "res://assets/art/npc/npc_sheet_ac2.png", "res://data/dialogues/acad_student_greet.tres", Vector2(980, 680), "down", 18.0)
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaAkademi", "npc_guard_name", "res://assets/art/npc/npc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(640, 700), "down")

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1408, 32), Rect2(-16, 0, 32, 992), Rect2(1392, 0, 32, 992),
		Rect2(0, 976, 656, 32), Rect2(752, 976, 656, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(704, 795))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(704, 930))
	MapBuilderHelper.add_spawn(spawns, root, "FromArsip", &"from_arsip", Vector2(704, 412))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(704, 978), "res://maps/kpasar.tscn", &"from_kakademi")
	MapBuilderHelper.add_portal(root, "DoorArsip", Vector2(704, 386), "res://maps/interiors/arsip.tscn", &"default", Vector2(32, 16))
	MapBuilderHelper.save_scene(root, "res://maps/kakademi.tscn")


static func _build_kbawah(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 75
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KBawah", ts, cols, rows)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(74, 31), Vector2(14, 31), 2.0)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(44, 31), Vector2(44, 52), 1.8)
	MapBuilderHelper.carve_cobble_road(dirt, grid, cols, rows, Vector2(14, 52), Vector2(64, 52), 1.5)
	MapBuilderHelper.fill_cobble_rect(dirt, 32, 36, 48, 46)
	for r: int in range(36, 47):
		for c: int in range(32, 49):
			grid[r * cols + c] = false
	MapBuilderHelper.apply_grass_autotile(grass, grid, cols, rows)

	MapBuilderHelper.add_tree_ring(ysorted, root, 1200, 992, 120, "big_dark", "tall_dark", [Rect2(1110, 450, 90, 120)])

	_place_building(ysorted, root, buildings, "blades", "ArenaHall", Vector2(700, 668))
	var kbw_h: Array[Array] = [
		["house_b", "KbwH1", Vector2(178, 392)], ["house_c", "KbwH2", Vector2(308, 362)],
		["house_brown", "KbwH3", Vector2(436, 398)], ["house_c", "KbwH4", Vector2(588, 378)],
		["house_b", "KbwH5", Vector2(714, 354)], ["house_c", "KbwH6", Vector2(838, 388)],
		["house_c", "KbwH7", Vector2(284, 766)], ["house_b", "KbwH8", Vector2(416, 790)],
		["house_b", "KbwH9", Vector2(880, 770)], ["house_c", "KbwH10", Vector2(1010, 756)],
	]
	for kh: Array in kbw_h:
		_place_building(ysorted, root, buildings, kh[0], kh[1], kh[2])

	MapBuilderHelper.add_prop(ysorted, root, "KbwLamp1", "res://assets/art/props/gpt_city_lamp.png", Vector2(480, 558), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "KbwLamp2", "res://assets/art/props/gpt_city_lamp.png", Vector2(1040, 540), Vector2(10, 8))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(770, 690))
	MapBuilderHelper.add_chest(ysorted, root, "KBawahChest1", &"kbawah_c1", &"ore", 3, 95, Vector2(240, 700))

	var night_items: Array[StringName] = [&"hi_potion", &"ether", &"grilled_fish", &"steel_sword", &"iron_chainmail"]
	MapBuilderHelper.add_npc(ysorted, root, "GuruLestari", "npc_lestari", "res://assets/art/npc/npc_lestari.png", "res://data/dialogues/lestari_greet.tres", Vector2(560, 600), "down", 0.0, &"", "", [], &"heal", 0)
	MapBuilderHelper.add_npc(ysorted, root, "PengawasGelanggang", "npc_arena_master", "res://assets/art/npc/npc_sheet_bw1.png", "res://data/dialogues/arena_master_greet.tres", Vector2(655, 700), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PedagangMalam", "npc_night_merchant", "res://assets/art/npc/npc_merchant.png", "res://data/dialogues/night_merchant_greet.tres", Vector2(500, 640), "down", 0.0, &"night_market", "ui_shop_night", night_items)
	MapBuilderHelper.add_npc(ysorted, root, "WargaBawah", "npc_citizen", "res://assets/art/npc/npc_farmer.png", "res://data/dialogues/citizen_greet.tres", Vector2(320, 560), "down", 18.0)

	MapBuilderHelper.add_borders(root, [
		Rect2(0, -16, 1200, 32), Rect2(-16, 0, 32, 992),
		Rect2(1184, 0, 32, 466), Rect2(1184, 534, 32, 458), Rect2(0, 976, 1200, 32),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(600, 560))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(1138, 500))
	MapBuilderHelper.add_spawn(spawns, root, "FromArena", &"from_arena", Vector2(700, 712))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(1186, 500), "res://maps/kpasar.tscn", &"from_kbawah", Vector2(22, 60))
	MapBuilderHelper.add_portal(root, "DoorArena", Vector2(700, 672), "res://maps/interiors/arena.tscn", &"default", Vector2(32, 18))
	MapBuilderHelper.save_scene(root, "res://maps/kbawah.tscn")


static func _build_kinn(ts: TileSet) -> void:
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KInn", ts, 20, 16)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 1.5)
	MapBuilderHelper.fill_cobble_rect(dirt, 0, 0, 19, 15)
	dirt.modulate = Color(0.86, 0.78, 0.66)
	grass.queue_free()

	MapBuilderHelper.add_prop(ysorted, root, "InnRug", "res://assets/art/interior/int_rug_red.png", Vector2(160, 170), Vector2.ZERO, -1)
	MapBuilderHelper.add_prop(ysorted, root, "InnTable", "res://assets/art/interior/int_table_round.png", Vector2(215, 165), Vector2(24, 14))
	MapBuilderHelper.add_prop(ysorted, root, "InnChair", "res://assets/art/interior/int_chair.png", Vector2(185, 165), Vector2(12, 8))
	MapBuilderHelper.add_prop(ysorted, root, "InnClock", "res://assets/art/interior/int_clock.png", Vector2(105, 62), Vector2(14, 10))
	MapBuilderHelper.add_prop(ysorted, root, "InnCandle", "res://assets/art/interior/int_candlestand.png", Vector2(250, 140), Vector2(12, 10))
	MapBuilderHelper.add_prop(ysorted, root, "InnBed", "res://assets/art/interior/int_bed_red.png", Vector2(72, 128), Vector2(24, 28))
	MapBuilderHelper.add_bed(root, "InnBedInteract", Vector2(72, 134))
	MapBuilderHelper.add_chest(ysorted, root, "KInnChest", &"kinn_c1", &"grilled_fish", 2, 60, Vector2(255, 96))
	MapBuilderHelper.add_npc(ysorted, root, "BuLaras", "npc_laras", "res://assets/art/npc/npc_inn.png", "res://data/dialogues/laras_greet.tres", Vector2(160, 102), "down")

	MapBuilderHelper.add_borders(root, [
		Rect2(0, 0, 320, 46), Rect2(0, 0, 24, 256), Rect2(296, 0, 24, 256),
		Rect2(0, 240, 132, 24), Rect2(188, 240, 132, 24),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(160, 206))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(160, 244), "res://maps/kpasar.tscn", &"from_kinn", Vector2(44, 18))
	MapBuilderHelper.save_scene(root, "res://maps/interiors/kinn.tscn")


static func _build_arsip(ts: TileSet) -> void:
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Arsip", ts, 20, 16)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 1.5)
	MapBuilderHelper.fill_cobble_rect(dirt, 0, 0, 19, 15)
	dirt.modulate = Color(0.76, 0.74, 0.82)
	grass.queue_free()

	MapBuilderHelper.add_prop(ysorted, root, "ArsipRug", "res://assets/art/interior/int_rug_blue.png", Vector2(160, 165), Vector2.ZERO, -1)
	MapBuilderHelper.add_prop(ysorted, root, "ArsipShelf1", "res://assets/art/interior/int_bookshelf.png", Vector2(76, 68), Vector2(36, 18))
	MapBuilderHelper.add_prop(ysorted, root, "ArsipShelf2", "res://assets/art/interior/int_bookshelf.png", Vector2(244, 68), Vector2(36, 18))
	MapBuilderHelper.add_prop(ysorted, root, "ArsipTable", "res://assets/art/interior/int_table_round.png", Vector2(160, 150), Vector2(24, 14))
	MapBuilderHelper.add_prop(ysorted, root, "ArsipBanner", "res://assets/art/interior/int_banner_blue.png", Vector2(160, 62), Vector2(12, 8))
	MapBuilderHelper.add_prop(ysorted, root, "ArsipCandle", "res://assets/art/interior/int_candlestand.png", Vector2(65, 155), Vector2(12, 10))
	MapBuilderHelper.add_chest(ysorted, root, "ArsipChest", &"arsip_c1", &"shard", 3, 100, Vector2(248, 124))
	MapBuilderHelper.add_npc(ysorted, root, "Arsiparis", "npc_archivist", "res://assets/art/npc/npc_priest.png", "res://data/dialogues/archivist_greet.tres", Vector2(160, 106), "down")

	MapBuilderHelper.add_borders(root, [
		Rect2(0, 0, 320, 46), Rect2(0, 0, 24, 256), Rect2(296, 0, 24, 256),
		Rect2(0, 240, 132, 24), Rect2(188, 240, 132, 24),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(160, 206))
	MapBuilderHelper.add_portal(root, "ToKAkademi", Vector2(160, 244), "res://maps/kakademi.tscn", &"from_arsip", Vector2(44, 18))
	MapBuilderHelper.save_scene(root, "res://maps/interiors/arsip.tscn")


static func _build_arena(ts: TileSet) -> void:
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Arena", ts, 28, 22)
	var root: Node2D = m["root"]
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 1.25)
	MapBuilderHelper.fill_cobble_rect(dirt, 0, 0, 27, 21)
	dirt.modulate = Color(0.78, 0.72, 0.68)
	grass.queue_free()

	MapBuilderHelper.add_prop(ysorted, root, "ArenaBanner1", "res://assets/art/interior/int_banner_red.png", Vector2(90, 58), Vector2(12, 8))
	MapBuilderHelper.add_prop(ysorted, root, "ArenaBanner2", "res://assets/art/interior/int_banner_red.png", Vector2(358, 58), Vector2(12, 8))
	MapBuilderHelper.add_prop(ysorted, root, "ArenaCrate", "res://assets/art/interior/int_crate.png", Vector2(56, 110), Vector2(18, 12))
	MapBuilderHelper.add_prop(ysorted, root, "ArenaBarrel", "res://assets/art/interior/int_barrel.png", Vector2(392, 110), Vector2(16, 12))
	MapBuilderHelper.add_chest(ysorted, root, "ArenaChest", &"arena_c1", &"hi_potion", 3, 180, Vector2(224, 90))

	MapBuilderHelper.add_enemy(ysorted, root, "ArenaSamurai", "samurai", Vector2(150, 155))
	MapBuilderHelper.add_enemy(ysorted, root, "ArenaCaptain", "slaver_captain", Vector2(298, 155))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, 0, 448, 42), Rect2(0, 0, 24, 352), Rect2(424, 0, 24, 352),
		Rect2(0, 336, 192, 24), Rect2(256, 336, 192, 24),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(224, 300))
	MapBuilderHelper.add_portal(root, "ToKBawah", Vector2(224, 340), "res://maps/kbawah.tscn", &"from_arena", Vector2(48, 18))
	MapBuilderHelper.save_scene(root, "res://maps/interiors/arena.tscn")
