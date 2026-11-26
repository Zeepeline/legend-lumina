class_name PlayerRollState
extends State

var _elapsed: float = 0.0
const ROLL_DURATION: float = 0.28


func enter(_msg: Dictionary) -> void:
	var p: Player = actor as Player
	_elapsed = 0.0
	var dir_in: Vector2 = p.get_move_input()
	if dir_in.length_squared() > 0.01:
		p.update_facing(dir_in)
	p.hurtbox.set_invulnerable(true)
	p.sprite.modulate.a = 0.72
	p.velocity = p.facing * p.roll_speed
	p.play_directional_anim("roll", false)
	AudioService.ref.play_sfx_id(&"roll")


func exit() -> void:
	var p: Player = actor as Player
	p.roll_cooldown = 0.22
	if p.invuln_timer <= 0.0:
		p.hurtbox.set_invulnerable(false)
		p.sprite.modulate.a = 1.0
	p.velocity = Vector2.ZERO


func physics_update(delta: float) -> void:
	var p: Player = actor as Player
	_elapsed += delta
	p.move_and_slide()
	if _elapsed >= ROLL_DURATION:
		var dir: Vector2 = p.get_move_input()
		if dir.length_squared() > 0.01:
			finished.emit(&"Move", {})
		else:
			finished.emit(&"Idle", {})
