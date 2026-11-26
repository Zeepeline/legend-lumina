class_name HudOverlay
extends Control

@onready var hp_fill: ColorRect = $StatsPanel/VBox/HpBar/HpFill
@onready var hp_trail: ColorRect = $StatsPanel/VBox/HpBar/HpTrail
@onready var hp_label: Label = $StatsPanel/VBox/HpBar/HpLabel
@onready var mp_fill: ColorRect = $StatsPanel/VBox/MpBar/MpFill
@onready var mp_label: Label = $StatsPanel/VBox/MpBar/MpLabel
@onready var sta_fill: ColorRect = $StatsPanel/VBox/StaBar/StaFill
@onready var sta_label: Label = $StatsPanel/VBox/StaBar/StaLabel
@onready var info_label: Label = $StatsPanel/VBox/InfoLabel
@onready var map_label: Label = $TopRightBox/MapLabel
@onready var time_label: Label = $TopRightBox/TimeLabel
@onready var journal_button: Button = $TopRightBox/JournalButton
@onready var bag_button: Button = $TopRightBox/BagButton
@onready var map_button: Button = $TopRightBox/MapButton
@onready var menu_button: Button = $TopRightBox/MenuButton
@onready var prompt_panel: PanelContainer = $PromptPanel
@onready var prompt_label: Label = $PromptPanel/PromptLabel
@onready var toast_panel: PanelContainer = $ToastPanel
@onready var toast_label: Label = $ToastPanel/ToastLabel
@onready var boss_panel: PanelContainer = $BossPanel
@onready var boss_name_label: Label = $BossPanel/VBox/BossNameLabel
@onready var boss_hp_fill: ColorRect = $BossPanel/VBox/BossHpBar/BossHpFill

var _trail_ratio: float = 1.0
var _toast_tween: Tween = null


func _ready() -> void:
	prompt_panel.visible = false
	toast_panel.visible = false
	boss_panel.visible = false
	journal_button.text = tr("ui_journal")
	bag_button.text = tr("ui_bag")
	map_button.text = tr("ui_map")
	menu_button.text = tr("ui_menu")
	EventsBus.ref.player_stats_changed.connect(_refresh_stats)
	EventsBus.ref.skill_changed.connect(func(_s: StringName) -> void: _refresh_stats())
	EventsBus.ref.interact_prompt_changed.connect(_on_interact_prompt)
	EventsBus.ref.map_changed.connect(_on_map_changed)
	EventsBus.ref.notification_requested.connect(_show_toast)
	EventsBus.ref.time_of_day_changed.connect(_on_time_changed)
	EventsBus.ref.boss_hp_changed.connect(_on_boss_hp_changed)
	journal_button.pressed.connect(func() -> void: _tap_action(&"journal"))
	bag_button.pressed.connect(func() -> void: _tap_action(&"inventory"))
	map_button.pressed.connect(func() -> void: _tap_action(&"world_map"))
	menu_button.pressed.connect(func() -> void: _tap_action(&"pause"))
	_refresh_stats()
	_on_time_changed(GameStateStore.ref.world_hour)


func _process(delta: float) -> void:
	var gs: GameStateStore = GameStateStore.ref
	var target: float = clampf(float(gs.hp) / float(maxi(1, gs.total_max_hp())), 0.0, 1.0)
	if _trail_ratio > target:
		_trail_ratio = maxf(target, _trail_ratio - delta * 0.45)
		hp_trail.size.x = 128.0 * _trail_ratio
	else:
		_trail_ratio = target
		hp_trail.size.x = 128.0 * _trail_ratio
		set_process(false)


func _refresh_stats() -> void:
	var gs: GameStateStore = GameStateStore.ref
	var cap_hp: int = gs.total_max_hp()
	var hp_ratio: float = clampf(float(gs.hp) / float(maxi(1, cap_hp)), 0.0, 1.0)
	hp_fill.size.x = 128.0 * hp_ratio
	if _trail_ratio > hp_ratio:
		set_process(true)
	else:
		_trail_ratio = hp_ratio
		hp_trail.size.x = 128.0 * _trail_ratio
	hp_label.text = "%s %d/%d" % [tr("ui_hp"), gs.hp, cap_hp]

	var mp_ratio: float = clampf(float(gs.mp) / float(maxi(1, gs.max_mp)), 0.0, 1.0)
	mp_fill.size.x = 128.0 * mp_ratio
	mp_label.text = "%s %d/%d" % [tr("ui_mp"), gs.mp, gs.max_mp]

	var sta_ratio: float = clampf(gs.stamina / maxf(1.0, gs.max_stamina), 0.0, 1.0)
	sta_fill.size.x = 128.0 * sta_ratio
	sta_label.text = "%s %d" % [tr("ui_stamina"), int(roundf(gs.stamina))]

	var sk: Dictionary = SkillDatabase.get_skill(gs.active_skill_id)
	var sk_name: String = tr(String(sk["name_key"])) if not sk.is_empty() else "-"
	info_label.text = "%s: %d/%d | %s %d | %s: %d | %s" % [
		tr("ui_flask"),
		gs.flask_charges,
		gs.flask_max,
		tr("ui_level"),
		gs.level,
		tr("ui_gold"),
		gs.gold,
		sk_name,
	]


func _on_time_changed(hour: float) -> void:
	var hh: int = int(hour) % 24
	var mm: int = int((hour - float(int(hour))) * 60.0)
	time_label.text = "%02d:%02d" % [hh, mm]


func _on_boss_hp_changed(boss_name: String, cur_hp: int, cap_hp: int, active: bool) -> void:
	boss_panel.visible = active and cur_hp > 0
	if boss_panel.visible:
		boss_name_label.text = boss_name
		var ratio: float = clampf(float(cur_hp) / float(maxi(1, cap_hp)), 0.0, 1.0)
		boss_hp_fill.size.x = 200.0 * ratio


func _on_interact_prompt(label_key: String, is_visible: bool) -> void:
	prompt_panel.visible = is_visible and not label_key.is_empty()
	if prompt_panel.visible:
		prompt_label.text = tr(label_key)


func _on_map_changed(map_path: String, _spawn_id: StringName) -> void:
	var base: String = map_path.get_file().get_basename()
	var key: String = "map_%s" % base
	var translated: String = tr(key)
	map_label.text = translated if translated != key else base.capitalize()


func _show_toast(msg: String) -> void:
	toast_label.text = msg
	toast_panel.visible = true
	toast_panel.modulate.a = 1.0
	if _toast_tween != null and _toast_tween.is_valid():
		_toast_tween.kill()
	_toast_tween = create_tween()
	_toast_tween.tween_interval(2.0)
	_toast_tween.tween_property(toast_panel, "modulate:a", 0.0, 0.45)
	_toast_tween.tween_callback(func() -> void: toast_panel.visible = false)


func _tap_action(action_name: StringName) -> void:
	AudioService.ref.play_ui_id(&"ui_click")
	Input.action_press(action_name)
	Input.action_release(action_name)
