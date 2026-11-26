class_name EnemyIdleState
extends State

var _wander_dir: Vector2 = Vector2.ZERO
var _timer: float = 0.0


func enter(_msg: Dictionary) -> void:
	var e: EnemyBase = actor as EnemyBase
	e.velocity = Vector2.ZERO
	e.set_attack_hitbox(false)
	e.play_anim(&"idle")
	_timer = e.rng.randf_range(0.6, 1.6)
	_wander_dir = Vector2.ZERO


func physics_update(delta: float) -> void:
	var e: EnemyBase = actor as EnemyBase
	var player: Node2D = e.find_player()
	if player != null and e.data != null:
		var dist_to_player: float = e.global_position.distance_to(player.global_position)
		if dist_to_player <= e.data.aggro_radius:
			finished.emit(&"Chase", {})
			return

	_timer -= delta
	if _timer <= 0.0:
		if _wander_dir == Vector2.ZERO and e.global_position.distance_to(e.home_pos) < 40.0:
			var ang: float = e.rng.randf_range(0.0, TAU)
			_wander_dir = Vector2.from_angle(ang)
			_timer = e.rng.randf_range(0.6, 1.1)
			e.face_toward(_wander_dir)
			e.play_anim(&"move")
		else:
			_wander_dir = Vector2.ZERO
			_timer = e.rng.randf_range(1.0, 2.0)
			e.play_anim(&"idle")

	var spd: float = (e.data.move_speed * 0.45) if e.data != null else 20.0
	e.velocity = _wander_dir * spd
	e.move_and_slide()
