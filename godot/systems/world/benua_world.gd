class_name BenuaWorld
extends Node2D
## Pengelola dunia terbuka Benua Lumina: menjahit 14 wilayah luar ruangan dengan chunk streaming & y-sort lintas wilayah.

const PLAYER_SCENE: PackedScene = preload("res://systems/player/player.tscn")
const WILD_GRASS_TEX: Texture2D = preload("res://assets/art/ground/gnd_wild_sprout.png")
const OUTDOOR_CAMERA_ZOOM: float = 1.25
const STREAM_LOAD_DIST: float = 900.0
const STREAM_UNLOAD_DIST: float = 1550.0
const STREAM_CHECK_INTERVAL: float = 0.25


class WildFillerLayer extends Node2D:
	func _draw() -> void:
		# Luar wilayah: rumput Sprout kotak-kotak yang sama dengan tanah benua, sedikit lebih gelap (tidak bisa dimasuki).
		var bounds: Rect2i = WorldLayout.continent_bounds().grow(900)
		draw_texture_rect(WILD_GRASS_TEX, Rect2(bounds), true, Color(0.95, 0.97, 0.95, 1.0))


var _wild_filler: WildFillerLayer = null
var _chunks_root: Node2D = null
var _loaded_chunks: Dictionary = {}
var _active_region: StringName = &""
var _player: Node2D = null
var _stream_timer: float = 0.0
var _initialized: bool = false


func _ready() -> void:
	name = "BenuaWorld"
	y_sort_enabled = true
	set_meta("is_indoor", false)
	set_meta("is_dark_cave", false)
	set_meta("camera_zoom", OUTDOOR_CAMERA_ZOOM)
	_ensure_structure()


func _ensure_structure() -> void:
	if _initialized:
		return
	_initialized = true
	_wild_filler = WildFillerLayer.new()
	_wild_filler.name = "WildFiller"
	_wild_filler.z_index = -18
	add_child(_wild_filler)
	_chunks_root = Node2D.new()
	_chunks_root.name = "Chunks"
	_chunks_root.y_sort_enabled = true
	add_child(_chunks_root)


func start_at(region_id: StringName, spawn_id: StringName = &"default") -> Node2D:
	_ensure_structure()
	var rid: StringName = region_id if WorldLayout.is_benua_id(region_id) else &"village"
	_active_region = rid
	_load_region(rid)
	var chunk: Node2D = _loaded_chunks.get(rid, null)
	if chunk == null:
		return null

	var local_pos: Vector2 = _find_local_spawn(chunk, rid, spawn_id)
	var region_rect: Rect2i = WorldLayout.get_rect(rid)
	var world_pos: Vector2 = Vector2(region_rect.position) + local_pos
	update_streaming_at(world_pos)

	var parent_node: Node = _get_ysorted_parent(chunk)
	_player = PLAYER_SCENE.instantiate() as Node2D
	_player.position = local_pos
	parent_node.add_child(_player)
	_apply_continent_camera()
	return _player


func teleport_player_to(region_id: StringName, spawn_id: StringName = &"default") -> void:
	_ensure_structure()
	var rid: StringName = region_id if WorldLayout.is_benua_id(region_id) else &"village"
	_active_region = rid
	_load_region(rid)
	var chunk: Node2D = _loaded_chunks.get(rid, null)
	if chunk == null or _player == null or not is_instance_valid(_player):
		return

	var local_pos: Vector2 = _find_local_spawn(chunk, rid, spawn_id)
	var region_rect: Rect2i = WorldLayout.get_rect(rid)
	var world_pos: Vector2 = Vector2(region_rect.position) + local_pos
	update_streaming_at(world_pos)

	var target_parent: Node = _get_ysorted_parent(chunk)
	if _player.get_parent() != target_parent:
		_player.reparent(target_parent, false)
	_player.position = local_pos
	if _player.has_method("reset_physics_interpolation"):
		_player.call("reset_physics_interpolation")
	_apply_continent_camera()


func get_player() -> Node2D:
	return _player


func get_active_region() -> StringName:
	return _active_region


func get_loaded_region_ids() -> Array[StringName]:
	var ids: Array[StringName] = []
	for k: Variant in _loaded_chunks.keys():
		ids.append(k as StringName)
	return ids


func update_streaming_at(world_pos: Vector2) -> void:
	_ensure_structure()
	for k: Variant in WorldLayout.REGIONS.keys():
		var rid: StringName = k
		var r: Rect2i = WorldLayout.REGIONS[rid]["rect"]
		var d: float = WorldLayout.distance_to_rect(world_pos, r)
		if d <= STREAM_LOAD_DIST:
			if not _loaded_chunks.has(rid):
				_load_region(rid)
		elif d > STREAM_UNLOAD_DIST and rid != _active_region:
			_unload_region(rid)


func cleanup() -> void:
	for k: Variant in _loaded_chunks.keys().duplicate():
		_unload_region(k as StringName)
	_loaded_chunks.clear()
	_active_region = &""


func _physics_process(delta: float) -> void:
	if _player == null or not is_instance_valid(_player):
		return
	var world_pos: Vector2 = _player.global_position
	var new_rid: StringName = WorldLayout.region_at(world_pos)
	if new_rid != &"" and new_rid != _active_region:
		_on_region_crossed(new_rid)

	_stream_timer += delta
	if _stream_timer >= STREAM_CHECK_INTERVAL:
		_stream_timer = 0.0
		update_streaming_at(world_pos)


func _on_region_crossed(new_rid: StringName) -> void:
	if not _loaded_chunks.has(new_rid):
		_load_region(new_rid)
	_active_region = new_rid
	var new_chunk: Node2D = _loaded_chunks.get(new_rid, null)
	if new_chunk != null and _player != null and is_instance_valid(_player):
		var target_parent: Node = _get_ysorted_parent(new_chunk)
		if _player.get_parent() != target_parent:
			_player.reparent(target_parent, true)

	var new_path: String = WorldLayout.path_from_id(new_rid)
	if GameStateStore.ref != null:
		GameStateStore.ref.current_map = new_path
		GameStateStore.ref.is_indoor = false
		GameStateStore.ref.is_dark_cave = false
		GameStateStore.ref.mark_map_visited(new_path)
	if EventsBus.ref != null:
		EventsBus.ref.map_changed.emit(new_path, &"seamless")


func _apply_continent_camera() -> void:
	if _player == null or not is_instance_valid(_player):
		return
	if _player.has_method("set_camera_zoom"):
		_player.call("set_camera_zoom", Vector2(OUTDOOR_CAMERA_ZOOM, OUTDOOR_CAMERA_ZOOM))
	if _player.has_method("set_camera_limits"):
		_player.call("set_camera_limits", WorldLayout.continent_bounds(), OUTDOOR_CAMERA_ZOOM)


func _load_region(rid: StringName) -> void:
	if _loaded_chunks.has(rid):
		return
	var reg: Dictionary = WorldLayout.get_region(rid)
	if reg.is_empty():
		return
	var map_path: String = str(reg.get("path", ""))
	if map_path.is_empty():
		return
	var res: Resource = ResourceLoader.load(map_path)
	if res == null or not res is PackedScene:
		push_error("BenuaWorld: gagal memuat wilayah '%s'" % map_path)
		return
	var chunk: Node2D = (res as PackedScene).instantiate() as Node2D
	var rect: Rect2i = reg["rect"]
	chunk.position = Vector2(rect.position)
	chunk.y_sort_enabled = true
	chunk.set_meta("region_id", str(rid))
	_enforce_ground_z_order(chunk)
	_strip_seamless_portals(chunk, rid)
	_chunks_root.add_child(chunk)
	_loaded_chunks[rid] = chunk


func _enforce_ground_z_order(chunk: Node2D) -> void:
	var z_map: Dictionary = {
		"GroundDirt": -12,
		"GroundSand": -11,
		"GroundGrass": -10,
		"GroundSprite": -8,
		"GroundWater": -7,
	}
	for lname: Variant in z_map.keys():
		var layer: CanvasItem = chunk.get_node_or_null(str(lname)) as CanvasItem
		if layer != null:
			layer.z_index = int(z_map[lname])
	# Air sudah tergambar di gambar tanah (tepi pasir & kedalaman). Petak air TileMap hanya dipakai untuk tabrakan:
	# dibuat tak terlihat agar tidak menimpa gambar dengan kotak biru polos yang tidak pas.
	var water: CanvasItem = chunk.get_node_or_null("GroundWater") as CanvasItem
	if water != null:
		water.self_modulate = Color(1.0, 1.0, 1.0, 0.0)
	# Jembatan (sudah tergambar di gambar tanah): petak air di bawahnya dihapus agar bisa diseberangi.
	var tml: TileMapLayer = water as TileMapLayer
	var rid: StringName = StringName(str(chunk.get_meta("region_id", "")))
	if tml != null and BridgesData.LIST.has(rid):
		for br: Rect2i in BridgesData.LIST[rid]:
			for cy: int in range(floori(br.position.y / 16.0), ceili(br.end.y / 16.0)):
				for cx: int in range(floori((br.position.x + 4) / 16.0), ceili((br.end.x - 4) / 16.0)):
					tml.erase_cell(Vector2i(cx, cy))


func _unload_region(rid: StringName) -> void:
	if not _loaded_chunks.has(rid):
		return
	var chunk: Node2D = _loaded_chunks[rid]
	_loaded_chunks.erase(rid)
	if is_instance_valid(chunk):
		chunk.queue_free()


func _strip_seamless_portals(chunk: Node2D, region_id: StringName) -> void:
	for child: Node in chunk.get_children():
		if child is Portal:
			var p: Portal = child as Portal
			var target_id: StringName = WorldLayout.id_from_path(p.target_map)
			if WorldLayout.is_seamless_link(region_id, target_id):
				p.monitoring = false
				p.monitorable = false
				p.queue_free()


func _get_ysorted_parent(chunk: Node2D) -> Node:
	var ysorted: Node = chunk.get_node_or_null("YSorted")
	return ysorted if ysorted != null else chunk


func _find_local_spawn(chunk: Node2D, region_id: StringName, spawn_id: StringName) -> Vector2:
	var reg: Dictionary = WorldLayout.get_region(region_id)
	var fallback: Vector2 = reg.get("spawn_default", Vector2(256.0, 200.0))
	var spawns_container: Node = chunk.get_node_or_null("SpawnPoints")
	var search_root: Node = spawns_container if spawns_container != null else chunk
	var found_any: bool = false
	for child: Node in search_root.get_children():
		if child is Marker2D:
			var marker: Marker2D = child as Marker2D
			if not found_any:
				fallback = marker.position
				found_any = true
			if marker.get("spawn_id") == spawn_id:
				return marker.position
	return fallback
