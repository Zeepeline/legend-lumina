class_name PlayerAttackState
extends State

var _elapsed: float = 0.0
var _duration: float = 0.28
var _hit_start: float = 0.055
var _hit_end: float = 0.17
var _hitbox_on: bool = false
var _vfx_spawned: bool = false


func enter(_msg: Dictionary) -> void:
	var p: Player = actor as Player
	if p.combo_window > 0.0:
		p.combo_step = (p.combo_step % 3) + 1
	else:
		p.combo_step = 1
	p.attack_buffered = false
	_elapsed = 0.0
	_hitbox_on = false
	_vfx_spawned = false

	var is_finisher: bool = p.combo_step >= 3
	_duration = 0.38 if is_finisher else 0.26
	_hit_start = 0.075 if is_finisher else 0.050
	_hit_end = 0.22 if is_finisher else 0.15

	var dir_in: Vector2 = p.get_move_input()
	if dir_in.length_squared() > 0.01:
		p.update_facing(dir_in)

	var lunge_spd: float = 165.0 if is_finisher else 110.0
	p.velocity = p.facing * lunge_spd
	p.play_directional_anim("atk%d" % p.combo_step, false)


func exit() -> void:
	var p: Player = actor as Player
	p.deactivate_melee_hitbox()
	p.combo_window = 0.55
	p.velocity = Vector2.ZERO


func physics_update(delta: float) -> void:
	var p: Player = actor as Player
	_elapsed += delta

	if Input.is_action_just_pressed(&"roll") and p.try_start_roll():
		return
	if Input.is_action_just_pressed(&"attack") and _elapsed >= _duration * 0.45:
		p.attack_buffered = true

	if _elapsed >= _hit_start and not _vfx_spawned:
		_vfx_spawned = true
		p.spawn_slash_fx(p.combo_step)

	if _elapsed >= _hit_start and _elapsed <= _hit_end and not _hitbox_on:
		_hitbox_on = true
		p.activate_melee_hitbox(p.combo_step)
	elif _elapsed > _hit_end and _hitbox_on:
		_hitbox_on = false
		p.deactivate_melee_hitbox()

	if _elapsed > 0.09:
		p.velocity = p.velocity.move_toward(Vector2.ZERO, 650.0 * delta)
	p.move_and_slide()

	if _elapsed >= _duration:
		if p.attack_buffered and p.try_start_attack():
			return
		var dir: Vector2 = p.get_move_input()
		if dir.length_squared() > 0.01:
			finished.emit(&"Move", {})
		else:
			finished.emit(&"Idle", {})
