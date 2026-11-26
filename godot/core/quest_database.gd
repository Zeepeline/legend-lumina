class_name QuestDatabase
extends RefCounted

const QUESTS: Array[Dictionary] = [
	{
		"id": &"q_forest_bandits",
		"name_key": "q_forest_bandits",
		"desc_key": "q_forest_bandits_desc",
		"kind": "flag_any",
		"keys": ["mb_goblin", "boss_goblin_king"],
		"reward_gold": 80,
		"reward_exp": 60,
	},
	{
		"id": &"q_stone_cave",
		"name_key": "q_stone_cave",
		"desc_key": "q_stone_cave_desc",
		"kind": "flag_any",
		"keys": ["boss_golemk"],
		"reward_gold": 110,
		"reward_exp": 85,
	},
	{
		"id": &"q_swamp_shadow",
		"name_key": "q_swamp_shadow",
		"desc_key": "q_swamp_shadow_desc",
		"kind": "flag_any",
		"keys": ["boss_witch"],
		"reward_gold": 140,
		"reward_exp": 110,
	},
	{
		"id": &"q_frozen_peak",
		"name_key": "q_frozen_peak",
		"desc_key": "q_frozen_peak_desc",
		"kind": "flag_any",
		"keys": ["boss_kryos"],
		"reward_gold": 200,
		"reward_exp": 160,
	},
	{
		"id": &"q_city_lumina",
		"name_key": "q_city_lumina",
		"desc_key": "q_city_lumina_desc",
		"kind": "visited_any",
		"keys": ["res://maps/kgate.tscn", "res://maps/kpasar.tscn"],
		"reward_gold": 90,
		"reward_exp": 70,
	},
	{
		"id": &"sq_shrines",
		"name_key": "sq_shrines",
		"desc_key": "sq_shrines_desc",
		"kind": "count",
		"stat": "shrine_count",
		"target": 5,
		"reward_gold": 100,
		"reward_exp": 75,
	},
	{
		"id": &"sq_goblin_king",
		"name_key": "sq_goblin_king",
		"desc_key": "sq_goblin_king_desc",
		"kind": "flag_all",
		"keys": ["boss_goblin_king", "boss_squeen"],
		"reward_gold": 150,
		"reward_exp": 120,
	},
	{
		"id": &"sq_snake_river",
		"name_key": "sq_snake_river",
		"desc_key": "sq_snake_river_desc",
		"kind": "flag_any",
		"keys": ["boss_gsnake"],
		"reward_gold": 120,
		"reward_exp": 90,
	},
	{
		"id": &"sq_master_skills",
		"name_key": "sq_master_skills",
		"desc_key": "sq_master_skills_desc",
		"kind": "count",
		"stat": "skill_count",
		"target": 3,
		"reward_gold": 130,
		"reward_exp": 95,
	},
]

const ACHIEVEMENTS: Array[Dictionary] = [
	{
		"id": &"ach_kills_10",
		"name_key": "ach_kills_10",
		"desc_key": "ach_kills_10_desc",
		"kind": "count",
		"stat": "kill_count",
		"target": 10,
	},
	{
		"id": &"ach_kills_50",
		"name_key": "ach_kills_50",
		"desc_key": "ach_kills_50_desc",
		"kind": "count",
		"stat": "kill_count",
		"target": 50,
	},
	{
		"id": &"ach_explore_8",
		"name_key": "ach_explore_8",
		"desc_key": "ach_explore_8_desc",
		"kind": "count",
		"stat": "visited_count",
		"target": 8,
	},
	{
		"id": &"ach_boss_3",
		"name_key": "ach_boss_3",
		"desc_key": "ach_boss_3_desc",
		"kind": "count",
		"stat": "boss_count",
		"target": 3,
	},
	{
		"id": &"ach_craft_3",
		"name_key": "ach_craft_3",
		"desc_key": "ach_craft_3_desc",
		"kind": "count",
		"stat": "craft_count",
		"target": 3,
	},
	{
		"id": &"ach_city_all",
		"name_key": "ach_city_all",
		"desc_key": "ach_city_all_desc",
		"kind": "visited_all",
		"keys": [
			"res://maps/kgate.tscn",
			"res://maps/kpasar.tscn",
			"res://maps/kpermukiman.tscn",
			"res://maps/kakademi.tscn",
			"res://maps/kbawah.tscn",
		],
	},
]


static func get_quest(id: StringName) -> Dictionary:
	for q: Dictionary in QUESTS:
		if (q["id"] as StringName) == id:
			return q
	return {}


static func is_completed(entry: Dictionary, snapshot: Dictionary) -> bool:
	var kind: String = String(entry.get("kind", ""))
	var flags: Dictionary = snapshot.get("flags", {}) as Dictionary
	var visited: Array = snapshot.get("visited_maps", []) as Array
	var shrines: Array = snapshot.get("unlocked_shrines", []) as Array
	var skills: Array = snapshot.get("learned_skills", []) as Array

	if kind == "flag_any":
		var keys: Array = entry.get("keys", []) as Array
		for k: Variant in keys:
			if bool(flags.get(str(k), false)):
				return true
		return false
	if kind == "flag_all":
		var keys: Array = entry.get("keys", []) as Array
		for k: Variant in keys:
			if not bool(flags.get(str(k), false)):
				return false
		return true
	if kind == "visited_any":
		var keys: Array = entry.get("keys", []) as Array
		for k: Variant in keys:
			if visited.has(str(k)):
				return true
		return false
	if kind == "visited_all":
		var keys: Array = entry.get("keys", []) as Array
		for k: Variant in keys:
			if not visited.has(str(k)):
				return false
		return true
	if kind == "count":
		var stat: String = String(entry.get("stat", ""))
		var target: int = int(entry.get("target", 1))
		var cur: int = 0
		if stat == "shrine_count":
			cur = shrines.size()
		elif stat == "skill_count":
			cur = skills.size()
		elif stat == "visited_count":
			cur = visited.size()
		elif stat == "boss_count":
			for k: Variant in flags.keys():
				if str(k).begins_with("boss_") or str(k).begins_with("mb_"):
					if bool(flags[k]):
						cur += 1
		else:
			cur = int(snapshot.get(stat, 0))
		return cur >= target
	return false
