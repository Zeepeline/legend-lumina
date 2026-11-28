class_name ShopMenu
extends Control

@onready var title_label: Label = $Center/Panel/Margin/VBox/Header/TitleLabel
@onready var close_btn: Button = $Center/Panel/Margin/VBox/Header/CloseBtn
@onready var gold_label: Label = $Center/Panel/Margin/VBox/GoldLabel
@onready var tab_buy: Button = $Center/Panel/Margin/VBox/Tabs/BuyTab
@onready var tab_sell: Button = $Center/Panel/Margin/VBox/Tabs/SellTab
@onready var list_box: VBoxContainer = $Center/Panel/Margin/VBox/Scroll/ListBox

var _shop_items: Array[StringName] = []
var _mode: String = "buy"


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	close_btn.text = tr("ui_close")
	tab_buy.text = tr("ui_shop_buy")
	tab_sell.text = tr("ui_shop_sell")
	close_btn.pressed.connect(_close)
	tab_buy.pressed.connect(func() -> void: _switch_mode("buy"))
	tab_sell.pressed.connect(func() -> void: _switch_mode("sell"))
	EventsBus.ref.shop_requested.connect(_on_shop_requested)


func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed(&"pause"):
		get_viewport().set_input_as_handled()
		_close()


func _on_shop_requested(_shop_id: StringName, title_key: String, item_ids: Array[StringName]) -> void:
	title_label.text = tr(title_key)
	_shop_items = item_ids
	_mode = "buy"
	visible = true
	get_tree().paused = true
	AudioService.ref.play_ui_id(&"ui_click")
	_rebuild()
	tab_buy.grab_focus()


func _close() -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	visible = false
	get_tree().paused = false


func _switch_mode(m: String) -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	_mode = m
	_rebuild()


func _style_tabs() -> void:
	tab_buy.theme_type_variation = &"TabOn" if _mode == "buy" else &"TabOff"
	tab_sell.theme_type_variation = &"TabOn" if _mode == "sell" else &"TabOff"


func _rebuild() -> void:
	_style_tabs()
	var gs: GameStateStore = GameStateStore.ref
	gold_label.text = "%s: %d G" % [tr("ui_gold"), gs.gold]
	for ch: Node in list_box.get_children():
		ch.queue_free()

	if _mode == "buy":
		for id: StringName in _shop_items:
			var price: int = ItemDatabase.buy_price(id)
			var owned_gear: bool = (
				(ItemDatabase.has_weapon(id) and gs.owned_weapons.has(id))
				or (ItemDatabase.has_armor(id) and gs.owned_armors.has(id))
			)
			var btn_txt: String = tr("ui_equipped") if owned_gear else ("%s (%d G)" % [tr("ui_shop_buy"), price])
			_add_row(id, ItemDatabase.display_name(id), btn_txt, owned_gear or gs.gold < price, func() -> void: _on_buy(id))
	else:
		for k: Variant in gs.inventory.keys():
			var qty: int = int(gs.inventory[k])
			if qty <= 0:
				continue
			var id: StringName = StringName(str(k))
			var sp: int = ItemDatabase.sell_price(id)
			if sp <= 0:
				continue
			_add_row(id, "%s x%d" % [ItemDatabase.display_name(id), qty], "%s (+%d G)" % [tr("ui_shop_sell"), sp], false, func() -> void: _on_sell(id))


func _add_row(id: StringName, title: String, btn_text: String, disabled: bool, on_press: Callable) -> void:
	var row: HBoxContainer = HBoxContainer.new()
	row.add_theme_constant_override("separation", 5)
	var frame: PanelContainer = PanelContainer.new()
	frame.theme_type_variation = &"SlotPanel"
	frame.custom_minimum_size = Vector2(20, 20)
	var ic: TextureRect = TextureRect.new()
	ic.texture = InventoryMenu.icon_for(id)
	ic.stretch_mode = TextureRect.STRETCH_KEEP_CENTERED
	frame.add_child(ic)
	row.add_child(frame)
	var lbl: Label = Label.new()
	lbl.text = title
	lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(lbl)

	var btn: Button = Button.new()
	btn.text = btn_text
	btn.disabled = disabled
	btn.custom_minimum_size = Vector2(76, 20)
	btn.pressed.connect(on_press)
	row.add_child(btn)
	list_box.add_child(row)


func _on_buy(id: StringName) -> void:
	var price: int = ItemDatabase.buy_price(id)
	if GameStateStore.ref.buy_entry(id):
		AudioService.ref.play_sfx_id(&"coin")
		EventsBus.ref.notification_requested.emit(tr("msg_bought") % [ItemDatabase.display_name(id), price])
	else:
		EventsBus.ref.notification_requested.emit(tr("msg_no_gold"))
	_rebuild()


func _on_sell(id: StringName) -> void:
	var sp: int = ItemDatabase.sell_price(id)
	if GameStateStore.ref.sell_entry(id):
		AudioService.ref.play_sfx_id(&"coin")
		EventsBus.ref.notification_requested.emit(tr("msg_sold") % [ItemDatabase.display_name(id), sp])
	_rebuild()
