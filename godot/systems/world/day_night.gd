class_name DayNightController
extends CanvasModulate


func _ready() -> void:
	if EventsBus.ref != null:
		EventsBus.ref.time_of_day_changed.connect(_update_tint)
		EventsBus.ref.map_changed.connect(_on_map_changed)
	_update_tint(GameStateStore.ref.world_hour)


func _on_map_changed(_path: String, _spawn: StringName) -> void:
	_update_tint(GameStateStore.ref.world_hour)


func _update_tint(hour: float) -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs.is_indoor:
		color = Color.WHITE
		return
	if gs.is_dark_cave:
		color = Color(0.28, 0.26, 0.38, 1.0)
		return
	color = _color_for_hour(hour)


func _color_for_hour(h: float) -> Color:
	var day_c: Color = Color(1.0, 0.99, 0.96)
	var dusk_c: Color = Color(1.0, 0.82, 0.65)
	var night_c: Color = Color(0.42, 0.46, 0.68)
	var dawn_c: Color = Color(0.92, 0.80, 0.72)
	if h >= 7.0 and h < 16.0:
		return day_c
	if h >= 16.0 and h < 18.5:
		return day_c.lerp(dusk_c, (h - 16.0) / 2.5)
	if h >= 18.5 and h < 20.0:
		return dusk_c.lerp(night_c, (h - 18.5) / 1.5)
	if h >= 20.0 or h < 5.0:
		return night_c
	if h >= 5.0 and h < 6.0:
		return night_c.lerp(dawn_c, h - 5.0)
	return dawn_c.lerp(day_c, h - 6.0)
