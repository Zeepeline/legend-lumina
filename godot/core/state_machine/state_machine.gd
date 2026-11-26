class_name StateMachine
extends Node

signal transitioned(from: StringName, to: StringName)

@export var initial_state: State
@export var actor: Node

var current: State = null
var _states: Dictionary = {}
var _transitioning: bool = false
var _queued: Array[Array] = []


func _ready() -> void:
	for child: Node in get_children():
		if child is State:
			var s: State = child as State
			_states[StringName(s.name)] = s
			s.actor = actor
			s.machine = self
			s.finished.connect(transition_to)
	if initial_state == null:
		push_error("StateMachine '%s' has no initial_state" % get_path())
		return
	if owner != null and not owner.is_node_ready():
		await owner.ready
	current = initial_state
	current.enter({})


func transition_to(target: StringName, msg: Dictionary = {}) -> void:
	if _transitioning:
		_queued.append([target, msg])
		return
	if not _states.has(target):
		push_error("StateMachine: unknown state '%s' on %s" % [target, get_path()])
		return
	_transitioning = true
	var from: StringName = StringName(current.name) if current != null else &""
	if current != null:
		current.exit()
	current = _states[target]
	current.enter(msg)
	_transitioning = false
	transitioned.emit(from, target)
	if OS.is_debug_build():
		var actor_label: String = String(actor.name) if actor != null else String(name)
		print_verbose("[FSM] %s: %s -> %s" % [actor_label, from, target])
	if not _queued.is_empty():
		var next: Array = _queued.pop_front()
		var next_target: StringName = next[0]
		var next_msg: Dictionary = next[1]
		transition_to(next_target, next_msg)


func is_in(state_name: StringName) -> bool:
	return current != null and StringName(current.name) == state_name


func _process(delta: float) -> void:
	if current != null:
		current.update(delta)


func _physics_process(delta: float) -> void:
	if current != null:
		current.physics_update(delta)


func _unhandled_input(event: InputEvent) -> void:
	if current != null:
		current.handle_input(event)
