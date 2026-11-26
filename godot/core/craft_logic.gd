class_name CraftLogic
extends RefCounted

const RECIPES: Array[Dictionary] = [
	{
		"id": &"potion",
		"name_key": "recipe_potion",
		"result_id": &"potion",
		"result_qty": 1,
		"ingredients": {"jelly": 3},
	},
	{
		"id": &"hi_potion",
		"name_key": "recipe_hi_potion",
		"result_id": &"hi_potion",
		"result_qty": 1,
		"ingredients": {"potion": 2, "honey": 2},
	},
	{
		"id": &"ether",
		"name_key": "recipe_ether",
		"result_id": &"ether",
		"result_qty": 1,
		"ingredients": {"shard": 2, "honey": 1},
	},
	{
		"id": &"grilled_fish",
		"name_key": "recipe_grilled_fish",
		"result_id": &"grilled_fish",
		"result_qty": 1,
		"ingredients": {"fish": 1, "honey": 1},
	},
	{
		"id": &"iron_sword",
		"name_key": "recipe_iron_sword",
		"result_id": &"iron_sword",
		"result_qty": 1,
		"ingredients": {"ore": 3, "tusk": 1},
	},
	{
		"id": &"steel_sword",
		"name_key": "recipe_steel_sword",
		"result_id": &"steel_sword",
		"result_qty": 1,
		"ingredients": {"ore": 4, "pelt": 2, "shard": 1},
	},
	{
		"id": &"crystal_sword",
		"name_key": "recipe_crystal_sword",
		"result_id": &"crystal_sword",
		"result_qty": 1,
		"ingredients": {"shard": 4, "ore": 3},
	},
	{
		"id": &"iron_chainmail",
		"name_key": "recipe_iron_chainmail",
		"result_id": &"iron_chainmail",
		"result_qty": 1,
		"ingredients": {"ore": 4, "pelt": 2},
	},
	{
		"id": &"stone_armor",
		"name_key": "recipe_stone_armor",
		"result_id": &"stone_armor",
		"result_qty": 1,
		"ingredients": {"ore": 5, "shard": 2},
	},
]


static func get_recipe(id: StringName) -> Dictionary:
	for r: Dictionary in RECIPES:
		if (r["id"] as StringName) == id:
			return r
	return {}


static func can_craft(inv: Dictionary, recipe: Dictionary) -> bool:
	if recipe.is_empty():
		return false
	var need: Dictionary = recipe.get("ingredients", {}) as Dictionary
	for k: Variant in need.keys():
		var item_id: StringName = StringName(str(k))
		var req_qty: int = int(need[k])
		if InventoryLogic.count_item(inv, item_id) < req_qty:
			return false
	return true


static func consume_ingredients(inv: Dictionary, recipe: Dictionary) -> bool:
	if not can_craft(inv, recipe):
		return false
	var need: Dictionary = recipe.get("ingredients", {}) as Dictionary
	for k: Variant in need.keys():
		var item_id: StringName = StringName(str(k))
		var req_qty: int = int(need[k])
		if not InventoryLogic.remove_item(inv, item_id, req_qty):
			return false
	return true
