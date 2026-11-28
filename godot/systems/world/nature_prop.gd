@tool
class_name NatureProp
extends StaticBody2D
## Semak & batu organik (YSorted mid-ground).
## Batu besar solid (punya collision di pangkal); semak & batu kecil bisa dilewati,
## dan semak bergetar lembut (rustle) saat pemain berjalan melewatinya.

const TEX_MAP: Dictionary = {
	"bush_green": "res://assets/art/nature/bush_green.png",
	"bush_berry": "res://assets/art/nature/bush_berry.png",
	"bush_swamp": "res://assets/art/nature/bush_swamp.png",
	"bush_snow": "res://assets/art/nature/bush_snow.png",
	"rock_big": "res://assets/art/nature/rock_big.png",
	"rock_small": "res://assets/art/nature/rock_small.png",
	"rock_moss": "res://assets/art/nature/rock_moss.png",
	"rock_snow": "res://assets/art/nature/rock_snow.png",
	"rock_river": "res://assets/art/nature/rock_river.png",
}

@export var prop_kind: String = "bush_green":
	set(v):
		prop_kind = v
		if is_inside_tree():
			_rebuild_visual()

var _sprite: Sprite2D = null
var _rustle_t: float = 0.0
var _phase: float = 0.0
var _is_bush: bool = false


func _ready() -> void:
	_phase = fmod(absf(position.x * 0.13 + position.y * 0.17), TAU)
	_rebuild_visual()
	if Engine.is_editor_hint():
		set_process(false)
		return
	if _is_bush:
		_setup_rustle_area()
		set_process(true)
	else:
		set_process(false)


func _rebuild_visual() -> void:
	_is_bush = prop_kind.begins_with("bush_")
	var path: String = str(TEX_MAP.get(prop_kind, TEX_MAP["bush_green"]))
	var tex: Texture2D = ResourceLoader.load(path) as Texture2D

	_sprite = get_node_or_null("Sprite") as Sprite2D
	if _sprite == null:
		_sprite = Sprite2D.new()
		_sprite.name = "Sprite"
		add_child(_sprite)
	_sprite.texture = tex
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	if tex != null:
		# Pivot di pangkal bawah agar YSort & goyangan rustle natural
		_sprite.offset = Vector2(0.0, -tex.get_height() * 0.42)

	# Batu besar solid (collision kecil di pangkal bawah), semak & batu kecil walkable
	var is_solid: bool = (prop_kind == "rock_big" or prop_kind == "rock_moss" or prop_kind == "rock_snow")
	var col_node: CollisionShape2D = get_node_or_null("Col") as CollisionShape2D
	if is_solid:
		collision_layer = 1
		collision_mask = 0
		if col_node == null:
			col_node = CollisionShape2D.new()
			col_node.name = "Col"
			add_child(col_node)
		var shape: RectangleShape2D = RectangleShape2D.new()
		shape.size = Vector2(14.0, 8.0)
		col_node.shape = shape
		col_node.position = Vector2(0.0, -2.0)
	else:
		collision_layer = 0
		collision_mask = 0
		if col_node != null:
			col_node.queue_free()


func _setup_rustle_area() -> void:
	var area: Area2D = get_node_or_null("RustleArea") as Area2D
	if area == null:
		area = Area2D.new()
		area.name = "RustleArea"
		area.collision_layer = 0
		area.collision_mask = 2 # Player layer
		add_child(area)
		var cs: CollisionShape2D = CollisionShape2D.new()
		var circ: CircleShape2D = CircleShape2D.new()
		circ.radius = 9.0
		cs.shape = circ
		cs.position = Vector2(0.0, -3.0)
		area.add_child(cs)
	if not area.body_entered.is_connected(_on_body_entered):
		area.body_entered.connect(_on_body_entered)


func _on_body_entered(_body: Node2D) -> void:
	_rustle_t = 0.45


func _process(delta: float) -> void:
	if _sprite == null:
		return
	var t: float = float(Time.get_ticks_msec()) * 0.001
	var wind: float = sin(t * 1.8 + _phase) * 0.025
	if _rustle_t > 0.0:
		_rustle_t = maxf(0.0, _rustle_t - delta)
		var shake: float = sin(_rustle_t * 36.0) * 0.14 * (_rustle_t / 0.45)
		_sprite.rotation = wind + shake
		_sprite.scale = Vector2(1.0 + 0.08 * (_rustle_t / 0.45), 1.0 - 0.06 * (_rustle_t / 0.45))
	else:
		_sprite.rotation = wind
		_sprite.scale = Vector2.ONE
