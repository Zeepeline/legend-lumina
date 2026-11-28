class_name HitStop
extends RefCounted
## Hit stop: permainan dibekukan sesaat (skala waktu sangat kecil) saat pukulan pemain kena, agar pukulan terasa berat.
## Dilewati saat headless (tes otomatis) agar tidak mengganggu waktu simulasi.

static var _active: bool = false


static func apply(tree: SceneTree, duration: float, time_scale: float = 0.05) -> void:
	if tree == null or _active or DisplayServer.get_name() == "headless":
		return
	_active = true
	Engine.time_scale = time_scale
	await tree.create_timer(duration, true, false, true).timeout
	Engine.time_scale = 1.0
	_active = false
