class_name PlayerLockedState
extends State


func enter(_msg: Dictionary) -> void:
	var p: Player = actor as Player
	p.velocity = Vector2.ZERO
	p.deactivate_melee_hitbox()
	p.play_directional_anim("idle", false)
