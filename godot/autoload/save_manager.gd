class_name SaveService
extends Node

static var ref: SaveService = null

const SAVE_VERSION: int = 4
const DEFAULT_SAVE_DIR: String = "user://saves"


func _enter_tree() -> void:
	ref = self


func _slot_path(slot: int, save_dir: String = DEFAULT_SAVE_DIR) -> String:
	return "%s/slot_%d.json" % [save_dir, slot]


func has_slot(slot: int, save_dir: String = DEFAULT_SAVE_DIR) -> bool:
	return FileAccess.file_exists(_slot_path(slot, save_dir))


func save_slot(slot: int, save_dir: String = DEFAULT_SAVE_DIR) -> bool:
	var dir_err: Error = DirAccess.make_dir_recursive_absolute(save_dir)
	if dir_err != OK and dir_err != ERR_ALREADY_EXISTS:
		push_error("SaveService: failed to create directory '%s'" % save_dir)
		return false
	var gs: GameStateStore = GameStateStore.ref
	var payload: Dictionary = {
		"version": SAVE_VERSION,
		"timestamp": Time.get_unix_time_from_system(),
		"meta": {
			"location": gs.current_map,
			"level": gs.level,
			"play_time_sec": gs.play_time_sec,
		},
		"state": gs.to_dict(),
	}
	var json_text: String = JSON.stringify(payload, "\t")
	var final_path: String = _slot_path(slot, save_dir)
	var tmp_path: String = "%s.tmp" % final_path
	var bak_path: String = "%s.bak" % final_path

	var f: FileAccess = FileAccess.open(tmp_path, FileAccess.WRITE)
	if f == null:
		push_error("SaveService: cannot write temp file '%s'" % tmp_path)
		return false
	f.store_string(json_text)
	f.flush()
	f.close()

	if FileAccess.file_exists(final_path):
		DirAccess.copy_absolute(final_path, bak_path)
	var rename_err: Error = DirAccess.rename_absolute(tmp_path, final_path)
	if rename_err != OK:
		push_error("SaveService: atomic rename failed for '%s'" % final_path)
		return false
	return true


func load_slot(slot: int, save_dir: String = DEFAULT_SAVE_DIR) -> bool:
	var path: String = _slot_path(slot, save_dir)
	if not FileAccess.file_exists(path):
		return false
	var raw: String = FileAccess.get_file_as_string(path)
	var parsed: Variant = JSON.parse_string(raw)
	if not parsed is Dictionary:
		push_warning("SaveService: corrupted save file '%s'" % path)
		return false
	var data: Dictionary = migrate(parsed as Dictionary)
	var state_var: Variant = data.get("state", null)
	if not state_var is Dictionary:
		push_warning("SaveService: missing state dict in '%s'" % path)
		return false
	GameStateStore.ref.from_dict(state_var as Dictionary)
	return true


func delete_slot(slot: int, save_dir: String = DEFAULT_SAVE_DIR) -> void:
	var final_path: String = _slot_path(slot, save_dir)
	var bak_path: String = "%s.bak" % final_path
	var tmp_path: String = "%s.tmp" % final_path
	for p: String in [final_path, bak_path, tmp_path]:
		if FileAccess.file_exists(p):
			DirAccess.remove_absolute(p)


func migrate(data: Dictionary) -> Dictionary:
	var out: Dictionary = data.duplicate(true)
	var ver: int = int(out.get("version", 1))
	while ver < SAVE_VERSION:
		if ver == 1:
			out = _migrate_1_to_2(out)
			ver = 2
		elif ver == 2:
			out = _migrate_2_to_3(out)
			ver = 3
		elif ver == 3:
			out = _migrate_3_to_4(out)
			ver = 4
		else:
			break
	out["version"] = ver
	return out


func _migrate_1_to_2(data: Dictionary) -> Dictionary:
	var out: Dictionary = data.duplicate(true)
	var st_var: Variant = out.get("state", {})
	var st: Dictionary = st_var.duplicate(true) if st_var is Dictionary else {}
	if not st.has("flask_max"):
		st["flask_max"] = 3
	if not st.has("flask_charges"):
		st["flask_charges"] = st["flask_max"]
	if not st.has("skin_id"):
		st["skin_id"] = "mc2_slave"
	out["state"] = st
	out["version"] = 2
	return out


func _migrate_2_to_3(data: Dictionary) -> Dictionary:
	var out: Dictionary = data.duplicate(true)
	var st_var: Variant = out.get("state", {})
	var st: Dictionary = st_var.duplicate(true) if st_var is Dictionary else {}
	if not st.has("max_mp"):
		st["max_mp"] = 30
	if not st.has("mp"):
		st["mp"] = st["max_mp"]
	if not st.has("magic"):
		st["magic"] = 8
	if not st.has("equipped_weapon_id"):
		st["equipped_weapon_id"] = "starter_sword"
	if not st.has("equipped_armor_id"):
		st["equipped_armor_id"] = "cloth_tunic"
	if not st.has("owned_weapons"):
		st["owned_weapons"] = [st["equipped_weapon_id"]]
	if not st.has("owned_armors"):
		st["owned_armors"] = [st["equipped_armor_id"]]
	if not st.has("visited_maps"):
		st["visited_maps"] = [GameStateStore.DEFAULT_MAP]
	if not st.has("unlocked_shrines"):
		st["unlocked_shrines"] = [GameStateStore.DEFAULT_MAP]
	if not st.has("world_hour"):
		st["world_hour"] = 9.0
	out["state"] = st
	out["version"] = 3
	return out


func _migrate_3_to_4(data: Dictionary) -> Dictionary:
	var out: Dictionary = data.duplicate(true)
	var st_var: Variant = out.get("state", {})
	var st: Dictionary = st_var.duplicate(true) if st_var is Dictionary else {}
	if not st.has("learned_skills"):
		st["learned_skills"] = ["fire"]
	if not st.has("active_skill_id"):
		st["active_skill_id"] = "fire"
	if not st.has("skill_uses"):
		st["skill_uses"] = {}
	if not st.has("claimed_quests"):
		st["claimed_quests"] = []
	if not st.has("kill_count"):
		st["kill_count"] = 0
	if not st.has("craft_count"):
		st["craft_count"] = 0
	if not st.has("fish_count"):
		st["fish_count"] = 0
	if not st.has("music_volume"):
		st["music_volume"] = 0.75
	if not st.has("sfx_volume"):
		st["sfx_volume"] = 0.85
	out["state"] = st
	out["version"] = 4
	return out
