extends SceneTree
## Uji bidik bantu & hit stop: pemain diletakkan dekat musuh menghadap menjauh, lalu menyerang.
var frame: int = 0
var enemy: Node2D = null
func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())
func _process(_d: float) -> bool:
	frame += 1
	var pl: Player = SceneService.ref.get_current_player() as Player if SceneService.ref != null else null
	if frame == 120:
		var bw: Node = SceneService.ref._benua_world
		bw.call("update_streaming_at", Vector2(WorldLayout.get_rect(&"forest").get_center()))
	if frame == 200 and pl != null:
		for n: Node in root.get_tree().get_nodes_in_group(&"enemies"):
			enemy = n as Node2D
			break
		if enemy == null:
			printerr("tak ada musuh")
			return true
		enemy.set_physics_process(false)
		pl.global_position = enemy.global_position + Vector2(-30, 6)
		pl.facing = Vector2.UP
	if frame == 229 and pl != null:
		printerr("pl %s musuh %s assist %s" % [pl.global_position, enemy.global_position, pl.aim_assist_dir(Vector2.ZERO)])
		for n: Node in root.get_tree().get_nodes_in_group(&"enemies"):
			var e2: Node2D = n as Node2D
			if e2.global_position.distance_to(pl.global_position) < 90.0:
				printerr("  dekat: %s %s vis=%s" % [e2.name, e2.global_position, e2.is_visible_in_tree()])
	if frame == 230 and pl != null:
		Input.action_press(&"attack")
	if frame == 232 and pl != null:
		Input.action_release(&"attack")
		printerr("facing setelah serang: %s (musuh di kanan)" % pl.facing)
	if frame > 230 and frame < 260 and Engine.time_scale < 0.5:
		printerr("hit stop aktif di frame %d (skala %.2f), hp musuh %s" % [frame, Engine.time_scale, str(enemy.get("hp"))])
	if frame == 236:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/combat.png")
		printerr("time_scale saat kena: %.2f" % Engine.time_scale)
	if frame == 300:
		printerr("time_scale sesudah: %.2f" % Engine.time_scale)
		return true
	return false
