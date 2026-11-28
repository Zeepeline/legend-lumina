class_name HudGradientBar
extends Control
## Bilah progres HD bergaya web dengan gradasi vertikal, kilau atas, bayangan dalam, dan jejak ghost.

@export var bg_color: Color = Color(0.051, 0.067, 0.090, 0.96)
@export var border_color: Color = Color(0.0, 0.0, 0.0, 0.90)
@export var fill_top: Color = Color(0.973, 0.443, 0.443, 1.0)
@export var fill_bottom: Color = Color(0.863, 0.149, 0.149, 1.0)
@export var ghost_top: Color = Color(1.0, 0.627, 0.565, 0.92)
@export var ghost_bottom: Color = Color(0.725, 0.110, 0.110, 0.92)
@export var show_ghost: bool = false
@export var corner_radius: float = 2.0
@export var gloss_alpha: float = 0.34
@export var outer_border_color: Color = Color(1.0, 1.0, 1.0, 0.10)

var _ratio: float = 1.0
var _ghost_ratio: float = 1.0


func set_ratios(fill_ratio: float, ghost_ratio: float = -1.0) -> void:
	var nr: float = clampf(fill_ratio, 0.0, 1.0)
	var ng: float = clampf(ghost_ratio, 0.0, 1.0) if ghost_ratio >= 0.0 else _ghost_ratio
	if not is_equal_approx(nr, _ratio) or not is_equal_approx(ng, _ghost_ratio):
		_ratio = nr
		_ghost_ratio = ng
		queue_redraw()


func _draw() -> void:
	var w: float = size.x
	var h: float = size.y
	if w <= 1.0 or h <= 1.0:
		return

	# Subtle bottom rim highlight (matches web: 0 1px 0 rgba(255,255,255,.1))
	draw_rect(Rect2(0.0, h, w, 0.8), outer_border_color)

	# Recessed dark track
	var track_sb: StyleBoxFlat = StyleBoxFlat.new()
	track_sb.bg_color = bg_color
	track_sb.set_corner_radius_all(int(corner_radius))
	track_sb.set_border_width_all(1)
	track_sb.border_color = border_color
	track_sb.anti_aliasing = true
	draw_style_box(track_sb, Rect2(0.0, 0.0, w, h))

	var inner_w: float = maxf(0.0, w - 2.0)
	var inner_h: float = maxf(0.0, h - 2.0)

	# Ghost trail bar
	if show_ghost and _ghost_ratio > _ratio + 0.004:
		var gw: float = inner_w * _ghost_ratio
		if gw >= 1.0:
			_draw_vgrad_rect(Rect2(1.0, 1.0, gw, inner_h), ghost_top, ghost_bottom)

	# Main gradient fill
	var fw: float = inner_w * _ratio
	if fw >= 0.8:
		_draw_vgrad_rect(Rect2(1.0, 1.0, fw, inner_h), fill_top, fill_bottom)
		# Crisp top specular highlight (matches web: inset 0 1px 0 rgba(255,255,255,.35))
		var sheen_h: float = minf(1.2, inner_h * 0.35)
		draw_rect(Rect2(1.0, 1.0, fw, sheen_h), Color(1.0, 1.0, 1.0, gloss_alpha))


func _draw_vgrad_rect(r: Rect2, top_col: Color, bot_col: Color) -> void:
	var pts: PackedVector2Array = PackedVector2Array([
		Vector2(r.position.x, r.position.y),
		Vector2(r.position.x + r.size.x, r.position.y),
		Vector2(r.position.x + r.size.x, r.position.y + r.size.y),
		Vector2(r.position.x, r.position.y + r.size.y),
	])
	var cols: PackedColorArray = PackedColorArray([top_col, top_col, bot_col, bot_col])
	draw_polygon(pts, cols)
