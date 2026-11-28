extends SceneTree
## Tes konektivitas sungai lintas 14 peta luar Benua Lumina (berdasarkan GroundTerrain di .tscn).
## Jalankan: Godot --headless --path godot --script res://tests/test_river_connectivity.gd

const REGIONS: Array[StringName] = [
	&"village", &"lake", &"meadow", &"forest", &"deepwood", &"river",
	&"swamp", &"snow", &"road", &"kgate", &"kpasar", &"kakademi", &"kbawah", &"kpermukiman",
]


func _init() -> void:
	var global_water: Dictionary = {}  # Vector2i -> StringName (region_id)
	var region_water: Dictionary = {}  # StringName -> Array[Vector2i] (global tile coords)

	for rid: StringName in REGIONS:
		var reg: Dictionary = WorldLayout.get_region(rid)
		if reg.is_empty():
			continue
		var rect: Rect2i = reg["rect"]
		var gx0: int = rect.position.x / 16
		var gy0: int = rect.position.y / 16
		var packed: PackedScene = ResourceLoader.load(str(reg["path"])) as PackedScene
		if packed == null:
			continue
		var root: Node2D = packed.instantiate() as Node2D
		var terrain: TileMapLayer = root.get_node_or_null("GroundTerrain") as TileMapLayer
		var wlist: Array[Vector2i] = []
		if terrain != null:
			for c: Vector2i in terrain.get_used_cells():
				var ac: Vector2i = terrain.get_cell_atlas_coords(c)
				if ac.x >= 12 and (ac.y == 0 or ac.y == 1):
					var gc: Vector2i = Vector2i(gx0 + c.x, gy0 + c.y)
					global_water[gc] = rid
					wlist.append(gc)
		region_water[rid] = wlist
		root.free()

	print_rich("[b]=== 1. CEK SAMBUNGAN SUNGAI ANTAR-WILAYAH ===[/b]")
	var linked_pairs: Dictionary = {}
	for gc: Variant in global_water.keys():
		var pos: Vector2i = gc as Vector2i
		var ra: StringName = global_water[pos]
		for d: Vector2i in [Vector2i(1, 0), Vector2i(0, 1)]:
			var nb: Vector2i = pos + d
			if global_water.has(nb):
				var rb: StringName = global_water[nb]
				if ra != rb:
					var key: String = "%s <-> %s" % [str(ra), str(rb)] if str(ra) < str(rb) else "%s <-> %s" % [str(rb), str(ra)]
					linked_pairs[key] = int(linked_pairs.get(key, 0)) + 1

	for k: Variant in linked_pairs.keys():
		print_rich("  [color=green]NYAMBUNG[/color]  %s (%d ubin bersentuhan)" % [str(k), int(linked_pairs[k])])

	print_rich("\n[b]=== 2. KOMPONEN AIR TERHUBUNG (BFS GLOBAL) ===[/b]")
	var visited: Dictionary = {}
	var comp_idx: int = 0
	for start: Variant in global_water.keys():
		var sp: Vector2i = start as Vector2i
		if visited.has(sp):
			continue
		comp_idx += 1
		var q: Array[Vector2i] = [sp]
		visited[sp] = true
		var regs_in_comp: Dictionary = {}
		var count: int = 0
		while not q.is_empty():
			var cur: Vector2i = q.pop_front()
			count += 1
			regs_in_comp[global_water[cur]] = true
			for d: Vector2i in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
				var nxt: Vector2i = cur + d
				if global_water.has(nxt) and not visited.has(nxt):
					visited[nxt] = true
					q.append(nxt)
		if count >= 20:
			var rnames: PackedStringArray = PackedStringArray()
			for rn: Variant in regs_in_comp.keys():
				rnames.append(str(rn))
			print_rich("  Jaringan #%d: %d ubin air -> wilayah: [%s]" % [comp_idx, count, ", ".join(rnames)])

	quit(0)
