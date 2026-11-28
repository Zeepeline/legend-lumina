extends SceneTree
## Buka toko & dialog contoh → /tmp/gt/menu_shop.png, /tmp/gt/menu_dialog.png
var frame: int = 0
func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())
func _process(_d: float) -> bool:
	frame += 1
	if frame == 300:
		var ids: Array[StringName] = [&"potion", &"ether", &"iron_sword", &"leather_vest"]
		EventsBus.ref.shop_requested.emit(&"test", "ui_shop_title", ids)
	if frame == 340:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/menu_shop.png")
		for n: Node in root.find_children("*", "ShopMenu", true, false):
			n.call("_close")
	if frame == 360:
		var dlg: Resource = null
		for f: String in DirAccess.get_files_at("res://data/dialogues"):
			if f.ends_with(".tres"):
				dlg = ResourceLoader.load("res://data/dialogues/" + f.trim_suffix(".remap"))
				break
		EventsBus.ref.dialogue_requested.emit(dlg)
	if frame == 420:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/menu_dialog.png")
		return true
	return false
