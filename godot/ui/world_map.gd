class_name WorldMapMenu
extends Control

const REGIONS: Array[Dictionary] = [
	{"path": "res://maps/kakademi.tscn", "key": "map_kakademi", "pos": Vector2(70, 2), "spawn": &"default"},
	{"path": "res://maps/kbawah.tscn", "key": "map_kbawah", "pos": Vector2(2, 26), "spawn": &"default"},
	{"path": "res://maps/kpasar.tscn", "key": "map_kpasar", "pos": Vector2(70, 26), "spawn": &"default"},
	{"path": "res://maps/kpermukiman.tscn", "key": "map_kpermukiman", "pos": Vector2(138, 26), "spawn": &"default"},
	{"path": "res://maps/road.tscn", "key": "map_road", "pos": Vector2(2, 52), "spawn": &"default"},
	{"path": "res://maps/kgate.tscn", "key": "map_kgate", "pos": Vector2(70, 52), "spawn": &"default"},
	{"path": "res://maps/snow.tscn", "key": "map_snow", "pos": Vector2(206, 52), "spawn": &"default"},
	{"path": "res://maps/cave.tscn", "key": "map_cave", "pos": Vector2(274, 52), "spawn": &"default"},
	{"path": "res://maps/lake.tscn", "key": "map_lake", "pos": Vector2(2, 78), "spawn": &"default"},
	{"path": "res://maps/village.tscn", "key": "map_village", "pos": Vector2(70, 78), "spawn": &"default"},
	{"path": "res://maps/meadow.tscn", "key": "map_meadow", "pos": Vector2(138, 78), "spawn": &"default"},
	{"path": "res://maps/deepwood.tscn", "key": "map_deepwood", "pos": Vector2(2, 104), "spawn": &"default"},
	{"path": "res://maps/forest.tscn", "key": "map_forest", "pos": Vector2(70, 104), "spawn": &"default"},
	{"path": "res://maps/river.tscn", "key": "map_river", "pos": Vector2(138, 104), "spawn": &"default"},
	{"path": "res://maps/swamp.tscn", "key": "map_swamp", "pos": Vector2(206, 104), "spawn": &"default"},
]

@onready var title_label: Label = $Center/Panel/Margin/VBox/Header/TitleLabel
@onready var close_btn: Button = $Center/Panel/Margin/VBox/Header/CloseBtn
@onready var map_canvas: Control = $Center/Panel/Margin/VBox/MapCanvas
@onready var info_label: Label = $Center/Panel/Margin/VBox/Footer/InfoLabel
@onready var teleport_btn: Button = $Center/Panel/Margin/VBox/Footer/TeleportBtn

var _selected_region: Dictionary = {}


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	title_label.text = tr("ui_worldmap_title")
	close_btn.text = tr("ui_close")
	teleport_btn.text = tr("ui_teleport")
	close_btn.pressed.connect(_close)
	teleport_btn.pressed.connect(_on_teleport)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed(&"world_map") and not SceneService.ref.is_busy():
		get_viewport().set_input_as_handled()
		if visible:
			_close()
		elif not get_tree().paused:
			_open()
	elif visible and event.is_action_pressed(&"pause"):
		get_viewport().set_input_as_handled()
		_close()


func _open() -> void:
	visible = true
	get_tree().paused = true
	AudioService.ref.play_ui_id(&"ui_click")
	_selected_region = REGIONS[9]
	for reg: Dictionary in REGIONS:
		if String(reg["path"]) == GameStateStore.ref.current_map:
			_selected_region = reg
			break
	_rebuild()
	close_btn.grab_focus()


func _close() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	visible = false
	get_tree().paused = false


func _rebuild() -> void:
	for ch: Node in map_canvas.get_children():
		ch.queue_free()
	var gs: GameStateStore = GameStateStore.ref
	for reg: Dictionary in REGIONS:
		var path: String = String(reg["path"])
		var btn: Button = Button.new()
		btn.position = reg["pos"] as Vector2
		btn.custom_minimum_size = Vector2(64, 21)
		btn.text = tr(String(reg["key"]))
		btn.add_theme_font_size_override("font_size", 6)
		var is_cur: bool = gs.current_map == path
		var is_vis: bool = gs.visited_maps.has(path)
		if is_cur:
			btn.modulate = Color(1.0, 0.88, 0.45)
		elif is_vis:
			btn.modulate = Color(0.68, 0.96, 0.74)
		else:
			btn.modulate = Color(0.52, 0.54, 0.62)
		btn.pressed.connect(func() -> void: _select_region(reg))
		map_canvas.add_child(btn)
	_refresh_footer()


func _select_region(reg: Dictionary) -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	_selected_region = reg
	_refresh_footer()


func _refresh_footer() -> void:
	if _selected_region.is_empty():
		teleport_btn.disabled = true
		info_label.text = ""
		return
	var gs: GameStateStore = GameStateStore.ref
	var path: String = String(_selected_region["path"])
	var name_str: String = tr(String(_selected_region["key"]))
	var is_cur: bool = gs.current_map == path
	var has_shrine: bool = gs.unlocked_shrines.has(path)
	var is_vis: bool = gs.visited_maps.has(path)
	var status: String = tr("ui_current_loc") if is_cur else (tr("ui_visited") if is_vis else tr("ui_unvisited"))
	if not has_shrine:
		status = "%s (%s)" % [status, tr("ui_shrine_locked")]
	info_label.text = "%s — %s" % [name_str, status]
	teleport_btn.disabled = is_cur or not has_shrine


func _on_teleport() -> void:
	if _selected_region.is_empty():
		return
	var target_path: String = String(_selected_region["path"])
	var target_spawn: StringName = _selected_region["spawn"]
	_close()
	SceneService.ref.change_map(target_path, target_spawn, true)
