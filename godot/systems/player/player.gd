class_name Player
extends CharacterBody2D

const PROJECTILE_SCENE: PackedScene = preload("res://systems/combat/projectile.tscn")

@export var move_speed: float = 92.0
@export var roll_speed: float = 195.0

@onready var sprite: AnimatedSprite2D = $Sprite
@onready var camera: Camera2D = $Camera2D
@onready var state_machine: StateMachine = $StateMachine
@onready var hurtbox: Hurtbox = $Hurtbox
@onready var melee_hitbox: Hitbox = $MeleeHitbox
@onready var melee_shape: CollisionShape2D = $MeleeHitbox/CollisionShape2D
@onready var interact_finder: Area2D = $InteractFinder
@onready var torch_light: PointLight2D = $TorchLight

var facing: Vector2 = Vector2.DOWN
var combo_step: int = 0
var combo_window: float = 0.0
var attack_buffered: bool = false
var attack_hold_time: float = 0.0
var roll_cooldown: float = 0.0
var fireball_cooldown: float = 0.0
var cast_anim_t: float = 0.0 ## sisa waktu pose merapal (anim cast_*), menahan anim diam/jalan
var stamina_delay: float = 0.0
const AIM_RANGE: float = 60.0

var invuln_timer: float = 0.0
var pending_knockback: Vector2 = Vector2.ZERO

var _shake_amp: float = 0.0
var _shake_time: float = 0.0
var _smoothing_restore_frames: int = 0
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()
var _interactables: Array[Area2D] = []


func _ready() -> void:
	_rng.randomize()
	_apply_skin(GameStateStore.ref.skin_id)
	_setup_torch_light()
	_refresh_torch_visibility(GameStateStore.ref.world_hour)
	melee_hitbox.source = self
	hurtbox.hurt.connect(_on_hurtbox_hurt)
	interact_finder.area_entered.connect(_on_interact_area_entered)
	interact_finder.area_exited.connect(_on_interact_area_exited)
	EventsBus.ref.skin_changed.connect(_apply_skin)
	EventsBus.ref.dialogue_requested.connect(_on_dialogue_requested)
	EventsBus.ref.dialogue_finished.connect(_on_dialogue_finished)
	EventsBus.ref.time_of_day_changed.connect(_refresh_torch_visibility)


func _physics_process(delta: float) -> void:
	if _smoothing_restore_frames > 0:
		_smoothing_restore_frames -= 1
		if camera != null:
			camera.reset_smoothing()
			camera.force_update_scroll()
			if _smoothing_restore_frames == 0:
				camera.position_smoothing_enabled = true
	if combo_window > 0.0:
		combo_window = maxf(0.0, combo_window - delta)
		if combo_window <= 0.0 and not state_machine.is_in(&"Attack"):
			combo_step = 0
	if roll_cooldown > 0.0:
		roll_cooldown = maxf(0.0, roll_cooldown - delta)
	if fireball_cooldown > 0.0:
		fireball_cooldown = maxf(0.0, fireball_cooldown - delta)
		cast_anim_t = maxf(0.0, cast_anim_t - delta)
	if stamina_delay > 0.0:
		stamina_delay = maxf(0.0, stamina_delay - delta)
	if invuln_timer > 0.0:
		invuln_timer = maxf(0.0, invuln_timer - delta)
		if invuln_timer <= 0.0 and not state_machine.is_in(&"Roll") and not state_machine.is_in(&"Dead"):
			hurtbox.set_invulnerable(false)
			sprite.modulate.a = 1.0
	if _shake_time > 0.0:
		_shake_time = maxf(0.0, _shake_time - delta)
		camera.offset = Vector2(
			_rng.randf_range(-_shake_amp, _shake_amp),
			_rng.randf_range(-_shake_amp, _shake_amp)
		)
		if _shake_time <= 0.0:
			camera.offset = Vector2.ZERO

	if state_machine.is_in(&"Idle") or state_machine.is_in(&"Move") or state_machine.is_in(&"Attack"):
		if Input.is_action_pressed(&"attack"):
			attack_hold_time += delta
			if attack_hold_time >= 0.42 and not state_machine.is_in(&"Charge"):
				attack_hold_time = 0.0
				try_start_charge_spin()
		else:
			attack_hold_time = 0.0
	else:
		attack_hold_time = 0.0


func current_weapon() -> WeaponData:
	return ItemDatabase.get_weapon(GameStateStore.ref.equipped_weapon_id)


func get_move_input() -> Vector2:
	return Input.get_vector(&"move_left", &"move_right", &"move_up", &"move_down")


func update_facing(dir: Vector2) -> void:
	if dir.length_squared() < 0.01:
		return
	facing = dir.normalized()


func dir_suffix_4() -> String:
	if absf(facing.x) >= absf(facing.y):
		return "side"
	return "up" if facing.y < 0.0 else "down"


func play_directional_anim(prefix: String, use_8_dir: bool = false) -> void:
	if cast_anim_t > 0.0 and not prefix.begins_with("cast") and not prefix.begins_with("atk"):
		return
	var suffix: String = dir_suffix_4()
	var flip: bool = facing.x < -0.1
	if use_8_dir:
		var ang: float = facing.angle()
		var sector: int = posmod(roundi(ang / (PI / 4.0)), 8)
		match sector:
			0:
				suffix = "side"
				flip = false
			1:
				suffix = "down_side"
				flip = false
			2:
				suffix = "down"
				flip = false
			3:
				suffix = "down_side"
				flip = true
			4:
				suffix = "side"
				flip = true
			5:
				suffix = "up_side"
				flip = true
			6:
				suffix = "up"
				flip = false
			7:
				suffix = "up_side"
				flip = false
	sprite.flip_h = flip
	var anim_name: StringName = StringName("%s_%s" % [prefix, suffix])
	if sprite.sprite_frames != null and sprite.sprite_frames.has_animation(anim_name):
		if sprite.animation != anim_name or not sprite.is_playing():
			sprite.play(anim_name)


func try_start_attack() -> bool:
	var wpn: WeaponData = current_weapon()
	if not GameStateStore.ref.spend_stamina(wpn.stamina_cost):
		EventsBus.ref.notification_requested.emit(tr("msg_tired"))
		return false
	stamina_delay = CombatMath.STAMINA_REGEN_DELAY
	state_machine.transition_to(&"Attack")
	return true


func try_start_charge_spin() -> bool:
	if not GameStateStore.ref.spend_stamina(CombatMath.STAMINA_SPIN):
		EventsBus.ref.notification_requested.emit(tr("msg_tired"))
		return false
	stamina_delay = CombatMath.STAMINA_REGEN_DELAY
	state_machine.transition_to(&"Charge")
	return true


func try_fireball() -> bool:
	return try_cast_skill()


func try_cycle_skill() -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs.learned_skills.size() <= 1:
		EventsBus.ref.notification_requested.emit(tr("msg_no_other_skill"))
		return
	var next_id: StringName = gs.cycle_active_skill()
	var sk: Dictionary = SkillDatabase.get_skill(next_id)
	AudioService.ref.play_ui_id(&"ui_click")
	if not sk.is_empty():
		EventsBus.ref.notification_requested.emit(tr("msg_active_skill") % tr(String(sk["name_key"])))


func try_cast_skill() -> bool:
	if fireball_cooldown > 0.0:
		return false
	var gs: GameStateStore = GameStateStore.ref
	var sk_id: StringName = gs.active_skill_id
	var sk: Dictionary = SkillDatabase.get_skill(sk_id)
	if sk.is_empty():
		sk_id = &"fire"
		sk = SkillDatabase.get_skill(sk_id)
	var cost_mp: int = int(sk.get("mp_cost", CombatMath.MP_FIREBALL))
	if not gs.spend_mp(cost_mp):
		EventsBus.ref.notification_requested.emit(tr("msg_no_mp"))
		return false
	fireball_cooldown = 0.50
	cast_anim_t = 0.34
	play_directional_anim("cast", false)
	var tier: int = gs.record_skill_use(sk_id)
	var t_mult: float = SkillDatabase.tier_multiplier(tier)
	var power: float = float(sk.get("base_power", 1.9))
	var col: Color = sk.get("color", Color(1.0, 0.56, 0.16)) as Color

	if sk_id == &"fire":
		var proj: Projectile = PROJECTILE_SCENE.instantiate() as Projectile
		proj.source = self
		proj.direction = facing.normalized()
		proj.speed = 165.0
		proj.lifetime = 1.15
		proj.damage = CombatMath.compute_magic_damage(gs.total_magic(), 0, power * t_mult, _rng)
		proj.knockback = 95.0
		proj.orb_color = col
		proj.collision_layer = 16
		proj.collision_mask = 5
		proj.position = global_position + Vector2(0.0, -10.0) + facing * 12.0
		get_parent().add_child(proj)
		AudioService.ref.play_sfx_id(&"fireball")
		return true

	var rad: float = float(sk.get("radius", 60.0)) * (1.0 + 0.1 * float(tier - 1))
	SlashVfx.spawn_aoe_ring(get_parent(), global_position + Vector2(0.0, -8.0), rad, col)

	if sk_id == &"heal":
		var heal_amt: int = maxi(15, roundi(float(gs.total_max_hp()) * 0.24 * t_mult) + roundi(float(gs.total_magic()) * 1.2))
		var gained: int = gs.heal_player(heal_amt)
		AudioService.ref.play_sfx_id(&"heal")
		if gained > 0:
			DamageNumber.spawn(get_parent(), global_position, "+%d" % gained, Color(0.45, 0.95, 0.55))
		return true

	AudioService.ref.play_sfx_id(&"fireball")
	for node: Node in get_tree().get_nodes_in_group(&"enemies"):
		if not (node is EnemyBase):
			continue
		var en: EnemyBase = node as EnemyBase
		if en.hp <= 0:
			continue
		var extra_r: float = en.data.collision_radius if en.data != null else 10.0
		var d: float = global_position.distance_to(en.global_position)
		if d > rad + extra_r:
			continue
		var def_val: int = en.data.defense if en.data != null else 0
		var dmg: int = CombatMath.compute_magic_damage(gs.total_magic(), def_val, power * t_mult, _rng)
		var is_spirit_bonus: bool = sk_id == &"holy" and en.data != null and (en.data.id == &"ghost" or en.data.id == &"wisp")
		if is_spirit_bonus:
			dmg = roundi(float(dmg) * 2.5)
		var push_dir: Vector2 = (en.global_position - global_position).normalized()
		if push_dir.length_squared() < 0.01:
			push_dir = facing
		en.apply_direct_damage(dmg, is_spirit_bonus, push_dir * 90.0)
	return true


func try_start_roll() -> bool:
	if roll_cooldown > 0.0:
		return false
	if not GameStateStore.ref.spend_stamina(CombatMath.STAMINA_ROLL):
		EventsBus.ref.notification_requested.emit(tr("msg_tired"))
		return false
	stamina_delay = CombatMath.STAMINA_REGEN_DELAY
	state_machine.transition_to(&"Roll")
	return true


func try_heal() -> bool:
	if GameStateStore.ref.flask_charges <= 0:
		EventsBus.ref.notification_requested.emit(tr("msg_flask_empty"))
		return false
	if GameStateStore.ref.hp >= GameStateStore.ref.total_max_hp():
		EventsBus.ref.notification_requested.emit(tr("msg_hp_full"))
		return false
	var gained: int = GameStateStore.ref.use_flask()
	if gained > 0:
		AudioService.ref.play_sfx_id(&"heal")
		DamageNumber.spawn(get_parent(), global_position, "+%d" % gained, Color(0.45, 0.95, 0.55))
		return true
	return false


func try_interact() -> bool:
	var target: Area2D = _nearest_interactable()
	if target == null:
		return false
	if target.has_method("interact"):
		target.call("interact", self)
		return true
	return false


func activate_melee_hitbox(step: int) -> void:
	var wpn: WeaponData = current_weapon()
	var dmg_res: Dictionary = CombatMath.compute_damage(
		GameStateStore.ref.total_attack(),
		0,
		step,
		wpn.damage_mult,
		wpn.crit_chance,
		_rng
	)
	melee_hitbox.damage = dmg_res["amount"]
	melee_hitbox.is_crit = dmg_res["is_crit"]
	melee_hitbox.knockback = wpn.knockback * CombatMath.combo_knockback_multiplier(step)
	var shape_circle: CircleShape2D = melee_shape.shape as CircleShape2D
	if shape_circle != null:
		shape_circle.radius = wpn.hitbox_radius * (1.2 if step >= 3 else 1.0)
	melee_hitbox.position = Vector2(0.0, -10.0) + facing * wpn.hitbox_reach
	melee_hitbox.set_active(true)


func activate_spin_hitbox() -> void:
	var wpn: WeaponData = current_weapon()
	var dmg_res: Dictionary = CombatMath.compute_charge_damage(
		GameStateStore.ref.total_attack(),
		0,
		wpn.damage_mult,
		_rng
	)
	melee_hitbox.damage = dmg_res["amount"]
	melee_hitbox.is_crit = dmg_res["is_crit"]
	melee_hitbox.knockback = wpn.knockback * 2.0
	var shape_circle: CircleShape2D = melee_shape.shape as CircleShape2D
	if shape_circle != null:
		shape_circle.radius = 36.0
	melee_hitbox.position = Vector2(0.0, -10.0)
	melee_hitbox.set_active(true)


func deactivate_melee_hitbox() -> void:
	melee_hitbox.set_active(false)


func spawn_slash_fx(step: int) -> void:
	var fx_pos: Vector2 = global_position + Vector2(0.0, -12.0) + facing * 12.0
	SlashVfx.spawn_swing(get_parent(), fx_pos, facing, step)
	AudioService.ref.play_sfx_id(&"swing")
	if step >= 3:
		shake_camera(2.5, 0.10)
		DamageNumber.spawn(get_parent(), global_position + Vector2(0.0, -12.0), tr("msg_combo"), Color(1.0, 0.88, 0.4))


func set_camera_zoom(z: Vector2) -> void:
	camera.zoom = z


func set_camera_limits(bounds: Rect2i, zoom_val: float = 1.0) -> void:
	var view_w: float = 480.0 / maxf(0.5, zoom_val)
	var view_h: float = 270.0 / maxf(0.5, zoom_val)
	var pad_x: int = maxi(0, int((view_w - float(bounds.size.x)) * 0.5))
	var pad_y: int = maxi(0, int((view_h - float(bounds.size.y)) * 0.5))
	camera.limit_left = bounds.position.x - pad_x
	camera.limit_top = bounds.position.y - pad_y
	camera.limit_right = bounds.position.x + bounds.size.x + pad_x
	camera.limit_bottom = bounds.position.y + bounds.size.y + pad_y
	snap_camera()


func snap_camera() -> void:
	if camera == null:
		return
	camera.position_smoothing_enabled = false
	camera.make_current()
	camera.reset_smoothing()
	camera.force_update_scroll()
	_smoothing_restore_frames = 2


## Bidik bantu: arah ke musuh hidup terdekat dalam AIM_RANGE. Bila ada arah masukan, hanya musuh dalam ±70° dari
## arah itu yang dipertimbangkan (pemain tetap bisa memilih sasaran). Mengembalikan Vector2.ZERO bila tidak ada.
func aim_assist_dir(input_dir: Vector2) -> Vector2:
	if GameStateStore.ref == null or not GameStateStore.ref.aim_assist:
		return Vector2.ZERO
	var best: Vector2 = Vector2.ZERO
	var best_d: float = AIM_RANGE
	var from: Vector2 = global_position + Vector2(0.0, -8.0)
	for n: Node in get_tree().get_nodes_in_group(&"enemies"):
		var e: Node2D = n as Node2D
		if e == null or not is_instance_valid(e) or not e.is_visible_in_tree():
			continue
		var sm: Variant = e.get("state_machine")
		if sm != null and (sm as StateMachine).is_in(&"Dead"):
			continue
		var to: Vector2 = (e.global_position + Vector2(0.0, -8.0)) - from
		var d: float = to.length()
		if d < 1.0 or d >= best_d:
			continue
		if input_dir.length_squared() > 0.01 and input_dir.normalized().dot(to / d) < 0.34:
			continue
		best_d = d
		best = to / d
	return best


func shake_camera(intensity: float, duration: float) -> void:
	_shake_amp = maxf(_shake_amp, intensity)
	_shake_time = maxf(_shake_time, duration)


func _setup_torch_light() -> void:
	if torch_light == null:
		return
	var grad: Gradient = Gradient.new()
	grad.colors = PackedColorArray([Color(1.0, 0.85, 0.62, 1.0), Color(1.0, 0.72, 0.42, 0.0)])
	grad.offsets = PackedFloat32Array([0.0, 1.0])
	var gtex: GradientTexture2D = GradientTexture2D.new()
	gtex.width = 128
	gtex.height = 128
	gtex.fill = GradientTexture2D.FILL_RADIAL
	gtex.fill_from = Vector2(0.5, 0.5)
	gtex.fill_to = Vector2(1.0, 0.5)
	gtex.gradient = grad
	torch_light.texture = gtex


func _refresh_torch_visibility(hour: float) -> void:
	if torch_light == null:
		return
	var gs: GameStateStore = GameStateStore.ref
	var is_night: bool = hour >= 18.5 or hour < 5.5
	torch_light.enabled = gs.is_dark_cave or (not gs.is_indoor and is_night)
	torch_light.energy = 0.85


func _apply_skin(skin_id: StringName) -> void:
	if sprite == null:
		return
	sprite.sprite_frames = HeroSprites.get_frames(skin_id)
	play_directional_anim("idle", false)


func _nearest_interactable() -> Area2D:
	var best: Area2D = null
	var best_d: float = INF
	for area: Area2D in _interactables:
		if not is_instance_valid(area):
			continue
		var d: float = global_position.distance_squared_to(area.global_position)
		if d < best_d:
			best_d = d
			best = area
	return best


func _refresh_interact_prompt() -> void:
	var nearest: Area2D = _nearest_interactable()
	if nearest == null:
		EventsBus.ref.interact_prompt_changed.emit("", false)
		return
	var prompt_key: String = str(nearest.get("prompt_key"))
	EventsBus.ref.interact_prompt_changed.emit(prompt_key, true)


func _on_interact_area_entered(area: Area2D) -> void:
	if not _interactables.has(area):
		_interactables.append(area)
	_refresh_interact_prompt()


func _on_interact_area_exited(area: Area2D) -> void:
	_interactables.erase(area)
	_refresh_interact_prompt()


func _on_hurtbox_hurt(hitbox: Hitbox) -> void:
	if state_machine.is_in(&"Dead") or state_machine.is_in(&"Roll") or invuln_timer > 0.0:
		return
	var dmg: int = CombatMath.compute_enemy_damage(
		hitbox.damage,
		GameStateStore.ref.total_defense(),
		GameStateStore.ref.relaxed_mode,
		_rng
	)
	GameStateStore.ref.damage_player(dmg)
	AudioService.ref.play_sfx_id(&"hit")
	DamageNumber.spawn(get_parent(), global_position, "-%d" % dmg, Color(1.0, 0.42, 0.42))
	var push_dir: Vector2 = (global_position - hitbox.global_position).normalized()
	if push_dir.length_squared() < 0.01:
		push_dir = -facing
	pending_knockback = push_dir * hitbox.knockback
	if GameStateStore.ref.hp <= 0:
		state_machine.transition_to(&"Dead")
	else:
		state_machine.transition_to(&"Hurt")


func _on_dialogue_requested(_data: DialogueData) -> void:
	state_machine.transition_to(&"Locked")


func _on_dialogue_finished(_id: StringName) -> void:
	if state_machine.is_in(&"Locked"):
		state_machine.transition_to(&"Idle")
