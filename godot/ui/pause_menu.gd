class_name PauseMenu
extends Control

@onready var title_label: Label = $Center/Panel/Margin/VBox/TitleLabel
@onready var resume_btn: Button = $Center/Panel/Margin/VBox/ResumeBtn
@onready var save_btn: Button = $Center/Panel/Margin/VBox/SaveBtn
@onready var load_btn: Button = $Center/Panel/Margin/VBox/LoadBtn
@onready var skin_btn: Button = $Center/Panel/Margin/VBox/SkinBtn
@onready var relaxed_btn: Button = $Center/Panel/Margin/VBox/RelaxedBtn
@onready var touch_btn: Button = $Center/Panel/Margin/VBox/TouchBtn
@onready var music_vol_btn: Button = $Center/Panel/Margin/VBox/MusicVolBtn
@onready var sfx_vol_btn: Button = $Center/Panel/Margin/VBox/SfxVolBtn


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	resume_btn.pressed.connect(_close)
	save_btn.pressed.connect(_on_save)
	load_btn.pressed.connect(_on_load)
	skin_btn.pressed.connect(_on_switch_skin)
	relaxed_btn.pressed.connect(_on_toggle_relaxed)
	touch_btn.pressed.connect(_on_toggle_touch)
	music_vol_btn.pressed.connect(_on_cycle_music_vol)
	sfx_vol_btn.pressed.connect(_on_cycle_sfx_vol)
	_refresh_labels()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed(&"pause") and not SceneService.ref.is_busy():
		get_viewport().set_input_as_handled()
		if visible:
			_close()
		else:
			_open()


func _open() -> void:
	_refresh_labels()
	visible = true
	get_tree().paused = true
	AudioService.ref.play_ui_id(&"ui_click")
	resume_btn.grab_focus()


func _close() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	visible = false
	get_tree().paused = false


func _refresh_labels() -> void:
	var gs: GameStateStore = GameStateStore.ref
	title_label.text = tr("ui_pause_title")
	resume_btn.text = tr("ui_resume")
	save_btn.text = tr("ui_save")
	load_btn.text = tr("ui_load")
	var skin_key: String = "ui_skin_mc2" if gs.skin_id == &"mc2" else "ui_skin_mc2_slave"
	skin_btn.text = tr("ui_switch_skin") % tr(skin_key)
	var rel_key: String = "ui_on" if gs.relaxed_mode else "ui_off"
	relaxed_btn.text = tr("ui_relaxed_mode") % tr(rel_key)
	var touch_key: String = "ui_on" if gs.is_touch_enabled() else "ui_off"
	touch_btn.text = tr("ui_touch_controls") % tr(touch_key)
	music_vol_btn.text = tr("ui_music_vol") % ("%d%%" % roundi(gs.music_volume * 100.0))
	sfx_vol_btn.text = tr("ui_sfx_vol") % ("%d%%" % roundi(gs.sfx_volume * 100.0))


func _on_save() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	if SaveService.ref.save_slot(1):
		EventsBus.ref.notification_requested.emit(tr("msg_saved"))
	else:
		EventsBus.ref.notification_requested.emit(tr("msg_save_failed"))


func _on_load() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	if not SaveService.ref.has_slot(1):
		EventsBus.ref.notification_requested.emit(tr("msg_no_save"))
		return
	if not SaveService.ref.load_slot(1):
		EventsBus.ref.notification_requested.emit(tr("msg_load_failed"))
		return
	_close()
	EventsBus.ref.notification_requested.emit(tr("msg_loaded"))
	SceneService.ref.change_map(GameStateStore.ref.current_map, GameStateStore.ref.spawn_id, true)


func _on_switch_skin() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	GameStateStore.ref.toggle_skin()
	_refresh_labels()


func _on_toggle_relaxed() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	GameStateStore.ref.toggle_relaxed_mode()
	_refresh_labels()


func _on_toggle_touch() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	GameStateStore.ref.toggle_touch_controls()
	_refresh_labels()


func _next_vol_step(cur: float) -> float:
	if cur >= 0.9:
		return 0.0
	if cur >= 0.4:
		return 1.0
	return 0.5


func _on_cycle_music_vol() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	GameStateStore.ref.set_music_volume(_next_vol_step(GameStateStore.ref.music_volume))
	_refresh_labels()


func _on_cycle_sfx_vol() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	GameStateStore.ref.set_sfx_volume(_next_vol_step(GameStateStore.ref.sfx_volume))
	_refresh_labels()
