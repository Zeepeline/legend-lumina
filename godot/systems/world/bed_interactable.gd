class_name BedInteractable
extends Interactable


func _ready() -> void:
	super._ready()
	prompt_key = "prompt_bed"
	interacted.connect(_on_interacted)


func _on_interacted(_by: Node) -> void:
	GameStateStore.ref.advance_to_morning()
	SaveService.ref.save_slot(1)
	AudioService.ref.play_sfx_id(&"heal")
	EventsBus.ref.notification_requested.emit(tr("msg_slept"))
