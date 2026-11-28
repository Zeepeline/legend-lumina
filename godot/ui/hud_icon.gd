class_name HudVectorIcon
extends Control
## Ikon vektor HD tajam untuk HUD kanan atas (matahari, bulan, kompas, koin emas, botol ramuan).

@export_enum("sun", "moon", "compass", "coin", "potion") var icon_kind: String = "coin":
	set(v):
		if icon_kind != v:
			icon_kind = v
			queue_redraw()

var needle_angle: float = -PI * 0.5:
	set(v):
		if not is_equal_approx(needle_angle, v):
			needle_angle = v
			queue_redraw()


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	if custom_minimum_size == Vector2.ZERO:
		custom_minimum_size = Vector2(10.0, 10.0)


func _draw() -> void:
	var c: Vector2 = size * 0.5
	var r: float = minf(size.x, size.y) * 0.44
	match icon_kind:
		"sun":
			_draw_sun(c, r)
		"moon":
			_draw_moon(c, r)
		"compass":
			_draw_compass(c, r)
		"coin":
			_draw_coin(c, r)
		"potion":
			_draw_potion(c, r)


func _draw_sun(c: Vector2, r: float) -> void:
	# Soft warm halo
	draw_circle(c, r * 1.15, Color(1.0, 0.85, 0.30, 0.22))
	# 8 crisp rays
	for i: int in 8:
		var ang: float = float(i) * PI * 0.25
		var dir: Vector2 = Vector2.RIGHT.rotated(ang)
		draw_line(c + dir * (r * 0.68), c + dir * (r * 1.08), Color(1.0, 0.88, 0.42, 0.95), 1.0, true)
	# Core
	draw_circle(c, r * 0.56, Color(1.0, 0.78, 0.22, 1.0))
	draw_circle(c + Vector2(-r * 0.14, -r * 0.14), r * 0.28, Color(1.0, 0.96, 0.72, 0.95))


func _draw_moon(c: Vector2, r: float) -> void:
	draw_circle(c, r * 1.05, Color(0.65, 0.82, 1.0, 0.18))
	draw_circle(c, r * 0.76, Color(0.92, 0.95, 1.0, 1.0))
	draw_circle(c + Vector2(r * 0.34, -r * 0.20), r * 0.62, Color(0.094, 0.102, 0.125, 1.0))
	# Tiny star sparkle
	draw_circle(c + Vector2(r * 0.55, -r * 0.48), r * 0.16, Color(1.0, 0.95, 0.72, 0.95))


func _draw_compass(c: Vector2, r: float) -> void:
	# Brass outer ring
	draw_circle(c, r * 0.96, Color(0.11, 0.13, 0.18, 0.95))
	draw_arc(c, r * 0.92, 0.0, TAU, 24, Color(0.92, 0.76, 0.34, 0.95), 1.1, true)
	# Rotating red/white needle
	var tip: Vector2 = Vector2.RIGHT.rotated(needle_angle)
	var side: Vector2 = tip.orthogonal() * (r * 0.26)
	var north_pts: PackedVector2Array = PackedVector2Array([
		c + tip * (r * 0.70),
		c + side,
		c - side,
	])
	var south_pts: PackedVector2Array = PackedVector2Array([
		c - tip * (r * 0.70),
		c - side,
		c + side,
	])
	draw_colored_polygon(north_pts, Color(0.96, 0.30, 0.28, 1.0))
	draw_colored_polygon(south_pts, Color(0.86, 0.90, 0.96, 0.92))
	draw_circle(c, r * 0.18, Color(1.0, 0.88, 0.45, 1.0))


func _draw_coin(c: Vector2, r: float) -> void:
	# Drop shadow
	draw_circle(c + Vector2(0.0, 0.7), r * 0.94, Color(0.0, 0.0, 0.0, 0.45))
	# Outer gold rim
	draw_circle(c, r * 0.94, Color(0.82, 0.56, 0.12, 1.0))
	# Bright gold face
	draw_circle(c, r * 0.76, Color(0.99, 0.82, 0.26, 1.0))
	# Inner emboss ring
	draw_arc(c, r * 0.54, 0.0, TAU, 20, Color(0.76, 0.50, 0.10, 0.85), 0.75, true)
	# Specular glint
	draw_circle(c + Vector2(-r * 0.28, -r * 0.28), r * 0.22, Color(1.0, 0.98, 0.82, 0.92))


func _draw_potion(c: Vector2, r: float) -> void:
	# Cork
	draw_rect(Rect2(c.x - r * 0.24, c.y - r * 1.02, r * 0.48, r * 0.30), Color(0.74, 0.50, 0.28, 1.0))
	# Bottle neck
	draw_rect(Rect2(c.x - r * 0.32, c.y - r * 0.74, r * 0.64, r * 0.34), Color(0.78, 0.88, 0.96, 0.85))
	# Glass bulb outline
	var bulb_c: Vector2 = c + Vector2(0.0, r * 0.22)
	draw_circle(bulb_c, r * 0.74, Color(0.74, 0.86, 0.96, 0.45))
	# Ruby potion liquid (lower half/three-quarters)
	draw_circle(bulb_c + Vector2(0.0, r * 0.06), r * 0.58, Color(0.88, 0.18, 0.26, 1.0))
	draw_circle(bulb_c + Vector2(0.0, -r * 0.04), r * 0.44, Color(0.98, 0.36, 0.38, 0.92))
	# Crisp glass rim & specular shine
	draw_arc(bulb_c, r * 0.72, 0.0, TAU, 20, Color(0.90, 0.95, 1.0, 0.85), 0.85, true)
	draw_circle(bulb_c + Vector2(-r * 0.26, -r * 0.22), r * 0.16, Color(1.0, 1.0, 1.0, 0.90))
