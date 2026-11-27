extends SceneTree
## Tiap jembatan: pemain ditaruh di ujung awal lalu berjalan menyeberang; foto & catat apakah sampai seberang.
var frame: int = 0
var list: Array = []
var idx: int = 0
var step: int = 0
var lines: PackedStringArray = []

func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())
	for k: Variant in BridgesData.LIST.keys():
		for r: Rect2i in BridgesData.LIST[k]:
			list.append([k, r])

func _process(_d: float) -> bool:
	frame += 1
	if frame < 90: return false
	var pl: Node2D = SceneService.ref.get_current_player()
	if pl == null: return false
	if idx >= list.size():
		var f: FileAccess = FileAccess.open("/tmp/gt/bridges.txt", FileAccess.WRITE); f.store_string("\n".join(lines)); f.close(); return true
	var k: StringName = list[idx][0]; var r: Rect2i = list[idx][1]
	var o: Vector2 = Vector2(WorldLayout.get_rect(k).position)
	var vert: bool = r.size.y > r.size.x
	var act: StringName = &"move_down" if vert else &"move_right"
	if step == 0:
		pl.global_position = o + (Vector2(r.position.x + r.size.x / 2.0, r.position.y - 6) if vert else Vector2(r.position.x - 6, r.position.y + r.size.y / 2.0 + 6))
		var bw: Node = SceneService.ref._benua_world
		if bw: bw.call("update_streaming_at", pl.global_position)
	if step == 30: Input.action_press(act)
	if step == 70: root.get_viewport().get_texture().get_image().save_png("/tmp/gt/b_%02d.png" % idx)
	if step == 150:
		Input.action_release(act)
		var end: Vector2 = o + (Vector2(r.position.x, r.end.y) if vert else Vector2(r.end.x, r.position.y))
		var ok: bool = (pl.global_position.y > end.y - 4) if vert else (pl.global_position.x > end.x - 4)
		lines.append("%s %s ok=%s pos=%s" % [k, str(r), str(ok), str((pl.global_position - o).round())])
		idx += 1; step = -1
	step += 1
	return false
