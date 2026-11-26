class_name DialogueBox
extends Control

@onready var speaker_label: Label = $Panel/Margin/VBox/SpeakerLabel
@onready var body_label: Label = $Panel/Margin/VBox/BodyLabel
@onready var hint_label: Label = $Panel/Margin/VBox/HintLabel

var _current_data: DialogueData = null
var _line_index: int = 0
var _char_accum: float = 0.0
var _is_typing: bool = false


func _ready() -> void:
	visible = false
	set_process(false)
	hint_label.text = tr("ui_dialogue_hint")
	EventsBus.ref.dialogue_requested.connect(_on_dialogue_requested)


func _process(delta: float) -> void:
	if not _is_typing:
		return
	_char_accum += delta * 42.0
	var total: int = body_label.get_total_character_count()
	var shown: int = mini(total, int(_char_accum))
	body_label.visible_characters = shown
	if shown >= total:
		_is_typing = false
		set_process(false)


func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_action_pressed(&"interact") or event.is_action_pressed(&"attack") or event.is_action_pressed(&"ui_accept"):
		get_viewport().set_input_as_handled()
		_advance()


func _gui_input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			accept_event()
			_advance()
	elif event is InputEventScreenTouch:
		var st: InputEventScreenTouch = event as InputEventScreenTouch
		if st.pressed:
			accept_event()
			_advance()


func _on_dialogue_requested(data: DialogueData) -> void:
	if data == null or data.line_keys.is_empty():
		return
	_current_data = data
	_line_index = 0
	speaker_label.text = tr(data.speaker_key)
	visible = true
	_show_line(_line_index)


func _show_line(idx: int) -> void:
	body_label.text = tr(_current_data.line_keys[idx])
	body_label.visible_characters = 0
	_char_accum = 0.0
	_is_typing = true
	set_process(true)
	AudioService.ref.play_sfx_id(&"talk", &"UI", -9.0)


func _advance() -> void:
	if _is_typing:
		body_label.visible_characters = -1
		_is_typing = false
		set_process(false)
		return
	_line_index += 1
	if _current_data != null and _line_index < _current_data.line_keys.size():
		_show_line(_line_index)
		return
	var finished_id: StringName = _current_data.id if _current_data != null else &""
	_current_data = null
	visible = false
	set_process(false)
	EventsBus.ref.dialogue_finished.emit(finished_id)
