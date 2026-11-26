class_name InventoryMenu
extends Control

@onready var title_label: Label = $Center/Panel/Margin/VBox/Header/TitleLabel
@onready var close_btn: Button = $Center/Panel/Margin/VBox/Header/CloseBtn
@onready var stats_label: Label = $Center/Panel/Margin/VBox/StatsLabel
@onready var tab_items: Button = $Center/Panel/Margin/VBox/Tabs/ItemsTab
@onready var tab_weapons: Button = $Center/Panel/Margin/VBox/Tabs/WeaponsTab
@onready var tab_armors: Button = $Center/Panel/Margin/VBox/Tabs/ArmorsTab
@onready var list_box: VBoxContainer = $Center/Panel/Margin/VBox/Scroll/ListBox

var _tab: String = "items"


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	title_label.text = tr("ui_bag_title")
	close_btn.text = tr("ui_close")
	tab_items.text = tr("ui_tab_items")
	tab_weapons.text = tr("ui_tab_weapons")
	tab_armors.text = tr("ui_tab_armors")
	close_btn.pressed.connect(_close)
	tab_items.pressed.connect(func() -> void: _switch_tab("items"))
	tab_weapons.pressed.connect(func() -> void: _switch_tab("weapons"))
	tab_armors.pressed.connect(func() -> void: _switch_tab("armors"))
	EventsBus.ref.inventory_changed.connect(_rebuild_if_open)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed(&"inventory") and not SceneService.ref.is_busy():
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
	tab_items.grab_focus()


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
	var gs: GameStateStore = GameStateStore.ref
	stats_label.text = "%s: %d  |  %s: %d  |  %s: %d  |  %s: %d/%d  |  %s: %d" % [
		tr("ui_atk"), gs.total_attack(),
		tr("ui_def"), gs.total_defense(),
		tr("ui_mag"), gs.total_magic(),
		tr("ui_hp"), gs.hp, gs.total_max_hp(),
		tr("ui_gold"), gs.gold,
	]
	for ch: Node in list_box.get_children():
		ch.queue_free()

	if _tab == "items":
		for k: Variant in gs.inventory.keys():
			var qty: int = int(gs.inventory[k])
			if qty <= 0:
				continue
			var id: StringName = StringName(str(k))
			var it: ItemData = ItemDatabase.get_item(id)
			if it == null:
				continue
			var btn_text: String = tr("ui_use") if it.category == "consumable" else ""
			_add_row(
				"%s x%d" % [tr(it.name_key), qty],
				tr(it.description_key),
				btn_text,
				false,
				func() -> void: _on_use_item(id)
			)
	elif _tab == "weapons":
		for w_id: StringName in gs.owned_weapons:
			var w: WeaponData = ItemDatabase.get_weapon(w_id)
			var is_eq: bool = gs.equipped_weapon_id == w.id
			_add_row(
				tr(w.name_key),
				tr(w.description_key),
				tr("ui_equipped") if is_eq else tr("ui_equip"),
				is_eq,
				func() -> void: _on_equip_weapon(w.id)
			)
	else:
		for a_id: StringName in gs.owned_armors:
			var a: ArmorData = ItemDatabase.get_armor(a_id)
			var is_eq: bool = gs.equipped_armor_id == a.id
			_add_row(
				tr(a.name_key),
				tr(a.description_key),
				tr("ui_equipped") if is_eq else tr("ui_equip"),
				is_eq,
				func() -> void: _on_equip_armor(a.id)
			)


func _add_row(title: String, desc: String, action_text: String, disabled: bool, on_press: Callable) -> void:
	var row: HBoxContainer = HBoxContainer.new()
	var text_col: VBoxContainer = VBoxContainer.new()
	text_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	var lbl_t: Label = Label.new()
	lbl_t.text = title
	lbl_t.add_theme_font_size_override("font_size", 8)
	lbl_t.add_theme_color_override("font_color", Color(1.0, 0.92, 0.65))
	text_col.add_child(lbl_t)

	var lbl_d: Label = Label.new()
	lbl_d.text = desc
	lbl_d.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl_d.add_theme_font_size_override("font_size", 7)
	lbl_d.add_theme_color_override("font_color", Color(0.84, 0.82, 0.78))
	text_col.add_child(lbl_d)
	row.add_child(text_col)

	if not action_text.is_empty():
		var btn: Button = Button.new()
		btn.text = action_text
		btn.disabled = disabled
		btn.custom_minimum_size = Vector2(54, 20)
		btn.add_theme_font_size_override("font_size", 7)
		btn.pressed.connect(on_press)
		row.add_child(btn)

	list_box.add_child(row)


func _on_use_item(id: StringName) -> void:
	if GameStateStore.ref.use_item(id):
		AudioService.ref.play_sfx_id(&"heal")
		EventsBus.ref.notification_requested.emit(tr("msg_item_used") % ItemDatabase.display_name(id))
	_rebuild()


func _on_equip_weapon(id: StringName) -> void:
	if GameStateStore.ref.equip_weapon(id):
		AudioService.ref.play_ui_id(&"ui_click")
		EventsBus.ref.notification_requested.emit(tr("msg_equipped") % ItemDatabase.display_name(id))
	_rebuild()


func _on_equip_armor(id: StringName) -> void:
	if GameStateStore.ref.equip_armor(id):
		AudioService.ref.play_ui_id(&"ui_click")
		EventsBus.ref.notification_requested.emit(tr("msg_equipped") % ItemDatabase.display_name(id))
	_rebuild()
