class_name SceneService
extends Node

static var ref: SceneService = null

const PLAYER_SCENE: PackedScene = preload("res://systems/player/player.tscn")

var _world_root: Node = null
var _fade_rect: ColorRect = null
var _current_map: Node = null
var _current_player: Node2D = null
var _busy: bool = false


func _enter_tree() -> void:
	ref = self


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	if EventsBus.ref != null:
		EventsBus.ref.player_died.connect(_on_player_died)


func setup(world_root: Node, fade_rect: ColorRect) -> void:
	_world_root = world_root
	_fade_rect = fade_rect
	if _fade_rect != null:
		_fade_rect.color.a = 0.0
		_fade_rect.visible = false


func is_busy() -> bool:
	return _busy


func change_map(path: String, spawn_id: StringName = &"default", use_fade: bool = true) -> void:
	if _busy or _world_root == null:
		return
	_busy = true
	var tree: SceneTree = get_tree()
	tree.paused = true
	if EventsBus.ref != null:
		EventsBus.ref.boss_hp_changed.emit("", 0, 1, false)
	if use_fade:
		await _fade_to(1.0, 0.2)

	var loaded: Resource = null
	if use_fade:
		ResourceLoader.load_threaded_request(path)
		while ResourceLoader.load_threaded_get_status(path) == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
			await tree.process_frame
		loaded = ResourceLoader.load_threaded_get(path)
	else:
		loaded = ResourceLoader.load(path)
	if loaded == null or not loaded is PackedScene:
		push_error("SceneService: failed to load map '%s'" % path)
		if use_fade:
			await _fade_to(0.0, 0.2)
		tree.paused = false
		_busy = false
		return

	if _current_map != null:
		_current_map.queue_free()
		_current_map = null
		_current_player = null
		await tree.process_frame

	var packed: PackedScene = loaded as PackedScene
	_current_map = packed.instantiate()
	_world_root.add_child(_current_map)

	var gs: GameStateStore = GameStateStore.ref
	gs.is_indoor = bool(_current_map.get_meta("is_indoor", false))
	gs.is_dark_cave = bool(_current_map.get_meta("is_dark_cave", false))
	gs.current_map = path
	gs.spawn_id = spawn_id
	gs.mark_map_visited(path)

	_spawn_player(_current_map, spawn_id)
	EventsBus.ref.map_changed.emit(path, spawn_id)

	if use_fade:
		await _fade_to(0.0, 0.22)
	tree.paused = false
	_busy = false


func _spawn_player(map_node: Node, spawn_id: StringName) -> void:
	var target_parent: Node = map_node.get_node_or_null("YSorted")
	if target_parent == null:
		target_parent = map_node
	var spawn_pos: Vector2 = _find_spawn_position(map_node, spawn_id)
	var player_inst: Node2D = PLAYER_SCENE.instantiate() as Node2D
	player_inst.position = spawn_pos
	target_parent.add_child(player_inst)
	_current_player = player_inst

	var zoom_val: float = float(map_node.get_meta("camera_zoom", 1.0))
	if player_inst.has_method("set_camera_zoom"):
		player_inst.call("set_camera_zoom", Vector2(zoom_val, zoom_val))

	var bounds: Rect2i = _compute_map_bounds(map_node)
	if bounds.size != Vector2i.ZERO and player_inst.has_method("set_camera_limits"):
		player_inst.call("set_camera_limits", bounds, zoom_val)


func _find_spawn_position(map_node: Node, spawn_id: StringName) -> Vector2:
	var fallback: Vector2 = Vector2(256.0, 200.0)
	var found_any: bool = false
	for node: Node in get_tree().get_nodes_in_group(&"spawn_points"):
		if not map_node.is_ancestor_of(node):
			continue
		if node is Marker2D:
			var marker: Marker2D = node as Marker2D
			if not found_any:
				fallback = marker.position
				found_any = true
			if marker.get("spawn_id") == spawn_id:
				return marker.position
	return fallback


func _compute_map_bounds(map_node: Node) -> Rect2i:
	var combined: Rect2i = Rect2i()
	var has_rect: bool = false
	for child: Node in map_node.get_children():
		if child is TileMapLayer:
			var layer: TileMapLayer = child as TileMapLayer
			var used: Rect2i = layer.get_used_rect()
			if used.size == Vector2i.ZERO or layer.tile_set == null:
				continue
			var tile_sz: Vector2i = layer.tile_set.tile_size
			var px_rect: Rect2i = Rect2i(used.position * tile_sz, used.size * tile_sz)
			if not has_rect:
				combined = px_rect
				has_rect = true
			else:
				combined = combined.merge(px_rect)
	if not has_rect and map_node.has_meta("map_bounds"):
		var meta_rect: Variant = map_node.get_meta("map_bounds")
		if meta_rect is Rect2i:
			return meta_rect as Rect2i
	return combined


func _fade_to(target_alpha: float, duration: float) -> void:
	if _fade_rect == null:
		return
	_fade_rect.visible = true
	var tw: Tween = create_tween()
	tw.tween_property(_fade_rect, "color:a", target_alpha, duration)
	await tw.finished
	if target_alpha <= 0.01:
		_fade_rect.visible = false


func _on_player_died() -> void:
	if _busy:
		return
	GameStateStore.ref.respawn_after_defeat()
	EventsBus.ref.notification_requested.emit(tr("msg_defeated"))
	await change_map(GameStateStore.DEFAULT_MAP, GameStateStore.DEFAULT_SPAWN, true)
