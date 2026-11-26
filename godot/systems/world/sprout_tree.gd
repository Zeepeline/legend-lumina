class_name SproutTree
extends BuildingProp

const SPROUT_OBJS_TEX: Texture2D = preload("res://assets/art/ground/deco_sprout_objs.png")

@export_enum("big", "tall", "big_dark", "tall_dark") var variant: String = "big"


func _ready() -> void:
	super._ready()
	_apply_variant()


func _apply_variant() -> void:
	if sprite == null:
		return
	var is_tall: bool = variant.begins_with("tall")
	var is_dark: bool = variant.ends_with("_dark")
	var at: AtlasTexture = AtlasTexture.new()
	at.atlas = SPROUT_OBJS_TEX
	at.region = Rect2(1, 0, 14, 29) if is_tall else Rect2(20, 1, 24, 31)
	sprite.texture = at
	sprite.offset = Vector2(0.0, -14.5) if is_tall else Vector2(0.0, -15.5)
	sprite.modulate = Color(0.78, 0.84, 0.88, 1.0) if is_dark else Color.WHITE
	var mat: ShaderMaterial = sprite.material as ShaderMaterial
	if mat != null:
		var unique_mat: ShaderMaterial = mat.duplicate() as ShaderMaterial
		unique_mat.set_shader_parameter("phase_offset", fmod(absf(position.x * 0.07 + position.y * 0.03), TAU))
		sprite.material = unique_mat
