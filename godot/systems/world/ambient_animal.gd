class_name AmbientAnimal
extends CharacterBody2D

const TEX_RABBIT: Texture2D = preload("res://assets/art/animals/ani_rabbit.png")
const TEX_SQUIRREL: Texture2D = preload("res://assets/art/animals/ani_squirrel.png")
const TEX_DUCK: Texture2D = preload("res://assets/art/animals/ani_duck.png")
const TEX_OWL: Texture2D = preload("res://assets/art/animals/ani_owl.png")
const TEX_DEER: Texture2D = preload("res://assets/art/animals/ani_deer.png")

@export_enum("rabbit", "squirrel", "duck", "owl", "deer") var species: String = "rabbit"

@onready var sprite: AnimatedSprite2D = $Sprite

var _home: Vector2 = Vector2.ZERO
var _move_dir: Vector2 = Vector2.ZERO
var _timer: float = 1.0
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	_rng.randomize()
	_home = global_position
	_setup_frames()


func _setup_frames() -> void:
	var tex: Texture2D = TEX_RABBIT
	match species:
		"squirrel":
			tex = TEX_SQUIRREL
		"duck":
			tex = TEX_DUCK
		"owl":
			tex = TEX_OWL
		"deer":
			tex = TEX_DEER
	var cw: int = tex.get_width() / 4
	var ch: int = tex.get_height()
	sprite.offset = Vector2(0.0, -float(ch) * 0.5)

	var sf: SpriteFrames = SpriteFrames.new()
	if sf.has_animation(&"default"):
		sf.remove_animation(&"default")
	sf.add_animation(&"idle")
	sf.set_animation_speed(&"idle", 3.0)
	sf.set_animation_loop(&"idle", true)
	for c: int in 2:
		var at: AtlasTexture = AtlasTexture.new()
		at.atlas = tex
		at.region = Rect2(c * cw, 0, cw, ch)
		sf.add_frame(&"idle", at)

	sf.add_animation(&"move")
	sf.set_animation_speed(&"move", 7.0)
	sf.set_animation_loop(&"move", true)
	for c: int in 4:
		var at: AtlasTexture = AtlasTexture.new()
		at.atlas = tex
		at.region = Rect2(c * cw, 0, cw, ch)
		sf.add_frame(&"move", at)

	sprite.sprite_frames = sf
	sprite.play(&"idle")


func _physics_process(delta: float) -> void:
	var player: Node2D = get_tree().get_first_node_in_group(&"player") as Node2D
	if player != null and global_position.distance_to(player.global_position) < 42.0:
		_move_dir = (global_position - player.global_position).normalized()
		_timer = 0.7
	else:
		_timer -= delta
		if _timer <= 0.0:
			if _move_dir == Vector2.ZERO:
				var to_home: Vector2 = _home - global_position
				if to_home.length() > 56.0:
					_move_dir = to_home.normalized()
				else:
					_move_dir = Vector2.from_angle(_rng.randf_range(0.0, TAU))
				_timer = _rng.randf_range(0.7, 1.4)
			else:
				_move_dir = Vector2.ZERO
				_timer = _rng.randf_range(1.2, 2.8)

	if _move_dir != Vector2.ZERO:
		velocity = _move_dir * 32.0
		move_and_slide()
		if absf(_move_dir.x) > 0.05:
			sprite.flip_h = _move_dir.x < 0.0
		if sprite.animation != &"move":
			sprite.play(&"move")
	else:
		velocity = Vector2.ZERO
		if sprite.animation != &"idle":
			sprite.play(&"idle")
