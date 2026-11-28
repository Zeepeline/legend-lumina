class_name HudGradientBar
extends Control
## Bilah kemajuan piksel bergaya kayu & perkamen: bingkai hitam bersudut tumpul, isi berwarna dengan sorot atas
## dan bayangan bawah, bagian kosong berwarna gelap, serta jejak (ghost) yang menyusut perlahan.

@export var bg_color: Color = Color(0.329, 0.098, 0.125, 1.0)
@export var border_color: Color = Color(0.024, 0.004, 0.02, 1.0)
@export var fill_top: Color = Color(0.639, 0.161, 0.11, 1.0)
@export var fill_bottom: Color = Color(0.45, 0.11, 0.08, 1.0)
@export var ghost_top: Color = Color(0.94, 0.76, 0.443, 1.0)
@export var ghost_bottom: Color = Color(0.94, 0.76, 0.443, 1.0)
@export var highlight: Color = Color(0.9, 0.43, 0.35, 1.0)
@export var show_ghost: bool = false

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
	var w: float = floorf(size.x)
	var h: float = floorf(size.y)
	if w < 3.0 or h < 3.0:
		return
	# bingkai hitam dengan sudut terpotong 1 px
	draw_rect(Rect2(1.0, 0.0, w - 2.0, h), border_color)
	draw_rect(Rect2(0.0, 1.0, w, h - 2.0), border_color)
	var iw: float = w - 2.0
	var ih: float = h - 2.0
	draw_rect(Rect2(1.0, 1.0, iw, ih), bg_color)
	if show_ghost and _ghost_ratio > _ratio + 0.004:
		var gw: float = floorf(iw * _ghost_ratio)
		if gw >= 1.0:
			draw_rect(Rect2(1.0, 1.0, gw, ih), ghost_top)
	var fw: float = floorf(iw * _ratio)
	if _ratio > 0.0 and fw < 1.0:
		fw = 1.0
	if fw >= 1.0:
		draw_rect(Rect2(1.0, 1.0, fw, ih), fill_top)
		if ih >= 3.0:
			draw_rect(Rect2(1.0, 1.0, fw, 1.0), highlight)
			draw_rect(Rect2(1.0, h - 2.0, fw, 1.0), fill_bottom)
