class_name WorldMapCanvas
extends Control
## Kanvas visual interaktif Peta Benua Lumina dengan pan seret, zoom, marker wilayah, gua, dan posisi Arka.

signal region_selected(region_id: StringName)

const MIN_ZOOM: float = 0.020
const MAX_ZOOM: float = 0.140
const DEFAULT_ZOOM: float = 0.036

var _pan_center_world: Vector2 = Vector2(3900.0, 2200.0)
var _zoom: float = DEFAULT_ZOOM
var _selected_id: StringName = &"village"
var _dragging: bool = false
var _drag_moved: bool = false
var _drag_start_pos: Vector2 = Vector2.ZERO
var _last_drag_pos: Vector2 = Vector2.ZERO
var _pulse_time: float = 0.0


func _ready() -> void:
	clip_contents = true
	mouse_filter = Control.MOUSE_FILTER_STOP


func _process(delta: float) -> void:
	if not visible:
		return
	_pulse_time += delta
	queue_redraw()


func set_selected_id(rid: StringName) -> void:
	_selected_id = rid
	queue_redraw()


func get_selected_id() -> StringName:
	return _selected_id


func zoom_in() -> void:
	_zoom = clampf(_zoom * 1.25, MIN_ZOOM, MAX_ZOOM)
	queue_redraw()


func zoom_out() -> void:
	_zoom = clampf(_zoom * 0.80, MIN_ZOOM, MAX_ZOOM)
	queue_redraw()


func fit_continent() -> void:
	var b: Rect2i = WorldLayout.continent_bounds()
	var c: Vector2 = Vector2(b.position) + Vector2(b.size) * 0.5
	_pan_center_world = c
	if size.x > 16.0 and size.y > 16.0:
		var zx: float = (size.x - 24.0) / maxf(1.0, float(b.size.x))
		var zy: float = (size.y - 24.0) / maxf(1.0, float(b.size.y))
		_zoom = clampf(minf(zx, zy), MIN_ZOOM, MAX_ZOOM)
	else:
		_zoom = DEFAULT_ZOOM
	queue_redraw()


func focus_player() -> void:
	_pan_center_world = _player_world_position()
	_zoom = clampf(maxf(_zoom, 0.048), MIN_ZOOM, MAX_ZOOM)
	queue_redraw()


func world_to_canvas(world_pos: Vector2) -> Vector2:
	return size * 0.5 + (world_pos - _pan_center_world) * _zoom


func canvas_to_world(canvas_pos: Vector2) -> Vector2:
	return _pan_center_world + (canvas_pos - size * 0.5) / _zoom


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_WHEEL_UP and mb.pressed:
			zoom_in()
			accept_event()
		elif mb.button_index == MOUSE_BUTTON_WHEEL_DOWN and mb.pressed:
			zoom_out()
			accept_event()
		elif mb.button_index == MOUSE_BUTTON_LEFT:
			if mb.pressed:
				_dragging = true
				_drag_moved = false
				_drag_start_pos = mb.position
				_last_drag_pos = mb.position
			else:
				if _dragging and not _drag_moved:
					_pick_at(mb.position)
				_dragging = false
			accept_event()
	elif event is InputEventMouseMotion and _dragging:
		var mm: InputEventMouseMotion = event as InputEventMouseMotion
		var diff: Vector2 = mm.position - _last_drag_pos
		_last_drag_pos = mm.position
		if mm.position.distance_to(_drag_start_pos) > 4.0:
			_drag_moved = true
		_pan_center_world -= diff / _zoom
		queue_redraw()
		accept_event()
	elif event is InputEventScreenTouch:
		var st: InputEventScreenTouch = event as InputEventScreenTouch
		if st.pressed:
			_dragging = true
			_drag_moved = false
			_drag_start_pos = st.position
			_last_drag_pos = st.position
		else:
			if _dragging and not _drag_moved:
				_pick_at(st.position)
			_dragging = false
		accept_event()
	elif event is InputEventScreenDrag:
		var sd: InputEventScreenDrag = event as InputEventScreenDrag
		_drag_moved = true
		_pan_center_world -= sd.relative / _zoom
		queue_redraw()
		accept_event()


func _pick_at(canvas_pos: Vector2) -> void:
	for m: Dictionary in WorldLayout.SPECIAL_MARKERS:
		var mc: Vector2 = world_to_canvas(m["world_pos"] as Vector2)
		if canvas_pos.distance_to(mc) <= 11.0:
			_selected_id = m["id"] as StringName
			region_selected.emit(_selected_id)
			queue_redraw()
			return

	var wp: Vector2 = canvas_to_world(canvas_pos)
	var rid: StringName = WorldLayout.region_at(wp)
	if rid != &"":
		_selected_id = rid
		region_selected.emit(rid)
		queue_redraw()


func _player_world_position() -> Vector2:
	if SceneService.ref != null:
		var p: Node2D = SceneService.ref.get_current_player()
		if p != null and is_instance_valid(p) and GameStateStore.ref != null:
			var cur_id: StringName = WorldLayout.id_from_path(GameStateStore.ref.current_map)
			if WorldLayout.is_benua_id(cur_id):
				return p.global_position
	if GameStateStore.ref != null:
		var cid: StringName = WorldLayout.id_from_path(GameStateStore.ref.current_map)
		if WorldLayout.is_benua_id(cid):
			var r: Rect2i = WorldLayout.get_rect(cid)
			return Vector2(r.position) + Vector2(r.size) * 0.5
		for m: Dictionary in WorldLayout.SPECIAL_MARKERS:
			if (m["id"] as StringName) == cid:
				return m["world_pos"] as Vector2
	var vr: Rect2i = WorldLayout.get_rect(&"village")
	return Vector2(vr.position) + Vector2(vr.size) * 0.5


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("#0d1522"))

	var grid_step: float = 1000.0
	var top_left_w: Vector2 = canvas_to_world(Vector2.ZERO)
	var bot_right_w: Vector2 = canvas_to_world(size)
	var gx_start: float = floorf(top_left_w.x / grid_step) * grid_step
	var gx: float = gx_start
	while gx <= bot_right_w.x:
		var cx: float = world_to_canvas(Vector2(gx, 0.0)).x
		draw_line(Vector2(cx, 0.0), Vector2(cx, size.y), Color(0.22, 0.30, 0.42, 0.20), 1.0)
		gx += grid_step
	var gy_start: float = floorf(top_left_w.y / grid_step) * grid_step
	var gy: float = gy_start
	while gy <= bot_right_w.y:
		var cy: float = world_to_canvas(Vector2(0.0, gy)).y
		draw_line(Vector2(0.0, cy), Vector2(size.x, cy), Color(0.22, 0.30, 0.42, 0.20), 1.0)
		gy += grid_step

	var gs: GameStateStore = GameStateStore.ref
	var cur_path: String = gs.current_map if gs != null else ""

	# Garis jalan penghubung antar wilayah
	for pair: Array in WorldLayout.SEAMLESS_PAIRS:
		var ra: Rect2i = WorldLayout.get_rect(pair[0] as StringName)
		var rb: Rect2i = WorldLayout.get_rect(pair[1] as StringName)
		var ca: Vector2 = world_to_canvas(Vector2(ra.position) + Vector2(ra.size) * 0.5)
		var cb: Vector2 = world_to_canvas(Vector2(rb.position) + Vector2(rb.size) * 0.5)
		draw_line(ca, cb, Color(0.84, 0.74, 0.50, 0.38), 1.5)

	# Menggambar 14 blok wilayah benua sesuai skala riil
	var font: Font = ThemeDB.fallback_font
	for k: Variant in WorldLayout.REGIONS.keys():
		var rid: StringName = k as StringName
		var reg: Dictionary = WorldLayout.REGIONS[rid]
		var r: Rect2i = reg["rect"]
		var tl: Vector2 = world_to_canvas(Vector2(r.position))
		var sz: Vector2 = Vector2(r.size) * _zoom
		var draw_r: Rect2 = Rect2(tl, sz)
		if draw_r.end.x < -8.0 or draw_r.position.x > size.x + 8.0 or draw_r.end.y < -8.0 or draw_r.position.y > size.y + 8.0:
			continue

		var map_path: String = str(reg["path"])
		var is_vis: bool = gs != null and gs.visited_maps.has(map_path)
		var is_cur: bool = cur_path == map_path
		var is_sel: bool = _selected_id == rid
		var col: Color = reg.get("color", Color("#4e7844"))
		if not is_vis:
			col = col.darkened(0.55)
			col.s = col.s * 0.45

		draw_rect(draw_r.grow(1.5), Color(0.05, 0.08, 0.12, 0.55))
		draw_rect(draw_r, col)

		var border_col: Color = Color(0.98, 0.84, 0.34, 1.0) if is_sel else (Color(0.55, 0.94, 0.75, 0.95) if is_cur else Color(0.18, 0.22, 0.28, 0.90))
		draw_rect(draw_r, border_col, false, 1.8 if is_sel else 1.0)

		var shrine_id: StringName = reg.get("shrine_id", &"")
		if shrine_id != &"":
			var unlocked: bool = gs != null and gs.unlocked_shrines.has(map_path)
			var pin: Vector2 = draw_r.get_center() + Vector2(0.0, -minf(8.0, draw_r.size.y * 0.22))
			var pin_col: Color = Color(0.98, 0.84, 0.32) if unlocked else Color(0.45, 0.48, 0.55)
			draw_circle(pin, 2.3, pin_col)
			if unlocked:
				draw_circle(pin, 3.8, Color(0.98, 0.84, 0.32, 0.35))

		if draw_r.size.x >= 26.0 and draw_r.size.y >= 16.0:
			var label_str: String = str(reg["name"])
			var f_sz: int = 6 if _zoom >= 0.032 else 5
			var txt_col: Color = Color(0.98, 0.96, 0.88, 0.95) if is_vis else Color(0.70, 0.74, 0.80, 0.72)
			draw_string(font, Vector2(draw_r.position.x + 2.0, draw_r.get_center().y + 5.0), label_str, HORIZONTAL_ALIGNMENT_CENTER, int(draw_r.size.x) - 4, f_sz, txt_col)

	# Penanda khusus (Gua Batu, Arena Latihan)
	for m: Dictionary in WorldLayout.SPECIAL_MARKERS:
		var mid: StringName = m["id"]
		var mpath: String = str(m["path"])
		var mpos: Vector2 = world_to_canvas(m["world_pos"] as Vector2)
		var is_sel_m: bool = _selected_id == mid
		var is_vis_m: bool = gs != null and gs.visited_maps.has(mpath)
		var mc: Color = m["color"] if is_vis_m else (m["color"] as Color).darkened(0.45)
		var mr: float = 5.5 if is_sel_m else 4.5
		var poly: PackedVector2Array = PackedVector2Array([
			mpos + Vector2(0.0, -mr), mpos + Vector2(mr, 0.0),
			mpos + Vector2(0.0, mr), mpos + Vector2(-mr, 0.0),
		])
		draw_colored_polygon(poly, mc)
		var m_rim: Color = Color(0.98, 0.84, 0.34) if is_sel_m else Color(0.90, 0.88, 0.80)
		draw_polyline(PackedVector2Array([poly[0], poly[1], poly[2], poly[3], poly[0]]), m_rim, 1.2)
		draw_string(font, mpos + Vector2(-22.0, 11.0), str(m["name"]), HORIZONTAL_ALIGNMENT_CENTER, 44, 5, Color(0.94, 0.9, 0.78))

	# Penanda posisi Arka berkedip real-time
	var ppos: Vector2 = world_to_canvas(_player_world_position())
	var pulse_r: float = 4.5 + sin(_pulse_time * 5.0) * 1.8
	draw_circle(ppos, pulse_r, Color(0.32, 0.94, 1.0, 0.32))
	draw_circle(ppos, 2.8, Color(0.25, 0.95, 1.0, 1.0))
	draw_arc(ppos, 3.0, 0.0, TAU, 16, Color(1.0, 1.0, 1.0, 0.95), 1.0)
