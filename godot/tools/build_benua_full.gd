extends SceneTree
## Bangun 1 scene tunggal (res://maps/benua_full.tscn) yang menggabungkan seluruh 14 daerah luar
## pada posisi koordinat global WorldLayout.REGIONS menggunakan scene instancing.

const OUT_PATH: String = "res://maps/benua_full.tscn"


func _init() -> void:
	var root: Node2D = Node2D.new()
	root.name = "BenuaFull"

	var count: int = 0
	for rid: StringName in WorldLayout.REGIONS.keys():
		var info: Dictionary = WorldLayout.REGIONS[rid] as Dictionary
		var map_path: String = str(info.get("path", ""))
		var rect: Rect2i = info.get("rect", Rect2i()) as Rect2i
		var ps: PackedScene = ResourceLoader.load(map_path) as PackedScene
		if ps == null:
			push_warning("Gagal memuat %s" % map_path)
			continue
		var inst: Node2D = ps.instantiate() as Node2D
		if inst == null:
			continue
		inst.name = "Region_%s" % String(rid)
		inst.position = Vector2(rect.position)
		root.add_child(inst)
		inst.owner = root
		count += 1

	var packed: PackedScene = PackedScene.new()
	var pack_err: Error = packed.pack(root)
	root.free()
	if pack_err != OK:
		push_error("Gagal pack BenuaFull: %d" % pack_err)
		quit(1)
		return
	var save_err: Error = ResourceSaver.save(packed, OUT_PATH)
	if save_err != OK:
		push_error("Gagal menyimpan %s: %d" % [OUT_PATH, save_err])
		quit(1)
		return
	print_rich("[color=green]Berhasil membuat %s (%d wilayah tergabung)![/color]" % [OUT_PATH, count])
	quit(0)
