class_name JoystickDrawer
extends Control
## Joystick sentuh bergaya kayu & perkamen: cincin kayu bergaris hitam dan kenop perkamen.


func _draw() -> void:
	var center: Vector2 = (size * 0.5).floor()
	draw_circle(center, 28.0, Color(0.024, 0.004, 0.02, 0.28))
	draw_arc(center, 29.0, 0.0, TAU, 32, Color(0.024, 0.004, 0.02, 0.8), 1.0)
	draw_arc(center, 27.0, 0.0, TAU, 32, Color(0.569, 0.376, 0.314, 0.85), 3.0)
	draw_arc(center, 25.0, 0.0, TAU, 32, Color(0.024, 0.004, 0.02, 0.6), 1.0)
	var parent_tc: TouchControls = get_parent() as TouchControls
	var knob_pos: Vector2 = center
	if parent_tc != null:
		knob_pos += parent_tc._knob_offset
	knob_pos = knob_pos.floor()
	draw_circle(knob_pos, 11.0, Color(0.024, 0.004, 0.02, 0.9))
	draw_circle(knob_pos, 10.0, Color(0.925, 0.808, 0.675, 0.92))
	draw_circle(knob_pos + Vector2(-2.0, -2.0), 4.0, Color(0.98, 0.94, 0.86, 0.9))
