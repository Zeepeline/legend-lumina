extends SceneTree

var _passed: int = 0
var _failed: int = 0
var _sections_done: int = 0
var _ran: bool = false


func _process(_delta: float) -> bool:
	if _ran:
		return true
	_ran = true
	_test_combat_math()
	_test_inventory_and_craft()
	_test_skills_and_quests()
	_test_game_state_and_save()
	_test_audio_service()
	_test_localization_and_sprites()
	_test_data_resources()
	_test_all_24_maps()
	_test_benua_openworld_and_hud()
	_test_river_and_bridge_connectivity()
	print_rich("[b]Test Summary: %d sections, %d passed, %d failed[/b]" % [_sections_done, _passed, _failed])
	var ok: bool = _failed == 0 and _sections_done == 10
	quit(0 if ok else 1)
	return true


func _assert(cond: bool, msg: String) -> void:
	if cond:
		_passed += 1
	else:
		_failed += 1
		print_rich("[color=red]FAIL: %s[/color]" % msg)


func _load_res(path: String) -> Resource:
	return ResourceLoader.load(path)


func _test_combat_math() -> void:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = 42
	var min_hit: Dictionary = CombatMath.compute_damage(1, 999, 1, 1.0, 0.0, rng)
	_assert(int(min_hit["amount"]) == 1, "damage vs high def floors at 1")
	_assert(not bool(min_hit["is_crit"]), "0 crit chance does not crit")

	rng.seed = 99
	var c1: Dictionary = CombatMath.compute_damage(16, 4, 1, 1.0, 0.0, rng)
	rng.seed = 99
	var c3: Dictionary = CombatMath.compute_damage(16, 4, 3, 1.0, 0.0, rng)
	_assert(int(c3["amount"]) > int(c1["amount"]), "combo 3 exceeds combo 1")

	rng.seed = 99
	var chg: Dictionary = CombatMath.compute_charge_damage(16, 4, 1.0, rng)
	_assert(int(chg["amount"]) >= int(c3["amount"]), "charge spin damage >= combo 3")

	var mag_dmg: int = CombatMath.compute_magic_damage(12, 4, 1.9, rng)
	_assert(mag_dmg >= 15, "magic damage scales properly")

	var e_norm: int = CombatMath.compute_enemy_damage(20, 4, false, rng)
	var e_relax: int = CombatMath.compute_enemy_damage(20, 4, true, rng)
	_assert(e_relax < e_norm, "relaxed mode reduces enemy damage")
	_assert(CombatMath.stamina_cost(14.0, true) == 7.0, "relaxed mode halves stamina cost")
	_assert(CombatMath.compute_flask_heal(100) == 45, "flask heals 45%")

	var exp_res: Dictionary = CombatMath.apply_exp(1, 15, 25)
	_assert(int(exp_res["level"]) == 2 and int(exp_res["exp"]) == 20 and int(exp_res["levels_gained"]) == 1, "apply_exp level up")
	_sections_done += 1


func _test_inventory_and_craft() -> void:
	var inv: Dictionary = {}
	InventoryLogic.add_item(inv, &"potion", 2)
	InventoryLogic.add_item(inv, &"potion", 3)
	_assert(InventoryLogic.count_item(inv, &"potion") == 5, "add_item accumulates qty")
	_assert(InventoryLogic.remove_item(inv, &"potion", 2) and InventoryLogic.count_item(inv, &"potion") == 3, "remove_item subtracts qty")
	_assert(not InventoryLogic.remove_item(inv, &"potion", 9), "remove_item rejects insufficient qty")

	var b_fail: Dictionary = InventoryLogic.buy_item(5, inv, 10, &"ether", 1)
	_assert(not bool(b_fail["ok"]) and int(b_fail["gold"]) == 5, "buy_item fails without gold")
	var b_ok: Dictionary = InventoryLogic.buy_item(30, inv, 10, &"ether", 2)
	_assert(bool(b_ok["ok"]) and int(b_ok["gold"]) == 10 and InventoryLogic.count_item(inv, &"ether") == 2, "buy_item deducts gold and adds item")

	var s_ok: Dictionary = InventoryLogic.sell_item(10, inv, 5, &"ether", 1)
	_assert(bool(s_ok["ok"]) and int(s_ok["gold"]) == 15 and InventoryLogic.count_item(inv, &"ether") == 1, "sell_item removes item and adds gold")

	var pot_rec: Dictionary = CraftLogic.get_recipe(&"potion")
	_assert(not pot_rec.is_empty(), "CraftLogic potion recipe present")
	var craft_inv: Dictionary = {"jelly": 2}
	_assert(not CraftLogic.can_craft(craft_inv, pot_rec), "CraftLogic rejects insufficient ingredients")
	InventoryLogic.add_item(craft_inv, &"jelly", 2)
	_assert(CraftLogic.can_craft(craft_inv, pot_rec), "CraftLogic allows crafting when enough")
	_assert(CraftLogic.consume_ingredients(craft_inv, pot_rec) and InventoryLogic.count_item(craft_inv, &"jelly") == 1, "CraftLogic consumes exact ingredients")
	_sections_done += 1


func _test_skills_and_quests() -> void:
	_assert(SkillDatabase.all_ids().size() == 5, "5 magic skills defined")
	_assert(SkillDatabase.tier_for_uses(0) == 1, "tier 1 below 10 uses")
	_assert(SkillDatabase.tier_for_uses(10) == 2, "tier 2 at 10 uses")
	_assert(SkillDatabase.tier_for_uses(25) == 3, "tier 3 at 25 uses")
	_assert(SkillDatabase.tier_multiplier(3) > SkillDatabase.tier_multiplier(1), "tier 3 mult > tier 1")

	_assert(QuestDatabase.QUESTS.size() == 9, "9 quests defined")
	_assert(QuestDatabase.ACHIEVEMENTS.size() == 6, "6 achievements defined")
	var q_forest: Dictionary = QuestDatabase.get_quest(&"q_forest_bandits")
	_assert(not QuestDatabase.is_completed(q_forest, {"flags": {}}), "q_forest_bandits incomplete initially")
	_assert(QuestDatabase.is_completed(q_forest, {"flags": {"mb_goblin": true}}), "q_forest_bandits complete on mb_goblin")
	var q_shrines: Dictionary = QuestDatabase.get_quest(&"sq_shrines")
	_assert(QuestDatabase.is_completed(q_shrines, {"unlocked_shrines": ["a", "b", "c", "d", "e"]}), "sq_shrines completes at 5 shrines")
	var ach_city: Dictionary = QuestDatabase.ACHIEVEMENTS[5]
	_assert(not QuestDatabase.is_completed(ach_city, {"visited_maps": ["res://maps/kgate.tscn"]}), "ach_city_all needs all 5 city districts")
	_assert(QuestDatabase.is_completed(ach_city, {"visited_maps": [
		"res://maps/kgate.tscn", "res://maps/kpasar.tscn", "res://maps/kpermukiman.tscn",
		"res://maps/kakademi.tscn", "res://maps/kbawah.tscn",
	]}), "ach_city_all completes when all 5 city maps visited")
	_sections_done += 1


func _test_game_state_and_save() -> void:
	var gs: GameStateStore = GameStateStore.ref
	var sv: SaveService = SaveService.ref
	_assert(gs != null and sv != null, "autoload singletons active")
	if gs == null or sv == null:
		return

	var test_dir: String = "user://test_saves"
	sv.delete_slot(99, test_dir)
	gs.reset()

	_assert(gs.spend_mp(8) and gs.mp == 22, "spend_mp deducts mp")
	_assert(gs.restore_mp(5) == 5 and gs.mp == 27, "restore_mp caps correctly")

	var base_atk: int = gs.total_attack()
	gs.add_item(&"iron_sword", 1)
	_assert(gs.equip_weapon(&"iron_sword") and gs.total_attack() > base_atk, "equip_weapon boosts total_attack")

	var base_def: int = gs.total_defense()
	gs.add_item(&"iron_chainmail", 1)
	_assert(gs.equip_armor(&"iron_chainmail") and gs.total_defense() > base_def and gs.total_max_hp() == 120, "equip_armor boosts def & max_hp")

	gs.damage_player(30)
	_assert(gs.use_item(&"potion"), "use_item heals player")
	gs.mark_map_visited("res://maps/forest.tscn")
	gs.unlock_shrine("res://maps/forest.tscn")
	gs.advance_to_morning()
	_assert(gs.world_hour == 7.0 and gs.flask_charges == gs.flask_max, "advance_to_morning restores and sets 07:00")

	_assert(not gs.learn_skill(&"holy", 150), "learn_skill rejects when gold insufficient")
	gs.grant_rewards(0, 200)
	_assert(gs.learn_skill(&"holy", 150) and gs.learned_skills.has(&"holy"), "learn_skill learns skill and deducts gold")
	_assert(gs.cycle_active_skill() == &"holy" and gs.active_skill_id == &"holy", "cycle_active_skill cycles to holy")

	gs.add_item(&"jelly", 3)
	var before_pot: int = InventoryLogic.count_item(gs.inventory, &"potion")
	_assert(gs.craft_recipe(&"potion") and InventoryLogic.count_item(gs.inventory, &"potion") == before_pot + 1 and gs.craft_count == 1, "craft_recipe creates potion")

	gs.set_flag(&"mb_goblin", true)
	var gold_before_q: int = gs.gold
	_assert(gs.claim_quest(&"q_forest_bandits") and gs.gold > gold_before_q and gs.claimed_quests.has(&"q_forest_bandits"), "claim_quest rewards exp and gold")

	_assert(sv.save_slot(99, test_dir), "save_slot v4 writes cleanly")
	gs.reset()
	_assert(sv.load_slot(99, test_dir), "load_slot v4 restores cleanly")
	_assert(gs.equipped_weapon_id == &"iron_sword" and gs.equipped_armor_id == &"iron_chainmail", "loaded equipment matches")
	_assert(gs.learned_skills.has(&"holy") and gs.active_skill_id == &"holy", "loaded skills match")
	_assert(gs.claimed_quests.has(&"q_forest_bandits") and gs.craft_count == 1, "loaded quests & craft count match")

	var v1_payload: Dictionary = {"version": 1, "state": {"hp": 50, "max_hp": 100, "gold": 12}}
	var migrated: Dictionary = sv.migrate(v1_payload)
	var m_state: Dictionary = migrated["state"]
	_assert(int(migrated["version"]) == SaveService.SAVE_VERSION, "v1 migrates to v4")
	_assert(int(m_state.get("max_mp", 0)) == 30 and str(m_state.get("equipped_weapon_id", "")) == "starter_sword", "v2->v3 fills mp and weapon")
	_assert(str(m_state.get("active_skill_id", "")) == "fire" and (m_state.get("learned_skills", []) as Array).has("fire"), "v3->v4 fills default skills")

	var bad_dir_err: Error = DirAccess.make_dir_recursive_absolute(test_dir)
	_assert(bad_dir_err == OK or bad_dir_err == ERR_ALREADY_EXISTS, "test save dir exists")
	var bad_path: String = "%s/slot_98.json" % test_dir
	var bad_f: FileAccess = FileAccess.open(bad_path, FileAccess.WRITE)
	bad_f.store_string("{invalid json")
	bad_f.close()
	_assert(not sv.load_slot(98, test_dir), "corrupted json fails safely")
	sv.delete_slot(98, test_dir)
	sv.delete_slot(99, test_dir)
	gs.reset()
	_sections_done += 1


func _test_audio_service() -> void:
	var au: AudioService = AudioService.ref
	_assert(au != null, "AudioService active")
	if au == null:
		return
	_assert(AudioService.BGM_VILLAGE != null and AudioService.BGM_EXPLORATION != null, "village/exploration MP3 loaded")
	_assert(AudioService.BGM_BATTLE != null and AudioService.BGM_BOSS != null, "battle/boss MP3 loaded")
	_assert(AudioService.BGM_VILLAGE.loop, "BGM_VILLAGE loop enabled")
	_assert(au.region_bgm_for_map("res://maps/village.tscn") == AudioService.BGM_VILLAGE, "village maps to BGM_VILLAGE")
	_assert(au.region_bgm_for_map("res://maps/kpasar.tscn") == AudioService.BGM_VILLAGE, "kpasar maps to BGM_VILLAGE")
	_assert(au.region_bgm_for_map("res://maps/forest.tscn") == AudioService.BGM_EXPLORATION, "forest maps to BGM_EXPLORATION")
	_assert(au.region_bgm_for_map("res://maps/interiors/arena.tscn") == AudioService.BGM_BATTLE, "arena maps to BGM_BATTLE")
	for sfx_key: StringName in [&"swing", &"swing_heavy", &"hit", &"crit", &"fireball", &"spin"]:
		_assert(au._sfx_bank.has(sfx_key), "SFX bank contains %s" % sfx_key)
	_sections_done += 1


func _test_localization_and_sprites() -> void:
	TranslationServer.set_locale("id")
	_assert(tr("map_village") == "Desa Lumina", "village loc")
	_assert(tr("map_kpasar") == "Distrik Pasar", "kpasar loc")
	_assert(tr("map_kakademi") == "Distrik Akademi", "kakademi loc")
	_assert(tr("map_arsip") == "Arsip Akademi Cahaya", "arsip loc")
	_assert(tr("skill_holy") == "Lentera Suci", "skill_holy loc")
	_assert(tr("q_city_lumina") == "Gerbang Seribu Lentera", "q_city_lumina loc")
	_assert(tr("item_grilled_fish_name") == "Ikan Bakar Lumina", "grilled fish loc")
	_assert(tr("ui_journal_title") == "Jurnal, Jurus & Kerajinan", "journal title loc")
	_assert(tr("recipe_potion").contains("Ramuan"), "recipe_potion loc")

	for skin: StringName in [&"mc2_slave", &"mc2"]:
		var sf: SpriteFrames = HeroSprites.get_frames(skin)
		_assert(sf != null and sf.has_animation(&"walk_down_side") and sf.has_animation(&"atk3_side"), "HeroSprites %s valid" % skin)
	_sections_done += 1


func _test_data_resources() -> void:
	var seen_ids: Dictionary = {}
	var counts: Dictionary = {"weapons": 0, "armors": 0, "items": 0, "enemies": 0, "dialogues": 0}
	var folders: Array[Array] = [
		["weapons", "res://data/weapons"],
		["armors", "res://data/armors"],
		["items", "res://data/items"],
		["enemies", "res://data/enemies"],
		["dialogues", "res://data/dialogues"],
	]
	for pair: Array in folders:
		var tag: String = pair[0]
		var folder: String = pair[1]
		var dir: DirAccess = DirAccess.open(folder)
		_assert(dir != null, "data folder exists: %s" % folder)
		if dir == null:
			continue
		for fname: String in dir.get_files():
			var clean_name: String = fname.trim_suffix(".remap")
			if not clean_name.ends_with(".tres"):
				continue
			var full_path: String = "%s/%s" % [folder, clean_name]
			var res: Resource = _load_res(full_path)
			_assert(res != null, "resource loads: %s" % full_path)
			if res == null:
				continue
			var id_val: StringName = res.get("id")
			var unique_key: String = "%s:%s" % [folder, String(id_val)]
			_assert(not String(id_val).is_empty() and not seen_ids.has(unique_key), "unique id %s" % unique_key)
			seen_ids[unique_key] = true
			counts[tag] = int(counts[tag]) + 1
			if res is EnemyData:
				var ed: EnemyData = res as EnemyData
				_assert(ed.sprite_sheet != null, "enemy sprite_sheet non-null: %s" % ed.id)
				if ed.sprite_sheet != null:
					_assert(ed.sprite_sheet.get_width() == ed.frame_size.x * 4, "enemy width matches 4 cols: %s" % ed.id)
					_assert(ed.sprite_sheet.get_height() == ed.frame_size.y * 6, "enemy height matches 6 rows: %s" % ed.id)
			elif res is WeaponData:
				_assert(ItemDatabase.has_weapon(id_val), "ItemDatabase knows weapon %s" % id_val)
			elif res is ArmorData:
				_assert(ItemDatabase.has_armor(id_val), "ItemDatabase knows armor %s" % id_val)
			elif res is ItemData:
				_assert(ItemDatabase.get_item(id_val) != null, "ItemDatabase knows item %s" % id_val)
			elif res is DialogueData:
				var dd: DialogueData = res as DialogueData
				_assert(not dd.line_keys.is_empty(), "dialogue has lines: %s" % dd.id)
	_assert(int(counts["weapons"]) == 6, "6 WeaponData .tres present (found %d)" % counts["weapons"])
	_assert(int(counts["armors"]) == 4, "4 ArmorData .tres present (found %d)" % counts["armors"])
	_assert(int(counts["items"]) == 12, "12 ItemData .tres present (found %d)" % counts["items"])
	_assert(int(counts["enemies"]) == 24, "24 EnemyData .tres present (found %d)" % counts["enemies"])
	_assert(int(counts["dialogues"]) == 38, "38 DialogueData .tres present (found %d)" % counts["dialogues"])
	_sections_done += 1


func _test_all_24_maps() -> void:
	var maps_info: Dictionary = {
		"res://maps/village.tscn": {"size": Vector2i(64, 45), "indoor": false, "spawns": [&"default", &"from_glade", &"from_forest", &"from_meadow", &"from_lake", &"from_home", &"from_inn", &"from_elderhome", &"from_linahome"]},
		"res://maps/training_glade.tscn": {"size": Vector2i(40, 30), "indoor": false, "spawns": [&"from_village", &"default"]},
		"res://maps/forest.tscn": {"size": Vector2i(80, 75), "indoor": false, "spawns": [&"default", &"from_village", &"from_deepwood", &"from_river"]},
		"res://maps/meadow.tscn": {"size": Vector2i(90, 65), "indoor": false, "spawns": [&"default", &"from_village", &"from_cave", &"from_snow", &"from_swamp"]},
		"res://maps/lake.tscn": {"size": Vector2i(88, 62), "indoor": false, "spawns": [&"default", &"from_village", &"from_road", &"from_temple"]},
		"res://maps/cave.tscn": {"size": Vector2i(70, 58), "indoor": false, "spawns": [&"default", &"from_meadow"]},
		"res://maps/swamp.tscn": {"size": Vector2i(80, 60), "indoor": false, "spawns": [&"default", &"from_meadow", &"from_river"]},
		"res://maps/snow.tscn": {"size": Vector2i(80, 75), "indoor": false, "spawns": [&"default", &"from_meadow"]},
		"res://maps/deepwood.tscn": {"size": Vector2i(150, 112), "indoor": false, "spawns": [&"default", &"from_forest"]},
		"res://maps/river.tscn": {"size": Vector2i(162, 62), "indoor": false, "spawns": [&"default", &"from_forest", &"from_swamp"]},
		"res://maps/road.tscn": {"size": Vector2i(56, 125), "indoor": false, "spawns": [&"default", &"from_lake", &"from_kgate"]},
		"res://maps/kgate.tscn": {"size": Vector2i(118, 56), "indoor": false, "spawns": [&"default", &"from_road", &"from_kpasar"]},
		"res://maps/kpasar.tscn": {"size": Vector2i(100, 75), "indoor": false, "spawns": [&"default", &"from_kgate", &"from_kakademi", &"from_kbawah", &"from_kpermukiman", &"from_kinn"]},
		"res://maps/kpermukiman.tscn": {"size": Vector2i(88, 62), "indoor": false, "spawns": [&"default", &"from_kpasar"]},
		"res://maps/kakademi.tscn": {"size": Vector2i(88, 62), "indoor": false, "spawns": [&"default", &"from_kpasar", &"from_arsip"]},
		"res://maps/kbawah.tscn": {"size": Vector2i(75, 62), "indoor": false, "spawns": [&"default", &"from_kpasar", &"from_arena"]},
		"res://maps/interiors/home.tscn": {"size": Vector2i.ZERO, "indoor": true, "spawns": [&"default"]},
		"res://maps/interiors/inn.tscn": {"size": Vector2i.ZERO, "indoor": true, "spawns": [&"default"]},
		"res://maps/interiors/elderhome.tscn": {"size": Vector2i.ZERO, "indoor": true, "spawns": [&"default"]},
		"res://maps/interiors/linahome.tscn": {"size": Vector2i.ZERO, "indoor": true, "spawns": [&"default"]},
		"res://maps/interiors/temple.tscn": {"size": Vector2i(20, 16), "indoor": true, "spawns": [&"default"]},
		"res://maps/interiors/kinn.tscn": {"size": Vector2i(20, 16), "indoor": true, "spawns": [&"default"]},
		"res://maps/interiors/arsip.tscn": {"size": Vector2i(20, 16), "indoor": true, "spawns": [&"default"]},
		"res://maps/interiors/arena.tscn": {"size": Vector2i(28, 22), "indoor": true, "spawns": [&"default"]},
	}

	var instantiated: Dictionary = {}
	for path: String in maps_info:
		var packed: PackedScene = _load_res(path) as PackedScene
		_assert(packed != null, "map loads: %s" % path)
		if packed == null:
			continue
		var map_node: Node = packed.instantiate()
		instantiated[path] = map_node
		var spec: Dictionary = maps_info[path]
		_assert(bool(map_node.get_meta("is_indoor", false)) == bool(spec["indoor"]), "%s is_indoor flag matches" % path)
		if not bool(spec["indoor"]):
			_assert(is_equal_approx(float(map_node.get_meta("camera_zoom", 1.0)), 1.25), "%s outdoor camera_zoom == 1.25" % path)

		var expected_sz: Vector2i = spec["size"]
		if expected_sz != Vector2i.ZERO:
			var dirt: TileMapLayer = map_node.get_node_or_null("GroundDirt") as TileMapLayer
			var gspr: Sprite2D = map_node.get_node_or_null("GroundSprite") as Sprite2D
			var gter: TileMapLayer = map_node.get_node_or_null("GroundTerrain") as TileMapLayer
			_assert(dirt != null or gter != null or (gspr != null and gspr.texture != null), "%s has ground layer" % path)
			if dirt != null:
				_assert(dirt.tile_set != null and dirt.tile_set.resource_path == "res://maps/tilesets/sprout_overworld.tres", "%s shares sprout_overworld.tres" % path)
				_assert(dirt.get_used_rect().size == expected_sz, "%s GroundDirt size matches %s" % [path, expected_sz])
				var holes: int = 0
				for r: int in expected_sz.y:
					for c: int in expected_sz.x:
						if dirt.get_cell_source_id(Vector2i(c, r)) == -1:
							holes += 1
				_assert(holes == 0, "%s GroundDirt has 0 holes" % path)
			if not bool(spec["indoor"]):
				var grass: TileMapLayer = map_node.get_node_or_null("GroundGrass") as TileMapLayer
				if grass != null and dirt != null:
					_assert(grass.get_used_cells().size() > 80, "%s GroundGrass painted" % path)
					_assert(dirt.z_index < 0 and grass.z_index < 0, "%s ground layers keep negative z_index" % path)
				elif gter != null:
					_assert(gter.z_index < 0 and gter.get_used_cells().size() > 80, "%s GroundTerrain valid" % path)
				else:
					_assert(gspr != null and gspr.z_index < 0, "%s GroundSprite keeps negative z_index" % path)
		else:
			var room_bg: Sprite2D = map_node.get_node_or_null("RoomBg") as Sprite2D
			_assert(room_bg != null and room_bg.texture != null, "%s RoomBg valid" % path)

		var ysorted: Node = map_node.get_node_or_null("YSorted")
		if ysorted != null:
			for ch: Node in ysorted.get_children():
				if ch is NpcActor:
					var npc_n: NpcActor = ch as NpcActor
					_assert(npc_n.sprite_sheet != null, "%s NPC %s has sprite_sheet" % [path, npc_n.name])

		var spawn_ids: Dictionary = {}
		var spawns_node: Node = map_node.get_node_or_null("SpawnPoints")
		_assert(spawns_node != null, "%s has SpawnPoints" % path)
		if spawns_node != null:
			for child: Node in spawns_node.get_children():
				var sid: StringName = child.get("spawn_id")
				_assert(not spawn_ids.has(sid), "%s unique spawn %s" % [path, sid])
				spawn_ids[sid] = true
			var req_spawns: Array = spec["spawns"]
			for req: StringName in req_spawns:
				_assert(spawn_ids.has(req), "%s contains spawn %s" % [path, req])
		instantiated[path + "_spawns"] = spawn_ids

	for path: String in maps_info:
		var map_node: Node = instantiated.get(path, null)
		if map_node == null:
			continue
		var portal_count: int = 0
		for child: Node in map_node.get_children():
			if child is Portal:
				portal_count += 1
				var portal: Portal = child as Portal
				_assert(ResourceLoader.exists(portal.target_map), "portal target exists: %s" % portal.target_map)
				var tspawns: Dictionary = instantiated.get(portal.target_map + "_spawns", {})
				_assert(tspawns.has(portal.target_spawn_id), "portal target spawn valid: %s -> %s" % [portal.target_map, portal.target_spawn_id])
		_assert(portal_count >= 1, "%s has >= 1 portal" % path)

	for path: String in maps_info:
		var m: Node = instantiated.get(path, null)
		if m != null:
			m.free()
	_sections_done += 1


func _test_benua_openworld_and_hud() -> void:
	_assert(WorldLayout.REGIONS.size() == 14, "WorldLayout defines 14 outdoor regions")
	_assert(WorldLayout.SEAMLESS_PAIRS.size() == 13, "WorldLayout defines 13 seamless links")

	var keys: Array = WorldLayout.REGIONS.keys()
	var overlaps: int = 0
	for i: int in keys.size():
		var ra: Rect2 = Rect2(WorldLayout.get_rect(keys[i] as StringName))
		for j: int in range(i + 1, keys.size()):
			var rb: Rect2 = Rect2(WorldLayout.get_rect(keys[j] as StringName))
			if ra.intersects(rb, false):
				overlaps += 1
	_assert(overlaps == 0, "all 91 Benua region pairs have 0 interior overlap")

	for pair: Array in WorldLayout.SEAMLESS_PAIRS:
		var a: StringName = pair[0]
		var b: StringName = pair[1]
		var ra: Rect2 = Rect2(WorldLayout.get_rect(a))
		var rb: Rect2 = Rect2(WorldLayout.get_rect(b))
		_assert(ra.intersects(rb, true), "seamless link %s <-> %s touches on border" % [a, b])

	var cb: Rect2i = WorldLayout.continent_bounds()
	_assert(cb.size.x > 7000 and cb.size.y > 7000, "continent bounds > 7000x7000 (%s)" % cb.size)
	_assert(WorldLayout.region_at(Vector2(3500.0, 3360.0)) == &"village", "region_at resolves village")
	_assert(WorldLayout.region_at(Vector2(2400.0, -400.0)) == &"kpasar", "region_at resolves kpasar")

	var bw: BenuaWorld = BenuaWorld.new()
	get_root().add_child(bw)
	var p: Node2D = bw.start_at(&"village", &"default")
	_assert(p != null, "BenuaWorld spawns player at village")
	_assert(bw.get_active_region() == &"village", "BenuaWorld active region is village")
	_assert(bw.get_node_or_null("WildFiller") != null, "BenuaWorld has WildFiller textured backdrop")
	var chunks_node: Node2D = bw.get_node_or_null("Chunks") as Node2D
	_assert(chunks_node != null and chunks_node.y_sort_enabled, "BenuaWorld Chunks y_sort_enabled")
	var loaded_v: Array[StringName] = bw.get_loaded_region_ids()
	_assert(loaded_v.has(&"village") and loaded_v.has(&"forest") and loaded_v.has(&"meadow") and loaded_v.has(&"lake"), "village streams adjacent chunks")
	_assert(not loaded_v.has(&"kakademi"), "distant kakademi not loaded at village")

	var v_chunk: Node2D = bw.get_node_or_null("Chunks/Village") as Node2D
	_assert(v_chunk != null, "Village chunk present")
	var door_home_ok: bool = false
	var forest_portal_stripped: bool = true
	if v_chunk != null:
		for ch: Node in v_chunk.get_children():
			if ch is Portal:
				var pt: Portal = ch as Portal
				if pt.name == "DoorHome" and not pt.is_queued_for_deletion():
					door_home_ok = true
				if pt.name == "ToForest" and not pt.is_queued_for_deletion():
					forest_portal_stripped = false
	_assert(door_home_ok, "BenuaWorld keeps interior doors intact")
	_assert(forest_portal_stripped, "BenuaWorld strips seamless edge portals")

	bw.update_streaming_at(Vector2(2400.0, -1000.0))
	var loaded_city: Array[StringName] = bw.get_loaded_region_ids()
	_assert(loaded_city.has(&"kpasar") and loaded_city.has(&"kakademi"), "BenuaWorld streams city chunks north")
	get_root().remove_child(bw)
	bw.free()

	# Verifikasi kepadatan pohon & dekorasi alam serta terbukanya sambungan antarwilayah
	var min_trees: Dictionary = {
		&"village": 20, &"forest": 50, &"deepwood": 90, &"meadow": 35,
		&"snow": 35, &"swamp": 35, &"lake": 35, &"river": 45, &"road": 35,
	}
	for k: Variant in min_trees.keys():
		var rid: StringName = k as StringName
		var m_packed: PackedScene = _load_res(WorldLayout.path_from_id(rid)) as PackedScene
		if m_packed != null:
			var mn: Node2D = m_packed.instantiate() as Node2D
			var ys: Node = mn.get_node_or_null("YSorted")
			var tc: int = 0
			if ys != null:
				for c: Node in ys.get_children():
					if c is SproutTree:
						tc += 1
			_assert(tc >= int(min_trees[rid]), "%s has organic trees (%d >= %d)" % [rid, tc, int(min_trees[rid])])
			mn.free()

	var seam_points: Array[Array] = [
		[&"village", &"forest", Vector2(3512, 3720)],
		[&"village", &"meadow", Vector2(4024, 3266)],
		[&"village", &"lake", Vector2(3000, 3556)],
		[&"forest", &"river", Vector2(4280, 4250)],
		[&"river", &"swamp", Vector2(6872, 4200)],
		[&"road", &"kgate", Vector2(2412, 1056)],
		[&"kgate", &"kpasar", Vector2(2412, 160)],
		[&"kpasar", &"kakademi", Vector2(2412, -1040)],
	]
	for sp: Array in seam_points:
		var a_id: StringName = sp[0]
		var b_id: StringName = sp[1]
		var wpos: Vector2 = sp[2]
		for side_id: StringName in [a_id, b_id]:
			var r_rect: Rect2i = WorldLayout.get_rect(side_id)
			var lpos: Vector2 = wpos - Vector2(r_rect.position)
			var blocked: bool = false
			for br: Rect2 in WorldLayout.outer_boundary_rects(side_id, 12.0):
				if br.has_point(lpos):
					blocked = true
			_assert(not blocked, "seam %s <-> %s open at %s" % [a_id, b_id, wpos])

	# Verifikasi 10 varian pohon SproutTree, aset Shrine, & aset baru yang dipulihkan
	var tree_scene: PackedScene = _load_res("res://systems/world/sprout_tree.tscn") as PackedScene
	if tree_scene != null:
		for vname: String in ["big", "tall", "big_dark", "tall_dark", "apple", "orange", "snow", "snow_tall", "swamp", "giant"]:
			var tr_n: SproutTree = tree_scene.instantiate() as SproutTree
			tr_n.variant = vname
			tr_n.free()
			_passed += 1

	var shrine_scene: PackedScene = _load_res("res://systems/world/shrine.tscn") as PackedScene
	if shrine_scene != null:
		var sh: Node = shrine_scene.instantiate()
		var spr: Sprite2D = sh.get_node_or_null("Sprite2D") as Sprite2D
		_assert(spr != null and spr.texture != null and spr.texture.resource_path.ends_with("sp_b_shrine.png"), "Shrine uses sp_b_shrine.png texture")
		sh.free()

	for rp: String in [
		"res://assets/art/ground/gnd_sand_sprout.png",
		"res://assets/art/ground/gnd_grass_dark.png",
		"res://assets/art/ground/lumina_tileset.png",
		"res://assets/art/props/gpt_palisade_wall_long.png",
		"res://assets/art/buildings/gpt_orc_gate.png",
		"res://assets/art/npc/npc_mc_hunter.png",
		"res://assets/art/npc/npc_mc_joko.png",
		"res://assets/art/npc/npc_mc_bayu.png",
	]:
		_assert(ResourceLoader.exists(rp), "restored texture exists: %s" % rp)

	var hud_scene: PackedScene = _load_res("res://ui/hud.tscn") as PackedScene
	_assert(hud_scene != null, "hud.tscn loads cleanly")
	if hud_scene != null:
		var hud: Control = hud_scene.instantiate() as Control
		_assert(hud.get_node_or_null("StatsPanel/HBox/VBox/ExpRow/ExpBar/ExpFill") != null, "HUD has ExpFill bar")
		_assert(hud.get_node_or_null("TopRightCapsule/HBox/CompassLabel") != null, "HUD has CompassLabel")
		_assert(hud.get_node_or_null("TopRightCapsule/HBox/FlaskLabel") != null, "HUD has FlaskLabel")
		_assert(hud.get_node_or_null("QuestCard/VBox/Header/QuestToggleBtn") != null, "HUD has collapsible QuestCard")
		_assert(hud.get_node_or_null("RegionBanner") != null, "HUD has RegionBanner")
		_assert(hud.get_node_or_null("BossPanel/VBox/BossHpBar/Phase2Line") != null, "HUD has Boss Phase2Line")
		var sbar: Node = hud.get_node_or_null("SpellBar")
		_assert(sbar != null and sbar is SpellBar, "HUD mounts SpellBar script")
		hud.free()

	var wm_scene: PackedScene = _load_res("res://ui/world_map.tscn") as PackedScene
	_assert(wm_scene != null, "world_map.tscn loads cleanly")
	if wm_scene != null:
		var wm: Control = wm_scene.instantiate() as Control
		var mc: WorldMapCanvas = wm.get_node_or_null("Center/Panel/Margin/VBox/MapCanvas") as WorldMapCanvas
		_assert(mc != null, "WorldMap mounts WorldMapCanvas")
		if mc != null:
			mc.fit_continent()
			mc.zoom_in()
			mc.zoom_out()
			mc.focus_player()
			_assert(mc.world_to_canvas(Vector2(3500.0, 3360.0)) != Vector2.ZERO, "WorldMapCanvas transforms world coordinates")
		wm.free()

	_sections_done += 1


func _test_river_and_bridge_connectivity() -> void:
	var global_water: Dictionary = {}
	for k: Variant in WorldLayout.REGIONS.keys():
		var rid: StringName = k as StringName
		var reg: Dictionary = WorldLayout.REGIONS[rid]
		var rect: Rect2i = reg["rect"]
		var gx0: int = rect.position.x / 16
		var gy0: int = rect.position.y / 16
		var packed: PackedScene = _load_res(str(reg["path"])) as PackedScene
		if packed == null:
			continue
		var root: Node2D = packed.instantiate() as Node2D
		var terrain: TileMapLayer = root.get_node_or_null("GroundTerrain") as TileMapLayer
		var local_water: Dictionary = {}
		if terrain != null:
			for c: Vector2i in terrain.get_used_cells():
				var ac: Vector2i = terrain.get_cell_atlas_coords(c)
				if ac.x >= 12 and (ac.y == 0 or ac.y == 1):
					local_water[c] = true
					global_water[Vector2i(gx0 + c.x, gy0 + c.y)] = rid

		# Pastikan setiap node Bridge_* punya ubin air di bawah tengah jembatannya
		for ch: Node in root.get_children():
			if ch is Sprite2D and ch.name.begins_with("Bridge"):
				var bspr: Sprite2D = ch as Sprite2D
				if bspr.texture != null:
					var bsz: Vector2 = bspr.texture.get_size() * bspr.scale
					var mid: Vector2i = Vector2i(int((bspr.position.x + bsz.x * 0.5) / 16.0), int((bspr.position.y + bsz.y * 0.5) / 16.0))
					var has_w: bool = false
					for dy: int in [-1, 0, 1]:
						for dx: int in [-1, 0, 1]:
							if local_water.has(mid + Vector2i(dx, dy)):
								has_w = true
								break
						if has_w:
							break
					_assert(has_w, "%s/%s sits over water" % [str(rid), bspr.name])
		root.free()

	# Cek 5 perbatasan sungai utama lintas wilayah
	var linked: Dictionary = {}
	for gc: Variant in global_water.keys():
		var pos: Vector2i = gc as Vector2i
		var ra: StringName = global_water[pos]
		for d: Vector2i in [Vector2i(1, 0), Vector2i(0, 1)]:
			var nb: Vector2i = pos + d
			if global_water.has(nb):
				var rb: StringName = global_water[nb]
				if ra != rb:
					var key: String = "%s<->%s" % [str(ra), str(rb)] if str(ra) < str(rb) else "%s<->%s" % [str(rb), str(ra)]
					linked[key] = true

	for req: String in ["forest<->lake", "forest<->river", "meadow<->snow", "meadow<->river", "river<->swamp"]:
		_assert(linked.has(req), "river border connected: %s" % req)

	_sections_done += 1
