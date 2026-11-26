class_name WorldLayout
extends RefCounted
## Peta koordinat global Benua Lumina untuk mode dunia terbuka tanpa jeda (14 wilayah).

const MAP_DIR: String = "res://maps/"

## Definisi 14 wilayah luar ruangan dalam koordinat piksel global (0 tumpang-tindih, jalan sejajar).
const REGIONS: Dictionary = {
	&"village": {
		"id": &"village",
		"name": "Desa Lumina",
		"subtitle": "Pemukiman Damai",
		"path": "res://maps/village.tscn",
		"rect": Rect2i(3000, 3000, 1024, 720),
		"biome": &"village",
		"color": Color("#558b3e"),
		"shrine_id": &"village",
		"spawn_default": Vector2(460, 390),
	},
	&"lake": {
		"id": &"lake",
		"name": "Danau Cermin",
		"subtitle": "Perairan Suci Barat",
		"path": "res://maps/lake.tscn",
		"rect": Rect2i(1592, 3056, 1408, 992),
		"biome": &"lake",
		"color": Color("#2e6d8e"),
		"shrine_id": &"lake",
		"spawn_default": Vector2(704, 496),
	},
	&"meadow": {
		"id": &"meadow",
		"name": "Padang Angin",
		"subtitle": "Sabana Emas Timur",
		"path": "res://maps/meadow.tscn",
		"rect": Rect2i(4024, 2680, 1440, 1040),
		"biome": &"meadow",
		"color": Color("#7aa346"),
		"shrine_id": &"meadow",
		"spawn_default": Vector2(640, 520),
	},
	&"forest": {
		"id": &"forest",
		"name": "Hutan Lumina",
		"subtitle": "Rimba Awal Petualang",
		"path": "res://maps/forest.tscn",
		"rect": Rect2i(3000, 3720, 1280, 1200),
		"biome": &"forest",
		"color": Color("#2f6336"),
		"shrine_id": &"forest",
		"spawn_default": Vector2(560, 480),
	},
	&"deepwood": {
		"id": &"deepwood",
		"name": "Hutan Dalam",
		"subtitle": "Rimba Bayangan Kuno",
		"path": "res://maps/deepwood.tscn",
		"rect": Rect2i(600, 4048, 2400, 1792),
		"biome": &"deepwood",
		"color": Color("#1d4429"),
		"shrine_id": &"deepwood",
		"spawn_default": Vector2(1800, 420),
	},
	&"river": {
		"id": &"river",
		"name": "Jalur Sungai Senja",
		"subtitle": "Aliran Batu & Penyeberangan",
		"path": "res://maps/river.tscn",
		"rect": Rect2i(4280, 3720, 2592, 992),
		"biome": &"river",
		"color": Color("#386c75"),
		"shrine_id": &"",
		"spawn_default": Vector2(1296, 496),
	},
	&"swamp": {
		"id": &"swamp",
		"name": "Rawa Senja",
		"subtitle": "Kabut & Lumut Beracun",
		"path": "res://maps/swamp.tscn",
		"rect": Rect2i(6872, 3720, 1280, 960),
		"biome": &"swamp",
		"color": Color("#3c5238"),
		"shrine_id": &"swamp",
		"spawn_default": Vector2(640, 480),
	},
	&"snow": {
		"id": &"snow",
		"name": "Puncak Beku",
		"subtitle": "Pegunungan Salju Abadi",
		"path": "res://maps/snow.tscn",
		"rect": Rect2i(3984, 1480, 1280, 1200),
		"biome": &"snow",
		"color": Color("#9ec1cf"),
		"shrine_id": &"snow",
		"spawn_default": Vector2(640, 620),
	},
	&"road": {
		"id": &"road",
		"name": "Jalan Raya Lama",
		"subtitle": "Jalur Kafilah Utara",
		"path": "res://maps/road.tscn",
		"rect": Rect2i(1964, 1056, 896, 2000),
		"biome": &"road",
		"color": Color("#756c47"),
		"shrine_id": &"",
		"spawn_default": Vector2(448, 1000),
	},
	&"kgate": {
		"id": &"kgate",
		"name": "Gerbang Kota Lumina",
		"subtitle": "Pos Penjagaan Ibu Kota",
		"path": "res://maps/kgate.tscn",
		"rect": Rect2i(1112, 160, 1888, 896),
		"biome": &"city",
		"color": Color("#7a736b"),
		"shrine_id": &"kgate",
		"spawn_default": Vector2(1300, 520),
	},
	&"kpasar": {
		"id": &"kpasar",
		"name": "Distrik Pasar Kota",
		"subtitle": "Jantung Perniagaan",
		"path": "res://maps/kpasar.tscn",
		"rect": Rect2i(1612, -1040, 1600, 1200),
		"biome": &"city",
		"color": Color("#8e7962"),
		"shrine_id": &"kpasar",
		"spawn_default": Vector2(800, 600),
	},
	&"kakademi": {
		"id": &"kakademi",
		"name": "Akademi Sihir Lumina",
		"subtitle": "Benteng Pengetahuan",
		"path": "res://maps/kakademi.tscn",
		"rect": Rect2i(1708, -2032, 1408, 992),
		"biome": &"city",
		"color": Color("#5d6a94"),
		"shrine_id": &"kakademi",
		"spawn_default": Vector2(704, 540),
	},
	&"kbawah": {
		"id": &"kbawah",
		"name": "Distrik Bawah Kota",
		"subtitle": "Lorong & Gudang Tua",
		"path": "res://maps/kbawah.tscn",
		"rect": Rect2i(412, -920, 1200, 992),
		"biome": &"city",
		"color": Color("#59545c"),
		"shrine_id": &"",
		"spawn_default": Vector2(600, 500),
	},
	&"kpermukiman": {
		"id": &"kpermukiman",
		"name": "Distrik Permukiman Kota",
		"subtitle": "Kawasan Elit & Penginapan",
		"path": "res://maps/kpermukiman.tscn",
		"rect": Rect2i(3212, -920, 1408, 992),
		"biome": &"city",
		"color": Color("#6d8272"),
		"shrine_id": &"",
		"spawn_default": Vector2(704, 500),
	},
}

## 13 pasang jalan utama antarwilayah (ditampilkan di Peta Benua dan terbuka tanpa jeda).
const SEAMLESS_PAIRS: Array[Array] = [
	[&"village", &"lake"],
	[&"village", &"meadow"],
	[&"village", &"forest"],
	[&"forest", &"deepwood"],
	[&"forest", &"river"],
	[&"river", &"swamp"],
	[&"meadow", &"snow"],
	[&"lake", &"road"],
	[&"road", &"kgate"],
	[&"kgate", &"kpasar"],
	[&"kpasar", &"kakademi"],
	[&"kpasar", &"kbawah"],
	[&"kpasar", &"kpermukiman"],
]

## Penanda khusus di peta benua (Gua Batu & Arena Latihan).
const SPECIAL_MARKERS: Array[Dictionary] = [
	{
		"id": &"cave",
		"name": "Gua Batu",
		"path": "res://maps/cave.tscn",
		"world_pos": Vector2(5224, 2860),
		"color": Color("#8b6b4a"),
		"icon": "cave",
	},
	{
		"id": &"training_glade",
		"name": "Arena Latihan",
		"path": "res://maps/training_glade.tscn",
		"world_pos": Vector2(3182, 3456),
		"color": Color("#b39b59"),
		"icon": "arena",
	},
]


static func id_from_path(path: String) -> StringName:
	if path.is_empty():
		return &""
	var base: String = path.get_file().get_basename()
	return StringName(base)


static func path_from_id(id: StringName) -> String:
	if REGIONS.has(id):
		return str(REGIONS[id].get("path", ""))
	for m: Dictionary in SPECIAL_MARKERS:
		if m.get("id", &"") == id:
			return str(m.get("path", ""))
	return "%s%s.tscn" % [MAP_DIR, str(id)]


static func is_benua_map(path: String) -> bool:
	return REGIONS.has(id_from_path(path))


static func is_benua_id(id: StringName) -> bool:
	return REGIONS.has(id)


static func get_region(id: StringName) -> Dictionary:
	if REGIONS.has(id):
		return REGIONS[id]
	return {}


static func get_rect(id: StringName) -> Rect2i:
	if REGIONS.has(id):
		return REGIONS[id]["rect"]
	return Rect2i()


static func region_at(world_pos: Vector2) -> StringName:
	for k: Variant in REGIONS.keys():
		var rid: StringName = k
		var r: Rect2i = REGIONS[rid]["rect"]
		if Rect2(r).has_point(world_pos):
			return rid
	return &""


static func is_seamless_link(a: StringName, b: StringName) -> bool:
	if a == &"" or b == &"" or a == b:
		return false
	for pair: Array in SEAMLESS_PAIRS:
		if pair.size() >= 2:
			var p0: StringName = pair[0]
			var p1: StringName = pair[1]
			if (p0 == a and p1 == b) or (p0 == b and p1 == a):
				return true
	if REGIONS.has(a) and REGIONS.has(b):
		var ra: Rect2i = REGIONS[a]["rect"]
		var rb: Rect2i = REGIONS[b]["rect"]
		return _rects_touch_edge(ra, rb)
	return false


static func _rects_touch_edge(ra: Rect2i, rb: Rect2i) -> bool:
	var ov_x: int = mini(ra.end.x, rb.end.x) - maxi(ra.position.x, rb.position.x)
	var ov_y: int = mini(ra.end.y, rb.end.y) - maxi(ra.position.y, rb.position.y)
	if ov_x >= 32 and (ra.end.y == rb.position.y or rb.end.y == ra.position.y):
		return true
	if ov_y >= 32 and (ra.end.x == rb.position.x or rb.end.x == ra.position.x):
		return true
	return false


static func _merge_spans(raw: Array[Vector2]) -> Array[Vector2]:
	if raw.is_empty():
		return []
	raw.sort_custom(func(u: Vector2, v: Vector2) -> bool: return u.x < v.x)
	var out: Array[Vector2] = [raw[0]]
	for i: int in range(1, raw.size()):
		var cur: Vector2 = raw[i]
		var last: Vector2 = out[out.size() - 1]
		if cur.x <= last.y + 1.0:
			out[out.size() - 1] = Vector2(last.x, maxf(last.y, cur.y))
		else:
			out.append(cur)
	return out


## Mengembalikan segmen tepi lokal yang bersentuhan dengan wilayah tetangga untuk sisi N/S/W/E.
static func get_shared_spans(rid: StringName) -> Dictionary:
	var n_spans: Array[Vector2] = []
	var s_spans: Array[Vector2] = []
	var w_spans: Array[Vector2] = []
	var e_spans: Array[Vector2] = []
	if not REGIONS.has(rid):
		return {"N": n_spans, "S": s_spans, "W": w_spans, "E": e_spans}
	var ra: Rect2i = REGIONS[rid]["rect"]
	for k: Variant in REGIONS.keys():
		var oid: StringName = k
		if oid == rid:
			continue
		var rb: Rect2i = REGIONS[oid]["rect"]
		var ox0: int = maxi(ra.position.x, rb.position.x)
		var ox1: int = mini(ra.end.x, rb.end.x)
		var oy0: int = maxi(ra.position.y, rb.position.y)
		var oy1: int = mini(ra.end.y, rb.end.y)
		if ox1 - ox0 >= 32:
			if rb.end.y == ra.position.y:
				n_spans.append(Vector2(float(ox0 - ra.position.x), float(ox1 - ra.position.x)))
			elif rb.position.y == ra.end.y:
				s_spans.append(Vector2(float(ox0 - ra.position.x), float(ox1 - ra.position.x)))
		if oy1 - oy0 >= 32:
			if rb.end.x == ra.position.x:
				w_spans.append(Vector2(float(oy0 - ra.position.y), float(oy1 - ra.position.y)))
			elif rb.position.x == ra.end.x:
				e_spans.append(Vector2(float(oy0 - ra.position.y), float(oy1 - ra.position.y)))
	return {
		"N": _merge_spans(n_spans),
		"S": _merge_spans(s_spans),
		"W": _merge_spans(w_spans),
		"E": _merge_spans(e_spans),
	}


static func _subtract_spans(total_len: float, spans: Array[Vector2]) -> Array[Vector2]:
	var out: Array[Vector2] = []
	var cur: float = 0.0
	for sp: Vector2 in spans:
		if sp.x > cur + 2.0:
			out.append(Vector2(cur, minf(total_len, sp.x)))
		cur = maxf(cur, sp.y)
	if cur < total_len - 2.0:
		out.append(Vector2(cur, total_len))
	return out


## Mengembalikan kotak batas fisik HANYA pada tepi luar wilayah (yang tidak menyentuh wilayah lain).
static func outer_boundary_rects(rid: StringName, wall_thick: float = 12.0) -> Array[Rect2]:
	var rects: Array[Rect2] = []
	if not REGIONS.has(rid):
		return rects
	var r: Rect2i = REGIONS[rid]["rect"]
	var w: float = float(r.size.x)
	var h: float = float(r.size.y)
	var sh: Dictionary = get_shared_spans(rid)
	for seg: Vector2 in _subtract_spans(w, sh["N"] as Array[Vector2]):
		rects.append(Rect2(seg.x, 0.0, seg.y - seg.x, wall_thick))
	for seg: Vector2 in _subtract_spans(w, sh["S"] as Array[Vector2]):
		rects.append(Rect2(seg.x, h - wall_thick, seg.y - seg.x, wall_thick))
	for seg: Vector2 in _subtract_spans(h, sh["W"] as Array[Vector2]):
		rects.append(Rect2(0.0, seg.x, wall_thick, seg.y - seg.x))
	for seg: Vector2 in _subtract_spans(h, sh["E"] as Array[Vector2]):
		rects.append(Rect2(w - wall_thick, seg.x, wall_thick, seg.y - seg.x))
	return rects


static func is_point_on_shared_edge(rid: StringName, side: String, v: float, pad: float = 0.0) -> bool:
	var sh: Dictionary = get_shared_spans(rid)
	var spans: Array[Vector2] = sh.get(side, []) as Array[Vector2]
	for sp: Vector2 in spans:
		if v >= sp.x - pad and v <= sp.y + pad:
			return true
	return false


static func continent_bounds() -> Rect2i:
	var min_x: int = 2147483647
	var min_y: int = 2147483647
	var max_x: int = -2147483647
	var max_y: int = -2147483647
	for k: Variant in REGIONS.keys():
		var r: Rect2i = REGIONS[k]["rect"]
		min_x = mini(min_x, r.position.x)
		min_y = mini(min_y, r.position.y)
		max_x = maxi(max_x, r.end.x)
		max_y = maxi(max_y, r.end.y)
	return Rect2i(min_x, min_y, max_x - min_x, max_y - min_y)


static func distance_to_rect(pos: Vector2, r: Rect2i) -> float:
	var dx: float = 0.0
	if pos.x < float(r.position.x):
		dx = float(r.position.x) - pos.x
	elif pos.x > float(r.end.x):
		dx = pos.x - float(r.end.x)
	var dy: float = 0.0
	if pos.y < float(r.position.y):
		dy = float(r.position.y) - pos.y
	elif pos.y > float(r.end.y):
		dy = pos.y - float(r.end.y)
	return sqrt(dx * dx + dy * dy)
