class_name SkillDatabase
extends RefCounted

const SKILLS: Array[Dictionary] = [
	{
		"id": &"fire",
		"name_key": "skill_fire",
		"desc_key": "skill_fire_desc",
		"where_key": "skill_fire_where",
		"mp_cost": 3,
		"base_power": 1.9,
		"radius": 0.0,
		"color": Color(1.0, 0.56, 0.16),
	},
	{
		"id": &"venom",
		"name_key": "skill_venom",
		"desc_key": "skill_venom_desc",
		"where_key": "skill_venom_where",
		"mp_cost": 6,
		"base_power": 1.45,
		"radius": 62.0,
		"color": Color(0.54, 0.92, 0.42),
	},
	{
		"id": &"nova",
		"name_key": "skill_nova",
		"desc_key": "skill_nova_desc",
		"where_key": "skill_nova_where",
		"mp_cost": 8,
		"base_power": 1.75,
		"radius": 72.0,
		"color": Color(0.55, 0.88, 1.0),
	},
	{
		"id": &"heal",
		"name_key": "skill_heal",
		"desc_key": "skill_heal_desc",
		"where_key": "skill_heal_where",
		"mp_cost": 8,
		"base_power": 2.4,
		"radius": 44.0,
		"color": Color(0.95, 0.94, 0.58),
	},
	{
		"id": &"holy",
		"name_key": "skill_holy",
		"desc_key": "skill_holy_desc",
		"where_key": "skill_holy_where",
		"mp_cost": 10,
		"base_power": 2.1,
		"radius": 84.0,
		"color": Color(1.0, 0.96, 0.62),
	},
]


static func all_ids() -> Array[StringName]:
	var out: Array[StringName] = []
	for entry: Dictionary in SKILLS:
		out.append(entry["id"] as StringName)
	return out


static func get_skill(id: StringName) -> Dictionary:
	for entry: Dictionary in SKILLS:
		if (entry["id"] as StringName) == id:
			return entry
	return {}


static func tier_for_uses(uses: int) -> int:
	if uses >= 25:
		return 3
	if uses >= 10:
		return 2
	return 1


static func tier_multiplier(tier: int) -> float:
	if tier >= 3:
		return 1.35
	if tier == 2:
		return 1.18
	return 1.0
