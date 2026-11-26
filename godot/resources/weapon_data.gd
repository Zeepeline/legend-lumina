class_name WeaponData
extends Resource

@export var id: StringName = &"starter_sword"
@export var name_key: String = "wpn_starter_sword_name"
@export var description_key: String = "wpn_starter_sword_desc"
@export var weapon_type: String = "sword"
@export var damage_bonus: int = 6
@export var magic_bonus: int = 0
@export var damage_mult: float = 1.0
@export_range(0.0, 1.0) var crit_chance: float = 0.10
@export var stamina_cost: float = 7.0
@export var knockback: float = 135.0
@export var cooldown: float = 0.32
@export var hitbox_radius: float = 16.0
@export var hitbox_reach: float = 18.0
@export var price: int = 0
@export var sell_price: int = 0
