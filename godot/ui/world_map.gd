class_name WorldMapMenu
extends Control
## Menu Peta Benua interaktif dengan tampilan proporsional Benua Lumina, zoom/pan, dan teleportasi Patung Cahaya.

@onready var title_label: Label = $Center/Panel/Margin/VBox/Header/TitleLabel
@onready var focus_btn: Button = $Center/Panel/Margin/VBox/Header/FocusBtn
@onready var zoom_out_btn: Button = $Center/Panel/Margin/VBox/Header/ZoomOutBtn
@onready var zoom_in_btn: Button = $Center/Panel/Margin/VBox/Header/ZoomInBtn
@onready var close_btn: Button = $Center/Panel/Margin/VBox/Header/CloseBtn
@onready var map_canvas: WorldMapCanvas = $Center/Panel/Margin/VBox/MapCanvas
@onready var info_label: Label = $Center/Panel/Margin/VBox/Footer/InfoLabel
@onready var teleport_btn: Button = $Center/Panel/Margin/VBox/Footer/TeleportBtn

var _selected_id: StringName = &"village"


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	title_label.text = tr("ui_worldmap_title")
	focus_btn.text = "◎ %s" % tr("ui_focus_arka")
	close_btn.text = tr("ui_close")
	teleport_btn.text = tr("ui_teleport")

	focus_btn.pressed.connect(_on_focus_pressed)
	zoom_out_btn.pressed.connect(_on_zoom_out_pressed)
	zoom_in_btn.pressed.connect(_on_zoom_in_pressed)
	close_btn.pressed.connect(_close)
	teleport_btn.pressed.connect(_on_teleport)
	map_canvas.region_selected.connect(_on_region_selected)


func _unhandled_input(event: InputEvent) -> void:
	if SceneService.ref != null and event.is_action_pressed(&"world_map") and not SceneService.ref.is_busy():
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
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")
	var cur_id: StringName = &"village"
	if GameStateStore.ref != null:
		cur_id = WorldLayout.id_from_path(GameStateStore.ref.current_map)
		if not WorldLayout.is_benua_id(cur_id):
			var found_special: bool = false
			for m: Dictionary in WorldLayout.SPECIAL_MARKERS:
				if (m["id"] as StringName) == cur_id:
					found_special = true
					break
			if not found_special:
				cur_id = &"village"
	_selected_id = cur_id
	map_canvas.set_selected_id(_selected_id)
	map_canvas.fit_continent()
	_refresh_footer()
	close_btn.grab_focus()


func _close() -> void:
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")
	visible = false
	get_tree().paused = false


func _on_focus_pressed() -> void:
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")
	map_canvas.focus_player()


func _on_zoom_out_pressed() -> void:
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")
	map_canvas.zoom_out()


func _on_zoom_in_pressed() -> void:
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")
	map_canvas.zoom_in()


func _on_region_selected(rid: StringName) -> void:
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")
	_selected_id = rid
	_refresh_footer()


func _lookup_entry(rid: StringName) -> Dictionary:
	var reg: Dictionary = WorldLayout.get_region(rid)
	if not reg.is_empty():
		return reg
	for m: Dictionary in WorldLayout.SPECIAL_MARKERS:
		if (m["id"] as StringName) == rid:
			return m
	return {}


func _refresh_footer() -> void:
	var entry: Dictionary = _lookup_entry(_selected_id)
	if entry.is_empty():
		teleport_btn.disabled = true
		info_label.text = tr("ui_worldmap_hint")
		return
	var gs: GameStateStore = GameStateStore.ref
	var path: String = str(entry.get("path", ""))
	var name_str: String = str(entry.get("name", str(_selected_id)))
	var is_cur: bool = gs != null and gs.current_map == path
	var has_shrine: bool = gs != null and gs.unlocked_shrines.has(path)
	var is_vis: bool = gs != null and gs.visited_maps.has(path)
	var status: String = tr("ui_current_loc") if is_cur else (tr("ui_visited") if is_vis else tr("ui_unvisited"))
	if not has_shrine:
		status = "%s (%s)" % [status, tr("ui_shrine_locked")]
	info_label.text = "%s — %s" % [name_str, status]
	teleport_btn.disabled = is_cur or not has_shrine


func _on_teleport() -> void:
	var entry: Dictionary = _lookup_entry(_selected_id)
	if entry.is_empty() or SceneService.ref == null:
		return
	var target_path: String = str(entry.get("path", ""))
	if target_path.is_empty():
		return
	_close()
	SceneService.ref.change_map(target_path, &"default", true)
