class_name JournalMenu
extends Control

@onready var title_label: Label = $Center/Panel/Margin/VBox/Header/TitleLabel
@onready var close_btn: Button = $Center/Panel/Margin/VBox/Header/CloseBtn
@onready var tab_quests: Button = $Center/Panel/Margin/VBox/Tabs/QuestsTab
@onready var tab_skills: Button = $Center/Panel/Margin/VBox/Tabs/SkillsTab
@onready var tab_craft: Button = $Center/Panel/Margin/VBox/Tabs/CraftTab
@onready var list_box: VBoxContainer = $Center/Panel/Margin/VBox/Scroll/ListBox

var _tab: String = "quests"


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	title_label.text = tr("ui_journal_title")
	close_btn.text = tr("ui_close")
	tab_quests.text = tr("ui_tab_quests")
	tab_skills.text = tr("ui_tab_skills")
	tab_craft.text = tr("ui_tab_craft")
	close_btn.pressed.connect(_close)
	tab_quests.pressed.connect(func() -> void: _switch_tab("quests"))
	tab_skills.pressed.connect(func() -> void: _switch_tab("skills"))
	tab_craft.pressed.connect(func() -> void: _switch_tab("craft"))
	EventsBus.ref.quest_updated.connect(_rebuild_if_open)
	EventsBus.ref.skill_changed.connect(func(_s: StringName) -> void: _rebuild_if_open())
	EventsBus.ref.inventory_changed.connect(_rebuild_if_open)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed(&"journal") and not SceneService.ref.is_busy():
		get_viewport().set_input_as_handled()
		if visible:
			_close()
		elif not get_tree().paused:
			_open()
	elif visible and event.is_action_pressed(&"pause"):
		get_viewport().set_input_as_handled()
		_close()


func _open() -> void:
	visible = true
	get_tree().paused = true
	AudioService.ref.play_ui_id(&"ui_click")
	_rebuild()
	tab_quests.grab_focus()


func _close() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	visible = false
	get_tree().paused = false


func _switch_tab(t: String) -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	_tab = t
	_rebuild()


func _rebuild_if_open() -> void:
	if visible:
		_rebuild()


func _rebuild() -> void:
	for ch: Node in list_box.get_children():
		ch.queue_free()
	var gs: GameStateStore = GameStateStore.ref
	var snap: Dictionary = gs.quest_snapshot()

	if _tab == "quests":
		for q: Dictionary in QuestDatabase.QUESTS:
			var qid: StringName = q["id"] as StringName
			var done: bool = QuestDatabase.is_completed(q, snap)
			var claimed: bool = gs.claimed_quests.has(qid)
			var rew: String = tr("ui_quest_reward_fmt") % [int(q["reward_gold"]), int(q["reward_exp"])]
			var desc_txt: String = "%s (%s)" % [tr(String(q["desc_key"])), rew]
			var btn_txt: String = tr("ui_claimed") if claimed else (tr("ui_claim") if done else "")
			_add_row(
				tr(String(q["name_key"])),
				desc_txt,
				btn_txt,
				claimed or not done,
				func() -> void: _on_claim_quest(qid)
			)
		var hdr: Label = Label.new()
		hdr.text = "— %s —" % tr("ui_ach_header")
		hdr.add_theme_font_size_override("font_size", 8)
		hdr.add_theme_color_override("font_color", Color(0.85, 0.92, 1.0))
		list_box.add_child(hdr)
		for ach: Dictionary in QuestDatabase.ACHIEVEMENTS:
			var done_a: bool = QuestDatabase.is_completed(ach, snap)
			var mark: String = "[OK] " if done_a else ""
			_add_row(mark + tr(String(ach["name_key"])), tr(String(ach["desc_key"])), "", true, Callable())
	elif _tab == "skills":
		for sk: Dictionary in SkillDatabase.SKILLS:
			var sid: StringName = sk["id"] as StringName
			var learned: bool = gs.learned_skills.has(sid)
			var is_act: bool = gs.active_skill_id == sid
			var uses: int = int(gs.skill_uses.get(String(sid), 0))
			var tier: int = gs.skill_tier(sid)
			var sub: String = "%s — %s" % [tr(String(sk["desc_key"])), tr("ui_tier_label") % [tier, uses]] if learned else ("%s (%s)" % [tr(String(sk["desc_key"])), tr(String(sk["where_key"]))])
			var btn_txt: String = tr("ui_locked") if not learned else (tr("ui_active_skill") if is_act else tr("ui_equip_skill"))
			_add_row(tr(String(sk["name_key"])), sub, btn_txt, (not learned) or is_act, func() -> void: _on_equip_skill(sid))
	else:
		for r: Dictionary in CraftLogic.RECIPES:
			var rid: StringName = r["id"] as StringName
			var can_make: bool = CraftLogic.can_craft(gs.inventory, r)
			var res_id: StringName = r["result_id"] as StringName
			var already_eq: bool = (ItemDatabase.has_weapon(res_id) and gs.owned_weapons.has(res_id)) or (ItemDatabase.has_armor(res_id) and gs.owned_armors.has(res_id))
			var parts: PackedStringArray = PackedStringArray()
			var need: Dictionary = r["ingredients"] as Dictionary
			for k: Variant in need.keys():
				var iid: StringName = StringName(str(k))
				parts.append("%s %d/%d" % [ItemDatabase.display_name(iid), InventoryLogic.count_item(gs.inventory, iid), int(need[k])])
			_add_row(
				tr(String(r["name_key"])),
				", ".join(parts),
				tr("ui_craft_btn") if not already_eq else tr("ui_equipped"),
				already_eq or not can_make,
				func() -> void: _on_craft(rid)
			)


func _add_row(title: String, desc: String, action_text: String, disabled: bool, on_press: Callable) -> void:
	var row: HBoxContainer = HBoxContainer.new()
	var col: VBoxContainer = VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	var lbl_t: Label = Label.new()
	lbl_t.text = title
	lbl_t.add_theme_font_size_override("font_size", 8)
	lbl_t.add_theme_color_override("font_color", Color(1.0, 0.92, 0.65))
	col.add_child(lbl_t)

	var lbl_d: Label = Label.new()
	lbl_d.text = desc
	lbl_d.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl_d.add_theme_font_size_override("font_size", 7)
	lbl_d.add_theme_color_override("font_color", Color(0.84, 0.82, 0.78))
	col.add_child(lbl_d)
	row.add_child(col)

	if not action_text.is_empty():
		var btn: Button = Button.new()
		btn.text = action_text
		btn.disabled = disabled
		btn.custom_minimum_size = Vector2(58, 18)
		btn.add_theme_font_size_override("font_size", 7)
		if on_press.is_valid():
			btn.pressed.connect(on_press)
		row.add_child(btn)
	list_box.add_child(row)


func _on_claim_quest(id: StringName) -> void:
	if GameStateStore.ref.claim_quest(id):
		AudioService.ref.play_sfx_id(&"level_up")
		var q: Dictionary = QuestDatabase.get_quest(id)
		var rew: String = tr("ui_quest_reward_fmt") % [int(q["reward_gold"]), int(q["reward_exp"])]
		EventsBus.ref.notification_requested.emit(tr("msg_quest_claimed") % rew)
		_rebuild()


func _on_equip_skill(id: StringName) -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	GameStateStore.ref.set_active_skill(id)
	_rebuild()


func _on_craft(id: StringName) -> void:
	if GameStateStore.ref.craft_recipe(id):
		AudioService.ref.play_sfx_id(&"chest")
		var rec: Dictionary = CraftLogic.get_recipe(id)
		EventsBus.ref.notification_requested.emit(tr("msg_crafted") % ItemDatabase.display_name(rec["result_id"] as StringName))
		_rebuild()
	else:
		AudioService.ref.play_ui_id(&"ui_click")
		EventsBus.ref.notification_requested.emit(tr("msg_craft_fail"))
