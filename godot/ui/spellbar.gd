class_name SpellBar
extends Control
## Bilah 5 slot jurus bergaya kayu & perkamen: kotak perkamen berbingkai, ikon piksel, slot aktif berbingkai emas,
## jeda tunggu berupa tirai gelap yang turun, biaya MP di pojok kanan bawah.

const SLOT_COUNT: int = 5
const SLOT_STEP: float = 27.0
const SLOT_SIZE: float = 24.0
const DIAMOND_R: float = 11.0
const ICONS: Dictionary = {
	&"fire": preload("res://assets/art/ui/ic_fire.png"),
	&"venom": preload("res://assets/art/ui/ic_venom.png"),
	&"nova": preload("res://assets/art/ui/ic_nova.png"),
	&"heal": preload("res://assets/art/ui/ic_heal.png"),
	&"holy": preload("res://assets/art/ui/ic_holy.png"),
}
const LOCK_TEX: Texture2D = preload("res://assets/art/ui/ic_lock.png")
const SLOT_TEX: Texture2D = preload("res://assets/art/ui/slot.png")
const SLOT_SEL_TEX: Texture2D = preload("res://assets/art/ui/slot_sel.png")
const MAX_COOLDOWN: float = 0.50

var _cooldown_ratio: float = 0.0
var _cooldown_sec: float = 0.0
var _active_id: StringName = &"fire"
var _mp_cur: int = 30
var _learned: Array[StringName] = [&"fire"]
var _touch_offset: bool = false
var _sb: StyleBoxTexture = null
var _sb_sel: StyleBoxTexture = null


func _ready() -> void:
	custom_minimum_size = Vector2(136.0, 27.0)
	_sb = _make_sb(SLOT_TEX)
	_sb_sel = _make_sb(SLOT_SEL_TEX)
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
	offset_top = -49.0 if enabled else -29.0
	offset_bottom = -22.0 if enabled else -2.0


func _slot_center(idx: int) -> Vector2:
	var total_w: float = float(SLOT_COUNT - 1) * SLOT_STEP
	var start_x: float = (size.x - total_w) * 0.5
	return Vector2(floorf(start_x + float(idx) * SLOT_STEP), floorf(size.y * 0.5))


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
		if absf(tap_pos.x - c.x) <= SLOT_SIZE * 0.5 + 1.0 and absf(tap_pos.y - c.y) <= SLOT_SIZE * 0.5 + 1.0:
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


func _make_sb(tex: Texture2D) -> StyleBoxTexture:
	var sb: StyleBoxTexture = StyleBoxTexture.new()
	sb.texture = tex
	sb.texture_margin_left = 3.0
	sb.texture_margin_top = 3.0
	sb.texture_margin_right = 3.0
	sb.texture_margin_bottom = 3.0
	return sb


func _draw() -> void:
	var font: Font = get_theme_default_font()
	var count: int = mini(SLOT_COUNT, SkillDatabase.SKILLS.size())
	for i: int in count:
		var sk: Dictionary = SkillDatabase.SKILLS[i]
		var sk_id: StringName = sk["id"]
		var is_learned: bool = _learned.has(sk_id)
		var is_active: bool = is_learned and _active_id == sk_id
		var mp_cost: int = int(sk["mp_cost"])
		var no_mp: bool = is_learned and _mp_cur < mp_cost
		var c: Vector2 = _slot_center(i)
		var r: Rect2 = Rect2(c - Vector2(SLOT_SIZE, SLOT_SIZE) * 0.5, Vector2(SLOT_SIZE, SLOT_SIZE))
		draw_style_box(_sb_sel if is_active else _sb, r)
		var tex: Texture2D = (ICONS.get(sk_id, LOCK_TEX) as Texture2D) if is_learned else LOCK_TEX
		var ipos: Vector2 = (c - tex.get_size() * 0.5).floor() - Vector2(0.0, 1.0)
		var mod: Color = Color(1, 1, 1, 0.45) if no_mp else (Color(1, 1, 1, 1) if is_learned else Color(1, 1, 1, 0.7))
		draw_texture(tex, ipos, mod)
		if is_active and _cooldown_ratio > 0.02:
			var ch: float = floorf((SLOT_SIZE - 4.0) * _cooldown_ratio)
			draw_rect(Rect2(r.position.x + 2.0, r.position.y + 2.0, SLOT_SIZE - 4.0, ch), Color(0.024, 0.004, 0.02, 0.55))
		if is_learned:
			var cost_text: String = "%d" % mp_cost
			var col: Color = Color(0.243, 0.471, 0.745, 1.0) if not no_mp else Color(0.639, 0.161, 0.11, 1.0)
			var tw: float = font.get_string_size(cost_text, HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x
			draw_string(font, Vector2(r.end.x - 3.0 - tw, r.end.y - 3.0), cost_text, HORIZONTAL_ALIGNMENT_LEFT, -1, 10, col)
