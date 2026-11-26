class_name SpellBar
extends Control
## Bilah 5 slot jurus berbentuk berlian miring 45 derajat di bagian bawah layar.

const SLOT_COUNT: int = 5
const SLOT_STEP: float = 24.0
const DIAMOND_R: float = 9.5
const MAX_COOLDOWN: float = 0.50

var _cooldown_ratio: float = 0.0
var _active_id: StringName = &"fire"
var _mp_cur: int = 30
var _learned: Array[StringName] = [&"fire"]
var _touch_offset: bool = false


func _ready() -> void:
	custom_minimum_size = Vector2(126.0, 30.0)
	mouse_filter = Control.MOUSE_FILTER_STOP
	if EventsBus.ref != null:
		EventsBus.ref.player_stats_changed.connect(refresh_from_state)
		EventsBus.ref.skill_changed.connect(func(_id: StringName) -> void: refresh_from_state())
		EventsBus.ref.touch_controls_toggled.connect(_on_touch_toggled)
	if GameStateStore.ref != null:
		_on_touch_toggled(GameStateStore.ref.is_touch_enabled())
	refresh_from_state()


func _process(_delta: float) -> void:
	var new_cd: float = 0.0
	if SceneService.ref != null:
		var player: Node2D = SceneService.ref.get_current_player()
		if player != null and is_instance_valid(player):
			var cd_val: Variant = player.get("fireball_cooldown")
			if cd_val is float:
				new_cd = clampf((cd_val as float) / MAX_COOLDOWN, 0.0, 1.0)
	if not is_equal_approx(new_cd, _cooldown_ratio):
		_cooldown_ratio = new_cd
		queue_redraw()


func refresh_from_state() -> void:
	if GameStateStore.ref == null:
		return
	var gs: GameStateStore = GameStateStore.ref
	_active_id = gs.active_skill_id
	_mp_cur = gs.mp
	_learned = gs.learned_skills.duplicate()
	queue_redraw()


func _on_touch_toggled(enabled: bool) -> void:
	_touch_offset = enabled
	offset_top = -54.0 if enabled else -32.0
	offset_bottom = -24.0 if enabled else -2.0


func _slot_center(idx: int) -> Vector2:
	var total_w: float = float(SLOT_COUNT - 1) * SLOT_STEP
	var start_x: float = (size.x - total_w) * 0.5
	return Vector2(start_x + float(idx) * SLOT_STEP, size.y * 0.5 - 1.0)


func _gui_input(event: InputEvent) -> void:
	var tap_pos: Vector2 = Vector2(-1.0, -1.0)
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_LEFT and mb.pressed:
			tap_pos = mb.position
	elif event is InputEventScreenTouch:
		var st: InputEventScreenTouch = event as InputEventScreenTouch
		if st.pressed:
			tap_pos = st.position
	if tap_pos.x < 0.0:
		return

	var count: int = mini(SLOT_COUNT, SkillDatabase.SKILLS.size())
	for i: int in count:
		var c: Vector2 = _slot_center(i)
		if absf(tap_pos.x - c.x) + absf(tap_pos.y - c.y) <= DIAMOND_R + 3.0:
			var sk: Dictionary = SkillDatabase.SKILLS[i]
			var sk_id: StringName = sk["id"]
			if _learned.has(sk_id) and GameStateStore.ref != null:
				GameStateStore.ref.set_active_skill(sk_id)
				if AudioService.ref != null:
					AudioService.ref.play_ui_id(&"ui_click")
				refresh_from_state()
			elif EventsBus.ref != null:
				EventsBus.ref.notification_requested.emit(tr("ui_locked"))
			accept_event()
			return


func _draw() -> void:
	var font: Font = ThemeDB.fallback_font
	var count: int = mini(SLOT_COUNT, SkillDatabase.SKILLS.size())
	for i: int in count:
		var sk: Dictionary = SkillDatabase.SKILLS[i]
		var sk_id: StringName = sk["id"]
		var is_learned: bool = _learned.has(sk_id)
		var is_active: bool = is_learned and _active_id == sk_id
		var mp_cost: int = int(sk["mp_cost"])
		var base_color: Color = sk["color"]
		var c: Vector2 = _slot_center(i)

		var pts: PackedVector2Array = PackedVector2Array([
			c + Vector2(0.0, -DIAMOND_R),
			c + Vector2(DIAMOND_R, 0.0),
			c + Vector2(0.0, DIAMOND_R),
			c + Vector2(-DIAMOND_R, 0.0),
		])
		var loop_pts: PackedVector2Array = PackedVector2Array([pts[0], pts[1], pts[2], pts[3], pts[0]])

		if is_active:
			var halo: PackedVector2Array = PackedVector2Array([
				c + Vector2(0.0, -(DIAMOND_R + 2.5)),
				c + Vector2(DIAMOND_R + 2.5, 0.0),
				c + Vector2(0.0, DIAMOND_R + 2.5),
				c + Vector2(-(DIAMOND_R + 2.5), 0.0),
				c + Vector2(0.0, -(DIAMOND_R + 2.5)),
			])
			draw_polyline(halo, Color(0.98, 0.80, 0.28, 0.55), 1.5)

		var fill_col: Color = Color(0.08, 0.09, 0.13, 0.90) if is_learned else Color(0.07, 0.08, 0.11, 0.65)
		draw_colored_polygon(pts, fill_col)

		if is_learned:
			var inner_r: float = DIAMOND_R - 3.0
			var inner_pts: PackedVector2Array = PackedVector2Array([
				c + Vector2(0.0, -inner_r),
				c + Vector2(inner_r, 0.0),
				c + Vector2(0.0, inner_r),
				c + Vector2(-inner_r, 0.0),
			])
			var tint_alpha: float = 0.72 if is_active else 0.42
			draw_colored_polygon(inner_pts, Color(base_color.r, base_color.g, base_color.b, tint_alpha))
			_draw_skill_glyph(c, sk_id, is_active)

			if is_active and _cooldown_ratio > 0.02:
				draw_arc(c, DIAMOND_R - 1.8, -PI * 0.5, -PI * 0.5 + TAU * _cooldown_ratio, 12, Color(0.04, 0.05, 0.08, 0.82), 5.0)

		var border_col: Color = Color(0.96, 0.78, 0.26, 1.0) if is_active else (Color(0.45, 0.49, 0.58, 0.9) if is_learned else Color(0.24, 0.26, 0.32, 0.7))
		draw_polyline(loop_pts, border_col, 1.3 if is_active else 1.0)

		var cost_text: String = "%d" % mp_cost if is_learned else "-"
		var cost_col: Color = Color(0.55, 0.84, 1.0, 0.95) if _mp_cur >= mp_cost else Color(1.0, 0.42, 0.42, 0.95)
		if not is_learned:
			cost_col = Color(0.45, 0.47, 0.54, 0.75)
		draw_string(font, c + Vector2(-3.5, DIAMOND_R + 4.5), cost_text, HORIZONTAL_ALIGNMENT_CENTER, 12, 6, cost_col)


func _draw_skill_glyph(c: Vector2, sk_id: StringName, is_active: bool) -> void:
	var col: Color = Color(1.0, 0.98, 0.92, 0.95) if is_active else Color(0.92, 0.94, 0.98, 0.75)
	match sk_id:
		&"fire":
			draw_colored_polygon(PackedVector2Array([
				c + Vector2(0.0, -4.0), c + Vector2(3.0, 2.0), c + Vector2(0.0, 4.0), c + Vector2(-3.0, 2.0)
			]), col)
		&"venom":
			draw_circle(c + Vector2(0.0, 1.2), 2.6, col)
			draw_line(c + Vector2(0.0, -3.5), c + Vector2(0.0, 0.0), col, 1.2)
		&"nova":
			draw_line(c + Vector2(-3.5, 0.0), c + Vector2(3.5, 0.0), col, 1.1)
			draw_line(c + Vector2(0.0, -3.5), c + Vector2(0.0, 3.5), col, 1.1)
			draw_line(c + Vector2(-2.2, -2.2), c + Vector2(2.2, 2.2), col, 0.9)
		&"heal":
			draw_rect(Rect2(c.x - 1.1, c.y - 3.6, 2.2, 7.2), col)
			draw_rect(Rect2(c.x - 3.6, c.y - 1.1, 7.2, 2.2), col)
		&"holy":
			draw_circle(c, 2.2, col)
			for k: int in 4:
				var ang: float = float(k) * PI * 0.5
				var d: Vector2 = Vector2.RIGHT.rotated(ang)
				draw_line(c + d * 2.8, c + d * 4.5, col, 1.0)
