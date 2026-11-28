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


static func _add_wall_run_h(ysorted: Node2D, root: Node, prefix: String, x_start: float, x_end: float, y: float) -> void:
	var x: float = x_start
	var idx: int = 0
	while x <= x_end:
		MapBuilderHelper.add_prop(ysorted, root, "%sH_%d" % [prefix, idx], "res://assets/art/buildings/sp_b_citywall_h.png", Vector2(x, y), Vector2(108, 22))
		x += 108.0
		idx += 1


static func _add_wall_run_v(ysorted: Node2D, root: Node, prefix: String, x: float, y_start: float, y_end: float) -> void:
	var y: float = y_start
	var idx: int = 0
	while y <= y_end:
		MapBuilderHelper.add_prop(ysorted, root, "%sV_%d" % [prefix, idx], "res://assets/art/buildings/sp_b_citywall_v.png", Vector2(x, y), Vector2(36, 128))
		y += 128.0
		idx += 1


static func _add_wall_tower(ysorted: Node2D, root: Node, node_name: String, pos: Vector2) -> void:
	MapBuilderHelper.add_prop(ysorted, root, node_name, "res://assets/art/buildings/sp_b_citywall_tower.png", pos, Vector2(64, 30))


static func _build_kgate(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 118
	var rows: int = 56
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KGate", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(
		m, &"kgate", &"city", true,
		[[Vector2(81, 55), Vector2(81, 42), 2.5]],
		[Rect2i(74, 42, 16, 14)]
	)

	_place_building(ysorted, root, buildings, "gatehouse", "Gatehouse", Vector2(1300, 442))
	_place_building(ysorted, root, buildings, "citywall_l", "CityWallL", Vector2(969, 438))
	_place_building(ysorted, root, buildings, "citywall_r", "CityWallR", Vector2(1630, 438))
	_add_wall_tower(ysorted, root, "GateWallTowerW", Vector2(724, 444))
	_add_wall_tower(ysorted, root, "GateWallTowerE", Vector2(1862, 444))
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
	MapBuilderHelper.add_prop(ysorted, root, "GateRockL", "res://assets/art/nature/gpt_city_rock_lg.png", Vector2(880, 520), Vector2(32, 16))
	MapBuilderHelper.add_prop(ysorted, root, "GateRockR", "res://assets/art/nature/gpt_city_rock_sm.png", Vector2(1690, 560), Vector2(24, 12))

	MapBuilderHelper.add_shrine(ysorted, root, Vector2(1160, 740))
	MapBuilderHelper.add_chest(ysorted, root, "KGateChest1", &"kgate_c1", &"hi_potion", 1, 70, Vector2(1460, 720))

	MapBuilderHelper.add_npc(ysorted, root, "KaptenBratasena", "npc_bratasena", "res://assets/art/npc/npc_sheet_gk1.png", "res://data/dialogues/bratasena_greet.tres", Vector2(410, 265), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PrajuritAnggara", "npc_anggara", "res://assets/art/npc/npc_mc_gk2.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(330, 500), "down", 16.0)
	MapBuilderHelper.add_npc(ysorted, root, "PemanahRaka", "npc_raka_archer", "res://assets/art/npc/npc_sheet_gk3.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(380, 590), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PakSardi", "npc_sardi", "res://assets/art/npc/npc_mc_gk4.png", "res://data/dialogues/citizen_greet.tres", Vector2(536, 232), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PerekrutBayaran", "npc_merc", "res://assets/art/npc/npc_sheet_merc1.png", "res://data/dialogues/merc_greet.tres", Vector2(1030, 668), "down")
	MapBuilderHelper.add_npc(ysorted, root, "BudiKurir", "npc_courier", "res://assets/art/npc/npc_sheet_courier.png", "res://data/dialogues/courier_greet.tres", Vector2(1100, 705), "down", 12.0)
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaGerbangL", "npc_guard_name", "res://assets/art/npc/npc_mc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(1256, 492), "down")
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaGerbangR", "npc_guard_name", "res://assets/art/npc/npc_mc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(1344, 492), "down")

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(1300, 740))
	MapBuilderHelper.add_spawn(spawns, root, "FromRoad", &"from_road", Vector2(1300, 825))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(1300, 62))
	MapBuilderHelper.add_portal(root, "ToRoad", Vector2(1300, 882), "res://maps/road.tscn", &"from_kgate")
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(1300, 14), "res://maps/kpasar.tscn", &"from_kgate")

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"kgate", 1888, 896, 120, "big", "tall", [Rect2(680, 340, 1180, 120)])
	MapBuilderHelper.populate_nature_and_deco(m, &"kgate", &"city", [Vector2(1160, 740)], [Rect2(90, 120, 620, 690)])
	MapBuilderHelper.add_open_borders(root, &"kgate")
	MapBuilderHelper.save_scene(root, "res://maps/kgate.tscn")


static func _build_kpasar(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 100
	var rows: int = 75
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KPasar", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(m, &"kpasar", &"city", true)

	_place_building(ysorted, root, buildings, "fountain", "PasarFountain", Vector2(800, 640))
	var stalls: Array[Array] = [
		# Deretan tenda pasar utara (kiri & kanan alun-alun)
		["market_stall", "StallN1", Vector2(270, 520)],
		["stall_food", "StallN2", Vector2(360, 520)],
		["stall_potion", "StallPotionN", Vector2(450, 520)],
		["stall_butcher", "StallButcherN", Vector2(540, 520)],
		["market_stall", "StallN5", Vector2(630, 520)],
		["market_stall", "StallN6", Vector2(970, 520)],
		["stall_weapon", "StallWeaponN", Vector2(1060, 520)],
		["stall_scroll", "StallScrollN", Vector2(1150, 520)],
		["stall_food", "StallN9", Vector2(1240, 520)],
		["market_stall", "StallN10", Vector2(1330, 520)],
		# Deretan tenda pasar selatan (kiri & kanan alun-alun)
		["market_stall", "StallS1", Vector2(320, 855)],
		["stall_food", "StallFoodS", Vector2(420, 855)],
		["stall_scroll", "StallScrollS", Vector2(520, 855)],
		["stall_butcher", "StallS4", Vector2(620, 855)],
		["stall_food", "StallS5", Vector2(980, 855)],
		["stall_potion", "StallPotionS", Vector2(1080, 855)],
		["stall_weapon", "StallWeaponS", Vector2(1180, 855)],
		["market_stall", "StallS8", Vector2(1280, 855)],
	]
	for st: Array in stalls:
		_place_building(ysorted, root, buildings, st[0], st[1], st[2])

	# Deretan rumah perkotaan padat (jarak rapat ~104px, bebas renggangan kosong)
	var houses: Array[Array] = [
		["city_house_1", "PasarHN1", Vector2(130, 304)], ["city_house_2", "PasarHN2", Vector2(234, 296)],
		["city_house_3", "PasarHN3", Vector2(338, 304)], ["city_house_4", "PasarHN4L", Vector2(442, 296)],
		["city_house_5", "PasarInnBldg", Vector2(556, 304)],
		["city_house_3", "PasarHN4", Vector2(1044, 304)], ["city_house_1", "PasarHN5L", Vector2(1148, 296)],
		["city_house_4", "PasarHN5", Vector2(1252, 304)], ["city_house_2", "PasarHN6", Vector2(1356, 296)],
		["city_house_5", "PasarHN7", Vector2(1460, 304)],
		["city_house_3", "PasarHS1", Vector2(130, 1094)], ["city_house_2", "PasarHS2", Vector2(234, 1102)],
		["city_house_1", "PasarHS2B", Vector2(338, 1094)], ["city_house_4", "PasarHS3L", Vector2(442, 1102)],
		["city_house_4", "PasarHS3", Vector2(556, 1096)],
		["city_house_5", "PasarHS4", Vector2(1044, 1094)], ["city_house_2", "PasarHS4B", Vector2(1148, 1102)],
		["city_house_3", "PasarHS5", Vector2(1252, 1094)], ["city_house_1", "PasarHS5B", Vector2(1356, 1102)],
		["city_house_4", "PasarHS6", Vector2(1460, 1094)],
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
	MapBuilderHelper.add_npc(ysorted, root, "PandaiBesiKota", "npc_city_smith", "res://assets/art/npc/npc_sheet_smith.png", "res://data/dialogues/city_smith_greet.tres", Vector2(940, 590), "down", 0.0, &"city_smith", "ui_shop_city_smith", city_smith_items)
	MapBuilderHelper.add_npc(ysorted, root, "JuruLelangBastian", "npc_bastian", "res://assets/art/npc/npc_mc_elder.png", "res://data/dialogues/bastian_greet.tres", Vector2(740, 390), "down")
	MapBuilderHelper.add_npc(ysorted, root, "WargaPasar", "npc_citizen", "res://assets/art/npc/npc_sheet_ps2.png", "res://data/dialogues/citizen_greet.tres", Vector2(660, 760), "down", 18.0)
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaPasar", "npc_guard_name", "res://assets/art/npc/npc_mc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(1470, 645), "left")

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

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"kpasar", 1600, 1200, 130, "big_dark", "tall_dark")
	MapBuilderHelper.populate_nature_and_deco(m, &"kpasar", &"city", [Vector2(800, 640), Vector2(800, 470)], [Rect2(360, 450, 880, 480)])
	MapBuilderHelper.add_open_borders(root, &"kpasar")
	MapBuilderHelper.save_scene(root, "res://maps/kpasar.tscn")


static func _build_kpermukiman(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 88
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KPermukiman", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(m, &"kpermukiman", &"city", true)

	_place_building(ysorted, root, buildings, "balai_dewan", "BalaiDewan", Vector2(688, 360))
	_place_building(ysorted, root, buildings, "well", "PermukimanWell", Vector2(688, 520))

	# Deretan rumah permukiman kota padat (4 blok rapat) + 2 tenda pedagang lokal
	var p_houses: Array[Array] = [
		["city_house_1", "PermH1", Vector2(148, 240)], ["city_house_2", "PermH2", Vector2(252, 232)],
		["city_house_4", "PermH2B", Vector2(356, 240)], ["city_house_3", "PermH2C", Vector2(460, 232)],
		["city_house_3", "PermH3", Vector2(948, 232)], ["city_house_5", "PermH3B", Vector2(1052, 240)],
		["city_house_4", "PermH4", Vector2(1156, 232)], ["city_house_1", "PermH4B", Vector2(1260, 240)],
		["city_house_2", "PermH5", Vector2(148, 712)], ["city_house_1", "PermH6", Vector2(252, 720)],
		["city_house_5", "PermH6B", Vector2(356, 712)], ["city_house_4", "PermH6C", Vector2(460, 720)],
		["city_house_5", "PermH7", Vector2(948, 720)], ["city_house_2", "PermH7B", Vector2(1052, 712)],
		["city_house_3", "PermH8", Vector2(1156, 720)], ["city_house_1", "PermH8B", Vector2(1260, 712)],
	]
	for ph: Array in p_houses:
		_place_building(ysorted, root, buildings, ph[0], ph[1], ph[2])
	_place_building(ysorted, root, buildings, "stall_food", "PermStallW", Vector2(540, 520))
	_place_building(ysorted, root, buildings, "market_stall", "PermStallE", Vector2(836, 520))

	MapBuilderHelper.add_prop(ysorted, root, "PermLamp1", "res://assets/art/props/gpt_city_lamp2.png", Vector2(620, 430), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "PermLamp2", "res://assets/art/props/gpt_city_lamp2.png", Vector2(756, 430), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "PermBench1", "res://assets/art/props/bench.png", Vector2(616, 520), Vector2(40, 10))
	MapBuilderHelper.add_prop(ysorted, root, "PermFlower1", "res://assets/art/props/gpt_city_flower_p.png", Vector2(630, 385), Vector2.ZERO)
	MapBuilderHelper.add_prop(ysorted, root, "PermFlower2", "res://assets/art/props/gpt_city_flower_w.png", Vector2(746, 385), Vector2.ZERO)

	MapBuilderHelper.add_chest(ysorted, root, "KPermChest1", &"kperm_c1", &"hi_potion", 2, 85, Vector2(1240, 500))
	MapBuilderHelper.add_npc(ysorted, root, "PetugasDewan", "npc_dewan", "res://assets/art/npc/npc_sheet_pm1.png", "res://data/dialogues/dewan_greet.tres", Vector2(688, 412), "down")
	MapBuilderHelper.add_npc(ysorted, root, "WargaPermukiman", "npc_citizen", "res://assets/art/npc/npc_sheet_pm2.png", "res://data/dialogues/citizen_greet.tres", Vector2(420, 540), "down", 18.0)
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaPerm", "npc_guard_name", "res://assets/art/npc/npc_mc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(160, 540), "down")

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(688, 560))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(62, 500))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(14, 500), "res://maps/kpasar.tscn", &"from_kpermukiman", Vector2(22, 60))

	_add_wall_run_h(ysorted, root, "PermWallN", 80.0, 1320.0, 64.0)
	_add_wall_run_h(ysorted, root, "PermWallS", 80.0, 1320.0, 976.0)
	_add_wall_run_v(ysorted, root, "PermWallE", 1384.0, 160.0, 910.0)
	_add_wall_tower(ysorted, root, "PermTowerNE", Vector2(1372, 92))
	_add_wall_tower(ysorted, root, "PermTowerSE", Vector2(1372, 978))

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"kpermukiman", 1408, 992, 120, "big", "tall")
	MapBuilderHelper.populate_nature_and_deco(m, &"kpermukiman", &"city", [Vector2(688, 520)])
	MapBuilderHelper.add_open_borders(root, &"kpermukiman")
	MapBuilderHelper.save_scene(root, "res://maps/kpermukiman.tscn")


static func _build_kakademi(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 88
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KAkademi", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(m, &"kakademi", &"city", true)

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
	MapBuilderHelper.add_npc(ysorted, root, "PenjagaAkademi", "npc_guard_name", "res://assets/art/npc/npc_mc_guard_spear.png", "res://data/dialogues/guard_gate_greet.tres", Vector2(640, 700), "down")

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(704, 795))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(704, 930))
	MapBuilderHelper.add_spawn(spawns, root, "FromArsip", &"from_arsip", Vector2(704, 412))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(704, 978), "res://maps/kpasar.tscn", &"from_kakademi")
	MapBuilderHelper.add_portal(root, "DoorArsip", Vector2(704, 386), "res://maps/interiors/arsip.tscn", &"default", Vector2(32, 16))

	_add_wall_run_h(ysorted, root, "AcadWallN", 80.0, 1320.0, 64.0)
	_add_wall_run_h(ysorted, root, "AcadWallSW", 80.0, 560.0, 976.0)
	_add_wall_run_h(ysorted, root, "AcadWallSE", 848.0, 1320.0, 976.0)
	_add_wall_run_v(ysorted, root, "AcadWallW", 24.0, 160.0, 910.0)
	_add_wall_run_v(ysorted, root, "AcadWallE", 1384.0, 160.0, 910.0)
	_add_wall_tower(ysorted, root, "AcadTowerNW", Vector2(36, 92))
	_add_wall_tower(ysorted, root, "AcadTowerNMid", Vector2(704, 76))
	_add_wall_tower(ysorted, root, "AcadTowerNE", Vector2(1372, 92))
	_add_wall_tower(ysorted, root, "AcadTowerSW", Vector2(36, 978))
	_add_wall_tower(ysorted, root, "AcadTowerSE", Vector2(1372, 978))

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"kakademi", 1408, 992, 120, "big", "tall")
	MapBuilderHelper.populate_nature_and_deco(m, &"kakademi", &"city", [Vector2(704, 760)], [Rect2(140, 260, 1140, 420)])
	MapBuilderHelper.add_open_borders(root, &"kakademi")
	MapBuilderHelper.save_scene(root, "res://maps/kakademi.tscn")


static func _build_kbawah(ts: TileSet, buildings: Dictionary) -> void:
	var cols: int = 75
	var rows: int = 62
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KBawah", ts, cols, rows)
	var root: Node2D = m["root"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]

	MapBuilderHelper.build_ground_from_custom_png(m, &"kbawah", &"city", true)

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
	MapBuilderHelper.add_npc(ysorted, root, "PedagangMalam", "npc_night_merchant", "res://assets/art/npc/npc_mc_merchant.png", "res://data/dialogues/night_merchant_greet.tres", Vector2(500, 640), "down", 0.0, &"night_market", "ui_shop_night", night_items)
	MapBuilderHelper.add_npc(ysorted, root, "WargaBawah", "npc_citizen", "res://assets/art/npc/npc_sheet_farmer.png", "res://data/dialogues/citizen_greet.tres", Vector2(320, 560), "down", 18.0)

	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(600, 560))
	MapBuilderHelper.add_spawn(spawns, root, "FromKPasar", &"from_kpasar", Vector2(1138, 500))
	MapBuilderHelper.add_spawn(spawns, root, "FromArena", &"from_arena", Vector2(700, 712))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(1186, 500), "res://maps/kpasar.tscn", &"from_kbawah", Vector2(22, 60))
	MapBuilderHelper.add_portal(root, "DoorArena", Vector2(700, 672), "res://maps/interiors/arena.tscn", &"default", Vector2(32, 18))

	_add_wall_run_h(ysorted, root, "BawahWallN", 80.0, 1120.0, 64.0)
	_add_wall_run_h(ysorted, root, "BawahWallS", 80.0, 1120.0, 976.0)
	_add_wall_run_v(ysorted, root, "BawahWallW", 24.0, 160.0, 910.0)
	_add_wall_tower(ysorted, root, "BawahTowerNW", Vector2(36, 92))
	_add_wall_tower(ysorted, root, "BawahTowerSW", Vector2(36, 978))

	MapBuilderHelper.add_open_tree_border(ysorted, root, &"kbawah", 1200, 992, 120, "big_dark", "tall_dark")
	MapBuilderHelper.populate_nature_and_deco(m, &"kbawah", &"city", [Vector2(770, 690)])
	MapBuilderHelper.add_open_borders(root, &"kbawah")
	MapBuilderHelper.save_scene(root, "res://maps/kbawah.tscn")


static func _build_kinn(ts: TileSet) -> void:
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("KInn", ts, 20, 16)
	var root: Node2D = m["root"]
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 1.5)
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_ellipse(grid, 20, 16, Vector2(10, 8), 8.0, 6.0)
	MapBuilderHelper.apply_grass_autotile(grass, grid, 20, 16)
	grass.modulate = Color(0.55, 0.44, 0.34)
	dirt.modulate = Color(0.84, 0.72, 0.56)

	MapBuilderHelper.add_prop(ysorted, root, "KInnBed", "res://assets/art/interior/int_bed_red.png", Vector2(246, 86), Vector2(32, 22))
	MapBuilderHelper.add_bed(root, "RestBed", Vector2(246, 108))
	MapBuilderHelper.add_prop(ysorted, root, "KInnTable", "res://assets/art/interior/int_table_round.png", Vector2(120, 130), Vector2(30, 16))
	MapBuilderHelper.add_prop(ysorted, root, "KInnRug", "res://assets/art/interior/int_rug_red.png", Vector2(160, 175), Vector2.ZERO, -1)
	MapBuilderHelper.add_npc(ysorted, root, "BuLaras", "npc_laras", "res://assets/art/npc/npc_sheet_in1.png", "res://data/dialogues/laras_greet.tres", Vector2(150, 96), "down")
	MapBuilderHelper.add_chest(ysorted, root, "KInnChest", &"kinn_c1", &"grilled_fish", 2, 35, Vector2(68, 92))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, 0, 320, 12), Rect2(0, 0, 12, 256), Rect2(308, 0, 12, 256),
		Rect2(0, 244, 136, 12), Rect2(184, 244, 136, 12),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(160, 206))
	MapBuilderHelper.add_portal(root, "ToKPasar", Vector2(160, 244), "res://maps/kpasar.tscn", &"from_kinn", Vector2(44, 18))
	MapBuilderHelper.save_scene(root, "res://maps/interiors/kinn.tscn")


static func _build_arsip(ts: TileSet) -> void:
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Arsip", ts, 20, 16)
	var root: Node2D = m["root"]
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 1.5)
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_ellipse(grid, 20, 16, Vector2(10, 8), 8.2, 6.2)
	MapBuilderHelper.apply_grass_autotile(grass, grid, 20, 16)
	grass.modulate = Color(0.36, 0.34, 0.48)
	dirt.modulate = Color(0.68, 0.64, 0.72)

	MapBuilderHelper.add_prop(ysorted, root, "BookcaseL", "res://assets/art/interior/int_bookshelf.png", Vector2(82, 76), Vector2(36, 18))
	MapBuilderHelper.add_prop(ysorted, root, "BookcaseR", "res://assets/art/interior/int_bookshelf.png", Vector2(238, 76), Vector2(36, 18))
	MapBuilderHelper.add_prop(ysorted, root, "ArsipTable", "res://assets/art/interior/int_table_flower.png", Vector2(160, 140), Vector2(32, 16))
	MapBuilderHelper.add_prop(ysorted, root, "ArsipRug", "res://assets/art/interior/int_rug_blue.png", Vector2(160, 168), Vector2.ZERO, -1)
	MapBuilderHelper.add_npc(ysorted, root, "Arsiparis", "npc_archivist", "res://assets/art/npc/npc_sheet_ar1.png", "res://data/dialogues/archivist_greet.tres", Vector2(160, 98), "down")
	MapBuilderHelper.add_chest(ysorted, root, "ArsipChest", &"arsip_c1", &"shard", 3, 60, Vector2(252, 128))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, 0, 320, 12), Rect2(0, 0, 12, 256), Rect2(308, 0, 12, 256),
		Rect2(0, 244, 136, 12), Rect2(184, 244, 136, 12),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(160, 206))
	MapBuilderHelper.add_portal(root, "ToKAkademi", Vector2(160, 244), "res://maps/kakademi.tscn", &"from_arsip", Vector2(44, 18))
	MapBuilderHelper.save_scene(root, "res://maps/interiors/arsip.tscn")


static func _build_arena(ts: TileSet) -> void:
	var m: Dictionary = MapBuilderHelper.create_outdoor_base("Arena", ts, 28, 22)
	var root: Node2D = m["root"]
	root.set_meta("is_indoor", true)
	root.set_meta("camera_zoom", 1.25)
	var dirt: TileMapLayer = m["dirt"]
	var grass: TileMapLayer = m["grass"]
	var ysorted: Node2D = m["ysorted"]
	var spawns: Node2D = m["spawns"]
	var grid: Array[bool] = m["grid"]

	MapBuilderHelper.carve_ellipse(grid, 28, 22, Vector2(14, 11), 11.5, 9.0)
	MapBuilderHelper.apply_grass_autotile(grass, grid, 28, 22)
	grass.modulate = Color(0.55, 0.42, 0.34)
	dirt.modulate = Color(0.76, 0.62, 0.48)

	MapBuilderHelper.add_prop(ysorted, root, "ArenaLampL", "res://assets/art/props/gpt_city_lamp.png", Vector2(110, 120), Vector2(10, 8))
	MapBuilderHelper.add_prop(ysorted, root, "ArenaLampR", "res://assets/art/props/gpt_city_lamp.png", Vector2(338, 120), Vector2(10, 8))
	MapBuilderHelper.add_enemy(ysorted, root, "ArenaChamp", "slaver_captain", Vector2(224, 132))
	MapBuilderHelper.add_enemy(ysorted, root, "ArenaGuard1", "slaver", Vector2(145, 190))
	MapBuilderHelper.add_enemy(ysorted, root, "ArenaGuard2", "slaver", Vector2(305, 190))

	MapBuilderHelper.add_borders(root, [
		Rect2(0, 0, 448, 12), Rect2(0, 0, 12, 352), Rect2(436, 0, 12, 352),
		Rect2(0, 340, 196, 12), Rect2(252, 340, 196, 12),
	])
	MapBuilderHelper.add_spawn(spawns, root, "Default", &"default", Vector2(224, 300))
	MapBuilderHelper.add_portal(root, "ToKBawah", Vector2(224, 340), "res://maps/kbawah.tscn", &"from_arena", Vector2(48, 18))
	MapBuilderHelper.save_scene(root, "res://maps/interiors/arena.tscn")
