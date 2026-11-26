class_name GameStateStore
extends Node

static var ref: GameStateStore = null

const DEFAULT_MAP: String = "res://maps/village.tscn"
const DEFAULT_SPAWN: StringName = &"default"
const AVAILABLE_SKINS: Array[StringName] = [&"mc2_slave", &"mc2"]

var hp: int = 100
var max_hp: int = 100
var mp: int = 30
var max_mp: int = 30
var stamina: float = 100.0
var max_stamina: float = 100.0
var flask_charges: int = 3
var flask_max: int = 3
var level: int = 1
var exp: int = 0
var gold: int = 40
var attack: int = 10
var defense: int = 4
var magic: int = 8
var equipped_weapon_id: StringName = &"starter_sword"
var equipped_armor_id: StringName = &"cloth_tunic"
var owned_weapons: Array[StringName] = [&"starter_sword"]
var owned_armors: Array[StringName] = [&"cloth_tunic"]
var skin_id: StringName = &"mc2_slave"
var relaxed_mode: bool = false
var current_map: String = DEFAULT_MAP
var spawn_id: StringName = DEFAULT_SPAWN
var visited_maps: Array[String] = [DEFAULT_MAP]
var unlocked_shrines: Array[String] = [DEFAULT_MAP]
var learned_skills: Array[StringName] = [&"fire"]
var active_skill_id: StringName = &"fire"
var skill_uses: Dictionary = {}
var claimed_quests: Array[StringName] = []
var kill_count: int = 0
var craft_count: int = 0
var fish_count: int = 0
var music_volume: float = 0.75
var sfx_volume: float = 0.85
var world_hour: float = 9.0
var is_indoor: bool = false
var is_dark_cave: bool = false
var flags: Dictionary = {}
var inventory: Dictionary = {"potion": 2, "ether": 1}
var play_time_sec: float = 0.0
var touch_controls_override: int = -1

var _hour_emit_accum: float = 0.0


func _enter_tree() -> void:
	ref = self


func _ready() -> void:
	set_process(true)


func _process(delta: float) -> void:
	if not get_tree().paused:
		play_time_sec += delta
		if not is_indoor and not is_dark_cave:
			world_hour = fmod(world_hour + delta / 25.0, 24.0)
			_hour_emit_accum += delta
			if _hour_emit_accum >= 0.4:
				_hour_emit_accum = 0.0
				if EventsBus.ref != null:
					EventsBus.ref.time_of_day_changed.emit(world_hour)


func _emit_stats() -> void:
	if EventsBus.ref != null:
		EventsBus.ref.player_stats_changed.emit()


func _emit_inventory() -> void:
	if EventsBus.ref != null:
		EventsBus.ref.inventory_changed.emit()


func total_max_hp() -> int:
	var arm: ArmorData = ItemDatabase.get_armor(equipped_armor_id)
	return max_hp + arm.max_hp_bonus


func total_attack() -> int:
	var wpn: WeaponData = ItemDatabase.get_weapon(equipped_weapon_id)
	return attack + wpn.damage_bonus


func total_defense() -> int:
	var arm: ArmorData = ItemDatabase.get_armor(equipped_armor_id)
	return defense + arm.defense_bonus


func total_magic() -> int:
	var wpn: WeaponData = ItemDatabase.get_weapon(equipped_weapon_id)
	return magic + wpn.magic_bonus


func reset() -> void:
	max_hp = 100
	hp = max_hp
	max_mp = 30
	mp = max_mp
	max_stamina = 100.0
	stamina = max_stamina
	flask_max = 3
	flask_charges = flask_max
	level = 1
	exp = 0
	gold = 40
	attack = 10
	defense = 4
	magic = 8
	equipped_weapon_id = &"starter_sword"
	equipped_armor_id = &"cloth_tunic"
	owned_weapons = [&"starter_sword"]
	owned_armors = [&"cloth_tunic"]
	skin_id = &"mc2_slave"
	relaxed_mode = false
	current_map = DEFAULT_MAP
	spawn_id = DEFAULT_SPAWN
	visited_maps = [DEFAULT_MAP]
	unlocked_shrines = [DEFAULT_MAP]
	learned_skills = [&"fire"]
	active_skill_id = &"fire"
	skill_uses = {}
	claimed_quests = []
	kill_count = 0
	craft_count = 0
	fish_count = 0
	music_volume = 0.75
	sfx_volume = 0.85
	world_hour = 9.0
	is_indoor = false
	is_dark_cave = false
	flags = {}
	inventory = {"potion": 2, "ether": 1}
	play_time_sec = 0.0
	_emit_stats()
	_emit_inventory()
	if EventsBus.ref != null:
		EventsBus.ref.skill_changed.emit(active_skill_id)
		EventsBus.ref.quest_updated.emit()


func set_flag(flag: StringName, value: Variant = true) -> void:
	flags[String(flag)] = value
	if EventsBus.ref != null:
		EventsBus.ref.quest_updated.emit()


func get_flag(flag: StringName, default_val: Variant = false) -> Variant:
	return flags.get(String(flag), default_val)


func damage_player(amount: int) -> int:
	var dmg: int = maxi(1, amount)
	hp = maxi(0, hp - dmg)
	_emit_stats()
	return dmg


func heal_player(amount: int) -> int:
	var prev: int = hp
	var cap: int = total_max_hp()
	hp = mini(cap, hp + maxi(0, amount))
	var gained: int = hp - prev
	if gained > 0:
		_emit_stats()
	return gained


func spend_mp(cost: int) -> bool:
	if mp < cost:
		return false
	mp -= cost
	_emit_stats()
	return true


func restore_mp(amount: int) -> int:
	var prev: int = mp
	mp = mini(max_mp, mp + maxi(0, amount))
	var gained: int = mp - prev
	if gained > 0:
		_emit_stats()
	return gained


func use_flask() -> int:
	var cap: int = total_max_hp()
	if flask_charges <= 0 or hp >= cap:
		return 0
	flask_charges -= 1
	var amount: int = CombatMath.compute_flask_heal(cap)
	var gained: int = heal_player(amount)
	_emit_stats()
	return gained


func refill_flask() -> void:
	flask_charges = flask_max
	hp = total_max_hp()
	mp = max_mp
	stamina = max_stamina
	_emit_stats()


func advance_to_morning() -> void:
	refill_flask()
	world_hour = 7.0
	if EventsBus.ref != null:
		EventsBus.ref.time_of_day_changed.emit(world_hour)


func spend_stamina(base_cost: float) -> bool:
	if stamina <= 0.0:
		return false
	var cost: float = CombatMath.stamina_cost(base_cost, relaxed_mode)
	stamina = maxf(0.0, stamina - cost)
	_emit_stats()
	return true


func regen_stamina(delta: float, multiplier: float = 1.0) -> void:
	if stamina >= max_stamina:
		return
	stamina = minf(max_stamina, stamina + CombatMath.STAMINA_REGEN_PER_SEC * multiplier * delta)
	_emit_stats()


func grant_rewards(exp_amt: int, gold_amt: int) -> int:
	gold = maxi(0, gold + maxi(0, gold_amt))
	var res: Dictionary = CombatMath.apply_exp(level, exp, exp_amt)
	var new_level: int = res["level"]
	var levels_gained: int = res["levels_gained"]
	level = new_level
	exp = res["exp"]
	if levels_gained > 0:
		max_hp += levels_gained * 12
		max_mp += levels_gained * 4
		max_stamina += float(levels_gained * 5)
		attack += levels_gained * 2
		defense += levels_gained
		magic += levels_gained
		hp = total_max_hp()
		mp = max_mp
		stamina = max_stamina
	_emit_stats()
	return levels_gained


func respawn_after_defeat() -> void:
	gold = int(gold * 0.7)
	refill_flask()
	current_map = DEFAULT_MAP
	spawn_id = DEFAULT_SPAWN
	_emit_stats()


func add_item(id: StringName, qty: int = 1) -> void:
	if ItemDatabase.has_weapon(id):
		if not owned_weapons.has(id):
			owned_weapons.append(id)
		_emit_inventory()
		return
	if ItemDatabase.has_armor(id):
		if not owned_armors.has(id):
			owned_armors.append(id)
		_emit_inventory()
		return
	InventoryLogic.add_item(inventory, id, qty)
	_emit_inventory()


func use_item(id: StringName) -> bool:
	var item: ItemData = ItemDatabase.get_item(id)
	if item == null or item.category != "consumable":
		return false
	if InventoryLogic.count_item(inventory, id) <= 0:
		return false
	var need_hp: bool = item.heal_amount > 0 and hp < total_max_hp()
	var need_mp: bool = item.mp_amount > 0 and mp < max_mp
	if not need_hp and not need_mp:
		return false
	if not InventoryLogic.remove_item(inventory, id, 1):
		return false
	if item.heal_amount > 0:
		heal_player(item.heal_amount)
	if item.mp_amount > 0:
		restore_mp(item.mp_amount)
	_emit_inventory()
	return true


func equip_weapon(id: StringName) -> bool:
	if not owned_weapons.has(id) or not ItemDatabase.has_weapon(id):
		return false
	equipped_weapon_id = id
	_emit_stats()
	_emit_inventory()
	return true


func equip_armor(id: StringName) -> bool:
	if not owned_armors.has(id) or not ItemDatabase.has_armor(id):
		return false
	equipped_armor_id = id
	hp = mini(hp, total_max_hp())
	_emit_stats()
	_emit_inventory()
	return true


func buy_entry(id: StringName) -> bool:
	var price: int = ItemDatabase.buy_price(id)
	if price <= 0 or gold < price:
		return false
	if ItemDatabase.has_weapon(id):
		if owned_weapons.has(id):
			return false
		gold -= price
		owned_weapons.append(id)
		_emit_stats()
		_emit_inventory()
		return true
	if ItemDatabase.has_armor(id):
		if owned_armors.has(id):
			return false
		gold -= price
		owned_armors.append(id)
		_emit_stats()
		_emit_inventory()
		return true
	var res: Dictionary = InventoryLogic.buy_item(gold, inventory, price, id, 1)
	if not bool(res["ok"]):
		return false
	gold = int(res["gold"])
	_emit_stats()
	_emit_inventory()
	return true


func sell_entry(id: StringName) -> bool:
	var sprice: int = ItemDatabase.sell_price(id)
	if sprice <= 0:
		return false
	var res: Dictionary = InventoryLogic.sell_item(gold, inventory, sprice, id, 1)
	if not bool(res["ok"]):
		return false
	gold = int(res["gold"])
	_emit_stats()
	_emit_inventory()
	return true


func mark_map_visited(path: String) -> void:
	if not path.is_empty() and not visited_maps.has(path):
		visited_maps.append(path)
		if EventsBus.ref != null:
			EventsBus.ref.quest_updated.emit()


func unlock_shrine(path: String) -> void:
	if not path.is_empty() and not unlocked_shrines.has(path):
		unlocked_shrines.append(path)
		if EventsBus.ref != null:
			EventsBus.ref.quest_updated.emit()


func learn_skill(id: StringName, cost_gold: int = 0) -> bool:
	if SkillDatabase.get_skill(id).is_empty():
		return false
	if learned_skills.has(id):
		return false
	if cost_gold > 0 and gold < cost_gold:
		return false
	gold -= cost_gold
	learned_skills.append(id)
	if active_skill_id == &"" or not learned_skills.has(active_skill_id):
		active_skill_id = id
	_emit_stats()
	if EventsBus.ref != null:
		EventsBus.ref.skill_changed.emit(active_skill_id)
		EventsBus.ref.quest_updated.emit()
	return true


func set_active_skill(id: StringName) -> bool:
	if not learned_skills.has(id):
		return false
	active_skill_id = id
	if EventsBus.ref != null:
		EventsBus.ref.skill_changed.emit(active_skill_id)
	return true


func cycle_active_skill() -> StringName:
	if learned_skills.is_empty():
		return &""
	var idx: int = learned_skills.find(active_skill_id)
	var next_idx: int = (idx + 1) % learned_skills.size()
	active_skill_id = learned_skills[next_idx]
	if EventsBus.ref != null:
		EventsBus.ref.skill_changed.emit(active_skill_id)
	return active_skill_id


func skill_tier(id: StringName) -> int:
	return SkillDatabase.tier_for_uses(int(skill_uses.get(String(id), 0)))


func record_skill_use(id: StringName) -> int:
	var old_tier: int = skill_tier(id)
	var uses: int = int(skill_uses.get(String(id), 0)) + 1
	skill_uses[String(id)] = uses
	var new_tier: int = SkillDatabase.tier_for_uses(uses)
	if new_tier > old_tier and EventsBus.ref != null:
		var sk: Dictionary = SkillDatabase.get_skill(id)
		if not sk.is_empty():
			var sname: String = TranslationServer.translate(String(sk["name_key"]))
			EventsBus.ref.notification_requested.emit(TranslationServer.translate("msg_skill_tier") % [sname, new_tier])
	if EventsBus.ref != null:
		EventsBus.ref.skill_changed.emit(active_skill_id)
	return new_tier


func record_kill() -> void:
	kill_count += 1
	if EventsBus.ref != null:
		EventsBus.ref.quest_updated.emit()


func record_fish() -> void:
	fish_count += 1
	if EventsBus.ref != null:
		EventsBus.ref.quest_updated.emit()


func craft_recipe(recipe_id: StringName) -> bool:
	var recipe: Dictionary = CraftLogic.get_recipe(recipe_id)
	if recipe.is_empty():
		return false
	var res_id: StringName = recipe["result_id"] as StringName
	if ItemDatabase.has_weapon(res_id) and owned_weapons.has(res_id):
		return false
	if ItemDatabase.has_armor(res_id) and owned_armors.has(res_id):
		return false
	if not CraftLogic.consume_ingredients(inventory, recipe):
		return false
	var qty: int = int(recipe.get("result_qty", 1))
	add_item(res_id, qty)
	craft_count += 1
	_emit_stats()
	if EventsBus.ref != null:
		EventsBus.ref.quest_updated.emit()
	return true


func quest_snapshot() -> Dictionary:
	var sk_strs: Array[String] = []
	for s: StringName in learned_skills:
		sk_strs.append(String(s))
	return {
		"flags": flags,
		"visited_maps": visited_maps,
		"unlocked_shrines": unlocked_shrines,
		"learned_skills": sk_strs,
		"kill_count": kill_count,
		"craft_count": craft_count,
		"fish_count": fish_count,
	}


func claim_quest(id: StringName) -> bool:
	if claimed_quests.has(id):
		return false
	var q: Dictionary = QuestDatabase.get_quest(id)
	if q.is_empty():
		return false
	if not QuestDatabase.is_completed(q, quest_snapshot()):
		return false
	claimed_quests.append(id)
	grant_rewards(int(q.get("reward_exp", 0)), int(q.get("reward_gold", 0)))
	if EventsBus.ref != null:
		EventsBus.ref.quest_updated.emit()
	return true


func set_music_volume(val: float) -> void:
	music_volume = clampf(val, 0.0, 1.0)
	if AudioService.ref != null:
		AudioService.ref.set_bus_volume(&"Music", music_volume)


func set_sfx_volume(val: float) -> void:
	sfx_volume = clampf(val, 0.0, 1.0)
	if AudioService.ref != null:
		AudioService.ref.set_bus_volume(&"SFX", sfx_volume)


func toggle_skin() -> StringName:
	var idx: int = AVAILABLE_SKINS.find(skin_id)
	var next_idx: int = (idx + 1) % AVAILABLE_SKINS.size()
	skin_id = AVAILABLE_SKINS[next_idx]
	if EventsBus.ref != null:
		EventsBus.ref.skin_changed.emit(skin_id)
	return skin_id


func toggle_relaxed_mode() -> bool:
	relaxed_mode = not relaxed_mode
	_emit_stats()
	return relaxed_mode


func is_touch_enabled() -> bool:
	if touch_controls_override == 1:
		return true
	if touch_controls_override == 0:
		return false
	return DisplayServer.is_touchscreen_available()


func toggle_touch_controls() -> bool:
	var next_enabled: bool = not is_touch_enabled()
	touch_controls_override = 1 if next_enabled else 0
	if EventsBus.ref != null:
		EventsBus.ref.touch_controls_toggled.emit(next_enabled)
	return next_enabled


func to_dict() -> Dictionary:
	var wpn_strs: Array[String] = []
	for w: StringName in owned_weapons:
		wpn_strs.append(String(w))
	var arm_strs: Array[String] = []
	for a: StringName in owned_armors:
		arm_strs.append(String(a))
	var sk_strs: Array[String] = []
	for s: StringName in learned_skills:
		sk_strs.append(String(s))
	var cq_strs: Array[String] = []
	for c: StringName in claimed_quests:
		cq_strs.append(String(c))
	return {
		"hp": hp,
		"max_hp": max_hp,
		"mp": mp,
		"max_mp": max_mp,
		"stamina": stamina,
		"max_stamina": max_stamina,
		"flask_charges": flask_charges,
		"flask_max": flask_max,
		"level": level,
		"exp": exp,
		"gold": gold,
		"attack": attack,
		"defense": defense,
		"magic": magic,
		"equipped_weapon_id": String(equipped_weapon_id),
		"equipped_armor_id": String(equipped_armor_id),
		"owned_weapons": wpn_strs,
		"owned_armors": arm_strs,
		"skin_id": String(skin_id),
		"relaxed_mode": relaxed_mode,
		"current_map": current_map,
		"spawn_id": String(spawn_id),
		"visited_maps": visited_maps.duplicate(),
		"unlocked_shrines": unlocked_shrines.duplicate(),
		"learned_skills": sk_strs,
		"active_skill_id": String(active_skill_id),
		"skill_uses": skill_uses.duplicate(true),
		"claimed_quests": cq_strs,
		"kill_count": kill_count,
		"craft_count": craft_count,
		"fish_count": fish_count,
		"music_volume": music_volume,
		"sfx_volume": sfx_volume,
		"world_hour": world_hour,
		"flags": flags.duplicate(true),
		"inventory": inventory.duplicate(true),
		"play_time_sec": play_time_sec,
		"touch_controls_override": touch_controls_override,
	}


func from_dict(d: Dictionary) -> void:
	max_hp = maxi(20, int(d.get("max_hp", 100)))
	max_mp = maxi(10, int(d.get("max_mp", 30)))
	mp = clampi(int(d.get("mp", max_mp)), 0, max_mp)
	max_stamina = maxf(20.0, float(d.get("max_stamina", 100.0)))
	stamina = clampf(float(d.get("stamina", max_stamina)), 0.0, max_stamina)
	flask_max = maxi(1, int(d.get("flask_max", 3)))
	flask_charges = clampi(int(d.get("flask_charges", flask_max)), 0, flask_max)
	level = maxi(1, int(d.get("level", 1)))
	exp = maxi(0, int(d.get("exp", 0)))
	gold = maxi(0, int(d.get("gold", 0)))
	attack = maxi(1, int(d.get("attack", 10)))
	defense = maxi(0, int(d.get("defense", 4)))
	magic = maxi(1, int(d.get("magic", 8)))

	var eq_w: StringName = StringName(str(d.get("equipped_weapon_id", "starter_sword")))
	equipped_weapon_id = eq_w if ItemDatabase.has_weapon(eq_w) else &"starter_sword"
	var eq_a: StringName = StringName(str(d.get("equipped_armor_id", "cloth_tunic")))
	equipped_armor_id = eq_a if ItemDatabase.has_armor(eq_a) else &"cloth_tunic"

	owned_weapons = []
	var ow_var: Variant = d.get("owned_weapons", ["starter_sword"])
	if ow_var is Array:
		for item_v: Variant in ow_var:
			var sn: StringName = StringName(str(item_v))
			if ItemDatabase.has_weapon(sn) and not owned_weapons.has(sn):
				owned_weapons.append(sn)
	if not owned_weapons.has(equipped_weapon_id):
		owned_weapons.append(equipped_weapon_id)

	owned_armors = []
	var oa_var: Variant = d.get("owned_armors", ["cloth_tunic"])
	if oa_var is Array:
		for item_v: Variant in oa_var:
			var sn: StringName = StringName(str(item_v))
			if ItemDatabase.has_armor(sn) and not owned_armors.has(sn):
				owned_armors.append(sn)
	if not owned_armors.has(equipped_armor_id):
		owned_armors.append(equipped_armor_id)

	hp = clampi(int(d.get("hp", max_hp)), 1, total_max_hp())

	var loaded_skin: StringName = StringName(str(d.get("skin_id", "mc2_slave")))
	skin_id = loaded_skin if AVAILABLE_SKINS.has(loaded_skin) else &"mc2_slave"
	relaxed_mode = bool(d.get("relaxed_mode", false))
	var map_path: String = str(d.get("current_map", DEFAULT_MAP))
	current_map = map_path if ResourceLoader.exists(map_path) else DEFAULT_MAP
	spawn_id = StringName(str(d.get("spawn_id", "default")))

	visited_maps = [DEFAULT_MAP]
	var vm_var: Variant = d.get("visited_maps", [DEFAULT_MAP])
	if vm_var is Array:
		for v_str: Variant in vm_var:
			var s: String = str(v_str)
			if not visited_maps.has(s):
				visited_maps.append(s)

	unlocked_shrines = [DEFAULT_MAP]
	var us_var: Variant = d.get("unlocked_shrines", [DEFAULT_MAP])
	if us_var is Array:
		for u_str: Variant in us_var:
			var s: String = str(u_str)
			if not unlocked_shrines.has(s):
				unlocked_shrines.append(s)

	learned_skills = [&"fire"]
	var ls_var: Variant = d.get("learned_skills", ["fire"])
	if ls_var is Array:
		for sk_v: Variant in ls_var:
			var sk_sn: StringName = StringName(str(sk_v))
			if not SkillDatabase.get_skill(sk_sn).is_empty() and not learned_skills.has(sk_sn):
				learned_skills.append(sk_sn)
	var act_sk: StringName = StringName(str(d.get("active_skill_id", "fire")))
	active_skill_id = act_sk if learned_skills.has(act_sk) else learned_skills[0]

	var su_var: Variant = d.get("skill_uses", {})
	skill_uses = su_var.duplicate(true) if su_var is Dictionary else {}

	claimed_quests = []
	var cq_var: Variant = d.get("claimed_quests", [])
	if cq_var is Array:
		for q_v: Variant in cq_var:
			var q_sn: StringName = StringName(str(q_v))
			if not claimed_quests.has(q_sn):
				claimed_quests.append(q_sn)

	kill_count = maxi(0, int(d.get("kill_count", 0)))
	craft_count = maxi(0, int(d.get("craft_count", 0)))
	fish_count = maxi(0, int(d.get("fish_count", 0)))
	set_music_volume(float(d.get("music_volume", 0.75)))
	set_sfx_volume(float(d.get("sfx_volume", 0.85)))

	world_hour = clampf(float(d.get("world_hour", 9.0)), 0.0, 23.99)
	var loaded_flags: Variant = d.get("flags", {})
	flags = loaded_flags.duplicate(true) if loaded_flags is Dictionary else {}
	var loaded_inv: Variant = d.get("inventory", {"potion": 2, "ether": 1})
	inventory = loaded_inv.duplicate(true) if loaded_inv is Dictionary else {"potion": 2}
	play_time_sec = maxf(0.0, float(d.get("play_time_sec", 0.0)))
	touch_controls_override = clampi(int(d.get("touch_controls_override", -1)), -1, 1)
	_emit_stats()
	_emit_inventory()
	if EventsBus.ref != null:
		EventsBus.ref.skin_changed.emit(skin_id)
		EventsBus.ref.touch_controls_toggled.emit(is_touch_enabled())
		EventsBus.ref.time_of_day_changed.emit(world_hour)
		EventsBus.ref.skill_changed.emit(active_skill_id)
		EventsBus.ref.quest_updated.emit()
