class_name DamageNumber
extends Node2D


static func spawn(parent: Node, world_pos: Vector2, text_val: String, color: Color = Color.WHITE) -> void:
	if parent == null:
		return
	var popup: DamageNumber = DamageNumber.new()
	popup.position = world_pos + Vector2(0.0, -24.0)
	popup.z_index = 20

	var lbl: Label = Label.new()
	lbl.text = text_val
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.position = Vector2(-28.0, -8.0)
	lbl.custom_minimum_size = Vector2(56.0, 16.0)
	lbl.add_theme_font_size_override("font_size", 10)
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_color_override("font_outline_color", Color(0.08, 0.06, 0.05, 0.95))
	lbl.add_theme_constant_override("outline_size", 3)
	popup.add_child(lbl)
	parent.add_child(popup)

	var tw: Tween = popup.create_tween().set_parallel(true)
	tw.tween_property(popup, "position:y", popup.position.y - 20.0, 0.55).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tw.tween_property(lbl, "modulate:a", 0.0, 0.55).set_delay(0.18)
	tw.chain().tween_callback(popup.queue_free)
