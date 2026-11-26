class_name ItemDatabase
extends RefCounted

const WEAPONS: Array[WeaponData] = [
	preload("res://data/weapons/starter_sword.tres"),
	preload("res://data/weapons/iron_sword.tres"),
	preload("res://data/weapons/steel_sword.tres"),
	preload("res://data/weapons/crystal_sword.tres"),
	preload("res://data/weapons/iron_spear.tres"),
	preload("res://data/weapons/battle_axe.tres"),
]

const ARMORS: Array[ArmorData] = [
	preload("res://data/armors/cloth_tunic.tres"),
	preload("res://data/armors/leather_vest.tres"),
	preload("res://data/armors/iron_chainmail.tres"),
	preload("res://data/armors/stone_armor.tres"),
]

const ITEMS: Array[ItemData] = [
	preload("res://data/items/potion.tres"),
	preload("res://data/items/hi_potion.tres"),
	preload("res://data/items/ether.tres"),
	preload("res://data/items/bread_mila.tres"),
	preload("res://data/items/honey.tres"),
	preload("res://data/items/jelly.tres"),
	preload("res://data/items/pelt.tres"),
	preload("res://data/items/tusk.tres"),
	preload("res://data/items/ore.tres"),
	preload("res://data/items/shard.tres"),
	preload("res://data/items/fish.tres"),
	preload("res://data/items/grilled_fish.tres"),
]


static func get_weapon(id: StringName) -> WeaponData:
	for w: WeaponData in WEAPONS:
		if w.id == id:
			return w
	return WEAPONS[0]


static func has_weapon(id: StringName) -> bool:
	for w: WeaponData in WEAPONS:
		if w.id == id:
			return true
	return false


static func get_armor(id: StringName) -> ArmorData:
	for a: ArmorData in ARMORS:
		if a.id == id:
			return a
	return ARMORS[0]


static func has_armor(id: StringName) -> bool:
	for a: ArmorData in ARMORS:
		if a.id == id:
			return true
	return false


static func get_item(id: StringName) -> ItemData:
	for it: ItemData in ITEMS:
		if it.id == id:
			return it
	return null


static func entry_kind(id: StringName) -> String:
	if has_weapon(id):
		return "weapon"
	if has_armor(id):
		return "armor"
	if get_item(id) != null:
		return "item"
	return ""


static func display_name(id: StringName) -> String:
	var w: WeaponData = null
	for w_cand: WeaponData in WEAPONS:
		if w_cand.id == id:
			w = w_cand
			break
	if w != null:
		return TranslationServer.translate(w.name_key)
	for a: ArmorData in ARMORS:
		if a.id == id:
			return TranslationServer.translate(a.name_key)
	var it: ItemData = get_item(id)
	if it != null:
		return TranslationServer.translate(it.name_key)
	return String(id)


static func buy_price(id: StringName) -> int:
	for w: WeaponData in WEAPONS:
		if w.id == id:
			return w.price
	for a: ArmorData in ARMORS:
		if a.id == id:
			return a.price
	var it: ItemData = get_item(id)
	return it.price if it != null else 0


static func sell_price(id: StringName) -> int:
	for w: WeaponData in WEAPONS:
		if w.id == id:
			return w.sell_price
	for a: ArmorData in ARMORS:
		if a.id == id:
			return a.sell_price
	var it: ItemData = get_item(id)
	return it.sell_price if it != null else 0
