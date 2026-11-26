class_name PlayerDeadState
extends State

var _elapsed: float = 0.0
var _emitted: bool = false


func enter(_msg: Dictionary) -> void:
	var p: Player = actor as Player
	_elapsed = 0.0
	_emitted = false
	p.velocity = Vector2.ZERO
	p.hurtbox.set_invulnerable(true)
	p.deactivate_melee_hitbox()
	p.sprite.modulate = Color.WHITE
	p.sprite.play(&"die")


func physics_update(delta: float) -> void:
	_elapsed += delta
	if _elapsed >= 1.35 and not _emitted:
		_emitted = true
		EventsBus.ref.player_died.emit()
