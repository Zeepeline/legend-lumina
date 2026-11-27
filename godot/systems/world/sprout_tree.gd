class_name SproutTree
extends BuildingProp

const TEX_BIG: Texture2D = preload("res://assets/art/nature/tree_big.png")
const TEX_BIG_DARK: Texture2D = preload("res://assets/art/nature/tree_big_dark.png")
const TEX_BIG_SNOW: Texture2D = preload("res://assets/art/nature/tree_big_snow.png")
const TEX_BIG_SWAMP: Texture2D = preload("res://assets/art/nature/tree_big_swamp.png")
const TEX_APPLE: Texture2D = preload("res://assets/art/nature/tree_apple.png")
const TEX_ORANGE: Texture2D = preload("res://assets/art/nature/tree_orange.png")
const TEX_TALL: Texture2D = preload("res://assets/art/nature/tree_tall.png")
const TEX_TALL_DARK: Texture2D = preload("res://assets/art/nature/tree_tall_dark.png")
const TEX_TALL_SNOW: Texture2D = preload("res://assets/art/nature/tree_tall_snow.png")
const TEX_GIANT: Texture2D = preload("res://assets/art/nature/tree_giant.png")

@export_enum("big", "tall", "big_dark", "tall_dark", "apple", "orange", "snow", "snow_tall", "swamp", "giant") var variant: String = "big"


func _ready() -> void:
	super._ready()
	_apply_variant()


func _apply_variant() -> void:
	if sprite == null:
		return
	var is_giant: bool = variant == "giant"
	var tex: Texture2D = TEX_BIG
	match variant:
		"big":
			tex = TEX_BIG
		"big_dark":
			tex = TEX_BIG_DARK
		"snow":
			tex = TEX_BIG_SNOW
		"swamp":
			tex = TEX_BIG_SWAMP
		"apple":
			tex = TEX_APPLE
		"orange":
			tex = TEX_ORANGE
		"tall":
			tex = TEX_TALL
		"tall_dark":
			tex = TEX_TALL_DARK
		"snow_tall":
			tex = TEX_TALL_SNOW
		"giant":
			tex = TEX_GIANT

	sprite.texture = tex
	sprite.scale = Vector2.ONE
	sprite.offset = Vector2(0.0, -float(tex.get_height()) * 0.5)
	sprite.modulate = Color.WHITE

	var shadow: Node2D = get_node_or_null("Shadow") as Node2D
	if shadow != null:
		shadow.scale = Vector2(2.2, 2.2) if is_giant else Vector2.ONE

	var mat: ShaderMaterial = sprite.material as ShaderMaterial
	if mat != null:
		var unique_mat: ShaderMaterial = mat.duplicate() as ShaderMaterial
		unique_mat.set_shader_parameter("phase_offset", fmod(absf(position.x * 0.07 + position.y * 0.03), TAU))
		sprite.material = unique_mat

