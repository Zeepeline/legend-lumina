class_name EnemyChaseState
extends State

var _returning: bool = false


func enter(_msg: Dictionary) -> void:
	var e: EnemyBase = actor as EnemyBase
	_returning = false
	e.set_attack_hitbox(false)
	e.play_anim(&"move")
	e.notify_boss_hp(true)


func physics_update(_delta: float) -> void:
	var e: EnemyBase = actor as EnemyBase
	if e.data == null:
		finished.emit(&"Idle", {})
		return
	var player: Node2D = e.find_player()
	var dist_home: float = e.global_position.distance_to(e.home_pos)
	var spd: float = e.effective_speed()

	if _returning or player == null or dist_home > e.data.leash_radius:
		_returning = true
		var to_home: Vector2 = e.home_pos - e.global_position
		if to_home.length() <= 10.0 or spd <= 0.0:
			e.notify_boss_hp(false)
			finished.emit(&"Idle", {})
			return
		var dir_home: Vector2 = to_home.normalized()
		e.face_toward(dir_home)
		e.velocity = dir_home * spd
		e.move_and_slide()
		e.play_anim(&"move")
		return

	var to_player: Vector2 = player.global_position - e.global_position
	var dist_player: float = to_player.length()
	if dist_player > e.data.aggro_radius * 1.45:
		_returning = true
		return
	if dist_player <= e.data.attack_range:
		finished.emit(&"Windup", {})
		return

	var dir: Vector2 = to_player.normalized()
	e.face_toward(dir)
	if spd > 0.0:
		e.velocity = dir * spd
		e.move_and_slide()
		e.play_anim(&"move")
	else:
		e.velocity = Vector2.ZERO
		e.play_anim(&"idle")
