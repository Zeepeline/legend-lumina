class_name SproutTree
extends BuildingProp

const SPROUT_OBJS_TEX: Texture2D = preload("res://assets/art/ground/deco_sprout_objs.png")

@export_enum("big", "tall", "big_dark", "tall_dark", "apple", "orange", "snow", "snow_tall", "swamp", "giant") var variant: String = "big"


func _ready() -> void:
	super._ready()
	_apply_variant()


func _apply_variant() -> void:
	if sprite == null:
		return
	var is_tall: bool = variant == "tall" or variant == "tall_dark" or variant == "snow_tall"
	var is_fruit: bool = variant == "apple" or variant == "orange"
	var is_giant: bool = variant == "giant"
	var at: AtlasTexture = AtlasTexture.new()
	at.atlas = SPROUT_OBJS_TEX
	if is_tall:
		at.region = Rect2(1, 0, 14, 29)
		sprite.offset = Vector2(0.0, -14.5)
	elif is_fruit:
		at.region = Rect2(52, 1, 24, 31)
		sprite.offset = Vector2(0.0, -15.5)
	else:
		at.region = Rect2(20, 1, 24, 31)
		sprite.offset = Vector2(0.0, -15.5)
	sprite.texture = at
	sprite.scale = Vector2(4.2, 4.2) if is_giant else Vector2(3.0, 3.0)
	sprite.modulate = Color.WHITE

	var shadow: Node2D = get_node_or_null("Shadow") as Node2D
	if shadow != null:
		shadow.scale = Vector2(1.4, 1.4) if is_giant else Vector2.ONE

	var tint_id: int = 0
	if variant == "big_dark" or variant == "tall_dark" or variant == "giant":
		tint_id = 1
	elif variant == "snow" or variant == "snow_tall":
		tint_id = 2
	elif variant == "swamp":
		tint_id = 3
	elif variant == "orange":
		tint_id = 4

	var mat: ShaderMaterial = sprite.material as ShaderMaterial
	if mat != null:
		var unique_mat: ShaderMaterial = mat.duplicate() as ShaderMaterial
		unique_mat.set_shader_parameter("phase_offset", fmod(absf(position.x * 0.07 + position.y * 0.03), TAU))
		unique_mat.set_shader_parameter("biome_tint", tint_id)
		sprite.material = unique_mat
