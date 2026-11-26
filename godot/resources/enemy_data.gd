class_name EnemyData
extends Resource

@export var id: StringName = &""
@export var name_key: String = ""
@export var sprite_sheet: Texture2D
@export var frame_size: Vector2i = Vector2i(42, 35)
@export var ai_type: String = "melee"
@export var is_boss: bool = false
@export var boss_flag: StringName = &""
@export var sprite_tint: Color = Color.WHITE
@export var sprite_scale: float = 1.0
@export var projectile_color: Color = Color(0.62, 0.92, 0.45)
@export var max_hp: int = 50
@export var attack: int = 15
@export var defense: int = 4
@export var move_speed: float = 48.0
@export var aggro_radius: float = 115.0
@export var attack_range: float = 28.0
@export var leash_radius: float = 200.0
@export var windup_sec: float = 0.45
@export var attack_sec: float = 0.24
@export var recover_sec: float = 0.55
@export var exp_reward: int = 22
@export var gold_min: int = 5
@export var gold_max: int = 9
@export var collision_radius: float = 9.0
@export var lunge_speed: float = 155.0
@export var drop_item_id: StringName = &""
@export_range(0.0, 1.0) var drop_chance: float = 0.0
