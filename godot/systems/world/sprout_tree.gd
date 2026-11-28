@tool
class_name SproutTree
extends BuildingProp
## Pohon pixel-art seragam 10 varian dengan sprite sheet animasi 8 frame (daun bergoyang, akar diam) & auto-fade kanopi raksasa.

const SHEET_MAP: Dictionary = {
	"big": preload("res://assets/art/nature/tree_big_sheet.png"),
	"big_dark": preload("res://assets/art/nature/tree_big_dark_sheet.png"),
	"snow": preload("res://assets/art/nature/tree_big_snow_sheet.png"),
	"swamp": preload("res://assets/art/nature/tree_big_swamp_sheet.png"),
	"apple": preload("res://assets/art/nature/tree_apple_sheet.png"),
	"orange": preload("res://assets/art/nature/tree_orange_sheet.png"),
	"tall": preload("res://assets/art/nature/tree_tall_sheet.png"),
	"tall_dark": preload("res://assets/art/nature/tree_tall_dark_sheet.png"),
	"snow_tall": preload("res://assets/art/nature/tree_tall_snow_sheet.png"),
	"giant": preload("res://assets/art/nature/tree_giant_sheet.png"),
}
const SHEET_FRAMES: int = 8

@export_enum("big", "tall", "big_dark", "tall_dark", "apple", "orange", "snow", "snow_tall", "swamp", "giant") var variant: String = "big":
	set(v):
		variant = v
		if is_inside_tree():
			_apply_variant()

var _canopy_fade_tween: Tween = null
var _sway_timer: Timer = null
var _sil_shadow: Sprite2D = null


func _ready() -> void:
	if Engine.is_editor_hint():
		_apply_variant()
		return
	super._ready()
	_apply_variant()
	if variant == "giant":
		_setup_canopy_fade()


func _apply_variant() -> void:
	var spr: Sprite2D = sprite if sprite != null else get_node_or_null("Sprite2D") as Sprite2D
	if spr == null:
		return
	var is_giant: bool = variant == "giant"
	var tex: Texture2D = SHEET_MAP.get(variant, SHEET_MAP["big"]) as Texture2D

	spr.texture = tex
	spr.hframes = SHEET_FRAMES
	spr.vframes = 1
	spr.frame = posmod(int(absf(position.x * 0.13 + position.y * 0.07)), SHEET_FRAMES)
	spr.scale = Vector2.ONE
	spr.offset = Vector2(0.0, -float(tex.get_height()) * 0.5)
	spr.modulate = Color.WHITE

	if not Engine.is_editor_hint() and _sway_timer == null:
		_sway_timer = Timer.new()
		_sway_timer.wait_time = 0.22
		_sway_timer.autostart = true
		_sway_timer.timeout.connect(_on_sway_tick)
		add_child(_sway_timer)

	var shadow: Node2D = get_node_or_null("Shadow") as Node2D
	if shadow != null:
		shadow.visible = false

	# Bayangan siluet asli mengikuti bentuk & animasi pohon (miring + pipih di tanah)
	if _sil_shadow == null:
		_sil_shadow = get_node_or_null("SilhouetteShadow") as Sprite2D
	if _sil_shadow == null:
		_sil_shadow = Sprite2D.new()
		_sil_shadow.name = "SilhouetteShadow"
		_sil_shadow.z_index = -1
		_sil_shadow.show_behind_parent = true
		add_child(_sil_shadow)
	_sil_shadow.texture = tex
	_sil_shadow.hframes = SHEET_FRAMES
	_sil_shadow.vframes = 1
	_sil_shadow.frame = spr.frame
	_sil_shadow.centered = true
	_sil_shadow.offset = Vector2(0.0, -float(tex.get_height()) * 0.5)
	_sil_shadow.position = Vector2(0.0, 0.0)
	_sil_shadow.scale = Vector2(1.0, 0.40)
	_sil_shadow.skew = -0.52
	_sil_shadow.modulate = Color(0.04, 0.09, 0.14, 0.28)
	if not Engine.is_editor_hint():
		_update_sun_shadow()

	if not Engine.is_editor_hint():
		var mat: ShaderMaterial = spr.material as ShaderMaterial
		if mat != null:
			var unique_mat: ShaderMaterial = mat.duplicate() as ShaderMaterial
			unique_mat.set_shader_parameter("phase_offset", fmod(absf(position.x * 0.07 + position.y * 0.03), TAU))
			spr.material = unique_mat


func _on_sway_tick() -> void:
	if sprite != null and sprite.hframes > 1:
		sprite.frame = (sprite.frame + 1) % sprite.hframes
		if _sil_shadow != null:
			_sil_shadow.frame = sprite.frame
			_update_sun_shadow()


func _update_sun_shadow() -> void:
	if _sil_shadow == null or GameStateStore.ref == null:
		return
	var h: float = GameStateStore.ref.world_hour
	if h < 5.5 or h > 18.5:
		_sil_shadow.modulate.a = 0.06
		_sil_shadow.skew = 0.0
		_sil_shadow.scale.y = 0.24
		return
	var sun_t: float = clampf((h - 6.0) / 12.0, 0.0, 1.0)
	_sil_shadow.skew = lerpf(-0.95, 0.95, sun_t)
	_sil_shadow.scale.y = lerpf(0.28, 0.56, absf(sun_t - 0.5) * 2.0)
	_sil_shadow.modulate.a = 0.08 + 0.24 * sin(sun_t * PI)


func _setup_canopy_fade() -> void:
	var area: Area2D = Area2D.new()
	area.name = "CanopyFadeZone"
	area.collision_layer = 0
	area.collision_mask = 2
	area.monitoring = true
	area.monitorable = false
	var cs: CollisionShape2D = CollisionShape2D.new()
	var rect: RectangleShape2D = RectangleShape2D.new()
	rect.size = Vector2(104.0, 168.0)
	cs.shape = rect
	cs.position = Vector2(0.0, -112.0)
	area.add_child(cs)
	add_child(area)
	area.body_entered.connect(_on_canopy_body_entered)
	area.body_exited.connect(_on_canopy_body_exited)


func _on_canopy_body_entered(body: Node) -> void:
	if body.is_in_group(&"player"):
		_tween_canopy_alpha(0.52)


func _on_canopy_body_exited(body: Node) -> void:
	if body.is_in_group(&"player"):
		_tween_canopy_alpha(1.0)


func _tween_canopy_alpha(target_a: float) -> void:
	if sprite == null or not is_inside_tree():
		return
	if _canopy_fade_tween != null and _canopy_fade_tween.is_valid():
		_canopy_fade_tween.kill()
	_canopy_fade_tween = create_tween()
	_canopy_fade_tween.tween_property(sprite, "modulate:a", target_a, 0.18)
