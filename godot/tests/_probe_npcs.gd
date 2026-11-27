extends SceneTree
## Foto close-up tiap NPC bergaya tokoh utama di dunia → /tmp/gt/n_<nama>.png
var frame: int = 0
var targets: Array = []
var idx: int = 0
var wait: int = 0

func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())

func _process(_d: float) -> bool:
	frame += 1
	if frame < 90: return false
	var pl: Node2D = SceneService.ref.get_current_player()
	if pl == null: return false
	if frame == 90:
		var bw: Node = SceneService.ref._benua_world
		for k: Variant in WorldLayout.REGIONS.keys():
			bw.call("update_streaming_at", Vector2(WorldLayout.get_rect(k).get_center()))
		return false
	if frame == 120:
		for n: Node in root.find_children("*", "", true, false):
			var rp: String = str((n.get("sprite_sheet") as Texture2D).resource_path) if n.get("sprite_sheet") is Texture2D else ""
			if rp.contains("npc_mc_") and (OS.get_environment("NPC_FILTER") == "" or rp.get_file().get_basename().trim_prefix("npc_mc_") in OS.get_environment("NPC_FILTER").split(",")):
				targets.append(n)
		printerr("NPC mc: %d dari %d node" % [targets.size(), root.find_children("*", "", true, false).size()])
		return false
	if frame < 121: return false
	if idx >= mini(targets.size(), 40): return true
	if not is_instance_valid(targets[idx]):
		idx += 1; wait = 0
		return false
	var t: Node2D = targets[idx] as Node2D
	if wait == 0:
		pl.global_position = t.global_position + Vector2(-40, 20)
	wait += 1
	if wait == 30:
		var p: String = str((t.get("sprite_sheet") as Texture2D).resource_path).get_file().get_basename()
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/n_%02d_%s.png" % [idx, p])
		idx += 1; wait = 0
	return false
