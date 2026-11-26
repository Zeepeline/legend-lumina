class_name PlayerMoveState
extends State


func enter(_msg: Dictionary) -> void:
	var p: Player = actor as Player
	p.play_directional_anim("walk", true)


func physics_update(delta: float) -> void:
	var p: Player = actor as Player
	if p.stamina_delay <= 0.0:
		GameStateStore.ref.regen_stamina(delta, 0.85)
	if Input.is_action_just_pressed(&"interact") and p.try_interact():
		return
	if Input.is_action_just_pressed(&"heal") and p.try_heal():
		return
	if Input.is_action_just_pressed(&"cycle_skill"):
		p.try_cycle_skill()
	if Input.is_action_just_pressed(&"skill") and p.try_cast_skill():
		return
	if Input.is_action_just_pressed(&"roll") and p.try_start_roll():
		return
	if Input.is_action_just_pressed(&"attack") and p.try_start_attack():
		return
	var dir: Vector2 = p.get_move_input()
	if dir.length_squared() <= 0.01:
		finished.emit(&"Idle", {})
		return
	p.update_facing(dir)
	p.velocity = dir * p.move_speed
	p.move_and_slide()
	p.play_directional_anim("walk", true)
