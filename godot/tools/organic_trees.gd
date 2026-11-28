extends SceneTree
## Memecah pola baris lurus pada NatTree_* dan BorderTree_* di seluruh 14 peta luar
## dengan geseran organik acak (±16px X, ±14px Y) yang tetap aman di atas rumput/salju/rawa
## (tidak pernah bergeser ke air, pasir, jalan tanah, atau paving kota).

const REGIONS: Array[String] = [
	"village", "lake", "meadow", "forest", "deepwood", "river",
	"swamp", "snow", "road", "kgate", "kpasar", "kakademi", "kbawah", "kpermukiman",
]


func _init() -> void:
	var total_moved: int = 0
	for rid: String in REGIONS:
		total_moved += _jitter_region(rid)
	print_rich("[color=green]Selesai! %d pohon digeser organik agar tidak berbaris lurus.[/color]" % total_moved)
	quit(0)


func _is_safe_tree_tile(terrain: TileMapLayer, cell: Vector2i) -> bool:
	if terrain == null:
		return true
	var src: int = terrain.get_cell_source_id(cell)
	if src == -1:
		return false
	var ac: Vector2i = terrain.get_cell_atlas_coords(cell)
	# Aman hanya di rumput (row 0, col 0..3), salju (row 1, col 4..7), atau rawa (row 1, col 8..11)
	if ac.y == 0 and ac.x < 4:
		return true
	if ac.y == 1 and ac.x >= 4 and ac.x < 12:
		return true
	return false


func _jitter_region(rid: String) -> int:
	var scene_path: String = "res://maps/%s.tscn" % rid
	var packed: PackedScene = ResourceLoader.load(scene_path) as PackedScene
	if packed == null:
		return 0
	var root: Node2D = packed.instantiate() as Node2D
	var terrain: TileMapLayer = root.get_node_or_null("GroundTerrain") as TileMapLayer
	var ysorted: Node = root.get_node_or_null("YSorted")
	if ysorted == null:
		root.free()
		return 0

	var moved: int = 0
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = hash(rid) + 2026

	for ch: Node in ysorted.get_children():
		if not (ch is Node2D):
			continue
		var n2: Node2D = ch as Node2D
		if not (n2.name.begins_with("NatTree") or n2.name.begins_with("BorderTree")):
			continue
		for _attempt: int in 6:
			var dx: float = rng.randf_range(-16.0, 16.0)
			var dy: float = rng.randf_range(-14.0, 14.0)
			var cand: Vector2 = n2.position + Vector2(dx, dy)
			var cell: Vector2i = Vector2i(int(cand.x / 16.0), int(cand.y / 16.0))
			if _is_safe_tree_tile(terrain, cell):
				n2.position = cand.round()
				moved += 1
				break

	var out_ps: PackedScene = PackedScene.new()
	out_ps.pack(root)
	ResourceSaver.save(out_ps, scene_path)
	root.free()
	return moved
