class_name JoystickDrawer
extends Control


func _draw() -> void:
	var center: Vector2 = size * 0.5
	draw_circle(center, 28.0, Color(0.08, 0.08, 0.08, 0.35))
	draw_arc(center, 28.0, 0.0, TAU, 24, Color(1.0, 0.95, 0.85, 0.45), 1.5)
	var parent_tc: TouchControls = get_parent() as TouchControls
	var knob_pos: Vector2 = center
	if parent_tc != null:
		knob_pos += parent_tc._knob_offset
	draw_circle(knob_pos, 11.0, Color(1.0, 0.92, 0.72, 0.65))
