class_name SlashVfx
extends AnimatedSprite2D

const SWING_TEX: Texture2D = preload("res://assets/art/vfx/vfx_swing_combo.png")
const IMPACT_TEX: Texture2D = preload("res://assets/art/vfx/vfx_hit_impact.png")
const SPIN_TEX: Texture2D = preload("res://assets/art/vfx/vfx_charge_spin.png")

static var _swing_frames: SpriteFrames = null
static var _impact_frames: SpriteFrames = null
static var _spin_frames: SpriteFrames = null


static func _get_swing_frames() -> SpriteFrames:
	if _swing_frames != null:
		return _swing_frames
	var sf: SpriteFrames = SpriteFrames.new()
	if sf.has_animation(&"default"):
		sf.remove_animation(&"default")
	for row: int in 5:
		var anim_name: StringName = StringName("swing_%d" % row)
		sf.add_animation(anim_name)
		sf.set_animation_speed(anim_name, 28.0)
		sf.set_animation_loop(anim_name, false)
		for col: int in range(1, 4):
			var atlas: AtlasTexture = AtlasTexture.new()
			atlas.atlas = SWING_TEX
			atlas.region = Rect2(col * 48, row * 36, 48, 36)
			sf.add_frame(anim_name, atlas)
	_swing_frames = sf
	return _swing_frames


static func _get_impact_frames() -> SpriteFrames:
	if _impact_frames != null:
		return _impact_frames
	var sf: SpriteFrames = SpriteFrames.new()
	if sf.has_animation(&"default"):
		sf.remove_animation(&"default")
	for row: int in 2:
		var anim_name: StringName = StringName("hit_%d" % row)
		sf.add_animation(anim_name)
		sf.set_animation_speed(anim_name, 26.0)
		sf.set_animation_loop(anim_name, false)
		for col: int in range(1, 5):
			var atlas: AtlasTexture = AtlasTexture.new()
			atlas.atlas = IMPACT_TEX
			atlas.region = Rect2(col * 48, row * 36, 48, 36)
			sf.add_frame(anim_name, atlas)
	_impact_frames = sf
	return _impact_frames


static func _get_spin_frames() -> SpriteFrames:
	if _spin_frames != null:
		return _spin_frames
	var sf: SpriteFrames = SpriteFrames.new()
	if sf.has_animation(&"default"):
		sf.remove_animation(&"default")
	sf.add_animation(&"spin")
	sf.set_animation_speed(&"spin", 22.0)
	sf.set_animation_loop(&"spin", false)
	for col: int in range(1, 7):
		var atlas: AtlasTexture = AtlasTexture.new()
		atlas.atlas = SPIN_TEX
		atlas.region = Rect2(col * 84, 0, 84, 48)
		sf.add_frame(&"spin", atlas)
	_spin_frames = sf
	return _spin_frames


static func spawn_swing(parent: Node, world_pos: Vector2, dir: Vector2, combo_step: int) -> void:
	if parent == null:
		return
	var vfx: SlashVfx = SlashVfx.new()
	vfx.sprite_frames = _get_swing_frames()
	vfx.position = world_pos
	vfx.rotation = dir.angle()
	vfx.flip_v = dir.x < -0.1
	vfx.offset = Vector2(10.0, 0.0)
	vfx.z_index = 2
	var row: int = 4 if combo_step >= 3 else clampi(combo_step - 1, 0, 2)
	if combo_step >= 3:
		vfx.scale = Vector2(1.35, 1.35)
		vfx.modulate = Color(1.0, 0.92, 0.65)
	else:
		vfx.scale = Vector2(1.15, 1.15)
	parent.add_child(vfx)
	vfx.animation_finished.connect(vfx.queue_free)
	vfx.play(StringName("swing_%d" % row))


static func spawn_impact(parent: Node, world_pos: Vector2, is_crit: bool) -> void:
	if parent == null:
		return
	var vfx: SlashVfx = SlashVfx.new()
	vfx.sprite_frames = _get_impact_frames()
	vfx.position = world_pos
	vfx.z_index = 4
	vfx.scale = Vector2(1.2, 1.2) if is_crit else Vector2(0.95, 0.95)
	if is_crit:
		vfx.modulate = Color(1.0, 0.88, 0.45)
	parent.add_child(vfx)
	vfx.animation_finished.connect(vfx.queue_free)
	vfx.play(&"hit_1" if is_crit else &"hit_0")


static func spawn_charge_spin(parent: Node, world_pos: Vector2) -> void:
	if parent == null:
		return
	var vfx: SlashVfx = SlashVfx.new()
	vfx.sprite_frames = _get_spin_frames()
	vfx.position = world_pos
	vfx.z_index = 3
	vfx.scale = Vector2(1.1, 1.1)
	vfx.modulate = Color(1.0, 0.94, 0.68)
	parent.add_child(vfx)
	vfx.animation_finished.connect(vfx.queue_free)
	vfx.play(&"spin")


static func spawn_aoe_ring(parent: Node, world_pos: Vector2, radius: float, ring_color: Color) -> void:
	if parent == null:
		return
	var poly: Polygon2D = Polygon2D.new()
	var pts: PackedVector2Array = PackedVector2Array()
	var steps: int = 24
	for i: int in steps:
		var ang: float = TAU * float(i) / float(steps)
		pts.append(Vector2(cos(ang) * radius, sin(ang) * radius * 0.72))
	poly.polygon = pts
	poly.position = world_pos
	poly.scale = Vector2(0.25, 0.25)
	poly.color = Color(ring_color.r, ring_color.g, ring_color.b, 0.55)
	poly.z_index = 3
	parent.add_child(poly)
	var tw: Tween = poly.create_tween().set_parallel(true)
	tw.tween_property(poly, "scale", Vector2(1.05, 1.05), 0.28)
	tw.tween_property(poly, "color:a", 0.0, 0.30)
	tw.chain().tween_callback(poly.queue_free)
