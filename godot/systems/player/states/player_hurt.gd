class_name PlayerHurtState
extends State

var _elapsed: float = 0.0
const HURT_DURATION: float = 0.24


func enter(_msg: Dictionary) -> void:
	var p: Player = actor as Player
	_elapsed = 0.0
	p.invuln_timer = 0.55
	p.hurtbox.set_invulnerable(true)
	p.velocity = p.pending_knockback
	p.pending_knockback = Vector2.ZERO
	p.sprite.modulate = Color(2.0, 0.85, 0.85, 0.85)
	p.sprite.play(&"hurt")
	p.shake_camera(3.0, 0.12)


func exit() -> void:
	var p: Player = actor as Player
	p.sprite.modulate = Color(1.0, 1.0, 1.0, 0.75 if p.invuln_timer > 0.0 else 1.0)
	p.velocity = Vector2.ZERO


func physics_update(delta: float) -> void:
	var p: Player = actor as Player
	_elapsed += delta
	p.velocity = p.velocity.move_toward(Vector2.ZERO, 600.0 * delta)
	p.move_and_slide()
	if _elapsed >= HURT_DURATION:
		finished.emit(&"Idle", {})
