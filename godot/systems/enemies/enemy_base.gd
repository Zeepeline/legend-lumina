class_name EnemyBase
extends CharacterBody2D

const PROJECTILE_SCENE: PackedScene = preload("res://systems/combat/projectile.tscn")

@export var data: EnemyData

@onready var sprite: AnimatedSprite2D = $Sprite
@onready var body_shape: CollisionShape2D = $CollisionShape2D
@onready var hurtbox: Hurtbox = $Hurtbox
@onready var hitbox: Hitbox = $Hitbox
@onready var state_machine: StateMachine = $StateMachine
@onready var hp_bar_bg: ColorRect = $HpBarBg
@onready var hp_bar_fill: ColorRect = $HpBarBg/HpBarFill

var hp: int = 50
var max_hp: int = 50
var phase2: bool = false
var home_pos: Vector2 = Vector2.ZERO
var facing: Vector2 = Vector2.RIGHT
var pending_knockback: Vector2 = Vector2.ZERO
var rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	rng.randomize()
	add_to_group(&"enemies")
	home_pos = global_position
	hitbox.source = self
	hurtbox.hurt.connect(_on_hurtbox_hurt)
	if data != null and data.is_boss and not String(data.boss_flag).is_empty():
		if bool(GameStateStore.ref.get_flag(data.boss_flag, false)):
			queue_free()
			return
	_setup_from_data()
	_update_hp_bar()


func _setup_from_data() -> void:
	if data == null:
		return
	max_hp = data.max_hp
	hp = max_hp
	if data.ai_type == "fly":
		collision_mask = 0
	var circle: CircleShape2D = body_shape.shape as CircleShape2D
	if circle != null:
		circle.radius = data.collision_radius
	sprite.scale = Vector2(data.sprite_scale, data.sprite_scale)
	sprite.modulate = data.sprite_tint
	sprite.offset = Vector2(0.0, -float(data.frame_size.y) * 0.5)
	if data.sprite_sheet != null:
		sprite.sprite_frames = _build_sprite_frames(data.sprite_sheet, data.frame_size)
		play_anim(&"idle")


func _build_sprite_frames(tex: Texture2D, fsize: Vector2i) -> SpriteFrames:
	var sf: SpriteFrames = SpriteFrames.new()
	if sf.has_animation(&"default"):
		sf.remove_animation(&"default")
	var specs: Array[Array] = [
		[&"idle", 0, 5.0, true, 4],
		[&"move", 1, 7.0, true, 4],
		[&"wind", 2, 7.0, false, 4],
		[&"atk", 3, 11.0, false, 4],
		[&"hurt", 4, 10.0, false, 2],
		[&"alert", 5, 8.0, false, 4],
	]
	for spec: Array in specs:
		var anim_name: StringName = spec[0]
		var row: int = spec[1]
		var fps: float = spec[2]
		var loop: bool = spec[3]
		var frames_count: int = spec[4]
		sf.add_animation(anim_name)
		sf.set_animation_speed(anim_name, fps)
		sf.set_animation_loop(anim_name, loop)
		for col: int in frames_count:
			var at: AtlasTexture = AtlasTexture.new()
			at.atlas = tex
			at.region = Rect2(col * fsize.x, row * fsize.y, fsize.x, fsize.y)
			sf.add_frame(anim_name, at)
	return sf


func play_anim(anim_name: StringName) -> void:
	if sprite.sprite_frames != null and sprite.sprite_frames.has_animation(anim_name):
		if sprite.animation != anim_name or not sprite.is_playing():
			sprite.play(anim_name)


func face_toward(dir: Vector2) -> void:
	if dir.length_squared() < 0.01:
		return
	facing = dir.normalized()
	if absf(facing.x) > 0.05:
		sprite.flip_h = facing.x < 0.0


func find_player() -> Node2D:
	return get_tree().get_first_node_in_group(&"player") as Node2D


func effective_speed() -> float:
	if data == null:
		return 40.0
	return data.move_speed * (1.25 if phase2 else 1.0)


func effective_attack() -> int:
	if data == null:
		return 10
	return roundi(float(data.attack) * (1.25 if phase2 else 1.0))


func base_tint() -> Color:
	if data == null:
		return Color.WHITE
	if phase2:
		return data.sprite_tint * Color(1.18, 0.78, 0.78)
	return data.sprite_tint


func set_attack_hitbox(enabled: bool) -> void:
	if data == null:
		return
	hitbox.damage = effective_attack()
	hitbox.knockback = 135.0
	hitbox.position = Vector2(0.0, -8.0) + facing * 14.0
	hitbox.set_active(enabled)


func fire_ranged_projectile() -> void:
	if data == null or get_parent() == null:
		return
	var proj: Projectile = PROJECTILE_SCENE.instantiate() as Projectile
	proj.source = self
	proj.direction = facing.normalized()
	proj.speed = 115.0
	proj.lifetime = 1.65
	proj.damage = effective_attack()
	proj.knockback = 85.0
	proj.orb_color = data.projectile_color
	proj.collision_layer = 32
	proj.collision_mask = 3
	proj.position = global_position + Vector2(0.0, -12.0) + facing * 10.0
	get_parent().add_child(proj)


func notify_boss_hp(active: bool) -> void:
	if data != null and data.is_boss and EventsBus.ref != null:
		EventsBus.ref.boss_hp_changed.emit(tr(data.name_key), hp, max_hp, active)


func _update_hp_bar() -> void:
	if hp <= 0 or hp >= max_hp or (data != null and data.is_boss):
		hp_bar_bg.visible = false
		return
	hp_bar_bg.visible = true
	var ratio: float = clampf(float(hp) / float(maxi(1, max_hp)), 0.0, 1.0)
	hp_bar_fill.size.x = 22.0 * ratio


func _on_hurtbox_hurt(incoming: Hitbox) -> void:
	if state_machine.is_in(&"Dead"):
		return
	var def_val: int = data.defense if data != null else 0
	var dmg: int = maxi(1, incoming.damage - int(float(def_val) * 0.5))
	var push_dir: Vector2 = (global_position - incoming.global_position).normalized()
	if push_dir.length_squared() < 0.01:
		push_dir = -facing
	apply_direct_damage(dmg, incoming.is_crit, push_dir * incoming.knockback)


func apply_direct_damage(dmg: int, is_crit_hit: bool, knockback_vec: Vector2) -> void:
	if state_machine.is_in(&"Dead"):
		return
	hp = maxi(0, hp - maxi(1, dmg))
	_update_hp_bar()

	if data != null and data.is_boss:
		if not phase2 and hp > 0 and hp <= int(float(max_hp) * 0.5):
			phase2 = true
			sprite.modulate = base_tint()
			AudioService.ref.play_sfx_id(&"boss_roar")
			EventsBus.ref.notification_requested.emit(tr("msg_boss_phase2") % tr(data.name_key))
		notify_boss_hp(hp > 0)

	SlashVfx.spawn_impact(get_parent(), global_position + Vector2(0.0, -10.0), is_crit_hit)
	var popup_col: Color = Color(1.0, 0.88, 0.35) if is_crit_hit else Color.WHITE
	DamageNumber.spawn(get_parent(), global_position, str(maxi(1, dmg)), popup_col)
	AudioService.ref.play_sfx_id(&"crit" if is_crit_hit else &"hit")

	pending_knockback = knockback_vec
	if hp <= 0:
		state_machine.transition_to(&"Dead")
	else:
		state_machine.transition_to(&"Hurt")
