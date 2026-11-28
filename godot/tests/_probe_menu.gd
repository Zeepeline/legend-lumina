extends SceneTree
## Buka menu lewat aksi input (MENU=inventory|journal|map|pause) → /tmp/gt/menu_<MENU>.png
var frame: int = 0
func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())
func _process(_d: float) -> bool:
	frame += 1
	var m: String = OS.get_environment("MENU")
	if frame == 300:
		var ev: InputEventAction = InputEventAction.new()
		ev.action = StringName(m); ev.pressed = true
		Input.parse_input_event(ev)
	if frame == 303:
		var ev2: InputEventAction = InputEventAction.new()
		ev2.action = StringName(m); ev2.pressed = false
		Input.parse_input_event(ev2)
	if frame == 360:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/menu_%s.png" % m)
		return true
	return false
