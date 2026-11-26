class_name EnemyHurtState
extends State

var _timer: float = 0.22


func enter(_msg: Dictionary) -> void:
	var e: EnemyBase = actor as EnemyBase
	_timer = 0.22
	e.set_attack_hitbox(false)
	e.velocity = e.pending_knockback
	e.pending_knockback = Vector2.ZERO
	e.sprite.modulate = Color(2.2, 2.2, 2.2)
	e.play_anim(&"hurt")


func exit() -> void:
	var e: EnemyBase = actor as EnemyBase
	e.sprite.modulate = e.base_tint()
	e.velocity = Vector2.ZERO


func physics_update(delta: float) -> void:
	var e: EnemyBase = actor as EnemyBase
	_timer -= delta
	e.velocity = e.velocity.move_toward(Vector2.ZERO, 620.0 * delta)
	e.move_and_slide()
	if _timer <= 0.0:
		finished.emit(&"Chase", {})
