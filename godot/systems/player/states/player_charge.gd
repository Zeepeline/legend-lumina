class_name PlayerChargeState
extends State

var _elapsed: float = 0.0
var _hit_done: bool = false
const DURATION: float = 0.34


func enter(_msg: Dictionary) -> void:
	var p: Player = actor as Player
	_elapsed = 0.0
	_hit_done = false
	p.velocity = Vector2.ZERO
	p.play_directional_anim("atk3", false)
	SlashVfx.spawn_charge_spin(p.get_parent(), p.global_position + Vector2(0.0, -10.0))
	AudioService.ref.play_sfx_id(&"spin")
	p.shake_camera(3.2, 0.14)
	DamageNumber.spawn(p.get_parent(), p.global_position + Vector2(0.0, -14.0), tr("msg_spin"), Color(1.0, 0.9, 0.42))


func exit() -> void:
	var p: Player = actor as Player
	p.deactivate_melee_hitbox()


func physics_update(delta: float) -> void:
	var p: Player = actor as Player
	_elapsed += delta
	if _elapsed >= 0.04 and not _hit_done:
		_hit_done = true
		p.activate_spin_hitbox()
	if _elapsed >= 0.22:
		p.deactivate_melee_hitbox()
	if _elapsed >= DURATION:
		var dir: Vector2 = p.get_move_input()
		if dir.length_squared() > 0.01:
			finished.emit(&"Move", {})
		else:
			finished.emit(&"Idle", {})
