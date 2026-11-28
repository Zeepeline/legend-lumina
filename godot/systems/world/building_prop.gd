@tool
class_name BuildingProp
extends StaticBody2D

@onready var sprite: Sprite2D = get_node_or_null("Sprite2D") as Sprite2D
@onready var fade_area: Area2D = get_node_or_null("FadeArea") as Area2D

var _fade_tween: Tween = null


func _ready() -> void:
	if Engine.is_editor_hint():
		return
	if fade_area != null:
		fade_area.body_entered.connect(_on_fade_entered)
		fade_area.body_exited.connect(_on_fade_exited)


func _on_fade_entered(body: Node) -> void:
	if body.is_in_group(&"player"):
		_tween_alpha(0.45)


func _on_fade_exited(body: Node) -> void:
	if body.is_in_group(&"player"):
		_tween_alpha(1.0)


func _tween_alpha(target_a: float) -> void:
	if sprite == null:
		return
	if _fade_tween != null and _fade_tween.is_valid():
		_fade_tween.kill()
	_fade_tween = create_tween()
	_fade_tween.tween_property(sprite, "modulate:a", target_a, 0.16)
