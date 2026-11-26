class_name MapBuilderHelper
extends RefCounted

const SPROUT_TREE_SCENE: PackedScene = preload("res://systems/world/sprout_tree.tscn")
const NPC_SCENE: PackedScene = preload("res://systems/npc/npc.tscn")
const ENEMY_SCENE: PackedScene = preload("res://systems/enemies/enemy_base.tscn")
const PORTAL_SCENE: PackedScene = preload("res://systems/world/portal.tscn")
const SHRINE_SCENE: PackedScene = preload("res://systems/world/shrine.tscn")
const CHEST_SCENE: PackedScene = preload("res://systems/world/chest.tscn")
const ANIMAL_SCENE: PackedScene = preload("res://systems/world/ambient_animal.tscn")
const FISHING_SPOT_SCENE: PackedScene = preload("res://systems/world/fishing_spot.tscn")
const BUILDING_SCRIPT: Script = preload("res://systems/world/building_prop.gd")
const SPAWN_SCRIPT: Script = preload("res://systems/world/spawn_point.gd")
const BED_SCRIPT: Script = preload("res://systems/world/bed_interactable.gd")


static func load_res(path: String) -> Resource:
	return ResourceLoader.load(path)


static func create_outdoor_base(map_name: String, ts: TileSet, cols: int, rows: int) -> Dictionary:
	var root: Node2D = Node2D.new()
	root.name = map_name
	root.set_meta("is_indoor", false)
	root.set_meta("camera_zoom", 1.0)
	root.set_meta("is_dark_cave", false)

	var dirt: TileMapLayer = TileMapLayer.new()
	dirt.name = "GroundDirt"
	dirt.tile_set = ts
	root.add_child(dirt)
	dirt.owner = root
	fill_dirt_layer(dirt, cols, rows)

	var grass: TileMapLayer = TileMapLayer.new()
	grass.name = "GroundGrass"
	grass.tile_set = ts
	root.add_child(grass)
	grass.owner = root

	var water: TileMapLayer = TileMapLayer.new()
	water.name = "GroundWater"
	water.tile_set = ts
	root.add_child(water)
	water.owner = root

	var ysorted: Node2D = Node2D.new()
	ysorted.name = "YSorted"
	ysorted.y_sort_enabled = true
	root.add_child(ysorted)
	ysorted.owner = root

	var spawns: Node2D = Node2D.new()
	spawns.name = "SpawnPoints"
	root.add_child(spawns)
	spawns.owner = root

	var grid: Array[bool] = []
	grid.resize(cols * rows)
	grid.fill(true)

	return {
		"root": root,
		"dirt": dirt,
		"grass": grass,
		"water": water,
		"ysorted": ysorted,
		"spawns": spawns,
		"grid": grid,
		"cols": cols,
		"rows": rows,
	}


static func fill_dirt_layer(layer: TileMapLayer, cols: int, rows: int) -> void:
	for r: int in rows:
		for c: int in cols:
			var tx: int = (c * 7 + r * 13) % 4
			var ty: int = (c * 3 + r * 5) % 4
			layer.set_cell(Vector2i(c, r), 0, Vector2i(tx, ty))


static func fill_cobble_rect(layer: TileMapLayer, c0: int, r0: int, c1: int, r1: int) -> void:
	for r: int in range(r0, r1 + 1):
		for c: int in range(c0, c1 + 1):
			var tx: int = (c * 5 + r * 11) % 4
			var ty: int = (c * 7 + r * 3) % 4
			layer.set_cell(Vector2i(c, r), 3, Vector2i(tx, ty))


static func carve_cobble_road(
	dirt_layer: TileMapLayer,
	grass_grid: Array[bool],
	cols: int,
	rows: int,
	p0: Vector2,
	p1: Vector2,
	radius: float
) -> void:
	var steps: int = maxi(4, int(p0.distance_to(p1) * 2.0))
	for s: int in steps + 1:
		var t: float = float(s) / float(steps)
		var pt: Vector2 = p0.lerp(p1, t)
		for r: int in rows:
			for c: int in cols:
				var dx: float = (float(c) - pt.x) / radius
				var dy: float = (float(r) - pt.y) / radius
				if dx * dx + dy * dy <= 1.0:
					grass_grid[r * cols + c] = false
					var tx: int = (c * 5 + r * 11) % 4
					var ty: int = (c * 7 + r * 3) % 4
					dirt_layer.set_cell(Vector2i(c, r), 3, Vector2i(tx, ty))


static func carve_ellipse(grid: Array[bool], cols: int, rows: int, center: Vector2, rx: float, ry: float) -> void:
	for r: int in rows:
		for c: int in cols:
			var dx: float = (float(c) - center.x) / rx
			var dy: float = (float(r) - center.y) / ry
			if dx * dx + dy * dy <= 1.0:
				grid[r * cols + c] = false


static func carve_road(grid: Array[bool], cols: int, rows: int, p0: Vector2, p1: Vector2, radius: float) -> void:
	var steps: int = maxi(4, int(p0.distance_to(p1) * 2.0))
	for s: int in steps + 1:
		var t: float = float(s) / float(steps)
		carve_ellipse(grid, cols, rows, p0.lerp(p1, t), radius, radius)


static func apply_grass_autotile(layer: TileMapLayer, grid: Array[bool], cols: int, rows: int) -> void:
	for _pass: int in 2:
		var snap: Array[bool] = grid.duplicate()
		for r: int in range(1, rows - 1):
			for c: int in range(1, cols - 1):
				var idx: int = r * cols + c
				var n: int = 0
				for oy: int in range(-1, 2):
					for ox: int in range(-1, 2):
						if ox == 0 and oy == 0:
							continue
						if snap[(r + oy) * cols + (c + ox)]:
							n += 1
				if snap[idx] and n <= 2:
					grid[idx] = false
				elif not snap[idx] and n >= 6:
					grid[idx] = true
	var cells: Array[Vector2i] = []
	for r: int in rows:
		for c: int in cols:
			if grid[r * cols + c]:
				cells.append(Vector2i(c, r))
	layer.set_cells_terrain_connect(cells, 0, 0, false)


static func paint_water_ellipse(water: TileMapLayer, grid: Array[bool], cols: int, rows: int, center: Vector2, rx: float, ry: float) -> void:
	for r: int in rows:
		for c: int in cols:
			var dx: float = (float(c) - center.x) / rx
			var dy: float = (float(r) - center.y) / ry
			if dx * dx + dy * dy <= 1.0:
				water.set_cell(Vector2i(c, r), 2, Vector2i(0, 0))
				grid[r * cols + c] = false


static func clear_water_rect(water: TileMapLayer, c0: int, r0: int, c1: int, r1: int) -> void:
	for r: int in range(r0, r1 + 1):
		for c: int in range(c0, c1 + 1):
			water.erase_cell(Vector2i(c, r))


static func add_tree(ysorted: Node2D, root: Node, node_name: String, pos: Vector2, variant: String) -> void:
	var t_inst: SproutTree = SPROUT_TREE_SCENE.instantiate() as SproutTree
	t_inst.name = node_name
	t_inst.position = pos
	t_inst.variant = variant
	ysorted.add_child(t_inst)
	t_inst.owner = root


static func add_tree_ring(
	ysorted: Node2D,
	root: Node,
	w: int,
	h: int,
	step: int,
	variant_a: String,
	variant_b: String,
	skip_rects: Array[Rect2]
) -> void:
	var idx: int = 0
	var pts: Array[Vector2] = []
	for x: int in range(56, w - 40, step):
		pts.append(Vector2(x, 62 + ((x * 7) % 24)))
		pts.append(Vector2(x + 16, h - 42 - ((x * 5) % 22)))
	for y: int in range(110, h - 90, step):
		pts.append(Vector2(52 + ((y * 5) % 22), y))
		pts.append(Vector2(w - 52 - ((y * 7) % 22), y + 14))
	for p: Vector2 in pts:
		var blocked: bool = false
		for sr: Rect2 in skip_rects:
			if sr.has_point(p):
				blocked = true
				break
		if not blocked:
			add_tree(ysorted, root, "RingTree_%d" % idx, p, variant_a if idx % 2 == 0 else variant_b)
			idx += 1


static func add_prop(
	parent: Node,
	scene_root: Node,
	prop_name: String,
	tex_path: String,
	pos: Vector2,
	col_sz: Vector2,
	walkable_z: int = 0
) -> void:
	var tex: Texture2D = load_res(tex_path) as Texture2D
	if col_sz == Vector2.ZERO:
		var spr: Sprite2D = Sprite2D.new()
		spr.name = prop_name
		spr.position = pos
		spr.texture = tex
		spr.offset = Vector2(0.0, -float(tex.get_height()) * 0.5)
		spr.z_index = walkable_z
		parent.add_child(spr)
		spr.owner = scene_root
		return

	var body: StaticBody2D = StaticBody2D.new()
	body.name = prop_name
	body.position = pos
	body.collision_layer = 1
	body.collision_mask = 0
	parent.add_child(body)
	body.owner = scene_root

	var spr_b: Sprite2D = Sprite2D.new()
	spr_b.name = "Sprite2D"
	spr_b.texture = tex
	spr_b.offset = Vector2(0.0, -float(tex.get_height()) * 0.5)
	body.add_child(spr_b)
	spr_b.owner = scene_root

	var col: CollisionShape2D = CollisionShape2D.new()
	col.name = "CollisionShape2D"
	var rect: RectangleShape2D = RectangleShape2D.new()
	rect.size = col_sz
	col.shape = rect
	col.position = Vector2(0.0, -col_sz.y * 0.5)
	body.add_child(col)
	col.owner = scene_root


static func add_atlas_prop(
	parent: Node,
	scene_root: Node,
	prefix: String,
	atlas_tex: Texture2D,
	region: Rect2,
	scale_f: float,
	pos: Vector2,
	col_sz: Vector2
) -> void:
	var at: AtlasTexture = AtlasTexture.new()
	at.atlas = atlas_tex
	at.region = region
	if col_sz != Vector2.ZERO:
		var body: StaticBody2D = StaticBody2D.new()
		body.name = "%s_%d_%d" % [prefix, int(pos.x), int(pos.y)]
		body.position = pos
		body.collision_layer = 1
		body.collision_mask = 0
		parent.add_child(body)
		body.owner = scene_root

		var spr: Sprite2D = Sprite2D.new()
		spr.name = "Sprite2D"
		spr.texture = at
		spr.scale = Vector2(scale_f, scale_f)
		spr.offset = Vector2(0.0, -region.size.y * 0.5)
		body.add_child(spr)
		spr.owner = scene_root

		var col: CollisionShape2D = CollisionShape2D.new()
		col.name = "CollisionShape2D"
		var rect: RectangleShape2D = RectangleShape2D.new()
		rect.size = col_sz
		col.shape = rect
		col.position = Vector2(0.0, -col_sz.y * 0.5)
		body.add_child(col)
		col.owner = scene_root
	else:
		var spr: Sprite2D = Sprite2D.new()
		spr.name = "%s_%d_%d" % [prefix, int(pos.x), int(pos.y)]
		spr.position = pos
		spr.texture = at
		spr.scale = Vector2(scale_f, scale_f)
		spr.offset = Vector2(0.0, -region.size.y * 0.5)
		spr.z_index = -1
		parent.add_child(spr)
		spr.owner = scene_root


static func add_npc(
	ysorted: Node2D,
	root: Node,
	node_name: String,
	name_key: String,
	tex_path: String,
	dlg_path: String,
	pos: Vector2,
	facing: String = "down",
	wander: float = 0.0,
	shop_id: StringName = &"",
	shop_title_key: String = "",
	shop_items: Array[StringName] = [],
	teach_skill_id: StringName = &"",
	teach_cost: int = 0
) -> void:
	var npc_inst: NpcActor = NPC_SCENE.instantiate() as NpcActor
	npc_inst.name = node_name
	npc_inst.npc_name_key = name_key
	npc_inst.sprite_sheet = load_res(tex_path) as Texture2D
	if not dlg_path.is_empty():
		npc_inst.dialogue = load_res(dlg_path) as DialogueData
	npc_inst.position = pos
	npc_inst.facing_dir = facing
	npc_inst.wander_radius = wander
	npc_inst.shop_id = shop_id
	npc_inst.shop_title_key = shop_title_key
	npc_inst.shop_item_ids = shop_items
	npc_inst.teach_skill_id = teach_skill_id
	npc_inst.teach_cost = teach_cost
	ysorted.add_child(npc_inst)
	npc_inst.owner = root


static func add_enemy(ysorted: Node2D, root: Node, node_name: String, enemy_id: String, pos: Vector2) -> void:
	var enemy: EnemyBase = ENEMY_SCENE.instantiate() as EnemyBase
	enemy.name = node_name
	enemy.data = load_res("res://data/enemies/%s.tres" % enemy_id) as EnemyData
	enemy.position = pos
	ysorted.add_child(enemy)
	enemy.owner = root


static func add_chest(
	ysorted: Node2D,
	root: Node,
	node_name: String,
	cid: StringName,
	item_id: StringName,
	qty: int,
	gold: int,
	pos: Vector2
) -> void:
	var c: ChestProp = CHEST_SCENE.instantiate() as ChestProp
	c.name = node_name
	c.chest_id = cid
	c.reward_item_id = item_id
	c.reward_qty = qty
	c.reward_gold = gold
	c.position = pos
	ysorted.add_child(c)
	c.owner = root


static func add_animal(ysorted: Node2D, root: Node, node_name: String, species: String, pos: Vector2) -> void:
	var a: AmbientAnimal = ANIMAL_SCENE.instantiate() as AmbientAnimal
	a.name = node_name
	a.species = species
	a.position = pos
	ysorted.add_child(a)
	a.owner = root


static func add_shrine(ysorted: Node2D, root: Node, pos: Vector2) -> void:
	var sh: ShrineProp = SHRINE_SCENE.instantiate() as ShrineProp
	sh.name = "LightShrine"
	sh.position = pos
	ysorted.add_child(sh)
	sh.owner = root


static func add_fishing_spot(root: Node, node_name: String, pos: Vector2) -> void:
	var fs: FishingSpot = FISHING_SPOT_SCENE.instantiate() as FishingSpot
	fs.name = node_name
	fs.position = pos
	root.add_child(fs)
	fs.owner = root


static func add_spawn(spawns_parent: Node, root: Node, node_name: String, id: StringName, pos: Vector2) -> void:
	var marker: Marker2D = Marker2D.new()
	marker.name = node_name
	marker.position = pos
	marker.set_script(SPAWN_SCRIPT)
	marker.set("spawn_id", id)
	spawns_parent.add_child(marker)
	marker.owner = root


static func add_portal(
	root: Node,
	node_name: String,
	pos: Vector2,
	target_map: String,
	target_spawn: StringName,
	box_size: Vector2 = Vector2(48, 22)
) -> void:
	var p: Portal = PORTAL_SCENE.instantiate() as Portal
	p.name = node_name
	p.position = pos
	p.target_map = target_map
	p.target_spawn_id = target_spawn
	if box_size != Vector2(48, 20):
		var col: CollisionShape2D = p.get_node_or_null("CollisionShape2D") as CollisionShape2D
		if col != null:
			var rect: RectangleShape2D = RectangleShape2D.new()
			rect.size = box_size
			col.shape = rect
	root.add_child(p)
	p.owner = root


static func add_borders(root: Node, rects: Array[Rect2]) -> void:
	var borders: StaticBody2D = StaticBody2D.new()
	borders.name = "Borders"
	borders.collision_layer = 1
	borders.collision_mask = 0
	root.add_child(borders)
	borders.owner = root
	for idx: int in rects.size():
		var r: Rect2 = rects[idx]
		var col: CollisionShape2D = CollisionShape2D.new()
		col.name = "Wall_%d" % idx
		var shape: RectangleShape2D = RectangleShape2D.new()
		shape.size = r.size
		col.shape = shape
		col.position = r.position + r.size * 0.5
		borders.add_child(col)
		col.owner = root


static func add_bed(root: Node, node_name: String, pos: Vector2) -> void:
	var area: Area2D = Area2D.new()
	area.name = node_name
	area.position = pos
	area.collision_layer = 64
	area.collision_mask = 0
	area.set_script(BED_SCRIPT)
	root.add_child(area)
	area.owner = root

	var col: CollisionShape2D = CollisionShape2D.new()
	col.name = "CollisionShape2D"
	var shape: CircleShape2D = CircleShape2D.new()
	shape.radius = 20.0
	col.shape = shape
	area.add_child(col)
	col.owner = root


static func save_scene(root: Node, path: String) -> void:
	var packed: PackedScene = PackedScene.new()
	packed.pack(root)
	ResourceSaver.save(packed, path)
	root.free()
