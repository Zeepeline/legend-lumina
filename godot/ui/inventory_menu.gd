class_name InventoryMenu
extends Control
## Menu Tas & Perlengkapan bergaya kayu & perkamen: pita tab (Barang/Senjata/Zirah), kolom kiri berisi figur pemain,
## senjata & zirah terpasang serta statistik, kisi slot 9×4 berikon piksel, dan kotak keterangan dengan tombol aksi.

const GRID_SLOTS: int = 36
const SLOT_SIZE: Vector2 = Vector2(27, 27)
const SLOT_TEX: Texture2D = preload("res://assets/art/ui/slot.png")
const SLOT_SEL_TEX: Texture2D = preload("res://assets/art/ui/slot_sel.png")

@onready var title_label: Label = $Center/Root/TitlePlate/TitleLabel
@onready var close_btn: TextureButton = $Center/Root/CloseBtn
@onready var tab_items: Button = $Center/Root/Tabs/ItemsTab
@onready var tab_weapons: Button = $Center/Root/Tabs/WeaponsTab
@onready var tab_armors: Button = $Center/Root/Tabs/ArmorsTab
@onready var level_label: Label = $Center/Root/Panel/HBox/Left/VBox/LevelLabel
@onready var weapon_icon: TextureRect = $Center/Root/Panel/HBox/Left/VBox/WeaponRow/WeaponIconFrame/WeaponIcon
@onready var weapon_cat: Label = $Center/Root/Panel/HBox/Left/VBox/WeaponRow/WeaponText/WeaponCat
@onready var weapon_name: Label = $Center/Root/Panel/HBox/Left/VBox/WeaponRow/WeaponText/WeaponName
@onready var armor_icon: TextureRect = $Center/Root/Panel/HBox/Left/VBox/ArmorRow/ArmorIconFrame/ArmorIcon
@onready var armor_cat: Label = $Center/Root/Panel/HBox/Left/VBox/ArmorRow/ArmorText/ArmorCat
@onready var armor_name: Label = $Center/Root/Panel/HBox/Left/VBox/ArmorRow/ArmorText/ArmorName
@onready var stats_grid: GridContainer = $Center/Root/Panel/HBox/Left/VBox/StatsGrid
@onready var grid: GridContainer = $Center/Root/Panel/HBox/Right/Grid
@onready var detail_icon: TextureRect = $Center/Root/Panel/HBox/Right/Detail/VBox/Top/IconFrame/Icon
@onready var detail_name: Label = $Center/Root/Panel/HBox/Right/Detail/VBox/Top/Names/NameLabel
@onready var detail_qty: Label = $Center/Root/Panel/HBox/Right/Detail/VBox/Top/Names/QtyLabel
@onready var action_btn: Button = $Center/Root/Panel/HBox/Right/Detail/VBox/Top/ActionBtn
@onready var detail_desc: Label = $Center/Root/Panel/HBox/Right/Detail/VBox/DescLabel

var _tab: String = "items"
var _entries: Array[Dictionary] = []
var _selected: int = 0
var _sb: StyleBoxTexture = null
var _sb_sel: StyleBoxTexture = null


static func icon_for(id: StringName) -> Texture2D:
	var kind: String = ItemDatabase.entry_kind(id)
	var prefix: String = "wpn_" if kind == "weapon" else ("arm_" if kind == "armor" else "item_")
	var path: String = "res://assets/art/ui/ic_%s%s.png" % [prefix, String(id)]
	if ResourceLoader.exists(path):
		return ResourceLoader.load(path) as Texture2D
	return null


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	_sb = _make_sb(SLOT_TEX)
	_sb_sel = _make_sb(SLOT_SEL_TEX)
	title_label.text = tr("ui_bag_title")
	tab_items.text = tr("ui_tab_items")
	tab_weapons.text = tr("ui_tab_weapons")
	tab_armors.text = tr("ui_tab_armors")
	weapon_cat.text = tr("ui_tab_weapons")
	armor_cat.text = tr("ui_tab_armors")
	close_btn.tooltip_text = tr("ui_close")
	close_btn.pressed.connect(_close)
	tab_items.pressed.connect(func() -> void: _switch_tab("items"))
	tab_weapons.pressed.connect(func() -> void: _switch_tab("weapons"))
	tab_armors.pressed.connect(func() -> void: _switch_tab("armors"))
	action_btn.pressed.connect(_on_action)
	for i: int in GRID_SLOTS:
		var b: Button = Button.new()
		b.custom_minimum_size = SLOT_SIZE
		b.focus_mode = Control.FOCUS_NONE
		b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.expand_icon = false
		for st: String in ["normal", "hover", "pressed", "hover_pressed", "disabled", "focus"]:
			b.add_theme_stylebox_override(st, _sb)
		b.add_theme_color_override("font_color", Color(0.329, 0.098, 0.125, 1.0))
		var idx: int = i
		b.pressed.connect(func() -> void: _select(idx))
		var qty: Label = Label.new()
		qty.name = "Qty"
		qty.set_anchors_preset(Control.PRESET_FULL_RECT)
		qty.offset_right = -3.0
		qty.offset_bottom = 0.0
		qty.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		qty.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
		qty.mouse_filter = Control.MOUSE_FILTER_IGNORE
		b.add_child(qty)
		grid.add_child(b)
	EventsBus.ref.inventory_changed.connect(_rebuild_if_open)


func _make_sb(tex: Texture2D) -> StyleBoxTexture:
	var sb: StyleBoxTexture = StyleBoxTexture.new()
	sb.texture = tex
	sb.texture_margin_left = 3.0
	sb.texture_margin_top = 3.0
	sb.texture_margin_right = 3.0
	sb.texture_margin_bottom = 3.0
	return sb


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
	_selected = 0
	_rebuild()


func _close() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	visible = false
	get_tree().paused = false


func _switch_tab(t: String) -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	_tab = t
	_selected = 0
	_rebuild()


func _rebuild_if_open() -> void:
	if visible:
		_rebuild()


func _rebuild() -> void:
	var gs: GameStateStore = GameStateStore.ref
	tab_items.theme_type_variation = &"TabOn" if _tab == "items" else &"TabOff"
	tab_weapons.theme_type_variation = &"TabOn" if _tab == "weapons" else &"TabOff"
	tab_armors.theme_type_variation = &"TabOn" if _tab == "armors" else &"TabOff"
	level_label.text = "%s %d" % [tr("ui_level"), gs.level]
	var w: WeaponData = ItemDatabase.get_weapon(gs.equipped_weapon_id)
	var a: ArmorData = ItemDatabase.get_armor(gs.equipped_armor_id)
	weapon_name.text = tr(w.name_key) if w != null else "-"
	weapon_icon.texture = icon_for(gs.equipped_weapon_id)
	armor_name.text = tr(a.name_key) if a != null else "-"
	armor_icon.texture = icon_for(gs.equipped_armor_id)
	_fill_stats(gs)

	_entries.clear()
	if _tab == "items":
		for k: Variant in gs.inventory.keys():
			var qty: int = int(gs.inventory[k])
			var id: StringName = StringName(str(k))
			var it: ItemData = ItemDatabase.get_item(id)
			if qty <= 0 or it == null:
				continue
			_entries.append({"id": id, "qty": qty, "name": tr(it.name_key), "desc": tr(it.description_key),
				"action": tr("ui_use") if it.category == "consumable" else "", "done": false})
	elif _tab == "weapons":
		for w_id: StringName in gs.owned_weapons:
			var wd: WeaponData = ItemDatabase.get_weapon(w_id)
			var is_eq: bool = gs.equipped_weapon_id == wd.id
			_entries.append({"id": wd.id, "qty": 0, "name": tr(wd.name_key), "desc": tr(wd.description_key),
				"action": tr("ui_equipped") if is_eq else tr("ui_equip"), "done": is_eq})
	else:
		for a_id: StringName in gs.owned_armors:
			var ad: ArmorData = ItemDatabase.get_armor(a_id)
			var is_eq: bool = gs.equipped_armor_id == ad.id
			_entries.append({"id": ad.id, "qty": 0, "name": tr(ad.name_key), "desc": tr(ad.description_key),
				"action": tr("ui_equipped") if is_eq else tr("ui_equip"), "done": is_eq})
	_selected = clampi(_selected, 0, maxi(0, _entries.size() - 1))
	for i: int in GRID_SLOTS:
		var b: Button = grid.get_child(i) as Button
		var qty_lbl: Label = b.get_node("Qty") as Label
		if i < _entries.size():
			var e: Dictionary = _entries[i]
			b.icon = icon_for(e["id"])
			qty_lbl.text = str(e["qty"]) if int(e["qty"]) > 1 else ("E" if bool(e["done"]) else "")
			b.disabled = false
		else:
			b.icon = null
			qty_lbl.text = ""
			b.disabled = true
		var sb: StyleBoxTexture = _sb_sel if (i == _selected and i < _entries.size()) else _sb
		for st: String in ["normal", "hover", "pressed", "hover_pressed", "disabled"]:
			b.add_theme_stylebox_override(st, sb)
	_show_detail()


func _fill_stats(gs: GameStateStore) -> void:
	for ch: Node in stats_grid.get_children():
		ch.queue_free()
	var rows: Array = [
		[tr("ui_atk"), str(gs.total_attack()), Color(0.639, 0.161, 0.11)],
		[tr("ui_def"), str(gs.total_defense()), Color(0.263, 0.333, 0.427)],
		[tr("ui_mag"), str(gs.total_magic()), Color(0.243, 0.471, 0.745)],
		[tr("ui_hp"), "%d/%d" % [gs.hp, gs.total_max_hp()], Color(0.639, 0.161, 0.11)],
		[tr("ui_gold"), str(gs.gold), Color(0.75, 0.55, 0.16)],
	]
	for r: Array in rows:
		var k: Label = Label.new()
		k.text = String(r[0])
		k.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		k.add_theme_color_override("font_color", r[2] as Color)
		stats_grid.add_child(k)
		var v: Label = Label.new()
		v.text = String(r[1])
		v.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		stats_grid.add_child(v)


func _show_detail() -> void:
	if _entries.is_empty():
		detail_icon.texture = null
		detail_name.text = ""
		detail_qty.text = ""
		detail_desc.text = tr("ui_inventory_empty") if tr("ui_inventory_empty") != "ui_inventory_empty" else "-"
		action_btn.visible = false
		return
	var e: Dictionary = _entries[_selected]
	detail_icon.texture = icon_for(e["id"])
	detail_name.text = String(e["name"])
	detail_qty.text = "x%d" % int(e["qty"]) if int(e["qty"]) > 0 else ""
	detail_desc.text = String(e["desc"])
	action_btn.visible = not String(e["action"]).is_empty()
	action_btn.text = String(e["action"])
	action_btn.disabled = bool(e["done"])


func _select(idx: int) -> void:
	if idx >= _entries.size():
		return
	AudioService.ref.play_ui_id(&"ui_click")
	_selected = idx
	_rebuild()


func _on_action() -> void:
	if _entries.is_empty():
		return
	var id: StringName = _entries[_selected]["id"]
	if _tab == "items":
		_on_use_item(id)
	elif _tab == "weapons":
		_on_equip_weapon(id)
	else:
		_on_equip_armor(id)


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
