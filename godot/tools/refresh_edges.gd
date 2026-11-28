extends SceneTree
## Segarkan layer GroundEdge (tepian rumput bergerigi, pantai pasir-sungai, & transisi tanah-pasir)
## berdasarkan GroundTerrain yang SUDAH ada di tiap .tscn — TIDAK mengubah editan manual GroundTerrain!

const REGIONS: Array[String] = [
	"village", "lake", "meadow", "forest", "deepwood", "river",
	"swamp", "snow", "road", "kgate", "kpasar", "kakademi", "kbawah", "kpermukiman",
]


func _init() -> void:
	for rid: String in REGIONS:
		_refresh_region(rid)
	print_rich("[color=green]Selesai! Semua GroundEdge telah disegarkan sesuai GroundTerrain saat ini.[/color]")
	quit(0)


func _refresh_region(rid: String) -> void:
	var scene_path: String = "res://maps/%s.tscn" % rid
	var packed: PackedScene = ResourceLoader.load(scene_path) as PackedScene
	if packed == null:
		return
	var root: Node2D = packed.instantiate() as Node2D
	var terrain: TileMapLayer = root.get_node_or_null("GroundTerrain") as TileMapLayer
	var edge_layer: TileMapLayer = root.get_node_or_null("GroundEdge") as TileMapLayer
	if terrain == null or edge_layer == null:
		root.free()
		return

	# Baca klasifikasi langsung dari ubin GroundTerrain yang ada:
	# 0=rumput, 1=jalan/paving, 2=air, 3=pasir
	var cell_kind: Dictionary = {}
	var used: Array[Vector2i] = terrain.get_used_cells()
	for c: Vector2i in used:
		var ac: Vector2i = terrain.get_cell_atlas_coords(c)
		if ac.x >= 12 and (ac.y == 0 or ac.y == 1):
			cell_kind[c] = 2  # air
		elif ac.y == 0 and ac.x >= 8 and ac.x < 12:
			cell_kind[c] = 3  # pasir
		elif (ac.y == 0 and ac.x >= 4 and ac.x < 8) or (ac.y == 1 and ac.x < 4):
			cell_kind[c] = 1  # jalan tanah / paving
		elif ac.y == 0 and ac.x < 4:
			cell_kind[c] = 0  # rumput hijau
		else:
			cell_kind[c] = 4  # salju/rawa/lainnya

	edge_layer.clear()
	for c: Vector2i in used:
		var k: int = int(cell_kind.get(c, 4))
		var h: int = absi(c.x * 37 + c.y * 73 + c.x * c.y * 11)
		if k == 2:
			# Air menyentuh daratan -> tepian pantai (Baris 5)
			var smask: int = 0
			if cell_kind.has(c + Vector2i(0, -1)) and int(cell_kind[c + Vector2i(0, -1)]) != 2:
				smask |= 1
			if cell_kind.has(c + Vector2i(1, 0)) and int(cell_kind[c + Vector2i(1, 0)]) != 2:
				smask |= 2
			if cell_kind.has(c + Vector2i(0, 1)) and int(cell_kind[c + Vector2i(0, 1)]) != 2:
				smask |= 4
			if cell_kind.has(c + Vector2i(-1, 0)) and int(cell_kind[c + Vector2i(-1, 0)]) != 2:
				smask |= 8
			if smask > 0:
				var alt_s: int = 0
				if (smask == 1 or smask == 4) and (h % 2 == 1):
					alt_s = TileSetAtlasSource.TRANSFORM_FLIP_H
				elif (smask == 2 or smask == 8) and (h % 2 == 1):
					alt_s = TileSetAtlasSource.TRANSFORM_FLIP_V
				edge_layer.set_cell(c, 0, Vector2i(smask, 5), alt_s)
		elif k == 1 or k == 3:
			# Jalan atau pasir menyentuh rumput hijau -> pinggiran rumput bergerigi (Baris 4)
			var gmask: int = 0
			if cell_kind.has(c + Vector2i(0, -1)) and int(cell_kind[c + Vector2i(0, -1)]) == 0:
				gmask |= 1
			if cell_kind.has(c + Vector2i(1, 0)) and int(cell_kind[c + Vector2i(1, 0)]) == 0:
				gmask |= 2
			if cell_kind.has(c + Vector2i(0, 1)) and int(cell_kind[c + Vector2i(0, 1)]) == 0:
				gmask |= 4
			if cell_kind.has(c + Vector2i(-1, 0)) and int(cell_kind[c + Vector2i(-1, 0)]) == 0:
				gmask |= 8
			if gmask > 0:
				var alt_g: int = 0
				if (gmask == 1 or gmask == 4) and (h % 2 == 1):
					alt_g = TileSetAtlasSource.TRANSFORM_FLIP_H
				elif (gmask == 2 or gmask == 8) and (h % 2 == 1):
					alt_g = TileSetAtlasSource.TRANSFORM_FLIP_V
				edge_layer.set_cell(c, 0, Vector2i(gmask, 4), alt_g)
			elif k == 3:
				# Pasir menyentuh jalan tanah -> transisi tanah-pasir (Baris 6)
				var dmask: int = 0
				if cell_kind.has(c + Vector2i(0, -1)) and int(cell_kind[c + Vector2i(0, -1)]) == 1:
					dmask |= 1
				if cell_kind.has(c + Vector2i(1, 0)) and int(cell_kind[c + Vector2i(1, 0)]) == 1:
					dmask |= 2
				if cell_kind.has(c + Vector2i(0, 1)) and int(cell_kind[c + Vector2i(0, 1)]) == 1:
					dmask |= 4
				if cell_kind.has(c + Vector2i(-1, 0)) and int(cell_kind[c + Vector2i(-1, 0)]) == 1:
					dmask |= 8
				if dmask > 0:
					var alt_d: int = 0
					if (dmask == 1 or dmask == 4) and (h % 2 == 1):
						alt_d = TileSetAtlasSource.TRANSFORM_FLIP_H
					elif (dmask == 2 or dmask == 8) and (h % 2 == 1):
						alt_d = TileSetAtlasSource.TRANSFORM_FLIP_V
					edge_layer.set_cell(c, 0, Vector2i(dmask, 6), alt_d)

	var out_ps: PackedScene = PackedScene.new()
	out_ps.pack(root)
	ResourceSaver.save(out_ps, scene_path)
	root.free()
