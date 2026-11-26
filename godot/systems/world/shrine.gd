class_name ShrineProp
extends StaticBody2D

@export var dialogue: DialogueData

@onready var interactable: Interactable = $Interactable
@onready var crystal_glow: Polygon2D = $CrystalGlow


func _ready() -> void:
	interactable.prompt_key = "prompt_shrine"
	interactable.interacted.connect(_on_interacted)
	var tw: Tween = create_tween().set_loops()
	tw.tween_property(crystal_glow, "modulate:a", 0.55, 0.9)
	tw.tween_property(crystal_glow, "modulate:a", 1.0, 0.9)


func _on_interacted(_by: Node) -> void:
	GameStateStore.ref.refill_flask()
	GameStateStore.ref.unlock_shrine(GameStateStore.ref.current_map)
	SaveService.ref.save_slot(1)
	AudioService.ref.play_sfx_id(&"heal")
	EventsBus.ref.notification_requested.emit(tr("msg_shrine_rest"))
	if dialogue != null:
		EventsBus.ref.dialogue_requested.emit(dialogue)
