class_name DebugMenu
extends Control
## Panel Mode Developer (buka/tutup dengan F3 atau tombol `~`): teleport instan ke 24 peta, jam dunia, +Gold, Level Up, & Buka Semua Jurus.

const EXTRA_MAPS: Array[Array] = [
	["Gua Batu", "res://maps/cave.tscn"],
	["Arena Latihan", "res://maps/training_glade.tscn"],
	["Rumah Arka", "res://maps/interiors/home.tscn"],
	["Penginapan Desa", "res://maps/interiors/inn.tscn"],
	["Rumah Tetua", "res://maps/interiors/elderhome.tscn"],
	["Rumah Lina", "res://maps/interiors/linahome.tscn"],
	["Kuil Danau", "res://maps/interiors/temple.tscn"],
	["Penginapan Kota", "res://maps/interiors/kinn.tscn"],
	["Arsip Akademi", "res://maps/interiors/arsip.tscn"],
	["Gelanggang", "res://maps/interiors/arena.tscn"],
]

var _panel: PanelContainer = null
var _info_label: Label = null
var _god_btn: Button = null
var _god_mode: bool = false


func _ready() -> void:
	name = "DebugMenu"
	process_mode = Node.PROCESS_MODE_ALWAYS
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false
	_build_ui()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var kev: InputEventKey = event as InputEventKey
		if kev.pressed and not kev.echo:
			var is_dev_key: bool = (
				kev.keycode == KEY_F3
				or kev.keycode == KEY_QUOTELEFT
				or kev.keycode == KEY_TAB
				or (kev.keycode == KEY_D and (kev.meta_pressed or kev.ctrl_pressed))
			)
			if is_dev_key:
				get_viewport().set_input_as_handled()
				toggle_open()


func toggle_open() -> void:
	_toggle_open()


func _process(_delta: float) -> void:
	var gs: GameStateStore = GameStateStore.ref
	if _god_mode and gs != null:
		var cap_hp: int = gs.total_max_hp()
		if gs.hp < cap_hp or gs.mp < gs.max_mp or gs.stamina < gs.max_stamina:
			gs.hp = cap_hp
			gs.mp = gs.max_mp
			gs.stamina = gs.max_stamina
			if EventsBus.ref != null:
				EventsBus.ref.player_stats_changed.emit()
	if visible:
		_refresh_info()


func _toggle_open() -> void:
	visible = not visible
	mouse_filter = Control.MOUSE_FILTER_STOP if visible else Control.MOUSE_FILTER_IGNORE
	if visible:
		_refresh_info()
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")


func _refresh_info() -> void:
	if _info_label == null:
		return
	var gs: GameStateStore = GameStateStore.ref
	var map_id: String = gs.current_map.get_file().get_basename() if gs != null else "-"
	var pos_str: String = "-"
	if SceneService.ref != null:
		var pl: Node2D = SceneService.ref.get_current_player()
		if pl != null and is_instance_valid(pl):
			pos_str = "(%d, %d)" % [roundi(pl.global_position.x), roundi(pl.global_position.y)]
	var hr: float = gs.world_hour if gs != null else 9.0
	_info_label.text = "Peta: %s | Pos: %s | Jam: %02d:%02d" % [map_id, pos_str, int(hr) % 24, int((hr - float(int(hr))) * 60.0)]
	if _god_btn != null:
		_god_btn.text = "God Mode: %s" % ("ON" if _god_mode else "OFF")


func _build_ui() -> void:
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = Color(0.06, 0.07, 0.10, 0.94)
	sb.set_border_width_all(1)
	sb.border_color = Color(0.95, 0.78, 0.32, 0.9)
	sb.set_corner_radius_all(6)
	sb.set_content_margin_all(8)

	var center: CenterContainer = CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(center)

	_panel = PanelContainer.new()
	_panel.add_theme_stylebox_override("panel", sb)
	_panel.custom_minimum_size = Vector2(380.0, 215.0)
	center.add_child(_panel)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	_panel.add_child(vbox)

	var header: HBoxContainer = HBoxContainer.new()
	vbox.add_child(header)

	var title: Label = Label.new()
	title.text = "MODE DEVELOPER [F3 / ~]"
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.add_theme_font_size_override("font_size", 8)
	title.add_theme_color_override("font_color", Color(1.0, 0.86, 0.42))
	header.add_child(title)

	var close_btn: Button = _make_btn("Tutup", func() -> void: _toggle_open())
	header.add_child(close_btn)

	_info_label = Label.new()
	_info_label.add_theme_font_size_override("font_size", 6)
	_info_label.add_theme_color_override("font_color", Color(0.76, 0.88, 1.0))
	vbox.add_child(_info_label)

	# Baris aksi cepat developer
	var cheats_row: HFlowContainer = HFlowContainer.new()
	cheats_row.add_theme_constant_override("h_separation", 3)
	cheats_row.add_theme_constant_override("v_separation", 3)
	vbox.add_child(cheats_row)

	_god_btn = _make_btn("God Mode: OFF", func() -> void:
		_god_mode = not _god_mode
		_refresh_info()
	)
	cheats_row.add_child(_god_btn)
	cheats_row.add_child(_make_btn("Full HP/MP", _on_full_heal))
	cheats_row.add_child(_make_btn("+1000 Gold", _on_add_gold))
	cheats_row.add_child(_make_btn("Level Up", _on_level_up))
	cheats_row.add_child(_make_btn("Buka Jurus & Shrine", _on_unlock_all))
	cheats_row.add_child(_make_btn("Pagi 09:00", func() -> void: _set_hour(9.0)))
	cheats_row.add_child(_make_btn("Sore 17:00", func() -> void: _set_hour(17.0)))
	cheats_row.add_child(_make_btn("Malam 22:00", func() -> void: _set_hour(22.0)))
	cheats_row.add_child(_make_btn("Cuaca: Ganti", func() -> void:
		if WeatherOverlay.ref != null:
			var m: StringName = WeatherOverlay.ref.cycle_weather()
			if EventsBus.ref != null:
				EventsBus.ref.notification_requested.emit("Cuaca: %s" % String(m).to_upper())
	))
	cheats_row.add_child(_make_btn("Mainkan Prolog", func() -> void:
		_toggle_open()
		if StoryManager.ref != null:
			StoryManager.ref.start_prolog()
	))

	var tp_lbl: Label = Label.new()
	tp_lbl.text = "Teleport Instan (24 Peta & Interior):"
	tp_lbl.add_theme_font_size_override("font_size", 7)
	tp_lbl.add_theme_color_override("font_color", Color(0.95, 0.85, 0.55))
	vbox.add_child(tp_lbl)

	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(0.0, 96.0)
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(scroll)

	var grid: GridContainer = GridContainer.new()
	grid.columns = 4
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_theme_constant_override("h_separation", 3)
	grid.add_theme_constant_override("v_separation", 3)
	scroll.add_child(grid)

	for k: Variant in WorldLayout.REGIONS.keys():
		var reg: Dictionary = WorldLayout.REGIONS[k]
		var rname: String = str(reg.get("name", str(k)))
		var rpath: String = str(reg.get("path", ""))
		var b: Button = _make_btn(rname, func() -> void: _teleport_to(rpath))
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		grid.add_child(b)

	for entry: Array in EXTRA_MAPS:
		var ename: String = str(entry[0])
		var epath: String = str(entry[1])
		var b: Button = _make_btn(ename, func() -> void: _teleport_to(epath))
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		grid.add_child(b)


func _make_btn(label_text: String, cb: Callable) -> Button:
	var btn: Button = Button.new()
	btn.text = label_text
	btn.add_theme_font_size_override("font_size", 6)
	btn.pressed.connect(cb)
	return btn


func _teleport_to(map_path: String) -> void:
	if SceneService.ref == null or SceneService.ref.is_busy():
		return
	_toggle_open()
	SceneService.ref.change_map(map_path, &"default", false)


func _on_full_heal() -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	gs.hp = gs.total_max_hp()
	gs.mp = gs.max_mp
	gs.stamina = gs.max_stamina
	gs.flask_charges = gs.flask_max
	if EventsBus.ref != null:
		EventsBus.ref.player_stats_changed.emit()


func _on_add_gold() -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	gs.add_gold(1000)


func _on_level_up() -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	var needed: int = CombatMath.exp_to_next_level(gs.level)
	gs.add_exp(needed)


func _on_unlock_all() -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	for sk: Dictionary in SkillDatabase.SKILLS:
		var sid: StringName = sk["id"]
		if not gs.learned_skills.has(sid):
			gs.learned_skills.append(sid)
	for k: Variant in WorldLayout.REGIONS.keys():
		var rpath: String = str(WorldLayout.REGIONS[k].get("path", ""))
		if not rpath.is_empty():
			gs.mark_map_visited(rpath)
			if not gs.unlocked_shrines.has(rpath):
				gs.unlocked_shrines.append(rpath)
	if EventsBus.ref != null:
		EventsBus.ref.player_stats_changed.emit()
		EventsBus.ref.skill_changed.emit(gs.active_skill_id)
		EventsBus.ref.notification_requested.emit("Semua jurus & Patung Cahaya terbuka!")


func _set_hour(h: float) -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	gs.world_hour = h
	if EventsBus.ref != null:
		EventsBus.ref.time_of_day_changed.emit(h)
	_refresh_info()
