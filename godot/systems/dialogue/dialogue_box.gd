class_name DialogueBox
extends Control
## Kotak dialog bergaya kayu & perkamen: potret pembicara berbingkai di kiri, papan nama kayu menempel di atas kotak,
## teks muncul huruf demi huruf (ketuk sekali = tampil penuh, ketuk lagi = lanjut), dan panah merah memantul saat
## baris selesai. Potret diambil dari lembar sprite NPC yang mengajak bicara (`pending_sheet`), bila ada.

## Lembar sprite NPC yang baru saja memulai dialog; diisi npc.gd sebelum memancarkan dialogue_requested.
static var pending_sheet: Texture2D = null

const HERO_SHEET: Texture2D = preload("res://assets/art/hero/hero_mc2.png")

@onready var speaker_label: Label = $NamePlate/SpeakerLabel
@onready var name_plate: PanelContainer = $NamePlate
@onready var body_label: Label = $Panel/HBox/VBox/BodyLabel
@onready var hint_label: Label = $Panel/HBox/VBox/HintLabel
@onready var portrait_frame: PanelContainer = $Panel/HBox/PortraitFrame
@onready var portrait: TextureRect = $Panel/HBox/PortraitFrame/Portrait
@onready var arrow: Control = $Arrow

var _current_data: DialogueData = null
var _line_index: int = 0
var _char_accum: float = 0.0
var _is_typing: bool = false
var _t: float = 0.0


func _ready() -> void:
	visible = false
	hint_label.text = ""
	arrow.draw.connect(_draw_arrow)
	EventsBus.ref.dialogue_requested.connect(_on_dialogue_requested)


func _process(delta: float) -> void:
	_t += delta
	if _is_typing:
		_char_accum += delta * 42.0
		var total: int = body_label.get_total_character_count()
		var shown: int = mini(total, int(_char_accum))
		body_label.visible_characters = shown
		if shown >= total:
			_is_typing = false
	arrow.visible = not _is_typing
	arrow.queue_redraw()


func _draw_arrow() -> void:
	var dy: float = floorf(absf(sin(_t * 5.0)) * 2.0)
	var col: Color = Color(0.639, 0.161, 0.11, 1.0)
	arrow.draw_rect(Rect2(0, dy, 5, 1), col)
	arrow.draw_rect(Rect2(1, dy + 1, 3, 1), col)
	arrow.draw_rect(Rect2(2, dy + 2, 1, 1), col)


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


## Potret kepala 22×22 dari sel diam-bawah sebuah lembar sprite (format NPC 512×224 atau lembar tokoh utama).
static func portrait_from_sheet(sheet: Texture2D) -> Texture2D:
	if sheet == null:
		return null
	var at: AtlasTexture = AtlasTexture.new()
	at.atlas = sheet
	var sz: Vector2 = sheet.get_size()
	if int(sz.x) == 512 and int(sz.y) == 224:
		at.region = Rect2(21, 173, 22, 22)
	elif sheet == HERO_SHEET:
		at.region = Rect2(21, 5, 22, 22)
	else:
		return null
	return at


func _on_dialogue_requested(data: DialogueData) -> void:
	if data == null or data.line_keys.is_empty():
		return
	_current_data = data
	_line_index = 0
	var who: String = tr(data.speaker_key) if not data.speaker_key.is_empty() else ""
	speaker_label.text = who
	name_plate.visible = not who.is_empty()
	var tex: Texture2D = portrait_from_sheet(pending_sheet)
	pending_sheet = null
	portrait.texture = tex
	portrait_frame.visible = tex != null
	visible = true
	set_process(true)
	_show_line(_line_index)


func _show_line(idx: int) -> void:
	body_label.text = tr(_current_data.line_keys[idx])
	body_label.visible_characters = 0
	_char_accum = 0.0
	_is_typing = true
	AudioService.ref.play_sfx_id(&"talk", &"UI", -9.0)


func _advance() -> void:
	if _is_typing:
		body_label.visible_characters = -1
		_is_typing = false
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
