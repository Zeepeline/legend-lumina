class_name State
extends Node

@warning_ignore("unused_signal")
signal finished(next_state: StringName, msg: Dictionary)

var actor: Node = null
var machine: StateMachine = null


func enter(_msg: Dictionary) -> void:
	pass


func exit() -> void:
	pass


func update(_delta: float) -> void:
	pass


func physics_update(_delta: float) -> void:
	pass


func handle_input(_event: InputEvent) -> void:
	pass
