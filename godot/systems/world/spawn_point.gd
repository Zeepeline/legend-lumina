class_name SpawnPoint
extends Marker2D

@export var spawn_id: StringName = &"default"


func _ready() -> void:
	add_to_group(&"spawn_points")
