class_name MainRoot
extends Node

@onready var world_root: Node2D = $WorldRoot
@onready var fade_rect: ColorRect = $FadeLayer/FadeRect


func _ready() -> void:
	TranslationServer.set_locale("id")
	SceneService.ref.setup(world_root, fade_rect)
	call_deferred(&"_boot_first_map")


func _boot_first_map() -> void:
	if ResourceLoader.exists(GameStateStore.DEFAULT_MAP):
		SceneService.ref.change_map(GameStateStore.DEFAULT_MAP, GameStateStore.DEFAULT_SPAWN, false)
