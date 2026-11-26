class_name Hitbox
extends Area2D

@export var damage: int = 10
@export var knockback: float = 120.0
@export var is_crit: bool = false

var source: Node2D = null
var _hit_ids: Dictionary = {}


func _ready() -> void:
	monitoring = false
	monitorable = false


func reset_swing() -> void:
	_hit_ids.clear()


func set_active(enabled: bool) -> void:
	if enabled:
		reset_swing()
	set_deferred("monitorable", enabled)


func can_hit(target: Node) -> bool:
	if target == null or target == source:
		return false
	return not _hit_ids.has(target.get_instance_id())


func register_hit(target: Node) -> void:
	if target != null:
		_hit_ids[target.get_instance_id()] = true
