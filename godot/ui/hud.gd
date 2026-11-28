class_name HudOverlay
extends Control
## HUD utama bergaya web Legenda Lumina dalam kualitas HD (bilah gradasi, ikon vektor tajam, kartu misi kayu, bilah jurus berlian).

const PEACE_FADE_DELAY: float = 5.0

@onready var stats_panel: PanelContainer = $StatsPanel
@onready var hp_bar: HudGradientBar = $StatsPanel/VBox/HpBar
@onready var hp_label: Label = $StatsPanel/VBox/HpBar/HpLabel
@onready var sta_bar: HudGradientBar = $StatsPanel/VBox/StaBar
@onready var mp_bar: HudGradientBar = $StatsPanel/VBox/MpBar
@onready var mp_label: Label = $StatsPanel/VBox/MpBar/MpLabel
@onready var level_label: Label = $StatsPanel/VBox/ExpRow/LevelLabel
@onready var exp_bar: HudGradientBar = $StatsPanel/VBox/ExpRow/ExpBar

@onready var time_icon: HudVectorIcon = $TopRightCapsule/HBox/TimeGroup/TimeIcon
@onready var time_label: Label = $TopRightCapsule/HBox/TimeGroup/TimeLabel
@onready var compass_icon: HudVectorIcon = $TopRightCapsule/HBox/CompassIcon
@onready var compass_label: Label = $TopRightCapsule/HBox/CompassLabel
@onready var gold_label: Label = $TopRightCapsule/HBox/GoldLabel
@onready var flask_label: Label = $TopRightCapsule/HBox/FlaskLabel
@onready var potion_count_label: Label = $TopRightCapsule/HBox/PotionCountLabel

@onready var journal_button: Button = $QuickBar/JournalButton
@onready var bag_button: Button = $QuickBar/BagButton
@onready var map_button: Button = $QuickBar/MapButton
@onready var menu_button: Button = $QuickBar/MenuButton
@onready var dev_button: Button = $QuickBar/DevButton

@onready var quest_card: PanelContainer = $QuestCard
@onready var quest_title_label: Label = $QuestCard/VBox/Header/QuestTitleLabel
@onready var quest_toggle_btn: Button = $QuestCard/VBox/Header/QuestToggleBtn
@onready var quest_divider: ColorRect = $QuestCard/VBox/QuestDivider
@onready var quest_desc_label: Label = $QuestCard/VBox/QuestDescLabel

@onready var region_banner: PanelContainer = $RegionBanner
@onready var region_title_label: Label = $RegionBanner/VBox/RegionTitleLabel
@onready var region_subtitle_label: Label = $RegionBanner/VBox/RegionSubtitleLabel

@onready var boss_panel: PanelContainer = $BossPanel
@onready var boss_name_label: Label = $BossPanel/VBox/BossNameLabel
@onready var boss_hp_bar: HudGradientBar = $BossPanel/VBox/BossHpBar

@onready var prompt_panel: PanelContainer = $PromptPanel
@onready var prompt_label: Label = $PromptPanel/PromptLabel
@onready var toast_panel: PanelContainer = $ToastPanel
@onready var toast_label: Label = $ToastPanel/ToastLabel

var _hp_target_ratio: float = 1.0
var _trail_ratio: float = 1.0
var _boss_target_ratio: float = 1.0
var _boss_trail_ratio: float = 1.0
var _boss_active: bool = false
var _peace_timer: float = 0.0
var _stats_faded: bool = false
var _quest_collapsed: bool = false
var _last_banner_id: String = ""
var _last_compass_dir: String = ""
var _toast_tween: Tween = null
var _banner_tween: Tween = null
var _stats_tween: Tween = null


func _ready() -> void:
	prompt_panel.visible = false
	toast_panel.visible = false
	boss_panel.visible = false
	region_banner.visible = false

	journal_button.text = tr("ui_journal")
	bag_button.text = tr("ui_bag")
	map_button.text = tr("ui_map")
	menu_button.text = tr("ui_menu")
	quest_title_label.text = tr("ui_quest_card_title").to_upper()

	if EventsBus.ref != null:
		EventsBus.ref.player_stats_changed.connect(_refresh_stats)
		EventsBus.ref.inventory_changed.connect(_refresh_stats)
		EventsBus.ref.skill_changed.connect(func(_s: StringName) -> void: _refresh_stats())
		EventsBus.ref.quest_updated.connect(_refresh_quest_card)
		EventsBus.ref.interact_prompt_changed.connect(_on_interact_prompt)
		EventsBus.ref.map_changed.connect(_on_map_changed)
		EventsBus.ref.notification_requested.connect(_show_toast)
		EventsBus.ref.time_of_day_changed.connect(_on_time_changed)
		EventsBus.ref.boss_hp_changed.connect(_on_boss_hp_changed)

	journal_button.pressed.connect(func() -> void: _tap_action(&"journal"))
	bag_button.pressed.connect(func() -> void: _tap_action(&"inventory"))
	map_button.pressed.connect(func() -> void: _tap_action(&"world_map"))
	menu_button.pressed.connect(func() -> void: _tap_action(&"pause"))
	dev_button.pressed.connect(_on_dev_pressed)
	quest_toggle_btn.pressed.connect(_toggle_quest_card)
	stats_panel.mouse_entered.connect(_wake_stats_panel)

	_refresh_stats()
	_refresh_quest_card()
	if GameStateStore.ref != null:
		_on_time_changed(GameStateStore.ref.world_hour)


func _process(delta: float) -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs != null:
		var cap_hp: int = gs.total_max_hp()
		_hp_target_ratio = clampf(float(gs.hp) / float(maxi(1, cap_hp)), 0.0, 1.0)
		if _trail_ratio > _hp_target_ratio:
			_trail_ratio = maxf(_hp_target_ratio, _trail_ratio - delta * 0.45)
		else:
			_trail_ratio = _hp_target_ratio
		hp_bar.set_ratios(_hp_target_ratio, _trail_ratio)

		var is_peaceful: bool = (
			gs.hp >= cap_hp
			and gs.mp >= gs.max_mp
			and gs.stamina >= gs.max_stamina - 0.5
			and not _boss_active
		)
		if is_peaceful:
			_peace_timer += delta
			if _peace_timer >= PEACE_FADE_DELAY and not _stats_faded:
				_set_stats_faded(true)
		else:
			_wake_stats_panel()

	if _boss_active:
		if _boss_trail_ratio > _boss_target_ratio:
			_boss_trail_ratio = maxf(_boss_target_ratio, _boss_trail_ratio - delta * 0.38)
		else:
			_boss_trail_ratio = _boss_target_ratio
		boss_hp_bar.set_ratios(_boss_target_ratio, _boss_trail_ratio)

	_update_compass()


func _update_compass() -> void:
	if SceneService.ref == null:
		return
	var player: Node2D = SceneService.ref.get_current_player()
	if player == null or not is_instance_valid(player):
		return
	var f_var: Variant = player.get("facing")
	if not (f_var is Vector2):
		return
	var f: Vector2 = f_var as Vector2
	if f.length_squared() < 0.01:
		return
	compass_icon.needle_angle = f.angle()
	var sector: int = posmod(roundi(f.angle() / (PI / 4.0)), 8)
	var dirs: Array[String] = ["T", "TG", "S", "BD", "B", "BL", "U", "TL"]
	var d_text: String = dirs[sector]
	if d_text != _last_compass_dir:
		_last_compass_dir = d_text
		compass_label.text = d_text


func _wake_stats_panel() -> void:
	_peace_timer = 0.0
	if _stats_faded:
		_set_stats_faded(false)


func _set_stats_faded(faded: bool) -> void:
	_stats_faded = faded
	if not is_inside_tree():
		stats_panel.modulate.a = 0.35 if faded else 1.0
		return
	if _stats_tween != null and _stats_tween.is_valid():
		_stats_tween.kill()
	_stats_tween = create_tween()
	_stats_tween.tween_property(stats_panel, "modulate:a", 0.35 if faded else 1.0, 0.35)


func _refresh_stats() -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	_wake_stats_panel()

	var cap_hp: int = gs.total_max_hp()
	_hp_target_ratio = clampf(float(gs.hp) / float(maxi(1, cap_hp)), 0.0, 1.0)
	if _trail_ratio < _hp_target_ratio:
		_trail_ratio = _hp_target_ratio
	hp_bar.set_ratios(_hp_target_ratio, _trail_ratio)
	hp_label.text = "%d/%d" % [gs.hp, cap_hp]

	var sta_ratio: float = clampf(gs.stamina / maxf(1.0, gs.max_stamina), 0.0, 1.0)
	sta_bar.set_ratios(sta_ratio)

	var mp_ratio: float = clampf(float(gs.mp) / float(maxi(1, gs.max_mp)), 0.0, 1.0)
	mp_bar.set_ratios(mp_ratio)
	mp_label.text = "%d/%d" % [gs.mp, gs.max_mp]

	level_label.text = "LV %d" % gs.level
	var needed_exp: int = maxi(1, CombatMath.exp_to_next_level(gs.level))
	var exp_ratio: float = clampf(float(gs.exp) / float(needed_exp), 0.0, 1.0)
	exp_bar.set_ratios(exp_ratio)

	gold_label.text = "%d" % gs.gold
	var dots: String = ""
	for i: int in gs.flask_max:
		dots += "●" if i < gs.flask_charges else "○"
	flask_label.text = dots
	var pot_count: int = (
		InventoryLogic.count_item(gs.inventory, &"potion")
		+ InventoryLogic.count_item(gs.inventory, &"hi_potion")
	)
	potion_count_label.visible = pot_count > 0
	potion_count_label.text = "+%d" % pot_count
	_refresh_quest_card()


func _refresh_quest_card() -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	var snap: Dictionary = gs.quest_snapshot()
	var claimable_entry: Dictionary = {}
	var active_entry: Dictionary = {}
	for q: Dictionary in QuestDatabase.QUESTS:
		var qid: StringName = q["id"]
		if gs.claimed_quests.has(qid):
			continue
		if QuestDatabase.is_completed(q, snap):
			if claimable_entry.is_empty():
				claimable_entry = q
		elif active_entry.is_empty():
			active_entry = q

	var chosen: Dictionary = claimable_entry if not claimable_entry.is_empty() else active_entry
	if chosen.is_empty():
		quest_title_label.text = tr("ui_quest_card_title").to_upper()
		quest_desc_label.text = tr("ui_quest_none")
		return

	var q_name: String = tr(String(chosen["name_key"]))
	if not claimable_entry.is_empty():
		quest_title_label.text = "%s · %s" % [tr("ui_quest_card_title").to_upper(), tr("ui_quest_ready")]
		quest_desc_label.text = q_name
	else:
		quest_title_label.text = tr("ui_quest_card_title").to_upper()
		quest_desc_label.text = "%s: %s" % [q_name, tr(String(chosen["desc_key"]))]


func _toggle_quest_card() -> void:
	_quest_collapsed = not _quest_collapsed
	quest_divider.visible = not _quest_collapsed
	quest_desc_label.visible = not _quest_collapsed
	quest_toggle_btn.text = "+" if _quest_collapsed else "−"
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")


func _on_time_changed(hour: float) -> void:
	var hh: int = int(hour) % 24
	var mm: int = int((hour - float(int(hour))) * 60.0)
	var is_day: bool = hour >= 5.5 and hour < 18.5
	time_icon.icon_kind = "sun" if is_day else "moon"
	time_label.text = "%02d:%02d" % [hh, mm]


func _on_boss_hp_changed(boss_name: String, cur_hp: int, cap_hp: int, active: bool) -> void:
	_boss_active = active and cur_hp > 0
	boss_panel.visible = _boss_active
	if _boss_active:
		_wake_stats_panel()
		boss_name_label.text = boss_name
		_boss_target_ratio = clampf(float(cur_hp) / float(maxi(1, cap_hp)), 0.0, 1.0)
		if _boss_trail_ratio < _boss_target_ratio:
			_boss_trail_ratio = _boss_target_ratio
		boss_hp_bar.set_ratios(_boss_target_ratio, _boss_trail_ratio)
	else:
		_boss_target_ratio = 1.0
		_boss_trail_ratio = 1.0


func _on_interact_prompt(label_key: String, is_visible: bool) -> void:
	prompt_panel.visible = is_visible and not label_key.is_empty()
	if prompt_panel.visible:
		prompt_label.text = tr(label_key)


func _on_map_changed(map_path: String, _spawn_id: StringName) -> void:
	var base: String = map_path.get_file().get_basename()
	var rid: StringName = StringName(base)
	var reg: Dictionary = WorldLayout.get_region(rid)
	var title_text: String = ""
	var sub_text: String = ""
	if not reg.is_empty():
		title_text = str(reg.get("name", ""))
		sub_text = str(reg.get("subtitle", ""))
	else:
		var key: String = "map_%s" % base
		var translated: String = tr(key)
		title_text = translated if translated != key else base.capitalize()
		sub_text = "Gua Gelap" if base == "cave" else ("Gelanggang & Ruangan" if GameStateStore.ref != null and GameStateStore.ref.is_indoor else "Wilayah Khusus")
	if base != _last_banner_id:
		_last_banner_id = base
		_show_region_banner(title_text, sub_text)
	_refresh_quest_card()


func _show_region_banner(title_text: String, sub_text: String) -> void:
	region_title_label.text = title_text.to_upper()
	region_subtitle_label.text = sub_text.to_upper()
	region_banner.visible = true
	region_banner.modulate.a = 1.0
	if not is_inside_tree():
		return
	if _banner_tween != null and _banner_tween.is_valid():
		_banner_tween.kill()
	region_banner.modulate.a = 0.0
	_banner_tween = create_tween()
	_banner_tween.tween_property(region_banner, "modulate:a", 1.0, 0.28)
	_banner_tween.tween_interval(1.8)
	_banner_tween.tween_property(region_banner, "modulate:a", 0.0, 0.45)
	_banner_tween.tween_callback(func() -> void: region_banner.visible = false)


func _show_toast(msg: String) -> void:
	toast_label.text = msg
	toast_panel.visible = true
	toast_panel.modulate.a = 1.0
	if not is_inside_tree():
		return
	if _toast_tween != null and _toast_tween.is_valid():
		_toast_tween.kill()
	_toast_tween = create_tween()
	_toast_tween.tween_interval(2.0)
	_toast_tween.tween_property(toast_panel, "modulate:a", 0.0, 0.45)
	_toast_tween.tween_callback(func() -> void: toast_panel.visible = false)


func _on_dev_pressed() -> void:
	var dbg: DebugMenu = get_tree().root.find_child("DebugMenu", true, false) as DebugMenu
	if dbg != null:
		dbg.toggle_open()


func _tap_action(action_name: StringName) -> void:
	if AudioService.ref != null:
		AudioService.ref.play_ui_id(&"ui_click")
	Input.action_press(action_name)
	Input.action_release(action_name)
