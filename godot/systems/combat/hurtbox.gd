class_name Hurtbox
extends Area2D

signal hurt(hitbox: Hitbox)


func _ready() -> void:
	monitorable = false
	monitoring = true
	area_entered.connect(_on_area_entered)


func set_invulnerable(invuln: bool) -> void:
	set_deferred("monitoring", not invuln)


func _on_area_entered(area: Area2D) -> void:
	if area is Hitbox:
		var hb: Hitbox = area as Hitbox
		var owner_node: Node = get_parent()
		if hb.can_hit(owner_node):
			hb.register_hit(owner_node)
			hurt.emit(hb)
