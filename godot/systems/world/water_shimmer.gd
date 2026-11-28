class_name WaterShimmerLayer
extends Node2D
## Efek shoreline foam (buih pantai berombak), kilau ombak, & riak air animasi (z_index = -5).

var _glints: Array[Dictionary] = []
var _ripples: Array[Dictionary] = []
var _shores: Array[Dictionary] = []
var _time: float = 0.0


func setup_from_water_layer(water: TileMapLayer) -> void:
	z_index = -5
	_clear_all()
	if water == null:
		return
	var cells: Array[Vector2i] = water.get_used_cells()
	_populate_from_cells(cells)


func setup_from_terrain_layer(terrain: TileMapLayer) -> void:
	z_index = -5
	_clear_all()
	if terrain == null:
		return
	var water_cells: Array[Vector2i] = []
	for cell: Vector2i in terrain.get_used_cells():
		var ac: Vector2i = terrain.get_cell_atlas_coords(cell)
		if ac.x >= 12 and (ac.y == 0 or ac.y == 1):
			water_cells.append(cell)
	_populate_from_cells(water_cells)


func _clear_all() -> void:
	_glints.clear()
	_ripples.clear()
	_shores.clear()


func _populate_from_cells(cells: Array[Vector2i]) -> void:
	if cells.is_empty():
		return
	var wset: Dictionary = {}
	var min_x: int = 999999
	var max_x: int = -999999
	var min_y: int = 999999
	var max_y: int = -999999
	for c: Vector2i in cells:
		wset[c] = true
		min_x = mini(min_x, c.x)
		max_x = maxi(max_x, c.x)
		min_y = mini(min_y, c.y)
		max_y = maxi(max_y, c.y)

	for cell: Vector2i in cells:
		var h: int = absi(cell.x * 73856093 ^ cell.y * 19349663)
		var x0: float = float(cell.x) * 16.0
		var y0: float = float(cell.y) * 16.0
		var ph: float = float(h % 628) * 0.01

		# Deteksi tepian pantai (jangan gambar buih di sisi yang menyentuh batas luar peta agar sungai antar-wilayah mulus)
		if cell.y > min_y and not wset.has(cell + Vector2i(0, -1)):
			_shores.append({"p0": Vector2(x0 + 1.0, y0 + 2.5), "p1": Vector2(x0 + 15.0, y0 + 2.5), "n": Vector2(0.0, 1.0), "phase": ph})
		if cell.y < max_y and not wset.has(cell + Vector2i(0, 1)):
			_shores.append({"p0": Vector2(x0 + 1.0, y0 + 13.5), "p1": Vector2(x0 + 15.0, y0 + 13.5), "n": Vector2(0.0, -1.0), "phase": ph})
		if cell.x > min_x and not wset.has(cell + Vector2i(-1, 0)):
			_shores.append({"p0": Vector2(x0 + 2.5, y0 + 1.0), "p1": Vector2(x0 + 2.5, y0 + 15.0), "n": Vector2(1.0, 0.0), "phase": ph})
		if cell.x < max_x and not wset.has(cell + Vector2i(1, 0)):
			_shores.append({"p0": Vector2(x0 + 13.5, y0 + 1.0), "p1": Vector2(x0 + 13.5, y0 + 15.0), "n": Vector2(-1.0, 0.0), "phase": ph})

		if h % 5 == 0:
			_glints.append({
				"pos": Vector2(x0 + float(h % 10) + 3.0, y0 + float((h / 7) % 10) + 3.0),
				"len": 4.0 + float(h % 5),
				"phase": ph,
				"speed": 1.4 + float(h % 10) * 0.12,
			})
		elif h % 17 == 0:
			_ripples.append({
				"pos": Vector2(x0 + 8.0, y0 + 8.0),
				"phase": float(h % 100) * 0.01,
				"speed": 0.35 + float(h % 5) * 0.06,
			})


func _process(delta: float) -> void:
	if _glints.is_empty() and _ripples.is_empty() and _shores.is_empty():
		return
	_time += delta
	queue_redraw()


const JAG_PROFILE: Array[float] = [1.0, 2.0, 1.0, 1.0, 2.0, 1.0, 2.0, 1.0]


func _draw() -> void:
	# 1) Buih tepian pantai pixel-art bergerigi tipis (1-2px) mengikuti kontur gerigi pantai + riak luar 1px
	var foam_col: Color = Color(0.88, 0.98, 0.97, 0.68)
	for s: Dictionary in _shores:
		var p0: Vector2 = s["p0"] as Vector2
		var p1: Vector2 = s["p1"] as Vector2
		var n: Vector2 = s["n"] as Vector2
		var ph: float = float(s["phase"])
		var wave: float = sin(_time * 2.0 + ph) * 0.5 + 0.5
		var pulse: float = roundf(wave * 1.0)
		var is_horiz: bool = absf(n.y) > 0.5
		var wave2: float = fmod(_time * 0.55 + ph * 0.16, 1.0)
		var a2: float = (1.0 - wave2) * 0.55
		var r2_col: Color = Color(0.95, 1.0, 0.99, a2)
		var off2: float = roundf(1.5 + wave2 * 2.0)

		for i: int in 8:
			var t0: float = float(i) / 8.0
			var seg_pos: Vector2 = p0.lerp(p1, t0)
			var depth: float = JAG_PROFILE[(i + int(ph * 10.0)) % 8] + pulse
			if is_horiz:
				var fy: float = seg_pos.y if n.y > 0.0 else (seg_pos.y - depth)
				draw_rect(Rect2(floorf(seg_pos.x), floorf(fy), 2.0, depth), foam_col)
				if a2 > 0.10 and (i % 2 == 0 or i == 3):
					var ry: float = seg_pos.y + n.y * (depth + off2)
					draw_rect(Rect2(floorf(seg_pos.x), floorf(ry), 2.0, 1.0), r2_col)
			else:
				var fx: float = seg_pos.x if n.x > 0.0 else (seg_pos.x - depth)
				draw_rect(Rect2(floorf(fx), floorf(seg_pos.y), depth, 2.0), foam_col)
				if a2 > 0.10 and (i % 2 == 0 or i == 3):
					var rx: float = seg_pos.x + n.x * (depth + off2)
					draw_rect(Rect2(floorf(rx), floorf(seg_pos.y), 1.0, 2.0), r2_col)

	# 2) Kilau ombak horizontal halus
	for g: Dictionary in _glints:
		var p: Vector2 = g["pos"] as Vector2
		var ph: float = float(g["phase"])
		var spd: float = float(g["speed"])
		var wlen: float = float(g["len"])
		var wave: float = sin(_time * spd + ph)
		if wave > 0.15:
			var a: float = (wave - 0.15) * 0.45
			var drift: float = sin(_time * 0.8 + ph) * 2.5
			draw_line(
				p + Vector2(drift - wlen * 0.5, 0.0),
				p + Vector2(drift + wlen * 0.5, 0.0),
				Color(0.88, 0.97, 1.0, a),
				1.0
			)

	# Riak lingkaran air lembut (membesar lalu memudar)
	for rp: Dictionary in _ripples:
		var p: Vector2 = rp["pos"] as Vector2
		var t: float = fmod(_time * float(rp["speed"]) + float(rp["phase"]), 1.0)
		var rad: float = 1.5 + t * 5.5
		var a: float = (1.0 - t) * 0.32
		if a > 0.03:
			draw_arc(p, rad, 0.0, TAU, 12, Color(0.85, 0.96, 1.0, a), 0.9)
