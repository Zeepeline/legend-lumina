extends SceneTree
## Rapal jurus ke kanan, bawah, atas; foto tiap 3 frame → /tmp/gt/c_*.png
var frame: int = 0
var n: int = 0
var dirs: Array[Vector2] = [Vector2.RIGHT, Vector2.DOWN, Vector2.UP, Vector2.LEFT]

func _initialize() -> void:
	root.add_child((load("res://main.tscn") as PackedScene).instantiate())

func _process(_d: float) -> bool:
	frame += 1
	if frame < 90: return false
	var pl: Player = SceneService.ref.get_current_player() as Player
	if pl == null: return false
	if GameStateStore.ref.skin_id != &"mc2":
		GameStateStore.ref.skin_id = &"mc2"
		pl.sprite.sprite_frames = HeroSprites.get_frames(&"mc2")
	var k: int = (frame - 90) / 40
	if k >= dirs.size(): return true
	var t: int = (frame - 90) % 40
	if t == 0:
		pl.global_position = Vector2(4024 + 700, 2680 + 300)
		pl.facing = dirs[k]; GameStateStore.ref.mp = 999; pl.fireball_cooldown = 0.0
		pl.try_cast_skill()
	if t % 4 == 0 and t < 32:
		root.get_viewport().get_texture().get_image().save_png("/tmp/gt/c_%d_%02d.png" % [k, t / 4])
	return false
