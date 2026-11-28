class_name SpellBar
extends Control
## Bilah 5 slot jurus berbentuk berlian miring 45 derajat bergaya web versi HD (gradasi, cahaya emas, ikon vektor tajam).

const SLOT_COUNT: int = 5
const SLOT_STEP: float = 28.0
const DIAMOND_R: float = 11.0
const MAX_COOLDOWN: float = 0.50

var _cooldown_ratio: float = 0.0
var _cooldown_sec: float = 0.0
var _active_id: StringName = &"fire"
var _mp_cur: int = 30
var _learned: Array[StringName] = [&"fire"]
var _touch_offset: bool = false


func _ready() -> void:
	custom_minimum_size = Vector2(148.0, 34.0)
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
	var new_sec: float = 0.0
	if SceneService.ref != null:
		var player: Node2D = SceneService.ref.get_current_player()
		if player != null and is_instance_valid(player):
			var cd_val: Variant = player.get("fireball_cooldown")
			if cd_val is float:
				new_sec = maxf(0.0, cd_val as float)
				new_cd = clampf(new_sec / MAX_COOLDOWN, 0.0, 1.0)
	if not is_equal_approx(new_cd, _cooldown_ratio):
		_cooldown_ratio = new_cd
		_cooldown_sec = new_sec
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
	offset_top = -56.0 if enabled else -36.0
	offset_bottom = -22.0 if enabled else -2.0


func _slot_center(idx: int) -> Vector2:
	var total_w: float = float(SLOT_COUNT - 1) * SLOT_STEP
	var start_x: float = (size.x - total_w) * 0.5
	return Vector2(start_x + float(idx) * SLOT_STEP, size.y * 0.5 - 1.5)


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
		if absf(tap_pos.x - c.x) + absf(tap_pos.y - c.y) <= DIAMOND_R + 3.5:
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


func _diamond_pts(c: Vector2, r: float) -> PackedVector2Array:
	return PackedVector2Array([
		c + Vector2(0.0, -r),
		c + Vector2(r, 0.0),
		c + Vector2(0.0, r),
		c + Vector2(-r, 0.0),
	])


func _diamond_loop(c: Vector2, r: float) -> PackedVector2Array:
	var pts: PackedVector2Array = _diamond_pts(c, r)
	return PackedVector2Array([pts[0], pts[1], pts[2], pts[3], pts[0]])


func _draw() -> void:
	var font: Font = ThemeDB.fallback_font
	var count: int = mini(SLOT_COUNT, SkillDatabase.SKILLS.size())
	for i: int in count:
		var sk: Dictionary = SkillDatabase.SKILLS[i]
		var sk_id: StringName = sk["id"]
		var is_learned: bool = _learned.has(sk_id)
		var is_active: bool = is_learned and _active_id == sk_id
		var mp_cost: int = int(sk["mp_cost"])
		var no_mp: bool = is_learned and _mp_cur < mp_cost
		var base_color: Color = sk["color"]
		var c: Vector2 = _slot_center(i)
		var slot_alpha: float = 0.48 if no_mp else (1.0 if is_learned else 0.62)

		# Soft drop shadow
		draw_colored_polygon(_diamond_pts(c + Vector2(0.0, 1.8), DIAMOND_R + 0.5), Color(0.0, 0.0, 0.0, 0.55 * slot_alpha))

		# Layered radiant gold glow for active slot (matches web .s-slot.act)
		if is_active:
			draw_colored_polygon(_diamond_pts(c, DIAMOND_R + 3.4), Color(1.0, 0.843, 0.353, 0.16))
			draw_polyline(_diamond_loop(c, DIAMOND_R + 2.0), Color(1.0, 0.886, 0.478, 0.48), 1.6, true)

		# Metallic dark gradient diamond body (#252028 -> #141218)
		var pts: PackedVector2Array = _diamond_pts(c, DIAMOND_R)
		var top_bg: Color = Color(0.165, 0.141, 0.184, 0.96 * slot_alpha) if is_learned else Color(0.095, 0.095, 0.125, 0.72)
		var mid_bg: Color = Color(0.118, 0.106, 0.137, 0.96 * slot_alpha) if is_learned else Color(0.075, 0.078, 0.105, 0.72)
		var bot_bg: Color = Color(0.078, 0.071, 0.094, 0.98 * slot_alpha) if is_learned else Color(0.055, 0.058, 0.082, 0.72)
		draw_polygon(pts, PackedColorArray([top_bg, mid_bg, bot_bg, mid_bg]))

		# Subtle inner gold bevel filigree
		draw_polyline(_diamond_loop(c, DIAMOND_R - 1.6), Color(1.0, 0.886, 0.478, (0.28 if is_active else 0.14) * slot_alpha), 0.7, true)

		if is_learned:
			# Soft elemental radial aura inside diamond
			var aura_a: float = (0.34 if is_active else 0.18) * slot_alpha
			draw_colored_polygon(_diamond_pts(c, DIAMOND_R - 2.6), Color(base_color.r, base_color.g, base_color.b, aura_a))
			_draw_skill_glyph(c, sk_id, is_active, no_mp)

			# Cooldown radial sweep + numeric countdown
			if is_active and _cooldown_ratio > 0.02:
				draw_arc(c, DIAMOND_R - 2.2, -PI * 0.5, -PI * 0.5 + TAU * _cooldown_ratio, 18, Color(0.02, 0.03, 0.06, 0.78), 6.0, true)
				if _cooldown_sec >= 0.1:
					var cd_txt: String = "%.1f" % _cooldown_sec
					draw_string_outline(font, c + Vector2(-7.0, 2.5), cd_txt, HORIZONTAL_ALIGNMENT_CENTER, 14, 7, 2, Color(0.0, 0.0, 0.0, 0.9))
					draw_string(font, c + Vector2(-7.0, 2.5), cd_txt, HORIZONTAL_ALIGNMENT_CENTER, 14, 7, Color(1.0, 1.0, 1.0, 0.96))

		# Outer metallic border (#ffe27a active / #8a6c3a learned / muted locked)
		var border_col: Color = Color(1.0, 0.886, 0.478, 1.0) if is_active else (Color(0.541, 0.424, 0.227, 0.95 * slot_alpha) if is_learned else Color(0.25, 0.27, 0.34, 0.72))
		draw_polyline(_diamond_loop(c, DIAMOND_R), border_col, 1.4 if is_active else 1.1, true)

		# Crisp MP cost label below diamond with dark outline
		var cost_text: String = "%d" % mp_cost if is_learned else "·"
		var cost_col: Color = Color(0.541, 0.847, 1.0, 0.98) if not no_mp else Color(1.0, 0.42, 0.42, 0.95)
		if not is_learned:
			cost_col = Color(0.48, 0.50, 0.58, 0.70)
		var txt_pos: Vector2 = c + Vector2(-6.0, DIAMOND_R + 5.0)
		draw_string_outline(font, txt_pos, cost_text, HORIZONTAL_ALIGNMENT_CENTER, 12, 6, 2, Color(0.0, 0.0, 0.0, 0.90))
		draw_string(font, txt_pos, cost_text, HORIZONTAL_ALIGNMENT_CENTER, 12, 6, cost_col)


func _draw_skill_glyph(c: Vector2, sk_id: StringName, is_active: bool, dimmed: bool) -> void:
	var a: float = 0.48 if dimmed else (1.0 if is_active else 0.84)
	match sk_id:
		&"fire":
			# Layered flame (orange outer + bright yellow core)
			draw_colored_polygon(PackedVector2Array([
				c + Vector2(0.0, -5.2), c + Vector2(3.6, 0.8), c + Vector2(2.2, 4.2), c + Vector2(0.0, 4.8), c + Vector2(-2.2, 4.2), c + Vector2(-3.6, 0.8),
			]), Color(1.0, 0.44, 0.14, a))
			draw_colored_polygon(PackedVector2Array([
				c + Vector2(0.0, -2.4), c + Vector2(1.8, 1.6), c + Vector2(0.0, 3.6), c + Vector2(-1.8, 1.6),
			]), Color(1.0, 0.92, 0.44, a))
		&"venom":
			# Toxic emerald droplet with highlight
			draw_colored_polygon(PackedVector2Array([
				c + Vector2(0.0, -4.8), c + Vector2(3.2, 1.2), c + Vector2(0.0, 4.2), c + Vector2(-3.2, 1.2),
			]), Color(0.32, 0.88, 0.36, a))
			draw_circle(c + Vector2(0.0, 1.4), 2.8, Color(0.24, 0.78, 0.30, a))
			draw_circle(c + Vector2(-1.0, 0.6), 0.9, Color(0.84, 1.0, 0.76, a))
		&"nova":
			# 6-point frost crystal star
			var ice_col: Color = Color(0.68, 0.94, 1.0, a)
			for k: int in 3:
				var ang: float = float(k) * PI / 3.0
				var d: Vector2 = Vector2.RIGHT.rotated(ang) * 4.6
				draw_line(c - d, c + d, ice_col, 1.25, true)
			draw_circle(c, 1.7, Color(1.0, 1.0, 1.0, a))
		&"heal":
			# Radiant emerald cross
			draw_rect(Rect2(c.x - 1.4, c.y - 4.4, 2.8, 8.8), Color(0.32, 0.92, 0.56, a))
			draw_rect(Rect2(c.x - 4.4, c.y - 1.4, 8.8, 2.8), Color(0.32, 0.92, 0.56, a))
			draw_rect(Rect2(c.x - 0.7, c.y - 3.0, 1.4, 6.0), Color(0.86, 1.0, 0.92, a))
			draw_rect(Rect2(c.x - 3.0, c.y - 0.7, 6.0, 1.4), Color(0.86, 1.0, 0.92, a))
		&"holy":
			# Golden 8-ray starburst
			var gold_col: Color = Color(1.0, 0.90, 0.45, a)
			for k: int in 4:
				var ang: float = float(k) * PI * 0.5
				var d: Vector2 = Vector2.RIGHT.rotated(ang)
				draw_line(c - d * 5.0, c + d * 5.0, gold_col, 1.25, true)
			for k: int in 4:
				var ang: float = float(k) * PI * 0.5 + PI * 0.25
				var d: Vector2 = Vector2.RIGHT.rotated(ang)
				draw_line(c - d * 3.0, c + d * 3.0, Color(1.0, 0.96, 0.76, a), 0.9, true)
			draw_circle(c, 1.9, Color(1.0, 1.0, 0.95, a))
