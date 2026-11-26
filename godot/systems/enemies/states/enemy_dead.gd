class_name EnemyDeadState
extends State

var _done: bool = false


func enter(_msg: Dictionary) -> void:
	if _done:
		return
	_done = true
	var e: EnemyBase = actor as EnemyBase
	e.velocity = Vector2.ZERO
	e.set_attack_hitbox(false)
	e.hurtbox.set_invulnerable(true)
	e.body_shape.set_deferred("disabled", true)
	e.sprite.modulate = Color(1.8, 1.8, 1.8)
	e.notify_boss_hp(false)

	if e.data != null:
		var gold_gain: int = e.rng.randi_range(e.data.gold_min, e.data.gold_max)
		var exp_gain: int = e.data.exp_reward
		GameStateStore.ref.record_kill()
		var levels_gained: int = GameStateStore.ref.grant_rewards(exp_gain, gold_gain)
		EventsBus.ref.enemy_defeated.emit(e.data.id, exp_gain, gold_gain)
		DamageNumber.spawn(e.get_parent(), e.global_position, "+%d EXP  +%d G" % [exp_gain, gold_gain], Color(1.0, 0.9, 0.45))
		if not String(e.data.drop_item_id).is_empty() and e.rng.randf() < e.data.drop_chance:
			GameStateStore.ref.add_item(e.data.drop_item_id, 1)
			EventsBus.ref.notification_requested.emit(tr("msg_drop_item") % ItemDatabase.display_name(e.data.drop_item_id))
		if e.data.is_boss and not String(e.data.boss_flag).is_empty():
			GameStateStore.ref.set_flag(e.data.boss_flag, true)
			EventsBus.ref.notification_requested.emit(tr("msg_boss_down") % tr(e.data.name_key))
		if levels_gained > 0:
			AudioService.ref.play_sfx_id(&"level_up")
			EventsBus.ref.notification_requested.emit(tr("msg_level_up") % GameStateStore.ref.level)

	var tw: Tween = e.create_tween()
	tw.tween_property(e.sprite, "modulate:a", 0.0, 0.35)
	tw.tween_callback(e.queue_free)
