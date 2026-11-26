class_name ChestProp
extends StaticBody2D

@export var chest_id: StringName = &"chest_01"
@export var reward_item_id: StringName = &"potion"
@export var reward_qty: int = 1
@export var reward_gold: int = 0

@onready var sprite: Sprite2D = $Sprite2D
@onready var interactable: Interactable = $Interactable


func _ready() -> void:
	interactable.prompt_key = "prompt_chest"
	interactable.interacted.connect(_on_interacted)
	_refresh_visual()


func _refresh_visual() -> void:
	var opened: bool = bool(GameStateStore.ref.get_flag(chest_id, false))
	sprite.modulate = Color(0.55, 0.52, 0.48, 0.85) if opened else Color.WHITE


func _on_interacted(_by: Node) -> void:
	var gs: GameStateStore = GameStateStore.ref
	if bool(gs.get_flag(chest_id, false)):
		EventsBus.ref.notification_requested.emit(tr("msg_chest_empty"))
		return
	gs.set_flag(chest_id, true)
	_refresh_visual()
	AudioService.ref.play_sfx_id(&"chest")

	var parts: PackedStringArray = PackedStringArray()
	if not String(reward_item_id).is_empty() and reward_qty > 0:
		gs.add_item(reward_item_id, reward_qty)
		var label: String = ItemDatabase.display_name(reward_item_id)
		if reward_qty > 1:
			label = "%s x%d" % [label, reward_qty]
		parts.append(label)
	if reward_gold > 0:
		gs.grant_rewards(0, reward_gold)
		parts.append("%d %s" % [reward_gold, tr("ui_gold")])
	var summary: String = ", ".join(parts)
	EventsBus.ref.notification_requested.emit(tr("msg_chest_open") % summary)
	DamageNumber.spawn(get_parent(), global_position, "+%s" % summary, Color(1.0, 0.88, 0.35))
