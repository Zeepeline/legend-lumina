class_name DeepwoodAtmosphere
extends Node2D
## Atmosfer Hutan Dalam: berkas cahaya matahari (sunbeams) di clearing, kabut tipis, dan spora/kunang-kunang.

const SUNBEAMS: Array[Dictionary] = [
	{"pos": Vector2(560.0, 355.0), "w": 110.0, "h": 240.0, "col": Color(0.95, 1.0, 0.72, 0.13)},
	{"pos": Vector2(1310.0, 795.0), "w": 92.0, "h": 210.0, "col": Color(0.90, 0.98, 0.72, 0.11)},
	{"pos": Vector2(1820.0, 1320.0), "w": 100.0, "h": 220.0, "col": Color(0.65, 0.96, 0.88, 0.11)},
	{"pos": Vector2(2260.0, 402.0), "w": 84.0, "h": 195.0, "col": Color(0.96, 1.0, 0.78, 0.12)},
	{"pos": Vector2(1460.0, 215.0), "w": 68.0, "h": 170.0, "col": Color(0.76, 0.86, 1.0, 0.12)},
]

const MIST_BANDS: Array[Dictionary] = [
	{"pos": Vector2(620.0, 520.0), "w": 360.0, "h": 72.0, "speed": 7.0, "phase": 0.4},
	{"pos": Vector2(1240.0, 960.0), "w": 420.0, "h": 84.0, "speed": 5.5, "phase": 1.8},
	{"pos": Vector2(1780.0, 1180.0), "w": 380.0, "h": 78.0, "speed": 6.2, "phase": 3.1},
	{"pos": Vector2(960.0, 1380.0), "w": 400.0, "h": 80.0, "speed": 5.0, "phase": 4.5},
	{"pos": Vector2(1940.0, 560.0), "w": 340.0, "h": 70.0, "speed": 6.8, "phase": 2.3},
]

var _time: float = 0.0


func _ready() -> void:
	z_index = 40
	_spawn_spores()


func _process(delta: float) -> void:
	_time += delta
	queue_redraw()


func _spawn_spores() -> void:
	var fireflies: CPUParticles2D = CPUParticles2D.new()
	fireflies.name = "ForestFireflies"
	fireflies.position = Vector2(1200.0, 896.0)
	fireflies.amount = 80
	fireflies.lifetime = 6.5
	fireflies.preprocess = 3.0
	fireflies.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	fireflies.emission_rect_extents = Vector2(1140.0, 840.0)
	fireflies.direction = Vector2(0.15, -1.0)
	fireflies.spread = 55.0
	fireflies.gravity = Vector2.ZERO
	fireflies.initial_velocity_min = 3.0
	fireflies.initial_velocity_max = 9.0
	fireflies.scale_amount_min = 1.6
	fireflies.scale_amount_max = 2.8
	fireflies.color = Color(0.86, 1.0, 0.56, 0.72)
	add_child(fireflies)

	var spores: CPUParticles2D = CPUParticles2D.new()
	spores.name = "MysticSpores"
	spores.position = Vector2(1200.0, 896.0)
	spores.amount = 48
	spores.lifetime = 7.5
	spores.preprocess = 3.5
	spores.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	spores.emission_rect_extents = Vector2(1120.0, 820.0)
	spores.direction = Vector2(-0.2, -1.0)
	spores.spread = 65.0
	spores.gravity = Vector2.ZERO
	spores.initial_velocity_min = 2.0
	spores.initial_velocity_max = 6.0
	spores.scale_amount_min = 1.4
	spores.scale_amount_max = 2.4
	spores.color = Color(0.58, 0.92, 1.0, 0.58)
	add_child(spores)


func _draw() -> void:
	# Soft drifting mist ribbons
	for m: Dictionary in MIST_BANDS:
		var base_p: Vector2 = m["pos"] as Vector2
		var mw: float = float(m["w"])
		var mh: float = float(m["h"])
		var ph: float = float(m["phase"])
		var drift_x: float = sin(_time * 0.22 + ph) * 38.0
		var alpha: float = 0.045 + 0.018 * sin(_time * 0.35 + ph)
		var center: Vector2 = base_p + Vector2(drift_x, 0.0)
		draw_rect(Rect2(center - Vector2(mw * 0.5, mh * 0.5), Vector2(mw, mh)), Color(0.72, 0.86, 0.80, alpha))
		draw_rect(Rect2(center - Vector2(mw * 0.32, mh * 0.28), Vector2(mw * 0.64, mh * 0.56)), Color(0.78, 0.92, 0.86, alpha * 0.9))

	# Diagonal sunbeams / god rays on clearings (sembunyikan otomatis saat hujan)
	if WeatherOverlay.ref != null and WeatherOverlay.ref.weather_mode == &"rain":
		return
	for sb: Dictionary in SUNBEAMS:
		var p: Vector2 = sb["pos"] as Vector2
		var w: float = float(sb["w"])
		var h: float = float(sb["h"])
		var col: Color = sb["col"] as Color
		var pulse: float = 0.85 + 0.15 * sin(_time * 0.9 + p.x * 0.01)
		var top_col: Color = Color(col.r, col.g, col.b, col.a * pulse)
		var bot_col: Color = Color(col.r, col.g, col.b, 0.0)
		var slant: float = 42.0
		# Outer soft shaft
		var pts: PackedVector2Array = PackedVector2Array([
			p + Vector2(-w * 0.36 - slant, -h),
			p + Vector2(w * 0.36 - slant, -h),
			p + Vector2(w * 0.56, 22.0),
			p + Vector2(-w * 0.56, 22.0),
		])
		draw_polygon(pts, PackedColorArray([top_col, top_col, bot_col, bot_col]))
		# Brighter inner core shaft
		var core_top: Color = Color(col.r, col.g, col.b, col.a * 0.85 * pulse)
		var core_pts: PackedVector2Array = PackedVector2Array([
			p + Vector2(-w * 0.16 - slant, -h),
			p + Vector2(w * 0.16 - slant, -h),
			p + Vector2(w * 0.24, 16.0),
			p + Vector2(-w * 0.24, 16.0),
		])
		draw_polygon(core_pts, PackedColorArray([core_top, core_top, bot_col, bot_col]))
		# Soft sunlit pool on clearing ground
		draw_circle(p, w * 0.42, Color(col.r, col.g, col.b, col.a * 0.55 * pulse))
