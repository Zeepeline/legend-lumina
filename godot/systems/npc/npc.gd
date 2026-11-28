class_name NpcActor
extends CharacterBody2D

@export var npc_name_key: String = ""
@export var sprite_sheet: Texture2D
@export var dialogue: DialogueData
@export var facing_dir: String = "down"
@export var wander_radius: float = 0.0
@export var shop_id: StringName = &""
@export var shop_title_key: String = ""
@export var shop_item_ids: Array[StringName] = []
@export var teach_skill_id: StringName = &""
@export var teach_cost: int = 0

@onready var sprite: AnimatedSprite2D = $Sprite
@onready var interactable: Interactable = $Interactable
@onready var name_label: Label = $NameLabel

var _home_pos: Vector2 = Vector2.ZERO
var _wander_target: Vector2 = Vector2.ZERO
var _move_timer: float = 0.0
var _is_talking: bool = false
var _is_portrait: bool = false
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	_rng.randomize()
	_home_pos = global_position
	_wander_target = _home_pos
	if not npc_name_key.is_empty():
		name_label.text = tr(npc_name_key)
	name_label.visible = false
	if shop_id != &"":
		interactable.prompt_key = "prompt_shop"
	if sprite_sheet != null:
		sprite.sprite_frames = _build_frames(sprite_sheet)
	_play_idle(facing_dir)
	interactable.interacted.connect(_on_interacted)
	interactable.body_entered.connect(_on_near_body_entered)
	interactable.body_exited.connect(_on_near_body_exited)
	if EventsBus.ref != null:
		EventsBus.ref.dialogue_finished.connect(_on_dialogue_finished)
	if wander_radius <= 0.0:
		set_physics_process(false)


func _on_near_body_entered(body: Node) -> void:
	if body.is_in_group(&"player") and not npc_name_key.is_empty():
		name_label.visible = true


func _on_near_body_exited(body: Node) -> void:
	if body.is_in_group(&"player"):
		name_label.visible = false


func _physics_process(delta: float) -> void:
	if _is_talking or wander_radius <= 0.0:
		velocity = Vector2.ZERO
		return
	_move_timer -= delta
	if _move_timer <= 0.0:
		if global_position.distance_to(_wander_target) <= 4.0:
			var ang: float = _rng.randf_range(0.0, TAU)
			var dist: float = _rng.randf_range(8.0, wander_radius)
			_wander_target = _home_pos + Vector2.from_angle(ang) * dist
			_move_timer = _rng.randf_range(2.0, 4.2)
		else:
			_wander_target = global_position
			_move_timer = _rng.randf_range(1.2, 2.6)
	var delta_pos: Vector2 = _wander_target - global_position
	if delta_pos.length() > 3.0:
		var dir: Vector2 = delta_pos.normalized()
		velocity = dir * 24.0
		move_and_slide()
		_face_vector(dir, true)
	else:
		velocity = Vector2.ZERO
		_play_idle(facing_dir)


func _build_frames(tex: Texture2D) -> SpriteFrames:
	var sf: SpriteFrames = SpriteFrames.new()
	if sf.has_animation(&"default"):
		sf.remove_animation(&"default")
	var w: int = tex.get_width()
	var h: int = tex.get_height()
	if w == 512 and h == 224:
		# Lembar NPC bergaya tokoh utama (tools/npc_from_mc.py): sel 64×56, 8 kolom × 4 baris
		_is_portrait = false
		sprite.offset = Vector2(0.0, -28.0)
		_slice_row(sf, tex, &"walk_down", 0, 8.0, 4, 64, 56)
		_slice_row(sf, tex, &"walk_up", 1, 8.0, 4, 64, 56)
		_slice_row(sf, tex, &"walk_side", 2, 8.0, 4, 64, 56)
		_slice_row_cols(sf, tex, &"idle_down", 3, 0, 2.5, 2, 64, 56)
		_slice_row_cols(sf, tex, &"idle_side", 3, 2, 2.5, 2, 64, 56)
		_slice_row_cols(sf, tex, &"idle_up", 3, 4, 2.5, 2, 64, 56)
	elif w == 384 and h >= 240:
		_is_portrait = false
		sprite.offset = Vector2(0.0, -24.0)
		_slice_row(sf, tex, &"walk_down", 0, 7.0, 4, 48, 48)
		_slice_row(sf, tex, &"walk_up", 1, 7.0, 4, 48, 48)
		_slice_row(sf, tex, &"walk_side", 2, 7.0, 4, 48, 48)
		_slice_row_cols(sf, tex, &"idle_down", 3, 0, 2.5, 2, 48, 48)
		_slice_row_cols(sf, tex, &"idle_side", 3, 2, 2.5, 2, 48, 48)
		_slice_row_cols(sf, tex, &"idle_up", 3, 4, 2.5, 2, 48, 48)
	elif w >= 192 and h >= 240:
		_is_portrait = false
		sprite.offset = Vector2(0.0, -20.0)
		var specs: Array[Array] = [
			[&"idle_down", 0, 2.5, 2],
			[&"walk_down", 1, 6.0, 4],
			[&"idle_up", 2, 2.5, 2],
			[&"walk_up", 3, 6.0, 4],
			[&"idle_side", 4, 2.5, 2],
			[&"walk_side", 5, 6.0, 4],
		]
		for spec: Array in specs:
			_slice_row(sf, tex, spec[0], spec[1], spec[2], spec[3], 48, 40)
	elif w >= 128 and h >= 224:
		_is_portrait = false
		sprite.offset = Vector2(0.0, -16.0)
		var mila_specs: Array[Array] = [
			[&"idle_down", 1, 2.5, 2],
			[&"walk_down", 1, 6.0, 4],
			[&"idle_up", 2, 2.5, 2],
			[&"walk_up", 3, 6.0, 4],
			[&"idle_side", 4, 2.5, 2],
			[&"walk_side", 5, 6.0, 4],
		]
		for spec: Array in mila_specs:
			_slice_row(sf, tex, spec[0], spec[1], spec[2], spec[3], 32, 32)
	else:
		_is_portrait = true
		sprite.offset = Vector2(0.0, -float(h) * 0.5)
		var at: AtlasTexture = AtlasTexture.new()
		at.atlas = tex
		at.region = Rect2(0, 0, mini(32, w), mini(32, h))
		for anim_name: StringName in [&"idle_down", &"idle_up", &"idle_side", &"walk_down", &"walk_up", &"walk_side"]:
			sf.add_animation(anim_name)
			sf.set_animation_speed(anim_name, 2.0)
			sf.set_animation_loop(anim_name, true)
			sf.add_frame(anim_name, at)
	return sf


func _slice_row(
	sf: SpriteFrames,
	tex: Texture2D,
	anim_name: StringName,
	row: int,
	fps: float,
	count: int,
	cw: int,
	ch: int
) -> void:
	_slice_row_cols(sf, tex, anim_name, row, 0, fps, count, cw, ch)


func _slice_row_cols(
	sf: SpriteFrames,
	tex: Texture2D,
	anim_name: StringName,
	row: int,
	start_col: int,
	fps: float,
	count: int,
	cw: int,
	ch: int
) -> void:
	sf.add_animation(anim_name)
	sf.set_animation_speed(anim_name, fps)
	sf.set_animation_loop(anim_name, true)
	for i: int in count:
		var at: AtlasTexture = AtlasTexture.new()
		at.atlas = tex
		at.region = Rect2((start_col + i) * cw, row * ch, cw, ch)
		sf.add_frame(anim_name, at)


func _face_vector(vec: Vector2, walking: bool) -> void:
	if absf(vec.x) >= absf(vec.y):
		facing_dir = "left" if vec.x < 0.0 else "right"
	else:
		facing_dir = "up" if vec.y < 0.0 else "down"
	if walking:
		_play_walk(facing_dir)
	else:
		_play_idle(facing_dir)


func _play_idle(dir_str: String) -> void:
	var suffix: String = "side" if (dir_str == "left" or dir_str == "right") else dir_str
	sprite.flip_h = dir_str == "left"
	var anim_name: StringName = StringName("idle_%s" % suffix)
	if sprite.sprite_frames != null and sprite.sprite_frames.has_animation(anim_name):
		sprite.play(anim_name)


func _play_walk(dir_str: String) -> void:
	var suffix: String = "side" if (dir_str == "left" or dir_str == "right") else dir_str
	sprite.flip_h = dir_str == "left"
	var anim_name: StringName = StringName("walk_%s" % suffix)
	if sprite.sprite_frames != null and sprite.sprite_frames.has_animation(anim_name):
		if sprite.animation != anim_name:
			sprite.play(anim_name)


func _on_interacted(by: Node) -> void:
	if by is Node2D:
		var player_node: Node2D = by as Node2D
		_face_vector(player_node.global_position - global_position, false)
	if StoryManager.ref != null and StoryManager.ref.try_handle_npc_interaction(npc_name_key, self):
		return
	if shop_id != &"":
		var title: String = shop_title_key if not shop_title_key.is_empty() else npc_name_key
		EventsBus.ref.shop_requested.emit(shop_id, title, shop_item_ids)
		return
	if teach_skill_id != &"" and not GameStateStore.ref.learned_skills.has(teach_skill_id):
		if teach_cost > 0 and GameStateStore.ref.gold < teach_cost:
			EventsBus.ref.notification_requested.emit(tr("msg_not_enough_gold") % teach_cost)
		elif GameStateStore.ref.learn_skill(teach_skill_id, teach_cost):
			var sk: Dictionary = SkillDatabase.get_skill(teach_skill_id)
			AudioService.ref.play_sfx_id(&"level_up")
			if not sk.is_empty():
				EventsBus.ref.notification_requested.emit(tr("msg_skill_learned") % tr(String(sk["name_key"])))
	if dialogue != null:
		_is_talking = true
		EventsBus.ref.dialogue_requested.emit(dialogue)


func _on_dialogue_finished(_id: StringName) -> void:
	_is_talking = false
