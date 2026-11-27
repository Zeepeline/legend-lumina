extends SceneTree
## Foto tiap wilayah dari jauh (zoom kecil) untuk mencari tekstur tanah yang belum rapi → /tmp/gt/o_<id>_<n>.png
var frame: int = 0
var ids: Array = []
var shots: Array = []
var idx: int = 0
var wait: int = 0

func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())
	for k: Variant in WorldLayout.REGIONS.keys():
		var r: Rect2i = WorldLayout.get_rect(k)
		var nx: int = maxi(1, int(ceil(r.size.x / 1300.0))); var ny: int = maxi(1, int(ceil(r.size.y / 730.0)))
		for j: int in ny:
			for i: int in nx:
				shots.append([str(k), j * nx + i, Vector2(r.position.x + (i + 0.5) * r.size.x / nx, r.position.y + (j + 0.5) * r.size.y / ny)])

func _process(_d: float) -> bool:
	frame += 1
	if frame < 90: return false
	var pl: Node2D = SceneService.ref.get_current_player()
	if pl == null: return false
	if idx >= shots.size(): return true
	var cam: Camera2D = pl.get_viewport().get_camera_2d()
	if wait == 0:
		pl.global_position = shots[idx][2]
		var bw: Node = SceneService.ref._benua_world
		if bw: bw.call("update_streaming_at", pl.global_position)
		if cam:
			cam.zoom = Vector2(0.37, 0.37)
			cam.limit_left = -100000; cam.limit_top = -100000; cam.limit_right = 100000; cam.limit_bottom = 100000
			cam.position_smoothing_enabled = false
	wait += 1
	if cam: cam.zoom = Vector2(0.37, 0.37)
	if wait == 45:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/o_%s_%d.png" % [shots[idx][0], shots[idx][1]])
		idx += 1; wait = 0
	return false
