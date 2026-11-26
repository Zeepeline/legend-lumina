class_name TouchControls
extends Control

@onready var joystick_area: Control = $JoystickArea
@onready var btn_attack: Button = $ActionPad/AttackButton
@onready var btn_roll: Button = $ActionPad/RollButton
@onready var btn_interact: Button = $ActionPad/InteractButton
@onready var btn_heal: Button = $ActionPad/HealButton
@onready var btn_skill: Button = $ActionPad/SkillButton

const JOY_RADIUS: float = 28.0
const DEADZONE: float = 0.22

var _touch_idx: int = -1
var _mouse_dragging: bool = false
var _joy_origin: Vector2 = Vector2(36.0, 36.0)
var _knob_offset: Vector2 = Vector2.ZERO


func _ready() -> void:
	visible = GameStateStore.ref.is_touch_enabled()
	EventsBus.ref.touch_controls_toggled.connect(_on_toggled)
	EventsBus.ref.dialogue_requested.connect(_on_dialogue_started)
	EventsBus.ref.dialogue_finished.connect(_on_dialogue_ended)
	joystick_area.gui_input.connect(_on_joystick_gui_input)

	btn_attack.text = tr("ui_touch_atk")
	btn_roll.text = tr("ui_touch_roll")
	btn_interact.text = tr("ui_touch_act")
	btn_heal.text = tr("ui_touch_heal")
	btn_skill.text = tr("ui_touch_skill")

	_bind_action_button(btn_attack, &"attack")
	_bind_action_button(btn_roll, &"roll")
	_bind_action_button(btn_interact, &"interact")
	_bind_action_button(btn_heal, &"heal")
	_bind_action_button(btn_skill, &"skill")


func _bind_action_button(btn: Button, action_name: StringName) -> void:
	btn.button_down.connect(func() -> void: Input.action_press(action_name))
	btn.button_up.connect(func() -> void: Input.action_release(action_name))


func _on_toggled(enabled: bool) -> void:
	visible = enabled
	if not enabled:
		_reset_joystick()


func _on_dialogue_started(_data: DialogueData) -> void:
	visible = false
	_reset_joystick()


func _on_dialogue_ended(_id: StringName) -> void:
	visible = GameStateStore.ref.is_touch_enabled()


func _on_joystick_gui_input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventScreenTouch:
		var st: InputEventScreenTouch = event as InputEventScreenTouch
		if st.pressed and _touch_idx == -1:
			_touch_idx = st.index
			_update_joystick(st.position)
			joystick_area.accept_event()
		elif not st.pressed and st.index == _touch_idx:
			_reset_joystick()
			joystick_area.accept_event()
	elif event is InputEventScreenDrag:
		var sd: InputEventScreenDrag = event as InputEventScreenDrag
		if sd.index == _touch_idx:
			_update_joystick(sd.position)
			joystick_area.accept_event()
	elif event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_LEFT:
			if mb.pressed:
				_mouse_dragging = true
				_update_joystick(mb.position)
			else:
				_reset_joystick()
			joystick_area.accept_event()
	elif event is InputEventMouseMotion and _mouse_dragging:
		var mm: InputEventMouseMotion = event as InputEventMouseMotion
		_update_joystick(mm.position)
		joystick_area.accept_event()


func _update_joystick(local_pos: Vector2) -> void:
	var delta: Vector2 = local_pos - _joy_origin
	var clamped: Vector2 = delta.limit_length(JOY_RADIUS)
	_knob_offset = clamped
	var norm: Vector2 = clamped / JOY_RADIUS
	_apply_move_action(&"move_left", norm.x < -DEADZONE, clampf(-norm.x, 0.0, 1.0))
	_apply_move_action(&"move_right", norm.x > DEADZONE, clampf(norm.x, 0.0, 1.0))
	_apply_move_action(&"move_up", norm.y < -DEADZONE, clampf(-norm.y, 0.0, 1.0))
	_apply_move_action(&"move_down", norm.y > DEADZONE, clampf(norm.y, 0.0, 1.0))
	joystick_area.queue_redraw()


func _apply_move_action(action_name: StringName, pressed: bool, strength: float) -> void:
	if pressed:
		Input.action_press(action_name, strength)
	else:
		Input.action_release(action_name)


func _reset_joystick() -> void:
	_touch_idx = -1
	_mouse_dragging = false
	_knob_offset = Vector2.ZERO
	for action_name: StringName in [&"move_left", &"move_right", &"move_up", &"move_down"]:
		Input.action_release(action_name)
	joystick_area.queue_redraw()
