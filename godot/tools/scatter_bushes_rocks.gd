extends SceneTree
## Sebar semak (NatBush_*) dan batu (NatRock_*) secara organik (Clustering & Rule of 3)
## di layer YSorted seluruh 14 peta luar:
## - Semak mengelompok di kaki pohon (~35% pohon)
## - Batu mengelompok Big-Small di tepi air/sungai/danau & pinggir hutan/padang.

const REGIONS: Array[String] = [
	"village", "lake", "meadow", "forest", "deepwood", "river",
	"swamp", "snow", "road", "kgate", "kpasar", "kakademi", "kbawah", "kpermukiman",
]


func _init() -> void:
	var total_bushes: int = 0
	var total_rocks: int = 0
	for rid: String in REGIONS:
		var res: Vector2i = _scatter_region(rid)
		total_bushes += res.x
		total_rocks += res.y
	print_rich("[color=green]Selesai! Total %d semak & %d batu organik disebar di 14 peta luar.[/color]" % [total_bushes, total_rocks])
	quit(0)


func _scatter_region(rid: String) -> Vector2i:
	var path: String = "res://maps/%s.tscn" % rid
	var ps: PackedScene = ResourceLoader.load(path) as PackedScene
	if ps == null:
		return Vector2i.ZERO
	var root: Node2D = ps.instantiate() as Node2D
	var ysorted: Node = root.get_node_or_null("YSorted")
	var terrain: TileMapLayer = root.get_node_or_null("GroundTerrain") as TileMapLayer
	if ysorted == null or terrain == null:
		root.free()
		return Vector2i.ZERO

	# Hapus semak/batu lama agar idempotent
	var to_remove: Array[Node] = []
	for ch: Node in ysorted.get_children():
		if ch.name.begins_with("NatBush_") or ch.name.begins_with("NatRock_"):
			to_remove.append(ch)
	for n: Node in to_remove:
		ysorted.remove_child(n)
		n.free()

	var is_city: bool = rid.begins_with("k")
	var used: Rect2i = terrain.get_used_rect()
	var cols: int = used.size.x
	var rows: int = used.size.y

	# Kumpulkan posisi terlarang (bangunan, NPC, portal, jembatan, spawn)
	var forbidden: Array[Vector2] = []
	var trees: Array[Vector2] = []
	for ch: Node in ysorted.get_children():
		if not (ch is Node2D):
			continue
		var n2: Node2D = ch as Node2D
		var nm: String = n2.name
		if nm.begins_with("NatTree") or nm.begins_with("BorderTree"):
			trees.append(n2.position)
		else:
			forbidden.append(n2.position)
	for ch: Node in root.get_children():
		if ch is Node2D and (ch.name.begins_with("Bridge_") or ch.name.begins_with("Portal")):
			forbidden.append((ch as Node2D).position)
	var spawns: Node = root.get_node_or_null("SpawnPoints")
	if spawns != null:
		for sp: Node in spawns.get_children():
			if sp is Node2D:
				forbidden.append((sp as Node2D).position)

	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = hash(rid + "_bushes_rocks_v1")

	var placed: Array[Vector2] = []
	var bush_count: int = 0
	var rock_count: int = 0

	# 1) Semak mengelompok di kaki pohon (~35% pohon, kecuali kota lebih jarang ~18%)
	var bush_chance: float = 0.18 if is_city else 0.35
	for tpos: Vector2 in trees:
		if rng.randf() > bush_chance:
			continue
		var count: int = 1 if rng.randf() < 0.72 else 2
		for _i: int in count:
			var ang: float = rng.randf_range(0.0, TAU)
			var dist: float = rng.randf_range(14.0, 24.0)
			var pos: Vector2 = tpos + Vector2(cos(ang) * dist, sin(ang) * dist * 0.75 + 4.0)
			if _is_safe_land(terrain, pos, forbidden, placed, 14.0):
				var kind: String = _pick_bush_kind(rid, rng)
				_spawn_prop(ysorted, root, "NatBush_%d" % bush_count, kind, pos)
				placed.append(pos)
				bush_count += 1

	# 2) Batu tepi sungai/danau (klaster Big/River + Small di daratan tepat di samping air)
	if not is_city:
		var bank_candidates: Array[Vector2i] = []
		for r: int in range(used.position.y + 2, used.position.y + rows - 2, 2):
			for c: int in range(used.position.x + 2, used.position.x + cols - 2, 2):
				var cell: Vector2i = Vector2i(c, r)
				if not _is_walkable_nature(terrain, cell):
					continue
				if _adjacent_to_water(terrain, cell):
					bank_candidates.append(cell)
		for cell: Vector2i in bank_candidates:
			if rng.randf() > 0.08:
				continue
			var pos: Vector2 = Vector2(cell.x * 16.0 + rng.randf_range(4.0, 12.0), cell.y * 16.0 + rng.randf_range(4.0, 12.0))
			if not _is_safe_land(terrain, pos, forbidden, placed, 26.0):
				continue
			var main_kind: String = "rock_snow" if rid == "snow" else "rock_river"
			_spawn_prop(ysorted, root, "NatRock_%d" % rock_count, main_kind, pos)
			placed.append(pos)
			rock_count += 1
			# Pendamping batu kecil (Rule of 3 / Big-Small)
			var sub_pos: Vector2 = pos + Vector2(rng.randf_range(-14.0, 14.0), rng.randf_range(4.0, 10.0))
			if _is_safe_land(terrain, sub_pos, forbidden, placed, 10.0):
				_spawn_prop(ysorted, root, "NatRock_%d" % rock_count, "rock_small", sub_pos)
				placed.append(sub_pos)
				rock_count += 1

	# 3) Klaster batu alam di pinggir hutan / padang / salju (jarang & berkelompok Big + Small)
	if not is_city:
		var rock_target: int = maxi(2, int(trees.size() * 0.06))
		var attempts: int = rock_target * 6
		var clusters: int = 0
		while clusters < rock_target and attempts > 0:
			attempts -= 1
			if trees.is_empty():
				break
			var base_t: Vector2 = trees[rng.randi() % trees.size()]
			var pos: Vector2 = base_t + Vector2(rng.randf_range(-34.0, 34.0), rng.randf_range(-20.0, 26.0))
			if not _is_safe_land(terrain, pos, forbidden, placed, 32.0):
				continue
			var main_kind: String = _pick_rock_kind(rid, rng)
			_spawn_prop(ysorted, root, "NatRock_%d" % rock_count, main_kind, pos)
			placed.append(pos)
			rock_count += 1
			clusters += 1
			# 1-2 batu kecil pendamping
			var subs: int = 1 if rng.randf() < 0.65 else 2
			for _s: int in subs:
				var sp: Vector2 = pos + Vector2(rng.randf_range(-16.0, 16.0), rng.randf_range(5.0, 12.0))
				if _is_safe_land(terrain, sp, forbidden, placed, 10.0):
					_spawn_prop(ysorted, root, "NatRock_%d" % rock_count, "rock_small", sp)
					placed.append(sp)
					rock_count += 1

	var out_ps: PackedScene = PackedScene.new()
	out_ps.pack(root)
	ResourceSaver.save(out_ps, path)
	root.free()
	print_rich("  [color=cyan]%s.tscn[/color] -> %d semak, %d batu" % [rid, bush_count, rock_count])
	return Vector2i(bush_count, rock_count)


func _spawn_prop(parent: Node, owner_root: Node, node_name: String, kind: String, pos: Vector2) -> void:
	var prop: NatureProp = NatureProp.new()
	prop.name = node_name
	prop.prop_kind = kind
	prop.position = pos.round()
	parent.add_child(prop)
	prop.owner = owner_root


func _pick_bush_kind(rid: String, rng: RandomNumberGenerator) -> String:
	if rid == "snow":
		return "bush_snow"
	if rid == "swamp":
		return "bush_swamp"
	if rng.randf() < 0.22:
		return "bush_berry"
	return "bush_green"


func _pick_rock_kind(rid: String, rng: RandomNumberGenerator) -> String:
	if rid == "snow":
		return "rock_snow"
	if rid == "forest" or rid == "deepwood" or rid == "swamp":
		return "rock_moss" if rng.randf() < 0.7 else "rock_big"
	return "rock_big"


func _is_walkable_nature(terrain: TileMapLayer, cell: Vector2i) -> bool:
	var atlas: Vector2i = terrain.get_cell_atlas_coords(cell)
	if atlas == Vector2i(-1, -1):
		return false
	# Rumput (0..3, row 0), Salju (4..7, row 1), Rawa (8..11, row 1)
	if atlas.y == 0 and atlas.x >= 0 and atlas.x < 4:
		return true
	if atlas.y == 1 and atlas.x >= 4 and atlas.x < 12:
		return true
	return false


func _adjacent_to_water(terrain: TileMapLayer, cell: Vector2i) -> bool:
	for off: Vector2i in [Vector2i(0, -1), Vector2i(0, 1), Vector2i(-1, 0), Vector2i(1, 0)]:
		var a: Vector2i = terrain.get_cell_atlas_coords(cell + off)
		if (a.y == 0 or a.y == 1) and a.x >= 12:
			return true
	return false


func _is_safe_land(terrain: TileMapLayer, pos: Vector2, forbidden: Array[Vector2], placed: Array[Vector2], min_gap: float) -> bool:
	var cell: Vector2i = Vector2i(int(floor(pos.x / 16.0)), int(floor(pos.y / 16.0)))
	if not _is_walkable_nature(terrain, cell):
		return false
	for fp: Vector2 in forbidden:
		if pos.distance_to(fp) < 38.0:
			return false
	for pp: Vector2 in placed:
		if pos.distance_to(pp) < min_gap:
			return false
	return true
