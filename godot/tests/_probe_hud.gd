extends SceneTree
## Tangkapan layar dunia (HUD disembunyikan bila HIDE_HUD=1) → /tmp/gt/hud.png
var frame: int = 0
func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())
func _process(_d: float) -> bool:
	frame += 1
	if frame == 300 and OS.get_environment("HIDE_HUD") == "1":
		for n: Node in root.find_children("HUD", "", true, false):
			(n as CanvasItem).visible = false
		for n: Node in root.find_children("SpellBar", "", true, false):
			(n as CanvasItem).visible = false
	if frame == 310 and OS.get_environment("TOUCH") == "1":
		GameStateStore.ref.toggle_touch_controls()
	if frame == 420:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/hud.png")
		return true
	return false
