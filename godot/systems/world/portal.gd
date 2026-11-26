class_name Portal
extends Area2D

@export_file("*.tscn") var target_map: String = ""
@export var target_spawn_id: StringName = &"default"


func _ready() -> void:
	monitoring = true
	monitorable = false
	body_entered.connect(_on_body_entered)


func _on_body_entered(body: Node) -> void:
	if body.is_in_group(&"player") and not target_map.is_empty() and not SceneService.ref.is_busy():
		call_deferred(&"_trigger_transition")


func _trigger_transition() -> void:
	SceneService.ref.change_map(target_map, target_spawn_id, true)
