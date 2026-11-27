class_name HeroSprites
extends RefCounted

const CELL_W: int = 64
const CELL_H: int = 56

const TEX_SLAVE: Texture2D = preload("res://assets/art/hero/hero_mc2_slave.png")
const TEX_MC2: Texture2D = preload("res://assets/art/hero/hero_mc2.png")

static var _cache: Dictionary = {}


static func get_frames(skin_id: StringName) -> SpriteFrames:
	if _cache.has(skin_id):
		return _cache[skin_id] as SpriteFrames
	var tex: Texture2D = TEX_MC2 if skin_id == &"mc2" else TEX_SLAVE
	var sf: SpriteFrames = _build(tex)
	_cache[skin_id] = sf
	return sf


static func _atlas(tex: Texture2D, col: int, row: int) -> AtlasTexture:
	var at: AtlasTexture = AtlasTexture.new()
	at.atlas = tex
	at.region = Rect2(col * CELL_W, row * CELL_H, CELL_W, CELL_H)
	return at


static func _add_row_anim(
	sf: SpriteFrames,
	tex: Texture2D,
	anim_name: StringName,
	row: int,
	fps: float,
	loop: bool,
	durations: Array[float] = []
) -> void:
	sf.add_animation(anim_name)
	sf.set_animation_speed(anim_name, fps)
	sf.set_animation_loop(anim_name, loop)
	for col: int in 4:
		var dur: float = durations[col] if col < durations.size() else 1.0
		sf.add_frame(anim_name, _atlas(tex, col, row), dur)


static func _add_8frame_walk(
	sf: SpriteFrames,
	tex: Texture2D,
	anim_name: StringName,
	start_row: int,
	count: int,
	fps: float,
	durations: Array[float] = []
) -> void:
	sf.add_animation(anim_name)
	sf.set_animation_speed(anim_name, fps)
	sf.set_animation_loop(anim_name, true)
	for i: int in count:
		var row: int = start_row + (i >> 2)
		var col: int = i % 4
		var dur: float = durations[i] if i < durations.size() else 1.0
		sf.add_frame(anim_name, _atlas(tex, col, row), dur)


static func _build(tex: Texture2D) -> SpriteFrames:
	var sf: SpriteFrames = SpriteFrames.new()
	if sf.has_animation(&"default"):
		sf.remove_animation(&"default")

	_add_row_anim(sf, tex, &"idle_down", 0, 2.5, true)
	_add_row_anim(sf, tex, &"idle_up", 2, 2.5, true)
	_add_row_anim(sf, tex, &"idle_side", 4, 2.5, true)

	var side_weights: Array[float] = [0.6, 1.2, 1.2, 0.6, 1.2, 1.2]
	_add_8frame_walk(sf, tex, &"walk_side", 39, 6, 10.5, side_weights)
	_add_8frame_walk(sf, tex, &"walk_up", 41, 8, 12.0)
	_add_8frame_walk(sf, tex, &"walk_down", 43, 8, 12.0)
	_add_8frame_walk(sf, tex, &"walk_down_side", 47, 8, 12.0)
	_add_8frame_walk(sf, tex, &"walk_up_side", 49, 8, 12.0)

	var atk_weights: Array[float] = [0.55, 0.85, 1.2, 1.0]
	_add_row_anim(sf, tex, &"atk1_down", 7, 14.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk2_down", 8, 14.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk3_down", 13, 11.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk1_up", 9, 14.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk2_up", 10, 14.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk3_up", 14, 11.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk1_side", 11, 14.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk2_side", 12, 14.0, false, atk_weights)
	_add_row_anim(sf, tex, &"atk3_side", 15, 11.0, false, atk_weights)

	var cast_w: Array[float] = [0.8, 1.0, 1.0, 1.4]
	_add_row_anim(sf, tex, &"cast_down", 25, 14.0, false, cast_w)
	_add_row_anim(sf, tex, &"cast_up", 26, 14.0, false, cast_w)
	_add_row_anim(sf, tex, &"cast_side", 27, 14.0, false, cast_w)

	_add_row_anim(sf, tex, &"roll_down", 19, 14.0, false)
	_add_row_anim(sf, tex, &"roll_up", 20, 14.0, false)
	_add_row_anim(sf, tex, &"roll_side", 21, 14.0, false)

	sf.add_animation(&"hurt")
	sf.set_animation_speed(&"hurt", 10.0)
	sf.set_animation_loop(&"hurt", false)
	sf.add_frame(&"hurt", _atlas(tex, 0, 22))
	sf.add_frame(&"hurt", _atlas(tex, 1, 22))

	_add_row_anim(sf, tex, &"die", 23, 6.0, false)
	_add_row_anim(sf, tex, &"rise", 24, 8.0, false)
	return sf
