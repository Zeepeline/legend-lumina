class_name Interactable
extends Area2D

signal interacted(by: Node)

@export var prompt_key: String = "prompt_talk"


func _ready() -> void:
	monitorable = true
	monitoring = false


func interact(by: Node) -> void:
	interacted.emit(by)
