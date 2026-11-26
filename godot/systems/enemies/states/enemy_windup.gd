class_name EnemyWindupState
extends State

var _timer: float = 0.45


func enter(_msg: Dictionary) -> void:
	var e: EnemyBase = actor as EnemyBase
	e.velocity = Vector2.ZERO
	e.set_attack_hitbox(false)
	_timer = e.data.windup_sec if e.data != null else 0.45
	var player: Node2D = e.find_player()
	if player != null:
		e.face_toward(player.global_position - e.global_position)
	e.sprite.modulate = Color(1.35, 0.72, 0.72)
	e.play_anim(&"wind")


func exit() -> void:
	var e: EnemyBase = actor as EnemyBase
	e.sprite.modulate = e.base_tint()


func physics_update(delta: float) -> void:
	_timer -= delta
	if _timer <= 0.0:
		finished.emit(&"Attack", {})
