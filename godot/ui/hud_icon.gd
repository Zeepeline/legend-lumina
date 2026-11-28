class_name HudVectorIcon
extends Control
## Ikon piksel HUD kanan atas (matahari, bulan, kompas, koin emas, botol ramuan) dari tekstur assets/art/ui/ic_*.png.
## Kompas menggambar jarum 2 px yang menunjuk ke salah satu dari 8 arah hadap pemain.

const TEX: Dictionary = {
	"sun": preload("res://assets/art/ui/ic_sun.png"),
	"moon": preload("res://assets/art/ui/ic_moon.png"),
	"compass": preload("res://assets/art/ui/ic_compass.png"),
	"coin": preload("res://assets/art/ui/ic_coin.png"),
	"potion": preload("res://assets/art/ui/ic_potion.png"),
}

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
		custom_minimum_size = Vector2(7.0, 7.0)


func _draw() -> void:
	var tex: Texture2D = TEX.get(icon_kind, null) as Texture2D
	if tex == null:
		return
	var pos: Vector2 = ((size - tex.get_size()) * 0.5).floor()
	draw_texture(tex, pos)
	if icon_kind == "compass":
		var c: Vector2 = pos + Vector2(3.0, 3.0)
		var step: float = PI / 4.0
		var a: float = roundf(needle_angle / step) * step
		var d: Vector2 = Vector2(roundf(cos(a) * 2.0), roundf(sin(a) * 2.0))
		draw_rect(Rect2(c.x + d.x, c.y + d.y, 1.0, 1.0), Color(0.639, 0.161, 0.11, 1.0))
		draw_rect(Rect2(c.x + roundf(d.x * 0.5), c.y + roundf(d.y * 0.5), 1.0, 1.0), Color(0.639, 0.161, 0.11, 1.0))
		draw_rect(Rect2(c.x, c.y, 1.0, 1.0), Color(0.024, 0.004, 0.02, 1.0))
