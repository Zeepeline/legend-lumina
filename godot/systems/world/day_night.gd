class_name DayNightController
extends CanvasModulate
## Pengatur pencahayaan siang-malam dan nuansa bioma (termasuk keteduhan Hutan Dalam & Rawa Senja).

const BIOME_TINTS: Dictionary = {
	&"deepwood": Color(0.56, 0.66, 0.62, 1.0),
	&"swamp": Color(0.78, 0.82, 0.74, 1.0),
	&"forest": Color(0.91, 0.95, 0.91, 1.0),
	&"kbawah": Color(0.85, 0.85, 0.92, 1.0),
}

var _tint_tween: Tween = null


func _ready() -> void:
	if EventsBus.ref != null:
		EventsBus.ref.time_of_day_changed.connect(_on_time_changed)
		EventsBus.ref.map_changed.connect(_on_map_changed)
	_apply_tint(GameStateStore.ref.world_hour, false)


func _on_time_changed(hour: float) -> void:
	_apply_tint(hour, false)


func _on_map_changed(_path: String, _spawn: StringName) -> void:
	_apply_tint(GameStateStore.ref.world_hour, true)


func _apply_tint(hour: float, smooth: bool) -> void:
	var target: Color = _compute_target_color(hour)
	if not smooth or not is_inside_tree():
		color = target
		return
	if _tint_tween != null and _tint_tween.is_valid():
		_tint_tween.kill()
	_tint_tween = create_tween()
	_tint_tween.tween_property(self, "color", target, 0.65).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)


func _compute_target_color(hour: float) -> Color:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return Color.WHITE
	if gs.is_indoor:
		return Color.WHITE
	if gs.is_dark_cave:
		return Color(0.28, 0.26, 0.38, 1.0)
	var base_c: Color = _color_for_hour(hour)
	var rid: StringName = WorldLayout.id_from_path(gs.current_map)
	if BIOME_TINTS.has(rid):
		var bt: Color = BIOME_TINTS[rid] as Color
		return Color(base_c.r * bt.r, base_c.g * bt.g, base_c.b * bt.b, 1.0)
	return base_c


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
