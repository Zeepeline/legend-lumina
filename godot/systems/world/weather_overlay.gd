class_name WeatherOverlay
extends Control
## Efek cuaca dinamis persis versi web: Hujan 2 lapis (parallax), percikan butiran bergravitasi (beads), kabut biru, kilat petir 2-kedipan, dan Salju.

static var ref: WeatherOverlay = null

const RAIN_BG_COUNT: int = 55
const RAIN_FG_COUNT: int = 65
const MAX_SPLASHES: int = 44
const SNOW_COUNT: int = 65
const GRAV: float = 140.0

var weather_mode: StringName = &"clear" # &"clear" | &"rain" | &"snow"
var auto_weather: bool = true

var _rain_bg: Array[Dictionary] = []
var _rain_fg: Array[Dictionary] = []
var _splashes: Array[Dictionary] = []
var _snow_flakes: Array[Dictionary] = []
var _splash_acc: float = 0.0
var _lt_cd: float = 12.0
var _lt_t: float = 0.0
var _cycle_timer: float = 45.0
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _enter_tree() -> void:
	ref = self


func _ready() -> void:
	name = "WeatherOverlay"
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_rng.randomize()
	_init_particles()
	if EventsBus.ref != null:
		EventsBus.ref.map_changed.connect(_on_map_changed)


func set_weather(mode: StringName, manual: bool = true) -> void:
	var prev: StringName = weather_mode
	weather_mode = mode
	auto_weather = not manual
	if mode != &"rain":
		_splashes.clear()
		_lt_t = 0.0
	elif prev != &"rain":
		_lt_cd = _rng.randf_range(8.0, 15.0)
	queue_redraw()


func cycle_weather() -> StringName:
	if weather_mode == &"clear":
		set_weather(&"rain", true)
	elif weather_mode == &"rain":
		set_weather(&"snow", true)
	else:
		set_weather(&"clear", true)
	return weather_mode


func _on_map_changed(map_path: String, _spawn: StringName) -> void:
	var rid: StringName = WorldLayout.id_from_path(map_path)
	if rid == &"snow":
		weather_mode = &"snow"
	elif rid == &"swamp" and auto_weather:
		weather_mode = &"rain"
	elif auto_weather and weather_mode == &"snow":
		weather_mode = &"clear"
	queue_redraw()


func _init_particles() -> void:
	_rain_bg.clear()
	for i: int in RAIN_BG_COUNT:
		_rain_bg.append({
			"x": _rng.randf_range(0.0, 540.0),
			"y": _rng.randf_range(0.0, 290.0),
			"speed": _rng.randf_range(230.0, 280.0),
			"len": _rng.randf_range(5.0, 8.0),
		})
	_rain_fg.clear()
	for i: int in RAIN_FG_COUNT:
		_rain_fg.append({
			"x": _rng.randf_range(0.0, 540.0),
			"y": _rng.randf_range(0.0, 290.0),
			"speed": _rng.randf_range(350.0, 430.0),
			"len": _rng.randf_range(8.0, 13.0),
		})
	_snow_flakes.clear()
	for i: int in SNOW_COUNT:
		_snow_flakes.append({
			"x": _rng.randf_range(0.0, 500.0),
			"y": _rng.randf_range(0.0, 280.0),
			"speed": _rng.randf_range(18.0, 36.0),
			"r": _rng.randf_range(0.9, 1.9),
			"phase": _rng.randf_range(0.0, TAU),
		})


func _spawn_splash(vw: float, vh: float) -> void:
	var sx: float = _rng.randf_range(10.0, vw - 10.0)
	var sy: float = _rng.randf_range(18.0, vh - 8.0)
	var cnt: int = 3 + (1 if _rng.randf() < 0.45 else 0)
	var beads: Array[Dictionary] = []
	for i: int in cnt:
		var s: float = (float(i) / float(cnt - 1) - 0.5) * 2.0
		beads.append({
			"vx": s * _rng.randf_range(13.0, 24.0) + _rng.randf_range(-3.0, 3.0),
			"vy": -_rng.randf_range(20.0, 34.0),
			"r": _rng.randf_range(0.7, 1.15),
		})
	_splashes.append({
		"x": sx,
		"y": sy,
		"age": 0.0,
		"max": _rng.randf_range(0.22, 0.30),
		"beads": beads,
	})


func _process(delta: float) -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs != null and (gs.is_indoor or gs.is_dark_cave):
		if visible:
			visible = false
		return
	if not visible:
		visible = true

	if auto_weather:
		_cycle_timer -= delta
		if _cycle_timer <= 0.0:
			var rid: StringName = WorldLayout.id_from_path(gs.current_map) if gs != null else &"village"
			if rid == &"snow":
				weather_mode = &"snow"
				_cycle_timer = 60.0
			elif weather_mode == &"clear":
				weather_mode = &"rain"
				_lt_cd = _rng.randf_range(9.0, 16.0)
				_cycle_timer = _rng.randf_range(40.0, 65.0)
				if EventsBus.ref != null:
					EventsBus.ref.notification_requested.emit("Hujan turun membasahi tanah...")
			else:
				weather_mode = &"clear"
				_splashes.clear()
				_lt_t = 0.0
				_cycle_timer = _rng.randf_range(55.0, 90.0)
				if EventsBus.ref != null:
					EventsBus.ref.notification_requested.emit("Hujan telah reda. Langit kembali cerah.")

	if weather_mode == &"clear":
		return

	var vw: float = maxf(480.0, size.x)
	var vh: float = maxf(270.0, size.y)
	if weather_mode == &"rain":
		# Lapis belakang (lebih pelan)
		for d: Dictionary in _rain_bg:
			var spd: float = float(d["speed"])
			d["x"] = float(d["x"]) - spd * 0.19 * delta
			d["y"] = float(d["y"]) + spd * delta
			if float(d["y"]) > vh + 12.0 or float(d["x"]) < -12.0:
				d["x"] = _rng.randf_range(0.0, vw + 75.0)
				d["y"] = _rng.randf_range(-20.0, -4.0)
		# Lapis depan (lebih cepat & miring)
		for d: Dictionary in _rain_fg:
			var spd: float = float(d["speed"])
			d["x"] = float(d["x"]) - spd * 0.22 * delta
			d["y"] = float(d["y"]) + spd * delta
			if float(d["y"]) > vh + 14.0 or float(d["x"]) < -14.0:
				d["x"] = _rng.randf_range(0.0, vw + 95.0)
				d["y"] = _rng.randf_range(-24.0, -4.0)

		# Percikan tanah + butiran air (beads)
		_splash_acc += delta * 42.0
		while _splash_acc >= 1.0:
			_splash_acc -= 1.0
			if _splashes.size() < MAX_SPLASHES:
				_spawn_splash(vw, vh)
		for i: int in range(_splashes.size() - 1, -1, -1):
			var sp: Dictionary = _splashes[i]
			var age: float = float(sp["age"]) + delta
			if age >= float(sp["max"]):
				_splashes.remove_at(i)
			else:
				sp["age"] = age

		# Kilat petir 2-kedipan (tiap 11-20 detik)
		_lt_cd -= delta
		if _lt_cd <= 0.0:
			_lt_cd = _rng.randf_range(11.0, 20.0)
			_lt_t = 0.45
		if _lt_t > 0.0:
			_lt_t = maxf(0.0, _lt_t - delta)
	elif weather_mode == &"snow":
		for sf: Dictionary in _snow_flakes:
			var spd: float = float(sf["speed"])
			var ph: float = float(sf["phase"]) + delta * 1.6
			sf["phase"] = ph
			sf["x"] = float(sf["x"]) + (sin(ph) * 14.0 - 8.0) * delta
			sf["y"] = float(sf["y"]) + spd * delta
			if float(sf["y"]) > vh + 6.0:
				sf["y"] = -4.0
				sf["x"] = _rng.randf_range(0.0, vw + 20.0)
			if float(sf["x"]) < -6.0:
				sf["x"] = vw + 4.0

	queue_redraw()


func _draw() -> void:
	if weather_mode == &"clear":
		return
	if weather_mode == &"rain":
		# 1. Kabut mendung biru tipis (#1c3450)
		draw_rect(Rect2(Vector2.ZERO, size), Color(0.11, 0.204, 0.314, 0.11))

		# 2. Lapis hujan belakang (parallax tipis)
		for d: Dictionary in _rain_bg:
			var p: Vector2 = Vector2(float(d["x"]), float(d["y"]))
			var l: float = float(d["len"])
			draw_line(p, p + Vector2(-l * 0.19, l), Color(0.72, 0.85, 0.98, 0.26), 0.8)

		# 3. Percikan tanah + butiran air memantul (beads)
		for sp: Dictionary in _splashes:
			var sx: float = float(sp["x"])
			var sy: float = float(sp["y"])
			var age: float = float(sp["age"])
			var p: float = age / maxf(0.01, float(sp["max"]))
			var ma: float = sin(p * PI) * 0.42
			# Elips genangan sesaat
			var rx: float = 2.0 + p * 3.4
			var ry: float = 0.7 + p * 0.75
			draw_set_transform(Vector2(sx, sy), 0.0, Vector2(1.0, ry / rx))
			draw_circle(Vector2.ZERO, rx, Color(0.824, 0.933, 1.0, ma))
			draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
			# Kilatan putih di titik jatuh
			if p < 0.32:
				draw_circle(Vector2(sx, sy - 0.4), 0.95, Color(1.0, 1.0, 1.0, (1.0 - p / 0.32) * 0.85))
			# Butiran percikan bergravitasi
			var beads: Array = sp["beads"]
			for b_var: Variant in beads:
				var b: Dictionary = b_var as Dictionary
				var bx: float = sx + float(b["vx"]) * age
				var by: float = sy + float(b["vy"]) * age + 0.5 * GRAV * age * age
				var ba: float = maxf(0.0, (1.0 - p * p) * 0.88)
				var br: float = float(b["r"]) * (1.0 - p * 0.4)
				draw_circle(Vector2(bx, by), br, Color(0.90, 0.96, 1.0, ba))

		# 4. Lapis hujan depan (lebih cepat & terang)
		for d: Dictionary in _rain_fg:
			var p: Vector2 = Vector2(float(d["x"]), float(d["y"]))
			var l: float = float(d["len"])
			draw_line(p, p + Vector2(-l * 0.22, l), Color(0.82, 0.92, 1.0, 0.58), 1.0)

		# 5. Kilat petir 2-kedipan (#d0e8ff)
		if _lt_t > 0.0:
			var el: float = 0.45 - _lt_t
			var fa: float = 0.82 if el < 0.07 else (0.16 if el < 0.14 else (0.62 if el < 0.23 else maxf(0.0, 0.62 * (1.0 - (el - 0.23) / 0.22))))
			draw_rect(Rect2(Vector2.ZERO, size), Color(0.816, 0.910, 1.0, fa * 0.44))
	elif weather_mode == &"snow":
		for sf: Dictionary in _snow_flakes:
			var p: Vector2 = Vector2(float(sf["x"]), float(sf["y"]))
			draw_circle(p, float(sf["r"]), Color(0.94, 0.98, 1.0, 0.78))
