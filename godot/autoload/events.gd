class_name EventsBus
extends Node

static var ref: EventsBus = null

@warning_ignore("unused_signal")
signal player_stats_changed
@warning_ignore("unused_signal")
signal player_died
@warning_ignore("unused_signal")
signal enemy_defeated(enemy_id: StringName, exp_gain: int, gold_gain: int)
@warning_ignore("unused_signal")
signal boss_hp_changed(boss_name: String, hp: int, max_hp: int, active: bool)
@warning_ignore("unused_signal")
signal dialogue_requested(data: DialogueData)
@warning_ignore("unused_signal")
signal dialogue_finished(id: StringName)
@warning_ignore("unused_signal")
signal shop_requested(shop_id: StringName, title_key: String, item_ids: Array[StringName])
@warning_ignore("unused_signal")
signal interact_prompt_changed(label_key: String, visible: bool)
@warning_ignore("unused_signal")
signal map_changed(map_path: String, spawn_id: StringName)
@warning_ignore("unused_signal")
signal notification_requested(text: String)
@warning_ignore("unused_signal")
signal skin_changed(skin_id: StringName)
@warning_ignore("unused_signal")
signal touch_controls_toggled(enabled: bool)
@warning_ignore("unused_signal")
signal time_of_day_changed(hour: float)
@warning_ignore("unused_signal")
signal inventory_changed
@warning_ignore("unused_signal")
signal skill_changed(skill_id: StringName)
@warning_ignore("unused_signal")
signal quest_updated


func _enter_tree() -> void:
	ref = self
