class_name EnemyAttackState
extends State

var _elapsed: float = 0.0
var _atk_sec: float = 0.25
var _rec_sec: float = 0.55
var _hit_disabled: bool = false


func enter(_msg: Dictionary) -> void:
	var e: EnemyBase = actor as EnemyBase
	_elapsed = 0.0
	_hit_disabled = false
	_atk_sec = e.data.attack_sec if e.data != null else 0.25
	_rec_sec = e.data.recover_sec if e.data != null else 0.55
	var is_ranged: bool = e.data != null and e.data.ai_type == "ranged"
	if is_ranged:
		e.velocity = Vector2.ZERO
		e.fire_ranged_projectile()
		_hit_disabled = true
	else:
		var spd: float = e.data.lunge_speed if e.data != null else 150.0
		e.velocity = e.facing * spd
		e.set_attack_hitbox(true)
	e.play_anim(&"atk")


func exit() -> void:
	var e: EnemyBase = actor as EnemyBase
	e.set_attack_hitbox(false)
	e.velocity = Vector2.ZERO


func physics_update(delta: float) -> void:
	var e: EnemyBase = actor as EnemyBase
	_elapsed += delta
	if _elapsed >= _atk_sec and not _hit_disabled:
		_hit_disabled = true
		e.set_attack_hitbox(false)
		e.velocity = Vector2.ZERO
		e.play_anim(&"idle")
	elif _elapsed < _atk_sec and e.velocity != Vector2.ZERO:
		e.move_and_slide()

	if _elapsed >= _atk_sec + _rec_sec:
		finished.emit(&"Chase", {})
