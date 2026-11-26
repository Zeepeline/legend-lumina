class_name FishingSpot
extends Area2D

@export var prompt_key: String = "prompt_fish"

@onready var ripple: Polygon2D = $Ripple

var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	_rng.randomize()
	var tw: Tween = create_tween().set_loops()
	tw.tween_property(ripple, "scale", Vector2(1.25, 1.25), 0.9)
	tw.tween_property(ripple, "scale", Vector2(0.85, 0.85), 0.9)


func interact(_by: Node) -> void:
	var gs: GameStateStore = GameStateStore.ref
	gs.add_item(&"fish", 1)
	gs.record_fish()
	AudioService.ref.play_sfx_id(&"chest")
	EventsBus.ref.notification_requested.emit(tr("msg_fish_caught"))
	DamageNumber.spawn(get_parent(), global_position + Vector2(0.0, -8.0), "+1 %s" % tr("item_fish_name"), Color(0.55, 0.88, 1.0))
