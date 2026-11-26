class_name Projectile
extends Hitbox

var direction: Vector2 = Vector2.RIGHT
var speed: float = 135.0
var lifetime: float = 1.6
var orb_color: Color = Color(1.0, 0.52, 0.14)

@onready var orb_poly: Polygon2D = $Orb


func _ready() -> void:
	monitoring = true
	monitorable = true
	orb_poly.color = orb_color
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)


func _physics_process(delta: float) -> void:
	position += direction * speed * delta
	lifetime -= delta
	if lifetime <= 0.0:
		queue_free()


func _on_body_entered(_body: Node2D) -> void:
	queue_free()


func _on_area_entered(area: Area2D) -> void:
	if area is Hurtbox and area.get_parent() != source:
		call_deferred(&"queue_free")
