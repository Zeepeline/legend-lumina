extends SceneTree
## Foto setiap perbatasan pasangan wilayah (pemain ditaruh tepat di garis sambungan).
var frame: int = 0
var idx: int = 0
var wait: int = 0
var pairs: Array = []
var lines: PackedStringArray = []

func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())
	for p: Array in WorldLayout.SEAMLESS_PAIRS: pairs.append(p)

func _mid(a: StringName, b: StringName) -> Vector2:
	var ra: Rect2i = WorldLayout.get_rect(a); var rb: Rect2i = WorldLayout.get_rect(b)
	var x0: int = maxi(ra.position.x, rb.position.x); var x1: int = mini(ra.end.x, rb.end.x)
	var y0: int = maxi(ra.position.y, rb.position.y); var y1: int = mini(ra.end.y, rb.end.y)
	return Vector2((x0 + x1) / 2.0, (y0 + y1) / 2.0)

func _process(_d: float) -> bool:
	frame += 1
	if frame < 90: return false
	var pl: Node2D = SceneService.ref.get_current_player()
	if pl == null: return false
	if idx >= pairs.size():
		var f: FileAccess = FileAccess.open("/tmp/gt/edges.txt", FileAccess.WRITE); f.store_string("\n".join(lines)); f.close(); return true
	if wait == 0:
		var p: Array = pairs[idx]
		pl.global_position = _mid(p[0], p[1])
		var bw: Node = SceneService.ref._benua_world
		if bw: bw.call("update_streaming_at", pl.global_position)
	wait += 1
	if wait == 40:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/e_%02d.png" % idx)
		lines.append("%d %s-%s %s" % [idx, pairs[idx][0], pairs[idx][1], str(pl.global_position.round())])
		idx += 1; wait = 0
	return false
